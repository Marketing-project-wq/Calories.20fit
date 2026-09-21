// Daily meal-plan suggestion, embedded inside the tracker page. Reuses the
// profile + calorie target the tracker already loaded; picks one recipe per
// meal slot from my.20fit.id's Content API v1 catalog (see
// src/lib/contentRecipes.ts + src/lib/mealPlan.ts) and lets the user shuffle
// for variety. Recipes load async — unlike the former local-database version
// this needs a loading state, and an honest fallback if the catalog is
// empty (e.g. the Content API key isn't set up yet on my.20fit.id).
import { useEffect, useMemo, useState } from "react";
import { NUTRI } from "../../lib/constants";
import { t, Lang } from "../../lib/i18n";
import { cc } from "../../lib/calorieCopy";
import { MemberProfile, MealType } from "../../lib/memberTracker";
import { generateMealPlanFromRecipes, dayOfYearSeed } from "../../lib/mealPlan";
import { getContentRecipes, ContentRecipe, recipeDetailUrl } from "../../lib/contentRecipes";
import { Icon, IconName } from "../Icon";

const BORDER = "var(--border)";
const MEAL_ICON: Record<MealType, IconName> = { breakfast: "egg", lunch: "bowl", dinner: "utensils", snack: "bowl" };

export function MealPlanSection({ lang, target, profile, ssoTokens }: { lang: Lang; target: number; profile: MemberProfile | null; ssoTokens: { access_token: string; refresh_token: string } | null }) {
  const tr = t[lang];
  const c = cc(lang);
  const mp = c.mealPlan;
  const [seed, setSeed] = useState(() => dayOfYearSeed());
  const [recipes, setRecipes] = useState<ContentRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getContentRecipes({ lang, source: "all", limit: 100 }).then((r) => {
      if (!cancelled) { setRecipes(r); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [lang]);

  const plan = useMemo(() => generateMealPlanFromRecipes(recipes, target, seed), [recipes, target, seed]);
  const goalKey = (profile?.main_goal as keyof typeof mp.goals) || "maintain";
  const goalName = mp.goals[goalKey] || mp.goals.maintain;

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: "var(--text-subtle)", fontWeight: 700, margin: "18px 2px 8px" }}>
        {mp.pageTitle}
      </div>
      <div style={{ background: "var(--surface)", border: `1px solid var(--glass-hi)`, borderRadius: 20, padding: 18, boxShadow: "var(--glass-shadow)", color: "var(--text)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)" }}>
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
          <button onClick={() => setSeed((s) => s + 1)} disabled={loading || !plan} className="sc-btn-ghost" style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, fontWeight: 700, color: "var(--text)", background: "var(--surface)", cursor: loading || !plan ? "default" : "pointer", opacity: loading || !plan ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Icon name="refresh" size={14} /> {mp.regenerate}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "24px 10px" }}>
            <div className="w-8 h-8 border-4 rounded-full animate-spin inline-block" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} />
          </div>
        ) : !plan ? (
          <div style={{ textAlign: "center", padding: "20px 10px", fontSize: 13, color: "var(--text-soft)", lineHeight: 1.5 }}>
            {lang === "id" ? "Menu belum tersedia saat ini." : "No menu available right now."}
          </div>
        ) : (
          <>
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
                      <div
                        key={it.key}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < meal.items.length - 1 ? `1px solid ${BORDER}` : "none" }}
                      >
                        <div style={{ width: 52, height: 52, borderRadius: 12, flex: "0 0 auto", overflow: "hidden", position: "relative", background: "var(--surface-inset)", display: "grid", placeItems: "center", fontSize: 24 }}>
                          {it.emoji || "🍲"}
                          {it.photoUrl && (
                            <img
                              src={it.photoUrl}
                              alt=""
                              loading="lazy"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 650, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
                          <div style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{it.kcal} {tr.kcal}</div>
                        </div>
                        <a
                          href={recipeDetailUrl(it.key, ssoTokens)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ flex: "0 0 auto", fontSize: 12, fontWeight: 700, padding: "8px 13px", borderRadius: 999, background: "var(--brand)", color: "var(--on-brand)", textDecoration: "none", whiteSpace: "nowrap" }}
                        >
                          {mp.seeRecipe}
                        </a>
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
          </>
        )}

        <p style={{ fontSize: 12, color: "var(--text-faint)", lineHeight: 1.6, margin: "14px 0 0", borderLeft: `3px solid ${NUTRI.GREEN}`, paddingLeft: 10 }}>{mp.note}</p>
      </div>
    </div>
  );
}
