import React, { useRef } from 'react';
import { Award, CheckCircle2, Download, Printer, X, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { HaraLogo } from '../HaraLogo';

interface MiniCertificateModalProps {
  kruNama: string;
  kodeOutlet?: string;
  batchName?: string;
  tanggalLulus?: string;
  skorAkhir: number;
  statusKelulusan: string;
  trainerNama: string;
  onClose: () => void;
}

export const MiniCertificateModal: React.FC<MiniCertificateModalProps> = ({
  kruNama,
  kodeOutlet = 'HC-BTL01',
  batchName = 'Batch Onboarding & Retraining Kru',
  tanggalLulus = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  skorAkhir,
  statusKelulusan,
  trainerNama,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const isKompetenMandiri = skorAkhir >= 85 && !statusKelulusan.toLowerCase().includes('remedial');
  const certNumber = `HC-CERT/${new Date().getFullYear()}/${kruNama.replace(/\s+/g, '').substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 text-[#181411]"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
          <div className="flex items-center gap-2">
            <Award className="text-[#96171B]" size={20} />
            <h3 className="font-bold text-sm text-[#181411]">Sertifikat Kelulusan Onboarding</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#645D55] hover:text-[#181411] hover:bg-[#FAF8F5] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Card Printable Area */}
        <div
          ref={certificateRef}
          id="printable-certificate"
          className="relative rounded-xl border-2 border-[#96171B]/20 bg-gradient-to-b from-[#FAF8F5] to-white p-6 sm:p-8 text-center space-y-5 shadow-xs overflow-hidden"
        >
          {/* Subtle Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#96171B]" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#96171B]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#96171B]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#96171B]" />

          {/* Header Identity */}
          <div className="flex flex-col items-center justify-center gap-1.5">
            <HaraLogo size="md" variant="full" />
            <div className="text-[10px] font-bold text-[#645D55] tracking-widest uppercase mt-1">
              HARA CHICKEN • TRAINING & OPERATIONS
            </div>
          </div>

          <div className="py-1">
            <h2 className="text-xl sm:text-2xl font-black text-[#181411] tracking-tight">
              BUKTI KELULUSAN ONBOARDING KRU
            </h2>
            <p className="text-xs text-[#645D55] mt-1">
              Diberikan secara resmi kepada:
            </p>
          </div>

          {/* Participant Name */}
          <div className="py-2 border-y border-[#E6E1DA] bg-white/70 rounded-lg">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#96171B] tracking-tight">
              {kruNama}
            </h1>
            <p className="text-[11px] text-[#645D55] mt-0.5">
              Penempatan Gerai: <span className="font-semibold text-[#181411]">{kodeOutlet}</span> • {batchName}
            </p>
          </div>

          {/* Achievement Description */}
          <p className="text-xs text-[#645D55] leading-relaxed max-w-lg mx-auto">
            Telah menyelesaikan seluruh rangkaian Kurikulum Onboarding, Retraining Mutu Produk, dan Praktik Standar Operasional Prosedur (SOP) Day 1 & Day 2 secara tuntas.
          </p>

          {/* Score & Status Badge */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
            <div className="px-4 py-2 rounded-lg bg-white border border-[#E6E1DA] shadow-2xs">
              <span className="block text-[10px] text-[#645D55] uppercase font-bold">Skor Rata-Rata</span>
              <span className="text-lg font-black font-mono text-[#181411]">{skorAkhir.toFixed(1)}</span>
              <span className="text-[10px] text-[#645D55]"> / 100</span>
            </div>

            <div
              className={`px-4 py-2 rounded-lg border shadow-2xs ${
                isKompetenMandiri
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <span className="block text-[10px] uppercase font-bold">Predikat Kelulusan</span>
              <span className="text-sm font-extrabold flex items-center gap-1 justify-center">
                <CheckCircle2 size={14} className={isKompetenMandiri ? 'text-emerald-600' : 'text-amber-600'} />
                {isKompetenMandiri ? 'KOMPETEN MANDIRI' : 'LULUS PENDAMPINGAN'}
              </span>
            </div>
          </div>

          {/* Signatures & Serial Number */}
          <div className="pt-6 grid grid-cols-2 gap-4 text-xs border-t border-[#E6E1DA]/80">
            <div className="text-left">
              <span className="text-[10px] text-[#645D55] block">Nomor Sertifikat:</span>
              <span className="font-mono font-bold text-[11px] text-[#181411]">{certNumber}</span>
              <span className="text-[10px] text-[#645D55] block mt-0.5">Tanggal: {tanggalLulus}</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#645D55] block">Trainer / Penilai Resmi:</span>
              <div className="h-8 flex items-center justify-end">
                <span className="text-sm font-bold text-[#96171B] underline decoration-[#96171B]/30 decoration-wavy">
                  {trainerNama || 'Haikal Abi'}
                </span>
              </div>
              <span className="text-[10px] text-[#645D55] block font-semibold">RnD Penilai (Tim Penilai)</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-[#645D55]">
            Bukti kelulusan onboarding resmi QSR HARA Chicken.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg border border-[#E6E1DA] hover:bg-slate-50 text-xs font-semibold text-[#181411] inline-flex items-center gap-1.5 transition-colors"
            >
              <Printer size={14} />
              <span>Cetak Sertifikat</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#96171B] hover:bg-[#7A1216] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
