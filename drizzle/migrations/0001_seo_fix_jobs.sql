CREATE TABLE public.seo_fix_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES public.website_connections(id) ON DELETE SET NULL,
  issue text NOT NULL,
  category text NOT NULL,
  fix_type text NOT NULL,
  estimate_minutes integer NOT NULL DEFAULT 25,
  status text NOT NULL DEFAULT 'queued',
  commit_sha text,
  files_changed text[] NOT NULL DEFAULT '{}',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  saved_at timestamptz
);
CREATE INDEX seo_fix_jobs_ws_idx ON public.seo_fix_jobs(workspace_id, created_at DESC);
GRANT SELECT ON public.seo_fix_jobs TO authenticated;
GRANT ALL ON public.seo_fix_jobs TO service_role;
ALTER TABLE public.seo_fix_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read fix jobs" ON public.seo_fix_jobs FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE TRIGGER seo_fix_jobs_updated BEFORE UPDATE ON public.seo_fix_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();