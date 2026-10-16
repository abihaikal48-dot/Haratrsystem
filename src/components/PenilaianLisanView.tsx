import React, { useState, useEffect } from 'react';
import {
  Mic, CheckCircle2, Award, RefreshCw, FileText, Check, X,
  Star, AlertTriangle, ShieldCheck, HelpCircle, ArrowUpRight,
  BookOpen, Brain, Sparkles, Layers
} from 'lucide-react';
import { db } from '../lib/storage';
import { Kru, BankSOP, PenilaianLisan } from '../types';

export const PenilaianLisanView: React.FC<{ selectedOutletCode: string }> = ({ selectedOutletCode }) => {
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [sopList, setSopList] = useState<BankSOP[]>([]);
  const [history, setHistory] = useState<PenilaianLisan[]>([]);

  const [selectedKru, setSelectedKru] = useState('');
  const [selectedSopId, setSelectedSopId] = useState('');
  
  // 3-Dimension evaluation per step: [recallsStep, understandsWhy, knowsCorrectiveAction]
  const [stepDimensionScores, setStepDimensionScores] = useState<Record<number, {
    recall: boolean;
    whyReason: boolean;
    corrective: boolean;
  }>>({});

  const [catatan, setCatatan] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const loadData = () => {
    setKruList(db.getTable<Kru>('kru').filter((k) => k.status_aktif === 'Aktif'));
    setSopList(db.getTable<BankSOP>('bank_sop').filter((s) => s.status_aktif === 'Aktif'));
    setHistory(db.getTable<PenilaianLisan>('penilaian_lisan'));
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, []);

  const activeKruList = selectedOutletCode === 'ALL'
    ? kruList
    : kruList.filter((k) => k.kode_outlet === selectedOutletCode);

  const currentSop = sopList.find((s) => s.id === selectedSopId) || sopList[0];

  useEffect(() => {
    if (sopList.length > 0 && !selectedSopId) {
      setSelectedSopId(sopList[0].id);
    }
  }, [sopList, selectedSopId]);

  const toggleDimension = (stepIdx: number, dimension: 'recall' | 'whyReason' | 'corrective') => {
    if (submitted) return;
    const current = stepDimensionScores[stepIdx] || { recall: false, whyReason: false, corrective: false };
    setStepDimensionScores({
      ...stepDimensionScores,
      [stepIdx]: {
        ...current,
        [dimension]: !current[dimension],
      },
    });
  };

  // Helper reasons why based on step
  const getStepRationale = (stepText: string): { why: string; hazard: string } => {
    const s = stepText.toLowerCase();
    if (s.includes('cuci tangan') || s.includes('hygiene') || s.includes('sabun')) {
      return {
        why: 'Membunuh bakteri patogen (E. coli, Salmonella) dan mencegah kontaminasi silang tangan ke makanan.',
        hazard: 'Titik Kritis Food Safety HACCP Level 1'
      };
    }
    if (s.includes('160') || s.includes('suhu') || s.includes('derajat')) {
      return {
        why: 'Suhu 160°C adalah titik gelatinisasi tepung optimal dan penetrasi panas sempurna ke tulang ayam.',
        hazard: 'Suhu <150°C ayam berminyak lembek; >175°C gosong luar mentah dalam'
      };
    }
    if (s.includes('tepung') || s.includes('cubit') || s.includes('remas') || s.includes('kibas')) {
      return {
        why: 'Teknik kibas memisahkan gumpalan basah berlebih sehingga terbentuk serat keriting renyah (*flaky*).',
        hazard: 'Tepung terlalu tebal membuat kulit bantat dan menyerap minyak'
      };
    }
    if (s.includes('takar') || s.includes('air') || s.includes('rasio') || s.includes('beras')) {
      return {
        why: 'Rasio air dan beras baku menjaga tekstur pulen konsisten di seluruh cabang tanpa keras atau lembek.',
        hazard: 'Tekstur nasi rusak merusak reputasi gerai'
      };
    }
    if (s.includes('kasir') || s.includes('pos') || s.includes('struk') || s.includes('senyum')) {
      return {
        why: 'Standar 5S dan cetak struk adalah bukti transaksi legal konsumen dan mencegah fraud internal.',
        hazard: 'Komplain konsumen dan potensi selisih uang kas register'
      };
    }
    return {
      why: 'Memastikan standar operasional baku QSR terjaga secara disiplin dan konsisten.',
      hazard: 'Deviasi rasa dan penurunan kualitas layanan'
    };
  };

  const calculateAndSave = () => {
    if (!selectedKru) {
      alert('Pilih nama kru yang sedang diuji lisan!');
      return;
    }
    if (!currentSop || !currentSop.langkah.length) return;

    const totalSteps = currentSop.langkah.length;
    let totalPoints = 0;
    const maxPoints = totalSteps * 3; // 3 dimensions per step

    for (let i = 0; i < totalSteps; i++) {
      const d = stepDimensionScores[i] || { recall: false, whyReason: false, corrective: false };
      if (d.recall) totalPoints += 1;
      if (d.whyReason) totalPoints += 1;
      if (d.corrective) totalPoints += 1;
    }

    const calculated = Math.round((totalPoints / maxPoints) * 100);
    setFinalScore(calculated);
    setSubmitted(true);

    const kruObj = kruList.find((k) => k.nama_kru === selectedKru);
    const resolvedOutletCode = kruObj?.kode_outlet || (selectedOutletCode !== 'ALL' ? selectedOutletCode : 'HC-JTS01');

    db.insertRow<PenilaianLisan>('penilaian_lisan', {
      tanggal: new Date().toISOString(),
      nama_kru: selectedKru,
      kru_id: kruObj?.id,
      kode_outlet: resolvedOutletCode,
      sop_terkait: currentSop.judul_sop,
      butir_benar: totalPoints,
      total_butir: maxPoints,
      skor: calculated,
      catatan: catatan || `Uji Lisan HACCP Reasoning: Skor ${calculated}/100 (${totalPoints}/${maxPoints} parameter terjawab).`,
    });

    if (calculated < 75) {
      db.triggerAutoRemedialAndTNA({
        kru_id: kruObj?.id,
        nama_kru: selectedKru,
        kode_outlet: resolvedOutletCode,
        divisi: (currentSop?.divisi as any) || 'Kitchen',
        skor: calculated,
        topikSalah: [currentSop.judul_sop],
        sumberTemuan: `Uji Lisan HACCP & Titik Kritis (${currentSop.kode_sop} - Skor ${calculated}/100)`,
        catatan: `Uji lisan di bawah KKM 75: ${catatan || 'Perlu pemahaman lebih dalam mengenai Why behind SOP'}`,
      });
    }
  };

  const reset = () => {
    setStepDimensionScores({});
    setSubmitted(false);
    setFinalScore(null);
    setCatatan('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-stone-900 via-zinc-900 to-stone-950 text-white rounded-3xl shadow-md border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider">
              <Mic size={12} />
              <span>PILAR 3: PENILAIAN LISAN & HACCP REASONING (BOBOT 20%)</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              Konsol Uji Pemahaman Poin Kritis & "Why Behind the SOP"
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Menilai apakah kru memahami alasan logis di balik setiap aturan standar operasional, bukan sekadar menghafal gerakan fisik mekanis.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={reset}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Reset Ujian</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trainee & SOP Selector Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            1. Pilih Kru yang Sedang Diuji Lisan:
          </label>
          <select
            value={selectedKru}
            onChange={(e) => setSelectedKru(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
          >
            <option value="">-- Pilih Kru Aktif --</option>
            {activeKruList.map((k) => (
              <option key={k.id} value={k.nama_kru}>
                {k.nama_kru} ({k.kode_outlet} • {k.divisi})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">
            2. Pilih SOP Materi Pertanyaan:
          </label>
          <select
            value={selectedSopId}
            onChange={(e) => {
              setSelectedSopId(e.target.value);
              setStepDimensionScores({});
              setSubmitted(false);
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
          >
            {sopList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.kode_sop} - {s.judul_sop} ({s.divisi})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3-Dimensional Oral Checklist */}
      {currentSop && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10.5px] font-bold text-[#96171B] uppercase tracking-wider">
                LEMBAR UJI TANYA JAWAB LISAN KRITIS
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                {currentSop.kode_sop} — {currentSop.judul_sop}
              </h3>
              <p className="text-xs text-slate-500">
                Tanyakan pertanyaan kepada kru dan centang 3 parameter: Hafal Prosedur, Paham Alasan (*Why*), dan Tindakan Korektif.
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              Total: {currentSop.langkah.length} Langkah Pertanyaan
            </div>
          </div>

          <div className="space-y-3.5">
            {currentSop.langkah.map((step, idx) => {
              const current = stepDimensionScores[idx] || { recall: false, whyReason: false, corrective: false };
              const rationale = getStepRationale(step);

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#96171B] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="space-y-1 flex-1">
                      <p className="text-xs font-bold text-slate-900 leading-relaxed">
                        {step}
                      </p>

                      {/* Rationale & Hazard callout */}
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <strong className="text-amber-800 font-bold">Alasan Baku ("Why"):</strong>
                          <span>{rationale.why}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <strong className="text-red-700 font-bold">Titik Bahaya HACCP:</strong>
                          <span>{rationale.hazard}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Verification Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-xs">
                    <button
                      type="button"
                      disabled={submitted}
                      onClick={() => toggleDimension(idx, 'recall')}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left cursor-pointer ${
                        current.recall
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                        current.recall ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                      }`}>
                        {current.recall && <Check size={12} />}
                      </div>
                      <span className="text-[11px]">1. Hafal Urutan Prosedur</span>
                    </button>

                    <button
                      type="button"
                      disabled={submitted}
                      onClick={() => toggleDimension(idx, 'whyReason')}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left cursor-pointer ${
                        current.whyReason
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                        current.whyReason ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                      }`}>
                        {current.whyReason && <Check size={12} />}
                      </div>
                      <span className="text-[11px]">2. Paham Alasan Ilmiah (*Why*)</span>
                    </button>

                    <button
                      type="button"
                      disabled={submitted}
                      onClick={() => toggleDimension(idx, 'corrective')}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left cursor-pointer ${
                        current.corrective
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                        current.corrective ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                      }`}>
                        {current.corrective && <Check size={12} />}
                      </div>
                      <span className="text-[11px]">3. Tahu Tindakan Korektif</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes Area */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">
              Catatan Penguji / Kelemahan Konseptual Kru:
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              disabled={submitted}
              rows={2}
              placeholder="Contoh: Kru memahami langkah penggorengan namun belum mampu menyebutkan batas suhu kritis minyak goreng..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
            />
          </div>

          {submitted && finalScore !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  {finalScore}
                </div>
                <div>
                  <strong className="text-xs font-black text-emerald-900 block">
                    Penilaian Lisan HACCP Berhasil Disimpan!
                  </strong>
                  <span className="text-[11px] text-emerald-700">
                    Skor: {finalScore}/100 • Predikat: {finalScore >= 85 ? 'Mahir (Pemahaman Sangat Kuat)' : finalScore >= 65 ? 'Terampil (Lulus)' : 'Perlu Pendalaman Teori'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={reset}
                className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all cursor-pointer"
              >
                Uji Kru Berikutnya
              </button>
            </div>
          )}

          {!submitted && (
            <button
              type="button"
              onClick={calculateAndSave}
              className="w-full py-3.5 bg-[#96171B] hover:bg-[#801216] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#96171B]/15 hover:shadow-lg transition-all active:scale-95"
            >
              <CheckCircle2 size={16} />
              <span>Kalkulasi Skor Lisan & Simpan Rekam Evaluasi</span>
              <ArrowUpRight size={15} />
            </button>
          )}
        </div>
      )}

      {/* Recent History */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-[#96171B]" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Riwayat Evaluasi Lisan Terakhir
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {history.length} Sesi Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Nama Kru</th>
                <th className="py-2.5 px-3">SOP Terkait</th>
                <th className="py-2.5 px-3">Parameter Terjawab</th>
                <th className="py-2.5 px-3 text-right">Skor Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {history.slice(0, 6).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-slate-500">
                    {new Date(item.tanggal).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.nama_kru}</td>
                  <td className="py-2.5 px-3">{item.sop_terkait}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {item.butir_benar} / {item.total_butir}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      item.skor >= 85
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.skor >= 65
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.skor}/100
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Belum ada riwayat uji lisan yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
