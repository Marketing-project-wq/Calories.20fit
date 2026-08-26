import { useRef, useState } from "react";
import { COLORS, URLS } from "../lib/constants";
import { apiClient } from "../lib/api";
import { CTACompact } from "../components/CTA";
import { useAuth } from "../hooks/useAuth";

export const ScanPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [scanResult, setScanResult] = useState<any>(null);
  const [quota, setQuota] = useState<any>(null);
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
      // Check quota first
      const q = await apiClient.getQuota();
      setQuota(q);

      if (q && q.remaining <= 0) {
        setError("Kuota scan sudah habis. Top-up untuk melanjutkan.");
        setIsLoading(false);
        return;
      }

      // Call real API
      const result = await apiClient.scanPhoto(file);
      setScanResult(result);

      // Update quota after scan
      const updatedQuota = await apiClient.getQuota();
      setQuota(updatedQuota);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Gagal menganalisis foto";
      if (errMsg === "scan_limit") {
        setError("Kuota scan sudah habis. Top-up untuk melanjutkan.");
      } else if (errMsg === "login_required") {
        window.location.href = URLS.LOGIN;
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin inline-block" style={{ borderColor: COLORS.RED, borderTopColor: "transparent" }}></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Before scan
  if (!scanResult && !isLoading) {
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
              <span className="font-semibold">3. Lihat hasil</span> - Kalori, protein, karbo, lemak
            </li>
          </ol>
        </div>

        <div className="text-center text-xs text-gray-600">
          <p>Hasil scan disimpan otomatis di akun kamu.</p>
          <p>Kuota tersisa: {quota?.remaining ?? "..."} scan</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
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
          <button
            onClick={() => {
              setError(null);
              setScanResult(null);
            }}
            className="px-4 py-2 rounded-lg font-semibold text-white"
            style={{ backgroundColor: COLORS.RED }}
          >
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
          {[
            { label: "Kalori", value: scanResult.calories, unit: "kcal" },
            { label: "Protein", value: scanResult.protein, unit: "g" },
            { label: "Karbo", value: scanResult.carbs, unit: "g" },
            { label: "Lemak", value: scanResult.fat, unit: "g" },
          ].map((nutrient) => (
            <div key={nutrient.label} className="rounded-lg p-4 text-center" style={{ backgroundColor: COLORS.PINK_ACCENT }}>
              <div className="font-semibold text-lg">{nutrient.value}</div>
              <div className="text-xs text-gray-600">{nutrient.label}</div>
              <div className="text-xs text-gray-500">{nutrient.unit}</div>
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-gray-600 mb-6 p-3 bg-gray-50 rounded-lg">
          ⚠️ Ini estimasi, bukan pengukuran akurat. Untuk keputusan kesehatan, konsultasikan dengan ahli gizi.
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              setScanResult(null);
              setError(null);
            }}
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
