# Blueprint Pembangunan Ulang Sistem Ujian & Bank SOP HARA Chicken

Membangun ulang sistem ujian kru secara terstruktur, masif, aman, dan rapi dengan integrasi proteksi integritas ujian (anti-cheat), sistem penilaian karakter situasional multidimensi (SJT), pemulihan & perluasan Bank SOP 4 Jobdesk lengkap (Kitchen, Kasir, Geprek, Helper), serta pengesahan dokumen SOP baku terbaru dari Departemen R&D (Mentai, Ayoli, Rendang, dan Nasi Goreng Revisi 02).

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Ringkasan keputusan berdasarkan jawaban Anda pada sesi klarifikasi:
> 1. **Penilaian Karakter Terpadu**: Evaluasi karakter & psikologi kru disatukan langsung di dalam satu sesi ujian (*embedded Situational Judgment Test*), mengukur 5 dimensi inti (Integritas, Ketahanan Stres, Fokus Pelanggan, Disiplin SOP, Kerjasama Tim) melalui skenario studi kasus operasional nyata gerai.
> 2. **Keamanan & Integritas Ujian (Tanpa PIN)**: Kru dapat memulai ujian secara mandiri tanpa repot meminta PIN supervisor, namun dilindungi fitur proteksi canggih: deteksi pindah tab/window blur (*cheat warning*), watermark dinamis identitas kru (anti-kebocoran soal), penguncian sesi sekali pakai (*single-session lock*), dan tombol submit konfirmasi anti-kelupaan.
> 3. **Integrasi Dokumen SOP R&D Baru**: 4 dokumen SOP baku (Mentai, Ayoli, Rendang, Nasi Goreng Rev 02) diintegrasikan serentak ke: (a) Bank SOP Master, (b) Modul Stasiun Kerja, dan (c) Paket Bank Soal Ujian Jobdesk terkait.
> 4. **Pemulihan Bank SOP 4 Jobdesk**: Memastikan Bank SOP menampilkan seluruh 4 jobdesk (Kitchen, Kasir, Geprek, Helper) secara utuh, rapi, dan tersinkronisasi tanpa hilang atau tertutup filter.

---

## 1. Overview & Core Concept

Sistem ini didesain sebagai **Enterprise Assessment & Standard Operating Procedure Engine** untuk HARA Chicken. Platform ini menghubungkan standarisasi resep & operasional harian gerai dengan pembuktian kompetensi kru lapangan secara objektif, aman, dan terukur.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   HARA OPERATIONS & ASSESSMENT ENGINE                  │
├────────────────────────────────┬───────────────────────────────────────┤
│    BANK SOP & WORKSPACE 4 DIV  │      SISTEM UJIAN KRU TERINTEGRASI    │
│  ┌───────────────────────────┐ │  ┌──────────────────────────────────┐  │
│  │ Kitchen (26 SOP + Rendang)│ │  │ Timer Sesi Dinamis (25-30 Menit) │  │
│  │ Kasir (10 SOP + Verif)    │ │  │ Bebas Navigasi Butir Soal 1..26  │  │
│  │ Geprek (24 SOP + Mentai/  │ │  │ Isolasi Mutlak Jobdesk Kru       │  │
│  │         Ayoli)            │ │  │ Proteksi Pindah Tab & Blur       │  │
│  │ Helper (16 SOP Logistik)  │ │  │ Watermark Sesi Anti-Bocor Soal   │  │
│  └───────────────────────────┘ │  └──────────────────────────────────┘  │
├────────────────────────────────┴───────────────────────────────────────┤
│            DRAFT SISTEM EVALUASI KARAKTER MULTIDIMENSI (SJT)           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 5 Dimensi: Integritas • Ketahanan Stres • Customer • SOP • Tim   │  │
│  │ Analisis Radar 4 Pilar • Profil Arketipe • Rekomendasi Trainer   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Rencana Implementasi Terstruktur

### A. Integrasi Dokumen SOP Resmi R&D (Update & Penambahan)
Merujuk langsung pada 4 dokumen PDF resmi:

