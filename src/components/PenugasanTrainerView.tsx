import React, { useState, useEffect, useMemo } from 'react';
import {
  UserCheck, Plus, Search, Filter, Calendar, Clock,
  Store, Users, FileText, CheckCircle2, AlertTriangle,
  ArrowRight, Sparkles, MapPin, Award, ChevronRight,
  TrendingUp, Download, Eye, Edit3, Trash2, X, Check,
  QrCode, Printer, Phone, Briefcase, Flame, Shield,
  HelpCircle, Copy, BookOpen, Target, GraduationCap,
  CheckSquare, FileSpreadsheet, RefreshCw, Star, Brain,
  Wrench, Sliders, Calculator, BarChart2
} from 'lucide-react';
import { db } from '../lib/storage';
import {
  PenugasanTrainer, TipePenugasan, StatusPenugasan, ShiftTugas,
  Outlet, Kru, Division, AppUser, TraineeRecord, StatusOJT,
  TipeBimbingan, LaporanTrainerOutlet, BankSOP
} from '../types';
import { HaraLogo } from './HaraLogo';
import { OfficialDocumentHeader } from './OfficialDocumentHeader';
import { TrainerAssessmentModal } from './trainer/TrainerAssessmentModal';
import { OfficialReportViewModal } from './trainer/OfficialReportViewModal';
import { OfficialCertificateModal } from './trainer/OfficialCertificateModal';
import { PageHeaderBanner } from './PageHeaderBanner';

interface PenugasanTrainerViewProps {
  selectedOutletCode: string;
  onSelectOutletCode?: (code: string) => void;
}

// 5 Indikator Teori Baku (Bobot 20 pt per item = Max 100)
const KRITERIA_TEORI_BAKU = [
  {
    id: 't-1',
    label: 'Parameter Suhu & Gramasi Baku',
    deskripsi: 'Menguasai suhu kompor/deep fryer, gramasi bumbu, takaran minyak, dan porsi bahan resmi SOP.',
  },
  {
    id: 't-2',
    label: 'Urutan & Alur Prosedur Kerja',
    deskripsi: 'Memahami urutan tahapan kerja dari persiapan, proses memasak/meracik, hingga penyelesaian.',
  },
  {
    id: 't-3',
    label: 'Holding Time & Sistem FIFO/FEFO',
    deskripsi: 'Memahami batas simpan produk matang di warmer/showcase dan rotasi bahan baku FIFO.',
  },
  {
    id: 't-4',
    label: 'Food Safety, Sanitasi & APD',
    deskripsi: 'Memahami standar kebersihan personal, cuci tangan, pemakaian seragam/apron/topi, dan pemisahan lap.',
  },
  {
    id: 't-5',
    label: 'Troubleshooting & Respon Kritis',
    deskripsi: 'Mampu menjelaskan tindakan cepat saat gas membeku, minyak berbusa, atau komplain pesanan.',
  },
];

// 5 Aspek Budaya RESPECT (Skala 1 - 5 = Max 25 -> 100 pt)
const ASPEK_ATTITUDE_RESPECT = [
  {
    key: 'R',
    nama: 'Religious & Integritas',
    deskripsi: 'Amanah, jujur dalam takaran/uang, menjaga etika sopan santun dan menjauhi kecurangan.',
  },
  {
    key: 'P',
    nama: 'Professional & Grooming',
    deskripsi: 'Seragam lengkap sesuai jadwal, rambut/kuku bersih rapi, sepatu hitam, tanpa aksesoris terlarang.',
  },
  {
    key: 'E',
    nama: 'Effective & Efficient',
    deskripsi: 'Bekerja cekatan, tidak main HP/bermalas-malasan saat shift, inisiatif menjaga kebersihan area.',
  },
  {
    key: 'C',
    nama: 'Collaboration & Teamwork',
    deskripsi: 'Komunikasi santun, sigap membantu rekan saat rush hour, patuh dan tanggap instruksi Kapten.',
  },
  {
    key: 'T',
    nama: 'To Time, To Team, To System',
    deskripsi: 'Hadir tepat waktu (10-15 mnt awal), ramah senyum 5S ke pelanggan, taat sistem SOP tanpa potong kompas.',
  },
];

