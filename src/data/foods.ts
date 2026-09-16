// Indonesian food database — the searchable reference behind quick lookup and
// the tracker's "add food" flow. Values are per the serving shown (NOT always
// per 100g): calories in kcal, protein/carbs/fat/fiber in grams.
//
// Primary source: TKPI (Tabel Komposisi Pangan Indonesia, Kemenkes RI); a few
// items from USDA, product labels, or reasoned estimates for composite dishes
// — each row carries its `source`. Composite restaurant dishes ("Estimasi")
// vary a lot by portion and recipe; treat them as ballpark, same caveat the
// brief attaches to them.
//
// WHY STATIC (not the brief's food_database Postgres table): this repo has no
// migration runner / Supabase write access from CI (see supabase/migrations
// headers). This list is small, read-only reference data, so bundling it makes
// search instant and offline-safe. A matching food_database migration (schema
// + this seed) is provided under supabase/migrations for a future DB-backed
// version; the app reads this bundle today.
import { Lang } from "../lib/i18n";

export type FoodCategory =
  | "staple"
  | "protein"
  | "vegetable"
  | "fruit"
  | "snack"
  | "beverage"
  | "fast-food"
  | "dairy-nuts";

export interface Food {
  id: string;
  name: string;
  nameEn?: string;
  category: FoodCategory;
  servingSize: number;
  servingUnit: string; // gram | ml — the measure of `servingSize`; the human
  // portion ("1 butir", "1 porsi", "1 centong") lives in servingDescription
  servingDescription?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  source: string;
}

