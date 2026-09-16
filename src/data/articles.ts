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
import { IconName } from "../components/Icon";

import memahamiKalori from "./articles/memahami-kalori-dan-makronutrien.md?raw";
import caraHitungKalori from "./articles/cara-hitung-kebutuhan-kalori-harian.md?raw";
import panduanIndonesia from "./articles/panduan-nutrisi-makanan-indonesia.md?raw";
import mitosDiet from "./articles/mitos-dan-fakta-diet-populer.md?raw";
import nutrisiOlahraga from "./articles/nutrisi-untuk-olahraga-dan-fitness.md?raw";
import turunBerat from "./articles/cara-sehat-turun-berat-badan.md?raw";
import proteinKebutuhan from "./articles/protein-kebutuhan-sumber-dan-waktu-terbaik.md?raw";
import seratPencernaan from "./articles/serat-pencernaan-dan-kontrol-berat-badan.md?raw";
import gulaTambahan from "./articles/gula-tambahan-dan-kalori-tersembunyi.md?raw";
import hidrasiPerforma from "./articles/hidrasi-air-putih-dan-performa-olahraga.md?raw";
import labelGizi from "./articles/cara-membaca-label-informasi-nilai-gizi.md?raw";
import mealPrep from "./articles/meal-prep-dasar-untuk-pemula.md?raw";

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
  coverIcon: IconName; // fallback shown if coverPhoto fails to load
  coverPhoto: string; // real photo URL — 20FIT's own article-covers bucket (shared with recipe.20fit.id's article system), matched by topic
  accent: string; // cover gradient accent (loading/fallback background)
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
    readTimeMinutes: 5,
    isPremium: false,
    sources: [
      "WHO — Healthy diet fact sheet & nutrition guidelines",
      "Angka Kecukupan Gizi (AKG) — Permenkes RI No. 28 Tahun 2019",
      "Harvard T.H. Chan School of Public Health — The Nutrition Source",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "apple",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/1f140483-36ad-4d28-8936-bb20f06d7605.jpg",
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
    readTimeMinutes: 5,
    isPremium: false,
    sources: [
      "Mifflin MD, St Jeor ST, et al. (1990) — Am J Clin Nutr",
      "Mayo Clinic — Counting calories & weight loss basics",
      "ACSM — Guidelines for Exercise Testing and Prescription",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "calculator",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/ce257234-46e8-4b91-bf9c-097881f1a8e1.jpg",
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
    readTimeMinutes: 5,
    isPremium: false,
    sources: [
      "TKPI — Tabel Komposisi Pangan Indonesia, Kemenkes RI",
      "Data Konsumsi Pangan — Susenas, Badan Pusat Statistik (BPS)",
      "Angka Kecukupan Gizi (AKG) — Permenkes RI No. 28 Tahun 2019",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "bowl",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/6d4d64f1-183e-486f-928b-b1427a055718.jpg",
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
    readTimeMinutes: 5,
    isPremium: false,
    sources: [
      "The New England Journal of Medicine (NEJM) — Intermittent fasting reviews",
      "The Lancet & Cochrane Reviews — Diet comparison meta-analyses",
      "ISSN Position Stands — Diets and body composition",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "flask",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/c5aa06d2-d1e0-49b9-894f-63cec6a171df.jpg",
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
    readTimeMinutes: 5,
    isPremium: false,
    sources: [
      "ISSN Position Stand — Nutrient Timing (Kerksick CM et al., 2017, JISSN)",
      "ISSN Position Stand — Protein and Exercise (Jäger R et al., 2017, JISSN)",
      "ACSM — Nutrition and Athletic Performance Joint Position Stand",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "dumbbell",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/babdbcbd-4b48-49b4-9dec-ada3273cd0ef.jpg",
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
    readTimeMinutes: 5,
    isPremium: false,
    sources: [
      "Mann T et al. (2007) — Medicare's search for effective obesity treatments, Am Psychol (UCLA)",
      "Hall KD et al. (2011) — Quantification of the effect of energy imbalance, The Lancet",
      "Trexler ET et al. (2014) — Metabolic adaptation to weight loss, JISSN; NIH & WHO guidance",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "scale",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/eff949b3-d57e-4f73-ab19-3563dbf2103f.jpg",
    accent: "#C41101",
    publishedAt: "2026-09-06",
  },
  {
    slug: "protein-kebutuhan-sumber-dan-waktu-terbaik",
    title: "Protein: Berapa Kebutuhan Harian, Sumber Terbaik, dan Soal Waktu Makan",
    excerpt:
      "Rumus kebutuhan protein untuk orang biasa vs yang rutin latihan beban, sumber nabati/hewani yang terjangkau, dan fakta soal 'anabolic window'.",
    content: proteinKebutuhan,
    category: "nutrition-basics",
    tags: ["protein", "asam amino", "tempe", "tahu", "anabolic window", "latihan beban"],
    readTimeMinutes: 5,
    isPremium: false,
    sources: [
      "Angka Kecukupan Gizi (AKG) — Permenkes RI No. 28 Tahun 2019",
      "ISSN Position Stand — Protein and Exercise (Jäger R et al., 2017, JISSN)",
      "Academy of Nutrition and Dietetics — Vegetarian diets position paper",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "drumstick",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/6837dad5-69d4-4e73-a36c-5cbb56c6cae3.jpg",
    accent: "#2D4E8F",
    publishedAt: "2026-09-16",
  },
  {
    slug: "serat-pencernaan-dan-kontrol-berat-badan",
    title: "Serat: Kenapa Penting untuk Pencernaan dan Kontrol Berat Badan",
    excerpt:
      "Serat larut vs tidak larut, kenapa makanan tinggi serat bikin kenyang lebih lama, dan cara menambah asupan tanpa bikin kembung.",
    content: seratPencernaan,
    category: "nutrition-basics",
    tags: ["serat", "pencernaan", "kenyang lebih lama", "mikrobiota usus"],
    readTimeMinutes: 5,
    isPremium: false,
    sources: [
      "Angka Kecukupan Gizi (AKG) — Permenkes RI No. 28 Tahun 2019",
      "WHO — Healthy diet fact sheet",
      "Riskesdas & Data Konsumsi Pangan — Susenas, Badan Pusat Statistik (BPS)",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "leaf",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/46c280db-156f-45b1-a9bc-dccb3d617c3a.jpg",
    accent: "#22C55E",
    publishedAt: "2026-09-16",
  },
  {
    slug: "gula-tambahan-dan-kalori-tersembunyi",
    title: "Gula Tambahan dan Kalori Tersembunyi: Kenapa Minuman Manis Paling Sering Jadi Biang Kerok",
    excerpt:
      "Bedanya gula alami dan gula tambahan, kenapa kalori cair 'tidak terasa menghitung', dan cara mengenali gula tersembunyi di label.",
    content: gulaTambahan,
    category: "weight-management",
    tags: ["gula tambahan", "kalori cair", "minuman manis", "label gizi"],
    readTimeMinutes: 5,
    isPremium: false,
    sources: [
      "WHO — Guideline: Sugars intake for adults and children",
      "Angka Kecukupan Gizi (AKG) — Permenkes RI No. 28 Tahun 2019",
      "Harvard T.H. Chan School of Public Health — The Nutrition Source",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "cup",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/03f16aa7-1344-4113-92dd-f081081d6f44.jpg",
    accent: "#F59E0B",
    publishedAt: "2026-09-16",
  },
  {
    slug: "hidrasi-air-putih-dan-performa-olahraga",
    title: "Hidrasi: Kebutuhan Cairan Harian dan Dampaknya ke Performa Olahraga",
    excerpt:
      "Berapa sebenarnya kebutuhan air putih harian, kenapa dehidrasi ringan bisa menurunkan performa, dan mitos 'minum air bikin gemuk'.",
    content: hidrasiPerforma,
    category: "sports-nutrition",
    tags: ["hidrasi", "air putih", "elektrolit", "performa olahraga"],
    readTimeMinutes: 5,
    isPremium: false,
    sources: [
      "National Academies of Sciences — Dietary Reference Intakes for Water",
      "ACSM — Nutrition and Athletic Performance Joint Position Stand",
      "WHO — Healthy diet fact sheet",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "droplet",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/1025f915-aa3c-40a7-92a5-3356cccacc63.jpg",
    accent: "#2D4E8F",
    publishedAt: "2026-09-16",
  },
  {
    slug: "cara-membaca-label-informasi-nilai-gizi",
    title: "Cara Membaca Label Informasi Nilai Gizi Kemasan Makanan Indonesia",
    excerpt:
      "Jebakan takaran saji yang bikin salah hitung kalori, cara membaca %AKG dengan benar, dan arti klaim 'rendah lemak' atau 'tanpa gula tambahan'.",
    content: labelGizi,
    category: "indonesian-food",
    tags: ["label gizi", "ING", "BPOM", "%AKG", "takaran saji"],
    readTimeMinutes: 5,
    isPremium: false,
    sources: [
      "BPOM — Regulasi Label Pangan Olahan",
      "Angka Kecukupan Gizi (AKG) — Permenkes RI No. 28 Tahun 2019",
      "WHO — Healthy diet fact sheet (lemak jenuh & natrium)",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "tag",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/ac74ba9c-a2be-4133-85a0-e2b93600ba43.jpg",
    accent: "#C41101",
    publishedAt: "2026-09-16",
  },
  {
    slug: "meal-prep-dasar-untuk-pemula",
    title: "Meal Prep untuk Pemula: Cara Mulai dan Keamanan Pangan yang Sering Terlewat",
    excerpt:
      "Langkah dasar menyiapkan makanan sehat untuk beberapa hari sekaligus, plus panduan penyimpanan dan pemanasan ulang yang aman.",
    content: mealPrep,
    category: "meal-planning",
    tags: ["meal prep", "keamanan pangan", "penyimpanan makanan", "kontrol porsi"],
    readTimeMinutes: 5,
    isPremium: false,
    sources: [
      "USDA Food Safety and Inspection Service — Safe food storage guidelines",
      "Angka Kecukupan Gizi (AKG) — Permenkes RI No. 28 Tahun 2019",
    ],
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "box",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/ea615960-3306-4abd-bb7a-3b1d664935a6.jpg",
    accent: "#16A34A",
    publishedAt: "2026-09-16",
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
