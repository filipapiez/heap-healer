CREATE TABLE public.linkedin_oauth_tokens (
  connected_account_id uuid PRIMARY KEY REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
  linkedin_member_id text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  scope text,
  token_type text NOT NULL DEFAULT 'Bearer',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.linkedin_oauth_tokens TO service_role;

ALTER TABLE public.linkedin_oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER linkedin_oauth_tokens_set_updated_at
BEFORE UPDATE ON public.linkedin_oauth_tokens
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();