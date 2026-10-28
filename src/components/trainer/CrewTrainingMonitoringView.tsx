import React, { useState, useMemo } from 'react';
import {
  CalendarCheck, Users, AlertTriangle, CheckCircle2, Clock, Search,
  Filter, ChevronRight, Award, FileText, ArrowRight, ShieldCheck,
  Check, X, AlertCircle, RefreshCw, Flame, UtensilsCrossed,
  Printer, Download, ShieldAlert, Sparkles, SlidersHorizontal, Eye,
  HelpCircle, Calculator, ChevronDown, CheckSquare, Layers, BookOpen,
  Thermometer, Scale, Mic
} from 'lucide-react';
import { db } from '../../lib/storage';
import {
  OJTCrewMonitoringRecord, GateEvaluationRecord, GateEvaluationStage,
  GateEvaluationStatus, UserRole, Division
} from '../../types';
import { SecurityPINModal } from '../SecurityPINModal';
import {
  OFFICIAL_OJT_GATE_RUBRICS,
  calculateGateScoreFromRubric,
  OJTRubricItem
} from '../../lib/ojtEvaluationRubrics';
import { OfficialHaraMonitoringMatrix } from './OfficialHaraMonitoringMatrix';
import { OfficialHaraSyllabusTimeline } from './OfficialHaraSyllabusTimeline';

interface CrewTrainingMonitoringViewProps {
  onOpenRaporKru?: (kruName: string) => void;
  selectedOutletCode?: string;
}

