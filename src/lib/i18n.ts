export type Lang = "id" | "en";

export const t = {
  id: {
    // App tabs
    tabScan: "Scan Kalori",
    tabHistory: "Riwayat",
    tabInsight: "Insight",
    // Hero
    badge: "Scan kalori",
    heroTitle: "Foto makanan,\nlihat estimasi kalorinya",
    heroSub: "Hasil analisisnya terbuka penuh tanpa akun. Yang butuh akun adalah lapisan di atasnya: meal plan, diet plan, dan food analytics.",
    heroNote: "Tanpa akun. Hasil terbuka penuh.",
    heroTrust: "Dipakai pengguna 20FIT tiap hari",
    // Framing note
    framingNote: "Angka di halaman ini estimasi dari satu foto — bukan pengukuran akurat, bukan saran medis, bukan target kalori personal.",
    // Who this is for
    whoForTitle: "Cocok untuk siapa",
    whoForItems: [
      "Yang mau tahu perkiraan kalori tanpa hafal tabel gizi",
      "Yang lagi jaga pola makan, bukan yang cari angka sempurna",
      "Yang mau langsung coba tanpa daftar akun dulu",
    ],
    // Tool panel
    analyzing: "Menganalisis foto…",
    analyzingSub: "Biasanya beberapa detik.",
    failedTitle: "Gagal menganalisis",
    retryBtn: "Coba lagi",
    kcal: "kkal",
    needAccount: "Perlu akun",
    scanAgain: "Scan lagi",
    reset: "Reset",
    dropzone: "Pilih atau seret foto makanan",
    dropzoneSub: "JPG · PNG · WebP · maks 5MB",
    dropzoneChoose: "Pilih Foto",
    changePhoto: "Ganti",
    analyzeBtn: "Analisis foto",
    // Error messages
    errFormat: "Format tidak didukung. Gunakan JPG, PNG, atau WebP.",
    errSize: "Foto terlalu besar. Maksimal 5MB.",
    errQuota: "Kuota scan habis. Top-up untuk melanjutkan.",
    errGeneric: "Gagal menganalisis foto",
    // Macros
    protein: "Protein",
    carbs: "Karbo",
    fat: "Lemak",
    locked: "🔒 Perlu akun",
    // How it works
    howItWorks: "Cara kerja",
    whatYouCan: "Yang bisa kamu lakukan",
    featureNeedsAccount: "Perlu akun",
    // Ecosystem
    ecoTitle: "Bagian dari satu ekosistem",
    ecoSub: "Semua alat 20FIT berbagi satu akun.",
    // Testimonials
    testimonialTitle: "Yang dipakai, bukan yang dijanjikan",
    testimonialSub: "Dari pengguna aktif 20FIT",
    // FAQ
    faqTitle: "Pertanyaan umum",
    faqSub: "Yang paling sering ditanyakan sebelum scan pertama.",
    // Bottom CTA
    ctaTitle: "Mulai dari satu akun 20FIT",
    ctaSub: "Meal plan, diet plan, dan analytics jalan setelah ada riwayat yang tersimpan.",
    ctaBtn: "Buat akun di my.20fit.id",
    // Footer
    footerTagline: "Satu akun untuk scan kalori, menu diet, dan panduan medical check-up.",
    footerDisclaimer: "Estimasi kalori dihitung dari analisis foto dan bersifat perkiraan. Bukan saran medis, bukan target kalori personal. Untuk keputusan kesehatan, konsultasikan dengan tenaga kesehatan.",
    sessionCount: (n: number) => `${n} analisis di sesi ini`,
  },
  en: {
    // App tabs
    tabScan: "Calorie Scan",
    tabHistory: "History",
    tabInsight: "Insight",
    // Hero
    badge: "Calorie scan",
    heroTitle: "Photo your food,\nsee the calorie estimate",
    heroSub: "Results are fully open without an account. What requires an account is the layer above: meal plan, diet plan, and food analytics.",
    heroNote: "No account needed. Results fully open.",
    heroTrust: "Used by 20FIT users every day",
    // Framing note
    framingNote: "Numbers on this page are estimates from a single photo — not accurate measurements, not medical advice, not a personal calorie target.",
    // Who this is for
    whoForTitle: "Who this is for",
    whoForItems: [
      "Anyone who wants a calorie estimate without memorizing nutrition tables",
      "People watching their eating habits, not chasing a perfect number",
      "Anyone who wants to try it out before creating an account",
    ],
    // Tool panel
    analyzing: "Analyzing photo…",
    analyzingSub: "Usually takes a few seconds.",
    failedTitle: "Analysis failed",
    retryBtn: "Try again",
    kcal: "kcal",
    needAccount: "Account required",
    scanAgain: "Scan another",
    reset: "Reset",
    dropzone: "Pick or drag a food photo",
    dropzoneSub: "JPG · PNG · WebP · max 5MB",
    dropzoneChoose: "Choose Photo",
    changePhoto: "Change",
    analyzeBtn: "Analyze photo",
    // Error messages
    errFormat: "Format not supported. Use JPG, PNG, or WebP.",
    errSize: "Photo too large. Maximum 5MB.",
    errQuota: "Scan quota exhausted. Top up to continue.",
    errGeneric: "Failed to analyze photo",
    // Macros
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    locked: "🔒 Account required",
    // How it works
    howItWorks: "How it works",
    whatYouCan: "What you can do",
    featureNeedsAccount: "Account required",
    // Ecosystem
    ecoTitle: "Part of one ecosystem",
    ecoSub: "All 20FIT tools share one account.",
    // Testimonials
    testimonialTitle: "Used, not just promised",
    testimonialSub: "From active 20FIT users",
    // FAQ
    faqTitle: "Common questions",
    faqSub: "Most frequently asked before the first scan.",
    // Bottom CTA
    ctaTitle: "Start with one 20FIT account",
    ctaSub: "Meal plan, diet plan, and analytics work once there's saved history.",
    ctaBtn: "Create account at my.20fit.id",
    // Footer
    footerTagline: "One account for calorie scanning, diet menus, and medical check-up guides.",
    footerDisclaimer: "Calorie estimates are calculated from photo analysis and are approximate. Not medical advice, not a personal calorie target. For health decisions, consult a healthcare professional.",
    sessionCount: (n: number) => `${n} analyses this session`,
  },
} as const;

export type Translations = typeof t.id;
