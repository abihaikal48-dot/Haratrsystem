import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Download, Filter, Calendar, Award,
  CheckCircle, ArrowRight, UserCheck, Shield, BookOpen,
  Edit3, Save, Printer, Share2, Sparkles, RefreshCw,
  Plus, Trash2, Check, Copy, ChevronRight, AlertTriangle,
  Flame, Target, Star, TrendingUp, Eye, Store, User,
  CornerDownRight, ShieldCheck, HeartHandshake, FileCheck,
  BarChart2, Layers
} from 'lucide-react';
import { db } from '../lib/storage';
import {
  Outlet, Kru, TNA, CoachingLog, PenilaianTeori,
  PenilaianPraktik, PenilaianLisan, CrewCompetencySummary,
  SystemSettings, ObservasiLapangan, Division, CompetencyBadge,
  KartuKeluhan, TraineeRecord, RencanaTraining
} from '../types';
import { ModernOptionSelector } from './ModernOptionSelector';
import { MasterCrewIntegratedDossier } from './reports/MasterCrewIntegratedDossier';
import { MasterOutletExecutiveReport } from './reports/MasterOutletExecutiveReport';
import { TrainingRoadmapTimeline } from './reports/TrainingRoadmapTimeline';
import { PageHeaderBanner } from './PageHeaderBanner';
import { GoogleWorkspaceModal } from './GoogleWorkspaceModal';
import { FileSpreadsheet } from 'lucide-react';

interface LaporanViewProps {
  selectedOutletCode: string;
}

