// Builds the URL used to embed my.20fit.id/calories (the FULL calorie tracker —
// target harian, macro, food summary, scan detail, log, intermittent fasting,
// menu recommendations — everything) inside an <iframe> on calorietracker.20fit.id,
// pre-authenticated.
//
// Why an iframe instead of porting the feature to React: my.20fit.id/calories pulls
// in 8 shared vanilla-JS modules (auth.js, fasting.js, nutrition.js, recipes.js,
// nav.js, tour.js, orders.js, deals.js) that are deeply woven into that app's own
// nav/payment/voucher systems. Reimplementing all of that in React would mean two
// codebases doing the same thing — exactly the "kembar tapi beda" drift risk this
// was built to avoid. The iframe means calorietracker.20fit.id and my.20fit.id/calories
// are LITERALLY the same code, always in sync, zero duplication.
//
// The hand-off mirrors PROFILE20FIT's own Auth.caloriesSso() (my.20fit.id -> here),
// just in reverse: take the CURRENT Supabase session (already established in this
// browser) and forward it as a #access_token=...&refresh_token=... URL fragment.
// my.20fit.id's own Supabase client is initialized with `detectSessionInUrl: true`
// (js/auth.js) — it picks up and consumes that fragment automatically, inside the
// iframe's own document, then clears it from the iframe's own address bar. No new
// code needed on the my.20fit.id side for this part; only the CSP change that lets
// calories.html be framed by this origin at all (see server.js).
import { MY20FIT } from "./constants";
import { supabase } from "./supabase";

export async function getMyFitCaloriesEmbedUrl(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    const s = data.session;
    if (s?.access_token && s?.refresh_token) {
      const exp = (s as any).expires_in || (s.expires_at ? Math.max(60, s.expires_at - Math.floor(Date.now() / 1000)) : 3600);
      const frag = "#access_token=" + encodeURIComponent(s.access_token) +
        "&refresh_token=" + encodeURIComponent(s.refresh_token) +
        "&expires_in=" + exp + "&token_type=bearer&type=magiclink";
      return `${MY20FIT}/calories${frag}`;
    }
  } catch (e) {
    // fall through to unauthenticated embed below
  }
  // Tanpa sesi (harusnya tak kejadian — halaman ini cuma dirender kalau isAuthenticated),
  // tapi tetap aman: my.20fit.id/calories sendiri yang akan minta login di dalam iframe.
  return `${MY20FIT}/calories`;
}
