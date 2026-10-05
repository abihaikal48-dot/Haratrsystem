import React from 'react';
import { HaraLogo } from './HaraLogo';

interface OfficialDocumentHeaderProps {
  docNumber: string;
  date?: string;
  subLabel?: string;
  extraInfo?: string;
  className?: string;
}

export const OfficialDocumentHeader: React.FC<OfficialDocumentHeaderProps> = ({
  docNumber,
  date,
  subLabel = 'Standar Operasional Prosedur & Pelatihan Kru Cabang',
  extraInfo = 'Grand Galaxy City, Ruko RSK 5 No. 12, Bekasi Selatan',
  className = '',
}) => {
  const currentDate = date || new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={`w-full select-none ${className}`}>
      {/* Main Kop Content */}
      <div className="flex flex-row items-center justify-between gap-4 pb-3">
        {/* Left Side: Brand Logo & Department Information */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          <HaraLogo variant="icon" size="lg" className="shrink-0" />
          <div className="flex flex-col justify-center text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-slate-900 font-sans">
                <span className="text-[#96171B]">HARA</span>
                <span className="text-[#D48B1E] ml-1">CHICKEN</span>
              </h1>
              <span className="bg-[#96171B]/10 text-[#96171B] border border-[#96171B]/20 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                TRAINER
              </span>
            </div>

            <h2 className="text-xs sm:text-sm font-black tracking-wider text-[#96171B] uppercase mt-1">
              DIVISI TRAINING & OPERASIONAL
            </h2>

            <p className="text-[10.5px] font-semibold text-slate-600 leading-tight mt-0.5">
              {subLabel}
            </p>
            {extraInfo && (
              <p className="text-[9.5px] text-slate-400 font-medium leading-tight mt-0.5">
                {extraInfo}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Document Reference Number & Date */}
        <div className="text-right shrink-0">
          <div className="text-[9.5px] font-black uppercase tracking-widest text-slate-400">
            Nomor Dokumen
          </div>
          <div className="text-xs sm:text-sm font-black text-slate-900 font-mono bg-slate-100/90 px-3 py-1 rounded-lg border border-slate-300 mt-0.5 inline-block shadow-2xs">
            {docNumber}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-medium">
            {currentDate}
          </div>
        </div>
      </div>

      {/* Official Authentic Dual-Line Divider */}
      <div className="space-y-0.5">
        <div className="h-[2.5px] bg-[#96171B] w-full rounded-full" />
        <div className="h-[0.75px] bg-slate-300 w-full" />
      </div>
    </div>
  );
};
