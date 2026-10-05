import React, { useState, useMemo } from 'react';
import {
  Printer, ArrowLeft, Download, Share2, Copy, Check, FileText,
  ShieldCheck, Award, AlertTriangle, Clock, Calendar, Store,
  User, CheckCircle2, ChevronRight, Filter, TrendingUp, Layers,
  DollarSign, Sparkles, Building2, Wrench, Package, Flame,
  TrendingDown, CheckSquare, Briefcase, ChevronDown
} from 'lucide-react';
import { db } from '../../lib/storage';
import { LaporanTrainerKeuanganAtasan, Outlet } from '../../types';
import { HaraLogo } from '../HaraLogo';

interface LaporanTrainerKeuanganViewProps {
  selectedOutletCode?: string;
  onBack?: () => void;
}

export const LaporanTrainerKeuanganView: React.FC<LaporanTrainerKeuanganViewProps> = ({
  selectedOutletCode = 'HC-BTL01',
  onBack,
}) => {
  const financialReports = db.getTable<LaporanTrainerKeuanganAtasan>('trainer_financial_reports');
  const outlets = db.getTable<Outlet>('outlets');

  const [currentOutletCode, setCurrentOutletCode] = useState<string>(
    selectedOutletCode === 'ALL' || !selectedOutletCode ? (outlets[0]?.kode_outlet || 'HC-BTL01') : selectedOutletCode
  );
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Active Report
  const currentReport: LaporanTrainerKeuanganAtasan = useMemo(() => {
    const found = financialReports.find((r) => r.kode_outlet === currentOutletCode);
    if (found) return found;
    return financialReports[0] || ({} as LaporanTrainerKeuanganAtasan);
  }, [financialReports, currentOutletCode]);

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCopySummary = () => {
    if (!currentReport.nomor_laporan) return;
    const text = `*LAPORAN PERTANGGUNGJAWABAN & REKOMENDASI KEUANGAN TRAINER*\n` +
      `No. Dokumen: ${currentReport.nomor_laporan}\n` +
      `Kepada: ${currentReport.penerima_laporan}\n` +
      `Trainer: ${currentReport.trainer_nama} (${currentReport.jabatan_trainer})\n` +
      `Gerai: ${currentReport.nama_outlet} (${currentReport.kode_outlet})\n` +
      `Periode: ${currentReport.periode_penugasan}\n` +
      `Total Estimasi Penghematan Riil: ${formatRupiah(currentReport.total_potensi_efisiensi_rp)} / bulan\n\n` +
      `*Ringkasan Tindakan yang Telah Dilakukan:*\n` +
      currentReport.tindakan_dilakukan.map((t, i) => `${i + 1}. [${t.kategori}] ${t.hasil_langsung}`).join('\n') +
      `\n\n*Rekomendasi Utama ke Atasan:*\n` +
      currentReport.rekomendasi_manajemen.map((r, i) => `${i + 1}. [${r.prioritas}] ${r.usulan_solusi} (Est: ${r.estimasi_biaya_rp ? formatRupiah(r.estimasi_biaya_rp) : '-'})`).join('\n') +
      `\n\nDiterbitkan oleh HARA Operations Training.`;

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
                <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                  LAPORAN TRAINER KE ATASAN
                </span>
                <span className="text-xs text-stone-400 font-medium">Tindakan Lapangan, Analisis Keuangan & Rekomendasi</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                Laporan Pertanggungjawaban & Rekomendasi Finansial
              </h1>
              <p className="text-xs text-stone-500">
                Format laporan profesional Lead Trainer kepada Manajemen Direksi / Owner mencakup intervensi riil, efisiensi rupiah, dan usulan investasi.
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

        {/* Gerai Selector */}
        <div className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200 flex items-center gap-3">
          <span className="text-xs font-bold text-stone-600 shrink-0">Pilih Gerai Evaluasi:</span>
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
      </div>

      {/* ========================================================================= */}
      {/* PRINTABLE FORMAL EXECUTIVE REPORT                                         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm print:border-none print:shadow-none print:rounded-none overflow-hidden">
        <div className="p-6 sm:p-10 min-h-[1100px] flex flex-col justify-between">
          <div>
            {/* Kop Resmi Surat Laporan Trainer ke Atasan */}
            <div className="border-b-2 border-[#8B1418] pb-5 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <HaraLogo variant="color" size="md" />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#8B1418]">
                      HARA CHICKEN RESTO • DIVISI OPERATIONAL TRAINING & PEOPLE DEVELOPMENT
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
                      LAPORAN PERTANGGUNGJAWABAN & REKOMENDASI MANAJEMEN
                    </h2>
                    <p className="text-xs text-stone-500 font-medium">
                      Evaluasi Intervensi Lapangan, Audit Biaya Bahan Baku, & Rekomendasi Strategis Atasan
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase font-bold text-stone-400">NOMOR DOKUMEN</div>
                  <div className="text-sm font-black font-mono text-stone-900">{currentReport.nomor_laporan}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">Tanggal: {currentReport.tanggal_penyusunan}</div>
                </div>
              </div>

              {/* Memo Info Bar */}
              <div className="mt-5 pt-4 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-stone-50/80 p-4 rounded-xl border border-stone-200/60">
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">KEPADA YTH:</div>
                  <div className="font-black text-stone-900">{currentReport.penerima_laporan}</div>
                  <div className="text-[10px] text-stone-500">Kantor Pusat HARA</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">DARI TRAINER:</div>
                  <div className="font-bold text-stone-900">{currentReport.trainer_nama}</div>
                  <div className="text-[10px] text-stone-500">{currentReport.jabatan_trainer}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">OUTLET INTERVENSI:</div>
                  <div className="font-bold text-stone-900">{currentReport.nama_outlet}</div>
                  <div className="text-[10px] text-stone-500">{currentReport.kode_outlet}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-stone-400">PERIODE PENUGASAN:</div>
                  <div className="font-bold text-stone-900">{currentReport.periode_penugasan}</div>
                  <div className="text-[10px] text-emerald-700 font-bold">Status: {currentReport.status_laporan}</div>
                </div>
              </div>
            </div>

            {/* Big Financial Highlight Card */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-7 mb-8 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-emerald-200 mb-2">
                    <DollarSign size={13} />
                    TOTAL ESTIMASI POTENSI EFISIENSI FINANSIAL
                  </div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    {formatRupiah(currentReport.total_potensi_efisiensi_rp)}
                    <span className="text-emerald-200 font-bold text-sm ml-2">/ Bulan</span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-1 max-w-xl font-medium">
                    Didapat dari efisiensi perputaran minyak goreng, reduksi tepung bumbu terbuang, standarisasi takaran cabai geprek, dan kenaikan omset upselling kru kasir.
                  </p>
                </div>

                <div className="bg-black/25 backdrop-blur-md p-4 rounded-xl border border-white/15 text-xs shrink-0 space-y-1.5 min-w-[200px]">
                  <div className="text-[10px] uppercase font-bold text-emerald-300">METRIK FOOD WASTE REDUCTION</div>
                  <div className="flex items-center justify-between text-white">
                    <span>Sisa Tepung:</span>
                    <strong className="text-emerald-300">4.5kg → 1.2kg/hari</strong>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span>Oil Turnover:</span>
                    <strong className="text-emerald-300">3 hari → 5 hari</strong>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span>Loss Potong Ayam:</span>
                    <strong className="text-emerald-300">0 Potong (Nol Waste)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* BAGIAN 1: TINDAKAN INTERVENSI YANG SUDAH DILAKUKAN DI LAPANGAN            */}
            {/* ========================================================================= */}
            <div className="mb-8">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckSquare size={16} className="text-[#8B1418]" />
                BAGIAN 1: REKAP TINDAKAN & INTERVENSI YANG SUDAH DILAKUKAN DI LAPANGAN
              </h3>

              <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <th className="py-2.5 px-3 w-10 text-center">No</th>
                      <th className="py-2.5 px-3 w-40">Kategori Intervensi</th>
                      <th className="py-2.5 px-3">Rincian Tindakan di Lapangan</th>
                      <th className="py-2.5 px-3 w-56">Hasil & Dampak Langsung</th>
                      <th className="py-2.5 px-3 w-32 text-center">Waktu Eksekusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {currentReport.tindakan_dilakukan?.map((t, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-3 text-center text-stone-500 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-900 border border-red-200">
                            {t.kategori}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-800 leading-relaxed font-semibold">
                          {t.rincian}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-800 font-bold bg-emerald-50/30">
                          {t.hasil_langsung}
                        </td>
                        <td className="py-2.5 px-3 text-center text-stone-500 text-[11px] font-mono">
                          {t.tanggal_eksekusi}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* BAGIAN 2: ANALISIS DEVIASE KEUANGAN & EFISIENSI BIAYA OPERASIONAL         */}
            {/* ========================================================================= */}
            <div className="mb-8">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-700" />
                BAGIAN 2: ANALISIS KEUANGAN & EFISIENSI PENGGUNAAN BAHAN BAKU RESTORAN
              </h3>

              <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <th className="py-2.5 px-3">Komponen Bahan / Biaya</th>
                      <th className="py-2.5 px-3">Kondisi Sebelum Intervensi</th>
                      <th className="py-2.5 px-3">Tindakan Koreksi Trainer</th>
                      <th className="py-2.5 px-3">Kondisi Pasca Perbaikan</th>
                      <th className="py-2.5 px-3 text-right">Estimasi Penghematan / Bln</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {currentReport.efisiensi_finansial?.map((e, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-3 font-bold text-stone-900">
                          {e.item}
                          <div className="text-[10px] text-stone-400 font-normal">{e.keterangan}</div>
                        </td>
                        <td className="py-2.5 px-3 text-red-700 text-[11px] leading-relaxed">
                          {e.kondisi_sebelum}
                        </td>
                        <td className="py-2.5 px-3 text-stone-700 text-[11px] leading-relaxed">
                          {e.tindakan_trainer}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-800 text-[11px] font-semibold leading-relaxed">
                          {e.kondisi_setelah}
                        </td>
                        <td className="py-2.5 px-3 text-right font-black text-emerald-700 text-xs">
                          {formatRupiah(e.penghematan_bulanan_est_rp)}
                        </td>
                      </tr>
                    ))}
                    {/* Subtotal Bar */}
                    <tr className="bg-emerald-50 font-black text-stone-900 border-t-2 border-emerald-300">
                      <td colSpan={4} className="py-3 px-3 text-right uppercase tracking-wider text-xs">
                        TOTAL ESTIMASI EFISIENSI FINANSIAL GERAI / BULAN:
                      </td>
                      <td className="py-3 px-3 text-right text-sm text-emerald-800 font-black">
                        {formatRupiah(currentReport.total_potensi_efisiensi_rp)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* BAGIAN 3: REKOMENDASI STRATEGIS KEPADA ATASAN & OWNER                    */}
            {/* ========================================================================= */}
            <div className="mb-8">
              <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-600" />
                BAGIAN 3: USULAN REKOMENDASI STRATEGIS KEPADA ATASAN & MANAJEMEN HQ
              </h3>

              <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                      <th className="py-2.5 px-3 w-28 text-center">Prioritas</th>
                      <th className="py-2.5 px-3 w-40">Bidang Usulan</th>
                      <th className="py-2.5 px-3">Rincian Usulan Solusi & Tindak Lanjut</th>
                      <th className="py-2.5 px-3 w-32 text-right">Estimasi Biaya</th>
                      <th className="py-2.5 px-3 w-56">Dampak Terhadap Omset & Operasional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {currentReport.rekomendasi_manajemen?.map((r, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.prioritas.includes('P1') ? 'bg-red-100 text-red-800 border border-red-200' :
                            r.prioritas.includes('P2') ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {r.prioritas}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-stone-900">
                          {r.bidang}
                        </td>
                        <td className="py-2.5 px-3 text-stone-800 leading-relaxed font-semibold">
                          {r.usulan_solusi}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-700">
                          {r.estimasi_biaya_rp ? formatRupiah(r.estimasi_biaya_rp) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600 text-[11px] leading-relaxed">
                          {r.dampak_terhadap_omset_ops}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catatan Penutup Trainer */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-8 text-xs text-stone-700 leading-relaxed">
              <strong className="text-stone-900 block mb-1">Catatan Penutup Lead Trainer:</strong>
              {currentReport.catatan_penutup_trainer}
            </div>

            {/* Pengesahan Lembar Laporan Trainer & Atasan */}
            <div className="pt-6 border-t-2 border-stone-300">
              <div className="grid grid-cols-2 gap-8 text-center text-xs">
                {/* Trainer */}
                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px]">
                  <div>
                    <div className="text-[10px] text-stone-400 font-bold uppercase">PENYUSUN LAPORAN</div>
                    <div className="font-bold text-stone-900 mt-1">Lead Operational Trainer</div>
                  </div>
                  <div className="my-3">
                    <div className="font-script text-stone-400 italic text-sm">~ {currentReport.trainer_nama} ~</div>
                  </div>
                  <div className="border-t border-stone-300 pt-1.5">
                    <strong className="text-stone-900 block">{currentReport.trainer_nama}</strong>
                    <span className="text-[10px] text-stone-500">{currentReport.jabatan_trainer}</span>
                  </div>
                </div>

                {/* Atasan / Direksi HQ */}
                <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col justify-between min-h-[140px]">
                  <div>
                    <div className="text-[10px] text-stone-400 font-bold uppercase">MENGETAHUI & MENYETUJUI</div>
                    <div className="font-bold text-stone-900 mt-1">Direktur Operasional / Owner HQ</div>
                  </div>
                  <div className="my-3">
                    <div className="font-script text-stone-400 italic text-sm">~ Manajemen Eksekutif ~</div>
                  </div>
                  <div className="border-t border-stone-300 pt-1.5">
                    <strong className="text-stone-900 block">{currentReport.penerima_laporan}</strong>
                    <span className="text-[10px] text-stone-500">Kantor Pusat HARA Chicken</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Print */}
          <div className="pt-4 mt-6 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400 font-mono">
            <div>LAPORAN TRAINER KE ATASAN • HARA GROUP</div>
            <div>DOKUMEN RESMI MANAJEMEN EKSEKUTIF • {currentReport.nomor_laporan}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
