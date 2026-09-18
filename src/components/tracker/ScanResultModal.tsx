import { useMemo, useState } from "react";
import { COLORS, NUTRI } from "../../lib/constants";
import { Lang } from "../../lib/i18n";
import { ScanResult, apiClient } from "../../lib/api";
import { itemVerdict } from "../../lib/foodSummary";
import { DailyFoodItem } from "../../lib/memberTracker";
import { logMeal, MealComponentPayload } from "../../lib/scanMeal";
import { healthyMealFor, healthyTotalKcal, healthyName } from "../../lib/healthyOptions";

const INK = "var(--text)";
const MUTED = "var(--text-subtle)";
const BORDER = "var(--border)";
const GREEN = NUTRI.GREEN_DARK;
const tx = (lang: Lang, en: string, id: string) => (lang === "id" ? id : en);

// Editable component (starts from the AI scan items; edit changes name/amount/kcal
// pre-log, exactly like my.20fit.id's modal).
interface Comp {
  name: string;
  portion: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  _source?: string;
}

function parseAmtUnit(portion: string): { amt: number | ""; unit: string } {
  const s = String(portion || "");
  let m = s.match(/(\d+(?:\.\d+)?)\s*(?:gram|gr|g)\b/i);
  if (m) return { amt: Math.round(parseFloat(m[1])), unit: "g" };
  if ((m = s.match(/(\d+(?:\.\d+)?)\s*ml\b/i))) return { amt: Math.round(parseFloat(m[1])), unit: "ml" };
  if ((m = s.match(/(\d+(?:\.\d+)?)\s*(?:liter|litre|l)\b/i))) return { amt: parseFloat(m[1]), unit: "L" };
  if ((m = s.match(/(\d+(?:\.\d+)?)\s*(?:pcs|pieces?|butir|buah|potong)/i))) return { amt: Math.round(parseFloat(m[1])), unit: "pcs" };
  return { amt: "", unit: "g" };
}

const badgeStyle = (cls: "hh" | "hm" | "hu"): React.CSSProperties => {
  const map = { hh: { bg: NUTRI.GREEN_TINT, fg: GREEN }, hm: { bg: "#FDF3E7", fg: "#B4690E" }, hu: { bg: "#FDECEC", fg: COLORS.RED } } as const;
  const c = map[cls];
  return { fontSize: 11.5, fontWeight: 800, padding: "4px 11px", borderRadius: 999, whiteSpace: "nowrap", color: c.fg, background: c.bg };
};
const label = (t: string): React.CSSProperties => ({ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: MUTED, marginBottom: 8 } as React.CSSProperties);
const secStyle: React.CSSProperties = { marginTop: 14, borderTop: `1px solid ${BORDER}`, paddingTop: 12 };

