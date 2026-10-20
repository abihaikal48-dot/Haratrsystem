import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench, CheckCircle2, Award, RefreshCw, FileText, ChevronRight,
  Star, AlertTriangle, Play, Pause, RotateCcw, Clock, Thermometer,
  Scale, ShieldAlert, Sparkles, Check, X, Flame, ArrowUpRight,
  Calendar, Users, BookOpen, Layers, Info, CheckSquare, Plus, Trash2,
  Zap, Eye, CheckCheck, BarChart3, TrendingUp
} from 'lucide-react';
import { db } from '../lib/storage';
import { Kru, BankSOP, PenilaianPraktik, Division } from '../types';
import {
  AGENDA_STATION_TASKS,
  DAFTAR_PESERTA_ONBOARDING_TC,
  RUNDOWN_DAY_1,
  RUNDOWN_DAY_2,
  ATURAN_WAKTU_BATCH,
  TrainingStationTask
} from '../data/trainingCenterData';
import { OnboardingAnalyticsDashboard } from './OnboardingAnalyticsDashboard';

export interface ActiveEvaluationSlot {
  slotId: string;
  stationName: 'Station 1' | 'Station 2' | 'Station 3' | 'All Crew' | string;
  taskId: string;
  task: TrainingStationTask;
  kruNama: string;
  kruOutlet: string;
  stopwatchSeconds: number;
  stopwatchRunning: boolean;
  stepScores: Record<number, number>;
  actualTemp: number;
  actualGrams: number;
  catatan: string;
  isSaved: boolean;
  savedScore: number | null;
}

