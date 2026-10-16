import React, { useState, useMemo, useEffect } from 'react';
import {
  Flame, Clock, Users, CheckCircle2, AlertTriangle, Scale,
  Thermometer, Award, Sparkles, RefreshCw, ChefHat, Shuffle,
  Printer, Play, Pause, RotateCcw, ChevronRight, Eye,
  FileCheck, ShieldCheck, Utensils, Box, ArrowRight, Star,
  Download, FileSpreadsheet, Layers, BookOpen, Compass, Check,
  Info, Coffee, PackageCheck, Timer, Zap
} from 'lucide-react';
import { db } from '../../lib/storage';

// ============================================================================
// DATA KONSTANTA & DEFINISI PRODUK
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
// DAY 1 - BATCH 1 (10 Produk Fondasi Dapur)
// ----------------------------------------------------------------------------
export const BATCH_1_PRODUCTS: ProductSOPItem[] = [
  {
    id: 'b1-ayam-utuh',
    name: 'Ayam Utuh (Potong & Marinasi)',
    category: 'Persiapan Bahan Baku',
    estimatedTime: '25 Menit',
    targetMinutes: 25,
    criticalPoints: [
      'Bobot karkas ayam standar 900 - 1000g, dipotong presisi menjadi 9 atau 10 bagian simetris.',
      'Dilarang ada sisa darah beku pada rongga dada/tulang paha (cuci bersih tiriskan 15 menit).',
      'Marinasi merata dengan bumbu marinasi HARA, simpan di chiller 1°C - 4°C minimal 2 jam.'
    ],
    equipment: ['Pisau Dapur Tajam 8 inch', 'Talenan Putih Khusus Unggas', 'Timbangan Digital 5kg', 'Baskom Stainless'],
    keySpec: 'Gramatur potongan: Dada 110-120g, Paha Atas 100-110g, Paha Bawah 85-95g, Sayap 75-85g',
    dineInStandard: 'Penyimpanan prep stock di Chiller Stainless suhu 1 - 4°C dengan label tanggal & jam marinasi.',
    takeAwayStandard: 'Sama dengan Dine-In, kontrol FIFO ketat (stok lama wajib digunakan lebih dahulu).'
  },
  {
    id: 'b1-nasi',
    name: 'Nasi Pulen HARA (Miyako / Gas)',
    category: 'Karbohidrat & Bahan Pokok',
    estimatedTime: '45 Menit',
    targetMinutes: 45,
    criticalPoints: [
      'Cuci beras 3 kali hingga air bilasan jernih (tidak boleh berbau apek/beras patah).',
      'Takaran air baku terkalibrasi: 3 cup beras = 4 cup air, 4 cup beras = 5 cup air, 5 cup = 6 cup, 6 cup = 8 cup.',
      'Wajib didiamkan tanak 15 menit pasca tombol jegleg/warm sebelum diaduk dan disajikan (maks 30 menit).'
    ],
    equipment: ['Rice Cooker Miyako / Gas Commercial', 'Gelas Ukur Beras & Air', 'Centong Nasi Anti-Lengket', 'Lap Oranye Meja'],
    keySpec: 'Tekstur pulen tidak pera, suhu core minimal saji \u2265 65°C, porsi saji 170g timbang',
    dineInStandard: 'Piring melamin putih bersih HARA, dicetak bulat rapi dengan ring mold atau mangkuk porsi 170g.',
    takeAwayStandard: 'Kertas nasi cokelat anti-minyak berlogo HARA atau Bento Box kompartemen, rapat dan higienis.'
  },
  {
    id: 'b1-teh',
    name: 'Teh Manis Segar (Signature Tea)',
    category: 'Minuman Segar',
    estimatedTime: '15 Menit',
    targetMinutes: 15,
    criticalPoints: [
      'Ekstraksi biang teh dengan air mendidih 100°C selama 10 menit, saring daun teh sempurna.',
      'Gula cair terkalibrasi (rasio manis seimbang 12° Brix), dilarang menggunakan pemanis buatan.',
      'Masa simpan dispenser maksimal 12 jam pada suhu ruang; wajib ganti biang baru setiap shift.'
    ],
    equipment: ['Panci Rebus Stainless', 'Saringan Kain Teh Tarik', 'Dispenser Teh Keran', 'Gelas Ukur 1000ml'],
    keySpec: 'Aroma wangi melati khas HARA, warna amber cerah tembus pandang, rasa manis segar seimbang',
    dineInStandard: 'Gelas es 16 oz / 22 oz dengan es batu kristal higienis, sedotan ramah lingkungan.',
    takeAwayStandard: 'Cup Sealer transparan 16 oz / 22 oz rapat anti-bocor + kantong kresek single cup.'
  },
  {
    id: 'b1-goreng-ayam',
    name: 'Goreng Ayam Crispy (Deep Fryer)',
    category: 'Pengolahan Panas Utama',
    estimatedTime: '20 Menit',
    targetMinutes: 20,
    criticalPoints: [
      'Suhu minyak deep fryer wajib stabil di 175°C (atau 160°C kompor manual komersial).',
      'Waktu goreng tepat 12 - 14 menit tergantung ukuran potongan daging.',
      'Suhu core daging matang wajib mencapai minimal \u2265 74°C (cek termometer jarum probe).',
      'Tiriskan di rak kawat minimal 1 menit sebelum dipindahkan ke etalase pemanas (display warmer).'
    ],
    equipment: ['Deep Fryer Gas / Listrik 175°C', 'Keranjang Stainless Fryer', 'Termometer Probe Tusuk', 'Penjepit Ayam 12 inch'],
    keySpec: 'Golden brown merata, kulit kriuk bergelombang krispi, daging dalam juicy tidak berdarah',
    dineInStandard: 'Piring saji melamin bersih bebas cipratan minyak, disajikan langsung hangat.',
    takeAwayStandard: 'Paper bag tahan minyak (greaseproof) berventilasi udara agar kriuk tidak melempem lemas.'
  },
  {
    id: 'b1-sambal-bawang',
    name: 'Sambal Bawang Segar HARA',
    category: 'Condiment & Saus Pedas',
    estimatedTime: '10 Menit',
    targetMinutes: 10,
    criticalPoints: [
      'Gunakan cabai rawit merah segar pilihan (bebas busuk) + bawang putih kating wangi.',
      'Ulek kasar di cobek batu tradisional; dilarang diblender halus menjadi pasta.',
      'Siram minyak panas mendidih 160°C langsung ke atas ulekan untuk mematangkan aroma bawang gurih.',
      'Gramatur porsi wajib 30g per porsi ayam geprek standar.'
    ],
    equipment: ['Cobek Batu & Ulekan Tradisional', 'Sendok Porsi 30g', 'Wajan Siram Minyak Panas', 'Timbangan Digital Mini'],
    keySpec: 'Tekstur ulek kasar berbiji, warna merah-oranye menggoda, aroma bawang matang harum pedas',
    dineInStandard: 'Dibalurkan langsung menutupi ayam geprek di atas piring atau cobek saji dine-in.',
    takeAwayStandard: 'Cup saus plastik 35ml bertutup klip rapat terpisah atau dibalur di atas ayam take-away.'
  },
  {
    id: 'b1-sup',
    name: 'Sup Segar Kaldu Ayam HARA',
    category: 'Kuah & Sayuran',
    estimatedTime: '30 Menit',
    targetMinutes: 30,
    criticalPoints: [
      'Ekstraksi kaldu tulang ayam segar, saring lemak berlebih agar kuah tetap bening gurih.',
      'Potongan sayur (wortel, buncis/kol, daun seledri) dipotong seragam rapi dan tidak overcooked.',
      'Suhu penyajian panas wajib \u2265 70°C; bumbu kaldu gurih lada tidak boleh dominan asin.'
    ],
    equipment: ['Panci Sup Stainless 10L', 'Sendok Sayur Berlubang & Centong Kuah', 'Mangkuk Sup Keramik / Melamin'],
    keySpec: 'Kuah bening keemasan, sayur renyah segar, gurih rempah lada seimbang',
    dineInStandard: 'Mangkuk sup kecil melamin berlogo HARA, taburan daun bawang dan bawang goreng wangi.',
    takeAwayStandard: 'Paper Bowl kuah tahan panas bertutup rapat + seal isolasi pelindung anti-tumpah.'
  },
  {
    id: 'b1-scramble',
    name: 'Scramble Egg Lembut (Fluffy)',
    category: 'Side Dish Protein',
    estimatedTime: '5 Menit',
    targetMinutes: 5,
    criticalPoints: [
      '1 butir telur kocok lepas + 10ml susu UHT/air + sejumput garam kaldu HARA.',
      'Masak dengan api kecil (low heat) menggunakan mentega wangi di wajan anti-lengket teflon.',
      'Lipat perlahan dengan spatula silikon; angkat saat masih 85% matang (moist & glossy).',
      'Dilarang overcooked hingga berubah warna kecokelatan atau kering berpori.'
    ],
    equipment: ['Wajan Teflon Anti-Lengket 20cm', 'Spatula Silikon Tahan Panas', 'Mangkuk Kocok Stainless', 'Garpu Kocok'],
    keySpec: 'Tekstur fluffy berlapis lembut, warna kuning cerah keemasan, rasa gurih creamy lembut',
    dineInStandard: 'Diletakkan rapi di samping nasi pulen hangat atau menutupi separuh mangkuk porsi.',
    takeAwayStandard: 'Diletakkan di kompartemen bento box atau di atas nasi kotak take-away.'
  },
  {
    id: 'b1-spinach',
    name: 'Spinach Crispy (Bayam Renyah)',
    category: 'Side Dish Renyah',
    estimatedTime: '8 Menit',
    targetMinutes: 8,
    criticalPoints: [
      'Daun bayam hijau segar lebar dicuci tiriskan hingga kering sempurna dari air.',
      'Balut adonan tepung bumbu tipis berbutir halus (bukan adonan basah yang tebal menggumpal).',
      'Goreng kilat di minyak panas 170°C selama 60 - 90 detik hingga mekar renyah.',
      'Tiriskan di atas kertas minyak; dilarang berminyak basah atau hangus kehitaman.'
    ],
    equipment: ['Wajan Penggorengan', 'Serok Kawat Halus', 'Baskom Penepungan', 'Kertas Tiris Minyak'],
    keySpec: 'Warna hijau zaitun mekar kriuk, tekstur rapuh renyah tidak berminyak, gurih ringan',
    dineInStandard: 'Garnish renyah di sisi piring menemani ayam geprek dan lalapan timun.',
    takeAwayStandard: 'Plastik klip standing pouch kecil atau paper cone berventilasi udara.'
  },
  {
    id: 'b1-terong',
    name: 'Terong Goreng Manis HARA',
    category: 'Side Dish Sayuran',
    estimatedTime: '6 Menit',
    targetMinutes: 6,
    criticalPoints: [
      'Terong ungu segar dipotong serong tebal 1.5 cm seragam.',
      'Goreng dalam minyak panas 160°C selama 2 - 3 menit hingga bagian daging dalam lembut meleleh.',
      'Kulit luar ungu mengkilap, tidak menyerap minyak berlebih (tiriskan dengan posisi miring).'
    ],
    equipment: ['Pisau Dapur & Talenan Hijau Sayuran', 'Wajan Penggorengan', 'Serok Tiris Stainless'],
    keySpec: 'Bagian luar mulus mengkilap, daging dalam lembut manis alami, tidak gosong',
    dineInStandard: 'Disusun kipas rapi 3 - 4 potong di samping sambal bawang dan ayam goreng.',
    takeAwayStandard: 'Disatukan di kompartemen lauk pelengkap dalam paper box / bento box.'
  },
  {
    id: 'b1-indomie',
    name: 'Indomie Geprek Racikan HARA',
    category: 'Karbohidrat Alternatif',
    estimatedTime: '5 Menit',
    targetMinutes: 5,
    criticalPoints: [
      'Rebus mi dalam air mendidih bergolak tepat 3 menit untuk tekstur kenyal al dente.',
      'Tiriskan cepat dan aduk rata bersama bumbu minyak dan cabai racikan khas HARA.',
      'Dilarang memasak mi terlalu lama hingga lembek mengembang (overcooked).',
      'Sajikan mengepul hangat bersama taburan bawang goreng renyah.'
    ],
    equipment: ['Panci Rebus Mi Bertingkat', 'Capitan Stainless Mi', 'Mangkuk Aduk Bumbu', 'Timer Digital Dapur'],
    keySpec: 'Tekstur mi kenyal elastis, bumbu meresap merata mengkilap, tidak menggumpal kering',
    dineInStandard: 'Piring saji ceper melamin putih, disusun rapi dengan ayam geprek di atasnya.',
    takeAwayStandard: 'Paper Bowl bulat tahan panas berlogo HARA dengan tutup transparan aman.'
  }
];

