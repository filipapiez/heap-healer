-- Repair progressive SEO/growth-report tables that are missing in this backend.

CREATE TABLE IF NOT EXISTS public.seo_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.seo_clients(id) ON DELETE CASCADE,
  published_at timestamptz NOT NULL DEFAULT now(),
  url text NOT NULL,
  keyword text,
  indexed boolean NOT NULL DEFAULT false,
  impressions int NOT NULL DEFAULT 0,
  clicks int NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_pages TO authenticated;
GRANT ALL ON public.seo_pages TO service_role;
ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Workspace members manage SEO pages" ON public.seo_pages;
CREATE POLICY "Workspace members manage SEO pages"
ON public.seo_pages FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.seo_clients c
  JOIN public.workspace_members m ON m.workspace_id = c.workspace_id
  WHERE c.id = seo_pages.client_id AND m.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_clients c
  JOIN public.workspace_members m ON m.workspace_id = c.workspace_id
  WHERE c.id = seo_pages.client_id AND m.user_id = auth.uid()
));

CREATE TABLE IF NOT EXISTS public.seo_backlinks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.seo_clients(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  source_domain text NOT NULL,
  authority int,
  anchor text,
  target_url text,
  status text NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'pending', 'lost'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_backlinks TO authenticated;
GRANT ALL ON public.seo_backlinks TO service_role;
ALTER TABLE public.seo_backlinks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Workspace members manage SEO backlinks" ON public.seo_backlinks;
CREATE POLICY "Workspace members manage SEO backlinks"
ON public.seo_backlinks FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.seo_clients c
  JOIN public.workspace_members m ON m.workspace_id = c.workspace_id
  WHERE c.id = seo_backlinks.client_id AND m.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_clients c
  JOIN public.workspace_members m ON m.workspace_id = c.workspace_id
  WHERE c.id = seo_backlinks.client_id AND m.user_id = auth.uid()
));

CREATE TABLE IF NOT EXISTS public.seo_geo_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.seo_clients(id) ON DELETE CASCADE,
  checked_at timestamptz NOT NULL DEFAULT now(),
  engine text NOT NULL,
  query text NOT NULL,
  mentioned boolean NOT NULL DEFAULT false,
  cited_url text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_geo_checks TO authenticated;
GRANT ALL ON public.seo_geo_checks TO service_role;
ALTER TABLE public.seo_geo_checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Workspace members manage SEO GEO checks" ON public.seo_geo_checks;
CREATE POLICY "Workspace members manage SEO GEO checks"
ON public.seo_geo_checks FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.seo_clients c
  JOIN public.workspace_members m ON m.workspace_id = c.workspace_id
  WHERE c.id = seo_geo_checks.client_id AND m.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.seo_clients c
  JOIN public.workspace_members m ON m.workspace_id = c.workspace_id
  WHERE c.id = seo_geo_checks.client_id AND m.user_id = auth.uid()
));

CREATE TABLE IF NOT EXISTS public.seo_audit_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  website text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  score int,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seo_audit_runs TO authenticated;
GRANT ALL ON public.seo_audit_runs TO service_role;
ALTER TABLE public.seo_audit_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit runs members read" ON public.seo_audit_runs;
CREATE POLICY "audit runs members read"
ON public.seo_audit_runs FOR SELECT TO authenticated
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE INDEX IF NOT EXISTS seo_pages_client_published_idx ON public.seo_pages(client_id, published_at DESC);
CREATE INDEX IF NOT EXISTS seo_backlinks_client_created_idx ON public.seo_backlinks(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS seo_geo_checks_client_checked_idx ON public.seo_geo_checks(client_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS seo_audit_runs_workspace_created_idx ON public.seo_audit_runs(workspace_id, created_at DESC);

GRANT SELECT ON public.directories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.directories TO authenticated;
GRANT ALL ON public.directories TO service_role;
ALTER TABLE public.directories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "directories readable by authenticated" ON public.directories;
DROP POLICY IF EXISTS "directories writable by authenticated" ON public.directories;
CREATE POLICY "directories readable by authenticated" ON public.directories FOR SELECT TO authenticated USING (true);
CREATE POLICY "directories writable by authenticated" ON public.directories FOR ALL TO authenticated USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';