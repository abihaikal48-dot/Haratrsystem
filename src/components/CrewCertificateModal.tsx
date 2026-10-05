import React from 'react';
import { Award, Printer, X, CheckCircle2, ShieldCheck, QrCode, Calendar, MapPin, Download } from 'lucide-react';
import { Kru, Outlet } from '../types';
import { HaraLogo } from './HaraLogo';

interface CrewCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  kru: Kru | null;
  score?: number;
  outletName?: string;
  division?: string;
}

export const CrewCertificateModal: React.FC<CrewCertificateModalProps> = ({
  isOpen,
  onClose,
  kru,
  score = 92,
  outletName = 'Hara Chicken Pusat',
  division = 'Kitchen',
}) => {
  if (!isOpen || !kru) return null;

  const certNumber = `HARA-CERT/${new Date().getFullYear()}/${kru.kode_outlet || 'HQ'}/${kru.id.replace(/[^0-9a-zA-Z]/g, '').slice(-6).toUpperCase()}`;
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {/* Control Bar (hidden during print) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-[#96171B] hover:bg-[#801216] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <Printer size={15} />
          <span>Cetak Sertifikat / Simpan PDF</span>
        </button>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-bold flex items-center justify-center shadow-lg transition-all cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* CERTIFICATE CONTAINER (A4 Landscape Form Factor) */}
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden print:m-0 print:w-full print:max-w-none print:shadow-none print:rounded-none">
        <div className="p-8 sm:p-12 relative border-8 border-stone-100 min-h-[580px] flex flex-col justify-between bg-radial-[at_top_right] from-amber-50/20 via-white to-stone-50/30">
          
          {/* Ornate Gold Border Inner */}
          <div className="absolute inset-4 border border-amber-600/30 rounded-xl pointer-events-none" />
          <div className="absolute inset-5 border border-dashed border-amber-500/20 rounded-lg pointer-events-none" />

          {/* Certificate Header */}
          <div className="relative z-10 text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <HaraLogo variant="full" size="md" />
            </div>

            <div className="pt-2">
              <span className="text-[10px] tracking-[0.3em] uppercase font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                PT HARA CHICKEN INDONESIA &bull; PEOPLE DEVELOPMENT
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight uppercase font-serif">
              Sertifikat Keahlian & Standar Mutu
            </h1>
            <p className="text-xs text-stone-500 font-mono tracking-wider">
              NOMOR REGISTRASI: {certNumber}
            </p>
          </div>

          {/* Certificate Body */}
          <div className="relative z-10 text-center my-6 space-y-4">
            <p className="text-xs text-stone-600 font-medium italic">
              Dengan bangga diberikan kepada:
            </p>

            <div className="py-2 border-b-2 border-stone-900 max-w-md mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-wide font-serif">
                {kru.nama_kru}
              </h2>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-stone-600">
              <span className="flex items-center gap-1 font-semibold">
                <MapPin size={13} className="text-[#96171B]" />
                Penempatan: {outletName} ({kru.kode_outlet})
              </span>
              <span>&bull;</span>
              <span className="font-semibold text-stone-900">
                Stasiun Divisi: {kru.divisi || division}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 max-w-2xl mx-auto leading-relaxed pt-2">
              Telah berhasil menyelesaikan rangkaian evaluasi <b>Metodologi 4 Pilar Kompetensi</b> meliputi Teori SOP, Praktik Lapangan & Suhu Minyak Fryer, Uji Lisan HACCP, dan Observasi Jam Sibuk dengan hasil:
            </p>

            {/* Score & Badge Highlight */}
            <div className="inline-flex items-center gap-4 bg-amber-50 border border-amber-200/80 px-6 py-2.5 rounded-2xl shadow-xs">
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800">
                  Predikat Kompetensi
                </div>
                <div className="text-base font-black text-stone-900 flex items-center gap-1.5">
                  <Award size={18} className="text-amber-600" />
                  <span>MAHIR (CLASS A &bull; OPERATOR UNGGUL)</span>
                </div>
              </div>
              <div className="h-8 w-px bg-amber-200" />
              <div className="text-left">
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800">
                  Indeks Skor Akhir
                </div>
                <div className="text-xl font-black text-[#96171B]">
                  {score}<span className="text-xs text-stone-500 font-medium">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Signatures & Seals */}
          <div className="relative z-10 pt-4 border-t border-stone-200 grid grid-cols-3 items-end text-center text-xs">
            {/* Signature 1: Trainer */}
            <div className="space-y-1">
              <div className="h-12 flex items-center justify-center font-serif text-sm font-bold text-stone-700 italic">
                Haikal Abi
              </div>
              <div className="border-t border-stone-400 w-32 mx-auto pt-1">
                <b className="block text-stone-900 font-bold">Haikal Abi</b>
                <span className="text-[10px] text-stone-500">Lead Trainer & People Dev</span>
              </div>
            </div>

            {/* Official Seal / QR Stamp */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-14 h-14 rounded-full border-2 border-amber-600/40 bg-amber-50/50 flex flex-col items-center justify-center text-amber-800 shadow-2xs">
                <ShieldCheck size={22} className="text-amber-700" />
                <span className="text-[7.5px] font-black uppercase tracking-tighter">HARA TERVERIFIKASI</span>
              </div>
              <span className="text-[9.5px] text-stone-400 font-mono">
                {todayFormatted}
              </span>
            </div>

            {/* Signature 2: Head of Operations */}
            <div className="space-y-1">
              <div className="h-12 flex items-center justify-center font-serif text-sm font-bold text-stone-700 italic">
                Operations Dept.
              </div>
              <div className="border-t border-stone-400 w-32 mx-auto pt-1">
                <b className="block text-stone-900 font-bold">Administrator HQ</b>
                <span className="text-[10px] text-stone-500">Head of Operations</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
