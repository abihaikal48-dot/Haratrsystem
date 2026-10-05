import React, { useState } from 'react';
import {
  HARA_ABOUT,
  HARA_VISION,
  HARA_MISSION,
  HARA_VALUES,
  HARA_OFFICIAL_JOBDESKS,
} from '../../data/haraCulture';
import { Division } from '../../types';
import { HARA_OBJECTIVE_PILLARS } from '../../data/haraObjectiveRubrics';
import {
  ChickenIcon,
  CashierIcon,
  ChiliIcon,
  BroomCleanIcon,
  VerifiedCheckIcon
} from '../ui/Icons';
import {
  ShieldCheck, Heart, Sparkles, CheckCircle2, Target, Award,
  Users, Flame, UtensilsCrossed, BookOpen, Layers, CheckSquare,
  HelpCircle, ArrowRight
} from 'lucide-react';

export const HaraCultureView: React.FC = () => {
  const [activeJobdeskTab, setActiveJobdeskTab] = useState<Division>('Geprek');
  const [selectedPillarKey, setSelectedPillarKey] = useState<'H' | 'A1' | 'R' | 'A2'>('H');
  const activeJobdesk = HARA_OFFICIAL_JOBDESKS[activeJobdeskTab];
  const activePillar = HARA_OBJECTIVE_PILLARS.find(p => p.key === selectedPillarKey) || HARA_OBJECTIVE_PILLARS[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in">
      
      {/* 1. HERO BRAND & FILOSOFI RESMI */}
      <div className="relative rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-xs overflow-hidden">
        {/* Soft Ambient Radiance */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-50/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-50/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/70 text-xs font-bold text-[#8B1418]">
            <Sparkles size={14} className="text-[#8B1418]" />
            <span>{HARA_ABOUT.akronim} • {HARA_ABOUT.tagline}</span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
            Visi, Misi & Budaya Kerja HARA Chicken
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {HARA_ABOUT.deskripsi} {HARA_ABOUT.taglineDesc}
          </p>

          <div className="pt-2">
            <blockquote className="border-l-2 border-[#8B1418] pl-3.5 italic text-xs text-slate-700 font-medium bg-slate-50/80 p-2.5 rounded-r-xl border border-slate-200/50">
              "{HARA_ABOUT.sloganBudaya}"
            </blockquote>
          </div>
        </div>
      </div>

      {/* 2. VISI & 4 PILAR MISI RESMI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Card Visi */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#8B1418] flex items-center justify-center border border-rose-100">
              <Target size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8B1418] font-mono">
                VISI PERUSAHAAN
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-1">
                Pelopor Ayam Geprek Modern Berkelas Nasional
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/70">
              "{HARA_VISION}"
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Standar Cita Rasa Autentik & Mutu Terjamin</span>
          </div>
        </div>

        {/* Card Misi 4 Komitmen */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8B1418] font-mono">
              MISI & KOMITMEN
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              4 Pilar Komitmen Bisnis Berkelanjutan
            </h2>
          </div>

          <div className="space-y-2.5">
            {HARA_MISSION.map((item) => (
              <div
                key={item.no}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:bg-slate-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-[#8B1418] text-white flex items-center justify-center text-xs font-mono font-black shrink-0 mt-0.5">
                  {item.no}
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. OPERASIONALISASI OBJEKTIF: DARI VISI-MISI KE RUBRIK PENILAIAN KRU */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono uppercase tracking-wider mb-1">
              <CheckSquare size={12} />
              <span>Sistem Penilaian Objektif Zero-Subjectivity</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Operasionalisasi Visi & Misi H.A.R.A Menjadi Rubrik Checklist
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
              Nilai H.A.R.A bukan sekadar slogan, melainkan indikator perilaku kerja terukur dengan kode SOP, bukti observasi fisik, dan audit sanitasi harian (Bobot 25% Skor Komposit).
            </p>
          </div>

          {/* Pillar Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70 self-start sm:self-center">
            {HARA_OBJECTIVE_PILLARS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelectedPillarKey(p.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedPillarKey === p.key
                    ? 'bg-[#8B1418] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{p.key}</span>
                <span className="hidden md:inline text-[11px] font-medium opacity-90">{p.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Pillar Detailed Checklist & SOP References */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#8B1418] uppercase tracking-wider px-2 py-0.5 bg-rose-50 border border-rose-200 rounded">
                Pilar {activePillar.key} • Bobot 25%
              </span>
              <span className="text-[11px] font-bold text-slate-500">{activePillar.tagline}</span>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {activePillar.title}
              </h3>
              <p className="text-xs text-[#8B1418] font-bold mt-0.5">
                {activePillar.subtitle}
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {activePillar.description}
            </p>

            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Keterkaitan Visi & Misi Perusahaan:
              </span>
              <p className="text-slate-700 font-semibold leading-snug">
                {activePillar.visiMisiRef}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={14} className="text-[#8B1418]" />
                <span>Indikator Verifikasi Objektif di Gerai:</span>
              </span>
              <span className="text-[10.5px] text-slate-500 font-mono">
                {activePillar.items.length} Parameter Audit
              </span>
            </div>

            <div className="space-y-2">
              {activePillar.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-rose-50 text-[#8B1418] flex items-center justify-center text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span>{item.kriteria}</span>
                    </span>
                    <span className="font-mono text-[9.5px] font-black px-2 py-0.5 rounded bg-slate-50 text-[#8B1418] border border-rose-200 shrink-0">
                      {item.kode_sop}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-5.5 flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Metode Verifikasi:</span>
                    <span className="text-slate-700 font-medium">{item.metode_verifikasi}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. STANDARDISASI 4 JOBDESK RESMI GERAI */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8B1418] font-mono">
              OFFICIAL STATIONS
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              4 Jobdesk Resmi Operasional Gerai HARA Chicken
            </h2>
            <p className="text-xs text-slate-500">
              Setiap kru gerai dilatih dan disertifikasi berdasarkan parameter mutu kritis stasiun berikut:
            </p>
          </div>

          {/* Jobdesk Selector Tabs with Pure SVG icons */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
            {(['Kitchen', 'Kasir', 'Geprek', 'Helper'] as Division[]).map((st) => {
              const IconComp = st === 'Kitchen' ? ChickenIcon :
                               st === 'Kasir' ? CashierIcon :
                               st === 'Geprek' ? ChiliIcon : BroomCleanIcon;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setActiveJobdeskTab(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeJobdeskTab === st
                      ? 'bg-[#8B1418] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <IconComp size={15} />
                  <span>{st}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Stasiun Terpilih */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-3.5">
            <div>
              <span className="text-[10.5px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                {activeJobdesk.tagline}
              </span>
              <h3 className="text-lg font-black text-stone-900 tracking-tight mt-1">
                {activeJobdesk.title}
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                {activeJobdesk.subtitle}
              </p>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed p-3 rounded-xl bg-[#FAF8F5] border border-stone-200/80">
              {activeJobdesk.focusArea}
            </p>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-stone-800 block">Target KPI Stasiun:</span>
              <p className="text-xs text-emerald-800 font-semibold bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                {activeJobdesk.kpiTarget}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-stone-800 block">Titik Kontrol Keamanan Pangan (Food Safety):</span>
              <p className="text-xs text-stone-700 font-medium bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                {activeJobdesk.safetyHaccp}
              </p>
            </div>
          </div>

          {/* Kolom Parameter Mutu Kritis */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-[#8B1418]" />
                <span>5 Parameter Mutu Kritis (Audit Lapangan):</span>
              </h4>
              <span className="text-[10px] font-mono text-stone-400">Standar 100% OK</span>
            </div>

            <div className="space-y-2">
              {activeJobdesk.criticalParameters.map((param, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-stone-200 text-xs font-medium text-stone-800"
                >
                  <div className="w-5 h-5 rounded-full bg-red-50 text-[#8B1418] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="leading-snug">{param}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
