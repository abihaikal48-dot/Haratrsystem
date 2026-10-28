// =========================================================================
// SILABUS DAN TIMELINE RESMI PELATIHAN CREW HARA CHICKEN
// Sesuai Dokumen Resmi "Rancangan Pelatihan Pengenalan Crew di HARA"
// & "Lembar Monitoring Kru Training"
// =========================================================================

export interface OffJobTrainingTopic {
  no: number;
  hari_ke: 1 | 2 | 3;
  materi: string;
  tujuan: string;
  durasi_jam: number;
  metode: string;
  trainer_pic: string;
  evaluasi: string;
}

export interface OnJobTrainingMilestone {
  no: number;
  hari_range: string;
  hari_start: number;
  hari_end: number;
  materi_kegiatan: string;
  durasi_hari: number;
  tujuan_pembelajaran: string;
  detail_poin: string[];
  metode_pendampingan: string;
  pic_trainer: string;
  departemen: 'ODHRL' | 'Operasional' | 'ODHRL & Operasional';
  evaluasi_catatan: string;
}

export interface MonitoringModuleGroup {
  id: string;
  nama_modul: string;
  singkatan: string;
  hari_start: number;
  hari_end: number;
  total_hari: number;
  days: number[];
  color: string;
  header_bg: string;
  pic_default: string;
  dept: string;
}

// =========================================================================
// 1. TRAINING (OFF JOB TRAINEE) ON BOARDING CREW — IN CLASS (24 JAM)
// =========================================================================
export const OFFICIAL_HARA_OFF_JOB_ONBOARDING: OffJobTrainingTopic[] = [
  // Hari ke-1 (8 Jam)
  {
    no: 1,
    hari_ke: 1,
    materi: 'Pengenalan Perusahaan & Budaya, ROTG, Pest Control',
    tujuan: 'Karyawan memahami visi, misi, dan nilai kerja HARA Chicken',
    durasi_jam: 2,
    metode: 'Presentasi, diskusi',
    trainer_pic: 'HR / Direktur',
    evaluasi: 'Tanya jawab, absensi'
  },
  {
    no: 2,
    hari_ke: 1,
    materi: 'SOP Kebersihan, K3',
    tujuan: 'Menjaga higienitas dan keselamatan kerja di seluruh area outlet',
    durasi_jam: 1,
    metode: 'Video, roleplay, praktik',
    trainer_pic: 'Supervisor Outlet',
    evaluasi: 'Observasi, checklist'
  },
  {
    no: 3,
    hari_ke: 1,
    materi: 'SOP Kasir & Layanan Online',
    tujuan: 'Menguasai penggunaan mesin kasir POS & aplikasi pesan antar',
    durasi_jam: 1,
    metode: 'Simulasi, praktik langsung',
    trainer_pic: 'Senior Kasir / FAT',
    evaluasi: 'Tes singkat, observasi kerja'
  },
  {
    no: 4,
    hari_ke: 1,
    materi: 'Service Excellence',
    tujuan: 'Memberikan layanan ramah & cepat sesuai standar hospitality HARA',
    durasi_jam: 1,
    metode: 'Roleplay & studi kasus',
    trainer_pic: 'Operasional Manager',
    evaluasi: 'Penilaian pelayanan pelanggan'
  },
  {
    no: 5,
    hari_ke: 1,
    materi: 'Manajemen Stok & FIFO',
    tujuan: 'Mengurangi food waste dan meningkatkan efisiensi bahan baku',
    durasi_jam: 1,
    metode: 'Diskusi, praktik lapangan',
    trainer_pic: 'FAT (Finance & Accounting)',
    evaluasi: 'Laporan stok harian'
  },
  {
    no: 6,
    hari_ke: 1,
    materi: 'Handling Complaint Customer',
    tujuan: 'Mampu menghadapi komplain dengan baik dan tenang tanpa berdebat',
    durasi_jam: 1,
    metode: 'Simulasi, studi kasus',
    trainer_pic: 'Operasional Manager / Marketing Manager',
    evaluasi: 'Simulasi + feedback trainer'
  },
  {
    no: 7,
    hari_ke: 1,
    materi: 'Refreshment & Motivasi',
    tujuan: 'Meningkatkan teamwork dan semangat kerja insan HARA',
    durasi_jam: 1,
    metode: 'Workshop, sharing session',
    trainer_pic: 'HR',
    evaluasi: 'Survey kepuasan karyawan'
  },

  // Hari ke-2 (8 Jam)
  {
    no: 8,
    hari_ke: 2,
    materi: 'SOP Produk (RnD)',
    tujuan: 'Menguasai standar memasak, penggorengan 160°C & penyajian produk',
    durasi_jam: 8,
    metode: 'On the job training / In-class cooking lab',
    trainer_pic: 'Tim RnD',
    evaluasi: 'Uji praktik produk & rasa'
  },

  // Hari ke-3 (8 Jam)
  {
    no: 9,
    hari_ke: 3,
    materi: 'SOP Produk Lanjutan (RnD)',
    tujuan: 'Pendalaman racikan sambal uleg batu 30g, nasi pulen, dan menu kombo',
    durasi_jam: 8,
    metode: 'On the job training / In-class cooking lab',
    trainer_pic: 'Tim RnD',
    evaluasi: 'Uji praktik produk & plating'
  },
  {
    no: 10,
    hari_ke: 3,
    materi: 'Refreshment & Motivasi Penutup',
    tujuan: 'Membangun komitmen kesiapan OJT outlet dan penyerahan perlengkapan kerja',
    durasi_jam: 1,
    metode: 'Workshop, sharing session',
    trainer_pic: 'HR',
    evaluasi: 'Survey kepuasan & komitmen'
  }
];

