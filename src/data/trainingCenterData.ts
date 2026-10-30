import { Division } from '../types';

export interface TrainingStationTask {
  id: string;
  day: 1 | 2;
  station: 'Station 1' | 'Station 2' | 'Station 3' | 'All Crew';
  nama_tugas: string;
  kode_sop_ref: string;
  durasi_menit: number;
  durasi_detik: number;
  toleransi_waktu_label: string;
  min_toleransi_detik: number;
  max_toleransi_detik: number;
  divisi_terkait: Division;
  kategori_sop: string;
  is_deep_fryer: boolean; // Hanya TRUE untuk stasiun deep fryer penggorengan minyak
  is_thermal: boolean;
  target_temp?: number;
  toleransi_temp_label?: string;
  takaran_standar: string;
  is_nasi_cup?: boolean;
  is_bebas_timbangan?: boolean;
  batch_info: string;
  keterangan: string;
  alat_bahan: string;
  langkah_ringkas: string[];
}

export interface TrainingRundownSlot {
  waktu: string;
  durasi_menit: number;
  kegiatan: string;
  keterangan?: string;
}

export interface TrainingParticipantItem {
  no: number;
  nama: string;
  outlet: string;
  stasiun?: 'Station 1' | 'Station 2' | 'Station 3';
  paketMenu?: string;
  keterangan: 'New' | 'Reguler';
  divisi: Division;
  default_status: 'Onboarding' | 'OJT 30 Hari';
  nilaiBawaan?: {
    ketepatan: number; // 20%
    langkahSop: number; // 20%
    kecepatan: number; // 15%
    knowledge: number; // 15%
    kerjaSama: number; // 10%
    kebersihan: number; // 10%
    keaktifan: number; // 10%
    skorAkhir: number;
    status: 'LULUS MAHIR (GRADE A)' | 'LULUS KOMPETEN (KKM >=75)' | 'WAJIB REMEDIAL (<75)';
  };
}

/**
 * 12 PESERTA RESMI ONBOARDING TRAINING CENTER HARA CHICKEN
 * Sesuai Dokumen Fisik Agenda Training Center (Page 5 PDF)
 */
export const DAFTAR_PESERTA_ONBOARDING_TC: TrainingParticipantItem[] = [
  {
    no: 1,
    nama: 'Haudy Rizky',
    outlet: 'Gito Gati',
    stasiun: 'Station 1',
    paketMenu: 'Nasi 4 Cup, Teh 10L, Sup Sayur, Geprek Ori',
    keterangan: 'New',
    divisi: 'Kitchen',
    default_status: 'Onboarding',
    nilaiBawaan: { ketepatan: 85, langkahSop: 85, kecepatan: 85, knowledge: 85, kerjaSama: 85, kebersihan: 90, keaktifan: 85, skorAkhir: 86.0, status: 'LULUS MAHIR (GRADE A)' }
  },
  {
    no: 2,
    nama: 'Vino Adrian Saputra',
    outlet: 'Glagahsari',
    stasiun: 'Station 2',
    paketMenu: 'Goreng Ayam, Scrembel, Spinach, Indomie, Nashville',
    keterangan: 'New',
    divisi: 'Kitchen',
    default_status: 'Onboarding',
    nilaiBawaan: { ketepatan: 82, langkahSop: 80, kecepatan: 80, knowledge: 82, kerjaSama: 85, kebersihan: 84, keaktifan: 82, skorAkhir: 82.2, status: 'LULUS KOMPETEN (KKM >=75)' }
  },
  {
    no: 3,
    nama: 'Salwa Salsabila',
    outlet: 'Borobudur',
    stasiun: 'Station 3',
    paketMenu: 'Goreng Terong, Sambal, Nasgor Geprek, Keju Parut',
    keterangan: 'New',
    divisi: 'Geprek',
    default_status: 'Onboarding',
    nilaiBawaan: { ketepatan: 84, langkahSop: 82, kecepatan: 80, knowledge: 82, kerjaSama: 84, kebersihan: 86, keaktifan: 84, skorAkhir: 83.1, status: 'LULUS KOMPETEN (KKM >=75)' }
  },
  {
    no: 4,
    nama: 'Evanda Nur Meilita',
    outlet: 'Pandega',
    stasiun: 'Station 1',
    paketMenu: 'Nasi 4 Cup, Teh 10L, Milkshake',
    keterangan: 'New',
    divisi: 'Kasir',
    default_status: 'Onboarding',
    nilaiBawaan: { ketepatan: 88, langkahSop: 86, kecepatan: 85, knowledge: 86, kerjaSama: 88, kebersihan: 90, keaktifan: 86, skorAkhir: 87.0, status: 'LULUS MAHIR (GRADE A)' }
  },
  {
    no: 5,
    nama: 'Mahfud Attoriq',
    outlet: 'Pandowoharjo',
    stasiun: 'Station 2',
    paketMenu: 'Goreng Ayam, Indomie, Mentai',
    keterangan: 'New',
    divisi: 'Kitchen',
    default_status: 'Onboarding',
    nilaiBawaan: { ketepatan: 80, langkahSop: 78, kecepatan: 76, knowledge: 78, kerjaSama: 82, kebersihan: 80, keaktifan: 80, skorAkhir: 79.1, status: 'LULUS KOMPETEN (KKM >=75)' }
  },
  {
    no: 6,
    nama: 'Davi Dwi Eriyanto',
    outlet: 'Jambon',
    stasiun: 'Station 3',
    paketMenu: 'Sambal Bawang, Geprek Ayoli',
    keterangan: 'New',
    divisi: 'Geprek',
    default_status: 'Onboarding',
    nilaiBawaan: { ketepatan: 82, langkahSop: 80, kecepatan: 78, knowledge: 80, kerjaSama: 83, kebersihan: 85, keaktifan: 82, skorAkhir: 81.5, status: 'LULUS KOMPETEN (KKM >=75)' }
  },
  {
    no: 7,
    nama: 'Dimas Mahardika',
    outlet: 'Purworejo',
    stasiun: 'Station 1',
    paketMenu: 'Nasi 4 Cup, Teh 10L, Sup Sayur',
    keterangan: 'New',
    divisi: 'Kitchen',
    default_status: 'Onboarding',
    nilaiBawaan: { ketepatan: 85, langkahSop: 84, kecepatan: 82, knowledge: 83, kerjaSama: 85, kebersihan: 88, keaktifan: 84, skorAkhir: 84.4, status: 'LULUS KOMPETEN (KKM >=75)' }
  },
  {
    no: 8,
    nama: 'Muhammad Nadziiful Affan',
    outlet: 'Sorogenen',
    stasiun: 'Station 2',
    paketMenu: 'Goreng Ayam, Krisbar, Nashville',
    keterangan: 'New',
    divisi: 'Kitchen',
    default_status: 'Onboarding',
    nilaiBawaan: { ketepatan: 86, langkahSop: 85, kecepatan: 84, knowledge: 85, kerjaSama: 87, kebersihan: 89, keaktifan: 86, skorAkhir: 86.0, status: 'LULUS MAHIR (GRADE A)' }
  },
  {
    no: 9,
    nama: 'Kevin Irawan',
    outlet: 'Monjali',
    stasiun: 'Station 3',
    paketMenu: 'Goreng Terong, Sambal Matah',
    keterangan: 'New',
    divisi: 'Geprek',
    default_status: 'Onboarding',
    nilaiBawaan: { ketepatan: 81, langkahSop: 80, kecepatan: 78, knowledge: 80, kerjaSama: 82, kebersihan: 84, keaktifan: 81, skorAkhir: 80.9, status: 'LULUS KOMPETEN (KKM >=75)' }
  },
  {
    no: 10,
    nama: 'Dhiya Aida Yumna',
    outlet: 'Support Mobile Outlet',
    stasiun: 'Station 1',
    paketMenu: 'Milkshake, Teh 8L, Kasir 5S',
    keterangan: 'New',
    divisi: 'Kasir',
    default_status: 'Onboarding',
    nilaiBawaan: { ketepatan: 90, langkahSop: 88, kecepatan: 86, knowledge: 88, kerjaSama: 90, kebersihan: 92, keaktifan: 88, skorAkhir: 88.9, status: 'LULUS MAHIR (GRADE A)' }
  },
  {
    no: 11,
    nama: 'Alinzki Ridha Pratama',
    outlet: 'Lempong (Area Godean)',
    stasiun: 'Station 2',
    paketMenu: 'Goreng Ayam, Indomie, Mentai',
    keterangan: 'New',
    divisi: 'Kitchen',
    default_status: 'Onboarding',
    nilaiBawaan: { ketepatan: 83, langkahSop: 82, kecepatan: 80, knowledge: 82, kerjaSama: 85, kebersihan: 86, keaktifan: 83, skorAkhir: 83.2, status: 'LULUS KOMPETEN (KKM >=75)' }
  },
  {
    no: 12,
    nama: 'Edvin Perdana Yulianto',
    outlet: 'Kamdanen',
    stasiun: 'Station 3',
    paketMenu: 'Goreng Terong, Sambal Bawang, Geprek',
    keterangan: 'New',
    divisi: 'Geprek',
    default_status: 'Onboarding',
    nilaiBawaan: { ketepatan: 85, langkahSop: 84, kecepatan: 82, knowledge: 83, kerjaSama: 86, kebersihan: 88, keaktifan: 85, skorAkhir: 84.8, status: 'LULUS KOMPETEN (KKM >=75)' }
  },
  {
    no: 13,
    nama: 'Sigit Nur Prasetyo',
    outlet: 'Kamdanen',
    stasiun: 'Station 1',
    paketMenu: 'Nasi 4 Cup, Teh 10L, Sup Sayur',
    keterangan: 'New',
    divisi: 'Kitchen',
    default_status: 'Onboarding',
    nilaiBawaan: { ketepatan: 82, langkahSop: 80, kecepatan: 79, knowledge: 81, kerjaSama: 84, kebersihan: 85, keaktifan: 82, skorAkhir: 82.0, status: 'LULUS KOMPETEN (KKM >=75)' }
  },
];