// ----------------------------------------------------------------------------
// DAY 1 - BATCH 2 (11 Menu Signature & RnD Assembly)
// ----------------------------------------------------------------------------
export const BATCH_2_PRODUCTS: ProductSOPItem[] = [
  {
    id: 'b2-nasgor-geprek-ori',
    name: 'Nasgor Geprek ORI (SOP-NasGor-02)',
    category: 'Menu Signature RnD',
    estimatedTime: '7 Menit',
    targetMinutes: 7,
    criticalPoints: [
      'Timbang beras/nasi pera tepat 170g timbang digital (bebas gumpalan).',
      'Minyak tumis 15ml, mix sayur (wortel & buncis iris) 30g ditumis lebih dahulu.',
      'Wajib gunakan bumbu ECO HARA 20g timbang presisi, aduk cepat dengan teknik high wok heat.',
      'Sajikan bersama ayam geprek sambal bawang 30g + 2 slice timun segar wajib.'
    ],
    equipment: ['Wok Baja Komersial High Pressure', 'Spatula Wok Besi', 'Timbangan Digital 5kg Presisi', 'Sendok Takar Minyak 15ml'],
    keySpec: 'Aroma wok hei smokey sedap, warna cokelat keemasan merata, nasi pulen terurai tidak benyek',
    dineInStandard: 'Piring ceper melamin hitam/putih HARA, garnish 2 slice timun miring 45°, kerupuk renyah.',
    takeAwayStandard: 'Bento Box HARA dengan sekat khusus atau Paper Bowl 800ml bersegel stiker QC.'
  },
  {
    id: 'b2-geprek-ori',
    name: 'Ayam Geprek ORI Klasik',
    category: 'Menu Utama HARA',
    estimatedTime: '3 Menit',
    targetMinutes: 3,
    criticalPoints: [
      'Geprek ayam crispy 2 - 3 ketukan lembut menggunakan ulekan kayu/batu di atas cobek.',
      'Dilarang meremukkan tulang hingga hancur menjadi serpihan tajam berbahaya.',
      'Balurkan sambal bawang 30g merata ke seluruh permukaan serat ayam selagi hangat.'
    ],
    equipment: ['Cobek Tradisional Batu & Ulekan', 'Capitan Makanan Stainless', 'Sendok Sambal 30g'],
    keySpec: 'Kulit tetap renyah di sela geprekan, sambal meresap gurih pedas menyengat',
    dineInStandard: 'Cobek batu beralas kayu saji atau piring melamin merah HARA bersama nasi hangat.',
    takeAwayStandard: 'Paper box HARA berventilasi udara + kantong saus sambal jika dipisah.'
  },
  {
    id: 'b2-geprek-keju-parut',
    name: 'Ayam Geprek Keju Parut Lembut',
    category: 'Varian Keju Signature',
    estimatedTime: '3 Menit',
    targetMinutes: 3,
    criticalPoints: [
      'Ayam digeprek dengan sambal bawang takaran standar 30g.',
      'Parut keju cheddar olahan berkualitas dengan parutan kawat panjang halus.',
      'Taburan keju wajib menutupi minimal 80% permukaan ayam dengan kerapatan tinggi.',
      'Keju tidak boleh menggumpal atau basah terkena uap air dingin.'
    ],
    equipment: ['Parutan Keju Stainless Panjang', 'Timbangan Gramatur Keju (20-25g)', 'Capitan Stainless'],
    keySpec: 'Tumpukan salju keju cheddar rapi, kontras pedas sambal dengan gurih asin keju',
    dineInStandard: 'Piring saji oval putih bersih, taburan keju menjuntai rapi estetik.',
    takeAwayStandard: 'Paper box HARA dengan kertas roti pembatas agar keju tidak menempel di tutup.'
  },
  {
    id: 'b2-geprek-mentai',
    name: 'Ayam Geprek Mentai Torch',
    category: 'Saus Spesial RnD',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      'Geprek ayam 2 ketukan, siram dengan saus mentai gurih kental standar 2 solet penuh (\u00b140g).',
      'Gunakan gas blow torch berjarak 5 - 7 cm dengan api biru-kuning berputar stabil.',
      'Torch selama 15 - 20 detik hingga permukaan saus berkaramel dan muncul bintik cokelat wangi.',
      'Dilarang torch terlalu dekat karena akan menghasilkan bau gas dan saus gosong pahit.'
    ],
    equipment: ['Gas Blow Torch Komersial', 'Solet Silikon Saus Mentai', 'Talenan Tahan Panas Metal'],
    keySpec: 'Lapisan saus berkilau dengan bintik karamel smokey harum, gurih creamy tobi-mayo',
    dineInStandard: 'Piring keramik tahan panas atau piring melamin tebal dengan alas daun pisang/kertas saji.',
    takeAwayStandard: 'Aluminium Foil tray atau Paper Box tahan minyak panas bersegel "Hati-Hati Panas".'
  },
  {
    id: 'b2-geprek-moza',
    name: 'Ayam Geprek Mozarella Melt',
    category: 'Varian Keju Signature',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      'Letakkan keju mozzarella iris tebal (\u00b130g) di atas ayam geprek yang sudah bersambal.',
      'Torch dengan intensitas sedang hingga keju meleleh elastis menutupi ayam sempurna.',
      'Pastikan keju mulur elastis dan tidak terbakar hingga menjadi jelaga hitam.',
      'Wajib disajikan segera dalam kondisi panas agar keju tidak kembali mengeras.'
    ],
    equipment: ['Gas Blow Torch Khusus Dapur', 'Capitan Anti-Panas', 'Pisau Iris Mozzarella'],
    keySpec: 'Keju mulur keemasan elastis, aroma smokey keju panggang memikat',
    dineInStandard: 'Piring saji panas dengan peringatan keju leleh, disajikan instan.',
    takeAwayStandard: 'Paper Box khusus dengan ventilasi udara kecil agar keju tetap lembut saat diterima pelanggan.'
  },
  {
    id: 'b2-geprek-ayoli',
    name: 'Ayam Geprek Garlic Ayoli',
    category: 'Saus Spesial RnD',
    estimatedTime: '3 Menit',
    targetMinutes: 3,
    criticalPoints: [
      'Saus Ayoli (Garlic Aioli) wajib diaduk cepat menggunakan garpu sebelum disendok (emulsi stabil).',
      'Tuangkan saus ayoli meliuk zig-zag rapi di atas ayam geprek bumbu sambal.',
      'Garnish taburan daun peterseli kering cincang halus untuk daya tarik visual modern.',
      'Rasa dominan bawang putih lembut wangi tanpa rasa kecut berlebih.'
    ],
    equipment: ['Botol Squeeze Saus Ayoli / Sendok Solet', 'Garpu Pengaduk Stainless', 'Garnish Shaker Herb'],
    keySpec: 'Warna putih kekuningan satin, tekstur kental lembut tidak pecah minyak, aroma bawang harum',
    dineInStandard: 'Piring melamin putih bistro, garnish daun peterseli hijau segar.',
    takeAwayStandard: 'Box Bento dengan saus ayoli zig-zag rapi atau cup mini 35ml terpisah.'
  },
  {
    id: 'b2-geprek-krisbar',
    name: 'Ayam Geprek Krisbar (Krispi Bakar)',
    category: 'Signature Bakar Griddle',
    estimatedTime: '5 Menit',
    targetMinutes: 5,
    criticalPoints: [
      'Ayam krispi dioles saus BBQ bakar racikan HARA di kedua sisinya menggunakan kuas silikon.',
      'Panggang di atas griddle / wajan bakar panas 180°C selama 1.5 menit tiap sisi.',
      'Bentuk grill mark karamel cantik tanpa menghanguskan lapisan tepung tepung krispi.',
      'Aroma asap bakar legit menyatu dengan kriuk ayam yang tetap renyah.'
    ],
    equipment: ['Wajan Griddle Plat Datar / Grill Pan', 'Kuas Silikon Oles Saus', 'Capitan Stainless Griddle'],
    keySpec: 'Lapisan saus karamel mengkilap dengan aroma bakaran smokey manis gurih',
    dineInStandard: 'Piring saji bakar berhias 2 iris mentimun dan sambal bakar pendamping.',
    takeAwayStandard: 'Kertas bungkus anti-lengket khusus grill + paper box tebal.'
  },
  {
    id: 'b2-hot-nashville',
    name: 'Hot Nashville Chicken HARA',
    category: 'Varian Pedas Internasional',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      'Celup kilat ayam krispi panas ke dalam minyak bumbu Nashville (paprika bubuk, cayenne, brown sugar).',
      'Tiriskan minyak celup 10 detik agar lapisan bumbu menempel pekat tanpa menetes becek.',
      'Wajib disajikan bersama 2 slice pickle mentimun asam segar sebagai penyeimbang rasa pedas.',
      'Warna merah membara merata menandakan pencelupan bumbu yang sempurna.'
    ],
    equipment: ['Baskom Stainless Celup Nashville', 'Penjepit Ayam Khusus Minyak Pedas', 'Rak Tiris Kawat'],
    keySpec: 'Warna merah bata membara memikat, pedas rempah menusuk dengan sensasi hangat manis',
    dineInStandard: 'Piring ceper modern putih dengan alas kertas roti kraft cokelat bertema Nashville.',
    takeAwayStandard: 'Paper bag khusus berpori atau burger box tebal dengan penanda stiker Level Pedas.'
  },
  {
    id: 'b2-krisbar-krispi',
    name: 'Krisbar Krispi Tanpa Geprek',
    category: 'Varian Bakar Signature',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      'Ayam krispi utuh tanpa digeprek dioles saus bakar smokey HARA merata.',
      'Dipanggang kilat untuk mengunci karamelisasi saus tanpa membuat kulit lembek.',
      'Menjaga kerenyahan kulit luar 100% utuh kriuk.'
    ],
    equipment: ['Griddle Gas Commercial', 'Kuas Silikon Bersih', 'Capitan Plat Lebar'],
    keySpec: 'Bentuk ayam utuh cantik berlapis glaze mengkilap, kriuk maksimal dengan aroma grill',
    dineInStandard: 'Piring saji melamin hitam kontras dengan warna emas karamel ayam.',
    takeAwayStandard: 'Paper box HARA higienis dengan ventilasi udara terjaga.'
  },
  {
    id: 'b2-mentai-krispi',
    name: 'Mentai Krispi Utuh',
    category: 'Saus Spesial RnD',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      'Ayam krispi utuh tanpa geprek diselimuti saus mentai kental 2 solet penuh.',
      'Torching presisi pada puncak kontur tepung krispi hingga melepuh wangi.',
      'Taburan nori flakes (rumput laut kering) tipis di atas saus bakar.'
    ],
    equipment: ['Gas Blow Torch Dapur', 'Solet Silikon', 'Shaker Nori Flakes'],
    keySpec: 'Aroma torch khas bistro Jepang dipadu kriuk ayam khas HARA, taburan nori rapi',
    dineInStandard: 'Piring keramik modern atau piring melamin oval berlogo resmi.',
    takeAwayStandard: 'Bowl eksklusif bertutup cembung bening agar saus mentai tidak tersentuh tutup.'
  },
  {
    id: 'b2-ayoli-krispi',
    name: 'Ayoli Krispi Utuh',
    category: 'Saus Spesial RnD',
    estimatedTime: '3 Menit',
    targetMinutes: 3,
    criticalPoints: [
      'Ayam krispi utuh dilapisi saus garlic ayoli gurih lembut dengan pola zigzag presisi.',
      'Garnish biji wijen sangrai renyah dan peterseli cincang di atasnya.',
      'Menampilkan kontras warna antara ayam golden brown dan saus krem putih satin.'
    ],
    equipment: ['Botol Squeeze Saus Ayoli', 'Shaker Wijen Sangrai', 'Piring Assembly'],
    keySpec: 'Visual premium modern bistro, tekstur crunchy ayam berpadu creamy saus bawang',
    dineInStandard: 'Piring ceper modern putih dengan hiasan garnish daun selada dan tomat cherry mini.',
    takeAwayStandard: 'Bento Box HARA dengan tutup transparan anti-embun.'
  }
];