1. **SOP Nasi Goreng dan Telur Dadar (`SOP-NasGorTelur-02` Revisi 02, Berlaku 10 Okt 2025)**:
   - *Bahan baku Nasi Goreng*: Nasi 170 gr (wajib ditimbang), Minyak goreng 15 ml (sendok takar), Mix sayur 30 gr (sendok takar), Bumbu nasi goreng ECO 20 gr (wajib ditimbang).
   - *Teknik masak*: Wajan panas api sedang + minyak 15 ml -> mix sayur 30 gr layu -> bumbu ECO 20 gr harum -> nasi 170 gr aduk tekan sutil cepat -> masak api besar hingga matang rata.
   - *Penyajian Nasi Goreng*: Piring saji (dine in) / box (take away), 2 slice timun, telur dadar di atas nasi, sendok + kertas nasi (take away).
   - *Telur Dadar*: 1 butir telur + mix garam 1/2 sendok takar (1 gr) dikocok garpu/whisk sedikit berbusa larut, digoreng minyak 50 ml api sedang keemasan balik sekali. Telur ekstra disajikan piring kecil (dine in) atau box (take away).
   - *Tindakan*: Memperbarui seluruh entri SOP Nasi Goreng dan Telur Dadar di `sopData.ts`, `storage.ts`, dan bank soal.

2. **SOP Ayam Geprek Saus Mentai & Ayam Krispi Saus Mentai (`SOP-AyamSausMentai-01`, Berlaku 11 Mei 2026)**:
   - *Peralatan*: Gas portable & torch pembakar, alat geprek, capitan, piring/box, 2 solet.
   - *Bahan*: Ayam krispi, saus mentai, bumbu sambal geprek. Daya simpan saus mentai dalam showcase: 5 hari dari pengiriman produksi.
   - *Geprek Saus Mentai*: Ulek sambal geprek halus -> geprek ayam krispi hingga hancur -> padatkan perlahan -> beri saus mentai di atas ayam -> torch hingga sedikit kecokelatan merata -> angkat gunakan 2 solet ke piring/box -> 2 slice timun.
   - *Krispi Saus Mentai*: Ayam krispi di atas cobek -> beri saus mentai -> torch sedikit kecokelatan merata -> angkat ke piring/box.
   - *Divisi*: Stasiun Geprek (`divisi: 'Geprek'`).

3. **SOP Saus Ayoli (`SOP-SausAyoli-01`, Berlaku 13 Mei 2026)**:
   - *Peralatan*: Alat geprek, capitan, piring/box, garpu pengaduk.
   - *Bahan*: Ayam krispi, saus ayoli (campuran chili oil & mayones), bumbu geprek. Daya simpan showcase: 5 hari.
   - *Geprek Saus Ayoli*: Ulek sambal halus -> geprek ayam hancur -> pindahkan ke piring/box rapi -> siapkan 1 cup saus ayoli yang diaduk dengan garpu -> tuang di atas ayam + 2 slice timun.
   - *Krispi Saus Ayoli*: Ayam krispi di piring/box -> tuang 1 cup saus ayoli teraduk -> sajikan.
   - *Poin Kritis Pelayanan Kasir*: Permintaan memisahkan saus diperbolehkan, dengan syarat Kasir wajib menanyakan terlebih dahulu pada saat pemesanan dilakukan apakah saus ayoli ingin dicampur atau dipisah.
   - *Divisi*: Stasiun Geprek (`divisi: 'Geprek'`) & materi pelayanan Kasir.

4. **SOP Proses Penyajian Saus Rendang (`SOP-PenyejianSausRendang-01`, Berlaku 10 Feb 2026)**:
   - *Penerimaan*: Kemasan food grade bertanggal, cek bau/warna/kebocoran.
   - *Penyimpanan*: Chiller suhu maks 4°C, metode FIFO. Daya simpan: suhu ruang 3 hari (20-30°C), showcase 5-7 hari.
   - *Dine In (Campur)*: Ayam krispi di piring saji, saus rendang cair suhu ruang disiram perlahan rata di atas ayam, tidak meluber ke pinggir piring.
   - *Dine In (Pisah)*: Ayam krispi di piring saji + 1 cup saus rendang di samping ayam.
   - *Take Away (Campur)*: Box dilapisi PLASTIK (seperti Nashville), ayam disiram saus rata, tutup rapi.
   - *Take Away (Pisah)*: Box dilapisi KERTAS NASI, ayam di box + 1 cup saus rendang kemas rapat terpisah.
   - *Poin Kritis Kasir*: Kasir wajib menanyakan ke pelanggan apakah saus rendang ingin dipisah atau langsung dituang.
   - *Divisi*: Stasiun Kitchen & Stasiun Geprek & Stasiun Kasir.

