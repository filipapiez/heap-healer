
CREATE TYPE public.social_platform AS ENUM (
  'youtube','x','instagram','facebook','pinterest','linkedin','tiktok','threads','bluesky','reddit','google_business'
);

CREATE TYPE public.account_status AS ENUM ('connected','disconnected','error','pending');

CREATE TABLE public.connected_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform public.social_platform NOT NULL,
  handle TEXT,
  display_name TEXT,
  avatar_url TEXT,
  external_id TEXT,
  zernio_account_id TEXT,
  status public.account_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  connected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, platform, external_id)
);

CREATE INDEX connected_accounts_workspace_idx ON public.connected_accounts(workspace_id);
CREATE INDEX connected_accounts_zernio_idx ON public.connected_accounts(zernio_account_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.connected_accounts TO authenticated;
GRANT ALL ON public.connected_accounts TO service_role;

ALTER TABLE public.connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read accounts"
  ON public.connected_accounts FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "admins insert accounts"
  ON public.connected_accounts FOR INSERT TO authenticated
  WITH CHECK (public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin'));

CREATE POLICY "admins update accounts"
  ON public.connected_accounts FOR UPDATE TO authenticated
  USING (public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin'))
  WITH CHECK (public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin'));

CREATE POLICY "admins delete accounts"
  ON public.connected_accounts FOR DELETE TO authenticated
  USING (public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin'));

CREATE TRIGGER connected_accounts_set_updated_at
  BEFORE UPDATE ON public.connected_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
