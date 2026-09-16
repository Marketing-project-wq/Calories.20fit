// Nutrition articles. Content is authored as Markdown in ./articles/<slug>.md
// and pulled in at build time via Vite's `?raw` import, so 2000-2500 word,
// fact-based bodies live as plain Markdown (easy to read/diff/edit) instead of
// escaped TypeScript template strings.
//
// WHY STATIC (not the brief's nutrition_articles Postgres table): this repo
// has no migration runner and no Supabase write access from CI — every schema
// change is applied by hand to production (see supabase/migrations/*.sql
// headers). Article copy is read-only reference content that never changes per
// user, so bundling it ships it instantly, works offline, and needs no DB
// round-trip. A matching nutrition_articles migration is provided under
// supabase/migrations for teams that later want it DB-backed; the app reads
// this bundle today.
import { Lang } from "../lib/i18n";

import memahamiKalori from "./articles/memahami-kalori-dan-makronutrien.md?raw";
import caraHitungKalori from "./articles/cara-hitung-kebutuhan-kalori-harian.md?raw";
import panduanIndonesia from "./articles/panduan-nutrisi-makanan-indonesia.md?raw";
import mitosDiet from "./articles/mitos-dan-fakta-diet-populer.md?raw";
import nutrisiOlahraga from "./articles/nutrisi-untuk-olahraga-dan-fitness.md?raw";
import turunBerat from "./articles/cara-sehat-turun-berat-badan.md?raw";

export type ArticleCategory =
  | "nutrition-basics"
  | "meal-planning"
  | "food-myths"
  | "diet-types"
  | "micronutrients"
  | "sports-nutrition"
  | "indonesian-food"
  | "weight-management";

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // markdown
  category: ArticleCategory;
  tags: string[];
  readTimeMinutes: number;
  isPremium: boolean; // true = full read needs an account
  sources: string[];
  author: string;
  disclaimer: string;
  coverEmoji: string;
  accent: string; // cover gradient accent
  publishedAt: string; // ISO date
}

const DEFAULT_DISCLAIMER =
  "Artikel ini bersifat edukatif dan informasional. Bukan pengganti konsultasi medis. Untuk kebutuhan diet spesifik, konsultasikan dengan ahli gizi atau dokter.";
const AUTHOR = "20fit Nutrition Team";

