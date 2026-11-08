# Rencana Implementasi: Perombakan Layout, Design System, & UI HARA Training System

Berdasarkan preferensi yang Anda tentukan:
- **Gaya Visual & Tema**: Clean Enterprise Merah HARA bernuansa modern, profesional, dan rapi.
- **Prioritas Tata Letak Onboarding**: Layout efisien satu layar tanpa banyak scroll (kitchen-friendly & trainer ergonomics).
- **Cakupan Pembaruan**: Desain ulang menyeluruh dimulai dari modul Onboarding (Praktik, Batch, Roadmap) dan penyelarasan harmonis ke seluruh halaman aplikasi.

---

## 1. Fondasi Design System: "Clean Enterprise Merah HARA"
Membangun token UI dan komponen inti yang konsisten di `src/index.css` dan komponen dasar:
- **Palet Warna Terpadu**:
  - Primary Brand: Crimson HARA `#96171B`, Dark Hover `#7A1215`, Soft Red Surface `#FEF2F2`, Accent Line `#FECACA`.
  - Neutral & Surface: App Canvas `#F8FAFC`, Card Background `#FFFFFF`, Slate Text `#0F172A`, Muted Meta `#64748B`, Crisp Border `#E2E8F0`.
  - Semantic Status: Emerald `#059669` (Standar/Lulus), Amber `#D97706` (Perlu Bimbingan), Rose `#DC2626` (Kritis/Gagal).
- **Zero-Pill Discipline & Typographic Hierarchy**:
  - Mengganti penumpukan badge berwarna-warni yang ramai dengan tipografi metadata yang bersih (`Kandidat · Stasiun 1 · Target 2.5 menit`).
  - Hierarki jelas: Heading tajam (Outfit/Plus Jakarta Sans), angka tabular monospaced untuk timer dan skor (`font-mono tabular-nums`).
- **Elevasi & Layout Density**:
  - Card rapi dengan border halus 1px tanpa bayangan berat berlebih.
  - Padding efisien (compact/medium) sehingga informasi padat dan terbaca jelas dalam satu viewport laptop maupun tablet.

---

## 2. Redesain Modul Onboarding Praktik (Kitchen-Friendly Single-Screen)
Merestrukturisasi `OnboardingProductPracticeView.tsx` dan subtab penilaian di `KurikulumRoadmapView.tsx`:
- **Header Sesi Ringkas & Fokus**:
  - Panel kandidat aktif menampilkan: Foto/Inisial, Nama Kru, Outlet Penempatan Riil, Progress Menu (misal: 2/6 selesai), dan status lulus/evaluasi.
  - Dropdown/selector kandidat cepat untuk beralih antar peserta (14 peserta batch 3-4 Nov) tanpa reload.
- **Workspace Efisien Satu Layar (No Excessive Scrolling)**:
  - **Kolom Kiri / Panel Kontrol**:
    - Menu yang sedang dinilai + tombol elegan **"Pilih & Atur Menu SOP"**.
    - Stopwatch Timer berukuran proporsional dengan indikator SOS menit desimal (`Target: 2.5 min | Berjalan: 01:42`).
    - Quick Action: Play / Pause / Reset / Catat Suhu Minyak & Berat (jika relevan).
  - **Kolom Kanan / SOP Step Checklist**:
    - Daftar langkah SOP terstruktur dengan toggle satu klik (Lengkap / Kritis).
    - Status langkah jelas tanpa tertutup popup.
  - **Floating Action Bar Bawah**:
    - Ringkasan skor langsung (Komposit 7 Kriteria HARA).
    - Tombol utama: *"Simpan & Lanjut Menu Berikutnya"* (dengan auto-sync Google Sheets & Supabase) dan *"Selesai Sesi Kru"*.
- **Modal "Pilih & Atur Menu SOP" Terpadu**:
  - Dialog modal yang bersih dan responsif: daftar produk stasiun dengan filter instan, indikator target waktu dalam menit desimal, dan drag-and-drop / susun antrean menu.

---

## 3. Penyelarasan Layout Seluruh Halaman Aplikasi
Menerapkan konsistensi design system ke seluruh komponen workspace:
- **Global Shell (Header & Sidebar)**:
  - `Sidebar.tsx`: Navigasi ramping dengan grouping yang logis (Onboarding TC, Operasional Lapangan, Master Data, Laporan). Ikon minimalis dan indikator aktif bernuansa merah HARA lembut.
  - `Header.tsx`: Quick breadcrumb, status sinkronisasi Supabase/Google Sheets yang tenang, selector outlet global, dan profil trainer.
- **Kurikulum Roadmap & Batch Management (`KurikulumRoadmapView.tsx`)**:
  - Tab navigasi sub-modul (Silabus 3 Hari, Daftar Batch, Penilaian Praktik, Analitik & Radar Kru) dibuat rapi dengan tab bar borderless modern.
  - Tabel batch dan daftar peserta 3-4 November yang bersih dengan aksi cepat (Buka Penilaian, Unduh Berkas, Evaluasi).
- **Dashboard & Analitik (`DashboardView.tsx` & `TrainingVsOperasionalView.tsx`)**:
  - KPI metric cards dengan perbandingan tren yang tajam.
  - Grafik visualisasi kompetensi dan radar kru dengan kontras bersih.
- **Operasional Lapangan & Master Data**:
  - Pembersihan form CRUD, tabel SOP, dan modal dialog agar menggunakan style input dan button yang seragam.

---

## 4. Rencana Tahapan Eksekusi & Verifikasi
1. **Pembaruan Design Tokens (`src/index.css`)**: Mengukuhkan token warna, font, tombol, dan card classes.
2. **Refaktor Layout Penilaian Onboarding (`OnboardingProductPracticeView.tsx`)**: Implementasi single-screen layout, integrasi timer preserved, checklist akurat, dan format menit.
3. **Penyempurnaan Shell Navigasi (`Sidebar.tsx`, `Header.tsx`, `KurikulumRoadmapView.tsx`)**: Standardisasi layout tab, card batch, dan breadcrumbs.
4. **Penyelarasan Dashboard & Halaman Lainnya**: Memastikan keseragaman visual di seluruh workspace Onboarding & Operasional.
5. **Verifikasi Teknis & Build**: Menjalankan `compile_applet` dan `lint_applet` bersamaan untuk memastikan nol error dan tampilan responsif.
