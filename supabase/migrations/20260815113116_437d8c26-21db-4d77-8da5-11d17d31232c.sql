GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_place_bid(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bids_this_month(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.accept_bid(_request_id uuid, _bid_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _req public.requests%ROWTYPE;
  _bid public.bids%ROWTYPE;
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
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.accept_bid(uuid, uuid) FROM anon;