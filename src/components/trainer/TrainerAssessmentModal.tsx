import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Check, Calculator, Brain, Wrench, Award,
  Flame, BarChart2, Star, Sparkles, AlertTriangle,
  Sliders, Plus, CheckCircle2, Shield, Clock, ThumbsUp,
  Tag, Info, HelpCircle, FileText, ChevronRight, CheckSquare,
  Search, ShieldAlert, Zap, ShieldCheck
} from 'lucide-react';
import { TraineeRecord, BankSOP, StatusOJT, Division } from '../../types';
import { db } from '../../lib/storage';

// =========================================================================
// DEFINISI RUBRIK OBJEKTIF & INDIKATOR BEHAVIORAL ANCHOR
// =========================================================================

export interface RubrikIndikatorTeori {
  id: string;
  label: string;
  deskripsi: string;
  bobotMax: number;
  levelRubrik: {
    skor: number;
    level: string;
    deskripsiPerilaku: string;
  }[];
  tagBuktiAlasan: string[];
}

export const RUBRIK_TEORI_DETAIL: RubrikIndikatorTeori[] = [
  {
    id: 't-1',
    label: 'Ketepatan Parameter Suhu & Gramasi Baku',
    deskripsi: 'Verifikasi suhu deep fryer (170°C ±5°C), gramasi bumbu marinasi/dusting, dan takaran porsi resmi.',
    bobotMax: 20,
    levelRubrik: [
      { skor: 20, level: 'Level 4: 100% Presisi Parameter Baku', deskripsiPerilaku: 'Tepat dan presisi menyebutkan/menakar parameter suhu & gramasi serta mengetahui batas toleransi deviasi mutu.' },
      { skor: 15, level: 'Level 3: Sesuai Toleransi Baku (Deviasi < 5%)', deskripsiPerilaku: 'Mengetahui seluruh parameter baku suhu & takaran gramasi SOP dalam batas toleransi yang diizinkan.' },
      { skor: 10, level: 'Level 2: Deviasi Parameter / Melebihi Toleransi', deskripsiPerilaku: 'Terjadi deviasi takaran gramasi atau suhu melebihi toleransi dan membutuhkan pengingat trainer.' },
      { skor: 0, level: 'Level 1: Deviasi Kritis / Parameter Menyimpang Fatal', deskripsiPerilaku: 'Menyimpang dari suhu standar atau salah fatal dalam takaran bumbu dasar yang merusak mutu produk.' },
    ],
    tagBuktiAlasan: [
      'Verifikasi suhu deep fryer 170°C presisi (toleransi ±5°C)',
      'Penimbangan gramasi bumbu marinasi & tepung presisi per 1 kg',
      'Volume minyak terkalibrasi tepat pada garis batas tangki',
      'Ditemukan deviasi toleransi gramasi bumbu sambal/geprek',
      'Penyetelan suhu kompor terlalu rendah mengakibatkan produk berminyak',
      'Salah menetapkan suhu awal penggorengan standar',
    ],
  },
  {
    id: 't-2',
    label: 'Urutan Tahapan Prosedur Kerja SOP (Runtut)',
    deskripsi: 'Verifikasi eksekusi langkah kerja runtut dari persiapan stasiun, proses eksekusi, hingga penirisan/plating.',
    bobotMax: 20,
    levelRubrik: [
      { skor: 20, level: 'Level 4: Langkah 1 s/d N Runtut 100% Sempurna', deskripsiPerilaku: 'Mengeksekusi tahapan kerja secara runtut, presisi, tanpa ada langkah yang terlewat atau tertukar.' },
      { skor: 15, level: 'Level 3: Alur Runtut (1 Pengingat Non-Kritis)', deskripsiPerilaku: 'Menjalankan urutan kerja secara sistematis dengan panduan alur baku operasional.' },
      { skor: 10, level: 'Level 2: Urutan Langkah Terbalik / Terlewat 1 Tahap', deskripsiPerilaku: 'Terbalik urutan tahapan antara persiapan dan eksekusi atau terlewat 1 langkah minor.' },
      { skor: 0, level: 'Level 1: Melompati Tahapan Kunci / Prosedur Acak', deskripsiPerilaku: 'Melompati tahapan keselamatan/persiapan penting dan bekerja tidak sesuai urutan SOP.' },
    ],
    tagBuktiAlasan: [
      'Eksekusi runtut: persiapan bahan, penepungan 2x, hingga penirisan minyak',
      'Eksekusi runtut: greeting 5S, input item POS, hingga serah terima struk kasir',
      'Terlewat langkah penirisan minyak 10 detik sebelum masuk warmer',
      'Melompati checklist sanitasi persiapan awal shift',
      'Bekerja acak tanpa mengikuti urutan langkah SOP baku',
    ],
  },
  {
    id: 't-3',
    label: 'Batas Simpan Warmer & Rotasi FIFO / FEFO',
    deskripsi: 'Kepatuhan batas simpan produk matang warmer (maks 2 jam) dan perputaran bahan baku First-In-First-Out.',
    bobotMax: 20,
    levelRubrik: [
      { skor: 20, level: 'Level 4: Holding Time & Labeling Jam 100% Tertib', deskripsiPerilaku: 'Disiplin mencatat jam masuk warmer, rotasi timer aktif, dan rotasi stiker FIFO tepat waktu.' },
      { skor: 15, level: 'Level 3: Standar Holding Time & FIFO Dijalankan', deskripsiPerilaku: 'Menjalankan batas waktu simpan produk warmer (maks 2 jam) dan prinsip barang lama keluar duluan.' },
      { skor: 10, level: 'Level 2: Keterlambatan Rotasi / Labeling Terlewat', deskripsiPerilaku: 'Mengetahui aturan holding time tetapi pasif dalam memeriksa timer atau stiker jam warmer.' },
      { skor: 0, level: 'Level 1: Mengabaikan Waktu Simpan / Risiko Produk Rusak', deskripsiPerilaku: 'Mengabaikan batas simpan warmer dan berisiko menyajikan produk lewat waktu ke konsumen.' },
    ],
    tagBuktiAlasan: [
      'Disiplin batas simpan ayam warmer maksimal 2 jam terverifikasi',
      'Rotasi bahan baku FIFO dijalankan sesuai tanggal kedatangan',
      'Pemisahan dan afkir produk yang melampaui batas holding time tertib',
      'Terlewat memperbarui stiker jam pada loyang warmer',
      'Mencampur batch ayam baru dengan batch ayam lama di loyang yang sama',
      'Tidak menerapkan rotasi FIFO bahan baku dari chiller',
    ],
  },
  {
    id: 't-4',
    label: 'Food Safety, Sanitasi & APD Lengkap',
    deskripsi: 'Standar kebersihan diri, cuci tangan 6 langkah, pemakaian seragam/apron/topi, serta pemisahan lap warna.',
    bobotMax: 20,
    levelRubrik: [
      { skor: 20, level: 'Level 4: Protokol Higienis & APD 100% Teladan', deskripsiPerilaku: 'Menerapkan protokol food safety ketat, zero kontaminasi silang, dan APD bersih rapi sempurna.' },
      { skor: 15, level: 'Level 3: Taat Standar Kebersihan & APD Lengkap', deskripsiPerilaku: 'Mengenakan APD lengkap, mencuci tangan berkala, dan menjaga kebersihan area stasiun.' },
      { skor: 10, level: 'Level 2: APD Tidak Lengkap / Lap Kerja Tertukar', deskripsiPerilaku: 'Terkadang melepas apron/topi atau tertukar menggunakan lap meja ke area peralatan masak.' },
      { skor: 0, level: 'Level 1: Pelanggaran Kritis Keamanan Pangan', deskripsiPerilaku: 'Kuku kotor, kontak langsung tangan ke produk matang, atau menaruh bahan di lantai tanpa palet.' },
    ],
    tagBuktiAlasan: [
      'Cuci tangan 6 langkah teratur sebelum kontak dengan makanan',
      'APD lengkap terverifikasi: Topi, Apron, Sepatu Tertutup & Kuku Bersih',
      'Pemisahan lap bersih dapur dan lap meja makan dijalankan tepat',
      'Terlewat mengenakan sarung tangan plastik saat meracik produk matang',
      'Perlu diingatkan sanitasi berkala pada talenan dan pisau kerja',
      'Menaruh wadah bahan langsung di lantai tanpa alas palet',
    ],
  },
  {
    id: 't-5',
    label: 'Mitigasi & Respon Cepat Kendala Lapangan',
    deskripsi: 'Ketepatan prosedur tindakan saat kompor mati mendadak, minyak berbusa, atau penanganan komplain pesanan.',
    bobotMax: 20,
    levelRubrik: [
      { skor: 20, level: 'Level 4: Tindakan Cepat & Tepat Sesuai Prosedur', deskripsiPerilaku: 'Mengeksekusi tindakan mitigasi aman saat kendala operasional terjadi secara sigap dan tenang.' },
      { skor: 15, level: 'Level 3: Prosedur Eskalasi Sesuai Alur', deskripsiPerilaku: 'Menjalankan langkah dasar penanganan masalah dan sigap melapor ke Leader / Penanggung Jawab Outlet.' },
      { skor: 10, level: 'Level 2: Respon Lambat / Ragu Mengambil Tindakan', deskripsiPerilaku: 'Mengetahui ada kendala namun pasif menunggu instruksi rekan lain.' },
      { skor: 0, level: 'Level 1: Tindakan Berbahaya / Menyalahi Prosedur', deskripsiPerilaku: 'Mengambil tindakan berbahaya (menyiram air ke kompor minyak) atau mengabaikan komplain.' },
    ],
    tagBuktiAlasan: [
      'Sigap menutup regulator dan ventilasi saat kompor padam mendadak',
      'Prosedur penggantian minyak berbusa/hitam dieksekusi sesuai standar',
      'Teknik handling komplain L.A.S.T (Listen, Apologize, Solve, Thank) tepat',
      'Lambat merespon saat printer POS mati / koneksi terputus',
      'Gugup saat stok display habis di tengah jam sibuk',
      'Terlewat melapor kendala operasional ke supervisor cabang',
    ],
  },
];

// 4 Pilar Budaya H.A.R.A dengan 12 Perilaku Utama Resmi
export interface AspekHaraDetail {
  key: string;
  nama: string;
  tagline: string;
  deskripsi: string;
  perilakuUtama: string[];
  levelKriteria: { bintang: number; label: string; bukti: string }[];
  tagBuktiAlasan: string[];
}

export type AspekRespectDetail = AspekHaraDetail;

