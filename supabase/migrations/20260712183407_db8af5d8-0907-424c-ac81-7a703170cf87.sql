-- Meta OAuth tokens (Facebook Pages, Instagram Business, Threads).
-- One row per connected_accounts row. Threads has its own user_id/access_token
-- because auth flows are separate even though credentials share META_APP_ID.
CREATE TABLE public.meta_oauth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connected_account_id UUID NOT NULL REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('facebook_page','instagram','threads')),
  meta_user_id TEXT,          -- FB user id or Threads user id
  page_id TEXT,               -- FB Page id (also parent for IG)
  ig_business_id TEXT,        -- Instagram Business Account id
  access_token TEXT NOT NULL, -- long-lived page token / threads token
  refresh_token TEXT,         -- Threads uses refresh; FB long-lived pages do not
  scope TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,     -- null = does not expire (FB page tokens)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (connected_account_id)
);

GRANT ALL ON public.meta_oauth_tokens TO service_role;
-- No grants to anon/authenticated: tokens are backend-only.

ALTER TABLE public.meta_oauth_tokens ENABLE ROW LEVEL SECURITY;
-- Deliberately no policies — service_role bypasses RLS; other roles have no grants.

CREATE TRIGGER meta_oauth_tokens_updated_at
  BEFORE UPDATE ON public.meta_oauth_tokens
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Security hardening: lock down SECURITY DEFINER helpers so only signed-in
-- users (or service_role) can execute them. These functions are required for
-- our RLS policies to avoid recursion — do NOT change them to SECURITY INVOKER.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.workspace_role_of(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.workspace_role_of(uuid, uuid) TO authenticated, service_role;