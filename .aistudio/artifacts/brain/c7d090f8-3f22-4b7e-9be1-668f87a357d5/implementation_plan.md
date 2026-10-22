# Sistem Penilaian Onboarding & Analitik Lengkap HARA Chicken

Pengembangan lanjutan sistem penilaian onboarding kru HARA Chicken berbasis standar resmi SOP (PDF 29 halaman): menghadirkan dashboard analitik komprehensif, pemisahan ketat produk Day 1 dan Day 2 (per batch & station), pencarian produk cepat dan efisien, auto-generate pertanyaan knowledge per produk, akun penilai resmi, sertifikat kelulusan digital, dan laporan kru mendalam.

---

> [!IMPORTANT]
> **Keputusan Kunci yang Dikonfirmasi**:
> 1. **Pemisahan Sertifikat & Laporan Kru**:
>    - **Sertifikat Kelulusan**: Dokumen/canvas visual sederhana dan elegan sebagai bukti kelulusan onboarding (tanpa terlalu formal/kaku), mencantumkan nama kru, tanggal, predikat kelulusan (Kompeten Mandiri / Lulus Pendampingan), dan nama penilai.
>    - **Laporan Kru Mendalam**: Halaman/dokumen terpisah yang merinci riwayat produk apa saja yang dipraktikkan kru pada Day 1 dan Day 2, analisis capaian teknis (suhu/gramatur/waktu), evaluasi sikap & kebersihan, skor knowledge, serta titik kritis yang perlu pendampingan.
> 2. **Akun Pengguna & Hak Akses**:
>    - Menyimpan hanya akun **Admin** dan 4 Penilai: **Haikal**, **Jihan**, **Feri**, dan **Ari**.
>    - Password seragam default: `hara123` dengan opsi ganti kata sandi. Menghapus akun demo lainnya dari sistem login.
> 3. **Pemisahan Day 1 & Day 2**:
>    - Day 1 (Batch 1: S1, S2, S3; Batch 2: S1, S2, S3) dan Day 2 (S1, S2, S3, All Crew) dipisah secara struktural dengan varian menu mandiri (seperti Milkshake Coklat, Strawberry, Vanilla terpisah; Geprek & Krisbar terpisah).

---

## 1. Overview & Core Concept

- **Tujuan**: Memberikan sistem terpadu bagi trainer lapangan (Haikal, Jihan, Feri, Ari) dan manajemen untuk menilai praktik kru baru secara objektif, multi-tab simultan, memantau riwayat audit log penuh, mengkaji metrik kegagalan titik kritis di analitik, serta menerbitkan sertifikat dan laporan komprehensif per peserta.
- **Target Pengguna**:
  - **Trainer / Penilai Lapangan** (Haikal, Jihan, Feri, Ari): Input penilaian produk real-time di dapur/bar saat onboarding.
  - **Admin / Manajemen HARA Chicken**: Melihat analitik lulusan, N-gain pre/post-test, bottleneck produk, dan audit log lengkap.
  - **Kru Baru**: Menerima feedback objektif dan sertifikat onboarding.

---

## 2. Arsitektur UX & Visual Design

- **Prinsip Tampilan**:
  - Geometri rapi dengan border 1px halus, radius sudut 8px (`rounded-lg`), dan tata letak grid simetris.
  - Tema monokrom bersih (putih, abu netral, hitam) dengan aksen merah HARA (`#96171B`), tanpa efek glow atau dekorasi berlebih.
  - Tipografi **Plus Jakarta Sans** dengan angka tabular (`tabular-nums font-mono`) pada timer, suhu, gramatur, dan skor.
- **Fitur Pemilihan Produk Cepat (Anti-Dropdown Hitam)**:
  - Menggantikan select box kaku dengan **Searchable Product Selector Grid / Command Palette** dilengkapi filter cepat:
    - Tab: `Semua` | `Day 1 - Batch 1` | `Day 1 - Batch 2` | `Day 2`
    - Filter Station: `S1` | `S2` | `S3` | `All Crew`
    - Instant Live Search bar untuk mengetik nama produk (misal ketik "ayoli", "milkshake", "nashville").
