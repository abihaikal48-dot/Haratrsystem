import {
  OnboardingChecklistItem,
  CrewOnboardingProgress,
  Division,
  TrainingMethodKey
} from '../types';

// =========================================================================
// WORLD-CLASS TRAINING METHODOLOGIES (DATA & METODE TERBAIK DUNIA)
// =========================================================================

export interface WorldClassTrainingMethod {
  id: TrainingMethodKey;
  name: string;
  tagline: string;
  isBestMethod: boolean;
  badgeLabel: string;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    accent: string;
  };
  globalBenchmark: string;
  scientificBasis: string;
  efficiencyScore: number; // in %
  retentionRate: number; // in %
  adaptationSpeed: string;
  bestFitProfile: string;
  coreSteps: {
    stepNumber: number;
    title: string;
    trainerAction: string;
    traineeAction: string;
    qsrApplication: string;
  }[];
  pedagogicalPrinciples: string[];
  trainerChecklistRule: string;
  dailyRoutineSummary: string;
  evaluationRubricType: string;
}

export const WORLD_CLASS_TRAINING_METHODS: WorldClassTrainingMethod[] = [
  {
    id: 'hybrid_twi_spaced',
    name: 'Metode Ter-Baik: Hybrid TWI 4-Step + Spaced Deliberate Practice',
    tagline: 'World Gold Standard F&B QSR (Toyota JIT + McDonald\'s Hamburger University)',
    isBestMethod: true,
    badgeLabel: 'METODE TER-BAIK (REKOMENDASI EMAS)',
    colorScheme: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      text: 'text-emerald-900',
      accent: '#059669',
    },
    globalBenchmark: 'Toyota TWI Job Instruction (JIT) dipadukan dengan Anders Ericsson Deliberate Practice & Ebbinghaus Spaced Repetition.',
    scientificBasis: 'Merampingkan beban kognitif (Cognitive Load Theory) menjadi 4 kuadran presisi. Menghilangkan "asumsi" dan membiasakan Active Recall langsung di stasiun produksi.',
    efficiencyScore: 96,
    retentionRate: 94,
    adaptationSpeed: '14 - 21 Hari ke Kemandirian Solo Shift',
    bestFitProfile: 'Direkomendasikan untuk seluruh kru baru F&B QSR yang menginginkan zero defect, kepatuhan rasa 100%, dan zero kecelakaan kerja.',
    coreSteps: [
      {
        stepNumber: 1,
        title: 'Step 1: Prepare the Trainee (Kesiapan Mental & K3)',
        trainerAction: 'Menenangkan kru, menjelaskan arti penting stasiun bagi pelanggan dan gerai, memvalidasi pemahaman APD & grooming.',
        traineeAction: 'Mempersiapkan alat & bahan, mengenakan APD lengkap, mengutarakan apa yang sudah diketahui tentang stasiun.',
        qsrApplication: 'Pengecekan suhu minyak fryer dan takaran beras Miyako sebelum proses dimulai.',
      },
      {
        stepNumber: 2,
        title: 'Step 2: Present the Operation (Peragaan 1-per-1 + Poin Kritis)',
        trainerAction: 'Mendemonstrasikan prosedur satu per satu secara perlahan. Menekankan "Key Points" (alasan suhu 160°C, gramasi bumbu eco 20g, dsb.).',
        traineeAction: 'Mengamati dengan fokus, mencatat poin kritis di lembar modul stasiun, menanyakan hal yang belum jelas.',
        qsrApplication: 'Trainer memperagakan cubit lembut tepung 2x dan memasukkan ayam satu per satu tanpa melempar.',
      },
      {
        stepNumber: 3,
        title: 'Step 3: Try-out Performance (Praktik Mandiri + Active Recall)',
        trainerAction: 'Mengamati trainee mempraktikkan. Meminta trainee menyuarakan apa yang dilakukannya dan mengapa poin kritis itu penting.',
        traineeAction: 'Mempraktikkan langsung sambil menjelaskan langkah dan alasan keselamatan/kualitas kepada trainer.',
        qsrApplication: 'Trainee menepungi ayam, mengecek termometer 160°C, dan menyetel timer 12 menit sambil menjelaskan alasannya.',
      },
      {
        stepNumber: 4,
        title: 'Step 4: Follow-up & Spaced Coaching (Pendampingan Bertahap)',
        trainerAction: 'Melepas trainee bekerja mandiri, namun melakukan spot-check acak di hari ke-1, ke-3, ke-7, ke-14, dan ke-30.',
        traineeAction: 'Menjalankan shift mandiri, segera melapor kepada trainer jika menemui anomali kualitas bahan baku.',
        qsrApplication: 'Audit rasa nasi goreng dan kerenyahan kulit ayam pada jam sibuk shift kerja.',
      },
    ],
    pedagogicalPrinciples: [
      'Alasan di balik tindakan (Explain the WHY behind every step)',
      'Koreksi seketika tanpa mempermalukan (Instant corrective feedback)',
      'Active Recall: Trainee menjelaskan ke trainer, bukan hanya mendengar',
      'Spaced repetition audit untuk mencegah degradasi ingatan SOP',
    ],
    trainerChecklistRule: 'Trainer wajib mendengarkan trainee melafalkan poin kritis sebelum memberikan centang verifikasi kelulusan.',
    dailyRoutineSummary: '10 menit briefing TWI -> 45 menit demonstrasi & praktik terbimbing -> Observasi solo shift -> 10 menit evaluasi 4-langkah pasca shift.',
    evaluationRubricType: 'Rubrik Skor Terpadu: Kepatuhan Langkah (40%), Pemahaman Poin Kritis (30%), Kecepatan Kerja (30%).',
  },
  {
    id: 'buddy_apprenticeship',
    name: 'Metode 2: Dual-Buddy Shadowing & 1-on-1 Apprenticeship',
    tagline: 'Scaffolding Hands-on Vygotsky & Companion Chef Model',
    isBestMethod: false,
    badgeLabel: 'METODE KINESTETIK / SHADOWING',
    colorScheme: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-900',
      accent: '#2563eb',
    },
    globalBenchmark: 'Sistem Magang Brigade de Cuisine Prancis & Companion Buddy Training pada jaringan franchise cepat saji global.',
    scientificBasis: 'Teori Belajar Sosial Lev Vygotsky: Zone of Proximal Development (ZPD) & Scaffolding bertahap bersama Senior Mentor.',
    efficiencyScore: 88,
    retentionRate: 85,
    adaptationSpeed: '21 - 28 Hari ke Kemandirian Solo Shift',
    bestFitProfile: 'Sangat cocok untuk kru tipe visual-kinestetik yang lebih cepat belajar dari meniru langsung gerak gerik senior di lapangan.',
    coreSteps: [
      {
        stepNumber: 1,
        title: 'Fase I: Direct Shadowing (100% Mengamati Buddy)',
        trainerAction: 'Senior Buddy menjalankan stasiun kerja sambil mengomentari secara verbal setiap gerakan tangan dan keputusan.',
        traineeAction: 'Berdiri di samping buddy, mencatat ritme kerja, membantu persiapan alat ringan.',
        qsrApplication: 'Melihat senior mengulek sambal bawang level 3 dengan takaran cabai pas dan siraman minyak panas.',
      },
      {
        stepNumber: 2,
        title: 'Fase II: Assisted Co-Pilot (50% Kolaborasi)',
        trainerAction: 'Membagi tugas: trainee menangani persiapan/finishing, buddy menangani titik kontrol utama.',
        traineeAction: 'Mulai menangani penepungan dan pengemasan pesanan di bawah bimbingan langsung di sampingnya.',
        qsrApplication: 'Trainee menepungi ayam, senior buddy yang memasukkan dan mengawasi deep fryer.',
      },
      {
        stepNumber: 3,
        title: 'Fase III: Reverse Shadowing (Trainee Memimpin, Buddy Membantu)',
        trainerAction: 'Senior bertindak sebagai asisten/helper, mengawasi apakah ada deviasi SOP yang dilakukan trainee.',
        traineeAction: 'Menjadi penanggung jawab utama stasiun sepanjang shift sibuk.',
        qsrApplication: 'Trainee mengoperasikan kasir POS dari opening sampai closing, senior hanya mengecek jika ada void.',
      },
      {
        stepNumber: 4,
        title: 'Fase IV: Solo Flight dengan Buddy On-Call',
        trainerAction: 'Senior bertugas di stasiun lain tetapi selalu siap dipanggil saat terjadi kendala darurat.',
        traineeAction: 'Bekerja mandiri penuh 100%.',
        qsrApplication: 'Kru memegang stasiun dapur sendiri selama 1 shift utuh.',
      },
    ],
    pedagogicalPrinciples: [
      'Model 70/20/10: 70% belajar di lapangan, 20% feedback dari buddy, 10% baca dokumen',
      'Ikatan psikologis aman (Psychological Safety)',
      'Tiru, Koreksi, Mandiri (Imitate, Correct, Master)',
    ],
    trainerChecklistRule: 'Verifikasi diberikan setelah Senior Buddy dan Trainer Lapangan menandatangani lembar rekomendasi bersama.',
    dailyRoutineSummary: 'Pre-shift goal setting dengan buddy -> Kerja berdampingan -> Post-shift debrief 15 menit kopi/teh santai.',
    evaluationRubricType: 'Rubrik Observasi Perilaku Lapangan: Kecepatan Respon (35%), Kerapian Stasiun (35%), Komunikasi Tim (30%).',
  },
  {
    id: 'agile_gamified_sprints',
    name: 'Metode 3: Agile Micro-Sprints & Gamified Station Mastery Badges',
    tagline: 'Microlearning Sprints & Station Quest System (Domino\'s & Starbucks Model)',
    isBestMethod: false,
    badgeLabel: 'METODE MODEREN / GAMIFIKASI',
    colorScheme: {
      bg: 'bg-purple-50',
      border: 'border-purple-300',
      text: 'text-purple-900',
      accent: '#9333ea',
    },
    globalBenchmark: 'Agile Operations Sprint (Spotify/Scrum) diadaptasi ke F&B oleh Domino\'s Pizza "Pizza Olympics" & Starbucks Barista Quest.',
    scientificBasis: 'Behavioral Psychology (B.F. Skinner Operant Conditioning) + Gamifikasi Karl Kapp (Clear Goals, Instant Progress, Milestone Rewards).',
    efficiencyScore: 91,
    retentionRate: 89,
    adaptationSpeed: '18 - 25 Hari ke Kemandirian Solo Shift',
    bestFitProfile: 'Sangat cocok untuk kru muda Gen-Z, kru dinamis yang termotivasi oleh pencapaian target harian dan lencana keahlian.',
    coreSteps: [
      {
        stepNumber: 1,
        title: 'Daily Quest Sprint Planning (Target 1 Shift)',
        trainerAction: 'Menentukan 1 target tantangan stasiun spesifik (misal: "Hari ini target Quest: 0 gram sisa bumbu eco").',
        traineeAction: 'Menerima target quest harian, menyetel timer dan fokus pada mikro-kompetensi tersebut.',
        qsrApplication: 'Quest memasak 5 batch Nasi Goreng dengan waktu saji rata-rata di bawah 3.5 menit.',
      },
      {
        stepNumber: 2,
        title: 'Micro-Drill Station Challenge (Simulasi Tekanan)',
        trainerAction: 'Memberikan skenario pesanan cepat (rush hour drill) selama 15 menit.',
        traineeAction: 'Mengeksekusi pesanan dengan menjaga standar kualitas dan kebersihan meja.',
        qsrApplication: 'Simulasi 10 porsi Ayam Geprek sambal bawang pedas bervariasi dalam 8 menit.',
      },
      {
        stepNumber: 3,
        title: 'XP Point & Badge Unlock Verification',
        trainerAction: 'Menilai akurasi dan kecepatan, memberikan lencana stasiun: Bronze, Silver, Gold, atau Station Master.',
        traineeAction: 'Mengumpulkan lencana stasiun untuk membuka akses ke shift mandiri dan sertifikasi gaji kru madya.',
        qsrApplication: 'Penyematan Pin/Lencana "Master Fryer" setelah sukses 20 batch ayam tanpa gosong.',
      },
      {
        stepNumber: 4,
        title: 'Sprint Retrospective & Next Level Unlock',
        trainerAction: 'Membahas apa yang berjalan lancar dan hambatan mikro apa yang memperlambat gerakan tangan.',
        traineeAction: 'Mengidentifikasi 1 perbaikan teknik untuk sprint esok hari.',
        qsrApplication: 'Perbaikan tata letak jepitan dan saringan minyak agar tidak ada waktu terbuang.',
      },
    ],
    pedagogicalPrinciples: [
      'Pecah SOP kompleks menjadi mikro-tugas 15 menit (Micro-learning chunks)',
      'Reward instan atas kepatuhan SOP (Gamified feedback loops)',
      'Kompetisi positif terhadap rekor pribadi (Continuous self-improvement)',
    ],
    trainerChecklistRule: 'Checklist diverifikasi per modul quest harian dengan skor poin XP dan catatan waktu tercepat tanpa deviasi rasa.',
    dailyRoutineSummary: '5 min Quest Briefing -> Pelaksanaan Quest saat shift -> 10 min Penghitungan XP dan Badge Review.',
    evaluationRubricType: 'Leaderboard & Mastery Level: Kecepatan Detik (40%), Poin Kepatuhan Kualitas (40%), Zero Waste (20%).',
  },
  {
    id: 'flipped_retrieval',
    name: 'Metode 4: Flipped Station & Cognitive Retrieval Drill',
    tagline: 'Harvard Active Retrieval & Pre-Shift Cognitive Conditioning',
    isBestMethod: false,
    badgeLabel: 'METODE KOGNITIF / FLIPPED',
    colorScheme: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      text: 'text-amber-900',
      accent: '#d97706',
    },
    globalBenchmark: 'Metode Harvard Flipped Classroom + Dunlosky & Roediger Cognitive Psychology (Testing Effect & Retrieval Practice).',
    scientificBasis: 'Otak memperkuat jalur saraf saat dipaksa "mengeluarkan" ingatan (retrieval), bukan saat pasif mendengarkan penjelasan.',
    efficiencyScore: 90,
    retentionRate: 92,
    adaptationSpeed: '16 - 22 Hari ke Kemandirian Solo Shift',
    bestFitProfile: 'Cocok untuk calon kru bintang, calon Supervisor/Team Leader, serta kru yang terbiasa membaca mandiri sebelum bekerja.',
    coreSteps: [
      {
        stepNumber: 1,
        title: 'Pre-Shift Flashcard Study (Mandiri 10 Menit)',
        trainerAction: 'Menyediakan kartu flashcard SOP dan video ringkas di handphone/lembar saku kru.',
        traineeAction: 'Mempelajari langkah SOP, rasio bumbu, dan suhu kritis 10 menit sebelum jam shift dimulai.',
        qsrApplication: 'Menghafal rasio air nasi Miyako (3:4, 4:5, 5:6, 6:8) dan formula bumbu sayur sop.',
      },
      {
        stepNumber: 2,
        title: 'Pre-Shift Retrieval Gate (Kuis Lisan Spontan)',
        trainerAction: 'Melontarkan 3 pertanyaan kuis acak sebelum mengizinkan kru masuk ke stasiun dapur.',
        traineeAction: 'Menjawab dengan percaya diri tanpa melihat catatan modul.',
        qsrApplication: '"Berapa suhu kompor dan suhu minyak untuk goreng ayam? Mengapa harus 160°C?"',
      },
      {
        stepNumber: 3,
        title: 'Zero-Lecture Shift (100% Praktik & Audit)',
        trainerAction: 'Trainer tidak lagi mengulang teori; fokus sepenuhnya menguji konsistensi hasil masakan.',
        traineeAction: 'Bekerja dengan penuh kemandirian mengacu pada memori kognitif yang telah dibangun.',
        qsrApplication: 'Menggoreng kulit krispi 150°C selama 12 menit tepat sesuai memori SOP.',
      },
      {
        stepNumber: 4,
        title: 'Cold-Calling Skenario Krisis',
        trainerAction: 'Memberikan skenario anomali mendadak (misal: listrik padam, minyak berasap, komplain bumbu asin).',
        traineeAction: 'Menjalankan prosedur tanggap darurat dan service recovery L.A.S.T seketika.',
        qsrApplication: 'Penerapan SOP L.A.S.T dalam 60 detik menangani tamu yang komplain sambal kurang pedas.',
      },
    ],
    pedagogicalPrinciples: [
      'Belajar teori di luar dapur, gunakan waktu dapur 100% untuk eksekusi',
      'The Testing Effect: Menguji diri sendiri meningkatkan daya ingat hingga 300%',
      'Skenario simulasi tekanan mental untuk melatih ketenangan saat jam sibuk',
    ],
    trainerChecklistRule: 'Trainee wajib lulus uji retrieval lisan 100% benar sebelum diizinkan menandatangani modul stasiun.',
    dailyRoutineSummary: '10 min Pre-shift study -> 5 min Retrieval Gate Quiz -> Shift Kerja -> 5 min Evaluasi Kognitif.',
    evaluationRubricType: 'Rubrik Skor Kognitif & Aksi: Uji Lisan Retensi (50%), Ketepatan Praktik Nyata (50%).',
  },
  {
    id: 'tqm_haccp_zerodefect',
    name: 'Metode 5: Total Quality Management & Six-Sigma HACCP Zero-Defect',
    tagline: 'Deming TQM & Codex Alimentarius Precision Control',
    isBestMethod: false,
    badgeLabel: 'METODE AUDIT KETAT / SIX-SIGMA',
    colorScheme: {
      bg: 'bg-rose-50',
      border: 'border-rose-300',
      text: 'text-rose-900',
      accent: '#e11d48',
    },
    globalBenchmark: 'W. Edwards Deming Total Quality Management (TQM) + Six Sigma DMAIC + Standar Keamanan Pangan Codex Alimentarius HACCP.',
    scientificBasis: 'Penghapusan variabilitas proses (Statistical Process Control). Setiap gram, detik, dan derajat celcius adalah standar mati tanpa kompromi.',
    efficiencyScore: 93,
    retentionRate: 95,
    adaptationSpeed: '20 - 30 Hari ke Kemandirian Solo Shift',
    bestFitProfile: 'Sangat cocok untuk gerai flagship beromzet tinggi, outlet bandara/mall, kru QC Internal, dan penanganan katering partai besar.',
    coreSteps: [
      {
        stepNumber: 1,
        title: 'HACCP Critical Control Point (CCP) Briefing',
        trainerAction: 'Mengulas titik kritis kontaminasi silang, batas suhu danger zone (5°C - 60°C), dan kalibrasi termometer tusuk.',
        traineeAction: 'Mengisi form kalibrasi termometer menggunakan air es 0°C dan air mendidih 100°C.',
        qsrApplication: 'Memastikan suhu inti ayam goreng mencapai minimal 74°C hingga ke bagian tulang terdalam.',
      },
      {
        stepNumber: 2,
        title: 'Timbangan Gramasi Presisi & Poka-Yoke (Mistake Proofing)',
        trainerAction: 'Menimbang bahan menggunakan timbangan digital presisi 0.1 gram.',
        traineeAction: 'Menakar bumbu eco nasi goreng tepat 20 gram, mix sayur tepat 30 gram tanpa perkiraan kira-kira.',
        qsrApplication: 'Porsi kulit mentah 50 gram harus menghasilkan kulit matang tepat 60 gram.',
      },
      {
        stepNumber: 3,
        title: 'Statistical Sampling & Zero-Defect Inspection',
        trainerAction: 'Mengambil sampel acak produk jadi setiap pergantian batch masak.',
        traineeAction: 'Memperbaiki langsung jika ada deviasi warna, kerenyahan, atau berat porsi.',
        qsrApplication: 'Memeriksa warna golden brown ayam krispi menggunakan kartu pembanding warna standar QSR.',
      },
      {
        stepNumber: 4,
        title: 'Root Cause Analysis (5-Why DMAIC)',
        trainerAction: 'Jika terjadi produk gagal (gosong/lembek), mengajak kru menganalisis penyebab akar (5-Why).',
        traineeAction: 'Mencatat akar masalah dan berkomitmen tidak mengulanginya.',
        qsrApplication: 'Menemukan akar masalah kerak minyak karena keterlambatan pengurasan di atas 20 kg ayam.',
      },
    ],
    pedagogicalPrinciples: [
      'Kualitas dibuat di stasiun, bukan diuji di meja makan (Quality at the Source)',
      'Toleransi deviasi nol (Zero Tolerance on Food Safety & Recipe)',
      'Keputusan berbasis data angka dan timbangan, bukan rasa kira-kira',
    ],
    trainerChecklistRule: 'Checklist hanya dapat ditandatangani jika hasil timbangan dan suhu mencapai skor akurasi 100%.',
    dailyRoutineSummary: 'Audit CCP awal shift -> Sampling gramasi per batch -> Pencatatan log suhu fryer -> 5-Why analysis akhir shift.',
    evaluationRubricType: 'Rubrik Zero-Defect: Presisi Gramasi (35%), Kepatuhan Suhu & Waktu (35%), Sanitasi & FIFO (30%).',
  },
];

