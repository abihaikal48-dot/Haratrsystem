# Rencana Induk Peningkatan Menyeluruh Sistem HARA PD (Bertahap & Terstruktur)

Rencana ini disusun untuk merespons evaluasi menyeluruh Anda terhadap sistem HARA PD. Pelaksanaan akan dilakukan secara **satu per satu per fase (step-by-step)** agar setiap komponen memiliki kualitas maksimal, teruji, rapi, dan stabil.

---

## Urutan Fase Pengerjaan (Step-by-Step)

```
[FASE 1: Bank SOP 4 Jobdesk & Sinkronisasi]
                   ↓
[FASE 2: Rekonstruksi Sistem Ujian Kru & Keamanan Anti-Cheat]
                   ↓
[FASE 3: Sistem Penilaian Karakter Kru Terpadu (SJT 5 Dimensi)]
                   ↓
[FASE 4: Peningkatan UI & Tampilan Antarmuka Modern]
                   ↓
[FASE 5: Penguatan Keamanan Sistem & Audit Terintegrasi]
```

---

## FASE 1: Restorasi & Validasi Bank SOP 4 Jobdesk Lengkap
*Fokus: Memastikan seluruh dokumen SOP dari 4 divisi (Kitchen, Kasir, Geprek, Helper) tampil 100% lengkap tanpa ada yang hilang atau tersembunyi karena filter/cache.*

### 1.1 Inventarisasi & Pembaruan Bank SOP Resmi (76 Dokumen)
- **Kitchen & Fryer (26 SOP)**:
  - Mengintegrasikan **SOP Nasi Goreng Rev 02 (`SOP-KTC-026`)**: Gramasi 170 gr nasi, 20 gr bumbu ECO, 30 gr sayur potong, teknik api besar, 2 slice timun.
  - SOP Penggorengan Ayam Krispi, Suhu & Timer Fryer, Chiller Ayam Marinated, Penyaringan Minyak, Kaldu & Sup.
- **Geprek & Sambal / Saus (24 SOP)**:
  - Mengintegrasikan **SOP Ayam & Krispi Saus Mentai (`SOP-AyamSausMentai-01`)**: Peralatan torch & 2 solet, daya simpan saus mentai showcase 5 hari, teknik torch kecokelatan merata.
  - Mengintegrasikan **SOP Saus Ayoli (`SOP-SausAyoli-01`)**: Campuran chili oil & mayones diaduk garpu, daya simpan showcase 5 hari, SOP Kasir wajib menanyakan opsi pisah/campur.
  - Mengintegrasikan **SOP Saus Rendang (`SOP-PenyejianSausRendang-01`)**: Standar chiller 4°C, box plastik (campur) vs box kertas + cup (pisah), SOP Kasir wajib menanyakan opsi campur/pisah.
  - SOP Ulekan Sambal Bawang, Sambal Ijo, Sambal Matah, Tingkat Kepedasan Level 1-5.
- **Kasir & Pelayanan POS (10 SOP)**:
  - SOP Pelayanan 5S (Senyum, Salam, Sapa, Sopan, Santun), Penanganan Kas & Kembalian, Rekonsiliasi Mesin EDC/QRIS, Penanganan Komplain Pelanggan, SOP Up-selling & Paket Menu.
  - Standar integrasi penawaran saus (Ayoli & Rendang: konfirmasi pisah/campur).
- **Helper, Sanitasi & Logistik (16 SOP)**:
  - SOP Penerimaan Bahan Baku & FIFO, Cuci Peralatan 3 Bak (Wash, Rinse, Sanitize), Sanitasi Meja Makan & Area Dine-In, Pemilahan Sampah & Greasetrap, Standar Pembersihan Toilet.

### 1.2 Solusi UI & Penanganan Cache
- Memperbaiki filter Bank SOP pada `PelatihanEvaluasiView` dan `StationWorkspaceView` agar selalu memuat seluruh divisi secara default.
- Menyediakan tombol **"Muat Ulang Katalog SOP (Force Resync)"** untuk membersihkan cache browser lokal jika terdapat perubahan data baru.
- Memperbaiki sinkronisasi Firestore `bank_sop` agar tidak menimpa data lengkap lokal dengan snapshot kosong atau parsial.

---

## FASE 2: Rekonstruksi Sistem Ujian Kru & Fitur Keamanan
*Fokus: Membangun sistem ujian yang masif, aman, tanpa PIN yang merepotkan kru, namun berintegritas tinggi.*

### 2.1 Isolasi Jobdesk Mutlak (Zero Cross-Discipline Question)
- Saat kru memilih divisinya (misal: Kasir), paket soal **100% fokus** pada kasir, hospitality, uang kas, sistem POS, dan SOP umum gerai. Tidak ada lagi soal suhu fryer atau teknik penggorengan untuk kasir.
- Bank soal mingguan (Minggu 1 s/d 4) dirancang terstruktur per divisi:
  - **Paket Kitchen**: Standar suhu, porsi Nasi Goreng Rev 02, marinasi, teknik frying, kebersihan dapur.
  - **Paket Kasir**: Transaksi EDC/QRIS, handling komplain, akurasi uang kas, konfirmasi saus baru.
  - **Paket Geprek**: Tekstur geprekan, teknik torch mentai, takaran cup saus ayoli, variasi sambal.
  - **Paket Helper**: Standar FIFO gudang, desinfeksi 3 bak, pengelolaan limbah, sanitasi outlet.

