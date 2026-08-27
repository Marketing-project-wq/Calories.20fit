# CLAUDE.md — calories.20fit.id

## ATURAN UTAMA: Chat ini KHUSUS untuk deploy ke PRODUCTION

- **Default semua deploy = production**
- **Tolak / minta konfirmasi eksplisit sebelum deploy ke staging**
- Jika ada perintah deploy tanpa menyebut environment, anggap production

---

## Project

- **Nama:** calories.20fit.id
- **Repo:** https://github.com/Marketing-project-wq/Calories.20fit
- **Stack:** React 18 + TypeScript + Vite + TailwindCSS + Supabase
- **Branch utama:** `main`
- **Hosting:** Railway

## Production

- **Branch production:** `main`
- **Supabase project:** `cpvzwqptzcxnwzfzgrmt`
- **API base:** diatur via `VITE_API_URL` env var
- **Production URL:** `https://calories.20fit.id`

## Cara Deploy ke Production

```bash
# 1. Pastikan di branch main dan sudah up-to-date
git checkout main
git pull origin main

# 2. Build (opsional — Railway build otomatis saat push)
npm run build

# 3. Push ke main (trigger Railway deploy ke production)
git push origin main
```

Railway otomatis deploy dari branch `main` ke production environment.

## Environment Variables (Production)

| Variable | Keterangan |
|---|---|
| `VITE_SUPABASE_ANON_KEY` | Anon key dari Supabase project production |
| `VITE_API_URL` | `https://my.20fit.id` |

## Penting

- Chat ini KHUSUS production — semua deploy default ke `main`
- Konfirmasi eksplisit diperlukan sebelum melakukan sesuatu ke staging
- Selalu pastikan build sukses sebelum push ke production
