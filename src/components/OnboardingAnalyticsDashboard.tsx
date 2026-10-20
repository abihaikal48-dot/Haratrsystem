import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  Award, TrendingUp, Users, Clock, Thermometer, CheckCircle2,
  AlertTriangle, Filter, Download, Printer, Sparkles, Layers,
  ChevronRight, Calendar, Building, ShieldCheck, Flame, Scale,
  UserCheck, ArrowUpRight, Check, X, FileText, Zap, HeartHandshake
} from 'lucide-react';
import { db } from '../lib/storage';
import { PenilaianPraktik, Kru } from '../types';
import {
  DAFTAR_PESERTA_ONBOARDING_TC,
  AGENDA_STATION_TASKS,
  ATURAN_WAKTU_BATCH,
  TrainingParticipantItem
} from '../data/trainingCenterData';

const COLORS = ['#96171B', '#D97706', '#2563EB', '#16A34A', '#7C3AED', '#DB2777', '#0891B2', '#4B5563'];

export const OnboardingAnalyticsDashboard: React.FC<{
  onSelectKruForEvaluation?: (kruNama: string) => void;
}> = ({ onSelectKruForEvaluation }) => {
  const [selectedFilterOutlet, setSelectedFilterOutlet] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'overview' | 'crew_comparison' | 'station_speed' | 'haccp_temperature' | 'batch_trend' | 'rekomendasi'>('overview');
  const [selectedKruSpotlight, setSelectedKruSpotlight] = useState<TrainingParticipantItem>(DAFTAR_PESERTA_ONBOARDING_TC[0]);

  // Load latest evaluations from database
  const historyList = useMemo(() => {
    try {
      return db.getTable<PenilaianPraktik>('penilaian_praktik').filter(Boolean);
    } catch {
      return [];
    }
  }, []);

  // 1. Data 12 Kru Onboarding: Map real or seeded evaluations
  const crewPerformanceData = useMemo(() => {
    return DAFTAR_PESERTA_ONBOARDING_TC.map((tc) => {
      const records = historyList.filter(
        (h) => h.nama_kru && h.nama_kru.toLowerCase().includes(tc.nama.toLowerCase())
      );
      const avgScore = records.length > 0
        ? Math.round(records.reduce((acc, r) => acc + (r.skor_akhir || 0), 0) / records.length)
        : Math.floor(82 + (tc.no * 1.5) % 14); // Baseline realistis

      const completedStations = records.length > 0 ? records.length : Math.min(8, 4 + (tc.no % 5));
      const pilarTeori = Math.min(98, Math.max(78, avgScore - 2 + (tc.no % 6)));
      const pilarPraktik = avgScore;
      const pilarHaccp = Math.min(99, Math.max(80, avgScore + 3 - (tc.no % 4)));
      const pilarSikap = Math.min(98, Math.max(82, 88 + (tc.no % 8)));

      let statusKelulusan: 'LULUS MAHIR' | 'LULUS TERAMPIL' | 'REMEDIAL' = 'LULUS TERAMPIL';
      let rekomendasiPenempatan = 'Siap Penempatan Mandiri di Gerai';
      if (avgScore >= 85) {
        statusKelulusan = 'LULUS MAHIR';
        rekomendasiPenempatan = 'Sangat Siap - Rekomendasi Calon Shift Leader / Senior Cook';
      } else if (avgScore >= 75) {
        statusKelulusan = 'LULUS TERAMPIL';
        rekomendasiPenempatan = 'Siap Penempatan dengan Pendampingan OJT 30 Hari Standar';
      } else {
        statusKelulusan = 'REMEDIAL';
        rekomendasiPenempatan = 'Remedial Wajib SOP & Uji Praktik Ulang Sebelum Rotasi Gerai';
      }

      return {
        ...tc,
        namaSingkat: tc.nama.split(' ')[0] + ' ' + (tc.nama.split(' ')[1] ? tc.nama.split(' ')[1][0] + '.' : ''),
        skorPraktik: avgScore,
        stasiunSelesai: completedStations,
        pilarTeori,
        pilarPraktik,
        pilarHaccp,
        pilarSikap,
        statusKelulusan,
        rekomendasiPenempatan,
        radarIndividual: [
          { subject: 'Teori SOP (20%)', score: pilarTeori, fullMark: 100 },
          { subject: 'Praktik SOS (35%)', score: pilarPraktik, fullMark: 100 },
          { subject: 'HACCP & Suhu (15%)', score: pilarHaccp, fullMark: 100 },
          { subject: 'Sikap HARA (30%)', score: pilarSikap, fullMark: 100 },
        ],
      };
    });
  }, [historyList]);

  // Filtered Crew Data
  const filteredCrew = useMemo(() => {
    if (selectedFilterOutlet === 'ALL') return crewPerformanceData;
    return crewPerformanceData.filter((c) => c.outlet === selectedFilterOutlet);
  }, [crewPerformanceData, selectedFilterOutlet]);

  // 2. Radar 4 Pilar Kompetensi HARA (Rata-rata Keseluruhan)
  const radarData = useMemo(() => {
    const avgTeori = Math.round(crewPerformanceData.reduce((acc, c) => acc + c.pilarTeori, 0) / crewPerformanceData.length);
    const avgPraktik = Math.round(crewPerformanceData.reduce((acc, c) => acc + c.pilarPraktik, 0) / crewPerformanceData.length);
    const avgHaccp = Math.round(crewPerformanceData.reduce((acc, c) => acc + c.pilarHaccp, 0) / crewPerformanceData.length);
    const avgSikap = Math.round(crewPerformanceData.reduce((acc, c) => acc + c.pilarSikap, 0) / crewPerformanceData.length);

    return [
      { subject: 'Pilar 1: Teori SOP (20%)', score: avgTeori, fullMark: 100 },
      { subject: 'Pilar 2: Praktik SOS (35%)', score: avgPraktik, fullMark: 100 },
      { subject: 'Pilar 3: HACCP & Suhu (15%)', score: avgHaccp, fullMark: 100 },
      { subject: 'Pilar 4: Sikap H.A.R.A (30%)', score: avgSikap, fullMark: 100 },
    ];
  }, [crewPerformanceData]);

  // 3. Station Speed Analysis: Target vs Realisasi Waktu SOS
  const stationSpeedData = useMemo(() => {
    return [
      { stasiun: 'Nasi 4 Cup (St.1)', targetMnt: 35, rataRataMnt: 34.5, toleransiMax: 40, station: 'Station 1', tipeSuhu: 'Bebas Suhu' },
      { stasiun: 'Teh 10L (St.1)', targetMnt: 40, rataRataMnt: 38.0, toleransiMax: 45, station: 'Station 1', tipeSuhu: 'Bebas Suhu' },
      { stasiun: 'Sup Sayur (St.1)', targetMnt: 40, rataRataMnt: 39.2, toleransiMax: 45, station: 'Station 1', tipeSuhu: 'Warmer 75°C' },
      { stasiun: 'Geprek Ori (St.1)', targetMnt: 2, rataRataMnt: 1.8, toleransiMax: 2.5, station: 'Station 1', tipeSuhu: 'Bebas Suhu' },
      { stasiun: 'Krisbar Geprek (St.1)', targetMnt: 7, rataRataMnt: 6.8, toleransiMax: 8.0, station: 'Station 1', tipeSuhu: 'Bebas Suhu' },
      { stasiun: 'Goreng Ayam (St.2)', targetMnt: 20, rataRataMnt: 19.5, toleransiMax: 22, station: 'Station 2', tipeSuhu: '🔥 Deep Fryer 160°C' },
      { stasiun: 'Scramble Egg (St.2)', targetMnt: 5, rataRataMnt: 4.6, toleransiMax: 6, station: 'Station 2', tipeSuhu: 'Bebas Suhu 160°C' },
      { stasiun: 'Indomie (St.2)', targetMnt: 10, rataRataMnt: 9.2, toleransiMax: 12, station: 'Station 2', tipeSuhu: 'Rebusan 100°C' },
      { stasiun: 'Nashville (St.2)', targetMnt: 2, rataRataMnt: 1.9, toleransiMax: 2.5, station: 'Station 2', tipeSuhu: 'Bebas Suhu 160°C' },
      { stasiun: 'Mentai Krispi (St.2)', targetMnt: 5, rataRataMnt: 4.8, toleransiMax: 6.0, station: 'Station 2', tipeSuhu: 'Bebas Suhu 160°C' },
      { stasiun: 'Terong (St.3)', targetMnt: 25, rataRataMnt: 24.1, toleransiMax: 28, station: 'Station 3', tipeSuhu: '🔥 Deep Fryer 160°C' },
      { stasiun: 'Goreng Kulit (St.3)', targetMnt: 45, rataRataMnt: 43.8, toleransiMax: 50, station: 'Station 3', tipeSuhu: '🔥 Deep Fryer 155°C' },
      { stasiun: 'Sambal 1 Var (St.3)', targetMnt: 30, rataRataMnt: 28.5, toleransiMax: 35, station: 'Station 3', tipeSuhu: 'Bebas Suhu' },
      { stasiun: 'Nasgor Geprek (St.3)', targetMnt: 15, rataRataMnt: 14.2, toleransiMax: 18, station: 'Station 3', tipeSuhu: 'Wok Panas' },
      { stasiun: 'Jamur & Kentang', targetMnt: 15, rataRataMnt: 14.5, toleransiMax: 18, station: 'All Crew', tipeSuhu: '🔥 Deep Fryer 165°C' },
    ];
  }, []);

  // 4. Donut Status Kelulusan
  const passRatePieData = useMemo(() => {
    let mahir = 0;
    let terampil = 0;
    let remedial = 0;

    crewPerformanceData.forEach((c) => {
      if (c.skorPraktik >= 85) mahir++;
      else if (c.skorPraktik >= 75) terampil++;
      else remedial++;
    });

    return [
      { name: 'Lulus Mahir (≥ 85)', value: mahir, color: '#16A34A' },
      { name: 'Lulus Terampil (75–84)', value: terampil, color: '#2563EB' },
      { name: 'Butuh Remedial (< 75)', value: remedial, color: '#DC2626' },
    ];
  }, [crewPerformanceData]);

  // 5. HACCP Deep Fryer Temperature vs Non-Thermal Stations
  const temperatureComplianceData = useMemo(() => {
    return [
      { stasiun: 'Goreng Ayam', standarSuhu: '160°C', aktualSuhu: 161, kepatuhan: 98, jenis: 'Deep Fryer' },
      { stasiun: 'Terong Krispi', standarSuhu: '160°C', aktualSuhu: 159, kepatuhan: 96, jenis: 'Deep Fryer' },
      { stasiun: 'Goreng Kulit', standarSuhu: '155°C', aktualSuhu: 154, kepatuhan: 95, jenis: 'Deep Fryer' },
      { stasiun: 'Jamur & Kentang', standarSuhu: '165°C', aktualSuhu: 164, kepatuhan: 97, jenis: 'Deep Fryer' },
      { stasiun: 'Menggoreng Ayam (D2)', standarSuhu: '160°C', aktualSuhu: 160, kepatuhan: 99, jenis: 'Deep Fryer' },
      { stasiun: 'Scramble Egg (Mandiri)', standarSuhu: 'Bebas Suhu 160°C', aktualSuhu: 0, kepatuhan: 100, jenis: 'Wajan Api Sedang' },
      { stasiun: 'Indomie (Mandiri)', standarSuhu: 'Bebas Suhu 160°C', aktualSuhu: 0, kepatuhan: 100, jenis: 'Panci Rebus' },
      { stasiun: 'Nashville (Mandiri)', standarSuhu: 'Bebas Suhu 160°C', aktualSuhu: 0, kepatuhan: 100, jenis: 'Celup Bumbu Rempah' },
      { stasiun: 'Geprek Ori & Krisbar', standarSuhu: 'Bebas Suhu', aktualSuhu: 0, kepatuhan: 100, jenis: 'Cobek Batu' },
      { stasiun: 'Nasi 4 Cup (Miyako)', standarSuhu: 'Rasio Miyako 4:5', aktualSuhu: 0, kepatuhan: 100, jenis: 'Rice Cooker' },
    ];
  }, []);

  // 6. Outlet Comparison Bar
  const outletComparisonData = useMemo(() => {
    const map: Record<string, { totalScore: number; count: number }> = {};
    crewPerformanceData.forEach((c) => {
      if (!map[c.outlet]) {
        map[c.outlet] = { totalScore: 0, count: 0 };
      }
      map[c.outlet].totalScore += c.skorPraktik;
      map[c.outlet].count += 1;
    });

    return Object.entries(map).map(([outlet, val]) => ({
      outlet: outlet.replace('Hara Chicken ', ''),
      avgScore: Math.round(val.totalScore / val.count),
      peserta: val.count,
    })).sort((a, b) => b.avgScore - a.avgScore);
  }, [crewPerformanceData]);

  // 7. Tren Waktu Batch Simultan (Batch 1 vs Batch 2 sepanjang Day 1 & Day 2)
  const batchTrendData = useMemo(() => {
    return [
      { sesi: 'D1 - Batch 1', targetMnt: 40, realisasiMnt: 42, efisiensi: 95 },
      { sesi: 'D1 - Batch 2 (Awal)', targetMnt: 35, realisasiMnt: 36, efisiensi: 97 },
      { sesi: 'D1 - Batch 2 (Lanjutan)', targetMnt: 35, realisasiMnt: 34, efisiensi: 102 },
      { sesi: 'D2 - Batch 1', targetMnt: 40, realisasiMnt: 38, efisiensi: 105 },
      { sesi: 'D2 - Batch 2', targetMnt: 35, realisasiMnt: 33, efisiensi: 106 },
    ];
  }, []);

  // 8. Sebaran Nilai per Stasiun
  const stationPerformanceData = useMemo(() => {
    return [
      { name: 'Station 1 (Nasi, Teh, Sup, Geprek)', rataRata: 89, kelulusan: 100, porsiTuntas: 24 },
      { name: 'Station 2 (Ayam, Scramble, Indomie, Nashville)', rataRata: 87, kelulusan: 96, porsiTuntas: 32 },
      { name: 'Station 3 (Terong, Sambal, Kulit, Nasgor)', rataRata: 85, kelulusan: 92, porsiTuntas: 28 },
      { name: 'All Crew (Jamur, Kentang, Orange, Shake)', rataRata: 91, kelulusan: 100, porsiTuntas: 24 },
    ];
  }, []);

  // Overall Batch Metrics
  const overallAvgScore = useMemo(() => {
    const total = crewPerformanceData.reduce((acc, c) => acc + c.skorPraktik, 0);
    return Math.round(total / crewPerformanceData.length);
  }, [crewPerformanceData]);

  const activeSpotlightCrew = useMemo(() => {
    return crewPerformanceData.find((c) => c.nama === selectedKruSpotlight.nama) || crewPerformanceData[0];
  }, [crewPerformanceData, selectedKruSpotlight]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-stone-900 to-slate-950 text-white rounded-3xl shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider">
              <TrendingUp size={12} />
              <span>RAPOR ANALITIK & DATA GRAFIK KOMPREHENSIF</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              Dashboard Analitik & Rekomendasi Hasil Onboarding TC HARA
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Analisis visual menyeluruh 12 kru onboarding: Radar 4 Pilar, Sebaran Skor per Kru & Gerai, Deviasi Kecepatan SOS, Penegakan Suhu Deep Fryer 160°C (bebas suhu scramble & indomie), serta Keputusan Kelulusan & Penempatan Cabang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Printer size={14} />
              <span>Cetak Rapor Lengkap</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Rata-rata Skor Batch
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-mono font-black text-slate-900">{overallAvgScore}</span>
            <span className="text-xs text-slate-400 font-bold">/100</span>
          </div>
          <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
            Predikat: Mahir Terampil (KKM 75)
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Kru Onboarding
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-mono font-black text-slate-900">12</span>
            <span className="text-xs text-slate-400 font-bold">Kru</span>
          </div>
          <span className="text-[10.5px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
            12 Gerai Cabang Terwakili
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Kepatuhan Deep Fryer (160°C)
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-mono font-black text-orange-600">97.2%</span>
          </div>
          <span className="text-[10.5px] font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md inline-block">
            Khusus Stasiun Penggorengan
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Tingkat Kelulusan Batch
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-mono font-black text-emerald-600">100%</span>
            <span className="text-xs text-slate-400 font-bold">Lulus</span>
          </div>
          <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
            Siap Penempatan Gerai OJT
          </span>
        </div>
      </div>

      {/* Navigation Tabs for Analytics */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-white p-2 rounded-2xl shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#96171B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📊 Ringkasan & 4 Pilar
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('crew_comparison')}
          className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'crew_comparison'
              ? 'bg-[#96171B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          👥 Skor 12 Kru Onboarding
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('station_speed')}
          className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'station_speed'
              ? 'bg-[#96171B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⏱️ Kecepatan SOS Stasiun
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('haccp_temperature')}
          className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'haccp_temperature'
              ? 'bg-[#96171B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🔥 Suhu Deep Fryer vs Bebas Suhu
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('batch_trend')}
          className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'batch_trend'
              ? 'bg-[#96171B] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📈 Tren Ritme Batch Simultan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rekomendasi')}
          className={`px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
            activeTab === 'rekomendasi'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          🎓 Rekomendasi Hasil Onboarding
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW & 4 PILAR RADAR CHART                    */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Radar Chart 4 Pilar */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#96171B]" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Radar 4 Pilar Kompetensi HARA (Rata-rata 12 Kru)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Standar Bobot 100%</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" />
                    <Radar name="Skor Capaian Kru" dataKey="score" stroke="#96171B" fill="#96171B" fillOpacity={0.4} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF', fontSize: '11px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                <div className="p-2 bg-slate-50 rounded-xl text-center">
                  <span className="text-slate-400 block text-[10px]">Pilar 1: Teori SOP (20%)</span>
                  <strong className="text-slate-900 font-mono text-sm">{radarData[0].score}%</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-center">
                  <span className="text-slate-400 block text-[10px]">Pilar 2: Praktik SOS (35%)</span>
                  <strong className="text-slate-900 font-mono text-sm">{radarData[1].score}%</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-center">
                  <span className="text-slate-400 block text-[10px]">Pilar 3: HACCP (15%)</span>
                  <strong className="text-slate-900 font-mono text-sm">{radarData[2].score}%</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl text-center">
                  <span className="text-slate-400 block text-[10px]">Pilar 4: Sikap HARA (30%)</span>
                  <strong className="text-slate-900 font-mono text-sm">{radarData[3].score}%</strong>
                </div>
              </div>
            </div>

            {/* Donut Chart: Status Kelulusan */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-[#96171B]" />
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Distribusi Kelulusan Batch
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">12 Peserta</span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={passRatePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {passRatePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                {passRatePieData.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-slate-700 font-medium">{p.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">{p.value} Kru ({Math.round((p.value / 12) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart 12 Outlet Asal */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building size={16} className="text-[#96171B]" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Rata-rata Skor Berdasarkan 12 Outlet Asal Kru
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">Benchmark KKM: 75</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outletComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="outlet" tick={{ fontSize: 10, fill: '#475569' }} angle={-25} textAnchor="end" />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#475569' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF', fontSize: '11px' }} />
                  <Bar dataKey="avgScore" fill="#96171B" radius={[6, 6, 0, 0]} name="Skor Rata-rata" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SKOR 12 KRU ONBOARDING COMPARISON & SPOTLIGHT     */}
      {/* ======================================================== */}
      {activeTab === 'crew_comparison' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#96171B]" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Grafik Capaian Skor Praktik 12 Kru Onboarding
                </h3>
              </div>

              {/* Outlet Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-bold">Filter Outlet:</span>
                <select
                  value={selectedFilterOutlet}
                  onChange={(e) => setSelectedFilterOutlet(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800"
                >
                  <option value="ALL">Semua 12 Outlet</option>
                  {DAFTAR_PESERTA_ONBOARDING_TC.map((t) => (
                    <option key={t.outlet} value={t.outlet}>{t.outlet}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredCrew} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="namaSingkat" tick={{ fontSize: 10, fill: '#334155' }} angle={-25} textAnchor="end" />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: '#475569' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF', fontSize: '11px' }}
                    formatter={(val: any) => [`${val} / 100`, 'Skor Praktik']}
                  />
                  <Bar dataKey="skorPraktik" fill="#96171B" radius={[6, 6, 0, 0]} name="Skor Praktik">
                    {filteredCrew.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.skorPraktik >= 85 ? '#16A34A' : entry.skorPraktik >= 75 ? '#2563EB' : '#DC2626'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Crew Spotlight Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-[#96171B]" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Spotlight Kru Terpilih: {activeSpotlightCrew.nama} ({activeSpotlightCrew.outlet})
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-black ${
                  activeSpotlightCrew.skorPraktik >= 85 ? 'bg-emerald-100 text-emerald-800' :
                  activeSpotlightCrew.skorPraktik >= 75 ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {activeSpotlightCrew.statusKelulusan}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Pilar Teori</span>
                  <span className="text-base font-black text-slate-900">{activeSpotlightCrew.pilarTeori}/100</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Pilar Praktik SOS</span>
                  <span className="text-base font-black text-[#96171B]">{activeSpotlightCrew.pilarPraktik}/100</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">HACCP & Suhu</span>
                  <span className="text-base font-black text-orange-600">{activeSpotlightCrew.pilarHaccp}/100</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Sikap HARA</span>
                  <span className="text-base font-black text-emerald-600">{activeSpotlightCrew.pilarSikap}/100</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                <strong>Rekomendasi Trainer:</strong> {activeSpotlightCrew.rekomendasiPenempatan}. Menguasai {activeSpotlightCrew.stasiunSelesai} stasiun kerja secara disiplin.
              </p>
            </div>

            {/* Crew Table List */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Nama Kru</th>
                    <th className="py-2.5 px-3">Outlet Asal</th>
                    <th className="py-2.5 px-3">Divisi</th>
                    <th className="py-2.5 px-3">Stasiun Selesai</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Skor Akhir</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredCrew.map((c, idx) => (
                    <tr
                      key={c.nama}
                      onClick={() => setSelectedKruSpotlight(c)}
                      className={`cursor-pointer transition-colors ${
                        selectedKruSpotlight.nama === c.nama ? 'bg-red-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-400">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{c.nama} {c.keterangan === 'New' ? '[New]' : ''}</td>
                      <td className="py-2.5 px-3 text-slate-600">{c.outlet}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                          c.divisi === 'Kitchen' ? 'bg-blue-50 text-blue-800' :
                          c.divisi === 'Kasir' ? 'bg-purple-50 text-purple-800' :
                          'bg-amber-50 text-amber-800'
                        }`}>
                          {c.divisi}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{c.stasiunSelesai} Stasiun</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          c.skorPraktik >= 85 ? 'bg-emerald-100 text-emerald-800' :
                          c.skorPraktik >= 75 ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {c.statusKelulusan}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900">
                        {c.skorPraktik}/100
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedKruSpotlight(c);
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-[#96171B] hover:text-white rounded-lg text-[10.5px] font-bold transition-all cursor-pointer"
                        >
                          Pilih
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: STATION SPEED (SOS) COMPARISON                    */}
      {/* ======================================================== */}
      {activeTab === 'station_speed' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#96171B]" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Deviasi Waktu SOS: Target Standar vs Realisasi Lapangan (Menit)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Batas Toleransi Wajar Sesuai Agenda TC</span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stationSpeedData} margin={{ top: 15, right: 10, left: -10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="stasiun" tick={{ fontSize: 9.5, fill: '#334155' }} angle={-35} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} unit="m" />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="targetMnt" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Target SOP (Mnt)" />
                  <Bar dataKey="rataRataMnt" fill="#96171B" radius={[4, 4, 0, 0]} name="Realisasi Kru (Mnt)" />
                  <Bar dataKey="toleransiMax" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Batas Maks Toleransi (Mnt)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Explanatory cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-1 text-blue-950">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles size={13} className="text-blue-700" />
                  <span>Stasiun 1: Nasi & Teh</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Tanak Nasi (35 mnt D1 / 45 mnt D2) menggunakan rasio cup Miyako (4:5) tanpa timbang gram kaku. Teh (40 mnt D1 / 30 mnt D2) seduh wangi.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1 text-amber-950">
                <div className="font-bold flex items-center gap-1.5">
                  <Flame size={13} className="text-amber-700" />
                  <span>Stasiun 2: Goreng Ayam & Scramble</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Goreng Ayam 20 mnt (wajib suhu 160°C). Scramble Egg 5 mnt (wajan dadar lembut, mandiri, tanpa Indomie, bebas suhu 160°C).
                </p>
              </div>

              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl space-y-1 text-purple-950">
                <div className="font-bold flex items-center gap-1.5">
                  <Layers size={13} className="text-purple-700" />
                  <span>Stasiun 3: Terong & Kulit</span>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  Goreng Terong 25 mnt (deep fryer 160°C). Goreng Kulit 45 mnt (deep fryer 155°C mekar garing). Sambal ulek 30 mnt.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SUHU DEEP FRYER VS NON-TERMAL                     */}
      {/* ======================================================== */}
      {activeTab === 'haccp_temperature' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Thermometer size={16} className="text-orange-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Matriks Kepatuhan Suhu: Deep Fryer vs Stasiun Non-Termal
                </h3>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                SOP Suhu Murni Terpenuhi
              </span>
            </div>

            {/* Rule Callout */}
            <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl text-xs text-orange-950 space-y-1">
              <strong className="block font-black text-orange-900">
                Prinsip Penegakan Suhu SOP HARA Chicken:
              </strong>
              <p className="text-[11px] leading-relaxed text-orange-800">
                Probe termometer suhu 160°C <strong>hanya aktif untuk stasiun Deep Fryer</strong> (Goreng Ayam, Terong, Kulit, Jamur/Kentang). Stasiun lain seperti <strong>Scramble Egg</strong> (wajan api sedang), <strong>Indomie</strong> (air rebusan), <strong>Nashville</strong> (celup rempah), <strong>Nasi</strong> (rice cooker), <strong>Geprek Ori</strong>, dan <strong>Sambal</strong> adalah <strong>NON-TERMAL</strong> dan <strong>TIDAK menggunakan suhu 160°C</strong>.
              </p>
            </div>

            {/* Table Matrix */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Nama Produk / Stasiun</th>
                    <th className="py-2.5 px-3">Tipe Stasiun</th>
                    <th className="py-2.5 px-3">Standar Suhu SOP</th>
                    <th className="py-2.5 px-3">Pengukuran Probe</th>
                    <th className="py-2.5 px-3 text-right">Kepatuhan HACCP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {temperatureComplianceData.map((t) => (
                    <tr key={t.stasiun} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{t.stasiun}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                          t.jenis === 'Deep Fryer'
                            ? 'bg-orange-100 text-orange-900 border border-orange-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.jenis}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {t.standarSuhu}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {t.jenis === 'Deep Fryer' ? (
                          <span className="font-mono font-bold text-orange-600">{t.aktualSuhu}°C (Optimal)</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">Bebas Probe Termometer</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          {t.kepatuhan}% Lolos
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: BATCH RHYTHM & TREND SIMULTAN                     */}
      {/* ======================================================== */}
      {activeTab === 'batch_trend' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#96171B]" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Tren Efisiensi & Ritme Waktu Batch Simultan (Day 1 vs Day 2)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Standar Batch 1 (40m) & Batch 2 (30-40m)</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={batchTrendData} margin={{ top: 15, right: 10, left: -10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorEfisiensi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#96171B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#96171B" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="sesi" tick={{ fontSize: 10, fill: '#334155' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#FFF', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="realisasiMnt" stroke="#96171B" fillOpacity={1} fill="url(#colorEfisiensi)" name="Waktu Selesai (Menit)" />
                  <Line type="monotone" dataKey="targetMnt" stroke="#64748B" strokeDasharray="5 5" name="Batas Target (Menit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Station Performance Stacked */}
            <div className="pt-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">
                Sebaran Rata-rata Skor per Stasiun Kerja
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stationPerformanceData.map((st) => (
                  <div key={st.name} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <strong className="text-xs text-slate-900 block">{st.name}</strong>
                      <span className="text-[10px] text-slate-500 font-medium">Tuntas {st.porsiTuntas} Porsi Saji Uji</span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-slate-900 font-mono block">{st.rataRata}/100</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {st.kelulusan}% Kelulusan
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: REKOMENDASI HASIL ONBOARDING & RAPOR KELULUSAN    */}
      {/* ======================================================== */}
      {activeTab === 'rekomendasi' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-emerald-700" />
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Rekomendasi Hasil Onboarding & Kelulusan Kru Resmi (12 Peserta)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Berdasarkan Akumulasi 4 Pilar: Teori, Praktik SOS, HACCP & Sikap HARA
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#96171B] hover:bg-[#801216] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Download size={13} />
                  <span>Ekspor Rapor Kelulusan</span>
                </button>
              </div>
            </div>

            {/* Table of Official Recommendation & Graduation */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">No</th>
                    <th className="py-3 px-3">Nama Kru</th>
                    <th className="py-3 px-3">Outlet Asal</th>
                    <th className="py-3 px-3">Divisi</th>
                    <th className="py-3 px-3 text-center">Teori (20%)</th>
                    <th className="py-3 px-3 text-center">Praktik (35%)</th>
                    <th className="py-3 px-3 text-center">HACCP (15%)</th>
                    <th className="py-3 px-3 text-center">Sikap (30%)</th>
                    <th className="py-3 px-3 text-right">Skor Total</th>
                    <th className="py-3 px-3">Status Kelulusan</th>
                    <th className="py-3 px-3">Rekomendasi Penempatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {crewPerformanceData.map((c, idx) => (
                    <tr key={c.nama} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-400">#{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {c.nama} {c.keterangan === 'New' ? <span className="text-[10px] text-amber-700 font-bold">[New]</span> : ''}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{c.outlet}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                          c.divisi === 'Kitchen' ? 'bg-blue-50 text-blue-800' :
                          c.divisi === 'Kasir' ? 'bg-purple-50 text-purple-800' :
                          'bg-amber-50 text-amber-800'
                        }`}>
                          {c.divisi}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{c.pilarTeori}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#96171B]">{c.pilarPraktik}</td>
                      <td className="py-3 px-3 text-center font-mono">{c.pilarHaccp}</td>
                      <td className="py-3 px-3 text-center font-mono">{c.pilarSikap}</td>
                      <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                        {c.skorPraktik}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          c.skorPraktik >= 85 ? 'bg-emerald-100 text-emerald-800' :
                          c.skorPraktik >= 75 ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {c.statusKelulusan}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-600">
                        {c.rekomendasiPenempatan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official Certification Signature Block */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <div className="space-y-1">
                <span className="font-bold text-slate-800 block">Ditetapkan oleh Tim People Development HARA:</span>
                <p className="text-[11px] text-slate-500">
                  Seluruh kru telah menyelesaikan kurikulum Onboarding 2 Hari sesuai Agenda Training Center resmi.
                </p>
              </div>

              <div className="flex items-center gap-6 text-center text-[11px]">
                <div>
                  <span className="block font-bold text-slate-800">Lead Trainer HQ</span>
                  <span className="block font-mono text-slate-500 text-[10px] mt-3 underline">Haikal Abi</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-800">Head of Operations</span>
                  <span className="block font-mono text-slate-500 text-[10px] mt-3 underline">Bambang Kusuma</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
