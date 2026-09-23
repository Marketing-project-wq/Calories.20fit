import { useState, useEffect } from "react";
import { ROUTES } from "./lib/constants";
import { Lang, readInitialLang, persistLang } from "./lib/i18n";
import { cc } from "./lib/calorieCopy";
import { useAuth } from "./hooks/useAuth";
import { useTheme, LOGO } from "./lib/theme";
import { AuthNav } from "./components/AuthNav";
import { Icon } from "./components/Icon";
import { UniversalNav } from "./components/UniversalNav";
import { Link, useLocation, matchRoute, navigate } from "./lib/router";
import { LandingPage } from "./pages/LandingPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ArticlesPage } from "./pages/ArticlesPage";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import { AuthPage } from "./pages/AuthPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { AccountGate } from "./components/AccountGate";
import { CaloriesTracker } from "./components/tracker/CaloriesTracker";
import { SiteFooter } from "./components/SiteFooter";
import { MemberProfile, getMemberProfile, needsOnboarding } from "./lib/memberTracker";

function NotFound({ lang }: { lang: Lang }) {
  const c = cc(lang).common;
  return (
    <div>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "72px 20px", textAlign: "center" }}>
        <div style={{ marginBottom: 12, color: "var(--text-faint)" }}><Icon name="utensils" size={48} /></div>
        <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 34, textTransform: "uppercase", color: "var(--text)", margin: "0 0 8px" }}>
          {c.notFoundTitle}
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-soft)", margin: "0 0 20px" }}>{c.notFoundSub}</p>
        <Link href={ROUTES.HOME} className="sc-btn-primary" style={{ display: "inline-block", background: "var(--brand)", color: "var(--on-brand)", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 700 }}>
          {c.backHome}
        </Link>
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <span style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid var(--border)`, borderTopColor: "var(--brand)", display: "inline-block", animation: "appSpin .9s linear infinite" }} />
      <style>{`@keyframes appSpin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// Meal Plan is no longer a page of its own — it lives inside the tracker now.
// Keep the old /meal-plan URL working by sending it home (the tracker).
function Redirect({ to }: { to: string }) {
  useEffect(() => { navigate(to); }, [to]);
  return <Spinner />;
}

function GatedTracker({ lang }: { lang: Lang }) {
  const g = cc(lang).tracker;
  return (
    <div>
      <AccountGate lang={lang} icon="lock" title={g.gateTitle} sub={g.gateSub} bullets={g.gateBullets} />
      <SiteFooter lang={lang} />
    </div>
  );
}

// Signed-in member area: load the profile once, route to onboarding if it isn't
// complete (fresh account), otherwise the full tracker.
function MemberArea({ lang }: { lang: Lang }) {
  const [profile, setProfile] = useState<MemberProfile | null | undefined>(undefined); // undefined = loading
  const load = () => {
    setProfile(undefined);
    getMemberProfile().then((p) => setProfile(p)).catch(() => setProfile(null));
  };
  useEffect(() => { load(); }, []);
  if (profile === undefined) return <Spinner />;
  if (needsOnboarding(profile)) return <OnboardingPage lang={lang} onDone={load} />;
  return <CaloriesTracker lang={lang} />;
}

