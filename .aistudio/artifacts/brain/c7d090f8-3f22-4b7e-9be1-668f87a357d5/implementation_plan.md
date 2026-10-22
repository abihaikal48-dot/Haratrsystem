# Implementation Plan - Integrasi Fitur Cadangan Data, SOP Baku HARA, Konsolidasi Multi-Produk Harian, & Analitik RnD Super Lengkap

Rencana kerja ini disusun untuk memenuhi seluruh kebutuhan pengembangan aplikasi pelatihan & evaluasi onboarding HARA Chicken berdasarkan klarifikasi pengguna dan dokumen SOP resmi (`SOP/HC/09` & `HC-SOP-11-PKP`).

---

## User Requirements Summary & Clarifications
1. **Pencadangan & Penghapusan Data (Backup & Restore)**:
   - Fitur ekspor/impor berkas JSON & Excel (.xlsx/.csv) untuk data penilaian onboarding & RnD.
   - Fitur hapus data masal (bulk delete per batch/periode/pencarian) serta hapus item individual dengan modal konfirmasi keamanan.
2. **Integrasi Halaman Kurikulum & RnD**:
   - Tautan langsung antara Roadmap Kurikulum 3 Hari dengan Praktik Produk & Evaluasi RnD.
   - Data status peserta (terdaftar, nilai harian, progres kelulusan) tersinkronisasi otomatis dua arah antara tab Kurikulum dan tab Praktik RnD.
3. **Penyelarasan Langkah Penilaian dengan SOP Resmi**:
   - Memastikan seluruh indikator checklist, suhu (misal: suhu kompor 175°C, suhu minyak fryer 160°C, holding warmer >70°C), durasi (SOS), serta tata tertib (grooming, APD, 4 warna lap) sesuai dokumen SOP resmi `HC-SOP-11-PKP`.
4. **Konsolidasi Nilai Multi-Produk Harian**:
   - Dalam 1 hari pelatihan, peserta menguji beberapa produk.
   - **Prosedur (30%)** dan **Waktu/SOS (25%)** diukur secara spesifik per produk.
   - **Kebersihan (15%)**, **Kerjasama (15%)**, dan **Keaktifan (15%)** diukur sebagai nilai harian global kandidat (Lab RnD / Training Center) dan secara otomatis digabungkan (*consolidated composite score*) menjadi nilai akhir hari/sesi kandidat.
5. **Pengembangan Analitik & Evaluasi RnD Super Lengkap**:
   - Chart Komparasi Durasi Aktual vs Standar SOS per Produk.
   - Radar Chart 5 Pilar Kompetensi (Prosedur, Waktu, Kebersihan, Kerjasama, Keaktifan) per Outlet/Batch.
   - Donut/Pie Chart Distribusi Kelulusan (Kompeten Mandiri, Lulus Pendampingan, Remedial Kritis).
   - Line Chart Trend Line Peningkatan Skor Pre-Test vs Post-Test & Efektivitas Pelatihan (N-Gain).
   - Laporan Rapor Kru & Laporan Batch per Periode yang sangat detail, bersih (tanpa kop), dan siap cetak.

---

## Proposed Changes & File Target Plan

### 1. Storage & Data Backup Module (`/src/lib/storage.ts` & `/src/lib/firestoreSync.ts`)
- Tambahkan helper ekspor & impor JSON/Excel data penilaian onboarding & RnD.
- Tambahkan helper `deletePenilaianPraktikProdukBulk` dan `clearBatchPenilaian`.
- Pastikan pencadangan data juga terhubung langsung dengan Firestore sync.

### 2. Integrasi Kurikulum & RnD (`/src/components/KurikulumRoadmapView.tsx` & `/src/components/trainer/OnboardingProductPracticeView.tsx`)
- Tambahkan pintasan cepat dari sesi Kurikulum Day 1/Day 2 ke formulir pengujian produk terkait.
- Tampilkan indikator status praktik live kandidat langsung di kartu peserta Kurikulum.

### 3. Konsolidasi Multi-Produk Harian (`/src/components/trainer/OnboardingProductPracticeView.tsx`)
- Sediakan tab/toggle "Penilaian Harian Global Kandidat" untuk evaluasi Kebersihan (15%), Kerjasama (15%), dan Keaktifan (15%).
- Buat kalkulasi otomatis yang menggabungkan rata-rata skor Prosedur & Waktu dari semua produk yang diuji hari tersebut dengan skor harian global.

### 4. Pusat Cadangan & Manajemen Data (`/src/components/SistemDanEksporView.tsx` & Modals)
- Sediakan antarmuka Ekspor / Impor Cadangan Data Penilaian Onboarding (JSON & Excel).
- Sediakan antarmuka Hapus Data Bertingkat (Hapus per item, Hapus per Batch/Periode, Hapus Massal terfilter).

### 5. Peningkatan Visualisasi Data Analitik (`/src/components/OnboardingAnalyticsDashboard.tsx` & `/src/components/trainer/OnboardingDataAnalystView.tsx`)
- Tambahkan Recharts BarChart untuk Durasi vs Standar SOS per Produk.
- Tambahkan RadarChart 5 Pilar per Outlet & per Batch.
- Tambahkan DonutChart Distribusi Kelulusan.
- Tambahkan LineChart Peningkatan N-Gain.
- Perbarui format Rapor Kru & Laporan Batch tanpa kop agar sangat rapi, objektif, dan super rinci.

---

## Verification Plan
1. Uji linting dengan `lint_applet` (`tsc --noEmit`).
2. Uji kompilasi dengan `compile_applet`.
3. Verifikasi runtime ekspor JSON/Excel, hapus massal, dan visualisasi grafik di browser preview.
