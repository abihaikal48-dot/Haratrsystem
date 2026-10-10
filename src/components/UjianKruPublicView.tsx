import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain, Award, Clock, Shield, ShieldCheck, ArrowLeft, Check, Sparkles, User, Store,
  CheckCircle2, ChevronRight, ChevronLeft, Copy, Printer, AlertTriangle, AlertCircle,
  HelpCircle, ChevronDown, CheckSquare, MessageSquare, Info, Flag, Bookmark, ShieldAlert,
  X, Lock
} from 'lucide-react';
import { db } from '../lib/storage';
import {
  Outlet, Kru, Division, ExamWeek, SoalUjianMingguan, HasilUjianKruMingguan,
  TrainerExamConfig, AppUser
} from '../types';
import { HaraLogo } from './HaraLogo';
import {
  BANK_SOAL_MINGGUAN,
  getSoalUjianByMinggu,
  hitungProfilPsikologis,
  hitungAnalisisPilar,
  ProfilKarakterEvaluasi
} from '../data/bankSoalMingguan';
import { ChickenIcon, CashierIcon, ChiliIcon, BroomCleanIcon } from './ui/Icons';

interface UjianKruPublicViewProps {
  onBackToHome?: () => void;
  onGoToAdminLogin?: () => void;
  initialOutlet?: string;
  initialNamaKru?: string;
  initialDivisi?: 'Semua' | Division;
  initialMinggu?: ExamWeek;
}

