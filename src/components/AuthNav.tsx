import { useState } from "react";
import { COLORS, URLS } from "../lib/constants";
import { supabase } from "../lib/supabase";
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
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <a
          href={URLS.LOGIN}
          className="sc-link-btn"
          style={{ fontSize: 12, fontWeight: "bold", color: COLORS.BLACK, textDecoration: "none", padding: "6px 10px" }}
        >
          {tr.signIn}
        </a>
        <a
          href={URLS.SIGN_UP}
          className="sc-btn-primary"
          style={{ background: COLORS.RED, color: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: "bold", textDecoration: "none", whiteSpace: "nowrap" }}
        >
          {tr.signUp}
        </a>
      </div>
    );
  }

  const name: string = user?.user_metadata?.full_name?.split(" ")[0] || user?.email || "";
  const initial = name ? name[0]!.toUpperCase() : "•";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowMenu((s) => !s)}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 4 }}
        aria-label="Account menu"
      >
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: COLORS.RED, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, flexShrink: 0 }}>
          {initial}
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.BLACK, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="hidden sm:inline">
          {name}
        </span>
      </button>

      {showMenu && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 60 }} onClick={() => setShowMenu(false)} />
          <div
            style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 61, minWidth: 160, background: "#FFFFFF", borderRadius: 12, border: "1px solid rgba(20,20,20,0.1)", boxShadow: "0 12px 30px -8px rgba(0,0,0,0.2)", overflow: "hidden" }}
          >
            <a href={URLS.MY_20FIT} style={{ display: "block", padding: "10px 14px", fontSize: 12, fontWeight: 600, color: COLORS.BLACK, textDecoration: "none", borderBottom: "1px solid rgba(20,20,20,0.06)" }}>
              {tr.openMy20fit}
            </a>
            <button
              onClick={handleSignOut}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", fontSize: 12, fontWeight: 600, color: COLORS.RED, background: "none", border: "none", cursor: "pointer" }}
            >
              {tr.signOut}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
