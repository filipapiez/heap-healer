create table public.seo_clients (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
  name text not null, website text not null, baseline_date date not null,
  baseline_clicks int not null default 0, baseline_impressions int not null default 0,
  baseline_indexed int not null default 0,
  report_token text not null unique default encode(gen_random_bytes(12), 'hex')
);

create table public.seo_metrics_daily (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.seo_clients(id) on delete cascade,
  day date not null, clicks int not null default 0, impressions int not null default 0,
  indexed_pages int, unique(client_id, day)
);

create table public.seo_backlinks (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.seo_clients(id) on delete cascade,
  created_at timestamptz not null default now(), source_domain text not null,
  authority int, anchor text, target_url text,
  status text not null default 'live' check (status in ('live','pending','lost'))
);

create table public.seo_pages (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.seo_clients(id) on delete cascade,
  published_at timestamptz not null default now(), url text not null, keyword text,
  indexed boolean not null default false, impressions int not null default 0, clicks int not null default 0
);

create table public.seo_geo_checks (
  id uuid primary key default gen_random_uuid(), client_id uuid not null references public.seo_clients(id) on delete cascade,
  checked_at timestamptz not null default now(), engine text not null, query text not null,
  mentioned boolean not null default false, cited_url text
);

alter table public.seo_clients enable row level security;
alter table public.seo_metrics_daily enable row level security;
alter table public.seo_backlinks enable row level security;
alter table public.seo_pages enable row level security;
alter table public.seo_geo_checks enable row level security;

create policy "Authenticated manage SEO clients" on public.seo_clients for all to authenticated using (true) with check (true);
create policy "Authenticated manage SEO metrics" on public.seo_metrics_daily for all to authenticated using (true) with check (true);
create policy "Authenticated manage SEO backlinks" on public.seo_backlinks for all to authenticated using (true) with check (true);
create policy "Authenticated manage SEO pages" on public.seo_pages for all to authenticated using (true) with check (true);
create policy "Authenticated manage SEO GEO checks" on public.seo_geo_checks for all to authenticated using (true) with check (true);

create or replace function public.get_growth_report(token text)
returns jsonb language sql security definer stable set search_path = public as $$
  select jsonb_build_object(
    'client', to_jsonb(c) - 'report_token',
    'metrics', (select coalesce(jsonb_agg(to_jsonb(m) order by m.day), '[]'::jsonb) from public.seo_metrics_daily m where m.client_id = c.id),
    'backlinks', (select coalesce(jsonb_agg(to_jsonb(b) order by b.created_at desc), '[]'::jsonb) from public.seo_backlinks b where b.client_id = c.id),
    'pages', (select coalesce(jsonb_agg(to_jsonb(p) order by p.published_at desc), '[]'::jsonb) from public.seo_pages p where p.client_id = c.id),
    'geo', (select coalesce(jsonb_agg(to_jsonb(g) order by g.checked_at desc), '[]'::jsonb) from public.seo_geo_checks g where g.client_id = c.id)
  ) from public.seo_clients c where c.report_token = token;
$$;

revoke all on function public.get_growth_report(text) from public;
grant execute on function public.get_growth_report(text) to anon, authenticated;
