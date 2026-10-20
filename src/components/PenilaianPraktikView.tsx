import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench, CheckCircle2, Award, RefreshCw, FileText, ChevronRight,
  Star, AlertTriangle, Play, Pause, RotateCcw, Clock, Thermometer,
  Scale, ShieldAlert, Sparkles, Check, X, Flame, ArrowUpRight,
  Calendar, Users, BookOpen, Layers, Info, CheckSquare
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

export const PenilaianPraktikView: React.FC<{ selectedOutletCode: string }> = ({ selectedOutletCode }) => {
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

  const [selectedKru, setSelectedKru] = useState('');
  const [selectedSopId, setSelectedSopId] = useState('');
  const [stepScores, setStepScores] = useState<Record<number, number>>({});
  const [catatan, setCatatan] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [lastFinalScore, setLastFinalScore] = useState<number | null>(null);

  // Active Station Task Preset from Training Center Agenda
  const [activePreset, setActivePreset] = useState<TrainingStationTask | null>(AGENDA_STATION_TASKS[0]);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [selectedDayTab, setSelectedDayTab] = useState<1 | 2>(1);
  const [selectedStationFilter, setSelectedStationFilter] = useState<string>('All');

  // Quantitative Instruments: SOS Stopwatch
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const timerRef = useRef<any>(null);

  // Quantitative Instruments: Physical Measurements
  const [actualTemp, setActualTemp] = useState<number>(160);
  const [actualGrams, setActualGrams] = useState<number>(120);

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

  // Stopwatch interval timer
  useEffect(() => {
    if (stopwatchRunning) {
      timerRef.current = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopwatchRunning]);

  const activeKruList = selectedOutletCode === 'ALL'
    ? kruList
    : kruList.filter((k) => k.kode_outlet === selectedOutletCode);

  const currentSop: BankSOP | null = (sopList && sopList.length > 0)
    ? (sopList.find((s) => s && s.id === selectedSopId) || sopList[0])
    : null;

  useEffect(() => {
    if (sopList.length > 0 && !selectedSopId) {
      setSelectedSopId(sopList[0].id);
    }
  }, [sopList, selectedSopId]);

  // Derive target seconds & tolerance with priority from activePreset or SOP
  const getTimeConfig = () => {
    if (activePreset) {
      return {
        target: activePreset.durasi_detik,
        minTol: activePreset.min_toleransi_detik,
        maxTol: activePreset.max_toleransi_detik,
        label: activePreset.toleransi_waktu_label,
        source: 'Agenda Training Center (Resmi)'
      };
    }

    if (!currentSop) {
      return { target: 180, minTol: 120, maxTol: 240, label: '3 Menit (Toleransi 2–4 mnt)', source: 'Standar Default' };
    }

    const str = (currentSop.standar_waktu || '').toLowerCase();
    const title = (currentSop.judul_sop || '').toLowerCase();

    if (title.includes('nasi') && !title.includes('nasi goreng')) {
      return { target: 35 * 60, minTol: 30 * 60, maxTol: 40 * 60, label: '35 Menit (Toleransi 30–40 mnt)', source: 'SOP Nasi TC' };
    }
    if (title.includes('goreng ayam') || title.includes('frying')) {
      return { target: 20 * 60, minTol: 18 * 60, maxTol: 22 * 60, label: '20 Menit (Toleransi 18–22 mnt)', source: 'SOP Fryer TC' };
    }
    if (title.includes('terong')) {
      return { target: 25 * 60, minTol: 22 * 60, maxTol: 28 * 60, label: '25 Menit (Toleransi 22–28 mnt)', source: 'SOP Terong TC' };
    }
    if (title.includes('kulit')) {
      return { target: 45 * 60, minTol: 40 * 60, maxTol: 50 * 60, label: '45 Menit (Toleransi 40–50 mnt)', source: 'SOP Kulit TC' };
    }
    if (title.includes('teh')) {
      return { target: 40 * 60, minTol: 35 * 60, maxTol: 45 * 60, label: '40 Menit (Toleransi 35–45 mnt)', source: 'SOP Teh TC' };
    }
    if (title.includes('sup')) {
      return { target: 40 * 60, minTol: 35 * 60, maxTol: 45 * 60, label: '40 Menit (Toleransi 35–45 mnt)', source: 'SOP Sup TC' };
    }
    if (title.includes('geprek') && title.includes('ori')) {
      return { target: 120, minTol: 90, maxTol: 150, label: '2 Menit (Toleransi 90–150 dtk)', source: 'SOP Geprek Ori TC' };
    }
    if (title.includes('krisbar')) {
      return { target: 7 * 60, minTol: 6 * 60, maxTol: 8 * 60, label: '7 Menit (Toleransi 6–8 mnt)', source: 'SOP Krisbar TC' };
    }
    if (title.includes('moza')) {
      return { target: 10 * 60, minTol: 8 * 60, maxTol: 12 * 60, label: '10 Menit (Toleransi 8–12 mnt)', source: 'SOP Moza TC' };
    }
    if (title.includes('sambal')) {
      return { target: 30 * 60, minTol: 25 * 60, maxTol: 35 * 60, label: '30 Menit (Toleransi 25–35 mnt)', source: 'SOP Sambal TC' };
    }
    if (title.includes('nasgor') || title.includes('nasi goreng')) {
      return { target: 15 * 60, minTol: 12 * 60, maxTol: 18 * 60, label: '15 Menit (Toleransi 12–18 mnt)', source: 'SOP Nasgor TC' };
    }
    if (title.includes('keju parut') || title.includes('ayoli') || title.includes('mentai')) {
      return { target: 5 * 60, minTol: 4 * 60, maxTol: 6 * 60, label: '5 Menit (Toleransi 4–6 mnt)', source: 'SOP Topping TC' };
    }

    if (str.includes('15 menit') || str.includes('tanak')) {
      return { target: 900, minTol: 780, maxTol: 1080, label: '15 Menit Tanak (Toleransi 13–18 mnt)', source: 'SOP Waktu' };
    }
    if (str.includes('12 menit') || str.includes('720')) {
      return { target: 720, minTol: 660, maxTol: 800, label: '12 Menit (Toleransi 11–13.5 mnt)', source: 'SOP Waktu' };
    }
    if (str.includes('5 menit') || str.includes('300')) {
      return { target: 300, minTol: 240, maxTol: 360, label: '5 Menit (Toleransi 4–6 mnt)', source: 'SOP Waktu' };
    }

    return { target: 180, minTol: 120, maxTol: 240, label: '3 Menit (Toleransi ±1 mnt)', source: 'SOP Waktu' };
  };

  const isThermalRequired = (): boolean => {
    if (activePreset) return activePreset.is_thermal;
    if (!currentSop) return false;
    const s = ((currentSop.judul_sop || '') + ' ' + (currentSop.kategori || '') + ' ' + (currentSop.alat_bahan || '')).toLowerCase();
    return s.includes('goreng') || s.includes('fryer') || s.includes('rebus') || s.includes('warmer') || s.includes('minyak');
  };

  const getMeasurementCategory = (): 'nasi_cup' | 'gram' | 'non_scale' => {
    if (activePreset?.is_nasi_cup) return 'nasi_cup';
    if (activePreset?.is_bebas_timbangan) return 'non_scale';
    if (!currentSop) return 'non_scale';
    const title = (currentSop.judul_sop || '').toLowerCase();
    if (title.includes('nasi') && !title.includes('nasi goreng')) {
      return 'nasi_cup';
    }
    if (title.includes('sambal') || title.includes('kulit') || title.includes('marinasi') || title.includes('mozarella') || title.includes('kentang')) {
      return 'gram';
    }
    return 'non_scale';
  };

  const timeConfig = getTimeConfig();
  const isThermal = isThermalRequired();
  const measurementType = getMeasurementCategory();
  const targetSeconds = timeConfig.target;

  // Speed-of-Service Pace status with adaptive tolerance
  const getPaceStatus = () => {
    if (stopwatchSeconds === 0) return { label: 'Siap Dimulai', color: 'text-slate-400 bg-slate-100' };
    if (stopwatchSeconds >= timeConfig.minTol && stopwatchSeconds <= timeConfig.maxTol) {
      return { label: `Toleransi Ideal (${formatTime(stopwatchSeconds)})`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
    if (stopwatchSeconds < timeConfig.minTol) {
      return { label: `Sangat Cepat (${formatTime(stopwatchSeconds)})`, color: 'text-blue-700 bg-blue-50 border-blue-200' };
    }
    const overDiff = stopwatchSeconds - timeConfig.maxTol;
    if (overDiff <= 60) {
      return { label: `Masih Ditoleransi (+${overDiff}s)`, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
    return { label: `Overtime (+${overDiff}s)`, color: 'text-red-700 bg-red-50 border-red-200' };
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const setScore = (stepIdx: number, val: number) => {
    if (submitted) return;
    setStepScores({ ...stepScores, [stepIdx]: val });
  };

  // Select a preset from Training Center Agenda
  const handleSelectPreset = (task: TrainingStationTask) => {
    setActivePreset(task);
    setStopwatchSeconds(0);
    setStopwatchRunning(false);
    setSubmitted(false);
    setLastFinalScore(null);
    setStepScores({});

    // Attempt to match corresponding SOP
    const matched = sopList.find((s) => {
      if (!s) return false;
      const j = (s.judul_sop || '').toLowerCase();
      const n = task.nama_tugas.toLowerCase();
      return j.includes(n) || n.includes(j) || (n.includes('nasi') && j.includes('nasi'));
    });
    if (matched) {
      setSelectedSopId(matched.id);
    }
  };

  const calculateAndSave = () => {
    if (!selectedKru) {
      alert('Silakan pilih nama kru yang sedang diuji praktik!');
      return;
    }

    const steps = currentSop?.langkah || activePreset?.langkah_ringkas || [
      'Persiapan alat, sanitasi tangan, dan higienitas area kerja',
      'Kepatuhan takaran dan rasio baku resep HARA',
      'Ketepatan timer operasional & penanganan produk',
      'Kebersihan, kerapian plating saji & sanitasi akhir'
    ];

    const scoresArray: number[] = [];
    let totalScoreObtained = 0;
    const maxScorePossible = steps.length * 3;

    for (let i = 0; i < steps.length; i++) {
      const s = stepScores[i] || 2;
      scoresArray.push(s);
      totalScoreObtained += s;
    }

    // Base rubric percentage (0 - 100)
    let finalPercent = Math.round((totalScoreObtained / maxScorePossible) * 100);

    // SOS Time Adjustment: Adaptif & Bertoleransi (sesuai Training Center Agenda)
    if (stopwatchSeconds > 0) {
      if (stopwatchSeconds > timeConfig.maxTol + 60) {
        finalPercent = Math.max(0, finalPercent - 5); // Overtime ringan, bukan hukuman ekstrem
      } else if (stopwatchSeconds >= timeConfig.minTol && stopwatchSeconds <= timeConfig.maxTol) {
        finalPercent = Math.min(100, finalPercent + 3); // Efisiensi ritme ideal
      }
    }

    // Kondisional Suhu (Hanya berlaku untuk station termal)
    if (isThermal) {
      if (actualTemp < 150 || actualTemp > 185) {
        finalPercent = Math.max(0, finalPercent - 10);
      }
    }

    setLastFinalScore(finalPercent);
    setSubmitted(true);
    setStopwatchRunning(false);

    const kruObj = kruList.find((k) => k.nama_kru === selectedKru);
    const resolvedOutletCode = kruObj?.kode_outlet || (selectedOutletCode !== 'ALL' ? selectedOutletCode : 'HC-IMG01');
    const sopTitle = activePreset?.nama_tugas || currentSop?.judul_sop || 'SOP Terkait';

    db.insertRow<PenilaianPraktik>('penilaian_praktik', {
      tanggal: new Date().toISOString(),
      nama_kru: selectedKru,
      kru_id: kruObj?.id,
      kode_outlet: resolvedOutletCode,
      sop_terkait: sopTitle,
      detail_skor_langkah: scoresArray,
      waktu_detik: stopwatchSeconds || targetSeconds,
      target_detik: targetSeconds,
      suhu_minyak: isThermal ? actualTemp : undefined,
      gramatur: measurementType === 'gram' ? actualGrams : undefined,
      skor_akhir: finalPercent,
      catatan: catatan || `Uji Praktik Agenda TC: ${activePreset ? `${activePreset.station} - ${activePreset.nama_tugas}` : sopTitle}. Waktu SOS: ${formatTime(stopwatchSeconds || targetSeconds)} (Standar: ${timeConfig.label}), ${isThermal ? `Suhu: ${actualTemp}°C` : 'Bebas Probe Suhu (Non-Termal)'}, ${measurementType === 'nasi_cup' ? 'Rasio Cup Miyako 1:1.33 Tanpa Timbang Gram' : measurementType === 'gram' ? `Gramatur: ${actualGrams}g` : 'Non-Timbangan'}. Skor Akhir: ${finalPercent}/100`,
    });

    if (finalPercent < 75) {
      db.triggerAutoRemedialAndTNA({
        kru_id: kruObj?.id,
        nama_kru: selectedKru,
        kode_outlet: resolvedOutletCode,
        divisi: (activePreset?.divisi_terkait || currentSop?.divisi as Division) || 'Kitchen',
        skor: finalPercent,
        topikSalah: [sopTitle],
        sumberTemuan: `Uji Praktik Training Center (${sopTitle} - Skor ${finalPercent}/100)`,
        catatan: `Praktik di bawah batas standar 75. Catatan: ${catatan || 'Perlu pendampingan timer dan ritme station'}`,
      });
    }
  };

  const resetForm = () => {
    setStepScores({});
    setSubmitted(false);
    setLastFinalScore(null);
    setCatatan('');
    setStopwatchSeconds(0);
    setStopwatchRunning(false);
  };

  const filteredPresetTasks = AGENDA_STATION_TASKS.filter((t) => {
    if (selectedStationFilter === 'All') return true;
    if (selectedStationFilter === 'Day 1') return t.day === 1;
    if (selectedStationFilter === 'Day 2') return t.day === 2;
    return t.station === selectedStationFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner with Training Center Quick Action */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-stone-900 to-slate-950 text-white rounded-3xl shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider">
              <Wrench size={12} />
              <span>AGENDA TRAINING CENTER HARA CHICKEN • DAY 1 & DAY 2</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              Penilaian Praktik Kru Onboarding & Retraining
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Disinkronkan dengan Agenda Resmi Training Center: Station 1, 2, 3, rasio cup beras Miyako (tanpa timbangan gram kaku), timer adaptif bertoleransi, dan suhu kondisional hanya untuk station termal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAgendaModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Calendar size={14} />
              <span>Lihat Jadwal Fisik TC</span>
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Reset Ujian</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Preset Station Bar: Training Center Tasks */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#96171B]" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Preset Station & Timer Training Center (Data Resmi)
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Station 1', 'Station 2', 'Station 3', 'Day 2'].map((flt) => (
              <button
                key={flt}
                type="button"
                onClick={() => setSelectedStationFilter(flt)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  selectedStationFilter === flt
                    ? 'bg-[#96171B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {flt}
              </button>
            ))}
          </div>
        </div>

        {/* Task Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {filteredPresetTasks.map((task) => {
            const isSelected = activePreset?.id === task.id;
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => handleSelectPreset(task)}
                className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? 'bg-red-50/80 border-[#96171B] ring-2 ring-[#96171B]/20 shadow-xs'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                    task.station === 'Station 1' ? 'bg-blue-100 text-blue-800' :
                    task.station === 'Station 2' ? 'bg-amber-100 text-amber-800' :
                    task.station === 'Station 3' ? 'bg-purple-100 text-purple-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {task.station} (D{task.day})
                  </span>
                  {isSelected && <Check size={12} className="text-[#96171B] shrink-0" />}
                </div>

                <div className="font-bold text-xs text-slate-900 leading-tight">
                  {task.nama_tugas}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span className="font-mono font-bold text-[#96171B]">{task.durasi_menit} mnt</span>
                  <span>{task.is_thermal ? '🔥 Suhu' : '🌿 Non-Term'}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Preset Details Bar */}
        {activePreset && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-black text-[#96171B] uppercase tracking-wide">
                  Tugas Aktif: {activePreset.nama_tugas} ({activePreset.station} Day {activePreset.day})
                </span>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full font-bold text-slate-700">
                  {activePreset.batch_info}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                <strong>Standar Takaran:</strong> {activePreset.takaran_standar}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-xl font-mono text-[11px] font-bold text-slate-700">
                Target: {activePreset.toleransi_waktu_label}
              </span>
              {activePreset.is_thermal ? (
                <span className="px-2.5 py-1 bg-orange-100 text-orange-900 border border-orange-200 rounded-xl font-bold text-[11px]">
                  Termal: {activePreset.toleransi_temp_label || `${activePreset.target_temp}°C`}
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-bold text-[11px]">
                  Bebas Termometer
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trainee & SOP Selector Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trainee Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>1. Pilih Kru yang Sedang Diuji Praktik:</span>
            <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              12 Kru TC Terdaftar
            </span>
          </label>
          <select
            value={selectedKru}
            onChange={(e) => setSelectedKru(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
          >
            <option value="">-- Pilih Kru Onboarding / Aktif --</option>
            <optgroup label="📋 12 Kru Onboarding Training Center Resmi (Sesuai Agenda)">
              {DAFTAR_PESERTA_ONBOARDING_TC.map((tc) => (
                <option key={`tc-${tc.no}`} value={tc.nama}>
                  #{tc.no} {tc.nama} ({tc.outlet} • {tc.divisi}) {tc.keterangan === 'New' ? '[Kru Baru]' : ''}
                </option>
              ))}
            </optgroup>
            <optgroup label="🏢 Kru Cabang & Outlet Lainnya">
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

        {/* SOP Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            2. SOP Stasiun Terkait (Referensi Rinci):
          </label>
          <select
            value={selectedSopId}
            onChange={(e) => {
              setSelectedSopId(e.target.value);
              setStepScores({});
              setSubmitted(false);
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
          >
            {sopList.filter((s) => s && s.id).map((s) => (
              <option key={s.id} value={s.id}>
                {s.kode_sop || 'SOP'} - {s.judul_sop || 'Judul'} ({s.divisi || '-'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quantitative Instrument Bar (Stopwatch & Physics) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stopwatch Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#96171B]" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Stopwatch Speed of Service (SOS)
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPaceStatus().color}`}>
              {getPaceStatus().label}
            </span>
          </div>

          <div className="text-center py-2">
            <div className="text-4xl sm:text-5xl font-mono font-black text-slate-900 tracking-tight">
              {formatTime(stopwatchSeconds)}
            </div>
            <div className="text-xs text-slate-500 font-semibold mt-1">
              Standar Target: <span className="font-mono font-bold text-slate-700">{timeConfig.label}</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Sumber: {timeConfig.source}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!stopwatchRunning ? (
              <button
                type="button"
                onClick={() => setStopwatchRunning(true)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Play size={14} />
                <span>Mulai Timer</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStopwatchRunning(false)}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Pause size={14} />
                <span>Jeda Timer</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setStopwatchRunning(false);
                setStopwatchSeconds(0);
              }}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center cursor-pointer transition-all"
              title="Reset Stopwatch"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Temperature Station Card (Conditional) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Thermometer size={16} className={isThermal ? "text-orange-600" : "text-slate-400"} />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Verifikasi Suhu HACCP
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              !isThermal
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : actualTemp >= 155 && actualTemp <= 175
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {!isThermal ? 'Bebas Suhu' : actualTemp >= 155 && actualTemp <= 175 ? 'Optimal 160°C' : 'Diluar Standar'}
            </span>
          </div>

          {isThermal ? (
            <div className="space-y-3">
              <div className="text-center py-1">
                <div className="text-3xl font-mono font-black text-slate-900 tracking-tight">
                  {actualTemp}°C
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Deep Fryer: 160°C • Kompor Gas: 175°C • Core Ayam: ≥74°C
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Input Probe Aktual:</span>
                  <span className="font-mono text-orange-600">{actualTemp}°C</span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="195"
                  step="1"
                  value={actualTemp}
                  onChange={(e) => setActualTemp(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>130°C (Dingin)</span>
                  <span>160°C (Standar)</span>
                  <span>195°C (Terlalu Panas)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 space-y-1 my-auto">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Station Non-Termal (Bebas Pengukuran Suhu)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Tugas ini ({activePreset?.nama_tugas || currentSop?.judul_sop || 'Terkait'}) tidak memerlukan probe termometer. Penilaian berfokus pada alur prosedural, higienitas, dan kecepatan layanan.
              </p>
            </div>
          )}

          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Info size={11} />
            <span>Kondisional: Termometer hanya aktif untuk station deep fryer/gorengan/torch.</span>
          </div>
        </div>

        {/* Measurement Station Card (Adaptive: Nasi Cup Miyako vs Gramatur vs Bebas Timbangan) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-[#96171B]" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Standar Porsi & Takaran Bahan
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              measurementType === 'nasi_cup'
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : measurementType === 'gram'
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {measurementType === 'nasi_cup' ? 'Rasio Cup Miyako' : measurementType === 'gram' ? 'Timbangan Gram' : 'Bebas Timbangan'}
            </span>
          </div>

          {measurementType === 'nasi_cup' ? (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-950 space-y-1">
                <div className="text-xs font-extrabold flex items-center gap-1.5">
                  <Sparkles size={13} className="text-blue-700" />
                  <span>SOP Tanak Nasi: Rasio Cup Miyako</span>
                </div>
                <div className="text-[11px] leading-relaxed text-blue-800">
                  • 3 Cup Beras : 4 Cup Air<br />
                  • 4 Cup Beras : 5 Cup Air (Standar Batch TC)<br />
                  • 5 Cup Beras : 6 Cup Air<br />
                  • 6 Cup Beras : 8 Cup Air (Maksimal)
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                <strong>Porsi Saji:</strong> 1 Centong Standar Penuh Anti-Lengket bulat rapi. Tidak perlu ditimbang gram per piring di meja saji saat jam sibuk.
              </div>
            </div>
          ) : measurementType === 'gram' ? (
            <div className="space-y-3">
              <div className="text-center py-1">
                <div className="text-3xl font-mono font-black text-slate-900 tracking-tight">
                  {actualGrams}g
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Toleransi wajar ±5g per porsi
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                  <span>Verifikasi Gramatur:</span>
                  <span className="font-mono text-purple-600">{actualGrams}g</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="1"
                  value={actualGrams}
                  onChange={(e) => setActualGrams(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>Sambal (30g)</span>
                  <span>Mozarella (35g)</span>
                  <span>Kentang (120g)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 space-y-1 my-auto">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Bebas Timbangan Gram</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Tugas ini dinilai berdasarkan kecakapan teknis, sanitasi 4 warna lap, teknik ulek cobek, atau kecepatan transaksi kasir tanpa penimbangan gram kaku.
              </p>
            </div>
          )}

          <div className="text-[10px] text-slate-400">
            {activePreset?.takaran_standar || 'Patuhi resep standar kualitas rasa HARA.'}
          </div>
        </div>
      </div>

      {/* Operational Step-by-Step Scoring Rubric */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10.5px] font-bold text-[#96171B] uppercase tracking-wider">
              LEMBAR EVALUASI OBSERVASI PRAKTIK LAPANGAN
            </span>
            <h3 className="text-base font-black text-slate-900 mt-0.5">
              {activePreset ? `${activePreset.nama_tugas} (${activePreset.station} Day ${activePreset.day})` : `${currentSop?.kode_sop || 'SOP'} — ${currentSop?.judul_sop || 'Terkait'}`}
            </h3>
            <p className="text-xs text-slate-500">
              Beri skor objektif (1 = Belum Standar, 2 = Sesuai SOP, 3 = Sempurna & Efisien) pada setiap langkah.
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            Total: {(activePreset?.langkah_ringkas || currentSop?.langkah || []).length} Langkah Teknis
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {(activePreset?.langkah_ringkas || currentSop?.langkah || [
            'Persiapan bahan baku dan sanitasi area kerja',
            'Penerapan takaran, resep baku, dan rasio cup Miyako',
            'Ketepatan timer operasional & kontrol kualitas produk',
            'Kerapian penyajian dan sanitasi penutup'
          ]).map((step, idx) => {
            const currentScore = stepScores[idx] || 2;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                      {step}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {[1, 2, 3].map((val) => (
                      <button
                        key={val}
                        type="button"
                        disabled={submitted}
                        onClick={() => setScore(idx, val)}
                        className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                          currentScore === val
                            ? val === 3
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : val === 2
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-red-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        } ${submitted ? 'cursor-not-allowed opacity-80' : ''}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10.5px] text-slate-400 pl-9 font-medium">
                  <span>Skor: {currentScore === 3 ? '3 (Sempurna & Efisien)' : currentScore === 2 ? '2 (Sesuai Standar SOP)' : '1 (Perlu Perbaikan)'}</span>
                  <span className="hidden sm:inline">Bobot Kuantitatif: 100% rubrik bertoleransi</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trainer Notes Input */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-700 block">
            Catatan Observasi Khusus Trainer:
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            disabled={submitted}
            rows={2}
            placeholder="Contoh: Takaran 4 cup beras Miyako tepat, timer tanak 35 menit ditaati, ulek geprek ori 2 menit lincah..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
          />
        </div>

        {/* Final Submission Card */}
        {submitted && lastFinalScore !== null && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                {lastFinalScore}
              </div>
              <div>
                <strong className="text-xs font-black text-emerald-900 block">
                  Penilaian Praktik Berhasil Disimpan ke Rekam Kru!
                </strong>
                <span className="text-[11px] text-emerald-700">
                  Kru: <strong>{selectedKru}</strong> • Skor: {lastFinalScore}/100 • Predikat: {lastFinalScore >= 85 ? 'Mahir (Sangat Baik)' : lastFinalScore >= 65 ? 'Terampil (Lulus)' : 'Perlu Remedial'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all cursor-pointer self-start sm:self-auto"
            >
              Uji Kru / Tugas Berikutnya
            </button>
          </div>
        )}

        {!submitted && (
          <button
            type="button"
            onClick={calculateAndSave}
            className="w-full py-3.5 bg-[#96171B] hover:bg-[#801216] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#96171B]/15 hover:shadow-lg transition-all active:scale-95"
          >
            <CheckCircle2 size={16} />
            <span>Kalkulasi Skor Objektif & Simpan ke Rekam Kru</span>
            <ArrowUpRight size={15} />
          </button>
        )}
      </div>

      {/* Recent History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-[#96171B]" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Riwayat Evaluasi Praktik Terakhir
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {history.length} Sesi Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Nama Kru</th>
                <th className="py-2.5 px-3">Tugas / SOP Terkait</th>
                <th className="py-2.5 px-3">Waktu SOS</th>
                <th className="py-2.5 px-3">Suhu Minyak</th>
                <th className="py-2.5 px-3 text-right">Skor Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {history.slice(0, 8).map((item) => (
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

              {/* Station Tasks Table (Matching the Physical Sheet) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Layers size={14} className="text-[#96171B]" />
                    <span>Pembagian Station Peserta Day {selectedDayTab}</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Klik tugas untuk langsung memuat ke lembar evaluasi
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
                            <div className="text-[10px] text-slate-500 font-mono">{t.durasi_menit} Menit • {t.is_thermal ? 'Termal' : 'Non-Termal'}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectPreset(t);
                              setShowAgendaModal(false);
                            }}
                            className="px-2.5 py-1 bg-[#96171B] hover:bg-[#801216] text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            Pilih
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
                        {selectedDayTab === 1 ? 'Goreng Ayam & Mentai' : 'Teh & Sambal'}
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
                            <div className="text-[10px] text-slate-500 font-mono">{t.durasi_menit} Menit • {t.is_thermal ? 'Termal' : 'Non-Termal'}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectPreset(t);
                              setShowAgendaModal(false);
                            }}
                            className="px-2.5 py-1 bg-[#96171B] hover:bg-[#801216] text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            Pilih
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
                            <div className="text-[10px] text-slate-500 font-mono">{t.durasi_menit} Menit • {t.is_thermal ? 'Termal' : 'Non-Termal'}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectPreset(t);
                              setShowAgendaModal(false);
                            }}
                            className="px-2.5 py-1 bg-[#96171B] hover:bg-[#801216] text-white text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            Pilih
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

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKru(p.nama);
                          setShowAgendaModal(false);
                        }}
                        className="px-2 py-1 bg-white border border-slate-300 hover:border-[#96171B] text-slate-800 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                      >
                        Pilih Kru
                      </button>
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
