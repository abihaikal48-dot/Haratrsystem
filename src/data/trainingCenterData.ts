import { Division } from '../types';

export interface TrainingStationTask {
  id: string;
  day: 1 | 2;
  station: 'Station 1' | 'Station 2' | 'Station 3' | 'All Crew';
  nama_tugas: string;
  durasi_menit: number;
  durasi_detik: number;
  toleransi_waktu_label: string;
  min_toleransi_detik: number;
  max_toleransi_detik: number;
  divisi_terkait: Division;
  kategori_sop: string;
  is_thermal: boolean;
  target_temp?: number;
  toleransi_temp_label?: string;
  takaran_standar: string;
  is_nasi_cup?: boolean;
  is_bebas_timbangan?: boolean;
  batch_info: string;
  keterangan: string;
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
  keterangan: 'New' | 'Reguler';
  divisi: Division;
  default_status: 'Onboarding' | 'OJT 30 Hari';
}

/**
 * 12 PESERTA RESMI ONBOARDING TRAINING CENTER HARA CHICKEN
 * Sesuai Dokumen Fisik Agenda Training Center
 */
export const DAFTAR_PESERTA_ONBOARDING_TC: TrainingParticipantItem[] = [
  { no: 1, nama: 'Iqbal Muzzaki', outlet: 'Imogiri Barat', keterangan: 'Reguler', divisi: 'Kitchen', default_status: 'Onboarding' },
  { no: 2, nama: 'Dhimas Eka Ramadhani', outlet: 'Purworejo', keterangan: 'Reguler', divisi: 'Kitchen', default_status: 'Onboarding' },
  { no: 3, nama: 'Wanu Azzilina', outlet: 'Wates Bendungan', keterangan: 'Reguler', divisi: 'Kasir', default_status: 'Onboarding' },
  { no: 4, nama: 'Tri Muhammad Atmojo', outlet: 'Sedayu', keterangan: 'Reguler', divisi: 'Geprek', default_status: 'Onboarding' },
  { no: 5, nama: 'Muhammad Gohan Putra Nusa', outlet: 'Jangkang', keterangan: 'Reguler', divisi: 'Kitchen', default_status: 'Onboarding' },
  { no: 6, nama: 'Rully Aditya', outlet: 'Gito-gati', keterangan: 'Reguler', divisi: 'Geprek', default_status: 'Onboarding' },
  { no: 7, nama: 'Aulia Eka Sari', outlet: 'Wates Kemiri', keterangan: 'Reguler', divisi: 'Kasir', default_status: 'Onboarding' },
  { no: 8, nama: 'Karima Syakinata Fiddini', outlet: 'Parakan', keterangan: 'Reguler', divisi: 'Kitchen', default_status: 'Onboarding' },
  { no: 9, nama: 'Shabrina Eka', outlet: 'Pandean', keterangan: 'Reguler', divisi: 'Kasir', default_status: 'Onboarding' },
  { no: 10, nama: 'Ryan Candra Kusuma', outlet: 'Godean Munggur', keterangan: 'New', divisi: 'Kitchen', default_status: 'Onboarding' },
  { no: 11, nama: 'Chicha Suparwati', outlet: 'Kalakijo', keterangan: 'New', divisi: 'Kasir', default_status: 'Onboarding' },
  { no: 12, nama: 'Intan Nur Khasanah', outlet: 'Mantrijeron', keterangan: 'New', divisi: 'Geprek', default_status: 'Onboarding' },
];

/**
 * DAFTAR TUGAS STATION & TIMER RESMI DARI AGENDA TRAINING CENTER
 */
