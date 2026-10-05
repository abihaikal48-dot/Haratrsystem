# Peningkatan Rapor Super-Detail, Kurikulum OJT Non-Linear, Integrasi KSA & Redesain Dashboard

Rencana komprehensif untuk menyempurnakan sistem evaluasi HARA Chicken: fleksibilitas modul OJT 30 hari non-linear per stasiun, integrasi terpadu Uji Lisan HACCP ke dalam pilar *Knowledge*, penyusunan Rapor Kru & Rapor Outlet ultra-detail per butir SOP dan langkah kerja, serta transformasi Dashboard menjadi antarmuka korporat modern bebas emotikon.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Keputusan Kunci Terkonfirmasi (Hasil Wawancara Fase 1):**
> 1. **Integrasi Penilaian HACCP**: Uji Lisan HACCP Reasoning disatukan ke dalam pilar **Knowledge** bersama Ujian Teori SOP Baku (Bobot Knowledge 30% = 15% Teori + 15% HACCP Reasoning), sehingga penilaian terpadu, tidak ada duplikasi atau tumpang tindih dengan praktik maupun attitude.
> 2. **Fleksibilitas Checklist OJT 30 Hari**: Sistem mendukung pengisian **Non-Linear (Bebas Urutan)**. Trainer dapat memverifikasi modul kapan pun sesuai shift riil gerai tanpa terkunci urutan tanggal 1 s.d. 30, sehingga kru yang masuk akhir bulan tetap dapat dinilai secara adil dan objektif.
> 3. **Spesialisasi Jobdesk OJT (Kitchen, Kasir, Geprek, Helper)**: Mengadopsi struktur standar industri QSR HARA Chicken: Modul dasar universal (Hari 1-3: Orientasi, Grooming, Sanitasi, Bahan Baku) berlaku untuk semua kru, dilanjutkan dengan modul penugasan stasiun inti sesuai jabatan kru dengan modul stasiun lain sebagai rotasi lintas-fungsi (*cross-training backup*).

---

## 1. Overview & Core Concept

### What It Does
* **Sistem Evaluasi Terpadu KSA (Knowledge, Skill, Attitude)**:
  * **Knowledge (30%)**: Uji Teori SOP (15%) + Uji Lisan HACCP Reasoning (15%).
  * **Skill (45%)**: Uji Praktik Stopwatch SOS, Akurasi Gramatur, dan Suhu Deep Fryer 160°C.
  * **Attitude (25%)**: Audit Objektif Visi-Misi H.A.R.A (Halal & Higienis, Amanah & Akurasi, Responsif, Adaptif).
* **Monitoring OJT 30 Hari Non-Linear**: Trainer dapat memverifikasi modul harian dalam urutan apa pun berdasarkan rotasi shift aktual gerai, disertai pelacakan tanggal verifikasi riil per butir modul.
* **Rapor Kru Ultra-Detail**: Laporan resmi yang membedah kepatuhan kru hingga ke tingkat **per SOP dan per langkah operasional**, dilengkapi bukti fisik observasi, kalkulasi Z-Score kohort, radar spiderweb 8-dimensi, dan rekomendasi preskriptif suksesi karir.
* **Rapor Outlet Komprehensif**: Audit 5 pilar gerai (Service, Kualitas Rasa, Kebersihan 5S, Leadership, Kepuasan Pelanggan) dengan rincian temuan per stasiun dan rencana perbaikan jam sibuk.
* **Dashboard Korporat Clean & Elegan**: Dashboard modern minimalis dengan tata letak informasi padat (*data-dense*), indikator status stasiun, dan 100% menggunakan ikon vektor SVG murni tanpa emotikon.

### Target Audience & Persona
* **Lead Operational Trainer (Haikal Abi)**: Melakukan verifikasi checklist harian, audit gerai, dan menerbitkan rapor resmi yang dapat dipertanggungjawabkan kepada manajemen.
* **Store Manager / Supervisor Outlet**: Memantau kesiapan solo-shift kru baru dan melihat rekomendasi penempatan jam sibuk.
* **Manajemen & Direksi**: Meninjau ringkasan performa gerai berbasis data empiris (Z-Score dan distribusi kurva normal).

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Verifikasi OJT Non-Linear**:
   * Trainer membuka halaman **Monitoring Kru OJT 30 Hari**.
   * Memilih nama kru (misal: Kasir baru yang masuk tanggal 25).
   * Trainer dapat langsung mencentang modul Hari ke-9 (Area Service/Kasir) atau modul lainnya tanpa harus menyelesaikan modul Hari 1-8 terlebih dahulu.
   * Setiap centang merekam tanggal verifikasi dan nama verifikator secara otomatis.
2. **Penerbitan Rapor Kru Komprehensif**:
   * Trainer/Manajer membuka **Rapor Kru**.
   * Menampilkan header resmi berkop surat, rekapitulasi 3 pilar KSA, rincian per langkah SOP (misal: 10 langkah penepungan keriting emas, 5 langkah penggorengan), bukti kepatuhan Visi H.A.R.A, dan action plan karir.
   * Tombol *Cetak Dokumen Resmi (PDF)* siap print dengan format A4 rapi tanpa elemen navigasi.
3. **Pusat Evaluasi Kru Terpadu**:
   * Pengguna melihat 3 pilar KSA yang harmonis: Teori & HACCP (Knowledge), Praktik SOS (Skill), dan Visi-Misi H.A.R.A (Attitude).
   * Menghilangkan keraguan tumpang tindih penilaian HACCP dan Attitude.

