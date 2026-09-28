// Client for the scan-quota top-up flow — buys more /api/scan/ai credits
// without leaving calorietracker, mirroring my.20fit.id/calories' own
// js/deals.js flow (repo PROFILE20FIT, out of scope here — read-only). The
// exact response shapes below were NOT verified against that source (this
// sandbox can't reach my.20fit.id or clone PROFILE20FIT — see the request
// this was built from); field names are read defensively (a few likely
// spellings tried per field) the same way src/lib/api.ts already normalizes
// /api/scan/ai's response, so a near-miss in casing doesn't hard-fail. If a
// field genuinely doesn't match, treat this file as the first place to fix
// once the real response is seen.
//
// Deliberately NOT sending fitco_token — my.20fit.id's own /api/fitco-login
// /register are the only places calorietracker ever obtains one, so a user
// who arrived via SSO hand-off or email-code login never has it (see
// src/lib/authApi.ts stashFitco()). Buys go out identified by the Supabase
// Bearer token + user_id only, same as every other /api/scan/* call this
// app already makes.
import { API, API_BASE } from "./constants";
import { supabase } from "./supabase";

async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

function authHeaders(session: { access_token: string } | null): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) h["Authorization"] = `Bearer ${session.access_token}`;
  return h;
}

export interface VoucherCheckResult {
  valid: boolean;
  discountIDR?: number;
  finalPriceIDR?: number;
  message?: string;
}

/** POST /api/scan/voucher-check — server decides validity/discount; this only relays it for display. */
export async function checkVoucher(code: string, packageId: string): Promise<VoucherCheckResult> {
  const session = await getSession();
  if (!session?.access_token) throw new Error("login_required");
  const response = await fetch(`${API_BASE}${API.SCAN_VOUCHER_CHECK}`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify({ voucher_code: code, package_id: packageId }),
  });
  if (response.status === 401) throw new Error("login_required");
  const data = await response.json().catch(() => ({}) as any);
  if (!response.ok) {
    return { valid: false, message: data.error || data.message || undefined };
  }
  const r = data.result ?? data;
  const valid = r.valid ?? r.ok ?? r.is_valid ?? false;
  return {
    valid: !!valid,
    discountIDR: typeof r.discount === "number" ? r.discount : typeof r.discount_idr === "number" ? r.discount_idr : undefined,
    finalPriceIDR: typeof r.final_price === "number" ? r.final_price : typeof r.finalPrice === "number" ? r.finalPrice : typeof r.price === "number" ? r.price : undefined,
    message: r.message || r.error || undefined,
  };
}

export interface BuyResult {
  checkoutUrl: string;
  orderId: string;
}

/**
 * POST /api/scan/buy. `credits`/`priceIDR` are the DISPLAY values from
 * SCAN_PACKAGES — sent along so the server can cross-check, but the
 * server's own catalog is what actually decides the charge and the credit
 * (see SCAN_PACKAGES' comment in constants.ts). Never call this more than
 * once per click — callers must disable the buy button while this is in
 * flight to avoid a double charge.
 */
export async function buyPackage(opts: {
  packageId: string;
  credits: number;
  priceIDR: number;
  voucherCode?: string;
  phone?: string;
}): Promise<BuyResult> {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!session?.access_token || !userId) throw new Error("login_required");
  const response = await fetch(`${API_BASE}${API.SCAN_BUY}`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify({
      package_id: opts.packageId,
      credits: opts.credits,
      price: opts.priceIDR,
      voucher_code: opts.voucherCode || undefined,
      user_id: userId,
      phone: opts.phone || undefined,
    }),
  });
  if (response.status === 401) throw new Error("login_required");
  const data = await response.json().catch(() => ({}) as any);
  if (!response.ok) throw new Error(data.error || data.message || "buy_failed");
  const r = data.result ?? data;
  const checkoutUrl = r.checkout_url || r.checkoutUrl || r.payment_url || r.paymentUrl || r.url || r.invoice_url;
  const orderId = r.order_id || r.orderId || r.id;
  if (!checkoutUrl || !orderId) throw new Error("buy_failed");
  return { checkoutUrl: String(checkoutUrl), orderId: String(orderId) };
}

