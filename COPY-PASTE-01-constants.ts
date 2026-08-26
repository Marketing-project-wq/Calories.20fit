// src/lib/constants.ts
// COPY-PASTE LANGSUNG KE FILE INI

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

export const URLS = {
  MY_20FIT: MY20FIT,
  LOGIN: `${MY20FIT}/login`,
  SIGN_UP: `${MY20FIT}/login`,
  TOPUP: `${MY20FIT}/calories`,
};

export const API_BASE = (import.meta.env.VITE_API_URL as string) || MY20FIT;

export const API = {
  SCAN_AI: "/api/scan/ai",
  SCAN_TEXT: "/api/scan/food-text",
  SCAN_QUOTA: "/api/scan/quota",
  SCAN_BUY: "/api/scan/buy",
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
