-- Lets a logged-in member "save to today's log" from calorietracker
-- (calories.20fit.id) straight into the SAME table my.20fit.id's own
-- /calories page already reads/writes: public.my20fit_daily_log.cal_items.
--
-- APPLIED to production (project cpvzwqptzcxnwzfzgrmt) 2026-08-30 via
-- Supabase MCP. This file is the source-of-truth copy tracked in this repo
-- (calorietracker has no migration runner of its own — same pattern as
-- 2026-08-28_guest_scan_quota.sql).
--
-- Why a new RPC instead of writing the table directly (RLS already allows
-- `auth.uid() = auth_user_id` on my20fit_daily_log for SELECT/INSERT/UPDATE):
-- my.20fit.id's own client (js/auth.js `Auth.saveDaily`) does a plain
-- "read whole cal_items array into memory, mutate locally, upsert whole
-- array back" — fine for a single app, but now that TWO origins
-- (my.20fit.id and calorietracker) can both append to the same user's log,
-- a naive read-modify-write from calorietracker risks a lost update if the
-- user has both open at once (device A appends, device B still holds the
-- old array, saves it back, silently dropping A's item). This RPC does the
-- append atomically inside Postgres (`cal_items || jsonb_build_array(...)`
-- inside a single UPDATE), so no read-your-own-write race is possible.
--
-- Item shape matches exactly what my.20fit.id's own calories.html already
-- writes (verified against live production rows before writing this):
--   { "name": text, "kcal": number, "p": grams protein, "c": grams carbs,
--     "f": grams fat, "t": "HH:MM" local time }
-- calorietracker MUST build items in this exact shape so my.20fit.id's
-- /calories page renders them identically to its own scans.
--
-- Purely additive: does not touch my20fit_scan_ledger, my20fit_profile, or
-- any existing RPC. `log_date` uses Asia/Jakarta, same convention as every
-- other my20fit_* RPC (my20fit_scan_balance, my20fit_guest_consume_scan,
-- etc.) — NOT the browser-local date my.20fit.id's own client computes
-- client-side (todayStr() in js/auth.js). For the vast majority of users
-- (Indonesian, per CLAUDE.md) these agree; a user scanning near midnight in
-- a very different timezone could in theory land on a different log_date
-- than my.20fit.id's own client would pick for the same moment. Accepted
-- trade-off for consistency with the rest of this schema, not a new risk
-- this migration introduces.

create or replace function public.my20fit_append_daily_food_item(p_item jsonb)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_uid   uuid := auth.uid();
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_row   public.my20fit_daily_log;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'code', 'not_authenticated');
  end if;
  if p_item is null or jsonb_typeof(p_item) <> 'object' then
    return jsonb_build_object('ok', false, 'code', 'invalid_item');
  end if;

  insert into public.my20fit_daily_log (auth_user_id, log_date, cal_items)
    values (v_uid, v_today, jsonb_build_array(p_item))
  on conflict (auth_user_id, log_date)
    do update set
      cal_items = coalesce(public.my20fit_daily_log.cal_items, '[]'::jsonb) || jsonb_build_array(p_item),
      updated_at = now()
  returning * into v_row;

  return jsonb_build_object(
    'ok', true,
    'log_date', v_row.log_date,
    'cal_items', v_row.cal_items
  );
end;
$$;

grant execute on function public.my20fit_append_daily_food_item(jsonb) to authenticated;
