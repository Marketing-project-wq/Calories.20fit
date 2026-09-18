// Daily meal-plan suggestion, embedded inside the tracker page (no longer a
// standalone route). Reuses the profile + calorie target the tracker already
// loaded; generates an example day from the Indonesian food database and lets
// the user shuffle for variety. Content ported from the former MealPlanPage.
import { useMemo, useState } from "react";
import { NUTRI } from "../../lib/constants";
import { t, Lang } from "../../lib/i18n";
import { cc } from "../../lib/calorieCopy";
import { MemberProfile, MealType } from "../../lib/memberTracker";
import { generateMealPlan, dayOfYearSeed } from "../../lib/mealPlan";
import { Icon, IconName } from "../Icon";

const BORDER = "var(--border)";
const MEAL_ICON: Record<MealType, IconName> = { breakfast: "egg", lunch: "bowl", dinner: "utensils", snack: "bowl" };

export function MealPlanSection({ lang, target, profile }: { lang: Lang; target: number; profile: MemberProfile | null }) {
  const tr = t[lang];
  const c = cc(lang);
  const mp = c.mealPlan;
  const [seed, setSeed] = useState(() => dayOfYearSeed());
  const plan = useMemo(() => generateMealPlan(target, seed), [target, seed]);
  const goalKey = (profile?.main_goal as keyof typeof mp.goals) || "maintain";
  const goalName = mp.goals[goalKey] || mp.goals.maintain;

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-subtle)", fontWeight: 700, margin: "18px 2px 8px" }}>
        {mp.pageTitle}
      </div>
      <div style={{ background: "var(--surface)", border: `1px solid ${BORDER}`, borderRadius: 16, padding: 18, boxShadow: "0 8px 30px -20px rgba(20,20,20,0.25)", color: "var(--text)" }}>
        <p style={{ fontSize: 13, color: "var(--text-soft)", margin: "0 0 14px", lineHeight: 1.5 }}>{mp.sub}</p>

        {/* Summary bar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between", background: "var(--surface-inset)", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
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
            <div key={meal.meal} style={{ background: "var(--surface-inset)", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Icon name={MEAL_ICON[meal.meal]} size={16} /> {c.food[meal.meal]}
                </span>
                <span style={{ fontSize: 13, color: "var(--brand)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>~{meal.kcal} {tr.kcal}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {meal.items.map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13.5, padding: "7px 0", borderBottom: i < meal.items.length - 1 ? `1px solid ${BORDER}` : "none" }}>
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

        {/* Day total — inverse "chrome" surface so it stays prominent in both themes */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--inverse-surface)", color: "var(--inverse-text)", borderRadius: 14, padding: "14px 18px", marginTop: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{mp.dayTotal}</span>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 24, fontVariantNumeric: "tabular-nums" }}>{plan.kcal.toLocaleString("id-ID")} {tr.kcal}</span>
            <div style={{ fontSize: 11, color: "var(--inverse-text)", opacity: 0.66 }}>P {plan.p}g · K {plan.c}g · L {plan.f}g</div>
          </div>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-faint)", lineHeight: 1.6, margin: "14px 0 0", borderLeft: `3px solid ${NUTRI.GREEN}`, paddingLeft: 10 }}>{mp.note}</p>
      </div>
    </div>
  );
}
