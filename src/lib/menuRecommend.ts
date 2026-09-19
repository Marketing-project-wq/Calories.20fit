// "Fill the gap" menu suggestions for the tracker's bottom panel — now
// sourced from my.20fit.id's Content API v1 recipe catalog (via the
// content-recipes edge function, see src/lib/contentRecipes.ts) instead of
// the old public /api/menu/recommend endpoint. The Content API is a plain
// browsable catalog (no server-side "closest to remaining macros" ranking),
// so that ranking now happens here: fetch a batch, score each recipe by
// distance to the remaining protein/carbs/fat, return the closest N.
import { Lang } from "./i18n";
import { getContentRecipes } from "./contentRecipes";

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

export async function getMenuRecommend(rem: { p: number; c: number; f: number }, n = 3, lang: Lang = "id"): Promise<MenuRecipe[]> {
  const recipes = await getContentRecipes({ lang, source: "all", limit: 60 });
  if (!recipes.length) return [];

  const p = Math.max(0, rem.p), c = Math.max(0, rem.c), f = Math.max(0, rem.f);
  const scored = recipes
    .filter((r) => r.kcal != null)
    .map((r) => {
      const rp = r.macros.p ?? 0, rc = r.macros.c ?? 0, rf = r.macros.f ?? 0;
      // Distance to the remaining macros — grams, so no normalization needed
      // beyond weighting fat a bit less (9 kcal/g vs 4, so a few grams off
      // matters less to the total than the same gap in protein/carbs).
      const dist = Math.abs(rp - p) + Math.abs(rc - c) + Math.abs(rf - f) * 0.6;
      return { r, dist };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, n);

  return scored.map(({ r }) => ({
    id: r.key,
    emoji: r.emoji || "🍲",
    kcal: r.kcal || 0,
    p: r.macros.p ?? 0,
    c: r.macros.c ?? 0,
    f: r.macros.f ?? 0,
    nm: { id: r.name, en: r.name },
  }));
}
