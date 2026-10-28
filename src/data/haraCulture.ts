import { Division, HaraCultureValueItem } from '../types';

export const HARA_ABOUT = {
  nama: 'HARA Chicken',
  akronim: 'Harapan Rakyat',
  deskripsi: 'Menyajikan produk ayam tepung krispi dan geprek sebagai pelopor geprek modern.',
  tagline: '#BeneranDiGeprek',
  taglineDesc: 'Tagline sekaligus keunggulan HARA Chicken dibanding produk ayam geprek kompetitor.',
  sloganBudaya: 'H.A.R.A bukan sekadar nama — melainkan cara kami bekerja, melayani, dan tumbuh bersama: Bekerja Halal. Bertindak Amanah. Bergerak Responsif. Berkembang Adaptif.',
};

export const HARA_VISION =
  'Menjadi Pelopor Ayam Geprek Tradisional Berkelas Nasional yang dikelola secara Modern dan Profesional dengan Cita Rasa Autentik, Kualitas Terjamin dan Pelayanan Terbaik.';

export const HARA_MISSION: { no: number; text: string }[] = [
  {
    no: 1,
    text: 'Menjaga kepuasan pelanggan & mitra usaha melalui produk dan layanan yang berkualitas, higienis, serta terpercaya.',
  },
  {
    no: 2,
    text: 'Mendorong inovasi berkelanjutan untuk meningkatkan nilai tambah, efisiensi, dan daya saing di seluruh rantai bisnis.',
  },
  {
    no: 3,
    text: 'Meningkatkan kesejahteraan dan produktivitas karyawan melalui lingkungan kerja yang kondusif dan kolaboratif.',
  },
  {
    no: 4,
    text: 'Beradaptasi terhadap perubahan zaman agar dapat terus tumbuh, relevan, dan mampu memperluas manfaat bagi masyarakat di seluruh Indonesia.',
  },
];

export const HARA_VALUES: HaraCultureValueItem[] = [
  {
    key: 'H',
    name: 'Halal',
    tagline: 'Bekerja Halal',
    description:
      'Kami bekerja dengan hati yang tulus dan metode yang tepat. Setiap produk, proses, dan keputusan pasti membawa berkah.',
    behaviors: [
      'Mengutamakan bahan baku halal dan berkualitas tinggi.',
      'Menjaga kebersihan dapur, peralatan, dan area pelayanan secara disiplin.',
      'Menjalankan bisnis dengan integritas & berorientasi pada keberlanjutan.',
    ],
  },
  {
    key: 'A1',
    name: 'Amanah',
    tagline: 'Bertindak Amanah',
    description:
      'Kepercayaan adalah aset utama kami. Apa pun yang kami pegang, kami jaga dengan penuh tanggung jawab dan integritas.',
    behaviors: [
      'Menepati janji dan komitmen standar SOP perusahaan.',
      'Bekerja dengan penuh tanggung jawab, kejujuran penimbangan, dan transparansi kas.',
      'Menjaga reputasi dan nama baik HARA Chicken di setiap tindakan.',
    ],
  },
  {
    key: 'R',
    name: 'Responsif',
    tagline: 'Bergerak Responsif',
    description:
      'Kami responsif, tangkas, dan peduli. Kami merespons kebutuhan pelanggan dan tantangan bisnis dengan tindakan cepat dan solusi nyata.',
    behaviors: [
      'Memberi pelayanan cepat, sopan, dan solutif (Speed of Service < 90 detik).',
      'Aktif menanggapi masukan pelanggan serta sigap mengatasi antrean jam sibuk.',
      'Berorientasi teguh pada hasil rasa terbaik dan kepuasan pelanggan.',
    ],
  },
  {
    key: 'A2',
    name: 'Adaptif',
    tagline: 'Berkembang Adaptif',
    description:
      'Kami terus belajar dan berani berubah. Dunia bergerak cepat — dan kami tumbuh seiring setiap perubahan.',
    behaviors: [
      'Terbuka terhadap ide baru & perbaikan berkelanjutan (continuous improvement).',
      'Menggunakan teknologi dan sistem terpadu untuk meningkatkan efisiensi outlet.',
      'Siap berubah demi pertumbuhan perusahaan & kesejahteraan bersama.',
    ],
  },
];

export interface OfficialJobdeskDetail {
  id: Division;
  title: string;
  subtitle: string;
  tagline: string;
  focusArea: string;
  criticalParameters: string[];
  kpiTarget: string;
  safetyHaccp: string;
}

