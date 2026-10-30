# Rencana Implementasi: Sinkronisasi Master Produk Agenda Training, Multi-Product State Preservation, dan Rubrik Objektif Tim Stasiun

Dokumen ini memuat arsitektur teknis dan rancangan UX untuk menyelaraskan master produk dan stasiun dengan dokumen cetak resmi *AGENDA TRAINING TRAINING CENTER HARA CHICKEN*, mengimplementasikan penyimpanan state mandiri per produk (*multi-product pause-resume state* tanpa reset), serta menyederhanakan nama stasiun tim menjadi **Station 1** & **Station 2** dengan rubrik evaluasi objektif berbasis deskriptor perilaku konkret.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Ringkasan keputusan berdasarkan jawaban pengguna dan dokumen foto:
> - **Penilaian Tim Stasiun**: Menggunakan **Rubrik level perilaku kerja konkret berbasis ceklis per stasiun**, bukan sekadar menggeser slider angka tanpa dasar. Nama stasiun tim cukup ringkas: **Station 1** dan **Station 2** (tanpa deskripsi panjang seperti thawing/marinasi).
> - **Master Produk & Stasiun Agenda**: Produk dikelompokkan sesuai dokumen agenda training HARA Chicken (Station 1, Station 2, Station 3 pada Day 1 dan Day 2).
> - **Revisi Day 1 Batch 1**: Menu Station 3 diubah menjadi **Goreng Ayam Utuh** (bukan goreng kulit).
> - **Pemisahan Varian Mandiri**: Memisahkan varian secara mandiri (contoh: *Krispi Ayoli* terpisah dari *Geprek Ayoli*, *Krispi Mentai* terpisah dari *Geprek Mentai*, *Krisbar Ori* terpisah dari *Krisbar Geprek*), dengan penamaan ringkas baku tanpa imbuhan berlebih.
> - **Anti-Reset Saat Pindah Produk**: Kru sering kali menjeda produk (misal menunggu proses menggoreng) dan beralih mengerjakan produk lain. Setiap produk dalam sesi kru memiliki state mandiri (*timer detik*, *status pause*, *ceklis langkah*, *parameter teknis*), sehingga saat beralih menu lalu kembali lagi, **data tidak akan ter-reset**.

---

## 1. Overview & Core Concept

1. **Sinkronisasi Katalog Produk SOP (Sesuai Lembar Agenda Foto)**:
   - **Day 1**:
     - *Station 1*: Nasi 4 Cup (35 mnt), Teh (10lt) (40 mnt), Sup Sayur (40 mnt), Geprek Ori (2 mnt), Krisbar Geprek (7 mnt), Geprek Moza (7 mnt).
     - *Station 2*: Goreng Ayam (20 mnt), Scrembel (5 mnt), Spinach (40 mnt), Indomie Geprek (10 mnt), Nashville (2 mnt), Krispi Mentai (5 mnt), Geprek Mentai (7 mnt), Krisbar Ori (4 mnt), Krispi Ayoli (4 mnt).
     - *Station 3*: Goreng Terong (25 mnt), Sambal (1 Variant) (30 mnt), **Goreng Ayam Utuh (45 mnt)**, Nasgor Geprek (15 mnt), Geprek Keju Parut (5 mnt), Geprek Ayoli (5 mnt).
   - **Day 2**:
     - *Station 1*: Nasi 4 Cup (45 mnt), Goreng Kulit (35 mnt), Milkshake (10 mnt).
     - *Station 2*: Teh (8lt) (30 mnt), Sambal Matah (20 mnt), Sambal Daun Jeruk (20 mnt), Sucok (15 mnt).
     - *Station 3*: Menggoreng Ayam (25 mnt), Goreng Jamur (15 mnt), Kentang (10 mnt), Orange 1 Porsi (5 mnt).

2. **Penyimpanan State Mandiri per Produk (Multi-Product Pause & Resume)**:
   - Menambahkan struktur `productStates: Record<string, ProductPracticeState>` di dalam setiap tab sesi kru.
   - Saat asesor berpindah menu pada Stepper, sistem secara otomatis menyimpan posisi detik stopwatch, status checklist, input suhu/gramatur produk lama, dan memuat kondisi produk baru tanpa me-reset apa pun.

3. **Pengembangan Penilaian Tim Stasiun yang Objektif (Station 1 & Station 2)**:
   - Penamaan stasiun tim disederhanakan murni menjadi: **Station 1** dan **Station 2**.
   - Setiap dimensi penilaian (Ritme/Flow, Komunikasi Vokal, Kebersihan 5S, Kepatuhan SOP, Handover) dilengkapi 4 tingkat deskriptor capaian kerja konkret:
     - *Level 4 (90–100)*: Sangat Baik — Alur kerja mandiri, tanpa bottleneck, respon vokal tegas, 5S konsisten.
     - *Level 3 (75–89)*: Baik — Sesuai SOP standar, penanganan order lancar dengan supervisi minimal.
     - *Level 2 (60–74)*: Cukup — Masih terjadi penumpukan order sesaat atau teguran sanitasi ringan.
     - *Level 1 (<60)*: Perlu Pembinaan — Terjadi bottleneck parah, komunikasi pasif, atau pelanggaran kebersihan.

---

## 2. User Experience & Visual Design

