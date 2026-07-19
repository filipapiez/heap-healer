
-- 1) seo_leads (audit wizard)
CREATE TABLE IF NOT EXISTS public.seo_leads (
  id UUID PRIMARY KEY,
  name TEXT,
  website TEXT,
  target_market TEXT,
  language TEXT,
  business_desc TEXT,
  target_audience TEXT[] DEFAULT '{}',
  competitors TEXT[] DEFAULT '{}',
  gsc_connected BOOLEAN DEFAULT false,
  monthly_clicks TEXT,
  indexed_pages TEXT,
  email TEXT,
  current_step INT DEFAULT 1,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.seo_leads TO anon, authenticated;
GRANT ALL ON public.seo_leads TO service_role;
ALTER TABLE public.seo_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "leads insert by id" ON public.seo_leads;
DROP POLICY IF EXISTS "leads update by id" ON public.seo_leads;
DROP POLICY IF EXISTS "leads select by id" ON public.seo_leads;
CREATE POLICY "leads insert by id" ON public.seo_leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "leads update by id" ON public.seo_leads FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "leads select by id" ON public.seo_leads FOR SELECT TO anon, authenticated USING (true);

-- 2) directories: allow authenticated seeding/updates so "Seed the catalog now" works
DROP POLICY IF EXISTS "directories writable by authenticated" ON public.directories;
CREATE POLICY "directories writable by authenticated"
  ON public.directories FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- 3) seo_clients.baseline_captured_at (referenced by growth dashboard fn)
ALTER TABLE public.seo_clients
  ADD COLUMN IF NOT EXISTS baseline_captured_at TIMESTAMPTZ;
