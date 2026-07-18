CREATE TABLE IF NOT EXISTS public.github_app_installations (
  workspace_id uuid PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  installation_id bigint NOT NULL UNIQUE,
  account_login text,
  account_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.github_app_installations TO service_role;
ALTER TABLE public.github_app_installations ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS set_github_app_installations_updated_at ON public.github_app_installations;
CREATE TRIGGER set_github_app_installations_updated_at
  BEFORE UPDATE ON public.github_app_installations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.website_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('wordpress','shopify','github')),
  external_id text NOT NULL,
  display_name text,
  encrypted_credentials text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'connected' CHECK (status IN ('connected','error','disconnected')),
  last_tested_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, platform, external_id)
);
GRANT ALL ON public.website_connections TO service_role;
ALTER TABLE public.website_connections ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS set_website_connections_updated_at ON public.website_connections;
CREATE TRIGGER set_website_connections_updated_at
  BEFORE UPDATE ON public.website_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.website_publish_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES public.website_connections(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  html text NOT NULL,
  excerpt text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  publish_mode text NOT NULL DEFAULT 'draft' CHECK (publish_mode IN ('draft','publish','pull_request')),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','published','failed')),
  external_url text,
  external_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
GRANT ALL ON public.website_publish_jobs TO service_role;
ALTER TABLE public.website_publish_jobs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS website_publish_jobs_queue_idx ON public.website_publish_jobs(status, created_at);