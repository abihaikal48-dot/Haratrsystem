import React, { useState, useMemo } from 'react';
import {
  Printer, ArrowLeft, Download, Share2, Copy, Check, FileText,
  ShieldCheck, Award, AlertTriangle, Clock, Calendar, Store,
  User, CheckCircle2, ChevronRight, Filter, TrendingUp, Layers,
  Compass, BarChart3, Users, Flame, Utensils, Zap, HelpCircle,
  Building2, Sparkles, BookOpen, AlertCircle, Star, ThumbsUp,
  Medal, Target, Activity, CheckSquare, XCircle, ChevronDown
} from 'lucide-react';
import { db } from '../../lib/storage';
import { Kru, Outlet } from '../../types';
import { HaraLogo } from '../HaraLogo';
import { buildDynamicOfficialCrewReport } from '../../lib/analyticsEngine';
import { CrewRadarChart } from '../analytics/CrewRadarChart';
import { generateCrewRaporPDF } from '../../lib/pdfGenerator';

interface OfficialRaporKruProps {
  selectedCrewName?: string;
  selectedOutletCode?: string;
  onBack?: () => void;
}

export const OfficialRaporKruView: React.FC<OfficialRaporKruProps> = ({
  selectedCrewName = '',
  selectedOutletCode = '',
  onBack,
}) => {
  const allKru = db.getTable<Kru>('kru');
  const outlets = db.getTable<Outlet>('outlets');

  const [currentCrewName, setCurrentCrewName] = useState<string>(
    selectedCrewName || (allKru[0]?.nama_kru || 'Budi Santoso')
  );
  const [activeTabMode, setActiveTabMode] = useState<'rapor_cetak' | 'data_science_deep'>('rapor_cetak');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Dynamic Realtime Evaluation calculation using empirical data
  const dynamicEvaluation = useMemo(() => {
    return buildDynamicOfficialCrewReport(currentCrewName);
  }, [currentCrewName]);

  const { report, cohortMetrics, criticalViolationDetected, violationReason, sopStepCompliance } = dynamicEvaluation;

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleCopySummary = () => {
    if (!report.nama_kru) return;
    const text = `*RAPOR KOMPETENSI KRU RESMI HARA CHICKEN*\n` +
      `No. Dokumen: ${report.nomor_rapor}\n` +
      `Nama Kru: ${report.nama_kru} (${report.nik_kru})\n` +
      `Jabatan: ${report.jabatan} - Divisi ${report.divisi_utama}\n` +
      `Outlet: ${report.nama_outlet} (${report.kode_outlet})\n` +
      `Periode: ${report.periode_evaluasi}\n` +
      `Nilai Komprehensif: ${report.nilai_akhir_komprehensif} / 100 (${report.predikat_kelulusan})\n` +
      `Status Kelulusan: ${report.status_sertifikasi}\n` +
      `Peringkat Cabang: #${report.peringkat_cabang} dari ${report.total_kru_cabang} Kru\n` +
      `Statistik Cohort: Z-Score ${cohortMetrics.zScore} (Persentil ${cohortMetrics.percentileRank}%)\n` +
      `Rincian 4 Dimensi:\n` +
      `- Teori SOP (25%): ${report.skor_teori_sop}\n` +
      `- Praktik Lapangan (35%): ${report.skor_praktik_lapangan}\n` +
      `- Sikap H.A.R.A (20%): ${report.skor_sikap_budaya_hara}\n` +
      `- Speed Rush Hour (20%): ${report.skor_speed_rush_hour}\n` +
      `Rekomendasi Karir Objektif: ${report.jenjang_karir_rekomendasi}\n` +
      (criticalViolationDetected ? `PERINGATAN: ${violationReason}\n` : '') +
      `Trainer Penilai: ${report.trainer_penilai}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in">
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
                  RAPOR KRU OBJEKTIF & DATA SCIENCE
                </span>
                <span className="text-xs text-stone-400 font-medium">100% Acuan SOP • Anti-Halusinasi</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                Rapor Resmi Kompetensi Kru Lapangan
              </h1>
              <p className="text-xs text-stone-500">
                Penilaian empiris berbasis hasil riil teori SOP, praktik stopwatch, kurva normal Z-Score, dan rekomendasi karir terstandar.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => generateCrewRaporPDF(report)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-98 border border-amber-400/30"
              title="Unduh file PDF Vektor A4 Resmi (Bukan Screenshot Gambar)"
            >
              <Download size={15} />
              <span>Unduh PDF Resmi (A4 Standar)</span>
            </button>
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
              className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Cetak / Print</span>
            </button>
          </div>
        </div>

        {/* Kru Selector & View Mode Switcher */}
        <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-stone-600 shrink-0">Pilih Kru Restoran:</span>
            <select
              value={currentCrewName}
              onChange={(e) => setCurrentCrewName(e.target.value)}
              className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-hidden focus:border-[#8B1418] shadow-2xs w-full sm:w-auto"
            >
              {allKru.map((k) => (
                <option key={k.id} value={k.nama_kru}>
                  {k.nama_kru} • {k.divisi} ({k.kode_outlet})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTabMode('rapor_cetak')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTabMode === 'rapor_cetak'
                  ? 'bg-[#8B1418] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Lembar Cetak Rapor Resmi A4
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMode('data_science_deep')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabMode === 'data_science_deep'
                  ? 'bg-[#8B1418] text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Activity size={13} />
              <span>Analitik Data Science & Z-Score</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PERINGATAN DEVIASE / CRITICAL VIOLATION BANNER (ANTI-HALUSINASI)          */}
      {/* ========================================================================= */}
      {criticalViolationDetected && (
        <div className="bg-red-50 border-2 border-red-300 p-4 rounded-2xl flex items-start gap-3.5 text-xs text-red-900 shadow-xs">
          <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-black text-red-950 uppercase tracking-wide flex items-center gap-2">
              <span>STATUS: WAJIB RETRAINING & DILARANG BERTUGAS SOLO SHIFT</span>
              <span className="bg-red-600 text-white text-[9px] px-2 py-0.2 rounded font-bold">Kritis</span>
            </div>
            <p className="font-semibold text-red-900 leading-relaxed">
              Kru <strong>{report.nama_kru}</strong> memiliki skor di bawah ambang batas minimal kelulusan SOP (75.0) atau terdeteksi temuan deviasi mutu: <em>"{violationReason}"</em>. Sesuai regulasi mutu HARA QSR, kru ini <strong>TIDAK BISA DIREKOMENDASIKAN PROMOSI</strong> dan wajib menjalani pendampingan intensif 7 hari.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: LEMBAR CETAK RAPOR RESMI A4                                         */}
      {/* ========================================================================= */}
      {activeTabMode === 'rapor_cetak' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm print:border-none print:shadow-none print:rounded-none overflow-hidden">
          <div className="p-6 sm:p-10 min-h-[1100px] flex flex-col justify-between">
            <div>
              {/* Header Kop Merah Marun Resmi HARA */}
              <div className="relative bg-gradient-to-r from-[#7a0f12] via-[#8B1418] to-[#590a0c] text-white rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden shadow-lg border border-red-950/20">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 p-3 rounded-2xl border border-white/20 backdrop-blur-xs">
                      <HaraLogo variant="white" size="md" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-red-200">
                        LEMBAR HASIL PENILAIAN RESMI PERSONIL RESTORAN
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase mt-0.5">
                        RAPOR KOMPETENSI KRU
                      </h2>
                      <p className="text-xs text-red-100 font-medium">
                        Standar Baku Mutu QSR • Evaluasi Teori, Praktik, Budaya HARA & Uji Jam Sibuk
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-right shrink-0">
                    <div className="text-[9px] uppercase font-bold text-red-200">NOMOR RAPOR</div>
                    <div className="text-sm font-black font-mono text-white">{report.nomor_rapor}</div>
                    <div className="text-[10px] text-red-200 mt-0.5">Periode: {report.periode_evaluasi}</div>
                  </div>
                </div>

                {/* Kru Identity Grid */}
                <div className="relative z-10 mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">NAMA KRU</div>
                    <div className="text-white font-black text-sm">{report.nama_kru}</div>
                    <div className="text-red-200 text-[10px] font-mono">{report.nik_kru}</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">POSISI & DIVISI</div>
                    <div className="text-white font-bold">{report.jabatan}</div>
                    <div className="text-red-200 text-[10px]">Stasiun Utama: {report.divisi_utama}</div>
                  </div>
                  <div>
                    <div className="text-red-200 text-[10px] uppercase font-bold">CABANG PENEMPATAN</div>
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

              {/* Score & Rank Executive Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {/* Nilai Akhir Komprehensif */}
                <div className="bg-stone-50 p-5 rounded-2xl border-2 border-stone-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      NILAI AKHIR KOMPREHENSIF
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className={`text-5xl font-black tracking-tight ${
                        report.nilai_akhir_komprehensif >= 85 ? 'text-[#8B1418]' :
                        report.nilai_akhir_komprehensif >= 75 ? 'text-amber-600' : 'text-red-700'
                      }`}>
                        {report.nilai_akhir_komprehensif}
                      </span>
                      <span className="text-stone-400 font-bold text-sm">/ 100</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-200">
                    <div className="text-xs font-bold text-stone-800">
                      Predikat: <span className={
                        report.predikat_kelulusan.includes('A') ? 'text-emerald-700 font-black' :
                        report.predikat_kelulusan.includes('B') ? 'text-blue-700 font-black' : 'text-red-700 font-black'
                      }>{report.predikat_kelulusan}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Status Sertifikasi: <strong className={
                        report.status_sertifikasi === 'Tersertifikasi Penuh' ? 'text-emerald-700' :
                        report.status_sertifikasi === 'Sertifikasi Bersyarat' ? 'text-amber-700' : 'text-red-700'
                      }>{report.status_sertifikasi}</strong>
                    </div>
                  </div>
                </div>

                {/* Peringkat Cabang & Data Science */}
                <div className="bg-stone-50 p-5 rounded-2xl border-2 border-stone-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      PERINGKAT & POSISI COHORT
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-5xl font-black text-amber-600 tracking-tight">
                        #{report.peringkat_cabang}
                      </span>
                      <span className="text-stone-500 font-semibold text-xs">
                        dari {report.total_kru_cabang} Kru di Outlet
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
                    <span className="text-stone-600 font-medium">Z-Score: <strong>{cohortMetrics.zScore}</strong></span>
                    <span className="inline-flex items-center gap-1 font-bold text-stone-700 bg-stone-200 px-2 py-0.5 rounded text-[11px]">
                      Top {100 - cohortMetrics.percentileRank}%
                    </span>
                  </div>
                </div>

                {/* Rekomendasi Karir Objektif */}
                <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  report.jenjang_karir_rekomendasi === 'Retraining Wajib'
                    ? 'bg-red-50/70 border-red-200'
                    : report.jenjang_karir_rekomendasi === 'Shift Leader Trainee'
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-stone-50 border-stone-200'
                }`}>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                      <Award size={14} />
                      REKOMENDASI KARIR RESMI
                    </div>
                    <div className={`text-base font-black mt-2 ${
                      report.jenjang_karir_rekomendasi === 'Retraining Wajib' ? 'text-red-900' : 'text-stone-900'
                    }`}>
                      {report.jenjang_karir_rekomendasi}
                    </div>
                    <p className="text-[11px] text-stone-600 mt-1 font-medium leading-relaxed">
                      {report.jenjang_karir_rekomendasi === 'Retraining Wajib'
                        ? 'Wajib mengulang materi pelatihan stasiun dan dilarang solo shift.'
                        : report.jenjang_karir_rekomendasi === 'Shift Leader Trainee'
                        ? 'Memenuhi syarat promosi kepemimpinan shift outlet.'
                        : 'Memenuhi standar kerja stasiun harian di bawah supervisi.'}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-200/60 text-[10px] text-stone-500 font-mono">
                    VERIFIKASI TRAINER OPERASIONAL
                  </div>
                </div>
              </div>

              {/* 4 Pilar Dimensi Kompetensi Inti */}
              <div className="mb-8">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Target size={16} className="text-[#8B1418]" />
                  PENCAPAIAN 4 DIMENSI KOMPETENSI UTAMA (SKALA 100)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* Teori */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60">
                    <div className="text-[10px] text-stone-500 font-bold uppercase">UJI TEORI SOP (20%)</div>
                    <div className="text-2xl font-black text-stone-900 mt-1">{report.skor_teori_sop}</div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[#8B1418] h-full" style={{ width: `${report.skor_teori_sop}%` }} />
                    </div>
                    <div className={`text-[10px] font-bold mt-1.5 ${report.skor_teori_sop >= 75 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {report.skor_teori_sop >= 75 ? 'Lulus Ambang Standar' : 'Di Bawah Standar'}
                    </div>
                  </div>

                  {/* Praktik & SOS */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60">
                    <div className="text-[10px] text-stone-500 font-bold uppercase">UJI PRAKTIK & SOS (40%)</div>
                    <div className={`text-2xl font-black mt-1 ${report.skor_praktik_lapangan < 75 ? 'text-red-700' : 'text-stone-900'}`}>
                      {report.skor_praktik_lapangan}
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full ${report.skor_praktik_lapangan < 75 ? 'bg-red-600' : 'bg-amber-600'}`} style={{ width: `${report.skor_praktik_lapangan}%` }} />
                    </div>
                    <div className={`text-[10px] font-bold mt-1.5 ${report.skor_praktik_lapangan >= 75 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {report.skor_praktik_lapangan >= 75 ? 'Lulus Ambang Standar' : 'Perlu Retraining Segera'}
                    </div>
                  </div>

                  {/* Lisan HACCP */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60">
                    <div className="text-[10px] text-stone-500 font-bold uppercase">UJI LISAN HACCP (15%)</div>
                    <div className="text-2xl font-black text-stone-900 mt-1">{report.skor_lisan_haccp || 80}</div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${report.skor_lisan_haccp || 80}%` }} />
                    </div>
                    <div className="text-[10px] text-blue-700 font-bold mt-1.5">Pemahaman CCP & Why</div>
                  </div>

                  {/* Sikap & Budaya HARA */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60">
                    <div className="text-[10px] text-stone-500 font-bold uppercase">SIKAP BUDAYA H.A.R.A (25%)</div>
                    <div className="text-2xl font-black text-stone-900 mt-1">{report.skor_sikap_budaya_hara}</div>
                    <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-600 h-full" style={{ width: `${report.skor_sikap_budaya_hara}%` }} />
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold mt-1.5">12 Perilaku Utama Teruji</div>
                  </div>
                </div>
              </div>

              {/* Matriks Evaluasi 4 Stasiun Kerja */}
              <div className="mb-8">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Utensils size={16} className="text-[#8B1418]" />
                  MATRIKS KEMAMPUAN 4 STASIUN KERJA OPERASIONAL
                </h3>

                <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                        <th className="py-2.5 px-3">Stasiun Kerja</th>
                        <th className="py-2.5 px-3 text-center">SOP Resep</th>
                        <th className="py-2.5 px-3 text-center">Speed</th>
                        <th className="py-2.5 px-3 text-center">Hygiene</th>
                        <th className="py-2.5 px-3 text-center">Sikap</th>
                        <th className="py-2.5 px-3 text-center">Skor Akhir</th>
                        <th className="py-2.5 px-3 text-center">Status Kemandirian</th>
                        <th className="py-2.5 px-3">Catatan Observasi Stasiun</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium">
                      {report.evaluasi_stasiun?.map((st) => (
                        <tr key={st.stasiun} className={st.stasiun === report.divisi_utama ? 'bg-red-50/30' : 'hover:bg-stone-50/50'}>
                          <td className="py-2.5 px-3 font-bold text-stone-900">
                            {st.stasiun}
                            {st.stasiun === report.divisi_utama && (
                              <span className="ml-1.5 text-[9px] bg-[#8B1418] text-white px-1.5 py-0.5 rounded font-bold">
                                Utama
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">{st.skor_sop}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{st.skor_speed}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{st.skor_hygiene}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{st.skor_sikap}</td>
                          <td className="py-2.5 px-3 text-center font-black text-[#8B1418]">{st.skor_akhir_stasiun}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              st.status_kompetensi === 'Mahir Solo Shift'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : st.status_kompetensi === 'Kompeten Terbimbing'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {st.status_kompetensi}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-stone-600 text-[11px] max-w-xs leading-relaxed">
                            {st.catatan_stasiun}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Feedback & Rencana Aksi Diagnostik AI Terukur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Kekuatan & Aspek Unggul Kru
                  </h4>
                  <ul className="space-y-1.5 text-xs text-stone-700 list-disc list-inside">
                    {report.aspek_unggul?.map((a, idx) => (
                      <li key={idx} className="leading-relaxed">{a}</li>
                    ))}
                  </ul>
                </div>

                <div className={`p-4 rounded-xl border ${
                  criticalViolationDetected ? 'bg-red-50/60 border-red-200' : 'bg-amber-50/40 border-stone-200'
                }`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
                    criticalViolationDetected ? 'text-red-900' : 'text-amber-900'
                  }`}>
                    <Sparkles size={14} className={criticalViolationDetected ? 'text-red-600' : 'text-amber-600'} />
                    Rencana Perbaikan & Tindak Lanjut Terarah
                  </h4>
                  <ul className={`space-y-1.5 text-xs list-disc list-inside ${
                    criticalViolationDetected ? 'text-red-900' : 'text-amber-900'
                  }`}>
                    {report.rekomendasi_pengembangan?.map((r, idx) => (
                      <li key={idx} className="leading-relaxed">{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Legalitas & Tanda Tangan Rapor Kru */}
              <div className="mt-8 pt-6 border-t-2 border-stone-300">
                <div className="grid grid-cols-3 gap-6 text-center text-xs">
                  {/* Kru Ybs */}
                  <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50 flex flex-col justify-between min-h-[120px]">
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">KRU YANG DINILAI</div>
                      <div className="font-bold text-stone-900 mt-1">Personil Operasional</div>
                    </div>
                    <div className="my-2">
                      <div className="font-script text-stone-400 italic text-xs">~ {report.nama_kru} ~</div>
                    </div>
                    <div className="border-t border-stone-300 pt-1">
                      <strong className="text-stone-900 block">{report.nama_kru}</strong>
                      <span className="text-[9px] text-stone-500">{report.nik_kru}</span>
                    </div>
                  </div>

                  {/* Trainer Penilai */}
                  <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50 flex flex-col justify-between min-h-[120px]">
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">TRAINER PENILAI</div>
                      <div className="font-bold text-stone-900 mt-1">Operational Trainer</div>
                    </div>
                    <div className="my-2">
                      <div className="font-script text-stone-400 italic text-xs">~ {report.trainer_penilai} ~</div>
                    </div>
                    <div className="border-t border-stone-300 pt-1">
                      <strong className="text-stone-900 block">{report.trainer_penilai}</strong>
                      <span className="text-[9px] text-stone-500">Lead People Development</span>
                    </div>
                  </div>

                  {/* Kepala Outlet */}
                  <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/50 flex flex-col justify-between min-h-[120px]">
                    <div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase">MENGETAHUI</div>
                      <div className="font-bold text-stone-900 mt-1">Kepala Outlet</div>
                    </div>
                    <div className="my-2">
                      <div className="font-script text-stone-400 italic text-xs">~ {report.kepala_outlet} ~</div>
                    </div>
                    <div className="border-t border-stone-300 pt-1">
                      <strong className="text-stone-900 block">{report.kepala_outlet}</strong>
                      <span className="text-[9px] text-stone-500">Store Manager {report.nama_outlet}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Print */}
            <div className="pt-4 mt-6 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400 font-mono">
              <div>RAPOR KOMPETENSI KRU RESMI • HARA GROUP</div>
              <div>DOKUMEN RESMI HR & OPERATIONS • {report.nomor_rapor}</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ANALITIK DATA SCIENCE, GAUSS BELL CURVE & HEATMAP SOP               */}
      {/* ========================================================================= */}
      {activeTabMode === 'data_science_deep' && (
        <div className="space-y-6">
          {/* Card 1: Distribusi Normal Cohort (Gauss Bell Curve & Z-Score) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                  STATISTICAL COHORT BENCHMARK
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">
                  Kurva Distribusi Normal & Nilai Z-Score Standar Deviasi
                </h3>
                <p className="text-xs text-stone-500">
                  Posisi objektif kru <strong>{report.nama_kru}</strong> terhadap populasi seluruh kru ({cohortMetrics.totalCohortSize} kru aktif).
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div className="text-center">
                  <div className="text-[10px] text-stone-400 font-bold uppercase">RATA-RATA (μ)</div>
                  <div className="text-sm font-black text-stone-800">{cohortMetrics.meanScore}</div>
                </div>
                <div className="w-px h-8 bg-stone-200" />
                <div className="text-center">
                  <div className="text-[10px] text-stone-400 font-bold uppercase">STDEV (σ)</div>
                  <div className="text-sm font-black text-stone-800">{cohortMetrics.standardDeviation}</div>
                </div>
                <div className="w-px h-8 bg-stone-200" />
                <div className="text-center">
                  <div className="text-[10px] text-stone-400 font-bold uppercase">Z-SCORE</div>
                  <div className={`text-sm font-black ${cohortMetrics.zScore < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {cohortMetrics.zScore > 0 ? `+${cohortMetrics.zScore}` : cohortMetrics.zScore}
                  </div>
                </div>
                <div className="w-px h-8 bg-stone-200" />
                <div className="text-center">
                  <div className="text-[10px] text-stone-400 font-bold uppercase">PERSENTIL</div>
                  <div className="text-sm font-black text-purple-700">P{cohortMetrics.percentileRank}</div>
                </div>
              </div>
            </div>

            {/* Visual Bell Curve Diagram */}
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200/80">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 mb-2">
                <span>-3σ (Defisit)</span>
                <span>-2σ (Kurang)</span>
                <span>-1σ (Terbimbing)</span>
                <span className="text-[#8B1418]">Rata-rata Cohort ({cohortMetrics.meanScore})</span>
                <span>+1σ (Mandiri)</span>
                <span>+2σ (Mahir)</span>
                <span>+3σ (Master)</span>
              </div>

              {/* Relative Position Meter */}
              <div className="relative w-full h-8 bg-gradient-to-r from-red-200 via-amber-200 via-emerald-200 to-purple-200 rounded-xl overflow-hidden shadow-inner">
                {/* Pointer for Current Crew */}
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-slate-900 border-2 border-white rounded shadow-md transform -translate-x-1/2 transition-all duration-500"
                  style={{ left: `${cohortMetrics.percentileRank}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-stone-500">
                  Posisi Kru: <strong>{report.nama_kru}</strong> berada di <strong>Persentil {cohortMetrics.percentileRank}%</strong>
                </span>
                <span className={`font-bold ${cohortMetrics.zScore >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {cohortMetrics.zScore >= 1 ? 'Melampaui rata-rata cohort (+1σ ke atas)' :
                   cohortMetrics.zScore >= 0 ? 'Sedikit di atas rata-rata (+0σ)' :
                   'Di bawah rata-rata cohort (Wajib pendampingan)'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Heatmap Butir Kepatuhan SOP Langkah demi Langkah */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                SOP STEP-BY-STEP COMPLIANCE HEATMAP
              </span>
              <h3 className="text-lg font-black text-stone-900 mt-1">
                Matriks Kepatuhan Butir SOP Stasiun Utama ({report.divisi_utama})
              </h3>
              <p className="text-xs text-stone-500">
                Deteksi transparan pada setiap langkah prosedur kerja untuk mengidentifikasi letak kesalahan teknis.
              </p>
            </div>

            <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3">Langkah Kerja Prosedural SOP</th>
                    <th className="py-2.5 px-3 w-28 text-center">Skor / Maks</th>
                    <th className="py-2.5 px-3 w-24 text-center">Tingkat Mutu</th>
                    <th className="py-2.5 px-3 w-28 text-center">Status</th>
                    <th className="py-2.5 px-3 w-64">Catatan Detail Observasi Trainer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {sopStepCompliance.map((step) => (
                    <tr key={step.langkahNomor} className={
                      step.status === 'Kritis' ? 'bg-red-50/60' :
                      step.status === 'Perlu Perbaikan' ? 'bg-amber-50/40' : 'hover:bg-stone-50/50'
                    }>
                      <td className="py-2.5 px-3 text-center text-stone-500 font-mono">{step.langkahNomor}</td>
                      <td className="py-2.5 px-3 text-stone-900 font-bold">
                        {step.judulLangkah}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        {step.skorLangkah} / {step.skorMaksimal}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-12 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full ${
                              step.persentase >= 80 ? 'bg-emerald-600' :
                              step.persentase >= 60 ? 'bg-amber-500' : 'bg-red-600'
                            }`} style={{ width: `${step.persentase}%` }} />
                          </div>
                          <span className="text-[10px]">{step.persentase}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          step.status === 'Sesuai' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          step.status === 'Perlu Perbaikan' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {step.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 text-[11px] leading-relaxed">
                        {step.catatan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
