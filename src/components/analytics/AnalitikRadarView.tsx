import React, { useState, useMemo } from 'react';
import { db } from '../../lib/storage';
import { CrewRadarData, Division, Outlet, Kru } from '../../types';
import { CrewRadarChart } from './CrewRadarChart';
import { PeakRushMatrix } from './PeakRushMatrix';
import { StationParetoAnalysis } from './StationParetoAnalysis';
import {
  calculateCompositeScore,
  calculateHaraAttitude,
  generateDiagnosticActionPlan,
} from '../../lib/analyticsEngine';
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  Filter,
  HelpCircle,
  Lightbulb,
  Printer,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { OfficialDiagnosticDocument } from '../reports/OfficialDiagnosticDocument';

interface AnalitikRadarViewProps {
  selectedOutletCode: string;
  onNavigateToTab?: (tab: any) => void;
}

export const AnalitikRadarView: React.FC<AnalitikRadarViewProps> = ({
  selectedOutletCode,
  onNavigateToTab,
}) => {
  const [outletFilter, setOutletFilter] = useState<string>(selectedOutletCode);
  const [stationFilter, setStationFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCrewName, setSelectedCrewName] = useState<string>('Budi Santoso');
  const [showFullPrintDoc, setShowFullPrintDoc] = useState<boolean>(false);

  const outlets = db.getTable<Outlet>('outlets');
  const allKru = db.getTable<Kru>('kru');
  const competencySummaries = db.getCrewCompetencySummaries();

  // Map crew into CrewRadarData items
  const radarList: CrewRadarData[] = useMemo(() => {
    return allKru.map((kru) => {
      const summary = competencySummaries.find((s) => s.namaKru === kru.nama_kru);

      // Score defaults or actuals
      const teori = summary?.skorTeori ?? 86;
      const praktik = summary?.skorPraktik ?? 88;
      const lisan = summary?.skorLisan ?? 85;

      // Realistic HARA attitude and rush scores
      const sikapHara = Math.round((teori * 0.4 + lisan * 0.6) * 10) / 10;
      const rush = Math.round((praktik * 0.85 + (teori > 80 ? 12 : 5)) * 10) / 10;
      const sos = kru.divisi === 'Kasir' ? 78 : kru.divisi === 'Geprek' ? 88 : 82;

      const comp = calculateCompositeScore(teori, praktik, sikapHara, rush);

      return {
        nama_kru: kru.nama_kru,
        divisi: kru.divisi,
        kode_outlet: kru.kode_outlet,
        teori_sop: teori,
        praktik_jobdesk: praktik,
        sikap_hara: sikapHara,
        ketahanan_rush: rush,
        kecepatan_sos: sos,
        skor_komposit: comp.total_composite,
        status_kelulusan: comp.status,
      };
    });
  }, [allKru, competencySummaries]);

  // Filtered radar list
  const filteredList = useMemo(() => {
    return radarList.filter((item) => {
      if (outletFilter !== 'ALL' && item.kode_outlet !== outletFilter) return false;
      if (stationFilter !== 'ALL' && item.divisi !== stationFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.nama_kru.toLowerCase().includes(q) && !item.kode_outlet.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [radarList, outletFilter, stationFilter, searchQuery]);

  // Active selected crew
  const activeCrewRadar = useMemo(() => {
    const found = filteredList.find((c) => c.nama_kru === selectedCrewName);
    if (found) return found;
    return filteredList[0] || radarList[0];
  }, [filteredList, selectedCrewName, radarList]);

  // Calculations for active crew
  const composite = useMemo(() => {
    if (!activeCrewRadar) return null;
    return calculateCompositeScore(
      activeCrewRadar.teori_sop,
      activeCrewRadar.praktik_jobdesk,
      activeCrewRadar.sikap_hara,
      activeCrewRadar.ketahanan_rush
    );
  }, [activeCrewRadar]);

  const actionPlan = useMemo(() => {
    if (!activeCrewRadar) return null;
    return generateDiagnosticActionPlan(
      activeCrewRadar.nama_kru,
      activeCrewRadar.divisi,
      activeCrewRadar
    );
  }, [activeCrewRadar]);

  if (showFullPrintDoc && activeCrewRadar) {
    return (
      <OfficialDiagnosticDocument
        radarData={activeCrewRadar}
        onBack={() => setShowFullPrintDoc(false)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* 1. Header & Title Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-[#8B1418] border border-red-200 px-2 py-0.5 rounded font-mono">
                DATA SCIENCE & ANALYTICS
              </span>
              <span className="text-xs text-stone-400 font-medium">HARA Chicken Network</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              Radar Kompetensi Kru & Diagnostik Operasional
            </h1>
            <p className="text-xs text-stone-500">
              Evaluasi objektif 5-axis, skor komposit terbobot 4-faktor, dan prediksi deviasi pada jam kritis gerai.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeCrewRadar && (
              <button
                type="button"
                onClick={() => setShowFullPrintDoc(true)}
                className="px-4 py-2 bg-[#8B1418] hover:bg-[#720e12] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              >
                <Printer size={14} />
                <span>Cetak Lembar A4 ({activeCrewRadar.nama_kru})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Outlet */}
            <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-stone-200">
              <Filter size={13} className="text-stone-500" />
              <span className="text-xs font-bold text-stone-600">Cabang:</span>
              <select
                value={outletFilter}
                onChange={(e) => setOutletFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-stone-900 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">Semua Cabang ({radarList.length} Kru)</option>
                {outlets.map((o) => (
                  <option key={o.kode_outlet} value={o.kode_outlet}>
                    {o.nama_outlet} ({o.kode_outlet})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Stasiun */}
            <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-stone-200">
              <span className="text-xs font-bold text-stone-600">Jobdesk:</span>
              <select
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-stone-900 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">Semua 4 Jobdesk</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Kasir">Kasir</option>
                <option value="Geprek">Geprek</option>
                <option value="Helper">Helper</option>
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] w-full sm:w-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama kru / outlet..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:bg-white focus:border-[#8B1418] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column: Radar Detail (Left) & Composite Score Matrix (Right) */}
      {activeCrewRadar && composite && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: 5-Axis Radar Chart & Crew Profiler */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8B1418] font-mono">
                  RADAR KOMPETENSI 5-SUMBU
                </span>
                <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                  {activeCrewRadar.nama_kru}
                </h3>
                <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                  <span className="font-bold text-stone-700">{activeCrewRadar.divisi}</span>
                  <span>&bull;</span>
                  <span>Outlet {activeCrewRadar.kode_outlet}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-mono font-bold text-stone-400 block">
                  Status Kelulusan
                </span>
                <span
                  className={`text-xs font-black px-2 py-0.5 rounded-full inline-block ${
                    activeCrewRadar.status_kelulusan === 'Kompeten Mandiri'
                      ? 'bg-emerald-100 text-emerald-800'
                      : activeCrewRadar.status_kelulusan === 'Butuh Pendampingan'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {activeCrewRadar.status_kelulusan}
                </span>
              </div>
            </div>

            {/* Crew Selector Pill Horizontal Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-600 block">
                Pilih Personil Kru ({filteredList.length} Kru Terfilter):
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {filteredList.map((crew) => {
                  const isSelected = crew.nama_kru === activeCrewRadar.nama_kru;
                  return (
                    <button
                      key={crew.nama_kru}
                      type="button"
                      onClick={() => setSelectedCrewName(crew.nama_kru)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#8B1418] text-white shadow-xs'
                          : 'bg-[#FAF8F5] text-stone-700 hover:bg-stone-100 border border-stone-200'
                      }`}
                    >
                      <User size={12} className={isSelected ? 'text-amber-300' : 'text-stone-400'} />
                      <span>{crew.nama_kru}</span>
                      <span className="text-[10px] font-mono opacity-80">({crew.divisi})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Radar Canvas */}
            <div className="flex justify-center py-2 bg-[#FAF8F5] rounded-2xl border border-stone-200/80">
              <CrewRadarChart data={activeCrewRadar} size={300} />
            </div>

            {/* Sub-Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 text-center">
                <span className="text-[10px] font-bold text-stone-500 block">Teori SOP</span>
                <span className="text-sm font-black font-mono text-stone-900">{activeCrewRadar.teori_sop}%</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 text-center">
                <span className="text-[10px] font-bold text-stone-500 block">Praktik Jobdesk</span>
                <span className="text-sm font-black font-mono text-[#8B1418]">{activeCrewRadar.praktik_jobdesk}%</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 text-center">
                <span className="text-[10px] font-bold text-stone-500 block">Sikap H.A.R.A</span>
                <span className="text-sm font-black font-mono text-amber-700">{activeCrewRadar.sikap_hara}%</span>
              </div>
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/70 text-center">
                <span className="text-[10px] font-bold text-stone-500 block">Jam Sibuk</span>
                <span className="text-sm font-black font-mono text-emerald-700">{activeCrewRadar.ketahanan_rush}%</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Formula Skor Komposit & Diagnostik Rekomendasi */}
          <div className="lg:col-span-6 space-y-5">
            {/* Card Skor Komposit 4-Faktor */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#8B1418] font-mono">
                    FORMULA RESMI HARA OPS
                  </span>
                  <h3 className="text-base font-black text-stone-900 tracking-tight">
                    Skor Komposit Objektif
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-[#8B1418]">
                      {composite.total_composite}
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-400">/100</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-xs font-black text-amber-800 font-mono">
                    Grade {composite.grade}
                  </span>
                </div>
              </div>

              {/* 4 Komponen Pembobotan */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-stone-200/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-stone-200 text-stone-700 font-mono font-black flex items-center justify-center text-[10px]">
                      25%
                    </span>
                    <span className="font-bold text-stone-800">1. Ujian Teori SOP Baku</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-stone-500 text-[11px]">{composite.teori_score} &times; 0.25 = </span>
                    <span className="font-black text-stone-900">{composite.teori_weighted}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/40 border border-red-200/70 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#8B1418] text-white font-mono font-black flex items-center justify-center text-[10px]">
                      35%
                    </span>
                    <span className="font-bold text-stone-800">2. Praktik Stasiun {activeCrewRadar.divisi}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-stone-500 text-[11px]">{composite.praktik_score} &times; 0.35 = </span>
                    <span className="font-black text-[#8B1418]">{composite.praktik_weighted}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/40 border border-amber-200/70 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-amber-600 text-white font-mono font-black flex items-center justify-center text-[10px]">
                      25%
                    </span>
                    <span className="font-bold text-stone-800">3. Perilaku Budaya H.A.R.A</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-stone-500 text-[11px]">{composite.sikap_score} &times; 0.25 = </span>
                    <span className="font-black text-amber-800">{composite.sikap_weighted}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200/70 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-mono font-black flex items-center justify-center text-[10px]">
                      15%
                    </span>
                    <span className="font-bold text-stone-800">4. Ketahanan Jam Sibuk (Rush)</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-stone-500 text-[11px]">{composite.rush_score} &times; 0.15 = </span>
                    <span className="font-black text-emerald-800">{composite.rush_weighted}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Rekomendasi Preskriptif Otomatis */}
            {actionPlan && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb size={18} className="text-amber-500 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider text-stone-800">
                    Rencana Tindakan Diagnostik (Automated Action Plan)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-2">
                  <p className="text-xs text-stone-800 font-bold leading-relaxed">
                    {actionPlan.rekomendasiUtama}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    {actionPlan.langkahPerbaikan.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-stone-600 font-medium">
                        <CheckCircle2 size={13} className="text-[#8B1418] shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-[11px] font-mono text-stone-500">
                    <span>Target Evaluasi Ulang:</span>
                    <span className="font-black text-[#8B1418]">{actionPlan.targetReviewHari} Hari ke Depan</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Operational Analytics: Peak Rush Hours & Station Pareto */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-6">
          <PeakRushMatrix />
        </div>
        <div className="lg:col-span-6">
          <StationParetoAnalysis />
        </div>
      </div>
    </div>
  );
};
