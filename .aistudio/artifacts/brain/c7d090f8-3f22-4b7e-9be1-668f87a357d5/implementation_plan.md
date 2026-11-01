# Arsitektur Supabase Sebagai Database Cloud Utama (Online First)

Transisi menyeluruh sistem manajemen pelatihan HARA ke **Supabase** sebagai sumber data utama (*Primary Database & Cloud Source of Truth*), menghubungkan aplikasi secara langsung ke cloud dengan kapabilitas sinkronisasi dua arah real-time, auto-hydration saat startup, dan indikator status online terpadu.

---

> [!IMPORTANT]
> **Keputusan Kunci yang Dikonfirmasi:**
> 1. **Supabase Menjadi Database Utama (Primary Cloud DB)**: Menggantikan posisi Firestore sebagai database primer. Seluruh operasi tambah, ubah, dan hapus data (penilaian praktik, kru, batch 30-31, outlet, SOP) akan langsung disimpan dan disinkronkan ke tabel-tabel Supabase.
> 2. **Auto-Pull & Smart Hydration**: Memperbaiki logika sinkronisasi data awal. Data di Supabase akan menjadi rujukan utama (*authoritative*) dan disinkronkan ke cache lokal saat aplikasi dimuat, bukan diabaikan saat local storage terisi.
> 3. **Live Realtime Bi-Directional Sync**: Mengaktifkan listener WebSocket Supabase Realtime pada tabel utama dan tabel snapshot `app_store` sehingga pembaruan dari trainer di lapangan langsung tampil instan tanpa perlu memuat ulang halaman.
> 4. **Indikator Status Online & Modal Koneksi di Header**: Menghadirkan badge status koneksi online Supabase yang selalu terlihat di bilah navigasi atas (Online / Connecting / Offline) dengan akses satu-klik ke pengujian koneksi, konfigurasi URL & Anon Key, dan migrasi data.

---

### 1. Ringkasan & Konsep Solusi

- **Tujuan**: Memastikan aplikasi benar-benar **online** dan terhubung ke Supabase secara aktif, menyelesaikan kendala data yang sebelumnya tidak sinkron karena aplikasi masih memprioritaskan penyimpanan lokal/Firestore.
- **Pengguna Sasaran**: Lead Trainer, Trainer Lapangan, Tim RnD, dan Manajemen Outlet HARA Chicken yang membutuhkan data penilaian kru terpusat dan dapat diakses dari berbagai perangkat secara bersamaan.
- **Nilai Utama**: Data penilaian praktik onboarding (Batch 30-31, penilaian produk, SOP) tersimpan aman di cloud Supabase secara instan dan tidak akan hilang meskipun cache browser dibersihkan atau ganti perangkat.

---

