-- 1. Prevent more than one accepted bid per request
CREATE UNIQUE INDEX IF NOT EXISTS bids_one_accepted_per_request
  ON public.bids (request_id) WHERE status = 'accepted';

CREATE INDEX IF NOT EXISTS bids_request_id_idx ON public.bids (request_id);

-- 2. FK for requests.awarded_bid_id (deferrable so deleting a request + its bids works)
ALTER TABLE public.requests
  ADD CONSTRAINT requests_awarded_bid_id_fkey
  FOREIGN KEY (awarded_bid_id) REFERENCES public.bids(id)
  ON DELETE NO ACTION DEFERRABLE INITIALLY DEFERRED;

-- 3. Block deleting an accepted bid
CREATE OR REPLACE FUNCTION public.tg_prevent_accepted_bid_delete()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'accepted'
     AND EXISTS (SELECT 1 FROM public.requests r WHERE r.id = OLD.request_id) THEN
    RAISE EXCEPTION 'Cannot delete an accepted bid';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS prevent_accepted_bid_delete ON public.bids;
CREATE TRIGGER prevent_accepted_bid_delete
  BEFORE DELETE ON public.bids
  FOR EACH ROW EXECUTE FUNCTION public.tg_prevent_accepted_bid_delete();

-- 4. Clients may no longer update professionals' bids directly
DROP POLICY IF EXISTS "Client can update bids on own requests" ON public.bids;

-- 5. Atomic accept_bid RPC
CREATE OR REPLACE FUNCTION public.accept_bid(_request_id uuid, _bid_id uuid)
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

  IF NOT public.has_role(_uid, 'client') THEN
    RAISE EXCEPTION 'Only clients can accept bids';
  END IF;

  -- lock the request row: serializes concurrent accepts
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

  UPDATE public.requests
     SET status = 'awarded', awarded_bid_id = _bid_id
   WHERE id = _request_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_bid(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_bid(uuid, uuid) TO authenticated;