// ----------------------------------------------------------------------------
// DAY 2 - BATCH 3 (Kulit Crispy & Varian Minuman Segar Lengkap)
// ----------------------------------------------------------------------------
export const BATCH_3_PRODUCTS: ProductSOPItem[] = [
  {
    id: 'b3-kulit-crispy',
    name: 'Kulit Crispy HARA (Garing Gurih)',
    category: 'Side Dish Primadona',
    estimatedTime: '12 Menit',
    targetMinutes: 12,
    criticalPoints: [
      'Bersihkan sisa lemak bawah kulit hingga bersih kesat (mencegah rasa eneg & lembek).',
      'Potong seragam ukuran 3 x 3 cm (timbang porsi prep 80g per saji).',
      'Balut tepung bumbu tipis berbutir; dilarang menggumpal seperti adonan bakwan.',
      'Goreng di minyak 175°C selama 7 - 8 menit hingga kuning keemasan garing, tiriskan miring.'
    ],
    equipment: ['Deep Fryer 175°C', 'Keranjang Kawat Halus', 'Talenan Putih & Pisau Stainless', 'Kertas Tiris Minyak'],
    keySpec: 'Warna golden yellow, renyah meletup saat digigit, tidak ada rasa lemak basah',
    dineInStandard: 'Mangkuk melamin merah HARA beralas kertas minyak bercap logo resmi.',
    takeAwayStandard: 'Standing pouch kraft berventilasi udara rapat klip agar tetap renyah.'
  },
  {
    id: 'b3-kulit-geprek',
    name: 'Kulit Geprek Sambal Bawang',
    category: 'Varian Pedas Krispi',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      'Kulit crispy digeprek 1 ketukan ringan (jangan dihancurkan sampai remuk tepung).',
      'Oleskan 30g sambal bawang matang siram minyak panas merata di atas hamparan kulit.',
      'Sajikan cepat maksimal 3 menit setelah digeprek agar kerenyahan kulit tidak layu minyak.'
    ],
    equipment: ['Cobek Tradisional Batu', 'Sendok Sambal 30g Terkalibrasi', 'Capitan Stainless'],
    keySpec: 'Renyah rekah bercampur pedasnya cabai rawit bawang gurih',
    dineInStandard: 'Cobek batu saji beralas piring kecil dan garnish 2 iris mentimun segar.',
    takeAwayStandard: 'Paper box berventilasi udara dengan sambal bawang di cup terpisah atau dibalur langsung.'
  },
  {
    id: 'b3-es-teh-jumbo',
    name: 'Es Teh Manis Jumbo (Signature 22 oz)',
    category: 'Minuman Segar Signature',
    estimatedTime: '3 Menit',
    targetMinutes: 3,
    criticalPoints: [
      'Tuang biang teh kental 150ml hasil ekstraksi standar 10 menit.',
      'Tambahkan sirup gula tebu cair terkalibrasi 40ml (standar manis 12° Brix).',
      'Isi es batu kristal higienis hingga 80% volume cup 22 oz.',
      'Kocok / aduk memutar 5 kali hingga cairan tercampur dingin merata.'
    ],
    equipment: ['Gelas Ukur Kalibrasi 100ml & 50ml', 'Cup Sealer Mesin Press 22 oz', 'Sendok Es Batu Stainless'],
    keySpec: 'Dingin menyegarkan, manis seimbang tanpa rasa pahit sepat pekat berlebih',
    dineInStandard: 'Gelas akrilik transparan 22 oz tebal bertangkai dengan sedotan higienis.',
    takeAwayStandard: 'Cup 22 oz di-press mesin Cup Sealer rapat anti-bocor + sedotan berbungkus kertas.'
  },
  {
    id: 'b3-lemon-tea',
    name: 'Lemon Tea Segar Alami HARA',
    category: 'Minuman Buah Segar',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      'Biang teh melati 120ml + sari lemon asli 15ml (gunakan sendok takar 15ml kalibrasi).',
      'Tambahkan gula cair 45ml + air mineral dingin 30ml.',
      'Beri 1 irisan slice lemon segar tebal 3mm di permukaan es sebagai garnish visual wangi.',
      'Rasa seimbang antara asam buah segar dan manis aromatik teh.'
    ],
    equipment: ['Sendok Takar 15ml Kalibrasi', 'Pisau Buah & Talenan Kuning', 'Gelas Shaker Minuman'],
    keySpec: 'Warna kuning madu cerah, aroma citrus semerbak, asam manis menyegarkan dahaga',
    dineInStandard: 'Gelas kaca transparan tinggi dengan garnish slice lemon di bibir gelas.',
    takeAwayStandard: 'Cup Sealer 16 oz / 22 oz berstiker varian Lemon Tea.'
  },
  {
    id: 'b3-milk-tea-milo',
    name: 'Varian Milk Tea / Milo HARA Shake',
    category: 'Minuman Creamy Shake',
    estimatedTime: '5 Menit',
    targetMinutes: 5,
    criticalPoints: [
      'Larutkan premix bubuk resmi 30g menggunakan air panas 60ml dalam gelas shaker.',
      'Aduk cepat hingga serbuk larut sempurna bebas gumpalan.',
      'Tambahkan 20ml kental manis + 30ml susu evaporasi creamy + es kristal.',
      'Kocok (shake) dengan shaker stainless selama 10 detik hingga berbusa lembut (frothy).'
    ],
    equipment: ['Shaker Stainless 500ml', 'Sendok Aduk Spiral Panjang', 'Gelas Ukur Takar Susu'],
    keySpec: 'Busa creamy di permukaan, rasa manis gurih cokelat/milk tea lembut tidak encer',
    dineInStandard: 'Gelas shaker saji dingin dengan taburan serbuk cokelat tipis di atas busa.',
    takeAwayStandard: 'Cup Sealer tebal berlabel varian rasa + sedotan besar ramah boba/shake.'
  },
  {
    id: 'b3-kopi-aren',
    name: 'Kopi Susu Gula Aren HARA',
    category: 'Signature Coffee Drink',
    estimatedTime: '4 Menit',
    targetMinutes: 4,
    criticalPoints: [
      'Lapisan 1: Sirup gula aren organik cair 25ml di dasar gelas.',
      'Lapisan 2: Masukkan es batu kristal hingga 70% penuh, lalu tuang 120ml Fresh Milk dingin perlahan.',
      'Lapisan 3: Tuangkan 1 shot konsentrat kopi robusta-arabica blend HARA (30ml) di atas susu (membentuk 3 layer estetik).',
      'Aroma kopi wangi karamel, rasa gurih creamy tidak kemanisan.'
    ],
    equipment: ['Gelas Ukur Kopi Espresso', 'Jigger Sirup Aren 25ml', 'Sendok Layering Stainless'],
    keySpec: 'Gradasi 3 layer warna: cokelat pekat kopi di atas, putih susu di tengah, cokelat tua aren di dasar',
    dineInStandard: 'Gelas kaca bening tanpa sedotan (disajikan dengan coaster kayu estetik HARA).',
    takeAwayStandard: 'Cup transparan 16 oz dengan tutup dome atau sealer bening memperlihatkan layer.'
  }
];

