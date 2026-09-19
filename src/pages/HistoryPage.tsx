import { useEffect, useState } from "react";
import { COLORS, NUTRI } from "../lib/constants";
import { CTAFull } from "../components/CTA";
import { useAuth } from "../hooks/useAuth";
import { Lang } from "../lib/i18n";
import { getRecentHistory, HistoryDay } from "../lib/memberHistory";
import { DailyFoodItem, MemberProfile, getMemberProfile, updateProfileGoals } from "../lib/memberTracker";
import { dailyCalorieGoal, dailyMacroTargets } from "../lib/nutrition";
import * as FS from "../lib/foodSummary";
import { getRecentMeals, Meal, MealComponent } from "../lib/mealHistory";
import { ACTIVITIES, GOALS } from "./OnboardingPage";
import { Icon } from "../components/Icon";

const tx = (lang: Lang, en: string, id: string) => (lang === "id" ? id : en);

// Rating badge — same good/ok/bad classes & colours as the tracker's
// VerdictBadge (CaloriesTracker.tsx), duplicated here (tiny + presentational,
// not worth sharing a component for) so History reads consistently with
// today's per-item check on "/".
function RateBadge({ cls, label }: { cls: "hh" | "hm" | "hu"; label: string }) {
  const map = { hh: { bg: NUTRI.GREEN_TINT, fg: NUTRI.GREEN_DARK }, hm: { bg: "#FDF3E7", fg: "#B4690E" }, hu: { bg: "#FDECEC", fg: COLORS.RED } } as const;
  const c = map[cls];
  return <span style={{ fontSize: 10.5, fontWeight: 800, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", color: c.fg, background: c.bg }}>{label}</span>;
}

// Verdict shown on the row badge + "what could be improved" line. When this
// item was logged via the AI scan (has a matching ct_meal_component — see
// mealHistory.ts), use the EXACT verdict saved at scan time instead of
// re-deriving one, so History never disagrees with what the scan itself said.
// Falls back to the live re-derivation (foodSummary.itemVerdict) for manually
// typed food, or anything logged before ct_meal existed.
function verdictOf(item: DailyFoodItem, component: MealComponent | undefined, lang: Lang): FS.ItemVerdict {
  if (component?.verdict_band && component.verdict_label && component.verdict_reason) {
    return {
      band: component.verdict_band,
      cls: component.verdict_band === "good" ? "hh" : component.verdict_band === "ok" ? "hm" : "hu",
      label: component.verdict_label,
      reason: component.verdict_reason,
      swapTo: component.swap_to || undefined,
    };
  }
  return FS.itemVerdict(item, lang);
}

// Per-item row: rating badge always visible, tap/click to expand. Items
// logged via the AI scan (matched by mid/cid to a ct_meal + ct_meal_component
// row — see src/lib/mealHistory.ts) expand into the SAME rich breakdown the
// "Analisa makanan" sheet showed right after the scan: tags, filling rate,
// health score, overall analysis and the "better intake" suggestion — all
// persisted at scan time, not re-derived. Everything else (manually typed
// food, or items logged before ct_meal existed) falls back to the simpler
// nutrient grid + foodSummary.itemVerdict() re-derivation.
function HistoryItemRow({ item, meal, component, lang, open, onToggle }: {
  item: DailyFoodItem;
  meal: Meal | undefined;
  component: MealComponent | undefined;
  lang: Lang;
  open: boolean;
  onToggle: () => void;
}) {
  const v = verdictOf(item, component, lang);
  const fiber = component?.fiber_g;
  const sat = meal ? Math.round(meal.satiety_score || 0) : 0;
  const health10 = meal ? Math.round(meal.health_score || 0) : 0;
  // Scanned items carry the AI's own tags; anything else (manual entries,
  // pre-ct_meal history) gets a macro-derived set so it doesn't look bare
  // next to a scanned item's card.
  const tags = meal?.tags && meal.tags.length > 0 ? meal.tags : FS.deriveTags(item, lang);
  const [reasonOpen, setReasonOpen] = useState(false);

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 text-left"
        style={{ padding: "10px 12px", background: "var(--surface)", border: "none", cursor: "pointer" }}
      >
        <span className="flex-shrink-0 text-xs" style={{ color: "var(--text-subtle)" }}>{item.t}</span>
        <span className="flex-1 font-medium text-xs truncate">{item.name}</span>
        <span className="flex-shrink-0 font-semibold text-xs">{Math.round(item.kcal)} {lang === "id" ? "kkal" : "kcal"}</span>
        <RateBadge cls={v.cls} label={v.label} />
        <span className="flex-shrink-0 text-xs" style={{ color: "var(--text-faint)" }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: "10px 12px", background: "var(--surface-inset)", borderTop: "1px solid var(--border)" }}>
          <div className={fiber != null ? "grid grid-cols-4 gap-2" : "grid grid-cols-3 gap-2"} style={{ fontSize: 11 }}>
            <div>
              <div style={{ color: "var(--text-subtle)" }}>{tx(lang, "Calories", "Kalori")}</div>
              <div style={{ fontWeight: 700 }}>{Math.round(item.kcal)} kkal</div>
            </div>
            <div>
              <div style={{ color: "var(--text-subtle)" }}>{tx(lang, "Protein", "Protein")}</div>
              <div style={{ fontWeight: 700 }}>{Math.round(item.p)} g</div>
            </div>
            <div>
              <div style={{ color: "var(--text-subtle)" }}>{tx(lang, "Carbs", "Karbo")}</div>
              <div style={{ fontWeight: 700 }}>{Math.round(item.c)} g</div>
            </div>
            {fiber != null ? (
              <div>
                <div style={{ color: "var(--text-subtle)" }}>{tx(lang, "Fiber", "Serat")}</div>
                <div style={{ fontWeight: 700 }}>{Math.round(fiber)} g</div>
              </div>
            ) : (
              <div>
                <div style={{ color: "var(--text-subtle)" }}>{tx(lang, "Fat", "Lemak")}</div>
                <div style={{ fontWeight: 700 }}>{Math.round(item.f)} g</div>
              </div>
            )}
          </div>
          {fiber != null && (
            <div className="mt-2" style={{ fontSize: 11 }}>
              <span style={{ color: "var(--text-subtle)" }}>{tx(lang, "Fat", "Lemak")}: </span>
              <b>{Math.round(item.f)} g</b>
            </div>
          )}

          <div className="mt-2 rounded-md overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <button
              type="button"
              onClick={() => setReasonOpen((o) => !o)}
              className="w-full flex items-center justify-between gap-2 text-left"
              style={{ padding: "7px 9px", background: "var(--surface)", border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: "var(--text)" }}
            >
              {tx(lang, "What could be improved", "Yang bisa diperbaiki")}
              <span aria-hidden="true" style={{ color: "var(--text-faint)", fontSize: 12, flexShrink: 0, transform: reasonOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>⌄</span>
            </button>
            {reasonOpen && (
              <div style={{ padding: "0 9px 8px", fontSize: 11.5, color: "var(--text-soft)", lineHeight: 1.5 }}>
                {v.reason}
                {v.swapTo && (
                  <>
                    {" "}· {tx(lang, "try", "coba")} <b style={{ color: NUTRI.GREEN_DARK }}>{v.swapTo}</b>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Tags: the AI's own (scanned items) or a macro-derived fallback
              (see FS.deriveTags) so every entry gets at least a few. */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {tags.map((t, i) => (
                <span key={i} style={{ fontSize: 10.5, fontWeight: 800, padding: "3px 9px", borderRadius: 999, color: t.positive ? NUTRI.GREEN_DARK : "#B4690E", background: t.positive ? NUTRI.GREEN_TINT : "#FDF3E7" }}>{t.label}</span>
              ))}
            </div>
          )}

          {/* From here down: only present when this item came from an AI scan
              (meal is set) — the same fields ScanResultModal shows right after scanning. */}

          {sat > 0 && (
            <div className="mt-2.5">
              <div style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 3 }}>
                {tx(lang, "Filling Rate", "Tingkat Kekenyangan")} <b style={{ color: "var(--brand)" }}>{sat}/10</b>
              </div>
              <div style={{ fontSize: 12, letterSpacing: 1.5, color: "var(--brand)" }}>{"◆".repeat(sat) + "◇".repeat(10 - sat)}</div>
            </div>
          )}

          {health10 > 0 && (
            <div className="mt-2.5">
              <div style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 3 }}>
                {tx(lang, "Health Score", "Skor Sehat")} <b style={{ color: "var(--brand)" }}>{health10}/10</b>
              </div>
              <div style={{ height: 7, background: "var(--surface)", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${health10 * 10}%`, background: `linear-gradient(90deg,#34c759,${NUTRI.GREEN_DARK})` }} />
              </div>
            </div>
          )}

          {meal?.overall && (
            <div className="mt-2.5">
              <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6, color: "var(--text-subtle)", marginBottom: 4 }}>{tx(lang, "Overall analysis", "Analisa keseluruhan")}</div>
              <div style={{ fontSize: 12, lineHeight: 1.5 }}>{meal.overall}</div>
            </div>
          )}

          {meal?.recommendation && (
            <div className="mt-2.5 rounded-lg" style={{ padding: "10px 11px", background: NUTRI.GREEN_TINT, border: `1px solid ${NUTRI.GREEN}33` }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6, color: NUTRI.GREEN_DARK, marginBottom: 4 }}>{tx(lang, "Better intake — what to add", "Asupan lebih baik — perlu ditambah")}</div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: "#1f4d33" }}>{meal.recommendation}</div>
              {meal.needs_more && meal.needs_more.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {meal.needs_more.map((n, i) => (
                    <span key={i} style={{ fontSize: 10.5, fontWeight: 800, color: NUTRI.GREEN_DARK, background: "#fff", border: `1px solid ${NUTRI.GREEN}4d`, padding: "3px 8px", borderRadius: 999 }}>+ {n}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Per-day health meter — same 0-100 score/band formula, score bar and note
// copy as the "Health meter" panel on the live tracker's "/" Today's Food
// Summary (FS.health/FS.healthNote), computed from that day's logged items
// against the member's current profile targets (there's no historical
// per-day target snapshot, same simplification the tracker itself uses).
// The badge alone (score/100) sits in the day header for a quick glance; this
// panel is the "how was today, overall" read the tracker gives for "today".
function DayHealthPanel({ items, goal, macroT, lang }: { items: DailyFoodItem[]; goal: number; macroT: ReturnType<typeof dailyMacroTargets>; lang: Lang }) {
  const t = FS.totals(items);
  const h = FS.health(items, t, goal, macroT);
  const barCol = h.band === "h" ? NUTRI.GREEN : h.band === "m" ? NUTRI.AMBER : COLORS.RED;
  return (
    <div className="rounded-lg mb-2" style={{ padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-subtle)", marginBottom: 6 }}>{tx(lang, "Overall analysis", "Analisa keseluruhan")}</div>
      <div style={{ height: 8, background: "var(--surface-inset)", borderRadius: 5, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${h.score}%`, background: barCol, borderRadius: 5, transition: "width .45s" }} />
      </div>
      <div style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.5, marginTop: 7 }}>{FS.healthNote(h.band, lang)}</div>
    </div>
  );
}

function DayHealthBadge({ items, goal, macroT, lang }: { items: DailyFoodItem[]; goal: number; macroT: ReturnType<typeof dailyMacroTargets>; lang: Lang }) {
  const t = FS.totals(items);
  const h = FS.health(items, t, goal, macroT);
  const cls = h.band === "h" ? "hh" : h.band === "m" ? "hm" : "hu";
  return <RateBadge cls={cls} label={`${FS.bandLabel(h.band, lang)} · ${h.score}/100`} />;
}

// Inline "edit goals" panel — lets a member adjust the inputs that feed
// dailyCalorieGoal/dailyMacroTargets (weight, height, activity, main goal)
// straight from History, instead of only via /onboarding. Deliberately a
// partial update (updateProfileGoals in memberTracker.ts) so it never
// touches gender/birthdate — those aren't shown here.
function GoalsEditPanel({ profile, lang, onSaved }: { profile: MemberProfile | null; lang: Lang; onSaved: (p: MemberProfile) => void }) {
  const [weight, setWeight] = useState(profile?.weight_kg ? String(profile.weight_kg) : "");
  const [height, setHeight] = useState(profile?.height_cm ? String(profile.height_cm) : "");
  const [activity, setActivity] = useState(profile?.activity_level || "light");
  const [goal, setGoal] = useState(profile?.main_goal || "maintain");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fieldStyle: React.CSSProperties = { width: "100%", padding: "9px 10px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 9, color: "var(--text)", fontSize: 13.5 };

  const submit = async () => {
    const w = weight ? parseFloat(weight) : undefined;
    const h = height ? parseFloat(height) : undefined;
    if (weight && !(w! > 0)) { setError(tx(lang, "Enter a valid weight.", "Isi berat yang valid.")); return; }
    if (height && !(h! > 0)) { setError(tx(lang, "Enter a valid height.", "Isi tinggi yang valid.")); return; }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfileGoals({ weight_kg: w, height_cm: h, activity_level: activity, main_goal: goal });
      onSaved({
        auth_user_id: profile?.auth_user_id ?? null,
        email: profile?.email ?? null,
        weight_kg: w ?? profile?.weight_kg ?? null,
        height_cm: h ?? profile?.height_cm ?? null,
        age: profile?.age ?? null,
        gender: profile?.gender ?? null,
        activity_level: activity,
        main_goal: goal,
        full_name: profile?.full_name ?? null,
        onboarding_completed: profile?.onboarding_completed ?? null,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx(lang, "Failed to save.", "Gagal menyimpan."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl mb-4" style={{ padding: 14, background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-subtle)", marginBottom: 10 }}>
        {tx(lang, "Edit your goals", "Ubah goals kamu")}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-soft)", marginBottom: 4, display: "block" }}>{tx(lang, "Weight (kg)", "Berat (kg)")}</label>
          <input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="65" style={fieldStyle} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-soft)", marginBottom: 4, display: "block" }}>{tx(lang, "Height (cm)", "Tinggi (cm)")}</label>
          <input type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" style={fieldStyle} />
        </div>
      </div>
      <div className="mb-3">
        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-soft)", marginBottom: 4, display: "block" }}>{tx(lang, "Activity level", "Level aktivitas")}</label>
        <select value={activity} onChange={(e) => setActivity(e.target.value)} style={fieldStyle}>
          {ACTIVITIES.map((a) => (
            <option key={a.key} value={a.key}>{tx(lang, a.en, a.id)}</option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-soft)", marginBottom: 4, display: "block" }}>{tx(lang, "Your goal", "Tujuanmu")}</label>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGoal(g.key)}
              style={{ padding: "9px 0", borderRadius: 9, border: `1px solid ${goal === g.key ? "var(--brand)" : "var(--border)"}`, background: goal === g.key ? "var(--brand-soft)" : "var(--surface-2)", color: goal === g.key ? "var(--brand)" : "var(--text)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              {tx(lang, g.en, g.id)}
            </button>
          ))}
        </div>
      </div>
      {error && <div style={{ fontSize: 12, color: "var(--brand)", marginBottom: 8 }}>{error}</div>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          style={{ padding: "9px 18px", border: 0, borderRadius: 9, background: "var(--brand)", color: "var(--on-brand)", fontWeight: 800, fontSize: 13, cursor: "pointer" }}
        >
          {saving ? tx(lang, "Saving…", "Menyimpan…") : tx(lang, "Save", "Simpan")}
        </button>
        {saved && <span style={{ fontSize: 12, color: NUTRI.GREEN_DARK, fontWeight: 700 }}>{tx(lang, "Saved — targets updated", "Tersimpan — target diperbarui")}</span>}
      </div>
    </div>
  );
}

// Toggle button that opens/closes GoalsEditPanel — sits to the left of the
// page title so it's the first thing on the row.
function GoalsToggle({ open, onToggle, lang }: { open: boolean; onToggle: () => void; lang: Lang }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-1.5 flex-shrink-0"
      style={{ padding: "6px 11px", borderRadius: 999, border: `1px solid ${open ? "var(--brand)" : "var(--border)"}`, background: open ? "var(--brand-soft)" : "var(--surface)", color: open ? "var(--brand)" : "var(--text-soft)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
    >
      <Icon name="target" size={14} />
      {tx(lang, "Edit goals", "Ubah goals")}
    </button>
  );
}

function formatDayLabel(dateStr: string, lang: Lang): string {
  const d = new Date(dateStr + "T00:00:00");
  const todayStr = new Date().toISOString().slice(0, 10);
  const yestStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === todayStr) return lang === "id" ? "Hari ini" : "Today";
  if (dateStr === yestStr) return lang === "id" ? "Kemarin" : "Yesterday";
  return d.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { weekday: "short", day: "numeric", month: "short" });
}

// Weekly-progress bar chart: each day as % of the calorie GOAL reached
// (not raw kcal) — oldest→newest, with a 100% reference line so it reads at
// a glance whether a day landed under/at/over target, whatever the target is.
function WeeklyChart({ days, target, lang }: { days: HistoryDay[]; target: number; lang: Lang }) {
  const recent = days.slice(0, 14).reverse(); // chronological
  if (recent.length < 2 || target <= 0) return null;
  const pts = recent.map((d) => {
    const total = d.items.reduce((s, it) => s + (Number(it.kcal) || 0), 0);
    return { date: d.log_date, total, pct: Math.round((total / target) * 100) };
  });
  const maxPct = Math.max(120, ...pts.map((x) => x.pct)) * 1.08;
  const avgPct = Math.round(pts.reduce((s, x) => s + x.pct, 0) / pts.length);
  const targetLinePct = (100 / maxPct) * 100;

  return (
    <div className="rounded-2xl border p-4 mb-6" style={{ borderColor: "var(--glass-hi)", background: "var(--surface)", boxShadow: "var(--glass-shadow)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)" }}>
      <div className="flex justify-between items-baseline mb-3">
        <h3 className="font-semibold text-sm">{lang === "id" ? "Progres Mingguan" : "Weekly Progress"}</h3>
        <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
          {lang === "id" ? "Rata-rata" : "Avg"} <b style={{ color: "var(--text)" }}>{avgPct}%</b> {lang === "id" ? "dari target" : "of target"}
        </span>
      </div>
      <div style={{ position: "relative", height: 130, display: "flex", alignItems: "flex-end", gap: 4 }}>
        {/* 100%-of-target reference line */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: `${targetLinePct}%`, borderTop: `1px dashed ${NUTRI.GREEN_DARK}`, zIndex: 1 }}>
          <span style={{ position: "absolute", right: 0, top: -14, fontSize: 9, color: NUTRI.GREEN_DARK, background: "var(--surface)", padding: "0 3px" }}>
            100% {lang === "id" ? "target" : "target"}
          </span>
        </div>
        {pts.map((x) => {
          const h = Math.max(2, (x.pct / maxPct) * 100);
          const over = x.pct > 100;
          return (
            <div key={x.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }} title={`${x.date}: ${x.pct}% (${x.total} kkal)`}>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: over ? COLORS.RED : NUTRI.GREEN_DARK, marginBottom: 2 }}>{x.pct}%</span>
              <div className="sc-bar-fill" style={{ width: "100%", maxWidth: 22, height: `${h}%`, background: over ? COLORS.RED : NUTRI.GREEN, borderRadius: "4px 4px 0 0" }} />
              <span style={{ fontSize: 8.5, color: "#B0B0B0", marginTop: 3 }}>{x.date.slice(8, 10)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Real log history, read from my20fit_daily_log (same table my.20fit.id's
// own /calories page writes to) — replaces a previous implementation that
// called /api/scan/history, an endpoint that does not exist on my.20fit.id's
// backend (verified against its server.js source), so it never worked.
export const HistoryPage = ({ lang = "id" }: { lang?: Lang }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [days, setDays] = useState<HistoryDay[]>([]);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [meals, setMeals] = useState<Map<string, Meal>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [goalsOpen, setGoalsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      setIsLoading(true);
      try {
        // Meals load best-effort: a hiccup fetching the rich scan analysis
        // shouldn't block the plain food log itself from showing.
        const [d, p, m] = await Promise.all([getRecentHistory(), getMemberProfile(), getRecentMeals().catch(() => new Map<string, Meal>())]);
        setDays(d);
        setProfile(p);
        setMeals(m);
      } catch (err) {
        setError(err instanceof Error ? err.message : (lang === "id" ? "Gagal memuat riwayat" : "Failed to load history"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated, lang]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <CTAFull
        title={lang === "id" ? "Riwayat Log Kalori" : "Calorie Log History"}
        description={lang === "id" ? "Riwayat log makanan hanya tersedia untuk akun yang sudah masuk." : "Food log history is only available once signed in."}
        bullets={[
          lang === "id" ? "Lihat semua makanan yang kamu log sebelumnya" : "See every food you've logged before",
          lang === "id" ? "Bandingkan kalori antar hari" : "Compare calories across days",
          lang === "id" ? "Data yang sama juga kelihatan di my.20fit.id/calories" : "The same data also shows on my.20fit.id/calories",
        ]}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 rounded-full animate-spin inline-block" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }}></div>
        <p className="mt-4" style={{ color: "var(--text-soft)" }}>{lang === "id" ? "Memuat riwayat..." : "Loading history..."}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-lg p-6 border" style={{ borderColor: "#FFD1D1", backgroundColor: "#FFE6E6" }}>
          <p style={{ color: COLORS.RED }}>{error}</p>
        </div>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="mb-4" style={{ display: "flex", justifyContent: "center", color: "var(--text-faint)" }}><Icon name="inbox" size={44} /></div>
        <h2 className="font-display text-2xl font-bold uppercase mb-2">{lang === "id" ? "Belum Ada Riwayat" : "No History Yet"}</h2>
        <p style={{ color: "var(--text-soft)" }}>{lang === "id" ? "Simpan hasil scan ke log untuk melihat riwayat di sini" : "Save a scan result to your log to see history here"}</p>
      </div>
    );
  }

  const goal = dailyCalorieGoal(profile);
  const macroT = dailyMacroTargets(profile, goal);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <GoalsToggle open={goalsOpen} onToggle={() => setGoalsOpen((o) => !o)} lang={lang} />
        <h2 className="font-display text-2xl font-bold uppercase">{lang === "id" ? "Riwayat Log Kamu" : "Your Log History"}</h2>
      </div>
      {goalsOpen && <GoalsEditPanel profile={profile} lang={lang} onSaved={(p) => setProfile(p)} />}

      <WeeklyChart days={days} target={goal} lang={lang} />

      <div className="space-y-6">
        {days.map((day) => {
          const total = day.items.reduce((s, it) => s + (Number(it.kcal) || 0), 0);
          return (
            <div key={day.log_date}>
              <div className="flex justify-between items-baseline mb-2 gap-2 flex-wrap">
                <h3 className="font-semibold text-sm">{formatDayLabel(day.log_date, lang)}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--text-soft)" }}>{total} {lang === "id" ? "kkal total" : "kcal total"}</span>
                  <DayHealthBadge items={day.items} goal={goal} macroT={macroT} lang={lang} />
                </div>
              </div>
              <DayHealthPanel items={day.items} goal={goal} macroT={macroT} lang={lang} />
              <div className="space-y-2">
                {day.items.map((item, i) => {
                  const key = `${day.log_date}_${i}`;
                  const meal = item.mid ? meals.get(item.mid) : undefined;
                  const component = meal && item.cid ? meal.components.find((c) => c.id === item.cid) : undefined;
                  return (
                    <HistoryItemRow
                      key={key}
                      item={item}
                      meal={meal}
                      component={component}
                      lang={lang}
                      open={openKey === key}
                      onToggle={() => setOpenKey(openKey === key ? null : key)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
