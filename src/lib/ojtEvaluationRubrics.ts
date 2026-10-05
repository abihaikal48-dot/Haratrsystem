import { GateEvaluationStage, GateEvaluationStatus } from '../types';

export interface OJTRubricItem {
  id: string;
  sop_code: string;
  sop_title: string;
  rubrik_pernyataan: string;
  metode_uji: 'OBSERVASI' | 'STOPWATCH' | 'TERMOMETER' | 'TIMBANGAN' | 'TES_LISAN';
  standar_baku: string;
  bobot_poin: number;
  is_kritis: boolean;
  penjelasan_objektif: string;
}

export interface GateRubricDefinition {
  stage: GateEvaluationStage;
  dayNumber: number;
  title: string;
  subTitle: string;
  totalPoinMaksimal: number;
  items: OJTRubricItem[];
}

export const OFFICIAL_OJT_GATE_RUBRICS: Record<GateEvaluationStage, GateRubricDefinition> = {
  GATE_1_DAY_7: {
    stage: 'GATE_1_DAY_7',
    dayNumber: 7,
    title: 'Gate 1 (Hari ke-7) — Orientasi, Budaya HARA, Hygiene & Grooming',
    subTitle: 'Evaluasi dasar kesiapan mental, sanitasi diri, dan pemahaman nilai H.A.R.A',
    totalPoinMaksimal: 100,
    items: [
      {
        id: 'g1-1',
        sop_code: 'HC-SOP-CORP-01',
        sop_title: 'Visi, Misi & Budaya H.A.R.A',
        rubrik_pernyataan: 'Mampu melafalkan dan menjelaskan 4 Nilai Budaya H.A.R.A (Halal, Amanah, Responsif, Adaptif) dalam operasional harian.',
        metode_uji: 'TES_LISAN',
        standar_baku: 'Hafal 4 pilar + contoh perilaku nyata saat briefing',
        bobot_poin: 15,
        is_kritis: false,
        penjelasan_objektif: 'Menjamin keselarasan nilai integritas amanah kru sejak minggu pertama bekerja.'
      },
      {
        id: 'g1-2',
        sop_code: 'HC-SOP-HYG-01',
        sop_title: '6 Langkah Cuci Tangan 20 Detik',
        rubrik_pernyataan: 'Mempraktikkan 6 langkah cuci tangan dengan sabun antiseptik selama minimal 20 detik di wastafel sebelum menyentuh makanan atau berganti tugas.',
        metode_uji: 'OBSERVASI',
        standar_baku: 'Urutan 6 langkah WHO/QSR, sabun antiseptik, air mengalir, minimal 20 detik',
        bobot_poin: 20,
        is_kritis: true,
        penjelasan_objektif: 'Batas kritis Food Safety pencegahan kontaminasi silang bakteri E. coli & Salmonella.'
      },
      {
        id: 'g1-3',
        sop_code: 'HC-SOP-HYG-02',
        sop_title: 'Standar Grooming & Seragam Resmi',
        rubrik_pernyataan: 'Mengenakan seragam lengkap bersih, apron terpasang rapi, hairnet menutup rambut sempurna, kuku pendek bersih tanpa cat kuku, dan sepatu kerja tertutup.',
        metode_uji: 'OBSERVASI',
        standar_baku: 'Apron bersih, hairnet terpasang, kuku < 1mm, sepatu karet tertutup',
        bobot_poin: 15,
        is_kritis: false,
        penjelasan_objektif: 'Kerapian dan higienitas visual gerai sesuai standar brand HARA Chicken.'
      },
      {
        id: 'g1-4',
        sop_code: 'HC-SOP-K3-01',
        sop_title: 'K3 Dapur & Tanggap APAR',
        rubrik_pernyataan: 'Mengetahui letak APAR (Alat Pemadam Api Ringan), cara mencabut pin pengaman, dan larangan menyiram air pada minyak panas yang terbakar.',
        metode_uji: 'TES_LISAN',
        standar_baku: 'Teknik PASS (Pull, Aim, Squeeze, Sweep) & fire blanket dapur',
        bobot_poin: 15,
        is_kritis: true,
        penjelasan_objektif: 'Keselamatan nyawa kru dan aset gerai dari bahaya kebakaran minyak fryer.'
      },
      {
        id: 'g1-5',
        sop_code: 'HC-SOP-HLP-01',
        sop_title: 'Jenis Lap & Peruntukan Warna',
        rubrik_pernyataan: 'Mampu membedakan dan menggunakan 4 jenis lap kain sesuai peruntukan: Kanebo untuk piring, Lap Orange untuk meja makan, Lap Dapur untuk alat masak, Lap Lantai untuk tumpahan lantai.',
        metode_uji: 'OBSERVASI',
        standar_baku: 'Zero salah pakai lap antar zona dining, dapur, dan sanitasi',
        bobot_poin: 15,
        is_kritis: true,
        penjelasan_objektif: 'Mencegah kontaminasi silang fatal antara lap meja makan dan peralatan makan pelanggan.'
      },
      {
        id: 'g1-6',
        sop_code: 'HC-SOP-HLP-14',
        sop_title: 'Teknik Menyapu & Mengepel Lantai',
        rubrik_pernyataan: 'Mampu menyapu dari sudut terjauh ke arah pintu keluar dan mengepel dengan rasio cairan pembersih 1 : 3 air tanpa membuat lantai licin.',
        metode_uji: 'OBSERVASI',
        standar_baku: 'Rasio cairan 1:3, peras pel kesat, pasang plang Wet Floor',
        bobot_poin: 20,
        is_kritis: false,
        penjelasan_objektif: 'Kebersihan lantai dining dan dapur bebas minyak licin demi kenyamanan tamu.'
      }
    ]
  },

  GATE_2_DAY_14: {
    stage: 'GATE_2_DAY_14',
    dayNumber: 14,
    title: 'Gate 2 (Hari ke-14) — Stasiun Helper, Bahan Baku, Thawing & Sanitasi',
    subTitle: 'Evaluasi penanganan bahan baku, rantai dingin, rotasi FIFO/FEFO, dan sanitasi alat',
    totalPoinMaksimal: 100,
    items: [
      {
        id: 'g2-1',
        sop_code: 'HC-SOP-KIT-23',
        sop_title: 'SOP Thawing Ayam Beku',
        rubrik_pernyataan: 'Thawing ayam di dalam baskom persegi tertutup (maksimal 12 kg per baskom), dilarang merendam ayam ke dalam air dan dilarang refreeze ayam yang sudah cair ke freezer.',
        metode_uji: 'OBSERVASI',
        standar_baku: 'Maks 12kg/baskom, suhu showcase 4°C atau suhu ruang max 6 jam tertutup, 0 refreeze',
        bobot_poin: 25,
        is_kritis: true,
        penjelasan_objektif: 'Merendam ayam di air melarutkan bumbu marinasi dan memicu perkembangbiakan bakteri patogen.'
      },
      {
        id: 'g2-2',
        sop_code: 'HC-SOP-KIT-22',
        sop_title: 'Penerimaan & Pengecekan Gas Elpiji',
        rubrik_pernyataan: 'Menimbang tabung gas baru sebelum supplier pergi: berat minimal 3kg = 7.8 kg, 5.5kg = 12.4 kg, 12kg = 26.8 kg. Menolak tabung jika di bawah batas toleransi.',
        metode_uji: 'TIMBANGAN',
        standar_baku: 'Timbang toleransi (min 7.8kg / 12.4kg / 26.8kg) + catat tanggal pasang',
        bobot_poin: 15,
        is_kritis: false,
        penjelasan_objektif: 'Mencegah kecurangan volume gas dan memastikan kontinuitas api operasional.'
      },
      {
        id: 'g2-3',
        sop_code: 'HC-SOP-HLP-10',
        sop_title: 'Perawatan Showcase & Chiller Suhu 4°C',
        rubrik_pernyataan: 'Membersihkan showcase harian, memastikan jarak ke dinding minimal 16 cm untuk sirkulasi kompresor, dan dilarang mencongkel bunga es dengan benda tajam.',
        metode_uji: 'OBSERVASI',
        standar_baku: 'Jarak dinding ≥16 cm, suhu stabil 2°C - 4°C, zero goresan benda tajam',
        bobot_poin: 20,
        is_kritis: false,
        penjelasan_objektif: 'Menjaga usia kompresor chiller dan kestabilan temperatur penyimpanan ayam marinasi.'
      },
      {
        id: 'g2-4',
        sop_code: 'HC-SOP-HLP-15',
        sop_title: 'Kebersihan Wastafel Cuci Dapur',
        rubrik_pernyataan: 'Memastikan saringan wastafel selalu terpasang rapat, membersihkan sisa lemak dengan sabun, dan menyiram 1 ember air bersih saat pergantian shift dan closing.',
        metode_uji: 'OBSERVASI',
        standar_baku: 'Saringan terpasang 100%, bak kesat, siram 1 ember closing',
        bobot_poin: 20,
        is_kritis: false,
        penjelasan_objektif: 'Mencegah pipa pembuangan dapur mampet oleh endapan tepung dan lemak ayam.'
      },
      {
        id: 'g2-5',
        sop_code: 'HC-SOP-KIT-24',
        sop_title: 'Pembersihan Rice Cooker Gas & Magicom',
        rubrik_pernyataan: 'Merendam panci penanak 20 menit, menggunakan solet plastik lentur dan busa spons kasar, dilarang keras menggunakan kawat pencuci pada lapisan teflon.',
        metode_uji: 'OBSERVASI',
        standar_baku: 'Rendam 20 mnt, solet plastik, DILARANG kawat besi',
        bobot_poin: 20,
        is_kritis: true,
        penjelasan_objektif: 'Kawat pencuci merusak lapisan anti-lengket teflon, menyebabkan nasi berkerak gosong dan boros beras.'
      }
    ]
  },

  GATE_3_DAY_21: {
    stage: 'GATE_3_DAY_21',
    dayNumber: 21,
    title: 'Gate 3 (Hari ke-21) — Stasiun Inti (Goreng Ayam 160°C, Nasi, Sambal & Kasir POS)',
    subTitle: 'Evaluasi teknis parameter kritis produk inti, gramasi timbangan, dan transaksi',
    totalPoinMaksimal: 100,
    items: [
      {
        id: 'g3-1',
        sop_code: 'HC-SOP-KIT-02',
        sop_title: 'Goreng Ayam Krispi & Suhu Minyak 160°C',
        rubrik_pernyataan: 'Pengatur suhu kompor di 175°C, suhu minyak termometer 160°C stabil, penepungan 10x cubit lembut mekar tanpa gumpalan padat, waktu goreng tepat 12 menit, goyangkan keranjang tiap 3 menit.',
        metode_uji: 'TERMOMETER',
        standar_baku: 'Suhu minyak 160°C (±2°C), waktu 12 menit tepat, batch 2-3 kg, goyang tiap 3 mnt',
        bobot_poin: 25,
        is_kritis: true,
        penjelasan_objektif: 'Parameter mutlak ayam krispi renyah matang hingga tulang. Jika suhu < 160°C, minyak meresap dan ayam basah.'
      },
      {
        id: 'g3-2',
        sop_code: 'HC-SOP-KIT-01',
        sop_title: 'Standar Masak Nasi Pulen',
        rubrik_pernyataan: 'Perbandingan air baku (misal 5 cup beras : 6 cup air), mencuci beras 3 kali hingga jernih, dan membiarkan nasi tanak 15 menit setelah tombol jegleg sebelum dipindah ke magicom.',
        metode_uji: 'STOPWATCH',
        standar_baku: 'Cuci 3x jernih, rasio air terukur, tanak 15 menit setelah jegleg',
        bobot_poin: 15,
        is_kritis: false,
        penjelasan_objektif: 'Menghasilkan nasi pulen harum tanpa butiran keras atau lembek berair.'
      },
      {
        id: 'g3-3',
        sop_code: 'HC-SOP-GPK-03',
        sop_title: 'Racikan Sambal Bawang Baku',
        rubrik_pernyataan: 'Goreng cabai rawit & bawang putih 3-5 menit sampai layu, uleg manual di cobek batu bersama 7 gr mix garam (dilarang blender), siram 60 ml minyak panas, packing @30 gr per cup.',
        metode_uji: 'TIMBANGAN',
        standar_baku: 'Uleg manual batu, siram minyak panas 60ml, berat porsi 30 gr (±2g)',
        bobot_poin: 20,
        is_kritis: true,
        penjelasan_objektif: 'Tekstur sambal uleg batu mempertahankan aroma minyak cabai otentik HARA.'
      },
      {
        id: 'g3-4',
        sop_code: 'HC-SOP-GPK-11',
        sop_title: 'Teknik Geprek & Platting Timun',
        rubrik_pernyataan: 'Geprek ayam krispi mantap (remuk pipih bumbu meresap namun tidak hancur lebur jadi bubur), oles sambal merata, dan wajib sertakan 2 slice timun segar bersih.',
        metode_uji: 'OBSERVASI',
        standar_baku: 'Remuk pipih proporsional + 2 slice timun segar',
        bobot_poin: 20,
        is_kritis: false,
        penjelasan_objektif: 'Platting ayam geprek estetis menggugah selera dan porsi daging tetap utuh.'
      },
      {
        id: 'g3-5',
        sop_code: 'HC-SOP-KAS-01',
        sop_title: 'Greeting 5S & Taking Order POS Lite',
        rubrik_pernyataan: 'Menyapa dalam 3 detik ("Mari silakan Kak, dine in / take away?"), menyebutkan menu ready di warmer, upselling menu extra (kulit/kentang/terong), dan input POS < 45 detik.',
        metode_uji: 'STOPWATCH',
        standar_baku: 'Greeting < 3 detik, upselling wajib diucapkan, input POS < 45 detik',
        bobot_poin: 20,
        is_kritis: false,
        penjelasan_objektif: 'Standar keramahan 5S dan kecepatan layanan front house yang mendongkrak average check.'
      }
    ]
  },

  GATE_4_DAY_30: {
    stage: 'GATE_4_DAY_30',
    dayNumber: 30,
    title: 'Gate 4 (Hari ke-30) — Ujian Akhir, Simulasi Rush Hour & Service Recovery',
    subTitle: 'Evaluasi komprehensif ketahanan jam sibuk, zero-fraud, dan sertifikasi mandiri',
    totalPoinMaksimal: 100,
    items: [
      {
        id: 'g4-1',
        sop_code: 'HC-SOP-RSH-01',
        sop_title: 'Ketahanan Jam Sibuk (Rush Hour Stress Test)',
        rubrik_pernyataan: 'Mampu mempertahankan Speed of Service (Dine in < 10 menit, Take away < 5 menit per nota) saat jam makan siang/malam tanpa komplain produk mentah/salah pesanan.',
        metode_uji: 'STOPWATCH',
        standar_baku: 'Dine in < 10 mnt, Take away < 5 mnt, zero antrean macet di stasiun',
        bobot_poin: 25,
        is_kritis: true,
        penjelasan_objektif: 'Syarat utama kelulusan solo shift: kru mampu bertahan di jam puncak pesanan.'
      },
      {
        id: 'g4-2',
        sop_code: 'HC-SOP-GPK-22',
        sop_title: 'Handling Complain Tipe A',
        rubrik_pernyataan: 'Jika ada keluhan rasa/ayam kurang matang/salah sambal, langsung menyampaikan permohonan maaf tulus dan mengganti produk baru fresh dalam < 3 menit tanpa berdebat.',
        metode_uji: 'OBSERVASI',
        standar_baku: 'Permohonan maaf tulus, ganti baru < 3 menit, catat di kartu keluhan',
        bobot_poin: 25,
        is_kritis: false,
        penjelasan_objektif: 'Service recovery yang cepat mengembalikan kepercayaan dan loyalitas konsumen.'
      },
      {
        id: 'g4-3',
        sop_code: 'HC-SOP-KAS-03',
        sop_title: 'Repeat Order & Serah Terima Uang Kasir',
        rubrik_pernyataan: 'Melakukan repeat order item dan nominal belanja sebelum cetak nota, menyerahkan uang kembalian langsung ke tangan pelanggan dengan kedua tangan sopan (dilarang melempar di meja).',
        metode_uji: 'OBSERVASI',
        standar_baku: 'Repeat order lengkap, serah kembalian 2 tangan langsung ke tamu',
        bobot_poin: 20,
        is_kritis: false,
        penjelasan_objektif: 'Menghindari selisih kas dan memberikan kesan keramahan santun khas HARA.'
      },
      {
        id: 'g4-4',
        sop_code: 'HC-SOP-EXAM-01',
        sop_title: 'Ujian Teori Komprehensif SOP (25 Soal)',
        rubrik_pernyataan: 'Menyelesaikan 25 butir soal pilihan ganda bank soal resmi HARA mencakup 4 stasiun kerja dengan skor pencapaian minimal 75%.',
        metode_uji: 'TES_LISAN',
        standar_baku: 'Skor ujian teori minimal 75 / 100',
        bobot_poin: 15,
        is_kritis: false,
        penjelasan_objektif: 'Penguasaan kognitif seluruh alur operasional dan alasan keselamatan kerja.'
      },
      {
        id: 'g4-5',
        sop_code: 'HC-SOP-ETH-01',
        sop_title: 'Integritas Amanah, Zero Fraud & Absensi',
        rubrik_pernyataan: 'Tidak pernah melakukan kecurangan kasir/void liar, jujur pada gramasi bahan baku, dan tingkat kehadiran tepat waktu selama 30 hari pertama mencapai ≥ 95%.',
        metode_uji: 'OBSERVASI',
        standar_baku: 'Zero catatan fraud, absensi on-time ≥ 95%, disiplin APAR/K3',
        bobot_poin: 15,
        is_kritis: true,
        penjelasan_objektif: 'Pilar Amanah budaya H.A.R.A yang menjadi fondasi integritas sumber daya manusia.'
      }
    ]
  }
};

