import React, { useState, useMemo, useEffect } from 'react';
import {
  Flame, Clock, Users, CheckCircle2, AlertTriangle, Scale,
  Thermometer, Award, Sparkles, RefreshCw, ChefHat, Shuffle,
  Printer, Play, Pause, RotateCcw, ChevronRight, Eye,
  FileCheck, ShieldCheck, Utensils, Box, ArrowRight, Star,
  Download, FileSpreadsheet, Layers, BookOpen, Compass, Check,
  Info, Coffee, PackageCheck, Timer, Zap, CookingPot, ShieldAlert
} from 'lucide-react';
import { db } from '../../lib/storage';

// ============================================================================
// DATA KONSTANTA & DEFINISI PRODUK RESMI HARA CHICKEN (CV. ULTIMA RASA INDONESIA)
// ============================================================================

export interface ProductSOPItem {
  id: string;
  name: string;
  category: string;
  estimatedTime: string;
  targetMinutes: number;
  criticalPoints: string[];
  equipment: string[];
  keySpec: string;
  dineInStandard: string;
  takeAwayStandard: string;
}

// ----------------------------------------------------------------------------
// BATCH 1: 10 PRODUK DASAR DAPUR HARA (DAY 1)
// ----------------------------------------------------------------------------
export const BATCH_1_PRODUCTS: ProductSOPItem[] = [
  {
    id: 'b1-nasi',
    name: 'Nasi Putih Pulen (Miyako / Rice Cooker Gas)',
    category: 'Karbohidrat & Bahan Pokok',
    estimatedTime: '45 Menit',
    targetMinutes: 45,
    criticalPoints: [
      'Cuci beras minimal 3 kali hingga air bilasan jernih (bebas bau apek & kotoran).',
      'Takar air baku sesuai kalibrasi resmi: 3 cup beras : 4 cup air, 4:5, 5:6, maksimal 6 cup beras : 8 cup air (rasio baku 1:1.33).',
      'Nyalakan api kompor: Tekan tombol kiri (api kecil) terlebih dahulu, baru tekan tombol COOK kanan.',
      'Setelah jegleg matang, WAJIB didiamkan tanak 15 menit (toleransi 13–18 menit sebelum dipindahkan ke Magicom).',
      'Penyajian menggunakan centong standar porsi HARA (porsi mantap pulen merata tanpa perlu timbangan gram per piring).'
    ],
    equipment: ['Rice Cooker Gas Miyako', 'Gelas Ukur Kalibrasi', 'Centong Standar Anti Lengket', 'Ring Mold Nasi'],
    keySpec: 'Pulen tidak pera/lembek, rasio air tepat, porsi standar 1 centong bulat rapi',
    dineInStandard: 'Piring melamin putih bersih dicetak bulat rapi menggunakan ring mold / centong standar.',
    takeAwayStandard: 'Box besar beralas 1/4 lembar kertas nasi atau Bento Box bersekat.'
  },
  {
    id: 'b1-es-teh',
    name: 'Es Teh Manis Segar (Resep 40 Cup)',
    category: 'Minuman Bar Resmi',
    estimatedTime: '25 Menit',
    targetMinutes: 25,
    criticalPoints: [
      '1 bungkus teh resmi HARA (80 gr) + 1 kg gula pasir + 4 liter air mendidih.',
      'Aduk gula larut sempurna, tutup rapat panci dan diamkan ekstraksi selama 20 menit.',
      'Saring menggunakan saringan besar & kecil berlapis ke wadah Jumbo dispenser.',
      'Tambahkan 4 liter air matang galon (khusus outlet Hara Extra Dine-in total air 10L, Take-away total 8L).',
      'Penyajian: Takar 200 ml teh ke dalam cup 14 oz + es batu kristal, Cup Sealer suhu 160°C.'
    ],
    equipment: ['Panci Rebus 10L', 'Saringan Kain Halus Berlapis', 'Jumbo Dispenser Teh', 'Mesin Cup Sealer 160°C', 'Cup 14 oz'],
    keySpec: 'Aroma wangi teh segar melati, manis seimbang (12° Brix), warna amber jernih',
    dineInStandard: 'Gelas akrilik tebal 14 oz dengan es batu kristal higienis.',
    takeAwayStandard: 'Cup 14 oz di-press Cup Sealer suhu 160°C rapat anti-bocor.'
  },
  {
    id: 'b1-sup-sayur',
    name: 'Sup Sayur Hara Extra (1 Resep = 6 Liter)',
    category: 'Kuah & Sayuran',
    estimatedTime: '20 Menit',
    targetMinutes: 20,
    criticalPoints: [
      'Rebus 5 Liter air di panci sup hingga mendidih.',
      'Bumbu halus: 30 gr bawang putih + 6 butir kapulaga ditumis wajan dengan 5 sdm minyak + 1 Liter air tumisan.',
      'Tuang tumisan bumbu ke panci air mendidih + 4.5 sdm (67.5 gr) mix garam + 2 sachet Royco Ayam.',
      'Masukkan Wortel (250 gr), tunggu 2 menit -> Masukkan Kol (600 gr), tunggu 2 menit.',
      'MATIKAN API KOMPOR -> Baru masukkan Seledri (3 batang) dan Daun Bawang/Loncang (1 batang) agar tidak layu hitam.'
    ],
    equipment: ['Panci Sup Stainless 10L', 'Wajan Tumis Bumbu', 'Sendok Sayur Berlubang', 'Timbangan Sayur'],
    keySpec: 'Kuah bening gurih kaldu kapulaga, wortel & kol renyah segar tidak lembek, suhu >= 70°C',
    dineInStandard: 'Mangkuk sup kecil melamin HARA disajikan hangat mengepul.',
    takeAwayStandard: 'Paper Bowl kuah tahan panas bertutup rapat + isolasi pengaman.'
  },
  {
    id: 'b1-goreng-ayam',
    name: 'Goreng Ayam Potong Reguler (Deep Fryer)',
    category: 'Pengolahan Panas Utama',
    estimatedTime: '15 Menit',
    targetMinutes: 15,
    criticalPoints: [
      'Setelan kompor Deep Fryer 175°C, suhu minyak saat ayam masuk wajib stabil di 160°C.',
      'Kapasitas goreng: 2 - 3 kg ayam per batch goreng.',
      'Penepungan 2x dengan teknik cubit lembut berputar (DILARANG ditekan-tekan keras hingga bantat).',
      'Waktu goreng tepat 12 menit; goyang keranjang fryer tiap 3 menit agar matang merata.',
      'Suhu core internal daging ayam matang wajib mencapai minimal >= 74°C (cek termometer tusuk).',
      'Kuras & saring minyak setiap selesai 16 - 20 kg ayam atau setiap pergantian shift.'
    ],
    equipment: ['Deep Fryer Gas 175°C / Minyak 160°C', 'Keranjang Stainless Fryer', 'Termometer Probe Tusuk', 'Penjepit 12 inch'],
    keySpec: 'Golden brown mekar keriting krispi, daging dalam juicy matang sempurna tanpa darah',
    dineInStandard: 'Piring melamin saji bersih bebas genangan minyak.',
    takeAwayStandard: 'Paper bag berventilasi udara atau box ayam beralas kertas anti-minyak.'
  },
  {
    id: 'b1-ayam-utuh',
    name: 'Ayam Utuh / AU (Goreng & Packing)',
    category: 'Menu Spesial Utuh',
    estimatedTime: '15 Menit',
    targetMinutes: 15,
    criticalPoints: [
      'Suhu kompor dan minyak stabil di 150°C (lebih rendah dari ayam potong reguler).',
      'Posisi karkas ayam dimekarkan perlahan saat dimasukkan ke dalam minyak panas.',
      'Waktu goreng tepat 12 menit dengan dibolak-balik perlahan tiap 3 menit.',
      'Standar Packing Box AU: 1 ekor ayam utuh + 1 cup sambal bawang + 1 cup sambal daun jeruk + 5 potong timun dibungkus plastik bening 1/4 kg.'
    ],
    equipment: ['Deep Fryer Suhu 150°C', 'Capitan Stainless Besar', 'Box Khusus Ayam Utuh (AU)', 'Cup Sambal Klip'],
    keySpec: 'Ayam utuh mekar simetris, kulit krispi merata, daging dada & paha matang tembus tulang',
    dineInStandard: 'Piring oval besar beralas kertas roti HARA dengan 2 jenis sambal pendamping.',
    takeAwayStandard: 'Box eksklusif AU + 1 cup sambal bawang + 1 cup sambal daun jeruk + 5 slice timun di plastik 1/4 kg.'
  },
  {
    id: 'b1-terong-krispi',
    name: 'Terong Krispi (SOP-TerongKrispi-01)',
    category: 'Side Dish Renyah',
    estimatedTime: '8 Menit',
    targetMinutes: 8,
    criticalPoints: [
      '1 buah terong dipotong serong menjadi 20 slice seragam (1 porsi saji = 10 slice).',
      'Rendam di Air Marinasi Extra (2 siung bawang putih uleg + 5 sdm / 75 gr mix garam + 1 liter air) selama 10 menit.',
      'Lakukan penepungan 2x (tepung kering -> celup air -> tepung kering berbutir).',
      'Goreng di deep fryer pada suhu 150°C selama tepat 5 menit sambil dibolak-balik.',
      'Tiriskan minyak dengan posisi miring di rak kawat.'
    ],
    equipment: ['Pisau Serong & Talenan Hijau', 'Deep Fryer 150°C', 'Baskom Marinasi Extra', 'Serok Stainless'],
    keySpec: 'Warna kuning keemasan, tekstur renyah di luar dan lembut lumer di dalam, tidak menyerap minyak',
    dineInStandard: 'Disusun kipas rapi 10 slice di piring saji mendampingi ayam geprek.',
    takeAwayStandard: 'Paper bag berventilasi udara atau kompartemen samping bento box.'
  },
  {
    id: 'b1-sambal-bawang',
    name: 'Sambal Bawang Segar (1 Resep = 6 Porsi @ 30 gr)',
    category: 'Condiment Inti HARA',
    estimatedTime: '10 Menit',
    targetMinutes: 10,
    criticalPoints: [
      'Komposisi resep: Cabai rawit merah segar 150 gr + bawang putih 35 gr (dipotong 2 bagian).',
      'Goreng cabai dan bawang di wajan dengan 200 ml minyak goreng menggunakan api kecil selama 3 - 5 menit hingga layu wangi.',
      'Uleg halus di cobek batu tradisional (DILARANG KERAS MENGGUNAKAN BLENDER/CHOPPER) + mix garam 7 gr.',
      'Siram dengan 60 ml minyak panas bekas menggoreng bahan tadi.',
      'Timbang presisi 30 gr per porsi menggunakan timbangan digital / sendok takar.'
    ],
    equipment: ['Cobek Batu Tradisional & Ulekan', 'Wajan Penggorengan Cabai', 'Timbangan Digital Presisi', 'Sendok Porsi 30g'],
    keySpec: 'Tekstur ulek manual berbutir basah, warna merah oranye segar, aroma gurih bawang matang, pedas nikmat',
    dineInStandard: 'Dibalurkan langsung menutupi ayam geprek di atas piring atau cobek saji.',
    takeAwayStandard: 'Cup sambal plastik 35ml bertutup klip rapat terpisah atau dibalur di atas ayam.'
  },
  {
    id: 'b1-spinach',
    name: 'Spinach (Bayam Goreng Renyah Gurih)',
    category: 'Side Dish Primadona',
    estimatedTime: '5 Menit',
    targetMinutes: 5,
    criticalPoints: [
      '100 gr daun bayam segar petik dirajang tipis-tipis memanjang.',
      'Goreng di wajan berisi 500 ml minyak panas api sedang selama 90 detik (1.5 menit) sampai kering renyah mekar.',
      'Angkat dan tiriskan minyak hingga tuntas di kertas tiris.',
      'Taburi 1/2 sdt (2.5 gr) bumbu kentang gurih, aduk rata perlahan.',
      'Standar penyajian: 1 porsi saji = 2 sdm takar per piring.'
    ],
    equipment: ['Wajan Penggorengan Wok', 'Serok Kawat Minyak Halus', 'Sendok Takar 2 sdm', 'Kertas Tiris'],
    keySpec: 'Warna hijau zaitun mekar kriuk, tidak gosong/pahit, rasa gurih renyah 100% kering',
    dineInStandard: 'Ditaburkan 2 sdm takar di samping nasi pulen atau di atas ayam.',
    takeAwayStandard: 'Plastik klip pouch mini atau paper cone berventilasi udara.'
  },
  {
    id: 'b1-indomie',
    name: 'Indomie Geprek Racikan HARA',
    category: 'Karbohidrat Alternatif',
    estimatedTime: '5 Menit',
    targetMinutes: 5,
    criticalPoints: [
      'Didihkan 500 ml air bersih di panci mie hingga bergolak kencang.',
      'Masukkan Indomie, rebus tepat selama 2 menit (tekstur kenyal al dente, dilarang lembek).',
      'Saring dan tiriskan mie, angin-anginkan sejenak agar uap panas berlebih keluar.',
      'Baru tuang dan aduk rata bersama bumbu di dalam mangkok saji.'
    ],
    equipment: ['Panci Rebus Mie', 'Capitan Stainless Mie', 'Saringan Kawat Mie', 'Mangkok Pengaduk'],
    keySpec: 'Tekstur mie kenyal lentur tidak mekar benyek, bumbu merata mengkilap gurih',
    dineInStandard: 'Piring melamin ceper putih disajikan berdampingan dengan ayam geprek.',
    takeAwayStandard: 'Paper Bowl bulat tahan panas berlogo HARA dengan tutup transparan.'
  },
  {
    id: 'b1-scramble-egg',
    name: 'Scramble Egg Lembut (1 Telur = 2 Porsi)',
    category: 'Side Dish Protein',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      '1 butir telur ayam segar (menghasilkan 2 porsi saji) + 1/4 gr sendok takar mix garam + 1 sdm susu UHT.',
      'Kocok rata hingga putih dan kuning telur menyatu lembut.',
      'Panaskan wajan dengan 3 sdm minyak goreng baru menggunakan api sedang.',
      'Tuang adonan telur sambil diaduk memutar secara terus-menerus hingga terbentuk lipatan scramble matang lembut.',
      'Dilarang memasak terlalu lama hingga kecokelatan kering.'
    ],
    equipment: ['Wajan Teflon 20cm', 'Spatula Silikon Tahan Panas', 'Sendok Takar 1/4 gr & 1 sdm', 'Mangkuk Kocok'],
    keySpec: 'Tekstur fluffy berlapis basah glossy, warna kuning cerah, rasa creamy gurih lembut',
    dineInStandard: 'Diletakkan rapi di separuh sisi nasi putih hangat 170g.',
    takeAwayStandard: 'Kompartemen bento box bersekat atau di atas nasi kotak take-away.'
  }
];

