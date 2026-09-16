-- nutrition_articles — schema for the calorie feature's article library.
--
-- STATUS: NOT YET APPLIED, and NOT used by the shipping app. Article content
-- currently lives as bundled Markdown (src/data/articles/*.md, assembled in
-- src/data/articles.ts) because this repo has no migration runner / Supabase
-- write access from CI, and the articles are read-only reference content that
-- is identical for every user — bundling ships them instantly and offline-safe.
-- This file exists so the brief's schema is tracked and a future DB-backed
-- version has a starting point. If adopted, port the metadata + Markdown bodies
-- from src/data/articles.ts and switch the readers to Supabase queries.
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
  title text not null,
  slug text unique not null,
  excerpt text not null,
  content text not null, -- full markdown
  cover_emoji text,
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
  tags text[],
  read_time_minutes int default 10,
  is_premium boolean default false, -- true = full read needs an account
  sources text[],
  author text default '20fit Nutrition Team',
  disclaimer text default 'Artikel ini bersifat edukatif dan informasional. Bukan pengganti konsultasi medis. Untuk kebutuhan diet spesifik, konsultasikan dengan ahli gizi atau dokter.',
  published_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table public.nutrition_articles enable row level security;

-- Public reference content: readable by everyone. The 30% preview gate for
-- premium articles is enforced in the client (it clips the source), so full
-- rows are readable; if stricter gating is ever needed, move premium bodies
-- behind an authenticated-only policy or a server function.
drop policy if exists "nutrition_articles readable by all" on public.nutrition_articles;
create policy "nutrition_articles readable by all" on public.nutrition_articles
  for select using (true);
