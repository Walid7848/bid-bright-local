REVOKE INSERT, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.notifications FROM authenticated;

DROP POLICY IF EXISTS "Authenticated users can view request images" ON storage.objects;

CREATE POLICY "Users view own or request-attached images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'request-images'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.requests r
      WHERE storage.objects.name = ANY (r.images)
    )
  )
);