export type OrderStatus = "pending" | "paid" | "failed" | "expired";

export interface OrderStatusResult {
  status: OrderStatus;
  credits?: number;
}

function normalizeStatus(data: any): OrderStatusResult {
  const r = data.result ?? data;
  const raw = String(r.status || "").toLowerCase();
  const paid = r.paid === true || ["paid", "success", "completed", "settled"].includes(raw);
  const failed = ["failed", "cancelled", "canceled", "declined"].includes(raw);
  const expired = ["expired", "expire"].includes(raw);
  const status: OrderStatus = paid ? "paid" : failed ? "failed" : expired ? "expired" : "pending";
  return { status, credits: typeof r.credits === "number" ? r.credits : undefined };
}

/** POST /api/scan/order-status — polled while a checkout tab/window is open. */
export async function checkOrderStatus(orderId: string): Promise<OrderStatusResult> {
  const session = await getSession();
  if (!session?.access_token) throw new Error("login_required");
  const response = await fetch(`${API_BASE}${API.SCAN_ORDER_STATUS}`, {
    method: "POST",
    headers: authHeaders(session),
    body: JSON.stringify({ order_id: orderId }),
  });
  if (response.status === 401) throw new Error("login_required");
  if (!response.ok) throw new Error("status_check_failed");
  return normalizeStatus(await response.json());
}

/**
 * POST /api/scan/reconcile — the safety net deals.js calls Deals.sweep()
 * for: credits any order this signed-in user paid for but that never got
 * confirmed locally (tab closed before the poll caught it, paid from a
 * different device entirely). Scoped by the Bearer token alone, not by any
 * locally-stored order id, so it also catches the cross-device case.
 * Best-effort: a failure here is silent (caller just won't see a credit
 * that isn't there yet — the next reconcile call, e.g. on next app open,
 * tries again).
 */
export async function reconcile(): Promise<{ credited: boolean; credits?: number }> {
  const session = await getSession();
  if (!session?.access_token) return { credited: false };
  try {
    const response = await fetch(`${API_BASE}${API.SCAN_RECONCILE}`, {
      method: "POST",
      headers: authHeaders(session),
      body: JSON.stringify({}),
    });
    if (!response.ok) return { credited: false };
    const data = await response.json().catch(() => ({}) as any);
    const r = data.result ?? data;
    const credited = r.credited === true || (typeof r.credits === "number" && r.credits > 0);
    return { credited, credits: typeof r.credits === "number" ? r.credits : undefined };
  } catch {
    return { credited: false };
  }
}

// ---- pending-order tracking (resume across a closed tab / reload) ----
// Only the order id + package id are kept — no price, no voucher, no
// payment details. Just enough to ask the server "is this one paid yet?"
// the next time the app opens.
const PENDING_KEY = "ct_scan_pending_order";

export interface PendingOrder {
  orderId: string;
  packageId: string;
  createdAt: number;
}

export function getPendingOrder(): PendingOrder | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && typeof p.orderId === "string") return p as PendingOrder;
    return null;
  } catch {
    return null;
  }
}

export function setPendingOrder(order: PendingOrder | null) {
  try {
    if (order) localStorage.setItem(PENDING_KEY, JSON.stringify(order));
    else localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Run once when the tracker opens (equivalent to deals.js' Deals.resume()
 * + Deals.sweep() together): first check any order id we have stashed
 * locally, then sweep for anything reconcile() knows about regardless.
 * Returns true if either one actually credited something, so the caller
 * knows to refresh the quota display.
 */
export async function resumeAndSweep(): Promise<boolean> {
  let credited = false;
  const pending = getPendingOrder();
  if (pending) {
    try {
      const r = await checkOrderStatus(pending.orderId);
      if (r.status === "paid") {
        credited = true;
        setPendingOrder(null);
      } else if (r.status === "failed" || r.status === "expired") {
        setPendingOrder(null);
      }
      // still "pending" — leave it stashed, try again next time.
    } catch {
      /* network hiccup — leave it stashed, try again next time */
    }
  }
  const swept = await reconcile();
  if (swept.credited) credited = true;
  return credited;
}
