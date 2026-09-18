import { useState } from "react";
import { COLORS, NUTRI } from "../lib/constants";
import { Lang } from "../lib/i18n";
import { Link } from "../lib/router";
import { registerNative, loginPassword, sendLoginCode, verifyLoginCode } from "../lib/authApi";

const BORDER = "var(--border)";
const INK = "var(--text)";
const MUTED = "var(--text-soft)";
const tx = (lang: Lang, en: string, id: string) => (lang === "id" ? id : en);

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  background: "var(--surface)",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  color: INK,
  fontSize: 15,
};
const labelStyle: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: INK, marginBottom: 6, display: "block" };

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {off ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

// Password input with a show/hide eye toggle.
function PasswordField({ lang, value, onChange, placeholder, autoComplete }: {
  lang: Lang;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: 46, boxSizing: "border-box" }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? tx(lang, "Hide password", "Sembunyikan password") : tx(lang, "Show password", "Lihat password")}
        title={show ? tx(lang, "Hide password", "Sembunyikan password") : tx(lang, "Show password", "Lihat password")}
        style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: 0, padding: 8, cursor: "pointer", color: MUTED, display: "grid", placeItems: "center", lineHeight: 0 }}
      >
        <EyeIcon off={show} />
      </button>
    </div>
  );
}

function translateError(m: string, lang: Lang): string {
  const s = (m || "").toLowerCase();
  if (s.includes("invalid login") || s.includes("credential") || (s.includes("password") && !s.includes("8")))
    return tx(lang, "Wrong email or password.", "Email atau password salah.");
  if (s.includes("already") || s.includes("exists") || s.includes("terdaftar"))
    return tx(lang, "This email already has an account. Sign in instead.", "Email ini sudah punya akun. Silakan masuk.");
  if (s.includes("not_registered") || s.includes("belum terdaftar"))
    return tx(lang, "This email has no account yet — create one.", "Email ini belum punya akun — buat dulu.");
  if (s.includes("8")) return tx(lang, "Password must be at least 8 characters.", "Password minimal 8 karakter.");
  if (s.includes("fetch") || s.includes("network") || s.includes("failed to fetch"))
    return tx(lang, "Connection failed. Try again.", "Koneksi gagal. Coba lagi.");
  return m || tx(lang, "Something went wrong. Try again.", "Terjadi kesalahan. Coba lagi.");
}

type Mode = "in" | "up" | "code";

