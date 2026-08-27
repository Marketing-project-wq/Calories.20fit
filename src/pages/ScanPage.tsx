import { useRef, useState } from "react";
import { URLS } from "../lib/constants";
import { apiClient, ScanResult } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

const RED = "#D62828";
const BG = "#EFEDEA";
const BLACK = "#141414";

export const ScanPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran foto terlalu besar. Maksimal 5MB.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (isAuthenticated) {
        const quota = await apiClient.getQuota();
        if (quota && quota.remaining <= 0) {
          setError("Kuota scan sudah habis. Top-up untuk melanjutkan.");
          setIsLoading(false);
          return;
        }
      }
      const result = await apiClient.scanPhoto(file);
      setScanResult(result);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Gagal menganalisis foto";
      setError(errMsg === "scan_limit" ? "Kuota scan sudah habis. Top-up untuk melanjutkan." : errMsg);
    } finally {
      setIsLoading(false);
    }
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

  const reset = () => {
    setScanResult(null);
    setError(null);
  };

  // Loading
  if (isLoading || authLoading) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "64px 20px", textAlign: "center" }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${RED}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
        <p style={{ fontFamily: "Anton, sans-serif", fontSize: 18, textTransform: "uppercase", letterSpacing: "0.05em", color: BLACK }}>Menganalisis foto…</p>
        <p style={{ fontSize: 13, color: "#6A6A6A", marginTop: 6 }}>Biasanya selesai dalam 3–5 detik</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ border: `2px solid ${RED}`, borderRadius: 12, padding: 24 }}>
          <p style={{ fontFamily: "Anton, sans-serif", fontSize: 16, textTransform: "uppercase", color: RED, marginBottom: 8 }}>Gagal menganalisis</p>
          <p style={{ fontSize: 14, color: "#4A4A4A", marginBottom: 20 }}>{error}</p>
          <button onClick={reset} style={{ background: RED, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontFamily: "Anton, sans-serif", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Result
  if (scanResult) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px" }}>
        {scanResult.image_url && (
          <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 20, border: "2px solid #141414" }}>
            <img src={scanResult.image_url} alt={scanResult.food_name} style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} />
          </div>
        )}

        <h2 style={{ fontFamily: "Anton, sans-serif", fontSize: "clamp(24px,5vw,36px)", textTransform: "uppercase", color: BLACK, marginBottom: 4 }}>
          {scanResult.food_name}
        </h2>

        {/* Kalori — always visible */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 24 }}>
          <span style={{ fontFamily: "Anton, sans-serif", fontSize: 48, color: RED, lineHeight: 1 }}>{scanResult.calories}</span>
          <span style={{ fontSize: 14, color: "#6A6A6A" }}>kcal</span>
        </div>

        {/* Makro — gated for anonymous */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {isAuthenticated ? (
            [
              { label: "Protein", value: scanResult.protein, unit: "g" },
              { label: "Karbo", value: scanResult.carbs, unit: "g" },
              { label: "Lemak", value: scanResult.fat, unit: "g" },
            ].map((n) => (
              <div key={n.label} style={{ background: "#E5E3DF", borderRadius: 10, padding: "14px 10px", textAlign: "center" }}>
                <div style={{ fontFamily: "Anton, sans-serif", fontSize: 22, color: BLACK }}>{n.value}</div>
                <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 2 }}>{n.label} ({n.unit})</div>
              </div>
            ))
          ) : (
            ["Protein", "Karbo", "Lemak"].map((label) => (
              <div key={label} style={{ background: "#E5E3DF", borderRadius: 10, padding: "14px 10px", textAlign: "center", filter: "blur(4px)", userSelect: "none" }}>
                <div style={{ fontFamily: "Anton, sans-serif", fontSize: 22, color: BLACK }}>--</div>
                <div style={{ fontSize: 11, color: "#6A6A6A", marginTop: 2 }}>{label}</div>
              </div>
            ))
          )}
        </div>

        {/* CTA untuk anonim */}
        {!isAuthenticated && (
          <div style={{ background: BLACK, borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <p style={{ fontFamily: "Anton, sans-serif", fontSize: 15, textTransform: "uppercase", color: "#EFEDEA", marginBottom: 6 }}>Lihat breakdown gizi lengkap</p>
            <p style={{ fontSize: 13, color: "#8A8A8A", marginBottom: 16 }}>Masuk untuk protein, karbo, lemak, riwayat scan, dan tracking kalori harian.</p>
            <a href={URLS.LOGIN} style={{ display: "block", textAlign: "center", background: RED, color: "#fff", borderRadius: 8, padding: "12px 0", fontFamily: "Anton, sans-serif", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Masuk / Daftar
            </a>
          </div>
        )}

        <p style={{ fontSize: 11, color: "#8A8A8A", marginBottom: 20, padding: "10px 14px", background: "#E5E3DF", borderRadius: 8 }}>
          ⚠️ Ini estimasi, bukan pengukuran akurat. Konsultasikan dengan ahli gizi untuk keputusan kesehatan.
        </p>

        <button onClick={reset} style={{ width: "100%", padding: "14px 0", border: `2px solid ${BLACK}`, borderRadius: 10, background: "transparent", fontFamily: "Anton, sans-serif", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.06em", color: BLACK, cursor: "pointer" }}>
          Scan Lagi
        </button>
      </div>
    );
  }

  // Upload area (default)
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 20px" }}>
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragActive ? RED : "#BEBBB6"}`,
          borderRadius: 16,
          padding: "48px 24px",
          textAlign: "center",
          cursor: "pointer",
          background: dragActive ? "#FAE8E8" : "transparent",
          transition: "all 0.15s",
          marginBottom: 20,
        }}
      >
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: "none" }} />
        <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
        <p style={{ fontFamily: "Anton, sans-serif", fontSize: "clamp(20px,4vw,28px)", textTransform: "uppercase", color: BLACK, marginBottom: 8 }}>Foto Makananmu</p>
        <p style={{ fontSize: 14, color: "#6A6A6A", marginBottom: 4 }}>Ambil foto atau unggah dari galeri</p>
        <p style={{ fontSize: 12, color: "#9A9A9A" }}>JPG · PNG · WebP · maks 5MB</p>
      </div>

      {/* CTA masuk untuk anonim */}
      {!isAuthenticated && (
        <div style={{ background: BLACK, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <p style={{ fontSize: 13, color: "#8A8A8A", margin: 0 }}>Masuk untuk simpan riwayat & lihat breakdown gizi</p>
          <a href={URLS.LOGIN} style={{ flexShrink: 0, background: RED, color: "#fff", borderRadius: 8, padding: "8px 16px", fontFamily: "Anton, sans-serif", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
            Masuk
          </a>
        </div>
      )}
    </div>
  );
};
