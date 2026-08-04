-- 1) Storage: govern updates to request-images by folder ownership
DROP POLICY IF EXISTS "Users can update their own request images" ON storage.objects;
CREATE POLICY "Users can update their own request images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'request-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'request-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2) Subscriptions: users must not be able to self-provision a subscription row.
-- Rows are created exclusively by the SECURITY DEFINER trigger handle_new_professional().
DROP POLICY IF EXISTS "Users insert their own subscription" ON public.subscriptions;
REVOKE INSERT ON public.subscriptions FROM authenticated;