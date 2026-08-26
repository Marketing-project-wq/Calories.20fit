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
