-- requests: owner + client role, and prevent ownership transfer
DROP POLICY IF EXISTS "Clients can update their own requests" ON public.requests;
CREATE POLICY "Clients can update their own requests"
ON public.requests FOR UPDATE TO authenticated
USING (auth.uid() = client_id AND public.has_role(auth.uid(), 'client'::app_role))
WITH CHECK (auth.uid() = client_id AND public.has_role(auth.uid(), 'client'::app_role));

DROP POLICY IF EXISTS "Clients can delete their own requests" ON public.requests;
CREATE POLICY "Clients can delete their own requests"
ON public.requests FOR DELETE TO authenticated
USING (auth.uid() = client_id AND public.has_role(auth.uid(), 'client'::app_role));

-- bids: client-side decisions require the client role
DROP POLICY IF EXISTS "Client can update bids on own requests" ON public.bids;
CREATE POLICY "Client can update bids on own requests"
ON public.bids FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'client'::app_role)
  AND EXISTS (SELECT 1 FROM public.requests r WHERE r.id = bids.request_id AND r.client_id = auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'client'::app_role)
  AND EXISTS (SELECT 1 FROM public.requests r WHERE r.id = bids.request_id AND r.client_id = auth.uid())
);

-- bids: professional-side changes require the professional role
DROP POLICY IF EXISTS "Professionals can update their own pending bids" ON public.bids;
CREATE POLICY "Professionals can update their own pending bids"
ON public.bids FOR UPDATE TO authenticated
USING (auth.uid() = professional_id AND status = 'pending'::bid_status AND public.has_role(auth.uid(), 'professional'::app_role))
WITH CHECK (auth.uid() = professional_id AND status = 'pending'::bid_status AND public.has_role(auth.uid(), 'professional'::app_role));

DROP POLICY IF EXISTS "Professionals can delete their own bids" ON public.bids;
CREATE POLICY "Professionals can delete their own bids"
ON public.bids FOR DELETE TO authenticated
USING (auth.uid() = professional_id AND public.has_role(auth.uid(), 'professional'::app_role));

-- reviews: only client-role users may write reviews
DROP POLICY IF EXISTS "Clients can create reviews for their awarded requests" ON public.reviews;
CREATE POLICY "Clients can create reviews for their awarded requests"
ON public.reviews FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = client_id
  AND public.has_role(auth.uid(), 'client'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.requests r
    WHERE r.id = reviews.request_id AND r.client_id = auth.uid()
      AND r.status::text = ANY (ARRAY['awarded','in_progress','completed'])
  )
  AND EXISTS (
    SELECT 1 FROM public.bids b
    WHERE b.request_id = reviews.request_id AND b.professional_id = reviews.professional_id
      AND b.status = 'accepted'::bid_status
  )
);

DROP POLICY IF EXISTS "Clients can update their own reviews" ON public.reviews;
CREATE POLICY "Clients can update their own reviews"
ON public.reviews FOR UPDATE TO authenticated
USING (auth.uid() = client_id AND public.has_role(auth.uid(), 'client'::app_role))
WITH CHECK (auth.uid() = client_id AND public.has_role(auth.uid(), 'client'::app_role));

DROP POLICY IF EXISTS "Clients can delete their own reviews" ON public.reviews;
CREATE POLICY "Clients can delete their own reviews"
ON public.reviews FOR DELETE TO authenticated
USING (auth.uid() = client_id AND public.has_role(auth.uid(), 'client'::app_role));