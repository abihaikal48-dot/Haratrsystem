# Rencana Implementasi: Isolasi Ketat Soal Jobdesk, Timer Per Sesi, & Bank Soal SOP Hara Chicken

Berdasarkan arahan dan jawaban Anda:
1. **Isolasi Mutlak Jobdesk**: Kru Kasir hanya diuji materi Kasir + SOP Umum. Kru Kitchen hanya diuji materi Kitchen + SOP Umum. Tidak ada rembetan materi stasiun/jobdesk lain.
2. **Timer Per Sesi**: Timer dihitung per sesi ujian secara menyeluruh (30 menit untuk 25-30 butir soal), bukan hitung mundur per butir soal. Kru dapat leluasa mengatur ritme dan meninjau kembali jawaban sebelum submit.
3. **Komposisi Soal (25-30 Soal per Paket)**:
   - 15 - 20 butir soal spesifik jobdesk (Kitchen, Kasir, Service, Bar/Geprek).
   - 10 butir soal SOP Umum (Peraturan perusahaan, etika 5S/3S, karakteristik kru, visi-misi Hara Chicken).
4. **Validasi Materi SOP Baku**: Merujuk langsung ke `sopData.ts` resmi, khususnya SOP Nasi Goreng formula revisi terbaru (Bumbu Eco 20 gr, Minyak 15 ml, Bawang Putih tumis harum, Mix Sayur 30 gr, Saos Ricebowl 15 gr, Minyak Wijen 2 tetes, api sedang, 3-4 menit), SOP Kasir (handling cash/EDC, closing shift, selisih kas, upselling), SOP Kitchen (thawing, marinasi, deep frying suhu & durasi), dan SOP Service/Bar.

---

## 1. Pembaruan Logika Pengambilan Soal (`bankSoalMingguan.ts`)
- **Penghapusan Fallback Lintas Stasiun**: Menghapus total logika injeksi soal stasiun lain (`otherStations`) di `getSoalUjianByMinggu`.
- **Filtering Presisi**:
  ```ts
  // Hanya ambil soal jobdesk kru + soal divisi 'Semua' (Umum/Karakter/Visi-Misi)
  const jobdeskSoal = weekPool.filter(s => s.divisi === divisi);
  const umumSoal = weekPool.filter(s => s.divisi === 'Semua');
  ```
- **Target Proporsi Paket**: Menghasilkan 25-30 butir soal per sesi per minggu (15-20 jobdesk spesifik + 10 materi umum).

---

## 2. Bank Soal Mendalam Berdasarkan SOP Resmi Hara Chicken
Mengembangkan bank soal untuk tiap jobdesk (Minggu 1 s/d 4) berbasis dokumen baku:

### A. Kasir (Cashier & POS)
- SOP Salam & Greeting 3S (Senyum, Salam, Sapa) saat tamu datang.
- SOP Kasir: Standar pengoperasian POS, pencatatan tunai, QRIS, debit EDC.
- Prosedur Selisih Kas (over/short) dan serah terima shift (handover checklist).
- Standar Upselling & Cross-selling (menawarkan menu extra, promo kombo, Hara Extra).
- Prosedur Void Nota & Pembatalan Transaksi (wajib otorisasi SPV/Kepala Outlet).
- Prosedur Closing Kasir & Rekonsiliasi Settlement EDC harian.

### B. Kitchen & Cooking (Termasuk SOP Nasi Goreng Terbaru)
- **SOP Nasi Goreng Terbaru (HC-SOP-KIT-05)**:
  - 1 cup nasi pulen dingin.
  - Tumis bawang putih geprek (1/2 siung besar atau 1 siung kecil) dengan 15 ml minyak goreng sampai harum.
  - Masukkan 30 gr (2 sdm) mix vegetable, tumis sebentar.
  - Masukkan nasi, aduk rata api sedang.
  - Masukkan 20 gr bumbu eco nasi goreng, aduk rata.
  - Tambahkan 15 gr (1 sdm) saos ricebowl, 2 tetes minyak wijen.
  - Standar waktu memasak: 3-4 menit per porsi.
  - Platting & packing: alas kertas nasi utuh, telur di atas nasi, sendok di atas kertas penutup.
