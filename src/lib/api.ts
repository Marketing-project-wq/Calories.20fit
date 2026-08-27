import { API, API_BASE } from "./constants";
import { supabase } from "./supabase";

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
}

export interface HistoryItem {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string;
  created_at: string;
}

export interface InsightData {
  target_calories: number;
  consumed_today: number;
  remaining_calories: number;
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
  async scanPhoto(file: File): Promise<ScanResult> {
    const session = await getSession();
    const image = await fileToBase64(file);

    if (session?.access_token) {
      // Authenticated: use /api/scan/ai with Bearer token + action field
      const response = await fetch(`${API_BASE}${API.SCAN_AI}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "food", image }),
        credentials: "include",
      });
      if (response.status === 429) throw new Error("scan_limit");
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menganalisis foto");
      }
      const data = await response.json();
      return normalizeResult(data);
    } else {
      // Guest: use /api/pub/scan — server tracks quota via httpOnly cookie
      const response = await fetch(`${API_BASE}/api/pub/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "food", image }),
        credentials: "include",
      });
      if (response.status === 402) throw new Error("scan_limit");
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Gagal menganalisis foto");
      }
      const data = await response.json();
      return normalizeResult(data);
    }
  },

  async getQuota(): Promise<QuotaData> {
    const session = await getSession();
    const headers: Record<string, string> = {};
    if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
    const response = await fetch(`${API_BASE}${API.SCAN_QUOTA}`, {
      headers,
      credentials: "include",
    });
    if (response.status === 401) throw new Error("login_required");
    if (!response.ok) throw new Error("Gagal memuat kuota");
    return response.json();
  },

  async getHistory(): Promise<HistoryItem[]> {
    const session = await getSession();
    if (!session?.access_token) throw new Error("login_required");
    const response = await fetch(`${API_BASE}${API.SCAN_HISTORY}`, {
      headers: { "Authorization": `Bearer ${session.access_token}` },
      credentials: "include",
    });
    if (response.status === 401) throw new Error("login_required");
    if (!response.ok) throw new Error("Gagal memuat riwayat");
    const data = await response.json();
    return data.items ?? data;
  },

  async getInsight(): Promise<InsightData> {
    const session = await getSession();
    if (!session?.access_token) throw new Error("login_required");
    const response = await fetch(`${API_BASE}${API.SCAN_INSIGHT}`, {
      headers: { "Authorization": `Bearer ${session.access_token}` },
      credentials: "include",
    });
    if (response.status === 401) throw new Error("login_required");
    if (!response.ok) throw new Error("Gagal memuat insight");
    return response.json();
  },
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
  };
}

function parseGrams(portion: string): number {
  const m = String(portion || "").match(/(\d+(?:\.\d+)?)\s*(?:gram|gr|g)\b/i);
  return m ? parseFloat(m[1]) : 0;
}
