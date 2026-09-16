import { COLORS, NUTRI, ROUTES, URLS } from "../lib/constants";
import { Lang } from "../lib/i18n";
import { cc } from "../lib/calorieCopy";
import { Link } from "../lib/router";
import { useAuth } from "../hooks/useAuth";
import { TdeeCalculator } from "../components/TdeeCalculator";
import { SiteFooter } from "../components/SiteFooter";
import { getFeatured, CATEGORY_LABELS } from "../data/articles";
import { Icon } from "../components/Icon";

const MAXW = 1100;

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
  const featured = getFeatured(3);

  return (
    <div style={{ background: "#EFEDEA" }}>
      {/* ---------- Section 1: Hero + calculator ---------- */}
      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(180deg,#FFFFFF 0%,#F6F4F1 100%)" }}>
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
            <span
              style={{
                display: "inline-block",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: NUTRI.GREEN_DARK,
                background: NUTRI.GREEN_TINT,
                borderRadius: 999,
                padding: "5px 12px",
                marginBottom: 16,
              }}
            >
              {c.landing.heroKicker}
            </span>
            <h1
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(34px, 6vw, 56px)",
                lineHeight: 0.98,
                textTransform: "uppercase",
                color: COLORS.BLACK,
                margin: "0 0 16px",
                whiteSpace: "pre-line",
              }}
            >
              {c.landing.heroTitle}
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#4A4A4A", maxWidth: 460, margin: "0 0 20px" }}>
              {c.landing.heroSub}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#6A6A6A" }}>
              <Icon name="flame" size={17} color={COLORS.RED} />
              <span>{c.common.poweredBy}</span>
            </div>
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
            color: "#fff",
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
                href={URLS.SIGN_UP}
                className="sc-link-btn"
                style={{ background: COLORS.RED, color: "#fff", borderRadius: 12, padding: "13px 22px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}
              >
                {c.teaser.ctaPrimary} →
              </a>
              <a href={URLS.LOGIN} style={{ color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "underline", opacity: 0.9 }}>
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
            <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "clamp(24px,4vw,32px)", textTransform: "uppercase", color: COLORS.BLACK, margin: "0 0 4px" }}>
              {c.landing.previewArticlesTitle}
            </h2>
            <p style={{ fontSize: 14, color: "#6A6A6A", margin: 0 }}>{c.landing.previewArticlesSub}</p>
          </div>
          <Link href={ROUTES.ARTICLES} style={{ fontSize: 13, fontWeight: 700, color: COLORS.RED, whiteSpace: "nowrap" }} className="sc-link-btn">
            {c.landing.previewArticlesCta} →
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {featured.map((a) => (
            <Link
              key={a.slug}
              href={ROUTES.article(a.slug)}
              className="sc-card"
              style={{ display: "block", background: "#fff", border: "1px solid #E4E0DB", borderRadius: 16, overflow: "hidden", textDecoration: "none" }}
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
                <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.BLACK, lineHeight: 1.25, margin: "0 0 8px", fontFamily: "Manrope, sans-serif" }}>
                  {a.title}
                </h3>
                <p style={{ fontSize: 13, color: "#6A6A6A", lineHeight: 1.5, margin: "0 0 10px" }}>{a.excerpt}</p>
                <span style={{ fontSize: 12, color: "#9A9A9A", display: "inline-flex", alignItems: "center", gap: 5 }}>
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
            background: "#fff",
            border: "1px solid #E4E0DB",
            borderRadius: 22,
            padding: "28px 26px",
          }}
        >
          <div>
            <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "clamp(24px,4vw,34px)", textTransform: "uppercase", color: COLORS.BLACK, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="camera" size={24} color={COLORS.RED} /> {c.landing.previewScanTitle}
            </h2>
            <p style={{ fontSize: 15, color: "#5A5A5A", lineHeight: 1.6, margin: "0 0 16px" }}>{c.landing.previewScanSub}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
              {c.landing.previewScanBullets.map((b) => (
                <li key={b} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "#3A3A3A" }}>
                  <span style={{ color: NUTRI.GREEN_DARK, fontWeight: 700 }}>✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            {isAuthenticated ? (
              <Link
                href={ROUTES.SCAN}
                className="sc-btn-primary"
                style={{ display: "inline-block", background: COLORS.RED, color: "#fff", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}
              >
                {c.landing.previewScanCta} →
              </Link>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <a
                  href={URLS.SIGN_UP}
                  className="sc-link-btn"
                  style={{ display: "inline-block", background: COLORS.RED, color: "#fff", borderRadius: 12, padding: "12px 22px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}
                >
                  {c.teaser.ctaPrimary} →
                </a>
                <a href={URLS.LOGIN} style={{ color: COLORS.BLACK, fontSize: 13, fontWeight: 600, textDecoration: "underline", opacity: 0.75 }}>
                  {c.teaser.ctaSecondary}
                </a>
              </div>
            )}
          </div>
          {/* Simple scan mock */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 280, border: "1px solid #E4E0DB", borderRadius: 18, overflow: "hidden", boxShadow: "0 16px 40px -22px rgba(20,20,20,0.3)" }}>
              <div style={{ height: 120, background: "linear-gradient(135deg,#FCEBED,#DCFCE7)", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.RED }}><Icon name="bowl" size={44} strokeWidth={1.4} /></div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.BLACK, marginBottom: 8 }}>Nasi Goreng</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 30, color: COLORS.RED, fontVariantNumeric: "tabular-nums" }}>~400</span>
                  <span style={{ fontSize: 12, color: "#9A9A9A" }}>kkal / porsi</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { l: "P", v: "12g", col: NUTRI.BLUE },
                    { l: "K", v: "50g", col: NUTRI.AMBER },
                    { l: "L", v: "17g", col: COLORS.RED },
                  ].map((m) => (
                    <div key={m.l} style={{ flex: 1, textAlign: "center", background: "#F6F4F1", borderRadius: 8, padding: "6px 0" }}>
                      <div style={{ fontSize: 10, color: m.col, fontWeight: 700 }}>{m.l}</div>
                      <div style={{ fontSize: 12, color: COLORS.BLACK, fontVariantNumeric: "tabular-nums" }}>{m.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter lang={lang} />

      {/* Stack hero to one column on narrow screens */}
      <style>{`
        @media (max-width: 860px) {
          .ct-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
