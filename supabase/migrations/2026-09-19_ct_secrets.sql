-- ct_secrets — service-role-only key/value store for calorietracker's own
-- server-side secrets (e.g. the Content API key used to call
-- my.20fit.id/api/content/v1/recipes from the content-recipes edge
-- function). RLS enabled with NO policies at all, so anon/authenticated can
-- never read or write it — only the service role (which edge functions use
-- internally, via SUPABASE_SERVICE_ROLE_KEY) bypasses RLS. Same pattern as
-- articles_api_keys (RLS-with-no-policies for a secrets table).
--
-- SCHEMA ONLY in this file — the actual secret value is inserted directly
-- against the database (not via a tracked migration), so it never ends up
-- in git history of this public repo.
create table if not exists public.ct_secrets (
  name       text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

alter table public.ct_secrets enable row level security;
-- No policies — service role only.