// prettier-ignore
export const FOODS: Food[] = [
  // ---- MAKANAN POKOK / STAPLE ----
  { id: "nasi-putih", name: "Nasi Putih", nameEn: "White Rice", category: "staple", servingSize: 100, servingUnit: "gram", servingDescription: "1 centong", calories: 130, protein: 2.7, carbs: 28.6, fat: 0.3, fiber: 0.4, source: "TKPI" },
  { id: "nasi-merah", name: "Nasi Merah", nameEn: "Brown Rice", category: "staple", servingSize: 100, servingUnit: "gram", servingDescription: "1 centong", calories: 110, protein: 2.8, carbs: 23.5, fat: 0.9, fiber: 1.8, source: "TKPI" },
  { id: "nasi-uduk", name: "Nasi Uduk", nameEn: "Coconut Rice", category: "staple", servingSize: 150, servingUnit: "gram", servingDescription: "1 porsi", calories: 265, protein: 4, carbs: 40, fat: 9, source: "Estimasi" },
  { id: "mie-instan", name: "Mie Instan (dimasak)", nameEn: "Instant Noodles", category: "staple", servingSize: 80, servingUnit: "gram", servingDescription: "1 bungkus", calories: 350, protein: 8, carbs: 50, fat: 13, source: "Label Produk" },
  { id: "bihun-goreng", name: "Bihun Goreng", nameEn: "Fried Rice Vermicelli", category: "staple", servingSize: 150, servingUnit: "gram", servingDescription: "1 porsi", calories: 290, protein: 6, carbs: 45, fat: 9, source: "Estimasi" },
  { id: "roti-tawar-putih", name: "Roti Tawar Putih", nameEn: "White Bread", category: "staple", servingSize: 35, servingUnit: "gram", servingDescription: "1 lembar", calories: 90, protein: 3, carbs: 17, fat: 1, source: "TKPI" },
  { id: "roti-gandum", name: "Roti Gandum", nameEn: "Whole Wheat Bread", category: "staple", servingSize: 40, servingUnit: "gram", servingDescription: "1 lembar", calories: 100, protein: 4, carbs: 18, fat: 1.5, fiber: 2.5, source: "Label Produk" },
  { id: "kentang-rebus", name: "Kentang Rebus", nameEn: "Boiled Potato", category: "staple", servingSize: 100, servingUnit: "gram", servingDescription: "1 buah sedang", calories: 62, protein: 2, carbs: 14, fat: 0.1, fiber: 1.8, source: "TKPI" },
  { id: "singkong-rebus", name: "Singkong Rebus", nameEn: "Boiled Cassava", category: "staple", servingSize: 100, servingUnit: "gram", servingDescription: "1 potong", calories: 154, protein: 1.2, carbs: 37, fat: 0.3, fiber: 1.8, source: "TKPI" },
  { id: "ubi-rebus", name: "Ubi Jalar Rebus", nameEn: "Boiled Sweet Potato", category: "staple", servingSize: 100, servingUnit: "gram", servingDescription: "1 buah sedang", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, source: "TKPI" },
  { id: "jagung-rebus", name: "Jagung Rebus", nameEn: "Boiled Corn", category: "staple", servingSize: 100, servingUnit: "gram", servingDescription: "1 buah", calories: 96, protein: 3.4, carbs: 21, fat: 1.5, fiber: 2.4, source: "TKPI" },
  { id: "oatmeal", name: "Oatmeal", nameEn: "Oatmeal", category: "staple", servingSize: 40, servingUnit: "gram", servingDescription: "4 sendok makan", calories: 150, protein: 5, carbs: 27, fat: 2.5, fiber: 4, source: "USDA" },
  { id: "nasi-shirataki", name: "Nasi Shirataki", nameEn: "Shirataki Rice", category: "staple", servingSize: 150, servingUnit: "gram", servingDescription: "1 porsi", calories: 15, protein: 0.5, carbs: 5, fat: 0, fiber: 3, source: "Label Produk" },

  // ---- PROTEIN ----
  { id: "dada-ayam-rebus", name: "Dada Ayam Tanpa Kulit (rebus)", nameEn: "Boiled Chicken Breast", category: "protein", servingSize: 100, servingUnit: "gram", servingDescription: "1 potong", calories: 165, protein: 31, carbs: 0, fat: 3.6, source: "TKPI" },
  { id: "ayam-goreng", name: "Ayam Goreng (paha)", nameEn: "Fried Chicken Thigh", category: "protein", servingSize: 100, servingUnit: "gram", servingDescription: "1 potong", calories: 245, protein: 22, carbs: 3, fat: 16, source: "Estimasi" },
  { id: "telur-rebus", name: "Telur Ayam (rebus)", nameEn: "Boiled Egg", category: "protein", servingSize: 60, servingUnit: "gram", servingDescription: "1 butir", calories: 90, protein: 7, carbs: 0.6, fat: 6.3, source: "TKPI" },
  { id: "telur-dadar", name: "Telur Dadar", nameEn: "Fried Egg / Omelet", category: "protein", servingSize: 65, servingUnit: "gram", servingDescription: "1 butir", calories: 130, protein: 7, carbs: 1, fat: 11, source: "Estimasi" },
  { id: "salmon-panggang", name: "Ikan Salmon (panggang)", nameEn: "Grilled Salmon", category: "protein", servingSize: 100, servingUnit: "gram", servingDescription: "1 fillet kecil", calories: 208, protein: 20, carbs: 0, fat: 13, source: "USDA" },
  { id: "tempe-goreng", name: "Tempe (goreng)", nameEn: "Fried Tempeh", category: "protein", servingSize: 50, servingUnit: "gram", servingDescription: "2 potong", calories: 150, protein: 9.5, carbs: 8.5, fat: 9, fiber: 2, source: "TKPI" },
  { id: "tempe-kukus", name: "Tempe (kukus/rebus)", nameEn: "Steamed Tempeh", category: "protein", servingSize: 50, servingUnit: "gram", servingDescription: "2 potong", calories: 100, protein: 10, carbs: 7, fat: 4, fiber: 2, source: "TKPI" },
  { id: "tahu-goreng", name: "Tahu Putih (goreng)", nameEn: "Fried Tofu", category: "protein", servingSize: 50, servingUnit: "gram", servingDescription: "1 potong besar", calories: 115, protein: 5, carbs: 2.5, fat: 9.5, source: "TKPI" },
  { id: "tahu-rebus", name: "Tahu Putih (rebus)", nameEn: "Boiled Tofu", category: "protein", servingSize: 50, servingUnit: "gram", servingDescription: "1 potong besar", calories: 40, protein: 4.5, carbs: 1, fat: 2.5, source: "TKPI" },
  { id: "rendang-sapi", name: "Daging Sapi (rendang)", nameEn: "Beef Rendang", category: "protein", servingSize: 100, servingUnit: "gram", servingDescription: "1 potong", calories: 193, protein: 27, carbs: 2, fat: 9, source: "TKPI" },
  { id: "daging-sapi-giling", name: "Daging Sapi Giling (tumis)", nameEn: "Ground Beef", category: "protein", servingSize: 100, servingUnit: "gram", servingDescription: "1 porsi", calories: 215, protein: 26, carbs: 0, fat: 12, source: "USDA" },
  { id: "udang-rebus", name: "Udang (rebus)", nameEn: "Boiled Shrimp", category: "protein", servingSize: 100, servingUnit: "gram", servingDescription: "10 ekor sedang", calories: 99, protein: 21, carbs: 0.2, fat: 1.1, source: "TKPI" },
  { id: "tongkol-goreng", name: "Ikan Tongkol (goreng)", nameEn: "Fried Tuna", category: "protein", servingSize: 80, servingUnit: "gram", servingDescription: "1 potong", calories: 145, protein: 22, carbs: 0, fat: 6, source: "TKPI" },
  { id: "lele-goreng", name: "Ikan Lele (goreng)", nameEn: "Fried Catfish", category: "protein", servingSize: 100, servingUnit: "gram", servingDescription: "1 ekor", calories: 190, protein: 18, carbs: 0, fat: 13, source: "Estimasi" },
  { id: "kembung-goreng", name: "Ikan Kembung (goreng)", nameEn: "Fried Mackerel", category: "protein", servingSize: 80, servingUnit: "gram", servingDescription: "1 ekor", calories: 165, protein: 20, carbs: 0, fat: 9, source: "TKPI" },

  // ---- SAYURAN / VEGETABLE ----
  { id: "bayam-rebus", name: "Bayam (rebus)", nameEn: "Boiled Spinach", category: "vegetable", servingSize: 100, servingUnit: "gram", servingDescription: "1 mangkok", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, source: "TKPI" },
  { id: "brokoli-rebus", name: "Brokoli (rebus)", nameEn: "Boiled Broccoli", category: "vegetable", servingSize: 100, servingUnit: "gram", servingDescription: "1 mangkok", calories: 35, protein: 2.4, carbs: 7, fat: 0.4, fiber: 3.3, source: "TKPI" },
  { id: "kangkung-tumis", name: "Kangkung (tumis)", nameEn: "Stir-fried Water Spinach", category: "vegetable", servingSize: 100, servingUnit: "gram", servingDescription: "1 porsi", calories: 50, protein: 3, carbs: 4, fat: 2.5, fiber: 2, source: "TKPI" },
  { id: "wortel-rebus", name: "Wortel (rebus)", nameEn: "Boiled Carrot", category: "vegetable", servingSize: 100, servingUnit: "gram", servingDescription: "1 buah", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, source: "TKPI" },
  { id: "terong-tumis", name: "Terong (tumis)", nameEn: "Stir-fried Eggplant", category: "vegetable", servingSize: 100, servingUnit: "gram", servingDescription: "1 porsi", calories: 55, protein: 1, carbs: 6, fat: 3, fiber: 2.5, source: "TKPI" },
  { id: "capcay", name: "Capcay (tumis)", nameEn: "Mixed Stir-fried Vegetables", category: "vegetable", servingSize: 150, servingUnit: "gram", servingDescription: "1 porsi", calories: 95, protein: 4, carbs: 10, fat: 4.5, fiber: 3, source: "Estimasi" },
  { id: "sup-sayur", name: "Sup Sayur Bening", nameEn: "Clear Vegetable Soup", category: "vegetable", servingSize: 200, servingUnit: "gram", servingDescription: "1 mangkok", calories: 60, protein: 3, carbs: 8, fat: 1.5, fiber: 2.5, source: "Estimasi" },

  // ---- BUAH / FRUIT ----
  { id: "pisang-ambon", name: "Pisang Ambon", nameEn: "Banana", category: "fruit", servingSize: 120, servingUnit: "gram", servingDescription: "1 buah", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, source: "TKPI" },
  { id: "apel-merah", name: "Apel Merah", nameEn: "Red Apple", category: "fruit", servingSize: 150, servingUnit: "gram", servingDescription: "1 buah sedang", calories: 78, protein: 0.4, carbs: 21, fat: 0.2, fiber: 3.6, source: "TKPI" },
  { id: "jeruk-manis", name: "Jeruk Manis", nameEn: "Orange", category: "fruit", servingSize: 130, servingUnit: "gram", servingDescription: "1 buah", calories: 62, protein: 1, carbs: 15, fat: 0.2, fiber: 3.1, source: "TKPI" },
  { id: "semangka", name: "Semangka", nameEn: "Watermelon", category: "fruit", servingSize: 150, servingUnit: "gram", servingDescription: "1 potong", calories: 45, protein: 0.9, carbs: 11, fat: 0.2, fiber: 0.6, source: "TKPI" },
  { id: "alpukat", name: "Alpukat", nameEn: "Avocado", category: "fruit", servingSize: 100, servingUnit: "gram", servingDescription: "setengah buah", calories: 160, protein: 2, carbs: 8.5, fat: 15, fiber: 6.7, source: "TKPI" },
  { id: "mangga", name: "Mangga", nameEn: "Mango", category: "fruit", servingSize: 150, servingUnit: "gram", servingDescription: "1 buah kecil", calories: 99, protein: 1.4, carbs: 25, fat: 0.6, fiber: 2.6, source: "TKPI" },
  { id: "pepaya", name: "Pepaya", nameEn: "Papaya", category: "fruit", servingSize: 150, servingUnit: "gram", servingDescription: "1 potong", calories: 60, protein: 0.9, carbs: 15, fat: 0.2, fiber: 2.5, source: "TKPI" },
  { id: "nanas", name: "Nanas", nameEn: "Pineapple", category: "fruit", servingSize: 150, servingUnit: "gram", servingDescription: "1 potong", calories: 75, protein: 0.8, carbs: 20, fat: 0.2, fiber: 2, source: "TKPI" },
  { id: "pir", name: "Pir", nameEn: "Pear", category: "fruit", servingSize: 150, servingUnit: "gram", servingDescription: "1 buah", calories: 85, protein: 0.6, carbs: 23, fat: 0.2, fiber: 4.5, source: "USDA" },

  // ---- SNACK & JAJAN ----
  { id: "bakwan", name: "Gorengan (bakwan)", nameEn: "Vegetable Fritter", category: "snack", servingSize: 50, servingUnit: "gram", servingDescription: "1 buah", calories: 142, protein: 2.5, carbs: 14, fat: 9, source: "TKPI" },
  { id: "pisang-goreng", name: "Pisang Goreng", nameEn: "Fried Banana", category: "snack", servingSize: 60, servingUnit: "gram", servingDescription: "1 buah", calories: 135, protein: 1.5, carbs: 20, fat: 6, source: "Estimasi" },
  { id: "tahu-isi", name: "Tahu Isi (goreng)", nameEn: "Stuffed Fried Tofu", category: "snack", servingSize: 60, servingUnit: "gram", servingDescription: "1 buah", calories: 128, protein: 4, carbs: 12, fat: 7, source: "Estimasi" },
  { id: "martabak-manis", name: "Martabak Manis", nameEn: "Sweet Martabak", category: "snack", servingSize: 100, servingUnit: "gram", servingDescription: "1 potong", calories: 330, protein: 7, carbs: 42, fat: 15, source: "Estimasi" },
  { id: "keripik-singkong", name: "Keripik Singkong", nameEn: "Cassava Chips", category: "snack", servingSize: 30, servingUnit: "gram", servingDescription: "1 genggam", calories: 152, protein: 0.5, carbs: 18, fat: 9, source: "Label Produk" },
  { id: "kue-lapis", name: "Kue Lapis", nameEn: "Layer Cake", category: "snack", servingSize: 50, servingUnit: "gram", servingDescription: "1 potong", calories: 145, protein: 2, carbs: 22, fat: 6, source: "TKPI" },
  { id: "donat-gula", name: "Donat Gula", nameEn: "Sugar Donut", category: "snack", servingSize: 60, servingUnit: "gram", servingDescription: "1 buah", calories: 195, protein: 3, carbs: 26, fat: 9, source: "Estimasi" },
  { id: "biskuit", name: "Biskuit Marie", nameEn: "Marie Biscuit", category: "snack", servingSize: 30, servingUnit: "gram", servingDescription: "4 keping", calories: 130, protein: 2, carbs: 22, fat: 3.5, source: "Label Produk" },

  // ---- MINUMAN / BEVERAGE ----
  { id: "air-putih", name: "Air Putih", nameEn: "Water", category: "beverage", servingSize: 250, servingUnit: "ml", servingDescription: "1 gelas", calories: 0, protein: 0, carbs: 0, fat: 0, source: "-" },
  { id: "teh-tawar", name: "Teh Tawar", nameEn: "Unsweetened Tea", category: "beverage", servingSize: 250, servingUnit: "ml", servingDescription: "1 gelas", calories: 2, protein: 0, carbs: 0.5, fat: 0, source: "Estimasi" },
  { id: "kopi-hitam", name: "Kopi Hitam Tanpa Gula", nameEn: "Black Coffee", category: "beverage", servingSize: 200, servingUnit: "ml", servingDescription: "1 cangkir", calories: 5, protein: 0.3, carbs: 0, fat: 0, source: "USDA" },
  { id: "kopi-susu-gula-aren", name: "Kopi Susu Gula Aren", nameEn: "Palm Sugar Latte", category: "beverage", servingSize: 300, servingUnit: "ml", servingDescription: "1 gelas", calories: 180, protein: 4, carbs: 28, fat: 6, source: "Estimasi" },
  { id: "es-teh-manis", name: "Es Teh Manis", nameEn: "Sweet Iced Tea", category: "beverage", servingSize: 250, servingUnit: "ml", servingDescription: "1 gelas", calories: 90, protein: 0, carbs: 23, fat: 0, source: "Estimasi" },
  { id: "susu-full-cream", name: "Susu Full Cream", nameEn: "Whole Milk", category: "beverage", servingSize: 200, servingUnit: "ml", servingDescription: "1 gelas", calories: 122, protein: 6, carbs: 10, fat: 6.5, source: "TKPI" },
  { id: "susu-kedelai", name: "Susu Kedelai", nameEn: "Soy Milk", category: "beverage", servingSize: 200, servingUnit: "ml", servingDescription: "1 gelas", calories: 90, protein: 7, carbs: 8, fat: 4, source: "TKPI" },
  { id: "jus-jeruk", name: "Jus Jeruk (tanpa gula)", nameEn: "Orange Juice", category: "beverage", servingSize: 250, servingUnit: "ml", servingDescription: "1 gelas", calories: 112, protein: 1.7, carbs: 26, fat: 0.5, source: "TKPI" },
  { id: "air-kelapa", name: "Air Kelapa Muda", nameEn: "Coconut Water", category: "beverage", servingSize: 240, servingUnit: "ml", servingDescription: "1 gelas", calories: 46, protein: 1.7, carbs: 9, fat: 0.5, source: "TKPI" },
  { id: "boba-milk-tea", name: "Boba Milk Tea", nameEn: "Boba Milk Tea", category: "beverage", servingSize: 400, servingUnit: "ml", servingDescription: "1 cup", calories: 320, protein: 3, carbs: 60, fat: 8, source: "Estimasi" },

  // ---- FAST FOOD / RESTO ----
  { id: "ayam-geprek-nasi", name: "Ayam Geprek + Nasi", nameEn: "Smashed Fried Chicken + Rice", category: "fast-food", servingSize: 300, servingUnit: "gram", servingDescription: "1 porsi", calories: 550, protein: 28, carbs: 55, fat: 24, source: "Estimasi" },
  { id: "mie-ayam", name: "Mie Ayam", nameEn: "Chicken Noodles", category: "fast-food", servingSize: 350, servingUnit: "gram", servingDescription: "1 mangkok", calories: 420, protein: 18, carbs: 52, fat: 16, source: "Estimasi" },
  { id: "soto-ayam-nasi", name: "Soto Ayam + Nasi", nameEn: "Chicken Soto + Rice", category: "fast-food", servingSize: 400, servingUnit: "gram", servingDescription: "1 porsi", calories: 380, protein: 20, carbs: 45, fat: 13, source: "Estimasi" },
  { id: "gado-gado", name: "Gado-gado", nameEn: "Gado-gado", category: "fast-food", servingSize: 300, servingUnit: "gram", servingDescription: "1 porsi", calories: 350, protein: 14, carbs: 30, fat: 20, fiber: 6, source: "Estimasi" },
  { id: "nasi-goreng", name: "Nasi Goreng", nameEn: "Fried Rice", category: "fast-food", servingSize: 250, servingUnit: "gram", servingDescription: "1 porsi", calories: 400, protein: 12, carbs: 50, fat: 17, source: "Estimasi" },
  { id: "bakso", name: "Bakso (5 butir + mie + kuah)", nameEn: "Meatball Soup", category: "fast-food", servingSize: 400, servingUnit: "gram", servingDescription: "1 mangkok", calories: 350, protein: 18, carbs: 40, fat: 12, source: "Estimasi" },
  { id: "nasi-padang-rendang", name: "Nasi Padang (rendang)", nameEn: "Padang Rice w/ Rendang", category: "fast-food", servingSize: 350, servingUnit: "gram", servingDescription: "1 porsi", calories: 640, protein: 26, carbs: 70, fat: 28, source: "Estimasi" },
  { id: "sate-ayam", name: "Sate Ayam (10 tusuk + bumbu)", nameEn: "Chicken Satay", category: "fast-food", servingSize: 200, servingUnit: "gram", servingDescription: "10 tusuk", calories: 380, protein: 28, carbs: 18, fat: 22, source: "Estimasi" },
  { id: "pecel-lele-nasi", name: "Pecel Lele + Nasi", nameEn: "Fried Catfish + Rice", category: "fast-food", servingSize: 350, servingUnit: "gram", servingDescription: "1 porsi", calories: 520, protein: 24, carbs: 58, fat: 22, source: "Estimasi" },
  { id: "ketoprak", name: "Ketoprak", nameEn: "Ketoprak", category: "fast-food", servingSize: 300, servingUnit: "gram", servingDescription: "1 porsi", calories: 410, protein: 13, carbs: 55, fat: 16, source: "Estimasi" },
  { id: "burger", name: "Burger Daging", nameEn: "Beef Burger", category: "fast-food", servingSize: 220, servingUnit: "gram", servingDescription: "1 buah", calories: 500, protein: 25, carbs: 40, fat: 27, source: "Estimasi" },
  { id: "pizza-slice", name: "Pizza (1 potong)", nameEn: "Pizza Slice", category: "fast-food", servingSize: 100, servingUnit: "gram", servingDescription: "1 potong", calories: 270, protein: 11, carbs: 30, fat: 11, source: "Estimasi" },
  { id: "kentang-goreng-ff", name: "Kentang Goreng", nameEn: "French Fries", category: "fast-food", servingSize: 100, servingUnit: "gram", servingDescription: "1 porsi sedang", calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8, source: "USDA" },

  // ---- DAIRY & NUTS ----
  { id: "almond", name: "Kacang Almond", nameEn: "Almonds", category: "dairy-nuts", servingSize: 20, servingUnit: "gram", servingDescription: "1 genggam kecil", calories: 116, protein: 4.2, carbs: 4.4, fat: 10, fiber: 2.5, source: "USDA" },
  { id: "yogurt-plain", name: "Yogurt Plain", nameEn: "Plain Yogurt", category: "dairy-nuts", servingSize: 150, servingUnit: "gram", servingDescription: "1 cup", calories: 90, protein: 8, carbs: 12, fat: 1, source: "USDA" },
  { id: "keju-cheddar", name: "Keju Cheddar", nameEn: "Cheddar Cheese", category: "dairy-nuts", servingSize: 20, servingUnit: "gram", servingDescription: "1 lembar", calories: 80, protein: 5, carbs: 0.5, fat: 6.5, source: "USDA" },
  { id: "selai-kacang", name: "Selai Kacang", nameEn: "Peanut Butter", category: "dairy-nuts", servingSize: 16, servingUnit: "gram", servingDescription: "1 sdm", calories: 94, protein: 4, carbs: 3, fat: 8, source: "USDA" },
];

