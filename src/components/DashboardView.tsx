import React, { useState, useMemo } from 'react';
import {
  Users, Award, AlertCircle, TrendingUp, CheckCircle2, ArrowRight,
  Share2, Plus, Clock, ExternalLink, Copy, Check, Filter, Calendar,
  Building2, ChevronRight, X, Sparkles, Flame, Eye, RefreshCw,
  Search, ShieldCheck, HelpCircle, Utensils, MessageSquare, AlertTriangle,
  GraduationCap, Briefcase, UserCheck, FileCheck, BarChart3, Target,
  UtensilsCrossed, BookOpen, Zap, CalendarCheck, Activity, Building
} from 'lucide-react';
import { db } from '../lib/storage';
import {
  Outlet, Kru, KartuKeluhan, LogAktivitas,
  HasilUjianKruMingguan, OJTCrewMonitoringRecord, Division
} from '../types';
import { NavTab } from './Sidebar';
import { ModernDashboardCharts } from './analytics/ModernDashboardCharts';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  selectedOutletCode: string;
  onOpenAICoach: () => void;
  onSelectOutletCode?: (code: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  selectedOutletCode,
  onOpenAICoach,
  onSelectOutletCode,
}) => {
  // Current logged in user
  const currentUser = useMemo(() => db.getCurrentUser(), []);

  // Database tables
  const [outlets] = useState<Outlet[]>(() => db.getTable<Outlet>('outlets'));
  const [kruList, setKruList] = useState<Kru[]>(() => db.getTable<Kru>('kru'));
  const [examResults, setExamResults] = useState<HasilUjianKruMingguan[]>(() =>
    db.getTable<HasilUjianKruMingguan>('hasil_ujian_mingguan')
  );
  const [ojtList, setOjtList] = useState<OJTCrewMonitoringRecord[]>(() =>
    db.getTable<OJTCrewMonitoringRecord>('ojt_monitoring')
  );
  const [complaints, setComplaints] = useState<KartuKeluhan[]>(() =>
    db.getTable<KartuKeluhan>('kartu_keluhan')
  );
  const [logs] = useState<LogAktivitas[]>(() => db.getLogs());

  // Interactive UI Filters
  const [timeframe, setTimeframe] = useState<'Hari Ini' | 'Minggu Ini' | 'Bulan Ini'>('Minggu Ini');
  const [activeTab, setActiveTab] = useState<'ujian' | 'ojt' | 'keluhan'>('ujian');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'ALL' | 'GRADE_A' | 'GRADE_B' | 'GRADE_C' | 'REMEDIAL'>('ALL');

  // Modals state
  const [showShareExamModal, setShowShareExamModal] = useState(false);
  const [shareOutletCode, setShareOutletCode] = useState(selectedOutletCode === 'ALL' ? 'HC-JTS01' : selectedOutletCode);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWaText, setCopiedWaText] = useState(false);

  const [showQuickAuditModal, setShowQuickAuditModal] = useState(false);
  const [auditTemp, setAuditTemp] = useState('160');
  const [auditCleanliness, setAuditCleanliness] = useState('Sesuai');
  const [auditNotes, setAuditNotes] = useState('');
  const [auditSavedMsg, setAuditSavedMsg] = useState(false);

  const [selectedExamDetail, setSelectedExamDetail] = useState<HasilUjianKruMingguan | null>(null);

  // Filtered Kru by selected outlet
  const filteredKru = useMemo(() => {
    if (selectedOutletCode === 'ALL') return kruList;
    return kruList.filter((k) => k.kode_outlet === selectedOutletCode);
  }, [kruList, selectedOutletCode]);

  // Filtered Exam Results
  const filteredExams = useMemo(() => {
    let list = examResults;
    if (selectedOutletCode !== 'ALL') {
      list = list.filter((e) => e.kode_outlet === selectedOutletCode);
    }
    if (gradeFilter === 'GRADE_A') {
      list = list.filter((e) => (e.skor_akhir_komposit || 0) >= 85);
    } else if (gradeFilter === 'GRADE_B') {
      list = list.filter((e) => (e.skor_akhir_komposit || 0) >= 75 && (e.skor_akhir_komposit || 0) < 85);
    } else if (gradeFilter === 'GRADE_C') {
      list = list.filter((e) => (e.skor_akhir_komposit || 0) >= 60 && (e.skor_akhir_komposit || 0) < 75);
    } else if (gradeFilter === 'REMEDIAL') {
      list = list.filter((e) => (e.skor_akhir_komposit || 0) < 60);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.nama_kru.toLowerCase().includes(q) ||
          e.divisi.toLowerCase().includes(q) ||
          (e.nama_outlet && e.nama_outlet.toLowerCase().includes(q))
      );
    }
    return list;
  }, [examResults, selectedOutletCode, gradeFilter, searchQuery]);

  // Filtered OJT Monitoring
  const filteredOjt = useMemo(() => {
    if (selectedOutletCode === 'ALL') return ojtList;
    return ojtList.filter((o) => o.kode_outlet === selectedOutletCode);
  }, [ojtList, selectedOutletCode]);

  // Filtered Complaints
  const filteredComplaints = useMemo(() => {
    if (selectedOutletCode === 'ALL') return complaints;
    return complaints.filter((c) => c.kode_outlet === selectedOutletCode);
  }, [complaints, selectedOutletCode]);

  // Key KPI Calculations
  const totalKruCount = filteredKru.length;
  const activeKruCount = filteredKru.filter((k) => k.status_aktif === 'Aktif').length;
  const ojtKruCount = filteredOjt.length;

  const avgExamScore = useMemo(() => {
    if (filteredExams.length === 0) return 85;
    const total = filteredExams.reduce((acc, curr) => acc + (curr.skor_akhir_komposit || 0), 0);
    return Math.round(total / filteredExams.length);
  }, [filteredExams]);

  const examPassRate = useMemo(() => {
    if (filteredExams.length === 0) return 92;
    const passed = filteredExams.filter((e) => e.status_kelulusan === 'Lulus Kompeten').length;
    return Math.round((passed / filteredExams.length) * 100);
  }, [filteredExams]);

  const pendingComplaintsCount = useMemo(() => {
    return filteredComplaints.filter((c) => c.status === 'Baru' || c.status === 'Proses').length;
  }, [filteredComplaints]);

  // Generate public exam URL
  const publicExamUrl = useMemo(() => {
    const origin = window.location.origin;
    return `${origin}/#ujian`;
  }, []);

  // Copy exam link
  const handleCopyExamLink = () => {
    navigator.clipboard.writeText(publicExamUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Copy formatted WhatsApp message
  const handleCopyWaMessage = () => {
    const targetOutlet = outlets.find((o) => o.kode_outlet === shareOutletCode);
    const outletName = targetOutlet ? targetOutlet.nama_outlet : shareOutletCode;
    const msg = `*PEMBERITAHUAN EVALUASI STANDAR KRU HARA CHICKEN*
Cabang: ${outletName}

Halo Tim Kru,
Silakan akses dan kerjakan lembar evaluasi mingguan melalui tautan resmi berikut:
🔗 ${publicExamUrl}

*Petunjuk:*
1. Masukkan Nama Lengkap Anda & pilih divisi kerja.
2. Kerjakan soal dengan teliti dan jujur.
3. Setelah selesai, salin nomor registrasi bukti pengerjaan ke grup ini.

_Standar Mutu & Operasional HARA Chicken._`;

    navigator.clipboard.writeText(msg).then(() => {
      setCopiedWaText(true);
      setTimeout(() => setCopiedWaText(false), 2500);
    });
  };

  // Quick Audit Submit
  const handleSaveQuickAudit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetOutlet = outlets.find((o) => o.kode_outlet === (selectedOutletCode === 'ALL' ? 'HC-JTS01' : selectedOutletCode));
    const outletCode = targetOutlet?.kode_outlet || 'HC-JTS01';

    db.insertRow('observasi_lapangan', {
      tanggal_shift: `${new Date().toLocaleDateString('id-ID')} - Shift Operasional`,
      kode_outlet: outletCode,
      nama_kru: 'Kru Dapur / Kitchen Team',
      divisi: 'Kitchen',
      standar_sop_diamati: `Pengecekan suhu minyak ${auditTemp}°C dan sanitasi stasiun kerja (${auditCleanliness}).`,
      hasil: auditCleanliness === 'Sesuai' ? 'Sesuai Standar' : 'Perlu Bimbingan',
      catatan_detail: auditNotes || `Suhu minyak terukur ${auditTemp}°C. Standar higienitas: ${auditCleanliness}.`,
      rencana_follow_up: 'Jaga konsistensi temperatur pada jam sibuk.',
    });

    setAuditSavedMsg(true);
    setTimeout(() => {
      setAuditSavedMsg(false);
      setShowQuickAuditModal(false);
      setAuditNotes('');
    }, 1200);
  };

  // Toggle resolve complaint
  const handleResolveComplaint = (complaintId: string) => {
    db.updateRow('kartu_keluhan', complaintId, {
      status: 'Selesai',
      tanggal_selesai: new Date().toISOString(),
    });
    setComplaints(db.getTable<KartuKeluhan>('kartu_keluhan'));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      
      {/* =====================================================================
          1. HEADER DASHBOARD: UCAPAN & KONTROL CEPAT (REFERENCE 3 STYLE)
          ===================================================================== */}
      <div className="card-enterprise rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#96171B] uppercase tracking-widest bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200/60">
              Pusat Kendali Operasional Outlet
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-[#0F172A] tracking-tight leading-snug">
            Selamat Datang, {currentUser?.nama || 'Haikal Abi'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau kepatuhan standar SOP, sertifikasi kru, dan performa outlet secara langsung
          </p>
        </div>

        {/* Tombol Aksi Cepat (Pill Buttons) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowShareExamModal(true)}
            className="px-4 py-2.5 rounded-full bg-[#96171B] hover:bg-[#7A1215] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-red-950/15"
          >
            <Share2 size={14} />
            <span>Bagikan Link Ujian Kru</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQuickAuditModal(true)}
            className="px-4 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Activity size={14} className="text-[#96171B]" />
            <span>Monitor Pelatihan Real-time</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          2. KARTU 4 KPI UTAMA (AT-A-GLANCE METRICS, ROUNDED-3XL)
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Kru Aktif & Terdaftar */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('monitoring-training')}
          className="card-enterprise rounded-3xl p-5 sm:p-6 hover:border-[#96171B]/30 hover:shadow-md transition-all cursor-pointer group text-left border border-slate-200/80 shadow-xs"
          title="Klik untuk membuka Monitoring Training OJT"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
              Kru Aktif Outlet
            </span>
            <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200 group-hover:bg-red-50 group-hover:text-[#96171B] group-hover:border-red-200 transition-colors">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-['Outfit'] text-[#0F172A] tabular-nums">{activeKruCount}</span>
            <span className="text-xs text-slate-400 font-medium">/ {totalKruCount} personil</span>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{ojtKruCount} dalam OJT</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              98% Siap Kerja
            </span>
          </div>
        </div>

        {/* KPI 2: Rata-Rata Ujian Mingguan */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('evaluasi-kompetensi')}
          className="card-enterprise rounded-3xl p-5 sm:p-6 hover:border-[#96171B]/30 hover:shadow-md transition-all cursor-pointer group text-left border border-slate-200/80 shadow-xs"
          title="Klik untuk membuka Pusat Evaluasi Kru (4 Pilar)"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
              Rata-Rata Ujian Kru
            </span>
            <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200 group-hover:bg-red-50 group-hover:text-[#96171B] group-hover:border-red-200 transition-colors">
              <Award size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-['Outfit'] text-[#0F172A] tabular-nums">{avgExamScore}</span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{filteredExams.length} ujian masuk</span>
            <span className="font-bold text-[#96171B] bg-red-50 px-2 py-0.5 rounded-full border border-red-200/60">
              {examPassRate}% Lulus
            </span>
          </div>
        </div>

        {/* KPI 3: Kepatuhan Suhu 160°C & SOP Mutu */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('stasiun-kerja')}
          className="card-enterprise rounded-3xl p-5 sm:p-6 hover:border-[#96171B]/30 hover:shadow-md transition-all cursor-pointer group text-left border border-slate-200/80 shadow-xs"
          title="Klik untuk membuka 4 Stasiun Kerja & Tools Dapur"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
              Kepatuhan Standar SOP
            </span>
            <div className="w-9 h-9 rounded-2xl bg-red-50 text-[#96171B] flex items-center justify-center border border-red-200 group-hover:bg-[#96171B] group-hover:text-white transition-colors">
              <Flame size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-['Outfit'] text-[#0F172A] tabular-nums">96.4%</span>
            <span className="text-xs text-slate-400 font-medium">skor audit</span>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Fryer & Sanitasi</span>
            <span className="font-bold text-[#96171B] bg-red-50 px-2 py-0.5 rounded-full border border-red-200/60">
              Standar 160°C
            </span>
          </div>
        </div>

        {/* KPI 4: Keluhan Pelanggan Aktif */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('supervisi-lapangan')}
          className="card-enterprise rounded-3xl p-5 sm:p-6 hover:border-[#96171B]/30 hover:shadow-md transition-all cursor-pointer group text-left border border-slate-200/80 shadow-xs"
          title="Klik untuk membuka Supervisi & Keluhan Pelanggan"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
              Keluhan Pelanggan
            </span>
            <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200 group-hover:bg-amber-50 group-hover:text-amber-800 group-hover:border-amber-200 transition-colors">
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-['Outfit'] text-[#0F172A] tabular-nums">{pendingComplaintsCount}</span>
            <span className="text-xs text-slate-400 font-medium">perlu tindakan</span>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{filteredComplaints.length} total tiket</span>
            <span className={`font-bold px-2 py-0.5 rounded-full border ${
              pendingComplaintsCount === 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                : 'bg-rose-50 text-rose-700 border-rose-200/60'
            }`}>
              {pendingComplaintsCount === 0 ? 'Semua Beres' : 'Perlu Solusi'}
            </span>
          </div>
        </div>

      </div>



      {/* =====================================================================
          3. GRAFIK ANALITIK CANGGIH & MODERN (TREN MINGGUAN, RADAR, DISTRIBUSI)
          ===================================================================== */}
      <ModernDashboardCharts
        selectedOutletCode={selectedOutletCode}
        examResults={examResults}
        kruList={kruList}
        outlets={outlets}
        selectedGradeFilter={gradeFilter}
        onSelectGradeFilter={(g) => {
          setGradeFilter(g);
          if (g !== 'ALL') {
            setActiveTab('ujian');
          }
        }}
        onOpenExamDetail={(exam) => setSelectedExamDetail(exam)}
      />

      {/* =====================================================================
          4. BAGIAN UTAMA DATA OPERASIONAL (ROUNDED-3XL CARD MODULE)
          ===================================================================== */}
      <div className="card-enterprise rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Banner Filter Aktif Jika Ada */}
        {gradeFilter !== 'ALL' && (
          <div className="bg-amber-50/80 border-b border-amber-200/80 px-5 sm:px-6 py-2.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-amber-600" />
              <span>
                Menampilkan data kru dengan filter: <strong className="font-mono">{gradeFilter.replace('_', ' ')}</strong> ({filteredExams.length} kru ditemukan)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setGradeFilter('ALL')}
              className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
            >
              Tampilkan Semua Hasil Ujian
            </button>
          </div>
        )}
        
        {/* Header Tab & Filter Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tabs Selector (Pill capsules) */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-full border border-slate-200/80 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('ujian')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ujian'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/90 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Hasil Ujian Kru Terkini ({filteredExams.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ojt')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ojt'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/90 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Monitoring OJT 30 Hari ({filteredOjt.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('keluhan')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'keluhan'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/90 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Keluhan & Solusi ({filteredComplaints.length})
            </button>
          </div>

          {/* Search & Filter Khusus */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama kru atau divisi..."
                className="pl-9 pr-4 py-2 rounded-full border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#96171B] focus:ring-2 focus:ring-[#96171B]/15 bg-slate-50/50 hover:bg-white focus:bg-white w-52 sm:w-64 transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* ===================================================================
            TAB 1: TABEL HASIL UJIAN KRU TERKINI
            =================================================================== */}
        {activeTab === 'ujian' && (
          <div className="overflow-x-auto">
            {filteredExams.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Award size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Belum ada data ujian yang sesuai</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bagikan tautan ujian kepada kru untuk mengumpulkan evaluasi mandiri
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nama Kru</th>
                    <th className="py-3 px-4">Cabang Outlet</th>
                    <th className="py-3 px-4">Divisi</th>
                    <th className="py-3 px-4">Waktu Penyerahan</th>
                    <th className="py-3 px-4 text-center">Skor Akhir</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExams.map((exam) => {
                    const isPassed = exam.status_kelulusan === 'Lulus Kompeten';
                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{exam.nama_kru}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{exam.id}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {exam.nama_outlet || exam.kode_outlet}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                            {exam.divisi}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(exam.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            {exam.skor_akhir_komposit}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              isPassed
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                                : 'bg-rose-50 text-rose-800 border border-rose-200/80'
                            }`}
                          >
                            {isPassed ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                            <span>{exam.status_kelulusan}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedExamDetail(exam)}
                            className="text-amber-700 hover:text-amber-800 font-semibold hover:underline inline-flex items-center gap-1"
                          >
                            <span>Detail</span>
                            <ChevronRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 2: MONITORING ONBOARDING KRU (OJT 30 HARI)
            =================================================================== */}
        {activeTab === 'ojt' && (
          <div className="overflow-x-auto">
            {filteredOjt.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Users size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Tidak ada kru dalam masa pelatihan</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Nama Kru</th>
                    <th className="py-3 px-4">Outlet & Posisi</th>
                    <th className="py-3 px-4">Minggu Aktif</th>
                    <th className="py-3 px-4">Progres Pelatihan</th>
                    <th className="py-3 px-4 text-center">Skor OJT</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOjt.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {item.nama_kru}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{item.nama_outlet || item.kode_outlet}</div>
                        <div className="text-[10px] text-slate-400">{item.divisi}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Minggu ke-{item.minggu_aktif}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Hari ke-{item.hari_berjalan}</span>
                            <span>{item.progres_persen}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${item.progres_persen}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800 font-mono">
                        {item.skor_komposit_ojt}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.status_keseluruhan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onNavigate('monitoring-training')}
                          className="text-amber-700 hover:text-amber-800 font-semibold hover:underline"
                        >
                          Buka Lembar OJT
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 3: KELUHAN & TINDAK LANJUT CEPAT
            =================================================================== */}
        {activeTab === 'keluhan' && (
          <div className="p-4 sm:p-6 space-y-3">
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
                <p className="text-sm font-semibold text-slate-700">Tidak ada keluhan aktif</p>
                <p className="text-xs text-slate-400 mt-0.5">Operasional berjalan lancar sesuai SOP mutu</p>
              </div>
            ) : (
              filteredComplaints.map((c) => {
                const isPending = c.status === 'Baru' || c.status === 'Proses';
                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-800">{c.kode_outlet}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-600 font-medium">{c.sumber_keluhan}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.tingkat_keparahan === 'Tinggi'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {c.tingkat_keparahan}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">{c.deskripsi_keluhan}</p>
                      {c.tindakan_perbaikan && (
                        <p className="text-[11px] text-slate-500 italic">
                          Tindakan: {c.tindakan_perbaikan}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => handleResolveComplaint(c.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={13} />
                          <span>Tandai Selesai</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          Sudah Ditangani
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>

      {/* =====================================================================
          4. LOG AKTIVITAS TERKINI (CLEAN & SUBTLE)
          ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-slate-400" />
            <h2 className="text-sm font-bold text-slate-800">Aktivitas Sistem Terkini</h2>
          </div>
          <span className="text-[11px] text-slate-400">Pembaruan Real-Time</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {logs.slice(0, 4).map((log) => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                <div>
                  <span className="font-semibold text-slate-700">{log.modul}: </span>
                  <span className="text-slate-600">{log.deskripsi}</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          MODAL: BAGIKAN LINK UJIAN KRU
          ===================================================================== */}
      {showShareExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Bagikan Tautan Ujian Kru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareExamModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Tautan ini dapat langsung dikirim ke kru outlet melalui WhatsApp atau dibuka pada tablet operasional outlet.
            </p>

            {/* Pemilih Cabang Outlet */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Cabang Outlet
              </label>
              <select
                value={shareOutletCode}
                onChange={(e) => setShareOutletCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50/50"
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.kode_outlet}>
                    {o.nama_outlet} ({o.kode_outlet})
                  </option>
                ))}
              </select>
            </div>

            {/* URL Langsung */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Alamat URL Ujian
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicExamUrl}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 bg-slate-50 select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyExamLink}
                  className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Copy size={13} />
                  <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {/* Tombol Salin Teks Format WhatsApp */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCopyWaMessage}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare size={14} />
                <span>{copiedWaText ? 'Format Pesan WhatsApp Tersalin!' : 'Salin Format Pesan WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: MONITOR PELATIHAN LAPANGAN REAL-TIME PER OUTLET
          ===================================================================== */}
      {showQuickAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 animate-in fade-in space-y-5 text-slate-900 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#96171B] flex items-center justify-center border border-red-100">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Monitor Pelatihan Lapangan Real-time per Outlet</h3>
                  <p className="text-xs text-slate-500">Status langsung bimbingan OJT, penugasan trainer & aktivitas kru cabang</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAuditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* List Outlets Live Monitoring */}
            <div className="space-y-3">
              {outlets.map((ot) => {
                const outletKru = kruList.filter(k => k.kode_outlet === ot.kode_outlet);
                const activeOjt = ojtList.filter(o => o.kode_outlet === ot.kode_outlet);
                const avgScore = activeOjt.length > 0
                  ? Math.round(activeOjt.reduce((s, x) => s + (x.skor_praktik || 85), 0) / activeOjt.length)
                  : 88;

                return (
                  <div key={ot.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-amber-300 transition-colors space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-[#96171B]" />
                        <span className="font-bold text-xs text-slate-900">{ot.kode_outlet} • {ot.nama_outlet}</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        Live Active
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="block text-[10px] text-slate-500 font-semibold">Total Kru</span>
                        <span className="font-bold text-slate-900">{outletKru.length} Kru</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="block text-[10px] text-slate-500 font-semibold">Aktif OJT</span>
                        <span className="font-bold text-amber-700">{activeOjt.length} Peserta</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="block text-[10px] text-slate-500 font-semibold">Rata-Rata Skor</span>
                        <span className="font-bold text-emerald-700">{avgScore} / 100</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => {
                  setShowQuickAuditModal(false);
                  onNavigate('monitoring-training');
                }}
                className="px-4 py-2 rounded-xl bg-[#96171B] hover:bg-[#7A1216] text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                Buka Detail Matrix Lapangan &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: DETAIL RAPOR & PROFIL PSIKOLOGIS KRU
          ===================================================================== */}
      {selectedExamDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Rincian Evaluasi: {selectedExamDetail.nama_kru}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedExamDetail.nama_outlet || selectedExamDetail.kode_outlet} • Divisi {selectedExamDetail.divisi}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExamDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Skor Komposit Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Skor Akhir Evaluasi</span>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {selectedExamDetail.skor_akhir_komposit} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedExamDetail.status_kelulusan === 'Lulus Kompeten'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {selectedExamDetail.status_kelulusan}
              </span>
            </div>

            {/* Analisis Karakter & Catatan Trainer */}
            {selectedExamDetail.profil_psikologis && (
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-700">Profil Karakter Kerja:</span>
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 text-amber-950 space-y-1">
                  <div className="font-bold">
                    Tipe: {selectedExamDetail.profil_psikologis.tipe_kepribadian_kerja}
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {selectedExamDetail.profil_psikologis.kesimpulan_trainer}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setSelectedExamDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
