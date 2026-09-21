// Daily meal-plan generator, now sourced from my.20fit.id's Content API v1
// recipe catalog (via src/lib/contentRecipes.ts) instead of the local static
// food database. One recipe per meal slot (breakfast/lunch/dinner/snack),
// each the closest kcal match to that slot's share of the daily target among
// recipes not already used earlier the same day. A seed breaks ties among
// near-equally-close candidates so "regenerate" gives real variety.
import { MealType } from "./memberTracker";
import { ContentRecipe } from "./contentRecipes";

export interface PlanMealItem {
  key: string;
  name: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  emoji: string | null;
  photoUrl: string | null;
  servings: number | null;
}

export interface PlanMeal {
  meal: MealType;
  budget: number;
  items: PlanMealItem[];
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export interface DayPlan {
  meals: PlanMeal[];
  target: number;
  kcal: number;
  p: number;
  c: number;
  f: number;
}

// Share of the daily target per meal.
const MEAL_SHARE: Record<MealType, number> = { breakfast: 0.25, lunch: 0.35, dinner: 0.3, snack: 0.1 };
const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

// mulberry32 — tiny seeded PRNG so a given seed always picks the same recipe
// among tied candidates (stable per day; "regenerate" bumps the seed).
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toItem(r: ContentRecipe): PlanMealItem {
  return {
    key: r.key,
    name: r.name,
    kcal: r.kcal || 0,
    p: r.macros.p ?? 0,
    c: r.macros.c ?? 0,
    f: r.macros.f ?? 0,
    emoji: r.emoji,
    photoUrl: r.photo_url,
    servings: r.servings,
  };
}

/** Null when `recipes` is empty (e.g. the Content API key isn't set up yet on my.20fit.id) — callers show a fallback, never crash on it. */
export function generateMealPlanFromRecipes(recipes: ContentRecipe[], target: number, seed: number): DayPlan | null {
  const pool = recipes.filter((r) => r.kcal != null && r.kcal > 0);
  if (!pool.length) return null;

  const rand = mulberry32(seed);
  const used = new Set<string>();
  const meals: PlanMeal[] = MEAL_ORDER.map((meal) => {
    const budget = target * MEAL_SHARE[meal];
    const available = pool.filter((r) => !used.has(r.key));
    const candidates = (available.length ? available : pool)
      .map((r) => ({ r, dist: Math.abs((r.kcal || 0) - budget) }))
      .sort((a, b) => a.dist - b.dist);
    const near = candidates.filter((cand) => cand.dist <= budget * 0.35 + 40);
    const shortlist = (near.length ? near : candidates).slice(0, 4);
    const chosen = shortlist[Math.floor(rand() * shortlist.length)].r;
    used.add(chosen.key);
    const item = toItem(chosen);
    return { meal, budget: Math.round(budget), items: [item], kcal: item.kcal, p: item.p, c: item.c, f: item.f };
  });

  const t = meals.reduce(
    (acc, m) => ({ kcal: acc.kcal + m.kcal, p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );
  return { meals, target: Math.round(target), kcal: t.kcal, p: t.p, c: t.c, f: t.f };
}

/** Day-of-year, so the default plan is stable for a given calendar day. */
export function dayOfYearSeed(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}
