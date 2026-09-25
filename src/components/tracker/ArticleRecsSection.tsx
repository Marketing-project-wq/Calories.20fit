// "Artikel Nutrisi untuk Kamu" — nutrition article recommendations driven by
// today's tracked calories/macros (ranking logic in src/lib/articleRecommend.ts).
// Reuses the same nutrition_articles data + useArticles() the standalone
// Articles pages already read, and links to this app's own /articles/:slug
// page (src/pages/ArticleDetailPage.tsx) — not an external recipe.20fit.id
// URL, since these articles are served locally here, not on that domain.
import { Lang } from "../../lib/i18n";
import { cc } from "../../lib/calorieCopy";
import { ROUTES } from "../../lib/constants";
import { Link } from "../../lib/router";
import { Icon } from "../Icon";
import { CATEGORY_LABELS } from "../../data/articles";
import { useArticles } from "../../hooks/useArticles";
import { recommendArticles } from "../../lib/articleRecommend";
import * as FS from "../../lib/foodSummary";

const MUTED = "var(--text-subtle)";

export function ArticleRecsSection({
  lang,
  loggedToday,
  macroT,
  proteinConsumed,
  goal,
  left,
  mainGoal,
  activityLevel,
  gap,
}: {
  lang: Lang;
  loggedToday: boolean;
  macroT: { p: number; c: number; f: number };
  proteinConsumed: number;
  goal: number;
  left: number;
  mainGoal: string | null;
  activityLevel: string | null;
  gap: FS.NutrientGap;
}) {
  const a = cc(lang).articles;
  const { articles } = useArticles();

  const proteinPct = macroT.p > 0 ? proteinConsumed / macroT.p : 1;
  const remainingPct = goal > 0 ? left / goal : 0;
  const bigGap = gap.met ? null : gap.big;

  const picks = recommendArticles({ articles, loggedToday, proteinPct, remainingPct, mainGoal, activityLevel, bigGap, limit: 3 });
  if (!picks.length) return null;

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: MUTED, fontWeight: 700, margin: "18px 2px 8px" }}>
        {lang === "id" ? "Artikel Nutrisi untuk Kamu" : "Nutrition Articles for You"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
        {picks.map((art) => (
          <Link
            key={art.slug}
            href={ROUTES.article(art.slug)}
            className="sc-card"
            style={{ display: "flex", flexDirection: "column", background: "var(--surface)", border: "1px solid var(--glass-hi)", borderRadius: 16, overflow: "hidden", textDecoration: "none", color: "inherit", boxShadow: "var(--glass-shadow)" }}
          >
            <div style={{ height: 100, background: `linear-gradient(135deg, ${art.accent}26, ${art.accent}0a)`, display: "flex", alignItems: "center", justifyContent: "center", color: art.accent, position: "relative", overflow: "hidden" }}>
              <Icon name={art.coverIcon} size={34} strokeWidth={1.5} />
              <img
                src={art.coverPhoto}
                alt=""
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", flex: 1 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: art.accent, marginBottom: 6 }}>
                {CATEGORY_LABELS[lang][art.category]}
              </span>
              <h3 style={{ fontFamily: "Manrope, sans-serif", fontSize: 14.5, fontWeight: 700, color: "var(--text)", lineHeight: 1.3, margin: "0 0 6px" }}>
                {art.title[lang]}
              </h3>
              <p style={{ fontSize: 12.5, color: "var(--text-soft)", lineHeight: 1.5, margin: "0 0 10px", flex: 1 }}>{art.excerpt[lang]}</p>
              <span style={{ fontSize: 11.5, color: "var(--text-faint)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="clock" size={11} /> {a.minRead(art.readTimeMinutes)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
