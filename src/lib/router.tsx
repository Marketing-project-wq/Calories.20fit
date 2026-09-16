// Tiny dependency-free client-side router (History API). The app is a Vite
// SPA served at the ROOT of calorietracker.20fit.id; the brief lists routes
// under /calories/* because that is the path on my.20fit.id (a different
// app). We serve them at the root here AND accept an optional "/calories"
// prefix so a /calories/scan link still resolves — see normalizePath.
//
// Production must serve index.html for every path (start script uses
// `serve -s`); `vite` dev + `vite preview` already do SPA history fallback
// by default (appType "spa"), so deep links and refresh work everywhere.
//
// Why not react-router: adds a dependency + bundle weight for what is a
// handful of static routes with one dynamic segment (/articles/:slug). A
// ~60-line router keeps the footprint tiny and the mental model obvious.
import { AnchorHTMLAttributes, MouseEvent, useEffect, useState } from "react";

// Optional prefix the app tolerates on every route (see file header).
const PREFIX = "/calories";

/** Strip the optional /calories prefix and any trailing slash. */
export function normalizePath(pathname: string): string {
  let p = pathname || "/";
  if (p === PREFIX || p.startsWith(PREFIX + "/")) {
    p = p.slice(PREFIX.length) || "/";
  }
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p || "/";
}

// popstate covers back/forward; pushState/replaceState do NOT emit an event,
// so navigate() dispatches this custom one to notify subscribers.
const NAV_EVENT = "ct:navigate";

export function navigate(to: string, opts: { replace?: boolean } = {}): void {
  const url = to.startsWith("/") ? to : "/" + to;
  if (opts.replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
  window.dispatchEvent(new Event(NAV_EVENT));
  window.scrollTo({ top: 0, behavior: "auto" });
}

/** Subscribe to the current (normalized) path. Re-renders on navigation. */
export function useLocation(): string {
  const [path, setPath] = useState<string>(() =>
    typeof location !== "undefined" ? normalizePath(location.pathname) : "/"
  );
  useEffect(() => {
    const onChange = () => setPath(normalizePath(location.pathname));
    window.addEventListener("popstate", onChange);
    window.addEventListener(NAV_EVENT, onChange);
    // Sync once on mount in case the path changed before the listener attached.
    onChange();
    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener(NAV_EVENT, onChange);
    };
  }, []);
  return path;
}

/**
 * Match a pattern like "/articles/:slug" against a concrete path. Returns the
 * captured params, or null if it does not match. Only single-segment params
 * are supported — that is all this app's route table needs.
 */
export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const pp = pattern.split("/").filter(Boolean);
  const sp = path.split("/").filter(Boolean);
  if (pp.length !== sp.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(":")) {
      params[pp[i].slice(1)] = decodeURIComponent(sp[i]);
    } else if (pp[i] !== sp[i]) {
      return null;
    }
  }
  return params;
}

/**
 * Internal link. Intercepts plain left-clicks for SPA navigation but lets the
 * browser handle modified clicks (new tab), middle-clicks, and any href that
 * is not an in-app path (external URLs, mailto:, #fragments) so those behave
 * like ordinary links.
 */
export function Link({
  href,
  onClick,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (!isInternal) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href);
  };
  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
