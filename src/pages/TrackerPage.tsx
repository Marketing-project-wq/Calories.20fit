import { useEffect, useMemo, useState } from "react";
import { COLORS, NUTRI } from "../lib/constants";
import { t, Lang } from "../lib/i18n";
import { cc } from "../lib/calorieCopy";
import { useAuth } from "../hooks/useAuth";
import { AccountGate } from "../components/AccountGate";
import { SiteFooter } from "../components/SiteFooter";
import { FoodSearch } from "../components/FoodSearch";
import {
  DailyFoodItem,
  MealType,
  MEAL_TYPES,
  MemberProfile,
  appendTodayFoodItem,
  getMemberProfile,
  getTodayFoodItems,
  itemMeal,
  nowHHMM,
} from "../lib/memberTracker";
import { dailyCalorieGoal, dailyMacroTargets } from "../lib/nutrition";
import { Food, scaleFood } from "../data/foods";

const BORDER = "#E4E0DB";
const MEAL_EMOJI: Record<MealType, string> = { breakfast: "🥚", lunch: "🍛", dinner: "🍽️", snack: "🍿" };

function progressColor(pct: number): string {
  if (pct > 100) return COLORS.RED;
  if (pct > 85) return NUTRI.AMBER;
  return NUTRI.GREEN;
}

