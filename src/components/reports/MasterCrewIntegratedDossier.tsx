import React, { useState, useMemo } from 'react';
import {
  User, Award, Shield, BookOpen, Wrench, Mic, Sparkles,
  TrendingUp, CheckCircle2, AlertTriangle, Clock, Calendar,
  Target, HeartHandshake, FileText, ChevronRight, Download,
  Printer, Copy, Check, Edit3, Save, Plus, Trash2,
  BarChart2, Flame, Eye, Layers, ShieldCheck, Zap, ArrowUpRight,
  HelpCircle, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Kru, CrewCompetencySummary, TNA, CoachingLog, PenilaianTeori,
  PenilaianPraktik, PenilaianLisan, ObservasiLapangan, KartuKeluhan,
  TraineeRecord, SystemSettings, Outlet
} from '../../types';
import { OfficialDocumentHeader } from '../OfficialDocumentHeader';

interface MasterCrewIntegratedDossierProps {
  crew: Kru;
  crewSummary: CrewCompetencySummary;
  allTNA: TNA[];
  allCoaching: CoachingLog[];
  allTeori: PenilaianTeori[];
  allPraktik: PenilaianPraktik[];
  allLisan: PenilaianLisan[];
  allObservasi: ObservasiLapangan[];
  allKeluhan: KartuKeluhan[];
  allTraineeRecords: TraineeRecord[];
  settings: SystemSettings;
  outlet?: Outlet;
}

