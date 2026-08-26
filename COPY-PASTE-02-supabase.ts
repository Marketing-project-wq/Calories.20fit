// src/lib/supabase.ts
// FILE BARU - CREATE FILE INI JIKA BELUM ADA
// COPY-PASTE LANGSUNG

import { createClient } from "@supabase/supabase-js";
import { SUPABASE } from "./constants";

export const supabase = createClient(SUPABASE.URL, SUPABASE.ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: SUPABASE.STORAGE_KEY,
  },
});
