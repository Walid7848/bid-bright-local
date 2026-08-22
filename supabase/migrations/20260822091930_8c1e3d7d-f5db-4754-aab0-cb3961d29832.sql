DROP POLICY "Professionals can insert bids" ON public.bids;

CREATE POLICY "Professionals can insert bids"
ON public.bids
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = professional_id
  AND public.has_role(auth.uid(), 'professional'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.requests r
    WHERE r.id = bids.request_id
      AND r.status = 'open'::request_status
      AND r.client_id <> auth.uid()
  )
  AND public.can_place_bid(auth.uid())
);