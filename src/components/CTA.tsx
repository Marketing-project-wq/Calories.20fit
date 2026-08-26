import { COLORS, URLS } from "../lib/constants";

interface CTACompactProps {
  isQuotaExhausted?: boolean;
}

export const CTACompact = ({ isQuotaExhausted = false }: CTACompactProps) => {
  return (
    <div className="rounded-lg p-4" style={{ backgroundColor: COLORS.RED }}>
      <div className="text-white">
        <h3 className="font-semibold mb-1">{isQuotaExhausted ? "Kuota Scan Sudah Habis" : "Simpan Hasil Scan?"}</h3>
        <p className="text-sm mb-3 opacity-90">{isQuotaExhausted ? "Top-up untuk melanjutkan scan" : "Riwayat lengkap + lihat tren kalori"}</p>
      </div>
      <a href={URLS.TOPUP} className="block text-center py-2 px-4 bg-white rounded-lg font-semibold transition-opacity hover:opacity-90" style={{ color: COLORS.RED }}>
        Top-up Sekarang
      </a>
    </div>
  );
};

interface CTAFullProps {
  title: string;
  description: string;
  bullets?: string[];
}

export const CTAFull = ({ title, description, bullets = [] }: CTAFullProps) => {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="rounded-xl p-6 md:p-8" style={{ backgroundColor: COLORS.PINK_ACCENT }}>
        <h2 className="font-display text-2xl md:text-3xl font-bold uppercase mb-3" style={{ color: COLORS.BLACK }}>
          {title}
        </h2>
        <p className="text-sm text-gray-700 mb-6">{description}</p>

        {bullets.length > 0 && (
          <ul className="mb-6 space-y-2">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 items-start text-sm">
                <span>✓</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <a href={URLS.LOGIN} className="flex-1 text-center py-3 px-4 rounded-lg font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: COLORS.RED }}>
            Masuk / Daftar
          </a>
          <a href={URLS.MY_20FIT} className="flex-1 text-center py-3 px-4 rounded-lg font-semibold border transition-colors hover:bg-gray-100" style={{ color: COLORS.BLACK, borderColor: COLORS.BLACK }}>
            Buka My 20FIT
          </a>
        </div>
      </div>
    </div>
  );
};
