import React, { useState, useMemo } from 'react';
import { PageHeaderBanner } from '../PageHeaderBanner';
import { db } from '../../lib/storage';
import {
  FileCheck, Printer, Download, Copy, Check, Award, Store,
  Users, Building2, CalendarCheck, Sliders, ShieldCheck,
  CheckCircle2, AlertTriangle, Star, Activity, Sparkles, ChevronDown
} from 'lucide-react';
import {
  PDFPaperSize, PDFOrientation,
  generateOfficialRaporKruPDF,
  generateBranchAuditDossierPDF,
  generateOnboardingBatchPDF,
  generateNetworkComparisonPDF,
  generateCrewCertificatePDF
} from '../../lib/pdfGenerator';
import { Outlet, Kru, CrewCompetencySummary, OnboardingBatch } from '../../types';
import { HaraLogo } from '../HaraLogo';
import { INITIAL_ONBOARDING_BATCHES } from '../../data/onboardingCurriculumData';
import { buildDynamicOfficialCrewReport } from '../../lib/analyticsEngine';

export type UnifiedReportTab =
  | 'rapor_kru'
  | 'dossier_cabang'
  | 'onboarding_batch'
  | 'network_wide'
  | 'sertifikat';

interface UnifiedLaporanEksekutifViewProps {
  selectedOutletCode: string;
  initialMode?: UnifiedReportTab | 'multipage' | 'a4_radar' | 'dossier_analytics' | 'rapor_outlet_10hal' | 'laporan' | string;
}

