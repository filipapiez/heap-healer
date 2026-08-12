ALTER TABLE public.website_connections
  ADD COLUMN IF NOT EXISTS framework text,
  ADD COLUMN IF NOT EXISTS publish_path text,
  ADD COLUMN IF NOT EXISTS content_format text,
  ADD COLUMN IF NOT EXISTS router_type text,
  ADD COLUMN IF NOT EXISTS sitemap_path text,
  ADD COLUMN IF NOT EXISTS daily_generation_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_publish boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.generated_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES public.website_connections(id) ON DELETE SET NULL,
  publish_job_id uuid REFERENCES public.website_publish_jobs(id) ON DELETE SET NULL,
  slug text NOT NULL,
  canonical_url text NOT NULL,
  primary_keyword text NOT NULL,
  secondary_keywords text[] NOT NULL DEFAULT '{}',
  topic text,
  search_intent text,
  page_type text,
  seo_title text,
  meta_description text,
  h1 text,
  content_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_score integer,
  quality_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_hash text,
  semantic_topic_hash text,
  status text NOT NULL DEFAULT 'generating',
  failure_stage text,
  error_message text,
  github_commit_sha text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  last_meaningful_update_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS generated_pages_workspace_slug_idx
  ON public.generated_pages (workspace_id, slug);
CREATE INDEX IF NOT EXISTS generated_pages_workspace_generated_idx
  ON public.generated_pages (workspace_id, generated_at DESC);

GRANT SELECT ON public.generated_pages TO authenticated;
GRANT ALL ON public.generated_pages TO service_role;
ALTER TABLE public.generated_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members read generated pages" ON public.generated_pages;
CREATE POLICY "Workspace members read generated pages"
  ON public.generated_pages FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

ALTER TABLE public.website_publish_jobs
  ADD COLUMN IF NOT EXISTS generated_page_id uuid REFERENCES public.generated_pages(id) ON DELETE SET NULL;