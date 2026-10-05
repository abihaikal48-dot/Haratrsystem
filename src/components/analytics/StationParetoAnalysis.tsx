import React, { useState } from 'react';
import { BarChart3, AlertTriangle, Lightbulb, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getStationParetoAnalysis, StationParetoResult } from '../../lib/analyticsEngine';
import { Division } from '../../types';

interface StationParetoAnalysisProps {
  onSelectStation?: (station: Division) => void;
  className?: string;
}

export const StationParetoAnalysis: React.FC<StationParetoAnalysisProps> = ({
  onSelectStation,
  className = '',
}) => {
  const paretoData = getStationParetoAnalysis();
  const [selectedStation, setSelectedStation] = useState<Division>('Geprek');

  const activeItem = paretoData.find((d) => d.station === selectedStation) || paretoData[0];

  return (
    <div className={`bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4 ${className}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-[#8B1418] border border-red-200 px-2 py-0.5 rounded font-mono">
              PARETO 80/20 ANALYTICS
            </span>
            <span className="text-xs text-stone-400 font-medium">HARA Chicken Network</span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-stone-900 tracking-tight mt-0.5">
            Distribusi Deviasi SOP per Stasiun Kerja
          </h3>
          <p className="text-[11px] text-stone-500">
            Analisis 122 temuan observasi lapangan untuk memprioritaskan stasiun yang membutuhkan intervensi pelatihan.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs font-bold text-stone-700 block">Stasiun Kritis:</span>
          <span className="text-xs font-black text-[#8B1418] font-mono">
            Geprek (39.3%) & Kasir (29.5%)
          </span>
        </div>
      </div>

      {/* Visualisasi Grafik Batang Pareto */}
      <div className="space-y-2.5 pt-1">
        {paretoData.map((item) => {
          const isSelected = selectedStation === item.station;

          return (
            <div
              key={item.station}
              onClick={() => {
                setSelectedStation(item.station);
                if (onSelectStation) onSelectStation(item.station);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#8B1418] bg-red-50/40 ring-1 ring-[#8B1418]/20 shadow-2xs'
                  : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-black text-stone-900">
                    Stasiun {item.station}
                  </span>
                  <span className="text-[10.5px] font-mono text-stone-500">
                    ({item.total_deviations} Kejadian)
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="font-bold text-stone-700">{item.percentage}%</span>
                  <span className="text-[10.5px] text-stone-400">Kumulatif: {item.cumulative_pct}%</span>
                </div>
              </div>

              {/* Progress Bar Batang */}
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-[#8B1418] to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage * 2}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Kartu Diagnostik Stasiun Terpilih */}
      {activeItem && (
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-amber-600" />
              <span>Diagnosa Akar Masalah: Stasiun {activeItem.station}</span>
            </span>
            <span className="text-[10px] font-mono text-stone-400">Frekuensi: {activeItem.total_deviations}x</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <span className="text-[10.5px] font-bold text-stone-600 block">3 Temuan Deviasi Terbanyak:</span>
              <ul className="space-y-1 text-[11px] text-stone-700">
                {activeItem.top_deviations.map((dev, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#8B1418] font-bold mt-0.5">•</span>
                    <span>{dev}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1 p-2.5 rounded-lg bg-white border border-stone-200">
              <span className="text-[10.5px] font-bold text-emerald-800 flex items-center gap-1">
                <Lightbulb size={12} className="text-emerald-600" />
                <span>Rekomendasi Rencana Latihan Trainer:</span>
              </span>
              <p className="text-[11px] text-stone-700 font-medium leading-relaxed">
                {activeItem.recommended_training}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
