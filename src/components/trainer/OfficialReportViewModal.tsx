import React, { useState, useEffect } from 'react';
import {
  X, Printer, Check, Edit3, Save,
  FileSpreadsheet, Building, Users, Calendar, AlertCircle,
  Plus, Trash2, RefreshCw, Eye, Sparkles, Phone, FileText,
  Award, ShieldCheck, CheckCircle2, TrendingUp, Clock,
  Zap, Tag, HelpCircle, FileCheck, Copy
} from 'lucide-react';
import { LaporanTrainerOutlet, Outlet, Division, StatusOJT } from '../../types';
import { OfficialDocumentHeader } from '../OfficialDocumentHeader';

interface OfficialReportViewModalProps {
  report: LaporanTrainerOutlet | null;
  outlets: Outlet[];
  isOpen: boolean;
  onClose: () => void;
  onSaveReportEdit: (updatedReport: LaporanTrainerOutlet) => void;
}

export const OfficialReportViewModal: React.FC<OfficialReportViewModalProps> = ({
  report,
  outlets,
  isOpen,
  onClose,
  onSaveReportEdit,
}) => {
  const [activeMode, setActiveMode] = useState<'view' | 'edit'>('view');
  const [letterheadMode, setLetterheadMode] = useState<'with_kop' | 'no_kop'>('with_kop');
  const [copiedWA, setCopiedWA] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState<LaporanTrainerOutlet | null>(null);

  // Signatures
  const [signPD, setSignPD] = useState('Haikal Abi');
  const [signPDTitle, setSignPDTitle] = useState('Trainer Operasional Cabang');
  const [signOutletPIC, setSignOutletPIC] = useState('');
  const [signOutletTitle, setSignOutletTitle] = useState('Penanggung Jawab Cabang');

  useEffect(() => {
    if (report) {
      setFormData(JSON.parse(JSON.stringify(report)));
      setSignPD(report.trainer_nama || 'Haikal Abi');
      setSignOutletPIC(`Penanggung Jawab Outlet ${report.kode_outlet}`);
      setActiveMode('view');
    }
  }, [report, isOpen]);

  if (!isOpen || !report || !formData) return null;

  const outletObj = outlets.find((o) => o.kode_outlet === formData.kode_outlet);
  const outletDisplayName = outletObj ? `${outletObj.nama_outlet} (${formData.kode_outlet})` : formData.kode_outlet;

  // Auto calculate average score
  const handleRecalculateAverage = () => {
    const validScores = formData.daftar_trainee
      .map((t) => Number(t.skor_akhir))
      .filter((s) => !isNaN(s) && s > 0);

    if (validScores.length > 0) {
      const avg = Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
      setFormData({
        ...formData,
        skor_rata_rata: avg,
        total_trainee: formData.daftar_trainee.length,
      });
    }
  };

  // Trainee row updater
  const handleUpdateTraineeField = (index: number, field: string, value: any) => {
    const updated = [...formData.daftar_trainee];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, daftar_trainee: updated });
  };

  // Add new trainee row
  const handleAddTraineeRow = () => {
    const newTrainee = {
      nama_kru: 'Kru Baru',
      jabatan: 'Crew Kitchen',
      divisi: 'Kitchen' as Division,
      sop_fokus: 'SOP Menggoreng Ayam Krispi & Pengendalian Suhu',
      skor_akhir: 88,
      skor_teori: 85,
      skor_praktik: 90,
      skor_attitude: 90,
      skor_ketahanan: 85,
      status_ojt: 'Lulus / Mandiri' as StatusOJT,
      akar_masalah: 'Sudah Sangat Konsisten, Mandiri & Mahir Eksekusi',
      bukti_observasi: 'Eksekusi suhu 170°C tepat, penepungan keriting merata dan APD lengkap.',
      alasan_kelulusan: 'Memenuhi seluruh 4 pilar di atas 80 pt dan tidak memiliki deviasi kritis.',
      catatan: 'Cekatan, gramasi bumbu tepat dan higienitas terjaga.',
    };
    const updatedList = [...formData.daftar_trainee, newTrainee];
    setFormData({
      ...formData,
      daftar_trainee: updatedList,
      total_trainee: updatedList.length,
    });
  };

  // Delete trainee row
  const handleDeleteTraineeRow = (index: number) => {
    const updatedList = formData.daftar_trainee.filter((_, idx) => idx !== index);
    setFormData({
      ...formData,
      daftar_trainee: updatedList,
      total_trainee: updatedList.length,
    });
  };

  // Save changes
  const handleSaveAll = () => {
    const finalReport: LaporanTrainerOutlet = {
      ...formData,
      total_trainee: formData.daftar_trainee.length,
    };
    onSaveReportEdit(finalReport);
    setActiveMode('view');
  };

  // WhatsApp share
  const handleCopyWhatsApp = () => {
    const isNoKop = letterheadMode === 'no_kop';
    const text = `${isNoKop ? '' : '📋 *HARA CHICKEN - TRAINER OPERASIONAL*\n'}*LAPORAN PENDAMPINGAN OUTLET & EVALUASI OBJEKTIF KRU*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *No. Dokumen:* ${formData.nomor_laporan}
🏬 *Outlet:* ${outletDisplayName}
👤 *Trainer Operasional:* ${formData.trainer_nama || 'Haikal Abi'}
🗓️ *Periode Kegiatan:* ${formData.periode_awal} s.d. ${formData.periode_akhir}
🎯 *Jenis Kegiatan:* ${formData.jenis_kegiatan}
📊 *Status Dokumen:* ${formData.status}

👥 *RINCIAN EVALUASI OBJEKTIF KRU (${formData.daftar_trainee.length} Orang):*
${formData.daftar_trainee.map((t, idx) => `${idx + 1}. *${t.nama_kru}* - ${t.jabatan || 'Crew'} (${t.divisi})
   • SOP Fokus: ${t.sop_fokus}
   • 4 Pilar: T:${t.skor_teori ?? 85} | P:${t.skor_praktik ?? 88} | R:${t.skor_attitude ?? 90} | K:${t.skor_ketahanan ?? 85}
   • Skor Komposit: *${t.skor_akhir ?? '-'}/100* [${t.status_ojt}]
   • Akar Masalah: ${t.akar_masalah || 'Telah konsisten & mandiri'}
   • Bukti Lapangan: ${t.bukti_observasi || '-'}
   • Catatan: ${t.catatan || '-'}`).join('\n\n')}

⭐ *Rata-rata Skor Keterampilan Kru:* *${formData.skor_rata_rata ?? 85} / 100*

💡 *RINGKASAN ASISTENSI & PERBANTUAN OPERASIONAL:*
${formData.ringkasan_perbantuan}

⚠️ *IDENTIFIKASI KENDALA LAPANGAN:*
${formData.kendala_outlet || 'Operasional kondusif dan sesuai standar SOP.'}

✅ *REKOMENDASI PENANGGUNG JAWAB OUTLET:*
${formData.rekomendasi_kepala_outlet || 'Lakukan briefing dan checklist pembukaan stasiun kerja secara konsisten.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Dibuat Oleh:* ${signPD} (${signPDTitle})
🏢 *Diketahui Oleh:* ${signOutletPIC} (${signOutletTitle})`;

    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2500);
  };

  // Copy Plain Text / Clean Markdown (Tanpa Kop Surat)
  const handleCopyCleanText = () => {
    const text = `LAPORAN PENDAMPINGAN, OJT & PERBANTUAN OPERASIONAL OUTLET
(Versi Dokumen Tanpa Kop Surat)

No. Dokumen: ${formData.nomor_laporan}
Outlet: ${outletDisplayName}
Trainer Operasional: ${formData.trainer_nama || 'Haikal Abi'}
Periode Kegiatan: ${formData.periode_awal} s.d. ${formData.periode_akhir}
Jenis Kegiatan: ${formData.jenis_kegiatan}
Status: ${formData.status}
Total Kru: ${formData.daftar_trainee.length} Orang
Rata-rata Skor: ${formData.skor_rata_rata ?? 85} / 100

==================================================
1. RINCIAN EVALUASI KRU, 4 PILAR & DIAGNOSA LAPANGAN
==================================================
${formData.daftar_trainee.map((t, idx) => `[${idx + 1}] ${t.nama_kru} | Jabatan: ${t.jabatan || 'Crew'} | Divisi: ${t.divisi}
    - SOP Fokus: ${t.sop_fokus}
    - Matriks 4 Pilar: Teori ${t.skor_teori ?? 85} | Praktik ${t.skor_praktik ?? 88} | RESPECT ${t.skor_attitude ?? 90} | Ketahanan ${t.skor_ketahanan ?? 85}
    - Skor Komposit: ${t.skor_akhir ?? '-'}/100 (${t.status_ojt})
    - Akar Masalah: ${t.akar_masalah || '-'}
    - Bukti Observasi: ${t.bukti_observasi || '-'}
    - Catatan Kinerja: ${t.catatan || '-'}`).join('\n\n')}

==================================================
2. RINGKASAN PERBANTUAN OPERASIONAL & RUSH HOURS
==================================================
${formData.ringkasan_perbantuan}

==================================================
3. IDENTIFIKASI KENDALA LAPANGAN & TROUBLESHOOTING
==================================================
${formData.kendala_outlet || 'Operasional kondusif dan sesuai standar SOP.'}

==================================================
4. REKOMENDASI TINDAK LANJUT OUTLET
==================================================
${formData.rekomendasi_kepala_outlet || 'Lakukan checklist buka/tutup stasiun kerja secara konsisten.'}

==================================================
PENGESAHAN:
Dibuat Oleh: ${signPD} (${signPDTitle})
Diketahui Oleh: ${signOutletPIC} (${signOutletTitle})
Tanggal Terbit: ${formData.periode_akhir}`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'No', 'Nama Kru', 'Jabatan', 'Divisi', 'SOP Fokus', 'Skor Teori (25%)', 'Skor Praktik (35%)',
      'Skor RESPECT (25%)', 'Skor Ketahanan (15%)', 'Skor Akhir Komposit', 'Status OJT',
      'Akar Masalah', 'Bukti Observasi Lapangan', 'Justifikasi Kelulusan', 'Catatan Diagnostik'
    ];
    const rows = formData.daftar_trainee.map((t, i) => [
      i + 1,
      `"${t.nama_kru}"`,
      `"${t.jabatan || 'Crew'}"`,
      `"${t.divisi}"`,
      `"${t.sop_fokus}"`,
      t.skor_teori ?? 85,
      t.skor_praktik ?? 88,
      t.skor_attitude ?? 90,
      t.skor_ketahanan ?? 85,
      t.skor_akhir ?? '',
      `"${t.status_ojt}"`,
      `"${(t.akar_masalah || '').replace(/"/g, '""')}"`,
      `"${(t.bukti_observasi || '').replace(/"/g, '""')}"`,
      `"${(t.alasan_kelulusan || '').replace(/"/g, '""')}"`,
      `"${(t.catatan || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [
        `"LAPORAN PENDAMPINGAN OUTLET & EVALUASI OBJEKTIF KRU - HARA TRAINING & OPERATIONS"`,
        `"No Dokumen: ${formData.nomor_laporan}"`,
        `"Outlet: ${formData.kode_outlet} - Trainer Operasional: ${formData.trainer_nama || 'Haikal Abi'}"`,
        `"Periode: ${formData.periode_awal} s/d ${formData.periode_akhir}"`,
        '',
        headers.join(','),
        ...rows.map((e) => e.join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Objektif_Pendampingan_${formData.kode_outlet}_${formData.nomor_laporan.replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-auto max-h-[96vh] flex flex-col print:shadow-none print:border-none print:max-w-none print:p-0 print:m-0 print:max-h-none">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 print:hidden shrink-0">
          
          {/* Left Controls: Mode & Letterhead Switchers */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* View / Edit Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveMode('view')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeMode === 'view'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Eye size={14} className={activeMode === 'view' ? 'text-[#96171B]' : ''} />
                <span>Lihat Dokumen</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('edit')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeMode === 'edit'
                    ? 'bg-[#96171B] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Edit3 size={14} />
                <span>Edit Manual Lengkap</span>
              </button>
            </div>

            {/* Letterhead Switcher (Kop Surat vs Tanpa Kop) */}
            {activeMode === 'view' && (
              <div className="flex items-center bg-amber-50/80 p-1 rounded-2xl border border-amber-200">
                <button
                  type="button"
                  onClick={() => setLetterheadMode('with_kop')}
                  className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                    letterheadMode === 'with_kop'
                      ? 'bg-white text-amber-950 shadow-xs border border-amber-200'
                      : 'text-amber-700 hover:text-amber-950'
                  }`}
                  title="Tampilkan kop surat resmi HARA"
                >
                  <Building size={13} className="text-[#96171B]" />
                  <span>Dengan Kop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLetterheadMode('no_kop')}
                  className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                    letterheadMode === 'no_kop'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-700 hover:text-amber-950'
                  }`}
                  title="Format bersih lengkap tanpa kop surat (cocok untuk audit internal atau cetak polos)"
                >
                  <FileText size={13} />
                  <span>Tanpa Kop Surat</span>
                </button>
              </div>
            )}

          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {activeMode === 'edit' ? (
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Save size={14} />
                <span>Simpan Perubahan</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Ekspor Data ke File CSV/Excel"
                >
                  <FileSpreadsheet size={14} className="text-emerald-700" />
                  <span className="hidden sm:inline">CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCleanText}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="Salin Teks Lengkap Tanpa Kop Surat"
                >
                  {copiedText ? <Check size={14} className="text-blue-700" /> : <Copy size={14} />}
                  <span>{copiedText ? 'Tersalin!' : 'Salin Teks (Tanpa Kop)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  {copiedWA ? <Check size={14} className="text-emerald-600" /> : <Phone size={14} />}
                  <span>{copiedWA ? 'Tersalin!' : 'Kirim WA'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-[#96171B] hover:bg-[#781014] text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Printer size={14} className="text-[#FBD66A]" />
                  <span>Cetak / PDF {letterheadMode === 'no_kop' ? '(Tanpa Kop)' : ''}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Container (Main Document Body) */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-5 print:overflow-visible print:pr-0">
          
          {/* ========================================================================= */}
          {/* MODE 1: DOCUMENT VIEW (WITH OR WITHOUT LETTERHEAD) */}
          {/* ========================================================================= */}
          {activeMode === 'view' && (
            <div className="printable-document-sheet p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
              
              {/* OPSI 1: KOP RESMI (JIKA LETTERHEAD AKTIF) */}
              {letterheadMode === 'with_kop' && (
                <OfficialDocumentHeader
                  docNumber={formData.nomor_laporan}
                  subLabel="Standar Operasional Prosedur, Penjaminan Mutu & Pelatihan Kru"
                  extraInfo="Sistem Penilaian Kompetensi & Pendampingan Outlet Terpadu"
                />
              )}

              {/* OPSI 2: HEADER BERSIH TANPA KOP (JIKA TANPA KOP DIPILIH) */}
              {letterheadMode === 'no_kop' && (
                <div className="border-b-2 border-slate-900 pb-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                        HARA CHICKEN • TRAINER OPERASIONAL DIVISION
                      </div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                        LAPORAN PENDAMPINGAN, OJT & PERBANTUAN OPERASIONAL OUTLET
                      </h2>
                      <p className="text-xs text-slate-600 font-medium">
                        Versi Resmi Tanpa Kop Surat (Internal Audit & Monitoring Operasional)
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <div className="font-bold text-slate-500">No. Dokumen:</div>
                      <div className="font-black text-slate-900 text-sm">{formData.nomor_laporan}</div>
                      <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                        {formData.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Judul Dokumen Terpusat (Untuk Mode Dengan Kop) */}
              {letterheadMode === 'with_kop' && (
                <div className="text-center py-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                    LAPORAN PENDAMPINGAN, OJT & PERBANTUAN OPERASIONAL OUTLET
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-600">
                    <span>Outlet: <b className="text-slate-900">{outletDisplayName}</b></span>
                    <span>•</span>
                    <span>Periode: <b className="text-[#96171B]">{formData.periode_awal} s.d. {formData.periode_akhir}</b></span>
                    <span>•</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      {formData.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Ringkasan Metrik 4 Kolom */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Trainer Operasional</span>
                  <span className="font-black text-slate-900 text-sm">{formData.trainer_nama || 'Haikal Abi'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Jenis Kegiatan</span>
                  <span className="font-bold text-slate-800">{formData.jenis_kegiatan}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Kru Binaan</span>
                  <span className="font-black text-[#96171B] text-sm">{formData.daftar_trainee.length} Orang</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Rata-rata Skor Komposit</span>
                  <span className="font-black text-emerald-700 text-sm">{formData.skor_rata_rata ?? 85} / 100</span>
                </div>
              </div>

              {/* Section 1: Tabel Individual Trainee dengan Rincian Objektif & Akar Masalah */}
              <div className="space-y-2.5 print-avoid-break">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#96171B] text-white flex items-center justify-center text-[10px] font-black">1</span>
                    <span>Rincian Evaluasi Kru, 4 Faktor & Diagnosa Bukti Lapangan</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500">
                    {formData.daftar_trainee.length} Kru Terdata
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-300">
                  <table className="w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-black text-left border-b border-slate-300">
                        <th className="p-2 text-center w-7 border-r border-slate-300">No</th>
                        <th className="p-2 border-r border-slate-300 w-36">Nama, Jabatan & Divisi</th>
                        <th className="p-2 border-r border-slate-300 w-36">SOP Jobdesk</th>
                        <th className="p-2 text-center border-r border-slate-300 w-32">Matriks 4 Pilar</th>
                        <th className="p-2 text-center border-r border-slate-300 w-14">Skor</th>
                        <th className="p-2 text-center border-r border-slate-300 w-28">Status OJT</th>
                        <th className="p-2">Diagnosa Akar Masalah & Bukti Lapangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {formData.daftar_trainee.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-slate-400 font-medium italic">
                            Belum ada rincian data trainee terlampir dalam laporan ini.
                          </td>
                        </tr>
                      ) : (
                        formData.daftar_trainee.map((tr, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-2 text-center font-bold text-slate-500 border-r border-slate-200 align-top">{idx + 1}</td>
                            <td className="p-2 border-r border-slate-200 align-top">
                              <div className="font-black text-slate-900">{tr.nama_kru}</div>
                              <div className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1 py-0.2 rounded mt-0.5 inline-block">
                                {tr.jabatan || 'Crew'}
                              </div>
                              <span className="text-[10px] font-medium text-slate-500 block">{tr.divisi}</span>
                            </td>
                            <td className="p-2 text-slate-600 border-r border-slate-200 align-top font-medium">
                              {tr.sop_fokus}
                            </td>
                            <td className="p-2 border-r border-slate-200 align-top">
                              <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                                <span className="bg-blue-50 text-blue-800 px-1 py-0.2 rounded font-bold">T: {tr.skor_teori ?? 85}</span>
                                <span className="bg-amber-50 text-amber-800 px-1 py-0.2 rounded font-bold">P: {tr.skor_praktik ?? 88}</span>
                                <span className="bg-emerald-50 text-emerald-800 px-1 py-0.2 rounded font-bold">R: {tr.skor_attitude ?? 90}</span>
                                <span className="bg-rose-50 text-rose-800 px-1 py-0.2 rounded font-bold">K: {tr.skor_ketahanan ?? 85}</span>
                              </div>
                            </td>
                            <td className="p-2 text-center font-black text-emerald-700 border-r border-slate-200 align-top text-xs">
                              {tr.skor_akhir ?? '-'}
                            </td>
                            <td className="p-2 text-center border-r border-slate-200 align-top">
                              <span className={`inline-block font-black text-[9.5px] px-2 py-0.5 rounded-md ${
                                tr.status_ojt === 'Lulus / Mandiri'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tr.status_ojt === 'Sedang Berjalan'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {tr.status_ojt}
                              </span>
                            </td>
                            <td className="p-2 text-slate-700 align-top space-y-1">
                              {tr.akar_masalah && (
                                <div className="text-[10px] font-bold text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                                  Akar: {tr.akar_masalah}
                                </div>
                              )}
                              {tr.bukti_observasi && (
                                <div className="text-[10px] text-slate-600 font-normal line-clamp-2">
                                  Bukti: {tr.bukti_observasi}
                                </div>
                              )}
                              {tr.catatan && (
                                <div className="text-[10px] text-slate-800 font-medium italic">
                                  "{tr.catatan}"
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Ringkasan Perbantuan */}
              <div className="space-y-1.5 print-avoid-break">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#96171B] text-white flex items-center justify-center text-[10px] font-black">2</span>
                  <span>Ringkasan Perbantuan Operasional & Asistensi Jam Sibuk (Peak Hours)</span>
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 leading-relaxed text-xs font-medium">
                  {formData.ringkasan_perbantuan}
                </div>
              </div>

              {/* Section 3 & 4: Kendala & Rekomendasi */}
              <div className="grid sm:grid-cols-2 gap-4 print-avoid-break">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-rose-700 text-white flex items-center justify-center text-[10px] font-black">3</span>
                    <span>Identifikasi Kendala Lapangan & Troubleshooting</span>
                  </h4>
                  <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200 text-rose-950 leading-relaxed text-xs font-medium min-h-[70px]">
                    {formData.kendala_outlet || 'Operasional kondusif dan sesuai standar SOP.'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black">4</span>
                    <span>Rekomendasi Tindak Lanjut Penanggung Jawab Outlet</span>
                  </h4>
                  <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-emerald-950 leading-relaxed text-xs font-medium min-h-[70px]">
                    {formData.rekomendasi_kepala_outlet || 'Lakukan checklist buka/tutup stasiun kerja secara konsisten.'}
                  </div>
                </div>
              </div>

              {/* Tanda Tangan 2 Pihak (Trainer Operasional & Penanggung Jawab Outlet) */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-slate-200 text-center text-xs print-avoid-break">
                <div className="space-y-12">
                  <span className="text-slate-500 font-bold block">Dibuat Oleh:</span>
                  <div>
                    <div className="font-black text-slate-900 underline text-sm">{signPD}</div>
                    <div className="text-[11px] text-slate-600 font-medium mt-0.5">{signPDTitle}</div>
                    <div className="text-[9.5px] text-slate-400 font-bold">HARA TRAINING & OPERATIONS</div>
                  </div>
                </div>

                <div className="space-y-12">
                  <span className="text-slate-500 font-bold block">Diketahui & Diterima Oleh:</span>
                  <div>
                    <div className="font-black text-slate-900 underline text-sm">{signOutletPIC || `Penanggung Jawab Outlet ${formData.kode_outlet}`}</div>
                    <div className="text-[11px] text-slate-600 font-medium mt-0.5">{signOutletTitle}</div>
                    <div className="text-[9.5px] text-slate-400 font-bold">Outlet {formData.kode_outlet}</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: FORM EDIT MANUAL LENGKAP SEMUA DATA (TERMASUK JABATAN) */}
          {/* ========================================================================= */}
          {activeMode === 'edit' && (
            <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-300 space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Edit3 size={18} className="text-[#96171B]" />
                  <h3 className="text-sm font-black text-slate-900">
                    Formulir Pengeditan Manual Seluruh Parameter Laporan
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Semua nama, jabatan, nilai, catatan, dan parameter dapat diedit bebas.
                </span>
              </div>

              {/* Grid 1: Informasi Dasar Laporan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Dokumen Laporan</label>
                  <input
                    type="text"
                    value={formData.nomor_laporan}
                    onChange={(e) => setFormData({ ...formData, nomor_laporan: e.target.value })}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Outlet Cabang</label>
                  <select
                    value={formData.kode_outlet}
                    onChange={(e) => setFormData({ ...formData, kode_outlet: e.target.value })}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.kode_outlet}>
                        {o.nama_outlet} ({o.kode_outlet})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Dokumen</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Final">Final</option>
                    <option value="Disetujui Trainer Operasional">Disetujui Trainer Operasional</option>
                  </select>
                </div>
              </div>

              {/* Grid 2: Trainer & Periode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trainer Operasional</label>
                  <input
                    type="text"
                    value={formData.trainer_nama || 'Haikal Abi'}
                    onChange={(e) => setFormData({ ...formData, trainer_nama: e.target.value })}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Periode Tanggal Awal</label>
                  <input
                    type="date"
                    value={formData.periode_awal}
                    onChange={(e) => setFormData({ ...formData, periode_awal: e.target.value })}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Periode Tanggal Akhir</label>
                  <input
                    type="date"
                    value={formData.periode_akhir}
                    onChange={(e) => setFormData({ ...formData, periode_akhir: e.target.value })}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul / Jenis Kegiatan</label>
                <input
                  type="text"
                  value={formData.jenis_kegiatan}
                  onChange={(e) => setFormData({ ...formData, jenis_kegiatan: e.target.value })}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                />
              </div>

              {/* Edit Tabel Trainee dengan Jabatan */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#96171B]" />
                    <h4 className="text-xs font-black text-slate-900">
                      Tabel Kru Dampingan ({formData.daftar_trainee.length} Orang)
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleRecalculateAverage}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Hitung ulang rata-rata skor komposit otomatis"
                    >
                      <RefreshCw size={12} />
                      <span>Hitung Rata-rata</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTraineeRow}
                      className="px-2.5 py-1 rounded-lg bg-[#96171B] hover:bg-[#781014] text-white text-[11px] font-black flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus size={12} />
                      <span>+ Tambah Kru</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {formData.daftar_trainee.map((tr, idx) => (
                    <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#96171B]">Kru #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTraineeRow(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                          title="Hapus baris ini"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {/* Row 1: Nama, Jabatan, Divisi, Status */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nama Kru</label>
                          <input
                            type="text"
                            value={tr.nama_kru}
                            onChange={(e) => handleUpdateTraineeField(idx, 'nama_kru', e.target.value)}
                            className="w-full text-xs font-bold border border-slate-300 rounded-lg p-1.5"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Jabatan / Posisi</label>
                          <input
                            type="text"
                            value={tr.jabatan || 'Crew'}
                            onChange={(e) => handleUpdateTraineeField(idx, 'jabatan', e.target.value)}
                            placeholder="Contoh: Senior Cook / Kasir / Shift Leader"
                            className="w-full text-xs font-bold border border-slate-300 rounded-lg p-1.5 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Divisi</label>
                          <select
                            value={tr.divisi}
                            onChange={(e) => handleUpdateTraineeField(idx, 'divisi', e.target.value)}
                            className="w-full text-xs font-bold border border-slate-300 rounded-lg p-1.5"
                          >
                            <option value="Kitchen">Kitchen</option>
                            <option value="Geprek">Geprek</option>
                            <option value="Kasir">Kasir</option>
                            <option value="Helper">Helper</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Status Kelulusan</label>
                          <select
                            value={tr.status_ojt}
                            onChange={(e) => handleUpdateTraineeField(idx, 'status_ojt', e.target.value)}
                            className="w-full text-xs font-bold border border-slate-300 rounded-lg p-1.5"
                          >
                            <option value="Lulus / Mandiri">Lulus / Mandiri</option>
                            <option value="Sedang Berjalan">Sedang Berjalan</option>
                            <option value="Perlu Pendampingan Lanjut">Perlu Pendampingan Lanjut</option>
                          </select>
                        </div>
                      </div>

                      {/* 4 Pilar Mini Inputs */}
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <div>
                          <label className="text-[9.5px] font-bold text-blue-700 block mb-0.5">Teori (25%)</label>
                          <input
                            type="number"
                            value={tr.skor_teori ?? 85}
                            onChange={(e) => handleUpdateTraineeField(idx, 'skor_teori', Number(e.target.value))}
                            className="w-full text-xs font-bold border border-blue-200 rounded-lg p-1 bg-blue-50/50"
                          />
                        </div>
                        <div>
                          <label className="text-[9.5px] font-bold text-amber-700 block mb-0.5">Praktik (35%)</label>
                          <input
                            type="number"
                            value={tr.skor_praktik ?? 88}
                            onChange={(e) => handleUpdateTraineeField(idx, 'skor_praktik', Number(e.target.value))}
                            className="w-full text-xs font-bold border border-amber-200 rounded-lg p-1 bg-amber-50/50"
                          />
                        </div>
                        <div>
                          <label className="text-[9.5px] font-bold text-emerald-700 block mb-0.5">RESPECT (25%)</label>
                          <input
                            type="number"
                            value={tr.skor_attitude ?? 90}
                            onChange={(e) => handleUpdateTraineeField(idx, 'skor_attitude', Number(e.target.value))}
                            className="w-full text-xs font-bold border border-emerald-200 rounded-lg p-1 bg-emerald-50/50"
                          />
                        </div>
                        <div>
                          <label className="text-[9.5px] font-bold text-rose-700 block mb-0.5">Ketahanan (15%)</label>
                          <input
                            type="number"
                            value={tr.skor_ketahanan ?? 85}
                            onChange={(e) => handleUpdateTraineeField(idx, 'skor_ketahanan', Number(e.target.value))}
                            className="w-full text-xs font-bold border border-rose-200 rounded-lg p-1 bg-rose-50/50"
                          />
                        </div>
                        <div>
                          <label className="text-[9.5px] font-bold text-slate-800 block mb-0.5">Total Skor</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={tr.skor_akhir ?? 85}
                            onChange={(e) => handleUpdateTraineeField(idx, 'skor_akhir', Number(e.target.value))}
                            className="w-full text-xs font-black text-emerald-700 border border-slate-300 rounded-lg p-1 bg-emerald-50/30"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">SOP Fokus</label>
                          <input
                            type="text"
                            value={tr.sop_fokus}
                            onChange={(e) => handleUpdateTraineeField(idx, 'sop_fokus', e.target.value)}
                            className="w-full text-xs border border-slate-300 rounded-lg p-1.5"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-purple-700 block mb-0.5">Akar Masalah</label>
                          <input
                            type="text"
                            value={tr.akar_masalah || ''}
                            onChange={(e) => handleUpdateTraineeField(idx, 'akar_masalah', e.target.value)}
                            placeholder="Contoh: Sudah Mandiri & Mahir"
                            className="w-full text-xs border border-purple-300 rounded-lg p-1.5"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Catatan Kinerja</label>
                          <input
                            type="text"
                            value={tr.catatan || ''}
                            onChange={(e) => handleUpdateTraineeField(idx, 'catatan', e.target.value)}
                            className="w-full text-xs border border-slate-300 rounded-lg p-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit Ringkasan, Kendala & Rekomendasi */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Ringkasan Perbantuan Operasional & Asistensi Jam Sibuk
                  </label>
                  <textarea
                    rows={3}
                    value={formData.ringkasan_perbantuan}
                    onChange={(e) => setFormData({ ...formData, ringkasan_perbantuan: e.target.value })}
                    className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-rose-900 mb-1">
                      Identifikasi Kendala Lapangan
                    </label>
                    <textarea
                      rows={3}
                      value={formData.kendala_outlet}
                      onChange={(e) => setFormData({ ...formData, kendala_outlet: e.target.value })}
                      className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-900 mb-1">
                      Rekomendasi untuk Penanggung Jawab Outlet
                    </label>
                    <textarea
                      rows={3}
                      value={formData.rekomendasi_kepala_outlet}
                      onChange={(e) => setFormData({ ...formData, rekomendasi_kepala_outlet: e.target.value })}
                      className="w-full text-xs p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                    />
                  </div>
                </div>
              </div>

              {/* Edit Nama & Jabatan Penandatangan */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-black text-slate-900">Penandatangan Laporan:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 p-3 bg-white rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 block">Pihak 1 (Pembuat Laporan)</label>
                    <input
                      type="text"
                      placeholder="Nama Trainer"
                      value={signPD}
                      onChange={(e) => setSignPD(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2"
                    />
                    <input
                      type="text"
                      placeholder="Jabatan Trainer"
                      value={signPDTitle}
                      onChange={(e) => setSignPDTitle(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-1.5 text-slate-600"
                    />
                  </div>

                  <div className="space-y-1.5 p-3 bg-white rounded-xl border border-slate-200">
                    <label className="text-[10px] font-bold text-slate-500 block">Pihak 2 (Penerima Laporan Cabang)</label>
                    <input
                      type="text"
                      placeholder="Nama Penanggung Jawab Outlet"
                      value={signOutletPIC}
                      onChange={(e) => setSignOutletPIC(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2"
                    />
                    <input
                      type="text"
                      placeholder="Jabatan Penanggung Jawab"
                      value={signOutletTitle}
                      onChange={(e) => setSignOutletTitle(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-1.5 text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons in Edit Mode */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveMode('view')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Batal / Lihat Dokumen
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save size={14} />
                  <span>Simpan Perubahan Laporan</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
