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
