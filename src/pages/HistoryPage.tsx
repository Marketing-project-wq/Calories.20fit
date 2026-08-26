import { useEffect, useState } from "react";
import { COLORS } from "../lib/constants";
import { apiClient, HistoryItem } from "../lib/api";
import { CTAFull } from "../components/CTA";
import { useAuth } from "../hooks/useAuth";

export const HistoryPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      setIsLoading(true);
      try {
        setHistory(await apiClient.getHistory());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat riwayat");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <CTAFull
        title="Riwayat Scan Kalori"
        description="Riwayat scan hanya tersedia untuk akun yang sudah masuk."
        bullets={[
          "Lihat semua scan makanan sebelumnya",
          "Bandingkan kalori antar hari",
          "Data tersimpan permanen di akun kamu",
        ]}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 rounded-full animate-spin inline-block" style={{ borderColor: COLORS.RED, borderTopColor: "transparent" }}></div>
        <p className="mt-4 text-gray-600">Memuat riwayat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-lg p-6 border" style={{ borderColor: "#FFD1D1", backgroundColor: "#FFE6E6" }}>
          <p style={{ color: COLORS.RED }}>{error}</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">📭</div>
        <h2 className="font-display text-2xl font-bold uppercase mb-2">Belum Ada Riwayat</h2>
        <p className="text-gray-600">Mulai scan makanan untuk melihat riwayat di sini</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="font-display text-2xl font-bold uppercase mb-6">Riwayat Scan Kamu</h2>

      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 rounded-lg border" style={{ borderColor: "#E8E8E8" }}>
            <img src={item.image_url} alt={item.food_name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-1">{item.food_name}</h3>
              <p className="text-xs text-gray-600 mb-2">
                {new Date(item.created_at).toLocaleDateString("id-ID", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              <div className="flex gap-3 text-xs">
                <div><span className="font-semibold">{item.calories}</span><span className="text-gray-600"> kcal</span></div>
                <div><span className="font-semibold">{item.protein}</span><span className="text-gray-600"> g protein</span></div>
                <div><span className="font-semibold">{item.carbs}</span><span className="text-gray-600"> g karbo</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
