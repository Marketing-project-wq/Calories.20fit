# STATUS — calorietracker.20fit.id

_Last updated: 2026-09-17_

## Model produk (KEPUTUSAN TERBARU)

**Hard gate + native rebuild.** Fitur penuh calorie tracker (target harian,
macro, scan, health meter, per-item check, nutrient gap, what-to-eat,
intermittent fasting, today's food) **HANYA untuk user yang login/punya akun
20FIT**. Non-akun cuma dapat:

- Landing (`/`) — hero + kalkulator TDEE (demo, tidak simpan data) + preview artikel.
- Artikel (`/articles`) — publik (marketing/SEO).
- Ajakan daftar/login ke my.20fit.id.

Route fitur (`/tracker`, `/scan`, `/meal-plan`, `/history`) untuk non-akun →
`AccountGate` (sign-up wall). Nav non-akun cuma Beranda + Artikel.

> Ini **membalik** model "trial access" lama (PR #7–#11) yang membuka
> scan/search untuk tamu. Guest scan (`/api/pub/scan`), guest food-search
> 3×/hari, dan iframe embed `my.20fit.id/calories` sudah **dicabut**.

## Arsitektur

- SPA Vite/React, di-serve statis (`serve -s dist`), deploy Railway dari `main`.
- **Native rebuild** dari `my.20fit.id/calories` (repo PROFILE20FIT), BUKAN iframe.
  Dipilih user secara eksplisit meski brief menyarankan "no kode kembar".
- **Konsistensi angka dijaga** karena input + formula SAMA:
  - Formula deterministik di-**port verbatim** dari `js/nutrition.js`,
    `js/fasting.js`, dan `calories.html` (food-summary). File: `src/lib/nutrition.ts`,
    `src/lib/fasting.ts`, `src/lib/foodSummary.ts`.
    ⚠️ **Trade-off:** formula sekarang ada di 2 tempat → wajib disinkron manual
    kalau `js/nutrition.js`/`fasting.js` di my.20fit berubah.
  - AI/scan & rekomendasi menu **TIDAK diduplikasi** — panggil endpoint my.20fit
    yang SAMA (`src/lib/api.ts`, `src/lib/menuRecommend.ts`).
- **Data SAMA dengan my.20fit** (Supabase project `cpvzwqptzcxnwzfzgrmt`):
  - `my20fit_profile` (target/makro), `my20fit_daily_log.cal_items` (log),
    `my20fit_fasting` (preferensi puasa). RLS `auth.uid()=auth_user_id`.
  - Log/scan dari sini muncul di my.20fit, dan sebaliknya.

## Endpoint my.20fit yang dipakai (reused, bukan diduplikasi)

| Fungsi | Endpoint | Auth |
|---|---|---|
| Photo scan | `POST /api/scan/ai` | Bearer JWT |
| Type food + grams | `POST /api/scan/food-text` (gratis) | Bearer JWT |
| Kuota scan | `GET /api/scan/quota` | Bearer JWT |
| Rekomendasi menu (fill-the-gap) | `GET /api/menu/recommend` | publik |
| Top-up | link ke `my.20fit.id/calories` (Xendit/FITCO di sana) | — |

CORS: my.20fit meng-echo origin `*.20fit.id` (`server.js:220`). `/api/scan/*`
pakai Bearer (BUKAN cookie) & **tidak** set `Allow-Credentials` → jangan kirim
`credentials:"include"` ke `/api/scan/*` (sudah dibetulkan di `api.ts`).

## Gate server-side (bukan cuma UI)

SPA ini tak punya server sendiri. Penegakan nyata:
- **RLS Supabase** (`auth.uid()=auth_user_id`) di `my20fit_profile`/`_daily_log`/`_fasting`.
- Endpoint scan my.20fit **wajib Bearer JWT** (401/402 tanpa login).
- `scanPhoto()` menolak tanpa sesi (`login_required`) — tak ada fallback guest.

## Belum diverifikasi (JUJUR)

- **Path member end-to-end** (login → tracker muncul → scan → log ke my.20fit)
  belum bisa dites di sandbox ini karena butuh sesi SSO my.20fit nyata.
  Perlu dites di staging dengan akun asli sebelum production.
- `build` & `tsc --noEmit` = bersih. Guest landing + gate = dites di browser (OK).

## Deploy

**JANGAN auto-deploy.** Staging dulu, tunggu approval. `main` → Railway production.