### Visual Identity & Theme
* **Palet Warna**: Latar belakang putih bersih (`bg-white`, `bg-slate-50`), aksen merah marun HARA yang terukur (`#8B1418` / `text-rose-700`), border halus (`border-slate-200/80`), dan tipografi kontras tinggi.
* **Tipografi**: Outfit / Inter untuk teks antarmuka modern, JetBrains Mono untuk kode SOP, nomor dokumen, dan data statistik.
* **Ikonografi**: 100% SVG murni (`ChickenIcon`, `CashierIcon`, `ChiliIcon`, `BroomCleanIcon`, dan Lucide Icons) menggantikan seluruh teks emoji.

---

## 3. Key Product Decisions & Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PIRAMIDA EVALUASI KOMPETENSI TERPADU (KSA)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   [ 1. KNOWLEDGE (30%) ]                                                    │
│   ├── Ujian Teori SOP Baku (15%)       --> Bank Soal Objektif (Pilihan Ganda)│
│   └── Uji Lisan HACCP Reasoning (15%)  --> Pemahaman "Why behind SOP"        │
│                                                                             │
│   [ 2. SKILL (45%) ]                                                        │
│   ├── Praktik Stopwatch SOS (25%)      --> Detik Layanan, Gramatur & Suhu    │
│   └── Kepatuhan Langkah Kritis (20%)   --> Audit Prosedural Per Stasiun      │
│                                                                             │
│   [ 3. ATTITUDE H.A.R.A (25%) ]                                             │
│   ├── H : Halal & Higienis (6.25%)     --> APD, JPH, Sanitasi, Zero Silang   │
│   ├── A1: Amanah & Akurasi (6.25%)     --> Kasir POS, Chilling, Gramatur     │
│   ├── R : Responsif Layanan (6.25%)    --> SOS <120s, Tanggap Rush Hour      │
│   └── A2: Adaptif Belajar (6.25%)      --> SOP Baru, Respon Evaluasi Shift   │
│                                                                             │
│   =======================================================================   │
│   SKOR KOMPOSIT AKHIR = (Knowledge×0.30) + (Skill×0.45) + (Attitude×0.25)   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Rincian Perubahan Modul:
1. **`src/components/DashboardView.tsx`**:
   * Hapus seluruh sisa teks emoticon (seperti `⚠️` dan `✓` di riwayat aktivitas).
   * Tambahkan visualisasi ringkasan stasiun dengan ikon SVG (`ChickenIcon`, `CashierIcon`, dll.).
   * Integrasikan KPI live status OJT non-linear dan kepatuhan suhu fryer.
2. **`src/components/trainer/OfficialHaraMonitoringMatrix.tsx` & `CrewTrainingMonitoringView.tsx`**:
   * Berikan tombol dan mekanisme pengisian **Bebas Urutan (Non-Linear)**.
   * Trainer dapat memilih modul apa saja yang telah selesai dipraktikkan kru pada shift terkait.
   * Tampilkan label stasiun spesifik (Kitchen, Kasir, Geprek, Helper) pada kolom modul agar supervisor tahu fokus jobdesk masing-masing.
3. **`src/components/reports/OfficialRaporKru.tsx` & `analyticsEngine.ts`**:
   * Tambahkan sub-tabel **Rincian Per Langkah Kerja SOP & Parameter Kritis** (menampilkan status langkah demi langkah untuk stasiun utama kru).
   * Integrasikan Uji Lisan HACCP ke dalam bagian *Knowledge* bersama Ujian Teori SOP.
   * Tampilkan lembar kepatuhan 4 Pilar Visi-Misi H.A.R.A secara mendalam dengan bukti observasi riil.
4. **`src/components/reports/OfficialRaporKinerjaOutlet.tsx`**:
   * Perkaya rincian audit gerai dengan rekapitulasi kepatuhan stasiun kerja (Kitchen, Kasir, Geprek, Helper).
   * Sertakan temuan deviasi operasional dan rekomendasi perbaikan jam sibuk (*Rush Hour Action Plan*).
5. **`src/components/PelatihanEvaluasiView.tsx` & `KompetensiView.tsx`**:
   * Perbarui label tab agar menyajikan piramida KSA yang padu: Uji Lisan HACCP diberi keterangan jelas sebagai bagian dari pilar *Knowledge*.

---

## 4. Execution Step Sequence

1. **Step 1 - Pembersihan & Upgrade Dashboard**:
   * Perbaiki baris emoji di `DashboardView.tsx`.
   * Perindah kartu stasiun dan indikator performa shift.
2. **Step 2 - Fleksibilitas OJT 30 Hari Non-Linear**:
   * Perbarui komponen `OfficialHaraMonitoringMatrix.tsx` untuk mendukung verifikasi non-linear bebas tanggal kalender.
   * Tampilkan filter dan indikator jobdesk spesifik (Kitchen, Kasir, Geprek, Helper).
3. **Step 3 - Integrasi KSA & Harmonisasi HACCP di Pusat Evaluasi**:
   * Sinkronkan bobot Knowledge (Teori 15% + HACCP 15% = 30%) di `PelatihanEvaluasiView.tsx` dan `storage.ts`.
4. **Step 4 - Rapor Kru & Rapor Outlet Super-Detail**:
   * Perkaya `OfficialRaporKru.tsx` dengan tabel langkah SOP detail, parameter mutu kritis, checklist Visi HARA, dan rekomendasi karir.
   * Sempurnakan `OfficialRaporKinerjaOutlet.tsx` dengan diagnosa jam sibuk gerai.
5. **Step 5 - Verifikasi Kompilasi & Build**:
   * Jalankan `compile_applet` untuk memastikan seluruh tipe data, komponen, dan handler berfungsi 100%.
