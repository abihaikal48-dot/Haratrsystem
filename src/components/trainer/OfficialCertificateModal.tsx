import React, { useState, useEffect } from 'react';
import {
  X, Printer, Phone, Check, Edit3, Save,
  FileText, Sparkles, Award, Shield, CheckCircle2,
  Plus, Trash2, RefreshCw, Eye, ThumbsUp, AlertTriangle, Clock,
  CheckSquare, Tag, Zap, ShieldCheck, HelpCircle
} from 'lucide-react';
import { TraineeRecord, StatusOJT, Division } from '../../types';
import { OfficialDocumentHeader } from '../OfficialDocumentHeader';

interface OfficialCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainee: TraineeRecord | null;
  topicList: { judul: string; skor: number }[];
  onSaveTraineeEdit: (updatedTrainee: TraineeRecord) => void;
}

export const OfficialCertificateModal: React.FC<OfficialCertificateModalProps> = ({
  isOpen,
  onClose,
  trainee,
  topicList,
  onSaveTraineeEdit,
}) => {
  const [activeMode, setActiveMode] = useState<'view' | 'edit'>('view');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<TraineeRecord | null>(null);
  const [editableTopics, setEditableTopics] = useState<{ judul: string; skor: number }[]>([]);

  // Signatures
  const [signPD, setSignPD] = useState('Haikal Abi');
  const [signOutletPIC, setSignOutletPIC] = useState('');

  useEffect(() => {
    if (trainee) {
      setFormData(JSON.parse(JSON.stringify(trainee)));
      setSignPD(trainee.trainer_nama || 'Haikal Abi');
      setSignOutletPIC(`Penanggung Jawab Outlet ${trainee.kode_outlet}`);
      setEditableTopics(topicList && topicList.length > 0 ? JSON.parse(JSON.stringify(topicList)) : [
        { judul: `SOP Utama Divisi ${trainee.divisi}`, skor: 3 },
        { judul: 'SOP Standar Suhu, Gramasi & Higienitas', skor: 2 },
        { judul: 'SOP Pelayanan, Kecepatan & POS Kasir', skor: 2 },
      ]);
      setActiveMode('view');
    }
  }, [trainee, isOpen, topicList]);

  if (!isOpen || !trainee || !formData) return null;

  // Recalculate composite score from 4 factors
  const handleRecalculateComposite = () => {
    const t = Number(formData.skor_teori) || 85;
    const p = Number(formData.skor_praktik) || 85;
    const a = Number(formData.skor_attitude) || 85;
    const k = Number(formData.skor_ketahanan) || 85;

    const composite = Math.round((t * 0.25) + (p * 0.35) + (a * 0.25) + (k * 0.15));
    let status: StatusOJT = formData.status_ojt;
    if (composite >= 80) status = 'Lulus / Mandiri';
    else if (composite >= 68) status = 'Sedang Berjalan';
    else status = 'Perlu Pendampingan Lanjut';

    setFormData({
      ...formData,
      skor_akhir: composite,
      status_ojt: status,
    });
  };

  const handleSaveAll = () => {
    onSaveTraineeEdit(formData);
    setActiveMode('view');
  };

  const handleAddTopic = () => {
    setEditableTopics([...editableTopics, { judul: 'SOP Tambahan Baru', skor: 2 }]);
  };

  const handleDeleteTopic = (index: number) => {
    setEditableTopics(editableTopics.filter((_, i) => i !== index));
  };

  const handleUpdateTopic = (index: number, field: 'judul' | 'skor', value: any) => {
    const updated = [...editableTopics];
    updated[index] = { ...updated[index], [field]: value };
    setEditableTopics(updated);
  };

  // WhatsApp share
  const handleShareWhatsApp = () => {
    const evidenceStr = formData.alasan_diagnostik && formData.alasan_diagnostik.length > 0
      ? formData.alasan_diagnostik.map((t) => `   ✓ ${t}`).join('\n')
      : '   ✓ Menguasai parameter baku dan alur kerja SOP.';

    const text = `*📋 LAPORAN RESMI BERITA ACARA EVALUASI OBJEKTIF KRU OJT*
*HARA TRAINING & OPERATIONS*
---------------------------------------------
👤 *Nama Kru:* ${formData.nama_kru}
🏢 *Outlet:* ${formData.kode_outlet}
🧑‍🍳 *Divisi:* ${formData.divisi}
🎓 *Tipe Bimbingan:* ${formData.tipe_bimbingan}
👤 *Trainer Operasional:* ${formData.trainer_nama || 'Haikal Abi'}
📅 *Periode OJT:* ${formData.tanggal_mulai} s/d ${formData.tanggal_selesai || 'Selesai'}

*📊 HASIL EVALUASI 4 FAKTOR OBJEKTIF:*
• 📘 *Teori SOP (25%):* ${formData.skor_teori ?? 85} / 100
• 🛠️ *Praktik Jobdesk (35%):* ${formData.skor_praktik ?? 88} / 100
• 🤝 *Sikap RESPECT (25%):* ${formData.skor_attitude ?? 90} / 100
• ⚡ *Ketahanan Jam Sibuk (15%):* ${formData.skor_ketahanan ?? 85} / 100
---------------------------------------------
⭐ *TOTAL SKOR AKHIR KOMPOSIT:* *${formData.skor_akhir ?? formData.skor_awal ?? 88} / 100*
🏆 *STATUS KELULUSAN OJT:* *${formData.status_ojt.toUpperCase()}*

🔍 *DIAGNOSA AKAR MASALAH:* ${formData.akar_masalah || 'Telah konsisten dan mandiri.'}

📌 *BUKTI OBSERVASI & ALASAN LAPANGAN:*
${evidenceStr}

⚖️ *JUSTIFIKASI STATUS KELULUSAN:*
${formData.alasan_kelulusan || 'Telah memenuhi standar nilai dan bebas deviasi kritis.'}

🌟 *Kekuatan Kru:* ${formData.catatan_kekuatan || '-'}
⚠️ *Area Perbaikan:* ${formData.catatan_kelemahan || '-'}
🎯 *Action Plan:* ${formData.catatan_action_plan || '-'}

📝 *Kesimpulan Diagnostik:*
_"${formData.catatan_trainer || 'Menunjukkan kesiapan operasional mandiri sesuai standar SOP.'}"_

_Dokumen sah dikeluarkan oleh HARA DEVELOPMENT._`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const text = `BERITA ACARA EVALUASI OJT - ${formData.nama_kru} (${formData.divisi} - ${formData.kode_outlet})
Skor Akhir: ${formData.skor_akhir ?? 88}/100 [${formData.status_ojt}]
Teori: ${formData.skor_teori ?? 85} | Praktik: ${formData.skor_praktik ?? 88} | Sikap: ${formData.skor_attitude ?? 90} | Ketahanan: ${formData.skor_ketahanan ?? 85}
Akar Masalah: ${formData.akar_masalah || 'Telah Mandiri'}
Kekuatan: ${formData.catatan_kekuatan || '-'}
Perbaikan: ${formData.catatan_kelemahan || '-'}
Action Plan: ${formData.catatan_action_plan || '-'}
Trainer Operasional: ${formData.trainer_nama || 'Haikal Abi'}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const docNumber = `HD/BA-OJT/${formData.kode_outlet}/${new Date().getFullYear()}/${formData.id.slice(-4).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[96vh] my-auto print:shadow-none print:border-none print:max-w-none print:p-0 print:m-0 print:max-h-none">
        
        {/* Header Action Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-800 p-1 rounded-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveMode('view')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'view'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye size={14} className={activeMode === 'view' ? 'text-[#96171B]' : ''} />
              <span>Tampilan Berita Acara Resmi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('edit')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                activeMode === 'edit'
                  ? 'bg-[#96171B] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 size={14} />
              <span>Edit Manual Semua Data</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {activeMode === 'edit' ? (
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Save size={14} />
                <span>Simpan Perubahan</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Salin Ringkasan Teks"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <FileText size={13} />}
                  <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Phone size={13} />
                  <span>Kirim WA</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-[#FBD66A] hover:bg-amber-300 text-slate-900 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Printer size={13} />
                  <span>Cetak / PDF</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/50 print:bg-white print:p-0 print:overflow-visible">
          
          {/* ========================================================================= */}
          {/* MODE 1: OFFICIAL PRINTABLE BERITA ACARA VIEW */}
          {/* ========================================================================= */}
          {activeMode === 'view' && (
            <div className="printable-document-sheet bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 print:border-none print:shadow-none print:p-0">
              
              {/* KOP RESMI: HARA CHICKEN TRAINER OPERASIONAL */}
              <OfficialDocumentHeader
                docNumber={docNumber}
                subLabel="Standar Operasional Prosedur, Penjaminan Mutu & Pelatihan Kru"
                extraInfo="Sistem Penilaian Kompetensi & Pendampingan OJT Terpadu"
              />

              {/* Judul Dokumen Terpusat & Rapi */}
              <div className="text-center py-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                  BERITA ACARA EVALUASI KETERAMPILAN & KELULUSAN OJT KRU
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Hasil Uji Objektif 4 Dimensi: Teori SOP Baku, Praktik Jobdesk, Sikap RESPECT & Ketahanan Peak Hours
                </p>
              </div>

              {/* Grid Profil Kru */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Nama Kru / Trainee</span>
                  <span className="font-black text-slate-900 text-sm">{formData.nama_kru}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Cabang / Outlet</span>
                  <span className="font-black text-[#96171B] text-sm">{formData.kode_outlet}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Divisi Jobdesk</span>
                  <span className="font-black text-slate-900 text-sm">{formData.divisi}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Trainer Operasional</span>
                  <span className="font-bold text-slate-800">{formData.trainer_nama || 'Haikal Abi'}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Periode Pelaksanaan OJT</span>
                  <span className="font-bold text-slate-800">
                    {formData.tanggal_mulai} s/d {formData.tanggal_selesai || 'Selesai'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Status Kelulusan</span>
                  <span className={`inline-block font-black text-xs px-2.5 py-0.5 rounded-md ${
                    formData.status_ojt === 'Lulus / Mandiri'
                      ? 'bg-emerald-100 text-emerald-800'
                      : formData.status_ojt === 'Sedang Berjalan'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {formData.status_ojt}
                  </span>
                </div>
              </div>

              {/* Matriks 4 Faktor Baku */}
              <div className="space-y-2.5 print-avoid-break">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Matriks Nilai 4 Faktor Baku Objektif</span>
                  <span className="text-[10px] text-slate-500 font-bold">Bobot Komposit Terstandarisasi</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                  <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-1">
                    <div className="text-[10px] font-black text-blue-700 uppercase">1. Teori (25%)</div>
                    <div className="text-2xl font-black text-blue-900">{formData.skor_teori ?? 85}</div>
                    <div className="text-[10px] text-blue-600 font-medium">Suhu & Gramasi</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                    <div className="text-[10px] font-black text-amber-700 uppercase">2. Praktik (35%)</div>
                    <div className="text-2xl font-black text-amber-900">{formData.skor_praktik ?? 88}</div>
                    <div className="text-[10px] text-amber-600 font-medium">Jobdesk Divisi</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                    <div className="text-[10px] font-black text-emerald-700 uppercase">3. RESPECT (25%)</div>
                    <div className="text-2xl font-black text-emerald-900">{formData.skor_attitude ?? 90}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Budaya & Sikap</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-1">
                    <div className="text-[10px] font-black text-rose-700 uppercase">4. Ketahanan (15%)</div>
                    <div className="text-2xl font-black text-rose-900">{formData.skor_ketahanan ?? 85}</div>
                    <div className="text-[10px] text-rose-600 font-medium">Jam Sibuk & Stamina</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#96171B] text-white col-span-2 sm:col-span-1 space-y-1 shadow-md">
                    <div className="text-[10px] font-black text-red-200 uppercase">Skor Akhir</div>
                    <div className="text-2xl font-black text-white">
                      {formData.skor_akhir ?? formData.skor_awal ?? 88}
                    </div>
                    <div className="text-[10px] text-red-200 font-medium">/ 100 Komposit</div>
                  </div>
                </div>
              </div>

              {/* TABEL RINCIAN NILAI PER-POIN & BOBOT TRANSPARAN */}
              <div className="space-y-1.5 print-avoid-break">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Rincian Penilaian Objektif Per-Poin & Kontribusi Nilai</span>
                  <span className="text-[10px] text-slate-500 font-bold">Teruji & Bebas Asumsi</span>
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-black text-[10.5px] border-b border-slate-200">
                        <th className="p-2">Dimensi Evaluasi</th>
                        <th className="p-2">Indikator Teruji</th>
                        <th className="p-2 text-center">Bobot</th>
                        <th className="p-2 text-center">Skor Mentah</th>
                        <th className="p-2 text-center">Poin Akhir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      <tr>
                        <td className="p-2 font-bold text-blue-900 bg-blue-50/40">1. Teori Bank SOP</td>
                        <td className="p-2 text-slate-700">Penguasaan Konsep, Suhu/Gramasi & Poin Kritis SOP Divisi {formData.divisi}</td>
                        <td className="p-2 text-center font-bold text-slate-600">25%</td>
                        <td className="p-2 text-center font-bold text-blue-900">{formData.skor_teori ?? 85}/100</td>
                        <td className="p-2 text-center font-black text-blue-900">{((formData.skor_teori ?? 85) * 0.25).toFixed(1)} pt</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-amber-900 bg-amber-50/40">2. Praktik Jobdesk</td>
                        <td className="p-2 text-slate-700">Eksekusi Seluruh Topik SOP Divisi {formData.divisi} & Speed</td>
                        <td className="p-2 text-center font-bold text-slate-600">35%</td>
                        <td className="p-2 text-center font-bold text-amber-900">{formData.skor_praktik ?? 88}/100</td>
                        <td className="p-2 text-center font-black text-amber-900">{((formData.skor_praktik ?? 88) * 0.35).toFixed(1)} pt</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-emerald-900 bg-emerald-50/40">3. Sikap RESPECT</td>
                        <td className="p-2 text-slate-700">Religious, Integritas, Grooming, Efisien & Keramahan 5S</td>
                        <td className="p-2 text-center font-bold text-slate-600">25%</td>
                        <td className="p-2 text-center font-bold text-emerald-900">{formData.skor_attitude ?? 90}/100</td>
                        <td className="p-2 text-center font-black text-emerald-900">{((formData.skor_attitude ?? 90) * 0.25).toFixed(1)} pt</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-rose-900 bg-rose-50/40">4. Ketahanan Sibuk</td>
                        <td className="p-2 text-slate-700">Peak Hour 30+ Porsi, Komposur Emosi & Konsistensi Closing</td>
                        <td className="p-2 text-center font-bold text-slate-600">15%</td>
                        <td className="p-2 text-center font-bold text-rose-900">{formData.skor_ketahanan ?? 85}/100</td>
                        <td className="p-2 text-center font-black text-rose-900">{((formData.skor_ketahanan ?? 85) * 0.15).toFixed(1)} pt</td>
                      </tr>
                      <tr className="bg-slate-900 text-white font-black text-xs">
                        <td colSpan={2} className="p-2 uppercase tracking-wide">Grand Total Skor Komposit</td>
                        <td className="p-2 text-center">100%</td>
                        <td className="p-2 text-center text-slate-300">-</td>
                        <td className="p-2 text-center text-[#FBD66A] text-sm">
                          {formData.skor_akhir ?? formData.skor_awal ?? 88} / 100
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DIAGNOSA AKAR MASALAH & BUKTI OBSERVASI OBJEKTIF */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs print-avoid-break">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap size={14} className="text-purple-700" />
                    <span>Diagnosa Objektif & Temuan Bukti Lapangan</span>
                  </h4>
                  <span className="font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-md text-[10.5px]">
                    Akar Masalah: {formData.akar_masalah || 'Telah Menguasai Standar'}
                  </span>
                </div>

                {/* Evidence Tags */}
                {formData.alasan_diagnostik && formData.alasan_diagnostik.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10.5px] font-bold text-slate-600 uppercase block">
                      Bukti Perilaku Operasional yang Tervalidasi ({formData.alasan_diagnostik.length} Temuan):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.alasan_diagnostik.map((tag, i) => (
                        <span key={i} className="text-[10.5px] bg-white border border-slate-300 text-slate-800 px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1">
                          <Check size={11} className="text-emerald-700" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Uraian Bukti Observasi */}
                {formData.bukti_observasi && (
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-bold text-slate-600 uppercase block">Fakta Observasi Supervisi:</span>
                    <p className="text-slate-800 font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200 text-[11px]">
                      {formData.bukti_observasi}
                    </p>
                  </div>
                )}

                {/* Justifikasi Status Kelulusan */}
                {formData.alasan_kelulusan && (
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-bold text-slate-600 uppercase block">Justifikasi Penetapan Status OJT ({formData.status_ojt}):</span>
                    <p className="text-slate-800 font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200 text-[11px]">
                      {formData.alasan_kelulusan}
                    </p>
                  </div>
                )}
              </div>

              {/* Daftar Topik SOP yang Diuji */}
              {editableTopics.length > 0 && (
                <div className="space-y-2 print-avoid-break">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Daftar SOP Jobdesk Divisi {formData.divisi} yang Diuji</span>
                    <span className="text-[10px] font-bold text-slate-500">{editableTopics.length} Topik SOP</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {editableTopics.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-1.5">
                        <span className="text-[11px] font-bold text-slate-800 truncate">
                          {idx + 1}. {item.judul}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded shrink-0 ${
                          item.skor === 3 ? 'bg-emerald-100 text-emerald-800' :
                          item.skor === 2 ? 'bg-blue-100 text-blue-800' :
                          item.skor === 1 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.skor === 3 ? 'Sangat Mahir' : item.skor === 2 ? 'Sesuai SOP' : item.skor === 1 ? 'Koreksi' : 'Belum Sesuai'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4 Multi-section Notes */}
              <div className="space-y-3 text-xs print-avoid-break">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <div className="font-black text-emerald-900 flex items-center gap-1.5">
                    <ThumbsUp size={13} className="text-emerald-700" />
                    <span>1. Kekuatan & Kelebihan Menonjol Kru (Strengths):</span>
                  </div>
                  <p className="text-emerald-950 font-medium leading-relaxed pl-5">
                    {formData.catatan_kekuatan || 'Menguasai SOP dengan cepat, rapi, dan mematuhi standar higienitas.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1">
                  <div className="font-black text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-rose-700" />
                    <span>2. Area Perbaikan & Kelemahan Kritis (Weaknesses):</span>
                  </div>
                  <p className="text-rose-950 font-medium leading-relaxed pl-5">
                    {formData.catatan_kelemahan || 'Perlu peningkatan kecepatan taking order kasir saat rush hour.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
                  <div className="font-black text-blue-900 flex items-center gap-1.5">
                    <Clock size={13} className="text-blue-700" />
                    <span>3. Rencana Tindak Lanjut & Action Plan (Next Steps):</span>
                  </div>
                  <p className="text-blue-950 font-medium leading-relaxed pl-5">
                    {formData.catatan_action_plan || 'Diberikan tugas mandiri dengan supervisi berkala dari Penanggung Jawab Outlet.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <div className="font-black text-amber-900 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-700" />
                    <span>4. Kesimpulan Rekomendasi Trainer Operasional (Official Diagnostic):</span>
                  </div>
                  <p className="text-amber-950 font-medium italic leading-relaxed pl-5 whitespace-pre-line">
                    "{formData.catatan_trainer || 'Trainee telah menyelesaikan seluruh rangkaian evaluasi OJT dengan hasil memuaskan.'}"
                  </p>
                </div>
              </div>

              {/* Tanda Tangan 2 Pihak (Haikal Abi & Penanggung Jawab Outlet) */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-slate-200 text-center text-xs print-avoid-break">
                <div className="space-y-12">
                  <span className="text-slate-500 font-bold block">Dibuat Oleh:</span>
                  <div>
                    <div className="font-black text-slate-900 underline text-sm">{signPD}</div>
                    <div className="text-[11px] text-slate-600 font-medium mt-0.5">Trainer Operasional Cabang</div>
                    <div className="text-[9.5px] text-slate-400 font-bold">HARA TRAINING & OPERATIONS</div>
                  </div>
                </div>

                <div className="space-y-12">
                  <span className="text-slate-500 font-bold block">Diketahui & Diterima Oleh:</span>
                  <div>
                    <div className="font-black text-slate-900 underline text-sm">{signOutletPIC || `Penanggung Jawab Outlet ${formData.kode_outlet}`}</div>
                    <div className="text-[11px] text-slate-600 font-medium mt-0.5">Penanggung Jawab Cabang</div>
                    <div className="text-[9.5px] text-slate-400 font-bold">Outlet {formData.kode_outlet}</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: FORM EDIT MANUAL LENGKAP SEMUA DATA & NILAI */}
          {/* ========================================================================= */}
          {activeMode === 'edit' && (
            <div className="p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-300 space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Edit3 size={18} className="text-[#96171B]" />
                  <h3 className="text-sm font-black text-slate-900">
                    Formulir Pengeditan Manual Data Trainee & Berita Acara
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Ubah data, nilai 4 faktor, alasan & bukti observasi di bawah ini.
                </span>
              </div>

              {/* Profil Kru Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kru / Trainee</label>
                  <input
                    type="text"
                    value={formData.nama_kru}
                    onChange={(e) => setFormData({ ...formData, nama_kru: e.target.value })}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cabang / Outlet</label>
                  <input
                    type="text"
                    value={formData.kode_outlet}
                    onChange={(e) => setFormData({ ...formData, kode_outlet: e.target.value })}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Divisi Jobdesk</label>
                  <select
                    value={formData.divisi}
                    onChange={(e) => setFormData({ ...formData, divisi: e.target.value as Division })}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  >
                    <option value="Kitchen">Kitchen</option>
                    <option value="Service">Service</option>
                    <option value="Bar">Bar</option>
                    <option value="Kasir">Kasir</option>
                    <option value="Cook">Cook</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trainer Operasional</label>
                  <input
                    type="text"
                    value={formData.trainer_nama || 'Haikal Abi'}
                    onChange={(e) => setFormData({ ...formData, trainer_nama: e.target.value })}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai OJT</label>
                  <input
                    type="date"
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai OJT</label>
                  <input
                    type="date"
                    value={formData.tanggal_selesai || ''}
                    onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>
              </div>

              {/* Status & 4 Skor Matriks Form */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900">
                    Nilai 4 Faktor Baku & Status Kelulusan
                  </h4>
                  <button
                    type="button"
                    onClick={handleRecalculateComposite}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Hitung Skor Komposit Formula</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-blue-800 block mb-0.5">1. Teori (25%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.skor_teori ?? 85}
                      onChange={(e) => setFormData({ ...formData, skor_teori: Number(e.target.value) })}
                      className="w-full text-xs font-black text-blue-900 border border-blue-300 rounded-xl p-2 text-center bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-amber-800 block mb-0.5">2. Praktik (35%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.skor_praktik ?? 88}
                      onChange={(e) => setFormData({ ...formData, skor_praktik: Number(e.target.value) })}
                      className="w-full text-xs font-black text-amber-900 border border-amber-300 rounded-xl p-2 text-center bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-emerald-800 block mb-0.5">3. RESPECT (25%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.skor_attitude ?? 90}
                      onChange={(e) => setFormData({ ...formData, skor_attitude: Number(e.target.value) })}
                      className="w-full text-xs font-black text-emerald-900 border border-emerald-300 rounded-xl p-2 text-center bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-rose-800 block mb-0.5">4. Ketahanan (15%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.skor_ketahanan ?? 85}
                      onChange={(e) => setFormData({ ...formData, skor_ketahanan: Number(e.target.value) })}
                      className="w-full text-xs font-black text-rose-900 border border-rose-300 rounded-xl p-2 text-center bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-800 block mb-0.5">Skor Akhir (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.skor_akhir ?? 88}
                      onChange={(e) => setFormData({ ...formData, skor_akhir: Number(e.target.value) })}
                      className="w-full text-xs font-black text-slate-900 border border-slate-400 rounded-xl p-2 text-center bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Kelulusan OJT</label>
                  <select
                    value={formData.status_ojt}
                    onChange={(e) => setFormData({ ...formData, status_ojt: e.target.value as StatusOJT })}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  >
                    <option value="Lulus / Mandiri">Lulus / Mandiri (Skor &ge; 80)</option>
                    <option value="Sedang Berjalan">Sedang Berjalan (Skor 68 - 79)</option>
                    <option value="Perlu Pendampingan Lanjut">Perlu Pendampingan Lanjut (Skor &lt; 68)</option>
                  </select>
                </div>
              </div>

              {/* Edit Diagnosa Akar Masalah & Bukti */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-black text-purple-900">Diagnosa Akar Masalah & Bukti Observasi:</h4>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Akar Masalah Utama</label>
                  <input
                    type="text"
                    value={formData.akar_masalah || ''}
                    onChange={(e) => setFormData({ ...formData, akar_masalah: e.target.value })}
                    placeholder="Contoh: Sudah Sangat Konsisten, Mandiri & Mahir Eksekusi"
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fakta & Bukti Observasi Lapangan</label>
                  <textarea
                    rows={2}
                    value={formData.bukti_observasi || ''}
                    onChange={(e) => setFormData({ ...formData, bukti_observasi: e.target.value })}
                    placeholder="Uraikan peristiwa spesifik yang diamati selama OJT..."
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Justifikasi Penetapan Status Kelulusan</label>
                  <textarea
                    rows={2}
                    value={formData.alasan_kelulusan || ''}
                    onChange={(e) => setFormData({ ...formData, alasan_kelulusan: e.target.value })}
                    placeholder="Alasan mengapa kru berhak dinyatakan Lulus Mandiri / Perlu Bimbingan Lanjut..."
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              {/* Edit Daftar Topik SOP */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900">
                    Daftar Topik SOP yang Diuji ({editableTopics.length} Topik)
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="px-2.5 py-1 rounded-lg bg-[#96171B] hover:bg-[#781014] text-white text-[11px] font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>+ Tambah Topik SOP</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {editableTopics.map((topic, idx) => (
                    <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-2">
                      <span className="text-xs font-black text-slate-400 w-6">#{idx + 1}</span>
                      <input
                        type="text"
                        value={topic.judul}
                        onChange={(e) => handleUpdateTopic(idx, 'judul', e.target.value)}
                        className="flex-1 text-xs font-bold border border-slate-300 rounded-lg p-1.5"
                      />
                      <select
                        value={topic.skor}
                        onChange={(e) => handleUpdateTopic(idx, 'skor', Number(e.target.value))}
                        className="text-xs font-bold border border-slate-300 rounded-lg p-1.5 w-36"
                      >
                        <option value={3}>Sangat Mahir (3)</option>
                        <option value={2}>Sesuai SOP (2)</option>
                        <option value={1}>Koreksi (1)</option>
                        <option value={0}>Belum Mampu (0)</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteTopic(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit 4 Catatan */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-black text-slate-900">Catatan Diagnostik & Rekomendasi:</h4>
                
                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    1. Kekuatan & Kelebihan Kru (Strengths)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.catatan_kekuatan || ''}
                    onChange={(e) => setFormData({ ...formData, catatan_kekuatan: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-800 mb-1">
                    2. Area Perbaikan (Weaknesses)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.catatan_kelemahan || ''}
                    onChange={(e) => setFormData({ ...formData, catatan_kelemahan: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-800 mb-1">
                    3. Action Plan & Tindak Lanjut
                  </label>
                  <textarea
                    rows={2}
                    value={formData.catatan_action_plan || ''}
                    onChange={(e) => setFormData({ ...formData, catatan_action_plan: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-800 mb-1">
                    4. Kesimpulan & Diagnostik Trainer Operasional
                  </label>
                  <textarea
                    rows={3}
                    value={formData.catatan_trainer || ''}
                    onChange={(e) => setFormData({ ...formData, catatan_trainer: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  />
                </div>
              </div>

              {/* Edit Penandatangan */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-black text-slate-900">Penandatangan:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Trainer Operasional</label>
                    <input
                      type="text"
                      value={signPD}
                      onChange={(e) => setSignPD(e.target.value)}
                      className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Penanggung Jawab Outlet</label>
                    <input
                      type="text"
                      value={signOutletPIC}
                      onChange={(e) => setSignOutletPIC(e.target.value)}
                      placeholder={`Penanggung Jawab Outlet ${formData.kode_outlet}`}
                      className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons in Edit Mode */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveMode('view')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Batal / Lihat Dokumen
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Save size={14} />
                  <span>Simpan Perubahan Data</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
