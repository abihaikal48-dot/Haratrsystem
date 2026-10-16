import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase, CheckCircle2, Clock, Calendar, Award, Shield, FileText,
  TrendingUp, Users, Search, AlertCircle, ArrowRight, Printer, Sparkles,
  ChevronRight, ExternalLink, Bookmark, CheckSquare, Square, Filter,
  UserCheck, MessageSquare, BarChart3, Activity, Eye, Zap,
  Download, Share2, Info, Building2, User
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { db } from '../lib/storage';
import { TraineeRecord, Outlet, Kru, JobdeskTaskItem, JobdeskFrequency } from '../types';

interface TrainerJobdeskViewProps {
  onNavigate: (tab: NavTab) => void;
  selectedOutletCode: string;
}

// 15 Tugas Spesifik resmi dari dokumen Deskripsi & Spesifikasi Pekerjaan
export const OFFICIAL_JOBDESK_TASKS: JobdeskTaskItem[] = [
  {
    id: 1,
    tugas: 'Melakukan Training Need Analysis (TNA) berdasarkan kebutuhan operasional outlet',
    frekuensi: ['M', 'B'],
    kategori: 'Analisis & Kebutuhan',
    output_standar: 'Dokumen Matriks Gap Kompetensi & Prioritas Tindak Lanjut Cabang',
    indikator_objektif: 'Tersusunnya analisis gap minimal 1x per bulan untuk setiap outlet dampingan dengan skala prioritas jelas.',
    targetNav: 'tna',
  },
  {
    id: 2,
    tugas: 'Memperbarui materi pelatihan sesuai standar perusahaan',
    frekuensi: ['B', 'K'],
    kategori: 'Kurikulum & SOP',
    output_standar: 'Modul Pelatihan, Video/Slide SOP, dan Lembar Kerja Terbaru',
    indikator_objektif: 'Materi ter-update bila ada revisi menu, alat baru, atau instruksi kerja dari Pusat/R&D.',
    targetNav: 'bank-sop',
  },
  {
    id: 3,
    tugas: 'Menyelenggarakan program training onboarding bagi karyawan baru crew outlet',
    frekuensi: ['H', 'M'],
    kategori: 'Pelaksanaan Training',
    output_standar: 'Kru baru memahami Budaya Perusahaan, Hygiene & Sanitasi, serta Jobdesk Dasar',
    indikator_objektif: '100% kru baru mengikuti masa orientasi dan OJT terstruktur sebelum dilepas mandiri.',
    targetNav: 'penugasan-trainer',
  },
  {
    id: 4,
    tugas: 'Melaksanakan pelatihan teknis, pelayanan, dan pengembangan soft skill sesuai jadwal',
    frekuensi: ['H', 'M'],
    kategori: 'Pelaksanaan Training',
    output_standar: 'Sesi Training Teknis (Kitchen, Geprek, Kasir, Helper) & Pelayanan Budaya H.A.R.A',
    indikator_objektif: 'Kesesuaian realisasi jadwal training dengan kalender kerja mencapai minimal 95%.',
    targetNav: 'rencana',
  },
  {
    id: 5,
    tugas: 'Menjadi fasilitator dan instruktur dalam kegiatan pelatihan perusahaan',
    frekuensi: ['H', 'M'],
    kategori: 'Fasilitasi & Instruksi',
    output_standar: 'Penyampaian materi interaktif, demonstrasi langsung, dan roleplay kerja',
    indikator_objektif: 'Tingkat kepuasan peserta (CSAT Training) mencapai skor minimal 88/100.',
    targetNav: 'rencana',
  },
  {
    id: 6,
    tugas: 'Melakukan evaluasi hasil pelatihan melalui pre-test, post-test, observasi, maupun metode evaluasi lainnya',
    frekuensi: ['H', 'M'],
    kategori: 'Evaluasi & Asesmen',
    output_standar: 'Nilai Kognitif Pre/Post-Test & Rapor Nilai 4-Faktor Kru',
    indikator_objektif: 'Rata-rata peningkatan (gain score) kognitif post-test minimal +25 poin dibanding pre-test.',
    targetNav: 'bank-soal',
  },
  {
    id: 7,
    tugas: 'Melakukan monitoring implementasi hasil pelatihan di outlet melalui coaching, observasi, dan follow-up',
    frekuensi: ['H', 'M'],
    kategori: 'Monitoring Lapangan',
    output_standar: 'Log Coaching GROW & Lembar Follow-Up Perilaku Lapangan',
    indikator_objektif: 'Minimal 2 sesi coaching GROW per minggu untuk kru dengan gap kinerja operasional.',
    targetNav: 'coaching',
  },
  {
    id: 8,
    tugas: 'Mengukur efektivitas pelatihan dan behavior change menggunakan indikator yang telah ditetapkan',
    frekuensi: ['B', 'K'],
    kategori: 'Behavior Change',
    output_standar: 'Laporan Kirkpatrick 4-Level (Reaksi, Belajar, Perilaku, Hasil Outlet)',
    indikator_objektif: 'Indeks Perubahan Perilaku (Behavior Change Index) kru pasca-30 hari pelatihan di atas 80%.',
    targetNav: 'kompetensi',
  },
  {
    id: 9,
    tugas: 'Berkoordinasi dengan Area Supervisor, Kepala Outlet, dan departemen terkait dalam pelaksanaan maupun evaluasi pelatihan',
    frekuensi: ['M', 'B'],
    kategori: 'Koordinasi Manajemen',
    output_standar: 'Notulensi Rapat Evaluasi & Keselarasan Program dengan Kebutuhan Cabang',
    indikator_objektif: 'Koordinasi rutin mingguan dengan SPV Area untuk menyelaraskan target audit kualitas.',
    targetNav: 'dashboard',
  },
  {
    id: 10,
    tugas: 'Menyusun laporan pelaksanaan pelatihan, hasil evaluasi, dan rekomendasi pengembangan kompetensi',
    frekuensi: ['M', 'B'],
    kategori: 'Pelaporan Resmi',
    output_standar: 'Laporan Resmi Pelatihan & Pendampingan Outlet Bertanda Tangan Pimpinan',
    indikator_objektif: 'Laporan diserahkan kepada SPV Recruitment & Training tepat waktu setiap akhir periode.',
    targetNav: 'laporan',
  },
  {
    id: 11,
    tugas: 'Mengidentifikasi gap kompetensi karyawan dan memberikan rekomendasi program pengembangan',
    frekuensi: ['M', 'B'],
    kategori: 'Analisis & Kebutuhan',
    output_standar: 'Matriks Gap Skill Kru per Divisi & Rencana Remedial / Refreshment',
    indikator_objektif: 'Seluruh kru berstatus di bawah passing grade (skor <75) mendapatkan program remedial.',
    targetNav: 'gap',
  },
  {
    id: 12,
    tugas: 'Memastikan seluruh dokumen administrasi pelatihan tersusun dengan baik dan terdokumentasi',
    frekuensi: ['H', 'M'],
    kategori: 'Administrasi',
    output_standar: 'Arsip Sertifikat, Berita Acara Ujian, Presensi, dan Lembar Asesmen',
    indikator_objektif: '100% data riwayat pelatihan terintegrasi dalam dossier kru digital tanpa berkas hilang.',
    targetNav: 'master',
  },
  {
    id: 13,
    tugas: 'Mendukung pelaksanaan program pengembangan talenta (talent development) dan suksesi sesuai kebutuhan perusahaan',
    frekuensi: ['B', 'K', 'S'],
    kategori: 'Talent & Suksesi',
    output_standar: 'Talent Pool Kru Potensial (Calon Head Cook, Kasir Utama, Shift Leader)',
    indikator_objektif: 'Tersedianya minimal 2 kandidat suksesi siap promosi untuk setiap posisi kunci outlet.',
    targetNav: 'talent',
  },
  {
    id: 14,
    tugas: 'Melakukan kunjungan rutin ke outlet untuk memastikan standar kerja hasil pelatihan diterapkan secara konsisten',
    frekuensi: ['H', 'M'],
    kategori: 'Monitoring Lapangan',
    output_standar: 'Formulir Audit Observasi Lapangan & Dokumentasi Realita Stasiun Kerja',
    indikator_objektif: 'Kunjungan audit langsung ke outlet minimal 3-4 kali dalam seminggu.',
    targetNav: 'observasi',
  },
  {
    id: 15,
    tugas: 'Membuat laporan perkembangan crew',
    frekuensi: ['M', 'B'],
    kategori: 'Pelaporan Resmi',
    output_standar: 'Rapor Individual Kru & Riwayat Peningkatan Level Keahlian',
    indikator_objektif: 'Setiap kru memiliki rekam jejak progres kompetensi yang di-update berkala.',
    targetNav: 'laporan',
  },
];

