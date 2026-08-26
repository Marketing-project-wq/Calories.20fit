import { API, API_BASE } from "./constants";
import { supabase } from "./supabase";

export interface ScanResult {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string;
  food_name: string;
  created_at: string;
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

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const apiClient = {
  // Scan foto boleh dipanggil tanpa login (guest mode) - backend menentukan
  // apa saja yang dikembalikan berdasarkan ada/tidaknya header Authorization.
  async scanPhoto(file: File): Promise<ScanResult> {
    const headers = await authHeaders();
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE}${API.SCAN_AI}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (response.status === 429) throw new Error("scan_limit");
    if (!response.ok) throw new Error("Gagal menganalisis foto");
    return response.json();
  },

  // Kuota scan (topup credit) - fitur akun, hanya dipanggil untuk user yang login.
  async getQuota(): Promise<QuotaData> {
    const headers = await authHeaders();
    const response = await fetch(`${API_BASE}${API.SCAN_QUOTA}`, { headers });
    if (response.status === 401) throw new Error("login_required");
    if (!response.ok) throw new Error("Gagal memuat kuota");
    return response.json();
  },

  // Riwayat scan - fitur akun, butuh login.
  async getHistory(): Promise<HistoryItem[]> {
    const headers = await authHeaders();
    const response = await fetch(`${API_BASE}${API.SCAN_HISTORY}`, { headers });
    if (response.status === 401) throw new Error("login_required");
    if (!response.ok) throw new Error("Gagal memuat riwayat");
    const data = await response.json();
    return data.items ?? data;
  },

  // Tracking kebutuhan kalori harian + insight - fitur akun, butuh login.
  async getInsight(): Promise<InsightData> {
    const headers = await authHeaders();
    const response = await fetch(`${API_BASE}${API.SCAN_INSIGHT}`, { headers });
    if (response.status === 401) throw new Error("login_required");
    if (!response.ok) throw new Error("Gagal memuat insight");
    return response.json();
  },
};
