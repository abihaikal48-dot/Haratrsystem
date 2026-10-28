import React, { useState, useMemo, useEffect } from 'react';
import {
  Brain, Shield, Award, CheckCircle2, Clock, Search, Filter,
  ChevronRight, ArrowRight, UserCheck, BarChart3, AlertCircle, AlertTriangle, ShieldCheck,
  Settings, Sliders, Check, Copy, Printer, Eye, MessageSquare,
  FileText, Sparkles, RefreshCw, X, ShieldAlert, Award as AwardIcon,
  Flame, UtensilsCrossed, Scale, Star, ThumbsUp, Send, CheckSquare,
  Target, Compass, HelpCircle, ListChecks, ArrowUpRight, Download
} from 'lucide-react';
import { db } from '../../lib/storage';
import {
  HasilUjianKruMingguan, ExamWeek, Division, Outlet,
  TrainerExamConfig, Kru, PilarKompetensi
} from '../../types';
import {
  BANK_SOAL_MINGGUAN,
  getSoalUjianByMinggu,
  hitungProfilPsikologis,
  hitungAnalisisPilar,
  AnalisisPilarHasil,
  ProfilKarakterEvaluasi
} from '../../data/bankSoalMingguan';
import { ChickenIcon, CashierIcon, ChiliIcon, BroomCleanIcon } from '../ui/Icons';

interface CrewExamResultsViewerProps {
  selectedOutletCode?: string;
  onOpenExamPublicView?: () => void;
}