/**
 * DAFTAR TUGAS STATION & TIMER RESMI DARI AGENDA TRAINING CENTER
 * STRICT SESUAI DOKUMEN SOP RESMI HARA CHICKEN INDONESIA
 * Tidak ada produk digabung (Scramble mandiri, Indomie mandiri, Nashville mandiri).
 * Suhu 160°C hanya eksklusif untuk stasiun Deep Fryer.
 */
export const AGENDA_STATION_TASKS: TrainingStationTask[] = [
  // ==========================================
  // DAY 1: STATION 1
  // ==========================================
  {
    id: 'd1-st1-nasi',
    day: 1,
    station: 'Station 1',
    nama_tugas: 'Nasi 4 Cup',
    kode_sop_ref: 'HC-SOP-KIT-01',
    durasi_menit: 35,
    durasi_detik: 35 * 60,
    toleransi_waktu_label: '35 Menit (Toleransi 30–40 mnt)',
    min_toleransi_detik: 30 * 60,
    max_toleransi_detik: 40 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Masak',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Beras Miyako 4 Cup : Air 5 Cup. 1 Centong standar saji tanpa timbang gram.',
    is_nasi_cup: true,
    batch_info: 'Batch 1 (40 mnt) / Batch 2 (30-40 mnt)',
    keterangan: 'SOP Nasi: Takar 4 cup beras Miyako, cuci 3x hingga jernih, air rasio 4:5, tanak rice cooker gas sampai tombol COOK naik, diamkan 15 mnt.',
    alat_bahan: 'Rice Cooker Gas, Centong Anti-Lengket, Cup Takar Miyako, Wadah Cuci Beras',
    langkah_ringkas: [
      'Ambil 4 cup beras merk Miyako, cuci minimal 3 kali bilas hingga air jernih.',
      'Masukkan beras ke wadah rice cooker gas, tambahkan air dengan rasio baku 4 cup beras : 5 cup air.',
      'Buka saluran gas, tekan tombol api kecil (kiri), lalu tekan tombol COOK ke bawah (kanan).',
      'Tunggu tombol COOK kembali ke posisi semula (berbunyi naik).',
      'Biarkan 15 menit agar tanak sempurna, pindahkan ke magicom hangat, saji dengan centong standar bulat rapi.'
    ]
  },
  {
    id: 'd1-st1-teh',
    day: 1,
    station: 'Station 1',
    nama_tugas: 'Teh (10lt)',
    kode_sop_ref: 'HC-SOP-KIT-02',
    durasi_menit: 40,
    durasi_detik: 40 * 60,
    toleransi_waktu_label: '40 Menit (Toleransi 35–45 mnt)',
    min_toleransi_detik: 35 * 60,
    max_toleransi_detik: 45 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Beverage & Station',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Air 10 Liter + Teh Seduh HARA + Sirup Gula Standar.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'SOP Teh: Rebus air sampai mendidih, seduh daun teh harum, saring kain bersih, tuang ke dispenser 10L.',
    alat_bahan: 'Panci Stainless Steel, Kain Saringan Teh, Pengaduk, Dispenser Teh 10L',
    langkah_ringkas: [
      'Rebus air bersih di panci stainless steel hingga mendidih.',
      'Masukkan racikan teh wangi HARA, tutup panci rapat selama 15 menit.',
      'Saring ampas teh menggunakan kain saringan bersih higienis.',
      'Campur gula cair standar, aduk larut merata, tuangkan ke dispenser teh 10L.'
    ]
  },
  {
    id: 'd1-st1-sup',
    day: 1,
    station: 'Station 1',
    nama_tugas: 'Sup Sayur',
    kode_sop_ref: 'HC-SOP-KIT-03',
    durasi_menit: 40,
    durasi_detik: 40 * 60,
    toleransi_waktu_label: '40 Menit (Toleransi 35–45 mnt)',
    min_toleransi_detik: 35 * 60,
    max_toleransi_detik: 45 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Sup',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Kaldu ayam gurih + potongan wortel, buncis, seledri segar.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'SOP Sup Sayur: Masak kuah kaldu rempah, masukkan wortel dan sayuran segar, simpan di warmer.',
    alat_bahan: 'Panci Sup, Sendok Sayur, Warmer Display, Talenan & Pisau',
    langkah_ringkas: [
      'Didihkan kaldu ayam beraroma rempah bawang wangi.',
      'Masukkan potongan wortel segar lebih awal hingga setengah matang.',
      'Masukkan buncis dan kol, koreksi rasa gurih lembut khas HARA.',
      'Pindahkan ke panci soup warmer holding display (suhu saji hangat).'
    ]
  },
  {
    id: 'd1-st1-geprek-ori',
    day: 1,
    station: 'Station 1',
    nama_tugas: 'Geprek Ori',
    kode_sop_ref: 'HC-SOP-GPK-01',
    durasi_menit: 2,
    durasi_detik: 2 * 60,
    toleransi_waktu_label: '2 Menit (Toleransi 90–150 dtk)',
    min_toleransi_detik: 90,
    max_toleransi_detik: 150,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek & Sambal',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Cabai rawit sesuai level + garam mix + siram minyak panas wangi 1 sendok sayur.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'SOP Geprek Ori: Ulek kasar cabai rawit di cobek fresh, siram minyak panas 1 sendok sayur, geprek ayam 2x ketukan mantap.',
    alat_bahan: 'Cobek Batu, Ulekan, Sendok Sayur Minyak Panas, Piring Rotan & Kertas Nasi',
    langkah_ringkas: [
      'Ambil cabai rawit merah segar & garam mix di cobek batu sesuai level pedas.',
      'Ulek kasar berkarakter dalam waktu < 45 detik (tidak halus jus).',
      'Siram minyak panas wangi bawang 1 sendok sayur hingga aroma harum keluar.',
      'Letakkan ayam krispi panas, geprek 2x ketukan mantap (jangan hancur lebur).',
      'Plating rapi di piring rotan beralas kertas minyak bersama 2 slice timun miring.'
    ]
  },
  {
    id: 'd1-st1-krisbar',
    day: 1,
    station: 'Station 1',
    nama_tugas: 'Krisbar Geprek',
    kode_sop_ref: 'HC-SOP-GPK-03',
    durasi_menit: 7,
    durasi_detik: 7 * 60,
    toleransi_waktu_label: '7 Menit (Toleransi 6–8 mnt)',
    min_toleransi_detik: 6 * 60,
    max_toleransi_detik: 8 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek & Bakar',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Olesan bumbu krisbar gurih manis + sambal geprek.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'SOP Krisbar: Olesi bumbu bakar manis gurih HARA, panggang hingga karamelisasi harum, geprek.',
    alat_bahan: 'Pemanggang/Grill, Kuas Oles Bumbu, Jepitan, Cobek Sambal',
    langkah_ringkas: [
      'Ambil ayam krispi matang, olesi bumbu krisbar gurih manis merata.',
      'Panggang di atas grill selama 3-4 menit hingga bumbu meresap berkaramelisasi.',
      'Geprek bersama sambal khas Krisbar di cobek.',
      'Sajikan harum smokey dengan garnish timun segar.'
    ]
  },
  {
    id: 'd1-st1-geprek-moza',
    day: 1,
    station: 'Station 1',
    nama_tugas: 'Geprek Mozarella',
    kode_sop_ref: 'HC-SOP-GPK-04',
    durasi_menit: 10,
    durasi_detik: 10 * 60,
    toleransi_waktu_label: '10 Menit (Toleransi 8–12 mnt)',
    min_toleransi_detik: 8 * 60,
    max_toleransi_detik: 12 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek Topping',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Keju Mozarella serut porsi standar 35g, torch merata mulur.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'SOP Mozarella: Tabur keju mozarella serut merata di atas ayam geprek, torch api sedang hingga meleleh mulur.',
    alat_bahan: 'Gas Torch, Piring Tahan Panas, Keju Mozarella Serut 35g, Jepitan',
    langkah_ringkas: [
      'Geprek ayam krispi dengan sambal pesanan.',
      'Taburkan keju mozarella serut 35g secara merata menutupi permukaan ayam.',
      'Nyalakan gas torch api sedang, arahkan jarak 10–12 cm dengan gerakan memutar stabil.',
      'Lumerkan hingga keju meleleh mulur mengilap dengan semburat kecokelatan wangi.'
    ]
  },

  // ==========================================
  // DAY 1: STATION 2
  // ==========================================
  {
    id: 'd1-st2-goreng-ayam',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Goreng Ayam',
    kode_sop_ref: 'HC-SOP-KIT-04',
    durasi_menit: 20,
    durasi_detik: 20 * 60,
    toleransi_waktu_label: '20 Menit Siklus Batch (Toleransi 18–22 mnt)',
    min_toleransi_detik: 18 * 60,
    max_toleransi_detik: 22 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Frying',
    is_deep_fryer: true, // WAJIB SUHU DEEP FRYER 160°C
    is_thermal: true,
    target_temp: 160,
    toleransi_temp_label: 'Deep Fryer 160°C / Kompor 175°C (Core Ayam ≥ 74°C)',
    takaran_standar: '1 Keranjang Deep Fryer (Maksimal 20 potong ayam).',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'SOP Penggorengan: Suhu minyak deep fryer tepat 160°C (kompor 175°C), penepungan 2x celup, timer goreng 12 menit, tiriskan 2 mnt, core temp ayam ≥ 74°C.',
    alat_bahan: 'Mesin Deep Fryer, Termometer Probe Suhu, Timer, Keranjang Fryer, Breader Box, Wadah Celupan Es',
    langkah_ringkas: [
      'Verifikasi suhu minyak deep fryer tepat 160°C (kompor 175°C) menggunakan probe termometer.',
      'Lakukan penepungan pertama (aduk putar 10x ringan mengambang tidak ditekan padat).',
      'Celupkan ayam ke air es bersih selama 3 detik, angkat dan tiriskan.',
      'Lakukan penepungan kedua hingga terbentuk serpihan keriting krispi alami.',
      'Masukkan ayam ke minyak panas, pasang timer fryer 12 menit, goyang keranjang di menit ke-3.',
      'Angkat keranjang saat timer berbunyi, tiriskan 2 menit, pindahkan ke holding warmer (core temp ≥ 74°C).'
    ]
  },
  {
    id: 'd1-st2-scramble',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Scramble Egg (Scrembel)',
    kode_sop_ref: 'HC-SOP-KIT-14',
    durasi_menit: 5,
    durasi_detik: 5 * 60,
    toleransi_waktu_label: '5 Menit (Toleransi 4–6 mnt)',
    min_toleransi_detik: 4 * 60,
    max_toleransi_detik: 6 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Masak',
    is_deep_fryer: false, // BEBAS SUHU 160°C (BUKAN DEEP FRYER)
    is_thermal: false,
    takaran_standar: '1 Butir telur ayam + 1 sdm susu UHT + garam mix 1/4g + 3 sdm minyak goreng baru di wajan.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'SOP Scramble (Mandiri, Tanpa Indomie): Pecahkan 1 telur, kocok rata bersama garam mix & susu UHT, masak di wajan api sedang sambil diaduk terus berbutir lembut (1 butir = 2 porsi scramble).',
    alat_bahan: 'Wajan/Pan Datar, Mangkok, Susu UHT, Telur Ayam, Garam Mix, Spatula, Toples Scramble',
    langkah_ringkas: [
      'Pecahkan 1 butir telur ayam ke mangkuk bersih.',
      'Tambahkan mix garam 1/4 gr (sendok takar) dan 1 sdm susu UHT.',
      'Kocok telur sampai tercampur merata.',
      'Panaskan 3 sdm minyak goreng baru di wajan dengan api sedang.',
      'Masukkan kocokan telur, masak sambil diaduk terus menerus sampai matang berbutir scramble lembut.',
      '1 butir telur menghasilkan 2 porsi scramble egg; masukkan toples display warmer ayam bagian bawah.'
    ]
  },
  {
    id: 'd1-st2-indomie',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Indomie',
    kode_sop_ref: 'HC-SOP-KIT-25',
    durasi_menit: 10,
    durasi_detik: 10 * 60,
    toleransi_waktu_label: '10 Menit (Toleransi 8–12 mnt)',
    min_toleransi_detik: 8 * 60,
    max_toleransi_detik: 12 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Masak',
    is_deep_fryer: false, // BEBAS SUHU 160°C (BUKAN DEEP FRYER)
    is_thermal: false,
    takaran_standar: '1 Bungkus Indomie + 500 ml air rebusan mendidih dalam panci mie.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'SOP Indomie (Mandiri, Tanpa Telur): Rebus 500 ml air mendidih, masukkan mie rebus 2 menit kenyal pas al dente, tiriskan, aduk rata bersama bumbu.',
    alat_bahan: 'Panci Rebus Mie, Saringan Mie, Piring Extra / Box Kecil, Sendok Garpu',
    langkah_ringkas: [
      'Rebus 500 ml air bersih sampai mendidih dalam panci mie.',
      'Masukkan 1 bungkus mie ke dalam air mendidih.',
      'Masak dan diamkan selama tepat 2 menit sampai kematangan pas (tidak lembek/overcooked).',
      'Siapkan bumbu indomie di piring (dine in) atau mangkok/box (take away).',
      'Saring dan tiriskan mie, campurkan ke dalam piring bumbu.',
      'Aduk mie dan bumbu sampai tercampur merata, sajikan hangat.'
    ]
  },
  {
    id: 'd1-st2-nashville',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Nashville',
    kode_sop_ref: 'HC-SOP-GPK-06',
    durasi_menit: 2,
    durasi_detik: 2 * 60,
    toleransi_waktu_label: '2 Menit (Toleransi 90–150 dtk)',
    min_toleransi_detik: 90,
    max_toleransi_detik: 150,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek & Nashville',
    is_deep_fryer: false, // BEBAS SUHU 160°C (BUKAN DEEP FRYER)
    is_thermal: false,
    takaran_standar: 'Bumbu celup rempah Nashville 30g + boncabe 1g + label level kepedasan.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'SOP Nashville (Mandiri): Celup ayam krispi ke bumbu rempah Nashville 1 menit, tiriskan, tabur boncabe 1g, bungkus rapi dengan alas plastik nashville dan tempel stiker level.',
    alat_bahan: 'Wadah Stainless Bumbu, Jepitan, Boncabe 1g, Plastik Alas Nashville, Label Level (Biru/Kuning/Merah)',
    langkah_ringkas: [
      'Ambil 1 pcs ayam krispi potong hangat sesuai pesanan.',
      'Siapkan bumbu celup rempah Nashville (30 gr) sesuai level kepedasan, aduk homogen.',
      'Celup ayam ke bumbu, diamkan selama 1 menit lalu tiriskan sampai minyak berkurang.',
      'Taburkan 1 gr boncabe di atas ayam secara merata.',
      'Alas box take away dengan 1 lembar plastik alas nashville, tata ayam rapi.',
      'Tempel stiker label level kepedasan (Biru: Lv 1, Kuning: Lv 2, Merah: Lv 3).'
    ]
  },
  {
    id: 'd1-st2-spinach',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Spinach',
    kode_sop_ref: 'HC-SOP-KIT-13',
    durasi_menit: 40,
    durasi_detik: 40 * 60,
    toleransi_waktu_label: '40 Menit Batch Sesi (Goreng 90 Detik)',
    min_toleransi_detik: 35 * 60,
    max_toleransi_detik: 45 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Frying',
    is_deep_fryer: false, // Wajan minyak sedang 500ml, bukan deep fryer utama
    is_thermal: false,
    takaran_standar: '100g daun bayam petik iris tipis + 500ml minyak wajan + bumbu kentang 2.5g.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'SOP Bayam Goreng Spinach: Iris tipis 100g bayam petik, panaskan 500ml minyak di wajan api sedang, goreng 90 detik kering krispi, tiriskan, campur bumbu kentang 2.5g.',
    alat_bahan: 'Wajan, Saringan Minyak, Daun Bayam Petik 100g, Bumbu Kentang 2.5g, Toples Display Warmer',
    langkah_ringkas: [
      'Cuci bersih 100 gr daun bayam petik segar.',
      'Rajang atau iris tipis-tipis daun bayam petik.',
      'Panaskan 500 ml minyak di wajan dengan api sedang.',
      'Setelah panas, masukkan irisan daun bayam petik, goreng selama 90 detik (1,5 menit) sampai kering krispi.',
      'Angkat lalu tiriskan minyak sampai tuntas.',
      'Campur dengan bumbu kentang 1/2 sdt (2,5 gr), simpan toples display warmer ayam bagian bawah.'
    ]
  },
  {
    id: 'd1-st2-mentai-krispi',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Mentai Krispi',
    kode_sop_ref: 'HC-SOP-GPK-05',
    durasi_menit: 5,
    durasi_detik: 5 * 60,
    toleransi_waktu_label: '5 Menit (Toleransi 4–6 mnt)',
    min_toleransi_detik: 4 * 60,
    max_toleransi_detik: 6 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek & Mentai',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Saus Mentai HARA 30g + Torch kilat 15-20 detik.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'SOP Saus Mentai: Semprotkan saus mentai zig-zag rapi di atas ayam krispi, torch api sedang hingga harum smokey.',
    alat_bahan: 'Botol Saus Mentai 30g, Gas Torch, Piring Saji',
    langkah_ringkas: [
      'Siapkan ayam krispi hangat di piring saji.',
      'Tuang saus mentai zig-zag rapi menutupi bagian atas ayam krispi.',
      'Torch cepat 15–20 detik menggunakan api sedang hingga beraroma smokey wangi.',
      'Sajikan segera selagi saus mentai hangat.'
    ]
  },
  {
    id: 'd1-st2-geprek-mentai',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Geprek Mentai',
    kode_sop_ref: 'HC-SOP-GPK-05',
    durasi_menit: 7,
    durasi_detik: 7 * 60,
    toleransi_waktu_label: '7 Menit (Toleransi 6–8 mnt)',
    min_toleransi_detik: 6 * 60,
    max_toleransi_detik: 8 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek & Mentai',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Ayam Geprek + Saus Mentai 30g + Torch.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'SOP Geprek Mentai: Geprek ayam bersama sambal cobek, siram saus mentai tebal, torch harum.',
    alat_bahan: 'Cobek Batu, Saus Mentai, Gas Torch, Piring Saji',
    langkah_ringkas: [
      'Geprek ayam krispi bersama sambal tingkat kepedasan pesanan tamu di cobek.',
      'Pindahkan ayam geprek ke piring saji.',
      'Semprotkan saus mentai secara melimpah di atas ayam geprek.',
      'Torch menggunakan api sedang hingga saus sedikit berkaramelisasi harum.'
    ]
  },
  {
    id: 'd1-st2-krisbar-ayoli',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Krisbar Ori & Krispi Ayoli',
    kode_sop_ref: 'HC-SOP-GPK-09',
    durasi_menit: 8,
    durasi_detik: 8 * 60,
    toleransi_waktu_label: '8 Menit (Toleransi 7–9 mnt)',
    min_toleransi_detik: 7 * 60,
    max_toleransi_detik: 9 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek & Sauce',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Ayam bakar krisbar + saus ayoli gurih creamy 25ml.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'SOP Saus Ayoli Krisbar: Bakar ayam krispi bumbu bakar, siram saus ayoli creamy bawang putih gurih.',
    alat_bahan: 'Grill Panggangan, Botol Saus Ayoli, Kuas Oles, Piring Saji',
    langkah_ringkas: [
      'Panggang ayam krispi dengan olesan bumbu bakar manis pedas hingga karamel.',
      'Geprek ringan agar bumbu meresap ke serat daging ayam.',
      'Tuangkan saus ayoli creamy gurih zig-zag di atas ayam.',
      'Sajikan segera ke counter pesanan.'
    ]
  },

  // ==========================================
  // DAY 1: STATION 3
  // ==========================================
  {
    id: 'd1-st3-terong',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Terong',
    kode_sop_ref: 'HC-SOP-KIT-11',
    durasi_menit: 25,
    durasi_detik: 25 * 60,
    toleransi_waktu_label: '25 Menit (Toleransi 22–28 mnt)',
    min_toleransi_detik: 22 * 60,
    max_toleransi_detik: 28 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Side Dish',
    is_deep_fryer: true, // DEEP FRYER 150°C
    is_thermal: true,
    target_temp: 150,
    toleransi_temp_label: 'Deep Fryer 150°C (Marinasi 10 mnt, Goreng 5 mnt)',
    takaran_standar: 'Terong ungu dipotong serong tebal 1.5 cm + marinasi 10 mnt.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'SOP Terong Krispi: Cuci terong, potong serong 1.5 cm, marinasi 10 mnt, balur tepung breader, goreng di Deep Fryer 150°C selama 5 mnt hingga kuning keemasan renyah luar lembut dalam.',
    alat_bahan: 'Deep Fryer 150°C, Pisau, Talenan, Keranjang Fryer, Tepung Breader, Piring Saji',
    langkah_ringkas: [
      'Cuci bersih terong ungu segar di bawah air mengalir.',
      'Potong serong dengan ketebalan 1.5 cm merata (marinasi 10 menit).',
      'Balur ke tepung breader krispi HARA tipis merata.',
      'Goreng di minyak deep fryer suhu 150°C selama 5 menit hingga warna kuning keemasan mekar.',
      'Angkat keranjang, tiriskan hingga bebas minyak berlebih, sajikan krispi renyah.'
    ]
  },
  {
    id: 'd1-st3-sambal',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Sambal (1 Variant)',
    kode_sop_ref: 'HC-SOP-GPK-02',
    durasi_menit: 30,
    durasi_detik: 30 * 60,
    toleransi_waktu_label: '30 Menit (Toleransi 25–35 mnt)',
    min_toleransi_detik: 25 * 60,
    max_toleransi_detik: 35 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Sambal & Prep',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Cabai rawit merah 150g + baput 35g (goreng 3-5 mnt) + 7g garam + 60ml minyak panas, 30g/porsi.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'SOP Sambal Bawang: 150g cabai + 35g baput goreng 3-5 mnt, uleg kasar di cobek + 7g garam + 60ml minyak panas, 30g per porsi (Dilarang diblender).',
    alat_bahan: 'Cobek Batu Besar, Ulekan Batu, Timbangan Gram Zero/Tare, Wadah Stainless Sambal',
    langkah_ringkas: [
      'Pilih cabai rawit merah segar 150g dan bawang putih 35g, bersihkan tangkai.',
      'Goreng cabai dan baput selama 3–5 menit dalam minyak panas.',
      'Ulek kasar di cobek batu bersama 7g garam mix HARA (Kill-Switch: DILARANG diblender!).',
      'Siram 60 ml minyak panas berkualitas, aduk rata aroma wangi, sajikan standar 30g/porsi.'
    ]
  },
  {
    id: 'd1-st3-kulit',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Goreng Kulit',
    kode_sop_ref: 'HC-SOP-KIT-02',
    durasi_menit: 45,
    durasi_detik: 45 * 60,
    toleransi_waktu_label: '45 Menit (Toleransi 40–50 mnt)',
    min_toleransi_detik: 40 * 60,
    max_toleransi_detik: 50 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Frying',
    is_deep_fryer: true, // DEEP FRYER 150°C
    is_thermal: true,
    target_temp: 150,
    toleransi_temp_label: 'Deep Fryer 150°C (Mentah 50g -> Matang 60g, 12 mnt)',
    takaran_standar: 'Kulit ayam mentah 50g dipotong 4x4 cm -> hasil goreng krispi matang 60g (12 mnt).',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'SOP Menggoreng Kulit: Bersihkan lemak, potong 4x4 cm, penepungan tipis, goreng di deep fryer suhu 150°C selama 12 mnt agar mekar garing tahan lama (mentah 50g -> matang 60g).',
    alat_bahan: 'Deep Fryer 150°C, Pisau, Talenan, Keranjang Peniris, Tepung Bumbu Kulit, Timbangan',
    langkah_ringkas: [
      'Bersihkan lemak berlebih pada kulit ayam mentah, timbang 50 gr.',
      'Potong kulit ayam ukuran seragam 4x4 cm.',
      'Balur ke dalam tepung bumbu tipis merata tanpa menggumpal.',
      'Goreng di deep fryer suhu 150°C selama 12 menit sambil dibalik berkala agar tidak menempel.',
      'Angkat saat buih minyak mengecil dan warna cokelat keemasan mekar garing (target matang 60g).'
    ]
  },
  {
    id: 'd1-st3-nasgor-geprek',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Nasi Goreng Revisi 02',
    kode_sop_ref: 'HC-SOP-KIT-24',
    durasi_menit: 15,
    durasi_detik: 15 * 60,
    toleransi_waktu_label: '15 Menit (Toleransi 12–18 mnt)',
    min_toleransi_detik: 12 * 60,
    max_toleransi_detik: 18 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Wok',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Nasi 170g (wajib timbang) + Bumbu ECO 20g (wajib timbang) + 15ml minyak + 30g mix sayur + Telur Dadar + 2 slice timun.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'SOP Nasi Goreng Revisi 02: Wajib timbang Nasi 170g & Bumbu ECO 20g (Zero/Tare). Panaskan 15ml minyak di wok, tumis sayur 30g & bumbu ECO 20g, masukkan nasi 170g aduk cepat, topping telur dadar & 2 slice timun.',
    alat_bahan: 'Timbangan Digital Zero/Tare, Wajan Wok, Spatula Wok, Kompor Gas Wok, Piring Saji',
    langkah_ringkas: [
      'Wajib timbang Zero/Tare: Nasi putih 170g dan Bumbu ECO 20g (Kill-Switch jika tidak menimbang).',
      'Panaskan 15 ml minyak di wajan wok dengan api sedang.',
      'Tumis mix sayur 30 gr dan bumbu ECO 20 gr hingga harum sedap.',
      'Masukkan nasi 170 gr, aduk cepat dengan spatula hingga bulir nasi terpisah dan bumbu merata.',
      'Plating rapi dengan telur dadar dan 2 slice timun segar.'
    ]
  },
  {
    id: 'd1-st3-keju-parut',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Keju Parut',
    kode_sop_ref: 'HC-SOP-GPK-04',
    durasi_menit: 5,
    durasi_detik: 5 * 60,
    toleransi_waktu_label: '5 Menit (Toleransi 4–6 mnt)',
    min_toleransi_detik: 4 * 60,
    max_toleransi_detik: 6 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek Topping',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Keju cheddar blok diparut panjang halus (20g).',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'SOP Keju Parut: Posisikan parutan keju tepat di atas ayam geprek, parut tarikan panjang lurus menghasilkan gunungan serut rapi.',
    alat_bahan: 'Parutan Keju Stainless, Keju Cheddar Blok, Piring Saji',
    langkah_ringkas: [
      'Geprek ayam krispi bersama sambal pesanan.',
      'Posisikan parutan keju tepat di atas ayam geprek.',
      'Parut keju dengan tarikan panjang lurus menghasilkan gunungan serut keju rapi.',
      'Sajikan rapi bersama lalapan segar.'
    ]
  },
  {
    id: 'd1-st3-geprek-ayoli',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Geprek Ayoli',
    kode_sop_ref: 'HC-SOP-GPK-09',
    durasi_menit: 5,
    durasi_detik: 5 * 60,
    toleransi_waktu_label: '5 Menit (Toleransi 4–6 mnt)',
    min_toleransi_detik: 4 * 60,
    max_toleransi_detik: 6 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek Sauce',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Saus ayoli creamy gurih 25ml di atas ayam geprek.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'SOP Geprek Ayoli: Geprek ayam hangat, tuang saus ayoli gurih lembut dengan gerakan zig-zag merata.',
    alat_bahan: 'Cobek Batu, Botol Saus Ayoli 25ml, Piring Saji',
    langkah_ringkas: [
      'Geprek ayam krispi hangat di cobek batu bersama sambal.',
      'Pindahkan ayam geprek ke wadah saji.',
      'Tuangkan saus ayoli dengan gerakan zig-zag menarik.',
      'Sajikan segera ke meja atau counter pick-up.'
    ]
  },
  {
    id: 'd1-st3-ayam-utuh',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Goreng Ayam Utuh (Knowledge)',
    kode_sop_ref: 'HC-SOP-KIT-15',
    durasi_menit: 25,
    durasi_detik: 25 * 60,
    toleransi_waktu_label: '25 Menit (Materi Knowledge & Demo)',
    min_toleransi_detik: 20 * 60,
    max_toleransi_detik: 30 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen Knowledge',
    is_deep_fryer: true,
    is_thermal: true,
    target_temp: 150,
    toleransi_temp_label: 'Deep Fryer 150°C (12 mnt, bolak-balik tiap 3 mnt)',
    takaran_standar: '1 Ekor karkas ayam utuh marinasi standar HARA.',
    is_bebas_timbangan: true,
    batch_info: 'Knowledge Sesi',
    keterangan: 'SOP Knowledge Ayam Utuh: Pahami anatomi potong 9 karkas, marinasi 12-24 jam di chiller 1-4°C, dan teknik penggorengan karkas utuh suhu 150°C (12 menit, bolak-balik tiap 3 menit) matang ke tulang.',
    alat_bahan: 'Karkas Ayam Utuh, Wadah Marinasi Chiller, Deep Fryer 150°C, Pisau Potong 9 Bagian',
    langkah_ringkas: [
      'Pahami spesifikasi berat karkas ayam standar HARA.',
      'Pelajari teknik pemotongan presisi 9 bagian (dada, paha atas, paha bawah, sayap).',
      'Pahami batas holding time marinasi 12–24 jam pada suhu chiller 1–4°C.',
      'Penggorengan suhu 150°C selama 12 menit dengan bolak-balik tiap 3 menit agar matang sempurna.'
    ]
  },

  // ==========================================
  // DAY 2: STATION 1, 2, 3 & ALL CREW
  // ==========================================
  {
    id: 'd2-st1-nasi-45',
    day: 2,
    station: 'Station 1',
    nama_tugas: 'Nasi 4 cup (Day 2)',
    kode_sop_ref: 'HC-SOP-KIT-01',
    durasi_menit: 45,
    durasi_detik: 45 * 60,
    toleransi_waktu_label: '45 Menit (Toleransi 40–50 mnt)',
    min_toleransi_detik: 40 * 60,
    max_toleransi_detik: 50 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Masak',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: '4 Cup beras Miyako : 5 Cup air baku. Centong porsi standar tanpa timbang gram.',
    is_nasi_cup: true,
    batch_info: 'Batch 1 & 2 Day 2',
    keterangan: 'SOP Nasi Lanjutan Day 2: Uji konsistensi tekstur pulen, kepatuhan rasio cup Miyako, dan kecepatan porsi saji tanpa timbang gram.',
    alat_bahan: 'Rice Cooker Gas, Centong Anti-Lengket, Cup Takar Miyako, Magicom Warmer',
    langkah_ringkas: [
      'Takar beras 4 cup Miyako presisi bibir cup.',
      'Cuci 3x bilasan hingga air jernih.',
      'Takar air baku 5 cup.',
      'Nyalakan api rice cooker gas hingga matang.',
      'Aduk balik nasi setelah tanak agar uap air merata, simpan di magicom.'
    ]
  },
  {
    id: 'd2-st1-goreng-kulit',
    day: 2,
    station: 'Station 1',
    nama_tugas: 'Goreng Kulit (Day 2)',
    kode_sop_ref: 'HC-SOP-KIT-02',
    durasi_menit: 45,
    durasi_detik: 45 * 60,
    toleransi_waktu_label: '45 Menit (Toleransi 40–50 mnt)',
    min_toleransi_detik: 40 * 60,
    max_toleransi_detik: 50 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Frying',
    is_deep_fryer: true, // DEEP FRYER 155°C
    is_thermal: true,
    target_temp: 155,
    toleransi_temp_label: 'Deep Fryer 150°C - 155°C stabil',
    takaran_standar: 'Kulit ayam krispi mekar renyah.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 & 2 Day 2',
    keterangan: 'SOP Goreng Kulit Mandiri Day 2: Praktik mandiri penggorengan kulit ayam krispi mekar di fryer.',
    alat_bahan: 'Deep Fryer 155°C, Keranjang Peniris, Tepung Bumbu Kulit',
    langkah_ringkas: [
      'Pastikan kulit ayam bebas bulu & lemak tebal.',
      'Penepungan merata tanpa gumpalan basah.',
      'Goreng di minyak deep fryer suhu 155°C terkontrol.',
      'Tiriskan dan pastikan kerenyahan bertahan > 3 jam.'
    ]
  },
  {
    id: 'd2-st2-teh-8lt',
    day: 2,
    station: 'Station 2',
    nama_tugas: 'Teh (8lt)',
    kode_sop_ref: 'HC-SOP-KIT-02',
    durasi_menit: 30,
    durasi_detik: 30 * 60,
    toleransi_waktu_label: '30 Menit (Toleransi 25–35 mnt)',
    min_toleransi_detik: 25 * 60,
    max_toleransi_detik: 35 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Beverage & Station',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Air 8 Liter + racikan teh harum wangi.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 & 2 Day 2',
    keterangan: 'SOP Seduh Teh 8L: Seduh daun teh harum di air mendidih 15 mnt tertutup, saring higienis.',
    alat_bahan: 'Panci Stainless Steel, Kain Saringan Teh, Dispenser Teh 8L',
    langkah_ringkas: [
      'Rebus air 8 Liter di panci stainless steel hingga mendidih.',
      'Seduh daun teh harum HARA selama 15 menit tertutup.',
      'Saring ampas dan campur gula cair sesuai takaran standar.',
      'Tuang ke dispenser teh higienis counter kasir.'
    ]
  },
  {
    id: 'd2-st2-sambal-mattah',
    day: 2,
    station: 'Station 2',
    nama_tugas: 'Sambal Mattah',
    kode_sop_ref: 'HC-SOP-GPK-10',
    durasi_menit: 20,
    durasi_detik: 20 * 60,
    toleransi_waktu_label: '20 Menit (Toleransi 15–25 mnt)',
    min_toleransi_detik: 15 * 60,
    max_toleransi_detik: 25 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Sambal Segar',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Irisan serai tipis + cabai rawit + bawang merah + terasi bakar + siram minyak panas kelapa.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 & 2 Day 2',
    keterangan: 'SOP Sambal Matah: Iris serai sangat tipis, iris bawang merah & cabai rawit seragam, remas garam & gula, siram minyak panas kelapa.',
    alat_bahan: 'Pisau Tajam, Talenan Higienis, Mangkok Stainless, Minyak Panas Kelapa',
    langkah_ringkas: [
      'Iris serai bagian putih sangat halus tipis.',
      'Iris bawang merah dan cabai rawit merah secara seragam.',
      'Remas ringan dengan garam, gula, dan sedikit perasan jeruk nipis.',
      'Siram minyak kelapa mendidih, aduk rata aroma harum keluar.'
    ]
  },
  {
    id: 'd2-st2-sambal-daun-jeruk',
    day: 2,
    station: 'Station 2',
    nama_tugas: 'Sambal Daun Jeruk',
    kode_sop_ref: 'HC-SOP-GPK-11',
    durasi_menit: 20,
    durasi_detik: 20 * 60,
    toleransi_waktu_label: '20 Menit (Toleransi 15–25 mnt)',
    min_toleransi_detik: 15 * 60,
    max_toleransi_detik: 25 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Sambal Segar',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Cabai rawit ulek kasar + daun jeruk purut buang tulang daun diiris halus.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 & 2 Day 2',
    keterangan: 'SOP Sambal Daun Jeruk: Buang tulang tengah daun jeruk purut, iris setipis rambut, ulek kasar cabai rawit, siram minyak panas wangi.',
    alat_bahan: 'Cobek Batu, Pisau Tajam, Talenan, Daun Jeruk Purut Segar, Cabai Rawit',
    langkah_ringkas: [
      'Buang tulang tengah daun jeruk purut agar tidak pahit.',
      'Gulung daun jeruk dan iris setipis rambut.',
      'Ulek kasar cabai rawit dan bawang putih.',
      'Campur irisan daun jeruk, siram minyak panas wangi.'
    ]
  },
  {
    id: 'd2-all-jamur-kentang',
    day: 2,
    station: 'All Crew',
    nama_tugas: 'Goreng Jamur & Kentang',
    kode_sop_ref: 'HC-SOP-KIT-12',
    durasi_menit: 15,
    durasi_detik: 15 * 60,
    toleransi_waktu_label: '15 Menit (Toleransi 12–18 mnt)',
    min_toleransi_detik: 12 * 60,
    max_toleransi_detik: 18 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Snack & Side Dish',
    is_deep_fryer: true, // DEEP FRYER 150°C
    is_thermal: true,
    target_temp: 150,
    toleransi_temp_label: 'Deep Fryer 150°C (Jamur Enoki 50g 3 mnt + 2.5g bumbu / Kentang 100g 5 mnt)',
    takaran_standar: 'Jamur Enoki Krispi 50g (+ 2.5g bumbu kentang) & French Fries 100g.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 All Crew (40 mnt)',
    keterangan: 'SOP Goreng Kentang & Jamur: Goreng di suhu 150°C: Jamur Enoki Krispi (50g, 3 mnt + 2.5g bumbu kentang); Kentang Goreng (100g, 5 mnt + 2.5g bumbu kentang).',
    alat_bahan: 'Deep Fryer 150°C, Keranjang Fryer, Bumbu Kentang 2.5g, Pouch Kemasan',
    langkah_ringkas: [
      'Goreng jamur enoki krispi (50g) di suhu 150°C selama 3 menit hingga renyah garing.',
      'Goreng kentang (100g) di suhu 150°C selama 5 menit hingga keemasan.',
      'Tiriskan di peniris berlubang, campur bumbu kentang 2.5g merata.',
      'Sajikan rapi di pouch kemasan HARA.'
    ]
  },
  {
    id: 'd2-st1-sucok',
    day: 2,
    station: 'Station 1',
    nama_tugas: 'Sucok (Susu Kocok)',
    kode_sop_ref: 'HC-SOP-GPK-08',
    durasi_menit: 5,
    durasi_detik: 5 * 60,
    toleransi_waktu_label: '5 Menit (Toleransi 4–6 mnt)',
    min_toleransi_detik: 4 * 60,
    max_toleransi_detik: 6 * 60,
    divisi_terkait: 'Kasir',
    kategori_sop: 'Beverage Bar',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Susu UHT segar + sirup varian + es batu kristal di-shake manual.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 Day 2 (30-40 mnt)',
    keterangan: 'SOP Susu Kocok (Sucok): Takar susu UHT dan sirup, masukkan es batu, kocok di shaker hingga berbusa creamy halus, tuang ke cup.',
    alat_bahan: 'Shaker Minuman, Jigger Takar, Cup Plastik HARA, Es Kristal',
    langkah_ringkas: [
      'Tuangkan susu UHT segar 150ml ke dalam shaker.',
      'Tambahkan sirup varian rasa standar 25ml.',
      'Masukkan es batu kristal secukupnya, tutup shaker rapat.',
      'Kocok kuat selama 15 detik sampai tekstur berbusa creamy.',
      'Tuangkan ke dalam cup HARA dan sajikan dingin segar.'
    ]
  },
  {
    id: 'd2-st3-menggoreng-ayam',
    day: 2,
    station: 'Station 3',
    nama_tugas: 'Menggoreng Ayam (Day 2)',
    kode_sop_ref: 'HC-SOP-KIT-04',
    durasi_menit: 20,
    durasi_detik: 20 * 60,
    toleransi_waktu_label: '20 Menit (Toleransi 18–22 mnt)',
    min_toleransi_detik: 18 * 60,
    max_toleransi_detik: 22 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Frying',
    is_deep_fryer: true, // DEEP FRYER 160°C
    is_thermal: true,
    target_temp: 160,
    toleransi_temp_label: 'Deep Fryer 160°C / Core Temp Ayam ≥ 74°C',
    takaran_standar: '1 Keranjang deep fryer isi ayam marinasi standar HARA.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 & 2 Day 2',
    keterangan: 'SOP Menggoreng Ayam Lanjutan Day 2: Uji konsistensi kematangan krispi emas, kontrol suhu fryer 160°C stabil, dan core temp ayam matang tulang.',
    alat_bahan: 'Deep Fryer 160°C, Probe Termometer Digital, Breader Box, Keranjang Fryer',
    langkah_ringkas: [
      'Cek kestabilan suhu minyak deep fryer pada 160°C sebelum memasukkan ayam.',
      'Lakukan penepungan teknik 2x celup ringan tanpa ditekan padat.',
      'Masukkan ayam ke minyak panas, goreng 12 menit.',
      'Tiriskan di holding display 2 menit, periksa core temperature ≥ 74°C.'
    ]
  },
  {
    id: 'd2-all-orange',
    day: 2,
    station: 'All Crew',
    nama_tugas: 'Orange 1 Porsi',
    kode_sop_ref: 'HC-SOP-GPK-08',
    durasi_menit: 5,
    durasi_detik: 5 * 60,
    toleransi_waktu_label: '5 Menit (Toleransi 4–6 mnt)',
    min_toleransi_detik: 4 * 60,
    max_toleransi_detik: 6 * 60,
    divisi_terkait: 'Kasir',
    kategori_sop: 'Beverage Bar',
    is_deep_fryer: false,
    is_thermal: false,
    takaran_standar: 'Sirup orange 40ml + air dingin + es kristal + cup sealer.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 & 2 All Crew',
    keterangan: 'SOP Minuman Orange 1 Porsi: Tuang sirup orange 40ml jigger takar, isi es batu kristal, tuang air dingin, seal press cup rapi.',
    alat_bahan: 'Jigger 40ml, Sendok Es, Cup Sealer, Cup Plastik HARA',
    langkah_ringkas: [
      'Takar sirup jeruk konsentrat 40ml menggunakan jigger.',
      'Tuangkan ke cup plastik, isi es kristal higienis hingga 3/4 penuh.',
      'Tambahkan air dingin hingga batas bibir cup.',
      'Seal menggunakan cup sealer otomatis, sajikan dingin.'
    ]
  }
];