---

### B. Perbaikan & Pemulihan Katalog Bank SOP 4 Jobdesk Lengkap
- **Penyebab Masalah**: Di sidebar dan routing, tab "Katalog & Bank SOP" sempat tersambung langsung ke workspace stasiun tunggal dan terjadi filter parsial saat sinkronisasi database lokal.
- **Solusi**:
  1. Menghadirkan **Katalog Master Bank SOP Multi-Tab** yang secara default menampilkan 4 Jobdesk:
     - Tab **Semua SOP** (75+ Prosedur Resmi)
     - Tab **Kitchen & Fryer** (26 Prosedur)
     - Tab **Geprek & Sambal / Saus** (24 Prosedur)
     - Tab **Kasir & Pelayanan POS** (10 Prosedur)
     - Tab **Helper & Sanitasi Gudang** (16 Prosedur)
  2. Menyediakan tombol *Force Resync / Reload Master SOP* di UI untuk memastikan kru dan trainer selalu memuat edisi lengkap tanpa terpotong cache lokal.
  3. Memperbarui `StationWorkspaceView` agar perpindahan antar 4 tombol stasiun langsung memuat SOP divisi terkait secara dinamis dan responsif.

---

### C. Draft Sistem Penilaian Karakter Kru Multidimensi (SJT Terpadu)
Sesuai arahan Anda untuk mengukur kepribadian dan karakter kru secara mendalam di dalam sesi tes:

1. **5 Dimensi Karakter Kerja (Skor 0 - 100)**:
   - **Integritas & Amanah (Weight 25%)**: Keteguhan menolak pencurian, kejujuran selisih kas, anti-manipulasi nota/produk afkir, kepatuhan aset gerai.
   - **Ketahanan Stres / Tekanan (Weight 20%)**: Emosi stabil saat rush hour, antrean membludak, kompor/peralatan macet, interaksi dengan rekan yang panik.
   - **Fokus Pelanggan / Hospitality (Weight 20%)**: Keramahan tulus 5S (Senyum, Salam, Sapa, Sopan, Santun), empati menangani komplain, tidak mendebat tamu.
   - **Disiplin SOP & Standar Baku (Weight 20%)**: Tidak memotong jalan pintas (suhu fryer, gramasi bumbu, kebersihan talenan, grooming).
   - **Kerjasama Tim & Adaptabilitas (Weight 15%)**: Kepekaan situasi, proaktif membantu rekan stasiun lain yang kewalahan tanpa meninggalkan tanggung jawab utama.

2. **Mekanisme Skoring Situasional (Situational Judgment Scoring)**:
   - Setiap butir soal skenario memiliki 4 pilihan tindakan operasional nyata dengan bobot trait (poin 1 s.d. 5).
   - Pilihan A, B, C, D merefleksikan reaksi spontan:
     - *Poin 5*: Teladan budaya HARA (Dewasa, amanah, fokus solusi, patuh SOP).
     - *Poin 3-4*: Patuh standar dasar namun kurang proaktif.
     - *Poin 1-2*: Reaktif, menyalahkan pihak lain, kompromi pada mutu/kejujuran.

3. **Output Diagnostik untuk Trainer**:
   - **Tipe Karakter Kerja Terpetakan**:
     - *Ksatria Amanah & Penjaga Standar Baku* (Integritas & Disiplin tinggi)
     - *Front-Liner Responsif & Duta Pelayanan* (Fokus Pelanggan tinggi)
     - *Penggerak Tim & Kolaborator Lintas Stasiun* (Kerjasama & Ketahanan Stres tinggi)
     - *Prajurit Standar Mutu Berdedikasi* (Keseimbangan operasional)
   - **Rekomendasi Bimbingan Personalisasi**: Arahan drill shift khusus bagi trainer lapangan (misal: "Beri pendampingan roleplay komplain jam sibuk").

