
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'completed';

CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  professional_id UUID NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, client_id)
);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly viewable"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Clients can create reviews for their awarded requests"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id
    AND EXISTS (
      SELECT 1 FROM public.requests r
      WHERE r.id = request_id
        AND r.client_id = auth.uid()
        AND r.status::text IN ('awarded', 'in_progress', 'completed')
    )
    AND EXISTS (
      SELECT 1 FROM public.bids b
      WHERE b.request_id = reviews.request_id
        AND b.professional_id = reviews.professional_id
        AND b.status = 'accepted'
    )
  );

CREATE POLICY "Clients can update their own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can delete their own reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = client_id);

CREATE INDEX idx_reviews_professional ON public.reviews(professional_id);
CREATE INDEX idx_reviews_request ON public.reviews(request_id);

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_client_profile_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT reviews_professional_profile_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