export function App() {
  const [lang, setLangState] = useState<Lang>(() => readInitialLang());
  const setLang = (l: Lang) => {
    setLangState(l);
    persistLang(l);
  };
  const nav = cc(lang).nav;
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const path = useLocation();

  const NAV_ITEMS: { key: string; label: string; href: string }[] = isAuthenticated
    ? [
        { key: "tracker", label: nav.tracker, href: ROUTES.HOME },
        { key: "articles", label: nav.articles, href: ROUTES.ARTICLES },
        { key: "history", label: nav.history, href: ROUTES.HISTORY },
      ]
    : [
        { key: "home", label: nav.home, href: ROUTES.HOME },
        { key: "articles", label: nav.articles, href: ROUTES.ARTICLES },
      ];

  const isActive = (href: string) => {
    if (href === ROUTES.HOME) return path === "/";
    if (href === ROUTES.ARTICLES) return path === "/articles" || path.startsWith("/articles/");
    return path === href;
  };

  const gated = (memberEl: JSX.Element) => (isLoading ? <Spinner /> : isAuthenticated ? memberEl : <GatedTracker lang={lang} />);
  const goHome = () => navigate("/");

  // ---- Route table ----
  let page: JSX.Element;
  const articleMatch = matchRoute("/articles/:slug", path);
  if (path === "/") page = isLoading ? <Spinner /> : isAuthenticated ? <MemberArea lang={lang} /> : <LandingPage lang={lang} />;
  else if (path === ROUTES.SCAN) page = gated(<MemberArea lang={lang} />);
  else if (path === ROUTES.TRACKER) page = gated(<MemberArea lang={lang} />);
  else if (path === ROUTES.ARTICLES) page = <ArticlesPage lang={lang} />;
  else if (articleMatch) page = <ArticleDetailPage lang={lang} slug={articleMatch.slug} />;
  else if (path === ROUTES.MEAL_PLAN) page = <Redirect to={ROUTES.HOME} />;
  else if (path === ROUTES.HISTORY) page = <HistoryPage lang={lang} />;
  // Native auth — no redirect to my.20fit.id. A signed-in user hitting these
  // just goes home (MemberArea then decides onboarding vs tracker).
  else if (path === "/register") page = isAuthenticated ? <MemberArea lang={lang} /> : <AuthPage lang={lang} initialMode="up" onDone={goHome} />;
  else if (path === "/login") page = isAuthenticated ? <MemberArea lang={lang} /> : <AuthPage lang={lang} initialMode="in" onDone={goHome} />;
  else page = <NotFound lang={lang} />;

  return (
    <div className="min-h-screen" style={{ background: "transparent" }}>
      {/* Colored, blurred orbs behind everything — the depth the frosted-glass
          surfaces frost over (glassmorphism needs something to reveal). */}
      <div className="app-orbs" aria-hidden="true">
        <span className="app-orb app-orb-1" />
        <span className="app-orb app-orb-2" />
        <span className="app-orb app-orb-3" />
      </div>
      <div className="sc-nav-glass" style={{ borderBottom: "1px solid var(--nav-border)", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 4px 24px var(--shadow-sm)" }}>
        <div className="ct-header-bar" style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 16px", display: "flex", flexWrap: "nowrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {/* Brand + nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: "1 1 auto" }}>
            <Link href={ROUTES.HOME} style={{ display: "flex", alignItems: "center", flexShrink: 0 }} aria-label="20FIT Calorie Tracker">
              <img
                src={LOGO[theme]}
                alt="20FIT"
                height={28}
                className="ct-header-logo"
                style={{ height: 28, width: "auto", display: "block", objectFit: "contain" }}
              />
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
                      borderBottom: active ? `2px solid var(--brand)` : "2px solid transparent",
                      color: active ? "var(--brand)" : "var(--text-soft)",
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

          {/* App switcher + theme + language + auth — these 4 controls must
              never be hidden or dropped to a hamburger; only their text
              labels compress away below md (768px), same breakpoint as
              AuthNav's name and UniversalNav's "Products" label. */}
          <div className="ct-header-right" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <UniversalNav lang={lang} />
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? nav.themeLight : nav.themeDark}
              title={theme === "dark" ? nav.themeLight : nav.themeDark}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                minWidth: 32,
                height: 32,
                padding: "0 8px",
                borderRadius: 8,
                background: "var(--track)",
                color: "var(--text-soft)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
              <span className="hidden md:inline" style={{ fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                {theme === "dark" ? nav.themeLight : nav.themeDark}
              </span>
            </button>
            <div className="ct-lang-toggle" style={{ display: "flex", background: "var(--track)", borderRadius: 10, padding: 3, gap: 2, flexShrink: 0 }}>
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
                    background: l === lang ? "var(--text)" : "transparent",
                    color: l === lang ? "var(--surface)" : "var(--text-subtle)",
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

        /* Header must always stay one line — never wrap to a second row.
           The nav-link strip (Tracker/Articles/History) already scrolls
           horizontally instead of wrapping; below this we just claw back
           enough width on narrow phones so the 4 required controls
           (Products, theme, language, profile) never get pushed off. */
        @media (max-width: 480px) {
          .ct-header-bar { padding-left: 10px !important; padding-right: 10px !important; gap: 6px !important; }
          .ct-header-right { gap: 4px !important; }
          .ct-lang-toggle { padding: 2px !important; }
          .ct-lang-toggle button { padding: 3px 7px !important; }
          /* The logo is a remote-hosted wordmark image of unknown width —
             cap it so it can never crowd out the 4 required controls on the
             right (same "logo shrinks first" priority the spec calls for). */
          .ct-header-logo { max-width: 92px !important; }
        }
        @media (max-width: 360px) {
          .ct-header-logo { height: 22px !important; max-width: 68px !important; }
        }
      `}</style>
    </div>
  );
}
