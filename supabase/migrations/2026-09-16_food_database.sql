-- food_database — the searchable Indonesian food reference behind the calorie
-- feature's quick lookup and the tracker's "add food" flow.
--
-- STATUS: NOT YET APPLIED. Unlike the other files in this folder (which are
-- source-of-truth copies of RPCs already applied to production via Supabase
-- MCP), this migration is provided for a FUTURE DB-backed version of the food
-- reference. The shipping app currently reads the same data from a bundled
-- static module — src/data/foods.ts — which is the live source of truth and a
-- SUPERSET of the seed below (it adds more everyday Indonesian foods). Bundling
-- was chosen because this repo has no migration runner and no Supabase write
-- access from CI, and the data is small, read-only, and identical for every
-- user, so shipping it makes search instant and offline-safe.
--
-- When moving to DB-backed: apply this schema, port the full list from
-- src/data/foods.ts (this seed is the canonical TKPI starter set from the
-- brief), and swap searchFoods()/foodsByCategory() to Supabase queries. The
-- table is world-readable reference data (RLS: read-all, no writes from the
-- anon/authenticated client).
--
-- Nutrition values are PER SERVING shown (not always per 100g). Sources per
-- row: TKPI (Tabel Komposisi Pangan Indonesia, Kemenkes RI), USDA, product
-- labels, or reasoned estimates for composite dishes.

create table if not exists public.food_database (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  name_en text,
  category text not null check (category in
    ('staple','protein','vegetable','fruit','snack','beverage','fast-food','dairy-nuts')),
  serving_size numeric not null,
  serving_unit text not null default 'gram',
  serving_description text,
  calories numeric not null,
  protein numeric default 0,
  carbs numeric default 0,
  fat numeric default 0,
  fiber numeric default 0,
  sugar numeric default 0,
  sodium numeric default 0,
  source text default 'TKPI',
  is_verified boolean default true,
  created_at timestamptz default now()
);

-- Full-text search over the Indonesian name (mirrors searchFoods()).
create index if not exists idx_food_name on public.food_database
  using gin (to_tsvector('indonesian', name));

alter table public.food_database enable row level security;

-- Reference data: readable by everyone (guest lookup), writable by no one from
-- the client (seed/maintain via migrations or an admin role only).
drop policy if exists "food_database readable by all" on public.food_database;
create policy "food_database readable by all" on public.food_database
  for select using (true);