- **Auto-Generate Knowledge Tester**:
  - Saat produk dipilih, sistem otomatis menyajikan 2-3 pertanyaan singkat spesifik dari SOP card bank PDF (misal: "Berapa suhu dropping ayam?", "Berapa gram bumbu Nashville?", "Alat apa yang wajib digunakan untuk uleg sambal bawang?").
  - Penilai cukup menanyakan langsung secara lisan dan mengklik toggle Benar / Salah.
- **Pembersihan Judul Sub-Menu**:
  - Menghilangkan penomoran mekanis (`1.`, `2.`, `//`) di onboarding agar judul navigasi tampil alami dan profesional.

---

## 3. Struktur Produk & Station Sesuai Instruksi

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             DAY 1 (HARI PERTAMA)                            │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ BATCH 1                              │ BATCH 2                              │
│ • Station 1: Nasi 4 Cup (D1),        │ • Station 1: Geprek ORI,             │
│   Teh 10 lt (D1), Sup Sayur          │   Krisbar Geprek, Geprek Mozarella   │
│ • Station 2: Goreng Ayam (160°C),    │ • Station 2: Hot Nashville (30g+1g), │
│   Scrembel, Spinach (90s), Indomie   │   Mentai Krispi, Geprek Mentai,      │
│ • Station 3: Goreng Terong (150°C),  │   Krisbar Krispi, Ayoli Krispi       │
│   Sambal Bawang, Goreng Ayam Utuh    │ • Station 3: Nasi Goreng Geprek,     │
│                                      │   Geprek Keju Parut, Geprek Ayoli    │
├──────────────────────────────────────┴──────────────────────────────────────┤
│                             DAY 2 (HARI KEDUA)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ • Station 1: Nasi 4 Cup (D2), Goreng Kulit (150°C), Milkshake Coklat,       │
│   Milkshake Strawberry, Milkshake Vanilla                                   │
│ • Station 2: Teh 8 lt (D2), Sambal Matah (30g), Sambal Daun Jeruk (30g),    │
│   Susu Coklat (Sucok)                                                       │
│ • Station 3: Menggoreng Ayam (160°C), Es Orange (1 Porsi Segar)             │
│ • All Crew : Goreng Jamur Enoki (150°C, 3m), Kentang Goreng (5m)            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Rincian Modul & Fitur yang Dikembangkan

### A. Manajemen Pengguna & Otentikasi
- Pengguna yang aktif hanya:
  - `admin` (Role: SUPER_ADMIN)
  - `haikal` / Haikal (Role: TRAINER)
  - `jihan` / Jihan (Role: TRAINER)
  - `feri` / Feri (Role: TRAINER)
  - `ari` / Ari (Role: TRAINER)
- Password awal seragam: `hara123` dengan dialog/modal ganti kata sandi. Hapus akun demo lainnya dari login page.

### B. Halaman Form Penilaian Praktik Lapangan
- Multi-Tab Penilaian Simultan (bisa menilai beberapa kru sekaligus dengan stopwatch mandiri yang tetap berjalan di latar belakang).
- Input nama kru: Bisa memilih dari daftar atau **mengetik nama baru secara manual**.
- Selector produk modern dengan live search & chips kategori Day/Batch/Station.
- Logika objektif sesuai PDF:
  - Suhu hanya muncul untuk produk deep fryer / minyak (Goreng Ayam, Goreng Kulit, AU, Jamur, Terong).
  - Gramatur muncul untuk produk bertarget berat (Nasi 170g, Bumbu ECO 20g, Sambal 30g, Jamur 50g, Kentang 100g, Nashville 30g).
  - Stopwatch durasi aktual vs standar durasi SOP.
  - Ceklis 6 titik kebersihan & 6 indikator kerjasama.
  - Auto-generate pertanyaan knowledge lisan.
  - Kalkulasi KKM otomatis: **KOMPETEN MANDIRI (≥85)**, **LULUS PENDAMPINGAN (80-84)**, **REMEDIAL (<80 atau gagal titik kritis Day 2)**.

