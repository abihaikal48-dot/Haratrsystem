import { HaraChecklistItem } from '../types';

export interface HaraPillarDefinition {
  key: 'H' | 'A1' | 'R' | 'A2';
  title: string;
  subtitle: string;
  tagline: string;
  visiMisiRef: string;
  description: string;
  items: Omit<HaraChecklistItem, 'terpenuhi'>[];
}

export const HARA_OBJECTIVE_PILLARS: HaraPillarDefinition[] = [
  {
    key: 'H',
    title: 'Halal & Higienis',
    subtitle: 'Standar Sanitasi, APD & Keamanan Pangan HACCP',
    tagline: 'Bekerja Halal',
    visiMisiRef: 'Visi Mutu Autentik & Misi 1 (Produk Berkualitas, Higienis & Terpercaya)',
    description: 'Penilaian kepatuhan mutlak terhadap sanitasi diri, pemakaian APD, sertifikasi halal bahan baku, dan pencegahan kontaminasi silang.',
    items: [
      {
        id: 'H1',
        pilar: 'H',
        pilarName: 'Halal & Higienis',
        kriteria: 'Memakai APD operasional lengkap (seragam bersih, celemek, hairnet/topi, dan sarung tangan standar food grade)',
        kode_sop: 'HC-SOP-SAN-01',
        metode_verifikasi: 'Inspeksi visual kelengkapan dan kebersihan APD saat bertugas',
      },
      {
        id: 'H2',
        pilar: 'H',
        pilarName: 'Halal & Higienis',
        kriteria: 'Mencuci tangan 20 detik dengan sabun antibakteri sebelum memegang makanan atau setelah menyentuh permukaan non-pangan',
        kode_sop: 'HC-SOP-SAN-02',
        metode_verifikasi: 'Uji observasi kepatuhan cuci tangan berkala selama shift',
      },
      {
        id: 'H3',
        pilar: 'H',
        pilarName: 'Halal & Higienis',
        kriteria: 'Memastikan seluruh bahan baku berlabel halal resmi dan tersimpan pada rentang suhu aman (Chiller <4°C, Freezer <-18°C)',
        kode_sop: 'HC-SOP-HACCP-01',
        metode_verifikasi: 'Pemeriksaan log suhu chiller/freezer dan label halal bahan masuk',
      },
      {
        id: 'H4',
        pilar: 'H',
        pilarName: 'Halal & Higienis',
        kriteria: 'Menerapkan pemisahan mutlak alat potong/talenan daging mentah dengan produk ayam matang (Zero Cross-Contamination)',
        kode_sop: 'HC-SOP-SAN-03',
        metode_verifikasi: 'Inspeksi zonasi stasiun kerja dan pemilahan alat warna khusus',
      },
    ],
  },
  {
    key: 'A1',
    title: 'Amanah & Integritas',
    subtitle: 'Akurasi Gramasi, Kasir POS Rp 0 & Disiplin Resep',
    tagline: 'Bertindak Amanah',
    visiMisiRef: 'Misi 2 (Integritas, Efisiensi & Daya Saing Seluruh Rantai Bisnis)',
    description: 'Penilaian kejujuran operasional, kepatuhan gramatur penimbangan bumbu, ketepatan uang kasir POS, dan keteraturan log waste.',
    items: [
      {
        id: 'A1_1',
        pilar: 'A1',
        pilarName: 'Amanah & Integritas',
        kriteria: 'Menimbang gramasi bumbu, marinasi, dan potongan ayam sesuai timbangan digital presisi (toleransi batas deviasi maksimal ±2 gram)',
        kode_sop: 'HC-SOP-KIT-01',
        metode_verifikasi: 'Uji petik timbang gramatur 3 porsi berturut-turut',
      },
      {
        id: 'A1_2',
        pilar: 'A1',
        pilarName: 'Amanah & Integritas',
        kriteria: 'Melakukan closing kasir harian dengan selisih kas Rp 0 dan wajib mencetak struk transaksi resmi untuk setiap pelanggan',
        kode_sop: 'HC-SOP-KAS-02',
        metode_verifikasi: 'Audit laporan rekonsiliasi kasir POS closing shift',
      },
      {
        id: 'A1_3',
        pilar: 'A1',
        pilarName: 'Amanah & Integritas',
        kriteria: 'Disiplin mematuhi timer penggorengan (12-14 menit) dan holding warmer (<90 menit) tanpa mematikan timer lebih awal',
        kode_sop: 'HC-SOP-KIT-02',
        metode_verifikasi: 'Verifikasi pembacaan timer otomatis deep fryer dan display warmer',
      },
      {
        id: 'A1_4',
        pilar: 'A1',
        pilarName: 'Amanah & Integritas',
        kriteria: 'Mencatat limbah ayam afkir/rusak secara faktual pada lembar waste log harian tanpa ada manipulasi data stok',
        kode_sop: 'HC-SOP-INV-01',
        metode_verifikasi: 'Audit kesesuaian fisik tong waste dengan buku log afkir',
      },
    ],
  },
  {
    key: 'R',
    title: 'Responsif & Sigap',
    subtitle: 'Kecepatan Layanan SOS, Tanggap Peak Rush & Hospitality',
    tagline: 'Bergerak Responsif',
    visiMisiRef: 'Misi 1 & 4 (Kepuasan Pelanggan Maksimal & Ketangkasan Operasional)',
    description: 'Penilaian kecepatan transaksi front house, tanggap antrean jam sibuk, keramahan 5S, dan inisiatif mengatasi tumpahan berbahaya.',
    items: [
      {
        id: 'R1',
        pilar: 'R',
        pilarName: 'Responsif & Sigap',
        kriteria: 'Memenuhi standar Speed of Service (Kasir: <90 detik/orang, Geprek: <45 detik/porsi, Runner: <60 detik saji)',
        kode_sop: 'HC-SOP-SOS-01',
        metode_verifikasi: 'Pengukuran sampling waktu dengan stopwatch 5 pelanggan acak',
      },
      {
        id: 'R2',
        pilar: 'R',
        pilarName: 'Responsif & Sigap',
        kriteria: 'Sigap melakukan koordinasi dan saling membantu antar stasiun kerja (kitchen-runner-kasir) saat lonjakan antrean jam sibuk',
        kode_sop: 'HC-SOP-OPS-03',
        metode_verifikasi: 'Observasi dinamika teamwork saat jam sibuk siang/malam',
      },
      {
        id: 'R3',
        pilar: 'R',
        pilarName: 'Responsif & Sigap',
        kriteria: 'Menerapkan kontak 5S (Senyum, Salam, Sapa, Sopan, Santun) dengan kontak mata dalam waktu kurang dari 3 detik saat pelanggan datang',
        kode_sop: 'HC-SOP-KAS-01',
        metode_verifikasi: 'Inspeksi misteri shopper atau observasi langsung evaluator',
      },
      {
        id: 'R4',
        pilar: 'R',
        pilarName: 'Responsif & Sigap',
        kriteria: 'Cepat tanggap membersihkan tumpahan minyak/cairan di lantai dapur dan dining area dalam waktu <60 detik (Zero Slip Hazard)',
        kode_sop: 'HC-SOP-K3-01',
        metode_verifikasi: 'Uji respons pencegahan kecelakaan kerja & rambu licin',
      },
    ],
  },
  {
    key: 'A2',
    title: 'Adaptif & Disiplin Belajar',
    subtitle: 'Penerapan SOP Baru, Coaching GROW & Inisiatif Efisiensi',
    tagline: 'Berkembang Adaptif',
    visiMisiRef: 'Misi 3 & 4 (Peningkatan Produktivitas, Lingkungan Kondusif & Relevan)',
    description: 'Penilaian kemampuan beradaptasi dengan perubahan instruksi kerja, keterbukaan menerima umpan balik coaching, dan inisiatif perbaikan.',
    items: [
      {
        id: 'A2_1',
        pilar: 'A2',
        pilarName: 'Adaptif & Disiplin Belajar',
        kriteria: 'Menerapkan instruksi SOP/resep baru atau koreksi revisi menu operasional dengan cepat dan tepat tanpa resistensi',
        kode_sop: 'HC-SOP-TRN-01',
        metode_verifikasi: 'Pemeriksaan kepatuhan langkah kerja paska rilis update SOP',
      },
      {
        id: 'A2_2',
        pilar: 'A2',
        pilarName: 'Adaptif & Disiplin Belajar',
        kriteria: 'Terbuka menerima masukan coaching GROW dari Trainer/Supervisor dan menunjukkan perbaikan nyata pada shift berikutnya',
        kode_sop: 'HC-SOP-TRN-02',
        metode_verifikasi: 'Tindak lanjut lembar komitmen coaching 1-on-1 sebelumnya',
      },
      {
        id: 'A2_3',
        pilar: 'A2',
        pilarName: 'Adaptif & Disiplin Belajar',
        kriteria: 'Mengoperasikan perangkat tablet audit, POS sistem kasir, atau formulir digital tanpa terjadi kesalahan fatal berulang',
        kode_sop: 'HC-SOP-SYS-01',
        metode_verifikasi: 'Audit ketepatan input data pada aplikasi monitoring outlet',
      },
      {
        id: 'A2_4',
        pilar: 'A2',
        pilarName: 'Adaptif & Disiplin Belajar',
        kriteria: 'Berinisiatif mengusulkan ide perbaikan alur stasiun kerja atau efisiensi waktu penyajian pada briefing harian outlet',
        kode_sop: 'HC-SOP-OPS-04',
        metode_verifikasi: 'Catatan kontribusi ide pada buku log shift atau briefing pagi',
      },
    ],
  },
];