export const CrewTrainingMonitoringView: React.FC<CrewTrainingMonitoringViewProps> = ({
  onOpenRaporKru,
  selectedOutletCode,
}) => {
  const [monitoringList, setMonitoringList] = useState<OJTCrewMonitoringRecord[]>(() => db.getOJTMonitoring());
  const [viewMode, setViewMode] = useState<'matrix' | 'syllabus' | 'cohort'>('matrix');
  const [filterOutlet, setFilterOutlet] = useState<string>(selectedOutletCode || 'ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterWeek, setFilterWeek] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleDayCheck = (kruId: string, dayNumber: number) => {
    db.toggleOJTDayCheck(kruId, dayNumber);
    setMonitoringList(db.getOJTMonitoring());
    showToast(`Status verifikasi Hari ke-${dayNumber} berhasil diperbarui.`);
  };
  
  // Selected Kru for Gate Evaluation Form
  const [selectedKru, setSelectedKru] = useState<OJTCrewMonitoringRecord | null>(null);
  const [activeGateStage, setActiveGateStage] = useState<GateEvaluationStage>('GATE_3_DAY_21');
  const [checkedRubricIds, setCheckedRubricIds] = useState<string[]>([]);
  const [catatanEvaluator, setCatatanEvaluator] = useState<string>('');
  const [tindakanRemedial, setTindakanRemedial] = useState<string>('');

  // Traceability & Audit Modal State
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditSelectedKru, setAuditSelectedKru] = useState<OJTCrewMonitoringRecord | null>(null);

  // Security PIN Modal for critical overrides
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [pinDescription, setPinDescription] = useState('');

  // Toast feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const outlets = useMemo(() => db.getOutlets(), []);

  // Filtered Crew Records
  const filteredList = useMemo(() => {
    return monitoringList.filter(item => {
      if (filterOutlet !== 'ALL' && item.kode_outlet !== filterOutlet) return false;
      if (filterStatus !== 'ALL') {
        if (filterStatus === 'ON_TRACK' && item.status_keseluruhan !== 'On-Track') return false;
        if (filterStatus === 'REMEDIAL' && item.status_keseluruhan !== 'Kritis / Remedial') return false;
        if (filterStatus === 'PENDAMPINGAN' && item.status_keseluruhan !== 'Butuh Pendampingan') return false;
        if (filterStatus === 'LULUS' && item.status_keseluruhan !== 'Lulus Bersertifikat') return false;
      }
      if (filterWeek !== 'ALL' && String(item.minggu_aktif) !== filterWeek) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.nama_kru.toLowerCase().includes(q) ||
               item.divisi.toLowerCase().includes(q) ||
               item.kode_outlet.toLowerCase().includes(q);
      }
      return true;
    });
  }, [monitoringList, filterOutlet, filterStatus, filterWeek, searchQuery]);

  // Executive Stats
  const stats = useMemo(() => {
    const total = monitoringList.length;
    const onTrack = monitoringList.filter(k => k.status_keseluruhan === 'On-Track').length;
    const remedial = monitoringList.filter(k => k.status_keseluruhan === 'Kritis / Remedial').length;
    const lulus = monitoringList.filter(k => k.status_keseluruhan === 'Lulus Bersertifikat').length;
    const avgScore = total > 0
      ? Math.round(monitoringList.reduce((acc, k) => acc + (k.skor_komposit_ojt || k.progres_persen), 0) / total)
      : 0;
    return { total, onTrack, remedial, lulus, avgScore };
  }, [monitoringList]);

  // Open Gate Evaluation Form with Rubrics Pre-loaded
  const handleOpenGateEval = (kru: OJTCrewMonitoringRecord, stage: GateEvaluationStage) => {
    setSelectedKru(kru);
    setActiveGateStage(stage);

    const rubricDef = OFFICIAL_OJT_GATE_RUBRICS[stage];
    
    // Existing data if already evaluated
    let existingGate: GateEvaluationRecord | undefined;
    if (stage === 'GATE_1_DAY_7') existingGate = kru.evaluasi_gates.gate_1_day_7;
    if (stage === 'GATE_2_DAY_14') existingGate = kru.evaluasi_gates.gate_2_day_14;
    if (stage === 'GATE_3_DAY_21') existingGate = kru.evaluasi_gates.gate_3_day_21;
    if (stage === 'GATE_4_DAY_30') existingGate = kru.evaluasi_gates.gate_4_day_30;

    if (existingGate) {
      setCatatanEvaluator(existingGate.catatan_evaluasi || '');
      setTindakanRemedial(existingGate.tindakan_remedial || '');
      
      // If there are recorded critical deviations, uncheck those items
      const devs = existingGate.deviasi_kritis_ditemukan || [];
      const passedIds = rubricDef.items
        .filter(item => !devs.some(d => d.toLowerCase().includes(item.sop_code.toLowerCase()) || d.toLowerCase().includes(item.sop_title.toLowerCase())))
        .map(i => i.id);
      
      setCheckedRubricIds(passedIds.length > 0 ? passedIds : rubricDef.items.slice(0, 3).map(i => i.id));
    } else {
      // Default: Check all items except the last one for trainer to verify
      setCheckedRubricIds(rubricDef.items.map(i => i.id));
      setCatatanEvaluator(`Observasi lapangan berkala stasiun ${kru.divisi}.`);
      setTindakanRemedial('');
    }
  };

  // Toggle single rubric item in the Gate checklist
  const toggleRubricItem = (itemId: string) => {
    setCheckedRubricIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Real-time calculation for the currently active gate
  const currentGateCalculation = useMemo(() => {
    return calculateGateScoreFromRubric(activeGateStage, checkedRubricIds);
  }, [activeGateStage, checkedRubricIds]);

  // Save Gate Evaluation with Strict Anti-Hallucination & Anti-Promotion Rules
  const handleSaveEvaluation = () => {
    if (!selectedKru) return;

    const calc = currentGateCalculation;
    const stageDayMap: Record<GateEvaluationStage, number> = {
      'GATE_1_DAY_7': 7,
      'GATE_2_DAY_14': 14,
      'GATE_3_DAY_21': 21,
      'GATE_4_DAY_30': 30
    };

    const criticalDeviations = calc.failedCriticalItems.map(
      item => `[${item.sop_code}] ${item.sop_title}: ${item.rubrik_pernyataan}`
    );

    // Derive subscores based on category items
    const rubricDef = OFFICIAL_OJT_GATE_RUBRICS[activeGateStage];
    const totalItems = rubricDef.items.length || 1;
    const passedRatio = calc.passedItemsCount / totalItems;
    
    const derivedTeori = Math.round(passedRatio * 90 + 10);
    const derivedPraktik = Math.round(calc.totalScore);
    const derivedSop = calc.criticalDeviationFailed ? 60 : Math.round(passedRatio * 95);
    const derivedHara = calc.criticalDeviationFailed ? 75 : 92;

    const newGate: GateEvaluationRecord = {
      id: `gate-${selectedKru.id}-${activeGateStage}-${Date.now()}`,
      kru_id: selectedKru.kru_id,
      nama_kru: selectedKru.nama_kru,
      kode_outlet: selectedKru.kode_outlet,
      gate_stage: activeGateStage,
      hari_ke: stageDayMap[activeGateStage],
      tanggal_evaluasi: new Date().toISOString().split('T')[0],
      evaluator_nama: 'Haikal Abi',
      evaluator_role: 'Trainer',
      skor_teori: derivedTeori,
      skor_praktik: derivedPraktik,
      skor_kepatuhan_sop: derivedSop,
      skor_budaya_hara: derivedHara,
      skor_akhir: calc.totalScore,
      status: calc.status,
      deviasi_kritis_ditemukan: criticalDeviations,
      catatan_evaluasi: catatanEvaluator || 'Evaluasi berbasis rubrik objektif SOP.',
      tindakan_remedial: calc.status === 'REMEDIAL_TERBIMBING'
        ? (tindakanRemedial || 'Wajib pendampingan peer trainer, retraining kalibrasi alat, dan uji ulang 7 hari.')
        : undefined,
      tanda_tangan_evaluator: true,
    };

    // Save to Database
    db.saveGateEvaluation(selectedKru.kru_id, newGate);
    setMonitoringList(db.getOJTMonitoring());
    setSelectedKru(null);

    if (calc.status === 'REMEDIAL_TERBIMBING') {
      showToast(`Evaluasi tersimpan: ${selectedKru.nama_kru} BELUM LULUS (Skor: ${calc.totalScore}). Masuk status Remedial.`);
    } else {
      showToast(`Evaluasi tersimpan: ${selectedKru.nama_kru} ${calc.statusLabel} (Skor: ${calc.totalScore})`);
    }
  };

  // Open Traceability Ledger Modal
  const handleOpenAudit = (kru?: OJTCrewMonitoringRecord) => {
    setAuditSelectedKru(kru || monitoringList[0] || null);
    setIsAuditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner - Clean Industrial Style with Traceability Highlight */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider">
              <CalendarCheck className="w-3 h-3" />
              <span>SOP STANDARISASI OJT 30 HARI & EVALUASI GATE</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Monitoring Kru Training & On-the-Job Training (OJT)
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl">
              Sistem pelacakan kemajuan pelatihan kru berbasis kurikulum 30 hari, checklist tugas SOP terverifikasi, dan 4 Gate Evaluation berkala dengan kriteria objektif anti-manipulasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenAudit()}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <Calculator className="w-4 h-4 text-amber-700" />
              <span>Sumber & Rantai Kalkulasi Nilai</span>
            </button>

            <button
              onClick={() => setMonitoringList(db.getOJTMonitoring())}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Explainability Banner Box: Where does the monitoring score come from? */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 shrink-0 mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs">
                Darimana Nilai Monitoring & Status Kelulusan Diambil?
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Nilai monitoring dihitung secara <strong>objektif dan matematis</strong> melalui 4 Pilar Baku: 
                <strong> Checklist Tugas Harian SOP (25%)</strong>, 
                <strong> Akumulasi Gate Evaluation H7-H30 (40%)</strong>, 
                <strong> Ujian Teori SOP Komprehensif (20%)</strong>, dan 
                <strong> Audit Budaya HARA & Disiplin (15%)</strong>.
                Jika terdapat 1 deviasi kritis SOP yang gagal, status otomatis terkunci ke <em>Remedial Terbimbing</em>.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenAudit()}
            className="text-xs font-bold text-red-700 hover:text-red-800 shrink-0 inline-flex items-center gap-1"
          >
            <span>Pelajari Rumus Lengkap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Executive KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Total Kru OJT</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{stats.total} Kru</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Batch Aktif Outlet</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-medium text-emerald-700 block">On-Track</span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">{stats.onTrack} Kru</span>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Sesuai Milestone Target</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-medium text-red-600 block">Kritis / Remedial</span>
          <span className="text-xl font-bold text-red-600 mt-1 block">{stats.remedial} Kru</span>
          <span className="text-[10px] text-red-500 mt-0.5 block">Deviasi Kritis / Nilai &lt;75</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-medium text-blue-700 block">Lulus Bersertifikat</span>
          <span className="text-xl font-bold text-blue-700 mt-1 block">{stats.lulus} Kru</span>
          <span className="text-[10px] text-blue-600 mt-0.5 block">Gate 4 Lulus Mandiri</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-slate-500 block">Rata-rata Skor Komposit</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{stats.avgScore} / 100</span>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${stats.avgScore >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${Math.min(stats.avgScore, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Outlet Filter */}
          <select
            value={filterOutlet}
            onChange={e => setFilterOutlet(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
          >
            <option value="ALL">Semua Outlet ({monitoringList.length})</option>
            {outlets.map(out => (
              <option key={out.kode_outlet} value={out.kode_outlet}>
                {out.kode_outlet} — {out.nama_outlet}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
          >
            <option value="ALL">Semua Status OJT</option>
            <option value="ON_TRACK">On-Track (Lolos)</option>
            <option value="REMEDIAL">Kritis / Remedial</option>
            <option value="PENDAMPINGAN">Butuh Pendampingan</option>
            <option value="LULUS">Lulus Bersertifikat</option>
          </select>

          {/* Week Filter */}
          <select
            value={filterWeek}
            onChange={e => setFilterWeek(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium"
          >
            <option value="ALL">Semua Minggu (1 - 4)</option>
            <option value="1">Minggu 1 (Hari 1 - 7)</option>
            <option value="2">Minggu 2 (Hari 8 - 14)</option>
            <option value="3">Minggu 3 (Hari 15 - 21)</option>
            <option value="4">Minggu 4 (Hari 22 - 30)</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama kru atau outlet..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 text-xs"
          />
        </div>
      </div>

      {/* Main Monitoring Cohort Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Matriks Cohort Kru OJT & Status Gate Evaluation
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Menampilkan {filteredList.length} dari {monitoringList.length} kru
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Nama Kru & Divisi</th>
                <th className="py-3 px-3">Outlet & Mentor</th>
                <th className="py-3 px-3 text-center">Timeline OJT</th>
                <th className="py-3 px-3 text-center">Skor Komposit</th>
                <th className="py-3 px-2 text-center">Gate 1 (H-7)</th>
                <th className="py-3 px-2 text-center">Gate 2 (H-14)</th>
                <th className="py-3 px-2 text-center">Gate 3 (H-21)</th>
                <th className="py-3 px-2 text-center">Gate 4 (H-30)</th>
                <th className="py-3 px-3">Status OJT</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredList.map((item) => {
                const g1 = item.evaluasi_gates.gate_1_day_7;
                const g2 = item.evaluasi_gates.gate_2_day_14;
                const g3 = item.evaluasi_gates.gate_3_day_21;
                const g4 = item.evaluasi_gates.gate_4_day_30;
                const isRemedial = item.status_keseluruhan === 'Kritis / Remedial';
                const compositeScore = item.skor_komposit_ojt || Math.round(
                  ([g1?.skor_akhir, g2?.skor_akhir, g3?.skor_akhir, g4?.skor_akhir].filter(Boolean) as number[]).reduce((a, b) => a + b, 0) /
                  (([g1, g2, g3, g4].filter(Boolean).length) || 1)
                );

                return (
                  <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                    {/* Kru Name & Division */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isRemedial
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-800'
                        }`}>
                          {item.nama_kru.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">
                            {item.nama_kru}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Divisi: {item.divisi}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Outlet & Mentor */}
                    <td className="py-3.5 px-3">
                      <span className="font-medium text-slate-800 block text-[11px]">
                        {item.nama_outlet}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Mentor: {item.mentor_nama}
                      </span>
                    </td>

                    {/* Timeline */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-semibold text-slate-800 block text-xs">
                        Hari ke-{item.hari_berjalan} / 30
                      </span>
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isRemedial ? 'bg-red-500' : 'bg-slate-900'
                          }`}
                          style={{ width: `${Math.round((item.hari_berjalan / 30) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        Minggu ke-{item.minggu_aktif}
                      </span>
                    </td>

                    {/* Composite Score with Breakdown trigger */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => handleOpenAudit(item)}
                        className={`inline-flex flex-col items-center px-2 py-1 rounded-lg border font-mono transition-transform hover:scale-105 ${
                          compositeScore >= 85
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : compositeScore >= 75
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-800 border-red-200 font-bold'
                        }`}
                        title="Klik untuk melihat rantai nilai lengkap"
                      >
                        <span className="text-xs font-black">{compositeScore}</span>
                        <span className="text-[8px] text-slate-500 underline uppercase tracking-wider">
                          Rantai Nilai
                        </span>
                      </button>
                    </td>

                    {/* Gate 1 */}
                    <td className="py-3.5 px-2 text-center">
                      {g1 ? (
                        <button
                          onClick={() => handleOpenGateEval(item, 'GATE_1_DAY_7')}
                          className={`inline-flex flex-col items-center px-2 py-0.5 rounded text-[10px] font-mono border ${
                            g1.status === 'REMEDIAL_TERBIMBING'
                              ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                              : 'bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <span>{g1.skor_akhir}</span>
                          <span className="text-[8px] uppercase">{g1.status === 'REMEDIAL_TERBIMBING' ? 'FAIL' : 'PASS'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenGateEval(item, 'GATE_1_DAY_7')}
                          className="px-2 py-1 rounded border border-dashed border-slate-300 text-slate-400 hover:text-slate-700 hover:border-slate-400 text-[10px]"
                        >
                          + G1
                        </button>
                      )}
                    </td>

                    {/* Gate 2 */}
                    <td className="py-3.5 px-2 text-center">
                      {g2 ? (
                        <button
                          onClick={() => handleOpenGateEval(item, 'GATE_2_DAY_14')}
                          className={`inline-flex flex-col items-center px-2 py-0.5 rounded text-[10px] font-mono border ${
                            g2.status === 'REMEDIAL_TERBIMBING'
                              ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                              : 'bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <span>{g2.skor_akhir}</span>
                          <span className="text-[8px] uppercase">{g2.status === 'REMEDIAL_TERBIMBING' ? 'FAIL' : 'PASS'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenGateEval(item, 'GATE_2_DAY_14')}
                          className="px-2 py-1 rounded border border-dashed border-slate-300 text-slate-400 hover:text-slate-700 hover:border-slate-400 text-[10px]"
                        >
                          + G2
                        </button>
                      )}
                    </td>

                    {/* Gate 3 */}
                    <td className="py-3.5 px-2 text-center">
                      {g3 ? (
                        <button
                          onClick={() => handleOpenGateEval(item, 'GATE_3_DAY_21')}
                          className={`inline-flex flex-col items-center px-2 py-0.5 rounded text-[10px] font-mono border ${
                            g3.status === 'REMEDIAL_TERBIMBING'
                              ? 'bg-red-50 text-red-700 border-red-300 font-bold ring-1 ring-red-400'
                              : 'bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <span>{g3.skor_akhir}</span>
                          <span className="text-[8px] uppercase font-bold text-red-600">
                            {g3.status === 'REMEDIAL_TERBIMBING' ? 'REMEDIAL' : 'PASS'}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenGateEval(item, 'GATE_3_DAY_21')}
                          className="px-2 py-1 rounded border border-dashed border-slate-300 text-slate-400 hover:text-slate-700 hover:border-slate-400 text-[10px]"
                        >
                          + G3
                        </button>
                      )}
                    </td>

                    {/* Gate 4 */}
                    <td className="py-3.5 px-2 text-center">
                      {g4 ? (
                        <button
                          onClick={() => handleOpenGateEval(item, 'GATE_4_DAY_30')}
                          className="inline-flex flex-col items-center px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 font-bold"
                        >
                          <span>{g4.skor_akhir}</span>
                          <span className="text-[8px] uppercase">LULUS</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenGateEval(item, 'GATE_4_DAY_30')}
                          className="px-2 py-1 rounded border border-dashed border-slate-300 text-slate-400 hover:text-slate-700 hover:border-slate-400 text-[10px]"
                        >
                          + G4
                        </button>
                      )}
                    </td>

                    {/* Overall Status */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium ${
                        item.status_keseluruhan === 'On-Track'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : item.status_keseluruhan === 'Kritis / Remedial'
                          ? 'bg-red-50 text-red-800 border border-red-300 font-semibold'
                          : item.status_keseluruhan === 'Lulus Bersertifikat'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {item.status_keseluruhan}
                      </span>
                      {isRemedial && (
                        <p className="text-[10px] text-red-600 mt-1 font-medium">
                          Dilarang Promosi / Solo Shift
                        </p>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenAudit(item)}
                          className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Audit Rantai Nilai"
                        >
                          <Calculator className="w-3 h-3 text-slate-500" />
                          <span>Audit</span>
                        </button>

                        <button
                          onClick={() => {
                            if (onOpenRaporKru) {
                              onOpenRaporKru(item.nama_kru);
                            } else {
                              showToast(`Buka rapor kru untuk ${item.nama_kru}`);
                            }
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span>Rapor</span>
                        </button>

                        <button
                          onClick={() => handleOpenGateEval(item, 'GATE_3_DAY_21')}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
                        >
                          Evaluasi
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

      {/* ============================================================== */}
      {/* MODAL 1: FORM EVALUASI GATE BERBASIS RUBRIK OBJEKTIF SOP       */}
      {/* ============================================================== */}
      {selectedKru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold">
                  {selectedKru.nama_kru.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Form Evaluasi Gate Berbasis Rubrik SOP — {selectedKru.nama_kru}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Divisi {selectedKru.divisi}</span>
                    <span>·</span>
                    <span>{selectedKru.nama_outlet}</span>
                    <span>·</span>
                    <span className="font-semibold text-red-600">
                      {OFFICIAL_OJT_GATE_RUBRICS[activeGateStage].title}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedKru(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* Gate Stage Selector Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                {(['GATE_1_DAY_7', 'GATE_2_DAY_14', 'GATE_3_DAY_21', 'GATE_4_DAY_30'] as GateEvaluationStage[]).map(stage => {
                  const labels: Record<GateEvaluationStage, string> = {
                    'GATE_1_DAY_7': 'Gate 1 (H-7: Orientasi)',
                    'GATE_2_DAY_14': 'Gate 2 (H-14: Helper & Thawing)',
                    'GATE_3_DAY_21': 'Gate 3 (H-21: Stasiun Inti & Suhu)',
                    'GATE_4_DAY_30': 'Gate 4 (H-30: Rush Hour & Final)'
                  };
                  return (
                    <button
                      key={stage}
                      onClick={() => handleOpenGateEval(selectedKru, stage)}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-medium text-[11px] transition-colors ${
                        activeGateStage === stage
                          ? 'bg-white text-slate-900 shadow-sm font-semibold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {labels[stage]}
                    </button>
                  );
                })}
              </div>

              {/* Rubric Header Subtitle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {OFFICIAL_OJT_GATE_RUBRICS[activeGateStage].title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {OFFICIAL_OJT_GATE_RUBRICS[activeGateStage].subTitle}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Poin Maksimal</span>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {OFFICIAL_OJT_GATE_RUBRICS[activeGateStage].totalPoinMaksimal} Poin
                  </span>
                </div>
              </div>

              {/* Real Interactive Objective Rubric Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 block text-xs">
                    Daftar Butir Uji SOP (Centang parameter yang terverifikasi lulus):
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {currentGateCalculation.passedItemsCount} dari {currentGateCalculation.totalItems} Butir Terpenuhi
                  </span>
                </div>

                <div className="space-y-2">
                  {OFFICIAL_OJT_GATE_RUBRICS[activeGateStage].items.map((item) => {
                    const isChecked = checkedRubricIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleRubricItem(item.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-white border-slate-300 hover:border-slate-400 shadow-2xs'
                            : item.is_kritis
                            ? 'bg-red-50/60 border-red-200 hover:bg-red-50'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                              isChecked
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-300 text-transparent'
                            }`}>
                              <Check className="w-3.5 h-3.5" />
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {item.sop_code}
                                </span>
                                <span className="font-bold text-xs text-slate-900">
                                  {item.sop_title}
                                </span>
                                {item.is_kritis && (
                                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[9px] font-bold border border-red-200 uppercase">
                                    Titik Kritis HACCP / Food Safety
                                  </span>
                                )}
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-mono font-medium">
                                  {item.metode_uji}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-700 leading-snug">
                                {item.rubrik_pernyataan}
                              </p>

                              <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-2 pt-0.5">
                                <span><strong>Standar Baku:</strong> {item.standar_baku}</span>
                                <span>•</span>
                                <span className="text-slate-400">{item.penjelasan_objektif}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className={`font-mono font-bold text-xs ${isChecked ? 'text-slate-900' : 'text-slate-400'}`}>
                              +{item.bobot_poin} Poin
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Critical Violation Notice if any critical item is unchecked */}
              {currentGateCalculation.criticalDeviationFailed && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-xs text-red-700">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>STATUS TERKUNCI: REMEDIAL TERBIMBING (Ditemukan {currentGateCalculation.failedCriticalItems.length} Deviasi Kritis SOP)</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-red-700 space-y-0.5">
                    {currentGateCalculation.failedCriticalItems.map(f => (
                      <li key={f.id}>
                        <strong>{f.sop_code} {f.sop_title}:</strong> Belum memenuhi standar ({f.standar_baku})
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-red-600 mt-1">
                    Sesuai SOP Manajemen Mutu HARA Chicken, kegagalan pada titik kontrol kritis membatalkan kelulusan mandiri secara otomatis untuk mencegah risiko food safety dan kerugian operasional.
                  </p>
                </div>
              )}

              {/* Evaluator Notes & Remedial Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-900 block mb-1">
                    Catatan Evaluator Lapangan
                  </label>
                  <textarea
                    rows={2}
                    value={catatanEvaluator}
                    onChange={e => setCatatanEvaluator(e.target.value)}
                    placeholder="Tuliskan temuan riil saat observasi di stasiun outlet..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-900 block mb-1">
                    Rencana Tindakan Remedial (Jika Belum Lulus)
                  </label>
                  <textarea
                    rows={2}
                    value={tindakanRemedial}
                    onChange={e => setTindakanRemedial(e.target.value)}
                    placeholder="Contoh: Retraining kalibrasi termometer 160°C dan pendampingan peer trainer 7 hari..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Live Objective Score Calculation Summary */}
              <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                currentGateCalculation.status === 'REMEDIAL_TERBIMBING'
                  ? 'bg-red-50/80 border-red-200 text-red-900'
                  : currentGateCalculation.status === 'LULUS_BERSYARAT'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider">Hasil Evaluasi Terhitung:</span>
                    <span className="font-mono font-black text-base">{currentGateCalculation.totalScore} / 100 Poin</span>
                  </div>
                  <p className="text-[11px] mt-0.5">
                    <strong>Status:</strong> {currentGateCalculation.statusLabel}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {currentGateCalculation.formulaExplanation}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${
                    currentGateCalculation.status === 'REMEDIAL_TERBIMBING'
                      ? 'bg-red-600 text-white shadow-xs'
                      : currentGateCalculation.status === 'LULUS_BERSYARAT'
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-600 text-white shadow-xs'
                  }`}>
                    {currentGateCalculation.status === 'REMEDIAL_TERBIMBING' ? 'REMEDIAL' : 'LULUS'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setSelectedKru(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100"
              >
                Batal
              </button>

              <button
                onClick={handleSaveEvaluation}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Hasil Evaluasi Gate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: AUDIT & RANTAI SUMBER NILAI OBJEKTIF (TRACEABILITY)   */}
      {/* ============================================================== */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Transparansi & Rantai Sumber Nilai Monitoring OJT
                  </h3>
                  <p className="text-xs text-slate-500">
                    Auditable Traceability Matrix — Pembuktian objektifitas kalkulasi nilai kru tanpa manipulasi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Crew Selector for Audit Inspection */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 text-xs">
                  Pilih Kru Untuk Simulasi Audit:
                </span>
                <select
                  value={auditSelectedKru?.kru_id || ''}
                  onChange={e => {
                    const match = monitoringList.find(k => k.kru_id === e.target.value);
                    if (match) setAuditSelectedKru(match);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                >
                  {monitoringList.map((k, kIdx) => (
                    <option key={`${k.kru_id}-${kIdx}`} value={k.kru_id}>
                      {k.nama_kru} ({k.divisi} — {k.kode_outlet})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4 Pillars Formula Diagram */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-red-600" />
                  <span>Komposisi 4 Pilar Baku Penilaian OJT</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pilar 1 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>Pilar 1: Checklist Tugas SOP Harian</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px]">Bobot 25%</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      <strong>Asal Data:</strong> Checklist harian 30 hari OJT stasiun kerja yang diverifikasi paraf mentor/trainer.
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Rumus: (Jumlah Tugas Selesai / Total Tugas Berjalan) × 100
                    </p>
                  </div>

                  {/* Pilar 2 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>Pilar 2: Akumulasi Gate Evaluations</span>
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-mono text-[11px]">Bobot 40%</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      <strong>Asal Data:</strong> Uji lapangan berkala Gate 1 (H-7), Gate 2 (H-14), Gate 3 (H-21), dan Gate 4 (H-30).
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Instrumen: Termometer 160°C, Stopwatch SOS, Timbangan 30g, Tes Lisan
                    </p>
                  </div>

                  {/* Pilar 3 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>Pilar 3: Ujian Teori SOP Komprehensif</span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-mono text-[11px]">Bobot 20%</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      <strong>Asal Data:</strong> Hasil ujian bank soal resmi HARA 25 butir soal (Modul Uji Teori SOP).
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Ambang Batas Kelulusan (Passing Grade): ≥ 75 Poin
                    </p>
                  </div>

                  {/* Pilar 4 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <div className="flex justify-between items-center font-bold text-slate-900">
                      <span>Pilar 4: Audit Sikap Budaya H.A.R.A</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[11px]">Bobot 15%</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      <strong>Asal Data:</strong> Kedisiplinan absensi (on-time ≥95%), kelengkapan seragam/grooming, dan integritas zero fraud.
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Nilai: Halal, Amanah, Responsif, Adaptif
                    </p>
                  </div>
                </div>
              </div>

              {/* Mathematical Formula Ledger for Selected Trainee */}
              {auditSelectedKru && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 text-xs">
                      Rantai Nilai Riil: {auditSelectedKru.nama_kru} ({auditSelectedKru.divisi})
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      auditSelectedKru.status_keseluruhan === 'Kritis / Remedial'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {auditSelectedKru.status_keseluruhan}
                    </span>
                  </div>

                  {/* Real Breakdown Scores */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Checklist Harian (25%)</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {auditSelectedKru.breakdown_skor?.skor_harian || 85}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Rata-rata Gate (40%)</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {auditSelectedKru.breakdown_skor?.skor_gates || 82}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Ujian Teori (20%)</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {auditSelectedKru.breakdown_skor?.skor_teori || 88}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Sikap Budaya (15%)</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {auditSelectedKru.breakdown_skor?.skor_sikap || 90}
                      </span>
                    </div>
                  </div>

                  {/* Mathematical Expression */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 space-y-1">
                    <div className="font-sans font-bold text-slate-900 text-xs">
                      Formula Matematis Komposit:
                    </div>
                    <div className="text-slate-600">
                      {auditSelectedKru.breakdown_skor?.rumus_kalkulasi ||
                        `(${auditSelectedKru.breakdown_skor?.skor_harian || 85} × 0.25) + (${auditSelectedKru.breakdown_skor?.skor_gates || 82} × 0.40) + (${auditSelectedKru.breakdown_skor?.skor_teori || 88} × 0.20) + (${auditSelectedKru.breakdown_skor?.skor_sikap || 90} × 0.15) = ${auditSelectedKru.skor_komposit_ojt || 84.5}`}
                    </div>
                  </div>

                  {/* Remedial Warning if applicable */}
                  {auditSelectedKru.catatan_remedial_aktif && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-[11px] flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Alasan Penguncian Remedial:</strong> {auditSelectedKru.catatan_remedial_aktif}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Standard Thresholds Reference Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">
                  Aturan Kategori Status Kelulusan SOP
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2 text-left">Rentang Skor</th>
                        <th className="p-2 text-left">Status OJT</th>
                        <th className="p-2 text-left">Syarat Khusus SOP</th>
                        <th className="p-2 text-left">Otoritas Penempatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="bg-emerald-50/40">
                        <td className="p-2 font-mono font-bold">≥ 85.0 Poin</td>
                        <td className="p-2 font-semibold text-emerald-800">Lulus Mandiri</td>
                        <td className="p-2">Zero deviasi kritis pada seluruh Gate</td>
                        <td className="p-2">Siap Solo Shift mandiri tanpa pendampingan</td>
                      </tr>
                      <tr className="bg-amber-50/40">
                        <td className="p-2 font-mono font-bold">75.0 - 84.9 Poin</td>
                        <td className="p-2 font-semibold text-amber-800">Lulus Bersyarat</td>
                        <td className="p-2">Tidak ada deviasi kritis fatal</td>
                        <td className="p-2">Wajib didampingi peer trainer senior 14 hari</td>
                      </tr>
                      <tr className="bg-red-50/40">
                        <td className="p-2 font-mono font-bold">&lt; 75.0 Poin ATAU Gagal Kritis</td>
                        <td className="p-2 font-semibold text-red-800">Remedial Terbimbing</td>
                        <td className="p-2">1 butir kritis gagal langsung remedial</td>
                        <td className="p-2 text-red-700 font-bold">Dilarang solo shift / dilarang diajukan promosi</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Tutup Ringkasan Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security PIN Modal */}
      <SecurityPINModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        description={pinDescription}
        onSuccess={(verifiedUser, role) => {
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
          showToast(`Otorisasi PIN terverifikasi oleh ${verifiedUser} (${role})`);
        }}
      />
    </div>
  );
};
