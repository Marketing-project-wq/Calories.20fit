import { useRef, useState } from "react";
import { URLS } from "../lib/constants";
import { apiClient, ScanResult } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { t, Lang } from "../lib/i18n";

const RED = "#D62828";
const BLACK = "#141414";
const TINT = "#FDECEC";
const BORDER = "#E4E0DB";
const W = 1100;

// Glassmorphism helper: frosted, translucent surface over a gradient/orb backdrop.
const glass = (opacity = 0.62) => ({
  background: `rgba(255,255,255,${opacity})`,
  backdropFilter: "blur(22px) saturate(180%)",
  WebkitBackdropFilter: "blur(22px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.65)",
});

const ECOSYSTEM = {
  id: [
    { name: "Scan Kalori", host: "calories.20fit.id", initial: "K", accent: RED, desc: "Foto makanan, dapat estimasi kalori dan makronutriennya." },
    { name: "Menu Diet", host: "menu.20fit.id", initial: "M", accent: "#2F7D5B", desc: "Kumpulan menu dan resep dengan hitungan kalori per porsi." },
    { name: "Panduan MCU", host: "medicalcheckup.20fit.id", initial: "C", accent: "#2D4E8F", desc: "Upload hasil lab, baca penjelasan tiap penandanya." },
    { name: "My 20FIT", host: "my.20fit.id", initial: "20", accent: BLACK, desc: "Akun, riwayat, meal plan, diet plan, dan analytics." },
  ],
  en: [
    { name: "Calorie Scan", host: "calories.20fit.id", initial: "K", accent: RED, desc: "Photo your food, get calorie and macronutrient estimates." },
    { name: "Diet Menu", host: "menu.20fit.id", initial: "M", accent: "#2F7D5B", desc: "Menu collection and recipes with calories per serving." },
    { name: "MCU Guide", host: "medicalcheckup.20fit.id", initial: "C", accent: "#2D4E8F", desc: "Upload lab results, read explanations for each marker." },
    { name: "My 20FIT", host: "my.20fit.id", initial: "20", accent: BLACK, desc: "Account, history, meal plan, diet plan, and analytics." },
  ],
};

const FAQS = {
  id: [
    { q: "Seberapa akurat estimasinya?", a: "Model menebak jenis makanan dan porsinya dari satu foto. Minyak yang terserap, cara masak, dan berat asli tidak terlihat, jadi selisihnya bisa cukup besar. Pakai angkanya untuk melihat arah, bukan menghitung tepat." },
    { q: "Kenapa meal plan dan analytics butuh akun?", a: "Ketiganya dihitung dari riwayat, bukan dari satu foto. Riwayat butuh tempat tersimpan, dan tempatnya ada di akun 20FIT." },
    { q: "Fotonya disimpan?", a: "Untuk pengunjung tanpa akun, foto hanya diproses untuk menghasilkan estimasi. Hasil tidak tersimpan dan foto tidak digunakan untuk keperluan lain." },
    { q: "Sudah punya akun 20FIT?", a: "Kalau kamu sedang login, halaman ini mengenali kamu otomatis. Tidak ada gate, tidak ada ajakan daftar, dan hasilnya langsung masuk ke riwayat." },
  ],
  en: [
    { q: "How accurate is the estimate?", a: "The model guesses the food type and portion from a single photo. Absorbed oil, cooking method, and actual weight are not visible, so the margin can be significant. Use the numbers to track direction, not as exact measurements." },
    { q: "Why do meal plan and analytics need an account?", a: "All three are calculated from history, not a single photo. History needs somewhere to be stored, and that place is a 20FIT account." },
    { q: "Is the photo saved?", a: "For visitors without an account, the photo is only processed to generate the estimate. Results are not saved and the photo is not used for any other purpose." },
    { q: "Already have a 20FIT account?", a: "If you are logged in, this page recognizes you automatically. No gate, no sign-up prompt, and results go directly into your history." },
  ],
};

