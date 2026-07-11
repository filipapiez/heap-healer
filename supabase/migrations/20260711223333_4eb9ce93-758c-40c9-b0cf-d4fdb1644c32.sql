CREATE TABLE public.youtube_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connected_account_id UUID NOT NULL UNIQUE REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
  google_user_id TEXT,
  channel_id TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  scope TEXT,
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX youtube_oauth_tokens_account_idx ON public.youtube_oauth_tokens(connected_account_id);

-- Service-role only: no GRANTs to anon/authenticated. Tokens must never reach the browser.
GRANT ALL ON public.youtube_oauth_tokens TO service_role;

ALTER TABLE public.youtube_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated → all client-side access is blocked.
-- The server accesses this table exclusively via supabaseAdmin (service role bypasses RLS).

CREATE TRIGGER youtube_oauth_tokens_set_updated_at
  BEFORE UPDATE ON public.youtube_oauth_tokens
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Table to hold short-lived OAuth state so we can validate the callback safely.
CREATE TABLE public.oauth_states (
  state TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_origin TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes')
);

CREATE INDEX oauth_states_expires_idx ON public.oauth_states(expires_at);

GRANT ALL ON public.oauth_states TO service_role;

ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;
-- Server-only. No policies for other roles.