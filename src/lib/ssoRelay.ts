// Client for the sso-generate / sso-consume Supabase Edge Functions — a
// one-time-token relay for cross-subdomain SSO across the 20FIT ecosystem
// (see supabase/functions/sso-generate, sso-consume). This is additive to,
// not a replacement for, the existing #access_token=...&refresh_token=...
// fragment hand-off already used elsewhere in this app (contentRecipes.ts,
// UniversalNav): NO other 20FIT subdomain can consume a relay token yet
// (that needs my.20fit.id and the others to add their own sso-consume
// call), so every caller here must keep sending the fragment too and treat
// the relay token as a best-effort addition, never the only mechanism.
import { SUPABASE } from "./constants";
import { supabase } from "./supabase";

const FN_BASE = `${SUPABASE.URL}/functions/v1`;

/**
 * Mints a one-time relay token carrying the CURRENT session, for a redirect
 * to `targetHost` (validated against a fixed allowlist server-side). Returns
 * null on any failure (not signed in, network error, target not allowed) —
 * callers treat that as "skip the token, fall back to the fragment alone".
 */
export async function generateSsoRelayToken(targetHost: string): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (!session?.access_token || !session?.refresh_token) return null;

    const res = await fetch(`${FN_BASE}/sso-generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        apikey: SUPABASE.ANON_KEY,
      },
      body: JSON.stringify({ redirect_to: targetHost, refresh_token: session.refresh_token }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    return typeof j?.token === "string" ? j.token : null;
  } catch {
    return null;
  }
}

/**
 * Redeems a relay token (e.g. from a `?sso_token=` query param on load) for
 * its access/refresh pair and sets it as this tab's session. Returns the
 * signed-in user on success, null on any failure — callers should carry on
 * as a guest, not block rendering on this.
 */
export async function consumeSsoRelayToken(token: string) {
  try {
    const res = await fetch(`${FN_BASE}/sso-consume`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE.ANON_KEY },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    if (!j?.access_token || !j?.refresh_token) return null;

    const { data, error } = await supabase.auth.setSession({ access_token: j.access_token, refresh_token: j.refresh_token });
    if (error) return null;
    return data.session?.user ?? null;
  } catch {
    return null;
  }
}
