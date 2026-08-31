import { useEffect, useState } from "react";
import { CTAFull } from "../components/CTA";
import { TodayTracker } from "../components/TodayTracker";
import { useAuth } from "../hooks/useAuth";
import { t, Lang } from "../lib/i18n";
import { DailyFoodItem, MemberProfile, getMemberProfile, getTodayFoodItems } from "../lib/memberTracker";

// Standalone "today's target/macro/log" view — same data + same component as
// the Food Summary tab inside a scan result (TodayTracker), reachable
// without having to scan first. Previously this page called a non-existent
// backend endpoint (/api/scan/insight — verified absent from my.20fit.id's
// server.js) and would just show a generic error for any real member; now
// it reads my20fit_profile + my20fit_daily_log directly, same as
// calorietracker's own ScanPage "Food Summary" tab.
export const InsightPage = ({ lang = "id" }: { lang?: Lang }) => {
  const tr = t[lang];
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [items, setItems] = useState<DailyFoodItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [p, i] = await Promise.all([getMemberProfile(), getTodayFoodItems()]);
      setProfile(p); setItems(i);
    } catch (err) {
      setError(err instanceof Error ? err.message : "error");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <CTAFull
        title={lang === "id" ? "Target Kalori & Log Harian" : "Daily Calorie Target & Log"}
        description={lang === "id"
          ? "Target kalori harian, breakdown makro, dan log makanan hanya tersedia untuk akun yang sudah masuk — datanya sama dengan yang kelihatan di my.20fit.id/calories."
          : "Your daily calorie target, macro breakdown, and food log are only available once signed in — the same data you'd see on my.20fit.id/calories."}
        bullets={[
          lang === "id" ? "Tahu berapa kalori yang masih boleh kamu makan hari ini" : "Know how many calories you still have left today",
          lang === "id" ? "Breakdown makro (protein/karbo/lemak) vs target" : "Macro breakdown (protein/carbs/fat) vs target",
          lang === "id" ? "Log makanan tersambung ke akun 20FIT kamu" : "Food log connected to your 20FIT account",
        ]}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="font-display text-2xl font-bold uppercase mb-6">{lang === "id" ? "Kebutuhan Kalori Harian" : "Daily Calorie Needs"}</h2>
      <div className="rounded-2xl border" style={{ borderColor: "#E4E0DB" }}>
        <TodayTracker tr={tr} loading={loading} error={error} profile={profile} items={items} onRetry={load} />
      </div>
    </div>
  );
};
