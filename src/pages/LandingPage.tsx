import { COLORS, NUTRI, ROUTES, URLS } from "../lib/constants";
import { Lang } from "../lib/i18n";
import { cc } from "../lib/calorieCopy";
import { Link } from "../lib/router";
import { useAuth } from "../hooks/useAuth";
import { TdeeCalculator } from "../components/TdeeCalculator";
import { SiteFooter } from "../components/SiteFooter";
import { getFeatured, CATEGORY_LABELS } from "../data/articles";
import { useArticles } from "../hooks/useArticles";
import { Icon } from "../components/Icon";

const MAXW = 1100;

// Real-member photo under the hero headline — only ONE shows at a time, the
// other swapped in by CSS at the same 860px breakpoint the hero itself
// stacks at (see .ct-hero-photo-mobile/.ct-hero-photo-desktop below), rather
// than showing both together. Hosted on 20FIT's existing WordPress media
// library (same host the app already trusts for the brand wordmark — see
// LOGO in src/lib/theme.tsx), not this repo's own asset pipeline. Which
// photo goes to which breakpoint is an arbitrary pick since this session
// can't preview them (sandbox network policy blocks media.20fit.id) — swap
// HERO_PHOTO_MOBILE/HERO_PHOTO_DESKTOP if the wrong one ends up on the
// wrong size.
const HERO_PHOTO_MOBILE = "https://media.20fit.id/wp-content/uploads/2026/09/WhatsApp-Image-2026-07-31-at-15.05.26.jpeg";
const HERO_PHOTO_DESKTOP = "https://media.20fit.id/wp-content/uploads/2026/09/WhatsApp-Image-2026-07-31-at-16.45.06-1-2.jpeg";

function Orbs() {
  return (
    <div className="sc-orb-field" aria-hidden>
      <div className="sc-orb" style={{ width: 320, height: 320, top: -80, left: -60, background: "rgba(196,17,1,0.18)" }} />
      <div className="sc-orb" style={{ width: 300, height: 300, top: 40, right: -80, background: "rgba(34,197,94,0.20)", animationDelay: "3s" }} />
    </div>
  );
}