### 2. Pengalaman Pengguna & Tampilan Antarmuka (UX Flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🟢 Supabase Cloud: ONLINE (Database Utama)   [Pengaturan Koneksi] [Sinkron] │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
│     Form Penilaian & Operasional     │  │       Modal Konfigurasi Cloud     │
│ - Trainer menilai Kru Batch 30-31    │  │ - Input URL & Anon Public Key     │
│ - Stopwatch timer berjalan           │  │ - Tombol "Tes Koneksi Cloud"      │
│ - Klik "Simpan Penilaian"            │  │ - Script SQL Schema siap salin    │
│ -> Tersimpan instan ke Supabase Cloud│  │ - "Tarik Data Cloud Sekarang"     │
└──────────────────────────────────────┘  └───────────────────────────────────┘
```

1. **Header Cloud Status Pill**:
   - Di bagian atas aplikasi, terdapat badge interaktif:
     - 🟢 **Supabase Online**: Menampilkan latensi dan status aktif.
     - 🟡 **Menghubungkan**: Animasi pulse saat proses sinkronisasi data berlangsung.
     - 🔴 **Offline / Belum Terhubung**: Tombol cepat untuk membuka panduan dan input kredensial Supabase.
2. **Auto-Pull Notification**:
   - Saat aplikasi dibuka, sistem secara otomatis mengecek perubahan data di Supabase dan melakukan penyelarasan latar belakang (*silent sync*). Jika ada data baru dari trainer lain, notifikasi kecil yang elegan akan mengonfirmasi pembaharuan data.
3. **Modal Koneksi & Skrip SQL Supabase yang Lengkap**:
   - Modal koneksi menyediakan skrip SQL DDL lengkap yang siap di-*copy-paste* ke menu SQL Editor di dashboard Supabase (membuat tabel `penilaian_praktik_onboarding_produk`, `onboarding_batches`, `kru`, `outlets`, `bank_sop`, dan `app_store` beserta policy RLS yang aman).

---

### 3. Keputusan Produk & Arsitektur Teknis

- **Pilihan Pendekatan: Online-First dengan Local Fallback Cache**:
  - *Mengapa*: Jika jaringan internet di outlet sempat putus/lemah, trainer tetap bisa menilai tanpa kehilangan data karena sistem mencatat ke local cache dan otomatis memicu *retry sync* ke Supabase saat koneksi kembali pulih.
- **Skema Penyimpanan Hybrid di Supabase**:
  - Memanfaatkan tabel relasional terstruktur (`penilaian_praktik_onboarding_produk`, `onboarding_batches`, `kru`, `outlets`) untuk query terindeks dan laporan analitik.
  - Sekaligus memelihara snapshot data di tabel `app_store` (key-value store fleksibel) untuk menjamin kompatibilitas 100% dengan seluruh tabel operasional lama tanpa risiko migration failure.

---

### 4. Diagram Arsitektur & Alur Data

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             APLIKASI FRONTEND                               │
│  ┌───────────────────────┐             ┌──────────────────────────────────┐ │
│  │   Komponen Penilaian  │             │   Header & Supabase Status Pill  │ │
│  │  (Praktik / Kru / SOP)│             │       (Online / Reconnect)       │ │
│  └───────────┬───────────┘             └────────────────┬─────────────────┘ │
└──────────────┼──────────────────────────────────────────┼───────────────────┘
               │                                          │
               ▼                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STORAGE ENGINE (storage.ts)                        │
│ 1. Read: Prioritaskan data Supabase -> fallback ke LocalStorage             │
│ 2. Write: Simpan ke LocalStorage -> kirim langsung ke Supabase API          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
│         SUPABASE CLOUD REST          │  │     SUPABASE REALTIME CHANNEL     │
│   POST / PUT / DELETE via SDK        │  │     postgres_changes (WebSocket)  │
│ - penilaian_praktik_onboarding       │  │ - Mendengar perubahan data baru   │
│ - onboarding_batches                 │  │ - Mengupdate state app live       │
│ - app_store                          │  │                                   │
└──────────────────────────────────────┘  └───────────────────────────────────┘
```

#### Rencana Pelaksanaan:
1. **Penyelarasan Engine `storage.ts`**:
   - Menghubungkan setiap mutasi data (`savePenilaianPraktikProduk`, `saveOnboardingBatch`, `setTable`, `insertRow`, dll.) secara langsung ke Supabase sebagai tujuan utama.
2. **Penyempurnaan `supabase.ts`**:
   - Memperbaiki fungsi `pullAllFromSupabase` agar memperbarui data lokal dengan data cloud terbaru (bukan hanya mengisi saat local kosong).
   - Menyalakan channel Realtime Supabase saat inisialisasi aplikasi agar perubahan otomatis terpantau.
   - Menyediakan fungsi tes koneksi real-time dan generator skrip schema SQL otomatis.
3. **Penyegaran Tampilan Header & Modal Koneksi**:
   - Menghadirkan status visual "Supabase Online (Database Utama)" di bilah navigasi atas.
   - Memastikan tombol tes dan input URL/Anon Key responsif dan intuitif.
4. **Verifikasi & Uji Kompilasi**:
   - Menjalankan pengujian sintaksis dan `compile_applet` untuk menjamin aplikasi berjalan tanpa error.
