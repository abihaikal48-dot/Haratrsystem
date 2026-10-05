import React, { useState, useEffect } from 'react';
import {
  Brain, Award, CheckCircle, XCircle, AlertCircle,
  HelpCircle, RefreshCw, ChevronRight, BookOpen,
  Clock, Shield, ShieldCheck, ArrowLeft, Check, Sparkles, User, Store,
  Layers, Printer, Download, Share2, Filter, AlertTriangle,
  Flame, Award as AwardIcon, CheckCircle2, ChevronLeft,
  QrCode, Copy, Send, Star, Zap, ThumbsUp, Compass, Maximize, Minimize,
  Volume2, Search, Info, X, CheckSquare, BarChart3, GraduationCap
} from 'lucide-react';
import { db } from '../lib/storage';
import { Kru, BankSoal, PenilaianTeori, Outlet, BankSOP } from '../types';
import { HaraLogo } from './HaraLogo';
import { ModernOptionSelector } from './ModernOptionSelector';
import {
  ExamPortalHeroIllustration,
  ExamSuccessIllustration,
  SopKnowledgeIllustration,
  MentorshipIllustration
} from './TrainerIllustrations';

interface UjianKruPublicViewProps {
  onBackToHome?: () => void;
  onGoToAdminLogin?: () => void;
  initialOutlet?: string;
  initialNamaKru?: string;
  initialDivisi?: 'Semua' | 'Kitchen' | 'Helper' | 'Geprek' | 'Kasir';
  autoStart?: boolean;
}