export const FOOD_CATEGORY_LABELS: Record<Lang, Record<FoodCategory, string>> = {
  id: {
    staple: "Makanan Pokok",
    protein: "Protein",
    vegetable: "Sayuran",
    fruit: "Buah",
    snack: "Snack & Jajan",
    beverage: "Minuman",
    "fast-food": "Fast Food / Resto",
    "dairy-nuts": "Dairy & Kacang",
  },
  en: {
    staple: "Staples",
    protein: "Protein",
    vegetable: "Vegetables",
    fruit: "Fruit",
    snack: "Snacks",
    beverage: "Beverages",
    "fast-food": "Fast Food",
    "dairy-nuts": "Dairy & Nuts",
  },
};

export const FOOD_CATEGORIES: FoodCategory[] = [
  "staple",
  "protein",
  "vegetable",
  "fruit",
  "snack",
  "beverage",
  "fast-food",
  "dairy-nuts",
];

// Accent-fold + lowercase so "É"/"Ê" and stray casing don't break matches.
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/**
 * Search foods by name (id + en). Ranks prefix matches above substring
 * matches, then alphabetically. An empty query returns [] (callers decide
 * whether to show a browse-by-category view instead).
 */
export function searchFoods(query: string, limit = 24): Food[] {
  const q = norm(query);
  if (!q) return [];
  const scored: { food: Food; score: number }[] = [];
  for (const food of FOODS) {
    const name = norm(food.name);
    const nameEn = norm(food.nameEn || "");
    let score = -1;
    if (name.startsWith(q) || nameEn.startsWith(q)) score = 3;
    else if (name.includes(q) || nameEn.includes(q)) score = 2;
    else if (norm(food.category).includes(q)) score = 1;
    if (score >= 0) scored.push({ food, score });
  }
  scored.sort((a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name));
  return scored.slice(0, limit).map((s) => s.food);
}

export function foodsByCategory(category: FoodCategory): Food[] {
  return FOODS.filter((f) => f.category === category);
}

export function getFood(id: string): Food | undefined {
  return FOODS.find((f) => f.id === id);
}

// Scale a food's macros to N servings, rounded for display.
export interface ScaledNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}
export function scaleFood(food: Food, servings: number): ScaledNutrition {
  const s = servings > 0 ? servings : 1;
  const r1 = (n: number) => Math.round(n * s * 10) / 10;
  return {
    calories: Math.round(food.calories * s),
    protein: r1(food.protein),
    carbs: r1(food.carbs),
    fat: r1(food.fat),
    fiber: r1(food.fiber || 0),
  };
}
