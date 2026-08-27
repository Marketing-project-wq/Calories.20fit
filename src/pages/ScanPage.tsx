import { useRef, useState } from "react";
import { URLS } from "../lib/constants";
import { apiClient, ScanResult } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const RED = "#D62828";
const BLACK = "#141414";
const TINT = "#FDECEC";
const BORDER = "#E4E0DB";
const W = 1100;

const ECOSYSTEM = [
  { name: "Scan Kalori", host: "calories.20fit.id", initial: "K", accent: RED, desc: "Foto makanan, dapat estimasi kalori dan makronutriennya." },
  { name: "Menu Diet", host: "menu.20fit.id", initial: "M", accent: "#2F7D5B", desc: "Kumpulan menu dan resep dengan hitungan kalori per porsi." },
  { name: "Panduan MCU", host: "medicalcheckup.20fit.id", initial: "C", accent: "#2D4E8F", desc: "Upload hasil lab, baca penjelasan tiap penandanya." },
  { name: "My 20FIT", host: "my.20fit.id", initial: "20", accent: BLACK, desc: "Akun, riwayat, meal plan, diet plan, dan analytics." },
];

const FAQS = [
  { q: "Seberapa akurat estimasinya?", a: "Model menebak jenis makanan dan porsinya dari satu foto. Minyak yang terserap, cara masak, dan berat asli tidak terlihat, jadi selisihnya bisa cukup besar. Pakai angkanya untuk melihat arah, bukan menghitung tepat." },
  { q: "Kenapa meal plan dan analytics butuh akun?", a: "Ketiganya dihitung dari riwayat, bukan dari satu foto. Riwayat butuh tempat tersimpan, dan tempatnya ada di akun 20FIT." },
  { q: "Fotonya disimpan?", a: "Untuk pengunjung tanpa akun, foto hanya diproses untuk menghasilkan estimasi. Hasil tidak tersimpan dan foto tidak digunakan untuk keperluan lain." },
  { q: "Sudah punya akun 20FIT?", a: "Kalau kamu sedang login, halaman ini mengenali kamu otomatis. Tidak ada gate, tidak ada ajakan daftar, dan hasilnya langsung masuk ke riwayat." },
];

const TESTIMONIALS = [
  { name: "Ayu R.", initial: "A", color: "#E8734A", rating: 5, text: "Baru upload foto nasi padang, langsung keluar estimasi kalorinya. Simpel banget, nggak perlu input manual satu-satu.", food: "Nasi Padang" },
  { name: "Dimas P.", initial: "D", color: "#4A90D9", rating: 5, text: "Saya pakai tiap makan siang di kantor. Lumayan buat ngecek supaya nggak kebablasan kalorinya. Akurasinya cukup oke untuk estimasi.", food: "Mie Ayam + Es Teh" },
  { name: "Sarah K.", initial: "S", color: "#2F7D5B", rating: 4, text: "Yang saya suka, hasilnya langsung terbuka tanpa harus daftar dulu. Kalau mau simpan riwayat baru buat akun — masuk akal.", food: "Gado-gado" },
  { name: "Rizky F.", initial: "R", color: "#8B5CF6", rating: 5, text: "Udah coba beberapa aplikasi serupa, ini paling gampang. Foto, analisis, selesai. Cocok buat yang nggak mau ribet.", food: "Ayam Bakar" },
  { name: "Putri N.", initial: "P", color: "#D97706", rating: 5, text: "Terbantu banget pas lagi diet. Nggak perlu hafal kalori tiap makanan, tinggal foto aja langsung tau kira-kira berapa.", food: "Salad Sayur" },
  { name: "Andi M.", initial: "A", color: "#DC2626", rating: 4, text: "Hasilnya cukup akurat untuk makanan Indonesia. Satu hal yang saya appreciate, dia jujur bahwa ini estimasi, bukan angka pasti.", food: "Soto Ayam" },
];

const DEEPER_DEFS = [
  { title: "Meal plan mingguan", body: "Rencana makan 7 hari dari pola scan kamu, lengkap dengan daftar belanja." },
  { title: "Diet plan", body: "Target dan penyesuaian porsi dihitung dari data tubuh kamu di akun 20FIT." },
  { title: "Food analytics", body: "Tren kalori dan makronutrien lintas waktu, bukan angka satu piring." },
];

const STEPS = [
  { num: "01", title: "Ambil satu foto", body: "Seluruh porsi dari atas, satu piring per foto." },
  { num: "02", title: "Sistem mengenali makanannya", body: "Model AI menebak jenis dan porsi, lalu dicocokkan ke basis data gizi." },
  { num: "03", title: "Baca sebagai kisaran", body: "Berguna untuk melihat pola, bukan menghitung sampai satuan." },
];

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