/**
 * Menghitung skor Gate secara objektif, transparan, dan runtut matematis.
 */
export function calculateGateScoreFromRubric(
  stage: GateEvaluationStage,
  checkedRubricIds: string[]
): {
  totalScore: number;
  earnedPoints: number;
  maxPoints: number;
  totalItems: number;
  passedItemsCount: number;
  criticalDeviationFailed: boolean;
  failedCriticalItems: OJTRubricItem[];
  status: GateEvaluationStatus;
  statusLabel: string;
  formulaExplanation: string;
} {
  const definition = OFFICIAL_OJT_GATE_RUBRICS[stage];
  if (!definition) {
    return {
      totalScore: 0,
      earnedPoints: 0,
      maxPoints: 100,
      totalItems: 0,
      passedItemsCount: 0,
      criticalDeviationFailed: false,
      failedCriticalItems: [],
      status: 'BELUM_EVALUASI',
      statusLabel: 'Belum Ada Evaluasi',
      formulaExplanation: 'Rubrik tidak ditemukan.'
    };
  }

  let earnedPoints = 0;
  const failedCriticalItems: OJTRubricItem[] = [];

  definition.items.forEach(item => {
    const isPassed = checkedRubricIds.includes(item.id);
    if (isPassed) {
      earnedPoints += item.bobot_poin;
    } else {
      if (item.is_kritis) {
        failedCriticalItems.push(item);
      }
    }
  });

  const totalScore = Number(((earnedPoints / definition.totalPoinMaksimal) * 100).toFixed(1));
  const criticalDeviationFailed = failedCriticalItems.length > 0;

  // STRICT SOP RULE:
  // If score < 75 OR any critical item failed -> MUST BE REMEDIAL_TERBIMBING
  let status: GateEvaluationStatus = 'LULUS_MANDIRI';
  let statusLabel = 'LULUS MANDIRI (Solo Shift Ready)';

  if (totalScore < 75 || criticalDeviationFailed) {
    status = 'REMEDIAL_TERBIMBING';
    statusLabel = criticalDeviationFailed
      ? `REMEDIAL TERBIMBING (${failedCriticalItems.length} Butir Kritis Gagal)`
      : `REMEDIAL TERBIMBING (Skor ${totalScore} < 75)`;
  } else if (totalScore < 85) {
    status = 'LULUS_BERSYARAT';
    statusLabel = 'LULUS BERSYARAT (Perlu Mentoring Senior)';
  }

  const formulaExplanation = `Rumus Baku: (${earnedPoints} Poin Tercapai / ${definition.totalPoinMaksimal} Poin Maks) × 100 = ${totalScore} Poin. ${
    criticalDeviationFailed ? '⚠️ Terkunci Remedial karena ada butir SOP Kritis yang belum terpenuhi.' : '✓ Lolos ambang batas standar.'
  }`;

  return {
    totalScore,
    earnedPoints,
    maxPoints: definition.totalPoinMaksimal,
    totalItems: definition.items.length,
    passedItemsCount: checkedRubricIds.length,
    criticalDeviationFailed,
    failedCriticalItems,
    status,
    statusLabel,
    formulaExplanation
  };
}