// =========================================================================
// OFFICIAL DETAILED ONBOARDING CURRICULUM (30 - 60 - 90 HARI)
// DIPADUKAN LENGKAP DENGAN SELURUH SOP RESMI HARA CHICKEN
// =========================================================================

export const OFFICIAL_ONBOARDING_CURRICULUM: OnboardingChecklistItem[] = [
  // =========================================================================
  // FASE 1: BULAN 1 (HARI 1 - 30) - FONDASI, GROOMING, HYGIENE & STASIUN PRIMER
  // =========================================================================

  // --- MINGGU 1: ORIENTASI, GROOMING, HYGIENE & K3 DASAR ---
  {
    id: 'f1-w1-01',
    phase: 'fase_1_30',
    week: 1,
    divisi: 'Semua',
    kategori: 'Hygiene & K3',
    title: 'Orientasi Nilai Hara Chicken & Standar Seragam / Grooming (HC-SOP-GEN-01)',
    description: 'Memahami filosofi rasa dan pelayanan Hara Chicken, mematuhi standar seragam bersih, hairnet/topi rapat menutup rambut, kuku pendek higienis, dan pemakaian sepatu anti-slip.',
    sopRef: 'HC-SOP-GEN-01',
    langkahDetail: [
      'Gunakan seragam resmi Hara Chicken yang telah dicuci bersih dan disetrika rapi.',
      'Pasang hairnet/topi menutupi seluruh helai rambut agar tidak ada rambut yang jatuh ke makanan.',
      'Potong kuku tangan pendek dan bersih; dilarang menggunakan cat kuku atau kuku palsu.',
      'Lepas semua perhiasan tangan (cincin, gelang, jam tangan) saat bertugas di area penanganan makanan.',
      'Kenakan celemek (apron) bersih dan sepatu kerja tertutup dengan sol anti-slip (non-slip footwear).'
    ],
    haccpControl: 'Bahaya Fisik (Foreign Objects): Rambut atau perhiasan jatuh ke dalam makanan dapat memicu komplain fatal dan risiko tersedak.',
    alasanKunci: 'Penampilan yang bersih mencerminkan higienitas dapur dan membangun kepercayaan pelanggan seketika saat pertama kali melihat gerai.',
    criticalPoints: [
      'Topi/hairnet menutup rambut 100%, celemek bersih tanpa noda minyak sisa kemarin.',
      'Sepatu tertutup bersol karet anti-slip wajib dikenakan di lantai dapur yang berpotensi licin.',
      'Tidak mengenakan perhiasan tangan apapun selama berada di area operasional makanan.'
    ],
    kriteriaVerifikasi: 'Trainer melakukan inspeksi fisik grooming dan seragam kru sebelum jam shift dimulai.',
    metodeTraining: 'Demonstrasi 4-Langkah',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Trainer mendemonstrasikan cara memakai seragam dan hairnet yang benar, menjelaskan risiko rambut jatuh, lalu trainee mempraktikkan di depan cermin stasiun.',
      buddy_apprenticeship: 'Senior buddy memeriksa kerapian kru baru setiap hari selama 7 hari pertama dan saling membetulkan apron.',
      agile_gamified_sprints: 'Quest Harian: "Perfect Grooming Streak 7 Hari Berturut-turut" untuk mendapatkan Pin Kehormatan Grooming.',
      flipped_retrieval: 'Kru baru membaca panduan grooming malam sebelumnya, trainer memberikan kuis lisan 3 poin kritis sebelum gerbang shift dibuka.',
      tqm_haccp_zerodefect: 'Checklist audit grooming 10 butir dengan toleransi deviasi 0% (Score 100% required).'
    }
  },
  {
    id: 'f1-w1-02',
    phase: 'fase_1_30',
    week: 1,
    divisi: 'Semua',
    kategori: 'Hygiene & K3',
    title: 'SOP Cuci Tangan 6 Langkah WHO & 5 Momen Higiene Kritis (HC-SOP-GEN-02)',
    description: 'Mempraktikkan teknik cuci tangan 20 detik menggunakan air mengalir dan sabun antibakteri pada momen krusial F&B, serta pengeringan dengan tisu sekali pakai.',
    sopRef: 'HC-SOP-GEN-02',
    langkahDetail: [
      'Basahi kedua tangan dengan air bersih mengalir.',
      'Tuangkan sabun antiseptik secukupnya ke telapak tangan.',
      'Gosok telapak tangan, punggung tangan, sela-sela jari, buku-buku jari dengan posisi mengunci.',
      'Gosok memutar ibu jari kanan dan kiri, lalu gosokkan ujung kuku pada telapak tangan.',
      'Bilas bersih dengan air mengalir selama minimal 20 detik.',
      'Keringkan dengan tisu single-use, gunakan tisu untuk menutup kran air agar tangan tidak terkontaminasi kembali.'
    ],
    haccpControl: 'Bahaya Biologis (Cross-Contamination): Bakteri E. coli, Salmonella, dan Staphylococcus aureus dari tangan kotor berpindah ke makanan siap saji.',
    alasanKunci: 'Cuci tangan 6 langkah terbukti menurunkan kontaminasi bakteri patogen hingga 99.8% pada industri makanan cepat saji.',
    criticalPoints: [
      'Wajib cuci tangan: sebelum sentuh makanan, setelah pegang uang tunai, setelah dari toilet, setelah buang sampah, dan setelah sentuh ayam mentah.',
      'Dilarang mengeringkan tangan menggunakan lap kain bersama atau celemek kerja.'
    ],
    kriteriaVerifikasi: 'Trainee mendemonstrasikan 6 langkah cuci tangan tanpa kesalahan urutan di hadapan trainer.',
    metodeTraining: 'Praktik Terbimbing',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Trainer memperagakan 6 gerakan, trainee menirukan sambil menyuarakan nama bagian tangan yang digosok, diverifikasi 3x sehari.',
      buddy_apprenticeship: 'Buddy menegur seketika jika melihat trainee menyentuh makanan setelah memegang uang tanpa cuci tangan.',
      agile_gamified_sprints: 'Micro-Drill: Tantangan cuci tangan sempurna 20 detik pas menggunakan timer stasiun cuci piring.',
      flipped_retrieval: 'Trainee diminta mempraktikkan 6 langkah secara refleks saat trainer berteriak "Handwash Audit!".',
      tqm_haccp_zerodefect: 'Pemeriksaan swab berkala atau audit checklist sanitasi cuci tangan 5 kali per shift.'
    }
  },
  {
    id: 'f1-w1-03',
    phase: 'fase_1_30',
    week: 1,
    divisi: 'Semua',
    kategori: 'Hygiene & K3',
    title: 'K3 & Tanggap Darurat Minyak Panas Fryer & Gas LPG (HC-SOP-GEN-03)',
    description: 'Mengetahui letak APAR, tombol darurat pemutus arus listrik, valve regulator gas, serta prosedur dilarang menyiram air ke minyak panas menyala (Grease Fire).',
    sopRef: 'HC-SOP-GEN-03',
    langkahDetail: [
      'Kenali lokasi tabung pemadam api (APAR jenis Chemical Foam / Powder) dan Fire Blanket di gerai.',
      'Pahami cara melepas regulator tabung gas jika tercium bau gas menyengat (buka ventilasi, jangan nyalakan saklar listrik).',
      'Jika minyak fryer terbakar: JANGAN PERNAH menyiram air. Tutup fryer dengan penutup logam atau fire blanket untuk memutus oksigen.',
      'Matikan tombol daya utama kompor gas dan listrik jika terjadi percikan atau kebakaran.',
      'Hafalkan nomor darurat dan jalur evakuasi pintu darurat outlet.'
    ],
    haccpControl: 'Bahaya Keselamatan Jiwa: Ledakan uap (boil-over explosion) jika air mengenai minyak mendidih 160°C.',
    alasanKunci: 'Reaksi air pada minyak panas menghasilkan ekspansi uap 1700x lipat yang menyemburkan kobaran api fatal ke seluruh dapur.',
    criticalPoints: [
      'Dilarang keras menyiramkan air ke minyak goreng mendidih atau fryer terbakar.',
      'Tahu cara memutar tuas APAR (Metode PASS: Pull, Aim, Squeeze, Sweep) dan menutup regulator gas.'
    ],
    kriteriaVerifikasi: 'Uji lisan titik evakuasi dan simulasi tindakan darurat APAR tanpa ragu dalam 30 detik.',
    metodeTraining: 'Simulasi / Roleplay',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Simulasi peran skenario gas mendesis dan minyak panas, trainee mempraktikkan respon tanggap dalam 30 detik.',
      buddy_apprenticeship: 'Senior buddy memandu tur fisik seluruh titik keselamatan dan posisi APAR serta switch darurat outlet.',
      agile_gamified_sprints: 'Safety Drill Challenge: Trainee harus mampu menemukan tombol gas dan APAR dalam < 10 detik.',
      flipped_retrieval: 'Kuis kognitif darurat: "Apa yang kamu lakukan jika minyak fryer tiba-tiba mengeluarkan asap hitam tebal?"',
      tqm_haccp_zerodefect: 'Inspeksi checklist K3 harian (tekanan APAR, segel selang gas, kartu inspeksi bulanan).'
    }
  },

  // --- MINGGU 2: PENGUASAAN STASIUN PRIMER (KITCHEN / KASIR / GEPREK) ---
  {
    id: 'f1-w2-01',
    phase: 'fase_1_30',
    week: 2,
    divisi: 'Kitchen',
    kategori: 'Station Core',
    title: 'SOP Menanak Nasi Rice Cooker Gas Miyako (HC-SOP-KIT-01)',
    description: 'Menstandarkan takaran cuci beras 3x bilas, perbandingan baku air (3:4, 4:5, 5:6, 6:8), penyalaan api kecil kiri lalu cook kanan, tanak 15 menit, dan batas magicom 30 menit.',
    sopRef: 'HC-SOP-KIT-01',
    langkahDetail: [
      'Ambil maksimal 6 cup beras (Merk Miyako standar Hara Chicken).',
      'Cuci bersih beras minimal 3 kali bilas hingga air bilasan jernih dan bebas kotoran.',
      'Masukkan beras ke dalam panci wadah rice cooker gas.',
      'Tambahkan air bersih dengan perbandingan baku: 3 cup beras : 4 cup air | 4 cup beras : 5 cup air | 5 cup beras : 6 cup air | 6 cup beras : 8 cup air.',
      'Cek isi tabung gas lalu buka tuas saluran gas utama.',
      'Tekan tombol api kecil (sebelah kiri), lalu tekan tombol COOK ke bawah (sebelah kanan).',
      'Tunggu hingga tombol COOK kembali ke posisi semula (jegleg berbunyi).',
      'Biarkan sekitar 15 menit (agar nasi tanak sempurna dari uap panas) sebelum dipindahkan ke magicom penghangat.',
      'Nasi tidak boleh dibiarkan di dalam rice cooker gas lebih dari 30 menit agar tidak mengeras dan berkerak.'
    ],
    haccpControl: 'Kualitas Fisik & Bakteriologis (Bacillus cereus): Nasi mentah/lembek merusak kepuasan pelanggan; nasi basi akibat suhu holding yang salah.',
    alasanKunci: 'Waktu tunggu 15 menit setelah tombol jegleg adalah fase gelatinisasi pati beras yang mengubah nasi pera menjadi pulen mengkilap.',
    criticalPoints: [
      'Setelah tombol jegleg, dilarang langsung membuka atau memindahkan nasi sebelum 15 menit masa tanak.',
      'Dilarang menyalakan tombol kanan (COOK) sebelum tombol kiri (api kecil) menyala.',
      'Rasio air wajib tepat sesuai cup takar baku (maksimal 6 cup beras : 8 cup air).'
    ],
    kriteriaVerifikasi: 'Trainee menakar air, menyalakan rice cooker gas dengan urutan tombol yang benar, dan menyetel timer tanak 15 menit.',
    metodeTraining: 'Demonstrasi 4-Langkah',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Trainer memperagakan urutan tombol kiri lalu kanan dan rasio air. Trainee memasak 1 panci sambil menjelaskan mengapa harus tanak 15 menit.',
      buddy_apprenticeship: 'Senior buddy mendampingi saat penyiapan nasi pagi dan pergantian shift sore selama 3 hari berturut-turut.',
      agile_gamified_sprints: 'Quest: "Nasi Pulen Sempurna Zero Kerak": Memasak nasi dengan yield maksimal tanpa ada kerak keras terbuang.',
      flipped_retrieval: 'Kuis lisan formula: "Jika menanak 4 cup beras, berapa cup airnya? Berapa menit masa tanak setelah jegleg?"',
      tqm_haccp_zerodefect: 'Pemeriksaan tekstur nasi menggunakan sendok uji dan pencatatan jam pemindahan ke magicom.'
    }
  },
  {
    id: 'f1-w2-02',
    phase: 'fase_1_30',
    week: 2,
    divisi: 'Kasir',
    kategori: 'Station Core',
    title: 'SOP Opening Shift Kasir, Cash Drawer & Greeting 5S (HC-SOP-KSR-01 & 02)',
    description: 'Menghitung modal awal kasir (Rp 300.000 / Rp 500.000), memeriksa kertas struk, menyalakan mesin POS/EDC/QRIS, serta melatih senyum, salam, dan sapa ramah.',
    sopRef: 'HC-SOP-KSR-01',
    langkahDetail: [
      'Hadir 20 menit sebelum outlet buka, bersihkan meja kasir dan layar POS.',
      'Hitung fisik modal kas awal kasir lembar per lembar di depan kepala shift/CCTV.',
      'Cek roll kertas printer struk kasir, pastikan tidak macet dan cadangan kertas tersedia.',
      'Nyalakan mesin POS, login menggunakan akun kru terdaftar, cek koneksi internet dan status QRIS aktif.',
      'Praktikkan Greeting 5S (Senyum tulus, Salam hangat, Sapa ramah, Sopan, Santun) dengan kontak mata langsung kepada tamu.'
    ],
    haccpControl: 'Integritas Keuangan & Customer Satisfaction: Selisih uang kas awal dan kesan pertama tamu menentukan rating gerai.',
    alasanKunci: 'Senyum dan sapaan dalam 3 detik pertama meningkatkan kenyamanan belanja dan menaikkan peluang belanja hingga 28%.',
    criticalPoints: [
      'Hitung modal kas awal lembar per lembar sebelum transaksi pertama berlangsung.',
      'Ucapkan kalimat baku pembuka: "Selamat pagi/siang/malam, selamat datang di Hara Chicken, dengan saya [Nama Kru], mau pesan apa hari ini?"'
    ],
    kriteriaVerifikasi: 'Trainer mengamati proses penghitungan kas awal dan roleplay greeting tamu dengan artikulasi jelas dan ramah.',
    metodeTraining: 'Simulasi / Roleplay',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Roleplay 5 skenario tamu datang (tamu terburu-buru, tamu keluarga, tamu bertanya promo), trainer memberi feedback bahasa tubuh.',
      buddy_apprenticeship: 'Shadowing kasir senior selama 2 jam opening shift untuk mengamati ritme penataan uang receh.',
      agile_gamified_sprints: 'Quest: "Opening Kasir Cepat 10 Menit": Dari hitung modal kas hingga siap transaksi tanpa kendala printer.',
      flipped_retrieval: 'Kuis lisan: "Sebutkan kalimat baku salam penutup kasir dan prosedur jika mesin EDC offline!"',
      tqm_haccp_zerodefect: 'Audit formulir serah terima kasir dengan toleransi selisih kas awal Rp 0.'
    }
  },
  {
    id: 'f1-w2-03',
    phase: 'fase_1_30',
    week: 2,
    divisi: 'Geprek',
    kategori: 'Station Core',
    title: 'SOP Uleg Sambal Bawang & Level Kepedasan Baku (HC-SOP-GEP-01 & 02)',
    description: 'Menakar cabai rawit segar sesuai level (Lv 1: 3 cabai, Lv 2: 5 cabai, Lv 3: 8 cabai, Lv 4: 12 cabai, Lv 5: 18 cabai), bawang putih, garam mix, dan siraman minyak panas 180°C.',
    sopRef: 'HC-SOP-GEP-01',
    langkahDetail: [
      'Ambil cabai rawit merah segar yang telah dicuci bersih dan ditiriskan.',
      'Takar jumlah cabai sesuai level pesanan: Level 1 (3 cabai), Level 2 (5 cabai), Level 3 (8 cabai), Level 4 (12 cabai), Level 5 (18 cabai).',
      'Tambahkan 1 iris kecil bawang putih segar dan 1/4 sendok takar garam mix baku.',
      'Uleg cabai dan bumbu di atas cobek hingga tekstur pecah kasar (jangan sampai sehalus pasta blender).',
      'Ambil 1 centong kecil minyak panas (suhu 180°C dari deep fryer), siramkan ke atas sambal hingga mendesis harum.',
      'Aduk rata sambal dengan ulekan sebelum ayam geprek diletakkan di atasnya.'
    ],
    haccpControl: 'Keseragaman Rasa (Consistency) & Bahaya Kimia (Minyak berasap/tengik): Cabai busuk merusak rasa; minyak kurang panas membuat sambal bau langu.',
    alasanKunci: 'Siraman minyak 180°C mematangkan enzim pedas cabai dan mengeluarkan aroma harum bawang putih tanpa membuatnya gosong.',
    criticalPoints: [
      'Jumlah cabai wajib presisi sesuai level pesanan tamu (dilarang menebak-nebak).',
      'Minyak yang disiramkan wajib mendesis panas dari fryer (bukan minyak dingin).',
      'Tekstur ulek adalah pecah kasar (coarse crush), bukan halus lumat.'
    ],
    kriteriaVerifikasi: 'Trainee mengulek sambal untuk 3 level kepedasan berbeda dan trainer mencicipi konsistensi rasa serta aroma gurih bawang.',
    metodeTraining: 'Praktik Terbimbing',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Trainer memperagakan teknik ulek putar pergelangan tangan, trainee mempraktikkan 5 cobek dengan koreksi teknik langsung.',
      buddy_apprenticeship: 'Senior buddy memperhatikan kecepatan tangan trainee saat orderan menumpuk 10 cobek sekaligus.',
      agile_gamified_sprints: 'Speed Uleg Challenge: Mengulek 3 porsi sambal bawang level 3 dalam waktu < 2 menit dengan tekstur seragam.',
      flipped_retrieval: 'Tebak cepat level pedas: Trainer menyebut level, trainee langsung menyebutkan jumlah cabai tanpa berpikir lama.',
      tqm_haccp_zerodefect: 'Timbangan sampling cabai dan sensorik rasa sambal bersama Kepala Outlet.'
    }
  },

  // --- MINGGU 3: INTI PENGGORENGAN, UP-SELLING & FINISHING ---
  {
    id: 'f1-w3-01',
    phase: 'fase_1_30',
    week: 3,
    divisi: 'Kitchen',
    kategori: 'Station Core',
    title: 'SOP Menggoreng Ayam Krispi Hara (HC-SOP-KIT-02)',
    description: 'Prosedur penepungan dusting cubit lembut, celup air 1 detik, penepungan ke-2, suhu kompor 175°C, suhu minyak 160°C, kapasitas 2-3 kg/batch, goyang tiap 3 menit, goreng 12 menit.',
    sopRef: 'HC-SOP-KIT-02',
    langkahDetail: [
      'Nyalakan api kompor deep fryer dan atur pengatur suhu ke 175°C.',
      'Cek suhu minyak menggunakan termometer hingga mencapai 160°C stabil.',
      'Lakukan penepungan ayam (dusting): tuang tepung secukupnya, masukkan ayam termarinasi satu per satu, cubit lembut dan putar agar keriting mekar mekar.',
      'Celupkan keranjang ayam ke dalam bak air bersih selama 1 detik tepat, angkat dan tiriskan airnya.',
      'Masukkan kembali ke tepung breader untuk penepungan kedua, kibaskan sisa tepung berlebih.',
      'Masukkan ayam ke dalam minyak panas minimal 2 kg dan maksimal 3 kg per batch penggorengan.',
      'Goyang keranjang fryer setiap 3 menit sekali agar potongan ayam tidak saling menempel dan matang merata.',
      'Goreng selama 12 menit tepat sesuai timer digital.',
      'Angkat ayam, gantung keranjang 10 detik agar minyak tuntas, pindahkan dengan jepitan stainless ke warmer (dilarang menuang langsung).'
    ],
    haccpControl: 'Bahaya Biologis & Kualitas Fisik: Salmonella pada ayam mentah (Suhu inti daging wajib ≥ 74°C); minyak dingin membuat ayam berminyak lembek.',
    alasanKunci: 'Penepungan cubit lembut tanpa menekan keras menghasilkan tekstur keriting mekar krispi maksimal yang tahan renyah hingga 2 jam di holding cabinet.',
    criticalPoints: [
      'Suhu api kompor 175°C, suhu minyak 160°C, waktu goreng 12 menit pas.',
      'Goyang keranjang setiap 3 menit. Dilarang menggoreng melebihi 3 kg per batch agar suhu minyak tidak drop drastis.',
      'Pindahkan ayam menggunakan jepitan stainless satu per satu, dilarang menuang langsung dari keranjang fryer.'
    ],
    kriteriaVerifikasi: 'Uji suhu minyak dengan termometer, observasi teknik dusting cubit mekar, dan pengecekan kematangan ayam hingga ke tulang.',
    metodeTraining: 'Demonstrasi 4-Langkah',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Trainer memperagakan gerakan tangan dusting 8 arah mata angin, trainee melakukan 1 batch (2 kg), diuji kerenyahan dan suhu inti.',
      buddy_apprenticeship: 'Buddy berdiri di depan meja dusting mengarahkan kelenturan jari trainee saat mencubit tepung.',
      agile_gamified_sprints: 'Quest "Crispy Master": Menghasilkan 1 batch ayam krispi dengan warna golden brown sempurna dan tingkat keriting seragam.',
      flipped_retrieval: 'Uji kognitif: "Berapa kapasitas min/maks batch? Kenapa suhu minyak tidak boleh di bawah 160°C?"',
      tqm_haccp_zerodefect: 'Pemeriksaan suhu tusuk daging ayam (Internal Temp ≥ 74°C) dan inspeksi visual tidak ada darah pada tulang.'
    }
  },
  {
    id: 'f1-w3-02',
    phase: 'fase_1_30',
    week: 3,
    divisi: 'Kitchen',
    kategori: 'Station Core',
    title: 'SOP Goreng Kulit Krispi & Ayam Utuh (HC-SOP-KIT-03 & 04)',
    description: 'Goreng kulit mentah 50g jadi matang 60g, suhu 150°C selama 12 menit. Goreng Ayam Utuh (AU) suhu 150°C selama 12 menit dengan pemekaran rongga dada pelan-pelan.',
    sopRef: 'HC-SOP-KIT-03',
    langkahDetail: [
      'Kulit: Porsi mentah 50 gr, tepung 2 kali (dusting - celup air 1 detik - dusting).',
      'Atur suhu minyak deep fryer di 150°C stabil.',
      'Goreng kulit selama 12 menit hingga kering keemasan, tiriskan minyak hingga tuntas, hasil matang menjadi 60 gr.',
      'Ayam Utuh (AU): Buka rongga dada ayam pelan-pelan saat dimasukkan ke dalam minyak 150°C agar rongga dalam terisi minyak panas.',
      'Goreng AU selama 12 menit, bolak-balik setiap 3 menit sekali agar kematangan merata hingga rongga terdalam.',
      'Angkat saat ayam sudah mengambang kering keemasan.'
    ],
    haccpControl: 'Kematangan Rongga Dalam: Ayam utuh memiliki massa padat, jika tidak dimekarkan rongga dalam berisiko mentah berdarah.',
    alasanKunci: 'Suhu 150°C (lebih rendah dari ayam potong) memberi waktu pada panas untuk meresap ke tulang ayam utuh tanpa membakar kulit luar.',
    criticalPoints: [
      'Suhu minyak 150°C (bukan 160°C). Waktu goreng 12 menit.',
      'Ayam utuh wajib dimekarkan saat pertama kali dimasukkan ke minyak panas.',
      'Balik ayam utuh setiap 3 menit sekali.'
    ],
    kriteriaVerifikasi: 'Trainer memverifikasi suhu 150°C dan membelah bagian dada ayam utuh untuk memastikan tidak ada darah.',
    metodeTraining: 'Demonstrasi 4-Langkah',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Demonstrasi teknik melebarkan rongga dada AU di minyak panas dengan jepitan panjang tanpa cipratan minyak.',
      buddy_apprenticeship: 'Buddy mengawasi trainee saat membalik ayam utuh agar minyak tidak berceceran ke lantai.',
      agile_gamified_sprints: 'Quest: "Crispy Skin Perfection": Menghasilkan 5 porsi kulit kriuk renyah tanpa gumpalan minyak.',
      flipped_retrieval: 'Kuis perbandingan: "Apa perbedaan suhu goreng ayam potong vs ayam utuh dan kulit? Jelaskan alasannya!"',
      tqm_haccp_zerodefect: 'Uji timbang kulit mentah 50g dan hasil matang 60g menggunakan timbangan digital.'
    }
  },
  {
    id: 'f1-w3-03',
    phase: 'fase_1_30',
    week: 3,
    divisi: 'Kasir',
    kategori: 'Speed & Service',
    title: 'SOP Upselling Suggestive Selling & Bagging QC Kasir (HC-SOP-KSR-03 & 05)',
    description: 'Menawarkan menu pendamping (kulit krispi, kentang, teh jumbo) dalam 10 detik, input POS cepat, serta prosedur packaging box rapi dan pengecekan struk vs isi.',
    sopRef: 'HC-SOP-KSR-03',
    langkahDetail: [
      'Saat tamu menyebutkan menu ayam, lakukan sugesti: "Mau ditambah kulit krispi yang renyah atau kentang goreng kak?"',
      'Saat tamu memilih minuman biasa: "Bisa di-upgrade ke cup Jumbo hanya tambah Rp 2.000 saja kak?"',
      'Ketik pesanan di POS dengan cepat (< 30 detik), bacakan ulang pesanan untuk konfirmasi.',
      'Saat membungkus pesanan take away: periksa fisik box makanan vs struk pesanan (jumlah ayam, tingkat pedas sambal, jenis saos).',
      'Sertakan sendok dan tisu, tutup kantong rapi, serahkan ke tamu dengan dua tangan dan senyum hangat.'
    ],
    haccpControl: 'Akurasi Order & Kebersihan Kemasan: Kesalahan varian sambal atau item tertinggal adalah sumber 70% komplain kasir.',
    alasanKunci: 'Suggestive selling ramah menaikkan Average Check (nilai transaksi) gerai sebesar 15-25% tanpa membebani pelanggan.',
    criticalPoints: [
      'Selalu tawarkan minimal 1 menu pendamping sebelum menutup transaksi.',
      'Wajib double check isi kantong take away dengan struk sebelum diserahkan kepada pelanggan.'
    ],
    kriteriaVerifikasi: 'Trainer memantau 10 transaksi berturut-turut untuk menilai konsistensi upselling dan akurasi bagging.',
    metodeTraining: 'Simulasi / Roleplay',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Roleplay penawaran varian menu dan latihan teknik cross-check struk take away dalam tempo 45 detik.',
      buddy_apprenticeship: 'Buddy memberi isyarat halus jika kru kasir lupa menawarkan menu pendamping saat shift.',
      agile_gamified_sprints: 'Quest: "Upselling Streak 5x Berhasil": Menjual 5 addon kulit/minum jumbo dalam 1 shift.',
      flipped_retrieval: 'Simulasi mendadak: Trainer pura-pura jadi tamu bingung, kru kasir memandu pilihan menu dalam 20 detik.',
      tqm_haccp_zerodefect: 'Audit zero-missing item pada kantong bungkus take away (akurasi 100%).'
    }
  },

  // --- MINGGU 4: SOLO SHIFT STASIUN PRIMER & UJIAN MILESTONE 1 (HARI 30) ---
  {
    id: 'f1-w4-01',
    phase: 'fase_1_30',
    week: 4,
    divisi: 'Semua',
    kategori: 'Station Core',
    title: 'Solo Shift Mandiri 1 Stasiun Penuh & Penanganan Kebersihan Shift',
    description: 'Menjalankan shift kerja 1 stasiun primer secara mandiri dari awal hingga akhir tanpa intervensi langsung, termasuk pembersihan stasiun pasca shift.',
    sopRef: 'HC-SOP-GEN-05',
    langkahDetail: [
      'Lakukan persiapan awal stasiun (mise en place) sebelum shift dimulai.',
      'Layani alur produksi / kasir secara mandiri dengan kecepatan dan kualitas stabil.',
      'Jaga kebersihan area stasiun secara berkelanjutan (Clean As You Go).',
      'Lakukan serah terima shift (handover) kepada rekan shift berikutnya dengan data stok akurat.'
    ],
    haccpControl: 'Kemandirian Operasional & Higiene: Mencegah penumpukan kotoran dan keterlambatan saji saat pergantian kru.',
    alasanKunci: 'Ujian solo shift membuktikan ketahanan mental kru sebelum dipercaya memegang stasiun saat jam sibuk.',
    criticalPoints: [
      'Mampu menyelesaikan pesanan sesuai standar waktu tanpa melanggar poin kritis SOP.',
      'Area stasiun bersih dan siap pakai saat pergantian shift.'
    ],
    kriteriaVerifikasi: 'Observasi 1 shift penuh oleh Trainer dengan skor kepatuhan minimal 85%.',
    metodeTraining: 'Observasi Mandiri',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Trainer mengamati dari jarak 3 meter, mencatat waktu dan kepatuhan SOP tanpa menginterupsi kecuali ada bahaya K3.',
      buddy_apprenticeship: 'Buddy siaga di stasiun sebelah, memberikan evaluasi tertulis setelah shift selesai.',
      agile_gamified_sprints: 'Solo Boss Challenge: Menyelesaikan 1 shift mandiri tanpa komplain untuk meraih Badge "Solo Operator".',
      flipped_retrieval: 'Evaluasi refleksi: Kru diminta memaparkan 3 hal yang sudah sempurna dan 1 hal yang ingin dipercepat.',
      tqm_haccp_zerodefect: 'Audit checklist stasiun 25 parameter dengan skor minimum kelulusan 88.'
    }
  },
  {
    id: 'f1-w4-02',
    phase: 'fase_1_30',
    week: 4,
    divisi: 'Semua',
    kategori: 'Station Core',
    title: 'Evaluasi & Sign-off Milestone 1 (Hari ke-30) Bersama Kepala Outlet',
    description: 'Sidang evaluasi 30 hari pertama: Ujian Teori tertulis, Ujian Praktik stasiun primer, dan penandatanganan Berita Acara Kelulusan Fase 1.',
    sopRef: 'HC-SOP-GEN-01',
    criticalPoints: [
      'Nilai Ujian Teori minimal 80 poin.',
      'Nilai Ujian Praktik minimal 85 poin.',
      'Rekomendasi tertulis dari Trainer Operasional dan persetujuan Kepala Outlet.'
    ],
    kriteriaVerifikasi: 'Tercatatnya Berita Acara Milestone 1 di database dan kenaikan status ke Fase 2.',
    metodeTraining: 'Praktik Terbimbing',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Sidang formal 3 pihak: Trainer, Kepala Outlet, dan Kru. Pembahasan hasil observasi dan penetapan target Fase 2.',
      buddy_apprenticeship: 'Senior buddy membacakan surat rekomendasi kemajuan keterampilan kru di hadapan kepala gerai.',
      agile_gamified_sprints: 'Graduation Sprint 1: Penyerahan Badge Bronze Station Master dan perayaan kecil tim.',
      flipped_retrieval: 'Ujian lisan komprehensif 10 pertanyaan SOP acak di hadapan Kepala Outlet.',
      tqm_haccp_zerodefect: 'Pemeriksaan buku rekam jejak sanitasi dan zero insiden keselamatan kerja 30 hari.'
    }
  },

  // =========================================================================
  // FASE 2: BULAN 2 (HARI 31 - 60) - MULTI-STASIUN, JAM SIBUK & EFISIENSI
  // =========================================================================

  // --- MINGGU 5: CROSS-TRAINING STASIUN SEKUNDER & MENU TAMBAHAN ---
  {
    id: 'f2-w5-01',
    phase: 'fase_2_60',
    week: 5,
    divisi: 'Semua',
    kategori: 'Station Core',
    title: 'Cross-Training Menu Tambahan: Nasi Goreng Hara Standar Baku (HC-SOP-KIT-05)',
    description: 'Memasak Nasi Goreng 1 porsi: 1 cup nasi, 15 ml minyak, 1 siung bawang putih, 30 gr mix sayur, 20 gr bumbu eco, 15 gr saos ricebowl, 2 tetes minyak wijen (waktu 3-4 menit).',
    sopRef: 'HC-SOP-KIT-05',
    langkahDetail: [
      'Siapkan 1 cup nasi pulen dingin.',
      'Panaskan wajan dengan 15 ml (1 sdm) minyak goreng.',
      'Tumis 1/2 siung besar atau 1 siung kecil bawang putih geprek sampai harum.',
      'Masukkan 30 gr (2 sdm) mix vegetable, tumis sebentar.',
      'Masukkan 1 cup nasi lalu aduk rata dengan api sedang.',
      'Masukkan 20 gr bumbu eco nasi goreng lalu aduk hingga bumbu merata.',
      'Tambahkan 15 gr (1 sdm) saos ricebowl lalu aduk merata.',
      'Tambahkan 2 tetes minyak wijen lalu aduk merata.',
      'Sajikan di piring beralas kertas dengan telur di atasnya (dine in) atau di box besar beralas kertas nasi utuh (take away).'
    ],
    haccpControl: 'Takaran Gramasi & Waktu Masak: Kelebihan bumbu eco membuat nasi asin pekat; kekurangan minyak membuat nasi gosong menempel.',
    alasanKunci: 'Formula baku (Bumbu Eco 20g + Minyak 15ml + Mix Veg 30g + Saos 15g + Wijen 2 tetes) menjamin rasa nasi goreng identik di seluruh cabang Hara Chicken.',
    criticalPoints: [
      'Komposisi baku: Bumbu Eco 20 gr, Minyak 15 ml, Mix Sayur 30 gr, Saos Ricebowl 15 gr, Minyak Wijen 2 tetes.',
      'Waktu masak 3-4 menit per porsi dengan api sedang.'
    ],
    kriteriaVerifikasi: 'Trainee memasak 1 porsi nasi goreng dengan menimbang bumbu eco dan saos, lalu dicicipi oleh trainer.',
    metodeTraining: 'Demonstrasi 4-Langkah',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Trainer menimbang bahan di depan trainee, menjelaskan fungsi minyak wijen di akhir, trainee memasak 2 porsi berurutan.',
      buddy_apprenticeship: 'Buddy mendampingi di samping wajan mengatur besaran api kompor dan teknik mengaduk nasi.',
      agile_gamified_sprints: 'Quest: "Speed Wok Master": Memasak nasi goreng lezat dalam waktu < 3 menit 30 detik.',
      flipped_retrieval: 'Kuis hafalan resep gramasi sebelum menyalakan kompor wok.',
      tqm_haccp_zerodefect: 'Uji timbangan digital bahan masakan sebelum masuk ke wajan (toleransi 0.5 gram).'
    }
  },
  {
    id: 'f2-w5-02',
    phase: 'fase_2_60',
    week: 5,
    divisi: 'Semua',
    kategori: 'Station Core',
    title: 'Cross-Training Side Dish: Telur Dadar Krispi & Kentang Goreng (HC-SOP-KIT-06 & 08)',
    description: 'Telur dadar: 1 telur + 1g (1/2 sdt) garam mix + 50 ml minyak panas. Kentang: 100g kentang beku digoreng 5 menit di 500ml minyak + tabur 2.5g bumbu kentang.',
    sopRef: 'HC-SOP-KIT-06',
    langkahDetail: [
      'Telur Dadar: Pecahkan 1 butir telur ke mangkok, tambahkan mix garam 1/2 sdt (1 gram), kocok hingga berbusa halus.',
      'Panaskan 50 ml minyak dengan api sedang, tuang kocokan telur, bolak-balik hingga kuning keemasan garing (2 menit).',
      'Kentang: Ambil 1 porsi (100 gr) kentang dari freezer, masukkan ke minyak panas, goreng selama 5 menit.',
      'Tiriskan minyak hingga tuntas, masukkan ke wadah bumbu, taburi 2,5 gr (1/2 sdt) bumbu kentang, kocok rata.',
      'Kemas menggunakan kertas ayam untuk take away atau piring kecil untuk dine in.'
    ],
    haccpControl: 'Kerenyahan & Kadar Minyak: Telur/kentang yang tidak ditiriskan dengan baik menghasilkan tekstur berminyak yang tidak disukai pelanggan.',
    alasanKunci: 'Takaran garam mix 1 gram pada telur dan 2.5 gram bumbu kentang adalah titik keseimbangan rasa gurih optimal.',
    criticalPoints: [
      'Garam mix telur: 1/2 sendok takar (1 gram). Minyak goreng: 50 ml.',
      'Porsi kentang: 100 gr. Waktu goreng: 5 menit. Taburan bumbu: 2,5 gr.'
    ],
    kriteriaVerifikasi: 'Trainer memverifikasi berat kentang 100g, waktu goreng 5 menit, dan rasa telur dadar gurih merata.',
    metodeTraining: 'Praktik Terbimbing',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Demonstrasi teknik mengocok telur berbusa dan teknik menggoyang wadah bumbu kentang tanpa meremukkan french fries.',
      buddy_apprenticeship: 'Buddy bertukar stasiun: kru dapur memegang penggorengan kentang saat pesanan paket hemat masuk.',
      agile_gamified_sprints: 'Quest: "Golden Fries": Kentang goreng matang keemasan dalam 5 menit pas tanpa sisa minyak berlebih.',
      flipped_retrieval: 'Tebak takaran bumbu: "Berapa gram garam telur dadar? Berapa gram bumbu kentang per porsi?"',
      tqm_haccp_zerodefect: 'Pemeriksaan suhu minyak 160°C dan penimbangan porsi kentang 100 gr presisi.'
    }
  },
  {
    id: 'f2-w5-03',
    phase: 'fase_2_60',
    week: 5,
    divisi: 'Semua',
    kategori: 'Station Core',
    title: 'Cross-Training Menu Spesial: Ayam Krisbar & Marinasi Sayur Extra (HC-SOP-KIT-07, 09, 10)',
    description: 'Krisbar: Celup bumbu 2x, panggang berkaramel, saring bumbu tiap pergantian shift. Sayur SOP Hara Extra: 6L air, bumbu halus kapulaga 6 butir & bawang putih 30g. Marinasi extra 10 menit.',
    sopRef: 'HC-SOP-KIT-07',
    langkahDetail: [
      'Krisbar: Ambil ayam krispi matang, celupkan ke wadah bumbu krisbar, panggang di atas grill pan hingga berkaramel harum.',
      'Celupkan kembali sebanyak 2x ke dalam bumbu krisbar lalu bakar kembali sebentar.',
      'Saring bumbu krisbar setiap pergantian shift atau jika ada banyak remahan arang.',
      'Marinasi Extra (Terong/Jamur/Usus): Uleg 2 siung bawang putih + 75 gr garam mix + 1 liter air, rendam potongan sayur 10 menit sebelum ditepungi 2x.',
      'Sayur SOP: Rebus 6 liter air dengan tumisan bumbu halus kapulaga 6 butir, bawang putih 30 gr, garam mix 4.5 sdm, dan Royco 2 sachet.'
    ],
    haccpControl: 'Kualitas Bumbu & Aroma Karamel: Bumbu krisbar berkerak gosong merusak penampilan; sayuran tanpa marinasi terasa tawar di dalam.',
    alasanKunci: 'Pencelupan 2x pada krisbar mengunci karamel manis-gurih pada sela-sela kulit krispi tanpa membuat ayam layu.',
    criticalPoints: [
      'Krisbar wajib dicelup 2 kali bumbu bakar.',
      'Bumbu krisbar wajib disaring setiap pergantian shift dan disimpan di showcase chiller saat closing.',
      'Marinasi extra direndam tepat 10 menit agar sayuran gurih meresap.'
    ],
    kriteriaVerifikasi: 'Trainee mendemonstrasikan proses krisbar 2x celup dan menakar bumbu marinasi sayur extra.',
    metodeTraining: 'Demonstrasi 4-Langkah',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Praktik memanggang krisbar dengan api sedang hingga wangi karamel keluar tanpa menghitamkan kulit.',
      buddy_apprenticeship: 'Buddy mengajarkan teknik menyaring bumbu krisbar agar tidak ada remahan tepung yang tersisa.',
      agile_gamified_sprints: 'Quest: "Caramel Perfection": 5 porsi ayam krisbar mengkilap harum tanpa ada bagian gosong pahit.',
      flipped_retrieval: 'Kuis SOP: "Mengapa bumbu krisbar harus disaring tiap shift? Berapa butir kapulaga untuk sayur sop?"',
      tqm_haccp_zerodefect: 'Audit organoleptik bumbu krisbar dan uji waktu perendaman sayur extra 10 menit.'
    }
  },

  // --- MINGGU 6: JAM SIBUK (RUSH HOUR) & SPEED-OF-SERVICE DRILL ---
  {
    id: 'f2-w6-01',
    phase: 'fase_2_60',
    week: 6,
    divisi: 'Semua',
    kategori: 'Speed & Service',
    title: 'Drill Jam Sibuk (Rush Hour): Speed of Service < 150 Detik & Sinkronisasi Dapur-Kasir',
    description: 'Melatih ritme kerja cepat saat lonjakan antrean jam makan siang/malam, koordinasi panggilan pesanan dapur, dan pengemasan pesanan di bawah 150 detik.',
    sopRef: 'HC-SOP-KSR-05',
    langkahDetail: [
      'Posisikan stok ayam matang pada holding warmer minimal 10 potong sebelum jam sibuk (11.30 & 18.30).',
      'Kasir langsung mengoper order ke bagian geprek melalui display order / panggilan jelas: "Paket Geprek Dada Pedas 3 Dine-In!".',
      'Kru geprek mengulek sambal dalam waktu maksimal 45 detik, geprek ayam 1x tekan.',
      'Kru helper menyiapkan nasi pulen dan lalapan dalam 30 detik.',
      'Kasir melakukan final check dan menyerahkan pesanan kepada tamu dalam total waktu < 150 detik sejak pembayaran selesai.'
    ],
    haccpControl: 'Food Holding Time & Customer Flow: Ayam di warmer dilarang melebihi 2 jam holding time agar tidak kering liat.',
    alasanKunci: 'Kecepatan saji < 150 detik mencegah antrean mengular, menjaga meja makan berputar cepat (table turnover), dan memuaskan pelanggan saat jam istirahat kantor.',
    criticalPoints: [
      'Total waktu dari pembayaran hingga pesanan diserahkan maksimal 150 detik.',
      'Komunikasi verbal antara kasir dan kru dapur wajib jelas, tegas, dan saling menyahut (Call & Call-back).'
    ],
    kriteriaVerifikasi: 'Uji simulasi 5 transaksi saat jam sibuk dengan stopwatch oleh Trainer, rata-rata waktu < 150 detik.',
    metodeTraining: 'Simulasi / Roleplay',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Trainer memegang stopwatch mengukur setiap detik di stasiun geprek dan kasir, lalu mengevaluasi titik botol leher.',
      buddy_apprenticeship: 'Buddy dan trainee bertukar posisi saat rush hour untuk saling menopang kecepatan kerja.',
      agile_gamified_sprints: 'Rush Hour Speed Sprint: Mempertahankan waktu saji di bawah 120 detik untuk 15 pesanan berturut-turut.',
      flipped_retrieval: 'Simulasi krisis jam sibuk: Pesanan 10 porsi tiba-tiba masuk bersamaan dengan pesanan ojek online.',
      tqm_haccp_zerodefect: 'Pencatatan data Speed of Service (SOS) digital pada laporan harian gerai.'
    }
  },

  // --- MINGGU 7: MANAJEMEN MINYAK & ZERO FOOD WASTE ---
  {
    id: 'f2-w7-01',
    phase: 'fase_2_60',
    week: 7,
    divisi: 'Kitchen',
    kategori: 'Food Safety',
    title: 'SOP Kuras & Filter Minyak Fryer Tiap 16-20 Kg Ayam (HC-SOP-GEN-04 & KIT-02)',
    description: 'Prosedur pemeliharaan minyak: Menguras minyak setiap selesai menggoreng 16-20 kg ayam atau tiap pergantian shift, menyaring remahan tepung, dan pengujian kualitas warna minyak.',
    sopRef: 'HC-SOP-GEN-04',
    langkahDetail: [
      'Matikan api kompor deep fryer dan tunggu suhu minyak turun hingga di bawah 100°C demi keselamatan kerja.',
      'Pasang saringan kain mikro (oil filter) di atas ember penampung stainless steel tahan panas.',
      'Buka kran pembuangan minyak fryer secara perlahan agar minyak mengalir melalui saringan.',
      'Bersihkan sisa remahan tepung gosong di dasar tungku fryer menggunakan spatula karet dan spons khusus.',
      'Bilas tungku dengan sedikit minyak bersih, lap kering, lalu tutup kran pembuangan.',
      'Tuangkan kembali minyak yang sudah bersih tersaring ke dalam fryer, tambahkan minyak baru jika volume berkurang.'
    ],
    haccpControl: 'Bahaya Kimia (Senyawa Karsinogenik & Free Fatty Acids): Remahan tepung gosong yang terendam berulang kali memicu senyawa karsinogenik dan rasa pahit.',
    alasanKunci: 'Penyaringan rutin memperpanjang umur pakai minyak hingga 30% dan menjaga ayam tetap berwarna keemasan cerah tanpa bintik hitam gosong.',
    criticalPoints: [
      'Kuras dan saring minyak wajib dilakukan setiap selesai menggoreng 16 - 20 kg ayam atau setiap pergantian shift.',
      'Dilarang membuka kran pembuangan saat minyak masih mendidih di atas 150°C (risiko luka bakar K3).'
    ],
    kriteriaVerifikasi: 'Trainee mendemonstrasikan proses penyaringan minyak dengan APD sarung tangan tahan panas dan kebersihan tungku fryer.',
    metodeTraining: 'Praktik Terbimbing',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Trainer memandu prosedur kuras minyak langkah demi langkah dengan penekanan keselamatan APD anti-panas.',
      buddy_apprenticeship: 'Buddy mendampingi trainee memegang ember penampung dan memeriksa kebersihan saringan minyak.',
      agile_gamified_sprints: 'Quest: "Crystal Oil": Kuras dan pembersihan fryer tuntas dalam 15 menit dengan hasil minyak bebas remahan hitam.',
      flipped_retrieval: 'Kuis indikator minyak: "Kapan minyak fryer wajib diganti total dan tidak boleh dipakai lagi?"',
      tqm_haccp_zerodefect: 'Pemeriksaan polar compound / asam lemak bebas minyak menggunakan kertas uji sensoris.'
    }
  },

  // --- MINGGU 8: STOCK OPNAME & SIGN-OFF MILESTONE 2 (HARI 60) ---
  {
    id: 'f2-w8-01',
    phase: 'fase_2_60',
    week: 8,
    divisi: 'Semua',
    kategori: 'Maintenance',
    title: 'Evaluasi & Sign-off Milestone 2 (Hari ke-60): Uji Multi-Stasiun & Speed of Service',
    description: 'Evaluasi kemahiran multi-stasiun (Cross-Training), Ujian Lisan SOP, Audit Speed of Service < 150 detik, dan penandatanganan Berita Acara Kelulusan Fase 2.',
    sopRef: 'HC-SOP-GEN-01',
    criticalPoints: [
      'Mampu mengoperasikan minimal 2 stasiun kerja dengan nilai mandiri.',
      'Speed of Service saat jam sibuk terbukti di bawah 150 detik.',
      'Skor Uji Lisan minimal 85 poin, bebas dari insiden kesalahan SOP kritis.'
    ],
    kriteriaVerifikasi: 'Penandatanganan Berita Acara Milestone 2 oleh Trainer dan Kepala Outlet di sistem.',
    metodeTraining: 'Observasi Mandiri',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Sidang evaluasi 60 hari: Peninjauan grafik kecepatan saji dan pengesahan kenaikan ke Fase 3 Mandiri.',
      buddy_apprenticeship: 'Senior buddy menyerahkan tongkat estafet stasiun, menyatakan kru siap bertugas tanpa pendampingan bayangan.',
      agile_gamified_sprints: 'Unlock Silver Badge: Penganugerahan lencana "Multi-Station Operator" pada papan prestasi gerai.',
      flipped_retrieval: 'Uji komprehensif skenario rotasi stasiun secara tiba-tiba tanpa persiapan.',
      tqm_haccp_zerodefect: 'Audit rekonsiliasi data stock opname harian selisih 0% pada stasiun kru.'
    }
  },

  // =========================================================================
  // FASE 3: BULAN 3 (HARI 61 - 90) - KEMANDIRIAN PENUH, SERVICE RECOVERY & LEADERSHIP
  // =========================================================================

  // --- MINGGU 9: SERVICE RECOVERY STANDAR L.A.S.T ---
  {
    id: 'f3-w9-01',
    phase: 'fase_3_90',
    week: 9,
    divisi: 'Semua',
    kategori: 'Problem Solving',
    title: 'Penanganan Komplain Pelanggan Standar L.A.S.T (HC-SOP-KSR-07)',
    description: 'Menerapkan 4 langkah penanganan komplain: Listen (Dengar tulus), Apologize (Minta maaf tulus), Solve (Ganti produk dalam 3 menit), Thank (Ucapkan terima kasih atas masukan).',
    sopRef: 'HC-SOP-KSR-07',
    langkahDetail: [
      'Listen: Dengarkan keluhan tamu dengan kontak mata, anggukan empati, tanpa pernah memotong atau menyanggah pembicaraan.',
      'Apologize: Sampaikan permohonan maaf yang tulus atas ketidaknyamanan, bukan menyalahkan rekan kerja atau sistem.',
      'Solve: Berikan solusi seketika: ganti produk baru yang panas dan sempurna dalam waktu < 3 menit tanpa biaya tambahan.',
      'Thank: Ucapkan terima kasih atas masukan yang diberikan agar gerai Hara Chicken bisa terus berbenah.',
      'Catat insiden di Buku Log Komplain Gerai dan laporkan kepada Kepala Outlet untuk perbaikan SOP.'
    ],
    haccpControl: 'Customer Retention & Brand Trust: Komplain yang ditangani dengan buruk akan menyebar ke media sosial dan menghancurkan reputasi cabang.',
    alasanKunci: 'Pelanggan yang komplainnya diselesaikan tuntas dalam 3 menit memiliki tingkat loyalitas 78% lebih tinggi daripada pelanggan yang tidak pernah mengalami masalah.',
    criticalPoints: [
      'Dilarang membantah, berdebat, atau menunjukkan bahasa tubuh defensif kepada tamu.',
      'Solusi penggantian produk wajib diselesaikan dalam waktu kurang dari 3 menit.'
    ],
    kriteriaVerifikasi: 'Roleplay penanganan komplain berat (ayam dingin, sambal salah level, rambut di box) dengan nilai kepatuhan L.A.S.T 100%.',
    metodeTraining: 'Simulasi / Roleplay',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Roleplay intensif 3 skenario komplain emosional, trainer menguji stabilitas nada bicara dan kecepatan penggantian produk.',
      buddy_apprenticeship: 'Trainee mengamati kepala gerai menyelesaikan komplain riil pelanggan lalu mendiskusikan psikologi tamu.',
      agile_gamified_sprints: 'Quest: "Customer Hero": Menyelesaikan skenario komplain tamu hingga tamu tersenyum kembali.',
      flipped_retrieval: 'Uji refleks L.A.S.T dalam tempo 60 detik di depan seluruh tim briefing shift.',
      tqm_haccp_zerodefect: 'Pencatatan laporan insiden berbasis form CAPA (Corrective and Preventive Action).'
    }
  },

  // --- MINGGU 10: PEMELIHARAAN PREVENTIF PERALATAN OUTLET ---
  {
    id: 'f3-w10-01',
    phase: 'fase_3_90',
    week: 10,
    divisi: 'Kitchen',
    kategori: 'Maintenance',
    title: 'SOP Pemeliharaan Preventif Deep Fryer, Rice Cooker Gas & Showcase Warmer',
    description: 'Pembersihan mendalam (Deep Cleaning), pembersihan burner kompor gas, pengecekan lampu penghangat warmer, dan sanitasi berkala sesuai jadwal gerai.',
    sopRef: 'HC-SOP-GEN-05',
    langkahDetail: [
      'Lepas bagian tungku kompor gas rice cooker, bersihkan lubang api dari kerak beras dengan jarum pembersih.',
      'Lakukan boil-out fryer mingguan menggunakan air panas dan sabun degreaser khusus dapur F&B.',
      'Bersihkan kaca showcase warmer dengan kain microfiber bersih, pastikan lampu pemanas halogen berfungsi.',
      'Cek elastisitas karet seal pintu chiller dan freezer agar suhu dingin tidak bocor keluar.',
      'Pastikan seluruh alat stainless steel kering sempurna sebelum disimpan di rak peralatan.'
    ],
    haccpControl: 'Efisiensi Energi & K3: Lubang api tersumbat menyebabkan pembakaran gas tidak sempurna (karbon monoksida beracun dan boros gas).',
    alasanKunci: 'Perawatan preventif memperpanjang usia alat masak hingga 3x lipat dan mencegah gerai tutup mendadak akibat kompor rusak saat jam sibuk.',
    criticalPoints: [
      'Dilarang membersihkan komponen kelistrikan warmer dengan air mengalir (risiko korsleting listrik).',
      'Pastikan saluran gas tertutup rapat sebelum membersihkan kompor gas.'
    ],
    kriteriaVerifikasi: 'Trainer memeriksa kebersihan tungku kompor, kebersihan kisi-kisi fryer, dan kelancaran api biru burner.',
    metodeTraining: 'Praktik Terbimbing',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Trainer mendemonstrasikan cara melepas dan memasang kembali burner kompor gas tanpa merusak pemantik api.',
      buddy_apprenticeship: 'Buddy dan kru baru bersama-sama melakukan jadwal deep cleaning mingguan saat penutupan gerai.',
      agile_gamified_sprints: 'Quest: "Sparkling Kitchen": Deep cleaning stasiun dapur hingga mengkilap bebas noda minyak membandel.',
      flipped_retrieval: 'Kuis teknis: "Bagaimana cara mendeteksi api kompor merah dan apa tindakan perbaikannya?"',
      tqm_haccp_zerodefect: 'Pemeriksaan checklist pemeliharaan mesin 15 titik kontrol bulanan.'
    }
  },

  // --- MINGGU 11: PRE-LEADERSHIP & PEER MENTORING ---
  {
    id: 'f3-w11-01',
    phase: 'fase_3_90',
    week: 11,
    divisi: 'Semua',
    kategori: 'Station Core',
    title: 'Pre-Leadership: Mempraktikkan Bimbingan Rakan Kru Baru (Peer Mentoring)',
    description: 'Menerapkan metode pengajaran yang dipilih untuk membimbing rekan kru baru pada 1 modul stasiun, memvalidasi pemahaman kepatuhan SOP rekan kerja.',
    sopRef: 'HC-SOP-GEN-01',
    langkahDetail: [
      'Pilih 1 rekan kru baru yang sedang menjalani Fase 1.',
      'Peragakan 1 prosedur SOP baku (misal: cuci tangan 6 langkah atau penepungan ayam krispi).',
      'Minta rekan kru mempraktikkan kembali sambil menjelaskan poin kritis.',
      'Berikan umpan balik positif dan koreksi santun terhadap hal yang masih kurang presisi.',
      'Tuliskan catatan hasil bimbingan di modul pendampingan peer mentor.'
    ],
    haccpControl: 'Standarisasi Budaya Kerja: Kru yang mampu mengajar adalah kru yang pemahamannya telah mencapai tingkat tertinggi (Mastery).',
    alasanKunci: 'Metode "See One, Do One, Teach One" terbukti mengunci retensi pemahaman SOP hingga 95% seumur hidup.',
    criticalPoints: [
      'Mampu menjelaskan alasan di balik SOP (Why) secara sabar dan jelas kepada rekan kerja.',
      'Menunjukkan contoh teladan (walk the talk) dalam hal grooming dan disiplin waktu.'
    ],
    kriteriaVerifikasi: 'Trainer mengamati sesi mentoring yang dilakukan trainee kepada kru baru selama 20 menit.',
    metodeTraining: 'Praktik Terbimbing',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Trainee mengadopsi 4 langkah TWI saat mengajarkan rekan baru, dievaluasi oleh Trainer Operasional.',
      buddy_apprenticeship: 'Trainee bertindak sebagai junior buddy resmi mendampingi kru magang baru selama 3 hari.',
      agile_gamified_sprints: 'Quest "Mentor Badge": Membantu 1 rekan kru baru lulus uji stasiun dalam minggu berjalan.',
      flipped_retrieval: 'Trainee memimpin sesi kuis pre-shift briefing 5 menit di hadapan tim outlet.',
      tqm_haccp_zerodefect: 'Trainee melakukan audit silang lembar kepatuhan SOP pada stasiun rekan kerja.'
    }
  },

  // --- MINGGU 12: SIDANG AKHIR KELULUSAN ONBOARDING 90 HARI (HARI 90) ---
  {
    id: 'f3-w12-01',
    phase: 'fase_3_90',
    week: 12,
    divisi: 'Semua',
    kategori: 'Station Core',
    title: 'Sidang Akhir Kelulusan Onboarding 90 Hari: Kru Mandiri Penuh & Penyerahan Sertifikat',
    description: 'Sidang evaluasi akhir komprehensif: Uji Teori komprehensif seluruh SOP gerai, Audit Praktik Jam Sibuk, Evaluasi Sikap Kerja, dan Pengesahan Status Kru Mandiri 100%.',
    sopRef: 'HC-SOP-GEN-01',
    criticalPoints: [
      'Nilai Evaluasi Komprehensif minimal 90 poin.',
      'Telah lulus verifikasi seluruh butir checklist SOP Fase 1, 2, dan 3.',
      'Mendapatkan persetujuan bulat dari Trainer Operasional, Kepala Outlet, dan Area Manager.'
    ],
    kriteriaVerifikasi: 'Penerbitan Sertifikat Resmi Kelulusan Kru Mandiri Hara Chicken dan pencatatan status Lulus Mandiri di sistem.',
    metodeTraining: 'Observasi Mandiri',
    opsiMetodePelaksanaan: {
      hybrid_twi_spaced: 'Sidang kelulusan formal 90 hari, penyerahan sertifikat Kru Mandiri dan badge pin emas resmi Hara Chicken.',
      buddy_apprenticeship: 'Perayaan kelulusan bersama seluruh kru gerai dan penyerahan rekomendasi promosi ke jenjang Kru Senior.',
      agile_gamified_sprints: 'Pencapaian Tertinggi: Unlock Lencana "Master Station Champion" dan masuk ke Wall of Fame gerai.',
      flipped_retrieval: 'Presentasi singkat 5 menit oleh kru di hadapan Manajemen tentang komitmen menjaga standar rasa & higienitas.',
      tqm_haccp_zerodefect: 'Penerbitan dokumen audit bebas deviasi 90 hari dan pengesahan kualifikasi kru standar HACCP.'
    }
  },
];

