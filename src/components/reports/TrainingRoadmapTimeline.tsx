import React, { useState } from 'react';
import {
  Calendar, CheckCircle2, Clock, Target, Sparkles,
  ArrowRight, ShieldCheck, UserCheck, BookOpen, Wrench,
  AlertTriangle, Filter, Plus, Flame, Award
} from 'lucide-react';
import { RencanaTraining, CoachingLog, TNA, ObservasiLapangan } from '../../types';

interface TrainingRoadmapTimelineProps {
  trainingPlans: RencanaTraining[];
  coachingLogs: CoachingLog[];
  tnaList: TNA[];
  observasiList: ObservasiLapangan[];
  selectedOutletCode: string;
}

export const TrainingRoadmapTimeline: React.FC<TrainingRoadmapTimelineProps> = ({
  trainingPlans,
  coachingLogs,
  tnaList,
  observasiList,
  selectedOutletCode,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'DONE' | 'UPCOMING'>('ALL');

  // Past Completed Items
  const pastEvents = [
    {
      id: 'p-1',
      tanggal: '2026-08-05',
      tipe: 'Audit TNA Awal',
      judul: 'Pemetaan Gap SOP Kepatuhan Suhu & Gramasi Bumbu',
      outlet: selectedOutletCode === 'ALL' ? 'HC-JTS01' : selectedOutletCode,
      status: 'DONE',
      keterangan: 'Ditemukan deviasi holding time warmer dan telah dibuatkan modul retraining terarah.',
      icon: AlertTriangle,
      color: 'amber',
    },
    {
      id: 'p-2',
      tanggal: '2026-08-10',
      tipe: 'Pembinaan GROW 1-on-1',
      judul: 'GROW Coaching: Peningkatan Kecepatan Layanan Kasir & POS',
      outlet: selectedOutletCode === 'ALL' ? 'HC-KRW02' : selectedOutletCode,
      status: 'DONE',
      keterangan: 'Kru menyepakati target waktu transaksi kasir maksimal 45 detik per pelanggan.',
      icon: UserCheck,
      color: 'blue',
    },
    {
      id: 'p-3',
      tanggal: '2026-08-14',
      tipe: 'Ujian Sertifikasi 4-Pilar',
      judul: 'Uji Teori, Praktik & Karakter Budaya H.A.R.A Kru Baru',
      outlet: selectedOutletCode === 'ALL' ? 'HC-BKS03' : selectedOutletCode,
      status: 'DONE',
      keterangan: 'Sebanyak 92% peserta berhasil lulus uji kompetensi dengan passing grade > 78.',
      icon: Award,
      color: 'emerald',
    },
  ];

  // Future Planned Items
  const upcomingEvents = [
    {
      id: 'u-1',
      tanggal: '2026-08-22',
      tipe: 'Sesi Pendampingan Lapangan',
      judul: 'Audit Mutu Higienitas & Kalibrasi Deep Fryer Rutin',
      outlet: selectedOutletCode === 'ALL' ? 'HC-JTS01' : selectedOutletCode,
      status: 'UPCOMING',
      keterangan: 'Pemeriksaan kepatuhan suhu 170°C dan sanitasi stasiun kerja penepungan.',
      icon: Wrench,
      color: 'purple',
    },
    {
      id: 'u-2',
      tanggal: '2026-08-28',
      tipe: 'Simulasi Jam Sibuk',
      judul: 'Rush Hour Stress-Test & Speed Coaching Workshop',
      outlet: selectedOutletCode === 'ALL' ? 'HC-KRW02' : selectedOutletCode,
      status: 'UPCOMING',
      keterangan: 'Latihan skenario antrean panjang 50+ porsi dalam 30 menit tanpa mengurangi mutu.',
      icon: Flame,
      color: 'rose',
    },
    {
      id: 'u-3',
      tanggal: '2026-09-05',
      tipe: 'Sertifikasi Trainer Lapangan',
      judul: 'Delegasi & Otorisasi Kru Mahir Menjadi Field Mentor',
      outlet: selectedOutletCode === 'ALL' ? 'Semua Cabang' : selectedOutletCode,
      status: 'UPCOMING',
      keterangan: 'Pelatihan teknik evaluasi dan komunikasi coaching bagi kru senior.',
      icon: ShieldCheck,
      color: 'indigo',
    },
  ];

  const allItems = [...pastEvents, ...upcomingEvents];
  const displayedItems = allItems.filter((item) => {
    if (filterType === 'DONE') return item.status === 'DONE';
    if (filterType === 'UPCOMING') return item.status === 'UPCOMING';
    return true;
  });

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-md space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-[#96171B]" />
            <span>Timeline Integrasi Aktivitas Pelatihan: Masa Lalu & Masa Depan</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Kronologi terpadu apa yang TELAH dilakukan (past achievements) dan rencana aksi yang AKAN dilakukan (future roadmap).
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === 'ALL' ? 'bg-[#96171B] text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({allItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('DONE')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === 'DONE' ? 'bg-emerald-700 text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Telah Dilakukan ({pastEvents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('UPCOMING')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterType === 'UPCOMING' ? 'bg-purple-700 text-white shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Akan Dilakukan ({upcomingEvents.length})
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {displayedItems.map((item) => {
          const Icon = item.icon;
          const isDone = item.status === 'DONE';

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white transition-transform group-hover:scale-110 ${
                  isDone
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-purple-600 text-purple-600'
                }`}
              >
                <Icon size={12} />
              </div>

              {/* Card Content */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {isDone ? 'TELAH SELESAI' : 'RENCANA MENDATANG'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {item.tanggal}
                    </span>
                    <span className="text-xs font-bold text-[#96171B]">
                      • {item.outlet}
                    </span>
                  </div>

                  <span className="text-[10.5px] font-bold text-slate-400">
                    {item.tipe}
                  </span>
                </div>

                <h4 className="text-sm font-black text-slate-900">
                  {item.judul}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.keterangan}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
