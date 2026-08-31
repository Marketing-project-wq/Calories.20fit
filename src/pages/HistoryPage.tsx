import { useEffect, useState } from "react";
import { COLORS } from "../lib/constants";
import { CTAFull } from "../components/CTA";
import { useAuth } from "../hooks/useAuth";
import { t, Lang } from "../lib/i18n";
import { getRecentHistory, HistoryDay } from "../lib/memberHistory";

function formatDayLabel(dateStr: string, lang: Lang): string {
  const d = new Date(dateStr + "T00:00:00");
  const todayStr = new Date().toISOString().slice(0, 10);
  const yestStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === todayStr) return lang === "id" ? "Hari ini" : "Today";
  if (dateStr === yestStr) return lang === "id" ? "Kemarin" : "Yesterday";
  return d.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { weekday: "short", day: "numeric", month: "short" });
}

// Real log history, read from my20fit_daily_log (same table my.20fit.id's
// own /calories page writes to) — replaces a previous implementation that
// called /api/scan/history, an endpoint that does not exist on my.20fit.id's
// backend (verified against its server.js source), so it never worked.
export const HistoryPage = ({ lang = "id" }: { lang?: Lang }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [days, setDays] = useState<HistoryDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      setIsLoading(true);
      try {
        setDays(await getRecentHistory());
      } catch (err) {
        setError(err instanceof Error ? err.message : (lang === "id" ? "Gagal memuat riwayat" : "Failed to load history"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated, lang]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <CTAFull
        title={lang === "id" ? "Riwayat Log Kalori" : "Calorie Log History"}
        description={lang === "id" ? "Riwayat log makanan hanya tersedia untuk akun yang sudah masuk." : "Food log history is only available once signed in."}
        bullets={[
          lang === "id" ? "Lihat semua makanan yang kamu log sebelumnya" : "See every food you've logged before",
          lang === "id" ? "Bandingkan kalori antar hari" : "Compare calories across days",
          lang === "id" ? "Data yang sama juga kelihatan di my.20fit.id/calories" : "The same data also shows on my.20fit.id/calories",
        ]}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 rounded-full animate-spin inline-block" style={{ borderColor: COLORS.RED, borderTopColor: "transparent" }}></div>
        <p className="mt-4 text-gray-600">{lang === "id" ? "Memuat riwayat..." : "Loading history..."}</p>
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

  if (days.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">📭</div>
        <h2 className="font-display text-2xl font-bold uppercase mb-2">{lang === "id" ? "Belum Ada Riwayat" : "No History Yet"}</h2>
        <p className="text-gray-600">{lang === "id" ? "Simpan hasil scan ke log untuk melihat riwayat di sini" : "Save a scan result to your log to see history here"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="font-display text-2xl font-bold uppercase mb-6">{lang === "id" ? "Riwayat Log Kamu" : "Your Log History"}</h2>

      <div className="space-y-6">
        {days.map((day) => {
          const total = day.items.reduce((s, it) => s + (Number(it.kcal) || 0), 0);
          return (
            <div key={day.log_date}>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-semibold text-sm">{formatDayLabel(day.log_date, lang)}</h3>
                <span className="text-xs text-gray-600">{total} {lang === "id" ? "kkal total" : "kcal total"}</span>
              </div>
              <div className="space-y-2">
                {day.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center gap-3 p-3 rounded-lg border text-xs" style={{ borderColor: "#E8E8E8" }}>
                    <span className="text-gray-500 flex-shrink-0">{item.t}</span>
                    <span className="flex-1 font-medium">{item.name}</span>
                    <span className="font-semibold flex-shrink-0">{Math.round(item.kcal)} {lang === "id" ? "kkal" : "kcal"}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
