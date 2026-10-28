import React, { useState, useMemo } from 'react';
import {
  FileText, Search, Filter, Download, Printer, Trash2, Eye,
  CheckCircle2, AlertTriangle, XCircle, Clock, UtensilsCrossed,
  Store, User, ShieldCheck, ChevronRight, X, Calendar, ArrowUpDown,
  RefreshCw, Award, Sparkles, AlertCircle, Check
} from 'lucide-react';
import { PenilaianPraktikOnboardingProduk, Outlet } from '../../types';
import { db } from '../../lib/storage';
import { exportPenilaianPraktikProdukPDF } from '../../lib/pdfGenerator';
import { ConfirmModal } from '../ui/ConfirmModal';

interface OnboardingActivityLogViewProps {
  selectedOutletCode: string;
  onNavigateToPractice?: () => void;
}

export const OnboardingActivityLogView: React.FC<OnboardingActivityLogViewProps> = ({
  selectedOutletCode,
  onNavigateToPractice,
}) => {
  const [assessments, setAssessments] = useState<PenilaianPraktikOnboardingProduk[]>(() =>
    db.getPenilaianPraktikProduk()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDay, setFilterDay] = useState<'Semua' | 'Day 1' | 'Day 2'>('Semua');
  const [filterStation, setFilterStation] = useState<'Semua' | 'Station 1' | 'Station 2' | 'Station 3'>('Semua');
  const [filterStatus, setFilterStatus] = useState<'Semua' | 'Lulus' | 'Remedial' | 'Gagal'>('Semua');
  const [filterOutlet, setFilterOutlet] = useState<string>(selectedOutletCode);
  const [sortBy, setSortBy] = useState<'newest' | 'score_high' | 'score_low' | 'name'>('newest');

  // Detail Modal State
  const [detailItem, setDetailItem] = useState<PenilaianPraktikOnboardingProduk | null>(null);

  // In-app Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    namaKru: string;
    produk: string;
  } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const outlets = useMemo(() => db.getTable<Outlet>('outlets'), []);

  const refreshData = () => {
    setAssessments(db.getPenilaianPraktikProduk());
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenDeleteModal = (id: string, namaKru: string, produk: string) => {
    setDeleteTarget({ id, namaKru, produk });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    db.deletePenilaianPraktikProduk(deleteTarget.id);
    refreshData();
    showToast(`Catatan evaluasi ${deleteTarget.namaKru} (${deleteTarget.produk}) berhasil dihapus.`);
    setDeleteTarget(null);
  };

  const handleExportCSV = () => {
    if (filteredData.length === 0) return;
    const headers = [
      'ID',
      'Tanggal',
      'Nama Kru',
      'Outlet',
      'Produk',
      'Stasiun',
      'Waktu Aktual (detik)',
      'Target Waktu (detik)',
      'Suhu Minyak (C)',
      'Gramatur (g)',
      'Skor Prosedur',
      'Skor Waktu',
      'Skor Kebersihan',
      'Skor Kerjasama',
      'Skor Knowledge',
      'Skor Akhir',
      'Status',
      'Penilai',
      'Catatan'
    ];

    const rows = filteredData.map((item) => [
      `"${item.id}"`,
      `"${item.tanggal || item.created_at}"`,
      `"${item.nama_kru}"`,
      `"${item.kode_outlet}"`,
      `"${item.produk_nama}"`,
      `"${item.station || '-'}"`,
      item.waktu_detik,
      item.target_detik,
      item.suhu_minyak_aktual || '-',
      item.gramatur_aktual || '-',
      item.skor_prosedur,
      item.skor_waktu,
      item.skor_kebersihan,
      item.skor_kerjasama,
      item.skor_knowledge,
      item.skor_akhir,
      `"${item.status}"`,
      `"${item.penilai_nama || '-'}"`,
      `"${(item.catatan || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Log_Penilaian_Praktik_HARA_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered & Sorted Records
  const filteredData = useMemo(() => {
    return assessments
      .filter((item) => {
        // Outlet
        if (filterOutlet !== 'ALL' && item.kode_outlet !== filterOutlet) {
          return false;
        }

        // Day Filter (detect from station or day property)
        if (filterDay !== 'Semua') {
          const itemDay = item.station === 'Station 1' ? 'Day 1' : 'Day 2';
          if (itemDay !== filterDay) return false;
        }

        // Station Filter
        if (filterStation !== 'Semua' && item.station !== filterStation) {
          return false;
        }

        // Status Filter
        if (filterStatus !== 'Semua') {
          if (filterStatus === 'Lulus' && item.skor_akhir < 85) return false;
          if (filterStatus === 'Remedial' && (item.skor_akhir < 75 || item.skor_akhir >= 85)) return false;
          if (filterStatus === 'Gagal' && item.skor_akhir >= 75) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesKru = item.nama_kru?.toLowerCase().includes(q);
          const matchesProduk = item.produk_nama?.toLowerCase().includes(q);
          const matchesPenilai = item.penilai_nama?.toLowerCase().includes(q);
          const matchesNotes = item.catatan?.toLowerCase().includes(q);
          if (!matchesKru && !matchesProduk && !matchesPenilai && !matchesNotes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at || b.tanggal).getTime() - new Date(a.created_at || a.tanggal).getTime();
        }
        if (sortBy === 'score_high') {
          return b.skor_akhir - a.skor_akhir;
        }
        if (sortBy === 'score_low') {
          return a.skor_akhir - b.skor_akhir;
        }
        if (sortBy === 'name') {
          return (a.nama_kru || '').localeCompare(b.nama_kru || '');
        }
        return 0;
      });
  }, [assessments, filterOutlet, filterDay, filterStation, filterStatus, searchQuery, sortBy]);

  // Key KPI stats
  const stats = useMemo(() => {
    const total = filteredData.length;
    if (total === 0) {
      return { total: 0, lulus: 0, remedial: 0, gagal: 0, passRate: 0, avgScore: 0 };
    }
    const lulus = filteredData.filter((i) => i.skor_akhir >= 85).length;
    const remedial = filteredData.filter((i) => i.skor_akhir >= 75 && i.skor_akhir < 85).length;
    const gagal = filteredData.filter((i) => i.skor_akhir < 75).length;
    const passRate = Math.round((lulus / total) * 100);
    const avgScore = Number((filteredData.reduce((acc, curr) => acc + curr.skor_akhir, 0) / total).toFixed(1));

    return { total, lulus, remedial, gagal, passRate, avgScore };
  }, [filteredData]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs">
          <div className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider">Total Penilaian</div>
          <div className="text-2xl font-black text-[#181411] mt-1">{stats.total}</div>
          <p className="text-[11px] text-[#645D55] mt-0.5">Sesi Uji Praktik Terekam</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs">
          <div className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider">Kelulusan (≥85)</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.passRate}%</div>
          <p className="text-[11px] text-emerald-700 mt-0.5">{stats.lulus} Kru Memenuhi Standar Baku</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs">
          <div className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider">Remedial (75-84)</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.remedial}</div>
          <p className="text-[11px] text-amber-700 mt-0.5">Perlu Supervisi & Retraining</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs">
          <div className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider">Rata-Rata Skor</div>
          <div className="text-2xl font-black text-[#96171B] mt-1">{stats.avgScore} <span className="text-xs text-[#645D55] font-normal">/ 100</span></div>
          <p className="text-[11px] text-[#645D55] mt-0.5">Standar Kelulusan: 85.0</p>
        </div>
      </div>

      {/* Filter and Action Toolbar */}
      <div className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#645D55]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama kru, produk, penilai, atau catatan evaluasi..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E6E1DA] text-xs text-[#181411] placeholder-[#645D55]/60 focus:outline-none focus:border-[#96171B] focus:ring-1 focus:ring-[#96171B]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={refreshData}
              className="p-2 rounded-xl border border-[#E6E1DA] text-[#645D55] hover:text-[#181411] hover:bg-neutral-50 transition-colors"
              title="Perbarui Data"
            >
              <RefreshCw size={15} />
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredData.length === 0}
              className="px-3.5 py-2 rounded-xl border border-[#E6E1DA] text-[#181411] hover:bg-neutral-50 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Download size={14} className="text-[#96171B]" />
              <span>Ekspor CSV</span>
            </button>

            {onNavigateToPractice && (
              <button
                type="button"
                onClick={onNavigateToPractice}
                className="px-4 py-2 rounded-xl bg-[#96171B] hover:bg-[#7A1216] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <UtensilsCrossed size={14} />
                <span>+ Buka Form Penilaian Praktik</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-[#E6E1DA]">
          {/* Day Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#645D55] uppercase mb-1">Hari Pelatihan</label>
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value as any)}
              className="w-full p-2 rounded-xl border border-[#E6E1DA] text-xs bg-white text-[#181411] font-medium"
            >
              <option value="Semua">Semua Hari</option>
              <option value="Day 1">Day 1 (Station 1 Kitchen)</option>
              <option value="Day 2">Day 2 (Station 2 & 3)</option>
            </select>
          </div>

          {/* Station Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#645D55] uppercase mb-1">Stasiun Kerja</label>
            <select
              value={filterStation}
              onChange={(e) => setFilterStation(e.target.value as any)}
              className="w-full p-2 rounded-xl border border-[#E6E1DA] text-xs bg-white text-[#181411] font-medium"
            >
              <option value="Semua">Semua Stasiun</option>
              <option value="Station 1">Station 1 - Penggorengan</option>
              <option value="Station 2">Station 2 - Saus & Geprek</option>
              <option value="Station 3">Station 3 - Kasir & Bar</option>
            </select>
          </div>

          {/* Outlet Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#645D55] uppercase mb-1">Cabang Outlet</label>
            <select
              value={filterOutlet}
              onChange={(e) => setFilterOutlet(e.target.value)}
              className="w-full p-2 rounded-xl border border-[#E6E1DA] text-xs bg-white text-[#181411] font-medium"
            >
              <option value="ALL">Semua Outlet</option>
              {outlets.map((o) => (
                <option key={o.kode_outlet} value={o.kode_outlet}>
                  {o.kode_outlet} - {o.nama_outlet}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#645D55] uppercase mb-1">Status Kelulusan</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full p-2 rounded-xl border border-[#E6E1DA] text-xs bg-white text-[#181411] font-medium"
            >
              <option value="Semua">Semua Status</option>
              <option value="Lulus">Lulus (≥85)</option>
              <option value="Remedial">Remedial (75-84)</option>
              <option value="Gagal">Gagal (&lt;75)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold text-[#645D55] uppercase mb-1">Urutkan</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 rounded-xl border border-[#E6E1DA] text-xs bg-white text-[#181411] font-medium"
            >
              <option value="newest">Terbaru</option>
              <option value="score_high">Skor Tertinggi</option>
              <option value="score_low">Skor Terendah</option>
              <option value="name">Nama Kru (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Full Activity Log Table */}
      <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E6E1DA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#96171B]" />
            <h3 className="font-bold text-sm text-[#181411]">
              Audit Trail Log Aktivitas Penilaian Praktik
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] border border-[#E6E1DA] text-[#645D55]">
              {filteredData.length} Catatan
            </span>
          </div>

          <div className="text-[11px] text-[#645D55]">
            Passing Grade: <strong className="text-emerald-700 font-bold">≥ 85 Poin</strong> (Baku HARA)
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#645D55] space-y-3">
            <UtensilsCrossed size={36} className="mx-auto text-stone-300 stroke-[1.5]" />
            <p className="font-medium text-stone-700">Tidak ada data penilaian yang cocok dengan kriteria filter.</p>
            <p className="text-[11px] text-stone-500">Ubah filter pencarian atau mulai input penilaian pada tab form penilaian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E6E1DA] bg-[#FAF8F5] text-[#645D55] font-bold uppercase text-[10.5px]">
                  <th className="py-3 px-4">Waktu & Kru</th>
                  <th className="py-3 px-3">Produk & Stasiun</th>
                  <th className="py-3 px-3">Outlet</th>
                  <th className="py-3 px-3 text-center">Stopwatch SOS</th>
                  <th className="py-3 px-3 text-center">Suhu / Gram</th>
                  <th className="py-3 px-3 text-center">5 Dimensi</th>
                  <th className="py-3 px-3 text-center">Skor Akhir</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1DA]">
                {filteredData.map((item, idx) => {
                  const isDay1 = item.station === 'Station 1';
                  const dateStr = item.tanggal || item.created_at || '';
                  const formattedDate = dateStr.length >= 10 ? dateStr.substring(0, 10) : dateStr;
                  const timeDiff = item.waktu_detik - item.target_detik;
                  const isOvertime = timeDiff > 0;

                  return (
                    <tr key={`${item.id}-${idx}`} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      {/* Kru Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#181411] flex items-center gap-1.5">
                          <span>{item.nama_kru}</span>
                          {item.kru_id?.startsWith('manual-') && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              Manual
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#645D55] flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 font-mono text-[10px]">
                            <Calendar size={11} /> {formattedDate}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{item.penilai_nama || 'Trainer'}</span>
                        </div>
                      </td>

                      {/* Produk & Station */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#181411]">{item.produk_nama}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                            isDay1
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isDay1 ? 'Day 1' : 'Day 2'}
                          </span>
                          <span className="text-[10px] text-[#645D55]">{item.station || 'Station'}</span>
                        </div>
                      </td>

                      {/* Outlet */}
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-[#181411]">{item.kode_outlet}</span>
                      </td>

                      {/* Stopwatch vs Target */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-mono font-bold text-[#181411]">
                          {formatTime(item.waktu_detik)}
                        </div>
                        <div className={`text-[10px] font-mono mt-0.5 ${isOvertime ? 'text-rose-600 font-semibold' : 'text-emerald-700'}`}>
                          Target: {formatTime(item.target_detik)} {isOvertime && `(+${timeDiff}s)`}
                        </div>
                      </td>

                      {/* Suhu / Gramatur */}
                      <td className="py-3 px-3 text-center text-[11px]">
                        {item.suhu_minyak_aktual ? (
                          <div className="font-mono font-semibold text-[#181411]">
                            {item.suhu_minyak_aktual}°C
                          </div>
                        ) : null}
                        {item.gramatur_aktual ? (
                          <div className="font-mono text-[#645D55]">
                            {item.gramatur_aktual}g
                          </div>
                        ) : null}
                        {!item.suhu_minyak_aktual && !item.gramatur_aktual && (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* 5 Dimensi Breakdown Badges */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-[10px] font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800" title="Ketepatan Langkah SOP (30%)">
                            SOP:{item.skor_prosedur}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800" title="Kecepatan Waktu (20%)">
                            SOS:{item.skor_waktu}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800" title="Kebersihan & K3 (15%)">
                            K3:{item.skor_kebersihan}
                          </span>
                        </div>
                      </td>

                      {/* Skor Akhir */}
                      <td className="py-3 px-3 text-center">
                        <div className={`text-base font-black font-mono ${
                          item.skor_akhir >= 85
                            ? 'text-emerald-700'
                            : item.skor_akhir >= 75
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}>
                          {item.skor_akhir}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                          item.skor_akhir >= 85
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.skor_akhir >= 75
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {item.skor_akhir >= 85 ? (
                            <>
                              <CheckCircle2 size={11} />
                              <span>Lulus</span>
                            </>
                          ) : item.skor_akhir >= 75 ? (
                            <>
                              <AlertTriangle size={11} />
                              <span>Remedial</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={11} />
                              <span>Gagal</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailItem(item)}
                            className="p-1.5 rounded-lg border border-[#E6E1DA] text-[#645D55] hover:text-[#96171B] hover:border-[#96171B] transition-colors"
                            title="Buka Lembar Audit Detail"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => exportPenilaianPraktikProdukPDF(item)}
                            className="p-1.5 rounded-lg border border-[#E6E1DA] text-[#645D55] hover:text-[#96171B] hover:border-[#96171B] transition-colors"
                            title="Unduh Lembar PDF Resmi"
                          >
                            <Download size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(item.id, item.nama_kru, item.produk_nama)}
                            className="p-1.5 rounded-lg border border-[#E6E1DA] text-[#645D55] hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                            title="Hapus Catatan"
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
        )}
      </div>

      {/* DETAIL AUDIT TRAIL MODAL */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-[#E6E1DA] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E6E1DA] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#96171B] border border-red-200">
                    AUDIT TRAIL RESMI HARA
                  </span>
                  <span className="text-xs text-[#645D55]">ID: {detailItem.id}</span>
                </div>
                <h3 className="text-base font-bold text-[#181411] mt-1">
                  Lembar Penilaian: {detailItem.produk_nama}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Kru & Test Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                <div>
                  <span className="text-[#645D55] text-[10.5px]">Nama Peserta</span>
                  <div className="font-bold text-[#181411] mt-0.5">{detailItem.nama_kru}</div>
                </div>
                <div>
                  <span className="text-[#645D55] text-[10.5px]">Outlet</span>
                  <div className="font-bold text-[#181411] mt-0.5">{detailItem.kode_outlet}</div>
                </div>
                <div>
                  <span className="text-[#645D55] text-[10.5px]">Stasiun / Hari</span>
                  <div className="font-bold text-[#181411] mt-0.5">
                    {detailItem.station} ({detailItem.station === 'Station 1' ? 'Day 1' : 'Day 2'})
                  </div>
                </div>
                <div>
                  <span className="text-[#645D55] text-[10.5px]">Nama Penilai / Trainer</span>
                  <div className="font-bold text-[#181411] mt-0.5">{detailItem.penilai_nama || '-'}</div>
                </div>
              </div>

              {/* Stopwatch & Physical Sensor Checks */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-[#E6E1DA] bg-white">
                  <span className="text-[#645D55] text-[10.5px]">Stopwatch SOS</span>
                  <div className="text-lg font-bold font-mono text-[#181411] mt-0.5">
                    {formatTime(detailItem.waktu_detik)}
                  </div>
                  <div className="text-[10px] text-[#645D55] mt-0.5">
                    Target: {formatTime(detailItem.target_detik)}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E6E1DA] bg-white">
                  <span className="text-[#645D55] text-[10.5px]">Suhu Minyak Probe</span>
                  <div className="text-lg font-bold font-mono text-[#181411] mt-0.5">
                    {detailItem.suhu_minyak_aktual ? `${detailItem.suhu_minyak_aktual}°C` : '-'}
                  </div>
                  <div className="text-[10px] text-[#645D55] mt-0.5">
                    {detailItem.suhu_minyak_aktual ? 'Sensor Deep Fryer Terverifikasi' : 'Non-Deep Fryer'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E6E1DA] bg-white">
                  <span className="text-[#645D55] text-[10.5px]">Timbangan Gramatur</span>
                  <div className="text-lg font-bold font-mono text-[#181411] mt-0.5">
                    {detailItem.gramatur_aktual ? `${detailItem.gramatur_aktual}g` : '-'}
                  </div>
                  <div className="text-[10px] text-[#645D55] mt-0.5">
                    {detailItem.gramatur_aktual ? 'Timbangan Digital Presisi' : 'Sesuai Porsi Baku'}
                  </div>
                </div>
              </div>

              {/* 5 Official Dimensions Score Card */}
              <div className="p-4 rounded-xl border border-[#E6E1DA] bg-white space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
                  <h4 className="font-bold text-[#181411]">Breakdown 5 Dimensi Evaluasi Standar PDF</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#645D55]">Skor Akhir:</span>
                    <span className={`text-base font-black font-mono ${
                      detailItem.skor_akhir >= 85 ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {detailItem.skor_akhir} / 100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]">
                    <div className="text-[10px] text-[#645D55]">1. Prosedur (30%)</div>
                    <div className="text-sm font-bold font-mono text-[#181411] mt-0.5">{detailItem.skor_prosedur}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]">
                    <div className="text-[10px] text-[#645D55]">2. Waktu (20%)</div>
                    <div className="text-sm font-bold font-mono text-[#181411] mt-0.5">{detailItem.skor_waktu}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]">
                    <div className="text-[10px] text-[#645D55]">3. K3 & Bersih (15%)</div>
                    <div className="text-sm font-bold font-mono text-[#181411] mt-0.5">{detailItem.skor_kebersihan}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]">
                    <div className="text-[10px] text-[#645D55]">4. Kerjasama (15%)</div>
                    <div className="text-sm font-bold font-mono text-[#181411] mt-0.5">{detailItem.skor_kerjasama}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]">
                    <div className="text-[10px] text-[#645D55]">5. Knowledge (20%)</div>
                    <div className="text-sm font-bold font-mono text-[#181411] mt-0.5">{detailItem.skor_knowledge}</div>
                  </div>
                </div>
              </div>

              {/* Catatan Trainer */}
              {detailItem.catatan && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-amber-950">
                  <div className="font-bold text-[11px] uppercase tracking-wider mb-1">Catatan Asesor / Trainer:</div>
                  <p className="text-xs leading-relaxed">{detailItem.catatan}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E6E1DA] bg-[#FAF8F5] flex items-center justify-between">
              <button
                type="button"
                onClick={() => exportPenilaianPraktikProdukPDF(detailItem)}
                className="px-4 py-2 rounded-xl bg-[#96171B] hover:bg-[#7A1216] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Unduh Lembar PDF Resmi</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 rounded-xl border border-[#E6E1DA] text-[#645D55] hover:text-[#181411] text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Catatan Evaluasi"
        message="Apakah Anda yakin ingin menghapus catatan evaluasi praktik produk ini? Data akan dihapus permanen dari memori dan sinkronisasi Supabase."
        detailText={deleteTarget ? `${deleteTarget.namaKru} — Produk: ${deleteTarget.produk}` : ''}
        confirmLabel="Ya, Hapus Catatan"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#181411] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-3 duration-200 border border-neutral-700">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
