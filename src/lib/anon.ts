// anon_id BERSAMA lintas *.20fit.id (cookie `my20fit_anon`, JS-readable).
// Aksi anonim (scan tamu) di app ini memakai id yang SAMA dengan app 20FIT lain + my.20fit,
// jadi datanya ikut pindah saat user daftar/login (klaim idempoten via /api/anon/claim).
// Dikirim ke API lewat header x-anon-id.
function readCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}
function uuid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}
/** Ambil anon_id bersama; buat + set cookie .20fit.id kalau belum ada. */
export function getAnonId(): string {
  let id = readCookie("my20fit_anon");
  if (!id) {
    id = uuid();
    try {
      const host = location.hostname;
      const dom = /(^|\.)20fit\.id$/.test(host) ? "; domain=.20fit.id" : "";
      document.cookie =
        "my20fit_anon=" + encodeURIComponent(id) + dom +
        "; path=/; max-age=" + 30 * 24 * 3600 + "; SameSite=Lax; Secure";
    } catch {
      /* ignore */
    }
  }
  return id;
}
