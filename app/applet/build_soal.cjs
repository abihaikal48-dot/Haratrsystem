const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, 'src/data/bankSoalMingguan.ts');

function createWeekQuestions(week, weekNomor) {
  const prefix = 'M' + weekNomor;
  
  // 16 SOAL KASIR (MURNI KASIR, POS ESB, HANDLING COMPLAIN, EDC, SETTLEMENT, REKAPAN)
  const kasir = [
    {
      id: prefix + '-KAS-01',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Standar Greeting 5S & Sambutan Tamu',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-KAS-01',
      pertanyaan: 'Berdasarkan SOP HC-SOP-KAS-01, bagaimana kalimat standar greeting 5S yang wajib diucapkan kasir saat pelanggan mendekati meja kasir?',
      opsi: [
        { label: 'A', teks: '"Mau pesan apa kak? Langsung sebutkan pesanannya ya."' },
        { label: 'B', teks: '"Selamat datang di Hara Chicken! Selamat pagi/siang/sore kak, ada yang bisa kami bantu?" (dengan senyum ramah dan kontak mata tulus)' },
        { label: 'C', teks: '"Silakan langsung scan QRIS di meja jika tidak bawa uang tunai kak."' },
        { label: 'D', teks: '"Tunggu sebentar ya kak, saya sedang input data closing shift."' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'SOP Greeting Kasir mewajibkan senyum 5S, suara antusias jelas, kontak mata, dan menyapa tamu dengan ramah.',
      bobot: 4
    },
    {
      id: prefix + '-KAS-02',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Standar Taking Order di POS ESB Lite',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KAS-02',
      pertanyaan: 'Saat proses Taking Order di sistem POS ESB Lite (HC-SOP-KAS-02), apa langkah awal yang wajib ditanyakan kasir sebelum memilih menu pesanan?',
      opsi: [
        { label: 'A', teks: 'Langsung meminta uang pembayaran tunai di muka.' },
        { label: 'B', teks: 'Menanyakan apakah makan di tempat (Dine In) atau dibungkus pulang (Take Away), lalu menanyakan nomor meja jika dine in.' },
        { label: 'C', teks: 'Langsung mencetak struk sementara sebelum memilih menu.' },
        { label: 'D', teks: 'Meminta pelanggan menuliskan sendiri pesanannya di kertas nota.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Identifikasi Dine In atau Take Away di awal krusial karena menentukan format platting, packing, serta fasilitas refill Hara Extra.',
      bobot: 4
    },
    {
      id: prefix + '-KAS-03',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Standar Repeat Order & Verifikasi Nominal',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-KAS-03',
      pertanyaan: 'Mengapa tahap Repeat Order (HC-SOP-KAS-03) wajib dilakukan kasir sebelum memproses pembayaran pelanggan?',
      opsi: [
        { label: 'A', teks: 'Hanya untuk mengulur waktu antrean agar dapur tidak terburu-buru.' },
        { label: 'B', teks: 'Untuk memastikan tidak ada salah input menu, varian sambal, atau jumlah pesanan, serta mengonfirmasi nominal tagihan yang harus dibayar.' },
        { label: 'C', teks: 'Agar kasir terlihat sibuk di depan pelanggan.' },
        { label: 'D', teks: 'Hanya diwajibkan jika pesanan bernilai lebih dari Rp500.000.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Repeat Order mencegah salah produksi di kitchen/geprek, meminimalkan void transaksi, dan memberikan kepastian nominal kepada tamu.',
      bobot: 4
    },
    {
      id: prefix + '-KAS-04',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Handling Complain Pelanggan (Metode L.A.S.T)',
      pilar_kompetensi: 'karakter_integritas',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KAS-04',
      pertanyaan: 'Jika ada pelanggan komplain di meja kasir karena pesanan belum keluar, langkah penanganan yang tepat sesuai metode L.A.S.T adalah:',
      opsi: [
        { label: 'A', teks: 'Menyalahkan staf kitchen di hadapan pelanggan agar kasir tidak dimarahi.' },
        { label: 'B', teks: 'Dengarkan (Listen) keluhan tanpa memotong, Minta maaf (Apologize) dengan tulus, Beri solusi (Solve) dengan mengecek ke stasiun kerja, dan Ucapkan terima kasih (Thank) atas masukannya.' },
        { label: 'C', teks: 'Menyuruh pelanggan menunggu tenang dan tidak perlu banyak bertanya.' },
        { label: 'D', teks: 'Meninggalkan meja kasir untuk bersembunyi di gudang belakang.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Metode L.A.S.T (Listen, Apologize, Solve, Thank) adalah standar baku penanganan keluhan secara profesional dan berempati.',
      bobot: 4
    },
    {
      id: prefix + '-KAS-05',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Layanan Pesanan Aplikasi Online (APK)',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KAS-05',
      pertanyaan: 'Saat melayani driver ojek online (Grab/Gojek/ShopeeFood) berdasarkan HC-SOP-KAS-05, apa prosedur verifikasi yang benar?',
      opsi: [
        { label: 'A', teks: 'Langsung memberikan pesanan apa saja yang sudah siap di etalase tanpa mencocokkan nomor order.' },
        { label: 'B', teks: 'Cek nomor ID order dan nama pemesan pada ponsel driver, cocokkan dengan tiket pesanan di POS, dan sapa driver dengan ramah.' },
        { label: 'C', teks: 'Meminta driver membayar tunai meskipun di aplikasi tercatat non-tunai.' },
        { label: 'D', teks: 'Menyuruh driver menunggu di luar gerbang outlet tanpa kejelasan waktu.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Verifikasi ID pesanan online dan perlakuan ramah pada mitra driver memastikan pesanan tidak tertukar dan menjaga citra brand.',
      bobot: 4
    },
    {
      id: prefix + '-KAS-06',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Repeat Order & Handover APK Online',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-KAS-06',
      pertanyaan: 'Berdasarkan HC-SOP-KAS-06, sebelum kantong plastik diserahkan dan di-stapler untuk driver online, apa yang wajib dicek kasir?',
      opsi: [
        { label: 'A', teks: 'Hanya menghitung jumlah boks tanpa memeriksa isinya.' },
        { label: 'B', teks: 'Kelengkapan item menu, tingkat kepedasan sambal, minuman dingin/panas, sendok cutleries, dan nota fisik yang tertempel rapi.' },
        { label: 'C', teks: 'Meminta tip uang tunai kepada driver.' },
        { label: 'D', teks: 'Mengurangi porsi sambal agar hemat bahan.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Pengecekan final item, sambal, minuman, sendok, dan nota fisik mencegah komplain pesanan kurang (missing items) di aplikasi online.',
      bobot: 4
    },
    {
      id: prefix + '-KAS-07',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Laporan Penjualan Harian & Rekapan Shift',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KAS-07',
      pertanyaan: 'Pada proses Rekapan Penjualan Harian (HC-SOP-KAS-07), bagaimana cara kasir memverifikasi keakuratan uang kas shift?',
      opsi: [
        { label: 'A', teks: 'Cukup mengira-ngira ketebalan gepokan uang tanpa menghitung lembar per lembar.' },
        { label: 'B', teks: 'Hitung fisik uang tunai laci (cash count), cocokkan totalnya dengan laporan ringkasan POS ESB Lite, dan pisahkan modal awal kas (cash float).' },
        { label: 'C', teks: 'Menyimpan kelebihan uang ke kantong pribadi tanpa melapor.' },
        { label: 'D', teks: 'Mengubah angka penjualan di sistem agar sama dengan uang yang ada di laci.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Cash count lembar per lembar, pemisahan modal kas awal, dan pencocokan dengan ringkasan sistem adalah SOP baku akuntabilitas kasir.',
      bobot: 4
    },
    {
      id: prefix + '-KAS-08',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Stock Opname Perlengkapan & Kemasan Kasir',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KAS-08',
      pertanyaan: 'Sesuai HC-SOP-KAS-08, perlengkapan apa saja di area kasir yang wajib dihitung fisiknya (Stock Opname) setiap pergantian shift?',
      opsi: [
        { label: 'A', teks: 'Hanya sapu dan alat pel lantai.' },
        { label: 'B', teks: 'Paper bag/plastik take away, boks makanan, cup minuman, roll kertas struk POS, sedotan, dan sendok plastik.' },
        { label: 'C', teks: 'Panci wok kitchen dan minyak deep fryer.' },
        { label: 'D', teks: 'Hanya uang koin di laci kasir.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Stock opname kemasan kasir memastikan ketersediaan bahan packing dan mendeteksi pemborosan atau kehilangan packaging.',
      bobot: 4
    },
    {
      id: prefix + '-KAS-09',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Prosedur Setoran Kas Hasil Penjualan',
      pilar_kompetensi: 'peraturan_perusahaan',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KAS-09',
      pertanyaan: 'Berdasarkan HC-SOP-KAS-09 dan regulasi keuangan, bagaimana prosedur penyetoran uang kas penjualan tunai outlet?',
      opsi: [
        { label: 'A', teks: 'Dititipkan ke rekening pribadi kasir lalu ditransfer minggu depan.' },
        { label: 'B', teks: 'Disetorkan secara tertib ke rekening resmi perusahaan sesuai jadwal, bukti setor (slip/struk CDM) disimpan dan diunggah ke grup pelaporan resmi.' },
        { label: 'C', teks: 'Dipinjamkan terlebih dahulu untuk keperluan pribadi kru yang membutuhkan uang mendadak.' },
        { label: 'D', teks: 'Dibiarkan menumpuk di laci kasir hingga akhir bulan.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Penyetoran ke rekening resmi perusahaan beserta unggah bukti setor adalah aturan mutlak kepatuhan perbankan & zero-fraud.',
      bobot: 4
    },
    {
      id: prefix + '-KAS-10',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Prosedur Penanganan Selisih Kas (Over/Short)',
      pilar_kompetensi: 'peraturan_perusahaan',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'SOP/FAT/44',
      pertanyaan: 'Jika saat closing shift ditemukan selisih kas fisik kurang (short) sebesar Rp10.000, tindakan apa yang wajib diambil sesuai SOP/FAT/44?',
      opsi: [
        { label: 'A', teks: 'Memanipulasi struk nota agar angka seimbang.' },
        { label: 'B', teks: 'Catat selisih secara transparan di berita acara serah terima kasir, laporkan ke Kepala Outlet/SPV, dan kasir bertugas bertanggung jawab sesuai regulasi.' },
        { label: 'C', teks: 'Mengambil uang kas kecil operasional tanpa izin untuk menutup selisih.' },
        { label: 'D', teks: 'Menyembunyikan laporan closing dari trainer dan supervisor.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Transparansi selisih kas dan berita acara resmi menjamin integritas. Memanipulasi laporan adalah pelanggaran berat.',
      bobot: 4
    },
    {
      id: prefix + '-KAS-11',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Otorisasi Void / Pembatalan Transaksi',
      pilar_kompetensi: 'peraturan_perusahaan',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KAS-02',
      pertanyaan: 'Kapan seorang kasir diperbolehkan melakukan Void (pembatalan nota yang sudah dicetak) di POS ESB Lite?',
      opsi: [
        { label: 'A', teks: 'Kapan saja kasir ingin membatalkan transaksi tanpa persetujuan siapa pun.' },
        { label: 'B', teks: 'Hanya setelah mendapat otorisasi dan PIN Supervisor/Kepala Outlet, dengan alasan pembatalan jelas (misal tamu batal pesan) dan nota fisik dilampirkan.' },
        { label: 'C', teks: 'Setiap kali kasir salah menyebutkan nama menu kepada tamu.' },
        { label: 'D', teks: 'Tidak boleh pernah dilakukan pembatalan dalam kondisi apa pun.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Void wajib diotorisasi atasan berwenang dengan melampirkan nota asli fisik untuk mencegah potensi manipulasi penjualan.',
      bobot: 4
    },
    {
      id: prefix + '-KAS-12',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Standar Transaksi Non-Tunai (QRIS & EDC)',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-KAS-02',
      pertanyaan: 'Saat pelanggan membayar via QRIS statis/dinamis, kapan kasir boleh menyerahkan pesanan dan struk resmi ke pelanggan?',
      opsi: [
        { label: 'A', teks: 'Saat pelanggan baru membuka aplikasi m-banking di ponselnya.' },
        { label: 'B', teks: 'Setelah melihat sendiri layar notifikasi "BERHASIL" di ponsel pelanggan dengan tanggal, jam, nominal tepat, atau mutasi sukses di POS.' },
        { label: 'C', teks: 'Langsung percaya begitu pelanggan berkata uangnya sudah terpotong tanpa melihat bukti layar.' },
        { label: 'D', teks: 'Kapan saja pelanggan meminta terburu-buru.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Verifikasi visual layar sukses QRIS (nominal, nama merchant Hara Chicken, tanggal jam) wajib dipastikan sebelum makanan diserahkan.',
      bobot: 4
    },
    {
      id: prefix + '-KAS-13',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Teknik Upselling & Rekomendasi Menu',
      pilar_kompetensi: 'visi_misi_hara',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-KAS-02',
      pertanyaan: 'Contoh kalimat Upselling yang ramah dan tepat saat tamu memesan 1 Paket Ayam Krispi Nasi adalah:',
      opsi: [
        { label: 'A', teks: '"Cuma pesan satu itu saja kak? Nggak mau beli yang mahal?"' },
        { label: 'B', teks: '"Baik kak, mau sekalian ditambah Telur Dadar krispi atau Terong Krispi dan es teh manis jumbo untuk pelengkapnya kak?"' },
        { label: 'C', teks: '"Harus beli paket kombo ya kak, paket satuan tidak boleh."' },
        { label: 'D', teks: '"Kalau tidak pesan minum tidak bisa dapat promo free refill."' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Upselling menawarkan menu ekstra/pelengkap secara sopan dan menggugah selera meningkatkan rata-rata penjualan (APC).',
      bobot: 4
    },
    {
      id: prefix + '-KAS-14',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Deteksi Uang Tunai Palsu (Metode 3D)',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KAS-01',
      pertanyaan: 'Jika kasir menerima uang pecahan Rp100.000 yang mencurigakan saat transaksi tunai, bagaimana sikap yang benar?',
      opsi: [
        { label: 'A', teks: 'Berteriak di depan umum bahwa pelanggan membawa uang palsu.' },
        { label: 'B', teks: 'Lakukan pemeriksaan 3D (Dilihat tanda air, Diraba tekstur kasar, Diterawang benang pengaman), dan jika tidak sah, sampaikan secara sopan untuk meminta pecahan lain.' },
        { label: 'C', teks: 'Langsung merobek uang tersebut di depan pelanggan.' },
        { label: 'D', teks: 'Menerimanya saja agar tidak berdebat dengan pelanggan.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Pemeriksaan 3D secara profesional dan santun melindungi kas outlet dari uang palsu tanpa mempermalukan pelanggan.',
      bobot: 4
    },
    {
      id: prefix + '-KAS-15',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kasir - Standar Speed of Service (SOS) Kasir',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-KAS-02',
      pertanyaan: 'Berapa batas waktu standar Speed of Service (SOS) di meja kasir mulai dari greeting hingga cetak struk untuk pesanan reguler?',
      opsi: [
        { label: 'A', teks: '10 menit per pelanggan.' },
        { label: 'B', teks: 'Maksimal 60 - 90 detik per transaksi pelanggan.' },
        { label: 'C', teks: 'Bebas berapa lama pun kasir ingin mengobrol.' },
        { label: 'D', teks: '5 menit per pelanggan.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Kecepatan transaksi kasir 60-90 detik menjaga antrean tetap mengalir lancar saat jam sibuk (rush hour).',
      bobot: 4
    },
    {
      id: prefix + '-KAS-16',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kasir',
      tipe: 'ESSAY_HOTS',
      topik: 'Kasir - Studi Kasus Closing Kas & Selisih Kas Kecil',
      pilar_kompetensi: 'peraturan_perusahaan',
      tingkat_kesulitan: 'Sulit',
      kode_sop: 'SOP/FAT/44',
      pertanyaan: 'Studi Kasus: Saat Anda melakukan closing shift 2 di POS ESB Lite, tercatat total penjualan tunai sistem Rp1.850.000, namun setelah dihitung fisik di laci kasir hanya terkumpul Rp1.825.000 (selisih minus Rp25.000). Jelaskan secara runtut langkah prosedural yang harus Anda ambil sesuai SOP/FAT/44 dan bagaimana Anda menerapkan nilai Amanah!',
      kata_kunci_essay: ['hitung ulang', 'berita acara', 'lapor kepala outlet', 'pos esb', 'amanah', 'jujur', 'tanggung jawab'],
      pembahasan_sop: 'Langkah baku: 1) Hitung ulang fisik kas dan cek nota manual/void, 2) Lapor ke Kepala Outlet/SPV, 3) Catat riil di lembar serah terima tanpa memanipulasi POS, 4) Pertanggungjawabkan selisih sesuai regulasi.',
      bobot: 10
    }
  ];

  // 16 SOAL KITCHEN (MURNI KITCHEN: SOP NASGOR TERBARU, SUHU FRYER 160C 12 MENIT, THAWING, MARINASI, TEPUNG KRISPI)
  const kitchen = [
    {
      id: prefix + '-KIT-01',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - SOP Nasi Goreng Terbaru (Takaran Bumbu Eco & Minyak)',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-KIT-05',
      pertanyaan: 'Berdasarkan SOP Nasi Goreng resmi revisi terbaru (HC-SOP-KIT-05), berapa takaran baku Bumbu Eco dan minyak goreng untuk memasak 1 porsi Nasi Goreng?',
      opsi: [
        { label: 'A', teks: 'Bumbu Eco 10 gr dan minyak goreng 30 ml.' },
        { label: 'B', teks: 'Bumbu Eco 20 gr dan minyak goreng 15 ml (1 sendok makan).' },
        { label: 'C', teks: 'Bumbu Eco 35 gr dan minyak goreng 50 ml.' },
        { label: 'D', teks: 'Bumbu Eco secukupnya tanpa perlu ditimbang.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Formula baku SOP Nasi Goreng terbaru: Bumbu Eco 20 gr, Minyak 15 ml (1 sdm) untuk 1 cup nasi pulen dingin.',
      bobot: 4
    },
    {
      id: prefix + '-KIT-02',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - SOP Nasi Goreng Terbaru (Saos Ricebowl & Minyak Wijen)',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-KIT-05',
      pertanyaan: 'Sesuai SOP HC-SOP-KIT-05, berapa takaran Saos Ricebowl dan Minyak Wijen yang dimasukkan ke dalam masakan Nasi Goreng 1 porsi?',
      opsi: [
        { label: 'A', teks: 'Saos Ricebowl 50 gr dan Minyak Wijen 1 sendok makan penuh.' },
        { label: 'B', teks: 'Saos Ricebowl 15 gr (1 sdm) dan Minyak Wijen 2 tetes.' },
        { label: 'C', teks: 'Saos Ricebowl 5 gr tanpa menggunakan minyak wijen.' },
        { label: 'D', teks: 'Kecap manis biasa 20 gr dan margarin 10 gr.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Poin kritis rasa Nasi Goreng Hara: Saos Ricebowl 15 gr (1 sdm) dan Minyak Wijen 2 tetes diaduk merata di akhir.',
      bobot: 4
    },
    {
      id: prefix + '-KIT-03',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - SOP Nasi Goreng Terbaru (Bawang Putih & Mix Vegetable)',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KIT-05',
      pertanyaan: 'Bagaimana urutan dan takaran penumisan bahan awal Nasi Goreng menurut SOP HC-SOP-KIT-05?',
      opsi: [
        { label: 'A', teks: 'Langsung masukkan nasi dan bumbu eco ke wajan dingin tanpa minyak.' },
        { label: 'B', teks: 'Panaskan wajan dengan 15 ml minyak, tumis 1/2 siung besar atau 1 siung kecil bawang putih geprek sampai harum, lalu masukkan 30 gr (2 sdm) mix vegetable tumis sebentar.' },
        { label: 'C', teks: 'Goreng mix vegetable dalam deep fryer lalu tiriskan ke nasi.' },
        { label: 'D', teks: 'Rebus bawang putih dan mix vegetable di air mendidih terlebih dahulu.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Tumis bawang putih geprek harum dengan 15 ml minyak, lalu 30 gr mix vegetable sebelum memasukkan 1 cup nasi pulen dingin.',
      bobot: 4
    },
    {
      id: prefix + '-KIT-04',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - SOP Nasi Goreng Terbaru (Waktu Masak & Standar Api)',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-KIT-05',
      pertanyaan: 'Berapa standar durasi waktu memasak dan intensitas api kompor pada pembuatan 1 porsi Nasi Goreng (HC-SOP-KIT-05)?',
      opsi: [
        { label: 'A', teks: '10-15 menit dengan api sangat kecil.' },
        { label: 'B', teks: '3-4 menit per porsi dengan api sedang.' },
        { label: 'C', teks: '1 menit dengan api super besar sampai beras gosong.' },
        { label: 'D', teks: 'Bebas tergantung kru kitchen sedang santai atau terburu-buru.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Standar waktu masak: 3-4 menit per porsi dengan api sedang agar bumbu meresap sempurna dan nasi tidak kering gosong.',
      bobot: 4
    },
    {
      id: prefix + '-KIT-05',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - SOP Telur Dadar Pelengkap Nasi Goreng',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-KIT-06',
      pertanyaan: 'Sesuai SOP HC-SOP-KIT-06, bagaimana takaran dan standar penggorengan Telur Dadar pelengkap sajian Nasi Goreng?',
      opsi: [
        { label: 'A', teks: '2 butir telur tanpa garam digoreng mentah.' },
        { label: 'B', teks: 'Pecahkan 1 butir telur ayam segar, tambahkan 1/2 sendok takar (1 gram) mix garam, kocok berbusa halus, goreng minyak 50 ml api sedang hingga keemasan.' },
        { label: 'C', teks: 'Rebus telur dengan cangkangnya lalu dikupas.' },
        { label: 'D', teks: 'Gunakan telur asin yang sudah matang.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: '1 butir telur segar dikocok berbusa dengan 1 gram mix garam, digoreng matang keemasan gurih di atas wajan panas.',
      bobot: 4
    },
    {
      id: prefix + '-KIT-06',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - Standar Suhu Minyak Deep Fryer',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-KIT-01',
      pertanyaan: 'Berapa suhu standar minyak goreng pada Deep Fryer untuk menggoreng ayam krispi Hara Chicken?',
      opsi: [
        { label: 'A', teks: '100°C - 110°C (suhu air mendidih)' },
        { label: 'B', teks: '160°C - 170°C (stabil terkalibrasi termometer)' },
        { label: 'C', teks: '220°C - 250°C (minyak berasap pekat)' },
        { label: 'D', teks: '50°C (minyak hangat kuku)' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Suhu stabil deep fryer 160°C - 170°C wajib dijaga agar kulit ayam renyah keriting dan daging matang hingga ke tulang.',
      bobot: 4
    },
    {
      id: prefix + '-KIT-07',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - Standar Durasi Penggorengan Ayam Krispi',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-KIT-01',
      pertanyaan: 'Berapa durasi waktu penggorengan ayam krispi di deep fryer agar matang sempurna tanpa ada darah di tulang?',
      opsi: [
        { label: 'A', teks: '5 menit' },
        { label: 'B', teks: '12 - 14 menit (dengan timer otomatis)' },
        { label: 'C', teks: '25 - 30 menit' },
        { label: 'D', teks: '3 menit' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Durasi baku 12 - 14 menit pada suhu 160°C menjamin core temp daging ayam mencapai minimal 74°C dan bebas darah.',
      bobot: 4
    },
    {
      id: prefix + '-KIT-08',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - Teknik Flouring / Penepungan Ayam Krispi',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KIT-02',
      pertanyaan: 'Bagaimana teknik penepungan (flouring) yang benar untuk menghasilkan keriting krispi Hara yang mekar dan tidak keras?',
      opsi: [
        { label: 'A', teks: 'Ditekan dan dikepal sekuat tenaga hingga tepung memadat keras seperti batu.' },
        { label: 'B', teks: '10x aduk memutar lembut di tepung, celup keranjang air es 3-5 detik, angkat tiriskan, 10x cubit kibas ringan hingga terbentuk keriting alami.' },
        { label: 'C', teks: 'Cukup dicelupkan ke air tepung cair tanpa tepung kering.' },
        { label: 'D', teks: 'Tepung dicampur air panas mendidih di baskom.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Teknik aduk memutar, celup air es, dan cubit kibas ringan menghasilkan tekstur keriting mekar renyah tahan lama.',
      bobot: 4
    },
    {
      id: prefix + '-KIT-09',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - Prosedur Thawing Ayam Beku',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KIT-03',
      pertanyaan: 'Bagaimana prosedur Thawing (pencairan ayam beku dari freezer) yang benar sesuai standar food safety HACCP?',
      opsi: [
        { label: 'A', teks: 'Direndam dalam baskom berisi air panas atau dijemur di bawah terik matahari.' },
        { label: 'B', teks: 'Pindahkan ayam beku dari freezer (-18°C) ke chiller (0°C s.d. 4°C) selama 12-24 jam hingga es mencair sempurna tanpa bakteri berkembang biak.' },
        { label: 'C', teks: 'Langsung digoreng ke dalam minyak deep fryer dalam kondisi masih membatu es.' },
        { label: 'D', teks: 'Dibiarkan di lantai terbuka semalaman tanpa wadah tertutup.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Thawing bertahap di suhu chiller 0-4°C mencegah pertumbuhan bakteri patogen dan menjaga kesegaran serat daging ayam.',
      bobot: 4
    },
    {
      id: prefix + '-KIT-10',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - Standar Internal Core Temperature Ayam Matang',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KIT-01',
      pertanyaan: 'Berapa suhu internal daging ayam bagian dalam dekat tulang (Core Temperature) yang wajib tercapai saat matang?',
      opsi: [
        { label: 'A', teks: 'Minimal 40°C' },
        { label: 'B', teks: 'Minimal 74°C (teruji dengan termometer tusuk jarum)' },
        { label: 'C', teks: 'Minimal 150°C' },
        { label: 'D', teks: 'Tidak perlu diukur suhunya asal kulit luar cokelat' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Suhu internal minimal 74°C memastikan seluruh bakteri Salmonella mati dan ayam aman dikonsumsi (Halal & Higienis).',
      bobot: 4
    },
    {
      id: prefix + '-KIT-11',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - Standar Marinasi Ayam Potong',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KIT-04',
      pertanyaan: 'Setelah ayam ditaburi bumbu marinasi baku Hara dan dipijat merata, berapa waktu peresapan minimal di chiller?',
      opsi: [
        { label: 'A', teks: 'Langsung digoreng dalam hitungan 1 menit.' },
        { label: 'B', teks: 'Didiamkan di chiller (0-4°C) minimal 2 - 4 jam dalam wadah tertutup food grade bertanggal (labeling).' },
        { label: 'C', teks: 'Didiamkan di luar ruangan selama 3 hari berturut-turut.' },
        { label: 'D', teks: 'Dicuci kembali dengan sabun sebelum digoreng.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Peresapan minimal 2-4 jam di chiller membuat bumbu gurih meresap ke dalam daging ayam hingga serat terdalam.',
      bobot: 4
    },
    {
      id: prefix + '-KIT-12',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - Batas Holding Time Display Warmer',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KIT-01',
      pertanyaan: 'Berapa batas waktu penyimpanan maksimal (Holding Time) ayam krispi di dalam etalase pemanas (warmer) sebelum kualitasnya turun?',
      opsi: [
        { label: 'A', teks: 'Maksimal 90 - 120 menit pada suhu warmer 60°C - 70°C.' },
        { label: 'B', teks: 'Bisa disimpan sampai 24 jam seharian penuh.' },
        { label: 'C', teks: 'Hanya boleh disimpan 5 menit.' },
        { label: 'D', teks: 'Tidak ada batas waktu selama etalase menyala.' }
      ],
      jawaban_benar: 'A',
      pembahasan_sop: 'Holding time maksimal 90-120 menit di etalase warmer menjaga tekstur tetap krispi dan daging tetap juicy (tidak kering/alot).',
      bobot: 4
    },
    {
      id: prefix + '-KIT-13',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - Perawatan & Penyaringan Minyak Fryer',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KIT-01',
      pertanyaan: 'Mengapa remah-remah tepung (crumb) di dasar deep fryer wajib disaring (filtering) secara rutin setiap selesai menggoreng beberapa batch?',
      opsi: [
        { label: 'A', teks: 'Hanya formalitas untuk mengisi waktu luang.' },
        { label: 'B', teks: 'Agar remah tidak gosong menjadi arang hitam yang membuat minyak cepat rusak, berbau sangit, dan menghitamkan ayam batch berikutnya.' },
        { label: 'C', teks: 'Supaya remah bisa dijual kembali ke pasar.' },
        { label: 'D', teks: 'Agar minyak deep fryer cepat habis.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Filtering berkala menjaga kejernihan minyak, mencegah akumulasi asam lemak bebas (FFA), dan menjaga warna ayam golden brown.',
      bobot: 4
    },
    {
      id: prefix + '-KIT-14',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - Standar Pembuatan Ayam Hot Nashville',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-KIT-07',
      pertanyaan: 'Pada pembuatan Ayam Hot Nashville, kapan proses pencelupan minyak bumbu glaze pedas dilakukan?',
      opsi: [
        { label: 'A', teks: 'Saat ayam masih mentah berdarah sebelum ditepungi.' },
        { label: 'B', teks: 'Segera setelah ayam krispi matang ditiriskan dari fryer, dicelup/diolesi bumbu oil glaze Nashville panas secara merata lalu ditaburi bubuk chili blend.' },
        { label: 'C', teks: 'Setelah ayam disimpan 3 hari di lemari es.' },
        { label: 'D', teks: 'Hanya dioleskan pada sayap ayam saja.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Ayam krispi yang baru matang langsung diglaze minyak rempah panas menghasilkan aroma spicy smoky khas Nashville Hara.',
      bobot: 4
    },
    {
      id: prefix + '-KIT-15',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kitchen - K3 Tanggap Kebakaran Minyak Deep Fryer',
      pilar_kompetensi: 'peraturan_perusahaan',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-K3-01',
      pertanyaan: 'Jika terjadi nyala api tiba-tiba pada bak minyak deep fryer, tindakan apa yang MUTLAK DILARANG dilakukan oleh kru kitchen?',
      opsi: [
        { label: 'A', teks: 'Mematikan tuas gas LPG dan saklar listrik.' },
        { label: 'B', teks: 'MENYIRAMKAN AIR KE DALAM MINYAK YANG MENYALA karena akan menimbulkan ledakan bola api (boilover/fireball).' },
        { label: 'C', teks: 'Menutup wajan dengan kain basah / karung goni basah tebal.' },
        { label: 'D', teks: 'Menggunakan APAR khusus minyak (Class K/B).' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Menyiram air ke minyak terbakar menyebabkan ekspansi uap mendadak yang memicu ledakan bola api mematikan. Wajib tutup basah/APAR.',
      bobot: 4
    },
    {
      id: prefix + '-KIT-16',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Kitchen',
      tipe: 'ESSAY_HOTS',
      topik: 'Kitchen - Prosedur Lengkap SOP Nasi Goreng Revisi Terbaru',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sulit',
      kode_sop: 'HC-SOP-KIT-05',
      pertanyaan: 'Tuliskan secara lengkap dan runtut resep serta tahapan memasak 1 porsi Nasi Goreng berdasarkan SOP resmi revisi terbaru HC-SOP-KIT-05! Sebutkan gramatur bumbu eco, minyak, mix sayur, saos ricebowl, minyak wijen, intensitas api, dan standar waktu memasaknya!',
      kata_kunci_essay: ['bumbu eco 20', 'minyak 15', 'bawang putih', 'mix vegetable 30', 'saos ricebowl 15', 'minyak wijen 2 tetes', 'api sedang', '3-4 menit'],
      pembahasan_sop: 'Resep baku: Minyak 15 ml, bawang putih geprek tumis harum, mix sayur 30 gr, 1 cup nasi dingin aduk api sedang, bumbu eco 20 gr, saos ricebowl 15 gr, minyak wijen 2 tetes, masak 3-4 menit.',
      bobot: 10
    }
  ];

  // 16 SOAL GEPREK (MURNI GEPREK, SAMBAL 30G COBEK BATU, PACKING NASGOR & INDOMIE, PLATTING AYAM UTUH)
  const geprek = [
    {
      id: prefix + '-GPK-01',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - Standar Gramatur Sambal Bawang Baku',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-GPK-01',
      pertanyaan: 'Berapa gramatur standar racikan Sambal Bawang per porsi ayam geprek yang wajib diuleg di cobek batu?',
      opsi: [
        { label: 'A', teks: '10 gram saja.' },
        { label: 'B', teks: '30 gram racikan baku (cabai rawit segar, bawang putih, garam/penyedap standar) disiram minyak panas.' },
        { label: 'C', teks: '75 gram sampai menutupi seluruh piring.' },
        { label: 'D', teks: 'Secukupnya tanpa takaran gramatur.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Gramatur baku sambal geprek Hara adalah 30 gram per porsi untuk menjaga konsistensi tingkat pedas dan rasa di seluruh outlet.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-02',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - SOP Packing Nasi Goreng Take Away',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-GPK-18',
      pertanyaan: 'Berdasarkan HC-SOP-GPK-18, bagaimana standar pembungkusan (packing) Nasi Goreng untuk pesanan Take Away?',
      opsi: [
        { label: 'A', teks: 'Langsung dibungkus plastik kiloan tanpa boks.' },
        { label: 'B', teks: 'Masukkan ke boks besar beralas 1 lembar kertas nasi utuh, letakkan telur di atas nasi goreng, tutup dengan kertas nasi lalu letakkan sendok di atas kertas penutup.' },
        { label: 'C', teks: 'Nasi goreng dicampur langsung dengan es teh di dalam satu kantong.' },
        { label: 'D', teks: 'Sendok dimasukkan menyatu langsung di dalam adonan nasi panas.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Standar take away: boks besar, alas kertas nasi utuh, telur di atas nasi, sendok di atas kertas penutup agar higienis.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-03',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - SOP Packing Indomie Geprek Take Away',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-GPK-18',
      pertanyaan: 'Sesuai HC-SOP-GPK-18, bagaimana penataan Indomie Geprek Take Away di dalam kemasan boks?',
      opsi: [
        { label: 'A', teks: 'Indomie ditumpuk menutupi ayam hingga ayam menjadi lembek.' },
        { label: 'B', teks: 'Boks besar beralas 1 lembar kertas nasi utuh, tata mie dan ayam geprek bersebelahan rapi, beri 2 slice timun di atas ayam geprek, tutup kertas nasi dan beri sendok.' },
        { label: 'C', teks: 'Ayam dibuang tulangnya dan dihancurkan menjadi bubur.' },
        { label: 'D', teks: 'Mie dibungkus terpisah di plastik es batu.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Penataan bersebelahan rapi menjaga tekstur ayam tetap krispi dan tampilan makanan tetap menggugah selera saat dibuka tamu.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-04',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - SOP Platting Ayam Utuh Krispi/Krisbar',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-GPK-17',
      pertanyaan: 'Berdasarkan HC-SOP-GPK-17, pelengkap apa saja yang wajib disertakan pada kemasan Ayam Utuh (Whole Chicken)?',
      opsi: [
        { label: 'A', teks: 'Hanya ayam saja tanpa sambal dan lalapan.' },
        { label: 'B', teks: 'Sertakan 1 cup sambal bawang + 1 cup sambal daun jeruk + 5 iris timun segar yang dibungkus plastik bening higienis.' },
        { label: 'C', teks: 'Sambal langsung ditumpahkan di atas kardus tanpa wadah cup.' },
        { label: 'D', teks: '1 liter air mineral galon.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Pelengkap baku Ayam Utuh: 1 cup sambal bawang, 1 cup sambal daun jeruk, dan 5 slice timun terbungkus plastik rapi.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-05',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - Karakteristik & SOP Sambal Daun Jeruk',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-GPK-02',
      pertanyaan: 'Apa ciri khas pengolahan Sambal Daun Jeruk Hara Chicken agar aromanya keluar segar dan tidak pahit?',
      opsi: [
        { label: 'A', teks: 'Tulang batang daun jeruk ikut digerus kasar.' },
        { label: 'B', teks: 'Buang tulang daun jeruk, iris halus helai daunnya, campurkan ke ulegan cabai rawit dan bawang, lalu siram minyak panas suhu tepat.' },
        { label: 'C', teks: 'Daun jeruk digoreng gosong hingga menjadi abu.' },
        { label: 'D', teks: 'Menggunakan perisa sirup jeruk manis.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Membuang tulang tengah daun jeruk dan mengiris tipis helainya mencegah rasa pahit dan menghasilkan aroma sitrus segar.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-06',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - Sanitasi & Pemeliharaan Cobek Batu',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-GPK-05',
      pertanyaan: 'Bagaimana standar sanitasi dan kebersihan cobek batu uleg di stasiun geprek?',
      opsi: [
        { label: 'A', teks: 'Cobek tidak pernah dicuci selama berbulan-bulan dengan alasan agar bumbunya meresap.' },
        { label: 'B', teks: 'Cobek dicuci bersih dengan air dan sabun food grade secara berkala, dikeringkan, dan tidak boleh ada kerak cabai basi dari shift sebelumnya.' },
        { label: 'C', teks: 'Cukup dilap dengan kain serbet kotor tanpa air.' },
        { label: 'D', teks: 'Dibiarkan terendam di genangan air limbah lantai.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Cobek batu wajib bersih dan higienis. Kerak cabai lama dapat memicu kontaminasi bakteri dan keasaman sambal (basi).',
      bobot: 4
    },
    {
      id: prefix + '-GPK-07',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - Higienitas Sayuran Timun & Talenan RTE',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-GPK-06',
      pertanyaan: 'Untuk mencegah bahaya kontaminasi silang (cross-contamination) pada sayuran timun segar (Ready-To-Eat), aturan talenan apa yang wajib ditaati?',
      opsi: [
        { label: 'A', teks: 'Memotong timun di atas talenan yang baru saja dipakai memotong ayam mentah berdarah tanpa dicuci.' },
        { label: 'B', teks: 'Gunakan talenan khusus sayuran (talenan hijau/khusus RTE) yang selalu disanitasi dan pisau bersih terpisah dari daging mentah.' },
        { label: 'C', teks: 'Memotong timun langsung di atas lantai dapur.' },
        { label: 'D', teks: 'Timun tidak perlu dicuci dengan air mengalir.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Pemisahan talenan sayur RTE mutlak mencegah transfer Salmonella/E. Coli dari daging mentah ke makanan siap santap.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-08',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - Standar Uleg Tekstur Daging Ayam Geprek',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-GPK-01',
      pertanyaan: 'Bagaimana standar penekanan ulegan ayam geprek original yang benar?',
      opsi: [
        { label: 'A', teks: 'Dihantam sekuat tenaga sampai tulang ayam hancur menjadi bubuk berbahaya bagi tenggorokan pelanggan.' },
        { label: 'B', teks: 'Ditekan memar (geprek) secara merata hingga sambal menyatu ke daging tanpa menghancurkan tulang menjadi serpihan tajam.' },
        { label: 'C', teks: 'Ayam tidak disentuh sama sekali, hanya ditaruh di piring.' },
        { label: 'D', teks: 'Diblender dengan air hangat.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Geprek yang benar meremukkan daging agar sambal meresap, namun tidak menghancurkan tulang menjadi serpihan berbahaya.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-09',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - Standar Menu Extra & Side Dishes',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-GPK-16',
      pertanyaan: 'Berdasarkan Knowledge Menu (HC-SOP-GPK-16), produk pelengkap krispi apa saja yang disiapkan di stasiun geprek & finishing?',
      opsi: [
        { label: 'A', teks: 'Sate kambing dan gulai sapi.' },
        { label: 'B', teks: 'Terong Krispi, Jamur Enoki Krispi, Spinach (Bayam) Krispi, dan Telur Dadar.' },
        { label: 'C', teks: 'Pizza dan spaghetti saus bolognese.' },
        { label: 'D', teks: 'Hanya kerupuk kaleng putih.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Terong krispi, Enoki krispi, Spinach krispi, dan Telur dadar adalah menu ekstra andalan resmi di outlet Hara Chicken.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-10',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - SOP Ricebowl Ayam Geprek',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-GPK-08',
      pertanyaan: 'Berapa standar gramatur nasi dan penataan untuk menu Ricebowl Ayam Geprek?',
      opsi: [
        { label: 'A', teks: 'Nasi 50 gram dengan 1 potong tulang.' },
        { label: 'B', teks: 'Nasi pulen 200 gram di dalam paper bowl, suwiran ayam krispi boneless (tanpa tulang) 70-80 gram, siraman sambal baku di atasnya, dan garnish timun/daun selada.' },
        { label: 'C', teks: 'Nasi 500 gram hingga bowl tidak bisa ditutup.' },
        { label: 'D', teks: 'Nasi mentah yang belum ditanak.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Ricebowl disajikan dengan 200g nasi, suwiran ayam krispi boneless, sambal merata, dan garnish rapi di kemasan bowl higienis.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-11',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - SOP Pembuatan Geprek Krisbar (Krispi Bakar)',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-GPK-09',
      pertanyaan: 'Bagaimana tahapan pembuatan menu Geprek Krisbar (Krispi Bakar)?',
      opsi: [
        { label: 'A', teks: 'Ayam krispi dibakar hingga gosong hitam legam tanpa saus.' },
        { label: 'B', teks: 'Ayam krispi diolesi bumbu oles bakar khas Hara, dipanggang di atas grill pan/torch sebentar hingga terkaramelisasi harum, lalu digeprek dengan sambal.' },
        { label: 'C', teks: 'Ayam krispi direndam di air es semalaman.' },
        { label: 'D', teks: 'Hanya sambalnya saja yang dibakar, ayamnya dibiarkan dingin.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Pengolesan saus bakar dan pembakaran singkat memicu karamelisasi smokey tanpa menghilangkan kerenyahan tepung krispi.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-12',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - Standar Penggunaan Sarung Tangan Plastik (Hand Gloves)',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-GPK-05',
      pertanyaan: 'Kapan sarung tangan plastik (disposable hand gloves) wajib diganti oleh kru geprek?',
      opsi: [
        { label: 'A', teks: 'Bisa dipakai selama satu bulan penuh tanpa dilepas.' },
        { label: 'B', teks: 'Setiap kali sarung tangan robek, setelah memegang tempat sampah/uang, setelah ke toilet, atau maksimal per shift operasional.' },
        { label: 'C', teks: 'Hanya jika disuruh oleh tamu.' },
        { label: 'D', teks: 'Tidak perlu ganti sarung tangan sama sekali.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Sarung tangan sekali pakai wajib diganti berkala untuk mencegah cemaran bakteri ke makanan siap saji.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-13',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - Penanganan Cabai Sisa & Masa Simpan Sambal',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-GPK-01',
      pertanyaan: 'Apakah sambal uleg segar yang sudah dicampur minyak panas boleh disimpan untuk dipakai pada shift esok hari?',
      opsi: [
        { label: 'A', teks: 'Boleh disimpan di suhu ruang terbuka selama 1 minggu.' },
        { label: 'B', teks: 'Tidak boleh. Sambal uleg segar dibuat fresh per batch harian, sisa sambal yang telah lewat holding time wajib dibuang (discard) karena rasanya berubah masam/tengik.' },
        { label: 'C', teks: 'Boleh dicampur dengan sambal baru besok pagi tanpa cek rasa.' },
        { label: 'D', teks: 'Diberikan pemutih agar warnanya segar kembali.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Sambal Hara mengutamakan kesegaran harian (Fresh Daily). Sambal basi merusak reputasi brand dan menyebabkan komplain pelanggan.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-14',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - Kecepatan Perakitan Saat Rush Hour',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-GPK-01',
      pertanyaan: 'Berapa target waktu perakitan (Speed of Assembly) 1 porsi ayam geprek mulai dari ambil ayam warmer, uleg sambal, hingga siap disajikan?',
      opsi: [
        { label: 'A', teks: '10 menit per porsi.' },
        { label: 'B', teks: 'Maksimal 60 - 90 detik per porsi saat jam sibuk.' },
        { label: 'C', teks: '20 menit.' },
        { label: 'D', teks: '1 jam.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Ketangkasan stasiun geprek 60-90 detik memastikan Speed of Service (SOS) total pesanan ke meja tamu terpenuhi.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-15',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'PILIHAN_GANDA',
      topik: 'Geprek - Prosedur Penataan Tiket Pesanan & KDS',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-GPK-10',
      pertanyaan: 'Bagaimana kru stasiun geprek mengatur tiket pesanan kertas dari kasir agar pesanan tidak tertukar atau terlewat?',
      opsi: [
        { label: 'A', teks: 'Membuang tiket ke lantai begitu kasir menyerahkannya.' },
        { label: 'B', teks: 'Jepit tiket berurutan dari kiri ke kanan berdasarkan nomor urut order (FIFO), tandai menu yang sudah selesai dibuat dengan pulpen ceklis.' },
        { label: 'C', teks: 'Mengerjakan pesanan acak yang disukai saja.' },
        { label: 'D', teks: 'Menyimpan tiket di saku celana.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Urutan FIFO tiket pesanan dan ceklis fisik menjamin tidak ada pesanan tamu yang terlompati atau salah urutan.',
      bobot: 4
    },
    {
      id: prefix + '-GPK-16',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Geprek',
      tipe: 'ESSAY_HOTS',
      topik: 'Geprek - Studi Kasus Packaging Pesanan Campuran Saat Rush Hour',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sulit',
      kode_sop: 'HC-SOP-GPK-18',
      pertanyaan: 'Studi Kasus: Anda menerima tiket pesanan Take Away berisi: 2 porsi Nasi Goreng Telur dan 2 porsi Ayam Geprek Original Sambal Bawang level 3. Jelaskan standar packaging masing-masing menu (jenis boks, alas kertas, posisi telur, posisi sambal, sendok, dan timun) sesuai SOP HC-SOP-GPK-18 agar makanan tetap higienis dan tidak bocor!',
      kata_kunci_essay: ['boks besar', 'kertas nasi utuh', 'telur di atas nasi', 'sendok di atas kertas', 'timun 2 slice', 'sambal bawang 30g'],
      pembahasan_sop: 'Nasi goreng: boks besar, alas 1 lembar kertas nasi utuh, telur di atas nasi, sendok di atas kertas penutup. Geprek: boks besar beralas kertas utuh, ayam bersambal ditata rapi, timun 2 slice di atas ayam.',
      bobot: 10
    }
  ];

  // 16 SOAL HELPER (MURNI HELPER, RESTOCK FIFO/FEFO, 3 BAK DISHWASHING, REFILL STATION HARA EXTRA, TABLE TURNOVER, MOPPING, APAR)
  const helper = [
    {
      id: prefix + '-HLP-01',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - Prinsip FIFO & FEFO Penyimpanan Bahan Baku',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-HLP-01',
      pertanyaan: 'Saat menyusun bahan baku beras, minyak, dan bumbu kemasan di gudang kering (HC-SOP-HLP-01), apa maksud penerapan metode FIFO dan FEFO?',
      opsi: [
        { label: 'A', teks: 'Bahan yang baru datang langsung dipakai duluan, bahan lama dibiarkan membusuk di belakang.' },
        { label: 'B', teks: 'Bahan yang pertama masuk atau yang memiliki tanggal kedaluwarsa lebih dekat wajib ditata di depan dan dipakai lebih dulu.' },
        { label: 'C', teks: 'Menyusun stok acak tanpa memperhatikan tanggal.' },
        { label: 'D', teks: 'Menyimpan bahan di luar ruangan agar terkena air hujan.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'FIFO (First In First Out) dan FEFO (First Expired First Out) mencegah kerugian stok akibat kedaluwarsa atau kerusakan mutu.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-02',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - SOP Pencucian Alat 3 Kompartemen Sink',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-HLP-02',
      pertanyaan: 'Bagaimana urutan fungsi 3 bak cuci piring (Three-Compartment Sink) sesuai standar sanitasi food service?',
      opsi: [
        { label: 'A', teks: 'Bak 1 rendam kotoran, Bak 2 buang sampah, Bak 3 cuci tangan.' },
        { label: 'B', teks: 'Bak 1: Mencuci dengan sabun pembersih lemak (air hangat ~45°C), Bak 2: Membilas dengan air bersih mengalir, Bak 3: Sanitasi desinfektan dan pengeringan udara (air dry).' },
        { label: 'C', teks: 'Semua bak diisi air kotor yang tidak pernah diganti.' },
        { label: 'D', teks: 'Peralatan dilap dengan serbet kotor tanpa menggunakan sabun.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Standar 3 kompartemen (Wash, Rinse, Sanitize) membunuh kuman patogen dan menghilangkan sisa lemak ayam secara efektif.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-03',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - Pemeliharaan Refill Station Hara Extra',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-HLP-03',
      pertanyaan: 'Sebagai fasilitas unggulan pelanggan Dine In, apa tugas wajib kru helper pada area Refill Station Hara Extra?',
      opsi: [
        { label: 'A', teks: 'Membiarkan wadah nasi dan es teh kosong berjam-jam saat tamu ramai.' },
        { label: 'B', teks: 'Mengecek berkala dan mengisi ulang termos nasi hangat, dispenser es teh manis, dan sup kaldu sebelum tersisa 20%, serta menjaga area selalu kering dan bersih.' },
        { label: 'C', teks: 'Mengunci meja refill agar tamu tidak bisa mengambil nasi.' },
        { label: 'D', teks: 'Meminta uang tambahan ke setiap tamu yang mengambil refill.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Refill station yang selalu terisi dan bersih mencerminkan komitmen Hara Extra dalam memuaskan pelanggan makan di tempat.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-04',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - Standar Table Turnover & Pembersihan Meja Tamu',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-HLP-04',
      pertanyaan: 'Berapa standar batas waktu (Table Turnover) untuk membersihkan dan mendisinfeksi meja setelah tamu selesai makan?',
      opsi: [
        { label: 'A', teks: '30 menit setelah tamu pergi.' },
        { label: 'B', teks: 'Maksimal kurang dari 2 menit (angkat piring kotor, lap meja dengan cairan sanitasi, rapikan kursi).' },
        { label: 'C', teks: 'Dibersihkan hanya saat tutup toko malam hari.' },
        { label: 'D', teks: 'Menunggu tamu berikutnya datang dan meminta meja dibersihkan.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Pembersihan meja di bawah 2 menit menjaga perputaran tempat duduk cepat dan memberi kesan higienis kepada pelanggan baru.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-05',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - SOP Mopping Lantai & K3 Wet Floor Sign',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-HLP-05',
      pertanyaan: 'Saat mengepel lantai area makan yang terkena tumpahan minyak atau es teh (HC-SOP-HLP-05), prosedur keselamatan apa yang wajib dipasang?',
      opsi: [
        { label: 'A', teks: 'Tidak perlu pengamanan apa pun.' },
        { label: 'B', teks: 'Wajib meletakkan papan peringatan kerucut "HATI-HATI LANTAI LICIN / CAUTION WET FLOOR" di lokasi dan gunakan cairan degreaser khusus.' },
        { label: 'C', teks: 'Menutup seluruh outlet dan mematikan lampu.' },
        { label: 'D', teks: 'Menyiram lantai dengan minyak goreng agar mengkilap.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Pemasangan wet floor sign adalah standar K3 mutlak untuk mencegah pelanggan atau sesama kru terpeleset jatuh.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-06',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - SOP Pengelolaan & Pembuangan Sampah',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-HLP-06',
      pertanyaan: 'Kapan kantong sampah di area dining room dan stasiun kerja wajib diikat dan dipindahkan ke tempat pembuangan akhir luar?',
      opsi: [
        { label: 'A', teks: 'Menunggu sampah menumpuk menggunung dan tumpah ke lantai.' },
        { label: 'B', teks: 'Ketika kantong sampah sudah terisi sekitar 70% - 80% penuh, dan diikat rapi tanpa diseret di depan tamu.' },
        { label: 'C', teks: 'Hanya seminggu sekali.' },
        { label: 'D', teks: 'Saat lalat sudah berkerumun banyak di atas tempat sampah.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Mengosongkan tempat sampah di kapasitas 70-80% mencegah tumpahan kotoran, bau tidak sedap, dan sarang lalat.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-07',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - Penerimaan Pengiriman Logistik Ayam Segar',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-HLP-07',
      pertanyaan: 'Saat truk logistik ayam potong tiba di outlet, hal apa saja yang wajib dicek oleh kru helper sebelum menandatangani surat jalan?',
      opsi: [
        { label: 'A', teks: 'Cukup menandatangani surat jalan tanpa melihat kondisi ayam.' },
        { label: 'B', teks: 'Cek suhu armada pendingin (maksimal 4°C), kondisi segel keranjang, aroma ayam segar (tidak asam/berbau busuk), keutuhan kemasan, dan timbang berat bersih.' },
        { label: 'C', teks: 'Langsung meletakkan ayam di lantai panas luar toko.' },
        { label: 'D', teks: 'Membiarkan ayam di dalam mobil pengantar seharian.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Verifikasi suhu, kesegaran fisik, dan timbangan saat penerimaan mencegah masuknya bahan baku rusak ke dalam sistem.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-08',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - Standar Penyimpanan Karung Beras di Gudang',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-HLP-08',
      pertanyaan: 'Berdasarkan standar gudang bahan pangan, bagaimana cara meletakkan karung beras yang benar?',
      opsi: [
        { label: 'A', teks: 'Diletakkan langsung menyentuh lantai semen basah dan menempel rapat di dinding.' },
        { label: 'B', teks: 'Wajib beralaskan pallet kayu/plastik minimal 15 cm dari lantai dan berjarak minimal 10 cm dari dinding untuk sirkulasi udara dan anti-hama.' },
        { label: 'C', teks: 'Diletakkan di dekat tempat pembuangan oli bekas.' },
        { label: 'D', teks: 'Disimpan di toilet karyawan.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Penggunaan pallet dan jarak dinding menjaga beras tetap kering, tidak berjamur lembab, dan terhindar dari serangga/hama.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-09',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - Kebersihan Toilet & Restroom Outlet',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-HLP-09',
      pertanyaan: 'Berapa frekuensi pengecekan kebersihan toilet pelanggan dan staf yang wajib dilakukan helper selama jam operasional?',
      opsi: [
        { label: 'A', teks: 'Hanya sebulan sekali.' },
        { label: 'B', teks: 'Setiap 60 menit sekali (cek lantai kering, sabun cuci tangan terisi, tisu tersedia, wangi dan kloset higienis).' },
        { label: 'C', teks: 'Hanya jika ada tamu yang marah-marah.' },
        { label: 'D', teks: 'Tidak perlu dicek sama sekali.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Pengecekan toilet per 60 menit dengan checklist fisik mencerminkan kepedulian tinggi terhadap kenyamanan dan higienitas tamu.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-10',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - SOP Pengambilan & Pengisian Es Batu Kristal',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-HLP-10',
      pertanyaan: 'Alat apa yang WAJIB digunakan saat mengambil es batu dari ice maker atau kotak es kristal?',
      opsi: [
        { label: 'A', teks: 'Gelas kaca langsung dicidukkan ke tumpukan es.' },
        { label: 'B', teks: 'Sekop es (ice scoop) stainless steel atau plastik khusus yang bersih, dengan gagang berada di luar es, DILARANG menggunakan tangan telanjang atau gelas kaca.' },
        { label: 'C', teks: 'Piring melamin yang retak.' },
        { label: 'D', teks: 'Tangan langsung tanpa cuci tangan.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Menggunakan gelas kaca berisiko pecah di dalam bin es batu dan mencelakai tamu. Selalu gunakan ice scoop bersih.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-11',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - Penanganan Pecahan Piring / Kaca di Area Makan',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-HLP-11',
      pertanyaan: 'Jika terjadi piring atau gelas pecah di lantai ruang makan, bagaimana prosedur penanganan yang aman bagi tamu?',
      opsi: [
        { label: 'A', teks: 'Dibiarkan saja agar tamu yang lewat melangkahinya.' },
        { label: 'B', teks: 'Beri peringatan segera kepada tamu di sekitar, bersihkan menggunakan sapu dan pengki (jangan pakai tangan kosong), bungkus pecahan dengan kardus/koran tebal sebelum dibuang ke kantong sampah.' },
        { label: 'C', teks: 'Ditendang ke kolong meja tamu lain.' },
        { label: 'D', teks: 'Disiram dengan air panas mendidih.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Membungkus serpihan tajam melindungi staf kebersihan dan petugas sampah luar dari luka sobek atau infeksi.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-12',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - Pengoperasian APAR dengan Teknik P.A.S.S',
      pilar_kompetensi: 'peraturan_perusahaan',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-K3-02',
      pertanyaan: 'Singkatan dari teknik P.A.S.S dalam penggunaan Alat Pemadam Api Ringan (APAR) adalah:',
      opsi: [
        { label: 'A', teks: 'Push, Action, Stop, Safety.' },
        { label: 'B', teks: 'Pull the pin (Tarik pin), Aim the nozzle (Arahkan corong ke titik api), Squeeze the handle (Tekan tuas), Sweep side to side (Sapukan merata dari sisi ke sisi).' },
        { label: 'C', teks: 'Play, Attack, Stand, Silence.' },
        { label: 'D', teks: 'Pukul tabung ke lantai berkali-kali.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Teknik baku internasional P.A.S.S menjamin APAR disemprotkan tepat ke dasar api dan memadamkan kobaran dengan cepat.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-13',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - Pengendalian Hama Mandiri (Pest Control)',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-HLP-12',
      pertanyaan: 'Langkah pencegahan hama lalat dan kecoa yang paling efektif dilakukan oleh helper di area dapur belakang adalah:',
      opsi: [
        { label: 'A', teks: 'Menyemprotkan racun serangga aerosol langsung ke atas masakan ayam matang.' },
        { label: 'B', teks: 'Memastikan pintu belakang tertutup rapat, nyalakan lampu insect killer, bersihkan seluruh genangan air dan remah makanan di kolong meja sebelum tutup shift.' },
        { label: 'C', teks: 'Memelihara kucing liar di dalam area kitchen.' },
        { label: 'D', teks: 'Membiarkan pintu dapur terbuka lebar 24 jam.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Sanitasi bersih, pintu tertutup, dan tidak adanya sisa makanan adalah kunci utama pemutusan siklus hidup hama.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-14',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - Pembersihan Perangkap Lemak (Grease Trap)',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-HLP-13',
      pertanyaan: 'Mengapa grease trap (bak penangkap lemak) di bawah bak cuci piring wajib dibersihkan dan diserok lemaknya secara rutin?',
      opsi: [
        { label: 'A', teks: 'Agar lemak bisa digunakan kembali untuk menggoreng ayam.' },
        { label: 'B', teks: 'Mencegah saluran pipa pembuangan mampet/tersumbat lemak beku dan mencegah timbulnya bau busuk menyengat ke ruang makan.' },
        { label: 'C', teks: 'Hanya agar terlihat bagus saja.' },
        { label: 'D', teks: 'Supaya air limbah meluap ke lantai dapur.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Pembersihan grease trap terjadwal menjaga sanitasi air limbah dan mencegah pipa got buntu.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-15',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'PILIHAN_GANDA',
      topik: 'Helper - Grooming & Kebersihan Pribadi Kru',
      pilar_kompetensi: 'visi_misi_hara',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HC-SOP-HLP-14',
      pertanyaan: 'Standar kebersihan pribadi (personal hygiene) yang wajib dipatuhi kru helper saat bertugas adalah:',
      opsi: [
        { label: 'A', teks: 'Bebas berkuku panjang dan tidak perlu mandi sebelum bekerja.' },
        { label: 'B', teks: 'Kuku dipotong pendek bersih tanpa cat kuku, seragam dan celemek bersih, kenakan topi/hairnet, serta rutin cuci tangan 20 detik menggunakan sabun mengalir.' },
        { label: 'C', teks: 'Memakai cincin dan gelang perhiasan mencolok di pergelangan tangan.' },
        { label: 'D', teks: 'Merokok di area pencucian piring.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Kuku pendek, rambut tertutup hairnet, dan cuci tangan teratur mencegah perpindahan cemaran biologis ke peralatan makan.',
      bobot: 4
    },
    {
      id: prefix + '-HLP-16',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Helper',
      tipe: 'ESSAY_HOTS',
      topik: 'Helper - Studi Kasus Skala Prioritas Rush Hour & Kebersihan',
      pilar_kompetensi: 'sop_jobdesk',
      tingkat_kesulitan: 'Sulit',
      kode_sop: 'HC-SOP-HLP-03',
      pertanyaan: 'Studi Kasus: Saat rush hour jam 12.30 siang, tamu ramai berdatangan. Di saat bersamaan: 1) Wadah termos es teh manis di area refill mulai habis, 2) Ada tumpahan es teh di lantai utama meja tamu, dan 3) Piring kotor menumpuk di meja nomor 4. Jelaskan urutan skala prioritas tindakan Anda beserta alasan keselamatan kerja dan kepuasan pelanggan!',
      kata_kunci_essay: ['tumpahan lantai licin', 'wet floor', 'refill es teh', 'table turnover meja 4', 'prioritas keselamatan'],
      pembahasan_sop: 'Prioritas 1: Bersihkan tumpahan lantai & pasang wet floor (safety K3 cegah tamu jatuh). Prioritas 2: Isi ulang termos es teh (layanan Hara Extra). Prioritas 3: Clearing meja nomor 4 (<2 menit table turnover).',
      bobot: 10
    }
  ];

  // 10 SOAL UMUM (SEMUA JOBDESK: BUDAYA HARA, INTEGRITAS, DISIPLIN BRIEFING, K3, LARANGAN FRAUD)
  const umum = [
    {
      id: prefix + '-UMUM-01',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Semua',
      tipe: 'PILIHAN_GANDA',
      topik: 'Budaya HARA - Empat Pilar Nilai Perusahaan',
      pilar_kompetensi: 'visi_misi_hara',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HARA-CULTURE-01',
      pertanyaan: 'Apa kepanjangan dari akronim Budaya H.A.R.A yang menjadi pedoman perilaku seluruh kru outlet?',
      opsi: [
        { label: 'A', teks: 'Hebat, Asyik, Rajin, Andal' },
        { label: 'B', teks: 'Halal-Higienis, Amanah, Responsif, Adaptif' },
        { label: 'C', teks: 'Hemat, Akurat, Ramah, Aktif' },
        { label: 'D', teks: 'Hangat, Asri, Rapi, Aman' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Budaya HARA: Halal-Higienis (standar mutu makanan), Amanah (jujur & integritas), Responsif (sigap melayani), Adaptif (siap belajar berkembang).',
      bobot: 4
    },
    {
      id: prefix + '-UMUM-02',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Semua',
      tipe: 'PILIHAN_GANDA',
      topik: 'Visi Perusahaan - Program Keunggulan Hara Extra',
      pilar_kompetensi: 'visi_misi_hara',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HARA-VISION-01',
      pertanyaan: 'Apa keunggulan fasilitas "Hara Extra" yang dipersembahkan kepada pelanggan saat makan di tempat (Dine In)?',
      opsi: [
        { label: 'A', teks: 'Free refill nasi, es teh manis, dan sup kaldu sepuasnya tanpa biaya tambahan.' },
        { label: 'B', teks: 'Gratis makan ayam utuh tanpa membayar.' },
        { label: 'C', teks: 'Diskon 99% setiap hari.' },
        { label: 'D', teks: 'Mendapatkan uang saku tunai dari kasir.' }
      ],
      jawaban_benar: 'A',
      pembahasan_sop: 'Hara Extra memberikan pengalaman makan mengenyangkan dan bahagia dengan free refill nasi, es teh, dan sup kaldu hangat.',
      bobot: 4
    },
    {
      id: prefix + '-UMUM-03',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Semua',
      tipe: 'PILIHAN_GANDA',
      topik: 'Tata Tertib - Disiplin Waktu Kehadiran Shift',
      pilar_kompetensi: 'peraturan_perusahaan',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'PP-DISIPLIN-01',
      pertanyaan: 'Sesuai Peraturan Perusahaan, berapa menit sebelum jadwal jam shift dimulai seluruh kru wajib hadir di outlet?',
      opsi: [
        { label: 'A', teks: 'Boleh terlambat 30 menit setelah shift mulai.' },
        { label: 'B', teks: 'Minimal 15 menit sebelum jam shift dimulai untuk persiapan grooming dan mengikuti briefing operasional.' },
        { label: 'C', teks: 'Tepat di menit pergantian jam tanpa perlu briefing.' },
        { label: 'D', teks: 'Hadir kapan saja yang disukai kru.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Hadir 15 menit sebelum jadwal memungkinkan serah terima stasiun kerja (handover) berjalan mulus tanpa mengganggu antrean tamu.',
      bobot: 4
    },
    {
      id: prefix + '-UMUM-04',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Semua',
      tipe: 'PILIHAN_GANDA',
      topik: 'Tata Tertib - Penggunaan Handphone / Gadget Pribadi',
      pilar_kompetensi: 'peraturan_perusahaan',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'PP-DISIPLIN-02',
      pertanyaan: 'Bagaimana aturan resmi perusahaan terkait penggunaan handphone / gadget pribadi saat jam bertugas di stasiun operasional?',
      opsi: [
        { label: 'A', teks: 'Boleh sambil bermain game atau live media sosial di depan meja kasir dan dapur.' },
        { label: 'B', teks: 'DILARANG menggunakan gadget pribadi selama jam dinas; ponsel disimpan rapi di loker staf dan hanya boleh diakses saat jam istirahat.' },
        { label: 'C', teks: 'Boleh menonton video streaming selama pesanan sepi.' },
        { label: 'D', teks: 'Ponsel wajib diletakkan di atas talenan makanan.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Fokus melayani tamu dan menjaga keamanan kerja menuntut sterilisasi area kerja dari gangguan bermain gawai pribadi.',
      bobot: 4
    },
    {
      id: prefix + '-UMUM-05',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Semua',
      tipe: 'PILIHAN_GANDA',
      topik: 'Integritas & Kejujuran - Kebijakan Zero Tolerance Fraud',
      pilar_kompetensi: 'karakter_integritas',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'PP-INTEGRITAS-01',
      pertanyaan: 'Tindakan apa saja yang termasuk pelanggaran berat kategori Fraud (Kecurangan) dengan sanksi Pemutusan Hubungan Kerja (PHK) seketika?',
      opsi: [
        { label: 'A', teks: 'Membantu rekan kerja yang sedang mencuci piring.' },
        { label: 'B', teks: 'Mengambil bahan makanan/minuman tanpa izin inventori, manipulasi nota POS, tidak menyetorkan uang transaksi kas, atau mencuri aset outlet.' },
        { label: 'C', teks: 'Mengucapkan terima kasih kepada pelanggan.' },
        { label: 'D', teks: 'Menjaga kebersihan stasiun kerja dengan sungguh-sungguh.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Perusahaan menerapkan Zero Tolerance terhadap segala bentuk pencurian dan manipulasi kas/inventori.',
      bobot: 4
    },
    {
      id: prefix + '-UMUM-06',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Semua',
      tipe: 'PILIHAN_GANDA',
      topik: 'Pelayanan Pelanggan - Prinsip Senyum, Sapa, Salam (5S)',
      pilar_kompetensi: 'visi_misi_hara',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HARA-SERVICE-01',
      pertanyaan: 'Penerapan prinsip 5S (Senyum, Salam, Sapa, Sopan, Santun) wajib dilakukan oleh:',
      opsi: [
        { label: 'A', teks: 'Hanya kru kasir saja, bagian kitchen dan helper tidak perlu ramah.' },
        { label: 'B', teks: 'SELURUH KRU OUTLET (Kasir, Kitchen, Geprek, Helper) kepada setiap pelanggan, rekan kerja, dan mitra kurir pengantaran.' },
        { label: 'C', teks: 'Hanya jika ada inspeksi mendadak dari pemilik perusahaan.' },
        { label: 'D', teks: 'Tidak wajib bagi siapa pun.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Budaya 5S adalah DNA pelayanan seluruh kru Hara Chicken tanpa memandang divisi stasiun kerja.',
      bobot: 4
    },
    {
      id: prefix + '-UMUM-07',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Semua',
      tipe: 'PILIHAN_GANDA',
      topik: 'K3 Pencegahan Bahaya Kebakaran Minyak',
      pilar_kompetensi: 'peraturan_perusahaan',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'HC-SOP-K3-01',
      pertanyaan: 'Jika rekan stasiun kitchen berteriak bahwa wajan minyak kompor terbakar, apa tindakan tanggap darurat yang tepat dari Anda?',
      opsi: [
        { label: 'A', teks: 'Mengambil ember air dan menyiramkannya ke wajan yang menyala.' },
        { label: 'B', teks: 'Segera ambil kain/karung basah atau tabung APAR, cabut regulator gas LPG, dan jangan menyiram air.' },
        { label: 'C', teks: 'Mengambil foto dan merekam video untuk diunggah ke status sosial media.' },
        { label: 'D', teks: 'Mengunci pintu keluar outlet.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Tindakan cepat memadamkan oksigen api dengan kain basah/APAR dan memutus pasokan gas menyelamatkan seluruh kru dan bangunan outlet.',
      bobot: 4
    },
    {
      id: prefix + '-UMUM-08',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Semua',
      tipe: 'PILIHAN_GANDA',
      topik: 'Kolaborasi Tim Saat Rush Hour (Kerjasama Tim)',
      pilar_kompetensi: 'karakter_integritas',
      tingkat_kesulitan: 'Mudah',
      kode_sop: 'HARA-TEAMWORK-01',
      pertanyaan: 'Saat jam makan siang stasiun kasir dan packing mengalami lonjakan antrean panjang, sikap kerja sama tim yang mencerminkan pilar Adaptif adalah:',
      opsi: [
        { label: 'A', teks: 'Duduk santai sambil menertawakan rekan yang kewalahan karena bukan tugas jobdesk saya.' },
        { label: 'B', teks: 'Proaktif berinisiatif membantu packing boks atau clearing meja setelah memastikan tugas utama stasiun sendiri dalam kendali aman.' },
        { label: 'C', teks: 'Meninggalkan outlet untuk pulang lebih awal.' },
        { label: 'D', teks: 'Menyuruh tamu untuk pergi makan di restoran lain.' }
      ],
      jawaban_benar: 'B',
      pembahasan_sop: 'Pilar Adaptif mendorong kru memiliki kepekaan situasi dan saling bantu lintas stasiun demi kelancaran operasional toko.',
      bobot: 4
    },
    {
      id: prefix + '-UMUM-09',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Semua',
      tipe: 'KARAKTERISTIK_PSIKOLOGIS',
      topik: 'Asesmen Karakter Kerja - Ketahanan Stres & Integritas',
      pilar_kompetensi: 'karakter_integritas',
      tingkat_kesulitan: 'Sedang',
      kode_sop: 'PSI-TRAIT-01',
      pertanyaan: 'Ketika Anda sedang lelah di akhir shift, seorang pelanggan komplain dengan nada tinggi karena ia merasa pesanannya kurang 1 porsi saus. Bagaimana respon spontan Anda?',
      opsi: [
        {
          label: 'A',
          teks: 'Menjawab dengan nada ketus dan membantah bahwa pelanggan yang salah tidak mengecek kantong.',
          profil_trait: { dimensi: 'ketahanan_stres', poin: 1, deskripsi: 'Reaktif dan mudah terpancing emosi negatif.' }
        },
        {
          label: 'B',
          teks: 'Tetap tenang mengatur nafas, tersenyum ramah, meminta maaf atas ketidaknyamanan, segera memeriksa tiket nota dan memberikan saus yang dimaksud.',
          profil_trait: { dimensi: 'ketahanan_stres', poin: 5, deskripsi: 'Matang emosi, berkepala dingin, fokus kepuasan pelanggan.' }
        },
        {
          label: 'C',
          teks: 'Mendiamkan pelanggan dan menyuruhnya komplain ke kasir lain.',
          profil_trait: { dimensi: 'fokus_pelanggan', poin: 2, deskripsi: 'Menghindar dari tanggung jawab penyelesaian masalah.' }
        },
        {
          label: 'D',
          teks: 'Meminta maaf sekadarnya lalu menggerutu di belakang punggung pelanggan.',
          profil_trait: { dimensi: 'integritas', poin: 3, deskripsi: 'Patuh semu namun kurang tulus dalam pelayanan.' }
        }
      ],
      jawaban_benar: 'B',
      bobot: 4
    },
    {
      id: prefix + '-UMUM-10',
      minggu: week,
      mingguNomor: weekNomor,
      divisi: 'Semua',
      tipe: 'ESSAY_HOTS',
      topik: 'Studi Kasus Integritas & Nilai Amanah di Tempat Kerja',
      pilar_kompetensi: 'karakter_integritas',
      tingkat_kesulitan: 'Sulit',
      kode_sop: 'PP-INTEGRITAS-02',
      pertanyaan: 'Studi Kasus: Anda melihat salah satu rekan kerja shift Anda diam-diam memasukkan 2 potong ayam goreng display ke dalam tas pribadinya saat toko hendak tutup tanpa seizin Kepala Outlet dan tanpa nota transaksi. Rekan tersebut membujuk Anda untuk merahasiakannya. Sebagai insan kru yang memegang teguh nilai Amanah Hara Chicken, tindakan apa yang harus Anda lakukan?',
      kata_kunci_essay: ['menolak', 'amanah', 'teguran', 'lapor kepala outlet', 'jujur', 'integritas perusahaan'],
      pembahasan_sop: 'Tindakan: 1) Menolak tegas untuk berkompromi, 2) Ingatkan rekan tentang amanah dan risiko sanksi PHK, 3) Laporkan secara objektif ke Kepala Outlet untuk mencegah kerugian perusahaan.',
      bobot: 10
    }
  ];

  return [...kasir, ...kitchen, ...geprek, ...helper, ...umum];
}

const allQuestions = [
  ...createWeekQuestions('MINGGU_1', 1),
  ...createWeekQuestions('MINGGU_2', 2),
  ...createWeekQuestions('MINGGU_3', 3),
  ...createWeekQuestions('MINGGU_4', 4)
];

console.log('Total questions to generate:', allQuestions.length);

const templateFile = fs.readFileSync(path.resolve(__dirname, 'scripts/generate_bank_soal.js'), 'utf-8');
const topSection = templateFile.split('console.log("Helper template ready");')[0].replace("const contentTop = \`", "").replace("\`;\\n", "");

const generatedTsContent = topSection + '\n// ==========================================================================\n// BANK SOAL RESMI HARA CHICKEN: ISOLASI KETAT JOBDESK & SOP TERBARU\n// Total Soal: ' + allQuestions.length + ' butir\n// Kasir: 16 butir/minggu | Kitchen: 16 butir/minggu | Geprek: 16 butir/minggu | Helper: 16 butir/minggu | Umum: 10 butir/minggu\n// ==========================================================================\nexport const BANK_SOAL_MINGGUAN: SoalUjianMingguan[] = ' + JSON.stringify(allQuestions, null, 2) + ';\n';

fs.writeFileSync(targetPath, generatedTsContent, 'utf-8');
console.log('Successfully written to', targetPath);
