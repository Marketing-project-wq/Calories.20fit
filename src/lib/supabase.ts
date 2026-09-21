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

/** Current session's tokens, for SSO hand-off to other 20FIT subdomains (same Supabase project) — see recipeDetailUrl(). Null when signed out. */
export async function getSsoTokens(): Promise<{ access_token: string; refresh_token: string } | null> {
  const { data } = await supabase.auth.getSession();
  const s = data.session;
  if (!s?.access_token || !s?.refresh_token) return null;
  return { access_token: s.access_token, refresh_token: s.refresh_token };
}
