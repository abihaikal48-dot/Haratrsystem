import React, { useState, useMemo } from 'react';
import {
  Users, Award, AlertCircle, TrendingUp, CheckCircle2, ArrowRight,
  Share2, Plus, Clock, ExternalLink, Copy, Check, Filter, Calendar,
  Building2, ChevronRight, X, Sparkles, Flame, Eye, RefreshCw,
  Search, ShieldCheck, HelpCircle, Utensils, MessageSquare, AlertTriangle,
  GraduationCap, Briefcase, UserCheck, FileCheck, BarChart3, Target,
  UtensilsCrossed, BookOpen, Zap, CalendarCheck
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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LULUS' | 'REMEDIAL'>('ALL');
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
    if (statusFilter === 'LULUS') {
      list = list.filter((e) => e.status_kelulusan === 'Lulus Kompeten');
    } else if (statusFilter === 'REMEDIAL') {
      list = list.filter((e) => e.status_kelulusan === 'Remedial Terbimbing');
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
  }, [examResults, selectedOutletCode, statusFilter, gradeFilter, searchQuery]);

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
          1. HEADER DASHBOARD: UCAPAN & KONTROL CEPAT (8px Geometri)
          ===================================================================== */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10.5px] font-bold text-[#96171B] uppercase tracking-wider">
              Pusat Kendali Operasional Gerai
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight leading-snug">
            Selamat Datang, {currentUser?.nama || 'Haikal Abi'}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pantau kepatuhan standar SOP, sertifikasi kru, dan performa gerai secara langsung
          </p>
        </div>

        {/* Tombol Aksi Cepat (8px Geometri) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowShareExamModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#96171B] hover:bg-[#7A1215] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 size={13} />
            <span>Bagikan Link Ujian Kru</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQuickAuditModal(true)}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Flame size={13} className="text-[#96171B]" />
            <span>Audit Kilat 160°C</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          2. KARTU 4 KPI UTAMA (AT-A-GLANCE METRICS, 8px GEOMETRI)
          ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Kru Aktif & Terdaftar */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('monitoring-training')}
          className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 transition-colors cursor-pointer group text-left"
          title="Klik untuk membuka Monitoring Training OJT"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-900 transition-colors">
              Kru Aktif Gerai
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200 group-hover:border-neutral-400 transition-colors">
              <Users size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">{activeKruCount}</span>
            <span className="text-xs text-neutral-400">/ {totalKruCount} personil</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
            <span className="text-neutral-500">{ojtKruCount} dalam OJT</span>
            <span className="font-semibold text-neutral-800">
              98% Siap Kerja
            </span>
          </div>
        </div>

        {/* KPI 2: Rata-Rata Ujian Mingguan */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('evaluasi-kompetensi')}
          className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 transition-colors cursor-pointer group text-left"
          title="Klik untuk membuka Pusat Evaluasi Kru (4 Pilar)"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-900 transition-colors">
              Rata-Rata Ujian Kru
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200 group-hover:border-neutral-400 transition-colors">
              <Award size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">{avgExamScore}</span>
            <span className="text-xs text-neutral-400">/ 100</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
            <span className="text-neutral-500">{filteredExams.length} ujian masuk</span>
            <span className="font-semibold text-neutral-800">
              {examPassRate}% Lulus
            </span>
          </div>
        </div>

        {/* KPI 3: Kepatuhan Suhu 160°C & SOP Mutu */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('stasiun-kerja')}
          className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 transition-colors cursor-pointer group text-left"
          title="Klik untuk membuka 4 Stasiun Kerja & Tools Dapur"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-900 transition-colors">
              Kepatuhan Standar SOP
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-[#96171B] flex items-center justify-center border border-neutral-200 group-hover:border-neutral-400 transition-colors">
              <Flame size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">96.4%</span>
            <span className="text-xs text-neutral-400">skor audit</span>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
            <span className="text-neutral-500">Fryer & Sanitasi</span>
            <span className="font-semibold text-[#96171B]">
              Standar 160°C
            </span>
          </div>
        </div>

        {/* KPI 4: Keluhan Pelanggan Aktif */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('supervisi-lapangan')}
          className="bg-white rounded-lg border border-neutral-200 p-4 hover:border-neutral-400 transition-colors cursor-pointer group text-left"
          title="Klik untuk membuka Supervisi & Keluhan Pelanggan"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-500 group-hover:text-neutral-900 transition-colors">
              Keluhan Pelanggan
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center border border-neutral-200 group-hover:border-neutral-400 transition-colors">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{pendingComplaintsCount}</span>
            <span className="text-xs text-slate-400">perlu tindakan</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">{filteredComplaints.length} total tiket</span>
            <span className={`font-semibold px-2 py-0.5 rounded ${
              pendingComplaintsCount === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {pendingComplaintsCount === 0 ? 'Semua Beres' : 'Perlu Solusi'}
            </span>
          </div>
        </div>

      </div>

      {/* =====================================================================
          2B. PUSAT AKSES OPERASIONAL CEPAT (GAS POLL / TURBO ACTIONS)
          ===================================================================== */}
      <div className="bg-gradient-to-r from-amber-900/5 via-amber-800/5 to-slate-900/5 rounded-2xl border border-amber-900/15 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Zap size={15} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Pusat Akses Cepat Operasional Trainer & Gerai
              </h2>
              <p className="text-[11px] text-slate-500">
                Pintasan langsung ke modul inti pelatihan, standardisasi dapur, dan evaluasi berkala
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-200">
            <Sparkles size={12} />
            Versi Lapangan Siap Pakai
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {/* 1. Kurikulum Onboarding 3 Hari */}
          <button
            type="button"
            onClick={() => onNavigate('kurikulum-onboarding')}
            className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <GraduationCap size={16} />
            </div>
            <span className="text-[11px] font-bold text-slate-900 leading-tight">Kurikulum 3 Hari</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Onboarding Kru</span>
          </button>

          {/* 2. Monitoring OJT H1-30 */}
          <button
            type="button"
            onClick={() => onNavigate('monitoring-training')}
            className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-1.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <CalendarCheck size={16} />
            </div>
            <span className="text-[11px] font-bold text-slate-900 leading-tight">Monitoring OJT</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Gate H1 - H30</span>
          </button>

          {/* 3. Jobdesk 15 Tugas Trainer */}
          <button
            type="button"
            onClick={() => onNavigate('jobdesk-trainer')}
            className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-1.5 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Briefcase size={16} />
            </div>
            <span className="text-[11px] font-bold text-slate-900 leading-tight">15 Tugas Trainer</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Checklist Harian</span>
          </button>

          {/* 4. Penugasan Trainer */}
          <button
            type="button"
            onClick={() => onNavigate('penugasan-trainer')}
            className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserCheck size={16} />
            </div>
            <span className="text-[11px] font-bold text-slate-900 leading-tight">Penugasan Cabang</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Dampingan Kru</span>
          </button>

          {/* 5. 4 Stasiun & Tools Dapur */}
          <button
            type="button"
            onClick={() => onNavigate('stasiun-kerja')}
            className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center mb-1.5 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <UtensilsCrossed size={16} />
            </div>
            <span className="text-[11px] font-bold text-slate-900 leading-tight">4 Tools Dapur</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Suhu & Timer</span>
          </button>

          {/* 6. Evaluasi 4 Pilar */}
          <button
            type="button"
            onClick={() => onNavigate('evaluasi-kompetensi')}
            className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center mb-1.5 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Award size={16} />
            </div>
            <span className="text-[11px] font-bold text-slate-900 leading-tight">Evaluasi 4 Pilar</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Ujian & Praktik</span>
          </button>

          {/* 7. Radar Kompetensi */}
          <button
            type="button"
            onClick={() => onNavigate('analitik-radar')}
            className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-1.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <BarChart3 size={16} />
            </div>
            <span className="text-[11px] font-bold text-slate-900 leading-tight">Radar Mutu</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Diagnostik Gerai</span>
          </button>

          {/* 8. Rapor Resmi & PDF */}
          <button
            type="button"
            onClick={() => onNavigate('laporan-resmi')}
            className="flex flex-col items-center text-center p-3 rounded-xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-1.5 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <FileCheck size={16} />
            </div>
            <span className="text-[11px] font-bold text-slate-900 leading-tight">Rapor & PDF</span>
            <span className="text-[9px] text-slate-400 mt-0.5">Sertifikat Resmi</span>
          </button>
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
          4. BAGIAN UTAMA DATA OPERASIONAL (TAB KONTROL EFISIEN)
          ===================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Banner Filter Aktif Jika Ada */}
        {gradeFilter !== 'ALL' && (
          <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-amber-900">
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
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Tabs Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('ujian')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ujian'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/90'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Hasil Ujian Kru Terkini ({filteredExams.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ojt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ojt'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/90'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Monitoring OJT 30 Hari ({filteredOjt.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('keluhan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'keluhan'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/90'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Keluhan & Solusi ({filteredComplaints.length})
            </button>
          </div>

          {/* Search & Filter Khusus */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama kru atau divisi..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-amber-500 bg-slate-50/50 hover:bg-white focus:bg-white w-48 sm:w-60"
              />
            </div>

            {activeTab === 'ujian' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50/50 focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="LULUS">Lulus Kompeten</option>
                <option value="REMEDIAL">Remedial</option>
              </select>
            )}
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
                    <th className="py-3 px-4">Cabang Gerai</th>
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
              Tautan ini dapat langsung dikirim ke kru outlet melalui WhatsApp atau dibuka pada tablet operasional gerai.
            </p>

            {/* Pemilih Cabang Gerai */}
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
          MODAL: AUDIT KILAT STANDAR MUTU 160°C
          ===================================================================== */}
      {showQuickAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Audit Kilat SOP Dapur 160°C</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAuditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {auditSavedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Audit kilat berhasil disimpan ke sistem observasi lapangan.</span>
              </div>
            )}

            <form onSubmit={handleSaveQuickAudit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Temperatur Minyak Fryer (°C)
                </label>
                <input
                  type="number"
                  value={auditTemp}
                  onChange={(e) => setAuditTemp(e.target.value)}
                  placeholder="160"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 bg-slate-50"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Standar baku HARA Chicken: 160°C ± 3°C.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Higienitas & Kepatuhan APD Dapur
                </label>
                <select
                  value={auditCleanliness}
                  onChange={(e) => setAuditCleanliness(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50"
                >
                  <option value="Sesuai">Sesuai Standar (Bersih, Celemek & Masker Lengkap)</option>
                  <option value="Perlu Bimbingan">Perlu Bimbingan (Ada ceceran minyak / APD kurang rapi)</option>
                  <option value="Deviasi Kritis">Deviasi Kritis (Minyak kotor / Suhu di bawah 150°C)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Catatan Pengamatan Singkat
                </label>
                <textarea
                  rows={3}
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="Tuliskan catatan inspeksi bila ada..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Simpan Audit</span>
                </button>
              </div>
            </form>
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
