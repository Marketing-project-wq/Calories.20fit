// Faithful TypeScript port of my.20fit.id's js/fasting.js (Intermittent
// Fasting). SAME styles, SAME meals/factor/adjustGoal math, SAME localStorage
// key ("my20fit_if") so a device that set a style on my.20fit.id/calories is
// recognised here too, and SAME Supabase table (my20fit_fasting) for the
// cross-device preference + email-reminder flag.
//
// Reference (verified): js/fasting.js + calories.html:1073-1123 in PROFILE20FIT.
// Web reminders fire in-browser via the Notification API; the actual EMAIL
// reminder is sent server-side by my.20fit.id's own job — this app only stores
// the `notify_email` preference into the shared table.
import { Lang } from "./i18n";
import { supabase } from "./supabase";

export interface FastingStyle {
  id: string;
  fast: number;
  eat: number;
  weekly?: boolean;
  name: { en: string; id: string };
  desc: { en: string; id: string };
}

export const STYLES: FastingStyle[] = [
  { id: "16:8", fast: 16, eat: 8, name: { en: "16:8 · Leangains", id: "16:8 · Leangains" }, desc: { en: "Fast 16h, eat within 8h. The most popular & sustainable.", id: "Puasa 16 jam, makan dalam 8 jam. Paling populer & gampang dijalani." } },
  { id: "14:10", fast: 14, eat: 10, name: { en: "14:10 · Beginner", id: "14:10 · Pemula" }, desc: { en: "Fast 14h, eat 10h. Gentle way to start.", id: "Puasa 14 jam, makan 10 jam. Cocok buat yang baru mulai." } },
  { id: "18:6", fast: 18, eat: 6, name: { en: "18:6", id: "18:6" }, desc: { en: "Fast 18h, eat 6h. For those already used to it.", id: "Puasa 18 jam, makan 6 jam. Buat yang udah terbiasa." } },
  { id: "20:4", fast: 20, eat: 4, name: { en: "20:4 · Warrior", id: "20:4 · Warrior" }, desc: { en: "Fast 20h, eat in a 4h window. Advanced.", id: "Puasa 20 jam, makan dalam jendela 4 jam. Tingkat lanjut." } },
  { id: "omad", fast: 23, eat: 1, name: { en: "OMAD · One Meal", id: "OMAD · Sekali Makan" }, desc: { en: "One meal a day. For the experienced.", id: "Satu kali makan sehari. Buat yang sudah mahir." } },
  { id: "5:2", fast: 0, eat: 24, weekly: true, name: { en: "5:2", id: "5:2" }, desc: { en: "Eat normally 5 days, low-calorie (~500–600 kcal) on 2 days.", id: "Makan normal 5 hari, rendah kalori (~500–600 kkal) di 2 hari." } },
];

export const IF_LEVELS: { t: { en: string; id: string }; ids: string[] }[] = [
  { t: { en: "Beginner", id: "Pemula" }, ids: ["14:10"] },
  { t: { en: "Intermediate", id: "Menengah" }, ids: ["16:8", "18:6"] },
  { t: { en: "Advanced", id: "Lanjut" }, ids: ["20:4", "omad"] },
  { t: { en: "Special", id: "Khusus" }, ids: ["5:2"] },
];

export interface FastingChoice {
  id: string;
  start: string; // "HH:MM"
}

const LS_KEY = "my20fit_if";
const NOTIFY_KEY = "if_notify";
const LASTFIRE_KEY = "if_lastfire";

export function fmt(min: number): string {
  min = ((min % 1440) + 1440) % 1440;
  return String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");
}

export function styleById(id: string): FastingStyle | null {
  return STYLES.find((s) => s.id === id) || null;
}

export function mealsFor(id: string): number {
  return ({ "14:10": 3, "16:8": 3, "18:6": 2, "20:4": 2, omad: 1, "5:2": 3 } as Record<string, number>)[id] || 3;
}

export function factor(id: string): number {
  return ({ "14:10": 0.97, "16:8": 0.9, "18:6": 0.88, "20:4": 0.85, omad: 0.82, "5:2": 1 } as Record<string, number>)[id] || 1;
}

export function getChoice(): FastingChoice | null {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "null");
  } catch {
    return null;
  }
}
export function setChoice(o: FastingChoice): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(o));
  } catch {
    /* ignore */
  }
}
export function clearChoice(): void {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    /* ignore */
  }
}

// Fasting adjustment of the base daily goal (tighter style = bigger deficit).
export function adjustGoal(base: number): number {
  const c = getChoice();
  if (!c) return base;
  return Math.max(1200, (Math.round((base * factor(c.id)) / 10) * 10));
}

