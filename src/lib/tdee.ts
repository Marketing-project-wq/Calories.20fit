// Standalone, evidence-based calorie calculator for the PUBLIC landing page
// (guest, no account needed). Mifflin-St Jeor equation — the formula the
// brief specifies and the one Mayo Clinic / ACSM use as the modern default
// (more accurate than the older Harris-Benedict for the general population,
// per Frankenfield DC et al. 2005, J Am Diet Assoc).
//
// DELIBERATELY SEPARATE from src/lib/nutrition.ts. That file mirrors
// my.20fit.id's own `Nutrition.goalFor` VERBATIM (activity keys + goal
// offsets of -400/+300/+100) so a logged-in member sees the exact same
// daily target here as on my.20fit.id. This file is the guest-facing quick
// estimate and follows the brief's numbers instead (-500 / maintain / +300,
// full 1.2–1.9 multiplier ladder including very_active). Keeping them apart
// means the member number never drifts from my.20fit.id and the public
// calculator can state the textbook figures the landing copy promises.

export type Gender = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // jarang / tidak olahraga
  light: 1.375, // olahraga ringan 1-3x/minggu
  moderate: 1.55, // olahraga sedang 3-5x/minggu
  active: 1.725, // olahraga berat 6-7x/minggu
  very_active: 1.9, // olahraga sangat berat / 2x sehari / pekerjaan fisik
};

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
];

export interface TdeeInput {
  gender: Gender;
  age: number; // tahun
  weightKg: number; // kg
  heightCm: number; // cm
  activity: ActivityLevel;
}

export interface TdeeResult {
  bmr: number; // Basal Metabolic Rate (kkal/hari)
  tdee: number; // Total Daily Energy Expenditure (kkal/hari)
  fatLoss: number; // TDEE - 500
  maintain: number; // TDEE
  muscleGain: number; // TDEE + 300
}

// Sensible guardrails so a mistyped value can't produce an absurd number.
// These are wide enough to cover essentially every real adult.
export const TDEE_BOUNDS = {
  age: { min: 13, max: 100 },
  weightKg: { min: 25, max: 300 },
  heightCm: { min: 100, max: 250 },
};

export function isValidTdeeInput(i: Partial<TdeeInput>): i is TdeeInput {
  if (i.gender !== "male" && i.gender !== "female") return false;
  if (!i.activity || !(i.activity in ACTIVITY_MULTIPLIERS)) return false;
  const inRange = (v: unknown, b: { min: number; max: number }) =>
    typeof v === "number" && Number.isFinite(v) && v >= b.min && v <= b.max;
  return (
    inRange(i.age, TDEE_BOUNDS.age) &&
    inRange(i.weightKg, TDEE_BOUNDS.weightKg) &&
    inRange(i.heightCm, TDEE_BOUNDS.heightCm)
  );
}

// BMR via Mifflin-St Jeor. Genderneutral base + a per-gender constant
// (+5 male, -161 female) exactly as the equation is published.
export function calcBmr(i: TdeeInput): number {
  const base = 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age;
  return base + (i.gender === "male" ? 5 : -161);
}

export function calcTdee(input: Partial<TdeeInput>): TdeeResult | null {
  if (!isValidTdeeInput(input)) return null;
  const bmr = calcBmr(input);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[input.activity];
  const round = (n: number) => Math.round(n);
  return {
    bmr: round(bmr),
    tdee: round(tdee),
    fatLoss: round(tdee - 500),
    maintain: round(tdee),
    muscleGain: round(tdee + 300),
  };
}

export type Goal = "fat_loss" | "maintain" | "muscle_gain";

export function targetForGoal(r: TdeeResult, goal: Goal): number {
  return goal === "fat_loss" ? r.fatLoss : goal === "muscle_gain" ? r.muscleGain : r.maintain;
}

export interface MacroSplit {
  proteinG: number;
  carbsG: number;
  fatG: number;
  proteinKcal: number;
  carbsKcal: number;
  fatKcal: number;
}

// Suggested macro split for a calorie target. Protein anchored to bodyweight
// (goal-dependent: higher on a cut/gain to protect or build muscle — within
// the ISSN 1.6-2.2 g/kg range for active people), fat at 25% of energy, the
// remainder to carbs. Mirrors the SHAPE of nutrition.ts's member split so the
// two never look contradictory, without importing its my.20fit.id-tied goals.
export function macrosForTarget(target: number, weightKg: number, goal: Goal): MacroSplit {
  const proteinPerKg = goal === "muscle_gain" ? 1.8 : goal === "fat_loss" ? 1.8 : 1.4;
  const proteinG = Math.round(weightKg * proteinPerKg);
  const fatG = Math.round((target * 0.25) / 9);
  let carbsG = Math.round((target - proteinG * 4 - fatG * 9) / 4);
  if (carbsG < 0) carbsG = 0;
  return {
    proteinG,
    carbsG,
    fatG,
    proteinKcal: proteinG * 4,
    carbsKcal: carbsG * 4,
    fatKcal: fatG * 9,
  };
}

// ---- Guest persistence -----------------------------------------------------
// The landing calculator result is stashed locally so a returning guest keeps
// their number and the meal-plan/teaser can reference it, WITHOUT an account.
// Wrapped in try/catch: private-mode / blocked storage must never break the
// page (same defensive posture the brief's guest features assume).
const STORE_KEY = "ct_tdee_v1";

export interface StoredTdee extends TdeeInput {
  result: TdeeResult;
  goal: Goal;
  savedAt: string;
}

export function saveTdee(input: TdeeInput, result: TdeeResult, goal: Goal): void {
  try {
    const payload: StoredTdee = { ...input, result, goal, savedAt: new Date().toISOString() };
    localStorage.setItem(STORE_KEY, JSON.stringify(payload));
  } catch {
    /* storage unavailable — the in-memory result still shows this session */
  }
}

export function loadTdee(): StoredTdee | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredTdee;
    if (!parsed?.result || typeof parsed.result.tdee !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}
