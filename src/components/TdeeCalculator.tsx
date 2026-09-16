import { useMemo, useState } from "react";
import { COLORS, NUTRI } from "../lib/constants";
import { Lang } from "../lib/i18n";
import { cc, ACTIVITY_LABELS } from "../lib/calorieCopy";
import {
  ACTIVITY_LEVELS,
  ActivityLevel,
  Gender,
  Goal,
  TdeeInput,
  TdeeResult,
  calcTdee,
  loadTdee,
  macrosForTarget,
  saveTdee,
  targetForGoal,
} from "../lib/tdee";

const MONO = "'Barlow Condensed', ui-monospace, SFMono-Regular, Menlo, monospace";
const BORDER = "#E4E0DB";

// Numbers get tabular figures so columns of kcal line up (brief requirement).
function Kcal({ value, size = 28, color = COLORS.BLACK }: { value: number; size?: number; color?: string }) {
  return (
    <span style={{ fontFamily: MONO, fontSize: size, lineHeight: 1, color, fontVariantNumeric: "tabular-nums" }}>
      {value.toLocaleString("id-ID")}
    </span>
  );
}

function labelStyle(): React.CSSProperties {
  return { fontSize: 12, fontWeight: 600, color: "#6A6A6A", marginBottom: 6, display: "block" };
}
function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
    padding: "11px 12px",
    fontSize: 15,
    fontFamily: "inherit",
    color: COLORS.BLACK,
    background: "#fff",
  };
}

/** BMR-vs-activity ring gauge. The dark arc is baseline (BMR), the green arc
 *  is the extra you burn through activity — together they are your TDEE. */
function TdeeRing({ bmr, tdee, caption }: { bmr: number; tdee: number; caption: string }) {
  const size = 168;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const bmrFrac = tdee > 0 ? Math.min(1, bmr / tdee) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={BORDER} strokeWidth={stroke} />
          {/* activity portion (full ring, green) */}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={NUTRI.GREEN} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={0} strokeLinecap="round" />
          {/* baseline portion (BMR, dark) drawn on top from the start */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={COLORS.BLACK}
            strokeWidth={stroke}
            strokeDasharray={`${c * bmrFrac} ${c}`}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Kcal value={tdee} size={34} />
          <span style={{ fontSize: 11, color: "#8A8A8A", marginTop: 2 }}>{caption}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#6A6A6A" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: COLORS.BLACK }} /> BMR
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 9, height: 9, borderRadius: 2, background: NUTRI.GREEN }} /> Aktivitas
        </span>
      </div>
    </div>
  );
}

const GOALS: Goal[] = ["fat_loss", "maintain", "muscle_gain"];

