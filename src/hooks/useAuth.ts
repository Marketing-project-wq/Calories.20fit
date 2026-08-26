import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { URLS } from "../lib/constants";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // SSO Hand-off: my.20fit links here as calories.20fit.id/#access_token=...&refresh_token=...
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

      // Get current user
      const { data } = await supabase.auth.getUser();
      const currentUser = data.user ?? null;

      if (!currentUser) {
        // Redirect ke login jika tidak authenticated
        window.location.href = URLS.LOGIN;
        return;
      }

      setUser(currentUser);
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