// =========================================================================
// INITIAL MOCK DATA PROGRES ONBOARDING KRU
// =========================================================================

export const INITIAL_ONBOARDING_PROGRESS: CrewOnboardingProgress[] = [
  {
    id: 'onb-kru-01',
    kru_id: 'kru-01',
    nama_kru: 'Budi Santoso',
    kode_outlet: 'HC-001',
    divisi: 'Kitchen',
    tanggal_mulai: '2026-08-01',
    trainer_nama: 'Haikal Abi (Trainer Operasional)',
    target_selesai: '2026-10-30',
    current_phase: 'fase_2_60',
    selected_method: 'hybrid_twi_spaced',
    status: 'Aktif Onboarding',
    completed_items: [
      { itemId: 'f1-w1-01', completedAt: '2026-08-02', verifiedBy: 'Haikal Abi', notes: 'Grooming sempurna, kuku pendek', methodUsed: 'hybrid_twi_spaced' },
      { itemId: 'f1-w1-02', completedAt: '2026-08-03', verifiedBy: 'Haikal Abi', notes: 'Cuci tangan 6 langkah tepat 20 detik', methodUsed: 'hybrid_twi_spaced' },
      { itemId: 'f1-w1-03', completedAt: '2026-08-05', verifiedBy: 'Haikal Abi', notes: 'Tanggap K3 minyak dan gas paham', methodUsed: 'hybrid_twi_spaced' },
      { itemId: 'f1-w2-01', completedAt: '2026-08-10', verifiedBy: 'Haikal Abi', notes: 'Nasi Miyako pulen tanak 15 mnt', methodUsed: 'hybrid_twi_spaced' },
      { itemId: 'f1-w3-01', completedAt: '2026-08-17', verifiedBy: 'Haikal Abi', notes: 'Goreng ayam 12 mnt 160C keriting mekar', methodUsed: 'hybrid_twi_spaced' },
      { itemId: 'f1-w3-02', completedAt: '2026-08-20', verifiedBy: 'Haikal Abi', notes: 'Kulit dan ayam utuh dimekarkan pas', methodUsed: 'hybrid_twi_spaced' },
      { itemId: 'f1-w4-01', completedAt: '2026-08-28', verifiedBy: 'Haikal Abi', notes: 'Solo shift stasiun kitchen bersih', methodUsed: 'hybrid_twi_spaced' },
      { itemId: 'f1-w4-02', completedAt: '2026-08-30', verifiedBy: 'Haikal Abi', notes: 'Lulus Sidang Milestone 1 skor 92', methodUsed: 'hybrid_twi_spaced' },
      { itemId: 'f2-w5-01', completedAt: '2026-09-05', verifiedBy: 'Haikal Abi', notes: 'Nasi goreng bumbu eco 20g gurih', methodUsed: 'hybrid_twi_spaced' },
      { itemId: 'f2-w5-02', completedAt: '2026-09-10', verifiedBy: 'Haikal Abi', notes: 'Telur dadar & kentang goreng pas', methodUsed: 'hybrid_twi_spaced' },
    ],
    notes_weekly: [
      { week: 1, tanggal: '2026-08-07', catatan: 'Orientasi sangat baik. Adaptasi fisik di dapur cepat tanggap.', trainer: 'Haikal Abi' },
      { week: 2, tanggal: '2026-08-14', catatan: 'Penakaran air nasi Miyako stabil. Memahami fungsi jeda 15 menit.', trainer: 'Haikal Abi' },
      { week: 3, tanggal: '2026-08-21', catatan: 'Teknik penepungan ayam krispi mekar bagus. Kontrol suhu fryer konsisten.', trainer: 'Haikal Abi' },
      { week: 4, tanggal: '2026-08-30', catatan: 'Lulus evaluasi Milestone 1 dengan skor memuaskan. Siap cross-training menu tambahan.', trainer: 'Haikal Abi' },
      { week: 5, tanggal: '2026-09-08', catatan: 'Memasak nasi goreng bumbu eco presisi. Rasa gurih seragam.', trainer: 'Haikal Abi' },
    ],
    signoffs: {
      fase_1: {
        signedAt: '2026-08-30',
        trainerName: 'Haikal Abi (Trainer Operasional)',
        kepalaOutlet: 'Rian Hidayat (Kepala Outlet)',
        status: 'Lulus',
        skorTeori: 92,
        skorPraktik: 94,
        catatan: 'Kru menunjukkan kepatuhan SOP 100%, disiplin suhu fryer, dan higienitas tinggi.',
      },
    },
    created_at: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'onb-kru-02',
    kru_id: 'kru-02',
    nama_kru: 'Siti Aminah',
    kode_outlet: 'HC-002',
    divisi: 'Kasir',
    tanggal_mulai: '2026-08-15',
    trainer_nama: 'Haikal Abi (Trainer Operasional)',
    target_selesai: '2026-11-15',
    current_phase: 'fase_1_30',
    selected_method: 'agile_gamified_sprints',
    status: 'Aktif Onboarding',
    completed_items: [
      { itemId: 'f1-w1-01', completedAt: '2026-08-16', verifiedBy: 'Haikal Abi', notes: 'Grooming rapi dan senyum ramah', methodUsed: 'agile_gamified_sprints' },
      { itemId: 'f1-w1-02', completedAt: '2026-08-17', verifiedBy: 'Haikal Abi', notes: 'Cuci tangan 6 langkah tuntas', methodUsed: 'agile_gamified_sprints' },
      { itemId: 'f1-w1-03', completedAt: '2026-08-18', verifiedBy: 'Haikal Abi', notes: 'Lokasi APAR dan evakuasi paham', methodUsed: 'agile_gamified_sprints' },
      { itemId: 'f1-w2-02', completedAt: '2026-08-22', verifiedBy: 'Haikal Abi', notes: 'Modal awal dihitung pas Rp 500rb, greeting ramah', methodUsed: 'agile_gamified_sprints' },
      { itemId: 'f1-w3-03', completedAt: '2026-08-28', verifiedBy: 'Haikal Abi', notes: 'Suggestive selling kulit krispi sukses', methodUsed: 'agile_gamified_sprints' },
    ],
    notes_weekly: [
      { week: 1, tanggal: '2026-08-20', catatan: 'Greeting alami, suara ramah dan artikulasi sangat jelas.', trainer: 'Haikal Abi' },
      { week: 2, tanggal: '2026-08-27', catatan: 'Kecepatan input POS membaik. Teliti menghitung uang kembalian tunai.', trainer: 'Haikal Abi' },
    ],
    signoffs: {},
    created_at: '2026-08-15T08:00:00.000Z',
  },
  {
    id: 'onb-kru-03',
    kru_id: 'kru-03',
    nama_kru: 'Dedi Kurniawan',
    kode_outlet: 'HC-003',
    divisi: 'Geprek',
    tanggal_mulai: '2026-08-20',
    trainer_nama: 'Haikal Abi (Trainer Operasional)',
    target_selesai: '2026-11-20',
    current_phase: 'fase_1_30',
    selected_method: 'buddy_apprenticeship',
    status: 'Aktif Onboarding',
    completed_items: [
      { itemId: 'f1-w1-01', completedAt: '2026-08-21', verifiedBy: 'Haikal Abi', notes: 'Seragam lengkap' },
      { itemId: 'f1-w1-02', completedAt: '2026-08-22', verifiedBy: 'Haikal Abi', notes: 'Cuci tangan 6 langkah hafal' },
      { itemId: 'f1-w1-03', completedAt: '2026-08-24', verifiedBy: 'Haikal Abi', notes: 'Letak APAR dipahami' },
      { itemId: 'f1-w2-03', completedAt: '2026-08-29', verifiedBy: 'Haikal Abi', notes: 'Gramasi cabai level 1-5 presisi' },
    ],
    notes_weekly: [
      { week: 2, tanggal: '2026-08-29', catatan: 'Mampu menakar cabai dengan cepat. Melatih teknik siraman minyak mendesis 180°C.', trainer: 'Haikal Abi' },
    ],
    signoffs: {},
    created_at: '2026-08-20T08:00:00.000Z',
  },
];

