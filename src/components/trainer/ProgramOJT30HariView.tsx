import React, { useState, useMemo } from 'react';
import {
  Calendar, CheckCircle2, Clock, Award, BookOpen, Target,
  Users, AlertCircle, FileCheck, Shield, Sparkles, ChevronRight,
  Flame, Utensils, HeartHandshake, CheckSquare, Printer, Download,
  UserCheck, AlertTriangle, Eye, ArrowLeft, Check
} from 'lucide-react';
import { db } from '../../lib/storage';
import { Kru, Outlet } from '../../types';
import { HaraLogo } from '../HaraLogo';

interface OJTDayMilestone {
  dayNumber: number;
  week: 1 | 2 | 3 | 4;
  title: string;
  category: 'Visi & Budaya' | 'Higiene & K3' | 'Helper & Sanitasi' | 'FIFO & Cold Storage' | 'Resep & Cooking' | 'Kasir & Layanan' | 'Rush Hour & Komplain' | 'Ujian Kelulusan';
  description: string;
  materiPenjelasan: string[];
  poinKritisSOP: string[];
  kriteriaLulusTrainer: string;
  verifiedByDefault?: boolean;
}

const PROGRAM_30_HARI_CURRICULUM: OJTDayMilestone[] = [
  // MINGGU 1: FONDASE BUDAYA, VISI MISI, GROOMING & K3
  {
    dayNumber: 1,
    week: 1,
    title: 'Orientasi Perusahaan, Visi & Misi HARA',
    category: 'Visi & Budaya',
    description: 'Memahami alasan keberadaan perusahaan (WHY), visi menjadi jaringan QSR ayam geprek terpercaya nasional, dan filosofi #BeneranDiGeprek.',
    materiPenjelasan: [
      'Visi HARA: Menjadi penyedia hidangan ayam krispi geprek berkualitas prima yang halal, lezat, terjangkau, dan membuka lapangan kerja seluas-luasnya bagi rakyat.',
      'Misi HARA: 1) Konsistensi rasa & kebersihan tanpa kompromi; 2) Pelayanan ramah berbasis kekeluargaan; 3) Memberdayakan talenta lokal menjadi tenaga profesional kuliner.',
      'Filosofi #BeneranDiGeprek: Daging ayam renyah digeprek asli dengan cobek batu dan cabai segar pilihan, bukan sekadar dioles sambal.',
    ],
    poinKritisSOP: [
      'Menghafal dan mampu melafalkan Visi & Misi perusahaan saat briefing shift.',
      'Paham bahwa kepuasan tamu adalah prioritas nomor satu setiap insan HARA.',
    ],
    kriteriaLulusTrainer: 'Kru mampu menjelaskan makna Visi & Misi HARA dengan kata-katanya sendiri secara lugas.',
    verifiedByDefault: true,
  },
  {
    dayNumber: 2,
    week: 1,
    title: 'Internalisasi 4 Nilai Budaya H.A.R.A',
    category: 'Visi & Budaya',
    description: 'Penerapan 4 nilai inti: Halal, Amanah, Responsif, Adaptif dalam setiap helaan nafas operasional gerai.',
    materiPenjelasan: [
      'H - HALAL: Menjaga kesucian bahan, proses sembelih syar\'i, bebas alkohol, serta kebersihan alat dari kontaminasi zat najis.',
      'A - AMANAH: Jujur dalam menimbang gramasi, menjaga uang kas kasir tanpa selisih, dan menjaga kepercayaan pelanggan.',
      'R - RESPONSIF: Tanggap melayani tamu dalam 3 detik pertama, sigap membersihkan meja kotor, dan cepat membantu rekan se-tim.',
      'A - ADAPTIF: Siap menghadapi jam rush yang padat, tanggap terhadap perubahan pesanan, dan terus belajar menyempurnakan skill.',
    ],
    poinKritisSOP: [
      'Penerapan 3S (Senyum, Salam, Sapa) setiap kali berpapasan dengan tamu.',
      'Integritas tinggi dalam penggunaan bahan baku tanpa memanipulasi takaran.',
    ],
    kriteriaLulusTrainer: 'Kru dapat memberikan contoh perilaku nyata dari masing-masing 4 huruf H.A.R.A.',
    verifiedByDefault: true,
  },
  {
    dayNumber: 3,
    week: 1,
    title: 'Standar Grooming, Seragam & Cuci Tangan 6 Langkah WHO',
    category: 'Higiene & K3',
    description: 'Penampilan profesional, kebersihan diri tingkat tinggi, dan pembiasaan cuci tangan antiseptik berstandar sanitasi medis.',
    materiPenjelasan: [
      'Kelengkapan Seragam: Topi HARA/Hairnet rapi (rambut tidak keluar), celemek bersih tanpa noda minyak, baju seragam berkerah rapi, celana hitam, sepatu tertutup anti-selip.',
      'Higiene Pribadi: Kuku dipotong pendek tanpa cat kuku, tidak memakai perhiasan cincin/gelang di area produksi, wangi segar bebas bau badan.',
      'Prosedur Cuci Tangan 6 Langkah WHO minimal 20 detik menggunakan sabun antibakteri dan air mengalir sebelum masuk stasiun kerja.',
    ],
    poinKritisSOP: [
      'Wajib cuci tangan setiap: ganti sarung tangan, setelah memegang ayam mentah, setelah menyapu, dan setelah dari toilet.',
      'Dilarang menyentuh wajah/hidung saat berada di stasiun perakitan makanan.',
    ],
    kriteriaLulusTrainer: 'Praktik cuci tangan 6 langkah 100% tepat tanpa terbalik urutannya.',
    verifiedByDefault: true,
  },
  {
    dayNumber: 4,
    week: 1,
    title: 'Keselamatan Kerja Dapur (K3), Minyak Panas & APAR',
    category: 'Higiene & K3',
    description: 'Pencegahan kecelakaan kerja: luka bakar minyak panas 170°C, kebocoran gas LPG, lantai licin, dan pengoperasian tabung pemadam api.',
    materiPenjelasan: [
      'Bahaya Minyak Panas: Memasukkan ayam secara perlahan menggunakan penjepit (tongs) ke dalam minyak 165°C, DILARANG MELEMPAR ayam.',
      'Penanganan Gas LPG: Mengecek bau gas bocor sebelum menyalakan kompor, memastikan regulator terpasang kencang dengan karet sil utuh.',
      'Penggunaan APAR (Metode PASS: Pull, Aim, Squeeze, Sweep) untuk memadamkan kebakaran minyak/listrik kelas B & C.',
      'Lantai Aman: Menjaga lantai kitchen tetap kering kesat menggunakan sepatu safety bersol karet anti-licin.',
    ],
    poinKritisSOP: [
      'Dilarang menuangkan air ke dalam wajan penggorengan minyak panas (risiko ledakan uap minyak).',
      'Mengetahui lokasi APAR terdekat di kitchen dan jalur evakuasi darurat gerai.',
    ],
    kriteriaLulusTrainer: 'Kru mendemonstrasikan sikap tenang dan langkah penggunaan APAR secara benar.',
    verifiedByDefault: true,
  },
  {
    dayNumber: 5,
    week: 1,
    title: 'Tata Tertib Shift Kerja & Kebijakan No Smartphone',
    category: 'Higiene & K3',
    description: 'Disiplin jam kerja, briefing pembagian stasiun, absensi digital, dan aturan ketat penyimpanan gawai pribadi.',
    materiPenjelasan: [
      'Hadir di gerai 15 menit sebelum shift dimulai untuk persiapan fisik dan briefing huddle pagi/siang.',
      'Kebijakan No Smartphone: Gawai pribadi wajib disimpan di loker kru selama jam operasional gerai untuk menjaga fokus dan higienitas.',
      'Etika Komunikasi: Berbicara santun, memanggil rekan kerja dengan nada hormat, dan menghindari obrolan pribadi di depan meja kasir.',
    ],
    poinKritisSOP: [
      'Pengecekan kebersihan stasiun kerja sebelum dan sesudah serah terima shift.',
      'Toleransi keterlambatan 0 menit untuk memastikan kelancaran operasional.',
    ],
    kriteriaLulusTrainer: 'Kru konsisten mematuhi jam kerja dan aturan loker tanpa pelanggaran.',
    verifiedByDefault: true,
  },
  {
    dayNumber: 7,
    week: 1,
    title: 'EVALUASI GATE 1: Ujian Lisan Budaya HARA & K3 Dapur',
    category: 'Ujian Kelulusan',
    description: 'Pintu gerbang evaluasi Minggu ke-1 untuk menentukan kelayakan kru melanjutkan ke stasiun operasional.',
    materiPenjelasan: [
      'Tanya jawab lisan Visi, Misi, dan 4 Nilai Budaya H.A.R.A.',
      'Pengecekan langsung grooming dan kelengkapan seragam.',
      'Simulasi respon darurat K3 dan prosedur cuci tangan.',
    ],
    poinKritisSOP: [
      'Skor minimal kelulusan Gate 1 adalah 80.0 poin.',
      'Jika tidak lulus, wajib mengulang pendampingan Minggu 1 selama 3 hari.',
    ],
    kriteriaLulusTrainer: 'Nilai kelulusan Gate 1 tercapai ≥ 80.0 dan dinyatakan lolos oleh Trainer.',
    verifiedByDefault: true,
  },

  // MINGGU 2: HELPER, SANITASI, CHILLER & FIFO
  {
    dayNumber: 8,
    week: 2,
    title: 'Prosedur Bak Cuci 3 Kompartemen & Chemical Sanitizer',
    category: 'Helper & Sanitasi',
    description: 'Standarisasi pencucian peralatan makan dan masak menggunakan metode Wash, Rinse, Sanitize berstandar food safety.',
    materiPenjelasan: [
      'Bak 1 (WASH): Air hangat bersabun pembersih lemak (suhu 45°C - 50°C) untuk menggosok kerak tepung dan minyak.',
      'Bak 2 (RINSE): Air bersih mengalir untuk membilas seluruh sisa busa sabun hingga kesat.',
      'Bak 3 (SANITIZE): Larutan klorin food grade (konsentrasi 50 - 100 ppm) perendaman minimal 60 detik untuk membunuh kuman patogen.',
      'Penirisan: Alat stainless diletakkan terbalik di rak pengering berventilasi; DILARANG MENGELAP dengan kain bekas.',
    ],
    poinKritisSOP: [
      'Penggantian air bak cuci minimal setiap 2 jam atau jika air sudah berminyak keruh.',
      'Pencegahan kontaminasi silang antara alat masak mentah dan alat saji matang.',
    ],
    kriteriaLulusTrainer: 'Praktik mencuci 10 wadah baskom dengan urutan 3 kompartemen tanpa kesalahan.',
    verifiedByDefault: true,
  },
  {
    dayNumber: 10,
    week: 2,
    title: 'Kebersihan 5S Dining Area, Meja Konsumen & Kamar Mandi',
    category: 'Helper & Sanitasi',
    description: 'Menjaga area tamu selalu higienis, harum, bebas sampah, dan lantai kesat bebas noda minyak.',
    materiPenjelasan: [
      'Pembersihan Meja (Bussing): Meja dibersihkan ≤ 2 menit setelah tamu selesai menggunakan lap sanitasi khusus meja (lap biru/kuning).',
      'Penyemprotan Sanitisasi Meja: Semprot meja dengan larutan pembersih aman dan lap kering merata.',
      'Toilet Standar HARA: Kloset putih bebas kerak, lantai disikat kering bebas genangan, sabun cair dan tisu selalu terisi.',
      'Checklist Toilet: Pengecekan setiap jam dan paraf pada form kontrol toilet.',
    ],
    poinKritisSOP: [
      'Kain lap meja dan kain lap toilet DIPISAHKAN SECARA TEGAS (berbeda warna) dan tidak boleh tertukar.',
      'Zero odor: Mushola dan kamar mandi harus harum segar.',
    ],
    kriteriaLulusTrainer: 'Kru menjalankan bussing meja cepat dan pembersihan toilet sesuai standar kebersihan prima.',
    verifiedByDefault: true,
  },
  {
    dayNumber: 12,
    week: 2,
    title: 'Penerimaan Bahan, Suhu Chiller/Freezer & Labeling FIFO/FEFO',
    category: 'FIFO & Cold Storage',
    description: 'Tata kelola rantai dingin (cold chain), pengecekan suhu logistik, dan rotasi stok First In First Out.',
    materiPenjelasan: [
      'Penerimaan Ayam: Cek suhu logistik (chiller ≤ 4°C, frozen ≤ -18°C), cek aroma tidak anyir, dan tolak jika kemasan bocor.',
      'Pemantauan Suhu: Chiller 1°C - 4°C, Freezer beku -18°C s/d -22°C, catat di Logbook Suhu 3 kali sehari.',
      'Sistem FIFO/FEFO: Bahan yang masuk lebih awal atau kadaluarsa lebih dekat diletakkan di baris depan untuk diolah terlebih dahulu.',
      'Color-Coded Date Tagging: Setiap wadah ayam marinasi diberi stiker label tanggal olah, jam pembuatan, dan batas kadaluarsa (maks 48 jam).',
    ],
    poinKritisSOP: [
      'Pemisahan wadah ayam marinasi mentah (rak bawah) dan bahan matang/sayuran (rak atas) anti kontaminasi silang.',
      'Zero expired waste: Tidak ada bahan baku terbuang karena kelalaian rotasi.',
    ],
    kriteriaLulusTrainer: 'Kru mampu menyusun rak chiller dengan prinsip FIFO dan membuat label date-tagging akurat.',
    verifiedByDefault: true,
  },
  {
    dayNumber: 14,
    week: 2,
    title: 'EVALUASI GATE 2: Uji Praktik Stasiun Helper & Cold Storage',
    category: 'Ujian Kelulusan',
    description: 'Pintu gerbang evaluasi Minggu ke-2 untuk mengukur kemandirian stasiun sanitasi dan kontrol bahan baku.',
    materiPenjelasan: [
      'Simulasi penerimaan bahan baku ayam potong dan verifikasi suhu.',
      'Uji penataan stok chiller dengan rotasi FIFO.',
      'Kecepatan dan higienitas sanitasi bak cuci 3 kompartemen.',
    ],
    poinKritisSOP: [
      'Skor minimal kelulusan Gate 2 adalah 80.0 poin.',
      'Verifikasi logbook suhu dan penanganan chemical sanitasi.',
    ],
    kriteriaLulusTrainer: 'Kru dinyatakan kompeten mandiri untuk mengoperasikan stasiun Helper gerai.',
    verifiedByDefault: true,
  },

  // MINGGU 3: RESEP INTI, DEEP FRYER & KASIR POS
  {
    dayNumber: 15,
    week: 3,
    title: 'Teknik Penepungan 10x Cubit Mekar (Crispy Curl Secret)',
    category: 'Resep & Cooking',
    description: 'Kunci kerenyahan HARA: Teknik penepungan berputar lembut tanpa menekan keras agar keriting mekar maksimal.',
    materiPenjelasan: [
      'Persiapan: Tepung bumbu premix HARA diayak bersih, air es celupan bersuhu 4°C - 8°C.',
      'Putaran Pertama: Masukkan ayam marinasi ke tepung, putar melingkar dan cubit lembut 10 kali (jangan ditekan gumpal).',
      'Pencelupan: Masukkan ke keranjang celup air es selama 3 detik hingga rata, angkat dan tiriskan.',
      'Putaran Kedua: Masukkan kembali ke tepung kering, putar melingkar 10-12 kali dengan teknik cubit ringan hingga terbentuk keriting mekar alami.',
      'Ketuk Keriting: Ketuk perlahan pergelangan tangan untuk membuang kelebihan tepung sebelum masuk ke fryer.',
    ],
    poinKritisSOP: [
      'Dilarang meremas ayam seperti adonan roti (akan membuat kulit keras dan liat seperti batu).',
      'Ayak tepung basah setiap 3 batch penggorengan untuk mencegah gumpalan kasar.',
    ],
    kriteriaLulusTrainer: 'Hasil keriting ayam mekar merata dan tepung tidak rontok saat digoreng.',
    verifiedByDefault: false,
  },
  {
    dayNumber: 16,
    week: 3,
    title: 'Pengoperasian Deep Fryer & Suhu Kematangan Core Temp ≥ 74°C',
    category: 'Resep & Cooking',
    description: 'Standar penggorengan ayam: Suhu minyak 165°C - 170°C, timer 12-14 menit, dan jaminan matang higienis.',
    materiPenjelasan: [
      'Kalibrasi Termometer: Suhu minyak harus tepat 165°C - 170°C sebelum ayam dimasukkan.',
      'Kapasitas Maksimal: Maksimal 12-16 potong ayam per batch agar suhu minyak tidak drop drastis.',
      'Waktu Penggorengan: Timer disetel 12-14 menit sesuai bagian potongan ayam (dada/paha).',
      'Food Safety Core Temp: Pengecekan sampel ayam matang dengan termometer tusuk jarum digital; suhu inti tulang harus ≥ 74°C.',
      'Penirisan: Angkat keranjang fryer, gantung tiris selama 3 menit untuk membuang kelebihan minyak sebelum ditaruh di display warmer.',
    ],
    poinKritisSOP: [
      'Zero darah: Tidak boleh ada residu darah merah pada tulang ayam bagian dalam.',
      'Display warmer dijaga suhunya stabil pada 60°C - 70°C.',
    ],
    kriteriaLulusTrainer: 'Ayam goreng berwarna golden brown merata, juicy di dalam, dan suhu internal ≥ 74°C.',
    verifiedByDefault: false,
  },
  {
    dayNumber: 17,
    week: 3,
    title: 'Standarisasi Sambal Bawang Geprek (#BeneranDiGeprek)',
    category: 'Resep & Cooking',
    description: 'Resep otentik sambal korek HARA: Sendok takar cabai 25g, ulekan pas, dan siraman minyak panas bawang.',
    materiPenjelasan: [
      'Porsi Presisi: Gunakan sendok takar (portion scoop) 25g untuk cabai rawit merah segar.',
      'Bumbu Tambahan: Garam 1/2 sdt dan bumbu racik kaldu gurih HARA takaran terstandar.',
      'Ulekan Khas: Ulek kasar cabai dan bawang putih (bukan diblender halus seperti jus) agar tekstur serat cabai renyah terasa.',
      'Minyak Panas: Siram dengan 1 centong minyak panas mendidih (suhu 170°C) dari fryer hingga mendesis wangi.',
      'Geprek Ayam: Letakkan ayam krispi panas, geprek dengan 2-3 pukulan mantap hingga daging merekah dan sambal menyatu.',
    ],
    poinKritisSOP: [
      'Gunakan sendok takar 25g untuk mencegah deviasi pemborosan bahan cabai saat harga mahal.',
      'Ulekan dibersihkan higienis setiap kali selesai transaksi pesanan.',
    ],
    kriteriaLulusTrainer: 'Cita rasa pedas gurih pas, tekstur ulek pas, dan bobot cabai konsisten 25g ± 1g.',
    verifiedByDefault: false,
  },
  {
    dayNumber: 19,
    week: 3,
    title: 'Sistem Kasir POS, Readback Pesanan & Transaksi Cepat',
    category: 'Kasir & Layanan',
    description: 'Pelayanan kasir ramah, pengoperasian software POS lancar, dan transaksi tunai/QRIS ≤ 60 detik.',
    materiPenjelasan: [
      'Greeting Kasir: "Selamat datang di Hara Chicken, dengan saya [Nama], ada yang bisa saya bantu?" disertai senyum 3S.',
      'Pencatatan Pesanan: Input varian paket nasi, pilihan level sambal (Level 1-5), dan varian minuman dengan cepat di layar tablet POS.',
      'Readback Pesanan: Konfirmasi ulang item pesanan dan total harga sebelum meminta pembayaran.',
      'Pembayaran: Menerima uang tunai atau mengarahkan pembayaran QRIS / EDC, serahkan struk dengan dua tangan.',
    ],
    poinKritisSOP: [
      'Selisih kas (cash variance) wajib 0 rupiah di akhir shift kerja.',
      'Waktu antrean kasir maksimal 90 detik per konsumen.',
    ],
    kriteriaLulusTrainer: 'Transaksi kasir berlangsung cepat, sopan, dan tanpa kesalahan input struk.',
    verifiedByDefault: false,
  },
  {
    dayNumber: 20,
    week: 3,
    title: 'Teknik Upselling Menu Add-on & Cross-Selling',
    category: 'Kasir & Layanan',
    description: 'Seni menawarkan menu pelengkap (kulit krispi, telur dadar, es teh jumbo) untuk meningkatkan kepuasan tamu dan margin gerai.',
    materiPenjelasan: [
      'Kalimat Penawaran: "Boleh sekalian tambah Telur Dadar Krispi atau Ekstra Kulit Renyahnya Kak, mumpung baru matang?"',
      'Upsizing Minuman: "Untuk minumannya mau di-upgrade ke ukuran Large Kak, hanya selisih 2.000 saja?"',
      'Target Rasio: Menargetkan minimal 15% dari total transaksi memiliki pesanan menu add-on.',
    ],
    poinKritisSOP: [
      'Tawarkan secara luwes dan bersahabat, jangan memaksa atau membuat tamu merasa tidak nyaman.',
    ],
    kriteriaLulusTrainer: 'Kru mempraktikkan upselling pada role-play kasir dengan intonasi menarik.',
    verifiedByDefault: false,
  },
  {
    dayNumber: 21,
    week: 3,
    title: 'EVALUASI GATE 3: Uji Praktik Stasiun Resep, Fryer & Kasir',
    category: 'Ujian Kelulusan',
    description: 'Pintu gerbang evaluasi Minggu ke-3 untuk menguji kualitas resep dan keterampilan interaksi pelayanan konsumen.',
    materiPenjelasan: [
      'Uji penepungan 10x cubit dan penggorengan 1 batch ayam.',
      'Pengecekan core temperature daging matang ≥ 74°C.',
      'Simulasi transaksi POS kasir dan handling upselling.',
    ],
    poinKritisSOP: [
      'Skor minimal kelulusan Gate 3 adalah 80.0 poin.',
      'Zero defect pada kematangan daging ayam.',
    ],
    kriteriaLulusTrainer: 'Kru dinyatakan lulus penguasaan resep inti dan siap menghadapi simulasi jam sibuk.',
    verifiedByDefault: false,
  },

  // MINGGU 4: RUSH HOUR, HANDLING KOMPLAIN & UJIAN KELULUSAN
  {
    dayNumber: 23,
    week: 4,
    title: 'Simulasi Jam Sibuk Rush Hour & Target SOS ≤ 3 Menit',
    category: 'Rush Hour & Komplain',
    description: 'Ketahanan bekerja di bawah tekanan saat pesanan dine-in, takeaway, dan ojek online datang bersamaan.',
    materiPenjelasan: [
      'Speed of Service (SOS): Waktu tunggu penyajian pesanan maksimal 3 menit sejak struk tercetak.',
      'Staging Sambal: Menyiapkan cabai giling setengah jadi saat 15 menit menjelang jam sibuk makan siang (11.30).',
      'Komunikasi Kitchen-Geprek-Kasir: Koordinasi singkat dan tenang tanpa saling berteriak di depan tamu.',
      'Penyusunan Paket Lunch Box: Kemasan dilipat rapi, sendok dan tisu terisi lengkap sebelum kantong diserahkan.',
    ],
    poinKritisSOP: [
      'Tetap menjaga higienitas dan keramahan senyum meskipun pesanan sedang membludak.',
      'Pengecekan kelengkapan struk sebelum pesanan diserahkan ke driver delivery.',
    ],
    kriteriaLulusTrainer: 'Kru mampu menyelesaikan pesanan jam sibuk dalam target SOS tanpa kepanikan.',
    verifiedByDefault: false,
  },
  {
    dayNumber: 26,
    week: 4,
    title: 'Service Recovery & Penanganan Komplain Konsumen',
    category: 'Rush Hour & Komplain',
    description: 'Standar emas penanganan keluhan tamu: Dengarkan, mohon maaf tulus, ganti produk segera (Zero Defect), dan pemulihan loyalitas.',
    materiPenjelasan: [
      'Langkah 1 (Listen): Dengarkan keluhan tamu dengan tenang tanpa menyela atau berdalih membela diri.',
      'Langkah 2 (Apologize): Ucapkan permohonan maaf tulus atas ketidaknyamanan yang dialami tamu.',
      'Langkah 3 (Action): Ganti produk yang dikomplain seketika tanpa menunda (Zero Defect Policy).',
      'Langkah 4 (Appreciate): Berikan compliment minuman/es teh manis dan catat keluhan di Logbook Komplain Gerai.',
    ],
    poinKritisSOP: [
      'Dilarang berdebat dengan pelanggan di stasiun kasir.',
      'Eskalasi komplain kritis ke Kepala Outlet dalam ≤ 5 menit.',
    ],
    kriteriaLulusTrainer: 'Kru mempraktikkan service recovery dengan empati tinggi dan solusi tepat.',
    verifiedByDefault: false,
  },
  {
    dayNumber: 30,
    week: 4,
    title: 'UJIAN KELULUSAN GERBANG HARI KE-30 (FINAL GATE EXAM)',
    category: 'Ujian Kelulusan',
    description: 'Ujian komprehensif penentu kelayakan sertifikasi kemandirian: Teori SOP (25%), Praktik Stopwatch (35%), Lisan HARA (20%), dan Speed Rush Hour (20%).',
    materiPenjelasan: [
      'Uji Teori SOP 20 Soal Pilihan Ganda (Passing Grade ≥ 80).',
      'Uji Praktik Stopwatch: Penepungan, Penggorengan, Suhu Core Temp, dan Pembuatan Sambal.',
      'Uji Lisan: 4 Nilai Budaya H.A.R.A dan Penanganan Komplain Konsumen.',
      'Penetapan Status: Lulus Mandiri Solo Shift / Perpanjangan Pendampingan OJT 7 Hari.',
    ],
    poinKritisSOP: [
      'Skor gabungan minimal 80.0 poin untuk dinyatakan "Kompeten Mandiri Solo Shift".',
      'Skor di bawah 75.0 otomatis berstatus Remedial & dilarang bertugas solo shift.',
    ],
    kriteriaLulusTrainer: 'Penerbitan Rapor Kru Resmi dan Sertifikat Kompetensi Kerja HARA.',
    verifiedByDefault: false,
  },
];

