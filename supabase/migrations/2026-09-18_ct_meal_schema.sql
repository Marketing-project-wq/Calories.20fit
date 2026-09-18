-- ct_meal / ct_meal_component / ct_meal_audit — calorietracker.20fit.id's
-- structured meal log (rich AI scan result persisted: components, badges,
-- insights) with an append-only audit trail and a single-transaction write
-- RPC that ALSO dual-writes the flat entries to my20fit_daily_log.cal_items so
-- my.20fit.id stays consistent.
--
-- ADDITIVE ONLY: creates new ct_* tables + RPCs. Does NOT alter my20fit_*.
-- Applied to project cpvzwqptzcxnwzfzgrmt via Supabase MCP; this file is the
-- tracked source of truth (calorietracker has no migration runner of its own,
-- same pattern as 2026-08-30_append_daily_food_item.sql).
--
-- Reference: my.20fit.id/calories renders the same rich result ephemerally
-- (js memory) and flattens to cal_items {name,kcal,p,c,f,t}; here we persist
-- the structure AND mirror to cal_items (+ additive mid/cid keys my.20fit
-- ignores) so both apps read the same daily log.

-- ---------------- tables ----------------
create table if not exists public.ct_meal (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid not null default auth.uid(),
  log_date      date not null,
  source        text not null default 'photo_scan',
  title         text,
  total_kcal    int,  protein_g numeric, carbs_g numeric, fat_g numeric, fiber_g numeric,
  kcal_min      int,  kcal_max int,  confidence int,
  health_score  int,  satiety_score int, satiety_note text,
  description   text, overall text, recommendation text,
  tags          jsonb, needs_more jsonb, insights jsonb, assumptions jsonb,
  image_url     text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  deleted_at    timestamptz
);

create table if not exists public.ct_meal_component (
  id            uuid primary key default gen_random_uuid(),
  meal_id       uuid not null references public.ct_meal(id) on delete cascade,
  auth_user_id  uuid not null default auth.uid(),
  position      int  not null default 0,
  name          text not null, portion text, grams numeric,
  kcal          int, protein_g numeric, carbs_g numeric, fat_g numeric, fiber_g numeric,
  confidence    int,
  verdict_band  text, verdict_label text, verdict_reason text, swap_to text,
  item_source   text default 'ai',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  deleted_at    timestamptz
);

create table if not exists public.ct_meal_audit (
  id            bigint generated always as identity primary key,
  auth_user_id  uuid not null default auth.uid(),
  meal_id       uuid, component_id uuid,
  action        text not null,
  field         text, before jsonb, after jsonb,
  created_at    timestamptz default now()
);

create index if not exists ct_meal_user_date_idx on public.ct_meal (auth_user_id, log_date desc) where deleted_at is null;
create index if not exists ct_component_meal_idx  on public.ct_meal_component (meal_id) where deleted_at is null;
create index if not exists ct_audit_user_idx       on public.ct_meal_audit (auth_user_id, created_at desc);

-- ---------------- RLS ----------------
alter table public.ct_meal           enable row level security;
alter table public.ct_meal_component enable row level security;
alter table public.ct_meal_audit     enable row level security;

drop policy if exists ct_meal_sel on public.ct_meal;
drop policy if exists ct_meal_ins on public.ct_meal;
drop policy if exists ct_meal_upd on public.ct_meal;
create policy ct_meal_sel on public.ct_meal for select using (auth.uid() = auth_user_id);
create policy ct_meal_ins on public.ct_meal for insert with check (auth.uid() = auth_user_id);
create policy ct_meal_upd on public.ct_meal for update using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

drop policy if exists ct_comp_sel on public.ct_meal_component;
drop policy if exists ct_comp_ins on public.ct_meal_component;
drop policy if exists ct_comp_upd on public.ct_meal_component;
create policy ct_comp_sel on public.ct_meal_component for select using (auth.uid() = auth_user_id);
create policy ct_comp_ins on public.ct_meal_component for insert with check (auth.uid() = auth_user_id);
create policy ct_comp_upd on public.ct_meal_component for update using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

-- audit: readable by owner; append-only — no client insert/update/delete policy
-- (only the SECURITY DEFINER RPC writes it, bypassing RLS).
drop policy if exists ct_audit_sel on public.ct_meal_audit;
create policy ct_audit_sel on public.ct_meal_audit for select using (auth.uid() = auth_user_id);

