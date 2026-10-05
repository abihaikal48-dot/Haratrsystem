import React, { useState } from 'react';
import {
  X, AlertTriangle, CheckCircle2, ArrowRight, Lightbulb,
  Wrench, Users, BookOpen, Layers, Scale, Sparkles, Plus,
  Trash2, ShieldAlert, Check, Calendar, CornerDownRight
} from 'lucide-react';
import { KartuKeluhan, TNA } from '../types';
import { db } from '../lib/storage';

interface RCAFishboneModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: KartuKeluhan | null;
  onSuccess: (msg: string) => void;
}

export const RCAFishboneModal: React.FC<RCAFishboneModalProps> = ({
  isOpen,
  onClose,
  complaint,
  onSuccess,
}) => {
  if (!isOpen || !complaint) return null;

  // 5M Causes State
  const [manCauses, setManCauses] = useState<string[]>([
    'Kru belum mengikuti bimbingan SOP berkala',
    'Kelelahan saat lonjakan pesanan jam sibuk (rush hour)',
  ]);
  const [methodCauses, setMethodCauses] = useState<string[]>([
    'Holding time di warmer melewati toleransi 90 menit',
    'Checklist operasional harian tidak dicek oleh shift leader',
  ]);
  const [machineCauses, setMachineCauses] = useState<string[]>([
    'Kalibrasi termostat deep fryer belum diverifikasi mingguan',
  ]);
  const [materialCauses, setMaterialCauses] = useState<string[]>([
    'Ayam marinasi digoreng sebelum suhu ruang tercapai (masih beku di inti)',
  ]);
  const [measurementCauses, setMeasurementCauses] = useState<string[]>([
    'Penimbangan tepung & bumbu tidak menggunakan timbangan digital presisi',
  ]);

  // 5-Why Analysis
  const [whys, setWhys] = useState<string[]>([
    complaint.deskripsi_keluhan,
    'Suhu minyak turun drastis saat ayam dingin dimasukkan',
    'Kru terburu-buru menggoreng tanpa mengecek termometer digital',
    'Kru belum memahami dampak suhu terhadap tekstur kulit ayam krispi',
    'Akar Masalah: Pelatihan dasar SOP penggorengan & titik kritis HACCP belum tuntas',
  ]);

  // Inputs for adding new causes
  const [newMan, setNewMan] = useState('');
  const [newMethod, setNewMethod] = useState('');
  const [newMachine, setNewMachine] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newMeasurement, setNewMeasurement] = useState('');

  // Auto-generate TNA from RCA
  const handleConvertToTNA = () => {
    const rootCause = whys[whys.length - 1] || 'Ketidakpatuhan SOP operasional';
    const newTNA: Omit<TNA, 'id' | 'created_at'> = {
      tanggal: new Date().toISOString().slice(0, 10),
      kode_outlet: complaint.kode_outlet,
      divisi: 'Kitchen',
      sumber_temuan: `RCA Keluhan Pelanggan (${complaint.tipe})`,
      deskripsi_gap: `[RCA Otomatis] Temuan Keluhan Pelanggan: "${complaint.deskripsi_keluhan}". Akar masalah: ${rootCause}`,
      jenis_gap: 'Keterampilan',
      prioritas: 'Tinggi',
      status: 'Proses',
      rencana_tindak_lanjut: `Sesi Refreshment SOP Kritis & Uji Praktik Ulang untuk Kru ${complaint.nama_kru_terkait || 'Terkait'} di Outlet ${complaint.kode_outlet}`,
    };

    db.insertRow('tna', newTNA);

    // Update complaint record status
    db.updateRow('kartu_keluhan', complaint.id, {
      status: 'Selesai',
      tindak_lanjut_training: `TNA Dibuat: ${newTNA.rencana_tindak_lanjut}`,
    });

    onSuccess('Berhasil dikonversi ke Agenda Kebutuhan Pelatihan (TNA) & Status Keluhan diperbarui!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-[#96171B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <AlertTriangle size={20} className="text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black">
                  Analisis Akar Masalah (RCA) - Diagram Ishikawa 5M
                </h3>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  {complaint.kode_outlet}
                </span>
              </div>
              <p className="text-[11px] text-amber-100 font-medium">
                Metode Lean Six Sigma untuk investigasi kegagalan operasional dan pencegahan keluhan berulang.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          
          {/* Target Problem Statement Card (The Fish Head) */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10.5px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                Problem Statement (Kepala Ikan):
              </span>
              <h4 className="text-sm font-black text-slate-900 leading-snug">
                "{complaint.deskripsi_keluhan}"
              </h4>
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                <span>Kategori: <b>{complaint.tipe}</b></span>
                <span>•</span>
                <span>Tanggal: <b>{complaint.tanggal_shift}</b></span>
                {complaint.nama_kru_terkait && (
                  <>
                    <span>•</span>
                    <span>Kru Terkait: <b>{complaint.nama_kru_terkait}</b></span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleConvertToTNA}
              className="px-4 py-2 bg-[#96171B] hover:bg-[#801216] text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer transition-all active:scale-[0.98]"
            >
              <Lightbulb size={14} className="text-amber-300" />
              <span>Jadikan Agenda TNA</span>
            </button>
          </div>

          {/* 5M Fishbone Grid (The Bones) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-[#96171B]" />
                <span>5 Cabang Penyebab (5M Framework)</span>
              </h4>
              <span className="text-[10.5px] text-slate-400">Identifikasi faktor manusia, metode, alat, bahan, dan takaran</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              
              {/* 1. Man */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-black text-slate-900 flex items-center gap-1.5 text-[11px]">
                    <Users size={14} className="text-blue-600" /> 1. Man (SDM / Kru)
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{manCauses.length} Poin</span>
                </div>
                <div className="space-y-1.5 min-h-[60px]">
                  {manCauses.map((c, i) => (
                    <div key={i} className="flex items-start justify-between gap-1 text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80">
                      <span>• {c}</span>
                      <button onClick={() => setManCauses(manCauses.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 pt-1">
                  <input
                    type="text"
                    value={newMan}
                    onChange={(e) => setNewMan(e.target.value)}
                    placeholder="Tambah faktor SDM..."
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10.5px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMan.trim()) {
                        setManCauses([...manCauses, newMan.trim()]);
                        setNewMan('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newMan.trim()) {
                        setManCauses([...manCauses, newMan.trim()]);
                        setNewMan('');
                      }
                    }}
                    className="p-1 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* 2. Method */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-black text-slate-900 flex items-center gap-1.5 text-[11px]">
                    <BookOpen size={14} className="text-emerald-600" /> 2. Method (SOP & Alur)
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{methodCauses.length} Poin</span>
                </div>
                <div className="space-y-1.5 min-h-[60px]">
                  {methodCauses.map((c, i) => (
                    <div key={i} className="flex items-start justify-between gap-1 text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80">
                      <span>• {c}</span>
                      <button onClick={() => setMethodCauses(methodCauses.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 pt-1">
                  <input
                    type="text"
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value)}
                    placeholder="Tambah faktor SOP..."
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10.5px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMethod.trim()) {
                        setMethodCauses([...methodCauses, newMethod.trim()]);
                        setNewMethod('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newMethod.trim()) {
                        setMethodCauses([...methodCauses, newMethod.trim()]);
                        setNewMethod('');
                      }
                    }}
                    className="p-1 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* 3. Machine */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-black text-slate-900 flex items-center gap-1.5 text-[11px]">
                    <Wrench size={14} className="text-amber-600" /> 3. Machine (Peralatan)
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{machineCauses.length} Poin</span>
                </div>
                <div className="space-y-1.5 min-h-[60px]">
                  {machineCauses.map((c, i) => (
                    <div key={i} className="flex items-start justify-between gap-1 text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80">
                      <span>• {c}</span>
                      <button onClick={() => setMachineCauses(machineCauses.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 pt-1">
                  <input
                    type="text"
                    value={newMachine}
                    onChange={(e) => setNewMachine(e.target.value)}
                    placeholder="Tambah faktor mesin..."
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10.5px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMachine.trim()) {
                        setMachineCauses([...machineCauses, newMachine.trim()]);
                        setNewMachine('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newMachine.trim()) {
                        setMachineCauses([...machineCauses, newMachine.trim()]);
                        setNewMachine('');
                      }
                    }}
                    className="p-1 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* 4. Material */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-black text-slate-900 flex items-center gap-1.5 text-[11px]">
                    <AlertTriangle size={14} className="text-purple-600" /> 4. Material (Bahan Baku)
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{materialCauses.length} Poin</span>
                </div>
                <div className="space-y-1.5 min-h-[60px]">
                  {materialCauses.map((c, i) => (
                    <div key={i} className="flex items-start justify-between gap-1 text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80">
                      <span>• {c}</span>
                      <button onClick={() => setMaterialCauses(materialCauses.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 pt-1">
                  <input
                    type="text"
                    value={newMaterial}
                    onChange={(e) => setNewMaterial(e.target.value)}
                    placeholder="Tambah faktor bahan..."
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10.5px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMaterial.trim()) {
                        setMaterialCauses([...materialCauses, newMaterial.trim()]);
                        setNewMaterial('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newMaterial.trim()) {
                        setMaterialCauses([...materialCauses, newMaterial.trim()]);
                        setNewMaterial('');
                      }
                    }}
                    className="p-1 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* 5. Measurement */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="font-black text-slate-900 flex items-center gap-1.5 text-[11px]">
                    <Scale size={14} className="text-rose-600" /> 5. Measurement (Takaran)
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{measurementCauses.length} Poin</span>
                </div>
                <div className="space-y-1.5 min-h-[60px]">
                  {measurementCauses.map((c, i) => (
                    <div key={i} className="flex items-start justify-between gap-1 text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200/80">
                      <span>• {c}</span>
                      <button onClick={() => setMeasurementCauses(measurementCauses.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-rose-500">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 pt-1">
                  <input
                    type="text"
                    value={newMeasurement}
                    onChange={(e) => setNewMeasurement(e.target.value)}
                    placeholder="Tambah faktor takaran..."
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10.5px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newMeasurement.trim()) {
                        setMeasurementCauses([...measurementCauses, newMeasurement.trim()]);
                        setNewMeasurement('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newMeasurement.trim()) {
                        setMeasurementCauses([...measurementCauses, newMeasurement.trim()]);
                        setNewMeasurement('');
                      }
                    }}
                    className="p-1 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Quick Summary Info Box */}
              <div className="p-3.5 bg-gradient-to-br from-red-50 to-amber-50 rounded-2xl border border-red-200 flex flex-col justify-between">
                <div>
                  <span className="font-black text-red-900 text-[11px] flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-[#96171B]" /> Ringkasan Diagnosis RCA
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Total teridentifikasi <b>{manCauses.length + methodCauses.length + machineCauses.length + materialCauses.length + measurementCauses.length}</b> variabel penyebab pada 5 domain operasional.
                  </p>
                </div>
                <div className="pt-2 border-t border-red-200 text-[10.5px] font-bold text-[#96171B]">
                  Lanjutkan dengan 5-Why Analysis di bawah untuk menemukan akar paling mendasar.
                </div>
              </div>

            </div>
          </div>

          {/* Section: 5-Why Deep Dive */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CornerDownRight size={14} className="text-[#96171B]" />
                <span>Teknik 5-Why (Mengapa Terjadi) Menuju Root Cause</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">Edit tiap tahapan deduksi</span>
            </div>

            <div className="space-y-2">
              {whys.map((why, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`w-16 shrink-0 text-[10px] font-bold px-2 py-1 rounded-md text-center ${
                    idx === whys.length - 1
                      ? 'bg-[#96171B] text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}>
                    {idx === 0 ? 'Gejala' : idx === whys.length - 1 ? 'Akar Masalah' : `Why #${idx}`}
                  </span>
                  <input
                    type="text"
                    value={why}
                    onChange={(e) => {
                      const next = [...whys];
                      next[idx] = e.target.value;
                      setWhys(next);
                    }}
                    className={`w-full px-3 py-1.5 text-xs rounded-xl border ${
                      idx === whys.length - 1
                        ? 'bg-red-50/70 border-red-300 font-bold text-slate-900'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium">
            Status: <span className="font-bold text-slate-800">{complaint.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleConvertToTNA}
              className="px-4 py-2 bg-[#96171B] hover:bg-[#801216] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Simpan & Terbitkan Agenda TNA</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
