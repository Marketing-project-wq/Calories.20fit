// Faithful port of my.20fit.id js/nutrition.js FOODS + mealFor — the source of
// the scan modal's "Healthier options — same calories". A STATIC curated list
// (not AI, not DB): composes a healthy set of distinct items summing close to a
// target kcal, protein first then variety. Kept as a clear reference table (no
// hardcoded logic buried in the UI).
import { Lang } from "./i18n";

export interface HealthyFood {
  en: string;
  id: string;
  kcal: number;
  tag: "protein" | "carb" | "fat" | "veg" | "fruit";
}

// Verbatim from js/nutrition.js.
export const HEALTHY_FOODS: HealthyFood[] = [
  { en: "Grilled chicken breast (150g)", id: "Dada ayam panggang (150g)", kcal: 250, tag: "protein" },
  { en: "Steamed white fish (120g)", id: "Ikan kukus (120g)", kcal: 180, tag: "protein" },
  { en: "2 boiled eggs", id: "2 telur rebus", kcal: 155, tag: "protein" },
  { en: "Grilled tempeh (100g)", id: "Tempe bakar (100g)", kcal: 190, tag: "protein" },
  { en: "Tofu (100g)", id: "Tahu (100g)", kcal: 145, tag: "protein" },
  { en: "Edamame (100g)", id: "Edamame (100g)", kcal: 120, tag: "protein" },
  { en: "Greek yogurt (150g)", id: "Greek yogurt (150g)", kcal: 130, tag: "protein" },
  { en: "Steamed rice (100g)", id: "Nasi putih (100g)", kcal: 130, tag: "carb" },
  { en: "Brown rice (100g)", id: "Nasi merah (100g)", kcal: 120, tag: "carb" },
  { en: "Sweet potato (150g)", id: "Ubi kukus (150g)", kcal: 130, tag: "carb" },
  { en: "Oatmeal bowl", id: "Semangkuk oatmeal", kcal: 150, tag: "carb" },
  { en: "Handful of almonds", id: "Segenggam almond", kcal: 160, tag: "fat" },
  { en: "Avocado (half)", id: "Alpukat (setengah)", kcal: 120, tag: "fat" },
  { en: "Mixed green salad", id: "Salad sayur", kcal: 90, tag: "veg" },
  { en: "Vegetable soup", id: "Sup sayur bening", kcal: 85, tag: "veg" },
  { en: "Banana", id: "Pisang", kcal: 105, tag: "fruit" },
  { en: "Apple", id: "Apel", kcal: 95, tag: "fruit" },
];

// Compose a healthy set of distinct items summing close to `target` kcal,
// preferring one protein first, then filling with variety. Port of mealFor().
export function healthyMealFor(target: number, maxItems = 4): HealthyFood[] {
  target = Math.round(Number(target) || 0);
  if (target < 60) return [];
  const pool = HEALTHY_FOODS.slice().sort((a, b) => b.kcal - a.kcal);
  const out: HealthyFood[] = [];
  const used: Record<string, boolean> = {};
  let rem = target;

  const take = (pred: (f: HealthyFood) => boolean): boolean => {
    for (const f of pool) {
      if (used[f.en]) continue;
      if (pred(f)) {
        used[f.en] = true;
        out.push(f);
        rem -= f.kcal;
        return true;
      }
    }
    return false;
  };

  if (rem > 120) take((f) => f.tag === "protein" && f.kcal <= rem + 40);
  while (out.length < maxItems && rem > 55) {
    if (take((f) => f.tag !== "protein" && f.kcal <= rem + 25)) continue;
    if (take((f) => f.kcal <= rem + 25)) continue;
    break;
  }
  if (!out.length) take(() => true);
  return out;
}

export function healthyTotalKcal(list: HealthyFood[]): number {
  return (list || []).reduce((s, f) => s + (Number(f.kcal) || 0), 0);
}

export function healthyName(f: HealthyFood, lang: Lang): string {
  return lang === "id" ? f.id : f.en;
}
