import { useRef, useState } from "react";
import { COLORS, URLS } from "../lib/constants";
import { apiClient, ScanResult } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

export const ScanPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    // Check file size + type
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
      // Kuota scan (topup credit) hanya berlaku untuk akun yang login.
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
      if (errMsg === "scan_limit") {
        setError("Kuota scan sudah habis. Top-up untuk melanjutkan.");
      } else {
        setError(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const reset = () => {
    setScanResult(null);
    setError(null);
  };

  // Before scan
  if (!scanResult && !isLoading && !authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all mb-6"
          style={{ borderColor: COLORS.RED, backgroundColor: dragActive ? COLORS.PINK_ACCENT : "transparent" }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileInput} className="hidden" />
          <div className="text-5xl mb-4">📷</div>
          <h2 className="font-display text-2xl font-bold uppercase mb-2" style={{ color: COLORS.RED }}>
            Scan Foto Makanan
          </h2>
          <p className="text-gray-600 mb-2">Ambil foto makanan kamu atau unggah dari galeri</p>
          <p className="text-xs text-gray-500">Format: JPG, PNG, WebP • Max: 5MB</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-3">Cara Kerja</h3>
          <ol className="space-y-2 text-sm">
            <li>
              <span className="font-semibold">1. Upload foto</span> - Ambil dari kamera atau galeri
            </li>
            <li>
              <span className="font-semibold">2. AI analisis</span> - Identifikasi makanan dalam 3 detik
            </li>
            <li>
              <span className="font-semibold">3. Lihat hasil</span> - Total kalori langsung terlihat
            </li>
          </ol>
        </div>

        <div className="text-center text-xs text-gray-600">
          {isAuthenticated ? (
            <p>Analisis gizi lengkap, riwayat, dan insight kalori harian tersedia di akun kamu.</p>
          ) : (
            <>
              <p>Tanpa masuk, kamu tetap bisa scan dan lihat total kalorinya.</p>
              <p>
                <a href={URLS.LOGIN} className="underline font-semibold" style={{ color: COLORS.RED }}>
                  Masuk
                </a>{" "}
                untuk analisis gizi lengkap, riwayat, dan tracking kebutuhan kalori harian.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="mb-4">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: COLORS.RED, borderTopColor: "transparent" }}></div>
          </div>
        </div>
        <h2 className="font-display text-xl font-bold uppercase mb-2">Menganalisis Foto</h2>
        <p className="text-gray-600">Biasanya selesai dalam 3–5 detik</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-lg p-6 border" style={{ borderColor: "#FFD1D1", backgroundColor: "#FFE6E6" }}>
          <h2 className="font-semibold mb-2" style={{ color: COLORS.RED }}>
            ⚠️ Gagal Menganalisis
          </h2>
          <p className="text-sm mb-4">{error}</p>
          <button onClick={reset} className="px-4 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: COLORS.RED }}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Result state
  if (scanResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 rounded-xl overflow-hidden">
          <img src={scanResult.image_url} alt={scanResult.food_name} className="w-full h-64 object-cover" />
        </div>

        <h2 className="font-display text-2xl font-bold uppercase mb-6" style={{ color: COLORS.BLACK }}>
          {scanResult.food_name}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: COLORS.PINK_ACCENT }}>
            <div className="font-semibold text-lg">{scanResult.calories}</div>
            <div className="text-xs text-gray-600">Kalori</div>
            <div className="text-xs text-gray-500">kcal</div>
          </div>

          {isAuthenticated ? (
            [
              { label: "Protein", value: scanResult.protein, unit: "g" },
              { label: "Karbo", value: scanResult.carbs, unit: "g" },
              { label: "Lemak", value: scanResult.fat, unit: "g" },
            ].map((nutrient) => (
              <div key={nutrient.label} className="rounded-lg p-4 text-center" style={{ backgroundColor: COLORS.PINK_ACCENT }}>
                <div className="font-semibold text-lg">{nutrient.value}</div>
                <div className="text-xs text-gray-600">{nutrient.label}</div>
                <div className="text-xs text-gray-500">{nutrient.unit}</div>
              </div>
            ))
          ) : (
            ["Protein", "Karbo", "Lemak"].map((label) => (
              <div key={label} className="rounded-lg p-4 text-center relative overflow-hidden" style={{ backgroundColor: COLORS.PINK_ACCENT }}>
                <div className="blur-content h-6 rounded mb-1"></div>
                <div className="text-xs text-gray-600">{label}</div>
                <div className="text-xs text-gray-500">🔒 terkunci</div>
              </div>
            ))
          )}
        </div>

        {!isAuthenticated && (
          <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: COLORS.RED }}>
            <p className="text-white text-sm font-semibold mb-1">Mau lihat analisis gizi lengkap?</p>
            <p className="text-white text-xs opacity-90 mb-3">
              Masuk untuk breakdown protein/karbo/lemak, riwayat scan, dan tracking kebutuhan kalori harian kamu.
            </p>
            <a href={URLS.LOGIN} className="block text-center py-2 px-4 bg-white rounded-lg font-semibold transition-opacity hover:opacity-90" style={{ color: COLORS.RED }}>
              Masuk / Daftar
            </a>
          </div>
        )}

        <div className="text-center text-xs text-gray-600 mb-6 p-3 bg-gray-50 rounded-lg">
          ⚠️ Ini estimasi, bukan pengukuran akurat. Untuk keputusan kesehatan, konsultasikan dengan ahli gizi.
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={reset}
            className="flex-1 py-3 px-4 rounded-lg font-semibold border transition-colors hover:bg-gray-100"
            style={{ color: COLORS.BLACK, borderColor: "#DCDCDC" }}
          >
            Scan Lagi
          </button>
        </div>
      </div>
    );
  }

  return null;
};
