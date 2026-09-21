// Picks nutrition articles relevant to today's tracked calories/macros, for
// the tracker's "Artikel Nutrisi untuk Kamu" section. Reads the SAME article
// list src/data/articles.ts + useArticles() already serve the standalone
// Articles pages from (public.nutrition_articles) — no separate fetch, no
// new API key, just a different ranking over data the app already has.
//
// This app has no per-day "did you exercise today" log (only a static
// profile-level `activity_level`), so the "user aktif olahraga hari ini"
// rule is approximated with activity_level "moderate"/"active" rather than
// a same-day signal that doesn't exist here.
import { Article } from "../data/articles";

export interface ArticleRecsInput {
  articles: Article[];
  loggedToday: boolean; // any food logged today (totals.n > 0)
  proteinPct: number; // consumed protein / target protein, today (1 when target is 0)
  remainingPct: number; // (target kcal - consumed kcal) / target kcal, today
  mainGoal: string | null; // profile.main_goal: "lose" | "muscle" | "fit" | null
  activityLevel: string | null; // profile.activity_level
  bigGap: "p" | "c" | "f" | null; // FS.nutrientGap().big, or null once macros are met
  limit?: number;
}

const BEGINNER = ["memahami-kalori-dan-makronutrien", "cara-hitung-kebutuhan-kalori-harian"];

export function recommendArticles(input: ArticleRecsInput): Article[] {
  const { articles, loggedToday, proteinPct, remainingPct, mainGoal, activityLevel, bigGap, limit = 3 } = input;
  const bySlug = new Map(articles.map((a) => [a.slug, a]));
  const picked: Article[] = [];
  const add = (slug: string) => {
    const a = bySlug.get(slug);
    if (a && !picked.includes(a)) picked.push(a);
  };

  if (!loggedToday) {
    BEGINNER.forEach(add);
  } else {
    if (proteinPct < 0.3) add("protein-kebutuhan-sumber-dan-waktu-terbaik");
    if (activityLevel === "moderate" || activityLevel === "active") {
      add("nutrisi-untuk-olahraga-dan-fitness");
      add("hidrasi-air-putih-dan-performa-olahraga");
    }
    if (mainGoal === "lose") {
      add("cara-sehat-turun-berat-badan");
      add("gula-tambahan-dan-kalori-tersembunyi");
    }
    if (remainingPct > 0.4) {
      add("meal-prep-dasar-untuk-pemula");
      if (bigGap === "c") add("serat-pencernaan-dan-kontrol-berat-badan");
    }
  }

  // Fill remaining slots with the most recent articles, skipping picks already made.
  if (picked.length < limit) {
    const rest = [...articles].filter((a) => !picked.includes(a)).sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
    for (const a of rest) {
      if (picked.length >= limit) break;
      picked.push(a);
    }
  }

  return picked.slice(0, limit);
}
