// Tiny event bus so the nav bar's two dropdowns (UniversalNav's app
// switcher, AuthNav's account menu) never show open at once — opening one
// closes the other. A plain DOM CustomEvent, same "dispatch + addEventListener"
// idiom src/lib/router.tsx already uses for ct:navigate, rather than lifting
// open/close state into App.tsx for two otherwise-independent components.
const DROPDOWN_EVENT = "ct:dropdown-open";

/** Call when a dropdown opens, so any other open one closes itself. */
export function announceDropdownOpen(id: string): void {
  window.dispatchEvent(new CustomEvent<string>(DROPDOWN_EVENT, { detail: id }));
}

/** Subscribe to other dropdowns opening; `onOtherOpen` fires unless `id` is the one that opened. */
export function onOtherDropdownOpen(id: string, onOtherOpen: () => void): () => void {
  const handler = (e: Event) => {
    const openedId = (e as CustomEvent<string>).detail;
    if (openedId !== id) onOtherOpen();
  };
  window.addEventListener(DROPDOWN_EVENT, handler);
  return () => window.removeEventListener(DROPDOWN_EVENT, handler);
}
