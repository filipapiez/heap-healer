create table if not exists public.seo_metrics_daily (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.seo_clients(id) on delete cascade,
  day date not null,
  clicks integer not null default 0,
  impressions integer not null default 0,
  indexed_pages integer,
  unique (client_id, day)
);

create unique index if not exists seo_metrics_daily_client_day_unique
  on public.seo_metrics_daily(client_id, day);

create index if not exists seo_metrics_daily_client_day_idx
  on public.seo_metrics_daily(client_id, day desc);

grant select, insert, update, delete on public.seo_metrics_daily to authenticated;
grant all on public.seo_metrics_daily to service_role;

alter table public.seo_metrics_daily enable row level security;

drop policy if exists "Authenticated manage SEO metrics" on public.seo_metrics_daily;
drop policy if exists "Workspace members manage SEO metrics" on public.seo_metrics_daily;

create policy "Workspace members manage SEO metrics"
  on public.seo_metrics_daily
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.seo_clients c
      join public.workspace_members m on m.workspace_id = c.workspace_id
      where c.id = seo_metrics_daily.client_id
        and m.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.seo_clients c
      join public.workspace_members m on m.workspace_id = c.workspace_id
      where c.id = seo_metrics_daily.client_id
        and m.user_id = auth.uid()
    )
  );

select pg_notify('pgrst', 'reload schema');