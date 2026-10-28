import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, FileCheck, Brain, Wrench, Mic, Shield,
  Plus, Search, Filter, Sparkles, CheckCircle2, Award,
  Clock, AlertTriangle, ChevronRight, Eye, Play, Star,
  Download, Edit3, Trash2, Check, X, ShieldAlert, FileText,
  HelpCircle, ChevronDown, Flame, Thermometer, Info,
  Lightbulb, RefreshCw, Layers, ArrowUpRight, BarChart3,
  UserCheck, ExternalLink, Printer, Target, Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import { db } from '../lib/storage';
import {
  BankSOP, BankSoal, PenilaianTeori, PenilaianPraktik,
  PenilaianLisan, CrewCompetencySummary, Kru, Outlet,
  Division, SystemSettings
} from '../types';
import { AIActionType } from './AIActionModal';
import { PenilaianTeoriView } from './PenilaianTeoriView';
import { PenilaianPraktikView } from './PenilaianPraktikView';
import { PenilaianLisanView } from './PenilaianLisanView';
import { PenilaianSikapHaraView } from './PenilaianSikapHaraView';
import { KompetensiView } from './KompetensiView';
import { ModernOptionSelector } from './ModernOptionSelector';
import { PageHeaderBanner } from './PageHeaderBanner';
import { CrewExamResultsViewer } from './trainer/CrewExamResultsViewer';
import { OFFICIAL_HARA_SOP_DATABASE } from '../lib/sopData';
import { OFFICIAL_HARA_BANK_SOAL } from '../lib/soalData';

export type PelatihanSubTab =
  | 'hasil-ujian'
  | 'bank-sop'
  | 'bank-soal'
  | 'penilaian-teori'
  | 'penilaian-praktik'
  | 'penilaian-lisan'
  | 'penilaian-sikap'
  | 'kompetensi';

interface PelatihanEvaluasiViewProps {
  initialSubTab?: PelatihanSubTab;
  selectedOutletCode: string;
  onOpenAIAction: (type: AIActionType, row: any, title: string) => void;
  onSelectOutletCode?: (code: string) => void;
  allowedSubTabs?: PelatihanSubTab[];
  customTitle?: string;
  customCategory?: string;
  customDescription?: string;
}