// =========================================================================
// DATA SCIENCE & ANALYTICS HELPER FUNCTIONS UNTUK TRAINER F&B
// =========================================================================

/**
 * 1. Predictive Time-to-Autonomy (TTA) Calculation
 * Mengukur kecepatan belajar kru (Learning Velocity Index) dan memprediksi
 * apakah kru on-track, fast-track, atau at-risk (butuh bimbingan GROW).
 */
export function calculateLearningVelocity(progress: CrewOnboardingProgress): {
  velocityIndex: number;
  status: 'Fast-Track (Unggul)' | 'On-Schedule (Normal)' | 'At-Risk (Butuh GROW)';
  completedPercent: number;
  predictedDaysToGraduate: number;
  recommendation: string;
} {
  const totalItems = OFFICIAL_ONBOARDING_CURRICULUM.filter(
    (item) => item.divisi === 'Semua' || item.divisi === progress.divisi
  ).length;

  const completedCount = progress.completed_items.length;
  const completedPercent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const startDate = new Date(progress.tanggal_mulai).getTime();
  const now = Date.now();
  const daysElapsed = Math.max(1, Math.round((now - startDate) / (1000 * 60 * 60 * 24)));

  // Target laju: 90 hari untuk menyelesaikan seluruh kurikulum (~1.1% per hari)
  const expectedPercent = Math.min(100, Math.round((daysElapsed / 90) * 100));
  const velocityIndex = expectedPercent > 0 ? Number((completedPercent / expectedPercent).toFixed(2)) : 1.0;

  let status: 'Fast-Track (Unggul)' | 'On-Schedule (Normal)' | 'At-Risk (Butuh GROW)' = 'On-Schedule (Normal)';
  let recommendation = 'Progres sesuai jadwal kurikulum baku. Lanjutkan observasi berkala.';

  if (velocityIndex >= 1.15) {
    status = 'Fast-Track (Unggul)';
    recommendation = 'Kru menunjukkan daya serap tinggi. Dapat dipersiapkan lebih awal untuk ujian milestone berikutnya.';
  } else if (velocityIndex < 0.85) {
    status = 'At-Risk (Butuh GROW)';
    recommendation = 'Progres tertinggal dari target roadmap. Segera jadwalkan sesi coaching GROW 1-on-1 dan bimbingan praktik intensif.';
  }

  // Prediksi sisa hari hingga kelulusan
  const remainingPercent = Math.max(0, 100 - completedPercent);
  const dailyRate = Math.max(0.2, completedPercent / daysElapsed);
  const predictedDaysToGraduate = Math.round(remainingPercent / dailyRate);

  return {
    velocityIndex,
    status,
    completedPercent,
    predictedDaysToGraduate,
    recommendation,
  };
}

/**
 * 2. Ebbinghaus Competency Decay Risk Model
 * Mengestimasi sisa retensi ingatan SOP kru berdasarkan jumlah hari sejak observasi/evaluasi terakhir.
 * Formula: R = e^(-t / S), di mana S = 45 hari stabilitas pelatihan F&B.
 */
export function calculateCompetencyDecay(daysSinceLastAudit: number): {
  retentionPercent: number;
  decayLevel: 'Prima (Aman)' | 'Waspada (Sedang)' | 'Kritis (Butuh Audit Segera)';
  color: string;
} {
  const S = 45; // Stabilitas hari memori operasional standar QSR
  const retention = Math.exp(-daysSinceLastAudit / S);
  const retentionPercent = Math.round(retention * 100);

  if (retentionPercent >= 82) {
    return {
      retentionPercent,
      decayLevel: 'Prima (Aman)',
      color: 'emerald',
    };
  } else if (retentionPercent >= 68) {
    return {
      retentionPercent,
      decayLevel: 'Waspada (Sedang)',
      color: 'amber',
    };
  } else {
    return {
      retentionPercent,
      decayLevel: 'Kritis (Butuh Audit Segera)',
      color: 'rose',
    };
  }
}
