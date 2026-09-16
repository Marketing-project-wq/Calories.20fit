// Deterministic meal-plan generator built from the static food database.
// Given a daily calorie target it composes breakfast/lunch/dinner/snack from
// curated per-meal food pools, scaling the staple so each meal lands near its
// calorie budget. A seed makes it deterministic per day (so today's plan is
// stable) while "regenerate" varies it — the brief's "variasi setiap hari".
import { Food, getFood, scaleFood } from "../data/foods";
import { MealType } from "./memberTracker";

export interface PlanItem {
  food: Food;
  servings: number;
  kcal: number;
  p: number;
  c: number;
  f: number;
}

export interface PlanMeal {
  meal: MealType;
  budget: number;
  items: PlanItem[];
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

// Curated pools (food ids) so combinations read like real meals.
const POOLS = {
  breakfastMain: ["oatmeal", "roti-gandum", "roti-tawar-putih", "nasi-putih", "nasi-uduk"],
  breakfastProtein: ["telur-rebus", "telur-dadar", "tempe-kukus", "yogurt-plain"],
  breakfastExtra: ["pisang-ambon", "apel-merah", "pepaya", "susu-full-cream", "air-kelapa"],
  staple: ["nasi-putih", "nasi-merah", "kentang-rebus", "singkong-rebus", "ubi-rebus"],
  protein: ["dada-ayam-rebus", "ayam-goreng", "tongkol-goreng", "kembung-goreng", "lele-goreng", "tempe-goreng", "tahu-goreng", "rendang-sapi", "udang-rebus", "salmon-panggang"],
  veg: ["bayam-rebus", "brokoli-rebus", "kangkung-tumis", "wortel-rebus", "capcay", "sup-sayur", "terong-tumis"],
  snack: ["pisang-ambon", "apel-merah", "jeruk-manis", "almond", "yogurt-plain", "air-kelapa", "pir", "mangga", "keju-cheddar", "susu-kedelai"],
};

// mulberry32 — tiny seeded PRNG so plans are reproducible for a given seed.
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

function pick(ids: string[], rand: () => number): Food {
  const id = ids[Math.floor(rand() * ids.length) % ids.length];
  return getFood(id)!;
}

function makeItem(food: Food, servings: number): PlanItem {
  const s = Math.max(0.5, Math.round(servings * 2) / 2); // half-serving steps
  const n = scaleFood(food, s);
  return { food, servings: s, kcal: n.calories, p: n.protein, c: n.carbs, f: n.fat };
}

function sum(items: PlanItem[]) {
  return items.reduce(
    (acc, it) => ({ kcal: acc.kcal + it.kcal, p: acc.p + it.p, c: acc.c + it.c, f: acc.f + it.f }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );
}

function buildMeal(meal: MealType, budget: number, rand: () => number): PlanMeal {
  const items: PlanItem[] = [];
  if (meal === "snack") {
    const first = pick(POOLS.snack, rand);
    items.push(makeItem(first, 1));
    if (budget - items[0].kcal > 90) {
      let second = pick(POOLS.snack, rand);
      if (second.id === first.id) second = getFood("almond")!;
      items.push(makeItem(second, 1));
    }
  } else if (meal === "breakfast") {
    const protein = makeItem(pick(POOLS.breakfastProtein, rand), 1);
    const extra = makeItem(pick(POOLS.breakfastExtra, rand), 1);
    const mainFood = pick(POOLS.breakfastMain, rand);
    const remaining = budget - protein.kcal - extra.kcal;
    const servings = remaining > 0 ? remaining / mainFood.calories : 1;
    items.push(makeItem(mainFood, servings), protein, extra);
  } else {
    // lunch / dinner: staple (scaled) + protein + veg
    const protein = makeItem(pick(POOLS.protein, rand), 1);
    const veg = makeItem(pick(POOLS.veg, rand), 1);
    const stapleFood = pick(POOLS.staple, rand);
    const remaining = budget - protein.kcal - veg.kcal;
    const servings = remaining > 0 ? remaining / stapleFood.calories : 1;
    items.push(makeItem(stapleFood, servings), protein, veg);
  }
  const t = sum(items);
  return { meal, budget: Math.round(budget), items, ...t, kcal: Math.round(t.kcal), p: Math.round(t.p), c: Math.round(t.c), f: Math.round(t.f) };
}

export function generateMealPlan(target: number, seed: number): DayPlan {
  const rand = mulberry32(seed);
  const order: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
  const meals = order.map((m) => buildMeal(m, target * MEAL_SHARE[m], rand));
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
