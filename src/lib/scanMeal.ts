// Client for the ct_log_meal RPC — the SINGLE-TRANSACTION write that persists a
// scanned meal (ct_meal + ct_meal_component), dual-writes the flat entries to
// my20fit_daily_log.cal_items (so my.20fit.id stays consistent), and appends an
// audit row — all atomically with full rollback on failure (see
// supabase/migrations/2026-09-18_ct_meal_schema.sql).
import { supabase } from "./supabase";
import { DailyFoodItem } from "./memberTracker";

export interface MealComponentPayload {
  name: string;
  portion?: string;
  grams?: number;
  kcal: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  confidence?: number;
  verdict_band?: string;
  verdict_label?: string;
  verdict_reason?: string;
  swap_to?: string;
  item_source?: string; // ai | user | 20fit_ref
}

export interface MealPayload {
  source?: string; // photo_scan | text | manual
  title?: string;
  total_kcal?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  fiber_g?: number;
  kcal_min?: number;
  kcal_max?: number;
  confidence?: number;
  health_score?: number;
  satiety_score?: number;
  satiety_note?: string;
  description?: string;
  overall?: string;
  recommendation?: string;
  tags?: unknown;
  needs_more?: unknown;
  insights?: unknown;
  assumptions?: unknown;
}

// Log a full meal atomically. Returns the updated today's food-log array (same
// shape the tracker renders) on success.
export async function logMeal(meal: MealPayload, components: MealComponentPayload[]): Promise<DailyFoodItem[]> {
  const { data, error } = await supabase.rpc("ct_log_meal", { p_meal: meal, p_components: components });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.code || "log_failed");
  return (data.cal_items as DailyFoodItem[]) || [];
}
