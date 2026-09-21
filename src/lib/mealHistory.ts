// Rich meal history for logged-in members — reads ct_meal + ct_meal_component
// (supabase/migrations/2026-09-18_ct_meal_schema.sql), the structured record
// ScanResultModal.tsx writes via ct_log_meal at scan time (tags, health/satiety
// score, overall analysis, recommendation, per-component verdict — the exact
// same data the "Analisa makanan" sheet showed right after the scan).
//
// HistoryPage looks up a logged item's meal by its `mid` (see DailyFoodItem in
// memberTracker.ts) to show that same rich breakdown in /history, instead of
// re-deriving a generic verdict from name/macros alone. Items with no `mid`
// (manually typed food, or anything logged before ct_meal existed) have no
// entry here — the caller falls back to foodSummary.itemVerdict() for those.
import { supabase } from "./supabase";

export interface MealTag {
  label: string;
  positive: boolean;
}

export interface MealComponent {
  id: string;
  position: number;
  name: string;
  portion: string | null;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  verdict_band: "good" | "ok" | "bad" | null;
  verdict_label: string | null;
  verdict_reason: string | null;
  swap_to: string | null;
}

export interface Meal {
  id: string;
  log_date: string;
  title: string | null;
  total_kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  kcal_min: number | null;
  kcal_max: number | null;
  confidence: number | null;
  health_score: number | null;
  satiety_score: number | null;
  satiety_note: string | null;
  description: string | null;
  overall: string | null;
  recommendation: string | null;
  tags: MealTag[] | null;
  needs_more: string[] | null;
  insights: string[] | null;
  components: MealComponent[];
}

const HISTORY_DAYS = 14;

/** Meals logged over the last HISTORY_DAYS, keyed by ct_meal.id for O(1) lookup by a cal_items entry's `mid`. */
export async function getRecentMeals(): Promise<Map<string, Meal>> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  const map = new Map<string, Meal>();
  if (!uid) return map;

  const since = new Date();
  since.setDate(since.getDate() - HISTORY_DAYS);
  const sinceStr = since.getFullYear() + "-" + String(since.getMonth() + 1).padStart(2, "0") + "-" + String(since.getDate()).padStart(2, "0");

  const { data, error } = await supabase
    .from("ct_meal")
    .select(
      "id, log_date, title, total_kcal, protein_g, carbs_g, fat_g, fiber_g, kcal_min, kcal_max, confidence, health_score, satiety_score, satiety_note, description, overall, recommendation, tags, needs_more, insights, ct_meal_component(id, position, name, portion, kcal, protein_g, carbs_g, fat_g, fiber_g, verdict_band, verdict_label, verdict_reason, swap_to, deleted_at)"
    )
    .eq("auth_user_id", uid)
    .is("deleted_at", null)
    .gte("log_date", sinceStr)
    .order("log_date", { ascending: false });
  if (error) throw error;

  for (const row of data || []) {
    const components = ((row.ct_meal_component as (MealComponent & { deleted_at: string | null })[] | null) || [])
      .filter((c) => !c.deleted_at)
      .sort((a, b) => a.position - b.position);
    map.set(row.id as string, { ...(row as Omit<Meal, "components" | "ct_meal_component">), components } as Meal);
  }
  return map;
}
