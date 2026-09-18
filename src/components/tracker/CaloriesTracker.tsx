import { useEffect, useMemo, useRef, useState } from "react";
import { COLORS, NUTRI, URLS } from "../../lib/constants";
import { Lang } from "../../lib/i18n";
import { Icon } from "../Icon";
import { apiClient, QuotaData, ScanResult } from "../../lib/api";
import {
  DailyFoodItem,
  MemberProfile,
  appendTodayFoodItem,
  getMemberProfile,
  getTodayFoodItems,
  saveTodayFoodItems,
  nowHHMM,
} from "../../lib/memberTracker";
import { dailyCalorieGoal, dailyMacroTargets } from "../../lib/nutrition";
import * as Fasting from "../../lib/fasting";
import * as FS from "../../lib/foodSummary";
import { getMenuRecommend, MenuRecipe } from "../../lib/menuRecommend";
import { ScanResultModal } from "./ScanResultModal";

const BORDER = "var(--border)";
const INK = "var(--text)";
const MUTED = "var(--text-subtle)";

// Bilingual inline helper for tracker-specific copy (component-local, so we
// don't bloat the shared i18n table).
const tx = (lang: Lang, en: string, id: string) => (lang === "id" ? id : en);

// ---- small presentational pieces ----
function Thermometer({ frac }: { frac: number }) {
  const h = Math.max(0, Math.min(1, frac)) * 108;
  return (
    <div style={{ position: "relative", width: 34, height: 150, flex: "0 0 auto" }}>
      <div style={{ position: "absolute", top: 0, left: 8, width: 18, height: 128, border: `3px solid ${BORDER}`, borderBottom: 0, borderRadius: "11px 11px 0 0", background: "var(--surface-inset)" }} />
      <div style={{ position: "absolute", left: 11, width: 12, bottom: 30, height: h, background: "linear-gradient(180deg,#ff7a45,#C41101)", borderRadius: "6px 6px 0 0", transition: "height .55s cubic-bezier(.2,.8,.2,1)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 2, width: 30, height: 30, borderRadius: "50%", background: "#C41101", border: `3px solid ${BORDER}` }} />
    </div>
  );
}

function MacroBar({ label, val, tot, color }: { label: string; val: number; tot: number; color: string }) {
  const pct = tot > 0 ? Math.min(100, (val / tot) * 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color: MUTED, fontWeight: 600 }}>{Math.round(val)} / {tot}g</span>
      </div>
      <div style={{ height: 8, background: "var(--surface-inset)", borderRadius: 6, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width .35s" }} />
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 8px 30px -20px rgba(20,20,20,0.25)",
  color: INK,
};
const secLabel: React.CSSProperties = { fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: MUTED, fontWeight: 700, margin: "18px 2px 8px" };

export function CaloriesTracker({ lang }: { lang: Lang }) {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [items, setItems] = useState<DailyFoodItem[]>([]);
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // fasting/countdown re-render tick + minute clock
  const [tick, setTick] = useState(0);
  const bump = () => setTick((t) => t + 1);
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(iv);
  }, []);

  // ---- initial load ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const [p, it] = await Promise.all([getMemberProfile(), getTodayFoodItems()]);
        if (cancelled) return;
        setProfile(p);
        setItems(it);
        if (p?.auth_user_id) {
          const changed = await Fasting.loadFastingFromCloud(p.auth_user_id);
          if (changed && !cancelled) bump();
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
      // quota is non-blocking
      apiClient.getQuota().then((q) => { if (!cancelled) setQuota(q); }).catch(() => {});
    })();
    return () => { cancelled = true; };
  }, []);

  // ---- derived values (recomputed on items / fasting tick / profile) ----
  const baseGoal = useMemo(() => dailyCalorieGoal(profile), [profile]);
  const goal = useMemo(() => Fasting.adjustGoal(baseGoal), [baseGoal, tick]);
  const macroT = useMemo(() => dailyMacroTargets(profile, goal), [profile, goal]);
  const totals = useMemo(() => FS.totals(items), [items]);
  const health = useMemo(() => FS.health(items, totals, goal, macroT), [items, totals, goal, macroT]);
  const gap = useMemo(() => FS.nutrientGap(totals, macroT, lang), [totals, macroT, lang]);
  const guidance = useMemo(() => FS.nextGuidance(items, totals, health, lang), [items, totals, health, lang]);

  const consumed = Math.round(totals.kcal);
  const left = goal - consumed;
  const estimated = !profile || !profile.weight_kg || !profile.height_cm;

  // ---- menu recommendations from remaining macros (Panel 6 + bottom card) ----
  const [gapFoods, setGapFoods] = useState<MenuRecipe[]>([]);
  const [menuRecs, setMenuRecs] = useState<MenuRecipe[]>([]);
  useEffect(() => {
    let cancelled = false;
    if (gap.met) { setGapFoods([]); return; }
    getMenuRecommend(gap.rem, 3).then((r) => { if (!cancelled) setGapFoods(r); });
    return () => { cancelled = true; };
  }, [gap.rem.p, gap.rem.c, gap.rem.f, gap.met]);
  useEffect(() => {
    let cancelled = false;
    const rem = { p: Math.max(0, macroT.p - totals.p), c: Math.max(0, macroT.c - totals.c), f: Math.max(0, macroT.f - totals.f) };
    getMenuRecommend(rem, 8).then((r) => { if (!cancelled) setMenuRecs(r); });
    return () => { cancelled = true; };
  }, [macroT.p, macroT.c, macroT.f, totals.p, totals.c, totals.f]);

  // ---- scan ----
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const onScanFile = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setScanError(tx(lang, "Use JPG, PNG, or WebP.", "Gunakan JPG, PNG, atau WebP.")); return; }
    if (file.size > 5 * 1024 * 1024) { setScanError(tx(lang, "Photo too large (max 5MB).", "Foto terlalu besar (maks 5MB).")); return; }
    setScanning(true); setScanError(null); setScanResult(null);
    try {
      const res = await apiClient.scanPhoto(file);
      setScanResult(res);
      apiClient.getQuota().then(setQuota).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "error";
      setScanError(msg === "scan_limit" ? tx(lang, "Scan quota exhausted. Top up to continue.", "Kuota scan habis. Top-up untuk lanjut.") : tx(lang, "Failed to analyze photo.", "Gagal menganalisis foto."));
    } finally {
      setScanning(false);
    }
  };

  // ---- type food + grams ----
  const [fname, setFname] = useState("");
  const [fgram, setFgram] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [estError, setEstError] = useState<string | null>(null);
  const estimateFood = async () => {
    const name = fname.trim();
    const grams = parseFloat(fgram);
    if (!name || !grams || grams <= 0) { setEstError(tx(lang, "Enter a food name and grams.", "Isi nama makanan dan gram.")); return; }
    setEstimating(true); setEstError(null);
    try {
      const r = await apiClient.estimateFoodText(name, grams, lang);
      const list = await appendTodayFoodItem({ name: r.name, kcal: r.kcal, p: r.p, c: r.c, f: r.f, t: nowHHMM() });
      setItems(list);
      setFname(""); setFgram("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "error";
      setEstError(msg === "login_required" ? tx(lang, "Please sign in again.", "Silakan masuk lagi.") : tx(lang, "Could not estimate calories.", "Gagal menghitung kalori."));
    } finally {
      setEstimating(false);
    }
  };

  // ---- delete a logged item ----
  const deleteItem = async (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    try { await saveTodayFoodItems(next); } catch { /* revert on failure */ apiClient.getQuota().catch(() => {}); setItems(items); }
  };

  // ---- fasting handlers ----
  const choice = Fasting.getChoice(); void tick; // read fresh each render
  const chooseIF = (id: string) => { Fasting.setChoice({ id, start: "12:00" }); if (profile) Fasting.saveFastingPrefs(profile, Fasting.notifEnabled()); bump(); };
  const changeIF = () => { Fasting.clearChoice(); if (profile) Fasting.saveFastingPrefs(profile, false); bump(); };
  const setIFStart = (v: string) => { const c = Fasting.getChoice() || { id: "16:8", start: "12:00" }; c.start = v; Fasting.setChoice(c); if (profile) Fasting.saveFastingPrefs(profile, Fasting.notifEnabled()); bump(); };
  const toggleReminders = async () => {
    if (Fasting.notifEnabled()) { Fasting.disableReminders(); if (profile) await Fasting.saveFastingPrefs(profile, false); bump(); return; }
    await Fasting.enableReminders(lang); if (profile) await Fasting.saveFastingPrefs(profile, true); bump();
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
        <span style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: "var(--brand)", display: "inline-block", animation: "ctSpin .9s linear infinite" }} />
        <style>{`@keyframes ctSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const kc = tx(lang, "kcal", "kkal");

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 16px 70px" }}>
      <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 30, fontWeight: 900, textTransform: "uppercase", margin: "0 0 14px", color: INK }}>
        {tx(lang, "Calorie Tracker", "Calorie Tracker")}
      </h1>

      {loadError && (
        <div style={{ ...cardStyle, borderColor: "#f3c2bd", marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: "var(--brand)" }}>{tx(lang, "Couldn't load your tracker. Refresh to try again.", "Gagal memuat tracker. Muat ulang untuk coba lagi.")}</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }} className="ct-tracker-grid">
        {/* ---------- LEFT COLUMN ---------- */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* PANEL 1 + 2 + 3 — target, macros, scan, type-food */}
          <div style={{ ...cardStyle, textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: MUTED, fontWeight: 700 }}>
              {tx(lang, "Your daily calorie target", "Target kalori harianmu")}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center", margin: "8px 0 4px", textAlign: "left" }}>
              <Thermometer frac={goal > 0 ? consumed / goal : 0} />
              <div>
                <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1, color: "var(--brand)" }}>{goal}</div>
                <div style={{ color: MUTED, fontSize: 13 }}>{tx(lang, "kcal / day — from your BMI & profile", "kkal / hari — dari BMI & profilmu")}</div>
                <div style={{ marginTop: 8, fontSize: 13, color: MUTED }}>
                  <b style={{ fontSize: 24, color: "var(--brand)", marginRight: 4, fontVariantNumeric: "tabular-nums" }}>{Math.max(0, left)}</b>
                  {left >= 0 ? tx(lang, "kcal to go", "kkal lagi") : tx(lang, "kcal over", "kkal lewat")}
                </div>
                <div style={{ fontSize: 13, marginTop: 8 }}>
                  {tx(lang, "Eaten", "Dimakan")} <b style={{ color: "var(--brand)" }}>{consumed}</b> · {tx(lang, "Left", "Sisa")} <b style={{ color: "var(--brand)" }}>{Math.max(0, left)}</b> {kc}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14, textAlign: "left", display: "flex", flexDirection: "column", gap: 9 }}>
              <MacroBar label={tx(lang, "Protein", "Protein")} val={totals.p} tot={macroT.p} color="#C41101" />
              <MacroBar label={tx(lang, "Carbs", "Karbo")} val={totals.c} tot={macroT.c} color="#3b82f6" />
              <MacroBar label={tx(lang, "Fat", "Lemak")} val={totals.f} tot={macroT.f} color="#C87000" />
            </div>

            {/* scan buttons */}
            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <button onClick={() => camRef.current?.click()} style={{ flex: 1, padding: 14, border: 0, borderRadius: 11, background: "var(--brand)", color: "var(--on-brand)", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Icon name="camera" size={20} color="#fff" /> {tx(lang, "Take photo", "Ambil foto")}
              </button>
              <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: 14, border: `1px solid ${BORDER}`, borderRadius: 11, background: "var(--surface-inset)", color: INK, fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                {tx(lang, "Album", "Album")}
              </button>
            </div>
            <input ref={camRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && onScanFile(e.target.files[0])} />
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && onScanFile(e.target.files[0])} />

            {/* quota */}
            <div style={{ marginTop: 10, fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>
              {quota ? (
                quota.remaining > 0 ? (
                  <>
                    {tx(lang, `${quota.remaining} scans left this month`, `${quota.remaining} scan tersisa bulan ini`)}
                    {quota.credits > 0 && <> ({tx(lang, `+${quota.credits} from your top-up`, `+${quota.credits} dari top-up`)})</>}
                  </>
                ) : (
                  <a href={URLS.TOPUP} style={{ color: "var(--brand)", fontWeight: 700 }}>
                    ⚡ {tx(lang, "Out of scans — explore top-up deals", "Kuota habis — lihat paket top-up")}
                  </a>
                )
              ) : ""}
            </div>
            {scanError && <div style={{ marginTop: 8, fontSize: 12, color: "var(--brand)" }}>{scanError}</div>}

            {/* type food + grams */}
            <div style={{ fontSize: 11, color: MUTED, margin: "14px 0 6px", textTransform: "uppercase", letterSpacing: 1 }}>
              {tx(lang, "or type food + grams (auto kcal)", "atau ketik makanan + gram (auto kkal)")}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={fname} onChange={(e) => setFname(e.target.value)} placeholder={tx(lang, "Food name", "Nama makanan")} style={{ flex: 1, minWidth: 0, padding: 11, background: "var(--surface-inset)", border: `1px solid ${BORDER}`, borderRadius: 10, color: INK }} />
              <input value={fgram} onChange={(e) => setFgram(e.target.value)} type="number" placeholder={tx(lang, "grams", "gram")} style={{ flex: "0 0 78px", padding: 11, background: "var(--surface-inset)", border: `1px solid ${BORDER}`, borderRadius: 10, color: INK }} />
              <button onClick={estimateFood} disabled={estimating} title="auto kcal" style={{ flex: "0 0 auto", width: 48, border: 0, borderRadius: 10, background: "var(--brand)", color: "var(--on-brand)", fontWeight: 800, cursor: "pointer", display: "grid", placeItems: "center" }}>
                {estimating ? "…" : <Icon name="flame" size={18} color="#fff" />}
              </button>
            </div>
            {estError && <div style={{ marginTop: 8, fontSize: 12, color: "var(--brand)" }}>{estError}</div>}
          </div>

          {/* PANEL 8 — intermittent fasting */}
          <FastingSection lang={lang} choice={choice} goal={goal} baseGoal={baseGoal} onChoose={chooseIF} onChange={changeIF} onStart={setIFStart} onToggleReminders={toggleReminders} />
        </div>

        {/* ---------- RIGHT COLUMN ---------- */}
        <div>
          <div style={secLabel}>{tx(lang, "Today's Food Summary", "Ringkasan Makan Hari Ini")}</div>
          <div style={cardStyle}>
            {/* overview */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7 }}>
              {[
                { v: consumed, l: kc, color: "var(--brand)" },
                { v: Math.round(totals.p) + "g", l: tx(lang, "Protein", "Protein") },
                { v: Math.round(totals.c) + "g", l: tx(lang, "Carbs", "Karbo") },
                { v: Math.round(totals.f) + "g", l: tx(lang, "Fat", "Lemak") },
              ].map((m, i) => (
                <div key={i} style={{ background: "var(--surface-inset)", borderRadius: 12, padding: "10px 4px", textAlign: "center", minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: (m as any).color || INK }}>{m.v}</div>
                  <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 0.3, marginTop: 2 }}>{m.l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 8, fontWeight: 600 }}>
              {tx(lang, `${totals.n} ${totals.n === 1 ? "item" : "items"} logged today`, `${totals.n} makanan tercatat hari ini`)}
            </div>

            {totals.n === 0 ? (
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginTop: 12 }}>
                {tx(lang, "Log or scan a meal to see your health meter and healthier swaps.", "Catat atau scan makanan untuk melihat meter sehat & saran tukaran.")}
              </div>
            ) : (
              <>
                {/* PANEL 4 — health meter */}
                <HealthMeter lang={lang} health={health} />
                {/* PANEL 5 — per-item check */}
                <div style={{ marginTop: 14, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: MUTED, marginBottom: 8 }}>{tx(lang, "Per-item check", "Cek tiap makanan")}</div>
                  {items.map((it, i) => {
                    const v = FS.itemVerdict(it, lang);
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</div>
                          <div style={{ fontSize: 11.5, color: MUTED, fontWeight: 600, marginTop: 2, lineHeight: 1.35 }}>
                            {v.reason}
                            {v.swapTo && <> · {tx(lang, "try", "coba")} <b style={{ color: NUTRI.GREEN_DARK }}>{v.swapTo}</b></>}
                          </div>
                        </div>
                        <VerdictBadge cls={v.cls} label={v.label} />
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* PANEL 6 — nutrient gap */}
            <NutrientGapView lang={lang} gap={gap} foods={gapFoods} kc={kc} />

            {/* PANEL 7 — what to eat next */}
            {guidance && (
              <div style={{ marginTop: 14, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: MUTED, marginBottom: 8 }}>{tx(lang, "What to eat next", "Enaknya makan apa lagi")}</div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--brand-soft)", color: "var(--brand)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 650, lineHeight: 1.45 }}>{guidance.msg}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {guidance.picks.map((p, i) => (
                        <span key={i} style={{ fontSize: 12, fontWeight: 700, padding: "5px 11px", borderRadius: 999, background: "var(--surface-inset)", color: INK }}>{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {estimated && (
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginTop: 10 }}>
                {tx(lang, "Targets are estimated — complete your profile at my.20fit.id for personalized goals.", "Target diperkirakan — lengkapi profil di my.20fit.id untuk target personal.")}
              </div>
            )}
          </div>

          {/* PANEL 9 — today's food */}
          <div style={secLabel}>{tx(lang, "Today's Food", "Makanan Hari Ini")}</div>
          <div style={cardStyle}>
            {items.length === 0 ? (
              <div style={{ color: MUTED, fontSize: 13 }}>{tx(lang, "Nothing logged yet.", "Belum ada yang dicatat.")}</div>
            ) : (
              items.map((it, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i === items.length - 1 ? "none" : `1px solid ${BORDER}` }}>
                  <span style={{ minWidth: 0 }}>
                    {it.name}
                    {it.t && <span style={{ fontSize: 11, color: MUTED, fontWeight: 600, marginLeft: 6 }}>{it.t}</span>}
                  </span>
                  <span style={{ color: MUTED, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
                    {it.kcal} {kc}
                    <button onClick={() => deleteItem(i)} aria-label={tx(lang, "Delete", "Hapus")} style={{ border: 0, background: "transparent", color: MUTED, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 2 }}>×</button>
                  </span>
                </div>
              ))
            )}
            <div style={{ fontSize: 11.5, color: NUTRI.GREEN_DARK, marginTop: 12, display: "flex", alignItems: "flex-start", gap: 6 }}>
              <Icon name="check-circle" size={13} color={NUTRI.GREEN_DARK} style={{ marginTop: 1 }} />
              <span>{tx(lang, "Saved to your 20FIT account — also visible on my.20fit.id/calories.", "Tersimpan di akun 20FIT kamu — juga kelihatan di my.20fit.id/calories.")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* bottom — menu recommendations */}
      {menuRecs.length > 0 && (
        <div style={{ ...cardStyle, marginTop: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>🍽️ {tx(lang, "Menu recommendations", "Rekomendasi menu")}</div>
          <div style={{ fontSize: 12, color: MUTED }}>{tx(lang, "Based on your remaining macros today", "Berdasarkan sisa makro hari ini")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginTop: 12 }}>
            {menuRecs.map((r, i) => {
              const nm = (r.nm && (lang === "id" ? r.nm.id || r.nm.en : r.nm.en || r.nm.id)) || "";
              return (
                <div key={i} style={{ border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ height: 82, display: "grid", placeItems: "center", fontSize: 38, background: `linear-gradient(160deg, ${r.tint || "#eee"}33, ${r.tint || "#eee"}11)` }}>{r.emoji || "🍲"}</div>
                  <div style={{ padding: "9px 11px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.25 }}>{nm}</div>
                    <div style={{ fontSize: 10.5, color: MUTED, marginTop: 4, fontWeight: 700 }}>~{r.kcal} {kc} · P{r.p} C{r.c} F{r.f}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 10 }}>{tx(lang, "Rough guidance — not a substitute for a nutritionist.", "Panduan kasar — bukan pengganti ahli gizi.")}</div>
        </div>
      )}

      {/* scan: loading, then rich result modal */}
      {scanning && <ScanningOverlay lang={lang} />}
      {scanResult && (
        <ScanResultModal
          lang={lang}
          result={scanResult}
          goal={goal}
          eaten={consumed}
          onLogged={(list) => { setItems(list); setScanResult(null); setScanError(null); apiClient.getQuota().then(setQuota).catch(() => {}); }}
          onClose={() => { setScanResult(null); setScanError(null); }}
          kc={kc}
        />
      )}

      <style>{`
        @media (min-width: 900px) { .ct-tracker-grid { grid-template-columns: 1fr 1fr !important; align-items: start; } }
        @keyframes ctSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ---------- sub-views ----------
function VerdictBadge({ cls, label }: { cls: "hh" | "hm" | "hu"; label: string }) {
  const map = { hh: { bg: NUTRI.GREEN_TINT, fg: NUTRI.GREEN_DARK }, hm: { bg: "#FDF3E7", fg: "#B4690E" }, hu: { bg: "#FDECEC", fg: COLORS.RED } } as const;
  const c = map[cls];
  return <span style={{ fontSize: 11.5, fontWeight: 800, padding: "4px 11px", borderRadius: 999, whiteSpace: "nowrap", color: c.fg, background: c.bg }}>{label}</span>;
}

function HealthMeter({ lang, health }: { lang: Lang; health: FS.HealthResult }) {
  const bandCls = health.band === "h" ? "hh" : health.band === "m" ? "hm" : "hu";
  const barCol = health.band === "h" ? NUTRI.GREEN : health.band === "m" ? NUTRI.AMBER : COLORS.RED;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: MUTED }}>{tx(lang, "Health meter", "Meter sehat")}</span>
        <VerdictBadge cls={bandCls} label={`${FS.bandLabel(health.band, lang)} · ${health.score}/100`} />
      </div>
      <div style={{ height: 10, background: "var(--surface-inset)", borderRadius: 6, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${health.score}%`, background: barCol, borderRadius: 6, transition: "width .45s" }} />
      </div>
      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginTop: 7 }}>{FS.healthNote(health.band, lang)}</div>
    </div>
  );
}

function NutrientGapView({ lang, gap, foods, kc }: { lang: Lang; gap: FS.NutrientGap; foods: MenuRecipe[]; kc: string }) {
  return (
    <div style={{ marginTop: 14, borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: MUTED, marginBottom: 8 }}>{tx(lang, "Nutrient gap today", "Kekurangan nutrisi hari ini")}</div>
      {gap.met ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 650, color: NUTRI.GREEN_DARK, background: NUTRI.GREEN_TINT, borderRadius: 12, padding: "11px 13px", lineHeight: 1.4 }}>
          <Icon name="check-circle" size={19} color={NUTRI.GREEN} />
          {tx(lang, "You've met your macro targets for today. Nice!", "Target makro harianmu sudah terpenuhi. Mantap!")}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {(["p", "c", "f"] as const).map((k) => (gap.rem[k] > 0 ? (
              <span key={k} style={{ fontSize: 11.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: k === gap.big ? "var(--brand-soft)" : "var(--surface-inset)", color: k === gap.big ? "var(--brand)" : INK }}>
                {gap.labels[k]} {gap.rem[k]}g
              </span>
            ) : null))}
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: MUTED, marginBottom: 8 }}>
            {tx(lang, `Fill the biggest gap (${gap.bigLabel}) with`, `Tutup kekurangan terbesar (${gap.bigLabel}) dengan`)}
          </div>
          <div>
            {(foods.length > 0
              ? foods.map((r) => ({ e: r.emoji || "🍲", name: (r.nm && (lang === "id" ? r.nm.id || r.nm.en : r.nm.en || r.nm.id)) || "", meta: `~${r.kcal} ${kc} · P${r.p} C${r.c} F${r.f}`, tint: r.tint }))
              : gap.staticFoods.map((s) => ({ e: s.e, name: s.name, meta: "", tint: undefined }))
            ).map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", fontSize: 17, flex: "0 0 auto", background: f.tint ? `linear-gradient(160deg, ${f.tint}33, ${f.tint}11)` : "var(--surface-inset)" }}>{f.e}</div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 650 }}>{f.name}</div>
                {f.meta && <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, whiteSpace: "nowrap" }}>{f.meta}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FastingSection({ lang, choice, goal, baseGoal, onChoose, onChange, onStart, onToggleReminders }: {
  lang: Lang; choice: Fasting.FastingChoice | null; goal: number; baseGoal: number;
  onChoose: (id: string) => void; onChange: () => void; onStart: (v: string) => void; onToggleReminders: () => void;
}) {
  const L = (o: { en: string; id: string }) => o[lang];
  const kc = tx(lang, "kcal", "kkal");
  const [exploreOpen, setExploreOpen] = useState(false);

  if (!choice) {
    const pop = Fasting.styleById("16:8");
    return (
      <>
        <div style={secLabel}>{tx(lang, "Intermittent Fasting", "Intermittent Fasting")}</div>
        <div style={cardStyle}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{tx(lang, "Adopt a fasting style", "Adopsi gaya puasa")}</div>
          <div style={{ fontSize: 13, color: MUTED, margin: "4px 0 12px" }}>{tx(lang, "Fasting can sharpen your calorie deficit. Start with the most popular, or explore by level.", "Puasa bisa mempertajam defisit kalorimu. Mulai dari yang paling populer, atau jelajahi per level.")}</div>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: 12, background: "var(--surface-inset)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>16:8 · {tx(lang, "Most popular", "Paling populer")}</div>
                <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{pop ? L(pop.desc) : ""}</div>
              </div>
              <button onClick={() => onChoose("16:8")} style={{ flex: "0 0 auto", background: "var(--brand)", color: "var(--on-brand)", borderRadius: 9, padding: "8px 12px", fontWeight: 800, fontSize: 12, border: 0, cursor: "pointer" }}>{tx(lang, "Choose", "Pilih")}</button>
            </div>
          </div>
          <button onClick={() => setExploreOpen((o) => !o)} style={{ width: "100%", marginTop: 12, background: "var(--surface-inset)", border: `1px solid ${BORDER}`, borderRadius: 11, padding: 13, fontWeight: 800, fontSize: 13, color: INK, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {exploreOpen ? tx(lang, "Hide styles", "Sembunyikan gaya") : tx(lang, "Explore all styles", "Jelajahi semua gaya")} <span style={{ color: "var(--brand)", fontSize: 11 }}>{exploreOpen ? "▲" : "▼"}</span>
          </button>
          {exploreOpen && (
            <div style={{ marginTop: 4 }}>
              {Fasting.IF_LEVELS.map((g) => {
                const styles = g.ids.map((id) => Fasting.styleById(id)).filter(Boolean) as Fasting.FastingStyle[];
                if (!styles.length) return null;
                return (
                  <div key={L(g.t)}>
                    <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, fontSize: 12, color: "var(--brand)", margin: "16px 0 0" }}>{L(g.t)}</div>
                    {styles.map((s) => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${BORDER}` }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{L(s.name)}</div>
                          <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{L(s.desc)}</div>
                        </div>
                        <button onClick={() => onChoose(s.id)} style={{ flex: "0 0 auto", background: "var(--brand)", color: "var(--on-brand)", borderRadius: 9, padding: "8px 12px", fontWeight: 800, fontSize: 12, border: 0, cursor: "pointer" }}>{tx(lang, "Choose", "Pilih")}</button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }

  const st = Fasting.state();
  if (!st) return null;
  const s = st.style;
  const meals = Fasting.mealsFor(s.id);
  const perMeal = Math.max(1, Math.round(goal / meals / 10) * 10);
  const adj = goal !== baseGoal;
  const on = Fasting.notifEnabled();

  const planBlock = s.weekly ? (
    <div style={{ marginTop: 12, borderTop: `1px dashed ${BORDER}`, paddingTop: 10 }}>
      <PlanRow label={tx(lang, "Normal days (5/wk)", "Hari normal (5/mgg)")} value={`${goal} ${kc}`} />
      <PlanRow label={tx(lang, "Fast days (2/wk)", "Hari puasa (2/mgg)")} value={`~500–600 ${kc}`} valueColor="var(--brand)" />
    </div>
  ) : (
    <div style={{ marginTop: 12, borderTop: `1px dashed ${BORDER}`, paddingTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "4px 0" }}>
        <span>{tx(lang, "Daily target", "Target harian")}</span>
        <b>{adj && <span style={{ color: MUTED, textDecoration: "line-through", fontWeight: 400 }}>{baseGoal} </span>}{goal} {kc}</b>
      </div>
      {adj && <div style={{ fontSize: 11, color: MUTED, margin: "-2px 0 4px" }}>{tx(lang, `Adjusted for ${s.id} fasting`, `Disesuaikan untuk puasa ${s.id}`)}</div>}
      <PlanRow label={tx(lang, "Meals in your window", "Makan dalam jendelamu")} value={`${meals}×`} />
      <PlanRow label={tx(lang, "≈ per meal", "≈ per makan")} value={`${perMeal} ${kc}`} valueColor="var(--brand)" />
    </div>
  );

  return (
    <>
      <div style={secLabel}>{tx(lang, "Intermittent Fasting", "Intermittent Fasting")}</div>
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>{L(s.name)}</div>
          <button onClick={onChange} style={{ background: "none", border: 0, color: "var(--brand)", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>{tx(lang, "Change style", "Ganti gaya")}</button>
        </div>
        {st.weekly ? (
          <>
            <div style={{ color: MUTED, fontSize: 13 }}>{L(s.desc)}</div>
            {planBlock}
          </>
        ) : (
          <>
            <span style={{ display: "inline-block", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, padding: "4px 10px", borderRadius: 20, background: st.eating ? "rgba(42,122,79,.15)" : "rgba(200,112,0,.15)", color: st.eating ? NUTRI.GREEN_DARK : "#C87000" }}>
              {st.eating ? tx(lang, "Eating window", "Jendela makan") : tx(lang, "Fasting", "Sedang puasa")}
            </span>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8, fontVariantNumeric: "tabular-nums" }}>{Math.floor((st.untilMin || 0) / 60)}h {(st.untilMin || 0) % 60}m</div>
            <div style={{ color: MUTED, fontSize: 13 }}>{st.eating ? tx(lang, "left in your eating window", "sisa di jendela makanmu") : tx(lang, "until your eating window", "sampai jendela makanmu")}</div>
            <div style={{ color: MUTED, marginTop: 8, fontSize: 13 }}>{tx(lang, "Eating window", "Jendela makan")}: <b>{st.window?.start} – {st.window?.end}</b></div>
            <div style={{ marginTop: 10 }}>
              <span style={{ color: MUTED, fontSize: 12 }}>{tx(lang, "Start eating at", "Mulai makan jam")}</span>{" "}
              <input type="time" value={st.chosen.start} onChange={(e) => onStart(e.target.value)} style={{ padding: 8, border: `1px solid ${BORDER}`, borderRadius: 8, background: "var(--surface-inset)", color: INK, fontFamily: "inherit" }} />
            </div>
            {planBlock}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 12, background: "var(--surface-inset)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{tx(lang, "Meal reminders", "Pengingat makan")}</div>
                <div style={{ color: MUTED, fontSize: 11 }}>{tx(lang, "Notify me when the window opens / closes", "Ingatkan saat jendela buka / tutup")}</div>
              </div>
              <button onClick={onToggleReminders} style={{ border: 0, borderRadius: 9, padding: "9px 13px", fontWeight: 800, fontSize: 12, cursor: "pointer", flex: "0 0 auto", whiteSpace: "nowrap", background: on ? "#dfe9e0" : "var(--brand)", color: on ? NUTRI.GREEN_DARK : "var(--on-brand)" }}>
                {on ? tx(lang, "On ✓", "Aktif ✓") : tx(lang, "Enable", "Aktifkan")}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function PlanRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "4px 0" }}>
      <span>{label}</span>
      <b style={{ color: valueColor }}>{value}</b>
    </div>
  );
}

