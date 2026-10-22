import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Clock, Play, Pause, RotateCcw, CheckCircle2, AlertTriangle,
  Scale, Thermometer, ShieldCheck, Award, FileText, Search,
  ChevronRight, ArrowUpRight, Check, X, Filter, RefreshCw,
  UserCheck, Utensils, Sparkles, Building2, Layers, Download
} from 'lucide-react';
import { db } from '../lib/storage';
import { Kru, PenilaianPraktik, Division } from '../types';

interface PenilaianPraktikViewProps {
  selectedOutletCode: string;
}

interface OperationalSOPStandard {
  divisi: Division;
  judul: string;
  targetSosDetik: number;
  toleransiSosLabel: string;
  isTempRequired: boolean;
  targetTemp?: number;
  isGramRequired: boolean;
  targetGrams?: number;
  keterangan: string;
  rubrikLangkah: {
    no: number;
    judul: string;
    deskripsi: string;
    kunciKepatuhan: string;
  }[];
}

const OPERATIONAL_SOP_STANDARDS: Record<Division, OperationalSOPStandard> = {
  Kasir: {
    divisi: 'Kasir',
    judul: 'SOP Kasir POS ESB Lite & Speed of Service (SOS)',
    targetSosDetik: 90,
    toleransiSosLabel: 'Greeting < 5 dtk • Transaksi 60–90 dtk',
    isTempRequired: false,
    isGramRequired: false,
    keterangan: 'Greeting ramah 5S (< 5 dtk), input POS ESB tepat, upselling promo, pembayaran non-tunai/tunai, penanganan komplain LAST.',
    rubrikLangkah: [
      {
        no: 1,
        judul: 'Greeting 5S HARA & Response Time',
        deskripsi: 'Menyapa tamu dengan senyum, salam, sapa dalam waktu kurang dari 5 detik saat tamu tiba di depan meja kasir.',
        kunciKepatuhan: 'Response time < 5 detik, eye contact hangat, seragam & celemek rapi.'
      },
      {
        no: 2,
        judul: 'Kecepatan & Akurasi Input POS ESB',
        deskripsi: 'Memasukkan item pesanan, varian sambal, dan take-away/dine-in tanpa salah input menu.',
        kunciKepatuhan: 'Durasi transaksi 60–90 detik, konfirmasi ulang item pesanan ke tamu.'
      },
      {
        no: 3,
        judul: 'Inisiatif Upselling & Penawaran Menu',
        deskripsi: 'Menawarkan produk pendamping (Es Teh Jumbo, Ekstra Kulit, Sup Sayur) secara persuasif dan natural.',
        kunciKepatuhan: 'Menyebutkan minimal 1 item add-on resmi promo gerai.'
      },
      {
        no: 4,
        judul: 'Penyelesaian Transaksi & Struk Belanja',
        deskripsi: 'Menerima pembayaran tunai/QRIS, menyerahkan struk dan nomor antrean dengan sopan.',
        kunciKepatuhan: 'Uang kembalian tepat, struk tercetak jelas, ucapan terima kasih HARA.'
      }
    ]
  },
  Geprek: {
    divisi: 'Geprek',
    judul: 'SOP Perakitan Ayam Geprek & Packing SOS',
    targetSosDetik: 90,
    toleransiSosLabel: 'Target Assembly 60–90 dtk per porsi',
    isTempRequired: false,
    isGramRequired: true,
    targetGrams: 30,
    keterangan: 'Ulek sambal cobek batu (dilarang blender), timbang sambal 30g Zero/Tare, geprek ayam 2 ketukan, 2 slice timun 45°, packing rapi.',
    rubrikLangkah: [
      {
        no: 1,
        judul: 'Teknik Ulek Sambal Otentik di Cobek',
        deskripsi: 'Mengulek cabai rawit merah segar dan bawang putih di cobek batu secara kasar berkarakter (Kill-Switch: DILARANG diblender!).',
        kunciKepatuhan: 'Tekstur sambal kasar berbulir, minyak panas tersiram merata.'
      },
      {
        no: 2,
        judul: 'Akurasi Gramatur Sambal 30 Gram',
        deskripsi: 'Menimbang sambal menggunakan timbangan digital Zero/Tare sebelum dilumurkan ke ayam.',
        kunciKepatuhan: 'Toleransi 28–32 gram per porsi, tidak menggunakan takaran kira-kira.'
      },
      {
        no: 3,
        judul: 'Teknik Geprek & Topping Resmi',
        deskripsi: 'Menggeprek ayam krispi 2-3 ketukan hingga pipih tanpa hancur berantakan. Topping keju diparut langsung di atas piring/box (dilarang di cobek).',
        kunciKepatuhan: 'Bentuk ayam tetap utuh estetis, saus mentai di-torch harum (angkat pakai 2 solet).'
      },
      {
        no: 4,
        judul: 'Plating Dine-In & Packing Take-Away',
        deskripsi: 'Menata nasi pulen, ayam geprek sambal, dan wajib 2 slice timun segar potong miring 45 derajat.',
        kunciKepatuhan: 'Piring melamin bebas cipratan minyak, box take-away beralas plastik/kertas nasi rapi.'
      }
    ]
  },
  Kitchen: {
    divisi: 'Kitchen',
    judul: 'SOP Penggorengan Deep Fryer & Holding Display',
    targetSosDetik: 720,
    toleransiSosLabel: 'Waktu Goreng 12 Mnt (Suhu 160°C stabil)',
    isTempRequired: true,
    targetTemp: 160,
    isGramRequired: false,
    keterangan: 'Suhu fryer 160°C kompor 175°C, penepungan 2x cubit berputar, goreng 12 mnt goyang tiap 3 mnt, core >= 74°C, warmer maks 120 mnt.',
    rubrikLangkah: [
      {
        no: 1,
        judul: 'Kalibrasi Suhu Minyak Deep Fryer',
        deskripsi: 'Memastikan minyak fryer stabil pada 160°C (kompor 175°C) menggunakan termometer probe sebelum ayam masuk.',
        kunciKepatuhan: 'Suhu minyak terukur 158–162°C, minyak disaring bebas remah gosong.'
      },
      {
        no: 2,
        judul: 'Teknik Penepungan 2x Celup Berputar',
        deskripsi: 'Mengaduk ayam dalam tepung breader HARA 2 kali celupan dengan teknik angkat-putar tanpa ditekan bantat.',
        kunciKepatuhan: 'Tepung keriting mekar merata, ketuk keranjang sebelum masuk minyak.'
      },
      {
        no: 3,
        judul: 'Siklus Goreng 12 Menit & Goyang Tiap 3 Menit',
        deskripsi: 'Menggoreng ayam selama 12 menit tepat, menggoyang keranjang fryer tiap 3 menit agar ayam tidak menempel.',
        kunciKepatuhan: 'Warna golden brown merata, buih minyak mereda saat matang.'
      },
      {
        no: 4,
        judul: 'Pemeriksaan Core Temperature & Holding Warmer',
        deskripsi: 'Menancapkan probe termometer ke bagian daging terdalam dekat tulang. Suhu internal wajib >= 74°C tanpa darah.',
        kunciKepatuhan: 'Core >= 74°C, holding display warmer maks 120 menit berstiker timer.'
      }
    ]
  },
  Helper: {
    divisi: 'Helper',
    judul: 'SOP Sanitasi 4 Warna Lap & Clean-up Meja SOS',
    targetSosDetik: 120,
    toleransiSosLabel: 'Clean-up Meja Tamu < 2 Menit (120 dtk)',
    isTempRequired: false,
    isGramRequired: false,
    keterangan: 'Response time meja checkout < 2 mnt, disiplin 4 warna lap (Kanebo, Orange, Basah, Kering), K3 & pembuangan sampah terpilah.',
    rubrikLangkah: [
      {
        no: 1,
        judul: 'Response Time Clean-up Meja < 2 Menit',
        deskripsi: 'Membersihkan meja dan mengangkat sisa makanan segera setelah tamu meninggalkan area makan gerai.',
        kunciKepatuhan: 'Kecepatan response < 2 menit, tidak membiarkan meja kotor menumpuk saat rush hour.'
      },
      {
        no: 2,
        judul: 'Kepatuhan Zonasi 4 Warna Lap HARA',
        deskripsi: 'Menggunakan lap sesuai peruntukan: Kanebo (kaca/dispenser), Orange (meja makan), Basah desinfektan, Kering (final polish).',
        kunciKepatuhan: 'Dilarang mencampur lap meja dengan lap lantai/kaca. Lap dicuci berkala.'
      },
      {
        no: 3,
        judul: 'Sanitasi Kursi, Meja & Penataan Ulang',
        deskripsi: 'Menyemprotkan cairan food-grade sanitizer, mengelap kering, merapikan posisi kursi dan wadah bumbu.',
        kunciKepatuhan: 'Permukaan meja kering tidak lengket, kursi sejajar rapi.'
      },
      {
        no: 4,
        judul: 'Pengelolaan Sampah Terpilah & Lantai Bersih',
        deskripsi: 'Membuang sisa makanan ke tempat sampah organik, sisa plastik/kertas ke anorganik, memastikan lantai kering bebas licin.',
        kunciKepatuhan: 'Tempat sampah tertutup tidak overload, lantai bersih bebas risiko K3 terpeleset.'
      }
    ]
  }
};