// =========================================================================
// 2. TRAINING (ON JOB TRAINEE) PENDAMPINGAN CREW — OUT CLASS (28 HARI OJT)
// =========================================================================
export const OFFICIAL_HARA_ON_JOB_PENDAMPINGAN: OnJobTrainingMilestone[] = [
  {
    no: 1,
    hari_range: 'Hari ke-1',
    hari_start: 1,
    hari_end: 1,
    durasi_hari: 1,
    materi_kegiatan: 'Orientasi Perusahaan dan Outlet',
    tujuan_pembelajaran: 'Crew memahami budaya kerja dan aturan dasar perusahaan',
    detail_poin: [
      'Pengenalan visi, misi, dan nilai perusahaan',
      'Struktur organisasi outlet & perkenalan rekan kerja',
      'Tata tertib, jam kerja, absensi & SOP outlet'
    ],
    metode_pendampingan: 'Briefing dan diskusi',
    pic_trainer: 'Supervisor Outlet, Supervisor ODHRL',
    departemen: 'ODHRL & Operasional',
    evaluasi_catatan: 'Observasi dan tanya jawab'
  },
  {
    no: 2,
    hari_range: 'Hari ke-2',
    hari_start: 2,
    hari_end: 2,
    durasi_hari: 1,
    materi_kegiatan: 'Pengenalan Area Kerja & Grooming',
    tujuan_pembelajaran: 'Crew mengenal lingkungan kerja dan standar kebersihan',
    detail_poin: [
      'Tour area: kitchen, kasir, gudang, area makan, wastafel',
      'Standar kebersihan & penampilan (grooming, hairnet, apron, kuku, sepatu)',
      'Pengenalan jalur evakuasi & letak APAR'
    ],
    metode_pendampingan: 'Pendampingan langsung',
    pic_trainer: 'Supervisor / Senior Crew',
    departemen: 'Operasional',
    evaluasi_catatan: 'Checklist area & sikap kerja'
  },
  {
    no: 3,
    hari_range: 'Hari ke-3 s/d 4',
    hari_start: 3,
    hari_end: 4,
    durasi_hari: 2,
    materi_kegiatan: 'Pengenalan Produk & Bahan Baku',
    tujuan_pembelajaran: 'Crew mengenal produk dan bahan baku dengan benar, Membaca SOP Outlet',
    detail_poin: [
      'Jenis menu dan bahan utama (ayam marinasi, beras Miyako, tepung, bumbu)',
      'Penyimpanan bahan baku (suhu chiller 4°C, freezer -18°C, ruang kering)',
      'Membaca dokumen SOP outlet secara runtut'
    ],
    metode_pendampingan: 'Demonstrasi dan praktik',
    pic_trainer: 'Cook / Kitchen Leader',
    departemen: 'Operasional',
    evaluasi_catatan: 'Tes lisan dan observasi'
  },
  {
    no: 4,
    hari_range: 'Hari ke-5 s/d 8',
    hari_start: 5,
    hari_end: 8,
    durasi_hari: 4,
    materi_kegiatan: 'Pelatihan Kitchen Dasar',
    tujuan_pembelajaran: 'Crew mampu menyiapkan bahan sesuai SOP',
    detail_poin: [
      'Persiapan bahan (nasi pulen, goreng ayam 160°C, sambal 30g, minuman)',
      'Food safety, HACCP, suhu minyak & sanitasi kerja',
      'Penepungan 10x cubit mekar dan teknik angkat tiris ayam'
    ],
    metode_pendampingan: 'Praktek langsung dengan pendamping',
    pic_trainer: 'Kepala Outlet / Wakil Kepala Outlet',
    departemen: 'Operasional',
    evaluasi_catatan: 'Evaluasi hasil kerja & rasa'
  },
  {
    no: 5,
    hari_range: 'Hari ke-9 s/d 12',
    hari_start: 9,
    hari_end: 12,
    durasi_hari: 4,
    materi_kegiatan: 'Pelatihan Area Service / Kasir',
    tujuan_pembelajaran: 'Crew mampu melayani pelanggan dengan baik, Membaca SOP pelayanan',
    detail_poin: [
      'SOP melayani pelanggan (5S: Senyum, Salam, Sapa, Sopan, Santun)',
      'Cara menerima pesanan (dine-in / take away)',
      'Penggunaan mesin kasir / POS, repeat order, serah kembalian 2 tangan'
    ],
    metode_pendampingan: 'Simulasi & praktik langsung',
    pic_trainer: 'Kasir Senior / Supervisor',
    departemen: 'Operasional',
    evaluasi_catatan: 'Observasi kinerja & kecepatan transaksi'
  },
  {
    no: 6,
    hari_range: 'Hari ke-13 s/d 16',
    hari_start: 13,
    hari_end: 16,
    durasi_hari: 4,
    materi_kegiatan: 'Pelatihan Kebersihan Outlet (Housekeeping)',
    tujuan_pembelajaran: 'Crew menjaga kebersihan sesuai standar outlet, Membaca SOP Kebersihan',
    detail_poin: [
      'Pembersihan area kerja, meja makan, lantai, toilet',
      'Penggunaan 4 jenis kain lap (Kanebo piring, Orange meja, Dapur alat, Lantai pel)',
      'Pengelolaan sampah, limbah minyak, dan grease trap'
    ],
    metode_pendampingan: 'Demonstrasi dan praktik',
    pic_trainer: 'Supervisor / OB Senior',
    departemen: 'Operasional',
    evaluasi_catatan: 'Checklist kebersihan harian'
  },
  {
    no: 7,
    hari_range: 'Hari ke-17 s/d 18',
    hari_start: 17,
    hari_end: 18,
    durasi_hari: 2,
    materi_kegiatan: 'Handling Customer & Komplain Dasar',
    tujuan_pembelajaran: 'Crew mampu menghadapi pelanggan secara profesional',
    detail_poin: [
      'Etika berkomunikasi dan hospitality',
      'Cara menanggapi komplain dengan sopan tanpa berdebat',
      'Prosedur Service Recovery Tipe A (ganti produk baru <3 menit)'
    ],
    metode_pendampingan: 'Role play dan studi kasus',
    pic_trainer: 'Supervisor Outlet',
    departemen: 'Operasional',
    evaluasi_catatan: 'Simulasi & penilaian respon'
  },
  {
    no: 8,
    hari_range: 'Hari ke-19 s/d 22',
    hari_start: 19,
    hari_end: 22,
    durasi_hari: 4,
    materi_kegiatan: 'Operasional Mandiri – Shift',
    tujuan_pembelajaran: 'Crew mulai mandiri di area kerja',
    detail_poin: [
      'Melakukan pekerjaan rutin tanpa pendamping',
      'Manajemen waktu shift dan persiapan jam rush hour',
      'Kemandirian stock holding warmer dan kebersihan stasiun'
    ],
    metode_pendampingan: 'Praktek kerja nyata',
    pic_trainer: 'Supervisor Outlet',
    departemen: 'Operasional',
    evaluasi_catatan: 'Observasi langsung independensi'
  },
  {
    no: 9,
    hari_range: 'Hari ke-23 s/d 26',
    hari_start: 23,
    hari_end: 26,
    durasi_hari: 4,
    materi_kegiatan: 'Rotasi Area Kerja',
    tujuan_pembelajaran: 'Crew memahami semua posisi di outlet',
    detail_poin: [
      'Rotasi bergiliran: Kitchen, kasir, service, kebersihan',
      'Memahami keterkaitan alur pesanan antar stasiun',
      'Fleksibilitas bantuan saat salah satu stasiun rush'
    ],
    metode_pendampingan: 'On the job training bergilir',
    pic_trainer: 'Supervisor / Senior Crew',
    departemen: 'Operasional',
    evaluasi_catatan: 'Penilaian per area kerja'
  },
  {
    no: 10,
    hari_range: 'Hari ke-27',
    hari_start: 27,
    hari_end: 27,
    durasi_hari: 1,
    materi_kegiatan: 'Simulasi Operasional Penuh',
    tujuan_pembelajaran: 'Crew mampu bekerja sesuai ritme outlet',
    detail_poin: [
      'Menjalankan outlet seolah-olah bekerja penuh tanpa intervensi',
      'Stress test Speed of Service (Dine in <10 mnt, Take away <5 mnt)',
      'Manajemen closing shift dan kebersihan tuntas'
    ],
    metode_pendampingan: 'Simulasi kerja penuh',
    pic_trainer: 'Supervisor Outlet',
    departemen: 'Operasional',
    evaluasi_catatan: 'Observasi & evaluasi ritme kerja'
  },
  {
    no: 11,
    hari_range: 'Hari ke-28',
    hari_start: 28,
    hari_end: 28,
    durasi_hari: 1,
    materi_kegiatan: 'Evaluasi Akhir & Feedback',
    tujuan_pembelajaran: 'Menilai kesiapan crew menjadi karyawan tetap',
    detail_poin: [
      'Penilaian kedisiplinan, teamwork, kemampuan teknis komprehensif',
      'Wawancara & review form OJT bersama HR & Store Manager',
      'Pemberian feedback perbaikan & rekomendasi kelulusan OJT resmi'
    ],
    metode_pendampingan: 'Wawancara & review form OJT',
    pic_trainer: 'Supervisor & HR',
    departemen: 'ODHRL & Operasional',
    evaluasi_catatan: 'Form hasil OJT & Rekomendasi kelulusan'
  }
];

