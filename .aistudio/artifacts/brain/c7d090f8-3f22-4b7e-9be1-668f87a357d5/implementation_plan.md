# Rencana Pembaruan Standar Waktu Produk, Pemisahan Evaluasi Kebersihan & Kerjasama, Pendaftaran Batch 10-11 November, dan Konsistensi UI Onboarding

Rencana menyeluruh untuk menyelaraskan durasi standar 29 produk dalam satuan menit, memisahkan penilaian kebersihan dan kerja sama ke sub-tab tersendiri dengan rekapitulasi nilai terpadu, mendaftarkan 12 peserta Onboarding Batch 10-11 November 2026 ke Kru Master dan Supabase, serta menyeragamkan tata letak container dan layout UI di seluruh sub-tab.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan dan konfirmasi utama yang telah diverifikasi bersama pengguna:
> 1. **Satuan Standar Waktu 29 Produk**: Seluruh angka pada 29 produk merupakan target durasi standar dalam satuan **menit** (contoh: Nasi 37 menit, Teh 40 menit, Goreng Ayam 20 menit, dst.) yang dikonversikan ke detik pada timer countdown dan kalkulasi deviasi SOS.
> 2. **Pemisahan Penilaian Kebersihan & Kerjasama**: Formulir evaluasi kebersihan 5S dan kerja sama tim dipisahkan dari formulir stopwatch produk agar trainer fokus mengamati teknik masak per produk, namun seluruh skor tetap direkapitulasi secara otomatis menjadi 1 nilai akhir terpadu (50% Teknis Produk + 50% Sikap & Kebersihan/Kerjasama) pada Rapor & Transkrip.
> 3. **Pendaftaran 12 Peserta Batch 10-11 November**: 12 peserta baru didaftarkan secara resmi ke Batch baru `OB-HARA/2026/B11-10` (10-11 November 2026) dan dimasukkan ke dalam master data `kru` serta master registry agar langsung muncul di seluruh dropdown seleksi peserta dan tersinkronisasi ke Supabase.
> 4. **Standardisasi Konsistensi UI**: Seluruh sub-tab dalam satu halaman diseragamkan ukuran pembungkusnya (`w-full`, `space-y-5`), padding kartu (`p-5 sm:p-6`), radius (`rounded-2xl`), dan palet warna Enterprise Merah HARA tanpa pergeseran atau lonjakan ukuran saat berpindah tab.

---

### 1. Overview & Core Concept

- **Tujuan Utama**: Meningkatkan kenyamanan dan akurasi trainer lapangan saat menguji peserta onboarding melalui pembagian fokus yang jelas (praktik teknis vs sikap/kebersihan), penyesuaian waktu baku 29 menu resmi, dan penambahan batch pelatihan terbaru (10-11 November 2026).
- **Pengguna Target**: Lead Trainer HARA, Trainer Operasional, Asisten Trainer, dan Head of Outlet yang memantau kesiapan kerja kru baru.
- **Manfaat**: Alur penilaian tidak berjejal (cluttered), timer stopwatch akurat sesuai standar menit operasional, dan data peserta batch terbaru langsung siap pakai di hari pelatihan.

---

### 2. User Experience & Visual Design

#### A. Konsistensi Layout dan Grid Antar Sub-Tab (Anti-Jitter)
- Menghilangkan perbedaan padding outer dan lebar container antara Sub-tab Praktik Produk, Kebersihan & Sikap, Kerjasama Tim, dan Riwayat.
- Seluruh sub-tab dibungkus dengan standard container:
  ```html
  <div className="w-full space-y-5 transition-all duration-150">
    <!-- Konten seragam dengan padding p-5 sm:p-6 rounded-2xl border border-[#E6E1DA] bg-white -->
  </div>
  ```
- Tab bar navigation tetap berada di atas dengan lebar penuh, indikator aktif merah HARA (`#96171B`), dan pill count yang konsisten.

#### B. Alur Penilaian Produk Mandiri (Fokus Teknis)
- Sub-tab **"Praktik Produk"** memuat timer per produk dengan durasi baku resmi, checklist langkah SOP kritis, input suhu minyak probe / gramatur, dan tanya-jawab lisan singkat.
- Menghapus slider penilaian kebersihan dan kerjasama yang sebelumnya menumpuk di kartu timer produk, sehingga kartu stopwatch menjadi rapi dan fokus.

#### C. Sub-Tab Khusus "Kebersihan & Kerjasama Tim"
- Menyediakan formulir khusus untuk mengevaluasi parameter non-teknis:
  1. *Kebersihan Pribadi & Grooming* (seragam, apron, topi, kuku, sepatu).
  2. *Sanitasi Stasiun & Kepatuhan 5S* (area bersih, lap terpisah, pemilahan sampah).
  3. *Kerja Sama & Komunikasi Tim* (call-out vokal, estafet serah terima, respon cepat).
  4. *Inisiatif & Keaktifan* (membantu rekan saat antrean padat, kerapian alat).
- Disertai tombol simpan mandiri yang langsung mengaitkan nilai sikap ke peserta yang sedang aktif.

#### D. Rekapitulasi Rapor Terpadu (1 Nilai Akhir)
- Sub-tab **"Riwayat & Rapor"** menggabungkan kedua pilar nilai:
  - **Skor Teknis Produk**: Rata-rata pencapaian SOP dan ketepatan waktu masak dari 29 produk.
  - **Skor Kebersihan & Sikap**: Rata-rata dari form kebersihan dan kerjasama tim.
  - **Skor Komposit Akhir (100%)**: Formula berbobot resmi (50% Produk + 50% Sikap) dengan status kelulusan (Lulus Mandiri $\ge 75$, Lulus Bersyarat 65–74, Butuh Pendampingan $< 65$).