/**
 * Generate default objective checklist for a crew
 */
export function createDefaultHaraChecklist(): HaraChecklistItem[] {
  const items: HaraChecklistItem[] = [];
  HARA_OBJECTIVE_PILLARS.forEach((p) => {
    p.items.forEach((item) => {
      items.push({
        ...item,
        terpenuhi: true, // Default to true or checked for initial sample
      });
    });
  });
  return items;
}

/**
 * Calculate objective H.A.R.A scores based on fulfilled checklist items
 */
export function calculateObjectiveHaraScores(checklist: HaraChecklistItem[]) {
  const calcPillar = (pilarKey: 'H' | 'A1' | 'R' | 'A2') => {
    const pItems = checklist.filter((i) => i.pilar === pilarKey);
    if (pItems.length === 0) return 0;
    const fulfilled = pItems.filter((i) => i.terpenuhi).length;
    return Math.round((fulfilled / pItems.length) * 100);
  };

  const skor_h = calcPillar('H');
  const skor_a1 = calcPillar('A1');
  const skor_r = calcPillar('R');
  const skor_a2 = calcPillar('A2');

  const skor_rata_rata = Math.round((skor_h + skor_a1 + skor_r + skor_a2) / 4);

  return {
    skor_h,
    skor_a1,
    skor_r,
    skor_a2,
    skor_rata_rata,
    totalItems: checklist.length,
    fulfilledCount: checklist.filter((i) => i.terpenuhi).length,
  };
}

