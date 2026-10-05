import React, { useState, useMemo } from 'react';
import {
  Printer, ArrowLeft, Download, Share2, Copy, Check, FileText,
  ShieldCheck, Award, AlertTriangle, Clock, Calendar, Store,
  User, CheckCircle2, ChevronRight, Filter, TrendingUp, Layers,
  Compass, BarChart3, Users, Flame, Utensils, Zap, HelpCircle,
  Building2, Sparkles, BookOpen, AlertCircle
} from 'lucide-react';
import { db } from '../../lib/storage';
import {
  Kru, Outlet, PenugasanTrainer, ObservasiLapangan, CoachingLog,
  TNA, KartuKeluhan, PenilaianTeori, PenilaianPraktik, PenilaianLisan,
  CrewRadarData, Division
} from '../../types';
import { CrewRadarChart } from '../analytics/CrewRadarChart';
import { calculateCompositeScore, generateDiagnosticActionPlan } from '../../lib/analyticsEngine';

export type ReportType =
  | 'intervensi_perbantuan'
  | 'dossier_kru'
  | 'periodik_gerai'
  | 'executive_hq';

interface MultiPageOfficialReportProps {
  initialReportType?: ReportType;
  selectedOutletCode?: string;
  selectedCrewName?: string;
  onBack?: () => void;
}

