create table if not exists public.seo_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  current_step int not null default 1 check (current_step between 1 and 6),
  completed boolean not null default false,
  name text,
  website text,
  target_market text,
  language text,
  business_desc text,
  target_audience text[] not null default '{}',
  competitors text[] not null default '{}',
  gsc_connected boolean not null default false,
  monthly_clicks text,
  indexed_pages text,
  email text,
  source text not null default 'wizard'
);

create index if not exists seo_leads_updated_idx on public.seo_leads (updated_at desc);
alter table public.seo_leads enable row level security;

create policy "Anyone can create an SEO lead"
  on public.seo_leads for insert to anon, authenticated
  with check (true);

create policy "Anyone can continue an SEO lead"
  on public.seo_leads for update to anon, authenticated
  using (true)
  with check (true);
