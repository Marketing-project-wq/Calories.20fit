// Faithful TypeScript port of the deterministic "Today's Food Summary" logic
// from my.20fit.id/calories (calories.html:458-646). ALL local & deterministic
// — no external API. Health meter (0-100), per-item verdict, nutrient gap, and
// "what to eat next" match the source's formulas, regex tables, thresholds and
// copy exactly so the two apps read identically for the same log.
//
// Reference (verified): calories.html:481-568 (health, verdict, next-guidance,
// gap) + 623-625 (verdict text) in repo PROFILE20FIT.
import { Lang } from "./i18n";
import { DailyFoodItem } from "./memberTracker";
import { MacroTargets } from "./nutrition";

type Bi = { en: string; id: string };
const L = (o: Bi, lang: Lang) => o[lang];

export interface Totals {
  kcal: number;
  p: number;
  c: number;
  f: number;
  n: number;
}

export function totals(items: DailyFoodItem[]): Totals {
  return {
    kcal: items.reduce((s, i) => s + (Number(i.kcal) || 0), 0),
    p: items.reduce((s, i) => s + (Number(i.p) || 0), 0),
    c: items.reduce((s, i) => s + (Number(i.c) || 0), 0),
    f: items.reduce((s, i) => s + (Number(i.f) || 0), 0),
    n: items.length,
  };
}

// Regex tables — copied verbatim from the source.
const GOOD_QUALITY = /salad|sayur|vegetable|veg\b|grill|panggang|bakar|steam|kukus|rebus|boil|oat|fruit|buah|ayam|chicken|fish|ikan|telur|egg|tofu|tahu|tempe|yogurt|greek|edamame|beans|kacang/;
const BAD_QUALITY = /goreng|fried|crispy|krispi|nugget|fries|donut|donat|cake|\bkue\b|soda|cola|boba|ice cream|es krim|candy|permen|syrup|sirup|choco|coklat|cookie|biskuit|instan|instant|burger|pizza|chips|keripik/;

const FSUM_GOOD = /salad|sayur|vegetable|veg\b|grill|panggang|bakar|steam|kukus|rebus|boil|oat|fruit|buah|ayam|chicken|fish|ikan|salmon|tuna|telur|egg|tofu|tahu|tempe|yogurt|greek|edamame|beans|kacang|lentil|brokoli|broccoli|bayam|spinach/;
const FSUM_BAD = /goreng|fried|crispy|krispi|nugget|fries|donut|donat|cake|\bkue\b|\bsoda\b|\bcola\b|boba|ice cream|es krim|candy|permen|syrup|sirup|choco|coklat|cookie|biskuit|instan|instant|burger|pizza|chips|keripik|martabak|gorengan|santan|rendang|padang/;

export type Band = "h" | "m" | "u";

export interface HealthResult {
  score: number;
  band: Band;
}

export function health(items: DailyFoodItem[], t: Totals, goal: number, macroT: MacroTargets): HealthResult {
  const g = goal || 2000;
  const MT = macroT || { p: 0, c: 0, f: 0 };
  const ratio = g > 0 ? t.kcal / g : 0;
  const calS = ratio <= 1.1 ? 30 : Math.max(0, 30 - (ratio - 1.1) * 100);
  const pS = MT.p > 0 ? Math.min(t.p / MT.p, 1) * 30 : 15;
  const aE = t.p * 4 + t.c * 4 + t.f * 9;
  const tE = MT.p * 4 + MT.c * 4 + MT.f * 9;
  let balS = 12.5;
  if (aE > 0 && tE > 0) {
    const d =
      Math.abs((t.p * 4) / aE - (MT.p * 4) / tE) +
      Math.abs((t.c * 4) / aE - (MT.c * 4) / tE) +
      Math.abs((t.f * 9) / aE - (MT.f * 9) / tE);
    balS = Math.max(0, 25 * (1 - d / 2));
  }
  let q = 12;
  items.forEach((i) => {
    const nm = String(i.name || "").toLowerCase();
    if (BAD_QUALITY.test(nm)) q -= 4;
    else if (GOOD_QUALITY.test(nm)) q += 2;
  });
  q = Math.max(0, Math.min(15, q));
  const score = Math.max(0, Math.min(100, Math.round(calS + pS + balS + q)));
  return { score, band: score >= 70 ? "h" : score >= 45 ? "m" : "u" };
}