export const ASPEK_ATTITUDE_HARA_DETAIL: AspekHaraDetail[] = [
  {
    key: 'H',
    nama: 'Halal (Bekerja Halal)',
    tagline: 'Bekerja dengan hati yang tulus dan metode yang tepat',
    deskripsi: 'Setiap produk, proses, dan keputusan pasti membawa berkah. Mengutamakan bahan baku halal, kebersihan dapur & keberlanjutan.',
    perilakuUtama: [
      '1. Mengutamakan bahan baku halal dan berkualitas.',
      '2. Menjaga kebersihan dapur, peralatan, dan area pelayanan.',
      '3. Menjalankan bisnis dengan integritas & berorientasi pada keberlanjutan.',
    ],
    levelKriteria: [
      { bintang: 5, label: 'Sangat Disiplin & Teladan Halal-Higienis', bukti: 'Bahan baku 100% halal terverifikasi, kebersihan dapur & peralatan steril tanpa noda, serta zero cross-contamination.' },
      { bintang: 4, label: 'Disiplin Standar Mutu Halal', bukti: 'Menjaga kebersihan area stasiun secara teratur dan patuh pada SOP sanitasi HARA.' },
      { bintang: 3, label: 'Cukup Terjaga (Perlu Pengingat Kecil)', bukti: 'Mengikuti aturan standar kebersihan namun sesekali perlu diingatkan saat pergantian shift.' },
      { bintang: 2, label: 'Kurang Peduli Kebersihan Alat', bukti: 'Peralatan sering dibiarkan kotor setelah digunakan atau mengabaikan penutup bahan baku.' },
      { bintang: 1, label: 'Pelanggaran Kritis Sanitasi Pangan', bukti: 'Mengabaikan kebersihan yang berisiko merusak kualitas produk atau mencemari makanan.' },
    ],
    tagBuktiAlasan: [
      'Mengutamakan bahan baku halal dan berkualitas tinggi',
      'Menjaga kebersihan dapur, peralatan, dan area pelayanan',
      'Menjalankan bisnis dengan integritas & berorientasi pada keberlanjutan',
      'Menerapkan sanitasi cuci tangan 20 detik & APD lengkap',
      'Disiplin membuang sampah stasiun kerja tanpa menumpuk',
    ],
  },
  {
    key: 'A1',
    nama: 'Amanah (Bertindak Amanah)',
    tagline: 'Kepercayaan adalah aset utama kami',
    deskripsi: 'Apa pun yang kami pegang, kami jaga dengan penuh tanggung jawab dan integritas. Menepati janji, jujur dalam timbangan & kas.',
    perilakuUtama: [
      '4. Menepati janji dan komitmen perusahaan.',
      '5. Bekerja dengan penuh tanggung jawab dan kejujuran.',
      '6. Menjaga reputasi dan nama baik HARA Chicken di setiap tindakan.',
    ],
    levelKriteria: [
      { bintang: 5, label: 'Sangat Amanah & Berintegritas Tinggi', bukti: 'Pencatatan kasir selisih Rp 0, takaran gramasi bumbu & ayam 100% presisi, menjaga rahasia resep.' },
      { bintang: 4, label: 'Amanah & Bertanggung Jawab', bukti: 'Menjalankan tugas dengan jujur tanpa ada catatan deviasi integritas selama masa bimbingan.' },
      { bintang: 3, label: 'Cukup Amanah (Pengawasan Rutin)', bukti: 'Menjalankan tugas sesuai SOP namun masih butuh pengawasan pada akurasi timbang bahan.' },
      { bintang: 2, label: 'Pernah Terindikasi Deviasi Takaran', bukti: 'Pernah mengurangi porsi atau tidak teliti dalam pencatatan stok dan uang kembalian.' },
      { bintang: 1, label: 'Pelanggaran Integritas Berat', bukti: 'Terbukti melakukan kecurangan selisih kas / bahan baku yang merugikan operasional.' },
    ],
    tagBuktiAlasan: [
      'Menepati janji dan komitmen perusahaan serta SOP',
      'Bekerja dengan penuh tanggung jawab dan kejujuran kasir/timbangan',
      'Menjaga reputasi dan nama baik HARA Chicken di setiap tindakan',
      'Closing kasir POS selalu klop selisih Rp 0',
      'Akurasi gramatur sambal uleg 30 gram konsisten',
    ],
  },
  {
    key: 'R',
    nama: 'Responsif (Bergerak Responsif)',
    tagline: 'Kami responsif, tangkas, dan peduli',
    deskripsi: 'Merespons kebutuhan pelanggan dan tantangan bisnis dengan tindakan cepat dan solusi nyata. Senyum 5S, SOS <90 detik, tanggap rush hour.',
    perilakuUtama: [
      '7. Memberi pelayanan cepat, sopan, dan solutif.',
      '8. Aktif menanggapi masukan pelanggan.',
      '9. Berorientasi pada hasil dan kepuasan pelanggan.',
    ],
    levelKriteria: [
      { bintang: 5, label: 'Sangat Cekatan & Customer Champion', bukti: 'Pelayanan cepat SOS <90 detik, senyum salam sapa ramah, sigap membantu pelanggan dan rekan saat jam sibuk.' },
      { bintang: 4, label: 'Cepat & Ramah Melayani', bukti: 'Tanggap terhadap antrean pelanggan dan aktif membantu menyelesaikan pesanan.' },
      { bintang: 3, label: 'Standar Memadai', bukti: 'Melayani sesuai alur namun kecepatan melambat saat antrean panjang melebihi 5 transaksi.' },
      { bintang: 2, label: 'Lambat / Kurang Ramah', bukti: 'Ekspresi wajah datar, kurang responsif saat dipanggil tamu atau dipanggil rekan tim.' },
      { bintang: 1, label: 'Pasif & Mengabaikan Tamu', bukti: 'Mengabaikan pelanggan yang menunggu atau mengeluh di depan umum saat jam sibuk.' },
    ],
    tagBuktiAlasan: [
      'Memberi pelayanan cepat, sopan, dan solutif (SOS < 90 detik)',
      'Aktif menanggapi masukan dan kebutuhan pelanggan dengan sigap',
      'Berorientasi teguh pada hasil terbaik dan kepuasan pelanggan',
      'Penerapan 5S (Senyum, Salam, Sapa, Sopan, Santun) konsisten',
      'Inisiatif clearing meja cepat (< 2 menit table turnover)',
    ],
  },
  {
    key: 'A2',
    nama: 'Adaptif (Berkembang Adaptif)',
    tagline: 'Kami terus belajar dan berani berubah',
    deskripsi: 'Dunia bergerak cepat — dan kami tumbuh seiring setiap perubahan. Terbuka terhadap ide baru, perbaikan berkelanjutan, dan teknologi.',
    perilakuUtama: [
      '10. Terbuka terhadap ide baru & perbaikan berkelanjutan.',
      '11. Menggunakan teknologi & sistem terpadu untuk efisiensi outlet.',
      '12. Siap berubah demi pertumbuhan perusahaan & kesejahteraan bersama.',
    ],
    levelKriteria: [
      { bintang: 5, label: 'Sangat Cepat Belajar & Solutif', bukti: 'Cepat menguasai revisi SOP baru, mahir menggunakan aplikasi tablet/POS, terbuka menerima masukan coaching GROW.' },
      { bintang: 4, label: 'Adaptif & Kooperatif', bukti: 'Menerima masukan dari trainer dengan baik dan mempraktikkan koreksi di shift berikutnya.' },
      { bintang: 3, label: 'Cukup Adaptif (Perlu Pembiasaan)', bukti: 'Butuh waktu beberapa hari untuk menyesuaikan diri dengan tata cara atau alat baru.' },
      { bintang: 2, label: 'Resisten Terhadap Perubahan', bukti: 'Sering membantah atau enggan menggunakan sistem/SOP baru yang telah ditetapkan.' },
      { bintang: 1, label: 'Menolak Belajar / Tidak Kooperatif', bukti: 'Menolak arahan perbaikan dan bersikap apatis terhadap pembaruan sistem kerja.' },
    ],
    tagBuktiAlasan: [
      'Terbuka terhadap ide baru & perbaikan berkelanjutan (continuous improvement)',
      'Menggunakan teknologi dan sistem terpadu untuk efisiensi outlet',
      'Siap berubah demi pertumbuhan perusahaan & kesejahteraan bersama',
      'Tanggap menerima sesi coaching 1-on-1 metode GROW',
      'Inisiatif usul perbaikan alur stasiun kerja saat briefing',
    ],
  },
];

export const ASPEK_ATTITUDE_RESPECT_DETAIL = ASPEK_ATTITUDE_HARA_DETAIL;

// 3 Indikator Ketahanan Jam Sibuk
export const KRITERIA_KETAHANAN_DETAIL = [
  {
    id: 'k-1',
    label: 'Ketahanan Peak Hour / Rush Hours',
    deskripsi: 'Kecepatan dan ketepatan eksekusi saat pesanan menumpuk di jam makan siang/malam (30+ porsi).',
    levelRubrik: [
      { skor: 3, label: 'Level 3: Tangguh & Sangat Cepat', bukti: 'Mampu menangani pesanan beruntun tanpa penurunan kualitas gramasi dan rasa.' },
      { skor: 2, label: 'Level 2: Cukup Terkendali', bukti: 'Pesanan terselesaikan dengan baik meskipun kecepatan melambat 15-20% saat antrean panjang.' },
      { skor: 1, label: 'Level 1: Panik / Kewalahan', bukti: 'Mudah gugup, salah memasukkan orderan, atau stasiun kerja menjadi sangat berantakan.' },
    ],
    tagBuktiAlasan: [
      'Mampu menyelesaikan antrean 30+ porsi tepat waktu (< 3 menit per porsi)',
      'Stasiun kerja tetap teratur dan bersih meski pesanan padat',
      'Kecepatan mulai melambat saat antrean pesanan melebihi 10 nota',
      'Panik dan salah mengambil jenis potongan ayam saat jam sibuk',
      'Stasiun kerja menjadi sangat berantakan saat pesanan menumpuk',
    ],
  },
  {
    id: 'k-2',
    label: 'Manajemen Emosi & Komposur Diri',
    deskripsi: 'Tetap tenang, tidak panik, sabar dan ramah saat menghadapi antrean panjang atau komplain pelanggan.',
    levelRubrik: [
      { skor: 3, label: 'Level 3: Sangat Tenang & Dewasa', bukti: 'Tetap tersenyum, nada bicara santun, dan mampu menenangkan pelanggan yang menunggu lama.' },
      { skor: 2, label: 'Level 2: Cukup Tenang', bukti: 'Mampu menahan emosi meskipun terlihat agak tegang saat terjadi lonjakan pesanan.' },
      { skor: 1, label: 'Level 1: Emosional / Mengeluh', bukti: 'Menunjukkan gestur kesal, mengeluh di depan pelanggan, atau berbicara ketus ke rekan.' },
    ],
    tagBuktiAlasan: [
      'Tetap tersenyum ramah meski pelanggan mengantre panjang',
      'Mampu meredakan keluhan pembeli dengan santun dan cepat',
      'Terlihat agak tegang namun tetap dapat menyelesaikan tugas dengan baik',
      'Kerap mengeluh kelelahan di depan area kasir/pembeli',
      'Mudah terpancing emosi saat rekan kerja melakukan kesalahan',
    ],
  },
  {
    id: 'k-3',
    label: 'Stamina & Konsistensi Shift Penuh',
    deskripsi: 'Kualitas rasa, higienitas dan disiplin kerja stabil dari awal shift hingga closing/operasional selesai.',
    levelRubrik: [
      { skor: 3, label: 'Level 3: Konsisten Hingga Closing', bukti: 'Standar higienitas dan kebersihan saat proses closing sama baiknya dengan opening.' },
      { skor: 2, label: 'Level 2: Cukup Stabil', bukti: 'Bekerja baik sepanjang shift, proses closing selesai sesuai standar dengan supervisi ringan.' },
      { skor: 1, label: 'Level 1: Menurun Drastis di Akhir Shift', bukti: 'Proses closing asal-asalan, malas membersihkan alat, atau meninggalkan stasiun kotor.' },
    ],
    tagBuktiAlasan: [
      'Stamina prima dari awal shift hingga proses closing tuntas',
      'Standar kebersihan saat closing deep fryer/stasiun sangat higienis',
      'Closing stasiun tepat waktu sesuai jadwal operasional',
      'Mulai kehilangan fokus saat 2 jam terakhir shift kerja',
      'Closing stasiun kurang bersih pada bagian sudut minyak dan warmer',
    ],
  },
];

// Kategori Akar Masalah Diagnostik
export const OPSI_AKAR_MASALAH = [
  'Sudah Sangat Konsisten, Mandiri & Mahir Eksekusi',
  'Pemahaman Teori / Parameter Resep Belum Matang',
  'Jam Terbang / Kecepatan Eksekusi Butuh Repetisi Tambahan',
  'Kedisiplinan & Kepatuhan Prosedur SOP Terpotong (Shortcuts)',
  'Manajemen Emosi, Komposur & Mental Jam Sibuk (Rush Hour)',
  'Kendala Teknis Alat / Fasilitas Stasiun Kerja Cabang',
  'Komunikasi Verbal & Adaptasi Kerjasama Tim Belum Lepas',
];

// Indikator Perubahan Perilaku (Behavior Change - Kirkpatrick Level 3 & 4)
export interface BehaviorIndicatorDef {
  id: string;
  label: string;
  deskripsi: string;
  targetMetric: string;
  options: { level: number; label: string; desc: string; skor: number }[];
}