### Alur Pause & Resume Antar Produk
```
┌────────────────────────────────────────────────────────────────────────┐
│ Kru: Aini Amalia Saftri (Kitchen)              Lokasi: Kantor Lempongsari │
├────────────────────────────────────────────────────────────────────────┤
│ ANTREAN PRAKTIK:                                                       │
│ [⏸ 1. Goreng Ayam Utuh (12:30 / 45m)] ── [▶ 2. Goreng Terong (04:10)] │
│ ── [○ 3. Sambal (1 Variant) (Belum Mulai)]   [+ Atur / Tambah Menu]     │
├────────────────────────────────────────────────────────────────────────┤
│ PRODUK AKTIF: Goreng Terong (Day 1 • Station 3)                         │
│ Stopwatch: [ 04:10 ]  [Jeda] [Lanjut] [Reset Waktu Menu Ini]          │
│ • Ceklis SOP & Parameter Terong tersimpan mandiri                     │
├────────────────────────────────────────────────────────────────────────┤
│ (Trainer bisa klik kembali ke menu 1 kapan saja tanpa hilang waktu)   │
│ [Simpan Hasil Produk Ini & Lanjut ke Menu Berikutnya ➔]                │
└────────────────────────────────────────────────────────────────────────┘
```

### Rubrik Objektif Tim Stasiun (Station 1 & Station 2)
```
┌────────────────────────────────────────────────────────────────────────┐
│ Observasi Tim: [ Station 1 ]   [ Station 2 ]                           │
├────────────────────────────────────────────────────────────────────────┤
│ Dimensi: Ritme Kerja & Kecepatan Flow (Bobot 25%)                      │
│ ( ) Level 4 (95) - Mengalir sempurna, zero bottleneck, proaktif        │
│ (•) Level 3 (85) - Sesuai standar SOS, ritme stabil, jeda wajar        │
│ ( ) Level 2 (70) - Terjadi sedikit penumpukan antrean pada jam sibuk   │
│ ( ) Level 1 (50) - Stasiun macet total, waktu tunggu melebihi toleransi │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Product Decisions & Trade-Offs

- **Isolasi State per Produk vs Single Global Timer**:
  - *Keputusan*: Membuat dictionary `productStates` per nama produk di tiap sesi.
  - *Alasan*: Kru di lapangan tidak bekerja secara sekuensial kaku; sering kali ayam sedang direbus/digoreng (timer berjalan atau di-pause) sementara kru memotong sayur atau mengulek sambal. Reset global saat berpindah tab produk merusak akurasi waktu kerja riil.
  - *Dampak*: Stopwatch tiap produk independen, tersimpan ke local draft, dan tidak pernah hilang saat berganti menu.

- **Penyederhanaan Label Stasiun Tim**:
  - *Keputusan*: Mengubah selector menjadi **Station 1** dan **Station 2** tanpa teks teknis yang panjang.
  - *Alasan*: Pengguna menegaskan bahwa stasiun adalah wilayah kerja mereka dan deskripsi teknis panjang membuat tampilan padat dan tidak efisien di layar HP.

---

## 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────┐
│                 AssessmentSessionTab                          │
│ - id, kruId, namaKru, outletCode                              │
│ - productQueue: string[]                                      │
│ - currentProductIndex: number                                 │
│ - productStates: Record<productName, {                        │
│     timerSeconds: number                                      │
│     isTimerRunning: boolean                                   │
│     suhuMinyakProbe: number                                   │
│     gramaturAktual: number                                    │
│     stepChecklist: StepItem[]                                 │
│     knowledgeAnswers: Record<number, boolean>                 │
│     skorKnowledge: number                                     │
│     catatan: string                                           │
│   }>                                                          │
│ - completedProducts: CompletedProductRecord[]                 │
└───────────────────────────────┬───────────────────────────────┘
                                │ Auto-saved on every change
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                localStorage: hara_active_assessment_sessions   │
└───────────────────────────────────────────────────────────────┘
```

---

## Rencana Langkah Eksekusi (Implementation Tasks)

1. **Pembaruan Master Produk `src/data/haraOnboardingProducts.ts`**:
   - Sesuaikan daftar produk, penamaan ringkas SOP, pengelompokan Day 1/Day 2, dan Station 1/2/3 sesuai foto agenda training resmi.
   - Pastikan varian terpisah (*Krispi Ayoli*, *Geprek Ayoli*, *Krispi Mentai*, *Geprek Mentai*, *Krisbar Ori*, *Krisbar Geprek*).
   - Pastikan Day 1 Batch 1 Station 3 adalah **Goreng Ayam Utuh (45 menit)** (bukan goreng kulit).
2. **Implementasi Multi-Product State Preservation di `OnboardingProductPracticeView.tsx`**:
   - Perbarui antarmuka `AssessmentSessionTab` dengan `productStates`.
   - Modifikasi fungsi perpindahan produk pada Stepper agar menyimpan state produk sebelumnya dan memuat state produk target tanpa me-reset timer atau checklist.
3. **Penyederhanaan & Objektivitas Penilaian Tim Stasiun**:
   - Ubah pilihan stasiun tim menjadi **Station 1** dan **Station 2**.
   - Gantikan input slider murni dengan Rubrik Perilaku Kerja Objektif (Level 1–4 per dimensi lengkap dengan deskriptor konkret) dikombinasikan dengan ceklis observasi.
4. **Verifikasi & Uji Kompilasi**:
   - Jalankan `compile_applet` dan `lint_applet` untuk menjamin tidak ada error atau regresi kode.
