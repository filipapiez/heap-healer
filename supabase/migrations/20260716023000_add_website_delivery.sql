create table public.website_connections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  platform text not null check (platform in ('wordpress','shopify','github')),
  external_id text not null,
  display_name text,
  encrypted_credentials text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'connected' check (status in ('connected','error','disconnected')),
  last_tested_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, platform, external_id)
);

create table public.website_publish_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  connection_id uuid not null references public.website_connections(id) on delete cascade,
  title text not null,
  slug text not null,
  html text not null,
  excerpt text,
  metadata jsonb not null default '{}'::jsonb,
  publish_mode text not null default 'draft' check (publish_mode in ('draft','publish','pull_request')),
  status text not null default 'queued' check (status in ('queued','processing','published','failed')),
  external_url text,
  external_id text,
  error_message text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.website_connections enable row level security;
alter table public.website_publish_jobs enable row level security;
revoke all on public.website_connections from anon, authenticated;
revoke all on public.website_publish_jobs from anon, authenticated;
grant all on public.website_connections to service_role;
grant all on public.website_publish_jobs to service_role;
create index website_publish_jobs_queue_idx on public.website_publish_jobs(status, created_at);