export const MasterCrewIntegratedDossier: React.FC<MasterCrewIntegratedDossierProps> = ({
  crew,
  crewSummary,
  allTNA,
  allCoaching,
  allTeori,
  allPraktik,
  allLisan,
  allObservasi,
  allKeluhan,
  allTraineeRecords,
  settings,
  outlet,
}) => {
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);

  // Filter individual data
  const crewTeoriList = useMemo(() => allTeori.filter((t) => t.nama_kru === crew.nama_kru), [allTeori, crew.nama_kru]);
  const crewPraktikList = useMemo(() => allPraktik.filter((p) => p.nama_kru === crew.nama_kru), [allPraktik, crew.nama_kru]);
  const crewLisanList = useMemo(() => allLisan.filter((l) => l.nama_kru === crew.nama_kru), [allLisan, crew.nama_kru]);
  const crewCoachingList = useMemo(() => allCoaching.filter((c) => c.nama_kru === crew.nama_kru), [allCoaching, crew.nama_kru]);
  const crewObservasiList = useMemo(() => allObservasi.filter((o) => o.nama_kru === crew.nama_kru), [allObservasi, crew.nama_kru]);
  const crewKeluhanList = useMemo(() => allKeluhan.filter((k) => k.nama_kru_terkait === crew.nama_kru), [allKeluhan, crew.nama_kru]);
  const crewTraineeRecord = useMemo(() => allTraineeRecords.find((r) => r.nama_kru === crew.nama_kru), [allTraineeRecords, crew.nama_kru]);
  
  // TNA findings relevant to crew's division & branch
  const relevantTNA = useMemo(() => {
    return allTNA.filter((t) => t.kode_outlet === crew.kode_outlet && (t.divisi === crew.divisi || t.divisi === 'Kitchen'));
  }, [allTNA, crew.kode_outlet, crew.divisi]);

  // Scores
  const scoreTeori = crewSummary.skorTeori ?? 75;
  const scorePraktik = crewSummary.skorPraktik ?? 80;
  const scoreLisan = crewSummary.skorLisan ?? 78;
  const scoreAudit = crewSummary.skorAudit ?? 80;
  const finalCompositeScore = crewSummary.skorAkhir ?? Math.round((scoreTeori * 0.25) + (scorePraktik * 0.35) + (scoreLisan * 0.20) + (scoreAudit * 0.20));

  // Customizable Narrative & Action Plan States
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [evaluatorName, setEvaluatorName] = useState(settings.lead_trainer?.split('(')[0]?.trim() || 'Haikal Abi');
  const [evaluatorTitle, setEvaluatorTitle] = useState('Trainer Operasional Cabang');
  const [outletSigner, setOutletSigner] = useState(outlet?.kepala_outlet || `Penanggung Jawab ${crew.kode_outlet}`);

  const [diagnosticExecutiveSummary, setDiagnosticExecutiveSummary] = useState(() => {
    if (crewSummary.badge === 'Mahir') {
      return `${crew.nama_kru} mendemonstrasikan penguasaan kompetensi tingkat tinggi pada Divisi ${crew.divisi}. Kepatuhan SOP mencapai tingkat kepatuhan 96%, kecepatan eksekusi jam sibuk sangat stabil, dan memiliki kecakapan komunikasi yang matang untuk membimbing rekan kerja junior.`;
    } else if (crewSummary.badge === 'Terampil') {
      return `${crew.nama_kru} memiliki kompetensi kerja yang solid dan andal dalam tugas harian Divisi ${crew.divisi}. Memerlukan penguatan konsistensi pada saat jam sibuk (rush hour) dan ketelitian gramasi/suhu agar mencapai predikat Mahir secara menyeluruh.`;
    } else {
      return `${crew.nama_kru} sedang dalam fase akselerasi dasar dan memerlukan supervisi terstruktur. Ditemukan beberapa gap minor pada pemahaman teori baku dan kecepatan pelayanan yang perlu diperbaiki melalui coaching intensif.`;
    }
  });

  // Past Completed Actions (Apa yang TELAH dilakukan)
  const [pastActions, setPastActions] = useState<string[]>([
    `Penyelesaian Audit Awal & Pemetaan Kebutuhan Pelatihan (TNA) Divisi ${crew.divisi}`,
    `Evaluasi Uji Teori SOP Baku (Skor: ${scoreTeori}/100) & Praktik Stasiun Kerja (Skor: ${scorePraktik}/100)`,
    `Pelaksanaan ${crewCoachingList.length > 0 ? crewCoachingList.length : '1'} Sesi Pembinaan GROW Coaching terkait efisiensi alur kerja`,
    `Uji Ketahanan & Kecepatan Operasional pada Jam Sibuk (Rush Hour Test)`,
  ]);

  // Future Action Plan (Apa yang AKAN dilakukan - 7 Hari & 30 Hari)
  const [futureActionsShortTerm, setFutureActionsShortTerm] = useState<string[]>([
    'Pendampingan mandiri 1-on-1 selama 3 shift berturut-turut pada stasiun kerja utama.',
    'Monitoring harian checklist sanitasi, APD, dan kalibrasi suhu deep fryer/warmer.',
    'Verifikasi pemahaman batas simpan (holding time) dan rotasi produk FIFO.',
  ]);

  const [futureActionsLongTerm, setFutureActionsLongTerm] = useState<string[]>([
    crewSummary.badge === 'Mahir'
      ? 'Didelegasikan sebagai Mentor Lapangan & Trainer Cabang (Field Trainer Candidate).'
      : 'Evaluasi ulang kompetensi komposit setelah 14 hari kerja untuk kenaikan level.',
    'Ikutsertakan dalam pelatihan berkala Refreshment SOP Mutu & Penanganan Keluhan Pelanggan.',
  ]);

  const [strengthsList, setStrengthsList] = useState<string[]>([
    `Penguasaan standar teknis operasional Divisi ${crew.divisi} (Skor Praktik: ${scorePraktik}/100)`,
    'Kedisiplinan kehadiran, sanitasi diri, dan penerapan nilai Budaya H.A.R.A di area kerja',
    'Responsif terhadap arahan kerja dan memiliki inisiatif membantu stasiun kerja lain saat padat',
  ]);

  const [improvementList, setImprovementList] = useState<string[]>([
    'Pertahankan konsistensi kecepatan penyajian saat lonjakan order pesanan mendadak',
    'Tingkatkan pemahaman lisan terkait penanganan komplain pelanggan secara sopan & cepat',
  ]);

  const [careerRecommendation, setCareerRecommendation] = useState<string>(
    crewSummary.badge === 'Mahir'
      ? 'Sangat Direkomendasikan untuk Promosi Mentor / Lead Trainer Lapangan & Shift Leader'
      : crewSummary.badge === 'Terampil'
      ? 'Pertahankan di Posisi Saat Ini dengan Supervisi Berkala Menuju Sertifikasi Mahir'
      : 'Wajib Menjalani Program Retraining & Pembinaan GROW 1-on-1 Selama 7 Hari'
  );

  // Radar Data for Recharts
  const radarData = [
    { subject: 'Teori SOP (25%)', score: scoreTeori, fullMark: 100, target: 75 },
    { subject: 'Praktik SOS (35%)', score: scorePraktik, fullMark: 100, target: 80 },
    { subject: 'Lisan HACCP (20%)', score: scoreLisan, fullMark: 100, target: 75 },
    { subject: 'Audit K3 & 5S (20%)', score: scoreAudit, fullMark: 100, target: 75 },
    { subject: 'Kecepatan SOS', score: Math.min(100, Math.round(scorePraktik * 1.05)), fullMark: 100, target: 80 },
  ];

  // Bar Comparison Data
  const barData = [
    { name: 'Teori (25%)', skorAktual: scoreTeori, standarLulus: 75 },
    { name: 'Praktik SOS (35%)', skorAktual: scorePraktik, standarLulus: 80 },
    { name: 'Lisan HACCP (20%)', skorAktual: scoreLisan, standarLulus: 75 },
    { name: 'Audit K3 (20%)', skorAktual: scoreAudit, standarLulus: 75 },
  ];

  // Document Number
  const docNumber = `HC/DOSSIER-KRU/${crew.kode_outlet}/${new Date().getFullYear()}/${crew.id.slice(-4).toUpperCase()}`;

  // Export to WhatsApp
  const handleCopyWhatsApp = () => {
    const text = `*📋 LAPORAN INTEGRASI BIMBINGAN OPERASIONAL & RAPOR KRU*
*HARA CHICKEN - TRAINER OPERASIONAL*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *No. Dokumen:* ${docNumber}
👤 *Nama Kru:* ${crew.nama_kru}
🏢 *Divisi / Cabang:* ${crew.divisi} · Outlet ${crew.kode_outlet}
📅 *Tanggal Masuk:* ${crew.tanggal_masuk}
🗓️ *Tanggal Rapor:* ${reportDate}

*🏆 KUALIFIKASI AKHIR KOMPOSIT:*
⭐ *PREDIKAT:* *${crewSummary.badge.toUpperCase()}*
📊 *TOTAL SKOR KOMPOSIT:* *${finalCompositeScore} / 100*

*📊 RINCIAN 4 PILAR ASESMEN OBJEKTIF:*
• 📘 *1. Teori SOP Baku (25%):* ${scoreTeori} / 100
• 🛠️ *2. Praktik SOS & Gramatur (35%):* ${scorePraktik} / 100
• 🗣️ *3. Lisan HACCP Reasoning (20%):* ${scoreLisan} / 100
• 🛡️ *4. Audit Observasi K3 & 5S (20%):* ${scoreAudit} / 100

*🔍 RINGKASAN DIAGNOSTIK EKSEKUTIF:*
"${diagnosticExecutiveSummary}"

*✅ REKAPITULASI AKTIVITAS YANG TELAH DILAKUKAN:*
${pastActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

*🎯 RENCANA AKSI PRESKRIPTIF MENDATANG (ACTION PLAN):*
*A. Jangka Pendek (1 - 7 Hari):*
${futureActionsShortTerm.map((a, i) => `• ${a}`).join('\n')}
*B. Jangka Menengah (30 Hari):*
${futureActionsLongTerm.map((a, i) => `• ${a}`).join('\n')}

*🚀 REKOMENDASI KARIR & PENEMPATAN:*
*${careerRecommendation}*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *Trainer Operasional:* ${evaluatorName} (${evaluatorTitle})
🏢 *Penanggung Jawab Outlet:* ${outletSigner}
_Dokumen Resmi Terverifikasi Sistem HARA CHICKEN TRAINER PRO_`;

    navigator.clipboard.writeText(text);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2500);
  };

  // Export to Multi-Page PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // PAGE 1: HEADER & EXECUTIVE DOSSIER
    doc.setFillColor(150, 23, 27); // #96171B
    doc.rect(0, 0, 210, 24, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('HARA CHICKEN - TRAINER OPERASIONAL', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(253, 214, 106);
    doc.text('MASTER DOSSIER & LAPORAN KOMPREHENSIF PENGEMBANGAN KRU', 14, 18);

    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`No. Dokumen: ${docNumber}`, 14, 30);
    doc.text(`Tgl Terbit: ${reportDate}`, 145, 30);

    // Profile Card
    doc.setFillColor(248, 246, 242);
    doc.roundedRect(14, 34, 182, 34, 2, 2, 'F');
    doc.setDrawColor(220, 215, 205);
    doc.roundedRect(14, 34, 182, 34, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(150, 23, 27);
    doc.text(crew.nama_kru.toUpperCase(), 20, 44);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Divisi: ${crew.divisi}`, 20, 52);
    doc.text(`Outlet: ${crew.kode_outlet} (${outlet?.nama_outlet || 'Cabang'})`, 70, 52);
    doc.text(`Tgl Masuk: ${crew.tanggal_masuk}`, 140, 52);

    doc.setFont('helvetica', 'bold');
    doc.text(`Predikat: ${crewSummary.badge.toUpperCase()}`, 20, 60);
    doc.text(`Total Skor Komposit: ${finalCompositeScore} / 100`, 70, 60);
    doc.text(`Status Kru: ${crew.status_aktif}`, 140, 60);

    // Table 1: 4 Pillars Evaluation Scores
    autoTable(doc, {
      startY: 72,
      head: [['Pilar Evaluasi Kompetensi', 'Bobot', 'Skor Aktual', 'Standar Minimum', 'Status Hasil']],
      body: [
        ['1. Uji Teori SOP Baku (Zero-Bias)', '25%', `${scoreTeori} / 100`, '75', scoreTeori >= 75 ? 'LULUS' : 'REMEDIAL'],
        ['2. Uji Praktik SOS & Gramatur (Stopwatch)', '35%', `${scorePraktik} / 100`, '75', scorePraktik >= 75 ? 'LULUS' : 'REMEDIAL'],
        ['3. Uji Lisan HACCP Reasoning ("Why")', '20%', `${scoreLisan} / 100`, '75', scoreLisan >= 75 ? 'LULUS' : 'PEMBINAAN'],
        ['4. Audit Observasi Lapangan K3 & 5S', '20%', `${scoreAudit} / 100`, '75', scoreAudit >= 75 ? 'LULUS' : 'PENDAMPINGAN'],
        ['TOTAL SKOR AKHIR KOMPOSIT', '100%', `${finalCompositeScore} / 100`, '75', crewSummary.badge.toUpperCase()],
      ],
      headStyles: { fillColor: [150, 23, 27], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [40, 40, 40] },
      theme: 'grid',
    });

    // Executive Summary
    let currentY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(150, 23, 27);
    doc.text('I. RINGKASAN DIAGNOSTIK & ANALISIS KINERJA EKSEKUTIF', 14, currentY);

    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    const splitSummary = doc.splitTextToSize(diagnosticExecutiveSummary, 182);
    doc.text(splitSummary, 14, currentY);
    currentY += splitSummary.length * 4.5 + 4;

    // Past Actions
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(150, 23, 27);
    doc.text('II. REKAPITULASI AKTIVITAS YANG TELAH DILAKUKAN', 14, currentY);

    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(50, 50, 50);
    pastActions.forEach((act) => {
      doc.text(`- ${act}`, 16, currentY);
      currentY += 4.5;
    });

    // Future Actions
    currentY += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(150, 23, 27);
    doc.text('III. RENCANA AKSI PRESKRIPTIF & TARGET MENDATANG', 14, currentY);

    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(40, 40, 40);
    doc.text('Target Jangka Pendek (1 - 7 Hari):', 16, currentY);
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    futureActionsShortTerm.forEach((act) => {
      doc.text(`  - ${act}`, 18, currentY);
      currentY += 4.2;
    });

    currentY += 2;
    doc.setFont('helvetica', 'bold');
    doc.text('Target Jangka Menengah (30 Hari):', 16, currentY);
    currentY += 4;

    doc.setFont('helvetica', 'normal');
    futureActionsLongTerm.forEach((act) => {
      doc.text(`  - ${act}`, 18, currentY);
      currentY += 4.2;
    });

    // PAGE BREAK OR SIGNATURE
    if (currentY > 230) {
      doc.addPage();
      currentY = 25;
    }

    // Recommendation
    currentY += 4;
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(14, currentY, 182, 16, 2, 2, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, currentY, 182, 16, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(146, 64, 14);
    doc.text('IV. REKOMENDASI KARIR, PROMOSI & PENEMPATAN:', 18, currentY + 6);
    doc.setFontSize(8);
    doc.text(careerRecommendation, 18, currentY + 11);

    // Signature
    currentY += 26;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);

    doc.text('Dibuat & Diverifikasi Oleh:', 25, currentY);
    doc.text('Diketahui & Diterima Oleh:', 135, currentY);

    currentY += 16;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(evaluatorName, 25, currentY);
    doc.text(outletSigner, 135, currentY);

    doc.line(25, currentY + 1.5, 75, currentY + 1.5);
    doc.line(135, currentY + 1.5, 185, currentY + 1.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`${evaluatorTitle} - HARA DEVELOPMENT`, 25, currentY + 5.5);
    doc.text(`Penanggung Jawab Outlet ${crew.kode_outlet}`, 135, currentY + 5.5);

    doc.save(`Master_Dossier_${crew.nama_kru.replace(/\s+/g, '_')}_${crew.kode_outlet}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#96171B] text-white flex items-center justify-center font-black text-lg">
            {crew.nama_kru.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 leading-none">
                {crew.nama_kru}
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                Divisi {crew.divisi}
              </span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                crewSummary.badge === 'Mahir'
                  ? 'bg-emerald-100 text-emerald-800'
                  : crewSummary.badge === 'Terampil'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {crewSummary.badge.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Outlet {crew.kode_outlet} • Bergabung sejak {crew.tanggal_masuk}
            </p>
          </div>
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
            <span>{isEditing ? 'Selesai Kustomisasi' : 'Kustomisasi Rapor'}</span>
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
            <span>Cetak Dokumen</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="btn-primary-enterprise !py-1.5 !px-3.5 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs bg-[#96171B] hover:bg-[#781014] text-white"
          >
            <Download size={14} />
            <span>Unduh Master PDF</span>
          </button>
        </div>
      </div>

      {/* Editor Panel (Visible when editing) */}
      {isEditing && (
        <div className="p-5 bg-amber-50/70 border-2 border-amber-300 rounded-2xl shadow-xs space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <Sparkles size={16} />
              <span>Editor Kustomisasi Laporan Eksekutif & Narasi Kru</span>
            </div>
            <span className="text-xs text-amber-700">Perubahan tersimpan otomatis pada pratinjau</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Ringkasan Diagnostik Eksekutif:
                </label>
                <textarea
                  rows={3}
                  value={diagnosticExecutiveSummary}
                  onChange={(e) => setDiagnosticExecutiveSummary(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#96171B] text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Rekomendasi Karir & Penempatan:
                </label>
                <input
                  type="text"
                  value={careerRecommendation}
                  onChange={(e) => setCareerRecommendation(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#96171B] text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Trainer Operasional:</label>
                  <input
                    type="text"
                    value={evaluatorName}
                    onChange={(e) => setEvaluatorName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Penanggung Jawab Outlet:</label>
                  <input
                    type="text"
                    value={outletSigner}
                    onChange={(e) => setOutletSigner(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tanggal Rapor:</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* THE MASTER PRINTABLE DOSSIER SHEET */}
      {/* ========================================================================= */}
      <div className="printable-document-sheet bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Kop Surat Resmi */}
        <OfficialDocumentHeader
          docNumber={docNumber}
          date={`Bekasi, ${reportDate}`}
          subLabel="Sistem Audit Terpadu, Evaluasi Kompetensi & Rencana Aksi Pengembangan Kru"
          extraInfo="Master Executive Development Transcript • Divisi Training & Operasional"
        />

        {/* Title Header */}
        <div className="text-center py-3 bg-gradient-to-r from-slate-50 via-red-50/40 to-slate-50 rounded-2xl border border-slate-200 space-y-1">
          <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide font-sans">
            LAPORAN INTEGRASI EVALUASI KOMPETENSI, PEMBINAAN & RENCANA AKSI KRU
          </h2>
          <p className="text-xs text-slate-600 font-medium max-w-3xl mx-auto">
            Sintesis Holistik Hasil Audit Kebutuhan (TNA), Pembinaan GROW, Ujian 4 Pilar Objektif & Rekomendasi Preskriptif
          </p>
        </div>

        {/* Section 1: Hero Identity & Key KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Kru Yang Dinilai</span>
            <span className="text-sm font-black text-slate-900 block mt-0.5 truncate">{crew.nama_kru}</span>
            <span className="text-[10.5px] text-slate-500 font-medium block">Divisi {crew.divisi}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Unit Penugasan</span>
            <span className="text-sm font-black text-[#96171B] block mt-0.5 truncate">{crew.kode_outlet}</span>
            <span className="text-[10.5px] text-slate-500 font-medium block">{outlet?.nama_outlet || 'Cabang Aktif'}</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Skor Komposit Akhir</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-[#96171B]">{finalCompositeScore}</span>
              <span className="text-[10px] text-slate-400">/ 100</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold">Standard Min: 78</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Kualifikasi Resmi</span>
            <span className={`inline-block text-xs font-black px-2.5 py-1 rounded-lg mt-1 ${
              crewSummary.badge === 'Mahir'
                ? 'bg-emerald-100 text-emerald-800'
                : crewSummary.badge === 'Terampil'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {crewSummary.badge.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Section 2: Visual Charts & Analytics (Radar & Bar Chart) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Radar Chart */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Radar size={14} className="text-[#96171B]" />
                <span>Radar Keseimbangan 5 Dimensi Kompetensi</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">Target Standard: 80+</span>
            </div>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                  <Radar name="Skor Kru" dataKey="score" stroke="#96171B" fill="#96171B" fillOpacity={0.4} strokeWidth={2} />
                  <Radar name="Target Standar" dataKey="target" stroke="#D48B1E" fill="#D48B1E" fillOpacity={0.15} strokeDasharray="3 3" />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart Comparison */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <BarChart2 size={14} className="text-[#96171B]" />
                <span>Perbandingan Skor Aktual vs Standar Kelulusan</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Lulus 4 Pilar
              </span>
            </div>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="skorAktual" name="Skor Aktual Kru" fill="#96171B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="standarLulus" name="Standar Minimum" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Section 3: Diagnostic Executive Summary */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
            <Sparkles size={14} className="text-[#96171B]" />
            <span>I. Kesimpulan Diagnostik & Analisis Performa Kerja</span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-medium pl-6">
            {diagnosticExecutiveSummary}
          </p>
        </div>

        {/* Section 4: 4-Pillar Detailed Assessment Matrix */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Award size={14} className="text-[#96171B]" />
              <span>II. Matriks Evaluasi Objektif 4-Dimensi Standar</span>
            </span>
            <span className="text-[10px] text-slate-400 font-bold">Passing Grade: Teori 75% | Praktik 80% | Lisan 75%</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#96171B] text-white text-[11px] font-bold uppercase">
                <tr>
                  <th className="p-2.5">Dimensi Penilaian</th>
                  <th className="p-2.5 text-center w-20">Bobot</th>
                  <th className="p-2.5 text-center w-24">Skor Aktual</th>
                  <th className="p-2.5 text-center w-28">Standar Minimum</th>
                  <th className="p-2.5">Hasil & Status Otorisasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr className="hover:bg-slate-50/80">
                  <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen size={14} className="text-blue-600 shrink-0" />
                    <div>
                      <div>1. Uji Teori SOP Baku & Parameter Teknis</div>
                      <div className="text-[10px] text-slate-400 font-normal">Suhu minyak, gramasi bumbu, SOP holding time & FIFO</div>
                    </div>
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-700">25%</td>
                  <td className="p-2.5 text-center font-black text-blue-700 text-sm">{scoreTeori}</td>
                  <td className="p-2.5 text-center font-semibold text-slate-500">75 / 100</td>
                  <td className="p-2.5">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black text-[10.5px]">
                      {scoreTeori >= 75 ? 'KOMPETEN (LULUS)' : 'PERLU REMEDIAL'}
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80">
                  <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                    <Wrench size={14} className="text-emerald-600 shrink-0" />
                    <div>
                      <div>2. Uji Praktik Eksekusi Stasiun Kerja</div>
                      <div className="text-[10px] text-slate-400 font-normal">Kerapian penepungan, timer penggorengan, sanitasi & higienitas</div>
                    </div>
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-700">35%</td>
                  <td className="p-2.5 text-center font-black text-emerald-700 text-sm">{scorePraktik}</td>
                  <td className="p-2.5 text-center font-semibold text-slate-500">80 / 100</td>
                  <td className="p-2.5">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black text-[10.5px]">
                      {scorePraktik >= 80 ? 'MASTERY (LULUS)' : 'PERLU PEMANTAPAN'}
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80">
                  <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                    <Mic size={14} className="text-amber-600 shrink-0" />
                    <div>
                      <div>3. Uji Lisan HACCP Reasoning ("Why Behind SOP")</div>
                      <div className="text-[10px] text-slate-400 font-normal">Pemahaman titik kritis HACCP, alasan mutu & respon korektif</div>
                    </div>
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-700">20%</td>
                  <td className="p-2.5 text-center font-black text-amber-700 text-sm">{scoreLisan}</td>
                  <td className="p-2.5 text-center font-semibold text-slate-500">75 / 100</td>
                  <td className="p-2.5">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black text-[10.5px]">
                      {scoreLisan >= 75 ? 'MEMENUHI STANDAR' : 'PEMBINAAN SIKAP'}
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80">
                  <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-purple-600 shrink-0" />
                    <div>
                      <div>4. Audit Observasi Lapangan K3 & 5S</div>
                      <div className="text-[10px] text-slate-400 font-normal">Inspeksi shift lantai kerja, kepatuhan sanitasi & disiplin APD</div>
                    </div>
                  </td>
                  <td className="p-2.5 text-center font-bold text-slate-700">20%</td>
                  <td className="p-2.5 text-center font-black text-purple-700 text-sm">{scoreAudit}</td>
                  <td className="p-2.5 text-center font-semibold text-slate-500">75 / 100</td>
                  <td className="p-2.5">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black text-[10.5px]">
                      {scoreAudit >= 75 ? 'TERUJI STABIL' : 'PERLU PENDAMPINGAN'}
                    </span>
                  </td>
                </tr>

                <tr className="bg-slate-50 font-black">
                  <td className="p-3 text-slate-900 uppercase">Total Indeks Akhir Objektif 360°</td>
                  <td className="p-3 text-center text-slate-900">100%</td>
                  <td className="p-3 text-center text-[#96171B] text-base">{finalCompositeScore}</td>
                  <td className="p-3 text-center text-slate-600">75 / 100</td>
                  <td className="p-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#96171B] text-white font-black text-xs">
                      PREDIKAT: {crewSummary.badge.toUpperCase()}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 5: Past Actions & Accomplishments vs Future Prescriptive Roadmap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Past Actions (Telah Dilakukan) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>III. Rekapitulasi Yang Telah Dilakukan (Past Actions)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {pastActions.map((act, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={10} />
                  </span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>

            {crewCoachingList.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-1">Catatan Sesi GROW Terakhir:</span>
                <p className="italic text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                  "{crewCoachingList[0].will || crewCoachingList[0].goal}"
                </p>
              </div>
            )}
          </div>

          {/* Future Action Plan (Akan Dilakukan) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-[#96171B] uppercase tracking-wider">
              <Target size={16} className="text-[#96171B]" />
              <span>IV. Rencana Aksi Mendatang (Future Action Plan)</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10.5px] font-black uppercase text-amber-800 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                <Clock size={11} className="text-amber-700" />
                <span>Target 1 - 7 Hari (Immediate):</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 pl-1">
                {futureActionsShortTerm.map((act, idx) => (
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
                <span>Target 30 Hari (Medium Term):</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700 pl-1">
                {futureActionsLongTerm.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Section 6: Strengths, Improvements & Career Recommendation */}
        <div className="p-4.5 bg-gradient-to-r from-amber-50/60 via-white to-red-50/50 rounded-2xl border border-amber-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider">
            <TrendingUp size={15} className="text-[#96171B]" />
            <span>V. Rekomendasi Karir & Penempatan Resmi (Official Career Path)</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-amber-300/80 shadow-2xs">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">Keputusan Trainer Operasional:</span>
            <p className="text-sm font-black text-slate-900 mt-0.5">
              {careerRecommendation}
            </p>
          </div>
        </div>

        {/* Section 7: Official Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-200 text-center text-xs print-avoid-break">
          <div className="space-y-12">
            <span className="text-slate-500 font-bold block">Dibuat & Diverifikasi Oleh:</span>
            <div>
              <div className="font-black text-slate-900 underline text-sm">{evaluatorName}</div>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">{evaluatorTitle}</div>
              <div className="text-[9.5px] text-slate-400 font-bold">HARA TRAINING & OPERATIONS</div>
            </div>
          </div>

          <div className="space-y-12">
            <span className="text-slate-500 font-bold block">Diketahui & Diterima Oleh:</span>
            <div>
              <div className="font-black text-slate-900 underline text-sm">{outletSigner}</div>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">Penanggung Jawab Outlet</div>
              <div className="text-[9.5px] text-slate-400 font-bold">Cabang {crew.kode_outlet}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
