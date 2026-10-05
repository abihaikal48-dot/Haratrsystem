import React, { useState, useMemo } from 'react';
import {
  Store, Users, AlertTriangle, CheckCircle, TrendingUp,
  ArrowUpRight, Award, ShieldAlert, Sparkles, MessageSquare,
  BarChart3, RefreshCw, Calendar, CheckCircle2, ChevronRight,
  Flame, Clock, Filter, ArrowDownRight, UserCheck, ShieldCheck,
  Search, BookOpen, Eye, Copy, Check, Printer, FileText,
  X, Briefcase, GraduationCap, CalendarCheck, UtensilsCrossed,
  Shield, Layers, Target
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
  const [timeframe, setTimeframe] = useState<'ALL' | '30D' | '7D'>('ALL');
  const [activeDivisionTab, setActiveDivisionTab] = useState<Division | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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

  // Operational Shift Checklist
  const [shiftChecklist, setShiftChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('hara_shift_checklist_state_v2');
      return saved ? JSON.parse(saved) : {
        'suhu_fryer': true,
        'marinasi_ayam': true,
        'cuci_tangan': false,
        'kasir_modal': true,
        'display_sambal': false,
      };
    } catch {
      return {
        'suhu_fryer': true,
        'marinasi_ayam': true,
        'cuci_tangan': false,
        'kasir_modal': true,
        'display_sambal': false,
      };
    }
  });

  const handleToggleChecklist = (key: string) => {
    setShiftChecklist(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('hara_shift_checklist_state_v2', JSON.stringify(updated));
      return updated;
    });
  };

  // Filtered by Selected Outlet
  const currentOutlet = useMemo(() => {
    if (selectedOutletCode === 'ALL') return null;
    return outlets.find(o => o.kode_outlet === selectedOutletCode) || null;
  }, [outlets, selectedOutletCode]);

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
    const passRate = totalOJT > 0 ? Math.round(((onTrack + lulusCount) / totalOJT) * 100) : 85;
    
    return {
      totalKru,
      totalOJT,
      passRate,
      remedialCount,
      lulusCount,
      kepatuhanSOP: 92.4, // percentage
      suhuCompliance: 94.0 // percentage
    };
  }, [relevantKru, relevantMonitoring]);

  // Station Data-Dense Matrix
  const stationMatrix = useMemo(() => [
    {
      divisi: 'Kitchen' as Division,
      nama: 'Stasiun Kitchen (Deep Fryer & Bumbu)',
      standarKunci: 'Suhu Fryer 160°C (Kompor 175°C) · Waktu 12 Mnt · Core Temp ≥74°C · Penepungan 10x Cubit',
      kepatuhan: 89.2,
      status: 'Waspada' as 'Normal' | 'Waspada' | 'Optimal',
      catatanKritis: 'Budi Santoso terdeteksi deviasi suhu fryer 160°C anjlok saat rush hour (Status: Remedial Terbimbing).',
      kruAktif: relevantMonitoring.filter(k => k.divisi === 'Kitchen').length
    },
    {
      divisi: 'Helper' as Division,
      nama: 'Stasiun Helper & Bahan Baku',
      standarKunci: 'Rotasi FIFO/FEFO · Thawing Baskom Tertutup Max 12kg (0 Rendam Air) · Timbang Gas Min 7.8kg',
      kepatuhan: 94.5,
      status: 'Normal' as 'Normal' | 'Waspada' | 'Optimal',
      catatanKritis: 'Rizky Pratama dalam pendampingan date tagging wadah marinasi & perawatan chiller 4°C.',
      kruAktif: relevantMonitoring.filter(k => k.divisi === 'Helper').length
    },
    {
      divisi: 'Geprek' as Division,
      nama: 'Stasiun Geprek & Sambal Presisi',
      standarKunci: 'Timbangan Sambal Baku 30g/Porsi · Uleg Cobek Batu (Zero Blender) · Platting 2 Slice Timun',
      kepatuhan: 96.8,
      status: 'Optimal' as 'Normal' | 'Waspada' | 'Optimal',
      catatanKritis: 'Dewi Anggraini lulus Gate 4 dengan predikat A+ (Solo Shift Ready).',
      kruAktif: relevantMonitoring.filter(k => k.divisi === 'Geprek').length
    },
    {
      divisi: 'Kasir' as Division,
      nama: 'Stasiun Kasir & Front Liner',
      standarKunci: '5S Greeting <3 Detik · Sebutkan Stok Warmer · Upselling Wajib · Transaksi POS <45 Detik',
      kepatuhan: 95.1,
      status: 'Optimal' as 'Normal' | 'Waspada' | 'Optimal',
      catatanKritis: 'Siti Rahmawati konsisten dengan speed transaksi 42 detik & closing kas klop 100%.',
      kruAktif: relevantMonitoring.filter(k => k.divisi === 'Kasir').length
    }
  ], [relevantMonitoring]);

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

      {/* Top Bar Context & Outlet Filter Contract */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span>HARA HQ</span>
              <span>/</span>
              <span>OPERASIONAL</span>
              <span>/</span>
              <span className="text-slate-900 font-semibold">EXECUTIVE COCKPIT</span>
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Dashboard Operasional & Pemantauan Kru
            </h1>
          </div>
        </div>

        {/* Controls: Outlet Switcher + Role Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <Store className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedOutletCode}
              onChange={e => onSelectOutletCode && onSelectOutletCode(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Outlet HARA ({outlets.length})</option>
              {outlets.map(o => (
                <option key={o.id} value={o.kode_outlet}>{o.nama_outlet}</option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
            <Shield className="w-3.5 h-3.5 text-red-600" />
            <span>{userRole}: <strong>{currentUser?.nama || 'Haikal Abi'}</strong></span>
          </div>
        </div>
      </div>

      {/* Row 1: Executive KPI Cockpit */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Tingkat Kelulusan OJT</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {kpiData.passRate}%
            </span>
            <span className="text-[11px] font-medium text-emerald-700 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +2.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Target Standar SOP: ≥ 85% kelulusan
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Kepatuhan SOP Stasiun</span>
            <UtensilsCrossed className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {kpiData.kepatuhanSOP}%
            </span>
            <span className="text-[11px] font-medium text-slate-500">4 Stasiun Kerja</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Kitchen · Helper · Geprek · Kasir
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Kohort OJT 30 Hari</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {kpiData.totalOJT}
            </span>
            <span className="text-xs text-slate-500">Kru Aktif</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
            <span className="text-emerald-700 font-semibold">{kpiData.totalOJT - kpiData.remedialCount} On-Track</span>
            <span>·</span>
            <span className="text-red-700 font-semibold">{kpiData.remedialCount} Remedial</span>
          </p>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Integritas Suhu Fryer</span>
            <Flame className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              165° - 170°C
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Stabil</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Core ayam matang ≥ 74°C wajib tercapai
          </p>
        </div>
      </div>

      {/* Row 2: Live OJT 30-Day Training Cohort Mini-Tracker */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-600 mb-0.5">
              <CalendarCheck className="w-4 h-4" />
              <span>LIVE TRACKER OJT 30 HARI</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Progres Kohort Pelatihan Kru & Gate Evaluation
            </h2>
            <p className="text-xs text-slate-500">
              Memantau status rotasi mingguan dan evaluasi gerbang kelulusan hari ke-7, 14, 21, dan 30.
            </p>
          </div>

          <button
            onClick={() => onNavigate('monitoring-training')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Buka Monitoring Kru Lengkap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Crew Cohort Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5">
          {relevantMonitoring.slice(0, 3).map(kru => {
            const isRemedial = kru.status_keseluruhan === 'Kritis / Remedial';
            const isLulus = kru.status_keseluruhan === 'Lulus Bersertifikat';

            return (
              <div
                key={kru.id}
                className={`p-4 rounded-xl border transition-all ${
                  isRemedial
                    ? 'border-red-200 bg-red-50/20'
                    : isLulus
                    ? 'border-blue-200 bg-blue-50/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{kru.nama_kru}</h3>
                    <p className="text-[11px] text-slate-500">{kru.divisi} · {kru.nama_outlet}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    isRemedial
                      ? 'bg-red-100 text-red-800'
                      : isLulus
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {kru.status_keseluruhan}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-mono text-slate-600 mb-1">
                    <span>Hari ke-{kru.hari_berjalan}/30 (Minggu {kru.minggu_aktif})</span>
                    <span className="font-bold">{kru.progres_persen}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isRemedial ? 'bg-red-500' : isLulus ? 'bg-blue-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${kru.progres_persen}%` }}
                    />
                  </div>
                </div>

                {/* Objective status note */}
                <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-slate-600 line-clamp-2">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                    isRemedial ? 'bg-rose-500' : isLulus ? 'bg-blue-500' : 'bg-emerald-500'
                  }`} />
                  <span>
                    {isRemedial
                      ? 'Deviasi suhu fryer 160°C. Terjadwal retraining modul penggorengan.'
                      : isLulus
                      ? 'Gate 4 Lulus dengan predikat A+. Memenuhi syarat Solo Shift.'
                      : 'Seluruh checklist SOP stasiun diselesaikan tepat jadwal.'}
                  </span>
                </div>

                {/* Action shortcut */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Mentor: {kru.mentor_nama.split(' ')[0]}</span>
                  <button
                    onClick={() => onNavigate('monitoring-training')}
                    className="text-[11px] font-semibold text-slate-900 hover:text-red-600 flex items-center gap-0.5"
                  >
                    <span>Detail Evaluasi</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Data-Dense Matrix — 4 Stasiun Kerja SOP */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Matriks Kepatuhan 4 Stasiun Kerja & Deviasi Lapangan
            </h2>
            <p className="text-xs text-slate-500">
              Pengawasan standar teknis stasiun kerja, batas kritis HACCP, dan tindakan korektif real-time.
            </p>
          </div>
          <button
            onClick={() => onNavigate('operasional-sop')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            <span>Bank SOP Stasiun</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-3 px-4">Stasiun Kerja</th>
                <th className="py-3 px-3">Standar Kritis SOP</th>
                <th className="py-3 px-3 text-center">Kepatuhan (%)</th>
                <th className="py-3 px-3">Status Lapangan</th>
                <th className="py-3 px-3">Catatan Observasi Deviasi</th>
                <th className="py-3 px-4 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stationMatrix.map(item => (
                <tr key={item.divisi} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[#8B1418] shrink-0 border border-slate-200/80">
                        {item.divisi === 'Kitchen' ? <ChickenIcon size={16} /> :
                         item.divisi === 'Kasir' ? <CashierIcon size={16} /> :
                         item.divisi === 'Geprek' ? <ChiliIcon size={16} /> : <BroomCleanIcon size={16} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.nama}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{item.kruAktif} kru sedang masa OJT</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 max-w-xs text-slate-600 text-[11px]">
                    {item.standarKunci}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                    <span className={`inline-block px-2 py-0.5 rounded ${
                      item.kepatuhan >= 95 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {item.kepatuhan}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      item.status === 'Optimal'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'Normal'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 text-[11px] max-w-sm">
                    {item.catatanKritis}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setQuickAuditModalOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs transition-colors"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Operational Task Shortcuts & Shift Briefing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Shift Briefing Checklist */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Checklist Pra-Operasional Shift Harian</h3>
              <p className="text-[11px] text-slate-500">Verifikasi 5 parameter wajib sebelum operasional gerai dibuka</p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {Object.values(shiftChecklist).filter(Boolean).length}/5 Terverifikasi
            </span>
          </div>

          <div className="space-y-2 mt-4">
            {[
              { key: 'suhu_fryer', label: 'Cek suhu digital fryer mencapai 165°C - 170°C stabil sebelum ayam masuk' },
              { key: 'marinasi_ayam', label: 'Verifikasi stok ayam termarinasi minimal 60 menit & tersimpan di chiller 2°C - 4°C' },
              { key: 'cuci_tangan', label: 'Seluruh kru mempraktikkan 6 langkah cuci tangan dengan sabun & memakai hairnet' },
              { key: 'kasir_modal', label: 'Uang modal kasir dihitung & printer struk berfungsi normal' },
              { key: 'display_sambal', label: 'Display sambal geprek baru terisi & sendok takar 25 gram siap di tempat' }
            ].map(task => {
              const checked = shiftChecklist[task.key];
              return (
                <div
                  key={task.key}
                  onClick={() => handleToggleChecklist(task.key)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    checked ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-amber-50/50 border-amber-200 text-amber-900 font-medium'
                  }`}
                >
                  <span className="text-xs">{task.label}</span>
                  <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ml-3 ${
                    checked ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {checked && <Check className="w-3 h-3" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Hub Navigation Cards */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Aksi Cepat Trainer & Supervisor</h3>
            <p className="text-[11px] text-slate-500 mb-4">Pintas langsung ke dokumen dan modul terpadu</p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigate('evaluasi-kompetensi')}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-left flex items-center justify-between text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-red-600" />
                  <span className="font-medium">Input Ujian Teori & Praktik</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('laporan-resmi')}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-left flex items-center justify-between text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Pusat Rapor Resmi Kru (A4)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('operasional-sop')}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-left flex items-center justify-between text-xs text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">Katalog SOP 4 Stasiun & Soal</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Keamanan: <strong>PIN Guard Aktif</strong></span>
            <span className="font-mono text-emerald-700">100% Acuan SOP</span>
          </div>
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
