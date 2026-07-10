
-- Enums
CREATE TYPE public.media_kind AS ENUM ('image','video');
CREATE TYPE public.post_status AS ENUM ('draft','scheduled','publishing','published','partial','failed','cancelled');
CREATE TYPE public.target_status AS ENUM ('pending','publishing','published','failed','cancelled');

-- media_assets
CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  kind public.media_kind NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  width INT,
  height INT,
  duration_seconds NUMERIC,
  original_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_assets member read" ON public.media_assets FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "media_assets member insert" ON public.media_assets FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "media_assets member update" ON public.media_assets FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "media_assets member delete" ON public.media_assets FOR DELETE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE TRIGGER media_assets_set_updated_at BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX media_assets_workspace_idx ON public.media_assets(workspace_id, created_at DESC);

-- posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  caption TEXT NOT NULL DEFAULT '',
  media_asset_ids UUID[] NOT NULL DEFAULT '{}',
  per_platform_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  status public.post_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  zernio_post_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts member read" ON public.posts FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "posts member insert" ON public.posts FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "posts member update" ON public.posts FOR UPDATE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "posts member delete" ON public.posts FOR DELETE TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE TRIGGER posts_set_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX posts_workspace_idx ON public.posts(workspace_id, created_at DESC);
CREATE INDEX posts_scheduled_idx ON public.posts(scheduled_at) WHERE status = 'scheduled';

-- post_targets
CREATE TABLE public.post_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  connected_account_id UUID NOT NULL REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
  platform public.social_platform NOT NULL,
  status public.target_status NOT NULL DEFAULT 'pending',
  external_post_id TEXT,
  external_url TEXT,
  error_message TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, connected_account_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_targets TO authenticated;
GRANT ALL ON public.post_targets TO service_role;
ALTER TABLE public.post_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_targets member read" ON public.post_targets FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.is_workspace_member(p.workspace_id, auth.uid())));
CREATE POLICY "post_targets member write" ON public.post_targets FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.is_workspace_member(p.workspace_id, auth.uid())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND public.is_workspace_member(p.workspace_id, auth.uid())));
CREATE TRIGGER post_targets_set_updated_at BEFORE UPDATE ON public.post_targets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX post_targets_post_idx ON public.post_targets(post_id);

-- publish_attempts
CREATE TABLE public.publish_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_target_id UUID NOT NULL REFERENCES public.post_targets(id) ON DELETE CASCADE,
  status public.target_status NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.publish_attempts TO authenticated;
GRANT ALL ON public.publish_attempts TO service_role;
ALTER TABLE public.publish_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "publish_attempts member read" ON public.publish_attempts FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.post_targets t
    JOIN public.posts p ON p.id = t.post_id
    WHERE t.id = post_target_id AND public.is_workspace_member(p.workspace_id, auth.uid())
  ));

-- Storage policies (media bucket)
CREATE POLICY "media bucket member read" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'media'
    AND public.is_workspace_member((split_part(name, '/', 1))::uuid, auth.uid())
  );
CREATE POLICY "media bucket member insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND public.is_workspace_member((split_part(name, '/', 1))::uuid, auth.uid())
  );
CREATE POLICY "media bucket member delete" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'media'
    AND public.is_workspace_member((split_part(name, '/', 1))::uuid, auth.uid())
  );
