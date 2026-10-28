import React, { useMemo } from 'react';
import {
  FileText, CheckCircle2, AlertTriangle, Clock, Thermometer,
  Scale, ShieldCheck, Printer, Download, X, User, Store,
  Award, Sparkles, BookOpen, UtensilsCrossed
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PenilaianPraktikOnboardingProduk } from '../../types';
import { HaraLogo } from '../HaraLogo';

interface CrewOnboardingReportModalProps {
  kruNama: string;
  kodeOutlet?: string;
  batchName?: string;
  assessments: PenilaianPraktikOnboardingProduk[];
  onClose: () => void;
  onOpenCertificate?: () => void;
}

export const CrewOnboardingReportModal: React.FC<CrewOnboardingReportModalProps> = ({
  kruNama,
  kodeOutlet = 'HC-BTL01',
  batchName = 'Batch Onboarding Terpadu',
  assessments,
  onClose,
  onOpenCertificate,
}) => {
  // Filter assessments specific to this crew
  const crewRecords = useMemo(() => {
    return assessments.filter(
      (a) => a.nama_kru.toLowerCase().trim() === kruNama.toLowerCase().trim()
    );
  }, [assessments, kruNama]);

  // Day 1 vs Day 2 split
  const day1Records = useMemo(() => {
    return crewRecords.filter((a) => (a.day === 'Day 1') || (a.station?.includes('Batch') && !a.day));
  }, [crewRecords]);

  const day2Records = useMemo(() => {
    return crewRecords.filter((a) => a.day === 'Day 2');
  }, [crewRecords]);

  // Overall calculations
  const totalSesi = crewRecords.length;
  const avgSkor = totalSesi > 0
    ? Number((crewRecords.reduce((sum, r) => sum + r.skor_akhir, 0) / totalSesi).toFixed(1))
    : 0;

  const avgProsedur = totalSesi > 0
    ? Number((crewRecords.reduce((sum, r) => sum + (r.skor_prosedur ?? r.skor_langkah_sop ?? r.skor_akhir), 0) / totalSesi).toFixed(1))
    : 0;

  const avgWaktu = totalSesi > 0
    ? Number((crewRecords.reduce((sum, r) => sum + (r.skor_waktu ?? r.skor_kecepatan ?? 85), 0) / totalSesi).toFixed(1))
    : 0;

  const avgKebersihan = totalSesi > 0
    ? Number((crewRecords.reduce((sum, r) => sum + (r.skor_kebersihan ?? 90), 0) / totalSesi).toFixed(1))
    : 0;

  const avgKerjasama = totalSesi > 0
    ? Number((crewRecords.reduce((sum, r) => sum + (r.skor_kerjasama ?? 88), 0) / totalSesi).toFixed(1))
    : 0;

  const avgKnowledge = totalSesi > 0
    ? Number((crewRecords.reduce((sum, r) => sum + (r.skor_knowledge ?? 85), 0) / totalSesi).toFixed(1))
    : 0;

  const hasCriticalFail = crewRecords.some((r) => r.gagal_titik_kritis === true);
  const statusLulus = avgSkor >= 85 && !hasCriticalFail
    ? 'KOMPETEN MANDIRI'
    : avgSkor >= 80 && !hasCriticalFail
    ? 'LULUS PENDAMPINGAN'
    : 'REMEDIAL KRITIS';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col text-[#181411]"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E6E1DA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#96171B] flex items-center justify-center font-bold border border-red-100">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#181411]">Laporan Komprehensif Praktik Onboarding Kru</h3>
              <p className="text-xs text-[#645D55]">Evaluasi detail sesi produk, ketepatan teknik, waktu, kebersihan, dan sikap</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#645D55] hover:text-[#181411] hover:bg-[#FAF8F5] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Report Content */}
        <div id="printable-crew-report" className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Executive Header Box */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#FAF8F5] to-white border border-[#E6E1DA] grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#645D55] uppercase tracking-wider">Identitas Peserta</span>
              <h2 className="text-lg font-extrabold text-[#96171B]">{kruNama}</h2>
              <div className="text-[11px] text-[#645D55] flex items-center gap-2">
                <Store size={13} />
                <span>Outlet: {kodeOutlet}</span>
                <span>•</span>
                <span>{batchName}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-white border border-[#E6E1DA]">
                <span className="block text-[10px] text-[#645D55] uppercase font-bold">Total Sesi Uji</span>
                <span className="text-base font-black font-mono text-[#181411]">{totalSesi} Produk</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#E6E1DA]">
                <span className="block text-[10px] text-[#645D55] uppercase font-bold">Rata-Rata Skor</span>
                <span className="text-base font-black font-mono text-[#181411]">{avgSkor.toFixed(1)}</span>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-[#E6E1DA] sm:pl-4">
              <span className="block text-[10px] text-[#645D55] uppercase font-bold">Status Kelulusan</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold mt-1 ${
                  statusLulus === 'KOMPETEN MANDIRI'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : statusLulus === 'LULUS PENDAMPINGAN'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <CheckCircle2 size={14} />
                {statusLulus}
              </span>
              {hasCriticalFail && (
                <p className="text-[10px] text-rose-600 font-semibold mt-1">
                  *Terdapat kegagalan pada titik kritis
                </p>
              )}
            </div>
          </div>

          {/* 5 Core Evaluation Dimensions Bar */}
          <div>
            <h4 className="font-bold text-xs text-[#181411] mb-2 uppercase tracking-wider">
              Profil Capaian 5 Dimensi Penilaian Standar PDF
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-white border border-[#E6E1DA]">
                <span className="text-[10px] text-[#645D55] block">Ketepatan (30%)</span>
                <span className="text-sm font-bold font-mono text-[#181411] mt-0.5 block">{avgProsedur}</span>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-[#96171B] h-full" style={{ width: `${Math.min(100, avgProsedur)}%` }} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E6E1DA]">
                <span className="text-[10px] text-[#645D55] block">Waktu (20%)</span>
                <span className="text-sm font-bold font-mono text-[#181411] mt-0.5 block">{avgWaktu}</span>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-amber-600 h-full" style={{ width: `${Math.min(100, avgWaktu)}%` }} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E6E1DA]">
                <span className="text-[10px] text-[#645D55] block">Kebersihan (15%)</span>
                <span className="text-sm font-bold font-mono text-[#181411] mt-0.5 block">{avgKebersihan}</span>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{ width: `${Math.min(100, avgKebersihan)}%` }} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E6E1DA]">
                <span className="text-[10px] text-[#645D55] block">Kerjasama (15%)</span>
                <span className="text-sm font-bold font-mono text-[#181411] mt-0.5 block">{avgKerjasama}</span>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${Math.min(100, avgKerjasama)}%` }} />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E6E1DA]">
                <span className="text-[10px] text-[#645D55] block">Knowledge (20%)</span>
                <span className="text-sm font-bold font-mono text-[#181411] mt-0.5 block">{avgKnowledge}</span>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-purple-600 h-full" style={{ width: `${Math.min(100, avgKnowledge)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Sesi Praktik Hari ke-1 (Day 1) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E6E1DA]">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={15} className="text-[#96171B]" />
                <h4 className="font-bold text-xs text-[#181411]">
                  Praktik Hari Ke-1 (Day 1) — Batch 1 & Batch 2
                </h4>
              </div>
              <span className="text-[11px] text-[#645D55] font-mono">
                {day1Records.length} Sesi Teruji
              </span>
            </div>

            {day1Records.length === 0 ? (
              <p className="text-xs text-[#645D55] italic p-3 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]">
                Belum ada rekaman sesi uji produk Day 1 untuk peserta ini.
              </p>
            ) : (
              <div className="overflow-x-auto border border-[#E6E1DA] rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E6E1DA] text-[#645D55] text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Produk</th>
                      <th className="py-2.5 px-3">Station</th>
                      <th className="py-2.5 px-3">Durasi</th>
                      <th className="py-2.5 px-3">Suhu / Gramatur</th>
                      <th className="py-2.5 px-3">Titik Kritis</th>
                      <th className="py-2.5 px-3 text-right">Skor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1DA]">
                    {day1Records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#181411]">{r.produk_nama}</td>
                        <td className="py-2.5 px-3 text-[#645D55]">{r.station_label || r.station || '-'}</td>
                        <td className="py-2.5 px-3 font-mono">
                          {r.waktu_detik || r.durasi_detik || 0}s{' '}
                          <span className="text-[#645D55] text-[10px]">/ {r.target_detik || r.standar_durasi_detik || 0}s</span>
                        </td>
                        <td className="py-2.5 px-3">
                          {r.suhu_minyak_aktual ? `${r.suhu_minyak_aktual}°C` : r.gramatur_aktual ? `${r.gramatur_aktual}g` : '-'}
                        </td>
                        <td className="py-2.5 px-3">
                          {r.gagal_titik_kritis ? (
                            <span className="text-rose-700 font-bold flex items-center gap-1 text-[11px]">
                              <AlertTriangle size={12} /> Gagal
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 size={12} /> Sesuai
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#181411]">
                          {r.skor_akhir}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Sesi Praktik Hari ke-2 (Day 2) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#E6E1DA]">
              <div className="flex items-center gap-2">
                <UtensilsCrossed size={15} className="text-[#96171B]" />
                <h4 className="font-bold text-xs text-[#181411]">
                  Praktik Hari Ke-2 (Day 2) — Station 1, 2, 3 & All Crew
                </h4>
              </div>
              <span className="text-[11px] text-[#645D55] font-mono">
                {day2Records.length} Sesi Teruji
              </span>
            </div>

            {day2Records.length === 0 ? (
              <p className="text-xs text-[#645D55] italic p-3 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]">
                Belum ada rekaman sesi uji produk Day 2 untuk peserta ini.
              </p>
            ) : (
              <div className="overflow-x-auto border border-[#E6E1DA] rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E6E1DA] text-[#645D55] text-[10px] uppercase font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Produk</th>
                      <th className="py-2.5 px-3">Station</th>
                      <th className="py-2.5 px-3">Durasi</th>
                      <th className="py-2.5 px-3">Suhu / Gramatur</th>
                      <th className="py-2.5 px-3">Titik Kritis</th>
                      <th className="py-2.5 px-3 text-right">Skor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1DA]">
                    {day2Records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[#181411]">{r.produk_nama}</td>
                        <td className="py-2.5 px-3 text-[#645D55]">{r.station_label || r.station || '-'}</td>
                        <td className="py-2.5 px-3 font-mono">
                          {r.waktu_detik || r.durasi_detik || 0}s{' '}
                          <span className="text-[#645D55] text-[10px]">/ {r.target_detik || r.standar_durasi_detik || 0}s</span>
                        </td>
                        <td className="py-2.5 px-3">
                          {r.suhu_minyak_aktual ? `${r.suhu_minyak_aktual}°C` : r.gramatur_aktual ? `${r.gramatur_aktual}g` : '-'}
                        </td>
                        <td className="py-2.5 px-3">
                          {r.gagal_titik_kritis ? (
                            <span className="text-rose-700 font-bold flex items-center gap-1 text-[11px]">
                              <AlertTriangle size={12} /> Gagal
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 size={12} /> Sesuai
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#181411]">
                          {r.skor_akhir}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Evaluasi Sikap & Rekomendasi Trainer */}
          <div className="p-4 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] space-y-2">
            <h4 className="font-bold text-xs text-[#181411]">Evaluasi Sikap & Rekomendasi Trainer Lapangan</h4>
            <p className="text-xs text-[#645D55] leading-relaxed">
              Peserta menunjukkan pemahaman SOP yang solid, komunikasi aktif antarrekan station saat rush hour, serta kedisiplinan APD lengkap dan kebersihan meja kerja <em>clean as you go</em>.
              {hasCriticalFail ? ' Namun kru wajib mendapatkan pendampingan khusus pada station penggorengan suhu minyak.' : ' Kru siap ditugaskan secara mandiri di outlet operasional.'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E6E1DA] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            {onOpenCertificate && avgSkor >= 80 && (
              <button
                type="button"
                onClick={onOpenCertificate}
                className="px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Award size={14} className="text-emerald-600" />
                <span>Lihat Sertifikat Kru</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg border border-[#E6E1DA] hover:bg-slate-50 text-xs font-semibold text-[#181411] inline-flex items-center gap-1.5 transition-colors"
            >
              <Printer size={14} />
              <span>Cetak Laporan</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#96171B] hover:bg-[#7A1216] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
