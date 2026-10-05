import React, { useState, useMemo } from 'react';
import {
  Building2, Award, Users, BookOpen, CheckCircle2,
  AlertTriangle, Clock, Calendar, Target, TrendingUp,
  Download, Printer, Copy, Check, Edit3, Save,
  BarChart2, PieChart as PieIcon, ShieldCheck, Flame,
  Sparkles, Layers, ArrowUpRight, Filter
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Outlet, Kru, CrewCompetencySummary, TNA, CoachingLog,
  ObservasiLapangan, RencanaTraining, SystemSettings
} from '../../types';
import { OfficialDocumentHeader } from '../OfficialDocumentHeader';

interface MasterOutletExecutiveReportProps {
  selectedOutletCode: string;
  outlets: Outlet[];
  kruList: Kru[];
  competencyList: CrewCompetencySummary[];
  tnaList: TNA[];
  coachingList: CoachingLog[];
  observasiList: ObservasiLapangan[];
  trainingPlans: RencanaTraining[];
  settings: SystemSettings;
}

const BADGE_COLORS = {
  Mahir: '#059669', // Emerald
  Terampil: '#2563EB', // Blue
  Pemula: '#D97706', // Amber
  'Belum Ada Data': '#94A3B8', // Slate
};

export const MasterOutletExecutiveReport: React.FC<MasterOutletExecutiveReportProps> = ({
  selectedOutletCode,
  outlets,
  kruList,
  competencyList,
  tnaList,
  coachingList,
  observasiList,
  trainingPlans,
  settings,
}) => {
  const [filterOutlet, setFilterOutlet] = useState(selectedOutletCode || 'ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);

  // Period / Date
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // Filtered Datasets
  const filteredKru = useMemo(() => {
    if (filterOutlet === 'ALL') return kruList;
    return kruList.filter((k) => k.kode_outlet === filterOutlet);
  }, [kruList, filterOutlet]);

  const filteredComp = useMemo(() => {
    if (filterOutlet === 'ALL') return competencyList;
    return competencyList.filter((c) => c.kode_outlet === filterOutlet);
  }, [competencyList, filterOutlet]);

  const filteredTNA = useMemo(() => {
    if (filterOutlet === 'ALL') return tnaList;
    return tnaList.filter((t) => t.kode_outlet === filterOutlet);
  }, [tnaList, filterOutlet]);

  const filteredCoaching = useMemo(() => {
    if (filterOutlet === 'ALL') return coachingList;
    return coachingList.filter((c) => c.kode_outlet === filterOutlet);
  }, [coachingList, filterOutlet]);

  const filteredObservasi = useMemo(() => {
    if (filterOutlet === 'ALL') return observasiList;
    return observasiList.filter((o) => o.kode_outlet === filterOutlet);
  }, [observasiList, filterOutlet]);

  // Aggregate Metrics
  const totalKruCount = filteredKru.length;
  const mahirCount = filteredComp.filter((c) => c.badge === 'Mahir').length;
  const terampilCount = filteredComp.filter((c) => c.badge === 'Terampil').length;
  const pemulaCount = filteredComp.filter((c) => c.badge === 'Pemula' || c.badge === 'Belum Ada Data').length;
  
  const passingRate = totalKruCount > 0
    ? Math.round(((mahirCount + terampilCount) / totalKruCount) * 100)
    : 0;

  const validScores = filteredComp.map((c) => c.skorAkhir).filter((s): s is number => s !== null);
  const avgScore = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 0;

  // Division Averages
  const divisionStats = useMemo(() => {
    const divisions = ['Kitchen', 'Helper', 'Geprek', 'Kasir'] as const;
    return divisions.map((div) => {
      const items = filteredComp.filter((c) => c.divisi === div);
      const scores = items.map((i) => i.skorAkhir).filter((s): s is number => s !== null);
      const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      return {
        divisi: div,
        jumlahKru: items.length,
        rataRataSkor: avg,
        targetStandar: 80,
      };
    });
  }, [filteredComp]);

  // 4-Pillars Outlet Averages
  const pillarAverages = useMemo(() => {
    const calcAvg = (getter: (c: CrewCompetencySummary) => number | null) => {
      const vals = filteredComp.map(getter).filter((v): v is number => v !== null);
      return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    };
    return {
      teori: calcAvg((c) => c.skorTeori),
      praktik: calcAvg((c) => c.skorPraktik),
      lisan: calcAvg((c) => c.skorLisan),
      audit: calcAvg((c) => c.skorAudit),
    };
  }, [filteredComp]);

  // Badge Distribution Data for Pie Chart
  const badgePieData = [
    { name: 'Mahir (Mastery)', value: mahirCount, color: BADGE_COLORS.Mahir },
    { name: 'Terampil (Standar)', value: terampilCount, color: BADGE_COLORS.Terampil },
    { name: 'Pemula / Retraining', value: pemulaCount, color: BADGE_COLORS.Pemula },
  ];

  // Editable Narrative Content
  const [executiveSummary, setExecutiveSummary] = useState(
    `Berdasarkan audit komprehensif Trainer Operasional pada periode ini, tingkat kepatuhan SOP dan kompetensi kru mencapai passing rate ${passingRate}% (Rata-rata Skor Komposit: ${avgScore}/100). Terjadi penurunan signifikan pada temuan kesalahan gramasi bumbu dan peningkatan kedisiplinan APD dapur. Program pendampingan GROW telah menjangkau ${filteredCoaching.length} kru dengan tindak lanjut terukur.`
  );

  const [managementRecommendations, setManagementRecommendations] = useState<string[]>([
    'Wajibkan briefing 5 menit sebelum shift pembukaan untuk evaluasi checklist kebersihan & suhu minyak.',
    'Lakukan audit lisan berkala tiap 2 minggu untuk kru Kasir dan uji ketahanan jam sibuk.',
    'Berikan sertifikat dan delegasikan kru berpredikat Mahir sebagai Trainer Pendamping Cabang.',
    'Jadwalkan retraining intensif bagi kru berpredikat Pemula sebelum penugasan stasiun krusial.',
  ]);

  const [strategicRoadmap30Days, setStrategicRoadmap30Days] = useState<string[]>([
    'Standarisasi kalibrasi termometer deep fryer di seluruh stasiun dapur.',
    'Penyelesaian 100% gap TNA prioritas tinggi pada divisi Kitchen & Kasir.',
  ]);

  const [strategicRoadmap60Days, setStrategicRoadmap60Days] = useState<string[]>([
    'Pelaksanaan sertifikasi resmi Trainer Lapangan (Field Trainer Batch II).',
    'Simulasi penanganan lonjakan jam sibuk (Rush Hour Mastery Workshop).',
  ]);

  const [signerPD, setSignerPD] = useState(settings.lead_trainer?.split('(')[0]?.trim() || 'Haikal Abi');
  const [signerOutlet, setSignerOutlet] = useState('Penanggung Jawab Cabang / Area Supervisor');

  const docNumber = `HC/REP-EXEC/${filterOutlet}/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;

  // WhatsApp Broadcast Generator
  const handleCopyWhatsApp = () => {
    const text = `*📊 LAPORAN EKSEKUTIF KONSOLIDASI AUDIT & STANDARISASI OPERASIONAL*
*HARA CHICKEN - TRAINER OPERASIONAL*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *No. Dokumen:* ${docNumber}
🏬 *Cakupan Outlet:* ${filterOutlet === 'ALL' ? 'Seluruh Jaringan Outlet' : `Outlet ${filterOutlet}`}
🗓️ *Periode Evaluasi:* ${startDate} s.d. ${endDate}

*📈 RINGKASAN KEY PERFORMANCE INDICATORS (KPIs):*
• 👥 *Total Kru Terdaftar:* ${totalKruCount} Orang
• 🏆 *Passing Rate Kompetensi:* *${passingRate}%*
• 📊 *Rata-Rata Skor Komposit:* *${avgScore} / 100*
• 🏅 *Distribusi Predikat:* Mahir: ${mahirCount} | Terampil: ${terampilCount} | Pemula: ${pemulaCount}
• 🎯 *Sesi GROW Dilaksanakan:* ${filteredCoaching.length} Sesi
• 🔍 *Temuan TNA Ditangani:* ${filteredTNA.length} Kasus

*🔍 RINGKASAN EKSEKUTIF:*
"${executiveSummary}"

*✅ REKOMENDASI STRATEGIS UNTUK MANAJEMEN OUTLET:*
${managementRecommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

*🚀 ROADMAP STRATEGIS 30 - 60 HARI:*
• *30 Hari:* ${strategicRoadmap30Days.join('; ')}
• *60 Hari:* ${strategicRoadmap60Days.join('; ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Trainer Operasional:* ${signerPD} (Trainer Operasional)
🏢 *Otorisasi:* ${signerOutlet}
_Diterbitkan Resmi via Sistem HARA CHICKEN TRAINER PRO_`;

    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2500);
  };

  // PDF Export
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Header Band
    doc.setFillColor(150, 23, 27);
    doc.rect(0, 0, 210, 24, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('HARA CHICKEN - TRAINER OPERASIONAL', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(253, 214, 106);
    doc.text('LAPORAN STRATEGIS KONSOLIDASI MUTU, AUDIT KOMPETENSI & STANDARISASI CABANG', 14, 18);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`No. Dokumen: ${docNumber}`, 14, 30);
    doc.text(`Periode: ${startDate} s.d. ${endDate} | Outlet: ${filterOutlet}`, 120, 30);

    // KPI Summary Grid in PDF
    autoTable(doc, {
      startY: 34,
      head: [['Total Kru', 'Passing Rate', 'Rata-Rata Skor', 'Mahir', 'Terampil', 'Pemula / Retraining', 'Sesi GROW']],
      body: [
        [
          `${totalKruCount} Kru`,
          `${passingRate}%`,
          `${avgScore} / 100`,
          `${mahirCount} Kru`,
          `${terampilCount} Kru`,
          `${pemulaCount} Kru`,
          `${filteredCoaching.length} Sesi`,
        ],
      ],
      headStyles: { fillColor: [150, 23, 27], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
      bodyStyles: { fontSize: 8, textColor: [30, 30, 30], halign: 'center', fontStyle: 'bold' },
      theme: 'grid',
    });

    // Division Performance Breakdown Table
    let currentY = (doc as any).lastAutoTable.finalY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(150, 23, 27);
    doc.text('I. KINERJA KOMPETENSI PER DIVISI OPERASIONAL', 14, currentY);

    autoTable(doc, {
      startY: currentY + 3,
      head: [['Divisi Kerja', 'Jumlah Kru', 'Rata-Rata Skor', 'Standar Minimum', 'Status Pemenuhan Standar']],
      body: divisionStats.map((d) => [
        `Divisi ${d.divisi}`,
        `${d.jumlahKru} Orang`,
        `${d.rataRataSkor} / 100`,
        '80 / 100',
        d.rataRataSkor >= 80 ? 'MEMENUHI TARGET' : 'PERLU PENGUATAN',
      ]),
      headStyles: { fillColor: [60, 60, 60], textColor: [255, 255, 255], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      theme: 'striped',
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // Executive Summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(150, 23, 27);
    doc.text('II. RINGKASAN EKSEKUTIF AUDIT & EVALUASI', 14, currentY);

    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    const splitSummary = doc.splitTextToSize(executiveSummary, 182);
    doc.text(splitSummary, 14, currentY);
    currentY += splitSummary.length * 4.2 + 4;

    // Management Recommendations
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(150, 23, 27);
    doc.text('III. REKOMENDASI STRATEGIS & TINDAK LANJUT MANAJEMEN', 14, currentY);

    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    managementRecommendations.forEach((rec) => {
      doc.text(`• ${rec}`, 16, currentY);
      currentY += 4.2;
    });

    // Roadmap 30 - 60 Days
    currentY += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(150, 23, 27);
    doc.text('IV. STRATEGIC ROADMAP (30 - 60 HARI MENDATANG)', 14, currentY);

    currentY += 4.5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    doc.text('Target 30 Hari:', 16, currentY);
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    strategicRoadmap30Days.forEach((act) => {
      doc.text(`  - ${act}`, 18, currentY);
      currentY += 4;
    });

    currentY += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Target 60 Hari:', 16, currentY);
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    strategicRoadmap60Days.forEach((act) => {
      doc.text(`  - ${act}`, 18, currentY);
      currentY += 4;
    });

    if (currentY > 235) {
      doc.addPage();
      currentY = 25;
    }

    // Signatures
    currentY += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);

    doc.text('Disusun & Diverifikasi Oleh:', 25, currentY);
    doc.text('Disetujui & Diterima Oleh:', 135, currentY);

    currentY += 16;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(signerPD, 25, currentY);
    doc.text(signerOutlet, 135, currentY);

    doc.line(25, currentY + 1.5, 75, currentY + 1.5);
    doc.line(135, currentY + 1.5, 185, currentY + 1.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text('Trainer Operasional - HARA TRAINING & OPERATIONS', 25, currentY + 5);
    doc.text('Penanggung Jawab Cabang / Area Supervisor', 135, currentY + 5);

    doc.save(`Laporan_Eksekutif_${filterOutlet}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Control Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Building2 size={16} className="text-[#96171B]" />
            <span>Pilih Outlet:</span>
          </span>

          <select
            value={filterOutlet}
            onChange={(e) => setFilterOutlet(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:ring-2 focus:ring-[#96171B]"
          >
            <option value="ALL">Semua Jaringan Cabang (Konsolidasi Total)</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.kode_outlet}>
                {o.kode_outlet} - {o.nama_outlet}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`btn-secondary-enterprise !py-1.5 !px-3 text-xs flex items-center gap-1.5 cursor-pointer ${
              isEditing ? '!bg-amber-100 !border-amber-400 !text-amber-900 font-black' : ''
            }`}
          >
            <Edit3 size={14} className="text-[#96171B]" />
            <span>{isEditing ? 'Selesai Kustomisasi' : 'Kustomisasi Catatan'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className={`btn-secondary-enterprise !py-1.5 !px-3 text-xs flex items-center gap-1.5 cursor-pointer ${
              copiedWA ? '!bg-emerald-600 !text-white' : ''
            }`}
          >
            {copiedWA ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedWA ? 'Tersalin ke WA' : 'Share WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary-enterprise !py-1.5 !px-3 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={14} />
            <span>Cetak</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="btn-primary-enterprise !py-1.5 !px-3.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs bg-[#96171B] hover:bg-[#781014] text-white"
          >
            <Download size={14} />
            <span>Unduh Laporan PDF</span>
          </button>
        </div>
      </div>

      {/* Editable State Drawer */}
      {isEditing && (
        <div className="p-5 bg-amber-50/70 border-2 border-amber-300 rounded-2xl shadow-xs space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <Sparkles size={16} />
              <span>Editor Laporan Strategis Manajerial</span>
            </div>
            <span className="text-xs text-amber-700">Perubahan langsung terintegrasi pada lembar pratinjau</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Ringkasan Eksekutif Hasil Audit:
              </label>
              <textarea
                rows={3}
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#96171B] text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Trainer Operasional:</label>
                <input
                  type="text"
                  value={signerPD}
                  onChange={(e) => setSignerPD(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jabatan Otorisasi Outlet / Area:</label>
                <input
                  type="text"
                  value={signerOutlet}
                  onChange={(e) => setSignerOutlet(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* THE MASTER PRINTABLE REPORT SHEET */}
      {/* ========================================================================= */}
      <div className="printable-document-sheet bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Kop Surat Resmi */}
        <OfficialDocumentHeader
          docNumber={docNumber}
          date={`Bekasi, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          subLabel="Laporan Strategis Audit Mutu, Evaluasi Kompetensi & Standardisasi Cabang"
          extraInfo="Executive Multi-Outlet Consolidation Dossier • Divisi Training & Operasional"
        />

        {/* Header Title */}
        <div className="text-center py-3 bg-gradient-to-r from-slate-50 via-red-50/40 to-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide font-sans">
            LAPORAN EKSEKUTIF KONSOLIDASI AUDIT KOMPETENSI & STANDARISASI OPERASIONAL
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Cakupan: <b>{filterOutlet === 'ALL' ? 'Seluruh Jaringan Restoran' : `Outlet ${filterOutlet}`}</b> • Periode: {startDate} s.d. {endDate}
          </p>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Kru Aktif</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{totalKruCount} Kru</span>
            <span className="text-[10px] text-slate-500 font-medium">{outlets.length} Total Cabang</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Passing Rate Standar</span>
            <span className="text-xl font-black text-emerald-700 mt-0.5 block">{passingRate}%</span>
            <span className="text-[10px] text-emerald-600 font-bold">Target Min: 85%</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Rata-Rata Skor Komposit</span>
            <span className="text-xl font-black text-[#96171B] mt-0.5 block">{avgScore} / 100</span>
            <span className="text-[10px] text-slate-500">Passing Grade: 78</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Pembinaan GROW</span>
            <span className="text-xl font-black text-blue-700 mt-0.5 block">{filteredCoaching.length} Sesi</span>
            <span className="text-[10px] text-blue-600 font-bold">{filteredTNA.length} Temuan TNA</span>
          </div>
        </div>

        {/* 4-Pillars Aggregate Benchmark Card */}
        <div className="p-4 bg-gradient-to-r from-red-50/50 via-slate-50 to-amber-50/40 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} className="text-[#96171B]" />
              <span>Rata-Rata Capaian 4 Pilar Objektif Cabang</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Standar Kelulusan Minimum: 75</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400">1. Teori SOP (25%)</div>
              <div className="text-base font-black text-blue-700 mt-0.5">{pillarAverages.teori} <span className="text-[10px] text-slate-400 font-normal">/ 100</span></div>
              <div className="text-[9.5px] text-slate-500 font-medium">Zero-Bias Auto Correct</div>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400">2. Praktik SOS (35%)</div>
              <div className="text-base font-black text-emerald-700 mt-0.5">{pillarAverages.praktik} <span className="text-[10px] text-slate-400 font-normal">/ 100</span></div>
              <div className="text-[9.5px] text-slate-500 font-medium">Stopwatch & Suhu 160°C</div>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400">3. Lisan HACCP (20%)</div>
              <div className="text-base font-black text-amber-700 mt-0.5">{pillarAverages.lisan} <span className="text-[10px] text-slate-400 font-normal">/ 100</span></div>
              <div className="text-[9.5px] text-slate-500 font-medium">Reasoning & Why SOP</div>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400">4. Audit K3 & 5S (20%)</div>
              <div className="text-base font-black text-purple-700 mt-0.5">{pillarAverages.audit} <span className="text-[10px] text-slate-400 font-normal">/ 100</span></div>
              <div className="text-[9.5px] text-slate-500 font-medium">Inspeksi Shift Lapangan</div>
            </div>
          </div>
        </div>

        {/* Visual Charts (Division Comparison & Badge Distribution) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Bar Chart: Division Performance */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <BarChart2 size={14} className="text-[#96171B]" />
                <span>Rata-Rata Skor Kompetensi Per Divisi</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">Target Standard: 80</span>
            </div>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={divisionStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="divisi" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="rataRataSkor" name="Rata-Rata Skor" fill="#96171B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="targetStandar" name="Target Minimum" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Badge Distribution */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <PieIcon size={14} className="text-[#96171B]" />
                <span>Distribusi Kualifikasi Predikat Kru</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {mahirCount + terampilCount} Lolos Standard
              </span>
            </div>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={badgePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {badgePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '10.5px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Section 1: Executive Summary */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
            <Sparkles size={14} className="text-[#96171B]" />
            <span>I. Ringkasan Eksekutif & Temuan Kunci Audit</span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-medium pl-6">
            {executiveSummary}
          </p>
        </div>

        {/* Section 2: Division Performance Table */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} className="text-[#96171B]" />
              <span>II. Matriks Kinerja Kompetensi Lintas Divisi</span>
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#96171B] text-white text-[11px] font-bold uppercase">
                <tr>
                  <th className="p-2.5">Divisi Operasional</th>
                  <th className="p-2.5 text-center w-28">Jumlah Kru</th>
                  <th className="p-2.5 text-center w-32">Rata-Rata Skor</th>
                  <th className="p-2.5 text-center w-32">Standar Lulus</th>
                  <th className="p-2.5">Status Pemenuhan Standar Mutu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {divisionStats.map((stat, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">Divisi {stat.divisi}</td>
                    <td className="p-2.5 text-center font-bold text-slate-700">{stat.jumlahKru} Orang</td>
                    <td className="p-2.5 text-center font-black text-sm text-[#96171B]">{stat.rataRataSkor}</td>
                    <td className="p-2.5 text-center font-semibold text-slate-500">80 / 100</td>
                    <td className="p-2.5">
                      <span className={`inline-block font-black text-[10.5px] px-2.5 py-0.5 rounded ${
                        stat.rataRataSkor >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {stat.rataRataSkor >= 80 ? 'MEMENUHI TARGET MUTU' : 'PERLU PENDAMPINGAN INTENSIF'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Strategic Recommendations & 30-60 Day Roadmap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>III. Rekomendasi Aksi untuk Manajemen Outlet</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {managementRecommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-[#96171B] uppercase tracking-wider">
              <Target size={16} className="text-[#96171B]" />
              <span>IV. Strategic Roadmap (30 - 60 Hari)</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10.5px] font-black uppercase text-amber-800 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                <Clock size={11} className="text-amber-700" />
                <span>Target 30 Hari:</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 pl-1">
                {strategicRoadmap30Days.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-[10.5px] font-black uppercase text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 w-fit">
                <Target size={11} className="text-blue-700" />
                <span>Target 60 Hari:</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 pl-1">
                {strategicRoadmap60Days.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Section 4: Dual Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-200 text-center text-xs print-avoid-break">
          <div className="space-y-12">
            <span className="text-slate-500 font-bold block">Disusun & Diverifikasi Oleh:</span>
            <div>
              <div className="font-black text-slate-900 underline text-sm">{signerPD}</div>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">Trainer Operasional Cabang</div>
              <div className="text-[9.5px] text-slate-400 font-bold">HARA TRAINING & OPERATIONS</div>
            </div>
          </div>

          <div className="space-y-12">
            <span className="text-slate-500 font-bold block">Disetujui & Diterima Oleh:</span>
            <div>
              <div className="font-black text-slate-900 underline text-sm">{signerOutlet}</div>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">Pimpinan Unit Cabang / Area Supervisor</div>
              <div className="text-[9.5px] text-slate-400 font-bold">{filterOutlet === 'ALL' ? 'Seluruh Cabang' : `Outlet ${filterOutlet}`}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
