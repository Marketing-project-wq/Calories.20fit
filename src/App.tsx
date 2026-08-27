import { useState } from "react";
import { COLORS } from "./lib/constants";
import { ScanPage } from "./pages/ScanPage";
import { HistoryPage } from "./pages/HistoryPage";
import { InsightPage } from "./pages/InsightPage";
import { useAuth } from "./hooks/useAuth";

type Page = "scan" | "history" | "insight";

const TABS: { key: Page; label: string }[] = [
  { key: "scan", label: "Scan Kalori" },
  { key: "history", label: "Riwayat" },
  { key: "insight", label: "Insight" },
];

export function App() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState<Page>("scan");

  return (
    <div className="min-h-screen" style={{ background: "#EFEDEA" }}>
      {/* Tab nav */}
      <div style={{ borderBottom: "2px solid #141414", background: "#FFFFFF", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="flex max-w-2xl mx-auto px-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setPage(tab.key)}
              style={{
                padding: "12px 16px",
                fontFamily: "Anton, sans-serif",
                fontSize: "13px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                borderBottom: page === tab.key ? `2px solid ${COLORS.RED}` : "2px solid transparent",
                color: page === tab.key ? COLORS.RED : "#6A6A6A",
                marginBottom: "-2px",
                background: "none",
                cursor: "pointer",
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

      <footer style={{ borderTop: "1px solid #D8D6D2", padding: "24px 16px", textAlign: "center", fontSize: "12px", color: "#8A8A8A" }}>
        <p>© 2024 20FIT. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
}
