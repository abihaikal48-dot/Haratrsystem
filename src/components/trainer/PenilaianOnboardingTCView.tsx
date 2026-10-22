import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, Play, Pause, RotateCcw, CheckCircle2, AlertTriangle,
  Award, Shield, Users, BookOpen, Sparkles, Check, X,
  Thermometer, Scale, RefreshCw, FileText, ChevronRight,
  TrendingUp, UserCheck, Flame, UtensilsCrossed, AlertCircle,
  HelpCircle, Info, Plus, Eye, Save, Trash2
} from 'lucide-react';
import { db } from '../../lib/storage';
import { Kru, Outlet, Division, PenilaianOnboardingTC } from '../../types';
import {
  DAFTAR_PESERTA_ONBOARDING_TC,
  TrainingParticipantItem
} from '../../data/trainingCenterData';
import {
  ONBOARDING_STATION_TEMPLATES,
  StationAssessmentTemplate,
  hitungPenilaianObjektifOnboarding
} from '../../data/onboardingAssessmentData';

interface PenilaianOnboardingTCViewProps {
  selectedOutletCode?: string;
  onNavigateToAnalisis?: () => void;
}

export const PenilaianOnboardingTCView: React.FC<PenilaianOnboardingTCViewProps> = ({
  selectedOutletCode = 'ALL',
  onNavigateToAnalisis,
}) => {
  // Master Lists
  const [evalList, setEvalList] = useState<PenilaianOnboardingTC[]>(() => {
    try {
      return db.getTable<PenilaianOnboardingTC>('penilaian_onboarding_tc');
    } catch {
      return [];
    }
  });

  const [outlets] = useState<Outlet[]>(() => {
    try {
      return db.getTable<Outlet>('outlets');
    } catch {
      return [];
    }
  });

  // Active Station Key
  const [activeStationKey, setActiveStationKey] = useState<string>('stasiun-2');
  const template: StationAssessmentTemplate =
    ONBOARDING_STATION_TEMPLATES[activeStationKey] || ONBOARDING_STATION_TEMPLATES['stasiun-2'];

  // Selected Kru
  const [selectedPesertaNama, setSelectedPesertaNama] = useState<string>(
    DAFTAR_PESERTA_ONBOARDING_TC[0]?.nama || 'Iqbal Muzzaki'
  );
  const [selectedPesertaOutlet, setSelectedPesertaOutlet] = useState<string>(
    DAFTAR_PESERTA_ONBOARDING_TC[0]?.outlet || 'Imogiri Barat'
  );
  const [selectedKategori, setSelectedKategori] = useState<'New' | 'Reguler'>('Reguler');
  const [selectedDivisi, setSelectedDivisi] = useState<Division>('Kitchen');

  // Sync selected participant details
  const handleSelectPeserta = (nama: string) => {
    setSelectedPesertaNama(nama);
    const found = DAFTAR_PESERTA_ONBOARDING_TC.find((p) => p.nama === nama);
    if (found) {
      setSelectedPesertaOutlet(found.outlet);
      setSelectedKategori(found.keterangan);
      setSelectedDivisi(found.divisi);
    }
  };

  // ==========================================
  // STOPWATCH STATE & TIMER
  // ==========================================
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(template.targetDurasiDetik);
  const [stopwatchRunning, setStopwatchRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

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

  // When changing station template, sync default target time
  useEffect(() => {
    setStopwatchSeconds(template.targetDurasiDetik);
    setStopwatchRunning(false);
    setActualTemp(template.targetSuhu || 160);
    setActualGrams(template.targetGramatur || 120);

    // Initialize checklist states
    setChecklistLangkah(
      template.langkahKritis.map((l) => ({ langkah: l, terpenuhi: true }))
    );
    setChecklistKebersihan(
      template.indikatorKebersihan.map((k) => ({ poin: k, terpenuhi: true }))
    );
    setChecklistTim(
      template.indikatorTim.map((t) => ({ poin: t, terpenuhi: true }))
    );
    setChecklistKnowledge(
      template.pertanyaanKnowledge.map((q) => ({
        pertanyaan: q.tanya,
        terjawab_benar: true,
        jawaban_peserta: q.kunci,
      }))
    );
  }, [activeStationKey]);

  // Measurement states
  const [actualTemp, setActualTemp] = useState<number>(template.targetSuhu || 160);
  const [actualGrams, setActualGrams] = useState<number>(template.targetGramatur || 120);

  // Checklists
  const [checklistLangkah, setChecklistLangkah] = useState<{ langkah: string; terpenuhi: boolean }[]>([]);
  const [checklistKebersihan, setChecklistKebersihan] = useState<{ poin: string; terpenuhi: boolean; catatan?: string }[]>([]);
  const [checklistTim, setChecklistTim] = useState<{ poin: string; terpenuhi: boolean; catatan?: string }[]>([]);
  const [checklistKnowledge, setChecklistKnowledge] = useState<{ pertanyaan: string; terjawab_benar: boolean; jawaban_peserta?: string }[]>([]);

  // Notes
  const [catatanTrainer, setCatatanTrainer] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-calculated evaluation result (Purely objective computation)
  const calculated = hitungPenilaianObjektifOnboarding({
    durasiDetik: stopwatchSeconds,
    targetDurasiDetik: template.targetDurasiDetik,
    suhuAktual: template.targetSuhu ? actualTemp : undefined,
    targetSuhu: template.targetSuhu,
    gramaturAktual: template.targetGramatur ? actualGrams : undefined,
    targetGramatur: template.targetGramatur,
    checklistLangkah,
    checklistKebersihan,
    checklistTim,
    checklistKnowledge,
  });

  // Time formatter (MM:SS)
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(Math.abs(totalSec) / 60);
    const secs = Math.abs(totalSec) % 60;
    return `${totalSec < 0 ? '-' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Reload history from storage
  const refreshHistory = () => {
    const rows = db.getTable<PenilaianOnboardingTC>('penilaian_onboarding_tc');
    setEvalList(rows);
  };

  // Handle Save Assessment
  const handleSaveAssessment = () => {
    const currentUser = db.getCurrentUser();
    const newRecord: PenilaianOnboardingTC = {
      id: `eval-ob-${Date.now()}`,
      tanggal: new Date().toISOString(),
      peserta_nama: selectedPesertaNama,
      peserta_outlet: selectedPesertaOutlet,
      peserta_divisi: selectedDivisi,
      kategori_peserta: selectedKategori,
      stasiun: template.stasiun,
      task_id: template.kodeSop,
      task_nama: template.namaTugas,
      durasi_detik: stopwatchSeconds,
      target_durasi_detik: template.targetDurasiDetik,
      deviasi_detik: calculated.deviasiDetik,
      suhu_aktual: template.targetSuhu ? actualTemp : undefined,
      target_suhu: template.targetSuhu,
      gramatur_aktual: template.targetGramatur ? actualGrams : undefined,
      target_gramatur: template.targetGramatur,
      checklist_langkah_kritis: checklistLangkah,
      skor_ketepatan: calculated.skorKetepatan,
      checklist_kebersihan: checklistKebersihan,
      skor_kebersihan: calculated.skorKebersihan,
      checklist_tim: checklistTim,
      skor_tim: calculated.skorTim,
      checklist_knowledge: checklistKnowledge,
      skor_knowledge: calculated.skorKnowledge,
      skor_total: calculated.skorTotal,
      skala_lima: calculated.skalaLima,
      grade: calculated.grade,
      status_kelulusan: calculated.statusKelulusan,
      titik_kesalahan: calculated.titikKesalahan,
      rekomendasi_perbaikan: calculated.rekomendasiPerbaikan,
      catatan_trainer: catatanTrainer.trim() || `Evaluasi objektif stasiun ${template.stasiun}.`,
      trainer_nama: currentUser?.nama || 'Lead Trainer HARA',
      created_at: new Date().toISOString(),
    };

    db.insertRow('penilaian_onboarding_tc', newRecord);
    refreshHistory();
    setNotification({
      message: `Hasil penilaian untuk ${selectedPesertaNama} (${calculated.statusKelulusan} - Skor ${calculated.skorTotal}) berhasil disimpan ke database!`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Filter evaluated history
  const filteredHistory = evalList.filter((e) => {
    if (selectedOutletCode !== 'ALL' && e.peserta_outlet !== selectedOutletCode) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-900 text-white px-5 py-3.5 rounded-xl shadow-xl border border-emerald-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header Info Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <Award size={15} />
            <span>Instrumen Evaluasi Resmi Training Center HARA Chicken</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Penilaian Praktik Onboarding TC (4 Kriteria Objektif)
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Sistem pengujian berbasis pengukuran parameter nyata (Stopwatch SOS, Deviasi Gramatur, Suhu Minyak Fryer, Checklist Kebersihan 5S, Kerjasama Tim, dan Kuis Pengetahuan).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          {onNavigateToAnalisis && (
            <button
              onClick={onNavigateToAnalisis}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <TrendingUp size={15} />
              <span>Buka Data Analyst & Rapor TC</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Grid: Peserta Picker + Station Switcher + Stopwatch + 4 Pillars Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Peserta & Stasiun (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Peserta Selector Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                12 Peserta Onboarding TC
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {evalList.length} Dinilai
              </span>
            </div>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {DAFTAR_PESERTA_ONBOARDING_TC.map((peserta) => {
                const isSelected = selectedPesertaNama === peserta.nama;
                const prevEval = evalList.find((e) => e.peserta_nama === peserta.nama);

                return (
                  <button
                    key={peserta.nama}
                    onClick={() => handleSelectPeserta(peserta.nama)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs truncate font-medium flex items-center gap-1.5">
                        <span>{peserta.nama}</span>
                        {peserta.keterangan === 'New' && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.2 rounded">
                            New
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {peserta.outlet} · {peserta.divisi}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {prevEval ? (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            prevEval.grade === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : prevEval.grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : prevEval.grade === 'C'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {prevEval.grade} ({prevEval.skor_total})
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Belum</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stasiun Switcher */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-3">
              Pilih Stasiun Pengujian
            </span>

            <div className="space-y-2">
              {Object.entries(ONBOARDING_STATION_TEMPLATES).map(([key, st]) => {
                const isActive = activeStationKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveStationKey(key)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-tight">
                        {st.stasiun}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isActive
                            ? 'bg-slate-800 text-amber-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Target: {formatTime(st.targetDurasiDetik)}
                      </span>
                    </div>
                    <div
                      className={`text-xs mt-1 truncate ${
                        isActive ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {st.namaTugas}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stopwatch & SOS Timer Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-semibold tracking-wide flex items-center gap-1.5">
                <Clock size={14} />
                <span>Stopwatch Speed of Service (SOS)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Target: {formatTime(template.targetDurasiDetik)}
              </span>
            </div>

            {/* Huge Digits */}
            <div className="text-center py-2">
              <div className="text-4xl md:text-5xl font-extrabold font-mono tracking-tight text-white tabular-nums">
                {formatTime(stopwatchSeconds)}
              </div>
              <div className="mt-2 text-xs font-mono">
                {calculated.deviasiDetik > 0 ? (
                  <span className="text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded">
                    Terlambat +{calculated.deviasiDetik} dtk ({formatTime(calculated.deviasiDetik)})
                  </span>
                ) : calculated.deviasiDetik < 0 ? (
                  <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                    Lebih Cepat {formatTime(calculated.deviasiDetik)}
                  </span>
                ) : (
                  <span className="text-emerald-400">Tepat Waktu Sempurna</span>
                )}
              </div>
            </div>

            {/* Stopwatch Controls */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setStopwatchRunning(!stopwatchRunning)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  stopwatchRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {stopwatchRunning ? <Pause size={14} /> : <Play size={14} />}
                <span>{stopwatchRunning ? 'Jeda (Pause)' : 'Mulai (Start)'}</span>
              </button>
              <button
                onClick={() => {
                  setStopwatchRunning(false);
                  setStopwatchSeconds(template.targetDurasiDetik);
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1"
                title="Reset ke Waktu Target"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>

            {/* Manual Duration Adjuster */}
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Atur Manual Durasi (Detik):</span>
              <input
                type="number"
                min={0}
                value={stopwatchSeconds}
                onChange={(e) => setStopwatchSeconds(Math.max(0, Number(e.target.value)))}
                className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-right text-white font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 Pillars Objective Assessment Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Assessment Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Kru Peserta Uji
                </span>
                <div className="text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  <span>{selectedPesertaNama}</span>
                  <span className="text-xs font-normal text-slate-500 font-mono">
                    ({selectedPesertaOutlet} · {selectedDivisi})
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Stasiun Pengujian
                </span>
                <div className="text-sm font-bold text-amber-700">
                  {template.stasiunLabel}
                </div>
              </div>
            </div>

            {/* 1. PILAR KETEPATAN (Accuracy & SOP Execution) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Ketepatan (Stopwatch SOS, Parameter Fisik & Langkah SOP)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  Skor: {calculated.skorKetepatan}/100
                </span>
              </div>

              {/* Physical Parameters Input (Suhu & Gramatur) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                {template.targetSuhu ? (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                      <Thermometer size={13} className="text-red-500" />
                      <span>Suhu Minyak Aktual (°C) [Standar: {template.targetSuhu}°C]</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={actualTemp}
                        onChange={(e) => setActualTemp(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-amber-500"
                        placeholder="160"
                      />
                      <span className="text-xs font-medium text-slate-500 shrink-0">°C</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 flex items-center italic">
                    Stasiun ini tidak memerlukan pengukuran suhu termometer fryer.
                  </div>
                )}

                {template.targetGramatur ? (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                      <Scale size={13} className="text-blue-500" />
                      <span>Gramatur / Takaran Porsi [Standar: {template.targetGramatur}g]</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={actualGrams}
                        onChange={(e) => setActualGrams(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:border-amber-500"
                        placeholder="120"
                      />
                      <span className="text-xs font-medium text-slate-500 shrink-0">gram</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Langkah Kritis Checklist */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Verifikasi Langkah Kritis SOP:
                </span>
                {checklistLangkah.map((item, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      item.terpenuhi
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-red-50/70 border-red-200 text-red-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.terpenuhi}
                      onChange={(e) => {
                        const copy = [...checklistLangkah];
                        copy[idx].terpenuhi = e.target.checked;
                        setChecklistLangkah(copy);
                      }}
                      className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 shrink-0"
                    />
                    <span className={item.terpenuhi ? '' : 'line-through text-red-800'}>
                      {item.langkah}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-5 border-slate-200/80" />

            {/* 2. PILAR KEBERSIHAN (Cleanliness & 5S) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Kebersihan (5S, Sanitasi Dapur & APD Lengkap)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Skor: {calculated.skorKebersihan}/100
                </span>
              </div>

              <div className="space-y-2">
                {checklistKebersihan.map((item, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      item.terpenuhi
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-red-50/70 border-red-200 text-red-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.terpenuhi}
                      onChange={(e) => {
                        const copy = [...checklistKebersihan];
                        copy[idx].terpenuhi = e.target.checked;
                        setChecklistKebersihan(copy);
                      }}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 shrink-0"
                    />
                    <span>{item.poin}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-5 border-slate-200/80" />

            {/* 3. PILAR KERJA SAMA TIM (Teamwork & Communication) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Kerja Sama Tim (Kitchen Callout & Handover Stasiun)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                  Skor: {calculated.skorTim}/100
                </span>
              </div>

              <div className="space-y-2">
                {checklistTim.map((item, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                      item.terpenuhi
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-red-50/70 border-red-200 text-red-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.terpenuhi}
                      onChange={(e) => {
                        const copy = [...checklistTim];
                        copy[idx].terpenuhi = e.target.checked;
                        setChecklistTim(copy);
                      }}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 shrink-0"
                    />
                    <span>{item.poin}</span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-5 border-slate-200/80" />

            {/* 4. PILAR KNOWLEDGE (Product & SOP Mastery) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Knowledge (Kuis Lisan SOP Stasiun & Titik Kritis HACCP)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">
                  Skor: {calculated.skorKnowledge}/100
                </span>
              </div>

              <div className="space-y-2">
                {checklistKnowledge.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs transition-colors ${
                      item.terjawab_benar
                        ? 'bg-white border-slate-200'
                        : 'bg-red-50/70 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-slate-800">
                        {idx + 1}. {item.pertanyaan}
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={item.terjawab_benar}
                          onChange={(e) => {
                            const copy = [...checklistKnowledge];
                            copy[idx].terjawab_benar = e.target.checked;
                            setChecklistKnowledge(copy);
                          }}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-[11px] font-bold">
                          {item.terjawab_benar ? 'Benar (Lulus)' : 'Salah'}
                        </span>
                      </label>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700">Kunci Jawaban Baku:</span> {template.pertanyaanKnowledge[idx]?.kunci}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <hr className="my-5 border-slate-200/80" />

            {/* LIVE CALCULATION RESULT CARD */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                  Hasil Kompilasi Objektif & Skala Baku
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    calculated.statusKelulusan === 'Lulus Sempurna'
                      ? 'bg-emerald-500 text-white'
                      : calculated.statusKelulusan === 'Lulus Bersyarat'
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {calculated.statusKelulusan}
                </span>
              </div>

              {/* Scores Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="text-[11px] text-slate-400">Skor Total (0-100)</div>
                  <div className="text-2xl font-black font-mono text-white mt-0.5">
                    {calculated.skorTotal}
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="text-[11px] text-slate-400">Hasil Skala 5</div>
                  <div className="text-2xl font-black font-mono text-amber-300 mt-0.5">
                    {calculated.skalaLima} / 5.0
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="text-[11px] text-slate-400">Predikat Grade</div>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                    Grade {calculated.grade}
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="text-[11px] text-slate-400">Deviasi Durasi</div>
                  <div className="text-2xl font-black font-mono text-white mt-0.5">
                    {formatTime(calculated.deviasiDetik)}
                  </div>
                </div>
              </div>

              {/* Titik Kesalahan Faktual */}
              {calculated.titikKesalahan.length > 0 && (
                <div className="bg-red-950/40 border border-red-800/60 p-3 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    <span>Titik Kesalahan Terdeteksi ({calculated.titikKesalahan.length} Poin):</span>
                  </div>
                  <ul className="text-xs text-red-200 list-disc list-inside space-y-0.5">
                    {calculated.titikKesalahan.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rekomendasi Perbaikan Otomatis */}
              <div className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl">
                <span className="font-semibold text-amber-400">Rekomendasi Penugasan: </span>
                {calculated.rekomendasiPerbaikan}
              </div>

              {/* Input Catatan Tambahan Trainer */}
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Catatan Observasi Tambahan Trainer:
                </label>
                <textarea
                  rows={2}
                  value={catatanTrainer}
                  onChange={(e) => setCatatanTrainer(e.target.value)}
                  placeholder="Catatan khusus kesiapan mental kru, sikap antusias, kelemahan spesifik..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSaveAssessment}
                className="w-full py-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Save size={16} />
                <span>Simpan Hasil Penilaian Objektif ({selectedPesertaNama})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIWAYAT PENILAIAN ONBOARDING TERAKHIR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Log Riwayat Penilaian Onboarding TC
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar seluruh entri evaluasi kru onboarding yang telah tersimpan di sistem
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">
            Total {filteredHistory.length} Riwayat
          </span>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400 italic">
            Belum ada data evaluasi onboarding yang tersimpan untuk filter ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Nama Kru</th>
                  <th className="py-2.5 px-3">Outlet Asal</th>
                  <th className="py-2.5 px-3">Stasiun Uji</th>
                  <th className="py-2.5 px-3">Durasi vs Target</th>
                  <th className="py-2.5 px-3 text-center">Ketepatan</th>
                  <th className="py-2.5 px-3 text-center">Kebersihan</th>
                  <th className="py-2.5 px-3 text-center">Tim</th>
                  <th className="py-2.5 px-3 text-center">Knowledge</th>
                  <th className="py-2.5 px-3 text-center">Skor & Skala</th>
                  <th className="py-2.5 px-3 text-center">Kelulusan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {item.peserta_nama}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {item.peserta_outlet}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap font-medium">
                      {item.stasiun}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {formatTime(item.durasi_detik)} ({item.deviasi_detik > 0 ? `+${item.deviasi_detik}s` : `${item.deviasi_detik}s`})
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.skor_ketepatan}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.skor_kebersihan}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.skor_tim}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.skor_knowledge}</td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono font-bold text-slate-900">
                      {item.skor_total} (Skala {item.skala_lima})
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status_kelulusan === 'Lulus Sempurna'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status_kelulusan === 'Lulus Bersyarat'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status_kelulusan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
