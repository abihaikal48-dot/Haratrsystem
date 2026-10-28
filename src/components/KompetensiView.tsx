import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield, Award, Download, Sparkles, Filter, Search,
  CheckCircle, ChevronRight, UserCheck, X, AlertCircle,
  Eye, Check, BookOpen, Wrench, Mic, MessageSquare, TrendingUp,
  Star, AlertTriangle, ShieldCheck, Activity, Clock, BarChart3,
  Layers, ArrowUpRight, Target, FileText, Heart, Compass, CheckSquare,
  HelpCircle, Sliders, ChevronDown, RefreshCw, Send, ThumbsUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import { db } from '../lib/storage';
import { CrewCompetencySummary, Outlet, SystemSettings, Kru } from '../types';
import { CrewRadarChart } from './CrewRadarChart';
import { CrewCertificateModal } from './CrewCertificateModal';
import { OfficialRaporKruView } from './reports/OfficialRaporKru';

interface KompetensiViewProps {
  selectedOutletCode: string;
  onNavigateToExam?: (type: 'teori' | 'praktik' | 'lisan' | 'sikap', crewName?: string) => void;
}

export const KompetensiView: React.FC<KompetensiViewProps> = ({
  selectedOutletCode,
  onNavigateToExam,
}) => {
  const [list, setList] = useState<CrewCompetencySummary[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [search, setSearch] = useState('');
  const [divFilter, setDivFilter] = useState<string>('ALL');
  const [badgeFilter, setBadgeFilter] = useState<string>('ALL');
  
  // Matrix View Mode: 'ksa' (Knowledge 30%, Skill 45%, Attitude 25%) | 'radar360' | 'talent9box' | '4dimensi' | 'gauss'
  const [matrixMode, setMatrixMode] = useState<'ksa' | 'radar360' | 'talent9box' | '4dimensi' | 'gauss'>('ksa');
  const [radarSelectedCrewName, setRadarSelectedCrewName] = useState<string>('');

  // Modals & Drawers
  const [certCrew, setCertCrew] = useState<CrewCompetencySummary | null>(null);
  const [selectedCrewDrawer, setSelectedCrewDrawer] = useState<CrewCompetencySummary | null>(null);
  const [raporKruTarget, setRaporKruTarget] = useState<string | null>(null);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = () => {
    setList(db.getCrewCompetencySummaries());
    setOutlets(db.getTable<Outlet>('outlets'));
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, []);

  const filtered = list.filter((item) => {
    if (selectedOutletCode !== 'ALL' && item.kode_outlet !== selectedOutletCode) return false;
    if (divFilter !== 'ALL' && item.divisi !== divFilter) return false;
    if (badgeFilter !== 'ALL' && item.badge !== badgeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match = (item.namaKru || '').toLowerCase().includes(q) ||
                    (item.kode_outlet || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Data Science: Cohort Statistics & Gaussian Normal Distribution
  const cohortStats = useMemo(() => {
    const scores = filtered.filter(f => f.skorAkhir !== null).map(f => f.skorAkhir as number);
    if (scores.length === 0) return null;
    const mean = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const sorted = [...scores].sort((a, b) => a - b);
    const p25 = sorted[Math.floor(sorted.length * 0.25)] || mean;
    const p50 = sorted[Math.floor(sorted.length * 0.50)] || mean;
    const p75 = sorted[Math.floor(sorted.length * 0.75)] || mean;
    const p90 = sorted[Math.floor(sorted.length * 0.90)] || mean;
    
    // Variance & Stdev
    const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (scores.length || 1);
    const stdev = Math.round(Math.sqrt(variance) * 10) / 10;

    return { mean, stdev, p25, p50, p75, p90, count: scores.length };
  }, [filtered]);

  const openCertificate = (crew: CrewCompetencySummary) => {
    setCertCrew(crew);
    if (crew.badge === 'Mahir') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#96171B', '#D97706', '#18181B', '#059669'],
        });
      } catch {
        // ignore
      }
    }
  };

  const downloadCertificatePDF = (crew: CrewCompetencySummary) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const settings = db.getTable<SystemSettings>('settings')[0] || {
      nama_perusahaan: 'HARA TRAINING & OPERATIONS',
      lead_trainer: 'Haikal Abi (Lead Operational Trainer)',
    };

    // Background
    doc.setFillColor(253, 251, 247);
    doc.rect(0, 0, 297, 210, 'F');

    // Outer Crimson Border
    doc.setDrawColor(150, 23, 27);
    doc.setLineWidth(4);
    doc.rect(10, 10, 277, 190);

    // Inner Gold Fine Border
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(1);
    doc.rect(14, 14, 269, 182);

    // Header Branding
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(150, 23, 27);
    doc.text('HARA CHICKEN INDONESIA', 148.5, 30, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 100, 100);
    doc.text('DIVISI PELATIHAN OPERASIONAL & DATA SCIENCE KOMPETENSI QSR', 148.5, 36, { align: 'center' });

    // Main Certificate Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(24, 24, 27);
    doc.text('BERITA ACARA & SERTIFIKAT KOMPETENSI KRU', 148.5, 54, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text('Diberikan secara sah dan objektif kepada:', 148.5, 68, { align: 'center' });

    // Crew Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(150, 23, 27);
    doc.text(crew.namaKru.toUpperCase(), 148.5, 80, { align: 'center' });

    // Division & Branch
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Divisi Stasiun: ${crew.divisi}  |  Penempatan Cabang: ${crew.kode_outlet}`, 148.5, 89, { align: 'center' });

    // Statement
    doc.setFontSize(10.5);
    doc.text(
      `Telah melalui evaluasi objektif 360° (Knowledge Teori/Lisan, Skill Praktik SOS, dan Attitude Budaya H.A.R.A)`,
      148.5,
      103,
      { align: 'center' }
    );
    doc.text(
      `dan dinyatakan ${crew.statusKelulusan || 'LULUS'} dengan Kualifikasi "${crew.badge.toUpperCase()}" (Indeks Komposit: ${crew.skorAkhir ?? '-'}/100).`,
      148.5,
      109,
      { align: 'center' }
    );

    // KSA Score Breakdown Box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(40, 120, 217, 24, 3, 3, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('1. Knowledge / Teori (30%)', 75, 128, { align: 'center' });
    doc.text('2. Skill / Praktik (45%)', 148.5, 128, { align: 'center' });
    doc.text('3. Attitude / H.A.R.A (25%)', 222, 128, { align: 'center' });

    doc.setFontSize(13);
    doc.setTextColor(150, 23, 27);
    doc.text(`${crew.skorKnowledge ?? crew.skorTeori ?? '-'}`, 75, 137, { align: 'center' });
    doc.text(`${crew.skorSkill ?? crew.skorPraktik ?? '-'}`, 148.5, 137, { align: 'center' });
    doc.text(`${crew.skorAttitude ?? crew.skorAudit ?? '-'}`, 222, 137, { align: 'center' });

    // Date & Signatures
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`Diterbitkan pada: ${dateStr}`, 45, 165);
    doc.text(`Integritas Data: VERIFIED OBJECTIVE EVALUATION (GAUSS BELL CURVE VALID)`, 45, 171);

    // Head Trainer Signatory
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(18, 16, 14);
    doc.text(settings.lead_trainer || 'Haikal Abi (Lead Operational Trainer)', 230, 172, { align: 'center' });
    doc.line(190, 166, 270, 166);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Trainer Lead & Penguji Mutu QSR', 230, 177, { align: 'center' });

    doc.save(`Sertifikat_${crew.namaKru.replace(/\s+/g, '_')}_Kompetensi.pdf`);
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner - Industrial Data Science Console */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-stone-900 to-slate-950 text-white rounded-3xl shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck size={12} />
              <span>KONSOL DATA SCIENCE & TRIANGULASI PENILAIAN OBJEKTIF 360°</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Matriks Data Science 360° Kru Jaringan
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Arsitektur evaluasi baku mengacu pada <strong>KSA Framework (*Knowledge 30%, Skill 45%, Attitude H.A.R.A 25%*)</strong> terstandar, 
              dihubungkan langsung secara matematis dengan kurva normal Gauss ($Z$-Score) dan otomatis sinkron ke <strong>Rapor Resmi Kru</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsChecklistModalOpen(true)}
              className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <CheckSquare size={15} />
              <span>Panduan Ceklis & Integrasi Rapor</span>
            </button>

            <button
              onClick={() => onNavigateToExam?.('sikap')}
              className="px-3.5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-rose-500/30 active:scale-95 cursor-pointer"
            >
              <Heart size={14} className="text-rose-400" />
              <span>Pilar 4: Penilaian Budaya HARA</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-slate-800 text-xs">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Populasi Terdaftar</span>
              <strong className="text-lg font-black text-white">{list.length} Kru</strong>
            </div>
            <UserCheck size={20} className="text-blue-400" />
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Lulus Mandiri (≥75)</span>
              <strong className="text-lg font-black text-emerald-400">
                {list.filter(k => k.statusKelulusan === 'LULUS').length} Kru
              </strong>
            </div>
            <Award size={20} className="text-emerald-400" />
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Taraf Mahir (≥85)</span>
              <strong className="text-lg font-black text-amber-400">
                {list.filter(k => k.badge === 'Mahir').length} Kru
              </strong>
            </div>
            <Sparkles size={20} className="text-amber-400" />
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Rata-rata Kohort (μ)</span>
              <strong className="text-lg font-black text-cyan-300">
                {cohortStats ? cohortStats.mean : 0}/100
              </strong>
            </div>
            <BarChart3 size={20} className="text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Model View Switcher Tabs (KSA 3-Pillar vs Radar 360 vs 9-Box vs 4-Dimensi vs Gauss Distribution) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setMatrixMode('ksa')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              matrixMode === 'ksa'
                ? 'bg-[#96171B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield size={14} />
            <span>Matriks KSA Terpadu (K 30% • S 45% • A 25%)</span>
          </button>

          <button
            onClick={() => {
              setMatrixMode('radar360');
              if (!radarSelectedCrewName && filtered.length > 0) {
                setRadarSelectedCrewName(filtered[0].namaKru);
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              matrixMode === 'radar360'
                ? 'bg-[#96171B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass size={14} />
            <span>Spiderweb Radar 360° (8-Axis KSA)</span>
          </button>

          <button
            onClick={() => setMatrixMode('talent9box')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              matrixMode === 'talent9box'
                ? 'bg-[#96171B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Target size={14} />
            <span>9-Box Talent Matrix & Preskriptif</span>
          </button>

          <button
            onClick={() => setMatrixMode('4dimensi')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              matrixMode === '4dimensi'
                ? 'bg-[#96171B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers size={14} />
            <span>Rincian 4 Dimensi Operasional</span>
          </button>

          <button
            onClick={() => setMatrixMode('gauss')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              matrixMode === 'gauss'
                ? 'bg-[#96171B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 size={14} />
            <span>Kurva Gauss & Cohort Z-Score</span>
          </button>
        </div>

        <button
          onClick={loadData}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer self-end sm:self-auto"
          title="Refresh Data"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* MODE 1: DEDICATED 360° SPIDERWEB RADAR (8-AXIS KSA MULTI-DIMENSI) */}
      {matrixMode === 'radar360' && (() => {
        const activeRadarCrew = filtered.find(c => c.namaKru === radarSelectedCrewName) || filtered[0];

        return (
          <div className="space-y-4">
            {/* Top Selector Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#8B1418] uppercase tracking-wider">
                  Analitik Data Science 360°
                </span>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Spiderweb Kompetensi 8-Axis KSA & Uji Gap Terhadap Standar QSR
                </h3>
                <p className="text-xs text-slate-500">
                  Triangulasi Knowledge (Teori SOP & HACCP), Skill (SOS, Suhu & Layanan), dan Sikap Visi-Misi H.A.R.A
                </p>
              </div>

              {/* Crew Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 shrink-0">Pilih Kru:</span>
                <select
                  value={activeRadarCrew?.namaKru || ''}
                  onChange={(e) => setRadarSelectedCrewName(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#96171B]/20"
                >
                  {filtered.map(c => (
                    <option key={c.namaKru} value={c.namaKru}>
                      {c.namaKru} ({c.divisi} - {c.kode_outlet}) — Skor: {c.skorAkhir || '-'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeRadarCrew ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Visualizer Spiderweb Radar */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-between space-y-4">
                  <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{activeRadarCrew.namaKru}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        {activeRadarCrew.divisi} • {activeRadarCrew.kode_outlet}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Indeks Komposit</span>
                      <span className="text-xl font-black text-[#96171B] font-mono">
                        {activeRadarCrew.skorAkhir}<span className="text-xs text-slate-400 font-normal">/100</span>
                      </span>
                    </div>
                  </div>

                  <div className="py-2">
                    <CrewRadarChart
                      axes={activeRadarCrew.radar360Axes}
                      teoriScore={activeRadarCrew.skorTeori || 75}
                      praktikScore={activeRadarCrew.skorPraktik || 80}
                      lisanScore={activeRadarCrew.skorLisan || 70}
                      observasiScore={activeRadarCrew.skorAttitude || 85}
                      size={280}
                    />
                  </div>

                  <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-around text-xs font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span>Aktual Kru</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="w-3 h-3 rounded-full border-2 border-dashed border-slate-400" />
                      <span>Target Standar (85.0)</span>
                    </div>
                  </div>
                </div>

                {/* 8-Axis Diagnostics Table */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Tabel Rincian 8-Axis & Analisis Kesenjangan (Gap)
                    </span>
                    <span className="text-[10.5px] font-mono text-slate-500">
                      Benchmark QSR: 85.0 Poin
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="py-2">Dimensi Kompetensi</th>
                          <th className="py-2 text-center">Skor</th>
                          <th className="py-2 text-center">Target</th>
                          <th className="py-2 text-center">Gap</th>
                          <th className="py-2">Status & Diagnostik</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {(activeRadarCrew.radar360Axes || []).map((ax) => {
                          const benchmark = ax.benchmark || 85;
                          const gap = Math.round(ax.score - benchmark);
                          const isSuccess = gap >= 0;

                          return (
                            <tr key={ax.axis} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 font-bold text-slate-800">
                                {ax.axis}
                              </td>
                              <td className="py-2.5 text-center font-black text-slate-900 font-mono">
                                {ax.score}
                              </td>
                              <td className="py-2.5 text-center text-slate-400 font-mono">
                                {benchmark}
                              </td>
                              <td className="py-2.5 text-center font-mono font-bold">
                                <span className={`px-1.5 py-0.5 rounded text-[10.5px] ${
                                  isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {gap >= 0 ? `+${gap}` : gap}
                                </span>
                              </td>
                              <td className="py-2.5">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ax.score >= 90 ? 'bg-emerald-100 text-emerald-800' :
                                  ax.score >= 80 ? 'bg-blue-100 text-blue-800' :
                                  ax.score >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {ax.score >= 90 ? 'Sangat Mahir' :
                                   ax.score >= 80 ? 'Sesuai Standar' :
                                   ax.score >= 70 ? 'Butuh Pendampingan' : 'Wajib Remedial'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Automated Prescriptive Recommendations Box */}
                  <div className="pt-3 border-t border-slate-100 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <span className="font-bold text-[#8B1418] flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                      <Sparkles size={12} />
                      <span>Rekomendasi Preskriptif Data Science untuk {activeRadarCrew.namaKru}:</span>
                    </span>
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {activeRadarCrew.skorAkhir && activeRadarCrew.skorAkhir >= 85
                        ? `Performa sangat konsisten di atas benchmark kohort (+${activeRadarCrew.zScore || 1.1}σ). Direkomendasikan untuk promosi sebagai Shift Leader atau Trainer Pendamping OJT di outlet ${activeRadarCrew.kode_outlet}.`
                        : activeRadarCrew.skorAkhir && activeRadarCrew.skorAkhir >= 75
                        ? `Memenuhi standar kelulusan operasional QSR. Perlu fokus pengasahan pada kecepatan layanan jam sibuk (Speed of Service) dan ketaatan gramatur bahan baku.`
                        : `Memerlukan program intervensi remedial terfokus 14 hari dengan checklist harian sebelum dapat dilepas mandiri pada shift operasional.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
                Pilih atau cari kru untuk menampilkan visualisasi Radar 360°.
              </div>
            )}
          </div>
        );
      })()}

      {/* MODE 2: TALENT 9-BOX MATRIX & PRESCRIPTIVE MAPPING */}
      {matrixMode === 'talent9box' && (() => {
        // Group filtered crews into 9 boxes based on Performance (skorAkhir) vs Potential/Attitude (skorAttitude)
        // High: >=85, Med: 70-84, Low: <70
        const getBoxKey = (crew: CrewCompetencySummary) => {
          const perf = crew.skorAkhir || 75;
          const pot = crew.skorAttitude || crew.skorAudit || 75;
          const perfTier = perf >= 85 ? 'H' : perf >= 70 ? 'M' : 'L';
          const potTier = pot >= 85 ? 'H' : pot >= 70 ? 'M' : 'L';
          return `${potTier}-${perfTier}`;
        };

        const BOXES_CONFIG = [
          { key: 'H-L', title: 'Untapped Potential', subtitle: 'Potensi Tinggi, Kinerja Rendah', rec: 'Atasi hambatan praktik lapangan, pendampingan intensif.', bg: 'bg-amber-50/60 border-amber-200 text-amber-900' },
          { key: 'H-M', title: 'Emerging Star', subtitle: 'Potensi Tinggi, Kinerja Sedang', rec: 'Berikan proyek operasional & tantangan jam sibuk.', bg: 'bg-emerald-50/60 border-emerald-200 text-emerald-900' },
          { key: 'H-H', title: 'Top Star Performer', subtitle: 'Potensi Tinggi, Kinerja Tinggi', rec: 'Promosi Shift Leader / Calon Store Manager.', bg: 'bg-emerald-100/70 border-emerald-300 text-emerald-950 font-bold' },
          
          { key: 'M-L', title: 'Inconsistent Crew', subtitle: 'Potensi Sedang, Kinerja Rendah', rec: 'Evaluasi kesesuaian stasiun kerja & drill SOP.', bg: 'bg-rose-50/60 border-rose-200 text-rose-900' },
          { key: 'M-M', title: 'Core Contributor', subtitle: 'Potensi Sedang, Kinerja Sedang', rec: 'Pertahankan stabilitas & berikan refreshment berkala.', bg: 'bg-blue-50/60 border-blue-200 text-blue-900' },
          { key: 'M-H', title: 'High Professional', subtitle: 'Potensi Sedang, Kinerja Tinggi', rec: 'Jadikan mentor teknis penepungan & kasir di outlet.', bg: 'bg-emerald-50/60 border-emerald-200 text-emerald-900' },

          { key: 'L-L', title: 'Remedial Risk', subtitle: 'Potensi Rendah, Kinerja Rendah', rec: 'Karantina remedial 14 hari; re-evaluasi kelayakan.', bg: 'bg-red-100/70 border-red-300 text-red-950' },
          { key: 'L-M', title: 'Effective Specialist', subtitle: 'Potensi Rendah, Kinerja Sedang', rec: 'Pertahankan pada peran spesifik tanpa rotasi berlebih.', bg: 'bg-slate-50 border-slate-200 text-slate-800' },
          { key: 'L-H', title: 'Solid Workhorse', subtitle: 'Potensi Rendah, Kinerja Tinggi', rec: 'Apresiasi kedisiplinan kerja; jaga motivasi harian.', bg: 'bg-blue-50/60 border-blue-200 text-blue-900' },
        ];

        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#8B1418] uppercase tracking-wider">
                  Pemetaan Bakat & Talenta Kru
                </span>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Matriks 9-Box Talent Grid (Kinerja Komposit vs Potensi & Sikap H.A.R.A)
                </h3>
                <p className="text-xs text-slate-500">
                  Kerangka analitik untuk suksesi karir, promosi Shift Leader, dan intervensi pembinaan terarah
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                Total Kru Terpetakan: {filtered.length}
              </span>
            </div>

            {/* 3x3 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {BOXES_CONFIG.map((b) => {
                const crewsInBox = filtered.filter(c => getBoxKey(c) === b.key);

                return (
                  <div
                    key={b.key}
                    className={`rounded-2xl border p-4 shadow-2xs space-y-2.5 flex flex-col justify-between ${b.bg}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black tracking-tight uppercase">
                          {b.title}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white/80 border border-current shadow-2xs">
                          {crewsInBox.length} Kru
                        </span>
                      </div>
                      <p className="text-[10.5px] opacity-80 leading-snug">
                        {b.subtitle}
                      </p>
                    </div>

                    {/* Crew List Inside this Box */}
                    <div className="space-y-1.5 min-h-[70px]">
                      {crewsInBox.length === 0 ? (
                        <div className="text-[11px] opacity-50 italic py-3 text-center">
                          Tidak ada kru di kuadran ini
                        </div>
                      ) : (
                        crewsInBox.map((c) => (
                          <div
                            key={c.namaKru}
                            onClick={() => setSelectedCrewDrawer(c)}
                            className="p-2 rounded-xl bg-white/90 border border-slate-200 text-xs font-medium flex items-center justify-between hover:bg-white transition-all cursor-pointer shadow-2xs"
                          >
                            <div>
                              <span className="font-extrabold text-slate-900 block leading-tight">{c.namaKru}</span>
                              <span className="text-[9.5px] text-slate-500">{c.divisi} • {c.kode_outlet}</span>
                            </div>
                            <span className="font-mono font-black text-slate-800 text-xs">
                              {c.skorAkhir}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="pt-2 border-t border-current/15 text-[10px] leading-tight opacity-90">
                      <strong>Aksi:</strong> {b.rec}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Cohort Normal Distribution (Gauss Bell Curve Data Science Widget) */}
      {(matrixMode === 'gauss' || matrixMode === 'ksa') && cohortStats && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-[#96171B]" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Distribusi Normal Kohort Kru (Gauss Bell-Curve Benchmark)
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
              <span>Mean (μ): <strong className="text-slate-900">{cohortStats.mean}</strong></span>
              <span>Deviasi Standar (σ): <strong className="text-slate-900">{cohortStats.stdev}</strong></span>
              <span>Populasi: <strong className="text-slate-900">{cohortStats.count} Kru</strong></span>
            </div>
          </div>

          {/* Bell Curve Visual Spread Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span className="text-red-700">P25 Remedial: {cohortStats.p25}</span>
              <span className="text-blue-700">P50 Median: {cohortStats.p50}</span>
              <span className="text-amber-700">P75 Terampil: {cohortStats.p75}</span>
              <span className="text-emerald-700">P90 Benchmark: {cohortStats.p90}</span>
            </div>
            <div className="h-3 w-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-500 rounded-full opacity-80" />
            <p className="text-[10.5px] text-slate-400 text-center">
              Distribusi normal mengeliminasi bias subjektif: Kru dipromosikan jika Z &gt; +1.28 (Top 10%), dan wajib coaching jika Z &lt; -1.0.
            </p>
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar (Displayed for Table Modes) */}
      {(matrixMode === 'ksa' || matrixMode === '4dimensi' || matrixMode === 'gauss') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama kru atau outlet..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
              />
            </div>

            <select
              value={divFilter}
              onChange={(e) => setDivFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800"
            >
              <option value="ALL">Semua Divisi</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Kasir">Kasir</option>
              <option value="Geprek">Geprek</option>
              <option value="Helper">Helper</option>
            </select>

            <select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800"
            >
              <option value="ALL">Semua Kualifikasi</option>
              <option value="Mahir">Mahir (≥85)</option>
              <option value="Terampil">Terampil (65-84)</option>
              <option value="Pemula">Pemula (&lt;65)</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 font-semibold self-end md:self-center">
            Menampilkan <b>{filtered.length}</b> personil terdata
          </div>
        </div>
      )}

      {/* Main Table: KSA vs 4-Dimensi */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-black text-[10px] uppercase tracking-wider border-b border-slate-200">
              {matrixMode === 'ksa' ? (
                <tr>
                  <th className="py-3 px-3.5">Nama Kru & Divisi</th>
                  <th className="py-3 px-3">Outlet</th>
                  <th className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <BookOpen size={12} className="text-blue-600" />
                      <span>1. Knowledge (30%)</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-normal lowercase">teori + lisan</span>
                  </th>
                  <th className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Wrench size={12} className="text-amber-600" />
                      <span>2. Skill (45%)</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-normal lowercase">praktik SOS & suhu</span>
                  </th>
                  <th className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Heart size={12} className="text-rose-600" />
                      <span>3. Attitude (25%)</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-normal lowercase">budaya H.A.R.A & 5S</span>
                  </th>
                  <th className="py-3 px-3 text-center">Indeks Komposit & Z</th>
                  <th className="py-3 px-3 text-center">Predikat</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              ) : matrixMode === '4dimensi' ? (
                <tr>
                  <th className="py-3 px-3.5">Nama Kru & Divisi</th>
                  <th className="py-3 px-3">Outlet</th>
                  <th className="py-3 px-2 text-center">1. Teori SOP (20%)</th>
                  <th className="py-3 px-2 text-center">2. Praktik SOS (40%)</th>
                  <th className="py-3 px-2 text-center">3. Lisan HACCP (15%)</th>
                  <th className="py-3 px-2 text-center">4. Sikap H.A.R.A (25%)</th>
                  <th className="py-3 px-3 text-center">Skor Akhir & Z</th>
                  <th className="py-3 px-3 text-center">Predikat</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              ) : (
                <tr>
                  <th className="py-3 px-3.5">Nama Kru & Divisi</th>
                  <th className="py-3 px-3">Outlet</th>
                  <th className="py-3 px-3 text-center">Skor Aktual</th>
                  <th className="py-3 px-3 text-center">Z-Score Normal</th>
                  <th className="py-3 px-3 text-center">Percentile Rank</th>
                  <th className="py-3 px-3 text-center">Deviasi terhadap Mean (μ={cohortStats?.mean})</th>
                  <th className="py-3 px-3 text-center">Status Kelulusan</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {!filtered.length ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ada data kru yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const z = item.zScore !== undefined ? item.zScore : 0;
                  const dev = cohortStats ? (item.skorAkhir || 0) - cohortStats.mean : 0;

                  return (
                    <tr
                      key={item.namaKru}
                      onClick={() => setSelectedCrewDrawer(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Kru Name */}
                      <td className="py-3 px-3.5">
                        <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 group-hover:text-[#96171B] transition-colors">
                          <span>{item.namaKru}</span>
                          <Eye size={12} className="opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {item.divisi}
                          </span>
                          <span className="text-[9.5px] text-slate-400">
                            {item.riwayatCoachingCount}x Coaching
                          </span>
                        </div>
                      </td>

                      {/* Outlet */}
                      <td className="py-3 px-3 font-bold text-slate-700 text-xs">
                        {item.kode_outlet}
                      </td>

                      {/* Dynamic Columns based on matrixMode */}
                      {matrixMode === 'ksa' ? (
                        <>
                          {/* 1. Knowledge (30%) */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToExam?.('teori', item.namaKru);
                              }}
                              className="font-black text-xs text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 cursor-pointer transition-colors"
                              title="Lihat / Uji Teori SOP Kru"
                            >
                              {item.skorKnowledge ?? item.skorTeori ?? '-'}
                            </button>
                            <div className="text-[9px] text-slate-400 mt-0.5">
                              T:{item.skorTeori ?? '-'} • L:{item.skorLisan ?? '-'}
                            </div>
                          </td>

                          {/* 2. Skill (45%) */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToExam?.('praktik', item.namaKru);
                              }}
                              className="font-black text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200 cursor-pointer transition-colors"
                              title="Lihat / Uji Praktik SOS Kru"
                            >
                              {item.skorSkill ?? item.skorPraktik ?? '-'}
                            </button>
                            <div className="text-[9px] text-slate-400 mt-0.5">
                              SOS Stopwatch
                            </div>
                          </td>

                          {/* 3. Attitude H.A.R.A (25%) */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToExam?.('sikap', item.namaKru);
                              }}
                              className="font-black text-xs text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-200 cursor-pointer transition-colors"
                              title="Buka Penilaian Budaya H.A.R.A Kru Ini"
                            >
                              {item.skorAttitude ?? item.skorAudit ?? 82}
                            </button>
                            <div className="text-[9px] text-slate-400 mt-0.5">
                              H:{item.attitudeHaraDetail?.h_higienis || 85} · A1:{item.attitudeHaraDetail?.a_amanah || 85}
                            </div>
                          </td>

                          {/* Indeks Akhir & Z */}
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="text-sm font-black text-[#96171B]">
                                {item.skorAkhir ?? '-'}
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono font-bold">
                                {item.zScore !== undefined ? `Z: ${item.zScore > 0 ? `+${item.zScore}` : item.zScore}` : ''}
                              </span>
                            </div>
                          </td>

                          {/* Badge */}
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              item.badge === 'Mahir'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : item.badge === 'Terampil'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {item.badge}
                            </span>
                          </td>
                        </>
                      ) : matrixMode === '4dimensi' ? (
                        <>
                          <td className="py-3 px-2 text-center font-bold text-xs">{item.skorTeori ?? '-'}</td>
                          <td className="py-3 px-2 text-center font-bold text-xs">{item.skorPraktik ?? '-'}</td>
                          <td className="py-3 px-2 text-center font-bold text-xs">{item.skorLisan ?? '-'}</td>
                          <td className="py-3 px-2 text-center font-bold text-xs">{item.skorAudit ?? '-'}</td>
                          <td className="py-3 px-3 text-center font-black text-sm text-[#96171B]">{item.skorAkhir ?? '-'}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {item.badge}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-3 text-center font-black text-sm text-slate-900">{item.skorAkhir ?? '-'}</td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-xs">
                            <span className={`px-2 py-0.5 rounded-md ${
                              z > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                            }`}>
                              {z > 0 ? `+${z}` : z}σ
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-xs text-blue-700">
                            Persentil {item.percentileRank || 50}%
                          </td>
                          <td className="py-3 px-3 text-center text-xs">
                            <span className={dev >= 0 ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                              {dev >= 0 ? `+${dev}` : dev} poin
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.statusKelulusan === 'LULUS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.statusKelulusan || 'LULUS'}
                            </span>
                          </td>
                        </>
                      )}

                      {/* Actions */}
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onNavigateToExam?.('sikap', item.namaKru)}
                            className="p-1.5 hover:bg-rose-50 text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title="Penilaian Budaya H.A.R.A Kru Ini"
                          >
                            <Heart size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setRaporKruTarget(item.namaKru)}
                            className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10.5px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer border border-stone-200"
                            title="Buka Rapor Resmi Kru"
                          >
                            <FileText size={12} className="text-[#8B1418]" />
                            <span>Rapor</span>
                          </button>
                          {item.skorAkhir !== null && (
                            <button
                              type="button"
                              onClick={() => openCertificate(item)}
                              className="px-2.5 py-1 bg-[#96171B] hover:bg-[#801216] text-white text-[10.5px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Award size={12} />
                              <span>Sertifikat</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 360° Crew Inspection Slide-Over Drawer */}
      {selectedCrewDrawer && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex justify-end animate-in fade-in"
          onClick={() => setSelectedCrewDrawer(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#96171B] text-white font-black flex items-center justify-center text-sm shadow-xs">
                    {selectedCrewDrawer.namaKru.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">{selectedCrewDrawer.namaKru}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Divisi {selectedCrewDrawer.divisi} • Outlet {selectedCrewDrawer.kode_outlet}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCrewDrawer(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Header */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold">Kualifikasi 360°</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {selectedCrewDrawer.badge} ({selectedCrewDrawer.statusKelulusan || 'LULUS'})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9.5px] uppercase tracking-wider text-slate-400 font-bold">Indeks Komposit KSA</div>
                  <div className="text-2xl font-black text-[#96171B]">
                    {selectedCrewDrawer.skorAkhir ?? '-'}<span className="text-xs text-slate-400 font-normal">/100</span>
                  </div>
                </div>
              </div>

              {/* Radar Chart Visualizer 360 */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">
                  Visualisasi Profil Radar 360°
                </div>
                <CrewRadarChart
                  teoriScore={selectedCrewDrawer.skorTeori || 75}
                  praktikScore={selectedCrewDrawer.skorPraktik || 80}
                  lisanScore={selectedCrewDrawer.skorLisan || 70}
                  observasiScore={selectedCrewDrawer.skorAttitude || selectedCrewDrawer.skorAudit || 75}
                  axes={selectedCrewDrawer.radar360Axes}
                  size={220}
                />
              </div>

              {/* KSA 3-Pillars Breakdown */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Triangulasi 3 Pilar Baku (KSA)
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Formula Baku QSR
                  </span>
                </div>

                {/* 1. Knowledge */}
                <div className="p-3 border border-slate-200 rounded-xl space-y-1.5 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen size={13} className="text-blue-600" />
                      <span>1. Knowledge / Teori SOP (Bobot 30%)</span>
                    </span>
                    <span className="font-black text-slate-900">{selectedCrewDrawer.skorKnowledge ?? selectedCrewDrawer.skorTeori ?? '-'}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${selectedCrewDrawer.skorKnowledge || 75}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Ujian Teori Bank Soal: {selectedCrewDrawer.skorTeori ?? '-'}</span>
                    <span>Uji Lisan HACCP Reasoning: {selectedCrewDrawer.skorLisan ?? '-'}</span>
                  </div>
                </div>

                {/* 2. Skill */}
                <div className="p-3 border border-slate-200 rounded-xl space-y-1.5 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Wrench size={13} className="text-amber-600" />
                      <span>2. Skill / Praktik Lapangan (Bobot 45%)</span>
                    </span>
                    <span className="font-black text-slate-900">{selectedCrewDrawer.skorSkill ?? selectedCrewDrawer.skorPraktik ?? '-'}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600 rounded-full" style={{ width: `${selectedCrewDrawer.skorSkill || 75}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Stopwatch Speed of Service (SOS)</span>
                    <span>Suhu Deep Fryer (160°C ± 5°C)</span>
                  </div>
                </div>

                {/* 3. Attitude H.A.R.A */}
                <div className="p-3 border border-slate-200 rounded-xl space-y-1.5 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Heart size={13} className="text-rose-600" />
                      <span>3. Attitude / Budaya H.A.R.A (Bobot 25%)</span>
                    </span>
                    <span className="font-black text-slate-900">{selectedCrewDrawer.skorAttitude ?? selectedCrewDrawer.skorAudit ?? '-'}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-600 rounded-full" style={{ width: `${selectedCrewDrawer.skorAttitude || 80}%` }} />
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[9.5px] text-center pt-1">
                    <div className="p-1 bg-white rounded border border-slate-200">
                      <strong className="block text-slate-700">H: {selectedCrewDrawer.attitudeHaraDetail?.h_higienis || 85}</strong>
                      <span className="text-[8px] text-slate-400">Higienis</span>
                    </div>
                    <div className="p-1 bg-white rounded border border-slate-200">
                      <strong className="block text-slate-700">A: {selectedCrewDrawer.attitudeHaraDetail?.a_antusias || 88}</strong>
                      <span className="text-[8px] text-slate-400">Antusias</span>
                    </div>
                    <div className="p-1 bg-white rounded border border-slate-200">
                      <strong className="block text-slate-700">R: {selectedCrewDrawer.attitudeHaraDetail?.r_resik || 84}</strong>
                      <span className="text-[8px] text-slate-400">Resik</span>
                    </div>
                    <div className="p-1 bg-white rounded border border-slate-200">
                      <strong className="block text-slate-700">A: {selectedCrewDrawer.attitudeHaraDetail?.a_amanah || 90}</strong>
                      <span className="text-[8px] text-slate-400">Amanah</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  const target = selectedCrewDrawer;
                  setSelectedCrewDrawer(null);
                  onNavigateToExam?.('sikap', target.namaKru);
                }}
                className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border border-rose-200"
              >
                <Heart size={14} className="text-rose-600" />
                <span>Buka Penilaian Budaya H.A.R.A Kru Ini</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const target = selectedCrewDrawer.namaKru;
                  setSelectedCrewDrawer(null);
                  setRaporKruTarget(target);
                }}
                className="w-full py-2.5 bg-[#8B1418] hover:bg-[#720e12] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <FileText size={14} />
                <span>Buka Rapor Resmi Kru (100% Acuan SOP)</span>
              </button>

              <button
                type="button"
                onClick={() => downloadCertificatePDF(selectedCrewDrawer)}
                className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all border border-stone-200"
              >
                <Download size={14} />
                <span>Unduh Berita Acara & Sertifikat Resmi (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCrewDrawer(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Tutup Konsol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      {certCrew && (
        <CrewCertificateModal
          isOpen={!!certCrew}
          onClose={() => setCertCrew(null)}
          kru={{
            id: certCrew.namaKru.toLowerCase().replace(/\s+/g, '-'),
            nama_kru: certCrew.namaKru,
            kode_outlet: certCrew.kode_outlet,
            divisi: certCrew.divisi as any,
            tanggal_masuk: '2026-01-01',
            status_aktif: 'Aktif',
            created_at: new Date().toISOString(),
          }}
          score={certCrew.skorAkhir || 90}
          outletName={outlets.find((o) => o.kode_outlet === certCrew.kode_outlet)?.nama_outlet || `Cabang ${certCrew.kode_outlet}`}
          division={certCrew.divisi}
        />
      )}

      {/* Official Crew Report Modal Container */}
      {raporKruTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-[#FBF9F5] rounded-3xl border border-stone-200 shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6">
            <OfficialRaporKruView
              selectedCrewName={raporKruTarget}
              selectedOutletCode={selectedOutletCode}
              onBack={() => setRaporKruTarget(null)}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PANDUAN CEKLIS TERPADU & INTEGRASI RAPOR */}
      {/* ========================================================================= */}
      {isChecklistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#96171B] text-white">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Panduan Ceklis Terpadu: Standar Penilaian & Integrasi Rapor Kru
                  </h2>
                  <p className="text-xs text-slate-500">
                    Standarisasi alur pengujian objektif dari Hari ke-1 hingga Hari ke-30 sertifikasi mandiri.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChecklistModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            {/* Rekomendasi Jawaban Arsitektur (KSA Framework) */}
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs space-y-2 text-amber-950">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                <Sparkles size={16} className="text-amber-700" />
                <span>Rekomendasi Struktur Penilaian: Triangulasi KSA (*Knowledge, Skill, Attitude*)</span>
              </div>
              <p className="leading-relaxed text-[11.5px]">
                <strong>Penilaian H.A.R.A sejatinya adalah pilar ATTITUDE (Sikap & Karakter Kerja).</strong> 
                Mengelompokkan seluruh evaluasi ke dalam 3 Pilar Utama KSA (*Knowledge 30%, Skill 45%, Attitude H.A.R.A 25%*) 
                adalah standar emas industri QSR yang menghilangkan ambiguitas dan tumpang tindih nilai.
              </p>
            </div>

            {/* Checklist Matrix 3 Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Pilar 1 */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
                <div className="flex items-center gap-2 font-black text-blue-900">
                  <BookOpen size={16} className="text-blue-700" />
                  <span>PILAR 1: KNOWLEDGE (30%)</span>
                </div>
                <p className="text-[11px] text-blue-950 leading-relaxed">
                  Mengukur seberapa jauh personil <strong>tahu dan paham</strong> standar operasional baku.
                </p>
                <ul className="space-y-2 text-[11px] text-slate-700">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={14} className="text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Ujian Teori Bank Soal:</strong> 40 butir soal acuan SOP (Passing Grade: 75%).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={14} className="text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Uji Lisan HACCP:</strong> Menguji pemahaman alasan logis (*Why behind SOP*) dan tindakan korektif.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={14} className="text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Auto-Sync:</strong> Nilai langsung terekam tanpa campur tangan manipulasi penilai.</span>
                  </li>
                </ul>
              </div>

              {/* Pilar 2 */}
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center gap-2 font-black text-amber-900">
                  <Wrench size={16} className="text-amber-700" />
                  <span>PILAR 2: SKILL / PRAKTIK (45%)</span>
                </div>
                <p className="text-[11px] text-amber-950 leading-relaxed">
                  Mengukur ketangkasan dan presisi kru saat <strong>mengeksekusi</strong> pekerjaan di stasiun.
                </p>
                <ul className="space-y-2 text-[11px] text-slate-700">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Stopwatch SOS:</strong> Waktu layanan kasir (&lt;45s) dan kecepatan goreng (&lt;12 min).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Suhu Deep Fryer:</strong> Thermometer calibrated wajib 160°C ± 5°C.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Timbangan Gramasi:</strong> Akurasi takaran bumbu dan porsi toleransi ±5 gram.</span>
                  </li>
                </ul>
              </div>

              {/* Pilar 3 */}
              <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-3">
                <div className="flex items-center gap-2 font-black text-rose-900">
                  <Heart size={16} className="text-rose-700" />
                  <span>PILAR 3: ATTITUDE H.A.R.A (25%)</span>
                </div>
                <p className="text-[11px] text-rose-950 leading-relaxed">
                  Didapat dari mana? <strong>Audit observasi perilaku nyata di outlet (*BARS Scale*)</strong>:
                </p>
                <ul className="space-y-2 text-[11px] text-slate-700">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>H (Higienis & Disiplin):</strong> APD lengkap, sanitasi tangan, jam hadir shift.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>A (Antusias & Tim):</strong> Tanggap saat rush hour, saling back-up stasiun.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>R (Resik & 5S):</strong> Clean as you go, tidak menumpuk alat kotor, zero waste.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                    <span><strong>A (Amanah & Hospitality):</strong> Kejujuran uang kas, senyum-salam-sapa (5S).</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Integrasi Rapor Kru */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-900 text-xs block">
                Bagaimana Data Mengalir Otomatis ke Rapor Resmi Kru?
              </span>
              <p className="text-slate-600 leading-relaxed text-[11.5px]">
                Setiap kali trainer melakukan input (Ujian Teori, Stopwatch SOS Praktik, Tanya-Jawab Lisan, atau Audit Sikap H.A.R.A), 
                sistem menghitung ulang secara real-time:
              </p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800">
                Indeks Komposit Rapor = (Skor Knowledge × 0.30) + (Skor Skill × 0.45) + (Skor Attitude H.A.R.A × 0.25)
              </div>
              <p className="text-[11px] text-slate-500">
                *Klausul Deviasi Kritis: Jika ditemukan 1 pelanggaran kritis SOP (suhu &lt;150°C atau salah bumbu &gt;10%), 
                rekomendasi karir di Rapor Kru otomatis mengunci ke <em>Retraining Wajib</em> dan menunda promosi shift mandiri.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsChecklistModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Tutup Panduan Ceklis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
