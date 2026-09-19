import { useEffect, useState } from "react";
import { COLORS, NUTRI } from "../lib/constants";
import { CTAFull } from "../components/CTA";
import { useAuth } from "../hooks/useAuth";
import { Lang } from "../lib/i18n";
import { getRecentHistory, HistoryDay } from "../lib/memberHistory";
import { DailyFoodItem, MemberProfile, getMemberProfile } from "../lib/memberTracker";
import { dailyCalorieGoal, dailyMacroTargets } from "../lib/nutrition";
import * as FS from "../lib/foodSummary";
import { Icon } from "../components/Icon";

const tx = (lang: Lang, en: string, id: string) => (lang === "id" ? id : en);

// Rating badge — same good/ok/bad classes & colours as the tracker's
// VerdictBadge (CaloriesTracker.tsx), duplicated here (tiny + presentational,
// not worth sharing a component for) so History reads consistently with
// today's per-item check on "/".
function RateBadge({ cls, label }: { cls: "hh" | "hm" | "hu"; label: string }) {
  const map = { hh: { bg: NUTRI.GREEN_TINT, fg: NUTRI.GREEN_DARK }, hm: { bg: "#FDF3E7", fg: "#B4690E" }, hu: { bg: "#FDECEC", fg: COLORS.RED } } as const;
  const c = map[cls];
  return <span style={{ fontSize: 10.5, fontWeight: 800, padding: "3px 9px", borderRadius: 999, whiteSpace: "nowrap", color: c.fg, background: c.bg }}>{label}</span>;
}

// Per-item row: rating badge always visible, tap/click to expand and see
// what's driving the rating (reason + healthier swap, from the SAME verbatim
// port of my.20fit.id's verdict logic the live tracker uses — see
// src/lib/foodSummary.ts) plus the full nutrient breakdown for that item.
function HistoryItemRow({ item, lang, open, onToggle }: { item: DailyFoodItem; lang: Lang; open: boolean; onToggle: () => void }) {
  const v = FS.itemVerdict(item, lang);
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 text-left"
        style={{ padding: "10px 12px", background: "var(--surface)", border: "none", cursor: "pointer" }}
      >
        <span className="flex-shrink-0 text-xs" style={{ color: "var(--text-subtle)" }}>{item.t}</span>
        <span className="flex-1 font-medium text-xs truncate">{item.name}</span>
        <span className="flex-shrink-0 font-semibold text-xs">{Math.round(item.kcal)} {lang === "id" ? "kkal" : "kcal"}</span>
        <RateBadge cls={v.cls} label={v.label} />
        <span className="flex-shrink-0 text-xs" style={{ color: "var(--text-faint)" }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: "10px 12px", background: "var(--surface-inset)", borderTop: "1px solid var(--border)" }}>
          <div className="grid grid-cols-4 gap-2" style={{ fontSize: 11 }}>
            <div>
              <div style={{ color: "var(--text-subtle)" }}>{tx(lang, "Calories", "Kalori")}</div>
              <div style={{ fontWeight: 700 }}>{Math.round(item.kcal)} kkal</div>
            </div>
            <div>
              <div style={{ color: "var(--text-subtle)" }}>{tx(lang, "Protein", "Protein")}</div>
              <div style={{ fontWeight: 700 }}>{Math.round(item.p)} g</div>
            </div>
            <div>
              <div style={{ color: "var(--text-subtle)" }}>{tx(lang, "Carbs", "Karbo")}</div>
              <div style={{ fontWeight: 700 }}>{Math.round(item.c)} g</div>
            </div>
            <div>
              <div style={{ color: "var(--text-subtle)" }}>{tx(lang, "Fat", "Lemak")}</div>
              <div style={{ fontWeight: 700 }}>{Math.round(item.f)} g</div>
            </div>
          </div>
          <div className="mt-2" style={{ fontSize: 11.5, color: "var(--text-soft)", lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: "var(--text)" }}>{tx(lang, "What could be improved: ", "Yang bisa diperbaiki: ")}</span>
            {v.reason}
            {v.swapTo && (
              <>
                {" "}· {tx(lang, "try", "coba")} <b style={{ color: NUTRI.GREEN_DARK }}>{v.swapTo}</b>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Per-day health meter — same 0-100 score/band formula as the live tracker
// (FS.health), computed from that day's logged items against the member's
// current profile targets (there's no historical per-day target snapshot,
// same simplification the "/" tracker itself uses).
function DayHealthBadge({ items, goal, macroT, lang }: { items: DailyFoodItem[]; goal: number; macroT: ReturnType<typeof dailyMacroTargets>; lang: Lang }) {
  const t = FS.totals(items);
  const h = FS.health(items, t, goal, macroT);
  const cls = h.band === "h" ? "hh" : h.band === "m" ? "hm" : "hu";
  return <RateBadge cls={cls} label={`${FS.bandLabel(h.band, lang)} · ${h.score}/100`} />;
}

function formatDayLabel(dateStr: string, lang: Lang): string {
  const d = new Date(dateStr + "T00:00:00");
  const todayStr = new Date().toISOString().slice(0, 10);
  const yestStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === todayStr) return lang === "id" ? "Hari ini" : "Today";
  if (dateStr === yestStr) return lang === "id" ? "Kemarin" : "Yesterday";
  return d.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { weekday: "short", day: "numeric", month: "short" });
}

