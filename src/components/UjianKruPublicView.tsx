import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock, ArrowLeft, ArrowRight, Check, User, Store,
  CheckCircle2, ChevronRight, ChevronLeft, Copy, Printer, AlertCircle,
  HelpCircle, ChevronDown, CheckSquare, MessageSquare, Bookmark,
  X, Lock, Shield, RotateCcw, Send, FileText, ExternalLink,
  Award, Sparkles, BookOpen, Brain, Zap, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/storage';
import {
  Outlet, Kru, Division, ExamWeek, SoalUjianMingguan, HasilUjianKruMingguan,
  TrainerExamConfig, AppUser, QuestionType
} from '../types';
import { HaraLogo } from './HaraLogo';
import {
  BANK_SOAL_MINGGUAN,
  getSoalUjianByMinggu,
  hitungProfilPsikologis,
  hitungAnalisisPilar,
  hitungCrossValidationStatus,
  ProfilKarakterEvaluasi,
  AnalisisPilarHasil
} from '../data/bankSoalMingguan';

export interface SOPFlashcard {
  id: string;
  category: string;
  station: string;
  question: string;
  keyAnswer: string;
  criticalStandard: string;
  tolerance: string;
}

export const SOP_FLASHCARD_DRILLS: SOPFlashcard[] = [
  {
    id: 'fc-1',
    category: 'Cooking & Thermal Safety',
    station: 'Kitchen & Deep Fryer',
    question: 'Berapa suhu minyak dan durasi penggorengan ayam crispy standar HARA?',
    keyAnswer: 'Suhu kompor 175°C, titik masuk ayam stabil pada 160°C, durasi goreng 12 - 14 menit.',
    criticalStandard: 'Suhu core daging matang wajib mencapai minimal >= 74°C (Food Safe Core Temp). Goyang keranjang fryer tiap 3 menit.',
    tolerance: 'Toleransi suhu minyak saat ayam masuk: 158°C - 162°C. Holding warmer maks 120 menit (60-70°C).'
  },
  {
    id: 'fc-2',
    category: 'Resep Baru RnD 2026',
    station: 'Geprek & Wok',
    question: 'Sebutkan gramatur baku SOP Nasi Goreng Telur (SOP-NasGor-02)?',
    keyAnswer: 'Nasi pera 170g timbang digital, minyak 15ml (1 sendok makan), mix sayur 30g, bumbu ECO 20g timbang.',
    criticalStandard: 'Wajib gunakan 2 slice timun segar dipotong miring 45°. Dilarang menggunakan nasi lembek.',
    tolerance: 'Toleransi gramatur nasi 170g ±3g. Bumbu ECO 20g wajib ditimbang presisi.'
  },
  {
    id: 'fc-3',
    category: 'Saus Spesial RnD 2026',
    station: 'Geprek & Assembly',
    question: 'Bagaimana standar penakaran dan teknik torching Saus Mentai HARA?',
    keyAnswer: 'Takaran 2 solet penuh (±40g) diratakan di atas ayam geprek.',
    criticalStandard: 'Gunakan gas blow torch berjarak 5 - 7 cm dengan api sedang memutar selama 15 - 20 detik sampai caramelized.',
    tolerance: 'Dilarang torch terlalu dekat karena akan menghasilkan aroma gas dan saus gosong pahit.'
  },
  {
    id: 'fc-4',
    category: 'Saus Spesial RnD 2026',
    station: 'Geprek & Assembly',
    question: 'Apa instruksi kritis sebelum menyendok Saus Garlic Ayoli?',
    keyAnswer: 'Saus Ayoli wajib diaduk cepat menggunakan garpu terlebih dahulu agar emulsi stabil.',
    criticalStandard: 'Aduk garpu memastikan tekstur creamy tidak pecah minyak dan aroma bawang putih harum merata.',
    tolerance: 'Garnish dengan taburan peterseli cincang halus dan biji wijen sangrai.'
  },
  {
    id: 'fc-5',
    category: 'Signature Dish',
    station: 'Geprek Cobek Batu',
    question: 'Berapa gramatur sambal bawang HARA dan bagaimana teknik pengolahannya?',
    keyAnswer: 'Gramatur standar 30 gram per porsi ayam geprek.',
    criticalStandard: 'Ulek kasar cabai rawit merah segar & bawang putih kating di cobek batu, lalu siram minyak panas mendidih 160°C.',
    tolerance: 'Dilarang diblender halus menjadi pasta cair. Ayam digeprek 2 - 3 ketukan lembut.'
  },
  {
    id: 'fc-6',
    category: 'Hygiene & Food Safety',
    station: 'Helper & Sanitasi',
    question: 'Sebutkan peruntukan 4 Jenis Lap Warna Resmi HARA (HC-SOP-11-PKP)?',
    keyAnswer: '1) Kanebo: Piring saji; 2) Lap Orange: Meja makan & etalase; 3) Lap Basah Kotak: Meja kompor/kotor; 4) Lap Kering Kotak: Tangan & handle bersih.',
    criticalStandard: 'Pencegahan kontaminasi silang (cross-contamination) 100%. Dilarang menukar peruntukan lap antar area.',
    tolerance: 'Bilas dan rendam sanitizer setiap pergantian shift atau jika lap mulai kotor.'
  },
  {
    id: 'fc-7',
    category: 'Rice Cooker Standards',
    station: 'Kitchen & Helper',
    question: 'Bagaimana rumus takaran air beras Miyako dan aturan holding setelah matang?',
    keyAnswer: '3 cup beras = 4 cup air; 4 cup = 5 cup; 5 cup = 6 cup; 6 cup = 8 cup air.',
    criticalStandard: 'Setelah tombol beralih ke Warm (jegleg), diamkan tertutup tanak 15 menit sebelum diaduk (maks 30 menit di rice cooker gas).',
    tolerance: 'Cuci beras 3 kali hingga bilasan jernih. Porsi saji 170g per piring.'
  },
  {
    id: 'fc-8',
    category: 'K3 & Receiving Gudang',
    station: 'Logistik & Dapur',
    question: 'Berapa batas minimal berat tabung gas LPG datang yang boleh diterima?',
    keyAnswer: 'Tabung 3kg minimal 7.8kg; Tabung 5.5kg minimal 12.4kg; Tabung 12kg minimal 26.8kg.',
    criticalStandard: 'Jika berat timbangan di bawah batas minimal, tabung wajib DITOLAK karena kurang isi dari vendor.',
    tolerance: 'Berat kosong: 3kg = 5kg; 5.5kg = 7.1kg; 12kg = 15kg.'
  },
  {
    id: 'fc-9',
    category: 'Corporate Vision',
    station: 'Budaya & Visi HARA',
    question: 'Sebutkan Visi Resmi HARA Chicken?',
    keyAnswer: 'Menjadi Pelopor Ayam Geprek Tradisional Berkelas Nasional yang dikelola secara Modern dan Profesional dengan Cita Rasa Autentik, Kualitas Terjamin dan Pelayanan Terbaik.',
    criticalStandard: 'Dihayati dan diimplementasikan dalam 12 Perilaku Utama H.A.R.A (Halal, Amanah, Responsif, Adaptif).',
    tolerance: 'Wajib dihafal oleh seluruh insan HARA Chicken dari Kru hingga Manajemen.'
  },
  {
    id: 'fc-10',
    category: 'Closing & Food Waste',
    station: 'Closing Shift',
    question: 'Bahan sisa matang apa saja yang WAJIB ditarik/dilarang dijual besok vs BOLEH disimpan?',
    keyAnswer: 'Wajib Ditarik: Ayam goreng, Tempe, Tahu, Jamur Enoki, Terong, Sup kaldu. Boleh Disimpan Chiller (1-4°C): Spinach, Orange, Adonan Scramble, Teh (maks 12 jam).',
    criticalStandard: 'Bahan hewani dan gorengan berisiko tinggi basi/asam jika disimpan semalaman. Timbang waste closing.',
    tolerance: 'Bahan yang disimpan wajib menggunakan wadah kedap udara bertutup dan berlabel stiker tanggal/jam.'
  }
];

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
  const [outlets] = useState<Outlet[]>(() => db.getTable<Outlet>('outlets'));
  const [kruList] = useState<Kru[]>(() =>
    db.getTable<Kru>('kru').filter((k) => k.status_aktif === 'Aktif')
  );
  const examConfig = useMemo<TrainerExamConfig>(() => db.getExamConfig(), []);

  const trainers = useMemo(() => {
    const users = db.getTable<AppUser>('app_users');
    const filtered = users.filter(
      (u) => u.role === 'Trainer' || u.role === 'Area Supervisor' || u.role === 'Kepala Outlet'
    );
    return filtered.length > 0
      ? filtered
      : [{ id: 'usr-1', nama: 'Haikal Abi', role: 'Trainer Lapangan' }];
  }, []);

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
  const [selectedTrainer] = useState<string>(() => {
    return trainers.length > 0
      ? `${trainers[0].nama} (${trainers[0].role})`
      : 'Haikal Abi (Lead Trainer)';
  });

  const activeExamWeek = useMemo<ExamWeek>(() => {
    if (initialMinggu) return initialMinggu;
    if (examConfig.mode === 'kunci_paket' && examConfig.paket_terkunci) {
      return examConfig.paket_terkunci;
    }
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
        return wMap[found.minggu_aktif] || 'MINGGU_1';
      }
    }
    return examConfig.paket_terkunci || 'MINGGU_1';
  }, [initialMinggu, examConfig, namaKru]);

  // Alur: 'setup' -> 'flashcard' -> 'exam' -> 'result'
  const [stage, setStage] = useState<'setup' | 'flashcard' | 'exam' | 'result'>('setup');
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);

  // Active exam questions
  const [questions, setQuestions] = useState<SoalUjianMingguan[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Section Filter: 'ALL' | 'PILIHAN_GANDA' | 'ESSAY_HOTS' | 'KARAKTERISTIK_PSIKOLOGIS'
  const [activeSectionFilter, setActiveSectionFilter] = useState<'ALL' | QuestionType>('ALL');

  // Timers
  const [totalTimeLeft, setTotalTimeLeft] = useState<number>(30 * 60);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // Remedial Cooldown Timer (30 minutes = 1800s)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Submission Results
  const [submittedRecord, setSubmittedRecord] = useState<HasilUjianKruMingguan | null>(null);
  const [profilPsikometrikResult, setProfilPsikometrikResult] = useState<ProfilKarakterEvaluasi | null>(null);
  const [analisisPilarResult, setAnalisisPilarResult] = useState<AnalisisPilarHasil | null>(null);
  const [wrongQuestionsReview, setWrongQuestionsReview] = useState<SoalUjianMingguan[]>([]);

  // Check existing cooldown on load or crew change
  useEffect(() => {
    if (!namaKru.trim()) return;
    const key = `hara_exam_cooldown_${namaKru.trim().toLowerCase()}`;
    const nextRetry = localStorage.getItem(key);
    if (nextRetry) {
      const remainingSec = Math.ceil((parseInt(nextRetry, 10) - Date.now()) / 1000);
      if (remainingSec > 0) {
        setCooldownRemaining(remainingSec);
      } else {
        localStorage.removeItem(key);
        setCooldownRemaining(0);
      }
    }
  }, [namaKru]);

  // Cooldown countdown tick
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          const key = `hara_exam_cooldown_${namaKru.trim().toLowerCase()}`;
          localStorage.removeItem(key);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining, namaKru]);

  // Exam timer tick
  useEffect(() => {
    if (stage !== 'exam') return;
    if (totalTimeLeft <= 0) {
      handleFinishExam();
      return;
    }
    const timer = setInterval(() => {
      setTotalTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, totalTimeLeft]);

  // Silent tab switch detection
  useEffect(() => {
    if (stage !== 'exam') return;
    const handleVisibilityChange = () => {
      if (document.hidden) setTabSwitchCount((prev) => prev + 1);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [stage]);

  const currentOutletObj = useMemo(() => {
    return outlets.find((o) => o.kode_outlet === selectedOutlet) || outlets[0];
  }, [outlets, selectedOutlet]);

  const outletKruList = useMemo(() => {
    return kruList.filter((k) => k.kode_outlet === selectedOutlet);
  }, [kruList, selectedOutlet]);

  // Questions segmented by 3 sections
  const sections = useMemo(() => {
    const pg = questions.filter(q => q.tipe === 'PILIHAN_GANDA');
    const essay = questions.filter(q => q.tipe === 'ESSAY_HOTS');
    const sjt = questions.filter(q => q.tipe === 'KARAKTERISTIK_PSIKOLOGIS');
    return {
      pg,
      essay,
      sjt,
      pgAnswered: pg.filter(q => !!answers[q.id]).length,
      essayAnswered: essay.filter(q => !!answers[q.id]?.trim()).length,
      sjtAnswered: sjt.filter(q => !!answers[q.id]).length,
    };
  }, [questions, answers]);

  const filteredQuestions = useMemo(() => {
    if (activeSectionFilter === 'ALL') return questions;
    return questions.filter(q => q.tipe === activeSectionFilter);
  }, [questions, activeSectionFilter]);

  const currentQ = questions[currentIndex] || questions[0];

  const handleStartExam = () => {
    if (!namaKru.trim()) {
      alert('Silakan tuliskan nama lengkap Anda.');
      return;
    }

    if (cooldownRemaining > 0) {
      alert(`Anda sedang dalam Jeda Waktu Belajar Mandiri (${Math.ceil(cooldownRemaining / 60)} menit tersisa) sebelum dapat mengulang ujian.`);
      return;
    }

    const pool = getSoalUjianByMinggu(activeExamWeek, selectedDivisi);
    const examQuestions = pool.length > 0 ? pool : BANK_SOAL_MINGGUAN.slice(0, 25);
    setQuestions(examQuestions);

    setCurrentIndex(0);
    setAnswers({});
    setFlaggedQuestions({});

    const durationMinutes = examConfig.durasi_menit && examConfig.durasi_menit >= 15
      ? examConfig.durasi_menit
      : Math.max(25, examQuestions.length);
    setTotalTimeLeft(durationMinutes * 60);

    setStage('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (questionId: string, optionLabel: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionLabel }));
  };

  const handleEssayChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleFinishExam = () => {
    let pgTotal = 0;
    let pgCorrect = 0;
    let essayTotal = 0;
    let essayScoreAccum = 0;
    const wrongList: SoalUjianMingguan[] = [];

    questions.forEach((q) => {
      if (q.tipe === 'PILIHAN_GANDA') {
        pgTotal += q.bobot;
        if (answers[q.id] === q.jawaban_benar) {
          pgCorrect += q.bobot;
        } else {
          wrongList.push(q);
        }
      } else if (q.tipe === 'ESSAY_HOTS') {
        essayTotal += q.bobot;
        const essayAns = (answers[q.id] || '').toLowerCase();
        if (essayAns.trim().length > 15) {
          const keywords = q.kata_kunci_essay || [];
          const hits = keywords.filter((k) => essayAns.includes(k.toLowerCase())).length;
          const ratio = keywords.length > 0 ? Math.min(1, hits / Math.max(2, keywords.length * 0.6)) : 0.8;
          essayScoreAccum += Math.round(q.bobot * ratio);
        } else {
          wrongList.push(q);
        }
      }
    });

    const skorPG = pgTotal > 0 ? Math.round((pgCorrect / pgTotal) * 100) : 85;
    const skorEssay = essayTotal > 0 ? Math.round((essayScoreAccum / essayTotal) * 100) : 80;
    const skorAkhir = Math.round((skorPG * 0.6) + (skorEssay * 0.4));
    const passed = skorAkhir >= (examConfig.passing_grade || 75);

    const profilKarakter = hitungProfilPsikologis(answers);
    const analisisPilar = hitungAnalisisPilar(answers, questions);

    // Cross validation check (Tes Psikologi vs Attitude Lapangan Standar 82)
    const crossVal = hitungCrossValidationStatus(profilKarakter.skor_rata_rata, 82);

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
      minggu: activeExamWeek,
      mingguNomor: weekNumMap[activeExamWeek],
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
        inisiatif_kepemimpinan: profilKarakter.inisiatif_kepemimpinan,
        skor_rata_rata: profilKarakter.skor_rata_rata,
        archetype_name: profilKarakter.archetype_name,
        red_flag_detected: profilKarakter.red_flag_detected,
        red_flag_notes: profilKarakter.red_flag_notes,
        rekomendasi_stasiun: profilKarakter.rekomendasi_stasiun,
        panduan_bimbingan_sm: profilKarakter.panduan_bimbingan_sm,
        cross_validation_status: crossVal,
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
      catatan_trainer: `Ujian mandiri diserahkan oleh ${namaKru}. Status: ${passed ? 'LULUS' : 'REMEDIAL'}.`,
      jumlah_pindah_tab: tabSwitchCount,
      created_at: timestampStr,
    };

    db.saveHasilUjianMingguan(examRecord);

    // Remedial Cooldown 30 Menit jika < 75
    if (!passed) {
      const cooldownSec = 30 * 60; // 30 minutes
      const nextTime = Date.now() + cooldownSec * 1000;
      localStorage.setItem(`hara_exam_cooldown_${namaKru.trim().toLowerCase()}`, nextTime.toString());
      setCooldownRemaining(cooldownSec);

      // Auto-trigger TNA & Coaching
      const wrongTopics: string[] = [];
      if (analisisPilar?.pilar_terendah) wrongTopics.push(analisisPilar.pilar_terendah);
      if (analisisPilar?.materi_rekomendasi) {
        if (Array.isArray(analisisPilar.materi_rekomendasi)) {
          wrongTopics.push(...analisisPilar.materi_rekomendasi);
        } else {
          wrongTopics.push(String(analisisPilar.materi_rekomendasi));
        }
      }
      db.triggerAutoRemedialAndTNA({
        nama_kru: namaKru.trim(),
        kode_outlet: selectedOutlet,
        divisi: selectedDivisi === 'Semua' ? 'Kitchen' : selectedDivisi,
        skor: skorAkhir,
        topikSalah: wrongTopics.length > 0 ? wrongTopics : ['SOP Penggorengan 175°C / 160°C & Titik Kritis'],
        sumberTemuan: `Ujian Online Mingguan (${activeExamWeek} - Skor ${skorAkhir}/100)`,
        catatan: `Remedial Terbimbing. Jeda belajar 30 menit diaktifkan.`,
      });
    }

    setSubmittedRecord(examRecord);
    setProfilPsikometrikResult(profilKarakter);
    setAnalisisPilarResult(analisisPilar);
    setWrongQuestionsReview(wrongList);
    setShowConfirmSubmit(false);
    setStage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUnlockCooldownTrainer = () => {
    localStorage.removeItem(`hara_exam_cooldown_${namaKru.trim().toLowerCase()}`);
    setCooldownRemaining(0);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyReceipt = () => {
    if (!submittedRecord) return;
    const msg = `*LEMBAR BUKTI HASIL EVALUASI KRU HARA CHICKEN*
No. Registrasi: ${submittedRecord.id}
Nama Kru: ${submittedRecord.nama_kru}
Outlet: ${submittedRecord.nama_outlet || submittedRecord.kode_outlet}
Divisi: ${submittedRecord.divisi}
Skor Kognitif Teori: ${submittedRecord.skor_akhir_komposit}/100 (${submittedRecord.status_kelulusan.toUpperCase()})
Indeks Psikometri 6D: ${submittedRecord.profil_psikologis?.skor_rata_rata || 86}%
Archetype Karakter: ${submittedRecord.profil_psikologis?.archetype_name || 'Guardian of Standard'}
Tanggal: ${new Date(submittedRecord.tanggal).toLocaleDateString('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})} WIB

_Tersimpan resmi di sistem PT HARA Chicken Indonesia._`;

    navigator.clipboard.writeText(msg).then(() => {
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 3000);
    });
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181411] flex flex-col justify-between selection:bg-[#96171B] selection:text-white">
      {/* Top Header */}
      <header className="bg-white border-b border-[#E6E1DA] sticky top-0 z-30 shadow-[0_1px_3px_rgba(24,20,17,0.04)]">
        <div className="max-w-5xl w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HaraLogo size="sm" variant="horizontal" />
            <div className="hidden sm:block h-4 w-px bg-[#E6E1DA]" />
            <span className="hidden sm:inline text-xs font-semibold text-[#645D55]">
              Portal Ujian Mandiri & Asesmen Karakter Kru
            </span>
          </div>

          <div className="flex items-center gap-3">
            {stage === 'exam' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-[#96171B] font-mono text-xs font-bold">
                <Clock size={13} className="text-[#96171B]" />
                <span>{formatTimer(totalTimeLeft)}</span>
              </div>
            )}

            {stage !== 'exam' && onGoToAdminLogin && (
              <button
                type="button"
                onClick={onGoToAdminLogin}
                className="text-xs font-semibold text-[#645D55] hover:text-[#96171B] px-3 py-1.5 rounded-xl border border-[#E6E1DA] hover:border-[#96171B]/40 hover:bg-red-50/30 transition-all inline-flex items-center gap-1.5"
              >
                <Shield size={13} className="text-[#96171B]" />
                <span>Portal Staf / Trainer</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-10 flex flex-col justify-center">
        
        {/* ===================================================================
            TAHAP 1: FORM PENDAFTARAN PESERTA UJIAN (CLEAN MINIMALIS)
            =================================================================== */}
        {stage === 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full max-w-lg mx-auto"
          >
            <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] p-6 sm:p-9 space-y-6">
              
              <div className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-red-50 text-[#96171B] mb-3 border border-red-100">
                  <User size={22} />
                </div>
                <h1 className="text-xl font-bold text-[#181411] tracking-tight">
                  Lembar Ujian Kompetensi Kru
                </h1>
                <p className="text-xs text-[#645D55] mt-1">
                  Evaluasi Terpadu: Teori SOP (25%), Kasus Praktik HOTS, & Asesmen Karakter Kerja SJT
                </p>
              </div>

              {/* Cooldown Active Alert */}
              {cooldownRemaining > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <Clock size={16} className="text-amber-700 animate-spin" />
                    <span>Jeda Belajar Mandiri Sebelum Remedial Aktif</span>
                  </div>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    Sistem memberikan jeda 30 menit agar Anda mempelajari kembali materi SOP yang belum dikuasai sebelum mengulang ujian.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-sm font-black text-amber-950">
                      Sisa Waktu: {formatTimer(cooldownRemaining)}
                    </span>
                    <button
                      type="button"
                      onClick={handleUnlockCooldownTrainer}
                      className="text-[10px] text-amber-900 underline hover:font-bold"
                      title="Buka kunci segera untuk keperluan verifikasi trainer"
                    >
                      Buka Kunci (Trainer Override)
                    </button>
                  </div>
                </div>
              )}

              {/* Form Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#181411] mb-1.5">
                    Nama Lengkap Kru <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={namaKru}
                    onChange={(e) => setNamaKru(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] text-sm text-[#181411] placeholder-[#645D55]/60 focus:outline-none focus:border-[#96171B] focus:ring-2 focus:ring-[#96171B]/15 bg-[#FAF8F5]/50 hover:bg-white focus:bg-white transition-all"
                  />

                  {outletKruList.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[11px] text-[#645D55]">Pilih terdaftar:</span>
                      {outletKruList.slice(0, 3).map((k) => (
                        <button
                          key={k.id}
                          type="button"
                          onClick={() => {
                            setNamaKru(k.nama_kru);
                            setSelectedDivisi(k.divisi);
                          }}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-[#FAF8F5] hover:bg-red-50 text-[#645D55] hover:text-[#96171B] border border-[#E6E1DA] transition-colors"
                        >
                          {k.nama_kru}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#181411] mb-1.5">
                    Cabang Outlet <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedOutlet}
                    onChange={(e) => setSelectedOutlet(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] text-sm text-[#181411] focus:outline-none focus:border-[#96171B] focus:ring-2 focus:ring-[#96171B]/15 bg-[#FAF8F5]/50 hover:bg-white focus:bg-white transition-all"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.kode_outlet}>
                        {o.nama_outlet} ({o.kode_outlet})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#181411] mb-1.5">
                    Spesialisasi Stasiun Kerja <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedDivisi}
                    onChange={(e) => setSelectedDivisi(e.target.value as Division)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E1DA] text-sm text-[#181411] focus:outline-none focus:border-[#96171B] focus:ring-2 focus:ring-[#96171B]/15 bg-[#FAF8F5]/50 hover:bg-white focus:bg-white transition-all"
                  >
                    <option value="Kitchen">Kitchen & Fryer (Deep Fryer 175°C / Minyak 160°C)</option>
                    <option value="Geprek">Geprek & Sambal Bawang (Cobek 30g + Minyak Panas)</option>
                    <option value="Kasir">Kasir & POS ESB (Layanan Tamu 5S & Cash)</option>
                    <option value="Helper">Helper & Sanitasi (Disiplin 4 Warna Lap & K3)</option>
                  </select>
                </div>
              </div>

              {/* Cooldown Alert Banner jika kru masih dalam masa tunggu */}
              {cooldownRemaining > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                      <Clock size={15} className="text-rose-700" />
                      Masa Tunggu Cooldown: {formatTimer(cooldownRemaining)}
                    </span>
                    <button
                      type="button"
                      onClick={handleUnlockCooldownTrainer}
                      className="text-[10px] text-rose-800 underline hover:font-bold"
                    >
                      Buka Kunci Trainer
                    </button>
                  </div>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    Ujian sebelumnya belum mencapai KKM 75. Silakan manfaatkan waktu 30 menit ini untuk mengulang materi SOP menggunakan Flashcard Drill:
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFlashcardIndex(0);
                      setIsCardFlipped(false);
                      setStage('flashcard');
                    }}
                    className="w-full py-2 rounded-lg bg-white border border-rose-300 text-rose-800 font-bold text-xs hover:bg-rose-100/50 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} className="text-amber-600" />
                    Buka Flashcard Drill Selama Cooldown
                  </button>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleStartExam}
                  disabled={!namaKru.trim() || cooldownRemaining > 0}
                  className="w-full py-3 px-4 rounded-xl bg-[#96171B] hover:bg-[#7A1216] active:bg-[#600E12] text-white font-semibold text-sm shadow-[0_1px_3px_rgba(24,20,17,0.04)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Mulai Ujian Sekarang</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFlashcardIndex(0);
                    setIsCardFlipped(false);
                    setStage('flashcard');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F4F1EC] text-stone-800 border border-[#E6E1DA] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles size={15} className="text-amber-600" />
                  <span>Smart SOP Flashcard Drill (Latihan Kilat)</span>
                </button>
              </div>

              <div className="text-center pt-1">
                <p className="text-[11px] text-[#645D55]">
                  Standar Kelulusan KKM: <span className="font-bold text-[#181411]">75 Poin</span> • Waktu Pengerjaan: 30 Menit
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            TAHAP INTERAKTIF: SMART SOP FLASHCARD DRILL
            Latihan mandiri sebelum ujian atau selama masa tunggu cooldown
            =================================================================== */}
        {stage === 'flashcard' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full max-w-xl mx-auto space-y-4"
          >
            {/* Top Navigation Bar Flashcard */}
            <div className="flex items-center justify-between bg-white border border-[#E6E1DA] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FEF2F2] text-[#96171B] border border-[#FECACA] flex items-center justify-center font-bold text-xs font-mono">
                  {flashcardIndex + 1}
                </span>
                <div>
                  <h3 className="text-xs font-bold uppercase text-[#181411]">
                    Flashcard SOP {flashcardIndex + 1} dari {SOP_FLASHCARD_DRILLS.length}
                  </h3>
                  <span className="text-[10px] text-stone-500 font-medium">
                    {SOP_FLASHCARD_DRILLS[flashcardIndex].station}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStage('setup')}
                className="text-xs font-bold text-stone-600 hover:text-[#96171B] px-3 py-1.5 rounded-lg border border-[#E6E1DA] hover:bg-[#FAF8F5] transition-colors"
              >
                Kembali ke Form Ujian
              </button>
            </div>

            {/* Interactive 3D Flip Card */}
            <div
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="bg-white border-2 border-[#E6E1DA] hover:border-[#96171B]/50 transition-all rounded-3xl p-6 sm:p-8 shadow-sm cursor-pointer min-h-[300px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] border border-[#E6E1DA] text-stone-700">
                    {SOP_FLASHCARD_DRILLS[flashcardIndex].category}
                  </span>
                  <span className="text-[10px] font-bold text-[#96171B] flex items-center gap-1">
                    <RotateCcw size={12} />
                    {isCardFlipped ? 'Klik untuk Lihat Pertanyaan' : 'Klik untuk Lihat Jawaban Baku'}
                  </span>
                </div>

                {!isCardFlipped ? (
                  /* FRONT: PERTANYAAN */
                  <div className="space-y-4 pt-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                      Pertanyaan Parameter SOP:
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold font-['Outfit'] text-[#181411] leading-snug">
                      "{SOP_FLASHCARD_DRILLS[flashcardIndex].question}"
                    </h2>
                    <p className="text-xs text-stone-400 italic">
                      Ingat kembali SOP dan titik kritis sebelum membalik kartu...
                    </p>
                  </div>
                ) : (
                  /* BACK: JAWABAN BAKU & TITIK KRITIS */
                  <div className="space-y-3 pt-2 animate-in fade-in">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                      ✓ Jawaban Baku Resmi HARA:
                    </span>
                    <p className="text-sm font-bold text-[#181411] bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl leading-relaxed">
                      {SOP_FLASHCARD_DRILLS[flashcardIndex].keyAnswer}
                    </p>

                    <div className="bg-[#FAF8F5] border border-[#E6E1DA] p-3 rounded-xl space-y-1.5 text-xs">
                      <div className="font-bold text-[#96171B] flex items-center gap-1.5">
                        <AlertTriangle size={13} />
                        Titik Kritis SOP:
                      </div>
                      <p className="text-stone-700 leading-relaxed text-[11px]">
                        {SOP_FLASHCARD_DRILLS[flashcardIndex].criticalStandard}
                      </p>
                    </div>

                    <div className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-200/60">
                      <span className="font-bold text-stone-700">Standar Toleransi: </span>
                      {SOP_FLASHCARD_DRILLS[flashcardIndex].tolerance}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress & Flip Action */}
              <div className="pt-6 border-t border-[#E6E1DA] flex items-center justify-between text-xs text-stone-500">
                <span>Kartu {flashcardIndex + 1} dari {SOP_FLASHCARD_DRILLS.length}</span>
                <span className="font-bold text-[#96171B] underline">
                  {isCardFlipped ? 'Tampilkan Sisi Depan' : 'Buka Kunci Jawaban'}
                </span>
              </div>
            </div>

            {/* Bottom Controls: Prev / Next */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  if (flashcardIndex > 0) {
                    setFlashcardIndex(flashcardIndex - 1);
                    setIsCardFlipped(false);
                  }
                }}
                disabled={flashcardIndex === 0}
                className="flex-1 py-2.5 rounded-xl border border-[#E6E1DA] bg-white font-bold text-xs text-stone-700 hover:bg-[#FAF8F5] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
              >
                <ChevronLeft size={16} />
                <span>Kartu Sebelumnya</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (flashcardIndex < SOP_FLASHCARD_DRILLS.length - 1) {
                    setFlashcardIndex(flashcardIndex + 1);
                    setIsCardFlipped(false);
                  } else {
                    setStage('setup');
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#96171B] hover:bg-[#7A1215] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>{flashcardIndex === SOP_FLASHCARD_DRILLS.length - 1 ? 'Selesai Latihan' : 'Kartu Selanjutnya'}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            TAHAP 2: RUANG ASESMEN MODERN BEBAS DISTRAKSI (ZEN MODE)
            Dengan 3 Bagian: PG SOP, Essay HOTS, & Asesmen Karakter SJT
            =================================================================== */}
        {stage === 'exam' && currentQ && (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full max-w-2xl mx-auto space-y-4"
          >
            {/* 3-Section Progress Bar */}
            <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] p-3.5 flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveSectionFilter('PILIHAN_GANDA')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-center font-bold transition-all ${
                  activeSectionFilter === 'PILIHAN_GANDA' || currentQ.tipe === 'PILIHAN_GANDA'
                    ? 'bg-red-50 text-[#96171B] border border-red-200'
                    : 'text-[#645D55] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="text-[10px] uppercase font-semibold text-[#645D55]">Bagian 1</div>
                <div>PG SOP ({sections.pgAnswered}/{sections.pg.length})</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSectionFilter('ESSAY_HOTS')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-center font-bold transition-all ${
                  activeSectionFilter === 'ESSAY_HOTS' || currentQ.tipe === 'ESSAY_HOTS'
                    ? 'bg-red-50 text-[#96171B] border border-red-200'
                    : 'text-[#645D55] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="text-[10px] uppercase font-semibold text-[#645D55]">Bagian 2</div>
                <div>Essay HOTS ({sections.essayAnswered}/{sections.essay.length})</div>
              </button>

              <button
                type="button"
                onClick={() => setActiveSectionFilter('KARAKTERISTIK_PSIKOLOGIS')}
                className={`flex-1 py-1.5 px-2 rounded-xl text-center font-bold transition-all ${
                  activeSectionFilter === 'KARAKTERISTIK_PSIKOLOGIS' || currentQ.tipe === 'KARAKTERISTIK_PSIKOLOGIS'
                    ? 'bg-red-50 text-[#96171B] border border-red-200'
                    : 'text-[#645D55] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="text-[10px] uppercase font-semibold text-[#645D55]">Bagian 3</div>
                <div>SJT Karakter ({sections.sjtAnswered}/{sections.sjt.length})</div>
              </button>
            </div>

            {/* Main Question Card */}
            <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] p-6 sm:p-8">
              
              {/* Question Header */}
              <div className="space-y-3 pb-5 border-b border-[#E6E1DA]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#96171B] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg">
                      Nomor {currentIndex + 1} dari {questions.length}
                    </span>
                    <span className="text-xs text-[#645D55]">
                      ({currentQ.tipe === 'PILIHAN_GANDA' ? 'Pilihan Ganda SOP' : currentQ.tipe === 'ESSAY_HOTS' ? 'Kasus Essay HOTS' : 'Asesmen Karakter SJT'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFlaggedQuestions((prev) => ({
                          ...prev,
                          [currentQ.id]: !prev[currentQ.id],
                        }))
                      }
                      className={`text-xs px-2.5 py-1 rounded-xl border transition-colors flex items-center gap-1 ${
                        flaggedQuestions[currentQ.id]
                          ? 'border-amber-300 bg-amber-50 text-amber-800'
                          : 'border-[#E6E1DA] text-[#645D55] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <Bookmark size={12} className={flaggedQuestions[currentQ.id] ? 'fill-amber-600' : ''} />
                      <span className="hidden sm:inline">Ragu-ragu</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowQuestionGrid(!showQuestionGrid)}
                      className="text-xs px-2.5 py-1 rounded-xl border border-[#E6E1DA] text-[#181411] hover:bg-[#FAF8F5] transition-colors"
                    >
                      Daftar Soal
                    </button>
                  </div>
                </div>

                {/* Linear Thin Progress */}
                <div className="w-full h-1.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E6E1DA]">
                  <div
                    className="h-full bg-[#96171B] transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="py-6">
                <p className="text-base sm:text-lg font-medium text-[#181411] leading-relaxed">
                  {currentQ.pertanyaan}
                </p>
                {currentQ.skenario_konteks && (
                  <div className="mt-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] text-xs text-[#645D55] leading-relaxed">
                    <span className="font-bold text-[#181411]">Skenario Lapangan:</span> {currentQ.skenario_konteks}
                  </div>
                )}
              </div>

              {/* Options for Multiple Choice or SJT */}
              {(currentQ.tipe === 'PILIHAN_GANDA' || currentQ.tipe === 'KARAKTERISTIK_PSIKOLOGIS') && currentQ.opsi && (
                <div className="space-y-2.5">
                  {currentQ.opsi.map((opsi) => {
                    const isSelected = answers[currentQ.id] === opsi.label;
                    return (
                      <button
                        key={opsi.label}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, opsi.label)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'border-[#96171B] bg-red-50/50 text-[#181411] font-medium ring-1 ring-[#96171B] shadow-xs'
                            : 'border-[#E6E1DA] hover:border-[#96171B]/40 bg-white hover:bg-[#FAF8F5] text-[#181411]'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-[#96171B] text-white'
                              : 'bg-[#FAF8F5] text-[#645D55] border border-[#E6E1DA]'
                          }`}
                        >
                          {opsi.label}
                        </div>
                        <span className="text-sm leading-relaxed">{opsi.teks}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Textarea for HOTS Essay */}
              {currentQ.tipe === 'ESSAY_HOTS' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#645D55]">
                    Uraikan langkah analisis & penanganan Anda sesuai SOP Baku:
                  </label>
                  <textarea
                    rows={4}
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleEssayChange(currentQ.id, e.target.value)}
                    placeholder="Jelaskan secara terperinci (misal: suhu kompor 175°C, suhu minyak 160°C, timer 12 menit, core temp ≥74°C, gramatur sambal 30g)..."
                    className="w-full p-3.5 rounded-xl border border-[#E6E1DA] text-sm text-[#181411] focus:outline-none focus:border-[#96171B] focus:ring-2 focus:ring-[#96171B]/15 bg-[#FAF8F5]/50 hover:bg-white focus:bg-white transition-all leading-relaxed"
                  />
                </div>
              )}

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#E6E1DA]">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl border border-[#E6E1DA] hover:bg-[#FAF8F5] text-[#181411] text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  <span>Sebelumnya</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-5 py-2 rounded-xl bg-[#96171B] hover:bg-[#7A1216] text-white text-sm font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <span>Lanjut</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmit(true)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={16} />
                    <span>Kumpulkan Ujian</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Question Grid Drawer */}
            {showQuestionGrid && (
              <div className="bg-white rounded-2xl border border-[#E6E1DA] p-4 shadow-[0_1px_3px_rgba(24,20,17,0.04)]">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA] mb-3">
                  <span className="text-xs font-bold text-[#181411]">Navigasi Nomor Soal ({answeredCount}/{questions.length} Dijawab)</span>
                  <button
                    type="button"
                    onClick={() => setShowQuestionGrid(false)}
                    className="text-[#645D55] hover:text-[#181411]"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {questions.map((q, idx) => {
                    const isDone = !!answers[q.id];
                    const isCurrent = idx === currentIndex;
                    const isFlagged = flaggedQuestions[q.id];
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setCurrentIndex(idx);
                          setShowQuestionGrid(false);
                        }}
                        className={`h-9 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-[#96171B] text-white ring-2 ring-[#96171B]/30'
                            : isFlagged
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-[#FAF8F5] text-[#645D55] border border-[#E6E1DA] hover:bg-slate-100'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ===================================================================
            TAHAP 3: LAYAR RAPOR HASIL & PROFIL PSIKOLOGI INSTAN (DUAL-ENGINE)
            =================================================================== */}
        {stage === 'result' && submittedRecord && profilPsikometrikResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-full max-w-2xl mx-auto space-y-5"
          >
            {/* Header Status Card */}
            <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] p-6 sm:p-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border ${
                  submittedRecord.skor_akhir_komposit >= 75
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {submittedRecord.skor_akhir_komposit >= 75 ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
                </div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#181411]">
                  {submittedRecord.skor_akhir_komposit >= 75 ? 'Selamat, Anda Lulus Evaluasi!' : 'Ujian Memerlukan Remedial'}
                </h2>
                <p className="text-xs text-[#645D55] mt-1">
                  Hasil instan asesmen kognitif SOP dan profil psikometri kerja HARA Chicken
                </p>
              </div>

              {/* Dual-Scoring Big Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA]">
                  <div className="text-[11px] font-bold text-[#645D55] uppercase">Mesin 1 — Skor Kognitif SOP</div>
                  <div className="text-3xl font-black text-[#181411] mt-1">
                    {submittedRecord.skor_akhir_komposit}
                    <span className="text-sm font-semibold text-[#645D55]"> / 100</span>
                  </div>
                  <div className="text-[11px] text-[#645D55] mt-1">
                    PG: {submittedRecord.skor_pilihan_ganda} • Essay: {submittedRecord.skor_essay}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA]">
                  <div className="text-[11px] font-bold text-[#645D55] uppercase">Mesin 2 — Indeks Karakter SJT</div>
                  <div className="text-3xl font-black text-[#96171B] mt-1">
                    {profilPsikometrikResult.skor_rata_rata}
                    <span className="text-sm font-semibold text-[#645D55]"> %</span>
                  </div>
                  <div className="text-[11px] text-[#645D55] mt-1">
                    6 Dimensi Perilaku Kerja
                  </div>
                </div>
              </div>

              {/* Archetype & Station Placement Card */}
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/80 text-left space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#96171B]">Tipe Karakter Kerja:</span>
                  <span className="font-extrabold text-[#96171B] bg-white px-2.5 py-0.5 rounded-full border border-red-200">
                    {profilPsikometrikResult.archetype_name}
                  </span>
                </div>
                <p className="text-[#181411] leading-relaxed">
                  <strong>Rekomendasi Stasiun:</strong> {profilPsikometrikResult.rekomendasi_stasiun}
                </p>
                <p className="text-[#645D55] text-[11px]">
                  <strong>Panduan Kepala Outlet:</strong> {profilPsikometrikResult.panduan_bimbingan_sm}
                </p>
              </div>

              {/* 6 Psychometric Dimensions Visual Bars */}
              <div className="text-left pt-2 space-y-2">
                <h4 className="text-xs font-bold text-[#181411] uppercase tracking-wider">
                  Profil 6 Dimensi Karakter Kerja
                </h4>
                <div className="space-y-2">
                  {[
                    { label: 'Integritas & Anti-Fraud', val: profilPsikometrikResult.integritas },
                    { label: 'Ketahanan Stres Rush Hour', val: profilPsikometrikResult.ketahanan_stres },
                    { label: 'Disiplin SOP & Higienitas', val: profilPsikometrikResult.disiplin_sop },
                    { label: 'Kolaborasi Tim Lintas Stasiun', val: profilPsikometrikResult.kerjasama_tim },
                    { label: 'Fokus Pelanggan 5S / L.A.S.T', val: profilPsikometrikResult.fokus_pelanggan },
                    { label: 'Inisiatif Kepemimpinan & Solo Shift', val: profilPsikometrikResult.inisiatif_kepemimpinan },
                  ].map((dim) => (
                    <div key={dim.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#645D55] font-medium">{dim.label}</span>
                        <span className="font-bold text-[#181411] font-mono">{dim.val}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#FAF8F5] rounded-full border border-[#E6E1DA] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#96171B] to-[#C88A1E] rounded-full"
                          style={{ width: `${dim.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remedial Study Mode (If score < 75) */}
              {submittedRecord.skor_akhir_komposit < 75 && (
                <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-left space-y-3">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                    <Clock size={18} className="text-amber-700" />
                    <span>Mode Belajar Mandiri Sebelum Remedial</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Sistem memberlakukan jeda waktu belajar selama 30 menit. Silakan pelajari ringkasan materi SOP berikut atau buka Flashcard Drill:
                  </p>
                  
                  {/* Standard SOP Quick Summary */}
                  <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1.5 text-xs text-slate-800">
                    <div className="font-bold text-[#96171B]">Catatan Kunci Standar Mutu HARA:</div>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#645D55]">
                      <li><strong>Suhu Deep Fryer:</strong> Setelan kompor 175°C, titik masuk ayam stabil pada 160°C.</li>
                      <li><strong>Waktu Menggoreng:</strong> Tepat 12 menit (goyang keranjang per 3 menit), core temp &gt;= 74°C.</li>
                      <li><strong>Holding Time Warmer:</strong> Maksimal 120 menit (suhu 60°C–70°C).</li>
                      <li><strong>Gramatur Sambal Bawang:</strong> 30 gram diuleg cobek batu asli disiram minyak panas 160°C.</li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFlashcardIndex(0);
                      setIsCardFlipped(false);
                      setStage('flashcard');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#96171B] hover:bg-[#7A1215] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Sparkles size={14} className="text-amber-400" />
                    Buka Smart SOP Flashcard Drill (Latihan Remedial)
                  </button>

                  <div className="flex items-center justify-between text-xs font-mono text-amber-950 pt-1">
                    <span>Countdown Jeda: {formatTimer(cooldownRemaining)}</span>
                    <button
                      type="button"
                      onClick={handleUnlockCooldownTrainer}
                      className="text-[11px] text-amber-800 underline hover:font-bold"
                    >
                      Buka Kunci (Trainer Override)
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 space-y-2.5">
                <button
                  type="button"
                  onClick={handleCopyReceipt}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Copy size={15} />
                  <span>{copiedReceipt ? 'Tersalin!' : 'Salin Bukti Hasil ke WhatsApp'}</span>
                </button>

                {onBackToHome && (
                  <button
                    type="button"
                    onClick={onBackToHome}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#E6E1DA] hover:bg-[#FAF8F5] text-[#181411] font-semibold text-sm transition-colors"
                  >
                    Kembali ke Beranda
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="bg-white rounded-2xl border border-[#E6E1DA] shadow-xl max-w-sm w-full p-6 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-[#96171B] flex items-center justify-center mx-auto border border-red-100">
                <CheckSquare size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#181411]">Kumpulkan Lembar Ujian?</h3>
                <p className="text-xs text-[#645D55] mt-1">
                  Anda telah menjawab <span className="font-bold text-[#181411]">{answeredCount}</span> dari{' '}
                  <span className="font-bold text-[#181411]">{questions.length}</span> butir soal.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 py-2 rounded-xl border border-[#E6E1DA] text-[#645D55] text-xs font-semibold hover:bg-[#FAF8F5]"
                >
                  Periksa Lagi
                </button>
                <button
                  type="button"
                  onClick={handleFinishExam}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  Ya, Kumpulkan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-[#645D55]">
        © 2026 PT HARA CHICKEN INDONESIA • Standar Operasional & Evaluasi Terpadu
      </footer>
    </div>
  );
};
