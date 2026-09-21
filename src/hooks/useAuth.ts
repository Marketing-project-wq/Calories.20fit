import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { consumeSsoRelayToken } from "../lib/ssoRelay";

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
      } else {
        // One-time relay token (sso-generate/sso-consume) — the forward-
        // compatible path other 20FIT subdomains adopt over time; still a
        // no-op today unless something upstream actually issues one.
        const q = new URLSearchParams(location.search);
        const relayToken = q.get("sso_token");
        if (relayToken) {
          await consumeSsoRelayToken(relayToken);
          q.delete("sso_token");
          const qs = q.toString();
          history.replaceState(null, "", location.pathname + (qs ? `?${qs}` : "") + location.hash);
        }
      }

      // Get current user (null jika belum login - subdomain ini bisa dipakai tanpa login)
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setIsLoading(false);
    })();

    // Listen untuk auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
};
