import React, { useState, useMemo } from 'react';
import {
  BarChart3, TrendingUp, Download, Search, Filter,
  CheckCircle2, AlertTriangle, Clock, Award, Users,
  Building, ChevronRight, FileText, Printer, ArrowUpRight,
  ShieldAlert, RefreshCw, X, Eye, HelpCircle, Flame,
  Thermometer, Scale, CheckSquare
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { db } from '../../lib/storage';
import { syncAllToFirestore } from '../../lib/firestoreSync';
import { PenilaianOnboardingTC, Outlet, Division } from '../../types';

interface OnboardingDataAnalystViewProps {
  selectedOutletCode?: string;
  onNavigateToForm?: () => void;
}

export const OnboardingDataAnalystView: React.FC<OnboardingDataAnalystViewProps> = ({
  selectedOutletCode = 'ALL',
  onNavigateToForm,
}) => {
  // Master Data (Consolidates both Onboarding TC and Multi-Product SOP Evaluations)
  const [dataList, setDataList] = useState<any[]>(() => {
    try {
      const tc = db.getTable<PenilaianOnboardingTC>('penilaian_onboarding_tc') || [];
      const prod = db.getPenilaianPraktikProduk() || [];
      // Map product evaluations into normalized list format if needed
      const normalizedProd = prod.map((p) => ({
        id: p.id,
        tanggal: p.tanggal,
        peserta_nama: p.nama_kru,
        peserta_outlet: p.kode_outlet,
        peserta_divisi: p.divisi || 'Kitchen',
        kategori_peserta: 'Reguler',
        stasiun: p.station || 'Station SOP',
        task_nama: p.produk_nama,
        durasi_detik: p.durasi_detik || 600,
        target_durasi_detik: p.standar_durasi_detik || 600,
        deviasi_detik: (p.durasi_detik || 600) - (p.standar_durasi_detik || 600),
        skor_total: p.skor_akhir,
        skala_lima: Math.min(5, Number((p.skor_akhir / 20).toFixed(1))),
        grade: p.skor_akhir >= 85 ? 'A (Sangat Baik)' : p.skor_akhir >= 80 ? 'B (Baik)' : 'C (Perlu Bimbingan)',
        skor_ketepatan: p.skor_prosedur || 85,
        skor_kebersihan: p.skor_kebersihan || 85,
        skor_tim: p.skor_kerjasama || 85,
        skor_knowledge: p.skor_knowledge || 85,
        titik_kesalahan: p.gagal_titik_kritis ? ['Pelanggaran titik kritis SOP'] : [],
        rekomendasi_perbaikan: p.catatan_trainer || 'Pertahankan performa sesuai resep baku HARA.',
        status_kelulusan: p.status_kelulusan || (p.skor_akhir >= 85 ? 'Lulus Sempurna' : 'Lulus Bersyarat'),
        trainer_nama: p.nama_trainer || 'Haikal Abi',
        catatan_trainer: p.catatan_trainer || '-',
      }));
      const combined = [...tc, ...normalizedProd];
      const uniqueMap = new Map<string, any>();
      combined.forEach((item) => {
        if (item && item.id && !uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });
      return Array.from(uniqueMap.values());
    } catch {
      return [];
    }
  });

  const [outlets] = useState<Outlet[]>(() => {
    try {
      return db.getTable<Outlet>('outlets');
    } catch {
      return [];
    }
  });

  // Multi-select state for Bulk Deletion & Export
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOutlet, setFilterOutlet] = useState<string>(selectedOutletCode);
  const [filterStasiun, setFilterStasiun] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const loadData = () => {
    try {
      const tc = db.getTable<PenilaianOnboardingTC>('penilaian_onboarding_tc') || [];
      const prod = db.getPenilaianPraktikProduk() || [];
      const normalizedProd = prod.map((p) => ({
        id: p.id,
        tanggal: p.tanggal,
        peserta_nama: p.nama_kru,
        peserta_outlet: p.kode_outlet,
        peserta_divisi: p.divisi || 'Kitchen',
        kategori_peserta: 'Reguler',
        stasiun: p.station || 'Station SOP',
        task_nama: p.produk_nama,
        durasi_detik: p.durasi_detik || 600,
        target_durasi_detik: p.standar_durasi_detik || 600,
        deviasi_detik: (p.durasi_detik || 600) - (p.standar_durasi_detik || 600),
        skor_total: p.skor_akhir,
        skala_lima: Math.min(5, Number((p.skor_akhir / 20).toFixed(1))),
        grade: p.skor_akhir >= 85 ? 'A (Sangat Baik)' : p.skor_akhir >= 80 ? 'B (Baik)' : 'C (Perlu Bimbingan)',
        skor_ketepatan: p.skor_prosedur || 85,
        skor_kebersihan: p.skor_kebersihan || 85,
        skor_tim: p.skor_kerjasama || 85,
        skor_knowledge: p.skor_knowledge || 85,
        titik_kesalahan: p.gagal_titik_kritis ? ['Pelanggaran titik kritis SOP'] : [],
        rekomendasi_perbaikan: p.catatan_trainer || 'Pertahankan performa sesuai resep baku HARA.',
        status_kelulusan: p.status_kelulusan || (p.skor_akhir >= 85 ? 'Lulus Sempurna' : 'Lulus Bersyarat'),
        trainer_nama: p.nama_trainer || 'Haikal Abi',
        catatan_trainer: p.catatan_trainer || '-',
      }));
      const combined = [...tc, ...normalizedProd];
      const uniqueMap = new Map<string, any>();
      combined.forEach((item) => {
        if (item && item.id && !uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });
      setDataList(Array.from(uniqueMap.values()));
    } catch {
      // ignore
    }
  };

  // Selected Detail Modal
  const [detailItem, setDetailItem] = useState<PenilaianOnboardingTC | null>(null);

  // Time Formatter
  const formatTime = (totalSec: number) => {
    const isNeg = totalSec < 0;
    const abs = Math.abs(totalSec);
    const mins = Math.floor(abs / 60);
    const secs = abs % 60;
    return `${isNeg ? '-' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Filtered Dataset
  const filteredData = useMemo(() => {
    return dataList.filter((item) => {
      if (filterOutlet !== 'ALL' && item.peserta_outlet !== filterOutlet) {
        return false;
      }
      if (filterStasiun !== 'ALL' && item.stasiun !== filterStasiun) {
        return false;
      }
      if (filterStatus !== 'ALL' && item.status_kelulusan !== filterStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.peserta_nama.toLowerCase().includes(query);
        const matchOutlet = item.peserta_outlet.toLowerCase().includes(query);
        const matchTask = item.task_nama.toLowerCase().includes(query);
        if (!matchName && !matchOutlet && !matchTask) return false;
      }
      return true;
    });
  }, [dataList, filterOutlet, filterStasiun, filterStatus, searchQuery]);

  // Aggregate KPI Metrics
  const metrics = useMemo(() => {
    const total = filteredData.length;
    if (total === 0) {
      return {
        total: 0,
        avgSkor: 0,
        avgSkala: 0,
        lulusCount: 0,
        remedialCount: 0,
        lulusRate: 0,
        avgDelaySec: 0,
        avgKetepatan: 0,
        avgKebersihan: 0,
        avgTim: 0,
        avgKnowledge: 0,
      };
    }

    const sumSkor = filteredData.reduce((acc, curr) => acc + curr.skor_total, 0);
    const sumSkala = filteredData.reduce((acc, curr) => acc + curr.skala_lima, 0);
    const sumDelay = filteredData.reduce((acc, curr) => acc + curr.deviasi_detik, 0);
    const sumKetepatan = filteredData.reduce((acc, curr) => acc + curr.skor_ketepatan, 0);
    const sumKebersihan = filteredData.reduce((acc, curr) => acc + curr.skor_kebersihan, 0);
    const sumTim = filteredData.reduce((acc, curr) => acc + curr.skor_tim, 0);
    const sumKnowledge = filteredData.reduce((acc, curr) => acc + curr.skor_knowledge, 0);

    const lulusCount = filteredData.filter((i) => i.status_kelulusan !== 'Remedial Stasiun').length;
    const remedialCount = total - lulusCount;

    return {
      total,
      avgSkor: Number((sumSkor / total).toFixed(1)),
      avgSkala: Number((sumSkala / total).toFixed(2)),
      lulusCount,
      remedialCount,
      lulusRate: Math.round((lulusCount / total) * 100),
      avgDelaySec: Math.round(sumDelay / total),
      avgKetepatan: Math.round(sumKetepatan / total),
      avgKebersihan: Math.round(sumKebersihan / total),
      avgTim: Math.round(sumTim / total),
      avgKnowledge: Math.round(sumKnowledge / total),
    };
  }, [filteredData]);

  // Common Mistakes & Root Causes
  const rootCauses = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach((item) => {
      item.titik_kesalahan?.forEach((err) => {
        // Normalize slight variations
        const key = err.trim();
        map[key] = (map[key] || 0) + 1;
      });
    });

    return Object.entries(map)
      .map(([cause, count]) => ({ cause, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredData]);

  // Station Comparison Data
  const stationStats = useMemo(() => {
    const stasiuns = ['Station 1', 'Station 2', 'Station 3', 'Station 4'];
    return stasiuns.map((st) => {
      const items = filteredData.filter((d) => d.stasiun === st);
      const count = items.length;
      const avgScore = count > 0 ? Math.round(items.reduce((a, b) => a + b.skor_total, 0) / count) : 0;
      const avgDelay = count > 0 ? Math.round(items.reduce((a, b) => a + b.deviasi_detik, 0) / count) : 0;
      return { stasiun: st, count, avgScore, avgDelay };
    });
  }, [filteredData]);

  // ==========================================
  // EXPORT INDIVIDUAL PDF REPORT
  // ==========================================
  const handleExportIndividualPDF = (item: PenilaianOnboardingTC) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Brand Header
    doc.setFillColor(150, 23, 27); // #96171B
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('HARA CHICKEN INDONESIA', 14, 10);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('OPERATIONAL TRAINING CENTER & PEOPLE DEVELOPMENT DIVISION', 14, 16);
    doc.text('DOKUMEN HASIL EVALUASI PRAKTIK ONBOARDING KRU RESMI', 14, 20);

    // Metadata Box
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('LEMBAR HASIL EVALUASI INDIVIDUAL KRU', 14, 34);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nama Kru: ${item.peserta_nama}`, 14, 42);
    doc.text(`Outlet Asal: ${item.peserta_outlet}`, 14, 48);
    doc.text(`Divisi: ${item.peserta_divisi} (${item.kategori_peserta})`, 14, 54);
    doc.text(`Stasiun Uji: ${item.stasiun}`, 120, 42);
    doc.text(`Tanggal Evaluasi: ${new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, 120, 48);
    doc.text(`Trainer Penilai: ${item.trainer_nama}`, 120, 54);

    // Score Summary Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 60, 182, 28, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 60, 182, 28, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('HASIL KOMPILASI SKOR AKHIR & KELULUSAN:', 18, 67);

    doc.setFontSize(16);
    doc.setTextColor(150, 23, 27);
    doc.text(`${item.skor_total} / 100`, 18, 77);

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(`Skala 5: ${item.skala_lima}`, 75, 77);
    doc.text(`Grade: ${item.grade}`, 120, 77);

    doc.setTextColor(item.status_kelulusan === 'Remedial Stasiun' ? 185 : 22, item.status_kelulusan === 'Remedial Stasiun' ? 28 : 101, item.status_kelulusan === 'Remedial Stasiun' ? 28 : 52);
    doc.text(`Status: ${item.status_kelulusan}`, 145, 77);

    // 4 Pillars Table
    const tableData = [
      [
        '1. Ketepatan (Accuracy & SOS)',
        '35%',
        `${item.skor_ketepatan}/100`,
        `Durasi: ${formatTime(item.durasi_detik)} (Target: ${formatTime(item.target_durasi_detik)}, Deviasi: ${item.deviasi_detik > 0 ? '+' : ''}${item.deviasi_detik} dtk)`,
      ],
      [
        '2. Kebersihan (Cleanliness & 5S)',
        '25%',
        `${item.skor_kebersihan}/100`,
        'APD lengkap, sanitasi meja & alat, pemisahan limbah & lap standar',
      ],
      [
        '3. Kerja Sama Tim (Teamwork)',
        '20%',
        `${item.skor_tim}/100`,
        'Callout vokal shift, koordinasi serah terima pesanan, inisiatif back-up',
      ],
      [
        '4. Knowledge (Pemahaman SOP)',
        '20%',
        `${item.skor_knowledge}/100`,
        'Uji lisan titik kritis stasiun, standar suhu HACCP, respon keluhan',
      ],
    ];

    autoTable(doc, {
      startY: 94,
      head: [['Aspek Evaluasi Objektif', 'Bobot', 'Skor', 'Keterangan Parameter Pengukuran']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: 50 },
      margin: { left: 14, right: 14 },
    });

    const finalY = ((doc as any).lastAutoTable?.finalY ?? 130) + 8;

    // Titik Kesalahan Section
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('TITIK KESALAHAN & KEKURANGAN YANG TERIDENTIFIKASI (DI MANA SALAHNYA):', 14, finalY);

    doc.setFont('helvetica', 'normal');
    let curY = finalY + 6;
    if (item.titik_kesalahan && item.titik_kesalahan.length > 0) {
      item.titik_kesalahan.forEach((err, idx) => {
        doc.text(`• ${err}`, 16, curY);
        curY += 5;
      });
    } else {
      doc.text('• Tidak ditemukan pelanggaran SOP signifikan. Pelaksanaan tugas memenuhi standar prima.', 16, curY);
      curY += 5;
    }

    curY += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('REKOMENDASI PERBAIKAN & TINDAK LANJUT (YANG KURANG APA):', 14, curY);
    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(item.rekomendasi_perbaikan, 180), 16, curY);

    curY += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('CATATAN KHUSUS TRAINER OPERASIONAL:', 14, curY);
    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(item.catatan_trainer || '-', 180), 16, curY);

    // Signatures
    const signY = 245;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Kru Peserta Onboarding,', 25, signY);
    doc.text('Lead Trainer Penilai,', 145, signY);

    doc.setFont('helvetica', 'bold');
    doc.text(`( ${item.peserta_nama} )`, 25, signY + 22);
    doc.text(`( ${item.trainer_nama} )`, 145, signY + 22);

    doc.save(`Rapor_Onboarding_TC_${item.peserta_nama.replace(/\s+/g, '_')}.pdf`);
  };

  // ==========================================
  // EXPORT BATCH SUMMARY PDF
  // ==========================================
  const handleExportBatchSummaryPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Header
    doc.setFillColor(150, 23, 27);
    doc.rect(0, 0, 297, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('HARA CHICKEN INDONESIA - REKAPITULASI EVALUASI ONBOARDING TRAINING CENTER', 14, 10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')} | Total Peserta: ${metrics.total} Kru | Rata-rata Skor: ${metrics.avgSkor} (Skala ${metrics.avgSkala}) | Kelulusan: ${metrics.lulusRate}%`, 14, 16);

    const tableRows = filteredData.map((d, index) => [
      index + 1,
      d.peserta_nama,
      d.peserta_outlet,
      d.stasiun,
      `${formatTime(d.durasi_detik)} (${d.deviasi_detik > 0 ? '+' : ''}${d.deviasi_detik}s)`,
      d.skor_ketepatan,
      d.skor_kebersihan,
      d.skor_tim,
      d.skor_knowledge,
      `${d.skor_total} (Skala ${d.skala_lima})`,
      d.grade,
      d.status_kelulusan,
      (d.titik_kesalahan && d.titik_kesalahan[0]) || 'Sesuai Standar',
    ]);

    autoTable(doc, {
      startY: 26,
      head: [[
        'No', 'Nama Kru', 'Outlet', 'Stasiun', 'Durasi (Dev)',
        'Tepat', 'Bersih', 'Tim', 'Knowl', 'Skor (1-5)', 'Grd', 'Kelulusan', 'Temuan Utama'
      ]],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 7 },
      bodyStyles: { fontSize: 7, textColor: 40 },
      margin: { left: 10, right: 10 },
    });

    doc.save(`Rekap_Batch_Onboarding_TC_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <BarChart3 size={15} />
            <span>Pusat Data Analyst & Evaluasi Kelulusan Onboarding</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Data Analyst Onboarding TC & Analisis Gap Stasiun
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Rincian detail durasi pengerjaan, deviasi menit vs target SOS, identifikasi titik kesalahan (di mana salahnya), gap operasional (apa yang kurang), komparasi antar outlet, serta ekspor PDF resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={async () => {
              try {
                db.setDirect('kru', db.getKru());
                db.setDirect('outlets', db.getOutlets());
                db.setDirect('onboarding_batches', db.getOnboardingBatches());
                db.setDirect('penilaian_praktik_onboarding_produk', db.getPenilaianPraktikProduk());
                await syncAllToFirestore();
                loadData();
                alert('12 Peserta Onboarding 23-24 Oktober berhasil disinkronkan ke Cloud Firestore.');
              } catch {
                alert('Sinkronisasi selesai.');
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
            title="Muat ulang dan sinkronkan data 12 peserta ke Cloud Firestore"
          >
            <RefreshCw size={15} />
            <span>Sinkronkan 12 Peserta (Cloud)</span>
          </button>

          <button
            onClick={handleExportBatchSummaryPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download size={15} />
            <span>Export Rekap Batch PDF</span>
          </button>

          {onNavigateToForm && (
            <button
              onClick={onNavigateToForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-600 text-white hover:bg-amber-500 transition-colors shadow-2xs"
            >
              <Award size={15} />
              <span>Input Penilaian Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Kru Teruji</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {metrics.total} <span className="text-xs font-normal text-slate-500">Kru</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {metrics.lulusCount} Lulus · {metrics.remedialCount} Remedial
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Rata-rata Skor Komposit</span>
            <Award size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {metrics.avgSkor} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold font-mono mt-0.5">
            Setara Skala {metrics.avgSkala} / 5.0
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tingkat Kelulusan</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {metrics.lulusRate}%
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
            Standar KKM Minimal 70.0 Poin
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Rata-rata Deviasi Durasi</span>
            <Clock size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {metrics.avgDelaySec > 0 ? `+${metrics.avgDelaySec}s` : `${metrics.avgDelaySec}s`}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
            {formatTime(metrics.avgDelaySec)} vs Waktu Target SOS
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Radar 4 Pillars + Top Root Causes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar / 4 Pillars Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Rata-rata Performa 4 Pilar Onboarding
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kompilasi pencapaian 4 kriteria objektif pada batch terpilih
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">
              Target KKM: 75
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {/* 1. Ketepatan */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Ketepatan (Stopwatch SOS, Suhu, Gramatur)
                </span>
                <span className="font-mono text-slate-900">{metrics.avgKetepatan}/100</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, metrics.avgKetepatan)}%` }}
                ></div>
              </div>
            </div>

            {/* 2. Kebersihan */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Kebersihan (5S, APD & Sanitasi Dapur)
                </span>
                <span className="font-mono text-slate-900">{metrics.avgKebersihan}/100</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, metrics.avgKebersihan)}%` }}
                ></div>
              </div>
            </div>

            {/* 3. Kerja Sama Tim */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Kerja Sama Tim (Kitchen Callout & Handover)
                </span>
                <span className="font-mono text-slate-900">{metrics.avgTim}/100</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, metrics.avgTim)}%` }}
                ></div>
              </div>
            </div>

            {/* 4. Knowledge */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  Knowledge (Kuis SOP, Shelf-life & HACCP)
                </span>
                <span className="font-mono text-slate-900">{metrics.avgKnowledge}/100</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, metrics.avgKnowledge)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Stasiun Speed Breakdown */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Kinerja Durasi & Kecepatan per Stasiun:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              {stationStats.map((st) => (
                <div key={st.stasiun} className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="font-semibold text-slate-800">{st.stasiun}</div>
                  <div className="font-mono text-slate-900 font-bold mt-0.5">
                    {st.avgScore} pts
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Dev: {st.avgDelay > 0 ? `+${st.avgDelay}s` : `${st.avgDelay}s`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Root Causes / "Di Mana Salahnya" (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-600" />
                <span>Analisis Titik Kesalahan Terbanyak (Root Cause)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Frekuensi kesalahan faktual yang paling sering dilakukan peserta
              </p>
            </div>
          </div>

          {rootCauses.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 italic">
              Tidak ada catatan kesalahan faktual yang teridentifikasi.
            </div>
          ) : (
            <div className="space-y-2.5 mt-2">
              {rootCauses.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2 text-xs text-slate-700 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{item.cause}</span>
                  </div>
                  <span className="shrink-0 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {item.count} Kru
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FILTER CONTROLS & SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama kru, outlet asal, atau stasiun..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Outlet Filter */}
          <select
            value={filterOutlet}
            onChange={(e) => setFilterOutlet(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700"
          >
            <option value="ALL">Semua Outlet</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.kode_outlet}>
                {o.nama_outlet} ({o.kode_outlet})
              </option>
            ))}
          </select>

          {/* Stasiun Filter */}
          <select
            value={filterStasiun}
            onChange={(e) => setFilterStasiun(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700"
          >
            <option value="ALL">Semua Stasiun Uji</option>
            <option value="Station 1">Station 1 - Nasi & Marinasi</option>
            <option value="Station 2">Station 2 - Deep Fryer</option>
            <option value="Station 3">Station 3 - Geprek & Sambal</option>
            <option value="Station 4">Station 4 - Kasir & SOS</option>
          </select>

          {/* Kelulusan Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-700"
          >
            <option value="ALL">Semua Status Kelulusan</option>
            <option value="Lulus Sempurna">Lulus Sempurna</option>
            <option value="Lulus Bersyarat">Lulus Bersyarat</option>
            <option value="Remedial Stasiun">Remedial Stasiun</option>
          </select>
        </div>
      </div>

      {/* COMPREHENSIVE ANALYSIS TABLE WITH BULK ACTIONS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden space-y-0">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Tabel Diagnostik Detail Onboarding Kru</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-extrabold px-2 py-0.5 rounded-md">
                {filteredData.length} Data
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian durasi menit, analisis kesalahan, rekomendasi, serta fitur pencadangan dan hapus massal
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.size} data evaluasi terdaftar?`)) {
                    db.deletePenilaianPraktikProdukBulk(Array.from(selectedIds));
                    setSelectedIds(new Set());
                    loadData();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <span>Hapus {selectedIds.size} Terpilih</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const jsonStr = db.exportBackupDataJSON();
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `CADANGAN_EVALUASI_ONBOARDING_${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Download size={13} />
              <span>Ekspor JSON</span>
            </button>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400 italic">
            Tidak ada data evaluasi onboarding yang sesuai dengan filter pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set(filteredData.map(i => i.id)));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                      className="rounded border-slate-300 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">Kru & Kategori</th>
                  <th className="py-3 px-3">Outlet Asal</th>
                  <th className="py-3 px-3">Stasiun Uji</th>
                  <th className="py-3 px-3">Durasi vs Target (Menit)</th>
                  <th className="py-3 px-3 text-center">Skor & Skala</th>
                  <th className="py-3 px-3">Di Mana Salahnya? (Temuan Faktual)</th>
                  <th className="py-3 px-3">Yang Kurang Apa? (Rekomendasi)</th>
                  <th className="py-3 px-3 text-center">Kelulusan</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((item, idx) => (
                  <tr key={`${item.id}-${idx}`} className={`hover:bg-slate-50/70 transition-colors ${selectedIds.has(item.id) ? 'bg-amber-50/40' : ''}`}>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(item.id);
                          else next.delete(item.id);
                          setSelectedIds(next);
                        }}
                        className="rounded border-slate-300 cursor-pointer"
                      />
                    </td>
                    {/* Kru Name */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{item.peserta_nama}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <span>{item.peserta_divisi}</span>
                        {item.kategori_peserta === 'New' && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1 rounded">
                            New
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Outlet */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">
                      {item.peserta_outlet}
                    </td>

                    {/* Stasiun */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{item.stasiun}</span>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                        {item.task_nama}
                      </div>
                    </td>

                    {/* Durasi & Deviasi */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono">
                      <div className="font-bold text-slate-800">
                        {formatTime(item.durasi_detik)}{' '}
                        <span className="text-[11px] font-normal text-slate-500">
                          / {formatTime(item.target_durasi_detik)}
                        </span>
                      </div>
                      <div className="text-[10px]">
                        {item.deviasi_detik > 0 ? (
                          <span className="text-amber-700 font-semibold">
                            +{item.deviasi_detik} dtk ({formatTime(item.deviasi_detik)})
                          </span>
                        ) : item.deviasi_detik < 0 ? (
                          <span className="text-emerald-700 font-semibold">
                            {formatTime(item.deviasi_detik)}
                          </span>
                        ) : (
                          <span className="text-slate-500">Tepat Target</span>
                        )}
                      </div>
                    </td>

                    {/* Skor & Skala 5 */}
                    <td className="py-3 px-3 whitespace-nowrap text-center font-mono">
                      <div className="font-extrabold text-slate-900">
                        {item.skor_total}
                      </div>
                      <div className="text-[11px] text-amber-700 font-semibold">
                        Skala {item.skala_lima} ({item.grade})
                      </div>
                    </td>

                    {/* Di Mana Salahnya */}
                    <td className="py-3 px-3 max-w-[220px]">
                      {item.titik_kesalahan && item.titik_kesalahan.length > 0 ? (
                        <div className="space-y-0.5">
                          {item.titik_kesalahan.slice(0, 2).map((err, i) => (
                            <div
                              key={i}
                              className="text-[11px] text-red-700 bg-red-50 p-1 rounded leading-tight"
                            >
                              • {err}
                            </div>
                          ))}
                          {item.titik_kesalahan.length > 2 && (
                            <span className="text-[10px] text-slate-400 italic">
                              +{item.titik_kesalahan.length - 2} temuan lainnya
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-emerald-700 text-[11px] flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>Nihil (Sempurna)</span>
                        </span>
                      )}
                    </td>

                    {/* Yang Kurang Apa */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="text-[11px] text-slate-700 line-clamp-2 leading-tight">
                        {item.rekomendasi_perbaikan}
                      </div>
                    </td>

                    {/* Kelulusan */}
                    <td className="py-3 px-3 whitespace-nowrap text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status_kelulusan === 'Lulus Sempurna'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status_kelulusan === 'Lulus Bersyarat'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status_kelulusan}
                      </span>
                    </td>

                    {/* Aksi Button */}
                    <td className="py-3 px-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDetailItem(item)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Lihat Detail Diagnostik"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleExportIndividualPDF(item)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors inline-flex items-center gap-1 shadow-2xs"
                          title="Cetak PDF Rapor Resmi"
                        >
                          <Printer size={12} />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL VIEWER */}
      {detailItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  Rapor Diagnostik Onboarding
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {detailItem.peserta_nama} ({detailItem.peserta_outlet})
                </h3>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 text-xs">
              {/* Score Header Strip */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-500">Skor Total (0-100)</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{detailItem.skor_total}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Hasil Skala 5</div>
                  <div className="text-xl font-black text-amber-600 mt-0.5">{detailItem.skala_lima}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Status Kelulusan</div>
                  <div className="text-xs font-bold text-emerald-700 mt-1">{detailItem.status_kelulusan}</div>
                </div>
              </div>

              {/* Timing Analysis */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock size={13} className="text-amber-600" />
                  <span>Analisis Stopwatch & Speed of Service:</span>
                </div>
                <div className="text-slate-600 flex justify-between font-mono pt-1">
                  <span>Waktu Aktual: {formatTime(detailItem.durasi_detik)} ({detailItem.durasi_detik} dtk)</span>
                  <span>Target SOP: {formatTime(detailItem.target_durasi_detik)}</span>
                  <span className={detailItem.deviasi_detik > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700'}>
                    Deviasi: {detailItem.deviasi_detik > 0 ? `+${detailItem.deviasi_detik}s` : `${detailItem.deviasi_detik}s`}
                  </span>
                </div>
              </div>

              {/* 4 Pillars Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Ketepatan</div>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">{detailItem.skor_ketepatan}</div>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Kebersihan</div>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">{detailItem.skor_kebersihan}</div>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Kerja Sama Tim</div>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">{detailItem.skor_tim}</div>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Knowledge</div>
                  <div className="font-bold text-sm text-slate-900 mt-0.5">{detailItem.skor_knowledge}</div>
                </div>
              </div>

              {/* Titik Kesalahan Detail */}
              <div className="space-y-1">
                <div className="font-bold text-red-900 flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  <span>Di Mana Salahnya? (Titik Temuan Faktual):</span>
                </div>
                {detailItem.titik_kesalahan && detailItem.titik_kesalahan.length > 0 ? (
                  <ul className="space-y-1 pl-1">
                    {detailItem.titik_kesalahan.map((t, idx) => (
                      <li key={idx} className="bg-red-50 text-red-800 p-1.5 rounded text-[11px] leading-snug">
                        {idx + 1}. {t}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-400 italic pl-1">Tidak ada temuan kesalahan.</div>
                )}
              </div>

              {/* Rekomendasi Detail */}
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Yang Kurang Apa? (Rekomendasi Trainer):</div>
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
                  {detailItem.rekomendasi_perbaikan}
                </div>
              </div>

              {/* Catatan Trainer */}
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Catatan Observasi Tambahan:</div>
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600 italic">
                  "{detailItem.catatan_trainer}"
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-[11px] text-slate-400">
                Dievaluasi oleh: {detailItem.trainer_nama}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailItem(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  Tutup
                </button>
                <button
                  onClick={() => handleExportIndividualPDF(detailItem)}
                  className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer size={13} />
                  <span>Cetak PDF Rapor Resmi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