// ----------------------------------------------------------------------------
// DAY 2 - BATCH 4 (Speed Assembly Combo, Bento Box & Closing Sanitasi)
// ----------------------------------------------------------------------------
export const BATCH_4_PRODUCTS: ProductSOPItem[] = [
  {
    id: 'b4-bento-takeaway',
    name: 'Assembly Bento Box Combo Take-Away',
    category: 'Packaging & Platting Combo',
    estimatedTime: '3 Menit',
    targetMinutes: 3,
    criticalPoints: [
      'Kompartemen 1: Nasi pulen timbang tepat 170g dicetak rapi persegi/bulat beralas daun pisang imitasi.',
      'Kompartemen 2: 1 potong Ayam Geprek / Mentai dengan saus rapi tidak mencoreng tepi sekat.',
      'Kompartemen 3: Scramble egg lembut (fluffy) berdampingan dengan spinach crispy.',
      'Kompartemen 4: 2 slice timun miring 45° + cup sambal tertutup rapat klip.',
      'Tutup bento box rapat klik di 4 sudut, tempelkan stiker segel QC HARA & label jam saji.'
    ],
    equipment: ['Bento Box 4 Kompartemen Food Grade', 'Timbangan Gramatur 170g', 'Stiker Segel QC HARA'],
    keySpec: 'Penataan bersih 100% higienis, tidak ada cipratan saus di dinding bento, segel tertutup kencang',
    dineInStandard: 'Dapat disajikan sebagai Paket Bento Lunch Box Meja Dine-In.',
    takeAwayStandard: 'Standar baku take-away & pesanan online (GrabFood/GoFood/ShopeeFood).'
  },
  {
    id: 'b4-paper-bowl',
    name: 'Assembly Paper Bowl Rice & Chicken Hot',
    category: 'Packaging Bowl Praktis',
    estimatedTime: '3 Menit',
    targetMinutes: 3,
    criticalPoints: [
      'Dasar mangkuk: Nasi pulen hangat 170g diratakan perlahan dengan centong.',
      'Topping: Daging ayam suwir / geprek dadu crispy disebar menutupi 70% permukaan nasi.',
      'Tuang saus ayoli/mentai zig-zag estetik + taburan wijen sangrai dan daun peterseli.',
      'Pasang tutup cembung bening berlubang ventilasi uap; tutup rapat hingga berbunyi "klik".'
    ],
    equipment: ['Paper Bowl 650ml / 800ml Food Grade', 'Tutup Cembung Bening', 'Stiker Segel Higienis'],
    keySpec: 'Tampilan bowl warna-warni menarik dari atas tutup cembung, hangat mengepul',
    dineInStandard: 'Paper bowl beralas nampan kayu kecil ramah lingkungan.',
    takeAwayStandard: 'Paper bowl dimasukkan kantong plastik kantong spunbond bersama sendok garpu kemas steril.'
  },
  {
    id: 'b4-dinein-platter',
    name: 'Platting Dine-In Platter Meja Resto',
    category: 'Standar Platting Restoran',
    estimatedTime: '2 Menit',
    targetMinutes: 2,
    criticalPoints: [
      'Piring ceper melamin merah/hitam HARA wajib bersih kering tanpa bekas jari atau tetesan air.',
      'Nasi dicetak bulat padat di sisi kiri piring (170g).',
      'Ayam geprek/mentai diletakkan miring bersandar estetik di samping nasi.',
      'Garnish timun dan spinach diletakkan di sisi kanan atas piring.',
      'Tepi piring wajib dilap bersih menggunakan Kanebo / lap khusus piring bersih.'
    ],
    equipment: ['Piring Melamin Ceper Berlogo HARA', 'Kanebo Khusus Piring Bersih', 'Capitan Stainless Saji'],
    keySpec: 'Presentasi bersih ala bistro modern, kontras warna menggugah selera makan tamu',
    dineInStandard: 'Standar resmi saji Dine-In di seluruh outlet HARA Chicken.',
    takeAwayStandard: 'Bukan untuk take-away (khusus santap di tempat).'
  },
  {
    id: 'b4-speed-rush-hour',
    name: 'Simulasi Rush Hour 5 Pesanan Cepat',
    category: 'Kecepatan & Kolaborasi Tim',
    estimatedTime: '10 Menit',
    targetMinutes: 10,
    criticalPoints: [
      'Selesaikan 5 tiket pesanan simulasi serentak (3 Dine-In, 2 Take-Away) dalam waktu maksimal 10 menit.',
      'Komunikasi lantang dan jelas antara Kasir, Kitchen Fryer, Assembly, dan Runner.',
      'Ketepatan isi pesanan 100% tanpa salah sambal / salah saus / salah minum.',
      'Waktu saji per tiket (ticket time) wajib di bawah 3 menit per paket.'
    ],
    equipment: ['Display Tiket Pesanan Mockup', 'Timer Countdown 10 Menit', 'Meja Pass-Thru Assembly'],
    keySpec: 'Ketepatan tiket 100%, kecepatan saji < 3 menit per menu, ketenangan ritme kerja dapur',
    dineInStandard: 'Nampan saji terorganisir rapi siap diantarkan ke meja tamu.',
    takeAwayStandard: 'Kantong pesanan online bersegel rapi dengan struk terlampir.'
  },
  {
    id: 'b4-closing-sanitasi',
    name: 'Audit Closing, Sanitasi & 4 Lap Warna HARA',
    category: 'Higiene & Penutupan Dapur',
    estimatedTime: '20 Menit',
    targetMinutes: 20,
    criticalPoints: [
      'Pemisahan sisa matang: Dilarang simpan ayam matang/terong/sup untuk dijual besok (HC-SOP-11-PKP Hal 15).',
      'Bahan boleh disimpan: Sambal, saus mentai, spinach, sirup teh (simpan chiller tertutup label FIFO).',
      'Pembersihan 4 Lap Resmi: Kanebo untuk piring, Lap Orange untuk meja, Lap Basah untuk lantai/grease, Lap Kering untuk tangan.',
      'Suhu Chiller dipastikan stabil 1°C - 4°C, Deep Fryer dimatikan dan ditutup penutup stainless.'
    ],
    equipment: ['4 Jenis Lap Warna HARA', 'Thermometer Digital Chiller', 'Cairan Sanitizer Food Grade'],
    keySpec: 'Dapur steril 100%, peralatan kering rapi pada rak, inventaris tercatat akurat',
    dineInStandard: 'Ruang makan & meja tamu kinclong bebas noda minyak atau remah makanan.',
    takeAwayStandard: 'Area meja kasir & packing take-away tersusun rapi untuk shift esok hari.'
  }
];

