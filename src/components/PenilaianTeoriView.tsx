import React, { useState, useEffect } from 'react';
import {
  Brain, Award, CheckCircle, XCircle, AlertCircle,
  HelpCircle, RefreshCw, Save, ChevronRight, BookOpen,
  Star, AlertTriangle
} from 'lucide-react';
import { db } from '../lib/storage';
import { Kru, BankSoal, PenilaianTeori } from '../types';
import { ModernOptionSelector } from './ModernOptionSelector';

export const PenilaianTeoriView: React.FC<{ selectedOutletCode: string }> = ({ selectedOutletCode }) => {
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [soalList, setSoalList] = useState<BankSoal[]>([]);
  const [history, setHistory] = useState<PenilaianTeori[]>([]);

  const [selectedKru, setSelectedKru] = useState('');
  const [selectedTopik, setSelectedTopik] = useState('ALL');
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; correct: number; total: number } | null>(null);
  const [catatan, setCatatan] = useState('');

  const loadData = () => {
    setKruList(db.getTable<Kru>('kru').filter((k) => k.status_aktif === 'Aktif'));
    setSoalList(db.getTable<BankSoal>('bank_soal').filter((s) => s.status_aktif === 'Aktif'));
    setHistory(db.getTable<PenilaianTeori>('penilaian_teori'));
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, []);

  const activeKruList = selectedOutletCode === 'ALL'
    ? kruList
    : kruList.filter((k) => k.kode_outlet === selectedOutletCode);

  const topics = Array.from(new Set(soalList.map((s) => s.topik)));

  const filteredSoal = soalList.filter((s) => {
    if (selectedTopik !== 'ALL' && s.topik !== selectedTopik) return false;
    return true;
  });

  const handleSelectOption = (soalId: string, opt: 'A' | 'B' | 'C' | 'D') => {
    if (submitted) return;
    setAnswers({ ...answers, [soalId]: opt });
  };

  const calculateAndSubmit = () => {
    if (!selectedKru) {
      alert('Pilih nama kru yang diuji terlebih dahulu!');
      return;
    }
    if (filteredSoal.length === 0) {
      alert('Tidak ada soal pada topik yang dipilih.');
      return;
    }

    let correctCount = 0;
    filteredSoal.forEach((s) => {
      if (answers[s.id] === s.jawaban_benar) {
        correctCount += 1;
      }
    });

    const finalScore = Math.round((correctCount / filteredSoal.length) * 100);
    setScoreResult({
      score: finalScore,
      correct: correctCount,
      total: filteredSoal.length,
    });
    setSubmitted(true);

    // Save to storage
    db.insertRow<PenilaianTeori>('penilaian_teori', {
      tanggal: new Date().toISOString(),
      nama_kru: selectedKru,
      topik: selectedTopik === 'ALL' ? 'Standar Umum & SOP' : selectedTopik,
      jumlah_benar: correctCount,
      total_soal: filteredSoal.length,
      skor: finalScore,
      catatan: catatan || `Ujian teori diselesaikan dengan skor ${finalScore}/100`,
    });
  };

  const resetExam = () => {
    setAnswers({});
    setSubmitted(false);
    setScoreResult(null);
    setCatatan('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-banner-dark !p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-[#D9A027] text-[10.5px] font-bold mb-2">
              <Brain size={13} />
              <span>Simulasi Uji Pemahaman Teori & SOP</span>
            </div>
            <h2 className="text-lg md:text-xl font-black text-white">Uji Teori Standar Operasional</h2>
            <p className="text-[11px] text-slate-300">
              Evaluasi kognitif pemahaman standar HACCP, gramasi bumbu, suhu fryer, dan 5S hospitality.
            </p>
          </div>

          <button
            onClick={resetExam}
            className="btn-secondary-enterprise !py-1.5 !px-3 text-xs bg-white/10 text-white border-white/20 hover:bg-white/20 self-start md:self-auto"
          >
            <RefreshCw size={13} />
            <span>Mulai Ujian Baru</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Exam Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-enterprise space-y-4">
            <h3 className="font-extrabold text-sm text-[#1F1813] flex items-center gap-2">
              <BookOpen size={16} className="text-[#C0392B]" />
              <span>Form Pengujian Kru</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <ModernOptionSelector
                  label="Pilih Kru Yang Diuji"
                  required
                  disabled={submitted}
                  value={selectedKru}
                  onChange={(val) => setSelectedKru(val)}
                  options={activeKruList.map((k) => ({
                    value: k.nama_kru,
                    label: k.nama_kru,
                    badge: k.divisi,
                    sublabel: `Outlet ${k.kode_outlet}`,
                  }))}
                  placeholder="-- Pilih Kru Terdaftar --"
                  searchable
                />
              </div>

              <div>
                <ModernOptionSelector
                  label="Pilih Topik Soal"
                  disabled={submitted}
                  value={selectedTopik}
                  onChange={(val) => setSelectedTopik(val)}
                  options={[
                    { value: 'ALL', label: `Semua Topik (${soalList.length} Soal)` },
                    ...topics.map((t) => ({ value: t, label: t })),
                  ]}
                  placeholder="-- Pilih Topik Ujian --"
                  searchable
                />
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4 pt-2">
              {!filteredSoal.length ? (
                <div className="p-8 text-center text-xs text-gray-400 border border-dashed rounded-2xl">
                  Belum ada soal pada topik ini. Tambahkan di menu Bank Soal.
                </div>
              ) : (
                filteredSoal.map((soal, idx) => {
                  const userAns = answers[soal.id];
                  const isCorrect = userAns === soal.jawaban_benar;
                  return (
                    <div
                      key={soal.id}
                      className={`p-4 rounded-2xl border transition-colors ${
                        submitted
                          ? isCorrect
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-rose-50/70 border-rose-300'
                          : 'bg-[#FCFAF7] border-[#E8DFD3]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-200">
                            {soal.kode_sop || 'HC-SOP-STD'}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {soal.referensi_sop || soal.topik}
                          </span>
                        </div>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border font-bold text-gray-500 shrink-0">
                          Bobot {soal.bobot} Poin
                        </span>
                      </div>

                      <div className="font-extrabold text-xs text-[#1F1813] mb-3">
                        {idx + 1}. {soal.pertanyaan}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 text-xs">
                        {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                          const text =
                            opt === 'A'
                              ? soal.opsi_a
                              : opt === 'B'
                              ? soal.opsi_b
                              : opt === 'C'
                              ? soal.opsi_c
                              : soal.opsi_d;
                          const isSelected = userAns === opt;
                          const isKey = soal.jawaban_benar === opt;

                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectOption(soal.id, opt)}
                              disabled={submitted}
                              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                                isSelected
                                    ? 'bg-[#C0392B] text-white border-[#C0392B] font-bold shadow-xs'
                                    : 'bg-white hover:bg-gray-50 border-[#E8DFD3] text-gray-700'
                              } ${
                                submitted && isKey
                                  ? '!bg-emerald-600 !text-white !border-emerald-600 font-bold'
                                  : ''
                              }`}
                            >
                              <span className="w-5 h-5 rounded-md bg-black/10 flex items-center justify-center font-extrabold shrink-0 text-[11px]">
                                {opt}
                              </span>
                              <span className="text-[11px] leading-tight">{text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {submitted && (
                        <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2">
                          <div className="text-[11px] font-bold flex items-center gap-1.5">
                            {isCorrect ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <CheckCircle size={14} /> Jawaban Benar (Kunci: {soal.jawaban_benar})
                              </span>
                            ) : (
                              <span className="text-rose-700 flex items-center gap-1">
                                <XCircle size={14} /> Jawaban Kurang Tepat. Kunci Resmi: {soal.jawaban_benar}
                              </span>
                            )}
                          </div>
                          {soal.pembahasan && (
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700 space-y-1">
                              <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[10.5px]">
                                <BookOpen size={13} className="text-[#96171B]" />
                                <span>Pembahasan SOP ({soal.kode_sop || 'Baku HARA'}):</span>
                              </span>
                              <p className="text-slate-600 leading-relaxed">
                                {soal.pembahasan}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Submit Action */}
            {!submitted && (
              <div className="pt-3 border-t border-[#E8DFD3] flex justify-end">
                <button
                  onClick={calculateAndSubmit}
                  className="btn-primary-enterprise !py-2.5 !px-6"
                >
                  <Award size={16} />
                  <span>Selesaikan & Nilai Ujian</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Score & History */}
        <div className="space-y-4">
          {scoreResult && (
            <div className="card-enterprise bg-gradient-to-b from-[#FFFDF9] to-[#F7EFE5] border-2 border-[#C0392B] text-center space-y-3 animate-in zoom-in-95">
              <div className="w-12 h-12 bg-[#C0392B] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                <Award size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#1F1813]">Hasil Ujian Teori</h4>
                <div className="text-4xl font-black text-[#C0392B] my-1">
                  {scoreResult.score}
                  <span className="text-xs text-gray-500 font-bold">/100</span>
                </div>
                <div className="text-xs text-gray-600 font-semibold">
                  Benar {scoreResult.correct} dari {scoreResult.total} Soal
                </div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E8DFD3] text-xs space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span>Ambang Batas SOP:</span>
                  <span className="font-mono text-slate-800">75 Poin (Passing Grade)</span>
                </div>
                {scoreResult.score >= 75 ? (
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center justify-center gap-1.5">
                    <Award size={15} className="text-emerald-600" />
                    <span>STATUS: LULUS UJIAN TEORI SOP</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-red-50 text-red-800 border border-red-200 font-bold flex items-center justify-center gap-1.5">
                    <AlertTriangle size={15} className="text-red-600" />
                    <span>STATUS: REMEDIAL KOGNITIF (&lt;75)</span>
                  </div>
                )}
                <p className="text-[10px] text-slate-500 text-left pt-1 border-t border-slate-100">
                  Nilai ujian teori ini otomatis terintegrasi ke dalam <strong>Komponen Teori (Bobot 20%)</strong> pada Dashboard Monitoring Kru Training & Rapor Kompetensi.
                </p>
              </div>
            </div>
          )}

          {/* Historical Test Logs */}
          <div className="card-enterprise space-y-3">
            <h3 className="font-extrabold text-sm text-[#1F1813] flex items-center justify-between">
              <span>Riwayat Ujian Teori</span>
              <span className="text-xs text-gray-400 font-normal">{history.length} Sesi</span>
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {!history.length ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  Belum ada riwayat ujian teori.
                </div>
              ) : (
                history.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 bg-[#FCFAF7] border border-[#E8DFD3] rounded-xl text-xs space-y-1"
                  >
                    <div className="flex justify-between font-bold text-[#1F1813]">
                      <span>{h.nama_kru}</span>
                      <span className="text-[#C0392B] font-extrabold text-sm">{h.skor} Poin</span>
                    </div>
                    <div className="text-gray-500 text-[11px]">{h.topik}</div>
                    <div className="text-[10px] text-gray-400">
                      {new Date(h.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