---

### 3. Key Product Decisions & Trade-Offs

1. **Konversi 29 Durasi Standar ke Timer Countdown**:
   - *Keputusan*: Seluruh 29 angka menit dikonversikan ke detik (`menit * 60`) untuk timer stopwatch dan batas SOS:
     - Nasi: 37 mnt (2.220s) | Teh: 40 mnt (2.400s) | Sup Sayur: 40 mnt (2.400s)
     - Goreng Ayam: 20 mnt (1.200s) | Goreng Kulit: 45 mnt (2.700s) | Goreng Ayam Utuh: 20 mnt (1.200s)
     - Terong: 25 mnt (1.500s) | Scramble: 5 mnt (300s) | Spinach: 30 mnt (1.800s)
     - Indomie: 10 mnt (600s) | Sambal Bawang: 30 mnt (1.800s) | Sambal Matah: 30 mnt (1.800s)
     - Sambal Daun Jeruk: 30 mnt (1.800s) | Goreng Jamur: 7 mnt (420s) | Kentang: 10 mnt (600s)
     - Nasi Goreng Telur: 15 mnt (900s) | Geprek ORI: 2 mnt (120s) | Nashville: 2 mnt (120s)
     - Nasi Goreng Geprek: 20 mnt (1.200s) | Krisbar Geprek: 5 mnt (300s) | Geprek Mozarella: 7 mnt (420s)
     - Mentai Krispi: 5 mnt (300s) | Geprek Mentai: 7 mnt (420s) | Krisbar ORI: 5 mnt (300s)
     - Krispi Ayoli: 2 mnt (120s) | Geprek Ayoli: 5 mnt (300s) | Milkshake: 7 mnt (420s)
     - Susu Coklat: 2 mnt (120s) | Orange: 2 mnt (120s)
   - *Alasan*: Selaras dengan waktu riil persiapan, penggorengan, dan resting di stasiun dapur HARA Chicken.

2. **Pendaftaran 12 Kru Baru Batch 10-11 November**:
   - *Peserta & Outlet*:
     1. Dhimas Panji Saputro -> Blok O (`HC-BLO01`)
     2. Septian Dwi Nugroho -> Condongcatur (`HC-CCN01`)
     3. Galih Muhammad -> Sedayu (`HC-SDY01`)
     4. Shereen Putri -> Cebongan (`HC-CBG01`)
     5. Muhammad Iman Nugroho -> Bantul Niten (`HC-NTN01`)
     6. Alifia Putriana Dewi Az-zahra -> Pleret (`HC-PLR01`)
     7. Yasykur Kurnia -> Office (`HC-HQ01`)
     8. Muhammad Alif Alfarizki -> Damai (`HC-DMA01`)
     9. Rahmad Puji Yanto -> Kalakijo (`HC-KLK01`)
     10. Banar Hibatullah Mukti -> Playen (`HC-PLN01`)
     11. Noval Adittya -> Monjali (`HC-MJL01`)
     12. Muhammad Faisal -> Support Mobile Outlet (`HC-MOBILE`)
   - *Lokasi TC*: Kantor Lempongsari.
   - *Tanggal Masuk*: 10 November 2026.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MODUL ONBOARDING HARA CHICKEN                         │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
              ┌───────────────────────┴───────────────────────┐
              ▼                                               ▼
┌───────────────────────────┐                   ┌───────────────────────────┐
│     SUB-TAB PRODUK        │                   │    SUB-TAB KEBERSIHAN     │
│  - 29 Produk Resmi        │                   │    & KERJASAMA TIM        │
│  - Timer Standar Menit    │                   │  - Form Evaluasi 5S       │
│  - Stopwatch Independen   │                   │  - Kolaborasi & K3        │
│  - Cek Suhu/Gramatur      │                   │  - Simpan Terpisah        │
└─────────────┬─────────────┘                   └─────────────┬─────────────┘
              │                                               │
              └───────────────────────┬───────────────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │   REKAPITULASI RAPOR      │
                        │ - Skor Teknis (50%)       │
                        │ - Skor Sikap (50%)        │
                        │ - 1 Nilai Terpadu         │
                        │ - Status Kelulusan        │
                        └─────────────┬─────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │   STORAGE & SYNC ENGINE   │
                        │ - LocalStorage Fast Read  │
                        │ - Supabase Realtime Push  │
                        │ - Server Store Backup     │
                        └───────────────────────────┘
```

#### Modifikasi File yang Direncanakan:
1. `src/data/haraOnboardingProducts.ts`: Memperbarui master 29 produk dengan durasi baku menit yang dikonversikan ke detik (`stdDetik` dan `targetWaktuMenit`).
2. `src/data/onboardingCurriculumData.ts`: Menambahkan Batch `batch-ob-2026-11-10` dengan 12 peserta baru lengkap dengan outlet penempatan dan kuota.
3. `src/lib/storage.ts`: Mendaftarkan 12 peserta baru ke `INITIAL_KRU` dan menambahkan mapping outlet baru jika belum ada.
4. `src/components/trainer/OnboardingProductPracticeView.tsx`:
   - Memperbarui `CANDIDATE_PLACEMENT_MAP` dengan 12 nama peserta baru.
   - Memisahkan input kebersihan & kerjasama dari kartu timer produk.
   - Menata sub-tab khusus kebersihan & kerjasama tim dengan styling seragam.
   - Mengintegrasikan perhitungan nilai sikap dan teknis pada sub-tab riwayat/rekapitulasi nilai.
   - Menyelaraskan seluruh container kelas CSS (`space-y-5`, padding kartu, lebar) agar bebas lonjakan ukuran (no layout shift).