// Weekly-progress bar chart: daily calorie totals vs target, oldest→newest.
function WeeklyChart({ days, target, lang }: { days: HistoryDay[]; target: number; lang: Lang }) {
  const recent = days.slice(0, 14).reverse(); // chronological
  if (recent.length < 2) return null;
  const totals = recent.map((d) => ({ date: d.log_date, total: d.items.reduce((s, it) => s + (Number(it.kcal) || 0), 0) }));
  const max = Math.max(target, ...totals.map((x) => x.total)) * 1.12 || 1;
  const avg = Math.round(totals.reduce((s, x) => s + x.total, 0) / totals.length);
  const targetPct = (target / max) * 100;

  return (
    <div className="rounded-2xl border p-4 mb-6" style={{ borderColor: "var(--glass-hi)", background: "var(--surface)", boxShadow: "var(--glass-shadow)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)" }}>
      <div className="flex justify-between items-baseline mb-3">
        <h3 className="font-semibold text-sm">{lang === "id" ? "Progres Mingguan" : "Weekly Progress"}</h3>
        <span className="text-xs" style={{ color: "var(--text-subtle)" }}>
          {lang === "id" ? "Rata-rata" : "Avg"} <b style={{ color: "var(--text)" }}>{avg.toLocaleString("id-ID")}</b> {lang === "id" ? "kkal/hari" : "kcal/day"}
        </span>
      </div>
      <div style={{ position: "relative", height: 120, display: "flex", alignItems: "flex-end", gap: 4 }}>
        {/* target reference line */}
        {target > 0 && (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: `${targetPct}%`, borderTop: `1px dashed ${NUTRI.GREEN_DARK}`, zIndex: 1 }}>
            <span style={{ position: "absolute", right: 0, top: -14, fontSize: 9, color: NUTRI.GREEN_DARK, background: "var(--surface)", padding: "0 3px" }}>
              {lang === "id" ? "target" : "target"} {target.toLocaleString("id-ID")}
            </span>
          </div>
        )}
        {totals.map((x) => {
          const h = Math.max(2, (x.total / max) * 100);
          const over = target > 0 && x.total > target;
          return (
            <div key={x.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }} title={`${x.date}: ${x.total} kkal`}>
              <div className="sc-bar-fill" style={{ width: "100%", maxWidth: 22, height: `${h}%`, background: over ? COLORS.RED : NUTRI.GREEN, borderRadius: "4px 4px 0 0" }} />
              <span style={{ fontSize: 8.5, color: "#B0B0B0", marginTop: 3 }}>{x.date.slice(8, 10)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Real log history, read from my20fit_daily_log (same table my.20fit.id's
// own /calories page writes to) — replaces a previous implementation that
// called /api/scan/history, an endpoint that does not exist on my.20fit.id's
// backend (verified against its server.js source), so it never worked.
export const HistoryPage = ({ lang = "id" }: { lang?: Lang }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [days, setDays] = useState<HistoryDay[]>([]);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      setIsLoading(true);
      try {
        const [d, p] = await Promise.all([getRecentHistory(), getMemberProfile()]);
        setDays(d);
        setProfile(p);
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
        <div className="w-12 h-12 border-4 rounded-full animate-spin inline-block" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }}></div>
        <p className="mt-4" style={{ color: "var(--text-soft)" }}>{lang === "id" ? "Memuat riwayat..." : "Loading history..."}</p>
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
        <div className="mb-4" style={{ display: "flex", justifyContent: "center", color: "var(--text-faint)" }}><Icon name="inbox" size={44} /></div>
        <h2 className="font-display text-2xl font-bold uppercase mb-2">{lang === "id" ? "Belum Ada Riwayat" : "No History Yet"}</h2>
        <p style={{ color: "var(--text-soft)" }}>{lang === "id" ? "Simpan hasil scan ke log untuk melihat riwayat di sini" : "Save a scan result to your log to see history here"}</p>
      </div>
    );
  }

  const goal = dailyCalorieGoal(profile);
  const macroT = dailyMacroTargets(profile, goal);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="font-display text-2xl font-bold uppercase mb-6">{lang === "id" ? "Riwayat Log Kamu" : "Your Log History"}</h2>

      <WeeklyChart days={days} target={goal} lang={lang} />

      <div className="space-y-6">
        {days.map((day) => {
          const total = day.items.reduce((s, it) => s + (Number(it.kcal) || 0), 0);
          return (
            <div key={day.log_date}>
              <div className="flex justify-between items-baseline mb-2 gap-2 flex-wrap">
                <h3 className="font-semibold text-sm">{formatDayLabel(day.log_date, lang)}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--text-soft)" }}>{total} {lang === "id" ? "kkal total" : "kcal total"}</span>
                  <DayHealthBadge items={day.items} goal={goal} macroT={macroT} lang={lang} />
                </div>
              </div>
              <div className="space-y-2">
                {day.items.map((item, i) => {
                  const key = `${day.log_date}_${i}`;
                  return (
                    <HistoryItemRow
                      key={key}
                      item={item}
                      lang={lang}
                      open={openKey === key}
                      onToggle={() => setOpenKey(openKey === key ? null : key)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
