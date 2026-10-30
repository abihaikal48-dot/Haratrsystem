import React, { useState, useMemo } from 'react';
import { db } from '../../lib/storage';
import { CrewRadarData, Division, Outlet, Kru, PenilaianPraktikOnboardingProduk } from '../../types';
import { CrewRadarChart } from './CrewRadarChart';
import { PeakRushMatrix } from './PeakRushMatrix';
import { StationParetoAnalysis } from './StationParetoAnalysis';
import { exportPenilaianToCSV } from '../../lib/googleSheetSync';
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
  FileText,
  Filter,
  HelpCircle,
  Lightbulb,
  Printer,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  UtensilsCrossed,
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
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'onboarding_batch' | 'radar_kru'>('onboarding_batch');
  const [outletFilter, setOutletFilter] = useState<string>(selectedOutletCode);
  const [stationFilter, setStationFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCrewName, setSelectedCrewName] = useState<string>('Budi Santoso');
  const [showFullPrintDoc, setShowFullPrintDoc] = useState<boolean>(false);

  const outlets = db.getTable<Outlet>('outlets');
  const allKru = db.getTable<Kru>('kru');
  const competencySummaries = db.getCrewCompetencySummaries();
  const onboardingRecords = useMemo(() => db.getPenilaianPraktikProduk(), []);

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

  // Onboarding Batch & 2-Pillar Analytics
  const batchAnalytics = useMemo(() => {
    const list = onboardingRecords;
    const total = list.length;
    const avgKomposit = total > 0 ? (list.reduce((acc, c) => acc + c.skor_akhir, 0) / total).toFixed(1) : '0';
    const avgTeknis = total > 0 ? (list.reduce((acc, c) => acc + (c.subskor_teknis ?? c.skor_prosedur), 0) / total).toFixed(1) : '0';
    const avgSikap = total > 0 ? (list.reduce((acc, c) => acc + (c.subskor_sikap ?? c.skor_kebersihan), 0) / total).toFixed(1) : '0';
    const passCount = list.filter(c => c.skor_akhir >= 75 && !c.gagal_titik_kritis).length;
    const passPct = total > 0 ? Math.round((passCount / total) * 100) : 0;
    const gradeACount = list.filter(c => c.skor_akhir >= 85 && !c.gagal_titik_kritis).length;
    const remedialCount = list.filter(c => c.skor_akhir < 75 || c.gagal_titik_kritis).length;

    // Group by Batch
    const batchMap: Record<string, {
      namaBatch: string;
      total: number;
      sumKomposit: number;
      sumTeknis: number;
      sumSikap: number;
      pass: number;
      remedial: number;
    }> = {};

    list.forEach(item => {
      const bKey = item.nama_batch || 'Onboarding Reguler';
      if (!batchMap[bKey]) {
        batchMap[bKey] = {
          namaBatch: bKey,
          total: 0,
          sumKomposit: 0,
          sumTeknis: 0,
          sumSikap: 0,
          pass: 0,
          remedial: 0,
        };
      }
      batchMap[bKey].total++;
      batchMap[bKey].sumKomposit += item.skor_akhir;
      batchMap[bKey].sumTeknis += (item.subskor_teknis ?? item.skor_prosedur);
      batchMap[bKey].sumSikap += (item.subskor_sikap ?? item.skor_kebersihan);
      if (item.skor_akhir >= 75 && !item.gagal_titik_kritis) {
        batchMap[bKey].pass++;
      } else {
        batchMap[bKey].remedial++;
      }
    });

    const batchSummary = Object.values(batchMap).map(b => ({
      ...b,
      avgKomposit: (b.sumKomposit / b.total).toFixed(1),
      avgTeknis: (b.sumTeknis / b.total).toFixed(1),
      avgSikap: (b.sumSikap / b.total).toFixed(1),
      passPct: Math.round((b.pass / b.total) * 100),
    }));

    // Group by Product for speed analysis
    const prodMap: Record<string, { nama: string; target: number; actualTotal: number; count: number }> = {};
    list.forEach(item => {
      if (!prodMap[item.produk_nama]) {
        prodMap[item.produk_nama] = {
          nama: item.produk_nama,
          target: item.target_detik,
          actualTotal: 0,
          count: 0
        };
      }
      prodMap[item.produk_nama].actualTotal += item.waktu_detik;
      prodMap[item.produk_nama].count++;
    });

    const productSpeedStats = Object.values(prodMap).map(p => {
      const avgActual = Math.round(p.actualTotal / p.count);
      const delta = avgActual - p.target;
      return {
        nama: p.nama,
        target: p.target,
        avgActual,
        delta,
        status: delta <= 0 ? 'Tepat Waktu' : `+${delta}s Overtime`,
        count: p.count,
      };
    });

    // Critical violations
    const violationsMap: Record<string, number> = {};
    list.forEach(item => {
      if (Array.isArray(item.titik_kritis_gagal_detail)) {
        item.titik_kritis_gagal_detail.forEach(v => {
          violationsMap[v] = (violationsMap[v] || 0) + 1;
        });
      }
    });

    const criticalViolations = Object.entries(violationsMap).map(([title, count]) => ({
      title,
      count
    })).sort((a, b) => b.count - a.count);

    return {
      total,
      avgKomposit,
      avgTeknis,
      avgSikap,
      passPct,
      gradeACount,
      remedialCount,
      batchSummary,
      productSpeedStats,
      criticalViolations
    };
  }, [onboardingRecords]);

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
      {/* Top Segmented Navigation Tabs */}
      <div className="p-1.5 bg-[#FAF8F5] rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setAnalyticsSubTab('onboarding_batch')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              analyticsSubTab === 'onboarding_batch'
                ? 'bg-[#96171B] text-white border-[#96171B] shadow-2xs'
                : 'bg-white text-stone-900 border-stone-200 hover:border-neutral-400'
            }`}
          >
            <BarChart3 size={15} />
            <span>Analitik Onboarding Batch & 2 Pilar</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
              analyticsSubTab === 'onboarding_batch' ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-stone-600'
            }`}>
              Teknis vs Sikap
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAnalyticsSubTab('radar_kru')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              analyticsSubTab === 'radar_kru'
                ? 'bg-[#96171B] text-white border-[#96171B] shadow-2xs'
                : 'bg-white text-stone-900 border-stone-200 hover:border-neutral-400'
            }`}
          >
            <TrendingUp size={15} />
            <span>Radar Kru & Diagnostik Operasional</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
              analyticsSubTab === 'radar_kru' ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-stone-600'
            }`}>
              5-Sumbu & Rush
            </span>
          </button>
        </div>

        <div className="text-xs font-semibold text-stone-500 px-3 py-1 flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#96171B]" />
          <span>Analisis Komparatif Batch, KKM 75, & Efisiensi SOS</span>
        </div>
      </div>

      {/* SUB-VIEW 1: ONBOARDING BATCH & 2-PILAR ANALYTICS */}
      {analyticsSubTab === 'onboarding_batch' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-[#8B1418] border border-red-200 px-2 py-0.5 rounded font-mono">
                    ONBOARDING ANALYTICS DASHBOARD
                  </span>
                  <span className="text-xs text-stone-400 font-medium">HARA Chicken Network</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                  Analitik Evaluasi Batch & Performa 2 Pilar (Teknis vs Sikap)
                </h1>
                <p className="text-xs text-stone-500">
                  Komparasi antar-batch onboarding, integrasi pilar teknis SOP (50%) & sikap higiene (50%), deviasi kecepatan per produk, dan pelanggaran titik kritis.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportPenilaianToCSV(onboardingRecords)}
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download size={14} />
                  <span>Ekspor Data ke CSV</span>
                </button>
              </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">Total Sesi Ujian</span>
                <span className="text-2xl font-black text-stone-900 font-mono mt-0.5 block">{batchAnalytics.total}</span>
                <span className="text-[10px] text-stone-500">Evaluasi Praktik Produk</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">Rata-rata Komposit</span>
                <span className="text-2xl font-black text-[#96171B] font-mono mt-0.5 block">{batchAnalytics.avgKomposit}</span>
                <span className="text-[10px] text-amber-800">KKM Minimum: 75.0</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-900 uppercase block">Pilar 1: Teknis (50%)</span>
                <span className="text-2xl font-black text-blue-900 font-mono mt-0.5 block">{batchAnalytics.avgTeknis}</span>
                <span className="text-[10px] text-blue-700">SOP, Waktu, Knowledge</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-900 uppercase block">Pilar 2: Sikap (50%)</span>
                <span className="text-2xl font-black text-emerald-900 font-mono mt-0.5 block">{batchAnalytics.avgSikap}</span>
                <span className="text-[10px] text-emerald-700">5S, Tim, Aktif, Presisi</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-stone-600 uppercase block">Rasio Kelulusan</span>
                <span className="text-2xl font-black text-stone-900 font-mono mt-0.5 block">{batchAnalytics.passPct}%</span>
                <span className="text-[10px] text-stone-500">{batchAnalytics.gradeACount} Grade A • {batchAnalytics.remedialCount} Remedial</span>
              </div>
            </div>
          </div>

          {/* 2-Column: Batch Comparison (Left) & 2-Pillar Balance Gap (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* LEFT: Batch Comparison Table */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-[#96171B]" />
                  <h3 className="text-base font-bold text-stone-900">Performa Komparatif Antar Batch</h3>
                </div>
                <span className="text-xs font-mono text-stone-500">{batchAnalytics.batchSummary.length} Batch Aktif</span>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] font-bold text-stone-600 uppercase text-[10px] border-b border-stone-200">
                    <tr>
                      <th className="p-3">Nama Batch</th>
                      <th className="p-3 text-center">Peserta</th>
                      <th className="p-3 text-center">Teknis (50%)</th>
                      <th className="p-3 text-center">Sikap (50%)</th>
                      <th className="p-3 text-center bg-red-50/50 text-[#96171B]">Komposit</th>
                      <th className="p-3 text-center">Kelulusan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {batchAnalytics.batchSummary.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-400 italic">
                          Belum ada data evaluasi batch onboarding.
                        </td>
                      </tr>
                    ) : (
                      batchAnalytics.batchSummary.map((b, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="p-3 font-extrabold text-stone-900">{b.namaBatch}</td>
                          <td className="p-3 text-center font-mono font-bold text-stone-600">{b.total} sesi</td>
                          <td className="p-3 text-center font-mono font-bold text-blue-900">{b.avgTeknis}</td>
                          <td className="p-3 text-center font-mono font-bold text-emerald-800">{b.avgSikap}</td>
                          <td className="p-3 text-center font-mono font-black text-sm text-[#96171B] bg-red-50/30">
                            {b.avgKomposit}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.passPct >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {b.passPct}% Lulus ({b.pass}/{b.total})
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT: 2-Pillar Balance Gap Card */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <Sparkles size={18} className="text-amber-600" />
                <h3 className="text-base font-bold text-stone-900">Analisis Keseimbangan 2 Pilar</h3>
              </div>

              <div className="space-y-4 text-xs">
                <p className="text-stone-600 leading-relaxed">
                  Standar HARA mensyaratkan keseimbangan 50-50 antara <strong>Keterampilan Teknis SOP</strong> dan <strong>Karakter & Higiene</strong>:
                </p>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-blue-950">Pilar 1: Keterampilan Teknis (50%)</span>
                    <span className="text-sm font-black font-mono text-blue-900">{batchAnalytics.avgTeknis} / 100</span>
                  </div>
                  <div className="text-[11px] text-blue-900 leading-relaxed">
                    Mencakup Kepatuhan Prosedur SOP (40%), Kecepatan Akumulasi Waktu SOS (30%), dan Knowledge SOP Lisan (30%).
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-emerald-950">Pilar 2: Sikap & Kebersihan (50%)</span>
                    <span className="text-sm font-black font-mono text-emerald-900">{batchAnalytics.avgSikap} / 100</span>
                  </div>
                  <div className="text-[11px] text-emerald-900 leading-relaxed">
                    Mencakup Kebersihan 5S & Grooming (30%), Kerja Sama Tim (25%), Keaktifan & Inisiatif (25%), dan Presisi Teknis Gramasi/Suhu (20%).
                  </div>
                </div>

                {/* Gap Indicator */}
                {(() => {
                  const tek = Number(batchAnalytics.avgTeknis);
                  const sik = Number(batchAnalytics.avgSikap);
                  const diff = Math.abs(tek - sik);
                  const dominant = tek > sik ? 'Keterampilan Teknis SOP' : 'Sikap & Higienitas';

                  return (
                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-stone-500 uppercase block">Gap Antarpilar:</span>
                        <span className="text-xs font-extrabold text-stone-900">
                          {diff.toFixed(1)} Poin ({dominant} lebih unggul)
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        diff <= 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {diff <= 5 ? 'Sangat Seimbang' : 'Perlu Penyelarasan'}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* 2-Column: Product Speed SOS Deviations & Critical Points Pareto */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Speed SOS per Product */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#96171B]" />
                  <h3 className="text-base font-bold text-stone-900">Efisiensi Kecepatan SOP per Menu Produk</h3>
                </div>
                <span className="text-xs text-stone-500 font-mono">Persiapan s/d Jadi</span>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] font-bold text-stone-600 uppercase text-[10px] border-b border-stone-200">
                    <tr>
                      <th className="p-3">Menu / Produk SOP</th>
                      <th className="p-3 text-center">Target Standar</th>
                      <th className="p-3 text-center">Waktu Aktual Rata-rata</th>
                      <th className="p-3 text-center">Deviasi (Delta)</th>
                      <th className="p-3 text-center">Status Efisiensi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {batchAnalytics.productSpeedStats.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-400 italic">
                          Belum ada data pengerjaan waktu menu produk.
                        </td>
                      </tr>
                    ) : (
                      batchAnalytics.productSpeedStats.map((p, idx) => (
                        <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="p-3 font-extrabold text-stone-900">{p.nama}</td>
                          <td className="p-3 text-center font-mono font-bold text-stone-600">{p.target}s ({Math.round(p.target / 60)}m)</td>
                          <td className="p-3 text-center font-mono font-bold text-stone-900">{p.avgActual}s ({Math.round(p.avgActual / 60)}m)</td>
                          <td className="p-3 text-center font-mono font-bold">
                            <span className={p.delta <= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                              {p.delta <= 0 ? `${p.delta}s` : `+${p.delta}s`}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.delta <= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pareto Pelanggaran Titik Kritis */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                <ShieldAlert size={18} className="text-rose-600" />
                <h3 className="text-base font-bold text-stone-900">Distribusi Pelanggaran Titik Kritis</h3>
              </div>

              <div className="space-y-3 text-xs">
                {batchAnalytics.criticalViolations.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center text-emerald-900">
                    <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-600" />
                    <span className="font-extrabold block">Zero Critical Failure!</span>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      Seluruh pengujian praktik mematuhi batas toleransi suhu fryer, timbangan gramasi, dan alur SOP kritis.
                    </p>
                  </div>
                ) : (
                  batchAnalytics.criticalViolations.map((v, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-rose-950 block">{v.title}</span>
                        <span className="text-[10px] text-rose-800">Pelanggaran SOP level Kritis</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-rose-200 text-rose-900 font-mono font-black text-xs">
                        {v.count}x Kejadian
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: RADAR KRU & DIAGNOSTIK OPERASIONAL */}
      {analyticsSubTab === 'radar_kru' && (
        <div className="space-y-6">
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
                  Evaluasi objektif 5-axis, skor komposit terbobot 4-faktor, dan prediksi deviasi pada jam kritis outlet.
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
      )}
    </div>
  );
};
