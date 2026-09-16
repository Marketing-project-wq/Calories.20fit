// Copy for the NEW calorie-feature pages (landing calculator, articles,
// tracker add-food, meal plan, account gate). Kept in its own module instead
// of swelling the central src/lib/i18n.ts `t` object — that file stays the
// source of truth for the existing Scan/History/Insight surfaces; this one
// owns everything the "landing → functional feature" build adds. Same
// bilingual id/en shape, read via cc(lang).
import { Lang } from "./i18n";
import { ActivityLevel, Goal } from "./tdee";

export const copy = {
  id: {
    nav: {
      home: "Beranda",
      scan: "Scan",
      articles: "Artikel",
      tracker: "Tracker",
      mealPlan: "Meal Plan",
      history: "Riwayat",
    },

    // ---- Landing (/) ----
    landing: {
      heroKicker: "Gratis · Tanpa akun",
      heroTitle: "Berapa Kalori yang\nKamu Butuhkan?",
      heroSub: "Hitung kebutuhan kalori harianmu dalam 30 detik. Berbasis rumus Mifflin-St Jeor — dipakai ahli gizi & klinik.",
      previewArticlesTitle: "Belajar nutrisi dari sumber terpercaya",
      previewArticlesSub: "Artikel berbasis fakta — WHO, Kemenkes, jurnal ilmiah. Bukan mitos diet.",
      previewArticlesCta: "Lihat semua artikel",
      previewScanTitle: "Foto makanan, langsung tahu kalorinya",
      previewScanSub: "Scan makanan pakai AI. Coba gratis tanpa akun — hasil analisis terbuka penuh.",
      previewScanCta: "Coba Scan Kalori",
      previewScanBullets: [
        "Estimasi kalori & makro dari satu foto",
        "Health score & tingkat kekenyangan",
        "Simpan ke log harian (dengan akun)",
      ],
    },

    // ---- TDEE calculator ----
    calc: {
      title: "Kalkulator Kebutuhan Kalori",
      genderLabel: "Jenis kelamin",
      male: "Pria",
      female: "Wanita",
      age: "Usia",
      ageUnit: "tahun",
      weight: "Berat badan",
      weightUnit: "kg",
      height: "Tinggi badan",
      heightUnit: "cm",
      activityLabel: "Level aktivitas",
      submit: "Hitung Sekarang",
      recalc: "Hitung ulang",
      edit: "Ubah data",
      errorInvalid: "Lengkapi semua kolom dengan angka yang wajar dulu ya.",
      // Results
      resultTitle: "Kebutuhan Kalorimu",
      bmrLabel: "BMR",
      bmrDesc: "Kalori yang tubuhmu bakar saat istirahat total (Basal Metabolic Rate).",
      tdeeLabel: "TDEE",
      tdeeDesc: "Total kalori yang kamu bakar per hari termasuk aktivitas.",
      perDay: "kkal/hari",
      goalsTitle: "Target sesuai tujuanmu",
      goalFatLoss: "Turun berat",
      goalMaintain: "Jaga berat",
      goalMuscleGain: "Naik massa otot",
      goalFatLossNote: "Defisit 500 kkal · ~0,5 kg/minggu",
      goalMaintainNote: "Sesuai kebutuhan harian",
      goalMuscleGainNote: "Surplus 300 kkal · naik bertahap",
      macroTitle: "Saran makro",
      macroFor: (goal: string) => `untuk target ${goal}`,
      disclaimer:
        "Angka ini estimasi berbasis rumus, bukan pengukuran medis. Untuk kebutuhan diet spesifik, konsultasikan dengan ahli gizi atau dokter.",
    },

    // ---- Full-feature teaser (Section 2) ----
    teaser: {
      title: "Mau tracking kalori harianmu?",
      sub: "Buat akun gratis untuk akses fitur lengkap:",
      bullets: [
        "Scan makanan & langsung tahu kalorinya",
        "Tracking kalori harian dengan target personal",
        "Artikel nutrisi dari sumber terpercaya",
        "Rekomendasi meal plan sesuai tujuanmu",
        "Histori & progress mingguan",
      ],
      ctaPrimary: "Buat Akun Gratis",
      ctaSecondary: "Sudah punya akun? Login",
    },

    // ---- Account gate (shared) ----
    gate: {
      badge: "Perlu akun",
      defaultTitle: "Fitur ini butuh akun 20FIT",
      defaultSub: "Buat akun gratis untuk membuka fitur ini. Datanya tersambung ke akun 20FIT kamu — juga kelihatan di my.20fit.id.",
      signUp: "Buat Akun Gratis",
      login: "Sudah punya akun? Login",
    },

    common: {
      poweredBy: "Berbasis rumus Mifflin-St Jeor",
      loading: "Memuat…",
      comingSoonTitle: "Segera hadir",
      notFoundTitle: "Halaman tidak ditemukan",
      notFoundSub: "Halaman yang kamu cari tidak ada.",
      backHome: "Kembali ke beranda",
    },
  },

  en: {
    nav: {
      home: "Home",
      scan: "Scan",
      articles: "Articles",
      tracker: "Tracker",
      mealPlan: "Meal Plan",
      history: "History",
    },

    landing: {
      heroKicker: "Free · No account",
      heroTitle: "How Many Calories\nDo You Need?",
      heroSub: "Calculate your daily calorie needs in 30 seconds. Based on the Mifflin-St Jeor equation — used by dietitians & clinics.",
      previewArticlesTitle: "Learn nutrition from trusted sources",
      previewArticlesSub: "Fact-based articles — WHO, Kemenkes, scientific journals. Not diet myths.",
      previewArticlesCta: "See all articles",
      previewScanTitle: "Photo your food, know the calories",
      previewScanSub: "Scan food with AI. Try it free, no account — the analysis is fully open.",
      previewScanCta: "Try Calorie Scan",
      previewScanBullets: [
        "Calorie & macro estimate from one photo",
        "Health score & satiety level",
        "Save to your daily log (with an account)",
      ],
    },

    calc: {
      title: "Calorie Needs Calculator",
      genderLabel: "Gender",
      male: "Male",
      female: "Female",
      age: "Age",
      ageUnit: "years",
      weight: "Weight",
      weightUnit: "kg",
      height: "Height",
      heightUnit: "cm",
      activityLabel: "Activity level",
      submit: "Calculate Now",
      recalc: "Recalculate",
      edit: "Edit data",
      errorInvalid: "Please fill every field with a reasonable number first.",
      resultTitle: "Your Calorie Needs",
      bmrLabel: "BMR",
      bmrDesc: "Calories your body burns at complete rest (Basal Metabolic Rate).",
      tdeeLabel: "TDEE",
      tdeeDesc: "Total calories you burn per day including activity.",
      perDay: "kcal/day",
      goalsTitle: "Targets by your goal",
      goalFatLoss: "Lose weight",
      goalMaintain: "Maintain",
      goalMuscleGain: "Build muscle",
      goalFatLossNote: "500 kcal deficit · ~0.5 kg/week",
      goalMaintainNote: "Match daily needs",
      goalMuscleGainNote: "300 kcal surplus · gradual gain",
      macroTitle: "Suggested macros",
      macroFor: (goal: string) => `for the ${goal} target`,
      disclaimer:
        "These are formula-based estimates, not a medical measurement. For specific dietary needs, consult a dietitian or doctor.",
    },

    teaser: {
      title: "Want to track your daily calories?",
      sub: "Create a free account to unlock the full features:",
      bullets: [
        "Scan food & instantly know its calories",
        "Daily calorie tracking with a personal target",
        "Nutrition articles from trusted sources",
        "Meal plan recommendations for your goal",
        "History & weekly progress",
      ],
      ctaPrimary: "Create Free Account",
      ctaSecondary: "Already have an account? Log in",
    },

    gate: {
      badge: "Account required",
      defaultTitle: "This feature needs a 20FIT account",
      defaultSub: "Create a free account to unlock it. Your data is linked to your 20FIT account — also visible on my.20fit.id.",
      signUp: "Create Free Account",
      login: "Already have an account? Log in",
    },

    common: {
      poweredBy: "Based on the Mifflin-St Jeor equation",
      loading: "Loading…",
      comingSoonTitle: "Coming soon",
      notFoundTitle: "Page not found",
      notFoundSub: "The page you're looking for doesn't exist.",
      backHome: "Back to home",
    },
  },
} as const;