// 9 Wewenang Formal Trainer Operasional Cabang
export const OFFICIAL_AUTHORITIES = [
  {
    nomor: 1,
    wewenang: 'Mengusulkan kebutuhan program pelatihan berdasarkan hasil analisis kompetensi',
    lingkup: 'Inisiasi Kurikulum',
    status: 'Otoritas Mandiri',
  },
  {
    nomor: 2,
    wewenang: 'Memberikan rekomendasi metode pelatihan yang paling efektif sesuai kebutuhan operasional',
    lingkup: 'Metodologi & Pedagogi',
    status: 'Otoritas Mandiri',
  },
  {
    nomor: 3,
    wewenang: 'Melakukan observasi dan evaluasi kompetensi karyawan di outlet',
    lingkup: 'Audit Lapangan Langsung',
    status: 'Otoritas Penuh di Outlet',
  },
  {
    nomor: 4,
    wewenang: 'Memberikan coaching, konseling, mentoring dan feedback kepada karyawan maupun atasan langsung terkait hasil observasi',
    lingkup: 'Pembinaan Karakter & Skill',
    status: 'Otoritas Konsultatif',
  },
  {
    nomor: 5,
    wewenang: 'Meminta data atau informasi yang diperlukan untuk pelaksanaan evaluasi pelatihan',
    lingkup: 'Akses Data Operasional',
    status: 'Hak Akses Data Internal',
  },
  {
    nomor: 6,
    wewenang: 'Mengusulkan perbaikan materi pelatihan, SOP, atau metode pembelajaran berdasarkan hasil evaluasi',
    lingkup: 'Standardisasi SOP',
    status: 'Hak Rekomendasi R&D / HR',
  },
  {
    nomor: 7,
    wewenang: 'Merekomendasikan peserta untuk mengikuti pelatihan lanjutan atau program pengembangan tertentu',
    lingkup: 'Pengembangan Talenta',
    status: 'Hak Rekomendasi Promosi',
  },
  {
    nomor: 8,
    wewenang: 'Menghentikan atau menjadwalkan ulang pelatihan apabila terdapat kondisi operasional atau teknis yang tidak memungkinkan pelaksanaan secara efektif',
    lingkup: 'Kontingensi Lapangan',
    status: 'Hak Diskresi Trainer',
  },
  {
    nomor: 9,
    wewenang: 'Menyampaikan rekomendasi kepada HR dan manajemen terkait efektivitas pelatihan serta tindak lanjut yang diperlukan',
    lingkup: 'Eskalasi Eksekutif',
    status: 'Pelaporan Strategis',
  },
];

