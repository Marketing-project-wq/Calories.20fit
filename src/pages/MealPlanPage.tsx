import { useEffect, useMemo, useState } from "react";
import { COLORS, NUTRI, ROUTES } from "../lib/constants";
import { t, Lang } from "../lib/i18n";
import { cc } from "../lib/calorieCopy";
import { useAuth } from "../hooks/useAuth";
import { Link } from "../lib/router";
import { AccountGate } from "../components/AccountGate";
import { SiteFooter } from "../components/SiteFooter";
import { MemberProfile, MealType, getMemberProfile } from "../lib/memberTracker";
import { dailyCalorieGoal } from "../lib/nutrition";
import { generateMealPlan, dayOfYearSeed } from "../lib/mealPlan";
import { Icon, IconName } from "../components/Icon";

const BORDER = "var(--border)";
const MEAL_ICON: Record<MealType, IconName> = { breakfast: "egg", lunch: "bowl", dinner: "utensils", snack: "bowl" };

export function MealPlanPage({ lang }: { lang: Lang }) {
  const tr = t[lang];
  const c = cc(lang);
  const mp = c.mealPlan;
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [seed, setSeed] = useState(() => dayOfYearSeed());

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      setLoading(true);
      try {
        setProfile(await getMemberProfile());
      } catch {
        /* fall back to default target */
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    })();
  }, [isAuthenticated]);

  const target = dailyCalorieGoal(profile);
  const plan = useMemo(() => generateMealPlan(target, seed), [target, seed]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div>
        <AccountGate lang={lang} icon="utensils" title={mp.gateTitle} sub={mp.gateSub} bullets={mp.gateBullets} />
        <SiteFooter lang={lang} />
      </div>
    );
  }

  const goalKey = (profile?.main_goal as keyof typeof mp.goals) || "maintain";
  const goalName = mp.goals[goalKey] || mp.goals.maintain;

  return (
    <div>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 18px 8px" }}>
        <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 30, textTransform: "uppercase", color: "var(--text)", margin: "0 0 6px" }}>{mp.pageTitle}</h1>
        <p style={{ fontSize: 14, color: "var(--text-soft)", margin: "0 0 16px", lineHeight: 1.55 }}>{mp.sub}</p>

        {loading && !loaded ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <span style={{ width: 30, height: 30, borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: "var(--brand)", display: "inline-block", animation: "scSpin .9s linear infinite" }} />
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between", background: "var(--surface)", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 20 }}>
                <div>
                  <span style={{ fontSize: 10, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: ".05em", display: "block" }}>{mp.targetLabel}</span>
                  <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{target.toLocaleString("id-ID")} <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{tr.kcal}</span></span>
                </div>
                <div>
                  <span style={{ fontSize: 10, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: ".05em", display: "block" }}>{mp.goalLabel}</span>
                  <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, color: NUTRI.GREEN_DARK }}>{goalName}</span>
                </div>
              </div>
              <button onClick={() => setSeed((s) => s + 1)} className="sc-btn-ghost" style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 700, color: "var(--text)", background: "var(--surface)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="refresh" size={14} /> {mp.regenerate}
              </button>
            </div>

            {/* Meals */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {plan.meals.map((meal) => (
                <div key={meal.meal} style={{ background: "var(--surface)", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Icon name={MEAL_ICON[meal.meal]} size={16} /> {c.food[meal.meal]}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--brand)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>~{meal.kcal} {tr.kcal}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {meal.items.map((it, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13.5, padding: "7px 0", borderBottom: i < meal.items.length - 1 ? `1px solid var(--surface-2)` : "none" }}>
                        <span style={{ flex: 1, color: "var(--text-muted)", minWidth: 0 }}>
                          {it.food.name}
                          <span style={{ color: "var(--text-faint)", fontSize: 12 }}>
                            {" "}· {it.servings % 1 === 0 ? it.servings : it.servings.toFixed(2).replace(/0$/, "")}× {it.food.servingDescription || `${it.food.servingSize}${it.food.servingUnit}`}
                          </span>
                        </span>
                        <span style={{ color: "var(--text)", fontWeight: 600, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{it.kcal} {tr.kcal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Day total */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#141414", color: "#fff", borderRadius: 14, padding: "14px 18px", marginTop: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{mp.dayTotal}</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 24, fontVariantNumeric: "tabular-nums" }}>{plan.kcal.toLocaleString("id-ID")} {tr.kcal}</span>
                <div style={{ fontSize: 11, color: "#B8B8B8" }}>P {plan.p}g · K {plan.c}g · L {plan.f}g</div>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "var(--text-faint)", lineHeight: 1.6, margin: "14px 0 0", borderLeft: `3px solid ${NUTRI.GREEN}`, paddingLeft: 10 }}>{mp.note}</p>

            <Link href={ROUTES.TRACKER} className="sc-btn-primary" style={{ display: "inline-block", marginTop: 16, background: "var(--brand)", color: "var(--on-brand)", borderRadius: 12, padding: "12px 22px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              {mp.addToTracker} →
            </Link>
          </>
        )}
      </div>

      <SiteFooter lang={lang} />
      <style>{`@keyframes scSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
