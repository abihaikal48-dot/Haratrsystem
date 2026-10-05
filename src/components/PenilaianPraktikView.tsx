import React, { useState, useEffect, useRef } from 'react';
import {
  Wrench, CheckCircle2, Award, RefreshCw, FileText, ChevronRight,
  Star, AlertTriangle, Play, Pause, RotateCcw, Clock, Thermometer,
  Scale, ShieldAlert, Sparkles, Check, X, Flame, ArrowUpRight
} from 'lucide-react';
import { db } from '../lib/storage';
import { Kru, BankSOP, PenilaianPraktik } from '../types';

export const PenilaianPraktikView: React.FC<{ selectedOutletCode: string }> = ({ selectedOutletCode }) => {
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [sopList, setSopList] = useState<BankSOP[]>([]);
  const [history, setHistory] = useState<PenilaianPraktik[]>([]);

  const [selectedKru, setSelectedKru] = useState('');
  const [selectedSopId, setSelectedSopId] = useState('');
  const [stepScores, setStepScores] = useState<Record<number, number>>({});
  const [catatan, setCatatan] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [lastFinalScore, setLastFinalScore] = useState<number | null>(null);

  // Quantitative Instruments: SOS Stopwatch
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const timerRef = useRef<any>(null);

  // Quantitative Instruments: Physical Measurements
  const [actualTemp, setActualTemp] = useState<number>(160);
  const [actualGrams, setActualGrams] = useState<number>(120);

  const loadData = () => {
    setKruList(db.getTable<Kru>('kru').filter((k) => k.status_aktif === 'Aktif'));
    setSopList(db.getTable<BankSOP>('bank_sop').filter((s) => s.status_aktif === 'Aktif'));
    setHistory(db.getTable<PenilaianPraktik>('penilaian_praktik'));
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, []);

  // Stopwatch interval timer
  useEffect(() => {
    if (stopwatchRunning) {
      timerRef.current = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopwatchRunning]);

  const activeKruList = selectedOutletCode === 'ALL'
    ? kruList
    : kruList.filter((k) => k.kode_outlet === selectedOutletCode);

  const currentSop = sopList.find((s) => s.id === selectedSopId) || sopList[0];

  useEffect(() => {
    if (sopList.length > 0 && !selectedSopId) {
      setSelectedSopId(sopList[0].id);
    }
  }, [sopList, selectedSopId]);

  // Derive target seconds from SOP standar_waktu or default
  const getTargetSeconds = (sop?: BankSOP): number => {
    if (!sop) return 180;
    const str = (sop.standar_waktu || '').toLowerCase();
    if (str.includes('12 menit') || str.includes('720')) return 720;
    if (str.includes('5 menit') || str.includes('300')) return 300;
    if (str.includes('3 menit') || str.includes('180')) return 180;
    if (str.includes('60 detik') || str.includes('1 menit')) return 60;
    if (str.includes('45 detik')) return 45;
    return 180;
  };

  const targetSeconds = getTargetSeconds(currentSop);

  // Speed-of-Service Pace status
  const getPaceStatus = () => {
    if (stopwatchSeconds === 0) return { label: 'Siap Dimulai', color: 'text-slate-400 bg-slate-100' };
    const diff = stopwatchSeconds - targetSeconds;
    if (diff <= 0) return { label: `Sangat Cepat (${Math.abs(diff)}s di bawah target)`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (diff <= 30) return { label: `Mendekati Batas (+${diff}s)`, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: `Overtime / Lambat (+${diff}s)`, color: 'text-red-700 bg-red-50 border-red-200' };
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const setScore = (stepIdx: number, val: number) => {
    if (submitted) return;
    setStepScores({ ...stepScores, [stepIdx]: val });
  };

  const calculateAndSave = () => {
    if (!selectedKru) {
      alert('Silakan pilih kru yang sedang diuji praktik!');
      return;
    }
    if (!currentSop || !currentSop.langkah.length) {
      alert('Pilih SOP dengan langkah operasional yang valid.');
      return;
    }

    const steps = currentSop.langkah;
    const scoresArray: number[] = [];
    let totalScoreObtained = 0;
    const maxScorePossible = steps.length * 3;

    for (let i = 0; i < steps.length; i++) {
      const s = stepScores[i] || 2;
      scoresArray.push(s);
      totalScoreObtained += s;
    }

    // Base rubric percentage (0 - 100)
    let finalPercent = Math.round((totalScoreObtained / maxScorePossible) * 100);

    // Data Science Quantitative Adjustments:
    // 1. SOS Time Penalty/Bonus:
    if (stopwatchSeconds > 0) {
      if (stopwatchSeconds > targetSeconds + 60) {
        finalPercent = Math.max(0, finalPercent - 10); // Overtime penalty
      } else if (stopwatchSeconds <= targetSeconds && stopwatchSeconds >= targetSeconds * 0.7) {
        finalPercent = Math.min(100, finalPercent + 3); // Precision efficiency bonus
      }
    }

    // 2. Deep Fryer Temperature Penalty:
    if (currentSop.judul_sop.toLowerCase().includes('ayam') || currentSop.judul_sop.toLowerCase().includes('goreng')) {
      if (actualTemp < 150 || actualTemp > 175) {
        finalPercent = Math.max(0, finalPercent - 10); // HACCP critical violation
      }
    }

    setLastFinalScore(finalPercent);
    setSubmitted(true);
    setStopwatchRunning(false);

    db.insertRow<PenilaianPraktik>('penilaian_praktik', {
      tanggal: new Date().toISOString(),
      nama_kru: selectedKru,
      sop_terkait: currentSop.judul_sop,
      detail_skor_langkah: scoresArray,
      waktu_detik: stopwatchSeconds || targetSeconds,
      target_detik: targetSeconds,
      suhu_minyak: actualTemp,
      gramatur: actualGrams,
      skor_akhir: finalPercent,
      catatan: catatan || `Uji Praktik SOS: Waktu ${formatTime(stopwatchSeconds || targetSeconds)} (Target ${formatTime(targetSeconds)}), Suhu ${actualTemp}°C. Skor: ${finalPercent}/100`,
    });
  };

  const resetForm = () => {
    setStepScores({});
    setSubmitted(false);
    setLastFinalScore(null);
    setCatatan('');
    setStopwatchSeconds(0);
    setStopwatchRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-stone-900 to-slate-950 text-white rounded-3xl shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider">
              <Wrench size={12} />
              <span>PILAR 2: PENILAIAN PRAKTIK SOS (BOBOT 35%)</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              Konsol Praktikum Speed-of-Service & Gramatur
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Uji ketangkasan teknis langsung di stasiun kerja dengan instrumen kuantitatif presisi: Stopwatch SOS, Pengukuran Suhu Minyak, dan Rubrik 3-Level Standar Industri.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={resetForm}
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
            1. Pilih Kru yang Sedang Diuji Praktik:
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
            2. Pilih SOP Stasiun Operasional:
          </label>
          <select
            value={selectedSopId}
            onChange={(e) => {
              setSelectedSopId(e.target.value);
              setStepScores({});
              setSubmitted(false);
              setStopwatchSeconds(0);
              setStopwatchRunning(false);
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

      {/* Quantitative Instrument Bar (Stopwatch & Physics) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stopwatch Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#96171B]" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Stopwatch Speed of Service (SOS)
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPaceStatus().color}`}>
              {getPaceStatus().label}
            </span>
          </div>

          <div className="text-center py-2">
            <div className="text-4xl sm:text-5xl font-mono font-black text-slate-900 tracking-tight">
              {formatTime(stopwatchSeconds)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Target Standar SOP: <strong className="text-slate-800">{formatTime(targetSeconds)}</strong> ({targetSeconds} detik)
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {!stopwatchRunning ? (
              <button
                type="button"
                onClick={() => setStopwatchRunning(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Play size={13} />
                <span>{stopwatchSeconds === 0 ? 'Mulai Stopwatch' : 'Lanjutkan'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStopwatchRunning(false)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Pause size={13} />
                <span>Jeda / Pause</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setStopwatchRunning(false);
                setStopwatchSeconds(0);
              }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-all cursor-pointer"
              title="Reset Waktu"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Temperature Station */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Thermometer size={16} className="text-amber-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pengukuran Suhu (°C)
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Target 160°C ± 5°C
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Suhu Deep Fryer:</span>
              <strong className={`text-sm font-mono font-bold ${
                actualTemp >= 155 && actualTemp <= 165
                  ? 'text-emerald-700'
                  : actualTemp < 150 || actualTemp > 175
                  ? 'text-red-700'
                  : 'text-amber-700'
              }`}>
                {actualTemp}°C
              </strong>
            </div>
            <input
              type="range"
              min={130}
              max={190}
              value={actualTemp}
              onChange={(e) => setActualTemp(Number(e.target.value))}
              className="w-full accent-[#96171B] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>130°C (Dingin)</span>
              <span className="font-bold text-emerald-700">160°C (Baku)</span>
              <span>190°C (Gosong)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            Suhu di bawah 150°C menyebabkan ayam menyerap minyak berlebih. Di atas 175°C menyebabkan krispi luar gosong namun daging mentah.
          </p>
        </div>

        {/* Gram Scale Station */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Scale size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Akurasi Timbangan Gramasi
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Toleransi ±5g
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">Gramatur Porsi / Bumbu:</span>
              <strong className="text-sm font-mono font-bold text-slate-900">
                {actualGrams} gram
              </strong>
            </div>
            <input
              type="number"
              value={actualGrams}
              onChange={(e) => setActualGrams(Number(e.target.value))}
              placeholder="120"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            Penyimpangan takaran di atas 10% langsung berdampak pada rasio *Cost of Goods Sold (COGS)* dan konsistensi rasa di mata konsumen.
          </p>
        </div>
      </div>

      {/* Operational Step-by-Step Scoring Rubric */}
      {currentSop && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10.5px] font-bold text-[#96171B] uppercase tracking-wider">
                LEMBAR EVALUASI OBSERVASI PRAKTIK
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                {currentSop.kode_sop} — {currentSop.judul_sop}
              </h3>
              <p className="text-xs text-slate-500">
                Beri skor objektif (1 = Belum Standar, 2 = Sesuai SOP, 3 = Sempurna & Efisien) pada setiap langkah.
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              Total: {currentSop.langkah.length} Langkah Teknis
            </div>
          </div>

          <div className="space-y-3">
            {currentSop.langkah.map((step, idx) => {
              const currentScore = stepScores[idx] || 2;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    </div>

                    {/* 3-Level Rubric Selector */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {[
                        { val: 1, label: '1 - Kurang', color: 'hover:bg-red-100 border-red-200 text-red-700', active: 'bg-red-600 text-white' },
                        { val: 2, label: '2 - Sesuai', color: 'hover:bg-blue-100 border-blue-200 text-blue-700', active: 'bg-blue-600 text-white' },
                        { val: 3, label: '3 - Sempurna', color: 'hover:bg-emerald-100 border-emerald-200 text-emerald-700', active: 'bg-emerald-600 text-white' },
                      ].map((btn) => (
                        <button
                          key={btn.val}
                          type="button"
                          disabled={submitted}
                          onClick={() => setScore(idx, btn.val)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            currentScore === btn.val ? btn.active : 'bg-white text-slate-600 ' + btn.color
                          }`}
                        >
                          {btn.val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes & Submission Area */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">
              Catatan Trainer / Rekomendasi Perbaikan Khusus:
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              disabled={submitted}
              rows={2}
              placeholder="Contoh: Gerakan penepungan sangat lincah, namun timer deep fryer terlambat ditekan 10 detik..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
            />
          </div>

          {submitted && lastFinalScore !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  {lastFinalScore}
                </div>
                <div>
                  <strong className="text-xs font-black text-emerald-900 block">
                    Penilaian Praktik Berhasil Disimpan ke Rekam Medis Kru!
                  </strong>
                  <span className="text-[11px] text-emerald-700">
                    Skor: {lastFinalScore}/100 • Predikat: {lastFinalScore >= 85 ? 'Mahir (Sangat Baik)' : lastFinalScore >= 65 ? 'Terampil (Lulus)' : 'Perlu Remedial'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
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
              <span>Kalkulasi Skor Objektif & Simpan ke Rekam Kru</span>
              <ArrowUpRight size={15} />
            </button>
          )}
        </div>
      )}

      {/* Recent History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-[#96171B]" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Riwayat Evaluasi Praktik Terakhir
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
                <th className="py-2.5 px-3">Waktu SOS</th>
                <th className="py-2.5 px-3">Suhu Minyak</th>
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
                    {item.waktu_detik ? `${item.waktu_detik}s` : '-'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {item.suhu_minyak ? `${item.suhu_minyak}°C` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      item.skor_akhir >= 85
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.skor_akhir >= 65
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.skor_akhir}/100
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Belum ada riwayat uji praktik yang tercatat.
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