// ----------------------------------------------------------------------------
// BATCH 2: 11 MENU PERAKITAN / ASSEMBLY RESMI HARA (DAY 1 SIANG)
// ----------------------------------------------------------------------------
export const BATCH_2_PRODUCTS: ProductSOPItem[] = [
  {
    id: 'b2-nasgor-geprek-ori',
    name: 'Nasgor Geprek ORI (SOP-NasGorTelur-02)',
    category: 'Menu Signature Perakitan',
    estimatedTime: '6 Menit',
    targetMinutes: 6,
    criticalPoints: [
      'Nasi putih dingin wajib ditimbang tepat 170 gr (bebas gumpalan).',
      'Minyak goreng 15 ml (1 sdm) dipanaskan di wok, tumis mix sayur 30 gr lebih dulu.',
      'Bumbu nasgor ECO wajib ditimbang tepat 20 gr, masak dengan teknik api besar cepat.',
      'Pelengkap: 1 butir Telur Dadar (1 telur + 1 gr mix garam + 50 ml minyak goreng).',
      'Topping: Ayam Geprek Sambal Bawang 30 gr + WAJIB 2 slice timun segar.',
      'Standar Take-away: Box besar beralas 1 lembar kertas nasi utuh, sendok diletakkan di atas kertas penutup.'
    ],
    equipment: ['Wok Baja High Pressure', 'Timbangan Digital 170g & 20g', 'Sendok Takar Minyak 15ml', 'Box Besar & Kertas Nasi Utuh'],
    keySpec: 'Aroma wok hei smokey, bumbu ECO 20g merata, telur dadar lebar garing, 2 slice timun wajib',
    dineInStandard: 'Piring ceper melamin hitam/putih HARA, telur dadar di samping nasi, 2 slice timun miring 45°.',
    takeAwayStandard: 'Box besar beralas 1 lembar kertas nasi utuh, sendok di atas kertas penutup bersegel stiker QC.'
  },
  {
    id: 'b2-geprek-ori',
    name: 'Ayam Geprek ORI Klasik',
    category: 'Menu Utama HARA',
    estimatedTime: '3 Menit',
    targetMinutes: 3,
    criticalPoints: [
      'Ayam krispi digeprek 2 - 3 ketukan lembut di cobek hingga serat merekah (tulang dilarang hancur remuk).',
      'Balurkan Sambal Bawang takaran tepat 30 gr merata di atas ayam selagi panas.',
      'Wajib disertai 2 slice timun segar bersih.',
      'Standar Take-away: Box besar beralas 1/4 kertas nasi (jika pakai nasi) atau box kecil (tanpa nasi), posisi gagang sendok di atas nasi.'
    ],
    equipment: ['Cobek Tradisional Batu & Ulekan', 'Sendok Sambal 30g', 'Box Besar / Box Kecil', 'Kertas Nasi 1/4'],
    keySpec: 'Kulit kriuk berpadu pedas gurih sambal bawang 30g, 2 slice timun segar',
    dineInStandard: 'Cobek batu saji atau piring melamin merah HARA bersama nasi pulen 170g.',
    takeAwayStandard: 'Box besar (alas 1/4 kertas nasi) / box kecil tanpa nasi, gagang sendok di atas nasi.'
  },
  {
    id: 'b2-geprek-keju-parut',
    name: 'Ayam Geprek Keju Parut',
    category: 'Varian Keju HARA',
    estimatedTime: '3 Menit',
    targetMinutes: 3,
    criticalPoints: [
      'Ayam digeprek dengan sambal bawang 30 gr di cobek.',
      'Pindahkan ayam geprek ke piring saji atau box take-away terlebih dahulu.',
      'Keju cheddar diparut LANGSUNG di atas piring atau box (DILARANG KERAS memarut keju di atas cobek!).',
      'Rapikan tumpukan keju parut menggunakan solet agar simetris menutupi 80% ayam + 2 slice timun.'
    ],
    equipment: ['Parutan Keju Stainless Panjang', 'Solet Silikon Perapi Keju', 'Piring Saji / Box HARA'],
    keySpec: 'Salju keju cheddar rapi dan bersih, tidak tercampur remah kotor cobek, 2 slice timun',
    dineInStandard: 'Piring melamin oval putih, keju parut menjuntai rapi estetik.',
    takeAwayStandard: 'Box HARA beralas kertas pembatas agar parutan keju tidak menempel di tutup box.'
  },
  {
    id: 'b2-geprek-mentai',
    name: 'Ayam Geprek Mentai (SOP-AyamSausMentai-01)',
    category: 'Saus Spesial Torch',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      'Ulek sambal bawang -> Geprek ayam dan padatkan perlahan di cobek.',
      'Beri Saus Mentai gurih kental standar 2 solet penuh di atas permukaan ayam.',
      'Bakar permukaan saus dengan Gas Torch secara memutar hingga timbul bintik kecokelatan harum.',
      'WAJIB angkat ayam menggunakan 2 SOLET ke piring atau box agar bentuk mentai tidak hancur berantakan.',
      'Wajib diberi 2 slice timun. (Masa simpan saus mentai di showcase maksimal 5 hari).'
    ],
    equipment: ['Gas Blow Torch Komersial', '2 Solet Silikon Pengangkat', 'Cobek Batu', 'Piring Keramik / Box'],
    keySpec: 'Saus mentai berkaramel smokey mengkilap, bentuk ayam utuh rapi terangkat 2 solet, 2 slice timun',
    dineInStandard: 'Piring saji melamin tebal tahan panas dengan alas bersih, 2 slice timun miring 45°.',
    takeAwayStandard: 'Box berventilasi udara bersegel aman "Hati-Hati Panas".'
  },
  {
    id: 'b2-geprek-moza',
    name: 'Ayam Geprek Mozarella Melt',
    category: 'Varian Keju Melt',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      'Geprek ayam dengan sambal bawang 30 gr di cobek.',
      'Taruh lembaran keju mozarella pipih (±30 gr) menutupi seluruh permukaan ayam.',
      'Bakar dengan Gas Torch DI ATAS COBEK sampai keju meleleh mulur elastis dan kecokelatan wangi.',
      'Pindahkan perlahan ke piring atau box take-away + 2 slice timun segar.'
    ],
    equipment: ['Gas Blow Torch Dapur', 'Cobek Batu Tahan Panas', 'Capitan / Solet Pengangkat'],
    keySpec: 'Keju mulur elastis menutupi ayam sempurna tanpa jelaga hitam pahit, disajikan panas segera',
    dineInStandard: 'Piring saji panas dengan peringatan keju leleh, disajikan instan ke tamu.',
    takeAwayStandard: 'Box take-away tertutup rapat agar panas keju terjaga.'
  },
  {
    id: 'b2-geprek-ayoli',
    name: 'Ayam Geprek Garlic Ayoli (SOP-SausAyoli-01)',
    category: 'Saus Spesial Ayoli',
    estimatedTime: '3 Menit',
    targetMinutes: 3,
    criticalPoints: [
      'Geprek ayam dengan sambal di cobek -> Pindahkan ke piring atau box.',
      'Siapkan 1 cup Saus Ayoli (campuran chili oil & mayones gurih) yang SUDAH DIADUK RATA MENGGUNAKAN GARPU.',
      'Tuangkan saus ayoli di atas ayam secara merata (atau sajikan terpisah dalam cup jika diminta kasir).',
      'Wajib disertai 2 slice timun segar.'
    ],
    equipment: ['Garpu Pengaduk Stainless', 'Cup Saus Ayoli 35ml', 'Piring Saji / Box HARA'],
    keySpec: 'Saus ayoli emulsi sempurna diaduk garpu (tidak pecah minyak), warna krem oranye satin, 2 slice timun',
    dineInStandard: 'Piring melamin putih bersih dengan siraman saus ayoli estetik.',
    takeAwayStandard: 'Box bento atau cup ayoli terpisah bertutup rapat.'
  },
  {
    id: 'b2-geprek-krisbar',
    name: 'Ayam Geprek Krisbar (Krispi Bakar 2x Celup)',
    category: 'Signature Bakar Grill',
    estimatedTime: '5 Menit',
    targetMinutes: 5,
    criticalPoints: [
      'Celup ayam krispi ke bumbu krisbar gurih manis di mangkok celup.',
      'Bakar di grill pan / wajan bakar panas selama 1.5 menit.',
      'WAJIB CELUP KE-2 KALI ke bumbu krisbar (wajib 2x pencelupan agar bumbu meresap legit).',
      'Bakar kembali di grill pan hingga terbentuk karamelisasi cantik.',
      'Geprek ayam dengan sambal bawang di cobek + 2 slice timun segar.'
    ],
    equipment: ['Grill Pan / Wajan Bakar', 'Mangkok Celup Bumbu Krisbar', 'Capitan Stainless Griddle'],
    keySpec: 'Karamel bakaran smokey legit meresap 2x celup, kulit tetap renyah, 2 slice timun',
    dineInStandard: 'Piring ceper saji bakar berhias 2 iris mentimun segar.',
    takeAwayStandard: 'Paper box tebal beralas kertas anti-lengket khusus grill.'
  },
  {
    id: 'b2-hot-nashville',
    name: 'Hot Nashville Chicken HARA',
    category: 'Varian Pedas Rempah',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      'Aduk rata bumbu minyak rempah Nashville sesuai pilihan level (Biru Lv1, Kuning Lv2, Merah Lv3).',
      'Rendam ayam krispi panas selama tepat 1 menit di dalam 30 gr bumbu minyak pedas.',
      'Tiriskan minyak celup sejenak (10 detik) agar tidak becek berlebih.',
      'Letakkan di piring saji atau box yang BERALAS 1 LEMBAR PLASTIK NASHVILLE KHUSUS.',
      'Taburi tepat 1 gr boncabe di atas permukaan ayam.'
    ],
    equipment: ['Baskom Celup Minyak Nashville', 'Penjepit Stainless', 'Plastik Khusus Nashville', 'Timbangan 1 gr Boncabe'],
    keySpec: 'Warna merah bata pedas menyengat, alas 1 lembar plastik Nashville wajib, taburan 1g boncabe',
    dineInStandard: 'Piring ceper putih beralas 1 lembar plastik Nashville higienis.',
    takeAwayStandard: 'Box take-away beralas 1 lembar plastik Nashville dengan stiker Level Pedas.'
  },
  {
    id: 'b2-krisbar-krispi',
    name: 'Krisbar Krispi Utuh (Tanpa Geprek)',
    category: 'Signature Bakar Utuh',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      'Ayam krispi utuh tanpa digeprek dicelupkan ke bumbu krisbar.',
      'Bakar di grill pan -> Celup ke-2 kali ke bumbu krisbar -> Bakar kembali hingga mengkilap.',
      'Kerenyahan kulit luar terjaga 100% utuh tanpa retak remuk tulang + 2 slice timun.'
    ],
    equipment: ['Grill Pan Gas', 'Mangkok Celup Bumbu', 'Capitan Stainless Lebar'],
    keySpec: 'Glaze karamel berkilau 2x celup, ayam utuh montok krispi tanpa retakan',
    dineInStandard: 'Piring melamin ceper saji bakar bersama lalapan 2 slice timun.',
    takeAwayStandard: 'Paper box higienis beralas kertas roti anti-lengket.'
  },
  {
    id: 'b2-mentai-krispi',
    name: 'Mentai Krispi Utuh (Tanpa Geprek)',
    category: 'Saus Spesial Utuh',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      'Ayam krispi utuh ditaruh di atas cobek (tanpa digeprek).',
      'Beri Saus Mentai standar 2 solet penuh menutupi lekuk tepung krispi.',
      'Bakar saus menggunakan Gas Torch secara merata hingga kecokelatan aromatik.',
      'Pindahkan menggunakan 2 SOLET ke piring atau box + 2 slice timun.'
    ],
    equipment: ['Gas Blow Torch', '2 Solet Silikon', 'Piring Saji / Box'],
    keySpec: 'Lapisan mentai karamel smokey melekat di atas ayam utuh, dipindahkan aman pakai 2 solet',
    dineInStandard: 'Piring saji oval putih bersih dengan garnish 2 slice timun.',
    takeAwayStandard: 'Box cembung bersegel QC rapi anti-rusak saus.'
  },
  {
    id: 'b2-ayoli-krispi',
    name: 'Ayoli Krispi Utuh (Tanpa Geprek)',
    category: 'Saus Spesial Utuh',
    estimatedTime: '3 Menit',
    targetMinutes: 3,
    criticalPoints: [
      'Ayam krispi utuh ditata di piring atau box take-away.',
      'Siapkan 1 cup Saus Ayoli yang sudah diaduk rata dengan GARPU.',
      'Tuangkan saus ayoli di atas ayam krispi utuh + 2 slice timun segar.'
    ],
    equipment: ['Garpu Pengaduk Stainless', 'Cup Saus Ayoli', 'Piring / Box'],
    keySpec: 'Visual modern elegan, saus ayoli lembut tercampur garpu sempurna tanpa pisah minyak',
    dineInStandard: 'Piring bistro modern putih dengan lalapan timun segar.',
    takeAwayStandard: 'Bento box take-away bersegel stiker QC.'
  }
];

