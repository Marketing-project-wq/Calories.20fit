// Buy more scan credits without leaving calorietracker — same packages
// my.20fit.id/calories sells (see src/lib/scanBuy.ts for the endpoint
// contract + the caveat that its exact response shape is unverified from
// this sandbox). Deliberately mirrors that flow's shape (pick a package,
// optional voucher, pay via Xendit in a new tab, poll for confirmation,
// thank-you screen) so behavior matches what members may already know from
// my.20fit.id, per the request this was built from.
import { useEffect, useRef, useState } from "react";
import { Lang } from "../../lib/i18n";
import { NUTRI, SCAN_PACKAGES, ScanPackage } from "../../lib/constants";
import { buyPackage, checkOrderStatus, checkVoucher, getPendingOrder, setPendingOrder, VoucherCheckResult } from "../../lib/scanBuy";

const BORDER = "var(--border)";
const INK = "var(--text)";
const MUTED = "var(--text-subtle)";
const tx = (lang: Lang, en: string, id: string) => (lang === "id" ? id : en);

const fmtIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");

type View = "packages" | "checkout" | "thanks" | "error";

export function TopUpModal({
  lang,
  onClose,
  phoneHint,
  onCredited,
}: {
  lang: Lang;
  onClose: () => void;
  phoneHint: string | null;
  onCredited: (creditsAdded?: number) => void;
}) {
  const [view, setView] = useState<View>("packages");
  const [selectedId, setSelectedId] = useState<string>(() => SCAN_PACKAGES.find((p) => p.best)?.id || SCAN_PACKAGES[0]?.id || "");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherState, setVoucherState] = useState<"idle" | "checking" | "applied" | "invalid">("idle");
  const [voucher, setVoucher] = useState<VoucherCheckResult | null>(null);
  const [phone, setPhone] = useState(phoneHint || "");
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [creditsAdded, setCreditsAdded] = useState<number | undefined>(undefined);
  const checkoutWinRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selected = SCAN_PACKAGES.find((p) => p.id === selectedId) || null;
  const needsPhone = !phoneHint;

  // If a purchase was already started (this modal, or the "top-up" button
  // straight after a 402) and left mid-payment, resume straight into the
  // checkout/polling view instead of making the user pick a package again.
  useEffect(() => {
    const pending = getPendingOrder();
    if (pending) {
      setOrderId(pending.orderId);
      setSelectedId(pending.packageId);
      setView("checkout");
    }
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };
  useEffect(() => () => stopPolling(), []);

  const doCheckStatus = async (id: string, manual: boolean) => {
    if (manual) setChecking(true);
    try {
      const r = await checkOrderStatus(id);
      if (r.status === "paid") {
        stopPolling();
        setPendingOrder(null);
        try { checkoutWinRef.current?.close(); } catch { /* cross-origin/blocked — ignore */ }
        setCreditsAdded(r.credits);
        setView("thanks");
        onCredited(r.credits);
      } else if (r.status === "failed" || r.status === "expired") {
        stopPolling();
        setPendingOrder(null);
        setView("error");
        setBuyError(tx(lang, "Payment was not completed. You can try again.", "Pembayaran tidak selesai. Kamu bisa coba lagi."));
      }
      // "pending" — keep polling, nothing to do here.
    } catch (err) {
      if (err instanceof Error && err.message === "login_required") {
        stopPolling();
        setSessionExpired(true);
      }
      // any other error during a poll tick: silent, try again next tick.
    } finally {
      if (manual) setChecking(false);
    }
  };

  const startPolling = (id: string) => {
    stopPolling();
    pollRef.current = setInterval(() => doCheckStatus(id, false), 4000);
  };

  const applyVoucher = async () => {
    const code = voucherCode.trim();
    if (!code || !selected) return;
    setVoucherState("checking");
    try {
      const r = await checkVoucher(code, selected.id);
      setVoucher(r);
      setVoucherState(r.valid ? "applied" : "invalid");
    } catch (err) {
      if (err instanceof Error && err.message === "login_required") { setSessionExpired(true); return; }
      setVoucherState("invalid");
      setVoucher({ valid: false });
    }
  };

  const startBuy = async () => {
    if (!selected || buying) return;
    if (needsPhone && !phone.trim()) return;
    setBuying(true);
    setBuyError(null);
    try {
      const r = await buyPackage({
        packageId: selected.id,
        credits: selected.credits,
        priceIDR: voucher?.valid && voucher.finalPriceIDR != null ? voucher.finalPriceIDR : selected.priceIDR,
        voucherCode: voucher?.valid ? voucherCode.trim() : undefined,
        phone: phone.trim() || undefined,
      });
      setPendingOrder({ orderId: r.orderId, packageId: selected.id, createdAt: Date.now() });
      setOrderId(r.orderId);
      const win = window.open(r.checkoutUrl, "_blank", "noopener");
      checkoutWinRef.current = win;
      setView("checkout");
      startPolling(r.orderId);
    } catch (err) {
      if (err instanceof Error && err.message === "login_required") {
        setSessionExpired(true);
      } else {
        setBuyError(tx(lang, "Couldn't start checkout. Please try again.", "Gagal memulai pembayaran. Coba lagi."));
      }
    } finally {
      setBuying(false);
    }
  };

  const reopenCheckout = () => {
    // Only reachable if the earlier window.open() was blocked/closed — the
    // order id is still valid, just re-navigate to it isn't possible without
    // the URL, so this simply re-checks status; a real "get link again"
    // would need /api/scan/buy or /order-status to also return the same
    // checkout_url again, which we don't rely on here to keep this honest
    // about what's actually verified.
    if (orderId) doCheckStatus(orderId, true);
  };

  if (sessionExpired) {
    return (
      <Overlay onClose={onClose}>
        <ModalShell title={tx(lang, "Session expired", "Sesi berakhir")} onClose={onClose}>
          <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.5, margin: "0 0 16px" }}>
            {tx(lang, "Your session expired. Please sign in again to continue buying scans.", "Sesi kamu sudah berakhir. Silakan masuk lagi untuk melanjutkan pembelian scan.")}
          </p>
          <button onClick={onClose} style={primaryBtnStyle}>{tx(lang, "Close", "Tutup")}</button>
        </ModalShell>
      </Overlay>
    );
  }

  if (view === "thanks") {
    return (
      <Overlay onClose={onClose}>
        <ModalShell title={tx(lang, "Payment successful", "Pembayaran berhasil")} onClose={onClose}>
          <div style={{ textAlign: "center", padding: "8px 0 18px" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              {creditsAdded ? tx(lang, `${creditsAdded} scans added to your account`, `${creditsAdded} scan sudah ditambahkan ke akunmu`) : tx(lang, "Your scans have been added", "Scan kamu sudah ditambahkan")}
            </div>
            <div style={{ fontSize: 12.5, color: MUTED }}>{tx(lang, "You can keep scanning right away.", "Kamu bisa lanjut scan sekarang juga.")}</div>
          </div>
          <button onClick={onClose} style={primaryBtnStyle}>{tx(lang, "Continue", "Lanjutkan")}</button>
        </ModalShell>
      </Overlay>
    );
  }

  if (view === "error") {
    return (
      <Overlay onClose={onClose}>
        <ModalShell title={tx(lang, "Payment issue", "Ada masalah pembayaran")} onClose={onClose}>
          <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.5, margin: "0 0 16px" }}>{buyError}</p>
          <button
            onClick={() => { setView("packages"); setBuyError(null); setOrderId(null); }}
            style={primaryBtnStyle}
          >
            {tx(lang, "Try again", "Coba lagi")}
          </button>
        </ModalShell>
      </Overlay>
    );
  }

  if (view === "checkout") {
    return (
      <Overlay onClose={onClose}>
        <ModalShell title={tx(lang, "Waiting for payment", "Menunggu pembayaran")} onClose={onClose}>
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>⏳</div>
            <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.55, margin: "0 0 16px" }}>
              {tx(
                lang,
                "Finish the payment in the tab that just opened. This closes automatically once it's confirmed.",
                "Selesaikan pembayaran di tab yang baru terbuka. Ini akan otomatis lanjut begitu pembayaran dikonfirmasi."
              )}
            </p>
          </div>
          <button onClick={reopenCheckout} disabled={checking} style={{ ...primaryBtnStyle, opacity: checking ? 0.6 : 1, marginBottom: 10 }}>
            {checking ? tx(lang, "Checking…", "Mengecek…") : tx(lang, "Check now", "Cek sekarang")}
          </button>
          <button
            onClick={onClose}
            style={{ width: "100%", padding: "10px 0", border: "none", background: "none", color: MUTED, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            {tx(lang, "Close — I'll check back later", "Tutup — nanti aku cek lagi")}
          </button>
        </ModalShell>
      </Overlay>
    );
  }

  // ---- default: package picker ----
  return (
    <Overlay onClose={onClose}>
      <ModalShell title={tx(lang, "Get more calorie scans", "Tambah kuota scan kalori")} onClose={onClose}>
        <p style={{ fontSize: 12.5, color: MUTED, margin: "0 0 14px" }}>{tx(lang, "Pick a pack to see the price & add a voucher.", "Pilih paket untuk lihat harga & tambah voucher.")}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {SCAN_PACKAGES.map((p) => (
            <PackageCard key={p.id} pkg={p} lang={lang} selected={p.id === selectedId} onSelect={() => { setSelectedId(p.id); setVoucher(null); setVoucherState("idle"); }} />
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: MUTED, marginBottom: 6 }}>
            {tx(lang, "Voucher (optional)", "Voucher (opsional)")}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={voucherCode}
              onChange={(e) => { setVoucherCode(e.target.value); setVoucherState("idle"); setVoucher(null); }}
              placeholder={tx(lang, "Voucher code", "Kode voucher")}
              style={{ flex: 1, minWidth: 0, padding: "10px 12px", background: "var(--surface-inset)", border: `1px solid ${BORDER}`, borderRadius: 10, color: INK, fontSize: 13 }}
            />
            <button
              onClick={applyVoucher}
              disabled={!voucherCode.trim() || voucherState === "checking"}
              style={{ flex: "0 0 auto", padding: "0 16px", borderRadius: 10, border: "none", background: "var(--surface-inset)", color: INK, fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: !voucherCode.trim() ? 0.5 : 1 }}
            >
              {voucherState === "checking" ? tx(lang, "…", "…") : tx(lang, "Apply", "Terapkan")}
            </button>
          </div>
          {voucherState === "applied" && voucher?.valid && (
            <div style={{ fontSize: 12, color: NUTRI.GREEN_DARK, marginTop: 6, fontWeight: 600 }}>
              {tx(lang, "Voucher applied.", "Voucher diterapkan.")} {voucher.finalPriceIDR != null ? fmtIDR(voucher.finalPriceIDR) : ""}
            </div>
          )}
          {voucherState === "invalid" && (
            <div style={{ fontSize: 12, color: "var(--brand)", marginTop: 6, fontWeight: 600 }}>
              {voucher?.message || tx(lang, "Voucher not valid.", "Voucher tidak valid.")}
            </div>
          )}
        </div>

        {needsPhone && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: MUTED, marginBottom: 6 }}>
              {tx(lang, "Phone number", "Nomor HP")}
            </div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="08xxxxxxxxxx"
              style={{ width: "100%", padding: "10px 12px", background: "var(--surface-inset)", border: `1px solid ${BORDER}`, borderRadius: 10, color: INK, fontSize: 13, boxSizing: "border-box" }}
            />
          </div>
        )}

        {buyError && <div style={{ fontSize: 12.5, color: "var(--brand)", marginBottom: 10, fontWeight: 600 }}>{buyError}</div>}

        <button
          onClick={startBuy}
          disabled={!selected || buying || (needsPhone && !phone.trim())}
          style={{ ...primaryBtnStyle, opacity: !selected || buying || (needsPhone && !phone.trim()) ? 0.6 : 1 }}
        >
          {buying ? tx(lang, "Starting checkout…", "Memulai pembayaran…") : tx(lang, "Select a pack", "Pilih paket")}
        </button>
        <p style={{ fontSize: 11, color: MUTED, textAlign: "center", margin: "10px 0 0" }}>
          {tx(lang, "Secure payment via Xendit. Your extra scans never expire.", "Pembayaran aman via Xendit. Scan tambahan tidak pernah kedaluwarsa.")}
        </p>
      </ModalShell>
    </Overlay>
  );
}