export const ScanPage = () => {
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
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Format tidak didukung. Gunakan JPG, PNG, atau WebP."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Foto terlalu besar. Maksimal 5MB."); return; }
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
      if (isAuthenticated) { const quota = await apiClient.getQuota(); if (quota && quota.remaining <= 0) { setError("Kuota scan habis. Top-up untuk melanjutkan."); return; } }
      const result = await apiClient.scanPhoto(photoFile);
      setScanResult(result); setScanCount(c => c + 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menganalisis foto";
      setError(msg === "scan_limit" ? "Kuota scan habis. Top-up untuk melanjutkan." : msg);
    } finally { setIsLoading(false); }
  };

  const resetAll = () => { if (photoPreview) URL.revokeObjectURL(photoPreview); setScanResult(null); setPhotoFile(null); setPhotoPreview(null); setError(null); };
  const scanAgain = () => { setScanResult(null); setError(null); };

  // Tool panel rendered inside hero on desktop
  const ToolPanel = () => {
    if (isLoading || authLoading) return (
      <div style={{ background: "#1A1A1A", borderRadius: 16, padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
        <span style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid #333`, borderTopColor: RED, display: "block", animation: "scSpin .9s linear infinite" }} />
        <span style={{ fontSize: 14, fontWeight: "bold", color: "#FFFFFF" }}>Menganalisis foto…</span>
        <span style={{ fontSize: 12, color: "#8A8A8A" }}>Biasanya beberapa detik.</span>
        <style>{`@keyframes scSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

    if (error) return (
      <div style={{ background: "#1A1A1A", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: "bold", color: RED }}>Gagal menganalisis</span>
        <span style={{ fontSize: 12, color: "#BDBDBD" }}>{error}</span>
        <button onClick={() => setError(null)} style={{ background: RED, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontFamily: "inherit", fontSize: 12, fontWeight: "bold", cursor: "pointer", alignSelf: "flex-start" }}>Coba lagi</button>
      </div>
    );

    if (scanResult) return (
      <div style={{ background: "#1A1A1A", borderRadius: 16, overflow: "hidden" }}>
        {photoPreview && <div style={{ height: 160, backgroundImage: `url(${photoPreview})`, backgroundSize: "cover", backgroundPosition: "center" }} />}
        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: "bold", color: "#FFFFFF" }}>{scanResult.food_name}</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: "Anton, sans-serif", fontSize: 36, color: RED, lineHeight: 1 }}>{scanResult.calories}</span>
            <span style={{ fontSize: 12, color: "#8A8A8A" }}>kkal</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {isAuthenticated
              ? [{ label: "Protein", value: `${scanResult.protein}g`, pct: Math.round((scanResult.protein * 4 / scanResult.calories) * 100) },
                 { label: "Karbo", value: `${scanResult.carbs}g`, pct: Math.round((scanResult.carbs * 4 / scanResult.calories) * 100) },
                 { label: "Lemak", value: `${scanResult.fat}g`, pct: Math.round((scanResult.fat * 9 / scanResult.calories) * 100) }]
                .map(m => (
                  <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "#8A8A8A" }}>{m.label}</span>
                      <span style={{ color: "#FFFFFF", fontWeight: "bold" }}>{m.value}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "#2A2A2A" }}><div style={{ height: 5, width: `${m.pct}%`, borderRadius: 999, background: RED }} /></div>
                  </div>
                ))
              : ["Protein", "Karbo", "Lemak"].map(label => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#6A6A6A" }}>{label}</span>
                  <span style={{ color: RED, fontSize: 11 }}>🔒 Perlu akun</span>
                </div>
              ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={scanAgain} style={{ flex: 1, background: RED, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontFamily: "inherit", fontSize: 12, fontWeight: "bold", cursor: "pointer" }}>Scan lagi</button>
            <button onClick={resetAll} style={{ background: "transparent", border: `1px solid #3A3A3A`, color: "#8A8A8A", borderRadius: 8, padding: "9px 12px", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>Reset</button>
          </div>
        </div>
      </div>
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {!photoFile
          ? <label onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              style={{ border: `1.5px dashed ${dragActive ? RED : "#3A3A3A"}`, borderRadius: 14, background: dragActive ? "#2A1010" : "#1A1A1A", padding: "28px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", cursor: "pointer" }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: "#2A2A2A", color: RED, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton, sans-serif", fontSize: 22 }}>+</span>
              <span style={{ fontSize: 14, fontWeight: "bold", color: "#FFFFFF" }}>Pilih atau seret foto makanan</span>
              <span style={{ fontSize: 12, color: "#6A6A6A" }}>JPG · PNG · WebP · maks 5MB</span>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: "none" }} />
            </label>
          : <div style={{ border: `1.5px solid #2A2A2A`, borderRadius: 14, overflow: "hidden", background: "#1A1A1A" }}>
              <div style={{ height: 160, backgroundImage: `url(${photoPreview!})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ flex: 1, fontSize: 12, color: "#8A8A8A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photoFile.name}</span>
                <button onClick={resetAll} style={{ background: "transparent", border: 0, color: RED, fontFamily: "inherit", fontSize: 12, fontWeight: "bold", textDecoration: "underline", cursor: "pointer" }}>Ganti</button>
              </div>
            </div>
        }
        <button onClick={startAnalyze} disabled={!photoFile}
          style={{ border: 0, borderRadius: 10, height: 48, fontFamily: "inherit", fontSize: 14, fontWeight: "bold", cursor: photoFile ? "pointer" : "not-allowed", background: photoFile ? RED : "#2A2A2A", color: photoFile ? "#FFFFFF" : "#5A5A5A" }}>
          Analisis foto
        </button>
      </div>
    );
  };

  return (
    <div style={{ background: "#FFFFFF" }}>

      {/* ─── Hero + Tool (2-col desktop, stack mobile) ─── */}
      <div style={{ background: BLACK }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "32px 24px 36px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: "bold", letterSpacing: ".08em", textTransform: "uppercase", color: "#FFFFFF", background: RED, borderRadius: 999, padding: "5px 11px" }}>Scan kalori</span>
            <h1 style={{ fontFamily: "Anton, sans-serif", fontSize: "clamp(26px,3.5vw,44px)", lineHeight: 1.02, textTransform: "uppercase", margin: 0, color: "#FFFFFF" }}>
              Foto makanan,<br />lihat estimasi kalorinya
            </h1>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#BDBDBD", maxWidth: "44ch" }}>
              Hasil analisisnya terbuka penuh tanpa akun. Yang butuh akun adalah lapisan di atasnya: meal plan, diet plan, dan food analytics.
            </p>
            <span style={{ fontSize: 12, color: "#6A6A6A" }}>Tanpa akun. Hasil terbuka penuh.</span>
          </div>
          <ToolPanel />
        </div>
      </div>

      {/* ─── Framing note ─── */}
      <div style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "14px 24px" }}>
          <span style={{ fontSize: 12, lineHeight: 1.55, color: "#6A6A6A", borderLeft: `3px solid ${RED}`, paddingLeft: 12, display: "block" }}>
            Angka di halaman ini estimasi dari satu foto — bukan pengukuran akurat, bukan saran medis, bukan target kalori personal.
          </span>
        </div>
      </div>

      {/* ─── Cara kerja + Features (2-col desktop) ─── */}
      <div style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ fontFamily: "Anton, sans-serif", fontSize: 20, textTransform: "uppercase" }}>Cara kerja</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {STEPS.map(st => (
                <div key={st.num} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "Anton, sans-serif", fontSize: 12, color: RED, minWidth: 22, paddingTop: 2 }}>{st.num}</span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: "bold", display: "block", marginBottom: 3 }}>{st.title}</span>
                    <span style={{ fontSize: 12, color: "#6A6A6A", lineHeight: 1.5 }}>{st.body}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ fontFamily: "Anton, sans-serif", fontSize: 20, textTransform: "uppercase" }}>Yang bisa kamu lakukan</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                { title: "Scan dari foto", body: "Upload foto makanan, sistem mengenali dan memperkirakan kalori, protein, karbo, dan lemak.", locked: false },
                { title: "Riwayat dan tren", body: "Setiap scan tersimpan, lalu dibaca sebagai tren lintas hari.", locked: true },
                { title: "Meal plan & diet plan", body: "Rencana makan dari target dan preferensi kamu, bukan template umum.", locked: true },
                { title: "Resep dari makanan yang di-scan", body: "Bahan dan langkah diuraikan dari makanan yang kamu suka.", locked: true },
              ].map(f => (
                <div key={f.title} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 13px", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: "bold", flex: 1 }}>{f.title}</span>
                    {f.locked && !isAuthenticated && <span style={{ fontSize: 9, fontWeight: "bold", textTransform: "uppercase", letterSpacing: ".06em", color: RED, background: TINT, borderRadius: 999, padding: "3px 7px" }}>Perlu akun</span>}
                  </div>
                  <span style={{ fontSize: 12, lineHeight: 1.5, color: "#6A6A6A" }}>{f.body}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Ekosistem ─── */}
      <div style={{ background: "#F4F2F0", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <span style={{ fontFamily: "Anton, sans-serif", fontSize: 20, textTransform: "uppercase" }}>Bagian dari satu ekosistem</span>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: "#4A4A4A", display: "block", marginTop: 5 }}>Semua alat 20FIT berbagi satu akun.</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {ECOSYSTEM.map(e => (
              <a key={e.host} href={`https://${e.host}`} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, background: "#FFFFFF", padding: 13, display: "flex", flexDirection: "column", gap: 8, textDecoration: "none", color: "inherit" }}>
                <span style={{ width: 30, height: 30, borderRadius: 8, background: e.accent, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton, sans-serif", fontSize: 12 }}>{e.initial}</span>
                <span style={{ fontSize: 13, fontWeight: "bold" }}>{e.name}</span>
                <span style={{ fontSize: 11, lineHeight: 1.45, color: "#6A6A6A", flex: 1 }}>{e.desc}</span>
                <span style={{ fontSize: 10, color: "#9A9A9A" }}>{e.host}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Testimoni ─── */}
      <div style={{ background: "#F4F2F0", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontFamily: "Anton, sans-serif", fontSize: 20, textTransform: "uppercase" }}>Yang dipakai, bukan yang dijanjikan</span>
            <span style={{ fontSize: 12, color: "#8A8A8A" }}>Dari pengguna aktif 20FIT</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 38, height: 38, borderRadius: "50%", background: t.color, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton, sans-serif", fontSize: 15, flexShrink: 0 }}>{t.initial}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: "bold", color: BLACK }}>{t.name}</span>
                    <div style={{ display: "flex", gap: 2 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ fontSize: 11, color: i < t.rating ? "#F59E0B" : "#D4D0CB" }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#3A3A3A", flex: 1 }}>"{t.text}"</p>
                <span style={{ fontSize: 11, color: "#9A9A9A", background: "#F4F2F0", borderRadius: 999, padding: "4px 10px", alignSelf: "flex-start" }}>{t.food}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FAQ ─── */}
      <div style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28, alignItems: "start" }}>
          <div>
            <span style={{ fontFamily: "Anton, sans-serif", fontSize: 20, textTransform: "uppercase" }}>Pertanyaan umum</span>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: "#4A4A4A", display: "block", marginTop: 5 }}>Yang paling sering ditanyakan sebelum scan pertama.</span>
          </div>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
            {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </div>

      {/* ─── Bottom CTA (anon only) ─── */}
      {!isAuthenticated && (
        <div style={{ background: RED }}>
          <div style={{ maxWidth: W, margin: "0 auto", padding: "28px 24px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: "Anton, sans-serif", fontSize: 24, lineHeight: 1.05, textTransform: "uppercase", color: "#FFFFFF" }}>Mulai dari satu akun 20FIT</span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: "#FBD9D9", maxWidth: "52ch" }}>Meal plan, diet plan, dan analytics jalan setelah ada riwayat yang tersimpan.</span>
            </div>
            <a href={URLS.LOGIN} style={{ background: "#FFFFFF", color: RED, borderRadius: 10, height: 48, padding: "0 22px", fontFamily: "inherit", fontSize: 14, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", textDecoration: "none", whiteSpace: "nowrap" }}>Buat akun di my.20fit.id</a>
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <div style={{ background: BLACK }}>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "24px 24px 28px", display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontFamily: "Anton, sans-serif", fontSize: 18, color: "#FFFFFF" }}>20FIT</span>
            <span style={{ fontSize: 12, color: "#6A6A6A", maxWidth: "36ch" }}>Satu akun untuk scan kalori, menu diet, dan panduan medical check-up.</span>
          </div>
          {scanCount > 0 && <span style={{ fontSize: 11, color: "#6A6A6A", alignSelf: "flex-end" }}>{scanCount} analisis di sesi ini</span>}
        </div>
        <div style={{ maxWidth: W, margin: "0 auto", padding: "0 24px 20px" }}>
          <span style={{ fontSize: 11, color: "#5A5A5A", lineHeight: 1.6, display: "block", borderTop: "1px solid #2A2A2A", paddingTop: 14 }}>
            Estimasi kalori dihitung dari analisis foto dan bersifat perkiraan. Bukan saran medis, bukan target kalori personal. Untuk keputusan kesehatan, konsultasikan dengan tenaga kesehatan.
          </span>
        </div>
      </div>

    </div>
  );
};