export const PelatihanEvaluasiView: React.FC<PelatihanEvaluasiViewProps> = ({
  initialSubTab = 'bank-sop',
  selectedOutletCode,
  onOpenAIAction,
  allowedSubTabs,
  customTitle,
  customCategory,
  customDescription,
}) => {
  const [activeTab, setActiveTab] = useState<PelatihanSubTab>(initialSubTab);
  const [targetKruForSikap, setTargetKruForSikap] = useState<string | null>(null);

  // Master Data
  const [sopList, setSopList] = useState<BankSOP[]>([]);
  const [soalList, setSoalList] = useState<BankSoal[]>([]);
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [competencyList, setCompetencyList] = useState<CrewCompetencySummary[]>([]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivision, setFilterDivision] = useState<Division | 'ALL'>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');

  // SOP Modal Viewer
  const [viewingSop, setViewingSop] = useState<BankSOP | null>(null);

  // SOP CRUD Modal
  const [isSopModalOpen, setIsSopModalOpen] = useState(false);
  const [editSopItem, setEditSopItem] = useState<BankSOP | null>(null);
  const [sopFormData, setSopFormData] = useState<{
    kode_sop: string;
    judul_sop: string;
    divisi: Division;
    tujuan: string;
    langkahText: string;
    poin_kritis: string;
    standar_waktu: string;
    alat_bahan: string;
    status_aktif: 'Aktif' | 'Arsip';
  }>({
    kode_sop: '',
    judul_sop: '',
    divisi: 'Kitchen',
    tujuan: '',
    langkahText: '',
    poin_kritis: '',
    standar_waktu: '',
    alat_bahan: '',
    status_aktif: 'Aktif',
  });

  // Soal CRUD Modal
  const [isSoalModalOpen, setIsSoalModalOpen] = useState(false);
  const [editSoalItem, setEditSoalItem] = useState<BankSoal | null>(null);
  const [soalFormData, setSoalFormData] = useState<{
    divisi: Division;
    topik: string;
    pertanyaan: string;
    kode_sop?: string;
    referensi_sop?: string;
    pembahasan?: string;
    pilihan_a: string;
    pilihan_b: string;
    pilihan_c: string;
    pilihan_d: string;
    jawaban_benar: 'A' | 'B' | 'C' | 'D';
    tingkat_kesulitan: 'Mudah' | 'Sedang' | 'Sulit';
    status_aktif: 'Aktif' | 'Arsip';
  }>({
    divisi: 'Kitchen',
    topik: 'Standar Penggorengan',
    pertanyaan: '',
    kode_sop: 'HC-SOP-KIT-02',
    referensi_sop: 'Standar Penggorengan Ayam',
    pembahasan: '',
    pilihan_a: '',
    pilihan_b: '',
    pilihan_c: '',
    pilihan_d: '',
    jawaban_benar: 'A',
    tingkat_kesulitan: 'Sedang',
    status_aktif: 'Aktif',
  });

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadData = () => {
    setSopList(db.getTable<BankSOP>('bank_sop'));
    setSoalList(db.getTable<BankSoal>('bank_soal'));
    setKruList(db.getTable<Kru>('kru'));
    setOutlets(db.getTable<Outlet>('outlets'));
    setCompetencyList(db.getCrewCompetencySummaries());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Overall Statistics for Pelatihan & Evaluasi
  const stats = useMemo(() => {
    const totalSop = sopList.length;
    const totalSoal = soalList.length;
    const totalKru = kruList.length;
    const totalCertified = competencyList.filter((c) => c.statusKelulusan === 'LULUS').length;
    const avgScore = competencyList.length > 0
      ? Math.round(competencyList.reduce((acc, c) => acc + (c.skorAkhir || 0), 0) / competencyList.length)
      : 0;

    return {
      totalSop,
      totalSoal,
      totalKru,
      totalCertified,
      passRate: totalKru > 0 ? Math.round((totalCertified / totalKru) * 100) : 0,
      avgScore,
    };
  }, [sopList, soalList, kruList, competencyList]);

  // SOP Modal Handlers
  const handleOpenAddSop = () => {
    setEditSopItem(null);
    setSopFormData({
      kode_sop: `SOP-HC-${Date.now().toString().slice(-4)}`,
      judul_sop: '',
      divisi: 'Kitchen',
      tujuan: '',
      langkahText: '1. Persiapan alat & APD lengkap\n2. Cek suhu minyak 165°C\n3. Masukkan ayam perlahan\n4. Set timer goreng 12 menit\n5. Tiriskan minimal 3 menit',
      poin_kritis: 'Suhu minyak tidak boleh di bawah 160°C saat penggorengan berlangsung.',
      standar_waktu: '15 Menit',
      alat_bahan: 'Deep Fryer, Thermometer, Capitan Stainless, APD Lengkap',
      status_aktif: 'Aktif',
    });
    setIsSopModalOpen(true);
  };

  const handleOpenEditSop = (sop: BankSOP) => {
    setEditSopItem(sop);
    setSopFormData({
      kode_sop: sop.kode_sop || `SOP-HC-${sop.id.slice(-4)}`,
      judul_sop: sop.judul_sop,
      divisi: sop.divisi || (sop.kategori as Division) || 'Kitchen',
      tujuan: sop.tujuan || '',
      langkahText: Array.isArray(sop.langkah) ? sop.langkah.join('\n') : '',
      poin_kritis: sop.poin_kritis || '',
      standar_waktu: sop.standar_waktu || '',
      alat_bahan: sop.alat_bahan || '',
      status_aktif: sop.status_aktif || 'Aktif',
    });
    setIsSopModalOpen(true);
  };

  const handleSaveSop = (e: React.FormEvent) => {
    e.preventDefault();
    const langkahArray = sopFormData.langkahText
      .split('\n')
      .map((l) => l.trim().replace(/^\d+[\.\)]\s*/, ''))
      .filter((l) => l.length > 0);

    const payload: Partial<BankSOP> = {
      kode_sop: sopFormData.kode_sop,
      kategori: sopFormData.divisi,
      judul_sop: sopFormData.judul_sop,
      divisi: sopFormData.divisi,
      tujuan: sopFormData.tujuan,
      langkah: langkahArray,
      poin_kritis: sopFormData.poin_kritis,
      standar_waktu: sopFormData.standar_waktu,
      alat_bahan: sopFormData.alat_bahan,
      sumber: 'HARA Chicken Indonesia',
      status_aktif: sopFormData.status_aktif,
    };

    if (editSopItem) {
      db.updateRow('bank_sop', editSopItem.id, payload);
      showToast('SOP berhasil diperbarui!');
    } else {
      db.insertRow('bank_sop', payload);
      showToast('SOP baru berhasil ditambahkan ke Bank SOP!');
    }

    setIsSopModalOpen(false);
    setEditSopItem(null);
    loadData();
  };

  const handleDeleteSop = (id: string) => {
    if (window.confirm('Hapus dokumen SOP ini dari sistem?')) {
      db.deleteRow('bank_sop', id);
      showToast('Dokumen SOP berhasil dihapus.');
      loadData();
    }
  };

  // Soal Modal Handlers
  const handleOpenAddSoal = () => {
    setEditSoalItem(null);
    setSoalFormData({
      divisi: 'Kitchen',
      topik: 'Standar Penggorengan & HACCP',
      pertanyaan: '',
      kode_sop: 'HC-SOP-KIT-02',
      referensi_sop: 'Standar Penggorengan Ayam',
      pembahasan: '',
      pilihan_a: '',
      pilihan_b: '',
      pilihan_c: '',
      pilihan_d: '',
      jawaban_benar: 'A',
      tingkat_kesulitan: 'Sedang',
      status_aktif: 'Aktif',
    });
    setIsSoalModalOpen(true);
  };

  const handleOpenEditSoal = (soal: BankSoal) => {
    setEditSoalItem(soal);
    setSoalFormData({
      divisi: soal.divisi,
      topik: soal.topik,
      pertanyaan: soal.pertanyaan,
      kode_sop: soal.kode_sop || 'HC-SOP-KIT-01',
      referensi_sop: soal.referensi_sop || 'Standar Operasional Restoran',
      pembahasan: soal.pembahasan || '',
      pilihan_a: soal.opsi_a || '',
      pilihan_b: soal.opsi_b || '',
      pilihan_c: soal.opsi_c || '',
      pilihan_d: soal.opsi_d || '',
      jawaban_benar: soal.jawaban_benar,
      tingkat_kesulitan: (soal as any).tingkat_kesulitan || 'Sedang',
      status_aktif: soal.status_aktif,
    });
    setIsSoalModalOpen(true);
  };

  const handleSaveSoal = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Partial<BankSoal> = {
      divisi: soalFormData.divisi,
      topik: soalFormData.topik,
      pertanyaan: soalFormData.pertanyaan,
      kode_sop: soalFormData.kode_sop,
      referensi_sop: soalFormData.referensi_sop,
      pembahasan: soalFormData.pembahasan,
      opsi_a: soalFormData.pilihan_a,
      opsi_b: soalFormData.pilihan_b,
      opsi_c: soalFormData.pilihan_c,
      opsi_d: soalFormData.pilihan_d,
      jawaban_benar: soalFormData.jawaban_benar,
      tingkat_kesulitan: soalFormData.tingkat_kesulitan,
      bobot: 1,
      status_aktif: soalFormData.status_aktif,
    };

    if (editSoalItem) {
      db.updateRow('bank_soal', editSoalItem.id, payload);
      showToast('Soal ujian berhasil diperbarui!');
    } else {
      db.insertRow('bank_soal', payload);
      showToast('Soal baru berhasil ditambahkan ke Bank Soal!');
    }

    setIsSoalModalOpen(false);
    setEditSoalItem(null);
    loadData();
  };

  const handleDeleteSoal = (id: string) => {
    if (window.confirm('Hapus butir soal ujian ini dari sistem?')) {
      db.deleteRow('bank_soal', id);
      showToast('Butir soal berhasil dihapus.');
      loadData();
    }
  };

  // Sub Tab Navigation Config: 4 Pilar Evaluasi Sejajar + Matriks & Radar
  const TABS_CONFIG = [
    {
      id: 'hasil-ujian' as PelatihanSubTab,
      label: '1. Uji Teori SOP (20%)',
      icon: Brain,
      count: db.getHasilUjianMingguan().length,
      desc: 'Hasil Ujian CBT Otomatis & Review Essay HOTS',
    },
    {
      id: 'penilaian-praktik' as PelatihanSubTab,
      label: '2. Uji Praktik & SOS (40%)',
      icon: Wrench,
      count: db.getTable('penilaian_praktik').length,
      desc: 'Stopwatch Detik, Akurasi Suhu 160°C & Gramatur',
    },
    {
      id: 'penilaian-lisan' as PelatihanSubTab,
      label: '3. Uji Lisan HACCP (15%)',
      icon: Mic,
      count: db.getTable('penilaian_lisan').length,
      desc: 'Pemahaman Titik Kritis & "Why Behind SOP"',
    },
    {
      id: 'penilaian-sikap' as PelatihanSubTab,
      label: '4. Penilaian Budaya HARA (25%)',
      icon: Heart,
      count: db.getTable('attitude_hara').length,
      desc: 'Input Nilai HARA Objektif 16 Butir SOP Baku (Bebas Subjektivitas Skala 1-5)',
    },
    {
      id: 'kompetensi' as PelatihanSubTab,
      label: '5. Matriks 360° & Radar',
      icon: Shield,
      count: competencyList.length,
      desc: 'Triangulasi Objektif 4 Pilar, Sertifikasi & Radar',
    },
    {
      id: 'penilaian-teori' as PelatihanSubTab,
      label: 'Input Manual Teori',
      icon: Award,
      count: db.getTable('penilaian_teori').length,
      desc: 'Input Nilai Teori Tambahan / Ujian Tertulis Khusus',
    },
    {
      id: 'bank-sop' as PelatihanSubTab,
      label: 'Bank SOP Resmi',
      icon: BookOpen,
      count: sopList.length,
      desc: 'Standar Operasional Baku & Instruksi Kerja',
    },
    {
      id: 'bank-soal' as PelatihanSubTab,
      label: 'Bank Soal Ujian',
      icon: FileCheck,
      count: soalList.length,
      desc: 'Koleksi Soal Kognitif & Evaluasi Teori',
    },
  ];

  const visibleTabs = useMemo(() => {
    if (!allowedSubTabs || allowedSubTabs.length === 0) return TABS_CONFIG;
    return TABS_CONFIG.filter((t) => allowedSubTabs.includes(t.id));
  }, [allowedSubTabs, TABS_CONFIG]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. UNIFIED MINIMALIST PAGE HEADER & SUB-TABS */}
      <PageHeaderBanner
        category={customCategory || "PELATIHAN & EVALUASI OBJEKTIF"}
        title={customTitle || "Pusat Standardisasi, Evaluasi 360° & Data Science"}
        description={customDescription || "Standardisasi mutu baku QSR dengan pengujian objektif 4 pilar: Teori Otomatis (25%), Praktik SOS Stopwatch (35%), Lisan HACCP (20%), dan Audit Lapangan (20%) berbasis Kurva Distribusi Normal Gauss."}
        icon={<Award size={22} />}
        tabs={visibleTabs.map((t) => ({
          id: t.id,
          label: t.label,
          icon: t.icon,
          count: t.count,
        }))}
        activeTab={activeTab}
        onSelectTab={(id) => {
          setActiveTab(id as PelatihanSubTab);
          setSearchQuery('');
          setFilterDivision('ALL');
        }}
        rightElement={
          <div className="flex items-center gap-2">
            {activeTab === 'bank-sop' && (
              <button
                onClick={handleOpenAddSop}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#96171B] hover:bg-[#801216] text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99] whitespace-nowrap"
              >
                <Plus size={15} />
                <span>Tambah SOP</span>
              </button>
            )}

            {activeTab === 'bank-soal' && (
              <button
                onClick={handleOpenAddSoal}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#96171B] hover:bg-[#801216] text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99] whitespace-nowrap"
              >
                <Plus size={15} />
                <span>Tambah Soal</span>
              </button>
            )}
          </div>
        }
      />

      {/* 2. SUMMARY KPI STATS PILLS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Bank SOP</span>
            <BookOpen size={14} className="text-[#96171B]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{stats.totalSop}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Standar Resmi</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Bank Soal</span>
            <FileCheck size={14} className="text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{stats.totalSoal}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Butir Pilihan Ganda</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Kru Terdaftar</span>
            <UserCheck size={14} className="text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{stats.totalKru}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Personil Aktif</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Kru Bersertifikat</span>
            <Shield size={14} className="text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{stats.totalCertified}</div>
          <div className="text-[11px] text-emerald-700 font-semibold truncate">{stats.passRate}% Kelulusan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Rata-Rata Nilai</span>
            <Star size={14} className="text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{stats.avgScore} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Skor Komposit</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Formula 4-Pilar</span>
            <Layers size={14} className="text-[#96171B]" />
          </div>
          <div className="text-xs font-bold text-slate-900 pt-1 font-mono">20% • 40% • 15% • 25%</div>
          <div className="text-[10px] text-slate-500 font-medium truncate">Teori • Praktik • Lisan • Sikap HARA</div>
        </div>
      </div>

      {/* 3. ACTIVE SUB-TAB CONTENT */}
      {/* ========================================================================= */}
      {/* 0. HASIL UJIAN MANDIRI KRU & KONTROL PAKET UJIAN */}
      {/* ========================================================================= */}
      {activeTab === 'hasil-ujian' && (
        <CrewExamResultsViewer selectedOutletCode={selectedOutletCode} />
      )}

      {/* ========================================================================= */}
      {/* A. BANK SOP RESMI (INTERACTIVE VIEWER & GENERATOR) */}
      {/* ========================================================================= */}
      {activeTab === 'bank-sop' && (
        <div className="space-y-4">
          {/* Top Filter & Action Bar */}
          <div className="card-enterprise !p-4 bg-white border border-[#E5E0D8] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-lg">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari judul SOP, kode, bahan, atau kata kunci..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-enterprise !pl-8 text-xs w-full"
                  />
                </div>

                <div className="min-w-[140px]">
                  <ModernOptionSelector
                    value={filterDivision}
                    onChange={(val) => setFilterDivision((val || 'ALL') as any)}
                    options={[
                      { value: 'ALL', label: 'Semua Divisi' },
                      { value: 'Kitchen', label: 'Kitchen' },
                      { value: 'Kasir', label: 'Kasir' },
                      { value: 'Geprek', label: 'Geprek' },
                      { value: 'Helper', label: 'Helper' },
                    ]}
                    inlineChips={false}
                    size="sm"
                    clearable={false}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('hara_pd_bank_sop_v6');
                    localStorage.removeItem('hara_pd_bank_sop_v5');
                    localStorage.removeItem('hara_pd_bank_sop_v4');
                    localStorage.removeItem('hara_pd_bank_sop_v3');
                    localStorage.removeItem('hara_pd_bank_sop_v2');
                    localStorage.removeItem('hara_pd_bank_sop');
                    localStorage.removeItem('hara_pd_bank_soal_v3');
                    localStorage.removeItem('hara_pd_bank_soal_v2');
                    localStorage.removeItem('hara_pd_bank_soal');
                    db.setDirect('bank_sop', OFFICIAL_HARA_SOP_DATABASE);
                    db.setDirect('bank_soal', OFFICIAL_HARA_BANK_SOAL);
                    setSopList(OFFICIAL_HARA_SOP_DATABASE);
                    setSoalList(OFFICIAL_HARA_BANK_SOAL);
                    showToast('Berhasil memuat 82 SOP Resmi lengkap untuk seluruh 4 Jobdesk!');
                  }}
                  className="btn-secondary-enterprise !py-1.5 !px-3 text-xs flex items-center gap-1.5 font-bold cursor-pointer text-slate-700 hover:text-[#8C161B]"
                  title="Sinkronkan seluruh Bank SOP & Bank Soal ke edisi dokumen resmi CV. Ultima Rasa Indonesia"
                >
                  <RefreshCw size={13} className="text-[#8C161B]" />
                  <span>Sinkronkan 82 SOP Resmi (4 Jobdesk)</span>
                </button>

                <button
                  onClick={handleOpenAddSop}
                  className="btn-primary-enterprise !py-1.5 !px-3 text-xs flex items-center gap-1.5 shadow-xs font-bold cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah SOP</span>
                </button>
              </div>
            </div>

            {/* Quick 4 Jobdesk Filter Tabs with Live SOP Counts */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                Filter Jobdesk:
              </span>
              {[
                { id: 'ALL', label: 'Semua Jobdesk', count: sopList.length, color: 'bg-slate-900 text-white' },
                { id: 'Kitchen', label: 'Kitchen', count: sopList.filter((s) => s.divisi === 'Kitchen').length, color: 'bg-[#96171B] text-white' },
                { id: 'Kasir', label: 'Kasir', count: sopList.filter((s) => s.divisi === 'Kasir').length, color: 'bg-emerald-700 text-white' },
                { id: 'Geprek', label: 'Geprek', count: sopList.filter((s) => s.divisi === 'Geprek').length, color: 'bg-amber-700 text-white' },
                { id: 'Helper', label: 'Helper', count: sopList.filter((s) => s.divisi === 'Helper').length, color: 'bg-blue-700 text-white' },
              ].map((tab) => {
                const isActive = filterDivision === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFilterDivision(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                      isActive
                        ? `${tab.color} shadow-sm ring-2 ring-slate-400/30`
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Official SOP Manual Info Header */}
            <div className="p-3 bg-gradient-to-r from-amber-50/80 via-red-50/50 to-white rounded-xl border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900 shrink-0">
                  <BookOpen size={16} />
                </div>
                <div>
                  <div className="font-black text-slate-900 flex items-center gap-1.5">
                    <span>Dokumen Induk Baku: SOP/HC/09 & HC-SOP-11-PKP</span>
                    <span className="badge-enterprise text-[9px] bg-emerald-100 text-emerald-800 border-emerald-300">
                      CV. Ultima Rasa Indonesia
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Mencakup 4 nilai Budaya <b>H.A.R.A</b> (Halal, Amanah, Responsif, Adaptif) & 12 Perilaku Utama, tata tertib, grooming seragam harian, buka/tutup outlet, kasir POS & QRIS, HACCP suhu, thawing ayam, resep sambal gramasi presisi, side dishes, minuman 40 cup, hingga general cleaning.
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shrink-0 self-start md:self-auto">
                Edisi Revisi 2024 / 2025
              </span>
            </div>
          </div>

          {/* SOP Document Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sopList
              .filter((sop) => {
                const matchDiv = filterDivision === 'ALL' || sop.divisi === filterDivision;
                const matchQuery =
                  !searchQuery ||
                  sop.judul_sop.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  sop.kode_sop.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (sop.poin_kritis && sop.poin_kritis.toLowerCase().includes(searchQuery.toLowerCase()));
                return matchDiv && matchQuery;
              })
              .map((sop) => (
                <div
                  key={sop.id}
                  className="card-enterprise !p-4 bg-white border border-[#E5E0D8] hover:border-red-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    {/* Header Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {sop.kode_sop}
                        </span>
                        <span
                          className={`badge-enterprise text-[9.5px] ${
                            sop.divisi === 'Kitchen'
                              ? 'bg-red-50 text-[#8C161B] border-red-200'
                              : sop.divisi === 'Kasir'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : sop.divisi === 'Geprek'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {sop.divisi}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md">
                        ⏱️ {sop.standar_waktu || '10-15 Min'}
                      </span>
                    </div>

                    {/* SOP Title */}
                    <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-2">
                      {sop.judul_sop}
                    </h3>

                    {/* Purpose */}
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      {sop.tujuan || 'Standar baku eksekusi teknis operasional harian kru.'}
                    </p>

                    {/* Steps Preview */}
                    <div className="space-y-1 text-xs">
                      <div className="text-[10.5px] font-extrabold text-slate-500 flex items-center justify-between">
                        <span>Langkah Kerja ({Array.isArray(sop.langkah) ? sop.langkah.length : 0} Butir):</span>
                      </div>
                      <div className="space-y-1">
                        {Array.isArray(sop.langkah) &&
                          sop.langkah.slice(0, 2).map((step, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                              <span className="w-4 h-4 rounded-full bg-red-100 text-[#8C161B] font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="line-clamp-1">{step}</span>
                            </div>
                          ))}
                        {Array.isArray(sop.langkah) && sop.langkah.length > 2 && (
                          <div className="text-[10px] font-bold text-slate-400 pl-5">
                            + {sop.langkah.length - 2} langkah kerja lainnya...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Critical Point Badge */}
                    {sop.poin_kritis && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-[10.5px] text-amber-900 flex items-start gap-1.5">
                        <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          <b>Poin Kritis HACCP:</b> {sop.poin_kritis}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setViewingSop(sop)}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-[#8C161B] rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Buka SOP Lengkap</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          onOpenAIAction('sop_quiz', sop, `Generate Kuis AI dari SOP: ${sop.judul_sop}`)
                        }
                        className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-lg"
                        title="Generate Soal Kuis AI dari SOP Ini"
                      >
                        <Sparkles size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenEditSop(sop)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                        title="Edit SOP"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteSop(sop.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Hapus SOP"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* B. BANK SOAL UJIAN (MCQ QUESTION BANK) */}
      {/* ========================================================================= */}
      {activeTab === 'bank-soal' && (
        <div className="space-y-4">
          <div className="card-enterprise !p-4 bg-white border border-[#E5E0D8] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-lg">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari pertanyaan, topik, atau kata kunci..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-enterprise !pl-8 text-xs w-full"
                  />
                </div>

                <div className="min-w-[140px]">
                  <ModernOptionSelector
                    value={filterDivision}
                    onChange={(val) => setFilterDivision((val || 'ALL') as any)}
                    options={[
                      { value: 'ALL', label: 'Semua Divisi' },
                      { value: 'Kitchen', label: 'Kitchen' },
                      { value: 'Kasir', label: 'Kasir' },
                      { value: 'Geprek', label: 'Geprek' },
                      { value: 'Helper', label: 'Helper' },
                    ]}
                    inlineChips={false}
                    size="sm"
                    clearable={false}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenAddSoal}
                  className="btn-primary-enterprise !py-1.5 !px-3 text-xs flex items-center gap-1.5 shadow-xs font-bold cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Soal</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {soalList
              .filter((soal) => {
                const matchDiv = filterDivision === 'ALL' || soal.divisi === filterDivision;
                const matchQuery =
                  !searchQuery ||
                  soal.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  soal.topik.toLowerCase().includes(searchQuery.toLowerCase());
                return matchDiv && matchQuery;
              })
              .map((soal, idx) => (
                <div
                  key={soal.id}
                  className="card-enterprise !p-4 bg-white border border-[#E5E0D8] hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-900 font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {soal.kode_sop && (
                        <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <BookOpen size={10} className="text-amber-800" />
                          <span>{soal.kode_sop}</span>
                        </span>
                      )}
                      <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {soal.divisi} • {soal.topik}
                      </span>
                      {soal.referensi_sop && (
                        <span className="text-[10px] text-slate-500 font-medium hidden sm:inline-block">
                          ({soal.referensi_sop})
                        </span>
                      )}
                      <span className="badge-enterprise text-[9.5px] bg-emerald-50 text-emerald-800 border-emerald-200 font-bold">
                        Kunci Jawaban: {soal.jawaban_benar}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditSoal(soal)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="Edit Soal"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteSoal(soal.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Hapus Soal"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-relaxed">
                    {soal.pertanyaan}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                      const isCorrect = soal.jawaban_benar === opt;
                      const text =
                        opt === 'A'
                          ? soal.opsi_a
                          : opt === 'B'
                          ? soal.opsi_b
                          : opt === 'C'
                          ? soal.opsi_c
                          : soal.opsi_d;

                      return (
                        <div
                          key={opt}
                          className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                            isCorrect
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {opt}
                          </span>
                          <span className="text-[11.5px] leading-snug">{text}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* SOP Pembahasan Box */}
                  {soal.pembahasan && (
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                        <BookOpen size={12} className="text-amber-700" />
                        <span>Pembahasan Standar Operasional Baku (SOP):</span>
                        {soal.kode_sop && (
                          <span className="font-mono text-amber-800 text-[10px]">
                            • Ref {soal.kode_sop}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-amber-950 leading-relaxed">
                        {soal.pembahasan}
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* C. UJI TEORI SOP (25%) */}
      {/* ========================================================================= */}
      {activeTab === 'penilaian-teori' && (
        <PenilaianTeoriView selectedOutletCode={selectedOutletCode} />
      )}

      {/* ========================================================================= */}
      {/* D. UJI PRAKTIK LAPANGAN (50%) */}
      {/* ========================================================================= */}
      {activeTab === 'penilaian-praktik' && (
        <PenilaianPraktikView selectedOutletCode={selectedOutletCode} />
      )}

      {/* ========================================================================= */}
      {/* E. UJI LISAN & SITUASI KRITIS (15%) */}
      {/* ========================================================================= */}
      {activeTab === 'penilaian-lisan' && (
        <PenilaianLisanView selectedOutletCode={selectedOutletCode} />
      )}

      {/* ========================================================================= */}
      {/* E2. PILAR 4: SIKAP BUDAYA H.A.R.A 12 PERILAKU UTAMA (25%) */}
      {/* ========================================================================= */}
      {activeTab === 'penilaian-sikap' && (
        <PenilaianSikapHaraView
          selectedOutletCode={selectedOutletCode}
          initialTargetKruName={targetKruForSikap}
        />
      )}

      {/* ========================================================================= */}
      {/* F. MATRIKS KOMPETENSI & RADAR 360° */}
      {/* ========================================================================= */}
      {activeTab === 'kompetensi' && (
        <KompetensiView
          selectedOutletCode={selectedOutletCode}
          onNavigateToExam={(type, crewName) => {
            if (type === 'teori') setActiveTab('hasil-ujian');
            else if (type === 'praktik') setActiveTab('penilaian-praktik');
            else if (type === 'lisan') setActiveTab('penilaian-lisan');
            else if (type === 'sikap') {
              setTargetKruForSikap(crewName || null);
              setActiveTab('penilaian-sikap');
            }
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INTERACTIVE SOP DOCUMENT READER */}
      {/* ========================================================================= */}
      {viewingSop && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            {/* Header */}
            <div className="bg-[#8C161B] text-white p-5 flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-[#FBD66A] text-[10px] font-bold mb-1.5">
                  <BookOpen size={12} />
                  <span>DOKUMEN RESMI HARA CHICKEN INDONESIA</span>
                </div>
                <h3 className="text-lg font-black text-white">{viewingSop.judul_sop}</h3>
                <div className="text-xs text-white/80 flex items-center gap-2 mt-1">
                  <span>Kode: {viewingSop.kode_sop}</span>
                  <span>•</span>
                  <span>Divisi: {viewingSop.divisi}</span>
                  <span>•</span>
                  <span>Standar Durasi: {viewingSop.standar_waktu || '15 Menit'}</span>
                </div>
              </div>

              <button
                onClick={() => setViewingSop(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
              {/* Tujuan */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <Target size={14} className="text-[#96171B]" />
                  <span>Tujuan & Standar Kualitas:</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {viewingSop.tujuan || 'Menjamin konsistensi mutu produk, kepatuhan food safety HACCP, serta higienitas operasional outlet.'}
                </p>
              </div>

              {/* Alat & Bahan */}
              {viewingSop.alat_bahan && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/70 space-y-1 text-blue-950">
                  <h4 className="font-black text-blue-900 text-xs flex items-center gap-1.5">
                    <Wrench size={14} className="text-blue-800" />
                    <span>Alat & Bahan yang Dibutuhkan:</span>
                  </h4>
                  <p className="leading-relaxed">{viewingSop.alat_bahan}</p>
                </div>
              )}

              {/* Langkah Kerja */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                  <BookOpen size={14} className="text-slate-800" />
                  <span>Urutan Instruksi Kerja Terstandar:</span>
                </h4>
                <div className="space-y-2">
                  {Array.isArray(viewingSop.langkah) &&
                    viewingSop.langkah.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5 shadow-2xs"
                      >
                        <span className="w-5 h-5 rounded-md bg-[#8C161B] text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-slate-800 leading-relaxed font-medium text-xs">{step}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Poin Kritis HACCP */}
              {viewingSop.poin_kritis && (
                <div className="p-3.5 bg-gradient-to-r from-red-50 to-amber-50 rounded-xl border border-red-200 text-red-950 space-y-1">
                  <h4 className="font-black text-red-900 text-xs flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-red-600" />
                    <span>Poin Kritis HACCP & Food Safety (Wajib Dipatuhi):</span>
                  </h4>
                  <p className="leading-relaxed text-[11.5px] font-bold">{viewingSop.poin_kritis}</p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setViewingSop(null);
                  setActiveTab('penilaian-praktik');
                }}
                className="btn-primary-enterprise !py-2 !px-4 text-xs font-bold flex items-center gap-1.5"
              >
                <Play size={13} />
                <span>Uji Praktik Kru dengan SOP Ini</span>
              </button>

              <button
                onClick={() => setViewingSop(null)}
                className="btn-secondary-enterprise !py-2 !px-4 text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD/EDIT SOP FORM */}
      {/* ========================================================================= */}
      {isSopModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="bg-[#1E2530] text-white p-4 flex items-center justify-between">
              <h3 className="font-black text-sm">
                {editSopItem ? 'Edit Dokumen SOP' : 'Tambah SOP Baru'}
              </h3>
              <button onClick={() => setIsSopModalOpen(false)} className="text-white/70 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSop} className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode SOP</label>
                  <input
                    type="text"
                    required
                    value={sopFormData.kode_sop}
                    onChange={(e) => setSopFormData({ ...sopFormData, kode_sop: e.target.value })}
                    className="input-enterprise text-xs w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Divisi Terkait</label>
                  <ModernOptionSelector
                    value={sopFormData.divisi}
                    onChange={(val) => setSopFormData({ ...sopFormData, divisi: val as any })}
                    options={['Kitchen', 'Kasir', 'Geprek', 'Helper']}
                    inlineChips
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul SOP</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SOP Penggorengan Ayam Krispi & Suhu Minyak"
                  value={sopFormData.judul_sop}
                  onChange={(e) => setSopFormData({ ...sopFormData, judul_sop: e.target.value })}
                  className="input-enterprise text-xs w-full font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tujuan & Standar Hasil</label>
                <textarea
                  rows={2}
                  value={sopFormData.tujuan}
                  onChange={(e) => setSopFormData({ ...sopFormData, tujuan: e.target.value })}
                  placeholder="Tujuan pelaksanaan SOP ini..."
                  className="input-enterprise text-xs w-full"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Langkah-Langkah Kerja (Satu baris untuk setiap langkah)
                </label>
                <textarea
                  rows={5}
                  required
                  value={sopFormData.langkahText}
                  onChange={(e) => setSopFormData({ ...sopFormData, langkahText: e.target.value })}
                  placeholder="1. Langkah pertama...&#10;2. Langkah kedua..."
                  className="input-enterprise text-xs w-full font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-red-700 mb-1">Poin Kritis HACCP / Keamanan Pangan</label>
                <input
                  type="text"
                  value={sopFormData.poin_kritis}
                  onChange={(e) => setSopFormData({ ...sopFormData, poin_kritis: e.target.value })}
                  placeholder="Parameter suhu, batas waktu holding, atau sanitasi ketat..."
                  className="input-enterprise text-xs w-full border-red-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Standar Durasi</label>
                  <input
                    type="text"
                    value={sopFormData.standar_waktu}
                    onChange={(e) => setSopFormData({ ...sopFormData, standar_waktu: e.target.value })}
                    placeholder="Contoh: 15 Menit"
                    className="input-enterprise text-xs w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status SOP</label>
                  <ModernOptionSelector
                    value={sopFormData.status_aktif}
                    onChange={(val) => setSopFormData({ ...sopFormData, status_aktif: val as any })}
                    options={['Aktif', 'Arsip']}
                    inlineChips
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSopModalOpen(false)}
                  className="btn-secondary-enterprise !py-1.5 !px-3 text-xs"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary-enterprise !py-1.5 !px-4 text-xs font-bold">
                  Simpan SOP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD/EDIT SOAL FORM */}
      {/* ========================================================================= */}
      {isSoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="bg-[#1E2530] text-white p-4 flex items-center justify-between">
              <h3 className="font-black text-sm">
                {editSoalItem ? 'Edit Butir Soal' : 'Tambah Butir Soal Ujian'}
              </h3>
              <button onClick={() => setIsSoalModalOpen(false)} className="text-white/70 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSoal} className="p-4 overflow-y-auto space-y-3 text-xs flex-1">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Divisi</label>
                <ModernOptionSelector
                  value={soalFormData.divisi}
                  onChange={(val) => setSoalFormData({ ...soalFormData, divisi: val as any })}
                  options={['Kitchen', 'Kasir', 'Geprek', 'Helper']}
                  inlineChips
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Topik Ujian</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Standar Penggorengan & HACCP"
                  value={soalFormData.topik}
                  onChange={(e) => setSoalFormData({ ...soalFormData, topik: e.target.value })}
                  className="input-enterprise text-xs w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode SOP Acuan</label>
                  <input
                    type="text"
                    placeholder="Contoh: HC-SOP-KIT-02"
                    value={soalFormData.kode_sop || ''}
                    onChange={(e) => setSoalFormData({ ...soalFormData, kode_sop: e.target.value })}
                    className="input-enterprise text-xs w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Dokumen SOP</label>
                  <input
                    type="text"
                    placeholder="Contoh: Standar Penggorengan Ayam"
                    value={soalFormData.referensi_sop || ''}
                    onChange={(e) => setSoalFormData({ ...soalFormData, referensi_sop: e.target.value })}
                    className="input-enterprise text-xs w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pertanyaan Soal</label>
                <textarea
                  rows={3}
                  required
                  value={soalFormData.pertanyaan}
                  onChange={(e) => setSoalFormData({ ...soalFormData, pertanyaan: e.target.value })}
                  placeholder="Tuliskan butir soal evaluasi pemahaman di sini..."
                  className="input-enterprise text-xs w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Pilihan Jawaban (A, B, C, D):</label>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Klik huruf (A/B/C/D) untuk kunci jawaban benar
                  </span>
                </div>
                {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                  const key = `pilihan_${opt}` as keyof typeof soalFormData;
                  const upper = opt.toUpperCase() as 'A' | 'B' | 'C' | 'D';
                  const isCorrect = soalFormData.jawaban_benar === upper;

                  return (
                    <div key={opt} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSoalFormData({ ...soalFormData, jawaban_benar: upper })}
                        className={`w-8 h-8 rounded-xl text-xs font-black shrink-0 transition-all flex items-center justify-center cursor-pointer border ${
                          isCorrect
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-200'
                            : 'bg-[#FAF8F5] text-slate-700 border-slate-300 hover:bg-white hover:border-slate-400'
                        }`}
                        title="Klik untuk jadikan kunci jawaban"
                      >
                        {upper}
                      </button>
                      <input
                        type="text"
                        required
                        value={soalFormData[key] as string}
                        onChange={(e) => setSoalFormData({ ...soalFormData, [key]: e.target.value })}
                        placeholder={`Teks pilihan ${upper}`}
                        className={`input-enterprise text-xs flex-1 ${
                          isCorrect ? 'border-emerald-400 bg-emerald-50/30' : ''
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pembahasan Kunci Jawaban Resmi SOP (Poin Kritis HACCP & Alasan Ilmiah)
                </label>
                <textarea
                  rows={3}
                  value={soalFormData.pembahasan || ''}
                  onChange={(e) => setSoalFormData({ ...soalFormData, pembahasan: e.target.value })}
                  placeholder="Tuliskan pembahasan rujukan SOP resmi, parameter teknis (suhu/waktu/takaran), dan bahaya HACCP jika prosedur diabaikan..."
                  className="input-enterprise text-xs w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Tingkat Kesulitan</label>
                  <ModernOptionSelector
                    value={soalFormData.tingkat_kesulitan}
                    onChange={(val) => setSoalFormData({ ...soalFormData, tingkat_kesulitan: val as any })}
                    options={['Mudah', 'Sedang', 'Sulit']}
                    inlineChips
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Status Soal</label>
                  <ModernOptionSelector
                    value={soalFormData.status_aktif}
                    onChange={(val) => setSoalFormData({ ...soalFormData, status_aktif: val as any })}
                    options={['Aktif', 'Arsip']}
                    inlineChips
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSoalModalOpen(false)}
                  className="btn-secondary-enterprise !py-1.5 !px-3 text-xs"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary-enterprise !py-1.5 !px-4 text-xs font-bold">
                  Simpan Butir Soal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
