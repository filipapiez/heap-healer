
CREATE TABLE public.tiktok_oauth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connected_account_id uuid NOT NULL REFERENCES public.connected_accounts(id) ON DELETE CASCADE,
  open_id text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  scope text,
  token_type text DEFAULT 'Bearer',
  expires_at timestamptz NOT NULL,
  refresh_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (connected_account_id)
);

GRANT ALL ON public.tiktok_oauth_tokens TO service_role;
ALTER TABLE public.tiktok_oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_tiktok_oauth_tokens_updated_at
  BEFORE UPDATE ON public.tiktok_oauth_tokens
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
