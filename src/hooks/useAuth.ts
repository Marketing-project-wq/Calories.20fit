import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { API_BASE } from "../lib/constants";
import { getAnonId } from "../lib/anon";

// Klaim data anonim (scan tamu, dll) ke akun setelah login, pakai anon_id bersama
// .20fit.id. Idempoten di server (RPC my20fit_claim_anon). Best-effort.
async function claimAnon(token: string) {
  try {
    await fetch(`${API_BASE}/api/anon/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "x-anon-id": getAnonId() },
      body: JSON.stringify({ anon_ids: [getAnonId()] }),
    });
  } catch {
    /* best-effort */
  }
}

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // SSO Hand-off: my.20fit links here as calorietracker.20fit.id/#access_token=...&refresh_token=...
      const h = new URLSearchParams(location.hash.slice(1));
      const at = h.get("access_token");
      const rt = h.get("refresh_token");

      if (at && rt) {
        // Set session dari URL fragment
        await supabase.auth.setSession({
          access_token: at,
          refresh_token: rt,
        });
        // Strip tokens dari URL untuk security
        history.replaceState(null, "", location.pathname + location.search);
      }

      // Get current user (null jika belum login - subdomain ini bisa dipakai tanpa login)
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setIsLoading(false);
    })();

    // Listen untuk auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null);
      // Baru login/daftar -> pindahkan data anonim (scan tamu) ke akun ini (idempoten).
      if (_e === "SIGNED_IN" && s?.access_token) claimAnon(s.access_token);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};
