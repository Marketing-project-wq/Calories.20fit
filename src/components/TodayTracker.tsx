import { Translations } from "../lib/i18n";
import { DailyFoodItem, MemberProfile } from "../lib/memberTracker";
import { dailyCalorieGoal, dailyMacroTargets } from "../lib/nutrition";

// Mirrors ScanPage.tsx's local glassmorphism design tokens (not the header's
// COLORS.*) — this component is meant to sit visually inside that same
// result-card language, both embedded in ScanPage's result tabs and as
// InsightPage's standalone content.
const RED = "#D62828";
const BLACK = "#141414";
const BORDER = "#E4E0DB";

/**
 * Target harian, macro, dan log makanan hari ini — MIRIP tampilan
 * my.20fit.id/calories (rumus target/macro sama, lihat src/lib/nutrition.ts),
 * tapi datanya BUKAN tiruan: langsung dari my20fit_daily_log/my20fit_profile
 * yang juga dibaca my.20fit.id (lihat src/lib/memberTracker.ts) — jadi apa
 * yang tampil di sini itu akun yang sama, bukan salinan/API terpisah.
 */
export function TodayTracker({ tr, loading, error, profile, items, onRetry }: {
  tr: Translations; loading: boolean; error: string | null;
  profile: MemberProfile | null; items: DailyFoodItem[] | null; onRetry: () => void;
}) {
  if (loading && items === null) {
    return (
      <div style={{ padding: "24px 18px", textAlign: "center" }}>
        <span style={{ width: 28, height: 28, borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: RED, display: "inline-block", animation: "scSpin .9s linear infinite" }} />
      </div>
    );
  }
  if (error && items === null) {
    return (
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
        <span style={{ fontSize: 12, color: RED }}>{tr.summaryLoadError}</span>
        <button onClick={onRetry} className="sc-btn-primary" style={{ background: RED, color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontFamily: "inherit", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>{tr.retryBtn}</button>
      </div>
    );
  }

  const list = items || [];
  const target = dailyCalorieGoal(profile);
  const macroTarget = dailyMacroTargets(profile, target);
  const consumed = list.reduce((s, it) => s + (Number(it.kcal) || 0), 0);
  const remaining = target - consumed;
  const macroConsumed = list.reduce((acc, it) => ({ p: acc.p + (Number(it.p) || 0), c: acc.c + (Number(it.c) || 0), f: acc.f + (Number(it.f) || 0) }), { p: 0, c: 0, f: 0 });
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
  const profileIncomplete = !profile || !profile.weight_kg || !profile.height_cm;

  const macroRows: { label: string; value: number; target: number; color: string }[] = [
    { label: tr.protein, value: macroConsumed.p, target: macroTarget.p, color: "#2D4E8F" },
    { label: tr.carbs, value: macroConsumed.c, target: macroTarget.c, color: "#D97706" },
    { label: tr.fat, value: macroConsumed.f, target: macroTarget.f, color: RED },
  ];

  return (
    <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Target / consumed / remaining */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
          <span style={{ fontSize: 9, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 3 }}>{tr.summaryTargetLabel}</span>
          <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, color: BLACK }}>{target}</span>
        </div>
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
          <span style={{ fontSize: 9, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 3 }}>{tr.summaryConsumedLabel}</span>
          <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, color: RED }}>{consumed}</span>
        </div>
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
          <span style={{ fontSize: 9, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 3 }}>{remaining < 0 ? tr.summaryOverLabel : tr.summaryRemainingLabel}</span>
          <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, color: remaining < 0 ? RED : "#2F7D5B" }}>{Math.abs(remaining)}</span>
        </div>
      </div>

      <div>
        <div style={{ height: 6, borderRadius: 999, background: BORDER, overflow: "hidden" }}>
          <div style={{ height: 6, width: `${pct}%`, borderRadius: 999, background: pct >= 100 ? RED : "#2F7D5B" }} />
        </div>
      </div>

      {profileIncomplete && <span style={{ fontSize: 11, color: "#9A9A9A" }}>{tr.summaryEstimatedNote}</span>}

      {/* Macro breakdown: consumed vs target */}
      <div>
        <span style={{ fontSize: 10, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 8 }}>{tr.summaryMacroTitle}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {macroRows.map(m => (
            <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: "#6A6A6A" }}>{m.label}</span>
                <span style={{ color: BLACK, fontWeight: 600 }}>{Math.round(m.value)}g / {m.target}g</span>
              </div>
              <div style={{ height: 4, borderRadius: 999, background: BORDER, overflow: "hidden" }}>
                <div style={{ height: 4, width: `${m.target > 0 ? Math.min(100, Math.round((m.value / m.target) * 100)) : 0}%`, borderRadius: 999, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's food log */}
      <div>
        <span style={{ fontSize: 10, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 8 }}>{tr.summaryLogTitle}</span>
        {list.length === 0 ? (
          <p style={{ fontSize: 12, color: "#8A8A8A", margin: 0 }}>{tr.summaryEmptyLog}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {list.map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 12, padding: "7px 0", borderBottom: i < list.length - 1 ? `1px solid #F4F2F0` : "none" }}>
                <span style={{ color: "#9A9A9A", fontSize: 11, flexShrink: 0 }}>{it.t}</span>
                <span style={{ flex: 1, color: "#3A3A3A" }}>{it.name}</span>
                <span style={{ color: BLACK, fontWeight: 600, flexShrink: 0 }}>{Math.round(it.kcal)} {tr.kcal}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <span style={{ fontSize: 10, color: "#B0B0B0", textAlign: "center" }}>
        {tr.summarySyncNote}
      </span>
    </div>
  );
}