export const BEHAVIOR_CHANGE_INDICATORS: BehaviorIndicatorDef[] = [
  {
    id: 'bc-1',
    label: 'Kepatuhan Nol Potong Kompas (Zero Shortcut Under Pressure)',
    deskripsi: 'Kepatuhan menjalankan seluruh urutan SOP tanpa memotong tahapan keselamatan maupun resep di saat antrean pesanan padat.',
    targetMetric: 'Zero shortcut & Zero komplain mutu',
    options: [
      { level: 4, label: 'Level 4: Konsisten 100% (Teladan)', desc: 'Eksekusi SOP 100% runtut tanpa kompromi saat jam sibuk, menjaga integritas produk prima.', skor: 100 },
      { level: 3, label: 'Level 3: Stabil Mandiri', desc: 'Menjaga alur SOP baku, deviasi kecil langsung disadari dan segera diperbaiki mandiri.', skor: 85 },
      { level: 2, label: 'Level 2: Inkonsisten (Butuh Pengawasan)', desc: 'Cenderung melewatkan 1-2 langkah SOP penirisan/sanitasi ketika pesanan membludak.', skor: 65 },
      { level: 1, label: 'Level 1: Deviasi Kritis / Pola Lama', desc: 'Mengabaikan alur SOP dan memakai kebiasaan lama yang berisiko menurunkan rasa/mutu.', skor: 40 },
    ],
  },
  {
    id: 'bc-2',
    label: 'Presisi Parameter Teknis Lapangan (Suhu, Gramasi & Holding)',
    deskripsi: 'Disiplin mengukur suhu minyak 170°C, holding warmer maksimal 2 jam, dan timbangan formula bumbu presisi.',
    targetMetric: 'Fryer 170°C ±5°C & Timer Warmer Aktif',
    options: [
      { level: 4, label: 'Level 4: Sangat Presisi & Proaktif', desc: 'Rutin memverifikasi suhu termometer dan jam timer warmer secara proaktif tanpa diingatkan.', skor: 100 },
      { level: 3, label: 'Level 3: Patuh Parameter Baku', desc: 'Menyetel suhu dan timer sesuai standar instruksi kerja harian operasional.', skor: 85 },
      { level: 2, label: 'Level 2: Terkadang Lalai Cek Timer', desc: 'Suhu diatur tetapi pasif memeriksa batas simpan holding time jika tidak ditegur.', skor: 65 },
      { level: 1, label: 'Level 1: Mengabaikan Batas Suhu & Waktu', desc: 'Menggoreng tanpa cek suhu atau membiarkan produk lewat masa holding warmer disajikan.', skor: 40 },
    ],
  },
  {
    id: 'bc-3',
    label: 'Kebiasaan 5S, Higienitas & APD Tanpa Pengawasan',
    deskripsi: 'Pembersihan meja kerja "Clean As You Go", pemisahan lap warna dapur/meja, dan pemakaian APD tertib.',
    targetMetric: 'Zero Cross-Contamination & APD Lengkap',
    options: [
      { level: 4, label: 'Level 4: Higienis Teladan Otomatis', desc: 'Stasiun kerja selalu bersih rapi, APD terpasang sempurna, dan memungut sampah tanpa instruksi.', skor: 100 },
      { level: 3, label: 'Level 3: Mandiri & Tertib Bersih', desc: 'Membersihkan stasiun berkala dan menjaga kerapian seragam sepanjang shift.', skor: 85 },
      { level: 2, label: 'Level 2: Menunggu Instruksi', desc: 'Hanya membersihkan stasiun jika ada arahan khusus dari shift leader.', skor: 60 },
      { level: 1, label: 'Level 1: Berantakan & Abai APD', desc: 'Meja kotor, lap tertukar, atau sering melepas topi/apron di area dapur.', skor: 35 },
    ],
  },
  {
    id: 'bc-4',
    label: 'Kecepatan Saji & Efisiensi Alur Kerja (Speed of Service)',
    deskripsi: 'Ketangkasan penyiapan pesanan pelanggan dan keharmonisan koordinasi antar-stasiun tanpa bottleneck.',
    targetMetric: 'Speed of Service < 180 detik per nota',
    options: [
      { level: 4, label: 'Level 4: Sangat Gesit & Ergonomis', desc: 'Ritme kerja lincah teratur, koordinasi mulus, dan waktu tunggu konsumen sangat minim.', skor: 100 },
      { level: 3, label: 'Level 3: Standar Kecepatan Terpenuhi', desc: 'Memenuhi batas waktu penyajian normal tanpa menimbulkan penumpukan nota pesanan.', skor: 85 },
      { level: 2, label: 'Level 2: Gerakan Masih Ragu/Lambat', desc: 'Gerakan masih agak kaku sehingga memperlambat alur serah terima saat peak hour.', skor: 65 },
      { level: 1, label: 'Level 1: Bottleneck Berat', desc: 'Kerap panik dan kewalahan yang menyebabkan antrean pesanan tertahan lama.', skor: 45 },
    ],
  },
  {
    id: 'bc-5',
    label: 'Penularan Budaya Kerja & Bimbingan Rekan (Role Modeling)',
    deskripsi: 'Menjadi teladan etika positif bagi kru baru serta menerapkan 4 nilai budaya H.A.R.A secara nyata.',
    targetMetric: 'Budaya H.A.R.A & Solidaritas Tim',
    options: [
      { level: 4, label: 'Level 4: Role Model / Inspirator', desc: 'Aktif mencontohkan SOP benar dan membimbing rekan kru baru dengan sabar dan antusias.', skor: 100 },
      { level: 3, label: 'Level 3: Suportif & Kooperatif', desc: 'Menerima masukan dengan lapang dada dan mendukung keharmonisan kerja tim.', skor: 85 },
      { level: 2, label: 'Level 2: Fokus Diri Sendiri', desc: 'Hanya menyelesaikan tugas pribadi tanpa peduli kesulitan rekan di stasiun sebelahnya.', skor: 70 },
      { level: 1, label: 'Level 1: Resisten / Membawa Pengaruh Buruk', desc: 'Suka mengeluh berlebihan atau mengajak rekan kru lain mengabaikan prosedur baku.', skor: 40 },
    ],
  },
];

interface TrainerAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainee: TraineeRecord | null;
  target: 'awal' | 'akhir';
  defaultDivisi?: Division;
  bankSop: BankSOP[];
  onSaveAssessment: (result: {
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
    alasanDiagnostik: string[];
    buktiObservasi: string;
    akarMasalah: string;
    alasanKelulusan: string;
    topikScores: { judul: string; skor: number }[];
    isOverridden: boolean;
    overrideReason?: string;
    detailRubrik: any[];
    traineeInfo?: {
      nama_kru?: string;
      jabatan?: string;
      divisi?: Division;
      sop_fokus?: string;
      trainer_nama?: string;
      tanggal_mulai?: string;
      tanggal_selesai?: string;
    };
  }) => void;
}

