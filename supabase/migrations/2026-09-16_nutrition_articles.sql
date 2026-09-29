-- nutrition_articles — schema for the calorie feature's article library.
--
-- STATUS: APPLIED to production (cpvzwqptzcxnwzfzgrmt) 2026-09-16. The app
-- now reads articles from this table (src/hooks/useArticles.ts), with the
-- bundled Markdown in src/data/articles/*.md / *.en.md kept only as an
-- in-browser fallback if the DB fetch fails or the table is briefly empty
-- (src/data/articles.ts STATIC_ARTICLES). Content is bilingual: every text
-- field is jsonb shaped as {"id": "...", "en": "..."} (or {"id": [...],
-- "en": [...]} for tags/sources), matching the app's Lang type.
--
-- Writes (insert/update/delete) go through the `articles-api` Edge Function
-- (supabase/functions/articles-api), authenticated with a per-developer API
-- key checked against public.articles_api_keys — never via a client-exposed
-- key. RLS below only grants public SELECT; there is intentionally no
-- insert/update/delete policy for anon/authenticated, so direct writes from
-- the browser (anon key) are impossible even if someone tries.
--
-- Also documented here (single place for the calorie feature's data model):
--
-- calorie_logs / user_calorie_settings from the brief are INTENTIONALLY NOT
-- created. calorietracker and my.20fit.id share one Supabase project and one
-- auth.users, and the daily food log + the user's profile/targets already live
-- in my20fit_daily_log (cal_items jsonb) and my20fit_profile, which both apps
-- read/write with existing RLS (auth.uid() = auth_user_id). The tracker appends
-- via the existing my20fit_append_daily_food_item RPC (see the 2026-08-30
-- migration) and derives targets from my20fit_profile via src/lib/nutrition.ts.
-- Creating parallel calorie_logs / user_calorie_settings tables would fork the
-- member's data away from my.20fit.id — so we reuse the shared tables instead.

create table if not exists public.nutrition_articles (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title jsonb not null,     -- {"id": "...", "en": "..."}
  excerpt jsonb not null,   -- {"id": "...", "en": "..."}
  content jsonb not null,   -- {"id": "markdown...", "en": "markdown..."}
  category text not null check (category in (
    'nutrition-basics',
    'meal-planning',
    'food-myths',
    'diet-types',
    'micronutrients',
    'sports-nutrition',
    'indonesian-food',
    'weight-management'
  )),
  tags jsonb not null default '{"id":[],"en":[]}'::jsonb,     -- {"id": string[], "en": string[]}
  read_time_minutes int not null default 5,
  is_premium boolean not null default false, -- true = full read needs an account
  sources jsonb not null default '{"id":[],"en":[]}'::jsonb,  -- {"id": string[], "en": string[]}
  author text not null default '20fit Nutrition Team',
  disclaimer jsonb not null default '{"id":"Artikel ini bersifat edukatif dan informasional. Bukan pengganti konsultasi medis. Untuk kebutuhan diet spesifik, konsultasikan dengan ahli gizi atau dokter.","en":"This article is educational and informational. It is not a substitute for medical consultation. For specific dietary needs, consult a registered dietitian or doctor."}'::jsonb,
  cover_icon text not null,   -- IconName from src/components/Icon.tsx (fallback shown if cover_photo fails to load)
  cover_photo text not null,  -- real photo URL
  accent text not null default '#22C55E', -- cover gradient accent
  published_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists nutrition_articles_published_at_idx on public.nutrition_articles (published_at);
create index if not exists nutrition_articles_category_idx on public.nutrition_articles (category);

create or replace function public.nutrition_articles_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists nutrition_articles_updated_at on public.nutrition_articles;
create trigger nutrition_articles_updated_at
  before update on public.nutrition_articles
  for each row execute function public.nutrition_articles_set_updated_at();

alter table public.nutrition_articles enable row level security;

-- Public reference content: readable by everyone. The 30% preview gate for
-- premium articles is enforced in the client (it clips the source), so full
-- rows are readable; if stricter gating is ever needed, move premium bodies
-- behind an authenticated-only policy or a server function.
drop policy if exists "nutrition_articles readable by all" on public.nutrition_articles;
create policy "nutrition_articles readable by all" on public.nutrition_articles
  for select using (true);

-- No insert/update/delete policy on purpose: writes only happen via the
-- articles-api Edge Function, which uses the service role internally and so
-- bypasses RLS. The anon/authenticated roles used by the browser client can
-- never write to this table.

-- API keys for the articles-api Edge Function. Only a SHA-256 hex hash of
-- each key is stored — the raw key is shown once at creation time and never
-- persisted. RLS is enabled with NO policies at all, so this table is only
-- readable/writable via the service role (used server-side inside the Edge
-- Function) — never via the anon or authenticated client roles.
create table if not exists public.articles_api_keys (
  id uuid default gen_random_uuid() primary key,
  label text not null,       -- who/what this key is for, e.g. "external dev - Sept 2026"
  key_hash text unique not null, -- sha256(raw key), hex-encoded
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table public.articles_api_keys enable row level security;
