# Rencana Implementasi: Penyatuan Menu SOP, Format Ekspor Menit & Outlet Riil, serta Auto-Sync Google Sheets

Berdasarkan jawaban dan kebutuhan operasional yang telah disepakati:
1. **Penyatuan Tombol "Pilih & Atur Menu SOP"**: Menggabungkan fitur pencarian SOP dan pengaturan antrean menu menjadi satu alur modal terpadu yang langsung menyinkronkan menu aktif dan daftar list.
2. **Standardisasi Format File Ekspor (CSV & Google Sheets)**: Mengganti seluruh kode outlet dengan nama outlet riil dan mengubah satuan waktu durasi serta target SOS dari detik ke **desimal menit** (contoh: `2.5 menit`).
3. **Sinkronisasi Otomatis ke Google Sheets**: Mengaktifkan pengiriman data ke Google Sheets secara otomatis di latar belakang setiap kali trainer menekan tombol **"Simpan Nilai Praktik"**.

---

## 1. Penyatuan Tombol "Pilih & Atur Menu SOP"
- **Masalah Saat Ini**: Terdapat dua tombol terpisah (*"Atur Antrean Menu"* dan *"Cari & Ganti SOP"*), di mana memilih SOP dari pencarian tidak otomatis memperbarui antrean menu, membingungkan pengguna.
- **Solusi Terpadu**:
  - Hapus tombol redundan dan sediakan satu tombol utama yang elegan: **"Pilih & Atur Menu SOP"** (atau pintasan cepat di header sesi kru).
  - Modal terpadu menyediakan 2 mode yang saling terhubung:
    - **Pilih Produk Langsung (SOP Cepat)**: Daftar ringkas dengan pencarian, filter stasiun, dan tombol *"Jadikan Menu Aktif"* yang otomatis memperbarui menu berjalan serta menambahkan ke daftar menu kru.
    - **Susun Antrean Menu (Multi-SOP Queue)**: Memilih beberapa paket menu SOP sekaligus (misal: Nasi 4 Cup, Ayam Crispy, Sambal Korek) dengan kemampuan reorder (drag/geser urutan) dan estimasi total waktu menit.
  - Memilih produk baru langsung memperbarui `activeSession.productNama`, `activeSession.productQueue`, dan me-load checklist serta standar waktu yang relevan tanpa lag.

---

## 2. Standardisasi Ekspor: Nama Outlet Riil & Satuan Desimal Menit
- **Berkas yang Diperbarui**:
  - `src/lib/googleSheetSync.ts`:
    - Fungsi `exportPenilaianToCSV()` dan `syncPenilaianToGoogleSheets()`.
    - Template Google Apps Script (`HARA_APPS_SCRIPT_TEMPLATE`).
    - Format Durasi Aktual: `(durasi_detik / 60).toFixed(1) + ' menit'` (contoh: `2.5 menit`, `1.8 menit`).
    - Format Target SOS: `(target_sos_detik / 60).toFixed(1) + ' menit'` (contoh: `2.0 menit`).
    - Nama Outlet: Mengganti kode outlet seperti `GTO`, `GLG`, `BRB`, `OUT-001` menjadi nama outlet riil lengkap (misal: `HARA Chicken Gito Gati`, `HARA Chicken Glagahsari`, `Kantor Lempongsari (Training Center)`).
  - `src/components/trainer/OnboardingProductPracticeView.tsx`:
    - Helper mapping nama outlet riil pada seluruh baris ekspor riwayat dan analitik outlet.

---

## 3. Sinkronisasi Otomatis ke Google Sheets Saat Simpan
- **Implementasi Alur Kerja**:
  - Pada fungsi `handleSaveAssessment` di `OnboardingProductPracticeView.tsx`:
    - Saat trainer menekan **"Simpan Nilai Praktik"** atau saat antrean menu kru selesai dinilai:
    - Data langsung disimpan ke database lokal dan server store (Supabase online sync).
    - Secara bersamaan, fungsi `syncPenilaianToGoogleSheets(savedRecord)` dipanggil di latar belakang (*non-blocking asynchronous*).
    - Tampilkan notifikasi toast: `✅ Nilai tersimpan & otomatis disinkronkan ke Google Sheets!`.
  - Tetap menyediakan tombol manual *"Sinkronkan Seluruh Riwayat ke Spreadsheet"* di sub-tab riwayat untuk kemudahan pengiriman ulang jika sewaktu-waktu perangkat sempat offline.

---

## 4. Verifikasi dan Pengujian
- **Uji UI**:
  - Buka modal "Pilih & Atur Menu SOP", pilih produk baru, dan pastikan form checklist, timer, dan queue bar langsung berganti secara mulus.
- **Uji Ekspor CSV**:
  - Unduh CSV dan periksa kolom: tidak ada lagi kode outlet singkat, kolom durasi berformat `X.X menit`, serta skor sikap 5S dan kerjasama tim tampil lengkap.
- **Uji Auto-Sync Google Sheets**:
  - Simpan penilaian kru dan pastikan webhook Google Apps Script menerima baris data dengan format nama outlet riil dan menit.
- **Uji Kompilasi**:
  - Jalankan `compile_applet` dan `lint_applet` untuk memastikan zero TypeScript error.