interface ProgramOJT30HariViewProps {
  selectedOutletCode?: string;
  onBack?: () => void;
}

export const ProgramOJT30HariView: React.FC<ProgramOJT30HariViewProps> = ({
  selectedOutletCode = 'HC-BTL01',
  onBack,
}) => {
  const allKru = db.getTable<Kru>('kru');
  const outlets = db.getTable<Outlet>('outlets');

  const [currentCrewName, setCurrentCrewName] = useState<string>(
    allKru[0]?.nama_kru || 'Budi Santoso'
  );
  const [selectedWeek, setSelectedWeek] = useState<number | 'ALL'>('ALL');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // Trainee verification progress state (stored locally in state or synced)
  const [verifiedMilestones, setVerifiedMilestones] = useState<Record<string, boolean>>({
    [`${currentCrewName}-1`]: true,
    [`${currentCrewName}-2`]: true,
    [`${currentCrewName}-3`]: true,
    [`${currentCrewName}-4`]: true,
    [`${currentCrewName}-5`]: true,
    [`${currentCrewName}-7`]: true,
    [`${currentCrewName}-8`]: true,
    [`${currentCrewName}-10`]: true,
    [`${currentCrewName}-12`]: true,
    [`${currentCrewName}-14`]: true,
  });

  const targetKru = useMemo(() => {
    return allKru.find((k) => k.nama_kru === currentCrewName) || allKru[0];
  }, [allKru, currentCrewName]);

  const targetOutlet = useMemo(() => {
    return outlets.find((o) => o.kode_outlet === targetKru?.kode_outlet) || outlets[0];
  }, [outlets, targetKru]);

  // Filtered milestones
  const filteredMilestones = useMemo(() => {
    if (selectedWeek === 'ALL') return PROGRAM_30_HARI_CURRICULUM;
    return PROGRAM_30_HARI_CURRICULUM.filter((m) => m.week === selectedWeek);
  }, [selectedWeek]);

  // Calculated Progress
  const totalCount = PROGRAM_30_HARI_CURRICULUM.length;
  const verifiedCount = PROGRAM_30_HARI_CURRICULUM.filter(
    (m) => verifiedMilestones[`${currentCrewName}-${m.dayNumber}`]
  ).length;
  const progressPercent = Math.round((verifiedCount / totalCount) * 100);

  const toggleVerification = (dayNumber: number) => {
    const key = `${currentCrewName}-${dayNumber}`;
    setVerifiedMilestones((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 animate-in fade-in">
      {/* ========================================================================= */}
      {/* TOP HEADER CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
            >
              <ArrowLeft size={16} />
              <span>Kembali</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                PROGRAM ONBOARDING RESMI 30 HARI
              </span>
              <span className="text-xs text-stone-400 font-medium">Kurikulum Fondasi QSR HARA</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              Program & Silabus OJT 30 Hari Pertama Kru
            </h1>
            <p className="text-xs text-stone-500">
              Panduan terstruktur dari pengenalan Visi Misi, 4 Nilai Budaya H.A.R.A, sanitasi 5S, resep inti hingga Gate Exam hari ke-30.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-[#8B1418] hover:bg-[#720e12] text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-red-900/15"
          >
            <Printer size={15} />
            <span>Cetak Silabus OJT (A4)</span>
          </button>
        </div>
      </div>

      {/* Trainee Selection & Progress Highlight Card */}
      <div className="bg-gradient-to-r from-[#7a0f12] via-[#8B1418] to-[#590a0c] text-white rounded-3xl p-6 sm:p-7 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-black/25 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-red-200">
              <UserCheck size={13} />
              DATA TRAINEE OJT TERPILIH
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {targetKru.nama_kru}
              </h2>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-bold">
                Stasiun: {targetKru.divisi}
              </span>
            </div>
            <p className="text-xs text-red-100 max-w-xl font-medium">
              Cabang: <strong>{targetOutlet?.nama_outlet}</strong> ({targetKru.kode_outlet}) • Tanggal Mulai OJT: <strong>{targetKru.tanggal_masuk || '2025-11-01'}</strong>
            </p>
          </div>

          {/* Quick Kru Switcher & Progress Radial */}
          <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center gap-5 shrink-0">
            <div>
              <div className="text-[10px] uppercase font-bold text-red-200 mb-1">GANTI KRU OJT:</div>
              <select
                value={currentCrewName}
                onChange={(e) => setCurrentCrewName(e.target.value)}
                className="bg-white text-stone-900 px-3 py-1.5 rounded-xl text-xs font-bold focus:outline-hidden"
              >
                {allKru.map((k) => (
                  <option key={k.id} value={k.nama_kru}>
                    {k.nama_kru} ({k.divisi} - {k.kode_outlet})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center pl-4 border-l border-white/15">
              <div className="text-3xl font-black text-white">{progressPercent}%</div>
              <div className="text-[10px] font-bold text-red-200">
                {verifiedCount} / {totalCount} Materi Lolos
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Strip */}
        <div className="mt-6 pt-5 border-t border-white/15">
          <div className="flex justify-between text-xs font-bold text-red-200 mb-1.5">
            <span>Progres Kemandirian 30 Hari:</span>
            <span>{progressPercent >= 100 ? 'Siap Gate Exam Hari ke-30' : 'Masa OJT Sedang Berjalan'}</span>
          </div>
          <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Week Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setSelectedWeek('ALL')}
          className={`px-4 py-2.5 rounded-2xl font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedWeek === 'ALL'
              ? 'bg-[#8B1418] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
          Semua Materi (Hari 1–30)
        </button>
        {[
          { w: 1, label: 'Minggu 1: Fondasi Budaya & K3 (Hari 1–7)' },
          { w: 2, label: 'Minggu 2: Helper, Sanitasi & FIFO (Hari 8–14)' },
          { w: 3, label: 'Minggu 3: Resep Inti, Fryer & Kasir (Hari 15–21)' },
          { w: 4, label: 'Minggu 4: Rush Hour & Gate Exam (Hari 22–30)' },
        ].map((tab) => (
          <button
            key={tab.w}
            type="button"
            onClick={() => setSelectedWeek(tab.w as any)}
            className={`px-4 py-2.5 rounded-2xl font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedWeek === tab.w
                ? 'bg-[#8B1418] text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Milestone List */}
      <div className="space-y-4">
        {filteredMilestones.map((m) => {
          const isVerified = Boolean(verifiedMilestones[`${currentCrewName}-${m.dayNumber}`]);
          const isExpanded = expandedDay === m.dayNumber;

          return (
            <div
              key={m.dayNumber}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                isVerified ? 'border-emerald-200 shadow-2xs' : 'border-stone-200 shadow-2xs'
              }`}
            >
              {/* Card Summary Header */}
              <div
                className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none ${
                  isVerified ? 'bg-emerald-50/40' : 'bg-white'
                }`}
                onClick={() => setExpandedDay(isExpanded ? null : m.dayNumber)}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    m.category === 'Ujian Kelulusan'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : isVerified
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 text-stone-700'
                  }`}>
                    H-{m.dayNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded ${
                        m.category === 'Ujian Kelulusan' ? 'bg-amber-100 text-amber-800' :
                        m.category === 'Visi & Budaya' ? 'bg-red-100 text-red-800' :
                        m.category === 'Resep & Cooking' ? 'bg-orange-100 text-orange-800' :
                        'bg-stone-100 text-stone-700'
                      }`}>
                        {m.category} • Minggu {m.week}
                      </span>
                      {isVerified && (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          Terverifikasi Lolos
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-stone-900 mt-0.5">
                      {m.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVerification(m.dayNumber);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isVerified
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {isVerified ? <Check size={14} /> : <CheckSquare size={14} />}
                    <span>{isVerified ? 'Tervalidasi' : 'Validasi Trainer'}</span>
                  </button>
                  <ChevronRight size={18} className={`text-stone-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="p-5 pt-2 border-t border-stone-200/80 bg-stone-50/50 space-y-4 text-xs">
                  <p className="text-stone-600 leading-relaxed font-medium">
                    {m.description}
                  </p>

                  {/* Materi Penjelasan Mendalam */}
                  <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
                    <strong className="text-stone-900 block text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={14} className="text-[#8B1418]" />
                      Materi & Penjelasan Kunci untuk Kru:
                    </strong>
                    <ul className="space-y-1.5 text-stone-700 list-disc list-inside">
                      {m.materiPenjelasan.map((mat, idx) => (
                        <li key={idx} className="leading-relaxed">{mat}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Poin Kritis SOP & Kriteria Lulus */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="bg-red-50/50 p-3.5 rounded-xl border border-red-200/80">
                      <strong className="text-red-900 block text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <AlertTriangle size={13} className="text-red-600" />
                        Poin Kritis SOP (Wajib Patuh):
                      </strong>
                      <ul className="space-y-1 text-red-900 text-[11px] list-disc list-inside">
                        {m.poinKritisSOP.map((pk, idx) => (
                          <li key={idx} className="leading-relaxed">{pk}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80">
                      <strong className="text-emerald-900 block text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        Kriteria Verifikasi Kelulusan Trainer:
                      </strong>
                      <p className="text-emerald-900 text-[11px] font-semibold leading-relaxed">
                        {m.kriteriaLulusTrainer}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