export const AGENDA_STATION_TASKS: TrainingStationTask[] = [
  // ================= DAY 1: STATION 1 =================
  {
    id: 'd1-st1-nasi',
    day: 1,
    station: 'Station 1',
    nama_tugas: 'Nasi 4 Cup',
    durasi_menit: 35,
    durasi_detik: 35 * 60,
    toleransi_waktu_label: '35 Menit (Toleransi 30–40 mnt)',
    min_toleransi_detik: 30 * 60,
    max_toleransi_detik: 40 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Masak',
    is_thermal: false,
    takaran_standar: 'Beras Miyako 4 Cup : Air 5 Cup (Rasio Tanak Resmi). Porsi saji centong anti-lengket tanpa timbang gram.',
    is_nasi_cup: true,
    batch_info: 'Batch 1 (40 mnt) / Batch 2 (30-40 mnt)',
    keterangan: 'Tanak di rice cooker gas hingga tombol cook naik, diamkan tanak sempurna.',
    langkah_ringkas: [
      'Ambil 4 cup beras Miyako, cuci minimal 3x hingga air jernih.',
      'Tambahkan air dengan rasio resmi 4 cup beras : 5 cup air.',
      'Tekan tuas api kecil lalu tombol COOK ke bawah.',
      'Tunggu tombol COOK berbunyi naik, biarkan tanak sempurna (~35 mnt).',
      'Pindahkan ke magicom hangat, porsikan dengan centong standar porsi.'
    ]
  },
  {
    id: 'd1-st1-teh',
    day: 1,
    station: 'Station 1',
    nama_tugas: 'Teh (10lt)',
    durasi_menit: 40,
    durasi_detik: 40 * 60,
    toleransi_waktu_label: '40 Menit (Toleransi 35–45 mnt)',
    min_toleransi_detik: 35 * 60,
    max_toleransi_detik: 45 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Beverage & Station',
    is_thermal: false,
    takaran_standar: 'Air 10 Liter + Teh Seduh HARA + Sirup Gula Standar.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'Seduh air mendidih, ekstraksi aroma teh pekat, saring higienis ke dispenser teh.',
    langkah_ringkas: [
      'Rebus air hingga mendidih di panci stainless steel.',
      'Masukkan racikan teh wangi HARA, tutup rapat selama 15 menit.',
      'Saring ampas teh menggunakan kain saringan bersih.',
      'Campur gula cair standar, aduk larut merata, tuang ke dispenser teh 10L.'
    ]
  },
  {
    id: 'd1-st1-sup',
    day: 1,
    station: 'Station 1',
    nama_tugas: 'Sup Sayur',
    durasi_menit: 40,
    durasi_detik: 40 * 60,
    toleransi_waktu_label: '40 Menit (Toleransi 35–45 mnt)',
    min_toleransi_detik: 35 * 60,
    max_toleransi_detik: 45 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Sup',
    is_thermal: true,
    target_temp: 80,
    toleransi_temp_label: '≥ 75°C (Suhu Saji Hangat)',
    takaran_standar: 'Kaldu ayam gurih + potongan wortel, buncis, seledri segar.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'Masak kaldu gurih sayuran matang pas (tidak layu hancur), simpan di warmer.',
    langkah_ringkas: [
      'Didihkan kaldu ayam beraroma rempah bawang.',
      'Masukkan sayuran wortel lebih dulu, disusul buncis dan kol.',
      'Koreksi rasa gurih lembut khas HARA.',
      'Pertahankan suhu holding soup di warmer ≥ 65°C.'
    ]
  },
  {
    id: 'd1-st1-geprek-ori',
    day: 1,
    station: 'Station 1',
    nama_tugas: 'Geprek Ori',
    durasi_menit: 2,
    durasi_detik: 2 * 60,
    toleransi_waktu_label: '2 Menit / 120 Detik (Toleransi 90–150 dtk)',
    min_toleransi_detik: 90,
    max_toleransi_detik: 150,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek & Sambal',
    is_thermal: false,
    takaran_standar: 'Cabai rawit sesuai level + garam + micin + siram minyak panas 1 sendok sayur.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'Kecepatan ulek kasar fresh cobek batu, geprek ayam 2x ketukan renyah.',
    langkah_ringkas: [
      'Ambil cabai rawit segar & bumbu di cobek batu.',
      'Ulek kasar dalam waktu < 45 detik.',
      'Siram minyak panas wangi bawang 1 sendok sayur.',
      'Letakkan ayam krispi panas, geprek 2x ketukan mantap jangan hancur lebur.',
      'Sajikan di piring rotan/alas kertas minyak bersama timun miring.'
    ]
  },
  {
    id: 'd1-st1-krisbar',
    day: 1,
    station: 'Station 1',
    nama_tugas: 'Geprek & Krispi Krisbar',
    durasi_menit: 7,
    durasi_detik: 7 * 60,
    toleransi_waktu_label: '7 Menit (Toleransi 6–8 mnt)',
    min_toleransi_detik: 6 * 60,
    max_toleransi_detik: 8 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek & Bakar',
    is_thermal: true,
    target_temp: 180,
    toleransi_temp_label: 'Panas grill/flame torch merata',
    takaran_standar: 'Olesan bumbu bakar manis pedas HARA + sambal geprek.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'Bakar ayam krispi hingga aroma karamelisasi harum keluar, geprek dengan sambal krisbar.',
    langkah_ringkas: [
      'Olesi ayam krispi dengan bumbu krisbar gurih manis.',
      'Panggang/bakar di panggangan selama 3–4 menit hingga bumbu meresap karamel.',
      'Geprek bersama sambal khas Krisbar HARA.',
      'Sajikan wangi smokey harum menggugah selera.'
    ]
  },
  {
    id: 'd1-st1-geprek-moza',
    day: 1,
    station: 'Station 1',
    nama_tugas: 'Geprek Mozarella',
    durasi_menit: 10,
    durasi_detik: 10 * 60,
    toleransi_waktu_label: '10 Menit (Toleransi 8–12 mnt)',
    min_toleransi_detik: 8 * 60,
    max_toleransi_detik: 12 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek Topping',
    is_thermal: true,
    target_temp: 190,
    toleransi_temp_label: 'Torch meleleh mulur sempurna',
    takaran_standar: 'Keju Mozarella serut porsi standar 35g, torch merata.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'Geprek ayam, taburi keju moza melimpah, torch hingga melted kecokelatan.',
    langkah_ringkas: [
      'Geprek ayam dengan sambal tingkat kepedasan pesanan tamu.',
      'Taburkan keju mozarella serut secara merata menutupi permukaan ayam.',
      'Gunakan gas torch jarak 10–12 cm dengan gerakan memutar stabil.',
      'Lumerkan hingga keju meleleh mulur dan muncul semburat kecokelatan wangi.'
    ]
  },

  // ================= DAY 1: STATION 2 =================
  {
    id: 'd1-st2-goreng-ayam',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Goreng Ayam (Goreng Ayam)',
    durasi_menit: 20,
    durasi_detik: 20 * 60,
    toleransi_waktu_label: '20 Menit Siklus Batch (Toleransi 18–22 mnt)',
    min_toleransi_detik: 18 * 60,
    max_toleransi_detik: 22 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Frying',
    is_thermal: true,
    target_temp: 160,
    toleransi_temp_label: 'Deep fryer 160°C / Kompor 175°C (Core ≥ 74°C)',
    takaran_standar: '1 Keranjang Deep Fryer (Maksimal 20 potong ayam).',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'Penepungan 2x celup keriting krispi, timer fryer 12 menit goreng, tiriskan 2 menit.',
    langkah_ringkas: [
      'Cek suhu minyak deep fryer tepat 160°C dengan termometer probe.',
      'Lakukan penepungan pertama (aduk putar 10x ringan mengambang).',
      'Celupkan ke air es bersih selama 3 detik, tiriskan.',
      'Penepungan kedua hingga terbentuk serpihan keriting alami.',
      'Masukkan ke minyak panas, pasang timer deep fryer 12 menit.',
      'Angkat, tiriskan di gantungan keranjang 2 menit, pindahkan ke holding warmer.'
    ]
  },
  {
    id: 'd1-st2-mentai',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Geprek & Krispi Mentai (Scrembel)',
    durasi_menit: 5,
    durasi_detik: 5 * 60,
    toleransi_waktu_label: '5 Menit (Toleransi 4–6 mnt)',
    min_toleransi_detik: 4 * 60,
    max_toleransi_detik: 6 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek & Mentai',
    is_thermal: true,
    target_temp: 180,
    toleransi_temp_label: 'Torch saus mentai wangi gurih',
    takaran_standar: 'Saus Mentai HARA 30g + Telur Scrembel lembut.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'Masak telur orak-arik lembut, siram saus mentai khas HARA, torch kilat.',
    langkah_ringkas: [
      'Kocok telur, masak scrambled lembut di atas pan anti-lengket.',
      'Plating ayam krispi/geprek bersama telur scrembel.',
      'Tuang saus mentai zig-zag rapi di atas ayam.',
      'Torch cepat 15–20 detik hingga harum beraroma smokey.'
    ]
  },
  {
    id: 'd1-st2-nashville-spinach',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Nashville (Spinach)',
    durasi_menit: 40,
    durasi_detik: 40 * 60,
    toleransi_waktu_label: '40 Menit (Toleransi 35–45 mnt)',
    min_toleransi_detik: 35 * 60,
    max_toleransi_detik: 45 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Prep',
    is_thermal: true,
    target_temp: 165,
    toleransi_temp_label: 'Minyak goreng sayur bayam krispi',
    takaran_standar: 'Bayam segar pilihan dipetik bersih + adonan tepung renyah.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'Petik bayam segar, celup adonan encer, goreng renyah kriuk tidak menyerap minyak.',
    langkah_ringkas: [
      'Cuci bersih daun bayam segar, tiriskan hingga kering.',
      'Balur ke dalam adonan tepung bumbu krispi tipis.',
      'Goreng dalam minyak panas api sedang hingga kaku renyah hijau.',
      'Tiriskan di peniris jaring berlubang hingga bebas minyak.'
    ]
  },
  {
    id: 'd1-st2-scrembel-indomie',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Scrembel (Indomie)',
    durasi_menit: 10,
    durasi_detik: 10 * 60,
    toleransi_waktu_label: '10 Menit (Toleransi 8–12 mnt)',
    min_toleransi_detik: 8 * 60,
    max_toleransi_detik: 12 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Noodle',
    is_thermal: true,
    target_temp: 100,
    toleransi_temp_label: 'Air rebusan mendidih',
    takaran_standar: '1 Porsi Indomie Goreng/Kuah + 1 butir telur scrembel.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'Rebus mie kenyal pas 3 menit, racik bumbu, dampingi telur scrembel hangat.',
    langkah_ringkas: [
      'Didihkan air, masukkan mie instan masak tepat 3 menit (tekstur kenyal al-dente).',
      'Tuang bumbu ke dalam mangkuk/piring.',
      'Tiriskan mie, campur bumbu hingga rata mengilap.',
      'Tambahkan topping telur scrembel dan taburan bawang goreng.'
    ]
  },
  {
    id: 'd1-st2-spinach-nashville',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Spinach (Nashville Dipping)',
    durasi_menit: 2,
    durasi_detik: 2 * 60,
    toleransi_waktu_label: '2 Menit (Toleransi 90–150 dtk)',
    min_toleransi_detik: 90,
    max_toleransi_detik: 150,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Dipping',
    is_thermal: false,
    takaran_standar: 'Minyak rempah pedas Nashville panas + celup ayam krispi.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'Pencelupan cepat ayam ke bumbu pedas Nashville, tabur bubuk cabai bumbu khas.',
    langkah_ringkas: [
      'Aduk rata minyak rempah Nashville hangat.',
      'Celupkan ayam krispi selama 3–5 detik hingga terbalur merata.',
      'Tiriskan sekejap, taburi bubuk cabai rempah khas Nashville.',
      'Sajikan bersama garnish bayam crispy krispi.'
    ]
  },
  {
    id: 'd1-st2-indomie-geprek',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Indomie Geprek (Mentai Krispi)',
    durasi_menit: 5,
    durasi_detik: 5 * 60,
    toleransi_waktu_label: '5 Menit (Toleransi 4–6 mnt)',
    min_toleransi_detik: 4 * 60,
    max_toleransi_detik: 6 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek Combo',
    is_thermal: false,
    takaran_standar: 'Indomie bumbu lengkap + Ayam Geprek sambal bawang pedas.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'Plating indomie hangat dengan ayam geprek renyah pedas di atasnya.',
    langkah_ringkas: [
      'Siapkan piring saji berisi mie yang sudah dibumbui harum.',
      'Geprek ayam krispi dengan sambal cabai fresh di cobek.',
      'Letakkan ayam geprek tepat di atas hamparan mie.',
      'Lengkapi dengan potongan timun segar.'
    ]
  },
  {
    id: 'd1-st2-geprek-mentai',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Geprek Mentai',
    durasi_menit: 7,
    durasi_detik: 7 * 60,
    toleransi_waktu_label: '7 Menit (Toleransi 6–8 mnt)',
    min_toleransi_detik: 6 * 60,
    max_toleransi_detik: 8 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek Topping',
    is_thermal: true,
    target_temp: 180,
    toleransi_temp_label: 'Torch merata aroma harum',
    takaran_standar: 'Saus mentai 30g di atas ayam geprek.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'Geprek ayam gurih, beri saus mentai tebal, torch lembut.',
    langkah_ringkas: [
      'Geprek ayam krispi sesuai pesanan tamu.',
      'Semprotkan saus mentai melimpah di permukaan ayam.',
      'Torch menggunakan api sedang hingga berkaramelisasi harum.',
      'Sajikan segera selagi saus hangat.'
    ]
  },
  {
    id: 'd1-st2-krisbar-ayoli',
    day: 1,
    station: 'Station 2',
    nama_tugas: 'Krisbar Ori & Krispi Ayoli',
    durasi_menit: 8,
    durasi_detik: 8 * 60,
    toleransi_waktu_label: '8 Menit (Toleransi 7–9 mnt)',
    min_toleransi_detik: 7 * 60,
    max_toleransi_detik: 9 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek & Sauce',
    is_thermal: true,
    target_temp: 180,
    toleransi_temp_label: 'Bakar krisbar smokey harum',
    takaran_standar: 'Bumbu krisbar + saus ayoli gurih creamy khas HARA.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'Bakar ayam krisbar, siram saus ayoli creamy dengan sentuhan bawang putih gurih.',
    langkah_ringkas: [
      'Panggang ayam krispi dengan olesan bumbu bakar manis pedas.',
      'Geprek ringan agar bumbu meresap ke dalam serat daging.',
      'Tuangkan saus ayoli creamy gurih di atas ayam.',
      'Garnish dengan daun peterseli kering/biji wijen.'
    ]
  },

  // ================= DAY 1: STATION 3 =================
  {
    id: 'd1-st3-terong',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Goreng Terong (Terong)',
    durasi_menit: 25,
    durasi_detik: 25 * 60,
    toleransi_waktu_label: '25 Menit (Toleransi 22–28 mnt)',
    min_toleransi_detik: 22 * 60,
    max_toleransi_detik: 28 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Side Dish',
    is_thermal: true,
    target_temp: 160,
    toleransi_temp_label: 'Minyak panas 160°C terong tidak menyerap minyak',
    takaran_standar: '1 Buah terong ungu dipotong serong tebal 1.5 cm + balur tepung renyah.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'Potong terong serong presisi, balur tepung kering, goreng krispi renyah luar lembut dalam.',
    langkah_ringkas: [
      'Cuci terong ungu segar, potong serong dengan ketebalan 1.5 cm merata.',
      'Balur ke tepung krispi HARA tipis merata.',
      'Goreng di minyak panas hingga warna kuning keemasan.',
      'Tiriskan hingga bebas dari tetesan minyak berlebih.'
    ]
  },
  {
    id: 'd1-st3-sambal',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Sambal (1 Variant)',
    durasi_menit: 30,
    durasi_detik: 30 * 60,
    toleransi_waktu_label: '30 Menit (Toleransi 25–35 mnt)',
    min_toleransi_detik: 25 * 60,
    max_toleransi_detik: 35 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Sambal & Prep',
    is_thermal: false,
    takaran_standar: 'Bahan baku cabai rawit merah segar, bawang putih kupas, garam & bumbu ECO.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'Prep cabai segar, buang tangkai, ulek kasar seragam, siraman minyak panas gurih.',
    langkah_ringkas: [
      'Pilih cabai rawit merah segar, bersihkan dari tangkai dan cuci higienis.',
      'Timbang proporsi cabai & bawang putih sesuai resep batch.',
      'Ulek di cobek besar dengan tekstur kasar berkarakter (tidak diblender halus jus).',
      'Siram minyak panas kelapa/sawit berkualitas, aduk rata aroma harum keluar.'
    ]
  },
  {
    id: 'd1-st3-kulit',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Goreng Kulit (Kulit)',
    durasi_menit: 45,
    durasi_detik: 45 * 60,
    toleransi_waktu_label: '45 Menit (Toleransi 40–50 mnt)',
    min_toleransi_detik: 40 * 60,
    max_toleransi_detik: 50 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Frying',
    is_thermal: true,
    target_temp: 155,
    toleransi_temp_label: 'Minyak sedang 155°C agar garing tidak gosong',
    takaran_standar: 'Kulit ayam marinasi bumbu gurih 50g mentah → hasil goreng 60g krispi mekar.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 (40 mnt)',
    keterangan: 'Kerik lemak kulit ayam, potong kotak 4x4 cm, balur tepung, goreng renyah kriuk tahan lama.',
    langkah_ringkas: [
      'Bersihkan lemak berlebih pada kulit ayam segar.',
      'Potong kulit ukuran seragam 4x4 cm.',
      'Balur ke dalam tepung bumbu tipis.',
      'Goreng api sedang terkontrol sambil dibalik berkala agar tidak menggumpal.',
      'Angkat saat gelembung minyak mengecil dan warna cokelat keemasan cerah.'
    ]
  },
  {
    id: 'd1-st3-nasgor-geprek',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Nasgor Geprek',
    durasi_menit: 15,
    durasi_detik: 15 * 60,
    toleransi_waktu_label: '15 Menit (Toleransi 12–18 mnt)',
    min_toleransi_detik: 12 * 60,
    max_toleransi_detik: 18 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Wok',
    is_thermal: true,
    target_temp: 120,
    toleransi_temp_label: 'Wok panas aroma smokey harum',
    takaran_standar: '1 Porsi nasi dingin pulen (1 centong besar) + pasta bumbu nasgor HARA.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'Tumis bumbu rempah di wajan wok panas, aduk nasi cepat rata, sajikan bersama ayam geprek.',
    langkah_ringkas: [
      'Panaskan sedikit minyak di wajan wok.',
      'Tumis bumbu racik nasi goreng HARA hingga wangi.',
      'Masukkan nasi, aduk cepat dengan spatula agar butiran nasi terpisah rata.',
      'Angkat, cetak di mangkuk, plating di piring bersama ayam geprek pedas.'
    ]
  },
  {
    id: 'd1-st3-keju-parut',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Geprek Keju Parut',
    durasi_menit: 5,
    durasi_detik: 5 * 60,
    toleransi_waktu_label: '5 Menit (Toleransi 4–6 mnt)',
    min_toleransi_detik: 4 * 60,
    max_toleransi_detik: 6 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek Topping',
    is_thermal: false,
    takaran_standar: 'Keju cheddar blok diparut panjang halus (20g).',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'Geprek ayam, taburi keju parut segar menggunung menutupi ayam.',
    langkah_ringkas: [
      'Geprek ayam krispi bersama sambal pesanan.',
      'Posisikan parutan keju tepat di atas ayam geprek.',
      'Parut keju dengan tarikan panjang lurus menghasilkan gunungan serut rapi.',
      'Sajikan rapi bersama lalapan segar.'
    ]
  },
  {
    id: 'd1-st3-geprek-ayoli',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Geprek Ayoli',
    durasi_menit: 5,
    durasi_detik: 5 * 60,
    toleransi_waktu_label: '5 Menit (Toleransi 4–6 mnt)',
    min_toleransi_detik: 4 * 60,
    max_toleransi_detik: 6 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Geprek Sauce',
    is_thermal: false,
    takaran_standar: 'Saus ayoli creamy gurih 25ml di atas ayam geprek.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 2 (30-40 mnt)',
    keterangan: 'Geprek ayam, tuang saus ayoli gurih lembut merata.',
    langkah_ringkas: [
      'Geprek ayam krispi hangat di cobek batu.',
      'Pindahkan ayam ke wadah saji.',
      'Tuangkan saus ayoli dengan gerakan zig-zag menarik.',
      'Sajikan segera ke counter pick-up.'
    ]
  },
  {
    id: 'd1-st3-ayam-utuh',
    day: 1,
    station: 'Station 3',
    nama_tugas: 'Goreng Ayam Utuh (Knowledge)',
    durasi_menit: 25,
    durasi_detik: 25 * 60,
    toleransi_waktu_label: '25 Menit (Materi Knowledge & Demo)',
    min_toleransi_detik: 20 * 60,
    max_toleransi_detik: 30 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen Knowledge',
    is_thermal: true,
    target_temp: 160,
    toleransi_temp_label: 'Deep fryer 160°C kontrol waktu goreng karkas utuh',
    takaran_standar: '1 Ekor karkas ayam utuh marinasi standar HARA.',
    is_bebas_timbangan: true,
    batch_info: 'Knowledge Sesi',
    keterangan: 'Materi pengenalan anatomi potong 9 bagian, teknik marinasi merata, dan penggorengan karkas.',
    langkah_ringkas: [
      'Pahami spesifikasi berat karkas ayam standar HARA.',
      'Pelajari teknik pemotongan presisi 9 bagian (dada, paha atas, paha bawah, sayap).',
      'Pahami batas holding time marinasi 12–24 jam pada suhu chiller 1–4°C.',
      'Observasi teknik penggorengan ayam utuh agar matang sempurna hingga ke tulang.'
    ]
  },

  // ================= DAY 2 =================
  {
    id: 'd2-st1-nasi-45',
    day: 2,
    station: 'Station 1',
    nama_tugas: 'Nasi 4 cup (Lanjutan Day 2)',
    durasi_menit: 45,
    durasi_detik: 45 * 60,
    toleransi_waktu_label: '45 Menit (Toleransi 40–50 mnt)',
    min_toleransi_detik: 40 * 60,
    max_toleransi_detik: 50 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Masak',
    is_thermal: false,
    takaran_standar: '4 Cup beras Miyako : 5 Cup air baku. Centong porsi standar tanpa timbang gram.',
    is_nasi_cup: true,
    batch_info: 'Batch 1 & 2 Day 2',
    keterangan: 'Uji konsistensi tekstur nasi pulen, kepatuhan rasio cup, dan kecepatan porsi saji.',
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
    durasi_menit: 45,
    durasi_detik: 45 * 60,
    toleransi_waktu_label: '45 Menit (Toleransi 40–50 mnt)',
    min_toleransi_detik: 40 * 60,
    max_toleransi_detik: 50 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Kitchen & Frying',
    is_thermal: true,
    target_temp: 155,
    toleransi_temp_label: '155°C stabil',
    takaran_standar: 'Kulit ayam krispi mekar renyah.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 & 2 Day 2',
    keterangan: 'Praktik mandiri penggorengan kulit ayam krispi bebas bau amis.',
    langkah_ringkas: [
      'Pastikan kulit ayam bebas bulu & lemak tebal.',
      'Penepungan merata tanpa gumpalan basah.',
      'Goreng di minyak api sedang teratur.',
      'Tiriskan dan pastikan kerenyahan bertahan > 3 jam.'
    ]
  },
  {
    id: 'd2-st2-teh-8lt',
    day: 2,
    station: 'Station 2',
    nama_tugas: 'Teh (8lt)',
    durasi_menit: 30,
    durasi_detik: 30 * 60,
    toleransi_waktu_label: '30 Menit (Toleransi 25–35 mnt)',
    min_toleransi_detik: 25 * 60,
    max_toleransi_detik: 35 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Beverage & Station',
    is_thermal: false,
    takaran_standar: 'Air 8 Liter + racikan teh harum wangi.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 & 2 Day 2',
    keterangan: 'Seduh teh volume 8 Liter dispenser counter kasir.',
    langkah_ringkas: [
      'Rebus air 8 Liter di panci stainless steel.',
      'Seduh daun teh harum HARA selama 15 menit tertutup.',
      'Saring ampas dan campur gula cair sesuai takaran standar.',
      'Tuang ke dispenser teh higienis.'
    ]
  },
  {
    id: 'd2-st2-sambal-mattah',
    day: 2,
    station: 'Station 2',
    nama_tugas: 'Sambal Mattah',
    durasi_menit: 20,
    durasi_detik: 20 * 60,
    toleransi_waktu_label: '20 Menit (Toleransi 15–25 mnt)',
    min_toleransi_detik: 15 * 60,
    max_toleransi_detik: 25 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Sambal Segar',
    is_thermal: false,
    takaran_standar: 'Irisan serai tipis + cabai rawit + bawang merah + terasi bakar + siram minyak panas kelapa.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 & 2 Day 2',
    keterangan: 'Ketelitian pisau iris serai & bawang halus tipis, aroma terasi bakar harum, siram minyak panas gurih.',
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
    durasi_menit: 20,
    durasi_detik: 20 * 60,
    toleransi_waktu_label: '20 Menit (Toleransi 15–25 mnt)',
    min_toleransi_detik: 15 * 60,
    max_toleransi_detik: 25 * 60,
    divisi_terkait: 'Geprek',
    kategori_sop: 'Sambal Segar',
    is_thermal: false,
    takaran_standar: 'Cabai rawit ulek kasar + daun jeruk purut buang tulang daun diiris halus.',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 & 2 Day 2',
    keterangan: 'Aroma aromatik daun jeruk segar bersatu dengan pedas nampol khas HARA.',
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
    nama_tugas: 'Goreng Jamur & Kentang (All Crew)',
    durasi_menit: 15,
    durasi_detik: 15 * 60,
    toleransi_waktu_label: '15 Menit (Toleransi 12–18 mnt)',
    min_toleransi_detik: 12 * 60,
    max_toleransi_detik: 18 * 60,
    divisi_terkait: 'Kitchen',
    kategori_sop: 'Snack & Side Dish',
    is_thermal: true,
    target_temp: 165,
    toleransi_temp_label: 'Fryer 165°C kentang & jamur garing keemasan',
    takaran_standar: '1 Porsi French Fries (120g) & Jamur Tiram Krispi (100g).',
    is_bebas_timbangan: false,
    batch_info: 'Batch 1 All Crew (40 mnt)',
    keterangan: 'Goreng kentang renyah luar lembut dalam, jamur mekar kriuk kering.',
    langkah_ringkas: [
      'Goreng kentang beku langsung di suhu 165°C selama 3–4 menit.',
      'Goreng jamur tiram berlapis tepung krispi hingga kuning keemasan.',
      'Tiriskan di peniris berlubang, taburi bumbu tabur jika diminta.',
      'Sajikan hangat di pouch kemasan HARA.'
    ]
  },
  {
    id: 'd2-all-orange-milkshake',
    day: 2,
    station: 'All Crew',
    nama_tugas: 'Orange 1 Porsi & Milkshake All Variant',
    durasi_menit: 10,
    durasi_detik: 10 * 60,
    toleransi_waktu_label: '10 Menit (Toleransi 8–12 mnt)',
    min_toleransi_detik: 8 * 60,
    max_toleransi_detik: 12 * 60,
    divisi_terkait: 'Kasir',
    kategori_sop: 'Beverage Bar',
    is_thermal: false,
    takaran_standar: 'Sirup jeruk segar 40ml + es batu kristal + air higienis / powder milkshake + susu cair.',
    is_bebas_timbangan: true,
    batch_info: 'Batch 1 & 2 All Crew',
    keterangan: 'Standar takaran minuman dingin, sealing cup sealer rapat anti bocor.',
    langkah_ringkas: [
      'Takar sirup orange atau bubuk rasa milkshake presisi.',
      'Tambahkan es batu kristal higienis dan air/susu.',
      'Shake / aduk hingga busa creamy merata.',
      'Seal menggunakan cup sealer otomatis, periksa kerapian segel bibir cup.'
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