// Loading state while the photo is analysed (with a rotating fun fact).
const FOOD_FACTS: { en: string; id: string }[] = [
  { en: "Broccoli contains more vitamin C than an orange, gram for gram.", id: "Brokoli punya vitamin C lebih banyak dari jeruk, per gramnya." },
  { en: "Eating protein helps you feel full longer and supports muscle.", id: "Makan protein bikin kenyang lebih lama & bantu jaga otot." },
  { en: "Chewing slowly helps your brain notice you're full — and eat less.", id: "Mengunyah pelan bantu otak sadar kamu kenyang — jadi makan lebih sedikit." },
  { en: "Colorful plates usually mean more vitamins — eat the rainbow!", id: "Piring warna-warni biasanya lebih kaya vitamin — makan aneka warna!" },
  { en: "A glass of water before a meal can help with portion control.", id: "Segelas air sebelum makan bantu kontrol porsi." },
  { en: "Fiber from veggies & whole grains keeps your gut happy.", id: "Serat dari sayur & biji utuh bikin pencernaan sehat." },
];
function ScanningOverlay({ lang }: { lang: Lang }) {
  const fact = FOOD_FACTS[Math.floor(Math.random() * FOOD_FACTS.length)];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 95, background: "rgba(10,12,16,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 440, background: "var(--surface)", borderRadius: 22, padding: "30px 22px", color: INK, textAlign: "center", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
        <span style={{ width: 52, height: 52, display: "inline-block", borderRadius: "50%", border: `4px solid ${BORDER}`, borderTopColor: "var(--brand)", animation: "ctSpin .8s linear infinite" }} />
        <div style={{ fontSize: 18, fontWeight: 800, margin: "16px 0 12px" }}>{tx(lang, "Your food is being scanned…", "Makananmu sedang dipindai…")}</div>
        <div style={{ background: NUTRI.GREEN_TINT, borderRadius: 14, padding: "14px 16px", textAlign: "left" }}>
          <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.7, fontWeight: 800, color: NUTRI.GREEN_DARK, marginBottom: 6 }}>{tx(lang, "Fun fact", "Tahukah kamu")}</div>
          {/* Fixed dark colour — this tint box stays light green in both themes,
              so the fact must not inherit the themed (light) --text. */}
          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#1f4d33" }}>{tx(lang, fact.en, fact.id)}</div>
        </div>
        <style>{`@keyframes ctSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
