
CREATE TABLE public.syndication_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('devto','hashnode','medium')),
  api_token text NOT NULL,
  handle text,
  publication_id text,
  status text NOT NULL DEFAULT 'connected',
  last_error text,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, platform)
);

GRANT SELECT (id, workspace_id, platform, handle, publication_id, status, last_error, last_used_at, created_at, updated_at)
  ON public.syndication_accounts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.syndication_accounts TO authenticated;
GRANT ALL ON public.syndication_accounts TO service_role;

ALTER TABLE public.syndication_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read syndication accounts" ON public.syndication_accounts
  FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "members insert syndication accounts" ON public.syndication_accounts
  FOR INSERT TO authenticated WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "members update syndication accounts" ON public.syndication_accounts
  FOR UPDATE TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "members delete syndication accounts" ON public.syndication_accounts
  FOR DELETE TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE TRIGGER syndication_accounts_set_updated_at
  BEFORE UPDATE ON public.syndication_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.syndication_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  generated_page_id uuid REFERENCES public.generated_pages(id) ON DELETE SET NULL,
  platform text NOT NULL,
  title text,
  external_url text,
  status text NOT NULL DEFAULT 'pending',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (generated_page_id, platform)
);

GRANT SELECT ON public.syndication_posts TO authenticated;
GRANT ALL ON public.syndication_posts TO service_role;

ALTER TABLE public.syndication_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read syndication posts" ON public.syndication_posts
  FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE INDEX idx_syndication_posts_workspace ON public.syndication_posts(workspace_id, created_at DESC);
