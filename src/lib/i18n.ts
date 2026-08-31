export type Lang = "id" | "en";

export const t = {
  id: {
    // App tabs
    tabScan: "Scan Kalori",
    tabHistory: "Riwayat",
    tabInsight: "Tracker",
    // Auth nav (heading)
    signIn: "Masuk",
    signUp: "Daftar",
    signOut: "Keluar",
    openMy20fit: "Buka My 20FIT",
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
    errQuotaGuest: "Jatah scan gratis habis. Daftar akun gratis untuk lanjut scan.",
    errGeneric: "Gagal menganalisis foto",
    // Macros
    protein: "Protein",
    carbs: "Karbo",
    fat: "Lemak",
    locked: "🔒 Perlu akun",
    // Estimate range + confidence (hasil analisis — selalu terbuka)
    estimateLabel: "Estimasi dari foto",
    estimateRange: (min: number, max: number) => `${min}–${max} kkal`,
    confHigh: "keyakinan tinggi",
    confMedium: "keyakinan sedang",
    confLow: "keyakinan rendah",
    keyInsightsTitle: "Insight Utama",
    recommendationTitle: "Rekomendasi",
    needsMoreTitle: "Perlu ditambah",
    // Food Summary tab (member, akun tersambung ke my.20fit.id)
    saveToLog: "Simpan ke log hari ini",
    savingToLog: "Menyimpan…",
    savedToLog: "Tersimpan ke log hari ini",
    summaryTargetLabel: "Target Harian",
    summaryConsumedLabel: "Sudah Dimakan",
    summaryRemainingLabel: "Sisa",
    summaryOverLabel: "Lewat target",
    summaryMacroTitle: "Makro Hari Ini",
    summaryLogTitle: "Log Hari Ini",
    summaryEmptyLog: "Belum ada makanan yang di-log hari ini. Simpan hasil scan untuk mulai.",
    summaryEstimatedNote: "Target diperkirakan — lengkapi profil di my.20fit.id untuk target personal.",
    summarySyncNote: "Tersimpan di akun 20FIT kamu — juga kelihatan di my.20fit.id/calories.",
    summaryLoadError: "Gagal memuat log hari ini.",
    saveToLogError: "Gagal menyimpan ke log. Coba lagi.",
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
    tabInsight: "Tracker",
    // Auth nav (heading)
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    openMy20fit: "Open My 20FIT",
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
    errQuotaGuest: "Free scans used up. Sign up for a free account to keep scanning.",
    errGeneric: "Failed to analyze photo",
    // Macros
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    locked: "🔒 Account required",
    // Estimate range + confidence (part of the analysis result — always open)
    estimateLabel: "Estimate from photo",
    estimateRange: (min: number, max: number) => `${min}–${max} kcal`,
    confHigh: "high confidence",
    confMedium: "medium confidence",
    confLow: "low confidence",
    keyInsightsTitle: "Key Insights",
    recommendationTitle: "Recommendation",
    needsMoreTitle: "Needs more",
    // Food Summary tab (member, account linked to my.20fit.id)
    saveToLog: "Save to today's log",
    savingToLog: "Saving…",
    savedToLog: "Saved to today's log",
    summaryTargetLabel: "Daily Target",
    summaryConsumedLabel: "Consumed",
    summaryRemainingLabel: "Remaining",
    summaryOverLabel: "Over target",
    summaryMacroTitle: "Today's Macros",
    summaryLogTitle: "Today's Log",
    summaryEmptyLog: "No food logged today yet. Save a scan result to get started.",
    summaryEstimatedNote: "Targets are estimated — complete your profile at my.20fit.id for personalized goals.",
    summarySyncNote: "Saved to your 20FIT account — also visible on my.20fit.id/calories.",
    summaryLoadError: "Failed to load today's log.",
    saveToLogError: "Failed to save to log. Try again.",
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

// `t.id`/`t.en` are `as const`, so TS infers each string as ITS OWN literal
// type (e.g. tabScan: "Scan Kalori"), not `string`. That's fine as long as
// you only ever read `t[lang]` inline, but a component that takes the
// active translation set as a typed prop (e.g. `tr: Translations`) needs
// the WIDENED shape — otherwise passing `t.en` where `Translations` (pinned
// to `t.id`'s literals) is expected fails to typecheck even though it's the
// exact same shape. Widen strings/string-arrays, keep functions as-is.
type WidenTranslationValue<V> =
  V extends (...args: any[]) => any ? V :
  V extends readonly string[] ? readonly string[] :
  V extends string ? string :
  V;
export type Translations = { [K in keyof typeof t.id]: WidenTranslationValue<(typeof t.id)[K]> };
