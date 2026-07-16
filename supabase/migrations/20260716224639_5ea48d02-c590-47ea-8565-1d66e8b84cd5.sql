
CREATE TABLE IF NOT EXISTS public.seo_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  website text NOT NULL,
  baseline_date date NOT NULL DEFAULT CURRENT_DATE,
  baseline_clicks int NOT NULL DEFAULT 0,
  baseline_impressions int NOT NULL DEFAULT 0,
  baseline_indexed int NOT NULL DEFAULT 0,
  report_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex')
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_clients TO authenticated;
GRANT ALL ON public.seo_clients TO service_role;
ALTER TABLE public.seo_clients ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='seo_clients' AND policyname='Authenticated manage SEO clients') THEN
    CREATE POLICY "Authenticated manage SEO clients" ON public.seo_clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE public.seo_semrush_snapshots
  ADD COLUMN IF NOT EXISTS synced_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS sync_status text NOT NULL DEFAULT 'success' CHECK (sync_status IN ('success','failed')),
  ADD COLUMN IF NOT EXISTS sync_error text;

DROP POLICY IF EXISTS "Authenticated can read semrush snapshots" ON public.seo_semrush_snapshots;
CREATE POLICY "Members can read semrush snapshots"
  ON public.seo_semrush_snapshots FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.seo_clients c WHERE c.id = client_id));