const TESTIMONIALS = {
  id: [
    { name: "Ayu R.", initial: "A", color: "#E8734A", rating: 5, text: "Baru upload foto nasi padang, langsung keluar estimasi kalorinya. Simpel banget, nggak perlu input manual satu-satu.", food: "Nasi Padang" },
    { name: "Dimas P.", initial: "D", color: "#4A90D9", rating: 5, text: "Saya pakai tiap makan siang di kantor. Lumayan buat ngecek supaya nggak kebablasan kalorinya. Akurasinya cukup oke untuk estimasi.", food: "Mie Ayam + Es Teh" },
    { name: "Sarah K.", initial: "S", color: "#2F7D5B", rating: 4, text: "Yang saya suka, hasilnya langsung terbuka tanpa harus daftar dulu. Kalau mau simpan riwayat baru buat akun — masuk akal.", food: "Gado-gado" },
    { name: "Rizky F.", initial: "R", color: "#8B5CF6", rating: 5, text: "Udah coba beberapa aplikasi serupa, ini paling gampang. Foto, analisis, selesai. Cocok buat yang nggak mau ribet.", food: "Ayam Bakar" },
    { name: "Putri N.", initial: "P", color: "#D97706", rating: 5, text: "Terbantu banget pas lagi diet. Nggak perlu hafal kalori tiap makanan, tinggal foto aja langsung tau kira-kira berapa.", food: "Salad Sayur" },
    { name: "Andi M.", initial: "A", color: "#DC2626", rating: 4, text: "Hasilnya cukup akurat untuk makanan Indonesia. Satu hal yang saya appreciate, dia jujur bahwa ini estimasi, bukan angka pasti.", food: "Soto Ayam" },
  ],
  en: [
    { name: "Ayu R.", initial: "A", color: "#E8734A", rating: 5, text: "Just uploaded a photo of nasi padang and the calorie estimate came right out. Super simple, no manual input needed.", food: "Nasi Padang" },
    { name: "Dimas P.", initial: "D", color: "#4A90D9", rating: 5, text: "I use it every lunch at the office. Good for keeping calories in check. Accuracy is decent enough for an estimate.", food: "Mie Ayam + Iced Tea" },
    { name: "Sarah K.", initial: "S", color: "#2F7D5B", rating: 4, text: "What I like is the results open immediately without signing up. Create an account only if you want to save history — makes sense.", food: "Gado-gado" },
    { name: "Rizky F.", initial: "R", color: "#8B5CF6", rating: 5, text: "Tried several similar apps, this one is the easiest. Photo, analyze, done. Perfect for people who don't want the hassle.", food: "Grilled Chicken" },
    { name: "Putri N.", initial: "P", color: "#D97706", rating: 5, text: "Really helpful when dieting. No need to memorize calories for every food — just take a photo and you know roughly how much.", food: "Vegetable Salad" },
    { name: "Andi M.", initial: "A", color: "#DC2626", rating: 4, text: "Accurate enough for Indonesian food. One thing I appreciate — it's honest that this is an estimate, not an exact number.", food: "Soto Ayam" },
  ],
};

const STEPS = {
  id: [
    { num: "01", title: "Ambil satu foto", body: "Seluruh porsi dari atas, satu piring per foto." },
    { num: "02", title: "Sistem mengenali makanannya", body: "Model AI menebak jenis dan porsi, lalu dicocokkan ke basis data gizi." },
    { num: "03", title: "Baca sebagai kisaran", body: "Berguna untuk melihat pola, bukan menghitung sampai satuan." },
  ],
  en: [
    { num: "01", title: "Take one photo", body: "Full portion from above, one plate per photo." },
    { num: "02", title: "System identifies the food", body: "AI model guesses type and portion, then matches to a nutrition database." },
    { num: "03", title: "Read as a range", body: "Useful for spotting patterns, not for exact counting." },
  ],
};

const FEATURES = {
  id: [
    { icon: "📷", title: "Scan dari foto", body: "Upload foto makanan, sistem mengenali dan memperkirakan kalori, protein, karbo, dan lemak." },
    { icon: "📊", title: "Riwayat dan tren", body: "Setiap scan tersimpan, lalu dibaca sebagai tren lintas hari." },
    { icon: "🥗", title: "Meal plan & diet plan", body: "Rencana makan dari target dan preferensi kamu, bukan template umum." },
    { icon: "👨‍🍳", title: "Resep dari makanan yang di-scan", body: "Bahan dan langkah diuraikan dari makanan yang kamu suka." },
  ],
  en: [
    { icon: "📷", title: "Scan from photo", body: "Upload a food photo, system identifies and estimates calories, protein, carbs, and fat." },
    { icon: "📊", title: "History and trends", body: "Every scan is saved, then read as cross-day trends." },
    { icon: "🥗", title: "Meal plan & diet plan", body: "A meal plan built from your targets and preferences, not a generic template." },
    { icon: "👨‍🍳", title: "Recipes from scanned food", body: "Ingredients and steps are broken down from food you like." },
  ],
};

