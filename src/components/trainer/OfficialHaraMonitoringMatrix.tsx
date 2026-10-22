import React, { useState } from 'react';
import {
  Check, X, CheckSquare, Printer, Download, Plus, Search,
  Filter, FileText, UserCheck, AlertTriangle, ShieldCheck,
  Calendar, Award, ChevronRight, Edit3
} from 'lucide-react';
import { db } from '../../lib/storage';
import { OJTCrewMonitoringRecord, Outlet, Division } from '../../types';
import {
  OFFICIAL_HARA_MONITORING_GROUPS,
  MonitoringModuleGroup
} from '../../lib/officialHaraTrainingCurriculum';
import { ChickenIcon, CashierIcon, ChiliIcon, BroomCleanIcon } from '../ui/Icons';

interface OfficialHaraMonitoringMatrixProps {
  monitoringList: OJTCrewMonitoringRecord[];
  onToggleDayCheck: (kruId: string, dayNumber: number) => void;
  onOpenRaporKru?: (kruName: string) => void;
  onOpenGateEval: (kru: OJTCrewMonitoringRecord, stage: any) => void;
  onRefresh: () => void;
}

export const OfficialHaraMonitoringMatrix: React.FC<OfficialHaraMonitoringMatrixProps> = ({
  monitoringList,
  onToggleDayCheck,
  onOpenRaporKru,
  onOpenGateEval,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [filterOutlet, setFilterOutlet] = useState('ALL');
  const [filterDivisi, setFilterDivisi] = useState<Division | 'ALL'>('ALL');
  const [editingNotesKru, setEditingNotesKru] = useState<OJTCrewMonitoringRecord | null>(null);
  const [notesText, setNotesText] = useState('');

  // Add Crew to OJT Sheet Modal
  const [isAddCrewOpen, setIsAddCrewOpen] = useState(false);
  const [newCrewData, setNewCrewData] = useState({
    nama_kru: '',
    divisi: 'Kitchen' as Division,
    kode_outlet: 'HC-JTS01',
    nama_outlet: 'Hara Chicken Jatiasih',
    join_date: new Date().toISOString().split('T')[0],
    mentor_nama: 'Haikal Abi (Lead Trainer)',
  });

  const outlets = db.getOutlets();

  const filtered = monitoringList.filter(k => {
    if (filterOutlet !== 'ALL' && k.kode_outlet !== filterOutlet) return false;
    if (filterDivisi !== 'ALL' && k.divisi !== filterDivisi) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return k.nama_kru.toLowerCase().includes(q) ||
             k.kode_outlet.toLowerCase().includes(q) ||
             k.divisi.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSaveNotes = () => {
    if (!editingNotesKru) return;
    editingNotesKru.catatan_ojt = notesText;
    db.saveOJTMonitoring(editingNotesKru);
    setEditingNotesKru(null);
    onRefresh();
  };

  const handleAddNewCrew = () => {
    if (!newCrewData.nama_kru.trim()) {
      alert('Nama kru wajib diisi.');
      return;
    }

    const targetDate = new Date(new Date(newCrewData.join_date).getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const matchOutlet = outlets.find(o => o.kode_outlet === newCrewData.kode_outlet);

    const newRecord: OJTCrewMonitoringRecord = {
      id: `ojt-${Date.now()}`,
      kru_id: `kru-${Date.now()}`,
      nama_kru: newCrewData.nama_kru,
      kode_outlet: newCrewData.kode_outlet,
      nama_outlet: matchOutlet ? matchOutlet.nama_outlet : newCrewData.nama_outlet,
      divisi: newCrewData.divisi,
      tanggal_mulai: newCrewData.join_date,
      target_kelulusan: targetDate,
      join_date: newCrewData.join_date,
      target_selesai: targetDate,
      hari_berjalan: 1,
      minggu_aktif: 1,
      status_keseluruhan: 'On-Track',
      progres_persen: 3,
      mentor_nama: newCrewData.mentor_nama,
      skor_komposit_ojt: 85,
      breakdown_skor: {
        skor_harian: 100,
        skor_gates: 85,
        skor_teori: 85,
        skor_sikap: 90,
        rumus_kalkulasi: '(100 × 0.25) + (85 × 0.40) + (85 × 0.20) + (90 × 0.15) = 87.0'
      },
      checked_days: { 1: true },
      evaluasi_gates: {},
      tasks_harian: []
    };

    db.saveOJTMonitoring(newRecord);
    setIsAddCrewOpen(false);
    setNewCrewData({
      nama_kru: '',
      divisi: 'Kitchen',
      kode_outlet: 'HC-JTS01',
      nama_outlet: 'Hara Chicken Jatiasih',
      join_date: new Date().toISOString().split('T')[0],
      mentor_nama: 'Haikal Abi (Lead Trainer)',
    });
    onRefresh();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Action and Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-200">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-xs">
              Lembar Monitoring Kru Training & Onboarding (Matriks 30 Hari)
            </h3>
            <p className="text-[11px] text-slate-500">
              Format baku resmi HARA Chicken — Klik kotak centang untuk memverifikasi kehadiran & penyelesaian tugas per hari
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterOutlet}
            onChange={e => setFilterOutlet(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold"
          >
            <option value="ALL">Semua Outlet</option>
            {outlets.map(o => (
              <option key={o.kode_outlet} value={o.kode_outlet}>{o.kode_outlet} — {o.nama_outlet}</option>
            ))}
          </select>

          <select
            value={filterDivisi}
            onChange={e => setFilterDivisi(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold"
          >
            <option value="ALL">Semua Divisi ({monitoringList.length})</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Kasir">Kasir</option>
            <option value="Geprek">Geprek</option>
            <option value="Helper">Helper</option>
          </select>

          <button
            onClick={() => setIsAddCrewOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kru ke Lembar</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Lembar</span>
          </button>
        </div>
      </div>

      {/* Non-Linear & Jobdesk Explanation Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#8B1418] flex items-center justify-center shrink-0 border border-rose-200">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900">Kurikulum OJT 30 Hari: Bebas Urutan (Non-Linear) & Sesuai Shift Lapangan</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono">
                Objektif 100% SOP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              Kru dapat onboarding kapan pun (awal, tengah, atau akhir bulan). Modul harian dapat diverifikasi secara bebas urutan mengikuti kesiapan shift gerai. Fondasi awal (Hari 1-3) berlaku umum untuk semua divisi, lalu modul stasiun diverifikasi sesuai jobdesk utama kru (Kitchen, Kasir, Geprek, Helper).
            </p>
          </div>
        </div>
      </div>

      {/* The 30-Day Grid Table Matching PDF Page 2 */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-[10.5px]">
            {/* Group Headers (Tier 1) */}
            <thead>
              <tr className="bg-amber-100 text-amber-950 font-bold border-b border-slate-300">
                <th rowSpan={2} className="py-2 px-2.5 text-left border-r border-slate-300 sticky left-0 bg-amber-100 z-20 min-w-[35px]">
                  NO
                </th>
                <th rowSpan={2} className="py-2 px-3 text-left border-r border-slate-300 sticky left-[35px] bg-amber-100 z-20 min-w-[130px]">
                  NAMA CREW
                </th>
                <th rowSpan={2} className="py-2 px-2 border-r border-slate-300 min-w-[70px]">
                  OUTLET
                </th>
                <th rowSpan={2} className="py-2 px-2 border-r border-slate-300 min-w-[75px]">
                  JOIN DATE
                </th>
                <th rowSpan={2} className="py-2 px-2 border-r border-slate-300 min-w-[75px]">
                  TARGET SELESAI
                </th>

                {/* 12 Module Groups */}
                {OFFICIAL_HARA_MONITORING_GROUPS.map(grp => (
                  <th
                    key={grp.id}
                    colSpan={grp.total_hari}
                    className={`py-1.5 px-1 border-r border-slate-300 text-[10px] uppercase tracking-wider font-extrabold ${grp.header_bg}`}
                    title={`${grp.nama_modul} (Hari ${grp.hari_start} s/d ${grp.hari_end}) — PIC: ${grp.pic_default}`}
                  >
                    {grp.singkatan}
                  </th>
                ))}

                <th rowSpan={2} className="py-2 px-3 border-l border-slate-300 text-left min-w-[150px]">
                  Catatan Evaluasi & Rekomendasi
                </th>
                <th rowSpan={2} className="py-2 px-2 text-center min-w-[70px]">
                  Aksi
                </th>
              </tr>

              {/* Day Number Headers (Tier 2: 1 to 30) */}
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
                {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                  const grp = OFFICIAL_HARA_MONITORING_GROUPS.find(g => g.days.includes(day));
                  const isOffJob = day <= 3;

                  return (
                    <th
                      key={day}
                      className={`py-1 px-1 border-r border-slate-200 min-w-[24px] text-[10px] font-mono ${
                        isOffJob ? 'bg-amber-50 text-amber-900 font-extrabold' : 'bg-slate-50'
                      }`}
                      title={`Hari ke-${day}: ${grp?.nama_modul || 'OJT'}`}
                    >
                      {day}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Crew Rows */}
            <tbody className="divide-y divide-slate-200">
              {filtered.map((crew, rowIdx) => {
                const checkedDays = crew.checked_days || {};
                const checkedCount = Object.values(checkedDays).filter(Boolean).length;
                const progressPct = Math.round((checkedCount / 30) * 100);
                const isRemedial = crew.status_keseluruhan === 'Kritis / Remedial';

                return (
                  <tr key={`${crew.id}-${rowIdx}`} className="hover:bg-slate-50/80 transition-colors">
                    {/* No */}
                    <td className="py-2.5 px-2 text-left font-mono text-slate-500 border-r border-slate-200 sticky left-0 bg-white z-10">
                      {rowIdx + 1}
                    </td>

                    {/* Nama Crew */}
                    <td className="py-2.5 px-3 text-left font-bold text-slate-900 border-r border-slate-200 sticky left-[35px] bg-white z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[110px]" title={crew.nama_kru}>
                          {crew.nama_kru}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold shrink-0">
                          {crew.divisi === 'Kitchen' ? <ChickenIcon size={11} /> :
                           crew.divisi === 'Kasir' ? <CashierIcon size={11} /> :
                           crew.divisi === 'Geprek' ? <ChiliIcon size={11} /> : <BroomCleanIcon size={11} />}
                          <span>{crew.divisi}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-12 bg-slate-100 rounded-full h-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isRemedial ? 'bg-red-500' : 'bg-slate-900'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-slate-400">{progressPct}%</span>
                      </div>
                    </td>

                    {/* Outlet */}
                    <td className="py-2.5 px-2 border-r border-slate-200 font-mono text-slate-700">
                      {crew.kode_outlet}
                    </td>

                    {/* Join Date */}
                    <td className="py-2.5 px-2 border-r border-slate-200 font-mono text-slate-600 text-[10px]">
                      {crew.join_date || crew.tanggal_mulai || '2026-08-01'}
                    </td>

                    {/* Target Selesai */}
                    <td className="py-2.5 px-2 border-r border-slate-200 font-mono text-slate-600 text-[10px]">
                      {crew.target_selesai || crew.target_kelulusan || '2026-08-31'}
                    </td>

                    {/* Day 1 to 30 Checkboxes */}
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                      const isChecked = !!checkedDays[day];
                      const isGateDay = day === 7 || day === 14 || day === 21 || day === 30;

                      return (
                        <td
                          key={day}
                          onClick={() => onToggleDayCheck(crew.kru_id, day)}
                          className={`p-0 border-r border-slate-200 cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-emerald-50/60 hover:bg-emerald-100/60'
                              : isGateDay
                              ? 'bg-red-50/30 hover:bg-red-50/80'
                              : 'hover:bg-slate-100'
                          }`}
                          title={`Hari ke-${day}: Klik untuk centang status`}
                        >
                          <div className="w-full h-8 flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleDayCheck(crew.kru_id, day)}
                              onClick={e => e.stopPropagation()}
                              className={`w-3.5 h-3.5 rounded accent-slate-900 cursor-pointer ${
                                isGateDay && !isChecked ? 'ring-1 ring-red-400' : ''
                              }`}
                            />
                          </div>
                        </td>
                      );
                    })}

                    {/* Catatan / Rekomendasi */}
                    <td
                      onClick={() => {
                        setEditingNotesKru(crew);
                        setNotesText(crew.catatan_ojt || crew.catatan_remedial_aktif || '');
                      }}
                      className="py-2 px-3 text-left border-l border-slate-200 text-[10px] text-slate-600 hover:bg-slate-50 cursor-pointer group"
                      title="Klik untuk mengubah catatan evaluasi"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="line-clamp-2">
                          {crew.catatan_ojt || crew.catatan_remedial_aktif || 'Belum ada catatan khusus. Klik untuk menulis umpan balik.'}
                        </span>
                        <Edit3 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0" />
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenGateEval(crew, 'GATE_3_DAY_21')}
                          className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-semibold"
                          title="Buka Evaluasi Gate"
                        >
                          Gate
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend / Keterangan Dokumen Baku */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-slate-800">Keterangan Dokumen:</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-amber-200 border border-amber-400" />
              <span>Off Job Trainee (In-Class Onboarding: Hari 1 - 3)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-white border border-slate-400" />
              <span>On Job Trainee (Pendampingan Gerai: Hari 4 - 30)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded bg-red-100 border border-red-400" />
              <span>Titik Milestone Gate (H7, H14, H21, H30)</span>
            </div>
          </div>

          <div className="text-slate-500 font-mono text-[10px]">
            Siklus Standar: 1 Hari - 30 Hari Kerja · Peserta OJT: 11 - 17 Peserta / Batch
          </div>
        </div>
      </div>

      {/* Edit Catatan Modal */}
      {editingNotesKru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-sm text-slate-900">
                Catatan Evaluasi OJT — {editingNotesKru.nama_kru}
              </h4>
              <button onClick={() => setEditingNotesKru(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Progres, Sikap Kerja, atau Rekomendasi Kelulusan:
              </label>
              <textarea
                rows={4}
                value={notesText}
                onChange={e => setNotesText(e.target.value)}
                placeholder="Tuliskan catatan kemajuan kru, kedisiplinan, atau instruksi remedial..."
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingNotesKru(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Crew Modal */}
      {isAddCrewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-900">
                Tambah Kru Baru ke Lembar Monitoring OJT
              </h4>
              <button onClick={() => setIsAddCrewOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Kru:</label>
                <input
                  type="text"
                  value={newCrewData.nama_kru}
                  onChange={e => setNewCrewData({ ...newCrewData, nama_kru: e.target.value })}
                  placeholder="Contoh: Bayu Saputra"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Divisi Stasiun:</label>
                  <select
                    value={newCrewData.divisi}
                    onChange={e => setNewCrewData({ ...newCrewData, divisi: e.target.value as Division })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50"
                  >
                    <option value="Kitchen">Kitchen</option>
                    <option value="Kasir">Kasir</option>
                    <option value="Geprek">Geprek</option>
                    <option value="Helper">Helper</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Outlet Penempatan:</label>
                  <select
                    value={newCrewData.kode_outlet}
                    onChange={e => setNewCrewData({ ...newCrewData, kode_outlet: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50"
                  >
                    {outlets.map(o => (
                      <option key={o.kode_outlet} value={o.kode_outlet}>{o.kode_outlet}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Join Date (Hari ke-1):</label>
                  <input
                    type="date"
                    value={newCrewData.join_date}
                    onChange={e => setNewCrewData({ ...newCrewData, join_date: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Trainer / Mentor:</label>
                  <input
                    type="text"
                    value={newCrewData.mentor_nama}
                    onChange={e => setNewCrewData({ ...newCrewData, mentor_nama: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddCrewOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleAddNewCrew}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs"
              >
                Daftarkan ke Lembar OJT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