export const PenilaianPraktikView: React.FC<{ selectedOutletCode: string }> = ({ selectedOutletCode }) => {
  const [activeMainTab, setActiveMainTab] = useState<'multi_eval' | 'analytics_charts'>('multi_eval');

  const [kruList, setKruList] = useState<Kru[]>(() => {
    try {
      return db.getTable<Kru>('kru').filter((k) => k && k.status_aktif === 'Aktif');
    } catch {
      return [];
    }
  });

  const [sopList, setSopList] = useState<BankSOP[]>(() => {
    try {
      return db.getTable<BankSOP>('bank_sop').filter((s) => s && s.status_aktif === 'Aktif');
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<PenilaianPraktik[]>(() => {
    try {
      return db.getTable<PenilaianPraktik>('penilaian_praktik').filter(Boolean);
    } catch {
      return [];
    }
  });

  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState<1 | 2>(1);

  // ========================================================
  // MULTI-STATION SIMULTANEOUS EVALUATION SLOTS
  // ========================================================
  const createDefaultSlots = (): ActiveEvaluationSlot[] => [
    {
      slotId: 'slot-st1-nasi',
      stationName: 'Station 1',
      taskId: 'd1-st1-nasi',
      task: AGENDA_STATION_TASKS.find((t) => t.id === 'd1-st1-nasi') || AGENDA_STATION_TASKS[0],
      kruNama: DAFTAR_PESERTA_ONBOARDING_TC[0]?.nama || 'Iqbal Muzzaki',
      kruOutlet: DAFTAR_PESERTA_ONBOARDING_TC[0]?.outlet || 'Imogiri Barat',
      stopwatchSeconds: 0,
      stopwatchRunning: false,
      stepScores: { 0: 2, 1: 2, 2: 2, 3: 2, 4: 2 },
      actualTemp: 160,
      actualGrams: 120,
      catatan: '',
      isSaved: false,
      savedScore: null,
    },
    {
      slotId: 'slot-st2-ayam',
      stationName: 'Station 2',
      taskId: 'd1-st2-goreng-ayam',
      task: AGENDA_STATION_TASKS.find((t) => t.id === 'd1-st2-goreng-ayam') || AGENDA_STATION_TASKS[6],
      kruNama: DAFTAR_PESERTA_ONBOARDING_TC[1]?.nama || 'Dhimas Eka Ramadhani',
      kruOutlet: DAFTAR_PESERTA_ONBOARDING_TC[1]?.outlet || 'Purworejo',
      stopwatchSeconds: 0,
      stopwatchRunning: false,
      stepScores: { 0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2 },
      actualTemp: 160,
      actualGrams: 120,
      catatan: '',
      isSaved: false,
      savedScore: null,
    },
    {
      slotId: 'slot-st3-terong',
      stationName: 'Station 3',
      taskId: 'd1-st3-terong',
      task: AGENDA_STATION_TASKS.find((t) => t.id === 'd1-st3-terong') || AGENDA_STATION_TASKS[14],
      kruNama: DAFTAR_PESERTA_ONBOARDING_TC[7]?.nama || 'Karima Syakinata Fiddini',
      kruOutlet: DAFTAR_PESERTA_ONBOARDING_TC[7]?.outlet || 'Parakan',
      stopwatchSeconds: 0,
      stopwatchRunning: false,
      stepScores: { 0: 2, 1: 2, 2: 2, 3: 2 },
      actualTemp: 160,
      actualGrams: 120,
      catatan: '',
      isSaved: false,
      savedScore: null,
    },
  ];

  const [multiSlots, setMultiSlots] = useState<ActiveEvaluationSlot[]>(createDefaultSlots);

  // Single Master Timer Interval for All Active Running Slots
  useEffect(() => {
    const hasRunning = multiSlots.some((s) => s.stopwatchRunning && !s.isSaved);
    if (!hasRunning) return;

    const timer = setInterval(() => {
      setMultiSlots((prev) =>
        prev.map((slot) => {
          if (!slot.stopwatchRunning || slot.isSaved) return slot;
          return { ...slot, stopwatchSeconds: slot.stopwatchSeconds + 1 };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [multiSlots]);

  // Master Batch Controls
  const startAllStopwatches = () => {
    setMultiSlots((prev) =>
      prev.map((s) => (s.isSaved ? s : { ...s, stopwatchRunning: true }))
    );
  };

  const pauseAllStopwatches = () => {
    setMultiSlots((prev) =>
      prev.map((s) => ({ ...s, stopwatchRunning: false }))
    );
  };

  const resetAllStopwatches = () => {
    setMultiSlots((prev) =>
      prev.map((s) => (s.isSaved ? s : { ...s, stopwatchSeconds: 0, stopwatchRunning: false }))
    );
  };

  // Add new evaluation slot
  const addNewSlot = (task?: TrainingStationTask) => {
    const pickedTask = task || AGENDA_STATION_TASKS[multiSlots.length % AGENDA_STATION_TASKS.length];
    const unusedKru = DAFTAR_PESERTA_ONBOARDING_TC.find(
      (tc) => !multiSlots.some((s) => s.kruNama === tc.nama)
    ) || DAFTAR_PESERTA_ONBOARDING_TC[0];

    const newSlot: ActiveEvaluationSlot = {
      slotId: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      stationName: pickedTask.station,
      taskId: pickedTask.id,
      task: pickedTask,
      kruNama: unusedKru?.nama || 'Peserta Onboarding',
      kruOutlet: unusedKru?.outlet || 'Outlet HARA',
      stopwatchSeconds: 0,
      stopwatchRunning: false,
      stepScores: {},
      actualTemp: 160,
      actualGrams: 120,
      catatan: '',
      isSaved: false,
      savedScore: null,
    };

    setMultiSlots((prev) => [...prev, newSlot]);
  };

  // Remove slot
  const removeSlot = (slotId: string) => {
    if (multiSlots.length <= 1) {
      alert('Minimal harus ada 1 slot stasiun penilaian yang aktif.');
      return;
    }
    setMultiSlots((prev) => prev.filter((s) => s.slotId !== slotId));
  };

  // Update specific slot state
  const updateSlot = (slotId: string, updates: Partial<ActiveEvaluationSlot>) => {
    setMultiSlots((prev) =>
      prev.map((slot) => (slot.slotId === slotId ? { ...slot, ...updates } : slot))
    );
  };

  // Preset batch loaders
  const loadBatchPreset = (type: 'day1-batch1' | 'day1-batch2' | 'day2-batch1') => {
    if (type === 'day1-batch1') {
      const st1 = AGENDA_STATION_TASKS.find((t) => t.id === 'd1-st1-nasi')!;
      const st2 = AGENDA_STATION_TASKS.find((t) => t.id === 'd1-st2-goreng-ayam')!;
      const st3 = AGENDA_STATION_TASKS.find((t) => t.id === 'd1-st3-terong')!;
      setMultiSlots([
        {
          slotId: 'slot-d1b1-st1',
          stationName: 'Station 1',
          taskId: st1.id,
          task: st1,
          kruNama: DAFTAR_PESERTA_ONBOARDING_TC[0].nama,
          kruOutlet: DAFTAR_PESERTA_ONBOARDING_TC[0].outlet,
          stopwatchSeconds: 0,
          stopwatchRunning: false,
          stepScores: { 0: 2, 1: 2, 2: 2, 3: 2, 4: 2 },
          actualTemp: 160,
          actualGrams: 120,
          catatan: '',
          isSaved: false,
          savedScore: null,
        },
        {
          slotId: 'slot-d1b1-st2',
          stationName: 'Station 2',
          taskId: st2.id,
          task: st2,
          kruNama: DAFTAR_PESERTA_ONBOARDING_TC[1].nama,
          kruOutlet: DAFTAR_PESERTA_ONBOARDING_TC[1].outlet,
          stopwatchSeconds: 0,
          stopwatchRunning: false,
          stepScores: { 0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2 },
          actualTemp: 160,
          actualGrams: 120,
          catatan: '',
          isSaved: false,
          savedScore: null,
        },
        {
          slotId: 'slot-d1b1-st3',
          stationName: 'Station 3',
          taskId: st3.id,
          task: st3,
          kruNama: DAFTAR_PESERTA_ONBOARDING_TC[7].nama,
          kruOutlet: DAFTAR_PESERTA_ONBOARDING_TC[7].outlet,
          stopwatchSeconds: 0,
          stopwatchRunning: false,
          stepScores: { 0: 2, 1: 2, 2: 2, 3: 2 },
          actualTemp: 160,
          actualGrams: 120,
          catatan: '',
          isSaved: false,
          savedScore: null,
        },
      ]);
    } else if (type === 'day1-batch2') {
      const st1 = AGENDA_STATION_TASKS.find((t) => t.id === 'd1-st1-geprek-ori')!;
      const st2 = AGENDA_STATION_TASKS.find((t) => t.id === 'd1-st2-scramble')!;
      const st3 = AGENDA_STATION_TASKS.find((t) => t.id === 'd1-st3-nasgor-geprek')!;
      setMultiSlots([
        {
          slotId: 'slot-d1b2-st1',
          stationName: 'Station 1',
          taskId: st1.id,
          task: st1,
          kruNama: DAFTAR_PESERTA_ONBOARDING_TC[3].nama,
          kruOutlet: DAFTAR_PESERTA_ONBOARDING_TC[3].outlet,
          stopwatchSeconds: 0,
          stopwatchRunning: false,
          stepScores: { 0: 2, 1: 2, 2: 2, 3: 2 },
          actualTemp: 160,
          actualGrams: 120,
          catatan: '',
          isSaved: false,
          savedScore: null,
        },
        {
          slotId: 'slot-d1b2-st2',
          stationName: 'Station 2',
          taskId: st2.id,
          task: st2,
          kruNama: DAFTAR_PESERTA_ONBOARDING_TC[4].nama,
          kruOutlet: DAFTAR_PESERTA_ONBOARDING_TC[4].outlet,
          stopwatchSeconds: 0,
          stopwatchRunning: false,
          stepScores: { 0: 2, 1: 2, 2: 2 },
          actualTemp: 160,
          actualGrams: 120,
          catatan: '',
          isSaved: false,
          savedScore: null,
        },
        {
          slotId: 'slot-d1b2-st3',
          stationName: 'Station 3',
          taskId: st3.id,
          task: st3,
          kruNama: DAFTAR_PESERTA_ONBOARDING_TC[5].nama,
          kruOutlet: DAFTAR_PESERTA_ONBOARDING_TC[5].outlet,
          stopwatchSeconds: 0,
          stopwatchRunning: false,
          stepScores: { 0: 2, 1: 2, 2: 2, 3: 2 },
          actualTemp: 160,
          actualGrams: 120,
          catatan: '',
          isSaved: false,
          savedScore: null,
        },
      ]);
    } else if (type === 'day2-batch1') {
      const st1 = AGENDA_STATION_TASKS.find((t) => t.id === 'd2-st1-nasi-45')!;
      const st2 = AGENDA_STATION_TASKS.find((t) => t.id === 'd2-st2-teh-8lt')!;
      const st3 = AGENDA_STATION_TASKS.find((t) => t.id === 'd2-all-jamur-kentang')!;
      setMultiSlots([
        {
          slotId: 'slot-d2b1-st1',
          stationName: 'Station 1',
          taskId: st1.id,
          task: st1,
          kruNama: DAFTAR_PESERTA_ONBOARDING_TC[9].nama,
          kruOutlet: DAFTAR_PESERTA_ONBOARDING_TC[9].outlet,
          stopwatchSeconds: 0,
          stopwatchRunning: false,
          stepScores: { 0: 2, 1: 2, 2: 2, 3: 2 },
          actualTemp: 160,
          actualGrams: 120,
          catatan: '',
          isSaved: false,
          savedScore: null,
        },
        {
          slotId: 'slot-d2b1-st2',
          stationName: 'Station 2',
          taskId: st2.id,
          task: st2,
          kruNama: DAFTAR_PESERTA_ONBOARDING_TC[10].nama,
          kruOutlet: DAFTAR_PESERTA_ONBOARDING_TC[10].outlet,
          stopwatchSeconds: 0,
          stopwatchRunning: false,
          stepScores: { 0: 2, 1: 2, 2: 2 },
          actualTemp: 160,
          actualGrams: 120,
          catatan: '',
          isSaved: false,
          savedScore: null,
        },
        {
          slotId: 'slot-d2b1-st3',
          stationName: 'All Crew',
          taskId: st3.id,
          task: st3,
          kruNama: DAFTAR_PESERTA_ONBOARDING_TC[11].nama,
          kruOutlet: DAFTAR_PESERTA_ONBOARDING_TC[11].outlet,
          stopwatchSeconds: 0,
          stopwatchRunning: false,
          stepScores: { 0: 2, 1: 2, 2: 2 },
          actualTemp: 165,
          actualGrams: 120,
          catatan: '',
          isSaved: false,
          savedScore: null,
        },
      ]);
    }
  };

  // Calculate final score for a slot
  const calculateSlotScore = (slot: ActiveEvaluationSlot): number => {
    const steps = slot.task.langkah_ringkas || [
      'Persiapan alat, higienitas & area kerja',
      'Kepatuhan takaran & resep resmi HARA',
      'Ketepatan timer & penanganan produk',
      'Kebersihan, kerapian saji & sanitasi akhir'
    ];
    let totalScoreObtained = 0;
    const maxScorePossible = steps.length * 3;

    for (let i = 0; i < steps.length; i++) {
      const s = slot.stepScores[i] ?? 2;
      totalScoreObtained += s;
    }

    let finalPercent = Math.round((totalScoreObtained / maxScorePossible) * 100);

    // SOS Time Adjustment (Bertoleransi wajar, tidak kaku)
    if (slot.stopwatchSeconds > 0) {
      if (slot.stopwatchSeconds > slot.task.max_toleransi_detik + 60) {
        finalPercent = Math.max(0, finalPercent - 5);
      } else if (
        slot.stopwatchSeconds >= slot.task.min_toleransi_detik &&
        slot.stopwatchSeconds <= slot.task.max_toleransi_detik
      ) {
        finalPercent = Math.min(100, finalPercent + 3);
      }
    }

    // Suhu Kondisional: HANYA jika DEEP FRYER
    if (slot.task.is_deep_fryer) {
      if (slot.actualTemp < 150 || slot.actualTemp > 185) {
        finalPercent = Math.max(0, finalPercent - 10);
      }
    }

    return finalPercent;
  };

  // Save single slot evaluation to DB
  const saveSlotEvaluation = (slotId: string) => {
    const slot = multiSlots.find((s) => s.slotId === slotId);
    if (!slot) return;
    if (!slot.kruNama) {
      alert('Pilih nama kru yang diuji terlebih dahulu!');
      return;
    }

    const finalPercent = calculateSlotScore(slot);
    const kruObj = kruList.find((k) => k.nama_kru === slot.kruNama);
    const resolvedOutletCode = kruObj?.kode_outlet || (selectedOutletCode !== 'ALL' ? selectedOutletCode : 'HC-IMG01');

    const steps = slot.task.langkah_ringkas || [];
    const scoresArr = steps.map((_, idx) => slot.stepScores[idx] ?? 2);

    db.insertRow<PenilaianPraktik>('penilaian_praktik', {
      tanggal: new Date().toISOString(),
      nama_kru: slot.kruNama,
      kru_id: kruObj?.id,
      kode_outlet: resolvedOutletCode,
      sop_terkait: `${slot.task.nama_tugas} (${slot.task.station} D${slot.task.day})`,
      detail_skor_langkah: scoresArr,
      waktu_detik: slot.stopwatchSeconds || slot.task.durasi_detik,
      target_detik: slot.task.durasi_detik,
      suhu_minyak: slot.task.is_deep_fryer ? slot.actualTemp : undefined,
      gramatur: !slot.task.is_bebas_timbangan && !slot.task.is_nasi_cup ? slot.actualGrams : undefined,
      skor_akhir: finalPercent,
      catatan: slot.catatan || `Uji Simultan Batch TC: ${slot.task.station} - ${slot.task.nama_tugas}. Waktu SOS: ${formatTime(slot.stopwatchSeconds || slot.task.durasi_detik)} (Target: ${slot.task.toleransi_waktu_label}), ${slot.task.is_deep_fryer ? `Deep Fryer Suhu: ${slot.actualTemp}°C` : 'Bebas Suhu 160°C (Non-Deepfryer)'}, ${slot.task.is_nasi_cup ? 'Rasio Cup Miyako 4:5 Tanpa Timbang Gram' : slot.task.is_bebas_timbangan ? 'Bebas Timbangan' : `Gramatur: ${slot.actualGrams}g`}. Skor: ${finalPercent}/100`,
    });

    if (finalPercent < 75) {
      db.triggerAutoRemedialAndTNA({
        kru_id: kruObj?.id,
        nama_kru: slot.kruNama,
        kode_outlet: resolvedOutletCode,
        divisi: slot.task.divisi_terkait || 'Kitchen',
        skor: finalPercent,
        topikSalah: [slot.task.nama_tugas],
        sumberTemuan: `Uji Praktik Simultan (${slot.task.nama_tugas} - Skor ${finalPercent}/100)`,
        catatan: `Praktik di bawah KKM 75. Perlu bimbingan langkah teknis ${slot.task.station}.`,
      });
    }

    updateSlot(slotId, { isSaved: true, savedScore: finalPercent, stopwatchRunning: false });
    loadData();
  };

  // Save all active slots simultaneously
  const saveAllActiveSlots = () => {
    const unsaved = multiSlots.filter((s) => !s.isSaved);
    if (unsaved.length === 0) {
      alert('Semua slot stasiun telah tersimpan sebelumnya.');
      return;
    }

    let savedCount = 0;
    unsaved.forEach((slot) => {
      saveSlotEvaluation(slot.slotId);
      savedCount++;
    });

    alert(`Berhasil menyimpan ${savedCount} hasil penilaian praktik stasiun secara bersamaan ke rekam medis kru!`);
  };

  // Quick fill all steps in a slot with 3 (Sempurna) or 2 (Standar)
  const quickFillSteps = (slotId: string, val: number) => {
    const slot = multiSlots.find((s) => s.slotId === slotId);
    if (!slot || slot.isSaved) return;

    const steps = slot.task.langkah_ringkas || [];
    const nextScores: Record<number, number> = {};
    steps.forEach((_, idx) => {
      nextScores[idx] = val;
    });

    updateSlot(slotId, { stepScores: nextScores });
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const loadData = () => {
    setKruList(db.getTable<Kru>('kru').filter((k) => k && k.status_aktif === 'Aktif'));
    setSopList(db.getTable<BankSOP>('bank_sop').filter((s) => s && s.status_aktif === 'Aktif'));
    setHistory(db.getTable<PenilaianPraktik>('penilaian_praktik').filter(Boolean));
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, []);

  const activeKruList = selectedOutletCode === 'ALL'
    ? kruList
    : kruList.filter((k) => k.kode_outlet === selectedOutletCode);

  const runningCount = multiSlots.filter((s) => s.stopwatchRunning && !s.isSaved).length;
  const savedCount = multiSlots.filter((s) => s.isSaved).length;

  return (
    <div className="space-y-6">
      {/* Top Main Navigation: Multi-Penilaian Simultan vs Dashboard Grafik */}
      <div className="flex items-center justify-between p-2 bg-slate-100 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMainTab('multi_eval')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeMainTab === 'multi_eval'
                ? 'bg-[#96171B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Zap size={15} />
            <span>⚡ Multi-Penilaian Simultan (Stasiun Bersamaan)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('analytics_charts')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeMainTab === 'analytics_charts'
                ? 'bg-[#96171B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 size={15} />
            <span>📊 Dashboard Analitik & Rapor Grafik Lengkap</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAgendaModal(true)}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <Calendar size={13} className="text-[#96171B]" />
          <span>Agenda Fisik TC</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: MULTI-PENILAIAN SIMULTAN STASIUN BERSAMAAN       */}
      {/* ======================================================== */}
      {activeMainTab === 'multi_eval' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-stone-900 to-slate-950 text-white rounded-3xl shadow-md border border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider">
                  <Zap size={12} className="text-amber-400" />
                  <span>SOP RESMI HARA • PRODUK MANDIRI & SUHU DEEP FRYER 160°C</span>
                </div>
                <h2 className="text-xl font-black tracking-tight">
                  Penilaian Praktik Bersamaan (Multi-Station Simultan)
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Menilai beberapa stasiun kerja sekaligus secara bersamaan (Station 1 Nasi & Teh, Station 2 Goreng Ayam & Scramble, Station 3 Terong & Sambal) dengan stopwatch mandiri, produk terpisah murni sesuai SOP, dan suhu 160°C hanya untuk deep fryer.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setMultiSlots(createDefaultSlots())}
                  className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Reset Slot</span>
                </button>
              </div>
            </div>
          </div>

          {/* Master Batch Control Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[#96171B]" />
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Konsol Pengendali Batch Simultan ({multiSlots.length} Stasiun Aktif)
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    {runningCount} Stopwatch Berjalan • {savedCount} Tersimpan
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons for Batches */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 mr-1 hidden md:inline">Preset Batch:</span>
                <button
                  type="button"
                  onClick={() => loadBatchPreset('day1-batch1')}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                >
                  Day 1: Nasi + Ayam + Terong
                </button>
                <button
                  type="button"
                  onClick={() => loadBatchPreset('day1-batch2')}
                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                >
                  Day 1: Geprek Ori + Scramble + Nasgor
                </button>
                <button
                  type="button"
                  onClick={() => loadBatchPreset('day2-batch1')}
                  className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                >
                  Day 2: Nasi 45m + Teh 8L + Jamur
                </button>
              </div>
            </div>

            {/* Global Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={startAllStopwatches}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Play size={13} />
                  <span>Mulai Semua Timer</span>
                </button>

                <button
                  type="button"
                  onClick={pauseAllStopwatches}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Pause size={13} />
                  <span>Jeda Semua</span>
                </button>

                <button
                  type="button"
                  onClick={resetAllStopwatches}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Reset Semua Timer</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addNewSlot()}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Plus size={14} className="text-[#96171B]" />
                  <span>Tambah Stasiun</span>
                </button>

                <button
                  type="button"
                  onClick={saveAllActiveSlots}
                  className="px-4 py-2 bg-[#96171B] hover:bg-[#801216] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md shadow-[#96171B]/20 cursor-pointer active:scale-95"
                >
                  <CheckCheck size={14} />
                  <span>Simpan Semua Stasiun</span>
                </button>
              </div>
            </div>
          </div>

          {/* Multi-Station Evaluation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {multiSlots.map((slot, sIdx) => {
              const finalScore = calculateSlotScore(slot);
              const isDeepFryer = slot.task.is_deep_fryer === true;
              const isNasi = slot.task.is_nasi_cup === true;

              return (
                <div
                  key={slot.slotId}
                  className={`bg-white rounded-3xl border transition-all shadow-xs flex flex-col justify-between overflow-hidden ${
                    slot.isSaved
                      ? 'border-emerald-300 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                      : slot.stopwatchRunning
                      ? 'border-[#96171B] ring-2 ring-[#96171B]/15'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wide ${
                        slot.stationName === 'Station 1' ? 'bg-blue-100 text-blue-900 border border-blue-200' :
                        slot.stationName === 'Station 2' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                        slot.stationName === 'Station 3' ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                        'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}>
                        {slot.stationName} (D{slot.task.day})
                      </span>

                      <span className="text-xs font-black text-slate-800">
                        Slot #{sIdx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {slot.isSaved && (
                        <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check size={10} />
                          <span>Tersimpan {slot.savedScore}</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeSlot(slot.slotId)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        title="Hapus slot stasiun ini"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-4 flex-1">
                    {/* Task & Kru Selectors */}
                    <div className="space-y-2">
                      {/* Task Selector */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                          Tugas Stasiun (SOP Mandiri Resmi):
                        </label>
                        <select
                          value={slot.taskId}
                          disabled={slot.isSaved}
                          onChange={(e) => {
                            const newTask = AGENDA_STATION_TASKS.find((t) => t.id === e.target.value);
                            if (newTask) {
                              updateSlot(slot.slotId, {
                                taskId: newTask.id,
                                task: newTask,
                                stationName: newTask.station,
                                stopwatchSeconds: 0,
                                stopwatchRunning: false,
                                stepScores: {},
                              });
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
                        >
                          <optgroup label="📋 Station 1">
                            {AGENDA_STATION_TASKS.filter((t) => t.station === 'Station 1').map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.nama_tugas} ({t.durasi_menit} mnt) - D{t.day}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="📋 Station 2">
                            {AGENDA_STATION_TASKS.filter((t) => t.station === 'Station 2').map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.nama_tugas} ({t.durasi_menit} mnt) - D{t.day}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="📋 Station 3 & All Crew">
                            {AGENDA_STATION_TASKS.filter((t) => t.station === 'Station 3' || t.station === 'All Crew').map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.nama_tugas} ({t.durasi_menit} mnt) - D{t.day}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      {/* Kru Selector */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                          Kru yang Diuji Praktik:
                        </label>
                        <select
                          value={slot.kruNama}
                          disabled={slot.isSaved}
                          onChange={(e) => {
                            const tc = DAFTAR_PESERTA_ONBOARDING_TC.find((t) => t.nama === e.target.value);
                            updateSlot(slot.slotId, {
                              kruNama: e.target.value,
                              kruOutlet: tc?.outlet || 'Outlet HARA',
                            });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
                        >
                          <optgroup label="📋 12 Kru Onboarding Training Center Resmi">
                            {DAFTAR_PESERTA_ONBOARDING_TC.map((tc) => (
                              <option key={tc.no} value={tc.nama}>
                                #{tc.no} {tc.nama} ({tc.outlet} • {tc.divisi})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="🏢 Kru Cabang Lainnya">
                            {activeKruList
                              .filter((k) => !DAFTAR_PESERTA_ONBOARDING_TC.some((t) => t.nama.toLowerCase() === k.nama_kru.toLowerCase()))
                              .map((k) => (
                                <option key={k.id} value={k.nama_kru}>
                                  {k.nama_kru} ({k.kode_outlet} • {k.divisi})
                                </option>
                              ))}
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {/* Independent Stopwatch for this Slot */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Clock size={13} className="text-[#96171B]" />
                          <span>SOS Stopwatch</span>
                        </div>
                        <span className="font-mono text-[10px] font-semibold text-slate-500">
                          Target: {slot.task.durasi_menit} mnt
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="text-3xl font-mono font-black text-slate-900 tracking-tight">
                          {formatTime(slot.stopwatchSeconds)}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!slot.stopwatchRunning ? (
                            <button
                              type="button"
                              disabled={slot.isSaved}
                              onClick={() => updateSlot(slot.slotId, { stopwatchRunning: true })}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              <Play size={12} />
                              <span>Mulai</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateSlot(slot.slotId, { stopwatchRunning: false })}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                            >
                              <Pause size={12} />
                              <span>Jeda</span>
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={slot.isSaved}
                            onClick={() => updateSlot(slot.slotId, { stopwatchSeconds: 0, stopwatchRunning: false })}
                            className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl cursor-pointer disabled:opacity-50"
                            title="Reset Timer Slot Ini"
                          >
                            <RotateCcw size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 flex items-center justify-between font-medium">
                        <span>Toleransi: {slot.task.toleransi_waktu_label}</span>
                        <span className={`px-1.5 py-0.5 rounded font-bold ${
                          slot.stopwatchSeconds === 0
                            ? 'text-slate-400 bg-white'
                            : slot.stopwatchSeconds >= slot.task.min_toleransi_detik && slot.stopwatchSeconds <= slot.task.max_toleransi_detik
                            ? 'text-emerald-700 bg-emerald-100'
                            : slot.stopwatchSeconds < slot.task.min_toleransi_detik
                            ? 'text-blue-700 bg-blue-100'
                            : 'text-amber-700 bg-amber-100'
                        }`}>
                          {slot.stopwatchSeconds === 0 ? 'Siap' : slot.stopwatchSeconds >= slot.task.min_toleransi_detik && slot.stopwatchSeconds <= slot.task.max_toleransi_detik ? 'Ideal' : slot.stopwatchSeconds < slot.task.min_toleransi_detik ? 'Cepat' : 'Toleransi'}
                        </span>
                      </div>
                    </div>

                    {/* Adaptive Instrument: Suhu HANYA untuk Deep Fryer */}
                    <div className="text-xs">
                      {isNasi ? (
                        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 space-y-1">
                          <div className="flex items-center gap-1 font-bold text-[11px] text-blue-900">
                            <Sparkles size={12} />
                            <span>Rasio Cup Miyako & Centong Saji (Non-Gram)</span>
                          </div>
                          <div className="text-[10.5px] text-blue-800 leading-snug">
                            Takar 4 cup beras : 5 cup air baku. Sajikan 1 centong porsi penuh bulat rapi tanpa timbang gram di meja saji.
                          </div>
                        </div>
                      ) : isDeepFryer ? (
                        <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-orange-900">
                            <div className="flex items-center gap-1">
                              <Thermometer size={12} />
                              <span>Suhu Deep Fryer (160°C):</span>
                            </div>
                            <span className="font-mono text-xs font-black">{slot.actualTemp}°C</span>
                          </div>
                          <input
                            type="range"
                            min="140"
                            max="185"
                            value={slot.actualTemp}
                            disabled={slot.isSaved}
                            onChange={(e) => updateSlot(slot.slotId, { actualTemp: Number(e.target.value) })}
                            className="w-full accent-orange-600 h-1.5 bg-orange-200 rounded cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-orange-700">
                            <span>140°C</span>
                            <span className="font-bold">160°C (Deep Fryer Standar)</span>
                            <span>185°C</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10.5px] text-slate-500 flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          <span>
                            {slot.task.id === 'd1-st2-scramble'
                              ? 'Wajan Dadar Telur Mandiri • Bebas Suhu 160°C (Non-Deepfryer)'
                              : slot.task.id === 'd1-st2-indomie'
                              ? 'Panci Rebus Mie Mandiri • Bebas Suhu 160°C (Non-Deepfryer)'
                              : 'Station Non-Deepfryer • Bebas Probe Termometer 160°C'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Step Scoring Rubric */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>Langkah SOP Murni:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={slot.isSaved}
                            onClick={() => quickFillSteps(slot.slotId, 3)}
                            className="text-[10px] text-emerald-700 hover:underline cursor-pointer disabled:opacity-50"
                          >
                            All 3 (Sempurna)
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            disabled={slot.isSaved}
                            onClick={() => quickFillSteps(slot.slotId, 2)}
                            className="text-[10px] text-blue-700 hover:underline cursor-pointer disabled:opacity-50"
                          >
                            All 2 (Standar)
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {(slot.task.langkah_ringkas || [
                          'Persiapan alat & sanitasi higienis',
                          'Kepatuhan takaran & resep baku',
                          'Ketepatan timer operasional',
                          'Kerapian penyajian akhir'
                        ]).map((step, idx) => {
                          const curVal = slot.stepScores[idx] ?? 2;
                          return (
                            <div
                              key={idx}
                              className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 text-[11px]"
                            >
                              <span className="truncate text-slate-700 leading-tight">
                                {idx + 1}. {step}
                              </span>

                              <div className="flex items-center gap-1 shrink-0">
                                {[1, 2, 3].map((val) => (
                                  <button
                                    key={val}
                                    type="button"
                                    disabled={slot.isSaved}
                                    onClick={() => {
                                      const next = { ...slot.stepScores, [idx]: val };
                                      updateSlot(slot.slotId, { stepScores: next });
                                    }}
                                    className={`w-6 h-6 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center justify-center ${
                                      curVal === val
                                        ? val === 3
                                          ? 'bg-emerald-600 text-white'
                                          : val === 2
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-red-600 text-white'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                    } ${slot.isSaved ? 'opacity-70 cursor-not-allowed' : ''}`}
                                  >
                                    {val}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Score Summary & Save Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Estimasi Skor</div>
                        <div className="text-lg font-black text-slate-900 leading-tight">
                          {slot.isSaved ? slot.savedScore : finalScore}
                          <span className="text-xs font-normal text-slate-500">/100</span>
                        </div>
                      </div>

                      {!slot.isSaved ? (
                        <button
                          type="button"
                          onClick={() => saveSlotEvaluation(slot.slotId)}
                          className="px-3.5 py-2 bg-[#96171B] hover:bg-[#801216] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs active:scale-95"
                        >
                          <CheckCircle2 size={13} />
                          <span>Simpan Slot Ini</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateSlot(slot.slotId, { isSaved: false, savedScore: null })}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Ubah Penilaian
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Add Custom Station Floating Action */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Sparkles size={16} className="text-[#96171B]" />
              <span>
                Ingin menambah stasiun lain? Klik tombol untuk menambahkan slot evaluasi stasiun simultan baru.
              </span>
            </div>

            <button
              type="button"
              onClick={() => addNewSlot()}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
            >
              <Plus size={14} />
              <span>+ Tambah Stasiun Evaluasi Baru</span>
            </button>
          </div>

          {/* Recent History Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-[#96171B]" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Riwayat Rekam Evaluasi Praktik Terakhir
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {history.length} Sesi Praktik Tersimpan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Nama Kru</th>
                    <th className="py-2.5 px-3">Tugas / Stasiun SOP</th>
                    <th className="py-2.5 px-3">Waktu SOS</th>
                    <th className="py-2.5 px-3">Suhu Minyak</th>
                    <th className="py-2.5 px-3 text-right">Skor Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {history.slice(0, 10).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-slate-500">
                        {new Date(item.tanggal).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.nama_kru}</td>
                      <td className="py-2.5 px-3">{item.sop_terkait}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {item.waktu_detik ? `${item.waktu_detik}s` : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {item.suhu_minyak ? `${item.suhu_minyak}°C` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          item.skor_akhir >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.skor_akhir >= 65
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.skor_akhir}/100
                        </span>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Belum ada riwayat uji praktik yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: DASHBOARD ANALITIK & RAPOR GRAFIK LENGKAP        */}
      {/* ======================================================== */}
      {activeMainTab === 'analytics_charts' && (
        <OnboardingAnalyticsDashboard
          onSelectKruForEvaluation={(kruNama) => {
            const unusedSlot = multiSlots[0];
            if (unusedSlot) {
              updateSlot(unusedSlot.slotId, { kruNama });
            }
            setActiveMainTab('multi_eval');
          }}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL AGENDA LENGKAP TRAINING CENTER (DAY 1 & DAY 2)     */}
      {/* ======================================================== */}
      {showAgendaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 to-stone-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    AGENDA TRAINING • TRAINING CENTER HARA CHICKEN
                  </h3>
                  <p className="text-xs text-slate-300">
                    Pembagian Station Peserta Day 1 & Day 2, Susunan Rundown, dan 12 Peserta Kru Onboarding
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAgendaModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Subnav */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDayTab(1)}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    selectedDayTab === 1
                      ? 'bg-[#96171B] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  📅 Rundown & Station Day 1
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDayTab(2)}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                    selectedDayTab === 2
                      ? 'bg-[#96171B] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  📅 Rundown & Station Day 2
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600">
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Batch 1: 40 Menit
                </span>
                <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  Batch 2: 30 - 40 Menit
                </span>
                <span className="font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                  Bersih: 30 - 40 Menit
                </span>
              </div>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Batch Rules Notice */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                <Info size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong>Aturan Waktu Training Center Resmi:</strong>
                  <p className="leading-relaxed">
                    {ATURAN_WAKTU_BATCH.catatan}
                  </p>
                </div>
              </div>

              {/* Station Tasks Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Layers size={14} className="text-[#96171B]" />
                    <span>Pembagian Station Peserta Day {selectedDayTab}</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Klik "+ Tambah ke Grid Simultan" untuk membuka slot penilaian langsung
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Station 1 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-black text-xs text-blue-900 uppercase">Station 1</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                        {selectedDayTab === 1 ? 'Nasi & Sup' : 'Nasi & Kulit'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {AGENDA_STATION_TASKS.filter((t) => t.day === selectedDayTab && t.station === 'Station 1').map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#96171B] transition-all flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-900">{t.nama_tugas}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{t.durasi_menit} Menit • {t.is_deep_fryer ? 'Deep Fryer 160°C' : 'Non-Deepfryer'}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              addNewSlot(t);
                              setShowAgendaModal(false);
                            }}
                            className="px-2.5 py-1 bg-[#96171B] hover:bg-[#801216] text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            + Slot
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Station 2 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-black text-xs text-amber-900 uppercase">Station 2</span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        {selectedDayTab === 1 ? 'Goreng Ayam & Scramble' : 'Teh & Sambal'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {AGENDA_STATION_TASKS.filter((t) => t.day === selectedDayTab && t.station === 'Station 2').map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#96171B] transition-all flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-900">{t.nama_tugas}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{t.durasi_menit} Menit • {t.is_deep_fryer ? 'Deep Fryer 160°C' : 'Non-Deepfryer'}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              addNewSlot(t);
                              setShowAgendaModal(false);
                            }}
                            className="px-2.5 py-1 bg-[#96171B] hover:bg-[#801216] text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            + Slot
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Station 3 / All Crew */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-black text-xs text-purple-900 uppercase">
                        {selectedDayTab === 1 ? 'Station 3' : 'Station 3 & All Crew'}
                      </span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        {selectedDayTab === 1 ? 'Terong & Sambal' : 'Ayam, Jamur, Kentang'}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {AGENDA_STATION_TASKS.filter((t) => t.day === selectedDayTab && (t.station === 'Station 3' || t.station === 'All Crew')).map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-[#96171B] transition-all flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-900">{t.nama_tugas}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{t.durasi_menit} Menit • {t.is_deep_fryer ? 'Deep Fryer 160°C' : 'Non-Deepfryer'}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              addNewSlot(t);
                              setShowAgendaModal(false);
                            }}
                            className="px-2.5 py-1 bg-[#96171B] hover:bg-[#801216] text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            + Slot
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rundown Schedule */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={14} className="text-[#96171B]" />
                  <span>Susunan Rundown Day {selectedDayTab} : Materi & Praktek (08:00 - 17:00)</span>
                </h4>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4 w-36">Waktu</th>
                        <th className="py-2.5 px-4 w-28">Durasi</th>
                        <th className="py-2.5 px-4">Kegiatan Training</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {(selectedDayTab === 1 ? RUNDOWN_DAY_1 : RUNDOWN_DAY_2).map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{r.waktu}</td>
                          <td className="py-2.5 px-4 text-slate-500 font-semibold">{r.durasi_menit} Menit</td>
                          <td className="py-2.5 px-4">{r.kegiatan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 12 Kru Onboarding Participants Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users size={14} className="text-[#96171B]" />
                  <span>Daftar 12 Kru Onboarding Resmi Training Center</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {DAFTAR_PESERTA_ONBOARDING_TC.map((p) => (
                    <div
                      key={p.no}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          #{p.no} {p.nama}
                        </div>
                        <div className="text-[10.5px] text-slate-500">
                          {p.outlet} • {p.divisi}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowAgendaModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