/**
 * =========================================================================
 * RUBRIK PENILAIAN OBJEKTIF 7 KRITERIA ONBOARDING HARA CHICKEN
 * (STANDAR MUTU OPERASIONAL - KKM 75)
 * Sesuai Dokumen Master HARA Hal 6
 * =========================================================================
 */
export interface RubrikKriteriaOnboarding {
  nomor: number;
  dimensi: string;
  bobotPersen: number;
  fokusPenilaian: string;
  gradeA: string; // 90 - 100 Sangat Mahir
  gradeB: string; // 75 - 89 Kompeten (Lulus KKM)
  gradeC: string; // 60 - 74 Pembinaan / Evaluasi
  remedial: string; // < 60 Kill-Switch / Gagal
}

export const RUBRIK_PENILAIAN_7_KRITERIA_HARA: RubrikKriteriaOnboarding[] = [
  {
    nomor: 1,
    dimensi: '1. KETEPATAN',
    bobotPersen: 20,
    fokusPenilaian: 'Akurasi timbangan ZERO/TARE, gramatur resep, suhu kompor & deep fryer (160 C / 150 C), dan takaran bahan.',
    gradeA: 'Timbangan selalu di-TARE 0g; gramatur tepat 100% (Nasi 170g, ECO 20g, Sambal 30g, Minyak 15ml); suhu fryer tepat 160 C / 150 C.',
    gradeB: 'Timbangan di-TARE, deviasi gramatur sangat kecil (<5%), suhu fryer sesuai standar SOP.',
    gradeC: 'Kadang lupa menekan TARE; gramatur meleset 5-10%; suhu minyak fryer kurang stabil (+/- 5 C).',
    remedial: 'KILL-SWITCH: Tidak menimbang bahan wajib timbang (Nasi 170g / ECO 20g / Sambal 30g), atau memasukkan ayam pada suhu salah.'
  },
  {
    nomor: 2,
    dimensi: '2. LANGKAH SESUAI SOP',
    bobotPersen: 20,
    fokusPenilaian: 'Kepatuhan checklist tahapan proses kerja dari persiapan bahan, memasak, hingga penyajian dan platting.',
    gradeA: 'Menjalankan 100% urutan langkah SOP tanpa ada tahapan yang terlompati; teknik alat tepat sempurna (2 solet mentai, garpu ayoli).',
    gradeB: 'Menjalankan seluruh langkah esensial SOP; urutan teratur; hasil produk rapi dan terstandar.',
    gradeC: 'Ada 1-2 langkah kecil yang terbalik urutannya namun tidak merusak keamanan pangan produk akhir.',
    remedial: 'KILL-SWITCH: Melanggar titik kendali kritis (ayam berdarah, sambal diblender, tidak mencelup 2x krisbar).'
  },
  {
    nomor: 3,
    dimensi: '3. KECEPATAN & STOPWATCH',
    bobotPersen: 15,
    fokusPenilaian: 'Efisiensi durasi kerja nyata (Prep + Masak + Platting) dibandingkan Target Waktu Realistis End-to-End.',
    gradeA: 'Waktu aktual <= Target Waktu Realistis (atau lebih cepat hingga 10% tanpa mengurangi kualitas).',
    gradeB: 'Waktu aktual tepat sesuai target waktu realistis atau deviasi keterlambatan sangat kecil (<10%).',
    gradeC: 'Keterlambatan waktu 10-25% dari target realistis akibat gerakan ragu-ragu saat persiapan alat/bahan.',
    remedial: 'Keterlambatan parah (>25% dari target realistis) atau panik/bingung total saat operasional stasiun.'
  },
  {
    nomor: 4,
    dimensi: '4. KNOWLEDGE & TITIK KRITIS',
    bobotPersen: 15,
    fokusPenilaian: 'Penguasaan 5 pertanyaan lisan seputar titik kendali kritis (CCP), masa simpan bahan, dan alasan di balik SOP.',
    gradeA: 'Mampu menjawab 5 dari 5 pertanyaan lisan Trainer dengan tegas, tepat, dan menjelaskan alasan ilmiahnya.',
    gradeB: 'Mampu menjawab minimal 4 dari 5 pertanyaan lisan dengan benar dan memahami prosedur dasarnya.',
    gradeC: 'Hanya mampu menjawab 3 dari 5 pertanyaan; pemahaman terhadap titik kritis holding time masih ragu.',
    remedial: 'Hanya mampu menjawab <3 pertanyaan; tidak mengetahui bahaya kontaminasi silang dan K3 kebakaran minyak.'
  },
  {
    nomor: 5,
    dimensi: '5. KERJA SAMA TIM & STASIUN',
    bobotPersen: 10,
    fokusPenilaian: 'Komunikasi verbal saat jam sibuk, serah terima alat stasiun, kepekaan membantu rekan, dan sinergi batch.',
    gradeA: 'Komunikasi call-out jelas ("Ayam masuk!", "Order nasgor!"); proaktif membantu stasiun lain yang overload.',
    gradeB: 'Koordinasi baik dengan rekan satu stasiun; saling menjaga alur antrean pesanan tanpa gesekan.',
    gradeC: 'Pasif; hanya bekerja jika disuruh; kurang melakukan komunikasi call-out saat memindahkan makanan panas.',
    remedial: 'Individualis; memicu bottleneck stasiun kerja; menyalahkan rekan kerja saat pesanan terlambat.'
  },
  {
    nomor: 6,
    dimensi: '6. KEBERSIHAN, GROOMING & 4 LAP',
    bobotPersen: 10,
    fokusPenilaian: 'Standar personal grooming (kuku, rambut, seragam), prinsip Clean as you go, dan disiplin 4 jenis lap resmi.',
    gradeA: 'Grooming 100% sesuai HC-SOP-11-PKP; meja selalu bersih; penggunaan 4 warna lap presisi tanpa salah fungsi.',
    gradeB: 'Grooming rapi; stasiun kerja bersih; membedakan kanebo piring vs lap meja orange vs lap kotak basah/kering.',
    gradeC: 'Grooming cukup; meja sempat kotor berceceran minyak/tepung sebelum dibersihkan; 1x tertukar fungsi lap.',
    remedial: 'KILL-SWITCH: Kuku panjang/cat kuku; menggunakan lap lantai untuk piring; menaruh makanan jatuh ke meja.'
  },
  {
    nomor: 7,
    dimensi: '7. KEAKTIFAN & INISIATIF',
    bobotPersen: 10,
    fokusPenilaian: 'Antusiasme selama sesi demo Trainer, inisiatif bertanya hal teknis, dan kesigapan saat praktik mandiri.',
    gradeA: 'Sangat antusias; aktif mencatat poin kritis; sigap mengambil inisiatif persiapan alat tanpa menunggu instruksi.',
    gradeB: 'Fokus memperhatikan demo; aktif merespon pertanyaan Trainer; bersemangat menyelesaikan tugas praktik.',
    gradeC: 'Cukup memperhatikan namun pasif bertanya; menunggu perintah baru bergerak menyiapkan bahan baku.',
    remedial: 'Tidak fokus; mengantuk atau bermain handphone selama sesi materi/praktik; menunjukkan sikap apatis.'
  }
];