export function ScanResultModal({ lang, result, goal, eaten, onLogged, onClose, kc }: {
  lang: Lang;
  result: ScanResult;
  goal: number;
  eaten: number;
  onLogged: (items: DailyFoodItem[]) => void;
  onClose: () => void;
  kc: string;
}) {
  const [comps, setComps] = useState<Comp[]>(() =>
    (result.items && result.items.length
      ? result.items.map((i) => ({ name: i.name, portion: i.portion, kcal: i.kcal, protein_g: i.protein_g, carbs_g: i.carbs_g, fat_g: i.fat_g, fiber_g: i.fiber_g }))
      : [{ name: result.food_name, portion: "", kcal: result.calories, protein_g: result.protein, carbs_g: result.carbs, fat_g: result.fat, fiber_g: result.fiber }])
  );
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [toast, setToast] = useState<{ text: string; warn?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Totals recomputed from (edited) components — matches saveItemCorrection.
  const totals = useMemo(() => comps.reduce(
    (a, c) => ({ kcal: a.kcal + (c.kcal || 0), p: a.p + (c.protein_g || 0), c: a.c + (c.carbs_g || 0), f: a.f + (c.fat_g || 0), fib: a.fib + (c.fiber_g || 0) }),
    { kcal: 0, p: 0, c: 0, f: 0, fib: 0 }
  ), [comps]);

  const kmin = Math.round(result.kcal_min || 0);
  const kmax = Math.round(result.kcal_max || 0);
  const conf = Math.round(result.confidence || 0);
  const confLab = conf > 0 ? (conf >= 75 ? tx(lang, "high confidence", "keyakinan tinggi") : conf >= 55 ? tx(lang, "medium confidence", "keyakinan sedang") : tx(lang, "low confidence", "keyakinan rendah")) : "";
  const sat = Math.round(result.satiety_score || 0);
  const health = Math.round(result.health_score || 0);
  const title = comps.map((c) => c.name).join(", ");

  const addToLog = async () => {
    if (saving || !comps.length) return;
    setSaving(true);
    setError(null);
    try {
      const components: MealComponentPayload[] = comps.map((c) => {
        const v = itemVerdict({ name: c.name, kcal: c.kcal, p: c.protein_g, c: c.carbs_g, f: c.fat_g, t: "" }, lang);
        return {
          name: c.name, portion: c.portion, kcal: c.kcal,
          protein_g: c.protein_g, carbs_g: c.carbs_g, fat_g: c.fat_g, fiber_g: c.fiber_g,
          item_source: c._source || "ai",
          verdict_band: v.band, verdict_label: v.label, verdict_reason: v.reason, swap_to: v.swapTo,
        };
      });
      const meal = {
        source: "photo_scan", title,
        total_kcal: Math.round(totals.kcal), protein_g: totals.p, carbs_g: totals.c, fat_g: totals.f, fiber_g: totals.fib,
        kcal_min: result.kcal_min, kcal_max: result.kcal_max, confidence: result.confidence,
        health_score: result.health_score, satiety_score: result.satiety_score, satiety_note: result.satiety_note,
        description: result.description, overall: result.overall, recommendation: result.recommendation,
        tags: result.tags, needs_more: result.needs_more, insights: result.insights, assumptions: result.assumptions,
      };
      const items = await logMeal(meal, components);
      onLogged(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx(lang, "Failed to save to log.", "Gagal menyimpan ke log."));
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (i: number, name: string, amt: number, unit: string, kcal: number) => {
    const next = comps.slice();
    const c = { ...next[i] };
    c.name = name;
    c.portion = unit === "g" ? `${amt}g` : `${amt} ${unit}`;
    c.kcal = kcal;
    c._source = "user";
    next[i] = c;
    setComps(next);
    setEditIdx(null);
    // Anonymous dictionary contribution — grams only (per-gram dict).
    if (unit === "g") {
      try {
        await apiClient.foodCorrection({ name, grams: Math.round(amt), kcal, protein_g: c.protein_g, carbs_g: c.carbs_g, fat_g: c.fat_g, fiber_g: c.fiber_g, lang });
        setToast({ text: tx(lang, "Correction saved — thanks! This helps 20FIT get more accurate.", "Koreksi tersimpan — makasih! Ini bikin 20FIT makin akurat.") });
      } catch {
        setToast({ text: tx(lang, "Updated here, but couldn't sync to 20FIT data — it still shows corrected for you.", "Terupdate di sini, tapi gagal sinkron ke data 20FIT — tetap tampil terkoreksi buatmu."), warn: true });
      }
    } else {
      setToast({ text: tx(lang, "Saved. Your correction is applied here.", "Tersimpan. Koreksimu berlaku di sini.") });
    }
  };

  const deleteComp = (i: number) => {
    const next = comps.filter((_, idx) => idx !== i);
    setEditIdx(null);
    if (!next.length) { onClose(); return; }
    setComps(next);
  };

  const healthy = healthyMealFor(Math.round(totals.kcal), 4);
  const afterLeft = Math.max(0, goal - eaten - Math.round(totals.kcal));

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(10,12,16,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: 460, background: "var(--surface)", borderRadius: "22px 22px 0 0", maxHeight: "92vh", overflowY: "auto", padding: "18px 20px calc(env(safe-area-inset-bottom) + 22px)", color: INK }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 19, fontWeight: 800 }}>{tx(lang, "Food analysis", "Analisa makanan")}</h3>

        {toast && (
          <div style={{ margin: "0 0 10px", padding: "9px 12px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: toast.warn ? "#fbeee0" : "#e6f4ea", color: toast.warn ? "#8a5a1a" : "#1d6b41" }}>{toast.text}</div>
        )}

        {/* headline */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 2 }}>
          <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.3 }}>{title}</div>
          <div style={{ fontWeight: 800, color: "var(--brand)", whiteSpace: "nowrap" }}>~{Math.round(totals.kcal)} {kc}</div>
        </div>
        <div style={{ fontSize: 11.5, color: MUTED, margin: "2px 0 8px" }}>
          {tx(lang, "Estimate from photo", "Perkiraan dari foto")}{kmin > 0 && kmax > kmin ? ` · ${kmin}–${kmax} ${kc}` : ""}{confLab ? ` · ${confLab}` : ""}
        </div>
        {conf > 0 && conf < 60 && (
          <div style={{ background: "#FDECEC", border: "1px solid #f3c2bd", borderRadius: 10, padding: "9px 11px", margin: "0 0 10px", fontSize: 12.5, color: "#8a2b22" }}>
            {tx(lang, "⚠ Portion looks uncertain — check & fix the grams under Portions below for a more accurate number.", "⚠ Porsinya belum pasti — cek & benerin gram di bagian Porsi di bawah biar lebih akurat.")}
          </div>
        )}
        {result.assumptions && result.assumptions.length > 0 && (
          <div style={{ fontSize: 11.5, color: MUTED, margin: "0 0 8px" }}>{tx(lang, "Assumptions", "Asumsi")}: {result.assumptions.join(" · ")}</div>
        )}
        {result.description && <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, marginBottom: 12 }}>{result.description}</div>}

        {/* macros */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, marginBottom: 6 }}>
          {[{ l: tx(lang, "Protein", "Protein"), v: totals.p }, { l: tx(lang, "Carbs", "Karbo"), v: totals.c }, { l: tx(lang, "Fat", "Lemak"), v: totals.f }, { l: tx(lang, "Fiber", "Serat"), v: totals.fib }].map((m, i) => (
            <div key={i} style={{ background: "var(--surface-inset)", borderRadius: 12, padding: "10px 4px", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{Math.round(m.v)}g</div>
              <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase" }}>{m.l}</div>
            </div>
          ))}
        </div>

        {/* tags */}
        {result.tags && result.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0 4px" }}>
            {result.tags.map((t, i) => (
              <span key={i} style={{ fontSize: 11.5, fontWeight: 800, padding: "5px 10px", borderRadius: 999, color: t.positive ? GREEN : "#B4690E", background: t.positive ? NUTRI.GREEN_TINT : "#FDF3E7" }}>{t.label}</span>
            ))}
          </div>
        )}

        {/* filling rate + health score */}
        {sat > 0 && (
          <div style={{ margin: "12px 0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{tx(lang, "Filling Rate", "Tingkat Kekenyangan")} <b style={{ color: "var(--brand)" }}>{sat}/10</b></div>
            <div style={{ fontSize: 13, letterSpacing: 2, wordBreak: "break-word", color: "var(--brand)" }}>{"◆".repeat(sat) + "◇".repeat(10 - sat)}</div>
            {result.satiety_note && <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5, marginTop: 6 }}>{result.satiety_note}</div>}
          </div>
        )}
        {health > 0 && (
          <div style={{ margin: "12px 0" }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{tx(lang, "Health Score", "Skor Sehat")} <b style={{ color: "var(--brand)" }}>{health}/10</b></div>
            <div style={{ height: 9, background: "var(--surface-inset)", borderRadius: 6, overflow: "hidden" }}><div style={{ height: "100%", width: `${health * 10}%`, background: `linear-gradient(90deg,#34c759,${GREEN})` }} /></div>
          </div>
        )}

        {result.overall && (
          <div style={{ ...secStyle, borderTop: "none", background: "var(--surface-inset)", borderRadius: 14, padding: "12px 14px", marginTop: 12 }}>
            <div style={label("")}>{tx(lang, "Overall analysis", "Analisa keseluruhan")}</div>
            <div style={{ fontSize: 13, lineHeight: 1.55 }}>{result.overall}</div>
          </div>
        )}

        {/* Better intake — what to add */}
        {result.recommendation && (
          <div style={{ borderRadius: 14, padding: "12px 14px", marginTop: 12, background: NUTRI.GREEN_TINT, border: `1px solid ${NUTRI.GREEN}33` }}>
            <div style={{ ...label(""), color: GREEN }}>{tx(lang, "Better intake — what to add", "Asupan lebih baik — perlu ditambah")}</div>
            {/* Fixed dark colour: this box's background is always light green
                (NUTRI.GREEN_TINT), so the text must not inherit the themed
                --text (which is light in dark mode → invisible). */}
            <div style={{ fontSize: 13, lineHeight: 1.55, color: "#1f4d33" }}>{result.recommendation}</div>
            {result.needs_more && result.needs_more.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
                {result.needs_more.map((n, i) => (
                  <span key={i} style={{ fontSize: 11.5, fontWeight: 800, color: GREEN, background: "#fff", border: `1px solid ${NUTRI.GREEN}4d`, padding: "4px 9px", borderRadius: 999 }}>+ {n}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Portions */}
        <div style={secStyle}>
          <div style={label("")}>{tx(lang, "Portions", "Porsi")}</div>
          {comps.map((it, idx) => (
            <PortionRow key={idx} lang={lang} it={it} kc={kc}
              editing={editIdx === idx}
              onEdit={() => setEditIdx(idx)}
              onCancel={() => setEditIdx(null)}
              onSave={(name, amt, unit, kcal) => saveEdit(idx, name, amt, unit, kcal)}
              onDelete={() => deleteComp(idx)}
            />
          ))}
        </div>

        {/* Key insights */}
        {result.insights && result.insights.length > 0 && (
          <div style={secStyle}>
            <div style={label("")}>{tx(lang, "Key Insights", "Insight Penting")}</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {result.insights.map((x, i) => <li key={i} style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 5 }}>{x}</li>)}
            </ul>
          </div>
        )}
        {result.note && <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5, marginTop: 10 }}>{result.note}</div>}

        {error && <div style={{ fontSize: 13, color: "var(--brand)", marginTop: 10 }}>{error}</div>}

        {/* Add to log */}
        <button onClick={addToLog} disabled={saving} style={{ width: "100%", marginTop: 14, border: 0, borderRadius: 12, background: "var(--inverse-surface)", color: "var(--inverse-text)", fontWeight: 800, fontSize: 15, padding: 14, cursor: "pointer" }}>
          {saving ? tx(lang, "Saving…", "Menyimpan…") : tx(lang, "+ Add to Today's Log", "+ Tambah ke Log Hari Ini")}
        </button>

        {/* Healthier options — same calories */}
        {healthy.length > 0 && (
          <div style={secStyle}>
            <div style={label("")}>{tx(lang, "Healthier options — same calories", "Pilihan lebih sehat — kalori sama")}</div>
            {healthy.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: NUTRI.GREEN_TINT, color: GREEN, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z" /><path d="M2 21c0-3 1.85-5.4 5.08-6" /></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 650 }}>{healthyName(f, lang)}</div>
                <div style={{ fontSize: 13, color: MUTED, fontWeight: 700 }}>{f.kcal} {kc}</div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 12, borderTop: `1px dashed ${BORDER}`, fontWeight: 800, fontSize: 14 }}>
              <span>{tx(lang, "Healthy total", "Total sehat")}</span>
              <span>~{healthyTotalKcal(healthy)} {kc}</span>
            </div>
            {afterLeft > 0 && (
              <div style={{ marginTop: 8, background: "#FDECEC", color: "#8a2b22", borderRadius: 12, padding: "10px 13px", fontSize: 13, fontWeight: 700 }}>
                {tx(lang, `After this you'd still need ~${afterLeft} ${kc} to reach today's goal.`, `Setelah ini kamu masih butuh ~${afterLeft} ${kc} lagi untuk capai target.`)}
              </div>
            )}
          </div>
        )}

        <button onClick={onClose} style={{ width: "100%", marginTop: 12, border: 0, borderRadius: 12, background: "var(--surface-inset)", color: INK, fontWeight: 750, fontSize: 14, padding: 12, cursor: "pointer" }}>{tx(lang, "Done", "Selesai")}</button>
      </div>
    </div>
  );
}

