import React, { useState, useMemo } from 'react';
import {
  Printer, ArrowLeft, Download, Share2, Copy, Check, FileText,
  ShieldCheck, Award, AlertTriangle, Clock, Calendar, Store,
  User, CheckCircle2, ChevronRight, Filter, TrendingUp, Layers,
  Compass, BarChart3, Users, Flame, Utensils, Zap, HelpCircle,
  Building2, Sparkles, BookOpen, AlertCircle, Star, ThumbsUp,
  MessageSquare, Edit3, Plus, ChevronDown
} from 'lucide-react';
import { db } from '../../lib/storage';
import { OfficialAuditReport, Outlet } from '../../types';
import { HaraLogo } from '../HaraLogo';

interface OfficialRaporKinerjaOutletProps {
  selectedOutletCode?: string;
  onBack?: () => void;
  onOpenAuditForm?: () => void;
}

export const OfficialRaporKinerjaOutlet: React.FC<OfficialRaporKinerjaOutletProps> = ({
  selectedOutletCode = 'HC-BTL01',
  onBack,
  onOpenAuditForm,
}) => {
  const [activePage, setActivePage] = useState<number | 'ALL'>('ALL');
  const [copiedSummary, setCopiedSummary] = useState(false);

  const audits = db.getTable<OfficialAuditReport>('official_audits');
  const outlets = db.getTable<Outlet>('outlets');

  const [currentOutletCode, setCurrentOutletCode] = useState<string>(
    selectedOutletCode === 'ALL' || !selectedOutletCode ? (outlets[0]?.kode_outlet || 'HC-BTL01') : selectedOutletCode
  );

  // Active Audit Document
  const currentAudit: OfficialAuditReport = useMemo(() => {
    const found = audits.find((a) => a.kode_outlet === currentOutletCode);
    if (found) return found;
    // Fallback to first available audit
    return audits[0] || ({} as OfficialAuditReport);
  }, [audits, currentOutletCode]);

  const targetOutlet = useMemo(() => {
    return outlets.find((o) => o.kode_outlet === currentOutletCode) || outlets[0];
  }, [outlets, currentOutletCode]);

  const handlePrint = () => {
    setActivePage('ALL');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleCopySummary = () => {
    if (!currentAudit.nomor_dokumen) return;
    const text = `*RAPOR KINERJA OUTLET RESMI HARA CHICKEN*\n` +
      `No. Dokumen: ${currentAudit.nomor_dokumen}\n` +
      `Outlet: ${currentAudit.nama_outlet} (${currentAudit.kode_outlet})\n` +
      `Periode Audit: ${currentAudit.periode_audit}\n` +
      `Nilai Akhir: ${currentAudit.nilai_akhir_komposit} / 100 (${currentAudit.grade_mutu})\n` +
      `Peringkat: Ranking ${currentAudit.ranking_gerai} dari ${currentAudit.total_gerai_komparasi} outlet (Trend: +${currentAudit.trend_poin_bulan_lalu} poin)\n` +
      `Rincian 5 Pilar:\n` +
      `- Service (25): ${currentAudit.pilar_service?.skor_didapat} / 25 (${currentAudit.pilar_service?.capaian_persen}%)\n` +
      `- Kualitas (20): ${currentAudit.pilar_kualitas?.skor_didapat} / 20 (${currentAudit.pilar_kualitas?.capaian_persen}%)\n` +
      `- Kebersihan (20): ${currentAudit.pilar_kebersihan?.skor_didapat} / 20 (${currentAudit.pilar_kebersihan?.capaian_persen}%)\n` +
      `- Leadership (20): ${currentAudit.pilar_leadership?.skor_didapat} / 20 (${currentAudit.pilar_leadership?.capaian_persen}%)\n` +
      `- Kepuasan CS (15): ${currentAudit.kepuasan_pelanggan?.skor_bobot_didapat} / 15 (${currentAudit.kepuasan_pelanggan?.capaian_persen}%)\n` +
      `Lead Auditor: ${currentAudit.auditor_lead}\n` +
      `Status: ${currentAudit.status_audit}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Helper render for Checklist Table
  const renderChecklistSection = (
    title: string,
    subCat: {
      kode: string;
      nama: string;
      total_butir: number;
      terpenuhi_butir: number;
      persentase: number;
      catatan_temuan?: string;
      items: { id: string; nomor: number; pernyataan: string; terpenuhi: boolean; catatan?: string }[];
    }
  ) => {
    if (!subCat) return null;
    return (
      <div className="mb-5 border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#8B1418] text-white flex items-center justify-center font-bold text-xs">
              {subCat.kode}
            </span>
            <span className="font-bold text-stone-900 text-xs sm:text-sm">
              {subCat.nama}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">
              Kepatuhan: <strong className="text-stone-800">{subCat.terpenuhi_butir} dari {subCat.total_butir} Butir</strong>
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
              subCat.persentase >= 90 ? 'bg-emerald-100 text-emerald-800' :
              subCat.persentase >= 75 ? 'bg-amber-100 text-amber-800' :
              'bg-red-100 text-red-800'
            }`}>
              {subCat.persentase}%
            </span>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-100/70 text-stone-600 border-b border-stone-200 font-semibold text-[11px]">
              <th className="py-2 px-3 w-10 text-center">No</th>
              <th className="py-2 px-3">Indikator Standar Operasional / Butir Audit</th>
              <th className="py-2 px-3 w-28 text-center">Status</th>
              <th className="py-2 px-3 w-56">Catatan Temuan Lapangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {subCat.items.map((item) => (
              <tr key={item.id} className={item.terpenuhi ? 'hover:bg-stone-50/50' : 'bg-red-50/40 hover:bg-red-50/70'}>
                <td className="py-2 px-3 text-center text-stone-500 font-mono">{item.nomor}</td>
                <td className="py-2 px-3 text-stone-800 font-medium leading-relaxed">
                  {item.pernyataan}
                </td>
                <td className="py-2 px-3 text-center">
                  {item.terpenuhi ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                      <CheckCircle2 size={12} className="text-emerald-600" />
                      Sesuai
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200">
                      <AlertTriangle size={12} className="text-red-600" />
                      Temuan
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 text-stone-500 text-[11px]">
                  {item.catatan || (item.terpenuhi ? <span className="text-stone-300 italic">- Memenuhi SOP -</span> : <span className="text-red-500 font-medium">Perlu tindakan koreksi</span>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Official Document Sheet Container
  const PageSheet = ({
    pageNumber,
    title,
    subtitle,
    children,
  }: {
    pageNumber: number;
    title: string;
    subtitle: string;
    children: React.ReactNode;
  }) => {
    if (activePage !== 'ALL' && activePage !== pageNumber) return null;

    return (
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm print:border-none print:shadow-none print:rounded-none mb-8 print:mb-0 print:break-after-page overflow-hidden">
        {/* Printable Page Frame (A4 Aspect Ratio Ready) */}
        <div className="p-6 sm:p-10 min-h-[1100px] flex flex-col justify-between">
          <div>
            {/* Sheet Header */}
            <div className="border-b-2 border-[#8B1418] pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <HaraLogo variant="color" size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#8B1418] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                      STANDAR RESMI AUDIT QSR
                    </span>
                    <span className="text-stone-400 text-xs font-mono">{currentAudit.nomor_dokumen || 'RKO-HARA/2026/08'}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight mt-0.5">
                    {title}
                  </h2>
                  <p className="text-xs text-stone-500">
                    {subtitle} • Outlet: <strong>{currentAudit.nama_outlet}</strong> ({currentAudit.kode_outlet})
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-[11px] font-bold text-stone-700">
                  Periode: <span className="text-[#8B1418]">{currentAudit.periode_audit}</span>
                </div>
                <div className="text-[10px] text-stone-400">
                  Halaman {pageNumber} dari 10 Lembar
                </div>
              </div>
            </div>

            {/* Sheet Content */}
            <div className="sheet-body space-y-4">
              {children}
            </div>
          </div>

          {/* Sheet Footer */}
          <div className="pt-6 mt-8 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400 font-mono">
            <div>HARA CHICKEN RESTO SYSTEM • AUDIT STANDARDS V2.6</div>
            <div>DOKUMEN RAHASIA INTERNAL • HALAMAN {pageNumber} DARI 10</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in">
      {/* ========================================================================= */}
      {/* TOP CONTROL BAR (HIDDEN IN PRINT) */}
      {/* ========================================================================= */}
      <div className="print:hidden space-y-4">
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
                <span className="text-[10px] font-black uppercase tracking-widest bg-red-100 text-[#8B1418] border border-red-200 px-2 py-0.5 rounded font-mono">
                  RAPOR RESMI 10 HALAMAN HARA
                </span>
                <span className="text-xs text-stone-400 font-medium">Berdasarkan Dokumen Acuan PDF</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                Rapor Kinerja Outlet (Audit Komprehensif)
              </h1>
              <p className="text-xs text-stone-500">
                Laporan evaluasi komprehensif 5 pilar (Service, Kualitas, Kebersihan, Leadership, Kepuasan CS) 100 poin berformat 10 halaman A4 resmi.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenAuditForm && (
              <button
                type="button"
                onClick={onOpenAuditForm}
                className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              >
                <Edit3 size={14} />
                <span>Input / Edit Audit</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
            >
              {copiedSummary ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedSummary ? 'Tersalin!' : 'Salin Ringkasan'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-[#8B1418] hover:bg-[#720e12] text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-red-900/15 active:scale-98"
            >
              <Printer size={15} />
              <span>Cetak / Simpan PDF (10 Hal A4)</span>
            </button>
          </div>
        </div>

        {/* Outlet & Page Selector */}
        <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-xs font-bold text-stone-600 shrink-0">Pilih Outlet:</span>
            <select
              value={currentOutletCode}
              onChange={(e) => setCurrentOutletCode(e.target.value)}
              className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-hidden focus:border-[#8B1418] shadow-2xs"
            >
              {outlets.map((o) => (
                <option key={o.kode_outlet} value={o.kode_outlet}>
                  {o.nama_outlet} ({o.kode_outlet})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Page Jump Tabs */}
          <div className="flex flex-wrap items-center gap-1 text-xs overflow-x-auto w-full md:w-auto">
            <span className="text-stone-400 text-[11px] font-bold mr-1 shrink-0">Halaman:</span>
            <button
              type="button"
              onClick={() => setActivePage('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                activePage === 'ALL'
                  ? 'bg-[#8B1418] text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              Semua (1-10)
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePage(p)}
                className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center cursor-pointer transition-colors ${
                  activePage === p
                    ? 'bg-[#8B1418] text-white shadow-xs'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HALAMAN 1: COVER RINGKASAN EKSEKUTIF & DASHBOARD RAPOR                     */}
      {/* ========================================================================= */}
      {(activePage === 'ALL' || activePage === 1) && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm print:border-none print:shadow-none print:rounded-none mb-8 print:mb-0 print:break-after-page overflow-hidden">
          <div className="p-6 sm:p-10 min-h-[1100px] flex flex-col justify-between">
            <div>
              {/* Header Banner Melengkung Merah Gelap Khas PDF */}
              <div className="relative bg-gradient-to-r from-[#7a0f12] via-[#8B1418] to-[#590a0c] text-white rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden shadow-lg border border-red-950/20">
                {/* Decorative background curve */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-15 hidden sm:block pointer-events-none">
                  <HaraLogo variant="white" size="lg" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-red-200 mb-2 border border-white/10">
                      OFFICIAL PERFORMANCE REPORT • QSR HARA CHICKEN
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
                      RAPOR KINERJA OUTLET
                    </h1>
                    <p className="text-red-100 text-sm mt-1 max-w-xl font-medium">
                      Evaluasi Standar Kualitas, Pelayanan, Kebersihan, Leadership & Kepuasan Pelanggan Periode Audit Resmi
                    </p>
                  </div>

                  <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-right shrink-0">
                    <div className="text-[10px] uppercase font-bold text-red-200">PERIODE AUDIT</div>
                    <div className="text-xl font-black text-white">{currentAudit.periode_audit}</div>
                    <div className="text-[10px] text-red-200 font-mono mt-0.5">Tanggal: {currentAudit.tanggal_audit}</div>
                  </div>
                </div>

                {/* Outlet Detail Strip */}
                <div className="relative z-10 mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">NAMA OUTLET</div>
                    <div className="text-white font-black text-sm">{currentAudit.nama_outlet}</div>
                    <div className="text-red-200 text-[10px] font-mono">{currentAudit.kode_outlet}</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">KEPALA OUTLET</div>
                    <div className="text-white font-bold">{currentAudit.kepala_outlet}</div>
                    <div className="text-red-200 text-[10px]">Store Manager</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">AREA SUPERVISOR</div>
                    <div className="text-white font-bold">{currentAudit.area_supervisor}</div>
                    <div className="text-red-200 text-[10px]">Wilayah Operasional</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">LEAD AUDITOR</div>
                    <div className="text-white font-bold">{currentAudit.auditor_lead}</div>
                    <div className="text-red-200 text-[10px]">Operational Trainer</div>
                  </div>
                </div>
              </div>

              {/* Big Score Box & Rank Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* Nilai Akhir Komposit */}
                <div className="bg-stone-50 p-6 rounded-2xl border-2 border-stone-200 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      NILAI AKHIR KOMPOSIT
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-5xl font-black text-[#8B1418] tracking-tight">
                        {currentAudit.nilai_akhir_komposit}
                      </span>
                      <span className="text-stone-400 font-bold text-lg">/ 100</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-200">
                    <div className="text-xs font-bold text-stone-800">
                      Grade: <span className="text-emerald-700 font-black">{currentAudit.grade_mutu}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Status: <strong className="text-emerald-700">{currentAudit.status_audit}</strong>
                    </div>
                  </div>
                </div>

                {/* Ranking Outlet */}
                <div className="bg-stone-50 p-6 rounded-2xl border-2 border-stone-200 flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      PERINGKAT CABANG NASIONAL
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-5xl font-black text-amber-600 tracking-tight">
                        #{currentAudit.ranking_gerai}
                      </span>
                      <span className="text-stone-500 font-semibold text-sm">
                        dari {currentAudit.total_gerai_komparasi} Outlet
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                    <span className="text-xs text-stone-600 font-medium">Tren Nilai vs Audit Lalu:</span>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <TrendingUp size={13} />
                      +{currentAudit.trend_poin_bulan_lalu} Poin
                    </span>
                  </div>
                </div>

                {/* Quick Summary Pill */}
                <div className="bg-gradient-to-br from-red-50 to-stone-100 p-6 rounded-2xl border border-red-200 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8B1418] flex items-center gap-1.5">
                      <Sparkles size={14} />
                      KESIMPULAN AUDIT
                    </div>
                    <p className="text-xs text-stone-700 mt-2 font-medium leading-relaxed">
                      Outlet berhasil mempertahankan konsistensi resep dan mutu produk 100%. Fokus perbaikan utama ada pada stasiun perakitan sambal saat jam rush.
                    </p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-200/60 text-[11px] text-stone-500">
                    Dokumen ini disahkan resmi oleh Divisi Operational Training HARA.
                  </div>
                </div>
              </div>

              {/* Tabel Rincian 5 Pilar Utama */}
              <div className="mb-8">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Layers size={16} className="text-[#8B1418]" />
                  RINCIAN BOBOT & PENCAPAIAN 5 PILAR STANDAR AUDIT
                </h3>

                <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                        <th className="py-3 px-4">No</th>
                        <th className="py-3 px-4">Pilar Penilaian Mutu Resto</th>
                        <th className="py-3 px-4 text-center">Bobot Maksimal</th>
                        <th className="py-3 px-4 text-center">Skor Didapat</th>
                        <th className="py-3 px-4 text-center">Pencapaian %</th>
                        <th className="py-3 px-4 text-center">Kategori</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      <tr>
                        <td className="py-3 px-4 text-stone-500 text-center font-mono">1</td>
                        <td className="py-3 px-4 font-bold text-stone-900">
                          Service & Pelayanan Konsumen
                          <div className="text-[11px] text-stone-500 font-normal">Keramahtamahan, Etika, Kecepatan, Handle Komplain, Upselling</div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-stone-700">25.0 Poin</td>
                        <td className="py-3 px-4 text-center font-black text-[#8B1418]">{currentAudit.pilar_service?.skor_didapat} Poin</td>
                        <td className="py-3 px-4 text-center font-bold text-stone-800">{currentAudit.pilar_service?.capaian_persen}%</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {currentAudit.pilar_service?.kategori_mutu}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-stone-500 text-center font-mono">2</td>
                        <td className="py-3 px-4 font-bold text-stone-900">
                          Kualitas Produk & Pemeliharaan Alat
                          <div className="text-[11px] text-stone-500 font-normal">Standar Produk, Tekstur, FIFO Bahan, Suhu Chiller/Freezer, Alat Dapur, Bangunan</div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-stone-700">20.0 Poin</td>
                        <td className="py-3 px-4 text-center font-black text-[#8B1418]">{currentAudit.pilar_kualitas?.skor_didapat} Poin</td>
                        <td className="py-3 px-4 text-center font-bold text-stone-800">{currentAudit.pilar_kualitas?.capaian_persen}%</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {currentAudit.pilar_kualitas?.kategori_mutu}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-stone-500 text-center font-mono">3</td>
                        <td className="py-3 px-4 font-bold text-stone-900">
                          Kebersihan, Sanitasi & 5S Restoran
                          <div className="text-[11px] text-stone-500 font-normal">Area Customer, Kasir & Geprek, Toilet, Mushola, Dapur & Stasiun Cuci</div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-stone-700">20.0 Poin</td>
                        <td className="py-3 px-4 text-center font-black text-[#8B1418]">{currentAudit.pilar_kebersihan?.skor_didapat} Poin</td>
                        <td className="py-3 px-4 text-center font-bold text-stone-800">{currentAudit.pilar_kebersihan?.capaian_persen}%</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {currentAudit.pilar_kebersihan?.kategori_mutu}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-stone-500 text-center font-mono">4</td>
                        <td className="py-3 px-4 font-bold text-stone-900">
                          Leadership Kepala Outlet & Supervisor
                          <div className="text-[11px] text-stone-500 font-normal">Dampak Pengaruh, Kesadaran Organisasi, Roster Rapi, Coaching Kru</div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-stone-700">20.0 Poin</td>
                        <td className="py-3 px-4 text-center font-black text-[#8B1418]">{currentAudit.pilar_leadership?.skor_didapat} Poin</td>
                        <td className="py-3 px-4 text-center font-bold text-stone-800">{currentAudit.pilar_leadership?.capaian_persen}%</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {currentAudit.pilar_leadership?.kategori_mutu}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-stone-500 text-center font-mono">5</td>
                        <td className="py-3 px-4 font-bold text-stone-900">
                          Kepuasan Pelanggan & Online Presence
                          <div className="text-[11px] text-stone-500 font-normal">Agregasi Rating GoFood, Grab, Shopee, Google Maps & Matriks Komplain</div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-stone-700">15.0 Poin</td>
                        <td className="py-3 px-4 text-center font-black text-[#8B1418]">{currentAudit.kepuasan_pelanggan?.skor_bobot_didapat} Poin</td>
                        <td className="py-3 px-4 text-center font-bold text-stone-800">{currentAudit.kepuasan_pelanggan?.capaian_persen}%</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Baik
                          </span>
                        </td>
                      </tr>
                      {/* Total Bar */}
                      <tr className="bg-red-50/80 font-black text-stone-900 border-t-2 border-red-200">
                        <td colSpan={2} className="py-3.5 px-4 text-right uppercase tracking-wider text-xs">
                          TOTAL SKOR KOMPOSIT AKHIR OUTLET:
                        </td>
                        <td className="py-3.5 px-4 text-center text-stone-700 font-bold">100.0 Poin</td>
                        <td className="py-3.5 px-4 text-center text-lg text-[#8B1418]">
                          {currentAudit.nilai_akhir_komposit} Poin
                        </td>
                        <td className="py-3.5 px-4 text-center text-emerald-800">
                          {currentAudit.nilai_akhir_komposit}%
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-3 py-1 rounded bg-[#8B1418] text-white text-xs font-black shadow-xs">
                            {currentAudit.grade_mutu}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dua Kolom: Rating Online & Matriks Komplain */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Platform Online Rating */}
                <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/60">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    RATING ONLINE MULTI-PLATFORM
                  </h4>
                  <div className="space-y-2.5">
                    {currentAudit.kepuasan_pelanggan?.platform_ratings.map((p) => (
                      <div key={p.platform} className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-800 text-xs">{p.platform}</span>
                          <span className="text-[10px] text-stone-400">({p.total_ulasan.toLocaleString()} ulasan)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-600 flex items-center gap-1">
                            <Star size={11} className="fill-amber-500 text-amber-500" />
                            {p.rating.toFixed(1)}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            {p.ulasan_positif_pct}% Positif
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rekap Komplain Konsumen */}
                <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/60">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-[#8B1418]" />
                    MATRIKS KOMPLAIN KONSUMEN BULAN INI
                  </h4>
                  <div className="space-y-2 text-xs">
                    {currentAudit.kepuasan_pelanggan?.rekap_komplain.map((k) => (
                      <div key={k.kategori_keluhan} className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                            k.kategori_keluhan === 'Berat' ? 'bg-red-100 text-red-800' :
                            k.kategori_keluhan === 'Sedang' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            Tingkat {k.kategori_keluhan} ({k.jumlah_kasus} Kasus)
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700">
                            {k.terselesaikan_kasus} / {k.jumlah_kasus} Selesai Langsung
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 line-clamp-1">
                          Kasus: {k.contoh_kasus_terakhir}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="pt-4 mt-6 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400 font-mono">
              <div>RAPOR KINERJA OUTLET RESMI HARA • HALAMAN 1 DARI 10</div>
              <div>ID DOKUMEN: {currentAudit.nomor_dokumen}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HALAMAN 2: PILAR SERVICE (SUB A & SUB B)                                   */}
      {/* ========================================================================= */}
      <PageSheet
        pageNumber={2}
        title="PILAR 1: SERVICE & PELAYANAN KONSUMEN (BAGIAN 1)"
        subtitle="Rincian Checklist Butir Sub-Kategori A & B • Standar Keramahtamahan & Etika Kru"
      >
        <div className="bg-red-50/50 p-4 rounded-xl border border-red-200/60 mb-5 flex items-center justify-between">
          <div className="text-xs text-stone-700">
            <strong>Subtotal Pilar Service:</strong> Bobot Maksimal 25 Poin • Skor Aktual Outlet: <strong>{currentAudit.pilar_service?.skor_didapat} Poin ({currentAudit.pilar_service?.capaian_persen}%)</strong>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Grade: {currentAudit.pilar_service?.kategori_mutu}
          </span>
        </div>

        {renderChecklistSection('Sub A', currentAudit.pilar_service?.sub_kategori[0])}
        {renderChecklistSection('Sub B', currentAudit.pilar_service?.sub_kategori[1])}
      </PageSheet>

      {/* ========================================================================= */}
      {/* HALAMAN 3: PILAR SERVICE (SUB C, D, E)                                     */}
      {/* ========================================================================= */}
      <PageSheet
        pageNumber={3}
        title="PILAR 1: SERVICE & PELAYANAN KONSUMEN (BAGIAN 2)"
        subtitle="Rincian Checklist Butir Sub-Kategori C, D & E • Kecepatan Waktu, Handling Komplain & Upselling"
      >
        {renderChecklistSection('Sub C', currentAudit.pilar_service?.sub_kategori[2])}
        {renderChecklistSection('Sub D', currentAudit.pilar_service?.sub_kategori[3])}
        {renderChecklistSection('Sub E', currentAudit.pilar_service?.sub_kategori[4])}
      </PageSheet>

      {/* ========================================================================= */}
      {/* HALAMAN 4: PILAR KUALITAS (SUB A, B, C, D)                                 */}
      {/* ========================================================================= */}
      <PageSheet
        pageNumber={4}
        title="PILAR 2: KUALITAS PRODUK & PACKAGING (BAGIAN 1)"
        subtitle="Rincian Checklist Butir Sub-Kategori A, B, C & D • Standar Suhu, Tampilan, Tekstur & Kemasan"
      >
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 mb-5 flex items-center justify-between">
          <div className="text-xs text-stone-700">
            <strong>Subtotal Pilar Kualitas:</strong> Bobot Maksimal 20 Poin • Skor Aktual Outlet: <strong>{currentAudit.pilar_kualitas?.skor_didapat} Poin ({currentAudit.pilar_kualitas?.capaian_persen}%)</strong>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Grade: {currentAudit.pilar_kualitas?.kategori_mutu}
          </span>
        </div>

        {renderChecklistSection('Sub A', currentAudit.pilar_kualitas?.sub_kategori[0])}
        {renderChecklistSection('Sub B', currentAudit.pilar_kualitas?.sub_kategori[1])}
        {renderChecklistSection('Sub C', currentAudit.pilar_kualitas?.sub_kategori[2])}
        {renderChecklistSection('Sub D', currentAudit.pilar_kualitas?.sub_kategori[3])}
      </PageSheet>

      {/* ========================================================================= */}
      {/* HALAMAN 5: PILAR KUALITAS (SUB E, F, G)                                     */}
      {/* ========================================================================= */}
      <PageSheet
        pageNumber={5}
        title="PILAR 2: BAHAN BAKU, FIFO & CHILLER/FREEZER (BAGIAN 2)"
        subtitle="Rincian Checklist Butir Sub-Kategori E, F & G • Logistik Terima, Rotasi FIFO & Suhu Pendingin"
      >
        {renderChecklistSection('Sub E', currentAudit.pilar_kualitas?.sub_kategori[4])}
        {renderChecklistSection('Sub F', currentAudit.pilar_kualitas?.sub_kategori[5])}
        {renderChecklistSection('Sub G', currentAudit.pilar_kualitas?.sub_kategori[6])}
      </PageSheet>

      {/* ========================================================================= */}
      {/* HALAMAN 6: PILAR KUALITAS (SUB H, I)                                       */}
      {/* ========================================================================= */}
      <PageSheet
        pageNumber={6}
        title="PILAR 2: PEMELIHARAAN ALAT DAPUR & MESIN POS (BAGIAN 3)"
        subtitle="Rincian Checklist Butir Sub-Kategori H & I • Deep Fryer, Warmer, Chopper & Mesin Kasir"
      >
        {renderChecklistSection('Sub H', currentAudit.pilar_kualitas?.sub_kategori[7])}
        {renderChecklistSection('Sub I', currentAudit.pilar_kualitas?.sub_kategori[8])}
      </PageSheet>

      {/* ========================================================================= */}
      {/* HALAMAN 7: PILAR KUALITAS (SUB J, K)                                       */}
      {/* ========================================================================= */}
      <PageSheet
        pageNumber={7}
        title="PILAR 2: BANGUNAN, FASILITAS & FASAD BRANDING (BAGIAN 4)"
        subtitle="Rincian Checklist Butir Sub-Kategori J & K • Fasilitas Dining, AC, Fasad & Plang Menu"
      >
        {renderChecklistSection('Sub J', currentAudit.pilar_kualitas?.sub_kategori[9])}
        {renderChecklistSection('Sub K', currentAudit.pilar_kualitas?.sub_kategori[10])}
      </PageSheet>

      {/* ========================================================================= */}
      {/* HALAMAN 8: PILAR KEBERSIHAN (SUB A, B, C)                                  */}
      {/* ========================================================================= */}
      <PageSheet
        pageNumber={8}
        title="PILAR 3: KEBERSIHAN, SANITASI & 5S (BAGIAN 1)"
        subtitle="Rincian Checklist Butir Sub-Kategori A, B & C • Area Depan, Customer Dining & Kasir Geprek"
      >
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60 mb-5 flex items-center justify-between">
          <div className="text-xs text-stone-700">
            <strong>Subtotal Pilar Kebersihan:</strong> Bobot Maksimal 20 Poin • Skor Aktual Outlet: <strong>{currentAudit.pilar_kebersihan?.skor_didapat} Poin ({currentAudit.pilar_kebersihan?.capaian_persen}%)</strong>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Grade: {currentAudit.pilar_kebersihan?.kategori_mutu}
          </span>
        </div>

        {renderChecklistSection('Sub A', currentAudit.pilar_kebersihan?.sub_kategori[0])}
        {renderChecklistSection('Sub B', currentAudit.pilar_kebersihan?.sub_kategori[1])}
        {renderChecklistSection('Sub C', currentAudit.pilar_kebersihan?.sub_kategori[2])}
      </PageSheet>

      {/* ========================================================================= */}
      {/* HALAMAN 9: PILAR KEBERSIHAN (SUB D, E, F)                                  */}
      {/* ========================================================================= */}
      <PageSheet
        pageNumber={9}
        title="PILAR 3: KEBERSIHAN TOILET, MUSHOLA & DAPUR (BAGIAN 2)"
        subtitle="Rincian Checklist Butir Sub-Kategori D, E & F • Toilet Kering, Mushola Harum & Stasiun Cuci Kitchen"
      >
        {renderChecklistSection('Sub D', currentAudit.pilar_kebersihan?.sub_kategori[3])}
        {renderChecklistSection('Sub E', currentAudit.pilar_kebersihan?.sub_kategori[4])}
        {renderChecklistSection('Sub F', currentAudit.pilar_kebersihan?.sub_kategori[5])}
      </PageSheet>

      {/* ========================================================================= */}
      {/* HALAMAN 10: LEADERSHIP & PENGESAHAN LEGALITAS AUDIT                        */}
      {/* ========================================================================= */}
      <PageSheet
        pageNumber={10}
        title="PILAR 4: LEADERSHIP KEPALA OUTLET & PENGESAHAN RESMI"
        subtitle="Rincian Checklist Butir Leadership & Lembar Tanda Tangan Auditor, Manager & SPV"
      >
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/60 mb-5 flex items-center justify-between">
          <div className="text-xs text-stone-700">
            <strong>Subtotal Pilar Leadership:</strong> Bobot Maksimal 20 Poin • Skor Aktual Outlet: <strong>{currentAudit.pilar_leadership?.skor_didapat} Poin ({currentAudit.pilar_leadership?.capaian_persen}%)</strong>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Grade: {currentAudit.pilar_leadership?.kategori_mutu}
          </span>
        </div>

        {renderChecklistSection('Sub A', currentAudit.pilar_leadership?.sub_kategori[0])}
        {renderChecklistSection('Sub B', currentAudit.pilar_leadership?.sub_kategori[1])}
        {renderChecklistSection('Sub C', currentAudit.pilar_leadership?.sub_kategori[2])}

        {/* Ringkasan Temuan & Rekomendasi Tindakan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Kekuatan Utama Operasional Outlet
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-700 list-disc list-inside">
              {currentAudit.kekuatan_utama?.map((k, idx) => (
                <li key={idx} className="leading-relaxed">{k}</li>
              ))}
            </ul>
          </div>

          <div className="border border-stone-200 rounded-xl p-4 bg-red-50/40">
            <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-red-600" />
              Rekomendasi Tindak Lanjut Perbaikan
            </h4>
            <ul className="space-y-1.5 text-xs text-red-900 list-disc list-inside">
              {currentAudit.rekomendasi_tindakan?.map((r, idx) => (
                <li key={idx} className="leading-relaxed">{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lembar Tanda Tangan Resmi Pengesahan Audit */}
        <div className="mt-8 pt-6 border-t-2 border-stone-300">
          <div className="text-center text-xs font-bold text-stone-800 uppercase tracking-wider mb-6">
            PENGESAHAN HASIL AUDIT KINERJA OUTLET RESMI
          </div>

          <div className="grid grid-cols-3 gap-6 text-center text-xs">
            {/* Auditor */}
            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px]">
              <div>
                <div className="text-[10px] text-stone-400 font-bold uppercase">DILAKUKAN OLEH</div>
                <div className="font-bold text-stone-900 mt-1">Lead Auditor & Trainer</div>
              </div>
              <div className="my-4">
                <div className="font-script text-stone-400 italic text-sm">~ {currentAudit.tanda_tangan?.auditor} ~</div>
              </div>
              <div className="border-t border-stone-300 pt-1.5">
                <strong className="text-stone-900 block">{currentAudit.tanda_tangan?.auditor}</strong>
                <span className="text-[10px] text-stone-500">{currentAudit.tanda_tangan?.auditor_jabatan}</span>
              </div>
            </div>

            {/* Kepala Outlet */}
            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px]">
              <div>
                <div className="text-[10px] text-stone-400 font-bold uppercase">DIKETAHUI & DISETUJUI</div>
                <div className="font-bold text-stone-900 mt-1">Kepala Outlet / Store Manager</div>
              </div>
              <div className="my-4">
                <div className="font-script text-stone-400 italic text-sm">~ {currentAudit.tanda_tangan?.store_manager} ~</div>
              </div>
              <div className="border-t border-stone-300 pt-1.5">
                <strong className="text-stone-900 block">{currentAudit.tanda_tangan?.store_manager}</strong>
                <span className="text-[10px] text-stone-500">Store Manager {currentAudit.nama_outlet}</span>
              </div>
            </div>

            {/* Area Manager */}
            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px]">
              <div>
                <div className="text-[10px] text-stone-400 font-bold uppercase">DIVERIFIKASI HQ</div>
                <div className="font-bold text-stone-900 mt-1">Area Supervisor / Manager</div>
              </div>
              <div className="my-4">
                <div className="font-script text-stone-400 italic text-sm">~ {currentAudit.tanda_tangan?.area_manager} ~</div>
              </div>
              <div className="border-t border-stone-300 pt-1.5">
                <strong className="text-stone-900 block">{currentAudit.tanda_tangan?.area_manager}</strong>
                <span className="text-[10px] text-stone-500">Area Operations Manager</span>
              </div>
            </div>
          </div>
        </div>
      </PageSheet>
    </div>
  );
};