export const MultiPageOfficialReport: React.FC<MultiPageOfficialReportProps> = ({
  initialReportType = 'intervensi_perbantuan',
  selectedOutletCode = 'HC-BTL01',
  selectedCrewName = '',
  onBack,
}) => {
  // Navigation & View Mode
  const [reportType, setReportType] = useState<ReportType>(initialReportType);
  const [activePageTab, setActivePageTab] = useState<number | 'ALL'>('ALL');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Filters
  const outlets = db.getTable<Outlet>('outlets');
  const allKru = db.getTable<Kru>('kru');
  const allPenugasan = db.getTable<PenugasanTrainer>('penugasan_trainer');
  const allObservasi = db.getTable<ObservasiLapangan>('observasi_lapangan');
  const allCoaching = db.getTable<CoachingLog>('coaching_log');
  const allTna = db.getTable<TNA>('tna');
  const allKeluhan = db.getTable<KartuKeluhan>('kartu_keluhan');
  const allTeori = db.getTable<PenilaianTeori>('penilaian_teori');
  const allPraktik = db.getTable<PenilaianPraktik>('penilaian_praktik');
  const allLisan = db.getTable<PenilaianLisan>('penilaian_lisan');

  const [currentOutletCode, setCurrentOutletCode] = useState<string>(
    selectedOutletCode === 'ALL' || !selectedOutletCode ? (outlets[0]?.kode_outlet || 'HC-JTS01') : selectedOutletCode
  );

  const [currentCrewName, setCurrentCrewName] = useState<string>(
    selectedCrewName || (allKru[0]?.nama_kru || 'Budi Santoso')
  );

  const [currentPenugasanId, setCurrentPenugasanId] = useState<string>(
    allPenugasan[0]?.id || 'tugas-1'
  );

  // Selected Target Objects
  const targetOutlet = useMemo(() => {
    return outlets.find((o) => o.kode_outlet === currentOutletCode) || outlets[0];
  }, [outlets, currentOutletCode]);

  const targetCrew = useMemo(() => {
    return allKru.find((k) => k.nama_kru === currentCrewName) || allKru[0];
  }, [allKru, currentCrewName]);

  const targetPenugasan = useMemo(() => {
    return allPenugasan.find((p) => p.id === currentPenugasanId) || allPenugasan[0];
  }, [allPenugasan, currentPenugasanId]);

  // Derived Radar Data for Selected Crew
  const crewRadarData: CrewRadarData = useMemo(() => {
    const teoriList = allTeori.filter((t) => t.nama_kru === currentCrewName);
    const praktikList = allPraktik.filter((p) => p.nama_kru === currentCrewName);
    const lisanList = allLisan.filter((l) => l.nama_kru === currentCrewName);

    const skorTeori = teoriList.length > 0 ? Math.round(teoriList.reduce((acc, c) => acc + c.skor, 0) / teoriList.length) : 88;
    const skorPraktik = praktikList.length > 0 ? Math.round(praktikList.reduce((acc, c) => acc + c.skor_akhir, 0) / praktikList.length) : 89;
    const skorLisan = lisanList.length > 0 ? Math.round(lisanList.reduce((acc, c) => acc + c.skor, 0) / lisanList.length) : 86;
    const sikap = Math.round((skorTeori * 0.4 + skorLisan * 0.6) * 10) / 10;
    const rush = Math.round((skorPraktik * 0.85 + 10) * 10) / 10;
    const sos = targetCrew?.divisi === 'Kasir' ? 90 : targetCrew?.divisi === 'Geprek' ? 88 : 84;
    const comp = calculateCompositeScore(skorTeori, skorPraktik, sikap, rush);

    return {
      nama_kru: currentCrewName,
      divisi: targetCrew?.divisi || 'Kitchen',
      kode_outlet: targetCrew?.kode_outlet || currentOutletCode,
      teori_sop: skorTeori,
      praktik_jobdesk: skorPraktik,
      sikap_hara: sikap,
      ketahanan_rush: rush,
      kecepatan_sos: sos,
      skor_komposit: comp.total_composite,
      status_kelulusan: comp.status,
    };
  }, [allTeori, allPraktik, allLisan, currentCrewName, targetCrew, currentOutletCode]);

  const composite = calculateCompositeScore(
    crewRadarData.teori_sop,
    crewRadarData.praktik_jobdesk,
    crewRadarData.sikap_hara,
    crewRadarData.ketahanan_rush
  );

  const actionPlan = generateDiagnosticActionPlan(
    crewRadarData.nama_kru,
    crewRadarData.divisi,
    crewRadarData
  );

  // Trigger Native Print Dialog
  const handlePrint = () => {
    setActivePageTab('ALL');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Copy Executive Text Summary for WhatsApp / Email
  const handleCopySummary = () => {
    let text = '';
    if (reportType === 'intervensi_perbantuan') {
      text = `*LAPORAN RESMI AUDIT PERBANTUAN LAPANGAN*\n` +
        `Cabang: ${targetOutlet?.nama_outlet || currentOutletCode}\n` +
        `Surat Tugas: ${targetPenugasan?.nomor_surat_tugas || '-'}\n` +
        `Trainer: ${targetPenugasan?.trainer_nama || 'Haikal Abi'}\n` +
        `Durasi: ${targetPenugasan?.tanggal_mulai} s/d ${targetPenugasan?.tanggal_selesai}\n` +
        `Status: ${targetPenugasan?.status || 'Selesai'}\n` +
        `Output: ${targetPenugasan?.laporan_kegiatan || 'Evaluasi SOP tercapai 92%.'}\n` +
        `Rekomendasi: ${targetPenugasan?.rekomendasi_outlet || 'Standarisasi SOP berkala.'}\n` +
        `Diterbitkan oleh HARA Chicken Trainer & Ops.`;
    } else {
      text = `*DOSSIER KOMPETENSI KRU RESMI*\n` +
        `Nama: ${targetCrew?.nama_kru} (${targetCrew?.jabatan})\n` +
        `Stasiun: ${targetCrew?.divisi} | Gerai: ${targetCrew?.kode_outlet}\n` +
        `Skor Komposit: ${composite.total_composite} / 100 (${composite.status})\n` +
        `Rekomendasi: ${actionPlan.rekomendasiUtama}\n` +
        `Diterbitkan oleh HARA Chicken Trainer & Ops.`;
    }
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Total pages based on report type
  const totalPages = reportType === 'executive_hq' ? 4 : 5;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in">
      {/* ========================================================================= */}
      {/* TOP CONTROL BAR (HIDDEN IN PRINT) */}
      {/* ========================================================================= */}
      <div className="print:hidden space-y-4">
        {/* Navigation & Header */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="p-2.5 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft size={16} />
                <span>Kembali</span>
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-[#8B1418] border border-red-200 px-2 py-0.5 rounded font-mono">
                  MULTI-PAGE DOSSIER SYSTEM
                </span>
                <span className="text-xs text-stone-400 font-medium">Dokumen Standar A4 Resmi Korporat</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                Pusat Laporan Profesional Multi-Halaman
              </h1>
              <p className="text-xs text-stone-500">
                Laporan komprehensif berhalaman-halaman dengan pembagian lembar cetak A4 presisi, skor objektif, audit stasiun, dan tanda tangan legalitas.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
            >
              {copiedSummary ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedSummary ? 'Tersalin!' : 'Salin Ringkasan WA'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-[#8B1418] hover:bg-[#720e12] text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-red-900/15 active:scale-98"
            >
              <Printer size={15} />
              <span>Cetak / Simpan PDF (A4)</span>
            </button>
          </div>
        </div>

        {/* Report Type Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            {
              id: 'intervensi_perbantuan' as ReportType,
              label: 'Laporan Audit Perbantuan',
              desc: '5 Halaman • Intervensi Cabang',
              icon: Building2,
            },
            {
              id: 'dossier_kru' as ReportType,
              label: 'Laporan Dossier Kru',
              desc: '5 Halaman • Rapor Kompetensi',
              icon: User,
            },
            {
              id: 'periodik_gerai' as ReportType,
              label: 'Laporan Periodik Gerai',
              desc: '5 Halaman • Kepatuhan Bulanan',
              icon: Store,
            },
            {
              id: 'executive_hq' as ReportType,
              label: 'Executive Board HQ',
              desc: '4 Halaman • Komparasi Nasional',
              icon: ShieldCheck,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = reportType === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setReportType(tab.id);
                  setActivePageTab('ALL');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                  isActive
                    ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-stone-900/10'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50/80'
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    isActive ? 'bg-white/10 text-amber-300' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs font-black truncate">{tab.label}</span>
                  <span
                    className={`block text-[10.5px] mt-0.5 truncate ${
                      isActive ? 'text-stone-300' : 'text-stone-500'
                    }`}
                  >
                    {tab.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Filters Bar based on active report type */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Gerai */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-600">Pilih Gerai:</span>
              <select
                value={currentOutletCode}
                onChange={(e) => setCurrentOutletCode(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-bold text-stone-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#8B1418]"
              >
                {outlets.map((o) => (
                  <option key={o.kode_outlet} value={o.kode_outlet}>
                    {o.kode_outlet} - {o.nama_outlet}
                  </option>
                ))}
              </select>
            </div>

            {/* If Dossier Kru: Filter Kru */}
            {reportType === 'dossier_kru' && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-600">Pilih Kru:</span>
                <select
                  value={currentCrewName}
                  onChange={(e) => setCurrentCrewName(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-bold text-stone-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#8B1418]"
                >
                  {allKru.map((k) => (
                    <option key={k.id} value={k.nama_kru}>
                      {k.nama_kru} ({k.divisi} - {k.kode_outlet})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* If Intervensi: Filter Surat Tugas */}
            {reportType === 'intervensi_perbantuan' && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-600">Surat Tugas:</span>
                <select
                  value={currentPenugasanId}
                  onChange={(e) => setCurrentPenugasanId(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-bold text-stone-800 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#8B1418] max-w-xs truncate"
                >
                  {allPenugasan.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nomor_surat_tugas} - {p.kode_outlet} ({p.trainer_nama})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Page Sheet Switcher */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActivePageTab('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePageTab === 'ALL'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Semua Lembar ({totalPages})
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setActivePageTab(pg)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activePageTab === pg
                    ? 'bg-white text-[#8B1418] shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Hal {pg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MULTI-PAGE PRINT-READY A4 DOSSIER SHEETS */}
      {/* ========================================================================= */}
      <div className="space-y-8 print:space-y-0 text-stone-900">
        {/* ======================================================================= */}
        {/* LAPORAN TIPE 1: AUDIT PERBANTUAN LAPANGAN & INTERVENSI CABANG */}
        {/* ======================================================================= */}
        {reportType === 'intervensi_perbantuan' && (
          <>
            {/* ----------------------------------------------------------------- */}
            {/* LEMBAR 1: COVER & SURAT PERINTAH TUGAS INTERVENSI */}
            {/* ----------------------------------------------------------------- */}
            {(activePageTab === 'ALL' || activePageTab === 1) && (
              <A4Sheet
                pageNumber={1}
                totalPages={totalPages}
                docNumber={targetPenugasan?.nomor_surat_tugas || 'ST/HARA-TRN/2026/08/012'}
                docTitle="LAPORAN RESMI AUDIT PERBANTUAN LAPANGAN & INTERVENSI OPERASIONAL"
                subTitle="Dokumentasi Intervensi Lapangan, Audit 5S Stasiun, & Pendampingan Operasional"
              >
                {/* Executive Summary Banner */}
                <div className="bg-[#FAF8F5] border-2 border-stone-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase text-[#8B1418] tracking-widest block">
                        INTERVENTION CHARTER & BRIEF
                      </span>
                      <h2 className="text-base font-black text-stone-900">
                        Penugasan Khusus Trainer di Cabang {targetOutlet?.nama_outlet}
                      </h2>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-black uppercase tracking-wider border border-emerald-300">
                      STATUS: {targetPenugasan?.status || 'SELESAI'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">KODE OUTLET</span>
                      <span className="font-mono font-bold text-stone-900">{targetOutlet?.kode_outlet}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">TRAINER PIC</span>
                      <span className="font-bold text-stone-900">{targetPenugasan?.trainer_nama}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">PERIODE TUGAS</span>
                      <span className="font-mono font-bold text-stone-900">
                        {targetPenugasan?.tanggal_mulai} s/d {targetPenugasan?.tanggal_selesai}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase block">FOKUS STASIUN</span>
                      <span className="font-bold text-[#8B1418]">{targetPenugasan?.fokus_divisi}</span>
                    </div>
                  </div>
                </div>

                {/* Tujuan & Latar Belakang Intervensi */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    1. Latar Belakang & Urgensi Perbantuan
                  </h3>
                  <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2 leading-relaxed text-stone-700">
                    <p>
                      Berdasarkan pemantauan indikator operasional bulanan dan laporan TNA (Training Needs Analysis),
                      gerai <b>{targetOutlet?.nama_outlet} ({targetOutlet?.kode_outlet})</b> memerlukan perbantuan
                      teknis langsung dari tim Lead Trainer untuk memastikan konsistensi standar mutu rasa ayam krispi
                      HARA, ketepatan gramasi sambal geprek, dan kelancaran transaksi di jam sibuk (*rush hour*).
                    </p>
                    <p className="font-medium text-stone-900">
                      <b>Tujuan Utama Penugasan:</b> {targetPenugasan?.tujuan_tugas}
                    </p>
                  </div>
                </div>

                {/* Target KPI Intervensi Lapangan */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    2. Target Key Performance Indicators (KPI) Intervensi
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block font-mono">
                        Target Speed of Service (SOS)
                      </span>
                      <div className="text-lg font-black font-mono text-stone-900">&le; 45 Detik / Tamu</div>
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Waktu transaksi kasir sejak tamu memesan hingga struk dicetak di jam padat.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block font-mono">
                        Kepatuhan Suhu Penggorengan
                      </span>
                      <div className="text-lg font-black font-mono text-[#8B1418]">160°C - 170°C</div>
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Akurasi suhu deep fryer dengan meat probe thermometer pada menit ke-13.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block font-mono">
                        Toleransi Keluhan Pelanggan
                      </span>
                      <div className="text-lg font-black font-mono text-emerald-700">0 Komplain Rasa</div>
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Nol pengembalian produk akibat ayam kurang matang atau sambal keasinan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Kru Sasaran Bimbingan */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    3. Personil Sasaran Pendampingan & Mentoring Lapangan
                  </h3>
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white">
                    <p className="text-stone-700 leading-relaxed">
                      <b>Daftar Kru Terlibat:</b> {targetPenugasan?.daftar_kru_didampingi}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Target Output: {targetPenugasan?.target_output}
                    </p>
                  </div>
                </div>
              </A4Sheet>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* LEMBAR 2: DIAGNOSIS BASELINE & AUDIT 5S STASIUN PRA-INTERVENSI */}
            {/* ----------------------------------------------------------------- */}
            {(activePageTab === 'ALL' || activePageTab === 2) && (
              <A4Sheet
                pageNumber={2}
                totalPages={totalPages}
                docNumber={targetPenugasan?.nomor_surat_tugas || 'ST/HARA-TRN/2026/08/012'}
                docTitle="DIAGNOSIS BASELINE & AUDIT KEPATUHAN PRA-INTERVENSI"
                subTitle="Evaluasi Kondisi Lapangan Awal, Titik Hambat Operasional, & Analisis Akar Masalah"
              >
                {/* Baseline Stasiun Comparison Table */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    1. Skor Kepatuhan Awal per Stasiun Kerja (Baseline Pre-Audit)
                  </h3>
                  <div className="overflow-x-auto border border-stone-200 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold">
                          <th className="p-2.5">Stasiun Kerja</th>
                          <th className="p-2.5">Standar Emas SOP</th>
                          <th className="p-2.5">Skor Baseline</th>
                          <th className="p-2.5">Status Kepatuhan</th>
                          <th className="p-2.5">Temuan Utama Pra-Intervensi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 text-stone-700">
                        <tr>
                          <td className="p-2.5 font-bold text-stone-900">Kitchen & Fryer</td>
                          <td className="p-2.5 font-mono">100% SOP</td>
                          <td className="p-2.5 font-mono font-bold text-amber-700">72.5%</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                              Deviasi Sedang
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px]">Suhu minyak sering turun ke 145°C karena batch ayam dimasukkan terlalu banyak sekaligus.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-stone-900">Geprek & Sambal</td>
                          <td className="p-2.5 font-mono">100% SOP</td>
                          <td className="p-2.5 font-mono font-bold text-amber-700">68.0%</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                              Deviasi Tinggi
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px]">Tidak menggunakan sendok takar baku saat rush hour; rasa cabai bervariasi antar porsi.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-stone-900">Kasir & POS</td>
                          <td className="p-2.5 font-mono">100% SOP</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-700">82.0%</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                              Cukup Baik
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px]">Repeat order pesanan sering dilewati saat antrean lebih dari 4 orang.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-stone-900">Helper & Sanitasi</td>
                          <td className="p-2.5 font-mono">100% SOP</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-700">85.0%</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                              Baik
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px]">Disiplin APD sarung tangan dan pembersihan meja makan berjalan teratur.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Analisis Akar Masalah (Ishikawa Fishbone Method) */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    2. Matriks Analisis Akar Masalah (Root Cause Analysis - 4M)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                      <b className="text-stone-900 text-[11px] uppercase tracking-wide block text-[#8B1418]">
                        Man (Kru & Kompetensi):
                      </b>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Kru junior belum terbiasa dengan pembagian ritme shift jam sibuk (12.00-13.30 & 18.30-20.00). Terjadi kepanikan saat antrean menumpuk sehingga melupakan prosedur SOP standar.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                      <b className="text-stone-900 text-[11px] uppercase tracking-wide block text-[#8B1418]">
                        Method (Alur & Prosedur):
                      </b>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Holding time ayam goreng tidak diberi label waktu digital sehingga ayam yang digoreng 2 jam lalu tercampur dengan batch baru matang.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                      <b className="text-stone-900 text-[11px] uppercase tracking-wide block text-[#8B1418]">
                        Machine (Peralatan Kerja):
                      </b>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Termometer manual di deep fryer mengalami selisih kalibrasi sebesar -8°C dari pembacaan aktual probe digital trainer.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1">
                      <b className="text-stone-900 text-[11px] uppercase tracking-wide block text-[#8B1418]">
                        Material (Bahan Baku & Prep):
                      </b>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        Thawing ayam marinasi dari chiller belum mencapai suhu kamar (15°C) sebelum dimasukkan ke dalam adonan tepung krispi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audit Checklist 5S Lapangan */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-1.5 font-bold">
                    <span>Audit Kepatuhan 5S (Seiri, Seiton, Seiso, Seiketsu, Shitsuke)</span>
                    <span className="font-mono text-[#8B1418]">Skor Evaluasi: 78 / 100</span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Area kitchen memerlukan pengorganisasian ulang rak bumbu dan penggantian berkala kain lap microfiber sesuai kode warna stasiun (Merah: Dapur kotor, Kuning: Area saji, Biru: Kasir & Meja tamu).
                  </p>
                </div>
              </A4Sheet>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* LEMBAR 3: LOGBOOK KRONOLOGIS TINDAKAN & COACHING LAPANGAN */}
            {/* ----------------------------------------------------------------- */}
            {(activePageTab === 'ALL' || activePageTab === 3) && (
              <A4Sheet
                pageNumber={3}
                totalPages={totalPages}
                docNumber={targetPenugasan?.nomor_surat_tugas || 'ST/HARA-TRN/2026/08/012'}
                docTitle="LOGBOOK KRONOLOGIS TINDAKAN & INTERVENSI LAPANGAN"
                subTitle="Catatan Harian Pendampingan Shift, Hands-on Workshop, & Simulasi Jam Sibuk"
              >
                <div className="space-y-4 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    Jurnal Aktivitas Pendampingan Shift per Hari
                  </h3>

                  {/* Logbook Timeline */}
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="font-bold text-[#8B1418]">HARI 1 - AUDIT & DIRECT OBSERVATION</span>
                        <span className="text-stone-500">Shift Pagi s/d Malam</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed">
                        Observasi tanpa intervensi selama jam makan siang. Mengukur waktu antrean kasir (rata-rata 78 detik) dan suhu penggorengan ayam. Menemukan deviasi takaran sambal bawang dan sambal matah.
                      </p>
                      <div className="text-[10px] text-stone-500 font-bold bg-stone-50 px-2.5 py-1 rounded inline-block">
                        Tindakan: Briefing malam bersama Kepala Gerai & evaluasi gap TNA.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="font-bold text-[#8B1418]">HARI 2 - KALIBRASI ALAT & HANDS-ON KITCHEN</span>
                        <span className="text-stone-500">Shift Pagi</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed">
                        Melakukan kalibrasi ulang deep fryer dan mengganti probe digital. Pelatihan teknik penepungan *double dipping* 2x celup untuk menghasilkan keriting ayam krispi gold standar HARA.
                      </p>
                      <div className="text-[10px] text-stone-500 font-bold bg-stone-50 px-2.5 py-1 rounded inline-block">
                        Peserta: Kru Kitchen (Budi Santoso & Dimas Setiawan).
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="font-bold text-[#8B1418]">HARI 3 - WORKSHOP STASIUN SAMBAL & GEPREK</span>
                        <span className="text-stone-500">Shift Siang (Peak Hour)</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed">
                        Pemasangan stiker panduan gramasi baku tepat di depan cobek. Latihan siraman minyak panas pada cabai rawit merah untuk mengeluarkan aroma khas gurih sambal bawang HARA tanpa langu.
                      </p>
                      <div className="text-[10px] text-stone-500 font-bold bg-stone-50 px-2.5 py-1 rounded inline-block">
                        Peserta: Kru Geprek (Agus Pratama) & Helper.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="font-bold text-[#8B1418]">HARI 4 - ROLEPLAY KASIR 5S & REPEAT ORDER</span>
                        <span className="text-stone-500">Shift Sore/Malam</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed">
                        Roleplay transaksi cepat dan teknik greeting 5S (*Senyum, Salam, Sapa, Sopan, Santun*). Latihan penanganan pesanan takeaway dan repeat order untuk mencegah salah catat varian pedas.
                      </p>
                      <div className="text-[10px] text-stone-500 font-bold bg-stone-50 px-2.5 py-1 rounded inline-block">
                        Peserta: Kasir (Siti Rahmawati & Rina Amelia).
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="font-bold text-[#8B1418]">HARI 5 - SIMULASI STRESS TEST & EVALUASI AKHIR</span>
                        <span className="text-stone-500">Shift Malam (Weekend Rush)</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed">
                        Trainer bertindak sebagai supervisor pengawas dan penjamin mutu. Speed of service kasir berhasil ditekan ke angka 38 detik per transaksi. Seluruh batch ayam krispi lolos uji kematangan.
                      </p>
                      <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded inline-block">
                        Hasil: Zero customer complaint sepanjang weekend promo!
                      </div>
                    </div>
                  </div>
                </div>
              </A4Sheet>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* LEMBAR 4: EVALUASI BEFORE VS AFTER & MATRIKS PENINGKATAN */}
            {/* ----------------------------------------------------------------- */}
            {(activePageTab === 'ALL' || activePageTab === 4) && (
              <A4Sheet
                pageNumber={4}
                totalPages={totalPages}
                docNumber={targetPenugasan?.nomor_surat_tugas || 'ST/HARA-TRN/2026/08/012'}
                docTitle="EVALUASI KEBERHASILAN & MATRIKS BEFORE-AFTER"
                subTitle="Perbandingan Kuantitatif Skor Kepatuhan, Efisiensi Waktu Layanan, & Mutu Produk"
              >
                {/* Before vs After Scoreboard */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    1. Perbandingan Metrik Operasional (Sebelum vs Sesudah Intervensi)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] space-y-2">
                      <span className="text-[10px] font-black uppercase text-stone-500 font-mono block">
                        SKOR KEPATUHAN SOP GERAI
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-stone-400 line-through">73.8%</span>
                        <span className="text-2xl font-black font-mono text-emerald-700">92.4%</span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Peningkatan +18.6%
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] space-y-2">
                      <span className="text-[10px] font-black uppercase text-stone-500 font-mono block">
                        SPEED OF SERVICE (RUSH HOUR)
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-stone-400 line-through">78 Detik</span>
                        <span className="text-2xl font-black font-mono text-emerald-700">38 Detik</span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Efisiensi Waktu 51%
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] space-y-2">
                      <span className="text-[10px] font-black uppercase text-stone-500 font-mono block">
                        KELUHAN PELANGGAN MINGGUAN
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-stone-400 line-through">4 Kasus</span>
                        <span className="text-2xl font-black font-mono text-emerald-700">0 Kasus</span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Penurunan 100% (Zero Complaint)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Uji Petik Asesmen Kru Lapangan */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    2. Hasil Uji Petik Kompetensi Kru Terlibat Pasca-Intervensi
                  </h3>
                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                        <tr>
                          <th className="p-2.5">Nama Kru</th>
                          <th className="p-2.5">Stasiun</th>
                          <th className="p-2.5">Skor Pra</th>
                          <th className="p-2.5">Skor Pasca</th>
                          <th className="p-2.5">Status Mandiri</th>
                          <th className="p-2.5">Catatan Lead Trainer</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 text-stone-700">
                        <tr>
                          <td className="p-2.5 font-bold text-stone-900">Budi Santoso</td>
                          <td className="p-2.5">Kitchen</td>
                          <td className="p-2.5 font-mono">75</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-700">96</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Tersertifikasi
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px]">Mahir mengontrol suhu deep fryer dan waktu holding kabinet.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-stone-900">Agus Pratama</td>
                          <td className="p-2.5">Geprek</td>
                          <td className="p-2.5 font-mono">68</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-700">90</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Tersertifikasi
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px]">Konsisten memakai takaran baku cabai dan takaran garam.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-stone-900">Siti Rahmawati</td>
                          <td className="p-2.5">Kasir</td>
                          <td className="p-2.5 font-mono">82</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-700">98</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Tersertifikasi
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px]">Kecepatan transaksi 38 detik dan selalu membaca repeat order.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Feedback Kepala Gerai */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                  <b className="text-stone-900 block font-bold">
                    Apresiasi & Testimoni Kepala Outlet (Store Manager):
                  </b>
                  <p className="text-stone-700 italic leading-relaxed">
                    &ldquo;{targetPenugasan?.catatan_kepala_outlet || 'Kehadiran trainer sangat membantu kru mengatasi kepanikan jam makan siang dan akhir pekan. Prosedur SOP kini berjalan secara organik tanpa harus terus-menerus diingatkan.'}&rdquo;
                  </p>
                  <div className="text-[11px] font-bold text-stone-600 font-mono pt-1">
                    Skor Kepuasan Outlet terhadap Trainer: {targetPenugasan?.skor_evaluasi_outlet || 95} / 100
                  </div>
                </div>
              </A4Sheet>
            )}

            {/* ----------------------------------------------------------------- */}
            {/* LEMBAR 5: REKOMENDASI JANGKA PANJANG, CAPA, & PENGESAHAN RESMI */}
            {/* ----------------------------------------------------------------- */}
            {(activePageTab === 'ALL' || activePageTab === 5) && (
              <A4Sheet
                pageNumber={5}
                totalPages={totalPages}
                docNumber={targetPenugasan?.nomor_surat_tugas || 'ST/HARA-TRN/2026/08/012'}
                docTitle="REKOMENDASI JANGKA PANJANG, CAPA, & PENGESAHAN DOKUMEN"
                subTitle="Corrective & Preventive Action (CAPA), Jadwal Audit Lanjutan, & Legalitas 4 Pihak"
              >
                {/* Rencana Tindakan Korektif & Preventif (CAPA) */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    1. Rencana Tindakan Korektif & Preventif (CAPA Plan - 30 Hari)
                  </h3>
                  <div className="space-y-2 text-xs text-stone-700">
                    <div className="p-3 rounded-xl border border-stone-200 bg-white flex items-start gap-2">
                      <span className="font-bold text-[#8B1418] shrink-0 font-mono">CAPA-01:</span>
                      <div>
                        <b>Kalibrasi Berkala Mingguan:</b> Kepala Outlet wajib mencatat suhu deep fryer setiap hari Senin pukul 09.00 WIB pada logbook digital sistem HARA OPS.
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-stone-200 bg-white flex items-start gap-2">
                      <span className="font-bold text-[#8B1418] shrink-0 font-mono">CAPA-02:</span>
                      <div>
                        <b>Standarisasi Prep Sambal:</b> Seluruh cabai dan bawang harus ditimbang per porsi 50 gram sebelum dimulainya jam sibuk makan siang.
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-stone-200 bg-white flex items-start gap-2">
                      <span className="font-bold text-[#8B1418] shrink-0 font-mono">CAPA-03:</span>
                      <div>
                        <b>Peer Mentoring Shift:</b> Budi Santoso ditugaskan sebagai mentor shift mendampingi Dimas Setiawan selama 14 hari kalender ke depan.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jadwal Audit Lanjutan */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    2. Jadwal Audit Berkala & Monitoring Evaluasi Ulang
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block font-mono">
                        Audit Follow-Up I (14 Hari)
                      </span>
                      <b className="text-stone-900 block mt-0.5">Audit Kejutan Uji Petik Kualitas</b>
                      <span className="text-[11px] text-stone-600 block mt-0.5">
                        Fokus: Suhu holding cabinet ayam dan kepatuhan sendok takar cabai.
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-[10px] font-bold text-stone-500 uppercase block font-mono">
                        Audit Komprehensif II (30 Hari)
                      </span>
                      <b className="text-stone-900 block mt-0.5">Sertifikasi Ulang Mutu Gerai</b>
                      <span className="text-[11px] text-stone-600 block mt-0.5">
                        Fokus: Verifikasi konsistensi zero customer complaint dan kecepatan SOS.
                      </span>
                    </div>
                  </div>
                </div>

                {/* LEMBAR PENGESAHAN 4 PIHAK RESMI */}
                <div className="pt-6 border-t-2 border-stone-800 space-y-3">
                  <span className="text-xs font-black text-stone-900 uppercase tracking-wider block text-center font-mono">
                    LEMBAR PENGESAHAN & BERITA ACARA INTERVENSI LAPANGAN RESMI
                  </span>

                  <div className="grid grid-cols-4 gap-4 text-center text-xs pt-4">
                    {/* Signee 1: Lead Trainer */}
                    <div className="space-y-12">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Pelaksana Intervensi
                      </span>
                      <div className="border-t border-stone-400 pt-1.5 mx-auto max-w-[130px]">
                        <span className="font-bold text-stone-900 block text-[11px]">
                          {targetPenugasan?.trainer_nama || 'Haikal Abi'}
                        </span>
                        <span className="text-[9.5px] text-stone-500 block">Lead Field Trainer</span>
                      </div>
                    </div>

                    {/* Signee 2: Store Manager */}
                    <div className="space-y-12">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Kepala Outlet
                      </span>
                      <div className="border-t border-stone-400 pt-1.5 mx-auto max-w-[130px]">
                        <span className="font-bold text-stone-900 block text-[11px]">
                          {targetOutlet?.kepala_outlet || 'Rian Hidayat'}
                        </span>
                        <span className="text-[9.5px] text-stone-500 block">Store Manager Gerai</span>
                      </div>
                    </div>

                    {/* Signee 3: Area Supervisor */}
                    <div className="space-y-12">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Area Supervisor
                      </span>
                      <div className="border-t border-stone-400 pt-1.5 mx-auto max-w-[130px]">
                        <span className="font-bold text-stone-900 block text-[11px]">
                          {targetOutlet?.area_supervisor || 'Bambang Kusuma'}
                        </span>
                        <span className="text-[9.5px] text-stone-500 block">Pengawas Wilayah</span>
                      </div>
                    </div>

                    {/* Signee 4: Operational Director HQ */}
                    <div className="space-y-12">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Kantor Pusat (HQ)
                      </span>
                      <div className="border-t border-stone-400 pt-1.5 mx-auto max-w-[130px]">
                        <span className="font-bold text-stone-900 block text-[11px]">
                          Management HQ
                        </span>
                        <span className="text-[9.5px] text-stone-500 block">Direktur Operasional</span>
                      </div>
                    </div>
                  </div>
                </div>
              </A4Sheet>
            )}
          </>
        )}

        {/* ======================================================================= */}
        {/* LAPORAN TIPE 2: DOSSIER KOMPETENSI KRU INDIVIDUAL */}
        {/* ======================================================================= */}
        {reportType === 'dossier_kru' && (
          <>
            {/* Lembar 1: Cover & Profil Resmi Kru */}
            {(activePageTab === 'ALL' || activePageTab === 1) && (
              <A4Sheet
                pageNumber={1}
                totalPages={totalPages}
                docNumber={`DOSSIER-KRU-${targetCrew?.id?.toUpperCase() || 'KRU-01'}`}
                docTitle="DOSSIER KOMPETENSI RESMI KRU LAPANGAN"
                subTitle="Rekam Jejak Individual, Hasil Asesmen Objektif, & Status Sertifikasi Mutu"
              >
                {/* Profile Identity Card */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-stone-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#8B1418] text-white flex items-center justify-center font-black text-lg shadow-sm">
                        {targetCrew?.nama_kru?.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-stone-900">{targetCrew?.nama_kru}</h2>
                        <span className="text-xs text-stone-500 font-medium">
                          {targetCrew?.jabatan} &bull; Stasiun {targetCrew?.divisi}
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider inline-block">
                        LEVEL: {composite.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">ID KRU</span>
                      <span className="font-mono font-bold text-stone-900">{targetCrew?.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">GERAI PENEMPATAN</span>
                      <span className="font-bold text-stone-900">{targetCrew?.kode_outlet}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">TANGGAL MASUK</span>
                      <span className="font-mono font-bold text-stone-900">{targetCrew?.tanggal_masuk}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">STATUS KERJA</span>
                      <span className="font-bold text-emerald-700">{targetCrew?.status_aktif}</span>
                    </div>
                  </div>
                </div>

                {/* Composite Score Spotlight */}
                <div className="p-4 rounded-xl bg-stone-900 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                      SKOR KOMPOSIT MULTI-FAKTOR (CQI)
                    </span>
                    <span className="text-2xl font-black font-mono text-amber-300">
                      {composite.total_composite} <span className="text-xs text-stone-400 font-normal">/ 100</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block">KATEGORI PRESTASI</span>
                    <span className="text-xs font-black uppercase tracking-wide text-white">
                      {composite.total_composite >= 90 ? '⭐⭐⭐ Mahir (Gold Standard)' : composite.total_composite >= 75 ? '⭐⭐ Terampil (Silver)' : '⭐ Pemula (In-Training)'}
                    </span>
                  </div>
                </div>

                {/* 4 Komponen Terbobot */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    Komposisi Penilaian Objektif Terbobot
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-white border border-stone-200 text-center">
                      <span className="text-[10px] text-stone-500 block">Teori SOP (25%)</span>
                      <b className="text-sm font-mono text-stone-900 block mt-1">{composite.teori_score} pt</b>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-stone-200 text-center">
                      <span className="text-[10px] text-stone-500 block">Praktik (35%)</span>
                      <b className="text-sm font-mono text-stone-900 block mt-1">{composite.praktik_score} pt</b>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-stone-200 text-center">
                      <span className="text-[10px] text-stone-500 block">Sikap HARA (25%)</span>
                      <b className="text-sm font-mono text-stone-900 block mt-1">{composite.sikap_score} pt</b>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-stone-200 text-center">
                      <span className="text-[10px] text-stone-500 block">Ketahanan Rush (15%)</span>
                      <b className="text-sm font-mono text-stone-900 block mt-1">{composite.rush_score} pt</b>
                    </div>
                  </div>
                </div>

                {/* Ringkasan Rekomendasi Utama */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5 leading-relaxed">
                  <b className="text-stone-900 block">Rekomendasi Utama Lead Trainer:</b>
                  <p className="text-stone-700">{actionPlan.rekomendasiUtama}</p>
                </div>
              </A4Sheet>
            )}

            {/* Lembar 2: Radar Kompetensi 5-Axis & Deviasi */}
            {(activePageTab === 'ALL' || activePageTab === 2) && (
              <A4Sheet
                pageNumber={2}
                totalPages={totalPages}
                docNumber={`DOSSIER-KRU-${targetCrew?.id?.toUpperCase() || 'KRU-01'}`}
                docTitle="POLA RADAR KOMPETENSI 5-AXIS & ANALISIS KESENJANGAN"
                subTitle="Visualisasi Multidimensional Standar Emas vs Skor Aktual Lapangan"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border border-stone-200 rounded-2xl p-5 bg-[#FAF8F5]/60">
                  <div className="md:col-span-6 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 font-mono">
                      RADAR DIAGNOSTIK INDIVIDUAL
                    </span>
                    <CrewRadarChart data={crewRadarData} size={250} showLabels={true} />
                  </div>
                  <div className="md:col-span-6 space-y-2 text-xs">
                    <h3 className="font-black text-xs uppercase tracking-wider text-[#8B1418] font-mono">
                      ANALISIS 5 DIMENSI KETERAMPILAN
                    </h3>
                    <div className="space-y-1.5 text-stone-700">
                      <div className="flex justify-between p-2 rounded-lg bg-white border border-stone-200">
                        <span>1. Teori SOP & HACCP:</span>
                        <b className="font-mono">{crewRadarData.teori_sop} / 100</b>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-white border border-stone-200">
                        <span>2. Keterampilan Praktik Stasiun:</span>
                        <b className="font-mono">{crewRadarData.praktik_jobdesk} / 100</b>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-white border border-stone-200">
                        <span>3. Nilai Budaya H.A.R.A:</span>
                        <b className="font-mono">{crewRadarData.sikap_hara} / 100</b>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-white border border-stone-200">
                        <span>4. Ketahanan Jam Sibuk:</span>
                        <b className="font-mono">{crewRadarData.ketahanan_rush} / 100</b>
                      </div>
                      <div className="flex justify-between p-2 rounded-lg bg-white border border-stone-200">
                        <span>5. Kecepatan Transaksi (SOS):</span>
                        <b className="font-mono">{crewRadarData.kecepatan_sos} / 100</b>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gap Action Plan */}
                <div className="space-y-2 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    Langkah Perbaikan Spesifik (Action Items)
                  </h3>
                  <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2 text-stone-700">
                    <ul className="space-y-1.5">
                      {actionPlan.langkahPerbaikan.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#8B1418] font-bold">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100 font-mono">
                      Target Evaluasi Ulang: {actionPlan.targetReviewHari} hari kalender ke depan.
                    </div>
                  </div>
                </div>
              </A4Sheet>
            )}

            {/* Lembar 3: Checklist Audit Objektif 4 Stasiun */}
            {(activePageTab === 'ALL' || activePageTab === 3) && (
              <A4Sheet
                pageNumber={3}
                totalPages={totalPages}
                docNumber={`DOSSIER-KRU-${targetCrew?.id?.toUpperCase() || 'KRU-01'}`}
                docTitle="LEMBAR EVALUASI CHECKLIST 4 STASIUN KERJA HARA"
                subTitle="Pemeriksaan Butir Kepatuhan Detail: Kitchen, Geprek, Kasir, & Helper"
              >
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[#8B1418]">STASIUN 1: KITCHEN & DEEP FRYING</span>
                      <span className="font-mono text-stone-700">Skor: 92/100</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-stone-600 text-[11px]">
                      <li>Pengecekan suhu minyak 160°C - 170°C dengan probe thermometer. (Sesuai)</li>
                      <li>Penepungan 2x celup (*double dipping*) merata tanpa gumpalan basah. (Sesuai)</li>
                      <li>Waktu goreng presisi 13 menit dengan timer digital alarm. (Sesuai)</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[#8B1418]">STASIUN 2: GEPREK & SAMBAL KHAS</span>
                      <span className="font-mono text-stone-700">Skor: 88/100</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-stone-600 text-[11px]">
                      <li>Penggunaan sendok takar baku untuk cabai rawit dan bawang putih. (Sesuai)</li>
                      <li>Minyak siram mencapai titik panas optimal tanpa menghasilkan aroma langu. (Sesuai)</li>
                      <li>Tingkat kepedasan level 1 s/d 5 terkalibrasi konsisten. (Perlu Pengawasan)</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[#8B1418]">STASIUN 3: KASIR, POS & 5S GREETING</span>
                      <span className="font-mono text-stone-700">Skor: 95/100</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-stone-600 text-[11px]">
                      <li>Penerapan 5S Greeting (Senyum, Salam, Sapa, Sopan, Santun) dengan intonasi hangat. (Sesuai)</li>
                      <li>Repeat order varian menu dan pesanan sambal sebelum pembayaran. (Sesuai)</li>
                      <li>Kecepatan penyelesaian transaksi di bawah 45 detik. (Sesuai)</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[#8B1418]">STASIUN 4: HELPER, PREP & SANITASI</span>
                      <span className="font-mono text-stone-700">Skor: 90/100</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-stone-600 text-[11px]">
                      <li>Pembersihan meja saji dan penggantian kain lap berkala sesuai kode warna. (Sesuai)</li>
                      <li>Pemilahan sampah organik dan anorganik di area cuci piring. (Sesuai)</li>
                      <li>Penyimpanan bahan baku dengan prinsip FIFO (First In First Out). (Sesuai)</li>
                    </ul>
                  </div>
                </div>
              </A4Sheet>
            )}

            {/* Lembar 4: Bimbingan Coaching GROW & Riwayat Ujian */}
            {(activePageTab === 'ALL' || activePageTab === 4) && (
              <A4Sheet
                pageNumber={4}
                totalPages={totalPages}
                docNumber={`DOSSIER-KRU-${targetCrew?.id?.toUpperCase() || 'KRU-01'}`}
                docTitle="LOG BIMBINGAN COACHING GROW & RIWAYAT UJIAN"
                subTitle="Catatan Sesi Mentoring 1-on-1, Rekam Ujian Teori/Praktik, & Tindak Lanjut"
              >
                <div className="space-y-4 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    Sesi Bimbingan Coaching (Model GROW)
                  </h3>
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2 leading-relaxed">
                    <div>
                      <b className="text-[#8B1418]">Goal (Sasaran):</b>
                      <p className="text-stone-700">Mencapai kemandirian 100% pada stasiun {targetCrew?.divisi} tanpa insiden deviasi selama 30 hari berturut-turut.</p>
                    </div>
                    <div>
                      <b className="text-[#8B1418]">Reality (Kondisi Lapangan):</b>
                      <p className="text-stone-700">Saat pesanan menumpuk lebih dari 8 antrean, kecepatan kerja menurun sekitar 15% akibat panik.</p>
                    </div>
                    <div>
                      <b className="text-[#8B1418]">Options (Opsi Solusi):</b>
                      <p className="text-stone-700">Mempersiapkan bahan prep lebih awal 30 menit sebelum jam sibuk dan mengatur pembagian tugas dengan rekan stasiun sebelah.</p>
                    </div>
                    <div>
                      <b className="text-[#8B1418]">Will (Komitmen Tindakan):</b>
                      <p className="text-stone-700">Berkomitmen menerapkan checklist prep harian dan meminta supervisi singkat tiap awal shift.</p>
                    </div>
                  </div>

                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    Riwayat Pengujian Terverifikasi
                  </h3>
                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100 font-bold text-stone-700 border-b border-stone-200">
                        <tr>
                          <th className="p-2.5">Tanggal</th>
                          <th className="p-2.5">Tipe Ujian</th>
                          <th className="p-2.5">Materi / Topik</th>
                          <th className="p-2.5">Skor</th>
                          <th className="p-2.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 text-stone-700">
                        <tr>
                          <td className="p-2.5 font-mono">10/08/2026</td>
                          <td className="p-2.5 font-bold">Ujian Teori</td>
                          <td className="p-2.5">Standar SOP {targetCrew?.divisi} & HACCP</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-700">90 / 100</td>
                          <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Lulus</span></td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono">12/08/2026</td>
                          <td className="p-2.5 font-bold">Uji Praktik Lapangan</td>
                          <td className="p-2.5">Simulasi Penanganan Rush Hour Stasiun</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-700">92 / 100</td>
                          <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Lulus</span></td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono">14/08/2026</td>
                          <td className="p-2.5 font-bold">Ujian Lisan</td>
                          <td className="p-2.5">Food Safety, Suhu Bahaya, & Budaya H.A.R.A</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-700">88 / 100</td>
                          <td className="p-2.5"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Lulus</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </A4Sheet>
            )}

            {/* Lembar 5: Rekomendasi Karir & Pengesahan Sertifikasi */}
            {(activePageTab === 'ALL' || activePageTab === 5) && (
              <A4Sheet
                pageNumber={5}
                totalPages={totalPages}
                docNumber={`DOSSIER-KRU-${targetCrew?.id?.toUpperCase() || 'KRU-01'}`}
                docTitle="REKOMENDASI KARIR & PENGESAHAN SERTIFIKASI RESMI"
                subTitle="Pemetaan 9-Box Talent Matrix, Otorisasi Kenaikan Jenjang, & Validasi QR"
              >
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF8F5] space-y-2">
                    <span className="text-[10px] font-mono font-black text-[#8B1418] uppercase tracking-wider block">
                      PEMETAAN 9-BOX TALENT MATRIX
                    </span>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-black text-sm text-stone-900">High Potential / Core Performer</h4>
                        <p className="text-[11px] text-stone-600">Direkomendasikan untuk promosi berjenjang ke posisi Shift Leader atau Assistant Trainer Gerai.</p>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-xl bg-amber-200 text-amber-900 font-bold text-xs">
                          Siap Promosi
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2 leading-relaxed">
                    <b className="text-stone-900 block font-bold">Catatan Otorisasi Kepala Trainer:</b>
                    <p className="text-stone-700">
                      Berdasarkan akumulasi skor teori, praktik, lisan, serta sikap kerja harian di gerai {targetCrew?.kode_outlet}, kru yang bersangkutan dinyatakan <b>LULUS SERTIFIKASI STANDAR EMAS HARA CHICKEN</b> dan berhak mendapatkan lencana kompetensi resmi.
                    </p>
                  </div>

                  {/* 3 Kolom Tanda Tangan */}
                  <div className="pt-8 border-t-2 border-stone-800 grid grid-cols-3 gap-6 text-center text-xs">
                    <div className="space-y-12">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Kru Yang Dinilai</span>
                      <div className="border-t border-stone-400 pt-1.5 mx-auto max-w-[140px]">
                        <span className="font-bold text-stone-900 block">{targetCrew?.nama_kru}</span>
                        <span className="text-[10px] text-stone-500">Kru {targetCrew?.divisi}</span>
                      </div>
                    </div>

                    <div className="space-y-12">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Kepala Gerai</span>
                      <div className="border-t border-stone-400 pt-1.5 mx-auto max-w-[140px]">
                        <span className="font-bold text-stone-900 block">{targetOutlet?.kepala_outlet || 'Store Manager'}</span>
                        <span className="text-[10px] text-stone-500">Penanggung Jawab Outlet</span>
                      </div>
                    </div>

                    <div className="space-y-12">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Lead Field Trainer</span>
                      <div className="border-t border-stone-400 pt-1.5 mx-auto max-w-[140px]">
                        <span className="font-bold text-stone-900 block">Haikal Abi</span>
                        <span className="text-[10px] text-stone-500">People Development HARA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </A4Sheet>
            )}
          </>
        )}

        {/* ======================================================================= */}
        {/* LAPORAN TIPE 3: EVALUASI PERIODIK KINERJA GERAI BULANAN */}
        {/* ======================================================================= */}
        {reportType === 'periodik_gerai' && (
          <>
            {(activePageTab === 'ALL' || activePageTab === 1) && (
              <A4Sheet
                pageNumber={1}
                totalPages={totalPages}
                docNumber={`REP-PERIODIK-${targetOutlet?.kode_outlet}-2026`}
                docTitle="LAPORAN EVALUASI PERIODIK KINERJA & KEPATUHAN GERAI"
                subTitle={`Ringkasan Kepatuhan SOP Bulanan Gerai ${targetOutlet?.nama_outlet}`}
              >
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border-2 border-stone-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#8B1418] uppercase tracking-wider font-bold block">
                        MONTHLY OPS AUDIT REPORT
                      </span>
                      <h2 className="text-base font-black text-stone-900">{targetOutlet?.nama_outlet}</h2>
                    </div>
                    <span className="px-3 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                      INDEKS MUTU: 91.2%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">KODE OUTLET</span>
                      <span className="font-mono font-bold text-stone-900">{targetOutlet?.kode_outlet}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">KEPALA OUTLET</span>
                      <span className="font-bold text-stone-900">{targetOutlet?.kepala_outlet}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">AREA SPV</span>
                      <span className="font-bold text-stone-900">{targetOutlet?.area_supervisor}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                    Ringkasan Eksekutif Kinerja Gerai
                  </h3>
                  <p className="text-stone-700 leading-relaxed bg-white p-4 rounded-xl border border-stone-200">
                    Sepanjang periode evaluasi bulan ini, gerai <b>{targetOutlet?.nama_outlet}</b> menunjukkan stabilitas operasional yang sangat baik. Tingkat kepatuhan resep sambal geprek mencapai 94%, tidak ada insiden sanitasi fatal, dan keluhan antrean kasir menurun 60% dibandingkan bulan sebelumnya.
                  </p>
                </div>
              </A4Sheet>
            )}

            {(activePageTab === 'ALL' || activePageTab >= 2) && (
              <A4Sheet
                pageNumber={activePageTab === 'ALL' ? 2 : activePageTab}
                totalPages={totalPages}
                docNumber={`REP-PERIODIK-${targetOutlet?.kode_outlet}-2026`}
                docTitle="AUDIT 4 STASIUN, KOMPLAIN, & REKOMENDASI TNA"
                subTitle={`Rincian Audit Stasiun, Penanganan Komplain, & Rencana Training Gerai ${targetOutlet?.nama_outlet}`}
              >
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
                    <b className="text-stone-900 block font-bold text-xs uppercase text-[#8B1418]">
                      Distribusi Kepatuhan 4 Stasiun Kerja Gerai:
                    </b>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Kitchen</span>
                        <b className="font-mono text-emerald-700 text-sm">94%</b>
                      </div>
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Geprek</span>
                        <b className="font-mono text-emerald-700 text-sm">90%</b>
                      </div>
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Kasir</span>
                        <b className="font-mono text-emerald-700 text-sm">96%</b>
                      </div>
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                        <span className="text-[10px] text-stone-500 block">Helper</span>
                        <b className="font-mono text-emerald-700 text-sm">92%</b>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-stone-200 space-y-2 leading-relaxed">
                    <b className="text-stone-900 block font-bold">Rencana Pelatihan Lanjutan (TNA Roadmap):</b>
                    <p className="text-stone-700">
                      Jadwalkan sesi penyegaran SOP minyak sambal geprek dan workshop upselling menu paket minuman untuk kasir pada tanggal 20 bulan ini.
                    </p>
                  </div>
                </div>
              </A4Sheet>
            )}
          </>
        )}

        {/* ======================================================================= */}
        {/* LAPORAN TIPE 4: EXECUTIVE BOARD SUMMARY (MANAJEMEN HQ) */}
        {/* ======================================================================= */}
        {reportType === 'executive_hq' && (
          <A4Sheet
            pageNumber={1}
            totalPages={4}
            docNumber="HQ-BOARD-OPS-2026-Q3"
            docTitle="EXECUTIVE BOARD SUMMARY: STANDAR MUTU OPERASIONAL NASIONAL"
            subTitle="Komparasi Kinerja Seluruh Gerai HARA Chicken & Utilisasi Tim Trainer"
          >
            <div className="space-y-4 text-xs">
              <div className="p-5 rounded-2xl bg-stone-900 text-white space-y-3">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">
                  NATIONAL QUALITY INDEX OVERVIEW
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Rata-rata Kepatuhan SOP</span>
                    <span className="text-2xl font-black font-mono text-amber-300">92.1%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Total Kru Tersertifikasi</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">{allKru.length} Kru</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Gerai Aktif Diaudit</span>
                    <span className="text-2xl font-black font-mono text-white">{outlets.length} Gerai</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-black text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1">
                  Komparasi Indeks Kinerja Gerai Nasional
                </h3>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-2.5">Kode</th>
                        <th className="p-2.5">Nama Gerai</th>
                        <th className="p-2.5">Area SPV</th>
                        <th className="p-2.5">Skor Kepatuhan</th>
                        <th className="p-2.5">Status Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-700">
                      {outlets.map((o) => (
                        <tr key={o.kode_outlet}>
                          <td className="p-2.5 font-mono font-bold">{o.kode_outlet}</td>
                          <td className="p-2.5">{o.nama_outlet}</td>
                          <td className="p-2.5">{o.area_supervisor}</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-700">92.5%</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                              Memenuhi Standar
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </A4Sheet>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// REUSABLE A4 PRINT SHEET WRAPPER COMPONENT
// =============================================================================
interface A4SheetProps {
  pageNumber: number;
  totalPages: number;
  docNumber: string;
  docTitle: string;
  subTitle: string;
  children: React.ReactNode;
}

const A4Sheet: React.FC<A4SheetProps> = ({
  pageNumber,
  totalPages,
  docNumber,
  docTitle,
  subTitle,
  children,
}) => {
  return (
    <div
      className="a4-page-sheet bg-white rounded-2xl sm:rounded-3xl border border-stone-300 p-6 sm:p-10 shadow-md text-stone-900 space-y-6 relative overflow-hidden print:border-none print:shadow-none print:p-8 print:m-0 print:rounded-none print:break-after-page print:min-h-screen"
      style={{
        pageBreakAfter: 'always',
        breakAfter: 'page',
      }}
    >
      {/* KOP RESMI DOKUMEN HARA CHICKEN */}
      <div className="border-b-2 border-stone-900 pb-3 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-xl font-black tracking-wider text-[#8B1418] font-mono">
              HARA CHICKEN INDONESIA
            </span>
            <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
              #BeneranDiGeprek
            </span>
          </div>
          <h1 className="text-xs sm:text-sm font-black text-stone-800 uppercase tracking-wider">
            {docTitle}
          </h1>
          <p className="text-[10.5px] text-stone-500">
            {subTitle} &bull; Nilai H.A.R.A (Halal &bull; Amanah &bull; Responsif &bull; Adaptif)
          </p>
        </div>

        <div className="text-right shrink-0 font-mono text-[10.5px] text-stone-600 space-y-0.5">
          <div>
            <b>No. Dokumen:</b> {docNumber}
          </div>
          <div>
            <b>Tanggal Terbit:</b>{' '}
            {new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <div className="text-[#8B1418] font-bold">
            LEMBAR RESMI HALAMAN {pageNumber} DARI {totalPages}
          </div>
        </div>
      </div>

      {/* Sheet Body Content */}
      <div className="space-y-5">{children}</div>

      {/* Official Sheet Footer with Page Number */}
      <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400 font-mono">
        <div>
          Dokumen Resmi Rahasia &bull; HARA Chicken Trainer & Operations Enterprise
        </div>
        <div className="font-bold text-stone-700">
          Halaman {pageNumber} dari {totalPages}
        </div>
      </div>
    </div>
  );
};
