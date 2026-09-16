import { COLORS, NUTRI, ROUTES } from "../lib/constants";
import { Lang } from "../lib/i18n";
import { cc } from "../lib/calorieCopy";
import { useAuth } from "../hooks/useAuth";
import { Link } from "../lib/router";
import { FoodSearch } from "../components/FoodSearch";
import { ScanPage } from "./ScanPage";

/**
 * /scan = two ways to check a food's calories:
 *   1. Search the food database (this section) — guests capped at 3/day,
 *      members unlimited with category browse.
 *   2. AI photo scan (the existing ScanPage below, untouched).
 *
 * Composition only: ScanPage keeps its own hero/tool/marketing intact; we
 * just mount a search card above it so the route matches the brief's
 * "scan/search" surface without editing that 864-line file.
 */
export function ScanRoute({ lang }: { lang: Lang }) {
  const f = cc(lang).food;
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div>
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 8px" }}>
        <div style={{ background: "#fff", border: `1px solid #E4E0DB`, borderRadius: 18, padding: "20px 18px", boxShadow: "0 10px 34px -22px rgba(20,20,20,0.22)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 22 }}>🔎</span>
            <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 24, textTransform: "uppercase", color: COLORS.BLACK, margin: 0 }}>{f.searchTitle}</h2>
          </div>
          <p style={{ fontSize: 13.5, color: "#6A6A6A", margin: "0 0 16px" }}>{f.searchSub}</p>

          {isLoading ? (
            <div style={{ padding: "18px 0", textAlign: "center" }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", border: `3px solid #E4E0DB`, borderTopColor: COLORS.RED, display: "inline-block", animation: "scSpin .9s linear infinite" }} />
            </div>
          ) : (
            <FoodSearch lang={lang} variant={isAuthenticated ? "member" : "guest"} />
          )}

          {isAuthenticated && (
            <p style={{ fontSize: 12.5, color: NUTRI.GREEN_DARK, margin: "14px 0 0" }}>
              💡{" "}
              <Link href={ROUTES.TRACKER} style={{ color: NUTRI.GREEN_DARK, fontWeight: 700, textDecoration: "underline" }}>
                {lang === "id" ? "Buka Tracker untuk simpan makanan ke log harian" : "Open Tracker to save food to your daily log"}
              </Link>
            </p>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 4px 0" }}>
          <span style={{ flex: 1, height: 1, background: "#E4E0DB" }} />
          <span style={{ fontSize: 12, color: "#9A9A9A", textTransform: "uppercase", letterSpacing: ".08em" }}>
            {lang === "id" ? "atau scan foto" : "or scan a photo"}
          </span>
          <span style={{ flex: 1, height: 1, background: "#E4E0DB" }} />
        </div>
      </section>

      <ScanPage lang={lang} />

      <style>{`@keyframes scSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