### C. Dashboard Analitik Onboarding Komprehensif
- Mengadopsi visualisasi dan grafik lengkap dari PDF 29 halaman:
  1. **Tingkat Ketepatan Waktu per Produk (% On-Time Rate)**.
  2. **Tingkat Kegagalan Titik Kritis per Produk (% Critical Fail Rate)**.
  3. **Evaluasi Pengetahuan Pre-test vs Post-test & Skor N-Gain**.
  4. **Distribusi Kelulusan (Kompeten Mandiri vs Pendampingan vs Remedial)**.
  5. **Profil Radar/Bar 5 Kriteria Utama** (Ketepatan 30%, Waktu 20%, Kebersihan 15%, Kerjasama 15%, Knowledge 20%).
  6. **Filter Analisis Multidimensi**: Berdasarkan Kru, Batch (Batch 1 / Batch 2), Hari (Day 1 / Day 2), dan Outlet.

### D. Audit Log & Riwayat Aktivitas Penuh
- Tabel riwayat audit aktivitas penilaian dengan filter pencarian, filter tanggal, status kelulusan, dan penilai.
- Detail drawer / modal untuk melihat lembar penilaian lengkap per sesi.

### E. Canvas Sertifikat Kelulusan & Laporan Kru Lengkap
1. **Sertifikat Kelulusan Onboarding Sederhana**:
   - Tampilan sertifikat digital bertema HARA Chicken yang bersih dan elegan (sudut 8px, aksen merah HARA, stempel status "KOMPETEN MANDIRI").
   - Dilengkapi tombol Cetak / Unduh (PNG/PDF).
2. **Laporan Praktik Kru Komprehensif**:
   - Halaman laporan mendalam per kru: ringkasan performa Day 1 vs Day 2, daftar seluruh produk yang dibuat, deviasi waktu/suhu/gramatur, penilaian sikap, dan rekomendasi penempatan outlet.

---

## 5. Rencana Eksekusi Bertahap

1. **Pembaruan Data & Master SOP (`src/lib/sopData.ts` & `src/types/index.ts`)**:
   - Tambahkan pemisahan Day 1 Batch 1, Day 1 Batch 2, dan Day 2 dengan station masing-masing.
   - Daftarkan varian milkshake dan geprek/krisbar secara terpisah.
   - Tambahkan bank pertanyaan knowledge singkat per produk.
2. **Pembaruan Otentikasi & Akun Penilai (`src/data/mockData.ts` & `src/components/LoginPage.tsx`)**:
   - Daftarkan `admin`, `Haikal`, `Jihan`, `Feri`, dan `Ari` dengan password `hara123`.
   - Hapus akun-akun demo lain.
3. **Penyempurnaan Form Penilaian (`src/components/trainer/OnboardingProductPracticeView.tsx`)**:
   - Implementasikan Searchable Product Selector efisien (pengganti dropdown hitam).
   - Hubungkan auto-generate pertanyaan knowledge.
   - Dukung pengetikan manual nama kru.
4. **Pembaruan Dashboard Analitik (`src/components/OnboardingAnalyticsDashboard.tsx`)**:
   - Sinkronisasi chart dan grafik dengan PDF: % on-time, % critical fail, N-gain pre/post test, per-batch, per-outlet.
5. **Implementasi Canvas Sertifikat & Laporan Kru (`src/components/trainer/CrewOnboardingReportModal.tsx` & `src/components/trainer/MiniCertificateModal.tsx`)**:
   - Buat komponen sertifikat onboarding sederhana dan laporan kru komprehensif.
6. **Verifikasi & Build (`compile_applet`)**:
   - Pastikan bebas dari error TypeScript dan dev server berjalan optimal.
