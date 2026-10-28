import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, User, CheckCircle2, AlertCircle,
  Plus, Search, Filter, BookOpen, ChevronRight, FileText,
  Building2, Users, Sparkles
} from 'lucide-react';
import { db } from '../lib/storage';
import { Outlet, RencanaTraining, AppUser } from '../types';
import { PageHeaderBanner } from './PageHeaderBanner';

interface JadwalKunjunganViewProps {
  selectedOutletCode: string;
  onSelectOutletCode?: (code: string) => void;
  currentUser?: AppUser;
}

export const JadwalKunjunganView: React.FC<JadwalKunjunganViewProps> = ({
  selectedOutletCode,
  onSelectOutletCode,
  currentUser,
}) => {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [schedules, setSchedules] = useState<RencanaTraining[]>([]);
  const [filterOutlet, setFilterOutlet] = useState(selectedOutletCode || 'ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Schedule / Logbook Entry Form
  const [formData, setFormData] = useState({
    tanggal_pelaksanaan: new Date().toISOString().split('T')[0],
    kode_outlet: outlets[0]?.kode_outlet || 'HC-JTS01',
    topik: 'Pelatihan & Audit Standar Penggorengan Ayam Crispy (SOP 170°C)',
    tujuan_pembelajaran: 'Memastikan seluruh kru kitchen konsisten mematuhi parameter suhu dan waktu tiris.',
    peserta: 'Seluruh Kru Kitchen & Helper Shift Pagi',
    metode: 'Demonstrasi Praktik Langsung & Uji Rasa',
    durasi: '90 Menit',
    fasilitator: currentUser?.nama || 'Haikal Abi (Lead Trainer)',
    alat_bantu: 'Termometer Infrared, Stopwatch, SOP Sheet',
    status: 'Direncanakan' as const,
  });

  const loadData = () => {
    setOutlets(db.getTable<Outlet>('outlets'));
    setSchedules(db.getTable<RencanaTraining>('rencana_training'));
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('rencana_training', loadData);
    return () => unsub();
  }, []);

  const filteredList = schedules.filter((s) => {
    const matchOutlet = filterOutlet === 'ALL' || s.kode_outlet === filterOutlet || s.kode_outlet === 'Semua Outlet';
    const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchOutlet && matchStatus;
  });

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    db.insertRow('rencana_training', {
      ...formData,
      status: formData.status as any,
    });
    db.addLog(
      'UBAH',
      'Pelatihan',
      `Jadwal kunjungan baru ditambahkan untuk ${formData.kode_outlet}: ${formData.topik}`
    );
    setIsModalOpen(false);
    loadData();
  };

  const handleUpdateStatus = (id: string, newStatus: any) => {
    db.updateRow('rencana_training', id, { status: newStatus });
    loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <PageHeaderBanner
        category="AGENDA LAPANGAN"
        title="Kalender Pelatihan & Logbook Kunjungan Outlet"
        description="Kelola agenda kunjungan trainer dan supervisor ke seluruh jaringan outlet, koordinasikan jadwal training shift, dan catat rekap hasil pendampingan."
        icon={<Calendar size={22} />}
      />

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Outlet Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-stone-600">Outlet:</span>
            <select
              value={filterOutlet}
              onChange={(e) => setFilterOutlet(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#96171B]"
            >
              <option value="ALL">Semua Outlet ({outlets.length})</option>
              {outlets.map((o) => (
                <option key={o.kode_outlet} value={o.kode_outlet}>
                  {o.kode_outlet} - {o.nama_outlet}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-stone-600">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#96171B]"
            >
              <option value="ALL">Semua Status</option>
              <option value="Direncanakan">Direncanakan</option>
              <option value="Berjalan">Sedang Berjalan</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Add Schedule Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#96171B] hover:bg-[#801216] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Plus size={15} />
          <span>Tambah Jadwal Kunjungan</span>
        </button>
      </div>

      {/* Schedule & Logbook Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredList.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-400 space-y-2">
            <Calendar size={36} className="mx-auto text-stone-300" />
            <p className="font-bold text-stone-600 text-sm">Belum ada agenda kunjungan terdaftar.</p>
            <p className="text-xs text-stone-400">Klik tombol "Tambah Jadwal Kunjungan" untuk menjadwalkan agenda training outlet.</p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#96171B] bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                    {item.kode_outlet}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                      item.status === 'Selesai'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : item.status === 'Berjalan'
                        ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse'
                        : item.status === 'Dibatalkan'
                        ? 'bg-stone-100 text-stone-500 border-stone-300'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="font-black text-stone-900 text-sm leading-snug">
                  {item.topik}
                </h3>

                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {item.tujuan_pembelajaran}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-stone-400 shrink-0" />
                    <span>{item.tanggal_pelaksanaan} &bull; Durasi: {item.durasi || '90m'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-stone-400 shrink-0" />
                    <span className="truncate">PIC: <b>{item.fasilitator}</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={13} className="text-stone-400 shrink-0" />
                    <span className="truncate">Sasaran: {item.peserta}</span>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1 text-[11px]">
                {item.status !== 'Selesai' ? (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'Selesai')}
                    className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 size={12} />
                    <span>Tandai Selesai</span>
                  </button>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> Selesai Dilaksanakan
                  </span>
                )}

                {item.status === 'Direncanakan' && (
                  <button
                    onClick={() => handleUpdateStatus(item.id, 'Berjalan')}
                    className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Mulai Shift
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tambah Jadwal Kunjungan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-stone-200 p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#96171B]" />
                <h3 className="font-black text-stone-900 text-sm">
                  Jadwalkan Kunjungan & Training Cabang
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 font-bold flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tanggal Kunjungan</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal_pelaksanaan}
                    onChange={(e) => setFormData({ ...formData, tanggal_pelaksanaan: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Target Cabang</label>
                  <select
                    value={formData.kode_outlet}
                    onChange={(e) => setFormData({ ...formData, kode_outlet: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-bold"
                  >
                    {outlets.map((o) => (
                      <option key={o.kode_outlet} value={o.kode_outlet}>
                        {o.kode_outlet} - {o.nama_outlet}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Topik Pelatihan / Kunjungan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kalibrasi Standar Suhu Fryer & Waktu Tiris"
                  value={formData.topik}
                  onChange={(e) => setFormData({ ...formData, topik: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Tujuan Pembelajaran</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Peningkatan kepatuhan standar SOP dan penurunan keluhan..."
                  value={formData.tujuan_pembelajaran}
                  onChange={(e) => setFormData({ ...formData, tujuan_pembelajaran: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Peserta Sasaran</label>
                  <input
                    type="text"
                    placeholder="Kru Kitchen / Semua Kru Shift"
                    value={formData.peserta}
                    onChange={(e) => setFormData({ ...formData, peserta: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Durasi</label>
                  <input
                    type="text"
                    placeholder="90 Menit"
                    value={formData.durasi}
                    onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Trainer / Fasilitator Kunjungan</label>
                <input
                  type="text"
                  required
                  value={formData.fasilitator}
                  onChange={(e) => setFormData({ ...formData, fasilitator: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl px-3 py-2 text-stone-900"
                />
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-stone-300 text-stone-600 font-bold hover:bg-stone-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-[#96171B] hover:bg-[#801216] text-white font-bold cursor-pointer shadow-sm"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
