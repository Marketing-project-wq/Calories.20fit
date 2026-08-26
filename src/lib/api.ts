import { API, API_BASE } from "./constants";
import { supabase } from "./supabase";

interface ScanResult {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string;
  food_name: string;
  created_at: string;
}

interface QuotaData {
  remaining: number;
  limit: number;
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const apiClient = {
  async getQuota(): Promise<QuotaData> {
    const headers = await authHeaders();
    const response = await fetch(`${API_BASE}${API.SCAN_QUOTA}`, { headers });
    if (response.status === 401) throw new Error("login_required");
    if (!response.ok) throw new Error("Gagal memuat kuota");
    return response.json();
  },

  async scanPhoto(file: File): Promise<ScanResult> {
    const headers = await authHeaders();
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE}${API.SCAN_AI}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (response.status === 401) throw new Error("login_required");
    if (response.status === 429) throw new Error("scan_limit");
    if (!response.ok) throw new Error("Gagal menganalisis foto");
    return response.json();
  },
};