export const CrewExamResultsViewer: React.FC<CrewExamResultsViewerProps> = ({
  selectedOutletCode = 'ALL',
  onOpenExamPublicView,
}) => {
  // Master Exam Records from storage
  const [examResults, setExamResults] = useState<HasilUjianKruMingguan[]>(() =>
    db.getHasilUjianMingguan()
  );
  const [examConfig, setExamConfig] = useState<TrainerExamConfig>(() =>
    db.getExamConfig()
  );

  const outlets = useMemo(() => db.getOutlets(), []);
  const allKru = useMemo(() => db.getTable<Kru>('kru'), []);

  // Filter States
  const [filterOutlet, setFilterOutlet] = useState<string>(selectedOutletCode);
  const [filterDivision, setFilterDivision] = useState<string>('ALL');
  const [filterWeek, setFilterWeek] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Selected Detail Modal & Tabs
  const [selectedRecord, setSelectedRecord] = useState<HasilUjianKruMingguan | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'radar' | 'jawaban' | 'psikologi'>('radar');
  const [essayGrades, setEssayGrades] = useState<Record<string, { skor: number; komentar: string }>>({});
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Trainer Feedback Form in Detail Modal
  const [trainerNoteInput, setTrainerNoteInput] = useState<string>('');
  const [essayScoreAdjust, setEssayScoreAdjust] = useState<number>(0);
  const [copiedDetail, setCopiedDetail] = useState<boolean>(false);

  // Config Form Draft
  const [configDraft, setConfigDraft] = useState<TrainerExamConfig>(examConfig);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const reloadData = () => {
    setExamResults(db.getHasilUjianMingguan());
    const cfg = db.getExamConfig();
    setExamConfig(cfg);
    setConfigDraft(cfg);
  };

  useEffect(() => {
    reloadData();
    const unsub = db.subscribe('*', reloadData);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (selectedOutletCode) {
      setFilterOutlet(selectedOutletCode);
    }
  }, [selectedOutletCode]);

  // Handle Save Exam Configuration
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveExamConfig(configDraft);
    setExamConfig(configDraft);
    setIsConfigDrawerOpen(false);
    showToast('Konfigurasi paket ujian mandiri berhasil disimpan!');
  };

  // Open Record Detail
  const handleOpenDetail = (record: HasilUjianKruMingguan) => {
    setSelectedRecord(record);
    setTrainerNoteInput(record.catatan_trainer || '');
    setEssayScoreAdjust(record.skor_essay);
    setEssayGrades(record.penilaian_essay || {});
    setActiveModalTab('radar');
  };

  // Save Adjusted Trainer Note / Score
  const handleSaveRecordReview = () => {
    if (!selectedRecord) return;
    const skorAkhir = Math.round((selectedRecord.skor_pilihan_ganda * 0.6) + (essayScoreAdjust * 0.4));
    const passed = skorAkhir >= examConfig.passing_grade;

    const updated: HasilUjianKruMingguan = {
      ...selectedRecord,
      skor_essay: essayScoreAdjust,
      skor_akhir_komposit: skorAkhir,
      status_kelulusan: passed ? 'Lulus Kompeten' : 'Remedial Terbimbing',
      penilaian_essay: essayGrades,
      sudah_dinilai_trainer: true,
      catatan_trainer: trainerNoteInput,
    };

    db.saveHasilUjianMingguan(updated);
    setSelectedRecord(updated);
    reloadData();
    showToast('Penilaian, koreksi essay, dan catatan trainer berhasil disimpan!');
  };

  // Ekspor Data Ujian & Karakter Kru ke CSV
  const handleExportCSV = () => {
    if (examResults.length === 0) {
      showToast('Belum ada data hasil ujian untuk diekspor.');
      return;
    }
    const headers = [
      'ID Sesi', 'Tanggal', 'Nama Kru', 'Kode Outlet', 'Stasiun / Divisi', 'Paket Minggu',
      'Skor PG (60%)', 'Skor Essay (40%)', 'Skor Komposit', 'Status Kelulusan', 'Frekuensi Pindah Tab',
      'Integritas (%)', 'Ketahanan Stres (%)', 'Fokus Layanan (%)', 'Disiplin SOP (%)', 'Kerjasama Tim (%)',
      'Tipe Karakter Kerja', 'Pilar Kritis Terendah'
    ];
    const rows = examResults.map((r) => [
      r.id,
      new Date(r.tanggal).toLocaleDateString('id-ID'),
      `"${r.nama_kru.replace(/"/g, '""')}"`,
      r.kode_outlet,
      r.divisi,
      `Minggu ke-${r.mingguNomor}`,
      r.skor_pilihan_ganda,
      r.skor_essay,
      r.skor_akhir_komposit,
      r.status_kelulusan,
      r.jumlah_pindah_tab || 0,
      r.profil_psikologis?.integritas ?? '-',
      r.profil_psikologis?.ketahanan_stres ?? '-',
      r.profil_psikologis?.fokus_pelanggan ?? '-',
      r.profil_psikologis?.disiplin_sop ?? '-',
      r.profil_psikologis?.kerjasama_tim ?? '-',
      `"${(r.profil_psikologis?.tipe_kepribadian_kerja || '').replace(/"/g, '""')}"`,
      `"${(r.analisis_pilar?.pilar_terendah || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hasil_Evaluasi_Kru_HARA_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('File CSV data evaluasi & karakter ujian berhasil diunduh!');
  };

  // Copy Detail to WhatsApp
  const handleCopyRecordDetail = () => {
    if (!selectedRecord) return;
    const prof = selectedRecord.profil_psikologis;
    const questions = getSoalUjianByMinggu(selectedRecord.minggu, selectedRecord.divisi);
    const pilar = selectedRecord.analisis_pilar || hitungAnalisisPilar(selectedRecord.jawaban_kru || {}, questions);

    const modulesText = pilar.materi_rekomendasi && pilar.materi_rekomendasi.length > 0
      ? pilar.materi_rekomendasi.map((m, idx) => `  ${idx + 1}. ${m}`).join('\n')
      : '  1. Review SOP Standar Stasiun';

    const text =
      `*LAPORAN HASIL EVALUASI UJIAN KRU HARA CHICKEN*\n` +
      `-----------------------------------------\n` +
      `Nama Kru: ${selectedRecord.nama_kru}\n` +
      `Outlet: ${selectedRecord.nama_outlet || selectedRecord.kode_outlet}\n` +
      `Stasiun Kerja: ${selectedRecord.divisi}\n` +
      `Paket Ujian: ${selectedRecord.minggu} (Minggu ke-${selectedRecord.mingguNomor})\n` +
      `Tanggal: ${new Date(selectedRecord.tanggal).toLocaleDateString('id-ID')}\n\n` +
      `SKOR EVALUASI:\n` +
      `- Pilihan Ganda: ${selectedRecord.skor_pilihan_ganda}/100\n` +
      `- Essay HOTS: ${selectedRecord.skor_essay}/100\n` +
      `- Skor Akhir Komposit: *${selectedRecord.skor_akhir_komposit}/100*\n` +
      `- Status Kelulusan: *${selectedRecord.status_kelulusan.toUpperCase()}*\n\n` +
      `RADAR 4 PILAR KOMPETENSI:\n` +
      `- SOP Jobdesk & Teknis: ${pilar.sop_jobdesk}%\n` +
      `- Peraturan Perusahaan & Kas: ${pilar.peraturan_perusahaan}%\n` +
      `- Karakter & Integritas: ${pilar.karakter_integritas}%\n` +
      `- Visi & Misi Budaya H.A.R.A: ${pilar.visi_misi_hara}%\n` +
      `*Pilar Prioritas Bimbingan: ${pilar.pilar_terendah}*\n\n` +
      `REKOMENDASI COACHING PERSONAL TRAINER:\n` +
      `"${pilar.rekomendasi_coaching}"\n\n` +
      `REKOMENDASI MATERI DRILL:\n` +
      `${modulesText}\n\n` +
      `PROFIL KARAKTER KERJA:\n` +
      `- Tipe: *${prof?.tipe_kepribadian_kerja || 'Pilar Disiplin'}*\n` +
      `- Integritas Kas: ${prof?.integritas || 85}%\n` +
      `- Ketahanan Stres: ${prof?.ketahanan_stres || 85}%\n\n` +
      `Catatan Trainer: ${selectedRecord.catatan_trainer || 'Standar kompetensi terpenuhi.'}`;

    navigator.clipboard.writeText(text);
    setCopiedDetail(true);
    setTimeout(() => setCopiedDetail(false), 2500);
  };

  // Filtered Results
  const filteredResults = useMemo(() => {
    return examResults.filter((r) => {
      if (filterOutlet !== 'ALL' && r.kode_outlet !== filterOutlet) return false;
      if (filterDivision !== 'ALL' && r.divisi !== filterDivision) return false;
      if (filterWeek !== 'ALL' && r.minggu !== filterWeek) return false;
      if (filterStatus !== 'ALL') {
        if (filterStatus === 'LULUS' && r.status_kelulusan !== 'Lulus Kompeten') return false;
        if (filterStatus === 'REMEDIAL' && r.status_kelulusan !== 'Remedial Terbimbing') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.nama_kru.toLowerCase().includes(q) ||
          r.kode_outlet.toLowerCase().includes(q) ||
          (r.nama_outlet && r.nama_outlet.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [examResults, filterOutlet, filterDivision, filterWeek, filterStatus, searchQuery]);

  // Analytics Metrics
  const stats = useMemo(() => {
    const total = filteredResults.length;
    const lulus = filteredResults.filter((r) => r.status_kelulusan === 'Lulus Kompeten').length;
    const passRate = total > 0 ? Math.round((lulus / total) * 100) : 0;
    const avgScore = total > 0
      ? Math.round(filteredResults.reduce((acc, r) => acc + r.skor_akhir_komposit, 0) / total)
      : 0;

    // Dominant Trait Count
    const traitCount: Record<string, number> = {};
    filteredResults.forEach((r) => {
      const type = r.profil_psikologis?.tipe_kepribadian_kerja || 'Pilar Disiplin & Pelaksana Teliti';
      traitCount[type] = (traitCount[type] || 0) + 1;
    });

    let dominantTrait = 'Pilar Disiplin & Pelaksana Teliti';
    let maxCount = 0;
    Object.entries(traitCount).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantTrait = type;
      }
    });

    return { total, lulus, passRate, avgScore, dominantTrait };
  }, [filteredResults]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* =========================================================================
          1. HEADER & TRAINER CONTROL CENTER BAR
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#8B1418] border border-red-200 text-[10.5px] font-bold font-mono">
              PUSAT EVALUASI KRU MANDIRI
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} />
              Bebas Login & Bebas PIN
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1.5 tracking-tight">
            Hasil Ujian SOP Mingguan & Radar Karakteristik Kru
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-2xl">
            Trainer menentukan paket ujian aktif secara otomatis. Sistem mengoreksi pilihan ganda dan essay HOTS secara mandiri serta memetakan 5 dimensi psikologis kerja kru.
          </p>
        </div>

        {/* Quick Trainer Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Status Mode Ujian Saat Ini */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-left">
            <div className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              STATUS PAKET AKTIF
            </div>
            <div className="text-xs font-bold text-[#8B1418] flex items-center gap-1">
              <span>
                {examConfig.mode === 'otomatis_ojt'
                  ? 'Otomatis Ikut OJT Kru'
                  : examConfig.mode === 'kunci_paket'
                  ? `Kunci: ${examConfig.paket_terkunci || 'Minggu 2'}`
                  : 'Mode Bebas Kru'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsConfigDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Sliders size={14} className="text-slate-600" />
            <span>Atur Paket Ujian</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Unduh seluruh rekap nilai, pelanggaran tab, dan profil kepribadian kru"
          >
            <Download size={14} className="text-emerald-700" />
            <span>Ekspor CSV</span>
          </button>

          {onOpenExamPublicView && (
            <button
              type="button"
              onClick={onOpenExamPublicView}
              className="px-4 py-2 rounded-xl bg-[#8B1418] hover:bg-[#720e12] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Brain size={14} />
              <span>Buka Portal Ujian Kru</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. METRIC CARDS (ANALYTICS EXECUTIVE SUMMARY)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            TOTAL KRU DIUJI
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {stats.total} <span className="text-xs text-slate-400 font-sans font-normal">Sesi</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tercatat di sistem</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            TINGKAT KELULUSAN
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {stats.passRate}%
          </div>
          <div className="text-[11px] text-emerald-800 font-medium mt-1">
            {stats.lulus} dari {stats.total} kru kompeten
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            RATA-RATA KOMPOSIT
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {stats.avgScore} <span className="text-xs text-slate-400 font-sans font-normal">/ 100</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Passing Grade: {examConfig.passing_grade} Poin</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            KARAKTER DOMINAN
          </div>
          <div className="text-xs font-bold text-purple-900 truncate mt-2">
            {stats.dominantTrait}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Hasil asesmen psikologi</div>
        </div>
      </div>

      {/* =========================================================================
          3. FILTER BAR & SEARCH CONTROLS
          ========================================================================= */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Outlet */}
          <select
            value={filterOutlet}
            onChange={(e) => setFilterOutlet(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#8B1418]"
          >
            <option value="ALL">Semua Outlet</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.kode_outlet}>
                {o.kode_outlet} — {o.nama_outlet}
              </option>
            ))}
          </select>

          {/* Filter Divisi */}
          <select
            value={filterDivision}
            onChange={(e) => setFilterDivision(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#8B1418]"
          >
            <option value="ALL">Semua Stasiun</option>
            <option value="Kitchen">Kitchen & Fryer</option>
            <option value="Kasir">Kasir & POS ESB</option>
            <option value="Geprek">Geprek & Sambal</option>
            <option value="Helper">Helper & Bahan</option>
          </select>

          {/* Filter Minggu */}
          <select
            value={filterWeek}
            onChange={(e) => setFilterWeek(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#8B1418]"
          >
            <option value="ALL">Semua Minggu</option>
            <option value="MINGGU_1">Minggu 1 (Fondasi & Psikologi)</option>
            <option value="MINGGU_2">Minggu 2 (SOP Teknis & POS ESB)</option>
            <option value="MINGGU_3">Minggu 3 (HOTS & Kasus)</option>
            <option value="MINGGU_4">Minggu 4 (Gate 4 Solo Shift)</option>
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#8B1418]"
          >
            <option value="ALL">Semua Status</option>
            <option value="LULUS">Lulus Kompeten</option>
            <option value="REMEDIAL">Remedial Terbimbing</option>
          </select>
        </div>

        {/* Search Kru */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kru / outlet..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#8B1418]"
          />
          <Search size={14} className="absolute left-2.5 top-2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* =========================================================================
          4. TABLE HASIL UJIAN & PEMETAAN KARAKTER KRU
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Nama Kru & Outlet</th>
                <th className="py-3 px-3">Stasiun</th>
                <th className="py-3 px-3">Paket Ujian</th>
                <th className="py-3 px-3">Skor PG</th>
                <th className="py-3 px-3">Skor Essay</th>
                <th className="py-3 px-3">Komposit</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Profil Karakteristik Psikologis</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Brain size={32} className="mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-600">Belum ada data ujian yang sesuai</p>
                      <p className="text-[11px] text-slate-400">
                        Hasil pengerjaan mandiri kru akan otomatis tampil di sini secara real-time.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResults.map((r) => {
                  const prof = r.profil_psikologis;
                  const isPassed = r.status_kelulusan === 'Lulus Kompeten';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Kru & Outlet */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{r.nama_kru}</span>
                          {r.jumlah_pindah_tab !== undefined && r.jumlah_pindah_tab > 0 && (
                            <span className="text-[9.5px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded font-mono" title={`${r.jumlah_pindah_tab}x berpindah tab/layar saat ujian`}>
                              ⚠️ {r.jumlah_pindah_tab}x Tab
                            </span>
                          )}
                        </div>
                        <div className="text-[10.5px] text-slate-500 font-mono">
                          {r.nama_outlet || r.kode_outlet} • {new Date(r.tanggal).toLocaleDateString('id-ID')}
                        </div>
                      </td>

                      {/* Stasiun */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {r.divisi}
                        </span>
                      </td>

                      {/* Paket Ujian */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 text-[11px]">
                        Minggu ke-{r.mingguNomor}
                      </td>

                      {/* Skor PG */}
                      <td className="py-3 px-3 font-mono text-slate-700 font-semibold">
                        {r.skor_pilihan_ganda}
                      </td>

                      {/* Skor Essay */}
                      <td className="py-3 px-3 font-mono text-slate-700 font-semibold">
                        {r.skor_essay}
                      </td>

                      {/* Skor Komposit */}
                      <td className="py-3 px-3">
                        <span className={`font-mono font-bold text-sm ${
                          isPassed ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {r.skor_akhir_komposit}
                        </span>
                      </td>

                      {/* Status Kelulusan */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          isPassed
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isPassed ? 'bg-emerald-600' : 'bg-red-600'}`} />
                          {isPassed ? 'Lulus' : 'Remedial'}
                        </span>
                      </td>

                      {/* Profil Karakteristik & Radar 4 Pilar */}
                      <td className="py-3 px-4">
                        {(() => {
                          const questions = getSoalUjianByMinggu(r.minggu, r.divisi);
                          const pilar = r.analisis_pilar || hitungAnalisisPilar(r.jawaban_kru || {}, questions);

                          return (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {prof && (
                                  <span className="font-bold text-[11px] text-purple-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md inline-block">
                                    {prof.tipe_kepribadian_kerja}
                                  </span>
                                )}
                                <span className="text-[10px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 font-mono">
                                  <Target size={11} className="text-amber-700" />
                                  Pilar Kritis: {pilar.pilar_terendah.split(' ')[0]}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                                <span title="SOP Jobdesk & Teknis">SOP: <b className="text-[#8B1418]">{pilar.sop_jobdesk}%</b></span>
                                <span>•</span>
                                <span title="Peraturan Perusahaan & Kas">Reg: <b className="text-blue-700">{pilar.peraturan_perusahaan}%</b></span>
                                <span>•</span>
                                <span title="Karakter & Integritas">Etika: <b className="text-purple-700">{pilar.karakter_integritas}%</b></span>
                                <span>•</span>
                                <span title="Visi Misi H.A.R.A">Visi: <b className="text-emerald-700">{pilar.visi_misi_hara}%</b></span>
                              </div>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(r)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Audit & Radar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          5. DRAWER / MODAL: PENGATURAN PAKET UJIAN OTOMATIS (TRAINER CONTROL)
          ========================================================================= */}
      {isConfigDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#8B1418] flex items-center justify-center">
                  <Sliders size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Konfigurasi Otomatisasi Paket Ujian Kru
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tentukan bagaimana sistem menyajikan paket soal kepada kru outlet
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kebijakan Penentuan Paket Ujian:
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'otomatis_ojt' as const,
                      judul: 'Otomatis Mengikuti Minggu OJT Kru (Direkomendasikan)',
                      desc: 'Sistem otomatis menyajikan paket berdasarkan kohort hari onboarding kru (Hari 1-7: M1, 8-14: M2, 15-21: M3, 22-30: M4).',
                    },
                    {
                      id: 'kunci_paket' as const,
                      judul: 'Kunci ke Satu Paket Serentak',
                      desc: 'Seluruh kru yang membuka portal akan otomatis terkunci pada paket yang ditentukan oleh trainer di bawah.',
                    },
                    {
                      id: 'bebas' as const,
                      judul: 'Mode Bebas (Kru Memilih Sendiri)',
                      desc: 'Kru outlet dapat memilih secara bebas tingkatan minggu ujian yang ingin dikerjakan.',
                    },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        configDraft.mode === m.id
                          ? 'border-[#8B1418] bg-rose-50/30 ring-1 ring-[#8B1418]'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="examMode"
                        checked={configDraft.mode === m.id}
                        onChange={() => setConfigDraft({ ...configDraft, mode: m.id })}
                        className="mt-0.5 text-[#8B1418] focus:ring-[#8B1418]"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-slate-900">{m.judul}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{m.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {configDraft.mode === 'kunci_paket' && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pilih Paket yang Dikunci:
                  </label>
                  <select
                    value={configDraft.paket_terkunci || 'MINGGU_2'}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, paket_terkunci: e.target.value as ExamWeek })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                  >
                    <option value="MINGGU_1">Minggu 1: Fondasi Visi Misi & Karakteristik Psikologis</option>
                    <option value="MINGGU_2">Minggu 2: SOP Teknis Stasiun & SOP/FAT/44 POS ESB</option>
                    <option value="MINGGU_3">Minggu 3: HOTS & Analisis Kasus Kritis</option>
                    <option value="MINGGU_4">Minggu 4: Sertifikasi Komprehensif Gate 4 Solo Shift</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Timer per Soal (Detik)
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={300}
                    value={configDraft.durasi_per_soal_detik ?? 90}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, durasi_per_soal_detik: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                    placeholder="90 detik"
                  />
                  <span className="text-[10px] text-slate-500">Hitung mundur tiap butir</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Durasi (Menit)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={configDraft.durasi_menit}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, durasi_menit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                  />
                  <span className="text-[10px] text-slate-500">Batas total ujian</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Passing Grade (Poin)
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={configDraft.passing_grade}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, passing_grade: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                  />
                  <span className="text-[10px] text-slate-500">Ambang batas lulus</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pesan Arahan Trainer untuk Kru (Tampil di Lembar Ujian):
                </label>
                <textarea
                  rows={2}
                  value={configDraft.pesan_trainer || ''}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, pesan_trainer: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfigDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B1418] hover:bg-[#720e12] text-white text-xs font-bold shadow-xs"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL: AUDIT DETAIL HASIL, RADAR 4 PILAR & REKOMENDASI COACHING
          ========================================================================= */}
      {selectedRecord && (() => {
        const questions = getSoalUjianByMinggu(selectedRecord.minggu, selectedRecord.divisi);
        const pilar = selectedRecord.analisis_pilar || hitungAnalisisPilar(selectedRecord.jawaban_kru || {}, questions);
        const essayQuestions = questions.filter(q => q.tipe === 'ESSAY_HOTS');

        // Sumbu radar coordinates
        const cx = 150;
        const cy = 150;
        const R = 90;
        const cSop = Math.max(15, Math.min(100, pilar.sop_jobdesk));
        const cPeraturan = Math.max(15, Math.min(100, pilar.peraturan_perusahaan));
        const cVisi = Math.max(15, Math.min(100, pilar.visi_misi_hara));
        const cKarakter = Math.max(15, Math.min(100, pilar.karakter_integritas));

        const pTop = { x: cx, y: cy - (cSop / 100) * R };
        const pRight = { x: cx + (cPeraturan / 100) * R, y: cy };
        const pBottom = { x: cx, y: cy + (cVisi / 100) * R };
        const pLeft = { x: cx - (cKarakter / 100) * R, y: cy };
        const polyPoints = `${pTop.x},${pTop.y} ${pRight.x},${pRight.y} ${pBottom.x},${pBottom.y} ${pLeft.x},${pLeft.y}`;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full p-5 sm:p-7 shadow-2xl animate-in zoom-in-95 space-y-5 my-auto max-h-[92vh] overflow-y-auto">
              
              {/* Header Detail */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-mono">
                      AUDIT KOMPETENSI KRU RESMI
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-mono font-bold text-slate-700">{selectedRecord.minggu} (Minggu {selectedRecord.mingguNomor})</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedRecord.nama_kru} — <span className="text-[#8B1418]">{selectedRecord.divisi}</span>
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <p className="text-xs text-slate-500 font-mono">
                      {selectedRecord.nama_outlet || selectedRecord.kode_outlet} • Tanggal: {new Date(selectedRecord.tanggal).toLocaleString('id-ID')}
                    </p>
                    {selectedRecord.jumlah_pindah_tab !== undefined && selectedRecord.jumlah_pindah_tab > 0 ? (
                      <span className="text-[10px] font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                        <AlertTriangle size={11} className="text-red-700" />
                        Terdeteksi {selectedRecord.jumlah_pindah_tab}x Pindah Tab/Layar
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                        <ShieldCheck size={11} className="text-emerald-700" />
                        Integritas Layar 100% Bersih
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyRecordDetail}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedDetail ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copiedDetail ? 'Tersalin' : 'Salin Laporan WA'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveModalTab('radar')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeModalTab === 'radar'
                      ? 'bg-white text-[#8B1418] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Target size={14} />
                  <span>Radar 4 Pilar & Rekomendasi Coaching</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab('jawaban')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeModalTab === 'jawaban'
                      ? 'bg-white text-[#8B1418] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListChecks size={14} />
                  <span>Audit Lembar Jawaban ({questions.length} Soal)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalTab('psikologi')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeModalTab === 'psikologi'
                      ? 'bg-white text-[#8B1418] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Brain size={14} />
                  <span>Profil Psikologis Kerja</span>
                </button>
              </div>

              {/* Score Metric Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">
                    PILIHAN GANDA (60%)
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {selectedRecord.skor_pilihan_ganda} <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase font-mono flex items-center justify-between">
                    <span>ESSAY HOTS (40%)</span>
                    {selectedRecord.sudah_dinilai_trainer && (
                      <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Dinilai Trainer</span>
                    )}
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                    {selectedRecord.skor_essay} <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${
                  selectedRecord.skor_akhir_komposit >= examConfig.passing_grade
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-red-50/50 border-red-200'
                }`}>
                  <div className="text-[10px] font-bold text-slate-500 uppercase font-mono">
                    KOMPOSIT AKHIR
                  </div>
                  <div className={`text-xl font-bold font-mono mt-0.5 ${
                    selectedRecord.skor_akhir_komposit >= examConfig.passing_grade
                      ? 'text-emerald-700'
                      : 'text-red-700'
                  }`}>
                    {selectedRecord.skor_akhir_komposit} <span className="text-xs text-slate-400">/ 100</span>
                    <span className="text-[10.5px] font-sans font-bold ml-2">
                      ({selectedRecord.status_kelulusan})
                    </span>
                  </div>
                </div>
              </div>

              {/* =========================================================================
                  TAB 1: RADAR 4 PILAR KOMPETENSI & REKOMENDASI COACHING PERSONAL
                  ========================================================================= */}
              {activeModalTab === 'radar' && (
                <div className="space-y-4">
                  {/* Grid Radar Chart + Pillar Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Visual SVG Radar Chart (Left 5 Cols) */}
                    <div className="md:col-span-5 bg-gradient-to-b from-stone-50 to-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center justify-center text-center">
                      <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono mb-1 flex items-center gap-1.5">
                        <Target size={14} className="text-[#8B1418]" />
                        <span>Visual Radar 4 Pilar Kompetensi</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mb-2">Evaluasi menyeluruh SOP, Peraturan, Karakter & Visi</p>
                      
                      <svg viewBox="0 0 300 300" className="w-full max-w-[240px] h-auto select-none overflow-visible">
                        <defs>
                          <radialGradient id="radarPolygonGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#8B1418" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#8B1418" stopOpacity="0.08" />
                          </radialGradient>
                        </defs>

                        {/* Concentric Grid Diamond Rings */}
                        {[0.25, 0.5, 0.75, 1.0].map((scale, idx) => (
                          <polygon
                            key={idx}
                            points={`${cx},${cy - scale * R} ${cx + scale * R},${cy} ${cx},${cy + scale * R} ${cx - scale * R},${cy}`}
                            fill={idx === 3 ? "#F8FAFC" : "none"}
                            stroke="#CBD5E1"
                            strokeWidth={idx === 3 ? "1.5" : "1"}
                            strokeDasharray={idx === 3 ? "none" : "3,3"}
                          />
                        ))}

                        {/* Axis Spokes */}
                        <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke="#94A3B8" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke="#94A3B8" strokeWidth="1" strokeDasharray="2,2" />

                        {/* Center Pivot */}
                        <circle cx={cx} cy={cy} r="3" fill="#64748B" />

                        {/* Data Radar Polygon */}
                        <polygon
                          points={polyPoints}
                          fill="url(#radarPolygonGrad)"
                          stroke="#8B1418"
                          strokeWidth="2.5"
                        />

                        {/* Top: SOP */}
                        <circle cx={pTop.x} cy={pTop.y} r="5" fill="#8B1418" stroke="#ffffff" strokeWidth="2" />
                        <text x={cx} y={cy - R - 14} textAnchor="middle" className="text-[10px] font-bold fill-slate-800">SOP Jobdesk</text>
                        <text x={cx} y={cy - R - 2} textAnchor="middle" className="text-[11px] font-mono font-bold fill-[#8B1418]">{pilar.sop_jobdesk}%</text>

                        {/* Right: Peraturan */}
                        <circle cx={pRight.x} cy={pRight.y} r="5" fill="#8B1418" stroke="#ffffff" strokeWidth="2" />
                        <text x={cx + R + 10} y={cy - 4} textAnchor="start" className="text-[10px] font-bold fill-slate-800">Regulasi Kas</text>
                        <text x={cx + R + 10} y={cy + 10} textAnchor="start" className="text-[11px] font-mono font-bold fill-blue-700">{pilar.peraturan_perusahaan}%</text>

                        {/* Bottom: Visi Misi */}
                        <circle cx={pBottom.x} cy={pBottom.y} r="5" fill="#8B1418" stroke="#ffffff" strokeWidth="2" />
                        <text x={cx} y={cy + R + 14} textAnchor="middle" className="text-[10px] font-bold fill-slate-800">Visi Misi HARA</text>
                        <text x={cx} y={cy + R + 26} textAnchor="middle" className="text-[11px] font-mono font-bold fill-emerald-700">{pilar.visi_misi_hara}%</text>

                        {/* Left: Karakter */}
                        <circle cx={pLeft.x} cy={pLeft.y} r="5" fill="#8B1418" stroke="#ffffff" strokeWidth="2" />
                        <text x={cx - R - 10} y={cy - 4} textAnchor="end" className="text-[10px] font-bold fill-slate-800">Karakter Kerja</text>
                        <text x={cx - R - 10} y={cy + 10} textAnchor="end" className="text-[11px] font-mono font-bold fill-purple-700">{pilar.karakter_integritas}%</text>
                      </svg>
                    </div>

                    {/* Breakdown 4 Pilar (Right 7 Cols) */}
                    <div className="md:col-span-7 space-y-2.5">
                      {/* Pilar 1: SOP Jobdesk */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#8B1418]" />
                            1. SOP Jobdesk & Parameter Teknis
                          </span>
                          <span className="font-mono font-bold text-[#8B1418]">{pilar.sop_jobdesk}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#8B1418] h-full" style={{ width: `${pilar.sop_jobdesk}%` }} />
                        </div>
                        <div className="text-[10.5px] text-slate-500">
                          Suhu fryer 160°C, gramatur sambal 30g, teknik penepungan, dan kebersihan stasiun kerja.
                        </div>
                      </div>

                      {/* Pilar 2: Peraturan Perusahaan */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            2. Peraturan Perusahaan & Regulasi Kas
                          </span>
                          <span className="font-mono font-bold text-blue-700">{pilar.peraturan_perusahaan}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full" style={{ width: `${pilar.peraturan_perusahaan}%` }} />
                        </div>
                        <div className="text-[10.5px] text-slate-500">
                          Kepatuhan kasir POS ESB SOP/FAT/44, larangan gadget, grooming, dan keselamatan tabung gas LPG.
                        </div>
                      </div>

                      {/* Pilar 3: Karakter & Integritas */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                            3. Karakteristik, Integritas & Emosi
                          </span>
                          <span className="font-mono font-bold text-purple-700">{pilar.karakter_integritas}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-full" style={{ width: `${pilar.karakter_integritas}%` }} />
                        </div>
                        <div className="text-[10.5px] text-slate-500">
                          Kejujuran selisih uang kasir, ketahanan komplain jam sibuk, zero jalan pintas mutu, dan empati tim.
                        </div>
                      </div>

                      {/* Pilar 4: Visi Misi HARA */}
                      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                            4. Visi & Misi Budaya H.A.R.A
                          </span>
                          <span className="font-mono font-bold text-emerald-700">{pilar.visi_misi_hara}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full" style={{ width: `${pilar.visi_misi_hara}%` }} />
                        </div>
                        <div className="text-[10.5px] text-slate-500">
                          Komitmen Halal & Higienis (SJPH), Amanah akurasi porsi, Responsif Speed of Service 5S, dan Adaptif.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* REKOMENDASI MATERI COACHING PERSONAL DARI SISTEM */}
                  <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Compass size={18} className="text-amber-800" />
                        <div>
                          <h4 className="text-xs font-bold text-amber-950 uppercase font-mono tracking-wider">
                            Rekomendasi Bimbingan Coaching Personal Trainer
                          </h4>
                          <span className="text-[11px] text-amber-800">
                            Disusun otomatis berdasarkan pilar kompetensi terendah kru
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 text-xs font-bold font-mono">
                        Prioritas: {pilar.pilar_terendah}
                      </span>
                    </div>

                    <div className="p-3 bg-white/90 rounded-xl border border-amber-200/80 text-xs text-amber-950 font-medium leading-relaxed">
                      <b>Arahan Pelatih (Trainer Directive):</b><br />
                      "{pilar.rekomendasi_coaching}"
                    </div>

                    {/* Modul Drill Rekomendasi */}
                    <div>
                      <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider font-mono mb-1.5">
                        Kurikulum Modul Drill yang Wajib Diperkuat:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pilar.materi_rekomendasi.map((mod, i) => (
                          <div
                            key={i}
                            className="p-2 rounded-lg bg-white border border-amber-200 text-xs font-medium text-slate-800 flex items-center gap-2"
                          >
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
                              {i + 1}
                            </span>
                            <span className="truncate">{mod}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 2: AUDIT LEMBAR JAWABAN KRU & PENILAIAN ESSAY INTERAKTIF
                  ========================================================================= */}
              {activeModalTab === 'jawaban' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-bold">Total {questions.length} Butir Soal</span> • Paket {selectedRecord.minggu} ({selectedRecord.divisi})
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      PG: 60% • Essay HOTS: 40%
                    </span>
                  </div>

                  {/* List Butir Soal */}
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {questions.map((q, idx) => {
                      const ans = selectedRecord.jawaban_kru[q.id];
                      const isPG = q.tipe === 'PILIHAN_GANDA';
                      const isCorrect = isPG && ans === q.jawaban_benar;
                      const isEssay = q.tipe === 'ESSAY_HOTS';
                      const currentEssayGrade = essayGrades[q.id] || { skor: 80, komentar: '' };

                      return (
                        <div
                          key={q.id}
                          className={`p-3.5 rounded-xl border text-xs transition-all ${
                            isPG
                              ? isCorrect
                                ? 'bg-emerald-50/30 border-emerald-200'
                                : 'bg-red-50/30 border-red-200'
                              : 'bg-purple-50/20 border-purple-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono font-bold text-[10px]">
                                #{idx + 1}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                {q.topik}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-rose-50 text-[#8B1418] font-bold text-[10px]">
                                {q.pilar_kompetensi || 'sop_jobdesk'}
                              </span>
                            </div>

                            {isPG && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isCorrect
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {isCorrect ? 'Benar (+5)' : 'Salah (0)'}
                              </span>
                            )}

                            {isEssay && (
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold">
                                Essay HOTS ({q.bobot} Poin)
                              </span>
                            )}
                          </div>

                          <p className="font-semibold text-slate-900 mb-2 leading-relaxed">
                            {q.pertanyaan}
                          </p>

                          {/* Detail Opsi Pilihan Ganda */}
                          {isPG && (
                            <div className="space-y-1 mb-2 bg-white/80 p-2.5 rounded-lg border border-slate-100">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                                <div>
                                  <span className="text-slate-500 font-mono">Jawaban Kru: </span>
                                  <span className={`font-bold font-mono ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                                    {ans || '(Tidak dijawab)'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-500 font-mono">Kunci Jawaban Resmi: </span>
                                  <span className="font-bold font-mono text-emerald-700">
                                    {q.jawaban_benar}
                                  </span>
                                </div>
                              </div>
                              {q.pembahasan_sop && (
                                <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-[10.5px] text-slate-600">
                                  <b>Pembahasan SOP:</b> {q.pembahasan_sop}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Detail Jawaban Essay HOTS & Penilaian Trainer */}
                          {isEssay && (
                            <div className="space-y-2 bg-white p-3 rounded-xl border border-purple-100">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 font-mono">
                                  Jawaban Kru:
                                </span>
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs italic mt-0.5">
                                  "{ans || '(Kru tidak mengisi jawaban essay)'}"
                                </div>
                              </div>

                              {q.kata_kunci_essay && (
                                <div className="text-[10.5px] text-slate-500">
                                  <b>Kata Kunci Standar:</b> {q.kata_kunci_essay.join(', ')}
                                </div>
                              )}

                              {q.pembahasan_sop && (
                                <div className="text-[10.5px] text-slate-600 bg-purple-50/50 p-2 rounded-lg">
                                  <b>Kunci Penjelasan SOP:</b> {q.pembahasan_sop}
                                </div>
                              )}

                              {/* Form Koreksi Nilai Essay oleh Trainer */}
                              <div className="pt-2 border-t border-purple-100 flex items-center justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-purple-950 font-mono">
                                    Nilai Essay (0-100):
                                  </span>
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={currentEssayGrade.skor}
                                    onChange={(e) => {
                                      const val = Number(e.target.value);
                                      const newGrades = {
                                        ...essayGrades,
                                        [q.id]: { ...currentEssayGrade, skor: val },
                                      };
                                      setEssayGrades(newGrades);
                                      // Rata-rata essay
                                      const allScores = Object.values(newGrades).map((g: { skor: number; komentar?: string }) => g.skor);
                                      const avg = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : val;
                                      setEssayScoreAdjust(avg);
                                    }}
                                    className="w-16 px-2 py-1 rounded-lg border border-purple-200 text-xs font-mono font-bold text-center"
                                  />
                                </div>

                                <input
                                  type="text"
                                  placeholder="Komentar singkat koreksi essay..."
                                  value={currentEssayGrade.komentar}
                                  onChange={(e) => {
                                    setEssayGrades({
                                      ...essayGrades,
                                      [q.id]: { ...currentEssayGrade, komentar: e.target.value },
                                    });
                                  }}
                                  className="flex-1 min-w-[200px] px-2.5 py-1 rounded-lg border border-slate-200 text-xs"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  TAB 3: PROFIL PSIKOLOGIS KERJA
                  ========================================================================= */}
              {activeModalTab === 'psikologi' && (
                <div className="space-y-4">
                  {selectedRecord.profil_psikologis ? (
                    <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain size={16} className="text-purple-700" />
                          <span className="text-xs font-bold text-purple-950 uppercase tracking-wider font-mono">
                            HASIL PEMETAAN PSIKOLOGIS & KARAKTER KERJA KRU
                          </span>
                        </div>
                        <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full">
                          {selectedRecord.profil_psikologis.tipe_kepribadian_kerja}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-white rounded-lg border border-purple-100 space-y-1">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>1. Integritas Kas & Kejujuran Finansial</span>
                            <span className="font-mono text-[#8B1418]">{selectedRecord.profil_psikologis.integritas}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#8B1418] h-full" style={{ width: `${selectedRecord.profil_psikologis.integritas}%` }} />
                          </div>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-purple-100 space-y-1">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>2. Ketahanan Stres (Jam Sibuk / Rush Hour)</span>
                            <span className="font-mono text-blue-700">{selectedRecord.profil_psikologis.ketahanan_stres}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full" style={{ width: `${selectedRecord.profil_psikologis.ketahanan_stres}%` }} />
                          </div>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-purple-100 space-y-1">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>3. Fokus Layanan Pelanggan (5S Service)</span>
                            <span className="font-mono text-emerald-700">{selectedRecord.profil_psikologis.fokus_pelanggan}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full" style={{ width: `${selectedRecord.profil_psikologis.fokus_pelanggan}%` }} />
                          </div>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-purple-100 space-y-1">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>4. Disiplin Standar Mutu SOP</span>
                            <span className="font-mono text-amber-700">{selectedRecord.profil_psikologis.disiplin_sop}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-600 h-full" style={{ width: `${selectedRecord.profil_psikologis.disiplin_sop}%` }} />
                          </div>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-purple-100 sm:col-span-2 space-y-1">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>5. Inisiatif & Kerjasama Tim Lintas Stasiun</span>
                            <span className="font-mono text-purple-700">{selectedRecord.profil_psikologis.kerjasama_tim}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-purple-600 h-full" style={{ width: `${selectedRecord.profil_psikologis.kerjasama_tim}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="text-[11.5px] text-purple-950 font-medium leading-relaxed bg-white/80 p-3 rounded-lg border border-purple-100">
                        <b>Diagnosa Karakter:</b> "{selectedRecord.profil_psikologis.kesimpulan_trainer}"<br />
                        <b>Rekomendasi Penempatan:</b> {selectedRecord.profil_psikologis.rekomendasi_pendampingan}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400">
                      Belum ada asesmen psikologis pada sesi ini.
                    </div>
                  )}
                </div>
              )}

              {/* Form Koreksi Nilai & Catatan Trainer */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Penyesuaian Skor Essay & Catatan Pelatih:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">Skor Essay Komposit:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={essayScoreAdjust}
                      onChange={(e) => setEssayScoreAdjust(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded border border-slate-200 text-xs font-mono font-bold text-center"
                    />
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={trainerNoteInput}
                    onChange={(e) => setTrainerNoteInput(e.target.value)}
                    placeholder="Tuliskan umpan balik performa, arahan materi yang perlu dipelajari, atau catatan khusus kru..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRecordReview}
                    className="px-5 py-2 rounded-xl bg-[#8B1418] hover:bg-[#720e12] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} />
                    <span>Simpan Penilaian & Ulasan Trainer</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};