- **SOP Ayam Krispi & Nashville**:
  - Standar marinasi (minimal waktu peresapan), perataan tepung krispi, ketukan/shake.
  - Standar suhu deep fryer (160°C - 170°C) dan durasi penggorengan (12-14 menit).
  - Standar dipping bumbu Nashville panas (oil glaze) & tingkat kepedasan.
- **Food Safety & Sanitasi**:
  - Suhu penyimpanan chiller (0-4°C) dan freezer (-18°C).
  - Thawing ayam secara benar, rotasi FIFO (First In First Out), penanganan cross-contamination.

### C. Service / Front of House & Bar / Minuman
- Standar kebersihan meja makan, lantai, dan area refill Hara Extra (nasi, es teh, sop).
- Kecepatan clearing meja (table turnover) di bawah 2 menit setelah tamu selesai.
- Handling komplain tamu (metode HEAT: Hear, Empathize, Apologize, Take Action).
- SOP Bar: Pembuatan takaran Es Teh Manis, Es Lemon Tea, Milkshake, takaran es batu dan gula cair baku.

### D. 10 Soal SOP Umum & Karakter Hara (Untuk Seluruh Jobdesk)
- Visi & Misi Hara Chicken: Memberikan sajian ayam krispi berkualitas tinggi, terjangkau, dengan pengalaman makan mengenyangkan (Hara Extra).
- Tata tertib, absensi, grooming (seragam bersih, apron, topi/hairnet, tanpa aksesoris berlebih).
- Nilai integritas, kejujuran terhadap aset perusahaan, zero-tolerance pencurian / makan tanpa izin.
- Sikap kerja sama tim, komunikasi saat rush hour, dan ketahanan terhadap tekanan jam sibuk.

---

## 3. Desain Ulang Sistem Timer: Timer Per Sesi (`UjianKruPublicView.tsx`)
- **Penghapusan Timer Per Soal**: Menghilangkan batasan detik kaku per butir soal yang membuat kru panik atau terpotong saat menjawab.
- **Timer Per Sesi (30 Menit Penuh)**:
  - Timer menghitung mundur total waktu sesi (misal: 30:00).
  - Disertai indikator visual: Hijau (>10 menit), Kuning (<=10 menit), Merah berkedip (<=3 menit).
  - Navigasi leluasa: kru bisa klik nomor soal di nomor berapa saja (1 sampai 30) untuk meninjau atau mengganti jawaban sebelum tombol "Kirim Lembar Jawaban" ditekan.
  - Auto-submit otomatis jika waktu sesi habis (00:00).

---

## 4. Evaluasi & Analisis Trainer
- Mempertahankan radar 4 pilar kompetensi:
  1. SOP Jobdesk Spesifik (Kasir / Kitchen / Service)
  2. Peraturan & Disiplin Perusahaan
  3. Karakter & Integritas Kerja
  4. Pemahaman Visi-Misi Hara
- Memberikan rekomendasi coaching spesifik jobdesk pada hasil akhir untuk mempermudah trainer lapangan membimbing kru.

---

## 5. Rencana Verifikasi
- Melakukan verifikasi filter jobdesk: memastikan Kru Kasir 100% hanya melihat soal Kasir + Umum (0% soal goreng ayam/kitchen).
- Memastikan Kru Kitchen mendapatkan soal SOP Nasi Goreng terbaru dan teknik kitchen (0% soal mesin EDC kasir).
- Menguji timer per sesi 30 menit dan tombol navigasi soal.
- Menjalankan `compile_applet` untuk memastikan tidak ada kesalahan TypeScript maupun syntax.
