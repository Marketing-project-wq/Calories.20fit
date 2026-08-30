// Real food-log history for logged-in members, read straight from
// my20fit_daily_log (same table my.20fit.id's own /calories page reads).
// Replaces a previous implementation that called /api/scan/history — an
// endpoint that does not exist on my.20fit.id's backend (verified against
// its server.js source before writing this), so it never actually worked
// for a real member.
import { supabase } from "./supabase";
import { DailyFoodItem } from "./memberTracker";

export interface HistoryDay {
  log_date: string; // "YYYY-MM-DD"
  items: DailyFoodItem[];
}

const HISTORY_DAYS = 14;

export async function getRecentHistory(): Promise<HistoryDay[]> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return [];

  const since = new Date();
  since.setDate(since.getDate() - HISTORY_DAYS);
  const sinceStr = since.getFullYear() + "-" + String(since.getMonth() + 1).padStart(2, "0") + "-" + String(since.getDate()).padStart(2, "0");

  const { data, error } = await supabase
    .from("my20fit_daily_log")
    .select("log_date, cal_items")
    .eq("auth_user_id", uid)
    .gte("log_date", sinceStr)
    .order("log_date", { ascending: false });
  if (error) throw error;

  return (data || [])
    .map(row => ({ log_date: row.log_date as string, items: ((row.cal_items as DailyFoodItem[] | null) || []).filter(Boolean) }))
    .filter(day => day.items.length > 0);
}