export function TdeeCalculator({ lang }: { lang: Lang }) {
  const c = cc(lang).calc;

  const stored = useMemo(() => loadTdee(), []);
  const [gender, setGender] = useState<Gender | null>(stored?.gender ?? null);
  const [age, setAge] = useState<string>(stored ? String(stored.age) : "");
  const [weight, setWeight] = useState<string>(stored ? String(stored.weightKg) : "");
  const [height, setHeight] = useState<string>(stored ? String(stored.heightCm) : "");
  const [activity, setActivity] = useState<ActivityLevel | "">(stored?.activity ?? "");
  const [goal, setGoal] = useState<Goal>(stored?.goal ?? "maintain");
  const [result, setResult] = useState<TdeeResult | null>(stored?.result ?? null);
  const [error, setError] = useState<string | null>(null);

  const weightNum = parseFloat(weight);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input: Partial<TdeeInput> = {
      gender: gender ?? undefined,
      age: parseFloat(age),
      weightKg: parseFloat(weight),
      heightCm: parseFloat(height),
      activity: (activity || undefined) as ActivityLevel | undefined,
    };
    const r = calcTdee(input);
    if (!r) {
      setError(c.errorInvalid);
      setResult(null);
      return;
    }
    setError(null);
    setResult(r);
    saveTdee(input as TdeeInput, r, goal);
    // Let the freshly rendered result scroll into view.
    requestAnimationFrame(() => {
      document.getElementById("tdee-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const target = result ? targetForGoal(result, goal) : 0;
  const macros = result && weightNum ? macrosForTarget(target, weightNum, goal) : null;

  const macroRows = macros
    ? [
        { label: lang === "id" ? "Protein" : "Protein", grams: macros.proteinG, kcal: macros.proteinKcal, color: NUTRI.BLUE },
        { label: lang === "id" ? "Karbo" : "Carbs", grams: macros.carbsG, kcal: macros.carbsKcal, color: NUTRI.AMBER },
        { label: lang === "id" ? "Lemak" : "Fat", grams: macros.fatG, kcal: macros.fatKcal, color: COLORS.RED },
      ]
    : [];
  const macroKcalTotal = macros ? macros.proteinKcal + macros.carbsKcal + macros.fatKcal : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ---- Form ---- */}
      <form
        onSubmit={handleSubmit}
        style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18, padding: "20px 18px", boxShadow: "0 10px 34px -20px rgba(20,20,20,0.25)" }}
      >
        <h3 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, textTransform: "uppercase", color: COLORS.BLACK, margin: "0 0 16px" }}>
          {c.title}
        </h3>

        {/* Gender */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle()}>{c.genderLabel}</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(["male", "female"] as Gender[]).map((gVal) => {
              const selected = gender === gVal;
              return (
                <button
                  key={gVal}
                  type="button"
                  onClick={() => setGender(gVal)}
                  style={{
                    padding: "11px 12px",
                    borderRadius: 10,
                    border: `1.5px solid ${selected ? COLORS.RED : BORDER}`,
                    background: selected ? COLORS.PINK_ACCENT : "#fff",
                    color: selected ? COLORS.RED : "#6A6A6A",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {gVal === "male" ? c.male : c.female}
                </button>
              );
            })}
          </div>
        </div>

        {/* Age / Weight / Height */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { label: c.age, unit: c.ageUnit, val: age, set: setAge, ph: "25" },
            { label: c.weight, unit: c.weightUnit, val: weight, set: setWeight, ph: "65" },
            { label: c.height, unit: c.heightUnit, val: height, set: setHeight, ph: "170" },
          ].map((f) => (
            <div key={f.label}>
              <label style={labelStyle()}>{f.label}</label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  inputMode="decimal"
                  value={f.val}
                  placeholder={f.ph}
                  onChange={(e) => f.set(e.target.value)}
                  style={{ ...inputStyle(), paddingRight: 34 }}
                  min={0}
                />
                <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#A0A0A0" }}>
                  {f.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle()}>{c.activityLabel}</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel | "")} style={{ ...inputStyle(), appearance: "auto" }}>
            <option value="" disabled>
              {lang === "id" ? "Pilih level aktivitas…" : "Choose activity level…"}
            </option>
            {ACTIVITY_LEVELS.map((lvl) => {
              const meta = ACTIVITY_LABELS[lang][lvl];
              return (
                <option key={lvl} value={lvl}>
                  {meta.name} — {meta.desc}
                </option>
              );
            })}
          </select>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: COLORS.RED, margin: "0 0 12px" }}>{error}</p>
        )}

        <button
          type="submit"
          className="sc-btn-primary"
          style={{ width: "100%", background: COLORS.RED, color: "#fff", borderRadius: 12, padding: "13px 18px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
        >
          {result ? c.recalc : c.submit} →
        </button>
      </form>

      {/* ---- Result ---- */}
      {result && (
        <div id="tdee-result" style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 18, padding: "22px 18px", scrollMarginTop: 80 }}>
          <h3 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, textTransform: "uppercase", color: COLORS.BLACK, margin: "0 0 18px" }}>
            {c.resultTitle}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, alignItems: "center", marginBottom: 20 }}>
            <TdeeRing bmr={result.bmr} tdee={result.tdee} caption={c.perDay} />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#6A6A6A", textTransform: "uppercase", letterSpacing: ".04em" }}>{c.bmrLabel}</span>
                  <Kcal value={result.bmr} size={24} />
                </div>
                <p style={{ fontSize: 11.5, color: "#9A9A9A", margin: "4px 0 0", lineHeight: 1.4 }}>{c.bmrDesc}</p>
              </div>
              <div style={{ border: `1px solid ${NUTRI.GREEN_TINT}`, background: NUTRI.GREEN_TINT, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: NUTRI.GREEN_DARK, textTransform: "uppercase", letterSpacing: ".04em" }}>{c.tdeeLabel}</span>
                  <Kcal value={result.tdee} size={24} color={NUTRI.GREEN_DARK} />
                </div>
                <p style={{ fontSize: 11.5, color: "#3f7d5b", margin: "4px 0 0", lineHeight: 1.4 }}>{c.tdeeDesc}</p>
              </div>
            </div>
          </div>

          {/* Goals */}
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6A6A6A", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 10 }}>
            {c.goalsTitle}
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
            {GOALS.map((gVal) => {
              const selected = goal === gVal;
              const val = targetForGoal(result, gVal);
              const name = gVal === "fat_loss" ? c.goalFatLoss : gVal === "muscle_gain" ? c.goalMuscleGain : c.goalMaintain;
              const note = gVal === "fat_loss" ? c.goalFatLossNote : gVal === "muscle_gain" ? c.goalMuscleGainNote : c.goalMaintainNote;
              return (
                <button
                  key={gVal}
                  type="button"
                  onClick={() => {
                    setGoal(gVal);
                    saveTdee(
                      { gender: gender as Gender, age: parseFloat(age), weightKg: parseFloat(weight), heightCm: parseFloat(height), activity: activity as ActivityLevel },
                      result,
                      gVal
                    );
                  }}
                  style={{
                    textAlign: "left",
                    borderRadius: 12,
                    border: `1.5px solid ${selected ? COLORS.RED : BORDER}`,
                    background: selected ? COLORS.PINK_ACCENT : "#fff",
                    padding: "12px 10px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: selected ? COLORS.RED : "#6A6A6A" }}>{name}</span>
                  <Kcal value={val} size={22} color={selected ? COLORS.RED : COLORS.BLACK} />
                  <span style={{ fontSize: 10, color: "#9A9A9A", lineHeight: 1.3 }}>{note}</span>
                </button>
              );
            })}
          </div>

          {/* Macro suggestion */}
          {macros && macroKcalTotal > 0 && (
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "14px" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6A6A6A", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 4 }}>
                {c.macroTitle}
              </span>
              <span style={{ fontSize: 11, color: "#9A9A9A", display: "block", marginBottom: 12 }}>
                {c.macroFor((goal === "fat_loss" ? c.goalFatLoss : goal === "muscle_gain" ? c.goalMuscleGain : c.goalMaintain).toLowerCase())} · <Kcal value={target} size={12} /> {c.perDay}
              </span>
              {/* stacked proportion bar */}
              <div style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", marginBottom: 12 }}>
                {macroRows.map((m) => (
                  <div key={m.label} style={{ width: `${(m.kcal / macroKcalTotal) * 100}%`, background: m.color }} />
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {macroRows.map((m) => (
                  <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#4A4A4A" }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: m.color }} />
                      {m.label}
                    </span>
                    <span style={{ color: COLORS.BLACK, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {m.grams} g · {Math.round((m.kcal / macroKcalTotal) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p style={{ fontSize: 11, color: "#9A9A9A", lineHeight: 1.6, margin: "16px 0 0", borderLeft: `3px solid ${NUTRI.GREEN}`, paddingLeft: 10 }}>
            {c.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
