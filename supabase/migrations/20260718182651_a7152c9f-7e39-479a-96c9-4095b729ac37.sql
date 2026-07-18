
CREATE POLICY "brand-assets: workspace members can write own path"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'brand-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND public.is_workspace_member(((storage.foldername(name))[2])::uuid, auth.uid())
);

CREATE POLICY "brand-assets: workspace members can update own path"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'brand-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND public.is_workspace_member(((storage.foldername(name))[2])::uuid, auth.uid())
)
WITH CHECK (
  bucket_id = 'brand-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND public.is_workspace_member(((storage.foldername(name))[2])::uuid, auth.uid())
);

CREATE POLICY "brand-assets: workspace members can delete own path"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'brand-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND public.is_workspace_member(((storage.foldername(name))[2])::uuid, auth.uid())
);

CREATE POLICY "brand-assets: anyone can read"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'brand-assets');
