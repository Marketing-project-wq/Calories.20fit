import { CSSProperties } from "react";
import { t, Lang } from "../lib/i18n";
import { URLS, CONTACT } from "../lib/constants";
import { UNIVERSAL_NAV_ITEMS } from "../lib/universalNav";

const LINK_STYLE: CSSProperties = { color: "#B8B8B8", fontSize: 13, textDecoration: "none", lineHeight: 1.9 };

/**
 * Shared footer for the new feature pages (landing, articles, tracker, meal
 * plan). Reuses the existing footer copy (t.footerTagline / footerDisclaimer)
 * so the health disclaimer stays identical to the one ScanPage already shows.
 * ScanPage keeps its own inline footer — this does not touch it.
 *
 * The "Ecosystem" column reuses UNIVERSAL_NAV_ITEMS (same list the app
 * switcher shows) rather than a separate hand-kept list, so it can't drift.
 * Contact details match the real ones my.20fit.id's own footer already uses
 * (PROFILE20FIT repo, login.html) instead of a guessed address.
 */
export function SiteFooter({ lang }: { lang: Lang }) {
  const tr = t[lang];
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: "#141414", color: "#EFEDEA", marginTop: 48 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "32px 48px", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 260px", minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <a href={URLS.MY_20FIT} style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, color: "var(--brand-bright)" }}>
                20FIT
              </a>
              <span style={{ width: 1, height: 18, background: "#3A3A3A" }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Calorie Tracker</span>
            </div>
            <p style={{ fontSize: 13, color: "#B8B8B8", maxWidth: 320, lineHeight: 1.6, margin: 0 }}>{tr.footerTagline}</p>
          </div>

          <div style={{ flex: "0 1 auto", minWidth: 160 }}>
            <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#7A7A7A", fontWeight: 700, marginBottom: 10 }}>
              {tr.footerEcosystem}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {UNIVERSAL_NAV_ITEMS.map((item) => (
                <a key={item.id} href={item.url} style={LINK_STYLE}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div style={{ flex: "0 1 auto", minWidth: 160 }}>
            <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#7A7A7A", fontWeight: 700, marginBottom: 10 }}>
              {tr.footerContact}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <a href={`mailto:${CONTACT.EMAIL}`} style={LINK_STYLE}>
                {CONTACT.EMAIL}
              </a>
              <a href={CONTACT.SITE} style={LINK_STYLE}>
                {CONTACT.SITE.replace("https://", "")}
              </a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #2A2A2A", marginTop: 28, paddingTop: 20 }}>
          <p style={{ fontSize: 11, color: "#7A7A7A", maxWidth: 720, lineHeight: 1.6, margin: "0 0 10px" }}>{tr.footerDisclaimer}</p>
          <p style={{ fontSize: 11, color: "#5C5C5C", margin: 0 }}>{tr.footerRights(year)}</p>
        </div>
      </div>
    </footer>
  );
}
