// Ecosystem-wide "app switcher" — lets a member jump straight to any other
// 20FIT product (my.20fit.id, recipe.20fit.id, calorietracker.20fit.id,
// etc.) from wherever they are. Renders as a single waffle-icon button that
// sits inline in this app's own nav bar (see App.tsx) — matching that bar's
// own theme-aware button styling — rather than as a separate colored strip;
// only the dropdown menu itself keeps fixed (not theme-token) colors, since
// it's meant to look the same regardless of the page's own light/dark theme.
//
// When the user is signed in here, every menu link hands that same session
// to whatever 20FIT app they switch to (see appendSsoFragment() in
// src/lib/supabase.ts) — one shared Supabase project across the whole
// ecosystem, so switching apps never means signing up/in again.
//
// This repo (calorietracker.20fit.id / Marketing-project-wq/Calories.20fit)
// is the only subdomain this session can edit. The other nine subdomains
// listed in UNIVERSAL_NAV_ITEMS live in separate repos/Railway services and
// need this same switcher added on their own — see src/lib/universalNav.ts
// for the shared item list to port over.
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { UNIVERSAL_NAV_ITEMS, getCurrentAppId } from "../lib/universalNav";
import { appendSsoFragment } from "../lib/supabase";
import { useSsoTokens, navigateWithSso } from "../lib/ssoRelay";
import { announceDropdownOpen, onOtherDropdownOpen } from "../lib/dropdownCoordinator";

const DROPDOWN_ID = "universal-nav";

const MENU_BG = "#FFFFFF";
const CARD_HOVER = "#F5F5F5";
const ACTIVE_BORDER = "#111111";

function WaffleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      {[2, 9, 16].flatMap((cy) => [2, 9, 16].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.6" />))}
    </svg>
  );
}

export function UniversalNav() {
  const [open, setOpen] = useState(false);
  // Kept fresh across sign-in/out (native /login, AuthNav sign-out) rather
  // than fetched once at mount — see useSsoTokens() in ssoRelay.ts.
  const ssoTokens = useSsoTokens();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const currentApp = getCurrentAppId();
  const currentItem = UNIVERSAL_NAV_ITEMS.find((i) => i.id === currentApp);

  // Focus the first item when the menu opens, so keyboard users land inside it.
  useEffect(() => {
    if (open) menuRef.current?.querySelector<HTMLElement>("a")?.focus();
  }, [open]);

  // Only one nav-bar dropdown (this one, AuthNav's account menu) shows open
  // at a time — see src/lib/dropdownCoordinator.ts.
  useEffect(() => {
    if (open) announceDropdownOpen(DROPDOWN_ID);
  }, [open]);
  useEffect(() => onOtherDropdownOpen(DROPDOWN_ID, () => setOpen(false)), []);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      // Focus trap: keep Tab cycling within the open menu.
      if (e.key === "Tab" && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>("a");
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: "relative", zIndex: 9999, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={currentItem ? `Menu aplikasi 20FIT — ${currentItem.label}` : "Menu aplikasi 20FIT"}
        title="20FIT"
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: 8,
          background: open ? "var(--brand-soft)" : "var(--track)",
          color: open ? "var(--brand)" : "var(--text-soft)",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <WaffleIcon />
      </button>

      {open && (
        <>
          <div ref={menuRef} className="un-menu" aria-label="20FIT — pilih aplikasi" style={{ background: MENU_BG, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            {UNIVERSAL_NAV_ITEMS.map((item) => {
              const isActive = item.id === currentApp;
              return (
                <a
                  key={item.id}
                  role="link"
                  href={isActive ? item.url : appendSsoFragment(item.url, ssoTokens)}
                  aria-current={isActive ? "page" : undefined}
                  onClick={async (e) => {
                    if (isActive) {
                      e.preventDefault();
                      setOpen(false);
                      return;
                    }
                    // Let modified clicks (new tab, etc.) behave normally on the plain href above.
                    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    setOpen(false);
                    await navigateWithSso(item.url, ssoTokens);
                  }}
                  className="un-card"
                  style={{
                    background: isActive ? "#F0F0F0" : "transparent",
                    borderColor: isActive ? ACTIVE_BORDER : "transparent",
                    cursor: isActive ? "default" : "pointer",
                  }}
                >
                  {item.iconSrc ? (
                    <img src={item.iconSrc} alt="" width={40} height={40} loading="lazy" style={{ display: "block" }} />
                  ) : (
                    <Icon name={item.icon} size={28} color={item.color} strokeWidth={1.8} />
                  )}
                  <span className="un-label">{item.label}</span>
                  <span className="un-desc">{item.description}</span>
                  {isActive && <span className="un-here">● Kamu di sini</span>}
                </a>
              );
            })}
          </div>
          <button className="un-close-mobile" onClick={() => setOpen(false)} aria-label="Tutup menu">
            ✕
          </button>
        </>
      )}

      <style>{`
        .un-card { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 14px 8px; border-radius: 12px; text-decoration: none; color: #1a1a1a; border: 2px solid transparent; transition: background .15s; }
        .un-card:hover { background: ${CARD_HOVER}; }
        .un-label { font-size: 12px; font-weight: 600; line-height: 1.2; margin-top: 6px; }
        .un-desc { font-size: 10px; color: #888; margin-top: 2px; line-height: 1.2; }
        .un-here { font-size: 9px; color: #16A34A; margin-top: 4px; font-weight: 600; }
        .un-close-mobile { display: none; }

        .un-menu {
          position: absolute;
          top: 100%;
          right: 0;
          width: min(480px, 95vw);
          border-radius: 0 0 16px 16px;
          padding: 16px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          animation: unMenuIn .2s ease;
        }
        @keyframes unMenuIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1024px) {
          .un-menu { width: 100vw; border-radius: 0; }
        }

        @media (max-width: 640px) {
          .un-menu {
            position: fixed;
            inset: 0;
            width: 100vw;
            height: 100vh;
            grid-template-columns: repeat(2, 1fr);
            align-content: start;
            border-radius: 0;
            overflow-y: auto;
            padding: 64px 16px 40px;
          }
          .un-close-mobile {
            display: flex;
            position: fixed;
            top: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.06);
            color: #1a1a1a;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            z-index: 10001;
          }
        }
      `}</style>
    </div>
  );
}