function PortionRow({ lang, it, kc, editing, onEdit, onCancel, onSave, onDelete }: {
  lang: Lang; it: Comp; kc: string; editing: boolean;
  onEdit: () => void; onCancel: () => void; onSave: (name: string, amt: number, unit: string, kcal: number) => void; onDelete: () => void;
}) {
  const v = itemVerdict({ name: it.name, kcal: it.kcal, p: it.protein_g, c: it.carbs_g, f: it.fat_g, t: "" }, lang);
  const au = parseAmtUnit(it.portion);
  const [name, setName] = useState(it.name);
  const [amt, setAmt] = useState(au.amt === "" ? "" : String(au.amt));
  const [unit, setUnit] = useState(au.unit);
  const [kcal, setKcal] = useState(String(Math.round(it.kcal)));
  const [msg, setMsg] = useState("");
  const inp: React.CSSProperties = { width: "100%", padding: "9px 10px", border: `1px solid ${BORDER}`, borderRadius: 9, fontSize: 14, fontFamily: "inherit", background: "var(--surface)", color: INK, boxSizing: "border-box" };

  if (editing) {
    const submit = () => {
      const a = parseFloat(amt);
      const k = parseInt(kcal, 10);
      if (!name.trim() || !(a > 0) || !(k > 0)) { setMsg(tx(lang, "Fill name, amount & kcal.", "Isi nama, jumlah & kkal dulu.")); return; }
      onSave(name.trim(), a, unit, k);
    };
    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7, padding: "8px 0" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tx(lang, "Food name", "Nama makanan")} style={inp} />
        <div style={{ display: "flex", gap: 7 }}>
          <label style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 800, color: MUTED }}>
            {tx(lang, "Amount", "Jumlah")}
            <div style={{ display: "flex", gap: 5 }}>
              <input type="number" inputMode="decimal" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder={tx(lang, "amount", "jumlah")} style={{ ...inp, flex: 1, minWidth: 0 }} />
              <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ ...inp, flex: "0 0 auto", width: "auto" }}>
                <option value="g">g</option><option value="pcs">pcs</option><option value="ml">ml</option><option value="L">L</option>
              </select>
            </div>
          </label>
          <label style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 800, color: MUTED }}>
            {tx(lang, "Calories (kcal)", "Kalori (kkal)")}
            <input type="number" inputMode="numeric" value={kcal} onChange={(e) => setKcal(e.target.value)} placeholder={kc} style={inp} />
          </label>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button type="button" onClick={submit} style={{ border: 0, borderRadius: 9, background: "var(--brand)", color: "var(--on-brand)", fontWeight: 800, fontSize: 13, padding: "9px 16px", cursor: "pointer" }}>{tx(lang, "Save correction", "Simpan koreksi")}</button>
          <button type="button" onClick={onCancel} style={{ border: `1px solid ${BORDER}`, borderRadius: 9, background: "transparent", color: INK, fontWeight: 700, fontSize: 13, padding: "9px 14px", cursor: "pointer" }}>{tx(lang, "Cancel", "Batal")}</button>
          {msg && <span style={{ fontSize: 12, color: "var(--brand)" }}>{msg}</span>}
          <button type="button" onClick={onDelete} style={{ marginLeft: "auto", border: "1px solid #e6b3ad", borderRadius: 9, background: "transparent", color: "var(--brand)", fontWeight: 700, fontSize: 13, padding: "9px 14px", cursor: "pointer" }}>{tx(lang, "Delete food", "Hapus makanan")}</button>
        </div>
        <div style={{ fontSize: 11.5, color: MUTED }}>{tx(lang, "Your correction helps 20FIT get more accurate over time (grams & calories).", "Koreksimu bikin 20FIT makin akurat seiring waktu (gram & kalori).")}</div>
      </div>
    );
  }

  const sub = v.reason + (v.swapTo ? ` · ${tx(lang, "try", "coba")} ${v.swapTo}` : "");
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderTop: `1px solid ${BORDER}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{it.name}{it.portion ? <span style={{ color: MUTED, fontWeight: 600 }}> ({it.portion})</span> : null}{it._source === "user" ? <span style={{ color: GREEN }}> ✓</span> : null}</div>
        <div style={{ fontSize: 11.5, color: MUTED, fontWeight: 600, marginTop: 2, lineHeight: 1.35 }}>{sub}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flex: "0 0 auto" }}>
        <span style={badgeStyle(v.cls)}>{v.label}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 12, whiteSpace: "nowrap" }}>
          <span style={{ color: MUTED }}>{Math.round(it.kcal)} {kc}</span>
          <button type="button" onClick={onEdit} style={{ border: 0, background: "transparent", color: "var(--brand)", fontWeight: 700, fontSize: 12, cursor: "pointer", padding: 2 }}>{tx(lang, "Edit", "Edit")}</button>
        </span>
      </div>
    </div>
  );
}
