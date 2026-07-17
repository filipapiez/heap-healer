-- Some environments were created before website OAuth states began carrying
-- provider-specific context (for example, the requested Search Console site).
-- Keep this migration separate so those databases are repaired even when the
-- earlier bundled website-connections migration was marked as applied.
alter table public.oauth_states
  add column if not exists metadata jsonb not null default '{}'::jsonb;

comment on column public.oauth_states.metadata is
  'Short-lived provider context associated with an OAuth state token.';

-- Ask PostgREST to refresh immediately instead of waiting for its schema cache
-- to expire after deployment.
notify pgrst, 'reload schema';
