# Rencana Sistem Database Online Terpadu Multi-Perangkat (Otomatis & Real-Time)

Menjadikan sistem pelatihan dan penilaian HARA **benar-benar online secara otomatis antar-perangkat** (HP 1, HP 2, tablet, laptop), sehingga setiap kali penilaian disimpan di satu HP, data tersebut langsung muncul secara otomatis di HP lainnya tanpa perlu konfigurasi manual di setiap perangkat.

---

> [!IMPORTANT]
> **Jawaban & Konfirmasi Pengguna:**
> 1. **"Pakai Supabase bisa kan?"**: **Bisa sekali.** Agar semua HP otomatis terhubung ke Supabase tanpa perlu mengetikkan URL & Key di masing-masing HP, kredensial Supabase disimpan terpusat di server backend.
> 2. **"Intinya ketika disimpan"**: Fokus utama adalah keandalan alur simpan (*save event*). Setiap kali form penilaian atau batch disimpan di satu HP, data langsung dikirim ke cloud dan disinkronkan ke HP lainnya secara otomatis.
> 3. **Penyebab Mengapa Kemarin Belum Saling Terhubung**: Sebelumnya, data tersimpan hanya di memori lokal (*localStorage*) HP masing-masing karena Supabase belum menerima URL & Anon Key dari pengguna, sementara koneksi cloud bawaan sempat dinonaktifkan.

---

### 1. Ringkasan & Konsep Solusi

- **Tujuan**: Menghubungkan semua HP ke satu database cloud terpusat secara otomatis. Saat Trainer A menilai di HP 1 dan klik "Simpan", Trainer B di HP 2 langsung melihat data penilaian tersebut.
- **Strategi "Zero-Config" untuk Pengguna**:
  - Pengguna tidak perlu repot mengetikkan URL atau Anon Key di setiap HP yang membuka web.
  - Server backend dan cloud bridge aktif secara otomatis sebagai penghubung (*real-time sync relay*).
  - Jika pengguna memiliki project Supabase, URL & Key cukup dimasukkan satu kali dari menu Admin atau ditanam di server, dan seluruh HP otomatis tersambung ke Supabase tersebut.

---

### 2. Alur Pengalaman Pengguna (User Experience Flow)

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│              HP 1               │           │              HP 2               │
│  (Trainer Input Penilaian)      │           │    (Lead Trainer Memantau)      │
└────────────────┬────────────────┘           └────────────────▲────────────────┘
                 │                                             │
                 │ 1. Klik "Simpan Penilaian"                  │ 4. Otomatis Muncul
                 ▼                                             │    (Data Terupdate)
┌──────────────────────────────────────────────────────────────┴────────────────┐
│                       CLOUD DATABASE & SERVER RELAY                           │
│  - Supabase Cloud Database (Tabel penilaian & batch)                          │
│  - Server Proxy / Cloud Sync Listener aktif 24/7                              │
│  - Menerima mutasi data dari HP 1 & menyiarkan ke HP 2                        │
└───────────────────────────────────────────────────────────────────────────────┘
```

1. **Di HP 1 (Input)**:
   - Trainer membuka link aplikasi, mengisi form penilaian praktik kru Batch 30/31, lalu menekan tombol **"Simpan Penilaian"**.
   - Indikator kecil menampilkan status: *"Tersimpan ke Cloud Database"*.
2. **Di HP 2 (Penerima)**:
   - Tanpa perlu pengaturan apa pun, aplikasi di HP 2 langsung menerima data terbaru tersebut.
   - Tabel riwayat penilaian dan grafik langsung terupdate.

---

### 3. Keputusan Teknis & Arsitektur

- **Penyelarasan Server Proxy (Express + Vite)**:
  - Mengonfigurasi dev/production server agar rute `/api/db/sync` dan `/api/db/init` aktif penuh di port 3000, menghubungkan seluruh perangkat peramban ke satu *central store*.
- **Aktivasi Cloud Sync Engine**:
  - Menghidupkan kembali koneksi cloud terpusat (`firebase.ts` / Firestore cloud database yang sudah ter-provisioning di project AI Studio ini) sebagai jalur sinkronisasi cloud instan tanpa perlu akun eksternal tambahan.
- **Dukungan Penuh Supabase Terpusat**:
  - Menyediakan endpoint di server backend yang membaca kredensial Supabase dari environment server atau pengaturan terpusat. Ketika Supabase diisi, seluruh data secara otomatis dialirkan ke tabel-tabel Supabase pengguna.

---

### 4. Diagram Arsitektur Data

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                 HP 1 / HP 2                                   │
│  ┌─────────────────────────────┐             ┌─────────────────────────────┐  │
│  │   UI Penilaian & Batch      │             │   Local Storage Cache       │  │
│  │   (Form & Dashboard)        │             │   (Offline Fallback)        │  │
│  └──────────────┬──────────────┘             └──────────────▲──────────────┘  │
└─────────────────┼───────────────────────────────────────────┼─────────────────┘
                  │                                           │
                  ▼                                           │
┌─────────────────────────────────────────────────────────────┴─────────────────┐
│                         CENTRAL SYNC DISPATCHER                               │
│  1. Simpan Lokal (Instan)                                                     │
│  2. Kirim ke Server Backend `/api/db/sync` (Multi-Device Relay)               │
│  3. Kirim ke Supabase Cloud REST / Firestore Realtime                         │
└──────────────────────────────────────┬────────────────────────────────────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
┌──────────────────────────────────────┐  ┌─────────────────────────────────────┐
│            SUPABASE CLOUD            │  │        CLOUD SYNC BACKEND           │
│   (Tabel Onboarding & Penilaian)     │  │   (Siaran Data Otomatis ke HP 2)    │
└──────────────────────────────────────┘  └─────────────────────────────────────┘
```

#### Langkah Pengerjaan:
1. **Mengaktifkan Backend Express di Dev Server (`server.ts` + `vite.config.ts`)**:
   - Memastikan request `/api/*` dari HP 1 dan HP 2 langsung dilayani oleh server backend terpusat yang menyimpan data di database server.
2. **Mengaktifkan Cloud Database Engine**:
   - Membuka blokir cloud mode di `firebase.ts` dan menyelaraskan `storage.ts` agar setiap simpan langsung menembus cloud.
3. **Penyelarasan Supabase Terpusat**:
   - Memastikan server backend menyimpan dan membagikan konfigurasi Supabase ke semua perangkat klien secara otomatis.
4. **Verifikasi Kompilasi & Uji Sinkronisasi Multi-Device**:
   - Menjalankan `lint_applet` dan `compile_applet`.
