import React from 'react';
import { Clock, TrendingUp, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { getRushHourAnalysisData } from '../../lib/analyticsEngine';

interface PeakRushMatrixProps {
  className?: string;
}

export const PeakRushMatrix: React.FC<PeakRushMatrixProps> = ({ className = '' }) => {
  const shifts = getRushHourAnalysisData();

  return (
    <div className={`bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4 ${className}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-mono">
              PEAK RUSH HOURS MATRIX
            </span>
            <span className="text-xs text-stone-400 font-medium">Monitoring Real-Time Jam Kritis</span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-stone-900 tracking-tight mt-0.5">
            Dinamika Kecepatan (SOS) & Deviasi Per Shift Outlet
          </h3>
          <p className="text-[11px] text-stone-500">
            Perbandingan ketahanan prosedur pada jam santai vs jam sibuk makan siang (*lunch*) & makan malam (*dinner*).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-red-50 text-[#8B1418] text-xs font-bold font-mono border border-red-200">
            Target SOS: &lt; 90 Detik
          </div>
        </div>
      </div>

      {/* Grid Shift Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {shifts.map((shift, idx) => {
          const isHighRush = shift.tingkat_deviasi_pct > 15;
          const isSosExceeded = shift.kecepatan_sos_detik > 90;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                isHighRush
                  ? 'border-red-200 bg-red-50/30'
                  : 'border-stone-200 bg-[#FAF8F5]/60 hover:bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-mono font-bold text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                    {shift.jam_operasional}
                  </span>
                  <span
                    className={`text-[9.5px] font-black px-1.5 py-0.5 rounded ${
                      isHighRush
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isHighRush ? 'Peak Rush' : 'Normal'}
                  </span>
                </div>

                <h4 className="text-xs font-black text-stone-900 line-clamp-1">
                  {shift.shift_name}
                </h4>

                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-500">Kecepatan SOS:</span>
                    <span className={`font-bold ${isSosExceeded ? 'text-red-700' : 'text-emerald-700'}`}>
                      {shift.kecepatan_sos_detik} dtk
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-500">Tingkat Deviasi:</span>
                    <span className={`font-bold ${isHighRush ? 'text-red-700' : 'text-stone-800'}`}>
                      {shift.tingkat_deviasi_pct}%
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-500">Fokus Stasiun:</span>
                    <span className="font-bold text-[#8B1418]">
                      {shift.stasiun_terdampak}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-black/5 text-[10px] text-stone-600 line-clamp-2 italic">
                "{shift.catatan_lapangan}"
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
