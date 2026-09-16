import { useMemo, useState } from "react";
import { COLORS } from "../lib/constants";
import { Lang } from "../lib/i18n";
import { cc } from "../lib/calorieCopy";
import { Link } from "../lib/router";
import { ROUTES } from "../lib/constants";
import { SiteFooter } from "../components/SiteFooter";
import { ARTICLES, ArticleCategory, CATEGORY_LABELS } from "../data/articles";

export function ArticlesPage({ lang }: { lang: Lang }) {
  const a = cc(lang).articles;
  const [cat, setCat] = useState<ArticleCategory | "all">("all");

  // Only offer filters for categories that actually have articles.
  const cats = useMemo(() => {
    const present = Array.from(new Set(ARTICLES.map((x) => x.category)));
    return present as ArticleCategory[];
  }, []);

  const shown = cat === "all" ? ARTICLES : ARTICLES.filter((x) => x.category === cat);

  return (
    <div style={{ background: "#EFEDEA", minHeight: "60vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 20px 8px" }}>
        <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "clamp(30px,5vw,44px)", textTransform: "uppercase", color: COLORS.BLACK, margin: "0 0 6px" }}>
          {a.listTitle}
        </h1>
        <p style={{ fontSize: 15, color: "#5A5A5A", maxWidth: 620, margin: "0 0 20px", lineHeight: 1.6 }}>{a.listSub}</p>

        {/* Category filter */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
          {(["all", ...cats] as (ArticleCategory | "all")[]).map((cKey) => {
            const on = cat === cKey;
            const label = cKey === "all" ? a.all : CATEGORY_LABELS[lang][cKey];
            return (
              <button
                key={cKey}
                onClick={() => setCat(cKey)}
                style={{ fontSize: 12.5, fontWeight: 600, borderRadius: 999, padding: "7px 14px", border: `1px solid ${on ? COLORS.RED : "#DAD6D1"}`, background: on ? COLORS.RED : "#fff", color: on ? "#fff" : "#6A6A6A", cursor: "pointer" }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
          {shown.map((art) => (
            <Link
              key={art.slug}
              href={ROUTES.article(art.slug)}
              className="sc-card"
              style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #E4E0DB", borderRadius: 16, overflow: "hidden", textDecoration: "none" }}
            >
              <div style={{ height: 120, background: `linear-gradient(135deg, ${art.accent}26, ${art.accent}0a)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, position: "relative" }}>
                {art.coverEmoji}
                {art.isPremium && (
                  <span style={{ position: "absolute", top: 10, right: 10, fontSize: 11, fontWeight: 700, background: "rgba(20,20,20,0.72)", color: "#fff", borderRadius: 999, padding: "3px 9px" }}>
                    🔒 {a.premium}
                  </span>
                )}
              </div>
              <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: art.accent, marginBottom: 8 }}>
                  {CATEGORY_LABELS[lang][art.category]}
                </span>
                <h2 style={{ fontFamily: "Manrope, sans-serif", fontSize: 17, fontWeight: 700, color: COLORS.BLACK, lineHeight: 1.28, margin: "0 0 8px" }}>
                  {art.title}
                </h2>
                <p style={{ fontSize: 13.5, color: "#6A6A6A", lineHeight: 1.55, margin: "0 0 12px", flex: 1 }}>{art.excerpt}</p>
                <span style={{ fontSize: 12, color: "#9A9A9A" }}>⏱ {a.minRead(art.readTimeMinutes)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}
