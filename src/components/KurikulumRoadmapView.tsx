import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, CheckCircle2, Clock, Target, Sparkles,
  ArrowRight, ShieldCheck, UserCheck, BookOpen, Wrench,
  AlertTriangle, Filter, Plus, Flame, Award, ChevronRight,
  Printer, Check, X, FileText, ChevronDown, ChevronUp,
  Brain, TrendingUp, AlertCircle, RefreshCw, BarChart2,
  Users, Store, Info, Edit3, MessageSquare, Star, Zap,
  Compass, Eye, CheckSquare, Layers, Award as MedalIcon
} from 'lucide-react';
import { db } from '../lib/storage';
import {
  CrewOnboardingProgress, OnboardingChecklistItem, OnboardingPhase,
  Kru, Outlet, Division, TrainingMethodKey
} from '../types';
import {
  OFFICIAL_ONBOARDING_CURRICULUM,
  WORLD_CLASS_TRAINING_METHODS,
  WorldClassTrainingMethod,
  calculateLearningVelocity,
  calculateCompetencyDecay
} from '../lib/curriculumData';
import { OfficialDocumentHeader } from './OfficialDocumentHeader';
import { ProgramOJT30HariView } from './trainer/ProgramOJT30HariView';

interface KurikulumRoadmapViewProps {
  selectedOutletCode: string;
}

