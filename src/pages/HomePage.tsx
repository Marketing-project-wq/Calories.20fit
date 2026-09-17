import { useEffect, useState } from "react";
import { COLORS, NUTRI, ROUTES, MY20FIT } from "../lib/constants";
import { Lang } from "../lib/i18n";
import { cc } from "../lib/calorieCopy";
import { Link } from "../lib/router";
import { Icon } from "../components/Icon";
import { DailyFoodItem, MemberProfile, getMemberProfile, getTodayFoodItems, itemMeal } from "../lib/memberTracker";
import { dailyCalorieGoal } from "../lib/nutrition";
import { FastingSettings, getFastingSettings, fastingStatus } from "../lib/memberFasting";

// Logged-in landing page (renders at "/" instead of LandingPage once
// isAuthenticated — see App.tsx). Reads everything directly from the same
// Supabase tables my.20fit.id's own /calories page uses (my20fit_profile,
// my20fit_daily_log, my20fit_fasting — see src/lib/memberTracker.ts and
// src/lib/memberFasting.ts for why that's safe: RLS already scopes every
// row to the logged-in user, no bridge API needed), so the numbers here
// always match my.20fit.id exactly. Deep editing (changing the fasting
// schedule, full history, menu recommendations) still lives on the
// /tracker embed (src/pages/InsightPage.tsx) — this page is a fast
// at-a-glance summary + the scan entry point, not a replacement for it.
export function HomePage({ lang }: { lang: Lang }) {
  const h = cc(lang).home;
  const f = cc(lang).food;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [items, setItems] = useState<DailyFoodItem[]>([]);
  const [fasting, setFasting] = useState<FastingSettings | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, i, fs] = await Promise.all([getMemberProfile(), getTodayFoodItems(), getFastingSettings()]);
        if (cancelled) return;
        setProfile(p);
        setItems(i);
        setFasting(fs);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: COLORS.RED, borderTopColor: "transparent", margin: "0 auto 14px" }} />
        <p style={{ fontSize: 14, color: "#6A6A6A" }}>{h.loading}</p>
      </div>
    );
  }

  const target = dailyCalorieGoal(profile);
  const consumed = items.reduce((s, it) => s + (Number(it.kcal) || 0), 0);
  const remaining = Math.round(target - consumed);
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  const status = fastingStatus(fasting);
  const sortedItems = [...items].sort((a, b) => (b.t || "").localeCompare(a.t || ""));

  return (
    <div style={{ background: "#EFEDEA", minHeight: "70vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px 60px" }}>
        {/* Upload / scan CTA */}
        <Link
          href={ROUTES.SCAN}
          className="sc-card"
          style={{ display: "flex", alignItems: "center", gap: 16, background: COLORS.RED, color: "#fff", borderRadius: 18, padding: "22px 20px", textDecoration: "none", marginBottom: 16 }}
        >
          <Icon name="camera" size={30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, textTransform: "uppercase", lineHeight: 1.1 }}>{h.uploadTitle}</div>
            <div style={{ fontSize: 13, opacity: 0.9 }}>{h.uploadSub}</div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{h.uploadCta}</span>
        </Link>

        {/* Calories remaining today */}
        <div className="sc-card" style={{ background: "#fff", border: "1px solid #E4E0DB", borderRadius: 16, padding: "18px 20px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, flexWrap: "wrap", gap: 4 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{h.caloriesTitle}</h3>
            <span style={{ fontSize: 12, color: "#8A8A8A" }}>
              {h.caloriesConsumed} {Math.round(consumed)} / {h.caloriesTarget} {Math.round(target)} kkal
            </span>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: "#F0EDE8", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: remaining < 0 ? COLORS.RED : NUTRI.GREEN, borderRadius: 999, transition: "width .3s" }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: remaining < 0 ? COLORS.RED : NUTRI.GREEN_DARK }}>
            {remaining >= 0 ? h.caloriesRemaining(remaining) : h.caloriesOver(Math.abs(remaining))}
          </div>
        </div>

        {/* Intermittent fasting reminder */}
        <div className="sc-card" style={{ background: "#fff", border: "1px solid #E4E0DB", borderRadius: 16, padding: "16px 20px", marginBottom: 14, display: "flex", alignItems: "center", gap: 14 }}>
          <Icon name="clock" size={22} color={NUTRI.BLUE} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{h.fastingTitle}</div>
            {status.state === "unset" && (
              <div style={{ fontSize: 12.5, color: "#8A8A8A" }}>
                {h.fastingUnset} — <a href={`${MY20FIT}/calories`} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.RED, fontWeight: 600, textDecoration: "none" }}>{h.fastingSetupCta}</a>
              </div>
            )}
            {status.state === "eating" && (
              <div style={{ fontSize: 12.5, color: "#5A5A5A" }}>
                {fasting?.style ? `${fasting.style} · ` : ""}
                {h.fastingEating} · {h.fastingClosesAt(status.closesAt)}
              </div>
            )}
            {status.state === "fasting" && (
              <div style={{ fontSize: 12.5, color: "#5A5A5A" }}>
                {fasting?.style ? `${fasting.style} · ` : ""}
                {h.fastingFasting} · {status.opensTomorrow ? h.fastingOpensTomorrow(status.opensAt) : h.fastingOpensAt(status.opensAt)}
              </div>
            )}
          </div>
        </div>

        {/* Today's food log */}
        <div className="sc-card" style={{ background: "#fff", border: "1px solid #E4E0DB", borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{h.logTitle}</h3>
            <Link href={ROUTES.TRACKER} style={{ fontSize: 12, color: COLORS.RED, fontWeight: 600, textDecoration: "none" }}>
              {h.viewFullTracker}
            </Link>
          </div>

          {sortedItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 10px" }}>
              <div style={{ color: "#B0ABA4", marginBottom: 8, display: "flex", justifyContent: "center" }}>
                <Icon name="inbox" size={32} />
              </div>
              <p style={{ fontSize: 13, color: "#8A8A8A", marginBottom: 8 }}>{h.logEmpty}</p>
              <Link href={ROUTES.SCAN} style={{ fontSize: 13, color: COLORS.RED, fontWeight: 700, textDecoration: "none" }}>
                {h.logEmptyCta}
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sortedItems.map((item, i) => {
                const open = openIdx === i;
                return (
                  <div key={i} style={{ border: "1px solid #E8E8E8", borderRadius: 12, overflow: "hidden" }}>
                    <button
                      onClick={() => setOpenIdx(open ? null : i)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fff", border: "none", cursor: "pointer", textAlign: "left" }}
                    >
                      <span style={{ fontSize: 11, color: "#9A9A9A", flexShrink: 0 }}>{item.t}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                      <span style={{ fontSize: 11, color: "#9A9A9A", flexShrink: 0 }}>{f[itemMeal(item)]}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{Math.round(item.kcal)} kkal</span>
                      <span style={{ fontSize: 14, color: "#B0ABA4", flexShrink: 0 }}>{open ? "−" : "+"}</span>
                    </button>
                    {open && (
                      <div style={{ padding: "10px 12px", background: "#FAF9F7", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, fontSize: 11.5, borderTop: "1px solid #E8E8E8" }}>
                        <div>
                          <div style={{ color: "#9A9A9A" }}>{h.nutrientCalories}</div>
                          <div style={{ fontWeight: 700 }}>{Math.round(item.kcal)} kkal</div>
                        </div>
                        <div>
                          <div style={{ color: "#9A9A9A" }}>{h.nutrientProtein}</div>
                          <div style={{ fontWeight: 700 }}>{Math.round(item.p)} g</div>
                        </div>
                        <div>
                          <div style={{ color: "#9A9A9A" }}>{h.nutrientCarbs}</div>
                          <div style={{ fontWeight: 700 }}>{Math.round(item.c)} g</div>
                        </div>
                        <div>
                          <div style={{ color: "#9A9A9A" }}>{h.nutrientFat}</div>
                          <div style={{ fontWeight: 700 }}>{Math.round(item.f)} g</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