export const HARA_OFFICIAL_JOBDESKS: Record<Division, OfficialJobdeskDetail> = {
  Kitchen: {
    id: 'Kitchen',
    title: 'Stasiun Kitchen (Fryer & Marinasi)',
    subtitle: 'Penepungan Krispi Emas & Suhu Penggorengan Presisi',
    tagline: 'Kerenyahan Emas Autentik',
    focusArea: 'Marinasi bumbu meresap, penepungan keriting rapi, penggorengan deep fryer 170°C, kematangan tulang sempurna.',
    criticalParameters: [
      'Suhu minyak deep fryer stabil di 170°C ± 2°C',
      'Waktu penepungan 2x celup air es & ayakan keriting',
      'Durasi penggorengan ayam 12-14 menit sesuai potongan',
      'Suhu internal daging ayam matang minimal 74°C (Food Safety)',
      'Penirisan minyak minimal 3 menit sebelum masuk warmer cabinet',
    ],
    kpiTarget: 'Tingkat kematangan 100%, Tekstur keriting seragam, Zero-waste minyak gosong',
    safetyHaccp: 'HACCP CCP-1: Suhu batas aman penggorengan & eliminasi patogen daging',
  },
  Kasir: {
    id: 'Kasir',
    title: 'Stasiun Kasir & Front House',
    subtitle: 'Pelayanan Ramah, Sigap & Ketepatan Transaksi POS',
    tagline: 'Senyum, Cepat & Amanah',
    focusArea: 'Salam sapa hangat, kecepatan input transaksi kasir POS, akurasi pesanan meja, rekonsiliasi kas harian.',
    criticalParameters: [
      'Kecepatan transaksi POS < 90 detik per pelanggan',
      'Salam 3S (Senyum, Salam, Sapa) saat pelanggan datang',
      'Ketepatan konfirmasi ulang menu pesanan & level pedas',
      'Pemberian struk resmi dan rekonsiliasi kas akhir shift selisih Rp 0',
      'Kebersihan meja kasir dan kesiapan uang kembalian',
    ],
    kpiTarget: 'Speed of Service (SOS) < 90 detik, Akurasi pesanan 99.8%, Customer rating > 4.8',
    safetyHaccp: 'Prosedur higienitas tangan kasir & pemisahan area penanganan uang fisik dengan makanan',
  },
  Geprek: {
    id: 'Geprek',
    title: 'Stasiun Geprek (#BeneranDiGeprek)',
    subtitle: 'Racikan Cabai Segar & Ulekan Tradisional Autentik',
    tagline: '#BeneranDiGeprek Autentik',
    focusArea: 'Racikan cabai segar terstandar, teknik uleg geprek meresap, gramasi bumbu bawang garam, konsistensi level pedas.',
    criticalParameters: [
      'Cabai rawit merah & hijau pilihan segar tanpa tangkai busuk',
      'Gramasi cabai standar per level (Level 1: 3 cabai, Level 3: 7 cabai, Level 5: 12 cabai)',
      'Teknik #BeneranDiGeprek: ayam remuk pas hingga bumbu merasuk tanpa hancur berantakan',
      'Minyak panas siram sambal beraroma bawang gurih khas HARA',
      'Kebersihan cobek, ulekan batu, dan sarung tangan sanitasi',
    ],
    kpiTarget: 'Konsistensi level pedas 100%, Penyajian geprek panas gurih, Waktu geprek < 45 detik',
    safetyHaccp: 'HACCP CCP-2: Kualitas cabai segar bebas pestisida & sterilisasi cobek ulek',
  },
  Helper: {
    id: 'Helper',
    title: 'Stasiun Helper & Sanitasi Outlet',
    subtitle: 'Persiapan Bahan, Cuci Alat & Kebersihan Lingkungan Outlet',
    tagline: 'Penyokong Utama Kelancaran Outlet',
    focusArea: 'Pencucian alat kerja (3 bak cuci), penyiapan bahan pendukung, kebersihan meja santap & lantai, kelancaran logistik stasiun.',
    criticalParameters: [
      'Sanitasi alat dengan metode 3 bak: Sabun, Bilas Bersih, Sanitizer Desinfektan',
      'Kesiapan stok piring saji, mangkuk sambal, dan kertas bungkus higienis',
      'Meja santap pelanggan bersih dan disemprot sanitizer dalam < 60 detik pasca tamu selesai',
      'Pengelolaan limbah dapur rapi, tempat sampah tertutup, dan lantai anti-licin',
      'Kesiapan pasokan bumbu dapur ke stasiun Kitchen dan Geprek sebelum jam sibuk',
    ],
    kpiTarget: 'Kesiapan logistik 100% sebelum peak rush, Zero-cross contamination, Audit kebersihan 5S > 90%',
    safetyHaccp: 'HACCP CCP-3: Standar klorinasi air pencucian & pencegahan kontaminasi silang alat',
  },
};
