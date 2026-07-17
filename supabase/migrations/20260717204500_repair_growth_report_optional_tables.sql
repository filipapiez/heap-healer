-- Some early environments received the client/metrics migrations without the
-- progressive growth-report tables. Recreate them idempotently so optional
-- features never depend on migration history being perfectly linear.
create table if not exists public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.seo_clients(id) on delete cascade,
  published_at timestamptz not null default now(),
  url text not null,
  keyword text,
  indexed boolean not null default false,
  impressions int not null default 0,
  clicks int not null default 0
);

create table if not exists public.seo_backlinks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.seo_clients(id) on delete cascade,
  created_at timestamptz not null default now(),
  source_domain text not null,
  authority int,
  anchor text,
  target_url text,
  status text not null default 'live' check (status in ('live', 'pending', 'lost'))
);

create table if not exists public.seo_geo_checks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.seo_clients(id) on delete cascade,
  checked_at timestamptz not null default now(),
  engine text not null,
  query text not null,
  mentioned boolean not null default false,
  cited_url text
);

create index if not exists seo_pages_client_published_idx
  on public.seo_pages(client_id, published_at desc);
create index if not exists seo_backlinks_client_created_idx
  on public.seo_backlinks(client_id, created_at desc);
create index if not exists seo_geo_checks_client_checked_idx
  on public.seo_geo_checks(client_id, checked_at desc);

alter table public.seo_pages enable row level security;
alter table public.seo_backlinks enable row level security;
alter table public.seo_geo_checks enable row level security;

drop policy if exists "Authenticated manage SEO pages" on public.seo_pages;
drop policy if exists "Authenticated manage SEO backlinks" on public.seo_backlinks;
drop policy if exists "Authenticated manage SEO GEO checks" on public.seo_geo_checks;
drop policy if exists "Workspace members manage SEO pages" on public.seo_pages;
drop policy if exists "Workspace members manage SEO backlinks" on public.seo_backlinks;
drop policy if exists "Workspace members manage SEO GEO checks" on public.seo_geo_checks;

create policy "Workspace members manage SEO pages"
on public.seo_pages for all to authenticated
using (exists (
  select 1 from public.seo_clients c
  join public.workspace_members m on m.workspace_id = c.workspace_id
  where c.id = seo_pages.client_id and m.user_id = auth.uid()
))
with check (exists (
  select 1 from public.seo_clients c
  join public.workspace_members m on m.workspace_id = c.workspace_id
  where c.id = seo_pages.client_id and m.user_id = auth.uid()
));

create policy "Workspace members manage SEO backlinks"
on public.seo_backlinks for all to authenticated
using (exists (
  select 1 from public.seo_clients c
  join public.workspace_members m on m.workspace_id = c.workspace_id
  where c.id = seo_backlinks.client_id and m.user_id = auth.uid()
))
with check (exists (
  select 1 from public.seo_clients c
  join public.workspace_members m on m.workspace_id = c.workspace_id
  where c.id = seo_backlinks.client_id and m.user_id = auth.uid()
));

create policy "Workspace members manage SEO GEO checks"
on public.seo_geo_checks for all to authenticated
using (exists (
  select 1 from public.seo_clients c
  join public.workspace_members m on m.workspace_id = c.workspace_id
  where c.id = seo_geo_checks.client_id and m.user_id = auth.uid()
))
with check (exists (
  select 1 from public.seo_clients c
  join public.workspace_members m on m.workspace_id = c.workspace_id
  where c.id = seo_geo_checks.client_id and m.user_id = auth.uid()
));

grant select, insert, update, delete on public.seo_pages to authenticated;
grant select, insert, update, delete on public.seo_backlinks to authenticated;
grant select, insert, update, delete on public.seo_geo_checks to authenticated;
grant all on public.seo_pages to service_role;
grant all on public.seo_backlinks to service_role;
grant all on public.seo_geo_checks to service_role;

notify pgrst, 'reload schema';
