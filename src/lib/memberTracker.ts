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

export interface DailyFoodItem {
  name: string;
  kcal: number;
  p: number; // protein, grams
  c: number; // carbs, grams
  f: number; // fat, grams
  t: string; // "HH:MM", local time logged
}

export interface MemberProfile {
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  gender: "male" | "female" | null;
  activity_level: string | null;
  main_goal: string | null;
  full_name: string | null;
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
    .select("weight_kg, height_cm, age, gender, activity_level, main_goal, full_name")
    .eq("auth_user_id", uid)
    .maybeSingle();
  if (error) throw error;
  return data as MemberProfile | null;
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

export function nowHHMM(): string {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}
