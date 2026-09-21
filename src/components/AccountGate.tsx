import { COLORS, NUTRI } from "../lib/constants";
import { cc } from "../lib/calorieCopy";
import { Lang } from "../lib/i18n";
import { Link } from "../lib/router";
import { Icon, IconName } from "./Icon";

/**
 * Shared "you need an account" wall for pages/features gated behind sign-in
 * (tracker, meal plan, article full-read, unlimited search).
 *
 * Auth in this app is CENTRALISED at my.20fit.id: this app never runs its own
 * sign-up form — it hands off to my.20fit.id/login?...&next=calories (URLS.*),
 * which authenticates + onboards the member there and SSO-returns them here
 * with a session (see src/hooks/useAuth.ts + src/lib/constants.ts). So the
 * brief's /calories/register + /calories/login screens are these CTAs, not a
 * parallel Supabase auth form that would fork account state, onboarding, and
 * profile schema away from my.20fit.id.
 */
export function AccountGate({
  lang,
  title,
  sub,
  bullets = [],
  icon = "lock",
}: {
  lang: Lang;
  title?: string;
  sub?: string;
  bullets?: readonly string[];
  icon?: IconName;
}) {
  const g = cc(lang).gate;
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 20px" }}>
      <div
        style={{
          borderRadius: 22,
          border: `1px solid ${NUTRI.GREEN_TINT}`,
          background: "var(--surface)",
          boxShadow: "var(--glass-shadow)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          overflow: "hidden",
        }}
      >
        <div style={{ height: 6, background: `linear-gradient(90deg, ${COLORS.RED}, ${NUTRI.GREEN})` }} />
        <div style={{ padding: "28px 24px" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: NUTRI.GREEN_TINT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: NUTRI.GREEN_DARK,
              marginBottom: 16,
            }}
          >
            <Icon name={icon} size={24} />
          </div>
          <h2
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontSize: 28,
              lineHeight: 1.05,
              textTransform: "uppercase",
              color: "var(--text)",
              margin: "0 0 10px",
            }}
          >
            {title || g.defaultTitle}
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-muted)", margin: "0 0 18px" }}>
            {sub || g.defaultSub}
          </p>

          {bullets.length > 0 && (
            <ul style={{ listStyle: "none", margin: "0 0 22px", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {bullets.map((b) => (
                <li key={b} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: "var(--text-muted)" }}>
                  <span style={{ color: NUTRI.GREEN_DARK, fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link
              href="/register"
              className="sc-btn-primary"
              style={{
                display: "block",
                textAlign: "center",
                background: "var(--brand)",
                color: "var(--on-brand)",
                borderRadius: 12,
                padding: "13px 18px",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {g.signUp}
            </Link>
            <Link
              href="/login"
              className="sc-link-btn"
              style={{
                display: "block",
                textAlign: "center",
                color: "var(--text)",
                borderRadius: 12,
                padding: "11px 18px",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {g.login}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
