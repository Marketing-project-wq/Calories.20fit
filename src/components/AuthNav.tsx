import { useEffect, useState, CSSProperties } from "react";
import { COLORS, URLS } from "../lib/constants";
import { signOutNative } from "../lib/authApi";
import { Link } from "../lib/router";
import { t, Lang } from "../lib/i18n";
import { Icon } from "./Icon";
import { useSsoTokens, navigateWithSso } from "../lib/ssoRelay";
import { announceDropdownOpen, onOtherDropdownOpen } from "../lib/dropdownCoordinator";

const DROPDOWN_ID = "auth-nav";

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
  // Kept fresh across sign-in/out for navigateWithSso()'s relay token — see
  // useSsoTokens() in ssoRelay.ts.
  const ssoTokens = useSsoTokens();

  // Only one nav-bar dropdown (this one, UniversalNav's app switcher) shows
  // open at a time — see src/lib/dropdownCoordinator.ts.
  useEffect(() => {
    if (showMenu) announceDropdownOpen(DROPDOWN_ID);
  }, [showMenu]);
  useEffect(() => onOtherDropdownOpen(DROPDOWN_ID, () => setShowMenu(false)), []);

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

  const fullName: string = user?.user_metadata?.full_name || user?.email || "";
  const firstName = fullName.split(" ")[0] || "";
  const email: string = user?.email || "";
  const avatarUrl: string | undefined = user?.user_metadata?.avatar_url;
  const initial = firstName ? firstName[0]!.toUpperCase() : "•";

  const handleSignOut = async () => {
    await signOutNative();
    setShowMenu(false);
  };

  const goTo = (url: string) => {
    setShowMenu(false);
    void navigateWithSso(url, ssoTokens);
  };

  const menuItemStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    textAlign: "left",
    padding: "10px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--text)",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowMenu((s) => !s)}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 4 }}
        aria-label="Account menu"
        aria-expanded={showMenu}
        aria-haspopup="true"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" width={26} height={26} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <span style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--brand)", color: "var(--on-brand)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontSize: 13, flexShrink: 0 }}>
            {initial}
          </span>
        )}
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="hidden sm:inline">
          {firstName}
        </span>
      </button>

      {showMenu && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 60 }} onClick={() => setShowMenu(false)} />
          <div
            style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", zIndex: 61, minWidth: 220, background: "var(--surface)", backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)", borderRadius: 14, border: "1px solid var(--glass-hi)", boxShadow: "var(--glass-shadow)", overflow: "hidden" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" width={36} height={36} style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <span style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--brand)", color: "var(--on-brand)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Barlow Condensed, sans-serif", fontSize: 16, flexShrink: 0 }}>
                  {initial}
                </span>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fullName}</div>
                {email && <div style={{ fontSize: 11, color: "var(--text-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</div>}
              </div>
            </div>
            <button onClick={() => goTo(URLS.MY_PROFILE)} style={menuItemStyle}>
              <Icon name="user" size={16} />
              {tr.myProfile}
            </button>
            <button onClick={() => goTo(URLS.MY_PURCHASES)} style={menuItemStyle}>
              <Icon name="ticket" size={16} />
              {tr.purchaseHistory}
            </button>
            <button onClick={() => goTo(URLS.MY_SETTINGS)} style={{ ...menuItemStyle, borderBottom: "1px solid var(--border)" }}>
              <Icon name="wrench" size={16} />
              {tr.accountSettings}
            </button>
            <button onClick={handleSignOut} style={{ ...menuItemStyle, color: "var(--brand)" }}>
              <Icon name="logout" size={16} />
              {tr.signOut}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
