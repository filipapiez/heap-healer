create table public.seo_gsc_connections (
  client_id uuid primary key references public.seo_clients(id) on delete cascade,
  property_url text not null,
  refresh_token text not null,
  active boolean not null default true,
  last_synced_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.seo_gsc_connections enable row level security;

-- Deliberately no browser-facing policy: OAuth refresh tokens are service-role only.
revoke all on public.seo_gsc_connections from anon, authenticated;

create index seo_metrics_daily_client_day_idx on public.seo_metrics_daily(client_id, day desc);

comment on table public.seo_gsc_connections is
  'Server-only Search Console connections used by the daily sync. Never expose refresh_token to browser clients.';
