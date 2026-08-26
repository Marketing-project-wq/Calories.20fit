import { useState } from "react";
import { COLORS } from "./lib/constants";
import { Header } from "./components/Header";
import { ScanPage } from "./pages/ScanPage";
import { HistoryPage } from "./pages/HistoryPage";
import { InsightPage } from "./pages/InsightPage";
import { useAuth } from "./hooks/useAuth";

type Page = "scan" | "history" | "insight";

const TABS: { key: Page; label: string }[] = [
  { key: "scan", label: "Scan" },
  { key: "history", label: "Riwayat" },
  { key: "insight", label: "Insight" },
];

export function App() {
  const { user, isAuthenticated } = useAuth();
  const [page, setPage] = useState<Page>("scan");

  return (
    <div className="min-h-screen bg-white">
      <Header subdomainKey="calories" isAuthenticated={isAuthenticated} user={user} />

      <div className="border-b" style={{ borderColor: "#E8E8E8" }}>
        <div className="flex max-w-6xl mx-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPage(tab.key)}
              className="flex-1 py-3 font-semibold text-center transition-colors"
              style={{
                borderBottomColor: page === tab.key ? COLORS.RED : "transparent",
                color: page === tab.key ? COLORS.RED : "#606060",
                borderBottomWidth: page === tab.key ? "2px" : "0",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main>
        {page === "scan" && <ScanPage />}
        {page === "history" && <HistoryPage />}
        {page === "insight" && <InsightPage />}
      </main>

      <footer className="border-t py-6 px-4 text-center text-xs text-gray-600" style={{ borderColor: "#E8E8E8" }}>
        <p>© 2024 20FIT. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
}
