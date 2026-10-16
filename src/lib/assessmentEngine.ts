import { Division, CompetencyBadge, CrewCompetencySummary, AuditAttitudeHara } from '../types';

export interface AssessmentPillars {
  skorTeori: number | null;     // Bobot 20%
  skorPraktik: number | null;   // Bobot 40%
  skorLisan: number | null;      // Bobot 15%
  skorAttitude: number | null;   // Bobot 25%
}

export interface DetailedAssessmentResult {
  pilar1_teori: number;
  pilar2_praktik: number;
  pilar3_lisan: number;
  pilar4_attitude: number;
  skorAkhir: number;
  grade: 'A' | 'B' | 'C' | 'D';
  predikat: string;
  statusKelulusan: 'LULUS' | 'BELUM LULUS';
  badge: CompetencyBadge;
  bobotPilar: {
    teori: number;
    praktik: number;
    lisan: number;
    attitude: number;
  };
  rumusPerhitungan: string;
  attitudeHaraBreakdown: {
    halal: number;
    amanah: number;
    responsif: number;
    adaptif: number;
  };
  radarDataset: {
    axis: string;
    value: number;
    target: number;
    bobotPersen: number;
  }[];
  analisisKru: {
    rekomendasiTindakan: string;
    kekuatanUtama: string;
    areaPeningkatan: string;
    kesiapanPromosi: 'Siap Promosi' | 'Memerlukan Pemantapan' | 'Wajib Remedial Segera';
  };
}

export const BOBOT_RESMI = {
  TEORI: 0.20,
  PRAKTIK: 0.40,
  LISAN: 0.15,
  ATTITUDE: 0.25,
};

export const PASSING_GRADE = 75.0;

export function evaluateGrade(skor: number): {
  grade: 'A' | 'B' | 'C' | 'D';
  predikat: string;
  status: 'LULUS' | 'BELUM LULUS';
  badge: CompetencyBadge;
} {
  if (skor >= 90.0) {
    return {
      grade: 'A',
      predikat: 'Sangat Kompeten (Excellence)',
      status: 'LULUS',
      badge: 'Mahir',
    };
  }
  if (skor >= 80.0) {
    return {
      grade: 'B',
      predikat: 'Kompeten (Proficient)',
      status: 'LULUS',
      badge: 'Mahir',
    };
  }
  if (skor >= 75.0) {
    return {
      grade: 'C',
      predikat: 'Cukup Kompeten (Qualified)',
      status: 'LULUS',
      badge: 'Terampil',
    };
  }
  return {
    grade: 'D',
    predikat: 'Belum Lulus (Remedial Required)',
    status: 'BELUM LULUS',
    badge: 'Pemula',
  };
}

export function calculateDetailedAssessment(
  pillars: AssessmentPillars,
  divisi: Division = 'Kitchen',
  attitudeData?: Partial<AuditAttitudeHara> | null
): DetailedAssessmentResult {
  // Gunakan fallback default yang adil jika belum ada skor
  const teori = pillars.skorTeori ?? 70;
  const praktik = pillars.skorPraktik ?? 70;
  const lisan = pillars.skorLisan ?? 70;
  
  // Hitung Sikap H.A.R.A
  let halal = attitudeData?.skor_h_higienis ?? 80;
  let antusias = attitudeData?.skor_a_antusias ?? 80; // Map ke Responsif
  let resik = attitudeData?.skor_r_resik ?? 80;       // Map ke Adaptif / Kerapian
  let amanah = attitudeData?.skor_a_amanah ?? 80;

  const skorAttitudeCalc = attitudeData?.skor_rata_rata ??
    pillars.skorAttitude ??
    Math.round((halal + amanah + antusias + resik) / 4);

  // Perhitungan skor akhir berbasis 4 pilar (Total 100%)
  const rawScore =
    teori * BOBOT_RESMI.TEORI +
    praktik * BOBOT_RESMI.PRAKTIK +
    lisan * BOBOT_RESMI.LISAN +
    skorAttitudeCalc * BOBOT_RESMI.ATTITUDE;

  const skorAkhir = Math.round(rawScore * 10) / 10;
  const { grade, predikat, status, badge } = evaluateGrade(skorAkhir);

  const rumusPerhitungan = `(${teori} × 20%) + (${praktik} × 40%) + (${lisan} × 15%) + (${skorAttitudeCalc} × 25%) = ${skorAkhir}`;

  // Radar Dataset untuk visualisasi komprehensif
  const radarDataset = [
    { axis: 'Uji Teori SOP', value: teori, target: 80, bobotPersen: 20 },
    { axis: 'Uji Praktik & SOS', value: praktik, target: 85, bobotPersen: 40 },
    { axis: 'Uji Lisan & HACCP', value: lisan, target: 80, bobotPersen: 15 },
    { axis: 'Halal & Higienis', value: halal, target: 85, bobotPersen: 6.25 },
    { axis: 'Amanah & Integritas', value: amanah, target: 90, bobotPersen: 6.25 },
    { axis: 'Responsif & Layanan', value: antusias, target: 85, bobotPersen: 6.25 },
    { axis: 'Adaptif & Perubahan', value: resik, target: 80, bobotPersen: 6.25 },
  ];

  // Dynamic Division-Specific Analysis Generator
  const analisis = generateDivisionSpecificFeedback(divisi, skorAkhir, teori, praktik, lisan, skorAttitudeCalc);

  return {
    pilar1_teori: teori,
    pilar2_praktik: praktik,
    pilar3_lisan: lisan,
    pilar4_attitude: skorAttitudeCalc,
    skorAkhir,
    grade,
    predikat,
    statusKelulusan: status,
    badge,
    bobotPilar: {
      teori: 20,
      praktik: 40,
      lisan: 15,
      attitude: 25,
    },
    rumusPerhitungan,
    attitudeHaraBreakdown: {
      halal,
      amanah,
      responsif: antusias,
      adaptif: resik,
    },
    radarDataset,
    analisisKru: analisis,
  };
}