export const UjianKruPublicView: React.FC<UjianKruPublicViewProps> = ({
  onBackToHome,
  onGoToAdminLogin,
  initialOutlet,
  initialNamaKru,
  initialDivisi,
  initialMinggu,
}) => {
  // Master Outlets & Kru from Storage
  const [outlets] = useState<Outlet[]>(() => db.getTable<Outlet>('outlets'));
  const [kruList] = useState<Kru[]>(() =>
    db.getTable<Kru>('kru').filter((k) => k.status_aktif === 'Aktif')
  );
  const examConfig = useMemo<TrainerExamConfig>(() => db.getExamConfig(), []);

  // List of authorized Trainers & Area Supervisors
  const trainers = useMemo(() => {
    const users = db.getTable<AppUser>('app_users');
    const filtered = users.filter(
      (u) => u.role === 'Trainer' || u.role === 'Area Supervisor' || u.role === 'Kepala Outlet'
    );
    if (filtered.length === 0) {
      return [
        { id: 'usr-1', nama: 'Haikal Abi', role: 'Trainer Lapangan' },
        { id: 'usr-2', nama: 'Bambang Kusuma', role: 'Area SPV' },
      ];
    }
    return filtered;
  }, []);

  // 1. Data Diri Kru State (Sederhana & Mudah)
  const [namaKru, setNamaKru] = useState<string>(initialNamaKru || '');
  const [selectedOutlet, setSelectedOutlet] = useState<string>(() => {
    if (initialOutlet) return initialOutlet;
    const outs = db.getTable<Outlet>('outlets');
    return outs.length > 0 ? outs[0].kode_outlet : 'HC-JTS01';
  });
  const [selectedDivisi, setSelectedDivisi] = useState<Division>(() => {
    if (initialDivisi && initialDivisi !== 'Semua') return initialDivisi;
    return 'Kitchen';
  });
  const [selectedTrainer, setSelectedTrainer] = useState<string>(() => {
    return trainers.length > 0
      ? `${trainers[0].nama} (${trainers[0].role})`
      : 'Haikal Abi (Trainer Lapangan)';
  });

  // Soal yang Memilih Trainer (Otomatis ditentukan oleh Trainer / OJT, kru tidak perlu memilih)
  const [selectedMinggu, setSelectedMinggu] = useState<ExamWeek>(() => {
    if (initialMinggu) return initialMinggu;
    if (examConfig.mode === 'kunci_paket' && examConfig.paket_terkunci) {
      return examConfig.paket_terkunci;
    }
    return 'MINGGU_1';
  });

  // Otomatis sinkron paket ujian yang ditentukan oleh Trainer
  useEffect(() => {
    if (initialMinggu) return;
    if (examConfig.mode === 'kunci_paket' && examConfig.paket_terkunci) {
      setSelectedMinggu(examConfig.paket_terkunci);
    } else if (examConfig.mode === 'otomatis_ojt') {
      const trimmed = namaKru.trim().toLowerCase();
      if (trimmed) {
        const ojtList = db.getOJTMonitoring();
        const found = ojtList.find((m) => m.nama_kru.toLowerCase() === trimmed);
        if (found && found.minggu_aktif) {
          const wMap: Record<number, ExamWeek> = {
            1: 'MINGGU_1',
            2: 'MINGGU_2',
            3: 'MINGGU_3',
            4: 'MINGGU_4',
          };
          setSelectedMinggu(wMap[found.minggu_aktif] || 'MINGGU_1');
          return;
        }
      }
      if (examConfig.paket_terkunci) {
        setSelectedMinggu(examConfig.paket_terkunci);
      }
    }
  }, [namaKru, examConfig, initialMinggu]);

  // Exam Workflow State: 'setup' | 'exam' | 'result'
  const [stage, setStage] = useState<'setup' | 'exam' | 'result'>('setup');

  // Active Questions & Answers State
  const [questions, setQuestions] = useState<SoalUjianMingguan[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Timer Sesi Ujian (Menyeluruh per Sesi, Bukan per Butir Soal)
  // Menyesuaikan jumlah soal dengan rekomendasi terbaik (misal 26 butir soal = 26 - 30 menit)
  const [totalSessionSeconds, setTotalSessionSeconds] = useState<number>(30 * 60);
  const [totalTimeLeft, setTotalTimeLeft] = useState<number>(30 * 60);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // Fitur Keamanan, Anti-Cheat & Integritas Ujian
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showCheatWarning, setShowCheatWarning] = useState<boolean>(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);
  const [sessionToken] = useState<string>(() => 'SESI-' + Math.random().toString(36).substring(2, 8).toUpperCase());

  // Hasil Ujian Terkirim (Tersimpan di DB, tapi skor dirahasiakan dari Kru)
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    id: string;
    nama_kru: string;
    nama_outlet: string;
    kode_outlet: string;
    divisi: Division;
    trainer_penilai: string;
    minggu: ExamWeek;
    mingguNomor: number;
    tanggal: string;
    totalSoal: number;
    totalDijawab: number;
  } | null>(null);

  // Filtered Crew suggestions for selected outlet
  const outletKruList = useMemo(() => {
    return kruList.filter((k) => k.kode_outlet === selectedOutlet);
  }, [kruList, selectedOutlet]);

  // Selected Outlet Object
  const currentOutletObj = useMemo(() => {
    return outlets.find((o) => o.kode_outlet === selectedOutlet) || outlets[0];
  }, [outlets, selectedOutlet]);

  // Active question in exam stage
  const currentQ = questions[currentIndex] || questions[0];

  // Dedicated TIMER SESI (Hitung Mundur Total Sesi Ujian)
  // Kru leluasa berpindah antar nomor soal tanpa dipotong timer per soal
  useEffect(() => {
    if (stage !== 'exam') return;

    if (totalTimeLeft <= 0) {
      // Waktu sesi ujian habis! Otomatis kumpulkan jawaban
      handleFinishExam();
      return;
    }

    const timer = setInterval(() => {
      setTotalTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, totalTimeLeft]);

  // Anti-Cheat: Deteksi Pergantian Tab Browser & Window Blur
  useEffect(() => {
    if (stage !== 'exam') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setShowCheatWarning(true);
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount((prev) => {
        const next = prev + 1;
        setShowCheatWarning(true);
        return next;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [stage]);

  // Auto-fill crew division if existing crew name selected
  const handleSelectExistingKru = (kruName: string) => {
    setNamaKru(kruName);
    const found = kruList.find((k) => k.nama_kru.toLowerCase() === kruName.toLowerCase());
    if (found) {
      setSelectedDivisi(found.divisi);
      setSelectedOutlet(found.kode_outlet);
    }
  };

  // Start Exam Handler
  const handleStartExam = () => {
    if (!namaKru.trim()) {
      alert('Silakan masukkan nama lengkap Anda terlebih dahulu.');
      return;
    }

    // Load questions based on chosen week and station with strict jobdesk isolation
    const pool = getSoalUjianByMinggu(selectedMinggu, selectedDivisi);
    const examQuestions = pool.length > 0 ? pool : BANK_SOAL_MINGGUAN.slice(0, 26);
    setQuestions(examQuestions);

    setCurrentIndex(0);
    setAnswers({});
    
    // Durasi timer per sesi terbaik menyesuaikan jumlah soal (1 menit per soal, minimal 25 menit)
    const durationMinutes = examConfig.durasi_menit && examConfig.durasi_menit >= 15
      ? examConfig.durasi_menit
      : Math.max(25, examQuestions.length);
    const sessionSeconds = durationMinutes * 60;
    
    setTotalSessionSeconds(sessionSeconds);
    setTotalTimeLeft(sessionSeconds);
    setStage('exam');
  };

  // Select Option Answer
  const handleSelectOption = (questionId: string, optionLabel: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionLabel,
    }));
  };

  // Submit Essay Answer
  const handleEssayChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text,
    }));
  };

  // Selesaikan Ujian: Hitung Skor dan Simpan ke DB Trainer, TETAPI KRU TIDAK DIBERITAHU SKORNYA
  const handleFinishExam = () => {
    let pgTotal = 0;
    let pgCorrect = 0;
    let essayTotal = 0;
    let essayScoreAccum = 0;

    questions.forEach((q) => {
      if (q.tipe === 'PILIHAN_GANDA') {
        pgTotal += q.bobot;
        if (answers[q.id] === q.jawaban_benar) {
          pgCorrect += q.bobot;
        }
      } else if (q.tipe === 'ESSAY_HOTS') {
        essayTotal += q.bobot;
        const essayAns = (answers[q.id] || '').toLowerCase();
        if (essayAns.trim().length > 15) {
          const keywords = q.kata_kunci_essay || [];
          const hits = keywords.filter((k) => essayAns.includes(k.toLowerCase())).length;
          const ratio = keywords.length > 0 ? Math.min(1, hits / Math.max(2, keywords.length * 0.6)) : 0.8;
          essayScoreAccum += Math.round(q.bobot * ratio);
        }
      }
    });

    const skorPG = pgTotal > 0 ? Math.round((pgCorrect / pgTotal) * 100) : 85;
    const skorEssay = essayTotal > 0 ? Math.round((essayScoreAccum / essayTotal) * 100) : 80;
    const skorAkhir = Math.round((skorPG * 0.6) + (skorEssay * 0.4));
    const passed = skorAkhir >= (examConfig.passing_grade || 75);

    // Hitung Profil Psikologis Karakter Kerja Otomatis
    const profilKarakter = hitungProfilPsikologis(answers);
    // Hitung Radar 4 Pilar Kompetensi & Rekomendasi Coaching
    const analisisPilar = hitungAnalisisPilar(answers, questions);

    const weekNumMap: Record<ExamWeek, 1 | 2 | 3 | 4> = {
      MINGGU_1: 1,
      MINGGU_2: 2,
      MINGGU_3: 3,
      MINGGU_4: 4,
    };

    const recordId = `exam-${Date.now()}`;
    const timestampStr = new Date().toISOString();

    const examRecord: HasilUjianKruMingguan = {
      id: recordId,
      tanggal: timestampStr,
      nama_kru: namaKru.trim(),
      kode_outlet: selectedOutlet,
      nama_outlet: currentOutletObj?.nama_outlet || selectedOutlet,
      trainer_penilai: selectedTrainer,
      divisi: selectedDivisi,
      minggu: selectedMinggu,
      mingguNomor: weekNumMap[selectedMinggu],
      skor_pilihan_ganda: skorPG,
      skor_essay: skorEssay,
      skor_akhir_komposit: skorAkhir,
      status_kelulusan: passed ? 'Lulus Kompeten' : 'Remedial Terbimbing',
      jawaban_kru: answers,
      profil_psikologis: {
        integritas: profilKarakter.integritas,
        ketahanan_stres: profilKarakter.ketahanan_stres,
        fokus_pelanggan: profilKarakter.fokus_pelanggan,
        disiplin_sop: profilKarakter.disiplin_sop,
        kerjasama_tim: profilKarakter.kerjasama_tim,
        tipe_kepribadian_kerja: profilKarakter.tipe_kepribadian_kerja,
        kesimpulan_trainer: profilKarakter.kesimpulan_trainer,
        rekomendasi_pendampingan: profilKarakter.rekomendasi_pendampingan,
      },
      analisis_pilar: {
        sop_jobdesk: analisisPilar.sop_jobdesk,
        peraturan_perusahaan: analisisPilar.peraturan_perusahaan,
        karakter_integritas: analisisPilar.karakter_integritas,
        visi_misi_hara: analisisPilar.visi_misi_hara,
        pilar_terendah: analisisPilar.pilar_terendah,
        rekomendasi_coaching: analisisPilar.rekomendasi_coaching,
        materi_rekomendasi: analisisPilar.materi_rekomendasi,
      },
      catatan_trainer: `Ujian ${selectedMinggu} diselesaikan oleh ${namaKru}. Trainer penilai: ${selectedTrainer}. Karakter: ${profilKarakter.tipe_kepribadian_kerja}. Pilar Kritis: ${analisisPilar.pilar_terendah}.`,
      jumlah_pindah_tab: tabSwitchCount,
      created_at: timestampStr,
    };

    // Tersimpan rapi di database untuk dinilai & ditinjau oleh Trainer/SPV
    db.saveHasilUjianMingguan(examRecord);

    // Bukti penyerahan untuk kru (TANPA NILAI / KRU TIDAK TAHU HASILNYA)
    const answeredCount = Object.keys(answers).length;
    setSubmittedReceipt({
      id: recordId,
      nama_kru: namaKru.trim(),
      nama_outlet: currentOutletObj?.nama_outlet || selectedOutlet,
      kode_outlet: selectedOutlet,
      divisi: selectedDivisi,
      trainer_penilai: selectedTrainer,
      minggu: selectedMinggu,
      mingguNomor: weekNumMap[selectedMinggu],
      tanggal: timestampStr,
      totalSoal: questions.length,
      totalDijawab: answeredCount,
    });

    setStage('result');
  };

  // Copy Bukti Pengumpulan ke WhatsApp
  const handleCopyReceipt = () => {
    if (!submittedReceipt) return;
    const text =
      `*BUKTI PENYERAHAN UJIAN STANDAR KRU HARA CHICKEN*\n` +
      `-------------------------------------------\n` +
      `No. Registrasi: HC-${submittedReceipt.id.slice(-6).toUpperCase()}\n` +
      `Nama Kru: ${submittedReceipt.nama_kru}\n` +
      `Cabang Gerai: ${submittedReceipt.nama_outlet} (${submittedReceipt.kode_outlet})\n` +
      `Stasiun Kerja: ${submittedReceipt.divisi}\n` +
      `Trainer Penilai: ${submittedReceipt.trainer_penilai}\n` +
      `Paket Ujian: Minggu ke-${submittedReceipt.mingguNomor} (${submittedReceipt.minggu})\n` +
      `Jumlah Jawaban: ${submittedReceipt.totalDijawab} dari ${submittedReceipt.totalSoal} butir soal\n` +
      `Waktu Penyerahan: ${new Date(submittedReceipt.tanggal).toLocaleString('id-ID')}\n\n` +
      `STATUS SISTEM:\n` +
      `✅ Berhasil Terkirim ke Database Trainer Lapangan.\n` +
      `Catatan: Hasil evaluasi & sertifikasi akan diumumkan langsung oleh Trainer saat sesi briefing gerai.`;

    navigator.clipboard.writeText(text);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  const formatMinutesSeconds = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Paket Info Label yang Dipilih Trainer
  const paketInfo = useMemo(() => {
    switch (selectedMinggu) {
      case 'MINGGU_1':
        return {
          judul: 'Paket 1: Fondasi Visi Misi & Karakteristik Psikologis',
          desc: 'Standar kehalalan, kebersihan 5S, nilai H.A.R.A, dan pemetaan integritas kerja.',
        };
      case 'MINGGU_2':
        return {
          judul: 'Paket 2: SOP Teknis Stasiun Kerja & Prosedur POS ESB',
          desc: 'SOP spesifik suhu 160°C, gramatur sambal 30g, standar kasir, dan sanitasi.',
        };
      case 'MINGGU_3':
        return {
          judul: 'Paket 3: Analisis Kasus Kritis & Tindakan Prosedural (HOTS)',
          desc: 'Penanganan komplain pelanggan, lonjakan pesanan jam sibuk, dan audit mutu.',
        };
      case 'MINGGU_4':
        return {
          judul: 'Paket 4: Sertifikasi Komprehensif Gate 4 Solo Shift',
          desc: 'Uji kesiapan mandiri bertugas tanpa supervisi intensif dan tanggung jawab shift.',
        };
      default:
        return {
          judul: 'Paket Ujian Standar Mutu Gerai HARA Chicken',
          desc: 'Pengujian kepatuhan SOP stasiun kerja resmi HARA Chicken.',
        };
    }
  }, [selectedMinggu]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1813] flex flex-col justify-between selection:bg-[#96171B] selection:text-white font-sans antialiased">
      {/* =========================================================================
          TOP NAVIGATION BAR
          ========================================================================= */}
      <header className="border-b border-[#E8E2D5] bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {stage !== 'exam' && onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                title="Kembali"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <HaraLogo variant="icon" size="sm" />
            <div>
              <div className="text-xs font-bold text-[#1F1813] flex items-center gap-1.5">
                <span>HARA Chicken</span>
                <span className="text-stone-300">·</span>
                <span className="text-[#96171B]">Portal Evaluasi Kru</span>
              </div>
              <div className="text-[10px] text-stone-500 font-mono">
                Penilaian Mandiri Terverifikasi Cloud
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stage === 'exam' && (
              <div className="flex items-center gap-2">
                {/* Waktu Sesi Ujian */}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                    totalTimeLeft <= 180
                      ? 'bg-red-50 text-[#96171B] border-red-300 ring-2 ring-red-200 animate-pulse'
                      : totalTimeLeft <= 600
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-stone-50 text-stone-800 border-stone-200'
                  }`}
                >
                  <Clock
                    size={14}
                    className={
                      totalTimeLeft <= 180
                        ? 'text-[#96171B]'
                        : totalTimeLeft <= 600
                        ? 'text-amber-700'
                        : 'text-stone-600'
                    }
                  />
                  <span>Sisa Sesi: {formatMinutesSeconds(totalTimeLeft)}</span>
                </div>
              </div>
            )}

            {onGoToAdminLogin && stage !== 'exam' && (
              <button
                type="button"
                onClick={onGoToAdminLogin}
                className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Buka Login Staf / Manajemen"
              >
                <Shield size={13} className="text-[#96171B]" />
                <span className="hidden sm:inline">Login Staf & Trainer</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN CONTAINER: 3 TAHAP (SETUP -> EXAM -> RESULT)
          ========================================================================= */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* =======================================================================
            TAHAP 1: FORM PENDAFTARAN SIMPEL (CUKUP DATA DIRI, SOAL DITENTUKAN TRAINER)
            ======================================================================= */}
        {stage === 'setup' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header Orientasi */}
            <div className="bg-white rounded-2xl border border-[#E6E1D8] p-6 sm:p-8 shadow-[0_16px_40px_-12px_rgba(28,20,15,0.06)] space-y-6">
              <div className="border-b border-[#F0ECE1] pb-5">
                <span className="px-2.5 py-1 rounded-full bg-red-50 text-[#96171B] border border-red-200 text-[10.5px] font-bold font-mono">
                  STANDAR OPERASIONAL BAKU #BENERANDIGEPREK
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1F1813] mt-2 font-['Outfit']">
                  Lembar Evaluasi Standar Kru
                </h1>
                <p className="text-xs text-stone-500 mt-1 max-w-xl leading-relaxed">
                  Cukup lengkapi data diri Anda di bawah ini. Soal ujian telah ditentukan dan disiapkan langsung oleh Trainer pendamping gerai Anda.
                </p>
              </div>

              {/* Form Input Data Diri Kru */}
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama Lengkap Kru */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      Nama Lengkap Kru <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={namaKru}
                      onChange={(e) => setNamaKru(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:border-[#96171B] focus:ring-1 focus:ring-[#96171B]"
                    />
                    {outletKruList.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500">
                        <span>Pilih nama cepat:</span>
                        {outletKruList.slice(0, 4).map((k) => (
                          <button
                            key={k.id}
                            type="button"
                            onClick={() => handleSelectExistingKru(k.nama_kru)}
                            className="px-2 py-0.5 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors cursor-pointer"
                          >
                            {k.nama_kru}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cabang / Outlet */}
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1.5">
                      Cabang / Gerai Outlet <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedOutlet}
                      onChange={(e) => setSelectedOutlet(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:border-[#96171B]"
                    >
                      {outlets.map((o) => (
                        <option key={o.id} value={o.kode_outlet}>
                          {o.kode_outlet} — {o.nama_outlet}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Stasiun / Divisi Kerja */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Stasiun / Jobdesk Kerja Anda <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'Kitchen', label: 'Kitchen & Fryer', desc: 'Suhu 160°C, Marinasi, 10x Cubit', icon: ChickenIcon },
                      { id: 'Kasir', label: 'Kasir & Front House', desc: '5S Greeting, POS ESB, Kas Tunai', icon: CashierIcon },
                      { id: 'Geprek', label: 'Geprek & Sambal', desc: 'Cobek Batu, 30g Sambal Baku', icon: ChiliIcon },
                      { id: 'Helper', label: 'Helper & Bahan', desc: 'FIFO/FEFO, Thawing, Sanitasi', icon: BroomCleanIcon },
                    ].map((st) => {
                      const IconComp = st.icon;
                      const isSel = selectedDivisi === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSelectedDivisi(st.id as Division)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSel
                              ? 'border-[#96171B] bg-rose-50/50 text-[#1F1813] ring-1 ring-[#96171B] shadow-xs'
                              : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                isSel ? 'bg-[#96171B] text-white' : 'bg-stone-100 text-stone-500'
                              }`}
                            >
                              <IconComp size={14} />
                            </div>
                            <span className="font-bold text-xs">{st.label}</span>
                          </div>
                          <p className="text-[10px] text-stone-500 leading-tight">{st.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Trainer Pendamping / Penilai */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Trainer Pembimbing / Penilai Lapangan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedTrainer}
                    onChange={(e) => setSelectedTrainer(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:border-[#96171B]"
                  >
                    {trainers.map((t) => (
                      <option key={t.id} value={`${t.nama} (${t.role})`}>
                        {t.nama} — {t.role}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Lembar jawaban Anda akan otomatis diserahkan dan ditinjau oleh Trainer ini.
                  </p>
                </div>

                {/* ===================================================================
                    SEKSI SOAL YANG MEMILIH TRAINER (TRANSPARAN & MENENANGKAN)
                    =================================================================== */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                      <Brain size={18} className="text-amber-800" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-amber-950 font-['Outfit']">
                          Paket Soal Telah Ditetapkan oleh Trainer
                        </span>
                        <span className="text-[10px] bg-amber-200/80 text-amber-900 font-mono font-bold px-2 py-0.5 rounded">
                          Terkunci Resmi
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-stone-900 mt-1">
                        {paketInfo.judul}
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                        {paketInfo.desc}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-amber-200/60 text-[11px]">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <Clock size={13} className="text-amber-800" />
                      <span>Timer: <b>Per Sesi (25 - 30 Menit)</b></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <ShieldCheck size={13} className="text-emerald-700" />
                      <span>Format: <b>Bebas Navigasi Soal</b></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-700 col-span-2 sm:col-span-1">
                      <Sparkles size={13} className="text-purple-700" />
                      <span>Hasil: <b>Langsung ke Trainer</b></span>
                    </div>
                  </div>

                  {examConfig.pesan_trainer && (
                    <div className="text-[11px] text-amber-900 bg-white/70 p-2.5 rounded-xl border border-amber-200/70 font-medium leading-relaxed">
                      <b>Catatan Trainer:</b> "{examConfig.pesan_trainer}"
                    </div>
                  )}
                </div>

                {/* Tombol Mulai Ujian */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Lembar jawaban otomatis tersimpan ke Cloud Firestore</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartExam}
                    className="px-6 py-2.5 rounded-xl bg-[#96171B] hover:bg-[#7a1215] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Mulai Mengerjakan Ujian</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            TAHAP 2: LEMBAR PENGERJAAN SOAL DENGAN TIMER SOAL PER BUTIR
            ======================================================================= */}
        {stage === 'exam' && currentQ && (
          <div className="space-y-4 animate-in fade-in relative">
            {/* Dynamic Security Watermark Canvas */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.035] overflow-hidden select-none flex flex-wrap gap-12 p-8 items-center justify-around">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="transform -rotate-25 text-xs font-mono font-black text-stone-900 tracking-widest whitespace-nowrap">
                  {namaKru.toUpperCase()} · {currentOutletObj?.nama_outlet || selectedOutlet} · {selectedDivisi} · {sessionToken}
                </div>
              ))}
            </div>

            {/* Top Bar Status Soal & Timer Soal */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-mono text-xs font-bold border border-stone-200">
                    Soal {currentIndex + 1} dari {questions.length}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      currentQ.tipe === 'PILIHAN_GANDA'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : currentQ.tipe === 'ESSAY_HOTS'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {currentQ.tipe === 'PILIHAN_GANDA'
                      ? 'Pilihan Ganda SOP'
                      : currentQ.tipe === 'ESSAY_HOTS'
                      ? 'Studi Kasus Prosedural'
                      : 'Asesmen Karakter Kerja'}
                  </span>
                  {currentQ.kode_sop && (
                    <span className="text-[10px] font-mono text-stone-500 font-bold hidden sm:inline">
                      {currentQ.kode_sop}
                    </span>
                  )}
                </div>

                {/* TIMER SESI UJIAN BADGE */}
                <div
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs transition-all ${
                    totalTimeLeft <= 180
                      ? 'bg-red-50 text-[#96171B] border-red-300 ring-2 ring-red-200 animate-pulse'
                      : totalTimeLeft <= 600
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-stone-50 text-stone-800 border-stone-200'
                  }`}
                >
                  <Clock
                    size={14}
                    className={
                      totalTimeLeft <= 180
                        ? 'text-[#96171B]'
                        : totalTimeLeft <= 600
                        ? 'text-amber-700'
                        : 'text-stone-600'
                    }
                  />
                  <span>
                    Sisa Waktu Sesi: {Math.floor(totalTimeLeft / 60).toString().padStart(2, '0')}:{(totalTimeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Progress Bar Timer Sesi Ujian */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1 font-mono">
                  <span>Progres Sesi Ujian (Bebas Berpindah & Meninjau Soal):</span>
                  <span>
                    {Math.floor(totalTimeLeft / 60)}m {totalTimeLeft % 60}s tersisa ({Math.max(0, Math.round(((totalSessionSeconds - totalTimeLeft) / totalSessionSeconds) * 100))}% selesai)
                  </span>
                </div>
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      totalTimeLeft <= 180
                        ? 'bg-[#96171B]'
                        : totalTimeLeft <= 600
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(0, Math.round(((totalSessionSeconds - totalTimeLeft) / totalSessionSeconds) * 100)))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Peringatan jika sisa waktu sesi menipis */}
            {totalTimeLeft <= 180 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-[#96171B] flex items-center gap-2 animate-pulse">
                <AlertCircle size={15} className="shrink-0 text-[#96171B]" />
                <span>
                  Waktu sesi ujian tersisa kurang dari 3 menit ({Math.floor(totalTimeLeft / 60)}:{((totalTimeLeft % 60)).toString().padStart(2, '0')})! Pastikan seluruh jawaban telah diperiksa sebelum waktu habis.
                </span>
              </div>
            )}

            {/* Card Soal */}
            <div
              onContextMenu={(e) => e.preventDefault()}
              className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6 select-none relative z-10"
            >
              <div>
                <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Topik: {currentQ.topik}
                </div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900 leading-relaxed font-['Outfit']">
                  {currentQ.pertanyaan}
                </h2>
              </div>

              {/* Opsi Pilihan Ganda / Karakteristik Psikologis */}
              {(currentQ.tipe === 'PILIHAN_GANDA' || currentQ.tipe === 'KARAKTERISTIK_PSIKOLOGIS') && currentQ.opsi && (
                <div className="space-y-2.5">
                  {currentQ.opsi.map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, opt.label)}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-[#96171B] bg-rose-50/40 ring-1 ring-[#96171B] shadow-xs'
                            : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[#96171B] text-white' : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <div className="flex-1 text-xs leading-relaxed text-stone-800">
                          {opt.teks}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Format Essay HOTS */}
              {currentQ.tipe === 'ESSAY_HOTS' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-stone-700">
                    Tindakan Prosedural / Uraian Solusi Anda:
                  </label>
                  <textarea
                    rows={5}
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleEssayChange(currentQ.id, e.target.value)}
                    placeholder="Tuliskan langkah tindakan dan verifikasi SOP Anda secara jelas..."
                    className="w-full p-3.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#96171B] focus:ring-1 focus:ring-[#96171B] leading-relaxed"
                  />
                  <p className="text-[11px] text-stone-500">
                    Tips: Jelaskan parameter baku seperti suhu, durasi waktu, atau SOP 5S dalam penjelasan Anda.
                  </p>
                </div>
              )}

              {/* Bottom Navigasi Soal & Tandai Ragu-ragu */}
              <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span>Sebelumnya</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFlaggedQuestions((prev) => ({
                        ...prev,
                        [currentQ.id]: !prev[currentQ.id],
                      }));
                    }}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      flaggedQuestions[currentQ.id]
                        ? 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-300'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Flag
                      size={13}
                      className={flaggedQuestions[currentQ.id] ? 'text-amber-800 fill-amber-700' : 'text-stone-400'}
                    />
                    <span>{flaggedQuestions[currentQ.id] ? 'Ragu-ragu (Ditandai)' : 'Tandai Ragu-ragu'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {currentIndex < questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowConfirmSubmit(true)}
                      className="px-5 py-2 rounded-xl bg-[#96171B] hover:bg-[#7a1215] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      <span>Selesaikan & Kumpulkan</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Grid Navigasi Nomor Soal dengan Status Terinci */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-stone-700">
                  Daftar Kisi Nomor Soal ({questions.length} Butir):
                </div>
                <div className="flex items-center gap-3 text-[10.5px] font-medium text-stone-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                    Terjawab ({Object.keys(answers).length})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" />
                    Ragu-ragu ({Object.values(flaggedQuestions).filter(Boolean).length})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-stone-300 inline-block" />
                    Belum ({Math.max(0, questions.length - Object.keys(answers).length)})
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {questions.map((q, idx) => {
                  const hasAnswer = !!answers[q.id];
                  const isFlagged = !!flaggedQuestions[q.id];
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center transition-all cursor-pointer relative ${
                        isCurrent
                          ? 'bg-[#96171B] text-white ring-2 ring-[#96171B]/30 shadow-xs'
                          : isFlagged
                          ? 'bg-amber-100 text-amber-900 border-2 border-amber-400'
                          : hasAnswer
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Peringatan Integritas / Cheat Modal */}
            {showCheatWarning && (
              <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 border-2 border-amber-400 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <ShieldAlert size={26} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-stone-900">
                      Peringatan Integritas & Keamanan Ujian
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Sistem mendeteksi bahwa layar lembar ujian ditinggalkan atau Anda beralih ke aplikasi/tab lain sebanyak <b className="text-red-700 font-mono text-sm">{tabSwitchCount} kali</b>.
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 text-left space-y-1">
                    <p className="font-bold">Ketentuan Integritas HARA Chicken:</p>
                    <p className="text-stone-700">
                      Seluruh rekam jejak perpindahan layar tercatat otomatis dalam audit log Trainer penilai. Mohon tetap berada di lembar soal hingga selesai.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCheatWarning(false)}
                    className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Saya Mengerti & Lanjutkan Ujian
                  </button>
                </div>
              </div>
            )}

            {/* Modal Konfirmasi Pengumpulan Ujian */}
            {showConfirmSubmit && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-4 animate-in zoom-in-95">
                  <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3">
                    <div className="w-9 h-9 rounded-xl bg-red-50 text-[#96171B] flex items-center justify-center font-bold">
                      <HelpCircle size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-stone-900">
                        Konfirmasi Pengumpulan Lembar Ujian
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Periksa rekap jawaban Anda sebelum finalisasi
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase font-mono">TERJAWAB</div>
                      <div className="text-lg font-black font-mono text-emerald-700">
                        {Object.keys(answers).length} <span className="text-[10px] text-emerald-600">/ {questions.length}</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="text-[10px] font-bold text-amber-800 uppercase font-mono">RAGU-RAGU</div>
                      <div className="text-lg font-black font-mono text-amber-700">
                        {Object.values(flaggedQuestions).filter(Boolean).length}
                      </div>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                      <div className="text-[10px] font-bold text-stone-600 uppercase font-mono">BELUM DIISI</div>
                      <div className="text-lg font-black font-mono text-stone-700">
                        {Math.max(0, questions.length - Object.keys(answers).length)}
                      </div>
                    </div>
                  </div>

                  {questions.length - Object.keys(answers).length > 0 && (
                    <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 flex items-start gap-2">
                      <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                      <span>
                        Masih ada <b>{questions.length - Object.keys(answers).length} butir soal</b> yang belum diisi. Anda masih memiliki sisa waktu <b>{Math.floor(totalTimeLeft / 60)} menit</b>.
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setShowConfirmSubmit(false)}
                      className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Periksa Kembali Soal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowConfirmSubmit(false);
                        handleFinishExam();
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-[#96171B] hover:bg-[#7a1215] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
                    >
                      Kumpulkan Jawaban
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =======================================================================
            TAHAP 3: BUKTI PENYERAHAN UJIAN (KRU TIDAK TAHU HASILNYA / HASIL DIRAHASIAKAN)
            ======================================================================= */}
        {stage === 'result' && submittedReceipt && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-[0_16px_40px_-12px_rgba(28,20,15,0.06)] text-center space-y-6">
              {/* Icon Centang Besar */}
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-mono">
                  TERKIRIM KE SISTEM PUSAT
                </span>
                <h2 className="text-2xl font-bold text-stone-900 mt-3 font-['Outfit']">
                  Ujian Selesai Dikerjakan!
                </h2>
                <p className="text-xs text-stone-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Terima kasih, <b>{submittedReceipt.nama_kru}</b>. Lembar jawaban Anda telah tersimpan dengan aman di database dan langsung diteruskan ke Trainer penilai gerai Anda.
                </p>
              </div>

              {/* Kartu Bukti Tanda Terima Resmi */}
              <div className="max-w-md mx-auto bg-stone-50 rounded-2xl border border-stone-200 p-5 text-left space-y-3">
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono border-b border-stone-200 pb-2 flex items-center justify-between">
                  <span>BUKTI PENYERAHAN RESMI</span>
                  <span className="text-[#96171B]">HC-{submittedReceipt.id.slice(-6).toUpperCase()}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Nama Kru:</span>
                    <span className="font-bold text-stone-900">{submittedReceipt.nama_kru}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Cabang Gerai:</span>
                    <span className="font-semibold text-stone-800">
                      {submittedReceipt.nama_outlet} ({submittedReceipt.kode_outlet})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Stasiun / Divisi:</span>
                    <span className="font-semibold text-stone-800">{submittedReceipt.divisi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Trainer Penilai:</span>
                    <span className="font-bold text-[#96171B]">{submittedReceipt.trainer_penilai}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Jumlah Soal Terjawab:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {submittedReceipt.totalDijawab} dari {submittedReceipt.totalSoal} butir
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Waktu Penyerahan:</span>
                    <span className="font-mono text-stone-700">
                      {new Date(submittedReceipt.tanggal).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informasi Menenangkan Kru Mengenai Hasil */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <Info size={15} className="text-amber-700 shrink-0" />
                  <span>Pemberitahuan Hasil & Sertifikasi:</span>
                </div>
                <p className="text-[11.5px] text-stone-700 leading-relaxed">
                  Sesuai kebijakan evaluasi kompetensi resmi HARA Chicken, skor dan catatan hasil ujian tidak ditampilkan di layar ini dan akan diumumkan langsung oleh Trainer saat sesi briefing / pendampingan gerai.
                </p>
                <p className="text-[11px] text-stone-500 pt-1 border-t border-amber-200/60">
                  Silakan melapor kepada Trainer atau Kepala Gerai Anda bahwa Anda telah menyelesaikan ujian, lalu kembali beraktivitas di stasiun kerja.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="max-w-md mx-auto pt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyReceipt}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedReceipt ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedReceipt ? 'Tersalin!' : 'Salin Bukti WA'}</span>
                </button>

                {onBackToHome && (
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="px-5 py-2.5 rounded-xl bg-[#96171B] hover:bg-[#7a1215] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Selesai & Keluar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D5] bg-white py-3.5 px-4 text-center text-[11px] text-stone-500">
        <div>HARA Chicken Operational Training & Competency Verification • Terintegrasi Cloud Firestore</div>
      </footer>
    </div>
  );
};
