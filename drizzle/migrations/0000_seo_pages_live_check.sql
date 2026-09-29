ALTER TABLE public.seo_pages
  ADD COLUMN IF NOT EXISTS live_status text NOT NULL DEFAULT 'checking',
  ADD COLUMN IF NOT EXISTS live_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS live_check_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS live_reason text,
  ADD COLUMN IF NOT EXISTS live_host text,
  ADD COLUMN IF NOT EXISTS title text;