export function LandingPage({ lang }: { lang: Lang }) {
  const c = cc(lang);
  const { isAuthenticated } = useAuth();
  const { articles } = useArticles();
  const featured = getFeatured(articles, 3);

  return (
    <div style={{ background: "var(--bg)" }}>
      {/* ---------- Section 1: Hero + calculator ---------- */}
      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(180deg,var(--surface) 0%,var(--surface-2) 100%)" }}>
        <Orbs />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: MAXW,
            margin: "0 auto",
            padding: "44px 20px 40px",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,460px)",
            gap: 36,
            alignItems: "start",
          }}
          className="ct-hero-grid"
        >
          <div style={{ paddingTop: 12 }}>
            <h1
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(34px, 6vw, 56px)",
                lineHeight: 0.98,
                textTransform: "uppercase",
                color: "var(--text)",
                margin: "0 0 16px",
                whiteSpace: "pre-line",
              }}
            >
              {c.landing.heroTitle}
            </h1>

            {/* Real-member photo — a single wide shot right under the
                headline; alt="" (decorative) since the photo's exact
                content isn't authored copy this session can describe. */}
            <div
              style={{
                aspectRatio: "16 / 9",
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "0 10px 28px -18px rgba(20,20,20,0.35)",
                margin: "0 0 20px",
                maxWidth: 460,
              }}
            >
              <img src={HERO_PHOTO_MOBILE} alt="" loading="lazy" className="ct-hero-photo-mobile" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <img src={HERO_PHOTO_DESKTOP} alt="" loading="lazy" className="ct-hero-photo-desktop" style={{ width: "100%", height: "100%", objectFit: "cover", display: "none" }} />
            </div>

            <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--text-muted)", maxWidth: 460, margin: "0 0 20px" }}>
              {c.landing.heroSub}
            </p>
          </div>

          <div>
            <TdeeCalculator lang={lang} />
          </div>
        </div>
      </section>

      {/* ---------- Section 2: Full-feature teaser ---------- */}
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "40px 20px 8px" }}>
        <div
          style={{
            borderRadius: 22,
            overflow: "hidden",
            background: "linear-gradient(135deg,#141414 0%,#2a1210 100%)",
            color: "var(--on-brand)",
            padding: "32px 26px",
          }}
        >
          <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "clamp(26px,4vw,36px)", textTransform: "uppercase", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="target" size={26} color={NUTRI.GREEN} /> {c.teaser.title}
          </h2>
          <p style={{ fontSize: 15, color: "#D8D8D8", margin: "0 0 20px" }}>{c.teaser.sub}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "10px 20px" }}>
            {c.teaser.bullets.map((b) => (
              <li key={b} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14.5, color: "#EDEDED" }}>
                <Icon name="check-circle" size={16} color={NUTRI.GREEN} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          {isAuthenticated ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link
                href={ROUTES.TRACKER}
                className="sc-link-btn"
                style={{ background: NUTRI.GREEN, color: "#08320f", borderRadius: 12, padding: "13px 22px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}
              >
                {lang === "id" ? "Buka Tracker →" : "Open Tracker →"}
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <a
                href="/register"
                className="sc-link-btn"
                style={{ background: "var(--brand)", color: "var(--on-brand)", borderRadius: 12, padding: "13px 22px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}
              >
                {c.teaser.ctaPrimary} →
              </a>
              <a href="/login" style={{ color: "var(--on-brand)", fontSize: 14, fontWeight: 600, textDecoration: "underline", opacity: 0.9 }}>
                {c.teaser.ctaSecondary}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Section 3: Article previews ---------- */}
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "36px 20px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12, marginBottom: 18 }}>
          <div>
            <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "clamp(24px,4vw,32px)", textTransform: "uppercase", color: "var(--text)", margin: "0 0 4px" }}>
              {c.landing.previewArticlesTitle}
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-soft)", margin: 0 }}>{c.landing.previewArticlesSub}</p>
          </div>
          <Link href={ROUTES.ARTICLES} style={{ fontSize: 13, fontWeight: 700, color: "var(--brand)", whiteSpace: "nowrap" }} className="sc-link-btn">
            {c.landing.previewArticlesCta} →
          </Link>
        </div>
        <div className="ct-article-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {featured.map((a) => (
            <Link
              key={a.slug}
              href={ROUTES.article(a.slug)}
              className="sc-card ct-article-card"
              style={{ display: "block", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden", textDecoration: "none" }}
            >
              <div style={{ height: 96, position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${a.accent}22, ${a.accent}0a)`, display: "flex", alignItems: "center", justifyContent: "center", color: a.accent }}>
                <Icon name={a.coverIcon} size={34} strokeWidth={1.5} />
                <img
                  src={a.coverPhoto}
                  alt=""
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "14px 16px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: a.accent, background: `${a.accent}1a`, borderRadius: 999, padding: "3px 9px" }}>
                    {CATEGORY_LABELS[lang][a.category]}
                  </span>
                  {a.isPremium && <Icon name="lock" size={12} color="#9A9A9A" style={{ marginLeft: 4 }} />}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", lineHeight: 1.25, margin: "0 0 8px", fontFamily: "Manrope, sans-serif" }}>
                  {a.title[lang]}
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.5, margin: "0 0 10px" }}>{a.excerpt[lang]}</p>
                <span style={{ fontSize: 12, color: "var(--text-faint)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Icon name="clock" size={12} /> {a.readTimeMinutes} {lang === "id" ? "menit baca" : "min read"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Section 4: Scan preview ---------- */}
      <section style={{ maxWidth: MAXW, margin: "0 auto", padding: "36px 20px 12px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 24,
            alignItems: "center",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 22,
            padding: "28px 26px",
          }}
        >
          <div>
            <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "clamp(24px,4vw,34px)", textTransform: "uppercase", color: "var(--text)", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="camera" size={24} color={COLORS.RED} /> {c.landing.previewScanTitle}
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>{c.landing.previewScanSub}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {c.landing.previewScanBullets.map((b) => (
                <li key={b} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "var(--text-muted)" }}>
                  <span style={{ color: NUTRI.GREEN_DARK, fontWeight: 700 }}>✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            {isAuthenticated ? (
              <Link
                href={ROUTES.SCAN}
                className="sc-btn-primary"
                style={{ display: "inline-block", background: "var(--brand)", color: "var(--on-brand)", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}
              >
                {c.landing.previewScanCta} →
              </Link>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <a
                  href="/register"
                  className="sc-link-btn"
                  style={{ display: "inline-block", background: "var(--brand)", color: "var(--on-brand)", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}
                >
                  {c.teaser.ctaPrimary} →
                </a>
                <a href="/login" style={{ color: "var(--text)", fontSize: 13, fontWeight: 600, textDecoration: "underline", opacity: 0.75 }}>
                  {c.teaser.ctaSecondary}
                </a>
              </div>
            )}
          </div>
          {/* Simple scan mock */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 280, border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", boxShadow: "0 16px 40px -22px rgba(20,20,20,0.3)" }}>
              <div style={{ height: 120, background: "linear-gradient(135deg,#FCEBED,#DCFCE7)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand)" }}><Icon name="bowl" size={44} strokeWidth={1.4} /></div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Nasi Goreng</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 30, color: "var(--brand)", fontVariantNumeric: "tabular-nums" }}>~400</span>
                  <span style={{ fontSize: 12, color: "var(--text-faint)" }}>kkal / porsi</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { l: "P", v: "12g", col: NUTRI.BLUE },
                    { l: "K", v: "50g", col: NUTRI.AMBER },
                    { l: "L", v: "17g", col: COLORS.RED },
                  ].map((m) => (
                    <div key={m.l} style={{ flex: 1, textAlign: "center", background: "var(--surface-2)", borderRadius: 8, padding: "6px 0" }}>
                      <div style={{ fontSize: 10, color: m.col, fontWeight: 700 }}>{m.l}</div>
                      <div style={{ fontSize: 12, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{m.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter lang={lang} />

      {/* Stack hero to one column on narrow screens; swap which of the two
          hero photos shows at the same breakpoint (never both). */}
      <style>{`
        @media (max-width: 860px) {
          .ct-hero-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 861px) {
          .ct-hero-photo-mobile { display: none !important; }
          .ct-hero-photo-desktop { display: block !important; }
        }

        /* Article previews: horizontal swipeable carousel on mobile instead
           of stacking to one column — each card peeks the next one so it
           reads as "swipe for more", scroll-snap so it settles on a card
           edge instead of stopping mid-card. Desktop grid is untouched. */
        @media (max-width: 640px) {
          .ct-article-grid {
            display: flex !important;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            gap: 12px !important;
            margin: 0 -20px;
            padding: 0 20px 6px;
            scrollbar-width: none;
          }
          .ct-article-grid::-webkit-scrollbar { display: none; }
          .ct-article-card {
            scroll-snap-align: start;
            flex: 0 0 82%;
            min-width: 0;
          }
        }
      `}</style>
    </div>
  );
}
