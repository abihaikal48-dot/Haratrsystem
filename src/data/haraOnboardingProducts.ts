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
  // 1. Nasi Putih Pulen (Miyako 4-6 Cup)
  // =========================================================================
  {
    id: 'prod-01-nasi-pulen',
    nama: 'Nasi Putih Pulen (Miyako 4-6 Cup)',
    kode: 'HC-SOP-KIT-01',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 1',
    stationLabel: 'Station 1 (Rebus & Nasi)',
    divisi: 'Kitchen',
    stdDetik: 2220,
    targetWaktuMenit: 37.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Penanakan nasi pulen menggunakan rice cooker gas Miyako kapasitas 4-6 cup dengan rasio air terstandar dan masa resting 15 menit.',
    alatBahan: 'Alat: Rice Cooker Gas Miyako (regulator biasa non-high pressure), Wadah Panci Nasi, Magicom Penghangat, Cup Takar Beras Miyako, Solet Plastik. Bahan: Beras merk Miyako maksimal 6 cup, Air bersih (Rasio Miyako: 3 cup:4 cup air, 4:5, 5:6, maks 6:8).',
    titikKritis: [
      'Rasio takaran air baku: 3:4, 4:5, 5:6, atau maks 6:8 cup air bersih',
      'Wajib tekan tombol api kecil (kiri) dahulu sebelum menekan tombol COOK (kanan)',
      'Resting tertutup minimal 15 menit pasca jegleg agar nasi tanak merata',
      'Maksimal nasi berada di rice cooker gas 30 menit pasca matang'
    ],
    tahapanWaktu: {
      persiapanMenit: 5.0,
      prosesMasakMenit: 30.0,
      finishingPlatingMenit: 2.0,
      persiapanDetik: 300,
      prosesMasakDetik: 1800,
      finishingPlatingDetik: 120,
      keterangan: 'Prep: 5 mnt (Cuci beras 3x bilas, takar air) | Masak: 15 mnt masak gas + 15 mnt diamkan tanak pasca jegleg | Saji: 2 mnt (Pindah ke Magicom)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Periksa kebersihan wadah penanak nasi gas, pastikan tidak ada sisa kerak nasi kering.' },
      { nomor: 2, teks: 'Ambil beras merk Miyako maksimal 6 cup sesuai kebutuhan shift.' },
      { nomor: 3, teks: 'Cuci bersih beras minimal 3 kali bilas di wadah terpisah hingga air cucian cukup jernih, tiriskan.' },
      { nomor: 4, teks: 'Masukkan beras ke wadah rice cooker gas dan tambahkan air bersih sesuai rasio baku (3:4, 4:5, 5:6, atau 6:8 cup air).', isKritis: true },
      { nomor: 5, teks: 'Cek isi tabung gas dan buka tuas regulator gas.' },
      { nomor: 6, teks: 'Tekan tombol api kecil (sebelah kiri) terlebih dahulu hingga pemantik menyala, lalu tekan tombol COOK ke bawah (sebelah kanan).', isKritis: true },
      { nomor: 7, teks: 'Masak hingga tombol COOK otomatis kembali ke atas (jegleg/berbunyi klik, ~15 menit).' },
      { nomor: 8, teks: 'Diamkan sekitar 15 menit dalam kondisi tertutup rapat agar nasi tanak sempurna.', isKritis: true },
      { nomor: 9, teks: 'Nasi tidak boleh dibiarkan di dalam rice cooker gas lebih dari 30 menit (bisa mengeras/berkerak).' },
      { nomor: 10, teks: 'Pindahkan seluruh nasi ke dalam Magicom penghangat (colokkan stop kontak, tutup rapat).' }
    ],
    autoQuestions: [
      {
        tanya: 'Mengapa saat menyalakan Rice Cooker Gas dilarang menekan tombol sebelah kanan (COOK) terlebih dahulu?',
        kunci: 'Tombol kiri adalah pemantik api kecil pengaman; jika tombol kanan ditekan duluan tanpa api kecil menyala, gas akan menumpuk di ruang bakar dan memicu letupan api.'
      },
      {
        tanya: 'Berapa rasio takaran baku beras dan air untuk 3, 4, 5, dan 6 cup beras Miyako?',
        kunci: 'Rasio baku: 3 cup beras : 4 cup air; 4 cup : 5 cup air; 5 cup : 6 cup air; 6 cup : 8 cup air.'
      },
      {
        tanya: 'Mengapa setelah tombol COOK jegleg nasi wajib didiamkan 15 menit sebelum dipindahkan?',
        kunci: 'Agar uap panas di dalam wadah meresap ke inti bulir nasi sehingga nasi matang sempurna (tanak), pulen, dan tidak mudah berair/basi.'
      },
      {
        tanya: 'Berapa batas maksimal nasi boleh berada di dalam rice cooker gas setelah jegleg dan apa resikonya jika lewat?',
        kunci: 'Maksimal 30 menit. Jika lebih dari 30 menit, nasi bagian dasar dan pinggir akan kering, menguning, dan berkerak keras.'
      },
      {
        tanya: 'Bagaimana prosedur pencucian wadah penanak rice cooker gas setelah operasional?',
        kunci: 'Rendang wadah dengan air sekitar 20 menit, bersihkan sisa nasi menggunakan solet plastik, cuci dengan sabun dan busa spon kasar (dilarang busa kawat agar lapisan anti-lengket tidak rusak), lalu bilas bersih.'
      }
    ]
  },

  // =========================================================================
  // 2. Teh Racikan Manis (8 Liter / 10 Liter - 40 Cup)
  // =========================================================================
  {
    id: 'prod-02-teh-racikan',
    nama: 'Teh Racikan Manis (8 Liter / 10 Liter - 40 Cup)',
    kode: 'HC-SOP-KIT-16',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 1',
    stationLabel: 'Station 1 / Station 2',
    divisi: 'Kasir',
    stdDetik: 2280,
    targetWaktuMenit: 38.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 1080,
    gramaturLabel: 'Teh 80g + Gula 1kg',
    deskripsi: 'Ekstraksi teh racikan melati wangi HARA batch 8-10 Liter (40 cup) dengan penyaringan ganda dan sealing 160°C.',
    alatBahan: 'Alat: Panci Rebus 10L, Kompor Gas, Saringan Besar & Saringan Halus Kecil, Wadah Jumbo Teh, Sendok Pengaduk Besar, Mesin Cup Sealer (suhu 160 C), Timbangan Digital. Bahan: Teh racikan 1 bungkus (80 gr), Gula pasir 1 kg, Air bersih 8 Liter (4L air mendidih + 4L air matang galon; untuk Hara Extra Dine-In total air 10 Liter).',
    titikKritis: [
      'Gula pasir 1 kg dan teh racikan 80 gr ditimbang digital akurat',
      'Rebus awal tepat 4 liter air hingga mendidih sebelum teh dan gula masuk',
      'Wajib didiamkan tertutup selama 20 menit agar aroma dan warna terekstraksi pekat',
      'Penyaringan 2x menggunakan saringan besar dan halus untuk mencegah ampas lolos'
    ],
    tahapanWaktu: {
      persiapanMenit: 3.0,
      prosesMasakMenit: 30.0,
      finishingPlatingMenit: 5.0,
      persiapanDetik: 180,
      prosesMasakDetik: 1800,
      finishingPlatingDetik: 300,
      keterangan: 'Prep: 3 mnt (Timbang teh 80g & gula 1kg) | Masak: 10 mnt didihkan 4L air + 20 mnt seduh tertutup | Saji: 5 mnt (Saring 2x ke Jumbo, tambah 4L matang, seal 160C)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Timbang gula pasir 1 kg dan siapkan 1 bungkus teh racikan resmi (80 gr).' },
      { nomor: 2, teks: 'Masukkan 4 liter air bersih ke dalam panci, panaskan di atas kompor dengan api besar hingga mendidih (~10 menit).' },
      { nomor: 3, teks: 'Masukkan 1 bungkus teh (80 gr) dan 1 kg gula pasir ke dalam air mendidih, aduk perlahan hingga gula larut.', isKritis: true },
      { nomor: 4, teks: 'Matikan api kompor, tutup panci rapat-rapat, dan diamkan selama 20 menit agar sari teh terekstraksi pekat.', isKritis: true },
      { nomor: 5, teks: 'Siapkan wadah Jumbo Teh bersih, letakkan saringan besar dan saringan halus di atasnya.' },
      { nomor: 6, teks: 'Saring larutan teh panas ke dalam Jumbo Teh untuk memisahkan seluruh ampas daun teh.', isKritis: true },
      { nomor: 7, teks: 'Tambahkan air matang dingin sebanyak 4 liter (untuk Take-Away total 8L air; untuk fasilitas Hara Extra Dine-In tambahkan air hingga total 10L), lalu aduk merata.' },
      { nomor: 8, teks: 'Penyajian pesanan: Siapkan cup 14 oz, beri es kristal sesuai takaran garis, tuangkan 200 ml air teh manis.' },
      { nomor: 9, teks: 'Tutup cup menggunakan mesin Cup Sealer yang telah dipanaskan pada suhu 160 C (lampu indikator merah menyala) hingga tersegel rapat anti-bocor.', isKritis: true }
    ],
    autoQuestions: [
      {
        tanya: 'Berapa gramatur teh, gula pasir, dan volume air rebusan awal untuk 1 resep es teh 40 cup?',
        kunci: 'Teh racikan 1 bungkus (80 gr), gula pasir 1 kg, dan direbus awal menggunakan 4 liter air mendidih.'
      },
      {
        tanya: 'Berapa lama teh yang sudah direbus wajib didiamkan dalam panci tertutup sebelum disaring?',
        kunci: 'Wajib didiamkan tertutup selama 20 menit agar aroma wangi dan warna pekat teh keluar maksimal.'
      },
      {
        tanya: 'Berapa perbedaan total volume air teh untuk pesanan Take-Away dibandingkan Hara Extra Dine-In?',
        kunci: 'Take-Away total air 8 Liter (4L rebus + 4L air matang); sedangkan Hara Extra Dine-In total air 10 Liter (free refill).'
      },
      {
        tanya: 'Berapa batas waktu maksimal penyimpanan (holding time) teh manis di dalam wadah Jumbo?',
        kunci: 'Maksimal 12 jam di suhu ruang. Jika saat closing malam masih tersisa banyak dan layak, pindahkan ke teko tertutup di dalam showcase.'
      },
      {
        tanya: 'Berapa pengaturan suhu standar mesin Cup Sealer dan bagaimana perlakuan jika pelanggan memesan teh tanpa es / panas?',
        kunci: 'Suhu Cup Sealer 160 C. Jika request tanpa es penuhi cup dengan air biasa; jika request panas penuhi dengan air panas dispenser.'
      }
    ]
  },

  // =========================================================================
  // 3. Sup Sayur Kaldu Hara Extra (1 Resep = 6 Liter)
  // =========================================================================
  {
    id: 'prod-03-sup-sayur',
    nama: 'Sup Sayur Kaldu Hara Extra (1 Resep = 6 Liter)',
    kode: 'HC-SOP-KIT-09',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 1',
    stationLabel: 'Station 1 (Rebus & Sayur)',
    divisi: 'Kitchen',
    stdDetik: 2100,
    targetWaktuMenit: 35.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 600,
    gramaturLabel: 'Kol 600g + Wortel 250g',
    deskripsi: 'Pembuatan sup kaldu sayuran segar 6 Liter dengan aromatik kapulaga & bawang putih, wortel, kol, dan seledri simpan warm.',
    alatBahan: 'Alat: Panci Rebus 10L, Wajan Tumis, Cobek Batu, Pisau Sayur, Talenan Hijau (Sayur), Sendok Takar 15 ml, Mesin Slow Cooker Sup. Bahan: Bawang putih 30 gr, Kapulaga 6 butir, Kol (kubis) 600 gr, Wortel 250 gr, Seledri 3 batang, Daun bawang (loncang) 1 batang, Mix garam 4,5 sdm takar (67,5 gr), Royco Ayam 2 sachet, Air bersih 6 Liter (5L rebus + 1L tumis), Minyak goreng 5 sdm takar.',
    titikKritis: [
      'Uleg bawang putih 30g dan 6 kapulaga hingga halus di cobek batu',
      'Wortel direbus tepat 2 menit, kol tepat 2 menit sebelum api dimatikan',
      'Api kompor WAJIB dimatikan sebelum memasukkan daun seledri & loncang agar tidak layu hitam/kecut',
      'Pindahkan langsung ke Slow Cooker mode WARM'
    ],
    tahapanWaktu: {
      persiapanMenit: 12.0,
      prosesMasakMenit: 20.0,
      finishingPlatingMenit: 3.0,
      persiapanDetik: 720,
      prosesMasakDetik: 1200,
      finishingPlatingDetik: 180,
      keterangan: 'Prep: 12 mnt (Kupas, cuci, rajang sayuran & uleg bumbu) | Masak: 20 mnt (Rebus 5L air + tumis bumbu di 1L air, wortel 2m, kol 2m) | Saji: 3 mnt (Matikan api, masuk daun bawang/seledri, masuk Slow Cooker)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Cuci bersih seluruh sayuran (baput, kapulaga, kol, wortel, seledri, loncang) di bawah air mengalir.' },
      { nomor: 2, teks: 'Potong wortel bulat tipis-tipis, potong kol kecil melebar (buang tulang daun tengahnya), iris halus seledri dan daun bawang.' },
      { nomor: 3, teks: 'Uleg bawang putih (30 gr) dan kapulaga (6 butir) di cobek batu sampai benar-benar halus.', isKritis: true },
      { nomor: 4, teks: 'Rebus 5 liter air bersih di panci utama dengan api besar sampai mendidih (~12 menit).' },
      { nomor: 5, teks: 'Panaskan 5 sdm takar minyak goreng di wajan dengan api kecil, tumis bumbu halus baput dan kapulaga sampai wangi harum keemasan.' },
      { nomor: 6, teks: 'Tambahkan 1 liter air ke dalam tumisan bumbu, besarkan api, dan tunggu sampai mendidih.' },
      { nomor: 7, teks: 'Tuangkan tumisan bumbu ke dalam panci rebusan air 5 liter yang sudah mendidih, aduk rata.' },
      { nomor: 8, teks: 'Tambahkan mix garam 4,5 sdm takar (67,5 gr) dan 2 sachet Royco Ayam, aduk hingga bumbu larut sempurna.', isKritis: true },
      { nomor: 9, teks: 'Masukkan potongan wortel, pasang timer dan tunggu tepat 2 menit.' },
      { nomor: 10, teks: 'Masukkan potongan kol, pasang timer dan tunggu tepat 2 menit.' },
      { nomor: 11, teks: 'MATIKAN API KOMPOR TERLEBIH DAHULU.', isKritis: true },
      { nomor: 12, teks: 'Masukkan irisan daun seledri dan daun loncang, aduk rata, lalu lakukan uji rasa (sensory test) menggunakan sendok cicip.' },
      { nomor: 13, teks: 'Pindahkan sup sayur ke wadah Slow Cooker Sup yang telah diatur pada mode WARM.' }
    ],
    autoQuestions: [
      {
        tanya: 'Sebutkan takaran baku bawang putih, kapulaga, mix garam, dan penyedap untuk 1 resep sup sayur (6 Liter)!',
        kunci: 'Bawang putih 30 gr, kapulaga 6 butir, mix garam 4,5 sdm takar (67,5 gr), dan Royco Ayam 2 sachet.'
      },
      {
        tanya: 'Bagaimana urutan baku memasukkan sayuran ke dalam panci kaldu sup dan berapa menit masing-masing?',
        kunci: 'Wortel dimasukkan pertama (tunggu 2 menit) -> Kol dimasukkan kedua (tunggu 2 menit) -> Api kompor dimatikan -> Seledri dan loncang dimasukkan terakhir.'
      },
      {
        tanya: 'Mengapa api kompor WAJIB dimatikan sebelum daun seledri dan daun bawang dimasukkan?',
        kunci: 'Agar daun seledri dan loncang tidak overcooked/layu kehitaman, aroma segar tetap terjaga, dan kuah sup tidak cepat berubah kecut/asam.'
      },
      {
        tanya: 'Bagaimana standar penanganan sisa sup sayur saat closing shift malam?',
        kunci: 'Sesuai SOP HC-SOP-11-PKP Hal 45, sisa sup sayur TIDAK BOLEH dijual kembali esok hari (boleh dikonsumsi staf atau dibuang ke limbah organik).'
      },
      {
        tanya: 'Bagaimana prosedur pembersihan wadah dan mesin Slow Cooker setelah operasional selesai?',
        kunci: 'Pastikan kabel stop kontak dicabut, cuci wadah keramik/stainless dengan spon busa halus dan sabun (dilarang busa kawat), lalu lap mesin luar dengan kain setengah basah dan keringkan.'
      }
    ]
  },

  // =========================================================================
  // 4. Goreng Ayam Potong Krispi (Deep Fryer 2-3 Kg)
  // =========================================================================
  {
    id: 'prod-04-ayam-krispi',
    nama: 'Goreng Ayam Potong Krispi (Deep Fryer 2-3 Kg)',
    kode: 'HC-SOP-KIT-02',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2 (Deep Fryer & Dusting)',
    divisi: 'Kitchen',
    stdDetik: 1080,
    targetWaktuMenit: 18.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 160,
    requiresGramatur: true,
    targetGramatur: 2500,
    gramaturLabel: '2-3 kg ayam potong',
    deskripsi: 'Proses dusting 2x penepungan dan penggorengan deep fryer suhu 160°C selama 12 menit dengan interval goyang tiap 3 menit.',
    alatBahan: 'Alat: Deep Fryer Kompor Gas, Termometer Tusuk/Minyak, Meja Dusting Stainless, Keranjang Celup Air, Ayakan Tepung, Capitan Ayam Panjang, Warmer Showcase, Lap Kotak Kering. Bahan: Ayam potong marinasi cair (suhu normal 0-4 C, berat 2-3 kg/batch), Tepung bumbu krispi, Air bersih celupan, Minyak goreng Deep Fryer.',
    titikKritis: [
      'Suhu minyak deep fryer stabil di 160°C saat dropping ayam',
      'Dusting 2x penepungan cubit memutar tanpa remas keras',
      'Goyang keranjang fryer setiap 3 menit (menit ke-3, 6, dan 9)',
      'Tiriskan minyak 30 detik sebelum pindah ke warmer showcase'
    ],
    tahapanWaktu: {
      persiapanMenit: 4.0,
      prosesMasakMenit: 12.0,
      finishingPlatingMenit: 2.0,
      persiapanDetik: 240,
      prosesMasakDetik: 720,
      finishingPlatingDetik: 120,
      keterangan: 'Prep: 4 mnt (Cek suhu 160C, dusting 2x penepungan) | Masak: 12 mnt (Goreng deep fryer, goyang keranjang tiap 3 mnt) | Saji: 2 mnt (Tiriskan, pindah warmer dg capitan)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Putar setelan knop kompor Deep Fryer ke 175 C. Gunakan termometer minyak untuk memastikan suhu minyak stabil di 160 C saat ayam masuk.', isKritis: true },
      { nomor: 2, teks: 'Cuci tangan 6 langkah dan keringkan dengan Lap Kotak Kering khusus dusting.' },
      { nomor: 3, teks: 'Periksa kondisi ayam marinasi thawing (pastikan daging segar, serat tidak berlendir, dan inti daging tidak membeku es).' },
      { nomor: 4, teks: 'Masukkan potongan ayam ke atas tepung bumbu di meja dusting satu per satu sambil dihitung (kapasitas 2-3 kg per batch).' },
      { nomor: 5, teks: 'Dusting Pertama: Aduk memutar dan cubit-cubit lembut potongan ayam agar tepung menempel merata (hindari menekan/meremas keras).', isKritis: true },
      { nomor: 6, teks: 'Ketuk perlahan potongan ayam ke dinding meja dusting bagian dalam agar sisa tepung berlebih rontok.' },
      { nomor: 7, teks: 'Masukkan ayam ke dalam keranjang air celupan satu per satu, rendam selama 3-5 detik, lalu angkat dan tiriskan sampai air tidak menetes.' },
      { nomor: 8, teks: 'Dusting Kedua: Masukkan ayam kembali ke tepung bumbu kering, aduk memutar dan kibas-kibas ringan hingga terbentuk keriting alami mekar.', isKritis: true },
      { nomor: 9, teks: 'Masukkan ayam satu per satu ke dalam minyak panas suhu 160 C, pasang timer tepat 12 menit.', isKritis: true },
      { nomor: 10, teks: 'Goyangkan keranjang deep fryer secara perlahan setiap 3 menit sekali (menit ke-3, ke-6, dan ke-9) agar ayam tidak saling menempel dan matang merata.', isKritis: true },
      { nomor: 11, teks: 'Setelah 12 menit, angkat keranjang, tiriskan minyak selama 30 detik.' },
      { nomor: 12, teks: 'Pindahkan ayam ke etalase Warmer Showcase menggunakan capitan ayam (pintu warmer dibuka sedikit sekitar 1 cm selama 10 menit awal agar uap panas keluar dan kulit tetap renyah tahan lama).' }
    ],
    autoQuestions: [
      {
        tanya: 'Berapa setelan suhu knop kompor gas fryer dan berapa suhu minyak wajib saat ayam dimasukkan?',
        kunci: 'Setelan kompor di angka 175 C, dan suhu minyak saat ayam dimasukkan wajib terkalibrasi tepat 160 C.'
      },
      {
        tanya: 'Berapa kapasitas minimal dan maksimal ayam potong dalam sekali penggorengan (batch)?',
        kunci: 'Minimal 2 kg dan maksimal 3 kg per batch (sesuai kapasitas tampung minyak deep fryer agar suhu tidak anjlok drastis).'
      },
      {
        tanya: 'Kesalahan teknik penepungan apa yang menyebabkan kulit ayam krispi menjadi keras/bantat dan tidak keriting?',
        kunci: 'Menekan/meremas ayam terlalu kuat saat dusting, mendiamkan ayam bertepung terlalu lama sebelum masuk minyak, atau mengayak tepung tidak rutin.'
      },
      {
        tanya: 'Mengapa keranjang deep fryer wajib digoyang setiap 3 menit sekali selama penggorengan 12 menit?',
        kunci: 'Agar potongan ayam tidak saling menempel, minyak panas bersirkulasi ke seluruh permukaan rongga daging, dan kematangan merata bebas darah.'
      },
      {
        tanya: 'Berapa suhu internal daging (core temperature) ayam matang aman santap dan berapa batas holding time di warmer?',
        kunci: 'Core temperature minimal 74 C dekat tulang paha/dada. Batas holding time di warmer suhu 60-70 C maksimal 120 menit (2 jam).'
      }
    ]
  },

  // =========================================================================
  // 5. Goreng Ayam Utuh (Whole Chicken / AU)
  // =========================================================================
  {
    id: 'prod-05-ayam-utuh',
    nama: 'Goreng Ayam Utuh (Whole Chicken / AU)',
    kode: 'HC-SOP-KIT-04',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'Station 3 / Station 1',
    divisi: 'Kitchen',
    stdDetik: 1080,
    targetWaktuMenit: 18.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 150,
    requiresGramatur: false,
    deskripsi: 'Penggorengan 1 ekor ayam karkas utuh suhu 150°C durasi 12 menit dengan pembalikan tiap 3 menit dan packing box AU lengkap 2 sambal.',
    alatBahan: 'Alat: Deep Fryer, Termometer, Capitan Ayam Panjang, Meja Dusting, Box Ayam Utuh, Plastik Bening 1/4 kg. Bahan: 1 ekor Ayam Utuh karkas thawing (showcase), Tepung bumbu krispi, Air celupan, 1 cup Sambal Bawang (30g), 1 cup Sambal Daun Jeruk (30g), 5 potong Timun segar.',
    titikKritis: [
      'Suhu minyak Deep Fryer wajib diatur stabil pada 150°C (lebih rendah dari ayam potong)',
      'Ayam utuh wajib dimekarkan perlahan saat dimasukkan menghadap ke atas',
      'Balik ayam utuh setiap 3 menit sekali',
      'Posisi di box wajib tengkurap rapi, dilarang terlentang'
    ],
    tahapanWaktu: {
      persiapanMenit: 3.0,
      prosesMasakMenit: 12.0,
      finishingPlatingMenit: 3.0,
      persiapanDetik: 180,
      prosesMasakDetik: 720,
      finishingPlatingDetik: 180,
      keterangan: 'Prep: 3 mnt (Cek suhu 150C, dusting 2x penepungan AU) | Masak: 12 mnt (Goreng 150C, mekarkan perlahan, balik tiap 3 mnt) | Saji: 3 mnt (Tiriskan, packing Box AU lengkap 2 sambal & timun plastik)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Atur suhu kompor dan termometer minyak Deep Fryer stabil di angka 150 C (suhu lebih rendah dari ayam potong agar rongga dada matang tanpa gosong).', isKritis: true },
      { nomor: 2, teks: 'Lakukan penepungan pertama pada Ayam Utuh, kibas perlahan, celupkan ke air celupan, lalu tiriskan.' },
      { nomor: 3, teks: 'Masukkan ke penepungan kedua, balurkan tepung sambil sedikit dimekarkan pada rongga paha dan sayap.', isKritis: true },
      { nomor: 4, teks: 'Masukkan Ayam Utuh ke minyak suhu 150 C secara perlahan dengan posisi ayam dimekarkan menghadap ke atas.', isKritis: true },
      { nomor: 5, teks: 'Goreng selama 12 menit tepat. Bolak-balik posisi ayam setiap 3 menit sekali secara hati-hati agar rongga dalam matang sempurna.', isKritis: true },
      { nomor: 6, teks: 'Setelah 12 menit dan ayam mengambang keemasan, angkat dan tiriskan minyak.' },
      { nomor: 7, teks: 'Siapkan Box Ayam Utuh, alasi dengan kertas nasi.' },
      { nomor: 8, teks: 'Masukkan Ayam Utuh matang ke dalam box (posisi ayam tengkurap rapi, tidak boleh terlentang).', isKritis: true },
      { nomor: 9, teks: 'Masukkan 1 cup Sambal Bawang (30g), 1 cup Sambal Daun Jeruk (30g), dan 5 potong timun segar yang telah dibungkus rapi dalam plastik bening 1/4 kg ke dalam box.' }
    ],
    autoQuestions: [
      {
        tanya: 'Mengapa suhu minyak untuk menggoreng Ayam Utuh diatur 150 C (bukan 160 C seperti ayam potong)?',
        kunci: 'Karena volume dan ketebalan daging ayam utuh lebih padat; suhu 150 C memastikan panas menembus ke tulang tanpa membuat kulit luar gosong duluan.'
      },
      {
        tanya: 'Bagaimana teknik penting saat memasukkan Ayam Utuh ke dalam minyak deep fryer?',
        kunci: 'Ayam utuh wajib dimekarkan perlahan dengan capitan agar minyak panas masuk ke dalam rongga dada dan rongga paha.'
      },
      {
        tanya: 'Berapa interval waktu pembalikan Ayam Utuh selama 12 menit proses penggorengan?',
        kunci: 'Dibalik setiap 3 menit sekali secara berkala agar punggung dan dada matang seimbang.'
      },
      {
        tanya: 'Sebutkan 3 item pelengkap wajib yang harus disertakan di dalam kemasan Box Ayam Utuh!',
        kunci: '1 cup sambal bawang (30g), 1 cup sambal daun jeruk (30g), dan 5 potong timun segar berplastik bening.'
      },
      {
        tanya: 'Bagaimana aturan posisi meletakkan Ayam Utuh di dalam kemasan box penyajian?',
        kunci: 'Posisi ayam diletakkan tengkurap/telungkup rapi dengan sayap dan paha simetris, DILARANG posisi terlentang.'
      }
    ]
  },

  // =========================================================================
  // 6. Goreng Kulit Krispi (Porsi 50g -> Matang 60g)
  // =========================================================================
  {
    id: 'prod-06-kulit-krispi',
    nama: 'Goreng Kulit Krispi (Porsi 50g -> Matang 60g)',
    kode: 'HC-SOP-KIT-03',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'Station 3 / Station 1',
    divisi: 'Kitchen',
    stdDetik: 1500,
    targetWaktuMenit: 25.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 150,
    requiresGramatur: true,
    targetGramatur: 60,
    gramaturLabel: 'Mentah 50g -> Matang 60g',
    deskripsi: 'Timbang mentah 50g TARE, dusting 2x, goreng deep fryer 150°C 12 menit, dinginkan suhu ruang, timbang 60g dan hand-seal.',
    alatBahan: 'Alat: Timbangan Digital 5 kg, Meja Dusting, Deep Fryer, Termometer Minyak, Nampan Pendingin, Mesin Sealer Kulit (Hand Sealer). Bahan: Kulit ayam mentah order produksi (pack 500 gr), Tepung bumbu krispi, Plastik kemasan porsi kulit.',
    titikKritis: [
      'Timbang kulit mentah tepat 50g per porsi menggunakan timbangan digital TARE',
      'Goreng di minyak 150°C selama 12 menit hingga renyah',
      'Wajib DINGIN SEMPURNA di suhu ruang sebelum di-seal agar tidak melempem dan basi',
      'Timbang hasil matang seberat 60g per porsi'
    ],
    tahapanWaktu: {
      persiapanMenit: 5.0,
      prosesMasakMenit: 12.0,
      finishingPlatingMenit: 8.0,
      persiapanDetik: 300,
      prosesMasakDetik: 720,
      finishingPlatingDetik: 480,
      keterangan: 'Prep: 5 mnt (Timbang mentah 50g, panaskan fryer 150C, dusting 2x) | Masak: 12 mnt (Goreng suhu 150C) | Saji: 8 mnt (Tiriskan, dinginkan, timbang matang 60g, seal plastik)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Siapkan kulit ayam mentah, timbang menggunakan timbangan digital tepat 50 gr per porsi mentah (gunakan wadah yang sudah di-TARE).', isKritis: true },
      { nomor: 2, teks: 'Putar knop suhu kompor ke 150 C dan pastikan suhu minyak terukur tepat 150 C.', isKritis: true },
      { nomor: 3, teks: 'Lakukan 2 kali penepungan pada kulit (dusting tepung -> celup air -> dusting tepung kedua sambil dikibas-kibas agar tidak menggumpal).' },
      { nomor: 4, teks: 'Masukkan kulit ke Deep Fryer, pasang timer dan goreng selama 12 menit hingga kering keemasan dan tidak ada bagian yang kenyal.', isKritis: true },
      { nomor: 5, teks: 'Angkat dan tiriskan minyak di atas rak tiris stainless.' },
      { nomor: 6, teks: 'Pindahkan kulit ke nampan bersih, tunggu hingga kulit BENAR-BENAR DINGIN di suhu ruang (jangan langsung dibungkus panas-panas).', isKritis: true },
      { nomor: 7, teks: 'Timbang kulit matang seberat 60 gr per porsi.', isKritis: true },
      { nomor: 8, teks: 'Masukkan ke dalam plastik kemasan, rapatkan dengan Mesin Sealer Kulit pada suhu angka 3-4, tekan penjepit hingga lampu indikator mati, lalu kembalikan pengatur suhu sealer ke angka 0.' }
    ],
    autoQuestions: [
      {
        tanya: 'Berapakah gramatur standar 1 porsi kulit mentah dibandingkan hasil matangnya setelah digoreng?',
        kunci: '1 porsi kulit mentah ditimbang 50 gr, dan hasil matangnya menjadi 60 gr per porsi.'
      },
      {
        tanya: 'Berapa suhu minyak Deep Fryer dan berapa menit durasi menggoreng kulit krispi?',
        kunci: 'Suhu minyak wajib stabil di 150 C dan digoreng selama 12 menit tepat.'
      },
      {
        tanya: 'Mengapa kulit krispi matang wajib ditunggu dingin sempurna sebelum dimasukkan plastik dan di-seal?',
        kunci: 'Jika di-seal saat masih panas/hangat, uap panas akan terperangkap di dalam plastik dan membuat kulit krispi melempem serta cepat basi.'
      },
      {
        tanya: 'Berapa lama masa simpan (daya tahan) kulit krispi matang yang telah di-seal rapat?',
        kunci: 'Kulit matang bertahan selama 1,5 hari di tempat kering tertutup.'
      },
      {
        tanya: 'Bagaimana prosedur pengoperasian dan pengaturan angka pada Mesin Sealer Kulit yang benar?',
        kunci: 'Tancapkan kabel, atur suhu di angka 3-4, jepit plastik hingga lampu indikator merah mati, lalu wajib kembalikan knop ke angka 0 setelah selesai.'
      }
    ]
  },

  // =========================================================================
  // 7. Terong Krispi (1 Porsi = 10 Slice)
  // =========================================================================
  {
    id: 'prod-07-terong-krispi',
    nama: 'Terong Krispi (1 Porsi = 10 Slice)',
    kode: 'HC-SOP-KIT-11',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'Station 3 (Extra & Fryer)',
    divisi: 'Kitchen',
    stdDetik: 1500,
    targetWaktuMenit: 25.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 150,
    requiresGramatur: false,
    deskripsi: 'Pemotongan 20 slice terong, marinasi bawang & garam 10 menit, dusting 2x breader, goreng 150°C 5 menit, porsi saji 10 slice.',
    alatBahan: 'Alat: Pisau Dapur, Talenan Hijau, Cobek Batu, Wadah Marinasi Extra, Deep Fryer, Piring Extra / Kertas Ayam. Bahan: 1 buah Terong Ungu sedang (dipotong jadi 20 slice), Bawang putih 2 siung, Mix garam 5 sdm takar (75 gr), Air bersih 1 Liter, Tepung breader.',
    titikKritis: [
      '1 buah terong dipotong tepat menjadi 20 slice (tebal ~0,5 cm)',
      'Marinasi dalam 1L air + 2 siung baput halus + 5 sdm mix garam selama 10 menit',
      'Goreng deep fryer suhu 150°C selama 5 menit dibolak-balik',
      '1 porsi saji standar berisi 10 slice'
    ],
    tahapanWaktu: {
      persiapanMenit: 6.0,
      prosesMasakMenit: 17.0,
      finishingPlatingMenit: 2.0,
      persiapanDetik: 360,
      prosesMasakDetik: 1020,
      finishingPlatingDetik: 120,
      keterangan: 'Prep: 6 mnt (Potong 20 slice, uleg marinasi) | Masak: 17 mnt (Rendam marinasi 10 mnt, dusting 2x, goreng 5 mnt di 150C) | Saji: 2 mnt (Tiriskan & platting 10 slice/porsi + saus)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Cuci bersih terong ungu dengan air mengalir. Pilih terong bertekstur kencang dan segar.' },
      { nomor: 2, teks: 'Potong terong menjadi 20 slice per 1 buah (terong besar dipotong lurus setebal ~0,5 cm, terong kecil dipotong miring).', isKritis: true },
      { nomor: 3, teks: 'Buat Air Marinasi Extra: uleg halus 2 siung bawang putih dan 5 sdm takar (75 gr) mix garam di cobek, larutkan ke dalam 1 liter air di wadah marinasi, aduk rata.' },
      { nomor: 4, teks: 'Masukkan potongan terong ke dalam air marinasi extra dan diamkan selama tepat 10 menit agar bumbu meresap.', isKritis: true },
      { nomor: 5, teks: 'Panaskan Deep Fryer hingga suhu minyak mencapai 150 C.', isKritis: true },
      { nomor: 6, teks: 'Penepungan 2x: Ambil potongan terong dari air marinasi, masukkan ke tepung breader (aduk pelan agar tepung melekat) -> celupkan ke air bersih 1 detik -> angkat dan tiriskan -> masukkan kembali ke tepung kedua dan aduk rata.' },
      { nomor: 7, teks: 'Masukkan terong ke Deep Fryer suhu 150 C, goreng selama 5 menit sambil dibolak-balik agar kedua sisi krispi keemasan.', isKritis: true },
      { nomor: 8, teks: 'Angkat dan tiriskan minyak.' },
      { nomor: 9, teks: 'Penyajian: Sajikan 10 slice terong krispi per porsi di piring extra (dine-in) atau bungkus rapi dengan kertas ayam + 1 sachet saus cabai/tomat (take-away).' }
    ],
    autoQuestions: [
      {
        tanya: 'Mengapa terong mentah dilarang keras disimpan di dalam showcase pendingin dan berapa lama batas simpannya?',
        kunci: 'Suhu dingin showcase merusak jaringan terong sehingga cepat lembek dan berbintik hitam. Terong mentah wajib disimpan di ruang terbuka kering maks 3 hari.'
      },
      {
        tanya: 'Sebutkan takaran baku Air Marinasi Extra untuk merendam terong dan berapa menit perendamannya!',
        kunci: '2 siung bawang putih uleg + 5 sdm takar (75 gr) mix garam + 1 liter air bersih, direndam selama 10 menit.'
      },
      {
        tanya: 'Satu buah terong dipotong menjadi berapa slice dan berapa slice standar penyajian untuk 1 porsi saji?',
        kunci: '1 buah terong dipotong menjadi 20 slice. 1 porsi saji berisi 10 slice terong krispi.'
      },
      {
        tanya: 'Berapa suhu minyak Deep Fryer dan durasi waktu menggoreng terong krispi?',
        kunci: 'Suhu minyak 150 C dan digoreng selama 5 menit sambil dibolak-balik.'
      },
      {
        tanya: 'Berapa batas waktu penyimpanan terong krispi matang di dalam warmer dan bolehkah dijual esok hari?',
        kunci: 'Maksimal 1 jam di warmer. Sesuai SOP, sisa terong matang TIDAK BOLEH dijual kembali esok hari.'
      }
    ]
  },

  // =========================================================================
  // 8. Tempe & Tahu Krispi (1 Porsi = 4 Pcs)
  // =========================================================================
  {
    id: 'prod-08-tempe-tahu',
    nama: 'Tempe & Tahu Krispi (1 Porsi = 4 Pcs)',
    kode: 'HC-SOP-KIT-12',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'Station 3 (Extra & Fryer)',
    divisi: 'Kitchen',
    stdDetik: 1380,
    targetWaktuMenit: 23.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 150,
    requiresGramatur: false,
    deskripsi: 'Irisan simetris tempe/tahu jadi 4 pcs, marinasi 10 menit, breading 2x, goreng deep fryer 150°C 5 menit bolak-balik.',
    alatBahan: 'Alat: Pisau, Talenan, Wadah Marinasi Extra, Deep Fryer (150 C), Piring Extra / Kertas Ayam. Bahan: Tempe murni 1 potong (diiris jadi 4 slice) atau Tahu putih/kuning 2 pcs utuh (dibelah 2 jadi 4 pcs), Bawang putih 2 siung, Mix garam 5 sdm (75 gr), Air 1 Liter, Tepung breader.',
    titikKritis: [
      '1 potong tempe diiris simetris jadi 4 slice atau 2 tahu dibelah jadi 4 pcs',
      'Marinasi 10 menit di air rendaman bawang dan garam',
      'Goreng di minyak 150°C selama 5 menit',
      'Holding time maksimal 1 jam di warmer, dilarang jual esok hari'
    ],
    tahapanWaktu: {
      persiapanMenit: 5.0,
      prosesMasakMenit: 17.0,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 300,
      prosesMasakDetik: 1020,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 5 mnt (Iris tempe/tahu, uleg marinasi) | Masak: 17 mnt (Marinasi 10 mnt, dusting 2x, goreng 5 mnt 150C) | Saji: 1 mnt (Tiriskan & sajikan 4 pcs + saus)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Iris 1 potong tempe dari produksi menjadi 4 slice simetris (atau belah 2 buah tahu utuh masing-masing jadi 2 bagian sehingga menjadi 4 pcs).', isKritis: true },
      { nomor: 2, teks: 'Siapkan air marinasi extra: 2 siung bawang putih halus + 5 sdm mix garam (75 gr) dilarutkan dalam 1 liter air bersih.' },
      { nomor: 3, teks: 'Masukkan tempe/tahu ke dalam air marinasi dan diamkan selama 10 menit.', isKritis: true },
      { nomor: 4, teks: 'Panaskan Deep Fryer dengan suhu minyak 150 C.', isKritis: true },
      { nomor: 5, teks: 'Penepungan 2x: Masukkan potongan tempe/tahu ke tepung breader, aduk pelan -> celup ke air celupan 1 detik -> tiriskan -> masukkan ke tepung kedua dan aduk rata hingga bertekstur keriting.' },
      { nomor: 6, teks: 'Goreng di Deep Fryer suhu 150 C selama 5 menit sambil dibolak-balik agar matang merata.', isKritis: true },
      { nomor: 7, teks: 'Angkat dan tiriskan minyak.' },
      { nomor: 8, teks: 'Penyajian: Tata 4 pcs tempe/tahu krispi per porsi di piring extra (dine-in) atau bungkus kertas ayam + 1 sachet saus sambal/tomat (take-away).' }
    ],
    autoQuestions: [
      {
        tanya: 'Satu porsi Tempe Krispi atau Tahu Krispi berisi berapa potong (pcs) saat disajikan?',
        kunci: '1 porsi saji berisi 4 potong (pcs) tempe krispi atau tahu krispi.'
      },
      {
        tanya: 'Berapa lama tempe mentah dan tahu mentah boleh disimpan di dalam showcase pendingin?',
        kunci: 'Tempe mentah dan tahu mentah bertahan maksimal 3 hari di dalam showcase pendingin.'
      },
      {
        tanya: 'Berapa suhu minyak dan durasi waktu penggorengan tempe dan tahu krispi?',
        kunci: 'Digoreng pada suhu minyak 150 C selama 5 menit sambil dibolak-balik.'
      },
      {
        tanya: 'Berapa lama batas maksimal tempe dan tahu krispi matang disimpan di dalam warmer?',
        kunci: 'Maksimal 1 jam di etalase warmer. Jika lewat tekstur menurun dan wajib ditarik (tidak boleh dijual lagi).'
      },
      {
        tanya: 'Apakah tempe dan tahu krispi sisa closing malam boleh disimpan di freezer untuk digoreng/dijual lagi besok?',
        kunci: 'TIDAK BOLEH. Sisa tempe dan tahu matang tidak boleh dijual kembali esok hari demi menjaga standar mutu dan keamanan pangan.'
      }
    ]
  },

  // =========================================================================
  // 9. Jamur Enoki Krispi (1 Bks Jadi 2 Porsi @ 50 gr)
  // =========================================================================
  {
    id: 'prod-09-jamur-enoki',
    nama: 'Jamur Enoki Krispi (1 Bks Jadi 2 Porsi @ 50 gr)',
    kode: 'HC-SOP-KIT-13',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'All Crew / Station 3',
    divisi: 'Kitchen',
    stdDetik: 360,
    targetWaktuMenit: 6.0,
    requiresOilTemp: true,
    targetSuhuMinyak: 150,
    requiresGramatur: true,
    targetGramatur: 50,
    gramaturLabel: '50 gr per porsi',
    deskripsi: '1 bungkus enoki (100g) dibagi 2 @ 50g, pipihkan mekar kipas, breading 2x, goreng 150°C 3 menit, tabur 2,5g bumbu kentang.',
    alatBahan: 'Alat: Pisau, Timbangan 5 kg, Meja Dusting, Deep Fryer (150 C), Sendok Ukur 2,5 ml (1/2 sdt), Piring Extra / Kertas Ayam. Bahan: Jamur Enoki 1 bungkus (100 gr dibagi 2 porsi @ 50 gr), Tepung breader, Bumbu kentang tabur 2,5 gr (1/2 sdt).',
    titikKritis: [
      '1 pack 100g dibagi tepat 2 porsi @ 50g',
      'Pipihkan batang jamur hingga mekar bentuk kipas agar kriuk menyeluruh',
      'Goreng di suhu 150°C selama 3 menit bolak-balik',
      'Taburkan bumbu kentang 2,5 gr (1/2 sdt takar)'
    ],
    tahapanWaktu: {
      persiapanMenit: 2.0,
      prosesMasakMenit: 3.0,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 120,
      prosesMasakDetik: 180,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 2 mnt (Bagi 2 porsi, potong akar, pipihkan mekar, dusting 2x) | Masak: 3 mnt (Goreng suhu 150C bolak-balik) | Saji: 1 mnt (Tiriskan, tabur 2,5g bumbu kentang & packing)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Siapkan 1 bungkus jamur enoki (100 gr), cuci dengan air bersih mengalir.' },
      { nomor: 2, teks: 'Bagi jamur menjadi 2 porsi simetris (@ 50 gr per porsi).', isKritis: true },
      { nomor: 3, teks: 'Potong sedikit pokok akar bagian paling bawah yang kotor/berwarna gelap.' },
      { nomor: 4, teks: 'Pipihkan dan renggangkan batang jamur enoki menggunakan jari tangan agar mekar menyerupai bentuk kipas.', isKritis: true },
      { nomor: 5, teks: 'Penepungan 2x: Balurkan ke tepung breader -> celupkan ke air bersih sebentar -> tiriskan -> balurkan kembali ke tepung kedua dan rapikan bentuk mekarnya.' },
      { nomor: 6, teks: 'Panaskan Deep Fryer pada suhu minyak 150 C.', isKritis: true },
      { nomor: 7, teks: 'Masukkan jamur enoki, goreng selama 3 menit sambil dibolak-balik secara perlahan agar renyah dan tidak gosong.', isKritis: true },
      { nomor: 8, teks: 'Angkat dan tiriskan minyak hingga tuntas.' },
      { nomor: 9, teks: 'Taburkan bumbu kentang 2,5 gr (sendok ukur 2,5 ml / 1/2 sdt) di atas jamur enoki krispi.', isKritis: true },
      { nomor: 10, teks: 'Sajikan di piring extra (dine-in) atau bungkus kertas ayam + 1 sachet saus (take-away).' }
    ],
    autoQuestions: [
      {
        tanya: 'Satu bungkus jamur enoki kemasan 100 gr dibagi menjadi berapa porsi dan berapa gram per porsinya?',
        kunci: 'Dibagi menjadi 2 porsi saji dengan berat masing-masing 50 gr.'
      },
      {
        tanya: 'Bagaimana prosedur pembungkusan jamur enoki yang benar sebelum disimpan di dalam showcase?',
        kunci: 'Akar dipotong terlebih dahulu, dibungkus dengan kertas terlebih dahulu, lalu dibungkus plastik rapat (bertahan 3 hari di showcase).'
      },
      {
        tanya: 'Mengapa jamur enoki harus dipipihkan mekar menyerupai kipas sebelum ditepungi?',
        kunci: 'Agar tepung bumbu masuk ke sela-sela batang jamur dan saat digoreng menghasilkan tekstur kriuk mekar yang renyah gurih.'
      },
      {
        tanya: 'Berapa suhu minyak, durasi goreng, dan takaran bumbu tabur untuk 1 porsi jamur enoki krispi?',
        kunci: 'Suhu minyak 150 C, digoreng selama 3 menit bolak-balik, dan ditaburi 2,5 gr (1/2 sdt takar) bumbu kentang.'
      },
      {
        tanya: 'Berapa batas waktu maksimal jamur enoki krispi matang disimpan di etalase warmer?',
        kunci: 'Maksimal 1 jam di warmer showcase. Lewat dari 1 jam tekstur krispi menurun dan jamur menjadi alot.'
      }
    ]
  },

  // =========================================================================
  // 10. Kentang Goreng (French Fries 100 gr)
  // =========================================================================
  {
    id: 'prod-10-french-fries',
    nama: 'Kentang Goreng (French Fries 100 gr)',
    kode: 'HC-SOP-KIT-08',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'All Crew / Wajan Minyak',
    divisi: 'Kitchen',
    stdDetik: 480,
    targetWaktuMenit: 8.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 100,
    gramaturLabel: '100 gr per porsi',
    deskripsi: 'Goreng kentang porsian 100g beku di wajan 500ml minyak api sedang selama 5 menit, tabur 2,5g bumbu kentang.',
    alatBahan: 'Alat: Wajan Penggorengan, Sutil Stainless, Serok Peniris, Timbangan Digital, Sendok Ukur 2,5 ml, Piring Extra / Kertas Ayam. Bahan: Kentang beku (French Fries) 1 porsi (100 gr dari kemasan 2 kg = 20 porsi), Minyak goreng 500 ml, Bumbu tabur kentang 2,5 gr (1/2 sdt).',
    titikKritis: [
      'Kemasan 2 kg wajib di-repacking porsi @ 100 gr beku',
      'Volume minyak 500 ml api sedang',
      'Goreng tepat 5 menit hingga kuning keemasan',
      'Tabur 2,5 gr bumbu kentang (sendok takar 2,5 ml / 1/2 sdt)'
    ],
    tahapanWaktu: {
      persiapanMenit: 2.0,
      prosesMasakMenit: 5.0,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 120,
      prosesMasakDetik: 300,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 2 mnt (Takar kentang 100g, panaskan 500ml minyak) | Masak: 5 mnt (Goreng di wajan api sedang) | Saji: 1 mnt (Tiriskan, campur 2,5g bumbu kentang, packing kertas ayam + 1 saus)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Ambil 1 bungkus kentang beku porsian 100 gr dari freezer (kentang 2 kg dari produksi wajib dipacking ulang @ 100 gr sebelum disimpan).', isKritis: true },
      { nomor: 2, teks: 'Siapkan wajan yang telah diisi 500 ml minyak goreng bersih.' },
      { nomor: 3, teks: 'Nyalakan kompor dengan api sedang, tunggu hingga minyak benar-benar panas (~2 menit).' },
      { nomor: 4, teks: 'Masukkan kentang beku 100 gr ke dalam minyak panas.' },
      { nomor: 5, teks: 'Goreng selama 5 menit sambil sesekali diaduk perlahan hingga kentang berwarna kuning keemasan dan bertekstur garing di luar lembut di dalam.', isKritis: true },
      { nomor: 6, teks: 'Angkat dan tiriskan minyak di atas serok peniris.' },
      { nomor: 7, teks: 'Tuang kentang ke wadah campur, taburkan bumbu kentang sebanyak 2,5 gr (sendok takar 2,5 ml / 1/2 sdt), lalu goyangkan hingga bumbu merata.', isKritis: true },
      { nomor: 8, teks: 'Penyajian: Sajikan di piring kecil (dine-in dengan saus botol) atau bungkus kertas ayam + 1 sachet saus cabai/tomat (take-away).' }
    ],
    autoQuestions: [
      {
        tanya: 'Satu pack kentang beku 2 kg dari produksi dibagi menjadi berapa porsi dan berapa gram per porsinya?',
        kunci: '1 pack kentang 2 kg dibagi menjadi 20 porsi dengan berat tepat 100 gr per bungkus/porsi.'
      },
      {
        tanya: 'Di mana kentang mentah wajib disimpan dan bagaimana status stok opname (SO)-nya?',
        kunci: 'Disimpan di dalam freezer (suhu -18 C) dalam kondisi sudah dipacking per porsi 100 gr. Stok opname dihitung per bungkus/porsi.'
      },
      {
        tanya: 'Berapa volume minyak goreng di wajan dan berapa lama durasi menggoreng kentang?',
        kunci: 'Volume minyak 500 ml, digoreng selama 5 menit di minyak panas api sedang.'
      },
      {
        tanya: 'Berapa takaran baku sendok ukur bumbu kentang yang ditaburkan pada 1 porsi kentang goreng?',
        kunci: '2,5 gr bumbu kentang (menggunakan sendok ukur 2,5 ml atau 1/2 sdt takar).'
      },
      {
        tanya: 'Apa kelengkapan saus standar untuk pembelian kentang goreng Take-Away vs Dine-In?',
        kunci: 'Take-Away mendapatkan 1 pcs saus sachet (pilih saus sambal atau tomat); Dine-In menggunakan saus botol di meja makan.'
      }
    ]
  },

  // =========================================================================
  // 11. Bayam Krispi (Spinach - 1 Resep 100 gr)
  // =========================================================================
  {
    id: 'prod-11-bayam-krispi',
    nama: 'Bayam Krispi (Spinach - 1 Resep 100 gr)',
    kode: 'HC-SOP-KIT-14',
    day: 'Day 2',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2 (Wajan Sayur)',
    divisi: 'Kitchen',
    stdDetik: 1500,
    targetWaktuMenit: 25.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 100,
    gramaturLabel: '100 gr bayam petik',
    deskripsi: 'Rajang tipis daun bayam 100g, goreng wajan 500ml minyak api sedang tepat 90 detik (3-4 batch), tabur bumbu kentang 2,5g.',
    alatBahan: 'Alat: Pisau Rajang, Talenan Hijau, Wajan Penggorengan, Sutil, Serok Halus Tiris, Toples Display Spinach, Sendok Takar 15 ml & 2,5 ml. Bahan: Daun bayam segar petik 100 gr, Minyak goreng 500 ml, Bumbu tabur kentang 2,5 gr (1/2 sdt).',
    titikKritis: [
      'Tiriskan bayam cucian sampai benar-benar kering sebelum masuk minyak',
      'Goreng per batch (3-4 tahap) selama tepat 90 detik (1,5 menit)',
      'Sajikan 1 porsi dengan takaran 2 sendok makan takar (30 ml)',
      'Simpan toples tertutup di warmer ayam bagian bawah'
    ],
    tahapanWaktu: {
      persiapanMenit: 15.0,
      prosesMasakMenit: 7.0,
      finishingPlatingMenit: 3.0,
      persiapanDetik: 900,
      prosesMasakDetik: 420,
      finishingPlatingDetik: 180,
      keterangan: 'Prep: 15 mnt (Petik, cuci, tiriskan & rajang tipis 100g bayam) | Masak: 7 mnt (Goreng 90 dtk per batch di 500ml minyak) | Saji: 3 mnt (Tiriskan, tabur 2,5g bumbu, toples warmer)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Timbang daun bayam petik segar seberat 100 gr, cuci bersih di bawah air mengalir, lalu tiriskan hingga tidak ada air menggenang.', isKritis: true },
      { nomor: 2, teks: 'Rajang atau iris tipis-tipis daun bayam di atas talenan hijau.' },
      { nomor: 3, teks: 'Panaskan 500 ml minyak goreng di wajan menggunakan api sedang.' },
      { nomor: 4, teks: 'Setelah minyak panas, masukkan irisan daun bayam secukupnya (goreng secara bertahap dalam 3-4 batch agar tidak menggumpal).' },
      { nomor: 5, teks: 'Goreng selama tepat 90 detik (1,5 menit) sampai bayam krispi kering kehijauan.', isKritis: true },
      { nomor: 6, teks: 'Angkat menggunakan serok halus dan tiriskan minyak hingga tuntas.' },
      { nomor: 7, teks: 'Taburkan bumbu kentang 2,5 gr (sendok takar 2,5 ml / 1/2 sdt), aduk lembut hingga rata.', isKritis: true },
      { nomor: 8, teks: 'Masukkan ke dalam toples spinach tertutup dan display di warmer ayam bagian bawah.' },
      { nomor: 9, teks: 'Penyajian pesanan: Takar 1 porsi spinach menggunakan 2 sdm takar (30 ml), sajikan di piring kecil (dine-in) atau bungkus plastik klip di luar box (take-away).' }
    ],
    autoQuestions: [
      {
        tanya: 'Berapa detik durasi penggorengan bayam (spinach) di wajan dan bagaimana intensitas apinya?',
        kunci: 'Digoreng selama 90 detik (1,5 menit) menggunakan api sedang dengan 500 ml minyak goreng panas.'
      },
      {
        tanya: 'Berapa takaran saji resmi untuk 1 porsi Spinach saat disajikan ke pelanggan?',
        kunci: '1 porsi saji resmi adalah 2 sendok makan takar (2 sdm takar).'
      },
      {
        tanya: 'Di mana lokasi display penyimpanan toples Spinach matang di outlet?',
        kunci: 'Disimpan di dalam toples tertutup pada etalase Warmer Ayam bagian bawah.'
      },
      {
        tanya: 'Berapa lama batas maksimal penyimpanan Spinach di suhu ruang biasa?',
        kunci: 'Penyimpanan spinach di suhu ruang biasa tidak boleh lebih dari 1-2 jam (harus tetap renyah).'
      },
      {
        tanya: 'Apakah sisa Spinach matang saat closing malam boleh disimpan dan dijual kembali esok hari?',
        kunci: 'Sesuai SOP HC-SOP-11-PKP Hal 46, Spinach TERMASUK bahan yang BOLEH disimpan di dalam chiller dan dijual kembali esok hari asalkan disimpan dalam wadah aman.'
      }
    ]
  },

  // =========================================================================
  // 12. Scramble Egg (1 Butir Jadi 2 Porsi)
  // =========================================================================
  {
    id: 'prod-12-scramble-egg',
    nama: 'Scramble Egg (1 Butir Jadi 2 Porsi)',
    kode: 'HC-SOP-KIT-15',
    day: 'Day 2',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2 (Wajan Telur)',
    divisi: 'Kitchen',
    stdDetik: 300,
    targetWaktuMenit: 5.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: '1 butir telur dikocok bersama 1/4g mix garam dan 1 sdm susu UHT, dimasak di wajan 3 sdm minyak baru api sedang menjadi 2 porsi saji.',
    alatBahan: 'Alat: Mangkuk Kecil, Garpu/Whisk, Wajan Kecil Telur, Spatula Kayu/Sutil, Sendok Takar 15 ml, Toples Scramble Egg. Bahan: 1 butir Telur ayam segar, Mix garam 1/4 gr sendok takar, Susu UHT putih 1 sdm takar (15 ml), Minyak goreng baru 3 sdm (besi).',
    titikKritis: [
      '1 butir telur menghasilkan tepat 2 porsi scramble egg',
      'Wajib menggunakan 3 sdm minyak goreng BARU (dilarang jelantah)',
      'Aduk konsisten (orik-arik) hingga terbentuk butiran lembut',
      'Holding time maksimal 8 jam di showcase pendingin'
    ],
    tahapanWaktu: {
      persiapanMenit: 1.5,
      prosesMasakMenit: 2.5,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 90,
      prosesMasakDetik: 150,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 1.5 mnt (Kocok 1 telur + 1/4g mix garam + 1 sdm susu UHT) | Masak: 2.5 mnt (Aduk terus di wajan 3 sdm minyak baru api sedang) | Saji: 1 mnt (Bagi 2 porsi ke toples warmer)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Pecahkan 1 butir telur ayam segar ke dalam mangkuk kecil.' },
      { nomor: 2, teks: 'Tambahkan 1/4 gr sendok takar mix garam dan 1 sdm sendok takar (15 ml) susu UHT putih.', isKritis: true },
      { nomor: 3, teks: 'Kocok campuran telur menggunakan garpu/whisk sampai benar-benar tercampur merata dan lembut.' },
      { nomor: 4, teks: 'Panaskan 3 sdm minyak goreng baru di atas wajan dengan api sedang (jangan gunakan minyak bekas/jelantah).', isKritis: true },
      { nomor: 5, teks: 'Setelah wajan panas, tuangkan kocokan telur.' },
      { nomor: 6, teks: 'Masak telur sambil diaduk-aduk terus menerus (orik-arik) secara konsisten sampai matang lembut dan berbentuk butiran scramble.', isKritis: true },
      { nomor: 7, teks: 'Angkat dan bagi menjadi 2 porsi simetris (1 butir telur menghasilkan tepat 2 porsi scramble egg).', isKritis: true },
      { nomor: 8, teks: 'Masukkan ke dalam toples scramble egg tertutup dan display di warmer ayam bagian bawah.' },
      { nomor: 9, teks: 'Penyajian pesanan: piring kecil untuk dine-in, atau masukkan ke plastik klip dan letakkan di luar box makanan untuk take-away.' }
    ],
    autoQuestions: [
      {
        tanya: 'Satu butir telur ayam menghasilkan berapa porsi saji Scramble Egg?',
        kunci: '1 butir telur menghasilkan tepat 2 porsi saji Scramble Egg.'
      },
      {
        tanya: 'Sebutkan takaran baku mix garam dan susu UHT untuk 1 butir telur Scramble Egg!',
        kunci: '1/4 gr sendok takar mix garam dan 1 sdm (15 ml) sendok takar susu UHT putih.'
      },
      {
        tanya: 'Berapa sendok minyak goreng yang digunakan dan apa syarat kualitas minyaknya?',
        kunci: 'Menggunakan 3 sendok makan minyak goreng BARU (dilarang menggunakan minyak jelantah/bekas gorengan lain).'
      },
      {
        tanya: 'Berapa lama daya simpan Scramble Egg jika disimpan di dalam showcase pendingin?',
        kunci: 'Penyimpanan Scramble Egg di dalam showcase pendingin bertahan selama 8 jam.'
      },
      {
        tanya: 'Bagaimana kemasan penyajian Scramble Egg untuk pesanan Take-Away?',
        kunci: 'Dibungkus menggunakan plastik klip higienis dan diletakkan di luar box makanan (tidak dicampur langsung di dalam box panas).'
      }
    ]
  },

  // =========================================================================
  // 13. Indomie Rebus / Indomie Geprek
  // =========================================================================
  {
    id: 'prod-13-indomie-geprek',
    nama: 'Indomie Rebus / Indomie Geprek',
    kode: 'HC-SOP-KIT-25',
    day: 'Day 2',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2 (Panci Mie)',
    divisi: 'Kitchen',
    stdDetik: 600,
    targetWaktuMenit: 10.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Rebus mie dalam 500ml air mendidih tepat 2 menit, saring tiriskan, aduk bumbu, tata rapi bersama ayam geprek.',
    alatBahan: 'Alat: Panci Rebus Kecil, Saringan Mie Stainless, Mangkuk Keramik, Garpu/Sumpit, Box Besar / Piring Saji. Bahan: 1 bungkus Indomie Goreng/Kuah, Air bersih 500 ml, Kertas nasi utuh 1 lembar (take-away).',
    titikKritis: [
      'Rebus mie dalam 500 ml air mendidih tepat 2 menit (jangan overcooked)',
      'Saring dan dinginkan 15-30 detik sebelum diaduk ke bumbu agar tidak benyek',
      'Tata mie dan ayam berdampingan rapi di piring atau box beralas kertas utuh',
      'Kasir wajib infokan estimasi waktu tunggu 10 menit'
    ],
    tahapanWaktu: {
      persiapanMenit: 4.0,
      prosesMasakMenit: 2.0,
      finishingPlatingMenit: 4.0,
      persiapanDetik: 240,
      prosesMasakDetik: 120,
      finishingPlatingDetik: 240,
      keterangan: 'Prep: 4 mnt (Didihkan 500ml air, siapkan bumbu) | Masak: 2 mnt (Rebus mie 2 menit) | Saji: 4 mnt (Saring, dinginkan, aduk bumbu di mangkok + tata box bersebelahan)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Masukkan 500 ml air bersih ke dalam panci kecil, nyalakan kompor api besar dan rebus sampai benar-benar mendidih (~3-4 menit).' },
      { nomor: 2, teks: 'Sembari menunggu air mendidih, buka bungkus Indomie dan tuangkan seluruh bumbu minyak dan bubuk ke dalam mangkuk saji.' },
      { nomor: 3, teks: 'Masukkan mie Indomie ke dalam air mendidih, pasang timer tepat 2 menit.', isKritis: true },
      { nomor: 4, teks: 'Rebus mie selama 2 menit (jangan overcooked agar tekstur kenyal dan tidak lembek).', isKritis: true },
      { nomor: 5, teks: 'Angkat dan saring mie menggunakan saringan stainless, tiriskan dan dinginkan sebentar (~15-30 detik).', isKritis: true },
      { nomor: 6, teks: 'Pindahkan mie ke dalam mangkuk yang sudah berisi bumbu, aduk merata menggunakan garpu sampai seluruh bumbu terserap.' },
      { nomor: 7, teks: 'Penyajian Indomie Extra: piring extra (dine-in) atau box kecil beralas 1/4 kertas nasi (take-away).' },
      { nomor: 8, teks: 'Penyajian Indomie Ayam Geprek: Tata mie dan ayam geprek bersebelahan rapi di piring besar (dine-in) atau di box besar beralas 1 lembar kertas nasi utuh, beri 2 slice timun di atas ayam geprek, lalu tutup kertas nasi dan letakkan sendok di atas kertas penutup (take-away).', isKritis: true }
    ],
    autoQuestions: [
      {
        tanya: 'Berapa volume air dan berapa lama durasi merebus mie Indomie sesuai SOP?',
        kunci: 'Direbus dalam 500 ml air mendidih selama tepat 2 menit.'
      },
      {
        tanya: 'Mengapa mie Indomie harus disaring dan didinginkan sebentar sebelum diaduk ke mangkuk bumbu?',
        kunci: 'Agar sisa air panas tiris tuntas dan mie tidak menjadi lembek/benyek saat bercampur dengan bumbu minyak.'
      },
      {
        tanya: 'Bagaimana penataan Indomie Ayam Geprek Take-Away di dalam kemasan box?',
        kunci: 'Box besar beralas 1 lembar kertas nasi utuh, mie dan ayam ditata bersebelahan rapi, 2 slice timun di atas ayam, sendok di atas kertas nasi penutup.'
      },
      {
        tanya: 'Berapa estimasi waktu tunggu yang wajib diinformasikan kasir ke pelanggan untuk menu Indomie?',
        kunci: 'Kasir wajib memberikan estimasi waktu tunggu kurang lebih 10 menit kepada pelanggan.'
      },
      {
        tanya: 'Kapan saringan dan panci rebusan mie wajib dicuci bersih?',
        kunci: 'Setiap selesai digunakan dan air rebusan mie keruh wajib diganti air baru, dicuci bersih saat pergantian shift.'
      }
    ]
  },

  // =========================================================================
  // 14. Sambal Bawang Uleg Cobek (1 Resep = 6 Porsi @ 30 gr)
  // =========================================================================
  {
    id: 'prod-14-sambal-bawang',
    nama: 'Sambal Bawang Uleg Cobek (1 Resep = 6 Porsi @ 30 gr)',
    kode: 'HC-SOP-GEP-03',
    day: 'Day 2',
    batch: 'Batch 1',
    station: 'Station 3',
    stationLabel: 'Station 3 (Cobek Batu & Wajan)',
    divisi: 'Geprek',
    stdDetik: 1500,
    targetWaktuMenit: 25.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 180,
    gramaturLabel: '30 gr per cup (6 porsi)',
    deskripsi: 'Goreng cabai rawit merah 150g & baput 35g layu, uleg cobek batu dengan garam 7g, siram 60ml minyak panas, timbang 30g/cup.',
    alatBahan: 'Alat: Timbangan Digital 5 kg, Pisau, Wajan Goreng, Cobek Batu Asli & Ulekan, Mangkuk Stainless, Sendok Cicip, Cup Sambung Plastik. Bahan: Cabai rawit merah segar 150 gr, Bawang putih 35 gr, Mix garam 7 gr, Minyak untuk menggoreng bahan 200 ml, Minyak panas penyiram 60 ml.',
    titikKritis: [
      'Cabai dan bawang wajib dipotong 2 bagian agar tidak meletus saat digoreng',
      'DILARANG MENGGUNAKAN BLENDER (wajib uleg cobek batu asli)',
      'Siram 60 ml minyak panas ke atas sambal dan aduk rata',
      'Timbang tepat 30 gr per cup sambung (1 resep = 6 porsi)'
    ],
    tahapanWaktu: {
      persiapanMenit: 6.0,
      prosesMasakMenit: 15.0,
      finishingPlatingMenit: 4.0,
      persiapanDetik: 360,
      prosesMasakDetik: 900,
      finishingPlatingDetik: 240,
      keterangan: 'Prep: 6 mnt (Timbang bahan, potong 2 bagian) | Masak: 15 mnt (Goreng layu 3-5 mnt, uleg halus cobek batu, siram 60ml minyak panas) | Saji: 4 mnt (Dinginkan & timbang 30g ke 6 cup)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Timbang cabai rawit merah 150 gr dan bawang putih 35 gr menggunakan timbangan digital 5 kg.' },
      { nomor: 2, teks: 'Cuci bersih cabai dan bawang putih, lalu potong cabai rawit dan bawang putih menjadi dua bagian (wajib dipotong agar tidak meletus saat digoreng).', isKritis: true },
      { nomor: 3, teks: 'Panaskan 200 ml minyak di wajan dengan api kecil.' },
      { nomor: 4, teks: 'Masukkan cabai rawit dan bawang putih, goreng selama 3-5 menit sampai layu, lalu angkat dan tiriskan.' },
      { nomor: 5, teks: 'Pindahkan bahan goreng layu ke cobek batu, tambahkan 7 gr mix garam.' },
      { nomor: 6, teks: 'Uleg manual menggunakan ulekan batu sampai halus merata (DILARANG KERAS MENGGUNAKAN BLENDER).', isKritis: true },
      { nomor: 7, teks: 'Pindahkan sambal yang sudah diuleg halus ke dalam mangkuk stainless.' },
      { nomor: 8, teks: 'Panaskan 60 ml minyak (gunakan minyak bekas goreng bahan sambal) hingga panas.', isKritis: true },
      { nomor: 9, teks: 'Siramkan 60 ml minyak panas tersebut ke atas sambal di mangkuk stainless, aduk rata menggunakan sendok hingga minyak dan sambal menyatu.', isKritis: true },
      { nomor: 10, teks: 'Lakukan uji cicip rasa (sensory test).' },
      { nomor: 11, teks: 'Tunggu sambal dingin, lalu timbang tepat 30 gr per porsi ke dalam cup sambung (1 resep menghasilkan 6 cup sambal bawang @ 30 gr).', isKritis: true },
      { nomor: 12, teks: 'Simpan cup sambal bawang di dalam showcase pendingin dan display sedikit demi sedikit di meja depan.' }
    ],
    autoQuestions: [
      {
        tanya: 'Mengapa cabai rawit dan bawang putih WAJIB dipotong menjadi dua bagian sebelum digoreng?',
        kunci: 'Untuk melepaskan tekanan udara di dalam cabai/bawang sehingga tidak meletus dan mencipratkan minyak panas ke kru.'
      },
      {
        tanya: 'Mengapa Sambal Bawang HARA dilarang keras dihaluskan menggunakan mesin blender?',
        kunci: 'Blender merusak tekstur otentik sambal uleg batu, membuat sambal terlalu berair/berbusa, dan mengubah cita rasa khas HARA.'
      },
      {
        tanya: 'Sebutkan takaran gramatur cabai, bawang putih, mix garam, dan minyak penyiram untuk 1 resep Sambal Bawang!',
        kunci: 'Cabai rawit merah 150 gr, bawang putih 35 gr, mix garam 7 gr, digoreng di 200 ml minyak, dan disiram 60 ml minyak panas.'
      },
      {
        tanya: 'Satu resep Sambal Bawang menghasilkan berapa porsi dan berapa gram timbangan baku per porsinya?',
        kunci: 'Menghasilkan 6 porsi dengan berat tepat 30 gram per cup sambung.'
      },
      {
        tanya: 'Berapa lama masa simpan Sambal Bawang di suhu ruang meja display vs di dalam showcase?',
        kunci: 'Bertahan maksimal 8 jam di suhu ruang meja display, dan bertahan selama 2 hari di dalam showcase pendingin (resep mentah 3 hari).'
      }
    ]
  },

  // =========================================================================
  // 15. Sambal Matah Segar (1 Resep = 10 Cup @ 30 gr)
  // =========================================================================
  {
    id: 'prod-15-sambal-matah',
    nama: 'Sambal Matah Segar (1 Resep = 10 Cup @ 30 gr)',
    kode: 'HC-SOP-GEP-01',
    day: 'Day 2',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2 / Station 3',
    divisi: 'Geprek',
    stdDetik: 1500,
    targetWaktuMenit: 25.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 300,
    gramaturLabel: '30 gr per cup (10 porsi)',
    deskripsi: 'Rajang halus 5 bahan segar (cabai 115g, bamer 115g, baput 18g, serai, daun jeruk), beri jeruk nipis & garam 15g, siram 75ml minyak panas.',
    alatBahan: 'Alat: Pisau Iris Tajam, Talenan Bersih, Timbangan 5 kg, Wajan Panas, Mangkuk Stainless, Cup Sambung. Bahan 1 Resep: Cabai rawit merah 115 gr, Bawang putih 18 gr, Bawang merah 115 gr, Serai 1 batang, Daun jeruk 1 lembar besar / 2 kecil (buang tulang daun), Jeruk nipis 1/8 buah, Mix garam 15 gr, Minyak goreng BARU 75 ml.',
    titikKritis: [
      'Iris tipis halus 5 bahan segar dan serai hanya bagian putihnya saja',
      'Buang tulang tangkai daun jeruk sebelum diiris memanjang',
      'Wajib siram 75 ml Minyak Goreng BARU yang panas mendidih',
      'Timbang tepat 30 gr per cup sambung'
    ],
    tahapanWaktu: {
      persiapanMenit: 15.0,
      prosesMasakMenit: 5.0,
      finishingPlatingMenit: 5.0,
      persiapanDetik: 900,
      prosesMasakDetik: 300,
      finishingPlatingDetik: 300,
      keterangan: 'Prep: 15 mnt (Timbang, cuci, rajang halus 5 bahan segar) | Masak: 5 mnt (Peras nipis + mix garam 15g, siram 75ml minyak baru panas) | Saji: 5 mnt (Aduk, cicip & timbang 30g ke 10 cup)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Cuci bersih seluruh bahan mentah di bawah air mengalir.' },
      { nomor: 2, teks: 'Iris lurus kecil dan tipis cabai rawit merah (115g), bawang putih (18g), bawang merah (115g), serai (1 batang bagian putihnya saja), dan daun jeruk (buang tulang tangkainya dulu).', isKritis: true },
      { nomor: 3, teks: 'Satukan seluruh irisan bahan segar ke dalam mangkuk stainless.' },
      { nomor: 4, teks: 'Tambahkan perasan air jeruk nipis dari 1/8 buah jeruk nipis segar.' },
      { nomor: 5, teks: 'Tambahkan mix garam sebanyak 15 gr, lalu aduk-aduk perlahan sampai seluruh bahan tercampur rata.', isKritis: true },
      { nomor: 6, teks: 'Panaskan 75 ml minyak goreng BARU di wajan hingga benar-benar panas mendidih.', isKritis: true },
      { nomor: 7, teks: 'Siramkan minyak panas tersebut secara merata ke atas mangkuk bahan sambal (akan berdesis mengeluarkan aroma harum segar).', isKritis: true },
      { nomor: 8, teks: 'Aduk cepat hingga minyak dan bumbu tercampur sempurna, lalu lakukan uji cicip rasa.' },
      { nomor: 9, teks: 'Setelah suhu sambal dingin, timbang ke dalam cup sambung seberat 30 gr per porsi (Jogja 1 resep jadi 10 porsi; Klaten/Sukoharjo 1 resep jadi 5 porsi).', isKritis: true },
      { nomor: 10, teks: 'Simpan cup sambal di showcase pendingin, display sedikit demi sedikit di meja depan.' }
    ],
    autoQuestions: [
      {
        tanya: 'Sebutkan 7 komposisi bahan segar beserta gramaturnya untuk membuat 1 resep Sambal Matah!',
        kunci: 'Cabai rawit merah 115g, bawang putih 18g, bawang merah 115g, serai 1 btg, daun jeruk 1-2 lbr, jeruk nipis 1/8 buah, dan mix garam 15g.'
      },
      {
        tanya: 'Minyak jenis apa yang digunakan untuk menyiram Sambal Matah dan berapa volumenya?',
        kunci: 'Wajib menggunakan Minyak Goreng BARU sebanyak 75 ml dalam kondisi benar-benar panas mendidih.'
      },
      {
        tanya: 'Bagaimana teknik pemotongan serai dan daun jeruk pada peracikan Sambal Matah?',
        kunci: 'Serai diambil bagian putihnya lalu diiris tipis melintang; daun jeruk dibuang tulang tengahnya lalu diiris tipis memanjang.'
      },
      {
        tanya: 'Berapa berat standar per porsi dan berapa cup hasil 1 resep Sambal Matah di outlet Jogja vs Klaten?',
        kunci: 'Berat standar 30 gr per cup/porsi. Di outlet Jogja 1 resep jadi 10 porsi; di outlet Klaten/Sukoharjo 1 resep jadi 5 porsi.'
      },
      {
        tanya: 'Berapa lama Sambal Matah bertahan di suhu ruang display dan bagaimana tanda jika sambal sudah tidak layak?',
        kunci: 'Bertahan maksimal 8 jam di suhu ruang (2 hari di showcase). Jika bawang berlendir, berbau masam basi, atau minyak memutih maka tidak boleh disajikan.'
      }
    ]
  },

  // =========================================================================
  // 16. Sambal Daun Jeruk Segar (1 Resep = 10 Cup @ 30 gr)
  // =========================================================================
  {
    id: 'prod-16-sambal-daun-jeruk',
    nama: 'Sambal Daun Jeruk Segar (1 Resep = 10 Cup @ 30 gr)',
    kode: 'HC-SOP-GEP-02',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'Station 2 / Station 3',
    divisi: 'Geprek',
    stdDetik: 1080,
    targetWaktuMenit: 18.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 300,
    gramaturLabel: '30 gr per cup (10 porsi)',
    deskripsi: 'Chopper pulse cabai merah 115g & hijau 75g, baput 20g, bamer 20g, campur irisan daun jeruk & garam 15g, siram 100ml minyak baru panas.',
    alatBahan: 'Alat: Mesin Chopper (Blender Bumbu Kecil), Pisau, Talenan, Timbangan 5 kg, Wajan, Mangkuk Stainless, Cup Sambung. Bahan 1 Resep: Cabai rawit merah 115 gr, Cabai rawit hijau 75 gr, Bawang putih 20 gr, Bawang merah 20 gr, Daun jeruk purut 10 lbr besar / 15 kecil, Mix garam 15 gr, Minyak goreng BARU 100 ml.',
    titikKritis: [
      'Chopper WAJIB menggunakan tombol PULSE agar cincang bertekstur kasar, bukan halus berair',
      'Buang tulang tengah 10-15 daun jeruk agar tidak getir/pahit',
      'Siram 100 ml minyak goreng BARU yang mendidih panas',
      'Timbang 30 gr per cup sambung (1 resep = 10 cup)'
    ],
    tahapanWaktu: {
      persiapanMenit: 8.0,
      prosesMasakMenit: 5.0,
      finishingPlatingMenit: 5.0,
      persiapanDetik: 480,
      prosesMasakDetik: 300,
      finishingPlatingDetik: 300,
      keterangan: 'Prep: 8 mnt (Petik cabai, buang tulang 10-15 daun jeruk & iris tipis) | Masak: 5 mnt (Chopper pulse, campur garam 15g, siram 100ml minyak baru panas) | Saji: 5 mnt (Aduk, cicip & timbang 30g ke 10 cup)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Petik tangkai cabai rawit merah dan cabai rawit hijau, kupas bawang putih dan bawang merah, cuci bersih semua bahan.' },
      { nomor: 2, teks: 'Ambil 10-15 lembar daun jeruk, hilangkan tangkai/tulang tengahnya, lalu tumpuk dan iris sangat tipis memanjang.', isKritis: true },
      { nomor: 3, teks: 'Siapkan mesin chopper bumbu kecil.' },
      { nomor: 4, teks: 'Masukkan cabai rawit merah (115g) dan cabai rawit hijau (75g) ke dalam chopper, tekan tombol PULSE beberapa kali (cincang kasar, jangan halus berair).', isKritis: true },
      { nomor: 5, teks: 'Masukkan bawang putih (20g) dan bawang merah (20g) ke chopper, tekan tombol PULSE hingga tercincang kasar.', isKritis: true },
      { nomor: 6, teks: 'Satukan cabai cincang dan bawang cincang bersama irisan daun jeruk ke dalam mangkuk stainless.' },
      { nomor: 7, teks: 'Tambahkan mix garam 15 gr, aduk sampai seluruh bahan tercampur rata.' },
      { nomor: 8, teks: 'Panaskan 100 ml minyak goreng BARU di wajan sampai mendidih panas.', isKritis: true },
      { nomor: 9, teks: 'Siramkan minyak panas ke dalam mangkuk campuran sambal, aduk cepat hingga minyak dan sambal menyatu, lalu lakukan uji cicip rasa.', isKritis: true },
      { nomor: 10, teks: 'Timbang ke dalam cup sambung seberat 30 gr per porsi (1 resep menghasilkan 10 cup sambal daun jeruk).', isKritis: true },
      { nomor: 11, teks: 'Simpan di dalam showcase pendingin dan display secukupnya di meja depan.' }
    ],
    autoQuestions: [
      {
        tanya: 'Mengapa saat mencincang cabai dan bawang di chopper WAJIB menggunakan tombol PULSE (bukan putaran terus menerus)?',
        kunci: 'Tombol PULSE mencincang bahan secara kasar bertekstur; jika diputar terus menerus bahan akan hancur menjadi bubur berair dan sari cabai hilang.'
      },
      {
        tanya: 'Mengapa tulang/tangkai tengah daun jeruk wajib dibuang sebelum diiris?',
        kunci: 'Tulang daun jeruk bergetah pahit dan bertekstur kaku; membuangnya memastikan sambal wangi sitrus segar tanpa rasa pahit menggigit.'
      },
      {
        tanya: 'Sebutkan takaran cabai merah, cabai hijau, dan volume minyak baru penyiram pada Sambal Daun Jeruk!',
        kunci: 'Cabai rawit merah 115 gr, cabai rawit hijau 75 gr, dan disiram menggunakan 100 ml minyak goreng baru panas.'
      },
      {
        tanya: 'Berapa berat standar per porsi dan berapa lama daya simpan sambal daun jeruk di showcase pendingin?',
        kunci: 'Berat porsi baku 30 gr per cup, bertahan selama 2 hari di showcase pendingin dalam keadaan tertutup rapat (resep mentah 3 hari).'
      },
      {
        tanya: 'Bagaimana aturan penyajian sambal daun jeruk jika pesanan geprek tidak dipisah oleh pelanggan?',
        kunci: 'Sambal ditakar 30 gr lalu dioleskan/diplatting merata langsung di atas permukaan ayam krispi yang telah dimemarkan.'
      }
    ]
  },

  // =========================================================================
  // 17. Nasi Goreng HARA & Telur Dadar (+ Geprek)
  // =========================================================================
  {
    id: 'prod-17-nasgor-telur',
    nama: 'Nasi Goreng HARA & Telur Dadar (+ Geprek)',
    kode: 'SOP-NasGorTelur-02',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'Station 3 (Wok Kompor & Cobek)',
    divisi: 'Geprek',
    stdDetik: 960,
    targetWaktuMenit: 16.0,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 170,
    gramaturLabel: 'Nasi 170g + ECO 20g TARE',
    deskripsi: 'Nasi dingin 170g TARE + bumbu ECO 20g TARE + mix sayur 30g ditumis api besar 3-4 menit, disajikan telur dadar gurih & 2 slice timun.',
    alatBahan: 'Alat: Wajan Wok, Spatula/Sutil, Mangkuk Kecil, Garpu/Whisk Telur, Timbangan Digital 5 kg, Sendok Takar 15 ml, Box Besar / Piring Saji. Bahan Nasi Goreng: Nasi putih pulen dingin 170 gr (WAJIB DITIMBANG), Minyak goreng 15 ml (sendok takar), Mix sayur beku 30 gr (sendok takar), Bumbu Nasi Goreng ECO 20 gr (WAJIB DITIMBANG). Bahan Telur Dadar: 1 butir Telur ayam segar, Mix garam 1/2 sendok takar (1 gr), Minyak goreng 50 ml. Pelengkap: Telur dadar, WAJIB 2 slice Timun segar (tebal 0,5 cm), Ayam geprek (jika paket geprek).',
    titikKritis: [
      'Nasi putih 170g dan bumbu ECO 20g WAJIB DITIMBANG DIGITAL TARE 0g',
      'Tumis bumbu api sedang, saat nasi masuk ubah ke API BESAR sambil ditekan sutil 3-4 menit',
      'Telur dadar digoreng 50ml minyak panas keemasan',
      'WAJIB diberikan 2 slice timun segar untuk semua paket nasgor'
    ],
    tahapanWaktu: {
      persiapanMenit: 4.0,
      prosesMasakMenit: 10.0,
      finishingPlatingMenit: 2.0,
      persiapanDetik: 240,
      prosesMasakDetik: 600,
      finishingPlatingDetik: 120,
      keterangan: 'Prep: 4 mnt (Timbang TARE Nasi 170g & ECO 20g, takar minyak, kocok telur) | Masak: 10 mnt (Goreng telur dadar 4m, nasgor api besar 4m, geprek 2m) | Saji: 2 mnt (Tata box alas kertas utuh, telur di atas, 2 slice timun, sendok)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Pecahkan 1 butir telur ayam ke mangkuk kecil, beri 1/2 sdt takar (1 gr) mix garam, kocok garpu hingga sedikit berbusa.' },
      { nomor: 2, teks: 'Panaskan 50 ml minyak di wajan api sedang, tuang adonan telur menyebar merata.' },
      { nomor: 3, teks: 'Setelah bawahnya keemasan, balik telur hati-hati, masak hingga matang kecokelatan keemasan, tiriskan.', isKritis: true },
      { nomor: 4, teks: 'Timbang nasi putih dingin 170 gr di atas timbangan digital (pastikan wadah sudah di-TARE/ZERO).', isKritis: true },
      { nomor: 5, teks: 'Timbang bumbu nasi goreng ECO tepat 20 gr di timbangan digital TARE.', isKritis: true },
      { nomor: 6, teks: 'Panaskan wajan wok api sedang, tambahkan 15 ml minyak goreng.' },
      { nomor: 7, teks: 'Masukkan 30 gr mix sayur, tumis sebentar hingga sedikit layu.' },
      { nomor: 8, teks: 'Masukkan 20 gr bumbu nasi goreng ECO, tumis cepat hingga tercium aroma harum gurih.' },
      { nomor: 9, teks: 'Masukkan 170 gr nasi putih. Aduk cepat dan tekan-tekan nasi menggunakan punggung sutil agar gumpalan nasi pecah dan bumbu meresap merata.' },
      { nomor: 10, teks: 'Besarkan kompor ke API BESAR. Masak selama 3-4 menit sambil terus diaduk cepat hingga nasi matang sempurna dan bertekstur kering tidak lembek.', isKritis: true },
      { nomor: 11, teks: 'Pindahkan nasi goreng ke piring saji besar (dine-in) atau ke box besar beralas 1 lembar kertas nasi utuh (take-away).' },
      { nomor: 12, teks: 'Letakkan telur dadar tepat di atas nasi goreng (jika ada ayam geprek, tata berdampingan di samping nasi).' },
      { nomor: 13, teks: 'Tambahkan WAJIB 2 slice timun segar tebal 0,5 cm.', isKritis: true },
      { nomor: 14, teks: 'Berikan sendok plastik di atas kertas penutup.' }
    ],
    autoQuestions: [
      {
        tanya: 'Berdasarkan SOP-NasGorTelur-02 Revisi 02 resmi R&D, sebutkan 2 bahan yang WAJIB ditimbang beserta beratnya!',
        kunci: 'Nasi putih 170 gr (wajib ditimbang digital TARE) dan Bumbu Nasi Goreng ECO 20 gr (wajib ditimbang digital TARE).'
      },
      {
        tanya: 'Berapa takaran sendok takar minyak goreng dan mix sayur untuk 1 porsi Nasi Goreng?',
        kunci: 'Minyak goreng 15 ml (1 sendok takar) dan mix sayur 30 gr (2 sdm takar).'
      },
      {
        tanya: 'Bagaimana pengaturan intensitas api kompor saat awal menumis sayur & bumbu vs saat nasi putih masuk?',
        kunci: 'Saat memanaskan wajan dan menumis bumbu menggunakan api sedang; saat nasi putih masuk diubah ke API BESAR sambil ditekan cepat pakai sutil.'
      },
      {
        tanya: 'Berapa takaran minyak dan mix garam untuk menggoreng 1 butir Telur Dadar pelengkap nasi goreng?',
        kunci: 'Minyak goreng 50 ml api sedang dan mix garam 1/2 sendok takar (1 gram) dikocok hingga larut berbusa halus.'
      },
      {
        tanya: 'Apakah menu Nasi Goreng Telur (tanpa ayam geprek) tetap wajib diberikan 2 slice timun segar?',
        kunci: 'YA, WAJIB. Berdasarkan SOP-NasGorTelur-02 Catatan Akhir, setiap pembelian nasi goreng telur maupun nasi goreng ayam geprek WAJIB diberi 2 slice timun.'
      }
    ]
  },

  // =========================================================================
  // 18. Ayam Geprek Saus Mentai & Ayam Krispi Saus Mentai
  // =========================================================================
  {
    id: 'prod-18-ayam-mentai',
    nama: 'Ayam Geprek Saus Mentai & Ayam Krispi Saus Mentai',
    kode: 'SOP-AyamSausMentai-01',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'Station 2 (Cobek, Torch & 2 Solet)',
    divisi: 'Geprek',
    stdDetik: 360,
    targetWaktuMenit: 6.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Ayam digeprek dan dipadatkan di atas cobek, lumuri saus mentai, bakar torch hingga kecokelatan beraroma gurih, angkat pakai 2 SOLET.',
    alatBahan: 'Alat: Cobek Batu & Ulekan, Gas Portable & Torch (Alat Bakar), Capitan Ayam, DUA BUAH SOLET (Wajib 2 pcs), Piring Saji / Box Kemasan. Bahan: 1 pcs Ayam krispi hangat sesuai pesanan, Bumbu sambal geprek (cabai & garam geprek), Saus Mentai HARA (chiller), 2 slice Timun segar.',
    titikKritis: [
      'Padatkan ayam geprek di cobek sebelum dilumuri saus mentai agar saus tidak jatuh ke sela',
      'Bakar torch WAJIB di atas COBEK BATU (dilarang keras di dalam box kertas/plastik)',
      'Wajib menggunakan DUA BUAH SOLET untuk mengangkat ayam agar tidak patah/hancur',
      'Sertakan 2 slice timun segar'
    ],
    tahapanWaktu: {
      persiapanMenit: 1.0,
      prosesMasakMenit: 3.5,
      finishingPlatingMenit: 1.5,
      persiapanDetik: 60,
      prosesMasakDetik: 210,
      finishingPlatingDetik: 90,
      keterangan: 'Prep: 1 mnt (Siapkan ayam warmer, bumbu sambal, torch & 2 solet) | Masak: 3.5 mnt (Uleg sambal, geprek ayam, oles mentai, bakar torch merata) | Saji: 1.5 mnt (Angkat dgn 2 SOLET ke box + 2 timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Siapkan bumbu sambal geprek sesuai jumlah cabai pesanan pelanggan di cobek batu, ulek hingga halus.' },
      { nomor: 2, teks: 'Ambil ayam krispi dari warmer, letakkan di atas sambal, lalu geprek hingga memar hancur merata.' },
      { nomor: 3, teks: 'Sisihkan dan kumpulkan remahan ayam geprek, lalu PADATKAN PERLAHAN dengan bentuk rapi di atas cobek.', isKritis: true },
      { nomor: 4, teks: 'Tambahkan Saus Mentai secukupnya secara merata di atas permukaan ayam yang telah dipadatkan.' },
      { nomor: 5, teks: 'Nyalakan Gas Torch, arahkan api langsung ke permukaan saus mentai DI ATAS COBEK BATU hingga saus sedikit kecokelatan dan keluar aroma mentai panggang.', isKritis: true },
      { nomor: 6, teks: 'Ambil DUA BUAH SOLET, selipkan di bawah ayam geprek mentai dari kedua sisi, lalu angkat produk secara hati-hati ke atas piring saji (dine-in) atau box kemasan (take-away).', isKritis: true },
      { nomor: 7, teks: 'Pastikan bentuk produk tertata utuh rapi dan tidak rusak/hancur saat dipindahkan.' },
      { nomor: 8, teks: 'Tambahkan 2 slice timun segar di samping ayam geprek.', isKritis: true }
    ],
    autoQuestions: [
      {
        tanya: 'Mengapa kru DIWAJIBKAN menggunakan 2 buah solet saat memindahkan Ayam Saus Mentai dari cobek ke piring/box?',
        kunci: 'Agar daging ayam yang telah dipadatkan dan dilumuri saus mentai leleh tidak patah, tidak tumpah, dan tampilannya tetap utuh rapi saat disajikan.'
      },
      {
        tanya: 'Di mana lokasi proses membakar (torching) saus mentai dilakukan dan mengapa tidak boleh di dalam box kemasan?',
        kunci: 'Wajib ditorch di atas COBEK BATU; dilarang membakar di dalam box kertas/plastik karena box akan gosong terbakar dan menimbulkan racun berbahaya.'
      },
      {
        tanya: 'Mengapa setelah ayam krispi digeprek wajib dipadatkan perlahan terlebih dahulu sebelum diberi saus mentai?',
        kunci: 'Agar saus mentai tidak merembes jatuh ke dasar cobek dan permukaan atas menjadi bidang yang rapi untuk dibakar torch secara merata.'
      },
      {
        tanya: 'Berapa lama masa simpan (daya tahan) Saus Mentai di dalam showcase pendingin sejak pengiriman dari gudang produksi?',
        kunci: 'Saus Mentai bertahan selama 5 hari di dalam showcase pendingin sejak tanggal pengiriman produksi.'
      },
      {
        tanya: 'Berapa slice timun yang wajib disertakan pada setiap penyajian Ayam Geprek Saus Mentai?',
        kunci: 'Wajib disertakan 2 slice timun segar pada setiap piring dine-in maupun box take-away.'
      }
    ]
  },

  // =========================================================================
  // 19. Ayam Geprek Saus Ayoli & Ayam Krispi Saus Ayoli
  // =========================================================================
  {
    id: 'prod-19-ayam-ayoli',
    nama: 'Ayam Geprek Saus Ayoli & Ayam Krispi Saus Ayoli',
    kode: 'SOP-SausAyoli-01',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'Station 3 / Station 2 (Cobek & Garpu)',
    divisi: 'Geprek',
    stdDetik: 210,
    targetWaktuMenit: 3.5,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Ayam digeprek lalu dipindahkan dahulu ke piring/box, aduk saus ayoli pakai GARPU hingga emulsi menyatu, tuang segar di atas ayam.',
    alatBahan: 'Alat: Cobek & Ulekan, Capitan Ayam, GARPU PENGADUK (Wajib), Piring Saji / Box Kemasan. Bahan: 1 pcs Ayam krispi hangat, Bumbu sambal geprek, 1 cup Saus Ayoli (emulsi chili oil & mayones), 2 slice Timun segar.',
    titikKritis: [
      'Pindahkan ayam geprek ke piring/box TERLEBIH DAHULU baru dituang saus ayoli',
      'Wajib aduk saus ayoli menggunakan GARPU hingga emulsi chili oil dan mayo menyatu',
      'Saus Ayoli disajikan segar langsung tuang tanpa dibakar gas torch',
      'Konfirmasi di kasir apakah saus ingin dicampur atau dipisah'
    ],
    tahapanWaktu: {
      persiapanMenit: 0.5,
      prosesMasakMenit: 2.0,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 30,
      prosesMasakDetik: 120,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 0.5 mnt (Siapkan 1 cup saus ayoli & garpu) | Masak: 2 mnt (Uleg sambal, geprek ayam, pindah piring/box, aduk ayoli pakai GARPU) | Saji: 1 mnt (Tuang saus ayoli + 2 timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Siapkan bumbu sambal geprek sesuai level pedas di cobek batu, ulek hingga halus.' },
      { nomor: 2, teks: 'Ambil ayam krispi hangat dari warmer, letakkan di cobek, lalu geprek hingga memar merata.' },
      { nomor: 3, teks: 'Pindahkan ayam geprek ke piring saji (dine-in) atau box kemasan beralas 1/4 kertas nasi (take-away) secara rapi TERLEBIH DAHULU.', isKritis: true },
      { nomor: 4, teks: 'Ambil 1 cup Saus Ayoli dari showcase pendingin.' },
      { nomor: 5, teks: 'Buka tutup cup, lalu ADUK SAUS AYOLI SECARA MERATA MENGGUNAKAN GARPU hingga emulsi chili oil dan mayones bersatu lembut (tidak memisah minyak).', isKritis: true },
      { nomor: 6, teks: 'Tuangkan saus ayoli yang sudah diaduk ke atas permukaan ayam geprek secara merata (atau sajikan dalam cup terpisah jika diminta).', isKritis: true },
      { nomor: 7, teks: 'Tambahkan 2 slice timun segar di samping ayam geprek.' }
    ],
    autoQuestions: [
      {
        tanya: 'Alat apa yang WAJIB digunakan untuk mengaduk Saus Ayoli sebelum dituangkan ke atas ayam dan mengapa?',
        kunci: 'Wajib menggunakan GARPU agar emulsi chili oil dan mayones tercampur merata dan tidak pecah/terpisah minyaknya.'
      },
      {
        tanya: 'Kapan ayam geprek dipindahkan ke piring/box: sebelum atau sesudah saus ayoli dituangkan?',
        kunci: 'Ayam geprek dipindahkan ke piring/box TERLEBIH DAHULU, baru saus ayoli dituangkan di atasnya (agar saus tidak tertinggal di cobek).'
      },
      {
        tanya: 'Apakah pelanggan diperbolehkan meminta saus ayoli dipisah dan apa syarat proseduralnya?',
        kunci: 'Boleh, dengan syarat kasir wajib memastikan/mengonfirmasi kepada pelanggan di awal saat pemesanan apakah saus ingin dicampur atau dipisah.'
      },
      {
        tanya: 'Berapa hari masa simpan Saus Ayoli di dalam showcase pendingin?',
        kunci: 'Saus Ayoli bertahan selama 5 hari di dalam showcase pendingin sejak pengiriman produksi.'
      },
      {
        tanya: 'Apakah Ayam Saus Ayoli memerlukan proses pembakaran menggunakan Gas Torch seperti Saus Mentai?',
        kunci: 'TIDAK PERLU. Saus Ayoli disajikan segar langsung tuang dingin/suhu ruang tanpa dibakar gas torch.'
      }
    ]
  },

  // =========================================================================
  // 20. Geprek ORI, Keju Parut & Mozarella (Torch Cobek)
  // =========================================================================
  {
    id: 'prod-20-geprek-trio',
    nama: 'Geprek ORI, Keju Parut & Mozarella (Torch Cobek)',
    kode: 'HC-SOP-GEP-12',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 1',
    stationLabel: 'Station 1 & Station 3 (Cobek Area)',
    divisi: 'Geprek',
    stdDetik: 210,
    targetWaktuMenit: 3.5,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Uleg cabai & bumbu geprek 1ml takar, geprek ayam krispi: Varian Ori langsung platting, Keju parut di piring, Mozarella ditorch di cobek.',
    alatBahan: 'Alat: Cobek Batu & Ulekan, Solet Plastik, Parutan Keju Stainless, Gas Portable & Torch (untuk Moza), Piring / Box Kemasan. Bahan: Ayam krispi hangat, Cabai rawit segar, Tomat segar, Bumbu geprek 1 ml takar (mix garam & terasi), Blok Keju Cheddar / Lembaran Mozarella pipih, 2 slice Timun.',
    titikKritis: [
      'Bumbu geprek ditakar sendok ukur terkecil 1 ml (1/4 sdt takar)',
      'Keju Parut diparut LANGSUNG DI ATAS PIRING/BOX (dilarang di atas cobek)',
      'Mozarella ditaruh dan ditorch saat ayam MASIH DI ATAS COBEK BATU',
      'Dilarang keras thawing mozzarella di magicom nasi / warmer'
    ],
    tahapanWaktu: {
      persiapanMenit: 0.5,
      prosesMasakMenit: 2.0,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 30,
      prosesMasakDetik: 120,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 0.5 mnt (Siapkan cabai, bumbu 1ml, keju/moza) | Masak: 2 mnt (Uleg sambal, geprek ayam, parut di piring / torch moza di cobek) | Saji: 1 mnt (Beri 2 slice timun & sendok)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Masukkan cabai rawit sesuai pesanan pelanggan, sedikit tomat, dan 1 ml sendok takar bumbu geprek ke cobek batu, ulek hingga halus.', isKritis: true },
      { nomor: 2, teks: 'Ambil ayam krispi dari warmer, geprek memar merata hingga sambal menyatu ke serat daging.' },
      { nomor: 3, teks: 'VARIAN 1 - GEPREK ORIGINAL: Pindahkan ayam geprek ke piring dine-in atau box take-away beralas 1/4 kertas nasi, beri 2 slice timun.' },
      { nomor: 4, teks: 'VARIAN 2 - GEPREK KEJU PARUT: Pindahkan ayam geprek ke piring/box terlebih dahulu. PARUT KEJU LANGSUNG DI ATAS PIRING/BOX (DILARANG MEMARUT DI ATAS COBEK!). Rapikan ceceran keju dengan solet, beri 2 slice timun.', isKritis: true },
      { nomor: 5, teks: 'VARIAN 3 - GEPREK MOZARELLA: Letakkan lembaran mozarella pipih di atas ayam geprek saat MASIH DI ATAS COBEK. Nyalakan Gas Torch dan bakar mozarella DI ATAS COBEK hingga meleleh lumer kecokelatan. Pindahkan ke piring/box menggunakan solet, beri 2 slice timun.', isKritis: true },
      { nomor: 6, teks: 'Untuk pesanan Take-Away dengan nasi: posisikan gagang sendok di atas nasi, lalu tutup box rapat.' }
    ],
    autoQuestions: [
      {
        tanya: 'Jelaskan perbedaan mendasar lokasi pemberian keju pada Geprek Keju Parut vs Geprek Mozarella!',
        kunci: 'Keju Parut diparut langsung di atas piring/box penyajian (bukan di cobek); Mozarella ditaruh dan dibakar torch saat ayam masih di atas cobek batu baru dipindahkan.'
      },
      {
        tanya: 'Berapa takaran sendok ukur bumbu geprek (mix garam & terasi) untuk 1 porsi ayam geprek?',
        kunci: 'Menggunakan sendok ukur terkecil 1 ml (1/4 sdt takar).'
      },
      {
        tanya: 'Cara apa saja yang DILARANG KERAS dilakukan untuk melunakkan/mencairkan keju Mozarella beku?',
        kunci: 'Dilarang men-thawing mozarella di dalam Magicom nasi, direndam air panas, atau diletakkan di dalam etalase Warmer Ayam.'
      },
      {
        tanya: 'Bagaimana penataan gagang sendok pada kemasan nasi ayam geprek Take-Away?',
        kunci: 'Sendok diletakkan setelah nasi dan ayam masuk ke box dengan posisi gagang sendok berada di atas nasi (bukan di atas sambal berminyak).'
      },
      {
        tanya: 'Apa yang harus dikonfirmasi kasir jika pelanggan memesan cabai level 0 (tidak pedas) pada menu geprek?',
        kunci: 'Wajib konfirmasi ulang apakah bersedia menggunakan cobek yang sudah dipakai bumbu cabai atau bersedia menunggu cobek dicuci bersih terlebih dahulu.'
      }
    ]
  },

  // =========================================================================
  // 21. Ayam Krisbar / Krispi Bakar (Geprek & Krispi)
  // =========================================================================
  {
    id: 'prod-21-ayam-krisbar',
    nama: 'Ayam Krisbar / Krispi Bakar (Geprek & Krispi)',
    kode: 'HC-SOP-KIT-07',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 1',
    stationLabel: 'Station 1 & Station 2 (Grill Pan & Cobek)',
    divisi: 'Kitchen',
    stdDetik: 390,
    targetWaktuMenit: 6.5,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Wajib 2x pencelupan bumbu krisbar dan 2x pembakaran di atas wajan grill pan bergerigi hingga harum terkaramelisasi smokey.',
    alatBahan: 'Alat: Kompor Tungku, Wajan Grill Pan Krisbar Bergerigi, Capitan Ayam Panjang, Wadah Bumbu Krisbar Stainless, Cobek Batu, Saringan Bumbu. Bahan: Ayam krispi matang, Bumbu Krisbar resmi HARA, Bumbu sambal geprek, 2 slice Timun segar.',
    titikKritis: [
      'Wajib dilakukan 2 KALI PENCELUPAN dan 2 KALI PEMBAKARAN di grill pan',
      'Bakar sambil ditekan perlahan 1,5-2 menit hingga bumbu terkaramelisasi',
      'Wadah bumbu krisbar wajib selalu ditutup rapat agar tidak didatangi serangga/lalat',
      'Saring bumbu setiap pergantian shift dan cuci wajan tiap 3x pemakaian'
    ],
    tahapanWaktu: {
      persiapanMenit: 1.0,
      prosesMasakMenit: 4.5,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 60,
      prosesMasakDetik: 270,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 1 mnt (Panaskan grill pan, buka wadah bumbu) | Masak: 4.5 mnt (Celup bumbu -> bakar -> celup ke-2x -> bakar lagi + geprek di cobek) | Saji: 1 mnt (Tata piring/box + 2 slice timun)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Panaskan wajan Grill Pan Krisbar di atas kompor dengan api sedang.' },
      { nomor: 2, teks: 'Buka wadah bumbu krisbar dan aduk perlahan agar bumbu karamel tidak mengendap di dasar.' },
      { nomor: 3, teks: 'Ambil ayam krispi matang dari warmer, celupkan seluruh permukaannya ke dalam wadah bumbu krisbar (Pencelupan Pertama).', isKritis: true },
      { nomor: 4, teks: 'Letakkan ayam di atas Grill Pan panas, bakar sambil sesekali ditekan pelan hingga bumbu terkaramelisasi harum kecokelatan (~1,5-2 menit).', isKritis: true },
      { nomor: 5, teks: 'Angkat ayam, CELUPKAN KEMBALI KE WADAH BUMBU KRISBAR UNTUK KEDUA KALINYA (WAJIB 2X PENCELUPAN).', isKritis: true },
      { nomor: 6, teks: 'Letakkan kembali ayam di atas grill pan, bakar ulang sebentar (~1-1,5 menit) hingga aroma smokey gurih keluar pekat.', isKritis: true },
      { nomor: 7, teks: 'Untuk Krisbar Krispi: angkat dan sajikan langsung di piring/box.' },
      { nomor: 8, teks: 'Untuk Krisbar Geprek: pindahkan ayam krisbar ke cobek batu yang sudah berisi ulegan sambal sesuai level, geprek memar merata.' },
      { nomor: 9, teks: 'Tata di piring/box penyajian, tambahkan 2 slice timun segar.' },
      { nomor: 10, teks: 'Perawatan alat: Saring bumbu krisbar setiap pergantian shift/closing malam untuk membuang remahan gosong, dan cuci wajan grill pan setiap 3 kali pemakaian menggunakan spon busa kasar (dilarang busa kawat).' }
    ],
    autoQuestions: [
      {
        tanya: 'Berapa kali proses pencelupan ke wadah bumbu dan pembakaran di grill pan yang WAJIB dilakukan pada Ayam Krisbar?',
        kunci: 'Wajib dilakukan sebanyak 2 KALI PENCELUPAN dan 2 KALI PEMBAKARAN di atas grill pan agar bumbu terkaramelisasi gurih pekat.'
      },
      {
        tanya: 'Kapan bumbu krisbar wajib disaring dan kapan wajan Grill Pan Krisbar wajib dicuci bersih?',
        kunci: 'Bumbu krisbar wajib disaring setiap pergantian shift atau closing malam. Grill pan wajib dicuci setiap 3 kali pemakaian (menggunakan busa kasar, dilarang kawat).'
      },
      {
        tanya: 'Di mana bumbu krisbar yang belum terbuka vs sudah terbuka wajib disimpan?',
        kunci: 'Bumbu krisbar belum terbuka disimpan di freezer (tahan 1 bulan); bumbu krisbar yang sudah terbuka disimpan tertutup rapat di dalam showcase pendingin.'
      },
      {
        tanya: 'Mengapa wadah bumbu krisbar wajib selalu ditutup rapat selama jam operasional?',
        kunci: 'Karena bumbu krisbar manis berkaramel sehingga sangat mudah memancing lalat dan serangga jika dibiarkan terbuka.'
      },
      {
        tanya: 'Berapa lama estimasi waktu tunggu pembuatan menu Ayam Krisbar yang harus diinformasikan kasir ke pelanggan?',
        kunci: 'Kasir wajib memberikan estimasi waktu tunggu sekitar 5 sampai 7 menit kepada pelanggan.'
      }
    ]
  },

  // =========================================================================
  // 22. Ayam Hot Nashville (Potong & Ayam Utuh)
  // =========================================================================
  {
    id: 'prod-22-ayam-nashville',
    nama: 'Ayam Hot Nashville (Potong & Ayam Utuh)',
    kode: 'HC-SOP-GEP-06 & 07',
    day: 'Day 2',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'Station 2 (Meja Bumbu Nashville)',
    divisi: 'Geprek',
    stdDetik: 150,
    targetWaktuMenit: 2.5,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 30,
    gramaturLabel: 'Bumbu 30g potong / 65g AU',
    deskripsi: 'Rendam ayam hangat 1 menit dalam bumbu Nashville (Biru Lv1 / Kuning Lv2 / Merah Lv3), tiriskan, alas plastik khusus nashville, tabur Boncabe.',
    alatBahan: 'Alat: Wadah Celupan Nashville Stainless, Rak Peniris Minyak, Capitan Ayam, Sendok Takar 1 ml & 15 ml, Box Makanan / Box AU, Plastik Alas Nashville. Bahan Nashville Potong: 1 pcs Ayam krispi hangat, Bumbu celupan Nashville 30 gr (Biru Lv 1 / Kuning Lv 2 / Merah Lv 3), Bubuk Boncabe 1 gr (sendok takar 1 ml), 1 lembar Plastik Alas Nashville. Bahan AU Nashville: 1 ekor Ayam Utuh krispi, Bumbu celupan Nashville Lv 2 seberat 65 gr, Bubuk Boncabe 15 gr (1 sdm takar), 2 porsi Saus Keju kemasan, 1 lembar Kertas Nasi.',
    titikKritis: [
      'Kode warna wadah: Biru (Level 1 Sedang), Kuning (Level 2 Pedas), Merah (Level 3 Ekstra Pedas)',
      'Rendam ayam tepat 1 menit agar bumbu pedas meresap sempurna ke pori-pori tepung',
      'Kemasan Take-Away WAJIB menggunakan 1 lembar Plastik Alas Nashville (bukan kertas nasi)',
      'Saus keju AU Nashville dikemas terpisah di LUAR BOX'
    ],
    tahapanWaktu: {
      persiapanMenit: 0.5,
      prosesMasakMenit: 1.0,
      finishingPlatingMenit: 1.0,
      persiapanDetik: 30,
      prosesMasakDetik: 60,
      finishingPlatingDetik: 60,
      keterangan: 'Prep: 0.5 mnt (Aduk bumbu nashville, takar boncabe) | Masak: 1 mnt (Rendam ayam 1 menit di bumbu) | Saji: 1 mnt (Tiriskan ke box alas plastik nashville, tabur boncabe)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Ambil potongan ayam krispi hangat dari warmer sesuai pesanan (dada/paha).' },
      { nomor: 2, teks: 'Siapkan wadah bumbu celupan Nashville sesuai level pedas (Biru Lv 1, Kuning Lv 2, Merah Lv 3), aduk bumbu hingga rata.', isKritis: true },
      { nomor: 3, teks: 'Masukkan ayam krispi ke dalam bumbu celupan, diamkan terendam selama tepat 1 menit agar bumbu pedas meresap.', isKritis: true },
      { nomor: 4, teks: 'Angkat ayam menggunakan capitan, letakkan di atas rak peniris nashville sampai tetesan minyak berkurang.' },
      { nomor: 5, teks: 'Siapkan box makanan yang telah dialasi 1 LEMBAR PLASTIK ALAS NASHVILLE (pembelian tanpa nasi pakai box kecil, dengan nasi pakai box besar).', isKritis: true },
      { nomor: 6, teks: 'Letakkan ayam nashville di atas plastik alas nashville.' },
      { nomor: 7, teks: 'Taburkan bubuk Boncabe sebanyak 1 gr (menggunakan sendok takar 1 ml) secara merata di atas permukaan ayam.', isKritis: true },
      { nomor: 8, teks: 'Tutup box dan sajikan segera selagi hangat. Untuk AU Nashville: rendam 1 ekor ayam utuh dalam 65g bumbu Lv 2 selama 1 menit, tiriskan, tata di box AU, tabur 15g (1 sdm) Boncabe, dan sertakan 2 saus keju terpisah di LUAR BOX.' }
    ],
    autoQuestions: [
      {
        tanya: 'Sebutkan kode warna penanda level kepedasan bumbu celupan Hot Nashville pada wadah outlet!',
        kunci: 'Biru = Level 1 (Sedang), Kuning = Level 2 (Pedas), Merah = Level 3 (Ekstra Pedas).'
      },
      {
        tanya: 'Berapa gram bumbu celupan dan boncabe untuk Nashville Potong vs Ayam Utuh Nashville?',
        kunci: 'Nashville Potong: 30 gr bumbu rendam 1 menit + 1 gr boncabe. Ayam Utuh Nashville: 65 gr bumbu Lv 2 rendam 1 menit + 15 gr (1 sdm) boncabe.'
      },
      {
        tanya: 'Mengapa kemasan Hot Nashville Take-Away wajib menggunakan lembaran Plastik Alas Nashville (bukan kertas nasi biasa)?',
        kunci: 'Karena bumbu Nashville mengandung oil blend cair berbumbu pekat yang dapat menembus/merusak kertas nasi biasa dan mengotori box kemasan.'
      },
      {
        tanya: 'Bagaimana aturan peletakan Saus Keju pelengkap pada paket Ayam Utuh Hot Nashville?',
        kunci: '2 porsi saus keju dibungkus plastik terpisah dan diletakkan DI LUAR BOX (dilarang dicampur ke dalam box panas agar saus keju tidak rusak/meleleh).'
      },
      {
        tanya: 'Berapa lama bumbu Hot Nashville bertahan dan bagaimana kondisi penyimpanannya di outlet?',
        kunci: 'Bumbu disimpan pada suhu ruang normal dalam wadah tertutup rapat, dan wajib diaduk rata sebelum digunakan karena minyak dan rempah mudah terpisah.'
      }
    ]
  },

  // =========================================================================
  // 23. Minuman Dingin Segar: Orange (1 Porsi / 10 Cup)
  // =========================================================================
  {
    id: 'prod-23-orange-dingin',
    nama: 'Minuman Dingin Segar: Orange (1 Porsi / 10 Cup)',
    kode: 'HC-SOP-KIT-19',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 1',
    stationLabel: 'Station 1 / Station 2 (Meja Minuman)',
    divisi: 'Kasir',
    stdDetik: 180,
    targetWaktuMenit: 3.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Rebus 1L air mendidih, larutkan 1 resep bubuk Orange, tambah 1L air galon (total 2L = 10 cup @ 200ml), seal cup 160°C.',
    alatBahan: 'Alat: Panci Kecil, Gelas Ukur 1000 ml, Teko Minuman, Cup 14 oz, Mesin Cup Sealer (160 C), Sendok Pengaduk. Bahan: Bubuk Orange resmi HARA 1 resep, Air bersih 2 Liter (1 Liter air mendidih + 1 Liter air matang galon), Es batu kristal.',
    titikKritis: [
      'Larutkan bubuk dalam 1 liter air mendidih dahulu hingga bebas gumpalan',
      'Tambahkan 1 liter air galon dingin (total 2 liter untuk 10 porsi cup)',
      'Takaran saji per cup adalah 200 ml + es kristal sesuai garis',
      'Suhu Cup Sealer stabil 160°C'
    ],
    tahapanWaktu: {
      persiapanMenit: 1.0,
      prosesMasakMenit: 1.5,
      finishingPlatingMenit: 0.5,
      persiapanDetik: 60,
      prosesMasakDetik: 90,
      finishingPlatingDetik: 30,
      keterangan: 'Prep: 1 mnt (Siapkan cup 14 oz, es batu, takar resep) | Masak: 1.5 mnt (Didihkan 1L air, larutkan bubuk, tambah 1L galon) | Saji: 0.5 mnt (Tuang 200ml + es, seal 160C)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Rebus 1 liter air bersih di panci kecil hingga mendidih (~1,5 menit).' },
      { nomor: 2, teks: 'Masukkan 1 resep bubuk Orange resmi HARA ke dalam panci berisi air mendidih.', isKritis: true },
      { nomor: 3, teks: 'Aduk cepat hingga seluruh bubuk orange larut sempurna dan tidak ada gumpalan di dasar panci.' },
      { nomor: 4, teks: 'Tambahkan 1 liter air matang dingin/galon ke dalam panci, lalu aduk merata (total air menjadi 2 liter untuk 10 porsi cup).', isKritis: true },
      { nomor: 5, teks: 'Pindahkan larutan orange ke dalam teko minuman bersih.' },
      { nomor: 6, teks: 'Penyajian pesanan: Siapkan cup 14 oz, masukkan es batu kristal secukupnya sesuai garis cup, tuangkan 200 ml larutan air orange.', isKritis: true },
      { nomor: 7, teks: 'Tutup cup menggunakan mesin Cup Sealer suhu 160 C hingga rapat anti-bocor.' },
      { nomor: 8, teks: 'Jika pelanggan memesan tanpa es, penuhi cup dengan menambahkan air galon biasa; jika memesan hangat, campur dengan air panas dispenser.' }
    ],
    autoQuestions: [
      {
        tanya: 'Berapa volume air mendidih dan air matang galon untuk membuat 1 resep minuman Orange (10 cup)?',
        kunci: '1 liter air mendidih (untuk melarutkan bubuk) + 1 liter air matang galon dingin (total volume 2 liter untuk 10 cup @ 200 ml).'
      },
      {
        tanya: 'Berapa ml takaran saji air Orange yang dituangkan ke dalam 1 cup 14 oz?',
        kunci: 'Tepat 200 ml air Orange ditambah es batu kristal secukupnya.'
      },
      {
        tanya: 'Bagaimana status pencatatan stok opname (SO) untuk produk minuman Orange di spreadsheet?',
        kunci: 'Stok opname dihitung per porsi (per cup).'
      },
      {
        tanya: 'Bagaimana standar penyajian jika pelanggan memesan Orange dalam kondisi hangat?',
        kunci: 'Gunakan perbandingan setengah larutan orange panas dan setengah air galon biasa agar suhu hangat pas diminum dan cup tidak meleleh.'
      },
      {
        tanya: 'Berapa suhu mesin Cup Sealer yang wajib dipastikan kru sebelum menutup cup minuman?',
        kunci: 'Suhu mesin Cup Sealer wajib berada di angka 160 C (lampu indikator merah menyala).'
      }
    ]
  },

  // =========================================================================
  // 24. Minuman Dingin Segar: Susu Coklat (Sucok Dingin)
  // =========================================================================
  {
    id: 'prod-24-sucok-dingin',
    nama: 'Minuman Dingin Segar: Susu Coklat (Sucok Dingin)',
    kode: 'HC-SOP-KIT-20',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'Station 2 (Meja Minuman)',
    divisi: 'Kasir',
    stdDetik: 150,
    targetWaktuMenit: 2.5,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Larutkan 1 porsi bubuk Sucok dengan 50ml air panas dispenser, aduk rata tanpa gumpal, tambah air dingin s.d. 150ml, beri es, seal 160°C.',
    alatBahan: 'Alat: Cup 14 oz, Sendok Pengaduk Panjang / Shaker, Dispenser Air Panas, Mesin Cup Sealer (160 C). Bahan: Bubuk Susu Coklat (Sucok) resmi HARA 1 porsi, Air panas 50 ml, Air matang dingin, Es batu kristal higienis.',
    titikKritis: [
      'Wajib larutkan dengan 50 ml air panas dispenser (dilarang langsung air dingin/es batu)',
      'Aduk cepat hingga lemak kakao dan susu larut sempurna bebas gumpalan',
      'Penuhi air matang dingin hingga batas 150 ml sebelum es masuk',
      'Suhu Cup Sealer 160°C'
    ],
    tahapanWaktu: {
      persiapanMenit: 1.0,
      prosesMasakMenit: 1.0,
      finishingPlatingMenit: 0.5,
      persiapanDetik: 60,
      prosesMasakDetik: 60,
      finishingPlatingDetik: 30,
      keterangan: 'Prep: 1 mnt (Siapkan cup, bubuk sucok, es batu) | Masak: 1 mnt (Larutkan bubuk dgn 50ml air panas dispenser, aduk rata) | Saji: 0.5 mnt (Tambah air dingin & es kristal, seal cup 160C)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Siapkan cup 14 oz bersih.' },
      { nomor: 2, teks: 'Masukkan 1 porsi bubuk Susu Coklat (Sucok) ke dalam cup.' },
      { nomor: 3, teks: 'Tuangkan 50 ml air panas dari dispenser untuk melarutkan bubuk coklat.', isKritis: true },
      { nomor: 4, teks: 'Aduk cepat menggunakan sendok pengaduk panjang hingga bubuk coklat larut sempurna dan tidak ada gumpalan menempel di dinding cup.', isKritis: true },
      { nomor: 5, teks: 'Tambahkan air matang dingin hingga mencapai batas 150 ml.' },
      { nomor: 6, teks: 'Masukkan es batu kristal secukupnya hingga batas garis cup atas.' },
      { nomor: 7, teks: 'Masukkan cup ke dalam mesin Cup Sealer suhu 160 C, tarik tuas dan segel hingga tertutup rapat anti-bocor.', isKritis: true },
      { nomor: 8, teks: 'Usap bagian luar cup dengan lap bersih jika ada tetesan air, lalu sajikan bersama sedotan steril.' }
    ],
    autoQuestions: [
      {
        tanya: 'Berapa ml air panas yang digunakan untuk melarutkan bubuk Susu Coklat (Sucok) di awal?',
        kunci: 'Gunakan 50 ml air panas dari dispenser agar bubuk coklat cepat larut tanpa menggumpal.'
      },
      {
        tanya: 'Mengapa bubuk Susu Coklat dilarang langsung dilarutkan menggunakan air dingin dan es batu?',
        kunci: 'Karena bubuk coklat mengandung lemak susu dan kakao yang akan menggumpal keras dan tidak larut jika terkena air dingin.'
      },
      {
        tanya: 'Berapa suhu standar mesin Cup Sealer untuk menyegel cup Susu Coklat?',
        kunci: 'Suhu standar mesin Cup Sealer adalah 160 C.'
      },
      {
        tanya: 'Bagaimana perlakuan kebersihan sendok pengaduk minuman setelah digunakan mengaduk susu coklat?',
        kunci: 'Wajib langsung dibilas di wastafel air mengalir dan dilap bersih agar tidak mengontaminasi rasa minuman berikutnya.'
      },
      {
        tanya: 'Apakah minuman Susu Coklat yang sudah dicampur es batu boleh disimpan untuk shift berikutnya?',
        kunci: 'TIDAK BOLEH. Minuman cup es batu dibuat dadakan sesuai pesanan pelanggan (made to order) agar rasa tidak hambar mencair.'
      }
    ]
  },

  // =========================================================================
  // 25. Milkshake All Variant (Strawberry, Coklat, Vanilla)
  // =========================================================================
  {
    id: 'prod-25-milkshake',
    nama: 'Milkshake All Variant (Strawberry, Coklat, Vanilla)',
    kode: 'HC-SOP-KIT-22',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 1',
    stationLabel: 'Station 1 / Station 3 (Blender Bar)',
    divisi: 'Kasir',
    stdDetik: 180,
    targetWaktuMenit: 3.0,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: '1 scoop es kristal (~150g) + 1 porsi bubuk milkshake + 100ml susu UHT/air dingin, blender 30-45 detik hingga creamy kental, seal 160°C.',
    alatBahan: 'Alat: Mesin Blender Minuman Komersial, Gelas Ukur, Sendok Takar, Cup 14 oz, Mesin Cup Sealer (160 C), Lap Basah Blender. Bahan: Bubuk Milkshake resmi HARA sesuai varian (Strawberry / Coklat / Vanilla) 1 porsi, Susu UHT / Air matang dingin 100 ml, Es batu kristal 1 scoop (~150 gr).',
    titikKritis: [
      '3 varian resmi: Strawberry, Coklat, dan Vanilla',
      'Blender dengan kecepatan sedang selama 30-45 detik hingga tekstur creamy berbusa lembut',
      'Segel di mesin cup sealer suhu 160°C',
      'Wajib cuci bersih tabung & pisau blender segera pasca pakai (sisa susu cepat basi)'
    ],
    tahapanWaktu: {
      persiapanMenit: 1.0,
      prosesMasakMenit: 1.5,
      finishingPlatingMenit: 0.5,
      persiapanDetik: 60,
      prosesMasakDetik: 90,
      finishingPlatingDetik: 30,
      keterangan: 'Prep: 1 mnt (Siapkan blender, takar varian bubuk, susu & es) | Masak: 1.5 mnt (Blender 45 detik hingga creamy berbusa) | Saji: 0.5 mnt (Tuang ke cup 14 oz, seal 160C)'
    },
    langkahSOP: [
      { nomor: 1, teks: 'Periksa kebersihan tabung blender, pastikan pisau blender terpasang kencang dan bersih.' },
      { nomor: 2, teks: 'Tanyakan/cek varian pesanan pelanggan: Milkshake Strawberry, Milkshake Coklat, atau Milkshake Vanilla.' },
      { nomor: 3, teks: 'Masukkan 1 scoop es batu kristal ke dalam tabung blender.' },
      { nomor: 4, teks: 'Masukkan 1 porsi bubuk milkshake sesuai varian rasa yang dipesan.' },
      { nomor: 5, teks: 'Tuangkan 100 ml susu UHT / air matang dingin ke dalam tabung blender.', isKritis: true },
      { nomor: 6, teks: 'Tutup tabung blender dengan rapat, pasang tabung ke mesin blender hingga mengunci sempurna di dudukannya.' },
      { nomor: 7, teks: 'Tancapkan kabel, nyalakan blender dengan kecepatan sedang selama 30-45 detik hingga es batu hancur halus dan adonan menjadi kental creamy berbusa lembut.', isKritis: true },
      { nomor: 8, teks: 'Matikan blender, cabut kabel, buka tutup dan tuangkan seluruh milkshake ke dalam cup 14 oz.' },
      { nomor: 9, teks: 'Segera masukkan ke dalam mesin Cup Sealer suhu 160 C dan segel cup hingga rapat.', isKritis: true },
      { nomor: 10, teks: 'Segera cuci bersih tabung blender dan bilas pisau blender dengan air bersih agar tidak ada sisa susu yang menempel basi.', isKritis: true }
    ],
    autoQuestions: [
      {
        tanya: 'Sebutkan 3 varian rasa resmi Milkshake HARA yang tersedia di outlet!',
        kunci: 'Milkshake Strawberry, Milkshake Coklat, dan Milkshake Vanilla.'
      },
      {
        tanya: 'Berapa lama durasi mem-blender minuman Milkshake agar teksturnya kental creamy?',
        kunci: 'Diblender selama 30 sampai 45 detik dengan kecepatan sedang hingga es kristal hancur lembut homogen.'
      },
      {
        tanya: 'Mengapa tabung dan pisau blender wajib langsung dicuci setelah selesai membuat milkshake?',
        kunci: 'Karena sisa susu dan gula milkshake sangat cepat mengering, lengket di pisau, dan dalam 2-3 jam akan berbau basi memicu bakteri.'
      },
      {
        tanya: 'Berapa estimasi waktu tunggu pembuatan Milkshake yang wajib disampaikan kasir ke pelanggan saat jam ramai?',
        kunci: 'Kasir wajib memberikan estimasi waktu tunggu kurang lebih 5 menit kepada pelanggan.'
      },
      {
        tanya: 'Bagaimana prosedur pembersihan body mesin blender listrik sesuai SOP K3 peralatan dapur?',
        kunci: 'DILARANG menyiram mesin blender dengan air; cabut kabel stop kontak lalu lap permukaan body mesin menggunakan kain lap setengah basah dan keringkan.'
      }
    ]
  }
];

export const RATA_RATA_DURASI_PRODUK = {
  prepMenit: 4.3,
  masakMenit: 8.9,
  sajiMenit: 2.4,
  targetWaktuMenit: 15.5,
  targetWaktuDetik: 930
};