function TestimonialCard({ tm }: { tm: (typeof TESTIMONIALS)["id"][number] }) {
  return (
    <div className="sc-marquee-card">
      <div className="sc-card" style={{ ...glass(0.62), borderRadius: 18, padding: 18, display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="sc-testi-icon" style={{ width: 38, height: 38, borderRadius: "50%", background: tm.color, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, flexShrink: 0 }}>{tm.initial}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 13, fontWeight: "bold", color: BLACK }}>{tm.name}</span>
            <div style={{ display: "flex", gap: 2 }}>
              {Array.from({ length: 5 }).map((_, r) => (
                <span key={r} style={{ fontSize: 11, color: r < tm.rating ? "#F59E0B" : "#D4D0CB" }}>★</span>
              ))}
            </div>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#3A3A3A", flex: 1 }}>"{tm.text}"</p>
        <span style={{ fontSize: 11, color: "#9A9A9A", background: "#F4F2F0", borderRadius: 999, padding: "4px 10px", alignSelf: "flex-start" }}>{tm.food}</span>
      </div>
    </div>
  );
}

function TestimonialMarquee({ testimonials }: { testimonials: (typeof TESTIMONIALS)["id"] }) {
  const mid = Math.ceil(testimonials.length / 2);
  const rows = [testimonials.slice(0, mid), testimonials.slice(mid)];
  return (
    <div className="sc-marquee-wrap">
      {rows.map((row, ri) => (
        <div key={ri} className="sc-marquee-row" style={{ marginTop: ri === 0 ? 0 : 12, animationDuration: ri === 0 ? "34s" : "40s" }}>
          {[...row, ...row].map((tm, i) => <TestimonialCard key={`${tm.name}-${i}`} tm={tm} />)}
        </div>
      ))}
    </div>
  );
}