// =========================================================================
// 3. DAFTAR 12 GRUP MODUL MATRIKS CHECKLIST 30 HARI (SESUAI HALAMAN 2 PDF)
// =========================================================================
export const OFFICIAL_HARA_MONITORING_GROUPS: MonitoringModuleGroup[] = [
  {
    id: 'grp-onboard',
    nama_modul: 'Training Onboarding (In-Class)',
    singkatan: 'Onboarding',
    hari_start: 1,
    hari_end: 3,
    total_hari: 3,
    days: [1, 2, 3],
    color: 'amber',
    header_bg: 'bg-amber-100/90 text-amber-950 border-amber-300',
    pic_default: 'HR / RnD Trainer',
    dept: 'ODHRL'
  },
  {
    id: 'grp-orientasi',
    nama_modul: 'Orientasi Perusahaan dan Outlet',
    singkatan: 'Orientasi',
    hari_start: 4,
    hari_end: 4,
    total_hari: 1,
    days: [4],
    color: 'blue',
    header_bg: 'bg-blue-100/90 text-blue-950 border-blue-300',
    pic_default: 'Supervisor Outlet & ODHRL',
    dept: 'ODHRL & Ops'
  },
  {
    id: 'grp-area-grooming',
    nama_modul: 'Pengenalan Area Kerja & Grooming',
    singkatan: 'Area & Grooming',
    hari_start: 5,
    hari_end: 5,
    total_hari: 1,
    days: [5],
    color: 'emerald',
    header_bg: 'bg-emerald-100/90 text-emerald-950 border-emerald-300',
    pic_default: 'Supervisor / Senior Crew',
    dept: 'Operasional'
  },
  {
    id: 'grp-produk-bahan',
    nama_modul: 'Pengenalan Produk & Bahan Baku',
    singkatan: 'Produk & Bahan',
    hari_start: 6,
    hari_end: 7,
    total_hari: 2,
    days: [6, 7],
    color: 'purple',
    header_bg: 'bg-purple-100/90 text-purple-950 border-purple-300',
    pic_default: 'Cook / Kitchen Leader',
    dept: 'Operasional'
  },
  {
    id: 'grp-kitchen-dasar',
    nama_modul: 'Pelatihan Kitchen Dasar',
    singkatan: 'Kitchen Dasar',
    hari_start: 8,
    hari_end: 11,
    total_hari: 4,
    days: [8, 9, 10, 11],
    color: 'red',
    header_bg: 'bg-red-100/90 text-red-950 border-red-300',
    pic_default: 'Kepala Outlet / Kitchen Lead',
    dept: 'Operasional'
  },
  {
    id: 'grp-service-kasir',
    nama_modul: 'Pelatihan Area Service / Kasir',
    singkatan: 'Service / Kasir',
    hari_start: 12,
    hari_end: 15,
    total_hari: 4,
    days: [12, 13, 14, 15],
    color: 'cyan',
    header_bg: 'bg-cyan-100/90 text-cyan-950 border-cyan-300',
    pic_default: 'Kasir Senior / Supervisor',
    dept: 'Operasional'
  },
  {
    id: 'grp-housekeeping',
    nama_modul: 'Pelatihan Kebersihan Outlet (Housekeeping)',
    singkatan: 'Housekeeping',
    hari_start: 16,
    hari_end: 19,
    total_hari: 4,
    days: [16, 17, 18, 19],
    color: 'teal',
    header_bg: 'bg-teal-100/90 text-teal-950 border-teal-300',
    pic_default: 'Supervisor / OB Senior',
    dept: 'Operasional'
  },
  {
    id: 'grp-handling-komplain',
    nama_modul: 'Handling Customer & Komplain Dasar',
    singkatan: 'Komplain Dasar',
    hari_start: 20,
    hari_end: 21,
    total_hari: 2,
    days: [20, 21],
    color: 'orange',
    header_bg: 'bg-orange-100/90 text-orange-950 border-orange-300',
    pic_default: 'Supervisor Outlet',
    dept: 'Operasional'
  },
  {
    id: 'grp-mandiri-shift',
    nama_modul: 'Operasional Mandiri – Shift',
    singkatan: 'Mandiri Shift',
    hari_start: 22,
    hari_end: 25,
    total_hari: 4,
    days: [22, 23, 24, 25],
    color: 'indigo',
    header_bg: 'bg-indigo-100/90 text-indigo-950 border-indigo-300',
    pic_default: 'Supervisor Outlet',
    dept: 'Operasional'
  },
  {
    id: 'grp-rotasi-area',
    nama_modul: 'Rotasi Area Kerja',
    singkatan: 'Rotasi Area',
    hari_start: 26,
    hari_end: 28,
    total_hari: 3,
    days: [26, 27, 28],
    color: 'slate',
    header_bg: 'bg-slate-200 text-slate-900 border-slate-400',
    pic_default: 'Supervisor / Senior Crew',
    dept: 'Operasional'
  },
  {
    id: 'grp-simulasi-penuh',
    nama_modul: 'Simulasi Operasional Penuh',
    singkatan: 'Simulasi Penuh',
    hari_start: 29,
    hari_end: 29,
    total_hari: 1,
    days: [29],
    color: 'amber',
    header_bg: 'bg-amber-200 text-amber-950 border-amber-400',
    pic_default: 'Supervisor Outlet',
    dept: 'Operasional'
  },
  {
    id: 'grp-evaluasi-akhir',
    nama_modul: 'Evaluasi Akhir & Feedback',
    singkatan: 'Evaluasi Akhir',
    hari_start: 30,
    hari_end: 30,
    total_hari: 1,
    days: [30],
    color: 'emerald',
    header_bg: 'bg-emerald-200 text-emerald-950 border-emerald-400',
    pic_default: 'Supervisor & HR',
    dept: 'ODHRL / Ops'
  }
];
