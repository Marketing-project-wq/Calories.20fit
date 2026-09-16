// Per-day guest usage counter kept in localStorage. Used for the guest food
// search cap (brief: 3 searches/day). All access is wrapped in try/catch so
// private mode / blocked storage degrades gracefully — if storage is
// unavailable we simply never block (fail-open for a non-critical guest cap;
// the real, unforgeable quota that matters — AI photo scans — is enforced
// server-side at my.20fit.id, not here).
function todayStr(): string {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

interface Usage {
  date: string;
  count: number;
}

function read(key: string): Usage {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as Usage;
      if (parsed?.date === todayStr() && typeof parsed.count === "number") return parsed;
    }
  } catch {
    /* ignore */
  }
  return { date: todayStr(), count: 0 };
}

export function guestUsedToday(key: string): number {
  return read(key).count;
}

export function guestRemaining(key: string, max: number): number {
  return Math.max(0, max - read(key).count);
}

/** Record one use and return the new count. */
export function guestConsume(key: string): number {
  const usage = read(key);
  const next: Usage = { date: todayStr(), count: usage.count + 1 };
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore — fail open */
  }
  return next.count;
}

export const GUEST_KEYS = {
  FOOD_SEARCH: "ct_guest_food_search_v1",
};
