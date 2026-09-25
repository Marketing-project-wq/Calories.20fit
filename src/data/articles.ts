// Nutrition articles. Content is authored as Markdown in ./articles/<slug>.md
// (Indonesian) and ./articles/<slug>.en.md (English), pulled in at build time
// via Vite's `?raw` import, so 900-1100 word, fact-based bodies live as plain
// Markdown (easy to read/diff/edit) instead of escaped TypeScript template
// strings. Bilingual fields (title/excerpt/content/tags/sources/disclaimer)
// are keyed by `Lang` so the app's language toggle (see App.tsx `lang` state)
// can select the right copy — pages read `art.title[lang]` etc.
//
// LIVE SOURCE OF TRUTH IS THE DB, NOT THIS FILE. The public.nutrition_articles
// Supabase table (see supabase/migrations/2026-09-16_nutrition_articles.sql)
// is now the real source of truth — editable via the articles-api Edge
// Function (supabase/functions/articles-api) so a non-repo developer can
// add/edit articles without a code deploy. `useArticles()` (src/hooks/
// useArticles.ts) fetches the live table on mount and swaps it in.
// STATIC_ARTICLES below is only an in-browser fallback: it's what renders
// instantly on first paint and what stays on screen if the DB fetch fails or
// the table is briefly empty, so the site never breaks. It was seeded into
// the DB verbatim and isn't otherwise read by any page directly — pages call
// getArticle/getRelated/getFeatured with the live list from useArticles().
import { Lang } from "../lib/i18n";
import { IconName } from "../components/Icon";
import { supabase } from "../lib/supabase";

import memahamiKaloriId from "./articles/memahami-kalori-dan-makronutrien.md?raw";
import memahamiKaloriEn from "./articles/memahami-kalori-dan-makronutrien.en.md?raw";
import caraHitungKaloriId from "./articles/cara-hitung-kebutuhan-kalori-harian.md?raw";
import caraHitungKaloriEn from "./articles/cara-hitung-kebutuhan-kalori-harian.en.md?raw";
import panduanIndonesiaId from "./articles/panduan-nutrisi-makanan-indonesia.md?raw";
import panduanIndonesiaEn from "./articles/panduan-nutrisi-makanan-indonesia.en.md?raw";
import mitosDietId from "./articles/mitos-dan-fakta-diet-populer.md?raw";
import mitosDietEn from "./articles/mitos-dan-fakta-diet-populer.en.md?raw";
import nutrisiOlahragaId from "./articles/nutrisi-untuk-olahraga-dan-fitness.md?raw";
import nutrisiOlahragaEn from "./articles/nutrisi-untuk-olahraga-dan-fitness.en.md?raw";
import turunBeratId from "./articles/cara-sehat-turun-berat-badan.md?raw";
import turunBeratEn from "./articles/cara-sehat-turun-berat-badan.en.md?raw";
import proteinKebutuhanId from "./articles/protein-kebutuhan-sumber-dan-waktu-terbaik.md?raw";
import proteinKebutuhanEn from "./articles/protein-kebutuhan-sumber-dan-waktu-terbaik.en.md?raw";
import seratPencernaanId from "./articles/serat-pencernaan-dan-kontrol-berat-badan.md?raw";
import seratPencernaanEn from "./articles/serat-pencernaan-dan-kontrol-berat-badan.en.md?raw";
import gulaTambahanId from "./articles/gula-tambahan-dan-kalori-tersembunyi.md?raw";
import gulaTambahanEn from "./articles/gula-tambahan-dan-kalori-tersembunyi.en.md?raw";
import hidrasiPerformaId from "./articles/hidrasi-air-putih-dan-performa-olahraga.md?raw";
import hidrasiPerformaEn from "./articles/hidrasi-air-putih-dan-performa-olahraga.en.md?raw";
import labelGiziId from "./articles/cara-membaca-label-informasi-nilai-gizi.md?raw";
import labelGiziEn from "./articles/cara-membaca-label-informasi-nilai-gizi.en.md?raw";
import mealPrepId from "./articles/meal-prep-dasar-untuk-pemula.md?raw";
import mealPrepEn from "./articles/meal-prep-dasar-untuk-pemula.en.md?raw";

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
  title: Record<Lang, string>;
  excerpt: Record<Lang, string>;
  content: Record<Lang, string>; // markdown
  category: ArticleCategory;
  tags: Record<Lang, string[]>;
  readTimeMinutes: number;
  isPremium: boolean; // true = full read needs an account
  sources: Record<Lang, string[]>;
  author: string;
  disclaimer: Record<Lang, string>;
  coverIcon: IconName; // fallback shown if coverPhoto fails to load
  coverPhoto: string; // real photo URL — 20FIT's own article-covers bucket (shared with recipe.20fit.id's article system), matched by topic
  accent: string; // cover gradient accent (loading/fallback background)
  publishedAt: string; // ISO date
}

