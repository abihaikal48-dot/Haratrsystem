import React, { useState, useEffect, useMemo } from 'react';
import {
  UtensilsCrossed, Clock, CheckCircle2, AlertTriangle, Play,
  Pause, RotateCcw, Award, FileText, Search,
  Filter, Check, X, ShieldAlert,
  Info, ShieldCheck, User, Users, Store, Zap, RefreshCw,
  Thermometer, Scale, BookOpen, Plus, Sparkles,
  Edit2, Edit3, Save, Trash2, Layers, HelpCircle, Eye, Printer, ChevronRight,
  ClipboardCheck, Building2, Flame, Download, GraduationCap,
  ExternalLink, FileSpreadsheet, Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../lib/storage';
import {
  Kru, Outlet, Division, OnboardingBatch,
  PenilaianPraktikOnboardingProduk, PenilaianJobdeskStasiun,
  PenilaianSikapKebersihanKru, PenilaianTimStasiun
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
import {
  syncPenilaianToGoogleSheets,
  exportPenilaianToCSV,
  resolveRealOutletName,
  getSavedGoogleSheetDocUrl,
  saveGoogleSheetDocUrl,
  getGoogleSheetWebhookUrl,
  saveGoogleSheetWebhookUrl,
  testGoogleSheetWebhook,
  HARA_APPS_SCRIPT_TEMPLATE
} from '../../lib/googleSheetSync';

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

/**
 * Pemetaan Resmi 12 Peserta Kru Baru TC Lempongsari ke Outlet Penempatan Riil
 */
export const CANDIDATE_PLACEMENT_MAP: Record<string, string> = {
  // Batch 10-11 November (TC Kantor Lempongsari)
  'dhimas panji saputro': 'Blok O',
  'dhimas panji': 'Blok O',
  'septian dwi nugroho': 'Condongcatur',
  'septian dwi': 'Condongcatur',
  'galih muhammad': 'Sedayu',
  'shereen putri': 'Cebongan',
  'muhammad iman nugroho': 'Bantul Niten',
  'muhammad iman': 'Bantul Niten',
  'alifia putriana dewi az-zahra': 'Pleret',
  'alifia putriana': 'Pleret',
  'alifia': 'Pleret',
  'yasykur kurnia': 'Office',
  'yasykur': 'Office',
  'muhammad alif alfarizki': 'Damai',
  'muhammad alif': 'Damai',
  'rahmad puji yanto': 'Kalakijo',
  'rahmad puji': 'Kalakijo',
  'banar hibatullah mukti': 'Playen',
  'banar hibatullah': 'Playen',
  'noval adittya': 'Monjali',
  'noval': 'Monjali',
  'muhammad faisal': 'Support Mobile Outlet',
  // Batch 3-4 November (TC Kantor Lempongsari)
  'achmad luthfi khakim': 'Kertek',
  'achmad luthfi': 'Kertek',
  'maulida mega': 'Borobudur',
  'lulu hidayati': 'RSI',
  'muhammad kelvin febrianto': 'RSI',
  'muhammad kelvin': 'RSI',
  'anisyatul azizah': 'Magelang Tidar',
  'elva rahmawati': 'Jakal 13',
  'difa safitri': 'Mobile Outlet',
  'hilda nur mafitiyas': 'Jl Wonosari',
  'arifatul kurniasih': 'Jl Parangtritis',
  'arifatul kurniasih new': 'Jl Parangtritis',
  'reval arfinza putra': 'Jl Parangtritis',
  'reval arfinza': 'Jl Parangtritis',
  'iqfantri mae dinar': 'Event: Jl Parangtritis',
  'farelyno mahesa nugroho': 'Mobile Outlet',
  'farelyno mahesa': 'Mobile Outlet',
  'imron irsyadi': 'Ronggolawe',
  'imron irsyadi new': 'Ronggolawe',
  'teadora mayca syilvina': 'Mobile Outlet',
  'teadora mayca': 'Mobile Outlet',
  // Kru TC Batch Sebelumnya
  'haudy rizky': 'Gito Gati',
  'vino adrian saputra': 'Glagahsari',
  'vino adrian': 'Glagahsari',
  'salwa salsabila': 'Borobudur',
  'evanda nur meilita': 'Pandega',
  'evanda nur': 'Pandega',
  'mahfud attoriq': 'Pandowoharjo',
  'davi dwi eriyanto': 'Jambon',
  'davi dwi': 'Jambon',
  'dimas mahardika': 'Purworejo',
  'muhammad nadziiful affan': 'Sorogenen',
  'kevin irawan': 'Monjali',
  'dhiya aida yumna': 'Support Mobile Outlet',
  'edvin perdana yulianto': 'Area Godean',
  'sigit nur prasetyo': 'Kamdanen',
};

export const getCandidatePlacement = (nama: string, defaultOutlet?: string): string => {
  const clean = (nama || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/new/g, '').trim();
  for (const [key, outlet] of Object.entries(CANDIDATE_PLACEMENT_MAP)) {
    if (clean.includes(key) || key.includes(clean)) return outlet;
  }
  return defaultOutlet || 'Kantor Lempongsari';
};

export interface CompletedProductRecord {
  productNama: string;
  skorAkhir: number;
  durasiDetik: number;
  waktuMulai?: string;
  timestamp: string;
  lulus: boolean;
}

export interface ProductPracticeState {
  timerSeconds: number;
  isTimerRunning: boolean;
  stepChecklist: { nomor: number; langkah: string; tercapai: boolean; isKritis?: boolean }[];
  knowledgeAnswers: Record<number, boolean>;
  skorKnowledge: number;
  skorKebersihan?: number;
  skorKerjasama?: number;
  suhuMinyakProbe: number;
  gramaturAktual: number;
  catatanTrainer?: string;
  waktuMulai?: string;
}

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
  productQueue?: string[];
  currentProductIndex?: number;
  completedProducts?: CompletedProductRecord[];
  timerSeconds: number;
  isTimerRunning: boolean;
  suhuMinyakProbe: number;
  gramaturAktual: number;
  stepChecklist: { nomor: number; langkah: string; tercapai: boolean; isKritis?: boolean }[];
  knowledgeAnswers: Record<number, boolean>;
  skorKnowledge: number;
  skorKebersihan?: number;
  skorKerjasama?: number;
  catatanTrainer: string;
  productNotes?: Record<string, string>;
  productStates?: Record<string, ProductPracticeState>;
  isSaved?: boolean;
}

export const OnboardingProductPracticeView: React.FC<OnboardingProductPracticeViewProps> = ({
  selectedOutletCode,
  onOpenFullAuditLog,
}) => {
  // Navigation Sub-Tab: 'produk' vs 'riwayat' vs 'jobdesk' vs 'tim' vs 'analitik_outlet' with resilient localStorage persistence
  const [activeSubTab, setActiveSubTab] = useState<'produk' | 'riwayat' | 'jobdesk' | 'tim' | 'analitik_outlet'>(() => {
    try {
      const saved = localStorage.getItem('hara_onboarding_active_subtab');
      if (saved && ['produk', 'riwayat', 'jobdesk', 'tim', 'analitik_outlet'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'produk';
  });

  useEffect(() => {
    try {
      localStorage.setItem('hara_onboarding_active_subtab', activeSubTab);
    } catch {}
  }, [activeSubTab]);

  // Master lists
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [batches, setBatches] = useState<OnboardingBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('hara_onboarding_selected_batch_id');
      if (saved) return saved;
    } catch {}
    return 'batch-ob-2026-11-10';
  });

  useEffect(() => {
    try {
      localStorage.setItem('hara_onboarding_selected_batch_id', selectedBatchId);
    } catch {}
  }, [selectedBatchId]);

  // Integrasi Batch Kru Dinamis: Mengambil peserta langsung dari Batch yang dipilih atau seluruh batch
  const candidateKrus = useMemo(() => {
    const listMap = new Map<string, Kru>();

    if (selectedBatchId === 'ALL') {
      // 1. Gather from all batches
      batches.forEach(b => {
        if (Array.isArray(b.peserta)) {
          b.peserta.forEach(p => {
            if (p && p.nama_kru && !p.nama_kru.toLowerCase().includes('ridha')) {
              const kId = p.kru_id || `batch-p-${p.nama_kru}`;
              if (!listMap.has(kId)) {
                listMap.set(kId, {
                  id: kId,
                  nama_kru: p.nama_kru,
                  divisi: p.divisi || 'Kitchen',
                  kode_outlet: p.kode_outlet || 'Kantor Lempongsari',
                  jabatan: p.jabatan || 'Kru (Onboarding TC)',
                  tanggal_masuk: p.tanggal_masuk || '2026-10-30',
                  status_aktif: 'Aktif',
                  created_at: new Date().toISOString(),
                });
              }
            }
          });
        }
      });
      // 2. Add remaining from kruList
      kruList.forEach(k => {
        if (k && k.nama_kru && !k.nama_kru.toLowerCase().includes('ridha')) {
          if (!listMap.has(k.id) && !Array.from(listMap.values()).some(existing => existing.nama_kru.toLowerCase().trim() === k.nama_kru.toLowerCase().trim())) {
            listMap.set(k.id, k);
          }
        }
      });
      return Array.from(listMap.values());
    }

    const currentBatch = batches.find(b => b.id === selectedBatchId);
    if (currentBatch && Array.isArray(currentBatch.peserta) && currentBatch.peserta.length > 0) {
      return currentBatch.peserta
        .filter(p => p && p.nama_kru && !p.nama_kru.toLowerCase().includes('ridha'))
        .map(p => ({
          id: p.kru_id || `batch-p-${p.nama_kru}`,
          nama_kru: p.nama_kru,
          divisi: p.divisi || 'Kitchen',
          kode_outlet: p.kode_outlet || 'Kantor Lempongsari',
          jabatan: p.jabatan || 'Kru (Onboarding TC)',
          tanggal_masuk: p.tanggal_masuk || '2026-10-30',
          status_aktif: 'Aktif' as const,
          created_at: new Date().toISOString(),
        }));
    }

    return kruList.filter(k => k && k.nama_kru && !k.nama_kru.toLowerCase().includes('ridha'));
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

  // Concurrent Multi-Candidate Sessions (Individual Product) - With Resilient Auto-Save Protection
  const [sessions, setSessions] = useState<AssessmentSessionTab[]>(() => {
    try {
      const saved = localStorage.getItem('hara_active_assessment_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore parse error and fallback
    }
    const k = db.getTable<Kru>('kru').filter(x => x.status_aktif === 'Aktif');
    const firstKru = k[0] || { id: 'init-1', nama_kru: 'Iqbal Muzzaki', kode_outlet: 'Kantor Lempongsari', divisi: 'Kitchen' };
    const prodDef = HARA_ONBOARDING_PRODUCTS_MASTER[0];
    return [{
      id: `session-init-1`,
      kruId: firstKru.id,
      namaKru: firstKru.nama_kru,
      isManualName: false,
      manualNameInput: '',
      outletCode: 'Kantor Lempongsari',
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

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    try {
      const savedTab = localStorage.getItem('hara_active_assessment_tab_id');
      if (savedTab) return savedTab;
    } catch {
      // ignore
    }
    return `session-init-1`;
  });

  // Auto-Save Active Assessment Draft to localStorage so page refresh or tab switch NEVER loses data
  useEffect(() => {
    try {
      localStorage.setItem('hara_active_assessment_sessions', JSON.stringify(sessions));
    } catch (e) {
      console.warn('Auto-save assessment sessions failed', e);
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('hara_active_assessment_tab_id', activeTabId);
    } catch (e) {
      console.warn('Auto-save activeTabId failed', e);
    }
  }, [activeTabId]);

  // =========================================================================
  // STATE KHUSUS SUB-TAB: PENILAIAN TIM STASIUN (STATION KERJA 1 & 2)
  // =========================================================================
  const [timList, setTimList] = useState<PenilaianTimStasiun[]>(() => db.getPenilaianTimStasiun());
  const [selectedTimStation, setSelectedTimStation] = useState<'Station 1' | 'Station 2' | 'Station Kerja 1' | 'Station Kerja 2'>('Station 1');
  const [selectedTimKruIds, setSelectedTimKruIds] = useState<string[]>([]);
  const [timScoreRitme, setTimScoreRitme] = useState<number>(85);
  const [timScoreKomunikasi, setTimScoreKomunikasi] = useState<number>(85);
  const [timScoreKebersihan, setTimScoreKebersihan] = useState<number>(90);
  const [timScoreSOP, setTimScoreSOP] = useState<number>(85);
  const [timScoreHandover, setTimScoreHandover] = useState<number>(90);
  const [timCeklis, setTimCeklis] = useState({
    ritme_tanpa_bottleneck: true,
    komunikasi_vokal_lancar: true,
    meja_alat_bersih_5s: true,
    alat_kembali_ke_tempat: true,
    zero_kontaminasi_silang: true,
    handover_produk_mulus: true,
    disiplin_fifo_holding: true,
  });
  const [timCatatan, setTimCatatan] = useState<string>('');

  // Searchable Product Picker Modal State
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [pickerDayFilter, setPickerDayFilter] = useState<'ALL' | 'Day 1' | 'Day 2'>('ALL');
  const [pickerStationFilter, setPickerStationFilter] = useState<string>('ALL');

  // Google Sheet Link & Sync Modal State
  const [isSheetLinkModalOpen, setIsSheetLinkModalOpen] = useState(false);
  const [sheetDocUrlInput, setSheetDocUrlInput] = useState(() => getSavedGoogleSheetDocUrl());
  const [sheetWebhookUrlInput, setSheetWebhookUrlInput] = useState(() => getGoogleSheetWebhookUrl());
  const [sheetModalTesting, setSheetModalTesting] = useState(false);
  const [sheetModalTestResult, setSheetModalTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [sheetModalCopiedScript, setSheetModalCopiedScript] = useState(false);

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
  const [formSikapStation, setFormSikapStation] = useState<string>('Station Kerja 1');
  const [isManageQueueOpen, setIsManageQueueOpen] = useState(false);

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
  const [outletSearchQuery, setOutletSearchQuery] = useState('');
  const [outletFilterStatus, setOutletFilterStatus] = useState<'ALL' | 'OK' | 'NEED_SUPERVISION'>('ALL');

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

  // Helper to find exact or fuzzy product definition
  const findProductDefinition = (query?: string): OnboardingProductItem => {
    if (!query || typeof query !== 'string') return allAvailableProducts[0];
    const q = query.trim().toLowerCase();

    // 1. Exact match by nama
    const exactNama = allAvailableProducts.find(p => p.nama.toLowerCase().trim() === q);
    if (exactNama) return exactNama;

    // 2. Exact match by kode
    const exactKode = allAvailableProducts.find(p => p.kode.toLowerCase().trim() === q);
    if (exactKode) return exactKode;

    // 3. Normalized string (strip brackets, punctuation, multiple spaces)
    const cleanQ = q.replace(/[\(\)\-\:\,\.]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanMatch = allAvailableProducts.find(p => {
      const cleanP = p.nama.toLowerCase().replace(/[\(\)\-\:\,\.]/g, ' ').replace(/\s+/g, ' ').trim();
      return cleanP === cleanQ;
    });
    if (cleanMatch) return cleanMatch;

    // 4. Aliases and common shortcuts in HARA Training Center
    if (cleanQ.includes('teh') && (cleanQ.includes('10') || cleanQ.includes('10l'))) {
      const match = allAvailableProducts.find(p => p.nama === 'Teh (10lt)');
      if (match) return match;
    }
    if (cleanQ.includes('teh') && (cleanQ.includes('8') || cleanQ.includes('8l'))) {
      const match = allAvailableProducts.find(p => p.nama === 'Teh (8lt)');
      if (match) return match;
    }
    if (cleanQ.includes('sambal bawang') || cleanQ === 'sambal') {
      const match = allAvailableProducts.find(p => p.nama === 'Sambal (1 Variant)');
      if (match) return match;
    }
    if (cleanQ === 'keju parut') {
      const match = allAvailableProducts.find(p => p.nama === 'Geprek Keju Parut');
      if (match) return match;
    }
    if (cleanQ === 'mentai') {
      const match = allAvailableProducts.find(p => p.nama === 'Krispi Mentai');
      if (match) return match;
    }
    if (cleanQ === 'ayoli') {
      const match = allAvailableProducts.find(p => p.nama === 'Geprek Ayoli');
      if (match) return match;
    }
    if (cleanQ.includes('ayam utuh')) {
      const match = allAvailableProducts.find(p => p.nama === 'Goreng Ayam Utuh');
      if (match) return match;
    }
    if (cleanQ === 'menggoreng ayam') {
      const match = allAvailableProducts.find(p => p.nama === 'Menggoreng Ayam') || allAvailableProducts.find(p => p.nama === 'Goreng Ayam');
      if (match) return match;
    }
    if (cleanQ === 'goreng ayam') {
      const match = allAvailableProducts.find(p => p.nama === 'Goreng Ayam');
      if (match) return match;
    }
    if (cleanQ.includes('indomie')) {
      const match = allAvailableProducts.find(p => p.nama === 'Indomie Geprek');
      if (match) return match;
    }
    if (cleanQ.includes('krisbar') && !cleanQ.includes('ori')) {
      const match = allAvailableProducts.find(p => p.nama === 'Krisbar Geprek');
      if (match) return match;
    }

    // 5. Partial / Substring match
    const partialMatch = allAvailableProducts.find(p => {
      const pLower = p.nama.toLowerCase();
      return pLower.includes(q) || q.includes(pLower);
    });
    if (partialMatch) return partialMatch;

    return allAvailableProducts[0];
  };

  // Helper to reliably construct steps directly from product definition SOP
  const resolveStepsForProduct = (
    targetProduct: OnboardingProductItem,
    savedChecklist?: { nomor: number; langkah?: string; tercapai: boolean; isKritis?: boolean }[]
  ) => {
    const savedStatusMap = new Map<number, boolean>();
    if (Array.isArray(savedChecklist) && savedChecklist.length === targetProduct.langkahSOP.length) {
      savedChecklist.forEach(s => {
        savedStatusMap.set(s.nomor, s.tercapai);
      });
    }

    return targetProduct.langkahSOP.map(s => ({
      nomor: s.nomor,
      langkah: s.teks,
      tercapai: savedStatusMap.has(s.nomor) ? savedStatusMap.get(s.nomor)! : true,
      isKritis: s.isKritis
    }));
  };

  // Helper to initialize steps for a product
  const getInitialStepsForProduct = (productName: string) => {
    const pDef = findProductDefinition(productName);
    return resolveStepsForProduct(pDef);
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
  const createNewSession = (initialKru?: Kru, defaultProduct?: string, defaultQueue?: string[]): AssessmentSessionTab => {
    const prodName = defaultProduct || allAvailableProducts[0]?.nama || 'Nasi 4 Cup';
    const prodDef = allAvailableProducts.find(p => p.nama === prodName) || allAvailableProducts[0];
    const newId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const defaultFirstCandidate = candidateKrus[0] || kruList[0];
    const candidateId = initialKru?.id || defaultFirstCandidate?.id || 'kru-ob-3001';
    const candidateName = initialKru?.nama_kru || defaultFirstCandidate?.nama_kru || 'Haudy Rizky';
    const queue = defaultQueue && defaultQueue.length > 0 ? defaultQueue : [prodDef.nama];

    return {
      id: newId,
      kruId: candidateId,
      namaKru: candidateName,
      isManualName: false,
      manualNameInput: '',
      outletCode: 'Kantor Lempongsari',
      day: prodDef.day,
      batch: prodDef.batch,
      station: prodDef.station,
      productNama: prodDef.nama,
      productQueue: queue,
      currentProductIndex: 0,
      completedProducts: [],
      timerSeconds: 0,
      isTimerRunning: false,
      suhuMinyakProbe: prodDef.targetSuhuMinyak || 160,
      gramaturAktual: prodDef.targetGramatur || 0,
      stepChecklist: getInitialStepsForProduct(prodDef.nama),
      knowledgeAnswers: { 0: true, 1: true, 2: true, 3: true, 4: true },
      skorKnowledge: 100,
      catatanTrainer: '',
      productNotes: {},
      productStates: {},
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
    setTimList(db.getPenilaianTimStasiun());
    const rawMatrix = localStorage.getItem('hara_pd_peserta_matrix_tc');
    if (rawMatrix !== null) {
      try {
        setPesertaMatrix(JSON.parse(rawMatrix));
      } catch {}
    }

    // Resilient local draft check: NEVER overwrite active working sessions with initial defaults!
    setSessions(prev => {
      const defaultFirst = candidateKrus[0] || k[0] || { id: 'kru-ob-3001', nama_kru: 'Haudy Rizky', kode_outlet: 'Kantor Lempongsari', divisi: 'Kitchen' };
      if (prev && prev.length > 0) {
        return prev.map(s => {
          if (!s.namaKru || s.namaKru.toLowerCase().includes('ridha') || s.namaKru === 'Iqbal Muzzaki') {
            return {
              ...s,
              kruId: defaultFirst.id,
              namaKru: defaultFirst.nama_kru,
            };
          }
          return s;
        });
      }
      try {
        const saved = localStorage.getItem('hara_active_assessment_sessions');
        if (saved) {
          const parsed: AssessmentSessionTab[] = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(s => {
              if (!s.namaKru || s.namaKru.toLowerCase().includes('ridha') || s.namaKru === 'Iqbal Muzzaki') {
                return {
                  ...s,
                  kruId: defaultFirst.id,
                  namaKru: defaultFirst.nama_kru,
                };
              }
              return s;
            });
          }
        }
      } catch {}
      const init = createNewSession(defaultFirst as Kru);
      setActiveTabId(init.id);
      return [init];
    });
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

  // Current Product Definition (Always resolves accurately via fuzzy/exact match)
  const currentProductDef = useMemo(() => {
    if (!activeSession) return allAvailableProducts[0];
    return findProductDefinition(activeSession.productNama);
  }, [activeSession?.productNama, allAvailableProducts]);

  // Synchronized Active Step Checklist: Always guarantees the steps strictly match currentProductDef
  const activeChecklist = useMemo(() => {
    if (!activeSession || !currentProductDef) return [];
    const currentSteps = activeSession.stepChecklist;
    const expectedSteps = currentProductDef.langkahSOP;

    // Check if the current steps in state accurately belong to currentProductDef (strictly verify every step)
    const isMatched = Array.isArray(currentSteps) &&
      currentSteps.length === expectedSteps.length &&
      expectedSteps.every((s, idx) => currentSteps[idx]?.langkah === s.teks);

    if (isMatched) {
      return currentSteps;
    }

    // If out of sync, immediately resolve using target product definition
    const targetState = activeSession.productStates?.[currentProductDef.nama];
    return resolveStepsForProduct(currentProductDef, targetState?.stepChecklist);
  }, [activeSession?.stepChecklist, activeSession?.productStates, currentProductDef]);

  // Auto-heal / synchronize checklist if stepChecklist got out of sync with currentProductDef
  useEffect(() => {
    if (!activeSession || !currentProductDef) return;
    const currentSteps = activeSession.stepChecklist;
    const expectedSteps = currentProductDef.langkahSOP;

    const isOutOfSync = !Array.isArray(currentSteps) ||
      currentSteps.length !== expectedSteps.length ||
      !expectedSteps.every((s, idx) => currentSteps[idx]?.langkah === s.teks);

    if (isOutOfSync) {
      const targetState = activeSession.productStates?.[currentProductDef.nama];
      const reconciled = resolveStepsForProduct(currentProductDef, targetState?.stepChecklist);
      updateActiveSession({
        stepChecklist: reconciled,
        productNama: currentProductDef.nama,
        day: currentProductDef.day,
        batch: currentProductDef.batch,
        station: currentProductDef.station,
      });
    }
  }, [activeSession?.id, activeSession?.productNama, currentProductDef]);

  // Auto-Update Active Session Helper
  const updateActiveSession = (patch: Partial<AssessmentSessionTab>) => {
    setSessions(prev => prev.map(s => {
      if (s.id === (activeSession?.id || activeTabId)) {
        return { ...s, ...patch };
      }
      return s;
    }));
  };

  // Background Multi-Session Stopwatch Interval - Keeps all running timers ticking continuously without resetting
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions(prev => {
        const hasRunning = prev.some(s => s.isTimerRunning || Object.values(s.productStates || {}).some((ps: any) => ps?.isTimerRunning));
        if (!hasRunning) return prev;

        return prev.map(s => {
          const updatedProdStates: Record<string, ProductPracticeState> = { ...(s.productStates || {}) };
          let stateChanged = false;

          // Update timer untuk semua produk di background yang sedang berjalan
          for (const [prodKey, prodStateRaw] of Object.entries(updatedProdStates)) {
            const prodState = prodStateRaw as ProductPracticeState;
            if (prodState && prodState.isTimerRunning) {
              updatedProdStates[prodKey] = {
                ...prodState,
                timerSeconds: (prodState.timerSeconds || 0) + 1,
              };
              stateChanged = true;
            }
          }

          // Sinkronkan produk aktif yang sedang tampil
          const currProdKey = s.productNama;
          if (s.isTimerRunning) {
            const nextSec = (s.timerSeconds || 0) + 1;
            const existingCurr = updatedProdStates[currProdKey];
            updatedProdStates[currProdKey] = {
              ...(existingCurr || {
                stepChecklist: s.stepChecklist,
                knowledgeAnswers: s.knowledgeAnswers,
                skorKnowledge: s.skorKnowledge,
                suhuMinyakProbe: s.suhuMinyakProbe,
                gramaturAktual: s.gramaturAktual,
                catatanTrainer: s.catatanTrainer,
              }),
              timerSeconds: nextSec,
              isTimerRunning: true,
            };
            return {
              ...s,
              timerSeconds: nextSec,
              productStates: updatedProdStates,
            };
          }

          // Jika produk aktif tidak jalan tetapi di productStates jalan
          if (updatedProdStates[currProdKey]?.isTimerRunning) {
            return {
              ...s,
              timerSeconds: updatedProdStates[currProdKey].timerSeconds,
              isTimerRunning: true,
              productStates: updatedProdStates,
            };
          }

          if (stateChanged) {
            return {
              ...s,
              productStates: updatedProdStates,
            };
          }

          return s;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Mounts once: never cancelled on session state updates

  // Switch product safely with INDEPENDENT stopwatch timer per product
  // Switch product safely with INDEPENDENT stopwatch timer per product
  const switchSessionProduct = (targetProdName: string, targetIdx?: number, explicitQueue?: string[]) => {
    if (!activeSession) return;
    const currentProd = activeSession.productNama;
    const targetProd = findProductDefinition(targetProdName);
    if (!targetProd) return;

    // Check whether stopwatch is actively running for the current product
    const wasTimerRunning = !!activeSession.isTimerRunning;

    // 1. Snapshot current active product state with its individual timerSeconds and isTimerRunning
    const currentSnapshot: ProductPracticeState = {
      timerSeconds: activeSession.timerSeconds,
      isTimerRunning: wasTimerRunning,
      stepChecklist: activeChecklist,
      knowledgeAnswers: activeSession.knowledgeAnswers,
      skorKnowledge: activeSession.skorKnowledge,
      suhuMinyakProbe: activeSession.suhuMinyakProbe,
      gramaturAktual: activeSession.gramaturAktual,
      catatanTrainer: activeSession.catatanTrainer,
    };

    const updatedProductStates: Record<string, ProductPracticeState> = {
      ...(activeSession.productStates || {}),
      [currentProd]: currentSnapshot,
    };

    // 2. Retrieve target product state if previously worked on, or initialize fresh
    const targetState = updatedProductStates[targetProd.nama];

    const existingQueue = explicitQueue || (activeSession.productQueue && activeSession.productQueue.length > 0
      ? [...activeSession.productQueue]
      : [activeSession.productNama]);
    
    let updatedQueue = existingQueue;
    let newIndex = targetIdx !== undefined ? targetIdx : existingQueue.indexOf(targetProd.nama);
    if (newIndex === -1) {
      updatedQueue = [...existingQueue, targetProd.nama];
      newIndex = updatedQueue.length - 1;
    }

    // Resolves steps directly from targetProd SOP steps to guarantee exact procedure match
    const nextSteps = resolveStepsForProduct(targetProd, targetState?.stepChecklist);

    // KETIKA GANTI PRODUK DI ORANG YANG SAMA: Tiap produk punya timer mandiri!
    // Produk lama tetap jalan di background via updatedProductStates[currentProd].
    // Produk target memuat timer miliknya sendiri (misal 0 jika baru dibuka).
    const nextTimerSeconds = targetState ? targetState.timerSeconds : 0;
    const nextIsTimerRunning = targetState ? !!targetState.isTimerRunning : false;

    updateActiveSession({
      productQueue: updatedQueue,
      currentProductIndex: newIndex,
      productNama: targetProd.nama,
      day: targetProd.day,
      batch: targetProd.batch,
      station: targetProd.station,
      timerSeconds: nextTimerSeconds,
      isTimerRunning: nextIsTimerRunning,
      stepChecklist: nextSteps,
      knowledgeAnswers: targetState ? targetState.knowledgeAnswers : { 0: true, 1: true, 2: true, 3: true, 4: true },
      skorKnowledge: targetState ? targetState.skorKnowledge : 100,
      suhuMinyakProbe: targetState ? targetState.suhuMinyakProbe : (targetProd.targetSuhuMinyak || 160),
      gramaturAktual: targetState ? targetState.gramaturAktual : (targetProd.targetGramatur || 0),
      catatanTrainer: targetState ? (targetState.catatanTrainer || '') : (activeSession.productNotes?.[targetProd.nama] || ''),
      productStates: updatedProductStates,
      isSaved: false,
    });

    showToast(`Beralih ke: ${targetProd.nama} ${nextIsTimerRunning ? '(Timer berjalan)' : ''}`);
  };

  // Hapus menu dari antrean produk secara aman, presisi dan sinkron
  const handleRemoveProductFromQueue = (idxToRemove: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!activeSession) return;

    const currentQueue = activeSession.productQueue && activeSession.productQueue.length > 0
      ? [...activeSession.productQueue]
      : [activeSession.productNama];

    if (currentQueue.length <= 1) {
      showToast('Minimal harus ada 1 menu SOP dalam antrean praktik.');
      return;
    }

    if (idxToRemove < 0 || idxToRemove >= currentQueue.length) return;

    const removedProductName = currentQueue[idxToRemove];
    const newQueue = currentQueue.filter((_, qIdx) => qIdx !== idxToRemove);
    const currentActiveIdx = activeSession.currentProductIndex || 0;

    // Jika yang dihapus adalah produk yang sedang aktif diuji
    if (idxToRemove === currentActiveIdx || removedProductName === activeSession.productNama) {
      const nextIdx = Math.min(idxToRemove, newQueue.length - 1);
      const nextProdName = newQueue[nextIdx];
      switchSessionProduct(nextProdName, nextIdx, newQueue);
    } else {
      // Jika yang dihapus produk lain dalam antrean
      const newActiveIdx = newQueue.indexOf(activeSession.productNama);
      updateActiveSession({
        productQueue: newQueue,
        currentProductIndex: newActiveIdx >= 0 ? newActiveIdx : 0,
      });
    }

    showToast(`Menu "${removedProductName}" berhasil dihapus dari antrean.`);
  };

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
    const currentProduct = activeSession?.productNama || allAvailableProducts[0]?.nama || 'Nasi 4 Cup';
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
    const baseSteps = activeChecklist.length > 0 ? activeChecklist : activeSession.stepChecklist;
    const nextSteps = baseSteps.map(s => {
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

    // 1. Prosedur Langkah SOP (Bobot: 40%) - Strictly based on activeChecklist of currentProductDef
    const totalSteps = activeChecklist.length;
    const passedSteps = activeChecklist.filter(s => s.tercapai).length;
    let skorProsedur = totalSteps > 0 ? Math.round((passedSteps / totalSteps) * 100) : 100;

    // Check critical point violations
    const missedKritis = activeChecklist.filter(s => s.isKritis && !s.tercapai);
    const failedCriticalPoints = missedKritis.map(m => m.langkah);

    // Suhu fryer critical check (jika ada)
    if (currentProductDef.requiresOilTemp && currentProductDef.targetSuhuMinyak) {
      const tempDiff = Math.abs((activeSession.suhuMinyakProbe || 0) - currentProductDef.targetSuhuMinyak);
      if (tempDiff > 5) {
        failedCriticalPoints.push(`Deviasi Suhu Fryer (${activeSession.suhuMinyakProbe}°C vs Target ${currentProductDef.targetSuhuMinyak}°C)`);
      }
    }

    const hasTitikKritisViolation = failedCriticalPoints.length > 0;
    if (hasTitikKritisViolation) {
      skorProsedur = Math.min(skorProsedur, 60);
    }

    // 2. Kecepatan Waktu Akumulasi SOS (Bobot: 40%) - Strict Curve
    const targetDetik = currentProductDef.stdDetik;
    const actualDetik = activeSession.timerSeconds;
    const timeDiff = actualDetik - targetDetik;
    let skorWaktu = 100;
    if (actualDetik > targetDetik && targetDetik > 0) {
      const overSec = actualDetik - targetDetik;
      const overPct = (overSec / targetDetik) * 100;
      // Deduct 2 points for every 1% delay over target time
      skorWaktu = Math.max(0, Math.round(100 - overPct * 2));
    }

    // 3. Knowledge SOP Lisan (Bobot: 20%)
    const skorKnowledge = activeSession.skorKnowledge;

    // Nilai Sikap 5S & Kerjasama Tim
    const skorKebersihan = activeSession.skorKebersihan ?? 90;
    const skorKerjaSama = activeSession.skorKerjasama ?? 90;
    const subskorTeknis = Math.round(skorProsedur * 0.40 + skorWaktu * 0.40 + skorKnowledge * 0.20);
    const subskorSikap = Math.round((skorKebersihan * 0.5) + (skorKerjaSama * 0.5));

    // Nilai Akhir Komposit: Prosedur 40% + Waktu SOS 40% + Knowledge 20% = 100%
    let skorAkhir = Math.round(
      skorProsedur * 0.40 +
      skorWaktu * 0.40 +
      skorKnowledge * 0.20
    );

    if (hasTitikKritisViolation) {
      skorAkhir = Math.min(skorAkhir, 69);
    }

    const isKompetenMandiri = skorAkhir >= 85 && !hasTitikKritisViolation;
    const isLulusKompeten = skorAkhir >= 70 && skorAkhir < 85 && !hasTitikKritisViolation;
    const isRemedial = skorAkhir < 70 || hasTitikKritisViolation;

    const statusKelulusan = isKompetenMandiri
      ? 'LULUS MAHIR (GRADE A)'
      : isLulusKompeten
      ? 'LULUS KOMPETEN (KKM ≥ 70)'
      : 'WAJIB REMEDIAL (< 70)';

    return {
      skorProsedur,
      skorWaktu,
      skorKnowledge,
      skorKebersihan,
      skorKerjaSama,
      skorKeaktifan: 90,
      skorKetepatan: skorProsedur,
      subskorTeknis,
      subskorSikap,
      skorAkhir,
      isKompetenMandiri,
      isLulusKompeten,
      isRemedial,
      statusKelulusan,
      hasTitikKritisViolation,
      failedCriticalPoints,
      timeDiff,
    };
  }, [activeSession, currentProductDef, activeChecklist]);

  // Handle Save / Submit Individual Assessment
  const handleSaveAssessment = () => {
    if (!activeSession) return;

    const finalPenilai = isCustomPenilai ? (customPenilai.trim() || 'Haikal') : namaPenilai;
    const effectiveKruNama = activeSession.isManualName
      ? (activeSession.manualNameInput.trim() || 'Peserta Mandiri')
      : activeSession.namaKru;

    const matchedKru = candidateKrus.find(k => k.id === activeSession.kruId) || kruList.find(k => k.id === activeSession.kruId);
    const targetOutletPenempatan = resolveRealOutletName(getCandidatePlacement(effectiveKruNama, matchedKru?.outlet_penempatan || matchedKru?.kode_outlet || 'Gito Gati'));

    const newRecord: PenilaianPraktikOnboardingProduk = {
      id: `prak-${Date.now()}`,
      tanggal: tanggalUji,
      batch_id: selectedBatchId !== 'ALL' ? selectedBatchId : (matchedKru?.batch_id || 'batch-ob-2026-10-30'),
      nama_batch: selectedBatchId !== 'ALL' ? (batches.find(b => b.id === selectedBatchId)?.nama_batch || 'Batch Onboarding TC') : 'Batch Onboarding TC',
      kode_outlet: activeSession.outletCode,
      nama_outlet: targetOutletPenempatan,
      lokasi_tc: 'Kantor Lempongsari',
      outlet_penempatan: targetOutletPenempatan,
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
      skor_knowledge: calculatedScores.skorKnowledge,
      subskor_teknis: calculatedScores.subskorTeknis,
      skor_kebersihan: calculatedScores.skorKebersihan,
      skor_kerjasama: calculatedScores.skorKerjaSama,
      skor_keaktifan: 90,
      skor_ketepatan: calculatedScores.skorProsedur,
      subskor_sikap: calculatedScores.subskorSikap,
      skor_akhir: calculatedScores.skorAkhir,
      status: calculatedScores.statusKelulusan,
      status_kelulusan: calculatedScores.statusKelulusan,
      gagal_titik_kritis: calculatedScores.hasTitikKritisViolation,
      titik_kritis_gagal_detail: calculatedScores.failedCriticalPoints,
      penilai_nama: finalPenilai,
      catatan: activeSession.catatanTrainer || (calculatedScores.isKompetenMandiri ? 'Praktik sangat rapi dan sesuai SOP.' : 'Dibutuhkan pendampingan lanjutan.'),
      checklist_langkah: (activeChecklist || []).map(s => ({
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

  // Handle Save and Advance to next product in queue
  const handleSaveAndAdvanceProduct = () => {
    if (!activeSession) return;
    handleSaveAssessment();

    const queue = activeSession.productQueue && activeSession.productQueue.length > 0
      ? activeSession.productQueue
      : [activeSession.productNama];
    const currentIndex = activeSession.currentProductIndex || 0;
    const nextIndex = currentIndex + 1;

    const newCompleted: CompletedProductRecord[] = [
      ...(activeSession.completedProducts || []).filter(cp => cp.productNama !== activeSession.productNama),
      {
        productNama: activeSession.productNama,
        skorAkhir: calculatedScores.skorAkhir,
        durasiDetik: activeSession.timerSeconds,
        timestamp: new Date().toISOString(),
        lulus: calculatedScores.isKompetenMandiri,
      }
    ];

    const wasTimerRunning = !!activeSession.isTimerRunning;

    const currentCompletedState: ProductPracticeState = {
      timerSeconds: activeSession.timerSeconds,
      isTimerRunning: wasTimerRunning,
      stepChecklist: activeChecklist,
      knowledgeAnswers: activeSession.knowledgeAnswers,
      skorKnowledge: activeSession.skorKnowledge,
      suhuMinyakProbe: activeSession.suhuMinyakProbe,
      gramaturAktual: activeSession.gramaturAktual,
      catatanTrainer: activeSession.catatanTrainer,
    };

    const updatedProductStates = {
      ...(activeSession.productStates || {}),
      [activeSession.productNama]: currentCompletedState,
    };

    if (nextIndex < queue.length) {
      const nextProdName = queue[nextIndex];
      const nextProdDef = findProductDefinition(nextProdName);
      const nextSavedState = updatedProductStates[nextProdDef.nama];

      const nextTimerSeconds = nextSavedState ? nextSavedState.timerSeconds : 0;
      const nextIsTimerRunning = nextSavedState ? !!nextSavedState.isTimerRunning : false;

      updateActiveSession({
        currentProductIndex: nextIndex,
        productNama: nextProdDef.nama,
        day: nextProdDef.day,
        batch: nextProdDef.batch,
        station: nextProdDef.station,
        suhuMinyakProbe: nextSavedState ? nextSavedState.suhuMinyakProbe : (nextProdDef.targetSuhuMinyak || 160),
        gramaturAktual: nextSavedState ? nextSavedState.gramaturAktual : (nextProdDef.targetGramatur || 0),
        stepChecklist: resolveStepsForProduct(nextProdDef, nextSavedState?.stepChecklist),
        knowledgeAnswers: nextSavedState ? nextSavedState.knowledgeAnswers : { 0: true, 1: true, 2: true, 3: true, 4: true },
        skorKnowledge: nextSavedState ? nextSavedState.skorKnowledge : 100,
        timerSeconds: nextTimerSeconds,
        isTimerRunning: nextIsTimerRunning,
        catatanTrainer: nextSavedState ? (nextSavedState.catatanTrainer || '') : (activeSession.productNotes?.[nextProdDef.nama] || ''),
        isSaved: false,
        completedProducts: newCompleted,
        productStates: updatedProductStates,
      });

      showToast(`Nilai ${activeSession.productNama} tersimpan! Beralih ke menu #${nextIndex + 1}: ${nextProdDef.nama}`);
    } else {
      updateActiveSession({
        completedProducts: newCompleted,
        productStates: updatedProductStates,
        isSaved: true,
      });
      showToast(`Seluruh antrean (${queue.length} menu) untuk ${activeSession.namaKru} telah selesai dinilai dan tersimpan!`);
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

  // =========================================================================
  // PERHITUNGAN SKOR & LOGIKA PENILAIAN KERJA SAMA TIM (STATION KERJA 1 & 2)
  // =========================================================================
  const timScoreTotal = useMemo(() => {
    return Math.round(
      timScoreRitme * 0.25 +
      timScoreKomunikasi * 0.25 +
      timScoreKebersihan * 0.20 +
      timScoreSOP * 0.15 +
      timScoreHandover * 0.15
    );
  }, [timScoreRitme, timScoreKomunikasi, timScoreKebersihan, timScoreSOP, timScoreHandover]);

  const timPredikat: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan' = useMemo(() => {
    if (timScoreTotal >= 85) return 'Sangat Baik';
    if (timScoreTotal >= 75) return 'Baik';
    if (timScoreTotal >= 65) return 'Cukup';
    return 'Perlu Perbaikan';
  }, [timScoreTotal]);

  const handleSavePenilaianTim = () => {
    const available = candidateKrus.length > 0 ? candidateKrus : kruList;
    const selectedKrus = available.filter(k => selectedTimKruIds.includes(k.id));
    if (selectedKrus.length === 0) {
      showToast('Pilih minimal 1 anggota kru yang bertugas di stasiun ini.');
      return;
    }

    const finalPenilai = isCustomPenilai ? (customPenilai.trim() || 'Haikal') : namaPenilai;
    const batchObj = batches.find(b => b.id === selectedBatchId);

    const newRecord: PenilaianTimStasiun = {
      id: `pts-${Date.now()}`,
      tanggal: tanggalUji,
      batch_id: selectedBatchId !== 'ALL' ? selectedBatchId : '',
      batch_name: batchObj ? batchObj.nama_batch : 'Onboarding Kantor Lempongsari',
      kode_outlet: 'Kantor Lempongsari',
      stasiun: selectedTimStation,
      anggota_kru_ids: selectedKrus.map(k => k.id),
      anggota_kru_nama: selectedKrus.map(k => k.nama_kru),
      skor_ritme_kecepatan: timScoreRitme,
      skor_komunikasi_koordinasi: timScoreKomunikasi,
      skor_kebersihan_sanitasi: timScoreKebersihan,
      skor_kepatuhan_sop: timScoreSOP,
      skor_handover_estafet: timScoreHandover,
      skor_total: timScoreTotal,
      predikat: timPredikat,
      ceklis_tim: { ...timCeklis },
      catatan_trainer: timCatatan.trim() || `Koordinasi tim ${selectedTimStation} berlangsung solid dan tertib.`,
      penilai_nama: finalPenilai,
      created_at: new Date().toISOString(),
    };

    db.savePenilaianTimStasiun(newRecord);
    setTimList(db.getPenilaianTimStasiun());
    setTimCatatan('');
    showToast(`Penilaian tim "${selectedTimStation}" berhasil disimpan! Skor: ${timScoreTotal}`);
  };

  const handleDeletePenilaianTim = (id: string) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Penilaian Tim Stasiun',
      message: 'Apakah Anda yakin ingin menghapus data penilaian kerja sama tim ini?',
      detailText: `ID: ${id}`,
      onConfirm: () => {
        db.deletePenilaianTimStasiun(id);
        setTimList(db.getPenilaianTimStasiun());
        showToast('Data penilaian tim stasiun berhasil dihapus.');
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleResetActiveDraft = () => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Reset Form Penilaian Aktif',
      message: 'Apakah Anda yakin ingin mengosongkan form draft sesi ini dan memulai lembar penilaian baru?',
      detailText: 'Data riwayat yang sudah pernah disimpan tetap aman di database.',
      onConfirm: () => {
        const k = candidateKrus[0] || kruList[0] || { id: 'init-1', nama_kru: 'Peserta 1', kode_outlet: 'Kantor Lempongsari', divisi: 'Kitchen' };
        const prodDef = allAvailableProducts[0];
        const freshSession: AssessmentSessionTab = {
          id: `session-${Date.now()}`,
          kruId: k.id,
          namaKru: k.nama_kru,
          isManualName: false,
          manualNameInput: '',
          outletCode: 'Kantor Lempongsari',
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
        setSessions([freshSession]);
        setActiveTabId(freshSession.id);
        localStorage.setItem('hara_active_assessment_sessions', JSON.stringify([freshSession]));
        localStorage.setItem('hara_active_assessment_tab_id', freshSession.id);
        showToast('Form draft telah dibersihkan. Memulai sesi baru.');
        setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Sync to Supabase & Server
  const handleSyncCohort = async () => {
    showToast('Menyinkronkan data onboarding ke Cloud Supabase & Server...');
    try {
      const { pullAllFromSupabase } = await import('../../lib/supabase');
      const { pushToServer } = await import('../../lib/serverSync');
      await pullAllFromSupabase();
      await pushToServer('penilaian_praktik_onboarding_produk', historyList, 'UPSERT');
      showToast('Sinkronisasi data ke Cloud Supabase & Server berhasil!');
    } catch {
      showToast('Data tersimpan secara lokal dan otomatis disinkronkan saat terhubung.');
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
          SUB-TAB NAVIGATION BAR: PRAKTIK PRODUK, PENILAIAN TIM, DETAIL SIKAP, RIWAYAT & PESERTA
          =================================================================== */}
      <div className="p-1.5 bg-[#FAF8F5] rounded-2xl border border-[#E6E1DA] shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full">
          <button
            type="button"
            onClick={() => setActiveSubTab('produk')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'produk'
                ? 'bg-[#96171B] text-white shadow-xs'
                : 'text-[#645D55] hover:text-[#181411] hover:bg-white/80'
            }`}
          >
            <UtensilsCrossed size={14} />
            <span>Praktik Produk (SOP & Timer)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
              activeSubTab === 'produk' ? 'bg-white/20 text-white' : 'bg-stone-200 text-[#645D55]'
            }`}>
              Individu
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('jobdesk')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'jobdesk'
                ? 'bg-[#96171B] text-white shadow-xs'
                : 'text-[#645D55] hover:text-[#181411] hover:bg-white/80'
            }`}
          >
            <ClipboardCheck size={14} />
            <span>Kebersihan & Sikap Kru</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
              activeSubTab === 'jobdesk' ? 'bg-white/20 text-white' : 'bg-stone-200 text-[#645D55]'
            }`}>
              5S & Higiene
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('tim')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'tim'
                ? 'bg-[#96171B] text-white shadow-xs'
                : 'text-[#645D55] hover:text-[#181411] hover:bg-white/80'
            }`}
          >
            <Users size={14} />
            <span>Kerjasama Tim (Station 1 & 2)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
              activeSubTab === 'tim' ? 'bg-white/20 text-white' : 'bg-stone-200 text-[#645D55]'
            }`}>
              {timList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('riwayat')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'riwayat'
                ? 'bg-[#96171B] text-white shadow-xs'
                : 'text-[#645D55] hover:text-[#181411] hover:bg-white/80'
            }`}
          >
            <FileText size={14} />
            <span>Rekapitulasi Nilai Terpadu</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
              activeSubTab === 'riwayat' ? 'bg-white/20 text-white' : 'bg-stone-200 text-[#645D55]'
            }`}>
              {historyList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('analitik_outlet')}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'analitik_outlet'
                ? 'bg-[#96171B] text-white shadow-xs'
                : 'text-[#645D55] hover:text-[#181411] hover:bg-white/80'
            }`}
          >
            <Store size={14} />
            <span>Analitik Outlet Penempatan</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
              activeSubTab === 'analitik_outlet' ? 'bg-white/20 text-white' : 'bg-red-50 text-[#96171B] font-bold'
            }`}>
              {candidateKrus.length > 0 ? candidateKrus.length : 12} Kru
            </span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          BAR ATAS: LOKASI TETAP KANTOR LEMPONGSARI, PENILAI, BATCH, TANGGAL & AUTO-SAVE
          =================================================================== */}
      <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Badge Lokasi Permanen */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-[#96171B] border border-red-200 text-xs font-bold shrink-0">
            <Building2 size={13} className="text-[#96171B]" />
            <span>Kantor Lempongsari (TC)</span>
          </div>

          <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />

          {/* Penilai Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500 text-[11px]">Trainer:</span>
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
                className="py-1 px-2 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 text-xs focus:border-[#96171B] outline-none"
              >
                {DAFTAR_PENILAI_DEFAULT.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="custom">+ Nama Lain...</option>
              </select>
            ) : (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={customPenilai}
                  onChange={(e) => setCustomPenilai(e.target.value)}
                  placeholder="Ketik nama penilai..."
                  className="py-1 px-2 rounded-lg border border-slate-200 text-xs font-semibold focus:border-[#96171B] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomPenilai(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-700"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>

          <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />

          {/* Batch Selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500 text-[11px]">Batch:</span>
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
              className="py-1 px-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold max-w-[200px] truncate focus:border-[#96171B] outline-none"
            >
              <option value="ALL">Onboarding Umum (Semua Kru)</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.nomor_batch} - {b.nama_batch} ({b.peserta?.length || 0} Kru)</option>
              ))}
            </select>
          </div>

          <div className="h-3.5 w-px bg-slate-200 hidden sm:block" />

          {/* Tanggal Pelaksanaan */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500 text-[11px]">Tanggal:</span>
            <input
              type="date"
              value={tanggalUji}
              onChange={(e) => setTanggalUji(e.target.value)}
              className="py-1 px-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:border-[#96171B] outline-none"
            >
            </input>
          </div>
        </div>

        {/* Action Shortcuts & Anti-Reset Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Auto-Save Proteksi Refresh */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold" title="Draft disimpan otomatis">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto-Save</span>
          </div>

          <button
            type="button"
            onClick={() => {
              const docUrl = getSavedGoogleSheetDocUrl();
              if (docUrl) {
                window.open(docUrl, '_blank');
              } else {
                setIsSheetLinkModalOpen(true);
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Buka Spreadsheet di Google Drive"
          >
            <FileSpreadsheet size={13} className="text-emerald-700" />
            <span>Google Sheet</span>
            <ExternalLink size={10} className="opacity-70" />
          </button>

          <button
            type="button"
            onClick={handleOpenSOPTargetEditor}
            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            title="Ubah Target Waktu Baku"
          >
            <Clock size={13} className="text-amber-700" />
            <span>Target SOP</span>
          </button>

          <button
            type="button"
            onClick={handleResetActiveDraft}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 text-xs transition-colors cursor-pointer"
            title="Reset draft form ini"
          >
            <RotateCcw size={13} />
          </button>

          <button
            type="button"
            onClick={handleSyncCohort}
            className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            title="Sinkronkan Cloud"
          >
            <RefreshCw size={12} />
            <span>Sinkron</span>
          </button>
        </div>
      </div>

      {/* ===================================================================
          SUB-TAB 1: PRAKTIK PRODUK (INDIVIDU)
          =================================================================== */}
      {activeSubTab === 'produk' && (
        <div className="w-full space-y-5">
          {/* CONCURRENT MULTI-KRU TABS & CANDIDATE SELECTOR RIBBON */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
            {/* Multi-Session Tabs Bar */}
            <div className="flex items-center justify-between gap-3 overflow-x-auto pb-0.5">
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {sessions.map((sess, idx) => {
                  const isActive = sess.id === activeTabId;
                  const displayName = sess.isManualName
                    ? (sess.manualNameInput.trim() || `Peserta ${idx + 1}`)
                    : sess.namaKru;
                  const placement = getCandidatePlacement(displayName);

                  return (
                    <div
                      key={sess.id}
                      onClick={() => setActiveTabId(sess.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border shrink-0 ${
                        isActive
                          ? 'bg-[#181411] text-white border-[#181411] shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        sess.isTimerRunning
                          ? 'bg-amber-400 animate-pulse'
                          : sess.isSaved
                          ? 'bg-emerald-400'
                          : 'bg-slate-300'
                      }`} />

                      <div className="flex flex-col text-left">
                        <span className="truncate max-w-[130px] font-bold">{displayName}</span>
                        <span className={`text-[9.5px] truncate max-w-[130px] ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                          {placement} · {sess.productNama}
                        </span>
                      </div>

                      {sessions.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleCloseSession(sess.id, e)}
                          className="p-0.5 hover:bg-neutral-700/50 rounded text-slate-400 hover:text-white transition-colors"
                          title="Tutup tab ini"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons: Add Single / Batch Crew */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setBatchCrewModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Buka banyak kru sekaligus dari master kru"
                >
                  <Users size={13} className="text-[#96171B]" />
                  <span>Buka Sekaligus</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddNewSession}
                  className="px-2.5 py-1.5 rounded-lg border border-dashed border-[#96171B] bg-red-50/40 text-[#96171B] hover:bg-red-50 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  <span>+ Kru</span>
                </button>
              </div>
            </div>

            {/* Active Session Kru & SOP Product Ribbon (Single Unified Row) */}
            {activeSession && (() => {
              const queue = activeSession.productQueue && activeSession.productQueue.length > 0
                ? activeSession.productQueue
                : [activeSession.productNama];
              const currentIdx = activeSession.currentProductIndex || 0;
              const activePlacement = getCandidatePlacement(activeSession.isManualName ? activeSession.manualNameInput : activeSession.namaKru);

              return (
                <div className="pt-2 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Left: Kru Selector & Real Placement Outlet */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="w-8 h-8 rounded-full bg-[#96171B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {((activeSession.isManualName ? activeSession.manualNameInput : activeSession.namaKru) || 'K')[0].toUpperCase()}
                    </div>

                    <div className="flex items-center gap-2">
                      {!activeSession.isManualName ? (
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
                          className="py-1 px-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:border-[#96171B] outline-none max-w-[200px] truncate"
                        >
                          {candidateKrus.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.nama_kru} ({k.kode_outlet})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={activeSession.manualNameInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateActiveSession({
                              manualNameInput: val,
                              namaKru: val.trim() || 'Peserta Mandiri',
                              outletCode: 'Kantor Lempongsari',
                            });
                          }}
                          placeholder="Nama lengkap kru..."
                          className="py-1 px-2.5 rounded-lg border border-red-300 text-xs font-bold text-slate-800 bg-red-50/20 focus:border-[#96171B] outline-none"
                        />
                      )}

                      {/* Outlet Penempatan Riil Badge */}
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 text-[11px] font-semibold flex items-center gap-1">
                        <Store size={11} className="text-[#96171B]" />
                        <span>Penempatan: <strong>{activePlacement}</strong></span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          updateActiveSession({
                            isManualName: !activeSession.isManualName,
                            manualNameInput: activeSession.isManualName ? '' : activeSession.namaKru,
                          });
                        }}
                        className="text-[10.5px] text-[#96171B] font-semibold hover:underline cursor-pointer"
                      >
                        {activeSession.isManualName ? 'Pilih Master' : 'Ketik Manual'}
                      </button>
                    </div>
                  </div>

                  {/* Right: Active SOP, Target Menit & Unified Button "Pilih & Atur Menu SOP" */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Active Product Name & Target */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50/60 border border-red-100">
                      <span className="text-[10px] font-mono font-bold bg-[#96171B] text-white px-1.5 py-0.2 rounded">
                        {currentProductDef.kode}
                      </span>
                      <span className="font-bold text-xs text-slate-900">{currentProductDef.nama}</span>
                      <span className="text-[10.5px] text-slate-500">
                        • Target: <strong className="text-slate-800">{(currentProductDef.stdDetik / 60).toFixed(1)} menit</strong>
                      </span>
                    </div>

                    {/* Unified Button "Pilih & Atur Menu SOP" */}
                    <button
                      type="button"
                      onClick={() => setIsProductPickerOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
                      title="Pilih & Atur SOP Produk yang dinilai"
                    >
                      <UtensilsCrossed size={13} />
                      <span>Pilih & Atur Menu SOP</span>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
                        {queue.length}
                      </span>
                    </button>

                    {/* Queue Quick Switcher Chips */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                      {queue.map((prodName, pIdx) => {
                        const isCurrent = pIdx === currentIdx;
                        const completedRecord = (activeSession.completedProducts || []).find(cp => cp.productNama === prodName);
                        const isDone = !!completedRecord;

                        return (
                          <div
                            key={`${prodName}-${pIdx}`}
                            className={`shrink-0 px-2 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 border ${
                              isCurrent
                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                : isDone
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => switchSessionProduct(prodName, pIdx)}
                              className="flex items-center gap-1 cursor-pointer text-left"
                              title={`Beralih ke ${prodName}`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-mono ${
                                isCurrent ? 'bg-white/20 text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {isDone ? '✓' : pIdx + 1}
                              </span>
                              <span className="truncate max-w-[110px]">{prodName}</span>
                            </button>

                            {queue.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => handleRemoveProductFromQueue(pIdx, e)}
                                className={`ml-0.5 p-0.5 rounded transition-colors cursor-pointer ${
                                  isCurrent
                                    ? 'hover:bg-white/20 text-white/70 hover:text-white'
                                    : 'hover:bg-rose-100 text-slate-400 hover:text-rose-600'
                                }`}
                                title={`Hapus "${prodName}" dari antrean`}
                              >
                                <X size={11} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* MAIN ASSESSMENT COCKPIT: BALANCED 5 : 7 SPLIT */}
          {activeSession && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN: STOPWATCH SOS, KONTROL, PARAMETER TEKNIS & HASIL SKOR */}
              <div className="lg:col-span-5 space-y-5">
                {/* DIGITAL SOS STOPWATCH CARD */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Clock size={14} className="text-[#96171B]" />
                      <span>Pengukuran Waktu Praktik (SOS)</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Target: <strong className="text-slate-800">{(currentProductDef.stdDetik / 60).toFixed(1)} menit</strong> ({currentProductDef.stdDetik}s)
                    </span>
                  </div>

                  {/* Stopwatch Digits & Controls */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Durasi Berjalan:
                        </span>
                        <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-900 mt-0.5">
                          {formatTime(activeSession.timerSeconds)}
                          <span className="text-xs font-normal text-slate-500 ml-1.5">
                            ({(activeSession.timerSeconds / 60).toFixed(1)} menit)
                          </span>
                        </div>
                      </div>

                      {/* Realtime Status Indicator */}
                      <div className="text-right">
                        {activeSession.timerSeconds === 0 ? (
                          <span className="text-[10.5px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                            Belum dimulai
                          </span>
                        ) : activeSession.timerSeconds <= currentProductDef.stdDetik ? (
                          <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            ✓ Memenuhi SOS
                          </span>
                        ) : activeSession.timerSeconds <= currentProductDef.stdDetik + 30 ? (
                          <span className="text-[10.5px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            ⚠️ Deviasi +{activeSession.timerSeconds - currentProductDef.stdDetik}s
                          </span>
                        ) : (
                          <span className="text-[10.5px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                            ⛔ Overtime +{activeSession.timerSeconds - currentProductDef.stdDetik}s
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
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

                    {/* Button Group */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const nextRunning = !activeSession.isTimerRunning;
                          const currProd = activeSession.productNama;
                          const currState = activeSession.productStates?.[currProd];
                          const updatedSnapshot: ProductPracticeState = {
                            ...(currState || {
                              stepChecklist: activeChecklist,
                              knowledgeAnswers: activeSession.knowledgeAnswers,
                              skorKnowledge: activeSession.skorKnowledge,
                              suhuMinyakProbe: activeSession.suhuMinyakProbe,
                              gramaturAktual: activeSession.gramaturAktual,
                              catatanTrainer: activeSession.catatanTrainer,
                            }),
                            timerSeconds: activeSession.timerSeconds,
                            isTimerRunning: nextRunning,
                          };
                          updateActiveSession({
                            isTimerRunning: nextRunning,
                            productStates: {
                              ...(activeSession.productStates || {}),
                              [currProd]: updatedSnapshot,
                            },
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer ${
                          activeSession.isTimerRunning
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-[#96171B] hover:bg-[#7A1216]'
                        }`}
                      >
                        {activeSession.isTimerRunning ? <Pause size={13} /> : <Play size={13} />}
                        <span>{activeSession.isTimerRunning ? 'Jeda' : 'Mulai'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const currProd = activeSession.productNama;
                          const currState = activeSession.productStates?.[currProd];
                          const updatedSnapshot: ProductPracticeState = {
                            ...(currState || {
                              stepChecklist: activeChecklist,
                              knowledgeAnswers: activeSession.knowledgeAnswers,
                              skorKnowledge: activeSession.skorKnowledge,
                              suhuMinyakProbe: activeSession.suhuMinyakProbe,
                              gramaturAktual: activeSession.gramaturAktual,
                              catatanTrainer: activeSession.catatanTrainer,
                            }),
                            timerSeconds: currentProductDef.stdDetik,
                            isTimerRunning: false,
                          };
                          updateActiveSession({
                            timerSeconds: currentProductDef.stdDetik,
                            isTimerRunning: false,
                            productStates: {
                              ...(activeSession.productStates || {}),
                              [currProd]: updatedSnapshot,
                            },
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                        title="Set tepat target"
                      >
                        Target ({(currentProductDef.stdDetik / 60).toFixed(1)}m)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newSec = Math.max(0, activeSession.timerSeconds + 30);
                          const currProd = activeSession.productNama;
                          const currState = activeSession.productStates?.[currProd];
                          const updatedSnapshot: ProductPracticeState = {
                            ...(currState || {
                              stepChecklist: activeChecklist,
                              knowledgeAnswers: activeSession.knowledgeAnswers,
                              skorKnowledge: activeSession.skorKnowledge,
                              suhuMinyakProbe: activeSession.suhuMinyakProbe,
                              gramaturAktual: activeSession.gramaturAktual,
                              catatanTrainer: activeSession.catatanTrainer,
                            }),
                            timerSeconds: newSec,
                            isTimerRunning: activeSession.isTimerRunning,
                          };
                          updateActiveSession({
                            timerSeconds: newSec,
                            productStates: {
                              ...(activeSession.productStates || {}),
                              [currProd]: updatedSnapshot,
                            },
                          });
                        }}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        +30s
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const newSec = Math.max(0, activeSession.timerSeconds - 30);
                          const currProd = activeSession.productNama;
                          const currState = activeSession.productStates?.[currProd];
                          const updatedSnapshot: ProductPracticeState = {
                            ...(currState || {
                              stepChecklist: activeChecklist,
                              knowledgeAnswers: activeSession.knowledgeAnswers,
                              skorKnowledge: activeSession.skorKnowledge,
                              suhuMinyakProbe: activeSession.suhuMinyakProbe,
                              gramaturAktual: activeSession.gramaturAktual,
                              catatanTrainer: activeSession.catatanTrainer,
                            }),
                            timerSeconds: newSec,
                            isTimerRunning: activeSession.isTimerRunning,
                          };
                          updateActiveSession({
                            timerSeconds: newSec,
                            productStates: {
                              ...(activeSession.productStates || {}),
                              [currProd]: updatedSnapshot,
                            },
                          });
                        }}
                        className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        -30s
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const currProd = activeSession.productNama;
                          const currState = activeSession.productStates?.[currProd];
                          const updatedSnapshot: ProductPracticeState = {
                            ...(currState || {
                              stepChecklist: activeChecklist,
                              knowledgeAnswers: activeSession.knowledgeAnswers,
                              skorKnowledge: activeSession.skorKnowledge,
                              suhuMinyakProbe: activeSession.suhuMinyakProbe,
                              gramaturAktual: activeSession.gramaturAktual,
                              catatanTrainer: activeSession.catatanTrainer,
                            }),
                            timerSeconds: 0,
                            isTimerRunning: false,
                          };
                          updateActiveSession({
                            timerSeconds: 0,
                            isTimerRunning: false,
                            productStates: {
                              ...(activeSession.productStates || {}),
                              [currProd]: updatedSnapshot,
                            },
                          });
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs transition-colors cursor-pointer"
                        title="Reset stopwatch ke 0"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Parameter Teknis Kondisional (Suhu Fryer / Gramatur) */}
                  {currentProductDef.requiresOilTemp && (
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-red-50/20 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Thermometer size={14} className="text-[#96171B]" />
                        <span>Suhu Fryer (°C):</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-100 text-[#96171B]">
                          Target {currentProductDef.targetSuhuMinyak}°C
                        </span>
                      </div>
                      <input
                        type="number"
                        value={activeSession.suhuMinyakProbe}
                        onChange={(e) => updateActiveSession({ suhuMinyakProbe: Number(e.target.value) })}
                        className="w-20 p-1 rounded-md border border-slate-200 text-xs font-bold font-mono text-center outline-none focus:border-[#96171B]"
                        min="100"
                        max="220"
                      />
                    </div>
                  )}
                </div>

                {/* LIVE COMPOSITE SCORING CARD */}
                <div className="p-5 sm:p-6 rounded-2xl bg-[#181411] text-white shadow-md space-y-4 border border-neutral-800">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                        SKOR KOMPOSIT AKTIF
                      </span>
                      <span className="text-xs font-bold text-white">
                        {activeSession.isManualName ? activeSession.manualNameInput : activeSession.namaKru}
                      </span>
                    </div>

                    <div className={`px-2 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1 ${
                      calculatedScores.isKompetenMandiri
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : calculatedScores.isLulusKompeten
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {calculatedScores.isKompetenMandiri ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>LULUS MAHIR (GRADE A)</span>
                        </>
                      ) : calculatedScores.isLulusKompeten ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>LULUS KOMPETEN (≥70)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={12} />
                          <span>REMEDIAL (&lt;70)</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <div className="text-4xl font-black font-mono tracking-tight text-white">
                        {calculatedScores.skorAkhir}
                        <span className="text-sm font-normal text-slate-400 ml-1">/ 100</span>
                      </div>
                      <span className="text-[10.5px] text-slate-400">KKM Standar: 70 Poin</span>
                    </div>

                    {/* 3-Pillar Breakdown */}
                    <div className="space-y-1 text-[11px] font-mono text-slate-300 text-right">
                      <div>Prosedur (40%): <strong className="text-white">{calculatedScores.skorProsedur}</strong></div>
                      <div>Waktu SOS (40%): <strong className="text-white">{calculatedScores.skorWaktu}</strong></div>
                      <div>Knowledge (20%): <strong className="text-white">{calculatedScores.skorKnowledge}</strong></div>
                    </div>
                  </div>

                  {/* Titik Kritis Warning */}
                  {calculatedScores.hasTitikKritisViolation && (
                    <div className="p-2 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-1.5">
                      <ShieldAlert size={14} className="shrink-0 text-rose-400" />
                      <span>Pelanggaran Titik Kritis: Status otomatis Remedial.</span>
                    </div>
                  )}
                </div>

                {/* INFO PEMISAHAN PENILAIAN KEBERSIHAN & KERJASAMA */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-amber-950 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#96171B]" />
                      <span>Penilaian Kebersihan & Kerjasama Tim</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-bold uppercase tracking-wider">
                      Terpisah
                    </span>
                  </div>
                  <p className="text-[11.5px] text-amber-900/90 leading-relaxed">
                    Sesuai instruksi operasional, evaluasi <strong>Kebersihan & Higiene 5S</strong> serta <strong>Kerjasama Tim</strong> dinilai terpisah melalui tab di atas, kemudian otomatis direkap menjadi <strong>1 Nilai Terpadu (100%)</strong> pada tab <strong>Rekapitulasi Nilai</strong>.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('jobdesk')}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-950 text-[11px] font-bold hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <ClipboardCheck size={12} className="text-[#96171B]" />
                      <span>Buka Form Kebersihan 5S ↗</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('tim')}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-950 text-[11px] font-bold hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Users size={12} className="text-emerald-700" />
                      <span>Buka Form Kerjasama Tim ↗</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: SOP PROCEDURE CHECKLIST, KNOWLEDGE QUESTIONS & NOTES */}
              <div className="lg:col-span-7 space-y-5">
                {/* SOP CHECKLIST STEPS */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs text-slate-800">
                        Langkah Prosedur SOP ({activeChecklist.length} Langkah)
                      </h3>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-[#96171B] border border-rose-200">
                        {currentProductDef.nama}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const allChecked = activeChecklist.map(s => ({ ...s, tercapai: true }));
                          updateActiveSession({ stepChecklist: allChecked });
                        }}
                        className="text-[10.5px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                      >
                        ✓ Centang Semua
                      </button>
                      <span className="text-slate-300">|</span>
                      <span className="text-[10.5px] font-bold text-[#96171B] font-mono">
                        Bobot: 40%
                      </span>
                    </div>
                  </div>

                  {/* Scrollable Step Items Container */}
                  <div className="max-h-[340px] overflow-y-auto pr-1 space-y-1.5">
                    {activeChecklist.map((step) => (
                      <div
                        key={step.nomor}
                        onClick={() => handleToggleStep(step.nomor)}
                        className={`p-2.5 rounded-lg border transition-all flex items-start gap-2.5 cursor-pointer ${
                          step.tercapai
                            ? 'bg-white border-slate-200 hover:border-emerald-300'
                            : 'bg-rose-50/40 border-rose-200'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          step.tercapai
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white border-rose-300 text-transparent'
                        }`}>
                          <Check size={11} strokeWidth={3} />
                        </div>

                        <div className="flex-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">#{step.nomor}</span>
                            {step.isKritis && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                TITIK KRITIS
                              </span>
                            )}
                          </div>
                          <p className={`mt-0.5 leading-relaxed text-[11.5px] ${
                            step.tercapai ? 'text-slate-800' : 'text-rose-800 line-through'
                          }`}>
                            {step.langkah}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KNOWLEDGE SOP LISAN QUESTIONS (20%) */}
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-800 text-sm">Knowledge SOP Lisan (Bobot: 20%)</span>
                    <span className="text-sm font-mono font-bold text-[#96171B]">
                      {activeSession.skorKnowledge} / 100
                    </span>
                  </div>

                  <div className="space-y-2 pt-0.5">
                    {currentProductDef.autoQuestions.map((q, qIdx) => {
                      const isPassed = activeSession.knowledgeAnswers[qIdx] ?? true;
                      return (
                        <div key={qIdx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-slate-800 text-[11.5px] block truncate">
                              {qIdx + 1}. {q.tanya}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              Kunci: {q.kunci}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleKnowledgeQuestion(qIdx, true)}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold cursor-pointer transition-all ${
                                isPassed
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              ✓ Benar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleKnowledgeQuestion(qIdx, false)}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold cursor-pointer transition-all ${
                                !isPassed
                                  ? 'bg-rose-600 text-white shadow-2xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
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
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-2 text-xs">
                  <label className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                    Catatan Evaluasi Trainer:
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
                    placeholder={`Catatan untuk ${currentProductDef.nama}...`}
                    rows={2}
                    className="w-full p-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#96171B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DOCKED STICKY BOTTOM ACTION BAR (ERGONOMIC SINGLE-SCREEN SAVE) */}
          {activeSession && (() => {
            const queue = activeSession.productQueue && activeSession.productQueue.length > 0
              ? activeSession.productQueue
              : [activeSession.productNama];
            const currentIdx = activeSession.currentProductIndex || 0;
            const hasNext = (currentIdx + 1) < queue.length;
            const effName = activeSession.isManualName
              ? (activeSession.manualNameInput.trim() || 'Peserta')
              : activeSession.namaKru;
            const placement = getCandidatePlacement(effName);

            return (
              <div className="sticky bottom-2 z-30 bg-white/95 backdrop-blur-md border border-[#E6E1DA] py-3.5 px-5 sm:px-6 flex flex-wrap items-center justify-between gap-3 shadow-md rounded-2xl">
                {/* Left: Summary of active evaluation */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-800">{effName}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">{placement}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-bold text-[#96171B]">{currentProductDef.nama}</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono font-bold text-slate-900">
                    Skor: {calculatedScores.skorAkhir} ({calculatedScores.statusKelulusan})
                  </span>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAssessment}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                    title="Simpan menu ini saja tanpa berpindah"
                  >
                    Simpan Menu Saja
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAndAdvanceProduct}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 size={15} />
                    <span>
                      {hasNext ? 'Simpan & Lanjut Menu Berikutnya ➔' : 'Simpan & Selesaikan Sesi Kru'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
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
                        checklist_langkah: (activeChecklist || []).map(s => ({
                          nomor: s.nomor,
                          langkah: s.langkah,
                          tercapai: !!s.tercapai,
                        })),
                        created_at: new Date().toISOString(),
                      };
                      exportPenilaianPraktikProdukPDF(recordToExport);
                    }}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Unduh PDF Lembar Evaluasi Resmi"
                  >
                    <Download size={15} />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 2: RIWAYAT & RAPOR EVALUASI ONBOARDING TERPADU (2 PILAR)
          =================================================================== */}
      {activeSubTab === 'riwayat' && (
        <div className="w-full space-y-5">
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
                  onClick={() => {
                    const docUrl = getSavedGoogleSheetDocUrl();
                    if (docUrl) {
                      window.open(docUrl, '_blank');
                    } else {
                      setIsSheetLinkModalOpen(true);
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  title="Buka Spreadsheet di Google Drive Anda"
                >
                  <FileSpreadsheet size={14} className="text-emerald-100" />
                  <span>Buka Google Sheet ↗</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSheetLinkModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-[#E6E1DA] text-xs font-bold text-[#645D55] hover:text-[#181411] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Tautkan file Google Sheet & Webhook Apps Script"
                >
                  <ExternalLink size={13} className="text-[#96171B]" />
                  <span>Link & Pengaturan Sheet</span>
                </button>

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
                  className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Kirim seluruh riwayat ke Webhook Google Sheets sekarang"
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
        <div className="w-full space-y-5">
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
                  <option value="Station Kerja 1">Station Kerja 1 (SK 1: Preparation, Nasi, Panci, Marinasi)</option>
                  <option value="Station Kerja 2">Station Kerja 2 (SK 2: Fryer, Crispy, Geprek, Sambal, Packing)</option>
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
          SUB-TAB: PENILAIAN TIM STASIUN (STATION KERJA 1 & STATION KERJA 2)
          =================================================================== */}
      {activeSubTab === 'tim' && (
        <div className="w-full space-y-5">
          {/* Header Card Evaluasi Tim */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E1DA] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#96171B] uppercase tracking-wider">
                    Modul Evaluasi Kolaborasi & Koordinasi Lapangan
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-[#181411] text-[10px] font-bold border border-[#E6E1DA]">
                    Kantor Lempongsari
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#181411] tracking-tight mt-0.5">
                  Penilaian Kerja Sama Tim Stasiun Kerja (Station 1 & Station 2)
                </h3>
                <p className="text-xs text-[#645D55] mt-1 leading-relaxed">
                  Evaluasi ritme flow kerja tanpa hambatan (bottleneck), respon komunikasi vokal, disiplin sanitasi meja & alat bersama, serta kelancaran estafet serah terima produk antar stasiun.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#645D55] uppercase block">Total Nilai Tim</span>
                  <span className="text-2xl font-black text-[#96171B] font-mono leading-none">{timScoreTotal}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl border border-neutral-200 bg-[#FAF8F5]">
                  <span className={`text-xs font-bold ${
                    timScoreTotal >= 85 ? 'text-emerald-700' : timScoreTotal >= 75 ? 'text-blue-700' : 'text-amber-700'
                  }`}>
                    {timPredikat}
                  </span>
                </div>
              </div>
            </div>

            {/* Pemilihan Stasiun Kerja */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider block">
                1. Pilih Stasiun Kerja yang Diobservasi:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTimStation('Station 1')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTimStation === 'Station 1' || selectedTimStation === 'Station Kerja 1'
                      ? 'border-[#96171B] bg-red-50/40 ring-2 ring-[#96171B]/20'
                      : 'border-[#E6E1DA] bg-white hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-[#181411]">Station 1</span>
                    {(selectedTimStation === 'Station 1' || selectedTimStation === 'Station Kerja 1') && (
                      <span className="px-2.5 py-1 rounded-full bg-[#96171B] text-white text-[11px] font-bold">Aktif Dinilai</span>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedTimStation('Station 2')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTimStation === 'Station 2' || selectedTimStation === 'Station Kerja 2'
                      ? 'border-[#96171B] bg-red-50/40 ring-2 ring-[#96171B]/20'
                      : 'border-[#E6E1DA] bg-white hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-[#181411]">Station 2</span>
                    {(selectedTimStation === 'Station 2' || selectedTimStation === 'Station Kerja 2') && (
                      <span className="px-2.5 py-1 rounded-full bg-[#96171B] text-white text-[11px] font-bold">Aktif Dinilai</span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Pemilihan Anggota Tim */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider block">
                  2. Pilih Kru yang Bertugas di {selectedTimStation} ({selectedTimKruIds.length} Terpilih):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = candidateKrus.map(k => k.id);
                      setSelectedTimKruIds(allIds);
                    }}
                    className="text-[11px] text-[#96171B] font-semibold hover:underline cursor-pointer"
                  >
                    Pilih Semua
                  </button>
                  <span className="text-stone-300">•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTimKruIds([])}
                    className="text-[11px] text-gray-500 hover:underline cursor-pointer"
                  >
                    Kosongkan
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-[#E6E1DA] rounded-xl bg-[#FAF8F5]">
                {candidateKrus.map((kru) => {
                  const isChecked = selectedTimKruIds.includes(kru.id);
                  return (
                    <label
                      key={kru.id}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-[#96171B] bg-white font-bold text-[#181411]'
                          : 'border-transparent hover:bg-white text-[#645D55]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTimKruIds(p => [...p, kru.id]);
                          } else {
                            setSelectedTimKruIds(p => p.filter(id => id !== kru.id));
                          }
                        }}
                        className="w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                      />
                      <span className="truncate">{kru.nama_kru}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 3. Ceklis Evaluasi Kerjasama Tim Stasiun */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider block">
                3. Ceklis Observasi Operasional Tim:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                  <input
                    type="checkbox"
                    checked={timCeklis.ritme_tanpa_bottleneck}
                    onChange={(e) => setTimCeklis(p => ({ ...p, ritme_tanpa_bottleneck: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                  />
                  <div>
                    <span className="font-bold text-[#181411] block">Ritme Kerja Mengalir Tanpa Bottleneck</span>
                    <span className="text-[#645D55] text-[10.5px]">Tidak ada penumpukan antrean masakan atau pesanan mandek di stasiun.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                  <input
                    type="checkbox"
                    checked={timCeklis.komunikasi_vokal_lancar}
                    onChange={(e) => setTimCeklis(p => ({ ...p, komunikasi_vokal_lancar: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                  />
                  <div>
                    <span className="font-bold text-[#181411] block">Respon Vokal Jelas ("Yes Chef" / "Siap")</span>
                    <span className="text-[#645D55] text-[10.5px]">Komunikasi antar kru terdengar jelas saat order masuk dan peringatan bahaya panas.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                  <input
                    type="checkbox"
                    checked={timCeklis.meja_alat_bersih_5s}
                    onChange={(e) => setTimCeklis(p => ({ ...p, meja_alat_bersih_5s: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                  />
                  <div>
                    <span className="font-bold text-[#181411] block">Kebersihan 5S & Sanitasi Bersama</span>
                    <span className="text-[#645D55] text-[10.5px]">Meja stainless segera dilap setelah proses selesai dan ceceran minyak/tepung diseka.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                  <input
                    type="checkbox"
                    checked={timCeklis.alat_kembali_ke_tempat}
                    onChange={(e) => setTimCeklis(p => ({ ...p, alat_kembali_ke_tempat: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                  />
                  <div>
                    <span className="font-bold text-[#181411] block">Disiplin Tata Letak Peralatan</span>
                    <span className="text-[#645D55] text-[10.5px]">Penjepit, solet, cobek, dan baskom diletakkan kembali pada posisi semula.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                  <input
                    type="checkbox"
                    checked={timCeklis.zero_kontaminasi_silang}
                    onChange={(e) => setTimCeklis(p => ({ ...p, zero_kontaminasi_silang: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                  />
                  <div>
                    <span className="font-bold text-[#181411] block">Pencegahan Kontaminasi Silang</span>
                    <span className="text-[#645D55] text-[10.5px]">Tidak ada percampuran wadah ayam mentah dengan wadah saji matang.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] cursor-pointer hover:border-neutral-400">
                  <input
                    type="checkbox"
                    checked={timCeklis.handover_produk_mulus}
                    onChange={(e) => setTimCeklis(p => ({ ...p, handover_produk_mulus: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                  />
                  <div>
                    <span className="font-bold text-[#181411] block">Handover Produk Antar Stasiun Mulus</span>
                    <span className="text-[#645D55] text-[10.5px]">Serah terima ayam dari warmer ke stasiun geprek & packing teratur dan aman.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] cursor-pointer hover:border-neutral-400 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={timCeklis.disiplin_fifo_holding}
                    onChange={(e) => setTimCeklis(p => ({ ...p, disiplin_fifo_holding: e.target.checked }))}
                    className="mt-0.5 w-4 h-4 rounded text-[#96171B] accent-[#96171B]"
                  />
                  <div>
                    <span className="font-bold text-[#181411] block">Kepatuhan FIFO & Holding Time Makanan</span>
                    <span className="text-[#645D55] text-[10.5px]">Ayam goreng pertama disajikan lebih dulu (FIFO) dan holding warmer maksimal terpantau.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 4. Rubrik Objektif Level Perilaku Kerja Tim Stasiun */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider block">
                    4. Rubrik Objektif Level Perilaku Tim ({selectedTimStation}):
                  </label>
                  <p className="text-xs text-[#645D55]">
                    Pilih level perilaku kerja konkret (Level 1–4) per dimensi untuk penetapan skor objektif terstandar.
                  </p>
                </div>
                <span className="text-[11px] text-stone-500 italic">
                  *Klik level perilaku untuk set skor otomatis, atau geser slider untuk fine-tuning
                </span>
              </div>

              <div className="space-y-4">
                {[
                  {
                    id: 'ritme',
                    title: '1. Ritme & Flow Kerja Bersama',
                    bobot: '25%',
                    score: timScoreRitme,
                    setScore: setTimScoreRitme,
                    levels: [
                      { lvl: 4, val: 95, label: 'Level 4 (95)', tag: 'Sangat Mandiri', desc: 'Flow lancar tanpa jeda, serah terima cepat, proaktif saling back-up tanpa menunggu instruksi.' },
                      { lvl: 3, val: 85, label: 'Level 3 (85)', tag: 'Standar SOP', desc: 'Ritme stabil sesuai target SOP, jeda kerja wajar, urutan tugas berjalan tertib.' },
                      { lvl: 2, val: 70, label: 'Level 2 (70)', tag: 'Perlu Arahan', desc: 'Terjadi hambatan/antrean mandek di proses tertentu, kru canggung membagi beban tugas.' },
                      { lvl: 1, val: 50, label: 'Level 1 (50)', tag: 'Kritis / Kurang', desc: 'Penumpukan parah, proses terhenti total, kru kebingungan menentukan prioritas alur.' },
                    ]
                  },
                  {
                    id: 'komunikasi',
                    title: '2. Respon & Komunikasi Vokal',
                    bobot: '25%',
                    score: timScoreKomunikasi,
                    setScore: setTimScoreKomunikasi,
                    levels: [
                      { lvl: 4, val: 95, label: 'Level 4 (95)', tag: 'Sangat Mandiri', desc: 'Callout order & peringatan bahaya panas lantang jelas, selalu ada feedback tegas ("Yes Chef" / "Siap").' },
                      { lvl: 3, val: 85, label: 'Level 3 (85)', tag: 'Standar SOP', desc: 'Komunikasi vokal hadir teratur pada serah terima order dan info keselamatan kerja.' },
                      { lvl: 2, val: 70, label: 'Level 2 (70)', tag: 'Perlu Arahan', desc: 'Suara pelan/ragu, sering lupa membalas callout rekan, koordinasi saat rush terlambat.' },
                      { lvl: 1, val: 50, label: 'Level 1 (50)', tag: 'Kritis / Kurang', desc: 'Hening pasif, tidak ada komunikasi antar kru, memicu salah pesanan dan bahaya kerja.' },
                    ]
                  },
                  {
                    id: 'kebersihan',
                    title: '3. Kebersihan 5S & Sanitasi Bersama',
                    bobot: '20%',
                    score: timScoreKebersihan,
                    setScore: setTimScoreKebersihan,
                    levels: [
                      { lvl: 4, val: 95, label: 'Level 4 (95)', tag: 'Sangat Mandiri', desc: '"Clean as you go" sempurna, meja stainless & alat diseka seketika pasca pakai, lantai bebas minyak.' },
                      { lvl: 3, val: 85, label: 'Level 3 (85)', tag: 'Standar SOP', desc: 'Meja & peralatan dibersihkan berkala setiap selesai tahapan, sanitasi terjaga rapi.' },
                      { lvl: 2, val: 70, label: 'Level 2 (70)', tag: 'Perlu Arahan', desc: 'Ceceran minyak/tepung dibiarkan sampai ditegur trainer baru mulai dibersihkan.' },
                      { lvl: 1, val: 50, label: 'Level 1 (50)', tag: 'Kritis / Kurang', desc: 'Area kerja kotor dan licin, melanggar higiene sanitasi makanan di stasiun.' },
                    ]
                  },
                  {
                    id: 'sop',
                    title: '4. Kepatuhan Standar SOP Bersama',
                    bobot: '15%',
                    score: timScoreSOP,
                    setScore: setTimScoreSOP,
                    levels: [
                      { lvl: 4, val: 95, label: 'Level 4 (95)', tag: 'Sangat Mandiri', desc: 'Seluruh kru di stasiun disiplin mematuhi titik kritis SOP (suhu, gramatur, resting) tanpa deviasi.' },
                      { lvl: 3, val: 85, label: 'Level 3 (85)', tag: 'Standar SOP', desc: 'Eksekusi SOP sesuai prosedur baku, takaran bumbu & urutan kerja dikerjakan benar.' },
                      { lvl: 2, val: 70, label: 'Level 2 (70)', tag: 'Perlu Arahan', desc: 'Ada langkah minor yang dilompati atau tidak terstandar saat operasional berlangsung.' },
                      { lvl: 1, val: 50, label: 'Level 1 (50)', tag: 'Kritis / Kurang', desc: 'Pelanggaran titik kritis SOP yang berisiko merusak kualitas produk atau keselamatan.' },
                    ]
                  },
                  {
                    id: 'handover',
                    title: '5. Handover Produk & Estafet Antar Kru',
                    bobot: '15%',
                    score: timScoreHandover,
                    setScore: setTimScoreHandover,
                    levels: [
                      { lvl: 4, val: 95, label: 'Level 4 (95)', tag: 'Sangat Mandiri', desc: 'Serah terima produk dari penggorengan / peracikan ke packaging sangat mulus, rapi, dan cepat.' },
                      { lvl: 3, val: 85, label: 'Level 3 (85)', tag: 'Standar SOP', desc: 'Handover teratur sesuai urutan nomor order pelanggan dan disiplin FIFO.' },
                      { lvl: 2, val: 70, label: 'Level 2 (70)', tag: 'Perlu Arahan', desc: 'Sering salah ambil porsi atau produk tertukar saat serah terima antar kru.' },
                      { lvl: 1, val: 50, label: 'Level 1 (50)', tag: 'Kritis / Kurang', desc: 'Estafet kacau, produk jatuh/rusak saat dioper, kemasan penyok, atau FIFO diabaikan.' },
                    ]
                  }
                ].map((dim) => {
                  const activeLevel = dim.levels.find(l => {
                    if (l.lvl === 4 && dim.score >= 90) return true;
                    if (l.lvl === 3 && dim.score >= 80 && dim.score < 90) return true;
                    if (l.lvl === 2 && dim.score >= 65 && dim.score < 80) return true;
                    if (l.lvl === 1 && dim.score < 65) return true;
                    return false;
                  }) || dim.levels[1];

                  return (
                    <div key={dim.id} className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#181411]">{dim.title}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                            Bobot: {dim.bobot}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            dim.score >= 85 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            dim.score >= 75 ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                            'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {activeLevel.tag}
                          </span>
                          <span className="font-mono font-black text-base text-[#96171B] w-9 text-right">
                            {dim.score}
                          </span>
                        </div>
                      </div>

                      {/* Level Rubric Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        {dim.levels.map((lvl) => {
                          const isLevelActive = activeLevel.lvl === lvl.lvl;
                          return (
                            <button
                              key={lvl.lvl}
                              type="button"
                              onClick={() => dim.setScore(lvl.val)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                                isLevelActive
                                  ? 'bg-white border-[#96171B] shadow-2xs ring-2 ring-[#96171B]/20'
                                  : 'bg-white/70 border-[#E6E1DA] hover:bg-white hover:border-neutral-400'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className={`text-[11px] font-extrabold ${isLevelActive ? 'text-[#96171B]' : 'text-[#181411]'}`}>
                                  {lvl.label}
                                </span>
                                <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold ${
                                  lvl.lvl === 4 ? 'bg-emerald-50 text-emerald-700' :
                                  lvl.lvl === 3 ? 'bg-blue-50 text-blue-700' :
                                  lvl.lvl === 2 ? 'bg-amber-50 text-amber-700' :
                                  'bg-rose-50 text-rose-700'
                                }`}>
                                  {lvl.tag}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-[#645D55] leading-relaxed">
                                {lvl.desc}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      {/* Fine-Tuning Slider Bar */}
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[10px] text-stone-400 font-bold uppercase shrink-0">Fine-Tune Nilai:</span>
                        <input
                          type="range"
                          min={50}
                          max={100}
                          value={dim.score}
                          onChange={(e) => dim.setScore(Number(e.target.value))}
                          className="w-full accent-[#96171B] cursor-pointer"
                        />
                        <span className="font-mono text-xs font-bold text-[#181411] shrink-0 w-8 text-right">
                          {dim.score}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Catatan Evaluasi & Tombol Simpan */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-bold text-[#645D55] uppercase text-[10.5px] mb-1">
                  Catatan Evaluasi Kerja Sama Tim Pelatih:
                </label>
                <textarea
                  rows={2}
                  value={timCatatan}
                  onChange={(e) => setTimCatatan(e.target.value)}
                  placeholder="Contoh: Kerja sama Station 1 sangat solid, koordinasi dropping ayam serempak, perlu peningkatan komunikasi stok tepung..."
                  className="w-full p-2.5 rounded-xl border border-[#E6E1DA] text-xs bg-white focus:outline-none focus:border-[#96171B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleSavePenilaianTim}
                  className="px-5 py-2.5 rounded-xl bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Save size={15} />
                  <span>Simpan Penilaian Tim ({timScoreTotal} Poin)</span>
                </button>
              </div>
            </div>
          </div>

          {/* TABEL RIWAYAT PENILAIAN TIM STASIUN */}
          <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1DA] pb-3">
              <div>
                <h4 className="font-bold text-sm text-[#181411] flex items-center gap-2">
                  <Users size={16} className="text-[#96171B]" />
                  <span>Riwayat Penilaian Tim Stasiun ({timList.length} Catatan)</span>
                </h4>
                <p className="text-xs text-[#645D55]">Rekam jejak evaluasi kolaborasi tim Station 1 & Station 2 di Kantor Lempongsari</p>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#E6E1DA] rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] font-bold text-[#645D55] uppercase text-[10px] border-b border-[#E6E1DA]">
                  <tr>
                    <th className="p-3">Tanggal & Stasiun</th>
                    <th className="p-3">Anggota Tim Terlibat</th>
                    <th className="p-3 text-center">Ritme (25)</th>
                    <th className="p-3 text-center">Komunikasi (25)</th>
                    <th className="p-3 text-center">5S (20)</th>
                    <th className="p-3 text-center">SOP (15)</th>
                    <th className="p-3 text-center">Handover (15)</th>
                    <th className="p-3 text-center">Skor Total</th>
                    <th className="p-3">Catatan & Penilai</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1DA]">
                  {timList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-4 text-center text-gray-500 italic">
                        Belum ada data evaluasi kerja sama tim stasiun yang tersimpan.
                      </td>
                    </tr>
                  ) : (
                    timList.map((item) => (
                      <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-3">
                          <span className="font-bold text-[#181411] block">{item.tanggal}</span>
                          <span className="text-[10px] text-[#96171B] font-bold">{item.stasiun}</span>
                        </td>
                        <td className="p-3 max-w-xs font-semibold text-[#181411]">
                          <span className="block font-bold truncate">
                            {item.anggota_kru_nama?.join(', ') || 'Tim Kru'}
                          </span>
                          <span className="text-[10px] text-[#645D55]">
                            {item.batch_name || 'Kantor Lempongsari'}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-stone-700">
                          {item.skor_ritme_kecepatan}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-stone-700">
                          {item.skor_komunikasi_koordinasi}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-stone-700">
                          {item.skor_kebersihan_sanitasi}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-stone-700">
                          {item.skor_kepatuhan_sop}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-stone-700">
                          {item.skor_handover_estafet}
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-mono font-black text-sm text-[#96171B] block">
                            {item.skor_total}
                          </span>
                          <span className="text-[9.5px] font-bold text-emerald-700">
                            {item.predikat}
                          </span>
                        </td>
                        <td className="p-3 text-[#645D55] max-w-xs">
                          <p className="truncate">{item.catatan_trainer}</p>
                          <span className="text-[10px] opacity-70">Penilai: {item.penilai_nama}</span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeletePenilaianTim(item.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus penilaian tim"
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
      {/* ===================================================================
          SUB-TAB: ANALITIK KINERJA ONBOARDING PER OUTLET PENEMPATAN
          TC: Kantor Lempongsari • Evaluasi 12 Kru ke 12 Outlet Penempatan
          =================================================================== */}
      {activeSubTab === 'analitik_outlet' && (() => {
        // Ambil kandidat secara dinamis berdasarkan batch yang aktif (atau candidateKrus)
        const candidatesToAnalyze = candidateKrus.length > 0
          ? candidateKrus.map(c => {
              const realOutlet = resolveRealOutletName((c as any).outlet_penempatan || c.kode_outlet || 'Kantor Lempongsari');
              return {
                id: c.id,
                nama: c.nama_kru,
                outlet: realOutlet === 'Kantor Lempongsari' && (c as any).outlet_penempatan ? resolveRealOutletName((c as any).outlet_penempatan) : realOutlet,
                defaultTeknis: 85,
                default5S: 88,
                defaultTim: 86
              };
            })
          : [
              { id: 'kru-ob-1101', nama: 'Achmad Luthfi Khakim', outlet: 'Kertek', defaultTeknis: 86, default5S: 88, defaultTim: 86 },
              { id: 'kru-ob-1102', nama: 'Maulida Mega', outlet: 'Borobudur', defaultTeknis: 88, default5S: 90, defaultTim: 88 },
              { id: 'kru-ob-1103', nama: 'Lulu Hidayati', outlet: 'RSI', defaultTeknis: 85, default5S: 88, defaultTim: 86 },
              { id: 'kru-ob-1104', nama: 'Muhammad Kelvin Febrianto', outlet: 'RSI', defaultTeknis: 85, default5S: 88, defaultTim: 86 },
              { id: 'kru-ob-1105', nama: 'Anisyatul Azizah', outlet: 'Magelang Tidar', defaultTeknis: 87, default5S: 90, defaultTim: 88 },
              { id: 'kru-ob-1106', nama: 'Elva Rahmawati', outlet: 'Jakal 13', defaultTeknis: 84, default5S: 86, defaultTim: 85 },
              { id: 'kru-ob-1107', nama: 'Difa Safitri', outlet: 'Mobile Outlet', defaultTeknis: 88, default5S: 90, defaultTim: 90 },
              { id: 'kru-ob-1108', nama: 'Hilda Nur Mafitiyas', outlet: 'Jl Wonosari', defaultTeknis: 86, default5S: 88, defaultTim: 86 },
              { id: 'kru-ob-1109', nama: 'Arifatul Kurniasih New', outlet: 'Jl Parangtritis', defaultTeknis: 85, default5S: 87, defaultTim: 86 },
              { id: 'kru-ob-1110', nama: 'Reval Arfinza Putra New', outlet: 'Jl Parangtritis', defaultTeknis: 86, default5S: 88, defaultTim: 87 },
              { id: 'kru-ob-1111', nama: 'Iqfantri Mae Dinar', outlet: 'Event : Jl Parangtritis', defaultTeknis: 88, default5S: 89, defaultTim: 88 },
              { id: 'kru-ob-1112', nama: 'Farelyno Mahesa Nugroho New', outlet: 'Mobile Outlet', defaultTeknis: 85, default5S: 88, defaultTim: 86 },
              { id: 'kru-ob-1113', nama: 'Imron Irsyadi New', outlet: 'Ronggolawe', defaultTeknis: 87, default5S: 89, defaultTim: 88 },
              { id: 'kru-ob-1114', nama: 'Teadora Mayca Syilvina Sebastian New', outlet: 'Mobile Outlet', defaultTeknis: 86, default5S: 88, defaultTim: 86 },
            ];

        // Hitung metrik riil dari historyList untuk setiap kandidat
        const outletRows = candidatesToAnalyze.map(c => {
          const cNameLower = c.nama.toLowerCase();
          const matched = historyList.filter(h => {
            const hName = (h.nama_kru || '').toLowerCase();
            return h.kru_id === c.id || hName.includes(cNameLower) || cNameLower.includes(hName);
          });

          const totalUji = matched.length;
          const avgTeknis = totalUji > 0
            ? Math.round(matched.reduce((acc, curr) => acc + (curr.skor_akhir || 0), 0) / totalUji)
            : c.defaultTeknis;

          const avg5S = totalUji > 0
            ? Math.round(matched.reduce((acc, curr) => acc + (curr.skor_kebersihan ?? curr.subskor_sikap ?? 88), 0) / totalUji)
            : c.default5S;

          const avgTim = totalUji > 0
            ? Math.round(matched.reduce((acc, curr) => acc + (curr.skor_kerjasama ?? 88), 0) / totalUji)
            : c.defaultTim;

          const sosPass = totalUji > 0
            ? matched.filter(m => m.durasi_detik <= m.target_sos_detik).length
            : 1;
          const sosPct = totalUji > 0 ? Math.round((sosPass / totalUji) * 100) : 88;

          const skorKomposit = Math.round((avgTeknis * 0.70) + (avg5S * 0.15) + (avgTim * 0.15));
          const isOke = skorKomposit >= 75;

          return {
            ...c,
            lokasiTC: 'Kantor Lempongsari',
            totalUji,
            avgTeknis,
            avg5S,
            avgTim,
            sosPct,
            skorKomposit,
            isOke,
            statusLabel: isOke ? 'OKE • SIAP OPERASIONAL' : 'KURANG • BUTUH SUPERVISI',
            rekomendasi: isOke
              ? (skorKomposit >= 85
                  ? 'Performa sangat baik (Grade A). SOP teknis, standar kebersihan 5S, dan ritme SOS telah memenuhi standar untuk langsung bertugas mandiri.'
                  : 'Lulus KKM standar (Grade B). Disarankan supervisi ringan 3 hari pertama pada saat peak rush hour.')
              : 'Skor komposit masih di bawah KKM 75. Butuh pendampingan intensif & review ulang SOP kritis sebelum bertugas tanpa trainer.'
          };
        });

        // Metrik Ringkasan
        const totalOutlet = outletRows.length;
        const totalOke = outletRows.filter(r => r.isOke).length;
        const totalKurang = totalOutlet - totalOke;
        const rataRataKomposit = Math.round(outletRows.reduce((acc, r) => acc + r.skorKomposit, 0) / (totalOutlet || 1));

        // Filter rows
        const filteredOutletRows = outletRows.filter(row => {
          if (outletFilterStatus === 'OK' && !row.isOke) return false;
          if (outletFilterStatus === 'NEED_SUPERVISION' && row.isOke) return false;
          if (outletSearchQuery.trim()) {
            const q = outletSearchQuery.toLowerCase();
            const matchOutlet = row.outlet.toLowerCase().includes(q);
            const matchNama = row.nama.toLowerCase().includes(q);
            const matchStatus = row.statusLabel.toLowerCase().includes(q);
            if (!matchOutlet && !matchNama && !matchStatus) return false;
          }
          return true;
        });

        // Handler Ekspor CSV
        const handleExportAnalitikCSV = () => {
          const headers = [
            'No',
            'Nama Kru Onboarding',
            'Lokasi Pelatihan (TC)',
            'Outlet Penempatan',
            'Total Uji SOP',
            'Rata-rata Skor Teknis SOP',
            'Rata-rata Skor Kebersihan 5S',
            'Rata-rata Skor Kerjasama Tim',
            'Kepatuhan Waktu SOS (%)',
            'Skor Komposit Akhir (KKM 75)',
            'Status Kesiapan Outlet',
            'Catatan Rekomendasi Supervisi'
          ];

          const rows = outletRows.map((r, idx) => [
            idx + 1,
            `"${r.nama}"`,
            `"${r.lokasiTC}"`,
            `"${r.outlet}"`,
            r.totalUji,
            r.avgTeknis,
            r.avg5S,
            r.avgTim,
            `"${r.sosPct}%"`,
            r.skorKomposit,
            `"${r.statusLabel}"`,
            `"${r.rekomendasi.replace(/"/g, '""')}"`
          ]);

          const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `analitik_onboarding_outlet_penempatan_${new Date().toISOString().split('T')[0]}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          showToast('File analitik outlet penempatan berhasil diekspor!');
        };

        const handleStartAssessmentForCandidate = (cand: typeof candidatesToAnalyze[0]) => {
          const existingSession = sessions.find(s => s.kruId === cand.id || s.namaKru.toLowerCase().includes(cand.nama.toLowerCase()));
          if (existingSession) {
            setActiveTabId(existingSession.id);
          } else {
            const foundKru = candidateKrus.find(k => k.id === cand.id) || kruList.find(k => k.id === cand.id) || {
              id: cand.id,
              nama_kru: cand.nama,
              kode_outlet: 'Kantor Lempongsari',
              outlet_penempatan: cand.outlet,
              lokasi_tc: 'Kantor Lempongsari',
              divisi: 'Kitchen' as Division
            };
            const newSess = createNewSession(foundKru as Kru);
            setSessions(prev => [...prev, newSess]);
            setActiveTabId(newSess.id);
          }
          setActiveSubTab('produk');
          showToast(`Membuka form penilaian praktik untuk ${cand.nama} (Penempatan: ${cand.outlet}).`);
        };

        return (
          <div className="w-full space-y-5">
            {/* Header Card */}
            <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E1DA] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-[#96171B] border border-rose-200">
                      Training Center (TC): Kantor Lempongsari
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      KKM Kelulusan: 75.0 Poin
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#181411] tracking-tight">
                    Analitik Kinerja Onboarding per Outlet Penempatan
                  </h3>
                  <p className="text-xs text-[#645D55] mt-1 leading-relaxed max-w-3xl">
                    Pemetaan kesiapan <strong>{totalOutlet} kru onboarding</strong> yang sedang menjalani pelatihan di <strong>Kantor Lempongsari</strong> untuk penempatan riil ke outlet HARA Chicken ({selectedBatchId === 'ALL' ? 'Semua Batch' : (batches.find(b => b.id === selectedBatchId)?.nama_batch || 'Batch 3-4 November 2026')}). Sistem mendeteksi otomatis outlet mana yang kru-nya sudah <strong>Oke (Siap Operasional)</strong> dan mana yang masih <strong>Kurang (Butuh Supervisi)</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleExportAnalitikCSV}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E6E1DA] text-[#181411] text-xs font-bold flex items-center gap-2 shadow-2xs hover:border-[#96171B] transition-colors cursor-pointer"
                  >
                    <Download size={15} className="text-[#96171B]" />
                    <span>Ekspor Analitik CSV / Excel</span>
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider">Total Outlet Penempatan</span>
                    <Building2 size={16} className="text-[#645D55]" />
                  </div>
                  <span className="text-2xl font-black text-[#181411] font-mono mt-1 block">12</span>
                  <span className="text-[11px] text-[#645D55]">Lokasi TC: Kantor Lempongsari</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Outlet Siap Operasional</span>
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <span className="text-2xl font-black text-emerald-900 font-mono mt-1 block">
                    {totalOke} <span className="text-xs font-normal text-emerald-700">({Math.round((totalOke / totalOutlet) * 100)}%)</span>
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Status OKE • Nilai ≥ 75</span>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Outlet Butuh Supervisi</span>
                    <AlertTriangle size={16} className="text-rose-600" />
                  </div>
                  <span className="text-2xl font-black text-rose-900 font-mono mt-1 block">
                    {totalKurang} <span className="text-xs font-normal text-rose-700">({Math.round((totalKurang / totalOutlet) * 100)}%)</span>
                  </span>
                  <span className="text-[11px] text-rose-700 font-semibold">Status KURANG • Nilai &lt; 75</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Rata-rata Komposit</span>
                    <Award size={16} className="text-amber-600" />
                  </div>
                  <span className="text-2xl font-black text-amber-950 font-mono mt-1 block">
                    {rataRataKomposit} <span className="text-xs font-normal text-amber-800">/ 100</span>
                  </span>
                  <span className="text-[11px] text-amber-800">Teknis 70% + 5S 15% + Tim 15%</span>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-3 text-neutral-400" />
                  <input
                    type="text"
                    value={outletSearchQuery}
                    onChange={(e) => setOutletSearchQuery(e.target.value)}
                    placeholder="Cari outlet penempatan, nama kru, atau status..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E6E1DA] rounded-xl text-xs font-medium focus:outline-none focus:border-[#96171B] focus:bg-white transition-all"
                  />
                  {outletSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setOutletSearchQuery('')}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 text-xs"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setOutletFilterStatus('ALL')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      outletFilterStatus === 'ALL'
                        ? 'bg-[#181411] text-white shadow-2xs'
                        : 'bg-[#FAF8F5] text-[#645D55] hover:bg-neutral-200'
                    }`}
                  >
                    Semua ({totalOutlet})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutletFilterStatus('OK')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      outletFilterStatus === 'OK'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    <span>Siap Operasional ({totalOke})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutletFilterStatus('NEED_SUPERVISION')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      outletFilterStatus === 'NEED_SUPERVISION'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <AlertTriangle size={13} />
                    <span>Butuh Supervisi ({totalKurang})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List / Grid of 12 Outlets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredOutletRows.map((row) => (
                <div
                  key={row.id}
                  className={`p-5 rounded-2xl bg-white border transition-all shadow-xs flex flex-col justify-between gap-4 ${
                    row.isOke
                      ? 'border-[#E6E1DA] hover:border-emerald-400'
                      : 'border-rose-300 bg-rose-50/20 hover:border-rose-400'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Row: Outlet & Status Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide bg-[#181411] text-white">
                            {row.outlet}
                          </span>
                          <span className="text-[10px] text-[#645D55] font-mono">
                            NIK: {row.id}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-[#181411] mt-1.5 flex items-center gap-2">
                          <span>{row.nama}</span>
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#645D55] mt-0.5">
                          <span className="font-semibold text-[#96171B]">Pelatihan TC:</span>
                          <span>{row.lokasiTC}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black tracking-wide border shadow-2xs ${
                            row.isOke
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {row.isOke ? <CheckCircle2 size={14} className="text-emerald-600" /> : <AlertTriangle size={14} className="text-rose-600" />}
                          <span>{row.isOke ? 'OKE / SIAP' : 'KURANG / SUPERVISI'}</span>
                        </span>
                        <div className="text-[10px] text-[#645D55] font-mono mt-1">
                          Skor: <strong className="text-[#181411] text-xs font-black">{row.skorKomposit}</strong> / 100
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Score Pills */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E6E1DA]">
                      <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                        <span className="text-[10px] font-bold text-[#645D55] uppercase block">Teknis SOP (70%)</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-base font-black text-[#181411] font-mono">{row.avgTeknis}</span>
                          <span className="text-[10px] text-[#645D55]">{row.totalUji} menu</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                        <span className="text-[10px] font-bold text-[#645D55] uppercase block">5S Grooming (15%)</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-base font-black text-[#181411] font-mono">{row.avg5S}</span>
                          <span className="text-[10px] text-emerald-700 font-semibold">Standar</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                        <span className="text-[10px] font-bold text-[#645D55] uppercase block">Kerjasama Tim (15%)</span>
                        <div className="flex items-baseline justify-between mt-1">
                          <span className="text-base font-black text-[#181411] font-mono">{row.avgTim}</span>
                          <span className="text-[10px] text-blue-700 font-semibold">Solid</span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation / Observation Notes */}
                    <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] text-xs">
                      <span className="text-[10px] font-bold text-[#96171B] uppercase tracking-wider block mb-0.5">
                        Analisis & Rekomendasi Supervisi:
                      </span>
                      <p className="text-[#181411] leading-relaxed text-[11px]">
                        {row.rekomendasi}
                      </p>
                    </div>
                  </div>

                  {/* Action Button: Jump to Practice Assessment */}
                  <div className="pt-2 border-t border-[#E6E1DA] flex items-center justify-between">
                    <span className="text-[10px] text-[#645D55] font-mono">
                      SOS Compliance: <strong>{row.sosPct}%</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleStartAssessmentForCandidate(row)}
                      className="px-3.5 py-2 rounded-xl bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <UtensilsCrossed size={13} />
                      <span>Buka Form Penilaian Kru</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredOutletRows.length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-white border border-[#E6E1DA] text-[#645D55]">
                <Store size={36} className="mx-auto mb-2 opacity-40 text-[#96171B]" />
                <p className="text-sm font-bold text-[#181411]">Tidak ada outlet atau kru yang cocok</p>
                <p className="text-xs text-[#645D55] mt-1">Coba ubah filter status atau kata kunci pencarian</p>
              </div>
            )}
          </div>
        );
      })()}


      {/* ===================================================================
          MODAL UNIFIKASI: PILIH & ATUR MENU SOP PRAKTIK
          =================================================================== */}
      {isProductPickerOpen && activeSession && (() => {
        const queue = activeSession.productQueue && activeSession.productQueue.length > 0
          ? activeSession.productQueue
          : [activeSession.productNama];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col text-[#181411] animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
              {/* Modal Header */}
              <div className="px-5 py-3.5 border-b border-[#E6E1DA] flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#96171B] flex items-center justify-center border border-rose-100">
                    <UtensilsCrossed size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-[#181411]">Pilih & Atur Menu SOP Praktik</h3>
                    <p className="text-[11px] text-[#645D55]">
                      Peserta: <strong className="text-[#181411]">{activeSession.namaKru}</strong> • Penempatan: <strong className="text-[#181411]">{resolveRealOutletName(activeSession.outletCode)}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProductPickerOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* SECTION 1: ANTREAN MENU AKTIF (URUTAN LIST) */}
              <div className="p-3.5 border-b border-[#E6E1DA] bg-[#FAF8F5] shrink-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={13} className="text-[#96171B]" />
                    <span>Daftar Menu yang Sedang Diujikan ({queue.length} Menu):</span>
                  </span>
                  <span className="text-[10px] text-[#645D55]">Klik menu untuk beralih aktif</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {queue.map((item, idx) => {
                    const isCurrent = item === activeSession.productNama;
                    const completedRecord = (activeSession.completedProducts || []).find(cp => cp.productNama === item);
                    const isDone = !!completedRecord;

                    return (
                      <div
                        key={`${item}-${idx}`}
                        className={`shrink-0 pl-2 pr-1.5 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isCurrent
                            ? 'bg-[#96171B] text-white border-[#96171B] shadow-2xs'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-white text-[#181411] border-[#E6E1DA] hover:border-neutral-400'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => switchSessionProduct(item, idx)}
                          className="flex items-center gap-1.5 cursor-pointer text-left"
                        >
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono ${
                            isCurrent ? 'bg-white/20 text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-neutral-200 text-neutral-700'
                          }`}>
                            {isDone ? '✓' : idx + 1}
                          </span>
                          <span className="truncate max-w-[160px] font-bold">{item}</span>
                          {isCurrent && (
                            <span className="text-[9px] bg-white/20 px-1 py-0.2 rounded font-normal">Aktif</span>
                          )}
                        </button>

                        {queue.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveProductFromQueue(idx, e)}
                            className={`p-1 rounded-md transition-all cursor-pointer ${
                              isCurrent
                                ? 'hover:bg-white/20 text-white/90'
                                : 'hover:bg-rose-50 text-neutral-400 hover:text-rose-600'
                            }`}
                            title={`Hapus "${item}" dari antrean`}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: SEARCH & FILTER SOP BANK */}
              <div className="p-3 border-b border-[#E6E1DA] bg-white space-y-2 shrink-0">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Ketik nama SOP produk (misal: Nasi, Crispy, Sambal, Esteh)..."
                    className="w-full pl-8 pr-8 py-2 bg-[#FAF8F5] rounded-lg border border-[#E6E1DA] text-xs font-medium focus:outline-none focus:border-[#96171B] focus:bg-white transition-all"
                    autoFocus
                  />
                  {productSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setProductSearchQuery('')}
                      className="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-700 text-xs cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Station Filter Pills */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-xs">
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPickerStationFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        pickerStationFilter === 'ALL'
                          ? 'bg-[#181411] text-white shadow-2xs'
                          : 'bg-[#FAF8F5] text-[#645D55] hover:bg-neutral-200'
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerStationFilter('Station 1')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        pickerStationFilter === 'Station 1'
                          ? 'bg-[#96171B] text-white shadow-2xs'
                          : 'bg-[#FAF8F5] text-[#645D55] hover:bg-neutral-200'
                      }`}
                    >
                      Stasiun 1 (Nasi & Minum)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerStationFilter('Station 2')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        pickerStationFilter === 'Station 2'
                          ? 'bg-[#96171B] text-white shadow-2xs'
                          : 'bg-[#FAF8F5] text-[#645D55] hover:bg-neutral-200'
                      }`}
                    >
                      Stasiun 2 (Fryer & Ayam)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickerStationFilter('Station 3')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        pickerStationFilter === 'Station 3'
                          ? 'bg-[#96171B] text-white shadow-2xs'
                          : 'bg-[#FAF8F5] text-[#645D55] hover:bg-neutral-200'
                      }`}
                    >
                      Stasiun 3 (Sambal & Pack)
                    </button>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <select
                      value={pickerDayFilter}
                      onChange={(e) => setPickerDayFilter(e.target.value as any)}
                      className="px-2 py-1 bg-[#FAF8F5] border border-[#E6E1DA] rounded-lg text-[11px] font-semibold text-[#181411] focus:outline-none"
                    >
                      <option value="ALL">Semua Hari</option>
                      <option value="Day 1">Day 1</option>
                      <option value="Day 2">Day 2</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Compact Scannable List */}
              <div className="overflow-y-auto max-h-[50vh] divide-y divide-[#E6E1DA]">
                {filteredModalProducts.length === 0 ? (
                  <div className="text-center py-10 text-[#645D55]">
                    <UtensilsCrossed size={28} className="mx-auto mb-2 opacity-30 text-[#96171B]" />
                    <p className="text-xs font-bold">Produk SOP tidak ditemukan</p>
                    <p className="text-[11px] mt-0.5">Silakan ganti kata kunci atau filter stasiun</p>
                  </div>
                ) : (
                  filteredModalProducts.map(prod => {
                    const isSelected = activeSession.productNama === prod.nama;
                    const isInQueue = queue.includes(prod.nama);

                    return (
                      <div
                        key={prod.id}
                        className={`px-4 py-2.5 transition-colors flex items-center justify-between gap-3 hover:bg-neutral-50 ${
                          isSelected ? 'bg-rose-50/70 border-l-4 border-l-[#96171B]' : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                          <span className="px-2 py-1 rounded-md text-[10px] font-bold font-mono bg-stone-100 text-stone-800 border border-stone-200 shrink-0 mt-0.5">
                            {prod.station.replace('Station ', 'ST-')}
                          </span>

                          <div className="flex-1 min-w-0">
                            {/* Baris 1: NAMA PRODUK JELAS, TEBAL, TIDAK TERPOTONG */}
                            <div className="font-black text-sm sm:text-base text-[#181411] leading-snug break-words">
                              {prod.nama || (prod as any).judul_sop || (prod as any).produk_nama || (prod as any).judul || prod.kode || 'Produk Standar SOP'}
                            </div>

                            {/* Baris 2: KODE PRODUK, STATUS BADGE, & INFORMASI SOP */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-[10px] text-[#645D55] font-mono font-bold bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                                {prod.kode || (prod as any).kode_sop || ''}
                              </span>
                              {isSelected && (
                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-[#96171B] text-white">
                                  Sedang Aktif
                                </span>
                              )}
                              {isInQueue && !isSelected && (
                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-stone-200 text-stone-800">
                                  Di Antrean
                                </span>
                              )}
                              <span className="text-[10.5px] font-semibold text-amber-800">
                                {prod.day}
                              </span>
                              <span className="text-[10.5px] text-stone-400">•</span>
                              <span className="text-[10.5px] font-mono font-medium text-[#645D55]">
                                Target: {(prod.stdDetik / 60).toFixed(1)} mnt ({prod.stdDetik}s)
                              </span>
                              {prod.requiresOilTemp && (
                                <>
                                  <span className="text-[10.5px] text-stone-400">•</span>
                                  <span className="text-[10.5px] text-rose-700 font-semibold font-mono">
                                    Fryer {prod.targetSuhuMinyak}°C
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0 pl-1">
                          {!isInQueue && (
                            <button
                              type="button"
                              onClick={() => {
                                const newQueue = [...queue, prod.nama];
                                updateActiveSession({ productQueue: newQueue });
                                showToast(`"${prod.nama}" ditambahkan ke antrean.`);
                              }}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#FAF8F5] border border-[#E6E1DA] hover:border-neutral-400 text-[#181411] transition-all cursor-pointer whitespace-nowrap"
                              title="Tambahkan ke daftar antrean"
                            >
                              + Antrean
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              switchSessionProduct(prod.nama);
                              setIsProductPickerOpen(false);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-[#96171B] hover:bg-[#7D1216] text-white shadow-2xs'
                            }`}
                          >
                            {isSelected ? 'Sedang Diuji' : 'Jadikan Aktif'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer Summary */}
              <div className="px-4 py-2.5 border-t border-[#E6E1DA] bg-[#FAF8F5] flex items-center justify-between text-[11px] text-[#645D55] shrink-0">
                <span>{queue.length} menu siap diujikan • Menampilkan {filteredModalProducts.length} produk SOP</span>
                <button
                  type="button"
                  onClick={() => setIsProductPickerOpen(false)}
                  className="px-3 py-1 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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

      {/* ===================================================================
          MODAL: ATUR & TAMBAH ANTREAN MENU PRAKTIK KRU
          =================================================================== */}
      {isManageQueueOpen && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-2xl w-full overflow-hidden text-[#181411] animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#E6E1DA] flex items-center justify-between bg-stone-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#96171B] flex items-center justify-center border border-red-200">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#181411]">
                    Atur Antrean Menu Praktik Kru
                  </h3>
                  <p className="text-[11px] text-[#645D55]">
                    Peserta: <strong>{activeSession.namaKru}</strong> ({activeSession.outletCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManageQueueOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* CURRENT QUEUE */}
              <div>
                <label className="block font-bold text-[#645D55] uppercase text-[10.5px] mb-1.5">
                  1. Daftar Menu yang Sedang Ditugaskan (Urutan Pengerjaan):
                </label>
                {(() => {
                  const queue = activeSession.productQueue && activeSession.productQueue.length > 0
                    ? activeSession.productQueue
                    : [activeSession.productNama];

                  return (
                    <div className="space-y-1.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                      {queue.map((item, idx) => {
                        const isCurrent = idx === (activeSession.currentProductIndex || 0);
                        const isDone = (activeSession.completedProducts || []).some(cp => cp.productNama === item);

                        return (
                          <div
                            key={`${item}-${idx}`}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E6E1DA]"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                                isCurrent ? 'bg-[#96171B] text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                              }`}>
                                {isDone ? '✓' : idx + 1}
                              </span>
                              <span className="font-bold text-[#181411] truncate">{item}</span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-[#96171B] font-bold shrink-0">
                                  Sedang Diuji
                                </span>
                              )}
                              {isDone && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">
                                  Sudah Dinilai
                                </span>
                              )}
                            </div>

                            {queue.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => handleRemoveProductFromQueue(idx, e)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title={`Hapus "${item}" dari antrean`}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* ADD MORE PRODUCTS FROM MASTER LIST */}
              <div>
                <label className="block font-bold text-[#645D55] uppercase text-[10.5px] mb-1.5">
                  2. Tambah Menu Lain ke Antrean Praktik:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
                  {allAvailableProducts.map((p) => {
                    const queue = activeSession.productQueue && activeSession.productQueue.length > 0
                      ? activeSession.productQueue
                      : [activeSession.productNama];
                    const isInQueue = queue.includes(p.nama);

                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-[#E6E1DA] bg-white hover:border-neutral-400 text-xs transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-[#181411] block truncate">{p.nama}</span>
                          <span className="text-[10.5px] text-[#645D55] block truncate">
                            {p.day} • {p.stationLabel} • {Math.round(p.stdDetik / 60)} mnt
                          </span>
                        </div>

                        <button
                          type="button"
                          disabled={isInQueue}
                          onClick={() => {
                            const newQueue = [...queue, p.nama];
                            updateActiveSession({ productQueue: newQueue });
                            showToast(`Menu "${p.nama}" ditambahkan ke antrean praktik.`);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            isInQueue
                              ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                              : 'bg-red-50 hover:bg-red-100 text-[#96171B] border border-red-200'
                          }`}
                        >
                          {isInQueue ? 'Sudah Ada' : '+ Tambah'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E6E1DA] bg-stone-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#645D55]">
                {(activeSession.productQueue || [activeSession.productNama]).length} menu siap diujikan berurutan.
              </span>
              <button
                type="button"
                onClick={() => setIsManageQueueOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Selesai Mengatur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: TAUTAN & PENGATURAN GOOGLE SPREADSHEET (HARA TC)
          =================================================================== */}
      {isSheetLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col text-[#181411] animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#E6E1DA] flex items-center justify-between shrink-0 bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-[#181411]">
                    Tautan & Pengaturan Google Spreadsheet
                  </h3>
                  <p className="text-[11px] text-[#645D55]">
                    Pusat rekap data penilaian otomatis multi-perangkat HARA TC
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSheetLinkModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Card Link Dokumen Spreadsheet */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-[#181411] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileSpreadsheet size={14} className="text-emerald-700" />
                    <span>1. Link Dokumen Google Spreadsheet Anda:</span>
                  </label>
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10.5px] flex items-center gap-1 transition-colors shrink-0 w-fit"
                  >
                    <ExternalLink size={11} />
                    <span>Buat Sheet Baru di Drive (sheets.new)</span>
                  </a>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={sheetDocUrlInput}
                    onChange={(e) => setSheetDocUrlInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1.../edit"
                    className="flex-1 p-2.5 rounded-lg border border-[#E6E1DA] bg-white text-xs font-mono focus:outline-none focus:border-[#96171B]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      saveGoogleSheetDocUrl(sheetDocUrlInput.trim());
                      showToast('Tautan Google Spreadsheet berhasil disimpan!');
                    }}
                    className="px-4 py-2 bg-[#96171B] hover:bg-[#7D1216] text-white font-bold rounded-lg cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-[#645D55]">
                  <span>Tempel URL spreadsheet tempat data penilaian diarsipkan.</span>
                  {sheetDocUrlInput && (
                    <a
                      href={sheetDocUrlInput}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 font-extrabold flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      <span>Buka Dokumen Google Sheet Sekarang ↗</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Card Webhook Apps Script */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#181411] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-600" />
                    <span>2. URL Webhook Google Apps Script (Otomatisasi Simpan):</span>
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!sheetWebhookUrlInput.trim()) {
                        showToast('Harap masukkan URL Webhook terlebih dahulu.');
                        return;
                      }
                      setSheetModalTesting(true);
                      setSheetModalTestResult(null);
                      try {
                        const res = await testGoogleSheetWebhook(sheetWebhookUrlInput.trim());
                        setSheetModalTestResult(res);
                        showToast(res.message);
                      } catch (err: any) {
                        setSheetModalTestResult({ success: false, message: err.message || 'Koneksi gagal' });
                      } finally {
                        setSheetModalTesting(false);
                      }
                    }}
                    disabled={sheetModalTesting}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer disabled:opacity-50"
                  >
                    {sheetModalTesting ? 'Menguji...' : 'Uji Koneksi Webhook'}
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={sheetWebhookUrlInput}
                    onChange={(e) => setSheetWebhookUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 p-2.5 rounded-lg border border-[#E6E1DA] bg-white text-xs font-mono focus:outline-none focus:border-[#96171B]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      saveGoogleSheetWebhookUrl(sheetWebhookUrlInput.trim());
                      showToast('URL Webhook berhasil disimpan!');
                    }}
                    className="px-4 py-2 bg-[#96171B] hover:bg-[#7D1216] text-white font-bold rounded-lg cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>

                {sheetModalTestResult && (
                  <div className={`p-2.5 rounded-lg text-xs font-medium border ${
                    sheetModalTestResult.success ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
                  }`}>
                    {sheetModalTestResult.message}
                  </div>
                )}
              </div>

              {/* Panduan 4 Langkah Pasang Script */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 space-y-1.5 leading-relaxed">
                <span className="font-extrabold text-amber-900 block text-xs">Petunjuk Penggunaan:</span>
                <p>1. Buka Google Sheet Anda (atau klik tombol hijau "Buat Sheet Baru" di atas).</p>
                <p>2. Salin link URL browser dokumen Anda dan tempel di kotak nomor 1 di atas lalu klik <strong>Simpan</strong>.</p>
                <p>3. Di menu Google Sheet, pilih menu <strong>Ekstensi</strong> &rarr; <strong>Apps Script</strong>. Hapus isinya lalu klik tombol di bawah untuk <strong>Salin Kode Apps Script</strong> dan tempel di sana.</p>
                <p>4. Klik <strong>Deploy</strong> &rarr; <strong>New deployment</strong> &rarr; Pilih type <strong>Web app</strong>, atur akses ke <strong>Anyone</strong>, lalu salin Web app URL ke kotak nomor 2 di atas.</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6E1DA]">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(HARA_APPS_SCRIPT_TEMPLATE);
                    setSheetModalCopiedScript(true);
                    setTimeout(() => setSheetModalCopiedScript(false), 2500);
                    showToast('Kode Google Apps Script berhasil disalin ke clipboard!');
                  }}
                  className="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {sheetModalCopiedScript ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{sheetModalCopiedScript ? 'Script Berhasil Disalin!' : 'Salin Kode Google Apps Script'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportPenilaianToCSV(filteredHistoryList)}
                    className="px-3.5 py-2 rounded-lg bg-white hover:bg-stone-50 border border-[#E6E1DA] text-xs font-bold text-[#181411] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} className="text-[#96171B]" />
                    <span>Unduh CSV / Excel Langsung</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncAllToGoogleSheets}
                    disabled={isSyncingAllSheets}
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={isSyncingAllSheets ? 'animate-spin' : ''} />
                    <span>Kirim Semua Riwayat ({filteredHistoryList.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#E6E1DA] bg-stone-50 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#645D55]">
                {sheetDocUrlInput ? '✅ Tautan Google Sheet aktif' : '⚠️ Belum ada tautan dokumen'}
              </span>
              <button
                type="button"
                onClick={() => setIsSheetLinkModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-white border border-[#E6E1DA] hover:bg-stone-100 text-xs font-bold text-[#181411] cursor-pointer"
              >
                Tutup
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
