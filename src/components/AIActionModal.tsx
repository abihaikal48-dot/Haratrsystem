import React, { useState, useEffect } from 'react';
import {
  Sparkles, X, CheckCircle2, RefreshCw, Calendar, ArrowRight,
  BookOpen, Target, Clock, Wrench, Shield, Copy, Check, MessageSquare
} from 'lucide-react';
import { generateAITrainingPlan, askTrainerAssistant } from '../lib/gemini';
import { db } from '../lib/storage';

export type AIActionType = 'tna_to_training' | 'gap_solution' | 'keluhan_action' | 'coaching_grow' | 'observasi_followup';

export interface AIActionModalData {
  type: AIActionType;
  row: any;
  title: string;
}

interface AIActionModalProps {
  data: AIActionModalData | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onOpenAdvisorWithPrompt?: (prompt: string) => void;
}

export const AIActionModal: React.FC<AIActionModalProps> = ({
  data,
  onClose,
  onSuccess,
  onOpenAdvisorWithPrompt,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    if (!data) {
      setResult(null);
      return;
    }
    executeAIAction();
  }, [data]);

  if (!data) return null;

  const executeAIAction = async () => {
    setLoading(true);
    setResult(null);

    try {
      if (data.type === 'tna_to_training') {
        const plan = await generateAITrainingPlan(
          data.row.deskripsi_gap || 'Kesenjangan standar kompetensi operasional',
          data.row.divisi || 'Operasional',
          data.row.kode_outlet || 'Semua Outlet'
        );
        setResult({
          type: 'training_plan',
          topik: plan.topik,
          tujuan: plan.tujuan,
          metode: plan.metode,
          durasi: plan.durasi,
          alatBantu: plan.alatBantu,
          rencanaLangkah: plan.rencanaLangkah || [],
          fasilitator: 'Lead Trainer Operasional Lapangan',
          tanggal: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          targetOutlet: data.row.kode_outlet,
          targetDivisi: data.row.divisi,
        });
      } else if (data.type === 'gap_solution') {
        const prompt = `Berikan rekomendasi solusi spesifik untuk kru "${data.row.nama_kru}" (Divisi ${data.row.divisi}, Outlet ${data.row.kode_outlet}) yang memiliki gap pada "${data.row.kompetensi_dinilai}" (Target: ${data.row.skor_standar}, Aktual: ${data.row.skor_aktual}). Berikan 3 langkah perbaikan konkrit.`;
        const text = await askTrainerAssistant(prompt);
        setResult({
          type: 'text_recommendation',
          text,
          targetField: 'rekomendasi',
        });
      } else if (data.type === 'keluhan_action') {
        const prompt = `Analisis keluhan pelanggan di outlet ${data.row.kode_outlet}: "${data.row.deskripsi_keluhan}" (Kategori: ${data.row.tipe}, Kru: ${data.row.nama_kru_terkait || 'Tim Shift'}). Berikan analisis akar masalah dan rencana tindak lanjut pelatihan preventif agar tidak terulang.`;
        const text = await askTrainerAssistant(prompt);
        setResult({
          type: 'text_recommendation',
          text,
          targetField: 'tindak_lanjut_training',
        });
      } else if (data.type === 'coaching_grow') {
        const prompt = `Rancang skenario coaching GROW untuk kru "${data.row.nama_kru}" di Outlet ${data.row.kode_outlet} dengan target: "${data.row.goal || 'Peningkatan standar kepatuhan'}". Berikan usulan Options (Pilihan tindakan) dan Will (Komitmen spesifik).`;
        const text = await askTrainerAssistant(prompt);
        setResult({
          type: 'text_recommendation',
          text,
        });
      } else if (data.type === 'observasi_followup') {
        const prompt = `Berdasarkan observasi shift kru "${data.row.nama_kru}" (${data.row.divisi}) pada SOP "${data.row.standar_sop_diamati}" dengan hasil "${data.row.hasil}" dan catatan: "${data.row.catatan_detail || '-'}", berikan rencana follow-up pembinaan 1 minggu.`;
        const text = await askTrainerAssistant(prompt);
        setResult({
          type: 'text_recommendation',
          text,
          targetField: 'rencana_follow_up',
        });
      }
    } catch (err: any) {
      console.error('AI Action Execution Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDatabase = () => {
    if (!result) return;

    if (data.type === 'tna_to_training' && result.type === 'training_plan') {
      // 1. Insert to rencana_training
      db.insertRow('rencana_training', {
        kode_outlet: result.targetOutlet || data.row.kode_outlet,
        topik: result.topik,
        tujuan_pembelajaran: result.tujuan,
        peserta: `Kru Divisi ${result.targetDivisi || data.row.divisi} (${result.targetOutlet || data.row.kode_outlet})`,
        metode: result.metode,
        durasi: result.durasi,
        alat_bantu: result.alatBantu,
        fasilitator: result.fasilitator,
        tanggal_pelaksanaan: result.tanggal,
        status: 'Direncanakan',
      });

      // 2. Update TNA status
      db.updateRow('tna', data.row.id, {
        status: 'Proses',
        rencana_tindak_lanjut: `[AI Plan] ${result.topik} (${result.durasi}) - ${result.metode}`,
      });

      onSuccess(`Rencana Pelatihan "${result.topik}" berhasil dibuat & disimpan ke database!`);
      onClose();
    } else if (data.type === 'gap_solution' && result.text) {
      db.updateRow('gap_analysis', data.row.id, {
        rekomendasi: result.text,
      });
      onSuccess('Rekomendasi solusi berhasil diperbarui pada entri Gap Analysis!');
      onClose();
    } else if (data.type === 'keluhan_action' && result.text) {
      db.updateRow('kartu_keluhan', data.row.id, {
        tindak_lanjut_training: result.text,
      });
      onSuccess('Tindak lanjut pelatihan berhasil disimpan pada Kartu Keluhan!');
      onClose();
    } else if (data.type === 'observasi_followup' && result.text) {
      db.updateRow('observasi_lapangan', data.row.id, {
        rencana_follow_up: result.text,
      });
      onSuccess('Rencana follow-up berhasil disimpan pada Observasi Lapangan!');
      onClose();
    }
  };

  const handleCopy = () => {
    if (!result) return;
    let textToCopy = '';
    if (result.type === 'training_plan') {
      textToCopy = `TOPIK: ${result.topik}\nTUJUAN: ${result.tujuan}\nMETODE: ${result.metode}\nDURASI: ${result.durasi}\nALAT BANTU: ${result.alatBantu}\nLANGKAH:\n${(result.rencanaLangkah || []).map((l: string, idx: number) => `${idx + 1}. ${l}`).join('\n')}`;
    } else {
      textToCopy = result.text || '';
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-6 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-xl overflow-hidden border border-[#E6E1DA]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 md:px-6 bg-[#181411] text-white flex items-center justify-between shrink-0 border-b border-[#2A2420]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#96171B] flex items-center justify-center text-white">
              <Sparkles size={16} strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-bold text-sm md:text-base flex items-center gap-2 font-['Outfit']">
                <span>{data.title}</span>
                <span className="text-[9.5px] bg-[#FAF8F5] text-[#181411] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider font-['JetBrains_Mono']">
                  AI Generator
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                Penyusunan otomatis berbasis standar Trainer Operasional Hara Chicken
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>

        {/* Source Data Context Banner */}
        <div className="bg-slate-50 border-b border-[#E2E0D8] px-4 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-700 truncate">
            <span className="font-bold text-slate-900">Entri Sumber:</span>
            <span className="truncate bg-white px-2 py-0.5 rounded-md border border-[#E2E0D8] font-medium text-slate-800">
              {data.row.deskripsi_gap || data.row.kompetensi_dinilai || data.row.deskripsi_keluhan || data.row.goal || data.row.standar_sop_diamati || 'Data Entri'}
            </span>
            {data.row.kode_outlet && (
              <span className="bg-red-50 text-[#A21D21] font-black px-1.5 py-0.5 rounded border border-red-200 shrink-0 text-[10px]">
                {data.row.kode_outlet}
              </span>
            )}
          </div>

          <button
            onClick={executeAIAction}
            disabled={loading}
            className="btn-secondary-enterprise !py-1 !px-2 text-[11px] shrink-0"
            title="Generate Ulang"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin text-[#A21D21]' : ''} />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA] flex items-center justify-center text-[#96171B] shadow-sm transition-all duration-300">
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-800">
                  AI sedang menyusun kurikulum & solusi...
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Menyelaraskan SOP operasional, takaran bumbu, titik kritis dapur, dan rubrik kompetensi.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#A21D21] font-bold mt-2">
                <RefreshCw size={13} className="animate-spin" />
                <span>Memproses rekomendasi presisi...</span>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-4 animate-in fade-in">
              {result.type === 'training_plan' ? (
                <div className="space-y-3">
                  {/* Topik & Tujuan */}
                  <div className="bg-gradient-to-br from-amber-50/60 to-red-50/40 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#A21D21] bg-red-100/70 px-2 py-0.5 rounded-md">
                          Rekomendasi Modul Pelatihan
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-1">
                          {result.topik}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-white border border-[#E2E0D8] text-[11px] font-extrabold text-slate-700 flex items-center gap-1 shadow-2xs shrink-0">
                        <Clock size={12} className="text-[#D9A027]" />
                        <span>{result.durasi}</span>
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium">
                      <b className="text-slate-900">Tujuan Pembelajaran:</b> {result.tujuan}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-[#E2E0D8]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Metode Pelatihan
                      </span>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Target size={14} className="text-[#A21D21]" />
                        <span>{result.metode}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-[#E2E0D8]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Alat Bantu & Bahan Praktik
                      </span>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Wrench size={14} className="text-[#D9A027]" />
                        <span>{result.alatBantu}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rencana Langkah */}
                  {result.rencanaLangkah && result.rencanaLangkah.length > 0 && (
                    <div className="p-3.5 bg-white rounded-xl border border-[#E2E0D8] space-y-2">
                      <span className="text-[11px] font-extrabold text-slate-900 flex items-center gap-1.5">
                        <BookOpen size={14} className="text-[#A21D21]" />
                        <span>Rincian Tahapan Pelaksanaan Sesi:</span>
                      </span>
                      <div className="space-y-1.5 pl-1">
                        {result.rencanaLangkah.map((step: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-[#A21D21] font-black text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                              {idx + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Text recommendation format */
                <div className="bg-[#FCFAF7] p-4 rounded-2xl border border-[#E2E0D8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-black text-[#A21D21] uppercase tracking-wider flex items-center gap-1.5">
                      <Shield size={13} />
                      <span>Rekomendasi Tindakan Terverifikasi</span>
                    </span>
                    <button
                      onClick={handleCopy}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
                    >
                      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
                    {result.text}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Tidak ada data hasil. Silakan klik tombol "Regenerate".
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 md:p-4 bg-slate-50 border-t border-[#E2E0D8] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <button
            onClick={handleCopy}
            disabled={loading || !result}
            className="btn-secondary-enterprise !py-1.5 !px-3 text-xs w-full sm:w-auto"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Teks Tersalin!' : 'Salin Hasil'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="btn-secondary-enterprise !py-1.5 !px-3 text-xs flex-1 sm:flex-initial"
            >
              Tutup
            </button>

            <button
              onClick={handleSaveToDatabase}
              disabled={loading || !result}
              className="btn-primary-enterprise !py-1.5 !px-4 text-xs flex-1 sm:flex-initial"
            >
              <CheckCircle2 size={14} />
              <span>Simpan ke Database</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
