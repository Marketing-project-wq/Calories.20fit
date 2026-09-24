// Light / dark theme: a tiny React context that mirrors the my.20fit.id
// convention — `data-theme` attribute on <html> + localStorage["theme"]. The
// actual colours live as semantic CSS variables in index.css (light values on
// :root, dark values under :root[data-theme="dark"]); flipping the attribute
// swaps every surface at once. The first-paint flash is avoided by a synchronous
// inline script in index.html that sets the attribute before this bundle runs —
// this provider just keeps it in sync with React state and persistence.
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "light" | "dark";

// Brand logo art (light = dark wordmark for light backgrounds; dark = white
// wordmark for dark backgrounds). Swapped in the nav by the active theme.
export const LOGO: Record<Theme, string> = {
  light: "https://media.20fit.id/wp-content/uploads/2026/05/Logo-20fit.png",
  dark: "https://media.20fit.id/wp-content/uploads/2026/07/Copy-of-new-logo-20fit-putih-3.png",
};

const STORAGE_KEY = "theme";

export function readInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* private mode / blocked storage — fall through */
  }
  try {
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {
    /* no matchMedia — fall through */
  }
  return "light";
}

function applyTheme(theme: Theme) {
  try {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme; // native form controls / scrollbars follow
    // Matches --bg in index.css (light #EFEDEA / dark #131410) — the header
    // is now a floating translucent pill with margin around it (see
    // .ct-header-bar in App.tsx), not flush against the top edge, so it's
    // the PAGE background that's actually adjacent to the browser's own
    // chrome now, not the header's fill. Never brand red either way. Kept
    // in sync with the same two literals in index.html's pre-hydration
    // script.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#131410" : "#EFEDEA");
  } catch {
    /* SSR / no document — no-op */
  }
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