export function healthNote(band: Band, lang: Lang): string {
  return band === "h"
    ? L({ en: "Balanced macros and good food choices today.", id: "Makro seimbang & pilihan makanan baik hari ini." }, lang)
    : band === "m"
    ? L({ en: "Decent — watch calories over target and add more protein/veggies.", id: "Lumayan — jaga kalori agar tak lewat target & tambah protein/sayur." }, lang)
    : L({ en: "Try leaner, higher-protein choices and less fried/sugary food.", id: "Coba pilihan lebih rendah lemak, tinggi protein & kurangi gorengan/manis." }, lang);
}

export function bandLabel(band: Band, lang: Lang): string {
  return band === "h"
    ? L({ en: "Healthy", id: "Sehat" }, lang)
    : band === "m"
    ? L({ en: "Moderate", id: "Cukup" }, lang)
    : L({ en: "Unhealthy", id: "Kurang Sehat" }, lang);
}

// Swap rules (food name -> healthier alternative). Verbatim from source.
const SWAP_RULES: { re: RegExp; to: Bi; rs: Bi }[] = [
  { re: /(fried chicken|ayam goreng)/, to: { en: "grilled chicken", id: "ayam panggang" }, rs: { en: "less oil, same protein", id: "lebih sedikit minyak, protein sama" } },
  { re: /(french fries|kentang goreng|\bfries\b)/, to: { en: "baked potato or sweet potato", id: "kentang/ubi panggang" }, rs: { en: "less oil, more fiber", id: "lebih sedikit minyak, lebih banyak serat" } },
  { re: /(\bsoda\b|\bcola\b|soft drink|bersoda)/, to: { en: "sparkling or infused water", id: "air soda tawar / infused water" }, rs: { en: "cuts added sugar", id: "tanpa gula tambahan" } },
  { re: /(boba|bubble tea|milk tea)/, to: { en: "unsweetened tea", id: "teh tawar" }, rs: { en: "much lower sugar", id: "jauh lebih rendah gula" } },
  { re: /(donut|donat|cake|\bkue\b|cookie|biskuit|pastry|martabak)/, to: { en: "Greek yogurt with fruit", id: "greek yogurt + buah" }, rs: { en: "more protein, less sugar", id: "lebih banyak protein, kurang gula" } },
  { re: /(ice cream|es krim)/, to: { en: "frozen yogurt or fruit", id: "frozen yogurt / buah beku" }, rs: { en: "lower sugar & fat", id: "lebih rendah gula & lemak" } },
  { re: /(white rice|nasi putih)/, to: { en: "brown rice", id: "nasi merah" }, rs: { en: "more fiber, steadier energy", id: "lebih banyak serat, energi stabil" } },
  { re: /(instant noodle|mie instan|indomie)/, to: { en: "whole-grain noodles + veg & egg", id: "mie gandum + sayur & telur" }, rs: { en: "more protein & fiber", id: "lebih banyak protein & serat" } },
  { re: /(chips|keripik|nugget)/, to: { en: "nuts or edamame", id: "kacang / edamame" }, rs: { en: "more protein, less refined", id: "lebih banyak protein, tak olahan" } },
];

export interface ItemVerdict {
  band: "good" | "ok" | "bad";
  cls: "hh" | "hm" | "hu";
  label: string;
  reason: string;
  swapTo?: string;
}

