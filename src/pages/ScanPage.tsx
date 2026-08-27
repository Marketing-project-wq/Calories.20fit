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
    { title: "Scan dari foto", body: "Upload foto makanan, sistem mengenali dan memperkirakan kalori, protein, karbo, dan lemak.", locked: false },
    { title: "Riwayat dan tren", body: "Setiap scan tersimpan, lalu dibaca sebagai tren lintas hari.", locked: true },
    { title: "Meal plan & diet plan", body: "Rencana makan dari target dan preferensi kamu, bukan template umum.", locked: true },
    { title: "Resep dari makanan yang di-scan", body: "Bahan dan langkah diuraikan dari makanan yang kamu suka.", locked: true },
  ],
  en: [
    { title: "Scan from photo", body: "Upload a food photo, system identifies and estimates calories, protein, carbs, and fat.", locked: false },
    { title: "History and trends", body: "Every scan is saved, then read as cross-day trends.", locked: true },
    { title: "Meal plan & diet plan", body: "A meal plan built from your targets and preferences, not a generic template.", locked: true },
    { title: "Recipes from scanned food", body: "Ingredients and steps are broken down from food you like.", locked: true },
  ],
};

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid #F0EDEA` }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: "transparent", border: 0, padding: "14px 16px", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
        <span style={{ flex: 1, fontSize: 14, fontWeight: "bold", lineHeight: 1.35 }}>{q}</span>
        <span style={{ fontSize: 16, color: "#A8A8A8", flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={{ padding: "0 16px 14px", fontSize: 13, lineHeight: 1.6, color: "#4A4A4A" }}>{a}</div>}
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
      if (isAuthenticated) { const quota = await apiClient.getQuota(); if (quota && quota.remaining <= 0) { setError(tr.errQuota); return; } }
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
      <div style={{ background: "#F4F2F0", border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
        <span style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: RED, display: "block", animation: "scSpin .9s linear infinite" }} />
        <span style={{ fontSize: 14, fontWeight: "bold", color: BLACK }}>{tr.analyzing}</span>
        <span style={{ fontSize: 12, color: "#8A8A8A" }}>{tr.analyzingSub}</span>
        <style>{`@keyframes scSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

    if (error) return (
      <div style={{ background: "#FFF5F5", border: `1.5px solid #FFCDD2`, borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: "bold", color: RED }}>{tr.failedTitle}</span>
        <span style={{ fontSize: 12, color: "#4A4A4A" }}>{error}</span>
        <button onClick={() => setError(null)} style={{ background: RED, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontFamily: "inherit", fontSize: 12, fontWeight: "bold", cursor: "pointer", alignSelf: "flex-start" }}>{tr.retryBtn}</button>
      </div>
    );

    if (scanResult) return (
      <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 16, overflow: "hidden" }}>
        {photoPreview && <div style={{ height: 160, backgroundImage: `url(${photoPreview})`, backgroundSize: "cover", backgroundPosition: "center" }} />}
        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: "bold", color: BLACK }}>{scanResult.food_name}</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 36, color: RED, lineHeight: 1 }}>{scanResult.calories}</span>
            <span style={{ fontSize: 12, color: "#8A8A8A" }}>{tr.kcal}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {isAuthenticated
              ? [{ label: tr.protein, value: `${scanResult.protein}g`, pct: Math.round((scanResult.protein * 4 / scanResult.calories) * 100) },
                 { label: tr.carbs, value: `${scanResult.carbs}g`, pct: Math.round((scanResult.carbs * 4 / scanResult.calories) * 100) },
                 { label: tr.fat, value: `${scanResult.fat}g`, pct: Math.round((scanResult.fat * 9 / scanResult.calories) * 100) }]
                .map(m => (
                  <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "#6A6A6A" }}>{m.label}</span>
                      <span style={{ color: BLACK, fontWeight: "bold" }}>{m.value}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: BORDER }}><div style={{ height: 5, width: `${m.pct}%`, borderRadius: 999, background: RED }} /></div>
                  </div>
                ))
              : [tr.protein, tr.carbs, tr.fat].map(label => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#6A6A6A" }}>{label}</span>
                  <span style={{ color: RED, fontSize: 11 }}>{tr.locked}</span>
                </div>
              ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={scanAgain} style={{ flex: 1, background: RED, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontFamily: "inherit", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>{tr.scanAgain}</button>
            <button onClick={resetAll} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#6A6A6A", borderRadius: 8, padding: "9px 12px", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>{tr.reset}</button>
          </div>
        </div>
      </div>
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {!photoFile
          ? <label onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              style={{ border: `1.5px dashed ${dragActive ? RED : BORDER}`, borderRadius: 14, background: dragActive ? TINT : "#FAFAF9", padding: "28px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", cursor: "pointer" }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: TINT, color: RED, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontSize: 22 }}>+</span>
              <span style={{ fontSize: 14, fontWeight: "bold", color: BLACK }}>{tr.dropzone}</span>
              <span style={{ fontSize: 12, color: "#8A8A8A" }}>{tr.dropzoneSub}</span>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: "none" }} />
            </label>
          : <div style={{ border: `1.5px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", background: "#FFFFFF" }}>
              <div style={{ height: 160, backgroundImage: `url(${photoPreview!})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ flex: 1, fontSize: 12, color: "#6A6A6A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photoFile.name}</span>
                <button onClick={resetAll} style={{ background: "transparent", border: 0, color: RED, fontFamily: "inherit", fontSize: 12, fontWeight: "bold", textDecoration: "underline", cursor: "pointer" }}>{tr.changePhoto}</button>
              </div>
            </div>
        }
        <button onClick={startAnalyze} disabled={!photoFile}
          style={{ border: 0, borderRadius: 10, height: 48, fontFamily: "inherit", fontSize: 14, fontWeight: "bold", cursor: photoFile ? "pointer" : "not-allowed", background: photoFile ? RED : BORDER, color: photoFile ? "#FFFFFF" : "#9A9A9A" }}>
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
      <div style={{ background: "#FFFFFF", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "32px 24px 36px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: "bold", letterSpacing: ".08em", textTransform: "uppercase", color: "#FFFFFF", background: RED, borderRadius: 999, padding: "5px 11px" }}>{tr.badge}</span>
            <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "clamp(26px,3.5vw,44px)", lineHeight: 1.02, textTransform: "uppercase", margin: 0, color: BLACK }}>
              {tr.heroTitle.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
            </h1>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#4A4A4A", maxWidth: "44ch" }}>{tr.heroSub}</p>
            <span style={{ fontSize: 12, color: "#8A8A8A" }}>{tr.heroNote}</span>
          </div>
          <ToolPanel />
        </div>
      </div>

      {/* Framing note */}
      <div style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "14px 24px" }}>
          <span style={{ fontSize: 12, lineHeight: 1.55, color: "#6A6A6A", borderLeft: `3px solid ${RED}`, paddingLeft: 12, display: "block" }}>{tr.framingNote}</span>
        </div>
      </div>

      {/* How it works + Features */}
      <div style={{ borderBottom: `1px solid ${BORDER}` }}>
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
              {features.map(f => (
                <div key={f.title} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 13px", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: "bold", flex: 1 }}>{f.title}</span>
                    {f.locked && !isAuthenticated && <span style={{ fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: ".06em", color: RED, background: TINT, borderRadius: 999, padding: "3px 7px" }}>{tr.featureNeedsAccount}</span>}
                  </div>
                  <span style={{ fontSize: 12, lineHeight: 1.5, color: "#6A6A6A" }}>{f.body}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ecosystem */}
      <div style={{ background: "#F4F2F0", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, textTransform: "uppercase" }}>{tr.ecoTitle}</span>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: "#4A4A4A", display: "block", marginTop: 5 }}>{tr.ecoSub}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {eco.map(e => (
              <a key={e.host} href={`https://${e.host}`} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, background: "#FFFFFF", padding: 13, display: "flex", flexDirection: "column", gap: 8, textDecoration: "none", color: "inherit" }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: e.accent, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontSize: 12 }}>{e.initial}</span>
                <span style={{ fontSize: 13, fontWeight: "bold" }}>{e.name}</span>
                <span style={{ fontSize: 11, lineHeight: 1.45, color: "#6A6A6A", flex: 1 }}>{e.desc}</span>
                <span style={{ fontSize: 10, color: "#9A9A9A" }}>{e.host}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ background: "#F4F2F0", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, textTransform: "uppercase" }}>{tr.testimonialTitle}</span>
            <span style={{ fontSize: 12, color: "#8A8A8A" }}>{tr.testimonialSub}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {testimonials.map((tm) => (
              <div key={tm.name} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 38, height: 38, borderRadius: "50%", background: tm.color, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontSize: 15, flexShrink: 0 }}>{tm.initial}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: "bold", color: BLACK }}>{tm.name}</span>
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ fontSize: 11, color: i < tm.rating ? "#F59E0B" : "#D4D0CB" }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#3A3A3A", flex: 1 }}>"{tm.text}"</p>
                <span style={{ fontSize: 11, color: "#9A9A9A", background: "#F4F2F0", borderRadius: 999, padding: "4px 10px", alignSelf: "flex-start" }}>{tm.food}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28, alignItems: "start" }}>
          <div>
            <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, textTransform: "uppercase" }}>{tr.faqTitle}</span>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: "#4A4A4A", display: "block", marginTop: 5 }}>{tr.faqSub}</span>
          </div>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
            {faqs.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </div>

      {/* Bottom CTA (anon only) */}
      {!isAuthenticated && (
        <div style={{ background: RED }}>
          <div style={{ maxWidth: W, margin: "0 auto", padding: "28px 24px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 24, lineHeight: 1.05, textTransform: "uppercase", color: "#FFFFFF" }}>{tr.ctaTitle}</span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: "#FBD9D9", maxWidth: "52ch" }}>{tr.ctaSub}</span>
            </div>
            <a href={URLS.LOGIN} style={{ background: "#FFFFFF", color: RED, borderRadius: 10, height: 48, padding: "0 22px", fontFamily: "inherit", fontSize: 14, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", textDecoration: "none", whiteSpace: "nowrap" }}>{tr.ctaBtn}</a>
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
