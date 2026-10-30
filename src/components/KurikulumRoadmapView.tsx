import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, CheckCircle2, Clock, Target, Sparkles,
  ArrowRight, ArrowLeft, ShieldCheck, UserCheck, BookOpen, Wrench,
  AlertTriangle, Filter, Plus, Flame, Award, ChevronRight,
  Printer, Check, X, FileText, ChevronDown, ChevronUp,
  Brain, TrendingUp, AlertCircle, RefreshCw, BarChart2, BarChart3,
  Users, Store, Info, Edit3, MessageSquare, Star, Zap,
  Compass, Eye, CheckSquare, Layers, Download, Search,
  Scale, Thermometer, UtensilsCrossed, GraduationCap, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/storage';
import {
  OnboardingBatch, OnboardingParticipant, OnboardingSessionDef,
  Kru, Outlet, Division, PenilaianPraktik
} from '../types';
import {
  MASTER_KURIKULUM_3HARI,
  klasifikasiKruOnboarding,
  evaluasiKapasitasBatch
} from '../data/onboardingCurriculumData';
import { PageHeaderBanner } from './PageHeaderBanner';
import { generateOnboardingBatchPDF } from '../lib/pdfGenerator';
import { OnboardingAnalyticsDashboard } from './OnboardingAnalyticsDashboard';
import { OnboardingProductPracticeView } from './trainer/OnboardingProductPracticeView';
import { OnboardingActivityLogView } from './trainer/OnboardingActivityLogView';

interface KurikulumRoadmapViewProps {
  selectedOutletCode: string;
}

type OnboardingViewSubTab =
  | 'silabus'
  | 'batches'
  | 'penilaian'
  | 'analyst'
  | 'radar_kru'
  | 'absensi_nilai';

