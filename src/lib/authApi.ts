// Native auth for calorietracker.20fit.id — sign-up / sign-in / onboarding
// happen HERE, with no visible redirect to my.20fit.id. To keep it ONE account
// (not a duplicate), it reuses my.20fit.id's SAME shared backend:
//   - Register: POST my.20fit.id/api/fitco-register  (20FIT/FITCO member system)
//   - Password login: POST my.20fit.id/api/fitco-login
//   - Email-code login: Supabase edge fn my20fit-otp (action:"login_send")
// Each returns a one-time email_otp that supabase-js verifyOtp() exchanges for
// a session in THIS app's Supabase client (same project cpvzwqptzcxnwzfzgrmt),
// exactly like my.20fit.id does it. Profile + onboarding write my20fit_profile
// (the same table). Ported from PROFILE20FIT js/auth.js.
//
// CORS: my.20fit.id echoes any *.20fit.id origin on /api/* with POST +
// Content-Type/Authorization (server.js:220), so these cross-origin calls are
// allowed. The my20fit-otp edge function's cross-origin headers are managed by
// Supabase. NOTE: this flow could not be tested from the build sandbox (no
// network to my.20fit.id/Supabase) — verify with a real email before trusting.
import { MY20FIT, SUPABASE } from "./constants";
import { supabase } from "./supabase";

async function verifyEmailOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) throw error;
  return data;
}

function stashFitco(j: any) {
  try {
    if (j.fitco_user_id) localStorage.setItem("fitco_uid", String(j.fitco_user_id));
    if (j.fitco_token) localStorage.setItem("fitco_token", j.fitco_token);
  } catch {
    /* ignore */
  }
}

export interface RegisterFields {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  date_of_birth: string; // "YYYY-MM-DD"
}

// Register via my.20fit.id/api/fitco-register → verifyOtp → ensure profile row.
export async function registerNative(fields: RegisterFields): Promise<void> {
  const r = await fetch(`${MY20FIT}/api/fitco-register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  const j = await r.json().catch(() => ({} as any));
  if (!r.ok || !j.email_otp) {
    const e = new Error(j.error || "Gagal daftar.") as Error & { code?: string };
    if (r.status === 409) e.code = "email_exists";
    throw e;
  }
  stashFitco(j);
  await verifyEmailOtp(j.email, j.email_otp);
  // Carry name/phone/gender/dob so ensureProfile + onboarding can prefill them.
  try {
    sessionStorage.setItem("pending_name", fields.name || "");
    sessionStorage.setItem("pending_phone", fields.phone || "");
    sessionStorage.setItem("pending_gender", fields.gender || "");
    sessionStorage.setItem("pending_dob", fields.date_of_birth || "");
  } catch {
    /* ignore */
  }
  await ensureProfile();
}

// Password login: try 20FIT (FITCO) first, then fall back to a native Supabase
// password (accounts that set one). Mirrors login.html's two-step attempt.
export async function loginPassword(email: string, password: string): Promise<void> {
  let fitcoConfigError = false;
  try {
    const r = await fetch(`${MY20FIT}/api/fitco-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json().catch(() => ({} as any));
    if (r.ok && j.email_otp) {
      stashFitco(j);
      await verifyEmailOtp(j.email, j.email_otp);
      await ensureProfile();
      return;
    }
    const m = String((j && j.error) || "").toLowerCase();
    if (m.includes("dikonfigurasi") || m.includes("service key") || m.includes("menghubungi")) fitcoConfigError = true;
  } catch {
    /* network / fall through to Supabase password */
  }
  if (fitcoConfigError) throw new Error("Login 20FIT belum aktif di server. Coba lagi nanti.");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await ensureProfile();
}

// Send an email login code (existing accounts only) via the my20fit-otp edge fn.
export async function sendLoginCode(email: string): Promise<void> {
  const r = await fetch(`${SUPABASE.URL}/functions/v1/my20fit-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + SUPABASE.ANON_KEY,
      apikey: SUPABASE.ANON_KEY,
    },
    body: JSON.stringify({ action: "login_send", email }),
  });
  const j = await r.json().catch(() => ({} as any));
  if (!r.ok) {
    if (r.status === 404 || (j && j.error === "not_registered")) {
      const e = new Error("Email belum terdaftar.") as Error & { code?: string };
      e.code = "not_registered";
      throw e;
    }
    throw new Error(j.error || "Gagal mengirim kode login.");
  }
}

export async function verifyLoginCode(email: string, token: string): Promise<void> {
  await verifyEmailOtp(email, token);
  await ensureProfile();
}

// Create the my20fit_profile row if it doesn't exist yet (same shape my.20fit.id
// inserts). RLS scopes it to auth.uid() = auth_user_id.
export async function ensureProfile(): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;
  if (!user) return;
  const { data: rows, error } = await supabase.from("my20fit_profile").select("auth_user_id").eq("auth_user_id", user.id).limit(1);
  if (error) throw error;
  if (rows && rows.length) return;
  let pendingName: string | null = null;
  let pendingPhone: string | null = null;
  try {
    const md: any = user.user_metadata || {};
    pendingName = md.full_name || sessionStorage.getItem("pending_name") || null;
    pendingPhone = md.phone || sessionStorage.getItem("pending_phone") || null;
  } catch {
    /* ignore */
  }
  const { error: insErr } = await supabase
    .from("my20fit_profile")
    .insert({ auth_user_id: user.id, email: user.email, full_name: pendingName, phone: pendingPhone });
  if (insErr) throw insErr;
}

export interface OnboardingInput {
  gender: string; // "male" | "female"
  birthdate: string; // "YYYY-MM-DD"
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  main_goal: string; // "lose" | "muscle" | "fit" | "maintain"
}

// Write onboarding into my20fit_profile (same fields my.20fit.id's saveOnboarding
// writes, PLUS activity_level — additive, used by dailyCalorieGoal for a more
// accurate target; my.20fit.id ignores it if unset).
export async function saveOnboarding(o: OnboardingInput): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;
  if (!user) throw new Error("not_authenticated");
  await ensureProfile();
  let age: number | null = null;
  if (o.birthdate) {
    const b = new Date(o.birthdate);
    const t = new Date();
    age = t.getFullYear() - b.getFullYear();
    const m = t.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  }
  const upd: Record<string, unknown> = {
    gender: o.gender || null,
    gender_selected_at: o.gender ? new Date().toISOString() : null,
    height_cm: o.height_cm || null,
    weight_kg: o.weight_kg || null,
    activity_level: o.activity_level || null,
    main_goal: o.main_goal || null,
    health_conditions: [],
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };
  if (age !== null) upd.age = age;
  const { error } = await supabase.from("my20fit_profile").update(upd).eq("auth_user_id", user.id);
  if (error) throw error;
  try {
    sessionStorage.removeItem("pending_gender");
    sessionStorage.removeItem("pending_dob");
  } catch {
    /* ignore */
  }
}

/**
 * scope "global" (the default here) revokes the refresh token server-side —
 * a real "log out everywhere" across every 20FIT subdomain sharing this
 * Supabase project, not just this tab's local session. Any other subdomain
 * still holding that refresh token fails to renew it next time it tries.
 */
export async function signOutNative(scope: "global" | "local" = "global"): Promise<void> {
  try {
    await supabase.auth.signOut({ scope });
  } finally {
    try {
      localStorage.removeItem("fitco_uid");
      localStorage.removeItem("fitco_token");
    } catch {
      /* ignore */
    }
  }
}
