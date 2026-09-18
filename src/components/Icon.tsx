// Minimalist line-icon set — replaces pictograph emoji everywhere in this app.
// Same visual language as PROFILE20FIT's js/nav.js icons: single-stroke,
// 24x24, currentColor (so it inherits whatever text color/size the caller
// sets), no fill. Plain typographic symbols (✓ ★ → ←) are left alone
// elsewhere in the app — they're already minimalist, not pictograph emoji.
import { CSSProperties } from "react";

export type IconName =
  | "lock"
  | "camera"
  | "chart"
  | "droplet"
  | "flame"
  | "tag"
  | "book"
  | "search"
  | "refresh"
  | "target"
  | "check-circle"
  | "document"
  | "inbox"
  | "wrench"
  | "flask"
  | "scale"
  | "dumbbell"
  | "leaf"
  | "utensils"
  | "bowl"
  | "box"
  | "egg"
  | "cup"
  | "apple"
  | "calculator"
  | "medical"
  | "lightbulb"
  | "user"
  | "drumstick"
  | "clock"
  | "sun"
  | "moon";

const PATHS: Record<IconName, JSX.Element> = {
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M7.5 11V7.5a4.5 4.5 0 0 1 9 0V11" />
    </>
  ),
  camera: (
    <>
      <path d="M21 19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l1.5-2h5L16 6h3a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  chart: (
    <>
      <line x1="5" y1="20" x2="5" y2="14" />
      <line x1="12" y1="20" x2="12" y2="6" />
      <line x1="19" y1="20" x2="19" y2="10" />
    </>
  ),
  droplet: <path d="M12 3c3.5 4 6.5 7.6 6.5 11a6.5 6.5 0 0 1-13 0C5.5 10.6 8.5 7 12 3z" />,
  flame: <path d="M12 3c.5 2.5-2.5 3.7-2.5 6.8a2.5 2.5 0 0 0 5 0c0-.9-.3-1.6-.7-2.3 1.7.9 3.2 2.6 3.2 5a5 5 0 0 1-10 0C7 8.5 11 6.5 12 3z" />,
  tag: (
    <>
      <path d="M12.5 3H5a2 2 0 0 0-2 2v7.5a2 2 0 0 0 .6 1.4l8.5 8.5a2 2 0 0 0 2.8 0l6-6a2 2 0 0 0 0-2.8l-8.4-8.6a2 2 0 0 0-1-.5z" />
      <circle cx="8" cy="8" r="1.4" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5C6 4.5 9 4 12 5.2V19c-3-1.2-6-.7-8 .3z" />
      <path d="M20 5.5C18 4.5 15 4 12 5.2V19c3-1.2 6-.7 8 .3z" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="19.5" y1="19.5" x2="15.3" y2="15.3" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 8a8 8 0 0 0-14.6-3.2M4 4v5h5" />
      <path d="M4 16a8 8 0 0 0 14.6 3.2M20 20v-5h-5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16.5 9" />
    </>
  ),
  document: (
    <>
      <path d="M6 2.5h9l4 4V21a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z" />
      <path d="M14.5 2.5V7h4.5" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 12h4.5l1.5 3h6l1.5-3H21" />
      <path d="M6 5h12l3 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7z" />
    </>
  ),
  wrench: <path d="M14.7 6.3a4 4 0 0 0-5.4 4.9L3 17.5l3 3 6.3-6.3a4 4 0 0 0 4.9-5.4l-2.8 2.8-2.5-.5-.5-2.5z" />,
  flask: (
    <>
      <path d="M9.5 2.5h5" />
      <path d="M10.5 2.5v6.3L5.8 18a2 2 0 0 0 1.8 2.9h8.8a2 2 0 0 0 1.8-2.9l-4.7-9.2V2.5" />
      <line x1="8" y1="15" x2="16" y2="15" />
    </>
  ),
  scale: (
    <>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="5" y1="7" x2="19" y2="7" />
      <path d="M5 7l-3 6a3 3 0 0 0 6 0z" />
      <path d="M19 7l-3 6a3 3 0 0 0 6 0z" />
    </>
  ),
  dumbbell: (
    <>
      <line x1="7" y1="12" x2="17" y2="12" />
      <rect x="2.5" y="9" width="3.5" height="6" rx="1" />
      <rect x="18" y="9" width="3.5" height="6" rx="1" />
      <rect x="6" y="10.5" width="2" height="3" />
      <rect x="16" y="10.5" width="2" height="3" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4c.6 8-4 15-15 15C4.2 10.6 11.4 4.6 20 4z" />
      <path d="M6 19c2-4 5.5-7.5 9.5-10" />
    </>
  ),
  utensils: (
    <>
      <path d="M6 2.5v7.5a2 2 0 0 0 4 0V2.5" />
      <line x1="8" y1="2.5" x2="8" y2="21.5" />
      <path d="M17.5 2.5c-1.4 1.2-2 3-2 5.2 0 2 .8 3.2 2 3.8v10" />
    </>
  ),
  bowl: (
    <>
      <path d="M3 11h18a9 8 0 0 1-18 0z" />
      <path d="M6.5 11c0-3 2.5-5.5 5.5-5.5" />
    </>
  ),
  box: (
    <>
      <path d="M3 8l9-4.5L21 8v8l-9 4.5L3 16z" />
      <path d="M3 8l9 4.5L21 8" />
      <line x1="12" y1="12.5" x2="12" y2="21" />
    </>
  ),
  egg: <path d="M12 2.5c4.5 5 6.5 9.7 6.5 13a6.5 6.5 0 0 1-13 0c0-3.3 2-8 6.5-13z" />,
  cup: (
    <>
      <path d="M6 3h11l-1 15a2 2 0 0 1-2 1.8h-5A2 2 0 0 1 7 18z" />
      <path d="M17 6.5h1.5a2.5 2.5 0 0 1 0 5H16.7" />
      <line x1="5" y1="3" x2="17" y2="3" />
    </>
  ),
  apple: (
    <>
      <path d="M12 8.2C10.2 6 6.8 6.3 5 8.5c-2.3 2.8-1.7 8.5 1.6 11.3 1.4 1.2 2.7 1.2 4 .6 1.1-.5 2.3-.5 3.4 0 1.3.6 2.6.6 4-.6 2.3-2 3.3-6 2.3-8.9-.8-2.3-3.2-3.7-5.4-2.9-.8.3-1.4.7-1.9 1.2z" />
      <path d="M12 8c0-1.8.9-3 2.4-3.6" />
    </>
  ),
  calculator: (
    <>
      <rect x="4.5" y="2.5" width="15" height="19" rx="2" />
      <line x1="7.5" y1="6.5" x2="16.5" y2="6.5" />
      <circle cx="7.8" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.2" cy="11.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="7.8" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.2" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="7.8" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.2" cy="19" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  medical: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6.5 6.5 0 0 0-3.8 11.8c.5.4.8 1 .8 1.7v.5h6v-.5c0-.7.3-1.3.8-1.7A6.5 6.5 0 0 0 12 3z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  drumstick: (
    <>
      <path d="M14.5 13.5a5 5 0 1 1 3-8.7c1.6 1.4 1.7 3.4.7 5.2l-6.7 11.6a1.7 1.7 0 0 1-2.9-1.7z" />
      <circle cx="15.3" cy="8.7" r="2.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2.5" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21.5" y2="12" />
      <line x1="5.2" y1="5.2" x2="6.9" y2="6.9" />
      <line x1="17.1" y1="17.1" x2="18.8" y2="18.8" />
      <line x1="5.2" y1="18.8" x2="6.9" y2="17.1" />
      <line x1="17.1" y1="6.9" x2="18.8" y2="5.2" />
    </>
  ),
  moon: <path d="M20 13.5A8 8 0 1 1 10.5 4a6.5 6.5 0 0 0 9.5 9.5z" />,
};

export function Icon({
  name,
  size = 18,
  color = "currentColor",
  strokeWidth = 1.8,
  style,
  className,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    >
      {PATHS[name]}
    </svg>
  );
}
