-- 1. Guard trigger: block direct changes to state-machine columns on requests
CREATE OR REPLACE FUNCTION public.tg_requests_guard_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF coalesce(current_setting('wasla.state_machine', true), '') = 'on' THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Request status can only be changed through an allowed transition';
  END IF;
  IF NEW.awarded_bid_id IS DISTINCT FROM OLD.awarded_bid_id THEN
    RAISE EXCEPTION 'Awarded bid cannot be changed directly';
  END IF;
  IF NEW.client_id IS DISTINCT FROM OLD.client_id THEN
    RAISE EXCEPTION 'Request owner cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS requests_guard_update ON public.requests;
CREATE TRIGGER requests_guard_update
BEFORE UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.tg_requests_guard_update();

-- 2. Tighten RLS on requests: edits only while open, deletes only while open
DROP POLICY IF EXISTS "Clients can update their own requests" ON public.requests;
CREATE POLICY "Clients can edit their own open requests"
ON public.requests FOR UPDATE TO authenticated
USING (auth.uid() = client_id AND has_role(auth.uid(), 'client') AND status = 'open')
WITH CHECK (auth.uid() = client_id AND has_role(auth.uid(), 'client') AND status = 'open');

DROP POLICY IF EXISTS "Clients can delete their own requests" ON public.requests;
CREATE POLICY "Clients can delete their own open requests"
ON public.requests FOR DELETE TO authenticated
USING (auth.uid() = client_id AND has_role(auth.uid(), 'client') AND status = 'open');

-- 3. start_request
CREATE OR REPLACE FUNCTION public.start_request(_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
END;
$$;

-- 4. complete_request
CREATE OR REPLACE FUNCTION public.complete_request(_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
END;
$$;

-- 5. close_request (client cancels before awarding)
CREATE OR REPLACE FUNCTION public.close_request(_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _req public.requests%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _req FROM public.requests WHERE id = _request_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;
  IF _req.client_id <> _uid THEN
    RAISE EXCEPTION 'You do not own this request';
  END IF;
  IF _req.status <> 'open' THEN
    RAISE EXCEPTION 'Only open requests can be closed';
  END IF;

  UPDATE public.bids SET status = 'rejected'
   WHERE request_id = _request_id AND status = 'pending';

  PERFORM set_config('wasla.state_machine', 'on', true);
  UPDATE public.requests SET status = 'closed' WHERE id = _request_id;
  PERFORM set_config('wasla.state_machine', 'off', true);
END;
$$;

REVOKE ALL ON FUNCTION public.start_request(uuid) FROM public;
REVOKE ALL ON FUNCTION public.complete_request(uuid) FROM public;
REVOKE ALL ON FUNCTION public.close_request(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.start_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_request(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.close_request(uuid) TO authenticated;

-- 6. Reviews: only after completion, one per (request, client)
DROP POLICY IF EXISTS "Clients can create reviews for their awarded requests" ON public.reviews;
CREATE POLICY "Clients can review completed requests"
ON public.reviews FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = client_id
  AND has_role(auth.uid(), 'client')
  AND EXISTS (
    SELECT 1 FROM public.requests r
    WHERE r.id = reviews.request_id
      AND r.client_id = auth.uid()
      AND r.status = 'completed'
  )
  AND EXISTS (
    SELECT 1 FROM public.bids b
    JOIN public.requests r2 ON r2.id = b.request_id
    WHERE b.request_id = reviews.request_id
      AND b.professional_id = reviews.professional_id
      AND b.status = 'accepted'
      AND r2.awarded_bid_id = b.id
  )
);

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_request_client_unique UNIQUE (request_id, client_id);