---

### D. Pembangunan Ulang Sistem Ujian Kru (Aman, Rapi, Masif, Terstruktur)

1. **Keamanan & Anti-Cheat (Tanpa Mempersulit Kru dengan PIN)**:
   - **Deteksi Pindah Tab / Window Blur**: Memberi notifikasi peringatan visual jika kru berpindah ke aplikasi lain saat ujian berjalan (mencatat frekuensi pindah tab).
   - **Watermark Sesi Dinamis**: Menampilkan watermark transparan di latar belakang lembar ujian (Nama Kru, Outlet, Tanggal, Sesi ID) untuk mencegah kebocoran soal via foto ponsel.
   - **Pembatasan Pengerjaan Sekali Pakai (Single-Attempt Token)**: Mencegah pengerjaan ganda atau refresh acak. Setelah tombol submit ditekan, lembar ujian terkunci dan bukti serah terima dikeluarkan.
   - **Proteksi Klik Kanan & Salin Teks**: Menonaktifkan shortcut copy-paste pada teks pertanyaan agar soal tidak disalin ke AI eksternal atau chat grup.

2. **Arsitektur Ujian & Timer Sesi Dinamis**:
   - **Waktu Per Sesi Penuh (25 - 30 Menit)**: Kru bebas mengatur strategi pengerjaan soal (maju-mundur antara nomor 1 s/d 26) tanpa batasan detik per soal.
   - **Isolasi Mutlak Jobdesk**:
     - Kasir: 16 Soal Kasir & Layanan + 10 Soal SOP Umum
     - Kitchen: 16 Soal Kitchen & Nasi Goreng Rev 02 + 10 Soal SOP Umum
     - Geprek: 16 Soal Geprek, Mentai, Ayoli, Sambal + 10 Soal SOP Umum
     - Helper: 16 Soal Helper, Sanitasi, Logistik + 10 Soal SOP Umum
   - **Autosave Real-Time**: Setiap opsi yang dipilih langsung tersimpan ke local state, aman jika browser tak sengaja reload.
   - **Konfirmasi Submit Transparan**: Menampilkan rekap jumlah soal yang sudah terjawab vs belum terjawab sebelum pengiriman final.

---

## 3. Rencana Pengujian & Verifikasi

1. **Verifikasi Bank SOP 4 Jobdesk**: Membuka katalog SOP dan memastikan tab Kitchen (26), Geprek (24), Kasir (10), dan Helper (16) dapat difilter, dicari, dan dibaca detail langkah kerjanya.
2. **Verifikasi SOP Baru**:
   - Memastikan Nasi Goreng Rev 02 menampilkan parameter 170 gr nasi, 20 gr bumbu ECO, 30 gr sayur, api besar, 2 slice timun.
   - Memastikan Mentai menampilkan teknik torch kecokelatan merata, 2 solet, dan masa simpan showcase 5 hari.
   - Memastikan Ayoli menampilkan campuran chili oil & mayones diaduk garpu, kasir tanya pisah/campur.
   - Memastikan Rendang menampilkan packaging box plastik (campur) vs box kertas + cup (pisah), suhu chiller 4°C, kasir tanya tuang/pisah.
3. **Verifikasi Ujian Kru**:
   - Menjalankan simulasi ujian Kasir: memastikan 0% soal goreng ayam.
   - Menjalankan simulasi ujian Kitchen: memastikan soal Nasi Goreng Rev 02 muncul dengan parameter gramatur baru.
   - Menguji fitur anti-cheat (deteksi pindah tab), watermark, dan timer sesi 26-30 menit.
   - Menguji perhitungan profil karakter 5 dimensi dan rekomendasi coaching trainer.
4. **Verifikasi Build**: Menjalankan `compile_applet` dan `lint_applet` guna memastikan build produksi 100% bebas error.