export const TrainerAssessmentModal: React.FC<TrainerAssessmentModalProps> = ({
  isOpen,
  onClose,
  trainee,
  target,
  defaultDivisi = 'Kitchen',
  bankSop,
  onSaveAssessment,
}) => {
  const [activeTab, setActiveTab] = useState<'faktor' | 'teori' | 'praktik' | 'attitude' | 'ketahanan' | 'behavior' | 'diagnosa' | 'catatan' | 'berita_acara'>('faktor');
  const [selectedSopId, setSelectedSopId] = useState<string>('');
  const [teoriEvalMode, setTeoriEvalMode] = useState<'sop_topics' | 'parameter_kritis'>('sop_topics');

  // Manual Trainee Identity & Jabatan Editing
  const [editNamaKru, setEditNamaKru] = useState<string>('');
  const [editJabatan, setEditJabatan] = useState<string>('Crew Kitchen');
  const [editDivisi, setEditDivisi] = useState<Division>('Kitchen');
  const [editSopFokus, setEditSopFokus] = useState<string>('');
  const [editTrainerNama, setEditTrainerNama] = useState<string>('Haikal Abi');
  const [editTanggalMulai, setEditTanggalMulai] = useState<string>('');
  const [editTanggalSelesai, setEditTanggalSelesai] = useState<string>('');
  const [showIdentityEdit, setShowIdentityEdit] = useState<boolean>(false);

  // Step-by-Step Sequential Audit State: Record<sopId, Record<stepIndex, rating: 2|1|0>>
  // 2 = Sesuai & Runtut (100%), 1 = Ada Deviasi / Tertukar (50%), 0 = Terlewat / Gagal (0%)
  const [sopStepAudit, setSopStepAudit] = useState<Record<string, Record<number, number>>>({});
  const [inspectingSop, setInspectingSop] = useState<BankSOP | null>(null);

  // 1. Teori Bank SOP Topic Scores (0-3 scale per SOP in division)
  const [teoriTopicScores, setTeoriTopicScores] = useState<Record<string, number>>({});

  // Teori Parameter Kritis Scores (5 items: 0, 10, 15, 20)
  const [teoriScores, setTeoriScores] = useState<Record<number, number>>({
    0: 20, 1: 20, 2: 15, 3: 20, 4: 15
  });

  // 2. Praktik Topics Scores (0-3 per SOP)
  const [topicScores, setTopicScores] = useState<Record<string, number>>({});
  const [speedScore, setSpeedScore] = useState<number>(2); // 0-3
  const [hygieneScore, setHygieneScore] = useState<number>(3); // 0-3
  const [wasteControlScore, setWasteControlScore] = useState<number>(3); // 0-3

  // 3. Attitude H.A.R.A: Diambil langsung dari Input Nilai Budaya HARA Objektif 16 SOP (0-100 Poin)
  const [useObjectiveHara, setUseObjectiveHara] = useState<boolean>(true);
  const [objectiveHaraScores, setObjectiveHaraScores] = useState<Record<string, number>>({
    H: 92, A1: 88, R: 85, A2: 90
  });

  // Fallback 1-5 star ratings jika trainer memilih rubrik bintang manual
  const [attitudeScores, setAttitudeScores] = useState<Record<string, number>>({
    H: 5, A1: 5, R: 4, A2: 5
  });

  // Sinkronisasi otomatis nilai HARA objektif saat modal dibuka / kru terpilih
  useEffect(() => {
    if (!isOpen) return;
    const targetName = trainee?.nama_kru || editNamaKru;
    if (targetName) {
      const attRecords = db.getTable<any>('attitude_hara').filter(
        (a) => a.nama_kru && a.nama_kru.toLowerCase() === targetName.toLowerCase()
      );
      if (attRecords.length > 0) {
        const latest = attRecords[0];
        setObjectiveHaraScores({
          H: latest.skor_h_higienis ?? 90,
          A1: latest.skor_a_amanah ?? 85,
          R: latest.skor_a_antusias ?? 88,
          A2: latest.skor_r_resik ?? 90,
        });
        setUseObjectiveHara(true);
      }
    }
  }, [isOpen, trainee, editNamaKru]);

  // 4. Ketahanan & Rush Hour Scores (1-3)
  const [ketahananScores, setKetahananScores] = useState<Record<number, number>>({
    0: 3, 1: 3, 2: 3
  });

  // 5. Behavior Change & Kirkpatrick Indicators (Level 1-4)
  const [behaviorLevels, setBehaviorLevels] = useState<Record<string, number>>({
    'bc-1': 4,
    'bc-2': 4,
    'bc-3': 4,
    'bc-4': 3,
    'bc-5': 4,
  });
  const [kirkpatrickReaksi, setKirkpatrickReaksi] = useState<number>(92);

  // Selected Evidence & Reason Tags
  const [selectedEvidenceTags, setSelectedEvidenceTags] = useState<string[]>([]);
  const [akarMasalah, setAkarMasalah] = useState<string>(OPSI_AKAR_MASALAH[0]);
  const [alasanKelulusan, setAlasanKelulusan] = useState<string>('');
  const [buktiObservasi, setBuktiObservasi] = useState<string>('');

  // Manual Override Toggle & Custom Score
  const [isOverrideActive, setIsOverrideActive] = useState<boolean>(false);
  const [manualOverrideScore, setManualOverrideScore] = useState<number>(85);
  const [overrideReason, setOverrideReason] = useState<string>('');

  // 4-Dimensional Notes
  const [noteStrengths, setNoteStrengths] = useState<string>('');
  const [noteWeaknesses, setNoteWeaknesses] = useState<string>('');
  const [noteActionPlan, setNoteActionPlan] = useState<string>('');
  const [noteSummary, setNoteSummary] = useState<string>('');

  const currentDivisi: Division = trainee?.divisi || defaultDivisi;

  const divisionSops = useMemo(() => {
    return bankSop.filter((s) => s.divisi === currentDivisi);
  }, [bankSop, currentDivisi]);

  // Calculate step compliance score per SOP
  const getSopStepScore = (sop: BankSOP): number => {
    const steps = sop.langkah || [];
    if (steps.length === 0) {
      const topicVal = teoriTopicScores[sop.id] ?? 2;
      return Math.round((topicVal / 3) * 100);
    }
    const audit = sopStepAudit[sop.id] || {};
    let totalPoints = 0;
    steps.forEach((_, idx) => {
      totalPoints += (audit[idx] ?? 2);
    });
    const maxPoints = steps.length * 2;
    return Math.min(100, Math.max(0, Math.round((totalPoints / maxPoints) * 100)));
  };

  const getSopStepAuditStats = (sop: BankSOP) => {
    const steps = sop.langkah || [];
    const audit = sopStepAudit[sop.id] || {};
    let fullPass = 0;
    let deviasi = 0;
    let missed = 0;
    steps.forEach((_, idx) => {
      const rating = audit[idx] ?? 2;
      if (rating === 2) fullPass++;
      else if (rating === 1) deviasi++;
      else missed++;
    });
    return { fullPass, deviasi, missed, total: steps.length };
  };

  // Set single step rating
  const handleSetStepRating = (sopId: string, stepIdx: number, rating: number) => {
    setSopStepAudit((prev) => {
      const current = prev[sopId] || {};
      const updated = { ...current, [stepIdx]: rating };
      return { ...prev, [sopId]: updated };
    });

    // Sync to topic score
    const targetSop = divisionSops.find((s) => s.id === sopId);
    if (targetSop && targetSop.langkah?.length) {
      const audit = { ...(sopStepAudit[sopId] || {}), [stepIdx]: rating };
      let total = 0;
      targetSop.langkah.forEach((_, idx) => {
        total += (audit[idx] ?? 2);
      });
      const ratio = total / (targetSop.langkah.length * 2);
      const convertedTopicScore = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0;
      setTeoriTopicScores((prev) => ({ ...prev, [sopId]: convertedTopicScore }));
      setTopicScores((prev) => ({ ...prev, [sopId]: convertedTopicScore }));
    }
  };

  // Set all steps for an SOP
  const handleSetAllStepsForSop = (sopId: string, rating: number) => {
    const targetSop = divisionSops.find((s) => s.id === sopId);
    if (!targetSop) return;
    const steps = targetSop.langkah || [];
    const updatedAudit: Record<number, number> = {};
    steps.forEach((_, idx) => {
      updatedAudit[idx] = rating;
    });
    setSopStepAudit((prev) => ({ ...prev, [sopId]: updatedAudit }));

    const convertedTopicScore = rating === 2 ? 3 : rating === 1 ? 1 : 0;
    setTeoriTopicScores((prev) => ({ ...prev, [sopId]: convertedTopicScore }));
    setTopicScores((prev) => ({ ...prev, [sopId]: convertedTopicScore }));
  };

  // Init Data when opened
  useEffect(() => {
    if (isOpen) {
      const base = target === 'awal' ? (trainee?.skor_awal || 72) : (trainee?.skor_akhir || 88);
      const isGood = base >= 80;

      // Init Step Audit for each SOP
      const initAudits: Record<string, Record<number, number>> = {};
      const initTeoriTopics: Record<string, number> = {};
      const initTopics: Record<string, number> = {};

      divisionSops.forEach((sop, sopIdx) => {
        const stepMap: Record<number, number> = {};
        (sop.langkah || []).forEach((_, stepIdx) => {
          if (isGood) {
            stepMap[stepIdx] = 2; // All 100% runtut
          } else {
            stepMap[stepIdx] = (sopIdx % 2 === 0 && stepIdx === 1) ? 1 : 2;
          }
        });
        initAudits[sop.id] = stepMap;
        initTeoriTopics[sop.id] = isGood ? (sopIdx % 2 === 0 ? 3 : 2) : (sopIdx % 2 === 0 ? 2 : 1);
        initTopics[sop.id] = isGood ? (sopIdx % 3 === 0 ? 3 : 2) : (sopIdx % 2 === 0 ? 2 : 1);
      });

      setSopStepAudit(initAudits);
      setTeoriTopicScores(initTeoriTopics);
      setTopicScores(initTopics);

      setTeoriScores({
        0: isGood ? 20 : 15,
        1: isGood ? 20 : 15,
        2: isGood ? 20 : 10,
        3: isGood ? 20 : 15,
        4: isGood ? 15 : 10,
      });

      setSpeedScore(isGood ? 3 : 2);
      setHygieneScore(isGood ? 3 : 2);
      setWasteControlScore(isGood ? 3 : 2);

      setAttitudeScores({
        R: isGood ? 5 : 4,
        P: isGood ? 4 : 3,
        E: isGood ? 4 : 3,
        C: isGood ? 5 : 4,
        T: isGood ? 4 : 3,
      });

      setKetahananScores({
        0: isGood ? 3 : 2,
        1: isGood ? 3 : 2,
        2: isGood ? 3 : 2,
      });

      const initTags = trainee?.alasan_diagnostik && trainee.alasan_diagnostik.length > 0
        ? trainee.alasan_diagnostik
        : [
            'Verifikasi suhu deep fryer 170°C presisi (toleransi ±5°C)',
            'Eksekusi runtut: persiapan bahan, penepungan 2x, hingga penirisan minyak',
            'APD lengkap terverifikasi: Topi, Apron, Sepatu Tertutup & Kuku Bersih',
            'Pencatatan kasir dan uang modal selalu klop tanpa selisih',
            'Mampu menyelesaikan antrean 30+ porsi tepat waktu (< 3 menit per porsi)',
          ];
      setSelectedEvidenceTags(initTags);

      setAkarMasalah(trainee?.akar_masalah || (isGood ? OPSI_AKAR_MASALAH[0] : OPSI_AKAR_MASALAH[2]));
      
      setBuktiObservasi(
        trainee?.bukti_observasi ||
        `Pengamatan selama shift menunjukkan kru mampu mengeksekusi tahapan SOP dengan presisi. Gramasi bumbu tepat dan suhu penggorengan terverifikasi 170°C sebelum memasukkan bahan.`
      );

      setAlasanKelulusan(
        trainee?.alasan_kelulusan ||
        (isGood
          ? `Kru telah memenuhi ambang batas kelulusan kompetensi (≥ 80 poin) pada seluruh 4 pilar asesmen, mengeksekusi seluruh langkah kerja SOP secara runtut tanpa deviasi kritis, serta membuktikan ketahanan dan keramahan saat jam sibuk.`
          : `Kru masih membutuhkan supervisi berkala pada manajemen holding time dan kecepatan kasir sebelum dilepas mandiri secara penuh.`)
      );

      setNoteStrengths(
        trainee?.catatan_kekuatan ||
        'Cepat beradaptasi dengan urutan kerja runtut, teliti saat proses penggorengan, dan disiplin tinggi dalam penggunaan APD sanitasi.'
      );
      setNoteWeaknesses(
        trainee?.catatan_kelemahan ||
        'Perlu peningkatan kecepatan taking order kasir saat jam sibuk dan memperdalam ketelitian rotasi label holding time warmer.'
      );
      setNoteActionPlan(
        trainee?.catatan_action_plan ||
        'Pendampingan mandiri 3 hari ke depan dengan evaluasi berkala bersama Penanggung Jawab Outlet pada stasiun penggorengan.'
      );
      setNoteSummary(trainee?.catatan_trainer || '');
      // Init Identity & Jabatan Edit
      setEditNamaKru(trainee?.nama_kru || 'Kru Baru');
      setEditJabatan(trainee?.jabatan || 'Crew Kitchen');
      setEditDivisi(trainee?.divisi || defaultDivisi);
      setEditSopFokus(trainee?.sop_fokus || (divisionSops[0]?.judul_sop || 'SOP Penggorengan & Penepungan'));
      setEditTrainerNama(trainee?.trainer_nama || 'Haikal Abi');
      setEditTanggalMulai(trainee?.tanggal_mulai || new Date().toISOString().split('T')[0]);
      setEditTanggalSelesai(trainee?.tanggal_selesai || '');
      setShowIdentityEdit(false);

      setIsOverrideActive(false);
      setManualOverrideScore(base);
      setOverrideReason('');
      setActiveTab('faktor');
      setInspectingSop(null);
    }
  }, [isOpen, trainee, target, divisionSops]);

  // Toggle evidence tag
  const toggleEvidenceTag = (tagText: string) => {
    setSelectedEvidenceTags((prev) =>
      prev.includes(tagText) ? prev.filter((t) => t !== tagText) : [...prev, tagText]
    );
  };

  // Calculations:
  // Faktor 1: Teori Bank SOP (Bobot 25%)
  const calculatedTeoriScore = useMemo(() => {
    if (teoriEvalMode === 'sop_topics' && divisionSops.length > 0) {
      let total = 0;
      let count = 0;
      divisionSops.forEach((sop) => {
        const val = teoriTopicScores[sop.id];
        if (val !== undefined) {
          total += val;
        }
        count++;
      });
      if (count > 0) {
        return Math.min(100, Math.max(0, Math.round((total / (count * 3)) * 100)));
      }
    }
    
    // Fallback to Parameter Kritis
    let sum = 0;
    for (let i = 0; i < RUBRIK_TEORI_DETAIL.length; i++) {
      sum += (teoriScores[i] ?? 15);
    }
    return Math.min(100, Math.max(0, sum));
  }, [teoriEvalMode, divisionSops, teoriTopicScores, teoriScores]);

  // Faktor 2: Praktik (Bobot 35%)
  const calculatedPraktikScore = useMemo(() => {
    if (divisionSops.length === 0) return 80;
    let total = 0;
    let count = 0;
    divisionSops.forEach((sop) => {
      const val = topicScores[sop.id];
      if (val !== undefined) {
        total += val;
        count++;
      }
    });
    if (count === 0) return 80;
    const base = (total / (count * 3)) * 100;
    const bonus = (speedScore - 2) * 2 + (hygieneScore - 2) * 2 + (wasteControlScore - 2) * 2;
    return Math.min(100, Math.max(0, Math.round(base + bonus)));
  }, [divisionSops, topicScores, speedScore, hygieneScore, wasteControlScore]);

  // Faktor 3: Attitude Budaya H.A.R.A (Bobot 25%) - Diambil langsung dari Input Nilai HARA Objektif 16 SOP (0-100 pt)
  const calculatedAttitudeScore = useMemo(() => {
    if (useObjectiveHara) {
      const h = objectiveHaraScores.H ?? 90;
      const a1 = objectiveHaraScores.A1 ?? 85;
      const r = objectiveHaraScores.R ?? 88;
      const a2 = objectiveHaraScores.A2 ?? 90;
      return Math.round((h + a1 + r + a2) / 4);
    }
    const h = attitudeScores.H ?? attitudeScores.P ?? 4;
    const a1 = attitudeScores.A1 ?? attitudeScores.R ?? 4;
    const r = attitudeScores.R ?? attitudeScores.E ?? 4;
    const a2 = attitudeScores.A2 ?? attitudeScores.T ?? 4;
    const total = h + a1 + r + a2; // Max 20
    return Math.round((total / 20) * 100);
  }, [useObjectiveHara, objectiveHaraScores, attitudeScores]);

  // Faktor 4: Ketahanan & Jam Sibuk (Bobot 15%)
  const calculatedKetahananScore = useMemo(() => {
    const total = (ketahananScores[0] ?? 3) + (ketahananScores[1] ?? 3) + (ketahananScores[2] ?? 3); // Max 9
    return Math.round((total / 9) * 100);
  }, [ketahananScores]);

  // Indeks Perubahan Perilaku (Behavior Change Index) - Skala 0-100
  const calculatedBehaviorScore = useMemo(() => {
    const keys = Object.keys(behaviorLevels);
    if (keys.length === 0) return 85;
    let total = 0;
    keys.forEach((k) => {
      const lvl = behaviorLevels[k] ?? 3;
      const point = lvl === 4 ? 100 : lvl === 3 ? 85 : lvl === 2 ? 65 : 40;
      total += point;
    });
    return Math.round(total / keys.length);
  }, [behaviorLevels]);

  // Total Komposit Formula 4-Faktor: (F1*0.25) + (F2*0.35) + (F3*0.25) + (F4*0.15)
  const autoCalculatedCompositeScore = useMemo(() => {
    const total =
      (calculatedTeoriScore * 0.25) +
      (calculatedPraktikScore * 0.35) +
      (calculatedAttitudeScore * 0.25) +
      (calculatedKetahananScore * 0.15);
    return Math.round(total);
  }, [calculatedTeoriScore, calculatedPraktikScore, calculatedAttitudeScore, calculatedKetahananScore]);

  const finalCompositeScore = isOverrideActive ? manualOverrideScore : autoCalculatedCompositeScore;

  const calculatedStatusOjt = useMemo((): StatusOJT => {
    if (finalCompositeScore >= 80) return 'Lulus / Mandiri';
    if (finalCompositeScore >= 68) return 'Sedang Berjalan';
    return 'Perlu Pendampingan Lanjut';
  }, [finalCompositeScore]);

  // Generate AI/Diagnostic Summary with Clear Arguments & Evidence
  const handleGenerateDiagnosticAnalysis = () => {
    const statusText = calculatedStatusOjt;
    const crewName = editNamaKru || trainee?.nama_kru || 'Kru Evaluasi';
    const tagListStr = selectedEvidenceTags.length > 0
      ? selectedEvidenceTags.slice(0, 4).join(', ')
      : 'kepatuhan standar suhu, penepungan krispi, dan pemakaian APD lengkap';

    const narrative = `Berdasarkan evaluasi objektif ${target === 'awal' ? 'Pre-Test' : 'Post-Test'} jabatan ${editJabatan} divisi ${editDivisi}, ${crewName} memperoleh Skor Akhir Komposit ${finalCompositeScore}/100 (Teori: ${calculatedTeoriScore}, Praktik: ${calculatedPraktikScore}, Budaya H.A.R.A: ${calculatedAttitudeScore}, Ketahanan: ${calculatedKetahananScore}).\n\n` +
      `BUKTI OBSERVASI LAPANGAN: ${buktiObservasi || `Ditemukan bahwa ${crewName} menunjukkan: ${tagListStr}.`}\n\n` +
      `DIAGNOSA AKAR MASALAH: "${akarMasalah}". ${finalCompositeScore < 80 ? 'Diperlukan penguatan repetisi agar deviasi tidak berulang pada jam sibuk.' : 'Kru telah menunjukkan pemahaman stabil dan siap bertugas mandiri.'}\n\n` +
      `JUSTIFIKASI STATUS (${statusText}): ${alasanKelulusan}`;

    setNoteSummary(narrative);
  };

  const handleApply = () => {
    const topicSummary = divisionSops.map((sop) => ({
      judul: sop.judul_sop,
      skor: topicScores[sop.id] ?? 2,
    }));

    // Compile detailed rubrik
    const compiledRubrik = [
      ...RUBRIK_TEORI_DETAIL.map((t, idx) => ({
        kategori: 'Teori Baku',
        kriteria: t.label,
        level: teoriScores[idx] === 20 ? 'Level 4 (Mahir)' : teoriScores[idx] === 15 ? 'Level 3 (Standar)' : teoriScores[idx] === 10 ? 'Level 2 (Berkembang)' : 'Level 1 (Kritis)',
        skor: teoriScores[idx] ?? 15,
        alasan: t.levelRubrik.find((l) => l.skor === (teoriScores[idx] ?? 15))?.deskripsiPerilaku || '',
        bukti: selectedEvidenceTags.find((tag) => t.tagBuktiAlasan.includes(tag)) || 'Sesuai indikator kognitif',
      })),
      ...ASPEK_ATTITUDE_HARA_DETAIL.map((a) => {
        const rawScore = useObjectiveHara ? (objectiveHaraScores[a.key] ?? 90) : (attitudeScores[a.key] || 4) * 20;
        return {
          kategori: 'Budaya H.A.R.A (12 Perilaku Utama)',
          kriteria: a.nama,
          level: useObjectiveHara ? `${rawScore} pt (Audit Objektif 16 SOP)` : `${attitudeScores[a.key] || 4} Bintang`,
          skor: rawScore,
          alasan: a.levelKriteria.find((l) => l.bintang === Math.max(1, Math.min(5, Math.round(rawScore / 20))))?.bukti || '',
          bukti: selectedEvidenceTags.find((tag) => a.tagBuktiAlasan.includes(tag)) || 'Sikap kerja kondusif',
        };
      }),
      ...BEHAVIOR_CHANGE_INDICATORS.map((b) => {
        const lvl = behaviorLevels[b.id] || 3;
        const opt = b.options.find((o) => o.level === lvl);
        return {
          kategori: 'Behavior Change (Kirkpatrick L3)',
          kriteria: b.label,
          level: opt?.label || `Level ${lvl}`,
          skor: opt?.skor || 85,
          alasan: opt?.desc || '',
          bukti: b.targetMetric,
        };
      }),
    ];

    onSaveAssessment({
      skorTeori: calculatedTeoriScore,
      skorPraktik: calculatedPraktikScore,
      skorAttitude: calculatedAttitudeScore,
      skorKetahanan: calculatedKetahananScore,
      skorBehaviorChange: calculatedBehaviorScore,
      levelKirkpatrick: {
        l1_reaksi: kirkpatrickReaksi,
        l2_kognitif: calculatedTeoriScore,
        l3_perilaku: calculatedBehaviorScore,
        l4_dampak: finalCompositeScore >= 80 ? 92 : finalCompositeScore >= 68 ? 75 : 55,
      },
      skorKomposit: finalCompositeScore,
      statusOjt: calculatedStatusOjt,
      catatanKekuatan: noteStrengths,
      catatanKelemahan: noteWeaknesses,
      catatanActionPlan: noteActionPlan,
      catatanTrainer: noteSummary.trim() ? noteSummary : (
        `Evaluasi Objektif Trainee Divisi ${editDivisi}: Skor Akhir ${finalCompositeScore}/100 [${calculatedStatusOjt}]. Akar Masalah: ${akarMasalah}. Justifikasi: ${alasanKelulusan}`
      ),
      alasanDiagnostik: selectedEvidenceTags,
      buktiObservasi,
      akarMasalah,
      alasanKelulusan,
      topikScores: topicSummary,
      isOverridden: isOverrideActive,
      overrideReason: isOverrideActive ? overrideReason : undefined,
      detailRubrik: compiledRubrik,
      traineeInfo: {
        nama_kru: editNamaKru,
        jabatan: editJabatan,
        divisi: editDivisi,
        sop_fokus: editSopFokus,
        trainer_nama: editTrainerNama,
        tanggal_mulai: editTanggalMulai,
        tanggal_selesai: editTanggalSelesai,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-auto max-h-[94vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#96171B] to-[#781014] text-white shadow-md">
              <Calculator size={22} className="text-[#FBD66A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  Rubrik Evaluasi Objektif & Diagnostik Trainee
                </h3>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  target === 'awal' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {target === 'awal' ? 'Pre-Test (Awal)' : 'Post-Test (Akhir)'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                <span>Kru: <b className="text-slate-900">{editNamaKru}</b></span>
                <span>•</span>
                <span className="bg-slate-100 text-slate-800 font-black px-2 py-0.5 rounded-md border border-slate-200">
                  Posisi: {editJabatan}
                </span>
                <span>•</span>
                <span>Divisi: <b className="text-[#96171B]">{editDivisi}</b></span>
                <button
                  type="button"
                  onClick={() => setShowIdentityEdit(!showIdentityEdit)}
                  className="text-[#96171B] hover:text-[#781014] font-black underline ml-1 cursor-pointer flex items-center gap-1"
                >
                  <Sliders size={11} />
                  <span>{showIdentityEdit ? 'Tutup Edit Profil' : 'Edit Jabatan & Profil Kru'}</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Collapsible Identity & Jabatan Editor */}
        {showIdentityEdit && (
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3 shrink-0 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <Sliders size={14} className="text-[#96171B]" />
                <span>Edit Data Manual Kru & Jabatan Kerja</span>
              </span>
              <span className="text-[11px] text-amber-800 font-medium">
                Pilih atau ketik manual posisi jabatan kru secara fleksibel.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Nama Kru</label>
                <input
                  type="text"
                  value={editNamaKru}
                  onChange={(e) => setEditNamaKru(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Jabatan / Posisi</label>
                <input
                  type="text"
                  value={editJabatan}
                  onChange={(e) => setEditJabatan(e.target.value)}
                  placeholder="Contoh: Senior Cook / Kasir Utama"
                  className="w-full text-xs font-black bg-white border border-amber-400 rounded-xl p-2 text-amber-950 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Divisi</label>
                <select
                  value={editDivisi}
                  onChange={(e) => setEditDivisi(e.target.value as Division)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2 text-slate-900"
                >
                  <option value="Kitchen">Kitchen</option>
                  <option value="Geprek">Geprek</option>
                  <option value="Kasir">Kasir</option>
                  <option value="Helper">Helper</option>
                </select>
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-slate-700 block mb-0.5">Trainer Operasional</label>
                <input
                  type="text"
                  value={editTrainerNama}
                  onChange={(e) => setEditTrainerNama(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2 text-slate-900"
                />
              </div>
            </div>

            {/* Quick Jabatan Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-500">Pilih Cepat Jabatan:</span>
              {[
                'Crew Kitchen',
                'Senior Cook',
                'Kasir Utama',
                'Shift Leader',
                'Trainee OJT',
                'Helper Umum',
                'Barista / Drink Maker',
                'Quality Control Kru'
              ].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setEditJabatan(pos)}
                  className={`text-[10px] font-black px-2 py-0.8 rounded-lg transition-all cursor-pointer border ${
                    editJabatan === pos
                      ? 'bg-[#96171B] text-white border-[#781014] shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-amber-200/50">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">SOP Jobdesk Fokus</label>
                <input
                  type="text"
                  value={editSopFokus}
                  onChange={(e) => setEditSopFokus(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Tgl Mulai Bimbingan</label>
                  <input
                    type="date"
                    value={editTanggalMulai}
                    onChange={(e) => setEditTanggalMulai(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Tgl Selesai (Opsional)</label>
                  <input
                    type="date"
                    value={editTanggalSelesai}
                    onChange={(e) => setEditTanggalSelesai(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Score & Diagnostics Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 justify-center sm:justify-start">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Skor Komposit Objektif Terukur (4 Faktor Berbobot)</span>
              {isOverrideActive && (
                <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 text-[9px] rounded">
                  OVERRIDE MANUAL
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${
                finalCompositeScore >= 80
                  ? 'text-emerald-400'
                  : finalCompositeScore >= 68
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}>
                {finalCompositeScore}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
              <span className={`ml-2 text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                calculatedStatusOjt === 'Lulus / Mandiri'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : calculatedStatusOjt === 'Sedang Berjalan'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {calculatedStatusOjt}
              </span>
            </div>
            <div className="text-[10px] text-slate-300">
              Formula Baku: Teori (25%) + Praktik (35%) + Budaya H.A.R.A (25%) + Ketahanan (15%)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOverrideActive(!isOverrideActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                isOverrideActive
                  ? 'bg-amber-400 text-slate-900 border-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <Sliders size={13} />
              <span>{isOverrideActive ? 'Gunakan Formula Otomatis' : 'Override Skor Manual'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 p-1 bg-slate-100 rounded-2xl shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('faktor')}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer font-bold ${
              activeTab === 'faktor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 size={13} className="mx-auto text-slate-700 mb-0.5" />
            <span>Matriks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teori')}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer font-bold ${
              activeTab === 'teori' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Brain size={13} className="mx-auto text-blue-600 mb-0.5" />
            <span>Teori (25%)</span>
            <div className="text-[10px] text-blue-700 font-black">{calculatedTeoriScore} pt</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('praktik')}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer font-bold ${
              activeTab === 'praktik' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench size={13} className="mx-auto text-amber-600 mb-0.5" />
            <span>Praktik (35%)</span>
            <div className="text-[10px] text-amber-700 font-black">{calculatedPraktikScore} pt</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attitude')}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer font-bold ${
              activeTab === 'attitude' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award size={13} className="mx-auto text-emerald-600 mb-0.5" />
            <span>Budaya HARA</span>
            <div className="text-[10px] text-emerald-700 font-black">{calculatedAttitudeScore} pt</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ketahanan')}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer font-bold ${
              activeTab === 'ketahanan' ? 'bg-white text-rose-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame size={13} className="mx-auto text-rose-600 mb-0.5" />
            <span>Ketahanan (15%)</span>
            <div className="text-[10px] text-rose-700 font-black">{calculatedKetahananScore} pt</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('behavior')}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer font-bold ${
              activeTab === 'behavior' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={13} className="mx-auto text-indigo-600 mb-0.5" />
            <span>Perilaku (L3)</span>
            <div className="text-[10px] text-indigo-700 font-black">{calculatedBehaviorScore} pt</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diagnosa')}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer font-bold ${
              activeTab === 'diagnosa' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap size={13} className="mx-auto text-purple-600 mb-0.5" />
            <span>Alasan & Bukti</span>
            <div className="text-[10px] text-purple-700 font-black">{selectedEvidenceTags.length} Poin</div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catatan')}
            className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer font-bold ${
              activeTab === 'catatan' ? 'bg-white text-[#96171B] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles size={13} className="mx-auto text-[#96171B] mb-0.5" />
            <span>Rekomendasi</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          
          {/* TAB 0: OVERVIEW 4 FAKTOR & FORMULA */}
          {activeTab === 'faktor' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-700">Faktor 1: Teori (25%)</span>
                  <div className="text-2xl font-black text-blue-900">{calculatedTeoriScore}</div>
                  <div className="text-[10px] text-blue-600 font-bold">Kontribusi: {(calculatedTeoriScore * 0.25).toFixed(1)} pt</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-700">Faktor 2: Praktik (35%)</span>
                  <div className="text-2xl font-black text-amber-900">{calculatedPraktikScore}</div>
                  <div className="text-[10px] text-amber-600 font-bold">Kontribusi: {(calculatedPraktikScore * 0.35).toFixed(1)} pt</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-700">Faktor 3: Budaya H.A.R.A (25%)</span>
                  <div className="text-2xl font-black text-emerald-900">{calculatedAttitudeScore}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">Kontribusi: {(calculatedAttitudeScore * 0.25).toFixed(1)} pt</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase text-rose-700">Faktor 4: Ketahanan (15%)</span>
                  <div className="text-2xl font-black text-rose-900">{calculatedKetahananScore}</div>
                  <div className="text-[10px] text-rose-600 font-bold">Kontribusi: {(calculatedKetahananScore * 0.15).toFixed(1)} pt</div>
                </div>
              </div>

              {/* Manual Override Controls */}
              {isOverrideActive && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-900">
                    <Sliders size={16} className="text-amber-700" />
                    <span>Mode Penyesuaian Skor Manual (Override)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Skor Manual (0 - 100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={manualOverrideScore}
                        onChange={(e) => setManualOverrideScore(Number(e.target.value))}
                        className="w-full text-sm font-black bg-white border border-amber-300 rounded-xl px-3 py-2 text-amber-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Penyesuaian Skor</label>
                      <input
                        type="text"
                        value={overrideReason}
                        onChange={(e) => setOverrideReason(e.target.value)}
                        placeholder="Contoh: Pengalaman kerja F&B 2 tahun, adaptasi cepat di kitchen..."
                        className="w-full text-xs font-bold bg-white border border-amber-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Point-by-Point Itemized Scorecard Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-0">
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={15} className="text-[#FBD66A]" />
                    <span className="text-xs font-black tracking-wide uppercase">Rincian Per-Poin & Checklist Penilaian Objektif</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-300">
                    Grand Total: <b className="text-white text-xs">{finalCompositeScore} / 100</b>
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {/* Category 1: Teori Bank SOP */}
                  <div className="p-3 bg-blue-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-blue-950 flex items-center gap-1.5">
                        <Brain size={13} className="text-blue-600" />
                        <span>1. Pilar Teori & Poin Kritis Bank SOP Divisi (Bobot 25%)</span>
                      </span>
                      <span className="font-black text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded text-[11px]">
                        {calculatedTeoriScore} / 100 pt → Poin Komposit: {(calculatedTeoriScore * 0.25).toFixed(1)}
                      </span>
                    </div>

                    {teoriEvalMode === 'sop_topics' && divisionSops.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 text-[11px]">
                        {divisionSops.slice(0, 6).map((s) => {
                          const val = teoriTopicScores[s.id] ?? 2;
                          return (
                            <div key={s.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-blue-100">
                              <span className="text-slate-700 font-medium truncate">• {s.judul_sop}</span>
                              <span className={`font-bold text-[10px] shrink-0 ml-1 ${
                                val === 3 ? 'text-emerald-700' :
                                val === 2 ? 'text-blue-700' : 'text-amber-700'
                              }`}>
                                {val} / 3 pt
                              </span>
                            </div>
                          );
                        })}
                        {divisionSops.length > 6 && (
                          <div className="p-1.5 rounded-lg bg-blue-100/50 border border-blue-200 text-center text-[10px] font-bold text-blue-900">
                            + {divisionSops.length - 6} Topik SOP Teori lainnya
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                        {RUBRIK_TEORI_DETAIL.map((t, i) => (
                          <div key={t.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-blue-100">
                            <span className="text-slate-700 font-medium truncate">• {t.label}</span>
                            <span className="font-bold text-blue-800 shrink-0 ml-1">
                              {teoriScores[i] ?? 15} / {t.bobotMax} pt
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category 2: Praktik */}
                  <div className="p-3 bg-amber-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-amber-950 flex items-center gap-1.5">
                        <Wrench size={13} className="text-amber-600" />
                        <span>2. Pilar Praktik Jobdesk & SOP Divisi (Bobot 35%)</span>
                      </span>
                      <span className="font-black text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded text-[11px]">
                        {calculatedPraktikScore} / 100 pt → Poin Komposit: {(calculatedPraktikScore * 0.35).toFixed(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 text-[11px]">
                      {divisionSops.slice(0, 6).map((s, idx) => (
                        <div key={s.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-amber-100">
                          <span className="text-slate-700 font-medium truncate">• {s.judul_sop}</span>
                          <span className={`font-bold text-[10px] shrink-0 ml-1 ${
                            (topicScores[s.id] ?? 2) === 3 ? 'text-emerald-700' :
                            (topicScores[s.id] ?? 2) === 2 ? 'text-blue-700' : 'text-amber-700'
                          }`}>
                            {(topicScores[s.id] ?? 2)} / 3 pt
                          </span>
                        </div>
                      ))}
                      {divisionSops.length > 6 && (
                        <div className="p-1.5 rounded-lg bg-amber-100/50 border border-amber-200 text-center text-[10px] font-bold text-amber-900">
                          + {divisionSops.length - 6} Topik SOP lainnya diuji
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 pt-1 text-[10.5px] text-slate-600 border-t border-amber-200/50">
                      <span>Kecepatan: <b className="text-slate-900">{speedScore}/3 pt</b></span>
                      <span>Sanitasi: <b className="text-slate-900">{hygieneScore}/3 pt</b></span>
                      <span>Zero Waste: <b className="text-slate-900">{wasteControlScore}/3 pt</b></span>
                    </div>
                  </div>

                  {/* Category 3: Budaya H.A.R.A */}
                  <div className="p-3 bg-emerald-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-emerald-950 flex items-center gap-1.5">
                        <Award size={13} className="text-emerald-600" />
                        <span>3. Pilar Sikap & Budaya H.A.R.A (Bobot 25%)</span>
                      </span>
                      <span className="font-black text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded text-[11px]">
                        {calculatedAttitudeScore} / 100 pt → Poin Komposit: {(calculatedAttitudeScore * 0.25).toFixed(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                      {ASPEK_ATTITUDE_HARA_DETAIL.map((a) => (
                        <div key={a.key} className="p-1.5 rounded-lg bg-white border border-emerald-100 text-center">
                          <div className="text-[10px] font-bold text-emerald-800">{a.key} - {a.nama.split(' ')[0]}</div>
                          <div className="text-xs font-black text-emerald-950 mt-0.5">
                            {useObjectiveHara ? `${objectiveHaraScores[a.key] ?? 90} pt` : `${attitudeScores[a.key] || 4} / 5 pt`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category 4: Ketahanan */}
                  <div className="p-3 bg-rose-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-rose-950 flex items-center gap-1.5">
                        <Flame size={13} className="text-rose-600" />
                        <span>4. Pilar Ketahanan Kerja & Jam Sibuk (Bobot 15%)</span>
                      </span>
                      <span className="font-black text-rose-900 bg-rose-100/80 px-2 py-0.5 rounded text-[11px]">
                        {calculatedKetahananScore} / 100 pt → Poin Komposit: {(calculatedKetahananScore * 0.15).toFixed(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px]">
                      {KRITERIA_KETAHANAN_DETAIL.map((k, i) => (
                        <div key={k.id} className="p-1.5 rounded-lg bg-white border border-rose-100 flex items-center justify-between">
                          <span className="text-slate-700 font-medium truncate">• {k.label.split('/')[0]}</span>
                          <span className="font-bold text-rose-800 shrink-0 ml-1">{ketahananScores[i] ?? 3} / 3 pt</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mathematical Formula Footnote */}
                <div className="p-3 bg-slate-100 text-[11px] text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-1 border-t border-slate-200 font-medium">
                  <div>
                    <b>Rumus Komposit:</b> ({calculatedTeoriScore}×0.25) + ({calculatedPraktikScore}×0.35) + ({calculatedAttitudeScore}×0.25) + ({calculatedKetahananScore}×0.15) = <b>{autoCalculatedCompositeScore} Poin</b>
                  </div>
                  <div className="font-bold text-slate-900">
                    Ambang Batas Kelulusan: <span className="text-emerald-700">≥ 80 pt (Lulus Mandiri)</span>
                  </div>
                </div>
              </div>

              {/* Objective Rubric Guidance Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-black text-slate-900">
                  <ShieldCheck size={16} className="text-[#96171B]" />
                  <span>Standar Penilaian Objektif & Bebas Asumsi Trainer:</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Setiap penilaian tidak boleh hanya sekadar dinyatakan <i>'paham / tidak'</i>. Trainer wajib memilih level rubrik perilaku yang sesuai dan menandai <b>bukti observasi konkret</b> yang diamati selama OJT/shift kerja. Nilai ini menjadi acuan legal Berita Acara Kelulusan resmi.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: TEORI SOP DENGAN BANK SOP DIVISI & PARAMETER KRITIS */}
          {activeTab === 'teori' && (
            <div className="space-y-3">
              {/* Header Teori with Mode Toggle */}
              <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-blue-900">
                      Uji Verifikasi Langkah & Parameter Bank SOP Divisi {currentDivisi} ({divisionSops.length} Topik SOP)
                    </span>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Verifikasi matematis urutan langkah baku, parameter suhu/gramasi & toleransi deviasi mutu
                    </p>
                  </div>
                  <span className="text-xs font-black text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                    {calculatedTeoriScore} / 100 pt
                  </span>
                </div>

                {/* Sub-Mode Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-blue-200/70">
                  <div className="flex items-center gap-1.5 bg-blue-100/70 p-0.5 rounded-xl text-[11px]">
                    <button
                      type="button"
                      onClick={() => setTeoriEvalMode('sop_topics')}
                      className={`px-3 py-1 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 ${
                        teoriEvalMode === 'sop_topics'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-blue-800 hover:bg-blue-200/60'
                      }`}
                    >
                      <FileText size={12} />
                      <span>Topik Bank SOP ({divisionSops.length} SOP Runtut)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeoriEvalMode('parameter_kritis')}
                      className={`px-3 py-1 rounded-lg font-black transition-all cursor-pointer flex items-center gap-1 ${
                        teoriEvalMode === 'parameter_kritis'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-blue-800 hover:bg-blue-200/60'
                      }`}
                    >
                      <ShieldAlert size={12} />
                      <span>5 Parameter Kritis & Bukti Tag</span>
                    </button>
                  </div>

                  {teoriEvalMode === 'sop_topics' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const update: Record<string, number> = {};
                          const updateAudits: Record<string, Record<number, number>> = {};
                          divisionSops.forEach((s) => {
                            update[s.id] = 2;
                            const stepsMap: Record<number, number> = {};
                            (s.langkah || []).forEach((_, idx) => { stepsMap[idx] = 2; });
                            updateAudits[s.id] = stepsMap;
                          });
                          setTeoriTopicScores(update);
                          setSopStepAudit(updateAudits);
                        }}
                        className="text-[10px] font-extrabold px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-900 rounded-lg border border-blue-300 cursor-pointer transition-all shadow-2xs flex items-center gap-1"
                      >
                        <Check size={11} className="text-blue-700" />
                        <span>Verifikasi Semua Runtut (Level 2)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const update: Record<string, number> = {};
                          const updateAudits: Record<string, Record<number, number>> = {};
                          divisionSops.forEach((s) => {
                            update[s.id] = 3;
                            const stepsMap: Record<number, number> = {};
                            (s.langkah || []).forEach((_, idx) => { stepsMap[idx] = 2; });
                            updateAudits[s.id] = stepsMap;
                          });
                          setTeoriTopicScores(update);
                          setSopStepAudit(updateAudits);
                        }}
                        className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-all shadow-2xs flex items-center gap-1"
                      >
                        <Star size={11} className="text-white" />
                        <span>Verifikasi 100% Sempurna (Level 3)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mode 1: Topik Bank SOP Divisi */}
              {teoriEvalMode === 'sop_topics' && (
                <div className="grid gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {divisionSops.map((sop, idx) => {
                    const val = teoriTopicScores[sop.id] ?? 2;
                    const stats = getSopStepAuditStats(sop);
                    const stepScore = getSopStepScore(sop);

                    return (
                      <div key={sop.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                #{idx + 1} {sop.kode_sop}
                              </span>
                              <h4 className="text-xs font-black text-slate-900">{sop.judul_sop}</h4>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 size={11} className="text-emerald-600" />
                                <span>{stats.fullPass}/{stats.total} Langkah Runtut ({stepScore}%)</span>
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                              {sop.poin_kritis ? (
                                <>
                                  <AlertTriangle size={11} className="text-amber-600 shrink-0" />
                                  <span>Poin Kritis: {sop.poin_kritis}</span>
                                </>
                              ) : (
                                <span>{sop.tujuan || 'Eksekusi sesuai tahapan baku SOP.'}</span>
                              )}
                            </p>
                            {sop.standar_waktu && (
                              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                                <span className="flex items-center gap-1"><Clock size={11} /> Target: {sop.standar_waktu}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><FileText size={11} /> {sop.langkah?.length || 0} Langkah Kerja Baku</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setInspectingSop(sop)}
                              className="text-[10.5px] font-extrabold px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-200 cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                            >
                              <CheckSquare size={12} className="text-blue-600" />
                              <span>Audit {sop.langkah?.length || 0} Langkah</span>
                            </button>
                            <span className={`text-[10px] font-black px-2 py-1 rounded shrink-0 ${
                              val === 3 ? 'bg-emerald-100 text-emerald-800' :
                              val === 2 ? 'bg-blue-100 text-blue-800' :
                              val === 1 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {val === 3 ? '100% Runtut Sempurna' : val === 2 ? 'Runtut Sesuai SOP' : val === 1 ? 'Ada Deviasi Urutan' : 'Deviasi Kritis / Terlewat'}
                            </span>
                          </div>
                        </div>

                        {/* 4 Objective Compliance Options */}
                        <div className="grid grid-cols-4 gap-1.5">
                          {[
                            { score: 0, label: '0: Deviasi Kritis', desc: 'Melompati parameter baku' },
                            { score: 1, label: '1: Urutan Tertukar', desc: 'Ada 1 langkah terlewat' },
                            { score: 2, label: '2: Runtut Sesuai SOP', desc: 'Seluruh tahapan presisi' },
                            { score: 3, label: '3: 100% Runtut & Cepat', desc: 'Presisi + zero error' },
                          ].map((opt) => (
                            <button
                              key={opt.score}
                              type="button"
                              onClick={() => {
                                setTeoriTopicScores((prev) => ({ ...prev, [sop.id]: opt.score }));
                                handleSetAllStepsForSop(sop.id, opt.score >= 2 ? 2 : opt.score === 1 ? 1 : 0);
                              }}
                              className={`p-1.5 rounded-xl text-left border transition-all cursor-pointer ${
                                val === opt.score
                                  ? 'bg-blue-600 text-white border-blue-700 font-black shadow-xs'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div className="text-[10.5px] font-bold">{opt.label}</div>
                              <div className={`text-[9px] ${val === opt.score ? 'text-blue-100' : 'text-slate-400'}`}>{opt.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Mode 2: 5 Parameter Kritis & Uji Lisan SOP Baku */}
              {teoriEvalMode === 'parameter_kritis' && (
                <div className="space-y-3">
                  {RUBRIK_TEORI_DETAIL.map((item, idx) => {
                    const cur = teoriScores[idx] ?? 15;
                    return (
                      <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{idx + 1}. {item.label}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">{item.deskripsi}</p>
                          </div>
                          <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-lg shrink-0">
                            {cur} / {item.bobotMax} pt
                          </span>
                        </div>

                        {/* 4-Level Behavioral Rubric Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.levelRubrik.map((lvl) => {
                            const isSelected = cur === lvl.skor;
                            return (
                              <button
                                key={lvl.skor}
                                type="button"
                                onClick={() => setTeoriScores((prev) => ({ ...prev, [idx]: lvl.skor }))}
                                className={`p-2.5 rounded-xl text-left text-xs transition-all border cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500 text-blue-950 font-bold'
                                    : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-[11px]">{lvl.level}</span>
                                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {lvl.skor} pt
                                  </span>
                                </div>
                                <p className="text-[10.5px] text-slate-600 font-normal leading-relaxed mt-1">
                                  {lvl.deskripsiPerilaku}
                                </p>
                              </button>
                            );
                          })}
                        </div>

                        {/* Evidence Tags for this item */}
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                            <Tag size={11} className="text-blue-500" />
                            <span>Pilih Bukti Temuan / Alasan Diagnostik Nyata:</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.tagBuktiAlasan.map((tag) => {
                              const isTagSelected = selectedEvidenceTags.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => toggleEvidenceTag(tag)}
                                  className={`text-[10px] px-2 py-1 rounded-lg font-medium transition-all cursor-pointer border ${
                                    isTagSelected
                                      ? 'bg-blue-600 text-white border-blue-700 font-bold shadow-2xs'
                                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  {isTagSelected ? '✓ ' : '+ '} {tag}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRAKTIK EKSEKUSI RUNTUT SELURUH TOPIK SOP */}
          {activeTab === 'praktik' && (
            <div className="space-y-3">
              <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-amber-900">
                      Praktik Eksekusi Runtut SOP Divisi {currentDivisi} ({divisionSops.length} Topik)
                    </span>
                    <p className="text-[11px] text-amber-700 mt-0.5">Penilaian eksekusi gerak berurutan, gramasi, higienitas & efisiensi</p>
                  </div>
                  <span className="text-xs font-black text-amber-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                    {calculatedPraktikScore} / 100 pt
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-amber-200/70">
                  <button
                    type="button"
                    onClick={() => {
                      const update: Record<string, number> = {};
                      divisionSops.forEach((s) => { update[s.id] = 2; });
                      setTopicScores(update);
                    }}
                    className="text-[10px] font-extrabold px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 rounded-lg cursor-pointer transition-all"
                  >
                    Setel Semua Runtut SOP (Level 2)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const update: Record<string, number> = {};
                      divisionSops.forEach((s) => { update[s.id] = 3; });
                      setTopicScores(update);
                    }}
                    className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg cursor-pointer transition-all"
                  >
                    Setel Semua 100% Sempurna (Level 3)
                  </button>
                </div>
              </div>

              <div className="grid gap-2 max-h-[380px] overflow-y-auto pr-1">
                {divisionSops.map((sop, idx) => {
                  const val = topicScores[sop.id] ?? 2;
                  const stats = getSopStepAuditStats(sop);
                  const stepScore = getSopStepScore(sop);

                  return (
                    <div key={sop.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 transition-all space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">#{idx + 1} {sop.kode_sop}</span>
                            <h4 className="text-xs font-black text-slate-900">{sop.judul_sop}</h4>
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                              <Check size={11} className="text-amber-700" />
                              <span>{stats.fullPass}/{stats.total} Langkah ({stepScore}%)</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {sop.poin_kritis || sop.tujuan || 'Eksekusi sesuai tahapan baku SOP.'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setInspectingSop(sop)}
                            className="text-[10.5px] font-extrabold px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-200 cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <CheckSquare size={12} className="text-amber-700" />
                            <span>Audit Langkah</span>
                          </button>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            val === 3 ? 'bg-emerald-100 text-emerald-800' :
                            val === 2 ? 'bg-blue-100 text-blue-800' :
                            val === 1 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {val === 3 ? '100% Runtut' : val === 2 ? 'Sesuai SOP' : val === 1 ? 'Deviasi Minor' : 'Gagal Prosedur'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { score: 0, label: '0: Gagal Prosedur', desc: 'Deviasi fatal / bahaya' },
                          { score: 1, label: '1: Ada Deviasi', desc: 'Ada tahapan terlewat' },
                          { score: 2, label: '2: Sesuai SOP', desc: 'Mandiri sesuai checklist' },
                          { score: 3, label: '3: 100% Presisi', desc: 'Presisi, cepat & bersih' },
                        ].map((opt) => (
                          <button
                            key={opt.score}
                            type="button"
                            onClick={() => {
                              setTopicScores((prev) => ({ ...prev, [sop.id]: opt.score }));
                              handleSetAllStepsForSop(sop.id, opt.score >= 2 ? 2 : opt.score === 1 ? 1 : 0);
                            }}
                            className={`p-1.5 rounded-xl text-left border transition-all cursor-pointer ${
                              val === opt.score ? 'bg-amber-500 text-white border-amber-600 font-black shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div className="text-[10.5px] font-bold">{opt.label}</div>
                            <div className={`text-[9px] ${val === opt.score ? 'text-amber-100' : 'text-slate-400'}`}>{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Parameter Tambahan Praktik */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
                  <div className="text-[10.5px] font-black text-slate-700 flex items-center justify-center gap-1">
                    <Clock size={12} className="text-amber-600" />
                    <span>Kecepatan Eksekusi (0-3)</span>
                  </div>
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2, 3].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSpeedScore(v)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-all ${speedScore === v ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border text-slate-700'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
                  <div className="text-[10.5px] font-black text-slate-700 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span>Sanitasi Stasiun (0-3)</span>
                  </div>
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2, 3].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setHygieneScore(v)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-all ${hygieneScore === v ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border text-slate-700'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
                  <div className="text-[10.5px] font-black text-slate-700 flex items-center justify-center gap-1">
                    <Shield size={12} className="text-blue-600" />
                    <span>Zero Waste & Efisiensi (0-3)</span>
                  </div>
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2, 3].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setWasteControlScore(v)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer transition-all ${wasteControlScore === v ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border text-slate-700'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTITUDE BUDAYA H.A.R.A & 12 PERILAKU UTAMA RESMI */}
          {activeTab === 'attitude' && (
            <div className="space-y-3">
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-900">4 Pilar Budaya H.A.R.A & 12 Perilaku Utama Resmi</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-950 font-extrabold px-2 py-0.5 rounded-full">
                      Bobot Resmi: 25%
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Halal (Bekerja Halal) • Amanah (Bertindak Amanah) • Responsif (Bergerak Responsif) • Adaptif (Berkembang Adaptif)</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                    {calculatedAttitudeScore} / 100 pt
                  </span>
                </div>
              </div>

              {/* Mode Selector & Quick Sync dari Input Nilai Budaya HARA */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setUseObjectiveHara(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      useObjectiveHara
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ✓ Nilai HARA Objektif (0-100 pt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseObjectiveHara(false)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      !useObjectiveHara
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Rubrik Skala Bintang (1-5)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const targetName = trainee?.nama_kru || editNamaKru;
                    if (targetName) {
                      const attRecords = db.getTable<any>('attitude_hara').filter(
                        (a) => a.nama_kru && a.nama_kru.toLowerCase() === targetName.toLowerCase()
                      );
                      if (attRecords.length > 0) {
                        const latest = attRecords[0];
                        setObjectiveHaraScores({
                          H: latest.skor_h_higienis ?? 90,
                          A1: latest.skor_a_amanah ?? 85,
                          R: latest.skor_a_antusias ?? 88,
                          A2: latest.skor_r_resik ?? 90,
                        });
                        setUseObjectiveHara(true);
                      }
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  title="Ambil nilai terbaru dari tabel audit attitude_hara"
                >
                  <CheckCircle2 size={13} className="text-emerald-700" />
                  <span>Ambil dari Input Nilai Budaya HARA</span>
                </button>
              </div>

              {useObjectiveHara && (
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                  <span>
                    <strong>Penilaian Objektif Aktif:</strong> Nilai sikap ditarik langsung dari audit SOP 16 parameter budaya HARA, menghilangkan bias subjektivitas skala 1-5.
                  </span>
                </div>
              )}

              {ASPEK_ATTITUDE_HARA_DETAIL.map((aspek) => {
                const curRating = attitudeScores[aspek.key] ?? 4;
                const curObjective = objectiveHaraScores[aspek.key] ?? 90;
                const matchedDesc = aspek.levelKriteria.find((l) => l.bintang === curRating)?.bukti || '';

                return (
                  <div key={aspek.key} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black">
                            {aspek.key}
                          </span>
                          <h4 className="text-xs font-black text-slate-900">
                            {aspek.nama}
                          </h4>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 italic">
                            "{aspek.tagline}"
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{aspek.deskripsi}</p>
                        
                        {/* 3 Perilaku Utama Terkait */}
                        <div className="pt-1.5 pb-0.5 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
                            Perilaku Utama Teruji:
                          </span>
                          <div className="grid grid-cols-1 gap-1">
                            {aspek.perilakuUtama.map((pu, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[10.5px] text-slate-700 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                                <span>{pu}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                        {useObjectiveHara ? `${curObjective} pt / 100` : `${curRating} / 5 Bintang`}
                      </span>
                    </div>

                    {/* Mode A: Nilai HARA Objektif 0-100 pt */}
                    {useObjectiveHara ? (
                      <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">Skor Audit Objektif SOP {aspek.nama.split(' ')[0]}</span>
                          <span className="font-mono font-black text-emerald-700">{curObjective} Poin</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={curObjective}
                          onChange={(e) =>
                            setObjectiveHaraScores((prev) => ({
                              ...prev,
                              [aspek.key]: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-emerald-700 cursor-pointer"
                        />
                      </div>
                    ) : (
                      /* Mode B: Star Rating Selectors (Fallback) */
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setAttitudeScores((prev) => ({ ...prev, [aspek.key]: star }))}
                            className={`flex-1 py-2 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                              curRating >= star ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <Star size={13} className={curRating >= star ? 'fill-slate-900' : ''} />
                            <span>{star}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Active Behavioral Description */}
                    {!useObjectiveHara && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60 text-xs">
                        <span className="font-black text-emerald-900 block text-[10.5px]">Indikator Terpilih ({curRating} Bintang):</span>
                        <p className="text-slate-700 text-[11px] mt-0.5">{matchedDesc}</p>
                      </div>
                    )}

                    {/* Evidence Tags for H.A.R.A */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {aspek.tagBuktiAlasan.map((tag) => {
                        const isTagSelected = selectedEvidenceTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleEvidenceTag(tag)}
                            className={`text-[10px] px-2 py-1 rounded-lg font-medium transition-all cursor-pointer border ${
                              isTagSelected
                                ? 'bg-emerald-600 text-white border-emerald-700 font-bold shadow-2xs'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {isTagSelected ? '✓ ' : '+ '} {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: KETAHANAN KERJA & JAM SIBUK */}
          {activeTab === 'ketahanan' && (
            <div className="space-y-3">
              <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-rose-900">Uji Ketahanan Kerja, Jam Sibuk & Manajemen Emosi</span>
                  <p className="text-[11px] text-rose-700 mt-0.5">Uji performa saat 30+ pesanan antre dan konsistensi dari opening hingga closing</p>
                </div>
                <span className="text-xs font-black text-rose-800 bg-white px-2.5 py-1 rounded-lg border border-rose-200">
                  {calculatedKetahananScore} / 100 pt
                </span>
              </div>

              {KRITERIA_KETAHANAN_DETAIL.map((item, idx) => {
                const cur = ketahananScores[idx] ?? 3;
                return (
                  <div key={item.id} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-rose-300 transition-all space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{idx + 1}. {item.label}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.deskripsi}</p>
                      </div>
                      <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-1 rounded-lg shrink-0">
                        {cur} / 3 pt
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {item.levelRubrik.map((lvl) => {
                        const isSelected = cur === lvl.skor;
                        return (
                          <button
                            key={lvl.skor}
                            type="button"
                            onClick={() => setKetahananScores((prev) => ({ ...prev, [idx]: lvl.skor }))}
                            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-rose-50 border-rose-500 shadow-xs ring-1 ring-rose-500 text-rose-950 font-bold'
                                : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-[11px]">{lvl.label}</span>
                              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                                isSelected ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {lvl.skor} pt
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 font-normal leading-relaxed mt-1">
                              {lvl.bukti}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Evidence tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tagBuktiAlasan.map((tag) => {
                        const isTagSelected = selectedEvidenceTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleEvidenceTag(tag)}
                            className={`text-[10px] px-2 py-1 rounded-lg font-medium transition-all cursor-pointer border ${
                              isTagSelected
                                ? 'bg-rose-600 text-white border-rose-700 font-bold shadow-2xs'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {isTagSelected ? '✓ ' : '+ '} {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB: BEHAVIOR CHANGE & MONITORING RETENSI PASCA-TRAINING */}
          {activeTab === 'behavior' && (
            <div className="space-y-4">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-indigo-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500/30 text-indigo-300 font-black text-[10px] px-2 py-0.5 rounded border border-indigo-400/30">
                      KIRKPATRICK LEVEL 3 & 4
                    </span>
                    <h4 className="text-sm font-black text-white">Monitoring Perubahan Perilaku (Behavior Change Index)</h4>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Verifikasi objektif apakah kru tetap disiplin menerapkan standar SOP secara konsisten tanpa pengawasan (zero shortcut).
                  </p>
                </div>
                <div className="text-right shrink-0 bg-white/10 px-3.5 py-2 rounded-xl border border-white/20">
                  <div className="text-[10px] uppercase tracking-wider text-indigo-200 font-bold">Indeks Perilaku</div>
                  <div className="text-2xl font-black text-white">{calculatedBehaviorScore} <span className="text-xs font-normal text-indigo-200">/ 100</span></div>
                </div>
              </div>

              {/* 5 Indikator Perilaku Konkret */}
              <div className="space-y-3">
                {BEHAVIOR_CHANGE_INDICATORS.map((ind) => {
                  const currentLevel = behaviorLevels[ind.id] ?? 3;
                  return (
                    <div key={ind.id} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-all space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black flex items-center justify-center">
                              {ind.id.replace('bc-', '#')}
                            </span>
                            <h5 className="text-xs font-black text-slate-900">{ind.label}</h5>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{ind.deskripsi}</p>
                        </div>
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0 self-start">
                          Target: {ind.targetMetric}
                        </span>
                      </div>

                      {/* 4 Levels Selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                        {ind.options.map((opt) => {
                          const isSel = currentLevel === opt.level;
                          return (
                            <button
                              key={opt.level}
                              type="button"
                              onClick={() => setBehaviorLevels((prev) => ({ ...prev, [ind.id]: opt.level }))}
                              className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                                isSel
                                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center justify-between font-black text-[11px] mb-1">
                                <span>{opt.label.split(':')[0]}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${isSel ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                  {opt.skor} pt
                                </span>
                              </div>
                              <p className={`text-[10px] leading-relaxed line-clamp-3 ${isSel ? 'text-indigo-100' : 'text-slate-500'}`}>
                                {opt.desc}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Kirkpatrick 4-Level Alignment Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <span className="font-black text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  <span>Kesesuaian Kirkpatrick 4-Level Evaluation Model</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Level 1: Reaksi</span>
                    <b className="text-xs text-slate-900">{kirkpatrickReaksi}%</b>
                    <span className="text-[10px] text-emerald-600 font-bold block">Keterlibatan Belajar</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Level 2: Pembelajaran</span>
                    <b className="text-xs text-slate-900">{calculatedTeoriScore}%</b>
                    <span className="text-[10px] text-blue-600 font-bold block">Ujian Teori & SOP</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Level 3: Perilaku</span>
                    <b className="text-xs text-slate-900">{calculatedBehaviorScore}%</b>
                    <span className="text-[10px] text-indigo-600 font-bold block">Indeks Retensi Shift</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">Level 4: Dampak Hasil</span>
                    <b className="text-xs text-slate-900">{finalCompositeScore >= 80 ? '92%' : '72%'}</b>
                    <span className="text-[10px] text-amber-600 font-bold block">Mutu & Zero Waste</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DIAGNOSA AKAR MASALAH & JUSTIFIKASI KELULUSAN */}
          {activeTab === 'diagnosa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-purple-900">
                  <Zap size={16} className="text-purple-700" />
                  <span>1. Diagnosa Akar Masalah Utama (Root Cause Diagnosis)</span>
                </div>
                <p className="text-[11px] text-purple-800">
                  Pilih faktor dominan yang mendasari hasil capaian kru selama masa pendampingan:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {OPSI_AKAR_MASALAH.map((opt) => {
                    const isSel = akarMasalah === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAkarMasalah(opt)}
                        className={`p-2.5 rounded-xl text-left text-xs transition-all border cursor-pointer ${
                          isSel
                            ? 'bg-purple-700 text-white border-purple-800 font-bold shadow-xs'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-purple-100/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                            isSel ? 'border-white bg-white text-purple-900 font-black' : 'border-slate-400'
                          }`}>
                            {isSel ? '✓' : ''}
                          </span>
                          <span>{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Evidence Tags Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <CheckSquare size={14} className="text-[#96171B]" />
                    <span>Daftar Bukti Observasi Nyata Terpilih ({selectedEvidenceTags.length}):</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Bisa dipilih dari tab Teori, Praktik, Budaya H.A.R.A & Ketahanan</span>
                </div>
                
                {selectedEvidenceTags.length === 0 ? (
                  <div className="p-3 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                    Belum ada bukti spesifik terpilih. Buka tab Teori / Praktik / Budaya H.A.R.A untuk memilih tag bukti observasi.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                    {selectedEvidenceTags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-[10.5px] bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 font-medium"
                      >
                        <span>• {tag}</span>
                        <button
                          type="button"
                          onClick={() => toggleEvidenceTag(tag)}
                          className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Justifikasi Kelulusan / Bimbingan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  <span>2. Justifikasi Objektif Status OJT ({calculatedStatusOjt}):</span>
                </label>
                <textarea
                  rows={2}
                  value={alasanKelulusan}
                  onChange={(e) => setAlasanKelulusan(e.target.value)}
                  placeholder="Jelaskan alasan konkret mengapa anak training dinyatakan Lulus Mandiri atau Butuh Bimbingan Lanjut..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                />
              </div>

              {/* Bukti Observasi Naratif Tambahan */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <FileText size={14} className="text-blue-700" />
                  <span>3. Uraian Fakta Lapangan & Catatan Supervisi Shift:</span>
                </label>
                <textarea
                  rows={2}
                  value={buktiObservasi}
                  onChange={(e) => setBuktiObservasi(e.target.value)}
                  placeholder="Uraikan peristiwa spesifik yang terjadi di stasiun kerja selama pendampingan..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                />
              </div>
            </div>
          )}

          {/* TAB 6: CATATAN RESMI, ACTION PLAN & REKOMENDASI */}
          {activeTab === 'catatan' && (
            <div className="space-y-4">
              
              {/* Quick AI-Style Diagnostic Synthesizer */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-[#96171B] text-white space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#FBD66A]" />
                    <span className="text-xs font-black text-white">Generator Analisis Objektif Otomatis</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateDiagnosticAnalysis}
                    className="px-3 py-1 bg-[#FBD66A] text-slate-950 hover:bg-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                  >
                    <Sparkles size={12} />
                    <span>Susun Analisis Otomatis</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-300">
                  Sintesis otomatis seluruh skor 4 pilar, bukti observasi terpilih, dan diagnosa akar masalah menjadi narasi resmi yang tidak terbantahkan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-emerald-800 mb-1 flex items-center gap-1.5">
                  <ThumbsUp size={13} className="text-emerald-600" />
                  <span>1. Kekuatan & Kelebihan Menonjol (Strengths)</span>
                </label>
                <textarea
                  rows={2}
                  value={noteStrengths}
                  onChange={(e) => setNoteStrengths(e.target.value)}
                  placeholder="Kelebihan kru dalam penguasaan rasa, grooming, atau kecepatan..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-rose-800 mb-1 flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-rose-600" />
                  <span>2. Area Perbaikan & Kelemahan Kritis (Weaknesses)</span>
                </label>
                <textarea
                  rows={2}
                  value={noteWeaknesses}
                  onChange={(e) => setNoteWeaknesses(e.target.value)}
                  placeholder="Poin yang sering luput atau butuh koreksi berkala..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-blue-800 mb-1 flex items-center gap-1.5">
                  <Clock size={13} className="text-blue-600" />
                  <span>3. Rencana Tindak Lanjut & Action Plan (Next Steps)</span>
                </label>
                <textarea
                  rows={2}
                  value={noteActionPlan}
                  onChange={(e) => setNoteActionPlan(e.target.value)}
                  placeholder="Jadwal pendampingan ulang, target review mingguan..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[#96171B]" />
                  <span>4. Kesimpulan Rekomendasi Resmi Trainer (Official Diagnostic Narrative)</span>
                </label>
                <textarea
                  rows={3}
                  value={noteSummary}
                  onChange={(e) => setNoteSummary(e.target.value)}
                  placeholder="Klik tombol 'Susun Analisis Otomatis' di atas untuk mengisi narasi diagnosa komprehensif..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0">
          <div className="text-xs text-slate-600">
            Skor Akhir: <b className="text-slate-900">{finalCompositeScore}/100</b> ({calculatedStatusOjt}) • {selectedEvidenceTags.length} Bukti Tercatat
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-black bg-[#96171B] hover:bg-[#781014] text-white shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Check size={15} />
              <span>Simpan & Terbitkan Hasil Objektif</span>
            </button>
          </div>
        </div>

      </div>

      {/* MODAL AUDIT RUNUT LANGKAH PER-SOP */}
      {inspectingSop && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#96171B] text-white p-4 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded text-amber-300">
                    {inspectingSop.kode_sop}
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Audit Runtut Langkah Kerja: {inspectingSop.judul_sop}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Divisi {inspectingSop.divisi} • Target Waktu: {inspectingSop.standar_waktu || 'Standar Operasional'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingSop(null)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white cursor-pointer transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-3.5">
              {/* Poin Kritis & Alat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-black flex items-center gap-1.5 text-[11px] mb-1">
                    <AlertTriangle size={13} className="text-amber-600" />
                    <span>Poin Kritis Mutu:</span>
                  </span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {inspectingSop.poin_kritis || 'Ikuti seluruh instruksi kerja tanpa potong kompas.'}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
                  <span className="font-black flex items-center gap-1.5 text-[11px] mb-1">
                    <Wrench size={13} className="text-blue-600" />
                    <span>Standar Alat & Bahan:</span>
                  </span>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    {inspectingSop.alat_bahan || 'Peralatan resmi divisi & APD standar.'}
                  </p>
                </div>
              </div>

              {/* Step-by-Step Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">
                    Daftar {inspectingSop.langkah?.length || 0} Langkah Kerja Baku (Urutan Runtut):
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSetAllStepsForSop(inspectingSop.id, 2)}
                      className="text-[10px] font-black px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg cursor-pointer transition-all shadow-2xs flex items-center gap-1"
                    >
                      <Check size={11} className="text-emerald-700" />
                      <span>Setel Semua Runtut (100%)</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {(inspectingSop.langkah || []).map((stepText, sIdx) => {
                    const currentRating = sopStepAudit[inspectingSop.id]?.[sIdx] ?? 2;
                    return (
                      <div
                        key={sIdx}
                        className={`p-3 rounded-2xl border transition-all ${
                          currentRating === 2
                            ? 'bg-emerald-50/50 border-emerald-300'
                            : currentRating === 1
                            ? 'bg-amber-50/50 border-amber-300'
                            : 'bg-rose-50/50 border-rose-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                currentRating === 2
                                  ? 'bg-emerald-600 text-white'
                                  : currentRating === 1
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-rose-600 text-white'
                              }`}>
                                Langkah #{sIdx + 1}
                              </span>
                              <span className="text-[10.5px] font-bold text-slate-500">
                                {currentRating === 2 ? 'Sesuai & Runtut' : currentRating === 1 ? 'Ada Deviasi' : 'Terlewat / Gagal'}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                              {stepText}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                            <button
                              type="button"
                              onClick={() => handleSetStepRating(inspectingSop.id, sIdx, 2)}
                              className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-black cursor-pointer transition-all border ${
                                currentRating === 2
                                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Runtut
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStepRating(inspectingSop.id, sIdx, 1)}
                              className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-black cursor-pointer transition-all border ${
                                currentRating === 1
                                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Deviasi
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetStepRating(inspectingSop.id, sIdx, 0)}
                              className={`px-2.5 py-1.5 rounded-xl text-[10.5px] font-black cursor-pointer transition-all border ${
                                currentRating === 0
                                  ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Gagal
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Inspector */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-xs">
                <span className="text-slate-600">Kepatuhan Urutan Langkah: </span>
                <b className="text-blue-900 font-black">{getSopStepScore(inspectingSop)}%</b>
              </div>
              <button
                type="button"
                onClick={() => setInspectingSop(null)}
                className="px-5 py-2 bg-[#96171B] hover:bg-[#781014] text-white rounded-xl text-xs font-black cursor-pointer shadow-xs transition-all"
              >
                Selesai Audit Langkah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
