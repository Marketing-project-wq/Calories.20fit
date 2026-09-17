// Client for my.20fit.id's GET /api/menu/recommend — the SAME public endpoint
// my.20fit.id/calories uses for its "fill the gap" food suggestions (served
// from the static js/recipes.js catalog, scored by remaining macros). Reused,
// not duplicated. No auth required.
//
// Reference (verified): server.js:4878-4893 in repo PROFILE20FIT.
import { API_BASE } from "./constants";

export interface MenuRecipe {
  id?: string | number;
  emoji?: string;
  tint?: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  nm?: { en?: string; id?: string };
}

export async function getMenuRecommend(rem: { p: number; c: number; f: number }, n = 3): Promise<MenuRecipe[]> {
  try {
    const url = `${API_BASE}/api/menu/recommend?p=${Math.max(0, rem.p)}&c=${Math.max(0, rem.c)}&f=${Math.max(0, rem.f)}&n=${n}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const j = await res.json();
    if (!j || !j.ok || !Array.isArray(j.recipes)) return [];
    return j.recipes as MenuRecipe[];
  } catch {
    return [];
  }
}
