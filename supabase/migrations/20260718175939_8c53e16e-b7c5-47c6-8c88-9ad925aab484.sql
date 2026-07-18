
-- Directory catalog (global, read-only for authenticated users; seeded from code)
CREATE TABLE public.directories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  homepage_url TEXT NOT NULL,
  submit_url TEXT NOT NULL,
  category TEXT NOT NULL,
  tier SMALLINT NOT NULL DEFAULT 3, -- 1=top, 2=mid, 3=long-tail
  submission_method TEXT NOT NULL DEFAULT 'manual', -- api | form | email | manual
  auto_submit_config JSONB,
  domain_authority SMALLINT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.directories TO authenticated;
GRANT ALL ON public.directories TO service_role;
ALTER TABLE public.directories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "directories readable by authenticated" ON public.directories FOR SELECT TO authenticated USING (true);

-- Per-workspace submission profile (shared brand info for all submissions)
CREATE TABLE public.workspace_directory_profile (
  workspace_id UUID NOT NULL PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  product_name TEXT,
  tagline TEXT,
  short_description TEXT,
  long_description TEXT,
  website_url TEXT,
  logo_url TEXT,
  category TEXT,
  contact_email TEXT,
  pricing_model TEXT,
  launch_date DATE,
  twitter_handle TEXT,
  founder_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_directory_profile TO authenticated;
GRANT ALL ON public.workspace_directory_profile TO service_role;
ALTER TABLE public.workspace_directory_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile members read" ON public.workspace_directory_profile FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "profile members write" ON public.workspace_directory_profile FOR ALL TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE TRIGGER trg_wdp_updated BEFORE UPDATE ON public.workspace_directory_profile
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Per-workspace submission rows (one per directory)
CREATE TABLE public.directory_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  directory_id UUID NOT NULL REFERENCES public.directories(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued', -- queued | auto_submitted | pending_action | submitted | live | rejected | skipped
  scheduled_for DATE NOT NULL DEFAULT CURRENT_DATE,
  submitted_at TIMESTAMPTZ,
  live_url TEXT,
  auto_result JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, directory_id)
);
CREATE INDEX idx_dir_sub_ws_status ON public.directory_submissions(workspace_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.directory_submissions TO authenticated;
GRANT ALL ON public.directory_submissions TO service_role;
ALTER TABLE public.directory_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sub members read" ON public.directory_submissions FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "sub members write" ON public.directory_submissions FOR ALL TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE TRIGGER trg_dir_sub_updated BEFORE UPDATE ON public.directory_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Weekly cron log
CREATE TABLE public.directory_queue_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  workspaces_processed INT NOT NULL DEFAULT 0,
  submissions_queued INT NOT NULL DEFAULT 0,
  submissions_auto INT NOT NULL DEFAULT 0,
  errors JSONB
);
GRANT SELECT ON public.directory_queue_runs TO authenticated;
GRANT ALL ON public.directory_queue_runs TO service_role;
ALTER TABLE public.directory_queue_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "queue runs readable by authenticated" ON public.directory_queue_runs FOR SELECT TO authenticated USING (true);
