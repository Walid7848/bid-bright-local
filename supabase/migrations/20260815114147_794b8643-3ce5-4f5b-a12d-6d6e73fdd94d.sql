-- 1) Column-level: remove phone from readable columns
REVOKE SELECT ON public.profiles FROM authenticated;
REVOKE SELECT ON public.profiles FROM anon;

GRANT SELECT (id, full_name, city, bio, profession, avatar_url, created_at, updated_at)
  ON public.profiles TO authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 2) Own phone (self only)
CREATE OR REPLACE FUNCTION public.get_my_phone()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.phone FROM public.profiles p
  WHERE auth.uid() IS NOT NULL AND p.id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.get_my_phone() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_phone() TO authenticated;

-- 3) Relationship-based contact disclosure
CREATE OR REPLACE FUNCTION public.get_request_contact(_request_id uuid)
RETURNS TABLE (counterparty_id uuid, full_name text, phone text, party text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _req public.requests%ROWTYPE;
  _bid public.bids%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO _req FROM public.requests WHERE id = _request_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF _req.status NOT IN ('awarded','in_progress','completed') THEN
    RETURN;
  END IF;
  IF _req.awarded_bid_id IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO _bid FROM public.bids WHERE id = _req.awarded_bid_id;
  IF NOT FOUND OR _bid.request_id <> _req.id OR _bid.status <> 'accepted' THEN
    RETURN;
  END IF;

  IF _uid = _req.client_id THEN
    -- client sees the winning professional
    RETURN QUERY
      SELECT p.id, p.full_name, p.phone, 'professional'::text
      FROM public.profiles p WHERE p.id = _bid.professional_id;
  ELSIF _uid = _bid.professional_id THEN
    -- winning professional sees the client
    RETURN QUERY
      SELECT p.id, p.full_name, p.phone, 'client'::text
      FROM public.profiles p WHERE p.id = _req.client_id;
  END IF;

  RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.get_request_contact(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_request_contact(uuid) TO authenticated;