export const PenugasanTrainerView: React.FC<PenugasanTrainerViewProps> = ({
  selectedOutletCode,
  onSelectOutletCode,
}) => {
  // Main sub-tabs
  const [activeMainTab, setActiveMainTab] = useState<'trainee' | 'laporan' | 'penugasan'>('trainee');

  // Master Data
  const [traineeList, setTraineeList] = useState<TraineeRecord[]>([]);
  const [laporanList, setLaporanList] = useState<LaporanTrainerOutlet[]>([]);
  const [penugasanList, setPenugasanList] = useState<PenugasanTrainer[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [kruList, setKruList] = useState<Kru[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [bankSop, setBankSop] = useState<any[]>([]);

  // Filter & Search
  const [outletFilter, setOutletFilter] = useState<string>(selectedOutletCode || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusOjtFilter, setStatusOjtFilter] = useState<StatusOJT | 'ALL'>('ALL');
  const [divisiFilter, setDivisiFilter] = useState<Division | 'ALL'>('ALL');

  // Trainee Modal Form State
  const [isTraineeModalOpen, setIsTraineeModalOpen] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState<TraineeRecord | null>(null);
  const [traineeFormData, setTraineeFormData] = useState<{
    kode_outlet: string;
    trainer_nama: string;
    nama_kru: string;
    divisi: Division;
    tipe_bimbingan: TipeBimbingan;
    sop_fokus: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    skor_awal: number;
    skor_akhir: number;
    status_ojt: StatusOJT;
    catatan_trainer: string;
  }>({
    kode_outlet: selectedOutletCode !== 'ALL' ? selectedOutletCode : 'HC-JTS01',
    trainer_nama: 'Haikal Abi',
    nama_kru: '',
    divisi: 'Kitchen',
    tipe_bimbingan: 'Pendampingan OJT Kru Baru',
    sop_fokus: 'Standar Penggorengan Ayam Crispy & Suhu Minyak (170°C)',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_selesai: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    skor_awal: 70,
    skor_akhir: 88,
    status_ojt: 'Sedang Berjalan',
    catatan_trainer: '',
  });

  // Laporan Modal State
  const [isLaporanModalOpen, setIsLaporanModalOpen] = useState(false);
  const [selectedReportToView, setSelectedReportToView] = useState<LaporanTrainerOutlet | null>(null);
  const [copiedReportId, setCopiedReportId] = useState<string | null>(null);
  const [laporanFormData, setLaporanFormData] = useState<{
    kode_outlet: string;
    trainer_nama: string;
    periode_awal: string;
    periode_akhir: string;
    jenis_kegiatan: string;
    ringkasan_perbantuan: string;
    kendala_outlet: string;
    rekomendasi_kepala_outlet: string;
  }>({
    kode_outlet: selectedOutletCode !== 'ALL' ? selectedOutletCode : 'HC-JTS01',
    trainer_nama: 'Haikal Abi',
    periode_awal: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    periode_akhir: new Date().toISOString().split('T')[0],
    jenis_kegiatan: 'Pendampingan OJT & Perbantuan Operasional Cabang',
    ringkasan_perbantuan: 'Melakukan asistensi jam sibuk (peak hour) stasiun kitchen serta melatih 2 kru baru agar mandiri.',
    kendala_outlet: 'Peralatan deep fryer perlu kalibrasi termometer berkala setiap shift pagi.',
    rekomendasi_kepala_outlet: 'Lakukan evaluasi checklist harian sebelum buka gerai dan pertahankan briefing 5 menit.',
  });

  // Penugasan On-Site Modal
  const [isPenugasanModalOpen, setIsPenugasanModalOpen] = useState(false);
  const [editingPenugasan, setEditingPenugasan] = useState<PenugasanTrainer | null>(null);
  const [selectedLetterItem, setSelectedLetterItem] = useState<PenugasanTrainer | null>(null);
  const [penugasanFormData, setPenugasanFormData] = useState({
    trainer_nama: 'Haikal Abi',
    trainer_kontak: '0812-8899-2341',
    kode_outlet: selectedOutletCode !== 'ALL' ? selectedOutletCode : 'HC-JTS01',
    tipe_penugasan: 'Pendampingan & OJT' as TipePenugasan,
    fokus_divisi: 'Kitchen' as Division | 'Semua Divisi',
    shift_kerja: 'Shift Pagi' as ShiftTugas,
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_selesai: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    tujuan_tugas: 'Pendampingan kru baru & standarisasi penggorengan suhu 170°C.',
    daftar_kru_didampingi: '',
    target_output: 'Seluruh kru dampingan lulus evaluasi mandiri skor >85.',
    status: 'Berjalan' as StatusPenugasan,
  });

  // =========================================================================
  // OBJECTIVE ASSESSMENT RUBRIC CALCULATOR STATE (TEORI, PRAKTIK, ATTITUDE)
  // =========================================================================
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [assessingTrainee, setAssessingTrainee] = useState<TraineeRecord | null>(null);
  const [assessmentTarget, setAssessmentTarget] = useState<'awal' | 'akhir'>('akhir');
  const [assessmentActiveTab, setAssessmentActiveTab] = useState<'teori' | 'praktik' | 'attitude' | 'ringkasan'>('teori');
  const [praktikEvalMode, setPraktikEvalMode] = useState<'jobdesk_topics' | 'step_detail'>('jobdesk_topics');
  const [selectedDetailSopId, setSelectedDetailSopId] = useState<string>('');
  
  const [assessmentTeoriScores, setAssessmentTeoriScores] = useState<Record<number, number>>({
    0: 20, 1: 20, 2: 15, 3: 20, 4: 15
  });
  const [assessmentJobdeskTopicScores, setAssessmentJobdeskTopicScores] = useState<Record<string, number>>({});
  const [assessmentPraktikScores, setAssessmentPraktikScores] = useState<Record<number, number>>({
    0: 2, 1: 2, 2: 2, 3: 2, 4: 2, 5: 2
  });
  const [assessmentSpeedScore, setAssessmentSpeedScore] = useState<number>(2); // 0-3
  const [assessmentHygieneScore, setAssessmentHygieneScore] = useState<number>(3); // 0-3
  const [assessmentAttitudeScores, setAssessmentAttitudeScores] = useState<Record<string, number>>({
    R: 4, P: 4, E: 4, C: 4, T: 4
  });

  // Certificate / Official Evaluation Sheet Modal State
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [selectedTraineeForCertificate, setSelectedTraineeForCertificate] = useState<TraineeRecord | null>(null);
  const [lastAssessedTopicList, setLastAssessedTopicList] = useState<{ judul: string; skor: number }[]>([]);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const loadData = () => {
    setTraineeList(db.getTable<TraineeRecord>('trainee_outlet'));
    setLaporanList(db.getTable<LaporanTrainerOutlet>('laporan_trainer'));
    setPenugasanList(db.getTable<PenugasanTrainer>('penugasan_trainer'));
    setOutlets(db.getTable<Outlet>('outlets'));
    setKruList(db.getTable<Kru>('kru'));
    setUsers(db.getTable<AppUser>('app_users'));
    setBankSop(db.getTable<any>('bank_sop'));
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, []);

  // Sync outlet filter if prop changes
  useEffect(() => {
    if (selectedOutletCode) {
      setOutletFilter(selectedOutletCode);
    }
  }, [selectedOutletCode]);

  const trainerOptions = useMemo(() => {
    const trainerUsers = users.filter((u) => u.role === 'Trainer' || u.role === 'Admin');
    if (trainerUsers.length > 0) return trainerUsers.map((u) => u.nama);
    return ['Haikal Abi', 'Siti Sarah', 'Bambang Kusuma'];
  }, [users]);

  // Filtered Trainees
  const filteredTrainees = useMemo(() => {
    return traineeList.filter((item) => {
      const matchOutlet = outletFilter === 'ALL' || item.kode_outlet === outletFilter;
      const matchStatus = statusOjtFilter === 'ALL' || item.status_ojt === statusOjtFilter;
      const matchDivisi = divisiFilter === 'ALL' || item.divisi === divisiFilter;
      const matchQuery =
        !searchQuery ||
        item.nama_kru.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.trainer_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sop_fokus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kode_outlet.toLowerCase().includes(searchQuery.toLowerCase());
      return matchOutlet && matchStatus && matchDivisi && matchQuery;
    });
  }, [traineeList, outletFilter, statusOjtFilter, divisiFilter, searchQuery]);

  // Filtered Laporan
  const filteredLaporan = useMemo(() => {
    return laporanList.filter((lap) => {
      const matchOutlet = outletFilter === 'ALL' || lap.kode_outlet === outletFilter;
      const matchQuery =
        !searchQuery ||
        lap.nomor_laporan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lap.trainer_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lap.kode_outlet.toLowerCase().includes(searchQuery.toLowerCase());
      return matchOutlet && matchQuery;
    });
  }, [laporanList, outletFilter, searchQuery]);

  // Trainees available at current selected outlet in Laporan Modal
  const traineesForLaporan = useMemo(() => {
    return traineeList.filter((t) => t.kode_outlet === laporanFormData.kode_outlet);
  }, [traineeList, laporanFormData.kode_outlet]);

  // Outlet Kru options for quick input
  const kruOptionsForSelectedOutlet = useMemo(() => {
    const targetOutlet = traineeFormData.kode_outlet;
    return kruList.filter((k) => k.kode_outlet === targetOutlet);
  }, [kruList, traineeFormData.kode_outlet]);

  // Stats Calculations
  const totalTrainees = filteredTrainees.length;
  const lulusCount = filteredTrainees.filter((t) => t.status_ojt === 'Lulus / Mandiri').length;
  const berjalanCount = filteredTrainees.filter((t) => t.status_ojt === 'Sedang Berjalan').length;
  const avgSkor = totalTrainees > 0
    ? Math.round(
        filteredTrainees.reduce((acc, t) => acc + (t.skor_akhir || t.skor_awal || 0), 0) / totalTrainees
      )
    : 0;

  // =========================================================================
  // OBJECTIVE ASSESSMENT CALCULATION & STEP DERIVATION
  // =========================================================================
  const assessmentDivisionSops = useMemo(() => {
    const div = (assessingTrainee ? assessingTrainee.divisi : traineeFormData.divisi) || 'Kitchen';
    return bankSop.filter((s) => s.divisi === div);
  }, [assessingTrainee, traineeFormData.divisi, bankSop]);

  const currentAssessingSop = useMemo(() => {
    if (selectedDetailSopId) {
      const byId = bankSop.find((s) => s.id === selectedDetailSopId || s.judul_sop === selectedDetailSopId);
      if (byId) return byId;
    }
    const focus = (assessingTrainee ? assessingTrainee.sop_fokus : traineeFormData.sop_fokus) || '';
    const divisi = (assessingTrainee ? assessingTrainee.divisi : traineeFormData.divisi) || 'Kitchen';
    
    const found = bankSop.find((s) => 
      s.judul_sop && (focus.toLowerCase().includes(s.judul_sop.toLowerCase()) || s.judul_sop.toLowerCase().includes(focus.toLowerCase()))
    );
    if (found) return found;

    const divFound = bankSop.find((s) => s.divisi === divisi);
    return divFound || null;
  }, [selectedDetailSopId, assessingTrainee, traineeFormData.sop_fokus, traineeFormData.divisi, bankSop]);

  const assessmentSopSteps = useMemo(() => {
    if (currentAssessingSop && Array.isArray(currentAssessingSop.langkah) && currentAssessingSop.langkah.length > 0) {
      return currentAssessingSop.langkah;
    }
    const div = (assessingTrainee ? assessingTrainee.divisi : traineeFormData.divisi) || 'Kitchen';
    if (div === 'Kitchen') {
      return [
        'Cek kebersihan area, kalibrasi alat & penggunaan APD lengkap',
        'Pengecekan bahan baku & takaran gramasi bumbu standar SOP',
        'Pengecekan suhu minyak / kompor dengan termometer akurat',
        'Proses eksekusi memasak/penggorengan sesuai durasi baku',
        'Penirisan minyak, holding time & platting/packing higienis'
      ];
    } else if (div === 'Geprek') {
      return [
        'Persiapan cobek batu bersih, penimbangan cabai sesuai level',
        'Proses pengulekan / pencampuran bumbu dengan gramasi garam baku',
        'Penyiraman minyak panas / pencelupan bumbu nashville presisi',
        'Proses penggeprekan mantap (ayam remuk merata tidak hancur lebur)',
        'Platting bersama timun segar / packing rapi berlabel stiker level'
      ];
    } else if (div === 'Kasir') {
      return [
        'Greeting 5S ramah dalam 3 detik pertama penyambutan',
        'Taking order teliti di POS & upselling menu extra/minuman',
        'Repeat order konfirmasi pesanan & nominal uang dengan santun',
        'Pemberian kembalian langsung ke tangan / konfirmasi transaksi QRIS',
        'Kroscek kelengkapan nota pesanan & packing take away'
      ];
    } else {
      return [
        'Identifikasi peruntukan jenis kain lap (kanebo/orange/kotak)',
        'Takaran dosis cairan pembersih (lantai 1:3, noda piring 1:10)',
        'Kecepatan clean up meja makan & perapian kursi (< 2 menit)',
        'Prosedur pencucian alat makan 2x sabun & deep cleaning',
        'Sanitasi wastafel, mushola, dan kartu kontrol kebersihan toilet'
      ];
    }
  }, [currentAssessingSop, assessingTrainee, traineeFormData.divisi]);

  // Calculations
  const calculatedTeoriScore = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < KRITERIA_TEORI_BAKU.length; i++) {
      sum += (assessmentTeoriScores[i] ?? 15);
    }
    return Math.min(100, Math.max(0, sum));
  }, [assessmentTeoriScores]);

  // Practical Score across ALL Jobdesk Topics
  const calculatedJobdeskTopicsScore = useMemo(() => {
    const topics = assessmentDivisionSops;
    if (topics.length === 0) return 80;
    let totalScore = 0;
    let assessedCount = 0;
    topics.forEach((t) => {
      const val = assessmentJobdeskTopicScores[t.id] ?? assessmentJobdeskTopicScores[t.judul_sop];
      if (val !== undefined) {
        totalScore += val;
        assessedCount++;
      }
    });

    if (assessedCount === 0) return 80;
    const maxPossible = assessedCount * 3;
    const basePercent = Math.round((totalScore / maxPossible) * 100);
    return Math.min(100, Math.max(0, basePercent));
  }, [assessmentDivisionSops, assessmentJobdeskTopicScores]);

  const calculatedPraktikScore = useMemo(() => {
    if (praktikEvalMode === 'jobdesk_topics') {
      const raw = calculatedJobdeskTopicsScore;
      const bonusSpeed = (assessmentSpeedScore - 2) * 3;
      const bonusHygiene = (assessmentHygieneScore - 2) * 3;
      return Math.min(100, Math.max(0, raw + bonusSpeed + bonusHygiene));
    } else {
      const stepCount = assessmentSopSteps.length;
      const maxSteps = stepCount * 3;
      const maxExtra = 6; // speed (3) + hygiene (3)
      const maxTotal = maxSteps + maxExtra;

      let obtainedSteps = 0;
      for (let i = 0; i < stepCount; i++) {
        obtainedSteps += (assessmentPraktikScores[i] ?? 2);
      }
      const totalObtained = obtainedSteps + assessmentSpeedScore + assessmentHygieneScore;
      return Math.round((totalObtained / Math.max(1, maxTotal)) * 100);
    }
  }, [praktikEvalMode, calculatedJobdeskTopicsScore, assessmentSopSteps, assessmentPraktikScores, assessmentSpeedScore, assessmentHygieneScore]);

  const calculatedAttitudeScore = useMemo(() => {
    const { R = 4, P = 4, E = 4, C = 4, T = 4 } = assessmentAttitudeScores;
    const total = R + P + E + C + T; // Max 25
    return Math.round((total / 25) * 100);
  }, [assessmentAttitudeScores]);

  const calculatedCompositeScore = useMemo(() => {
    // Teori 30%, Praktik 40%, Attitude 30%
    const comp = (0.30 * calculatedTeoriScore) + (0.40 * calculatedPraktikScore) + (0.30 * calculatedAttitudeScore);
    return Math.round(comp);
  }, [calculatedTeoriScore, calculatedPraktikScore, calculatedAttitudeScore]);

  const calculatedStatusOjt = useMemo((): StatusOJT => {
    if (calculatedCompositeScore >= 85) return 'Lulus / Mandiri';
    if (calculatedCompositeScore >= 70) return 'Sedang Berjalan';
    return 'Perlu Pendampingan Lanjut';
  }, [calculatedCompositeScore]);

  const calculatedRekomendasi = useMemo(() => {
    const parts: string[] = [];
    if (calculatedTeoriScore >= 85) parts.push(`Teori sangat baik (${calculatedTeoriScore})`);
    else parts.push(`Teori butuh penguatan SOP (${calculatedTeoriScore})`);

    if (calculatedPraktikScore >= 85) parts.push(`praktik lapangan ${assessingTrainee?.divisi || traineeFormData.divisi} cekatan (${calculatedPraktikScore})`);
    else parts.push(`praktik jobdesk perlu percepatan & ketelitian (${calculatedPraktikScore})`);

    if (calculatedAttitudeScore >= 85) parts.push(`budaya RESPECT unggul (${calculatedAttitudeScore})`);
    else parts.push(`disiplin grooming & inisiatif perlu ditingkatkan (${calculatedAttitudeScore})`);

    return `Evaluasi Objektif: ${parts.join(', ')}. Status OJT: ${calculatedStatusOjt}.`;
  }, [calculatedTeoriScore, calculatedPraktikScore, calculatedAttitudeScore, calculatedStatusOjt, assessingTrainee, traineeFormData.divisi]);

  const handleOpenAssessmentModal = (trainee?: TraineeRecord, target: 'awal' | 'akhir' = 'akhir') => {
    setAssessmentTarget(target);
    setAssessmentActiveTab('teori');
    setPraktikEvalMode('jobdesk_topics');

    const div = (trainee ? trainee.divisi : traineeFormData.divisi) || 'Kitchen';
    const divSops = bankSop.filter((s) => s.divisi === div);

    if (trainee) {
      setAssessingTrainee(trainee);
      const base = target === 'awal' ? (trainee.skor_awal || 70) : (trainee.skor_akhir || 85);
      const isGood = base >= 80;
      setAssessmentTeoriScores({
        0: isGood ? 20 : 15,
        1: isGood ? 20 : 15,
        2: isGood ? 20 : 10,
        3: isGood ? 20 : 15,
        4: isGood ? 15 : 10,
      });

      // Pre-populate all jobdesk topics
      const topicInit: Record<string, number> = {};
      divSops.forEach((sop, i) => {
        topicInit[sop.id] = isGood ? (i % 3 === 0 ? 3 : 2) : (i % 2 === 0 ? 2 : 1);
      });
      setAssessmentJobdeskTopicScores(topicInit);

      setAssessmentPraktikScores({ 0: isGood ? 3 : 2, 1: isGood ? 2 : 2, 2: isGood ? 3 : 2, 3: isGood ? 2 : 1, 4: isGood ? 3 : 2 });
      setAssessmentSpeedScore(isGood ? 3 : 2);
      setAssessmentHygieneScore(isGood ? 3 : 2);
      setAssessmentAttitudeScores({
        R: isGood ? 5 : 4,
        P: isGood ? 4 : 3,
        E: isGood ? 4 : 3,
        C: isGood ? 5 : 4,
        T: isGood ? 4 : 3,
      });
    } else {
      setAssessingTrainee(null);
      const topicInit: Record<string, number> = {};
      divSops.forEach((sop) => {
        topicInit[sop.id] = 2;
      });
      setAssessmentJobdeskTopicScores(topicInit);
    }
    setIsAssessmentModalOpen(true);
  };

  const handleApplyAssessment = () => {
    let targetTraineeRecord: TraineeRecord | null = null;

    if (assessingTrainee) {
      const payload: Partial<TraineeRecord> = {
        skor_teori: calculatedTeoriScore,
        skor_praktik: calculatedPraktikScore,
        skor_attitude: calculatedAttitudeScore,
        status_ojt: calculatedStatusOjt,
        catatan_trainer: calculatedRekomendasi,
      };
      if (assessmentTarget === 'awal') {
        payload.skor_awal = calculatedCompositeScore;
      } else {
        payload.skor_akhir = calculatedCompositeScore;
        if (calculatedStatusOjt === 'Lulus / Mandiri' && !assessingTrainee.tanggal_selesai) {
          payload.tanggal_selesai = new Date().toISOString().split('T')[0];
        }
      }

      db.updateRow<TraineeRecord>('trainee_outlet', assessingTrainee.id, payload);
      targetTraineeRecord = {
        ...assessingTrainee,
        ...payload,
      };

      showToast(`Hasil Penilaian Objektif "${assessingTrainee.nama_kru}" berhasil disimpan! Skor: ${calculatedCompositeScore}/100.`);
      loadData();
    } else {
      setTraineeFormData((prev) => ({
        ...prev,
        skor_awal: assessmentTarget === 'awal' ? calculatedCompositeScore : prev.skor_awal,
        skor_akhir: assessmentTarget === 'akhir' ? calculatedCompositeScore : prev.skor_akhir,
        status_ojt: calculatedStatusOjt,
        catatan_trainer: calculatedRekomendasi,
      }));
      showToast(`Skor objektif ${calculatedCompositeScore}/100 diterapkan ke form trainee!`);
    }

    // Build evaluated topic summary list for report export
    const topicSummary = assessmentDivisionSops.map((sop) => ({
      judul: sop.judul_sop,
      skor: assessmentJobdeskTopicScores[sop.id] ?? 2,
    }));
    setLastAssessedTopicList(topicSummary);

    setIsAssessmentModalOpen(false);

    // Prompt immediate report export & certificate view if saving evaluated trainee
    if (targetTraineeRecord) {
      setSelectedTraineeForCertificate(targetTraineeRecord);
      setIsCertificateModalOpen(true);
    }
  };

  const handleSaveAssessmentResult = (result: {
    skorTeori: number;
    skorPraktik: number;
    skorAttitude: number;
    skorKetahanan: number;
    skorBehaviorChange?: number;
    levelKirkpatrick?: {
      l1_reaksi: number;
      l2_kognitif: number;
      l3_perilaku: number;
      l4_dampak: number;
    };
    skorKomposit: number;
    statusOjt: StatusOJT;
    catatanKekuatan: string;
    catatanKelemahan: string;
    catatanActionPlan: string;
    catatanTrainer: string;
    alasanDiagnostik?: string[];
    buktiObservasi?: string;
    akarMasalah?: string;
    alasanKelulusan?: string;
    topikScores: { judul: string; skor: number }[];
    isOverridden: boolean;
    overrideReason?: string;
    detailRubrik?: any[];
    traineeInfo?: {
      nama_kru?: string;
      jabatan?: string;
      divisi?: Division;
      sop_fokus?: string;
      trainer_nama?: string;
      tanggal_mulai?: string;
      tanggal_selesai?: string;
    };
  }) => {
    let targetTraineeRecord: TraineeRecord | null = null;

    if (assessingTrainee) {
      const payload: Partial<TraineeRecord> = {
        skor_teori: result.skorTeori,
        skor_praktik: result.skorPraktik,
        skor_attitude: result.skorAttitude,
        skor_ketahanan: result.skorKetahanan,
        skor_behavior_change: result.skorBehaviorChange,
        level_kirkpatrick: result.levelKirkpatrick,
        status_ojt: result.statusOjt,
        catatan_kekuatan: result.catatanKekuatan,
        catatan_kelemahan: result.catatanKelemahan,
        catatan_action_plan: result.catatanActionPlan,
        catatan_trainer: result.catatanTrainer,
        alasan_diagnostik: result.alasanDiagnostik,
        bukti_observasi: result.buktiObservasi,
        akar_masalah: result.akarMasalah,
        alasan_kelulusan: result.alasanKelulusan,
        detail_rubrik: result.detailRubrik,
        ...(result.traineeInfo ? {
          nama_kru: result.traineeInfo.nama_kru || assessingTrainee.nama_kru,
          jabatan: result.traineeInfo.jabatan || assessingTrainee.jabatan,
          divisi: result.traineeInfo.divisi || assessingTrainee.divisi,
          sop_fokus: result.traineeInfo.sop_fokus || assessingTrainee.sop_fokus,
          trainer_nama: result.traineeInfo.trainer_nama || assessingTrainee.trainer_nama,
          tanggal_mulai: result.traineeInfo.tanggal_mulai || assessingTrainee.tanggal_mulai,
          ...(result.traineeInfo.tanggal_selesai ? { tanggal_selesai: result.traineeInfo.tanggal_selesai } : {}),
        } : {}),
      };

      if (assessmentTarget === 'awal') {
        payload.skor_awal = result.skorKomposit;
      } else {
        payload.skor_akhir = result.skorKomposit;
        if (result.statusOjt === 'Lulus / Mandiri' && !assessingTrainee.tanggal_selesai && !result.traineeInfo?.tanggal_selesai) {
          payload.tanggal_selesai = new Date().toISOString().split('T')[0];
        }
      }

      db.updateRow<TraineeRecord>('trainee_outlet', assessingTrainee.id, payload);
      targetTraineeRecord = {
        ...assessingTrainee,
        ...payload,
      };

      showToast(`Hasil Penilaian 4-Faktor "${payload.nama_kru || assessingTrainee.nama_kru}" [${payload.jabatan || assessingTrainee.jabatan}] berhasil disimpan! Skor: ${result.skorKomposit}/100.`);
      loadData();
    } else {
      setTraineeFormData((prev) => ({
        ...prev,
        skor_awal: assessmentTarget === 'awal' ? result.skorKomposit : prev.skor_awal,
        skor_akhir: assessmentTarget === 'akhir' ? result.skorKomposit : prev.skor_akhir,
        status_ojt: result.statusOjt,
        skor_teori: result.skorTeori,
        skor_praktik: result.skorPraktik,
        skor_attitude: result.skorAttitude,
        skor_ketahanan: result.skorKetahanan,
        catatan_kekuatan: result.catatanKekuatan,
        catatan_kelemahan: result.catatanKelemahan,
        catatan_action_plan: result.catatanActionPlan,
        catatan_trainer: result.catatanTrainer,
        alasan_diagnostik: result.alasanDiagnostik,
        bukti_observasi: result.buktiObservasi,
        akar_masalah: result.akarMasalah,
        alasan_kelulusan: result.alasanKelulusan,
        detail_rubrik: result.detailRubrik,
        ...(result.traineeInfo ? {
          nama_kru: result.traineeInfo.nama_kru || prev.nama_kru,
          jabatan: result.traineeInfo.jabatan || prev.jabatan,
          divisi: result.traineeInfo.divisi || prev.divisi,
          sop_fokus: result.traineeInfo.sop_fokus || prev.sop_fokus,
          trainer_nama: result.traineeInfo.trainer_nama || prev.trainer_nama,
          tanggal_mulai: result.traineeInfo.tanggal_mulai || prev.tanggal_mulai,
          ...(result.traineeInfo.tanggal_selesai ? { tanggal_selesai: result.traineeInfo.tanggal_selesai } : {}),
        } : {}),
      }));
      showToast(`Skor 4-Faktor ${result.skorKomposit}/100 diterapkan ke form trainee!`);
    }

    setLastAssessedTopicList(result.topikScores);
    setIsAssessmentModalOpen(false);

    if (targetTraineeRecord) {
      setSelectedTraineeForCertificate(targetTraineeRecord);
      setIsCertificateModalOpen(true);
    }
  };

  const handleSaveReportEdit = (updatedReport: LaporanTrainerOutlet) => {
    db.updateRow<LaporanTrainerOutlet>('laporan_trainer', updatedReport.id, updatedReport);
    showToast(`Laporan "${updatedReport.nomor_laporan}" berhasil diperbarui & disimpan!`);
    setSelectedReportToView(updatedReport);
    loadData();
  };

  const handleSaveTraineeEdit = (updatedTrainee: TraineeRecord) => {
    db.updateRow<TraineeRecord>('trainee_outlet', updatedTrainee.id, updatedTrainee);
    showToast(`Data evaluasi "${updatedTrainee.nama_kru}" berhasil diperbarui!`);
    setSelectedTraineeForCertificate(updatedTrainee);
    loadData();
  };

  // Open Official Certificate & Assessment Report Sheet Modal
  const handleOpenCertificateModal = (trainee: TraineeRecord) => {
    setSelectedTraineeForCertificate(trainee);
    const divSops = bankSop.filter((s) => s.divisi === trainee.divisi);
    const topicSummary = divSops.map((sop, i) => ({
      judul: sop.judul_sop,
      skor: (trainee.skor_akhir || 85) >= 85 ? (i % 4 === 0 ? 3 : 2) : 2,
    }));
    setLastAssessedTopicList(topicSummary);
    setIsCertificateModalOpen(true);
  };

  // Export Trainee List to CSV
  const exportTraineesToCSV = () => {
    if (filteredTrainees.length === 0) {
      showToast('Tidak ada data trainee untuk diekspor.');
      return;
    }

    const headers = [
      'Kode Outlet',
      'Nama Kru / Trainee',
      'Divisi Jobdesk',
      'Tipe Bimbingan',
      'SOP Fokus / Materi',
      'Lead Trainer',
      'Tanggal Mulai',
      'Tanggal Selesai',
      'Skor Teori (30%)',
      'Skor Praktik (40%)',
      'Skor Attitude (30%)',
      'Skor Awal (Pre-Test)',
      'Skor Akhir (Post-Test)',
      'Status OJT',
      'Catatan Evaluasi Trainer'
    ];

    const rows = filteredTrainees.map((t) => [
      `"${t.kode_outlet}"`,
      `"${t.nama_kru}"`,
      `"${t.divisi}"`,
      `"${t.tipe_bimbingan}"`,
      `"${t.sop_fokus || '-'}"`,
      `"${t.trainer_nama}"`,
      `"${t.tanggal_mulai}"`,
      `"${t.tanggal_selesai || '-'}"`,
      t.skor_teori ?? '-',
      t.skor_praktik ?? '-',
      t.skor_attitude ?? '-',
      t.skor_awal ?? '-',
      t.skor_akhir ?? '-',
      `"${t.status_ojt}"`,
      `"${(t.catatan_trainer || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Evaluasi_Trainee_HaraChicken_${outletFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('File CSV Rekapitulasi Penilaian Trainee berhasil diunduh!');
  };

  // WhatsApp Single Trainee Report Share
  const handleShareSingleTraineeWhatsApp = (trainee: TraineeRecord) => {
    const text = `*📋 LAPORAN RESMI HASIL PENILAIAN TRAINEE / KRU OJT*
*HARA DEVELOPMENT*
---------------------------------------------
👤 *Nama Kru:* ${trainee.nama_kru}
🏢 *Outlet:* ${trainee.kode_outlet}
🧑‍🍳 *Divisi Jobdesk:* ${trainee.divisi}
🎓 *Tipe Bimbingan:* ${trainee.tipe_bimbingan}
🎯 *SOP Fokus:* ${trainee.sop_fokus || 'Seluruh SOP Jobdesk'}
👤 *Trainer Operasional:* ${trainee.trainer_nama}
📅 *Periode OJT:* ${trainee.tanggal_mulai} s/d ${trainee.tanggal_selesai || 'Sedang Berjalan'}

*📊 HASIL EVALUASI OBJEKTIF 4-FAKTOR:*
• 📘 *Teori SOP (25%):* ${trainee.skor_teori ?? '-'} / 100
• 🛠️ *Praktik Jobdesk (35%):* ${trainee.skor_praktik ?? '-'} / 100
• 🤝 *Sikap RESPECT (25%):* ${trainee.skor_attitude ?? '-'} / 100
• ⚡ *Ketahanan Jam Sibuk (15%):* ${trainee.skor_ketahanan ?? '-'} / 100
---------------------------------------------
⭐ *TOTAL SKOR AKHIR KOMPOSIT:* *${trainee.skor_akhir ?? trainee.skor_awal ?? 0} / 100*
🏆 *STATUS KELULUSAN OJT:* *${trainee.status_ojt.toUpperCase()}*

📝 *Catatan & Diagnostik Trainer Operasional:*
_"${trainee.catatan_trainer || 'Menunjukkan kemajuan yang baik sesuai standar SOP.'}"_

_Dokumen sah dikeluarkan oleh HARA TRAINING & OPERATIONS._`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Handle Trainee Submit (Add or Edit)
  const handleSaveTrainee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!traineeFormData.nama_kru.trim()) {
      showToast('Nama kru/trainee wajib diisi.');
      return;
    }

    if (editingTrainee) {
      db.updateRow<TraineeRecord>('trainee_outlet', editingTrainee.id, {
        ...traineeFormData,
      });
      showToast(`Data trainee "${traineeFormData.nama_kru}" berhasil diperbarui.`);
    } else {
      db.insertRow('trainee_outlet', {
        ...traineeFormData,
      });
      // Also ensure Kru exists in Master Kru if not already there
      const kruExists = kruList.some(
        (k) => k.nama_kru.toLowerCase() === traineeFormData.nama_kru.toLowerCase() && k.kode_outlet === traineeFormData.kode_outlet
      );
      if (!kruExists) {
        db.insertRow('kru', {
          nama_kru: traineeFormData.nama_kru,
          divisi: traineeFormData.divisi,
          kode_outlet: traineeFormData.kode_outlet,
          tanggal_masuk: traineeFormData.tanggal_mulai,
          status_aktif: 'Aktif',
          catatan: `Trainee binaan ${traineeFormData.trainer_nama}`,
        });
      }
      showToast(`Trainee "${traineeFormData.nama_kru}" berhasil didaftarkan di outlet ${traineeFormData.kode_outlet}!`);
    }

    setIsTraineeModalOpen(false);
    setEditingTrainee(null);
  };

  const handleEditTraineeClick = (item: TraineeRecord) => {
    setEditingTrainee(item);
    setTraineeFormData({
      kode_outlet: item.kode_outlet,
      trainer_nama: item.trainer_nama,
      nama_kru: item.nama_kru,
      divisi: item.divisi,
      tipe_bimbingan: item.tipe_bimbingan,
      sop_fokus: item.sop_fokus,
      tanggal_mulai: item.tanggal_mulai,
      tanggal_selesai: item.tanggal_selesai || '',
      skor_awal: item.skor_awal ?? 70,
      skor_akhir: item.skor_akhir ?? 85,
      status_ojt: item.status_ojt,
      catatan_trainer: item.catatan_trainer || '',
    });
    setIsTraineeModalOpen(true);
  };

  const handleDeleteTrainee = (id: string, name: string) => {
    if (window.confirm(`Hapus data trainee "${name}"?`)) {
      db.deleteRow('trainee_outlet', id);
      showToast(`Data trainee "${name}" telah dihapus.`);
    }
  };

  // Handle Laporan Generation
  const handleCreateLaporanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const outletTrainees = traineeList.filter((t) => t.kode_outlet === laporanFormData.kode_outlet);
    const count = outletTrainees.length;
    const avg = count > 0
      ? Math.round(outletTrainees.reduce((acc, t) => acc + (t.skor_akhir || 0), 0) / count)
      : 85;

    const countExisting = laporanList.length + 1;
    const nomorLaporan = `LP-TRN/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(countExisting).padStart(3, '0')}`;

    const newReport: LaporanTrainerOutlet = {
      id: `lap-${Date.now()}`,
      nomor_laporan: nomorLaporan,
      kode_outlet: laporanFormData.kode_outlet,
      trainer_nama: laporanFormData.trainer_nama,
      periode_awal: laporanFormData.periode_awal,
      periode_akhir: laporanFormData.periode_akhir,
      jenis_kegiatan: laporanFormData.jenis_kegiatan,
      total_trainee: count,
      ringkasan_perbantuan: laporanFormData.ringkasan_perbantuan,
      daftar_trainee: outletTrainees.map((t) => ({
        nama_kru: t.nama_kru,
        divisi: t.divisi,
        sop_fokus: t.sop_fokus,
        skor_akhir: t.skor_akhir,
        status_ojt: t.status_ojt,
        catatan: t.catatan_trainer,
      })),
      kendala_outlet: laporanFormData.kendala_outlet,
      rekomendasi_kepala_outlet: laporanFormData.rekomendasi_kepala_outlet,
      skor_rata_rata: avg,
      status: 'Final',
      created_at: new Date().toISOString(),
    };

    db.insertRow('laporan_trainer', newReport);
    showToast(`Laporan resmi ${nomorLaporan} untuk outlet ${laporanFormData.kode_outlet} berhasil dibuat!`);
    setIsLaporanModalOpen(false);
    setSelectedReportToView(newReport);
  };

  const handleCopyWhatsAppSummary = (report: LaporanTrainerOutlet) => {
    const outletObj = outlets.find((o) => o.kode_outlet === report.kode_outlet);
    const outletName = outletObj ? `${outletObj.nama_outlet} (${report.kode_outlet})` : report.kode_outlet;

    const text = `📋 *LAPORAN PENDAMPINGAN & TRAINER DI OUTLET HARA CHICKEN*
📌 *No. Dokumen:* ${report.nomor_laporan}
🏬 *Outlet:* ${outletName}
👨‍🏫 *Lead Trainer:* ${report.trainer_nama}
🗓️ *Periode:* ${report.periode_awal} s.d. ${report.periode_akhir}
🎯 *Kegiatan:* ${report.jenis_kegiatan}

📊 *RINGKASAN TRAINEE & KRU DAMPINGAN (${report.total_trainee} Orang):*
${report.daftar_trainee.map((t, idx) => `${idx + 1}. *${t.nama_kru}* (${t.divisi}) - Skor: *${t.skor_akhir ?? '-'}* - [${t.status_ojt}]\n   SOP: ${t.sop_fokus}\n   Catatan: ${t.catatan || '-'}`).join('\n\n')}

⭐ *Rata-rata Skor Keterampilan:* ${report.skor_rata_rata ?? 85}/100

💡 *RINGKASAN PERBANTUAN & ASISTENSI:*
${report.ringkasan_perbantuan}

⚠️ *KENDALA LAPANGAN:*
${report.kendala_outlet || '-'}

✅ *REKOMENDASI KEPALA OUTLET:*
${report.rekomendasi_kepala_outlet || '-'}

_Diterbitkan secara digital oleh Sistem HARA TRAINER Pro_`;

    navigator.clipboard.writeText(text);
    setCopiedReportId(report.id);
    showToast('Laporan disalin ke clipboard! Siap dipaste ke WhatsApp.');
    setTimeout(() => setCopiedReportId(null), 2500);
  };

  // Penugasan Form Submit
  const handleSavePenugasan = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPenugasan) {
      db.updateRow<PenugasanTrainer>('penugasan_trainer', editingPenugasan.id, {
        ...penugasanFormData,
      });
      showToast('Surat tugas trainer berhasil diperbarui.');
    } else {
      const count = penugasanList.length + 1;
      const nomorSurat = `ST/HARA-TRN/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(count).padStart(3, '0')}`;
      db.insertRow('penugasan_trainer', {
        ...penugasanFormData,
        nomor_surat_tugas: nomorSurat,
      });
      showToast(`Surat Tugas ${nomorSurat} berhasil diterbitkan.`);
    }
    setIsPenugasanModalOpen(false);
    setEditingPenugasan(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* 1. UNIFIED MINIMALIST PAGE HEADER & SUB-TABS */}
      <PageHeaderBanner
        category="PENUGASAN & PENDAMPINGAN"
        title="Pendampingan Trainee & Asistensi Cabang"
        description="Kelola daftar kru & trainee di outlet, catat bimbingan OJT & perbantuan operasional, serta terbitkan laporan hasil training resmi siap cetak dan ekspor ke WhatsApp."
        icon={<GraduationCap size={22} />}
        tabs={[
          {
            id: 'trainee',
            label: 'Daftar Trainee Dampingan',
            icon: Users,
            count: filteredTrainees.length,
          },
          {
            id: 'laporan',
            label: 'Arsip Laporan Outlet',
            icon: FileText,
            count: filteredLaporan.length,
          },
          {
            id: 'penugasan',
            label: 'Surat Tugas & Jadwal',
            icon: Briefcase,
            count: penugasanList.length,
          },
        ]}
        activeTab={activeMainTab}
        onSelectTab={(id) => setActiveMainTab(id as any)}
        rightElement={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingTrainee(null);
                setTraineeFormData({
                  kode_outlet: outletFilter !== 'ALL' ? outletFilter : 'HC-JTS01',
                  trainer_nama: 'Haikal Abi',
                  nama_kru: '',
                  divisi: 'Kitchen',
                  tipe_bimbingan: 'Pendampingan OJT Kru Baru',
                  sop_fokus: 'Standar Penggorengan Ayam Crispy & Suhu Minyak (170°C)',
                  tanggal_mulai: new Date().toISOString().split('T')[0],
                  tanggal_selesai: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                  skor_awal: 70,
                  skor_akhir: 88,
                  status_ojt: 'Sedang Berjalan',
                  catatan_trainer: '',
                });
                setIsTraineeModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#96171B] hover:bg-[#801216] text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99] whitespace-nowrap"
            >
              <Plus size={15} />
              <span>Input Trainee</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLaporanFormData({
                  kode_outlet: outletFilter !== 'ALL' ? outletFilter : 'HC-JTS01',
                  trainer_nama: 'Haikal Abi',
                  periode_awal: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
                  periode_akhir: new Date().toISOString().split('T')[0],
                  jenis_kegiatan: 'Pendampingan OJT & Perbantuan Operasional Cabang',
                  ringkasan_perbantuan: 'Melakukan asistensi jam sibuk (peak hour) stasiun kitchen serta melatih 2 kru baru agar mandiri.',
                  kendala_outlet: 'Peralatan deep fryer perlu kalibrasi termometer berkala setiap shift pagi.',
                  rekomendasi_kepala_outlet: 'Lakukan evaluasi checklist harian sebelum buka gerai dan pertahankan briefing 5 menit.',
                });
                setIsLaporanModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99] whitespace-nowrap"
            >
              <FileSpreadsheet size={15} />
              <span>Buat Laporan</span>
            </button>
          </div>
        }
      />

      {/* 2. SUMMARY KPI STATS PILLS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Kru Dampingan</span>
            <Users size={14} className="text-[#96171B]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{totalTrainees}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Personil Terdaftar</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Lulus / Mandiri (OJT)</span>
            <CheckCircle2 size={14} className="text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-emerald-600">{lulusCount}</div>
          <div className="text-[11px] text-emerald-700 font-semibold truncate">Kualifikasi Mandiri</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Sedang Berjalan</span>
            <Clock size={14} className="text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-amber-600">{berjalanCount}</div>
          <div className="text-[11px] text-amber-800 font-semibold truncate">Dalam Pembinaan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-1.5 hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Rata-Rata Skor</span>
            <Star size={14} className="text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{avgSkor} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Uji Keterampilan</div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Quick Outlet Selector */}
          <div className="flex items-center gap-2">
            <Store size={16} className="text-[#96171B] shrink-0" />
            <span className="text-xs font-bold text-slate-700">Filter Outlet:</span>
            <select
              aria-label="Pilih Cabang Outlet"
              value={outletFilter}
              onChange={(e) => {
                const val = e.target.value;
                setOutletFilter(val);
                if (onSelectOutletCode) onSelectOutletCode(val);
              }}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B] cursor-pointer"
            >
              <option value="ALL">Semua Outlet Cabang</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.kode_outlet}>
                  {o.kode_outlet} - {o.nama_outlet}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Extra Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama kru, trainer, SOP fokus, atau kode outlet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#96171B]"
            />
          </div>

          {activeMainTab === 'trainee' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Divisi:</span>
                <select
                  aria-label="Filter Divisi"
                  value={divisiFilter}
                  onChange={(e) => setDivisiFilter(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Divisi</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Geprek">Geprek</option>
                  <option value="Kasir">Kasir</option>
                  <option value="Helper">Helper</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Status OJT:</span>
                <select
                  aria-label="Filter Status OJT"
                  value={statusOjtFilter}
                  onChange={(e) => setStatusOjtFilter(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-700 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Sedang Berjalan">Sedang Berjalan</option>
                  <option value="Lulus / Mandiri">Lulus / Mandiri</option>
                  <option value="Perlu Pendampingan Lanjut">Perlu Bimbingan Lanjut</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* TAB 1: DAFTAR TRAINEE / KRU DAMPINGAN */}
      {activeMainTab === 'trainee' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900">
                Data Trainee & Kru Binaan di Outlet{' '}
                <span className="text-[#96171B]">
                  {outletFilter === 'ALL' ? 'Semua Cabang' : outletFilter}
                </span>
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold">
                {filteredTrainees.length} Kru
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportTraineesToCSV}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Ekspor Rekapitulasi ke CSV / Excel"
              >
                <Download size={14} />
                <span>Ekspor CSV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingTrainee(null);
                  setTraineeFormData({
                    kode_outlet: outletFilter !== 'ALL' ? outletFilter : 'HC-JTS01',
                    trainer_nama: 'Haikal Abi',
                    nama_kru: '',
                    divisi: 'Kitchen',
                    tipe_bimbingan: 'Pendampingan OJT Kru Baru',
                    sop_fokus: 'Standar Penggorengan Ayam Crispy & Suhu Minyak (170°C)',
                    tanggal_mulai: new Date().toISOString().split('T')[0],
                    tanggal_selesai: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                    skor_awal: 70,
                    skor_akhir: 88,
                    status_ojt: 'Sedang Berjalan',
                    catatan_trainer: '',
                  });
                  setIsTraineeModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#96171B] text-white font-bold text-xs hover:bg-[#781014] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>+ Input Kru Trainee</span>
              </button>
            </div>
          </div>

          {filteredTrainees.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#E2E0D8] space-y-3">
              <Users size={36} className="mx-auto text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">Belum ada data kru/trainee di outlet ini</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Silakan klik tombol "+ Input Kru / Trainee" untuk memasukkan nama kru baru atau binaan yang sedang didampingi trainer di outlet.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingTrainee(null);
                  setIsTraineeModalOpen(true);
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-[#96171B] text-white text-xs font-black inline-flex items-center gap-2"
              >
                <Plus size={14} />
                <span>Input Kru Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrainees.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-[#E2E0D8] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative group"
                >
                  <div className="space-y-2.5">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-50 text-[#96171B] border border-red-200">
                            {item.kode_outlet}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {item.divisi}
                          </span>
                        </div>
                        <h3 className="font-black text-sm text-slate-900 mt-1">
                          {item.nama_kru}
                        </h3>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                          item.status_ojt === 'Lulus / Mandiri'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : item.status_ojt === 'Sedang Berjalan'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {item.status_ojt}
                      </span>
                    </div>

                    {/* Mentoring Info */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Tipe Bimbingan:</span>
                        <span className="font-bold text-slate-800">{item.tipe_bimbingan}</span>
                      </div>
                      <div className="flex items-start justify-between gap-2 text-slate-500 text-[11px]">
                        <span className="shrink-0">SOP Fokus:</span>
                        <span className="font-bold text-slate-800 text-right leading-tight line-clamp-2">
                          {item.sop_fokus}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                        <span>Lead Trainer:</span>
                        <span className="font-bold text-[#96171B]">{item.trainer_nama}</span>
                      </div>
                    </div>

                    {/* Scores Progress Bar & Multi-Dimension Pills */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Skor Awal: <b className="text-slate-800">{item.skor_awal ?? '-'}</b></span>
                        <span className="text-slate-500 font-medium">Skor Akhir (Komposit): <b className="text-emerald-700 font-black">{item.skor_akhir ?? '-'} / 100</b></span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            (item.skor_akhir || 0) >= 85
                              ? 'bg-emerald-500'
                              : (item.skor_akhir || 0) >= 70
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(item.skor_akhir || item.skor_awal || 0, 100)}%` }}
                        />
                      </div>

                      {/* 4-Dimensional Objective Sub-Score Pills */}
                      <div className="grid grid-cols-4 gap-1 pt-1">
                        <div className="bg-blue-50/70 border border-blue-200/60 rounded-lg p-1.5 text-center">
                          <div className="text-[8px] font-bold text-blue-700 uppercase flex items-center justify-center gap-0.5">
                            <Brain size={9} /> Teori
                          </div>
                          <div className="text-[11px] font-black text-blue-900 mt-0.5">
                            {item.skor_teori ? `${item.skor_teori}` : '-'}
                          </div>
                        </div>

                        <div className="bg-amber-50/70 border border-amber-200/60 rounded-lg p-1.5 text-center">
                          <div className="text-[8px] font-bold text-amber-700 uppercase flex items-center justify-center gap-0.5">
                            <Wrench size={9} /> Praktik
                          </div>
                          <div className="text-[11px] font-black text-amber-900 mt-0.5">
                            {item.skor_praktik ? `${item.skor_praktik}` : '-'}
                          </div>
                        </div>

                        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-lg p-1.5 text-center">
                          <div className="text-[8px] font-bold text-emerald-700 uppercase flex items-center justify-center gap-0.5">
                            <Award size={9} /> RESPECT
                          </div>
                          <div className="text-[11px] font-black text-emerald-900 mt-0.5">
                            {item.skor_attitude ? `${item.skor_attitude}` : '-'}
                          </div>
                        </div>

                        <div className="bg-rose-50/70 border border-rose-200/60 rounded-lg p-1.5 text-center">
                          <div className="text-[8px] font-bold text-rose-700 uppercase flex items-center justify-center gap-0.5">
                            <Flame size={9} /> Tahan
                          </div>
                          <div className="text-[11px] font-black text-rose-900 mt-0.5">
                            {item.skor_ketahanan ? `${item.skor_ketahanan}` : '-'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Diagnosa Akar Masalah & Bukti Lapangan */}
                    {item.akar_masalah && (
                      <div className="p-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-950 text-[10px] space-y-0.5">
                        <div className="font-bold flex items-center justify-between">
                          <span>🔍 Akar Masalah:</span>
                          {item.alasan_diagnostik && item.alasan_diagnostik.length > 0 && (
                            <span className="text-[9px] bg-purple-200/70 text-purple-900 px-1 rounded font-extrabold">
                              {item.alasan_diagnostik.length} Bukti
                            </span>
                          )}
                        </div>
                        <div className="font-medium line-clamp-1">{item.akar_masalah}</div>
                      </div>
                    )}

                    {/* Structured Strengths & Weaknesses */}
                    {(item.catatan_kekuatan || item.catatan_kelemahan) && (
                      <div className="space-y-1 text-[10px]">
                        {item.catatan_kekuatan && (
                          <div className="p-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 line-clamp-1 font-medium flex items-center gap-1">
                            <span className="font-bold shrink-0">🌟 Kelebihan:</span>
                            <span className="truncate">{item.catatan_kekuatan}</span>
                          </div>
                        )}
                        {item.catatan_kelemahan && (
                          <div className="p-1.5 rounded-lg bg-rose-50/80 border border-rose-200/80 text-rose-900 line-clamp-1 font-medium flex items-center gap-1">
                            <span className="font-bold shrink-0">⚠️ Perbaikan:</span>
                            <span className="truncate">{item.catatan_kelemahan}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {item.catatan_trainer && !item.catatan_kekuatan && (
                      <p className="text-[11px] text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-200/50 italic line-clamp-2">
                        "{item.catatan_trainer}"
                      </p>
                    )}
                  </div>

                  {/* Objective Rubric Quick Button & Actions Footer */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenAssessmentModal(item, 'akhir')}
                        className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-[#96171B] text-white font-black text-xs flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-98"
                      >
                        <Calculator size={13} className="text-[#FBD66A]" />
                        <span>Uji & Nilai</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenCertificateModal(item)}
                        className="py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 font-black text-xs flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-98"
                        title="Lihat & Cetak Berita Acara Evaluasi / Sertifikat"
                      >
                        <Printer size={13} className="text-amber-700" />
                        <span>Ekspor Laporan</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar size={11} /> {item.tanggal_mulai}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleShareSingleTraineeWhatsApp(item)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Kirim Ringkasan ke WhatsApp"
                        >
                          <Phone size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditTraineeClick(item)}
                          className="p-1.5 text-slate-600 hover:text-[#96171B] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit / Ubah Form Trainee"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTrainee(item.id, item.nama_kru)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Trainee"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ARSIP & PEMBUATAN LAPORAN OUTLET */}
      {activeMainTab === 'laporan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900">
                Arsip Laporan Hasil Training & Perbantuan di Outlet
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold">
                {filteredLaporan.length} Dokumen
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setLaporanFormData({
                  kode_outlet: outletFilter !== 'ALL' ? outletFilter : 'HC-JTS01',
                  trainer_nama: 'Haikal Abi',
                  periode_awal: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
                  periode_akhir: new Date().toISOString().split('T')[0],
                  jenis_kegiatan: 'Pendampingan OJT & Perbantuan Operasional Cabang',
                  ringkasan_perbantuan: 'Melakukan asistensi jam sibuk (peak hour) stasiun kitchen serta melatih kru baru agar mandiri.',
                  kendala_outlet: 'Peralatan deep fryer perlu kalibrasi termometer berkala setiap shift pagi.',
                  rekomendasi_kepala_outlet: 'Lakukan evaluasi checklist harian sebelum buka gerai dan pertahankan briefing 5 menit.',
                });
                setIsLaporanModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#96171B] text-white font-bold text-xs hover:bg-[#781014] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>+ Buat Laporan Baru</span>
            </button>
          </div>

          {filteredLaporan.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-[#E2E0D8] space-y-3">
              <FileText size={36} className="mx-auto text-slate-300" />
              <h3 className="text-sm font-bold text-slate-700">Belum ada laporan training untuk outlet ini</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Setelah selesai melakukan pendampingan atau perbantuan di outlet, klik "Buat Laporan Outlet" untuk merangkum hasil training kru.
              </p>
              <button
                type="button"
                onClick={() => setIsLaporanModalOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-[#96171B] text-white text-xs font-black inline-flex items-center gap-2"
              >
                <Plus size={14} />
                <span>Buat Laporan Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredLaporan.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-2xl p-5 border border-[#E2E0D8] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                          {rep.nomor_laporan}
                        </span>
                        <h3 className="font-black text-sm text-slate-900 mt-1.5">
                          {rep.jenis_kegiatan}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Outlet: <b className="text-slate-800">{rep.kode_outlet}</b> • Trainer: <b className="text-[#96171B]">{rep.trainer_nama}</b>
                        </p>
                      </div>

                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shrink-0">
                        {rep.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Periode Kegiatan:</span>
                        <span className="font-bold">{rep.periode_awal} s/d {rep.periode_akhir}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Total Trainee Binaan:</span>
                        <span className="font-bold text-[#96171B]">{rep.total_trainee} Kru</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span>Rata-rata Skor:</span>
                        <span className="font-black text-emerald-700">{rep.skor_rata_rata ?? 85} / 100</span>
                      </div>
                      <p className="text-[11px] text-slate-600 pt-1 border-t border-slate-200 line-clamp-2">
                        {rep.ringkasan_perbantuan}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyWhatsAppSummary(rep)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        copiedReportId === rep.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {copiedReportId === rep.id ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedReportId === rep.id ? 'Tersalin!' : 'Copy WA'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedReportToView(rep)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#96171B] hover:bg-[#781014] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <Eye size={13} />
                        <span>Lihat Dokumen Resmi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus dokumen laporan ${rep.nomor_laporan}?`)) {
                            db.deleteRow('laporan_trainer', rep.id);
                            showToast(`Laporan ${rep.nomor_laporan} telah dihapus.`);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Laporan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SURAT TUGAS & JADWAL ON-SITE */}
      {activeMainTab === 'penugasan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900">
                Daftar Penugasan & Surat Tugas Resmi Trainer di Outlet
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold">
                {penugasanList.length} Tugas
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingPenugasan(null);
                setPenugasanFormData({
                  trainer_nama: 'Haikal Abi',
                  trainer_kontak: '0812-8899-2341',
                  kode_outlet: outletFilter !== 'ALL' ? outletFilter : 'HC-JTS01',
                  tipe_penugasan: 'Pendampingan & OJT',
                  fokus_divisi: 'Kitchen',
                  shift_kerja: 'Shift Pagi',
                  tanggal_mulai: new Date().toISOString().split('T')[0],
                  tanggal_selesai: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                  tujuan_tugas: 'Pendampingan kru baru & standarisasi penggorengan suhu 170°C.',
                  daftar_kru_didampingi: '',
                  target_output: 'Seluruh kru dampingan lulus evaluasi mandiri skor >85.',
                  status: 'Berjalan',
                });
                setIsPenugasanModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#96171B] text-white font-bold text-xs hover:bg-[#781014] flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>+ Terbitkan Surat Tugas</span>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {penugasanList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-[#E2E0D8] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-50 text-[#96171B] border border-red-200">
                        {item.nomor_surat_tugas}
                      </span>
                      <h3 className="font-black text-sm text-slate-900 mt-1">
                        {item.trainer_nama}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Penugasan: <b className="text-slate-800">{item.kode_outlet}</b> ({item.shift_kerja})
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'Berjalan'
                          ? 'bg-emerald-100 text-emerald-900 font-black'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                    <div className="text-slate-500 font-bold text-[11px]">{item.tipe_penugasan}</div>
                    <p className="text-slate-700 text-[11px] line-clamp-2">{item.tujuan_tugas}</p>
                    <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1">
                      <Calendar size={11} /> {item.tanggal_mulai} s/d {item.tanggal_selesai}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedLetterItem(item)}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <FileText size={12} />
                    <span>Lihat Surat Tugas</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPenugasan(item);
                        setPenugasanFormData({
                          trainer_nama: item.trainer_nama,
                          trainer_kontak: item.trainer_kontak || '',
                          kode_outlet: item.kode_outlet,
                          tipe_penugasan: item.tipe_penugasan,
                          fokus_divisi: item.fokus_divisi,
                          shift_kerja: item.shift_kerja,
                          tanggal_mulai: item.tanggal_mulai,
                          tanggal_selesai: item.tanggal_selesai,
                          tujuan_tugas: item.tujuan_tugas,
                          daftar_kru_didampingi: item.daftar_kru_didampingi || '',
                          target_output: item.target_output,
                          status: item.status,
                        });
                        setIsPenugasanModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-[#96171B] rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Hapus surat tugas ${item.nomor_surat_tugas}?`)) {
                          db.deleteRow('penugasan_trainer', item.id);
                          showToast('Surat tugas berhasil dihapus.');
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INPUT / EDIT KRU TRAINEE FORM */}
      {/* ========================================================================= */}
      {isTraineeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 text-[#96171B]">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {editingTrainee ? 'Edit & Nilai Kru Trainee' : 'Input Kru Trainee di Outlet'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Daftarkan kru dampingan OJT atau perbantuan operasional
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTraineeModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTrainee} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Outlet (OT)</label>
                  <select
                    value={traineeFormData.kode_outlet}
                    onChange={(e) => setTraineeFormData({ ...traineeFormData, kode_outlet: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.kode_outlet}>
                        {o.kode_outlet} - {o.nama_outlet}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lead Trainer</label>
                  <select
                    value={traineeFormData.trainer_nama}
                    onChange={(e) => setTraineeFormData({ ...traineeFormData, trainer_nama: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  >
                    {trainerOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kru / Trainee <span className="text-rose-500">*</span>
                </label>
                {/* Auto suggest existing kru or free input */}
                <input
                  type="text"
                  list="outlet-kru-list"
                  placeholder="Ketik atau pilih nama kru..."
                  value={traineeFormData.nama_kru}
                  onChange={(e) => setTraineeFormData({ ...traineeFormData, nama_kru: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  required
                />
                <datalist id="outlet-kru-list">
                  {kruOptionsForSelectedOutlet.map((k) => (
                    <option key={k.id} value={k.nama_kru}>
                      {k.nama_kru} ({k.divisi})
                    </option>
                  ))}
                </datalist>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Bisa memilih kru yang sudah terdaftar di outlet atau ketik nama kru baru.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Divisi Kru</label>
                  <select
                    value={traineeFormData.divisi}
                    onChange={(e) => setTraineeFormData({ ...traineeFormData, divisi: e.target.value as Division })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  >
                    <option value="Kitchen">Kitchen (Goreng/Marinasi)</option>
                    <option value="Geprek">Geprek & Sambal</option>
                    <option value="Kasir">Kasir & Pelayanan POS</option>
                    <option value="Helper">Helper / Cuci & Sanitasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Bimbingan</label>
                  <select
                    value={traineeFormData.tipe_bimbingan}
                    onChange={(e) => setTraineeFormData({ ...traineeFormData, tipe_bimbingan: e.target.value as TipeBimbingan })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  >
                    <option value="Pendampingan OJT Kru Baru">Pendampingan OJT Kru Baru</option>
                    <option value="Perbantuan Operasional">Perbantuan Operasional</option>
                    <option value="Retraining Gap SOP">Retraining Gap SOP</option>
                    <option value="Peningkatan Level">Peningkatan Level</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">SOP Fokus / Materi Pelatihan</label>
                <input
                  type="text"
                  value={traineeFormData.sop_fokus}
                  onChange={(e) => setTraineeFormData({ ...traineeFormData, sop_fokus: e.target.value })}
                  placeholder="Contoh: Standar Penggorengan Ayam Crispy & Suhu Minyak (170°C)"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                />
              </div>

              {/* Objective Rubric Calculator Shortcut in Form */}
              <div className="p-3 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-red-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#96171B]">
                    <Calculator size={15} />
                    <span>Kalkulator Penilaian Objektif 3-Dimensi</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#96171B]">
                    Standar Baku
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Hindari tebak-tebak skor manual yang subjektif. Gunakan rubrik terstandar: <b>Teori (30%)</b>, <b>Praktik Langkah SOP (40%)</b>, dan <b>Attitude RESPECT (30%)</b>.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenAssessmentModal(editingTrainee || undefined, 'awal')}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>🎯 Nilai Pre-Test (Awal)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAssessmentModal(editingTrainee || undefined, 'akhir')}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#96171B] hover:bg-[#781014] text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Sparkles size={12} className="text-[#FBD66A]" />
                    <span>🎯 Nilai Post-Test (Akhir)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Skor Awal (Pre-Test)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={traineeFormData.skor_awal}
                    onChange={(e) => setTraineeFormData({ ...traineeFormData, skor_awal: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Skor Akhir (Post-Test)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={traineeFormData.skor_akhir}
                    onChange={(e) => setTraineeFormData({ ...traineeFormData, skor_akhir: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status OJT</label>
                  <select
                    value={traineeFormData.status_ojt}
                    onChange={(e) => setTraineeFormData({ ...traineeFormData, status_ojt: e.target.value as StatusOJT })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="Sedang Berjalan">Sedang Berjalan</option>
                    <option value="Lulus / Mandiri">Lulus / Mandiri</option>
                    <option value="Perlu Pendampingan Lanjut">Perlu Bimbingan Lanjut</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={traineeFormData.tanggal_mulai}
                    onChange={(e) => setTraineeFormData({ ...traineeFormData, tanggal_mulai: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Evaluasi Trainer</label>
                <textarea
                  rows={3}
                  value={traineeFormData.catatan_trainer}
                  onChange={(e) => setTraineeFormData({ ...traineeFormData, catatan_trainer: e.target.value })}
                  placeholder="Keterangan kecepatan, ketepatan resep, kesiapan kerja mandiri..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTraineeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-[#96171B] hover:bg-[#781014] text-white shadow-md cursor-pointer"
                >
                  {editingTrainee ? 'Simpan Perubahan' : 'Simpan Data Trainee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GENERATOR & PEMBUAT LAPORAN OUTLET */}
      {/* ========================================================================= */}
      {isLaporanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-900">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Generator Laporan Trainer Outlet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rangkum hasil pendampingan trainee dan perbantuan operasional cabang
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLaporanModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLaporanSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Outlet Cabang</label>
                  <select
                    value={laporanFormData.kode_outlet}
                    onChange={(e) => setLaporanFormData({ ...laporanFormData, kode_outlet: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.kode_outlet}>
                        {o.kode_outlet} - {o.nama_outlet}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trainer Penyusun</label>
                  <select
                    value={laporanFormData.trainer_nama}
                    onChange={(e) => setLaporanFormData({ ...laporanFormData, trainer_nama: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  >
                    {trainerOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trainees at this outlet preview */}
              <div className="p-3 bg-red-50/50 rounded-2xl border border-red-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#96171B]">
                  <span className="flex items-center gap-1.5">
                    <Users size={14} />
                    <span>Daftar Kru Dampingan di {laporanFormData.kode_outlet}:</span>
                  </span>
                  <span>{traineesForLaporan.length} Kru Terdata</span>
                </div>
                {traineesForLaporan.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">
                    Belum ada kru yang diinput untuk outlet ini. Laporan tetap bisa dibuat atau silakan input kru terlebih dahulu.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {traineesForLaporan.map((t) => (
                      <span
                        key={t.id}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-red-200 text-slate-800 flex items-center gap-1"
                      >
                        <b>{t.nama_kru}</b> ({t.divisi}) - Skor: {t.skor_akhir ?? '-'}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul / Jenis Kegiatan</label>
                <input
                  type="text"
                  value={laporanFormData.jenis_kegiatan}
                  onChange={(e) => setLaporanFormData({ ...laporanFormData, jenis_kegiatan: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Periode Tanggal Mulai</label>
                  <input
                    type="date"
                    value={laporanFormData.periode_awal}
                    onChange={(e) => setLaporanFormData({ ...laporanFormData, periode_awal: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Periode Tanggal Selesai</label>
                  <input
                    type="date"
                    value={laporanFormData.periode_akhir}
                    onChange={(e) => setLaporanFormData({ ...laporanFormData, periode_akhir: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ringkasan Kegiatan & Perbantuan Shift</label>
                <textarea
                  rows={2}
                  value={laporanFormData.ringkasan_perbantuan}
                  onChange={(e) => setLaporanFormData({ ...laporanFormData, ringkasan_perbantuan: e.target.value })}
                  placeholder="Rangkuman aktivitas asistensi jam sibuk, perbantuan stasiun kitchen/kasir..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kendala / Temuan di Outlet</label>
                  <textarea
                    rows={2}
                    value={laporanFormData.kendala_outlet}
                    onChange={(e) => setLaporanFormData({ ...laporanFormData, kendala_outlet: e.target.value })}
                    placeholder="Contoh: Termometer fryer perlu kalibrasi..."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rekomendasi untuk Kepala Outlet</label>
                  <textarea
                    rows={2}
                    value={laporanFormData.rekomendasi_kepala_outlet}
                    onChange={(e) => setLaporanFormData({ ...laporanFormData, rekomendasi_kepala_outlet: e.target.value })}
                    placeholder="Contoh: Pertahankan briefing pagi 5 menit..."
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLaporanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-[#96171B] hover:bg-[#781014] text-white shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet size={15} />
                  <span>Terbitkan Laporan Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW & EDIT MANUAL DOKUMEN RESMI LAPORAN */}
      {/* ========================================================================= */}
      <OfficialReportViewModal
        report={selectedReportToView}
        outlets={outlets}
        isOpen={!!selectedReportToView}
        onClose={() => setSelectedReportToView(null)}
        onSaveReportEdit={handleSaveReportEdit}
      />

      {/* ========================================================================= */}
      {/* MODAL 4: FORM SURAT TUGAS RESMI */}
      {/* ========================================================================= */}
      {isPenugasanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-50 text-[#96171B]">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {editingPenugasan ? 'Edit Surat Tugas Trainer' : 'Penerbitan Surat Tugas Trainer'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Formulir penugasan on-site perbantuan & pendampingan cabang
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPenugasanModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePenugasan} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Trainer</label>
                  <select
                    value={penugasanFormData.trainer_nama}
                    onChange={(e) => setPenugasanFormData({ ...penugasanFormData, trainer_nama: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  >
                    {trainerOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Outlet Penugasan</label>
                  <select
                    value={penugasanFormData.kode_outlet}
                    onChange={(e) => setPenugasanFormData({ ...penugasanFormData, kode_outlet: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.kode_outlet}>{o.kode_outlet} - {o.nama_outlet}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Penugasan</label>
                  <select
                    value={penugasanFormData.tipe_penugasan}
                    onChange={(e) => setPenugasanFormData({ ...penugasanFormData, tipe_penugasan: e.target.value as TipePenugasan })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  >
                    <option value="Pendampingan & OJT">Pendampingan & OJT</option>
                    <option value="Perbantuan Operasional">Perbantuan Operasional</option>
                    <option value="Standarisasi & Audit SOP">Standarisasi & Audit SOP</option>
                    <option value="Opening Outlet Baru">Opening Outlet Baru</option>
                    <option value="Penyelesaian Gap Kritis">Penyelesaian Gap Kritis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shift Kerja</label>
                  <select
                    value={penugasanFormData.shift_kerja}
                    onChange={(e) => setPenugasanFormData({ ...penugasanFormData, shift_kerja: e.target.value as ShiftTugas })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  >
                    <option value="Shift Pagi">Shift Pagi (09.00 - 17.00)</option>
                    <option value="Shift Siang/Malam">Shift Siang/Malam (14.00 - 22.00)</option>
                    <option value="Full Day / Double Shift">Full Day / Double Shift</option>
                    <option value="Fleksibel">Fleksibel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={penugasanFormData.tanggal_mulai}
                    onChange={(e) => setPenugasanFormData({ ...penugasanFormData, tanggal_mulai: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={penugasanFormData.tanggal_selesai}
                    onChange={(e) => setPenugasanFormData({ ...penugasanFormData, tanggal_selesai: e.target.value })}
                    className="w-full text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tujuan Tugas & Instruksi Kerja</label>
                <textarea
                  rows={2}
                  value={penugasanFormData.tujuan_tugas}
                  onChange={(e) => setPenugasanFormData({ ...penugasanFormData, tujuan_tugas: e.target.value })}
                  placeholder="Rincian tujuan penempatan trainer di outlet..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Output yang Diharapkan</label>
                <input
                  type="text"
                  value={penugasanFormData.target_output}
                  onChange={(e) => setPenugasanFormData({ ...penugasanFormData, target_output: e.target.value })}
                  placeholder="Contoh: 100% kru baru lulus uji mandiri, 0 komplain mutu goreng"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-medium text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPenugasanModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-[#96171B] hover:bg-[#781014] text-white shadow-md cursor-pointer"
                >
                  {editingPenugasan ? 'Simpan Perubahan' : 'Terbitkan Surat Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: VIEW SURAT TUGAS RESMI DIGITAL */}
      {/* ========================================================================= */}
      {selectedLetterItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-300 animate-in fade-in zoom-in-95 space-y-6 print:shadow-none print:border-0 print:rounded-none">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <span className="text-xs font-black uppercase text-[#96171B] tracking-wider">
                SURAT TUGAS RESMI TRAINER
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#96171B] hover:bg-[#781014] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer size={14} />
                  <span>Cetak Surat Tugas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLetterItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* KOP RESMI: HARA CHICKEN TRAINER OPERASIONAL */}
            <OfficialDocumentHeader
              docNumber={selectedLetterItem.nomor_surat_tugas}
              date={`Bekasi, ${selectedLetterItem.tanggal_mulai}`}
              subLabel="Standar Operasional Prosedur, Penjaminan Mutu & Pelatihan Kru"
              extraInfo="Divisi Training & Operasional • Penugasan Lapangan"
            />

            <div className="text-center space-y-1">
              <h3 className="text-base font-black uppercase text-slate-900 tracking-wide underline">
                SURAT TUGAS PENDAMPINGAN & PERBANTUAN OUTLET
              </h3>
              <p className="text-xs text-slate-600">Nomor: {selectedLetterItem.nomor_surat_tugas}</p>
            </div>

            <div className="space-y-3 text-xs text-slate-800 leading-relaxed">
              <p>Yang bertanda tangan di bawah ini, Manajemen Operasional & Training HARA menugaskan kepada:</p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Nama Petugas</span>
                  <span className="col-span-2 font-black text-slate-900">: {selectedLetterItem.trainer_nama}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Kontak Person</span>
                  <span className="col-span-2 font-medium">: {selectedLetterItem.trainer_kontak || '0812-8899-2341'}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Outlet Tujuan</span>
                  <span className="col-span-2 font-black text-[#96171B]">: {selectedLetterItem.kode_outlet}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Jenis Tugas</span>
                  <span className="col-span-2 font-black text-slate-900">: {selectedLetterItem.tipe_penugasan}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Periode & Shift</span>
                  <span className="col-span-2 font-medium">: {selectedLetterItem.tanggal_mulai} s/d {selectedLetterItem.tanggal_selesai} ({selectedLetterItem.shift_kerja})</span>
                </div>
              </div>

              <div>
                <b>Tujuan & Rincian Tugas:</b>
                <p className="mt-1 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  {selectedLetterItem.tujuan_tugas}
                </p>
              </div>

              <div>
                <b>Target Output:</b>
                <p className="mt-1 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  {selectedLetterItem.target_output}
                </p>
              </div>
            </div>

            {/* Signature */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-200 text-center text-xs">
              <div className="space-y-12">
                <span className="text-slate-500 font-bold block">Penerima Tugas,</span>
                <div>
                  <div className="font-black text-slate-900 underline">{selectedLetterItem.trainer_nama}</div>
                  <div className="text-[10px] text-slate-500">Pelaksana Tugas Lapangan</div>
                </div>
              </div>

              <div className="space-y-12">
                <span className="text-slate-500 font-bold block">Pemberi Tugas,</span>
                <div>
                  <div className="font-black text-slate-900 underline">Haikal Abi</div>
                  <div className="text-[10px] text-slate-500">Lead Trainer Operasional</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: OBJECTIVE 4-FACTOR ASSESSMENT RUBRIC CALCULATOR (TEORI, PRAKTIK, ATTITUDE, KETAHANAN) */}
      {/* ========================================================================= */}
      <TrainerAssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        trainee={assessingTrainee}
        target={assessmentTarget}
        defaultDivisi={assessingTrainee ? assessingTrainee.divisi : traineeFormData.divisi}
        bankSop={bankSop}
        onSaveAssessment={handleSaveAssessmentResult}
      />

      {/* ========================================================================= */}
      {/* MODAL 6: BERITA ACARA EVALUASI KRU & SERTIFIKAT KELULUSAN OJT SIAP CETAK/EKSPOR/EDIT */}
      {/* ========================================================================= */}
      <OfficialCertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        trainee={selectedTraineeForCertificate}
        topicList={lastAssessedTopicList}
        onSaveTraineeEdit={handleSaveTraineeEdit}
      />
    </div>
  );
};
