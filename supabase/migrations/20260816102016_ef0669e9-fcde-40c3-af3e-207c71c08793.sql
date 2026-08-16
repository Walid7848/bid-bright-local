-- 1) TABLE
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('bid_received','bid_accepted','bid_rejected','request_started','request_completed','review_reminder')),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  request_id uuid REFERENCES public.requests(id) ON DELETE CASCADE,
  bid_id uuid REFERENCES public.bids(id) ON DELETE CASCADE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) GRANTS
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- 3) RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4) POLICIES
CREATE POLICY "Users read their own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users mark their own notifications read"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- guard: only read_at may change
CREATE OR REPLACE FUNCTION public.tg_notifications_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.type IS DISTINCT FROM OLD.type
     OR NEW.actor_id IS DISTINCT FROM OLD.actor_id
     OR NEW.request_id IS DISTINCT FROM OLD.request_id
     OR NEW.bid_id IS DISTINCT FROM OLD.bid_id
     OR NEW.metadata IS DISTINCT FROM OLD.metadata
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Only read_at can be updated on notifications';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER notifications_guard_update
BEFORE UPDATE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.tg_notifications_guard_update();

-- 5) INDEXES
CREATE INDEX notifications_user_created_idx ON public.notifications (user_id, created_at DESC);
CREATE INDEX notifications_user_unread_idx ON public.notifications (user_id) WHERE read_at IS NULL;
CREATE INDEX notifications_request_idx ON public.notifications (request_id);
CREATE INDEX notifications_bid_idx ON public.notifications (bid_id);

-- one notification per bid per bid-scoped type
CREATE UNIQUE INDEX notifications_unique_bid_event
  ON public.notifications (type, bid_id)
  WHERE bid_id IS NOT NULL AND type IN ('bid_received','bid_accepted','bid_rejected');

-- one notification per request per request-scoped type
CREATE UNIQUE INDEX notifications_unique_request_event
  ON public.notifications (type, request_id)
  WHERE request_id IS NOT NULL AND type IN ('request_started','request_completed','review_reminder');

-- 6) INTERNAL CREATOR (recipient always derived from DB relationships)
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _type text,
  _actor_id uuid,
  _request_id uuid,
  _bid_id uuid,
  _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_id IS NULL THEN
    RETURN;
  END IF;
  -- never notify the actor about their own action
  IF _actor_id IS NOT NULL AND _actor_id = _user_id THEN
    RETURN;
  END IF;
  INSERT INTO public.notifications (user_id, type, actor_id, request_id, bid_id, metadata)
  VALUES (_user_id, _type, _actor_id, _request_id, _bid_id, COALESCE(_metadata, '{}'::jsonb))
  ON CONFLICT DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.create_notification(uuid, text, uuid, uuid, uuid, jsonb) FROM public, anon, authenticated;