function PackageCard({ pkg, lang, selected, onSelect }: { pkg: ScanPackage; lang: Lang; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 14,
        border: `2px solid ${selected ? "var(--brand)" : BORDER}`,
        background: selected ? "var(--brand-soft)" : "var(--surface-inset)",
        cursor: "pointer",
        textAlign: "left",
        position: "relative",
      }}
    >
      {pkg.best && (
        <span style={{ position: "absolute", top: -9, right: 12, fontSize: 9.5, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", background: NUTRI.GREEN_DARK, color: "#fff", padding: "3px 8px", borderRadius: 999 }}>
          {tx(lang, "Best value", "Paling hemat")}
        </span>
      )}
      <div style={{ flex: "0 0 auto", width: 48, height: 48, borderRadius: 10, background: "var(--brand)", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 900, lineHeight: 1 }}>{pkg.credits}</div>
        <div style={{ fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3 }}>{tx(lang, "scan", "scan")}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>{fmtIDR(pkg.priceIDR)}</div>
        <div style={{ fontSize: 12, color: MUTED }}>{tx(lang, `${pkg.credits}x calorie scans`, `${pkg.credits}x scan kalori`)}</div>
      </div>
      <div style={{ flex: "0 0 auto", width: 20, height: 20, borderRadius: "50%", border: `2px solid ${selected ? "var(--brand)" : BORDER}`, background: selected ? "var(--brand)" : "transparent" }} />
    </button>
  );
}

function Overlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 96, background: "rgba(10,12,16,.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {children}
    </div>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        maxHeight: "92vh",
        overflowY: "auto",
        background: "var(--surface)",
        backdropFilter: "var(--glass-blur)",
        WebkitBackdropFilter: "var(--glass-blur)",
        border: "1px solid var(--glass-hi)",
        borderRadius: 20,
        boxShadow: "var(--glass-shadow)",
        padding: "20px 20px calc(env(safe-area-inset-bottom) + 20px)",
        color: INK,
        position: "relative",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, borderRadius: 8, border: "none", background: "var(--surface-inset)", color: MUTED, cursor: "pointer", fontSize: 15, lineHeight: 1 }}
      >
        ✕
      </button>
      <h3 style={{ margin: "0 24px 14px 0", fontSize: 18, fontWeight: 800 }}>{title}</h3>
      {children}
    </div>
  );
}

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 0",
  border: "none",
  borderRadius: 12,
  background: "var(--brand)",
  color: "var(--on-brand)",
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
};
