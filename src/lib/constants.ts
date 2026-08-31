export const COLORS = {
  RED: "#C41101",
  BLACK: "#16170F",
  PINK_ACCENT: "#FCEBED",
  WHITE: "#FFFFFF",
};

export const SUPABASE = {
  URL: "https://cpvzwqptzcxnwzfzgrmt.supabase.co",
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  STORAGE_KEY: "sb-cpvzwqptzcxnwzfzgrmt-auth-token",
};

export const MY20FIT = "https://my.20fit.id";

// ?next=calories: read by my.20fit.id's login.html/code-login.html (repo
// PROFILE20FIT) and stashed into sessionStorage so that once the person is
// fully authenticated there (verified + onboarded + has a password), it
// calls its existing Auth.caloriesSso() hand-off back to this app instead of
// landing on my.20fit.id's own dashboard — same #access_token=...&
// refresh_token=... fragment useAuth.ts already knows how to consume (the
// SAME mechanism the my.20fit.id dashboard's own Calorie card already uses
// to jump here pre-authenticated). Without it, someone who arrives on
// calorietracker directly, signs in, and would otherwise be stranded on
// my.20fit.id's dashboard instead of back here where they started.
export const URLS = {
  MY_20FIT: MY20FIT,
  LOGIN: `${MY20FIT}/login?next=calories`,
  SIGN_UP: `${MY20FIT}/login?mode=up&next=calories`,
  TOPUP: `${MY20FIT}/calories`,
};

export const API_BASE = (import.meta.env.VITE_API_URL as string) || MY20FIT;

export const API = {
  SCAN_AI: "/api/scan/ai",
  SCAN_TEXT: "/api/scan/food-text",
  SCAN_QUOTA: "/api/scan/quota",
  SCAN_BUY: "/api/scan/buy",
};

export const SCAN_LIMITS = {
  FILE_SIZE_MB: 5,
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
};

export const SUBDOMAINS = [
  {
    name: "Scan Kalori",
    icon: "🥗",
    url: "https://calories.20fit.id",
    key: "calories",
  },
  {
    name: "My 20FIT",
    icon: "🎯",
    url: MY20FIT,
    key: "my20fit",
  },
];
