import { useState } from "react";
import { COLORS, URLS } from "../lib/constants";
import { supabase } from "../lib/supabase";

interface AuthStatusProps {
  isAuthenticated: boolean;
  userName?: string;
  userAvatar?: string;
}

export const AuthStatus = ({ isAuthenticated, userName, userAvatar }: AuthStatusProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isAuthenticated) {
    return (
      <a href={URLS.LOGIN} className="px-4 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.RED }}>
        Masuk
      </a>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = URLS.LOGIN;
  };

  return (
    <div className="relative">
      <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
        {userAvatar ? (
          <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: COLORS.RED }}>
            {userName?.[0]?.toUpperCase()}
          </div>
        )}
        <span className="hidden sm:inline text-sm font-semibold">{userName}</span>
        <svg className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border overflow-hidden" style={{ borderColor: "#E8E8E8" }}>
          <div className="p-3 border-b" style={{ borderColor: "#E8E8E8" }}>
            <div className="text-sm font-semibold truncate">{userName}</div>
            <div className="text-xs text-gray-600">Member 20FIT</div>
          </div>
          <div className="p-2">
            <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50" style={{ color: COLORS.RED }}>
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