export const LaporanView: React.FC<LaporanViewProps> = ({ selectedOutletCode }) => {
  // Navigation sub-tabs
  const [activeTab, setActiveTab] = useState<'crew' | 'period' | 'roadmap' | 'matrix'>('crew');
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Master Data
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [competencyList, setCompetencyList] = useState<CrewCompetencySummary[]>([]);
  const [tnaList, setTnaList] = useState<TNA[]>([]);
  const [coachingList, setCoachingList] = useState<CoachingLog[]>([]);
  const [teoriList, setTeoriList] = useState<PenilaianTeori[]>([]);
  const [praktikList, setPraktikList] = useState<PenilaianPraktik[]>([]);
  const [lisanList, setLisanList] = useState<PenilaianLisan[]>([]);
  const [observasiList, setObservasiList] = useState<ObservasiLapangan[]>([]);
  const [keluhanList, setKeluhanList] = useState<KartuKeluhan[]>([]);
  const [traineeRecords, setTraineeRecords] = useState<TraineeRecord[]>([]);
  const [trainingPlans, setTrainingPlans] = useState<RencanaTraining[]>([]);

  const [settings, setSettings] = useState<SystemSettings>({
    email_penerima: 'management@harachicken.com',
    notif_prioritas_tinggi: 'Aktif',
    ambang_pola_berulang: 3,
    hari_pola_berulang: 7,
    nama_perusahaan: 'HARA TRAINING & OPERATIONS',
    lead_trainer: 'Haikal Abi (Trainer Operasional)',
  });

  // Selected Crew State
  const [selectedCrewName, setSelectedCrewName] = useState<string>('');
  const [filterOutlet, setFilterOutlet] = useState(selectedOutletCode || 'ALL');
  const [filterDivision, setFilterDivision] = useState<Division | 'ALL'>('ALL');
  const [matrixSearch, setMatrixSearch] = useState('');
  const [matrixBadgeFilter, setMatrixBadgeFilter] = useState<CompetencyBadge | 'ALL'>('ALL');

  const loadData = () => {
    setOutlets(db.getTable<Outlet>('outlets'));
    setKruList(db.getTable<Kru>('kru'));
    setCompetencyList(db.getCrewCompetencySummaries());
    setTnaList(db.getTable<TNA>('tna'));
    setCoachingList(db.getTable<CoachingLog>('coaching_log'));
    setTeoriList(db.getTable<PenilaianTeori>('penilaian_teori'));
    setPraktikList(db.getTable<PenilaianPraktik>('penilaian_praktik'));
    setLisanList(db.getTable<PenilaianLisan>('penilaian_lisan'));
    setObservasiList(db.getTable<ObservasiLapangan>('observasi_lapangan'));
    setKeluhanList(db.getTable<KartuKeluhan>('keluhan'));
    setTraineeRecords(db.getTable<TraineeRecord>('trainees'));
    setTrainingPlans(db.getTable<RencanaTraining>('rencana_training'));

    const sys = db.getTable<SystemSettings>('settings')[0];
    if (sys) setSettings(sys);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (selectedOutletCode) {
      setFilterOutlet(selectedOutletCode);
    }
  }, [selectedOutletCode]);

  useEffect(() => {
    if (kruList.length > 0 && !selectedCrewName) {
      setSelectedCrewName(kruList[0].nama_kru);
    }
  }, [kruList, selectedCrewName]);

  // Current Crew Details
  const currentCrew = useMemo(() => {
    return kruList.find((k) => k.nama_kru === selectedCrewName) || kruList[0];
  }, [kruList, selectedCrewName]);

  const currentCrewSummary = useMemo(() => {
    if (!currentCrew) return null;
    return competencyList.find((c) => c.namaKru === currentCrew.nama_kru) || {
      namaKru: currentCrew.nama_kru,
      divisi: currentCrew.divisi,
      kode_outlet: currentCrew.kode_outlet,
      skorTeori: 80,
      skorPraktik: 85,
      skorLisan: 78,
      skorAkhir: 82,
      badge: 'Terampil' as CompetencyBadge,
      riwayatTeoriCount: 1,
      riwayatPraktikCount: 1,
      riwayatLisanCount: 1,
      riwayatCoachingCount: 1,
    };
  }, [competencyList, currentCrew]);

  const currentCrewOutlet = useMemo(() => {
    if (!currentCrew) return undefined;
    return outlets.find((o) => o.kode_outlet === currentCrew.kode_outlet);
  }, [outlets, currentCrew]);

  // Filtered Crew Dropdown List
  const filteredCrewOptions = useMemo(() => {
    return kruList.filter((k) => {
      const matchOutlet = filterOutlet === 'ALL' || k.kode_outlet === filterOutlet;
      const matchDiv = filterDivision === 'ALL' || k.divisi === filterDivision;
      return matchOutlet && matchDiv;
    });
  }, [kruList, filterOutlet, filterDivision]);

  // CSV Export for Matrix Tab
  const exportMatrixCSV = () => {
    const headers = ['Nama Kru', 'Divisi', 'Outlet', 'Skor Teori (25%)', 'Skor Praktik (35%)', 'Skor Lisan (25%)', 'Skor Akhir', 'Status Kualifikasi'];
    const rows = competencyList.map((c) => [
      `"${c.namaKru}"`,
      `"${c.divisi}"`,
      `"${c.kode_outlet}"`,
      c.skorTeori ?? '-',
      c.skorPraktik ?? '-',
      c.skorLisan ?? '-',
      c.skorAkhir ?? '-',
      `"${c.badge}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Matriks_Kompetensi_HARA_PD_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. UNIFIED MINIMALIST PAGE HEADER & SUB-TABS */}
      <PageHeaderBanner
        category="LAPORAN & DOSSIER"
        title="Pusat Laporan & Rekomendasi Terpadu"
        description="Satu ekosistem terpadu menyatukan seluruh riwayat temuan TNA, pembinaan GROW, 3 pilar asesmen standar baku, observasi lapangan, serta rekomendasi aksi preskriptif."
        icon={<FileCheck size={22} />}
        rightElement={
          <button
            type="button"
            onClick={() => setGoogleModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Sinkronisasi ke Google Sheets dan Google Drive"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <span>Google Sheets & Drive</span>
          </button>
        }
        tabs={[
          {
            id: 'crew',
            label: 'Rapor Master Kru',
            icon: User,
          },
          {
            id: 'period',
            label: 'Laporan Eksekutif Cabang',
            icon: FileText,
          },
          {
            id: 'roadmap',
            label: 'Roadmap & Timeline',
            icon: Calendar,
          },
          {
            id: 'matrix',
            label: 'Matriks Data',
            icon: Layers,
            count: competencyList.length,
          },
        ]}
        activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id as any)}
      />

      {/* Google Workspace Modal */}
      <GoogleWorkspaceModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onShowToast={showToast}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: INTEGRATED MASTER CREW DOSSIER */}
      {/* ========================================================================= */}
      {activeTab === 'crew' && (
        <div className="space-y-6">
          {/* Crew Selector Toolbar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UserCheck size={16} className="text-[#96171B]" />
                <span>Pilih Kru Evaluasi:</span>
              </span>

              <div className="min-w-[220px]">
                <ModernOptionSelector
                  value={selectedCrewName}
                  onChange={(val) => setSelectedCrewName(val)}
                  options={filteredCrewOptions.map((k) => ({
                    value: k.nama_kru,
                    label: k.nama_kru,
                    badge: k.divisi,
                    sublabel: `Outlet ${k.kode_outlet}`,
                  }))}
                  inlineChips={false}
                  placeholder="-- Pilih Kru --"
                  size="xs"
                  searchable
                  clearable={false}
                />
              </div>

              {/* Outlet Filter */}
              <div className="min-w-[150px]">
                <ModernOptionSelector
                  value={filterOutlet}
                  onChange={(val) => setFilterOutlet(val || 'ALL')}
                  options={[
                    { value: 'ALL', label: 'Semua Outlet' },
                    ...outlets.map((o) => ({
                      value: o.kode_outlet,
                      label: `${o.kode_outlet} - ${o.nama_outlet}`,
                      badge: o.kode_outlet,
                    })),
                  ]}
                  inlineChips={false}
                  size="xs"
                  clearable={false}
                />
              </div>

              {/* Division Filter */}
              <div className="min-w-[130px]">
                <ModernOptionSelector
                  value={filterDivision}
                  onChange={(val) => setFilterDivision((val || 'ALL') as any)}
                  options={[
                    { value: 'ALL', label: 'Semua Divisi' },
                    { value: 'Kitchen', label: 'Kitchen' },
                    { value: 'Helper', label: 'Helper' },
                    { value: 'Geprek', label: 'Geprek' },
                    { value: 'Kasir', label: 'Kasir' },
                  ]}
                  inlineChips={false}
                  size="xs"
                  clearable={false}
                />
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Menampilkan {filteredCrewOptions.length} Kru yang siap diinspeksi
            </div>
          </div>

          {/* Render Master Dossier Component */}
          {currentCrew && currentCrewSummary && (
            <MasterCrewIntegratedDossier
              crew={currentCrew}
              crewSummary={currentCrewSummary}
              allTNA={tnaList}
              allCoaching={coachingList}
              allTeori={teoriList}
              allPraktik={praktikList}
              allLisan={lisanList}
              allObservasi={observasiList}
              allKeluhan={keluhanList}
              allTraineeRecords={traineeRecords}
              settings={settings}
              outlet={currentCrewOutlet}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MASTER OUTLET STRATEGIC EXECUTIVE REPORT */}
      {/* ========================================================================= */}
      {activeTab === 'period' && (
        <MasterOutletExecutiveReport
          selectedOutletCode={selectedOutletCode}
          outlets={outlets}
          kruList={kruList}
          competencyList={competencyList}
          tnaList={tnaList}
          coachingList={coachingList}
          observasiList={observasiList}
          trainingPlans={trainingPlans}
          settings={settings}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STRATEGIC ROADMAP & TIMELINE */}
      {/* ========================================================================= */}
      {activeTab === 'roadmap' && (
        <TrainingRoadmapTimeline
          trainingPlans={trainingPlans}
          coachingLogs={coachingList}
          tnaList={tnaList}
          observasiList={observasiList}
          selectedOutletCode={filterOutlet}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPREHENSIVE DATA MATRIX & EXPORT */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={matrixSearch}
                onChange={(e) => setMatrixSearch(e.target.value)}
                placeholder="Cari nama kru atau kode outlet..."
                className="text-xs p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#96171B] w-64 text-slate-900"
              />

              <div className="min-w-[160px]">
                <ModernOptionSelector
                  value={matrixBadgeFilter}
                  onChange={(val) => setMatrixBadgeFilter((val || 'ALL') as any)}
                  options={[
                    { value: 'ALL', label: 'Semua Kualifikasi' },
                    { value: 'Mahir', label: 'Mahir Saja' },
                    { value: 'Terampil', label: 'Terampil Saja' },
                    { value: 'Pemula', label: 'Pemula Saja' },
                  ]}
                  inlineChips={false}
                  size="xs"
                  clearable={false}
                />
              </div>

              <div className="min-w-[140px]">
                <ModernOptionSelector
                  value={filterDivision}
                  onChange={(val) => setFilterDivision((val || 'ALL') as any)}
                  options={[
                    { value: 'ALL', label: 'Semua Divisi' },
                    { value: 'Kitchen', label: 'Kitchen' },
                    { value: 'Helper', label: 'Helper' },
                    { value: 'Geprek', label: 'Geprek' },
                    { value: 'Kasir', label: 'Kasir' },
                  ]}
                  inlineChips={false}
                  size="xs"
                  clearable={false}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={exportMatrixCSV}
              className="btn-secondary-enterprise !py-1.5 !px-3 text-xs flex items-center gap-1.5 hover:border-emerald-500 cursor-pointer text-emerald-800 font-bold bg-emerald-50/50"
            >
              <Download size={14} className="text-emerald-700" />
              <span>Ekspor Format Excel / CSV</span>
            </button>
          </div>

          {/* Matrix Grid */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#96171B] text-white font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Nama Kru</th>
                    <th className="p-3">Divisi</th>
                    <th className="p-3">Outlet</th>
                    <th className="p-3 text-center">Teori (25%)</th>
                    <th className="p-3 text-center">Praktik (35%)</th>
                    <th className="p-3 text-center">Lisan (25%)</th>
                    <th className="p-3 text-center">Skor Komposit</th>
                    <th className="p-3 text-center">Lencana</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {competencyList
                    .filter((c) => {
                      const q = matrixSearch.toLowerCase().trim();
                      const matchSearch =
                        !q ||
                        (c.namaKru || '').toLowerCase().includes(q) ||
                        (c.kode_outlet || '').toLowerCase().includes(q);
                      const matchBadge = matrixBadgeFilter === 'ALL' || c.badge === matrixBadgeFilter;
                      const matchDiv = filterDivision === 'ALL' || c.divisi === filterDivision;
                      return matchSearch && matchBadge && matchDiv;
                    })
                    .map((c, idx) => (
                      <tr key={`matrix-${c.kode_outlet}-${c.namaKru}-${idx}`} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-black text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{c.namaKru}</span>
                            {c.badge === 'Mahir' && <Award size={13} className="text-amber-500" />}
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-slate-700">{c.divisi}</td>
                        <td className="p-3 font-bold text-slate-600">{c.kode_outlet}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">{c.skorTeori ?? '-'}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">{c.skorPraktik ?? '-'}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">{c.skorLisan ?? '-'}</td>
                        <td className="p-3 text-center font-black text-[#96171B] text-sm">{c.skorAkhir ?? '-'}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded ${
                              c.badge === 'Mahir'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.badge === 'Terampil'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.badge}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCrewName(c.namaKru);
                              setActiveTab('crew');
                            }}
                            className="btn-secondary-enterprise !py-1 !px-2.5 text-[11px] font-bold text-[#96171B] hover:bg-red-50 cursor-pointer"
                          >
                            Buka Rapor Terpadu →
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
    </div>
  );
};