// ============================================================================
// KOMPONEN UTAMA SIMULASI PRAKTIK BATCH 1 & BATCH 2 (RnD)
// ============================================================================

export const SimulasiPraktikRnDView: React.FC<{ selectedOutletCode?: string }> = ({
  selectedOutletCode = 'ALL'
}) => {
  // Navigation Sub-Section: methods, rundown, generator, scoring
  const [subSection, setSubSection] = useState<'methods' | 'rundown' | 'generator' | 'scoring'>('methods');

  // Day Selection: Day 1 (Fondasi & Geprek) vs Day 2 (Kulit, Minuman & Assembly)
  const [selectedDay, setSelectedDay] = useState<'day1' | 'day2'>('day1');

  // --------------------------------------------------------------------------
  // STATE BAGIAN 1: RUNDOWN & TIMER
  // --------------------------------------------------------------------------
  const [activeRundownIndex, setActiveRundownIndex] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(3600); // 60 menit default
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
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

  // Jadwal Rundown Hari 1
  const RUNDOWN_DAY_1 = [
    {
      id: 'd1-s1',
      time: '08:00 - 10:00',
      duration: '120 Menit',
      title: 'Materi 4 SOP Inti (Briefing Teori, K3 & HACCP)',
      trainer: 'Lead Field Trainer & SPV Outlet',
      desc: 'Penyampaian komprehensif 4 fondasi utama: SOP Deep Fryer (175°C/160°C & waktu 12-14 mnt), SOP Beras Miyako (air baku terukur & tanak 15 mnt), SOP Sambal Bawang (ulek kasar & siram minyak panas), serta Kebersihan & 4 Lap Warna HARA (Kanebo, Orange Meja, Basah Kotak-kotak, Kering Kotak-kotak).',
      deliverables: ['Pemahaman parameter kritis 4 SOP', 'Verifikasi kelengkapan APD kru', 'Pre-test checklist kesiapan'],
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
      title: 'Eksekusi Paralel Batch 1 (10 Produk Fondasi Dapur)',
      trainer: 'Seluruh Trainer & Peserta Training (11-17 Kru)',
      desc: '10 stasiun berjalan serempak secara mandiri: Ayam Utuh, Nasi, Teh Manis, Goreng Ayam Deep Fryer, Sambal Bawang, Sup Ayam, Scramble Egg, Spinach Crispy, Terong Goreng, dan Indomie Racikan HARA.',
      deliverables: ['10 Produk Fondasi Selesai Tepat Waktu', 'Penerapan Safety & K3 Dapur', 'Akurasi Gramatur Bahan Baku'],
      badge: 'Eksekusi Batch 1'
    },
    {
      id: 'd1-s4',
      time: '11:30 - 12:00',
      duration: '30 Menit',
      title: 'Gallery Walk & Quality Control (QC) Meja Pass-Thru',
      trainer: 'Lead Trainer & QC Inspector',
      desc: 'Seluruh kru berbaris membawa hasil masakan ke Meja Pass-Thru untuk diinspeksi serentak: uji suhu core ayam (\u2265 74°C), audit rasa sambal & sup, kerenyahan bayam & kulit ayam, serta evaluasi gramatur timbangan.',
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
      title: 'Eksekusi Paralel Batch 2 (11 Menu Signature & RnD Assembly)',
      trainer: 'Lead Trainer & RnD Specialist',
      desc: 'Perakitan serempak 11 Menu Signature: Nasgor Geprek ORI (SOP-NasGor-02 Nasi 170g + ECO 20g), Geprek ORI, Geprek Keju Parut, Geprek Mentai (torch 2 solet), Geprek Moza (melt torch), Geprek Ayoli (aduk garpu), Geprek Krisbar (griddle smokey), Hot Nashville (oil dip pedas), Krisbar Krispi, Mentai Krispi, dan Ayoli Krispi.',
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

  // Jadwal Rundown Hari 2
  const RUNDOWN_DAY_2 = [
    {
      id: 'd2-s1',
      time: '08:00 - 09:00',
      duration: '60 Menit',
      title: 'Refreshment Materi Hari 1 & Evaluasi QC Kemarin',
      trainer: 'Lead Field Trainer & SPV Outlet',
      desc: 'Bedah hasil penilaian Batch 1 & 2 hari kemarin, review kesalahan umum (suhu minyak tidak stabil, penimbangan nasi < 170g, torching terlalu dekat), dan briefing target pencapaian Hari 2.',
      deliverables: ['Evaluasi catatan remedial kru', 'Refleksi SOP titik kritis', 'Kesiapan fisik dan mental tim'],
      badge: 'Review & Refreshment'
    },
    {
      id: 'd2-s2',
      time: '09:00 - 09:30',
      duration: '30 Menit',
      title: 'Briefing Teori SOP Kulit Crispy & Standar Minuman Bar HARA',
      trainer: 'RnD Specialist & Beverage Trainer',
      desc: 'Penyampaian SOP penanganan kulit ayam (pembersihan lemak bawah kulit & pemotongan 3x3 cm), kalibrasi mesin Cup Sealer, rasio sirup gula 12° Brix, ekstraksi 100°C, dan sanitasi dispenser.',
      deliverables: ['Penguasaan SOP Kulit Crispy', 'Kalibrasi Gula & Es Batu', 'Setting Mesin Cup Sealer'],
      badge: 'Teori Kulit & Bar'
    },
    {
      id: 'd2-s3',
      time: '09:30 - 10:45',
      duration: '75 Menit',
      title: 'Eksekusi Paralel Batch 3 (Kulit Crispy & 6 Varian Minuman Segar)',
      trainer: 'Trainer Stasiun Bar & Fryer',
      desc: 'Praktik serentak: Kulit Crispy 175°C (7-8 mnt), Kulit Geprek Sambal Bawang, Es Teh Jumbo 22 oz, Lemon Tea 15ml sari lemon asli, Milk Tea / Milo creamy shake, dan Kopi Susu Gula Aren 3 layer.',
      deliverables: ['Kulit Crispy Mekar Sempurna', 'Minuman Terkalibrasi Manis & Es', 'Cup Sealer Rapat Tanpa Bocor'],
      badge: 'Eksekusi Batch 3'
    },
    {
      id: 'd2-s4',
      time: '10:45 - 11:30',
      duration: '45 Menit',
      title: 'Gallery Walk Day 2 & Blind Taste Minuman',
      trainer: 'Lead Trainer & Kru Peserta',
      desc: 'Uji kerenyahan kulit crispy di meja pass-thru (suara renyah & tidak berminyak), uji rasa manis minuman (Brix meter / sensory test), dan audit kerapihan sealer cup.',
      deliverables: ['Audit Kerenyahan Kulit', 'Sensory Test Minuman Bar', 'Feedback Instan Trainer'],
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
      title: 'Eksekusi Paralel Batch 4 (Speed Assembly Combo Dine-In vs Take-Away)',
      trainer: 'Lead Trainer & Assembly Specialist',
      desc: 'Perakitan menu kombo: Bento Box 4 kompartemen (nasi 170g + ayam mentai + telur + bayam + timun), Paper Bowl Rice Chicken Hot, Dine-In Platter melamin, serta simulasi pengemasan rapi tahan tumpah.',
      deliverables: ['Bento Box Rapi Segel QC', 'Paper Bowl Tutup Klik Cembung', 'Platting Melamin Cantik Bersih'],
      badge: 'Eksekusi Batch 4'
    },
    {
      id: 'd2-s7',
      time: '14:00 - 14:45',
      duration: '45 Menit',
      title: 'Simulasi Rush Hour Dapur (Speed Order Mockup 10 Menit)',
      trainer: 'Ops Manager & SPV Outlet',
      desc: 'Simulasi dapur nyata berkecepatan tinggi: 5 tiket pesanan online & offline serentak. Uji koordinasi kasir, fryer, geprek, packaging dan runner dengan batas waktu saji di bawah 3 menit per paket.',
      deliverables: ['5 Tiket Pesanan Selesai < 10 Menit', 'Ticket Time Rata-rata < 3 Menit', 'Kerjasama Tim Solid'],
      badge: 'Simulasi Rush Hour'
    },
    {
      id: 'd2-s8',
      time: '14:45 - 15:30',
      duration: '45 Menit',
      title: 'Closing Sanitasi Dapur, Rekap Skor 4-Indikator & Sertifikasi Kelulusan OJT',
      trainer: 'Lead Trainer & Manajer Operasional',
      desc: 'Penerapan SOP Closing (pemisahan sisa bahan matang dilarang jual besok vs chiller, lap 4 warna), penghitungan nilai akhir 4 indikator, serta penyerahan sertifikat kelulusan praktik OJT HARA.',
      deliverables: ['Dapur Closing Sempurna', 'Rekapitulasi Nilai Seluruh Kru', 'Sertifikat Kompetensi OJT Terbit'],
      badge: 'Closing & Sertifikasi'
    }
  ];

  const currentRundown = selectedDay === 'day1' ? RUNDOWN_DAY_1 : RUNDOWN_DAY_2;

  // --------------------------------------------------------------------------
  // STATE BAGIAN 2: GENERATOR PEMBAGIAN STASIUN OTOMATIS (11-17 KRU)
  // --------------------------------------------------------------------------
  const [crewCount, setCrewCount] = useState<number>(14);
  const [activeBatchTab, setActiveBatchTab] = useState<'batch1' | 'batch2' | 'batch3' | 'batch4'>('batch1');
  const [traineeNames, setTraineeNames] = useState<string[]>([
    'Budi Santoso', 'Siti Rahmawati', 'Rian Hidayat', 'Dewi Lestari',
    'Ahmad Fauzi', 'Nurul Aini', 'Eko Prasetyo', 'Mega Putri',
    'Bayu Pratama', 'Intan Permata', 'Doni Kusuma', 'Rina Anggraini',
    'Fajar Sidiq', 'Tri Wahyuni', 'Agus Setiawan', 'Lia Marlina', 'Hendro Wijaya'
  ]);

  // Load existing trainees from local database if available
  useEffect(() => {
    try {
      const storedTrainees = db.getTable('trainee_outlet');
      if (storedTrainees && storedTrainees.length >= 5) {
        const names = storedTrainees.map((t: any) => t.nama_lengkap || t.namaKru || t.name).filter(Boolean);
        if (names.length >= 11) {
          setTraineeNames(names.slice(0, 17));
        }
      }
    } catch (e) {
      // fallback to default
    }
  }, []);

  const activeTraineeList = useMemo(() => {
    return traineeNames.slice(0, crewCount);
  }, [traineeNames, crewCount]);

  // Algoritma pembagian stasiun otomatis
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
  const assignedStationsBatch4 = useMemo(() => getStationAssignments(BATCH_4_PRODUCTS, 7), [activeTraineeList, shuffleSeed]);

  const currentAssignedStations = useMemo(() => {
    switch (activeBatchTab) {
      case 'batch1': return assignedStationsBatch1;
      case 'batch2': return assignedStationsBatch2;
      case 'batch3': return assignedStationsBatch3;
      case 'batch4': return assignedStationsBatch4;
      default: return assignedStationsBatch1;
    }
  }, [activeBatchTab, assignedStationsBatch1, assignedStationsBatch2, assignedStationsBatch3, assignedStationsBatch4]);

  // --------------------------------------------------------------------------
  // STATE BAGIAN 3: FORM PENILAIAN PRAKTIK CEPAT 4 INDIKATOR
  // --------------------------------------------------------------------------
  const [selectedTraineeForScoring, setSelectedTraineeForScoring] = useState<string>(activeTraineeList[0] || 'Budi Santoso');
  const [scoringBatch, setScoringBatch] = useState<'Batch 1' | 'Batch 2' | 'Batch 3' | 'Batch 4'>('Batch 1');
  const [selectedProductScored, setSelectedProductScored] = useState<string>(BATCH_1_PRODUCTS[0].name);

  // Update selected product when scoring batch changes
  useEffect(() => {
    if (scoringBatch === 'Batch 1') setSelectedProductScored(BATCH_1_PRODUCTS[0].name);
    else if (scoringBatch === 'Batch 2') setSelectedProductScored(BATCH_2_PRODUCTS[0].name);
    else if (scoringBatch === 'Batch 3') setSelectedProductScored(BATCH_3_PRODUCTS[0].name);
    else if (scoringBatch === 'Batch 4') setSelectedProductScored(BATCH_4_PRODUCTS[0].name);
  }, [scoringBatch]);

  // 4 Indikator Penilaian
  const [scoreGramatur, setScoreGramatur] = useState<number>(85); // Bobot 30%
  const [scoreSuhuDurasi, setScoreSuhuDurasi] = useState<number>(85); // Bobot 30%
  const [scorePlattingRasa, setScorePlattingRasa] = useState<number>(90); // Bobot 25%
  const [scoreHygieneWalk, setScoreHygieneWalk] = useState<number>(80); // Bobot 15%
  const [scoringNotes, setScoringNotes] = useState<string>('Eksekusi presisi, suhu core tercapai, penataan timun rapi.');

  // Composite Score Calculation
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
    if (score >= 80) return { grade: 'Grade B', label: 'Kompeten Mandiri', color: 'bg-sky-50 text-sky-800 border-sky-300' };
    if (score >= 75) return { grade: 'Grade C', label: 'Lulus Bersyarat (Pendampingan)', color: 'bg-amber-50 text-amber-800 border-amber-300' };
    return { grade: 'Remedial', label: 'Belum Kompeten (Wajib Ulang)', color: 'bg-rose-50 text-rose-800 border-rose-300' };
  };

  const currentGradeInfo = getScoreGrade(finalCalculatedScore);

  // Local storage history of QC evaluations
  const [evaluationHistory, setEvaluationHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('hara_rnd_simulasi_evaluations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleSaveEvaluation = () => {
    const newRecord = {
      id: `qc-${Date.now()}`,
      traineeName: selectedTraineeForScoring,
      batch: scoringBatch,
      productName: selectedProductScored,
      gramatur: scoreGramatur,
      suhuDurasi: scoreSuhuDurasi,
      plattingRasa: scorePlattingRasa,
      hygieneWalk: scoreHygieneWalk,
      finalScore: finalCalculatedScore,
      grade: currentGradeInfo.grade,
      status: finalCalculatedScore >= 75 ? 'LULUS' : 'REMEDIAL',
      notes: scoringNotes,
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newRecord, ...evaluationHistory];
    setEvaluationHistory(updated);
    try {
      localStorage.setItem('hara_rnd_simulasi_evaluations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setSaveSuccessMsg(`Penilaian praktik untuk "${selectedTraineeForScoring}" berhasil disimpan!`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // --------------------------------------------------------------------------
  // SPREADSHEET (CSV / EXCEL) EXPORT GENERATOR
  // --------------------------------------------------------------------------
  const handleExportSpreadsheet = () => {
    const rows: string[][] = [];

    // Header Metadata
    rows.push(['HARA CHICKEN - MASTER PLANNING ONBOARDING & SIMULASI PRAKTIK DAPUR']);
    rows.push(['Dibuat:', new Date().toLocaleDateString('id-ID'), 'Outlet:', selectedOutletCode, 'Target Peserta:', `${crewCount} Kru`]);
    rows.push([]);

    // Section 1: Rundown Hari 1
    rows.push(['=== JADWAL RUNDOWN PRAKTIK HARI 1 (FONDASI & GEPREK) ===']);
    rows.push(['Waktu', 'Durasi', 'Sesi / Aktivitas', 'Penanggung Jawab', 'Output / Deliverables', 'Kategori']);
    RUNDOWN_DAY_1.forEach((item) => {
      rows.push([item.time, item.duration, item.title, item.trainer, item.deliverables.join('; '), item.badge]);
    });
    rows.push([]);

    // Section 2: Rundown Hari 2
    rows.push(['=== JADWAL RUNDOWN PRAKTIK HARI 2 (KULIT, MINUMAN, ASSEMBLY & CLOSING) ===']);
    rows.push(['Waktu', 'Durasi', 'Sesi / Aktivitas', 'Penanggung Jawab', 'Output / Deliverables', 'Kategori']);
    RUNDOWN_DAY_2.forEach((item) => {
      rows.push([item.time, item.duration, item.title, item.trainer, item.deliverables.join('; '), item.badge]);
    });
    rows.push([]);

    // Section 3: Matriks Pembagian Stasiun Kru (Batch 1 s.d. Batch 4)
    rows.push(['=== MATRIKS PEMBAGIAN STASIUN KERJA & ESTIMASI WAKTU SOP ===']);
    rows.push(['Batch', 'Nomor Stasiun', 'Produk SOP HARA', 'Kategori', 'Estimasi Waktu', 'Kru Bertugas', 'Titik Kritis SOP', 'Spesifikasi Kunci']);

    assignedStationsBatch1.forEach((st, idx) => {
      rows.push(['Batch 1 (Fondasi)', `Stasiun 1.${idx + 1}`, st.product.name, st.product.category, st.product.estimatedTime, st.trainees.join(', ') || 'Belum Ditugaskan', st.product.criticalPoints.join(' | '), st.product.keySpec]);
    });

    assignedStationsBatch2.forEach((st, idx) => {
      rows.push(['Batch 2 (Signature)', `Stasiun 2.${idx + 1}`, st.product.name, st.product.category, st.product.estimatedTime, st.trainees.join(', ') || 'Belum Ditugaskan', st.product.criticalPoints.join(' | '), st.product.keySpec]);
    });

    assignedStationsBatch3.forEach((st, idx) => {
      rows.push(['Batch 3 (Kulit & Minuman)', `Stasiun 3.${idx + 1}`, st.product.name, st.product.category, st.product.estimatedTime, st.trainees.join(', ') || 'Belum Ditugaskan', st.product.criticalPoints.join(' | '), st.product.keySpec]);
    });

    assignedStationsBatch4.forEach((st, idx) => {
      rows.push(['Batch 4 (Assembly & Closing)', `Stasiun 4.${idx + 1}`, st.product.name, st.product.category, st.product.estimatedTime, st.trainees.join(', ') || 'Belum Ditugaskan', st.product.criticalPoints.join(' | '), st.product.keySpec]);
    });
    rows.push([]);

    // Section 4: Rubrik Penilaian 4 Indikator
    rows.push(['=== FORMULA PENILAIAN 4 INDIKATOR & STANDAR KELULUSAN ===']);
    rows.push(['Indikator Penilaian', 'Bobot (%)', 'Toleransi & Standar Kunci']);
    rows.push(['1. Akurasi Gramatur Bahan Baku', '30%', 'Toleransi timbangan maksimal +/- 5g. Nasi 170g, Sambal 30g, Bumbu ECO 20g, Ayam 110-120g']);
    rows.push(['2. Ketepatan Suhu & Durasi Waktu', '30%', 'Fryer 175°C (12-14 mnt), Suhu Core Ayam >= 74°C, Tanak Nasi 15 mnt, Torch 15-20 dtk, Griddle 1.5 mnt/sisi']);
    rows.push(['3. Standar Platting, Packing & Rasa', '25%', 'Estetika piring bersih bebas cipratan minyak, 2 slice timun miring 45°, kemasan take-away anti-bocor segel QC']);
    rows.push(['4. Hygiene & Presentasi Gallery Walk', '15%', 'APD celemek & hairnet lengkap, 4 lap warna HARA sesuai fungsinya, kerapihan meja pass-thru']);
    rows.push([]);
    rows.push(['Standar Kelulusan:', 'Nilai Akhir >= 75.0 (Grade A: >= 90 Mastery, Grade B: 80-89 Kompeten, Grade C: 75-79 Pendampingan, < 75 Remedial)']);

    // Build CSV with BOM for Excel compatibility
    const csvContent = '\uFEFF' + rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `HARA_Onboarding_Day1_Day2_Planning_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================
          HEADER UTAMA & ACTIONS EKSPOR SPREADSHEET / PDF
          =================================================================== */}
      <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#96171B] border border-[#FECACA]">
                MODUL RnD & SIMULASI PRAKTIK
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Standar Kuota: 11 - 17 Kru
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F4F1EC] text-[#181411]">
                Metode Terpilih: Demo 15 Mnt + Praktik Serentak
              </span>
            </div>
            <h2 className="text-xl font-bold font-['Outfit'] text-[#181411] tracking-tight">
              Sistem Onboarding Praktik Dapur: Day 1 & Day 2 (RnD)
            </h2>
            <p className="text-xs text-stone-500 font-['Plus_Jakarta_Sans'] mt-0.5 max-w-3xl">
              Perencanaan komprehensif timeline dapur, generator pembagian stasiun otomatis (21+ Produk SOP), 3 komparasi metode efisiensi, dan form penilaian QC 4 indikator.
            </p>
          </div>

          {/* Tombol Ekspor Spreadsheet & Print PDF */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSpreadsheet}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-['Outfit'] bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-sm active:scale-95"
              title="Download perencanaan lengkap dalam format Spreadsheet Excel / CSV"
            >
              <FileSpreadsheet size={15} />
              <span>Download Spreadsheet</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold font-['Outfit'] bg-white border border-[#E6E1DA] text-[#181411] hover:bg-stone-50 transition-all shadow-sm"
              title="Cetak lembar kerja praktik untuk Trainer & Kru"
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
              onClick={() => setSubSection('methods')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold font-['Outfit'] transition-all ${
                subSection === 'methods'
                  ? 'bg-[#96171B] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Compass size={15} />
              1. 3 Pilihan Metode & Alur
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
              2. Rundown Timeline (Day 1 & 2)
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
              3. Generator Stasiun (11-17 Kru)
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
              4. Form Penilaian 4-Indikator
            </button>
          </div>

          {/* Toggle Hari (Day 1 vs Day 2) */}
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
              Hari 2: Kulit, Minuman & Assembly
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================
          TAB 1: 3 PILIHAN METODE PRAKTIK ONBOARDING & ALUR DETAIL
          =================================================================== */}
      {subSection === 'methods' && (
        <div className="space-y-6">
          {/* Banner Rekomendasi Terpilih */}
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
                    Sesuai Preferensi Terpilih
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

          {/* Kartu 3 Opsi Metode Komparasi */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* OPSI 1: REKOMENDASI TERPILIH */}
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

                <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                  <div className="font-bold text-stone-800">Alur Waktu Per Batch (60 Mnt):</div>
                  <ul className="space-y-1.5 text-stone-600 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#96171B]"></span>
                      <strong>00:00 - 00:15:</strong> Demo Sentral Trainer di Meja Pass-Thru
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#96171B]"></span>
                      <strong>00:15 - 00:55:</strong> Praktik Serentak Mandiri Kru
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#96171B]"></span>
                      <strong>00:55 - 01:00:</strong> Plating & Sajikan ke Meja QC
                    </li>
                  </ul>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed">
                  <strong>Keunggulan:</strong> Efisiensi waktu 100%, tidak ada kru yang menganggur menunggu giliran, output langsung terukur di meja Gallery Walk.
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Kebutuhan Trainer: 2 Orang</span>
                <span className="font-bold text-[#96171B]">Efisiensi: 98%</span>
              </div>
            </div>

            {/* OPSI 2: METODE CAROUSEL (ROTASI STASIUN) */}
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
                  Peserta dibagi menjadi 4 kelompok kecil. Setiap kelompok berada di satu stasiun selama 25 menit lalu berotasi searah jarum jam saat bel timer berbunyi.
                </p>

                <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                  <div className="font-bold text-stone-800">Alur Waktu Per Rotasi:</div>
                  <ul className="space-y-1.5 text-stone-600 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                      <strong>Rotasi 1 (25 Mnt):</strong> Stasiun Fryer & Prep Ayam
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                      <strong>Rotasi 2 (25 Mnt):</strong> Stasiun Geprek & Sambal
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                      <strong>Rotasi 3 (25 Mnt):</strong> Stasiun Nasi, Teh & Side Dish
                    </li>
                  </ul>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                  <strong>Catatan Evaluasi:</strong> Kru mencoba lebih banyak menu, namun perpindahan stasiun memakan waktu pembersihan ulang dan butuh pengawasan ketat.
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Kebutuhan Trainer: 3 Orang</span>
                <span className="font-bold text-stone-700">Efisiensi: 82%</span>
              </div>
            </div>

            {/* OPSI 3: BUDDY SYSTEM (ASSEMBLY LINE BERPASANGAN) */}
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
                  Kru dipasangkan 2 orang per stasiun kerja: Kru A sebagai Prep Master (penimbangan & bumbu) dan Kru B sebagai Cook & Platter. Mereka berganti peran di Batch 2.
                </p>

                <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
                  <div className="font-bold text-stone-800">Pembagian Peran Buddy:</div>
                  <ul className="space-y-1.5 text-stone-600 text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                      <strong>Kru A (Prep Master):</strong> Kalibrasi gramatur & sanitasi
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                      <strong>Kru B (Chef & Platter):</strong> Eksekusi panas & penyajian
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                      <strong>Saling Koreksi:</strong> Kru A memvalidasi suhu core Kru B
                    </li>
                  </ul>
                </div>

                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-[11px] leading-relaxed">
                  <strong>Keunggulan:</strong> Sangat baik untuk membangun kekompakan tim rush hour dapur komersial dan mengurangi kecemasan kru pemula.
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Kebutuhan Trainer: 2 Orang</span>
                <span className="font-bold text-stone-700">Efisiensi: 88%</span>
              </div>
            </div>
          </div>

          {/* Panduan Eksekusi Langkah-Demi-Langkah Trainer */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)]">
            <h3 className="text-base font-bold font-['Outfit'] text-[#181411] mb-4 flex items-center gap-2">
              <ChefHat size={18} className="text-[#96171B]" />
              Panduan SOP Trainer Memimpin Praktik Paralel 11-17 Kru
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-2">
                <div className="w-7 h-7 rounded-lg bg-[#96171B] text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div className="font-bold text-xs text-[#181411]">Briefing & Kalibrasi (08:00-10:30)</div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Pastikan 4 SOP Fondasi dijelaskan tuntas. Cek suhu fryer stabil 175°C, chiller 1-4°C, dan timbangan digital sudah dikalibrasi nol (tare).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-2">
                <div className="w-7 h-7 rounded-lg bg-[#96171B] text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div className="font-bold text-xs text-[#181411]">Demo Kilat 15 Mnt (10:30-10:45)</div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Trainer mendemokan potongan ayam, ulek kasar sambal bawang, takaran air beras miyako, dan teknik siram minyak panas di depan seluruh peserta.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-2">
                <div className="w-7 h-7 rounded-lg bg-[#96171B] text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div className="font-bold text-xs text-[#181411]">Eksekusi Paralel (10:45-11:30)</div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Peserta serentak menuju stasiun masing-masing sesuai generator penugasan. Trainer mobile mengawasi APD, gramatur, dan waktu masak.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-2">
                <div className="w-7 h-7 rounded-lg bg-[#96171B] text-white flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div className="font-bold text-xs text-[#181411]">Gallery Walk & QC (11:30-12:00)</div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Semua produk dibawa ke meja pass-thru. Cek suhu core ayam (\u2265 74°C), audit rasa bersama kru, dan input skor ke Form 4-Indikator.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 2: JADWAL RUNDOWN PRAKTIK & TIMER COUNTDOWN
          =================================================================== */}
      {subSection === 'rundown' && (
        <div className="space-y-6">
          {/* Card Interaktif Timer & Status Sesi */}
          <div className="bg-gradient-to-r from-[#96171B] to-[#7A1215] text-white rounded-2xl p-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-rose-200 text-xs font-medium">
                  <Flame size={16} />
                  <span>MODUL WORKSHOP & PRAKTIK DAPUR INTENSIF</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px]">
                    {selectedDay === 'day1' ? 'HARI 1: FONDASI & GEPREK' : 'HARI 2: KULIT, BAR & CLOSING'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-['Outfit'] tracking-tight">
                  Sesi Aktif: {currentRundown[activeRundownIndex]?.title || 'Sesi Latihan'}
                </h3>
                <p className="text-xs text-rose-100/90 max-w-xl">
                  {currentRundown[activeRundownIndex]?.desc || 'Pilih sesi pada jadwal rundown di bawah.'}
                </p>
              </div>

              {/* Countdown Stopwatch */}
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
                    title={isTimerRunning ? 'Pause Timer' : 'Mulai Timer'}
                  >
                    {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(3600);
                    }}
                    className="w-10 h-10 rounded-lg bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-all"
                    title="Reset Timer 60 Menit"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Table Rundown */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl overflow-hidden shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)]">
            <div className="p-4 bg-[#FAF8F5] border-b border-[#E6E1DA] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold font-['Outfit'] text-[#181411]">
                  Jadwal Rundown {selectedDay === 'day1' ? 'Hari 1 (08:00 - 15:00)' : 'Hari 2 (08:00 - 15:30)'}
                </h3>
                <p className="text-xs text-stone-500">
                  Klik baris sesi untuk mengaktifkan pada panel instruktur dan stopwatch panggung.
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
                        title="Tandai Selesai"
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
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {step.deliverables.map((del, dIdx) => (
                            <span key={dIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-600">
                              <CheckCircle2 size={10} className="text-emerald-600" />
                              {del}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-end justify-between md:justify-center shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-stone-100">
                      <div className="text-[11px] font-semibold text-stone-400">
                        Penanggung Jawab:
                      </div>
                      <div className="text-xs font-bold text-stone-700 font-['Outfit']">
                        {step.trainer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 3: GENERATOR PEMBAGIAN STASIUN OTOMATIS (11-17 KRU)
          =================================================================== */}
      {subSection === 'generator' && (
        <div className="space-y-6">
          {/* Kontrol Kuota & Batch Tab */}
          <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold font-['Outfit'] text-[#181411]">
                  Generator Stasiun Otomatis (11 - 17 Kru)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Algoritma pembagian seimbang: setiap kru menerima 1 stasiun independen lengkap dengan spesifikasi SOP dan estimasi waktu.
                </p>
              </div>

              {/* Slider Kuota Kru 11 - 17 */}
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
                  title="Acak Rotasi Stasiun"
                >
                  <Shuffle size={13} />
                  <span>Acak</span>
                </button>
              </div>
            </div>

            {/* Sub-Tabs Batch 1 s.d. Batch 4 */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#E6E1DA]">
              <button
                onClick={() => setActiveBatchTab('batch1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['Outfit'] transition-all ${
                  activeBatchTab === 'batch1'
                    ? 'bg-[#96171B] text-white shadow-sm'
                    : 'bg-[#F4F1EC] text-stone-600 hover:text-stone-900'
                }`}
              >
                Day 1 • Batch 1: 10 Produk Fondasi Dapur
              </button>
              <button
                onClick={() => setActiveBatchTab('batch2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['Outfit'] transition-all ${
                  activeBatchTab === 'batch2'
                    ? 'bg-[#96171B] text-white shadow-sm'
                    : 'bg-[#F4F1EC] text-stone-600 hover:text-stone-900'
                }`}
              >
                Day 1 • Batch 2: 11 Menu Signature & Assembly
              </button>
              <button
                onClick={() => setActiveBatchTab('batch3')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['Outfit'] transition-all ${
                  activeBatchTab === 'batch3'
                    ? 'bg-[#96171B] text-white shadow-sm'
                    : 'bg-[#F4F1EC] text-stone-600 hover:text-stone-900'
                }`}
              >
                Day 2 • Batch 3: Kulit Crispy & Minuman Segar
              </button>
              <button
                onClick={() => setActiveBatchTab('batch4')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-['Outfit'] transition-all ${
                  activeBatchTab === 'batch4'
                    ? 'bg-[#96171B] text-white shadow-sm'
                    : 'bg-[#F4F1EC] text-stone-600 hover:text-stone-900'
                }`}
              >
                Day 2 • Batch 4: Bento Combo & Closing Sanitasi
              </button>
            </div>
          </div>

          {/* Grid Kartu Stasiun & Petugas Kru */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentAssignedStations.map((station, sIdx) => {
              const product = station.product;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-[#E6E1DA] rounded-2xl p-4 shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)] flex flex-col justify-between hover:border-amber-300 transition-all group"
                >
                  <div className="space-y-3">
                    {/* Header Stasiun */}
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

                    {/* Kru yang Bertugas */}
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
                        {station.trainees.length === 0 && (
                          <span className="text-xs text-stone-400 italic">Belum dialokasikan</span>
                        )}
                      </div>
                    </div>

                    {/* Titik Kritis SOP */}
                    <div className="space-y-1 text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                        Titik Kritis SOP:
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

                  {/* Footer Spesifikasi & Tindakan Penilaian Cepat */}
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
          TAB 4: FORM PENILAIAN PRAKTIK CEPAT 4 INDIKATOR
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
            {/* Kolom Kiri: Form Input Nilai Slider 4 Indikator */}
            <div className="lg:col-span-8 bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)] space-y-6">
              <div>
                <h3 className="text-base font-bold font-['Outfit'] text-[#181411]">
                  Lembar Penilaian QC Praktik (4 Indikator Presisi)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Audit langsung di Meja Pass-Thru atau Stasiun Kerja. Formula otomatis menghitung skor komposit (0 - 100 pt).
                </p>
              </div>

              {/* Selector Kru & Batch */}
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
                    <option value="Batch 1">Day 1 • Batch 1 (Fondasi)</option>
                    <option value="Batch 2">Day 1 • Batch 2 (Menu Signature)</option>
                    <option value="Batch 3">Day 2 • Batch 3 (Kulit & Minuman)</option>
                    <option value="Batch 4">Day 2 • Batch 4 (Bento & Closing)</option>
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
                    {scoringBatch === 'Batch 4' && BATCH_4_PRODUCTS.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Slider 4 Indikator */}
              <div className="space-y-5">
                {/* Indikator 1: Gramatur 30% */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Scale size={16} className="text-[#96171B]" />
                        <h4 className="text-xs font-bold font-['Outfit'] text-[#181411]">
                          1. Akurasi Gramatur Bahan Baku (Bobot 30%)
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Toleransi timbangan digital: Nasi 170g (+/- 5g), Sambal 30g, Bumbu ECO 20g, Potongan Ayam 110-120g.
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
                  <div className="flex justify-between text-[10px] text-stone-400 font-['JetBrains_Mono']">
                    <span>40 (Salah Besar)</span>
                    <span>75 (Batas Lulus)</span>
                    <span>100 (Presisi Sempurna)</span>
                  </div>
                </div>

                {/* Indikator 2: Suhu & Durasi 30% */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Thermometer size={16} className="text-amber-600" />
                        <h4 className="text-xs font-bold font-['Outfit'] text-[#181411]">
                          2. Ketepatan Suhu & Durasi Waktu (Bobot 30%)
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Deep fryer 175°C (12-14 mnt), suhu core ayam \u2265 74°C, tanak nasi 15 mnt, torching 15-20 dtk, griddle 1.5 mnt.
                      </p>
                    </div>
                    <span className="font-['JetBrains_Mono'] text-base font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
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
                  <div className="flex justify-between text-[10px] text-stone-400 font-['JetBrains_Mono']">
                    <span>40 (Mentah / Hangus)</span>
                    <span>75 (Suhu Tercapai)</span>
                    <span>100 (Suhu & Waktu Ideal)</span>
                  </div>
                </div>

                {/* Indikator 3: Platting & Rasa 25% */}
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
                        Kebersihan piring melamin, posisi timun 2 slice miring 45°, kerapihan bento sekat / bowl, uji rasa seimbang gurih pedas.
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
                  <div className="flex justify-between text-[10px] text-stone-400 font-['JetBrains_Mono']">
                    <span>40 (Berantakan / Encer)</span>
                    <span>75 (Standar HARA)</span>
                    <span>100 (Estetika Sempurna)</span>
                  </div>
                </div>

                {/* Indikator 4: Hygiene & Gallery Walk 15% */}
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
                        Kelengkapan APD celemek & hairnet, penggunaan 4 lap warna HARA dengan benar, kebersihan area kerja pasca-memasak.
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
                  <div className="flex justify-between text-[10px] text-stone-400 font-['JetBrains_Mono']">
                    <span>40 (Kotor / Tanpa APD)</span>
                    <span>75 (Patuh Standar)</span>
                    <span>100 (Disiplin HACCP)</span>
                  </div>
                </div>
              </div>

              {/* Catatan Feedback Trainer */}
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

              {/* Tombol Simpan */}
              <button
                onClick={handleSaveEvaluation}
                className="w-full py-3 rounded-xl bg-[#96171B] text-white font-bold font-['Outfit'] text-xs hover:bg-[#7A1215] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-[0.99]"
              >
                <FileCheck size={16} />
                <span>Simpan Penilaian Praktik ({selectedTraineeForScoring})</span>
              </button>
            </div>

            {/* Kolom Kanan: Summary Skor & Riwayat Penilaian */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card Kalkulator Skor Akhir */}
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

                {/* Breakdown Komponen */}
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

                {/* Status Kelulusan */}
                <div className={`p-3 rounded-xl border text-xs font-medium leading-relaxed ${
                  finalCalculatedScore >= 75
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <div className="font-bold mb-0.5 flex items-center gap-1.5">
                    {finalCalculatedScore >= 75 ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                    {finalCalculatedScore >= 75 ? 'STATUS: MEMENUHI STANDAR (LULUS)' : 'STATUS: WAJIB REMEDIAL PRAKTIK'}
                  </div>
                  {finalCalculatedScore >= 75
                    ? 'Peserta telah memenuhi kualifikasi standar SOP produk dan siap melanjutkan ke rotasi stasiun berikutnya.'
                    : 'Skor komposit di bawah batas kelulusan minimal (75 pt). Peserta wajib mengikuti simulasi ulang stasiun ini.'}
                </div>
              </div>

              {/* Riwayat Penilaian Sesi Ini */}
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
