import { useState } from "react";
import { COLORS } from "./lib/constants";
import { t, Lang } from "./lib/i18n";
import { ScanPage } from "./pages/ScanPage";
import { HistoryPage } from "./pages/HistoryPage";
import { InsightPage } from "./pages/InsightPage";

type Page = "scan" | "history" | "insight";

export function App() {
  const [page, setPage] = useState<Page>("scan");
  const [lang, setLang] = useState<Lang>("id");
  const tr = t[lang];

  const TABS: { key: Page; label: string }[] = [
    { key: "scan", label: tr.tabScan },
    { key: "history", label: tr.tabHistory },
    { key: "insight", label: tr.tabInsight },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#FFFFFF" }}>
      {/* Tab nav + lang toggle */}
      <div style={{ borderBottom: "2px solid #141414", background: "#FFFFFF", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex" }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setPage(tab.key)}
                className="sc-tab"
                style={{
                  padding: "12px 16px",
                  fontFamily: "Barlow Condensed, sans-serif",
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

          {/* Language toggle */}
          <div style={{ display: "flex", background: "#F4F2F0", borderRadius: 8, padding: 3, gap: 2 }}>
            {(["id", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: "4px 10px",
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontSize: "11px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: 6,
                  border: "none",
                  background: lang === l ? "#141414" : "transparent",
                  color: lang === l ? "#FFFFFF" : "#8A8A8A",
                  cursor: "pointer",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main>
        {page === "scan" && <ScanPage lang={lang} />}
        {page === "history" && <HistoryPage />}
        {page === "insight" && <InsightPage />}
      </main>
    </div>
  );
}
