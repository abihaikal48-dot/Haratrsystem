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
  requiresOilTemp?: boolean;
  targetSuhuMinyak?: number;
  requiresGramatur?: boolean;
  targetGramatur?: number;
  gramaturLabel?: string;
  deskripsi: string;
  titikKritis: string[];
  langkahSOP: { nomor: number; teks: string; isKritis?: boolean }[];
  autoQuestions: { tanya: string; kunci: string }[];
}

export const HARA_ONBOARDING_PRODUCTS_MASTER: OnboardingProductItem[] = [
  // =========================================================================
  // DAY 1 - BATCH 1 - STATION 1: NASI, TEH, SUP
  // =========================================================================
  {
    id: 'd1-b1-s1-nasi',
    nama: 'Nasi (Rice Cooker 4 Cup D1)',
    kode: 'HC-SOP-KIT-01',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 1',
    stationLabel: 'Station 1: Nasi, Teh, Sup',
    divisi: 'Kitchen',
    stdDetik: 900,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Rice cooker gas Miyako, cuci 3x bilas, rasio 4 cup beras : 5 cup air, resting 15 menit.',
    titikKritis: [
      'Rasio takaran air baku: 4 cup beras : 5 cup air bersih',
      'Tekan tombol api kecil (kiri) dahulu sebelum menekan tombol COOK (kanan)',
      'Resting (diamkan) minimal 15 menit setelah tombol jegleg sebelum dipindah ke magicom'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Ambil 4 cup beras Miyako takaran rata bibir cup.' },
      { nomor: 2, teks: 'Cuci beras minimal 3 kali bilas hingga air bilasan jernih.' },
      { nomor: 3, teks: 'Masukkan beras ke dalam panci rice cooker gas dan beri 5 cup air bersih.', isKritis: true },
      { nomor: 4, teks: 'Cek isi tabung gas dan buka tuas pengaman saluran gas.' },
      { nomor: 5, teks: 'Tekan tombol api kecil (kiri) menyala biru, lalu tekan tombol COOK ke bawah (kanan).', isKritis: true },
      { nomor: 6, teks: 'Tunggu hingga tombol COOK kembali ke posisi semula (jegleg berbunyi).' },
      { nomor: 7, teks: 'Biarkan tertutup resting 15 menit agar nasi tanak pulen sempurna (dilarang langsung dibuka).', isKritis: true },
      { nomor: 8, teks: 'Pindahkan ke magicom penghangat dan aduk perlahan dengan centong standar HARA.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa rasio takaran baku antara cup beras Miyako dan air untuk 4 cup?', kunci: '4 Cup Beras : 5 Cup Air Bersih' },
      { tanya: 'Berapa lama waktu resting (diamkan) nasi setelah tombol cook naik?', kunci: 'Minimal 15 menit agar nasi tanak pulen sempurna' },
      { tanya: 'Tombol mana yang wajib ditekan terlebih dahulu saat menyalakan rice cooker gas?', kunci: 'Tombol api kecil (sebelah kiri) terlebih dahulu' }
    ]
  },
  {
    id: 'd1-b1-s1-teh',
    nama: 'Teh (Racikan 10 Liter D1)',
    kode: 'HC-SOP-BAR-01',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 1',
    stationLabel: 'Station 1: Nasi, Teh, Sup',
    divisi: 'Kasir',
    stdDetik: 300,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Racikan teh melati wangi HARA 10 Liter, seduh air mendidih, saring kain 2x, gula cair standar.',
    titikKritis: [
      'Gunakan air mendidih 100°C saat menyeduh daun teh melati',
      'Penyaringan minimal 2 kali menggunakan kain saringan teh halus bebas ampas',
      'Rasio larutan gula cair baku agar kemanisan seragam di seluruh cup'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Didihkan 10 liter air bersih hingga bergolak (100°C).' },
      { nomor: 2, teks: 'Masukkan racikan teh melati HARA sesuai takaran batch 10 liter.' },
      { nomor: 3, teks: 'Aduk merata dan biarkan terekstraksi selama 10-15 menit.' },
      { nomor: 4, teks: 'Saring cairan teh minimal 2 kali dengan kain saringan khusus teh.', isKritis: true },
      { nomor: 5, teks: 'Campurkan larutan gula cair standar dan aduk hingga homogen.', isKritis: true },
      { nomor: 6, teks: 'Pindahkan ke dispenser teh stainless bertutup rapat dan beri label waktu seduh.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa liter kapasitas batch seduh teh pada Day 1 Station 1?', kunci: '10 Liter' },
      { tanya: 'Berapa kali penyaringan cairan teh sebelum dituangkan ke dispenser?', kunci: 'Minimal 2 kali dengan saringan kain halus agar bebas ampas' }
    ]
  },
  {
    id: 'd1-b1-s1-sup',
    nama: 'Sup Sayur',
    kode: 'HC-SOP-KIT-14',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 1',
    stationLabel: 'Station 1: Nasi, Teh, Sup',
    divisi: 'Kitchen',
    stdDetik: 360,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Kuah kaldu gurih bening 6 Liter, rebus sayuran segar maksimal 2 menit agar tetap renyah.',
    titikKritis: [
      'Rebus sayuran (wortel/kol/buncis) maksimal 2 menit agar tekstur tetap renyah dan warna segar',
      'Kaldu bening tidak boleh keruh berminyak berlebih',
      'Penyajian hangat dengan taburan bawang goreng dan seledri cincang segar'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Panaskan kaldu ayam bening standar HARA hingga mendidih.' },
      { nomor: 2, teks: 'Masukkan bumbu sup kaldu dan aduk larut merata.' },
      { nomor: 3, teks: 'Masukkan potongan sayur segar (wortel, kol, buncis) yang telah dicuci bersih.' },
      { nomor: 4, teks: 'Rebus tepat 2 menit (jangan overcook).', isKritis: true },
      { nomor: 5, teks: 'Matikan api, tuang ke wadah warmer sup saji.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa lama standar perebusan sayuran sup agar tidak overcook?', kunci: 'Maksimal 2 menit agar tetap renyah dan warna cerah' },
      { tanya: 'Apa indikator keberhasilan kuah sup sayur HARA?', kunci: 'Kuah bening gurih tanpa minyak berlebih dan sayuran renyah' }
    ]
  },

  // =========================================================================
  // DAY 1 - BATCH 1 - STATION 2: GORENG AYAM, SCRAMBLE, SPINACH, INDOMIE
  // =========================================================================
  {
    id: 'd1-b1-s2-goreng-ayam',
    nama: 'Goreng Ayam',
    kode: 'HC-SOP-KIT-02',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2: Goreng Ayam, Scramble, Spinach, Indomie',
    divisi: 'Kitchen',
    stdDetik: 720,
    requiresOilTemp: true,
    targetSuhuMinyak: 160,
    deskripsi: 'Kompor 175°C, suhu minyak 160°C, waktu goreng 12 menit tepat, goyang keranjang di menit 3, 6, 9.',
    titikKritis: [
      'Suhu minyak deep fryer wajib tepat 160°C saat dropping ayam (toleransi 158°C - 162°C)',
      'Goyangkan keranjang deep fryer di menit 3, 6, dan 9 agar ayam tidak menempel dan matang merata',
      'Tiriskan minyak dengan jepitan stainless ke kontainer warmer (dilarang menuang langsung)'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Nyalakan api kompor deep fryer dan putar pengatur suhu ke 175°C.' },
      { nomor: 2, teks: 'Cek suhu minyak dengan termometer probe hingga mencapai 160°C.', isKritis: true },
      { nomor: 3, teks: 'Lakukan penepungan ayam (dusting 2x): ayam termarinasi dicubit lembut agar keriting mekar, celup air 1 dtk, tiriskan, tepungi kembali.' },
      { nomor: 4, teks: 'Masukkan ayam ke dalam minyak minimal 2 kg dan maksimal 3 kg per batch (dropping perlahan).' },
      { nomor: 5, teks: 'Selama menggoreng, goyangkan keranjang deep fryer setiap 3 menit sekali.', isKritis: true },
      { nomor: 6, teks: 'Goreng tepat selama 12 menit hingga keemasan matang ke tulang.', isKritis: true },
      { nomor: 7, teks: 'Angkat keranjang, tiriskan minyak tuntas, pindahkan dengan jepitan ke warmer.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa suhu minyak deep fryer saat dropping ayam krispi?', kunci: 'Tepat 160°C (toleransi 158°C - 162°C)' },
      { tanya: 'Pada menit ke berapa saja keranjang deep fryer wajib digoyangkan?', kunci: 'Di menit ke-3, menit ke-6, dan menit ke-9' },
      { tanya: 'Berapa lama total durasi penggorengan ayam krispi?', kunci: '12 menit tepat' }
    ]
  },
  {
    id: 'd1-b1-s2-scramble',
    nama: 'Scramble (Scrembel)',
    kode: 'HC-SOP-KIT-15',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2: Goreng Ayam, Scramble, Spinach, Indomie',
    divisi: 'Kitchen',
    stdDetik: 150,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Wajan teflon api kecil-sedang, 1 butir telur kocok lembut, aduk memutar 2-3 menit hingga creamy.',
    titikKritis: [
      'Gunakan api kecil-sedang agar telur tidak kecokelatan kering (harus tetap moist & creamy)',
      'Aduk memutar perlahan dengan spatula karet/kayu dari pinggir ke tengah wajan',
      'Angkat saat telur masih 90% set (sisa panas akan mematangkan sempurna)'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Pecahkan telur ke mangkuk, beri sejumput garam dan kocok rata.' },
      { nomor: 2, teks: 'Panaskan wajan dengan sedikit margarin/minyak pada api kecil.' },
      { nomor: 3, teks: 'Tuang telur ke wajan saat sudah hangat.' },
      { nomor: 4, teks: 'Dorong telur dari tepi wajan ke tengah secara perlahan membentuk lipatan lembut.', isKritis: true },
      { nomor: 5, teks: 'Masak selama 2-3 menit sampai lembut bertekstur, segera angkat ke piring.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa lama waktu memasak scramble egg yang ideal?', kunci: '2 sampai 3 menit pada api kecil-sedang' },
      { tanya: 'Bagaimana tekstur akhir scramble egg yang sesuai standar?', kunci: 'Moist, lembut, creamy, dan tidak overcook atau gosong' }
    ]
  },
  {
    id: 'd1-b1-s2-spinach',
    nama: 'Bayam Krispi',
    kode: 'HC-SOP-KIT-16',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2: Goreng Ayam, Scramble, Bayam Krispi, Indomie',
    divisi: 'Kitchen',
    stdDetik: 480,
    requiresOilTemp: true,
    targetSuhuMinyak: 160,
    requiresGramatur: true,
    targetGramatur: 50,
    gramaturLabel: 'Gramasi Bayam Segar (50g)',
    deskripsi: 'Proses lengkap: petik daun bayam segar, timbang 50g, cuci bersih & tiriskan, adonan tepung encer tipis, cek suhu 160°C, goreng 90-120 dtk, tiriskan tuntas.',
    titikKritis: [
      'Sortir daun bayam segar bebas layu, petik daun utuh tanpa tangkai batang keras',
      'Timbang gramatur tepat 50g & cuci bersih 2x bilas lalu tiriskan kering agar minyak tidak meletup',
      'Suhu minyak deep fryer tepat 160°C sebelum bayam dimasukkan',
      'Goreng satu per satu 90-120 detik agar mekar tidak menumpuk menggumpal, tiriskan tuntas di rak'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Sortir dan petik lembaran daun bayam segar pilihan (buang tangkai batang keras).' },
      { nomor: 2, teks: 'Timbang porsi daun bayam tepat 50 gram pada timbangan digital.', isKritis: true },
      { nomor: 3, teks: 'Cuci bersih pada air mengalir minimal 2x bilasan dan tiriskan hingga kering.', isKritis: true },
      { nomor: 4, teks: 'Siapkan adonan tepung bumbu encer tipis dengan air dingin steril.' },
      { nomor: 5, teks: 'Periksa suhu minyak deep fryer berada stabil di 160°C.', isKritis: true },
      { nomor: 6, teks: 'Celupkan lembaran daun bayam satu per satu ke adonan tepung encer tipis.' },
      { nomor: 7, teks: 'Masukkan ke minyak panas satu per satu agar menyebar dan tidak menumpuk menggumpal.', isKritis: true },
      { nomor: 8, teks: 'Goreng selama 90-120 detik hingga mekar renyah keemasan (tidak gosong).' },
      { nomor: 9, teks: 'Angkat ke rak penirisan kawat berpori minimal 60 detik sebelum dipindahkan ke wadah saji.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Mengapa bayam wajib dicuci bersih dan ditiriskan kering sebelum dibalur adonan?', kunci: 'Agar adonan menempel merata dan minyak tidak meletup hebat saat digoreng' },
      { tanya: 'Berapa suhu minyak dan estimasi durasi penggorengan bayam krispi?', kunci: 'Suhu 160°C digoreng 90 sampai 120 detik hingga mekar renyah keemasan' },
      { tanya: 'Berapa gramasi porsi baku daun bayam segar?', kunci: '50 gram' }
    ]
  },
  {
    id: 'd1-b1-s2-indomie',
    nama: 'Indomie (Indomie Geprek)',
    kode: 'HC-SOP-KIT-17',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 2',
    stationLabel: 'Station 2: Goreng Ayam, Scramble, Spinach, Indomie',
    divisi: 'Kitchen',
    stdDetik: 120,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Rebus mie tepat 2 menit pada air mendidih, tiriskan, aduk bumbu cepat, sajikan panas.',
    titikKritis: [
      'Rebus mie tepat 2 menit agar tekstur mie tetap kenyal al-dente tidak lembek',
      'Tiriskan air rebusan tuntas sebelum diaduk dengan bumbu pasta/minyak',
      'Aduk bumbu merata di piring saji saat mie masih mengepul panas'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Didihkan air bersih secukupnya dalam panci rebusan.' },
      { nomor: 2, teks: 'Masukkan mie instan ke dalam air mendidih dan pasang timer 2 menit.', isKritis: true },
      { nomor: 3, teks: 'Siapkan bumbu lengkap di piring saji.' },
      { nomor: 4, teks: 'Tiriskan mie dengan saringan stainless hingga air tuntas.' },
      { nomor: 5, teks: 'Tuang mie ke piring bumbu dan aduk cepat hingga rata merata.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa durasi baku perebusan mie instan agar kenyal?', kunci: 'Tepat 2 menit di air mendidih bergolak' }
    ]
  },

  // =========================================================================
  // DAY 1 - BATCH 1 - STATION 3: TERONG, SAMBAL BAWANG, GORENG AYAM UTUH
  // =========================================================================
  {
    id: 'd1-b1-s3-terong',
    nama: 'Goreng Terong (Terong Krispi)',
    kode: 'HC-SOP-KIT-11',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 3',
    stationLabel: 'Station 3: Terong, Sambal Bawang, Goreng Ayam Utuh',
    divisi: 'Kitchen',
    stdDetik: 300,
    requiresOilTemp: true,
    targetSuhuMinyak: 150,
    deskripsi: 'Deep Fryer 150°C, potongan serong 1cm, balur tepung breader, goreng 5 menit.',
    titikKritis: [
      'Suhu minyak deep fryer tepat 150°C',
      'Goreng tepat 5 menit sampai warna kuning keemasan renyah di luar lembut di dalam',
      'Tiriskan minyak tuntas sebelum di-plating'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Potong terong serong tebal 1 cm dan marinasi 10 menit.' },
      { nomor: 2, teks: 'Cek suhu minyak deep fryer di angka 150°C.', isKritis: true },
      { nomor: 3, teks: 'Tepungi potongan terong dengan tepung breader HARA rata.' },
      { nomor: 4, teks: 'Goreng selama 5 menit hingga keemasan.', isKritis: true },
      { nomor: 5, teks: 'Angkat, tiriskan minyak, dan tata rapi di wadah saji.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa suhu minyak dan durasi penggorengan terong krispi?', kunci: '150°C selama 5 menit' }
    ]
  },
  {
    id: 'd1-b1-s3-sambal-bawang',
    nama: 'Sambal Bawang (Takaran 30g Uleg Batu)',
    kode: 'HC-SOP-GPR-01',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 3',
    stationLabel: 'Station 3: Terong, Sambal Bawang, Goreng Ayam Utuh',
    divisi: 'Geprek',
    stdDetik: 45,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 30,
    gramaturLabel: 'Gramatur Sambal Jadi (Wajib 30g per Porsi)',
    deskripsi: 'Takaran 30g, wajib uleg cobek batu (dilarang blender!), siraman minyak panas fryer mendidih 15ml.',
    titikKritis: [
      'Takaran bahan baku menghasilkan tepat 30g sambal bawang per porsi',
      'Wajib diuleg kasar bertekstur menggunakan cobek batu (dilarang blender halus)',
      'Siraman minyak panas mendidih langsung dari fryer bersuhu tinggi (15ml)'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Timbang cabai rawit merah segar dan bawang putih sesuai level kepedasan.' },
      { nomor: 2, teks: 'Tambahkan mix garam gurih standar 1/2 sendok takar.' },
      { nomor: 3, teks: 'Uleg kasar di cobek batu (jangan blender halus).', isKritis: true },
      { nomor: 4, teks: 'Siram 1 sendok takar (15ml) minyak goreng mendidih panas dari deep fryer.', isKritis: true },
      { nomor: 5, teks: 'Aduk rata aroma bawang wangi, timbang sambal hasil jadi 30 gram.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa gramasi baku sambal bawang per porsi?', kunci: 'Tepat 30 gram' },
      { tanya: 'Mengapa dilarang menggunakan blender untuk sambal bawang?', kunci: 'Wajib cobek batu agar bertekstur kasar segar dan aroma minyak panas menyatu otentik' }
    ]
  },
  {
    id: 'd1-b1-s3-ayam-utuh',
    nama: 'Goreng Ayam Utuh (AU)',
    kode: 'HC-SOP-KIT-04',
    day: 'Day 1',
    batch: 'Batch 1',
    station: 'Station 3',
    stationLabel: 'Station 3: Terong, Sambal Bawang, Goreng Ayam Utuh',
    divisi: 'Kitchen',
    stdDetik: 720,
    requiresOilTemp: true,
    targetSuhuMinyak: 150,
    deskripsi: 'Deep Fryer 150°C, ayam dimekarkan perlahan saat masuk minyak, goreng 12 menit balik tiap 3 menit.',
    titikKritis: [
      'Suhu minyak stabil 150°C (pantau jangan sampai keluar asap tebal)',
      'Posisi ayam utuh dimekarkan perlahan saat dimasukkan ke dalam minyak panas',
      'Bolak-balik ayam utuh setiap 3 menit sekali agar kematangan merata hingga rongga dada'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Atur suhu kompor deep fryer ke 150°C dan cek termometer probe.', isKritis: true },
      { nomor: 2, teks: 'Tepungi ayam utuh termarinasi dengan teliti sampai ke rongga dada dalam.' },
      { nomor: 3, teks: 'Masukkan ayam utuh ke deep fryer dengan posisi dimekarkan secara pelan-pelan.', isKritis: true },
      { nomor: 4, teks: 'Goreng ayam utuh selama 12 menit tepat.' },
      { nomor: 5, teks: 'Setiap 3 menit sekali bolak-balik ayam utuh dengan jepitan panjang.', isKritis: true },
      { nomor: 6, teks: 'Angkat saat ayam mengambang keemasan dan tiriskan rongga minyak.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa suhu minyak deep fryer saat menggoreng ayam utuh (AU)?', kunci: '150°C' },
      { tanya: 'Bagaimana teknik memasukkan ayam utuh ke dalam minyak panas?', kunci: 'Dimekarkan perlahan-lahan agar minyak masuk ke rongga dada' }
    ]
  },

  // =========================================================================
  // DAY 1 - BATCH 2 - STATION 1: GEPREK ORI, KRISBAR GEPREK, GEPREK MOZA
  // =========================================================================
  {
    id: 'd1-b2-s1-geprek-ori',
    nama: 'Geprek ORI (Original Sambal Bawang)',
    kode: 'HC-SOP-GPR-02',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 1',
    stationLabel: 'Station 1: Geprek ORI, Krisbar Geprek, Geprek Moza',
    divisi: 'Geprek',
    stdDetik: 45,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 30,
    gramaturLabel: 'Gramatur Sambal Bawang (30g)',
    deskripsi: 'Ayam krispi digeprek 2-3 ketukan di atas cobek batu dengan sambal bawang 30g.',
    titikKritis: [
      'Geprek ayam 2-3 ketukan mantap agar daging remuk tanpa meremukkan tulang menjadi serpihan',
      'Ratakan sambal bawang 30g menutupi seluruh permukaan daging ayam',
      'Plating rapi dengan 2 slice timun segar bersudut 45 derajat'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Siapkan sambal bawang 30g yang baru diuleg di cobek batu.' },
      { nomor: 2, teks: 'Ambil ayam krispi panas dari warmer.' },
      { nomor: 3, teks: 'Letakkan ayam di cobek dan geprek 2-3 ketukan ulekan.', isKritis: true },
      { nomor: 4, teks: 'Balurkan sambal bawang merata ke serat daging ayam.', isKritis: true },
      { nomor: 5, teks: 'Pindahkan ke piring saji / kertas nasi anti-minyak + 2 slice timun.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa ketukan ulekan standar saat menggeprek ayam ORI?', kunci: '2 sampai 3 ketukan mantap agar serat merekah tanpa remuk tulang' }
    ]
  },
  {
    id: 'd1-b2-s1-krisbar-geprek',
    nama: 'Krisbar Geprek (Bakar Sambal Bawang)',
    kode: 'HC-SOP-GPR-03',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 1',
    stationLabel: 'Station 1: Geprek ORI, Krisbar Geprek, Geprek Moza',
    divisi: 'Geprek',
    stdDetik: 90,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 30,
    gramaturLabel: 'Gramatur Sambal Bawang (30g)',
    deskripsi: 'Ayam krispi dibakar saus krisbar lalu digeprek di atas cobek dengan sambal bawang 30g.',
    titikKritis: [
      'Ayam dibakar di grill pan hingga berkaramel wangi smokey (jangan gosong pahit)',
      'Digeprek 2 ketukan dan dibalur sambal bawang 30g hangat',
      'Penyajian harum aroma bakaran legit khas HARA'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Panggang ayam krispi dengan bumbu krisbar di atas grill pan 1-2 menit.' },
      { nomor: 2, teks: 'Pindahkan ayam krisbar ke cobek batu berisi sambal bawang 30g.' },
      { nomor: 3, teks: 'Geprek perlahan 2 ketukan agar bumbu bakar dan sambal menyatu.', isKritis: true },
      { nomor: 4, teks: 'Sajikan dengan 2 slice timun segar.' }
    ],
    autoQuestions: [
      { tanya: 'Bagaimana perpaduan rasa dari menu Krisbar Geprek?', kunci: 'Perpaduan bumbu bakar manis gurih berkaramel dengan pedas sambal bawang cobek' }
    ]
  },
  {
    id: 'd1-b2-s1-geprek-moza',
    nama: 'Geprek Moza (Mozarella Torch Cobek)',
    kode: 'HC-SOP-GPR-04',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 1',
    stationLabel: 'Station 1: Geprek ORI, Krisbar Geprek, Geprek Moza',
    divisi: 'Geprek',
    stdDetik: 90,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 35,
    gramaturLabel: 'Gramatur Keju Mozarella (35g)',
    deskripsi: 'Ayam geprek ditaburi keju mozarella 35g, ditorch langsung di atas cobek hingga melted kecokelatan.',
    titikKritis: [
      'Gunakan gas torch dengan jarak semprot 8-10 cm agar keju melted merata tanpa gosong hitam',
      'Torch dilakukan langsung di atas cobek batu tahan panas',
      'Pastikan keju mozarella meleleh menutupi ayam sebelum disajikan'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Geprek ayam krispi bersama sambal bawang di cobek batu.' },
      { nomor: 2, teks: 'Timbang keju mozarella 35 gram dan taburkan di atas ayam geprek.', isKritis: true },
      { nomor: 3, teks: 'Nyalakan gas torch dengan api biru stabil.' },
      { nomor: 4, teks: 'Torch permukaan keju mozarella selama 20-30 detik hingga melted kecokelatan aromatik.', isKritis: true },
      { nomor: 5, teks: 'Sajikan dalam keadaan keju masih mulur panas.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa gramasi keju mozarella untuk menu Geprek Moza?', kunci: '35 gram' },
      { tanya: 'Di mana proses torch keju mozarella dilakukan?', kunci: 'Langsung di atas cobek batu tahan panas' }
    ]
  },

  // =========================================================================
  // DAY 1 - BATCH 2 - STATION 2: NASHVILLE, MENTAI KRISPI, GEPREK MENTAI, KRISBAR KRISPI, AYOLI KRISPI
  // =========================================================================
  {
    id: 'd1-b2-s2-nashville',
    nama: 'Hot Nashville',
    kode: 'HC-SOP-KIT-05',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'Station 2: Nashville, Mentai Krispi, Geprek Mentai, Krisbar Krispi, Ayoli Krispi',
    divisi: 'Kitchen',
    stdDetik: 60,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 30,
    gramaturLabel: 'Minyak Bumbu Nashville (30g) + Boncabe (1g)',
    deskripsi: 'Pencelupan minyak panas bumbu Nashville 30g + tabur 1g boncabe level pedas.',
    titikKritis: [
      'Takaran bumbu minyak panas Nashville tepat 30g per potong ayam',
      'Taburan boncabe bubuk tepat 1g ditabur merata dengan saringan shaker',
      'Ayam dicelup hangat dan segera disajikan agar kerenyahan kulit tetap terjaga'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Ambil ayam krispi panas dari warmer.' },
      { nomor: 2, teks: 'Tuang 30 gram minyak bumbu rempah Nashville panas ke wadah pencelup.', isKritis: true },
      { nomor: 3, teks: 'Celupkan ayam secara merata ke bumbu merah Nashville.', isKritis: true },
      { nomor: 4, teks: 'Angkat dan letakkan di piring saji / kemasan.' },
      { nomor: 5, teks: 'Taburkan 1 gram boncabe bubuk di atas permukaan ayam.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa gramasi takaran bumbu minyak Nashville dan boncabe?', kunci: '30 gram bumbu minyak Nashville + 1 gram boncabe' }
    ]
  },
  {
    id: 'd1-b2-s2-mentai-krispi',
    nama: 'Mentai Krispi',
    kode: 'HC-SOP-KIT-06',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'Station 2: Nashville, Mentai Krispi, Geprek Mentai, Krisbar Krispi, Ayoli Krispi',
    divisi: 'Kitchen',
    stdDetik: 60,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 40,
    gramaturLabel: 'Gramatur Saus Mentai (40g)',
    deskripsi: 'Ayam krispi utuh disiram saus mentai 40g, torch merata, diangkat wajib menggunakan 2 solet.',
    titikKritis: [
      'Saus mentai 40g disemprotkan zigzag menutupi permukaan ayam krispi utuh',
      'Torch selama 15-20 detik hingga saus mentai sedikit karamel keemasan berbusa',
      'Wajib diangkat menggunakan 2 solet stainless agar bentuk dan saus tidak rusak/berceceran'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Ambil ayam krispi utuh dari warmer.' },
      { nomor: 2, teks: 'Aplikasikan saus mentai 40 gram secara merata menutupi ayam.', isKritis: true },
      { nomor: 3, teks: 'Nyalakan torch dan bakar permukaan saus hingga wangi karamel.', isKritis: true },
      { nomor: 4, teks: 'Gunakan 2 solet untuk mengangkat ayam ke piring saji secara higienis.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Alat apa yang wajib digunakan saat mengangkat mentai krispi?', kunci: 'Wajib 2 solet stainless agar saus tidak rusak atau tumpah' },
      { tanya: 'Berapa gramasi standar saus mentai per porsi?', kunci: '40 gram' }
    ]
  },
  {
    id: 'd1-b2-s2-geprek-mentai',
    nama: 'Geprek Mentai',
    kode: 'HC-SOP-GPR-05',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'Station 2: Nashville, Mentai Krispi, Geprek Mentai, Krisbar Krispi, Ayoli Krispi',
    divisi: 'Geprek',
    stdDetik: 60,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 40,
    gramaturLabel: 'Saus Mentai (40g) + Sambal (20g)',
    deskripsi: 'Ayam digeprek dengan sambal bawang, disiram saus mentai 40g dan ditorch di atas cobek.',
    titikKritis: [
      'Geprek ayam 2 ketukan dengan sambal bawang 20g terlebih dahulu',
      'Siram saus mentai 40g di atas ayam yang sudah digeprek',
      'Torch merata di atas cobek hingga aroma khas mentai bakar wangi'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Geprek ayam bersama sambal bawang di cobek batu.' },
      { nomor: 2, teks: 'Semprotkan saus mentai 40 gram merata.', isKritis: true },
      { nomor: 3, teks: 'Torch saus mentai hingga sedikit berkaramel wangi.', isKritis: true },
      { nomor: 4, teks: 'Sajikan dengan 2 slice timun segar.' }
    ],
    autoQuestions: [
      { tanya: 'Apa perbedaan mendasar antara Geprek Mentai dan Mentai Krispi?', kunci: 'Geprek Mentai ayamnya digeprek sambal di cobek terlebih dahulu, sedangkan Mentai Krispi ayam utuh tanpa digeprek' }
    ]
  },
  {
    id: 'd1-b2-s2-krisbar-krispi',
    nama: 'Krisbar Krispi',
    kode: 'HC-SOP-KIT-07B',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'Station 2: Nashville, Mentai Krispi, Geprek Mentai, Krisbar Krispi, Ayoli Krispi',
    divisi: 'Kitchen',
    stdDetik: 120,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Ayam krispi utuh dipanggang di grill pan dengan olesan saus krisbar bakar karamel smokey.',
    titikKritis: [
      'Grill pan dipanaskan api sedang merata',
      'Celupkan ayam ke saus krisbar 2x pemanggangan bolak-balik',
      'Pastikan bumbu berkaramel tanpa membuat tepung ayam gosong arang'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Panaskan grill pan anti lengket.' },
      { nomor: 2, teks: 'Celup ayam krispi ke saus krisbar lalu panggang 1 menit tiap sisi.' },
      { nomor: 3, teks: 'Oleskan saus krisbar kedua dan bakar hingga wangi karamel smokey.', isKritis: true },
      { nomor: 4, teks: 'Angkat dan sajikan di piring dine in / box take away.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa kali celupan saus krisbar dilakukan saat membakar krisbar krispi?', kunci: '2 kali celup dan bolak-balik panggangan' }
    ]
  },
  {
    id: 'd1-b2-s2-ayoli-krispi',
    nama: 'Ayoli Krispi',
    kode: 'HC-SOP-KIT-18',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 2',
    stationLabel: 'Station 2: Nashville, Mentai Krispi, Geprek Mentai, Krisbar Krispi, Ayoli Krispi',
    divisi: 'Kitchen',
    stdDetik: 45,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 35,
    gramaturLabel: 'Gramatur Saus Ayoli (35g / 1 Cup)',
    deskripsi: 'Ayam krispi disajikan dengan saus ayoli gurih creamy 1 cup terpisah + garpu/sendok kecil.',
    titikKritis: [
      'Saus ayoli disajikan dalam cup saus standar 1 cup (35g) higienis bertutup',
      'Sertakan garpu/sendok saus kecil dalam paket penyajian',
      'Ayam krispi tetap kering garing saat disajikan'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Ambil ayam krispi renyah dari warmer.' },
      { nomor: 2, teks: 'Siapkan 1 cup saus ayoli standar 35 gram.', isKritis: true },
      { nomor: 3, teks: 'Letakkan cup saus ayoli berdampingan dengan ayam krispi di kemasan.', isKritis: true },
      { nomor: 4, teks: 'Sertakan garpu/sendok saus dan 2 slice timun segar.' }
    ],
    autoQuestions: [
      { tanya: 'Bagaimana standar penyajian saus ayoli pada menu Ayoli Krispi?', kunci: 'Disajikan dalam 1 cup saus tersendiri (35g) disertai garpu/sendok saus' }
    ]
  },

  // =========================================================================
  // DAY 1 - BATCH 2 - STATION 3: NASI GORENG GEPREK, GEPREK KEJU PARUT, GEPREK AYOLI
  // =========================================================================
  {
    id: 'd1-b2-s3-nasgor-geprek',
    nama: 'Nasi Goreng Geprek',
    kode: 'HC-SOP-KIT-05B',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'Station 3: Nasi Goreng Geprek, Geprek Keju Parut, Geprek Ayoli',
    divisi: 'Kitchen',
    stdDetik: 240,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 170,
    gramaturLabel: 'Nasi Dingin (170g) + Bumbu ECO (20g)',
    deskripsi: 'Wajan wok api besar, Nasi 170g timbang, bumbu ECO 20g timbang, tanpa suhu minyak, timun 2 slice.',
    titikKritis: [
      'Nasi putih dingin wajib ditimbang tepat 170g (toleransi ±5g)',
      'Bumbu nasi goreng ECO wajib ditimbang tepat 20g',
      'Masak dengan API BESAR dan sutil ditekan cepat agar bumbu tercampur rata dan berasap sedap',
      'Sertakan 2 slice timun segar dan ayam geprek di atas nasi goreng'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Timbang nasi putih dingin 170 gram dan bumbu nasi goreng ECO 20 gram.', isKritis: true },
      { nomor: 2, teks: 'Panaskan wajan wok dengan 15 ml minyak pada api besar.' },
      { nomor: 3, teks: 'Tumis bumbu ECO 20g hingga harum wangi sedap.', isKritis: true },
      { nomor: 4, teks: 'Masukkan nasi 170g dan tekan-tekan cepat dengan sutil pada API BESAR.', isKritis: true },
      { nomor: 5, teks: 'Aduk hingga bumbu merata dan nasi matang berasap harum (3-4 menit).' },
      { nomor: 6, teks: 'Pindahkan ke piring saji, tambahkan ayam geprek dan 2 slice timun.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa gramasi baku nasi dan bumbu ECO untuk 1 porsi nasi goreng?', kunci: 'Nasi 170 gram dan bumbu ECO 20 gram (wajib timbang)' },
      { tanya: 'Apakah pembuatan nasi goreng memerlukan termometer suhu minyak?', kunci: 'Tidak, nasi goreng tidak menggunakan input suhu minyak' },
      { tanya: 'Berapa potong timun segar yang wajib disertakan pada nasi goreng?', kunci: '2 slice timun segar' }
    ]
  },
  {
    id: 'd1-b2-s3-geprek-keju-parut',
    nama: 'Geprek Keju Parut',
    kode: 'HC-SOP-GPR-06',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'Station 3: Nasi Goreng Geprek, Geprek Keju Parut, Geprek Ayoli',
    divisi: 'Geprek',
    stdDetik: 45,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 20,
    gramaturLabel: 'Gramatur Keju Parut (20g)',
    deskripsi: 'Ayam digeprek dengan sambal bawang 30g lalu ditaburi keju cheddar parut 20g melimpah.',
    titikKritis: [
      'Geprek ayam 2 ketukan mantap di cobek dengan sambal bawang 30g',
      'Taburan keju cheddar parut tepat 20g menutupi seluruh permukaan ayam geprek',
      'Sajikan rapi dengan 2 slice timun segar'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Siapkan ayam geprek sambal bawang 30g di atas piring.' },
      { nomor: 2, teks: 'Timbang keju cheddar parut 20 gram.', isKritis: true },
      { nomor: 3, teks: 'Taburkan keju parut merata seperti gunung salju menutupi ayam.', isKritis: true },
      { nomor: 4, teks: 'Hias dengan 2 slice timun segar di tepi piring.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa gramasi keju cheddar parut pada menu Geprek Keju Parut?', kunci: '20 gram' }
    ]
  },
  {
    id: 'd1-b2-s3-geprek-ayoli',
    nama: 'Geprek Ayoli',
    kode: 'HC-SOP-GPR-07',
    day: 'Day 1',
    batch: 'Batch 2',
    station: 'Station 3',
    stationLabel: 'Station 3: Nasi Goreng Geprek, Geprek Keju Parut, Geprek Ayoli',
    divisi: 'Geprek',
    stdDetik: 45,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 35,
    gramaturLabel: 'Gramatur Saus Ayoli (35g)',
    deskripsi: 'Ayam digeprek dengan sambal bawang lalu disiram saus ayoli gurih creamy 35g zigzag.',
    titikKritis: [
      'Geprek ayam dengan sambal bawang sesuai level kepedasan',
      'Tuangkan saus ayoli 35g dengan pola zigzag cantik menutupi daging ayam',
      'Perpaduan pedas sambal dan gurih lembut saus ayoli seimbang'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Geprek ayam bersama sambal bawang di cobek batu.' },
      { nomor: 2, teks: 'Pindahkan ayam geprek ke piring saji.' },
      { nomor: 3, teks: 'Siram saus ayoli 35 gram secara zigzag menutupi permukaan.', isKritis: true },
      { nomor: 4, teks: 'Tambahkan 2 slice timun segar.' }
    ],
    autoQuestions: [
      { tanya: 'Bagaimana cara penuangan saus ayoli pada Geprek Ayoli?', kunci: 'Disiram secara zigzag merata (35g) menutupi permukaan ayam yang sudah digeprek' }
    ]
  },

  // =========================================================================
  // DAY 2 - STATION 1: NASI, GORENG KULIT, MILKSHAKE COKLAT, STRAWBERRY, VANILLA
  // =========================================================================
  {
    id: 'd2-s1-nasi',
    nama: 'Nasi (Rice Cooker 4 Cup D2)',
    kode: 'HC-SOP-KIT-01B',
    day: 'Day 2',
    batch: 'All Batch',
    station: 'Station 1',
    stationLabel: 'Station 1: Nasi, Goreng Kulit, Milkshake',
    divisi: 'Kitchen',
    stdDetik: 900,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'SOP Tanak Nasi Day 2: 4 cup beras : 5 cup air, resting 15 menit, centong standar.',
    titikKritis: [
      'Rasio air tepat 4 cup beras : 5 cup air bersih',
      'Resting 15 menit pasca jegleg sebelum dibuka'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Ambil 4 cup beras Miyako takaran rata bibir cup.' },
      { nomor: 2, teks: 'Cuci beras minimal 3 kali bilas hingga air jernih.' },
      { nomor: 3, teks: 'Masukkan beras ke panci dan tambahkan 5 cup air.', isKritis: true },
      { nomor: 4, teks: 'Tekan tombol api kecil (kiri) lalu tombol COOK (kanan).', isKritis: true },
      { nomor: 5, teks: 'Tunggu jegleg dan diamkan resting 15 menit tertutup.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Mengapa nasi wajib didiamkan 15 menit setelah tombol naik (jegleg)?', kunci: 'Agar uap air terserap sempurna dan nasi tanak matang pulen' }
    ]
  },
  {
    id: 'd2-s1-goreng-kulit',
    nama: 'Goreng Kulit (Kulit Krispi D2)',
    kode: 'HC-SOP-KIT-03',
    day: 'Day 2',
    batch: 'All Batch',
    station: 'Station 1',
    stationLabel: 'Station 1: Nasi, Goreng Kulit, Milkshake',
    divisi: 'Kitchen',
    stdDetik: 720,
    requiresOilTemp: true,
    targetSuhuMinyak: 150,
    requiresGramatur: true,
    targetGramatur: 60,
    gramaturLabel: 'Gramatur Matang (Target 60g dari mentah 50g)',
    deskripsi: 'Deep Fryer 150°C, mentah 50g -> matang 60g, 2x dusting, goreng 12 menit.',
    titikKritis: [
      'Suhu minyak deep fryer wajib tepat 150°C',
      'Timbang 1 porsi kulit mentah 50g menghasilkan kulit matang 60g (toleransi ±2g)',
      'Goreng tepat 12 menit dengan pemisahan agar kulit tidak saling menempel menggumpal'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Timbang kulit mentah 50 gr per porsi.', isKritis: true },
      { nomor: 2, teks: 'Cek suhu minyak deep fryer di 150°C.', isKritis: true },
      { nomor: 3, teks: 'Tepungi kulit dengan 2 kali penepungan (dusting - celup air - dusting mekar).' },
      { nomor: 4, teks: 'Goreng selama 12 menit di deep fryer.', isKritis: true },
      { nomor: 5, teks: 'Angkat, tiriskan minyak hingga kering, timbang hasil jadi 60g.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa suhu minyak deep fryer dan waktu goreng kulit ayam?', kunci: 'Suhu 150°C selama 12 menit tepat' },
      { tanya: 'Berapa gramasi kulit mentah dan matang per porsi?', kunci: 'Mentah 50 gram menghasilkan kulit matang 60 gram' }
    ]
  },
  {
    id: 'd2-s1-milkshake-coklat',
    nama: 'Milkshake Coklat',
    kode: 'HC-SOP-BAR-02A',
    day: 'Day 2',
    batch: 'All Batch',
    station: 'Station 1',
    stationLabel: 'Station 1: Nasi, Goreng Kulit, Milkshake',
    divisi: 'Kasir',
    stdDetik: 60,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Bubuk coklat premium HARA, susu fresh milk, 1 cup es kristal, blender 20-30 detik creamy.',
    titikKritis: [
      'Takaran bubuk coklat dan susu cair sesuai standar cup 16oz',
      'Blender selama 20-30 detik hingga tekstur kental lembut tanpa bongkahan es kasar',
      'Sajikan dalam cup bertutup dome/flat dengan sedotan boba'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Masukkan bubuk coklat HARA ke blender.' },
      { nomor: 2, teks: 'Tambahkan susu cair dan 1 cup penuh es kristal higienis.' },
      { nomor: 3, teks: 'Nyalakan blender pada kecepatan tinggi selama 20-30 detik.', isKritis: true },
      { nomor: 4, teks: 'Tuang ke cup saji dan pasang tutup cup secara rapat higienis.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa lama waktu blending milkshake coklat?', kunci: '20 sampai 30 detik hingga tekstur creamy berbusa halus' }
    ]
  },
  {
    id: 'd2-s1-milkshake-strawberry',
    nama: 'Milkshake Strawberry',
    kode: 'HC-SOP-BAR-02B',
    day: 'Day 2',
    batch: 'All Batch',
    station: 'Station 1',
    stationLabel: 'Station 1: Nasi, Goreng Kulit, Milkshake',
    divisi: 'Kasir',
    stdDetik: 60,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Bubuk strawberry segar HARA, susu cair, es kristal, blender 20-30 detik warna pink cerah.',
    titikKritis: [
      'Rasio bubuk strawberry dan susu pas menghasilkan warna pink cerah menggugah selera',
      'Blender 20-30 detik hingga es batu hancur halus',
      'Pastikan cup bersih dari tumpahan saat diserahkan ke pelanggan'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Masukkan bubuk strawberry dan susu ke tabung blender.' },
      { nomor: 2, teks: 'Beri 1 cup es kristal penuh.' },
      { nomor: 3, teks: 'Blender 20-30 detik hingga homogen creamy.', isKritis: true },
      { nomor: 4, teks: 'Tuang ke cup dan lap bibir cup sebelum ditutup.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Apa indikator keberhasilan milkshake strawberry siap disajikan?', kunci: 'Warna pink cerah merata, berbusa lembut, dan es batu hancur halus' }
    ]
  },
  {
    id: 'd2-s1-milkshake-vanilla',
    nama: 'Milkshake Vanilla',
    kode: 'HC-SOP-BAR-02C',
    day: 'Day 2',
    batch: 'All Batch',
    station: 'Station 1',
    stationLabel: 'Station 1: Nasi, Goreng Kulit, Milkshake',
    divisi: 'Kasir',
    stdDetik: 60,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Bubuk vanilla aromatik HARA, susu cair, es kristal, blender creamy lembut manis seimbang.',
    titikKritis: [
      'Aroma wangi vanilla khas HARA keluar lembut tidak enek',
      'Blender 20-30 detik hingga es halus',
      'Penyajian dingin segar higienis'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Masukkan bubuk vanilla HARA dan susu ke blender.' },
      { nomor: 2, teks: 'Tambahkan 1 cup es kristal.' },
      { nomor: 3, teks: 'Blender 20-30 detik hingga kental berbusa lembut.', isKritis: true },
      { nomor: 4, teks: 'Tuang ke cup saji dan tutup rapat.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa takaran es batu untuk 1 cup milkshake vanilla?', kunci: '1 cup penuh es kristal higienis' }
    ]
  },

  // =========================================================================
  // DAY 2 - STATION 2: TEH, SAMBAL MATAH, SAMBAL DAUN JERUK, SUSU COKLAT
  // =========================================================================
  {
    id: 'd2-s2-teh',
    nama: 'Teh (Racikan 8 Liter D2)',
    kode: 'HC-SOP-BAR-01B',
    day: 'Day 2',
    batch: 'All Batch',
    station: 'Station 2',
    stationLabel: 'Station 2: Teh, Sambal Matah, Sambal Daun Jeruk, Susu Coklat',
    divisi: 'Kasir',
    stdDetik: 300,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Racikan teh melati HARA batch 8 Liter Day 2, saring kain 2x, gula cair seimbang.',
    titikKritis: [
      'Batch seduh 8 liter air mendidih',
      'Penyaringan 2 kali dengan kain saringan bersih',
      'Label waktu seduh ditempel pada dispenser'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Didihkan 8 liter air bersih.' },
      { nomor: 2, teks: 'Masukkan racikan teh melati batch 8 liter dan aduk rata.' },
      { nomor: 3, teks: 'Diamkan 10-15 menit untuk ekstraksi optimal.' },
      { nomor: 4, teks: 'Saring 2 kali dengan kain saringan teh.', isKritis: true },
      { nomor: 5, teks: 'Campur larutan gula cair dan tuang ke dispenser teh.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa liter kapasitas batch seduh teh pada Day 2?', kunci: '8 Liter' }
    ]
  },
  {
    id: 'd2-s2-sambal-matah',
    nama: 'Sambal Matah (Takaran 30g)',
    kode: 'HC-SOP-GPR-08',
    day: 'Day 2',
    batch: 'All Batch',
    station: 'Station 2',
    stationLabel: 'Station 2: Teh, Sambal Matah, Sambal Daun Jeruk, Susu Coklat',
    divisi: 'Geprek',
    stdDetik: 60,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 30,
    gramaturLabel: 'Gramatur Sambal Matah Jadi (30g)',
    deskripsi: 'Irisan tipis bawang merah, serai, cabai rawit, terasi bakar, siraman 15ml minyak panas kelapa/fryer.',
    titikKritis: [
      'Irisan bawang merah dan serai wajib tipis halus agar harum aromatik',
      'Takaran sambal matah pas 30g per porsi',
      'Siram minyak panas mendidih dan remas/aduk lembut dengan sendok higienis'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Iris tipis bawang merah, cabai rawit, dan serai bagian putih.' },
      { nomor: 2, teks: 'Campurkan garam dan terasi bakar sedikit di mangkuk stainless.' },
      { nomor: 3, teks: 'Siramkan 15 ml minyak panas mendidih.', isKritis: true },
      { nomor: 4, teks: 'Aduk lembut hingga aroma serai dan bawang segar keluar.', isKritis: true },
      { nomor: 5, teks: 'Timbang porsi saji 30 gram di atas ayam goreng krispi.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa gramasi standar sambal matah per porsi?', kunci: '30 gram' },
      { tanya: 'Bagaimana cara penuangan minyak pada sambal matah?', kunci: 'Minyak panas mendidih (15ml) disiram langsung di atas irisan bumbu segar' }
    ]
  },
  {
    id: 'd2-s2-sambal-daun-jeruk',
    nama: 'Sambal Daun Jeruk (Takaran 30g)',
    kode: 'HC-SOP-GPR-09',
    day: 'Day 2',
    batch: 'All Batch',
    station: 'Station 2',
    stationLabel: 'Station 2: Teh, Sambal Matah, Sambal Daun Jeruk, Susu Coklat',
    divisi: 'Geprek',
    stdDetik: 60,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 30,
    gramaturLabel: 'Gramatur Sambal Daun Jeruk (30g)',
    deskripsi: 'Cabai rawit uleg kasar, rajangan daun jeruk segar (tulang daun dibuang), siraman minyak panas 15ml.',
    titikKritis: [
      'Tulang daun jeruk wajib dibuang agar rasa tidak pahit getir',
      'Irisan daun jeruk sangat halus seperti benang',
      'Takaran sambal tepat 30g disajikan harum segar'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Buang tulang daun jeruk lalu iris sangat tipis memanjang.', isKritis: true },
      { nomor: 2, teks: 'Uleg kasar cabai rawit merah dan bawang putih di cobek batu.' },
      { nomor: 3, teks: 'Campurkan irisan daun jeruk ke dalam sambal uleg.' },
      { nomor: 4, teks: 'Siram 1 sendok takar (15ml) minyak panas mendidih dan aduk rata.', isKritis: true },
      { nomor: 5, teks: 'Timbang porsi 30 gram di atas ayam krispi.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Mengapa tulang daun jeruk wajib dibuang sebelum diiris?', kunci: 'Agar sambal tidak berasa pahit getir' },
      { tanya: 'Berapa gramasi standar sambal daun jeruk per porsi?', kunci: '30 gram' }
    ]
  },
  {
    id: 'd2-s2-susu-coklat',
    nama: 'Susu Coklat (Sucok Dingin)',
    kode: 'HC-SOP-BAR-03',
    day: 'Day 2',
    batch: 'All Batch',
    station: 'Station 2',
    stationLabel: 'Station 2: Teh, Sambal Matah, Sambal Daun Jeruk, Susu Coklat',
    divisi: 'Kasir',
    stdDetik: 45,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Susu coklat kental manis di dasar cup, es batu kristal, susu evaporasi/UHT di atasnya membentuk layer.',
    titikKritis: [
      'Takaran susu coklat kental manis di dasar cup tepat 35ml',
      'Isi es kristal hingga 3/4 cup',
      'Tuangkan susu UHT dingin di atasnya secara perlahan'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Tuang susu coklat kental manis ke dasar cup saji.' },
      { nomor: 2, teks: 'Isi cup dengan es kristal hingga 3/4 tinggi cup.' },
      { nomor: 3, teks: 'Tuangkan susu cair UHT dingin hingga bibir cup.', isKritis: true },
      { nomor: 4, teks: 'Tutup cup dengan tutup rapat dan sertakan sedotan higienis.' }
    ],
    autoQuestions: [
      { tanya: 'Bagaimana urutan penuangan pembuatan susu coklat (sucok) dingin?', kunci: 'Susu coklat kental di dasar cup, es kristal 3/4, lalu dituangkan susu UHT dingin di atasnya' }
    ]
  },

  // =========================================================================
  // DAY 2 - STATION 3: MENGGORENG AYAM, ORANGE
  // =========================================================================
  {
    id: 'd2-s3-goreng-ayam',
    nama: 'Menggoreng Ayam (D2)',
    kode: 'HC-SOP-KIT-02B',
    day: 'Day 2',
    batch: 'All Batch',
    station: 'Station 3',
    stationLabel: 'Station 3: Menggoreng Ayam, Orange',
    divisi: 'Kitchen',
    stdDetik: 720,
    requiresOilTemp: true,
    targetSuhuMinyak: 160,
    deskripsi: 'Evaluasi lanjutan menggoreng ayam Day 2: kalibrasi suhu 160°C, timer 12 menit, goyang menit 3, 6, 9.',
    titikKritis: [
      'Suhu minyak deep fryer tepat 160°C (toleransi 158°C - 162°C)',
      'Goyangkan keranjang deep fryer di menit 3, 6, dan 9 agar matang sempurna',
      'Tiriskan minyak tuntas dan pindahkan dengan jepitan stainless'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Nyalakan api kompor deep fryer dan putar pengatur suhu ke 175°C.' },
      { nomor: 2, teks: 'Cek suhu minyak dengan termometer probe hingga mencapai 160°C.', isKritis: true },
      { nomor: 3, teks: 'Lakukan penepungan ayam (dusting 2x): ayam termarinasi dicubit lembut agar keriting mekar.' },
      { nomor: 4, teks: 'Goreng selama 12 menit tepat, goyang keranjang di menit 3, 6, 9.', isKritis: true },
      { nomor: 5, teks: 'Angkat dan tiriskan minyak tuntas ke warmer.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa suhu minyak baku saat dropping ayam di Day 2?', kunci: '160°C wajib verifikasi termometer probe' }
    ]
  },
  {
    id: 'd2-s3-orange',
    nama: 'Orange (1 Porsi Segar)',
    kode: 'HC-SOP-BAR-04',
    day: 'Day 2',
    batch: 'All Batch',
    station: 'Station 3',
    stationLabel: 'Station 3: Menggoreng Ayam, Orange',
    divisi: 'Kasir',
    stdDetik: 45,
    requiresOilTemp: false,
    requiresGramatur: false,
    deskripsi: 'Konsentrat jeruk segar HARA 40ml, air dingin 150ml, es kristal penuh cup 16oz.',
    titikKritis: [
      'Takaran sari jeruk 40ml pas tidak terlalu asam atau manis',
      'Aduk rata sebelum diberi es batu',
      'Penyajian dingin segar di bawah 45 detik dari order'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Tuang konsentrat sari jeruk 40 ml ke dalam cup saji.' },
      { nomor: 2, teks: 'Tambahkan air dingin 150 ml dan aduk larut dengan sendok bar.', isKritis: true },
      { nomor: 3, teks: 'Isi penuh cup dengan es kristal higienis.', isKritis: true },
      { nomor: 4, teks: 'Tutup cup rapat dan sajikan segar dengan sedotan.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa standar durasi pembuatan 1 porsi es orange di bar kasir?', kunci: 'Maksimal 45 detik dari tiket order diterima' }
    ]
  },

  // =========================================================================
  // DAY 2 - ALL CREW: GORENG JAMUR, KENTANG
  // =========================================================================
  {
    id: 'd2-all-jamur',
    nama: 'Goreng Jamur Enoki',
    kode: 'HC-SOP-KIT-12',
    day: 'Day 2',
    batch: 'All Batch',
    station: 'All Crew',
    stationLabel: 'All Crew: Goreng Jamur, Kentang',
    divisi: 'Kitchen',
    stdDetik: 180,
    requiresOilTemp: true,
    targetSuhuMinyak: 150,
    requiresGramatur: true,
    targetGramatur: 50,
    gramaturLabel: 'Gramatur Jamur Mentah (50g per porsi + 2.5g bumbu)',
    deskripsi: 'Deep Fryer 150°C, Jamur Enoki 50g ditimbang, balur tepung breader tipis, goreng 3 menit + 2.5g bumbu.',
    titikKritis: [
      'Timbang jamur enoki tepat 50g per porsi',
      'Suhu minyak deep fryer tepat 150°C',
      'Goreng tepat 3 menit hingga keemasan mekar melepuh renyah',
      'Tiriskan minyak tuntas lalu shake dengan 2.5g bumbu kentang di shaker'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Timbang jamur enoki segar 50 gram per porsi.', isKritis: true },
      { nomor: 2, teks: 'Cek suhu minyak deep fryer berada pada angka 150°C.', isKritis: true },
      { nomor: 3, teks: 'Pisahkan kuntum jamur dan tepungi dengan tepung breader HARA tipis merata.' },
      { nomor: 4, teks: 'Goreng selama 3 menit hingga renyah garing tidak gosong.', isKritis: true },
      { nomor: 5, teks: 'Angkat, tiriskan minyak, taburi 2.5g bumbu kentang, lalu shake di wadah tertutup.', isKritis: true }
    ],
    autoQuestions: [
      { tanya: 'Berapa suhu minyak dan durasi penggorengan jamur enoki?', kunci: 'Suhu 150°C selama 3 menit' },
      { tanya: 'Berapa gramasi baku jamur enoki mentah per porsi?', kunci: '50 gram per porsi' }
    ]
  },
  {
    id: 'd2-all-kentang',
    nama: 'Kentang Goreng (French Fries)',
    kode: 'HC-SOP-KIT-08B',
    day: 'Day 2',
    batch: 'All Batch',
    station: 'All Crew',
    stationLabel: 'All Crew: Goreng Jamur, Kentang',
    divisi: 'Kitchen',
    stdDetik: 300,
    requiresOilTemp: false,
    requiresGramatur: true,
    targetGramatur: 100,
    gramaturLabel: 'Gramatur Kentang Frozen (100g per porsi + 2.5g bumbu)',
    deskripsi: 'Wajan/fryer minyak panas, kentang frozen 100g timbang, goreng 5 menit garing + 2.5g bumbu shaker.',
    titikKritis: [
      'Timbang kentang frozen tepat 100g per porsi',
      'Goreng selama 5 menit hingga warna keemasan garing renyah tidak layu',
      'Tiriskan minyak dan shake rata dengan 2.5g bumbu kentang'
    ],
    langkahSOP: [
      { nomor: 1, teks: 'Timbang kentang frozen 100 gram per porsi.', isKritis: true },
      { nomor: 2, teks: 'Masukkan kentang ke minyak panas dan goreng selama 5 menit.', isKritis: true },
      { nomor: 3, teks: 'Angkat dan tiriskan minyak hingga kering.' },
      { nomor: 4, teks: 'Masukkan ke shaker, tambahkan 2.5 gram bumbu kentang, lalu shake rata.', isKritis: true },
      { nomor: 5, teks: 'Sajikan di kantong kemasan kentang HARA Chicken.' }
    ],
    autoQuestions: [
      { tanya: 'Berapa gramasi kentang frozen dan durasi penggorengannya?', kunci: '100 gram digoreng selama 5 menit' },
      { tanya: 'Berapa gram takaran bumbu kentang saat di-shake?', kunci: '2.5 gram bumbu per porsi' }
    ]
  }
];
