import { Division } from '../types';

export interface OnboardingProductItem {
  id: string;
  nama: string;
  kode: string;
  day: 'Day 1' | 'Day 2';
  batch: 'Batch 1' | 'Batch 2' | 'All Batch';
  station: 'Station 1' | 'Station 2' | 'Station 3' | 'All Crew';
  stationLabel: string;
  divisi: Division;
  stdDetik: number;
  targetWaktuMenit: number;
  requiresOilTemp?: boolean;
  targetSuhuMinyak?: number;
  requiresGramatur?: boolean;
  targetGramatur?: number;
  gramaturLabel?: string;
  deskripsi: string;
  alatBahan?: string;
  titikKritis: string[];
  langkahSOP: { nomor: number; teks: string; isKritis?: boolean }[];
  autoQuestions: { tanya: string; kunci: string }[];
  tahapanWaktu: {
    persiapanDetik: number;
    prosesMasakDetik: number;
    finishingPlatingDetik: number;
    persiapanMenit: number;
    prosesMasakMenit: number;
    finishingPlatingMenit: number;
    keterangan: string;
  };
}

export const HARA_ONBOARDING_PRODUCTS_MASTER: OnboardingProductItem[] = [
  // =========================================================================
  // DAY 1 - STATION 1
  // =========================================================================
  {
    id: 'd1-s1-nasi-4cup',
    nama: 'Nasi 4 Cup',
    kode: 'HC-D1-S1-01',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 1',
    stationLabel: 'Station 1',
    divisi: 'Kitchen',
    stdDetik: 2100,
    targetWaktuMenit: 35.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Penanakan nasi pulen 4 cup beras Miyako menggunakan rice cooker gas dengan rasio air 4:5 dan resting 15 menit.',
    alatBahan: 'Alat: Rice Cooker Gas Miyako, Wadah Panci Nasi, Magicom Penghangat, Cup Takar Beras Miyako, Solet Plastik. Bahan: Beras merk Miyako 4 cup, Air bersih 5 cup.',
    titikKritis: [
      'Rasio takaran air: 4 cup beras : 5 cup air bersih',
      'Tekan tombol api kecil (kiri) dahulu sebelum menekan tombol COOK (kanan)',
      'Resting tertutup minimal 15 menit pasca jegleg',
      'Maksimal nasi berada di rice cooker gas 30 menit pasca matang'
    ],
    tahapanWaktu: {
      persiapanMenit: 5.0,
      prosesMasakMenit: 30.0,
      finishingPlatingMenit: 0,
      persiapanDetik: 300,
      prosesMasakDetik: 1800,
      finishingPlatingDetik: 0,
      keterangan: 'Prep: 5 mnt (Cuci beras 3x bilas, takar air) | Masak: 30 mnt (15 mnt masak gas + 15 mnt resting tanak lalu langsung pindah Magicom)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Periksa kebersihan wadah penanak nasi gas, pastikan tidak ada kerak nasi kering.' },
      { nomor: 2, teks: 'Takar 4 cup beras merk Miyako rata bibir cup.' },
      { nomor: 3, teks: 'Cuci bersih beras minimal 3 kali bilas di wadah terpisah hingga air cucian jernih, tiriskan.' },
      { nomor: 4, teks: 'Masukkan beras ke panci rice cooker gas dan tambahkan 5 cup air bersih.', isKritis: true },
      { nomor: 5, teks: 'Cek isi tabung gas dan buka tuas regulator gas.' },
      { nomor: 6, teks: 'Tekan tombol api kecil (kiri) hingga pemantik menyala, lalu tekan tombol COOK ke bawah (kanan).', isKritis: true },
      { nomor: 7, teks: 'Masak hingga tombol COOK otomatis kembali ke atas (jegleg, ~15 menit).' },
      { nomor: 8, teks: 'Diamkan 15 menit dalam kondisi tertutup rapat agar nasi tanak sempurna.', isKritis: true },
      { nomor: 9, teks: 'Pindahkan seluruh nasi ke dalam Magicom penghangat (colokkan stop kontak, tutup rapat).' }
    ],
    autoQuestions: [
      { tanya: 'Berapa rasio takaran air untuk 4 cup beras Miyako?', kunci: '4 cup beras : 5 cup air bersih.' },
      { tanya: 'Mengapa dilarang menekan tombol COOK kanan sebelum tombol kiri?', kunci: 'Tombol kiri menyalakan pemantik api pengaman; jika tombol COOK ditekan duluan, gas menumpuk dan memicu letupan.' },
      { tanya: 'Berapa durasi resting pasca jegleg sebelum nasi dipindahkan ke magicom?', kunci: 'Minimal 15 menit dalam kondisi tertutup rapat agar nasi tanak merata.' }
    ]
  },
  {
    id: 'd1-s1-teh-10lt',
    nama: 'Teh (10lt)',
    kode: 'HC-D1-S1-02',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 1',
    stationLabel: 'Station 1',
    divisi: 'Kasir',
    stdDetik: 2400,
    targetWaktuMenit: 40.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 250,
    gramaturLabel: '250g biang teh / 10L',
    deskripsi: 'Penyeduhan biang teh racikan manis 10 liter dalam panci stainless besar dengan resting seduh tertutup.',
    alatBahan: 'Alat: Panci Stainless 12L, Gelas Ukur 1000 ml, Saringan Kain Halus, Sendok Pengaduk Besar, Dispenser Teh / Termos. Bahan: Racikan Biang Teh resmi HARA 250g, Gula Pasir 1.2 kg, Air bersih 10 Liter.',
    titikKritis: [
      'Gunakan air mendidih bergolak 100°C untuk ekstraksi aroma teh',
      'Resting seduhan tertutup 15 menit agar warna dan sepat teh keluar pekat',
      'Aduk gula pasir hingga larut sempurna tanpa endapan di dasar panci',
      'Saring menggunakan saringan kain bersih agar tidak ada remah daun teh'
    ],
    tahapanWaktu: {
      persiapanMenit: 5.0,
      prosesMasakMenit: 30.0,
      finishingPlatingMenit: 5.0,
      persiapanDetik: 300,
      prosesMasakDetik: 1800,
      finishingPlatingDetik: 300,
      keterangan: 'Prep: 5 mnt (Didihkan air 10L) | Masak: 30 mnt (Seduh biang teh & larutkan gula, resting 15 mnt) | Saji: 5 mnt (Saring dan tuang ke dispenser teh)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Didihkan 10 liter air bersih di panci stainless besar hingga bergolak (100°C).' },
      { nomor: 2, teks: 'Masukkan racikan biang teh resmi HARA 250g ke dalam air mendidih, aduk perlahan.', isKritis: true },
      { nomor: 3, teks: 'Matikan kompor, tutup panci rapat dan diamkan (resting) selama 15 menit.', isKritis: true },
      { nomor: 4, teks: 'Masukkan 1.2 kg gula pasir, aduk cepat hingga seluruh butiran gula larut sempurna.' },
      { nomor: 5, teks: 'Saring larutan teh menggunakan kain saringan steril ke dalam dispenser teh/termos saji.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa gram biang teh dan gula pasir untuk takaran 10 liter teh?', kunci: '250 gram biang teh dan 1.2 kg gula pasir.' },
      { tanya: 'Berapa lama masa resting seduhan teh sebelum disaring?', kunci: '15 menit dalam kondisi panci tertutup rapat.' }
    ]
  },
  {
    id: 'd1-s1-sup-sayur',
    nama: 'Sup Sayur',
    kode: 'HC-D1-S1-03',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 1',
    stationLabel: 'Station 1',
    divisi: 'Kitchen',
    stdDetik: 2400,
    targetWaktuMenit: 40.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Membuat kuah sup sayur kaldu gurih segar dengan takaran bumbu baku HARA dan sayuran potong presisi.',
    alatBahan: 'Alat: Panci Sup Stainless, Sendok Sayur Besar, Pisau & Talenan Bersih, Kompor Gas. Bahan: Air bersih 5L, Bumbu Sup HARA, Wortel potong bulat, Kentang potong dadu, Kubis, Daun Bawang & Seledri.',
    titikKritis: [
      'Rebus wortel dan kentang terlebih dahulu hingga setengah empuk sebelum sayuran daun masuk',
      'Masukkan bumbu sup kaldu saat air mendidih dan aduk rata',
      'Sayuran daun (kubis, seledri) dimasukkan terakhir agar tidak overcooked/layu gelap',
      'Jaga suhu kuah sup di panci penghangat minimal 65°C'
    ],
    tahapanWaktu: {
      persiapanMenit: 10.0,
      prosesMasakMenit: 25.0,
      finishingPlatingMenit: 5.0,
      persiapanDetik: 600,
      prosesMasakDetik: 1500,
      finishingPlatingDetik: 300,
      keterangan: 'Prep: 10 mnt (Kupas & potong sayuran) | Masak: 25 mnt (Didihkan air, rebus sayur & bumbu kaldu) | Saji: 5 mnt (Cicipi rasa, tabur daun bawang)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Kupas dan potong wortel bentuk bulat 0.5 cm dan kentang dadu 1.5 cm.' },
      { nomor: 2, teks: 'Didihkan 5 liter air bersih di panci sup stainless.' },
      { nomor: 3, teks: 'Masukkan potongan wortel dan kentang, rebus hingga setengah empuk (~10 menit).' },
      { nomor: 4, teks: 'Masukkan bumbu sup kaldu resmi HARA, aduk merata dan cicipi keseimbangan rasa gurih.', isKritis: true },
      { nomor: 5, teks: 'Masukkan irisan kubis, daun bawang, dan seledri 2 menit sebelum api dimatikan.', isKritis: true },
      { nomor: 6, teks: 'Pindahkan ke wadah saji/warmer sup dan tutup rapat.' }
    ],
    autoQuestions: [
      { tanya: 'Sayuran apa yang wajib direbus terlebih dahulu dalam pembuatan sup sayur?', kunci: 'Wortel dan kentang karena memiliki tekstur lebih keras dan membutuhkan waktu pematangan lebih lama.' },
      { tanya: 'Kapan irisan kubis dan daun bawang dimasukkan?', kunci: '2 menit terakhir sebelum api dimatikan agar tetap renyah segar dan tidak layu kecokelatan.' }
    ]
  },
  {
    id: 'd1-s1-geprek-ori',
    nama: 'Geprek Ori',
    kode: 'HC-D1-S1-04',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 1',
    stationLabel: 'Station 1',
    divisi: 'Geprek',
    stdDetik: 120,
    targetWaktuMenit: 2.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Uleg cabai rawit & bumbu 1ml takar di cobek batu, geprek ayam krispi hangat merata, sajikan dengan 2 slice timun.',
    alatBahan: 'Alat: Cobek Batu & Ulekan, Solet Plastik, Capitan Ayam, Piring Dine-In / Box Take-Away. Bahan: 1 pcs Ayam krispi hangat, Cabai rawit segar, 1 ml bumbu geprek (1/4 sdt takar), 2 slice Timun segar.',
    titikKritis: [
      'Gunakan sendok ukur 1 ml untuk bumbu geprek',
      'Geprek ayam memar merata hingga sambal menyatu ke serat daging',
      'Pindahkan ke piring/box menggunakan solet dengan rapi',
      'Wajib sertakan 2 slice timun segar'
    ],
    tahapanWaktu: {
      persiapanMenit: 0.5,
      prosesMasakMenit: 1.0,
      finishingPlatingMenit: 0.5,
      persiapanDetik: 30,
      prosesMasakDetik: 60,
      finishingPlatingDetik: 30,
      keterangan: 'Prep: 30s (Cabai & bumbu 1ml) | Masak: 60s (Uleg sambal & geprek ayam) | Saji: 30s (Pindah ke piring/box + 2 timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Masukkan cabai rawit sesuai pesanan dan 1 ml sendok takar bumbu geprek ke cobek batu, ulek halus.', isKritis: true },
      { nomor: 2, teks: 'Ambil ayam krispi hangat dari warmer, letakkan di cobek batu.' },
      { nomor: 3, teks: 'Geprek ayam hingga memar merata dan sambal meresap ke serat daging.', isKritis: true },
      { nomor: 4, teks: 'Pindahkan ayam geprek ke piring dine-in atau box take-away beralas kertas nasi menggunakan solet.' },
      { nomor: 5, teks: 'Tambahkan 2 slice timun segar di samping ayam.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa sendok takar bumbu geprek untuk 1 porsi Geprek Ori?', kunci: '1 ml sendok takar (1/4 sdt takar).' },
      { tanya: 'Berapa slice timun yang wajib disertakan pada penyajian?', kunci: 'Wajib 2 slice timun segar.' }
    ]
  },
  {
    id: 'd1-s1-krisbar-geprek',
    nama: 'Krisbar Geprek',
    kode: 'HC-D1-S1-05',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 1',
    stationLabel: 'Station 1',
    divisi: 'Geprek',
    stdDetik: 420,
    targetWaktuMenit: 7.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Ayam krispi dibakar 2x celup bumbu di grill pan bergaris, lalu digeprek di atas cobek berisi sambal.',
    alatBahan: 'Alat: Wajan Grill Pan Bergerigi, Kompor Gas, Capitan Ayam Panjang, Cobek Batu & Ulekan, Solet. Bahan: 1 pcs Ayam krispi hangat, Bumbu Krisbar resmi HARA, Cabai rawit & bumbu geprek, 2 slice Timun segar.',
    titikKritis: [
      'Wajib 2x pencelupan bumbu krisbar dan 2x pembakaran di grill pan',
      'Bakar hingga bumbu terkaramelisasi aromatik smokey tanpa gosong pahit',
      'Geprek di cobek setelah proses grill selesai',
      'Sertakan 2 slice timun segar'
    ],
    tahapanWaktu: {
      persiapanMenit: 1.0,
      prosesMasakMenit: 5.0,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 60,
      prosesMasakDetik: 300,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 1 mnt (Panaskan grill pan, siapkan sambal di cobek) | Masak: 5 mnt (Celup 1 -> bakar -> celup 2 -> bakar -> geprek) | Saji: 1 mnt (Tata di piring + 2 timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Panaskan wajan grill pan bergerigi di kompor dengan api sedang.' },
      { nomor: 2, teks: 'Celupkan ayam krispi ke wadah bumbu krisbar (Pencelupan ke-1), lalu bakar di grill pan 1.5 menit.', isKritis: true },
      { nomor: 3, teks: 'Angkat ayam, celupkan kembali ke bumbu krisbar (Pencelupan ke-2), lalu bakar ulang 1-1.5 menit hingga harum smokey terkaramelisasi.', isKritis: true },
      { nomor: 4, teks: 'Siapkan ulegan sambal di cobek batu sesuai pesanan pelanggan.' },
      { nomor: 5, teks: 'Pindahkan ayam krisbar panas ke cobek batu, geprek memar merata hingga sambal menyatu.', isKritis: true },
      { nomor: 6, teks: 'Pindahkan ke piring/box saji beralas kertas nasi dan tambahkan 2 slice timun segar.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa kali proses pencelupan bumbu yang wajib dilakukan pada menu Krisbar?', kunci: 'Wajib 2 kali pencelupan dan 2 kali pembakaran di atas grill pan.' },
      { tanya: 'Kapan ayam krisbar digeprek?', kunci: 'Setelah selesai proses pembakaran ke-2 di grill pan, ayam dipindahkan ke cobek sambal lalu digeprek.' }
    ]
  },
  {
    id: 'd1-s1-geprek-moza',
    nama: 'Geprek Moza',
    kode: 'HC-D1-S1-06',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 1',
    stationLabel: 'Station 1',
    divisi: 'Geprek',
    stdDetik: 420,
    targetWaktuMenit: 7.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Ayam digeprek di cobek batu, taruh mozarella lembaran di atas ayam SAAT DI COBEK, torching hingga meleleh harum.',
    alatBahan: 'Alat: Cobek Batu & Ulekan, Gas Portable & Torch Burner, Solet Plastik Tahan Panas, Piring Saji / Box. Bahan: 1 pcs Ayam krispi hangat, Cabai rawit & bumbu geprek 1ml, Lembaran keju Mozarella pipih, 2 slice Timun segar.',
    titikKritis: [
      'Proses torching mozarella WAJIB dilakukan saat ayam MASIH DI ATAS COBEK BATU (dilarang di dalam box)',
      'Dilarang keras mencairkan/thawing mozarella di dalam magicom nasi atau warmer',
      'Pindahkan menggunakan solet secara perlahan agar lelehan keju tidak tumpah/rusak',
      'Sertakan 2 slice timun segar'
    ],
    tahapanWaktu: {
      persiapanMenit: 1.0,
      prosesMasakMenit: 4.5,
      finishingPlatingMenit: 1.5,
      persiapanDetik: 60,
      prosesMasakDetik: 270,
      finishingPlatingDetik: 90,
      keterangan: 'Prep: 1 mnt (Siapkan cabai, bumbu, lembaran moza) | Masak: 4.5 mnt (Uleg sambal, geprek ayam, taruh moza, torching leleh di cobek) | Saji: 1.5 mnt (Pindah pakai solet + 2 timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Ulek cabai rawit dan 1 ml sendok takar bumbu geprek di cobek batu hingga halus.' },
      { nomor: 2, teks: 'Ambil ayam krispi hangat, letakkan di cobek dan geprek memar merata.' },
      { nomor: 3, teks: 'Letakkan lembaran keju mozarella pipih di atas ayam MASIH DI ATAS COBEK BATU.', isKritis: true },
      { nomor: 4, teks: 'Nyalakan gas torch, arahkan api biru ke keju mozarella hingga meleleh lumer kecokelatan.', isKritis: true },
      { nomor: 5, teks: 'Gunakan solet plastik untuk mengangkat ayam mozarella secara hati-hati ke atas piring saji / box kemasan.', isKritis: true },
      { nomor: 6, teks: 'Tambahkan 2 slice timun segar di samping ayam.' }
    ],
    autoQuestions: [
      { tanya: 'Di mana proses torching keju Mozarella wajib dilakukan dan mengapa?', kunci: 'Wajib di atas cobek batu; dilarang di dalam box karena box karton/kertas akan terbakar dan menimbulkan bau gosong beracun.' },
      { tanya: 'Cara apa saja yang dilarang keras untuk mencairkan keju Mozarella beku?', kunci: 'Dilarang mencairkan di dalam magicom nasi, direndam air panas, atau dimasukkan warmer ayam.' }
    ]
  },

  // =========================================================================
  // DAY 1 - STATION 2
  // =========================================================================
  {
    id: 'd1-s2-goreng-ayam',
    nama: 'Goreng Ayam',
    kode: 'HC-D1-S2-01',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2',
    divisi: 'Kitchen',
    stdDetik: 1200,
    targetWaktuMenit: 20.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 160,
    requiresGramatur: true,
    targetGramatur: 2500,
    gramaturLabel: '2-3 kg ayam potong',
    deskripsi: 'Proses penepungan (dusting 2x) ayam potong marinasi dan penggorengan deep fryer 160°C selama 12 menit dengan goyang interval 3 menit.',
    alatBahan: 'Alat: Deep Fryer Kompor Gas, Termometer Minyak, Meja Dusting Stainless, Keranjang Celup Air, Ayakan Tepung, Capitan Ayam Panjang, Warmer Showcase. Bahan: Ayam potong marinasi 2-3 kg/batch, Tepung bumbu krispi, Air bersih celupan, Minyak goreng Deep Fryer.',
    titikKritis: [
      'Suhu minyak deep fryer stabil di 160°C saat dropping ayam',
      'Dusting 2x penepungan cubit memutar tanpa remas keras',
      'Goyang keranjang fryer setiap 3 menit (menit ke-3, 6, dan 9)',
      'Tiriskan minyak 30 detik sebelum pindah ke warmer showcase'
    ],
    tahapanWaktu: {
      persiapanMenit: 5.0,
      prosesMasakMenit: 13.0,
      finishingPlatingMenit: 2.0,
      persiapanDetik: 300,
      prosesMasakDetik: 780,
      finishingPlatingDetik: 120,
      keterangan: 'Prep: 5 mnt (Cek suhu 160C, dusting 2x) | Masak: 13 mnt (Goreng 12 mnt + goyang tiap 3 mnt) | Saji: 2 mnt (Tiriskan & susun di warmer)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Cek suhu minyak Deep Fryer menggunakan termometer tusuk, pastikan stabil di 160°C.', isKritis: true },
      { nomor: 2, teks: 'Ambil ayam potong marinasi (2-3 kg), letakkan di atas tepung bumbu di meja dusting.' },
      { nomor: 3, teks: 'Dusting 1: Aduk memutar dan cubit-cubit ringan hingga seluruh permukaan tertutup tepung.', isKritis: true },
      { nomor: 4, teks: 'Celupkan ayam ke keranjang air selama 3-5 detik, angkat dan tiriskan hingga air tidak menetes.' },
      { nomor: 5, teks: 'Dusting 2: Masukkan ke tepung kering, aduk memutar dan kibas ringan hingga keriting mekar.', isKritis: true },
      { nomor: 6, teks: 'Masukkan ayam ke dalam minyak 160°C satu per satu, pasang timer 12 menit.', isKritis: true },
      { nomor: 7, teks: 'Goyang keranjang fryer pada menit ke-3, ke-6, dan ke-9 agar ayam tidak saling menempel.', isKritis: true },
      { nomor: 8, teks: 'Setelah 12 menit, angkat keranjang, tiriskan minyak 30 detik, lalu pindahkan ayam ke Warmer Showcase.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa suhu minyak deep fryer saat ayam potong dimasukkan?', kunci: 'Suhu minyak wajib stabil di 160°C.' },
      { tanya: 'Berapa menit interval goyangan keranjang fryer saat penggorengan?', kunci: 'Digoyang setiap 3 menit (menit ke-3, 6, dan 9).' },
      { tanya: 'Berapa durasi penggorengan ayam potong krispi?', kunci: 'Tepat 12 menit.' }
    ]
  },
  {
    id: 'd1-s2-scrembel',
    nama: 'Scrembel',
    kode: 'HC-D1-S2-02',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2',
    divisi: 'Kitchen',
    stdDetik: 300,
    targetWaktuMenit: 5.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Membuat scramble egg lembut (creamy) menggunakan wajan anti-lengket dengan pengadukan cepat solet spiral.',
    alatBahan: 'Alat: Wajan Teflon / Stainless, Spatula Silikon / Solet, Mangkuk Stainless, Garpu Kocok. Bahan: 2 butir Telur ayam segar, Margarin 1 sdt, Susu cair / Air 1 sdm, Garam & lada bubuk sejumput.',
    titikKritis: [
      'Gunakan api kecil-sedang agar telur tidak cepat kering/gosong',
      'Kocok telur bersama susu/garam hingga homogen sebelum masuk wajan',
      'Aduk memutar lembut dari pinggir ke tengah hingga bertekstur lipatan lembut (creamy curd)',
      'Angkat saat telur masih sedikit basah mengkilap (tidak overcooked)'
    ],
    tahapanWaktu: {
      persiapanMenit: 1.5,
      prosesMasakMenit: 2.5,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 90,
      prosesMasakDetik: 150,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 1.5 mnt (Kocok telur & bumbu) | Masak: 2.5 mnt (Lelehkan margarin, orak-arik spiral api kecil) | Saji: 1 mnt (Pindah ke piring saji)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Pecahkan 2 butir telur ke mangkuk, beri sejumput garam, lada, dan 1 sdm susu/air, kocok rata.' },
      { nomor: 2, teks: 'Panaskan wajan dengan 1 sdt margarin di atas api kecil hingga meleleh.' },
      { nomor: 3, teks: 'Tuang kocokan telur ke dalam wajan panas.', isKritis: true },
      { nomor: 4, teks: 'Tarik perlahan telur dari pinggir ke tengah membentuk gumpalan lembut (curd) secara kontinyu.', isKritis: true },
      { nomor: 5, teks: 'Matikan api saat tekstur masih basah lembut dan berkilau (creamy), jangan biarkan kering kecokelatan.', isKritis: true },
      { nomor: 6, teks: 'Pindahkan scramble egg ke wadah saji / piring pesanan.' }
    ],
    autoQuestions: [
      { tanya: 'Bagaimana tanda tingkat kematangan ideal Scramble Egg HARA?', kunci: 'Tekstur gumpalan lembut (creamy curd), basah mengkilap, dan tidak kering kecokelatan.' },
      { tanya: 'Besaran api apa yang digunakan saat memasak Scramble Egg?', kunci: 'Api kecil hingga sedang agar kematangan merata tanpa membuat dasar telur mengeras.' }
    ]
  },
  {
    id: 'd1-s2-spinach',
    nama: 'Spinach',
    kode: 'HC-D1-S2-03',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2',
    divisi: 'Kitchen',
    stdDetik: 2400,
    targetWaktuMenit: 40.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 150,
    requiresGramatur: false,
    deskripsi: 'Membuat bayam krispi (spinach) renyah gurih tahan lama melalui proses sortasi daun, pencelupan adonan, dan penggorengan suhu 150°C.',
    alatBahan: 'Alat: Wajan Besar / Deep Fryer, Peniris Minyak Kawat, Nampan Pendingin, Toples Kedap Udara. Bahan: Daun bayam segar lebar (kering bebas air), Tepung adonan spinach bumbu, Minyak goreng.',
    titikKritis: [
      'Daun bayam wajib benar-benar kering dari air cuci sebelum masuk adonan tepung',
      'Suhu minyak stabil di 150°C',
      'Goreng hingga buih minyak mereda dan daun kaku renyah kehijauan (tidak gosong)',
      'Tiriskan minyak sempurna dan dinginkan sebelum disimpan di wadah kedap'
    ],
    tahapanWaktu: {
      persiapanMenit: 15.0,
      prosesMasakMenit: 20.0,
      finishingPlatingMenit: 5.0,
      persiapanDetik: 900,
      prosesMasakDetik: 1200,
      finishingPlatingDetik: 300,
      keterangan: 'Prep: 15 mnt (Petik daun, cuci, keringkan total & racik adonan) | Masak: 20 mnt (Goreng batch per batch suhu 150C) | Saji: 5 mnt (Tiriskan minyak & simpan kedap)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Pilih daun bayam yang utuh dan lebar, cuci bersih lalu tiriskan sampai daun BENAR-BENAR KERING.', isKritis: true },
      { nomor: 2, teks: 'Siapkan adonan tepung bumbu spinach dengan kekentalan sedang.' },
      { nomor: 3, teks: 'Celupkan lembaran daun bayam satu per satu ke dalam adonan tepung tipis merata.' },
      { nomor: 4, teks: 'Masukkan daun bayam ke minyak panas suhu 150°C.', isKritis: true },
      { nomor: 5, teks: 'Goreng hingga buih minyak tenang dan daun berubah menjadi renyah kaku berwarna hijau cerah keemasan.', isKritis: true },
      { nomor: 6, teks: 'Angkat dan tiriskan di atas peniris minyak kawat, dinginkan sebelum dimasukkan ke toples penyimpanan.' }
    ],
    autoQuestions: [
      { tanya: 'Mengapa daun bayam wajib dikeringkan total sebelum masuk ke adonan tepung?', kunci: 'Jika masih basah, adonan tepung tidak menempel rata dan minyak akan meletup-letup keras saat digoreng.' },
      { tanya: 'Berapa suhu minyak ideal untuk menggoreng bayam krispi (spinach)?', kunci: '150°C agar renyah tanpa membuat daun gosong gelap.' }
    ]
  },
  {
    id: 'd1-s2-indomie-geprek',
    nama: 'Indomie Geprek',
    kode: 'HC-D1-S2-04',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2',
    divisi: 'Geprek',
    stdDetik: 600,
    targetWaktuMenit: 10.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Rebus mi Indomie kenyal pas 3 menit, campur bumbu di piring saji, tata ayam geprek hangat di atas mi dengan 2 slice timun.',
    alatBahan: 'Alat: Panci Rebus Mi, Saringan Peniris Mi, Piring Saji / Box, Cobek Batu & Ulekan. Bahan: 1 bungkus Indomie Goreng, 1 pcs Ayam krispi hangat, Cabai rawit & bumbu geprek, 2 slice Timun segar.',
    titikKritis: [
      'Durasi rebus mi tepat 3 menit (tekstur kenyal al-dente, tidak benyek/lembek)',
      'Tiriskan mi hingga tidak ada air rebusan yang terbawa ke piring bumbu',
      'Aduk mi dengan bumbu instan Indomie secara merata',
      'Tata ayam geprek di atas mi dengan posisi menarik dan sertakan 2 slice timun'
    ],
    tahapanWaktu: {
      persiapanMenit: 2.0,
      prosesMasakMenit: 6.0,
      finishingPlatingMenit: 2.0,
      persiapanDetik: 120,
      prosesMasakDetik: 360,
      finishingPlatingDetik: 120,
      keterangan: 'Prep: 2 mnt (Didihkan air rebusan, buka bumbu di piring) | Masak: 6 mnt (Rebus mi 3 mnt + uleg sambal & geprek ayam) | Saji: 2 mnt (Aduk mi, tata ayam geprek di atasnya + timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Buka bumbu Indomie (minyak, kecap, saus, bumbu bubuk) ke atas piring saji.' },
      { nomor: 2, teks: 'Didihkan air di panci mi, masukkan mi Indomie dan pasang timer tepat 3 menit.', isKritis: true },
      { nomor: 3, teks: 'Sembari mi direbus, siapkan sambal di cobek dan geprek ayam krispi hangat.' },
      { nomor: 4, teks: 'Angkat mi, tiriskan airnya hingga tuntas, lalu tuang ke piring yang sudah berisi bumbu.', isKritis: true },
      { nomor: 5, teks: 'Aduk mi hingga bumbu tercampur rata merata ke setiap helai mi.' },
      { nomor: 6, teks: 'Tata ayam geprek di atas mi goreng dan letakkan 2 slice timun segar di sampingnya.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa durasi perebusan mi Indomie yang terstandar SOP?', kunci: 'Tepat 3 menit agar tekstur mi tetap kenyal al-dente dan tidak lembek.' },
      { tanya: 'Di mana bumbu instan Indomie dicampur?', kunci: 'Bumbu dicampur langsung di piring saji, bukan di dalam panci rebusan air.' }
    ]
  },
  {
    id: 'd1-s2-nashville',
    nama: 'Nashville',
    kode: 'HC-D1-S2-05',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2',
    divisi: 'Geprek',
    stdDetik: 120,
    targetWaktuMenit: 2.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 30,
    gramaturLabel: '30g bumbu celup / potong',
    deskripsi: 'Rendam ayam hangat 1 menit dalam bumbu Nashville, tiriskan, alas plastik khusus nashville di box, tabur Boncabe 1g.',
    alatBahan: 'Alat: Wadah Celupan Nashville Stainless, Rak Peniris, Capitan Ayam, Sendok Takar 1ml, Box Makanan, Plastik Alas Nashville. Bahan: 1 pcs Ayam krispi hangat, Bumbu celupan Nashville (Biru Lv1/Kuning Lv2/Merah Lv3) 30g, Boncabe 1g (sendok 1ml).',
    titikKritis: [
      'Kode warna wadah: Biru (Lv1), Kuning (Lv2), Merah (Lv3)',
      'Rendam ayam tepat 1 menit agar bumbu pedas meresap ke pori-pori tepung',
      'Kemasan Take-Away WAJIB menggunakan Plastik Alas Nashville (bukan kertas nasi biasa)',
      'Tabur Boncabe 1g takaran sendok ukur 1ml'
    ],
    tahapanWaktu: {
      persiapanMenit: 0.5,
      prosesMasakMenit: 1.0,
      finishingPlatingMenit: 0.5,
      persiapanDetik: 30,
      prosesMasakDetik: 60,
      finishingPlatingDetik: 30,
      keterangan: 'Prep: 30s (Aduk bumbu & siapkan box alas plastik) | Masak: 60s (Rendam ayam 1 mnt) | Saji: 30s (Tiriskan & tabur boncabe 1g)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Ambil ayam krispi hangat dari warmer.' },
      { nomor: 2, teks: 'Aduk bumbu celupan Nashville sesuai level (Biru Lv1, Kuning Lv2, Merah Lv3) di wadah stainless.' },
      { nomor: 3, teks: 'Celupkan dan rendam ayam krispi selama tepat 1 menit agar bumbu meresap.', isKritis: true },
      { nomor: 4, teks: 'Angkat ayam, letakkan di rak peniris sebentar agar tetesan minyak berlebih berkurang.' },
      { nomor: 5, teks: 'Siapkan box yang telah dialasi 1 LEMBAR PLASTIK ALAS NASHVILLE.', isKritis: true },
      { nomor: 6, teks: 'Letakkan ayam di atas plastik alas, lalu taburkan Boncabe 1g (sendok 1ml) secara merata di atasnya.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa lama durasi perendaman ayam krispi di dalam bumbu celupan Nashville?', kunci: 'Tepat 1 menit.' },
      { tanya: 'Mengapa box kemasan Nashville wajib dialasi lembaran Plastik Alas Nashville khusus?', kunci: 'Karena bumbu Nashville mengandung racikan minyak bumbu pekat yang dapat tembus/merusak kertas nasi biasa.' }
    ]
  },
  {
    id: 'd1-s2-krispi-mentai',
    nama: 'Krispi Mentai',
    kode: 'HC-D1-S2-06',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2',
    divisi: 'Geprek',
    stdDetik: 300,
    targetWaktuMenit: 5.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Ayam krispi utuh tanpa digeprek, lumuri saus mentai merata di permukaan kulit krispi, bakar torch hingga kecokelatan harum di atas piring stainless.',
    alatBahan: 'Alat: Piring Stainless / Nampan Torch Tahan Panas, Gas Portable & Torch, Capitan Ayam, Piring Saji / Box Kemasan. Bahan: 1 pcs Ayam krispi hangat utuh, Saus Mentai HARA (chiller), 2 slice Timun segar.',
    titikKritis: [
      'Ayam krispi UTUH TIDAK DIGEPREK untuk menjaga kerenyahan kulit',
      'Oles saus mentai merata menutupi punggung ayam krispi',
      'Bakar torch di atas piring stainless tahan panas hingga saus berkaramelisasi',
      'Sertakan 2 slice timun segar'
    ],
    tahapanWaktu: {
      persiapanMenit: 1.0,
      prosesMasakMenit: 3.0,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 60,
      prosesMasakDetik: 180,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 1 mnt (Siapkan ayam warmer & saus mentai) | Masak: 3 mnt (Oles saus mentai, bakar torch hingga harum) | Saji: 1 mnt (Pindah ke piring/box + 2 timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Ambil ayam krispi hangat utuh dari etalase warmer menggunakan capitan.' },
      { nomor: 2, teks: 'Letakkan ayam krispi di atas piring stainless tahan api (AYAM KRISPI MENTAI TIDAK DIGEPREK).', isKritis: true },
      { nomor: 3, teks: 'Tuangkan Saus Mentai secukupnya secara merata menutupi punggung kulit krispi.' },
      { nomor: 4, teks: 'Nyalakan gas torch, arahkan api ke permukaan saus mentai hingga saus bergelembung harum kecokelatan.', isKritis: true },
      { nomor: 5, teks: 'Pindahkan ayam krispi saus mentai ke piring saji atau box kemasan secara rapi.' },
      { nomor: 6, teks: 'Tambahkan 2 slice timun segar di samping ayam.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Apakah ayam pada menu Krispi Mentai digeprek di cobek?', kunci: 'TIDAK DIGEPREK. Ayam disajikan utuh renyah untuk menjaga tekstur krispi kulitnya.' },
      { tanya: 'Di atas wadah apa proses membakar torch saus mentai dilakukan?', kunci: 'Di atas piring/nampan stainless tahan api, dilarang di dalam box kertas.' }
    ]
  },
  {
    id: 'd1-s2-geprek-mentai',
    nama: 'Geprek Mentai',
    kode: 'HC-D1-S2-07',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2',
    divisi: 'Geprek',
    stdDetik: 420,
    targetWaktuMenit: 7.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Ayam digeprek dan dipadatkan di atas cobek batu, lumuri saus mentai, bakar torch hingga kecokelatan harum, angkat pakai 2 SOLET.',
    alatBahan: 'Alat: Cobek Batu & Ulekan, Gas Portable & Torch, Capitan Ayam, DUA BUAH SOLET (Wajib 2 pcs), Piring Saji / Box Kemasan. Bahan: 1 pcs Ayam krispi hangat, Bumbu sambal geprek, Saus Mentai HARA (chiller), 2 slice Timun segar.',
    titikKritis: [
      'Padatkan ayam geprek di cobek sebelum dilumuri saus mentai agar saus tidak jatuh ke sela',
      'Bakar torch WAJIB di atas COBEK BATU (dilarang keras di dalam box kertas/plastik)',
      'Wajib menggunakan DUA BUAH SOLET untuk mengangkat ayam agar tidak patah/hancur',
      'Sertakan 2 slice timun segar'
    ],
    tahapanWaktu: {
      persiapanMenit: 1.0,
      prosesMasakMenit: 4.5,
      finishingPlatingMenit: 1.5,
      persiapanDetik: 60,
      prosesMasakDetik: 270,
      finishingPlatingDetik: 90,
      keterangan: 'Prep: 1 mnt (Siapkan ayam, bumbu sambal, torch & 2 solet) | Masak: 4.5 mnt (Uleg sambal, geprek ayam, oles mentai, bakar torch di cobek) | Saji: 1.5 mnt (Angkat dgn 2 SOLET ke box + 2 timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Siapkan bumbu sambal geprek di cobek batu sesuai pesanan, ulek halus.' },
      { nomor: 2, teks: 'Ambil ayam krispi dari warmer, geprek hingga memar merata di atas sambal.' },
      { nomor: 3, teks: 'Kumpulkan remahan ayam geprek, lalu PADATKAN PERLAHAN dengan bentuk rapi di atas cobek.', isKritis: true },
      { nomor: 4, teks: 'Tambahkan Saus Mentai secukupnya secara merata di atas permukaan ayam yang telah dipadatkan.' },
      { nomor: 5, teks: 'Arahkan api gas torch ke permukaan saus mentai DI ATAS COBEK BATU hingga harum kecokelatan.', isKritis: true },
      { nomor: 6, teks: 'Ambil DUA BUAH SOLET, selipkan di bawah ayam geprek mentai dari kedua sisi, lalu angkat produk secara hati-hati ke atas piring saji / box kemasan.', isKritis: true },
      { nomor: 7, teks: 'Tambahkan 2 slice timun segar di samping ayam geprek.' }
    ],
    autoQuestions: [
      { tanya: 'Mengapa kru DIWAJIBKAN menggunakan 2 buah solet saat memindahkan Ayam Geprek Mentai?', kunci: 'Agar daging ayam yang telah dipadatkan dan dilumuri saus mentai leleh tidak patah/hancur saat dipindahkan.' },
      { tanya: 'Mengapa ayam geprek wajib dipadatkan perlahan sebelum diberi saus mentai?', kunci: 'Agar saus mentai tidak merembes jatuh ke dasar cobek dan permukaan atas menjadi bidang yang rapi untuk dibakar torch.' }
    ]
  },
  {
    id: 'd1-s2-krisbar-ori',
    nama: 'Krisbar Ori',
    kode: 'HC-D1-S2-08',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2',
    divisi: 'Kitchen',
    stdDetik: 240,
    targetWaktuMenit: 4.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Ayam krispi utuh dibakar di grill pan dengan 2x pencelupan bumbu krisbar tanpa digeprek, aroma smokey manis gurih.',
    alatBahan: 'Alat: Wajan Grill Pan Bergerigi, Kompor Gas, Capitan Ayam Panjang, Wadah Bumbu Krisbar Stainless, Piring Saji / Box. Bahan: 1 pcs Ayam krispi hangat, Bumbu Krisbar resmi HARA, 2 slice Timun segar.',
    titikKritis: [
      'Wajib 2x pencelupan bumbu krisbar dan 2x pembakaran di grill pan',
      'Ayam disajikan utuh (tidak digeprek di cobek)',
      'Bakar sambil ditekan perlahan hingga bumbu terkaramelisasi',
      'Sertakan 2 slice timun segar'
    ],
    tahapanWaktu: {
      persiapanMenit: 0.5,
      prosesMasakMenit: 3.0,
      finishingPlatingMenit: 0.5,
      persiapanDetik: 30,
      prosesMasakDetik: 180,
      finishingPlatingDetik: 30,
      keterangan: 'Prep: 30s (Panaskan grill pan, aduk bumbu) | Masak: 3 mnt (Celup 1 -> bakar -> celup 2 -> bakar) | Saji: 30s (Pindah ke piring + 2 timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Panaskan wajan grill pan dengan api sedang.' },
      { nomor: 2, teks: 'Celupkan ayam krispi hangat ke wadah bumbu krisbar (Pencelupan ke-1), lalu bakar di grill pan selama 1.5 menit.', isKritis: true },
      { nomor: 3, teks: 'Angkat ayam, celupkan kembali ke wadah bumbu krisbar (Pencelupan ke-2), lalu bakar ulang selama 1-1.5 menit hingga harum smokey terkaramelisasi.', isKritis: true },
      { nomor: 4, teks: 'Angkat ayam krisbar utuh langsung ke piring saji / box beralas kertas nasi (tanpa digeprek).', isKritis: true },
      { nomor: 5, teks: 'Tambahkan 2 slice timun segar di samping ayam.' }
    ],
    autoQuestions: [
      { tanya: 'Apa perbedaan Krisbar Ori dengan Krisbar Geprek?', kunci: 'Krisbar Ori disajikan utuh langsung di piring/box tanpa digeprek di cobek sambal.' },
      { tanya: 'Berapa kali pencelupan bumbu krisbar yang wajib dilakukan?', kunci: 'Wajib 2 kali pencelupan dan 2 kali pembakaran di atas grill pan.' }
    ]
  },
  {
    id: 'd1-s2-krispi-ayoli',
    nama: 'Krispi Ayoli',
    kode: 'HC-D1-S2-09',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2',
    divisi: 'Geprek',
    stdDetik: 240,
    targetWaktuMenit: 4.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Ayam krispi utuh disajikan di piring/box, aduk saus ayoli pakai GARPU hingga emulsi menyatu, tuang segar di atas ayam krispi.',
    alatBahan: 'Alat: Piring Saji / Box Kemasan, Capitan Ayam, GARPU PENGADUK (Wajib). Bahan: 1 pcs Ayam krispi hangat utuh, 1 cup Saus Ayoli (chili oil & mayones), 2 slice Timun segar.',
    titikKritis: [
      'Ayam krispi disajikan utuh (tidak digeprek)',
      'Wajib aduk saus ayoli menggunakan GARPU hingga emulsi chili oil dan mayo menyatu rata',
      'Saus Ayoli disajikan segar langsung tuang tanpa dibakar gas torch',
      'Sertakan 2 slice timun segar'
    ],
    tahapanWaktu: {
      persiapanMenit: 1.0,
      prosesMasakMenit: 2.0,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 60,
      prosesMasakDetik: 120,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 1 mnt (Siapkan ayam utuh & 1 cup saus ayoli) | Masak: 2 mnt (Aduk saus pakai GARPU hingga menyatu) | Saji: 1 mnt (Tuang di atas ayam + 2 timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Ambil ayam krispi hangat utuh dari warmer, letakkan di piring saji / box kemasan.' },
      { nomor: 2, teks: 'Ambil 1 cup Saus Ayoli dari showcase pendingin.' },
      { nomor: 3, teks: 'Buka tutup cup, ADUK SAUS AYOLI SECARA MERATA MENGGUNAKAN GARPU hingga emulsi chili oil dan mayones bersatu lembut.', isKritis: true },
      { nomor: 4, teks: 'Tuangkan saus ayoli yang sudah diaduk ke atas permukaan kulit ayam krispi secara merata.', isKritis: true },
      { nomor: 5, teks: 'Tambahkan 2 slice timun segar di samping ayam.' }
    ],
    autoQuestions: [
      { tanya: 'Alat apa yang WAJIB digunakan untuk mengaduk Saus Ayoli sebelum dituangkan?', kunci: 'Wajib menggunakan GARPU agar emulsi chili oil dan mayones tercampur merata dan tidak pecah/terpisah minyaknya.' },
      { tanya: 'Apakah saus Ayoli perlu dibakar torch seperti saus mentai?', kunci: 'TIDAK PERLU. Saus ayoli disajikan segar langsung tuang tanpa proses torch.' }
    ]
  },

  // =========================================================================
  // DAY 1 - STATION 3
  // =========================================================================
  {
    id: 'd1-s3-goreng-terong',
    nama: 'Goreng Terong',
    kode: 'HC-D1-S3-01',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 3',
    stationLabel: 'Station 3',
    divisi: 'Kitchen',
    stdDetik: 1500,
    targetWaktuMenit: 25.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 150,
    requiresGramatur: false,
    deskripsi: 'Pemotongan 20 slice terong miring 1 cm, marinasi bawang & garam 10 menit, dusting 2x, goreng 150°C 5 menit, porsi saji 10 slice.',
    alatBahan: 'Alat: Talenan Hijau, Pisau Tajam, Mangkuk Marinasi, Meja Dusting, Deep Fryer, Termometer Minyak, Piring Saji. Bahan: 2 buah Terong ungu segar, Bumbu marinasi terong (bawang putih & garam), Tepung bumbu krispi, Minyak goreng.',
    titikKritis: [
      'Potong terong serong ketebalan konsisten 1 cm (2 buah = ~20 slice)',
      'Marinasi terong selama minimal 10 menit agar getah hilang dan bumbu meresap',
      'Goreng di minyak 150°C selama 5 menit hingga tepung kuning keemasan renyah',
      'Porsi saji terstandar: tepat 10 slice per porsi'
    ],
    tahapanWaktu: {
      persiapanMenit: 15.0,
      prosesMasakMenit: 8.0,
      finishingPlatingMenit: 2.0,
      persiapanDetik: 900,
      prosesMasakDetik: 480,
      finishingPlatingDetik: 120,
      keterangan: 'Prep: 15 mnt (Potong serong 1cm & marinasi 10 mnt) | Masak: 8 mnt (Dusting 2x & goreng 150C selama 5 mnt) | Saji: 2 mnt (Tiriskan & tata 10 slice/porsi)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Cuci bersih terong, potong serong dengan ketebalan presisi 1 cm (1 buah terong = 10 slice, total 2 buah = 20 slice).', isKritis: true },
      { nomor: 2, teks: 'Campurkan potongan terong dengan bumbu marinasi, diamkan selama 10 menit agar bumbu meresap dan getah terong keluar.', isKritis: true },
      { nomor: 3, teks: 'Pastikan suhu minyak Deep Fryer stabil di 150°C.' },
      { nomor: 4, teks: 'Lakukan penepungan dusting 2 kali (tepung bumbu -> celup air sebentar -> tepung bumbu kedua).' },
      { nomor: 5, teks: 'Masukkan terong satu per satu ke dalam minyak panas 150°C, goreng selama 5 menit hingga renyah keemasan.', isKritis: true },
      { nomor: 6, teks: 'Angkat, tiriskan minyak, lalu sajikan tepat 10 slice per porsi di piring saji / box kemasan.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa ketebalan irisan terong dan berapa slice standar dalam 1 porsi saji?', kunci: 'Ketebalan irisan 1 cm serong, dan porsi saji standar adalah tepat 10 slice terong matang.' },
      { tanya: 'Berapa lama waktu perendaman marinasi terong sebelum ditepungi?', kunci: 'Minimal 10 menit agar getah terong hilang dan rasa gurih meresap.' }
    ]
  },
  {
    id: 'd1-s3-sambal-1-variant',
    nama: 'Sambal (1 Variant)',
    kode: 'HC-D1-S3-02',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 3',
    stationLabel: 'Station 3',
    divisi: 'Kitchen',
    stdDetik: 1800,
    targetWaktuMenit: 30.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 1000,
    gramaturLabel: '1 Batch Sambal (1 Kg)',
    deskripsi: 'Membuat 1 batch sambal master (Sambal Bawang / Sambal Tomat) dengan pencucian cabai, penggorengan api sedang, ulegan tekstur pas, dan penimbangan cup 30g.',
    alatBahan: 'Alat: Wajan Penggorengan, Spatula, Cobek Besar / Food Processor Kasar, Timbangan Digital, Cup Sambal 30g. Bahan: Cabai rawit merah & keriting, Bawang merah/putih, Garam, Gula, Kaldu bubuk, Minyak goreng.',
    titikKritis: [
      'Cuci bersih cabai dan buang tangkainya sampai tuntas',
      'Goreng cabai dan bawang hingga layu tanpa gosong',
      'Uleg/giling sambal dengan tekstur kasar berserat (bukan pasta halus)',
      'Timbang ke dalam cup saji tepat 30 gram per cup'
    ],
    tahapanWaktu: {
      persiapanMenit: 10.0,
      prosesMasakMenit: 15.0,
      finishingPlatingMenit: 5.0,
      persiapanDetik: 600,
      prosesMasakDetik: 900,
      finishingPlatingDetik: 300,
      keterangan: 'Prep: 10 mnt (Sortasi cabai, kupas bawang) | Masak: 15 mnt (Goreng layu, uleg kasar & bumbui) | Saji: 5 mnt (Timbang ke cup 30g & tutup rapat)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Sortasi dan cuci bersih cabai serta bawang, buang tangkai cabai yang busuk.' },
      { nomor: 2, teks: 'Panaskan minyak di wajan, masukkan cabai dan bawang, goreng hingga layu dan harum (~5-7 menit).', isKritis: true },
      { nomor: 3, teks: 'Pindahkan ke cobek besar, tambahkan takaran garam, gula, dan kaldu bubuk standar HARA.' },
      { nomor: 4, teks: 'Uleg sambal dengan tekstur semi-kasar berserat (hindari menggiling terlalu halus seperti pasta).', isKritis: true },
      { nomor: 5, teks: 'Siram dengan sedikit minyak panas sisa penggorengan untuk mengunci kesegaran sambal.' },
      { nomor: 6, teks: 'Porsikan ke dalam cup plastik sambal dengan timbangan tepat 30 gram per cup, lalu tutup rapat.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa gramatur isi sambal per cup saji porsi?', kunci: 'Tepat 30 gram per cup.' },
      { tanya: 'Bagaimana tekstur ulegan sambal yang terstandar SOP?', kunci: 'Tekstur semi-kasar berserat alami, bukan halus seperti pasta bubur.' }
    ]
  },
  {
    id: 'd1-s3-goreng-ayam-utuh',
    nama: 'Goreng Ayam Utuh',
    kode: 'HC-D1-S3-03',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 3',
    stationLabel: 'Station 3',
    divisi: 'Kitchen',
    stdDetik: 2700,
    targetWaktuMenit: 45.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 150,
    requiresGramatur: false,
    deskripsi: 'Penggorengan 1 ekor karkas ayam utuh suhu 150°C durasi 12-15 menit dengan teknik pemekaran paha/sayap, pembalikan berkala, dan packing Box AU lengkap 2 sambal & timun.',
    alatBahan: 'Alat: Deep Fryer Kompor Gas, Termometer Tusuk Minyak, Capitan Ayam Panjang, Meja Dusting Stainless, Box Ayam Utuh Resmi, Plastik Bening 1/4 kg. Bahan: 1 ekor Ayam Utuh karkas marinasi thawing (chiller), Tepung bumbu krispi, Air bersih celupan, 1 cup Sambal Bawang (30g), 1 cup Sambal Daun Jeruk (30g), 5 potong Timun segar.',
    titikKritis: [
      'Suhu minyak Deep Fryer wajib stabil di 150°C (lebih rendah dari ayam potong)',
      'Ayam utuh wajib dimekarkan perlahan saat dimasukkan menghadap ke atas',
      'Balik ayam utuh setiap 3 menit sekali agar rongga dada dan punggung matang seimbang',
      'Posisi di dalam box penyajian WAJIB TENGKURAP rapi, dilarang terlentang',
      'Sertakan 2 cup sambal (30g) dan 5 potong timun segar berplastik bening'
    ],
    tahapanWaktu: {
      persiapanMenit: 15.0,
      prosesMasakMenit: 25.0,
      finishingPlatingMenit: 5.0,
      persiapanDetik: 900,
      prosesMasakDetik: 1500,
      finishingPlatingDetik: 300,
      keterangan: 'Prep: 15 mnt (Cek suhu 150C, penepungan dusting 2x & pemekaran paha/sayap) | Masak: 25 mnt (Goreng 150C, balik tiap 3 mnt s.d. matang keemasan) | Saji: 5 mnt (Tiriskan minyak & packing box AU posisi tengkurap + 2 sambal & 5 timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Atur suhu kompor dan pastikan termometer minyak Deep Fryer stabil di 150°C (suhu lebih rendah agar bagian dalam matang sempurna).', isKritis: true },
      { nomor: 2, teks: 'Lakukan penepungan pertama pada Ayam Utuh, kibas perlahan, celupkan ke air celupan 3-5 detik, lalu tiriskan.' },
      { nomor: 3, teks: 'Masukkan ke penepungan kedua, balurkan tepung sambil sedikit dimekarkan pada rongga paha dan sayap.', isKritis: true },
      { nomor: 4, teks: 'Masukkan Ayam Utuh ke minyak suhu 150°C secara perlahan dengan posisi ayam dimekarkan menghadap ke atas.', isKritis: true },
      { nomor: 5, teks: 'Goreng selama 12-15 menit. Bolak-balik posisi ayam setiap 3 menit sekali secara hati-hati agar rongga dalam matang sempurna.', isKritis: true },
      { nomor: 6, teks: 'Setelah matang dan ayam mengambang keemasan, angkat dan tiriskan minyak selama 30 detik.' },
      { nomor: 7, teks: 'Siapkan Box Ayam Utuh resmi HARA, alasi dengan kertas nasi.' },
      { nomor: 8, teks: 'Masukkan Ayam Utuh matang ke dalam box dengan POSISI TENGKURAP RAPI (dilarang keras posisi terlentang).', isKritis: true },
      { nomor: 9, teks: 'Masukkan 1 cup Sambal Bawang (30g), 1 cup Sambal Daun Jeruk (30g), dan 5 potong timun segar yang telah dibungkus plastik bening ke dalam box.' }
    ],
    autoQuestions: [
      { tanya: 'Mengapa suhu minyak untuk menggoreng Ayam Utuh diatur 150°C (bukan 160°C seperti ayam potong)?', kunci: 'Karena volume dan ketebalan daging ayam utuh lebih padat; suhu 150°C memastikan panas menembus ke tulang tanpa membuat kulit luar gosong duluan.' },
      { tanya: 'Bagaimana aturan posisi meletakkan Ayam Utuh di dalam kemasan box penyajian?', kunci: 'Posisi ayam diletakkan tengkurap/telungkup rapi dengan sayap dan paha simetris, DILARANG posisi terlentang.' },
      { tanya: 'Sebutkan item pelengkap wajib yang harus disertakan di dalam kemasan Box Ayam Utuh!', kunci: '1 cup sambal bawang (30g), 1 cup sambal daun jeruk (30g), dan 5 potong timun segar berplastik bening.' }
    ]
  },
  {
    id: 'd1-s3-nasgor-geprek',
    nama: 'Nasgor Geprek',
    kode: 'HC-D1-S3-04',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 3',
    stationLabel: 'Station 3',
    divisi: 'Kitchen',
    stdDetik: 900,
    targetWaktuMenit: 15.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 200,
    gramaturLabel: '200g nasi per porsi',
    deskripsi: 'Membuat nasi goreng telur gurih dengan wajan panas wok, bumbu nasgor terstandar, disajikan bersama ayam geprek hangat dan kerupuk.',
    alatBahan: 'Alat: Wajan Wok Baja / Stainless, Spatula Wok, Kompor High/Medium, Cobek & Ulekan. Bahan: Nasi pulen dingin 200g, 1 butir Telur ayam, Bumbu Nasi Goreng HARA, Kecap manis, 1 pcs Ayam krispi hangat, 2 slice Timun, Kerupuk.',
    titikKritis: [
      'Gunakan nasi yang sudah dingin/pera agar butiran nasi tidak menggumpal lengket',
      'Orak-arik telur hingga harum sebelum nasi dimasukkan',
      'Aduk cepat dengan api besar agar bumbu meresap dan keluar aroma smokey wok',
      'Tata ayam geprek di atas nasi goreng bersama 2 slice timun segar dan kerupuk'
    ],
    tahapanWaktu: {
      persiapanMenit: 3.0,
      prosesMasakMenit: 10.0,
      finishingPlatingMenit: 2.0,
      persiapanDetik: 180,
      prosesMasakDetik: 600,
      finishingPlatingDetik: 120,
      keterangan: 'Prep: 3 mnt (Timbang nasi 200g, siapkan telur & bumbu) | Masak: 10 mnt (Orak-arik telur, goreng nasi bumbu wok, uleg sambal & geprek ayam) | Saji: 2 mnt (Plating nasgor + ayam geprek + 2 timun & kerupuk)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Panaskan wajan dengan 1 sdm minyak goreng.' },
      { nomor: 2, teks: 'Pecahkan 1 butir telur, orak-arik cepat hingga matang dan harum.' },
      { nomor: 3, teks: 'Masukkan 200g nasi putih pera, aduk sambil dihancurkan gumpalan nasinya.' },
      { nomor: 4, teks: 'Tambahkan bumbu nasi goreng resmi HARA dan kecap manis sesuai takaran SOP.', isKritis: true },
      { nomor: 5, teks: 'Goreng dengan api sedang-besar sambil diaduk cepat hingga warna cokelat merata dan harum berasap (smokey).', isKritis: true },
      { nomor: 6, teks: 'Pindahkan nasi goreng ke piring saji / box kemasan.' },
      { nomor: 7, teks: 'Geprek ayam krispi di cobek, letakkan di samping/atas nasi goreng, lengkapi 2 slice timun segar dan kerupuk.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa gramatur takaran nasi per porsi untuk menu Nasgor Geprek?', kunci: 'Tepat 200 gram nasi.' },
      { tanya: 'Mengapa disarankan menggunakan nasi yang sudah dingin/pera saat membuat nasi goreng?', kunci: 'Agar butiran nasi tidak saling menggumpal lembek dan bumbu dapat meresap merata ke setiap butir nasi.' }
    ]
  },
  {
    id: 'd1-s3-geprek-keju-parut',
    nama: 'Geprek Keju Parut',
    kode: 'HC-D1-S3-05',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 3',
    stationLabel: 'Station 3',
    divisi: 'Geprek',
    stdDetik: 300,
    targetWaktuMenit: 5.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Ayam digeprek di cobek batu, pindah ke piring/box TERLEBIH DAHULU, parut keju cheddar LANGSUNG DI ATAS PIRING/BOX (dilarang di cobek).',
    alatBahan: 'Alat: Cobek Batu & Ulekan, Solet Plastik, Parutan Keju Stainless, Piring Saji / Box. Bahan: 1 pcs Ayam krispi hangat, Bumbu sambal geprek, Blok Keju Cheddar, 2 slice Timun segar.',
    titikKritis: [
      'Pindahkan ayam geprek ke piring/box penyajian TERLEBIH DAHULU',
      'PARUT KEJU LANGSUNG DI ATAS PIRING/BOX (DILARANG KERAS MEMARUT DI ATAS COBEK BATU)',
      'Rapikan ceceran parutan keju dengan solet bersih',
      'Sertakan 2 slice timun segar'
    ],
    tahapanWaktu: {
      persiapanMenit: 0.5,
      prosesMasakMenit: 3.5,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 30,
      prosesMasakDetik: 210,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 30s (Cabai, bumbu, blok keju) | Masak: 3.5 mnt (Uleg sambal, geprek ayam, pindah piring, parut keju melimpah) | Saji: 1 mnt (Rapikan solet + 2 timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Ulek cabai rawit dan 1 ml sendok takar bumbu geprek di cobek batu hingga halus.' },
      { nomor: 2, teks: 'Ambil ayam krispi hangat dari warmer, letakkan di cobek dan geprek memar merata.' },
      { nomor: 3, teks: 'Pindahkan ayam geprek ke atas piring saji atau box beralas kertas nasi TERLEBIH DAHULU.', isKritis: true },
      { nomor: 4, teks: 'Ambil blok keju cheddar dan parutan stainless, PARUT KEJU LANGSUNG DI ATAS PIRING/BOX menutupi permukaan ayam secara melimpah (DILARANG MEMARUT DI COBEK).', isKritis: true },
      { nomor: 5, teks: 'Rapikan ceceran keju di pinggir piring menggunakan solet bersih.' },
      { nomor: 6, teks: 'Tambahkan 2 slice timun segar di samping ayam.' }
    ],
    autoQuestions: [
      { tanya: 'Di mana lokasi pemarutan keju pada menu Geprek Keju Parut yang terstandar SOP?', kunci: 'Keju diparut LANGSUNG DI ATAS PIRING/BOX penyajian setelah ayam dipindahkan (DILARANG MEMARUT DI ATAS COBEK BATU).' },
      { tanya: 'Berapa sendok takar bumbu geprek yang digunakan?', kunci: '1 ml sendok takar (1/4 sdt takar).' }
    ]
  },
  {
    id: 'd1-s3-geprek-ayoli',
    nama: 'Geprek Ayoli',
    kode: 'HC-D1-S3-06',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 3',
    stationLabel: 'Station 3',
    divisi: 'Geprek',
    stdDetik: 300,
    targetWaktuMenit: 5.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Ayam digeprek di cobek batu lalu dipindahkan dahulu ke piring/box, aduk saus ayoli pakai GARPU hingga emulsi menyatu, tuang di atas ayam geprek.',
    alatBahan: 'Alat: Cobek & Ulekan, Capitan Ayam, GARPU PENGADUK (Wajib), Piring Saji / Box Kemasan. Bahan: 1 pcs Ayam krispi hangat, Bumbu sambal geprek, 1 cup Saus Ayoli (emulsi chili oil & mayo), 2 slice Timun segar.',
    titikKritis: [
      'Pindahkan ayam geprek ke piring/box TERLEBIH DAHULU baru dituang saus ayoli',
      'Wajib aduk saus ayoli menggunakan GARPU hingga emulsi chili oil dan mayo menyatu',
      'Saus Ayoli disajikan segar langsung tuang tanpa dibakar gas torch',
      'Sertakan 2 slice timun segar'
    ],
    tahapanWaktu: {
      persiapanMenit: 0.5,
      prosesMasakMenit: 3.5,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 30,
      prosesMasakDetik: 210,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 30s (Siapkan bumbu & 1 cup saus ayoli) | Masak: 3.5 mnt (Uleg sambal, geprek ayam, pindah piring, aduk ayoli pakai GARPU) | Saji: 1 mnt (Tuang saus ayoli + 2 timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Siapkan bumbu sambal geprek di cobek batu, ulek hingga halus.' },
      { nomor: 2, teks: 'Ambil ayam krispi dari warmer, geprek memar merata di atas sambal.' },
      { nomor: 3, teks: 'Pindahkan ayam geprek ke piring saji (dine-in) atau box kemasan (take-away) TERLEBIH DAHULU.', isKritis: true },
      { nomor: 4, teks: 'Ambil 1 cup Saus Ayoli dari showcase pendingin.' },
      { nomor: 5, teks: 'Buka tutup cup, ADUK SAUS AYOLI SECARA MERATA MENGGUNAKAN GARPU hingga emulsi bersatu lembut.', isKritis: true },
      { nomor: 6, teks: 'Tuangkan saus ayoli yang sudah diaduk ke atas permukaan ayam geprek secara merata.', isKritis: true },
      { nomor: 7, teks: 'Tambahkan 2 slice timun segar di samping ayam geprek.' }
    ],
    autoQuestions: [
      { tanya: 'Kapan ayam geprek dipindahkan ke piring/box: sebelum atau sesudah saus ayoli dituangkan?', kunci: 'Ayam geprek dipindahkan ke piring/box TERLEBIH DAHULU, baru saus ayoli dituangkan di atasnya.' },
      { tanya: 'Mengapa saus Ayoli wajib diaduk dengan garpu terlebih dahulu?', kunci: 'Agar emulsi antara chili oil dan mayones bersatu lembut dan tidak terpisah lapisan minyaknya.' }
    ]
  },

  // =========================================================================
  // DAY 2 - STATION 1
  // =========================================================================
  {
    id: 'd2-s1-nasi-4cup',
    nama: 'Nasi 4 Cup (Day 2)',
    kode: 'HC-D2-S1-01',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 1',
    stationLabel: 'Station 1',
    divisi: 'Kitchen',
    stdDetik: 2700,
    targetWaktuMenit: 45.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Penanakan nasi pulen 4 cup gas Miyako Day 2 dengan evaluasi mandiri kru tanpa pendampingan intensif.',
    alatBahan: 'Alat: Rice Cooker Gas Miyako, Wadah Panci Nasi, Magicom Penghangat, Cup Takar Beras Miyako, Solet Plastik. Bahan: Beras merk Miyako 4 cup, Air bersih 5 cup.',
    titikKritis: [
      'Rasio takaran air baku: 4 cup beras : 5 cup air bersih',
      'Nyalakan api kecil kiri terlebih dahulu baru tombol COOK kanan',
      'Resting tertutup 15 menit pasca jegleg',
      'Segera pindahkan ke Magicom penghangat'
    ],
    tahapanWaktu: {
      persiapanMenit: 10.0,
      prosesMasakMenit: 35.0,
      finishingPlatingMenit: 0,
      persiapanDetik: 600,
      prosesMasakDetik: 2100,
      finishingPlatingDetik: 0,
      keterangan: 'Prep: 10 mnt (Cuci beras 3x bilas, takar air) | Masak: 35 mnt (Masak gas + 15 mnt resting tanak pasca jegleg lalu pindah Magicom)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Periksa kebersihan wadah penanak nasi gas, cuci dan lap kering.' },
      { nomor: 2, teks: 'Takar 4 cup beras Miyako rata bibir.' },
      { nomor: 3, teks: 'Cuci bersih beras minimal 3 kali bilas hingga jernih, tiriskan.' },
      { nomor: 4, teks: 'Masukkan beras ke panci dan tambahkan 5 cup air bersih.', isKritis: true },
      { nomor: 5, teks: 'Nyalakan api kecil kiri terlebih dahulu, lalu tekan tombol COOK kanan ke bawah.', isKritis: true },
      { nomor: 6, teks: 'Biarkan memasak hingga tombol COOK jegleg ke atas otomatis (~15 menit).' },
      { nomor: 7, teks: 'Diamkan tertutup 15 menit agar nasi tanak merata.', isKritis: true },
      { nomor: 8, teks: 'Pindahkan nasi ke dalam Magicom penghangat.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa takaran air bersih untuk 4 cup beras Miyako pada SOP HARA?', kunci: 'Tepat 5 cup takar air bersih.' },
      { tanya: 'Berapa batas waktu maksimal nasi berada di dalam rice cooker gas setelah matang?', kunci: 'Maksimal 30 menit pasca jegleg.' }
    ]
  },
  {
    id: 'd2-s1-goreng-kulit',
    nama: 'Goreng Kulit',
    kode: 'HC-D2-S1-02',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 1',
    stationLabel: 'Station 1',
    divisi: 'Kitchen',
    stdDetik: 2100,
    targetWaktuMenit: 35.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 150,
    requiresGramatur: true,
    targetGramatur: 60,
    gramaturLabel: 'Mentah 50g -> Matang 60g',
    deskripsi: 'Potong kulit ayam mentah satu per satu (1-1) 15 menit, timbang mentah 50g, dusting 2x, goreng 150°C 12 menit, dinginkan suhu ruang, timbang matang 60g dan hand-seal.',
    alatBahan: 'Alat: Pisau Dapur, Talenan Hijau, Timbangan Digital 5 kg, Meja Dusting, Deep Fryer, Termometer Minyak, Nampan Pendingin, Mesin Sealer Kulit (Hand Sealer). Bahan: Kulit ayam mentah order produksi (pack 500 gr), Tepung bumbu krispi, Plastik kemasan porsi kulit.',
    titikKritis: [
      'Potong kulit mentah satu per satu (motongi 1-1) simetris tanpa lemak tebal',
      'Timbang kulit mentah tepat 50g per porsi menggunakan timbangan digital TARE',
      'Goreng di minyak 150°C selama 12 menit hingga renyah keemasan',
      'Wajib DINGIN SEMPURNA di suhu ruang sebelum di-seal agar tidak melempem',
      'Timbang hasil matang seberat 60g per porsi'
    ],
    tahapanWaktu: {
      persiapanMenit: 15.0,
      prosesMasakMenit: 15.0,
      finishingPlatingMenit: 5.0,
      persiapanDetik: 900,
      prosesMasakDetik: 900,
      finishingPlatingDetik: 300,
      keterangan: 'Prep: 15 mnt (Potong manual satu per satu 1-1, timbang mentah 50g, panaskan fryer 150C, dusting 2x) | Masak: 15 mnt (Goreng 150C selama 12 mnt) | Saji: 5 mnt (Tiriskan, tunggu dingin suhu ruang, timbang matang 60g, seal plastik)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Siapkan kulit ayam mentah, potong satu per satu (motongi 1-1) simetris tanpa lemak tebal, lalu timbang tepat 50g per porsi mentah.', isKritis: true },
      { nomor: 2, teks: 'Pastikan suhu minyak Deep Fryer stabil di 150°C.', isKritis: true },
      { nomor: 3, teks: 'Lakukan 2 kali penepungan pada kulit (dusting tepung -> celup air sebentar -> dusting kedua sambil dikibas-kibas).' },
      { nomor: 4, teks: 'Masukkan kulit ke Deep Fryer, goreng selama 12 menit hingga renyah keemasan.', isKritis: true },
      { nomor: 5, teks: 'Angkat dan tiriskan minyak di atas rak tiris stainless.' },
      { nomor: 6, teks: 'Pindahkan kulit ke nampan bersih, tunggu hingga kulit BENAR-BENAR DINGIN di suhu ruang.', isKritis: true },
      { nomor: 7, teks: 'Timbang kulit matang seberat 60g per porsi.', isKritis: true },
      { nomor: 8, teks: 'Masukkan ke dalam plastik kemasan, rapatkan dengan Mesin Hand Sealer pada angka 3-4, lalu kembalikan ke angka 0.' }
    ],
    autoQuestions: [
      { tanya: 'Berapakah gramatur standar 1 porsi kulit mentah dibandingkan hasil matangnya setelah digoreng?', kunci: '1 porsi kulit mentah ditimbang 50 gr, dan hasil matangnya menjadi 60 gr per porsi.' },
      { tanya: 'Mengapa kulit krispi matang wajib ditunggu dingin sempurna sebelum dimasukkan plastik dan di-seal?', kunci: 'Jika di-seal saat masih hangat, uap panas akan terperangkap di dalam plastik dan membuat kulit melempem serta cepat berjamur/basi.' },
      { tanya: 'Berapa suhu minyak dan durasi penggorengan kulit krispi?', kunci: 'Suhu minyak 150°C selama 12 menit.' }
    ]
  },
  {
    id: 'd2-s1-milkshake',
    nama: 'Milkshake',
    kode: 'HC-D2-S1-03',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 1',
    stationLabel: 'Station 1',
    divisi: 'Kasir',
    stdDetik: 600,
    targetWaktuMenit: 10.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: '1 scoop es kristal (~150g) + 1 porsi bubuk milkshake + 100ml susu UHT/air dingin, blender 30-45 detik hingga creamy kental, seal 160°C.',
    alatBahan: 'Alat: Mesin Blender Minuman, Gelas Ukur, Cup 14 oz, Mesin Cup Sealer (160°C). Bahan: Bubuk Milkshake (Strawberry/Coklat/Vanilla) 1 porsi, Susu UHT / Air dingin 100ml, Es batu kristal 1 scoop (~150g).',
    titikKritis: [
      '3 varian resmi: Strawberry, Coklat, dan Vanilla',
      'Blender dengan kecepatan sedang selama 30-45 detik hingga tekstur creamy kental',
      'Segel di mesin cup sealer suhu 160°C',
      'Wajib cuci bersih tabung & pisau blender segera pasca pakai'
    ],
    tahapanWaktu: {
      persiapanMenit: 2.0,
      prosesMasakMenit: 5.0,
      finishingPlatingMenit: 3.0,
      persiapanDetik: 120,
      prosesMasakDetik: 300,
      finishingPlatingDetik: 180,
      keterangan: 'Prep: 2 mnt (Siapkan blender, takar varian bubuk, susu & es) | Masak: 5 mnt (Blender 45 detik hingga creamy) | Saji: 3 mnt (Tuang ke cup 14 oz, seal 160C & cuci tabung)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Periksa kebersihan tabung blender dan pastikan pisau terpasang kencang.' },
      { nomor: 2, teks: 'Masukkan 1 scoop es batu kristal ke dalam tabung blender.' },
      { nomor: 3, teks: 'Masukkan 1 porsi bubuk milkshake sesuai varian rasa yang dipesan.' },
      { nomor: 4, teks: 'Tuangkan 100 ml susu UHT / air matang dingin.', isKritis: true },
      { nomor: 5, teks: 'Blender kecepatan sedang 30-45 detik hingga es halus dan adonan mengembang creamy.', isKritis: true },
      { nomor: 6, teks: 'Tuang ke dalam cup 14 oz, masukkan ke Cup Sealer suhu 160°C dan segel rapat.', isKritis: true },
      { nomor: 7, teks: 'Segera cuci bersih tabung blender dengan air mengalir.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa lama durasi mem-blender minuman Milkshake agar teksturnya kental creamy?', kunci: 'Diblender selama 30 sampai 45 detik hingga es kristal hancur lembut homogen.' },
      { tanya: 'Mengapa tabung dan pisau blender wajib langsung dicuci setelah selesai membuat milkshake?', kunci: 'Karena sisa susu dan gula sangat cepat mengering dan dalam 2-3 jam akan berbau basi memicu bakteri.' }
    ]
  },

  // =========================================================================
  // DAY 2 - STATION 2
  // =========================================================================
  {
    id: 'd2-s2-teh-8lt',
    nama: 'Teh (8lt)',
    kode: 'HC-D2-S2-01',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'Station 2',
    divisi: 'Kasir',
    stdDetik: 1800,
    targetWaktuMenit: 30.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 200,
    gramaturLabel: '200g biang teh / 8L',
    deskripsi: 'Penyeduhan biang teh racikan manis kapasitas 8 liter (32 cup) dengan resting seduh tertutup.',
    alatBahan: 'Alat: Panci Stainless, Gelas Ukur, Saringan Kain Halus, Sendok Pengaduk Besar, Dispenser Teh. Bahan: Racikan Biang Teh resmi HARA 200g, Gula Pasir 960g, Air bersih 8 Liter.',
    titikKritis: [
      'Gunakan air mendidih 100°C',
      'Resting seduhan tertutup 15 menit agar warna dan aroma pekat keluar',
      'Aduk gula pasir hingga larut tuntas tanpa endapan',
      'Saring menggunakan saringan kain steril'
    ],
    tahapanWaktu: {
      persiapanMenit: 5.0,
      prosesMasakMenit: 20.0,
      finishingPlatingMenit: 5.0,
      persiapanDetik: 300,
      prosesMasakDetik: 1200,
      finishingPlatingDetik: 300,
      keterangan: 'Prep: 5 mnt (Didihkan air 8L) | Masak: 20 mnt (Seduh biang teh & resting 15 mnt + larutkan gula) | Saji: 5 mnt (Saring dan tuang ke dispenser)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Didihkan 8 liter air bersih di panci stainless.' },
      { nomor: 2, teks: 'Masukkan racikan biang teh 200g, aduk rata lalu matikan kompor.', isKritis: true },
      { nomor: 3, teks: 'Tutup panci rapat dan diamkan (resting) selama 15 menit.', isKritis: true },
      { nomor: 4, teks: 'Masukkan 960g gula pasir, aduk hingga larut sempurna.' },
      { nomor: 5, teks: 'Saring ke dalam dispenser teh menggunakan saringan kain steril.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa gram biang teh dan gula pasir untuk takaran 8 liter teh?', kunci: '200 gram biang teh dan 960 gram gula pasir.' },
      { tanya: 'Berapa lama durasi resting teh sebelum disaring?', kunci: '15 menit tertutup rapat.' }
    ]
  },
  {
    id: 'd2-s2-sambal-matah',
    nama: 'Sambal Matah',
    kode: 'HC-D2-S2-02',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'Station 2',
    divisi: 'Kitchen',
    stdDetik: 1200,
    targetWaktuMenit: 20.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 30,
    gramaturLabel: '30g per cup saji',
    deskripsi: 'Rajang halus bawang merah, serai bagian putih, cabai rawit, daun jeruk, remas bumbu, siram minyak kelapa panas, porsi cup 30g.',
    alatBahan: 'Alat: Pisau Tajam, Talenan Hijau Khusus Sayur, Mangkuk Stainless, Wajan Kecil Pemanas Minyak, Cup Sambal 30g. Bahan: Bawang merah 300g, Cabai rawit merah 150g, Serai (ambil bagian putih empuk) 4 batang, Daun jeruk purut 8 lembar, Terasi bakar 1 sdt, Garam & gula secukupnya, Jeruk limau 2 buah, Minyak kelapa/sawit panas 100ml.',
    titikKritis: [
      'Rajang halus tipis bawang merah dan serai (hanya bagian putih muda empuk)',
      'Buang tulang daun jeruk sebelum diiris tipis halus seperti benang',
      'Remas-remas ringan bumbu rajangan bersama garam, gula, dan terasi agar aroma keluar',
      'Siram dengan minyak benar-benar panas agar bawang layu tanpa matang berlebih',
      'Peras jeruk limau terakhir setelah minyak mendingin'
    ],
    tahapanWaktu: {
      persiapanMenit: 10.0,
      prosesMasakMenit: 7.0,
      finishingPlatingMenit: 3.0,
      persiapanDetik: 600,
      prosesMasakDetik: 420,
      finishingPlatingDetik: 180,
      keterangan: 'Prep: 10 mnt (Kupas & rajang tipis bawang, serai, daun jeruk, cabai) | Masak: 7 mnt (Remas bumbu terasi, panaskan minyak, siram minyak mendidih) | Saji: 3 mnt (Beri perasan limau, porsikan ke cup 30g)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Kupas dan cuci bersih bawang merah, cabai rawit, serai, dan daun jeruk; tiriskan sampai kering.' },
      { nomor: 2, teks: 'Rajang tipis bawang merah, cabai rawit, dan serai (hanya bagian batang putihnya saja).', isKritis: true },
      { nomor: 3, teks: 'Buang tulang daun jeruk purut, lalu iris helai daunnya tipis-tipis menyerupai benang halus.', isKritis: true },
      { nomor: 4, teks: 'Campurkan seluruh rajangan di mangkuk stainless, beri garam, gula, dan terasi matang, lalu remas-remas ringan menggunakan sarung tangan.', isKritis: true },
      { nomor: 5, teks: 'Panaskan 100 ml minyak hingga benar-benar panas berasap, lalu siramkan langsung ke atas rajangan sambal (terdengar desis), aduk rata.', isKritis: true },
      { nomor: 6, teks: 'Setelah agak hangat, tambahkan perasan air jeruk limau segar, aduk rata.' },
      { nomor: 7, teks: 'Timbang dan porsikan ke dalam cup sambal tepat seberat 30 gram per cup, tutup rapat.' }
    ],
    autoQuestions: [
      { tanya: 'Bagian batang serai mana yang boleh digunakan untuk Sambal Matah?', kunci: 'Hanya bagian batang bawah yang berwarna putih muda dan empuk (bagian hijau tua keras wajib dibuang).' },
      { tanya: 'Mengapa tulang daun jeruk wajib dibuang sebelum diiris?', kunci: 'Karena tulang daun jeruk berasa pahit getir dan teksturnya keras saat dikunyah.' },
      { tanya: 'Kapan perasan air jeruk limau dimasukkan ke dalam Sambal Matah?', kunci: 'Dimasukkan paling terakhir setelah minyak panas disiram dan suhu sambal agak hangat agar rasa asam tidak pahit.' }
    ]
  },
  {
    id: 'd2-s2-sambal-daun-jeruk',
    nama: 'Sambal Daun Jeruk',
    kode: 'HC-D2-S2-03',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'Station 2',
    divisi: 'Kitchen',
    stdDetik: 1200,
    targetWaktuMenit: 20.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 30,
    gramaturLabel: '30g per cup saji',
    deskripsi: 'Goreng cabai & bawang layu, uleg semi-kasar, tumis ulang bersama rajangan halus daun jeruk purut buang tulang hingga harum segar, porsi cup 30g.',
    alatBahan: 'Alat: Wajan Penggorengan, Spatula, Cobek Batu Besar / Food Chopper Kasar, Timbangan Digital, Cup Sambal 30g. Bahan: Cabai rawit merah & hijau, Bawang putih & merah, Daun jeruk purut segar 15 lembar (buang tulang, iris tipis), Garam, gula, kaldu jamur resmi HARA, Minyak goreng kelapa/sawit.',
    titikKritis: [
      'Tulang daun jeruk wajib dibuang tuntas agar tidak getir/pahit',
      'Uleg cabai dengan tekstur semi-kasar (bukan pasta halus)',
      'Tumis irisan daun jeruk sebentar saja di minyak sedang (maks 1 menit) agar aroma atsiri keluar tanpa gosong pahit',
      'Timbang tepat 30 gram per cup saji'
    ],
    tahapanWaktu: {
      persiapanMenit: 8.0,
      prosesMasakMenit: 9.0,
      finishingPlatingMenit: 3.0,
      persiapanDetik: 480,
      prosesMasakDetik: 540,
      finishingPlatingDetik: 180,
      keterangan: 'Prep: 8 mnt (Sortasi cabai, bawang, buang tulang daun jeruk & iris tipis) | Masak: 9 mnt (Goreng layu cabai, uleg semi-kasar, tumis ulang dengan daun jeruk) | Saji: 3 mnt (Timbang ke cup 30g & tutup rapat)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Cuci bersih cabai rawit dan bawang, tiriskan.' },
      { nomor: 2, teks: 'Ambil daun jeruk segar, sobek dan buang seluruh tulang tengah daunnya, lalu tumpuk dan iris tipis-tipis halus.', isKritis: true },
      { nomor: 3, teks: 'Goreng cabai rawit dan bawang di wajan hingga layu dan kulit cabai sedikit berkerut (~3-4 menit).' },
      { nomor: 4, teks: 'Pindahkan ke cobek batu, tambahkan garam, gula, dan kaldu, lalu uleg dengan tekstur semi-kasar berserat.', isKritis: true },
      { nomor: 5, teks: 'Panaskan 2 sdm minyak di wajan dengan api kecil, masukkan irisan daun jeruk dan sambal uleg, tumis cepat selama 1 menit hingga aroma segar daun jeruk menyatu pekat.', isKritis: true },
      { nomor: 6, teks: 'Matikan kompor dan dinginkan sejenak.' },
      { nomor: 7, teks: 'Timbang dan masukkan ke cup sambal tepat 30 gram per cup, lalu tutup rapat.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Apa perlakuan wajib terhadap daun jeruk sebelum diiris tipis untuk sambal?', kunci: 'Wajib dibuang tulang tengah daunnya agar tidak memicu rasa getir dan pahit.' },
      { tanya: 'Berapa lama proses penumisan sambal bersama irisan daun jeruk di wajan?', kunci: 'Maksimal 1 menit dengan api kecil agar minyak atsiri daun jeruk keluar harum tanpa gosong.' }
    ]
  },
  {
    id: 'd2-s2-sucok',
    nama: 'Sucok',
    kode: 'HC-D2-S2-04',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'Station 2',
    divisi: 'Kasir',
    stdDetik: 900,
    targetWaktuMenit: 15.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Larutkan bubuk Susu Coklat (Sucok) dengan 50ml air panas dispenser, aduk rata tanpa gumpal, tambah air dingin s.d. 150ml, beri es batu kristal, seal 160°C.',
    alatBahan: 'Alat: Cup 14 oz, Sendok Pengaduk Panjang, Dispenser Air Panas, Mesin Cup Sealer (160°C). Bahan: Bubuk Susu Coklat (Sucok) resmi HARA 1 porsi, Air panas 50ml, Air matang dingin 100ml, Es batu kristal.',
    titikKritis: [
      'Wajib larutkan dengan 50ml air panas dispenser terlebih dahulu (dilarang langsung air dingin)',
      'Aduk cepat hingga bubuk coklat larut sempurna bebas gumpalan',
      'Penuhi air matang dingin hingga batas 150ml sebelum es batu masuk',
      'Segel di mesin cup sealer suhu 160°C'
    ],
    tahapanWaktu: {
      persiapanMenit: 3.0,
      prosesMasakMenit: 8.0,
      finishingPlatingMenit: 4.0,
      persiapanDetik: 180,
      prosesMasakDetik: 480,
      finishingPlatingDetik: 240,
      keterangan: 'Prep: 3 mnt (Siapkan cup 14 oz & bubuk sucok) | Masak: 8 mnt (Larutkan dgn 50ml air panas dispenser, aduk rata, tambah air dingin) | Saji: 4 mnt (Beri es batu kristal & seal cup 160C)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Siapkan cup 14 oz bersih.' },
      { nomor: 2, teks: 'Masukkan 1 porsi bubuk Susu Coklat (Sucok) resmi HARA ke dalam cup.' },
      { nomor: 3, teks: 'Tuangkan 50 ml air panas dari dispenser.', isKritis: true },
      { nomor: 4, teks: 'Aduk cepat menggunakan sendok pengaduk panjang hingga bubuk larut sempurna bebas gumpalan.', isKritis: true },
      { nomor: 5, teks: 'Tambahkan air matang dingin hingga batas 150 ml.' },
      { nomor: 6, teks: 'Masukkan es batu kristal hingga batas garis cup atas.' },
      { nomor: 7, teks: 'Segel cup di mesin Cup Sealer suhu 160°C hingga tertutup rapat anti-bocor.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa ml air panas dispenser yang digunakan untuk melarutkan bubuk Sucok di awal?', kunci: 'Tepat 50 ml air panas dispenser.' },
      { tanya: 'Mengapa bubuk Sucok dilarang langsung dilarutkan dengan air dingin dan es batu?', kunci: 'Karena bubuk coklat mengandung lemak susu dan kakao yang akan menggumpal dan tidak larut jika terkena air dingin.' }
    ]
  },

  // =========================================================================
  // DAY 2 - STATION 3
  // =========================================================================
  {
    id: 'd2-s3-menggoreng-ayam',
    nama: 'Menggoreng Ayam',
    kode: 'HC-D2-S3-01',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'Station 3',
    divisi: 'Kitchen',
    stdDetik: 1500,
    targetWaktuMenit: 25.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 160,
    requiresGramatur: true,
    targetGramatur: 2500,
    gramaturLabel: '2-3 kg ayam potong',
    deskripsi: 'Penggorengan mandiri ayam krispi Day 2 dengan verifikasi suhu 160°C, teknik penepungan mandiri, dan evaluasi hasil gorengan.',
    alatBahan: 'Alat: Deep Fryer Kompor Gas, Termometer Tusuk, Meja Dusting Stainless, Keranjang Celup Air, Capitan Ayam Panjang, Warmer Showcase. Bahan: Ayam potong marinasi 2-3 kg/batch, Tepung bumbu krispi, Air bersih celupan, Minyak Deep Fryer.',
    titikKritis: [
      'Suhu minyak deep fryer stabil di 160°C',
      'Dusting 2x penepungan cubit memutar tanpa remas keras',
      'Goyang keranjang fryer pada menit ke-3, 6, dan 9',
      'Tiriskan minyak 30 detik sebelum pindah ke warmer showcase'
    ],
    tahapanWaktu: {
      persiapanMenit: 5.0,
      prosesMasakMenit: 17.0,
      finishingPlatingMenit: 3.0,
      persiapanDetik: 300,
      prosesMasakDetik: 1020,
      finishingPlatingDetik: 180,
      keterangan: 'Prep: 5 mnt (Cek suhu 160C, dusting 2x) | Masak: 17 mnt (Goreng deep fryer 12 mnt + goyang berkala) | Saji: 3 mnt (Tiriskan & susun di warmer showcase)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Cek suhu minyak deep fryer menggunakan termometer tusuk, pastikan stabil di 160°C.', isKritis: true },
      { nomor: 2, teks: 'Lakukan penepungan pertama (Dusting 1) pada ayam potong secara memutar tanpa meremas keras.' },
      { nomor: 3, teks: 'Celupkan ayam ke air celupan 3-5 detik, angkat dan tiriskan sampai air tidak menetes.' },
      { nomor: 4, teks: 'Lakukan penepungan kedua (Dusting 2) hingga terbentuk keriting mekar.', isKritis: true },
      { nomor: 5, teks: 'Masukkan ayam ke dalam minyak 160°C satu per satu, goreng selama 12 menit.', isKritis: true },
      { nomor: 6, teks: 'Goyang keranjang fryer pada menit ke-3, 6, dan 9 agar ayam tidak menempel.', isKritis: true },
      { nomor: 7, teks: 'Angkat, tiriskan 30 detik, lalu tata di etalase Warmer Showcase.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa suhu minyak deep fryer yang wajib dipertahankan?', kunci: '160°C terkalibrasi termometer.' },
      { tanya: 'Berapa menit interval goyangan keranjang fryer?', kunci: 'Setiap 3 menit (menit ke-3, 6, dan 9).' }
    ]
  },
  {
    id: 'd2-s3-goreng-jamur',
    nama: 'Goreng Jamur',
    kode: 'HC-D2-S3-02',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'Station 3',
    divisi: 'Kitchen',
    stdDetik: 900,
    targetWaktuMenit: 15.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 160,
    requiresGramatur: true,
    targetGramatur: 100,
    gramaturLabel: '100g per porsi',
    deskripsi: 'Suwir jamur enoki/tiram, cuci cepat peras tuntas, dusting tepung tipis, goreng minyak 160°C selama 3-4 menit hingga garing keemasan.',
    alatBahan: 'Alat: Pisau Dapur, Talenan Hijau, Meja Dusting, Saringan Minyak Kawat Halus, Deep Fryer / Wajan, Piring Saji / Box. Bahan: Jamur segar 100g, Tepung bumbu krispi, Minyak goreng.',
    titikKritis: [
      'Potong pangkal akar jamur dan suwir-suwir sedang (tidak terlalu tebal/tipis)',
      'Peras jamur hingga benar-benar kering dari air cuci sebelum masuk tepung',
      'Uraikan jamur saat dimasukkan ke minyak panas 160°C agar tidak menggumpal seperti bola',
      'Goreng 3-4 menit hingga buih minyak tenang dan warna kuning keemasan'
    ],
    tahapanWaktu: {
      persiapanMenit: 7.0,
      prosesMasakMenit: 6.0,
      finishingPlatingMenit: 2.0,
      persiapanDetik: 420,
      prosesMasakDetik: 360,
      finishingPlatingDetik: 120,
      keterangan: 'Prep: 7 mnt (Potong akar, suwir, peras kering & dusting) | Masak: 6 mnt (Goreng 160C sambil diuraikan 3-4 mnt) | Saji: 2 mnt (Tiriskan & sajikan 100g di box/piring)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Potong bagian akar jamur sekitar 2-3 cm, lalu suwir-suwir jamur menjadi ikatan sedang.' },
      { nomor: 2, teks: 'Cuci cepat di air mengalir, lalu PERAS DENGAN KUAT hingga kadar air keluar tuntas (jamur tidak boleh basah becek).', isKritis: true },
      { nomor: 3, teks: 'Balurkan jamur ke tepung bumbu kering sambil diurai dan dikibas-kibas agar terlapisi tipis merata.', isKritis: true },
      { nomor: 4, teks: 'Masukkan jamur ke dalam minyak panas 160°C sambil diurai menyebar (jangan dijatuhkan menggumpal sekaligus).', isKritis: true },
      { nomor: 5, teks: 'Goreng selama 3-4 menit sambil sesekali dipisah dengan capitan hingga kering renyah dan buih minyak hilang.', isKritis: true },
      { nomor: 6, teks: 'Angkat menggunakan serokan kawat halus, tiriskan minyak, lalu porsikan 100g ke piring saji / box kemasan.' }
    ],
    autoQuestions: [
      { tanya: 'Mengapa jamur wajib diperas kuat setelah dicuci sebelum ditepungi?', kunci: 'Karena jamur sangat mudah menyerap air; jika basah, tepung akan menggumpal tebal dan hasil gorengan lembek berminyak.' },
      { tanya: 'Bagaimana teknik memasukkan jamur ke dalam minyak panas?', kunci: 'Dimasukkan sambil diurai menyebar agar helaian jamur mekar dan tidak menggumpal menjadi bola keras.' }
    ]
  },
  {
    id: 'd2-s3-kentang',
    nama: 'Kentang',
    kode: 'HC-D2-S3-03',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'Station 3',
    divisi: 'Kitchen',
    stdDetik: 600,
    targetWaktuMenit: 10.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 175,
    requiresGramatur: true,
    targetGramatur: 100,
    gramaturLabel: '100g per porsi saji',
    deskripsi: 'Timbang kentang beku 100g, goreng deep fryer suhu tinggi 175°C selama 3,5-4 menit hingga garing renyah, beri bumbu tabur.',
    alatBahan: 'Alat: Deep Fryer / Wajan Khusus Kentang, Keranjang Kentang, Mangkuk Stainless Pengocok Bumbu, Timbangan Digital, Kantong Kertas Kentang / Box. Bahan: French Fries shoestring beku 100g, Bumbu tabur resmi HARA (BBQ/Balado/Keju), Minyak goreng.',
    titikKritis: [
      'Kentang digoreng langsung dalam kondisi BEKU dari freezer (dilarang dicairkan/thawing agar tidak lembek)',
      'Suhu minyak deep fryer wajib stabil di 175°C (lebih tinggi dari ayam)',
      'Goyang keranjang kentang di menit ke-2 agar kentang tidak menempel',
      'Tiriskan minyak tuntas lalu kocok dengan bumbu tabur di mangkuk stainless'
    ],
    tahapanWaktu: {
      persiapanMenit: 2.0,
      prosesMasakMenit: 5.0,
      finishingPlatingMenit: 3.0,
      persiapanDetik: 120,
      prosesMasakDetik: 300,
      finishingPlatingDetik: 180,
      keterangan: 'Prep: 2 mnt (Timbang kentang beku 100g, cek suhu 175C) | Masak: 5 mnt (Goreng 175C selama 3.5-4 mnt, goyang di menit ke-2) | Saji: 3 mnt (Tiriskan, kocok bumbu tabur & kemas kantong)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Ambil kentang beku langsung dari freezer, timbang tepat 100 gram per porsi (DILARANG MENCAIRKAN/THAWING KENTANG SEBELUM DIGORENG).', isKritis: true },
      { nomor: 2, teks: 'Pastikan suhu minyak deep fryer sudah mencapai 175°C.', isKritis: true },
      { nomor: 3, teks: 'Masukkan kentang beku ke dalam keranjang fryer, celupkan ke minyak dan pasang timer 3,5-4 menit.', isKritis: true },
      { nomor: 4, teks: 'Goyang keranjang pada menit ke-2 agar kentang matang merata dan tidak saling menempel.' },
      { nomor: 5, teks: 'Setelah matang keemasan dan mengambang, angkat keranjang, ketuk perlahan dan tiriskan minyak selama 30 detik.' },
      { nomor: 6, teks: 'Pindahkan kentang ke mangkuk stainless, taburkan bumbu resmi HARA sesuai pesanan, lalu kocok memutar perlahan.', isKritis: true },
      { nomor: 7, teks: 'Masukkan kentang berbumbu ke dalam kantong kertas saji, sajikan segera selagi panas.' }
    ],
    autoQuestions: [
      { tanya: 'Mengapa kentang goreng (French Fries) dilarang dicairkan/thawing sebelum digoreng?', kunci: 'Jika dicairkan, struktur pati kentang akan rusak dan berair sehingga hasil gorengan menjadi lembek, keriput, dan menyerap banyak minyak.' },
      { tanya: 'Berapa suhu minyak deep fryer untuk menggoreng kentang?', kunci: 'Stabil di suhu tinggi 175°C.' }
    ]
  },
  {
    id: 'd2-s3-orange-1-porsi',
    nama: 'Orange 1 Porsi',
    kode: 'HC-D2-S3-04',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'Station 3',
    divisi: 'Kasir',
    stdDetik: 300,
    targetWaktuMenit: 5.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Pembuatan dadakan 1 porsi Orange dingin cup 14 oz: larutkan bubuk dengan air panas, tambah air dingin, es kristal, seal 160°C.',
    alatBahan: 'Alat: Cup 14 oz, Sendok Pengaduk, Dispenser Air Panas & Galon, Mesin Cup Sealer (160°C). Bahan: Bubuk Orange resmi HARA 1 porsi, Air panas 50ml, Air matang dingin galon, Es batu kristal.',
    titikKritis: [
      'Larutkan bubuk dalam 50ml air panas dispenser dahulu hingga bebas gumpalan',
      'Tambahkan air dingin hingga batas 150ml sebelum es masuk',
      'Es batu kristal higienis hingga batas garis atas cup',
      'Suhu Cup Sealer stabil 160°C'
    ],
    tahapanWaktu: {
      persiapanMenit: 1.0,
      prosesMasakMenit: 3.0,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 60,
      prosesMasakDetik: 180,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 1 mnt (Siapkan cup 14 oz & bubuk orange) | Masak: 3 mnt (Larutkan air panas, tambah air dingin & es kristal) | Saji: 1 mnt (Seal cup 160C & sajikan sedotan)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Siapkan cup 14 oz bersih, masukkan 1 porsi bubuk Orange resmi HARA.' },
      { nomor: 2, teks: 'Tuangkan 50 ml air panas dispenser, aduk hingga bubuk larut sempurna bebas gumpalan.', isKritis: true },
      { nomor: 3, teks: 'Tambahkan air matang dingin hingga batas 150 ml, lalu aduk rata.' },
      { nomor: 4, teks: 'Masukkan es batu kristal secukupnya hingga batas garis cup atas.' },
      { nomor: 5, teks: 'Segel cup di mesin Cup Sealer suhu 160°C hingga tertutup rapat anti-bocor.', isKritis: true },
      { nomor: 6, teks: 'Lap luar cup dan sajikan bersama sedotan steril.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa ml air panas yang digunakan untuk melarutkan bubuk Orange di awal?', kunci: '50 ml air panas dispenser.' },
      { tanya: 'Berapa suhu mesin Cup Sealer yang wajib dipastikan kru sebelum menyegel cup?', kunci: 'Suhu mesin Cup Sealer stabil di 160°C.' }
    ]
  }
];

export const RATA_RATA_DURASI_PRODUK = {
  prepMenit: 4.5,
  masakMenit: 9.0,
  sajiMenit: 2.5,
  targetWaktuMenit: 16.0,
  targetWaktuDetik: 960
};
