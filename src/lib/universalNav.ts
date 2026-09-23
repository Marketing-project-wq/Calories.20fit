// Config for the 20FIT ecosystem-wide "universal nav" app switcher — the
// same bar + mega menu every 20FIT subdomain shows so a member can jump
// straight to any other 20FIT product. Icons are matched 1:1 against the
// live "Products" switcher on my.20fit.id/profile20fit: most items use the
// brand's own full-color SVG set (public/icons/, uploaded straight from
// Figma) via iconSrc; Talent has no custom art there either (just a plain
// outline person), so it's left on the Icon.tsx fallback on purpose.
import { IconName } from "../components/Icon";

export interface UniversalNavItem {
  id: string;
  label: string;
  description: string;
  icon: IconName;
  iconSrc?: string;
  url: string;
  color: string;
}

export const UNIVERSAL_NAV_ITEMS: UniversalNavItem[] = [
  { id: "home", label: "Home", description: "Direktori Olahraga", icon: "home", iconSrc: "/icons/footer-home.svg", url: "https://20fit.id", color: "#1a1a1a" },
  { id: "my20fit", label: "My 20FIT", description: "Member Portal", icon: "user", iconSrc: "/icons/footer-account.svg", url: "https://my.20fit.id", color: "#6366F1" },
  { id: "recipe", label: "Recipe", description: "Menu & Resep Sehat", icon: "utensils", iconSrc: "/icons/menu-food.svg", url: "https://recipe.20fit.id", color: "#16A34A" },
  { id: "calorie", label: "Calorie Tracker", description: "Hitung Kalori Harian", icon: "flame", iconSrc: "/icons/footer-calorie.svg", url: "https://calorietracker.20fit.id", color: "#F97316" },
  { id: "mcu", label: "MCU Scanner", description: "Baca Hasil Medical Check-Up", icon: "medical", iconSrc: "/icons/menu-medical-checkup.svg", url: "https://medicalscanner.20fit.id", color: "#0EA5E9" },
  { id: "media", label: "Media", description: "Blog & Artikel", icon: "book", iconSrc: "/icons/vector-20fit-media.svg", url: "https://media.20fit.id", color: "#8B5CF6" },
  { id: "workout", label: "Workout", description: "Streaming Latihan", icon: "dumbbell", iconSrc: "/icons/vector-20fit-gym.svg", url: "https://workout.20fit.id", color: "#EF4444" },
  { id: "photo", label: "Photo", description: "Foto Event", icon: "camera", iconSrc: "/icons/vector-20fit-photo.svg", url: "https://photo.20fit.id", color: "#EC4899" },
  { id: "ticket", label: "Ticket", description: "Tiket & Booking", icon: "ticket", iconSrc: "/icons/vector-20fit-event.svg", url: "https://ticket.20fit.id", color: "#14B8A6" },
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
