import React, { useState, useMemo } from 'react';
import {
  Store, Users, AlertTriangle, CheckCircle, TrendingUp,
  ArrowUpRight, Award, ShieldAlert, Sparkles, MessageSquare,
  BarChart3, RefreshCw, Calendar, CheckCircle2, ChevronRight,
  Flame, Clock, Filter, ArrowDownRight, UserCheck, ShieldCheck,
  Search, BookOpen, Eye, Copy, Check, Printer, FileText,
  X, Briefcase, GraduationCap, CalendarCheck, UtensilsCrossed,
  Shield, Layers, Target, MoreVertical, CheckSquare, Square,
  SlidersHorizontal, ChevronDown
} from 'lucide-react';
import { db } from '../lib/storage';
import {
  Outlet, Kru, TNA, KartuKeluhan, LogAktivitas,
  Division, OfficialRaporKru, OJTCrewMonitoringRecord
} from '../types';
import { NavTab } from './Sidebar';
import { TouchAuditModal } from './TouchAuditModal';
import { SecurityPINModal } from './SecurityPINModal';
import { ChickenIcon, CashierIcon, ChiliIcon, BroomCleanIcon } from './ui/Icons';

interface DashboardViewProps {
  onNavigate: (tab: NavTab) => void;
  selectedOutletCode: string;
  onOpenAICoach: () => void;
  onSelectOutletCode?: (code: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  selectedOutletCode,
  onOpenAICoach,
  onSelectOutletCode,
}) => {
  // Master state from Storage Database
  const [outlets, setOutlets] = useState<Outlet[]>(() => db.getOutlets());
  const [kruList, setKruList] = useState<Kru[]>(() => db.getKru());
  const [monitoringList, setMonitoringList] = useState<OJTCrewMonitoringRecord[]>(() => db.getOJTMonitoring());
  const [keluhanList, setKeluhanList] = useState<KartuKeluhan[]>(() => db.getKartuKeluhan());

  // Interactive UI Filters & Controls
  const [timeframe, setTimeframe] = useState<'Hari Ini' | 'Minggu Ini' | 'Bulan Ini'>('Minggu Ini');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Activity Feed Filter (Today, Yesterday, This Week)
  const [activityPeriod, setActivityPeriod] = useState<'today' | 'yesterday' | 'week'>('today');
  const [activitySearch, setActivitySearch] = useState('');

  // Selected bar chart day for interactive tooltip
  const [selectedChartDay, setSelectedChartDay] = useState<string>('Tue');

  // SLA Table state (multi-select & search)
  const [slaSearch, setSlaSearch] = useState('');
  const [selectedSlaIds, setSelectedSlaIds] = useState<Record<string, boolean>>({
    '#ST-01': true,
  });

  // Security and Modals
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [quickAuditModalOpen, setQuickAuditModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [pinDescription, setPinDescription] = useState('');

  const currentUser = useMemo(() => db.getCurrentUser(), []);
  const userRole = currentUser?.role || 'Trainer';

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const relevantKru = useMemo(() => {
    if (selectedOutletCode === 'ALL') return kruList;
    return kruList.filter(k => k.kode_outlet === selectedOutletCode);
  }, [kruList, selectedOutletCode]);

  const relevantMonitoring = useMemo(() => {
    if (selectedOutletCode === 'ALL') return monitoringList;
    return monitoringList.filter(k => k.kode_outlet === selectedOutletCode);
  }, [monitoringList, selectedOutletCode]);

  // Executive KPI Computations
  const kpiData = useMemo(() => {
    const totalKru = relevantKru.length;
    const totalOJT = relevantMonitoring.length;
    const onTrack = relevantMonitoring.filter(k => k.status_keseluruhan === 'On-Track').length;
    const remedialCount = relevantMonitoring.filter(k => k.status_keseluruhan === 'Kritis / Remedial').length;
    const lulusCount = relevantMonitoring.filter(k => k.status_keseluruhan === 'Lulus Bersertifikat').length;
    
    // Pass rate percentage
    const passRate = totalOJT > 0 ? Math.round(((onTrack + lulusCount) / totalOJT) * 100) : 88;
    
    return {
      totalKru,
      totalOJT: totalOJT || 14,
      passRate,
      remedialCount: remedialCount || 2,
      lulusCount: lulusCount || 4,
      kepatuhanSOP: 94.5, // percentage
      suhuCompliance: 96.8 // percentage
    };
  }, [relevantKru, relevantMonitoring]);

  // Daily Chart Trend Data (Volume Trend)
  const chartDays = [
    { day: 'Sun', label: 'Min', val: 320, audits: 11 },
    { day: 'Mon', label: 'Sen', val: 460, audits: 14 },
    { day: 'Tue', label: 'Sel', val: 584, audits: 18, isHighlight: true },
    { day: 'Wed', label: 'Rab', val: 490, audits: 15 },
    { day: 'Thu', label: 'Kam', val: 530, audits: 16 },
    { day: 'Fri', label: 'Jum', val: 410, audits: 13 },
    { day: 'Sat', label: 'Sab', val: 620, audits: 19 },
  ];

  // Activities Data (Latest Updates panel)
  const activitiesList = [
    {
      id: 'act-1',
      period: 'today',
      type: 'sop',
      title: 'SOP Frying 160°C Dikalibrasi',
      desc: 'HC-JTS01 Kitchen: Termometer digital deep fryer terkalibrasi normal.',
      time: '11:20 AM',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'act-2',
      period: 'today',
      type: 'crew',
      title: 'Kru Baru Onboarding OJT',
      desc: 'Rizky Pratama resmi masuk tahap OJT Helper di HC-BTL01.',
      time: '11:15 AM',
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'act-3',
      period: 'today',
      type: 'gate',
      title: 'Evaluasi Gate 3 Disetujui',
      desc: 'Dewi Anggraini (Geprek HC-CKR01) lulus syarat Solo Shift Ready.',
      time: '11:00 AM',
      iconBg: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'act-4',
      period: 'today',
      type: 'alert',
      title: 'Deviasi Suhu Terdeteksi',
      desc: 'HC-BTL01 Kompor: Suhu sempat turun di bawah 160°C saat rush hour.',
      time: '10:45 AM',
      iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      id: 'act-5',
      period: 'today',
      type: 'exam',
      title: 'Ujian Teori Kasir Selesai',
      desc: 'Siti Rahmawati memperoleh nilai 95/100 pada uji POS & 5S Greeting.',
      time: '10:30 AM',
      iconBg: 'bg-sky-50 text-sky-700 border-sky-200',
    },
    {
      id: 'act-6',
      period: 'today',
      type: 'report',
      title: 'Rapor Resmi A4 Diterbitkan',
      desc: 'Rapor kru Budi Santoso telah diverifikasi Lead Trainer.',
      time: '10:15 AM',
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'act-7',
      period: 'yesterday',
      type: 'sop',
      title: 'Inspeksi Kebersihan 5S Area Makan',
      desc: 'Sanitasi meja & hand sanitizer HC-JTS01 klop 100%.',
      time: 'Kemarin 04:30 PM',
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'act-8',
      period: 'yesterday',
      type: 'crew',
      title: 'Rotasi Shift Kasir & Settlement',
      desc: 'Closing kasir shift malam klop tanpa selisih transaksi.',
      time: 'Kemarin 02:15 PM',
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ];

  const filteredActivities = activitiesList.filter(item => {
    if (activityPeriod === 'today' && item.period !== 'today') return false;
    if (activityPeriod === 'yesterday' && item.period !== 'yesterday') return false;
    if (activitySearch.trim()) {
      const q = activitySearch.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
    }
    return true;
  });

  // SLA Monitoring Items (Bottom Table)
  const slaItems = [
    {
      id: '#ST-01',
      divisi: 'Kitchen' as Division,
      standar: 'Suhu Fryer 160°C & Core Temp Ayam ≥74°C',
      priority: 'High',
      assignedTo: { name: 'Budi Santoso', initials: 'BS', role: 'Kitchen Kru' },
      status: 'In Review',
      createdDate: '2026-10-05',
      slaDue: '2h left',
      slaDueClass: 'text-amber-700 font-bold',
    },
    {
      id: '#ST-02',
      divisi: 'Kasir' as Division,
      standar: '5S Greeting <3s & Waktu Transaksi POS <45s',
      priority: 'Medium',
      assignedTo: { name: 'Siti Rahmawati', initials: 'SR', role: 'Kasir Utama' },
      status: 'Optimal',
      createdDate: '2026-10-05',
      slaDue: '1h left',
      slaDueClass: 'text-emerald-700 font-medium',
    },
    {
      id: '#ST-03',
      divisi: 'Geprek' as Division,
      standar: 'Gramatur Sambal Baku 30g & Cobek Batu Manual',
      priority: 'Low',
      assignedTo: { name: 'Dewi Anggraini', initials: 'DA', role: 'Geprek Specialist' },
      status: 'In Progress',
      createdDate: '2026-10-04',
      slaDue: '1d left',
      slaDueClass: 'text-slate-600',
    },
    {
      id: '#ST-04',
      divisi: 'Helper' as Division,
      standar: 'Rotasi FIFO Chiller 2°C - 4°C & Thawing Tertutup',
      priority: 'Medium',
      assignedTo: { name: 'Rizky Pratama', initials: 'RP', role: 'Helper Trainee' },
      status: 'In Progress',
      createdDate: '2026-10-04',
      slaDue: '9h left',
      slaDueClass: 'text-slate-600',
    },
    {
      id: '#ST-05',
      divisi: 'Kitchen' as Division,
      standar: 'Penepungan Keriting 10x Cubit & Ayak Bersih',
      priority: 'High',
      assignedTo: { name: 'Haikal Abi', initials: 'HA', role: 'Trainer Mentor' },
      status: 'In Review',
      createdDate: '2026-10-05',
      slaDue: '3h left',
      slaDueClass: 'text-amber-700 font-bold',
    },
  ];

  const filteredSla = slaItems.filter(item => {
    if (slaSearch.trim()) {
      const q = slaSearch.toLowerCase();
      return item.id.toLowerCase().includes(q) ||
             item.standar.toLowerCase().includes(q) ||
             item.assignedTo.name.toLowerCase().includes(q) ||
             item.divisi.toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggleSla = (id: string) => {
    setSelectedSlaIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleToggleAllSla = () => {
    const allChecked = slaItems.every(i => selectedSlaIds[i.id]);
    const next: Record<string, boolean> = {};
    slaItems.forEach(i => {
      next[i.id] = !allChecked;
    });
    setSelectedSlaIds(next);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Greeting Header (Nuvio Style Greeting & Action Bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Halo, {currentUser?.nama || 'Haikal Abi'}</span>
            <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Berikut ringkasan performa dan wawasan terkini dari operasional & pelatihan gerai HARA Chicken.
          </p>
        </div>

        {/* Controls: Timeframe selector & Outlet dropdown */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Outlet Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs shadow-2xs">
            <Store className="w-3.5 h-3.5 text-[#8B1418]" />
            <select
              value={selectedOutletCode}
              onChange={e => onSelectOutletCode && onSelectOutletCode(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Gerai ({outlets.length})</option>
              {outlets.map(o => (
                <option key={o.id} value={o.kode_outlet}>{o.kode_outlet} — {o.nama_outlet}</option>
              ))}
            </select>
          </div>

          {/* Timeframe Selector (Nuvio dropdown button) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Hari Ini">Hari Ini</option>
              <option value="Minggu Ini">Minggu Ini</option>
              <option value="Bulan Ini">Bulan Ini</option>
            </select>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => onNavigate('monitoring-training')}
            className="px-3.5 py-1.5 rounded-xl bg-[#8B1418] hover:bg-[#720e12] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Buka OJT 30 Hari</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 1: Modern KPI Stat Cards with Mini Sparklines (Nuvio Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Kelulusan OJT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tingkat Kelulusan OJT</span>
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200/60">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                {kpiData.passRate}%
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                <span>+4.2%</span>
                <span className="text-slate-400 font-normal">vs bulan lalu</span>
              </div>
            </div>
            {/* Mini SVG Sparkline */}
            <svg className="w-20 h-9 shrink-0 text-emerald-500" viewBox="0 0 100 40" fill="none">
              <path
                d="M5 30 Q 25 35, 45 20 T 75 18 T 95 8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M5 30 Q 25 35, 45 20 T 75 18 T 95 8 L 95 40 L 5 40 Z"
                fill="currentColor"
                className="opacity-10"
              />
            </svg>
          </div>
        </div>

        {/* KPI 2: Kepatuhan SOP Stasiun */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Kepatuhan SOP Stasiun</span>
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200/60">
              <UtensilsCrossed className="w-3.5 h-3.5 text-sky-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                {kpiData.kepatuhanSOP}%
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                <span>+2.1%</span>
                <span className="text-slate-400 font-normal">vs standar gerai</span>
              </div>
            </div>
            {/* Mini SVG Sparkline */}
            <svg className="w-20 h-9 shrink-0 text-sky-500" viewBox="0 0 100 40" fill="none">
              <path
                d="M5 28 Q 30 10, 50 24 T 80 14 T 95 6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M5 28 Q 30 10, 50 24 T 80 14 T 95 6 L 95 40 L 5 40 Z"
                fill="currentColor"
                className="opacity-10"
              />
            </svg>
          </div>
        </div>

        {/* KPI 3: Integritas Suhu Fryer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Integritas Suhu Fryer</span>
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200/60">
              <Flame className="w-3.5 h-3.5 text-[#8B1418]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                {kpiData.suhuCompliance}%
              </div>
              <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mt-1">
                <span className="text-slate-800">160° - 170°C</span>
                <span className="text-slate-400 font-normal">Terkalibrasi</span>
              </div>
            </div>
            {/* Mini SVG Sparkline */}
            <svg className="w-20 h-9 shrink-0 text-rose-500" viewBox="0 0 100 40" fill="none">
              <path
                d="M5 20 Q 30 35, 55 15 T 80 18 T 95 10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M5 20 Q 30 35, 55 15 T 80 18 T 95 10 L 95 40 L 5 40 Z"
                fill="currentColor"
                className="opacity-10"
              />
            </svg>
          </div>
        </div>

        {/* KPI 4: Kohort Kru OJT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Kru OJT Aktif</span>
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200/60">
              <Users className="w-3.5 h-3.5 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                {kpiData.totalOJT}
              </div>
              <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mt-1">
                <span className="text-emerald-700">{kpiData.totalOJT - kpiData.remedialCount} On-Track</span>
                <span className="text-slate-300">·</span>
                <span className="text-rose-700">{kpiData.remedialCount} Remedial</span>
              </div>
            </div>
            {/* Mini SVG Sparkline */}
            <svg className="w-20 h-9 shrink-0 text-purple-500" viewBox="0 0 100 40" fill="none">
              <path
                d="M5 25 Q 30 18, 50 30 T 75 12 T 95 8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M5 25 Q 30 18, 50 30 T 75 12 T 95 8 L 95 40 L 5 40 Z"
                fill="currentColor"
                className="opacity-10"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Row 2: 2-Column Composition (Bar Chart Trend + Latest Updates Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Volume Trend Bar Chart (approx 65% width) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <BarChart3 className="w-4 h-4 text-[#8B1418]" />
                <span>Tren Volume Evaluasi & Audit Gerai</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Periode:</span>
                <span className="text-xs font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                  Minggu Terakhir
                </span>
              </div>
            </div>

            {/* Total Metric Header */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                4,790
              </span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> +8% vs minggu lalu
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Akumulasi poin kepatuhan SOP & penyelesaian checklist modul harian
            </p>

            {/* Interactive Bar Chart (Nuvio Layout) */}
            <div className="mt-8 relative pt-8 pb-4">
              {/* Benchmark Reference Line at 500 */}
              <div className="absolute left-0 right-10 top-18 border-b border-dashed border-slate-200 flex items-center justify-end">
                <span className="text-[10px] font-mono text-slate-400 pr-2 -mt-4">
                  Target: 500
                </span>
              </div>

              {/* Bars Container */}
              <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-48 px-2 sm:px-6">
                {chartDays.map(item => {
                  const isSelected = selectedChartDay === item.day;
                  const heightPercent = Math.round((item.val / 800) * 100);

                  return (
                    <div
                      key={item.day}
                      onClick={() => setSelectedChartDay(item.day)}
                      className="flex flex-col items-center gap-2 group cursor-pointer relative"
                    >
                      {/* Floating Tooltip if selected (Nuvio Style Charcoal Tooltip) */}
                      {isSelected && (
                        <div className="absolute -top-11 z-20 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in zoom-in-95">
                          <span>{item.day}: {item.val}</span>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                        </div>
                      )}

                      {/* Bar Pillar */}
                      <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden h-40 flex items-end">
                        <div
                          className={`w-full rounded-t-xl transition-all duration-300 ${
                            isSelected
                              ? 'bg-slate-900'
                              : 'bg-slate-200 group-hover:bg-slate-300'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      {/* X-Axis Day Label */}
                      <span className={`text-xs transition-colors ${
                        isSelected ? 'font-bold text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                      }`}>
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Card Summary */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Rata-rata Harian: <strong className="text-slate-800">684 Poin</strong></span>
            <button
              onClick={() => onNavigate('analitik-radar')}
              className="font-semibold text-[#8B1418] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Analisis Radar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Latest Updates Feed Panel (Nuvio Style) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Aktivitas Terkini</h2>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>

            {/* Segmented Filter: Today / Yesterday / This week */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mt-3 text-xs font-semibold">
              <button
                onClick={() => setActivityPeriod('today')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  activityPeriod === 'today'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setActivityPeriod('yesterday')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  activityPeriod === 'yesterday'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kemarin
              </button>
              <button
                onClick={() => setActivityPeriod('week')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                  activityPeriod === 'week'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Minggu Ini
              </button>
            </div>

            {/* Search Input for Activities */}
            <div className="relative mt-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={activitySearch}
                onChange={e => setActivitySearch(e.target.value)}
                placeholder="Cari aktivitas..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            <div className="text-[11px] font-semibold text-slate-400 mt-3 mb-2">
              {filteredActivities.length} aktivitas tercatat
            </div>

            {/* Activities List */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {filteredActivities.map(item => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-2.5"
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${item.iconBg}`}>
                    {item.type === 'sop' ? <UtensilsCrossed size={13} /> :
                     item.type === 'crew' ? <Users size={13} /> :
                     item.type === 'gate' ? <Award size={13} /> :
                     item.type === 'alert' ? <AlertTriangle size={13} /> :
                     item.type === 'exam' ? <BookOpen size={13} /> : <FileText size={13} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-1 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-right">
            <button
              onClick={() => onNavigate('supervisi-lapangan')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1 ml-auto cursor-pointer"
            >
              <span>Semua Log Aktivitas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: SLA Monitoring Data Grid (Nuvio Bottom Table Style) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Top Header with Search & Filter */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#8B1418]" />
            <h2 className="text-sm font-bold text-slate-900">
              Pemantauan Standar Kritis Stasiun (SLA Monitoring)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={slaSearch}
                onChange={e => setSlaSearch(e.target.value)}
                placeholder="Cari stasiun/SOP..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors w-48 sm:w-60"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setQuickAuditModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Audit Cepat</span>
            </button>
          </div>
        </div>

        {/* The Clean Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={slaItems.every(i => selectedSlaIds[i.id])}
                    onChange={handleToggleAllSla}
                    className="w-3.5 h-3.5 rounded accent-slate-900 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">ID Stasiun</th>
                <th className="py-3 px-3">Fokus Kritis Standar SOP</th>
                <th className="py-3 px-3">Prioritas</th>
                <th className="py-3 px-3">Penanggung Jawab (PIC)</th>
                <th className="py-3 px-3">Status Mutu</th>
                <th className="py-3 px-3">Tanggal Inspeksi</th>
                <th className="py-3 px-3">Tenggat SLA</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSla.map(item => {
                const isChecked = !!selectedSlaIds[item.id];

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isChecked ? 'bg-slate-50/90' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSla(item.id)}
                        className="w-3.5 h-3.5 rounded accent-slate-900 cursor-pointer"
                      />
                    </td>

                    {/* ID */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {item.id}
                    </td>

                    {/* Fokus Standar SOP */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-[#8B1418] shrink-0 border border-slate-200/80">
                          {item.divisi === 'Kitchen' ? <ChickenIcon size={12} /> :
                           item.divisi === 'Kasir' ? <CashierIcon size={12} /> :
                           item.divisi === 'Geprek' ? <ChiliIcon size={12} /> : <BroomCleanIcon size={12} />}
                        </div>
                        <span className="font-semibold text-slate-800 line-clamp-1">{item.standar}</span>
                      </div>
                    </td>

                    {/* Priority Bar Indicator (Nuvio Style) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          <span className={`w-1 h-3 rounded-full ${
                            item.priority === 'High' ? 'bg-rose-500' :
                            item.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-400'
                          }`} />
                          <span className={`w-1 h-3 rounded-full ${
                            item.priority === 'High' ? 'bg-rose-500' :
                            item.priority === 'Medium' ? 'bg-amber-500' : 'bg-slate-200'
                          }`} />
                          <span className={`w-1 h-3 rounded-full ${
                            item.priority === 'High' ? 'bg-rose-500' : 'bg-slate-200'
                          }`} />
                        </div>
                        <span className="text-[11px] font-medium text-slate-600">{item.priority}</span>
                      </div>
                    </td>

                    {/* Assigned To (Avatar + Name) */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center border border-slate-300">
                          {item.assignedTo.initials}
                        </div>
                        <span className="font-medium text-slate-800">{item.assignedTo.name}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                        item.status === 'Optimal'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                          : item.status === 'In Review'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200/60'
                          : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {item.createdDate}
                    </td>

                    {/* SLA Due */}
                    <td className={`py-3 px-3 font-mono text-[11px] ${item.slaDueClass}`}>
                      {item.slaDue}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          showToast(`Membuka audit untuk ${item.id}`);
                          setQuickAuditModalOpen(true);
                        }}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Opsi Lanjutan"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Touch Audit Modal */}
      <TouchAuditModal
        isOpen={quickAuditModalOpen}
        onClose={() => setQuickAuditModalOpen(false)}
        selectedOutletCode={selectedOutletCode}
      />

      {/* Security PIN Modal */}
      <SecurityPINModal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        description={pinDescription}
        onSuccess={(user, role) => {
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
          showToast(`Otorisasi berhasil oleh ${user} (${role})`);
        }}
      />
    </div>
  );
};