export const ARTICLES: Article[] = [
  {
    slug: "memahami-kalori-dan-makronutrien",
    title: "Memahami Kalori & Makronutrien: Panduan Lengkap untuk Pemula",
    excerpt:
      "Apa itu kalori sebenarnya, kenapa protein, karbohidrat, dan lemak penting, dan berapa kebutuhan harianmu — dijelaskan dari nol.",
    content: memahamiKalori,
    category: "nutrition-basics",
    tags: ["kalori", "makronutrien", "protein", "karbohidrat", "lemak", "dasar nutrisi"],
    readTimeMinutes: 10,
    isPremium: false,
    sources: [
      "WHO — Healthy diet fact sheet & nutrition guidelines",
      "Angka Kecukupan Gizi (AKG) — Permenkes RI No. 28 Tahun 2019",
      "Harvard T.H. Chan School of Public Health — The Nutrition Source",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverEmoji: "🍎",
    accent: "#22C55E",
    publishedAt: "2026-09-01",
  },
  {
    slug: "cara-hitung-kebutuhan-kalori-harian",
    title: "Cara Menghitung Kebutuhan Kalori Harian: TDEE, BMR, dan Defisit Kalori",
    excerpt:
      "BMR, TDEE, activity multiplier, dan defisit kalori yang aman — plus kenapa rumus Mifflin-St Jeor lebih akurat dari yang lama.",
    content: caraHitungKalori,
    category: "nutrition-basics",
    tags: ["BMR", "TDEE", "defisit kalori", "Mifflin-St Jeor", "metabolisme"],
    readTimeMinutes: 10,
    isPremium: false,
    sources: [
      "Mifflin MD, St Jeor ST, et al. (1990) — Am J Clin Nutr",
      "Mayo Clinic — Counting calories & weight loss basics",
      "ACSM — Guidelines for Exercise Testing and Prescription",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverEmoji: "🔢",
    accent: "#C41101",
    publishedAt: "2026-09-02",
  },
  {
    slug: "panduan-nutrisi-makanan-indonesia",
    title: "Panduan Nutrisi Makanan Indonesia Sehari-hari: Dari Nasi Padang sampai Pecel Lele",
    excerpt:
      "Breakdown kalori makanan Indonesia yang paling sering dimakan, dampak cara masak, dan cara makan di warteg tetap terkontrol.",
    content: panduanIndonesia,
    category: "indonesian-food",
    tags: ["makanan indonesia", "TKPI", "nasi padang", "gorengan", "warteg"],
    readTimeMinutes: 11,
    isPremium: true,
    sources: [
      "TKPI — Tabel Komposisi Pangan Indonesia, Kemenkes RI",
      "Data Konsumsi Pangan — Susenas, Badan Pusat Statistik (BPS)",
      "Angka Kecukupan Gizi (AKG) — Permenkes RI No. 28 Tahun 2019",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverEmoji: "🍛",
    accent: "#F59E0B",
    publishedAt: "2026-09-03",
  },
  {
    slug: "mitos-dan-fakta-diet-populer",
    title: "Mitos vs Fakta: Intermittent Fasting, Keto, dan Diet Populer Lainnya",
    excerpt:
      "Apa kata riset tentang IF, keto, low-carb vs low-fat, dan detox — plus cara mengenali red flags diet yang viral di sosial media.",
    content: mitosDiet,
    category: "food-myths",
    tags: ["intermittent fasting", "keto", "low-carb", "detox", "mitos diet"],
    readTimeMinutes: 11,
    isPremium: true,
    sources: [
      "The New England Journal of Medicine (NEJM) — Intermittent fasting reviews",
      "The Lancet & Cochrane Reviews — Diet comparison meta-analyses",
      "ISSN Position Stands — Diets and body composition",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverEmoji: "🔬",
    accent: "#2D4E8F",
    publishedAt: "2026-09-04",
  },
  {
    slug: "nutrisi-untuk-olahraga-dan-fitness",
    title: "Makan Apa Sebelum & Sesudah Olahraga? Panduan Nutrisi Olahraga Berbasis Riset",
    excerpt:
      "Pre & post-workout nutrition, kebutuhan protein, hidrasi, dan suplemen mana yang benar-benar evidence-based — bukan hype.",
    content: nutrisiOlahraga,
    category: "sports-nutrition",
    tags: ["pre-workout", "post-workout", "protein", "kreatin", "EMS", "HYROX"],
    readTimeMinutes: 11,
    isPremium: true,
    sources: [
      "ISSN Position Stand — Nutrient Timing (Kerksick CM et al., 2017, JISSN)",
      "ISSN Position Stand — Protein and Exercise (Jäger R et al., 2017, JISSN)",
      "ACSM — Nutrition and Athletic Performance Joint Position Stand",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverEmoji: "🏋️",
    accent: "#16A34A",
    publishedAt: "2026-09-05",
  },
  {
    slug: "cara-sehat-turun-berat-badan",
    title: "Cara Turun Berat Badan yang Sehat dan Sustainable: Bukan Diet Crash, Tapi Perubahan Gaya Hidup",
    excerpt:
      "Kenapa diet crash gagal, peran strength training, tidur, dan stres, serta cara tracking progress yang benar (bukan cuma timbangan).",
    content: turunBerat,
    category: "weight-management",
    tags: ["turun berat badan", "defisit kalori", "metabolic adaptation", "tidur", "body recomposition"],
    readTimeMinutes: 12,
    isPremium: true,
    sources: [
      "Mann T et al. (2007) — Medicare's search for effective obesity treatments, Am Psychol (UCLA)",
      "Hall KD et al. (2011) — Quantification of the effect of energy imbalance, The Lancet",
      "Trexler ET et al. (2014) — Metabolic adaptation to weight loss, JISSN; NIH & WHO guidance",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverEmoji: "⚖️",
    accent: "#C41101",
    publishedAt: "2026-09-06",
  },
];

export const CATEGORY_LABELS: Record<Lang, Record<ArticleCategory, string>> = {
  id: {
    "nutrition-basics": "Dasar Nutrisi",
    "meal-planning": "Perencanaan Makan",
    "food-myths": "Mitos Makanan",
    "diet-types": "Jenis Diet",
    micronutrients: "Vitamin & Mineral",
    "sports-nutrition": "Nutrisi Olahraga",
    "indonesian-food": "Makanan Indonesia",
    "weight-management": "Manajemen Berat Badan",
  },
  en: {
    "nutrition-basics": "Nutrition Basics",
    "meal-planning": "Meal Planning",
    "food-myths": "Food Myths",
    "diet-types": "Diet Types",
    micronutrients: "Micronutrients",
    "sports-nutrition": "Sports Nutrition",
    "indonesian-food": "Indonesian Food",
    "weight-management": "Weight Management",
  },
};

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/** Articles that share a category with `slug`, excluding it. */
export function getRelated(slug: string, limit = 3): Article[] {
  const current = getArticle(slug);
  if (!current) return [];
  const sameCat = ARTICLES.filter((a) => a.slug !== slug && a.category === current.category);
  const rest = ARTICLES.filter((a) => a.slug !== slug && a.category !== current.category);
  return [...sameCat, ...rest].slice(0, limit);
}

export function getFeatured(limit = 3): Article[] {
  return ARTICLES.slice(0, limit);
}