export const TrainerJobdeskView: React.FC<TrainerJobdeskViewProps> = ({
  onNavigate,
  selectedOutletCode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'matrix' | 'behavior_change' | 'wewenang' | 'dossier'>('matrix');
  const [selectedFreq, setSelectedFreq] = useState<JobdeskFrequency | 'ALL'>('ALL');
  const [taskCheckedState, setTaskCheckedState] = useState<Record<number, boolean>>({});
  const [taskNotes, setTaskNotes] = useState<Record<number, string>>({});
  const [traineeList, setTraineeList] = useState<TraineeRecord[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  // Load Task Checklist State from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hara_trn_jobdesk_checked');
      if (saved) {
        setTaskCheckedState(JSON.parse(saved));
      }
      const savedNotes = localStorage.getItem('hara_trn_jobdesk_notes');
      if (savedNotes) {
        setTaskNotes(JSON.parse(savedNotes));
      }
    } catch (e) {
      console.warn('Could not load jobdesk state', e);
    }
  }, []);

  // Save Task Checklist State
  const toggleTaskCheck = (taskId: number) => {
    setTaskCheckedState((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem('hara_trn_jobdesk_checked', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleUpdateNote = (taskId: number, note: string) => {
    setTaskNotes((prev) => {
      const next = { ...prev, [taskId]: note };
      try {
        localStorage.setItem('hara_trn_jobdesk_notes', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // Load trainee & outlet data
  useEffect(() => {
    const trainees = db.getTable<TraineeRecord>('trainee_outlet') || [];
    setTraineeList(trainees);
    const outletData = db.getTable<Outlet>('outlets') || [];
    setOutlets(outletData);
  }, []);

  // Filter tasks based on frequency tab
  const filteredTasks = useMemo(() => {
    if (selectedFreq === 'ALL') return OFFICIAL_JOBDESK_TASKS;
    return OFFICIAL_JOBDESK_TASKS.filter((t) => t.frekuensi.includes(selectedFreq));
  }, [selectedFreq]);

  // Task Completion Stats
  const completedCount = useMemo(() => {
    return Object.values(taskCheckedState).filter(Boolean).length;
  }, [taskCheckedState]);

  const completionPercentage = Math.round((completedCount / OFFICIAL_JOBDESK_TASKS.length) * 100);

  // Kirkpatrick & Behavior Change Metrics Calculation
  const behaviorMetrics = useMemo(() => {
    const assessed = traineeList.filter((t) => t.skor_akhir !== undefined);
    const totalAssessed = assessed.length || 1;

    let totalTeori = 0;
    let totalPraktik = 0;
    let totalAttitude = 0;
    let totalKetahanan = 0;
    let lulusCount = 0;

    assessed.forEach((t) => {
      totalTeori += (t.skor_teori ?? 80);
      totalPraktik += (t.skor_praktik ?? 82);
      totalAttitude += (t.skor_attitude ?? 85);
      totalKetahanan += (t.skor_ketahanan ?? 80);
      if (t.status_ojt === 'Lulus / Mandiri') lulusCount++;
    });

    const avgTeori = Math.round(totalTeori / totalAssessed);
    const avgPraktik = Math.round(totalPraktik / totalAssessed);
    const avgAttitude = Math.round(totalAttitude / totalAssessed);
    const avgKetahanan = Math.round(totalKetahanan / totalAssessed);
    const passRate = Math.round((lulusCount / totalAssessed) * 100);

    // Level 3: Behavior Change Index (Audit Kebiasaan Kerja & Kepatuhan Prosedur)
    // Dihitung dari kombinasi praktik + attitude + konsistensi status
    const behaviorChangeIndex = Math.min(100, Math.round((avgPraktik * 0.45) + (avgAttitude * 0.35) + (passRate * 0.20)));

    return {
      totalAssessed: assessed.length,
      avgTeori,
      avgPraktik,
      avgAttitude,
      avgKetahanan,
      passRate,
      behaviorChangeIndex,
    };
  }, [traineeList]);

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Official Header */}
      <div className="bg-gradient-to-r from-[#1E1B18] via-[#2A1810] to-[#1E1B18] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-900/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#96171B]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-[#96171B] text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase border border-amber-400/30 shadow-xs flex items-center gap-1.5">
                <Briefcase size={12} />
                <span>OFFICIAL JOBDESK & KPI ENGINE</span>
              </span>
              <span className="bg-white/10 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10">
                No. Dokumen: HC-HRD-TND-001 • Rev 00
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                Divisi: Training & Development
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <span>Pusat Tugas & Panduan Trainer Lapangan</span>
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Pusat operasional tugas, wewenang bimbingan, dan indikator efektivitas Trainer Operasional PT Dayacipta Kemasindo Perkasa (Hara Chicken). Memastikan standardisasi operasional, asesmen objektif 4-faktor, dan pendampingan OJT kru di seluruh cabang.
              </p>
            </div>

            {/* Hierarki Manajemen Resmi */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black shrink-0">
                  <User size={15} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Nama Pemegang Jabatan</div>
                  <div className="text-white font-black">Haikal Abi</div>
                  <div className="text-[10px] text-amber-300 font-bold">Trainer Operasional Cabang</div>
                </div>
              </div>

              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-black shrink-0">
                  <UserCheck size={15} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Atasan Langsung</div>
                  <div className="text-white font-black">Andi Purnawan</div>
                  <div className="text-[10px] text-blue-300">Recruitment & Training SPV</div>
                </div>
              </div>

              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-black shrink-0">
                  <Building2 size={15} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Atasan Tidak Langsung</div>
                  <div className="text-white font-black">Anang Setya Utama</div>
                  <div className="text-[10px] text-purple-300">HRD Manager</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Realization Widget */}
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 shrink-0 flex flex-col items-center text-center w-full lg:w-64">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">
              Realisasi Tugas Jobdesk
            </span>
            <div className="text-4xl font-black text-white my-1">
              {completionPercentage}%
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden my-2">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-[10.5px] text-slate-300 font-medium">
              {completedCount} dari {OFFICIAL_JOBDESK_TASKS.length} Tugas Operasional Aktif
            </span>
            <button
              onClick={handlePrintDocument}
              className="mt-3 w-full py-2 px-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Printer size={13} className="text-[#96171B]" />
              <span>Cetak Format Resmi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'matrix', label: 'Matriks Tugas & Frekuensi', icon: CheckSquare, count: OFFICIAL_JOBDESK_TASKS.length },
            { id: 'behavior_change', label: 'Behavior Change & Kirkpatrick', icon: Activity, badge: 'Objektif' },
            { id: 'wewenang', label: '9 Wewenang Formal', icon: Shield, count: OFFICIAL_AUTHORITIES.length },
            { id: 'dossier', label: 'Spesifikasi & Dokumen HRD', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#96171B] text-white shadow-md shadow-red-950/20'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-bold ${isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-900'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Target Penempatan: <b className="text-slate-800">{selectedOutletCode === 'ALL' ? 'Seluruh Cabang' : `Outlet ${selectedOutletCode}`}</b>
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* TAB 1: MATRIKS TUGAS & FREKUENSI (H, M, B, K, S, T) */}
      {/* ========================================================================================= */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          {/* Frequency Filter Selector */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-black text-slate-700 mr-1 flex items-center gap-1">
                <Filter size={13} className="text-[#96171B]" />
                <span>Frekuensi:</span>
              </span>
              {[
                { key: 'ALL', label: 'Semua Tugas (15)' },
                { key: 'H', label: 'H (Harian)', desc: 'Setiap Hari Kerja' },
                { key: 'M', label: 'M (Mingguan)', desc: 'Setiap Minggu' },
                { key: 'B', label: 'B (Bulanan)', desc: 'Setiap Bulan' },
                { key: 'K', label: 'K (Kuartalan)', desc: 'Per 3 Bulan' },
                { key: 'S', label: 'S (Semesteran)', desc: 'Per 6 Bulan' },
                { key: 'T', label: 'T (Tahunan)', desc: 'Tahunan' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setSelectedFreq(f.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    selectedFreq === f.key
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Menampilkan <b>{filteredTasks.length}</b> butir tugas operasional
            </div>
          </div>

          {/* Task Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              const isChecked = Boolean(taskCheckedState[task.id]);
              const currentNote = taskNotes[task.id] || '';

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isChecked
                      ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTaskCheck(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors"
                        title={isChecked ? 'Tandai Belum' : 'Tandai Selesai'}
                      >
                        {isChecked ? (
                          <CheckSquare size={20} className="text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Square size={20} />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md">
                            Tugas #{task.id}
                          </span>
                          <span className="text-[10px] font-bold text-[#96171B] bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                            {task.kategori}
                          </span>
                          <div className="flex items-center gap-1">
                            {task.frekuensi.map((freq) => (
                              <span
                                key={freq}
                                className={`text-[9.5px] font-black px-1.5 py-0.2 rounded uppercase ${
                                  freq === 'H'
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : freq === 'M'
                                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                    : 'bg-purple-100 text-purple-900 border border-purple-200'
                                }`}
                              >
                                {freq === 'H' ? 'Harian' : freq === 'M' ? 'Mingguan' : freq === 'B' ? 'Bulanan' : freq}
                              </span>
                            ))}
                          </div>
                        </div>

                        <h3 className={`text-sm font-black leading-snug ${isChecked ? 'text-slate-700 line-through' : 'text-slate-900'}`}>
                          {task.tugas}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Standard & KPI Details */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        <Bookmark size={11} className="text-[#96171B]" />
                        <span>Output Standar:</span>
                      </div>
                      <p className="text-slate-800 font-medium leading-relaxed text-[11.5px]">
                        {task.output_standar}
                      </p>
                    </div>

                    <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-black text-amber-800 uppercase tracking-wider">
                        <Zap size={11} className="text-amber-600" />
                        <span>Indikator Kinerja Terukur (KPI):</span>
                      </div>
                      <p className="text-amber-950 font-medium leading-relaxed text-[11.5px]">
                        {task.indikator_objektif}
                      </p>
                    </div>
                  </div>

                  {/* Quick Note & Direct Action Navigation */}
                  <div className="mt-3 pt-2.5 flex items-center justify-between gap-2">
                    <input
                      type="text"
                      placeholder="Catatan pelaksanaan / realisasi..."
                      value={currentNote}
                      onChange={(e) => handleUpdateNote(task.id, e.target.value)}
                      className="flex-1 text-[11px] bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 rounded-lg px-2.5 py-1.5 transition-all text-slate-800"
                    />

                    {task.targetNav && (
                      <button
                        onClick={() => onNavigate(task.targetNav as NavTab)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-[#96171B] text-white rounded-lg text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs"
                        title="Buka Modul Aplikasi Langsung"
                      >
                        <span>Buka Modul</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 2: BEHAVIOR CHANGE & KIRKPATRICK 4-LEVEL EVALUATION ENGINE */}
      {/* ========================================================================================= */}
      {activeSubTab === 'behavior_change' && (
        <div className="space-y-6">
          {/* Executive Overview Banner */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#96171B]/10 text-[#96171B] flex items-center justify-center font-black">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Sistem Evaluasi Objektif & Monitoring Perubahan Perilaku (Behavior Change)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sesuai Tugas #8 Jobdesk: Mengukur retensi pembelajaran, kepatuhan SOP tanpa pengawasan, dan dampak terhadap operasional cabang.
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                Berdasarkan {behaviorMetrics.totalAssessed} Kru Terevaluasi
              </span>
            </div>

            {/* Kirkpatrick 4-Level Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Level 1: Reaksi */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>LEVEL 1 (KIRKPATRICK)</span>
                  <span className="text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded font-black">Reaksi</span>
                </div>
                <div className="text-2xl font-black text-slate-900">94%</div>
                <div className="text-[11px] font-bold text-blue-700 mt-0.5">Kepuasan Materi & Fasilitator</div>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-relaxed">
                  Evaluasi antusiasme, kejelasan instruksi demonstrasi, dan relevansi materi dengan kendala stasiun kerja.
                </p>
              </div>

              {/* Level 2: Pembelajaran */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>LEVEL 2 (KIRKPATRICK)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded font-black">Belajar</span>
                </div>
                <div className="text-2xl font-black text-slate-900">{behaviorMetrics.avgTeori} / 100</div>
                <div className="text-[11px] font-bold text-emerald-700 mt-0.5">Penguasaan Kognitif & SOP</div>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-relaxed">
                  Hasil pre-test & post-test parameter kritis (suhu minyak, rasio tepung, gramasi, waktu tiris, holding time).
                </p>
              </div>

              {/* Level 3: Perubahan Perilaku */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-300 relative overflow-hidden shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-1">
                  <span>LEVEL 3 (KIRKPATRICK)</span>
                  <span className="text-[10px] bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded font-black">Perilaku</span>
                </div>
                <div className="text-2xl font-black text-amber-950">{behaviorMetrics.behaviorChangeIndex}%</div>
                <div className="text-[11px] font-bold text-amber-800 mt-0.5">Indeks Perubahan Perilaku Lapangan</div>
                <p className="text-[10.5px] text-amber-900/80 mt-1 leading-relaxed">
                  Konsistensi eksekusi SOP saat jam sibuk, sanitasi otomatis, dan pencegahan jalan pintas (no shortcuts).
                </p>
              </div>

              {/* Level 4: Dampak Operasional */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>LEVEL 4 (KIRKPATRICK)</span>
                  <span className="text-[10px] bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded font-black">Dampak</span>
                </div>
                <div className="text-2xl font-black text-slate-900">{behaviorMetrics.passRate}%</div>
                <div className="text-[11px] font-bold text-purple-700 mt-0.5">Kemandirian Kru & Zero Defect</div>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-relaxed">
                  Penurunan komplain rasa ayam gosong/mentah, serving time &lt;3 menit, dan efisiensi pemakaian minyak.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Behavior Change Audit Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Indikator Perilaku Kasat Mata (Observable Behaviors) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Eye size={16} className="text-[#96171B]" />
                <span>Indikator Perilaku Kasat Mata (Audit Konsistensi Lapangan)</span>
              </h4>
              <p className="text-xs text-slate-500">
                Item kritis yang diverifikasi Trainer Operasional saat kunjungan pendampingan ke outlet:
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    kategori: 'Hygiene & Sanitasi',
                    indikator: 'Cuci tangan 6 langkah & pemakaian sarung tangan saat memegang produk matang tanpa diingatkan.',
                    status: 'Teraplikasi Konsisten',
                    skor: '96%',
                  },
                  {
                    kategori: 'Deep Frying Kitchen',
                    indikator: 'Pengecekan suhu minyak 165°-175°C dan timer 11-13 menit diaktifkan setiap batch goreng.',
                    status: 'Teraplikasi Konsisten',
                    skor: '92%',
                  },
                  {
                    kategori: 'Kasir & Front of House',
                    indikator: 'Greeting 3S (Senyum, Salam, Sapa) dan konfirmasi ulang pesanan pelanggan saat antrian ramai.',
                    status: 'Teraplikasi Baik',
                    skor: '89%',
                  },
                  {
                    kategori: 'Holding Time & Warmer',
                    indikator: 'Pencatatan jam masak pada display warmer dan penarikan produk setelah melewati batas 90 menit.',
                    status: 'Teraplikasi Baik',
                    skor: '88%',
                  },
                  {
                    kategori: 'Budaya Kerja H.A.R.A',
                    indikator: 'Kerjasama cepat antar stasiun saat rush hour tanpa saling melempar kesalahan, mencerminkan 12 Perilaku Utama.',
                    status: 'Teraplikasi Baik',
                    skor: '91%',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black text-[#96171B] uppercase">{item.kategori}</span>
                      <p className="text-xs font-bold text-slate-800 leading-snug">{item.indikator}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-emerald-700">{item.skor}</div>
                      <span className="text-[9.5px] text-slate-500 font-medium">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 2: Siklus 3-Tahap Perubahan Perilaku (Behavior Habituation) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-600" />
                <span>Roadmap Habituation 30-Hari Pasca-Pelatihan</span>
              </h4>
              <p className="text-xs text-slate-500">
                Alur pendampingan Trainer Operasional untuk mencegah kekambuhan <i>(relapse)</i> kebiasaan lama kru:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-950">Fase 1: Hari 1 - 3 (Shadowing & Micro-Coaching)</span>
                    <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-black">Pendampingan Penuh</span>
                  </div>
                  <p className="text-xs text-blue-900 font-medium leading-relaxed">
                    Trainer mendampingi di samping kru, mengoreksi teknik penepungan dan posisi tubuh secara langsung saat terjadi deviasi langkah.
                  </p>
                </div>

                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-950">Fase 2: Hari 4 - 14 (Controlled Solo Execution)</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-black">Mandiri Non-Peak</span>
                  </div>
                  <p className="text-xs text-amber-900 font-medium leading-relaxed">
                    Kru dilepas mengelola stasiun di jam lengang. Kepala Outlet dan Shift Leader mencatat kepatuhan SOP pembukaan dan penutupan stasiun.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950">Fase 3: Hari 15 - 30 (Rush Hour Certification)</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-black">Uji Jam Sibuk</span>
                  </div>
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                    Ujian audit kecepatan dan ketahanan saat peak hour. Jika lulus tanpa deviasi, kru dinyatakan resmi <b>Mandiri Penuh</b>.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('penugasan-trainer')}
                  className="w-full py-2.5 px-4 bg-[#96171B] hover:bg-[#781014] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Award size={14} />
                  <span>Buka Lembar Penilaian Trainer 4-Faktor & Behavior Change</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 3: 9 WEWENANG FORMAL TRAINER OPERASIONAL */}
      {/* ========================================================================================= */}
      {activeSubTab === 'wewenang' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Shield size={18} className="text-[#96171B]" />
                  <span>Wewenang [7] - Surat Keputusan Jobdesk Trainer Operasional Cabang</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kekuasaan dan hak resmi yang diberikan kepada Trainer Operasional untuk mengambil tindakan dan keputusan profesional di operasional outlet.
                </p>
              </div>
              <span className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full border border-amber-300">
                9 Wewenang Sah
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {OFFICIAL_AUTHORITIES.map((auth) => (
                <div
                  key={auth.nomor}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-full bg-[#96171B] text-white flex items-center justify-center text-xs font-black">
                        {auth.nomor}
                      </span>
                      <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                        {auth.lingkup}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      "{auth.wewenang}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10.5px]">
                    <span className="text-slate-500 font-medium">Status Hak:</span>
                    <span className="font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      {auth.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* TAB 4: DOSSIER SPESIFIKASI PEKERJAAN LENGKAP & CETAK FORMAT RESMI */}
      {/* ========================================================================================= */}
      {activeSubTab === 'dossier' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-300 shadow-md space-y-6 print:p-0 print:border-none print:shadow-none">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[#96171B]" />
              <span className="text-sm font-black text-slate-900">Format Resmi Dokumen HRD PT Dayacipta Kemasindo Perkasa</span>
            </div>
            <button
              onClick={handlePrintDocument}
              className="px-4 py-2 bg-slate-900 hover:bg-[#96171B] text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Printer size={14} />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>

          {/* Official Document Layout */}
          <div className="border border-slate-400 rounded-xl overflow-hidden text-xs text-slate-900 font-sans">
            {/* Document Header Table */}
            <div className="grid grid-cols-12 border-b border-slate-400">
              <div className="col-span-3 p-3 border-r border-slate-400 flex flex-col items-center justify-center text-center bg-slate-50">
                <div className="font-black text-base text-[#96171B] tracking-wider">HARA CHICKEN</div>
                <div className="text-[9px] text-slate-600 font-bold mt-0.5">PT Dayacipta Kemasindo Perkasa</div>
              </div>
              <div className="col-span-6 p-3 border-r border-slate-400 flex items-center justify-center text-center">
                <h2 className="font-black text-sm uppercase tracking-wide">
                  DESKRIPSI & SPESIFIKASI PEKERJAAN [1]
                </h2>
              </div>
              <div className="col-span-3 p-2 text-[10px] space-y-0.5 bg-slate-50">
                <div>No. Dokumen: <b>HC-HRD-TND-001</b></div>
                <div>Revisi Ke-: <b>00</b></div>
                <div>Berlaku Sejak: <b>2026</b></div>
                <div>Deskripsi Perubahan: <b>-</b></div>
              </div>
            </div>

            {/* Section 2: Detail Jabatan */}
            <div className="bg-slate-200 p-1.5 font-black text-center uppercase tracking-wider text-[11px] border-b border-slate-400">
              Detail Jabatan [2]
            </div>

            <div className="grid grid-cols-12 divide-y divide-slate-300">
              <div className="col-span-4 p-2 font-bold bg-slate-50 border-r border-slate-300">Nama Jabatan</div>
              <div className="col-span-8 p-2 font-black text-[#96171B]">Trainer Operasional Cabang</div>

              <div className="col-span-4 p-2 font-bold bg-slate-50 border-r border-slate-300">Atasan Langsung</div>
              <div className="col-span-8 p-2 font-bold">Recruitment & Training SPV (Andi Purnawan)</div>

              <div className="col-span-4 p-2 font-bold bg-slate-50 border-r border-slate-300">Atasan Tidak Langsung</div>
              <div className="col-span-8 p-2 font-bold">HRD Manager (Anang Setya Utama)</div>

              <div className="col-span-4 p-2 font-bold bg-slate-50 border-r border-slate-300">Departemen / Divisi</div>
              <div className="col-span-8 p-2 font-bold">HRD / Rekrutmen dan Training (Sub Divisi: Training & Operasional)</div>

              <div className="col-span-4 p-2 font-bold bg-slate-50 border-r border-slate-300">Hubungan Kerja</div>
              <div className="col-span-8 p-2 space-y-0.5">
                <div>• <b>Internal:</b> Recruitment & Training Staff, HRD Team</div>
                <div>• <b>Eksternal:</b> GA, Personalia, Comben, Area Supervisor, Kepala Outlet</div>
              </div>
            </div>

            {/* Section 3: Fungsi */}
            <div className="bg-slate-200 p-1.5 font-black text-center uppercase tracking-wider text-[11px] border-y border-slate-400">
              Fungsi [3]
            </div>
            <div className="p-3 bg-white leading-relaxed text-justify border-b border-slate-400">
              Menganalisis kebutuhan lapangan, membimbing teknis stasiun kerja, memfasilitasi OJT kru baru, dan mengevaluasi program pelatihan bagi karyawan outlet untuk meningkatkan kompetensi, memastikan standar operasional diterapkan secara konsisten, serta melakukan monitoring terhadap perubahan perilaku <i>(behavior change)</i> sebagai hasil dari proses pendampingan guna mendukung peningkatan kinerja operasional outlet.
            </div>

            {/* Section 4: Tanggung Jawab */}
            <div className="bg-slate-200 p-1.5 font-black text-center uppercase tracking-wider text-[11px] border-b border-slate-400">
              Tanggung Jawab [4]
            </div>
            <div className="p-3 bg-white leading-relaxed text-justify border-b border-slate-400">
              Bertanggung jawab atas pelaksanaan program bimbingan dan pelatihan kru outlet mulai dari identifikasi kebutuhan pelatihan, pelaksanaan training teknis stasiun kerja, evaluasi efektivitas pelatihan, hingga monitoring implementasi hasil pelatihan di lapangan agar kompetensi, perilaku kerja, dan standar pelayanan sesuai dengan ketentuan SOP Hara Chicken.
            </div>

            {/* Section 5: Persyaratan Jabatan */}
            <div className="bg-slate-200 p-1.5 font-black text-center uppercase tracking-wider text-[11px] border-b border-slate-400">
              Persyaratan Jabatan [8]
            </div>
            <div className="grid grid-cols-12 divide-y divide-slate-300 border-b border-slate-400">
              <div className="col-span-4 p-2 font-bold bg-slate-50 border-r border-slate-300">1. Kualifikasi</div>
              <div className="col-span-8 p-2 space-y-1">
                <div>• <b>Pendidikan:</b> Minimal SMA/K sederajat</div>
                <div>• <b>Pengalaman Kerja:</b> Minimal 1–2 tahun di outlet FnB (posisi leader diutamakan)</div>
                <div>• <b>Pelatihan:</b> TNA, ToT, Public speaking, presentasi</div>
              </div>

              <div className="col-span-4 p-2 font-bold bg-slate-50 border-r border-slate-300">2. Kompetensi Khusus</div>
              <div className="col-span-8 p-2 font-medium">
                Komunikasi Efektif, Training & Facilitation, Coaching & Feedback, Analytical Thinking, Monitoring & Evaluasi Perubahan Perilaku (Behavior Change).
              </div>
            </div>

            {/* Section 6: Approval Box */}
            <div className="grid grid-cols-4 divide-x divide-slate-400 text-center text-xs">
              <div className="p-3 space-y-10">
                <span className="font-bold text-slate-500">Dibuat oleh:</span>
                <div>
                  <div className="font-black text-slate-900 underline">Andi Purnawan</div>
                  <div className="text-[10px] text-slate-600 font-medium">Recruitment & Training SPV</div>
                  <div className="text-[9.5px] text-slate-400">Tanggal: 2026</div>
                </div>
              </div>

              <div className="p-3 space-y-10">
                <span className="font-bold text-slate-500">Disetujui oleh:</span>
                <div>
                  <div className="font-black text-slate-900 underline">Anang Setya Utama</div>
                  <div className="text-[10px] text-slate-600 font-medium">HRD Manager</div>
                  <div className="text-[9.5px] text-slate-400">Tanggal: 2026</div>
                </div>
              </div>

              <div className="p-3 space-y-10">
                <span className="font-bold text-slate-500">Disetujui oleh:</span>
                <div>
                  <div className="font-black text-slate-900 underline">Operational Area Manager</div>
                  <div className="text-[10px] text-slate-600 font-medium">Operasional Lapangan</div>
                  <div className="text-[9.5px] text-slate-400">Tanggal: 2026</div>
                </div>
              </div>

              <div className="p-3 space-y-10 bg-amber-50/40">
                <span className="font-bold text-amber-900">Diterima oleh, [9]:</span>
                <div>
                  <div className="font-black text-slate-900 underline">Haikal Abi</div>
                  <div className="text-[10px] text-slate-600 font-medium">Trainer Operasional Cabang</div>
                  <div className="text-[9.5px] text-slate-400">Tanggal: 2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
