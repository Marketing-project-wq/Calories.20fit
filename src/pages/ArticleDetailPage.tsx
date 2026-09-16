import { useEffect, useRef } from "react";
import { COLORS, NUTRI, ROUTES, URLS } from "../lib/constants";
import { Lang } from "../lib/i18n";
import { cc } from "../lib/calorieCopy";
import { Link } from "../lib/router";
import { useAuth } from "../hooks/useAuth";
import { Markdown, clipMarkdown } from "../components/Markdown";
import { SiteFooter } from "../components/SiteFooter";
import { getArticle, getRelated, CATEGORY_LABELS } from "../data/articles";
import { Icon } from "../components/Icon";

export function ArticleDetailPage({ lang, slug }: { lang: Lang; slug: string }) {
  const a = cc(lang).articles;
  const { isAuthenticated } = useAuth();
  const art = getArticle(slug);
  const barRef = useRef<HTMLDivElement>(null);

  // Reading-progress bar (updates a fixed bar's width directly, no re-renders).
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        const pct = max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0;
        if (barRef.current) barRef.current.style.width = pct + "%";
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [slug]);

  if (!art) {
    return (
      <div>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "72px 20px", textAlign: "center" }}>
          <div style={{ marginBottom: 12, color: "#B0ABA4" }}><Icon name="document" size={44} /></div>
          <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 30, textTransform: "uppercase", color: COLORS.BLACK, margin: "0 0 16px" }}>{a.notFound}</h1>
          <Link href={ROUTES.ARTICLES} className="sc-btn-primary" style={{ display: "inline-block", background: COLORS.RED, color: "#fff", borderRadius: 12, padding: "11px 20px", fontSize: 14, fontWeight: 700 }}>
            {a.backToList}
          </Link>
        </div>
        <SiteFooter lang={lang} />
      </div>
    );
  }

  const showFull = !art.isPremium || isAuthenticated;
  const body = showFull ? art.content : clipMarkdown(art.content, 0.3);
  const related = getRelated(slug, 3);
  const publishedLabel = new Date(art.publishedAt).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ background: "#fff" }}>
      <div ref={barRef} className="ct-readbar" style={{ width: "0%" }} />

      <article style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 8px" }}>
        <Link href={ROUTES.ARTICLES} style={{ fontSize: 13, fontWeight: 700, color: COLORS.RED }} className="sc-link-btn">
          ← {a.backToList}
        </Link>

        {/* Header */}
        <div style={{ margin: "18px 0 10px" }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: art.accent }}>
            {CATEGORY_LABELS[lang][art.category]}
          </span>
          {art.isPremium && (
            <span style={{ marginLeft: 10, fontSize: 11, color: "#9A9A9A", display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Icon name="lock" size={11} /> {a.premium}
            </span>
          )}
        </div>
        <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.05, textTransform: "uppercase", color: COLORS.BLACK, margin: "0 0 14px" }}>
          {art.title}
        </h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", fontSize: 13, color: "#8A8A8A", marginBottom: 20 }}>
          <span>{a.byAuthor(art.author)}</span>
          <span>·</span>
          <span>{a.updated} {publishedLabel}</span>
          <span>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon name="clock" size={13} /> {a.minRead(art.readTimeMinutes)}
          </span>
        </div>

        {/* Cover */}
        <div style={{ height: 180, background: `linear-gradient(135deg, ${art.accent}2e, ${art.accent}08)`, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", color: art.accent, marginBottom: 26 }}>
          <Icon name={art.coverIcon} size={60} strokeWidth={1.3} />
        </div>

        {/* Body */}
        <div style={{ position: "relative" }}>
          <Markdown source={body} />

          {/* Preview gate for premium + guest */}
          {!showFull && (
            <div style={{ position: "relative", marginTop: -80 }}>
              <div style={{ height: 80, background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 92%)" }} />
              <div style={{ border: `1px solid ${NUTRI.GREEN_TINT}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 16px 40px -22px rgba(20,20,20,0.2)" }}>
                <div style={{ height: 6, background: `linear-gradient(90deg, ${COLORS.RED}, ${NUTRI.GREEN})` }} />
                <div style={{ padding: "26px 24px", textAlign: "center" }}>
                  <div style={{ marginBottom: 10, color: COLORS.RED, display: "flex", justifyContent: "center" }}><Icon name="lock" size={30} /></div>
                  <h3 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 26, textTransform: "uppercase", color: COLORS.BLACK, margin: "0 0 8px" }}>{a.gateTitle}</h3>
                  <p style={{ fontSize: 14, color: "#5A5A5A", lineHeight: 1.6, margin: "0 auto 18px", maxWidth: 420 }}>{a.gateSub}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320, margin: "0 auto" }}>
                    <a href={URLS.SIGN_UP} className="sc-btn-primary" style={{ background: COLORS.RED, color: "#fff", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
                      {cc(lang).gate.signUp} →
                    </a>
                    <a href={URLS.LOGIN} style={{ color: COLORS.BLACK, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                      {cc(lang).gate.login}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sources + disclaimer (full read only) */}
        {showFull && (
          <>
            <div style={{ marginTop: 34, borderTop: `1px solid #E4E0DB`, paddingTop: 20 }}>
              <h3 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, textTransform: "uppercase", color: COLORS.BLACK, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="book" size={18} /> {a.sourcesTitle}
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                {art.sources.map((s) => (
                  <li key={s} style={{ fontSize: 13, color: "#5A5A5A", lineHeight: 1.5 }}>{s}</li>
                ))}
              </ul>
            </div>
            <p style={{ marginTop: 20, fontSize: 12.5, color: "#8A8A8A", lineHeight: 1.6, borderLeft: `3px solid ${NUTRI.AMBER}`, background: "#FFFBEB", padding: "12px 14px", borderRadius: "0 10px 10px 0", display: "flex", alignItems: "flex-start", gap: 8 }}>
              <Icon name="medical" size={15} color={NUTRI.AMBER} style={{ marginTop: 1, flexShrink: 0 }} /> {art.disclaimer}
            </p>
          </>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, textTransform: "uppercase", color: COLORS.BLACK, margin: "0 0 14px" }}>{a.relatedTitle}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 14 }}>
              {related.map((r) => (
                <Link key={r.slug} href={ROUTES.article(r.slug)} className="sc-card" style={{ display: "block", background: "#fff", border: "1px solid #E4E0DB", borderRadius: 14, padding: "14px 16px", textDecoration: "none" }}>
                  <div style={{ marginBottom: 8, color: r.accent }}><Icon name={r.coverIcon} size={22} /></div>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: r.accent }}>{CATEGORY_LABELS[lang][r.category]}</span>
                  <h4 style={{ fontFamily: "Manrope, sans-serif", fontSize: 14.5, fontWeight: 700, color: COLORS.BLACK, lineHeight: 1.3, margin: "6px 0 0" }}>{r.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <SiteFooter lang={lang} />
    </div>
  );
}
