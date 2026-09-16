import { useMemo, useState } from "react";
import { COLORS, NUTRI, URLS } from "../lib/constants";
import { Lang } from "../lib/i18n";
import { cc } from "../lib/calorieCopy";
import {
  Food,
  FOOD_CATEGORIES,
  FOOD_CATEGORY_LABELS,
  foodsByCategory,
  scaleFood,
  searchFoods,
} from "../data/foods";
import { GUEST_KEYS, guestConsume, guestRemaining } from "../lib/guestLimit";

const BORDER = "#E4E0DB";
const GUEST_MAX = 3;

function MacroPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#5A5A5A" }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      {label} <b style={{ color: COLORS.BLACK, fontVariantNumeric: "tabular-nums" }}>{value}g</b>
    </span>
  );
}

/**
 * Food search + result list.
 * - variant "guest": submit-based search capped at GUEST_MAX/day (localStorage),
 *   view-only, and shows an account CTA once the cap is hit.
 * - variant "member": live search, category browse, and an Add control (calls
 *   onAdd(food, servings)) used by the tracker to append to the daily log.
 */
export function FoodSearch({
  lang,
  variant,
  onAdd,
  addedLabelFor,
}: {
  lang: Lang;
  variant: "guest" | "member";
  onAdd?: (food: Food, servings: number) => void;
  addedLabelFor?: string | null; // food id that was just added (for ✓ feedback)
}) {
  const f = cc(lang).food;
  const isGuest = variant === "guest";

  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(""); // guest: last committed query
  const [remaining, setRemaining] = useState(() => (isGuest ? guestRemaining(GUEST_KEYS.FOOD_SEARCH, GUEST_MAX) : Infinity));
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [servings, setServings] = useState<Record<string, number>>({});

  // Member: live results from the typed query, or the browsed category.
  // Guest: results only from the last submitted (and quota-consumed) query.
  const results: Food[] = useMemo(() => {
    if (isGuest) return submitted ? searchFoods(submitted) : [];
    if (query.trim()) return searchFoods(query);
    if (activeCat) return foodsByCategory(activeCat as Food["category"]);
    return [];
  }, [isGuest, submitted, query, activeCat]);

  const locked = isGuest && remaining <= 0;

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || locked) return;
    // Only consume quota when this is a NEW query (not re-submitting the same).
    if (query.trim() !== submitted) {
      const used = guestConsume(GUEST_KEYS.FOOD_SEARCH);
      setRemaining(Math.max(0, GUEST_MAX - used));
    }
    setSubmitted(query.trim());
  };

  const getServ = (id: string) => servings[id] ?? 1;
  const setServ = (id: string, v: number) => setServings((s) => ({ ...s, [id]: Math.max(0.25, Math.round(v * 4) / 4) }));

  return (
    <div>
      {/* Search input */}
      {isGuest ? (
        <form onSubmit={handleGuestSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={f.placeholder}
            disabled={locked}
            style={{ flex: 1, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 12px", fontSize: 15, fontFamily: "inherit", background: locked ? "#F4F2F0" : "#fff" }}
          />
          <button
            type="submit"
            disabled={locked}
            className="sc-btn-primary"
            style={{ background: locked ? "#C9C4BE" : COLORS.RED, color: "#fff", borderRadius: 10, padding: "0 18px", fontSize: 14, fontWeight: 700, cursor: locked ? "not-allowed" : "pointer" }}
          >
            {f.searchBtn}
          </button>
        </form>
      ) : (
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveCat(null); }}
          placeholder={f.placeholder}
          autoFocus
          style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 12px", fontSize: 15, fontFamily: "inherit", background: "#fff" }}
        />
      )}

      {/* Guest remaining count */}
      {isGuest && !locked && (
        <p style={{ fontSize: 12, color: remaining <= 1 ? COLORS.RED : "#9A9A9A", margin: "8px 2px 0" }}>
          {f.searchesLeft(remaining)}
        </p>
      )}

      {/* Category browse (member only) */}
      {!isGuest && !query.trim() && (
        <div style={{ marginTop: 12 }}>
          <span style={{ fontSize: 11, color: "#9A9A9A", display: "block", marginBottom: 8 }}>{f.browseByCat}</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {FOOD_CATEGORIES.map((cat) => {
              const on = activeCat === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCat(on ? null : cat)}
                  style={{ fontSize: 12, fontWeight: 600, borderRadius: 999, padding: "6px 12px", border: `1px solid ${on ? COLORS.RED : BORDER}`, background: on ? COLORS.PINK_ACCENT : "#fff", color: on ? COLORS.RED : "#6A6A6A", cursor: "pointer" }}
                >
                  {FOOD_CATEGORY_LABELS[lang][cat]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked gate (guest) */}
      {locked && (
        <div style={{ marginTop: 14, border: `1px solid ${NUTRI.GREEN_TINT}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ height: 5, background: `linear-gradient(90deg,${COLORS.RED},${NUTRI.GREEN})` }} />
          <div style={{ padding: "18px 16px" }}>
            <h4 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 20, textTransform: "uppercase", color: COLORS.BLACK, margin: "0 0 6px" }}>🔒 {f.limitTitle}</h4>
            <p style={{ fontSize: 13.5, color: "#5A5A5A", lineHeight: 1.6, margin: "0 0 14px" }}>{f.limitSub}</p>
            <a href={URLS.SIGN_UP} className="sc-btn-primary" style={{ display: "inline-block", background: COLORS.RED, color: "#fff", borderRadius: 10, padding: "10px 18px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              {cc(lang).gate.signUp} →
            </a>
          </div>
        </div>
      )}

      {/* Results */}
      {!locked && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {results.length === 0 ? (
            <p style={{ fontSize: 13, color: "#9A9A9A", padding: "8px 2px" }}>
              {(isGuest ? submitted : query.trim() || activeCat) ? f.noResults : f.startTyping}
            </p>
          ) : (
            results.map((food) => {
              const serv = getServ(food.id);
              const n = scaleFood(food, serv);
              const added = addedLabelFor === food.id;
              return (
                <div key={food.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: COLORS.BLACK }}>{food.name}</div>
                      <div style={{ fontSize: 11.5, color: "#9A9A9A", marginTop: 2 }}>
                        {food.servingDescription ? `${food.servingDescription} · ` : ""}
                        {food.servingSize} {food.servingUnit} · {food.source}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 22, color: COLORS.RED, fontVariantNumeric: "tabular-nums" }}>{n.calories}</span>
                      <span style={{ fontSize: 11, color: "#9A9A9A", display: "block" }}>{f.kcal}{serv !== 1 ? "" : ` / ${f.perServing}`}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
                    <MacroPill label={f.protein} value={n.protein} color={NUTRI.BLUE} />
                    <MacroPill label={f.carbs} value={n.carbs} color={NUTRI.AMBER} />
                    <MacroPill label={f.fat} value={n.fat} color={COLORS.RED} />
                  </div>

                  {/* Add control (member/tracker) */}
                  {onAdd && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
                        <button type="button" onClick={() => setServ(food.id, serv - 0.25)} style={{ padding: "6px 10px", fontSize: 16, color: COLORS.BLACK, background: "#F6F4F1", cursor: "pointer" }} aria-label="minus">−</button>
                        <span style={{ padding: "0 10px", fontSize: 13, minWidth: 42, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{serv}×</span>
                        <button type="button" onClick={() => setServ(food.id, serv + 0.25)} style={{ padding: "6px 10px", fontSize: 16, color: COLORS.BLACK, background: "#F6F4F1", cursor: "pointer" }} aria-label="plus">+</button>
                      </div>
                      <button
                        type="button"
                        onClick={() => onAdd(food, serv)}
                        disabled={added}
                        className="sc-btn-primary"
                        style={{ flex: 1, background: added ? NUTRI.GREEN : COLORS.RED, color: "#fff", borderRadius: 8, padding: "9px 12px", fontSize: 13.5, fontWeight: 700, cursor: added ? "default" : "pointer" }}
                      >
                        {added ? `✓ ${f.added}` : `+ ${f.add}`}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