export const PenilaianPraktikView: React.FC<PenilaianPraktikViewProps> = ({ selectedOutletCode }) => {
  // Master kru operasional cabang
  const [kruList, setKruList] = useState<Kru[]>(() => {
    try {
      const all = db.getTable<Kru>('kru').filter((k) => k && k.status_aktif === 'Aktif');
      return all;
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<PenilaianPraktik[]>(() => {
    try {
      return db.getTable<PenilaianPraktik>('penilaian_praktik').filter(Boolean);
    } catch {
      return [];
    }
  });

  // Filter & Form Selection
  const [selectedDivisi, setSelectedDivisi] = useState<Division>('Kasir');
  const [selectedKruId, setSelectedKruId] = useState<string>('');
  const [searchKruQuery, setSearchKruQuery] = useState<string>('');

  // Active SOP Standard
  const currentStandard = OPERATIONAL_SOP_STANDARDS[selectedDivisi] || OPERATIONAL_SOP_STANDARDS.Kasir;

  // Filter kru by outlet & division
  const filteredKruList = useMemo(() => {
    return kruList.filter((k) => {
      const matchOutlet = selectedOutletCode === 'ALL' || k.kode_outlet === selectedOutletCode;
      const matchDivisi = k.divisi === selectedDivisi;
      const matchSearch = searchKruQuery
        ? k.nama_kru.toLowerCase().includes(searchKruQuery.toLowerCase())
        : true;
      return matchOutlet && matchDivisi && matchSearch;
    });
  }, [kruList, selectedOutletCode, selectedDivisi, searchKruQuery]);

  // Set default selected kru
  useEffect(() => {
    if (filteredKruList.length > 0) {
      if (!filteredKruList.some((k) => k.id === selectedKruId)) {
        setSelectedKruId(filteredKruList[0].id);
      }
    } else {
      setSelectedKruId('');
    }
  }, [filteredKruList, selectedKruId]);

  const activeKru = useMemo(() => {
    return kruList.find((k) => k.id === selectedKruId) || null;
  }, [kruList, selectedKruId]);

  // Stopwatch SOS State
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleResetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  // Rubrik Langkah Scores (Skala 1 - 3 per langkah)
  const [stepScores, setStepScores] = useState<Record<number, number>>({
    0: 3,
    1: 3,
    2: 3,
    3: 3
  });

  // Technical Measurements
  const [measuredTemp, setMeasuredTemp] = useState<number>(160);
  const [measuredGrams, setMeasuredGrams] = useState<number>(30);
  const [catatanTrainer, setCatatanTrainer] = useState<string>('');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Perhitungan Skor Akhir Komposit (0 - 100 pt)
  const calculatedScore = useMemo(() => {
    const scoreValues: number[] = Object.values(stepScores);
    if (scoreValues.length === 0) return 0;
    const totalEarned = scoreValues.reduce((sum: number, v: number) => sum + v, 0);
    const maxEarned = currentStandard.rubrikLangkah.length * 3;
    let baseScore = Math.round((totalEarned / maxEarned) * 100);

    // Penalti Waktu SOS jika melebihi batas toleransi
    if (seconds > 0 && seconds > currentStandard.targetSosDetik * 1.3) {
      baseScore = Math.max(0, baseScore - 10);
    }

    // Penalti Suhu Minyak jika di luar rentang standar pada Kitchen
    if (currentStandard.isTempRequired && (measuredTemp < 155 || measuredTemp > 165)) {
      baseScore = Math.max(0, baseScore - 10);
    }

    // Penalti Gramatur jika di luar rentang standar pada Geprek
    if (currentStandard.isGramRequired && (measuredGrams < 25 || measuredGrams > 35)) {
      baseScore = Math.max(0, baseScore - 10);
    }

    return Math.min(100, Math.max(0, baseScore));
  }, [stepScores, seconds, currentStandard, measuredTemp, measuredGrams]);

  // Status & Grade Operasional
  const evaluationGrade = useMemo(() => {
    if (calculatedScore >= 85) {
      return { grade: 'Grade A', label: 'Mahir (Kandidat Promosi / Leader)', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
    }
    if (calculatedScore >= 75) {
      return { grade: 'Grade B', label: 'Kompeten (Lulus Standar QSR / PKWT)', badge: 'bg-sky-50 text-sky-800 border-sky-300' };
    }
    if (calculatedScore >= 60) {
      return { grade: 'Grade C', label: 'Pembinaan (Pipeline Retraining & GROW)', badge: 'bg-amber-50 text-amber-800 border-amber-300' };
    }
    return { grade: 'Remedial', label: 'Remedial (Wajib Evaluasi Ulang Pre/Post)', badge: 'bg-rose-50 text-rose-800 border-rose-300' };
  }, [calculatedScore]);

  // Format detik ke MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simpan Penilaian Praktik
  const handleSaveEvaluation = () => {
    if (!activeKru) {
      alert('Pilih personil kru yang dinilai terlebih dahulu.');
      return;
    }

    const newRecord: Partial<PenilaianPraktik> = {
      tanggal: new Date().toISOString(),
      nama_kru: activeKru.nama_kru,
      kru_id: activeKru.id,
      kode_outlet: activeKru.kode_outlet,
      sop_terkait: currentStandard.judul,
      detail_skor_langkah: Object.values(stepScores),
      waktu_detik: seconds > 0 ? seconds : currentStandard.targetSosDetik,
      target_detik: currentStandard.targetSosDetik,
      suhu_minyak: currentStandard.isTempRequired ? measuredTemp : undefined,
      gramatur: currentStandard.isGramRequired ? measuredGrams : undefined,
      skor_akhir: calculatedScore,
      catatan: catatanTrainer || `Uji Praktik SOS ${selectedDivisi}: Skor ${calculatedScore}/100 (${evaluationGrade.grade}).`,
    };

    // 1. Simpan ke storage tabel penilaian_praktik (otomatis sinkron ke Cloud Firestore)
    const saved = db.insertRow<PenilaianPraktik>('penilaian_praktik', newRecord);
    setHistory((prev) => [saved, ...prev]);

    // 2. Jika skor < 75, otomatis picu Auto-Trigger Remedial & TNA (Closed-Loop Workflow)
    if (calculatedScore < 75) {
      db.triggerAutoRemedialAndTNA({
        nama_kru: activeKru.nama_kru,
        kru_id: activeKru.id,
        kode_outlet: activeKru.kode_outlet,
        divisi: selectedDivisi,
        skor: calculatedScore,
        sumberTemuan: `Uji Praktik SOS Stasiun ${selectedDivisi}`,
        catatan: `Evaluasi praktik operasional belum memenuhi KKM (Skor: ${calculatedScore}/100, Waktu: ${seconds}s). Butuh retraining dan coaching GROW.`
      });
    }

    setSaveFeedback(`Hasil evaluasi praktik untuk "${activeKru.nama_kru}" berhasil disimpan ke sistem Cloud! Skor: ${calculatedScore}/100.`);
    setTimeout(() => setSaveFeedback(null), 4000);

    // Reset Stopwatch
    setIsRunning(false);
    setSeconds(0);
    setCatatanTrainer('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Feedback Banner */}
      {saveFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Form Observasi & Stopwatch SOS (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 1. Pemilihan Divisi & Kru Operasional */}
          <div className="p-5 rounded-xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6E1DA]">
              <div>
                <span className="text-[10px] font-bold text-[#96171B] uppercase tracking-wider font-['Outfit']">
                  Pilar 2 • Praktik Lapangan (Bobot 40%)
                </span>
                <h3 className="font-bold text-[#181411] text-base font-['Outfit'] mt-0.5">
                  Observasi Praktik Stasiun & Stopwatch SOS
                </h3>
              </div>

              {/* Division Selector Pills */}
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E6E1DA]">
                {(['Kasir', 'Geprek', 'Kitchen', 'Helper'] as Division[]).map((div) => (
                  <button
                    key={div}
                    type="button"
                    onClick={() => {
                      setSelectedDivisi(div);
                      handleResetTimer();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedDivisi === div
                        ? 'bg-[#96171B] text-white shadow-xs'
                        : 'text-[#57504A] hover:text-[#181411]'
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>

            {/* Kru Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#57504A] uppercase mb-1">
                  Pilih Kru Operasional ({selectedDivisi})
                </label>
                {filteredKruList.length > 0 ? (
                  <select
                    value={selectedKruId}
                    onChange={(e) => setSelectedKruId(e.target.value)}
                    className="w-full bg-white border border-[#E6E1DA] rounded-xl px-3 py-2 text-xs font-bold text-[#181411] focus:outline-none focus:border-[#96171B]"
                  >
                    {filteredKruList.map((kru) => (
                      <option key={kru.id} value={kru.id}>
                        {kru.nama_kru} ({kru.kode_outlet} • Level: {kru.level_kompetensi || 'Trainee'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
                    Tidak ada kru aktif divisi {selectedDivisi} pada outlet ini.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#57504A] uppercase mb-1">
                  Cari Nama Personil
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Ketik nama personil..."
                    value={searchKruQuery}
                    onChange={(e) => setSearchKruQuery(e.target.value)}
                    className="w-full bg-white border border-[#E6E1DA] rounded-xl pl-8 pr-3 py-2 text-xs text-[#181411] focus:outline-none focus:border-[#96171B]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Stopwatch Speed of Service (SOS) */}
          <div className="p-5 rounded-xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#57504A] uppercase tracking-wider">
                  Target Speed of Service (SOS)
                </span>
                <h4 className="text-sm font-bold text-[#181411] mt-0.5">
                  {currentStandard.toleransiSosLabel}
                </h4>
              </div>

              {/* Status Durasi SOS */}
              <div className="text-right">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    seconds === 0
                      ? 'bg-stone-100 text-stone-600 border-stone-200'
                      : seconds <= currentStandard.targetSosDetik
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : seconds <= currentStandard.targetSosDetik * 1.3
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  {seconds === 0
                    ? 'Timer Siap'
                    : seconds <= currentStandard.targetSosDetik
                    ? 'Sesuai Standar SOS'
                    : seconds <= currentStandard.targetSosDetik * 1.3
                    ? 'Toleransi Waktu'
                    : 'Overdue / Lambat'}
                </span>
              </div>
            </div>

            {/* Stopwatch Display */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white border border-[#E6E1DA] text-[#96171B] shadow-2xs">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black font-['JetBrains_Mono'] text-[#181411] tracking-tight">
                    {formatTime(seconds)}
                  </div>
                  <div className="text-[11px] text-[#57504A] font-medium">
                    Target Baku: {formatTime(currentStandard.targetSosDetik)} ({currentStandard.targetSosDetik} dtk)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                    isRunning
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-[#96171B] hover:bg-[#7A1215] text-white'
                  }`}
                >
                  {isRunning ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isRunning ? 'Pause Timer' : 'Mulai Stopwatch'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="px-3 py-2 rounded-xl border border-[#E6E1DA] bg-white hover:bg-stone-50 text-[#57504A] text-xs font-bold transition-colors flex items-center gap-1"
                  title="Reset Stopwatch"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Input Parameter Teknis (Suhu / Gramatur) */}
            {(currentStandard.isTempRequired || currentStandard.isGramRequired) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentStandard.isTempRequired && (
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#181411]">
                      <span className="flex items-center gap-1 text-amber-700">
                        <Thermometer size={14} /> Suhu Probe Minyak Deep Fryer
                      </span>
                      <span className="font-['JetBrains_Mono'] font-bold text-amber-800">
                        {measuredTemp}°C
                      </span>
                    </div>
                    <input
                      type="range"
                      min={140}
                      max={180}
                      value={measuredTemp}
                      onChange={(e) => setMeasuredTemp(Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500 font-medium">
                      <span>Batas Bawah 155°C</span>
                      <span className="font-bold text-amber-800">Target Resmi 160°C</span>
                      <span>Batas Atas 165°C</span>
                    </div>
                  </div>
                )}

                {currentStandard.isGramRequired && (
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#181411]">
                      <span className="flex items-center gap-1 text-[#96171B]">
                        <Scale size={14} /> Timbangan Sambal Bawang (Zero/Tare)
                      </span>
                      <span className="font-['JetBrains_Mono'] font-bold text-[#96171B]">
                        {measuredGrams}g
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={45}
                      value={measuredGrams}
                      onChange={(e) => setMeasuredGrams(Number(e.target.value))}
                      className="w-full accent-[#96171B] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-500 font-medium">
                      <span>Min 25g</span>
                      <span className="font-bold text-[#96171B]">Standar Porsi 30g</span>
                      <span>Maks 35g</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Rubrik Penilaian Langkah Kerja (Skala 1 - 3 per Langkah) */}
          <div className="p-5 rounded-xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
              <div>
                <span className="text-[10px] font-bold text-[#96171B] uppercase tracking-wider font-['Outfit']">
                  Rubrik Penilaian Objektif
                </span>
                <h4 className="font-bold text-[#181411] text-sm font-['Outfit'] mt-0.5">
                  Langkah Baku Pelaksanaan SOP {selectedDivisi}
                </h4>
              </div>
              <span className="text-[11px] font-bold text-stone-500">
                Skala Nilai: 1 (Kurang) • 2 (Standar) • 3 (Mahir)
              </span>
            </div>

            <div className="space-y-3">
              {currentStandard.rubrikLangkah.map((langkah, idx) => {
                const currentScore = stepScores[idx] || 3;
                return (
                  <div
                    key={langkah.no}
                    className="p-3.5 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#96171B] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {langkah.no}
                        </span>
                        <div>
                          <h5 className="font-bold text-xs text-[#181411]">
                            {langkah.judul}
                          </h5>
                          <p className="text-[11px] text-[#57504A] mt-0.5 leading-relaxed">
                            {langkah.deskripsi}
                          </p>
                        </div>
                      </div>

                      {/* Skor Selector Pills (1, 2, 3) */}
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                        {[1, 2, 3].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setStepScores((prev) => ({ ...prev, [idx]: val }))}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                              currentScore === val
                                ? val === 3
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : val === 2
                                  ? 'bg-amber-600 text-white shadow-2xs'
                                  : 'bg-rose-600 text-white shadow-2xs'
                                : 'bg-white border border-[#E6E1DA] text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-[10.5px] text-stone-500 font-medium bg-white p-2 rounded-lg border border-[#E6E1DA]">
                      <b>Kunci Kepatuhan:</b> {langkah.kunciKepatuhan}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Catatan Trainer */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-[11px] font-bold text-[#57504A] uppercase">
                Catatan Observasi & Tindakan Perbaikan Trainer
              </label>
              <textarea
                rows={2}
                value={catatanTrainer}
                onChange={(e) => setCatatanTrainer(e.target.value)}
                placeholder="Catatan kelebihan atau kekurangan teknik kerja kru..."
                className="w-full p-3 rounded-xl border border-[#E6E1DA] text-xs text-[#181411] focus:outline-none focus:border-[#96171B]"
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Rangkuman Skor & Simpan (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Kartu Skor Komposit Terkalkulasi */}
          <div className="p-6 rounded-xl bg-white border border-[#E6E1DA] shadow-xs text-center space-y-4">
            <span className="text-[10px] font-bold text-[#57504A] uppercase tracking-wider">
              Skor Praktik Operasional Terkalkulasi
            </span>

            <div>
              <div className="text-5xl font-black font-['JetBrains_Mono'] text-[#96171B]">
                {calculatedScore}
              </div>
              <div className="text-xs text-stone-400 font-medium mt-1">
                Skala Penilaian 0 - 100 pt
              </div>
            </div>

            <div className="pt-2">
              <span className={`inline-block px-3 py-1.5 rounded-xl border text-xs font-bold ${evaluationGrade.badge}`}>
                {evaluationGrade.grade} • {evaluationGrade.label}
              </span>
            </div>

            {/* Rincian Parameter */}
            <div className="space-y-2 pt-3 border-t border-[#E6E1DA] text-xs text-left">
              <div className="flex items-center justify-between text-[#57504A]">
                <span>Durasi Waktu SOS:</span>
                <span className="font-bold text-[#181411] font-['JetBrains_Mono']">{formatTime(seconds)}</span>
              </div>
              {currentStandard.isTempRequired && (
                <div className="flex items-center justify-between text-[#57504A]">
                  <span>Suhu Deep Fryer:</span>
                  <span className="font-bold text-[#181411] font-['JetBrains_Mono']">{measuredTemp}°C</span>
                </div>
              )}
              {currentStandard.isGramRequired && (
                <div className="flex items-center justify-between text-[#57504A]">
                  <span>Gramatur Sambal:</span>
                  <span className="font-bold text-[#181411] font-['JetBrains_Mono']">{measuredGrams}g</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[#57504A]">
                <span>KKM Kelulusan:</span>
                <span className="font-bold text-stone-700">75 Poin</span>
              </div>
            </div>

            {/* Tombol Simpan */}
            <button
              type="button"
              onClick={handleSaveEvaluation}
              disabled={!activeKru}
              className="w-full py-3 rounded-xl bg-[#96171B] hover:bg-[#7A1215] disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <CheckCircle2 size={16} />
              <span>Simpan Evaluasi Praktik ({activeKru?.nama_kru || 'Pilih Kru'})</span>
            </button>
          </div>

          {/* Rangkuman 4 Pilar Sistem Operasional */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-2 text-xs">
            <div className="font-bold text-[#181411] flex items-center gap-1.5">
              <Layers size={14} className="text-[#96171B]" />
              <span>Struktur Bobot 4 Pilar Operasional</span>
            </div>
            <p className="text-[11px] text-[#57504A] leading-relaxed">
              Hasil uji praktik ini menyumbang <b>40%</b> dari nilai komposit kru cabang. Sisa 60% berasal dari Ujian Teori (20%), Uji Lisan HACCP (15%), dan Sikap Budaya H.A.R.A (25%).
            </p>
          </div>
        </div>
      </div>

      {/* 4. Tabel Riwayat Penilaian Praktik Kru Cabang */}
      <div className="p-5 rounded-xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#96171B] uppercase tracking-wider font-['Outfit']">
              Database Cloud Real-Time
            </span>
            <h4 className="font-bold text-[#181411] text-sm font-['Outfit'] mt-0.5">
              Riwayat Evaluasi Praktik Operasional Cabang
            </h4>
          </div>
          <span className="text-xs font-bold text-stone-500 font-['JetBrains_Mono']">
            {history.length} Catatan Tersimpan
          </span>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-y border-[#E6E1DA] text-[10px] font-bold text-[#57504A] uppercase tracking-wider font-['Outfit']">
                <tr>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Nama Kru</th>
                  <th className="py-2.5 px-3">Outlet</th>
                  <th className="py-2.5 px-3">SOP Terkait</th>
                  <th className="py-2.5 px-3">Durasi SOS</th>
                  <th className="py-2.5 px-3">Pengukuran</th>
                  <th className="py-2.5 px-3">Skor Akhir</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1DA]">
                {history.slice(0, 15).map((item, idx) => {
                  const isPass = item.skor_akhir >= 75;
                  return (
                    <tr key={item.id || idx} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-['JetBrains_Mono'] text-stone-500 whitespace-nowrap">
                        {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#181411] whitespace-nowrap">
                        {item.nama_kru}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 whitespace-nowrap">
                        {item.kode_outlet}
                      </td>
                      <td className="py-2.5 px-3 text-[#57504A] max-w-xs truncate" title={item.sop_terkait}>
                        {item.sop_terkait}
                      </td>
                      <td className="py-2.5 px-3 font-['JetBrains_Mono'] text-stone-700 whitespace-nowrap">
                        {item.waktu_detik} dtk {item.target_detik ? `(Target ${item.target_detik}s)` : ''}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 whitespace-nowrap font-['JetBrains_Mono']">
                        {item.suhu_minyak ? `${item.suhu_minyak}°C ` : ''}
                        {item.gramatur ? `${item.gramatur}g` : ''}
                        {!item.suhu_minyak && !item.gramatur ? '-' : ''}
                      </td>
                      <td className="py-2.5 px-3 font-bold font-['JetBrains_Mono'] text-[#96171B] whitespace-nowrap">
                        {item.skor_akhir} / 100
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPass
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {isPass ? 'Kompeten' : 'Remedial'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-stone-400 text-xs font-medium">
            Belum ada catatan evaluasi praktik operasional tersimpan.
          </div>
        )}
      </div>
    </div>
  );
};
