import { useState } from "react";
import { COLORS, SUBDOMAINS, URLS } from "../lib/constants";
import { AuthStatus } from "./AuthStatus";
import { AppSwitcher } from "./AppSwitcher";

interface HeaderProps {
  subdomainKey: string;
  isAuthenticated: boolean;
  user?: any;
}

export const Header = ({ subdomainKey, isAuthenticated, user }: HeaderProps) => {
  const [showSwitcher, setShowSwitcher] = useState(false);
  const currentSubdomain = SUBDOMAINS.find((s) => s.key === subdomainKey);
  const userName = user?.user_metadata?.full_name || user?.email;
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-50 border-b" style={{ borderColor: "#E8E8E8" }}>
      <div className="px-4 py-3 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href={URLS.MY_20FIT} className="text-2xl font-display uppercase font-bold" style={{ color: COLORS.RED }}>
            20FIT
          </a>
          <div className="w-px h-6" style={{ backgroundColor: "#DCDCDC" }}></div>
          <span className="hidden sm:inline font-body text-sm font-semibold text-gray-700">
            {currentSubdomain?.name}
          </span>
          <span className="sm:hidden text-lg">{currentSubdomain?.icon}</span>
        </div>

        <div className="md:hidden">
          <button onClick={() => setShowSwitcher(!showSwitcher)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="App switcher">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>

        <div className="hidden md:block">
          <AppSwitcher currentKey={subdomainKey} />
        </div>

        <AuthStatus isAuthenticated={isAuthenticated} userName={userName} userAvatar={userAvatar} />
      </div>

      {showSwitcher && (
        <div className="md:hidden border-t p-4 bg-white">
          <AppSwitcher currentKey={subdomainKey} />
        </div>
      )}
    </header>
  );
};
