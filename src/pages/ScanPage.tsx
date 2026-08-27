import { useRef, useState } from "react";
import { URLS } from "../lib/constants";
import { apiClient, ScanResult } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const RED = "#D62828";
const BLACK = "#141414";
const TINT = "#FDECEC";
const BORDER = "#E4E0DB";

const ECOSYSTEM = [
  { name: "Scan Kalori", host: "calories.20fit.id", initial: "K", accent: RED, desc: "Foto makanan, dapat estimasi kalori dan makronutriennya." },
  { name: "Menu Diet", host: "menu.20fit.id", initial: "M", accent: "#2F7D5B", desc: "Kumpulan menu dan resep dengan hitungan kalori per porsi." },
  { name: "Panduan MCU", host: "medicalcheckup.20fit.id", initial: "C", accent: "#2D4E8F", desc: "Upload hasil lab, baca penjelasan tiap penandanya." },
  { name: "My 20FIT", host: "my.20fit.id", initial: "20", accent: BLACK, desc: "Akun, riwayat, meal plan, diet plan, dan analytics." },
];

const FAQS = [
  { q: "Seberapa akurat estimasinya?", a: "Model menebak jenis makanan dan porsinya dari satu foto. Minyak yang terserap, cara masak, dan berat asli tidak terlihat di foto, jadi selisihnya bisa cukup besar. Pakai angkanya untuk melihat arah, bukan menghitung tepat." },
  { q: "Kenapa meal plan dan analytics butuh akun?", a: "Ketiganya dihitung dari riwayat, bukan dari satu foto. Riwayat butuh tempat tersimpan, dan tempatnya ada di akun 20FIT." },
  { q: "Fotonya disimpan?", a: "Untuk pengunjung tanpa akun, foto hanya diproses untuk menghasilkan estimasi. Hasil tidak tersimpan dan foto tidak digunakan untuk keperluan lain." },
  { q: "Sudah punya akun 20FIT?", a: "Kalau kamu sedang login, halaman ini mengenali kamu otomatis. Tidak ada gate, tidak ada ajakan daftar, dan hasilnya langsung masuk ke riwayat." },
];

