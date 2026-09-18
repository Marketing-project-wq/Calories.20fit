import { API, API_BASE } from "./constants";
import { supabase } from "./supabase";

export interface ScanTag {
  label: string;
  positive: boolean;
}

export interface ScanResult {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  total_grams: number;
  health_score: number;
  satiety_score: number;
  description: string;
  overall: string;
  image_url: string;
  created_at: string;
  items: ScanItem[];
  // Bagian dari hasil analisis SATU foto — selalu terbuka (tidak butuh akun).
  // Optional: backend lama yang belum mengirim field ini tetap aman (undefined).
  kcal_min?: number;
  kcal_max?: number;
  confidence?: number;
  tags?: ScanTag[];
  recommendation?: string;
  needs_more?: string[];
  insights?: string[];
  assumptions?: string[];
  note?: string;
  satiety_note?: string;
}

export interface ScanItem {
  name: string;
  portion: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

export interface QuotaData {
  remaining: number;
  limit: number;
  credits: number;
  freeLeft: number;
}

async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string); // full data URL: data:image/jpeg;base64,...
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const apiClient = {
  // Photo scan is MEMBER-ONLY (hard gate): the full tracker is never rendered
  // for guests, and this refuses without a session rather than falling back to
  // any guest path. Uses my.20fit.id's /api/scan/ai with a Bearer token — that
  // endpoint authenticates by Bearer (not cookie), and my.20fit.id's CORS only
  // grants Access-Control-Allow-Credentials to /api/pub/* and /api/menu/*
  // (server.js:220-234), so we must NOT send `credentials: "include"` here or
  // the browser blocks the cross-origin response.
  async scanPhoto(file: File): Promise<ScanResult> {
    const session = await getSession();
    if (!session?.access_token) throw new Error("login_required");
    const image = await fileToBase64(file);
    const response = await fetch(`${API_BASE}${API.SCAN_AI}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "food", image }),
    });
    // /api/scan/ai returns 402 { code:"scan_limit" } when quota is exhausted,
    // 401 { session_expired } when the token is gone (server.js:7430-7471).
    if (response.status === 402) throw new Error("scan_limit");
    if (response.status === 401) throw new Error("login_required");
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Gagal menganalisis foto");
    }
    const data = await response.json();
    return normalizeResult(data);
  },

  async getQuota(): Promise<QuotaData> {
    const session = await getSession();
    const headers: Record<string, string> = {};
    if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
    // Bearer, not cookie — no `credentials: "include"` (see scanPhoto note).
    const response = await fetch(`${API_BASE}${API.SCAN_QUOTA}`, { headers });
    if (response.status === 401) throw new Error("login_required");
    if (!response.ok) throw new Error("Gagal memuat kuota");
    const data = await response.json();
    // Server returns { ok, quota: { used, freeLimit, freeLeft, credits, remaining, period } }
    const q = data.quota ?? data;
    return {
      remaining: q.remaining ?? 0,
      limit: q.freeLimit ?? 10,
      credits: q.credits ?? 0,
      freeLeft: q.freeLeft ?? Math.max(0, (q.freeLimit ?? 10) - (q.used ?? 0)),
    };
  },

  // Type food + grams → auto kcal. Calls my.20fit.id's SAME /api/scan/food-text
  // endpoint (dictionary-first, then AI) — FREE, does NOT consume scan quota.
  // Reused, not duplicated (server.js:7664-7702 in PROFILE20FIT).
  async estimateFoodText(name: string, grams: number, lang: string): Promise<{ name: string; kcal: number; p: number; c: number; f: number }> {
    const session = await getSession();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
    // Bearer, not cookie — no `credentials: "include"` (see scanPhoto note).
    const response = await fetch(`${API_BASE}${API.SCAN_TEXT}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name, grams, lang }),
    });
    if (response.status === 401) throw new Error("login_required");
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Gagal menghitung kalori");
    }
    const data = await response.json();
    const r = data.result ?? data;
    const it = Array.isArray(r.items) && r.items[0] ? r.items[0] : {};
    return {
      name: it.name || name,
      kcal: Math.round(r.total_kcal ?? it.kcal ?? 0),
      p: Math.round(r.protein_g ?? it.protein_g ?? 0),
      c: Math.round(r.carbs_g ?? it.carbs_g ?? 0),
      f: Math.round(r.fat_g ?? it.fat_g ?? 0),
    };
  },

  // Per-component correction → my.20fit.id's SAME /api/scan/food-correction
  // (feeds the anonymous per-gram food dictionary my20fit_food_ref). Sent only
  // when the unit is grams (per-gram dict; pcs/ml would corrupt it). Bearer.
  async foodCorrection(payload: { name: string; grams: number; kcal: number; protein_g?: number; carbs_g?: number; fat_g?: number; fiber_g?: number; lang: string }): Promise<void> {
    const session = await getSession();
    if (!session?.access_token) return; // best-effort; local correction still applies
    const response = await fetch(`${API_BASE}${API.SCAN_CORRECTION}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("correction_failed");
  },

  // getHistory()/getInsight() removed: they called /api/scan/history and
  // /api/scan/insight, neither of which exists on my.20fit.id's backend
  // (verified against its server.js source) — they never worked for a real
  // member. HistoryPage and InsightPage now read my20fit_daily_log /
  // my20fit_profile directly via src/lib/memberHistory.ts and
  // src/lib/memberTracker.ts, the same tables my.20fit.id's own /calories
  // page uses.
};

function normalizeResult(data: any): ScanResult {
  if (typeof data.calories === "number") return data as ScanResult;

  const result = data.result ?? data;
  const items: any[] = result.items ?? [];
  const totals = items.reduce(
    (acc: any, item: any) => ({
      calories: acc.calories + (item.kcal ?? item.calories ?? 0),
      protein: acc.protein + (item.protein_g ?? item.protein ?? 0),
      carbs: acc.carbs + (item.carbs_g ?? item.carbs ?? 0),
      fat: acc.fat + (item.fat_g ?? item.fat ?? 0),
      fiber: acc.fiber + (item.fiber_g ?? item.fiber ?? 0),
      grams: acc.grams + parseGrams(item.portion),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, grams: 0 }
  );

  return {
    id: data.id ?? "",
    food_name: result.dish_name ?? result.name ?? items.map((i: any) => i.name).join(", ") ?? "Makanan",
    calories: Math.round(result.total_kcal ?? totals.calories),
    protein: Math.round((result.protein_g ?? totals.protein) * 10) / 10,
    carbs: Math.round((result.carbs_g ?? totals.carbs) * 10) / 10,
    fat: Math.round((result.fat_g ?? totals.fat) * 10) / 10,
    fiber: Math.round((result.fiber_g ?? totals.fiber) * 10) / 10,
    total_grams: Math.round(totals.grams),
    health_score: Math.round(result.health_score ?? 0),
    satiety_score: Math.round(result.satiety_score ?? 0),
    description: result.description ?? "",
    overall: result.overall ?? "",
    image_url: data.image_url ?? "",
    created_at: data.created_at ?? new Date().toISOString(),
    items: items.map((i: any) => ({
      name: i.name ?? "",
      portion: i.portion ?? "",
      kcal: Math.round(i.kcal ?? i.calories ?? 0),
      protein_g: Math.round((i.protein_g ?? i.protein ?? 0) * 10) / 10,
      carbs_g: Math.round((i.carbs_g ?? i.carbs ?? 0) * 10) / 10,
      fat_g: Math.round((i.fat_g ?? i.fat ?? 0) * 10) / 10,
      fiber_g: Math.round((i.fiber_g ?? i.fiber ?? 0) * 10) / 10,
    })),
    // Bagian hasil analisis 1 foto — selalu terbuka. Semua opsional: kalau
    // backend (AI prompt-nya) belum mengirim field ini, UI cukup tidak
    // menampilkan bagian itu (lihat ScanPage) — tidak pernah error.
    kcal_min: typeof result.kcal_min === "number" ? Math.round(result.kcal_min) : undefined,
    kcal_max: typeof result.kcal_max === "number" ? Math.round(result.kcal_max) : undefined,
    confidence: typeof result.confidence === "number" ? result.confidence : undefined,
    tags: Array.isArray(result.tags)
      ? result.tags.map((tg: any) => ({ label: String(tg.label ?? ""), positive: tg.positive !== false })).filter((tg: ScanTag) => tg.label)
      : undefined,
    recommendation: result.recommendation ?? undefined,
    needs_more: Array.isArray(result.needs_more) ? result.needs_more.map((s: any) => String(s)) : undefined,
    insights: Array.isArray(result.insights) ? result.insights.map((s: any) => String(s)) : undefined,
    assumptions: Array.isArray(result.assumptions) ? result.assumptions.map((s: any) => String(s)) : undefined,
    note: typeof result.note === "string" ? result.note : undefined,
    satiety_note: typeof result.satiety_note === "string" ? result.satiety_note : undefined,
  };
}

function parseGrams(portion: string): number {
  const m = String(portion || "").match(/(\d+(?:\.\d+)?)\s*(?:gram|gr|g)\b/i);
  return m ? parseFloat(m[1]) : 0;
}