/**
 * RUNDOWN DAY 1 TRAINING CENTER HARA CHICKEN (08:00 - 17:00)
 */
export const RUNDOWN_DAY_1: TrainingRundownSlot[] = [
  { waktu: '08:00 - 10:00', durasi_menit: 120, kegiatan: 'Briefing Tata Tertib Onboarding, Pengenalan Knowledge & Kualitas Standar Penyimpanan Bahan Baku (Freezer, Showcase, Suhu Ruang)' },
  { waktu: '10:00 - 10:30', durasi_menit: 30, kegiatan: 'Pembagian Kelompok / Station' },
  { waktu: '10:30 - 11:30', durasi_menit: 60, kegiatan: 'Praktik Batch 1 (40 Menit Aktif + Rotasi)' },
  { waktu: '11:30 - 12:00', durasi_menit: 30, kegiatan: 'Praktik Batch 2 (Sesi Pertama)' },
  { waktu: '12:00 - 12:30', durasi_menit: 30, kegiatan: 'ISOMA (Istirahat & Makan Siang)' },
  { waktu: '12:30 - 13:00', durasi_menit: 30, kegiatan: 'Lanjutan Praktik Batch 2 (30-40 Menit)' },
  { waktu: '13:00 - 14:00', durasi_menit: 60, kegiatan: 'SHOLAT & Rehat' },
  { waktu: '14:00 - 15:00', durasi_menit: 60, kegiatan: 'Closingan (Bersih-bersih Station Kerja & Sanitasi 4 Warna Lap)' },
  { waktu: '15:00 - 16:00', durasi_menit: 60, kegiatan: 'Evaluasi Day 1 & Penutup Harian' },
];

