alter table public.seo_clients
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;

create unique index if not exists seo_clients_workspace_unique
  on public.seo_clients(workspace_id);

grant select, insert, update, delete on public.seo_clients to authenticated;
grant all on public.seo_clients to service_role;

notify pgrst, 'reload schema';