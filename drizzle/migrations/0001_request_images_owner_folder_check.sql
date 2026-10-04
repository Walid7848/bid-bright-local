DROP POLICY IF EXISTS "Users view own or request-attached images" ON storage.objects;
CREATE POLICY "Users view own or request-attached images" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'request-images' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.requests r
      WHERE objects.name = ANY (r.images)
        AND (storage.foldername(objects.name))[1] = r.client_id::text
    )
  )
);