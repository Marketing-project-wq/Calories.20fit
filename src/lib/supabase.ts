import { createClient } from "@supabase/supabase-js";
import { SUPABASE } from "./constants";

// Subdomain ini harus tetap bisa dipakai tanpa login (guest mode), jadi
// createClient tidak boleh throw hanya karena VITE_SUPABASE_ANON_KEY belum
// diset saat build - login-nya saja yang tidak akan berfungsi.
if (!SUPABASE.ANON_KEY) {
  console.warn("VITE_SUPABASE_ANON_KEY belum diset - fitur login/SSO tidak akan berfungsi.");
}

export const supabase = createClient(SUPABASE.URL, SUPABASE.ANON_KEY || "missing-anon-key", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: SUPABASE.STORAGE_KEY,
  },
});

export interface SsoTokens {
  access_token: string;
  refresh_token: string;
}

/** Current session's tokens, for SSO hand-off to other 20FIT subdomains (same Supabase project) — see appendSsoFragment(). Null when signed out. */
export async function getSsoTokens(): Promise<SsoTokens | null> {
  const { data } = await supabase.auth.getSession();
  const s = data.session;
  if (!s?.access_token || !s?.refresh_token) return null;
  return { access_token: s.access_token, refresh_token: s.refresh_token };
}

/**
 * Appends the current session as a #access_token=...&refresh_token=...
 * fragment (never sent to any server, stripped from the URL bar once read)
 * so a link to another 20FIT subdomain lands the user already signed in
 * there instead of a stranger — every 20FIT app shares this one Supabase
 * project, and my.20fit.id / calorietracker.20fit.id / recipe.20fit.id all
 * confirmed read this exact hand-off format. Harmless no-op on any
 * subdomain that doesn't (an unread fragment does nothing). Returns `url`
 * unchanged when signed out.
 */
export function appendSsoFragment(url: string, tokens: SsoTokens | null): string {
  if (!tokens) return url;
  const frag = new URLSearchParams({ access_token: tokens.access_token, refresh_token: tokens.refresh_token });
  return `${url}#${frag.toString()}`;
}
