create table if not exists public.seo_gsc_connections (
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

revoke all on public.seo_gsc_connections from anon, authenticated;
grant all on public.seo_gsc_connections to service_role;

comment on table public.seo_gsc_connections is
  'Server-only Search Console connections used by the daily sync. OAuth refresh tokens must never be exposed to browser clients.';

select pg_notify('pgrst', 'reload schema');