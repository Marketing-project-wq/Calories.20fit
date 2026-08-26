#!/bin/bash

# 🚀 Setup Script untuk calories.20fit.id
# Run: bash setup-20fit-calories.sh
# Atau: chmod +x setup-20fit-calories.sh && ./setup-20fit-calories.sh

set -e

PROJECT_NAME="20fit-calories"
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${BLUE}🥗 Setting up ${PROJECT_NAME}...${NC}"

# Create root directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

echo -e "${GREEN}✓ Created project directory${NC}"

# Create folder structure
mkdir -p src/{components,pages,hooks,lib}
mkdir -p src/styles

echo -e "${GREEN}✓ Created folder structure${NC}"

# Create package.json
cat > package.json << 'EOF'
{
  "name": "calories.20fit.id",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-query": "^3.39.3",
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "@tailwindcss/forms": "^0.5.3",
    "vite": "^4.3.0",
    "@vitejs/plugin-react": "^4.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
EOF

echo -e "${GREEN}✓ Created package.json${NC}"

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "20fit": {
          red: "#D62828",
          black: "#141414",
          "pink-accent": "#FDECEC",
        },
      },
      fontFamily: {
        anton: ["Anton", "sans-serif"],
      },
      animation: {
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { opacity: "0.6" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
}
EOF

echo -e "${GREEN}✓ Created tailwind.config.js${NC}"

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

echo -e "${GREEN}✓ Created tsconfig.json files${NC}"

# Create vite.config.ts
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
EOF

echo -e "${GREEN}✓ Created vite.config.ts${NC}"

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create index.html
cat > index.html << 'EOF'
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Scan foto makanan untuk estimasi kalori dan nutrisi. Bagian dari ekosistem kesehatan 20FIT." />
    <meta name="theme-color" content="#D62828" />
    <title>Scan Kalori • 20FIT</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

echo -e "${GREEN}✓ Created index.html${NC}"

# Create .env.example
cat > .env.example << 'EOF'
VITE_API_URL=http://localhost:8000
VITE_AUTH_ENABLED=true
VITE_ENABLE_HISTORY=true
VITE_ENABLE_CTA=true
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
node_modules
dist
dist-ssr
*.local
.env
.env.local
.env.*.local
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
build/
.next/
out/
EOF

echo -e "${GREEN}✓ Created config files${NC}"

# Create src/lib/constants.ts
cat > src/lib/constants.ts << 'EOF'
export const COLORS = {
  RED: "#D62828",
  BLACK: "#141414",
  PINK_ACCENT: "#FDECEC",
  WHITE: "#FFFFFF",
};

export const URLS = {
  MY_20FIT: "https://my.20fit.id",
  SIGN_UP: "https://my.20fit.id/signup",
  LOGIN: "https://my.20fit.id/login",
  MENU: "https://menu.20fit.id",
  MCU: "https://medicalcheckup.20fit.id",
};

export const API = {
  AUTH_ME: "/api/auth/me",
  SCAN_UPLOAD: "/api/scan/upload",
  SCAN_HISTORY: "/api/scan/history",
  SCAN_SAVE: "/api/scan/save",
  SCAN_DELETE: "/api/scan/delete",
};

export const SCAN_LIMITS = {
  ANONYMOUS_LIMIT: 5,
  FILE_SIZE_MB: 5,
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
};

export const SUBDOMAINS = [
  {
    name: "Scan Kalori",
    icon: "🥗",
    url: "https://calories.20fit.id",
    key: "calories",
  },
  {
    name: "Menu Diet",
    icon: "🍽️",
    url: "https://menu.20fit.id",
    key: "menu",
  },
  {
    name: "Panduan MCU",
    icon: "📋",
    url: "https://medicalcheckup.20fit.id",
    key: "mcu",
  },
  {
    name: "My 20FIT",
    icon: "🎯",
    url: URLS.MY_20FIT,
    key: "my20fit",
  },
];
EOF

echo -e "${GREEN}✓ Created constants.ts${NC}"

# Create src/lib/api.ts
cat > src/lib/api.ts << 'EOF'
import { API } from "./constants";

interface ScanResult {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string;
  food_name: string;
  created_at: string;
}

interface ScanHistoryItem {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string;
  created_at: string;
}

interface AuthData {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  isAuthenticated: boolean;
}

export const apiClient = {
  async getMe(): Promise<AuthData> {
    const response = await fetch(API.AUTH_ME, { credentials: "include" });
    if (!response.ok) {
      return { isAuthenticated: false } as AuthData;
    }
    return response.json();
  },

  async uploadScan(file: File): Promise<ScanResult> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(API.SCAN_UPLOAD, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!response.ok) throw new Error("Failed to upload scan");
    return response.json();
  },

  async getScanHistory(limit: number = 20, offset: number = 0, dateFrom?: string, dateTo?: string) {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);
    const response = await fetch(`${API.SCAN_HISTORY}?${params}`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to fetch history");
    return response.json();
  },

  async saveScan(scanId: string) {
    const response = await fetch(API.SCAN_SAVE, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scan_id: scanId }),
    });
    if (!response.ok) throw new Error("Failed to save scan");
    return response.json();
  },

  async deleteScan(scanId: string) {
    const response = await fetch(`${API.SCAN_DELETE}/${scanId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to delete scan");
    return response.json();
  },
};
EOF

echo -e "${GREEN}✓ Created api.ts${NC}"

# Create src/hooks/useAuth.ts
cat > src/hooks/useAuth.ts << 'EOF'
import { useEffect, useState } from "react";
import { apiClient } from "../lib/api";

interface AuthData {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [auth, setAuth] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const data = await apiClient.getMe();
        setAuth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch auth");
        setAuth({ isAuthenticated: false } as AuthData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuth();
  }, []);

  return {
    auth,
    isLoading,
    error,
    isAuthenticated: auth?.isAuthenticated ?? false,
    user: auth?.isAuthenticated ? auth : null,
  };
};
EOF

echo -e "${GREEN}✓ Created useAuth.ts${NC}"

# Create src/hooks/useScanState.ts
cat > src/hooks/useScanState.ts << 'EOF'
import { useState, useEffect } from "react";
import { SCAN_LIMITS } from "../lib/constants";

interface ScanResult {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string;
  food_name: string;
  created_at: string;
}

export const useScanState = (isAuthenticated: boolean) => {
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      const stored = localStorage.getItem("anon_scan_count");
      setScanCount(stored ? parseInt(stored) : 0);
    }
  }, [isAuthenticated]);

  const canScan = isAuthenticated || scanCount < SCAN_LIMITS.ANONYMOUS_LIMIT;

  const handleScanSuccess = (result: ScanResult) => {
    setCurrentScan(result);
    if (!isAuthenticated) {
      const newCount = scanCount + 1;
      setScanCount(newCount);
      localStorage.setItem("anon_scan_count", newCount.toString());
    }
    setError(null);
  };

  const handleScanError = (errorMessage: string) => {
    setError(errorMessage);
    setCurrentScan(null);
  };

  const resetScan = () => {
    setCurrentScan(null);
    setError(null);
  };

  const shouldBlur = !isAuthenticated && currentScan;

  return {
    currentScan,
    scanCount,
    isLoading,
    error,
    canScan,
    shouldBlur,
    quotaRemaining: Math.max(0, SCAN_LIMITS.ANONYMOUS_LIMIT - scanCount),
    quotaExhausted: !isAuthenticated && scanCount >= SCAN_LIMITS.ANONYMOUS_LIMIT,
    setIsLoading,
    handleScanSuccess,
    handleScanError,
    resetScan,
  };
};
EOF

echo -e "${GREEN}✓ Created useScanState.ts${NC}"

# Create src/components/Header.tsx
cat > src/components/Header.tsx << 'EOF'
import { useState } from "react";
import { COLORS, SUBDOMAINS, URLS } from "../lib/constants";
import { AuthStatus } from "./AuthStatus";
import { AppSwitcher } from "./AppSwitcher";

interface HeaderProps {
  subdomainKey: string;
  isAuthenticated: boolean;
  userName?: string;
  userAvatar?: string;
}

export const Header = ({
  subdomainKey,
  isAuthenticated,
  userName,
  userAvatar,
}: HeaderProps) => {
  const [showSwitcher, setShowSwitcher] = useState(false);
  const currentSubdomain = SUBDOMAINS.find((s) => s.key === subdomainKey);

  return (
    <header className="sticky top-0 z-50 border-b" style={{ borderColor: "#E8E8E8" }}>
      <div className="px-4 py-3 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href={URLS.MY_20FIT} className="text-2xl font-anton uppercase font-bold" style={{ color: COLORS.RED }}>
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
EOF

echo -e "${GREEN}✓ Created Header.tsx${NC}"

# Create src/components/AppSwitcher.tsx
cat > src/components/AppSwitcher.tsx << 'EOF'
import { SUBDOMAINS, COLORS } from "../lib/constants";

interface AppSwitcherProps {
  currentKey: string;
}

export const AppSwitcher = ({ currentKey }: AppSwitcherProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      {SUBDOMAINS.map((subdomain) => {
        const isActive = subdomain.key === currentKey;
        return (
          <a
            key={subdomain.key}
            href={subdomain.url}
            className="p-3 rounded-lg text-center transition-all hover:bg-gray-100"
            style={{ backgroundColor: isActive ? "#FDECEC" : "transparent" }}
          >
            <div className="text-2xl mb-1">{subdomain.icon}</div>
            <div className="text-xs font-semibold" style={{ color: isActive ? COLORS.RED : "#606060" }}>
              {subdomain.name}
            </div>
          </a>
        );
      })}
    </div>
  );
};
EOF

echo -e "${GREEN}✓ Created AppSwitcher.tsx${NC}"

# Create src/components/AuthStatus.tsx
cat > src/components/AuthStatus.tsx << 'EOF'
import { useState } from "react";
import { COLORS, URLS } from "../lib/constants";

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
            <div className="text-sm font-semibold">{userName}</div>
            <div className="text-xs text-gray-600">Member 20FIT</div>
          </div>
          <div className="p-2">
            <a href={`${URLS.MY_20FIT}/profile`} className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100">
              Profil
            </a>
            <a href={`${URLS.MY_20FIT}/settings`} className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-100">
              Pengaturan
            </a>
          </div>
          <div className="p-2 border-t" style={{ borderColor: "#E8E8E8" }}>
            <a href={`${URLS.MY_20FIT}/logout`} className="block px-3 py-2 text-sm rounded-lg hover:bg-red-50" style={{ color: COLORS.RED }}>
              Keluar
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
EOF

echo -e "${GREEN}✓ Created AuthStatus.tsx${NC}"

# Create src/components/CTA.tsx
cat > src/components/CTA.tsx << 'EOF'
import { COLORS, URLS } from "../lib/constants";

interface CTACompactProps {
  isQuotaExhausted?: boolean;
}

export const CTACompact = ({ isQuotaExhausted = false }: CTACompactProps) => {
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.RED }}>
      <div className="text-white">
        <h3 className="font-semibold mb-1">{isQuotaExhausted ? "Kuota Scan Sudah Habis" : "Simpan Hasil Scan?"}</h3>
        <p className="text-sm mb-3 opacity-90">{isQuotaExhausted ? "Daftar untuk scan tanpa batas" : "Riwayat lengkap + lihat tren kalori"}</p>
      </div>
      <a href={URLS.SIGN_UP} className="block text-center py-2 px-4 bg-white rounded-lg font-semibold transition-opacity hover:opacity-90" style={{ color: COLORS.RED }}>
        Daftar Gratis
      </a>
    </div>
  );
};

interface CTAFullProps {
  isQuotaExhausted?: boolean;
}

export const CTAFull = ({ isQuotaExhausted = false }: CTAFullProps) => {
  return (
    <div className="rounded-lg p-6 md:p-8" style={{ backgroundColor: COLORS.PINK_ACCENT }}>
      <h2 className="font-anton text-2xl md:text-3xl uppercase mb-4" style={{ color: COLORS.BLACK }}>
        {isQuotaExhausted ? "Jangan Sampai Hilang" : "Simpan Riwayat Scan Kamu"}
      </h2>
      <ul className="mb-6 space-y-3">
        {!isQuotaExhausted && (
          <>
            <li className="flex gap-3 items-start">
              <span className="text-lg">✓</span>
              <span className="text-sm">Simpan riwayat scan permanen di akun kamu</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-lg">✓</span>
              <span className="text-sm">Lihat tren kalori & nutrisi antar hari</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-lg">✓</span>
              <span className="text-sm">Sinkronkan dengan data 20FIT lainnya</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="text-lg">✓</span>
              <span className="text-sm">Scan tanpa batas (tidak ada kuota)</span>
            </li>
          </>
        )}
        {isQuotaExhausted && (
          <>
            <li className="text-sm">Kamu sudah mencapai batas 5 scan gratis. Daftar untuk melanjutkan.</li>
            <li className="text-sm text-gray-600">Data scan anonim akan disimpan ketika kamu membuat akun.</li>
          </>
        )}
      </ul>
      <div className="flex flex-col sm:flex-row gap-3">
        <a href={URLS.SIGN_UP} className="flex-1 text-center py-3 px-4 rounded-lg font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.RED }}>
          Daftar Gratis
        </a>
        <a href={URLS.MY_20FIT} className="flex-1 text-center py-3 px-4 rounded-lg font-semibold border transition-colors hover:bg-gray-100" style={{ color: COLORS.BLACK, borderColor: COLORS.BLACK }}>
          Buka My 20FIT
        </a>
      </div>
    </div>
  );
};
EOF

echo -e "${GREEN}✓ Created CTA.tsx${NC}"

# Create src/pages/ScanPage.tsx
cat > src/pages/ScanPage.tsx << 'EOF'
import { useRef, useState } from "react";
import { COLORS, SCAN_LIMITS, URLS } from "../lib/constants";
import { apiClient } from "../lib/api";
import { CTACompact, CTAFull } from "../components/CTA";
import { useAuth } from "../hooks/useAuth";
import { useScanState } from "../hooks/useScanState";

interface ScanResult {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string;
  food_name: string;
  created_at: string;
}

export const ScanPage = () => {
  const { isAuthenticated } = useAuth();
  const { currentScan, isLoading, error, canScan, shouldBlur, quotaRemaining, quotaExhausted, setIsLoading, handleScanSuccess, handleScanError, resetScan } = useScanState(isAuthenticated);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (!canScan) {
      handleScanError("Kuota scan sudah habis");
      return;
    }

    if (!SCAN_LIMITS.ALLOWED_TYPES.includes(file.type)) {
      handleScanError("Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.");
      return;
    }

    if (file.size > SCAN_LIMITS.FILE_SIZE_MB * 1024 * 1024) {
      handleScanError(`Ukuran foto terlalu besar. Maksimal ${SCAN_LIMITS.FILE_SIZE_MB}MB.`);
      return;
    }

    setIsLoading(true);

    try {
      const result = await apiClient.uploadScan(file);
      handleScanSuccess(result);
    } catch (err) {
      handleScanError(err instanceof Error ? err.message : "Gagal menganalisis foto");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  if (!currentScan && !isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className="border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all mb-6" style={{ borderColor: COLORS.RED, backgroundColor: dragActive ? COLORS.PINK_ACCENT : "transparent" }} onClick={() => fileInputRef.current?.click()}>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileInput} className="hidden" />
          <div className="text-5xl mb-4">📷</div>
          <h2 className="font-anton text-2xl uppercase mb-2">Scan Foto Makanan</h2>
          <p className="text-gray-600 mb-2">Ambil foto makanan kamu atau unggah dari galeri</p>
          <p className="text-xs text-gray-500">Format: JPG, PNG, WebP • Max: 5MB</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="font-semibold mb-3">Cara Kerja</h3>
          <ol className="space-y-2 text-sm">
            <li><span className="font-semibold">1. Upload foto</span> - Ambil dari kamera atau galeri</li>
            <li><span className="font-semibold">2. AI analisis</span> - Identifikasi makanan dalam 3 detik</li>
            <li><span className="font-semibold">3. Lihat hasil</span> - Kalori, protein, karbo, lemak</li>
          </ol>
        </div>

        <div className="text-center text-xs text-gray-600">
          {isAuthenticated ? (
            <>
              <p>Hasil scan disimpan otomatis di akun kamu.</p>
              <p>Tidak ada batasan jumlah scan.</p>
            </>
          ) : (
            <>
              <p>Scan hingga 5 kali tanpa daftar.</p>
              <p>Data scan tidak disimpan permanen.</p>
            </>
          )}
        </div>

        {!isAuthenticated && (
          <div className="mt-6 text-center">
            <div className="inline-block">
              <div className="text-sm font-semibold mb-2">Kuota Scan Anda</div>
              <div className="flex gap-1">
                {Array.from({ length: SCAN_LIMITS.ANONYMOUS_LIMIT }).map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: i < quotaRemaining ? COLORS.RED : "#DCDCDC" }}>
                    {i + 1}
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-600 mt-2">{quotaRemaining} dari {SCAN_LIMITS.ANONYMOUS_LIMIT} scan tersisa</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="mb-4">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: COLORS.RED, borderTopColor: "transparent" }}></div>
          </div>
        </div>
        <h2 className="font-anton text-xl uppercase mb-2">Menganalisis Foto</h2>
        <p className="text-gray-600">Biasanya selesai dalam 3–5 detik</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-lg p-6 border" style={{ borderColor: "#FFD1D1", backgroundColor: "#FFE6E6" }}>
          <h2 className="font-semibold mb-2" style={{ color: "#D62828" }}>⚠️ Gagal Menganalisis</h2>
          <p className="text-sm mb-4">{error}</p>
          <button onClick={resetScan} className="px-4 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: COLORS.RED }}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (currentScan) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 rounded-xl overflow-hidden">
          {shouldBlur ? (
            <div className="w-full h-64 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 animate-shimmer rounded-xl" />
          ) : (
            <img src={currentScan.image_url} alt={currentScan.food_name} className="w-full h-64 object-cover" />
          )}
        </div>

        <h2 className="font-anton text-2xl uppercase mb-6">{currentScan.food_name}</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Kalori", value: currentScan.calories, unit: "kcal" },
            { label: "Protein", value: currentScan.protein, unit: "g" },
            { label: "Karbo", value: currentScan.carbs, unit: "g" },
            { label: "Lemak", value: currentScan.fat, unit: "g" },
          ].map((nutrient) => (
            <div key={nutrient.label} className="rounded-lg p-4 text-center" style={{ backgroundColor: COLORS.PINK_ACCENT }}>
              {shouldBlur ? (
                <>
                  <div className="h-6 bg-gray-300 rounded mb-2 animate-pulse"></div>
                  <div className="text-xs text-gray-600">{nutrient.label}</div>
                </>
              ) : (
                <>
                  <div className="font-semibold text-lg">{nutrient.value}</div>
                  <div className="text-xs text-gray-600">{nutrient.label}</div>
                  <div className="text-xs text-gray-500">{nutrient.unit}</div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-gray-600 mb-6 p-3 bg-gray-50 rounded-lg">
          ⚠️ Ini estimasi, bukan pengukuran akurat. Untuk keputusan kesehatan, konsultasikan dengan ahli gizi.
        </div>

        {!isAuthenticated && <CTACompact />}

        <div className="mt-6 flex gap-3">
          <button onClick={resetScan} className="flex-1 py-3 px-4 rounded-lg font-semibold border transition-colors hover:bg-gray-100" style={{ color: COLORS.BLACK, borderColor: "#DCDCDC" }}>
            Scan Lagi
          </button>
          {isAuthenticated && (
            <button className="flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.RED }}>
              Simpan Scan
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
EOF

echo -e "${GREEN}✓ Created ScanPage.tsx${NC}"

# Create src/pages/HistoryPage.tsx
cat > src/pages/HistoryPage.tsx << 'EOF'
import { useState, useEffect } from "react";
import { COLORS } from "../lib/constants";
import { apiClient } from "../lib/api";
import { CTAFull } from "../components/CTA";
import { useAuth } from "../hooks/useAuth";

interface ScanHistoryItem {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string;
  created_at: string;
}

export const HistoryPage = () => {
  const { isAuthenticated } = useAuth();
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getScanHistory();
      setHistory(data.items);
    } catch (err) {
      setError("Gagal memuat riwayat");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="font-anton text-2xl uppercase mb-2">Riwayat Scan</h2>
          <p className="text-gray-600">Riwayat scan hanya tersedia untuk member</p>
        </div>
        <CTAFull />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="w-12 h-12 border-4 rounded-full animate-spin inline-block" style={{ borderColor: COLORS.RED, borderTopColor: "transparent" }}></div>
        <p className="mt-4 text-gray-600">Memuat riwayat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-lg p-6 border" style={{ borderColor: "#FFD1D1", backgroundColor: "#FFE6E6" }}>
          <p style={{ color: "#D62828" }}>{error}</p>
          <button onClick={fetchHistory} className="mt-4 px-4 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: COLORS.RED }}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">📭</div>
        <h2 className="font-anton text-2xl uppercase mb-2">Belum Ada Riwayat Scan</h2>
        <p className="text-gray-600">Mulai scan makanan untuk melihat riwayat di sini</p>
        <a href="/" className="inline-block mt-6 px-6 py-3 rounded-lg font-semibold text-white" style={{ backgroundColor: COLORS.RED }}>
          Mulai Scan
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="font-anton text-2xl uppercase mb-6">Riwayat Scan Kamu</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg p-4 text-center" style={{ backgroundColor: COLORS.PINK_ACCENT }}>
          <div className="font-bold text-xl">{history.length}</div>
          <div className="text-xs text-gray-600">Total Scan</div>
        </div>
        <div className="rounded-lg p-4 text-center" style={{ backgroundColor: COLORS.PINK_ACCENT }}>
          <div className="font-bold text-xl">{Math.round(history.reduce((sum, item) => sum + item.calories, 0) / history.length)}</div>
          <div className="text-xs text-gray-600">Rata-rata Kalori</div>
        </div>
        <div className="rounded-lg p-4 text-center" style={{ backgroundColor: COLORS.PINK_ACCENT }}>
          <div className="font-bold text-xl">{history.reduce((sum, item) => sum + item.calories, 0)}</div>
          <div className="text-xs text-gray-600">Total Kalori</div>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="flex gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow" style={{ borderColor: "#E8E8E8" }}>
            <img src={item.image_url} alt={item.food_name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold mb-1">{item.food_name}</h3>
              <p className="text-xs text-gray-600 mb-2">
                {new Date(item.created_at).toLocaleDateString("id-ID", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              <div className="flex gap-3 text-xs">
                <div><span className="font-semibold">{item.calories}</span><span className="text-gray-600"> kcal</span></div>
                <div><span className="font-semibold">{item.protein}</span><span className="text-gray-600"> g protein</span></div>
                <div><span className="font-semibold">{item.carbs}</span><span className="text-gray-600"> g carbo</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <a href="/" className="block text-center py-3 px-4 rounded-lg font-semibold text-white" style={{ backgroundColor: COLORS.RED }}>
          Scan Makanan Baru
        </a>
      </div>
    </div>
  );
};
EOF

echo -e "${GREEN}✓ Created HistoryPage.tsx${NC}"

# Create src/App.tsx
cat > src/App.tsx << 'EOF'
import { useState } from "react";
import { Header } from "./components/Header";
import { ScanPage } from "./pages/ScanPage";
import { HistoryPage } from "./pages/HistoryPage";
import { useAuth } from "./hooks/useAuth";

export function App() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<"scan" | "history">("scan");

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 rounded-full animate-spin border-t-transparent inline-block"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header subdomainKey="calories" isAuthenticated={isAuthenticated} userName={user?.name} userAvatar={user?.avatar_url} />

      {isAuthenticated && (
        <div className="md:hidden border-b" style={{ borderColor: "#E8E8E8" }}>
          <div className="flex max-w-6xl mx-auto">
            <button onClick={() => setCurrentPage("scan")} className="flex-1 py-3 font-semibold text-center transition-colors" style={{ borderBottomColor: currentPage === "scan" ? "#D62828" : "transparent", color: currentPage === "scan" ? "#D62828" : "#606060", borderBottomWidth: currentPage === "scan" ? "2px" : "0" }}>
              Scan
            </button>
            <button onClick={() => setCurrentPage("history")} className="flex-1 py-3 font-semibold text-center transition-colors" style={{ borderBottomColor: currentPage === "history" ? "#D62828" : "transparent", color: currentPage === "history" ? "#D62828" : "#606060", borderBottomWidth: currentPage === "history" ? "2px" : "0" }}>
              Riwayat
            </button>
          </div>
        </div>
      )}

      <main>
        {!isAuthenticated ? <ScanPage /> : currentPage === "scan" ? <ScanPage /> : <HistoryPage />}
      </main>

      <footer className="border-t py-6 px-4 text-center text-xs text-gray-600" style={{ borderColor: "#E8E8E8" }}>
        <p>© 2024 20FIT. Semua hak dilindungi.</p>
        <p className="mt-2">
          <a href="#" className="hover:underline">Kebijakan Privasi</a> • <a href="#" className="hover:underline">Syarat Layanan</a> • <a href="#" className="hover:underline">Hubungi Kami</a>
        </p>
      </footer>
    </div>
  );
}
EOF

echo -e "${GREEN}✓ Created App.tsx${NC}"

# Create src/main.tsx
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Create src/index.css
cat > src/index.css << 'EOF'
@import url("https://fonts.googleapis.com/css2?family=Anton:wght@400&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: "Arial", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: "Anton", sans-serif;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #d62828;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a71b1b;
}

.blur-content {
  background: linear-gradient(90deg, #ccc 0%, #ddd 50%, #ccc 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

button {
  font-family: inherit;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
}

a {
  text-decoration: none;
  color: inherit;
}

input:focus,
textarea:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(214, 40, 40, 0.1);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 640px) {
  body {
    font-size: 14px;
  }
}
EOF

echo -e "${GREEN}✓ Created index.css${NC}"

# Create README
cat > README.md << 'EOF'
# 🥗 Calories.20fit.id — Scan Kalori Subdomain

Subdomain publik 20FIT untuk scan foto makanan → estimasi kalori & nutrisi.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## 🔧 Setup

1. Copy `.env.example` ke `.env.local`
2. Edit URL backend di `.env.local`
3. Ensure backend `/api/scan/upload` endpoint ready

## 📁 Project Structure

- `src/components/` — Reusable components (Header, CTA, etc)
- `src/pages/` — Main pages (ScanPage, HistoryPage)
- `src/hooks/` — State management (useAuth, useScanState)
- `src/lib/` — API client & constants

## 📖 Features

✅ Blur logic (anon vs member)
✅ Quota system (5 scan untuk anon)
✅ History page (member only)
✅ Responsive design
✅ CTA for conversion

## 🎯 Next Steps

- Connect backend endpoints
- Test blur logic
- Deploy to production

Enjoy! 🚀
EOF

echo -e "${GREEN}✓ Created README.md${NC}"

# Done
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📦 Project created: $PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  1. cd $PROJECT_NAME"
echo "  2. npm install"
echo "  3. cp .env.example .env.local"
echo "  4. npm run dev"
echo ""
echo "🎉 Happy coding!"