export interface FastingState {
  style: FastingStyle;
  chosen: FastingChoice;
  weekly?: boolean;
  eating?: boolean;
  untilMin?: number;
  window?: { start: string; end: string };
}

export function state(): FastingState | null {
  const c = getChoice();
  if (!c) return null;
  const s = styleById(c.id);
  if (!s) return null;
  if (s.weekly) return { style: s, chosen: c, weekly: true };
  const [sh, sm] = String(c.start || "12:00").split(":").map(Number);
  const startM = sh * 60 + sm;
  const endM = startM + s.eat * 60;
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const a = ((startM % 1440) + 1440) % 1440;
  const span = s.eat * 60;
  const diff = (((mins - a) % 1440) + 1440) % 1440;
  const eating = diff < span;
  let until = eating ? span - diff : 1440 - diff;
  if (until <= 0) until = 1;
  return { style: s, chosen: c, eating, untilMin: until, window: { start: fmt(startM), end: fmt(endM) } };
}

// ---------- Web reminders (in-browser Notification; email is server-side) ----------
export function notifEnabled(): boolean {
  try {
    return localStorage.getItem(NOTIFY_KEY) === "1";
  } catch {
    return false;
  }
}
function setNotif(v: boolean): void {
  try {
    localStorage.setItem(NOTIFY_KEY, v ? "1" : "0");
  } catch {
    /* ignore */
  }
}

let timers: ReturnType<typeof setTimeout>[] = [];
function fire(title: string, body: string): void {
  try {
    const now = Date.now();
    const last = Number(localStorage.getItem(LASTFIRE_KEY) || 0);
    if (now - last < 90000) return;
    localStorage.setItem(LASTFIRE_KEY, String(now));
    new Notification(title, { body, tag: "if-meal" });
  } catch {
    /* ignore */
  }
}
export function armReminders(lang: Lang = "en"): void {
  timers.forEach(clearTimeout);
  timers = [];
  if (!notifEnabled()) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const st = state();
  if (!st || st.weekly) return;
  const eatingNow = st.eating;
  const ms = Math.max(1000, (st.untilMin || 1) * 60 * 1000 + 2000);
  const L = (o: { en: string; id: string }) => o[lang];
  const t = setTimeout(() => {
    if (eatingNow) fire(L({ en: "Eating window closed", id: "Jendela makan ditutup" }), L({ en: "Time to start fasting — see you next window!", id: "Waktunya mulai puasa — sampai jendela berikutnya!" }));
    else fire(L({ en: "Eating window is open!", id: "Jendela makan dibuka!" }), L({ en: "You can eat now. Eat mindfully", id: "Kamu boleh makan sekarang. Makan dengan sadar ya" }));
    armReminders(lang);
  }, ms);
  timers.push(t);
}
export async function enableReminders(lang: Lang = "en"): Promise<{ ok: boolean; web: boolean }> {
  setNotif(true);
  let web = false;
  if ("Notification" in window) {
    let p = Notification.permission;
    if (p === "default") {
      try {
        p = await Notification.requestPermission();
      } catch {
        p = Notification.permission;
      }
    }
    web = p === "granted";
  }
  armReminders(lang);
  return { ok: true, web };
}
export function disableReminders(): void {
  setNotif(false);
  timers.forEach(clearTimeout);
  timers = [];
}

// ---------- Supabase sync (my20fit_fasting) ----------
export async function saveFastingPrefs(profile: { auth_user_id?: string | null; email?: string | null }, notify: boolean): Promise<void> {
  if (!profile || !profile.auth_user_id) return;
  const c = getChoice();
  const row: Record<string, unknown> = {
    auth_user_id: profile.auth_user_id,
    email: profile.email || null,
    updated_at: new Date().toISOString(),
    notify_email: !!notify,
  };
  if (c) {
    const s = styleById(c.id);
    row.style = c.id;
    row.start_time = c.start || "12:00";
    row.eat_hours = s ? s.eat : 8;
  } else {
    row.style = null;
    row.start_time = null;
  }
  try {
    await supabase.from("my20fit_fasting").upsert(row, { onConflict: "auth_user_id" });
  } catch {
    /* ignore — preference sync is best-effort */
  }
}

// Pull the fasting choice from the account if this device has none yet.
export async function loadFastingFromCloud(authUserId: string): Promise<boolean> {
  try {
    if (getChoice()) return false;
    const { data } = await supabase.from("my20fit_fasting").select("style,start_time").eq("auth_user_id", authUserId).limit(1);
    const r = data && (data as any)[0];
    if (r && r.style) {
      setChoice({ id: r.style, start: String(r.start_time || "12:00").slice(0, 5) });
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}
