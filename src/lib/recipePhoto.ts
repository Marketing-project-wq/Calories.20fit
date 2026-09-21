// Resolves a REAL photo for a recipe via my.20fit.id's public
// GET /api/menu/photo?id=&q=&mdb= endpoint — read directly from that repo's
// server.js (PROFILE20FIT) rather than guessed: it's CORS-enabled for any
// *.20fit.id origin, needs no auth, and is the exact endpoint my.20fit.id's
// own recipe/menu browsing pages (js/recipe-photos.js) use for this same
// official catalog, so most of the 120 recipes already have a cached photo
// from that traffic. Results are cached there server-side (Supabase table +
// 24h Cache-Control) KEYED BY RECIPE ID ALONE, so once an id has a photo,
// repeat calls are instant regardless of the query text passed. A
// never-before-resolved id can be slow (falls through to AI image
// generation), so callers must never block rendering on this — always
// fire-and-forget with an emoji/placeholder fallback (see RecipeThumb).
import { MY20FIT } from "./constants";

const cache = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

export function getRecipePhoto(id: string, name: string): Promise<string | null> {
  if (cache.has(id)) return Promise.resolve(cache.get(id) ?? null);
  const running = inflight.get(id);
  if (running) return running;

  const mdb = name.trim().split(/\s+/)[0] || name;
  const qs = new URLSearchParams({ id, q: name, mdb });
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 15000);

  const p = fetch(`${MY20FIT}/api/menu/photo?${qs.toString()}`, { signal: ctrl.signal })
    .then((res) => (res.ok ? res.json() : null))
    .then((j) => (j && j.ok && j.url ? (j.url as string) : null))
    .catch(() => null)
    .finally(() => {
      clearTimeout(timeout);
      inflight.delete(id);
    })
    .then((url) => {
      cache.set(id, url);
      return url;
    });

  inflight.set(id, p);
  return p;
}
