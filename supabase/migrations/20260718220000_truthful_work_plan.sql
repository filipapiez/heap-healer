-- Persist the evidence used by the growth dashboard and keep client data scoped
-- to members of the owning workspace.

create table if not exists public.seo_audit_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  website text not null,
  score numeric(3,1) not null,
  checks_passed integer not null default 0,
  checks_failed integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists seo_audit_runs_workspace_created_idx
  on public.seo_audit_runs(workspace_id, created_at desc);

alter table public.seo_audit_runs enable row level security;
grant select on public.seo_audit_runs to authenticated;
grant all on public.seo_audit_runs to service_role;

drop policy if exists "audit runs members read" on public.seo_audit_runs;
create policy "audit runs members read"
on public.seo_audit_runs for select to authenticated
using (public.is_workspace_member(workspace_id, auth.uid()));

-- Zero is a valid baseline, so a timestamp is required to distinguish a
-- captured zero from the column defaults that existed before the first sync.
alter table public.seo_clients
  add column if not exists baseline_captured_at timestamptz;

-- A later compatibility migration recreated the old USING (true) policy after
-- the workspace-scoped repair. Remove every historical name and leave one
-- authoritative policy so permissive policies cannot be ORed together by RLS.
drop policy if exists "Authenticated manage SEO clients" on public.seo_clients;
drop policy if exists "Workspace members manage SEO clients" on public.seo_clients;
drop policy if exists "seo clients members manage" on public.seo_clients;

create policy "Workspace members manage SEO clients"
on public.seo_clients for all to authenticated
using (
  workspace_id is not null
  and public.is_workspace_member(workspace_id, auth.uid())
)
with check (
  workspace_id is not null
  and public.is_workspace_member(workspace_id, auth.uid())
);

notify pgrst, 'reload schema';
