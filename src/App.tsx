import { useState, useEffect, useRef } from "react";
import { ROUTES } from "./lib/constants";
import { Lang, readInitialLang, persistLang } from "./lib/i18n";
import { cc } from "./lib/calorieCopy";
import { useAuth } from "./hooks/useAuth";
import { useTheme, LOGO } from "./lib/theme";
import { AuthNav } from "./components/AuthNav";
import { Icon } from "./components/Icon";
import { UniversalNav } from "./components/UniversalNav";
import { announceDropdownOpen, onOtherDropdownOpen } from "./lib/dropdownCoordinator";
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

// Vertical 3-dot "more" glyph — mobile-only overflow menu (page tabs +
// language + theme, which collapse out of the header below md). No matching
// icon exists in Icon.tsx's line-icon set, so this is a one-off inline SVG,
// same pattern as UniversalNav's own WaffleIcon.
function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

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

  // Mobile-only "More" overflow menu: page tabs + language + theme move in
  // here below md, since the header itself must stay one line (see
  // .ct-navstrip / .ct-header-right media queries below). Same open/close +
  // dropdown-coordinator pattern as UniversalNav/AuthNav's own menus.
  const MORE_DROPDOWN_ID = "header-more";
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (moreOpen) announceDropdownOpen(MORE_DROPDOWN_ID);
  }, [moreOpen]);
  useEffect(() => onOtherDropdownOpen(MORE_DROPDOWN_ID, () => setMoreOpen(false)), []);
  useEffect(() => {
    if (!moreOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

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
      {/* Floating pill header — translucent + blurred (never brand red; see
          index.css --header-bg / theme.tsx). It no longer touches the top
          edge, so it's the PAGE background (--bg), not the header's own
          fill, that now sits flush against the browser/OS chrome — the
          <meta name="theme-color"> below is matched to --bg accordingly
          (see theme.tsx), not to --header-bg. */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, paddingTop: "env(safe-area-inset-top, 0px)" }}>
        <div
          className="ct-header-bar"
          style={{
            margin: "8px 12px 0",
            padding: "0 20px",
            height: 48,
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            background: "var(--header-bg)",
            border: "1px solid var(--header-border)",
            borderRadius: 14,
            boxShadow: "0 2px 12px var(--shadow-sm)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
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
              style={{ gap: 2, overflowX: "auto", scrollbarWidth: "none", minWidth: 0 }}
              className="ct-navstrip hidden md:flex"
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

          {/* App switcher + profile stay visible at every width (icon-only
              below md); page tabs, theme and language fully collapse into
              the mobile-only "More" menu below md instead of just losing
              their text labels — the header itself must always stay one
              line (see .ct-header-bar/.ct-navstrip below). */}
          <div className="ct-header-right" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <UniversalNav lang={lang} />

            {/* Mobile-only overflow menu — page tabs + language + theme,
                which don't fit the single-line header below md. Grouped
                right next to Products (not stranded past the profile
                avatar) since both are "more 20FIT/app navigation" controls,
                not account controls. */}
            <div ref={moreRef} className="flex md:hidden" style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setMoreOpen((o) => !o)}
                aria-label={nav.more}
                title={nav.more}
                aria-expanded={moreOpen}
                aria-haspopup="true"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: moreOpen ? "var(--brand-soft)" : "var(--track)",
                  color: moreOpen ? "var(--brand)" : "var(--text-soft)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <MoreIcon />
              </button>

              {moreOpen && (
                <div
                  className="ct-more-menu"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    zIndex: 61,
                    width: 220,
                    background: "var(--surface-solid)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    boxShadow: "0 8px 32px var(--shadow-md)",
                    padding: 6,
                    overflow: "hidden",
                  }}
                >
                  {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        style={{
                          display: "block",
                          padding: "10px 12px",
                          fontFamily: "Barlow Condensed, sans-serif",
                          fontSize: 13,
                          letterSpacing: ".05em",
                          textTransform: "uppercase",
                          borderRadius: 8,
                          textDecoration: "none",
                          color: active ? "var(--brand)" : "var(--text-soft)",
                          background: active ? "var(--brand-soft)" : "transparent",
                        }}
                      >
                        {item.label}
                      </Link>
                    );
                  })}

                  <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "6px 0" }} />

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-soft)" }}>{nav.language}</span>
                    <div className="ct-lang-toggle" style={{ display: "flex", background: "var(--track)", borderRadius: 10, padding: 3, gap: 2 }}>
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
                  </div>

                  <button
                    onClick={() => {
                      toggleTheme();
                      setMoreOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text)",
                      background: "none",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
                    {theme === "dark" ? nav.themeLight : nav.themeDark}
                  </button>
                </div>
              )}
            </div>

            {/* Icon-only at every width (no text label) — matches the
                Products button's treatment; the label still appears in the
                mobile More menu's row above. */}
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? nav.themeLight : nav.themeDark}
              title={theme === "dark" ? nav.themeLight : nav.themeDark}
              className="hidden md:inline-flex"
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--track)",
                color: "var(--text-soft)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
            </button>
            <div className="ct-lang-toggle hidden md:flex" style={{ background: "var(--track)", borderRadius: 10, padding: 3, gap: 2, flexShrink: 0 }}>
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
           Below md (768px), page tabs/theme/language already fully collapse
           into the "More" menu (see App() — .hidden md:flex etc.), leaving
           just [Logo] [Products] [More] [Profile] in the bar itself, so the
           whole "compact mobile" treatment (tighter floating margins, smaller
           radius, less padding) applies at that same breakpoint — there's no
           longer a separate narrower threshold for it. Keeps the lang toggle
           inside the More dropdown compact too (same .ct-lang-toggle class,
           reused there). */
        @media (max-width: 767px) {
          .ct-header-bar {
            height: 44px !important;
            margin: 6px 8px 0 !important;
            padding-left: 14px !important;
            padding-right: 14px !important;
            border-radius: 12px !important;
            gap: 6px !important;
          }
          .ct-header-right { gap: 4px !important; }
          .ct-lang-toggle { padding: 2px !important; }
          .ct-lang-toggle button { padding: 3px 7px !important; }
          /* The logo is a remote-hosted wordmark image of unknown width —
             cap it so it can never crowd out the other controls on the
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