const DEFAULT_DISCLAIMER: Record<Lang, string> = {
  id: "Artikel ini bersifat edukatif dan informasional. Bukan pengganti konsultasi medis. Untuk kebutuhan diet spesifik, konsultasikan dengan ahli gizi atau dokter.",
  en: "This article is educational and informational. It is not a substitute for medical consultation. For specific dietary needs, consult a registered dietitian or doctor.",
};
const AUTHOR = "20fit Nutrition Team";
const AKG_ID = "Angka Kecukupan Gizi (AKG) — Permenkes RI No. 28 Tahun 2019";
const AKG_EN = "Indonesian Nutritional Adequacy Rate (AKG) — Ministry of Health Regulation No. 28/2019";

/** In-browser fallback only — see the file header. Not the live source of truth. */
export const STATIC_ARTICLES: Article[] = [
  {
    slug: "memahami-kalori-dan-makronutrien",
    title: {
      id: "Memahami Kalori & Makronutrien: Panduan Lengkap untuk Pemula",
      en: "Understanding Calories & Macronutrients: A Complete Beginner's Guide",
    },
    excerpt: {
      id: "Apa itu kalori sebenarnya, kenapa protein, karbohidrat, dan lemak penting, dan berapa kebutuhan harianmu — dijelaskan dari nol.",
      en: "What a calorie actually is, why protein, carbs, and fat matter, and how much you need daily — explained from the ground up.",
    },
    content: { id: memahamiKaloriId, en: memahamiKaloriEn },
    category: "nutrition-basics",
    tags: {
      id: ["kalori", "makronutrien", "protein", "karbohidrat", "lemak", "dasar nutrisi"],
      en: ["calories", "macronutrients", "protein", "carbohydrates", "fat", "nutrition basics"],
    },
    readTimeMinutes: 5,
    isPremium: false,
    sources: {
      id: [
        "WHO — Healthy diet fact sheet & nutrition guidelines",
        AKG_ID,
        "Harvard T.H. Chan School of Public Health — The Nutrition Source",
      ],
      en: [
        "WHO — Healthy diet fact sheet & nutrition guidelines",
        AKG_EN,
        "Harvard T.H. Chan School of Public Health — The Nutrition Source",
      ],
    },
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "apple",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/1f140483-36ad-4d28-8936-bb20f06d7605.jpg",
    accent: "#22C55E",
    publishedAt: "2026-09-01",
  },
  {
    slug: "cara-hitung-kebutuhan-kalori-harian",
    title: {
      id: "Cara Menghitung Kebutuhan Kalori Harian: TDEE, BMR, dan Defisit Kalori",
      en: "How to Calculate Your Daily Calorie Needs: TDEE, BMR, and Calorie Deficit",
    },
    excerpt: {
      id: "BMR, TDEE, activity multiplier, dan defisit kalori yang aman — plus kenapa rumus Mifflin-St Jeor lebih akurat dari yang lama.",
      en: "BMR, TDEE, activity multipliers, and a safe calorie deficit — plus why the Mifflin-St Jeor formula is more accurate than the old one.",
    },
    content: { id: caraHitungKaloriId, en: caraHitungKaloriEn },
    category: "nutrition-basics",
    tags: {
      id: ["BMR", "TDEE", "defisit kalori", "Mifflin-St Jeor", "metabolisme"],
      en: ["BMR", "TDEE", "calorie deficit", "Mifflin-St Jeor", "metabolism"],
    },
    readTimeMinutes: 5,
    isPremium: false,
    sources: {
      id: [
        "Mifflin MD, St Jeor ST, et al. (1990) — Am J Clin Nutr",
        "Mayo Clinic — Counting calories & weight loss basics",
        "ACSM — Guidelines for Exercise Testing and Prescription",
      ],
      en: [
        "Mifflin MD, St Jeor ST, et al. (1990) — Am J Clin Nutr",
        "Mayo Clinic — Counting calories & weight loss basics",
        "ACSM — Guidelines for Exercise Testing and Prescription",
      ],
    },
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "calculator",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/ce257234-46e8-4b91-bf9c-097881f1a8e1.jpg",
    accent: "#C41101",
    publishedAt: "2026-09-02",
  },
  {
    slug: "panduan-nutrisi-makanan-indonesia",
    title: {
      id: "Panduan Nutrisi Makanan Indonesia Sehari-hari: Dari Nasi Padang sampai Pecel Lele",
      en: "Everyday Indonesian Food Nutrition Guide: From Nasi Padang to Pecel Lele",
    },
    excerpt: {
      id: "Breakdown kalori makanan Indonesia yang paling sering dimakan, dampak cara masak, dan cara makan di warteg tetap terkontrol.",
      en: "A calorie breakdown of the most commonly eaten Indonesian foods, how cooking method changes it, and how to stay in control eating at a warteg.",
    },
    content: { id: panduanIndonesiaId, en: panduanIndonesiaEn },
    category: "indonesian-food",
    tags: {
      id: ["makanan indonesia", "TKPI", "nasi padang", "gorengan", "warteg"],
      en: ["indonesian food", "TKPI", "nasi padang", "fried food", "warteg"],
    },
    readTimeMinutes: 5,
    isPremium: false,
    sources: {
      id: [
        "TKPI — Tabel Komposisi Pangan Indonesia, Kemenkes RI",
        "Data Konsumsi Pangan — Susenas, Badan Pusat Statistik (BPS)",
        AKG_ID,
      ],
      en: [
        "TKPI — Indonesian Food Composition Table, Ministry of Health",
        "Food Consumption Data — Susenas, Statistics Indonesia (BPS)",
        AKG_EN,
      ],
    },
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "bowl",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/6d4d64f1-183e-486f-928b-b1427a055718.jpg",
    accent: "#F59E0B",
    publishedAt: "2026-09-03",
  },
  {
    slug: "mitos-dan-fakta-diet-populer",
    title: {
      id: "Mitos vs Fakta: Intermittent Fasting, Keto, dan Diet Populer Lainnya",
      en: "Myth vs. Fact: Intermittent Fasting, Keto, and Other Popular Diets",
    },
    excerpt: {
      id: "Apa kata riset tentang IF, keto, low-carb vs low-fat, dan detox — plus cara mengenali red flags diet yang viral di sosial media.",
      en: "What research actually says about IF, keto, low-carb vs. low-fat, and detox — plus how to spot red flags in viral social media diets.",
    },
    content: { id: mitosDietId, en: mitosDietEn },
    category: "food-myths",
    tags: {
      id: ["intermittent fasting", "keto", "low-carb", "detox", "mitos diet"],
      en: ["intermittent fasting", "keto", "low-carb", "detox", "diet myths"],
    },
    readTimeMinutes: 5,
    isPremium: false,
    sources: {
      id: [
        "The New England Journal of Medicine (NEJM) — Intermittent fasting reviews",
        "The Lancet & Cochrane Reviews — Diet comparison meta-analyses",
        "ISSN Position Stands — Diets and body composition",
      ],
      en: [
        "The New England Journal of Medicine (NEJM) — Intermittent fasting reviews",
        "The Lancet & Cochrane Reviews — Diet comparison meta-analyses",
        "ISSN Position Stands — Diets and body composition",
      ],
    },
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "flask",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/c5aa06d2-d1e0-49b9-894f-63cec6a171df.jpg",
    accent: "#2D4E8F",
    publishedAt: "2026-09-04",
  },
  {
    slug: "nutrisi-untuk-olahraga-dan-fitness",
    title: {
      id: "Makan Apa Sebelum & Sesudah Olahraga? Panduan Nutrisi Olahraga Berbasis Riset",
      en: "What to Eat Before & After Exercise? A Research-Based Sports Nutrition Guide",
    },
    excerpt: {
      id: "Pre & post-workout nutrition, kebutuhan protein, hidrasi, dan suplemen mana yang benar-benar evidence-based — bukan hype.",
      en: "Pre- and post-workout nutrition, protein needs, hydration, and which supplements are actually evidence-based — not hype.",
    },
    content: { id: nutrisiOlahragaId, en: nutrisiOlahragaEn },
    category: "sports-nutrition",
    tags: {
      id: ["pre-workout", "post-workout", "protein", "kreatin", "EMS", "HYROX"],
      en: ["pre-workout", "post-workout", "protein", "creatine", "EMS", "HYROX"],
    },
    readTimeMinutes: 5,
    isPremium: false,
    sources: {
      id: [
        "ISSN Position Stand — Nutrient Timing (Kerksick CM et al., 2017, JISSN)",
        "ISSN Position Stand — Protein and Exercise (Jäger R et al., 2017, JISSN)",
        "ACSM — Nutrition and Athletic Performance Joint Position Stand",
      ],
      en: [
        "ISSN Position Stand — Nutrient Timing (Kerksick CM et al., 2017, JISSN)",
        "ISSN Position Stand — Protein and Exercise (Jäger R et al., 2017, JISSN)",
        "ACSM — Nutrition and Athletic Performance Joint Position Stand",
      ],
    },
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "dumbbell",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/babdbcbd-4b48-49b4-9dec-ada3273cd0ef.jpg",
    accent: "#16A34A",
    publishedAt: "2026-09-05",
  },
  {
    slug: "cara-sehat-turun-berat-badan",
    title: {
      id: "Cara Turun Berat Badan yang Sehat dan Sustainable: Bukan Diet Crash, Tapi Perubahan Gaya Hidup",
      en: "How to Lose Weight in a Healthy, Sustainable Way: Not a Crash Diet, But a Lifestyle Change",
    },
    excerpt: {
      id: "Kenapa diet crash gagal, peran strength training, tidur, dan stres, serta cara tracking progress yang benar (bukan cuma timbangan).",
      en: "Why crash diets fail, the role of strength training, sleep, and stress, and how to track progress the right way (not just the scale).",
    },
    content: { id: turunBeratId, en: turunBeratEn },
    category: "weight-management",
    tags: {
      id: ["turun berat badan", "defisit kalori", "metabolic adaptation", "tidur", "body recomposition"],
      en: ["weight loss", "calorie deficit", "metabolic adaptation", "sleep", "body recomposition"],
    },
    readTimeMinutes: 5,
    isPremium: false,
    sources: {
      id: [
        "Mann T et al. (2007) — Medicare's search for effective obesity treatments, Am Psychol (UCLA)",
        "Hall KD et al. (2011) — Quantification of the effect of energy imbalance, The Lancet",
        "Trexler ET et al. (2014) — Metabolic adaptation to weight loss, JISSN; NIH & WHO guidance",
      ],
      en: [
        "Mann T et al. (2007) — Medicare's search for effective obesity treatments, Am Psychol (UCLA)",
        "Hall KD et al. (2011) — Quantification of the effect of energy imbalance, The Lancet",
        "Trexler ET et al. (2014) — Metabolic adaptation to weight loss, JISSN; NIH & WHO guidance",
      ],
    },
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "scale",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/eff949b3-d57e-4f73-ab19-3563dbf2103f.jpg",
    accent: "#C41101",
    publishedAt: "2026-09-06",
  },
  {
    slug: "protein-kebutuhan-sumber-dan-waktu-terbaik",
    title: {
      id: "Protein: Berapa Kebutuhan Harian, Sumber Terbaik, dan Soal Waktu Makan",
      en: "Protein: Daily Needs, Best Sources, and the Truth About Timing",
    },
    excerpt: {
      id: "Rumus kebutuhan protein untuk orang biasa vs yang rutin latihan beban, sumber nabati/hewani yang terjangkau, dan fakta soal 'anabolic window'.",
      en: "Protein requirement formulas for average people vs. regular weightlifters, affordable plant/animal sources, and the facts about the 'anabolic window'.",
    },
    content: { id: proteinKebutuhanId, en: proteinKebutuhanEn },
    category: "nutrition-basics",
    tags: {
      id: ["protein", "asam amino", "tempe", "tahu", "anabolic window", "latihan beban"],
      en: ["protein", "amino acids", "tempeh", "tofu", "anabolic window", "strength training"],
    },
    readTimeMinutes: 5,
    isPremium: false,
    sources: {
      id: [
        AKG_ID,
        "ISSN Position Stand — Protein and Exercise (Jäger R et al., 2017, JISSN)",
        "Academy of Nutrition and Dietetics — Vegetarian diets position paper",
      ],
      en: [
        AKG_EN,
        "ISSN Position Stand — Protein and Exercise (Jäger R et al., 2017, JISSN)",
        "Academy of Nutrition and Dietetics — Vegetarian diets position paper",
      ],
    },
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "drumstick",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/6837dad5-69d4-4e73-a36c-5cbb56c6cae3.jpg",
    accent: "#2D4E8F",
    publishedAt: "2026-09-16",
  },
  {
    slug: "serat-pencernaan-dan-kontrol-berat-badan",
    title: {
      id: "Serat: Kenapa Penting untuk Pencernaan dan Kontrol Berat Badan",
      en: "Fiber: Why It Matters for Digestion and Weight Control",
    },
    excerpt: {
      id: "Serat larut vs tidak larut, kenapa makanan tinggi serat bikin kenyang lebih lama, dan cara menambah asupan tanpa bikin kembung.",
      en: "Soluble vs. insoluble fiber, why high-fiber foods keep you fuller longer, and how to increase intake without the bloating.",
    },
    content: { id: seratPencernaanId, en: seratPencernaanEn },
    category: "nutrition-basics",
    tags: {
      id: ["serat", "pencernaan", "kenyang lebih lama", "mikrobiota usus"],
      en: ["fiber", "digestion", "longer fullness", "gut microbiome"],
    },
    readTimeMinutes: 5,
    isPremium: false,
    sources: {
      id: [AKG_ID, "WHO — Healthy diet fact sheet", "Riskesdas & Data Konsumsi Pangan — Susenas, Badan Pusat Statistik (BPS)"],
      en: [AKG_EN, "WHO — Healthy diet fact sheet", "Riskesdas & Food Consumption Data — Susenas, Statistics Indonesia (BPS)"],
    },
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "leaf",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/46c280db-156f-45b1-a9bc-dccb3d617c3a.jpg",
    accent: "#22C55E",
    publishedAt: "2026-09-16",
  },
  {
    slug: "gula-tambahan-dan-kalori-tersembunyi",
    title: {
      id: "Gula Tambahan dan Kalori Tersembunyi: Kenapa Minuman Manis Paling Sering Jadi Biang Kerok",
      en: "Added Sugar and Hidden Calories: Why Sweet Drinks Are Often the Real Culprit",
    },
    excerpt: {
      id: "Bedanya gula alami dan gula tambahan, kenapa kalori cair 'tidak terasa menghitung', dan cara mengenali gula tersembunyi di label.",
      en: "The difference between natural and added sugar, why liquid calories 'don't feel like they count', and how to spot hidden sugar on labels.",
    },
    content: { id: gulaTambahanId, en: gulaTambahanEn },
    category: "weight-management",
    tags: {
      id: ["gula tambahan", "kalori cair", "minuman manis", "label gizi"],
      en: ["added sugar", "liquid calories", "sweet drinks", "nutrition label"],
    },
    readTimeMinutes: 5,
    isPremium: false,
    sources: {
      id: ["WHO — Guideline: Sugars intake for adults and children", AKG_ID, "Harvard T.H. Chan School of Public Health — The Nutrition Source"],
      en: ["WHO — Guideline: Sugars intake for adults and children", AKG_EN, "Harvard T.H. Chan School of Public Health — The Nutrition Source"],
    },
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "cup",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/03f16aa7-1344-4113-92dd-f081081d6f44.jpg",
    accent: "#F59E0B",
    publishedAt: "2026-09-16",
  },
  {
    slug: "hidrasi-air-putih-dan-performa-olahraga",
    title: {
      id: "Hidrasi: Kebutuhan Cairan Harian dan Dampaknya ke Performa Olahraga",
      en: "Hydration: Daily Fluid Needs and Its Impact on Exercise Performance",
    },
    excerpt: {
      id: "Berapa sebenarnya kebutuhan air putih harian, kenapa dehidrasi ringan bisa menurunkan performa, dan mitos 'minum air bikin gemuk'.",
      en: "How much water you actually need daily, why mild dehydration can hurt performance, and the myth that 'drinking water makes you fat'.",
    },
    content: { id: hidrasiPerformaId, en: hidrasiPerformaEn },
    category: "sports-nutrition",
    tags: {
      id: ["hidrasi", "air putih", "elektrolit", "performa olahraga"],
      en: ["hydration", "water", "electrolytes", "exercise performance"],
    },
    readTimeMinutes: 5,
    isPremium: false,
    sources: {
      id: [
        "National Academies of Sciences — Dietary Reference Intakes for Water",
        "ACSM — Nutrition and Athletic Performance Joint Position Stand",
        "WHO — Healthy diet fact sheet",
      ],
      en: [
        "National Academies of Sciences — Dietary Reference Intakes for Water",
        "ACSM — Nutrition and Athletic Performance Joint Position Stand",
        "WHO — Healthy diet fact sheet",
      ],
    },
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "droplet",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/1025f915-aa3c-40a7-92a5-3356cccacc63.jpg",
    accent: "#2D4E8F",
    publishedAt: "2026-09-16",
  },
  {
    slug: "cara-membaca-label-informasi-nilai-gizi",
    title: {
      id: "Cara Membaca Label Informasi Nilai Gizi Kemasan Makanan Indonesia",
      en: "How to Read the Nutrition Facts Label on Indonesian Food Packaging",
    },
    excerpt: {
      id: "Jebakan takaran saji yang bikin salah hitung kalori, cara membaca %AKG dengan benar, dan arti klaim 'rendah lemak' atau 'tanpa gula tambahan'.",
      en: "The serving-size trap that leads to miscounted calories, how to correctly read %AKG, and what claims like 'low fat' or 'no added sugar' really mean.",
    },
    content: { id: labelGiziId, en: labelGiziEn },
    category: "indonesian-food",
    tags: {
      id: ["label gizi", "ING", "BPOM", "%AKG", "takaran saji"],
      en: ["nutrition label", "ING", "BPOM", "%AKG", "serving size"],
    },
    readTimeMinutes: 5,
    isPremium: false,
    sources: {
      id: ["BPOM — Regulasi Label Pangan Olahan", AKG_ID, "WHO — Healthy diet fact sheet (lemak jenuh & natrium)"],
      en: ["BPOM — Processed Food Labeling Regulations", AKG_EN, "WHO — Healthy diet fact sheet (saturated fat & sodium)"],
    },
    author: AUTHOR,
    disclaimer: DEFAULT_DISCLAIMER,
    coverIcon: "tag",
    coverPhoto: "https://cpvzwqptzcxnwzfzgrmt.supabase.co/storage/v1/object/public/article-covers/ac74ba9c-a2be-4133-85a0-e2b93600ba43.jpg",
    accent: "#C41101",
    publishedAt: "2026-09-16",
  },
  {
    slug: "meal-prep-dasar-untuk-pemula",
    title: {
      id: "Meal Prep untuk Pemula: Cara Mulai dan Keamanan Pangan yang Sering Terlewat",
      en: "Meal Prep for Beginners: How to Start and the Food Safety Steps People Skip",
    },
    excerpt: {
      id: "Langkah dasar menyiapkan makanan sehat untuk beberapa hari sekaligus, plus panduan penyimpanan dan pemanasan ulang yang aman.",
      en: "The basic steps to prepping healthy food for several days at once, plus a guide to safe storage and reheating.",
    },
    content: { id: mealPrepId, en: mealPrepEn },
    category: "meal-planning",
    tags: {
      id: ["meal prep", "keamanan pangan", "penyimpanan makanan", "kontrol porsi"],
      en: ["meal prep", "food safety", "food storage", "portion control"],
    },
    readTimeMinutes: 5,
    isPremium: false,
    sources: {
      id: ["USDA Food Safety and Inspection Service — Safe food storage guidelines", AKG_ID],
      en: ["USDA Food Safety and Inspection Service — Safe food storage guidelines", AKG_EN],
    },
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

export function getArticle(slug: string, list: Article[] = STATIC_ARTICLES): Article | undefined {
  return list.find((a) => a.slug === slug);
}

/** Articles that share a category with `slug`, excluding it. */
export function getRelated(slug: string, list: Article[] = STATIC_ARTICLES, limit = 3): Article[] {
  const current = getArticle(slug, list);
  if (!current) return [];
  const sameCat = list.filter((a) => a.slug !== slug && a.category === current.category);
  const rest = list.filter((a) => a.slug !== slug && a.category !== current.category);
  return [...sameCat, ...rest].slice(0, limit);
}

/**
 * A cross-section of the catalog for the landing page's "browse all
 * articles" teaser — one article per distinct category first, then filling
 * any remaining slots from the rest. A plain `list.slice(0, limit)` looked
 * wrong here: the array happens to start with two nutrition-basics articles
 * in a row, so the "featured" preview (meant to represent the whole
 * catalog) looked the same as just filtering to Nutrition Basics.
 */
export function getFeatured(list: Article[] = STATIC_ARTICLES, limit = 3): Article[] {
  const seenCategories = new Set<ArticleCategory>();
  const diverse: Article[] = [];
  const rest: Article[] = [];
  for (const a of list) {
    if (seenCategories.has(a.category)) {
      rest.push(a);
    } else {
      seenCategories.add(a.category);
      diverse.push(a);
    }
  }
  return [...diverse, ...rest].slice(0, limit);
}

function mapDbRow(row: any): Article {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    tags: row.tags,
    readTimeMinutes: row.read_time_minutes,
    isPremium: row.is_premium,
    sources: row.sources,
    author: row.author,
    disclaimer: row.disclaimer,
    coverIcon: row.cover_icon,
    coverPhoto: row.cover_photo,
    accent: row.accent,
    publishedAt: row.published_at,
  };
}

/**
 * Fetches the live article list from Supabase (public.nutrition_articles,
 * readable by anon). Returns null on any error or an empty table, so the
 * caller (useArticles) can keep showing STATIC_ARTICLES instead of an
 * empty page.
 */
export async function fetchArticlesFromDb(): Promise<Article[] | null> {
  try {
    const { data, error } = await supabase
      .from("nutrition_articles")
      .select("*")
      .order("published_at", { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data.map(mapDbRow);
  } catch {
    return null;
  }
}