// ----------------------------------------------------------------------------
// BATCH 3: MENU EXTRA & MINUMAN RESMI HARA SESUAI HC-SOP-11-PKP (DAY 2)
// ----------------------------------------------------------------------------
export const BATCH_3_PRODUCTS: ProductSOPItem[] = [
  {
    id: 'b3-kulit-krispi',
    name: 'Kulit Krispi HARA (50g Mentah -> 60g Matang)',
    category: 'Menu Extra Primadona',
    estimatedTime: '15 Menit',
    targetMinutes: 15,
    criticalPoints: [
      'Timbang berat mentah kulit ayam tepat 50 gr per porsi.',
      'Lakukan penepungan 2x (tepung basah -> celup -> tepung kering berbutir halus).',
      'Goreng di deep fryer pada suhu 150°C selama tepat 12 menit.',
      'Timbang berat matang akhir: Standar hasil matang krispi adalah 60 gr per porsi.',
      'Tiriskan minyak hingga kering sebelum disajikan.'
    ],
    equipment: ['Deep Fryer 150°C', 'Keranjang Halus Kulit', 'Timbangan Digital Presisi (50g -> 60g)', 'Kertas Tiris'],
    keySpec: 'Super renyah meletup, warna kuning keemasan, berat matang presisi 60 gr',
    dineInStandard: 'Mangkuk melamin merah HARA beralas kertas minyak bercap resmi.',
    takeAwayStandard: 'Kantong kraft tahan minyak berventilasi udara agar tidak melempem.'
  },
  {
    id: 'b3-tempe-tahu',
    name: 'Tempe Krispi & Tahu Krispi (1 Porsi = 4 Pcs)',
    category: 'Menu Extra Nabati',
    estimatedTime: '12 Menit',
    targetMinutes: 12,
    criticalPoints: [
      '1 porsi saji berisi 4 pcs tempe atau tahu potong rapi.',
      'Rendam di Air Marinasi Extra (2 siung bawang putih uleg + 75 gr mix garam + 1 Liter air) selama 10 menit.',
      'Lakukan penepungan 2x secara merata.',
      'Goreng di deep fryer pada suhu 150°C selama tepat 5 menit.',
      'Tiriskan dengan posisi miring agar minyak tuntas.'
    ],
    equipment: ['Deep Fryer 150°C', 'Baskom Air Marinasi Extra', 'Serok Stainless'],
    keySpec: 'Kulit luar garing kriuk, bagian dalam tahu/tempe gurih berbumbu bawang meresap',
    dineInStandard: 'Piring melamin merah disusun rapi 4 pcs mendampingi sambal.',
    takeAwayStandard: 'Paper bag tahan minyak berlabel stiker Tahu/Tempe Krispi.'
  },
  {
    id: 'b3-jamur-enoki',
    name: 'Jamur Enoki Krispi (1 Bungkus = 2 Porsi @ 50g)',
    category: 'Menu Extra Sayuran',
    estimatedTime: '6 Menit',
    targetMinutes: 6,
    criticalPoints: [
      '1 bungkus jamur enoki (100 gr) dibagi menjadi 2 porsi saji (@ 50 gr).',
      'Pipihkan jamur hingga mekar seperti kipas lebar.',
      'Lakukan penepungan 2x tipis merata ke sela-sela batang jamur.',
      'Goreng di minyak suhu 150°C selama tepat 3 menit hingga kaku renyah.',
      'Tiriskan, lalu taburi 2.5 gr bumbu kentang gurih.'
    ],
    equipment: ['Deep Fryer 150°C', 'Sendok Tabur Bumbu 2.5 gr', 'Kertas Tiris'],
    keySpec: 'Bentuk mekar kipas cantik, garing renyah tidak berminyak, gurih bumbu kentang 2.5g',
    dineInStandard: 'Piring ceper melamin putih beralas kertas roti HARA.',
    takeAwayStandard: 'Standing pouch kraft berventilasi udara.'
  },
  {
    id: 'b3-kol-goreng',
    name: 'Kol Goreng (1 Porsi = 200 gr)',
    category: 'Menu Extra Sayuran',
    estimatedTime: '3 Menit',
    targetMinutes: 3,
    criticalPoints: [
      'Timbang potongan kol segar bersih tepat 200 gr per porsi.',
      'Buang bagian tangkai keras di tengah kol.',
      'Goreng di deep fryer pada suhu 150°C selama tepat 1.5 menit (90 detik).',
      'Angkat dan tiriskan cepat agar warna tetap karamel keemasan dan tidak hangus kehitaman.'
    ],
    equipment: ['Deep Fryer 150°C', 'Serok Kawat Halus', 'Timbangan Sayur 200g'],
    keySpec: 'Karamel manis alami menggoda, renyah layu tidak berminyak basah, tidak gosong',
    dineInStandard: 'Mangkuk melamin kecil atau mendampingi ayam geprek di piring.',
    takeAwayStandard: 'Paper box kecil beralas kertas anti-minyak.'
  },
  {
    id: 'b3-kentang-goreng',
    name: 'Kentang Goreng (1 Pack 2kg = 20 Porsi @ 100g)',
    category: 'Menu Extra Karbohidrat',
    estimatedTime: '8 Menit',
    targetMinutes: 8,
    criticalPoints: [
      '1 kemasan pack kentang beku (2 kg) distandarkan untuk 20 porsi saji (@ 100 gr).',
      'Goreng di 500 ml minyak panas selama 5 menit hingga renyah keemasan.',
      'Tiriskan minyak hingga tuntas.',
      'Taburi 2.5 gr bumbu kentang gurih resmi HARA di dalam wadah kocok.'
    ],
    equipment: ['Penggorengan Kentang', 'Wadah Kocok Bumbu', 'Sendok Takar 2.5 gr Bumbu Kentang'],
    keySpec: 'Kentang lurus garing di luar dan lembut di dalam, taburan bumbu 2.5g merata',
    dineInStandard: 'Keranjang kawat saji beralas kertas roti atau piring ceper.',
    takeAwayStandard: 'Paper bag khusus kentang goreng bertutup lipat.'
  },
  {
    id: 'b3-es-jeruk',
    name: 'Es Jeruk Segar (Resep 40 Cup)',
    category: 'Minuman Bar Resmi',
    estimatedTime: '15 Menit',
    targetMinutes: 15,
    criticalPoints: [
      'Takaran bahan resmi: Knorr Lime Powder 8 sdm (120 gr) + 1 kg gula pasir.',
      'Larutkan dengan 4 Liter air mendidih, aduk rata hingga seluruh serbuk larut sempurna.',
      'Tambahkan 4 Liter air matang galon dingin, aduk memutar.',
      'Penyajian per cup: 200 ml larutan es jeruk di cup 14 oz + es batu kristal higienis.'
    ],
    equipment: ['Gelas Ukur Kalibrasi', 'Sendok Takar 8 sdm', 'Jumbo Dispenser Jeruk', 'Mesin Cup Sealer 160°C'],
    keySpec: 'Asam manis jeruk segar seimbang, aroma citrus alami harum, warna oranye jernih',
    dineInStandard: 'Gelas akrilik transparan 14 oz dengan es kristal dingin.',
    takeAwayStandard: 'Cup 14 oz di-press Cup Sealer 160°C rapat anti-bocor.'
  },
  {
    id: 'b3-es-lemon-tea',
    name: 'Es Lemon Tea (Resep 40 Cup)',
    category: 'Minuman Bar Resmi',
    estimatedTime: '25 Menit',
    targetMinutes: 25,
    criticalPoints: [
      'Komposisi resmi: Teh HARA 40 gr + 1 kg gula pasir + Knorr Lime Powder 4 sdm (60 gr).',
      'Seduh dengan 4 Liter air mendidih, tutup rapat dan diamkan selama 20 menit.',
      'Saring menggunakan saringan halus ke wadah Jumbo dispenser.',
      'Tambahkan 4 Liter air matang dingin.',
      'Penyajian: 200 ml di cup 14 oz + es batu kristal higienis.'
    ],
    equipment: ['Panci Seduh Teh', 'Saringan Kain Halus', 'Jumbo Dispenser Lemon Tea', 'Cup Sealer 160°C'],
    keySpec: 'Perpaduan wangi teh melati dan segarnya lemon alami, manis seimbang',
    dineInStandard: 'Gelas akrilik 14 oz dengan es kristal menyegarkan.',
    takeAwayStandard: 'Cup 14 oz di-press Cup Sealer suhu 160°C rapat anti-bocor.'
  },
  {
    id: 'b3-orange',
    name: 'Orange Segar (Resep 10 Cup)',
    category: 'Minuman Bar Resmi',
    estimatedTime: '10 Menit',
    targetMinutes: 10,
    criticalPoints: [
      '1 resep serbuk bubuk Orange resmi HARA.',
      'Larutkan dengan 1 Liter air mendidih, aduk hingga serbuk larut bebas gumpalan.',
      'Tambahkan 1 Liter air galon matang, aduk merata.',
      'Penyajian: 200 ml di cup 14 oz + es batu kristal.'
    ],
    equipment: ['Teko Ukur 2L', 'Pengaduk Spiral', 'Cup Sealer 160°C'],
    keySpec: 'Rasa manis buah jeruk segar cerah, warna oranye pekat memikat',
    dineInStandard: 'Gelas akrilik 14 oz dengan es batu.',
    takeAwayStandard: 'Cup 14 oz di-press Cup Sealer rapat.'
  }
];

