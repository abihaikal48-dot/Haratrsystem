import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart, CheckCircle2, Award, RefreshCw, FileText, Check, X,
  AlertTriangle, ShieldCheck, Sparkles, User, Store,
  Info, ArrowUpRight, Save, Clock, ChevronRight, Target, Search,
  CheckSquare, BookOpen, Layers
} from 'lucide-react';
import { db } from '../lib/storage';
import { Kru, AuditAttitudeHara, HaraChecklistItem } from '../types';
import {
  HARA_OBJECTIVE_PILLARS,
  createDefaultHaraChecklist,
  calculateObjectiveHaraScores,
  HaraPillarDefinition
} from '../data/haraObjectiveRubrics';

interface PenilaianSikapHaraViewProps {
  selectedOutletCode: string;
  initialTargetKruName?: string | null;
}

export const PenilaianSikapHaraView: React.FC<PenilaianSikapHaraViewProps> = ({
  selectedOutletCode,
  initialTargetKruName,
}) => {
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [history, setHistory] = useState<AuditAttitudeHara[]>([]);
  const [selectedKruId, setSelectedKruId] = useState<string>('');

  // Objective Checklist State (16 Butir SOP Baku Terverifikasi)
  const [haraChecklist, setHaraChecklist] = useState<HaraChecklistItem[]>(() => createDefaultHaraChecklist());
  const [activePillarTab, setActivePillarTab] = useState<'H' | 'A1' | 'R' | 'A2'>('H');
  const [buktiAudit, setBuktiAudit] = useState<string>('');
  const [catatanPerilaku, setCatatanPerilaku] = useState<string>('');
  const [rekomendasiCoaching, setRekomendasiCoaching] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = () => {
    const allKru = db.getTable<Kru>('kru').filter((k) => k.status_aktif === 'Aktif');
    const filteredKru =
      selectedOutletCode === 'ALL'
        ? allKru
        : allKru.filter((k) => k.kode_outlet === selectedOutletCode);
    setKruList(filteredKru);

    const allHistory = db.getTable<AuditAttitudeHara>('attitude_hara');
    const filteredHistory =
      selectedOutletCode === 'ALL'
        ? allHistory
        : allHistory.filter((h) => h.kode_outlet === selectedOutletCode);
    setHistory(filteredHistory.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()));
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, [selectedOutletCode]);

  useEffect(() => {
    if (initialTargetKruName && kruList.length > 0) {
      const match = kruList.find(
        (k) => k.nama_kru.toLowerCase() === initialTargetKruName.toLowerCase()
      );
      if (match) {
        setSelectedKruId(match.id);
        return;
      }
    }
    if (kruList.length > 0 && !selectedKruId) {
      setSelectedKruId(kruList[0].id);
    }
  }, [kruList, selectedKruId, initialTargetKruName]);

  const currentKru = kruList.find((k) => k.id === selectedKruId);

  // Sync checklist with selected crew's latest audit or defaults
  useEffect(() => {
    if (currentKru) {
      const existingAudits = db.getTable<AuditAttitudeHara>('attitude_hara').filter(a => a.nama_kru === currentKru.nama_kru);
      const latest = existingAudits[0];
      if (latest && latest.checklist_items && latest.checklist_items.length > 0) {
        setHaraChecklist(latest.checklist_items);
        setBuktiAudit(latest.bukti_audit || `Audit shift ${currentKru.divisi} - ${currentKru.kode_outlet}`);
        setCatatanPerilaku(latest.catatan_perilaku || '');
        setRekomendasiCoaching(latest.rekomendasi_coaching || '');
      } else {
        setHaraChecklist(createDefaultHaraChecklist());
        setBuktiAudit(`Inspeksi kepatuhan SOP stasiun ${currentKru.divisi} - ${currentKru.kode_outlet}`);
        setCatatanPerilaku(`Observasi kepatuhan operasional ${currentKru.nama_kru} selama shift.`);
        setRekomendasiCoaching('Tindak lanjuti butir kepatuhan yang belum terpenuhi pada shift berikutnya.');
      }
    }
  }, [selectedKruId]);

  // Objective Real-Time Mathematical Calculation
  const objectiveScores = useMemo(() => {
    return calculateObjectiveHaraScores(haraChecklist);
  }, [haraChecklist]);

  const handleToggleHaraItem = (itemId: string) => {
    setHaraChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, terpenuhi: !item.terpenuhi } : item))
    );
  };

  const handleSetAllPillarItems = (pilarKey: 'H' | 'A1' | 'R' | 'A2', status: boolean) => {
    setHaraChecklist((prev) =>
      prev.map((item) => (item.pilar === pilarKey ? { ...item, terpenuhi: status } : item))
    );
  };

  const handleSaveAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentKru) {
      showToast('Pilih kru yang dinilai terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    const currentUser = db.getCurrentUser();

    const auditRecord: AuditAttitudeHara = {
      id: `att-${Date.now()}`,
      tanggal: new Date().toISOString(),
      nama_kru: currentKru.nama_kru,
      kode_outlet: currentKru.kode_outlet,
      evaluator_nama: currentUser?.nama || 'Lead Trainer HARA',
      skor_h_higienis: objectiveScores.skor_h,
      skor_a_antusias: objectiveScores.skor_r,     // R Responsif
      skor_r_resik: objectiveScores.skor_a2,       // A2 Adaptif
      skor_a_amanah: objectiveScores.skor_a1,     // A1 Amanah
      skor_rata_rata: objectiveScores.skor_rata_rata,
      checklist_items: haraChecklist,
      bukti_audit: buktiAudit || `Audit kepatuhan SOP stasiun ${currentKru.divisi}`,
      catatan_perilaku: catatanPerilaku || 'Audit kepatuhan objektif Visi-Misi H.A.R.A.',
      rekomendasi_coaching: rekomendasiCoaching || 'Tindak lanjuti butir kepatuhan pada shift berikutnya.',
      created_at: new Date().toISOString(),
    };

    db.saveAuditAttitudeHara(auditRecord);
    db.addLog(
      'TAMBAH',
      'Penilaian Kru',
      `Audit Objektif Budaya H.A.R.A untuk ${currentKru.nama_kru} disimpan (${objectiveScores.fulfilledCount}/${objectiveScores.totalItems} butir SOP terpenuhi, Skor: ${objectiveScores.skor_rata_rata}/100).`
    );

    setIsSubmitting(false);
    showToast(`Audit Objektif Budaya H.A.R.A untuk ${currentKru.nama_kru} berhasil disimpan! (Skor: ${objectiveScores.skor_rata_rata}/100)`);
    loadData();
  };

  const currentPillarDef = HARA_OBJECTIVE_PILLARS.find((p) => p.key === activePillarTab) || HARA_OBJECTIVE_PILLARS[0];
  const pillarChecklist = haraChecklist.filter((item) => item.pilar === currentPillarDef.key);

  const bobotKontribusi = Math.round(objectiveScores.skor_rata_rata * 0.25 * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner Penjelasan Bobot & Anti-Subjektivitas */}
      <div className="card-enterprise !p-4 bg-gradient-to-r from-[#96171B]/5 via-amber-500/5 to-transparent border border-[#96171B]/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#96171B] text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckSquare size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-[#96171B] uppercase tracking-wider">
                  Pilar 4: Evaluasi Sikap Kerja (Bobot 25%)
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Audit Objektif Bebas Subjektivitas Skala 1-5
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                Audit Kepatuhan Sikap & Budaya H.A.R.A Berbasis Checklist SOP Faktual
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500">Standar Baku:</span>
            <span className="text-xs font-bold text-[#96171B]">
              16 Parameter SOP Terverifikasi
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom 1 & 2: Form Input Ceklis Objektif */}
        <div className="lg:col-span-2 space-y-5">
          <form onSubmit={handleSaveAssessment} className="space-y-5">
            {/* Pemilihan Kru */}
            <div className="card-enterprise !p-4 bg-white border border-[#E5E0D8] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <User size={15} className="text-[#96171B]" />
                  <span>Pilih Kru yang Diaudit</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {kruList.length} Kru Aktif Tersedia
                </span>
              </div>

              <select
                value={selectedKruId}
                onChange={(e) => setSelectedKruId(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:border-[#96171B] outline-hidden cursor-pointer"
              >
                {kruList.map((kru) => (
                  <option key={kru.id} value={kru.id}>
                    {kru.nama_kru} — Divisi {kru.divisi} ({kru.kode_outlet})
                  </option>
                ))}
              </select>

              {currentKru && (
                <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span>Nama: <strong className="text-slate-900">{currentKru.nama_kru}</strong></span>
                  <span>·</span>
                  <span>Divisi: <strong className="text-slate-900">{currentKru.divisi}</strong></span>
                  <span>·</span>
                  <span>Outlet: <strong className="text-slate-900">{currentKru.kode_outlet}</strong></span>
                </div>
              )}
            </div>

            {/* Selector 4 Pilar H.A.R.A */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              {HARA_OBJECTIVE_PILLARS.map((p) => {
                const pScore =
                  p.key === 'H' ? objectiveScores.skor_h :
                  p.key === 'A1' ? objectiveScores.skor_a1 :
                  p.key === 'R' ? objectiveScores.skor_r : objectiveScores.skor_a2;
                const isSel = activePillarTab === p.key;

                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setActivePillarTab(p.key)}
                    className={`p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSel
                        ? 'bg-white text-slate-900 font-black shadow-xs border border-slate-200 ring-2 ring-[#96171B]/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#96171B]">
                        {p.key} - {p.title.split(' ')[0]}
                      </span>
                      <span className={`text-[11px] font-mono font-black ${pScore >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {pScore}%
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                      "{p.tagline}"
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Pillar Card & Interactive SOP Checklist */}
            <div className="card-enterprise !p-4 bg-white border border-[#E5E0D8] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#96171B] text-white flex items-center justify-center text-xs font-black font-mono">
                      {currentPillarDef.key}
                    </span>
                    <h4 className="font-black text-sm text-slate-900">{currentPillarDef.title}</h4>
                    <span className="text-[11px] font-bold text-[#96171B] italic">
                      "{currentPillarDef.tagline}"
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{currentPillarDef.description}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleSetAllPillarItems(currentPillarDef.key, true)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                  >
                    Centang Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllPillarItems(currentPillarDef.key, false)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Kosongkan
                  </button>
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5 pt-1">
                {pillarChecklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleHaraItem(item.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      item.terpenuhi
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.terpenuhi}
                      onChange={() => {}} // Handled by container
                      className="mt-0.5 w-4 h-4 rounded text-[#96171B] focus:ring-[#96171B] cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-black px-1.5 py-0.5 rounded bg-white text-[#96171B] border border-red-200 shadow-2xs">
                          {item.kode_sop}
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {item.kriteria}
                        </span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 flex items-center gap-1 font-medium">
                        <Search size={11} className="text-slate-400" />
                        <span>Metode Verifikasi: {item.metode_verifikasi}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Bukti Audit, Catatan Faktual, & Rekomendasi Coaching */}
            <div className="card-enterprise !p-4 bg-white border border-[#E5E0D8] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Bukti Verifikasi Fisik / Nomor Form Audit:
                  </label>
                  <input
                    type="text"
                    required
                    value={buktiAudit}
                    onChange={(e) => setBuktiAudit(e.target.value)}
                    placeholder="Contoh: Form Audit Shift Pagi No. AUD-2026/08"
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:border-[#96171B] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Rekomendasi Bimbingan & Coaching Tindak Lanjut:
                  </label>
                  <input
                    type="text"
                    value={rekomendasiCoaching}
                    onChange={(e) => setRekomendasiCoaching(e.target.value)}
                    placeholder="Contoh: Refreshment SOP sanitasi tangan berkala..."
                    className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:border-[#96171B] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Catatan Observasi Perilaku Faktual Lapangan:
                </label>
                <textarea
                  rows={2}
                  value={catatanPerilaku}
                  onChange={(e) => setCatatanPerilaku(e.target.value)}
                  placeholder="Catat fakta konkret yang teramati di lapangan selama shift (misal: patuh APD, antusias di rush hour)..."
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:bg-white focus:border-[#96171B] outline-hidden"
                />
              </div>
            </div>

            {/* Tombol Simpan Audit Objektif */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !currentKru}
                className="btn-primary-enterprise !py-2.5 !px-5 text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save size={15} />
                <span>Simpan Hasil Audit Objektif Budaya H.A.R.A</span>
              </button>
            </div>
          </form>
        </div>

        {/* Kolom 3: Live Summary Ceklis & Riwayat Audit */}
        <div className="space-y-5">
          {/* Card Live Calculation */}
          <div className="card-enterprise !p-5 bg-gradient-to-br from-slate-900 to-[#1E2530] text-white border-0 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  Skor Objektif Terverifikasi
                </span>
                <h4 className="font-black text-sm text-white">
                  Audit Budaya H.A.R.A
                </h4>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {objectiveScores.skor_rata_rata}
                </span>
                <span className="text-xs text-white/60 font-mono"> / 100</span>
              </div>
            </div>

            {/* Kepatuhan Butir SOP */}
            <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between text-xs">
              <span className="text-white/80">Kepatuhan Butir Ceklis:</span>
              <span className="font-mono font-black text-emerald-400">
                {objectiveScores.fulfilledCount} dari {objectiveScores.totalItems} Butir SOP
              </span>
            </div>

            {/* Breakdown per Pilar */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-white/80">H - Halal & Higienis:</span>
                <span className="font-mono font-bold text-white">{objectiveScores.skor_h}%</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-white/80">A1 - Amanah & Integritas:</span>
                <span className="font-mono font-bold text-white">{objectiveScores.skor_a1}%</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-white/80">R - Responsif & Sigap:</span>
                <span className="font-mono font-bold text-white">{objectiveScores.skor_r}%</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-white/80">A2 - Adaptif & Belajar:</span>
                <span className="font-mono font-bold text-white">{objectiveScores.skor_a2}%</span>
              </div>
            </div>

            <div className="p-3 bg-white/10 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80 font-medium">Kontribusi ke Nilai Akhir:</span>
                <span className="font-bold font-mono text-emerald-400">
                  +{bobotKontribusi} / 25 Poin
                </span>
              </div>
              <p className="text-[10px] text-white/60 leading-relaxed">
                Formula Baku: Teori (20%) + Praktik (40%) + Lisan (15%) + Sikap HARA (25%) = 100%
              </p>
            </div>
          </div>

          {/* Riwayat Audit Sikap HARA */}
          <div className="card-enterprise !p-4 bg-white border border-[#E5E0D8] space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock size={14} className="text-[#96171B]" />
                <span>Riwayat Audit Kepatuhan ({history.length})</span>
              </h4>
              <button
                onClick={loadData}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title="Muat ulang riwayat"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Belum ada catatan audit sikap objektif untuk cabang ini.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {history.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{item.nama_kru}</span>
                      <span className="font-mono font-black text-[#96171B]">
                        {item.skor_rata_rata}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10.5px] text-slate-500 font-mono">
                      <span>H:{item.skor_h_higienis}%</span>
                      <span>·</span>
                      <span>A1:{item.skor_a_amanah}%</span>
                      <span>·</span>
                      <span>R:{item.skor_a_antusias}%</span>
                      <span>·</span>
                      <span>A2:{item.skor_r_resik}%</span>
                    </div>

                    {item.bukti_audit && (
                      <p className="text-[10.5px] text-slate-500 font-medium">
                        Ref: {item.bukti_audit}
                      </p>
                    )}

                    {item.catatan_perilaku && (
                      <p className="text-[11px] text-slate-600 italic line-clamp-2">
                        "{item.catatan_perilaku}"
                      </p>
                    )}

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span>{new Date(item.tanggal).toLocaleDateString('id-ID')}</span>
                      <span>Auditor: {item.evaluator_nama}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