export const UjianKruPublicView: React.FC<UjianKruPublicViewProps> = ({
  onBackToHome,
  onGoToAdminLogin,
  initialOutlet,
  initialNamaKru,
  initialDivisi,
  autoStart,
}) => {
  // Master data
  const [outlets, setOutlets] = useState<Outlet[]>(() => db.getTable<Outlet>('outlets'));
  const [kruList, setKruList] = useState<Kru[]>(() =>
    db.getTable<Kru>('kru').filter((k) => k.status_aktif === 'Aktif')
  );
  const [bankSoal, setBankSoal] = useState<BankSoal[]>(() =>
    db.getTable<BankSoal>('bank_soal').filter((s) => s.status_aktif === 'Aktif')
  );
  const [sopList, setSopList] = useState<BankSOP[]>(() =>
    db.getTable<BankSOP>('bank_sop')
  );
  const [recentExams, setRecentExams] = useState<PenilaianTeori[]>(() =>
    db.getTable<PenilaianTeori>('penilaian_teori').slice(0, 5)
  );

  // Setup Step State
  const [selectedOutlet, setSelectedOutlet] = useState<string>(() => {
    const outs = db.getTable<Outlet>('outlets');
    return outs.length > 0 ? outs[0].kode_outlet : '';
  });
  const [namaKru, setNamaKru] = useState<string>('');
  const [isManualName, setIsManualName] = useState<boolean>(false);
  const [selectedDivisi, setSelectedDivisi] = useState<'Semua' | 'Kitchen' | 'Helper' | 'Geprek' | 'Kasir'>('Semua');
  const [selectedTopik, setSelectedTopik] = useState<string>('ALL');
  const [soalLimit, setSoalLimit] = useState<number>(5);

  // Exam Stage: 'setup' | 'exam' | 'result'
  const [stage, setStage] = useState<'setup' | 'exam' | 'result'>('setup');

  // Active Exam State
  const [activeQuestions, setActiveQuestions] = useState<BankSoal[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes in seconds
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Audio & Kiosk UI States
  const [isKioskFullscreen, setIsKioskFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [sopStudyModalOpen, setSopStudyModalOpen] = useState<boolean>(false);
  const [sopSearchTerm, setSopSearchTerm] = useState<string>('');

  // Review Filter: 'ALL' | 'WRONG' | 'CORRECT'
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'WRONG' | 'CORRECT'>('ALL');
  const [copiedShare, setCopiedShare] = useState(false);

  // Result State
  const [scoreResult, setScoreResult] = useState<{
    score: number;
    correctCount: number;
    total: number;
    passed: boolean;
    badge: 'Mahir' | 'Terampil' | 'Pemula';
    date: string;
    examRecordId?: string;
  } | null>(null);

  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);

  // Web Audio feedback
  const playSound = (type: 'select' | 'pass' | 'fail' | 'nav') => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'select') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'nav') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } else if (type === 'pass') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'fail') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // Graceful fallback
    }
  };

  const toggleKioskFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsKioskFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsKioskFullscreen(false);
    }
  };

  // Directly start exam with specific parameters
  const executeStartExam = (
    targetOutlet: string,
    targetKru: string,
    targetDivisi: 'Semua' | 'Kitchen' | 'Helper' | 'Geprek' | 'Kasir'
  ) => {
    setSelectedOutlet(targetOutlet);
    setNamaKru(targetKru);
    setSelectedDivisi(targetDivisi);

    const allSoal = db.getTable<BankSoal>('bank_soal').filter((s) => s.status_aktif === 'Aktif');
    let pool = allSoal.filter((s) => {
      if (targetDivisi !== 'Semua' && s.divisi !== targetDivisi) return false;
      return true;
    });

    if (pool.length === 0) {
      pool = allSoal;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(soalLimit, shuffled.length));

    if (selected.length > 0) {
      setActiveQuestions(selected);
      setCurrentIndex(0);
      setAnswers({});
      setFlagged({});
      setTimeLeft(selected.length * 90);
      setStartTime(Date.now());
      setStage('exam');
    }
  };

  useEffect(() => {
    // Check if trainee came directly from login portal or direct exam trigger
    if (initialNamaKru && initialNamaKru.trim() !== '') {
      const targetOut = initialOutlet || (outlets.length > 0 ? outlets[0].kode_outlet : 'HC-JTS01');
      const targetDiv = initialDivisi || 'Semua';
      executeStartExam(targetOut, initialNamaKru, targetDiv);
      return;
    }

    const savedTrainee = sessionStorage.getItem('hara_active_exam_trainee');
    if (savedTrainee) {
      try {
        const parsed = JSON.parse(savedTrainee);
        if (parsed.nama_kru) {
          executeStartExam(
            parsed.kode_outlet || 'HC-JTS01',
            parsed.nama_kru,
            parsed.divisi || 'Semua'
          );
          sessionStorage.removeItem('hara_active_exam_trainee');
          return;
        }
      } catch (err) {
        // ignore
      }
    }

    const loadData = () => {
      const outs = db.getTable<Outlet>('outlets');
      const krus = db.getTable<Kru>('kru').filter((k) => k.status_aktif === 'Aktif');
      const soals = db.getTable<BankSoal>('bank_soal').filter((s) => s.status_aktif === 'Aktif');
      const exams = db.getTable<PenilaianTeori>('penilaian_teori');
      setOutlets(outs);
      setKruList(krus);
      setBankSoal(soals);
      setRecentExams(exams.slice(0, 5));
      setSelectedOutlet((prev) => prev || (outs.length > 0 ? outs[0].kode_outlet : ''));
    };

    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, [initialNamaKru, initialOutlet, initialDivisi]);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (stage === 'exam' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            finishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stage, timeLeft]);

  // Filtered crew by chosen outlet
  const filteredKru = selectedOutlet
    ? kruList.filter((k) => k.kode_outlet === selectedOutlet)
    : kruList;

  // Auto-fill division if registered crew is picked
  const handleSelectKru = (name: string) => {
    setNamaKru(name);
    const found = kruList.find((k) => k.nama_kru === name && (!selectedOutlet || k.kode_outlet === selectedOutlet));
    if (found && found.divisi) {
      setSelectedDivisi(found.divisi);
    }
  };

  // Available topics based on division
  const availableTopics = Array.from(
    new Set(
      bankSoal
        .filter((s) => selectedDivisi === 'Semua' || s.divisi === selectedDivisi)
        .map((s) => s.topik)
    )
  );

  // Start Exam from manual setup form
  const handleStartExam = () => {
    if (!namaKru.trim()) {
      alert('Silakan pilih atau ketik nama kru peserta ujian terlebih dahulu!');
      return;
    }
    if (!selectedOutlet) {
      alert('Silakan pilih cabang outlet penempatan Anda!');
      return;
    }

    executeStartExam(selectedOutlet, namaKru.trim(), selectedDivisi);
  };

  const handleSelectOption = (questionId: string, opt: 'A' | 'B' | 'C' | 'D') => {
    playSound('select');
    setAnswers((prev) => ({ ...prev, [questionId]: opt }));
  };

  const currentQ = activeQuestions[currentIndex];

  // Keyboard navigation for fast exam taking (A, B, C, D / 1, 2, 3, 4 / Arrows)
  useEffect(() => {
    if (stage !== 'exam' || !currentQ || confirmSubmitOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleSelectOption(currentQ.id, key as 'A' | 'B' | 'C' | 'D');
      } else if (key === '1') {
        handleSelectOption(currentQ.id, 'A');
      } else if (key === '2') {
        handleSelectOption(currentQ.id, 'B');
      } else if (key === '3') {
        handleSelectOption(currentQ.id, 'C');
      } else if (key === '4') {
        handleSelectOption(currentQ.id, 'D');
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        playSound('nav');
        setCurrentIndex((prev) => prev - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < activeQuestions.length - 1) {
        playSound('nav');
        setCurrentIndex((prev) => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, currentQ, currentIndex, activeQuestions.length, confirmSubmitOpen]);

  const toggleFlag = (questionId: string) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const finishExam = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    setElapsedSeconds(timeSpent);

    let correct = 0;
    activeQuestions.forEach((q) => {
      if (answers[q.id] === q.jawaban_benar) {
        correct += 1;
      }
    });

    const finalScore = Math.round((correct / activeQuestions.length) * 100);
    const passed = finalScore >= 75;

    let badge: 'Mahir' | 'Terampil' | 'Pemula' = 'Pemula';
    if (finalScore >= 90) badge = 'Mahir';
    else if (finalScore >= 75) badge = 'Terampil';

    if (passed) {
      playSound('pass');
    } else {
      playSound('fail');
    }

    const examRecordId = `TEORI-${Date.now().toString().slice(-6)}`;

    // Save record to central storage
    const newRecord: PenilaianTeori = {
      id: examRecordId,
      nama_kru: namaKru,
      topik: selectedTopik === 'ALL' ? 'Standar SOP Operasional' : selectedTopik,
      tanggal: new Date().toISOString(),
      skor: finalScore,
      total_soal: activeQuestions.length,
      jumlah_benar: correct,
      catatan: passed
        ? `Lulus Ujian Mandiri dengan predikat ${badge}. Pemahaman SOP F&B Terverifikasi.`
        : `Belum mencapai passing grade (75). Disarankan re-training pada materi terkait.`,
      created_at: new Date().toISOString(),
    };

    db.insertRow('penilaian_teori', newRecord);

    setScoreResult({
      score: finalScore,
      correctCount: correct,
      total: activeQuestions.length,
      passed,
      badge,
      date: new Date().toISOString(),
      examRecordId,
    });

    setConfirmSubmitOpen(false);
    setStage('result');
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = activeQuestions.length - answeredCount;

  // Share result to WhatsApp
  const handleShareToWA = () => {
    if (!scoreResult) return;
    const text =
      `*HASIL EVALUASI UJI STANDAR SOP HARA CHICKEN*%0A%0A` +
      `Peserta: *${namaKru}*%0A` +
      `Cabang Outlet: *${selectedOutlet}*%0A` +
      `Divisi: *${selectedDivisi}*%0A` +
      `Topik: *${selectedTopik}*%0A` +
      `Skor: *${scoreResult.score}/100* (${scoreResult.passed ? 'LULUS ✅' : 'RE-TRAINING ⚠️'})%0A` +
      `Predikat: *${scoreResult.badge}*%0A` +
      `ID Sertifikat: *${scoreResult.examRecordId}*%0A` +
      `Tanggal: ${new Date(scoreResult.date).toLocaleDateString('id-ID')}%0A%0A` +
      `_Sistem Terpadu Trainer Operasional & Sertifikasi Kru Hara Chicken_`;

    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] text-slate-900 flex flex-col font-sans selection:bg-[#96171B] selection:text-white">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 px-4 md:px-8 py-3 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <HaraLogo variant="full" size="md" />
            <div className="hidden sm:flex items-center gap-2 pl-3.5 border-l border-slate-200">
              <span className="bg-[#96171B]/10 text-[#96171B] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                Portal Mandiri Kru
              </span>
              <p className="text-xs text-slate-500 hidden md:block">
                Evaluasi SOP Standar Resep, Suhu Penggorengan & Sanitasi HACCP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick SOP Study Reference Button */}
            <button
              type="button"
              onClick={() => setSopStudyModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Buka Ringkasan & Cheat Sheet SOP Resmi"
            >
              <BookOpen size={14} className="text-amber-600 shrink-0" />
              <span className="hidden sm:inline">Cheat Sheet SOP</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                soundEnabled
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-slate-400 bg-slate-100 border-slate-200'
              }`}
              title={soundEnabled ? 'Suara Interaktif Aktif' : 'Suara Dimatikan'}
            >
              <Volume2 size={15} />
            </button>

            {/* Kiosk Fullscreen Mode */}
            <button
              type="button"
              onClick={toggleKioskFullscreen}
              className="p-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
              title={isKioskFullscreen ? 'Keluar Layar Penuh' : 'Mode Kios Layar Penuh'}
            >
              {isKioskFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
            </button>

            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span className="hidden md:inline">Beranda</span>
              </button>
            )}

            {onGoToAdminLogin && (
              <button
                type="button"
                onClick={onGoToAdminLogin}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#96171B] hover:bg-[#801216] text-white flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <Shield size={13} />
                <span>Login Trainer</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center">
        
        {/* ======================================================== */}
        {/* STAGE 1: SETUP / PENDAFTARAN PESERTA UJIAN */}
        {/* ======================================================== */}
        {stage === 'setup' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Minimalist Top Hero Banner */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-2xl text-left">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#96171B]/8 text-[#96171B] text-[11px] font-bold">
                    <Sparkles size={14} />
                    <span>PORTAL SERTIFIKASI & KOMPETENSI KRU RESMI</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    Uji Pemahaman SOP & Standar Kualifikasi Restoran
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Pilih cabang penempatan, divisi kerja, dan jawab evaluasi pilihan ganda secara mandiri.
                    Sertifikat Digital resmi langsung diterbitkan secara instan begitu Anda menyelesaikan ujian.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
                      <div className="text-sm font-bold text-emerald-600">≥ 75 Poin</div>
                      <div className="text-[10.5px] text-slate-500 font-medium">Passing Grade</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
                      <div className="text-sm font-bold text-amber-600">90 Detik / Soal</div>
                      <div className="text-[10.5px] text-slate-500 font-medium">Waktu Fleksibel</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
                      <div className="text-sm font-bold text-slate-900">3 Kategori</div>
                      <div className="text-[10.5px] text-slate-500 font-medium">Mahir / Terampil / Pemula</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
                      <div className="text-sm font-bold text-[#96171B]">Auto-Sync</div>
                      <div className="text-[10.5px] text-slate-500 font-medium">Ke Rapor Trainer</div>
                    </div>
                  </div>
                </div>

                {/* Symmetrical Vector Illustration */}
                <div className="shrink-0 flex items-center justify-center p-2">
                  <ExamPortalHeroIllustration size={280} />
                </div>
              </div>
            </div>

            {/* Symmetrical Setup Card */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Form: 8 Columns */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/80 space-y-6">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                      <User size={18} className="text-[#96171B]" />
                      <span>Form Identitas Kru & Pilihan Modul</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Lengkapi data identitas berikut sebelum menekan tombol Mulai Ujian.
                    </p>
                  </div>
                  <span className="text-xs bg-[#96171B]/8 text-[#96171B] font-bold px-3 py-1 rounded-full border border-[#96171B]/15 shrink-0">
                    {bankSoal.length} Soal Aktif
                  </span>
                </div>

                <div className="space-y-5">
                  {/* 1. Outlet Penempatan */}
                  <div className="space-y-1.5">
                    <ModernOptionSelector
                      label="1. Pilih Cabang Outlet Penempatan"
                      required
                      value={selectedOutlet}
                      onChange={(val) => {
                        setSelectedOutlet(val);
                        setNamaKru('');
                      }}
                      options={outlets.map((o) => ({
                        value: o.kode_outlet,
                        label: `${o.nama_outlet} (${o.kode_outlet})`,
                        badge: o.kode_outlet,
                        sublabel: o.alamat,
                      }))}
                      placeholder="-- Pilih Cabang Outlet --"
                      searchable
                    />
                    <p className="text-[11px] text-slate-400">Pilih cabang restoran tempat Anda bertugas saat ini.</p>
                  </div>

                  {/* 2. Nama Kru */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-800">
                        2. Nama Lengkap Kru Peserta *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualName(!isManualName);
                          setNamaKru('');
                        }}
                        className="text-[11px] text-[#96171B] hover:underline font-bold cursor-pointer"
                      >
                        {isManualName ? 'Pilih dari Database Kru' : 'Ketik Manual'}
                      </button>
                    </div>

                    {!isManualName ? (
                      <ModernOptionSelector
                        value={namaKru}
                        onChange={(val) => handleSelectKru(val)}
                        options={filteredKru.map((k) => ({
                          value: k.nama_kru,
                          label: k.nama_kru,
                          badge: k.divisi,
                          sublabel: `Divisi ${k.divisi} · Outlet ${k.kode_outlet}`,
                        }))}
                        placeholder="-- Cari / Pilih Nama Kru Terdaftar --"
                        searchable
                      />
                    ) : (
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#96171B] focus:ring-1 focus:ring-[#96171B] focus:outline-none text-xs font-medium text-slate-900 bg-white pl-9"
                          placeholder="Ketik nama lengkap Anda..."
                          value={namaKru}
                          onChange={(e) => setNamaKru(e.target.value)}
                        />
                        <User size={15} className="absolute left-3 top-3 text-slate-400" />
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400">Nama ini akan dicetak resmi pada E-Sertifikat Kelulusan.</p>
                  </div>

                  {/* 3. Divisi Kru */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      3. Divisi Kerja / Spesialisasi *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {(['Semua', 'Kitchen', 'Helper', 'Geprek', 'Kasir'] as const).map((div) => {
                        const isSel = selectedDivisi === div;
                        return (
                          <button
                            key={div}
                            type="button"
                            onClick={() => {
                              setSelectedDivisi(div);
                              setSelectedTopik('ALL');
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              isSel
                                ? 'bg-[#96171B] text-white border-[#96171B] shadow-xs'
                                : 'bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span>{div}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Topik & Jumlah Soal */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      4. Topik Ujian & Jumlah Soal
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ModernOptionSelector
                        value={selectedTopik}
                        onChange={(val) => setSelectedTopik(val)}
                        options={[
                          { value: 'ALL', label: 'Semua Topik Divisi Terkait' },
                          ...availableTopics.map((t) => ({ value: t, label: t })),
                        ]}
                        placeholder="Pilih Topik"
                        searchable
                      />

                      <ModernOptionSelector
                        value={String(soalLimit)}
                        onChange={(val) => setSoalLimit(Number(val))}
                        options={[
                          { value: '5', label: '5 Soal (Uji Cepat - 7.5 Menit)' },
                          { value: '10', label: '10 Soal (Standar - 15 Menit)' },
                          { value: '15', label: '15 Soal (Komprehensif - 22.5 Menit)' },
                          { value: '20', label: '20 Soal (Sertifikasi Lengkap)' },
                        ]}
                        placeholder="Jumlah Soal"
                        inlineChips={false}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Trigger */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                    <span>Hasil otomatis diverifikasi dan direkam ke Rapor Kru.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartExam}
                    className="w-full sm:w-auto px-6 py-3 bg-[#96171B] hover:bg-[#801216] text-white rounded-xl font-bold text-xs shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Brain size={16} />
                    <span>Mulai Ujian Sekarang</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              {/* Right Sidebar: 4 Columns (Trainer Operasional & Achievers) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Career Mentorship Card with Vector Illustration */}
                <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap size={15} className="text-[#96171B]" />
                      <span>Jenjang Karier & Pembinaan</span>
                    </h3>
                  </div>

                  <div className="flex justify-center py-1">
                    <MentorshipIllustration size={160} />
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    Kru yang lulus sertifikasi teori (skor ≥ 75) berhak mengajukan verifikasi uji praktik lapangan & evaluasi kenaikan jenjang grade operasional.
                  </div>
                </div>

                {/* Exam Rules Card */}
                <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/80 space-y-3">
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Shield size={15} className="text-[#96171B]" />
                    <span>Ketentuan Pelaksanaan Ujian</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>Kerjakan secara mandiri & jujur sesuai SOP resmi restoran.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>Dapat memakai tombol keyboard (1-4 / A-D) dan panah navigator.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>Gunakan tombol "Tandai Ragu" untuk meninjau ulang sebelum submit.</span>
                    </li>
                  </ul>
                </div>

                {/* Recent Exams Feed */}
                <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/80 space-y-3">
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Award size={15} className="text-amber-600" />
                      <span>Ujian Terbaru</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Live Stream</span>
                  </h3>

                  <div className="space-y-2">
                    {recentExams.length > 0 ? (
                      recentExams.map((e) => (
                        <div
                          key={e.id}
                          className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{e.nama_kru}</div>
                            <div className="text-[10.5px] text-slate-500 truncate max-w-[130px]">
                              {e.topik}
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                e.skor >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              Skor {e.skor}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">Belum ada catatan ujian hari ini.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE 2: LIVE EXAM INTERFACE */}
        {/* ======================================================== */}
        {stage === 'exam' && activeQuestions.length > 0 && (
          <div className="space-y-5 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
            
            {/* Top Exam HUD */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#96171B] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  #{currentIndex + 1}
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base text-slate-900">
                    {namaKru}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Outlet {selectedOutlet} · Divisi {selectedDivisi} · Soal {currentIndex + 1} dari {activeQuestions.length}
                  </div>
                </div>
              </div>

              {/* Countdown Timer, Exit & Submit */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Keluar dari sesi ujian ini? Jawaban Anda saat ini belum disimpan.')) {
                      if (onBackToHome) {
                        onBackToHome();
                      } else {
                        setStage('setup');
                      }
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-all"
                  title="Kembali ke halaman awal"
                >
                  Keluar / Ganti Kru
                </button>

                <div
                  className={`px-3.5 py-1.5 rounded-xl font-mono font-bold text-xs sm:text-sm flex items-center gap-2 border ${
                    timeLeft < 120
                      ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                      : 'bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <Clock size={15} className={timeLeft < 120 ? 'text-red-600' : 'text-slate-500'} />
                  <span>{formatTimer(timeLeft)}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmSubmitOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <CheckCircle2 size={15} />
                  <span>Kirim Jawaban</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#96171B] h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${(answeredCount / activeQuestions.length) * 100}%`,
                }}
              />
            </div>

            {/* Main Question + Grid Palette */}
            <div className="grid lg:grid-cols-12 gap-5 items-start">
              
              {/* Question Workspace (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {(() => {
                  const currentQ = activeQuestions[currentIndex];
                  const chosenOpt = answers[currentQ.id];
                  const isFlagged = flagged[currentQ.id];

                  return (
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/80 space-y-6">
                      
                      {/* Question Top Tags */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#96171B]/8 text-[#96171B] px-2.5 py-1 rounded-lg">
                            {currentQ.topik || 'SOP Operasional'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                            Divisi {currentQ.divisi}
                          </span>
                          {currentQ.kode_sop && (
                            <span className="text-[10px] font-mono font-bold text-red-900 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <BookOpen size={10} className="text-red-700" />
                              <span>{currentQ.kode_sop}</span>
                            </span>
                          )}
                          {currentQ.referensi_sop && (
                            <span className="text-[10px] text-slate-500 hidden sm:inline-block max-w-xs truncate">
                              • {currentQ.referensi_sop}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleFlag(currentQ.id)}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isFlagged
                              ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Flame size={14} className={isFlagged ? 'text-amber-600 fill-amber-600' : ''} />
                          <span>{isFlagged ? 'Ditandai Ragu' : 'Tandai Ragu'}</span>
                        </button>
                      </div>

                      {/* Question Content */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                        {currentQ.pertanyaan}
                      </h3>

                      {/* Options Grid */}
                      <div className="space-y-2.5 pt-1">
                        {(
                          [
                            { opt: 'A', text: currentQ.opsi_a },
                            { opt: 'B', text: currentQ.opsi_b },
                            { opt: 'C', text: currentQ.opsi_c },
                            { opt: 'D', text: currentQ.opsi_d },
                          ] as const
                        ).map((item) => {
                          const selected = chosenOpt === item.opt;
                          return (
                            <button
                              key={item.opt}
                              type="button"
                              onClick={() => handleSelectOption(currentQ.id, item.opt)}
                              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 cursor-pointer group ${
                                selected
                                  ? 'border-[#96171B] bg-[#96171B]/5 text-slate-900 ring-1 ring-[#96171B]'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                              }`}
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <span
                                  className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-all ${
                                    selected
                                      ? 'bg-[#96171B] text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-white'
                                  }`}
                                >
                                  {item.opt}
                                </span>
                                <span className="text-xs sm:text-sm font-semibold pt-1 leading-snug">
                                  {item.text}
                                </span>
                              </div>

                              <div className="shrink-0 pt-1">
                                {selected ? (
                                  <div className="w-5 h-5 rounded-full bg-[#96171B] text-white flex items-center justify-center shadow-2xs">
                                    <Check size={12} className="stroke-[3]" />
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded-full border border-slate-300 group-hover:border-slate-400" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Keyboard Navigation Tip */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                        <span className="hidden sm:inline">
                          💡 Tekan <b>A, B, C, D</b> atau <b>1, 2, 3, 4</b> di keyboard, dan <b>← / →</b> untuk navigasi.
                        </span>
                        <span className="ml-auto font-medium">
                          Soal {currentIndex + 1} dari {activeQuestions.length}
                        </span>
                      </div>

                      {/* Navigation Controls */}
                      <div className="pt-2 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          disabled={currentIndex === 0}
                          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                          <ChevronLeft size={15} />
                          <span>Sebelumnya</span>
                        </button>

                        {currentIndex < activeQuestions.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => setCurrentIndex((prev) => Math.min(activeQuestions.length - 1, prev + 1))}
                            className="px-5 py-2.5 rounded-xl bg-[#96171B] hover:bg-[#801216] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-[0.99]"
                          >
                            <span>Selanjutnya</span>
                            <ChevronRight size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmSubmitOpen(true)}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
                          >
                            <CheckCircle2 size={15} />
                            <span>Kirim Jawaban</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Number Palette: 4 Columns */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Palet Nomor Soal
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {answeredCount}/{activeQuestions.length} Terisi
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {activeQuestions.map((q, idx) => {
                      const isAns = answers[q.id] !== undefined;
                      const isCur = currentIndex === idx;
                      const isFlg = flagged[q.id];

                      let btnStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                      if (isFlg) btnStyle = 'bg-amber-400 text-black border-amber-500 font-bold';
                      else if (isAns) btnStyle = 'bg-emerald-600 text-white border-emerald-700 font-bold';

                      if (isCur) {
                        btnStyle += ' ring-2 ring-[#96171B] ring-offset-2 scale-105';
                      }

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          className={`h-9 rounded-xl border text-xs font-bold transition-all flex items-center justify-center relative cursor-pointer ${btnStyle}`}
                        >
                          <span>{idx + 1}</span>
                          {isFlg && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full ring-1 ring-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block shrink-0" />
                      <span>Sudah Dijawab</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-amber-400 inline-block shrink-0" />
                      <span>Ditandai Ragu-ragu</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300 inline-block shrink-0" />
                      <span>Belum Dijawab</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE 3: RESULT & OFFICIAL E-CERTIFICATE */}
        {/* ======================================================== */}
        {stage === 'result' && scoreResult && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto w-full">
            
            {/* Score Banner Hero */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/80 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-xl text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100">
                    {scoreResult.passed ? (
                      <>
                        <CheckCircle size={15} className="text-emerald-600" />
                        <span className="text-emerald-700">LULUS UJI KOMPETENSI TEORI SOP</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={15} className="text-amber-600" />
                        <span className="text-amber-700">BELUM MENCAPAI STANDAR MINIMAL (PERLU RETRAINING)</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {namaKru} · {scoreResult.badge.toUpperCase()}
                  </h2>
                  
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {scoreResult.passed
                      ? `Selamat! Anda berhasil memperoleh skor ${scoreResult.score}/100 dan berhak mendapatkan Sertifikat Digital Kompetensi Divisi ${selectedDivisi} di ${selectedOutlet}.`
                      : `Skor Anda adalah ${scoreResult.score}/100 (Passing grade: 75). Silakan pelajari kembali materi SOP dan ajukan jadwal retraining kepada Lead Trainer.`}
                  </p>
                </div>

                {/* Score Circular Gauge & Vector Success Illustration */}
                <div className="flex items-center gap-5 shrink-0 bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200/80">
                  {scoreResult.passed ? (
                    <ExamSuccessIllustration size={100} />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-[#96171B]">
                      <AlertCircle size={32} />
                    </div>
                  )}

                  <div className="text-center pl-2">
                    <div className="text-4xl sm:text-5xl font-black text-[#96171B] font-mono leading-none">
                      {scoreResult.score}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">
                      SKOR AKHIR
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-1">
                      {scoreResult.correctCount} / {scoreResult.total} Benar
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Digital Certificate Card */}
            <div
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/80 space-y-6 print:m-0 print:border-none print:shadow-none"
              id="slip-ujian"
            >
              <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <HaraLogo variant="full" size="md" />
                  <div className="hidden sm:block pl-4 border-l border-slate-200">
                    <span className="text-[11px] text-[#96171B] font-bold uppercase tracking-widest">
                      Quality Assurance & Trainer Operasional
                    </span>
                    <p className="text-xs text-slate-500 font-medium">
                      Sertifikat Kelulusan Uji Standar Operasional Restoran
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200 font-bold">
                    ID: {scoreResult.examRecordId}
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1 font-medium">
                    Diterbitkan: {new Date(scoreResult.date).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Certificate Inner Body */}
              <div className="bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-slate-200 text-center space-y-4 relative overflow-hidden">
                <div className="text-xs uppercase tracking-widest text-[#96171B] font-bold">
                  SURAT BUKTI KELULUSAN KOMPETENSI TEORI KRU
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {namaKru}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                  Telah dinyatakan menguasai standar operasional, resep racikan, kebersihan, dan keselamatan kerja HACCP pada divisi{' '}
                  <strong className="text-slate-900">{selectedDivisi}</strong> di cabang outlet{' '}
                  <strong className="text-slate-900">{selectedOutlet}</strong> dengan hasil evaluasi:
                </p>

                <div className="inline-flex flex-wrap items-center justify-center gap-5 bg-white px-8 py-4 rounded-xl border border-slate-200 shadow-2xs mt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Skor Ujian</span>
                    <span className="text-2xl sm:text-3xl font-black text-[#96171B]">{scoreResult.score}/100</span>
                  </div>
                  <div className="h-10 w-px bg-slate-200" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Predikat Kualifikasi</span>
                    <span className="text-base sm:text-lg font-bold text-slate-900">{scoreResult.badge}</span>
                  </div>
                  <div className="h-10 w-px bg-slate-200" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Kelulusan</span>
                    <span
                      className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                        scoreResult.passed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {scoreResult.passed ? 'Lulus Standar' : 'Belum Memenuhi'}
                    </span>
                  </div>
                </div>

                <div className="pt-6 grid grid-cols-2 gap-6 text-xs border-t border-slate-200 max-w-lg mx-auto">
                  <div className="text-left sm:text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Peserta Ujian</span>
                    <div className="font-bold text-slate-800 mt-1">{namaKru}</div>
                    <div className="text-[10px] text-slate-500">Kru {selectedDivisi} - {selectedOutlet}</div>
                  </div>
                  <div className="text-right sm:text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Disahkan Oleh</span>
                    <div className="font-bold text-slate-800 mt-1">Haikal Abi</div>
                    <div className="text-[10px] text-slate-500">Lead Trainer Operasional Cabang</div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Printer size={15} />
                    <span>Cetak E-Sertifikat (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareToWA}
                    className="px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Share2 size={15} className="text-emerald-600" />
                    <span>Kirim Hasil ke WhatsApp SPV</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStage('setup');
                      setAnswers({});
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#96171B] hover:bg-[#801216] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.99]"
                  >
                    <RefreshCw size={15} />
                    <span>Uji Modul Lain</span>
                  </button>

                  {onBackToHome && (
                    <button
                      type="button"
                      onClick={onBackToHome}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold cursor-pointer transition-all"
                    >
                      Kembali ke Beranda
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Answer Breakdown & Explanations */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/80 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <BookOpen size={17} className="text-[#96171B]" />
                    <span>Pembahasan Kunci Jawaban Resmi SOP</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pelajari materi terkait untuk meningkatkan standar mutu pelayanan restoran.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setReviewFilter('ALL')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      reviewFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua ({activeQuestions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('WRONG')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      reviewFilter === 'WRONG' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Salah ({activeQuestions.length - scoreResult.correctCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilter('CORRECT')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      reviewFilter === 'CORRECT' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Benar ({scoreResult.correctCount})
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {activeQuestions
                  .filter((q) => {
                    const isCorrect = answers[q.id] === q.jawaban_benar;
                    if (reviewFilter === 'WRONG') return !isCorrect;
                    if (reviewFilter === 'CORRECT') return isCorrect;
                    return true;
                  })
                  .map((q, idx) => {
                    const userAns = answers[q.id];
                    const isCorrect = userAns === q.jawaban_benar;
                    const correctText =
                      q.jawaban_benar === 'A'
                        ? q.opsi_a
                        : q.jawaban_benar === 'B'
                        ? q.opsi_b
                        : q.jawaban_benar === 'C'
                        ? q.opsi_c
                        : q.opsi_d;

                    return (
                      <div
                        key={q.id}
                        className={`p-4 sm:p-5 rounded-2xl border text-xs space-y-3 transition-all ${
                          isCorrect
                            ? 'bg-emerald-50/20 border-emerald-200'
                            : 'bg-red-50/20 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span
                              className={`w-6 h-6 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 ${
                                isCorrect ? 'bg-emerald-600' : 'bg-[#96171B]'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {q.kode_sop && (
                                  <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100/80 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <BookOpen size={10} className="text-amber-800" />
                                    <span>{q.kode_sop}</span>
                                  </span>
                                )}
                                {q.referensi_sop && (
                                  <span className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                    {q.referensi_sop}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-500 font-medium">
                                  Topik: {q.topik} · Divisi: {q.divisi}
                                </span>
                              </div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                {q.pertanyaan}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                                <CheckCircle size={13} />
                                <span>Benar</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                                <XCircle size={13} />
                                <span>Salah</span>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2 pt-1">
                          <div
                            className={`p-2.5 rounded-xl border text-xs ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                                : 'bg-red-50 border-red-200 text-red-950'
                            }`}
                          >
                            <span className="text-[10px] font-bold uppercase block text-slate-400">
                              Jawaban Anda:
                            </span>
                            <span className="font-bold text-xs">
                              Pilihan {userAns || '- (Tidak Dijawab)'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl border bg-white border-slate-200 text-slate-800 text-xs">
                            <span className="text-[10px] font-bold uppercase block text-slate-400">
                              Kunci Jawaban Resmi SOP:
                            </span>
                            <span className="font-bold text-emerald-700 text-xs">
                              Pilihan {q.jawaban_benar}: {correctText}
                            </span>
                          </div>
                        </div>

                        {/* Pembahasan Resmi SOP */}
                        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/90 text-xs space-y-1">
                          <div className="flex items-center justify-between text-amber-900 font-bold text-[11px]">
                            <span className="flex items-center gap-1.5">
                              <BookOpen size={12} className="text-amber-700" />
                              <span>Pembahasan & Logika Baku SOP HARA:</span>
                            </span>
                            {q.kode_sop && (
                              <span className="text-[10px] font-mono text-amber-800">
                                Ref: {q.kode_sop}
                              </span>
                            )}
                          </div>
                          <p className="text-[11.5px] text-amber-950 leading-relaxed">
                            {q.pembahasan ||
                              `Kunci jawaban yang tepat adalah (${q.jawaban_benar}) ${correctText}. Langkah ini merupakan kepatuhan mutlak terhadap standar operasional prosedur divisi ${q.divisi} untuk menjamin kualitas rasa, higienitas, dan keselamatan kerja.`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal Before Final Submit */}
        {confirmSubmitOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto shadow-2xs">
                <AlertCircle size={24} />
              </div>

              <div className="text-center space-y-1">
                <h4 className="font-bold text-base text-slate-900">
                  Konfirmasi Pengiriman Ujian
                </h4>
                <p className="text-xs text-slate-500">
                  Apakah Anda yakin ingin menyelesaikan dan merekap nilai sekarang?
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Nama Peserta:</span>
                  <span className="font-bold text-slate-900">{namaKru}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Soal Terjawab:</span>
                  <span className="font-bold text-emerald-600">
                    {answeredCount} dari {activeQuestions.length} Soal
                  </span>
                </div>
                {unansweredCount > 0 && (
                  <div className="flex justify-between font-bold text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 text-xs">
                    <span>Belum Terisi:</span>
                    <span>{unansweredCount} Soal Masih Kosong</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmSubmitOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs flex-1 cursor-pointer font-bold transition-all"
                >
                  Periksa Lagi
                </button>
                <button
                  type="button"
                  onClick={finishExam}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex-1 cursor-pointer font-bold shadow-xs transition-all active:scale-[0.99]"
                >
                  Kirim Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick SOP Study / Cheat Sheet Modal */}
        {sopStudyModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Cheat Sheet & Rangkuman Standar SOP
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pelajari parameter kunci sebelum memulai lembar ujian
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSopStudyModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Vector Illustration & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-amber-50/40 p-3 rounded-2xl border border-amber-100">
                <div className="shrink-0">
                  <SopKnowledgeIllustration size={100} />
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  <span className="text-[11px] font-bold text-amber-900 uppercase">Pencarian Cepat Modul Resep</span>
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={sopSearchTerm}
                      onChange={(e) => setSopSearchTerm(e.target.value)}
                      placeholder="Cari SOP (suhu 170°C, takaran marinasi, sanitasi)..."
                      className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#96171B] bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* SOP List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {sopList
                  .filter((sop) => {
                    const q = sopSearchTerm.toLowerCase();
                    return (
                      !q ||
                      sop.judul_sop.toLowerCase().includes(q) ||
                      sop.ringkasan_prosedur.toLowerCase().includes(q) ||
                      sop.divisi.toLowerCase().includes(q)
                    );
                  })
                  .map((sop) => (
                    <div
                      key={sop.id}
                      className="p-3.5 bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-2xl transition-all space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{sop.judul_sop}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                            {sop.kode_sop}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                          {sop.divisi}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11.5px] leading-relaxed">
                        {sop.ringkasan_prosedur}
                      </p>
                      {sop.poin_kritis && (
                        <div className="text-[10.5px] text-rose-800 bg-rose-50 border border-rose-200/60 p-2 rounded-xl flex items-start gap-1.5 font-medium">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5 text-rose-600" />
                          <span>Poin Kritis: {sop.poin_kritis}</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Total {sopList.length} Modul SOP Standar Resmi
                </span>
                <button
                  type="button"
                  onClick={() => setSopStudyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#96171B] hover:bg-[#801216] text-white cursor-pointer transition-all active:scale-[0.99]"
                >
                  Tutup & Mulai Ujian
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-bold text-slate-700">
            Hara Chicken Quality Assurance & Trainer Operasional Framework © 2026
          </p>
          <p className="text-[11px] text-slate-400">
            Standar SOP F&B Terpadu · Sertifikasi Digital Multi-Outlet
          </p>
        </div>
      </footer>
    </div>
  );
};