export function itemVerdict(it: DailyFoodItem, lang: Lang): ItemVerdict {
  const low = String(it.name || "").toLowerCase();
  const kcal = Number(it.kcal) || 0;
  const p = Number(it.p) || 0;
  const c = Number(it.c) || 0;
  const f = Number(it.f) || 0;
  let energy = p * 4 + c * 4 + f * 9;
  if (energy <= 0) energy = kcal > 0 ? kcal : 1;
  const pFrac = (p * 4) / energy;
  const fFrac = (f * 9) / energy;
  const isGood = FSUM_GOOD.test(low) && !FSUM_BAD.test(low);
  const fatty = fFrac > 0.5 && kcal >= 180;
  let band: "good" | "ok" | "bad";
  if (FSUM_BAD.test(low)) band = "bad";
  else if (fatty) band = isGood ? "ok" : "bad";
  else if (isGood || pFrac >= 0.28) band = "good";
  else band = "ok";
  const label =
    band === "good"
      ? L({ en: "Good choice", id: "Pilihan bagus" }, lang)
      : band === "ok"
      ? L({ en: "Could be better", id: "Bisa lebih baik" }, lang)
      : L({ en: "Not ideal", id: "Kurang ideal" }, lang);
  const reason =
    band === "good"
      ? pFrac >= 0.28
        ? L({ en: "protein-rich", id: "tinggi protein" }, lang)
        : L({ en: "whole, minimally processed", id: "utuh, minim olahan" }, lang)
      : band === "bad"
      ? FSUM_BAD.test(low)
        ? L({ en: "fried/sugary/processed", id: "gorengan/manis/olahan" }, lang)
        : L({ en: "high in fat", id: "tinggi lemak" }, lang)
      : fatty
      ? L({ en: "high in fat", id: "tinggi lemak" }, lang)
      : pFrac < 0.12
      ? L({ en: "low protein for its calories", id: "protein rendah utk kalorinya" }, lang)
      : L({ en: "refined — pair with protein/veg", id: "olahan — imbangi protein/sayur" }, lang);
  let swapTo: string | undefined;
  for (const rule of SWAP_RULES) {
    if (rule.re.test(low)) {
      swapTo = L(rule.to, lang);
      break;
    }
  }
  return { band, cls: band === "good" ? "hh" : band === "ok" ? "hm" : "hu", label, reason, swapTo };
}

// Nutrient gap: remaining macro vs daily target + static fallback foods for the biggest gap.
export interface StaticFood {
  e: string;
  name: string;
}
export interface NutrientGap {
  rem: { p: number; c: number; f: number };
  big: "p" | "c" | "f";
  bigLabel: string;
  met: boolean;
  labels: { p: string; c: string; f: string };
  staticFoods: StaticFood[];
}

export function nutrientGap(t: Totals, macroT: MacroTargets, lang: Lang): NutrientGap {
  const MT = macroT || { p: 0, c: 0, f: 0 };
  const rem = {
    p: Math.max(0, Math.round((MT.p || 0) - t.p)),
    c: Math.max(0, Math.round((MT.c || 0) - t.c)),
    f: Math.max(0, Math.round((MT.f || 0) - t.f)),
  };
  const labels = {
    p: L({ en: "Protein", id: "Protein" }, lang),
    c: L({ en: "Carbs", id: "Karbo" }, lang),
    f: L({ en: "Fat", id: "Lemak" }, lang),
  };
  const frac = (k: "p" | "c" | "f") => (MT[k] > 0 ? rem[k] / MT[k] : 0);
  const big = (["p", "c", "f"] as const).slice().sort((a, b) => frac(b) - frac(a))[0];
  const met = rem.p + rem.c + rem.f <= 0;
  const STAT: Record<"p" | "c" | "f", { e: string; en: string; id: string }[]> = {
    p: [
      { e: "🥚", en: "Boiled eggs", id: "Telur rebus" },
      { e: "🍗", en: "Grilled chicken breast", id: "Dada ayam panggang" },
      { e: "🧀", en: "Greek yogurt / cottage cheese", id: "Greek yogurt / keju cottage" },
    ],
    c: [
      { e: "🍚", en: "Brown rice", id: "Nasi merah" },
      { e: "🍠", en: "Sweet potato", id: "Ubi" },
      { e: "🌾", en: "Oats", id: "Oat" },
    ],
    f: [
      { e: "🥑", en: "Avocado", id: "Alpukat" },
      { e: "🥜", en: "Nuts / peanut butter", id: "Kacang / selai kacang" },
      { e: "🫒", en: "Olive oil drizzle", id: "Siraman minyak zaitun" },
    ],
  };
  return {
    rem,
    big,
    bigLabel: labels[big],
    met,
    labels,
    staticFoods: (STAT[big] || []).map((s) => ({ e: s.e, name: L({ en: s.en, id: s.id }, lang) })),
  };
}