function EcosystemPhoneMockup({ eco }: { eco: (typeof ECOSYSTEM)["id"] }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div className="sc-phone-float" style={{ width: 230, borderRadius: 38, border: `10px solid ${BLACK}`, background: BLACK, boxShadow: "0 30px 60px -20px rgba(20,20,20,0.35)", position: "relative" }}>
        <span style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 66, height: 16, borderRadius: 10, background: BLACK, zIndex: 2 }} />
        <div style={{ background: "linear-gradient(160deg, #FDF6F2 0%, #FFFFFF 65%)", borderRadius: 28, overflow: "hidden", paddingTop: 30, paddingBottom: 16 }}>
          <div style={{ padding: "0 16px 14px", textAlign: "center" }}>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, letterSpacing: ".04em", color: BLACK }}>20FIT</span>
          </div>
          <div style={{ padding: "0 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {eco.map((e) => (
              <div key={e.host} style={{ ...glass(0.75), borderRadius: 14, padding: "9px 10px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, background: e.accent, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, flexShrink: 0 }}>{e.initial}</span>
                <span style={{ fontSize: 11, fontWeight: "bold", color: BLACK }}>{e.name}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
            <span style={{ width: 90, height: 4, borderRadius: 999, background: "rgba(20,20,20,0.15)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(20,20,20,0.06)" }}>
      <button onClick={() => setOpen(!open)} className="sc-faq-btn" style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: "transparent", border: 0, padding: "14px 16px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
        <span style={{ flex: 1, fontSize: 14, fontWeight: "bold", lineHeight: 1.35 }}>{q}</span>
        <span className="sc-faq-icon" style={{ fontSize: 16, color: open ? "#D62828" : "#A8A8A8", flexShrink: 0, transform: open ? "rotate(180deg)" : "none" }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div className="sc-faq-answer" style={{ padding: "0 16px 14px", fontSize: 13, lineHeight: 1.6, color: "#4A4A4A" }}>{a}</div>}
    </div>
  );
}

export const ScanPage = ({ lang = "id" }: { lang?: Lang }) => {
  const tr = t[lang];
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [resultTab, setResultTab] = useState<"result" | "insights" | "summary">("result");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError(tr.errFormat); return; }
    if (file.size > 5 * 1024 * 1024) { setError(tr.errSize); return; }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleDrag = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); };

  const startAnalyze = async () => {
    if (!photoFile) return;
    setIsLoading(true); setError(null);
    try {
      // Scanning itself is unlimited from the client's side — no pre-flight quota
      // check here. Only the deeper analysis (Insights / Food Summary tabs) is
      // gated, and that's a login gate, not a scan-credit gate. If the backend
      // still rejects the scan (e.g. abuse limits), the catch below surfaces it.
      const result = await apiClient.scanPhoto(photoFile);
      setScanResult(result); setScanCount(c => c + 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : tr.errGeneric;
      setError(msg === "scan_limit" ? tr.errQuota : msg);
    } finally { setIsLoading(false); }
  };

  const resetAll = () => { if (photoPreview) URL.revokeObjectURL(photoPreview); setScanResult(null); setPhotoFile(null); setPhotoPreview(null); setError(null); };
  const scanAgain = () => { setScanResult(null); setError(null); };

  const ToolPanel = () => {
    if (isLoading || authLoading) return (
      <div style={{ ...glass(0.55), borderRadius: 22, padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", boxShadow: "0 20px 50px -12px rgba(20,20,20,0.12)" }}>
        <span style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: RED, display: "block", animation: "scSpin .9s linear infinite" }} />
        <span style={{ fontSize: 14, fontWeight: "bold", color: BLACK }}>{tr.analyzing}</span>
        <span style={{ fontSize: 12, color: "#8A8A8A" }}>{tr.analyzingSub}</span>
        <style>{`@keyframes scSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

    if (error) return (
      <div style={{ ...glass(0.6), borderColor: "rgba(255,150,150,0.5)", borderRadius: 22, padding: 20, display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 20px 50px -12px rgba(214,40,40,0.12)" }}>
        <span style={{ fontSize: 13, fontWeight: "bold", color: RED }}>{tr.failedTitle}</span>
        <span style={{ fontSize: 12, color: "#4A4A4A" }}>{error}</span>
        <button onClick={() => setError(null)} className="sc-btn-primary" style={{ background: RED, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontFamily: "inherit", fontSize: 12, fontWeight: "bold", cursor: "pointer", alignSelf: "flex-start" }}>{tr.retryBtn}</button>
      </div>
    );

    if (scanResult) {
      const healthScore = scanResult.health_score;
      const fillingRate = scanResult.satiety_score;
      const healthColor = healthScore >= 70 ? "#2F7D5B" : healthScore >= 40 ? "#D97706" : RED;
      const fillingColor = fillingRate >= 70 ? "#2F7D5B" : fillingRate >= 40 ? "#D97706" : RED;
      const proteinPct = scanResult.calories > 0 ? Math.min(100, Math.round((scanResult.protein * 4 / scanResult.calories) * 100)) : 0;
      const carbsPct = scanResult.calories > 0 ? Math.min(100, Math.round((scanResult.carbs * 4 / scanResult.calories) * 100)) : 0;
      const fatPct = scanResult.calories > 0 ? Math.min(100, Math.round((scanResult.fat * 9 / scanResult.calories) * 100)) : 0;
      const fiberScore = Math.round(Math.min(scanResult.fiber / 5, 1) * 100);

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ ...glass(0.7), borderRadius: "22px 22px 0 0", overflow: "hidden", boxShadow: "0 20px 50px -12px rgba(20,20,20,0.14)" }}>
          {photoPreview && <div style={{ height: 160, backgroundImage: `url(${photoPreview})`, backgroundSize: "cover", backgroundPosition: "center" }} />}
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Name + calories */}
            <div>
              <span style={{ fontSize: 13, fontWeight: "bold", color: BLACK, display: "block", marginBottom: 4 }}>{scanResult.food_name}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 36, color: RED, lineHeight: 1 }}>{scanResult.calories}</span>
                <span style={{ fontSize: 12, color: "#8A8A8A" }}>{tr.kcal}</span>
                {scanResult.total_grams > 0 && <span style={{ fontSize: 11, color: "#9A9A9A", marginLeft: 4 }}>· {scanResult.total_grams}g</span>}
              </div>
            </div>

            {/* Macros — always visible */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: tr.protein, value: scanResult.protein, unit: "g", pct: proteinPct },
                { label: tr.carbs, value: scanResult.carbs, unit: "g", pct: carbsPct },
                { label: tr.fat, value: scanResult.fat, unit: "g", pct: fatPct },
                { label: lang === "id" ? "Serat" : "Fiber", value: scanResult.fiber, unit: "g", pct: fiberScore },
              ].map(m => (
                <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#6A6A6A" }}>{m.label}</span>
                    <span style={{ color: BLACK, fontWeight: 600 }}>{m.value}g</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: BORDER, overflow: "hidden" }}>
                    <div className="sc-bar-fill" style={{ height: 4, width: `${m.pct}%`, borderRadius: 999, background: RED }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Health meter + Filling rate */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ border: "1px solid rgba(20,20,20,0.08)", background: "rgba(255,255,255,0.4)", borderRadius: 14, padding: "10px 12px" }}>
                <span style={{ fontSize: 10, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>
                  {lang === "id" ? "Health Meter" : "Health Meter"}
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 24, color: healthColor, lineHeight: 1 }}>{healthScore}</span>
                  <span style={{ fontSize: 10, color: "#8A8A8A" }}>/100</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: BORDER, marginTop: 6, overflow: "hidden" }}>
                  <div className="sc-bar-fill" style={{ height: 4, width: `${Math.min(100, Math.max(0, healthScore))}%`, borderRadius: 999, background: healthColor }} />
                </div>
              </div>
              <div style={{ border: "1px solid rgba(20,20,20,0.08)", background: "rgba(255,255,255,0.4)", borderRadius: 14, padding: "10px 12px" }}>
                <span style={{ fontSize: 10, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 }}>
                  {lang === "id" ? "Filling Rate" : "Filling Rate"}
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 24, color: fillingColor, lineHeight: 1 }}>{fillingRate}</span>
                  <span style={{ fontSize: 10, color: "#8A8A8A" }}>/100</span>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: BORDER, marginTop: 6, overflow: "hidden" }}>
                  <div className="sc-bar-fill" style={{ height: 4, width: `${Math.min(100, Math.max(0, fillingRate))}%`, borderRadius: 999, background: fillingColor }} />
                </div>
              </div>
            </div>

            {/* Analisa makanan */}
            {(scanResult.overall || scanResult.description) && (
              <div style={{ borderTop: "1px solid rgba(20,20,20,0.08)", paddingTop: 12 }}>
                <span style={{ fontSize: 10, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 6 }}>
                  {lang === "id" ? "Analisa" : "Analysis"}
                </span>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: "#3A3A3A", margin: 0 }}>
                  {scanResult.overall || scanResult.description}
                </p>
              </div>
            )}

            {/* Per-item breakdown if multiple items */}
            {scanResult.items.length > 1 && (
              <div style={{ borderTop: "1px solid rgba(20,20,20,0.08)", paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: "#8A8A8A", display: "block", marginBottom: 6 }}>
                  {lang === "id" ? "Rincian" : "Breakdown"}
                </span>
                {scanResult.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "3px 0", borderBottom: i < scanResult.items.length - 1 ? `1px solid #F4F2F0` : "none" }}>
                    <span style={{ color: "#4A4A4A" }}>{item.name} {item.portion && <span style={{ color: "#9A9A9A" }}>({item.portion})</span>}</span>
                    <span style={{ color: BLACK, fontWeight: 600 }}>{item.kcal} {tr.kcal}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={scanAgain} className="sc-btn-primary" style={{ flex: 1, background: RED, color: "#fff", border: "none", borderRadius: 10, padding: "9px 0", fontFamily: "inherit", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>{tr.scanAgain}</button>
              <button onClick={resetAll} className="sc-btn-ghost" style={{ background: "transparent", border: "1px solid rgba(20,20,20,0.12)", color: "#6A6A6A", borderRadius: 10, padding: "9px 12px", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>{tr.reset}</button>
            </div>
          </div>
        </div>

        {/* Result tabs: Insights + Food Summary (locked for non-member) */}
        <div style={{ ...glass(0.7), borderTop: "none", borderRadius: "0 0 22px 22px", overflow: "hidden" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(20,20,20,0.08)" }}>
            {(["result", "insights", "summary"] as const).map((tab) => {
              const locked = !isAuthenticated && tab !== "result";
              const labels: Record<string, string> = {
                result: lang === "id" ? "Hasil" : "Result",
                insights: lang === "id" ? "Insights" : "Insights",
                summary: lang === "id" ? "Food Summary" : "Food Summary",
              };
              return (
                <button key={tab} onClick={() => setResultTab(tab)}
                  style={{ flex: 1, padding: "10px 8px", fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase", background: "none", border: "none", borderBottom: resultTab === tab ? `2px solid ${RED}` : "2px solid transparent", color: resultTab === tab ? RED : locked ? "#C0B8B0" : "#6A6A6A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                  {locked && <span style={{ fontSize: 10 }}>🔒</span>}
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {resultTab === "insights" && (
            !isAuthenticated ? (
              <div style={{ position: "relative", overflow: "hidden" }}>
                {/* Blurred mock content */}
                <div style={{ filter: "blur(5px)", userSelect: "none", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {["Kalori harian kamu 15% di bawah target", "Protein intake minggu ini meningkat", "Makanan ini cocok untuk diet kamu", "Rekomendasi: tambah sayuran hijau"].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${BORDER}` }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: i % 2 === 0 ? "#2F7D5B" : RED, flexShrink: 0, display: "block" }} />
                      <span style={{ fontSize: 13 }}>{item}</span>
                    </div>
                  ))}
                </div>
                {/* Overlay */}
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(2px)" }}>
                  <span style={{ fontSize: 22 }}>🔒</span>
                  <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, textTransform: "uppercase", fontWeight: "bold" }}>{lang === "id" ? "Butuh akun" : "Account required"}</span>
                  <a href="https://my.20fit.id/login" style={{ background: RED, color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: "bold", textDecoration: "none" }}>
                    {lang === "id" ? "Buat akun gratis" : "Create free account"}
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px 18px" }}>
                <span style={{ fontSize: 12, color: "#8A8A8A" }}>{lang === "id" ? "Insight tersedia setelah beberapa scan tersimpan." : "Insights available after a few scans are saved."}</span>
              </div>
            )
          )}

          {resultTab === "summary" && (
            !isAuthenticated ? (
              <div style={{ position: "relative", overflow: "hidden" }}>
                {/* Blurred mock content */}
                <div style={{ filter: "blur(5px)", userSelect: "none", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {["Total kalori hari ini", "Target kalori", "Sisa kalori", "Makanan di-scan"].map((label, i) => (
                      <div key={i} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px" }}>
                        <span style={{ fontSize: 10, color: "#8A8A8A", display: "block" }}>{label}</span>
                        <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, color: BLACK }}>{[1240, 2000, 760, 3][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Overlay */}
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(2px)" }}>
                  <span style={{ fontSize: 22 }}>🔒</span>
                  <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, textTransform: "uppercase", fontWeight: "bold" }}>{lang === "id" ? "Butuh akun" : "Account required"}</span>
                  <a href="https://my.20fit.id/login" style={{ background: RED, color: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: "bold", textDecoration: "none" }}>
                    {lang === "id" ? "Buat akun gratis" : "Create free account"}
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ padding: "16px 18px" }}>
                <span style={{ fontSize: 12, color: "#8A8A8A" }}>{lang === "id" ? "Summary tersedia setelah beberapa scan tersimpan." : "Summary available after a few scans are saved."}</span>
              </div>
            )
          )}
        </div>
        </div>
      );
    }

    return (
      <div style={{ ...glass(0.55), borderRadius: 22, padding: 16, display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 20px 50px -12px rgba(20,20,20,0.12)" }}>
        {!photoFile
          ? <label onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={dragActive ? "" : "sc-dropzone"}
              style={{ border: `1.5px dashed ${dragActive ? RED : "rgba(20,20,20,0.16)"}`, borderRadius: 16, background: dragActive ? TINT : "rgba(255,255,255,0.35)", padding: "28px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", cursor: "pointer" }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: TINT, color: RED, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontSize: 22 }}>+</span>
              <span style={{ fontSize: 14, fontWeight: "bold", color: BLACK }}>{tr.dropzone}</span>
              <span style={{ fontSize: 12, color: "#8A8A8A" }}>{tr.dropzoneSub}</span>
              <span className="sc-btn-primary" style={{ background: RED, color: "#FFFFFF", borderRadius: 10, padding: "8px 20px", fontSize: 12, fontWeight: "bold", marginTop: 4 }}>{tr.dropzoneChoose}</span>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: "none" }} />
            </label>
          : <div style={{ border: "1px solid rgba(20,20,20,0.1)", borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.5)" }}>
              <div style={{ height: 160, backgroundImage: `url(${photoPreview!})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ flex: 1, fontSize: 12, color: "#6A6A6A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photoFile.name}</span>
                <button onClick={resetAll} className="sc-link-btn" style={{ background: "transparent", border: 0, color: RED, fontFamily: "inherit", fontSize: 12, fontWeight: "bold", textDecoration: "underline", cursor: "pointer" }}>{tr.changePhoto}</button>
              </div>
            </div>
        }
        <button onClick={startAnalyze} disabled={!photoFile} className={photoFile ? "sc-btn-primary" : ""}
          style={{ border: 0, borderRadius: 12, height: 48, fontFamily: "inherit", fontSize: 14, fontWeight: "bold", cursor: photoFile ? "pointer" : "not-allowed", background: photoFile ? RED : "rgba(20,20,20,0.12)", color: photoFile ? "#FFFFFF" : "#9A9A9A" }}>
          {tr.analyzeBtn}
        </button>
      </div>
    );
  };

  const eco = ECOSYSTEM[lang];
  const faqs = FAQS[lang];
  const testimonials = TESTIMONIALS[lang];
  const steps = STEPS[lang];
  const features = FEATURES[lang];

  return (
    <div style={{ background: "#FFFFFF" }}>

      {/* Hero + Tool */}
      <div style={{ position: "relative", background: "linear-gradient(180deg, #FDF6F2 0%, #FFFFFF 70%)", borderBottom: "1px solid rgba(20,20,20,0.06)", overflow: "hidden" }}>
        <div className="sc-orb-field">
          <span className="sc-orb" style={{ width: 420, height: 420, top: -140, right: -80, background: "radial-gradient(circle, #F5A3A3 0%, transparent 70%)" }} />
          <span className="sc-orb" style={{ width: 320, height: 320, bottom: -120, left: -60, background: "radial-gradient(circle, #FFD9A8 0%, transparent 70%)", animationDelay: "-6s" }} />
          <span className="sc-orb" style={{ width: 220, height: 220, top: 60, left: "38%", background: "radial-gradient(circle, #C7E8D8 0%, transparent 70%)", animationDelay: "-3s" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: W, margin: "0 auto", padding: "32px 24px 36px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: "bold", letterSpacing: ".08em", textTransform: "uppercase", color: "#FFFFFF", background: RED, borderRadius: 999, padding: "5px 11px" }}>{tr.badge}</span>
            <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "clamp(26px,3.5vw,44px)", lineHeight: 1.02, textTransform: "uppercase", margin: 0, color: BLACK }}>
              {tr.heroTitle.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </h1>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#4A4A4A", maxWidth: "44ch" }}>{tr.heroSub}</p>
            {/* Download buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              <a href="https://apps.apple.com/app/20fit/id1234567890" target="_blank" rel="noopener noreferrer" className="sc-link-btn"
                style={{ display: "flex", alignItems: "center", gap: 8, background: BLACK, color: "#FFFFFF", borderRadius: 10, padding: "8px 14px", textDecoration: "none" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                  <span style={{ fontSize: 9, opacity: 0.7 }}>{lang === "id" ? "Unduh di" : "Download on the"}</span>
                  <span style={{ fontSize: 13, fontWeight: "bold" }}>App Store</span>
                </div>
              </a>
              <a href="https://play.google.com/store/apps/details?id=id.fit20" target="_blank" rel="noopener noreferrer" className="sc-link-btn"
                style={{ display: "flex", alignItems: "center", gap: 8, background: BLACK, color: "#FFFFFF", borderRadius: 10, padding: "8px 14px", textDecoration: "none" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5v-17c0-0.83,0.94-1.3,1.6-0.8l14,8.5c0.6,0.37,0.6,1.23,0,1.6l-14,8.5C3.94,21.8,3,21.33,3,20.5z"/></svg>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                  <span style={{ fontSize: 9, opacity: 0.7 }}>{lang === "id" ? "Dapatkan di" : "Get it on"}</span>
                  <span style={{ fontSize: 13, fontWeight: "bold" }}>Google Play</span>
                </div>
              </a>
            </div>
            {/* Trust row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <div style={{ display: "flex" }}>
                {testimonials.slice(0, 5).map((tm, i) => (
                  <span key={tm.name} style={{ width: 26, height: 26, borderRadius: "50%", background: tm.color, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontSize: 11, border: "2px solid #FFFFFF", marginLeft: i === 0 ? 0 : -8 }}>{tm.initial}</span>
                ))}
              </div>
              <span style={{ fontSize: 12, color: "#6A6A6A" }}>{tr.heroTrust}</span>
            </div>
          </div>
          <ToolPanel />
        </div>
      </div>

      {/* Framing note */}
      <div style={{ borderBottom: "1px solid rgba(20,20,20,0.06)" }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "14px 24px" }}>
          <span style={{ fontSize: 12, lineHeight: 1.55, color: "#6A6A6A", borderLeft: `3px solid ${RED}`, paddingLeft: 12, display: "block" }}>{tr.framingNote}</span>
        </div>
      </div>

      {/* Who this is for */}
      <div style={{ borderBottom: "1px solid rgba(20,20,20,0.06)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
          <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, textTransform: "uppercase" }}>{tr.whoForTitle}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
            {tr.whoForItems.map((item) => (
              <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", textAlign: "left" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: TINT, color: RED, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: "bold", flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: "#3A3A3A" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works + Features */}
      <div style={{ borderBottom: "1px solid rgba(20,20,20,0.06)" }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, textTransform: "uppercase" }}>{tr.howItWorks}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {steps.map(st => (
                <div key={st.num} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 12, color: RED, minWidth: 22, paddingTop: 2 }}>{st.num}</span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 3 }}>{st.title}</span>
                    <span style={{ fontSize: 12, color: "#6A6A6A", lineHeight: 1.5 }}>{st.body}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, textTransform: "uppercase" }}>{tr.whatYouCan}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {features.map((f, i) => (
                <div key={f.title} className="sc-card" style={i === 0 ? { border: `1px solid ${RED}`, borderRadius: 16, padding: "13px 15px", display: "flex", gap: 12, alignItems: "flex-start", background: TINT } : { ...glass(0.5), borderRadius: 16, padding: "13px 15px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: i === 0 ? "#FFFFFF" : TINT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: "bold" }}>{f.title}</span>
                    <span style={{ fontSize: 12, lineHeight: 1.5, color: "#6A6A6A" }}>{f.body}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem */}
      <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #F6F4F1 0%, #EEEAE4 100%)", borderBottom: "1px solid rgba(20,20,20,0.06)" }}>
        <div className="sc-orb-field">
          <span className="sc-orb" style={{ width: 300, height: 300, top: -100, left: "10%", background: "radial-gradient(circle, #F5A3A3 0%, transparent 70%)" }} />
          <span className="sc-orb" style={{ width: 260, height: 260, bottom: -100, right: "8%", background: "radial-gradient(circle, #A8C7E8 0%, transparent 70%)", animationDelay: "-8s" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: W, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "center" }}>
          <EcosystemPhoneMockup eco={eco} />
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, textTransform: "uppercase" }}>{tr.ecoTitle}</span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: "#4A4A4A", display: "block", marginTop: 5 }}>{tr.ecoSub}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
              {eco.map(e => (
                <a key={e.host} href={`https://${e.host}`} className="sc-card" style={{ ...glass(0.55), borderRadius: 16, padding: 13, display: "flex", flexDirection: "column", gap: 8, textDecoration: "none", color: "inherit" }}>
                  <span className="sc-eco-icon" style={{ width: 30, height: 30, borderRadius: 8, background: e.accent, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontSize: 12 }}>{e.initial}</span>
                  <span style={{ fontSize: 13, fontWeight: "bold" }}>{e.name}</span>
                  <span style={{ fontSize: 11, lineHeight: 1.45, color: "#6A6A6A", flex: 1 }}>{e.desc}</span>
                  <span style={{ fontSize: 10, color: "#9A9A9A" }}>{e.host}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(160deg, #F6F4F1 0%, #EEEAE4 100%)", borderBottom: "1px solid rgba(20,20,20,0.06)" }}>
        <div className="sc-orb-field">
          <span className="sc-orb" style={{ width: 340, height: 340, top: -120, right: "6%", background: "radial-gradient(circle, #FFD9A8 0%, transparent 70%)" }} />
          <span className="sc-orb" style={{ width: 260, height: 260, bottom: -110, left: "12%", background: "radial-gradient(circle, #C7E8D8 0%, transparent 70%)", animationDelay: "-5s" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: W, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, textTransform: "uppercase" }}>{tr.testimonialTitle}</span>
            <span style={{ fontSize: 12, color: "#8A8A8A" }}>{tr.testimonialSub}</span>
          </div>
          <TestimonialMarquee testimonials={testimonials} />
        </div>
      </div>

      {/* FAQ */}
      <div style={{ borderBottom: "1px solid rgba(20,20,20,0.06)" }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28, alignItems: "start" }}>
          <div>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, textTransform: "uppercase" }}>{tr.faqTitle}</span>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: "#4A4A4A", display: "block", marginTop: 5 }}>{tr.faqSub}</span>
          </div>
          <div style={{ ...glass(0.5), borderRadius: 18, overflow: "hidden" }}>
            {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </div>

      {/* Bottom CTA (anon only) */}
      {!isAuthenticated && (
        <div style={{ position: "relative", overflow: "hidden", background: `linear-gradient(120deg, ${RED} 0%, #A81212 100%)` }}>
          <div className="sc-orb-field">
            <span className="sc-orb" style={{ width: 320, height: 320, top: -140, left: "15%", background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)", opacity: 0.35 }} />
            <span className="sc-orb" style={{ width: 260, height: 260, bottom: -120, right: "10%", background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)", opacity: 0.3, animationDelay: "-7s" }} />
          </div>
          <div style={{ position: "relative", zIndex: 1, maxWidth: W, margin: "0 auto", padding: "28px 24px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 24, lineHeight: 1.05, textTransform: "uppercase", color: "#FFFFFF" }}>{tr.ctaTitle}</span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: "#FBD9D9", maxWidth: "52ch" }}>{tr.ctaSub}</span>
            </div>
            <a href={URLS.LOGIN} className="sc-link-btn" style={{ background: "#FFFFFF", color: RED, borderRadius: 12, height: 48, padding: "0 22px", fontFamily: "inherit", fontSize: 14, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 12px 30px -8px rgba(0,0,0,0.35)" }}>{tr.ctaBtn}</a>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ background: BLACK }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "24px 24px 28px", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 18, color: "#FFFFFF" }}>20FIT</span>
            <span style={{ fontSize: 12, color: "#6A6A6A", maxWidth: "36ch" }}>{tr.footerTagline}</span>
          </div>
          {scanCount > 0 && <span style={{ fontSize: 11, color: "#6A6A6A", alignSelf: "flex-end" }}>{tr.sessionCount(scanCount)}</span>}
        </div>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "0 24px 20px" }}>
          <span style={{ fontSize: 11, color: "#5A5A5A", lineHeight: 1.6, display: "block", borderTop: "1px solid #2A2A2A", paddingTop: 14 }}>{tr.footerDisclaimer}</span>
        </div>
      </div>

    </div>
  );
};