/**
 * RUNDOWN DAY 2 TRAINING CENTER HARA CHICKEN (08:00 - 17:00)
 */
export const RUNDOWN_DAY_2: TrainingRundownSlot[] = [
  { waktu: '08:00 - 09:30', durasi_menit: 90, kegiatan: 'Briefing Tata Tertib Onboarding (Mengulang SOP Inti & Review Temuan Day 1)' },
  { waktu: '09:30 - 10:00', durasi_menit: 30, kegiatan: 'Lanjutan Materi Onboarding & Knowledge Produk Baru' },
  { waktu: '10:00 - 11:00', durasi_menit: 60, kegiatan: 'Pembagian Station (Orangnya Dirombak / Cross-Training Station)' },
  { waktu: '11:00 - 12:00', durasi_menit: 60, kegiatan: 'Praktik Batch 1 (Semua Station & All Crew)' },
  { waktu: '12:00 - 13:00', durasi_menit: 60, kegiatan: 'ISOMA (Istirahat, Sholat, Makan Siang)' },
  { waktu: '13:00 - 14:30', durasi_menit: 90, kegiatan: 'Praktik Batch 2 (Lanjutan & Uji Kecepatan SOS)' },
  { waktu: '14:30 - 16:00', durasi_menit: 90, kegiatan: 'General Cleaning (Bersih-bersih Total Seluruh Alat & Area Dapur)' },
  { waktu: '16:00 - 17:00', durasi_menit: 60, kegiatan: 'Evaluasi Final Day 1 & 2, Pengumuman Kelulusan & Penutup' },
];

/**
 * ATURAN DURASI BATCH & TOLERANSI RESMI
 */
export const ATURAN_WAKTU_BATCH = {
  batch_1_menit: 40,
  batch_2_min_menit: 30,
  batch_2_max_menit: 40,
  tambahan_waktu_final_min: 20,
  tambahan_waktu_final_max: 25,
  waktu_bersih_bersih_min: 30,
  waktu_bersih_bersih_max: 40,
  catatan: 'Tambahan waktu Batch 1 & 2: 20-25 Menit Final. Waktu bersih-bersih: 30-40 Menit. Penilaian tidak kaku dengan toleransi adaptif.'
};
