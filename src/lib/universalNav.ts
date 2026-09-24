// Config for the 20FIT ecosystem-wide "universal nav" app switcher — the
// same bar + mega menu every 20FIT subdomain shows so a member can jump
// straight to any other 20FIT product. Icons are matched 1:1 against the
// live "Products" switcher on my.20fit.id/profile20fit: most items use the
// brand's own full-color SVG set (public/icons/, uploaded straight from
// Figma) via iconSrc; Talent has no custom art there either (just a plain
// outline person), so it's left on the Icon.tsx fallback on purpose.
//
// `group` mirrors that same reference menu's own section headers (ALL 20FIT
// PRODUCTS / HEALTH / ACTIVITY / EVENT / BOOKING) — read from its actual
// source (PROFILE20FIT repo, dashboard.html's GROUPS array) rather than
// guessed, since these are real, clickable production links. One item from
// that reference, "Body Scan", is intentionally left out: nothing in that
// repo defines a real route for it, and this menu should never link
// somewhere unverified.
import { IconName } from "../components/Icon";
import { MY20FIT } from "./constants";
import { Lang } from "./i18n";

export type UniversalNavGroup = "products" | "health" | "activity" | "event" | "booking";

export interface UniversalNavItem {
  id: string;
  label: string;
  description: string;
  icon: IconName;
  iconSrc?: string;
  url: string;
  color: string;
  group: UniversalNavGroup;
}

export const UNIVERSAL_NAV_GROUP_LABELS: Record<Lang, Record<UniversalNavGroup, string>> = {
  id: {
    products: "Semua Produk 20FIT",
    health: "Kesehatan",
    activity: "Aktivitas",
    event: "Event",
    booking: "Booking",
  },
  en: {
    products: "All 20FIT Products",
    health: "Health",
    activity: "Activity",
    event: "Event",
    booking: "Booking",
  },
};

export const UNIVERSAL_NAV_ITEMS: UniversalNavItem[] = [
  { id: "home", label: "Home", description: "Direktori Olahraga", icon: "home", iconSrc: "/icons/footer-home.svg", url: "https://20fit.id", color: "#1a1a1a", group: "products" },
  { id: "my20fit", label: "My 20FIT", description: "Member Portal", icon: "user", iconSrc: "/icons/footer-account.svg", url: "https://my.20fit.id", color: "#6366F1", group: "products" },
  { id: "recipe", label: "Recipe", description: "Menu & Resep Sehat", icon: "utensils", iconSrc: "/icons/menu-food.svg", url: "https://recipe.20fit.id", color: "#16A34A", group: "products" },

  { id: "calorie", label: "Calorie Tracker", description: "Hitung Kalori Harian", icon: "flame", iconSrc: "/icons/footer-calorie.svg", url: "https://calorietracker.20fit.id", color: "#F97316", group: "health" },
  { id: "mcu", label: "MCU Scanner", description: "Baca Hasil Medical Check-Up", icon: "medical", iconSrc: "/icons/menu-medical-checkup.svg", url: "https://medicalscanner.20fit.id", color: "#0EA5E9", group: "health" },

  { id: "workout", label: "Workout", description: "Streaming Latihan", icon: "dumbbell", iconSrc: "/icons/vector-20fit-gym.svg", url: "https://workout.20fit.id", color: "#EF4444", group: "activity" },
  { id: "progress", label: "Progress", description: "Berat & BMI", icon: "chart", iconSrc: "/icons/footer-activity.svg", url: `${MY20FIT}/progress`, color: "#EF4444", group: "activity" },
  { id: "media", label: "Media", description: "Blog & Artikel", icon: "book", iconSrc: "/icons/vector-20fit-media.svg", url: "https://media.20fit.id", color: "#8B5CF6", group: "activity" },

  { id: "photo", label: "Photo", description: "Foto Event", icon: "camera", iconSrc: "/icons/vector-20fit-photo.svg", url: "https://photo.20fit.id", color: "#EC4899", group: "event" },
  { id: "ticket", label: "Ticket", description: "Tiket & Booking", icon: "ticket", iconSrc: "/icons/vector-20fit-event.svg", url: "https://ticket.20fit.id", color: "#14B8A6", group: "event" },
  { id: "talent", label: "Talent", description: "Talent & Event Organizer", icon: "users", url: "https://talent.20fit.id", color: "#3B82F6", group: "event" },

  { id: "book-class", label: "Book Class", description: "Arena · Gym", icon: "dumbbell", iconSrc: "/icons/menu-class-activity.svg", url: `${MY20FIT}/classes`, color: "#C41101", group: "booking" },
  { id: "book-coach", label: "Book Coach", description: "Arena · Gym", icon: "user", iconSrc: "/icons/menu-coach.svg", url: `${MY20FIT}/book-coach`, color: "#C41101", group: "booking" },
  { id: "book-doctor", label: "Book Doctor", description: "Konsultasi · Klinik", icon: "medical", iconSrc: "/icons/menu-doctor.svg", url: `${MY20FIT}/book-doctor`, color: "#C41101", group: "booking" },
  { id: "book-recovery", label: "Book Recovery", description: "Fisio · Massage", icon: "medical", iconSrc: "/icons/menu-recovery.svg", url: `${MY20FIT}/classes?venue=clinic`, color: "#C41101", group: "booking" },
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
