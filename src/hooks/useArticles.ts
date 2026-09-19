import { useEffect, useState } from "react";
import { Article, STATIC_ARTICLES, fetchArticlesFromDb } from "../data/articles";

// Module-level cache: fetch the live DB list once per page load (SPA
// navigations reuse it), not once per component mount.
let cache: Article[] | null = null;

/**
 * Live article list for the Articles pages. Renders STATIC_ARTICLES
 * immediately (no loading flicker), then swaps in the live DB list once
 * fetched — so edits/additions made via the articles-api Edge Function show
 * up without a redeploy. `loaded` flips true once the DB fetch has settled
 * (success or failure), so callers can avoid a false "not found" for a
 * brand-new article that only exists in the DB, not in STATIC_ARTICLES.
 */
export function useArticles(): { articles: Article[]; loaded: boolean } {
  const [state, setState] = useState<{ articles: Article[]; loaded: boolean }>(() =>
    cache ? { articles: cache, loaded: true } : { articles: STATIC_ARTICLES, loaded: false }
  );

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    fetchArticlesFromDb().then((rows) => {
      if (cancelled) return;
      if (rows) cache = rows;
      setState({ articles: cache ?? STATIC_ARTICLES, loaded: true });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
