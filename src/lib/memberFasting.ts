// Intermittent-fasting reminder for the Home page, read straight from
// my20fit_fasting (same table my.20fit.id's own fasting.js writes to —
// confirmed via information_schema + pg_policies before writing this: RLS
// scopes every row to auth.uid() = auth_user_id, same as my20fit_profile/
// my20fit_daily_log, so a logged-in session here can read it directly).
//
// This is DELIBERATELY a read-only reminder, not a port of fasting.js's full
// state machine (streaks, notifications, open/close-day bookkeeping) — see
// src/lib/myfitEmbed.ts for why that logic stays on my.20fit.id rather than
// being duplicated here. If the member hasn't set up a schedule yet, Home
// links out to my.20fit.id/calories to configure it there.
import { supabase } from "./supabase";

export interface FastingSettings {
  style: string | null; // e.g. "16:8", "18:6", "OMAD"
  start_time: string | null; // "HH:MM", start of the eating window
  eat_hours: number | null;
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function getFastingSettings(): Promise<FastingSettings | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data, error } = await supabase
    .from("my20fit_fasting")
    .select("style, start_time, eat_hours")
    .eq("auth_user_id", uid)
    .maybeSingle();
  if (error) throw error;
  return data as FastingSettings | null;
}

export type FastingStatus =
  | { state: "eating"; closesAt: string }
  | { state: "fasting"; opensAt: string; opensTomorrow: boolean }
  | { state: "unset" };

/** Pure so it's testable without a clock dependency — pass `now` explicitly. */
export function fastingStatus(settings: FastingSettings | null, now: Date = new Date()): FastingStatus {
  if (!settings?.start_time || !settings.eat_hours) return { state: "unset" };
  const [h, m] = settings.start_time.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return { state: "unset" };

  const start = new Date(now);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + settings.eat_hours * 3600_000);

  const fmt = (d: Date) => String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");

  if (now < start) return { state: "fasting", opensAt: fmt(start), opensTomorrow: false };
  if (now < end) return { state: "eating", closesAt: fmt(end) };
  return { state: "fasting", opensAt: fmt(start), opensTomorrow: true };
}
