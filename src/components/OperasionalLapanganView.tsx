import React, { useState, useEffect, useMemo } from 'react';
import {
  Eye, MessageSquare, Search, Calendar, AlertTriangle, Award,
  BarChart3, Plus, Filter, Download, Sparkles, CheckCircle2,
  Clock, AlertCircle, TrendingUp, ShieldAlert, ArrowRight,
  UserCheck, Store, RefreshCw, Trash2, Edit3, ChevronRight,
  HelpCircle, ChevronDown, Check, X, ShieldCheck, Flame,
  FileText, CornerDownRight, Target, Lightbulb, HeartHandshake,
  Users, Activity, PlayCircle, CheckSquare, Layers, Star
} from 'lucide-react';
import { db } from '../lib/storage';
import {
  ObservasiLapangan, CoachingLog, TNA, RencanaTraining,
  KartuKeluhan, TalentTracker, GapAnalysis, Outlet, Kru,
  Division, Prioritas, StatusTNA, StatusTraining, StatusKeluhan
} from '../types';
import { AIActionType } from './AIActionModal';
import { ModernOptionSelector } from './ModernOptionSelector';
import { PageHeaderBanner } from './PageHeaderBanner';
import { RCAFishboneModal } from './RCAFishboneModal';
import { TouchAuditModal } from './TouchAuditModal';

export type OperasionalSubTab =
  | 'observasi'
  | 'coaching'
  | 'tna'
  | 'rencana'
  | 'keluhan'
  | 'talent'
  | 'gap';

interface OperasionalLapanganViewProps {
  initialSubTab?: OperasionalSubTab;
  selectedOutletCode: string;
  onOpenAIAction: (type: AIActionType, row: any, title: string) => void;
  onSelectOutletCode?: (code: string) => void;
  allowedSubTabs?: OperasionalSubTab[];
  customTitle?: string;
  customCategory?: string;
  customDescription?: string;
}

