// Data layer for the "already have an account" tracker experience on
// calorietracker.20fit.id. Talks to Supabase DIRECTLY (not through
// my.20fit.id's server) because calorietracker and my.20fit.id share the
// SAME Supabase project (cpvzwqptzcxnwzfzgrmt) and the SAME auth.users —
// confirmed by reading my.20fit.id's own source (repo PROFILE20FIT) before
// building this. `my20fit_profile` and `my20fit_daily_log` both already
// have RLS policies scoping every row to `auth.uid() = auth_user_id`, so a
// logged-in session from either app can read/write its own rows straight
// away — no bridge API needed for this data.
import { supabase } from "./supabase";
import { ensureProfile } from "./authApi";

export interface DailyFoodItem {
  name: string;
  kcal: number;
  p: number; // protein, grams
  c: number; // carbs, grams
  f: number; // fat, grams
  t: string; // "HH:MM", local time logged
  // Optional meal bucket. ADDITIVE to the cal_items shape my.20fit.id shares:
  // my.20fit.id only reads name/kcal/p/c/f/t, so this extra key is preserved
  // by the append RPC and safely ignored there. Items created before this (or
  // from my.20fit.id / photo-scan saves) have no `m` — itemMeal() infers one
  // from the time so grouping still works for every item.
  m?: MealType;
  // mid/cid: also additive (my.20fit.id ignores them too — see
  // ct_log_meal in 2026-09-18_ct_meal_schema.sql). Present only on items
  // logged through the native AI scan flow; they point at the full
  // ct_meal/ct_meal_component row (tags, health/satiety score, analysis,
  // recommendation) that src/lib/mealHistory.ts fetches for History to show
  // the same rich breakdown ScanResultModal showed right after the scan.
  // Absent on manually-typed food, or on anything logged before this existed
  // — those fall back to the deterministic foodSummary.itemVerdict() re-derivation.
  mid?: string;
  cid?: string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

/** Bucket an un-tagged item by the hour it was logged. */
export function inferMeal(t: string): MealType {
  const h = parseInt(String(t || "").slice(0, 2), 10);
  if (Number.isNaN(h)) return "snack";
  if (h < 10) return "breakfast"; // pagi
  if (h < 15) return "lunch"; // siang
  if (h < 21) return "dinner"; // malam
  return "snack";
}

export function itemMeal(item: DailyFoodItem): MealType {
  return item.m && MEAL_TYPES.includes(item.m) ? item.m : inferMeal(item.t);
}

export interface MemberProfile {
  auth_user_id: string | null;
  email: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  gender: "male" | "female" | null;
  activity_level: string | null;
  main_goal: string | null;
  full_name: string | null;
  onboarding_completed: boolean | null;
}

// A member still needs onboarding when they have no profile row yet, haven't
// completed onboarding, or are missing the core inputs the calorie/macro
// targets need (weight + height). Used to route a freshly-signed-in member to
// the onboarding form before the tracker.
export function needsOnboarding(p: MemberProfile | null): boolean {
  if (!p) return true;
  if (p.onboarding_completed === true) return false;
  return !p.weight_kg || !p.height_cm;
}

// my.20fit.id's own client (js/auth.js `todayStr()`) uses the BROWSER's
// local date for `log_date` — matched here on purpose so a scan saved from
// calorietracker lands on the same calendar day my.20fit.id would pick for
// the same moment, on the same device.
function todayStr(): string {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function getMemberProfile(): Promise<MemberProfile | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data, error } = await supabase
    .from("my20fit_profile")
    .select("auth_user_id, email, weight_kg, height_cm, age, gender, activity_level, main_goal, full_name, onboarding_completed")
    .eq("auth_user_id", uid)
    .maybeSingle();
  if (error) throw error;
  return data as MemberProfile | null;
}

export interface ProfileGoalsInput {
  weight_kg?: number;
  height_cm?: number;
  activity_level?: string;
  main_goal?: string;
}

// Partial profile update for the "edit goals" panel on /history — only the
// inputs dailyCalorieGoal/dailyMacroTargets actually use. Deliberately NOT
// authApi.ts's saveOnboarding(): that always writes gender + derives age
// from a birthdate, so reusing it here for a partial edit would clobber
// gender to null whenever it's called without one.
export async function updateProfileGoals(input: ProfileGoalsInput): Promise<void> {
  const uid = await currentUserId();
  if (!uid) throw new Error("not_authenticated");
  // Guarantee the row exists first — an UPDATE against a missing row affects
  // 0 rows without erroring, which would otherwise silently no-op (and still
  // report success) for a member who reached /history without ever finishing
  // onboarding.
  await ensureProfile();
  const upd: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.weight_kg != null) upd.weight_kg = input.weight_kg;
  if (input.height_cm != null) upd.height_cm = input.height_cm;
  if (input.activity_level) upd.activity_level = input.activity_level;
  if (input.main_goal) upd.main_goal = input.main_goal;
  const { error } = await supabase.from("my20fit_profile").update(upd).eq("auth_user_id", uid);
  if (error) throw error;
}

export async function getTodayFoodItems(): Promise<DailyFoodItem[]> {
  const uid = await currentUserId();
  if (!uid) return [];
  const { data, error } = await supabase
    .from("my20fit_daily_log")
    .select("cal_items")
    .eq("auth_user_id", uid)
    .eq("log_date", todayStr())
    .maybeSingle();
  if (error) throw error;
  return ((data?.cal_items as DailyFoodItem[] | null) || []).filter(Boolean);
}

// Atomic append via RPC (public.my20fit_append_daily_food_item) instead of a
// client read-modify-write upsert — safe even if the user has my.20fit.id
// open in another tab/device at the same time. Returns the full updated
// list so the UI can render it without a second round-trip.
export async function appendTodayFoodItem(item: DailyFoodItem): Promise<DailyFoodItem[]> {
  const { data, error } = await supabase.rpc("my20fit_append_daily_food_item", { p_item: item });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.code || "save_failed");
  return (data.cal_items as DailyFoodItem[]) || [];
}

// Overwrite today's whole food-log array. Used for DELETE/edit, where the
// atomic-append RPC does not apply. Mirrors my.20fit.id's own client behaviour
// (js/auth.js Auth.saveDaily: read array, mutate locally, upsert whole array).
// RLS (auth.uid() = auth_user_id) scopes the row to the current user.
export async function saveTodayFoodItems(items: DailyFoodItem[]): Promise<void> {
  const uid = await currentUserId();
  if (!uid) throw new Error("not_authenticated");
  const { error } = await supabase.from("my20fit_daily_log").upsert(
    {
      auth_user_id: uid,
      log_date: todayStr(),
      cal_items: items,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "auth_user_id,log_date" }
  );
  if (error) throw error;
}

export function nowHHMM(): string {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