export function AuthPage({ lang, initialMode, onDone }: { lang: Lang; initialMode: Mode; onDone: () => void }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // register-only
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [consent, setConsent] = useState(false);
  // email-code
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : String(err), lang));
    } finally {
      setBusy(false);
    }
  };

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError(tx(lang, "Enter your email and password.", "Isi email dan password."));
    run(async () => {
      await loginPassword(email.trim(), password);
      onDone();
    });
  };

  const submitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !gender || !birthdate)
      return setError(tx(lang, "Please fill every field.", "Lengkapi semua kolom."));
    if (password.length < 8) return setError(tx(lang, "Password must be at least 8 characters.", "Password minimal 8 karakter."));
    if (!consent) return setError(tx(lang, "Please accept the terms to continue.", "Setujui ketentuan untuk lanjut."));
    run(async () => {
      await registerNative({ name: name.trim(), email: email.trim(), password, phone: phone.trim(), gender, date_of_birth: birthdate });
      onDone();
    });
  };

  const sendCode = () => {
    if (!email) return setError(tx(lang, "Enter your email first.", "Isi email dulu."));
    run(async () => {
      await sendLoginCode(email.trim());
      setCodeSent(true);
    });
  };
  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return setError(tx(lang, "Enter the code from your email.", "Masukkan kode dari email."));
    run(async () => {
      await verifyLoginCode(email.trim(), code.trim());
      onDone();
    });
  };

  const title =
    mode === "up"
      ? tx(lang, "Create your account", "Buat akunmu")
      : mode === "code"
      ? tx(lang, "Sign in with an email code", "Masuk dengan kode email")
      : tx(lang, "Sign in", "Masuk");
  const sub =
    mode === "up"
      ? tx(lang, "One 20FIT account — works here and on my.20fit.id.", "Satu akun 20FIT — jalan di sini & di my.20fit.id.")
      : tx(lang, "Welcome back to your calorie tracker.", "Selamat datang kembali di calorie tracker-mu.");

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "40px 20px 60px" }}>
      <div style={{ height: 6, borderRadius: 6, background: `linear-gradient(90deg, ${COLORS.RED}, ${NUTRI.GREEN})`, marginBottom: 20 }} />
      <h1 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: 30, textTransform: "uppercase", color: INK, margin: "0 0 6px" }}>{title}</h1>
      <p style={{ fontSize: 14, color: MUTED, margin: "0 0 22px", lineHeight: 1.55 }}>{sub}</p>

      {mode === "in" && (
        <form onSubmit={submitLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="kamu@email.com" />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <PasswordField lang={lang} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <div style={{ fontSize: 13, color: "var(--brand)" }}>{error}</div>}
          <button type="submit" disabled={busy} style={{ padding: "14px 0", border: 0, borderRadius: 12, background: "var(--brand)", color: "var(--on-brand)", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            {busy ? tx(lang, "Signing in…", "Masuk…") : tx(lang, "Sign in", "Masuk")}
          </button>
          <button type="button" onClick={() => { setMode("code"); setError(null); setCodeSent(false); }} style={{ background: "none", border: 0, color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
            {tx(lang, "Sign in with an email code instead", "Masuk pakai kode email")}
          </button>
        </form>
      )}

      {mode === "code" && (
        <form onSubmit={submitCode} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="kamu@email.com" disabled={codeSent} />
          </div>
          {!codeSent ? (
            <button type="button" onClick={sendCode} disabled={busy} style={{ padding: "14px 0", border: 0, borderRadius: 12, background: "var(--brand)", color: "var(--on-brand)", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              {busy ? tx(lang, "Sending…", "Mengirim…") : tx(lang, "Send code", "Kirim kode")}
            </button>
          ) : (
            <>
              <div>
                <label style={labelStyle}>{tx(lang, "Code from your email", "Kode dari email")}</label>
                <input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} style={inputStyle} placeholder="123456" />
              </div>
              <button type="submit" disabled={busy} style={{ padding: "14px 0", border: 0, borderRadius: 12, background: "var(--brand)", color: "var(--on-brand)", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                {busy ? tx(lang, "Verifying…", "Memverifikasi…") : tx(lang, "Verify & sign in", "Verifikasi & masuk")}
              </button>
            </>
          )}
          {error && <div style={{ fontSize: 13, color: "var(--brand)" }}>{error}</div>}
          <button type="button" onClick={() => { setMode("in"); setError(null); }} style={{ background: "none", border: 0, color: "var(--text)", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>
            {tx(lang, "Back to password sign-in", "Kembali ke masuk pakai password")}
          </button>
        </form>
      )}

      {mode === "up" && (
        <form onSubmit={submitRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>{tx(lang, "Full name", "Nama lengkap")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder={tx(lang, "Your name", "Nama kamu")} />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="kamu@email.com" />
          </div>
          <div>
            <label style={labelStyle}>{tx(lang, "Phone", "No. HP")}</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} placeholder="08xxxxxxxxxx" />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{tx(lang, "Gender", "Jenis kelamin")}</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
                <option value="">{tx(lang, "Choose…", "Pilih…")}</option>
                <option value="male">{tx(lang, "Male", "Pria")}</option>
                <option value="female">{tx(lang, "Female", "Wanita")}</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{tx(lang, "Birth date", "Tgl lahir")}</label>
              <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} style={inputStyle} max={new Date().toISOString().slice(0, 10)} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <PasswordField lang={lang} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={tx(lang, "Min. 8 characters", "Min. 8 karakter")} />
          </div>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
            <span>{tx(lang, "I agree to 20FIT's terms and privacy policy.", "Saya setuju dengan ketentuan & kebijakan privasi 20FIT.")}</span>
          </label>
          {error && <div style={{ fontSize: 13, color: "var(--brand)" }}>{error}</div>}
          <button type="submit" disabled={busy} style={{ padding: "14px 0", border: 0, borderRadius: 12, background: "var(--brand)", color: "var(--on-brand)", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            {busy ? tx(lang, "Creating account…", "Membuat akun…") : tx(lang, "Create free account", "Buat akun gratis")}
          </button>
        </form>
      )}

      <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${BORDER}`, textAlign: "center", fontSize: 13.5, color: MUTED }}>
        {mode === "up" ? (
          <>
            {tx(lang, "Already have an account?", "Sudah punya akun?")}{" "}
            <button onClick={() => { setMode("in"); setError(null); }} style={{ background: "none", border: 0, color: "var(--brand)", fontWeight: 700, cursor: "pointer" }}>
              {tx(lang, "Sign in", "Masuk")}
            </button>
          </>
        ) : (
          <>
            {tx(lang, "New to 20FIT?", "Belum punya akun?")}{" "}
            <button onClick={() => { setMode("up"); setError(null); }} style={{ background: "none", border: 0, color: "var(--brand)", fontWeight: 700, cursor: "pointer" }}>
              {tx(lang, "Create a free account", "Buat akun gratis")}
            </button>
          </>
        )}
      </div>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Link href="/" style={{ fontSize: 12.5, color: MUTED, textDecoration: "underline" }}>{tx(lang, "← Back", "← Kembali")}</Link>
      </div>
    </div>
  );
}
