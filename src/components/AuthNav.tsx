import { useState } from "react";
import { COLORS, URLS } from "../lib/constants";
import { signOutNative } from "../lib/authApi";
import { Link } from "../lib/router";
import { t, Lang } from "../lib/i18n";

interface AuthNavProps {
  lang: Lang;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any;
}

/**
 * Kontrol auth di heading — "coba tanpa akun, daftar buat fitur lengkap":
 * guest lihat Sign In/Sign Up (buka lapisan akun: meal plan/diet plan/food
 * analytics), member lihat inisial + nama + Sign Out. Placement: kanan atas,
 * sebelah toggle bahasa.
 */
export const AuthNav = ({ lang, isLoading, isAuthenticated, user }: AuthNavProps) => {
  const tr = t[lang];
  const [showMenu, setShowMenu] = useState(false);

  // Sesi belum diketahui (cek awal) — jangan kedip dari "Sign In" ke avatar.
  if (isLoading) return <div style={{ width: 76, height: 30 }} />;

  if (!isAuthenticated) {
    // Native auth on THIS app — internal routes, no redirect to my.20fit.id.
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Link
          href="/login"
          className="sc-link-btn"
          style={{ fontSize: 12, fontWeight: "bold", color: "var(--text)", textDecoration: "none", padding: "6px 10px" }}
        >
          {tr.signIn}
        </Link>
        <Link
          href="/register"
          className="sc-btn-primary"
          style={{ background: "var(--brand)", color: "var(--on-brand)", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: "bold", textDecoration: "none", whiteSpace: "nowrap" }}
        >
          {tr.signUp}
        </Link>
      </div>
    );
  }

  const name: string = user?.user_metadata?.full_name?.split(" ")[0] || user?.email || "";
  const initial = name ? name[0]!.toUpperCase() : "•";

  const handleSignOut = async () => {
    await signOutNative();
    setShowMenu(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowMenu((s) => !s)}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 4 }}
        aria-label="Account menu"
      >
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--brand)", color: "var(--on-brand)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, flexShrink: 0 }}>
          {initial}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="hidden sm:inline">
          {name}
        </span>
      </button>

      {showMenu && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 60 }} onClick={() => setShowMenu(false)} />
          <div
            style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 61, minWidth: 160, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", boxShadow: "0 12px 30px -8px rgba(0,0,0,0.2)", overflow: "hidden" }}
          >
            <a href={URLS.MY_20FIT} style={{ display: "block", padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "var(--text)", textDecoration: "none", borderBottom: "1px solid var(--border)" }}>
              {tr.openMy20fit}
            </a>
            <button
              onClick={handleSignOut}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "var(--brand)", background: "none", border: "none", cursor: "pointer" }}
            >
              {tr.signOut}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
