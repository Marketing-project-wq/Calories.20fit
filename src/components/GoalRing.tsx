// Round "goal ring" — same idea as a fitness app's daily-steps ring (a
// circular gauge filling up toward 100%), but for the calorie goal instead
// of steps. Pure presentational (consumed/target in, no data fetching) so
// both the live tracker ("/", today only) and /history (a past or today's
// day) can render the exact same visual from whatever numbers they already
// computed.
import { COLORS, NUTRI } from "../lib/constants";
import { Lang } from "../lib/i18n";

const tx = (lang: Lang, en: string, id: string) => (lang === "id" ? id : en);

export function GoalRing({ consumed, target, lang, label }: { consumed: number; target: number; lang: Lang; label?: string }) {
  if (target <= 0) return null;
  const pct = Math.round((consumed / target) * 100);
  const over = pct > 100;
  const color = over ? COLORS.RED : pct >= 100 ? NUTRI.GREEN_DARK : NUTRI.GREEN;

  const SIZE = 128, R = 52, STROKE = 13;
  const C = 2 * Math.PI * R;
  const filledFrac = Math.min(100, Math.max(0, pct)) / 100;
  const cx = SIZE / 2, cy = SIZE / 2;

  return (
    <div className="rounded-2xl border p-4 mb-4 flex items-center gap-4 flex-wrap" style={{ borderColor: "var(--glass-hi)", background: "var(--surface)", boxShadow: "var(--glass-shadow)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)" }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ flexShrink: 0 }} role="img" aria-label={tx(lang, `Goal ring: ${pct}%`, `Ring goal: ${pct}%`)}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--surface-inset)" strokeWidth={STROKE} />
        <circle
          cx={cx} cy={cy} r={R} fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round"
          strokeDasharray={`${C * filledFrac} ${C}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray .5s cubic-bezier(.2,.8,.2,1)" }}
        />
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize={24} fontWeight={800} fill="var(--text)">{pct}%</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize={10} fill="var(--text-subtle)">{tx(lang, "of goal", "dari target")}</text>
      </svg>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "var(--text-subtle)", marginBottom: 4 }}>
          {label || tx(lang, "Today's overall", "Overall hari ini")}
        </div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>
          {Math.round(consumed).toLocaleString("id-ID")} / {Math.round(target).toLocaleString("id-ID")} kkal
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-soft)", marginTop: 3, lineHeight: 1.4 }}>
          {over
            ? tx(lang, `${pct - 100}% over today's target.`, `${pct - 100}% lewat target hari ini.`)
            : pct >= 100
            ? tx(lang, "Today's target reached.", "Target hari ini tercapai.")
            : tx(lang, `${100 - pct}% left to reach today's target.`, `${100 - pct}% lagi untuk capai target hari ini.`)}
        </div>
      </div>
    </div>
  );
}