export function cc(lang: Lang) {
  return copy[lang];
}

// Localised labels for the activity ladder + goals, so the enum keys in
// src/lib/tdee.ts stay language-free.
export const ACTIVITY_LABELS: Record<Lang, Record<ActivityLevel, { name: string; desc: string }>> = {
  id: {
    sedentary: { name: "Jarang gerak", desc: "Jarang / tidak olahraga" },
    light: { name: "Ringan", desc: "Olahraga ringan 1-3x/minggu" },
    moderate: { name: "Sedang", desc: "Olahraga 3-5x/minggu" },
    active: { name: "Aktif", desc: "Olahraga berat 6-7x/minggu" },
    very_active: { name: "Sangat aktif", desc: "2x/hari atau pekerjaan fisik berat" },
  },
  en: {
    sedentary: { name: "Sedentary", desc: "Little / no exercise" },
    light: { name: "Light", desc: "Light exercise 1-3x/week" },
    moderate: { name: "Moderate", desc: "Exercise 3-5x/week" },
    active: { name: "Active", desc: "Hard exercise 6-7x/week" },
    very_active: { name: "Very active", desc: "Twice daily or physical job" },
  },
};

export function goalLabel(lang: Lang, goal: Goal): string {
  const c = cc(lang).calc;
  return goal === "fat_loss" ? c.goalFatLoss : goal === "muscle_gain" ? c.goalMuscleGain : c.goalMaintain;
}
