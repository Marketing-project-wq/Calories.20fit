import { useState, useEffect } from "react";
import { COLORS, ROUTES, URLS } from "./lib/constants";
import { t, Lang } from "./lib/i18n";
import { cc } from "./lib/calorieCopy";
import { useAuth } from "./hooks/useAuth";
import { AuthNav } from "./components/AuthNav";
import { Icon } from "./components/Icon";
import { Link, useLocation, matchRoute } from "./lib/router";
import { LandingPage } from "./pages/LandingPage";
import { HomePage } from "./pages/HomePage";
import { ScanRoute } from "./pages/ScanRoute";
import { HistoryPage } from "./pages/HistoryPage";
import { ArticlesPage } from "./pages/ArticlesPage";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import { InsightPage } from "./pages/InsightPage";
import { MealPlanPage } from "./pages/MealPlanPage";
import { SiteFooter } from "./components/SiteFooter";

// The brief lists /register + /login. Auth is centralised at my.20fit.id, so
// these routes hand off to its SSO flow (which returns here via ?next=calories)
// rather than hosting a parallel form. Rendered as a redirect with a manual
// fallback link in case the automatic redirect is blocked.
function SsoRedirect({ url, lang }: { url: string; lang: Lang }) {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);
  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <p style={{ fontSize: 15, color: "#6A6A6A", marginBottom: 16 }}>
        {lang === "id" ? "Mengarahkan ke halaman akun 20FIT…" : "Redirecting to the 20FIT account page…"}
      </p>
      <a href={url} className="sc-btn-primary" style={{ display: "inline-block", background: COLORS.RED, color: "#fff", borderRadius: 12, padding: "11px 20px", fontSize: 14, fontWeight: 700 }}>
        {lang === "id" ? "Lanjut" : "Continue"} →
      </a>
    </div>
  );
}

function NotFound({ lang }: { lang: Lang }) {
  const c = cc(lang).common;
  return (
    <div>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "72px 20px", textAlign: "center" }}>
        <div style={{ marginBottom: 12, color: "#B0ABA4" }}><Icon name="utensils" size={48} /></div>
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
  // Logged-in members land on HomePage (upload CTA + today's summary)
  // instead of the marketing LandingPage. While auth is still resolving,
  // render nothing rather than flashing one page then swapping to the
  // other (auth resolves fast — a single getUser() call, see useAuth).
  if (path === "/") page = isLoading ? <></> : isAuthenticated ? <HomePage lang={lang} /> : <LandingPage lang={lang} />;
  else if (path === ROUTES.SCAN) page = <ScanRoute lang={lang} />;
  else if (path === ROUTES.ARTICLES) page = <ArticlesPage lang={lang} />;
  else if (articleMatch) page = <ArticleDetailPage lang={lang} slug={articleMatch.slug} />;
  else if (path === ROUTES.TRACKER) page = <InsightPage lang={lang} />;
  else if (path === ROUTES.MEAL_PLAN) page = <MealPlanPage lang={lang} />;
  else if (path === ROUTES.HISTORY) page = <HistoryPage lang={lang} />;
  else if (path === "/register") page = <SsoRedirect url={URLS.SIGN_UP} lang={lang} />;
  else if (path === "/login") page = <SsoRedirect url={URLS.LOGIN} lang={lang} />;
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
              <Icon name="leaf" size={14} color={COLORS.BLACK} />
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
