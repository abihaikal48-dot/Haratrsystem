import React, { useState, useEffect, useMemo } from 'react';
import {
  UtensilsCrossed, Clock, CheckCircle2, AlertTriangle, Play,
  Pause, RotateCcw, Award, FileText, Search,
  Filter, Check, X, ShieldAlert,
  Info, ShieldCheck, User, Users, Store, Zap, RefreshCw,
  Thermometer, Scale, BookOpen, Plus,
  Edit2, Layers, HelpCircle, Eye, Printer, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../lib/storage';
import {
  Kru, Outlet, Division, OnboardingBatch,
  PenilaianPraktikOnboardingProduk
} from '../../types';
import { exportPenilaianPraktikProdukPDF } from '../../lib/pdfGenerator';
import {
  HARA_ONBOARDING_PRODUCTS_MASTER,
  OnboardingProductItem
} from '../../data/haraOnboardingProducts';
import { MiniCertificateModal } from './MiniCertificateModal';
import { CrewOnboardingReportModal } from './CrewOnboardingReportModal';

interface OnboardingProductPracticeViewProps {
  selectedOutletCode: string;
  onOpenFullAuditLog?: () => void;
}

export type SOPProductItem = OnboardingProductItem;
export const OFFICIAL_STATION_PRODUCTS = HARA_ONBOARDING_PRODUCTS_MASTER;
export const SOP_PRODUCTS_LIST = HARA_ONBOARDING_PRODUCTS_MASTER.map(p => ({
  nama: p.nama,
  kode: p.kode,
  day: p.day,
  station: p.station,
  divisi: p.divisi,
  stdDetik: p.stdDetik,
  isDeepFryer: p.requiresOilTemp,
  targetSuhuMinyak: p.targetSuhuMinyak,
  desc: p.deskripsi
}));

export const KEBERSIHAN_INDICATORS = [
  { id: 'keb-1', label: 'Grooming lengkap & bersih (apron rapi, hairnet/topi, name tag, sepatu hitam tertutup)', poin: 17 },
  { id: 'keb-2', label: 'Cuci tangan 6 langkah dengan sabun & hand sanitizer sebelum dan sesudah menyentuh bahan', poin: 17 },
  { id: 'keb-3', label: 'Sanitasi alat & timbangan (bersih dari remahan sisa, pisau/solet steril)', poin: 17 },
  { id: 'keb-4', label: 'Disiplin pemisahan 4 warna lap HARA (merah mentah, kuning masak, biru meja, putih tangan)', poin: 17 },
  { id: 'keb-5', label: 'Clean As You Go (meja kerja selalu bersih kering selama proses dan setelah praktik)', poin: 16 },
  { id: 'keb-6', label: 'Penyimpanan bahan baku tertutup rapat, prinsip FIFO, & stiker label tanggal/jam terpasang', poin: 16 },
];

export const KERJASAMA_INDICATORS = [
  { id: 'ker-1', label: 'Komunikasi operasional jelas, lantang, dan tanggap calling "Yes Chef / Siap"', poin: 17 },
  { id: 'ker-2', label: 'Koordinasi handover antar stasiun kerja rapi tanpa menghambat ritme kitchen', poin: 17 },
  { id: 'ker-3', label: 'Inisiatif saling membantu rekan kerja ketika ada stasiun yang sedang overload antrean', poin: 17 },
  { id: 'ker-4', label: 'Disiplin keselamatan kerja K3 (hati-hati minyak panas, api kompor, & pisau tajam)', poin: 17 },
  { id: 'ker-5', label: 'Menerima instruksi, evaluasi, dan koreksi dari trainer secara terbuka dan solutif', poin: 16 },
  { id: 'ker-6', label: 'Manajemen stres & ketenangan sikap menghadapi pesanan dalam waktu terbatas', poin: 16 },
];

export const DAFTAR_PENILAI_DEFAULT = [
  'Haikal',
  'Jihan',
  'Feri',
  'Ari',
  'Administrator HQ'
];

export interface AssessmentSessionTab {
  id: string;
  kruId: string;
  namaKru: string;
  isManualName: boolean;
  manualNameInput: string;
  outletCode: string;
  day: 'Day 1' | 'Day 2';
  batch: 'Batch 1' | 'Batch 2' | 'All Batch';
  station: 'Station 1' | 'Station 2' | 'Station 3' | 'All Crew';
  productNama: string;
  timerSeconds: number;
  isTimerRunning: boolean;
  suhuMinyakProbe: number;
  gramaturAktual: number;
  stepChecklist: { nomor: number; langkah: string; tercapai: boolean; isKritis?: boolean }[];
  kebersihanChecked: Record<string, boolean>;
  kerjasamaChecked: Record<string, boolean>;
  knowledgeAnswers: Record<number, boolean>;
  skorKnowledge: number;
  catatanTrainer: string;
  isSaved?: boolean;
}

export const OnboardingProductPracticeView: React.FC<OnboardingProductPracticeViewProps> = ({
  selectedOutletCode,
  onOpenFullAuditLog,
}) => {
  // Master lists
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [batches, setBatches] = useState<OnboardingBatch[]>([]);

  // Penilai Globals
  const [namaPenilai, setNamaPenilai] = useState<string>(DAFTAR_PENILAI_DEFAULT[0]);
  const [customPenilai, setCustomPenilai] = useState<string>('');
  const [isCustomPenilai, setIsCustomPenilai] = useState<boolean>(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');
  const [tanggalUji, setTanggalUji] = useState<string>(new Date().toISOString().split('T')[0]);

  // Concurrent Multi-Candidate Sessions
  const [sessions, setSessions] = useState<AssessmentSessionTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');

  // Searchable Product Picker Modal State
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [pickerDayFilter, setPickerDayFilter] = useState<'ALL' | 'Day 1' | 'Day 2'>('ALL');
  const [pickerStationFilter, setPickerStationFilter] = useState<string>('ALL');

  // Certificate and Report Modals
  const [certificateData, setCertificateData] = useState<{
    kruNama: string;
    kodeOutlet: string;
    batchName: string;
    skorAkhir: number;
    statusKelulusan: string;
    trainerNama: string;
  } | null>(null);

  const [crewReportModalKru, setCrewReportModalKru] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Helper to initialize steps for a product
  const getInitialStepsForProduct = (productName: string) => {
    const pDef = HARA_ONBOARDING_PRODUCTS_MASTER.find(p => p.nama === productName) || HARA_ONBOARDING_PRODUCTS_MASTER[0];
    return pDef.langkahSOP.map(s => ({
      nomor: s.nomor,
      langkah: s.teks,
      tercapai: true,
      isKritis: s.isKritis
    }));
  };

  // Helper to create a new session
  const createNewSession = (initialKru?: Kru, defaultProduct?: string): AssessmentSessionTab => {
    const prodName = defaultProduct || 'Nasi (Rice Cooker 4 Cup D1)';
    const prodDef = HARA_ONBOARDING_PRODUCTS_MASTER.find(p => p.nama === prodName) || HARA_ONBOARDING_PRODUCTS_MASTER[0];
    const newId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    return {
      id: newId,
      kruId: initialKru?.id || (kruList[0]?.id ?? 'manual-1'),
      namaKru: initialKru?.nama_kru || (kruList[0]?.nama_kru ?? 'Peserta Praktik 1'),
      isManualName: false,
      manualNameInput: '',
      outletCode: initialKru?.kode_outlet || (selectedOutletCode !== 'ALL' ? selectedOutletCode : 'HC-BTL01'),
      day: prodDef.day,
      batch: prodDef.batch,
      station: prodDef.station,
      productNama: prodDef.nama,
      timerSeconds: 0,
      isTimerRunning: false,
      suhuMinyakProbe: prodDef.targetSuhuMinyak || 160,
      gramaturAktual: prodDef.targetGramatur || 0,
      stepChecklist: getInitialStepsForProduct(prodDef.nama),
      kebersihanChecked: {
        'keb-1': true, 'keb-2': true, 'keb-3': true, 'keb-4': true, 'keb-5': true, 'keb-6': true
      },
      kerjasamaChecked: {
        'ker-1': true, 'ker-2': true, 'ker-3': true, 'ker-4': true, 'ker-5': true, 'ker-6': true
      },
      knowledgeAnswers: { 0: true, 1: true, 2: true },
      skorKnowledge: 100,
      catatanTrainer: '',
      isSaved: false,
    };
  };

  // Database Load
  const refreshData = () => {
    const k = db.getTable<Kru>('kru').filter(k => k.status_aktif === 'Aktif');
    const o = db.getTable<Outlet>('outlets');
    const b = db.getOnboardingBatches();

    setKruList(k);
    setOutlets(o);
    setBatches(b);

    setSessions(prev => {
      if (prev.length === 0) {
        const init = createNewSession(k[0]);
        setActiveTabId(init.id);
        return [init];
      }
      return prev;
    });
  };

  useEffect(() => {
    refreshData();
    const unsub = db.subscribe('*', refreshData);
    return () => unsub();
  }, []);

  // Concurrent Background Stopwatch Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions(prevSessions => {
        let changed = false;
        const nextSessions = prevSessions.map(sess => {
          if (sess.isTimerRunning) {
            changed = true;
            return {
              ...sess,
              timerSeconds: sess.timerSeconds + 1,
            };
          }
          return sess;
        });
        return changed ? nextSessions : prevSessions;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Current active session
  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeTabId) || sessions[0] || null;
  }, [sessions, activeTabId]);

  // Current product definition for active session
  const currentProductDef = useMemo(() => {
    if (!activeSession) return HARA_ONBOARDING_PRODUCTS_MASTER[0];
    return HARA_ONBOARDING_PRODUCTS_MASTER.find(p => p.nama === activeSession.productNama) || HARA_ONBOARDING_PRODUCTS_MASTER[0];
  }, [activeSession?.productNama]);

  // Update a field in the active session
  const updateActiveSession = (updates: Partial<AssessmentSessionTab>) => {
    if (!activeSession) return;
    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSession.id) {
          return { ...s, ...updates, isSaved: false };
        }
        return s;
      })
    );
  };

  // Select Product from Search Drawer
  const handleSelectProduct = (product: OnboardingProductItem) => {
    updateActiveSession({
      productNama: product.nama,
      day: product.day,
      batch: product.batch,
      station: product.station,
      suhuMinyakProbe: product.targetSuhuMinyak || 160,
      gramaturAktual: product.targetGramatur || 0,
      stepChecklist: getInitialStepsForProduct(product.nama),
      knowledgeAnswers: { 0: true, 1: true, 2: true },
      skorKnowledge: 100,
      timerSeconds: 0,
      isTimerRunning: false,
    });
    setIsProductPickerOpen(false);
    showToast(`Produk diganti ke: ${product.nama} (${product.stationLabel})`);
  };

  // Add new concurrent session tab
  const handleAddNewSession = () => {
    const activeKruIds = sessions.map(s => s.kruId);
    const candidateKru = kruList.find(k => !activeKruIds.includes(k.id)) || kruList[0];
    const newSess = createNewSession(candidateKru);
    setSessions(prev => [...prev, newSess]);
    setActiveTabId(newSess.id);
    showToast(`Tab kru baru dibuka (${newSess.namaKru}). Siap dinilai simultan.`);
  };

  // Close a session tab
  const handleCloseSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      showToast('Minimal harus ada 1 sesi penilaian aktif.');
      return;
    }
    const target = sessions.find(s => s.id === sessionId);
    if (!target?.isSaved && target && (target.timerSeconds > 0 || target.isTimerRunning)) {
      if (!confirm(`Sesi untuk ${target.namaKru} sedang berjalan / belum disimpan. Tetap tutup tab ini?`)) {
        return;
      }
    }
    const remaining = sessions.filter(s => s.id !== sessionId);
    setSessions(remaining);
    if (activeTabId === sessionId) {
      setActiveTabId(remaining[0].id);
    }
  };

  // Toggle checklist step
  const handleToggleStep = (nomor: number) => {
    if (!activeSession) return;
    const nextSteps = activeSession.stepChecklist.map(s => {
      if (s.nomor === nomor) return { ...s, tercapai: !s.tercapai };
      return s;
    });
    updateActiveSession({ stepChecklist: nextSteps });
  };

  // Toggle Kebersihan indicator
  const handleToggleKebersihan = (id: string) => {
    if (!activeSession) return;
    const nextVal = !activeSession.kebersihanChecked[id];
    updateActiveSession({
      kebersihanChecked: { ...activeSession.kebersihanChecked, [id]: nextVal }
    });
  };

  // Toggle Kerjasama indicator
  const handleToggleKerjasama = (id: string) => {
    if (!activeSession) return;
    const nextVal = !activeSession.kerjasamaChecked[id];
    updateActiveSession({
      kerjasamaChecked: { ...activeSession.kerjasamaChecked, [id]: nextVal }
    });
  };

  // Toggle Knowledge oral question answer
  const handleToggleKnowledgeQuestion = (idx: number, passed: boolean) => {
    if (!activeSession) return;
    const nextAnswers = { ...activeSession.knowledgeAnswers, [idx]: passed };
    const totalQ = currentProductDef.autoQuestions.length;
    let passedCount = 0;
    for (let i = 0; i < totalQ; i++) {
      if (nextAnswers[i] ?? true) passedCount++;
    }
    const calculatedKnowledgeScore = totalQ > 0 ? Math.round((passedCount / totalQ) * 100) : 100;
    updateActiveSession({
      knowledgeAnswers: nextAnswers,
      skorKnowledge: calculatedKnowledgeScore,
    });
  };

  // Realtime Live Calculations for Active Session
  const calculatedScores = useMemo(() => {
    if (!activeSession || !currentProductDef) {
      return {
        skorProsedur: 100,
        skorWaktu: 100,
        skorKebersihan: 100,
        skorKerjasama: 100,
        skorKnowledge: 100,
        skorAkhir: 100,
        isKompetenMandiri: true,
        isLulusPendampingan: false,
        isRemedial: false,
        statusKelulusan: 'KOMPETEN MANDIRI',
        hasTitikKritisViolation: false,
        failedCriticalPoints: [] as string[],
      };
    }

    // 1. Prosedur SOP (30%)
    const totalSteps = activeSession.stepChecklist.length;
    const passedSteps = activeSession.stepChecklist.filter(s => s.tercapai).length;
    let skorProsedur = totalSteps > 0 ? Math.round((passedSteps / totalSteps) * 100) : 100;

    // Check critical point violations
    const missedKritis = activeSession.stepChecklist.filter(s => s.isKritis && !s.tercapai);
    const hasTitikKritisViolation = missedKritis.length > 0;
    const failedCriticalPoints = missedKritis.map(m => m.langkah);

    if (hasTitikKritisViolation) {
      skorProsedur = Math.min(skorProsedur, 65);
    }

    // 2. Kecepatan Waktu / SOS (20%)
    const targetDetik = currentProductDef.stdDetik;
    const actualDetik = activeSession.timerSeconds;
    let skorWaktu = 100;
    if (actualDetik > targetDetik) {
      const overSec = actualDetik - targetDetik;
      const penalty = Math.min(60, Math.floor(overSec / 5) * 5);
      skorWaktu = Math.max(40, 100 - penalty);
    }

    // 3. Kebersihan K3 & Grooming (15%)
    let skorKebersihan = 0;
    KEBERSIHAN_INDICATORS.forEach(k => {
      if (activeSession.kebersihanChecked[k.id]) {
        skorKebersihan += k.poin;
      }
    });
    skorKebersihan = Math.min(100, skorKebersihan);

    // 4. Kerjasama Tim & Komunikasi (15%)
    let skorKerjasama = 0;
    KERJASAMA_INDICATORS.forEach(k => {
      if (activeSession.kerjasamaChecked[k.id]) {
        skorKerjasama += k.poin;
      }
    });
    skorKerjasama = Math.min(100, skorKerjasama);

    // 5. Knowledge SOP (20%)
    const skorKnowledge = activeSession.skorKnowledge;

    // Weighted Total: 30% Prosedur + 20% Waktu + 15% Kebersihan + 15% Kerjasama + 20% Knowledge
    let skorAkhir = Math.round(
      skorProsedur * 0.30 +
      skorWaktu * 0.20 +
      skorKebersihan * 0.15 +
      skorKerjasama * 0.15 +
      skorKnowledge * 0.20
    );

    // Standard Passing Criteria from PDF:
    // KOMPETEN MANDIRI: Skor >= 85 and 0 critical failures
    // LULUS PENDAMPINGAN: Skor 80 - 84 and 0 critical failures
    // REMEDIAL: Skor < 80 OR any critical failure
    const isKompetenMandiri = skorAkhir >= 85 && !hasTitikKritisViolation;
    const isLulusPendampingan = skorAkhir >= 80 && skorAkhir < 85 && !hasTitikKritisViolation;
    const isRemedial = skorAkhir < 80 || hasTitikKritisViolation;

    const statusKelulusan = isKompetenMandiri
      ? 'KOMPETEN MANDIRI'
      : isLulusPendampingan
      ? 'LULUS PENDAMPINGAN'
      : 'REMEDIAL KRITIS';

    return {
      skorProsedur,
      skorWaktu,
      skorKebersihan,
      skorKerjasama,
      skorKnowledge,
      skorAkhir,
      isKompetenMandiri,
      isLulusPendampingan,
      isRemedial,
      statusKelulusan,
      hasTitikKritisViolation,
      failedCriticalPoints,
    };
  }, [activeSession, currentProductDef]);

  // Handle Save / Submit Assessment
  const handleSaveAssessment = () => {
    if (!activeSession) return;

    const finalPenilai = isCustomPenilai ? (customPenilai.trim() || 'Haikal') : namaPenilai;
    const effectiveKruNama = activeSession.isManualName
      ? (activeSession.manualNameInput.trim() || 'Peserta Mandiri')
      : activeSession.namaKru;

    const newRecord: PenilaianPraktikOnboardingProduk = {
      id: `prak-${Date.now()}`,
      tanggal: tanggalUji,
      batch_id: selectedBatchId !== 'ALL' ? selectedBatchId : undefined,
      nama_batch: selectedBatchId !== 'ALL' ? batches.find(b => b.id === selectedBatchId)?.nama_batch : undefined,
      kode_outlet: activeSession.outletCode,
      kru_id: activeSession.isManualName ? `manual-${Date.now()}` : activeSession.kruId,
      nama_kru: effectiveKruNama,
      divisi: currentProductDef.divisi,
      day: activeSession.day,
      batch_name: activeSession.batch,
      station: activeSession.station,
      station_label: currentProductDef.stationLabel,
      produk_nama: activeSession.productNama,
      waktu_detik: activeSession.timerSeconds,
      target_detik: currentProductDef.stdDetik,
      suhu_minyak_aktual: currentProductDef.requiresOilTemp ? activeSession.suhuMinyakProbe : undefined,
      gramatur_aktual: currentProductDef.requiresGramatur ? activeSession.gramaturAktual : undefined,
      skor_prosedur: calculatedScores.skorProsedur,
      skor_waktu: calculatedScores.skorWaktu,
      skor_kebersihan: calculatedScores.skorKebersihan,
      skor_kerjasama: calculatedScores.skorKerjasama,
      skor_knowledge: calculatedScores.skorKnowledge,
      skor_akhir: calculatedScores.skorAkhir,
      status: calculatedScores.statusKelulusan,
      gagal_titik_kritis: calculatedScores.hasTitikKritisViolation,
      titik_kritis_gagal_detail: calculatedScores.failedCriticalPoints,
      penilai_nama: finalPenilai,
      catatan: activeSession.catatanTrainer || (calculatedScores.isKompetenMandiri ? 'Praktik sangat rapi dan sesuai SOP.' : 'Dibutuhkan pendampingan lanjutan.'),
      created_at: new Date().toISOString(),
    };

    db.savePenilaianPraktikProduk(newRecord);

    if (calculatedScores.isKompetenMandiri) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    }

    updateActiveSession({
      isSaved: true,
      isTimerRunning: false,
    });

    showToast(`Penilaian "${effectiveKruNama}" untuk produk ${activeSession.productNama} berhasil disimpan (Skor: ${calculatedScores.skorAkhir}).`);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filter products for Searchable Modal
  const filteredModalProducts = useMemo(() => {
    return HARA_ONBOARDING_PRODUCTS_MASTER.filter(p => {
      // Search query
      if (productSearchQuery.trim()) {
        const q = productSearchQuery.toLowerCase();
        const matchName = p.nama.toLowerCase().includes(q);
        const matchStation = p.stationLabel.toLowerCase().includes(q);
        const matchDesc = p.deskripsi.toLowerCase().includes(q);
        if (!matchName && !matchStation && !matchDesc) return false;
      }
      // Day filter
      if (pickerDayFilter !== 'ALL' && p.day !== pickerDayFilter) return false;
      // Station filter
      if (pickerStationFilter !== 'ALL' && p.station !== pickerStationFilter) return false;
      return true;
    });
  }, [productSearchQuery, pickerDayFilter, pickerStationFilter]);

  const allAssessments = db.getPenilaianPraktikProduk();

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#181411] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-[#96171B] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ===================================================================
          BAR ATAS: PILIH PENILAI (HAIKAL, JIHAN, FERI, ARI), BATCH, & TANGGAL
          =================================================================== */}
      <div className="p-4 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Penilai Selector */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#645D55] uppercase text-[10.5px]">Trainer / Penilai:</span>
            {!isCustomPenilai ? (
              <select
                value={namaPenilai}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomPenilai(true);
                  } else {
                    setNamaPenilai(e.target.value);
                  }
                }}
                className="p-1.5 rounded-lg border border-[#E6E1DA] bg-white font-semibold text-[#181411] text-xs"
              >
                {DAFTAR_PENILAI_DEFAULT.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="custom">+ Nama Penilai Lain...</option>
              </select>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customPenilai}
                  onChange={(e) => setCustomPenilai(e.target.value)}
                  placeholder="Ketik nama penilai..."
                  className="p-1.5 rounded-lg border border-[#E6E1DA] text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomPenilai(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-[#E6E1DA] hidden md:block" />

          {/* Batch Selector */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#645D55] uppercase text-[10.5px]">Batch Kelas:</span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="p-1.5 rounded-lg border border-[#E6E1DA] bg-white text-xs font-semibold"
            >
              <option value="ALL">Onboarding Umum</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.nomor_batch} - {b.nama_batch}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-[#E6E1DA] hidden md:block" />

          {/* Tanggal Pelaksanaan */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#645D55] uppercase text-[10.5px]">Tanggal:</span>
            <input
              type="date"
              value={tanggalUji}
              onChange={(e) => setTanggalUji(e.target.value)}
              className="p-1.5 rounded-lg border border-[#E6E1DA] bg-white text-xs font-semibold"
            />
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2">
          {onOpenFullAuditLog && (
            <button
              type="button"
              onClick={onOpenFullAuditLog}
              className="px-3 py-1.5 rounded-lg border border-[#E6E1DA] hover:border-[#96171B] text-[#181411] hover:text-[#96171B] text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <FileText size={14} />
              <span>Log Aktivitas Penuh</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setCrewReportModalKru(activeSession?.namaKru || 'Peserta')}
            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#96171B] border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
          >
            <BookOpen size={14} />
            <span>Laporan Kru</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          CONCURRENT MULTI-KRU ASSESSMENT TABS BAR
          =================================================================== */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {sessions.map((sess, idx) => {
            const isActive = sess.id === activeTabId;
            const displayName = sess.isManualName
              ? (sess.manualNameInput.trim() || `Peserta ${idx + 1}`)
              : sess.namaKru;

            return (
              <div
                key={sess.id}
                onClick={() => setActiveTabId(sess.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all border shrink-0 ${
                  isActive
                    ? 'bg-[#181411] text-white border-[#181411] shadow-2xs'
                    : 'bg-white text-[#181411] border-[#E6E1DA] hover:border-[#96171B]/50'
                }`}
              >
                {/* Status Dot */}
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  sess.isTimerRunning
                    ? 'bg-amber-400 animate-pulse'
                    : sess.isSaved
                    ? 'bg-emerald-400'
                    : 'bg-stone-300'
                }`} />

                <div className="flex flex-col text-left">
                  <span className="truncate max-w-[130px]">{displayName}</span>
                  <span className="text-[10px] font-mono opacity-70">
                    {sess.productNama} • {formatTime(sess.timerSeconds)}
                  </span>
                </div>

                {/* Close session button */}
                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleCloseSession(sess.id, e)}
                    className="p-1 hover:bg-neutral-700/50 rounded text-gray-400 hover:text-white transition-colors"
                    title="Tutup tab kru ini"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Tab Button */}
        <button
          type="button"
          onClick={handleAddNewSession}
          className="px-3.5 py-2 rounded-lg border border-dashed border-[#96171B] bg-red-50/40 text-[#96171B] hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <Plus size={14} />
          <span>Tambah Kru Uji</span>
        </button>
      </div>

      {/* ===================================================================
          ACTIVE SESSION CONTROLS: PESERTA & SEARCHABLE PRODUCT SELECTOR
          =================================================================== */}
      {activeSession && (
        <div className="p-5 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Peserta Praktik (Dropdown or Manual Typing) */}
            <div className="lg:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider flex items-center gap-1">
                  <User size={13} />
                  <span>Kru yang Dinilai:</span>
                </label>

                {/* Toggle Manual Input */}
                <button
                  type="button"
                  onClick={() => {
                    updateActiveSession({
                      isManualName: !activeSession.isManualName,
                      manualNameInput: activeSession.isManualName ? '' : activeSession.namaKru,
                    });
                  }}
                  className="text-[11px] text-[#96171B] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 size={11} />
                  <span>{activeSession.isManualName ? 'Pilih dari Master Kru' : 'Ketik Nama Manual'}</span>
                </button>
              </div>

              {!activeSession.isManualName ? (
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={activeSession.kruId}
                    onChange={(e) => {
                      const selectedK = kruList.find(k => k.id === e.target.value);
                      if (selectedK) {
                        updateActiveSession({
                          kruId: selectedK.id,
                          namaKru: selectedK.nama_kru,
                          outletCode: selectedK.kode_outlet,
                        });
                      }
                    }}
                    className="col-span-2 p-2.5 rounded-lg border border-[#E6E1DA] text-xs font-bold text-[#181411] bg-[#FAF8F5]/50 focus:bg-white"
                  >
                    {kruList.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kru} ({k.divisi} - {k.kode_outlet})
                      </option>
                    ))}
                  </select>

                  <select
                    value={activeSession.outletCode}
                    onChange={(e) => updateActiveSession({ outletCode: e.target.value })}
                    className="p-2.5 rounded-lg border border-[#E6E1DA] text-xs font-bold text-[#181411] bg-[#FAF8F5]/50 focus:bg-white"
                  >
                    {outlets.map(o => (
                      <option key={o.kode_outlet} value={o.kode_outlet}>
                        {o.kode_outlet}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={activeSession.manualNameInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateActiveSession({
                        manualNameInput: val,
                        namaKru: val.trim() || 'Peserta Mandiri',
                      });
                    }}
                    placeholder="Ketik nama lengkap kru..."
                    className="col-span-2 p-2.5 rounded-lg border border-red-300 focus:border-[#96171B] text-xs font-bold text-[#181411] bg-red-50/20"
                    autoFocus
                  />

                  <select
                    value={activeSession.outletCode}
                    onChange={(e) => updateActiveSession({ outletCode: e.target.value })}
                    className="p-2.5 rounded-lg border border-[#E6E1DA] text-xs font-bold text-[#181411] bg-[#FAF8F5]/50"
                  >
                    {outlets.map(o => (
                      <option key={o.kode_outlet} value={o.kode_outlet}>
                        {o.kode_outlet}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* PRODUCT CARD SELECTOR (MODERN, SEARCHABLE & FAST) */}
            <div className="lg:col-span-7 space-y-1.5">
              <label className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider block">
                Menu / SOP Produk yang Sedang Dibuat:
              </label>

              <div
                onClick={() => setIsProductPickerOpen(true)}
                className="p-3 rounded-lg border border-[#E6E1DA] hover:border-[#96171B] bg-[#FAF8F5] hover:bg-white cursor-pointer transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-[#96171B] flex items-center justify-center shrink-0 border border-red-100 group-hover:bg-[#96171B] group-hover:text-white transition-colors">
                    <UtensilsCrossed size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#181411] truncate">{currentProductDef.nama}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-[#E6E1DA] text-[#645D55]">
                        {currentProductDef.day}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#645D55] truncate mt-0.5">
                      {currentProductDef.stationLabel} • Target {Math.round(currentProductDef.stdDetik / 60)} mnt ({currentProductDef.stdDetik}s)
                      {currentProductDef.requiresOilTemp ? ` • Fryer ${currentProductDef.targetSuhuMinyak}°C` : ''}
                      {currentProductDef.requiresGramatur ? ` • Timbang ${currentProductDef.targetGramatur}g` : ''}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-[#96171B] group-hover:bg-[#7A1216] text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                >
                  <Search size={13} />
                  <span>Cari Produk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MAIN ASSESSMENT SPLIT:
          LEFT: STOPWATCH, PARAMETER TEKNIS, & SOP STEPS
          RIGHT: 5 DIMENSI RUBRIK (PROSEDUR, WAKTU, KEBERSIHAN, KERJASAMA, KNOWLEDGE)
          =================================================================== */}
      {activeSession && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: TIMER, SUHU/GRAMASI & CHECKLIST LANGKAH */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* STOPWATCH & PARAMETER CARD */}
            <div className="p-6 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                <div>
                  <h3 className="font-bold text-sm text-[#181411] flex items-center gap-2">
                    <Clock size={16} className="text-[#96171B]" />
                    <span>Pengukuran Waktu Praktik (Stopwatch Standar SOP)</span>
                  </h3>
                  <p className="text-xs text-[#645D55]">
                    Target waktu baku {currentProductDef.nama}: <strong>{currentProductDef.stdDetik} detik</strong> ({Math.round(currentProductDef.stdDetik / 60)} menit)
                  </p>
                </div>
              </div>

              {/* Stopwatch Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                <div>
                  <span className="text-[10px] font-bold text-[#645D55] uppercase tracking-wider block">
                    Durasi Berjalan:
                  </span>
                  <div className="text-4xl font-black font-mono tracking-tight text-[#181411] mt-0.5">
                    {formatTime(activeSession.timerSeconds)}
                  </div>
                  <span className="text-[11px] text-[#645D55]">
                    Status Timer: {activeSession.isTimerRunning ? 'Sedang Memasak (Aktif)' : 'Berhenti'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateActiveSession({ isTimerRunning: !activeSession.isTimerRunning })}
                    className={`px-4 py-2.5 rounded-lg text-xs font-bold text-white shadow-2xs transition-all flex items-center gap-2 cursor-pointer ${
                      activeSession.isTimerRunning
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-[#96171B] hover:bg-[#7A1216]'
                    }`}
                  >
                    {activeSession.isTimerRunning ? <Pause size={15} /> : <Play size={15} />}
                    <span>{activeSession.isTimerRunning ? 'Jeda Timer' : 'Mulai Praktik'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateActiveSession({ timerSeconds: 0, isTimerRunning: false })}
                    className="p-2.5 rounded-lg border border-[#E6E1DA] hover:bg-slate-100 text-[#645D55] hover:text-[#181411] text-xs font-semibold transition-colors cursor-pointer"
                    title="Reset timer ke 00:00"
                  >
                    <RotateCcw size={15} />
                  </button>
                </div>
              </div>

              {/* Parameter Teknis Kondisional (Suhu / Gramatur) */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-[#181411]">
                  Pemeriksaan Parameter Teknis Baku:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Parameter Suhu Minyak */}
                  {currentProductDef.requiresOilTemp ? (
                    <div className="p-3.5 rounded-lg border border-[#E6E1DA] bg-red-50/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#181411] flex items-center gap-1.5">
                          <Thermometer size={14} className="text-[#96171B]" />
                          <span>Suhu Minyak Fryer (°C)</span>
                        </span>
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-red-100 text-[#96171B]">
                          Target: {currentProductDef.targetSuhuMinyak}°C
                        </span>
                      </div>
                      <input
                        type="number"
                        value={activeSession.suhuMinyakProbe}
                        onChange={(e) => updateActiveSession({ suhuMinyakProbe: Number(e.target.value) })}
                        className="w-full p-2 rounded-lg border border-[#E6E1DA] text-sm font-bold font-mono text-[#181411]"
                        min="100"
                        max="220"
                      />
                      <p className="text-[10px] text-[#645D55] mt-1">
                        Ukur dengan termometer probe digital pada saat dropping ayam/bahan.
                      </p>
                    </div>
                  ) : null}

                  {/* Parameter Gramatur */}
                  {currentProductDef.requiresGramatur ? (
                    <div className="p-3.5 rounded-lg border border-[#E6E1DA] bg-amber-50/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#181411] flex items-center gap-1.5">
                          <Scale size={14} className="text-amber-700" />
                          <span>Gramatur Timbangan (g)</span>
                        </span>
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                          Target: {currentProductDef.targetGramatur}g
                        </span>
                      </div>
                      <input
                        type="number"
                        value={activeSession.gramaturAktual}
                        onChange={(e) => updateActiveSession({ gramaturAktual: Number(e.target.value) })}
                        className="w-full p-2 rounded-lg border border-[#E6E1DA] text-sm font-bold font-mono text-[#181411]"
                        min="0"
                        max="500"
                      />
                      <p className="text-[10px] text-[#645D55] mt-1">
                        {currentProductDef.gramaturLabel || 'Timbang dengan timbangan digital HARA.'}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* SOP CHECKLIST STEPS */}
            <div className="p-6 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                <div>
                  <h3 className="font-bold text-sm text-[#181411]">
                    Langkah Prosedur Baku SOP ({activeSession.stepChecklist.length} Langkah)
                  </h3>
                  <p className="text-xs text-[#645D55]">
                    Centang langkah yang dilaksanakan dengan tepat oleh kru
                  </p>
                </div>
                <span className="text-xs font-bold text-[#96171B] font-mono">
                  Bobot: 30%
                </span>
              </div>

              <div className="space-y-2">
                {activeSession.stepChecklist.map((step) => (
                  <div
                    key={step.nomor}
                    onClick={() => handleToggleStep(step.nomor)}
                    className={`p-3 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${
                      step.tercapai
                        ? 'bg-white border-[#E6E1DA] hover:border-emerald-300'
                        : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      step.tercapai
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white border-rose-300 text-transparent'
                    }`}>
                      <Check size={12} strokeWidth={3} />
                    </div>

                    <div className="flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#181411]">Langkah #{step.nomor}</span>
                        {step.isKritis && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            TITIK KRITIS
                          </span>
                        )}
                      </div>
                      <p className={`mt-0.5 leading-relaxed ${
                        step.tercapai ? 'text-[#181411]' : 'text-rose-800 line-through'
                      }`}>
                        {step.langkah}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: KEBERSIHAN, KERJASAMA, KNOWLEDGE & SCORE SUMMARY */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* SCORE SUMMARY CARD (STICKY) */}
            <div className="p-6 rounded-xl bg-[#181411] text-white shadow-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    HASIL PENILAIAN PRAKTIK
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {activeSession.isManualName ? activeSession.manualNameInput : activeSession.namaKru}
                  </h4>
                </div>

                <div className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1 ${
                  calculatedScores.isKompetenMandiri
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : calculatedScores.isLulusPendampingan
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {calculatedScores.isKompetenMandiri ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>KOMPETEN MANDIRI</span>
                    </>
                  ) : calculatedScores.isLulusPendampingan ? (
                    <>
                      <CheckCircle2 size={13} />
                      <span>LULUS PENDAMPINGAN</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={13} />
                      <span>REMEDIAL KRITIS</span>
                    </>
                  )}
                </div>
              </div>

              {/* Huge Final Score */}
              <div className="text-center py-2">
                <div className="text-5xl font-black font-mono tracking-tight text-white">
                  {calculatedScores.skorAkhir}
                  <span className="text-lg font-normal text-gray-400 ml-1">/ 100</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Ambang Mandiri: <strong className="text-white">≥ 85 Poin & 0 Gagal Kritis</strong> (Standar PDF)
                </p>
              </div>

              {/* 5-Aspect Breakdown */}
              <div className="space-y-1.5 text-xs pt-2 border-t border-neutral-800 font-mono">
                <div className="flex justify-between text-gray-300">
                  <span>1. Ketepatan Langkah SOP (30%)</span>
                  <span className="font-bold text-white">{calculatedScores.skorProsedur} / 100</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>2. Kecepatan Waktu / SOS (20%)</span>
                  <span className="font-bold text-white">{calculatedScores.skorWaktu} / 100</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>3. Kebersihan, K3 & Grooming (15%)</span>
                  <span className="font-bold text-white">{calculatedScores.skorKebersihan} / 100</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>4. Kerjasama Tim & Sikap (15%)</span>
                  <span className="font-bold text-white">{calculatedScores.skorKerjasama} / 100</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>5. Knowledge & Tanya Jawab (20%)</span>
                  <span className="font-bold text-white">{calculatedScores.skorKnowledge} / 100</span>
                </div>
              </div>

              {/* Titik Kritis Warning */}
              {calculatedScores.hasTitikKritisViolation && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldAlert size={14} /> Pelanggaran Titik Kritis
                  </span>
                  <p className="text-[11px] mt-0.5 text-rose-300">
                    Titik kritis gagal dipenuhi: {calculatedScores.failedCriticalPoints.join(', ')}. Status otomatis menjadi Remedial.
                  </p>
                </div>
              )}

              {/* Action Buttons: Save & Certificate */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleSaveAssessment}
                  className="w-full py-3 px-4 rounded-lg bg-[#96171B] hover:bg-[#7A1216] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Award size={16} />
                  <span>Simpan & Rekam Nilai Praktik</span>
                </button>

                {calculatedScores.skorAkhir >= 80 && (
                  <button
                    type="button"
                    onClick={() => {
                      const effName = activeSession.isManualName
                        ? (activeSession.manualNameInput.trim() || 'Peserta')
                        : activeSession.namaKru;
                      setCertificateData({
                        kruNama: effName,
                        kodeOutlet: activeSession.outletCode,
                        batchName: selectedBatchId !== 'ALL' ? batches.find(b => b.id === selectedBatchId)?.nama_batch || 'Onboarding HARA' : 'Onboarding HARA',
                        skorAkhir: calculatedScores.skorAkhir,
                        statusKelulusan: calculatedScores.statusKelulusan,
                        trainerNama: isCustomPenilai ? (customPenilai || 'Haikal') : namaPenilai,
                      });
                    }}
                    className="w-full py-2.5 px-4 rounded-lg border border-neutral-700 hover:border-white text-gray-300 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Award size={14} className="text-amber-400" />
                    <span>Pratinjau Sertifikat Kelulusan</span>
                  </button>
                )}
              </div>
            </div>

            {/* AUTO-GENERATED KNOWLEDGE QUESTIONS (20%) */}
            <div className="p-6 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
                <div>
                  <h4 className="font-bold text-sm text-[#181411]">Knowledge SOP Lisan (20%)</h4>
                  <p className="text-[11px] text-[#645D55]">Pertanyaan otomatis sesuai produk yang diuji</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#96171B]">
                  {activeSession.skorKnowledge} / 100
                </span>
              </div>

              {/* Questions List */}
              <div className="space-y-3 pt-1">
                {currentProductDef.autoQuestions.map((q, qIdx) => {
                  const isPassed = activeSession.knowledgeAnswers[qIdx] ?? true;
                  return (
                    <div key={qIdx} className="p-3 rounded-lg border border-[#E6E1DA] bg-[#FAF8F5] space-y-2">
                      <div className="text-xs font-semibold text-[#181411]">
                        {qIdx + 1}. {q.tanya}
                      </div>
                      <div className="text-[11px] text-[#645D55] bg-white p-2 rounded border border-[#E6E1DA]">
                        <span className="font-bold text-[#96171B]">Kunci Jawaban:</span> {q.kunci}
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleToggleKnowledgeQuestion(qIdx, true)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            isPassed
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-white border border-[#E6E1DA] text-[#645D55] hover:bg-slate-100'
                          }`}
                        >
                          ✓ Benar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleKnowledgeQuestion(qIdx, false)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            !isPassed
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'bg-white border border-[#E6E1DA] text-[#645D55] hover:bg-slate-100'
                          }`}
                        >
                          ✕ Salah
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KEBERSIHAN K3 & GROOMING (15%) */}
            <div className="p-6 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
                <div>
                  <h4 className="font-bold text-sm text-[#181411]">Kebersihan & K3 (15%)</h4>
                  <p className="text-[11px] text-[#645D55]">Sanitasi 6 langkah food grade</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#181411]">
                  {calculatedScores.skorKebersihan}%
                </span>
              </div>

              <div className="space-y-2">
                {KEBERSIHAN_INDICATORS.map(k => (
                  <label
                    key={k.id}
                    className="flex items-start gap-2.5 text-xs text-[#181411] cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={!!activeSession.kebersihanChecked[k.id]}
                      onChange={() => handleToggleKebersihan(k.id)}
                      className="w-4 h-4 rounded border-[#E6E1DA] text-[#96171B] focus:ring-[#96171B] mt-0.5 accent-[#96171B]"
                    />
                    <span className="leading-snug">{k.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* KERJASAMA & KOMUNIKASI (15%) */}
            <div className="p-6 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
                <div>
                  <h4 className="font-bold text-sm text-[#181411]">Kerjasama Tim & Sikap (15%)</h4>
                  <p className="text-[11px] text-[#645D55]">Komunikasi "Yes Chef" & ritme kerja</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#181411]">
                  {calculatedScores.skorKerjasama}%
                </span>
              </div>

              <div className="space-y-2">
                {KERJASAMA_INDICATORS.map(k => (
                  <label
                    key={k.id}
                    className="flex items-start gap-2.5 text-xs text-[#181411] cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={!!activeSession.kerjasamaChecked[k.id]}
                      onChange={() => handleToggleKerjasama(k.id)}
                      className="w-4 h-4 rounded border-[#E6E1DA] text-[#96171B] focus:ring-[#96171B] mt-0.5 accent-[#96171B]"
                    />
                    <span className="leading-snug">{k.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* CATATAN ASESOR / TRAINER */}
            <div className="p-6 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-2">
              <label className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider block">
                Catatan Asesor / Evaluasi Lapangan:
              </label>
              <textarea
                value={activeSession.catatanTrainer}
                onChange={(e) => updateActiveSession({ catatanTrainer: e.target.value })}
                placeholder="Tuliskan catatan perbaikan atau apresiasi terhadap hasil praktik kru..."
                rows={3}
                className="w-full p-2.5 rounded-lg border border-[#E6E1DA] text-xs text-[#181411] placeholder-[#645D55]/60 focus:outline-none focus:border-[#96171B]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: SEARCHABLE PRODUCT SELECTOR DRAWER / PALETTE
          (Pencarian produk cepat dan efisien pengganti dropdown hitam)
          =================================================================== */}
      {isProductPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col text-[#181411] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E6E1DA] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-50 text-[#96171B] flex items-center justify-center border border-red-100">
                  <Search size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#181411]">Pilih Produk SOP yang Diuji</h3>
                  <p className="text-xs text-[#645D55]">Pencarian cepat produk Day 1 & Day 2 per station</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(false)}
                className="p-1 rounded-lg text-[#645D55] hover:text-[#181411] hover:bg-[#FAF8F5]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter Controls Bar */}
            <div className="p-4 border-b border-[#E6E1DA] space-y-3 bg-[#FAF8F5]/60 shrink-0">
              {/* Search Input */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#645D55]" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Ketik nama produk (misal: geprek, nashville, teh, milkshake, kulit, ayam utuh)..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-[#E6E1DA] bg-white text-xs font-semibold focus:outline-none focus:border-[#96171B]"
                  autoFocus
                />
                {productSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setProductSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Day Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-[#645D55] uppercase text-[10px]">Hari:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPickerDayFilter('ALL')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      pickerDayFilter === 'ALL'
                        ? 'bg-[#181411] text-white shadow-2xs'
                        : 'bg-white border border-[#E6E1DA] text-[#645D55] hover:bg-slate-100'
                    }`}
                  >
                    Semua Hari ({HARA_ONBOARDING_PRODUCTS_MASTER.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerDayFilter('Day 1')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      pickerDayFilter === 'Day 1'
                        ? 'bg-[#96171B] text-white shadow-2xs'
                        : 'bg-white border border-[#E6E1DA] text-[#645D55] hover:bg-slate-100'
                    }`}
                  >
                    Day 1 (Batch 1 & 2)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerDayFilter('Day 2')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      pickerDayFilter === 'Day 2'
                        ? 'bg-[#96171B] text-white shadow-2xs'
                        : 'bg-white border border-[#E6E1DA] text-[#645D55] hover:bg-slate-100'
                    }`}
                  >
                    Day 2 (S1, S2, S3 & All)
                  </button>
                </div>
              </div>

              {/* Station Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-bold text-[#645D55] uppercase text-[10px]">Station:</span>
                {['ALL', 'Station 1', 'Station 2', 'Station 3', 'All Crew'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPickerStationFilter(st)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      pickerStationFilter === st
                        ? 'bg-neutral-800 text-white'
                        : 'bg-white border border-[#E6E1DA] text-[#645D55] hover:bg-slate-100'
                    }`}
                  >
                    {st === 'ALL' ? 'Semua Station' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredModalProducts.map((prod) => {
                  const isCurrent = activeSession?.productNama === prod.nama;
                  return (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectProduct(prod)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isCurrent
                          ? 'border-[#96171B] bg-red-50/40 shadow-xs ring-1 ring-[#96171B]'
                          : 'border-[#E6E1DA] bg-white hover:border-[#96171B]/60 hover:shadow-2xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-xs text-[#181411]">{prod.nama}</h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#E6E1DA] text-[#645D55] shrink-0">
                            {prod.day}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#645D55] mt-1 line-clamp-2">
                          {prod.deskripsi}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#E6E1DA]/60 text-[10px] font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                          {prod.station}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                          {prod.stdDetik}s
                        </span>
                        {prod.requiresOilTemp && (
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-[#96171B] font-bold">
                            Fryer {prod.targetSuhuMinyak}°C
                          </span>
                        )}
                        {prod.requiresGramatur && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                            {prod.targetGramatur}g
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredModalProducts.length === 0 && (
                <div className="p-8 text-center text-[#645D55] text-xs">
                  Tidak ada produk yang cocok dengan pencarian &quot;{productSearchQuery}&quot;.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-[#E6E1DA] flex items-center justify-between text-xs bg-[#FAF8F5]/80 shrink-0">
              <span className="text-[11px] text-[#645D55]">
                Ditemukan <strong>{filteredModalProducts.length}</strong> produk SOP.
              </span>
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-[#E6E1DA] hover:bg-white text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: SERTIFIKAT KELULUSAN DIGITAL
          =================================================================== */}
      {certificateData && (
        <MiniCertificateModal
          kruNama={certificateData.kruNama}
          kodeOutlet={certificateData.kodeOutlet}
          batchName={certificateData.batchName}
          skorAkhir={certificateData.skorAkhir}
          statusKelulusan={certificateData.statusKelulusan}
          trainerNama={certificateData.trainerNama}
          onClose={() => setCertificateData(null)}
        />
      )}

      {/* ===================================================================
          MODAL: LAPORAN KRU ONBOARDING KOMPREHENSIF
          =================================================================== */}
      {crewReportModalKru && (
        <CrewOnboardingReportModal
          kruNama={crewReportModalKru}
          kodeOutlet={activeSession?.outletCode || 'HC-BTL01'}
          batchName={selectedBatchId !== 'ALL' ? batches.find(b => b.id === selectedBatchId)?.nama_batch : 'Onboarding HARA'}
          assessments={allAssessments}
          onClose={() => setCrewReportModalKru(null)}
          onOpenCertificate={() => {
            const kruRecs = allAssessments.filter(a => a.nama_kru.toLowerCase().trim() === crewReportModalKru.toLowerCase().trim());
            const avg = kruRecs.length > 0 ? (kruRecs.reduce((s, r) => s + r.skor_akhir, 0) / kruRecs.length) : 85;
            setCertificateData({
              kruNama: crewReportModalKru,
              kodeOutlet: activeSession?.outletCode || 'HC-BTL01',
              batchName: 'Onboarding HARA',
              skorAkhir: avg,
              statusKelulusan: avg >= 85 ? 'KOMPETEN MANDIRI' : 'LULUS PENDAMPINGAN',
              trainerNama: isCustomPenilai ? (customPenilai || 'Haikal') : namaPenilai,
            });
          }}
        />
      )}
    </div>
  );
};
