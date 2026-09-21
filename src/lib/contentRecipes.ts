// Client for the content-recipes Supabase Edge Function — a server-side
// proxy for my.20fit.id's Content API v1 (GET /api/content/v1/recipes),
// which is key-gated and deliberately server-to-server only (no CORS on the
// upstream API). The edge function holds that key (public.ct_secrets,
// service-role-only) and injects it, so this client never sees or sends any
// secret of its own — just the Supabase anon key, same as every other edge
// function call in this app.
import { SUPABASE } from "./constants";
import { Lang } from "./i18n";

export interface RecipeMacros {
  p: number | null;
  c: number | null;
  f: number | null;
  fiber: number | null;
  sugar: number | null;
  sodium: number | null;
}

export interface ContentRecipe {
  key: string; // "official:<id>" | "member:<uuid>" — pass to getContentRecipe()
  source: "official" | "member";
  id: string;
  name: string;
  kcal: number | null;
  macros: RecipeMacros;
  nutrition_is_estimate: true;
  diet_types: string[];
  category: string | null;
  ingredients: string;
  steps: string;
  servings: number | null;
  cook_minutes: number | null;
  prep_minutes: number | null;
  equipment: string | null;
  prep_note: string | null;
  photo_url: string | null;
  emoji: string | null;
  contributor: string;
}

const FN_URL = `${SUPABASE.URL}/functions/v1/content-recipes`;

async function callFn(path: string, params: Record<string, string | number | undefined>): Promise<Response> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== "") qs.set(k, String(v)); });
  const url = `${FN_URL}${path}${qs.toString() ? "?" + qs.toString() : ""}`;
  return fetch(url, {
    headers: { Authorization: "Bearer " + SUPABASE.ANON_KEY, apikey: SUPABASE.ANON_KEY },
  });
}

// Shape of an item from my.20fit.id's public, no-auth /api/menu/catalog —
// the same underlying 20FIT official recipe catalog the gated Content API
// v1 serves, just without the key gate (confirmed live: identical data).
// Used as a fallback so menu features work immediately while
// CONTENT_API_KEYS is still being registered upstream, and keeps working
// as a backstop afterward if that key ever lapses.
interface PublicCatalogRecipe {
  id: string | number;
  emoji?: string | null;
  kcal?: number | null;
  p?: number | null;
  c?: number | null;
  f?: number | null;
  types?: string[] | null;
  cat?: string | null;
  servings?: number | null;
  cookMinutes?: number | null;
  nm?: { en?: string; id?: string };
  ing?: { en?: string; id?: string };
  steps?: { en?: string; id?: string };
}

function fromPublicCatalog(r: PublicCatalogRecipe, lang: Lang): ContentRecipe {
  const id = String(r.id);
  return {
    key: `official:${id}`,
    source: "official",
    id,
    name: r.nm?.[lang] || r.nm?.en || r.nm?.id || "",
    kcal: r.kcal ?? null,
    macros: { p: r.p ?? null, c: r.c ?? null, f: r.f ?? null, fiber: null, sugar: null, sodium: null },
    nutrition_is_estimate: true,
    diet_types: r.types ?? [],
    category: r.cat ?? null,
    ingredients: r.ing?.[lang] || r.ing?.en || r.ing?.id || "",
    steps: r.steps?.[lang] || r.steps?.en || r.steps?.id || "",
    servings: r.servings ?? null,
    cook_minutes: r.cookMinutes ?? null,
    prep_minutes: null,
    equipment: null,
    prep_note: null,
    photo_url: null,
    emoji: r.emoji ?? null,
    contributor: "20FIT Kitchen",
  };
}

// Public, no-auth fallback — called directly from the browser (no CORS
// issue: this endpoint is meant for client use, unlike Content API v1).
async function getPublicCatalogFallback(lang: Lang, limit: number): Promise<ContentRecipe[]> {
  try {
    const res = await fetch(`https://my.20fit.id/api/menu/catalog?limit=${limit}`);
    if (!res.ok) return [];
    const j = await res.json();
    const items: PublicCatalogRecipe[] = Array.isArray(j) ? j : Array.isArray(j?.recipes) ? j.recipes : Array.isArray(j?.items) ? j.items : [];
    return items.map((r) => fromPublicCatalog(r, lang));
  } catch {
    return [];
  }
}

/** Recipe catalog (official + member-approved). Tries the gated Content API v1 first (richest data, includes member recipes once CONTENT_API_KEYS is registered upstream); falls back to the public, no-auth catalog so the feature works today. Empty array only if both fail — callers treat that as "no recipes available", never a hard error. */
export async function getContentRecipes(opts: { lang?: Lang; source?: "all" | "official" | "member"; diet?: string; q?: string; limit?: number } = {}): Promise<ContentRecipe[]> {
  const lang: Lang = opts.lang ?? "id";
  const limit = opts.limit ?? 50;
  try {
    const res = await callFn("", { lang: opts.lang, source: opts.source, diet: opts.diet, q: opts.q, limit });
    if (res.ok) {
      const j = await res.json();
      if (j && j.ok && Array.isArray(j.recipes) && j.recipes.length) return j.recipes as ContentRecipe[];
    }
  } catch {
    // fall through to public fallback
  }
  return getPublicCatalogFallback(lang, limit);
}

// recipe.20fit.id's own recipe-catalog SPA reads a detail page at
// /resep/:source/:id (source = "official" | "member", id = the bare id —
// NOT the "source:id" composite `key` this API returns; that composite only
// makes sense to my.20fit.id's own /recipes/:key endpoint). Route confirmed
// from that app's own router (src/router.tsx: `resep/${source}/${id}` — a
// two-segment path, not the joined key). Used to deep-link a recipe card
// straight to its full page on recipe.20fit.id.
export function recipeDetailUrl(key: string): string {
  const i = key.indexOf(":");
  const source = i > 0 ? key.slice(0, i) : "official";
  const id = i > 0 ? key.slice(i + 1) : key;
  return `https://recipe.20fit.id/resep/${encodeURIComponent(source)}/${encodeURIComponent(id)}`;
}

export async function getContentRecipe(key: string, lang?: Lang): Promise<ContentRecipe | null> {
  try {
    const res = await callFn(`/${encodeURIComponent(key)}`, { lang });
    if (!res.ok) return null;
    const j = await res.json();
    if (!j || !j.ok || !j.recipe) return null;
    return j.recipe as ContentRecipe;
  } catch {
    return null;
  }
}