-- ---------------- atomic write RPC ----------------
-- One transaction: insert meal + components, append the flat entries to
-- my20fit_daily_log.cal_items (with additive mid/cid), write a create audit
-- row, and return the meal id + updated cal_items. Any failure rolls back the
-- whole thing (no partial write). Ownership is auth.uid() — never trusted from
-- the client payload.
create or replace function public.ct_log_meal(p_meal jsonb, p_components jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_uid       uuid := auth.uid();
  v_today     date;
  v_meal_id   uuid;
  v_comp      jsonb;
  v_comp_id   uuid;
  v_pos       int := 0;
  v_items     jsonb := '[]'::jsonb;
  v_t         text;
  v_row       public.my20fit_daily_log;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'code', 'not_authenticated');
  end if;
  if p_components is null or jsonb_typeof(p_components) <> 'array' or jsonb_array_length(p_components) = 0 then
    return jsonb_build_object('ok', false, 'code', 'no_components');
  end if;

  v_today := coalesce(nullif(p_meal->>'log_date','')::date, (now() at time zone 'Asia/Jakarta')::date);

  insert into public.ct_meal (
    auth_user_id, log_date, source, title,
    total_kcal, protein_g, carbs_g, fat_g, fiber_g,
    kcal_min, kcal_max, confidence, health_score, satiety_score, satiety_note,
    description, overall, recommendation, tags, needs_more, insights, assumptions, image_url
  ) values (
    v_uid, v_today, coalesce(nullif(p_meal->>'source',''),'photo_scan'), nullif(p_meal->>'title',''),
    nullif(p_meal->>'total_kcal','')::int, nullif(p_meal->>'protein_g','')::numeric, nullif(p_meal->>'carbs_g','')::numeric,
    nullif(p_meal->>'fat_g','')::numeric, nullif(p_meal->>'fiber_g','')::numeric,
    nullif(p_meal->>'kcal_min','')::int, nullif(p_meal->>'kcal_max','')::int, nullif(p_meal->>'confidence','')::int,
    nullif(p_meal->>'health_score','')::int, nullif(p_meal->>'satiety_score','')::int, nullif(p_meal->>'satiety_note',''),
    nullif(p_meal->>'description',''), nullif(p_meal->>'overall',''), nullif(p_meal->>'recommendation',''),
    p_meal->'tags', p_meal->'needs_more', p_meal->'insights', p_meal->'assumptions', nullif(p_meal->>'image_url','')
  ) returning id into v_meal_id;

  for v_comp in select * from jsonb_array_elements(p_components) loop
    insert into public.ct_meal_component (
      meal_id, auth_user_id, position, name, portion, grams,
      kcal, protein_g, carbs_g, fat_g, fiber_g, confidence,
      verdict_band, verdict_label, verdict_reason, swap_to, item_source
    ) values (
      v_meal_id, v_uid, v_pos, coalesce(nullif(v_comp->>'name',''),'?'), nullif(v_comp->>'portion',''), nullif(v_comp->>'grams','')::numeric,
      nullif(v_comp->>'kcal','')::int, nullif(v_comp->>'protein_g','')::numeric, nullif(v_comp->>'carbs_g','')::numeric,
      nullif(v_comp->>'fat_g','')::numeric, nullif(v_comp->>'fiber_g','')::numeric, nullif(v_comp->>'confidence','')::int,
      nullif(v_comp->>'verdict_band',''), nullif(v_comp->>'verdict_label',''), nullif(v_comp->>'verdict_reason',''),
      nullif(v_comp->>'swap_to',''), coalesce(nullif(v_comp->>'item_source',''),'ai')
    ) returning id into v_comp_id;

    v_t := coalesce(nullif(v_comp->>'t',''), to_char(now() at time zone 'Asia/Jakarta','HH24:MI'));
    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'name', coalesce(nullif(v_comp->>'name',''),'?'),
      'kcal', round(coalesce(nullif(v_comp->>'kcal','')::numeric,0)),
      'p',    round(coalesce(nullif(v_comp->>'protein_g','')::numeric,0)),
      'c',    round(coalesce(nullif(v_comp->>'carbs_g','')::numeric,0)),
      'f',    round(coalesce(nullif(v_comp->>'fat_g','')::numeric,0)),
      't',    v_t,
      'mid',  v_meal_id,
      'cid',  v_comp_id
    ));
    v_pos := v_pos + 1;
  end loop;

  -- dual-write flat entries into the SAME table my.20fit reads
  insert into public.my20fit_daily_log (auth_user_id, log_date, cal_items)
    values (v_uid, v_today, v_items)
  on conflict (auth_user_id, log_date)
    do update set cal_items = coalesce(public.my20fit_daily_log.cal_items, '[]'::jsonb) || v_items,
                  updated_at = now()
  returning * into v_row;

  insert into public.ct_meal_audit (auth_user_id, meal_id, action, after)
    values (v_uid, v_meal_id, 'create',
            jsonb_build_object('meal', p_meal, 'components', p_components, 'logged', v_items));

  return jsonb_build_object('ok', true, 'meal_id', v_meal_id, 'log_date', v_row.log_date, 'cal_items', v_row.cal_items);
end;
$$;

-- Only signed-in users may call it (Postgres grants EXECUTE to PUBLIC by
-- default; revoke that so anon can't invoke a SECURITY DEFINER function —
-- it no-ops for anon anyway via the auth.uid() null check, but keep it tight).
revoke execute on function public.ct_log_meal(jsonb, jsonb) from public;
revoke execute on function public.ct_log_meal(jsonb, jsonb) from anon;
grant execute on function public.ct_log_meal(jsonb, jsonb) to authenticated;
