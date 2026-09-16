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
      previewScanSub: "Scan makanan pakai AI, langsung tahu kalori & makronya. Buat akun gratis buat mulai scan makananmu.",
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

    // ---- Food search (scan lookup + tracker add-food) ----
    food: {
      searchTitle: "Cari Makanan",
      searchSub: "Cari dari database makanan Indonesia — kalori & makro per porsi.",
      placeholder: "Cari makanan… (mis. nasi goreng, tempe)",
      searchBtn: "Cari",
      noResults: "Tidak ada makanan yang cocok. Coba kata kunci lain atau tambah manual.",
      startTyping: "Ketik nama makanan untuk mulai mencari.",
      browseByCat: "Atau jelajahi per kategori",
      perServing: "per porsi",
      servingsLabel: "Porsi",
      add: "Tambah",
      added: "Ditambahkan",
      protein: "Protein",
      carbs: "Karbo",
      fat: "Lemak",
      fiber: "Serat",
      kcal: "kkal",
      // guest limit
      searchesLeft: (n: number) => `${n} pencarian gratis tersisa hari ini`,
      limitTitle: "Jatah pencarian gratis habis",
      limitSub: "Kamu sudah pakai 3 pencarian gratis hari ini. Buat akun gratis untuk cari makanan tanpa batas + simpan ke log harian.",
      // custom food
      customTitle: "Tambah makanan manual",
      customToggle: "Makanan tidak ada? Tambah manual",
      customName: "Nama makanan",
      customKcal: "Kalori (kkal)",
      customProtein: "Protein (g)",
      customCarbs: "Karbo (g)",
      customFat: "Lemak (g)",
      customAdd: "Tambah ke log",
      mealType: "Waktu makan",
      breakfast: "Sarapan",
      lunch: "Makan Siang",
      dinner: "Makan Malam",
      snack: "Snack",
    },

    // ---- Meal plan ----
    mealPlan: {
      pageTitle: "Rekomendasi Meal Plan",
      sub: "Contoh susunan makan harian dari database makanan Indonesia, disesuaikan dengan target kalorimu.",
      targetLabel: "Target",
      goalLabel: "Tujuan",
      regenerate: "Variasi lain",
      dayTotal: "Total hari ini",
      note: "Ini contoh otomatis untuk inspirasi — sesuaikan dengan selera, budget, dan kebutuhanmu. Simpan makanan yang kamu makan di Tracker.",
      addToTracker: "Buka Tracker",
      gateTitle: "Rekomendasi Meal Plan Personal",
      gateSub: "Dapatkan contoh susunan makan harian sesuai target kalori & tujuanmu — butuh akun untuk mengambil target personal dari profilmu.",
      gateBullets: [
        "Meal plan sarapan sampai snack sesuai target",
        "Variasi menu tiap hari dari makanan Indonesia",
        "Estimasi kalori & makro per makanan",
      ],
      goals: { lose: "Turun berat", muscle: "Naik massa otot", fit: "Bugar", maintain: "Jaga berat" },
    },

    // ---- Articles ----
    articles: {
      listTitle: "Artikel Nutrisi",
      listSub: "Berbasis fakta dari sumber terpercaya — WHO, Kemenkes, jurnal ilmiah. Bukan mitos diet.",
      all: "Semua",
      minRead: (n: number) => `${n} menit baca`,
      premium: "Perlu akun",
      byAuthor: (a: string) => `Oleh ${a}`,
      sourcesTitle: "Sumber Referensi",
      relatedTitle: "Artikel Terkait",
      backToList: "Semua artikel",
      gateTitle: "Lanjutkan membaca dengan akun gratis",
      gateSub: "Artikel ini tersedia penuh untuk pengguna yang sudah masuk. Buat akun gratis untuk baca selengkapnya + akses semua fitur.",
      notFound: "Artikel tidak ditemukan.",
      updated: "Dipublikasikan",
    },

    // ---- Daily tracker ----
    tracker: {
      pageTitle: "Tracker Hari Ini",
      addFood: "Tambah Makanan",
      panelTitle: "Tambah ke log",
      chooseMeal: "Waktu makan",
      tabSearch: "Cari Database",
      tabManual: "Manual",
      empty: "Belum diisi",
      done: "Selesai",
      gateTitle: "Tracker Kalori Harian",
      gateSub: "Tracking kalori & makro harian dengan target personal — datanya tersambung ke akun 20FIT kamu, juga kelihatan di my.20fit.id/calories.",
      gateBullets: [
        "Target kalori personal dari profilmu",
        "Log makanan per waktu makan (sarapan, siang, malam, snack)",
        "Progress kalori & makro real-time",
      ],
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
      previewScanSub: "Scan food with AI and instantly see the calories & macros. Create a free account to start scanning.",
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

    food: {
      searchTitle: "Search Food",
      searchSub: "Search the Indonesian food database — calories & macros per serving.",
      placeholder: "Search food… (e.g. fried rice, tempeh)",
      searchBtn: "Search",
      noResults: "No matching food. Try another keyword or add it manually.",
      startTyping: "Type a food name to start searching.",
      browseByCat: "Or browse by category",
      perServing: "per serving",
      servingsLabel: "Servings",
      add: "Add",
      added: "Added",
      protein: "Protein",
      carbs: "Carbs",
      fat: "Fat",
      fiber: "Fiber",
      kcal: "kcal",
      searchesLeft: (n: number) => `${n} free searches left today`,
      limitTitle: "Free searches used up",
      limitSub: "You've used your 3 free searches today. Create a free account to search food without limits + save to your daily log.",
      customTitle: "Add food manually",
      customToggle: "Food not listed? Add manually",
      customName: "Food name",
      customKcal: "Calories (kcal)",
      customProtein: "Protein (g)",
      customCarbs: "Carbs (g)",
      customFat: "Fat (g)",
      customAdd: "Add to log",
      mealType: "Meal",
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snack: "Snack",
    },

    articles: {
      listTitle: "Nutrition Articles",
      listSub: "Fact-based, from trusted sources — WHO, Kemenkes, scientific journals. Not diet myths.",
      all: "All",
      minRead: (n: number) => `${n} min read`,
      premium: "Account required",
      byAuthor: (a: string) => `By ${a}`,
      sourcesTitle: "References",
      relatedTitle: "Related Articles",
      backToList: "All articles",
      gateTitle: "Keep reading with a free account",
      gateSub: "This article is fully available to signed-in users. Create a free account to read the rest + unlock every feature.",
      notFound: "Article not found.",
      updated: "Published",
    },

    mealPlan: {
      pageTitle: "Meal Plan Recommendation",
      sub: "A sample daily meal layout from the Indonesian food database, tuned to your calorie target.",
      targetLabel: "Target",
      goalLabel: "Goal",
      regenerate: "Another variation",
      dayTotal: "Day total",
      note: "This is an auto-generated sample for inspiration — adjust to your taste, budget, and needs. Log what you actually eat in the Tracker.",
      addToTracker: "Open Tracker",
      gateTitle: "Personal Meal Plan Recommendations",
      gateSub: "Get a sample daily meal layout for your calorie target & goal — an account is needed to pull your personal target from your profile.",
      gateBullets: [
        "Breakfast-to-snack plan for your target",
        "A different menu each day from Indonesian foods",
        "Calorie & macro estimate per food",
      ],
      goals: { lose: "Lose weight", muscle: "Build muscle", fit: "Get fit", maintain: "Maintain" },
    },

    tracker: {
      pageTitle: "Today's Tracker",
      addFood: "Add Food",
      panelTitle: "Add to log",
      chooseMeal: "Meal",
      tabSearch: "Search Database",
      tabManual: "Manual",
      empty: "Empty",
      done: "Done",
      gateTitle: "Daily Calorie Tracker",
      gateSub: "Track daily calories & macros against a personal target — linked to your 20FIT account, also visible on my.20fit.id/calories.",
      gateBullets: [
        "Personal calorie target from your profile",
        "Log food by meal (breakfast, lunch, dinner, snack)",
        "Real-time calorie & macro progress",
      ],
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
