import { t, Lang } from "../lib/i18n";
import { URLS } from "../lib/constants";

/**
 * Shared footer for the new feature pages (landing, articles, tracker, meal
 * plan). Reuses the existing footer copy (t.footerTagline / footerDisclaimer)
 * so the health disclaimer stays identical to the one ScanPage already shows.
 * ScanPage keeps its own inline footer — this does not touch it.
 */
export function SiteFooter({ lang }: { lang: Lang }) {
  const tr = t[lang];
  return (
    <footer style={{ background: "#141414", color: "#EFEDEA", marginTop: 48 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <a href={URLS.MY_20FIT} style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, color: "#D62828" }}>
            20FIT
          </a>
          <span style={{ width: 1, height: 18, background: "#3A3A3A" }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Calorie Tracker</span>
        </div>
        <p style={{ fontSize: 13, color: "#B8B8B8", maxWidth: 620, lineHeight: 1.6, margin: "0 0 14px" }}>
          {tr.footerTagline}
        </p>
        <p style={{ fontSize: 11, color: "#7A7A7A", maxWidth: 720, lineHeight: 1.6, margin: 0 }}>
          {tr.footerDisclaimer}
        </p>
      </div>
    </footer>
  );
}