// ============================================================================
// KOMPONEN UTAMA SIMULASI PRAKTIK BATCH 1, 2 & 3 (RnD HARA CHICKEN)
// ============================================================================

export const SimulasiPraktikRnDView: React.FC<{ selectedOutletCode?: string }> = ({
  selectedOutletCode = 'ALL'
}) => {
  // Navigation Sub-Section: 'koreografi' | 'methods' | 'rundown' | 'generator' | 'scoring'
  const [subSection, setSubSection] = useState<'koreografi' | 'methods' | 'rundown' | 'generator' | 'scoring'>('koreografi');
  const [selectedDay, setSelectedDay] = useState<'day1' | 'day2'>('day1');

  // Timer Countdown
  const [timerSeconds, setTimerSeconds] = useState<number>(3600);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [activeRundownIndex, setActiveRundownIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Rundown Schedules
  const RUNDOWN_DAY_1 = [
    {
      id: 'd1-s1',
      time: '08:00 - 10:00',
      duration: '120 Menit',
      title: 'Materi 4 SOP Inti (Briefing Teori, K3 & HACCP)',
      trainer: 'Lead Field Trainer & SPV Outlet',
      desc: 'Penyampaian komprehensif 4 fondasi utama: SOP Deep Fryer (175°C kompor / 160°C minyak selama 12 mnt), SOP Nasi Miyako (maks 6:8, tombol kiri baru kanan COOK, tanak 15 mnt), SOP Sambal Bawang (goreng 3-5 mnt, ulek kasar cobek + siram minyak panas), dan 4 Lap Resmi HARA (Kanebo, Orange Meja, Basah Kotak, Kering Kotak).',
      deliverables: ['Paham parameter kritis 4 SOP', 'Verifikasi APD celemek & hairnet', 'Pre-test checklist kesiapan'],
      badge: 'Teori & Fondasi'
    },
    {
      id: 'd1-s2',
      time: '10:00 - 10:30',
      duration: '30 Menit',
      title: 'Persiapan Stasiun Kerja & Kalibrasi Alat Dapur',
      trainer: 'Trainer & Senior Kitchen Specialist',
      desc: 'Pengecekan kebersihan station, kalibrasi 3 jenis timbangan digital (5kg, 40kg, 150kg), kelengkapan 5 sendok takar (15ml, 7.5ml, 5ml, 2.5ml, 1ml), kestabilan temperatur chiller (1-4°C) dan persiapan minyak goreng.',
      deliverables: ['Form Kalibrasi Alat Terisi', 'Stasiun Bersih Siap Pakai', 'Bahan Baku Siap di Meja Prep'],
      badge: 'Kalibrasi & Persiapan'
    },
    {
      id: 'd1-s3',
      time: '10:30 - 11:30',
      duration: '60 Menit',
      title: 'Eksekusi Paralel Batch 1 (10 Produk Dasar Dapur)',
      trainer: 'Seluruh Trainer & Peserta Training (11-17 Kru)',
      desc: '10 stasiun berjalan serempak secara mandiri: Nasi Miyako, Es Teh 40 Cup, Sup Sayur Extra 6L, Goreng Ayam Reguler 160°C, Ayam Utuh AU 150°C, Terong Krispi 150°C, Sambal Bawang 30g, Spinach Bayam 90 dtk, Indomie 2 mnt, dan Scramble Egg.',
      deliverables: ['10 Produk Fondasi Selesai Tepat Waktu', 'Penerapan K3 Dapur', 'Akurasi Gramatur Bahan'],
      badge: 'Eksekusi Batch 1'
    },
    {
      id: 'd1-s4',
      time: '11:30 - 12:00',
      duration: '30 Menit',
      title: 'Gallery Walk & Quality Control (QC) Meja Pass-Thru',
      trainer: 'Lead Trainer & QC Inspector',
      desc: 'Seluruh kru berbaris membawa hasil masakan ke Meja Pass-Thru untuk diinspeksi serentak: uji suhu core ayam (>= 74°C), audit rasa sambal & sup, kerenyahan bayam & terong krispi, serta evaluasi gramatur timbangan.',
      deliverables: ['Uji Suhu Core Thermometer Jarum', 'Sensory Evaluation (Aroma & Rasa)', 'Feedback Langsung Per Peserta'],
      badge: 'QC & Gallery Walk'
    },
    {
      id: 'd1-s5',
      time: '12:00 - 13:20',
      duration: '80 Menit',
      title: 'ISHOMA & Sanitasi Stasiun Sesi 1',
      trainer: 'Kepala Outlet & Koordinator Training',
      desc: 'Istirahat makan siang, ibadah bersama, serta pembersihan mendalam station dapur menggunakan 4 Lap Resmi HARA (Kanebo untuk piring, Lap Orange untuk meja, Lap Basah untuk area kotor, Lap Kering untuk tangan).',
      deliverables: ['Dapur Higienis Steril', 'Peralatan Masak Dicuci Bersih', 'Kesiapan Sesi Siang'],
      badge: 'Istirahat & Sanitasi'
    },
    {
      id: 'd1-s6',
      time: '13:20 - 14:20',
      duration: '60 Menit',
      title: 'Eksekusi Paralel Batch 2 (11 Menu Perakitan Resmi)',
      trainer: 'Lead Trainer & RnD Specialist',
      desc: 'Perakitan serempak 11 Menu: Nasgor Geprek ORI (SOP-NasGorTelur-02 Nasi 170g + ECO 20g + Telur Dadar + 2 slice timun), Geprek ORI, Geprek Keju Parut (parut langsung di piring/box), Geprek Mentai (torch & angkat 2 solet), Geprek Moza (torch di cobek), Geprek Ayoli (aduk garpu), Geprek Krisbar (celup 2x bakar 2x), Hot Nashville (rendam 1 mnt + alas plastik Nashville + boncabe 1g), Krisbar Krispi, Mentai Krispi, dan Ayoli Krispi.',
      deliverables: ['11 Menu Signature Siap Saji', 'Teknik Assembly Presisi Cepat', 'Penguasaan Torching & Griddle'],
      badge: 'Eksekusi Batch 2'
    },
    {
      id: 'd1-s7',
      time: '14:20 - 15:00',
      duration: '40 Menit',
      title: 'Audit Platting Dine-In vs Take-Away & Scoring Akhir Hari 1',
      trainer: 'Lead Trainer, Ops Manager & Kepala Outlet',
      desc: 'Verifikasi standar penyajian piring keramik/melamin (Dine-In) vs standar bento box/paper bowl/kertas cokelat (Take-Away). Pengecekan stiker segel, kerapihan 2 slice timun, dan pengisian form penilaian 4 indikator.',
      deliverables: ['Lembar QC Platting Terisi', 'Perhitungan Skor Praktik 4 Indikator', 'Rekomendasi Lulus / Remedial'],
      badge: 'Audit & Final Scoring'
    }
  ];

  const RUNDOWN_DAY_2 = [
    {
      id: 'd2-s1',
      time: '08:00 - 09:00',
      duration: '60 Menit',
      title: 'Refreshment Hari 1 & Bedah Kesalahan QC Kemarin',
      trainer: 'Lead Field Trainer & SPV Outlet',
      desc: 'Evaluasi kesalahan umum Hari 1: penimbangan nasi < 170g, bumbu ECO nasgor tidak ditimbang 20g, keju diparut di cobek (pelanggaran SOP), atau memindahkan mentai tanpa 2 solet.',
      deliverables: ['Evaluasi catatan remedial', 'Refleksi SOP titik kritis', 'Kesiapan fisik dan mental tim'],
      badge: 'Review & Refreshment'
    },
    {
      id: 'd2-s2',
      time: '09:00 - 09:30',
      duration: '30 Menit',
      title: 'Briefing Teori SOP Menu Extra & Standar Bar HARA',
      trainer: 'RnD Specialist & Beverage Trainer',
      desc: 'Penyampaian SOP Kulit Krispi (50g mentah -> 60g matang, deep fryer 150°C 12 mnt), Tempe/Tahu Krispi (Air Marinasi Extra 10 mnt, 150°C 5 mnt), Enoki Krispi (mekar kipas 150°C 3 mnt), Es Jeruk (Knorr lime 8 sdm), dan Es Lemon Tea (Knorr lime 4 sdm).',
      deliverables: ['Penguasaan SOP Menu Extra', 'Kalibrasi Gula & Es Batu Bar', 'Setting Mesin Cup Sealer 160°C'],
      badge: 'Teori Menu Extra & Bar'
    },
    {
      id: 'd2-s3',
      time: '09:30 - 10:45',
      duration: '75 Menit',
      title: 'Eksekusi Paralel Batch 3 (Menu Extra & Minuman Bar Resmi)',
      trainer: 'Trainer Stasiun Bar & Fryer',
      desc: 'Praktik serentak: Kulit Krispi 150°C (12 mnt), Tempe/Tahu Krispi, Enoki Krispi, Kol Goreng 1.5 mnt, Kentang Goreng 5 mnt, Es Jeruk 40 Cup, Es Lemon Tea 40 Cup, dan Orange 10 Cup.',
      deliverables: ['Kulit Krispi 60g Garing Sempurna', 'Minuman Terkalibrasi Manis & Es', 'Cup Sealer Rapat Tanpa Bocor'],
      badge: 'Eksekusi Batch 3'
    },
    {
      id: 'd2-s4',
      time: '10:45 - 11:30',
      duration: '45 Menit',
      title: 'Gallery Walk Day 2 & Sensory Test Minuman Bar',
      trainer: 'Lead Trainer & Kru Peserta',
      desc: 'Uji kerenyahan kulit crispy di meja pass-thru (suara renyah & tidak berminyak), uji rasa asam manis minuman (sensory test), dan audit kerapihan sealer cup.',
      deliverables: ['Audit Kerenyahan Kulit Krispi', 'Sensory Test Minuman Bar', 'Feedback Instan Trainer'],
      badge: 'QC Minuman & Kulit'
    },
    {
      id: 'd2-s5',
      time: '11:30 - 12:45',
      duration: '75 Menit',
      title: 'ISHOMA & Sanitasi Meja Bar / Dapur',
      trainer: 'Koordinator Training',
      desc: 'Istirahat makan siang, salat bersama, pembersihan shaker dan dispenser minuman dengan sanitasi air panas food grade.',
      deliverables: ['Area Bar & Dapur Bersih', 'Peralatan Siap Sesi Siang', 'Kebugaran Kru Terjaga'],
      badge: 'Istirahat & Sanitasi'
    },
    {
      id: 'd2-s6',
      time: '12:45 - 14:00',
      duration: '75 Menit',
      title: 'Simulasi Rush Hour 5 Tiket Pesanan Cepat (< 10 Menit)',
      trainer: 'Ops Manager & SPV Outlet',
      desc: 'Simulasi ritme nyata dapur saat antrean puncak: 5 tiket pesanan online & offline masuk serentak. Uji koordinasi kasir, fryer, geprek, packaging dan runner dengan target ticket time < 3 menit per paket.',
      deliverables: ['5 Tiket Selesai < 10 Menit', 'Ticket Time Rata-rata < 3 Menit', 'Kerjasama Tim Solid'],
      badge: 'Simulasi Rush Hour'
    },
    {
      id: 'd2-s7',
      time: '14:00 - 15:30',
      duration: '90 Menit',
      title: 'Closing Sanitasi Dapur, Rekapitulasi Skor & Kelulusan OJT',
      trainer: 'Lead Trainer & Manajer Operasional',
      desc: 'Penerapan SOP Closing (pemisahan sisa bahan matang dilarang jual besok vs chiller, lap 4 warna), penghitungan nilai akhir 4 indikator, serta penyerahan sertifikat kelulusan praktik OJT HARA.',
      deliverables: ['Dapur Closing Sempurna', 'Rekapitulasi Nilai Seluruh Kru', 'Sertifikat Kompetensi OJT Terbit'],
      badge: 'Closing & Sertifikasi'
    }
  ];

  const currentRundown = selectedDay === 'day1' ? RUNDOWN_DAY_1 : RUNDOWN_DAY_2;

  // Generator Stasiun
  const [crewCount, setCrewCount] = useState<number>(14);
  const [activeBatchTab, setActiveBatchTab] = useState<'batch1' | 'batch2' | 'batch3'>('batch1');
  const [traineeNames, setTraineeNames] = useState<string[]>([
    'Budi Santoso', 'Siti Rahmawati', 'Rian Hidayat', 'Dewi Lestari',
    'Ahmad Fauzi', 'Nurul Aini', 'Eko Prasetyo', 'Mega Putri',
    'Bayu Pratama', 'Intan Permata', 'Doni Kusuma', 'Rina Anggraini',
    'Fajar Sidiq', 'Tri Wahyuni', 'Agus Setiawan', 'Lia Marlina', 'Hendro Wijaya'
  ]);

  const activeTraineeList = useMemo(() => traineeNames.slice(0, crewCount), [traineeNames, crewCount]);
  const [shuffleSeed, setShuffleSeed] = useState<number>(1);

  const getStationAssignments = (products: ProductSOPItem[], seedMultiplier: number) => {
    const result: { product: ProductSOPItem; trainees: string[] }[] = products.map((p) => ({
      product: p,
      trainees: []
    }));

    activeTraineeList.forEach((trainee, idx) => {
      const stationIndex = (idx + shuffleSeed * seedMultiplier) % products.length;
      result[stationIndex].trainees.push(trainee);
    });

    return result;
  };

  const assignedStationsBatch1 = useMemo(() => getStationAssignments(BATCH_1_PRODUCTS, 1), [activeTraineeList, shuffleSeed]);
  const assignedStationsBatch2 = useMemo(() => getStationAssignments(BATCH_2_PRODUCTS, 3), [activeTraineeList, shuffleSeed]);
  const assignedStationsBatch3 = useMemo(() => getStationAssignments(BATCH_3_PRODUCTS, 5), [activeTraineeList, shuffleSeed]);

  const currentAssignedStations = useMemo(() => {
    switch (activeBatchTab) {
      case 'batch1': return assignedStationsBatch1;
      case 'batch2': return assignedStationsBatch2;
      case 'batch3': return assignedStationsBatch3;
      default: return assignedStationsBatch1;
    }
  }, [activeBatchTab, assignedStationsBatch1, assignedStationsBatch2, assignedStationsBatch3]);

  // Form Penilaian 4 Indikator
  const [selectedTraineeForScoring, setSelectedTraineeForScoring] = useState<string>(activeTraineeList[0] || 'Budi Santoso');
  const [scoringBatch, setScoringBatch] = useState<'Batch 1' | 'Batch 2' | 'Batch 3'>('Batch 1');
  const [selectedProductScored, setSelectedProductScored] = useState<string>(BATCH_1_PRODUCTS[0].name);

  useEffect(() => {
    if (scoringBatch === 'Batch 1') setSelectedProductScored(BATCH_1_PRODUCTS[0].name);
    else if (scoringBatch === 'Batch 2') setSelectedProductScored(BATCH_2_PRODUCTS[0].name);
    else if (scoringBatch === 'Batch 3') setSelectedProductScored(BATCH_3_PRODUCTS[0].name);
  }, [scoringBatch]);

  const [scoreGramatur, setScoreGramatur] = useState<number>(85); // 30%
  const [scoreSuhuDurasi, setScoreSuhuDurasi] = useState<number>(85); // 30%
  const [scorePlattingRasa, setScorePlattingRasa] = useState<number>(90); // 25%
  const [scoreHygieneWalk, setScoreHygieneWalk] = useState<number>(80); // 15%
  const [scoringNotes, setScoringNotes] = useState<string>('Eksekusi sesuai SOP, gramatur akurat, 2 slice timun rapi.');

  const finalCalculatedScore = useMemo(() => {
    const total =
      scoreGramatur * 0.30 +
      scoreSuhuDurasi * 0.30 +
      scorePlattingRasa * 0.25 +
      scoreHygieneWalk * 0.15;
    return Math.round(total * 10) / 10;
  }, [scoreGramatur, scoreSuhuDurasi, scorePlattingRasa, scoreHygieneWalk]);

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'Grade A', label: 'Mastery (Sangat Kompeten)', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
    if (score >= 80) return { grade: 'Grade B', label: 'Kompeten Mandiri (Lulus OJT)', color: 'bg-sky-50 text-sky-800 border-sky-300' };
    if (score >= 75) return { grade: 'Grade C', label: 'Lulus Bersyarat (Pendampingan)', color: 'bg-amber-50 text-amber-800 border-amber-300' };
    return { grade: 'Remedial', label: 'Belum Kompeten (Wajib Ulang)', color: 'bg-rose-50 text-rose-800 border-rose-300' };
  };

  const currentGradeInfo = getScoreGrade(finalCalculatedScore);

  const [killSwitches, setKillSwitches] = useState<{
    darah: boolean;
    blender: boolean;
    tanpaTimbang: boolean;
    kontaminasiLantai: boolean;
  }>({
    darah: false,
    blender: false,
    tanpaTimbang: false,
    kontaminasiLantai: false,
  });

  const isKillSwitchTriggered = useMemo(() => {
    return (
      killSwitches.darah ||
      killSwitches.blender ||
      killSwitches.tanpaTimbang ||
      killSwitches.kontaminasiLantai
    );
  }, [killSwitches]);

  const [evaluationHistory, setEvaluationHistory] = useState<any[]>(() => {
    try {
      const saved = db.getTable<any>('penilaian_onboarding_rnd');
      return Array.isArray(saved) && saved.length > 0 ? saved : [];
    } catch {
      return [];
    }
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSaveEvaluation = () => {
    const effectiveStatus = isKillSwitchTriggered
      ? 'WAJIB REMEDIAL MASAK DI R&D'
      : finalCalculatedScore >= 75
      ? 'LULUS SIAP OJT OUTLET'
      : 'WAJIB REMEDIAL MASAK DI R&D';

    const calculatedGrade = isKillSwitchTriggered ? 'Gugur (Kill-Switch)' : currentGradeInfo.grade;

    const newRecord = {
      traineeName: selectedTraineeForScoring,
      batch: scoringBatch,
      productName: selectedProductScored,
      gramatur: scoreGramatur,
      suhuDurasi: scoreSuhuDurasi,
      plattingRasa: scorePlattingRasa,
      hygieneWalk: scoreHygieneWalk,
      finalScore: isKillSwitchTriggered ? Math.min(finalCalculatedScore, 50) : finalCalculatedScore,
      grade: calculatedGrade,
      status: effectiveStatus,
      isKillSwitch: isKillSwitchTriggered,
      killSwitches,
      notes: scoringNotes,
      tanggal: new Date().toISOString(),
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    // Direct insert to Cloud Firestore via db.insertRow (Zero LocalStorage trap)
    const saved = db.insertRow('penilaian_onboarding_rnd', newRecord);
    setEvaluationHistory((prev) => [saved, ...prev]);

    setSaveSuccessMsg(`Penilaian onboarding R&D untuk "${selectedTraineeForScoring}" berhasil disimpan ke Cloud Database! Status: ${effectiveStatus}`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Unduh Master Spreadsheet CSV
  const handleExportSpreadsheet = () => {
    const rows: string[][] = [];

    rows.push(['HARA CHICKEN - MASTER PLANNING ONBOARDING & SIMULASI PRAKTIK DAPUR RESMI']);
    rows.push(['Perusahaan:', 'CV. ULTIMA RASA INDONESIA', 'Outlet:', selectedOutletCode, 'Tanggal:', new Date().toLocaleDateString('id-ID')]);
    rows.push([]);

    rows.push(['=== JADWAL RUNDOWN PRAKTIK HARI 1 (FONDASI & MENU GEPREK) ===']);
    rows.push(['Waktu', 'Durasi', 'Sesi', 'Penanggung Jawab', 'Deliverables', 'Kategori']);
    RUNDOWN_DAY_1.forEach((item) => {
      rows.push([item.time, item.duration, item.title, item.trainer, item.deliverables.join('; '), item.badge]);
    });
    rows.push([]);

    rows.push(['=== JADWAL RUNDOWN PRAKTIK HARI 2 (MENU EXTRA, MINUMAN BAR & CLOSING) ===']);
    rows.push(['Waktu', 'Durasi', 'Sesi', 'Penanggung Jawab', 'Deliverables', 'Kategori']);
    RUNDOWN_DAY_2.forEach((item) => {
      rows.push([item.time, item.duration, item.title, item.trainer, item.deliverables.join('; '), item.badge]);
    });
    rows.push([]);

    rows.push(['=== MATRIKS STASIUN KERJA, WAKTU & SPESIFIKASI RESMI HARA ===']);
    rows.push(['Batch', 'Nomor Stasiun', 'Nama Produk', 'Kategori', 'Estimasi Waktu', 'Kru Bertugas', 'Titik Kritis SOP Resmi']);

    assignedStationsBatch1.forEach((st, idx) => {
      rows.push(['Batch 1 (10 Dasar)', `Stasiun 1.${idx + 1}`, st.product.name, st.product.category, st.product.estimatedTime, st.trainees.join(', ') || 'Belum Ditugaskan', st.product.criticalPoints.join(' | ')]);
    });

    assignedStationsBatch2.forEach((st, idx) => {
      rows.push(['Batch 2 (11 Perakitan)', `Stasiun 2.${idx + 1}`, st.product.name, st.product.category, st.product.estimatedTime, st.trainees.join(', ') || 'Belum Ditugaskan', st.product.criticalPoints.join(' | ')]);
    });

    assignedStationsBatch3.forEach((st, idx) => {
      rows.push(['Batch 3 (Menu Extra & Bar)', `Stasiun 3.${idx + 1}`, st.product.name, st.product.category, st.product.estimatedTime, st.trainees.join(', ') || 'Belum Ditugaskan', st.product.criticalPoints.join(' | ')]);
    });
    rows.push([]);

    rows.push(['=== KOREOGRAFI KOMPOR & PERALATAN 1 OUTLET HARA ===']);
    rows.push(['Peralatan', 'Alokasi Penggunaan & Urutan Suhu', 'Standar Waktu & Catatan SOP']);
    rows.push(['1 Deep Fryer', '150°C Terong & Tahu/Tempe (5 mnt) -> 150°C Ayam Utuh AU (12 mnt) & Kulit Krispi (12 mnt) -> Naikkan ke 175°C kompor / 160°C minyak untuk Ayam Potong Reguler (12 mnt)', 'Goyang keranjang tiap 3 mnt, kuras tiap 16-20 kg ayam']);
    rows.push(['2 Tungku Kompor Gas', 'Tungku 1: Rebus Air Es Teh 4L mendidih -> Sup Sayur HARA Extra 6L (5L rebus + 1L tumis). Tungku 2: Minyak 200ml api kecil cabai sambal bawang (3-5 mnt) -> Minyak 500ml api sedang Spinach bayam (90 dtk) -> Telur Dadar nasgor / Scramble Egg -> Rebus Indomie (2 mnt)', 'Dilarang menggunakan wajan yang sama tanpa sanitasi']);
    rows.push(['1 Rice Cooker Gas', 'Beras Miyako (maks 6 cup beras : 8 cup air), tekan tombol kiri api kecil baru tombol kanan COOK', 'Wajib tanak 15 menit pasca jegleg sebelum pindah Magicom']);
    rows.push(['2 Cobek Batu Tradisional', 'Cobek 1: Khusus ulek sambal bawang & daun jeruk. Cobek 2: Khusus geprek ayam & torch mentai/moza', 'Dilarang ulek bumbu di cobek ayam']);
    rows.push([]);

    rows.push(['=== FORMULA PENILAIAN 4 INDIKATOR (PASSING GRADE >= 75.0) ===']);
    rows.push(['Indikator', 'Bobot', 'Standar Baku']);
    rows.push(['1. Akurasi Gramatur Bahan Baku', '30%', 'Toleransi +/- 5g. Nasi 170g, Sambal 30g, Bumbu ECO 20g, Kulit 50g mentah -> 60g matang']);
    rows.push(['2. Ketepatan Suhu & Durasi Waktu', '30%', 'Fryer 175°C / 160°C (12 mnt), Suhu Core >= 74°C, Tanak Nasi 15 mnt, Bayam 90 dtk']);
    rows.push(['3. Standar Platting, Packing & Rasa', '25%', '2 slice timun wajib, box besar beralas kertas nasi utuh/seperempat, mentai diangkat 2 solet']);
    rows.push(['4. Hygiene & Presentasi Gallery Walk', '15%', 'APD celemek/hairnet, 4 lap warna HARA (Kanebo, Orange, Basah Kotak, Kering Kotak)']);

    const csvContent = '\uFEFF' + rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `HARA_Master_Onboarding_Day1_Day2_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER UTAMA */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#96171B] border border-[#FECACA]">
                SOP RESMI CV. ULTIMA RASA INDONESIA
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Standar Kuota: 11 - 17 Kru
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F4F1EC] text-[#181411]">
                Metode: Demo 15 Mnt + Praktik Serentak
              </span>
            </div>
            <h2 className="text-xl font-bold font-['Outfit'] text-[#181411] tracking-tight">
              Simulasi Praktik Batch 1, Batch 2 & Batch 3 (SOP Asli HARA)
            </h2>
            <p className="text-xs text-stone-500 font-['Plus_Jakarta_Sans'] mt-0.5 max-w-3xl">
              Panduan operasional baku dapur: 10 Produk Dasar, 11 Menu Perakitan, Menu Extra & Minuman Bar Resmi, Koreografi Kompor 1 Outlet, serta Penilaian Praktik 4-Indikator.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSpreadsheet}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-['Outfit'] bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-sm active:scale-95"
              title="Download Master Spreadsheet Excel/CSV"
            >
              <FileSpreadsheet size={15} />
              <span>Download Master Excel/CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold font-['Outfit'] bg-white border border-[#E6E1DA] text-[#181411] hover:bg-stone-50 transition-all shadow-sm"
              title="Cetak lembar kerja praktik"
            >
              <Printer size={15} />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Navigasi Sub-Modul */}
        <div className="mt-5 pt-4 border-t border-[#E6E1DA] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 bg-[#F4F1EC] p-1.5 rounded-xl border border-[#E6E1DA]">
            <button
              onClick={() => setSubSection('koreografi')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold font-['Outfit'] transition-all ${
                subSection === 'koreografi'
                  ? 'bg-[#96171B] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <CookingPot size={15} />
              1. Koreografi Kompor & Alat
            </button>
            <button
              onClick={() => setSubSection('methods')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold font-['Outfit'] transition-all ${
                subSection === 'methods'
                  ? 'bg-[#96171B] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Compass size={15} />
              2. 3 Pilihan Metode Onboarding
            </button>
            <button
              onClick={() => setSubSection('rundown')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold font-['Outfit'] transition-all ${
                subSection === 'rundown'
                  ? 'bg-[#96171B] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Clock size={15} />
              3. Rundown Timeline (Day 1 & 2)
            </button>
            <button
              onClick={() => setSubSection('generator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold font-['Outfit'] transition-all ${
                subSection === 'generator'
                  ? 'bg-[#96171B] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Shuffle size={15} />
              4. Generator Stasiun (11-17 Kru)
            </button>
            <button
              onClick={() => setSubSection('scoring')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold font-['Outfit'] transition-all ${
                subSection === 'scoring'
                  ? 'bg-[#96171B] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Award size={15} />
              5. Form Penilaian 4-Indikator
            </button>
          </div>

          {/* Toggle Day 1 vs Day 2 */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#E6E1DA]">
            <button
              onClick={() => setSelectedDay('day1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['Outfit'] transition-all ${
                selectedDay === 'day1'
                  ? 'bg-[#96171B] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Hari 1: Fondasi & Geprek
            </button>
            <button
              onClick={() => setSelectedDay('day2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['Outfit'] transition-all ${
                selectedDay === 'day2'
                  ? 'bg-[#96171B] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Hari 2: Menu Extra, Bar & Closing
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================
          TAB 1: KOREOGRAFI KOMPOR & PERALATAN 1 OUTLET HARA (SOLUSI BOTTLENECK)
          =================================================================== */}
      {subSection === 'koreografi' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#96171B] to-[#7A1215] text-white rounded-2xl p-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <CookingPot size={26} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-stone-900">
                    Standar Dapur Komersial HARA
                  </span>
                  <span className="text-xs text-rose-200 font-medium">
                    1 Deep Fryer + 2 Tungku Gas + 1 Rice Cooker + 2 Cobek Batu
                  </span>
                </div>
                <h3 className="text-xl font-bold font-['Outfit']">
                  Koreografi Menit Masuk Kompor 1 Outlet (Anti-Tabrakan Alur)
                </h3>
                <p className="text-xs text-rose-100/90 leading-relaxed max-w-3xl">
                  Dalam 1 gerai HARA, peralatan dapur terbatas. Agar 11–17 kru dapat memasak secara paralel tanpa tabrakan jadwal kompor dan minyak tetap bersih higienis, ikuti urutan suhu berjenjang dan alokasi tungku berikut.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ALOKASI 1: DEEP FRYER TUNGGAL (SUHU BERJENJANG) */}
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-[#96171B]" />
                  <h4 className="text-sm font-bold font-['Outfit'] text-[#181411]">
                    1 Deep Fryer Utama (Suhu Berjenjang 150°C → 160°C)
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Urutan Minyak Bersih
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-800">
                    <span>1. Menit 00:00 - 00:05 (Suhu 150°C)</span>
                    <span className="text-emerald-700 font-['JetBrains_Mono']">5 Menit</span>
                  </div>
                  <p className="text-stone-600 text-[11px]">
                    <strong>Terong Krispi (10 slice) & Tahu/Tempe (4 pcs):</strong> Minyak masih sangat jernih pada 150°C. Terong digoreng 5 menit bolak-balik; tahu/tempe digoreng 5 menit.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-800">
                    <span>2. Menit 00:05 - 00:17 (Suhu 150°C)</span>
                    <span className="text-emerald-700 font-['JetBrains_Mono']">12 Menit</span>
                  </div>
                  <p className="text-stone-600 text-[11px]">
                    <strong>Ayam Utuh (AU) & Kulit Krispi (50g → 60g):</strong> Tetap pada 150°C. AU digoreng 12 menit dibolak-balik tiap 3 menit; Kulit Krispi digoreng 12 menit hingga garing.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#96171B]">
                    <span>3. Menit 00:20 - 00:32 (Kompor 175°C / Minyak 160°C)</span>
                    <span className="text-[#96171B] font-['JetBrains_Mono']">12 Menit</span>
                  </div>
                  <p className="text-stone-700 text-[11px]">
                    <strong>Ayam Potong Reguler (2-3 kg/batch):</strong> Naikkan setelan kompor ke 175°C agar suhu minyak naik ke 160°C. Goyang keranjang tiap 3 menit, pastikan suhu core ≥ 74°C.
                  </p>
                </div>
              </div>
            </div>

            {/* ALOKASI 2: 2 TUNGKU KOMPOR GAS */}
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <CookingPot size={18} className="text-amber-700" />
                  <h4 className="text-sm font-bold font-['Outfit'] text-[#181411]">
                    2 Tungku Kompor Gas (Panci Rebus vs Wajan Penggorengan)
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                  Paralel 2 Stasiun
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1">
                  <div className="font-bold text-amber-900">
                    Tungku 1 (Panci Rebusan Air & Kuah):
                  </div>
                  <ul className="space-y-1 text-stone-600 text-[11px]">
                    <li>• <strong>Pagi (08:00):</strong> Rebus 4L air mendidih untuk Es Teh Manis / Es Lemon Tea.</li>
                    <li>• <strong>Lanjut (09:00):</strong> Rebus 5L air + 1L tumisan untuk Sup Sayur Hara Extra 6L (wortel 2 mnt, kol 2 mnt, matikan api baru loncang/seledri).</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-200 space-y-1">
                  <div className="font-bold text-sky-900">
                    Tungku 2 (Wajan Minyak Tumis & Goreng Kilat):
                  </div>
                  <ul className="space-y-1 text-stone-600 text-[11px]">
                    <li>• <strong>Sesi 1:</strong> Goreng 150g cabai & 35g baput sambal bawang di 200ml minyak api kecil (3-5 mnt).</li>
                    <li>• <strong>Sesi 2:</strong> Goreng 100g bayam (Spinach) di 500ml minyak api sedang selama tepat 90 detik.</li>
                    <li>• <strong>Sesi 3:</strong> Masak Telur Dadar nasgor (50ml minyak) / Scramble Egg (3 sdm minyak baru).</li>
                    <li>• <strong>Sesi 4:</strong> Rebus Indomie 500ml air selama 2 menit.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ALOKASI 3: RICE COOKER GAS */}
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <Scale size={16} className="text-[#96171B]" />
                <h4 className="text-sm font-bold font-['Outfit'] text-[#181411]">
                  1 Rice Cooker Gas Miyako (Prosedur Tombol Ganda)
                </h4>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Maksimal 6 cup beras : 8 cup air baku. Cuci minimal 3 kali. <strong>PENTING:</strong> Tekan tombol kiri (api kecil) lebih dulu, baru tekan COOK kanan. Setelah jegleg, <strong>WAJIB tanak 15 menit</strong> (maks 30 menit di rice cooker gas) sebelum dipindahkan ke Magicom.
              </p>
            </div>

            {/* ALOKASI 4: 2 COBEK BATU MEJA GEPREK */}
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <Utensils size={16} className="text-[#96171B]" />
                <h4 className="text-sm font-bold font-['Outfit'] text-[#181411]">
                  2 Cobek Batu Tradisional (Pemisahan Fungsi)
                </h4>
              </div>
              <ul className="text-xs text-stone-600 space-y-1.5 leading-relaxed">
                <li>• <strong>Cobek 1 (Khusus Bumbu):</strong> Ulek halus cabai & baput sambal bawang + 7g mix garam + siram 60ml minyak panas. DILARANG BLENDER.</li>
                <li>• <strong>Cobek 2 (Khusus Ayam Geprek):</strong> Geprek ayam 2-3 ketukan lembut, balur sambal, torching keju Moza di cobek, dan wadah oles saus Mentai (angkat selalu pakai 2 solet).</li>
              </ul>
            </div>
          </div>

          {/* STANDAR 4 LAP RESMI HARA */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold font-['Outfit'] text-[#181411] flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#96171B]" />
              Standar 4 Jenis Lap Resmi HARA (HC-SOP-11-PKP Hal. 16)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="font-bold text-stone-800">1. Lap Piring (Kanebo)</div>
                <p className="text-[11px] text-stone-500">Khusus mengelap piring makan melamin agar kinclong kering bebas noda air/minyak.</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="font-bold text-amber-900">2. Lap Meja (Orange)</div>
                <p className="text-[11px] text-stone-500">Lap kain kering + cairan pembersih kaca untuk mengelap kaca, meja kasir, dan kursi tamu.</p>
              </div>
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
                <div className="font-bold text-sky-900">3. Lap Basah (Kotak-kotak)</div>
                <p className="text-[11px] text-stone-500">Membersihkan meja geprek, meja dapur, meja minuman, dan alat bantu menguras minyak fryer.</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <div className="font-bold text-rose-900">4. Lap Tangan (Kotak Kering)</div>
                <p className="text-[11px] text-stone-500">Khusus mengeringkan tangan kru saat proses dusting (penepungan ayam krispi).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 2: 3 PILIHAN METODE ONBOARDING
          =================================================================== */}
      {subSection === 'methods' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-transparent border border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles size={20} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                    Pilihan Metode Direkomendasikan
                  </span>
                  <span className="text-xs font-bold text-stone-500">
                    Sesuai Kuota 11–17 Kru
                  </span>
                </div>
                <h3 className="text-lg font-bold font-['Outfit'] text-[#181411]">
                  Metode Demo Trainer 15 Menit lalu Praktik Serentak Mandiri
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-['Plus_Jakarta_Sans']">
                  Metode ini terbukti paling efisien dalam menangani kuota ideal 11–17 kru dalam waktu dapur yang terbatas. Seluruh kru melihat standar visual yang sama dari trainer di meja sentral, lalu segera mempraktikkannya serempak di stasiun masing-masing tanpa ada waktu luang (idle time) yang terbuang sia-sia.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* OPSI 1 */}
            <div className="bg-white border-2 border-[#96171B] rounded-2xl p-5 shadow-sm relative flex flex-col justify-between">
              <div className="absolute -top-3 left-5 px-3 py-0.5 bg-[#96171B] text-white rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-sm">
                Opsi 1 (Paling Efisien)
              </div>
              <div className="space-y-3 mt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold font-['Outfit'] text-[#181411]">
                    Demo Kilat 15 Mnt + Praktik Serentak
                  </h4>
                  <Zap size={18} className="text-[#96171B]" />
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Trainer mendemokan titik kritis produk (suhu, gramatur, teknik ulek/torch) selama 15 menit. Dilanjutkan 45 menit eksekusi paralel mandiri di 10–11 stasiun serempak.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-stone-100 text-xs">
                  <div className="font-bold text-stone-800">Alur Waktu Per Batch:</div>
                  <ul className="space-y-1 text-stone-600 text-[11px]">
                    <li>• 00:00 - 00:15: Demo Sentral Trainer di Meja Pass-Thru</li>
                    <li>• 00:15 - 00:55: Praktik Serentak Mandiri Kru</li>
                    <li>• 00:55 - 01:00: Plating & Sajikan ke Meja QC</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Kebutuhan Trainer: 2 Orang</span>
                <span className="font-bold text-[#96171B]">Efisiensi: 98%</span>
              </div>
            </div>

            {/* OPSI 2 */}
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                    Opsi 2 (Rotasi Giliran)
                  </span>
                  <RotateCcw size={16} className="text-stone-400" />
                </div>
                <h4 className="text-base font-bold font-['Outfit'] text-[#181411]">
                  Carousel Rotasi Stasiun Tiap 25 Menit
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Peserta dibagi menjadi kelompok kecil. Setiap kelompok berada di satu stasiun selama 25 menit lalu berotasi searah jarum jam saat bel timer berbunyi.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Kebutuhan Trainer: 3 Orang</span>
                <span className="font-bold text-stone-700">Efisiensi: 82%</span>
              </div>
            </div>

            {/* OPSI 3 */}
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                    Opsi 3 (Teamwork Rush)
                  </span>
                  <Users size={16} className="text-stone-400" />
                </div>
                <h4 className="text-base font-bold font-['Outfit'] text-[#181411]">
                  Buddy System (Prep - Cook - Pack)
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Kru dipasangkan 2 orang per stasiun kerja: Kru A sebagai Prep Master dan Kru B sebagai Cook & Platter. Berganti peran di Batch berikutnya.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Kebutuhan Trainer: 2 Orang</span>
                <span className="font-bold text-stone-700">Efisiensi: 88%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 3: JADWAL RUNDOWN PRAKTIK & TIMER COUNTDOWN
          =================================================================== */}
      {subSection === 'rundown' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#96171B] to-[#7A1215] text-white rounded-2xl p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-rose-200 text-xs font-medium">
                  <Flame size={16} />
                  <span>SOP RESMI HARA • {selectedDay === 'day1' ? 'HARI 1: FONDASI & GEPREK' : 'HARI 2: MENU EXTRA, BAR & CLOSING'}</span>
                </div>
                <h3 className="text-2xl font-bold font-['Outfit'] tracking-tight">
                  Sesi Aktif: {currentRundown[activeRundownIndex]?.title || 'Sesi Latihan'}
                </h3>
                <p className="text-xs text-rose-100/90 max-w-xl">
                  {currentRundown[activeRundownIndex]?.desc || 'Pilih sesi pada jadwal rundown di bawah.'}
                </p>
              </div>

              <div className="bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex items-center gap-4">
                <div>
                  <div className="text-[10px] text-rose-200 uppercase tracking-wider font-semibold">
                    Stopwatch Countdown
                  </div>
                  <div className="text-3xl font-bold font-['JetBrains_Mono'] tabular-nums tracking-wider text-white">
                    {formatTimer(timerSeconds)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 border-l border-white/20 pl-4">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="w-10 h-10 rounded-lg bg-white text-[#96171B] flex items-center justify-center hover:bg-rose-50 transition-all font-bold shadow-sm"
                  >
                    {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(3600);
                    }}
                    className="w-10 h-10 rounded-lg bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)]">
            <div className="p-4 bg-[#FAF8F5] border-b border-[#E6E1DA] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-['Outfit'] text-[#181411]">
                  Jadwal Rundown {selectedDay === 'day1' ? 'Hari 1 (08:00 - 15:00)' : 'Hari 2 (08:00 - 15:30)'}
                </h3>
                <p className="text-xs text-stone-500">
                  Klik baris sesi untuk mengaktifkan pada panel instruktur dan stopwatch.
                </p>
              </div>
              <span className="text-xs font-bold text-stone-400 font-['JetBrains_Mono']">
                {currentRundown.length} Blok Sesi Terjadwal
              </span>
            </div>

            <div className="divide-y divide-[#E6E1DA]">
              {currentRundown.map((step, idx) => {
                const isActive = activeRundownIndex === idx;
                const isDone = !!completedSteps[step.id];

                return (
                  <div
                    key={step.id}
                    onClick={() => setActiveRundownIndex(idx)}
                    className={`p-4 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isActive ? 'bg-amber-50/40 border-l-4 border-l-[#96171B]' : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCompletedSteps((prev) => ({ ...prev, [step.id]: !prev[step.id] }));
                        }}
                        className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-300 hover:border-[#96171B] text-transparent'
                        }`}
                      >
                        <CheckCircle2 size={16} />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#96171B] bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                            {step.time}
                          </span>
                          <span className="text-xs text-stone-400 font-['JetBrains_Mono']">
                            ({step.duration})
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4F1EC] text-stone-700">
                            {step.badge}
                          </span>
                        </div>
                        <h4 className={`text-sm font-bold font-['Outfit'] ${isDone ? 'line-through text-stone-400' : 'text-[#181411]'}`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-stone-500 font-['Plus_Jakarta_Sans'] max-w-2xl">
                          {step.desc}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-semibold text-stone-400">PJ Sesi:</div>
                      <div className="text-xs font-bold text-stone-700 font-['Outfit']">{step.trainer}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 4: GENERATOR STASIUN (11-17 KRU)
          =================================================================== */}
      {subSection === 'generator' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold font-['Outfit'] text-[#181411]">
                  Generator Stasiun Otomatis (11 - 17 Kru)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Setiap kru menerima 1 stasiun independen lengkap dengan spesifikasi SOP dan estimasi waktu.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E6E1DA]">
                <Users size={16} className="text-[#96171B]" />
                <div className="text-xs font-semibold text-stone-600">
                  Jumlah Kru Aktif:
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={11}
                    max={17}
                    value={crewCount}
                    onChange={(e) => setCrewCount(Number(e.target.value))}
                    className="w-24 accent-[#96171B] cursor-pointer"
                  />
                  <span className="w-8 text-center font-bold font-['JetBrains_Mono'] text-sm text-[#96171B] bg-white px-1.5 py-0.5 rounded border border-rose-200">
                    {crewCount}
                  </span>
                </div>
                <button
                  onClick={() => setShuffleSeed((prev) => prev + 1)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-stone-700 bg-white border border-[#E6E1DA] hover:bg-stone-50 transition-all shadow-xs"
                >
                  <Shuffle size={13} />
                  <span>Acak</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#E6E1DA]">
              <button
                onClick={() => setActiveBatchTab('batch1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['Outfit'] transition-all ${
                  activeBatchTab === 'batch1'
                    ? 'bg-[#96171B] text-white shadow-sm'
                    : 'bg-[#F4F1EC] text-stone-600 hover:text-stone-900'
                }`}
              >
                Day 1 • Batch 1: 10 Produk Dasar Dapur
              </button>
              <button
                onClick={() => setActiveBatchTab('batch2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['Outfit'] transition-all ${
                  activeBatchTab === 'batch2'
                    ? 'bg-[#96171B] text-white shadow-sm'
                    : 'bg-[#F4F1EC] text-stone-600 hover:text-stone-900'
                }`}
              >
                Day 1 • Batch 2: 11 Menu Perakitan Resmi
              </button>
              <button
                onClick={() => setActiveBatchTab('batch3')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['Outfit'] transition-all ${
                  activeBatchTab === 'batch3'
                    ? 'bg-[#96171B] text-white shadow-sm'
                    : 'bg-[#F4F1EC] text-stone-600 hover:text-stone-900'
                }`}
              >
                Day 2 • Batch 3: Menu Extra & Minuman Bar Resmi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentAssignedStations.map((station, sIdx) => {
              const product = station.product;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-[#E6E1DA] rounded-2xl p-4 shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)] flex flex-col justify-between hover:border-amber-300 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          Stasiun {sIdx + 1} • {product.category}
                        </span>
                        <h4 className="text-sm font-bold font-['Outfit'] text-[#181411] group-hover:text-[#96171B] transition-colors">
                          {product.name}
                        </h4>
                      </div>
                      <span className="font-['JetBrains_Mono'] text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        {product.estimatedTime}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-1.5">
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Kru Bertugas ({station.trainees.length})</span>
                        <ChefHat size={12} className="text-stone-400" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {station.trainees.map((tName, tIdx) => (
                          <span
                            key={tIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-white text-[#96171B] border border-rose-200 shadow-xs"
                          >
                            <Users size={11} />
                            {tName}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                        Titik Kritis SOP Resmi:
                      </div>
                      <ul className="space-y-1 text-[11px] text-stone-600">
                        {product.criticalPoints.map((cp, cpIdx) => (
                          <li key={cpIdx} className="flex items-start gap-1.5 leading-snug">
                            <span className="text-[#96171B] font-bold">•</span>
                            <span>{cp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E6E1DA] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-stone-500 font-medium truncate max-w-[170px]" title={product.keySpec}>
                      {product.keySpec}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedProductScored(product.name);
                        if (station.trainees[0]) setSelectedTraineeForScoring(station.trainees[0]);
                        setSubSection('scoring');
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#96171B] bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1"
                    >
                      <span>Nilai QC</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 5: FORM PENILAIAN PRAKTIK 4 INDIKATOR
          =================================================================== */}
      {subSection === 'scoring' && (
        <div className="space-y-6">
          {saveSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)] space-y-6">
              <div>
                <h3 className="text-base font-bold font-['Outfit'] text-[#181411]">
                  Lembar Penilaian QC Praktik (Formula 4 Indikator)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Audit langsung di Meja Pass-Thru atau Stasiun Kerja. Skor komposit (0 - 100 pt), batas lulus minimal 75 pt.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA]">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Peserta yang Dinilai
                  </label>
                  <select
                    value={selectedTraineeForScoring}
                    onChange={(e) => setSelectedTraineeForScoring(e.target.value)}
                    className="w-full bg-white border border-[#E6E1DA] rounded-lg px-3 py-2 text-xs font-bold text-[#181411] focus:outline-none focus:border-[#96171B]"
                  >
                    {activeTraineeList.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Batch Praktik
                  </label>
                  <select
                    value={scoringBatch}
                    onChange={(e) => setScoringBatch(e.target.value as any)}
                    className="w-full bg-white border border-[#E6E1DA] rounded-lg px-3 py-2 text-xs font-bold text-[#181411] focus:outline-none focus:border-[#96171B]"
                  >
                    <option value="Batch 1">Day 1 • Batch 1 (10 Produk Dasar)</option>
                    <option value="Batch 2">Day 1 • Batch 2 (11 Menu Perakitan)</option>
                    <option value="Batch 3">Day 2 • Batch 3 (Menu Extra & Bar)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                    Produk yang Diuji
                  </label>
                  <select
                    value={selectedProductScored}
                    onChange={(e) => setSelectedProductScored(e.target.value)}
                    className="w-full bg-white border border-[#E6E1DA] rounded-lg px-3 py-2 text-xs font-bold text-[#181411] focus:outline-none focus:border-[#96171B]"
                  >
                    {scoringBatch === 'Batch 1' && BATCH_1_PRODUCTS.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                    {scoringBatch === 'Batch 2' && BATCH_2_PRODUCTS.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                    {scoringBatch === 'Batch 3' && BATCH_3_PRODUCTS.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Slider 4 Indikator */}
              <div className="space-y-5">
                {/* 1. Gramatur 30% */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Scale size={16} className="text-[#96171B]" />
                        <h4 className="text-xs font-bold font-['Outfit'] text-[#181411]">
                          1. Akurasi Takaran Bahan Baku & Rasio (Bobot 30%)
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Rasio Cup Nasi Miyako 1:1.33 & centong standar (tanpa timbang meja saji), Sambal 30g, Bumbu ECO 20g, Kulit 50g mentah → 60g matang.
                      </p>
                    </div>
                    <span className="font-['JetBrains_Mono'] text-base font-bold text-[#96171B] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      {scoreGramatur} pt
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={scoreGramatur}
                    onChange={(e) => setScoreGramatur(Number(e.target.value))}
                    className="w-full accent-[#96171B] cursor-pointer"
                  />
                </div>

                {/* 2. Suhu & Durasi 30% */}
                {(() => {
                  const pName = selectedProductScored.toLowerCase();
                  const isFryer = pName.includes('deep fryer') || pName.includes('goreng ayam') || pName.includes('ayam utuh') || pName.includes('terong') || pName.includes('kulit') || pName.includes('jamur & kentang');
                  const isScramble = pName.includes('scramble') || pName.includes('scrembel');
                  const isIndomie = pName.includes('indomie');
                  const isNasi = pName.includes('nasi');
                  const isSambal = pName.includes('sambal');
                  const isMinuman = pName.includes('teh') || pName.includes('lemon') || pName.includes('orange') || pName.includes('shake');

                  return (
                    <div className={`p-4 rounded-xl border space-y-2 transition-all ${
                      isFryer
                        ? 'border-amber-300 bg-amber-50/50'
                        : isScramble || isIndomie
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-stone-200 bg-white'
                    }`}>
                      <div className="flex items-start sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Thermometer size={16} className={isFryer ? 'text-amber-600' : 'text-stone-600'} />
                            <h4 className="text-xs font-bold font-['Outfit'] text-[#181411]">
                              2. Ketepatan Suhu (SOP Resmi) & Durasi Stopwatch (Bobot 30%)
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                              isFryer
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            }`}>
                              {isFryer
                                ? '🔥 Wajib Deep Fryer 160°C'
                                : isScramble
                                ? '🍳 Bebas Suhu 160°C (Wajan Teflon 4 Mnt)'
                                : isIndomie
                                ? '🍜 Bebas Suhu 160°C (Rebusan 100°C 2 Mnt)'
                                : isNasi
                                ? '🍚 Bebas Suhu 160°C (Miyako Tanak 15 Mnt)'
                                : isSambal
                                ? '🌶️ Bebas Suhu 160°C (Cobek Ulek Batu)'
                                : isMinuman
                                ? '🧊 Bebas Suhu 160°C (Bar Minuman & Sealer)'
                                : '✨ Bebas Probe Suhu 160°C'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 mt-1">
                            {isFryer && '🔥 Deep Fryer: Suhu minyak wajib stabil 160°C ± 5°C (setelan kompor 175°C, waktu 12 mnt), suhu core internal ayam ≥ 74°C, goyang keranjang tiap 3 mnt.'}
                            {isScramble && '🍳 Scramble Egg (Mandiri, Tanpa Indomie): Wajan teflon api sedang 4 mnt, 1 telur + susu UHT + mix garam, lipatan fluffy lembut. TIDAK MENGGUNAKAN SUHU 160°C.'}
                            {isIndomie && '🍜 Indomie (Mandiri, Tanpa Scramble): Rebus air mendidih 2 mnt al dente, tiriskan uap panas, aduk bumbu di mangkok saji terpisah.'}
                            {isNasi && '🍚 Nasi Miyako: Rasio air baku 1:1.33, tombol kiri lalu kanan COOK, tanak 15 mnt, porsi centong bulat rapi.'}
                            {isSambal && '🌶️ Sambal Bawang: Goreng cabai & bawang 3-5 mnt api kecil, ulek kasar cobek batu + siram minyak panas 60ml.'}
                            {isMinuman && '🧊 Minuman Bar: Ekstraksi teh 20 mnt, takar 200ml + es batu kristal, Cup Sealer 160°C rapat anti-bocor.'}
                            {!isFryer && !isScramble && !isIndomie && !isNasi && !isSambal && !isMinuman && '✨ Non-Deep Fryer: Bebas probe suhu 160°C. Penilaian menitikberatkan pada durasi timer SOS, higienitas, dan hasil akhir.'}
                          </p>
                        </div>
                        <span className="font-['JetBrains_Mono'] text-base font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                          {scoreSuhuDurasi} pt
                        </span>
                      </div>
                      <input
                        type="range"
                        min={40}
                        max={100}
                        value={scoreSuhuDurasi}
                        onChange={(e) => setScoreSuhuDurasi(Number(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                    </div>
                  );
                })()}

                {/* 3. Platting, Packing & Rasa 25% */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Utensils size={16} className="text-sky-700" />
                        <h4 className="text-xs font-bold font-['Outfit'] text-[#181411]">
                          3. Standar Platting, Packing & Rasa (Bobot 25%)
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        WAJIB 2 slice timun miring 45°, alas kertas nasi utuh/seperempat, mentai diangkat 2 solet, piring bersih tanpa noda minyak.
                      </p>
                    </div>
                    <span className="font-['JetBrains_Mono'] text-base font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                      {scorePlattingRasa} pt
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={scorePlattingRasa}
                    onChange={(e) => setScorePlattingRasa(Number(e.target.value))}
                    className="w-full accent-sky-700 cursor-pointer"
                  />
                </div>

                {/* 4. Hygiene & Gallery Walk 15% */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-700" />
                        <h4 className="text-xs font-bold font-['Outfit'] text-[#181411]">
                          4. Hygiene & Presentasi Gallery Walk (Bobot 15%)
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Kelengkapan APD celemek & hairnet, kepatuhan 4 jenis lap resmi HARA (Kanebo, Orange, Basah, Kering).
                      </p>
                    </div>
                    <span className="font-['JetBrains_Mono'] text-base font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {scoreHygieneWalk} pt
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={100}
                    value={scoreHygieneWalk}
                    onChange={(e) => setScoreHygieneWalk(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>
              </div>

              {/* KILL-SWITCH GUGUR OTOMATIS */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-800">
                    <ShieldAlert size={16} className="text-rose-600 shrink-0" />
                    <span className="text-xs font-bold font-['Outfit'] uppercase tracking-wider">
                      Kill-Switch Pelanggaran Fatal (Gugur Otomatis & Wajib Masak Ulang)
                    </span>
                  </div>
                  {isKillSwitchTriggered && (
                    <span className="text-[10px] font-bold text-white bg-rose-600 px-2.5 py-0.5 rounded-full uppercase">
                      Gugur Aktif
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Jika terjadi 1 saja pelanggaran di bawah ini, peserta otomatis dinyatakan gugur untuk menu ini dan wajib mengulang sesi masak di R&D:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-rose-200 cursor-pointer hover:bg-rose-50/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={killSwitches.darah}
                      onChange={(e) => setKillSwitches((prev) => ({ ...prev, darah: e.target.checked }))}
                      className="mt-0.5 accent-rose-600 rounded"
                    />
                    <span className="text-stone-800 text-[11px]">
                      <b>Ayam Berdarah</b>: Core internal daging ayam &lt; 74°C (tulang merah).
                    </span>
                  </label>

                  <label className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-rose-200 cursor-pointer hover:bg-rose-50/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={killSwitches.blender}
                      onChange={(e) => setKillSwitches((prev) => ({ ...prev, blender: e.target.checked }))}
                      className="mt-0.5 accent-rose-600 rounded"
                    />
                    <span className="text-stone-800 text-[11px]">
                      <b>Sambal Diblender</b>: Memblender sambal halus (wajib ulek kasar di cobek).
                    </span>
                  </label>

                  <label className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-rose-200 cursor-pointer hover:bg-rose-50/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={killSwitches.tanpaTimbang}
                      onChange={(e) => setKillSwitches((prev) => ({ ...prev, tanpaTimbang: e.target.checked }))}
                      className="mt-0.5 accent-rose-600 rounded"
                    />
                    <span className="text-stone-800 text-[11px]">
                      <b>Tidak Timbang Wajib</b>: Melewatkan timbangan Nasi 170g / ECO 20g / Sambal 30g.
                    </span>
                  </label>

                  <label className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-rose-200 cursor-pointer hover:bg-rose-50/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={killSwitches.kontaminasiLantai}
                      onChange={(e) => setKillSwitches((prev) => ({ ...prev, kontaminasiLantai: e.target.checked }))}
                      className="mt-0.5 accent-rose-600 rounded"
                    />
                    <span className="text-stone-800 text-[11px]">
                      <b>Kontaminasi K3/Lantai</b>: Bahan jatuh ke lantai atau lap tercampur kotor.
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-600 uppercase">
                  Catatan Rekomendasi Trainer & Tindakan Perbaikan
                </label>
                <textarea
                  rows={2}
                  value={scoringNotes}
                  onChange={(e) => setScoringNotes(e.target.value)}
                  placeholder="Catatan kelebihan atau kekurangan teknik peserta..."
                  className="w-full p-3 rounded-xl border border-[#E6E1DA] text-xs font-medium text-stone-800 focus:outline-none focus:border-[#96171B]"
                />
              </div>

              <button
                onClick={handleSaveEvaluation}
                className="w-full py-3 rounded-xl bg-[#96171B] text-white font-bold font-['Outfit'] text-xs hover:bg-[#7A1215] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
              >
                <FileCheck size={16} />
                <span>Simpan Penilaian Praktik ({selectedTraineeForScoring})</span>
              </button>
            </div>

            {/* Kolom Kanan: Skor Akhir */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)] space-y-4">
                <div className="text-center pb-4 border-b border-stone-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Skor Komposit Terkalkulasi
                  </div>
                  <div className="text-5xl font-extrabold font-['JetBrains_Mono'] text-[#96171B] my-2">
                    {finalCalculatedScore}
                  </div>
                  <div className="text-xs text-stone-500">
                    Skor Tertimbang dari 4 Indikator
                  </div>
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border ${currentGradeInfo.color}`}>
                      {currentGradeInfo.grade} • {currentGradeInfo.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                    <span className="text-stone-600">Gramatur (30%):</span>
                    <span className="font-bold font-['JetBrains_Mono'] text-[#181411]">
                      {scoreGramatur} × 0.30 = {(scoreGramatur * 0.3).toFixed(1)} pt
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                    <span className="text-stone-600">Suhu & Durasi (30%):</span>
                    <span className="font-bold font-['JetBrains_Mono'] text-[#181411]">
                      {scoreSuhuDurasi} × 0.30 = {(scoreSuhuDurasi * 0.3).toFixed(1)} pt
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                    <span className="text-stone-600">Platting & Rasa (25%):</span>
                    <span className="font-bold font-['JetBrains_Mono'] text-[#181411]">
                      {scorePlattingRasa} × 0.25 = {(scorePlattingRasa * 0.25).toFixed(1)} pt
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                    <span className="text-stone-600">Hygiene & Walk (15%):</span>
                    <span className="font-bold font-['JetBrains_Mono'] text-[#181411]">
                      {scoreHygieneWalk} × 0.15 = {(scoreHygieneWalk * 0.15).toFixed(1)} pt
                    </span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-xs font-medium leading-relaxed ${
                  finalCalculatedScore >= 75
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <div className="font-bold mb-0.5 flex items-center gap-1.5">
                    {finalCalculatedScore >= 75 ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                    {finalCalculatedScore >= 75 ? 'STATUS: LULUS STANDAR HARA' : 'STATUS: WAJIB REMEDIAL PRAKTIK'}
                  </div>
                  {finalCalculatedScore >= 75
                    ? 'Peserta memenuhi kualifikasi standar SOP produk resmi dan siap melanjutkan tugas mandiri.'
                    : 'Skor di bawah batas kelulusan minimal (75 pt). Peserta wajib mengulang simulasi stasiun ini.'}
                </div>
              </div>

              {evaluationHistory.length > 0 && (
                <div className="bg-white border border-[#E6E1DA] rounded-2xl p-4 shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)]">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Riwayat QC Tersimpan ({evaluationHistory.length} Record)
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {evaluationHistory.map((rec) => (
                      <div key={rec.id} className="text-xs p-2 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA] flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#181411]">{rec.traineeName}</div>
                          <div className="text-[10px] text-stone-500">{rec.productName} ({rec.batch})</div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold font-['JetBrains_Mono'] text-[#96171B]">
                            {rec.finalScore} pt
                          </span>
                          <span className={`block text-[9px] font-bold ${rec.status === 'LULUS' ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {rec.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
