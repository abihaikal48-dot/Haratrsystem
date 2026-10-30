import React, { useState, useEffect, useMemo } from 'react';
import {
  UtensilsCrossed, Clock, CheckCircle2, AlertTriangle, Play,
  Pause, RotateCcw, Award, FileText, Search,
  Filter, Check, X, ShieldAlert,
  Info, ShieldCheck, User, Users, Store, Zap, RefreshCw,
  Thermometer, Scale, BookOpen, Plus, Sparkles,
  Edit2, Edit3, Save, Trash2, Layers, HelpCircle, Eye, Printer, ChevronRight,
  ClipboardCheck, Building2, Flame, Download, GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../lib/storage';
import { syncAllToFirestore } from '../../lib/firestoreSync';
import {
  Kru, Outlet, Division, OnboardingBatch,
  PenilaianPraktikOnboardingProduk, PenilaianJobdeskStasiun,
  PenilaianSikapKebersihanKru
} from '../../types';
import { exportPenilaianPraktikProdukPDF } from '../../lib/pdfGenerator';
import {
  HARA_ONBOARDING_PRODUCTS_MASTER,
  OnboardingProductItem
} from '../../data/haraOnboardingProducts';
import {
  DAFTAR_PESERTA_ONBOARDING_TC,
  TrainingParticipantItem
} from '../../data/trainingCenterData';
import {
  RUBRIK_PENILAIAN_7_KRITERIA_HARA,
  RubrikKriteriaOnboarding,
  hitungSkorKomposit7Kriteria
} from '../../data/haraObjectiveRubrics';
import { MiniCertificateModal } from './MiniCertificateModal';
import { CrewOnboardingReportModal } from './CrewOnboardingReportModal';
import { ConfirmModal } from '../ui/ConfirmModal';
import { syncPenilaianToGoogleSheets, exportPenilaianToCSV } from '../../lib/googleSheetSync';

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

export const DAFTAR_PENILAI_DEFAULT = [
  'Onboarding Team',
  'Trainer Operasional',
  'RnD Specialist',
  'Supervisor Outlet',
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
  batch: string;
  station: 'Station 1' | 'Station 2' | 'Station 3' | 'All Crew';
  productNama: string;
  timerSeconds: number;
  isTimerRunning: boolean;
  suhuMinyakProbe: number;
  gramaturAktual: number;
  stepChecklist: { nomor: number; langkah: string; tercapai: boolean; isKritis?: boolean }[];
  knowledgeAnswers: Record<number, boolean>;
  skorKnowledge: number;
  catatanTrainer: string;
  productNotes?: Record<string, string>;
  isSaved?: boolean;
}

export const OnboardingProductPracticeView: React.FC<OnboardingProductPracticeViewProps> = ({
  selectedOutletCode,
  onOpenFullAuditLog,
}) => {
  // Navigation Sub-Tab: 'produk' vs 'riwayat' vs 'jobdesk' vs 'peserta'
  const [activeSubTab, setActiveSubTab] = useState<'produk' | 'riwayat' | 'jobdesk' | 'peserta'>('produk');

  // Master lists
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [batches, setBatches] = useState<OnboardingBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');

  // Integrasi Batch Kru Dinamis: Mengambil peserta langsung dari Batch yang dipilih (bukan kru statis)
  const candidateKrus = useMemo(() => {
    const currentBatch = batches.find(b => b.id === selectedBatchId);
    if (currentBatch && Array.isArray(currentBatch.peserta) && currentBatch.peserta.length > 0) {
      return currentBatch.peserta.map(p => ({
        id: p.kru_id || `batch-p-${p.nama_kru}`,
        nama_kru: p.nama_kru,
        divisi: p.divisi || 'Kitchen',
        kode_outlet: p.outlet_tujuan || currentBatch.kode_outlet || 'HC-IMB01',
        posisi: p.jabatan || 'Crew',
        status_aktif: 'Aktif' as const,
        created_at: new Date().toISOString(),
      }));
    }
    return kruList;
  }, [batches, selectedBatchId, kruList]);

  // 13 Peserta Monitoring Matrix (Page 5 PDF) & Rubrik 7 Kriteria (Page 6 PDF)
  const [pesertaMatrix, setPesertaMatrix] = useState<TrainingParticipantItem[]>(() => {
    const raw = localStorage.getItem('hara_pd_peserta_matrix_tc');
    if (raw !== null) {
      try {
        return JSON.parse(raw);
      } catch {
        return [];
      }
    }
    db.setTable('peserta_matrix_tc', DAFTAR_PESERTA_ONBOARDING_TC);
    return DAFTAR_PESERTA_ONBOARDING_TC;
  });
  const [editingPeserta7Kriteria, setEditingPeserta7Kriteria] = useState<TrainingParticipantItem | null>(null);
  const [activeRubrikTab, setActiveRubrikTab] = useState<number>(1);
  const [form7Kriteria, setForm7Kriteria] = useState({
    ketepatan: 85,
    langkahSop: 85,
    kecepatan: 85,
    knowledge: 85,
    kerjaSama: 85,
    kebersihan: 85,
    keaktifan: 85,
  });

  // Penilai Globals
  const [namaPenilai, setNamaPenilai] = useState<string>(DAFTAR_PENILAI_DEFAULT[0]);
  const [customPenilai, setCustomPenilai] = useState<string>('');
  const [isCustomPenilai, setIsCustomPenilai] = useState<boolean>(false);
  const [tanggalUji, setTanggalUji] = useState<string>(new Date().toISOString().split('T')[0]);

  // Concurrent Multi-Candidate Sessions (Individual Product)
  const [sessions, setSessions] = useState<AssessmentSessionTab[]>(() => {
    const k = db.getTable<Kru>('kru').filter(x => x.status_aktif === 'Aktif');
    const firstKru = k[0] || { id: 'init-1', nama_kru: 'Iqbal Muzzaki', kode_outlet: 'HC-IMB01', divisi: 'Kitchen' };
    const prodDef = HARA_ONBOARDING_PRODUCTS_MASTER[0];
    return [{
      id: `session-init-1`,
      kruId: firstKru.id,
      namaKru: firstKru.nama_kru,
      isManualName: false,
      manualNameInput: '',
      outletCode: firstKru.kode_outlet || 'HC-IMB01',
      day: prodDef.day,
      batch: prodDef.batch,
      station: prodDef.station,
      productNama: prodDef.nama,
      timerSeconds: 0,
      isTimerRunning: false,
      suhuMinyakProbe: prodDef.targetSuhuMinyak || 160,
      gramaturAktual: prodDef.targetGramatur || 0,
      stepChecklist: prodDef.langkahSOP.map(s => ({ nomor: s.nomor, langkah: s.teks, tercapai: true, isKritis: s.isKritis })),
      knowledgeAnswers: { 0: true, 1: true, 2: true, 3: true, 4: true },
      skorKnowledge: 100,
      catatanTrainer: '',
      productNotes: {},
      isSaved: false,
    }];
  });
  const [activeTabId, setActiveTabId] = useState<string>(() => `session-init-1`);

  // Searchable Product Picker Modal State
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [pickerDayFilter, setPickerDayFilter] = useState<'ALL' | 'Day 1' | 'Day 2'>('ALL');
  const [pickerStationFilter, setPickerStationFilter] = useState<string>('ALL');

  // Custom SOP Products CRUD State
  const [customProducts, setCustomProducts] = useState<OnboardingProductItem[]>(() => {
    return db.getTable<OnboardingProductItem>('bank_sop_products') || [];
  });
  const [isManageProductsOpen, setIsManageProductsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<OnboardingProductItem | null>(null);
  const [newProdName, setNewProdName] = useState('');
  const [newProdKode, setNewProdKode] = useState('');
  const [newProdDay, setNewProdDay] = useState<'Day 1' | 'Day 2'>('Day 1');
  const [newProdStation, setNewProdStation] = useState<'Station 1' | 'Station 2' | 'Station 3' | 'All Crew'>('Station 1');
  const [newProdDivisi, setNewProdDivisi] = useState<Division>('Kitchen');
  const [newProdStdDetik, setNewProdStdDetik] = useState(300);
  const [newProdDeskripsi, setNewProdDeskripsi] = useState('');

  // Batch Management Modal State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Partial<OnboardingBatch> | null>(null);
  const [batchFormMode, setBatchFormMode] = useState<'create' | 'edit'>('create');
  const [manualNamaInput, setManualNamaInput] = useState('');
  const [manualOutletInput, setManualOutletInput] = useState('HC-GTG01');
  const [manualDivisiInput, setManualDivisiInput] = useState<Division>('Kitchen');
  const [manualTipeInput, setManualTipeInput] = useState<'Karyawan Baru (1-45 Hari)' | 'Retraining Karyawan Lama'>('Karyawan Baru (1-45 Hari)');
  const [isAddingManualParticipant, setIsAddingManualParticipant] = useState(false);

  // SOP Target Waktu Editor Modal State
  const [isSOPTargetModalOpen, setIsSOPTargetModalOpen] = useState(false);
  const [sopEditTargetProd, setSopEditTargetProd] = useState<OnboardingProductItem | null>(null);
  const [sopEditStdDetik, setSopEditStdDetik] = useState(1020);
  const [sopEditPersiapanDetik, setSopEditPersiapanDetik] = useState(180);
  const [sopEditMasakDetik, setSopEditMasakDetik] = useState(720);
  const [sopEditFinishingDetik, setSopEditFinishingDetik] = useState(120);

  const allAvailableProducts = useMemo(() => {
    const customMap: Record<string, OnboardingProductItem> = {};
    customProducts.forEach(cp => {
      customMap[cp.id] = cp;
    });
    return HARA_ONBOARDING_PRODUCTS_MASTER.map(mp => {
      const custom = customMap[mp.id];
      if (custom) {
        return { ...mp, ...custom };
      }
      return mp;
    }).concat(customProducts.filter(cp => !HARA_ONBOARDING_PRODUCTS_MASTER.some(mp => mp.id === cp.id)));
  }, [customProducts]);

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
  const [batchCrewModalOpen, setBatchCrewModalOpen] = useState(false);
  const [selectedBatchCrewIds, setSelectedBatchCrewIds] = useState<string[]>([]);

  // =========================================================================
  // STATE KHUSUS SUB-TAB: PENILAIAN KEBERSIHAN, KEAKTIFAN & SIKAP KRU (INDIVIDU)
  // =========================================================================
  const [sikapList, setSikapList] = useState<PenilaianSikapKebersihanKru[]>(() => db.getPenilaianSikapKebersihanKru());
  const [sikapFilterKru, setSikapFilterKru] = useState<string>('ALL');
  const [selectedSikapKruId, setSelectedSikapKruId] = useState<string>('');
  const [formSikapStation, setFormSikapStation] = useState<string>('Stasiun 1: Nasi, Teh, & Sup');

  // Checklist 4 Dimensi Evaluasi Sikap & Kebersihan Individu (Sesuai SOP HARA: Tanpa Sarung Tangan & Tanpa K3)
  const [formGrooming, setFormGrooming] = useState({
    apron_bersih: true,       // 9 poin
    hairnet_topi_rapi: true,  // 8 poin
    kuku_pendek_bersih: true, // 8 poin
  });

  const [formSanitasi, setFormSanitasi] = useState({
    clean_as_you_go: true,     // 7 poin
    lantai_kering: true,       // 6 poin
    buang_remahan_sampah: true,// 6 poin
    cegah_kontaminasi: true,   // 6 poin
  });

  const [formKeaktifan, setFormKeaktifan] = useState({
    proaktif_bertanya: true,   // 7 poin
    tanggap_rush: true,        // 6 poin
    inisiatif_prep: true,      // 6 poin
    sigap_rotasi: true,        // 6 poin
  });

  const [formKerapianAlat, setFormKerapianAlat] = useState({
    penempatan_tong: true,     // 9 poin
    tata_skimmer_baskom: true, // 8 poin
    botol_saus_bersih: true,   // 8 poin
  });

  const [formCatatanSikap, setFormCatatanSikap] = useState<string>('');

  // Riwayat Penilaian & Filter
  const [historyList, setHistoryList] = useState<PenilaianPraktikOnboardingProduk[]>(() => db.getPenilaianPraktikProduk());
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyBatchFilter, setHistoryBatchFilter] = useState('ALL');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('ALL');
  const [isSyncingAllSheets, setIsSyncingAllSheets] = useState(false);

  // Universal In-App Confirmation Modal State
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    detailText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Helper to initialize steps for a product
  const getInitialStepsForProduct = (productName: string) => {
    const pDef = allAvailableProducts.find(p => p.nama === productName) || allAvailableProducts[0];
    return pDef.langkahSOP.map(s => ({
      nomor: s.nomor,
      langkah: s.teks,
      tercapai: true,
      isKritis: s.isKritis
    }));
  };

  // Helper to format duration in decimal minutes (e.g., 12.5 mnt)
  const formatDecimalMinutes = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0.0 mnt';
    const mins = (seconds / 60).toFixed(1);
    return `${mins} mnt`;
  };

  // Helper to resolve full official outlet name instead of code
  const getFullOutletName = (kodeOrName?: string): string => {
    if (!kodeOrName) return 'Hara Chicken Pusat';
    const matched = outlets.find(o => o.kode_outlet === kodeOrName || o.nama_outlet === kodeOrName);
    return matched ? matched.nama_outlet : kodeOrName;
  };

  // Helper to create a new session
  const createNewSession = (initialKru?: Kru, defaultProduct?: string): AssessmentSessionTab => {
    const prodName = defaultProduct || 'Nasi Putih Pulen (Miyako 4-6 Cup)';
    const prodDef = allAvailableProducts.find(p => p.nama === prodName) || allAvailableProducts[0];
    const newId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const candidateId = initialKru?.id || (kruList[0]?.id ?? 'manual-1');
    const candidateName = initialKru?.nama_kru || (kruList[0]?.nama_kru ?? 'Iqbal Muzzaki');

    return {
      id: newId,
      kruId: candidateId,
      namaKru: candidateName,
      isManualName: false,
      manualNameInput: '',
      outletCode: initialKru?.kode_outlet || (selectedOutletCode !== 'ALL' ? selectedOutletCode : 'HC-IMB01'),
      day: prodDef.day,
      batch: prodDef.batch,
      station: prodDef.station,
      productNama: prodDef.nama,
      timerSeconds: 0,
      isTimerRunning: false,
      suhuMinyakProbe: prodDef.targetSuhuMinyak || 160,
      gramaturAktual: prodDef.targetGramatur || 0,
      stepChecklist: getInitialStepsForProduct(prodDef.nama),
      knowledgeAnswers: { 0: true, 1: true, 2: true, 3: true, 4: true },
      skorKnowledge: 100,
      catatanTrainer: '',
      productNotes: {},
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
    setSikapList(db.getPenilaianSikapKebersihanKru());
    setHistoryList(db.getPenilaianPraktikProduk());
    const rawMatrix = localStorage.getItem('hara_pd_peserta_matrix_tc');
    if (rawMatrix !== null) {
      try {
        setPesertaMatrix(JSON.parse(rawMatrix));
      } catch {}
    }

    const savedDrafts = db.getTable<AssessmentSessionTab>('draft_assessment_sessions');
    if (Array.isArray(savedDrafts) && savedDrafts.length > 0) {
      setSessions(savedDrafts);
      setActiveTabId(prev => (prev && savedDrafts.some(s => s.id === prev) ? prev : savedDrafts[0].id));
    } else {
      setSessions(prev => {
        if (!prev || prev.length === 0) {
          const init = createNewSession(k[0]);
          setActiveTabId(init.id);
          return [init];
        }
        return prev;
      });
    }
  };

  useEffect(() => {
    refreshData();
    const unsub = db.subscribe('*', () => {
      refreshData();
    });
    return () => unsub();
  }, [selectedOutletCode]);

  // Active Session Object
  const activeSession = useMemo(() => {
    const found = sessions.find(s => s.id === activeTabId) || sessions[0];
    if (found) return found;
    const defaultKru = kruList[0];
    if (defaultKru) {
      return createNewSession(defaultKru);
    }
    return null;
  }, [sessions, activeTabId, kruList]);

  // Current Product Definition
  const currentProductDef = useMemo(() => {
    if (!activeSession) return allAvailableProducts[0];
    return allAvailableProducts.find(p => p.nama === activeSession.productNama) || allAvailableProducts[0];
  }, [activeSession, allAvailableProducts]);

  // Auto-Update Active Session Helper
  const updateActiveSession = (patch: Partial<AssessmentSessionTab>) => {
    setSessions(prev => prev.map(s => {
      if (s.id === (activeSession?.id || activeTabId)) {
        return { ...s, ...patch };
      }
      return s;
    }));
  };

  // Stopwatch Interval
  useEffect(() => {
    const active = sessions.find(s => s.id === activeTabId);
    if (!active || !active.isTimerRunning) return;

    const interval = setInterval(() => {
      setSessions(prev => prev.map(s => {
        if (s.id === activeTabId && s.isTimerRunning) {
          return { ...s, timerSeconds: s.timerSeconds + 1 };
        }
        return s;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTabId, sessions]);

  // Format Time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filter products for Searchable Modal
  const filteredModalProducts = useMemo(() => {
    return allAvailableProducts.filter(p => {
      if (productSearchQuery.trim()) {
        const q = productSearchQuery.toLowerCase();
        const matchName = p.nama.toLowerCase().includes(q);
        const matchStation = p.stationLabel.toLowerCase().includes(q);
        const matchDesc = p.deskripsi.toLowerCase().includes(q);
        if (!matchName && !matchStation && !matchDesc) return false;
      }
      if (pickerDayFilter !== 'ALL' && p.day !== pickerDayFilter) return false;
      if (pickerStationFilter !== 'ALL' && p.station !== pickerStationFilter) return false;
      return true;
    });
  }, [allAvailableProducts, productSearchQuery, pickerDayFilter, pickerStationFilter]);

  // Add new concurrent session tab
  const handleAddNewSession = () => {
    const activeKruIds = sessions.map(s => s.kruId);
    const candidateKru = kruList.find(k => !activeKruIds.includes(k.id)) || kruList[0];
    const newSess = createNewSession(candidateKru);
    setSessions(prev => [...prev, newSess]);
    setActiveTabId(newSess.id);
    showToast(`Tab kru baru dibuka (${newSess.namaKru}).`);
  };

  // Open multiple crew sessions at once
  const handleOpenSelectedBatchCrews = () => {
    if (selectedBatchCrewIds.length === 0) {
      showToast('Pilih minimal 1 kru.');
      return;
    }
    const currentProduct = activeSession?.productNama || 'Nasi (Rice Cooker 4 Cup D1)';
    const existingKruIds = sessions.map(s => s.kruId);
    
    const newSessionsToAdd: AssessmentSessionTab[] = [];
    selectedBatchCrewIds.forEach(kruId => {
      if (!existingKruIds.includes(kruId)) {
        const k = candidateKrus.find(item => item.id === kruId) || kruList.find(item => item.id === kruId);
        if (k) {
          newSessionsToAdd.push(createNewSession(k, currentProduct));
        }
      }
    });

    if (newSessionsToAdd.length > 0) {
      setSessions(prev => [...prev, ...newSessionsToAdd]);
      setActiveTabId(newSessionsToAdd[0].id);
      showToast(`${newSessionsToAdd.length} kru dibuka serentak untuk diobservasi.`);
    } else {
      showToast('Kru yang dipilih sudah memiliki tab aktif.');
    }
    setBatchCrewModalOpen(false);
    setSelectedBatchCrewIds([]);
  };

  // Close a session tab
  const handleCloseSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      showToast('Minimal harus ada 1 sesi penilaian aktif.');
      return;
    }
    const remaining = sessions.filter(s => s.id !== sessionId);
    setSessions(remaining);
    if (activeTabId === sessionId) {
      setActiveTabId(remaining[0].id);
    }
  };

  // =========================================================================
  // BATCH MANAGEMENT CRUD HANDLERS
  // =========================================================================
  // =========================================================================
  // BATCH MANAGEMENT CRUD HANDLERS
  // =========================================================================
  const handleOpenCreateBatch = () => {
    setEditingBatch({
      id: `batch-ob-${Date.now()}`,
      nomor_batch: `B0${batches.length + 1}`,
      nama_batch: `Batch Onboarding TC ${new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`,
      tanggal_mulai: new Date().toISOString().split('T')[0],
      tanggal_selesai: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      status: 'Berjalan',
      kode_outlet_lokasi: 'Kantor Lempongsari',
      lead_trainer: isCustomPenilai ? (customPenilai || 'Haikal') : namaPenilai,
      peserta: [],
    });
    setBatchFormMode('create');
    setIsAddingManualParticipant(false);
    setIsBatchModalOpen(true);
  };

  const handleOpenEditBatch = () => {
    const currentBatch = batches.find(b => b.id === selectedBatchId);
    if (!currentBatch) {
      showToast('Pilih batch yang ingin diedit terlebih dahulu.');
      return;
    }
    setEditingBatch({ ...currentBatch });
    setBatchFormMode('edit');
    setIsAddingManualParticipant(false);
    setIsBatchModalOpen(true);
  };

  const handleDeleteCurrentBatch = () => {
    const currentBatch = batches.find(b => b.id === selectedBatchId);
    if (!currentBatch) {
      showToast('Pilih batch yang ingin dihapus.');
      return;
    }
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Batch Onboarding',
      message: 'Apakah Anda yakin ingin menghapus kelas batch ini? Data peserta akan tetap aman di master kru.',
      detailText: `Batch: ${currentBatch.nama_batch} (${currentBatch.nomor_batch})`,
      onConfirm: () => {
        db.deleteOnboardingBatch(currentBatch.id);
        const updatedBatches = db.getOnboardingBatches();
        setBatches(updatedBatches);
        setSelectedBatchId('ALL');
        showToast(`Batch "${currentBatch.nama_batch}" berhasil dihapus.`);
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddManualParticipantToBatch = () => {
    if (!manualNamaInput.trim()) {
      showToast('Nama peserta manual wajib diisi.');
      return;
    }
    const cleanNama = manualNamaInput.trim();
    const newParticipant = {
      kru_id: `kru-m-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      nama_kru: cleanNama,
      kode_outlet: manualOutletInput || 'HC-GTG01',
      divisi: manualDivisiInput || 'Kitchen',
      tipe: manualTipeInput,
      tanggal_masuk: new Date().toISOString().split('T')[0],
      hari_kerja: 1,
      absensi: { 1: true, 2: true },
      nilai_evaluasi: {},
      nilai_praktik_rnd: 0,
      survey_kepuasan: 5,
      status_kelulusan: 'Sedang Berjalan' as const,
      catatan: `Peserta Manual Batch`,
    };

    setEditingBatch(prev => {
      if (!prev) return null;
      const currentPeserta = Array.isArray(prev.peserta) ? prev.peserta : [];
      return {
        ...prev,
        peserta: [...currentPeserta, newParticipant]
      };
    });

    setManualNamaInput('');
    setIsAddingManualParticipant(false);
    showToast(`Peserta "${cleanNama}" ditambahkan ke daftar batch.`);
  };

  const handleRemoveParticipantFromBatch = (kruNama: string) => {
    setEditingBatch(prev => {
      if (!prev) return null;
      const currentPeserta = Array.isArray(prev.peserta) ? prev.peserta : [];
      return {
        ...prev,
        peserta: currentPeserta.filter(p => p.nama_kru !== kruNama)
      };
    });
    showToast(`Peserta "${kruNama}" dikeluarkan dari batch.`);
  };

  const handleSaveBatchForm = () => {
    if (!editingBatch || !editingBatch.nama_batch?.trim()) {
      showToast('Nama batch wajib diisi.');
      return;
    }

    const fullBatch: OnboardingBatch = {
      id: editingBatch.id || `batch-ob-${Date.now()}`,
      nomor_batch: editingBatch.nomor_batch || `B0${batches.length + 1}`,
      nama_batch: editingBatch.nama_batch.trim(),
      tanggal_mulai: editingBatch.tanggal_mulai || new Date().toISOString().split('T')[0],
      tanggal_selesai: editingBatch.tanggal_selesai || new Date().toISOString().split('T')[0],
      kuota_min: editingBatch.kuota_min || 11,
      kuota_max: editingBatch.kuota_max || 17,
      status: editingBatch.status || 'Berjalan',
      kode_outlet_lokasi: editingBatch.kode_outlet_lokasi || 'Kantor Lempongsari',
      lead_trainer: editingBatch.lead_trainer || 'Haikal Abi',
      peserta: Array.isArray(editingBatch.peserta) ? editingBatch.peserta : [],
      created_at: editingBatch.created_at || new Date().toISOString(),
    };

    // Auto save any new manual participants into Master Kru (kru table)
    const existingKrus = db.getTable<Kru>('kru');
    const newKrusToSave: Kru[] = [];
    fullBatch.peserta.forEach(p => {
      const exists = existingKrus.some(k => k.nama_kru.toLowerCase().trim() === p.nama_kru.toLowerCase().trim());
      if (!exists) {
        const newKruItem: Kru = {
          id: p.kru_id || `kru-m-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          nama_kru: p.nama_kru,
          divisi: p.divisi || 'Kitchen',
          kode_outlet: p.kode_outlet || 'HC-GTG01',
          tanggal_masuk: p.tanggal_masuk || new Date().toISOString().split('T')[0],
          status_aktif: 'Aktif',
          catatan: `Manual dimasukkan via Batch ${fullBatch.nama_batch}`,
          created_at: new Date().toISOString(),
        };
        newKrusToSave.push(newKruItem);
      }
    });

    if (newKrusToSave.length > 0) {
      const updatedKruList = [...existingKrus, ...newKrusToSave];
      db.setTable('kru', updatedKruList);
      setKruList(updatedKruList);
    }

    db.saveOnboardingBatch(fullBatch);
    const refreshed = db.getOnboardingBatches();
    setBatches(refreshed);
    setSelectedBatchId(fullBatch.id);
    setIsBatchModalOpen(false);
    showToast(`Batch "${fullBatch.nama_batch}" berhasil ${batchFormMode === 'create' ? 'dibuat' : 'diperbarui'}!`);
  };

  // =========================================================================
  // SOP TARGET TIME EDITOR HANDLERS
  // =========================================================================
  const handleOpenSOPTargetEditor = () => {
    setSopEditTargetProd(currentProductDef);
    setSopEditStdDetik(currentProductDef.stdDetik);
    setSopEditPersiapanDetik(currentProductDef.tahapanWaktu?.persiapanDetik || (currentProductDef.stdDetik >= 600 ? 180 : 45));
    setSopEditMasakDetik(currentProductDef.tahapanWaktu?.prosesMasakDetik || (currentProductDef.stdDetik >= 600 ? 720 : (currentProductDef.stdDetik - 90)));
    setSopEditFinishingDetik(currentProductDef.tahapanWaktu?.finishingPlatingDetik || (currentProductDef.stdDetik >= 600 ? 120 : 45));
    setIsSOPTargetModalOpen(true);
  };

  const handleSaveSOPTarget = () => {
    if (!sopEditTargetProd) return;
    const computedTotal = Number(sopEditPersiapanDetik) + Number(sopEditMasakDetik) + Number(sopEditFinishingDetik);
    const finalTotal = computedTotal > 0 ? computedTotal : Number(sopEditStdDetik);

    const updatedProductItem: OnboardingProductItem = {
      ...sopEditTargetProd,
      stdDetik: finalTotal,
      tahapanWaktu: {
        persiapanDetik: Number(sopEditPersiapanDetik),
        prosesMasakDetik: Number(sopEditMasakDetik),
        finishingPlatingDetik: Number(sopEditFinishingDetik),
        keterangan: `Akumulasi ${Math.round(finalTotal / 60)} mnt: Persiapan ${Math.round(sopEditPersiapanDetik / 60)}m + Masak ${Math.round(sopEditMasakDetik / 60)}m + Tiris/Plating ${Math.round(sopEditFinishingDetik / 60)}m`
      },
    };

    const existingIdx = customProducts.findIndex(p => p.id === sopEditTargetProd.id);
    let updatedList: OnboardingProductItem[];
    if (existingIdx >= 0) {
      updatedList = [...customProducts];
      updatedList[existingIdx] = updatedProductItem;
    } else {
      updatedList = [...customProducts, updatedProductItem];
    }

    setCustomProducts(updatedList);
    db.setTable('bank_sop_products', updatedList);

    // Auto-sync ke Supabase
    import('../../lib/supabase').then(({ syncRecordToSupabase }) => {
      syncRecordToSupabase('bank_sop_products', updatedProductItem).catch(() => {});
    }).catch(() => {});

    setIsSOPTargetModalOpen(false);
    showToast(`Target waktu SOP "${sopEditTargetProd.nama}" diperbarui ke ${finalTotal} detik (${Math.round(finalTotal / 60)} menit).`);
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

  // =========================================================================
  // KALKULASI SKOR INDIVIDU (PROSEDUR 40%, WAKTU AKUMULASI 30%, KNOWLEDGE 30%)
  // =========================================================================
  const calculatedScores = useMemo(() => {
    if (!activeSession || !currentProductDef) {
      return {
        skorProsedur: 100,
        skorWaktu: 100,
        skorKnowledge: 100,
        skorAkhir: 100,
        isKompetenMandiri: true,
        isLulusPendampingan: false,
        isRemedial: false,
        statusKelulusan: 'KOMPETEN MANDIRI',
        hasTitikKritisViolation: false,
        failedCriticalPoints: [] as string[],
        timeDiff: 0,
      };
    }

    // 1. Prosedur SOP (Bobot: 40%)
    const totalSteps = activeSession.stepChecklist.length;
    const passedSteps = activeSession.stepChecklist.filter(s => s.tercapai).length;
    let skorProsedur = totalSteps > 0 ? Math.round((passedSteps / totalSteps) * 100) : 100;

    // Check critical point violations
    const missedKritis = activeSession.stepChecklist.filter(s => s.isKritis && !s.tercapai);
    const failedCriticalPoints = missedKritis.map(m => m.langkah);

    // Suhu fryer critical check
    if (currentProductDef.requiresOilTemp && currentProductDef.targetSuhuMinyak) {
      const tempDiff = Math.abs((activeSession.suhuMinyakProbe || 0) - currentProductDef.targetSuhuMinyak);
      if (tempDiff > 5) {
        failedCriticalPoints.push(`Deviasi Suhu Fryer (${activeSession.suhuMinyakProbe}°C vs Target ${currentProductDef.targetSuhuMinyak}°C)`);
      }
    }

    // Gramatur critical check
    if (currentProductDef.requiresGramatur && currentProductDef.targetGramatur) {
      const gramDiff = Math.abs((activeSession.gramaturAktual || 0) - currentProductDef.targetGramatur);
      const pctGram = (gramDiff / currentProductDef.targetGramatur) * 100;
      if (pctGram > 15) {
        failedCriticalPoints.push(`Deviasi Gramatur (${activeSession.gramaturAktual}g vs Target ${currentProductDef.targetGramatur}g)`);
      }
    }

    const hasTitikKritisViolation = failedCriticalPoints.length > 0;
    if (hasTitikKritisViolation) {
      skorProsedur = Math.min(skorProsedur, 65);
    }

    // 2. Kecepatan Waktu Akumulasi (Persiapan s/d Produk Jadi) (Bobot: 30%)
    const targetDetik = currentProductDef.stdDetik;
    const actualDetik = activeSession.timerSeconds;
    const timeDiff = actualDetik - targetDetik;
    let skorWaktu = 100;
    if (actualDetik > targetDetik) {
      const overSec = actualDetik - targetDetik;
      const penalty = Math.min(60, Math.floor(overSec / 5) * 5);
      skorWaktu = Math.max(40, 100 - penalty);
    }

    // 3. Knowledge SOP Lisan (Bobot: 30%)
    const skorKnowledge = activeSession.skorKnowledge;

    // Nilai Akhir Individu: Prosedur 40% + Waktu Akumulasi 30% + Knowledge 30% = 100%
    let skorAkhir = Math.round(
      skorProsedur * 0.40 +
      skorWaktu * 0.30 +
      skorKnowledge * 0.30
    );

    if (hasTitikKritisViolation) {
      skorAkhir = Math.min(skorAkhir, 75);
    }

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
      skorKnowledge,
      skorAkhir,
      isKompetenMandiri,
      isLulusPendampingan,
      isRemedial,
      statusKelulusan,
      hasTitikKritisViolation,
      failedCriticalPoints,
      timeDiff,
    };
  }, [activeSession, currentProductDef]);

  // Handle Save / Submit Individual Assessment
  const handleSaveAssessment = () => {
    if (!activeSession) return;

    const finalPenilai = isCustomPenilai ? (customPenilai.trim() || 'Haikal') : namaPenilai;
    const effectiveKruNama = activeSession.isManualName
      ? (activeSession.manualNameInput.trim() || 'Peserta Mandiri')
      : activeSession.namaKru;

    const newRecord: PenilaianPraktikOnboardingProduk = {
      id: `prak-${Date.now()}`,
      tanggal: tanggalUji,
      batch_id: selectedBatchId !== 'ALL' ? selectedBatchId : '',
      nama_batch: selectedBatchId !== 'ALL' ? (batches.find(b => b.id === selectedBatchId)?.nama_batch || '') : '',
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
      suhu_minyak_aktual: currentProductDef.requiresOilTemp ? activeSession.suhuMinyakProbe : 0,
      gramatur_aktual: currentProductDef.requiresGramatur ? activeSession.gramaturAktual : 0,
      skor_prosedur: calculatedScores.skorProsedur,
      skor_waktu: calculatedScores.skorWaktu,
      subskor_teknis: calculatedScores.subskorTeknis,
      skor_kebersihan: calculatedScores.skorKebersihan,
      skor_kerjasama: calculatedScores.skorKerjaSama,
      skor_keaktifan: calculatedScores.skorKeaktifan,
      skor_ketepatan: calculatedScores.skorKetepatan,
      subskor_sikap: calculatedScores.subskorSikap,
      skor_akhir: calculatedScores.skorAkhir,
      status: calculatedScores.statusKelulusan,
      status_kelulusan: calculatedScores.statusKelulusan,
      gagal_titik_kritis: calculatedScores.hasTitikKritisViolation,
      titik_kritis_gagal_detail: calculatedScores.failedCriticalPoints,
      penilai_nama: finalPenilai,
      catatan: activeSession.catatanTrainer || (calculatedScores.isKompetenMandiri ? 'Praktik sangat rapi dan sesuai SOP.' : 'Dibutuhkan pendampingan lanjutan.'),
      checklist_langkah: (activeSession.stepChecklist || []).map(s => ({
        nomor: s.nomor,
        langkah: s.langkah,
        tercapai: !!s.tercapai,
      })),
      created_at: new Date().toISOString(),
    };

    // 1. Simpan ke Local Storage & Supabase Database
    db.savePenilaianPraktikProduk(newRecord);
    setHistoryList(db.getPenilaianPraktikProduk());
    updateActiveSession({ isSaved: true });

    // 2. Kirim otomatis ke Google Spreadsheet Webhook
    syncPenilaianToGoogleSheets(newRecord).then((sheetRes) => {
      if (sheetRes.success) {
        showToast(`Tersimpan ke Supabase & Google Spreadsheet! (${effectiveKruNama} - ${calculatedScores.statusKelulusan})`);
      } else {
        showToast(`Tersimpan ke Supabase! Info: ${sheetRes.message}`);
      }
    });

    if (calculatedScores.isKompetenMandiri) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  // Helper filter riwayat penilaian praktik
  const filteredHistoryList = useMemo(() => {
    return historyList.filter(item => {
      if (historyBatchFilter !== 'ALL' && item.batch_id !== historyBatchFilter && item.nama_batch !== historyBatchFilter) {
        return false;
      }
      if (historyStatusFilter !== 'ALL') {
        if (historyStatusFilter === 'GRADE_A' && !item.status.includes('GRADE A') && item.skor_akhir < 85) return false;
        if (historyStatusFilter === 'GRADE_B' && !item.status.includes('GRADE B') && (item.skor_akhir < 75 || item.skor_akhir >= 85)) return false;
        if (historyStatusFilter === 'REMEDIAL' && !item.status.includes('REMEDIAL') && !item.gagal_titik_kritis && item.skor_akhir >= 75) return false;
      }
      if (historySearchQuery.trim()) {
        const q = historySearchQuery.toLowerCase();
        const matchKru = item.nama_kru?.toLowerCase().includes(q);
        const matchProduk = item.produk_nama?.toLowerCase().includes(q);
        const matchOutlet = item.kode_outlet?.toLowerCase().includes(q) || item.nama_outlet?.toLowerCase().includes(q);
        const matchPenilai = item.penilai_nama?.toLowerCase().includes(q);
        if (!matchKru && !matchProduk && !matchOutlet && !matchPenilai) return false;
      }
      return true;
    });
  }, [historyList, historyBatchFilter, historyStatusFilter, historySearchQuery]);

  const handleOpenDeleteHistoryModal = (item: PenilaianPraktikOnboardingProduk) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Riwayat Penilaian Praktik?',
      message: `Apakah Anda yakin ingin menghapus data penilaian ${item.nama_kru} (${item.produk_nama})?`,
      detailText: `Skor Akhir: ${item.skor_akhir} • Tanggal: ${item.tanggal}. Tindakan ini akan menghapus data dari memori lokal dan cloud Supabase.`,
      onConfirm: () => {
        db.deletePenilaianPraktikProduk(item.id);
        setHistoryList(db.getPenilaianPraktikProduk());
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        showToast(`Penilaian "${item.nama_kru} - ${item.produk_nama}" berhasil dihapus.`);
      }
    });
  };

  const handleSyncAllToGoogleSheets = async () => {
    if (historyList.length === 0) {
      showToast('Belum ada data penilaian untuk disinkronkan.');
      return;
    }
    setIsSyncingAllSheets(true);
    showToast(`Mengirim ${historyList.length} rekaman penilaian ke Google Spreadsheet...`);
    let successCount = 0;
    for (const record of historyList) {
      try {
        const res = await syncPenilaianToGoogleSheets(record);
        if (res.success) successCount++;
      } catch {
        // continue
      }
    }
    setIsSyncingAllSheets(false);
    showToast(`Sinkronisasi selesai: ${successCount} dari ${historyList.length} data terkirim ke Spreadsheet.`);
  };

  // =========================================================================
  // PERHITUNGAN SKOR EVALUASI INDIVIDU (KEBERSIHAN, KEAKTIFAN & SIKAP KRU)
  // =========================================================================
  const skorGrooming = useMemo(() => {
    let s = 0;
    if (formGrooming.apron_bersih) s += 9;
    if (formGrooming.hairnet_topi_rapi) s += 8;
    if (formGrooming.kuku_pendek_bersih) s += 8;
    return s;
  }, [formGrooming]);

  const skorSanitasi = useMemo(() => {
    let s = 0;
    if (formSanitasi.clean_as_you_go) s += 7;
    if (formSanitasi.lantai_kering) s += 6;
    if (formSanitasi.buang_remahan_sampah) s += 6;
    if (formSanitasi.cegah_kontaminasi) s += 6;
    return s;
  }, [formSanitasi]);

  const skorKeaktifan = useMemo(() => {
    let s = 0;
    if (formKeaktifan.proaktif_bertanya) s += 7;
    if (formKeaktifan.tanggap_rush) s += 6;
    if (formKeaktifan.inisiatif_prep) s += 6;
    if (formKeaktifan.sigap_rotasi) s += 6;
    return s;
  }, [formKeaktifan]);

  const skorKerapianAlat = useMemo(() => {
    let s = 0;
    if (formKerapianAlat.penempatan_tong) s += 9;
    if (formKerapianAlat.tata_skimmer_baskom) s += 8;
    if (formKerapianAlat.botol_saus_bersih) s += 8;
    return s;
  }, [formKerapianAlat]);

  const skorTotalSikap = useMemo(() => {
    return skorGrooming + skorSanitasi + skorKeaktifan + skorKerapianAlat;
  }, [skorGrooming, skorSanitasi, skorKeaktifan, skorKerapianAlat]);

  const predikatSikap: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Pembinaan' = useMemo(() => {
    if (skorTotalSikap >= 85) return 'Sangat Baik';
    if (skorTotalSikap >= 75) return 'Baik';
    if (skorTotalSikap >= 65) return 'Cukup';
    return 'Perlu Pembinaan';
  }, [skorTotalSikap]);

  const statusSikap: 'Lulus' | 'Catatan Perbaikan' = useMemo(() => {
    return skorTotalSikap >= 75 ? 'Lulus' : 'Catatan Perbaikan';
  }, [skorTotalSikap]);

  const handleSaveSikapKru = () => {
    const available = candidateKrus.length > 0 ? candidateKrus : kruList;
    const targetId = selectedSikapKruId || available[0]?.id;
    const candidateKru = available.find(k => k.id === targetId) || available[0] || kruList[0];
    if (!candidateKru) {
      showToast('Pilih peserta kru yang dinilai.');
      return;
    }

    const finalPenilai = isCustomPenilai ? (customPenilai.trim() || 'Haikal') : namaPenilai;
    const batchObj = batches.find(b => b.id === selectedBatchId);

    const newRecord: PenilaianSikapKebersihanKru = {
      id: `psk-${Date.now()}`,
      tanggal: tanggalUji,
      kru_id: candidateKru.id,
      nama_kru: candidateKru.nama_kru,
      batch_id: selectedBatchId !== 'ALL' ? selectedBatchId : (candidateKru.batch_id || ''),
      batch_name: batchObj ? batchObj.nama_batch : 'Onboarding Reguler',
      kode_outlet: selectedOutletCode !== 'ALL' ? selectedOutletCode : candidateKru.kode_outlet,
      station: formSikapStation,
      skor_grooming: skorGrooming,
      skor_sanitasi: skorSanitasi,
      skor_keaktifan: skorKeaktifan,
      skor_k3_disiplin: 0,
      skor_kerapian_alat: skorKerapianAlat,
      skor_total: skorTotalSikap,
      predikat: predikatSikap,
      status: statusSikap,
      catatan: formCatatanSikap.trim() || 'Observasi kebersihan, keaktifan, dan sikap kerja telah direkam.',
      penilai_nama: finalPenilai,
      created_at: new Date().toISOString(),
    };

    db.savePenilaianSikapKebersihanKru(newRecord);
    setSikapList(db.getPenilaianSikapKebersihanKru());
    setFormCatatanSikap('');
    showToast(`Penilaian sikap & kebersihan "${candidateKru.nama_kru}" berhasil disimpan! Skor: ${skorTotalSikap}`);
  };

  const handleOpenDeleteSikapModal = (item: PenilaianSikapKebersihanKru) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Penilaian Sikap & Kebersihan',
      message: 'Apakah Anda yakin ingin menghapus data penilaian sikap & kebersihan ini?',
      detailText: `Kru: ${item.nama_kru} — Skor: ${item.skor_total} (${item.tanggal})`,
      onConfirm: () => {
        db.deletePenilaianSikapKebersihanKru(item.id);
        setSikapList(db.getPenilaianSikapKebersihanKru());
        showToast(`Catatan penilaian sikap "${item.nama_kru}" berhasil dihapus.`);
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const filteredSikapList = useMemo(() => {
    return sikapList.filter(item => {
      if (sikapFilterKru !== 'ALL' && item.kru_id !== sikapFilterKru) return false;
      return true;
    });
  }, [sikapList, sikapFilterKru]);

  // Sync to Firestore
  const handleSyncCohort = async () => {
    showToast('Menyinkronkan data onboarding ke Cloud Firestore...');
    try {
      await syncAllToFirestore();
      showToast('Sinkronisasi data ke Cloud Firestore berhasil diselesaikan!');
    } catch {
      showToast('Data tersimpan secara lokal dan akan disinkron saat online.');
    }
  };

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
          SUB-TAB NAVIGATION BAR: PRAKTIK PRODUK (INDIVIDU) VS JOBDESK & STASIUN (TIM/SHIFT)
          =================================================================== */}
      <div className="p-1.5 bg-[#FAF8F5] rounded-2xl border border-[#E6E1DA] flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('produk')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeSubTab === 'produk'
                ? 'bg-[#96171B] text-white border-[#96171B] shadow-2xs'
                : 'bg-white text-[#181411] border-[#E6E1DA] hover:border-neutral-400'
            }`}
          >
            <UtensilsCrossed size={15} />
            <span>Praktik Produk & Sikap (Individu)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
              activeSubTab === 'produk' ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-[#645D55]'
            }`}>
              2 Pilar KKM 75
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('riwayat')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeSubTab === 'riwayat'
                ? 'bg-[#96171B] text-white border-[#96171B] shadow-2xs'
                : 'bg-white text-[#181411] border-[#E6E1DA] hover:border-neutral-400'
            }`}
          >
            <FileText size={15} />
            <span>Riwayat & Rekap Penilaian</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
              activeSubTab === 'riwayat' ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-[#645D55]'
            }`}>
              {historyList.length} Rekap
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('jobdesk')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeSubTab === 'jobdesk'
                ? 'bg-[#96171B] text-white border-[#96171B] shadow-2xs'
                : 'bg-white text-[#181411] border-[#E6E1DA] hover:border-neutral-400'
            }`}
          >
            <ClipboardCheck size={15} />
            <span>Detail Sikap & Higiene</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
              activeSubTab === 'jobdesk' ? 'bg-white/20 text-white' : 'bg-[#FAF8F5] text-[#645D55]'
            }`}>
              5 Dimensi
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('peserta')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
              activeSubTab === 'peserta'
                ? 'bg-[#96171B] text-white border-[#96171B] shadow-2xs'
                : 'bg-white text-[#181411] border-[#E6E1DA] hover:border-neutral-400'
            }`}
          >
            <Users size={15} />
            <span>Kelola Peserta ({pesertaMatrix.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#645D55] px-2 py-1">
          <Building2 size={13} className="text-[#96171B]" />
          <span>Master: 25 Produk SOP • Kebersihan & Sikap • 12 Peserta & 7 Kriteria (KKM 75)</span>
        </div>
      </div>

      {/* ===================================================================
          BAR ATAS: PILIH PENILAI, BATCH, & TANGGAL
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-[#645D55] uppercase text-[10.5px]">Batch Kelas:</span>
            <select
              value={selectedBatchId}
              onChange={(e) => {
                const bId = e.target.value;
                setSelectedBatchId(bId);
                const chosenBatch = batches.find(b => b.id === bId);
                if (chosenBatch) {
                  updateActiveSession({
                    batch: `${chosenBatch.nomor_batch} - ${chosenBatch.nama_batch}`,
                  });
                }
              }}
              className="p-1.5 rounded-lg border border-[#E6E1DA] bg-white text-xs font-semibold max-w-[220px] truncate"
            >
              <option value="ALL">Onboarding Umum (Semua Kru)</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.nomor_batch} - {b.nama_batch} ({b.peserta?.length || 0} Kru)</option>
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
          <button
            type="button"
            onClick={handleOpenSOPTargetEditor}
            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            title="Sesuaikan Target Waktu SOP Baku"
          >
            <Clock size={14} className="text-amber-700" />
            <span>Target SOP</span>
          </button>

          {onOpenFullAuditLog && (
            <button
              type="button"
              onClick={onOpenFullAuditLog}
              className="px-3 py-1.5 rounded-lg border border-[#E6E1DA] hover:border-[#96171B] text-[#181411] hover:text-[#96171B] text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <FileText size={14} />
              <span>Log Aktivitas</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSyncCohort}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            title="Sinkronkan data ke Cloud Firestore & Supabase"
          >
            <RefreshCw size={14} />
            <span>Sinkronkan Cloud</span>
          </button>

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
          SUB-TAB 1: PRAKTIK PRODUK (INDIVIDU)
          =================================================================== */}
      {activeSubTab === 'produk' && (
        <div className="space-y-6">
          {/* CONCURRENT MULTI-KRU ASSESSMENT TABS BAR */}
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

            {/* Action Buttons: Add Single / Batch Crew */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setBatchCrewModalOpen(true)}
                className="px-3.5 py-2 rounded-lg border border-[#181411] bg-white hover:bg-slate-50 text-[#181411] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Buka banyak kru sekaligus dari master kru"
              >
                <Users size={14} className="text-[#96171B]" />
                <span>Buka Kru Sekaligus</span>
              </button>

              <button
                type="button"
                onClick={handleAddNewSession}
                className="px-3.5 py-2 rounded-lg border border-dashed border-[#96171B] bg-red-50/40 text-[#96171B] hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>+ 1 Kru</span>
              </button>
            </div>
          </div>

          {/* ACTIVE SESSION CONTROLS: PESERTA & SEARCHABLE PRODUCT SELECTOR */}
          {activeSession && (
            <div className="p-5 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Peserta Praktik (Clean Crew Selector without hardcoded pills) */}
                <div className="lg:col-span-5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider flex items-center gap-1">
                      <User size={13} />
                      <span>Kru yang Dinilai:</span>
                    </label>

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
                          const selectedK = candidateKrus.find(k => k.id === e.target.value);
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
                        {candidateKrus.map((k) => (
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

                {/* PRODUCT CARD SELECTOR */}
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
                          {currentProductDef.stationLabel} • Target Akumulasi {Math.round(currentProductDef.stdDetik / 60)} mnt ({currentProductDef.stdDetik}s)
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

                  {/* 3-Stage Target Breakdown from Master PDF */}
                  {currentProductDef.tahapanWaktu && (
                    <div className="mt-3 pt-3 border-t border-[#E6E1DA] grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-[#E6E1DA]">
                        <span className="text-[10px] font-bold text-[#645D55] uppercase block">1. Prep Alat & Bahan:</span>
                        <span className="text-sm font-extrabold text-[#181411] font-mono">
                          {currentProductDef.tahapanWaktu.persiapanMenit} Mnt
                        </span>
                        <span className="text-[10.5px] text-[#645D55] block">({currentProductDef.tahapanWaktu.persiapanDetik} detik)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#E6E1DA]">
                        <span className="text-[10px] font-bold text-[#645D55] uppercase block">2. Masak / Rebus Inti:</span>
                        <span className="text-sm font-extrabold text-[#181411] font-mono">
                          {currentProductDef.tahapanWaktu.prosesMasakMenit} Mnt
                        </span>
                        <span className="text-[10.5px] text-[#645D55] block">({currentProductDef.tahapanWaktu.prosesMasakDetik} detik)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#E6E1DA]">
                        <span className="text-[10px] font-bold text-[#645D55] uppercase block">3. Saji & Packing:</span>
                        <span className="text-sm font-extrabold text-[#181411] font-mono">
                          {currentProductDef.tahapanWaktu.finishingPlatingMenit} Mnt
                        </span>
                        <span className="text-[10.5px] text-[#645D55] block">({currentProductDef.tahapanWaktu.finishingPlatingDetik} detik)</span>
                      </div>
                    </div>
                  )}
                  {currentProductDef.alatBahan && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950">
                      <span className="font-bold uppercase tracking-wider block text-[10px] text-amber-900 mb-0.5">Persiapan Peralatan & Takaran Bahan Baku (SOP):</span>
                      <p className="leading-relaxed">{currentProductDef.alatBahan}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MAIN ASSESSMENT SPLIT:
              LEFT: STOPWATCH AKUMULASI WAKTU, PARAMETER TEKNIS, & SOP STEPS
              RIGHT: INDIVIDUAL SCORING CARD & KNOWLEDGE QUESTIONS */}
          {activeSession && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: STOPWATCH AKUMULASI, SUHU/GRAMASI, CHECKLIST LANGKAH */}
              <div className="lg:col-span-7 space-y-6">
                {/* STOPWATCH CARD WITH AKUMULASI WAKTU TOTAL */}
                <div className="p-6 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                    <div>
                      <h3 className="font-bold text-sm text-[#181411] flex items-center gap-2">
                        <Clock size={16} className="text-[#96171B]" />
                        <span>Pengukuran Waktu Praktik (Akumulasi Persiapan s/d Produk Jadi)</span>
                      </h3>
                      <p className="text-xs text-[#645D55] mt-0.5">
                        Target waktu baku {currentProductDef.nama}: <strong>{currentProductDef.stdDetik} detik</strong> ({Math.round(currentProductDef.stdDetik / 60)} menit).
                        Mencakup persiapan bahan baku & dusting, proses penggorengan/masak, hingga penirisan dan siap saji.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenSOPTargetEditor}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      title="Ubah standar target waktu untuk produk ini"
                    >
                      <Clock size={12} className="text-amber-700" />
                      <span>Edit Target SOP</span>
                    </button>
                  </div>

                  {/* Stopwatch Controls */}
                  <div className="space-y-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-[#645D55] uppercase tracking-wider block">
                          Durasi Berjalan (Stopwatch):
                        </span>
                        <div className="text-4xl font-black font-mono tracking-tight text-[#181411] mt-0.5 flex items-baseline gap-2">
                          <span>{formatTime(activeSession.timerSeconds)}</span>
                          <span className="text-xs font-normal text-[#645D55]">
                            / target {formatTime(currentProductDef.stdDetik)}
                          </span>
                        </div>
                        
                        {/* Realtime Time Comparison Indicator */}
                        <div className="mt-1">
                          {activeSession.timerSeconds === 0 ? (
                            <span className="text-[11px] text-[#645D55]">Status: Belum dimulai</span>
                          ) : activeSession.timerSeconds <= currentProductDef.stdDetik ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              ✓ On-Track / Memenuhi Standar SOS HARA
                            </span>
                          ) : activeSession.timerSeconds <= currentProductDef.stdDetik + 30 ? (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              ⚠️ Deviasi Waktu Ringan (+{activeSession.timerSeconds - currentProductDef.stdDetik}s)
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                              ⛔ Bottleneck Waktu (+{activeSession.timerSeconds - currentProductDef.stdDetik}s)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateActiveSession({ isTimerRunning: !activeSession.isTimerRunning })}
                          className={`px-3.5 py-2 rounded-lg text-xs font-bold text-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeSession.isTimerRunning
                              ? 'bg-amber-600 hover:bg-amber-700'
                              : 'bg-[#96171B] hover:bg-[#7A1216]'
                          }`}
                        >
                          {activeSession.isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                          <span>{activeSession.isTimerRunning ? 'Jeda' : 'Mulai'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateActiveSession({ timerSeconds: currentProductDef.stdDetik, isTimerRunning: false })}
                          className="px-2.5 py-2 rounded-lg border border-[#E6E1DA] bg-white hover:bg-slate-50 text-[#181411] text-xs font-semibold transition-colors cursor-pointer"
                          title="Set waktu persis sesuai target akumulasi produk"
                        >
                          Set = Target ({currentProductDef.stdDetik}s)
                        </button>

                        <button
                          type="button"
                          onClick={() => updateActiveSession({ timerSeconds: Math.max(0, activeSession.timerSeconds + 30) })}
                          className="px-2 py-2 rounded-lg border border-[#E6E1DA] bg-white hover:bg-slate-50 text-[#181411] text-xs font-mono font-bold transition-colors cursor-pointer"
                          title="Tambah 30 detik"
                        >
                          +30s
                        </button>

                        <button
                          type="button"
                          onClick={() => updateActiveSession({ timerSeconds: Math.max(0, activeSession.timerSeconds - 30) })}
                          className="px-2 py-2 rounded-lg border border-[#E6E1DA] bg-white hover:bg-slate-50 text-[#181411] text-xs font-mono font-bold transition-colors cursor-pointer"
                          title="Kurang 30 detik"
                        >
                          -30s
                        </button>

                        <button
                          type="button"
                          onClick={() => updateActiveSession({ timerSeconds: 0, isTimerRunning: false })}
                          className="p-2 rounded-lg border border-[#E6E1DA] hover:bg-slate-100 text-[#645D55] hover:text-[#181411] text-xs font-semibold transition-colors cursor-pointer"
                          title="Reset stopwatch ke 00:00"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Live Progress Bar towards Standard Target */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] text-[#645D55]">
                        <span>Progres Waktu terhadap Target Standar ({currentProductDef.stdDetik}s):</span>
                        <span className="font-mono font-bold">
                          {Math.round((activeSession.timerSeconds / currentProductDef.stdDetik) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            activeSession.timerSeconds <= currentProductDef.stdDetik
                              ? 'bg-emerald-600'
                              : activeSession.timerSeconds <= currentProductDef.stdDetik + 30
                              ? 'bg-amber-500'
                              : 'bg-rose-600'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.round((activeSession.timerSeconds / currentProductDef.stdDetik) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Realistic Stage Breakdown Cards */}
                    {currentProductDef.tahapanWaktu && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E6E1DA]">
                        <div className="p-2.5 rounded-lg bg-white border border-[#E6E1DA] text-left">
                          <span className="text-[10px] font-bold text-[#645D55] uppercase block">
                            1. Persiapan & Dusting:
                          </span>
                          <span className="font-mono font-extrabold text-xs text-[#181411]">
                            {currentProductDef.tahapanWaktu.persiapanDetik || 180}s ({Math.round((currentProductDef.tahapanWaktu.persiapanDetik || 180) / 60)} mnt)
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white border border-[#E6E1DA] text-left">
                          <span className="text-[10px] font-bold text-[#645D55] uppercase block">
                            2. Masak / Fryer 160°C:
                          </span>
                          <span className="font-mono font-extrabold text-xs text-[#181411]">
                            {currentProductDef.tahapanWaktu.prosesMasakDetik || 720}s ({Math.round((currentProductDef.tahapanWaktu.prosesMasakDetik || 720) / 60)} mnt)
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-white border border-[#E6E1DA] text-left">
                          <span className="text-[10px] font-bold text-[#645D55] uppercase block">
                            3. Tiris & Plating:
                          </span>
                          <span className="font-mono font-extrabold text-xs text-[#181411]">
                            {currentProductDef.tahapanWaktu.finishingPlatingDetik || 120}s ({Math.round((currentProductDef.tahapanWaktu.finishingPlatingDetik || 120) / 60)} mnt)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Parameter Teknis Kondisional (Suhu Fryer / Gramatur) */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-[#181411]">
                      Pemeriksaan Parameter Teknis Baku Produk:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            Ukur dengan probe digital saat dropping ayam. Toleransi ±2°C.
                          </p>
                        </div>
                      ) : null}

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
                        Centang langkah yang dilaksanakan dengan tepat oleh kru.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#96171B] font-mono">
                      Bobot: 40%
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

              {/* RIGHT COLUMN: INDIVIDUAL SCORE CARD & KNOWLEDGE QUESTIONS */}
              <div className="lg:col-span-5 space-y-6">
                {/* SCORE SUMMARY CARD (STICKY) */}
                <div className="p-6 rounded-xl bg-[#181411] text-white shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        HASIL PENILAIAN PRAKTIK INDIVIDU
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

                  {/* Final Score */}
                  <div className="text-center py-2">
                    <div className="text-5xl font-black font-mono tracking-tight text-white">
                      {calculatedScores.skorAkhir}
                      <span className="text-lg font-normal text-gray-400 ml-1">/ 100</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Ambang Mandiri: <strong className="text-white">≥ 85 Poin & 0 Gagal Kritis</strong>
                    </p>
                  </div>

                  {/* 3-Pillar Breakdown */}
                  <div className="space-y-1.5 text-xs pt-2 border-t border-neutral-800 font-mono">
                    <div className="flex justify-between text-gray-300">
                      <span>1. Langkah Prosedur SOP (40%)</span>
                      <span className="font-bold text-white">{calculatedScores.skorProsedur} / 100</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>2. Waktu Akumulasi SOS (30%)</span>
                      <span className="font-bold text-white">{calculatedScores.skorWaktu} / 100</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>3. Knowledge SOP Lisan (30%)</span>
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
                        {calculatedScores.failedCriticalPoints.join(', ')}. Status otomatis Remedial.
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

                    <button
                      type="button"
                      onClick={() => {
                        const effName = activeSession.isManualName
                          ? (activeSession.manualNameInput.trim() || 'Peserta Mandiri')
                          : activeSession.namaKru;
                        const finalPenilai = isCustomPenilai ? (customPenilai.trim() || 'Haikal') : namaPenilai;
                        const recordToExport: PenilaianPraktikOnboardingProduk = {
                          id: `prak-${Date.now()}`,
                          tanggal: tanggalUji,
                          batch_id: selectedBatchId !== 'ALL' ? selectedBatchId : '',
                          nama_batch: selectedBatchId !== 'ALL' ? (batches.find(b => b.id === selectedBatchId)?.nama_batch || '') : '',
                          kode_outlet: activeSession.outletCode,
                          kru_id: activeSession.isManualName ? `manual-${Date.now()}` : activeSession.kruId,
                          nama_kru: effName,
                          divisi: currentProductDef.divisi,
                          day: activeSession.day,
                          batch_name: activeSession.batch,
                          station: activeSession.station,
                          station_label: currentProductDef.stationLabel,
                          produk_nama: activeSession.productNama,
                          waktu_detik: activeSession.timerSeconds,
                          target_detik: currentProductDef.stdDetik,
                          suhu_minyak_aktual: currentProductDef.requiresOilTemp ? activeSession.suhuMinyakProbe : 0,
                          gramatur_aktual: currentProductDef.requiresGramatur ? activeSession.gramaturAktual : 0,
                          skor_prosedur: calculatedScores.skorProsedur,
                          skor_waktu: calculatedScores.skorWaktu,
                          skor_kebersihan: 90,
                          skor_kerjasama: 90,
                          skor_knowledge: calculatedScores.skorKnowledge,
                          skor_akhir: calculatedScores.skorAkhir,
                          status: calculatedScores.statusKelulusan,
                          gagal_titik_kritis: calculatedScores.hasTitikKritisViolation,
                          titik_kritis_gagal_detail: calculatedScores.failedCriticalPoints,
                          penilai_nama: finalPenilai,
                          catatan: activeSession.catatanTrainer || (calculatedScores.isKompetenMandiri ? 'Praktik sangat rapi dan sesuai SOP.' : 'Dibutuhkan pendampingan lanjutan.'),
                          checklist_langkah: (activeSession.stepChecklist || []).map(s => ({
                            nomor: s.nomor,
                            langkah: s.langkah,
                            tercapai: !!s.tercapai,
                          })),
                          created_at: new Date().toISOString(),
                        };
                        exportPenilaianPraktikProdukPDF(recordToExport);
                      }}
                      className="w-full py-2.5 px-4 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} className="text-amber-400" />
                      <span>Unduh Lembar Evaluasi PDF (Resmi)</span>
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
                        className="w-full py-2.5 px-4 rounded-lg border border-neutral-700 hover:border-white text-gray-300 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Award size={14} className="text-amber-400" />
                        <span>Pratinjau Sertifikat Kelulusan</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* AUTO-GENERATED KNOWLEDGE QUESTIONS (30%) */}
                <div className="p-6 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
                    <div>
                      <h4 className="font-bold text-sm text-[#181411]">Knowledge SOP Lisan (30%)</h4>
                      <p className="text-[11px] text-[#645D55]">Uji pemahaman dasar resep & titik kritis</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#96171B]">
                      {activeSession.skorKnowledge} / 100
                    </span>
                  </div>

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
                              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
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
                              className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
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

                {/* CATATAN ASESOR / TRAINER */}
                <div className="p-6 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-2">
                  <label className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider block">
                    Catatan Asesor / Evaluasi Lapangan:
                  </label>
                  <textarea
                    value={activeSession.catatanTrainer || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      const pNotes = { ...(activeSession.productNotes || {}) };
                      pNotes[activeSession.productNama] = val;
                      updateActiveSession({
                        catatanTrainer: val,
                        productNotes: pNotes,
                      });
                    }}
                    placeholder={`Tuliskan catatan perbaikan atau apresiasi terhadap hasil praktik ${currentProductDef.nama}...`}
                    rows={3}
                    className="w-full p-2.5 rounded-lg border border-[#E6E1DA] text-xs text-[#181411] placeholder-[#645D55]/60 focus:outline-none focus:border-[#96171B]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 2: RIWAYAT & RAPOR EVALUASI ONBOARDING TERPADU (2 PILAR)
          =================================================================== */}
      {activeSubTab === 'riwayat' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E1DA] pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#96171B] uppercase tracking-wider block">
                  Rekapitulasi Evaluasi Kru • Standar KKM 75
                </span>
                <h3 className="text-lg font-black text-[#181411] tracking-tight mt-0.5">
                  Riwayat Penilaian Terpadu 2 Pilar (Teknis 50% & Sikap 50%)
                </h3>
                <p className="text-xs text-[#645D55] mt-1 leading-relaxed">
                  Menampilkan hasil observasi SOP, waktu akumulasi SOS, ujian knowledge lisan, kebersihan 5S, kerja sama tim, keaktifan, dan presisi gramasi/suhu.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportPenilaianToCSV(filteredHistoryList)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E6E1DA] text-xs font-bold text-[#181411] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <Download size={14} className="text-[#96171B]" />
                  <span>Ekspor CSV / Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncAllToGoogleSheets}
                  disabled={isSyncingAllSheets}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isSyncingAllSheets ? 'animate-spin' : ''} />
                  <span>{isSyncingAllSheets ? 'Menyinkronkan...' : 'Sinkron Google Sheet'}</span>
                </button>
              </div>
            </div>

            {/* Summary KPI Statistics */}
            {(() => {
              const total = filteredHistoryList.length;
              const sumScores = filteredHistoryList.reduce((acc, curr) => acc + curr.skor_akhir, 0);
              const avgScore = total > 0 ? (sumScores / total).toFixed(1) : '0';
              const passedCount = filteredHistoryList.filter(item => item.skor_akhir >= 75 && !item.gagal_titik_kritis).length;
              const passPct = total > 0 ? Math.round((passedCount / total) * 100) : 0;
              const gradeACount = filteredHistoryList.filter(item => item.skor_akhir >= 85 && !item.gagal_titik_kritis).length;
              const remedialCount = filteredHistoryList.filter(item => item.skor_akhir < 75 || item.gagal_titik_kritis).length;

              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                    <span className="text-[10px] font-bold text-[#645D55] uppercase block">Total Sesi Ujian</span>
                    <span className="text-2xl font-black text-[#181411] font-mono mt-0.5 block">{total}</span>
                    <span className="text-[10px] text-[#645D55]">Observasi Lapangan</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-900 uppercase block">Rata-rata Komposit</span>
                    <span className="text-2xl font-black text-[#96171B] font-mono mt-0.5 block">{avgScore}</span>
                    <span className="text-[10px] text-amber-800">Skor Komposit (KKM 75)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Kelulusan (≥75)</span>
                    <span className="text-2xl font-black text-emerald-900 font-mono mt-0.5 block">
                      {passPct}%
                    </span>
                    <span className="text-[10px] text-emerald-700">{passedCount} lulus ({gradeACount} Grade A)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-800 uppercase block">Remedial Kritis</span>
                    <span className="text-2xl font-black text-rose-900 font-mono mt-0.5 block">{remedialCount}</span>
                    <span className="text-[10px] text-rose-700">&lt; 75 atau titik kritis</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Table Card with Filter & Search */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1DA] pb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#96171B]" />
                <h4 className="font-bold text-sm text-[#181411]">
                  Data Observasi ({filteredHistoryList.length} Catatan)
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    placeholder="Cari kru / produk..."
                    className="p-2 pl-7 rounded-lg border border-[#E6E1DA] text-xs font-semibold bg-[#FAF8F5] focus:bg-white focus:border-[#96171B] w-40 sm:w-52"
                  />
                  <Search size={13} className="absolute left-2.5 top-3 text-neutral-400" />
                </div>

                {/* Filter Batch */}
                <select
                  value={historyBatchFilter}
                  onChange={(e) => setHistoryBatchFilter(e.target.value)}
                  className="p-2 rounded-lg border border-[#E6E1DA] text-xs font-semibold bg-white focus:border-[#96171B]"
                >
                  <option value="ALL">Semua Batch</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.nama_batch}</option>
                  ))}
                </select>

                {/* Filter Status */}
                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className="p-2 rounded-lg border border-[#E6E1DA] text-xs font-semibold bg-white focus:border-[#96171B]"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="GRADE_A">Grade A (Mahir ≥85)</option>
                  <option value="GRADE_B">Grade B (Kompeten 75-84.9)</option>
                  <option value="REMEDIAL">Remedial (&lt;75 / Kritis)</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-[#E6E1DA] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] font-bold text-[#645D55] uppercase text-[10px] border-b border-[#E6E1DA]">
                  <tr>
                    <th className="p-3">Tanggal & Sesi</th>
                    <th className="p-3">Peserta Kru & Batch</th>
                    <th className="p-3">Outlet & Station</th>
                    <th className="p-3">Produk SOP & Waktu</th>
                    <th className="p-3 text-center">Pilar 1: Teknis (50%)</th>
                    <th className="p-3 text-center">Pilar 2: Sikap (50%)</th>
                    <th className="p-3 text-center bg-red-50/50 text-[#96171B]">Skor Komposit</th>
                    <th className="p-3 text-center">Status Kelulusan</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1DA]">
                  {filteredHistoryList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-500 italic">
                        Belum ada riwayat penilaian praktik yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredHistoryList.map((item) => {
                      const isGradeA = item.skor_akhir >= 85 && !item.gagal_titik_kritis;
                      const isPass = item.skor_akhir >= 75 && !item.gagal_titik_kritis;
                      const pilar1 = item.subskor_teknis ?? Math.round((item.skor_prosedur * 0.4) + (item.skor_waktu * 0.3) + (item.skor_knowledge * 0.3));
                      const pilar2 = item.subskor_sikap ?? Math.round((item.skor_kebersihan * 0.3) + (item.skor_kerjasama * 0.25) + ((item.skor_keaktifan ?? 85) * 0.25) + ((item.skor_ketepatan ?? 85) * 0.2));

                      return (
                        <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-[#181411] block">{item.tanggal}</span>
                            <span className="text-[10px] text-[#645D55]">Penilai: {item.penilai_nama}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-extrabold text-[#181411] block">{item.nama_kru}</span>
                            <span className="text-[10px] text-[#645D55]">{item.nama_batch || 'Onboarding'}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-[#181411] block">{getFullOutletName(item.nama_outlet || item.kode_outlet)}</span>
                            <span className="text-[10px] text-[#645D55]">{item.station_label || item.station}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-[#181411] block">{item.produk_nama}</span>
                            <span className="text-[10px] font-mono text-[#645D55]">
                              Aktual: {formatDecimalMinutes(item.waktu_detik)} / Target: {formatDecimalMinutes(item.target_detik)}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono">
                            <span className="font-bold text-amber-900 block">{pilar1}</span>
                            <span className="text-[9px] text-[#645D55]">SOP {item.skor_prosedur} • SOS {item.skor_waktu}</span>
                          </td>
                          <td className="p-3 text-center font-mono">
                            <span className="font-bold text-emerald-800 block">{pilar2}</span>
                            <span className="text-[9px] text-[#645D55]">Bersih {item.skor_kebersihan} • Tim {item.skor_kerjasama}</span>
                          </td>
                          <td className="p-3 text-center font-mono bg-red-50/30">
                            <span className="font-black text-sm text-[#96171B] block">{item.skor_akhir}</span>
                            {item.gagal_titik_kritis && (
                              <span className="text-[9px] font-bold text-rose-700 block">Titik Kritis</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              isGradeA
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isPass
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {item.status || (isGradeA ? 'GRADE A' : isPass ? 'GRADE B' : 'REMEDIAL')}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => exportPenilaianPraktikProdukPDF(item)}
                                className="p-1.5 rounded-lg text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                                title="Unduh Lembar Evaluasi PDF"
                              >
                                <Download size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteHistoryModal(item)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus rekaman evaluasi"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'jobdesk' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1DA] pb-4">
              <div>
                <h3 className="text-base font-black text-[#181411] flex items-center gap-2">
                  <ClipboardCheck size={20} className="text-[#96171B]" />
                  <span>Formulir Penilaian Kebersihan & Sikap Kru (Individu)</span>
                </h3>
                <p className="text-xs text-[#645D55] mt-1">
                  Evaluasi personal aspek higienis, sanitasi stasiun kerja, keaktifan, kepatuhan K3, dan kerapian alat per peserta onboarding.
                </p>
              </div>

              {/* Combined Score Badge */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] text-right">
                  <span className="text-[10px] text-[#645D55] block uppercase font-bold">Skor Total Sikap</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black font-mono text-[#96171B]">{skorTotalSikap} / 100</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      statusSikap === 'Lulus' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {predikatSikap}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Header: Pilih Kru & Stasiun */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#645D55] uppercase text-[10.5px] mb-1">
                  Pilih Peserta Kru yang Dinilai:
                </label>
                <select
                  value={selectedSikapKruId || (candidateKrus[0]?.id || kruList[0]?.id || '')}
                  onChange={(e) => setSelectedSikapKruId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] font-bold text-[#181411] focus:outline-none focus:border-[#96171B]"
                >
                  {(candidateKrus.length > 0 ? candidateKrus : kruList).map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kru} ({k.kode_outlet} • {k.divisi})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#645D55] uppercase text-[10.5px] mb-1">
                  Stasiun Kerja Praktik:
                </label>
                <select
                  value={formSikapStation}
                  onChange={(e) => setFormSikapStation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] font-bold text-[#181411] focus:outline-none focus:border-[#96171B]"
                >
                  <option value="Stasiun 1: Nasi, Teh, & Sup">Stasiun 1: Nasi, Teh, & Sup</option>
                  <option value="Stasiun 2: Marinate, Breading, & Fryer">Stasiun 2: Marinate, Breading, & Fryer</option>
                  <option value="Stasiun 3: Sambal Cobek, Holding, Kasir/Packing">Stasiun 3: Sambal Cobek, Holding, Kasir/Packing</option>
                  <option value="All Stasiun: Kitchen & Service">All Stasiun: Kitchen & Service (Rotasi Penuh)</option>
                </select>
              </div>
            </div>

            {/* Checklist 4 Dimensi Evaluasi Individu */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Dimensi 1: Grooming (25 Poin) */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#181411] uppercase tracking-wider">
                    <User size={14} className="text-amber-600" />
                    <span>1. Grooming & Higiene (25%)</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-[#96171B]">{skorGrooming} / 25</span>
                </div>
                <div className="space-y-2 text-xs">
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formGrooming.apron_bersih}
                      onChange={(e) => setFormGrooming(p => ({ ...p, apron_bersih: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Apron Bersih & Rapi (+9)</span>
                      <span className="text-[#645D55] text-[10.5px]">Apron tidak kotor berminyak, terikat kencang.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formGrooming.hairnet_topi_rapi}
                      onChange={(e) => setFormGrooming(p => ({ ...p, hairnet_topi_rapi: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Hairnet / Topi Rapi (+8)</span>
                      <span className="text-[#645D55] text-[10.5px]">Rambut tertutup rapat tanpa helai keluar.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formGrooming.kuku_pendek_bersih}
                      onChange={(e) => setFormGrooming(p => ({ ...p, kuku_pendek_bersih: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Kuku Pendek & Bersih (+8)</span>
                      <span className="text-[#645D55] text-[10.5px]">Tanpa cat kuku, cincin, gelang, atau jam tangan.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dimensi 2: Sanitasi Meja Kerja (25 Poin) */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#181411] uppercase tracking-wider">
                    <Sparkles size={14} className="text-emerald-600" />
                    <span>2. Sanitasi Stasiun (25%)</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-[#96171B]">{skorSanitasi} / 25</span>
                </div>
                <div className="space-y-2 text-xs">
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formSanitasi.clean_as_you_go}
                      onChange={(e) => setFormSanitasi(p => ({ ...p, clean_as_you_go: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Clean-as-you-go (+7)</span>
                      <span className="text-[#645D55] text-[10.5px]">Meja stainless dilap bersih berkala setelah pakai.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formSanitasi.lantai_kering}
                      onChange={(e) => setFormSanitasi(p => ({ ...p, lantai_kering: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Lantai Stasiun Kering (+6)</span>
                      <span className="text-[#645D55] text-[10.5px]">Bebas genangan air atau ceceran minyak fryer.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formSanitasi.buang_remahan_sampah}
                      onChange={(e) => setFormSanitasi(p => ({ ...p, buang_remahan_sampah: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Kelola Sampah & Remahan (+6)</span>
                      <span className="text-[#645D55] text-[10.5px]">Remahan tepung disaring & dibuang tepat waktu.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formSanitasi.cegah_kontaminasi}
                      onChange={(e) => setFormSanitasi(p => ({ ...p, cegah_kontaminasi: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Zero Cross-Contamination (+6)</span>
                      <span className="text-[#645D55] text-[10.5px]">Pemisahan tegas wadah mentah vs produk matang.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dimensi 3: Keaktifan & Inisiatif (25 Poin) */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#181411] uppercase tracking-wider">
                    <Zap size={14} className="text-amber-500" />
                    <span>3. Keaktifan & Inisiatif (25%)</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-[#96171B]">{skorKeaktifan} / 25</span>
                </div>
                <div className="space-y-2 text-xs">
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formKeaktifan.proaktif_bertanya}
                      onChange={(e) => setFormKeaktifan(p => ({ ...p, proaktif_bertanya: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Proaktif & Responsif (+7)</span>
                      <span className="text-[#645D55] text-[10.5px]">Cepat tanggap merespons arahan & sop trainer.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formKeaktifan.tanggap_rush}
                      onChange={(e) => setFormKeaktifan(p => ({ ...p, tanggap_rush: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Tanggap Jam Sibuk (+6)</span>
                      <span className="text-[#645D55] text-[10.5px]">Tidak berdiam diri saat antrean pesanan masuk.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formKeaktifan.inisiatif_prep}
                      onChange={(e) => setFormKeaktifan(p => ({ ...p, inisiatif_prep: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Inisiatif Persiapan (+6)</span>
                      <span className="text-[#645D55] text-[10.5px]">Mempersiapkan kemasan/bahan sebelum kosong.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formKeaktifan.sigap_rotasi}
                      onChange={(e) => setFormKeaktifan(p => ({ ...p, sigap_rotasi: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Sigap Saat Rotasi (+6)</span>
                      <span className="text-[#645D55] text-[10.5px]">Adaptif dan cepat menyesuaikan di stasiun baru.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dimensi 4: Kerapian Alat Kerja (25 Poin) */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#181411] uppercase tracking-wider">
                    <UtensilsCrossed size={14} className="text-neutral-700" />
                    <span>4. Kerapian Alat (25%)</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-[#96171B]">{skorKerapianAlat} / 25</span>
                </div>
                <div className="space-y-2 text-xs">
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formKerapianAlat.penempatan_tong}
                      onChange={(e) => setFormKerapianAlat(p => ({ ...p, penempatan_tong: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Wadah Penjepit (Tong) (+9)</span>
                      <span className="text-[#645D55] text-[10.5px]">Penjepit tidak ditaruh sembarangan di atas meja.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formKerapianAlat.tata_skimmer_baskom}
                      onChange={(e) => setFormKerapianAlat(p => ({ ...p, tata_skimmer_baskom: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Skimmer & Baskom (+8)</span>
                      <span className="text-[#645D55] text-[10.5px]">Spider skimmer & baskom bumbu tersusun rapi.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 p-2 rounded-lg bg-white border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                    <input
                      type="checkbox"
                      checked={formKerapianAlat.botol_saus_bersih}
                      onChange={(e) => setFormKerapianAlat(p => ({ ...p, botol_saus_bersih: e.target.checked }))}
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                    />
                    <div>
                      <span className="font-bold text-[#181411] block">Botol Saus Bersih (+8)</span>
                      <span className="text-[#645D55] text-[10.5px]">Squeeze bottle tertutup & dilap tanpa belepotan.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Catatan Trainer & Tombol Simpan */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-bold text-[#645D55] uppercase text-[10.5px] mb-1">
                  Catatan Evaluasi Sikap & Masukan Trainer:
                </label>
                <textarea
                  rows={2}
                  value={formCatatanSikap}
                  onChange={(e) => setFormCatatanSikap(e.target.value)}
                  placeholder="Contoh: Kru sangat proaktif dan disiplin menjaga kebersihan meja stasiun fryer, perlu mempertahankan kerapian apron..."
                  className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs bg-white focus:outline-none focus:border-[#96171B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSaveSikapKru}
                  className="px-5 py-2.5 rounded-xl bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Save size={15} />
                  <span>Simpan Penilaian Sikap ({skorTotalSikap} Poin)</span>
                </button>
              </div>
            </div>
          </div>

          {/* TABEL RIWAYAT PENILAIAN KEBERSIHAN & SIKAP KRU (INDIVIDU) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1DA] pb-3">
              <div>
                <h4 className="font-bold text-sm text-[#181411] flex items-center gap-2">
                  <Sparkles size={16} className="text-[#96171B]" />
                  <span>Riwayat Penilaian Kebersihan & Sikap Kru ({filteredSikapList.length} Catatan)</span>
                </h4>
                <p className="text-xs text-[#645D55]">Rekam jejak grooming, sanitasi, keaktifan, K3, dan kerapian alat per individu kru</p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#645D55] font-semibold text-[11px]">Filter Kru:</span>
                <select
                  value={sikapFilterKru}
                  onChange={(e) => setSikapFilterKru(e.target.value)}
                  className="p-1.5 rounded-lg border border-[#E6E1DA] text-xs font-semibold bg-white focus:outline-none focus:border-[#96171B]"
                >
                  <option value="ALL">Semua Peserta Kru</option>
                  {kruList.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama_kru}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#E6E1DA] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] font-bold text-[#645D55] uppercase text-[10px] border-b border-[#E6E1DA]">
                  <tr>
                    <th className="p-3">Tanggal & Stasiun</th>
                    <th className="p-3">Nama Kru</th>
                    <th className="p-3 text-center">Grooming (20)</th>
                    <th className="p-3 text-center">Sanitasi (25)</th>
                    <th className="p-3 text-center">Keaktifan (25)</th>
                    <th className="p-3 text-center">K3 & Alat (30)</th>
                    <th className="p-3 text-center">Total Skor</th>
                    <th className="p-3">Catatan & Penilai</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1DA]">
                  {filteredSikapList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-gray-500 italic">
                        Belum ada data evaluasi sikap & kebersihan untuk filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredSikapList.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-[#181411] block">{item.tanggal}</span>
                          <span className="text-[10px] text-[#645D55]">
                            {item.station}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-[#181411]">
                          <span className="block font-bold">{item.nama_kru}</span>
                          <span className="text-[10px] text-[#645D55]">{item.batch_name}</span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold">
                          <span className={item.skor_grooming >= 15 ? 'text-emerald-700' : 'text-amber-700'}>
                            {item.skor_grooming}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold">
                          <span className={item.skor_sanitasi >= 20 ? 'text-emerald-700' : 'text-amber-700'}>
                            {item.skor_sanitasi}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold">
                          <span className={item.skor_keaktifan >= 20 ? 'text-emerald-700' : 'text-amber-700'}>
                            {item.skor_keaktifan}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-stone-700">
                          {item.skor_k3_disiplin + item.skor_kerapian_alat}
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-mono font-black text-sm text-[#96171B] block">
                            {item.skor_total}
                          </span>
                          <span className={`text-[9.5px] font-bold ${item.status === 'Lulus' ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {item.predikat}
                          </span>
                        </td>
                        <td className="p-3 text-[#645D55] max-w-xs">
                          <p className="truncate">{item.catatan}</p>
                          <span className="text-[10px] opacity-70">Penilai: {item.penilai_nama}</span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteSikapModal(item)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus penilaian sikap"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 3: MONITORING 12 PESERTA & 7 KRITERIA OBJEKTIF (KKM 75)
          Sesuai Dokumen Master HARA Halaman 5 & 6
          =================================================================== */}
      {activeSubTab === 'peserta' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E1DA] pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#96171B] uppercase tracking-wider block">
                  Standar Mutu Operasional HARA Chicken • Master Dokumen Resmi Hal 5 & 6
                </span>
                <h3 className="text-lg font-black text-[#181411] tracking-tight mt-0.5">
                  Lembar Penilaian Objektif Onboarding (7 Kriteria • KKM 75) & Monitoring 12 Peserta TC
                </h3>
                <p className="text-xs text-[#645D55] mt-1 leading-relaxed">
                  Evaluasi komposit terukur: <strong>1. Ketepatan (20%)</strong> • <strong>2. Langkah SOP (20%)</strong> • <strong>3. Kecepatan (15%)</strong> • <strong>4. Knowledge (15%)</strong> • <strong>5. Kerja Sama (10%)</strong> • <strong>6. Kebersihan (10%)</strong> • <strong>7. Keaktifan (10%)</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold font-mono">
                  KKM Minimum: 75.0 Poin
                </span>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                <span className="text-[10px] font-bold text-[#645D55] uppercase block">Total Peserta TC</span>
                <span className="text-2xl font-black text-[#181411] font-mono mt-0.5 block">12</span>
                <span className="text-[10px] text-[#645D55]">Peserta Terjadwal</span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Lulus Mahir (Grade A)</span>
                <span className="text-2xl font-black text-emerald-900 font-mono mt-0.5 block">
                  {pesertaMatrix.filter(p => (p.nilaiBawaan?.skorAkhir ?? 0) >= 85).length}
                </span>
                <span className="text-[10px] text-emerald-700">Skor ≥ 85.0 Poin</span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">Lulus Kompeten</span>
                <span className="text-2xl font-black text-blue-900 font-mono mt-0.5 block">
                  {pesertaMatrix.filter(p => (p.nilaiBawaan?.skorAkhir ?? 0) >= 75 && (p.nilaiBawaan?.skorAkhir ?? 0) < 85).length}
                </span>
                <span className="text-[10px] text-blue-700">KKM 75.0 – 84.9</span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">Wajib Remedial</span>
                <span className="text-2xl font-black text-rose-900 font-mono mt-0.5 block">
                  {pesertaMatrix.filter(p => (p.nilaiBawaan?.skorAkhir ?? 0) < 75).length}
                </span>
                <span className="text-[10px] text-rose-700">Skor &lt; 75.0 Poin</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">Rata-rata Skor</span>
                <span className="text-2xl font-black text-[#96171B] font-mono mt-0.5 block">
                  {(
                    pesertaMatrix.reduce((acc, p) => acc + (p.nilaiBawaan?.skorAkhir ?? 0), 0) /
                    (pesertaMatrix.length || 1)
                  ).toFixed(1)}
                </span>
                <span className="text-[10px] text-amber-800">Skor Komposit TC</span>
              </div>
            </div>
          </div>

          {/* TABLE: 12 PESERTA & 7 KRITERIA PENILAIAN OBJEKTIF */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1DA] pb-3">
              <div>
                <h4 className="font-bold text-sm text-[#181411] flex items-center gap-2">
                  <GraduationCap size={16} className="text-[#96171B]" />
                  <span>Matriks Nilai 12 Peserta Training Center (Page 5 PDF)</span>
                </h4>
                <p className="text-xs text-[#645D55]">
                  Data objektif hasil observasi pengujian praktik dan lisan komposit KKM 75
                </p>
              </div>

              <span className="text-xs font-mono text-[#645D55]">12 / 12 Peserta Lengkap</span>
            </div>

            <div className="overflow-x-auto border border-[#E6E1DA] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] font-bold text-[#645D55] uppercase text-[10px] border-b border-[#E6E1DA]">
                  <tr>
                    <th className="p-3 text-center">No</th>
                    <th className="p-3">Nama Peserta</th>
                    <th className="p-3">Outlet Penempatan</th>
                    <th className="p-3">Stasiun TC</th>
                    <th className="p-3">Paket Menu Praktik</th>
                    <th className="p-3 text-center" title="Akurasi timbangan & suhu (Bobot 20%)">1. Tepat (20%)</th>
                    <th className="p-3 text-center" title="Kepatuhan SOP (Bobot 20%)">2. SOP (20%)</th>
                    <th className="p-3 text-center" title="Kecepatan Waktu (Bobot 15%)">3. Cepat (15%)</th>
                    <th className="p-3 text-center" title="Knowledge Lisan (Bobot 15%)">4. Know (15%)</th>
                    <th className="p-3 text-center" title="Kerja Sama Tim (Bobot 10%)">5. Tim (10%)</th>
                    <th className="p-3 text-center" title="Kebersihan & Grooming (Bobot 10%)">6. Bersih (10%)</th>
                    <th className="p-3 text-center" title="Keaktifan & Inisiatif (Bobot 10%)">7. Aktif (10%)</th>
                    <th className="p-3 text-center bg-red-50/50 text-[#96171B]">Skor Komposit</th>
                    <th className="p-3 text-center">Status (KKM 75)</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1DA]">
                  {pesertaMatrix.map((item) => {
                    const nb = item.nilaiBawaan || {
                      ketepatan: 80,
                      langkahSop: 80,
                      kecepatan: 80,
                      knowledge: 80,
                      kerjaSama: 80,
                      kebersihan: 80,
                      keaktifan: 80,
                      skorAkhir: 80.0,
                      status: 'LULUS KOMPETEN (KKM >=75)'
                    };
                    const isGradeA = nb.skorAkhir >= 85.0;
                    const isRemedial = nb.skorAkhir < 75.0;

                    return (
                      <tr key={item.no} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-3 text-center font-mono font-bold text-[#645D55]">
                          {item.no}
                        </td>
                        <td className="p-3 font-semibold text-[#181411]">
                          <span className="block font-bold">{item.nama}</span>
                          <span className="text-[10px] text-[#645D55]">
                            {item.keterangan === 'New' ? 'Karyawan Baru' : 'Karyawan Reguler'} • {item.divisi}
                          </span>
                        </td>
                        <td className="p-3 text-[#181411] font-medium">
                          {item.outlet}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 font-mono text-[10.5px] font-bold text-stone-800">
                            {item.stasiun || 'Station 1'}
                          </span>
                        </td>
                        <td className="p-3 text-[#645D55] max-w-xs">
                          <p className="line-clamp-2 text-[11px]">{item.paketMenu}</p>
                        </td>
                        <td className="p-3 text-center font-mono font-semibold">
                          <span className={nb.ketepatan >= 85 ? 'text-emerald-700' : nb.ketepatan < 75 ? 'text-rose-700' : 'text-stone-700'}>
                            {nb.ketepatan}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-semibold">
                          <span className={nb.langkahSop >= 85 ? 'text-emerald-700' : nb.langkahSop < 75 ? 'text-rose-700' : 'text-stone-700'}>
                            {nb.langkahSop}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-semibold">
                          <span className={nb.kecepatan >= 85 ? 'text-emerald-700' : nb.kecepatan < 75 ? 'text-rose-700' : 'text-stone-700'}>
                            {nb.kecepatan}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-semibold">
                          <span className={nb.knowledge >= 85 ? 'text-emerald-700' : nb.knowledge < 75 ? 'text-rose-700' : 'text-stone-700'}>
                            {nb.knowledge}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-semibold">
                          <span className={nb.kerjaSama >= 85 ? 'text-emerald-700' : nb.kerjaSama < 75 ? 'text-rose-700' : 'text-stone-700'}>
                            {nb.kerjaSama}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-semibold">
                          <span className={nb.kebersihan >= 85 ? 'text-emerald-700' : nb.kebersihan < 75 ? 'text-rose-700' : 'text-stone-700'}>
                            {nb.kebersihan}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-semibold">
                          <span className={nb.keaktifan >= 85 ? 'text-emerald-700' : nb.keaktifan < 75 ? 'text-rose-700' : 'text-stone-700'}>
                            {nb.keaktifan}
                          </span>
                        </td>
                        <td className="p-3 text-center bg-red-50/40 font-mono font-black text-sm text-[#96171B]">
                          {nb.skorAkhir.toFixed(1)}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isGradeA
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : isRemedial
                                ? 'bg-rose-50 text-rose-800 border-rose-200 font-black'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {nb.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPeserta7Kriteria(item);
                                if (item.nilaiBawaan) {
                                  setForm7Kriteria({
                                    ketepatan: item.nilaiBawaan.ketepatan,
                                    langkahSop: item.nilaiBawaan.langkahSop,
                                    kecepatan: item.nilaiBawaan.kecepatan,
                                    knowledge: item.nilaiBawaan.knowledge,
                                    kerjaSama: item.nilaiBawaan.kerjaSama,
                                    kebersihan: item.nilaiBawaan.kebersihan,
                                    keaktifan: item.nilaiBawaan.keaktifan,
                                  });
                                }
                              }}
                              className="p-1.5 rounded-lg border border-[#E6E1DA] hover:border-[#96171B] text-[#96171B] hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
                              title="Edit Skor 7 Kriteria"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = pesertaMatrix.filter(p => p.nama !== item.nama);
                                setPesertaMatrix(updated);
                                db.setTable('peserta_matrix_tc', updated);

                                // Remove from master kru table so they do not reappear anywhere
                                const allKrus = db.getTable<Kru>('kru');
                                const targetKru = allKrus.find(k => k.nama_kru.toLowerCase().trim() === item.nama.toLowerCase().trim());
                                if (targetKru) {
                                  db.deleteRow('kru', targetKru.id);
                                }

                                // Remove from all onboarding batches so they do not reappear in candidate lists
                                const allBatches = db.getOnboardingBatches();
                                allBatches.forEach(b => {
                                  if (Array.isArray(b.peserta)) {
                                    const filteredPeserta = b.peserta.filter(p => p.nama_kru.toLowerCase().trim() !== item.nama.toLowerCase().trim());
                                    if (filteredPeserta.length !== b.peserta.length) {
                                      b.peserta = filteredPeserta;
                                      db.saveOnboardingBatch(b);
                                    }
                                  }
                                });
                                setBatches(db.getOnboardingBatches());
                                setKruList(db.getTable<Kru>('kru').filter(k => k.status_aktif === 'Aktif'));

                                showToast(`Peserta "${item.nama}" berhasil dihapus secara permanen.`);
                              }}
                              className="p-1.5 rounded-lg border border-rose-200 hover:border-rose-600 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
                              title="Hapus Peserta"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RUBRIK PENILAIAN OBJEKTIF 7 KRITERIA (PAGE 6 PDF) */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E6E1DA] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#96171B] uppercase tracking-wider block">
                  Pedoman Baku Scoring Asesor • Standar Mutu Operasional
                </span>
                <h4 className="font-extrabold text-base text-[#181411]">
                  Rubrik Penilaian Objektif 7 Kriteria Onboarding HARA Chicken
                </h4>
                <p className="text-xs text-[#645D55] mt-0.5">
                  Fokus penilaian terinci, standar Grade A, Grade B (Lulus KKM), Grade C (Pembinaan), dan Kill-Switch kegagalan fatal.
                </p>
              </div>

              {/* Rubrik Selector Tabs */}
              <div className="flex flex-wrap items-center gap-1">
                {RUBRIK_PENILAIAN_7_KRITERIA_HARA.map((r) => (
                  <button
                    key={r.nomor}
                    type="button"
                    onClick={() => setActiveRubrikTab(r.nomor)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeRubrikTab === r.nomor
                        ? 'bg-[#96171B] text-white shadow-xs'
                        : 'bg-[#FAF8F5] border border-[#E6E1DA] text-[#645D55] hover:text-[#181411]'
                    }`}
                  >
                    K{r.nomor} ({r.bobotPersen}%)
                  </button>
                ))}
              </div>
            </div>

            {/* Active Rubrik Card */}
            {(() => {
              const r = RUBRIK_PENILAIAN_7_KRITERIA_HARA.find(item => item.nomor === activeRubrikTab) || RUBRIK_PENILAIAN_7_KRITERIA_HARA[0];
              return (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-extrabold text-sm text-amber-950">
                        {r.dimensi} (Bobot: {r.bobotPersen}%)
                      </span>
                      <span className="text-xs font-semibold text-amber-900">
                        Fokus: {r.fokusPenilaian}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Grade A */}
                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-900">Grade A (90 - 100)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Sangat Mahir
                        </span>
                      </div>
                      <p className="text-emerald-950 leading-relaxed text-[11.5px]">
                        {r.gradeA}
                      </p>
                    </div>

                    {/* Grade B */}
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-blue-900">Grade B (75 - 89)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          Kompeten (Lulus KKM)
                        </span>
                      </div>
                      <p className="text-blue-950 leading-relaxed text-[11.5px]">
                        {r.gradeB}
                      </p>
                    </div>

                    {/* Grade C */}
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-900">Grade C (60 - 74)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Pembinaan / Evaluasi
                        </span>
                      </div>
                      <p className="text-amber-950 leading-relaxed text-[11.5px]">
                        {r.gradeC}
                      </p>
                    </div>

                    {/* Remedial Kill-Switch */}
                    <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-rose-900">Remedial (&lt; 60)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">
                          Kill-Switch / Gagal
                        </span>
                      </div>
                      <p className="text-rose-950 leading-relaxed text-[11.5px] font-medium">
                        {r.remedial}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* MODAL INLINE: EDIT SKOR 7 KRITERIA */}
          {editingPeserta7Kriteria && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-xl w-full p-6 text-[#181411] space-y-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-[#E6E1DA] pb-3">
                  <div>
                    <h3 className="font-bold text-base text-[#181411]">
                      Input / Edit Nilai 7 Kriteria ({editingPeserta7Kriteria.nama})
                    </h3>
                    <p className="text-xs text-[#645D55]">
                      Outlet {editingPeserta7Kriteria.outlet} • {editingPeserta7Kriteria.stasiun}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingPeserta7Kriteria(null)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#645D55] mb-1">1. Ketepatan (20%):</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form7Kriteria.ketepatan}
                      onChange={(e) => setForm7Kriteria({ ...form7Kriteria, ketepatan: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-[#E6E1DA] font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#645D55] mb-1">2. Langkah SOP (20%):</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form7Kriteria.langkahSop}
                      onChange={(e) => setForm7Kriteria({ ...form7Kriteria, langkahSop: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-[#E6E1DA] font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#645D55] mb-1">3. Kecepatan (15%):</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form7Kriteria.kecepatan}
                      onChange={(e) => setForm7Kriteria({ ...form7Kriteria, kecepatan: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-[#E6E1DA] font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#645D55] mb-1">4. Knowledge (15%):</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form7Kriteria.knowledge}
                      onChange={(e) => setForm7Kriteria({ ...form7Kriteria, knowledge: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-[#E6E1DA] font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#645D55] mb-1">5. Kerja Sama (10%):</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form7Kriteria.kerjaSama}
                      onChange={(e) => setForm7Kriteria({ ...form7Kriteria, kerjaSama: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-[#E6E1DA] font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#645D55] mb-1">6. Kebersihan (10%):</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form7Kriteria.kebersihan}
                      onChange={(e) => setForm7Kriteria({ ...form7Kriteria, kebersihan: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-[#E6E1DA] font-mono font-bold"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-bold text-[#645D55] mb-1">7. Keaktifan & Inisiatif (10%):</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form7Kriteria.keaktifan}
                      onChange={(e) => setForm7Kriteria({ ...form7Kriteria, keaktifan: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-[#E6E1DA] font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Live Composite Preview */}
                {(() => {
                  const preview = hitungSkorKomposit7Kriteria(form7Kriteria);
                  return (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-900 uppercase block">Kalkulasi Skor Komposit:</span>
                        <span className="text-xl font-black font-mono text-[#96171B]">
                          {preview.skorKomposit} Poin
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                        preview.skorKomposit >= 85
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : preview.skorKomposit >= 75
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}>
                        {preview.status}
                      </span>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E1DA]">
                  <button
                    type="button"
                    onClick={() => setEditingPeserta7Kriteria(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#645D55] hover:text-[#181411]"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!editingPeserta7Kriteria) return;
                      const calc = hitungSkorKomposit7Kriteria(form7Kriteria);
                      setPesertaMatrix(prev => prev.map(p => {
                        if (p.nama === editingPeserta7Kriteria.nama) {
                          return {
                            ...p,
                            nilaiBawaan: {
                              ...form7Kriteria,
                              skorAkhir: calc.skorKomposit,
                              status: calc.status
                            }
                          };
                        }
                        return p;
                      }));
                      setEditingPeserta7Kriteria(null);
                      showToast(`Nilai 7 Kriteria "${editingPeserta7Kriteria.nama}" diperbarui ke ${calc.skorKomposit} (${calc.status}).`);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Save size={14} />
                    <span>Simpan Nilai Komposit</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          MODAL: SEARCHABLE PRODUCT SELECTOR DRAWER / PALETTE
          =================================================================== */}
      {isProductPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col text-[#181411] animate-in fade-in zoom-in-95 duration-150">
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
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 border-b border-[#E6E1DA] bg-[#FAF8F5] flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Ketik nama produk, stasiun, atau langkah SOP..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E6E1DA] bg-white text-xs font-medium focus:outline-none focus:border-[#96171B]"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pickerDayFilter}
                  onChange={(e) => setPickerDayFilter(e.target.value as any)}
                  className="p-2 rounded-lg border border-[#E6E1DA] bg-white text-xs font-semibold"
                >
                  <option value="ALL">Semua Hari</option>
                  <option value="Day 1">Day 1</option>
                  <option value="Day 2">Day 2</option>
                </select>

                <select
                  value={pickerStationFilter}
                  onChange={(e) => setPickerStationFilter(e.target.value)}
                  className="p-2 rounded-lg border border-[#E6E1DA] bg-white text-xs font-semibold"
                >
                  <option value="ALL">Semua Station</option>
                  <option value="Station 1">Station 1</option>
                  <option value="Station 2">Station 2</option>
                  <option value="Station 3">Station 3</option>
                  <option value="All Crew">All Crew</option>
                </select>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[55vh] space-y-2">
              {filteredModalProducts.length === 0 ? (
                <div className="text-center py-12 text-[#645D55]">
                  <UtensilsCrossed size={32} className="mx-auto mb-2 opacity-40 text-[#96171B]" />
                  <p className="text-xs font-bold">Produk tidak ditemukan</p>
                  <p className="text-[11px] mt-0.5">Coba ubah kata kunci pencarian atau filter hari</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredModalProducts.map(prod => {
                    const isSelected = activeSession?.productNama === prod.nama;
                    return (
                      <div
                        key={prod.id}
                        onClick={() => {
                          const initialSteps = getInitialStepsForProduct(prod.nama);
                          const pNotes = { ...(activeSession?.productNotes || {}) };
                          if (activeSession?.productNama) {
                            pNotes[activeSession.productNama] = activeSession.catatanTrainer || '';
                          }
                          const noteForNewProduct = pNotes[prod.nama] || '';

                          updateActiveSession({
                            productNama: prod.nama,
                            day: prod.day,
                            batch: prod.batch,
                            station: prod.station,
                            timerSeconds: 0,
                            isTimerRunning: false,
                            suhuMinyakProbe: prod.requiresOilTemp ? (prod.targetSuhuMinyak || 160) : 0,
                            gramaturAktual: prod.requiresGramatur ? (prod.targetGramatur || 0) : 0,
                            stepChecklist: initialSteps,
                            knowledgeAnswers: { 0: true, 1: true, 2: true },
                            skorKnowledge: 100,
                            catatanTrainer: noteForNewProduct,
                            productNotes: pNotes,
                          });
                          setIsProductPickerOpen(false);
                          showToast(`Produk diganti ke: ${prod.nama}`);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-red-50/60 border-[#96171B] shadow-2xs'
                            : 'bg-white border-[#E6E1DA] hover:border-[#96171B]/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-[#181411] flex items-center gap-1.5">
                              <span>{prod.nama}</span>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#96171B]" />
                              )}
                            </div>
                            <span className="text-[10px] text-[#645D55] font-mono">{prod.kode}</span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF8F5] border border-[#E6E1DA] text-[#645D55] shrink-0">
                            {prod.day}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#645D55] line-clamp-2 leading-relaxed">
                          {prod.deskripsi}
                        </p>

                        <div className="flex items-center justify-between pt-1 border-t border-[#E6E1DA] text-[10px] text-[#645D55]">
                          <span>{prod.stationLabel.split(':')[0]}</span>
                          <span className="font-mono font-semibold">
                            Target Akumulasi: {Math.round(prod.stdDetik / 60)} mnt ({prod.stdDetik}s)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: BUKA BANYAK KRU SEKALIGUS (SIMULTANEOUS BATCH OBSERVE)
          =================================================================== */}
      {batchCrewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-[#E6E1DA] animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#E6E1DA] flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#96171B]/10 text-[#96171B]">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#181411]">
                    Buka Penilaian Banyak Kru Sekaligus
                  </h3>
                  <p className="text-[11px] text-[#645D55]">
                    Pilih kru yang sedang diobservasi bersamaan di stasiun. Setiap kru akan dibuatkan tab tersendiri.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBatchCrewModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-[#FAF8F5] border-b border-[#E6E1DA] flex items-center justify-between text-xs">
              <span className="font-bold text-[#645D55]">
                {selectedBatchCrewIds.length} kru terpilih
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allIds = candidateKrus.map(k => k.id);
                    setSelectedBatchCrewIds(allIds);
                  }}
                  className="px-2.5 py-1 rounded bg-white border border-[#E6E1DA] text-[11px] font-bold text-[#181411] hover:bg-stone-100"
                >
                  Pilih Semua ({candidateKrus.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBatchCrewIds([])}
                  className="px-2.5 py-1 rounded bg-white border border-[#E6E1DA] text-[11px] font-bold text-stone-600 hover:bg-stone-100"
                >
                  Kosongkan
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-[50vh]">
              {candidateKrus.map(kru => {
                const isSelected = selectedBatchCrewIds.includes(kru.id);
                const isAlreadyOpen = sessions.some(s => s.kruId === kru.id);

                return (
                  <div
                    key={kru.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedBatchCrewIds(prev => prev.filter(id => id !== kru.id));
                      } else {
                        setSelectedBatchCrewIds(prev => [...prev, kru.id]);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-red-50/50 border-[#96171B]'
                        : isAlreadyOpen
                        ? 'bg-stone-50 border-[#E6E1DA]'
                        : 'bg-white border-[#E6E1DA] hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#96171B] text-white border-[#96171B]'
                          : 'bg-white border-stone-300'
                      }`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#181411] flex items-center gap-1.5">
                          <span>{kru.nama_kru}</span>
                          {isAlreadyOpen && (
                            <span className="text-[9px] font-semibold bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded">
                              Sudah Dibuka
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#645D55]">
                          {kru.kode_outlet} • Divisi {kru.divisi}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-[#645D55]">
                      {kru.id}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-[#E6E1DA] flex items-center justify-between bg-stone-50">
              <button
                type="button"
                onClick={() => setBatchCrewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleOpenSelectedBatchCrews}
                disabled={selectedBatchCrewIds.length === 0}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
                  selectedBatchCrewIds.length > 0
                    ? 'bg-[#96171B] hover:bg-[#7D1216] text-white cursor-pointer'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }`}
              >
                <Users size={14} />
                <span>Buka {selectedBatchCrewIds.length} Kru Sekaligus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini Certificate Modal */}
      {certificateData && (
        <MiniCertificateModal
          data={certificateData}
          onClose={() => setCertificateData(null)}
        />
      )}

      {/* Crew Onboarding Report Modal */}
      {crewReportModalKru && (
        <CrewOnboardingReportModal
          kruNama={crewReportModalKru}
          kodeOutlet={activeSession?.outletCode || selectedOutletCode}
          assessments={historyList}
          onClose={() => setCrewReportModalKru(null)}
        />
      )}

      {/* ===================================================================
          MODAL: BATCH ONBOARDING CRUD (TAMBAH / EDIT BATCH)
          =================================================================== */}
      {isBatchModalOpen && editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-lg w-full overflow-hidden text-[#181411] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#E6E1DA] flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#96171B] flex items-center justify-center border border-red-100">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#181411]">
                    {batchFormMode === 'create' ? 'Buat Batch Onboarding Baru' : 'Edit Batch Onboarding'}
                  </h3>
                  <p className="text-[11px] text-[#645D55]">
                    Kelola kelas pelatihan kru (kapasitas standar 11-17 kru)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#645D55] uppercase text-[10px] mb-1">
                    Nomor Batch:
                  </label>
                  <input
                    type="text"
                    value={editingBatch.nomor_batch || ''}
                    onChange={(e) => setEditingBatch(prev => prev ? { ...prev, nomor_batch: e.target.value } : null)}
                    placeholder="Contoh: B01, B12"
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-bold text-[#181411] focus:outline-none focus:border-[#96171B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#645D55] uppercase text-[10px] mb-1">
                    Status Kelas:
                  </label>
                  <select
                    value={editingBatch.status || 'Berjalan'}
                    onChange={(e) => setEditingBatch(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-bold text-[#181411] bg-white"
                  >
                    <option value="Direncanakan">Direncanakan</option>
                    <option value="Berjalan">Berjalan (Aktif)</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#645D55] uppercase text-[10px] mb-1">
                  Nama Batch Onboarding:
                </label>
                <input
                  type="text"
                  value={editingBatch.nama_batch || ''}
                  onChange={(e) => setEditingBatch(prev => prev ? { ...prev, nama_batch: e.target.value } : null)}
                  placeholder="Contoh: Batch Onboarding 23-24 Okt 2026"
                  className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-bold text-[#181411] focus:outline-none focus:border-[#96171B]"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#645D55] uppercase text-[10px] mb-1">
                    Tanggal Mulai:
                  </label>
                  <input
                    type="date"
                    value={editingBatch.tanggal_mulai || ''}
                    onChange={(e) => setEditingBatch(prev => prev ? { ...prev, tanggal_mulai: e.target.value } : null)}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-semibold text-[#181411]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#645D55] uppercase text-[10px] mb-1">
                    Tanggal Selesai:
                  </label>
                  <input
                    type="date"
                    value={editingBatch.tanggal_selesai || ''}
                    onChange={(e) => setEditingBatch(prev => prev ? { ...prev, tanggal_selesai: e.target.value } : null)}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-semibold text-[#181411]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#645D55] uppercase text-[10px] mb-1">
                    Lokasi Pelaksanaan TC:
                  </label>
                  <input
                    type="text"
                    value={editingBatch.kode_outlet_lokasi || 'Kantor Lempongsari'}
                    onChange={(e) => setEditingBatch(prev => prev ? { ...prev, kode_outlet_lokasi: e.target.value } : null)}
                    placeholder="Kantor Lempongsari"
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-bold text-[#181411] bg-stone-50 focus:bg-white focus:border-[#96171B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#645D55] uppercase text-[10px] mb-1">
                    Lead Trainer:
                  </label>
                  <input
                    type="text"
                    value={editingBatch.lead_trainer || ''}
                    onChange={(e) => setEditingBatch(prev => prev ? { ...prev, lead_trainer: e.target.value } : null)}
                    placeholder="Nama trainer"
                    className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-semibold text-[#181411]"
                  />
                </div>
              </div>

              {/* DAFTAR PESERTA BATCH MANAGEMENT */}
              <div className="pt-2 border-t border-[#E6E1DA] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#181411] uppercase text-[10.5px]">
                    Peserta Kelas Batch ({editingBatch.peserta?.length || 0} Peserta)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingManualParticipant(!isAddingManualParticipant)}
                    className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[#96171B] border border-red-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus size={12} />
                    <span>{isAddingManualParticipant ? 'Batal Tambah' : 'Tambah Peserta Manual'}</span>
                  </button>
                </div>

                {/* Manual Participant Entry Form */}
                {isAddingManualParticipant && (
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-[#E6E1DA] space-y-3 animate-in fade-in zoom-in-95">
                    <span className="font-bold text-xs text-[#96171B] block">Form Tambah Peserta Manual (Pengganti)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#645D55] mb-0.5">Nama Lengkap Kru:</label>
                        <input
                          type="text"
                          value={manualNamaInput}
                          onChange={(e) => setManualNamaInput(e.target.value)}
                          placeholder="Nama kru baru..."
                          className="w-full p-2 rounded-lg border border-[#E6E1DA] text-xs font-semibold bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#645D55] mb-0.5">Outlet Tujuan:</label>
                        <input
                          type="text"
                          value={manualOutletInput}
                          onChange={(e) => setManualOutletInput(e.target.value)}
                          placeholder="Misal: Gito Gati, Monjali..."
                          className="w-full p-2 rounded-lg border border-[#E6E1DA] text-xs font-semibold bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-[#645D55] mb-0.5">Divisi / Posisi:</label>
                        <select
                          value={manualDivisiInput}
                          onChange={(e) => setManualDivisiInput(e.target.value as Division)}
                          className="w-full p-2 rounded-lg border border-[#E6E1DA] text-xs font-semibold bg-white"
                        >
                          <option value="Kitchen">Kitchen</option>
                          <option value="Kasir">Kasir</option>
                          <option value="Geprek">Geprek</option>
                          <option value="Helper">Helper</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#645D55] mb-0.5">Tipe Status:</label>
                        <select
                          value={manualTipeInput}
                          onChange={(e) => setManualTipeInput(e.target.value as any)}
                          className="w-full p-2 rounded-lg border border-[#E6E1DA] text-xs font-semibold bg-white"
                        >
                          <option value="Karyawan Baru (1-45 Hari)">Karyawan Baru</option>
                          <option value="Retraining Karyawan Lama">Retraining Lama</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddManualParticipantToBatch}
                      className="w-full py-2 rounded-lg bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      + Masukkan Peserta ke Batch (Otomatis Simpan ke Master Kru)
                    </button>
                  </div>
                )}

                {/* List of participants in batch */}
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-[#E6E1DA] rounded-xl p-2 bg-[#FAF8F5]">
                  {(!editingBatch.peserta || editingBatch.peserta.length === 0) ? (
                    <div className="text-center py-4 text-stone-400 italic text-[11px]">
                      Belum ada peserta di batch ini. Klik tombol di atas untuk menambah peserta.
                    </div>
                  ) : (
                    editingBatch.peserta.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E6E1DA] text-xs">
                        <div>
                          <span className="font-bold text-[#181411] block">{idx + 1}. {p.nama_kru}</span>
                          <span className="text-[10px] text-[#645D55]">
                            {getFullOutletName(p.kode_outlet)} • {p.divisi} • {p.tipe}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipantFromBatch(p.nama_kru)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                          title="Hapus dari batch"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E6E1DA] bg-stone-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBatchForm}
                className="px-5 py-2.5 rounded-xl bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Save size={14} />
                <span>Simpan Batch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: EDIT TARGET WAKTU SOP (REALISTIS DARI PERSIAPAN S/D JADI)
          =================================================================== */}
      {isSOPTargetModalOpen && sopEditTargetProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-lg w-full overflow-hidden text-[#181411] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-[#E6E1DA] flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center border border-amber-200">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#181411]">
                    Standarisasi Target Waktu SOP Realistis
                  </h3>
                  <p className="text-[11px] text-[#645D55]">
                    {sopEditTargetProd.nama} ({sopEditTargetProd.kode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSOPTargetModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] text-[11px] text-[#645D55] leading-relaxed">
                Waktu pengerjaan disesuaikan dengan SOP logis HARA Chicken: mulai dari persiapan bahan & dusting (misal 3 mnt), proses menggoreng deep fryer (12 mnt), hingga penirisan dan siap warmer (2 mnt).
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#645D55] uppercase text-[10px] mb-1">
                      1. Dusting / Siap (detik):
                    </label>
                    <input
                      type="number"
                      value={sopEditPersiapanDetik}
                      onChange={(e) => setSopEditPersiapanDetik(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-mono font-bold text-[#181411]"
                      min="0"
                      step="15"
                    />
                    <span className="text-[10px] text-[#645D55] block mt-0.5">
                      = {Math.round(sopEditPersiapanDetik / 60 * 10) / 10} menit
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-[#645D55] uppercase text-[10px] mb-1">
                      2. Goreng / Masak (detik):
                    </label>
                    <input
                      type="number"
                      value={sopEditMasakDetik}
                      onChange={(e) => setSopEditMasakDetik(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-mono font-bold text-[#181411]"
                      min="0"
                      step="15"
                    />
                    <span className="text-[10px] text-[#645D55] block mt-0.5">
                      = {Math.round(sopEditMasakDetik / 60 * 10) / 10} menit
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-[#645D55] uppercase text-[10px] mb-1">
                      3. Tiris / Plating (detik):
                    </label>
                    <input
                      type="number"
                      value={sopEditFinishingDetik}
                      onChange={(e) => setSopEditFinishingDetik(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[#E6E1DA] font-mono font-bold text-[#181411]"
                      min="0"
                      step="15"
                    />
                    <span className="text-[10px] text-[#645D55] block mt-0.5">
                      = {Math.round(sopEditFinishingDetik / 60 * 10) / 10} menit
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                      Total Akumulasi Waktu Standar:
                    </span>
                    <span className="text-xl font-black font-mono text-[#96171B]">
                      {Number(sopEditPersiapanDetik) + Number(sopEditMasakDetik) + Number(sopEditFinishingDetik)} detik
                    </span>
                  </div>
                  <span className="text-sm font-bold font-mono text-amber-950 px-2.5 py-1 rounded-lg bg-white border border-amber-300">
                    {Math.round((Number(sopEditPersiapanDetik) + Number(sopEditMasakDetik) + Number(sopEditFinishingDetik)) / 60 * 10) / 10} Menit
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E6E1DA] bg-stone-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsSOPTargetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSOPTarget}
                className="px-5 py-2.5 rounded-xl bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Save size={14} />
                <span>Simpan Target SOP</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        detailText={confirmModalConfig.detailText}
        confirmLabel="Ya, Hapus Data"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={confirmModalConfig.onConfirm}
        onCancel={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
