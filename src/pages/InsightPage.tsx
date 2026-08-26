import { useEffect, useState } from "react";
import { COLORS } from "../lib/constants";
import { apiClient, InsightData } from "../lib/api";
import { CTAFull } from "../components/CTA";
import { useAuth } from "../hooks/useAuth";

export const InsightPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      setIsLoading(true);
      try {
        setInsight(await apiClient.getInsight());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat insight");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <CTAFull
        title="Tracking Kalori Harian"
        description="Kebutuhan kalori harian, sisa kalori, dan insight nutrisi hanya tersedia untuk akun yang sudah masuk."
        bullets={[
          "Tahu berapa kalori yang masih boleh kamu makan hari ini",
          "Bandingkan asupan dengan kebutuhan kalori harianmu",
          "Insight otomatis dari kebiasaan makan kamu",
        ]}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 rounded-full animate-spin inline-block" style={{ borderColor: COLORS.RED, borderTopColor: "transparent" }}></div>
        <p className="mt-4 text-gray-600">Memuat insight...</p>
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

  if (!insight) return null;

  const percentUsed = insight.target_calories > 0 ? Math.min(100, Math.round((insight.consumed_today / insight.target_calories) * 100)) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="font-display text-2xl font-bold uppercase mb-6">Kebutuhan Kalori Harian</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg p-4 text-center" style={{ backgroundColor: COLORS.PINK_ACCENT }}>
          <div className="font-bold text-xl">{insight.target_calories}</div>
          <div className="text-xs text-gray-600">Target Harian</div>
        </div>
        <div className="rounded-lg p-4 text-center" style={{ backgroundColor: COLORS.PINK_ACCENT }}>
          <div className="font-bold text-xl">{insight.consumed_today}</div>
          <div className="text-xs text-gray-600">Sudah Dimakan</div>
        </div>
        <div className="rounded-lg p-4 text-center" style={{ backgroundColor: COLORS.PINK_ACCENT }}>
          <div className="font-bold text-xl">{insight.remaining_calories}</div>
          <div className="text-xs text-gray-600">Sisa Kalori</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress hari ini</span>
          <span>{percentUsed}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${percentUsed}%`, backgroundColor: COLORS.RED }}></div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-600 p-3 bg-gray-50 rounded-lg">
        {insight.remaining_calories > 0
          ? `Kamu masih punya ${insight.remaining_calories} kcal untuk hari ini.`
          : "Kamu sudah mencapai target kalori hari ini."}
      </div>
    </div>
  );
};
