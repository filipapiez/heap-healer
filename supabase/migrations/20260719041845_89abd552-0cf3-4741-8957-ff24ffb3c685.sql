ALTER TABLE public.seo_audit_runs
  ADD COLUMN IF NOT EXISTS checks_passed integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS checks_failed integer NOT NULL DEFAULT 0;

ALTER TABLE public.seo_audit_runs
  ALTER COLUMN score TYPE numeric(3,1) USING score::numeric;

NOTIFY pgrst, 'reload schema';