alter table public.seo_clients
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

create unique index if not exists seo_clients_workspace_unique
  on public.seo_clients(workspace_id);

alter table public.oauth_states add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.github_app_installations (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  installation_id bigint not null unique,
  account_login text,
  account_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.github_app_installations enable row level security;
revoke all on public.github_app_installations from anon, authenticated;
grant all on public.github_app_installations to service_role;

drop policy if exists "Authenticated manage SEO clients" on public.seo_clients;
drop policy if exists "Authenticated manage SEO metrics" on public.seo_metrics_daily;
drop policy if exists "Authenticated manage SEO backlinks" on public.seo_backlinks;
drop policy if exists "Authenticated manage SEO pages" on public.seo_pages;
drop policy if exists "Authenticated manage SEO GEO checks" on public.seo_geo_checks;

create policy "Workspace members manage SEO clients" on public.seo_clients for all to authenticated
using (exists (select 1 from public.workspace_members m where m.workspace_id = seo_clients.workspace_id and m.user_id = auth.uid()))
with check (exists (select 1 from public.workspace_members m where m.workspace_id = seo_clients.workspace_id and m.user_id = auth.uid()));

create policy "Workspace members manage SEO metrics" on public.seo_metrics_daily for all to authenticated
using (exists (select 1 from public.seo_clients c join public.workspace_members m on m.workspace_id = c.workspace_id where c.id = seo_metrics_daily.client_id and m.user_id = auth.uid()))
with check (exists (select 1 from public.seo_clients c join public.workspace_members m on m.workspace_id = c.workspace_id where c.id = seo_metrics_daily.client_id and m.user_id = auth.uid()));

create policy "Workspace members manage SEO backlinks" on public.seo_backlinks for all to authenticated
using (exists (select 1 from public.seo_clients c join public.workspace_members m on m.workspace_id = c.workspace_id where c.id = seo_backlinks.client_id and m.user_id = auth.uid()))
with check (exists (select 1 from public.seo_clients c join public.workspace_members m on m.workspace_id = c.workspace_id where c.id = seo_backlinks.client_id and m.user_id = auth.uid()));

create policy "Workspace members manage SEO pages" on public.seo_pages for all to authenticated
using (exists (select 1 from public.seo_clients c join public.workspace_members m on m.workspace_id = c.workspace_id where c.id = seo_pages.client_id and m.user_id = auth.uid()))
with check (exists (select 1 from public.seo_clients c join public.workspace_members m on m.workspace_id = c.workspace_id where c.id = seo_pages.client_id and m.user_id = auth.uid()));

create policy "Workspace members manage SEO GEO checks" on public.seo_geo_checks for all to authenticated
using (exists (select 1 from public.seo_clients c join public.workspace_members m on m.workspace_id = c.workspace_id where c.id = seo_geo_checks.client_id and m.user_id = auth.uid()))
with check (exists (select 1 from public.seo_clients c join public.workspace_members m on m.workspace_id = c.workspace_id where c.id = seo_geo_checks.client_id and m.user_id = auth.uid()));
