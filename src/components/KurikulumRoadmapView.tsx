import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, CheckCircle2, Clock, Target, Sparkles,
  ArrowRight, ShieldCheck, UserCheck, BookOpen, Wrench,
  AlertTriangle, Filter, Plus, Flame, Award, ChevronRight,
  Printer, Check, X, FileText, ChevronDown, ChevronUp,
  Brain, TrendingUp, AlertCircle, RefreshCw, BarChart2,
  Users, Store, Info, Edit3, MessageSquare, Star, Zap,
  Compass, Eye, CheckSquare, Layers, Download, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/storage';
import {
  OnboardingBatch, OnboardingParticipant, OnboardingSessionDef,
  Kru, Outlet, Division
} from '../types';
import {
  MASTER_KURIKULUM_3HARI,
  klasifikasiKruOnboarding,
  evaluasiKapasitasBatch
} from '../data/onboardingCurriculumData';
import { PageHeaderBanner } from './PageHeaderBanner';
import { generateOnboardingBatchPDF } from '../lib/pdfGenerator';

interface KurikulumRoadmapViewProps {
  selectedOutletCode: string;
}

type OnboardingViewSubTab = 'kurikulum' | 'batches' | 'radar_kru' | 'absensi_nilai';

export const KurikulumRoadmapView: React.FC<KurikulumRoadmapViewProps> = ({
  selectedOutletCode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<OnboardingViewSubTab>('batches');
  const [batches, setBatches] = useState<OnboardingBatch[]>([]);
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [newBatchModalOpen, setNewBatchModalOpen] = useState(false);
  const [addParticipantModalOpen, setAddParticipantModalOpen] = useState(false);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<OnboardingSessionDef | null>(null);
  const [evaluationModalParticipant, setEvaluationModalParticipant] = useState<{
    batch: OnboardingBatch;
    participant: OnboardingParticipant;
  } | null>(null);

  // New Batch Form State
  const [batchForm, setBatchForm] = useState({
    nama_batch: 'Batch Onboarding & RnD Produk HARA Chicken',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_selesai: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    kode_outlet_lokasi: selectedOutletCode !== 'ALL' ? selectedOutletCode : 'HC-JTS01',
    lead_trainer: 'Haikal Abi (Lead Trainer & People Dev)',
    catatan_batch: 'Standarisasi mutu terpadu 10 materi 25 jam, RnD 16 jam, dan survey kepuasan.',
  });

  const loadData = () => {
    const bList = db.getOnboardingBatches();
    setBatches(bList);
    setKruList(db.getTable<Kru>('kru').filter(k => k.status_aktif === 'Aktif'));
    setOutlets(db.getTable<Outlet>('outlets'));

    if (bList.length > 0 && !selectedBatchId) {
      setSelectedBatchId(bList[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, []);

  const activeBatch = useMemo(() => {
    return batches.find(b => b.id === selectedBatchId) || batches[0] || null;
  }, [batches, selectedBatchId]);

  // Classified Kru List
  const kruOnboardingStatus = useMemo(() => {
    return kruList.map(k => {
      const cls = klasifikasiKruOnboarding(k);
      const isAlreadyInBatch = activeBatch?.peserta.some(p => p.kru_id === k.id);
      return {
        ...k,
        ...cls,
        isAlreadyInBatch,
      };
    });
  }, [kruList, activeBatch]);

  // Capacity validation for active batch
  const capacityInfo = useMemo(() => {
    if (!activeBatch) return null;
    return evaluasiKapasitasBatch(activeBatch.peserta.length);
  }, [activeBatch]);

  // Handle Create New Batch
  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const batchNumber = `OB-HARA/${new Date().getFullYear()}/B0${batches.length + 1}`;
    const newBatch: OnboardingBatch = {
      id: `batch-${Date.now()}`,
      nomor_batch: batchNumber,
      nama_batch: batchForm.nama_batch,
      tanggal_mulai: batchForm.tanggal_mulai,
      tanggal_selesai: batchForm.tanggal_selesai,
      kode_outlet_lokasi: batchForm.kode_outlet_lokasi,
      status: 'Direncanakan',
      kuota_min: 11,
      kuota_max: 17,
      peserta: [],
      lead_trainer: batchForm.lead_trainer,
      catatan_batch: batchForm.catatan_batch,
      created_at: new Date().toISOString(),
    };

    db.saveOnboardingBatch(newBatch);
    setSelectedBatchId(newBatch.id);
    setNewBatchModalOpen(false);
  };

  // Handle Add Participant to Active Batch
  const handleAddKruToBatch = (kru: Kru) => {
    if (!activeBatch) return;
    if (activeBatch.peserta.length >= 17) {
      alert('Kapasitas maksimal kelas adalah 17 peserta (Standar Supervisi Intensif RnD).');
      return;
    }
    if (activeBatch.peserta.some(p => p.kru_id === kru.id)) {
      alert(`${kru.nama_kru} sudah terdaftar di batch ini.`);
      return;
    }

    const cls = klasifikasiKruOnboarding(kru);
    const newParticipant: OnboardingParticipant = {
      kru_id: kru.id,
      nama_kru: kru.nama_kru,
      kode_outlet: kru.kode_outlet,
      divisi: kru.divisi,
      tipe: cls.tipe,
      tanggal_masuk: kru.tanggal_masuk || new Date().toISOString().split('T')[0],
      hari_kerja: cls.hariKerja,
      absensi: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true },
      nilai_evaluasi: { 1: 85, 2: 88, 3: 86, 4: 90, 5: 88, 6: 85, 7: 90, 8: 90, 9: 92, 10: 95 },
      nilai_praktik_rnd: 90,
      survey_kepuasan: 5,
      status_kelulusan: 'Sedang Berjalan',
      catatan: 'Terdaftar di kelas resmi onboarding & retraining 3 hari.',
    };

    const updatedBatch: OnboardingBatch = {
      ...activeBatch,
      peserta: [...activeBatch.peserta, newParticipant],
    };

    db.saveOnboardingBatch(updatedBatch);
  };

  // Handle Remove Participant
  const handleRemoveParticipant = (kruId: string) => {
    if (!activeBatch) return;
    if (!confirm('Hapus peserta ini dari batch pelatihan?')) return;
    const updatedBatch: OnboardingBatch = {
      ...activeBatch,
      peserta: activeBatch.peserta.filter(p => p.kru_id !== kruId),
    };
    db.saveOnboardingBatch(updatedBatch);
  };

  // Toggle Attendance
  const handleToggleAttendance = (kruId: string, sessionNo: number) => {
    if (!activeBatch) return;
    const updatedBatch: OnboardingBatch = {
      ...activeBatch,
      peserta: activeBatch.peserta.map(p => {
        if (p.kru_id === kruId) {
          const curr = p.absensi[sessionNo] ?? false;
          return {
            ...p,
            absensi: { ...p.absensi, [sessionNo]: !curr },
          };
        }
        return p;
      }),
    };
    db.saveOnboardingBatch(updatedBatch);
  };

  // Save Evaluation Scores
  const handleSaveEvaluation = (
    kruId: string,
    nilaiPraktikRnD: number,
    surveyKepuasan: number,
    statusKelulusan: 'Lulus' | 'Remedial' | 'Sedang Berjalan',
    catatan: string
  ) => {
    if (!activeBatch) return;
    const updatedBatch: OnboardingBatch = {
      ...activeBatch,
      peserta: activeBatch.peserta.map(p => {
        if (p.kru_id === kruId) {
          return {
            ...p,
            nilai_praktik_rnd: nilaiPraktikRnD,
            survey_kepuasan: surveyKepuasan,
            status_kelulusan: statusKelulusan,
            catatan,
          };
        }
        return p;
      }),
    };
    db.saveOnboardingBatch(updatedBatch);
    setEvaluationModalParticipant(null);
  };

  // Handle PDF Export
  const handleExportPDF = () => {
    if (!activeBatch) return;
    const outletObj = outlets.find(o => o.kode_outlet === activeBatch.kode_outlet_lokasi);
    generateOnboardingBatchPDF(activeBatch, outletObj);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <PageHeaderBanner
        category="KURIKULUM & ONBOARDING RESMI"
        title="Sistem Manajemen Onboarding & Retraining Kru 3 Hari"
        description="Master Kurikulum Baku 10 Materi (Total 25 Jam) dengan Uji Praktik RnD 16 Jam, indikator kuota kelas 11–17 peserta, dan deteksi otomatis karyawan baru (1–45 hari)."
        icon={<GraduationCapIcon size={22} />}
        tabs={[
          { id: 'batches', label: 'Manajemen Batch Kelas', icon: Users, count: batches.length },
          { id: 'radar_kru', label: 'Radar Kelayakan Kru (1-45 Hari)', icon: UserCheck },
          { id: 'absensi_nilai', label: 'Absensi & Nilai RnD 16 Jam', icon: Award },
          { id: 'kurikulum', label: 'Master Kurikulum 10 Sesi', icon: BookOpen },
        ]}
        activeTab={activeSubTab}
        onSelectTab={(id) => setActiveSubTab(id as OnboardingViewSubTab)}
      />

      {/* ===================================================================
          SUB-TAB 1: MANAJEMEN BATCH KELAS
          =================================================================== */}
      {activeSubTab === 'batches' && (
        <div className="space-y-6">
          {/* Top Actions: Batch Selector & Add Batch Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#645D55] uppercase tracking-wider">
                Pilih Batch Pelatihan:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {batches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBatchId(b.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedBatchId === b.id
                        ? 'bg-[#96171B] text-white shadow-xs'
                        : 'bg-[#FAF8F5] text-[#181411] border border-[#E6E1DA] hover:bg-slate-100'
                    }`}
                  >
                    <span>{b.nomor_batch}</span>
                    <span className="ml-1.5 text-[10px] opacity-80">({b.peserta.length} Kru)</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPDF}
                disabled={!activeBatch || activeBatch.peserta.length === 0}
                className="btn-secondary-enterprise text-xs inline-flex items-center gap-1.5"
                title="Ekspor Laporan Batch ke PDF Vektor Resmi"
              >
                <Download size={14} className="text-[#96171B]" />
                <span>Unduh PDF Batch</span>
              </button>

              <button
                type="button"
                onClick={() => setNewBatchModalOpen(true)}
                className="btn-primary-enterprise text-xs inline-flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Buka Batch Baru</span>
              </button>
            </div>
          </div>

          {/* Active Batch Summary Card */}
          {activeBatch && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Batch Info Card */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E6E1DA]">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-[#96171B]">
                      <span>{activeBatch.nomor_batch}</span>
                      <span className="text-[#645D55]">•</span>
                      <span>Lokasi Gerai: {activeBatch.kode_outlet_lokasi}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#181411] mt-0.5">{activeBatch.nama_batch}</h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border w-fit ${
                    activeBatch.status === 'Selesai'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : activeBatch.status === 'Berjalan'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    Status: {activeBatch.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                    <span className="text-[#645D55] text-[11px]">Tanggal Mulai</span>
                    <div className="font-bold text-[#181411] mt-0.5">{activeBatch.tanggal_mulai}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                    <span className="text-[#645D55] text-[11px]">Tanggal Selesai</span>
                    <div className="font-bold text-[#181411] mt-0.5">{activeBatch.tanggal_selesai}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                    <span className="text-[#645D55] text-[11px]">Durasi Kurikulum</span>
                    <div className="font-bold text-[#96171B] mt-0.5">3 Hari (25 Jam)</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                    <span className="text-[#645D55] text-[11px]">Lead Trainer</span>
                    <div className="font-bold text-[#181411] mt-0.5 truncate">{activeBatch.lead_trainer}</div>
                  </div>
                </div>

                {activeBatch.catatan_batch && (
                  <p className="text-xs text-[#645D55] bg-[#FAF8F5] p-3 rounded-xl border border-[#E6E1DA] leading-relaxed">
                    <strong>Catatan Trainer:</strong> {activeBatch.catatan_batch}
                  </p>
                )}
              </div>

              {/* Quota Gauge Card (11 - 17 Kru) */}
              <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#645D55] uppercase tracking-wider">Kapasitas Kelas Resmi</span>
                    <span className="font-mono font-bold text-[#181411]">
                      {activeBatch.peserta.length} / 17 Kru
                    </span>
                  </div>

                  {/* Progress Bar with Min (11) and Max (17) Markers */}
                  <div className="w-full h-3 bg-[#FAF8F5] rounded-full border border-[#E6E1DA] overflow-hidden relative my-2">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        activeBatch.peserta.length < 11
                          ? 'bg-amber-500'
                          : activeBatch.peserta.length > 17
                          ? 'bg-rose-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, (activeBatch.peserta.length / 17) * 100)}%` }}
                    />
                  </div>

                  {/* Range indicator */}
                  <div className="flex justify-between text-[10px] text-[#645D55] font-mono px-0.5">
                    <span>Min: 11 Kru</span>
                    <span>Ideal: 11-17 Kru</span>
                    <span>Maks: 17 Kru</span>
                  </div>
                </div>

                {/* Status Message */}
                {capacityInfo && (
                  <div className={`p-3 rounded-xl border text-xs leading-relaxed ${capacityInfo.colorClass}`}>
                    <div className="font-bold">{capacityInfo.label}</div>
                    <p className="mt-0.5 text-[11px]">{capacityInfo.pesan}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setActiveSubTab('radar_kru')}
                  className="w-full py-2.5 rounded-xl border border-[#96171B] text-[#96171B] hover:bg-red-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Tambah Peserta dari Master Kru</span>
                </button>
              </div>
            </div>
          )}

          {/* Table: Daftar Peserta Terdaftar di Batch */}
          {activeBatch && (
            <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1DA]">
                <div>
                  <h4 className="font-bold text-[#181411]">
                    Daftar Peserta Batch ({activeBatch.peserta.length} Personil)
                  </h4>
                  <p className="text-xs text-[#645D55]">
                    Validasi absensi 10 sesi materi dan nilai Uji Praktik RnD 16 Jam
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('absensi_nilai')}
                    className="text-xs font-bold text-[#96171B] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Buka Matriks Absensi 10 Sesi</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {activeBatch.peserta.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#645D55]">
                  Belum ada peserta yang dimasukkan ke dalam batch ini. Silakan klik tombol "Tambah Peserta dari Master Kru" di atas.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E6E1DA] bg-[#FAF8F5] text-[#645D55] font-bold uppercase text-[11px]">
                        <th className="py-3 px-3">Nama Kru & Divisi</th>
                        <th className="py-3 px-3">Kategori Pelatihan</th>
                        <th className="py-3 px-3">Masa Kerja</th>
                        <th className="py-3 px-3 text-center">Absensi (10 Sesi)</th>
                        <th className="py-3 px-3 text-center">Uji RnD (16 Jam)</th>
                        <th className="py-3 px-3 text-center">Survey</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6E1DA]">
                      {activeBatch.peserta.map((p) => {
                        const hadirCount = Object.values(p.absensi).filter(Boolean).length;
                        return (
                          <tr key={p.kru_id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-bold text-[#181411]">{p.nama_kru}</div>
                              <div className="text-[11px] text-[#645D55]">{p.divisi} • {p.kode_outlet}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                p.tipe.includes('Baru')
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {p.tipe}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-[#645D55]">
                              {p.hari_kerja} Hari Kerja
                            </td>
                            <td className="py-3 px-3 text-center font-bold">
                              <span className={hadirCount === 10 ? 'text-emerald-700' : 'text-amber-700'}>
                                {hadirCount} / 10 Sesi
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold">
                              <span className={p.nilai_praktik_rnd >= 85 ? 'text-emerald-700' : 'text-amber-700'}>
                                {p.nilai_praktik_rnd} / 100
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-0.5 text-amber-500">
                                <span>★</span>
                                <span className="font-bold text-slate-800 text-xs">{p.survey_kepuasan}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                p.status_kelulusan === 'Lulus'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : p.status_kelulusan === 'Sedang Berjalan'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}>
                                {p.status_kelulusan}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEvaluationModalParticipant({ batch: activeBatch, participant: p })}
                                  className="p-1.5 rounded-lg border border-[#E6E1DA] text-[#645D55] hover:text-[#96171B] hover:border-[#96171B]/30"
                                  title="Edit Nilai & Evaluasi Kru"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveParticipant(p.kru_id)}
                                  className="p-1.5 rounded-lg border border-[#E6E1DA] text-[#645D55] hover:text-rose-600 hover:border-rose-300"
                                  title="Keluarkan dari Batch"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 2: RADAR KELAYAKAN KRU (DETEKSI KARYAWAN BARU 1-45 HARI)
          =================================================================== */}
      {activeSubTab === 'radar_kru' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1DA]">
              <div>
                <h3 className="font-bold text-[#181411]">Radar Otomatis Masa Kerja Kru (1 s.d. 45 Hari)</h3>
                <p className="text-xs text-[#645D55]">
                  Karyawan baru wajib mengikuti Onboarding 3 Hari. Karyawan lama dengan gap kompetensi direkomendasikan Retraining.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#645D55]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama kru atau outlet..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#E6E1DA] text-xs text-[#181411] placeholder-[#645D55]/60 focus:outline-none focus:border-[#96171B]"
                />
              </div>
            </div>

            {/* List Kru */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {kruOnboardingStatus
                .filter(k => !searchQuery.trim() || k.nama_kru.toLowerCase().includes(searchQuery.toLowerCase()) || k.kode_outlet.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((k) => (
                  <div
                    key={k.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      k.isAlreadyInBatch
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : k.wajibOnboarding
                        ? 'bg-white border-[#E6E1DA] hover:border-[#96171B]/50'
                        : 'bg-[#FAF8F5] border-[#E6E1DA]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          k.wajibOnboarding
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {k.statusBadge}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#645D55]">
                          {k.hariKerja} Hari Kerja
                        </span>
                      </div>

                      <div className="font-bold text-[#181411] text-sm">{k.nama_kru}</div>
                      <div className="text-xs text-[#645D55] mt-0.5">
                        {k.divisi} • Gerai {k.kode_outlet}
                      </div>
                      <div className="text-[11px] text-[#645D55] mt-1">
                        Tgl Masuk: {k.tanggal_masuk || '-'}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#E6E1DA]">
                      {k.isAlreadyInBatch ? (
                        <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          <span>Terdaftar di Batch Aktif</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddKruToBatch(k)}
                          className="w-full py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-red-50 text-[#96171B] border border-[#E6E1DA] hover:border-[#96171B] text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <Plus size={13} />
                          <span>+ Daftarkan ke {activeBatch?.nomor_batch || 'Batch'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 3: ABSENSI & NILAI EVALUASI RND 16 JAM
          =================================================================== */}
      {activeSubTab === 'absensi_nilai' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1DA]">
              <div>
                <h3 className="font-bold text-[#181411]">
                  Matriks Absensi 10 Sesi & Penilaian Uji Praktik RnD 16 Jam
                </h3>
                <p className="text-xs text-[#645D55]">
                  Klik kotak checklist untuk mencatat kehadiran per sesi. Nilai Praktik RnD mencakup 8 jam Hari 2 dan 8 jam Hari 3.
                </p>
              </div>

              <div className="text-xs font-bold text-[#96171B]">
                Batch: {activeBatch?.nomor_batch} ({activeBatch?.peserta.length} Peserta)
              </div>
            </div>

            {(!activeBatch || activeBatch.peserta.length === 0) ? (
              <div className="py-12 text-center text-xs text-[#645D55]">
                Belum ada peserta di batch ini. Tambahkan peserta dari tab "Radar Kelayakan Kru".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E6E1DA] bg-[#FAF8F5] text-[#645D55] font-bold text-[10.5px]">
                      <th className="py-2.5 px-2">Nama Kru</th>
                      <th className="py-2.5 px-1 text-center" title="Sesi 1: Budaya & Pest Control (2 Jam)">H1-S1</th>
                      <th className="py-2.5 px-1 text-center" title="Sesi 2: SOP Kebersihan & K3 (1 Jam)">H1-S2</th>
                      <th className="py-2.5 px-1 text-center" title="Sesi 3: Kasir & Online (1 Jam)">H1-S3</th>
                      <th className="py-2.5 px-1 text-center" title="Sesi 4: Service Excellence (1 Jam)">H1-S4</th>
                      <th className="py-2.5 px-1 text-center" title="Sesi 5: Stok & FIFO (1 Jam)">H1-S5</th>
                      <th className="py-2.5 px-1 text-center" title="Sesi 6: Handling Complaint (1 Jam)">H1-S6</th>
                      <th className="py-2.5 px-1 text-center" title="Sesi 7: Motivasi Hari 1 (1 Jam)">H1-S7</th>
                      <th className="py-2.5 px-1 text-center bg-red-50 text-[#96171B]" title="Sesi 8: SOP Produk RnD Bagian 1 (8 Jam)">H2-RnD</th>
                      <th className="py-2.5 px-1 text-center bg-red-50 text-[#96171B]" title="Sesi 9: SOP Produk RnD Bagian 2 (8 Jam)">H3-RnD</th>
                      <th className="py-2.5 px-1 text-center" title="Sesi 10: Evaluasi & Komitmen (1 Jam)">H3-S10</th>
                      <th className="py-2.5 px-2 text-center">Nilai RnD</th>
                      <th className="py-2.5 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E1DA]">
                    {activeBatch.peserta.map((p) => (
                      <tr key={p.kru_id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="py-2 px-2">
                          <div className="font-bold text-[#181411] truncate">{p.nama_kru}</div>
                          <div className="text-[10px] text-[#645D55]">{p.divisi}</div>
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sNo) => {
                          const isChecked = !!p.absensi[sNo];
                          return (
                            <td key={sNo} className="py-2 px-1 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleAttendance(p.kru_id, sNo)}
                                className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                                  isChecked
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white border-[#E6E1DA] text-transparent hover:border-[#96171B]'
                                }`}
                                title={`Toggle Absensi Sesi ${sNo}`}
                              >
                                <Check size={12} strokeWidth={3} />
                              </button>
                            </td>
                          );
                        })}
                        <td className="py-2 px-2 text-center font-mono font-bold">
                          <span className={p.nilai_praktik_rnd >= 85 ? 'text-emerald-700' : 'text-amber-700'}>
                            {p.nilai_praktik_rnd}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => setEvaluationModalParticipant({ batch: activeBatch, participant: p })}
                            className="text-[10px] font-bold underline text-[#96171B]"
                          >
                            {p.status_kelulusan}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 4: MASTER KURIKULUM BAKU 3 HARI (10 SESI - 25 JAM)
          =================================================================== */}
      {activeSubTab === 'kurikulum' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] space-y-6">
            <div>
              <h3 className="font-bold text-[#181411]">
                Silabus Resmi Onboarding & Retraining Kru PT HARA Chicken Indonesia
              </h3>
              <p className="text-xs text-[#645D55] mt-0.5">
                Standarisasi 10 materi kurikulum (Total 25 Jam) dipandu oleh manajemen multidisiplin gerai
              </p>
            </div>

            {/* 3 Days Grouped Display */}
            <div className="space-y-6">
              {[1, 2, 3].map((hariNo) => {
                const daySessions = MASTER_KURIKULUM_3HARI.filter(s => s.hari === hariNo);
                const totalJam = daySessions.reduce((acc, curr) => acc + curr.durasi_jam, 0);
                return (
                  <div key={hariNo} className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#96171B] text-white flex items-center justify-center text-xs font-bold">
                          {hariNo}
                        </span>
                        <h4 className="font-black text-sm text-[#181411]">
                          HARI KE-{hariNo} ({daySessions.length} Materi • Total {totalJam} Jam)
                        </h4>
                      </div>
                      <span className="text-xs text-[#645D55] font-semibold">
                        {hariNo === 1 ? 'Budaya, K3 & Operasional Dasar' : hariNo === 2 ? 'RnD Produk Bagian I (Hands-on)' : 'RnD Produk Bagian II & Komitmen'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {daySessions.map((s) => (
                        <div
                          key={s.no}
                          className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA] flex flex-col justify-between space-y-2 hover:bg-white hover:border-[#96171B]/30 transition-all cursor-pointer"
                          onClick={() => setSelectedSessionDetail(s)}
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-[#96171B]">Sesi #{s.no} • {s.durasi_jam} Jam</span>
                              <span className="text-[11px] font-semibold text-[#645D55]">{s.trainer_role}</span>
                            </div>
                            <h5 className="font-bold text-[#181411] text-sm leading-snug">{s.judul}</h5>
                            <p className="text-xs text-[#645D55] mt-1 leading-relaxed">{s.tujuan}</p>
                          </div>

                          <div className="pt-2 border-t border-[#E6E1DA]/80 flex items-center justify-between text-[11px] text-[#645D55]">
                            <span>Metode: {s.metode}</span>
                            <span className="font-semibold text-[#96171B]">Detail SOP →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: BUKA BATCH BARU
          =================================================================== */}
      <AnimatePresence>
        {newBatchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-[#E6E1DA] shadow-xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                <h3 className="font-bold text-[#181411]">Buka Batch Pelatihan Onboarding Baru</h3>
                <button
                  type="button"
                  onClick={() => setNewBatchModalOpen(false)}
                  className="text-[#645D55] hover:text-[#181411]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#181411] mb-1">Nama Batch Pelatihan</label>
                  <input
                    type="text"
                    value={batchForm.nama_batch}
                    onChange={(e) => setBatchForm({ ...batchForm, nama_batch: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs text-[#181411]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-[#181411] mb-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={batchForm.tanggal_mulai}
                      onChange={(e) => setBatchForm({ ...batchForm, tanggal_mulai: e.target.value })}
                      required
                      className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs text-[#181411]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#181411] mb-1">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={batchForm.tanggal_selesai}
                      onChange={(e) => setBatchForm({ ...batchForm, tanggal_selesai: e.target.value })}
                      required
                      className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs text-[#181411]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#181411] mb-1">Lokasi Gerai Pelatihan</label>
                  <select
                    value={batchForm.kode_outlet_lokasi}
                    onChange={(e) => setBatchForm({ ...batchForm, kode_outlet_lokasi: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs text-[#181411]"
                  >
                    {outlets.map(o => (
                      <option key={o.id} value={o.kode_outlet}>
                        {o.nama_outlet} ({o.kode_outlet})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#181411] mb-1">Lead Trainer Penanggung Jawab</label>
                  <input
                    type="text"
                    value={batchForm.lead_trainer}
                    onChange={(e) => setBatchForm({ ...batchForm, lead_trainer: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs text-[#181411]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#181411] mb-1">Catatan Batch</label>
                  <textarea
                    rows={2}
                    value={batchForm.catatan_batch}
                    onChange={(e) => setBatchForm({ ...batchForm, catatan_batch: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs text-[#181411]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setNewBatchModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#E6E1DA] text-[#645D55] text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#96171B] hover:bg-[#7A1216] text-white text-xs font-semibold shadow-xs"
                  >
                    Simpan Batch
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================
          MODAL: EVALUASI NILAI KRU (RND 16 JAM & SURVEY)
          =================================================================== */}
      <AnimatePresence>
        {evaluationModalParticipant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-[#E6E1DA] shadow-xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                <div>
                  <h3 className="font-bold text-[#181411]">Input Nilai & Kelulusan Onboarding</h3>
                  <p className="text-xs text-[#645D55]">
                    {evaluationModalParticipant.participant.nama_kru} ({evaluationModalParticipant.participant.divisi})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEvaluationModalParticipant(null)}
                  className="text-[#645D55] hover:text-[#181411]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#181411] mb-1">
                    Nilai Uji Praktik RnD 16 Jam (Skala 0 - 100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={evaluationModalParticipant.participant.nilai_praktik_rnd}
                    id="input-rnd-score"
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs text-[#181411] font-mono font-bold"
                  />
                  <p className="text-[10px] text-[#645D55] mt-0.5">
                    Memverifikasi suhu 160°C (kompor 175°C), timer 12 mnt, core temp ≥74°C, dan sambal 30g cobek batu.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-[#181411] mb-1">
                    Survey Kepuasan Karyawan (1 - 5 Bintang)
                  </label>
                  <select
                    defaultValue={evaluationModalParticipant.participant.survey_kepuasan}
                    id="input-survey-score"
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs text-[#181411]"
                  >
                    <option value="5">★★★★★ 5 Bintang (Sangat Puas & Termotivasi)</option>
                    <option value="4">★★★★☆ 4 Bintang (Puas & Memahami Materi)</option>
                    <option value="3">★★★☆☆ 3 Bintang (Cukup)</option>
                    <option value="2">★★☆☆☆ 2 Bintang (Kurang Paham)</option>
                    <option value="1">★☆☆☆☆ 1 Bintang (Tidak Puas)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#181411] mb-1">
                    Status Kelulusan Akhir
                  </label>
                  <select
                    defaultValue={evaluationModalParticipant.participant.status_kelulusan}
                    id="input-status-lulus"
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs text-[#181411]"
                  >
                    <option value="Lulus">Lulus (Tersertifikasi Penuh)</option>
                    <option value="Sedang Berjalan">Sedang Berjalan (Belum Selesai)</option>
                    <option value="Remedial">Remedial (Perlu Praktik Ulang)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#181411] mb-1">Catatan Trainer / Evaluasi</label>
                  <textarea
                    rows={2}
                    defaultValue={evaluationModalParticipant.participant.catatan || ''}
                    id="input-catatan-kru"
                    placeholder="Catatan perkembangan khusus peserta..."
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs text-[#181411]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEvaluationModalParticipant(null)}
                    className="px-4 py-2 rounded-xl border border-[#E6E1DA] text-[#645D55] text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const rndVal = Number((document.getElementById('input-rnd-score') as HTMLInputElement)?.value) || 85;
                      const surveyVal = Number((document.getElementById('input-survey-score') as HTMLSelectElement)?.value) || 5;
                      const statusVal = (document.getElementById('input-status-lulus') as HTMLSelectElement)?.value as any || 'Lulus';
                      const catatanVal = (document.getElementById('input-catatan-kru') as HTMLTextAreaElement)?.value || '';

                      handleSaveEvaluation(
                        evaluationModalParticipant.participant.kru_id,
                        rndVal,
                        surveyVal,
                        statusVal,
                        catatanVal
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-[#96171B] hover:bg-[#7A1216] text-white text-xs font-semibold shadow-xs"
                  >
                    Simpan Nilai
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================================================================
          MODAL: DETAIL SESI KURIKULUM
          =================================================================== */}
      <AnimatePresence>
        {selectedSessionDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-[#E6E1DA] shadow-xl max-w-md w-full p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                <div>
                  <span className="text-[10px] font-bold text-[#96171B] uppercase tracking-wider">
                    Sesi #{selectedSessionDetail.no} • Hari Ke-{selectedSessionDetail.hari}
                  </span>
                  <h3 className="font-bold text-[#181411] text-sm mt-0.5">{selectedSessionDetail.judul}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSessionDetail(null)}
                  className="text-[#645D55] hover:text-[#181411]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                  <span className="font-bold text-[#181411]">Tujuan Pembelajaran:</span>
                  <p className="mt-1 text-[#645D55] leading-relaxed">{selectedSessionDetail.tujuan}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl border border-[#E6E1DA]">
                    <span className="text-[#645D55] text-[10px]">Alokasi Waktu</span>
                    <div className="font-bold text-[#181411] mt-0.5">{selectedSessionDetail.durasi_jam} Jam</div>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[#E6E1DA]">
                    <span className="text-[#645D55] text-[10px]">Pemateri / Trainer</span>
                    <div className="font-bold text-[#181411] mt-0.5 truncate">{selectedSessionDetail.trainer_role}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-[#E6E1DA]">
                  <span className="font-bold text-[#181411]">Metode & Evaluasi:</span>
                  <p className="mt-1 text-[#645D55]"><strong>Metode:</strong> {selectedSessionDetail.metode}</p>
                  <p className="mt-0.5 text-[#645D55]"><strong>Bentuk Evaluasi:</strong> {selectedSessionDetail.evaluasi}</p>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedSessionDetail(null)}
                  className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] hover:bg-slate-100 text-[#181411] text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function GraduationCapIcon(props: { size?: number }) {
  return <Award {...props} />;
}