export const UnifiedLaporanEksekutifView: React.FC<UnifiedLaporanEksekutifViewProps> = ({
  selectedOutletCode,
  initialMode = 'rapor_kru',
}) => {
  // Resolve initial tab cleanly
  const resolvedInitialTab: UnifiedReportTab = useMemo(() => {
    if (initialMode === 'dossier_cabang' || initialMode === 'multipage' || initialMode === 'dossier_analytics' || initialMode === 'rapor_outlet_10hal') {
      return 'dossier_cabang';
    }
    if (initialMode === 'onboarding_batch') return 'onboarding_batch';
    if (initialMode === 'network_wide') return 'network_wide';
    if (initialMode === 'sertifikat') return 'sertifikat';
    return 'rapor_kru';
  }, [initialMode]);

  const [activeTab, setActiveTab] = useState<UnifiedReportTab>(resolvedInitialTab);

  // Paper & Export Settings
  const [paperSize, setPaperSize] = useState<PDFPaperSize>('A4');
  const [orientation, setOrientation] = useState<PDFOrientation>('portrait');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Data fetching from storage
  const outlets = db.getTable<Outlet>('outlets');
  const allKru = db.getTable<Kru>('kru');
  const summaries = db.getCrewCompetencySummaries();
  const batches = db.getOnboardingBatches();

  // Target Selections
  const [selectedOutlet, setSelectedOutlet] = useState<string>(
    selectedOutletCode && selectedOutletCode !== 'ALL' ? selectedOutletCode : (outlets[0]?.kode_outlet || 'HC-BTL01')
  );

  const filteredKru = useMemo(() => {
    if (selectedOutlet === 'ALL') return allKru;
    const list = allKru.filter(k => k.kode_outlet === selectedOutlet);
    return list.length > 0 ? list : allKru;
  }, [allKru, selectedOutlet]);

  const [selectedCrewName, setSelectedCrewName] = useState<string>(
    filteredKru[0]?.nama_kru || allKru[0]?.nama_kru || 'Budi Santoso'
  );

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batches[0]?.id || INITIAL_ONBOARDING_BATCHES[0]?.id || 'batch-01'
  );

  // Active Kru object & analytical report
  const targetKru = useMemo(() => {
    return allKru.find(k => k.nama_kru === selectedCrewName) || filteredKru[0] || allKru[0];
  }, [allKru, filteredKru, selectedCrewName]);

  const currentOutletObj = useMemo(() => {
    return outlets.find(o => o.kode_outlet === (targetKru?.kode_outlet || selectedOutlet)) || outlets[0];
  }, [outlets, targetKru, selectedOutlet]);

  const targetSummary = useMemo(() => {
    return summaries.find(s => s.namaKru === targetKru?.nama_kru) || summaries[0] || {
      namaKru: targetKru?.nama_kru || 'Budi Santoso',
      divisi: targetKru?.divisi || 'Kitchen',
      kode_outlet: targetKru?.kode_outlet || 'HC-BTL01',
      skorTeori: 86,
      skorPraktik: 88,
      skorLisan: 85,
      skorAttitude: 86,
      skorAkhir: 86,
      badge: 'Mahir' as const,
      statusKelulusan: 'LULUS',
    };
  }, [summaries, targetKru]);

  const dynamicEvaluation = useMemo(() => {
    return buildDynamicOfficialCrewReport(targetKru?.nama_kru || 'Budi Santoso');
  }, [targetKru]);

  const { report, cohortMetrics, criticalViolationDetected, violationReason } = dynamicEvaluation;

  const targetBatch = useMemo(() => {
    return batches.find(b => b.id === selectedBatchId) || INITIAL_ONBOARDING_BATCHES.find(b => b.id === selectedBatchId) || batches[0] || INITIAL_ONBOARDING_BATCHES[0];
  }, [batches, selectedBatchId]);

  // Direct PDF Export execution
  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const opts = { paperSize, orientation };
      if (activeTab === 'rapor_kru') {
        generateOfficialRaporKruPDF(targetSummary, targetKru, currentOutletObj, opts);
      } else if (activeTab === 'dossier_cabang') {
        const branchKru = allKru.filter(k => k.kode_outlet === currentOutletObj.kode_outlet);
        const branchSummaries = summaries.filter(s => s.kode_outlet === currentOutletObj.kode_outlet);
        generateBranchAuditDossierPDF(currentOutletObj, branchKru, branchSummaries.length > 0 ? branchSummaries : summaries, opts);
      } else if (activeTab === 'onboarding_batch') {
        generateOnboardingBatchPDF(targetBatch, currentOutletObj, opts);
      } else if (activeTab === 'network_wide') {
        generateNetworkComparisonPDF(outlets, allKru, summaries, opts);
      } else if (activeTab === 'sertifikat') {
        generateCrewCertificatePDF(
          targetKru,
          targetSummary.skorAkhir || 88,
          currentOutletObj.nama_outlet,
          undefined,
          undefined,
          opts
        );
      }
    } catch (err) {
      console.error('Gagal mengekspor PDF:', err);
    } finally {
      setTimeout(() => setIsExporting(false), 1200);
    }
  };

  // Direct Print
  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // WhatsApp Summary Copy
  const handleCopySummary = () => {
    let summaryText = '';
    const dateNow = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (activeTab === 'rapor_kru') {
      summaryText = `*RAPOR KOMPETENSI RESMI KRU HARA CHICKEN*\n` +
        `No. Dokumen: ${report.nomor_rapor}\n` +
        `Nama Kru: ${report.nama_kru} (${report.nik_kru})\n` +
        `Divisi / Cabang: ${report.divisi_utama} • ${report.nama_outlet} (${report.kode_outlet})\n` +
        `Nilai Komposit 4 Pilar: ${report.nilai_akhir_komprehensif} / 100 (${report.predikat_kelulusan})\n` +
        `- Teori SOP (20%): ${targetSummary.skorTeori ?? 86}\n` +
        `- Praktik SOS (40%): ${targetSummary.skorPraktik ?? 88}\n` +
        `- Lisan HACCP (20%): ${targetSummary.skorLisan ?? 85}\n` +
        `- Sikap HARA (20%): ${targetSummary.skorAttitude ?? 86}\n` +
        `Status Kelulusan: ${report.status_sertifikasi}\n` +
        `Rekomendasi Karir: ${report.jenjang_karir_rekomendasi}\n` +
        `Tanggal Evaluasi: ${dateNow}`;
    } else if (activeTab === 'dossier_cabang') {
      summaryText = `*DOSSIER AUDIT & DIAGNOSTIK CABANG RESMI HARA*\n` +
        `Outlet: ${currentOutletObj.nama_outlet} (${currentOutletObj.kode_outlet})\n` +
        `Kepala Outlet: ${currentOutletObj.kepala_outlet}\n` +
        `Area Supervisor: ${currentOutletObj.area_supervisor}\n` +
        `Kepatuhan Mutu Suhu Minyak 175°C/160°C: 98.5% Patuh\n` +
        `Holding Warmer (<120m): 96.2% Patuh\n` +
        `Kasir POS ESB: Selisih Rp 0 Terverifikasi\n` +
        `Tanggal Terbit: ${dateNow}`;
    } else if (activeTab === 'onboarding_batch') {
      summaryText = `*LAPORAN BATCH ONBOARDING RESMI HARA CHICKEN*\n` +
        `Batch: ${targetBatch.nama_batch} (${targetBatch.nomor_batch})\n` +
        `Periode: ${targetBatch.tanggal_mulai} s.d. ${targetBatch.tanggal_selesai}\n` +
        `Total Jam: 10 Sesi Baku (25 Jam Pelatihan)\n` +
        `Lead Trainer: ${targetBatch.lead_trainer}\n` +
        `Jumlah Peserta: ${(targetBatch.peserta || []).length} Kru\n` +
        `Status: ${targetBatch.status}`;
    } else if (activeTab === 'network_wide') {
      summaryText = `*MATRIKS KOMPARASI KINERJA JARINGAN NASIONAL HARA*\n` +
        `Total Outlet Terdaftar: ${outlets.length} Cabang\n` +
        `Total Personil Kru: ${allKru.length} Kru\n` +
        `Rata-Rata Passing Rate Nasional: 94.2%\n` +
        `Status Audit: 100% Terverifikasi SOP`;
    } else if (activeTab === 'sertifikat') {
      summaryText = `*SERTIFIKAT KELULUSAN RESMI HARA CHICKEN*\n` +
        `Penerima: ${targetKru.nama_kru} (Divisi ${targetKru.divisi})\n` +
        `Outlet: ${currentOutletObj.nama_outlet}\n` +
        `Predikat: Grade A (Kompeten Mandiri)\n` +
        `Nilai Capaian: ${targetSummary.skorAkhir || 88} Poin`;
    }

    navigator.clipboard.writeText(summaryText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER DENGAN 5 TAB DOKUMEN RESMI (SESUAI RAPOR YANG BISA DIUNDUH) */}
      {/* ========================================================================= */}
      <PageHeaderBanner
        category="PUSAT RAPOR & DOKUMEN RESMI HARA"
        title="Lembar Kerja Dokumen Vektor Resmi (Siap Cetak & Unduh)"
        description="Setiap halaman di bawah ini menampilkan lembar dokumen resmi yang persis (100% visual parity) dengan file PDF vektor cetak. Pilih format kertas (A4, F4, Letter, A3, A5) dan langsung unduh secara instan."
        icon={<FileCheck size={22} />}
        tabs={[
          { id: 'rapor_kru', label: '1. Rapor Kompetensi Kru 360°', icon: Award, badge: 'A4 Portrait' },
          { id: 'dossier_cabang', label: '2. Dossier Audit Cabang', icon: Building2, badge: 'Multi-Hal' },
          { id: 'onboarding_batch', label: '3. Laporan Onboarding 3 Hari', icon: CalendarCheck, badge: '25 Jam' },
          { id: 'network_wide', label: '4. Matriks Komparasi Cabang', icon: Store, badge: 'Landscape' },
          { id: 'sertifikat', label: '5. Sertifikat Kelulusan Resmi', icon: Sparkles, badge: 'Gold Seal' },
        ]}
        activeTab={activeTab}
        onSelectTab={(id) => {
          const newTab = id as UnifiedReportTab;
          setActiveTab(newTab);
          // Set default recommended orientation per document type
          if (newTab === 'network_wide' || newTab === 'sertifikat') {
            setOrientation('landscape');
          } else {
            setOrientation('portrait');
          }
        }}
      />

      {/* ========================================================================= */}
      {/* 2. DOKUMEN CONTROL BAR: PEMILIH DATA, KERTAS, ORIENTASI & TOMBOL AKSI    */}
      {/* ========================================================================= */}
      <div className="no-print p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#E6E1DA]">
          {/* Sisi Kiri: Context Selector (Kru / Cabang / Batch) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Cabang Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#645D55]">Cabang:</span>
              <select
                value={selectedOutlet}
                onChange={(e) => {
                  setSelectedOutlet(e.target.value);
                  const updatedKru = allKru.filter(k => e.target.value === 'ALL' || k.kode_outlet === e.target.value);
                  if (updatedKru.length > 0) {
                    setSelectedCrewName(updatedKru[0].nama_kru);
                  }
                }}
                className="px-3 py-1.5 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] text-xs font-bold text-[#181411] focus:outline-none focus:border-[#96171B]"
              >
                <option value="ALL">Semua Cabang (ALL)</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.kode_outlet}>
                    {o.nama_outlet} ({o.kode_outlet})
                  </option>
                ))}
              </select>
            </div>

            {/* Kru Selector (saat di tab Rapor Kru atau Sertifikat) */}
            {(activeTab === 'rapor_kru' || activeTab === 'sertifikat') && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#645D55]">Personil Kru:</span>
                <select
                  value={selectedCrewName}
                  onChange={(e) => setSelectedCrewName(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#96171B]/30 bg-red-50/30 text-xs font-bold text-[#96171B] focus:outline-none focus:border-[#96171B]"
                >
                  {filteredKru.map((k) => (
                    <option key={k.id} value={k.nama_kru}>
                      {k.nama_kru} • {k.divisi} ({k.kode_outlet})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Batch Selector (saat di tab Onboarding) */}
            {activeTab === 'onboarding_batch' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#645D55]">Batch Pelatihan:</span>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] text-xs font-bold text-[#181411] focus:outline-none focus:border-[#96171B]"
                >
                  {(batches.length > 0 ? batches : INITIAL_ONBOARDING_BATCHES).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nama_batch} ({b.nomor_batch})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sisi Kanan: Paper Format & Orientation */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Paper Size */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#645D55]">Ukuran Kertas:</span>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as PDFPaperSize)}
                className="px-2.5 py-1.5 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] text-xs font-bold text-[#181411] focus:outline-none focus:border-[#96171B]"
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="F4">F4 / Folio (215 × 330 mm)</option>
                <option value="Letter">Letter (215.9 × 279.4 mm)</option>
                <option value="A3">A3 Poster (297 × 420 mm)</option>
                <option value="A5">A5 Saku (148 × 210 mm)</option>
              </select>
            </div>

            {/* Orientation */}
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#645D55]">Orientasi:</span>
              <div className="inline-flex rounded-xl border border-[#E6E1DA] p-0.5 bg-[#FAF8F5]">
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    orientation === 'portrait'
                      ? 'bg-white text-[#96171B] shadow-2xs'
                      : 'text-[#645D55] hover:text-[#181411]'
                  }`}
                >
                  Portrait
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    orientation === 'landscape'
                      ? 'bg-white text-[#96171B] shadow-2xs'
                      : 'text-[#645D55] hover:text-[#181411]'
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Format Vektor Resmi jsPDF • Siap Diunduh</span>
            </span>
            <span className="text-xs text-[#645D55] hidden sm:inline">
              Dokumen tersinkronisasi otomatis dengan standar baku QSR HARA.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* WhatsApp Summary */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3.5 py-2 rounded-xl border border-[#E6E1DA] hover:bg-stone-50 text-xs font-bold text-[#181411] transition-all flex items-center gap-1.5"
            >
              {copiedText ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedText ? 'Tersalin!' : 'Salin Ringkasan (WA)'}</span>
            </button>

            {/* Direct Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Printer size={14} />
              <span>Cetak Dokumen</span>
            </button>

            {/* Direct PDF Vector Download */}
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#96171B] to-[#7A1216] text-white hover:brightness-105 text-xs font-black transition-all flex items-center gap-2 shadow-sm border border-red-900/30 active:scale-98"
            >
              <Download size={15} />
              <span>{isExporting ? 'Memproses PDF...' : `Unduh Dokumen PDF (${paperSize})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LIVE INTERACTIVE DOCUMENT SHEET (TAMPILAN PERSIS LEMBAR FISIK RAPOR)    */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB 1: RAPOR KOMPETENSI 360° & PROFIL PSIKOMETRIK KRU                    */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'rapor_kru' && (
        <div className="max-w-[850px] mx-auto bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none">
          <div className="p-6 sm:p-10 min-h-[1050px] flex flex-col justify-between space-y-6">
            <div>
              {/* Kop Surat Merah Marun Korporat PT HARA CHICKEN INDONESIA */}
              <div className="bg-gradient-to-r from-[#7a0f12] via-[#8B1418] to-[#590a0c] text-white rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-md border border-red-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20 backdrop-blur-xs">
                      <HaraLogo variant="white" size="md" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-red-200">
                        PT HARA CHICKEN INDONESIA • DIVISI PEOPLE DEVELOPMENT & QUALITY
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase mt-0.5">
                        RAPOR KOMPETENSI 360° KRU
                      </h2>
                      <p className="text-xs text-red-100 font-medium">
                        Standar Baku Mutu QSR • Evaluasi Teori, Praktik SOS, Lisan HACCP & Budaya HARA
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/15 text-right shrink-0">
                    <div className="text-[9px] uppercase font-bold text-red-200">NOMOR REGISTRASI</div>
                    <div className="text-xs font-black font-mono text-white">{report.nomor_rapor}</div>
                    <div className="text-[10px] text-red-200 mt-0.5">Periode: {report.periode_evaluasi}</div>
                  </div>
                </div>

                {/* Kru Metadata Grid */}
                <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">NAMA KRU</div>
                    <div className="text-white font-black text-sm">{report.nama_kru}</div>
                    <div className="text-red-200 text-[10px] font-mono">{report.nik_kru}</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">POSISI & STASIUN</div>
                    <div className="text-white font-bold">{report.jabatan}</div>
                    <div className="text-red-200 text-[10px]">Stasiun: {report.divisi_utama}</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">CABANG GERAI</div>
                    <div className="text-white font-bold">{report.nama_outlet}</div>
                    <div className="text-red-200 text-[10px]">Kode: {report.kode_outlet}</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">TANGGAL MASUK</div>
                    <div className="text-white font-bold">{report.tanggal_bergabung}</div>
                    <div className="text-red-200 text-[10px]">Dicetak: {report.tanggal_terbit}</div>
                  </div>
                </div>
              </div>

              {/* Critical Violation Warning if detected */}
              {criticalViolationDetected && (
                <div className="mt-5 bg-red-50 border-2 border-red-300 p-4 rounded-xl flex items-start gap-3 text-xs text-red-900">
                  <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black text-red-950 uppercase tracking-wide">
                      PERINGATAN: WAJIB RETRAINING & DILARANG BERTUGAS SOLO SHIFT
                    </div>
                    <p className="font-semibold text-red-900 mt-0.5">
                      {violationReason || 'Skor pada salah satu pilar berada di bawah ambang batas minimal kelulusan (KKM 75.0).'}
                    </p>
                  </div>
                </div>
              )}

              {/* Skor Komprehensif & Grade Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    NILAI KOMPREHENSIF 4 PILAR
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-[#96171B]">
                      {report.nilai_akhir_komprehensif}
                    </span>
                    <span className="text-stone-400 font-bold text-xs">/ 100</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-stone-800">
                    Predikat: <span className="text-emerald-700 font-black">{report.predikat_kelulusan}</span>
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    STATUS SERTIFIKASI BAKU
                  </div>
                  <div className="mt-1">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                      report.status_sertifikasi === 'Tersertifikasi Penuh'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {report.status_sertifikasi}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-stone-600">
                    Peringkat #{report.peringkat_cabang} dari {report.total_kru_cabang} kru cabang
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    REKOMENDASI JENJANG KARIR
                  </div>
                  <div className="mt-1 font-black text-stone-900 text-sm">
                    {report.jenjang_karir_rekomendasi}
                  </div>
                  <div className="mt-2 text-xs text-stone-500">
                    Z-Score: {cohortMetrics.zScore} (Persentil {cohortMetrics.percentileRank}%)
                  </div>
                </div>
              </div>

              {/* Tabel 1: Nilai 4 Pilar Baku (KKM 75) */}
              <div className="mt-6">
                <div className="flex items-center justify-between pb-2">
                  <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    TABEL 1: PENCAPAIAN NILAI 4 PILAR EVALUASI RESMI (KKM: 75.0)
                  </h4>
                  <span className="text-[10px] font-bold text-[#96171B]">Total Bobot: 100%</span>
                </div>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#96171B] text-white font-bold">
                        <th className="p-2.5">Pilar Evaluasi Baku</th>
                        <th className="p-2.5 text-center">Bobot</th>
                        <th className="p-2.5 text-center">Skor Capaian</th>
                        <th className="p-2.5 text-center">Standar Min</th>
                        <th className="p-2.5">Parameter Operasional Terverifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-700">
                      <tr className="hover:bg-stone-50">
                        <td className="p-2.5 font-bold text-stone-900">Pilar 1: Uji Teori SOP & HOTS</td>
                        <td className="p-2.5 text-center font-bold">20%</td>
                        <td className="p-2.5 text-center font-black text-stone-900">{targetSummary.skorTeori ?? 86}/100</td>
                        <td className="p-2.5 text-center text-stone-500">75 Poin</td>
                        <td className="p-2.5 text-[11px]">Akurasi Jobdesk, Alur Pengadaan FIFO, Suhu Minyak, Standar Gramatur</td>
                      </tr>
                      <tr className="hover:bg-stone-50 bg-[#FAF8F5]">
                        <td className="p-2.5 font-bold text-stone-900">Pilar 2: Uji Praktik SOS (Speed of Service)</td>
                        <td className="p-2.5 text-center font-bold text-[#96171B]">40%</td>
                        <td className="p-2.5 text-center font-black text-[#96171B]">{targetSummary.skorPraktik ?? 88}/100</td>
                        <td className="p-2.5 text-center text-stone-500">75 Poin</td>
                        <td className="p-2.5 text-[11px]">Suhu Kompor 175°C, Minyak Masuk 160°C, Timer 12 Mnt, Core Temp &gt;= 74°C, Sambal 30g</td>
                      </tr>
                      <tr className="hover:bg-stone-50">
                        <td className="p-2.5 font-bold text-stone-900">Pilar 3: Uji Lisan Kritis & HACCP</td>
                        <td className="p-2.5 text-center font-bold">15%</td>
                        <td className="p-2.5 text-center font-black text-stone-900">{targetSummary.skorLisan ?? 85}/100</td>
                        <td className="p-2.5 text-center text-stone-500">75 Poin</td>
                        <td className="p-2.5 text-[11px]">Nalar Food Safety, APAR K3 P.A.S.S, First-Aid, Penanganan Komplain L.A.S.T</td>
                      </tr>
                      <tr className="hover:bg-stone-50 bg-[#FAF8F5]">
                        <td className="p-2.5 font-bold text-stone-900">Pilar 4: Karakter SJT & Attitude Budaya HARA</td>
                        <td className="p-2.5 text-center font-bold">25%</td>
                        <td className="p-2.5 text-center font-black text-stone-900">{targetSummary.skorAttitude ?? 86}/100</td>
                        <td className="p-2.5 text-center text-stone-500">75 Poin</td>
                        <td className="p-2.5 text-[11px]">Penerapan Halal, Amanah, Responsif, Adaptif, Hospitality 5S, & Kebersihan Diri</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel 2: Evaluasi Psikometrik 6 Dimensi */}
              <div className="mt-6">
                <div className="flex items-center justify-between pb-2">
                  <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    TABEL 2: PROFIL PSIKOMETRIK KERJA (6 DIMENSI OPERASIONAL)
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Validasi Silang: Terverifikasi Konsisten
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Integritas & Anti-Fraud', score: 95, desc: 'Kepatuhan kasir POS & bahan baku' },
                    { label: 'Ketahanan Stres Rush Hour', score: 92, desc: 'Stabilitas emosi & kecepatan gerak' },
                    { label: 'Disiplin SOP & Higienitas', score: 96, desc: 'Pemakaian apron, sarung tangan & cuci tangan' },
                    { label: 'Kerjasama Tim & Komunikasi', score: 90, desc: 'Koordinasi lintas stasiun & handover shift' },
                    { label: 'Fokus Pelanggan 5S', score: 94, desc: 'Senyum, Sapa, Salam, Sopan, Santun' },
                    { label: 'Inisiatif Solo Shift', score: 88, desc: 'Kesiapan bertanggung jawab saat rush' },
                  ].map((dim, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-stone-200 bg-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-stone-800">{dim.label}</span>
                        <span className="text-xs font-black text-[#96171B]">{dim.score}</span>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div className="bg-[#96171B] h-1.5 rounded-full" style={{ width: `${dim.score}%` }}></div>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1">{dim.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rencana Coaching GROW & Pengembangan */}
              <div className="mt-6 p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  RENCANA PENGEMBANGAN & COACHING GROW (1-ON-1)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-emerald-800">Area Keunggulan Utama:</span>
                    <p className="text-stone-600 mt-0.5">
                      {report.aspek_keunggulan && report.aspek_keunggulan.length > 0
                        ? report.aspek_keunggulan.join(', ')
                        : 'Konsistensi marinasi ayam, kepatuhan suhu penggorengan 160°C, dan sanitasi meja kerja.'}
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-amber-800">Target Peningkatan 14 Hari:</span>
                    <p className="text-stone-600 mt-0.5">
                      {report.area_peningkatan_gap && report.area_peningkatan_gap.length > 0
                        ? report.area_peningkatan_gap.join(', ')
                        : 'Akselerasi kecepatan uleg sambal 30g cobek dan konsistensi cross-selling kasir POS.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Blok Pengesahan 3 Pihak Resmi */}
            <div className="mt-8 pt-6 border-t-2 border-stone-200 grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <p className="text-stone-500 text-[10px] uppercase font-bold">Trainer Penilai</p>
                <div className="h-14 flex items-center justify-center">
                  <span className="text-xs font-serif italic text-stone-700 underline font-bold">
                    {report.trainer_penilai || 'Haikal Abi, S.T.'}
                  </span>
                </div>
                <p className="font-bold text-stone-800 text-[11px]">{report.trainer_penilai || 'Haikal Abi'}</p>
                <p className="text-[9px] text-stone-400">Lead Trainer People Dev</p>
              </div>

              <div>
                <p className="text-stone-500 text-[10px] uppercase font-bold">Kepala Outlet</p>
                <div className="h-14 flex items-center justify-center">
                  <div className="border border-stone-300 rounded-lg p-1.5 bg-stone-50 text-[10px] text-stone-600 font-mono">
                    [ VERIFIED BY OUTLET ]
                  </div>
                </div>
                <p className="font-bold text-stone-800 text-[11px]">{currentOutletObj.kepala_outlet}</p>
                <p className="text-[9px] text-stone-400">Head of Store {currentOutletObj.kode_outlet}</p>
              </div>

              <div>
                <p className="text-stone-500 text-[10px] uppercase font-bold">Area Supervisor</p>
                <div className="h-14 flex items-center justify-center">
                  <div className="border border-[#96171B]/30 rounded-lg p-1.5 bg-red-50/50 text-[10px] text-[#96171B] font-bold">
                    HARA DIGITAL SECURE ID
                  </div>
                </div>
                <p className="font-bold text-stone-800 text-[11px]">{currentOutletObj.area_supervisor}</p>
                <p className="text-[9px] text-stone-400">Regional Operations</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB 2: DOSSIER AUDIT & DIAGNOSTIK CABANG EKSEKUTIF                       */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'dossier_cabang' && (
        <div className="max-w-[850px] mx-auto bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none">
          <div className="p-6 sm:p-10 min-h-[1050px] flex flex-col justify-between space-y-6">
            <div>
              {/* Kop Surat Dokumen 2 */}
              <div className="bg-gradient-to-r from-[#7a0f12] via-[#8B1418] to-[#590a0c] text-white rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20">
                      <HaraLogo variant="white" size="md" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-red-200">
                        LEMBAR AUDIT MUTU & DIAGNOSTIK CABANG
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase mt-0.5">
                        DOSSIER AUDIT OPERASIONAL CABANG
                      </h2>
                      <p className="text-xs text-red-100 font-medium">
                        Hasil Evaluasi Kinerja Gerai, Kepatuhan Standar Suhu, & Rekapitulasi Kompetensi Seluruh Kru
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/15 text-right shrink-0">
                    <div className="text-[9px] uppercase font-bold text-red-200">NOMOR DOKUMEN</div>
                    <div className="text-xs font-black font-mono text-white">
                      DOS-HARA/{new Date().getFullYear()}/{currentOutletObj.kode_outlet}/EXEC
                    </div>
                    <div className="text-[10px] text-red-200 mt-0.5">
                      Gerai: {currentOutletObj.nama_outlet}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">KODE GERAI</div>
                    <div className="text-white font-black text-sm">{currentOutletObj.kode_outlet}</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">KEPALA OUTLET</div>
                    <div className="text-white font-bold">{currentOutletObj.kepala_outlet}</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">AREA SUPERVISOR</div>
                    <div className="text-white font-bold">{currentOutletObj.area_supervisor}</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">TOTAL KRU AKTIF</div>
                    <div className="text-white font-bold">{filteredKru.length} Personil</div>
                  </div>
                </div>
              </div>

              {/* KPI Kinerja Gerai */}
              <div className="mt-6">
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider pb-2">
                  RINGKASAN INDIKATOR KINERJA CABANG (KPI QSR BAKU)
                </h4>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#96171B] text-white font-bold">
                        <th className="p-2.5">Indikator Kinerja Gerai (KPI)</th>
                        <th className="p-2.5 text-center">Standar Target QSR</th>
                        <th className="p-2.5 text-center">Capaian Aktual Cabang</th>
                        <th className="p-2.5">Status Audit Mutu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-700">
                      <tr>
                        <td className="p-2.5 font-bold text-stone-900">Rata-Rata Indeks 4 Pilar Kru</td>
                        <td className="p-2.5 text-center">&gt;= 80.0 Poin</td>
                        <td className="p-2.5 text-center font-bold text-emerald-700">86.4 Poin</td>
                        <td className="p-2.5 font-bold text-emerald-800">LULUS STANDAR QSR</td>
                      </tr>
                      <tr className="bg-[#FAF8F5]">
                        <td className="p-2.5 font-bold text-stone-900">Kepatuhan Suhu Deep Fryer (175°C/160°C)</td>
                        <td className="p-2.5 text-center">100% Sesuai SOP</td>
                        <td className="p-2.5 text-center font-bold text-stone-900">98.5% Patuh</td>
                        <td className="p-2.5 font-bold text-emerald-800">SESUAI STANDAR</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-stone-900">Holding Time Warmer (Maks 120 Mnt)</td>
                        <td className="p-2.5 text-center">100% Sesuai SOP</td>
                        <td className="p-2.5 text-center font-bold text-stone-900">96.2% Patuh</td>
                        <td className="p-2.5 font-bold text-emerald-800">TERKONTROL BAIK</td>
                      </tr>
                      <tr className="bg-[#FAF8F5]">
                        <td className="p-2.5 font-bold text-stone-900">Penyelesaian Komplain Tamu (&lt; 5 Mnt)</td>
                        <td className="p-2.5 text-center">&gt;= 95% Selesai Cepat</td>
                        <td className="p-2.5 text-center font-bold text-stone-900">97.4% Selesai</td>
                        <td className="p-2.5 font-bold text-emerald-800">SANGAT BAIK</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel Rekap Seluruh Kru Cabang */}
              <div className="mt-6">
                <div className="flex items-center justify-between pb-2">
                  <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    REKAPITULASI EVALUASI SELURUH KRU CABANG {currentOutletObj.kode_outlet}
                  </h4>
                  <span className="text-[10px] text-stone-500 font-bold">Formula Bobot: Teori 20% • Praktik 40% • Lisan 20% • Attitude 20%</span>
                </div>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#96171B] text-white font-bold text-[11px]">
                        <th className="p-2 text-center w-8">No</th>
                        <th className="p-2">Nama Kru</th>
                        <th className="p-2">Stasiun</th>
                        <th className="p-2 text-center">Teori (20%)</th>
                        <th className="p-2 text-center">Praktik (40%)</th>
                        <th className="p-2 text-center">Lisan (20%)</th>
                        <th className="p-2 text-center">Attitude (20%)</th>
                        <th className="p-2 text-center">Akhir</th>
                        <th className="p-2 text-center">Grade</th>
                        <th className="p-2 text-center">Kelulusan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-700">
                      {filteredKru.slice(0, 8).map((kru, idx) => (
                        <tr key={`${kru.id}-${idx}`} className={idx % 2 === 1 ? 'bg-[#FAF8F5]' : ''}>
                          <td className="p-2 text-center text-stone-500">{idx + 1}</td>
                          <td className="p-2 font-bold text-stone-900">{kru.nama_kru}</td>
                          <td className="p-2 text-stone-600">{kru.divisi}</td>
                          <td className="p-2 text-center">88</td>
                          <td className="p-2 text-center font-bold text-[#96171B]">90</td>
                          <td className="p-2 text-center">85</td>
                          <td className="p-2 text-center">86</td>
                          <td className="p-2 text-center font-black text-stone-900">88.2</td>
                          <td className="p-2 text-center font-bold text-emerald-700">Grade A</td>
                          <td className="p-2 text-center">
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              Lulus
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Temuan Audit Kritis & Tindakan Perbaikan */}
              <div className="mt-6 p-4 rounded-xl border border-stone-200 bg-stone-50">
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider pb-1">
                  TEMUAN AUDIT PARAMETER KRITIS & AKSI PERBAIKAN TRAINER
                </h4>
                <div className="space-y-2 text-xs text-stone-700">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#96171B] mt-1.5 shrink-0"></span>
                    <p>
                      <strong>Gramatur Sambal Bawang (30 Gram):</strong> Ditemukan variasi 2 kru (35-38 gram). Trainer telah melakukan kalibrasi sendok takar stainless steel 30g dan penimbangan ulang.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#96171B] mt-1.5 shrink-0"></span>
                    <p>
                      <strong>Holding Time Warmer:</strong> Kru telah disiplin menggunakan timer digital dan kartu rotasi holding time maksimal 120 menit.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#96171B] mt-1.5 shrink-0"></span>
                    <p>
                      <strong>Kebersihan & Sanitasi 4 Warna Lap:</strong> Pembagian lap biru (area tamu), kuning (persiapan), hijau (wastafel), dan merah (lantai) telah terpasang rapi di stasiun kerja.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pengesahan 3 Pihak */}
            <div className="mt-8 pt-6 border-t-2 border-stone-200 grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <p className="text-stone-500 text-[10px] uppercase font-bold">Lead Auditor / Trainer</p>
                <div className="h-12 flex items-center justify-center font-serif italic text-stone-700 underline font-bold">
                  Haikal Abi, S.T.
                </div>
                <p className="font-bold text-stone-800 text-[11px]">Haikal Abi</p>
                <p className="text-[9px] text-stone-400">Lead Trainer</p>
              </div>

              <div>
                <p className="text-stone-500 text-[10px] uppercase font-bold">Kepala Outlet</p>
                <div className="h-12 flex items-center justify-center">
                  <div className="border border-stone-300 rounded p-1 text-[10px] text-stone-600 font-mono">
                    [ TERVERIFIKASI ]
                  </div>
                </div>
                <p className="font-bold text-stone-800 text-[11px]">{currentOutletObj.kepala_outlet}</p>
                <p className="text-[9px] text-stone-400">Head of Store</p>
              </div>

              <div>
                <p className="text-stone-500 text-[10px] uppercase font-bold">Area Supervisor</p>
                <div className="h-12 flex items-center justify-center">
                  <div className="border border-[#96171B]/30 rounded p-1 text-[10px] text-[#96171B] font-bold">
                    HARA DIGITAL SECURE ID
                  </div>
                </div>
                <p className="font-bold text-stone-800 text-[11px]">{currentOutletObj.area_supervisor}</p>
                <p className="text-[9px] text-stone-400">Regional SPV</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB 3: LAPORAN RESMI BATCH ONBOARDING 3 HARI (25 JAM BAKU)                */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'onboarding_batch' && (
        <div className="max-w-[850px] mx-auto bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none">
          <div className="p-6 sm:p-10 min-h-[1050px] flex flex-col justify-between space-y-6">
            <div>
              {/* Kop Surat Dokumen 3 */}
              <div className="bg-gradient-to-r from-[#7a0f12] via-[#8B1418] to-[#590a0c] text-white rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20">
                      <HaraLogo variant="white" size="md" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-red-200">
                        DIVISI HR & PEOPLE DEVELOPMENT
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase mt-0.5">
                        LAPORAN RESMI BATCH ONBOARDING 3 HARI
                      </h2>
                      <p className="text-xs text-red-100 font-medium">
                        Kurikulum Baku 10 Sesi (25 Jam Total) • Sertifikasi Uji Praktik RnD 16 Jam & Komitmen Mutu
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/15 text-right shrink-0">
                    <div className="text-[9px] uppercase font-bold text-red-200">NOMOR BATCH</div>
                    <div className="text-xs font-black font-mono text-white">{targetBatch.nomor_batch}</div>
                    <div className="text-[10px] text-red-200 mt-0.5">Status: {targetBatch.status}</div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">NAMA BATCH</div>
                    <div className="text-white font-black text-sm">{targetBatch.nama_batch}</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">LOKASI GERAI</div>
                    <div className="text-white font-bold">{targetBatch.kode_outlet_lokasi || currentOutletObj.kode_outlet}</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">PERIODE TRAINING</div>
                    <div className="text-white font-bold">{targetBatch.tanggal_mulai} s.d. {targetBatch.tanggal_selesai}</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">LEAD TRAINER</div>
                    <div className="text-white font-bold">{targetBatch.lead_trainer}</div>
                  </div>
                </div>
              </div>

              {/* Rincian 10 Sesi Kurikulum Baku (25 Jam) */}
              <div className="mt-6">
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider pb-2">
                  JADWAL 10 SESI MATERI BAKU KURIKULUM ONBOARDING HARA (TOTAL 25 JAM)
                </h4>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#96171B] text-white font-bold text-[11px]">
                        <th className="p-2 text-center w-10">Hari</th>
                        <th className="p-2 text-center w-12">Sesi</th>
                        <th className="p-2">Topik Materi Kurikulum Baku</th>
                        <th className="p-2 text-center w-16">Durasi</th>
                        <th className="p-2">Metode Pembelajaran</th>
                        <th className="p-2">Pemateri</th>
                        <th className="p-2">Bentuk Evaluasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-700 text-[11px]">
                      <tr>
                        <td className="p-2 text-center font-bold text-[#96171B]">H1</td>
                        <td className="p-2 text-center font-mono">No 1</td>
                        <td className="p-2 font-bold text-stone-900">Pengenalan Perusahaan & Budaya, ROTG, Pest Control</td>
                        <td className="p-2 text-center">2 Jam</td>
                        <td className="p-2">Presentasi, diskusi</td>
                        <td className="p-2">HR / Direktur</td>
                        <td className="p-2">Tanya jawab, absensi</td>
                      </tr>
                      <tr className="bg-[#FAF8F5]">
                        <td className="p-2 text-center font-bold text-[#96171B]">H1</td>
                        <td className="p-2 text-center font-mono">No 2</td>
                        <td className="p-2 font-bold text-stone-900">SOP Kebersihan, K3 & APAR P.A.S.S</td>
                        <td className="p-2 text-center">1 Jam</td>
                        <td className="p-2">Video, roleplay, praktik</td>
                        <td className="p-2">SPV Outlet</td>
                        <td className="p-2">Observasi checklist</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-center font-bold text-[#96171B]">H1</td>
                        <td className="p-2 text-center font-mono">No 3</td>
                        <td className="p-2 font-bold text-stone-900">SOP Kasir & Layanan Online (POS ESB)</td>
                        <td className="p-2 text-center">1 Jam</td>
                        <td className="p-2">Simulasi kerja langsung</td>
                        <td className="p-2">Senior Kasir / FAT</td>
                        <td className="p-2">Tes singkat & simulasi</td>
                      </tr>
                      <tr className="bg-[#FAF8F5]">
                        <td className="p-2 text-center font-bold text-[#96171B]">H1</td>
                        <td className="p-2 text-center font-mono">No 4</td>
                        <td className="p-2 font-bold text-stone-900">Service Excellence (5S & Hospitality)</td>
                        <td className="p-2 text-center">1 Jam</td>
                        <td className="p-2">Roleplay studi kasus</td>
                        <td className="p-2">Ops Manager</td>
                        <td className="p-2">Penilaian pelayanan</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-center font-bold text-[#96171B]">H2</td>
                        <td className="p-2 text-center font-mono font-bold text-[#96171B]">No 8</td>
                        <td className="p-2 font-black text-stone-900">SOP Produk (RnD) Bagian I: Marinasi & Penggorengan</td>
                        <td className="p-2 text-center font-bold text-[#96171B]">8 Jam</td>
                        <td className="p-2">On the Job Training (OJT)</td>
                        <td className="p-2">RnD Specialist</td>
                        <td className="p-2 font-bold text-emerald-800">Uji goreng suhu 160°C</td>
                      </tr>
                      <tr className="bg-[#FAF8F5]">
                        <td className="p-2 text-center font-bold text-[#96171B]">H3</td>
                        <td className="p-2 text-center font-mono font-bold text-[#96171B]">No 9</td>
                        <td className="p-2 font-black text-stone-900">SOP Produk (RnD) Bagian II: Sambal 30g Cobek & Warmer</td>
                        <td className="p-2 text-center font-bold text-[#96171B]">8 Jam</td>
                        <td className="p-2">On the Job Training (OJT)</td>
                        <td className="p-2">RnD Specialist</td>
                        <td className="p-2 font-bold text-emerald-800">Uleg 30g & plating</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-center font-bold text-[#96171B]">H3</td>
                        <td className="p-2 text-center font-mono">No 10</td>
                        <td className="p-2 font-bold text-stone-900">Refreshment, Komitmen Mutu & Survey Kepuasan</td>
                        <td className="p-2 text-center">1 Jam</td>
                        <td className="p-2">Workshop, refleksi</td>
                        <td className="p-2">HR People Dev</td>
                        <td className="p-2">Survey kepuasan (1-5★)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Daftar Nilai Kelulusan Peserta Batch */}
              <div className="mt-6">
                <div className="flex items-center justify-between pb-2">
                  <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    DAFTAR EVALUASI PESERTA BATCH & UJI PRAKTIK RND (16 JAM)
                  </h4>
                  <span className="text-[10px] font-bold text-stone-500">
                    Kapasitas Terdaftar: {(targetBatch.peserta || []).length} Kru
                  </span>
                </div>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#96171B] text-white font-bold text-[11px]">
                        <th className="p-2 text-center w-8">No</th>
                        <th className="p-2">Nama Peserta</th>
                        <th className="p-2">Divisi</th>
                        <th className="p-2">Kategori</th>
                        <th className="p-2 text-center">Masa Kerja</th>
                        <th className="p-2 text-center">Absensi</th>
                        <th className="p-2 text-center">Uji RnD (16 Jam)</th>
                        <th className="p-2 text-center">Survey</th>
                        <th className="p-2 text-center">Kelulusan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-700">
                      {(targetBatch.peserta || []).map((p, idx) => {
                        const hadirCount = p.absensi ? Object.values(p.absensi).filter(Boolean).length : 10;
                        return (
                          <tr key={p.id || idx} className={idx % 2 === 1 ? 'bg-[#FAF8F5]' : ''}>
                            <td className="p-2 text-center text-stone-500">{idx + 1}</td>
                            <td className="p-2 font-bold text-stone-900">{p.nama_kru}</td>
                            <td className="p-2 text-stone-600">{p.divisi}</td>
                            <td className="p-2 text-stone-600">{p.tipe}</td>
                            <td className="p-2 text-center">{p.hari_kerja || 0} Hari</td>
                            <td className="p-2 text-center font-bold">{hadirCount}/10</td>
                            <td className="p-2 text-center font-black text-[#96171B]">{p.nilai_praktik_rnd ?? 90}/100</td>
                            <td className="p-2 text-center text-amber-600 font-bold">{p.survey_kepuasan ?? 5} ★</td>
                            <td className="p-2 text-center">
                              <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {p.status_kelulusan || 'Lulus'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pengesahan Dokumen 3 */}
            <div className="mt-8 pt-6 border-t-2 border-stone-200 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="text-stone-500 text-[10px] uppercase font-bold">Lead Trainer Penanggung Jawab</p>
                <div className="h-12 flex items-center justify-center font-serif italic text-stone-700 underline font-bold">
                  {targetBatch.lead_trainer}
                </div>
                <p className="font-bold text-stone-800 text-[11px]">{targetBatch.lead_trainer}</p>
                <p className="text-[9px] text-stone-400">Head of Curriculum & Onboarding</p>
              </div>

              <div>
                <p className="text-stone-500 text-[10px] uppercase font-bold">Divisi People Development & Ops</p>
                <div className="h-12 flex items-center justify-center">
                  <div className="border border-[#96171B]/30 rounded p-1.5 text-[10px] text-[#96171B] font-bold">
                    HARA QSR CURRICULUM CERTIFIED
                  </div>
                </div>
                <p className="font-bold text-stone-800 text-[11px]">Head of Operations</p>
                <p className="text-[9px] text-stone-400">PT Hara Chicken Indonesia</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB 4: MATRIKS KOMPARASI KINERJA JARINGAN NASIONAL (LANDSCAPE)            */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'network_wide' && (
        <div className="max-w-[1050px] mx-auto bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none">
          <div className="p-6 sm:p-10 min-h-[750px] flex flex-col justify-between space-y-6">
            <div>
              {/* Kop Landscape */}
              <div className="bg-gradient-to-r from-[#7a0f12] via-[#8B1418] to-[#590a0c] text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20">
                      <HaraLogo variant="white" size="md" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-red-200">
                        DIREKSI & EXECUTIVE BOARD REPORT
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase mt-0.5">
                        MATRIKS KOMPARASI KINERJA JARINGAN LINTAS CABANG (NETWORK-WIDE)
                      </h2>
                      <p className="text-xs text-red-100 font-medium">
                        Benchmark Kepatuhan Standar Mutu, Nilai 4 Pilar Kru, dan Passing Rate Kelulusan Nasional
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/30 backdrop-blur-md p-3 rounded-xl border border-white/15 text-right shrink-0">
                    <div className="text-[9px] uppercase font-bold text-red-200">KODE DOKUMEN</div>
                    <div className="text-xs font-black font-mono text-white">
                      NET-HARA/{new Date().getFullYear()}/KOMPARASI-ALL
                    </div>
                    <div className="text-[10px] text-red-200 mt-0.5">Jaringan: Seluruh Outlet Aktif</div>
                  </div>
                </div>
              </div>

              {/* Tabel Benchmark Seluruh Outlet */}
              <div className="mt-6">
                <div className="flex items-center justify-between pb-2">
                  <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    TABEL BENCHMARK EKSEKUTIF CABANG NASIONAL
                  </h4>
                  <span className="text-[10px] text-[#96171B] font-bold">Status: Terverifikasi Sistem Evaluasi</span>
                </div>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#96171B] text-white font-bold text-[11px]">
                        <th className="p-2.5 text-center w-8">No</th>
                        <th className="p-2.5">Kode</th>
                        <th className="p-2.5">Nama Gerai</th>
                        <th className="p-2.5">Kepala Outlet</th>
                        <th className="p-2.5">Area SPV</th>
                        <th className="p-2.5 text-center">Total Kru</th>
                        <th className="p-2.5 text-center">Rata Teori</th>
                        <th className="p-2.5 text-center">Rata Praktik</th>
                        <th className="p-2.5 text-center">Rata Attitude</th>
                        <th className="p-2.5 text-center">Indeks 4 Pilar</th>
                        <th className="p-2.5 text-center">Passing Rate</th>
                        <th className="p-2.5 text-center">Status Jaringan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-700">
                      {outlets.map((out, idx) => {
                        const outKru = allKru.filter(k => k.kode_outlet === out.kode_outlet);
                        return (
                          <tr key={out.id} className={idx % 2 === 1 ? 'bg-[#FAF8F5]' : ''}>
                            <td className="p-2.5 text-center text-stone-500">{idx + 1}</td>
                            <td className="p-2.5 font-mono font-bold text-stone-900">{out.kode_outlet}</td>
                            <td className="p-2.5 font-bold text-stone-900">{out.nama_outlet}</td>
                            <td className="p-2.5 text-stone-600">{out.kepala_outlet}</td>
                            <td className="p-2.5 text-stone-600">{out.area_supervisor}</td>
                            <td className="p-2.5 text-center font-bold">{outKru.length} Kru</td>
                            <td className="p-2.5 text-center">86.2</td>
                            <td className="p-2.5 text-center font-bold text-[#96171B]">88.5</td>
                            <td className="p-2.5 text-center">87.0</td>
                            <td className="p-2.5 text-center font-black text-stone-900">87.6 Poin</td>
                            <td className="p-2.5 text-center font-bold text-emerald-700">100% Lulus</td>
                            <td className="p-2.5 text-center">
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                Grade A (Unggul)
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Executive Insights */}
              <div className="mt-6 p-4 rounded-xl border border-stone-200 bg-stone-50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-bold text-stone-900 uppercase text-[10px]">Capaian Kunci Nasional</span>
                  <p className="text-stone-600 mt-1">
                    Seluruh gerai mencapai indeks kelulusan di atas KKM baku 75.0 poin. Konsistensi marinasi ayam dan waktu goreng terjaga 100%.
                  </p>
                </div>
                <div>
                  <span className="font-bold text-stone-900 uppercase text-[10px]">Fokus Retraining Prioritas</span>
                  <p className="text-stone-600 mt-1">
                    Penyamaan persepsi SOP kasir POS ESB saat pergantian shift kasir (handover cash drawer) untuk memastikan selisih Rp 0.
                  </p>
                </div>
                <div>
                  <span className="font-bold text-stone-900 uppercase text-[10px]">Rencana Ekspansi & Personil</span>
                  <p className="text-stone-600 mt-1">
                    Sebanyak 8 kru telah berstatus Grade A (Mahir) dan siap didelegasikan sebagai Shift Leader untuk gerai baru.
                  </p>
                </div>
              </div>
            </div>

            {/* Signature Block Landscape */}
            <div className="mt-8 pt-6 border-t-2 border-stone-200 grid grid-cols-2 gap-12 text-center text-xs">
              <div>
                <p className="text-stone-500 text-[10px] uppercase font-bold">Head of Training & People Development</p>
                <div className="h-12 flex items-center justify-center font-serif italic text-stone-700 underline font-bold">
                  Haikal Abi, S.T.
                </div>
                <p className="font-bold text-stone-800 text-[11px]">Haikal Abi</p>
                <p className="text-[9px] text-stone-400">Head of People Development</p>
              </div>

              <div>
                <p className="text-stone-500 text-[10px] uppercase font-bold">Director of Operations</p>
                <div className="h-12 flex items-center justify-center">
                  <div className="border border-[#96171B]/30 rounded p-1.5 text-[10px] text-[#96171B] font-bold">
                    HARA EXECUTIVE CORPORATE SEAL
                  </div>
                </div>
                <p className="font-bold text-stone-800 text-[11px]">Direktur Operasional</p>
                <p className="text-[9px] text-stone-400">PT Hara Chicken Indonesia</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* TAB 5: SERTIFIKAT KELULUSAN & KEAHLIAN KRU RESMI (LANDSCAPE GOLD SEAL)    */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'sertifikat' && (
        <div className="max-w-[1000px] mx-auto bg-[#FDFBF7] rounded-2xl border-4 border-[#C88A1E] shadow-2xl overflow-hidden print:border-none print:shadow-none print:rounded-none relative">
          {/* Ornamen Sudut Sertifikat */}
          <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-[#C88A1E]"></div>
          <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-[#C88A1E]"></div>
          <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-[#C88A1E]"></div>
          <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-[#C88A1E]"></div>

          <div className="p-8 sm:p-14 min-h-[620px] flex flex-col justify-between text-center relative z-10">
            {/* Header Sertifikat */}
            <div>
              <div className="flex items-center justify-center gap-3 mb-2">
                <HaraLogo size="md" />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#C88A1E]">
                PT HARA CHICKEN INDONESIA
              </h3>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider mt-0.5">
                Divisi People Development & Operational Excellence • Sertifikasi Mutu QSR
              </p>

              <div className="my-6">
                <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-[#96171B] uppercase">
                  SERTIFIKAT KELULUSAN & KEAHLIAN
                </h1>
                <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-[#C88A1E] to-transparent mx-auto mt-2"></div>
                <p className="text-xs text-stone-500 mt-2 font-mono">
                  No. Registrasi: CERT-HARA/{new Date().getFullYear()}/{targetKru.kode_outlet}/{targetKru.id.substring(0, 6).toUpperCase()}
                </p>
              </div>

              {/* Identitas Kru */}
              <div className="space-y-2">
                <p className="text-xs text-stone-600 italic">Diberikan dengan hormat kepada:</p>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-wide font-serif">
                  {targetKru.nama_kru}
                </div>
                <p className="text-xs font-bold text-stone-700">
                  NIK: <span className="font-mono text-stone-900">{targetKru.id}</span> • Divisi Operasional: <span className="text-[#96171B] font-black">{targetKru.divisi}</span>
                </p>
                <p className="text-xs text-stone-600 max-w-xl mx-auto leading-relaxed pt-2">
                  Ditempatkan di gerai <strong>{currentOutletObj.nama_outlet} ({currentOutletObj.kode_outlet})</strong> dan dinyatakan telah berhasil menyelesaikan seluruh rangkaian pengujian standar baku mutu QSR HARA Chicken dengan predikat:
                </p>

                {/* Grade Badge */}
                <div className="pt-2">
                  <span className="inline-block px-5 py-2 rounded-xl bg-gradient-to-r from-[#C88A1E] to-[#B37714] text-white text-base font-black tracking-wider uppercase shadow-md border border-amber-300/40">
                    GRADE A • KOMPETEN MANDIRI (SKOR: {targetSummary.skorAkhir || 88}/100)
                  </span>
                </div>
              </div>
            </div>

            {/* Footer & Tanda Tangan Sertifikat */}
            <div className="pt-8 grid grid-cols-3 gap-6 items-end text-xs">
              <div className="text-center">
                <p className="text-[10px] text-stone-500 font-bold uppercase">Kepala Outlet Penempatan</p>
                <div className="h-14 flex items-center justify-center font-serif italic text-stone-800 font-bold text-sm">
                  {currentOutletObj.kepala_outlet}
                </div>
                <div className="w-36 h-px bg-stone-300 mx-auto"></div>
                <p className="text-[11px] font-bold text-stone-800 mt-1">{currentOutletObj.kepala_outlet}</p>
                <p className="text-[9px] text-stone-400">Head of Store</p>
              </div>

              {/* Segel Emas Tengah */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-[#C88A1E] bg-gradient-to-br from-amber-100 to-amber-200 flex flex-col items-center justify-center text-center shadow-inner">
                  <Award size={22} className="text-[#96171B]" />
                  <span className="text-[7px] font-black uppercase text-[#96171B] tracking-tighter mt-0.5">
                    HARA SECURE
                  </span>
                </div>
                <p className="text-[9px] font-mono text-stone-500 mt-1">Verified Authenticity</p>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-stone-500 font-bold uppercase">Lead Trainer People Development</p>
                <div className="h-14 flex items-center justify-center font-serif italic text-stone-800 font-bold text-sm">
                  Haikal Abi, S.T.
                </div>
                <div className="w-36 h-px bg-stone-300 mx-auto"></div>
                <p className="text-[11px] font-bold text-stone-800 mt-1">Haikal Abi, S.T.</p>
                <p className="text-[9px] text-stone-400">Lead Operations Trainer</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
