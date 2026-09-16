import { useEffect, useState } from "react";
import { CTAFull } from "../components/CTA";
import { useAuth } from "../hooks/useAuth";
import { Lang } from "../lib/i18n";
import { MY20FIT } from "../lib/constants";
import { getMyFitCaloriesEmbedUrl } from "../lib/myfitEmbed";

// Full calorie tracker for logged-in members — target harian, macro, food summary,
// scan detail, log, intermittent fasting, menu recommendations. This is my.20fit.id
// /calories itself, embedded (see src/lib/myfitEmbed.ts for why an iframe rather than
// a React reimplementation) — not a copy, the SAME page, pre-authenticated via the
// same session hand-off my.20fit.id's own dashboard already uses in the other
// direction. Requires the my.20fit.id-side CSP change (PROFILE20FIT server.js) that
// allows calories.html to be framed by this origin specifically.
export const InsightPage = ({ lang = "id" }: { lang?: Lang }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [src, setSrc] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    getMyFitCaloriesEmbedUrl().then((url) => { if (!cancelled) setSrc(url); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  // Kalau iframe-nya kelamaan/gagal kebuka (mis. CSP di sisi my.20fit.id belum ke-deploy,
  // atau koneksi lambat), jangan biarin loading spinner selamanya — muncul link "buka
  // langsung" sebagai jalan keluar darurat, bukan alur utama.
  useEffect(() => {
    if (!src || iframeLoaded) { setShowFallback(false); return; }
    const t = setTimeout(() => setShowFallback(true), 8000);
    return () => clearTimeout(t);
  }, [src, iframeLoaded]);

  if (authLoading) return null;

  if (!isAuthenticated) {
    return (
      <CTAFull
        title={lang === "id" ? "Calorie Tracker Lengkap" : "Full Calorie Tracker"}
        description={lang === "id"
          ? "Target kalori harian, breakdown makro, food summary, log, intermittent fasting, dan rekomendasi menu — sama persis dengan my.20fit.id/calories, cuma dari akun yang sudah masuk."
          : "Daily calorie target, macro breakdown, food summary, log, intermittent fasting, and menu recommendations — the exact same tracker as my.20fit.id/calories, once signed in."}
        bullets={[
          lang === "id" ? "Target kalori & makro harian, dihitung dari profil kamu" : "Daily calorie & macro targets, calculated from your profile",
          lang === "id" ? "Log makanan lengkap + intermittent fasting" : "Full food log + intermittent fasting",
          lang === "id" ? "Datanya sama dengan yang kelihatan di my.20fit.id" : "Same data you'd see on my.20fit.id",
        ]}
      />
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "80vh" }}>
      {(!src || !iframeLoaded) && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "#FFFFFF", zIndex: 1 }}>
          <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: "#D62828", borderTopColor: "transparent" }}></div>
          {showFallback && (
            <a href={`${MY20FIT}/calories`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#6A6A6A", textDecoration: "underline" }}>
              {lang === "id" ? "Kelamaan? Buka langsung di my.20fit.id →" : "Taking too long? Open directly on my.20fit.id →"}
            </a>
          )}
        </div>
      )}
      {src && (
        <iframe
          src={src}
          onLoad={() => setIframeLoaded(true)}
          title="Calorie Tracker"
          style={{ width: "100%", minHeight: "80vh", border: "none", display: "block" }}
          // Deliberately NOT sandboxed: this is our own trusted app (my.20fit.id), not
          // third-party content — the real boundary is the CSP frame-ancestors allowlist
          // on the my.20fit.id side (only this origin). calories.html has too many
          // interdependent flows to sandbox safely (Xendit top-up redirect needs full-page
          // navigation, desktop scan uses live getUserMedia camera capture, payment/voucher
          // popups) — a `sandbox` attribute would need every one of those tokens exactly
          // right, and a missed one fails silently inside the frame. `allow="camera"` is
          // still needed for the live-camera scan flow (permissions-policy, unrelated to
          // sandbox).
          allow="camera"
        />
      )}
    </div>
  );
};