const DEEPER_DEFS = [
  { title: "Meal plan mingguan", body: "Rencana makan tujuh hari yang disusun dari pola scan kamu, lengkap dengan daftar belanja." },
  { title: "Diet plan", body: "Target dan penyesuaian porsi yang dihitung dari data tubuh kamu di akun 20FIT." },
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
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, background: "transparent", border: 0, padding: "15px 16px", cursor: "pointer", fontFamily: "inherit", textAlign: "left", minHeight: 52 }}
      >
        <span style={{ flex: 1, fontSize: 14, fontWeight: "bold", lineHeight: 1.35 }}>{q}</span>
        <span style={{ fontSize: 17, color: "#A8A8A8", width: 14, textAlign: "center", flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          <span style={{ fontSize: 13, lineHeight: 1.6, color: "#4A4A4A", display: "block" }}>{a}</span>
        </div>
      )}
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
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto terlalu besar. Maksimal 5MB.");
      return;
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const startAnalyze = async () => {
    if (!photoFile) return;
    setIsLoading(true);
    setError(null);
    try {
      if (isAuthenticated) {
        const quota = await apiClient.getQuota();
        if (quota && quota.remaining <= 0) {
          setError("Kuota scan sudah habis. Top-up untuk melanjutkan.");
          return;
        }
      }
      const result = await apiClient.scanPhoto(photoFile);
      setScanResult(result);
      setScanCount(c => c + 1);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menganalisis foto";
      setError(msg === "scan_limit" ? "Kuota scan sudah habis. Top-up untuk melanjutkan." : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setScanResult(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setError(null);
  };

  const scanAgain = () => {
    setScanResult(null);
    setError(null);
  };

  const toolAnchorRef = useRef<HTMLDivElement>(null);
  const scrollToTool = () => toolAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div style={{ background: "#FFFFFF" }}>

      {/* Hero */}
      <div style={{ background: BLACK, padding: "26px 18px 30px" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: "bold", letterSpacing: ".08em", textTransform: "uppercase", color: "#FFFFFF", background: RED, borderRadius: 999, padding: "6px 12px" }}>Scan kalori</span>
          <h1 style={{ fontFamily: "Anton, sans-serif", fontSize: "clamp(28px,6vw,40px)", lineHeight: 1.02, textTransform: "uppercase", margin: 0, color: "#FFFFFF" }}>
            Foto makanan,<br />lihat estimasi kalorinya
          </h1>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "#BDBDBD" }}>
            Hasil analisisnya terbuka penuh, tanpa akun. Yang butuh akun adalah rencana di atasnya: meal plan, diet plan, dan food analytics.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 2 }}>
            <button onClick={scrollToTool} style={{ background: RED, color: "#FFFFFF", border: 0, borderRadius: 10, height: 50, padding: "0 22px", fontFamily: "inherit", fontSize: 15, fontWeight: "bold", cursor: "pointer" }}>
              Scan makanan sekarang
            </button>
          </div>
          <span style={{ fontSize: 12, color: "#8A8A8A" }}>Tanpa akun. Hasil analisisnya terbuka penuh.</span>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "26px 18px 48px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Framing note */}
        <div style={{ borderLeft: `3px solid ${RED}`, background: TINT, padding: "13px 15px" }}>
          <span style={{ fontSize: 13, lineHeight: 1.55, color: "#2A2A2A", display: "block" }}>
            Angka di halaman ini estimasi dari satu foto, bukan pengukuran akurat. Bukan saran medis dan bukan target kalori.
          </span>
        </div>

        {/* Tool anchor */}
        <div ref={toolAnchorRef} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "Anton, sans-serif", fontSize: 20, textTransform: "uppercase", letterSpacing: ".03em", whiteSpace: "nowrap" }}>
            Coba sekarang
          </span>
          <span style={{ flex: 1, height: 2, background: BLACK, display: "block" }} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ border: `2px solid ${RED}`, borderRadius: 12, padding: "14px 16px", background: TINT }}>
            <p style={{ fontSize: 14, color: RED, margin: "0 0 10px", fontWeight: "bold" }}>Gagal menganalisis</p>
            <p style={{ fontSize: 13, color: "#4A4A4A", margin: "0 0 12px" }}>{error}</p>
            <button onClick={() => setError(null)} style={{ background: RED, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontFamily: "inherit", fontSize: 13, fontWeight: "bold", cursor: "pointer" }}>
              Coba lagi
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading || authLoading ? (
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14, padding: "34px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
            <span style={{ width: 46, height: 46, borderRadius: "50%", border: `3px solid ${TINT}`, borderTopColor: RED, display: "block", animation: "scSpin .9s linear infinite" }} />
            <span style={{ fontSize: 15, fontWeight: "bold" }}>Menganalisis foto</span>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: "#6A6A6A" }}>Mengenali jenis makanan dan memperkirakan porsinya. Biasanya beberapa detik.</span>
            <style>{`@keyframes scSpin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : scanResult ? (
          /* Result */
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: BLACK, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <span style={{ fontFamily: "Anton, sans-serif", fontSize: 16, textTransform: "uppercase", color: "#FFFFFF", letterSpacing: ".03em" }}>Hasil analisis</span>
                <span style={{ fontSize: 10, fontWeight: "bold", letterSpacing: ".06em", textTransform: "uppercase", color: BLACK, background: "#FFFFFF", borderRadius: 999, padding: "5px 9px", whiteSpace: "nowrap" }}>Terbuka penuh</span>
              </div>
              {photoPreview && (
                <div style={{ height: 200, backgroundImage: `url(${photoPreview})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              )}
              <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontSize: 17, fontWeight: "bold" }}>{scanResult.food_name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontFamily: "Anton, sans-serif", fontSize: 42, lineHeight: 1 }}>{scanResult.calories}</span>
                  <span style={{ fontSize: 14, color: "#6A6A6A" }}>kkal — estimasi</span>
                </div>
                {/* Macros */}
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {isAuthenticated ? (
                    [
                      { label: "Protein", value: `${scanResult.protein} g`, pct: `${Math.round((scanResult.protein * 4 / scanResult.calories) * 100)}%`, color: RED },
                      { label: "Karbohidrat", value: `${scanResult.carbs} g`, pct: `${Math.round((scanResult.carbs * 4 / scanResult.calories) * 100)}%`, color: BLACK },
                      { label: "Lemak", value: `${scanResult.fat} g`, pct: `${Math.round((scanResult.fat * 9 / scanResult.calories) * 100)}%`, color: "#A8A29C" },
                    ].map(m => (
                      <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4A4A4A" }}>
                          <span>{m.label}</span>
                          <span style={{ fontWeight: "bold", color: BLACK }}>{m.value}</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 999, background: "#EFEDEA", overflow: "hidden" }}>
                          <div style={{ height: 6, width: m.pct, borderRadius: 999, background: m.color }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    ["Protein", "Karbohidrat", "Lemak"].map(label => (
                      <div key={label} style={{ display: "flex", flexDirection: "column", gap: 5, opacity: 0.4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#4A4A4A" }}>
                          <span>{label}</span>
                          <span style={{ fontSize: 11, color: RED }}>🔒 Perlu akun</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 999, background: "#EFEDEA" }} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Deeper features */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontFamily: "Anton, sans-serif", fontSize: 17, textTransform: "uppercase", letterSpacing: ".03em" }}>
                {isAuthenticated ? "Lanjutan untuk kamu" : "Yang butuh akun"}
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.55, color: "#4A4A4A" }}>
                {isAuthenticated
                  ? "Tiga hal berikut sudah aktif di akun kamu dan memakai data yang tersimpan."
                  : "Tiga hal berikut disusun dari data yang tersimpan di akun, jadi tidak bisa dijalankan untuk pengunjung anonim."}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
              {DEEPER_DEFS.map(d => (
                <div key={d.title} style={{ border: `1px solid ${isAuthenticated ? BORDER : BORDER}`, borderRadius: 14, background: isAuthenticated ? "#FFFFFF" : "#FAF9F7", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: 15, display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: "bold", lineHeight: 1.25 }}>{d.title}</span>
                      <span style={{ fontSize: 9, fontWeight: "bold", letterSpacing: ".06em", textTransform: "uppercase", borderRadius: 999, padding: "4px 8px", whiteSpace: "nowrap", color: isAuthenticated ? "#1F5E43" : RED, background: isAuthenticated ? "#E9F3EE" : TINT }}>
                        {isAuthenticated ? "Terbuka" : "Perlu akun"}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, lineHeight: 1.5, color: "#5A5A5A" }}>{d.body}</span>
                    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6, paddingTop: 8 }}>
                      {[38, 62, 28].map((w, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ height: 8, width: `${w}%`, borderRadius: 999, background: isAuthenticated ? RED : "#D6D2CD", display: "block" }} />
                          <span style={{ height: 8, flex: 1, borderRadius: 999, background: "#EFEDEA", display: "block" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: "12px 15px", background: isAuthenticated ? "#FFFFFF" : TINT, borderTop: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: 12, fontWeight: "bold", color: isAuthenticated ? RED : RED }}>
                      {isAuthenticated ? "Buka sekarang" : "Buat akun untuk membuka"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA for anon after result */}
            {!isAuthenticated && (
              <div style={{ border: `2px solid ${BLACK}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ background: BLACK, padding: "20px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontFamily: "Anton, sans-serif", fontSize: 22, lineHeight: 1.1, textTransform: "uppercase", color: "#FFFFFF" }}>Satu hasil scan tidak cukup untuk menyusun rencana</span>
                  <span style={{ fontSize: 13, lineHeight: 1.55, color: "#BDBDBD" }}>Meal plan, diet plan, dan food analytics dihitung dari riwayat, bukan dari satu foto. Riwayat itu butuh tempat menyimpan, dan tempatnya ada di akun 20FIT.</span>
                </div>
                <div style={{ background: TINT, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                  {["Riwayat tersimpan dan bisa dibuka kapan saja", "Terhubung dengan data 20FIT lainnya di satu akun", "Tanpa batas di semua fitur, di web maupun aplikasi"].map(p => (
                    <div key={p} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: RED, marginTop: 7, flexShrink: 0, display: "block" }} />
                      <span style={{ fontSize: 13, lineHeight: 1.5, color: "#2A2A2A" }}>{p}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                    <a href={URLS.LOGIN} style={{ flex: "1 1 180px", background: RED, color: "#FFFFFF", border: 0, borderRadius: 10, height: 50, fontFamily: "inherit", fontSize: 15, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>Buat akun di my.20fit.id</a>
                  </div>
                  <span style={{ fontSize: 12, color: "#7A5A5A" }}>Gratis. Hasil analisis di atas tetap bisa kamu baca tanpa akun.</span>
                </div>
              </div>
            )}

            {isAuthenticated && (
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 14, background: "#F4F2F0", padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: "bold" }}>Tersimpan ke akun kamu</span>
                <span style={{ fontSize: 13, lineHeight: 1.55, color: "#4A4A4A" }}>Scan ini masuk ke riwayat kamu. Meal plan, diet plan, dan food analytics ikut diperbarui memakai data terbaru.</span>
                <a href={URLS.MY_20FIT} style={{ fontSize: 13, fontWeight: "bold", color: RED }}>Buka di my.20fit.id</a>
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <button onClick={scanAgain} style={{ background: BLACK, color: "#FFFFFF", border: 0, borderRadius: 10, height: 48, padding: "0 20px", fontFamily: "inherit", fontSize: 14, fontWeight: "bold", cursor: "pointer" }}>Scan makanan lain</button>
              <button onClick={resetAll} style={{ background: "transparent", border: 0, color: "#7A7A7A", fontFamily: "inherit", fontSize: 13, textDecoration: "underline", cursor: "pointer", padding: "8px 0" }}>Ulangi dari awal</button>
              <span style={{ flex: 1 }} />
              {scanCount > 0 && <span style={{ fontSize: 12, color: "#9A9A9A" }}>{scanCount} analisis di sesi ini</span>}
            </div>
          </div>
        ) : (
          /* Upload area */
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {!photoFile ? (
              <label
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{ border: `1.5px dashed ${dragActive ? RED : "#C9C4BE"}`, borderRadius: 14, background: dragActive ? TINT : "#FAF9F7", padding: "32px 18px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", cursor: "pointer" }}
              >
                <span style={{ width: 46, height: 46, borderRadius: 12, background: TINT, color: RED, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton, sans-serif", fontSize: 20 }}>+</span>
                <span style={{ fontSize: 15, fontWeight: "bold" }}>Ambil atau pilih foto makanan</span>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: "#6A6A6A", maxWidth: "30ch" }}>Satu piring per foto, dari atas, cahaya cukup</span>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: "none" }} />
              </label>
            ) : (
              <div style={{ border: `1.5px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", background: "#FAF9F7" }}>
                <div style={{ height: 200, backgroundImage: `url(${photoPreview!})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                <div style={{ padding: "13px 15px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ flex: 1, fontSize: 13, color: "#4A4A4A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photoFile.name}</span>
                  <button onClick={resetAll} style={{ background: "transparent", border: 0, color: RED, fontFamily: "inherit", fontSize: 13, fontWeight: "bold", textDecoration: "underline", cursor: "pointer", padding: "6px 0" }}>Ganti</button>
                </div>
              </div>
            )}

            <button
              onClick={startAnalyze}
              disabled={!photoFile}
              style={{ border: 0, borderRadius: 10, height: 52, fontFamily: "inherit", fontSize: 15, fontWeight: "bold", cursor: photoFile ? "pointer" : "not-allowed", background: photoFile ? RED : "#E4E0DB", color: photoFile ? "#FFFFFF" : "#A8A29C" }}
            >
              Analisis foto
            </button>

            {!photoFile && (
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ background: "transparent", border: 0, color: "#7A7A7A", fontFamily: "inherit", fontSize: 13, textDecoration: "underline", cursor: "pointer", padding: "4px 0", alignSelf: "center" }}
              >
                Atau pakai foto contoh
              </button>
            )}

            {/* Steps */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
              {STEPS.map(st => (
                <div key={st.num} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontFamily: "Anton, sans-serif", fontSize: 12, color: RED }}>{st.num}</span>
                  <span style={{ fontSize: 14, fontWeight: "bold", lineHeight: 1.3 }}>{st.title}</span>
                  <span style={{ fontSize: 12, lineHeight: 1.5, color: "#6A6A6A" }}>{st.body}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* "Kenapa pakai" section */}
      <div style={{ background: "#FFFFFF", borderTop: `1px solid ${BORDER}`, padding: "38px 18px", display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", textAlign: "center" }}>
            <h3 style={{ fontFamily: "Anton, sans-serif", fontSize: "clamp(24px,5vw,32px)", lineHeight: 1.05, textTransform: "uppercase", margin: 0 }}>Kenapa pakai scan kalori 20FIT</h3>
            <span style={{ fontSize: 14, lineHeight: 1.55, color: "#6A6A6A" }}>Yang bisa dipakai tanpa akun, dan yang butuh akun karena memerlukan riwayat.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { title: "Deteksi makanan dari satu foto", body: "Upload foto makanan, sistem mengenali jenisnya, memperkirakan porsi, lalu menguraikan kalori, protein, karbo, dan lemaknya.", locked: false },
              { title: "Riwayat dan tren makan", body: "Setiap scan tersimpan, lalu dibaca sebagai tren lintas hari dan lintas waktu makan. Tanpa pencatatan manual.", locked: true },
              { title: "Meal plan dan diet plan", body: "Rencana makan yang disusun dari target, alergi, dan preferensi diet kamu, bukan template umum.", locked: true },
              { title: "Resep dari makanan yang kamu scan", body: "Bahan, langkah, dan porsinya diuraikan, jadi makanan yang kamu suka bisa kamu masak sendiri.", locked: true },
            ].map(f => (
              <div key={f.title} style={{ border: `1.5px solid ${BORDER}`, background: "#FFFFFF", borderRadius: 14, padding: 17, display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                  <span style={{ fontSize: 16, fontWeight: "bold", lineHeight: 1.3, color: BLACK, flex: 1 }}>{f.title}</span>
                  {f.locked && !isAuthenticated && (
                    <span style={{ fontSize: 9, fontWeight: "bold", letterSpacing: ".06em", textTransform: "uppercase", color: RED, background: TINT, borderRadius: 999, padding: "4px 8px", whiteSpace: "nowrap" }}>Perlu akun</span>
                  )}
                </div>
                <span style={{ fontSize: 13, lineHeight: 1.6, color: "#5A5A5A" }}>{f.body}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ekosistem */}
      <div style={{ background: "#F4F2F0", borderTop: `1px solid ${BORDER}`, padding: "32px 18px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span style={{ fontFamily: "Anton, sans-serif", fontSize: 24, lineHeight: 1.1, textTransform: "uppercase", letterSpacing: ".02em" }}>Bagian dari satu ekosistem</span>
            <span style={{ fontSize: 14, lineHeight: 1.55, color: "#4A4A4A" }}>Semua alat 20FIT berbagi satu akun. Apa pun yang kamu buka di sini bisa dilanjutkan di tempat lain.</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {ECOSYSTEM.map(e => (
              <a key={e.host} href={`https://${e.host}`} style={{ border: `1px solid ${BORDER}`, borderRadius: 13, background: "#FFFFFF", padding: 15, display: "flex", flexDirection: "column", gap: 9, textDecoration: "none", color: "inherit" }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: e.accent, color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton, sans-serif", fontSize: 13 }}>{e.initial}</span>
                <span style={{ fontSize: 14, fontWeight: "bold", lineHeight: 1.25, color: BLACK }}>{e.name}</span>
                <span style={{ fontSize: 12, lineHeight: 1.45, color: "#6A6A6A" }}>{e.desc}</span>
                <span style={{ fontSize: 11, color: "#9A9A9A", marginTop: "auto" }}>{e.host}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: "#FFFFFF", padding: "32px 18px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span style={{ fontFamily: "Anton, sans-serif", fontSize: 24, lineHeight: 1.1, textTransform: "uppercase", letterSpacing: ".02em" }}>Pertanyaan yang sering muncul</span>
            <span style={{ fontSize: 14, lineHeight: 1.55, color: "#4A4A4A" }}>Ditanyakan paling sering sebelum orang mencoba scan pertamanya.</span>
          </div>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 13, overflow: "hidden" }}>
            {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </div>

      {/* Bottom CTA for anon */}
      {!isAuthenticated && (
        <div style={{ background: RED, padding: "36px 18px", display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
          <div style={{ maxWidth: 480, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ fontFamily: "Anton, sans-serif", fontSize: 28, lineHeight: 1.05, textTransform: "uppercase", color: "#FFFFFF" }}>Mulai dari satu akun 20FIT</span>
            <span style={{ fontSize: 14, lineHeight: 1.55, color: "#FBD9D9" }}>Meal plan, diet plan, dan analytics jalan setelah ada riwayat yang tersimpan. Buat akun, atau pakai aplikasinya.</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
              <a href={URLS.LOGIN} style={{ background: "#FFFFFF", color: RED, border: 0, borderRadius: 10, height: 50, padding: "0 22px", fontFamily: "inherit", fontSize: 15, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", textDecoration: "none" }}>Buat akun di my.20fit.id</a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ background: BLACK, padding: "28px 18px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ maxWidth: 480, margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <span style={{ fontFamily: "Anton, sans-serif", fontSize: 20, letterSpacing: ".02em", color: "#FFFFFF" }}>20FIT</span>
              <span style={{ fontSize: 12, lineHeight: 1.5, color: "#8A8A8A", maxWidth: "32ch" }}>Satu akun untuk scan kalori, menu diet, dan panduan medical check-up.</span>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #2A2A2A", paddingTop: 16 }}>
            <span style={{ fontSize: 11, lineHeight: 1.55, color: "#6A6A6A", display: "block" }}>
              Estimasi kalori di situs ini dihitung dari analisis foto dan bersifat perkiraan, bukan pengukuran. Bukan saran medis, bukan target kalori personal. Untuk keputusan kesehatan, konsultasikan dengan tenaga kesehatan.
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