export const OperasionalLapanganView: React.FC<OperasionalLapanganViewProps> = ({
  initialSubTab = 'observasi',
  selectedOutletCode,
  onOpenAIAction,
  allowedSubTabs,
  customTitle,
  customCategory,
  customDescription,
}) => {
  const [activeTab, setActiveTab] = useState<OperasionalSubTab>(initialSubTab);

  // Master Data
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [observasiList, setObservasiList] = useState<ObservasiLapangan[]>([]);
  const [coachingList, setCoachingList] = useState<CoachingLog[]>([]);
  const [tnaList, setTnaList] = useState<TNA[]>([]);
  const [rencanaList, setRencanaList] = useState<RencanaTraining[]>([]);
  const [keluhanList, setKeluhanList] = useState<KartuKeluhan[]>([]);
  const [talentList, setTalentList] = useState<TalentTracker[]>([]);
  const [gapList, setGapList] = useState<GapAnalysis[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivision, setFilterDivision] = useState<Division | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals & Forms State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTouchAuditOpen, setIsTouchAuditOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // RCA & Fishbone State
  const [showFishboneModal, setShowFishboneModal] = useState(false);
  const [selectedFishboneComplaint, setSelectedFishboneComplaint] = useState<KartuKeluhan | null>(null);

  // Quick Audit Wizard / GROW Guided Step
  const [selectedObsAuditSOP, setSelectedObsAuditSOP] = useState<string>('SOP Suhu Minyak & Penggorengan');
  const [quickChecklist, setQuickChecklist] = useState<Record<string, boolean>>({
    step1: true,
    step2: true,
    step3: false,
    step4: true,
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadData = () => {
    setOutlets(db.getTable<Outlet>('outlets'));
    setKruList(db.getTable<Kru>('kru'));
    setObservasiList(db.getTable<ObservasiLapangan>('observasi_lapangan'));
    setCoachingList(db.getTable<CoachingLog>('coaching_log'));
    setTnaList(db.getTable<TNA>('tna'));
    setRencanaList(db.getTable<RencanaTraining>('rencana_training'));
    setKeluhanList(db.getTable<KartuKeluhan>('kartu_keluhan'));
    setTalentList(db.getTable<TalentTracker>('talent_tracker'));
    setGapList(db.getTable<GapAnalysis>('gap_analysis'));
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, []);

  // Sync initial tab when props change
  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const outletOptions = useMemo(() => {
    return outlets.map((o) => o.kode_outlet);
  }, [outlets]);

  // Operational KPIs calculation
  const summaryStats = useMemo(() => {
    const filterByOutlet = (items: { kode_outlet: string }[]) => {
      if (selectedOutletCode === 'ALL') return items;
      return items.filter((i) => i.kode_outlet === selectedOutletCode);
    };

    const obs = filterByOutlet(observasiList);
    const obsCritical = obs.filter((o: any) => o.hasil === 'Kritis').length;
    const coach = filterByOutlet(coachingList);
    const tna = filterByOutlet(tnaList);
    const tnaOpen = tna.filter((t: any) => t.status === 'Belum' || t.status === 'Proses').length;
    const keluhan = filterByOutlet(keluhanList);
    const keluhanResolved = keluhan.filter((k: any) => k.status === 'Selesai').length;
    const keluhanRate = keluhan.length > 0 ? Math.round((keluhanResolved / keluhan.length) * 100) : 100;
    const talent = filterByOutlet(talentList);
    const rencana = filterByOutlet(rencanaList);

    return {
      totalObs: obs.length,
      obsCritical,
      totalCoach: coach.length,
      totalTNA: tna.length,
      tnaOpen,
      totalKeluhan: keluhan.length,
      keluhanRate,
      totalTalent: talent.length,
      totalRencana: rencana.length,
    };
  }, [observasiList, coachingList, tnaList, keluhanList, talentList, rencanaList, selectedOutletCode]);

  // Early-Warning Pola Berulang (Lean Six Sigma)
  const polaBerulangAlerts = useMemo(() => {
    const counts: Record<string, { outlet: string; tipe: string; count: number; items: KartuKeluhan[] }> = {};
    for (const k of keluhanList) {
      const key = `${k.kode_outlet}-${k.tipe}`;
      if (!counts[key]) {
        counts[key] = { outlet: k.kode_outlet, tipe: k.tipe, count: 0, items: [] };
      }
      counts[key].count += 1;
      counts[key].items.push(k);
    }
    return Object.values(counts).filter((c) => c.count >= 2);
  }, [keluhanList]);

  // Form Management
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleOpenAdd = () => {
    setEditItem(null);
    const initial: Record<string, any> = {
      kode_outlet: selectedOutletCode !== 'ALL' ? selectedOutletCode : outletOptions[0] || 'HC-JKT01',
    };

    if (activeTab === 'observasi') {
      initial.tanggal_shift = `${new Date().toLocaleDateString('id-ID')} - Siang (Peak Hour)`;
      initial.nama_kru = kruList[0]?.nama_kru || '';
      initial.divisi = 'Kitchen';
      initial.standar_sop_diamati = 'SOP Penggorengan Ayam & Uji Suhu Minyak (165°C)';
      initial.hasil = 'Sesuai Standar';
      initial.catatan_detail = 'Kru mematuhi parameter suhu dan waktu tiris dengan tertib.';
      initial.rencana_follow_up = 'Pertahankan konsistensi pada shift malam.';
    } else if (activeTab === 'coaching') {
      initial.tanggal = new Date().toISOString().slice(0, 10);
      initial.nama_kru = kruList[0]?.nama_kru || '';
      initial.goal = 'Meningkatkan kecepatan wrapping ayam dari 45 detik menjadi <25 detik.';
      initial.reality = 'Saat rush hour sering ragu melipat kemasan kertas sehingga antrean menumpuk.';
      initial.options = 'Latihan simulasi 20 pcs sebelum shift buka dan standarisasi tata letak stiker.';
      initial.will = 'Berlatih mandiri 15 menit setiap pagi dan evaluasi ulang dalam 7 hari.';
      initial.hasil_follow_up = 'Dalam pemantauan';
    } else if (activeTab === 'tna') {
      initial.tanggal = new Date().toISOString().slice(0, 10);
      initial.divisi = 'Kasir';
      initial.sumber_temuan = 'Audit Pelayanan Trainer & Mystery Shopper';
      initial.deskripsi_gap = 'Kru kasir belum konsisten menawarkan upselling paket minum dan senyum 5S.';
      initial.jenis_gap = 'Keterampilan';
      initial.prioritas = 'Tinggi';
      initial.rencana_tindak_lanjut = 'Sesi Roleplay Upselling 30 menit dan modul Senyum Sapa 5S.';
      initial.status = 'Belum';
    } else if (activeTab === 'rencana') {
      initial.tanggal_pelaksanaan = new Date().toISOString().slice(0, 10);
      initial.topik = 'Refreshment SOP Sanitasi & Food Safety HACCP';
      initial.tujuan_pembelajaran = 'Memastikan standar pembersihan wastafel, deep fryer, dan higienitas APD 100%.';
      initial.peserta = 'Seluruh Kru Kitchen & Helper Shift 1';
      initial.metode = 'Demonstrasi Lapangan & Praktik Mandiri';
      initial.durasi = '60 Menit';
      initial.alat_bantu = 'Checklist Kebersihan, Termometer, Hand Sanitizer';
      initial.fasilitator = 'Haikal Abi (Trainer Operasional)';
      initial.status = 'Direncanakan';
    } else if (activeTab === 'keluhan') {
      initial.tanggal_shift = `${new Date().toLocaleDateString('id-ID')} - Shift 2`;
      initial.tipe = 'Produk/Rasa';
      initial.deskripsi_keluhan = 'Pelanggan komplain kulit ayam kurang renyah dan sedikit berminyak.';
      initial.nama_kru_terkait = kruList[0]?.nama_kru || '';
      initial.tindakan_diambil = 'Mengganti produk dengan batch baru yang fresh dan meminta maaf kepada pelanggan.';
      initial.status = 'Dalam kajian';
      initial.tindak_lanjut_training = 'Kalibrasi ulang timer penirisan minyak selama minimal 3 menit.';
    } else if (activeTab === 'talent') {
      initial.nama_kandidat = kruList[0]?.nama_kru || '';
      initial.divisi = 'Kitchen';
      initial.target_posisi = 'Head Cook / Shift Leader';
      initial.tanggung_jawab_uji_coba = 'Memimpin opening checklist dapur dan mengontrol waste harian.';
      initial.progres_terkini = '85% - Sangat cakap memimpin tim shift dan cepat tanggap.';
      initial.target_waktu_siap = 'Oktober 2026';
    } else if (activeTab === 'gap') {
      initial.nama_kru = kruList[0]?.nama_kru || '';
      initial.divisi = 'Kitchen';
      initial.kompetensi_dinilai = 'Pengoperasian & Pembersihan Deep Fryer';
      initial.skor_standar = 4;
      initial.skor_aktual = 3;
      initial.rekomendasi = 'Pendampingan khusus pembersihan saringan minyak saat closing shift.';
    }

    setFormData(initial);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditItem(item);
    setFormData({ ...item });
    setIsAddModalOpen(true);
  };

  const handleDeleteItem = (table: string, id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data operasional ini?')) {
      db.deleteRow(table, id);
      showToast('Data berhasil dihapus dari sistem.');
      loadData();
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    let table = '';
    if (activeTab === 'observasi') table = 'observasi_lapangan';
    else if (activeTab === 'coaching') table = 'coaching_log';
    else if (activeTab === 'tna') table = 'tna';
    else if (activeTab === 'rencana') table = 'rencana_training';
    else if (activeTab === 'keluhan') table = 'kartu_keluhan';
    else if (activeTab === 'talent') table = 'talent_tracker';
    else if (activeTab === 'gap') table = 'gap_analysis';

    if (!table) return;

    if (editItem) {
      db.updateRow(table, editItem.id, formData);
      showToast('Data berhasil diperbarui!');
    } else {
      db.insertRow(table, formData);
      showToast('Data baru berhasil ditambahkan!');
    }

    setIsAddModalOpen(false);
    setEditItem(null);
    loadData();
  };

  // Convert TNA to Rencana Training directly
  const handleConvertTNAToTraining = (tnaItem: TNA) => {
    const newTraining: Partial<RencanaTraining> = {
      kode_outlet: tnaItem.kode_outlet,
      topik: `Pelatihan Remediasi: ${tnaItem.divisi} - ${tnaItem.jenis_gap}`,
      tujuan_pembelajaran: `Menutup kesenjangan: ${tnaItem.deskripsi_gap}`,
      peserta: `Kru Divisi ${tnaItem.divisi} (${tnaItem.kode_outlet})`,
      metode: 'Demonstrasi Praktik & Drill Lapangan Langsung',
      durasi: '75 Menit',
      alat_bantu: 'SOP Sheet, Lembar Evaluasi Praktik',
      fasilitator: 'Trainer Area / Head Cook',
      tanggal_pelaksanaan: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
      status: 'Direncanakan',
    };

    db.insertRow('rencana_training', newTraining);
    db.updateRow('tna', tnaItem.id, { status: 'Proses' });
    showToast('TNA berhasil dikonversi ke Rencana Training Terjadwal!');
    setActiveTab('rencana');
    loadData();
  };

  // Sub Tab Navigation Items
  const TABS_CONFIG = [
    {
      id: 'observasi' as OperasionalSubTab,
      label: 'Observasi Lapangan',
      icon: Eye,
      count: observasiList.length,
      desc: 'Audit kepatuhan SOP saat shift & peak hour',
    },
    {
      id: 'coaching' as OperasionalSubTab,
      label: 'GROW Coaching Room',
      icon: MessageSquare,
      count: coachingList.length,
      desc: 'Bimbingan 1-on-1 terstruktur',
    },
    {
      id: 'tna' as OperasionalSubTab,
      label: 'TNA Gap Matrix',
      icon: Search,
      count: tnaList.length,
      desc: 'Identifikasi kebutuhan pelatihan',
    },
    {
      id: 'rencana' as OperasionalSubTab,
      label: 'Jadwal & Rencana Training',
      icon: Calendar,
      count: rencanaList.length,
      desc: 'Kurikulum & agenda sesi lapangan',
    },
    {
      id: 'keluhan' as OperasionalSubTab,
      label: 'Kartu Keluhan & RCA',
      icon: AlertTriangle,
      count: keluhanList.length,
      desc: 'Komplain konsumen & tindakan perbaikan',
    },
    {
      id: 'talent' as OperasionalSubTab,
      label: 'Talent Tracker & Promosi',
      icon: Award,
      count: talentList.length,
      desc: 'Pipeline suksesi & kandidat leader',
    },
    {
      id: 'gap' as OperasionalSubTab,
      label: 'Matriks Gap Skill',
      icon: BarChart3,
      count: gapList.length,
      desc: 'Analisis delta target vs aktual',
    },
  ];

  const visibleTabs = useMemo(() => {
    if (!allowedSubTabs || allowedSubTabs.length === 0) return TABS_CONFIG;
    return TABS_CONFIG.filter((t) => allowedSubTabs.includes(t.id));
  }, [allowedSubTabs, TABS_CONFIG]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. UNIFIED MINIMALIST PAGE HEADER & SUB-TABS */}
      <PageHeaderBanner
        category={customCategory || "OPERASIONAL & LAPANGAN"}
        title={customTitle || "Pusat Operasional & Pengawasan Lapangan"}
        description={customDescription || "Monitoring kepatuhan SOP shift restoran, bimbingan GROW coaching 1-on-1, mitigasi TNA gap kompetensi, resolusi keluhan pelanggan, dan akselerasi promosi talenta."}
        icon={<Activity size={22} />}
        tabs={visibleTabs.map((t) => ({
          id: t.id,
          label: t.label,
          icon: t.icon,
          count: t.count,
        }))}
        activeTab={activeTab}
        onSelectTab={(id) => {
          setActiveTab(id as OperasionalSubTab);
          setSearchQuery('');
          setFilterDivision('ALL');
          setFilterStatus('ALL');
        }}
        rightElement={
          <div className="flex items-center gap-2">
            {activeTab === 'observasi' && (
              <button
                type="button"
                onClick={() => setIsTouchAuditOpen(true)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99] whitespace-nowrap"
                title="Form Cepat Inspeksi Mutu & Kepatuhan SOP Berbasis Tablet/HP"
              >
                <ShieldCheck size={15} />
                <span>Audit Cepat Tablet</span>
              </button>
            )}
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#96171B] hover:bg-[#801216] text-white shadow-xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99] whitespace-nowrap"
            >
              <Plus size={15} />
              <span>Tambah Data</span>
            </button>
          </div>
        }
      />

      {/* 2. OPERATIONAL KPI METRICS SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Observasi</span>
            <Eye size={14} className="text-[#96171B]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{summaryStats.totalObs}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">
            {summaryStats.obsCritical > 0 ? (
              <span className="text-rose-600 font-bold">{summaryStats.obsCritical} Kritis</span>
            ) : (
              <span className="text-emerald-700 font-semibold">100% SOP Aman</span>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>GROW Coaching</span>
            <MessageSquare size={14} className="text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{summaryStats.totalCoach}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Sesi 1-on-1</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>TNA Gap</span>
            <Search size={14} className="text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{summaryStats.totalTNA}</div>
          <div className="text-[11px] text-amber-800 font-semibold truncate">{summaryStats.tnaOpen} Butuh Training</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Jadwal Sesi</span>
            <Calendar size={14} className="text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{summaryStats.totalRencana}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Bulan Berjalan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Resolusi Komplain</span>
            <AlertTriangle size={14} className="text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{summaryStats.keluhanRate}%</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">{summaryStats.totalKeluhan} Total Kasus</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Talent Pipeline</span>
            <Award size={14} className="text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{summaryStats.totalTalent}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Kandidat Promosi</div>
        </div>
      </div>

      {/* 3. ACTIVE SUB-TAB VIEW CONTENT */}
      {/* ========================================================================= */}
      {/* A. OBSERVASI LAPANGAN SHIFT */}
      {/* ========================================================================= */}
      {activeTab === 'observasi' && (
        <div className="space-y-4">
          {/* Quick Shift Inspection Banner */}
          <div className="p-4 bg-gradient-to-r from-red-50/70 via-amber-50/40 to-white rounded-2xl border border-red-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#8C161B] text-white rounded-xl shadow-xs">
                <CheckSquare size={18} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900">
                  Audit Cepat Kepatuhan SOP Shift Restoran
                </h3>
                <p className="text-xs text-slate-600">
                  Lakukan inspeksi mendadak saat rush hour: Suhu minyak 165°-175°C, holding cabinet max 90 menit, standar sanitasi & 5S kasir.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenAdd}
              className="btn-secondary-enterprise !py-1.5 !px-3 text-xs flex items-center gap-1.5 shrink-0 bg-white font-bold"
            >
              <Plus size={14} className="text-[#8C161B]" />
              <span>Input Observasi Baru</span>
            </button>
          </div>

          {/* Table / Card List */}
          <div className="card-enterprise !p-4 bg-white border border-[#E5E0D8] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E0D8]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Cari kru, SOP, atau catatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-enterprise text-xs w-64"
                />
                <div className="min-w-[140px]">
                  <ModernOptionSelector
                    value={filterDivision}
                    onChange={(val) => setFilterDivision((val || 'ALL') as any)}
                    options={[
                      { value: 'ALL', label: 'Semua Divisi' },
                      { value: 'Kitchen', label: 'Kitchen' },
                      { value: 'Kasir', label: 'Kasir' },
                      { value: 'Geprek', label: 'Geprek' },
                      { value: 'Helper', label: 'Helper' },
                    ]}
                    inlineChips={false}
                    size="sm"
                    clearable={false}
                  />
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Menampilkan <b>{observasiList.length}</b> catatan observasi lapangan
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {observasiList
                .filter((o) => {
                  const matchOutlet = selectedOutletCode === 'ALL' || o.kode_outlet === selectedOutletCode;
                  const matchDiv = filterDivision === 'ALL' || o.divisi === filterDivision;
                  const matchQuery =
                    !searchQuery ||
                    o.nama_kru.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    o.standar_sop_diamati.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    o.kode_outlet.toLowerCase().includes(searchQuery.toLowerCase());
                  return matchOutlet && matchDiv && matchQuery;
                })
                .map((obs) => (
                  <div
                    key={obs.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-slate-900 text-xs">{obs.nama_kru}</span>
                          <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                            {obs.divisi}
                          </span>
                        </div>
                        <span
                          className={`badge-enterprise text-[9.5px] ${
                            obs.hasil === 'Sesuai Standar'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : obs.hasil === 'Perlu Perbaikan'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200 font-black'
                          }`}
                        >
                          {obs.hasil}
                        </span>
                      </div>

                      <div className="text-[11px] font-bold text-[#8C161B] line-clamp-1 flex items-center gap-1.5">
                        <FileText size={12} className="shrink-0 text-[#8C161B]" />
                        <span>{obs.standar_sop_diamati}</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 bg-white p-2 rounded-lg border border-slate-100">
                        {obs.catatan_detail || 'Tidak ada catatan khusus.'}
                      </p>

                      {obs.rencana_follow_up && (
                        <div className="text-[10.5px] text-slate-500 flex items-start gap-1">
                          <CornerDownRight size={12} className="text-slate-400 shrink-0 mt-0.5" />
                          <span className="italic">Follow up: {obs.rencana_follow_up}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10.5px]">
                      <div className="text-slate-400">
                        {obs.kode_outlet} • {obs.tanggal_shift}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            onOpenAIAction('observasi_followup', obs, `Rencana Follow-Up AI: ${obs.nama_kru}`)
                          }
                          className="p-1 text-purple-700 hover:bg-purple-100 rounded-md"
                          title="Generate Rekomendasi Follow-Up AI"
                        >
                          <Sparkles size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(obs)}
                          className="p-1 text-slate-600 hover:bg-slate-200 rounded-md"
                          title="Edit"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem('observasi_lapangan', obs.id)}
                          className="p-1 text-rose-600 hover:bg-rose-100 rounded-md"
                          title="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* B. COACHING LOG (GROW FRAMEWORK 1-ON-1) */}
      {/* ========================================================================= */}
      {activeTab === 'coaching' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white rounded-2xl border border-emerald-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-700 text-white rounded-xl shadow-xs">
                <MessageSquare size={18} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900">
                  GROW Coaching Room (Bimbingan 1-on-1 Kru & Supervisor)
                </h3>
                <p className="text-xs text-slate-600">
                  Struktur bimbingan terarah: <b>Goal</b> (Sasaran), <b>Reality</b> (Kondisi Nyata), <b>Options</b> (Solusi Alternatif), dan <b>Will</b> (Komitmen Tindakan Nyata).
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenAdd}
              className="btn-primary-enterprise !bg-emerald-700 hover:!bg-emerald-800 !py-1.5 !px-3 text-xs flex items-center gap-1.5 shrink-0 font-bold"
            >
              <Plus size={14} />
              <span>Sesi Coaching Baru</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {coachingList
              .filter((c) => selectedOutletCode === 'ALL' || c.kode_outlet === selectedOutletCode)
              .map((log) => (
                <div
                  key={log.id}
                  className="card-enterprise !p-4 bg-white border border-emerald-100 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                        {log.nama_kru.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-xs">{log.nama_kru}</h4>
                        <div className="text-[10px] text-slate-400">
                          {log.kode_outlet} • {log.tanggal}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          onOpenAIAction('coaching_grow', log, `Skenario Coaching GROW AI: ${log.nama_kru}`)
                        }
                        className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-md text-[10.5px] font-bold flex items-center gap-1"
                        title="AI Coaching Advisor"
                      >
                        <Sparkles size={11} className="text-purple-600" />
                        <span>AI GROW</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(log)}
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded-md"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('coaching_log', log.id)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-md"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* 4 Pillars Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="text-[10px] font-extrabold text-blue-700 flex items-center gap-1">
                        <Target size={11} /> Goal (Sasaran)
                      </div>
                      <p className="text-[11px] text-slate-700 leading-snug line-clamp-2">{log.goal}</p>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="text-[10px] font-extrabold text-amber-700 flex items-center gap-1">
                        <Search size={11} /> Reality (Realita)
                      </div>
                      <p className="text-[11px] text-slate-700 leading-snug line-clamp-2">{log.reality}</p>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-1">
                        <Lightbulb size={11} /> Options (Solusi)
                      </div>
                      <p className="text-[11px] text-slate-700 leading-snug line-clamp-2">{log.options}</p>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="text-[10px] font-extrabold text-purple-700 flex items-center gap-1">
                        <HeartHandshake size={11} /> Will (Komitmen)
                      </div>
                      <p className="text-[11px] text-slate-700 leading-snug line-clamp-2">{log.will}</p>
                    </div>
                  </div>

                  {log.hasil_follow_up && (
                    <div className="text-[11px] bg-emerald-50/60 text-emerald-900 p-2 rounded-lg border border-emerald-200/60 flex items-center justify-between">
                      <span>
                        <b>Follow Up:</b> {log.hasil_follow_up}
                      </span>
                      <CheckCircle2 size={13} className="text-emerald-600" />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* C. TNA GAP ANALYSIS & 1-CLICK CURRICULUM CONVERTER */}
      {/* ========================================================================= */}
      {activeTab === 'tna' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-50/80 via-pink-50/40 to-white rounded-2xl border border-purple-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-700 text-white rounded-xl shadow-xs">
                <Search size={18} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900">
                  Training Need Analysis (TNA) Gap Matrix
                </h3>
                <p className="text-xs text-slate-600">
                  Petakan kebutuhan pelatihan dari temuan audit. Gunakan fitur <b>1-Klik Konversi ke Rencana Training</b> untuk langsung menjadwalkan kelas pelatihan.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenAdd}
              className="btn-primary-enterprise !bg-purple-700 hover:!bg-purple-800 !py-1.5 !px-3 text-xs flex items-center gap-1.5 shrink-0 font-bold"
            >
              <Plus size={14} />
              <span>Input Temuan TNA</span>
            </button>
          </div>

          <div className="space-y-3">
            {tnaList
              .filter((t) => selectedOutletCode === 'ALL' || t.kode_outlet === selectedOutletCode)
              .map((tna) => (
                <div
                  key={tna.id}
                  className="card-enterprise !p-4 bg-white border border-[#E5E0D8] space-y-3 hover:border-purple-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge-enterprise text-[10px] ${
                          tna.prioritas === 'Tinggi'
                            ? 'bg-rose-100 text-rose-800 border-rose-300 font-black'
                            : tna.prioritas === 'Sedang'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Prioritas {tna.prioritas}
                      </span>

                      <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        Divisi {tna.divisi}
                      </span>

                      <span className="text-xs text-slate-500">
                        {tna.kode_outlet} • {tna.tanggal}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`badge-enterprise text-[10px] ${
                          tna.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tna.status === 'Proses'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Status: {tna.status}
                      </span>

                      <button
                        onClick={() => handleConvertTNAToTraining(tna)}
                        className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:shadow-xs transition-all"
                        title="Buat Jadwal Pelatihan Langsung dari Temuan Ini"
                      >
                        <Calendar size={12} />
                        <span>Konversi ke Jadwal Training</span>
                      </button>

                      <button
                        onClick={() =>
                          onOpenAIAction('tna_to_training', tna, `Rancang Kurikulum AI: ${tna.divisi}`)
                        }
                        className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-lg"
                        title="Rancang Kurikulum AI"
                      >
                        <Sparkles size={14} />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(tna)}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteItem('tna', tna.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="text-[10.5px] font-bold text-slate-500 mb-0.5">
                        Temuan Masalah / Gap:
                      </div>
                      <p className="text-slate-900 font-medium leading-relaxed">{tna.deskripsi_gap}</p>
                    </div>

                    <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-200">
                      <div className="text-[10.5px] font-bold text-purple-800 mb-0.5">
                        Rencana Tindak Lanjut Pelatihan:
                      </div>
                      <p className="text-purple-950 font-medium leading-relaxed">
                        {tna.rencana_tindak_lanjut}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* D. JADWAL & RENCANA TRAINING PELATIHAN */}
      {/* ========================================================================= */}
      {activeTab === 'rencana' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white rounded-2xl border border-blue-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-700 text-white rounded-xl shadow-xs">
                <Calendar size={18} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900">
                  Kalender & Rencana Sesi Pelatihan Lapangan
                </h3>
                <p className="text-xs text-slate-600">
                  Daftar agenda refreshment modul, trainer fasilitator, sasaran kru, dan status eksekusi.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenAdd}
              className="btn-primary-enterprise !bg-blue-700 hover:!bg-blue-800 !py-1.5 !px-3 text-xs flex items-center gap-1.5 shrink-0 font-bold"
            >
              <Plus size={14} />
              <span>Jadwalkan Training Baru</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {rencanaList
              .filter((r) => selectedOutletCode === 'ALL' || r.kode_outlet === selectedOutletCode)
              .map((item) => (
                <div
                  key={item.id}
                  className="card-enterprise !p-4 bg-white border border-blue-100 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                        <Calendar size={12} className="text-blue-700" />
                        <span>{item.tanggal_pelaksanaan} ({item.durasi})</span>
                      </span>
                      <span
                        className={`badge-enterprise text-[9.5px] ${
                          item.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Berjalan'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-sm">{item.topik}</h4>

                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {item.tujuan_pembelajaran}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                      <div>
                        <span className="text-slate-400">Sasaran:</span> <b>{item.peserta}</b>
                      </div>
                      <div>
                        <span className="text-slate-400">Trainer:</span> <b>{item.fasilitator}</b>
                      </div>
                      <div>
                        <span className="text-slate-400">Outlet:</span> <b>{item.kode_outlet}</b>
                      </div>
                      <div>
                        <span className="text-slate-400">Metode:</span> <b>{item.metode}</b>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {item.status !== 'Selesai' ? (
                        <button
                          onClick={() => {
                            db.updateRow('rencana_training', item.id, { status: 'Selesai' });
                            showToast('Status pelatihan diubah menjadi Selesai!');
                            loadData();
                          }}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Check size={12} />
                          <span>Tandai Selesai</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={13} /> Selesai Dieksekusi
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('rencana_training', item.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* E. KARTU KELUHAN & ROOT CAUSE ANALYSIS (RCA) */}
      {/* ========================================================================= */}
      {activeTab === 'keluhan' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-white rounded-2xl border border-amber-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900">
                  Kartu Keluhan Pelanggan & Analisis Akar Masalah (RCA)
                </h3>
                <p className="text-xs text-slate-600">
                  Dokumentasikan komplain rasa, pelayanan kasir, kebersihan, atau kecepatan untuk mencegah kejadian berulang melalui tindakan korektif SOP.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenAdd}
              className="btn-primary-enterprise !bg-amber-600 hover:!bg-amber-700 !py-1.5 !px-3 text-xs flex items-center gap-1.5 shrink-0 font-bold"
            >
              <Plus size={14} />
              <span>Catat Keluhan Baru</span>
            </button>
          </div>

          {/* POLA BERULANG EARLY WARNING ALERT (LEAN SIX SIGMA) */}
          {polaBerulangAlerts.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-rose-50 via-amber-50 to-white rounded-2xl border-2 border-rose-300 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-900 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-rose-600 animate-pulse" />
                  <span>EARLY WARNING: DETEKSI POLA KEGAGALAN BERULANG (LEAN SIX SIGMA)</span>
                </span>
                <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                  Ambang Batas ≥ 2 Deviasi Terlampaui
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {polaBerulangAlerts.map((alert, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between gap-2 shadow-2xs">
                    <div>
                      <div className="font-black text-slate-900 text-[11px]">
                        Outlet {alert.outlet} • {alert.tipe} ({alert.count}x Kejadian)
                      </div>
                      <div className="text-[10.5px] text-slate-500 font-medium">
                        Kategori ini terulang berkali-kali. Segera bedah akar masalah (RCA 5M).
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFishboneComplaint(alert.items[0]);
                        setShowFishboneModal(true);
                      }}
                      className="px-2.5 py-1.5 bg-[#96171B] hover:bg-[#801216] text-white rounded-lg font-bold text-[10.5px] shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <Lightbulb size={12} className="text-amber-300" />
                      <span>Bedah RCA</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {keluhanList
              .filter((k) => selectedOutletCode === 'ALL' || k.kode_outlet === selectedOutletCode)
              .map((kel) => (
                <div
                  key={kel.id}
                  className="card-enterprise !p-4 bg-white border border-[#E5E0D8] space-y-3 hover:border-amber-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="badge-enterprise text-[10px] bg-amber-100 text-amber-900 border-amber-200 font-bold">
                        Kategori: {kel.tipe}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{kel.kode_outlet}</span>
                      <span className="text-xs text-slate-400">• {kel.tanggal_shift}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedFishboneComplaint(kel);
                          setShowFishboneModal(true);
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="Buka Analisis Ishikawa Fishbone 5M"
                      >
                        <Lightbulb size={12} className="text-amber-700" />
                        <span>RCA 5M</span>
                      </button>

                      <span
                        className={`badge-enterprise text-[10px] ${
                          kel.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : kel.status === 'Eskalasi'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {kel.status}
                      </span>

                      <button
                        onClick={() => handleOpenEdit(kel)}
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded-md"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('kartu_keluhan', kel.id)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-md"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-red-50/50 rounded-xl border border-red-100 space-y-1">
                      <div className="text-[10.5px] font-bold text-rose-900">Deskripsi Keluhan:</div>
                      <p className="text-slate-800 leading-relaxed">{kel.deskripsi_keluhan}</p>
                      {kel.nama_kru_terkait && (
                        <div className="text-[10px] text-slate-500 pt-1">
                          Kru Terkait: <b>{kel.nama_kru_terkait}</b>
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                      <div className="text-[10.5px] font-bold text-emerald-900">
                        Tindakan Cepat Dilakukan:
                      </div>
                      <p className="text-slate-800 leading-relaxed">{kel.tindakan_diambil}</p>
                    </div>

                    <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1">
                      <div className="text-[10.5px] font-bold text-blue-900">
                        Tindak Lanjut Pelatihan SOP:
                      </div>
                      <p className="text-slate-800 leading-relaxed">
                        {kel.tindak_lanjut_training || 'Belum ditentukan.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* F. TALENT TRACKER & JALUR PROMOSI */}
      {/* ========================================================================= */}
      {activeTab === 'talent' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-white rounded-2xl border border-indigo-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-700 text-white rounded-xl shadow-xs">
                <Award size={18} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900">
                  Talent Tracker & Suksesi Kepemimpinan Restoran
                </h3>
                <p className="text-xs text-slate-600">
                  Pantau kesiapan kru berpotensi tinggi (*High-Potential Talent*) untuk promosi menjadi Trainer Lapangan, Head Cook, atau Store Manager.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenAdd}
              className="btn-primary-enterprise !bg-indigo-700 hover:!bg-indigo-800 !py-1.5 !px-3 text-xs flex items-center gap-1.5 shrink-0 font-bold"
            >
              <Plus size={14} />
              <span>Daftarkan Kandidat Promosi</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {talentList
              .filter((t) => selectedOutletCode === 'ALL' || t.kode_outlet === selectedOutletCode)
              .map((talent) => (
                <div
                  key={talent.id}
                  className="card-enterprise !p-4 bg-white border border-indigo-100 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs">
                          {talent.nama_kandidat.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-xs">{talent.nama_kandidat}</h4>
                          <div className="text-[10px] text-slate-400">
                            {talent.divisi} • {talent.kode_outlet}
                          </div>
                        </div>
                      </div>

                      <span className="badge-enterprise text-[9.5px] bg-indigo-50 text-indigo-800 border-indigo-200 font-bold">
                        Target: {talent.target_waktu_siap}
                      </span>
                    </div>

                    <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
                      <div className="text-[10.5px] font-bold text-indigo-900">
                        Target Posisi: {talent.target_posisi}
                      </div>
                      <div className="text-[11px] text-slate-700">
                        <b>Proyek Uji Coba:</b> {talent.tanggung_jawab_uji_coba}
                      </div>
                    </div>

                    <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="text-[10.5px] font-bold text-slate-500 mb-0.5">
                        Progres Kesiapan:
                      </div>
                      <p className="text-slate-800 font-medium">{talent.progres_terkini}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span>Ready for Promotion</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(talent)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem('talent_tracker', talent.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* G. GAP ANALYSIS MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'gap' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-slate-100 via-white to-slate-50 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-800 text-white rounded-xl shadow-xs">
                <BarChart3 size={18} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900">
                  Gap Analysis Matrix (Skor Target vs Realita Aktual)
                </h3>
                <p className="text-xs text-slate-600">
                  Kalkulasi otomatis selisih (*gap score*) kompetensi kru untuk menentukan prioritas modul retraining.
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenAdd}
              className="btn-primary-enterprise !py-1.5 !px-3 text-xs flex items-center gap-1.5 shrink-0 font-bold"
            >
              <Plus size={14} />
              <span>Tambah Matriks Gap</span>
            </button>
          </div>

          <div className="card-enterprise !p-0 bg-white border border-[#E5E0D8] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-[#E5E0D8]">
                  <tr>
                    <th className="p-3">Nama Kru</th>
                    <th className="p-3">Divisi & Outlet</th>
                    <th className="p-3">Kompetensi Dinilai</th>
                    <th className="p-3 text-center">Standar</th>
                    <th className="p-3 text-center">Aktual</th>
                    <th className="p-3 text-center">Delta Gap</th>
                    <th className="p-3">Rekomendasi Solusi</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gapList
                    .filter((g) => selectedOutletCode === 'ALL' || g.kode_outlet === selectedOutletCode)
                    .map((item) => {
                      const delta = item.skor_aktual - item.skor_standar;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-black text-slate-900">{item.nama_kru}</td>
                          <td className="p-3 text-slate-600">
                            {item.divisi} • {item.kode_outlet}
                          </td>
                          <td className="p-3 font-medium text-slate-800">{item.kompetensi_dinilai}</td>
                          <td className="p-3 text-center font-mono font-bold text-slate-600">
                            {item.skor_standar}
                          </td>
                          <td className="p-3 text-center font-mono font-black text-[#8C161B]">
                            {item.skor_aktual}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`badge-enterprise text-[10px] ${
                                delta >= 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800 font-black'
                              }`}
                            >
                              {delta > 0 ? `+${delta}` : delta}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 text-[11px] max-w-xs truncate">
                            {item.rekomendasi}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  onOpenAIAction(
                                    'gap_solution',
                                    item,
                                    `Solusi Gap AI: ${item.nama_kru}`
                                  )
                                }
                                className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                title="AI Solusi Gap"
                              >
                                <Sparkles size={13} />
                              </button>
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-1 text-slate-600 hover:bg-slate-100 rounded"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteItem('gap_analysis', item.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL FORM INPUT & EDIT DEDIKASI OPERASIONAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E0D8] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#8C161B] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 size={18} />
                <h3 className="font-black text-sm tracking-tight">
                  {editItem ? 'Edit Data' : 'Tambah Data Baru'} -{' '}
                  {TABS_CONFIG.find((t) => t.id === activeTab)?.label}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveForm} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Outlet Selector (Common) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <ModernOptionSelector
                    label="Outlet Cabang Penugasan"
                    required
                    value={formData.kode_outlet || outletOptions[0]}
                    onChange={(val) => setFormData({ ...formData, kode_outlet: val })}
                    options={outletOptions.map((code) => ({
                      value: code,
                      label: code,
                    }))}
                    inlineChips={false}
                    searchable
                  />
                </div>

                {/* Date or Shift (Common) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanggal / Waktu Shift:
                  </label>
                  <input
                    type="text"
                    value={
                      formData.tanggal_shift ||
                      formData.tanggal ||
                      formData.tanggal_pelaksanaan ||
                      new Date().toISOString().slice(0, 10)
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (activeTab === 'observasi' || activeTab === 'keluhan') {
                        setFormData({ ...formData, tanggal_shift: val });
                      } else if (activeTab === 'rencana') {
                        setFormData({ ...formData, tanggal_pelaksanaan: val });
                      } else {
                        setFormData({ ...formData, tanggal: val });
                      }
                    }}
                    className="input-enterprise w-full text-xs"
                    required
                  />
                </div>
              </div>

              {/* SPECIFIC FORM FIELDS PER TAB */}
              {activeTab === 'observasi' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kru Diamati:</label>
                      <input
                        type="text"
                        value={formData.nama_kru || ''}
                        onChange={(e) => setFormData({ ...formData, nama_kru: e.target.value })}
                        className="input-enterprise w-full text-xs font-bold"
                        required
                      />
                    </div>
                    <div>
                      <ModernOptionSelector
                        label="Divisi Kru"
                        value={formData.divisi || 'Kitchen'}
                        onChange={(val) => setFormData({ ...formData, divisi: val })}
                        options={['Kitchen', 'Kasir', 'Geprek', 'Helper']}
                        inlineChips
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Standar SOP Yang Diobservasi:
                    </label>
                    <input
                      type="text"
                      value={formData.standar_sop_diamati || ''}
                      onChange={(e) => setFormData({ ...formData, standar_sop_diamati: e.target.value })}
                      className="input-enterprise w-full text-xs font-bold text-[#8C161B]"
                      placeholder="Contoh: SOP Suhu Penggorengan 165°C & Tiriskan 3 Menit"
                      required
                    />
                  </div>

                  <div>
                    <ModernOptionSelector
                      label="Hasil Evaluasi Observasi"
                      value={formData.hasil || 'Sesuai Standar'}
                      onChange={(val) => setFormData({ ...formData, hasil: val })}
                      options={[
                        { value: 'Sesuai Standar', label: 'Sesuai Standar' },
                        { value: 'Perlu Perbaikan', label: 'Perlu Perbaikan' },
                        { value: 'Kritis', label: 'Kritis (Pelanggaran HACCP / Safety)' },
                      ]}
                      inlineChips
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Detail Temuan:</label>
                    <textarea
                      rows={3}
                      value={formData.catatan_detail || ''}
                      onChange={(e) => setFormData({ ...formData, catatan_detail: e.target.value })}
                      className="input-enterprise w-full text-xs"
                      placeholder="Deskripsikan fakta lapangan saat observasi shift..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rencana Tindak Lanjut / Follow-Up:
                    </label>
                    <input
                      type="text"
                      value={formData.rencana_follow_up || ''}
                      onChange={(e) => setFormData({ ...formData, rencana_follow_up: e.target.value })}
                      className="input-enterprise w-full text-xs"
                      placeholder="Contoh: Coaching 1-on-1 sebelum shift besok"
                    />
                  </div>
                </>
              )}

              {activeTab === 'coaching' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kru Dicoach:</label>
                    <input
                      type="text"
                      value={formData.nama_kru || ''}
                      onChange={(e) => setFormData({ ...formData, nama_kru: e.target.value })}
                      className="input-enterprise w-full text-xs font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-blue-800 mb-1 flex items-center gap-1">
                        <Target size={13} className="text-blue-600" />
                        <span>Goal (Sasaran yang ingin dicapai):</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.goal || ''}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                        className="input-enterprise w-full text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                        <Search size={13} className="text-amber-600" />
                        <span>Reality (Kondisi saat ini / kendala):</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.reality || ''}
                        onChange={(e) => setFormData({ ...formData, reality: e.target.value })}
                        className="input-enterprise w-full text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1">
                        <Lightbulb size={13} className="text-emerald-600" />
                        <span>Options (Alternatif solusi yang disepakati):</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.options || ''}
                        onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                        className="input-enterprise w-full text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-purple-800 mb-1 flex items-center gap-1">
                        <HeartHandshake size={13} className="text-purple-600" />
                        <span>Will (Komitmen tindakan spesifik & waktu):</span>
                      </label>
                      <textarea
                        rows={2}
                        value={formData.will || ''}
                        onChange={(e) => setFormData({ ...formData, will: e.target.value })}
                        className="input-enterprise w-full text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hasil Follow-Up / Progres:</label>
                    <input
                      type="text"
                      value={formData.hasil_follow_up || ''}
                      onChange={(e) => setFormData({ ...formData, hasil_follow_up: e.target.value })}
                      className="input-enterprise w-full text-xs"
                      placeholder="Contoh: Kru berhasil meningkatkan kecepatan sesuai target pada hari ke-5."
                    />
                  </div>
                </>
              )}

              {activeTab === 'tna' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <ModernOptionSelector
                      label="Divisi Terkait"
                      value={formData.divisi || 'Kitchen'}
                      onChange={(val) => setFormData({ ...formData, divisi: val })}
                      options={['Kitchen', 'Kasir', 'Geprek', 'Helper']}
                      inlineChips
                    />
                    <ModernOptionSelector
                      label="Jenis Gap"
                      value={formData.jenis_gap || 'Keterampilan'}
                      onChange={(val) => setFormData({ ...formData, jenis_gap: val })}
                      options={['Pengetahuan', 'Keterampilan', 'Sikap/Konsistensi']}
                      inlineChips
                    />
                    <ModernOptionSelector
                      label="Prioritas"
                      value={formData.prioritas || 'Tinggi'}
                      onChange={(val) => setFormData({ ...formData, prioritas: val })}
                      options={['Tinggi', 'Sedang', 'Rendah']}
                      inlineChips
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sumber Temuan:</label>
                    <input
                      type="text"
                      value={formData.sumber_temuan || ''}
                      onChange={(e) => setFormData({ ...formData, sumber_temuan: e.target.value })}
                      className="input-enterprise w-full text-xs"
                      placeholder="Contoh: Audit Rutin SPV / Mystery Shopper"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Gap / Masalah:</label>
                    <textarea
                      rows={2}
                      value={formData.deskripsi_gap || ''}
                      onChange={(e) => setFormData({ ...formData, deskripsi_gap: e.target.value })}
                      className="input-enterprise w-full text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-800 mb-1">
                      Rencana Tindak Lanjut Training:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.rencana_tindak_lanjut || ''}
                      onChange={(e) => setFormData({ ...formData, rencana_tindak_lanjut: e.target.value })}
                      className="input-enterprise w-full text-xs font-bold"
                      required
                    />
                  </div>
                </>
              )}

              {activeTab === 'rencana' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Topik Pelatihan:</label>
                    <input
                      type="text"
                      value={formData.topik || ''}
                      onChange={(e) => setFormData({ ...formData, topik: e.target.value })}
                      className="input-enterprise w-full text-xs font-bold text-[#8C161B]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan Pembelajaran:</label>
                    <textarea
                      rows={2}
                      value={formData.tujuan_pembelajaran || ''}
                      onChange={(e) => setFormData({ ...formData, tujuan_pembelajaran: e.target.value })}
                      className="input-enterprise w-full text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Sasaran Peserta:</label>
                      <input
                        type="text"
                        value={formData.peserta || ''}
                        onChange={(e) => setFormData({ ...formData, peserta: e.target.value })}
                        className="input-enterprise w-full text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Trainer Fasilitator:</label>
                      <input
                        type="text"
                        value={formData.fasilitator || ''}
                        onChange={(e) => setFormData({ ...formData, fasilitator: e.target.value })}
                        className="input-enterprise w-full text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Metode Pelatihan:</label>
                      <input
                        type="text"
                        value={formData.metode || 'Praktik & Demonstrasi'}
                        onChange={(e) => setFormData({ ...formData, metode: e.target.value })}
                        className="input-enterprise w-full text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Durasi:</label>
                      <input
                        type="text"
                        value={formData.durasi || '60 Menit'}
                        onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
                        className="input-enterprise w-full text-xs"
                      />
                    </div>
                    <div>
                      <ModernOptionSelector
                        label="Status"
                        value={formData.status || 'Direncanakan'}
                        onChange={(val) => setFormData({ ...formData, status: val })}
                        options={['Direncanakan', 'Berjalan', 'Selesai']}
                        inlineChips
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'keluhan' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <ModernOptionSelector
                        label="Kategori Keluhan"
                        value={formData.tipe || 'Produk/Rasa'}
                        onChange={(val) => setFormData({ ...formData, tipe: val })}
                        options={[
                          'Produk/Rasa',
                          'Pelayanan/Kasir',
                          'Kebersihan',
                          'Kecepatan',
                          'Lainnya',
                        ]}
                        inlineChips
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Kru Terkait (Jika Ada):</label>
                      <input
                        type="text"
                        value={formData.nama_kru_terkait || ''}
                        onChange={(e) => setFormData({ ...formData, nama_kru_terkait: e.target.value })}
                        className="input-enterprise w-full text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Komplain Konsumen:</label>
                    <textarea
                      rows={2}
                      value={formData.deskripsi_keluhan || ''}
                      onChange={(e) => setFormData({ ...formData, deskripsi_keluhan: e.target.value })}
                      className="input-enterprise w-full text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-emerald-800 mb-1">
                      Tindakan Cepat Dilakukan Saat Kejadian:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.tindakan_diambil || ''}
                      onChange={(e) => setFormData({ ...formData, tindakan_diambil: e.target.value })}
                      className="input-enterprise w-full text-xs font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-blue-800 mb-1">
                      Tindak Lanjut Pelatihan SOP Berkelanjutan:
                    </label>
                    <input
                      type="text"
                      value={formData.tindak_lanjut_training || ''}
                      onChange={(e) => setFormData({ ...formData, tindak_lanjut_training: e.target.value })}
                      className="input-enterprise w-full text-xs"
                      placeholder="Contoh: Kalibrasi ulang termometer dan training ulang penirisan minyak"
                    />
                  </div>
                </>
              )}

              {activeTab === 'talent' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kandidat Kru:</label>
                      <input
                        type="text"
                        value={formData.nama_kandidat || ''}
                        onChange={(e) => setFormData({ ...formData, nama_kandidat: e.target.value })}
                        className="input-enterprise w-full text-xs font-bold"
                        required
                      />
                    </div>
                    <div>
                      <ModernOptionSelector
                        label="Divisi Asal"
                        value={formData.divisi || 'Kitchen'}
                        onChange={(val) => setFormData({ ...formData, divisi: val })}
                        options={['Kitchen', 'Kasir', 'Geprek', 'Helper']}
                        inlineChips
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-indigo-900 mb-1">Target Posisi Promosi:</label>
                      <input
                        type="text"
                        value={formData.target_posisi || ''}
                        onChange={(e) => setFormData({ ...formData, target_posisi: e.target.value })}
                        className="input-enterprise w-full text-xs font-bold text-indigo-700"
                        placeholder="Contoh: Head Cook / Shift Leader"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Target Waktu Siap Promosi:</label>
                      <input
                        type="text"
                        value={formData.target_waktu_siap || ''}
                        onChange={(e) => setFormData({ ...formData, target_waktu_siap: e.target.value })}
                        className="input-enterprise w-full text-xs"
                        placeholder="Contoh: Oktober 2026"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tanggung Jawab Proyek Uji Coba:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.tanggung_jawab_uji_coba || ''}
                      onChange={(e) => setFormData({ ...formData, tanggung_jawab_uji_coba: e.target.value })}
                      className="input-enterprise w-full text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Progres Kesiapan Terkini:</label>
                    <input
                      type="text"
                      value={formData.progres_terkini || ''}
                      onChange={(e) => setFormData({ ...formData, progres_terkini: e.target.value })}
                      className="input-enterprise w-full text-xs font-bold text-emerald-700"
                      placeholder="Contoh: 85% - Sangat cakap memimpin tim opening shift"
                      required
                    />
                  </div>
                </>
              )}

              {activeTab === 'gap' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kru:</label>
                      <input
                        type="text"
                        value={formData.nama_kru || ''}
                        onChange={(e) => setFormData({ ...formData, nama_kru: e.target.value })}
                        className="input-enterprise w-full text-xs font-bold"
                        required
                      />
                    </div>
                    <div>
                      <ModernOptionSelector
                        label="Divisi"
                        value={formData.divisi || 'Kitchen'}
                        onChange={(val) => setFormData({ ...formData, divisi: val })}
                        options={['Kitchen', 'Kasir', 'Geprek', 'Helper']}
                        inlineChips
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kompetensi Dinilai:</label>
                    <input
                      type="text"
                      value={formData.kompetensi_dinilai || ''}
                      onChange={(e) => setFormData({ ...formData, kompetensi_dinilai: e.target.value })}
                      className="input-enterprise w-full text-xs font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Skor Standar Target (1-5):</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={formData.skor_standar ?? 4}
                        onChange={(e) => setFormData({ ...formData, skor_standar: Number(e.target.value) })}
                        className="input-enterprise w-full text-xs font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Skor Aktual Kru (1-5):</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={formData.skor_aktual ?? 3}
                        onChange={(e) => setFormData({ ...formData, skor_aktual: Number(e.target.value) })}
                        className="input-enterprise w-full text-xs font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Rekomendasi Remediasi Gap:</label>
                    <textarea
                      rows={2}
                      value={formData.rekomendasi || ''}
                      onChange={(e) => setFormData({ ...formData, rekomendasi: e.target.value })}
                      className="input-enterprise w-full text-xs"
                      required
                    />
                  </div>
                </>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary-enterprise !py-2 !px-4 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary-enterprise !py-2 !px-5 text-xs flex items-center gap-1.5 shadow-md font-black"
                >
                  <Check size={14} />
                  <span>Simpan Data Operasional</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RCA Ishikawa 5M Fishbone Modal */}
      <RCAFishboneModal
        isOpen={showFishboneModal}
        onClose={() => {
          setShowFishboneModal(false);
          setSelectedFishboneComplaint(null);
        }}
        complaint={selectedFishboneComplaint}
        onSuccess={(msg) => {
          showToast(msg);
          loadData();
        }}
      />

      {/* Touch Audit Modal (Tablet & Phone Quick SOP Check) */}
      <TouchAuditModal
        isOpen={isTouchAuditOpen}
        onClose={() => setIsTouchAuditOpen(false)}
        outlets={outlets}
        kruList={kruList}
        onAuditSaved={(msg) => {
          showToast(msg);
          loadData();
        }}
      />
    </div>
  );
};
