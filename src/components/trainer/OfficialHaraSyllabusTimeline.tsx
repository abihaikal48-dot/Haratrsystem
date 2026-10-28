import React, { useState } from 'react';
import {
  Calendar, Clock, Users, BookOpen, CheckCircle2, ChevronRight,
  Shield, Award, Flame, UtensilsCrossed, AlertCircle, FileText,
  Building, Check, Layers, UserCheck
} from 'lucide-react';
import {
  OFFICIAL_HARA_OFF_JOB_ONBOARDING,
  OFFICIAL_HARA_ON_JOB_PENDAMPINGAN,
  OFFICIAL_HARA_MONITORING_GROUPS
} from '../../lib/officialHaraTrainingCurriculum';

export const OfficialHaraSyllabusTimeline: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'off_job' | 'on_job'>('timeline');

  // Total calendar days for Gantt Chart (1 - 31)
  const days31 = Array.from({ length: 31 }, (_, i) => i + 1);

  // Timeline Gantt rows from document Page 1
  const timelineActivities = [
    { no: 1, name: 'Orientasi Perusahaan dan Outlet', pic: 'Supervisor Outlet, Supervisor ODHRL', dept: 'ODHRL & Operasional', startDay: 1, endDay: 3, color: 'bg-amber-400 border-amber-600' },
    { no: 2, name: 'Pengenalan Area Kerja & Grooming', pic: 'Supervisor Outlet', dept: 'Operasional', startDay: 2, endDay: 4, color: 'bg-yellow-400 border-yellow-600' },
    { no: 3, name: 'Pengenalan Produk & Bahan Baku', pic: 'Supervisor Outlet', dept: 'Operasional', startDay: 3, endDay: 5, color: 'bg-yellow-400 border-yellow-600' },
    { no: 4, name: 'Pelatihan Kitchen Dasar', pic: 'Supervisor Outlet', dept: 'Operasional', startDay: 5, endDay: 8, color: 'bg-yellow-400 border-yellow-600' },
    { no: 5, name: 'Pelatihan Area Service / Kasir', pic: 'Supervisor Outlet', dept: 'Operasional', startDay: 9, endDay: 12, color: 'bg-yellow-400 border-yellow-600' },
    { no: 6, name: 'Pelatihan Kebersihan Outlet (Housekeeping)', pic: 'Supervisor Outlet', dept: 'Operasional', startDay: 13, endDay: 16, color: 'bg-yellow-400 border-yellow-600' },
    { no: 7, name: 'On Boarding*', pic: 'Supervisor ODHRL', dept: 'ODHRL, HRGS, RnD, Operasional, FAT', startDay: 17, endDay: 18, color: 'bg-amber-600 text-white border-amber-700' },
    { no: 8, name: 'Handling Customer & Komplain Dasar', pic: 'Supervisor Outlet', dept: 'Operasional', startDay: 17, endDay: 18, color: 'bg-yellow-400 border-yellow-600' },
    { no: 9, name: 'Operasional Mandiri – Shift', pic: 'Supervisor Outlet', dept: 'Operasional', startDay: 19, endDay: 22, color: 'bg-yellow-400 border-yellow-600' },
    { no: 10, name: 'Rotasi Area Kerja', pic: 'Supervisor Outlet', dept: 'Operasional', startDay: 23, endDay: 26, color: 'bg-yellow-400 border-yellow-600' },
    { no: 11, name: 'Simulasi Operasional Penuh', pic: 'Supervisor Outlet', dept: 'Operasional', startDay: 27, endDay: 27, color: 'bg-yellow-400 border-yellow-600' },
    { no: 12, name: 'Evaluasi Akhir & Feedback', pic: 'Supervisor Outlet, Supervisor ODHRL', dept: 'ODHRL & Operasional', startDay: 28, endDay: 28, color: 'bg-emerald-500 text-white border-emerald-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600" />
            <span>Rancangan & Timeline Pelatihan Pengenalan Crew HARA</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            Standar kurikulum resmi HARA Chicken — Siklus Onboarding In-Class 24 Jam & Pendampingan OJT Outlet 28 Hari
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'timeline' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Timeline Kalender (31 Hari)
          </button>
          <button
            onClick={() => setActiveTab('off_job')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'off_job' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Off Job In-Class (24 Jam)
          </button>
          <button
            onClick={() => setActiveTab('on_job')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'on_job' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            On Job Pendampingan (28 Hari)
          </button>
        </div>
      </div>

      {/* VIEW 1: GANTT CHART TIMELINE KALENDER (31 HARI) */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Time line Pelatihan Crew (Gantt Chart 31 Hari Kalender)
            </h4>
            <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-amber-600" />
                <span>Off Job Trainee / In Class</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-400 border border-yellow-600" />
                <span>On Job Trainee / Out Class</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span>Evaluasi Akhir & Kelulusan</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-[10.5px] border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-2 text-left border-r border-slate-200 min-w-[28px]">No</th>
                  <th className="p-2 text-left border-r border-slate-200 min-w-[200px]">Kegiatan Pelatihan</th>
                  <th className="p-2 text-left border-r border-slate-200 min-w-[140px]">PIC Penanggung Jawab</th>
                  <th className="p-2 text-left border-r border-slate-200 min-w-[130px]">Departemen</th>
                  <th colSpan={31} className="p-1 text-center bg-slate-200 text-slate-800 font-mono text-[10px]">
                    Hari Kalender (1 - 31)
                  </th>
                </tr>
                <tr className="bg-slate-50 text-slate-600 font-mono text-[9px] border-b border-slate-200">
                  <th colSpan={4} className="border-r border-slate-200"></th>
                  {days31.map(d => (
                    <th key={d} className="p-0.5 w-[20px] text-center border-r border-slate-200 min-w-[19px]">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {timelineActivities.map(act => (
                  <tr key={act.no} className="hover:bg-slate-50/70">
                    <td className="p-2 font-mono text-slate-500 border-r border-slate-200">{act.no}</td>
                    <td className="p-2 font-semibold text-slate-900 border-r border-slate-200">{act.name}</td>
                    <td className="p-2 text-slate-600 text-[11px] border-r border-slate-200">{act.pic}</td>
                    <td className="p-2 text-slate-500 text-[11px] border-r border-slate-200">{act.dept}</td>

                    {/* 31 Calendar Days Bar */}
                    {days31.map(day => {
                      const isActive = day >= act.startDay && day <= act.endDay;
                      return (
                        <td key={day} className="p-0 border-r border-slate-100 text-center">
                          {isActive && (
                            <div
                              className={`h-4 w-full ${act.color} rounded-xs mx-auto shadow-2xs`}
                              title={`${act.name}: Hari ${act.startDay} - ${act.endDay}`}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
            <p><strong>*Catatan Pelaksanaan Onboarding:</strong> Menyesuaikan minimal jumlah peserta onboarding batch outlet (11 - 17 peserta). Training karyawan baru berjalan selama 1 hari - 45 hari kerja (dengan fase intensif 30 hari pertama).</p>
          </div>
        </div>
      )}

      {/* VIEW 2: OFF JOB IN-CLASS SYLLABUS (24 JAM) */}
      {activeTab === 'off_job' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Training (Off Job Trainee) On Boarding Crew — In Class (Total 24 Jam)
              </h4>
              <p className="text-xs text-slate-500">
                Pemberian fondasi teori, visi misi, regulasi outlet, food safety, K3, dan cooking lab RnD selama 3 hari
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
              3 Hari / 24 Jam Pelajaran
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase">
                  <th className="p-3">Hari</th>
                  <th className="p-3">Materi Training</th>
                  <th className="p-3">Tujuan Pembelajaran</th>
                  <th className="p-3">Durasi</th>
                  <th className="p-3">Metode Pelatihan</th>
                  <th className="p-3">Trainer / Fasilitator</th>
                  <th className="p-3">Bentuk Evaluasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {OFFICIAL_HARA_OFF_JOB_ONBOARDING.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="p-3 font-bold font-mono text-slate-700">Hari {item.hari_ke}</td>
                    <td className="p-3 font-semibold text-slate-900">{item.materi}</td>
                    <td className="p-3 text-slate-600">{item.tujuan}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{item.durasi_jam} Jam</td>
                    <td className="p-3 text-slate-600">{item.metode}</td>
                    <td className="p-3 font-medium text-slate-800">{item.trainer_pic}</td>
                    <td className="p-3 text-slate-600">{item.evaluasi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: ON JOB PENDAMPINGAN CREW (28 HARI) */}
      {activeTab === 'on_job' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                Training (On Job Trainee) Pendampingan Crew — Out Class Outlet (28 Hari)
              </h4>
              <p className="text-xs text-slate-500">
                Kurikulum pendampingan intensif langsung di outlet dengan mentor, supervisor, dan kepala outlet
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 font-bold text-xs border border-blue-300">
              28 Hari OJT Mandiri
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFICIAL_HARA_ON_JOB_PENDAMPINGAN.map((item) => (
              <div key={item.no} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {item.hari_range} ({item.durasi_hari} Hari)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    Dept: {item.departemen}
                  </span>
                </div>

                <div>
                  <h5 className="font-bold text-sm text-slate-900">{item.materi_kegiatan}</h5>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">{item.tujuan_pembelajaran}</p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-700 space-y-1">
                  <span className="font-bold text-slate-800 block text-[10px] uppercase">Fokus Pokok Bahasan:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {item.detail_poin.map((dp, dIdx) => (
                      <li key={dIdx}>{dp}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10.5px] pt-1 text-slate-500 border-t border-slate-100">
                  <div>
                    <span className="font-bold text-slate-700 block">Penanggung Jawab:</span>
                    <span>{item.pic_trainer}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block">Bentuk Evaluasi:</span>
                    <span>{item.evaluasi_catatan}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