### 2.2 Fitur Keamanan & Integritas Ujian
- **Deteksi Pindah Tab / Window Blur**: Sistem otomatis mendeteksi jika kru beralih aplikasi (membuka WhatsApp, browser lain) dan menampilkan peringatan transparan serta mencatat frekuensi pelanggaran.
- **Dynamic Security Watermark**: Layar ujian dilengkapi watermark transparan (Nama Kru, NIK/ID, Outlet, Timestamp pengerjaan) untuk mencegah kebocoran soal via jepretan kamera ponsel.
- **Anti-Copy & Proteksi Klik Kanan**: Mencegah teks pertanyaan disalin ke clipboard atau dibagikan ke AI/grup luar.
- **Single-Attempt Token & Session Lock**: Kru tidak dapat mengulang ujian secara sembarangan setelah tombol kirim diklik. Hasil langsung terkunci dan tersimpan ke riwayat.
- **Timer Sesi Penuh (25-30 Menit) & Autosave**: Kru dapat maju-mundur mengecek nomor soal yang ragu-ragu dengan navigasi grid nomor tanpa dibatasi detik per nomor.

---

## FASE 3: Sistem Penilaian Karakter Kru Terpadu (SJT Multidimensi)
*Fokus: Mengukur karakter dan kepribadian kru secara objektif melalui soal skenario situasional operasional (SJT).*

### 3.1 Lima Dimensi Karakter Kerja
1. **Integritas & Kejujuran (Bobot 25%)**: Kepatuhan terhadap kas, penolakan gratifikasi/mencuri bahan, anti-manipulasi stok afkir.
2. **Ketahanan Tekanan / Stres (Bobot 20%)**: Pengendalian emosi saat rush hour, antrean panjang, atau kendala peralatan gerai.
3. **Fokus Pelanggan / Hospitality (Bobot 20%)**: Keramahan alami, empati pelayanan, resolusi komplain tanpa berdebat.
4. **Disiplin SOP & Mutu (Bobot 20%)**: Kepatuhan tidak memotong proses standar (gramasi, suhu, kebersihan).
5. **Kerjasama Tim & Inisiatif (Bobot 15%)**: Kepekaan membantu stasiun lain yang kewalahan tanpa mengabaikan tugas pokok.

### 3.2 Output Penilaian untuk Trainer & Supervisor
- **Karakter Radar Chart (Visual 5 Dimensi)** pada dashboard admin dan sertifikat hasil ujian kru.
- **Tipe Karakter Kerja (Workplace Archetype)**:
  - *Front-Liner Unggul & Duta Layanan*
  - *Penjaga Standar Baku & Kepatuhan Mutu*
  - *Kolaborator Tangguh & Penggerak Tim*
  - *Pekerja Teliti & Penjaga Integritas*
- **Rekomendasi Bimbingan (Actionable Coaching Notes)**: Catatan otomatis untuk Store Manager mengenai area yang butuh bimbingan saat shift harian.

---

## FASE 4: Peningkatan UI & Tampilan Antarmuka Modern
*Fokus: Merapikan antarmuka agar intuitif, modern, berkelas, rapi, dan optimal diakses dari smartphone maupun PC outlet.*

- **Penyelarasan Desain (Design System)**: Penggunaan palet warna HARA (Gold, Crimson, Charcoal, Slate) yang elegan dan bersih.
- **Struktur Navigasi yang Bersih**:
  - Penataan tab katalog SOP dengan pemisahan ikon stasiun yang jelas.
  - Lembar ujian responsif dengan drawer daftar nomor soal, status terjawab/belum, dan timer mengambang yang tidak mengganggu.
  - Tampilan kartu materi SOP yang modular, mudah dibaca cepat saat kru berada di stasiun kerja.
- **Pembersihan Elemen Antarmuka**: Menghilangkan inkonsistensi styling dan memperjelas tombol aksi utama (Action Buttons).

---

## FASE 5: Penguatan Keamanan Sistem Menyeluruh & Audit Trail
*Fokus: Menjaga kedaulatan data operasional dan riwayat pengujian.*

- **Dual-Layer Persistence**: Sinkronisasi lancar antara penyimpanan offline (IndexedDB/LocalStorage) dan cloud (Firestore) tanpa saling menimpa data yang valid.
- **Audit Log Pengujian**: Catatan riwayat nilai ujian kru lengkap dengan rekapitulasi waktu pengerjaan, skor per dimensi, dan indikator kepatuhan.
- **Ekspor Laporan**: Fitur unduh laporan hasil evaluasi kru (PDF/Cetak & Excel) untuk manajemen pusat.

---

## Rencana Verifikasi & Uji Kualitas
1. **Verifikasi Katalog 4 Divisi**: Memeriksa tab Kitchen (26), Geprek (24), Kasir (10), dan Helper (16) dapat dibuka dan dicari dengan lancar.
2. **Verifikasi Soal & SOP Baru**: Memastikan Nasi Goreng Rev 02, Mentai, Ayoli, dan Rendang terintegrasi di materi dan bank soal.
3. **Verifikasi Simulasi Ujian Tiap Divisi**: Mencoba ujian sebagai Kru Kasir, Kitchen, Geprek, dan Helper untuk memastikan kesesuaian soal 100%.
4. **Verifikasi Fitur Keamanan**: Menguji peringatan saat tab browser beralih dan memastikan watermark kru tampil jelas.
5. **Verifikasi Build**: Menjalankan `compile_applet` dan `lint_applet` untuk menjamin tidak ada error kode.