-- Canonical TKPI starter seed (the brief's set). The app's src/data/foods.ts
-- carries this plus additional common foods.
insert into public.food_database (name, category, serving_size, serving_unit, serving_description, calories, protein, carbs, fat, source) values
-- MAKANAN POKOK
('Nasi Putih', 'staple', 100, 'gram', '1 centong', 130, 2.7, 28.6, 0.3, 'TKPI'),
('Nasi Merah', 'staple', 100, 'gram', '1 centong', 110, 2.8, 23.5, 0.9, 'TKPI'),
('Mie Instan (dimasak)', 'staple', 80, 'gram', '1 bungkus', 350, 8, 50, 13, 'Label Produk'),
('Roti Tawar Putih', 'staple', 35, 'gram', '1 lembar', 90, 3, 17, 1, 'TKPI'),
('Kentang Rebus', 'staple', 100, 'gram', '1 buah sedang', 62, 2, 14, 0.1, 'TKPI'),
('Oatmeal', 'staple', 40, 'gram', '4 sendok makan', 150, 5, 27, 2.5, 'USDA'),
-- PROTEIN
('Dada Ayam Tanpa Kulit (rebus)', 'protein', 100, 'gram', '1 potong', 165, 31, 0, 3.6, 'TKPI'),
('Telur Ayam (rebus)', 'protein', 60, 'gram', '1 butir', 90, 7, 0.6, 6.3, 'TKPI'),
('Ikan Salmon (panggang)', 'protein', 100, 'gram', '1 fillet kecil', 208, 20, 0, 13, 'USDA'),
('Tempe (goreng)', 'protein', 50, 'gram', '2 potong', 150, 9.5, 8.5, 9, 'TKPI'),
('Tahu Putih (goreng)', 'protein', 50, 'gram', '1 potong besar', 115, 5, 2.5, 9.5, 'TKPI'),
('Daging Sapi (rendang)', 'protein', 100, 'gram', '1 potong', 193, 27, 2, 9, 'TKPI'),
('Udang (rebus)', 'protein', 100, 'gram', '10 ekor sedang', 99, 21, 0.2, 1.1, 'TKPI'),
('Ikan Tongkol (goreng)', 'protein', 80, 'gram', '1 potong', 145, 22, 0, 6, 'TKPI'),
-- SAYURAN
('Bayam (rebus)', 'vegetable', 100, 'gram', '1 mangkok', 23, 2.9, 3.6, 0.4, 'TKPI'),
('Brokoli (rebus)', 'vegetable', 100, 'gram', '1 mangkok', 35, 2.4, 7, 0.4, 'TKPI'),
('Kangkung (tumis)', 'vegetable', 100, 'gram', '1 porsi', 50, 3, 4, 2.5, 'TKPI'),
('Wortel (rebus)', 'vegetable', 100, 'gram', '1 buah', 41, 0.9, 10, 0.2, 'TKPI'),
('Terong (tumis)', 'vegetable', 100, 'gram', '1 porsi', 55, 1, 6, 3, 'TKPI'),
-- BUAH
('Pisang Ambon', 'fruit', 120, 'gram', '1 buah', 105, 1.3, 27, 0.4, 'TKPI'),
('Apel Merah', 'fruit', 150, 'gram', '1 buah sedang', 78, 0.4, 21, 0.2, 'TKPI'),
('Jeruk Manis', 'fruit', 130, 'gram', '1 buah', 62, 1, 15, 0.2, 'TKPI'),
('Semangka', 'fruit', 150, 'gram', '1 potong', 45, 0.9, 11, 0.2, 'TKPI'),
('Alpukat', 'fruit', 100, 'gram', 'setengah buah', 160, 2, 8.5, 15, 'TKPI'),
('Mangga', 'fruit', 150, 'gram', '1 buah kecil', 99, 1.4, 25, 0.6, 'TKPI'),
-- SNACK & JAJAN
('Gorengan (bakwan)', 'snack', 50, 'gram', '1 buah', 142, 2.5, 14, 9, 'TKPI'),
('Martabak Manis', 'snack', 100, 'gram', '1 potong', 330, 7, 42, 15, 'Estimasi'),
('Keripik Singkong', 'snack', 30, 'gram', '1 genggam', 152, 0.5, 18, 9, 'Label Produk'),
('Kue Lapis', 'snack', 50, 'gram', '1 potong', 145, 2, 22, 6, 'TKPI'),
-- MINUMAN
('Kopi Susu Gula Aren', 'beverage', 300, 'ml', '1 gelas', 180, 4, 28, 6, 'Estimasi'),
('Es Teh Manis', 'beverage', 250, 'ml', '1 gelas', 90, 0, 23, 0, 'Estimasi'),
('Susu Full Cream', 'beverage', 200, 'ml', '1 gelas', 122, 6, 10, 6.5, 'TKPI'),
('Jus Jeruk (tanpa gula)', 'beverage', 250, 'ml', '1 gelas', 112, 1.7, 26, 0.5, 'TKPI'),
('Air Kelapa Muda', 'beverage', 240, 'ml', '1 gelas', 46, 1.7, 9, 0.5, 'TKPI'),
-- FAST FOOD / RESTO
('Ayam Geprek + Nasi', 'fast-food', 300, 'gram', '1 porsi', 550, 28, 55, 24, 'Estimasi'),
('Mie Ayam', 'fast-food', 350, 'gram', '1 mangkok', 420, 18, 52, 16, 'Estimasi'),
('Soto Ayam + Nasi', 'fast-food', 400, 'gram', '1 porsi', 380, 20, 45, 13, 'Estimasi'),
('Gado-gado', 'fast-food', 300, 'gram', '1 porsi', 350, 14, 30, 20, 'Estimasi'),
('Nasi Goreng', 'fast-food', 250, 'gram', '1 porsi', 400, 12, 50, 17, 'Estimasi'),
('Bakso (5 butir + mie + kuah)', 'fast-food', 400, 'gram', '1 mangkok', 350, 18, 40, 12, 'Estimasi');
