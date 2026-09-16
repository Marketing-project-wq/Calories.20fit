import { COLORS, NUTRI, ROUTES } from "../lib/constants";
import { cc } from "../lib/calorieCopy";
import { Lang } from "../lib/i18n";
import { Link } from "../lib/router";
import { SiteFooter } from "./SiteFooter";
import { Icon, IconName } from "./Icon";

/**
 * Temporary placeholder for feature pages built in a later phase, so every
 * route in the nav resolves to a real screen (never a dead link / 404) while
 * the build is in progress.
 */
export function ComingSoon({ lang, title, icon = "wrench" }: { lang: Lang; title?: string; icon?: IconName }) {
  const c = cc(lang).common;
  return (
    <div>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "72px 20px", textAlign: "center" }}>
        <div style={{ marginBottom: 12, color: "#B0ABA4" }}><Icon name={icon} size={48} /></div>
        <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 34, textTransform: "uppercase", color: COLORS.BLACK, margin: "0 0 8px" }}>
          {title || c.comingSoonTitle}
        </h1>
        <p style={{ fontSize: 15, color: "#6A6A6A", margin: "0 0 22px" }}>{c.comingSoonTitle}</p>
        <Link
          href={ROUTES.HOME}
          className="sc-link-btn"
          style={{ display: "inline-block", border: `1.5px solid ${NUTRI.GREEN}`, color: NUTRI.GREEN_DARK, borderRadius: 12, padding: "11px 20px", fontSize: 14, fontWeight: 700 }}
        >
          {c.backHome}
        </Link>
      </div>
      <SiteFooter lang={lang} />
    </div>
  );
}
