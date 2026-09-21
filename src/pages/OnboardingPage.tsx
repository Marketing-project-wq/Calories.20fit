import { useState } from "react";
import { COLORS, NUTRI } from "../lib/constants";
import { Lang } from "../lib/i18n";
import { saveOnboarding } from "../lib/authApi";

const BORDER = "var(--border)";
const INK = "var(--text)";
const MUTED = "var(--text-soft)";
const tx = (lang: Lang, en: string, id: string) => (lang === "id" ? id : en);

function readStash(k: string): string {
  try {
    return sessionStorage.getItem(k) || "";
  } catch {
    return "";
  }
}

// Exported so HistoryPage's "edit goals" panel offers the exact same options
// (same key strings written to my20fit_profile.activity_level/main_goal).
export const ACTIVITIES: { key: string; en: string; id: string }[] = [
  { key: "sedentary", en: "Sedentary — little/no exercise", id: "Jarang gerak — jarang/tak olahraga" },
  { key: "light", en: "Light — 1-3x/week", id: "Ringan — 1-3x/minggu" },
  { key: "moderate", en: "Moderate — 3-5x/week", id: "Sedang — 3-5x/minggu" },
  { key: "active", en: "Active — 6-7x/week", id: "Aktif — 6-7x/minggu" },
];
export const GOALS: { key: string; en: string; id: string }[] = [
  { key: "lose", en: "Lose weight", id: "Turun berat" },
  { key: "maintain", en: "Maintain", id: "Jaga berat" },
  { key: "muscle", en: "Build muscle", id: "Naik massa otot" },
  { key: "fit", en: "Get fit", id: "Lebih bugar" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  background: "var(--surface-2)",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  color: INK,
  fontSize: 15,
};
const labelStyle: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: INK, marginBottom: 6, display: "block" };

// Native onboarding — writes weight/height/age/gender/activity/goal into
// my20fit_profile (the SAME table my.20fit.id reads), so the tracker's targets
// are personal immediately and the profile is consistent across both apps.
export function OnboardingPage({ lang, onDone }: { lang: Lang; onDone: () => void }) {
  const [gender, setGender] = useState<string>(readStash("pending_gender"));
  const [birthdate, setBirthdate] = useState<string>(readStash("pending_dob"));
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("light");
  const [goal, setGoal] = useState("maintain");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!gender || !birthdate || !h || !w || h < 80 || h > 250 || w < 25 || w > 400) {
      setError(tx(lang, "Please fill every field with a reasonable value.", "Lengkapi semua kolom dengan nilai yang wajar."));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveOnboarding({ gender, birthdate, height_cm: h, weight_kg: w, activity_level: activity, main_goal: goal });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : tx(lang, "Failed to save. Try again.", "Gagal menyimpan. Coba lagi."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px 60px" }}>
      <div style={{ height: 6, borderRadius: 6, background: `linear-gradient(90deg, ${COLORS.RED}, ${NUTRI.GREEN})`, marginBottom: 20 }} />
      <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 30, textTransform: "uppercase", color: INK, margin: "0 0 6px" }}>
        {tx(lang, "Set up your profile", "Lengkapi profilmu")}
      </h1>
      <p style={{ fontSize: 14, color: MUTED, margin: "0 0 22px", lineHeight: 1.55 }}>
        {tx(lang, "So your calorie & macro targets are personal. Takes ~30 seconds.", "Biar target kalori & makro-mu personal. Cuma ~30 detik.")}
      </p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>{tx(lang, "Gender", "Jenis kelamin")}</label>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ k: "male", l: tx(lang, "Male", "Pria") }, { k: "female", l: tx(lang, "Female", "Wanita") }].map((g) => (
              <button type="button" key={g.k} onClick={() => setGender(g.k)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1px solid ${gender === g.k ? "var(--brand)" : BORDER}`, background: gender === g.k ? "var(--brand-soft)" : "var(--surface)", color: gender === g.k ? "var(--brand)" : INK, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {g.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>{tx(lang, "Date of birth", "Tanggal lahir")}</label>
          <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} style={inputStyle} max={new Date().toISOString().slice(0, 10)} />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{tx(lang, "Height (cm)", "Tinggi (cm)")}</label>
            <input type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>{tx(lang, "Weight (kg)", "Berat (kg)")}</label>
            <input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="65" style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>{tx(lang, "Activity level", "Level aktivitas")}</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)} style={inputStyle}>
            {ACTIVITIES.map((a) => (
              <option key={a.key} value={a.key}>{tx(lang, a.en, a.id)}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>{tx(lang, "Your goal", "Tujuanmu")}</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {GOALS.map((g) => (
              <button type="button" key={g.key} onClick={() => setGoal(g.key)} style={{ padding: "11px 0", borderRadius: 10, border: `1px solid ${goal === g.key ? "var(--brand)" : BORDER}`, background: goal === g.key ? "var(--brand-soft)" : "var(--surface)", color: goal === g.key ? "var(--brand)" : INK, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {tx(lang, g.en, g.id)}
              </button>
            ))}
          </div>
        </div>

        {error && <div style={{ fontSize: 13, color: "var(--brand)" }}>{error}</div>}

        <button type="submit" disabled={saving} style={{ marginTop: 4, padding: "14px 0", border: 0, borderRadius: 12, background: "var(--brand)", color: "var(--on-brand)", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
          {saving ? tx(lang, "Saving…", "Menyimpan…") : tx(lang, "Continue to tracker", "Lanjut ke tracker")} →
        </button>
        <p style={{ fontSize: 11.5, color: MUTED, textAlign: "center", margin: 0 }}>
          {tx(lang, "Saved to your 20FIT account — also used on my.20fit.id.", "Tersimpan di akun 20FIT kamu — juga dipakai di my.20fit.id.")}
        </p>
      </form>
    </div>
  );
}