function generateDivisionSpecificFeedback(
  divisi: Division,
  skorAkhir: number,
  teori: number,
  praktik: number,
  lisan: number,
  attitude: number
) {
  let areaPeningkatan = '';
  let kekuatanUtama = '';
  let rekomendasiTindakan = '';
  let kesiapanPromosi: 'Siap Promosi' | 'Memerlukan Pemantapan' | 'Wajib Remedial Segera' = 'Memerlukan Pemantapan';

  if (skorAkhir >= 85) {
    kesiapanPromosi = 'Siap Promosi';
    kekuatanUtama = `Sangat konsisten mematuhi SOP ${divisi} dengan penguasaan teknis dan sikap kerja profesional.`;
    rekomendasiTindakan = `Diberikan penugasan sebagai Crew Leader atau Mentor Onboarding untuk kru baru stasiun ${divisi}.`;
  } else if (skorAkhir >= 75) {
    kesiapanPromosi = 'Memerlukan Pemantapan';
    kekuatanUtama = `Memenuhi standar kelulusan minimal dan menunjukkan etos kerja yang selaras dengan budaya HARA.`;
    rekomendasiTindakan = `Fasilitasi coaching intensif 1-on-1 pada aspek yang masih di bawah 80 poin selama 2 minggu ke depan.`;
  } else {
    kesiapanPromosi = 'Wajib Remedial Segera';
    kekuatanUtama = `Memiliki potensi yang dapat dikembangkan dengan bimbingan teknis lebih terstruktur.`;
    rekomendasiTindakan = `Jadwalkan remedial tertulis dan drill simulasi ulang pada stasiun kerja ${divisi} sebelum diizinkan bertugas mandiri.`;
  }

  // Divisi Specific Weakness Pointing
  if (praktik < 75) {
    if (divisi === 'Kitchen') {
      areaPeningkatan = 'Presisi pengaturan suhu kompor 175°C, suhu minyak masuk 160°C durasi 12 menit, dan pengecekan core temperature ayam >= 74°C.';
    } else if (divisi === 'Kasir') {
      areaPeningkatan = 'Kecepatan transaksi kasir POS, akurasi input pesanan di bawah 90 detik, dan balancing uang register Rp 0 selisih.';
    } else if (divisi === 'Geprek') {
      areaPeningkatan = 'Konsistensi takaran gramatur sambal 30g per porsi dan teknik geprek merata tanpa menghancurkan tulang.';
    } else {
      areaPeningkatan = 'Disiplin sanitasi area, pemilahan lap microfiber warna, dan rotasi chemical pembersih standar HACCP.';
    }
  } else if (teori < 75) {
    areaPeningkatan = `Pemahaman teori dasar SOP ${divisi} dan penanganan situasi kritis (HACCP) perlu direview kembali.`;
  } else if (attitude < 80) {
    areaPeningkatan = 'Internalisasi 12 Perilaku Utama Budaya H.A.R.A, khususnya pada ketepatan waktu shift dan inisiatif kerja cepat.';
  } else {
    areaPeningkatan = 'Pertahankan ritme kerja prima saat rush hour makan siang dan makan malam.';
  }

  return {
    kekuatanUtama,
    areaPeningkatan,
    rekomendasiTindakan,
    kesiapanPromosi,
  };
}
