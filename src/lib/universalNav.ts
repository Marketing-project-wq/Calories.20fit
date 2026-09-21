// Config for the 20FIT ecosystem-wide "universal nav" app switcher — the
// same bar + mega menu every 20FIT subdomain shows so a member can jump
// straight to any other 20FIT product. Icons reuse this app's own Icon.tsx
// set, which already matches PROFILE20FIT's js/nav.js line-icon style (see
// that file's header comment) rather than importing raw SVG files.
import { IconName } from "../components/Icon";

export interface UniversalNavItem {
  id: string;
  label: string;
  description: string;
  icon: IconName;
  url: string;
  color: string;
}

export const UNIVERSAL_NAV_ITEMS: UniversalNavItem[] = [
  { id: "home", label: "Home", description: "Direktori Olahraga", icon: "home", url: "https://20fit.id", color: "#1a1a1a" },
  { id: "my20fit", label: "My 20FIT", description: "Member Portal", icon: "user", url: "https://my.20fit.id", color: "#6366F1" },
  { id: "recipe", label: "Recipe", description: "Menu & Resep Sehat", icon: "utensils", url: "https://recipe.20fit.id", color: "#16A34A" },
  { id: "calorie", label: "Calorie Tracker", description: "Hitung Kalori Harian", icon: "flame", url: "https://calorietracker.20fit.id", color: "#F97316" },
  { id: "mcu", label: "MCU Scanner", description: "Baca Hasil Medical Check-Up", icon: "medical", url: "https://medicalscanner.20fit.id", color: "#0EA5E9" },
  { id: "media", label: "Media", description: "Blog & Artikel", icon: "book", url: "https://media.20fit.id", color: "#8B5CF6" },
  { id: "workout", label: "Workout", description: "Streaming Latihan", icon: "dumbbell", url: "https://workout.20fit.id", color: "#EF4444" },
  { id: "photo", label: "Photo", description: "Foto Event", icon: "camera", url: "https://photo.20fit.id", color: "#EC4899" },
  { id: "ticket", label: "Ticket", description: "Tiket & Booking", icon: "ticket", url: "https://ticket.20fit.id", color: "#14B8A6" },
  { id: "talent", label: "Talent", description: "Talent & Event Organizer", icon: "users", url: "https://talent.20fit.id", color: "#3B82F6" },
];

const HOST_MAP: Record<string, string> = {
  "20fit.id": "home",
  "www.20fit.id": "home",
  "my.20fit.id": "my20fit",
  "recipe.20fit.id": "recipe",
  "recepie.20fit.id": "recipe", // pre-existing typo domain, still live
  "calorietracker.20fit.id": "calorie",
  "medicalscanner.20fit.id": "mcu",
  "media.20fit.id": "media",
  "workout.20fit.id": "workout",
  "photo.20fit.id": "photo",
  "ticket.20fit.id": "ticket",
  "talent.20fit.id": "talent",
};

/** Which UNIVERSAL_NAV_ITEMS id matches the current hostname, or null off-ecosystem (e.g. local dev). */
export function getCurrentAppId(): string | null {
  return HOST_MAP[window.location.hostname] ?? null;
}