export function hitungSkorKomposit7Kriteria(scores: {
  ketepatan: number;
  langkahSop: number;
  kecepatan: number;
  knowledge: number;
  kerjaSama: number;
  kebersihan: number;
  keaktifan: number;
}) {
  const skorKomposit =
    scores.ketepatan * 0.20 +
    scores.langkahSop * 0.20 +
    scores.kecepatan * 0.15 +
    scores.knowledge * 0.15 +
    scores.kerjaSama * 0.10 +
    scores.kebersihan * 0.10 +
    scores.keaktifan * 0.10;

  const skorRounded = Math.round(skorKomposit * 10) / 10;
  let status: 'LULUS MAHIR (GRADE A)' | 'LULUS KOMPETEN (KKM >=75)' | 'WAJIB REMEDIAL (<75)';
  let grade: 'A' | 'B' | 'C' | 'Remedial';

  if (skorRounded >= 85.0) {
    status = 'LULUS MAHIR (GRADE A)';
    grade = 'A';
  } else if (skorRounded >= 75.0) {
    status = 'LULUS KOMPETEN (KKM >=75)';
    grade = 'B';
  } else {
    status = 'WAJIB REMEDIAL (<75)';
    grade = 'Remedial';
  }

  return { skorKomposit: skorRounded, status, grade };
}