// What to eat next: forward guidance from today's balance/quality.
export interface NextGuidance {
  msg: string;
  picks: string[];
}

export function nextGuidance(items: DailyFoodItem[], t: Totals, hh: HealthResult, lang: Lang): NextGuidance | null {
  if (!items.length) return null;
  const energy = t.p * 4 + t.c * 4 + t.f * 9;
  if (energy <= 0) return null;
  const carbFrac = (t.c * 4) / energy;
  const fatFrac = (t.f * 9) / energy;
  const lowProtein = t.kcal > 0 && t.p / t.kcal < 0.05;
  const carbHeavy = carbFrac > 0.55;
  const highFat = fatFrac > 0.4;
  let hasVeg = false;
  let hasSugar = false;
  const vegre = /salad|sayur|vegetable|veg\b|brokoli|broccoli|fruit|buah|beans|kacang|lentil|edamame|spinach|bayam/;
  items.forEach((i) => {
    const n = String(i.name || "").toLowerCase();
    if (vegre.test(n)) hasVeg = true;
    if (FSUM_BAD.test(n)) hasSugar = true;
  });
  const PROT: Bi[] = [
    { en: "grilled chicken with vegetables", id: "ayam panggang + sayur" },
    { en: "baked fish or salmon", id: "ikan/salmon panggang" },
    { en: "tofu or tempeh stir-fry", id: "tumis tahu/tempe" },
    { en: "Greek yogurt with berries", id: "greek yogurt + buah beri" },
    { en: "boiled eggs", id: "telur rebus" },
  ];
  const FIBER: Bi[] = [
    { en: "a big mixed salad", id: "salad sayur besar" },
    { en: "lentil or bean soup", id: "sup lentil/kacang" },
    { en: "steamed vegetables", id: "sayur kukus" },
    { en: "a piece of fruit", id: "sepotong buah" },
  ];
  const LIGHT: Bi[] = [
    { en: "a veggie omelet", id: "omelet sayur" },
    { en: "vegetable soup", id: "sup sayur" },
    { en: "Greek yogurt with berries", id: "greek yogurt + buah beri" },
  ];
  let msg: Bi;
  let picks: Bi[];
  if (hh && hh.band === "h" && !lowProtein && hasVeg) {
    msg = { en: "Solid day so far — keep the pattern. If you eat again, a light nutrient-dense option keeps it balanced.", id: "Hari ini sudah bagus — pertahankan. Kalau makan lagi, pilih yang ringan & padat nutrisi biar tetap seimbang." };
    picks = LIGHT;
  } else if (lowProtein && (carbHeavy || hasSugar)) {
    msg = { en: "Today's been carb-heavy and light on protein. A protein- and fiber-rich option next would balance it out.", id: "Hari ini cenderung tinggi karbo & kurang protein. Berikutnya pilih yang tinggi protein & serat untuk menyeimbangkan." };
    picks = PROT.concat(FIBER);
  } else if (lowProtein) {
    msg = { en: "A bit low on protein today — a lean-protein option next would help.", id: "Protein hari ini agak kurang — berikutnya pilih sumber protein rendah lemak." };
    picks = PROT;
  } else if (highFat) {
    msg = { en: "Fat's been on the higher side. Go lighter and add vegetables next.", id: "Lemak hari ini agak tinggi. Berikutnya pilih yang lebih ringan & tambah sayur." };
    picks = FIBER;
  } else if (!hasVeg) {
    msg = { en: "Not much vegetable or fiber yet today. Add some greens or fruit next.", id: "Sayur/serat hari ini masih sedikit. Tambah sayuran atau buah berikutnya." };
    picks = FIBER;
  } else {
    msg = { en: "Decent balance so far. A protein- and veg-forward option next keeps you on track.", id: "Keseimbangan cukup baik. Berikutnya pilih yang kaya protein & sayur biar tetap on-track." };
    picks = PROT.concat(FIBER);
  }
  return { msg: L(msg, lang), picks: picks.slice(0, 3).map((x) => L(x, lang)) };
}
