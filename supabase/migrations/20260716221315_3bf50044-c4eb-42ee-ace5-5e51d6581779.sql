
CREATE TABLE public.seo_semrush_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL,
  day date NOT NULL,
  domain text NOT NULL,
  authority_score numeric,
  total_backlinks bigint,
  referring_domains bigint,
  new_backlinks bigint,
  lost_backlinks bigint,
  organic_keywords bigint,
  organic_traffic bigint,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, day)
);
GRANT SELECT ON public.seo_semrush_snapshots TO authenticated;
GRANT ALL ON public.seo_semrush_snapshots TO service_role;
ALTER TABLE public.seo_semrush_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read semrush snapshots"
  ON public.seo_semrush_snapshots FOR SELECT
  TO authenticated USING (true);
CREATE INDEX seo_semrush_snapshots_client_day_idx
  ON public.seo_semrush_snapshots (client_id, day DESC);