export const KurikulumRoadmapView: React.FC<KurikulumRoadmapViewProps> = ({
  selectedOutletCode,
}) => {
  const [onboardingList, setOnboardingList] = useState<CrewOnboardingProgress[]>([]);
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedCrewId, setSelectedCrewId] = useState<string>('');
  const [activePhase, setActivePhase] = useState<OnboardingPhase>('fase_1_30');
  const [divisiFilter, setDivisiFilter] = useState<string>('ALL');

  // Training Method Selector State
  const [selectedMethodKey, setSelectedMethodKey] = useState<TrainingMethodKey>('hybrid_twi_spaced');
  const [methodsComparisonModalOpen, setMethodsComparisonModalOpen] = useState(false);
  const [sopDetailModalItem, setSopDetailModalItem] = useState<OnboardingChecklistItem | null>(null);
  const [expandedStepsMap, setExpandedStepsMap] = useState<Record<string, boolean>>({});

  // Modals
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [signoffModalPhase, setSignoffModalPhase] = useState<OnboardingPhase | null>(null);
  const [itemNoteModal, setItemNoteModal] = useState<{ itemId: string; title: string; currentNote: string } | null>(null);
  const [weeklyNoteModalOpen, setWeeklyNoteModalOpen] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<number | 'ALL'>('ALL');
  const [ojtGuideModalOpen, setOjtGuideModalOpen] = useState(false);

  // Register Form State
  const [registerForm, setRegisterForm] = useState({
    kru_id: '',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    trainer_nama: 'Haikal Abi (Trainer Operasional)',
    target_selesai: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    selected_method: 'hybrid_twi_spaced' as TrainingMethodKey,
  });

  // Signoff Form State
  const [signoffForm, setSignoffForm] = useState({
    trainerName: 'Haikal Abi (Trainer Operasional)',
    kepalaOutlet: 'Rian Hidayat (Kepala Outlet)',
    status: 'Lulus' as 'Lulus' | 'Remedial',
    skorTeori: 85,
    skorPraktik: 90,
    skorLisan: 88,
    speedOfServiceSec: 150,
    evaluasiKomprehensif: 92,
    catatan: 'Kru menunjukkan kepatuhan SOP tinggi, pemahaman food safety mantap, dan siap bertugas mandiri.',
  });

  // Weekly note form
  const [weeklyNoteForm, setWeeklyNoteForm] = useState({
    week: 1,
    catatan: '',
  });

  const loadData = () => {
    const list = db.getTable<CrewOnboardingProgress>('onboarding_progress');
    setOnboardingList(list);
    setKruList(db.getTable<Kru>('kru'));
    setOutlets(db.getTable<Outlet>('outlets'));

    if (list.length > 0 && !selectedCrewId) {
      setSelectedCrewId(list[0].id);
      if (list[0].selected_method) {
        setSelectedMethodKey(list[0].selected_method);
      }
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, []);

  // Filtered Onboarding List based on selected outlet
  const filteredCrewList = useMemo(() => {
    return onboardingList.filter((item) => {
      if (selectedOutletCode !== 'ALL' && item.kode_outlet !== selectedOutletCode) return false;
      if (divisiFilter !== 'ALL' && item.divisi !== divisiFilter) return false;
      return true;
    });
  }, [onboardingList, selectedOutletCode, divisiFilter]);

  // Selected Crew Object
  const currentCrewProgress = useMemo(() => {
    return onboardingList.find((item) => item.id === selectedCrewId) || filteredCrewList[0] || null;
  }, [onboardingList, selectedCrewId, filteredCrewList]);

  // Keep method in sync when crew changes
  useEffect(() => {
    if (currentCrewProgress?.selected_method) {
      setSelectedMethodKey(currentCrewProgress.selected_method);
    }
  }, [currentCrewProgress?.id, currentCrewProgress?.selected_method]);

  // Active Method Object
  const activeMethodObj = useMemo(() => {
    return WORLD_CLASS_TRAINING_METHODS.find((m) => m.id === selectedMethodKey) || WORLD_CLASS_TRAINING_METHODS[0];
  }, [selectedMethodKey]);

  // Curriculum items applicable for selected phase and crew division
  const currentCurriculumItems = useMemo(() => {
    if (!currentCrewProgress) return [];
    return OFFICIAL_ONBOARDING_CURRICULUM.filter((item) => {
      if (item.phase !== activePhase) return false;
      if (item.divisi !== 'Semua' && item.divisi !== currentCrewProgress.divisi) return false;
      if (selectedWeekFilter !== 'ALL' && item.week !== selectedWeekFilter) return false;
      return true;
    });
  }, [activePhase, currentCrewProgress, selectedWeekFilter]);

  // Data Science analytics for current crew
  const dataScienceStats = useMemo(() => {
    if (!currentCrewProgress) return null;
    return calculateLearningVelocity(currentCrewProgress);
  }, [currentCrewProgress]);

  // Days since last check or signoff
  const daysSinceLastActivity = useMemo(() => {
    if (!currentCrewProgress || currentCrewProgress.completed_items.length === 0) return 30;
    const sorted = [...currentCrewProgress.completed_items].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    const lastDate = new Date(sorted[0].completedAt).getTime();
    return Math.max(0, Math.round((Date.now() - lastDate) / (1000 * 60 * 60 * 24)));
  }, [currentCrewProgress]);

  const decayStats = useMemo(() => {
    return calculateCompetencyDecay(daysSinceLastActivity);
  }, [daysSinceLastActivity]);

  // Calculate phase completions
  const phaseProgressMap = useMemo(() => {
    if (!currentCrewProgress) return { fase_1_30: 0, fase_2_60: 0, fase_3_90: 0, overall: 0 };
    const getPhasePercent = (p: OnboardingPhase) => {
      const items = OFFICIAL_ONBOARDING_CURRICULUM.filter(
        (i) => i.phase === p && (i.divisi === 'Semua' || i.divisi === currentCrewProgress.divisi)
      );
      if (items.length === 0) return 100;
      const done = items.filter((i) =>
        currentCrewProgress.completed_items.some((c) => c.itemId === i.id)
      ).length;
      return Math.round((done / items.length) * 100);
    };

    const allItems = OFFICIAL_ONBOARDING_CURRICULUM.filter(
      (i) => i.divisi === 'Semua' || i.divisi === currentCrewProgress.divisi
    );
    const totalDone = allItems.filter((i) =>
      currentCrewProgress.completed_items.some((c) => c.itemId === i.id)
    ).length;
    const overall = allItems.length > 0 ? Math.round((totalDone / allItems.length) * 100) : 0;

    return {
      fase_1_30: getPhasePercent('fase_1_30'),
      fase_2_60: getPhasePercent('fase_2_60'),
      fase_3_90: getPhasePercent('fase_3_90'),
      overall,
    };
  }, [currentCrewProgress]);

  // Toggle item completion
  const handleToggleItem = (itemId: string) => {
    if (!currentCrewProgress) return;
    const existingIndex = currentCrewProgress.completed_items.findIndex((c) => c.itemId === itemId);
    let updatedCompleted = [...currentCrewProgress.completed_items];

    if (existingIndex >= 0) {
      updatedCompleted.splice(existingIndex, 1);
    } else {
      updatedCompleted.push({
        itemId,
        completedAt: new Date().toISOString().split('T')[0],
        verifiedBy: 'Haikal Abi (Trainer Operasional)',
        notes: `Diverifikasi dengan ${activeMethodObj.name}`,
        methodUsed: selectedMethodKey,
      });
    }

    db.updateRow('onboarding_progress', currentCrewProgress.id, {
      completed_items: updatedCompleted,
    });
  };

  // Toggle step accordion
  const toggleStepsAccordion = (itemId: string) => {
    setExpandedStepsMap((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Assign active method to crew in database
  const handleAssignMethodToCrew = (methodKey: TrainingMethodKey) => {
    if (!currentCrewProgress) return;
    setSelectedMethodKey(methodKey);
    db.updateRow('onboarding_progress', currentCrewProgress.id, {
      selected_method: methodKey,
    });
  };

  // Save Item Note
  const handleSaveItemNote = () => {
    if (!currentCrewProgress || !itemNoteModal) return;
    const updatedCompleted = currentCrewProgress.completed_items.map((c) => {
      if (c.itemId === itemNoteModal.itemId) {
        return { ...c, notes: itemNoteModal.currentNote };
      }
      return c;
    });

    db.updateRow('onboarding_progress', currentCrewProgress.id, {
      completed_items: updatedCompleted,
    });
    setItemNoteModal(null);
  };

  // Save Signoff
  const handleSaveSignoff = () => {
    if (!currentCrewProgress || !signoffModalPhase) return;

    const newSignoffs = { ...currentCrewProgress.signoffs };
    const signPayload = {
      signedAt: new Date().toISOString().split('T')[0],
      trainerName: signoffForm.trainerName,
      kepalaOutlet: signoffForm.kepalaOutlet,
      status: signoffForm.status,
      catatan: signoffForm.catatan,
      ...(signoffModalPhase === 'fase_1_30' ? { skorTeori: signoffForm.skorTeori, skorPraktik: signoffForm.skorPraktik } : {}),
      ...(signoffModalPhase === 'fase_2_60' ? { skorLisan: signoffForm.skorLisan, speedOfServiceSec: signoffForm.speedOfServiceSec } : {}),
      ...(signoffModalPhase === 'fase_3_90' ? { evaluasiKomprehensif: signoffForm.evaluasiKomprehensif } : {}),
    };

    if (signoffModalPhase === 'fase_1_30') newSignoffs.fase_1 = signPayload;
    if (signoffModalPhase === 'fase_2_60') newSignoffs.fase_2 = signPayload;
    if (signoffModalPhase === 'fase_3_90') {
      newSignoffs.fase_3 = signPayload;
    }

    // Determine status & next phase
    let newStatus = currentCrewProgress.status;
    let nextPhase = currentCrewProgress.current_phase;
    if (signoffModalPhase === 'fase_1_30' && signoffForm.status === 'Lulus') {
      nextPhase = 'fase_2_60';
    } else if (signoffModalPhase === 'fase_2_60' && signoffForm.status === 'Lulus') {
      nextPhase = 'fase_3_90';
    } else if (signoffModalPhase === 'fase_3_90' && signoffForm.status === 'Lulus') {
      newStatus = 'Lulus Mandiri';
    }

    db.updateRow('onboarding_progress', currentCrewProgress.id, {
      signoffs: newSignoffs,
      current_phase: nextPhase,
      status: newStatus,
    });

    setSignoffModalPhase(null);
  };

  // Add Weekly Progress Note
  const handleAddWeeklyNote = () => {
    if (!currentCrewProgress || !weeklyNoteForm.catatan.trim()) return;
    const newNotes = [
      ...(currentCrewProgress.notes_weekly || []),
      {
        week: Number(weeklyNoteForm.week),
        tanggal: new Date().toISOString().split('T')[0],
        catatan: weeklyNoteForm.catatan.trim(),
        trainer: 'Haikal Abi (Trainer Operasional)',
      },
    ];

    db.updateRow('onboarding_progress', currentCrewProgress.id, {
      notes_weekly: newNotes,
    });
    setWeeklyNoteForm({ week: 1, catatan: '' });
    setWeeklyNoteModalOpen(false);
  };

  // Register New Trainee
  const handleRegisterTrainee = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedKru = kruList.find((k) => k.id === registerForm.kru_id);
    if (!selectedKru) return;

    const newProgress: CrewOnboardingProgress = {
      id: 'onb-' + Date.now(),
      kru_id: selectedKru.id,
      nama_kru: selectedKru.nama_kru,
      kode_outlet: selectedKru.kode_outlet,
      divisi: selectedKru.divisi,
      tanggal_mulai: registerForm.tanggal_mulai,
      trainer_nama: registerForm.trainer_nama,
      target_selesai: registerForm.target_selesai,
      current_phase: 'fase_1_30',
      selected_method: registerForm.selected_method,
      status: 'Aktif Onboarding',
      completed_items: [],
      notes_weekly: [
        {
          week: 1,
          tanggal: registerForm.tanggal_mulai,
          catatan: `Didaftarkan ke Onboarding 90 Hari Hara Chicken dengan metode: ${registerForm.selected_method}.`,
          trainer: registerForm.trainer_nama,
        },
      ],
      signoffs: {},
      created_at: new Date().toISOString(),
    };

    db.insertRow('onboarding_progress', newProgress);
    setSelectedCrewId(newProgress.id);
    setSelectedMethodKey(registerForm.selected_method);
    setRegisterModalOpen(false);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-[#141210] border border-white/10 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#A21D21]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A21D21]/20 border border-[#A21D21]/40 text-[#fca5a5] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-[#D9A027]" />
              SOP Station Training Curriculum (F&B QSR Standards)
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              Kurikulum & Roadmap Onboarding Kru (30 - 60 - 90 Hari)
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl mt-1">
              Dipadukan lengkap dengan seluruh SOP resmi Hara Chicken (Kitchen, Kasir, Geprek, Hygiene K3),
              serta dipersenjatai dengan pilihan <strong>5 Metode Pelatihan Terbaik & Terefisien di Dunia</strong> (Toyota TWI, Buddy Shadowing, Agile Sprint, Flipped Harvard, Deming TQM).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setOjtGuideModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-sm font-semibold rounded-xl border border-emerald-400/30 transition-all active:scale-95"
            >
              <Sparkles size={16} className="text-emerald-400" />
              Panduan OJT 30 Hari
            </button>
            <button
              onClick={() => setMethodsComparisonModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-sm font-semibold rounded-xl border border-amber-400/30 transition-all active:scale-95"
            >
              <Compass size={16} className="text-[#D9A027]" />
              Bandingkan 5 Metode Dunia
            </button>
            <button
              onClick={() => setRegisterModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#A21D21] hover:bg-[#88181b] text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95"
            >
              <Plus size={16} />
              Daftarkan Kru Baru
            </button>
            <button
              onClick={() => setPrintPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-xl border border-white/10 transition-all active:scale-95"
            >
              <Printer size={16} />
              Cetak Dokumen
            </button>
          </div>
        </div>

        {/* 3 Phases Milestone Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10">
          <div
            onClick={() => setActivePhase('fase_1_30')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
              activePhase === 'fase_1_30'
                ? 'bg-[#A21D21]/20 border-[#A21D21] ring-1 ring-[#A21D21]'
                : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-white">BULAN 1 (HARI 1 - 30)</span>
              <span className="font-mono text-[#D9A027] font-bold">{phaseProgressMap.fase_1_30}%</span>
            </div>
            <div className="text-sm font-bold text-white">Fondasi & Stasiun Primer</div>
            <div className="text-xs text-slate-400 mt-0.5">Grooming, Hygiene, Food Safety, & Solo Shift 1 Stasiun</div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${phaseProgressMap.fase_1_30}%` }}
              />
            </div>
          </div>

          <div
            onClick={() => setActivePhase('fase_2_60')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
              activePhase === 'fase_2_60'
                ? 'bg-[#A21D21]/20 border-[#A21D21] ring-1 ring-[#A21D21]'
                : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-white">BULAN 2 (HARI 31 - 60)</span>
              <span className="font-mono text-[#D9A027] font-bold">{phaseProgressMap.fase_2_60}%</span>
            </div>
            <div className="text-sm font-bold text-white">Multi-Stasiun & Jam Sibuk</div>
            <div className="text-xs text-slate-400 mt-0.5">Cross-training, Speed-of-service, & Rush hour stress test</div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${phaseProgressMap.fase_2_60}%` }}
              />
            </div>
          </div>

          <div
            onClick={() => setActivePhase('fase_3_90')}
            className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
              activePhase === 'fase_3_90'
                ? 'bg-[#A21D21]/20 border-[#A21D21] ring-1 ring-[#A21D21]'
                : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-white">BULAN 3 (HARI 61 - 90)</span>
              <span className="font-mono text-[#D9A027] font-bold">{phaseProgressMap.fase_3_90}%</span>
            </div>
            <div className="text-sm font-bold text-white">Kemandirian & Pre-Leadership</div>
            <div className="text-xs text-slate-400 mt-0.5">Service Recovery (L.A.S.T), Maintenance alat, & Peer mentoring</div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${phaseProgressMap.fase_3_90}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trainee Selector & Quick Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <Users size={14} className="text-[#A21D21]" />
            Pilih Kru Trainee:
          </span>
          <div className="flex items-center gap-2">
            {filteredCrewList.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCrewId(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  currentCrewProgress?.id === c.id
                    ? 'bg-[#A21D21] text-white border-[#A21D21] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c.nama_kru} ({c.kode_outlet} • {c.divisi})
              </button>
            ))}
            {filteredCrewList.length === 0 && (
              <span className="text-xs text-slate-400 italic">Belum ada kru pada outlet ini.</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={divisiFilter}
            onChange={(e) => setDivisiFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#A21D21]"
          >
            <option value="ALL">Semua Divisi</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Kasir">Kasir</option>
            <option value="Geprek">Geprek</option>
            <option value="Helper">Helper</option>
          </select>

          <select
            value={selectedWeekFilter}
            onChange={(e) => setSelectedWeekFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#A21D21]"
          >
            <option value="ALL">Semua Minggu</option>
            {activePhase === 'fase_1_30' && (
              <>
                <option value={1}>Minggu 1: Orientasi & K3</option>
                <option value={2}>Minggu 2: Fondasi Stasiun Primer</option>
                <option value={3}>Minggu 3: Penggorengan & Servis</option>
                <option value={4}>Minggu 4: Solo Shift & Milestone 1</option>
              </>
            )}
            {activePhase === 'fase_2_60' && (
              <>
                <option value={5}>Minggu 5: Menu Tambahan (Cross-Training)</option>
                <option value={6}>Minggu 6: Jam Sibuk (Rush Hour SOS)</option>
                <option value={7}>Minggu 7: Minyak Fryer & Zero Waste</option>
                <option value={8}>Minggu 8: Stock Opname & Milestone 2</option>
              </>
            )}
            {activePhase === 'fase_3_90' && (
              <>
                <option value={9}>Minggu 9: Service Recovery L.A.S.T</option>
                <option value={10}>Minggu 10: Maintenance Alat Gerai</option>
                <option value={11}>Minggu 11: Peer Mentoring Rekan Baru</option>
                <option value={12}>Minggu 12: Sidang Akhir Kelulusan 90 Hari</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* WORLD-CLASS TRAINING METHOD SELECTION BAR (PILIHAN METODE TERBAIK DUNIA) */}
      <div className="bg-gradient-to-r from-slate-900 via-stone-900 to-slate-950 rounded-2xl border border-amber-500/30 p-5 shadow-lg text-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Zap size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                  METODOLOGI PELATIHAN DUNIA
                </span>
                <span className="text-xs text-slate-300">
                  Pilih metode belajar yang paling pas untuk trainee Anda
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Pilihan Kerangka Kerja Pedagogi & Efisiensi Pelatihan
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentCrewProgress && currentCrewProgress.selected_method !== selectedMethodKey && (
              <button
                onClick={() => handleAssignMethodToCrew(selectedMethodKey)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Check size={14} />
                Terapkan ke Kru Ini ({currentCrewProgress.nama_kru})
              </button>
            )}
            <button
              onClick={() => setMethodsComparisonModalOpen(true)}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/15"
            >
              <Info size={14} />
              Tabel Komparasi 5 Metode
            </button>
          </div>
        </div>

        {/* 5 Methods Horizontal Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {WORLD_CLASS_TRAINING_METHODS.map((method) => {
            const isSelected = selectedMethodKey === method.id;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethodKey(method.id)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-400 ring-2 ring-amber-400/50 shadow-md'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {method.isBestMethod && (
                  <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-extrabold uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <Star size={10} className="fill-white" /> TER-BAIK
                  </span>
                )}

                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    {method.badgeLabel.replace('METODE ', '')}
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                    {method.name.replace(/Metode \d+: |Metode Ter-Baik: /g, '')}
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {method.tagline}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Efisiensi:</span>
                  <span className="font-mono font-bold text-amber-300">{method.efficiencyScore}%</span>
                  <span className="text-slate-400">Retensi:</span>
                  <span className="font-mono font-bold text-emerald-400">{method.retentionRate}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Method Summary Strip */}
        <div className="bg-black/30 rounded-xl p-3.5 border border-white/10 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300">Metode Aktif: {activeMethodObj.name}</span>
              {activeMethodObj.isBestMethod && (
                <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                  Standar Emas Dunia
                </span>
              )}
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              <strong className="text-white">Landasan Ilmiah:</strong> {activeMethodObj.scientificBasis} |{' '}
              <strong className="text-white">Alur Harian:</strong> {activeMethodObj.dailyRoutineSummary}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 text-right">
            <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="text-[10px] text-slate-400 block">Waktu ke Mandiri:</span>
              <span className="font-bold text-emerald-400 font-mono text-xs">{activeMethodObj.adaptationSpeed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Trainee Overview + Checklist + Sidebar */}
      {currentCrewProgress ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Active Trainee Header & Checklist Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Trainee Card Details */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{currentCrewProgress.nama_kru}</h2>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                    {currentCrewProgress.kode_outlet} • Divisi {currentCrewProgress.divisi}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    currentCrewProgress.status === 'Lulus Mandiri'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentCrewProgress.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>Mulai: <strong className="text-slate-700">{currentCrewProgress.tanggal_mulai}</strong></span>
                  <span>Target Selesai: <strong className="text-slate-700">{currentCrewProgress.target_selesai}</strong></span>
                  <span>Metode Kru: <strong className="text-[#A21D21] font-semibold">{currentCrewProgress.selected_method ? currentCrewProgress.selected_method.toUpperCase() : 'DEFAULT'}</strong></span>
                  <span>Trainer PIC: <strong className="text-slate-700">{currentCrewProgress.trainer_nama}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setWeeklyNoteModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare size={13} />
                  Catatan Mingguan
                </button>
                <button
                  onClick={() => setSignoffModalPhase(activePhase)}
                  className="px-3 py-1.5 bg-[#A21D21] hover:bg-[#88181b] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Award size={13} />
                  Sign-off Milestone
                </button>
              </div>
            </div>

            {/* Checklist Items Container */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#A21D21]" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Modul Checklist: {activePhase === 'fase_1_30' ? 'Bulan 1 (Hari 1-30)' : activePhase === 'fase_2_60' ? 'Bulan 2 (Hari 31-60)' : 'Bulan 3 (Hari 61-90)'}
                  </span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                    {currentCurriculumItems.filter((i) => currentCrewProgress.completed_items.some((c) => c.itemId === i.id)).length} / {currentCurriculumItems.length} Selesai
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Metode Aktif: <strong className="text-slate-700">{activeMethodObj.name.replace(/Metode \d+: |Metode Ter-Baik: /g, '')}</strong>
                </span>
              </div>

              {currentCurriculumItems.map((item) => {
                const completedRecord = currentCrewProgress.completed_items.find((c) => c.itemId === item.id);
                const isChecked = !!completedRecord;
                const isStepsExpanded = !!expandedStepsMap[item.id];
                const methodInstruction = item.opsiMetodePelaksanaan?.[selectedMethodKey];

                return (
                  <div
                    key={item.id}
                    className={`p-4 transition-colors ${
                      isChecked ? 'bg-emerald-50/20' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => handleToggleItem(item.id)}
                        className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                            : 'bg-white border-slate-300 hover:border-slate-400 text-transparent'
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                      </button>

                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            Mg {item.week}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-[#A21D21] border border-red-200">
                            {item.kategori}
                          </span>
                          {item.sopRef && (
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300 font-bold flex items-center gap-1">
                              <BookOpen size={11} className="text-amber-700" />
                              {item.sopRef}
                            </span>
                          )}
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {item.metodeTraining}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className={`text-sm font-bold ${isChecked ? 'text-emerald-950' : 'text-slate-900'}`}>
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* PANDUAN METODE AKTIF (DYNAMIC WORLD-CLASS METHOD GUIDANCE) */}
                        {methodInstruction && (
                          <div className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                            selectedMethodKey === 'hybrid_twi_spaced'
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                              : selectedMethodKey === 'buddy_apprenticeship'
                              ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                              : selectedMethodKey === 'agile_gamified_sprints'
                              ? 'bg-purple-50/80 border-purple-200 text-purple-950'
                              : selectedMethodKey === 'flipped_retrieval'
                              ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                              : 'bg-rose-50/80 border-rose-200 text-rose-950'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                                <Zap size={12} className={activeMethodObj.colorScheme.text} />
                                Panduan Eksekusi: {activeMethodObj.name.replace(/Metode \d+: |Metode Ter-Baik: /g, '')}
                              </span>
                              <span className="text-[10px] opacity-75 font-semibold">
                                {activeMethodObj.efficiencyScore}% Efisiensi
                              </span>
                            </div>
                            <p className="leading-relaxed font-medium">
                              {methodInstruction}
                            </p>
                          </div>
                        )}

                        {/* Detailed Steps Toggle (Langkah-Langkah Operasional Baku) */}
                        {item.langkahDetail && item.langkahDetail.length > 0 && (
                          <div>
                            <button
                              type="button"
                              onClick={() => toggleStepsAccordion(item.id)}
                              className="text-xs font-semibold text-slate-700 hover:text-[#A21D21] flex items-center gap-1 transition-colors"
                            >
                              <span>{isStepsExpanded ? 'Sembunyikan Langkah Operasional' : `Tampilkan ${item.langkahDetail.length} Langkah Operasional Baku`}</span>
                              {isStepsExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>

                            {isStepsExpanded && (
                              <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5 animate-in fade-in duration-200">
                                <strong className="text-slate-800 block text-[11px] mb-1">
                                  Urutan Langkah Resmi ({item.sopRef || 'SOP Hara Chicken'}):
                                </strong>
                                <ol className="list-decimal pl-4 space-y-1 text-slate-700 leading-snug">
                                  {item.langkahDetail.map((step, sIdx) => (
                                    <li key={sIdx}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        )}

                        {/* HACCP & Key Reasons Box */}
                        {(item.haccpControl || item.alasanKunci) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {item.haccpControl && (
                              <div className="bg-red-50/70 border border-red-200/70 rounded-lg p-2 text-red-950">
                                <strong className="text-red-900 block text-[10px] uppercase font-bold mb-0.5">
                                  HACCP Control / Titik Bahaya:
                                </strong>
                                <span className="leading-tight block">{item.haccpControl}</span>
                              </div>
                            )}
                            {item.alasanKunci && (
                              <div className="bg-blue-50/70 border border-blue-200/70 rounded-lg p-2 text-blue-950">
                                <strong className="text-blue-900 block text-[10px] uppercase font-bold mb-0.5">
                                  Alasan Kunci (Why behind the rule):
                                </strong>
                                <span className="leading-tight block">{item.alasanKunci}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Critical Points list */}
                        {item.criticalPoints && item.criticalPoints.length > 0 && (
                          <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5">
                            <span className="text-xs font-bold text-amber-900 flex items-center gap-1 mb-1">
                              <AlertCircle size={12} className="text-amber-700" />
                              Poin Kritis HACCP / Standar Kunci:
                            </span>
                            <ul className="text-xs text-amber-950 space-y-0.5 pl-4 list-disc">
                              {item.criticalPoints.map((pt, pIdx) => (
                                <li key={pIdx}>{pt}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Verification Criteria & Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="text-slate-500">
                            Kriteria: <span className="text-slate-700 font-medium">{item.kriteriaVerifikasi}</span>
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSopDetailModalItem(item)}
                              className="text-xs text-[#A21D21] font-semibold hover:underline flex items-center gap-1"
                            >
                              <Layers size={13} />
                              Bandingkan 5 Metode SOP Ini
                            </button>

                            {isChecked ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 size={13} />
                                Diverifikasi: {completedRecord?.completedAt}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Belum diverifikasi</span>
                            )}

                            <button
                              onClick={() =>
                                setItemNoteModal({
                                  itemId: item.id,
                                  title: item.title,
                                  currentNote: completedRecord?.notes || '',
                                })
                              }
                              className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
                              title="Tulis catatan observasi khusus"
                            >
                              <Edit3 size={13} />
                            </button>
                          </div>
                        </div>

                        {completedRecord?.notes && (
                          <div className="mt-1 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 flex items-start gap-1.5">
                            <Info size={13} className="text-slate-400 shrink-0 mt-0.5" />
                            <span>Catatan Trainer: {completedRecord.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {currentCurriculumItems.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <CheckCircle2 size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm">Tidak ada modul checklist pada filter minggu ini.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Data Science, Decay Analytics, Milestone Sign-off Status (1 Col) */}
          <div className="space-y-4">
            {/* 1. Data Science: Predictive Learning Velocity (TTA) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Brain size={14} className="text-[#A21D21]" />
                  Predictive Mastery (Data Science)
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  TTA Model
                </span>
              </div>

              {dataScienceStats && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Learning Velocity Index</span>
                      <span className="font-bold font-mono text-[#A21D21]">
                        {dataScienceStats.velocityIndex}x
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          dataScienceStats.velocityIndex >= 1.15
                            ? 'bg-emerald-500'
                            : dataScienceStats.velocityIndex >= 0.85
                            ? 'bg-blue-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, dataScienceStats.velocityIndex * 70)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status Kecepatan:</span>
                      <strong className={`${
                        dataScienceStats.status.includes('Unggul')
                          ? 'text-emerald-700'
                          : dataScienceStats.status.includes('Normal')
                          ? 'text-blue-700'
                          : 'text-rose-700'
                      }`}>
                        {dataScienceStats.status}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Progres Selesai:</span>
                      <strong className="text-slate-800">{dataScienceStats.completedPercent}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Prediksi Waktu Mandiri:</span>
                      <strong className="text-slate-800">{dataScienceStats.predictedDaysToGraduate} Hari Lagi</strong>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-amber-50/70 border border-amber-200/70 p-2.5 rounded-lg leading-relaxed">
                    <strong className="text-amber-900 block mb-0.5">Rekomendasi Algoritmik:</strong>
                    {dataScienceStats.recommendation}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Ebbinghaus Competency Decay Risk Index */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-[#D9A027]" />
                  Retensi Standar (Ebbinghaus Decay)
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {daysSinceLastActivity} Hari Lalu
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Estimasi Retensi Ingatan SOP:</span>
                  <span className={`font-bold font-mono text-${decayStats.color}-600`}>
                    {decayStats.retentionPercent}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-${decayStats.color}-500`}
                    style={{ width: `${decayStats.retentionPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Level Retensi:</span>
                  <strong className={`text-${decayStats.color}-700`}>{decayStats.decayLevel}</strong>
                </div>
              </div>
            </div>

            {/* 3. Milestone Sign-off Status Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Status Berita Acara Milestone
                </span>
              </div>

              {/* Fase 1 */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Bulan 1 (Hari 30) - Stasiun Primer</span>
                  {currentCrewProgress.signoffs?.fase_1 ? (
                    <span className="text-emerald-700 font-bold">LULUS</span>
                  ) : (
                    <span className="text-slate-400 italic">Belum Sign-off</span>
                  )}
                </div>
                {currentCrewProgress.signoffs?.fase_1 ? (
                  <div className="text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
                    <div>Tgl: {currentCrewProgress.signoffs.fase_1.signedAt}</div>
                    <div>Teori: {currentCrewProgress.signoffs.fase_1.skorTeori} | Praktik: {currentCrewProgress.signoffs.fase_1.skorPraktik}</div>
                    <div className="italic text-slate-500 mt-0.5">"{currentCrewProgress.signoffs.fase_1.catatan}"</div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSignoffModalPhase('fase_1_30')}
                    className="w-full mt-1.5 py-1 text-center bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    Buka Berita Acara Fase 1
                  </button>
                )}
              </div>

              {/* Fase 2 */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Bulan 2 (Hari 60) - Multi-Stasiun</span>
                  {currentCrewProgress.signoffs?.fase_2 ? (
                    <span className="text-emerald-700 font-bold">LULUS</span>
                  ) : (
                    <span className="text-slate-400 italic">Belum Sign-off</span>
                  )}
                </div>
                {currentCrewProgress.signoffs?.fase_2 ? (
                  <div className="text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
                    <div>Tgl: {currentCrewProgress.signoffs.fase_2.signedAt}</div>
                    <div>Uji Lisan: {currentCrewProgress.signoffs.fase_2.skorLisan} | SOS: {currentCrewProgress.signoffs.fase_2.speedOfServiceSec}s</div>
                    <div className="italic text-slate-500 mt-0.5">"{currentCrewProgress.signoffs.fase_2.catatan}"</div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSignoffModalPhase('fase_2_60')}
                    className="w-full mt-1.5 py-1 text-center bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    Buka Berita Acara Fase 2
                  </button>
                )}
              </div>

              {/* Fase 3 */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Bulan 3 (Hari 90) - Kru Mandiri Penuh</span>
                  {currentCrewProgress.signoffs?.fase_3 ? (
                    <span className="text-emerald-700 font-bold">LULUS MANDIRI</span>
                  ) : (
                    <span className="text-slate-400 italic">Belum Sign-off</span>
                  )}
                </div>
                {currentCrewProgress.signoffs?.fase_3 ? (
                  <div className="text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
                    <div>Tgl: {currentCrewProgress.signoffs.fase_3.signedAt}</div>
                    <div>Evaluasi Akhir: {currentCrewProgress.signoffs.fase_3.evaluasiKomprehensif} Pts</div>
                    <div className="italic text-slate-500 mt-0.5">"{currentCrewProgress.signoffs.fase_3.catatan}"</div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSignoffModalPhase('fase_3_90')}
                    className="w-full mt-1.5 py-1 text-center bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-medium"
                  >
                    Buka Berita Acara Fase 3
                  </button>
                )}
              </div>
            </div>

            {/* 4. Weekly Coaching Logs */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Log Evaluasi Mingguan
                </span>
                <button
                  onClick={() => setWeeklyNoteModalOpen(true)}
                  className="text-xs text-[#A21D21] font-semibold hover:underline"
                >
                  + Tambah
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {currentCrewProgress.notes_weekly && currentCrewProgress.notes_weekly.map((n, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700 text-[11px] mb-0.5">
                      <span>Minggu ke-{n.week}</span>
                      <span className="text-slate-400">{n.tanggal}</span>
                    </div>
                    <p className="text-slate-600 leading-snug">{n.catatan}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Belum Ada Kru di Program Onboarding</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Daftarkan kru baru agar Anda dapat memantau roadmap 30-60-90 hari, memverifikasi butir SOP stasiun kerja, dan mencatat milestone kelulusan dengan 5 metode terbaik dunia.
          </p>
          <button
            onClick={() => setRegisterModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#A21D21] text-white text-sm font-semibold rounded-xl hover:bg-[#88181b] transition-all shadow-md"
          >
            <Plus size={16} />
            Daftarkan Kru Sekarang
          </button>
        </div>
      )}

      {/* MODAL: KOMPARASI 5 METODE PELATIHAN TERBAIK DUNIA */}
      {methodsComparisonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A21D21] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  WORLD-CLASS BENCHMARKING
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <Compass size={20} className="text-[#A21D21]" />
                  Matriks Perbandingan 5 Metode Pelatihan Terbaik di Dunia
                </h3>
              </div>
              <button
                onClick={() => setMethodsComparisonModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda dan trainee memiliki keleluasaan penuh untuk memilih metode yang paling cocok dengan gaya belajar kru dan kondisi gerai. Berikut analisis komprehensif data riset, efisiensi, dan alur operasionalnya:
            </p>

            {/* Comparison Cards / Table */}
            <div className="space-y-4">
              {WORLD_CLASS_TRAINING_METHODS.map((method, idx) => (
                <div
                  key={method.id}
                  className={`p-4 rounded-xl border transition-all ${
                    selectedMethodKey === method.id
                      ? 'border-amber-400 bg-amber-50/20 ring-1 ring-amber-400'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        Pilihan #{idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{method.name}</h4>
                      {method.isBestMethod && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star size={10} className="fill-emerald-700 text-emerald-700" /> REKOMENDASI TER-BAIK
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedMethodKey(method.id);
                          if (currentCrewProgress) handleAssignMethodToCrew(method.id);
                          setMethodsComparisonModalOpen(false);
                        }}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                          selectedMethodKey === method.id
                            ? 'bg-amber-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {selectedMethodKey === method.id ? '✓ Sedang Dipakai' : 'Pilih Metode Ini'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Benchmark Global</span>
                      <strong className="text-slate-800">{method.globalBenchmark}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Indeks Efisiensi & Retensi</span>
                      <div className="font-mono text-slate-900 font-bold">
                        Efisiensi: <span className="text-amber-700">{method.efficiencyScore}%</span> | Retensi: <span className="text-emerald-700">{method.retentionRate}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Waktu Menuju Kemandirian</span>
                      <strong className="text-slate-800">{method.adaptationSpeed}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Profil Trainee Paling Cocok</span>
                      <span className="text-slate-700 text-[11px]">{method.bestFitProfile}</span>
                    </div>
                  </div>

                  {/* 4 Core Steps Preview */}
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1.5">
                      4 Langkah Inti Pelaksanaan Lapangan:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {method.coreSteps.map((step) => (
                        <div key={step.stepNumber} className="bg-white p-2 rounded border border-slate-200 text-[11px] space-y-1">
                          <strong className="text-slate-900 block font-semibold">{step.title}</strong>
                          <p className="text-slate-600 text-[10px] leading-tight">
                            <span className="font-semibold text-slate-800">Trainer:</span> {step.trainerAction}
                          </p>
                          <p className="text-slate-600 text-[10px] leading-tight">
                            <span className="font-semibold text-slate-800">Trainee:</span> {step.traineeAction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setMethodsComparisonModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Tutup Jendela Komparasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SOP DETAIL & 5 METODE IMPLEMENTASI KHUSUS */}
      {sopDetailModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300">
                    {sopDetailModalItem.sopRef || 'SOP RESMI'}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-[#A21D21] border border-red-200">
                    {sopDetailModalItem.kategori}
                  </span>
                  <span className="text-xs text-slate-400">Minggu ke-{sopDetailModalItem.week}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {sopDetailModalItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSopDetailModalItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {sopDetailModalItem.description}
            </p>

            {/* SOP Step-by-Step details */}
            {sopDetailModalItem.langkahDetail && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={13} className="text-[#A21D21]" />
                  Langkah Operasional Baku (SOP Lapangan)
                </h4>
                <ol className="list-decimal pl-4 text-xs space-y-1 text-slate-700 leading-relaxed">
                  {sopDetailModalItem.langkahDetail.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* HACCP and Key reasons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {sopDetailModalItem.haccpControl && (
                <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl">
                  <strong className="text-red-900 font-bold block text-[11px] mb-1">
                    Titik Kontrol Bahaya HACCP:
                  </strong>
                  <p className="text-red-950 leading-relaxed">{sopDetailModalItem.haccpControl}</p>
                </div>
              )}
              {sopDetailModalItem.alasanKunci && (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl">
                  <strong className="text-blue-900 font-bold block text-[11px] mb-1">
                    Alasan Kunci (Why behind the rule):
                  </strong>
                  <p className="text-blue-950 leading-relaxed">{sopDetailModalItem.alasanKunci}</p>
                </div>
              )}
            </div>

            {/* 5 Alternative Implementation Tracks for this specific SOP */}
            {sopDetailModalItem.opsiMetodePelaksanaan && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-600" />
                  Bagaimana 5 Metode Dunia Mengeksekusi SOP Ini:
                </h4>

                <div className="space-y-2 text-xs">
                  {WORLD_CLASS_TRAINING_METHODS.map((m) => {
                    const inst = sopDetailModalItem.opsiMetodePelaksanaan?.[m.id];
                    if (!inst) return null;
                    const isActive = selectedMethodKey === m.id;
                    return (
                      <div
                        key={m.id}
                        className={`p-2.5 rounded-lg border transition-all ${
                          isActive
                            ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-[11px] flex items-center gap-1">
                            {m.name}
                            {isActive && (
                              <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-bold">
                                Aktif Saat Ini
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Efisiensi: {m.efficiencyScore}%
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">{inst}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setSopDetailModalItem(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700"
              >
                Tutup Detail SOP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: DAFTARKAN KRU BARU KE ONBOARDING */}
      {registerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-[#A21D21]" />
                Daftarkan Kru ke Onboarding 90 Hari
              </h3>
              <button
                onClick={() => setRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterTrainee} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Kru dari Master Data:</label>
                <select
                  required
                  value={registerForm.kru_id}
                  onChange={(e) => setRegisterForm({ ...registerForm, kru_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium focus:ring-1 focus:ring-[#A21D21]"
                >
                  <option value="">-- Pilih Kru --</option>
                  {kruList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama_kru} — {k.divisi} ({k.kode_outlet})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Metode Pelatihan Pilihan (Pedagogi):</label>
                <select
                  value={registerForm.selected_method}
                  onChange={(e) => setRegisterForm({ ...registerForm, selected_method: e.target.value as TrainingMethodKey })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium focus:ring-1 focus:ring-[#A21D21]"
                >
                  {WORLD_CLASS_TRAINING_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.isBestMethod ? '★ ' : ''}{m.name} ({m.efficiencyScore}% Efisiensi)
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Anda dapat mengubah metode ini sewaktu-waktu sesuai perkembangan trainee.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai:</label>
                  <input
                    type="date"
                    required
                    value={registerForm.tanggal_mulai}
                    onChange={(e) => setRegisterForm({ ...registerForm, tanggal_mulai: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Selesai (90 Hari):</label>
                  <input
                    type="date"
                    required
                    value={registerForm.target_selesai}
                    onChange={(e) => setRegisterForm({ ...registerForm, target_selesai: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trainer Fasilitator PIC:</label>
                <input
                  type="text"
                  required
                  value={registerForm.trainer_nama}
                  onChange={(e) => setRegisterForm({ ...registerForm, trainer_nama: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRegisterModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#A21D21] hover:bg-[#88181b] text-white font-semibold rounded-xl shadow-xs"
                >
                  Simpan & Mulai Roadmap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SIGNOFF MILESTONE */}
      {signoffModalPhase && currentCrewProgress && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award size={18} className="text-[#A21D21]" />
                  Berita Acara Evaluasi & Sign-off Milestone
                </h3>
                <p className="text-xs text-slate-500">
                  {signoffModalPhase === 'fase_1_30' ? 'Bulan 1: Stasiun Primer' : signoffModalPhase === 'fase_2_60' ? 'Bulan 2: Multi-Stasiun' : 'Bulan 3: Kru Mandiri Bintang Emas'}
                </p>
              </div>
              <button
                onClick={() => setSignoffModalPhase(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between">
                <span>Nama Trainee: <strong>{currentCrewProgress.nama_kru}</strong></span>
                <span>Divisi: <strong>{currentCrewProgress.divisi}</strong></span>
                <span>Outlet: <strong>{currentCrewProgress.kode_outlet}</strong></span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Keputusan Kelulusan:</label>
                  <select
                    value={signoffForm.status}
                    onChange={(e) => setSignoffForm({ ...signoffForm, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  >
                    <option value="Lulus">LULUS (Memenuhi Standar)</option>
                    <option value="Remedial">REMEDIAL (Butuh Pendampingan Tambahan)</option>
                  </select>
                </div>

                {signoffModalPhase === 'fase_1_30' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Skor Uji Teori (0-100):</label>
                    <input
                      type="number"
                      value={signoffForm.skorTeori}
                      onChange={(e) => setSignoffForm({ ...signoffForm, skorTeori: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                    />
                  </div>
                )}

                {signoffModalPhase === 'fase_2_60' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Speed-of-Service (Detik):</label>
                    <input
                      type="number"
                      value={signoffForm.speedOfServiceSec}
                      onChange={(e) => setSignoffForm({ ...signoffForm, speedOfServiceSec: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                      placeholder="Contoh: 150"
                    />
                  </div>
                )}

                {signoffModalPhase === 'fase_3_90' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Skor Sidang Final (0-100):</label>
                    <input
                      type="number"
                      value={signoffForm.evaluasiKomprehensif}
                      onChange={(e) => setSignoffForm({ ...signoffForm, evaluasiKomprehensif: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Evaluasi / Komitmen:</label>
                <textarea
                  rows={3}
                  value={signoffForm.catatan}
                  onChange={(e) => setSignoffForm({ ...signoffForm, catatan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Trainer Penilai:</label>
                  <input
                    type="text"
                    value={signoffForm.trainerName}
                    onChange={(e) => setSignoffForm({ ...signoffForm, trainerName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Outlet:</label>
                  <input
                    type="text"
                    value={signoffForm.kepalaOutlet}
                    onChange={(e) => setSignoffForm({ ...signoffForm, kepalaOutlet: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSignoffModalPhase(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveSignoff}
                  className="px-4 py-2 bg-[#A21D21] hover:bg-[#88181b] text-white font-semibold rounded-xl shadow-xs"
                >
                  Tandatangani & Sahkan Milestone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ITEM NOTE MODAL */}
      {itemNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Catatan Khusus Trainer</h3>
              <button onClick={() => setItemNoteModal(null)} className="text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs font-semibold text-slate-700">{itemNoteModal.title}</p>
            <textarea
              rows={3}
              value={itemNoteModal.currentNote}
              onChange={(e) => setItemNoteModal({ ...itemNoteModal, currentNote: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-[#A21D21]"
              placeholder="Tuliskan temuan observasi, sikap, atau aspek yang perlu diasah..."
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => setItemNoteModal(null)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg font-medium text-slate-600"
              >
                Batal
              </button>
              <button
                onClick={handleSaveItemNote}
                className="px-3 py-1.5 bg-[#A21D21] text-white rounded-lg font-semibold hover:bg-[#88181b]"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: WEEKLY NOTE MODAL */}
      {weeklyNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Tambah Evaluasi Mingguan</h3>
              <button onClick={() => setWeeklyNoteModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>
            <div className="text-xs space-y-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Minggu Evaluasi:</label>
                <select
                  value={weeklyNoteForm.week}
                  onChange={(e) => setWeeklyNoteForm({ ...weeklyNoteForm, week: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>
                      Minggu ke-{w} ({w <= 4 ? 'Fase 1' : w <= 8 ? 'Fase 2' : 'Fase 3'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Perkembangan Lapangan:</label>
                <textarea
                  rows={4}
                  value={weeklyNoteForm.catatan}
                  onChange={(e) => setWeeklyNoteForm({ ...weeklyNoteForm, catatan: e.target.value })}
                  placeholder="Deskripsikan perkembangan kecepatan, kepatuhan kebersihan, dan sikap kerja..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => setWeeklyNoteModalOpen(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg font-medium text-slate-600"
              >
                Batal
              </button>
              <button
                onClick={handleAddWeeklyNote}
                className="px-3 py-1.5 bg-[#A21D21] text-white rounded-lg font-semibold hover:bg-[#88181b]"
              >
                Simpan Evaluasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: PRINT PREVIEW DOKUMEN RESMI (A4 PRINTABLE) */}
      {printPreviewOpen && currentCrewProgress && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <div>
                <h2 className="text-base font-bold text-slate-900">Lembar Resmi Onboarding & Verifikasi Stasiun</h2>
                <p className="text-xs text-slate-500">Format cetak arsip operasional gerai PT Hara Chicken Indonesia</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#A21D21] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-[#88181b] shadow-xs"
                >
                  <Printer size={14} /> Cetak Lembar Ini
                </button>
                <button
                  onClick={() => setPrintPreviewOpen(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Official Header */}
            <OfficialDocumentHeader
              title="LEMBAR KONTROL KURIKULUM & ONBOARDING KRU 90 HARI"
              subtitle="Sistem Pelatihan Terstruktur Stasiun Gerai Hara Chicken"
              documentNumber={`HC-ONB-${currentCrewProgress.kode_outlet}-${currentCrewProgress.id.slice(-6).toUpperCase()}`}
            />

            {/* Active Training Method Watermark/Banner */}
            <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-1">
              <div className="flex justify-between items-center font-bold">
                <span className="text-[#A21D21]">METODE PEMBELAJARAN TERPILIH: {activeMethodObj.name}</span>
                <span className="text-slate-600 font-mono">Efisiensi: {activeMethodObj.efficiencyScore}% | Retensi: {activeMethodObj.retentionRate}%</span>
              </div>
              <p className="text-[11px] text-slate-600">
                <strong>Benchmark Ilmiah:</strong> {activeMethodObj.globalBenchmark} | <strong>Aturan Verifikasi:</strong> {activeMethodObj.trainerChecklistRule}
              </p>
            </div>

            {/* Bio Trainee Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs border border-slate-200 p-3 rounded-lg bg-slate-50">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Nama Trainee</span>
                <strong className="text-slate-900">{currentCrewProgress.nama_kru}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Divisi Stasiun</span>
                <strong className="text-slate-900">{currentCrewProgress.divisi}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Kode Outlet</span>
                <strong className="text-slate-900">{currentCrewProgress.kode_outlet}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Status Akhir</span>
                <strong className="text-slate-900">{currentCrewProgress.status}</strong>
              </div>
            </div>

            {/* Milestone Summary Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Ringkasan Capaian Milestone
              </h4>
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 text-left">
                  <tr>
                    <th className="p-2 border-b">Fase</th>
                    <th className="p-2 border-b">Target Waktu</th>
                    <th className="p-2 border-b">Status</th>
                    <th className="p-2 border-b">Hasil Ujian</th>
                    <th className="p-2 border-b">Tanggal Disahkan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 font-semibold">Fase 1: Stasiun Primer</td>
                    <td className="p-2">Hari 1 - 30</td>
                    <td className="p-2">
                      <span className="font-bold text-emerald-700">
                        {currentCrewProgress.signoffs?.fase_1?.status || 'Belum'}
                      </span>
                    </td>
                    <td className="p-2">
                      Teori: {currentCrewProgress.signoffs?.fase_1?.skorTeori || '-'} | Praktik: {currentCrewProgress.signoffs?.fase_1?.skorPraktik || '-'}
                    </td>
                    <td className="p-2">{currentCrewProgress.signoffs?.fase_1?.signedAt || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">Fase 2: Multi-Stasiun</td>
                    <td className="p-2">Hari 31 - 60</td>
                    <td className="p-2">
                      <span className="font-bold text-emerald-700">
                        {currentCrewProgress.signoffs?.fase_2?.status || 'Belum'}
                      </span>
                    </td>
                    <td className="p-2">
                      Lisan: {currentCrewProgress.signoffs?.fase_2?.skorLisan || '-'} | Speed: {currentCrewProgress.signoffs?.fase_2?.speedOfServiceSec ? `${currentCrewProgress.signoffs.fase_2.speedOfServiceSec}s` : '-'}
                    </td>
                    <td className="p-2">{currentCrewProgress.signoffs?.fase_2?.signedAt || '-'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold">Fase 3: Kru Mandiri</td>
                    <td className="p-2">Hari 61 - 90</td>
                    <td className="p-2">
                      <span className="font-bold text-emerald-700">
                        {currentCrewProgress.signoffs?.fase_3?.status || 'Belum'}
                      </span>
                    </td>
                    <td className="p-2">
                      Komprehensif: {currentCrewProgress.signoffs?.fase_3?.evaluasiKomprehensif || '-'} Pts
                    </td>
                    <td className="p-2">{currentCrewProgress.signoffs?.fase_3?.signedAt || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Checklist items list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Verifikasi Butir SOP Stasiun Kerja
              </h4>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {OFFICIAL_ONBOARDING_CURRICULUM.filter(
                  (i) => i.divisi === 'Semua' || i.divisi === currentCrewProgress.divisi
                ).map((item, idx) => {
                  const comp = currentCrewProgress.completed_items.find((c) => c.itemId === item.id);
                  return (
                    <div key={item.id} className="p-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">{idx + 1}.</span>
                        <span className="font-semibold text-slate-800">{item.title}</span>
                        <span className="text-[10px] text-slate-400">({item.sopRef || 'SOP'})</span>
                      </div>
                      <div>
                        {comp ? (
                          <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                            <Check size={12} /> {comp.completedAt}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-[11px]">Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Signatures */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-center text-xs">
              <div>
                <p className="text-slate-500 mb-14">Trainee Bersangkutan,</p>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  ( {currentCrewProgress.nama_kru} )
                </div>
                <div className="text-[10px] text-slate-400">Kru Pelatihan</div>
              </div>
              <div>
                <p className="text-slate-500 mb-14">Trainer Operasional Lapangan,</p>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  ( {currentCrewProgress.trainer_nama} )
                </div>
                <div className="text-[10px] text-slate-400">Fasilitator & Penguji</div>
              </div>
              <div>
                <p className="text-slate-500 mb-14">Mengetahui Kepala Outlet,</p>
                <div className="font-bold text-slate-900 border-t border-slate-300 pt-1">
                  ( {outlets.find((o) => o.kode_outlet === currentCrewProgress.kode_outlet)?.kepala_outlet || 'Kepala Outlet'} )
                </div>
                <div className="text-[10px] text-slate-400">Branch Store Manager</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 30-Day OJT Curriculum Guide Modal */}
      {ojtGuideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-[#FBF9F5] rounded-3xl border border-stone-200 shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6">
            <ProgramOJT30HariView
              selectedOutletCode={selectedOutletCode}
              onBack={() => setOjtGuideModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
