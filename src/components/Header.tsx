import { useState } from "react";
import { SUBDOMAINS, URLS } from "../lib/constants";
import { AuthStatus } from "./AuthStatus";

interface HeaderProps {
  subdomainKey: string;
  isAuthenticated: boolean;
  user?: any;
}

export const Header = ({ subdomainKey, isAuthenticated, user }: HeaderProps) => {
  const [showSwitcher, setShowSwitcher] = useState(false);
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email;
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: "#141414", height: "56px" }}>
      <div className="h-full px-4 max-w-6xl mx-auto flex items-center justify-between">

        {/* Left: logo + divider + sub-brand */}
        <div className="flex items-center gap-3">
          <a href={URLS.MY_20FIT} style={{ fontFamily: "Anton, sans-serif", fontSize: "20px", color: "#D62828", letterSpacing: "0.02em" }}>
            20FIT
          </a>
          <div style={{ width: "1px", height: "20px", backgroundColor: "#3A3A3A" }} />
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#EFEDEA" }}>
            Scan Kalori
          </span>
        </div>

        {/* Right: app switcher + auth */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSwitcher(!showSwitcher)}
            className="p-2 rounded-lg"
            style={{ color: "#EFEDEA" }}
            aria-label="App switcher"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <AuthStatus isAuthenticated={isAuthenticated} userName={userName} userAvatar={userAvatar} />
        </div>
      </div>

      {/* App switcher dropdown */}
      {showSwitcher && (
        <div
          className="absolute left-0 right-0 border-t"
          style={{ backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", top: "56px" }}
          onClick={() => setShowSwitcher(false)}
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex gap-3">
            {SUBDOMAINS.map((sub) => (
              <a
                key={sub.key}
                href={sub.url}
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: sub.key === subdomainKey ? "#2A2A2A" : "transparent",
                  color: sub.key === subdomainKey ? "#D62828" : "#AAAAAA",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <span>{sub.icon}</span>
                <span>{sub.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