export function TrackerPage({ lang }: { lang: Lang }) {
  const tr = t[lang];
  const c = cc(lang);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [items, setItems] = useState<DailyFoodItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add panel (null = closed, else the meal being added to)
  const [addMeal, setAddMeal] = useState<MealType | null>(null);
  const [addTab, setAddTab] = useState<"search" | "manual">("search");
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  // Manual entry form
  const [mName, setMName] = useState("");
  const [mKcal, setMKcal] = useState("");
  const [mP, setMP] = useState("");
  const [mC, setMC] = useState("");
  const [mF, setMF] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, i] = await Promise.all([getMemberProfile(), getTodayFoodItems()]);
      setProfile(p);
      setItems(i);
    } catch (err) {
      setError(err instanceof Error ? err.message : "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  const list = items || [];
  const target = dailyCalorieGoal(profile);
  const macroTarget = dailyMacroTargets(profile, target);
  const consumed = list.reduce((s, it) => s + (Number(it.kcal) || 0), 0);
  const remaining = target - consumed;
  const pct = target > 0 ? Math.round((consumed / target) * 100) : 0;
  const macroConsumed = list.reduce(
    (a, it) => ({ p: a.p + (Number(it.p) || 0), c: a.c + (Number(it.c) || 0), f: a.f + (Number(it.f) || 0) }),
    { p: 0, c: 0, f: 0 }
  );
  const profileIncomplete = !profile || !profile.weight_kg || !profile.height_cm;

  const groups = useMemo(
    () => MEAL_TYPES.map((meal) => ({ meal, items: list.filter((it) => itemMeal(it) === meal) })),
    [items]
  );

  const appendItem = async (item: DailyFoodItem, feedbackId: string) => {
    setSaving(true);
    setSaveErr(null);
    try {
      const updated = await appendTodayFoodItem(item);
      setItems(updated);
      setJustAdded(feedbackId);
      setTimeout(() => setJustAdded((v) => (v === feedbackId ? null : v)), 1600);
    } catch {
      setSaveErr(tr.saveToLogError);
    } finally {
      setSaving(false);
    }
  };

  const onAddFood = (food: Food, servings: number) => {
    if (!addMeal) return;
    const n = scaleFood(food, servings);
    const name = servings !== 1 ? `${food.name} (${servings}×)` : food.name;
    appendItem({ name, kcal: n.calories, p: n.protein, c: n.carbs, f: n.fat, t: nowHHMM(), m: addMeal }, food.id);
  };

  const onAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    const kcal = parseFloat(mKcal);
    if (!mName.trim() || !Number.isFinite(kcal)) return;
    const item: DailyFoodItem = {
      name: mName.trim(),
      kcal: Math.round(kcal),
      p: parseFloat(mP) || 0,
      c: parseFloat(mC) || 0,
      f: parseFloat(mF) || 0,
      t: nowHHMM(),
      m: addMeal || "snack",
    };
    appendItem(item, "manual");
    setMName(""); setMKcal(""); setMP(""); setMC(""); setMF("");
  };

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <div>
        <AccountGate lang={lang} icon="📊" title={c.tracker.gateTitle} sub={c.tracker.gateSub} bullets={c.tracker.gateBullets} />
        <SiteFooter lang={lang} />
      </div>
    );
  }

  const macroRows = [
    { label: tr.protein, value: macroConsumed.p, target: macroTarget.p, color: NUTRI.BLUE },
    { label: tr.carbs, value: macroConsumed.c, target: macroTarget.c, color: NUTRI.AMBER },
    { label: tr.fat, value: macroConsumed.f, target: macroTarget.f, color: COLORS.RED },
  ];

  return (
    <div>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 18px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 30, textTransform: "uppercase", color: COLORS.BLACK, margin: 0 }}>
            {c.tracker.pageTitle}
          </h1>
          <span style={{ fontSize: 13, color: "#8A8A8A" }}>
            {new Date().toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { weekday: "long", day: "numeric", month: "short" })}
          </span>
        </div>

        {loading && items === null ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <span style={{ width: 30, height: 30, borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: COLORS.RED, display: "inline-block", animation: "scSpin .9s linear infinite" }} />
          </div>
        ) : error && items === null ? (
          <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontSize: 13, color: COLORS.RED }}>{tr.summaryLoadError}</span>
            <button onClick={load} className="sc-btn-primary" style={{ background: COLORS.RED, color: "#fff", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700 }}>{tr.retryBtn}</button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "16px 16px 18px", marginBottom: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { label: tr.summaryTargetLabel, val: target, color: COLORS.BLACK },
                  { label: tr.summaryConsumedLabel, val: consumed, color: COLORS.RED },
                  { label: remaining < 0 ? tr.summaryOverLabel : tr.summaryRemainingLabel, val: Math.abs(remaining), color: remaining < 0 ? COLORS.RED : NUTRI.GREEN_DARK },
                ].map((s) => (
                  <div key={s.label} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                    <span style={{ fontSize: 9.5, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 4 }}>{s.label}</span>
                    <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.val.toLocaleString("id-ID")}</span>
                  </div>
                ))}
              </div>
              <div style={{ height: 8, borderRadius: 999, background: "#EFEDEA", overflow: "hidden" }}>
                <div className="sc-bar-fill" style={{ height: 8, width: `${Math.min(100, pct)}%`, borderRadius: 999, background: progressColor(pct) }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 11, color: "#9A9A9A" }}>{pct}% {lang === "id" ? "dari target" : "of target"}</span>
                {profileIncomplete && <span style={{ fontSize: 11, color: "#9A9A9A" }}>{tr.summaryEstimatedNote}</span>}
              </div>
            </div>

            {/* Macros */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "14px 16px", marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 10 }}>{tr.summaryMacroTitle}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {macroRows.map((m) => (
                  <div key={m.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}>
                      <span style={{ color: "#6A6A6A" }}>{m.label}</span>
                      <span style={{ color: COLORS.BLACK, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{Math.round(m.value)}g / {m.target}g</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "#EFEDEA", overflow: "hidden" }}>
                      <div className="sc-bar-fill" style={{ height: 5, width: `${m.target > 0 ? Math.min(100, Math.round((m.value / m.target) * 100)) : 0}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meal sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {groups.map(({ meal, items: mealItems }) => {
                const sub = mealItems.reduce((s, it) => s + (Number(it.kcal) || 0), 0);
                return (
                  <div key={meal} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: mealItems.length ? 10 : 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.BLACK }}>
                        {MEAL_EMOJI[meal]} {c.food[meal]}
                        {sub > 0 && <span style={{ fontSize: 12, color: "#9A9A9A", fontWeight: 400 }}> · {sub} {tr.kcal}</span>}
                      </span>
                    </div>
                    {mealItems.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", marginBottom: 10 }}>
                        {mealItems.map((it, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13, padding: "7px 0", borderBottom: i < mealItems.length - 1 ? `1px solid #F4F2F0` : "none" }}>
                            <span style={{ color: "#B0B0B0", fontSize: 11, flexShrink: 0, width: 38 }}>{it.t}</span>
                            <span style={{ flex: 1, color: "#3A3A3A", minWidth: 0 }}>{it.name}</span>
                            <span style={{ color: COLORS.BLACK, fontWeight: 600, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{Math.round(it.kcal)} {tr.kcal}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => { setAddMeal(meal); setAddTab("search"); setSaveErr(null); }}
                      className="sc-btn-ghost"
                      style={{ width: "100%", border: `1px dashed ${NUTRI.GREEN}`, color: NUTRI.GREEN_DARK, borderRadius: 10, padding: "9px", fontSize: 13, fontWeight: 700, background: "#fff", cursor: "pointer" }}
                    >
                      + {c.tracker.addFood}
                    </button>
                  </div>
                );
              })}
            </div>

            <p style={{ fontSize: 11, color: "#B0B0B0", textAlign: "center", marginTop: 16 }}>{tr.summarySyncNote}</p>
          </>
        )}
      </div>

      {/* Add panel (modal) */}
      {addMeal && (
        <div
          onClick={() => setAddMeal(null)}
          style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(20,20,20,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", width: "100%", maxWidth: 560, maxHeight: "88vh", borderRadius: "18px 18px 0 0", display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, textTransform: "uppercase", color: COLORS.BLACK, margin: 0 }}>{c.tracker.panelTitle}</h3>
              <button onClick={() => setAddMeal(null)} style={{ fontSize: 22, color: "#9A9A9A", lineHeight: 1, cursor: "pointer" }} aria-label="close">×</button>
            </div>

            <div style={{ padding: "14px 18px", overflowY: "auto" }}>
              {/* meal chips */}
              <span style={{ fontSize: 11, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 8 }}>{c.tracker.chooseMeal}</span>
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                {MEAL_TYPES.map((meal) => {
                  const on = addMeal === meal;
                  return (
                    <button key={meal} onClick={() => setAddMeal(meal)} style={{ fontSize: 12.5, fontWeight: 600, borderRadius: 999, padding: "6px 12px", border: `1px solid ${on ? COLORS.RED : BORDER}`, background: on ? COLORS.PINK_ACCENT : "#fff", color: on ? COLORS.RED : "#6A6A6A", cursor: "pointer" }}>
                      {MEAL_EMOJI[meal]} {c.food[meal]}
                    </button>
                  );
                })}
              </div>

              {/* tabs */}
              <div style={{ display: "flex", gap: 4, background: "#F4F2F0", borderRadius: 10, padding: 3, marginBottom: 14 }}>
                {(["search", "manual"] as const).map((tab) => (
                  <button key={tab} onClick={() => setAddTab(tab)} style={{ flex: 1, padding: "8px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "none", background: addTab === tab ? "#fff" : "transparent", color: addTab === tab ? COLORS.BLACK : "#8A8A8A", cursor: "pointer", boxShadow: addTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
                    {tab === "search" ? c.tracker.tabSearch : c.tracker.tabManual}
                  </button>
                ))}
              </div>

              {saveErr && <p style={{ fontSize: 12.5, color: COLORS.RED, margin: "0 0 10px" }}>{saveErr}</p>}

              {addTab === "search" ? (
                <FoodSearch lang={lang} variant="member" onAdd={onAddFood} addedLabelFor={justAdded} />
              ) : (
                <form onSubmit={onAddManual} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input value={mName} onChange={(e) => setMName(e.target.value)} placeholder={c.food.customName} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 12px", fontSize: 15, fontFamily: "inherit" }} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input value={mKcal} onChange={(e) => setMKcal(e.target.value)} type="number" inputMode="decimal" placeholder={c.food.customKcal} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 12px", fontSize: 15, fontFamily: "inherit" }} />
                    <input value={mP} onChange={(e) => setMP(e.target.value)} type="number" inputMode="decimal" placeholder={c.food.customProtein} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 12px", fontSize: 15, fontFamily: "inherit" }} />
                    <input value={mC} onChange={(e) => setMC(e.target.value)} type="number" inputMode="decimal" placeholder={c.food.customCarbs} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 12px", fontSize: 15, fontFamily: "inherit" }} />
                    <input value={mF} onChange={(e) => setMF(e.target.value)} type="number" inputMode="decimal" placeholder={c.food.customFat} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 12px", fontSize: 15, fontFamily: "inherit" }} />
                  </div>
                  <button type="submit" disabled={saving || justAdded === "manual"} className="sc-btn-primary" style={{ background: justAdded === "manual" ? NUTRI.GREEN : COLORS.RED, color: "#fff", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
                    {justAdded === "manual" ? `✓ ${c.food.added}` : saving ? tr.savingToLog : c.food.customAdd}
                  </button>
                </form>
              )}
            </div>

            <div style={{ padding: "12px 18px", borderTop: `1px solid ${BORDER}` }}>
              <button onClick={() => setAddMeal(null)} style={{ width: "100%", padding: "11px", borderRadius: 10, fontSize: 14, fontWeight: 700, color: COLORS.BLACK, background: "#F4F2F0", cursor: "pointer" }}>
                {c.tracker.done}
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter lang={lang} />
      <style>{`@keyframes scSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