export const KurikulumRoadmapView: React.FC<KurikulumRoadmapViewProps> = ({
  selectedOutletCode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<OnboardingViewSubTab>('silabus');
  const [penilaianMode, setPenilaianMode] = useState<'produk' | 'log'>('produk');
  const [batches, setBatches] = useState<OnboardingBatch[]>([]);
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [newBatchModalOpen, setNewBatchModalOpen] = useState(false);
  const [editBatchModalOpen, setEditBatchModalOpen] = useState(false);
  const [editingBatchObj, setEditingBatchObj] = useState<OnboardingBatch | null>(null);
  const [addParticipantModalOpen, setAddParticipantModalOpen] = useState(false);
  const [manualParticipantModalOpen, setManualParticipantModalOpen] = useState(false);
  const [manualNama, setManualNama] = useState('');
  const [manualOutlet, setManualOutlet] = useState('HC-GTG01');
  const [manualDivisi, setManualDivisi] = useState<Division>('Kitchen');
  const [manualTipe, setManualTipe] = useState<'Karyawan Baru (1-45 Hari)' | 'Retraining Karyawan Lama'>('Karyawan Baru (1-45 Hari)');
  const [selectedSessionDetail, setSelectedSessionDetail] = useState<OnboardingSessionDef | null>(null);
  const [evaluationModalParticipant, setEvaluationModalParticipant] = useState<{
    batch: OnboardingBatch;
    participant: OnboardingParticipant;
  } | null>(null);

  const [deleteBatchTarget, setDeleteBatchTarget] = useState<OnboardingBatch | null>(null);

  // New Batch Form State
  const [batchForm, setBatchForm] = useState({
    nama_batch: 'Batch Onboarding TC Kantor Lempongsari',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_selesai: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    kode_outlet_lokasi: 'Kantor Lempongsari',
    catatan_batch: 'Kelas Onboarding TC Kantor Lempongsari.',
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
    const found = batches.find(b => b.id === selectedBatchId) || batches[0] || null;
    if (!found) return null;
    return {
      ...found,
      peserta: Array.isArray(found.peserta) ? found.peserta : [],
    };
  }, [batches, selectedBatchId]);

  // Classified Kru List
  const kruOnboardingStatus = useMemo(() => {
    return kruList.map(k => {
      const cls = klasifikasiKruOnboarding(k);
      const isAlreadyInBatch = (activeBatch?.peserta || []).some(p => p.kru_id === k.id);
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
    return evaluasiKapasitasBatch((activeBatch.peserta || []).length);
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
      lead_trainer: 'Onboarding Team',
      catatan_batch: batchForm.catatan_batch,
      created_at: new Date().toISOString(),
    };

    db.saveOnboardingBatch(newBatch);
    setSelectedBatchId(newBatch.id);
    setNewBatchModalOpen(false);
  };

  // Handle Delete Batch
  const handleDeleteBatch = (batchId: string) => {
    const target = batches.find(b => b.id === batchId);
    if (!target) return;
    setDeleteBatchTarget(target);
  };

  const confirmDeleteBatch = () => {
    if (!deleteBatchTarget) return;
    db.deleteOnboardingBatch(deleteBatchTarget.id);
    const updated = db.getOnboardingBatches();
    setBatches(updated);
    if (updated.length > 0) {
      setSelectedBatchId(updated[0].id);
    } else {
      setSelectedBatchId('');
    }
    setDeleteBatchTarget(null);
  };

  // Handle Manual Candidate Addition
  const handleSaveManualParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch || !manualNama.trim()) return;

    const cleanNama = manualNama.trim();
    const newParticipant: OnboardingParticipant = {
      kru_id: `kru-m-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      nama_kru: cleanNama,
      kode_outlet: manualOutlet || 'HC-GTG01',
      divisi: manualDivisi || 'Kitchen',
      tipe: manualTipe,
      tanggal_masuk: new Date().toISOString().split('T')[0],
      hari_kerja: 1,
      absensi: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true },
      nilai_evaluasi: {},
      nilai_praktik_rnd: 0,
      survey_kepuasan: 5,
      status_kelulusan: 'Sedang Berjalan',
      catatan: 'Peserta manual ditambahkan langsung di Batch.',
    };

    // Auto register to Master Kru if not present
    const existingKru = db.getTable<Kru>('kru');
    if (!existingKru.some(k => k.nama_kru.toLowerCase().trim() === cleanNama.toLowerCase().trim())) {
      const newKruRow: Kru = {
        id: newParticipant.kru_id,
        nama_kru: cleanNama,
        divisi: manualDivisi || 'Kitchen',
        kode_outlet: manualOutlet || 'HC-GTG01',
        tanggal_masuk: new Date().toISOString().split('T')[0],
        status_aktif: 'Aktif',
        catatan: `Peserta Manual Batch ${activeBatch.nama_batch}`,
        created_at: new Date().toISOString(),
      };
      db.insertRow('kru', newKruRow);
      setKruList(db.getTable<Kru>('kru').filter(k => k.status_aktif === 'Aktif'));
    }

    const updatedBatch: OnboardingBatch = {
      ...activeBatch,
      peserta: [...(activeBatch.peserta || []), newParticipant],
    };

    db.saveOnboardingBatch(updatedBatch);
    setManualParticipantModalOpen(false);
    setManualNama('');
  };

  // Handle Edit Batch Submit
  const handleOpenEditBatchModal = () => {
    if (!activeBatch) return;
    setEditingBatchObj({ ...activeBatch });
    setEditBatchModalOpen(true);
  };

  const handleSaveEditedBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatchObj || !editingBatchObj.nama_batch.trim()) return;

    db.saveOnboardingBatch(editingBatchObj);
    const updated = db.getOnboardingBatches();
    setBatches(updated);
    setEditBatchModalOpen(false);
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
    const target = activeBatch.peserta.find(p => p.kru_id === kruId);
    const updatedBatch: OnboardingBatch = {
      ...activeBatch,
      peserta: activeBatch.peserta.filter(p => p.kru_id !== kruId),
    };
    db.saveOnboardingBatch(updatedBatch);
    if (target) {
      db.deleteRow('kru', kruId);
      const allKru = db.getTable<Kru>('kru');
      const matched = allKru.find(k => k.nama_kru.toLowerCase().trim() === target.nama_kru.toLowerCase().trim());
      if (matched) {
        db.deleteRow('kru', matched.id);
      }
    }
    setBatches(db.getOnboardingBatches());
    setKruList(db.getTable<Kru>('kru').filter(k => k.status_aktif === 'Aktif'));
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
    catatan: string,
    updatedAbsensi?: Record<number, boolean>,
    updatedNilaiSesi?: Record<number, number>
  ) => {
    if (!activeBatch) return;
    const targetParticipant = activeBatch.peserta.find(p => p.kru_id === kruId);
    const updatedBatch: OnboardingBatch = {
      ...activeBatch,
      peserta: activeBatch.peserta.map(p => {
        if (p.kru_id === kruId) {
          return {
            ...p,
            absensi: updatedAbsensi || p.absensi,
            nilai_evaluasi: updatedNilaiSesi || p.nilai_evaluasi,
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

    // Sinkronisasi ke rekam jejak penilaian praktik resmi
    if (targetParticipant) {
      const sopName = targetParticipant.divisi === 'Kitchen'
        ? 'Nasi Putih Pulen (Miyako) & Goreng Ayam RnD'
        : targetParticipant.divisi === 'Kasir'
        ? 'SOP Kasir POS ESB & Handling Complaint LAST'
        : targetParticipant.divisi === 'Geprek'
        ? 'SOP Sambal Bawang Otentik 30g & Plating Geprek'
        : 'SOP Kebersihan Sanitasi 4 Warna Lap & K3 Outlet';

      db.insertRow<PenilaianPraktik>('penilaian_praktik', {
        tanggal: new Date().toISOString(),
        nama_kru: targetParticipant.nama_kru,
        kru_id: kruId,
        kode_outlet: targetParticipant.kode_outlet,
        sop_terkait: sopName,
        detail_skor_langkah: [3, 3, 3, 3],
        waktu_detik: targetParticipant.divisi === 'Kitchen' ? 720 : targetParticipant.divisi === 'Kasir' ? 48 : targetParticipant.divisi === 'Geprek' ? 42 : 110,
        target_detik: targetParticipant.divisi === 'Kitchen' ? 720 : targetParticipant.divisi === 'Kasir' ? 60 : targetParticipant.divisi === 'Geprek' ? 45 : 120,
        suhu_minyak: targetParticipant.divisi === 'Kitchen' ? 160 : undefined,
        gramatur: targetParticipant.divisi === 'Geprek' ? 30 : undefined,
        skor_akhir: nilaiPraktikRnD,
        catatan: catatan || `Uji Praktik Onboarding: Skor ${nilaiPraktikRnD}/100, Status: ${statusKelulusan}.`,
      });
    }

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
        category="ONBOARDING RESMI"
        title="Pusat Onboarding Terpadu HARA Chicken"
        description="Master Kurikulum Baku 10 Materi (Total 25 Jam), Database Peserta Batch (11–17 Kru), Form Penilaian Praktik Produk SOP, dan Dashboard Analitik Diagnostik Kelulusan."
        icon={<GraduationCap size={22} />}
        tabs={[
          { id: 'silabus', label: 'Silabus Kurikulum (3 Hari)', icon: BookOpen },
          { id: 'batches', label: 'Batch Kru & Peserta', icon: Users, count: batches.length },
          { id: 'penilaian', label: 'Penilaian Praktik', icon: UtensilsCrossed },
          { id: 'analyst', label: 'Analitik Onboarding', icon: BarChart3 },
        ]}
        activeTab={
          activeSubTab === 'radar_kru' || activeSubTab === 'absensi_nilai'
            ? 'batches'
            : activeSubTab
        }
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
                    <span className="ml-1.5 text-[10px] opacity-80">({b.peserta?.length || 0} Kru)</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPDF}
                disabled={!activeBatch || (activeBatch.peserta?.length || 0) === 0}
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
                      <span>Lokasi Outlet: {activeBatch.kode_outlet_lokasi}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#181411] mt-0.5">{activeBatch.nama_batch}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border w-fit ${
                      activeBatch.status === 'Selesai'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : activeBatch.status === 'Berjalan'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      Status: {activeBatch.status}
                    </span>

                    <button
                      type="button"
                      onClick={handleOpenEditBatchModal}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold border border-stone-300 transition-colors cursor-pointer"
                      title="Edit Detail Batch"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBatch(activeBatch.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                      title="Hapus Batch"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
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
                    <span className="text-[#645D55] text-[11px]">Tim Penilai Evaluasi</span>
                    <div className="font-bold text-[#181411] mt-0.5 truncate">Onboarding Team</div>
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

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setManualParticipantModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>+ Tambah Peserta Manual (Pengganti)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('radar_kru')}
                    className="w-full py-2 rounded-xl border border-[#96171B] text-[#96171B] hover:bg-red-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Tambah Peserta dari Master Kru</span>
                  </button>
                </div>
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
                      {activeBatch.peserta.map((p, pIdx) => {
                        const hadirCount = Object.values(p.absensi).filter(Boolean).length;
                        return (
                          <tr key={`${p.kru_id}-${pIdx}`} className="hover:bg-[#FAF8F5]/60 transition-colors">
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
                                  className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-[#96171B] border border-red-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                  title="Buka Form Penilaian Kru Onboarding"
                                >
                                  <Award size={12} />
                                  <span>Nilai Kru</span>
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
          SUB-TAB 3: PENILAIAN PRAKTIK PRODUK SOP
          =================================================================== */}
      {activeSubTab === 'penilaian' && (
        <div className="space-y-4">
          {/* Segmented Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-[#E6E1DA] shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAF8F5] rounded-xl border border-[#E6E1DA]">
              <button
                type="button"
                onClick={() => setPenilaianMode('produk')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  penilaianMode === 'produk'
                    ? 'bg-[#96171B] text-white shadow-xs'
                    : 'text-[#645D55] hover:text-[#181411]'
                }`}
              >
                <UtensilsCrossed size={13} />
                <span>Form Penilaian Praktik Produk SOP</span>
              </button>
              <button
                type="button"
                onClick={() => setPenilaianMode('log')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  penilaianMode === 'log'
                    ? 'bg-[#96171B] text-white shadow-xs'
                    : 'text-[#645D55] hover:text-[#181411]'
                }`}
              >
                <FileText size={13} />
                <span>Log Aktivitas Penilaian (Audit Trail)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubTab('analyst')}
              className="text-xs font-bold text-[#96171B] hover:underline flex items-center gap-1 px-3 py-1.5 cursor-pointer"
            >
              <span>Buka Analitik Onboarding</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {penilaianMode === 'produk' ? (
            <OnboardingProductPracticeView
              selectedOutletCode={selectedOutletCode}
              onOpenFullAuditLog={() => setPenilaianMode('log')}
            />
          ) : (
            <OnboardingActivityLogView
              selectedOutletCode={selectedOutletCode}
              onNavigateToPractice={() => setPenilaianMode('produk')}
            />
          )}
        </div>
      )}

      {/* ===================================================================
          SUB-TAB: RADAR KELAYAKAN KRU (DETEKSI KARYAWAN BARU 1-45 HARI)
          =================================================================== */}
      {activeSubTab === 'radar_kru' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('batches')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E6E1DA] bg-white text-xs font-bold text-[#181411] hover:bg-[#FAF8F5] transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft size={14} className="text-[#96171B]" />
              <span>Kembali ke Manajemen Batch</span>
            </button>
            <span className="text-xs text-[#645D55]">/</span>
            <span className="text-xs font-bold text-[#96171B]">Radar Kelayakan Kru (1-45 Hari)</span>
          </div>
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
                        {k.divisi} • Outlet {k.kode_outlet}
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
          SUB-TAB: ABSENSI & NILAI EVALUASI RND 16 JAM
          =================================================================== */}
      {activeSubTab === 'absensi_nilai' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('batches')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E6E1DA] bg-white text-xs font-bold text-[#181411] hover:bg-[#FAF8F5] transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft size={14} className="text-[#96171B]" />
              <span>Kembali ke Manajemen Batch</span>
            </button>
            <span className="text-xs text-[#645D55]">/</span>
            <span className="text-xs font-bold text-[#96171B]">Matriks Absensi 10 Sesi & Uji Praktik</span>
          </div>
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
                Batch: {activeBatch?.nomor_batch} ({(activeBatch?.peserta?.length || 0)} Peserta)
              </div>
            </div>

            {(!activeBatch || (activeBatch?.peserta?.length || 0) === 0) ? (
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
                    {(activeBatch?.peserta || []).map((p, pIdx) => (
                      <tr key={`${p.kru_id}-${pIdx}`} className="hover:bg-[#FAF8F5]/60 transition-colors">
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
                            className="px-2 py-0.5 rounded-lg bg-red-50 text-[#96171B] border border-red-200 text-[10px] font-bold hover:bg-red-100 transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Buka Form Penilaian Kru Onboarding"
                          >
                            <Award size={10} />
                            <span>{p.status_kelulusan}</span>
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
          SUB-TAB 1: MASTER SILABUS KURIKULUM BAKU 3 HARI (10 SESI - 25 JAM)
          =================================================================== */}
      {activeSubTab === 'silabus' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] space-y-6">
            <div>
              <h3 className="font-bold text-[#181411]">
                Silabus Resmi Onboarding & Retraining Kru HARA Chicken Indonesia
              </h3>
              <p className="text-xs text-[#645D55] mt-0.5">
                Standarisasi 10 materi kurikulum (Total 25 Jam) dipandu oleh manajemen multidisiplin outlet
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
          SUB-TAB 4: ANALITIK DIAGNOSTIK ONBOARDING MULTI-PERIODE
          =================================================================== */}
      {activeSubTab === 'analyst' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-[#E6E1DA] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-[#181411]">
                Dashboard Analitik Diagnostik & Evaluasi Kesiapan Kerja Kru
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab('penilaian');
                setPenilaianMode('produk');
              }}
              className="text-xs font-bold text-[#96171B] hover:underline flex items-center gap-1 px-3 py-1.5 cursor-pointer"
            >
              <span>← Buka Form Penilaian Praktik</span>
            </button>
          </div>

          <OnboardingAnalyticsDashboard
            initialOutletCode={selectedOutletCode}
            onSelectProductForPractice={() => {
              setActiveSubTab('penilaian');
              setPenilaianMode('produk');
            }}
          />
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
                  <label className="block font-semibold text-[#181411] mb-1">Lokasi Outlet Pelatihan</label>
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
          MODAL: EVALUASI KOMPREHENSIF KRU ONBOARDING (SESI, RND, SUHU & TIMER ADAPTIF)
          =================================================================== */}
      <AnimatePresence>
        {evaluationModalParticipant && (
          <OnboardingEvaluationComprehensiveModal
            batch={evaluationModalParticipant.batch}
            participant={evaluationModalParticipant.participant}
            onClose={() => setEvaluationModalParticipant(null)}
            onSave={(rndScore, surveyVal, statusVal, catatanVal, absensiMap, nilaiSesiMap) => {
              handleSaveEvaluation(
                evaluationModalParticipant.participant.kru_id,
                rndScore,
                surveyVal,
                statusVal,
                catatanVal,
                absensiMap,
                nilaiSesiMap
              );
            }}
          />
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

      {/* ===================================================================
          MODAL: TAMBAH PESERTA MANUAL (PENGGANTI)
          =================================================================== */}
      {manualParticipantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-md w-full overflow-hidden text-[#181411]">
            <div className="p-4 border-b border-[#E6E1DA] flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-sm text-[#181411]">Tambah Peserta Manual (Pengganti)</h3>
              <button
                type="button"
                onClick={() => setManualParticipantModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveManualParticipant} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#645D55] mb-1">Nama Lengkap Kru Peserta:</label>
                <input
                  type="text"
                  required
                  value={manualNama}
                  onChange={(e) => setManualNama(e.target.value)}
                  placeholder="Ketik nama lengkap..."
                  className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-semibold text-[#181411]"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#645D55] mb-1">Outlet Tujuan:</label>
                  <input
                    type="text"
                    required
                    value={manualOutlet}
                    onChange={(e) => setManualOutlet(e.target.value)}
                    placeholder="Contoh: Gito Gati, Monjali"
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-semibold text-[#181411]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#645D55] mb-1">Divisi:</label>
                  <select
                    value={manualDivisi}
                    onChange={(e) => setManualDivisi(e.target.value as Division)}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-semibold text-[#181411] bg-white"
                  >
                    <option value="Kitchen">Kitchen</option>
                    <option value="Kasir">Kasir</option>
                    <option value="Geprek">Geprek</option>
                    <option value="Helper">Helper</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#645D55] mb-1">Tipe Status:</label>
                <select
                  value={manualTipe}
                  onChange={(e) => setManualTipe(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-semibold text-[#181411] bg-white"
                >
                  <option value="Karyawan Baru (1-45 Hari)">Karyawan Baru (1-45 Hari)</option>
                  <option value="Retraining Karyawan Lama">Retraining Karyawan Lama</option>
                </select>
              </div>
              <div className="pt-3 border-t border-[#E6E1DA] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManualParticipantModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6E1DA] text-stone-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#96171B] text-white font-bold cursor-pointer"
                >
                  Simpan Peserta (Auto Simpan ke Master Kru)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: EDIT BATCH ONBOARDING
          =================================================================== */}
      {editBatchModalOpen && editingBatchObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-lg w-full overflow-hidden text-[#181411]">
            <div className="p-4 border-b border-[#E6E1DA] flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-sm text-[#181411]">Edit Batch Onboarding</h3>
              <button
                type="button"
                onClick={() => setEditBatchModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveEditedBatch} className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#645D55] mb-1">Nomor Batch:</label>
                  <input
                    type="text"
                    value={editingBatchObj.nomor_batch || ''}
                    onChange={(e) => setEditingBatchObj({ ...editingBatchObj, nomor_batch: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#645D55] mb-1">Status Batch:</label>
                  <select
                    value={editingBatchObj.status || 'Berjalan'}
                    onChange={(e) => setEditingBatchObj({ ...editingBatchObj, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-bold bg-white"
                  >
                    <option value="Direncanakan">Direncanakan</option>
                    <option value="Berjalan">Berjalan</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#645D55] mb-1">Nama Batch:</label>
                <input
                  type="text"
                  value={editingBatchObj.nama_batch || ''}
                  onChange={(e) => setEditingBatchObj({ ...editingBatchObj, nama_batch: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#645D55] mb-1">Tanggal Mulai:</label>
                  <input
                    type="date"
                    value={editingBatchObj.tanggal_mulai || ''}
                    onChange={(e) => setEditingBatchObj({ ...editingBatchObj, tanggal_mulai: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#645D55] mb-1">Tanggal Selesai:</label>
                  <input
                    type="date"
                    value={editingBatchObj.tanggal_selesai || ''}
                    onChange={(e) => setEditingBatchObj({ ...editingBatchObj, tanggal_selesai: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#645D55] mb-1">Lokasi Training TC:</label>
                <input
                  type="text"
                  value={editingBatchObj.kode_outlet_lokasi || 'Kantor Lempongsari'}
                  onChange={(e) => setEditingBatchObj({ ...editingBatchObj, kode_outlet_lokasi: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-bold bg-stone-50"
                />
              </div>
              <div className="pt-3 border-t border-[#E6E1DA] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditBatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6E1DA] text-stone-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#96171B] text-white font-bold cursor-pointer"
                >
                  Simpan Perubahan Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: KONFIRMASI HAPUS BATCH (SAFE FOR IFRAME)
          =================================================================== */}
      <AnimatePresence>
        {deleteBatchTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-sm w-full p-5 space-y-4 text-xs text-[#181411]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
                <h3 className="font-bold text-sm text-[#96171B] flex items-center gap-1.5">
                  <Trash2 size={16} />
                  <span>Hapus Batch Pelatihan?</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setDeleteBatchTarget(null)}
                  className="text-[#645D55] hover:text-[#181411]"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-[#645D55] leading-relaxed">
                Apakah Anda yakin ingin menghapus kelas <strong>"{deleteBatchTarget.nama_batch}"</strong> ({deleteBatchTarget.nomor_batch})?
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
                <div>• Data peserta tetap aman dan tersimpan di Master Kru.</div>
                <div>• Tindakan ini akan menghapus batch dari daftar lokal dan cloud.</div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteBatchTarget(null)}
                  className="px-4 py-2 rounded-xl border border-[#E6E1DA] text-stone-600 font-bold hover:bg-stone-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteBatch}
                  className="px-4 py-2 rounded-xl bg-[#96171B] hover:bg-[#7A1216] text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Ya, Hapus Batch
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

interface OnboardingEvaluationModalProps {
  batch: OnboardingBatch;
  participant: OnboardingParticipant;
  onClose: () => void;
  onSave: (
    rndScore: number,
    surveyVal: number,
    statusVal: 'Lulus' | 'Remedial' | 'Sedang Berjalan',
    catatanVal: string,
    absensiMap: Record<number, boolean>,
    nilaiSesiMap: Record<number, number>
  ) => void;
}

const OnboardingEvaluationComprehensiveModal: React.FC<OnboardingEvaluationModalProps> = ({
  batch,
  participant,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'praktik_rnd' | 'checklist_sesi' | 'rekap'>('praktik_rnd');
  const [rndScore, setRndScore] = useState<number>(participant.nilai_praktik_rnd || 90);
  const [surveyVal, setSurveyVal] = useState<number>(participant.survey_kepuasan || 5);
  const [statusVal, setStatusVal] = useState<'Lulus' | 'Remedial' | 'Sedang Berjalan'>(participant.status_kelulusan || 'Lulus');
  const [catatanVal, setCatatanVal] = useState<string>(
    participant.catatan || `Kru telah menyelesaikan uji praktik RnD dan kurikulum onboarding sesuai standar baku SOP ${participant.divisi}.`
  );

  // 10 Sessions attendance and scores
  const [absensiMap, setAbsensiMap] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {
      1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true,
    };
    return { ...initial, ...(participant.absensi || {}) };
  });

  const [nilaiSesiMap, setNilaiSesiMap] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {
      1: 90, 2: 90, 3: 88, 4: 90, 5: 90, 6: 88, 7: 92, 8: 92, 9: 92, 10: 95,
    };
    return { ...initial, ...(participant.nilai_evaluasi || {}) };
  });

  const isKitchen = participant.divisi === 'Kitchen';
  const isKasir = participant.divisi === 'Kasir';
  const isGeprek = participant.divisi === 'Geprek';
  const isHelper = participant.divisi === 'Helper';

  const [nasiMiyakoCupOk, setNasiMiyakoCupOk] = useState(true);
  const [timerToleransiOk, setTimerToleransiOk] = useState(true);
  const [suhuTermalOk, setSuhuTermalOk] = useState(true);
  const [higienitasOk, setHigienitasOk] = useState(true);

  const toggleAllAttendance = () => {
    const next: Record<number, boolean> = {};
    for (let i = 1; i <= 10; i++) {
      next[i] = true;
    }
    setAbsensiMap(next);
  };

  const handleSave = () => {
    onSave(rndScore, surveyVal, statusVal, catatanVal, absensiMap, nilaiSesiMap);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl border border-[#E6E1DA] shadow-2xl max-w-2xl w-full my-6 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 to-[#181411] text-white flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#96171B] text-white text-[10px] font-bold uppercase tracking-wider">
                {batch.nomor_batch}
              </span>
              <span className="text-stone-300 text-[11px]">
                {participant.tipe} • {participant.hari_kerja} Hari Kerja
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <span>{participant.nama_kru}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-white/10 text-stone-200">
                Divisi {participant.divisi}
              </span>
            </h3>
            <p className="text-xs text-stone-300">
              Form Penilaian Komprehensif: Uji Praktik RnD 16 Jam, Parameter Suhu & Timer Adaptif, serta 10 Sesi Baku.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#E6E1DA] bg-[#FAF8F5] px-4 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('praktik_rnd')}
            className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'praktik_rnd'
                ? 'border-[#96171B] text-[#96171B] font-black'
                : 'border-transparent text-[#645D55] hover:text-[#181411]'
            }`}
          >
            <Wrench size={14} />
            <span>1. Uji Praktik RnD Adaptif</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checklist_sesi')}
            className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'checklist_sesi'
                ? 'border-[#96171B] text-[#96171B] font-black'
                : 'border-transparent text-[#645D55] hover:text-[#181411]'
            }`}
          >
            <BookOpen size={14} />
            <span>2. Checklist 10 Sesi Baku</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rekap')}
            className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'rekap'
                ? 'border-[#96171B] text-[#96171B] font-black'
                : 'border-transparent text-[#645D55] hover:text-[#181411]'
            }`}
          >
            <Award size={14} />
            <span>3. Skor & Rekomendasi</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* TAB 1: UJI PRAKTIK RND ADAPTIF */}
          {activeTab === 'praktik_rnd' && (
            <div className="space-y-4">
              {/* Standar Nasi: Rasio Cup Miyako (Bukan Ditimbang Gram) */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale size={16} className="text-amber-800" />
                    <span className="font-bold text-amber-900 text-xs">
                      Standar Nasi Putih: Rasio Cup Miyako & Centong Standar
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-amber-900 border border-amber-200">
                    SOP Anti-Plenger
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Sesuai standar operasional HARA Chicken, nasi <strong>tidak lagi ditimbang gram di piring saji</strong> saat jam operasional sibuk. Penilaian difokuskan pada:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                  <label className="flex items-start gap-2 p-2 bg-white rounded-xl border border-amber-200/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nasiMiyakoCupOk}
                      onChange={(e) => setNasiMiyakoCupOk(e.target.checked)}
                      className="mt-0.5 accent-[#96171B]"
                    />
                    <span className="text-stone-800">
                      <strong>Rasio Air & Beras Miyako Tepat:</strong> 3:4, 4:5, 5:6, max 6:8 cup air.
                    </span>
                  </label>
                  <label className="flex items-start gap-2 p-2 bg-white rounded-xl border border-amber-200/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={timerToleransiOk}
                      onChange={(e) => setTimerToleransiOk(e.target.checked)}
                      className="mt-0.5 accent-[#96171B]"
                    />
                    <span className="text-stone-800">
                      <strong>Timer Tanak 15 Menit & Centong Standar:</strong> Didiamkan 15 mnt, saji 1 centong bulat rapi.
                    </span>
                  </label>
                </div>
              </div>

              {/* Suhu Kondisional: Termal vs Non-Termal */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isKitchen
                  ? 'bg-rose-50/60 border-rose-200'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer size={16} className={isKitchen ? 'text-[#96171B]' : 'text-slate-500'} />
                    <span className="font-bold text-[#181411] text-xs">
                      {isKitchen
                        ? 'Pengukuran Suhu Termal (Deep Fryer 160°C ± 5°C)'
                        : 'Pengukuran Suhu: Non-Termal / N/A (Bebas Probe)'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isKitchen
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}>
                    {isKitchen ? 'Wajib Termal' : 'Bebas Probe Termometer'}
                  </span>
                </div>
                {isKitchen ? (
                  <div className="space-y-1.5 text-[11px] text-stone-700">
                    <p>
                      Khusus station Kitchen (Deep Fryer), setelan kompor 175°C, minyak masuk ayam 160°C (toleransi 155°C–165°C), dan suhu inti ayam matang ≥ 74°C.
                    </p>
                    <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-rose-200 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={suhuTermalOk}
                        onChange={(e) => setSuhuTermalOk(e.target.checked)}
                        className="accent-[#96171B]"
                      />
                      <span>Suhu minyak fryer stabil 160°C dan core temperature ayam terverifikasi matang aman.</span>
                    </label>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Divisi <strong>{participant.divisi}</strong> tidak menggunakan deep fryer/kompor masak utama. Penilaian berfokus pada kecepatan transaksi, hospitality, takaran uleg cobek, atau sanitasi 4 warna lap tanpa probe suhu.
                  </p>
                )}
              </div>

              {/* Timer Adaptif (Toleransi Wajar, Tidak Kaku) */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-emerald-700" />
                    <span className="font-bold text-emerald-900 text-xs">
                      Timer Adaptif & Toleransi Waktu Operasional
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-200">
                    Fleksibel Bertoleransi
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Timer tidak kaku di angka mati detik, melainkan disesuaikan dengan <strong>Agenda Resmi Training Center HARA Chicken</strong>:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-stone-700">
                  <div className="p-2 bg-white rounded-xl border border-emerald-200">
                    <div className="font-bold text-stone-900">Nasi 4 Cup (Miyako)</div>
                    <div className="text-[10px] text-stone-500 font-mono">35–45 Mnt (Toleransi ±5m)</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-200">
                    <div className="font-bold text-stone-900">Goreng Ayam (Fryer)</div>
                    <div className="text-[10px] text-stone-500 font-mono">20 Mnt (Toleransi 18–22m)</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-200">
                    <div className="font-bold text-stone-900">Geprek Ori Cobek</div>
                    <div className="text-[10px] text-stone-500 font-mono">2 Mnt (Toleransi 90–150s)</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-200">
                    <div className="font-bold text-stone-900">Goreng Kulit / Terong</div>
                    <div className="text-[10px] text-stone-500 font-mono">45 Mnt / 25 Mnt</div>
                  </div>
                </div>
                <div className="text-[10.5px] text-emerald-900 font-medium bg-white/80 p-2 rounded-xl border border-emerald-200">
                  Batch 1: <strong>40 Mnt</strong> • Batch 2: <strong>30–40 Mnt</strong> • Tambahan Waktu Final: <strong>20–25 Mnt</strong> • Bersih-bersih: <strong>30–40 Mnt</strong>
                </div>
              </div>

              {/* Rubrik Kriteria Spesifik Divisi */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-2.5">
                <div className="font-bold text-[#181411]">
                  Parameter Kritis Divisi {participant.divisi}:
                </div>
                {isKitchen && (
                  <div className="space-y-1 text-[11px] text-[#645D55]">
                    <div>• 2x penepungan (dusting cubit ringan agar keriting mekar).</div>
                    <div>• Goyangkan keranjang deep fryer setiap 3 menit sekali.</div>
                    <div>• Tiriskan minyak dengan jepitan ke warmer (dilarang menuang langsung).</div>
                  </div>
                )}
                {isKasir && (
                  <div className="space-y-1 text-[11px] text-[#645D55]">
                    <div>• Standar greeting 3S (Senyum, Salam, Sapa) ramah &lt; 3 detik.</div>
                    <div>• Penanganan komplain customer dengan metode L.A.S.T (Listen, Apologize, Solve, Thank).</div>
                    <div>• Rekonsiliasi kas shift zero minus pada mesin POS ESB.</div>
                  </div>
                )}
                {isGeprek && (
                  <div className="space-y-1 text-[11px] text-[#645D55]">
                    <div>• Takaran sambal bawang cobek batu 30 gram konsisten.</div>
                    <div>• Siraman minyak bawang panas wangi merata pada cabai rawit merah.</div>
                    <div>• Tekstur ulek kasar alami & garnish 2 slice timun miring 45 derajat rapi.</div>
                  </div>
                )}
                {isHelper && (
                  <div className="space-y-1 text-[11px] text-[#645D55]">
                    <div>• Disiplin pemisahan 4 warna lap resmi (Kanebo, Oranye, Microfiber, Serbet).</div>
                    <div>• Sanitasi area cuci piring & pembersihan rutin saringan grease trap.</div>
                    <div>• Pemahaman APAR P.A.S.S dan keselamatan kerja K3.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CHECKLIST 10 SESI BAKU */}
          {activeTab === 'checklist_sesi' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
                <div>
                  <h4 className="font-bold text-[#181411]">Kehadiran & Nilai 10 Sesi Materi (Total 25 Jam)</h4>
                  <p className="text-[11px] text-[#645D55]">Klik checklist untuk mencatat kehadiran per sesi kurikulum resmi.</p>
                </div>
                <button
                  type="button"
                  onClick={toggleAllAttendance}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-all flex items-center gap-1"
                >
                  <CheckCircle2 size={13} />
                  <span>Hadir Semua (10 Sesi)</span>
                </button>
              </div>

              <div className="space-y-2">
                {MASTER_KURIKULUM_3HARI.map((sesi) => {
                  const isPresent = !!absensiMap[sesi.no];
                  const currentScore = nilaiSesiMap[sesi.no] || 90;
                  return (
                    <div
                      key={sesi.no}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isPresent ? 'bg-white border-[#E6E1DA]' : 'bg-[#FAF8F5] border-dashed border-[#E6E1DA] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setAbsensiMap({ ...absensiMap, [sesi.no]: !isPresent })}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                            isPresent
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-[#E6E1DA] text-transparent hover:border-[#96171B]'
                          }`}
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                        <div>
                          <div className="font-bold text-[#181411] flex items-center gap-1.5">
                            <span>Sesi #{sesi.no}: {sesi.judul}</span>
                            <span className="text-[10px] text-[#645D55]">({sesi.durasi_jam} Jam)</span>
                          </div>
                          <div className="text-[10px] text-[#645D55] mt-0.5">
                            Hari Ke-{sesi.hari} • Trainer: {sesi.trainer_role} • Evaluasi: {sesi.evaluasi}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-[#645D55]">Nilai:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={currentScore}
                          onChange={(e) => setNilaiSesiMap({ ...nilaiSesiMap, [sesi.no]: Number(e.target.value) })}
                          disabled={!isPresent}
                          className="w-14 p-1 text-center font-mono font-bold rounded-lg border border-[#E6E1DA] text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: REKAP SKOR & REKOMENDASI KELULUSAN */}
          {activeTab === 'rekap' && (
            <div className="space-y-4">
              {/* Nilai Praktik RnD 16 Jam */}
              <div className="p-4 rounded-2xl bg-white border border-[#E6E1DA] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold text-[#181411] block">
                      Skor Uji Praktik RnD 16 Jam (Skala 0 - 100)
                    </label>
                    <p className="text-[11px] text-[#645D55]">
                      Mencakup pengujian praktik Hari 2 (8 Jam) & Hari 3 (8 Jam).
                    </p>
                  </div>
                  <span className="font-mono text-lg font-black text-[#96171B] bg-red-50 px-3 py-1 rounded-xl border border-red-200">
                    {rndScore} pt
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={rndScore}
                  onChange={(e) => setRndScore(Number(e.target.value))}
                  className="w-full accent-[#96171B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#645D55] font-mono">
                  <span>50 (Remedial)</span>
                  <span className="font-bold text-[#96171B]">75 (Batas KKM)</span>
                  <span>90 (Mahir)</span>
                  <span className="font-bold text-emerald-700">100 (Sempurna)</span>
                </div>
                <div className="flex gap-2 pt-1">
                  {[85, 90, 93, 95].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRndScore(preset)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold ${
                        rndScore === preset
                          ? 'bg-[#96171B] text-white border-[#96171B]'
                          : 'bg-[#FAF8F5] text-[#181411] border-[#E6E1DA] hover:bg-slate-100'
                      }`}
                    >
                      Preset {preset} pt
                    </button>
                  ))}
                </div>
              </div>

              {/* Survey Kepuasan & Kelulusan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-[#E6E1DA] space-y-1.5">
                  <label className="font-bold text-[#181411] block">
                    Survey Kepuasan Karyawan (1-5 Bintang)
                  </label>
                  <select
                    value={surveyVal}
                    onChange={(e) => setSurveyVal(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs font-semibold"
                  >
                    <option value={5}>★★★★★ 5 Bintang (Sangat Puas & Termotivasi)</option>
                    <option value={4}>★★★★☆ 4 Bintang (Puas & Paham Standar)</option>
                    <option value={3}>★★★☆☆ 3 Bintang (Cukup)</option>
                    <option value={2}>★★☆☆☆ 2 Bintang (Kurang Paham)</option>
                    <option value={1}>★☆☆☆☆ 1 Bintang (Perlu Refreshment Ulang)</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#E6E1DA] space-y-1.5">
                  <label className="font-bold text-[#181411] block">
                    Status Kelulusan Akhir
                  </label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs font-bold"
                  >
                    <option value="Lulus">Lulus (Tersertifikasi Onboarding Penuh)</option>
                    <option value="Sedang Berjalan">Sedang Berjalan (Belum Selesai)</option>
                    <option value="Remedial">Remedial (Perlu Praktik Ulang)</option>
                  </select>
                </div>
              </div>

              {/* Catatan Trainer */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#E6E1DA] space-y-1.5">
                <label className="font-bold text-[#181411] block">
                  Catatan Evaluasi Resmi Lead Trainer
                </label>
                <textarea
                  rows={3}
                  value={catatanVal}
                  onChange={(e) => setCatatanVal(e.target.value)}
                  placeholder="Catatan perkembangan khusus kompetensi kru..."
                  className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs text-[#181411]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#E6E1DA] flex items-center justify-between gap-3">
          <div className="text-[11px] text-[#645D55]">
            Penilaian akan otomatis disinkronkan ke Rekap Nilai Batch dan Log Praktik Resmi.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E6E1DA] text-[#645D55] text-xs font-semibold hover:bg-slate-100 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#96171B] hover:bg-[#7A1216] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Simpan & Terbitkan Hasil Penilaian</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

