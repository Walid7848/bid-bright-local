-- Replace public read access on request-images with authenticated-only access.
-- The app renders images exclusively via SignedImage (signed URLs) on authenticated routes,
-- so anonymous public SELECT is unnecessary exposure.
DROP POLICY IF EXISTS "Anyone can view request images" ON storage.objects;

CREATE POLICY "Authenticated users can view request images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'request-images');