// Daily calorie/macro target formula — PORTED VERBATIM from my.20fit.id
// (repo PROFILE20FIT, js/nutrition.js `Nutrition.goalFor`/`macrosFor`),
// read directly from that repo's source before writing this file. That
// file's own comment calls it out as the "SATU SUMBER rumus kalori & makro
// (dipakai Home, Calorie Scan, Progress)" — the single source of truth my.
// 20fit.id itself uses everywhere it shows a daily target. Mirrored here so
// calorietracker shows the SAME number for the same account, since there is
// no API that returns this value (my.20fit.id computes it client-side, not
// server-side — verified: no /api/scan/insight route exists in server.js).
//
// Keep in sync by hand if my.20fit.id's js/nutrition.js ever changes — there
// is no shared package between the two repos.
import { MemberProfile } from "./memberTracker";

const ACTIVITY_FACTOR: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  // "very_active" is a valid my20fit_profile.activity_level value but has no
  // entry here — it falls through to the 1.375 default below, same as
  // "light". Copied as-is from the original for parity; not a bug I'm
  // introducing, not one I'm fixing here.
};

export function dailyCalorieGoal(p: MemberProfile | null): number {
  if (!p) return 2000;
  const w = Number(p.weight_kg), h = Number(p.height_cm), age = Number(p.age) || 25;
  if (!w || !h) return 2000;
  const bmr = 10 * w + 6.25 * h - 5 * age + (p.gender === "female" ? -161 : 5);
  const af = ACTIVITY_FACTOR[p.activity_level || ""] || 1.375;
  let tdee = bmr * af;
  const g = p.main_goal;
  tdee += g === "lose" ? -400 : g === "muscle" ? 300 : g === "fit" ? 100 : 0;
  return Math.max(1200, Math.round(tdee / 10) * 10);
}

export interface MacroTargets { p: number; c: number; f: number; }

export function dailyMacroTargets(p: MemberProfile | null, goalKcal: number): MacroTargets {
  const goal = Math.round(goalKcal || 0);
  const w = Number(p?.weight_kg) || 0;
  const g = p?.main_goal;
  const proteinG = w ? Math.round(w * (g === "muscle" ? 1.8 : g === "lose" ? 1.6 : 1.4)) : Math.round((goal * 0.25) / 4);
  const fatG = Math.round((goal * 0.25) / 9);
  let carbsG = Math.round((goal - proteinG * 4 - fatG * 9) / 4);
  if (carbsG < 0) carbsG = Math.round((goal * 0.45) / 4);
  return { p: proteinG, c: carbsG, f: fatG };
}