-- 7) EVENT 1: bid_received (AFTER INSERT on bids)
CREATE OR REPLACE FUNCTION public.tg_bids_notify_client()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _client_id uuid;
BEGIN
  SELECT r.client_id INTO _client_id FROM public.requests r WHERE r.id = NEW.request_id;
  IF _client_id IS NULL THEN
    RETURN NEW;
  END IF;
  PERFORM public.create_notification(
    _client_id,
    'bid_received',
    NEW.professional_id,
    NEW.request_id,
    NEW.id,
    jsonb_build_object('price', NEW.price, 'duration_days', NEW.duration_days)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER bids_notify_client
AFTER INSERT ON public.bids
FOR EACH ROW EXECUTE FUNCTION public.tg_bids_notify_client();

-- 8) EVENT 2 + 3: accept_bid
CREATE OR REPLACE FUNCTION public.accept_bid(_request_id uuid, _bid_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _req public.requests%ROWTYPE;
  _bid public.bids%ROWTYPE;
  _loser RECORD;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.has_role(_uid, 'client') THEN
    RAISE EXCEPTION 'Only clients can accept bids';
  END IF;

  SELECT * INTO _req FROM public.requests WHERE id = _request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  IF _req.client_id <> _uid THEN
    RAISE EXCEPTION 'You do not own this request';
  END IF;

  IF _req.status <> 'open' THEN
    RAISE EXCEPTION 'Request is not open';
  END IF;

  SELECT * INTO _bid FROM public.bids WHERE id = _bid_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Bid not found';
  END IF;

  IF _bid.request_id <> _request_id THEN
    RAISE EXCEPTION 'Bid does not belong to this request';
  END IF;

  IF _bid.status <> 'pending' THEN
    RAISE EXCEPTION 'Bid is not pending';
  END IF;

  UPDATE public.bids SET status = 'rejected'
   WHERE request_id = _request_id AND id <> _bid_id AND status = 'pending';

  UPDATE public.bids SET status = 'accepted' WHERE id = _bid_id;

  PERFORM set_config('wasla.state_machine', 'on', true);
  UPDATE public.requests
     SET status = 'awarded', awarded_bid_id = _bid_id
   WHERE id = _request_id;
  PERFORM set_config('wasla.state_machine', 'off', true);

  -- notify the winning professional
  PERFORM public.create_notification(
    _bid.professional_id, 'bid_accepted', _uid, _request_id, _bid_id, '{}'::jsonb
  );

  -- notify the professionals whose bids were not selected
  FOR _loser IN
    SELECT id, professional_id FROM public.bids
     WHERE request_id = _request_id AND id <> _bid_id AND status = 'rejected'
  LOOP
    BEGIN
      PERFORM public.create_notification(
        _loser.professional_id, 'bid_rejected', _uid, _request_id, _loser.id, '{}'::jsonb
      );
    EXCEPTION WHEN OTHERS THEN
      NULL; -- never fail the acceptance because of a rejection notification
    END;
  END LOOP;
END;
$function$;

-- 9) EVENT 4: start_request
CREATE OR REPLACE FUNCTION public.start_request(_request_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _req public.requests%ROWTYPE;
  _bid public.bids%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT public.has_role(_uid, 'professional') THEN
    RAISE EXCEPTION 'Only professionals can start work';
  END IF;

  SELECT * INTO _req FROM public.requests WHERE id = _request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;
  IF _req.status <> 'awarded' THEN
    RAISE EXCEPTION 'Request is not awarded';
  END IF;
  IF _req.awarded_bid_id IS NULL THEN
    RAISE EXCEPTION 'Request has no awarded bid';
  END IF;

  SELECT * INTO _bid FROM public.bids WHERE id = _req.awarded_bid_id FOR UPDATE;
  IF NOT FOUND OR _bid.request_id <> _request_id OR _bid.status <> 'accepted' THEN
    RAISE EXCEPTION 'Awarded bid is not valid';
  END IF;
  IF _bid.professional_id <> _uid THEN
    RAISE EXCEPTION 'You are not the awarded professional';
  END IF;

  PERFORM set_config('wasla.state_machine', 'on', true);
  UPDATE public.requests SET status = 'in_progress' WHERE id = _request_id;
  PERFORM set_config('wasla.state_machine', 'off', true);

  PERFORM public.create_notification(
    _req.client_id, 'request_started', _uid, _request_id, _bid.id, '{}'::jsonb
  );
END;
$function$;

-- 10) EVENT 5 + 6: complete_request
CREATE OR REPLACE FUNCTION public.complete_request(_request_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _req public.requests%ROWTYPE;
  _bid public.bids%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF NOT public.has_role(_uid, 'professional') THEN
    RAISE EXCEPTION 'Only professionals can complete work';
  END IF;

  SELECT * INTO _req FROM public.requests WHERE id = _request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;
  IF _req.status <> 'in_progress' THEN
    RAISE EXCEPTION 'Request is not in progress';
  END IF;
  IF _req.awarded_bid_id IS NULL THEN
    RAISE EXCEPTION 'Request has no awarded bid';
  END IF;

  SELECT * INTO _bid FROM public.bids WHERE id = _req.awarded_bid_id FOR UPDATE;
  IF NOT FOUND OR _bid.request_id <> _request_id OR _bid.status <> 'accepted' THEN
    RAISE EXCEPTION 'Awarded bid is not valid';
  END IF;
  IF _bid.professional_id <> _uid THEN
    RAISE EXCEPTION 'You are not the awarded professional';
  END IF;

  PERFORM set_config('wasla.state_machine', 'on', true);
  UPDATE public.requests SET status = 'completed' WHERE id = _request_id;
  PERFORM set_config('wasla.state_machine', 'off', true);

  PERFORM public.create_notification(
    _req.client_id, 'request_completed', _uid, _request_id, _bid.id, '{}'::jsonb
  );

  -- immediate review reminder (no scheduler yet; a delayed reminder needs a cron job later)
  PERFORM public.create_notification(
    _req.client_id, 'review_reminder', _uid, _request_id, _bid.id,
    jsonb_build_object('professional_id', _bid.professional_id)
  );
END;
$function$;