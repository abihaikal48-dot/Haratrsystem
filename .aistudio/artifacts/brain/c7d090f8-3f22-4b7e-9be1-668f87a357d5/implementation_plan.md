# Rencana Implementasi: Sistem Penilaian Kru Onboarding & Penyesuaian Standar SOP HARA Chicken

## 1. Ringkasan & Konteks Kebutuhan
Berdasarkan arahan pengguna dan hasil klarifikasi:
1. **Penilaian Kru Onboarding**: Dibuatkan penilaian khusus untuk kru yang saat ini sedang aktif onboarding (Batch OB-02: Dimas Kurniawan [Kitchen], Nurul Hidayah [Kasir], Fajar Maulana [Geprek]) yang mencakup Uji Praktik RnD 16 Jam dan Checklist 10 Sesi Kurikulum Baku.
2. **Penyesuaian SOP Nasi**: Menghilangkan kewajiban menimbang porsi nasi per piring dengan timbangan gram di setiap penyajian. Menggantinya dengan SOP rasio baku Cup Beras Miyako (1 cup beras : 1.33 air) saat memasak, serta takaran porsi centong standar saat serving.
3. **Timer Adaptif (Tidak Kaku)**: Menerapkan toleransi waktu wajar (misal: Deep Frying 12 menit ± 30 detik, Tanak Nasi 15 menit ± 2 menit, Serving SOS < 3 menit) sehingga tidak menggugurkan penilaian hanya karena selisih beberapa detik jika kualitas organoleptik tercapai.
4. **Suhu Kondisional**: Pengukuran suhu probe hanya diberlakukan pada station termal (Minyak Deep Fryer 160°C ± 5°C, Suhu Inti Ayam ≥ 74°C, dan Holding Warmer 60–70°C). Station non-termal (Kasir POS, Sanitasi 4 Warna Lap, Penanganan Sambal, dan Packing) diset **N/A (Bebas Probe Suhu)** tanpa input paksa atau penalti nilai.

---

## 2. Arsitektur Komponen & UX Flow

### A. Komponen Penilaian Interaktif (`OnboardingEvaluationModal.tsx` & `KurikulumRoadmapView.tsx`)
- **Header Modal**: Identitas Kru Onboarding (Nama, Divisi, Outlet, Hari Kerja, Status Onboarding).
- **Bagian 1: Checklist 10 Sesi Kurikulum Baku (Total 25 Jam)**:
  - Hari 1: 7 Sesi (Budaya & K3, SOP Kasir POS, Service Excellence 5S, FIFO, Handling Complaint LAST, Motivasi).
  - Hari 2: Sesi 8 (RnD Bagian I: Marinasi, Penepungan, Penggorengan 8 Jam).
  - Hari 3: Sesi 9 (RnD Bagian II: Sambal Bawang, Warmer, Packaging 8 Jam) & Sesi 10 (Survey & Komitmen Mutu).
  - One-click "Checklist Kehadiran & Nilai Sesi" dengan visual indikator ketercapaian.
- **Bagian 2: Uji Praktik RnD Adaptif (Sesuai Station)**:
  - Input penilaian rubrik dengan deteksi otomatis tipe station:
    - **Kitchen (Fryer & Rice)**: Uji rasio cup Miyako (bukan timbang nasi per porsi), suhu minyak 155–165°C, timer 11.5–12.5 menit.
    - **Kasir & Front House**: Bebas suhu (N/A), fokus pada kecepatan transaksi, senyum 3S, dan rekonsiliasi kas.
    - **Geprek & Sambal**: Tekstur uleg cobek batu 30g, holding aroma sambal segar, bebas probe thermocouple.
    - **Helper & Sanitasi**: Kepatuhan 4 warna lap resmi, kebersihan grease trap, bebas probe suhu.
- **Bagian 3: Tombol Aksi "Simpan & Sinkronisasi Hasil"**:
  - Menyimpan ke tabel `OnboardingBatch` di localStorage/DB.
  - Memperbarui rekap kompetensi kru (`crew_competency_summary`).
  - Otomatis mencatat ke log aktivitas trainer.

### B. Penyesuaian Komponen & Utility Eksisting
1. **`src/lib/sopData.ts` & `src/lib/soalData.ts`**:
   - Update SOP `HC-SOP-01-NASI`: Ganti instruksi "penimbangan piring gramatur kaku" menjadi "Standardisasi Takaran Centong Porsi & Rasio Cup Miyako 1:1.33".
   - Perbarui parameter timer dan suhu agar menggunakan rentang toleransi (`min_toleransi`, `max_toleransi`, `is_thermal_required`).
2. **`src/components/stations/InteractiveFieldTrainerTools.tsx`**:
   - Pastikan kalkulator beras Miyako menjadi acuan utama tanpa paksaan timbangan gram pada nasi matang.
3. **`src/components/trainer/SimulasiPraktikRnDView.tsx` & `src/components/PenilaianPraktikView.tsx`**:
   - Sembunyikan field input suhu pada station non-termal (tampilkan label badge "Non-Termal / N/A").
   - Ganti validasi timer kaku dengan status toleransi "Dalam Rentang Ideal".
4. **Data Onboarding Aktif (`src/lib/storage.ts` & `src/data/onboardingCurriculumData.ts`)**:
   - Generate data penilaian resmi komprehensif untuk peserta Batch OB-02 (Dimas Kurniawan, Nurul Hidayah, Fajar Maulana) agar trainer langsung dapat melihat hasil evaluasi mereka.

---

## 3. Langkah-Langkah Pengerjaan

1. **Refactoring Parameter SOP & Toleransi**:
   - Menambahkan flag `is_thermal: boolean` dan `rentang_timer` pada data SOP di `src/lib/sopData.ts`.
   - Mengubah rujukan penimbangan nasi menjadi takaran centong porsi standar dan rasio cup Miyako.
2. **Pembaruan Form Penilaian Praktik & Onboarding**:
   - Memodifikasi `PenilaianPraktikView.tsx` dan `KurikulumRoadmapView.tsx` agar field suhu kondisional sesuai divisi/station.
   - Menyediakan timer toleransi adaptif (hijau jika di rentang wajar, tanpa penalti kegagalan total).
3. **Penyediaan Fitur "Penilaian Cepat & Komprehensif Kru Onboarding"**:
   - Menambahkan aksi penilaian langsung per kru onboarding di tab `batches` dan `absensi_nilai` di `KurikulumRoadmapView.tsx`.
4. **Pembaruan Data Awal Kru Onboarding**:
   - Menyimpan hasil penilaian nyata untuk 3 kru onboarding aktif di Batch OB-02.
5. **Verifikasi & Build**:
   - Menjalankan `compile_applet` dan `lint_applet` untuk menjamin tidak ada regresi kode atau error TypeScript.

---

## 4. Kriteria Keberhasilan
- [x] Kru onboarding aktif (Dimas Kurniawan, Nurul Hidayah, Fajar Maulana) memiliki catatan penilaian evaluasi terisi lengkap dan dapat diubah sewaktu-waktu.
- [x] Nasi matang tidak lagi diwajibkan ditimbang gram di meja saji, melainkan dinilai dari rasio cup Miyako & takaran centong porsi standar.
- [x] Input suhu hanya muncul pada station termal (fryer/warmer); station non-termal otomatis N/A.
- [x] Timer memiliki rentang toleransi wajar dan tidak kaku.
- [x] Build applet sukses tanpa error kompilasi.
