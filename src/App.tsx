import { useState } from "react";
import { COLORS, ROUTES } from "./lib/constants";
import { t, Lang } from "./lib/i18n";
import { cc } from "./lib/calorieCopy";
import { useAuth } from "./hooks/useAuth";
import { AuthNav } from "./components/AuthNav";
import { Link, useLocation, matchRoute } from "./lib/router";
import { LandingPage } from "./pages/LandingPage";
import { ScanPage } from "./pages/ScanPage";
import { HistoryPage } from "./pages/HistoryPage";
import { InsightPage } from "./pages/InsightPage";
import { ArticlesPage } from "./pages/ArticlesPage";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import { TrackerPage } from "./pages/TrackerPage";
import { MealPlanPage } from "./pages/MealPlanPage";
import { SiteFooter } from "./components/SiteFooter";

function NotFound({ lang }: { lang: Lang }) {
  const c = cc(lang).common;
  return (
    <div>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "72px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🍽️</div>
        <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 34, textTransform: "uppercase", color: COLORS.BLACK, margin: "0 0 8px" }}>
          {c.notFoundTitle}
        </h1>
        <p style={{ fontSize: 15, color: "#6A6A6A", margin: "0 0 20px" }}>{c.notFoundSub}</p>
        <Link href={ROUTES.HOME} className="sc-btn-primary" style={{ display: "inline-block", background: COLORS.RED, color: "#fff", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 700 }}>
          {c.backHome}
        </Link>
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}

export function App() {
  const [lang, setLang] = useState<Lang>("id");
  const tr = t[lang];
  const nav = cc(lang).nav;
  const { user, isAuthenticated, isLoading } = useAuth();
  const path = useLocation();

  const NAV_ITEMS: { key: string; label: string; href: string }[] = [
    { key: "home", label: nav.home, href: ROUTES.HOME },
    { key: "scan", label: nav.scan, href: ROUTES.SCAN },
    { key: "articles", label: nav.articles, href: ROUTES.ARTICLES },
    { key: "tracker", label: nav.tracker, href: ROUTES.TRACKER },
    { key: "meal-plan", label: nav.mealPlan, href: ROUTES.MEAL_PLAN },
    { key: "history", label: nav.history, href: ROUTES.HISTORY },
  ];

  const isActive = (href: string) => {
    if (href === ROUTES.HOME) return path === "/";
    if (href === ROUTES.ARTICLES) return path === "/articles" || path.startsWith("/articles/");
    return path === href;
  };

  // ---- Route table ----
  let page: JSX.Element;
  const articleMatch = matchRoute("/articles/:slug", path);
  if (path === "/") page = <LandingPage lang={lang} />;
  else if (path === ROUTES.SCAN) page = <ScanPage lang={lang} />;
  else if (path === ROUTES.ARTICLES) page = <ArticlesPage lang={lang} />;
  else if (articleMatch) page = <ArticleDetailPage lang={lang} slug={articleMatch.slug} />;
  else if (path === ROUTES.TRACKER) page = <TrackerPage lang={lang} />;
  else if (path === ROUTES.MEAL_PLAN) page = <MealPlanPage lang={lang} />;
  else if (path === ROUTES.HISTORY) page = <HistoryPage lang={lang} />;
  else page = <NotFound lang={lang} />;

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
      <div className="sc-nav-glass" style={{ borderBottom: "1px solid rgba(20,20,20,0.08)", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 4px 24px rgba(20,20,20,0.04)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 16px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "8px 12px" }}>
          {/* Brand + nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: "1 1 auto" }}>
            <Link href={ROUTES.HOME} style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }} aria-label="20FIT Calorie Tracker">
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, color: COLORS.RED, letterSpacing: ".02em" }}>20FIT</span>
              <span style={{ width: 1, height: 16, background: "rgba(20,20,20,0.15)" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.BLACK }}>🥗</span>
            </Link>
            <nav
              style={{ display: "flex", gap: 2, overflowX: "auto", scrollbarWidth: "none", minWidth: 0 }}
              className="ct-navstrip"
            >
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className="sc-tab"
                    style={{
                      padding: "10px 12px",
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontSize: 13,
                      letterSpacing: ".07em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      borderBottom: active ? `2px solid ${COLORS.RED}` : "2px solid transparent",
                      color: active ? COLORS.RED : "#6A6A6A",
                      marginBottom: -2,
                      textDecoration: "none",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Language + auth */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ display: "flex", background: "rgba(20,20,20,0.05)", borderRadius: 10, padding: 3, gap: 2 }}>
              {(["id", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: "4px 10px",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontSize: 11,
                    letterSpacing: ".06em",
                    textTransform: "uppercase",
                    borderRadius: 6,
                    border: "none",
                    background: l === lang ? "#141414" : "transparent",
                    color: l === lang ? "#FFFFFF" : "#8A8A8A",
                    cursor: "pointer",
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <AuthNav lang={lang} isLoading={isLoading} isAuthenticated={isAuthenticated} user={user} />
          </div>
        </div>
      </div>

      <main>{page}</main>

      {/* Hide the nav strip's scrollbar (WebKit) */}
      <style>{`
        .ct-navstrip::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
