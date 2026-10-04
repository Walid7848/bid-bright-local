CREATE OR REPLACE FUNCTION public.has_bid_on_request(_request_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.bids WHERE request_id = _request_id AND professional_id = auth.uid()
  )
$$;
REVOKE EXECUTE ON FUNCTION public.has_bid_on_request(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_bid_on_request(uuid) TO authenticated;

DROP POLICY IF EXISTS "Anyone can view requests" ON public.requests;

CREATE POLICY "Owners view their own requests" ON public.requests
FOR SELECT TO authenticated USING (auth.uid() = client_id);

CREATE POLICY "Professionals view available requests" ON public.requests
FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(), 'professional'::app_role)
  AND (status = 'open'::request_status OR public.has_bid_on_request(id))
);

REVOKE SELECT ON public.requests FROM anon;