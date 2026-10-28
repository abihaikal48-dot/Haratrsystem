# Perombakan Fokus Training: Modal Konfirmasi Hapus In-App & Penilaian Kebersihan & Sikap Kru Individu

Fokus penuh pada ruang kerja **Training Onboarding**, mengarsipkan switch OPS/Training agar navigasi terpusat, mengganti seluruh popup browser `confirm()` yang terblokir sandbox dengan **Modal Konfirmasi Modern In-App** (pada Log Aktivitas dan Manajemen Pengguna), serta merevisi tab penilaian sekunder menjadi **Penilaian Kebersihan, Keaktifan, dan Sikap Kerja Individu per Kru**.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan konfirmasi pada tahap klarifikasi:
> 1. **Mekanisme Hapus**: Seluruh tombol aksi hapus (pada log evaluasi praktik produk dan manajemen akun) menggunakan **Modal Konfirmasi Modern langsung di layar** tanpa popup bawaan browser (`window.confirm`) yang selama ini terblokir oleh sandbox iframe.
> 2. **Struktur Penilaian Kebersihan & Sikap**: Dibuat sebagai tab terpisah khusus **Penilaian Kebersihan, Keaktifan & Sikap Kerja Individu**, di mana penilaian dinilai per individu kru (bukan agregat tim/stasiun), mencakup kriteria kebersihan, sanitasi, keaktifan, inisiatif, dan kepatuhan K3. Parameter "Kerjasama Tim" diarsipkan untuk tahap mendatang sesuai arahan.
> 3. **Sidebar**: Bilah pengalih switch OPS/Training diarsipkan/disembunyikan dari sidebar sehingga navigasi langsung terfokus pada modul Training Onboarding dan evaluasi kru.

---

### 1. Overview & Core Concept

- **Fokus Utama**: Menghilangkan friksi teknis (tombol hapus tidak merespons akibat sandbox browser iframe) dan menyelaraskan instrumen evaluasi trainer agar mencakup aspek non-teknis individual kru (kebersihan, kerapian stasiun, sanitasi, dan keaktifan kerja) secara terstruktur.
- **Sasaran Pengguna**: Lead Trainer, Trainer Lapangan, Area Supervisor, dan Administrator Training Center yang mengelola evaluasi kru harian.
- **Nilai Tambah**: 
  - Tindakan destruktif (hapus catatan audit atau hapus akun pengguna) memiliki dialog konfirmasi visual yang aman, jelas, dan dapat dibatalkan.
  - Penilaian kru menjadi lengkap: keterampilan teknis produk (SOP, waktu/SOS, gramatur/suhu) di tab 1, serta penilaian kebersihan, sanitasi, dan keaktifan individu di tab 2.

---

### 2. User Experience & Visual Design

#### A. Modal Konfirmasi Hapus Modern (In-App Dialog)
- Menggantikan `window.confirm()` dengan komponen modal Tailwind yang elegan:
  - **Header Peringatan**: Ikon `AlertTriangle` warna amber/rose dengan judul jelas ("Konfirmasi Hapus Data" / "Hapus Akun Pengguna").
  - **Deskripsi Kontekstual**: Menyebutkan nama kru, nama produk / nama akun yang akan dihapus, serta keterangan bahwa data akan dihapus permanen dari sistem dan cloud Supabase.
  - **Aksi Cepat**: Dua tombol tegas tanpa pill: tombol sekunder `"Batal"` (border netral) dan tombol destruktif `"Ya, Hapus Data"` (`bg-rose-600 hover:bg-rose-700 text-white font-bold`).

#### B. Pengarsipan Switch Workspace di Sidebar
- Menyembunyikan widget pemilih switch OPS/Training di bagian atas sidebar.
- Menetapkan default aktif ke ruang kerja **Training Onboarding**.
- Menampilkan item menu relevan untuk program training kru (Dashboard Onboarding, Praktik Produk SOP, Penilaian Kebersihan & Sikap, Log Evaluasi, Kurikulum, Master Kru/Batch).

#### C. Tab Penilaian Kebersihan, Keaktifan & Sikap Kerja Individu
- Mengubah tab sekunder di `OnboardingProductPracticeView`:
  - **Pemilih Kru Individu**: Memilih nama kru dari batch aktif (atau seluruh kru) dengan ringkasan status kelulusan.
  - **5 Dimensi Penilaian Individu**:
    1. *Personal Grooming & Higiene* (Apron bersih, hairnet/topi, kuku pendek & bersih, masker/sarung tangan).
    2. *Sanitasi & Kebersihan Stasiun Kerja* (Clean-as-you-go, sanitasi meja stainless, bebas kontaminasi silang).
    3. *Keaktifan & Inisiatif Kerja* (Responsif saat ada instruksi, proaktif membantu restocking bahan, cepat tanggap).
    4. *Kepatuhan K3 & Disiplin Waktu* (Penggunaan APD tahan panas fryer, hadir tepat waktu, kepatuhan batas suhu).
    5. *Pengorganisasian & Kerapian Alat* (Penyimpanan tong, spider skimmer, squeeze bottle pada tempat semestinya).
  - **Skor Otomatis (0 - 100)** dengan predikat ("Sangat Baik" $\ge 85$, "Baik" $\ge 75$, "Cukup" $\ge 65$, "Perlu Pembinaan" $<65$).
  - **Catatan Evaluator & Rekomendasi**: Trainer dapat menuliskan umpan balik langsung untuk perbaikan sikap atau kebersihan kru.
  - **Tabel Rekap Riwayat Sikap & Kebersihan Individu**: Riwayat evaluasi per kru dengan opsi lihat detail dan hapus (via modal konfirmasi).

---

### 3. Key Product Decisions & Trade-Offs

- **Penggantian Total `window.confirm`**:
  - *Keputusan*: Membuat komponen reusable `ConfirmDeleteModal` atau state modal konfirmasi in-app di `OnboardingActivityLogView`, `UserManagementView`, dan sub-tab evaluasi.
  - *Rasional*: Lingkungan iframe browser modern memblokir popup sinkron bawaan browser demi alasan keamanan. Modal in-app 100% andal, terhindar dari blokir sandbox, dan memberikan UI yang konsisten dengan desain HARA.
- **Pemisahan Penilaian Produk vs Kebersihan Individu**:
  - *Keputusan*: Tetap menjaga 2 tab terpisah namun kini keduanya berbasis kru individu (Kru X dievaluasi praktik goreng ayam di Tab 1, dan dievaluasi kebersihan & keaktifan kerjanya di Tab 2).
  - *Rasional*: Menilai kebersihan dan keaktifan saat praktik memasak sering kali mengganggu pencatatan stopwatch produk; memisahkannya ke tab evaluasi sikap/higiene tersendiri membuat lembar penilaian terfokus dan tidak padat.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Sidebar Navigation                              │
│         (Fokus Training Onboarding - Switch OPS Diarsipkan)            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴────────────────────────┐
         │                                                  │
         ▼                                                  ▼
┌───────────────────────────────────┐     ┌───────────────────────────────────┐
│ OnboardingProductPracticeView     │     │ OnboardingActivityLogView         │
│  ├─ Tab 1: Praktik Produk SOP     │     │  ├─ Lihat Detail Evaluasi         │
│  │   (Stopwatch, Suhu, Gramatur)  │     │  ├─ Unduh PDF Resmi               │
│  └─ Tab 2: Kebersihan & Sikap Kru │     │  └─ Hapus Evaluasi               │
│      (Grooming, Sanitasi,         │     │      └─▶ [In-App Confirm Modal]  │
│       Keaktifan, K3, Kerapian)    │     └───────────────────────────────────┘
└─────────────────┬─────────────────┘                       ▲
                  │                                         │
                  ▼                                         │
┌───────────────────────────────────────────────────────────┴─────────┐
│                      UserManagementView                             │
│  ├─ Tambah / Edit Pengguna                                          │
│  ├─ Beralih Sesi Akun                                               │
│  └─ Hapus Akun Pengguna ──▶ [In-App Confirm Modal] (Tanpa confirm)  │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Storage Layer (storage.ts) + Supabase Real-Time Auto-Sync           │
│  ├─ penilaian_praktik_onboarding_produk                             │
│  ├─ penilaian_kebersihan_sikap_kru (model baru individu)            │
│  └─ app_users                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

#### Struktur Data Penilaian Kebersihan & Sikap Individu (`PenilaianSikapKebersihanKru`)
```typescript
interface PenilaianSikapKebersihanKru {
  id: string;
  kru_id: string;
  nama_kru: string;
  nomor_batch: string;
  kode_outlet: string;
  tanggal: string;
  skor_grooming: number;      // 0 - 20 (Kebersihan personal, apron, kuku, topi)
  skor_sanitasi: number;      // 0 - 25 (Kebersihan meja, clean-as-you-go)
  skor_keaktifan: number;     // 0 - 25 (Proaktif, inisiatif, respon cepat)
  skor_k3_disiplin: number;   // 0 - 15 (APD, keselamatan panas/minyak, waktu)
  skor_kerapian_alat: number; // 0 - 15 (Penataan alat kerja, tong, skimmer)
  skor_total: number;         // 0 - 100
  predikat: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Pembinaan';
  status: 'Lulus' | 'Catatan Perbaikan';
  catatan_trainer?: string;
  penilai_nama: string;
  created_at: string;
}
```

---

### Rencana Eksekusi Bertahap

1. **Komponen Modal Konfirmasi Terpadu (`ConfirmModal.tsx`)**:
   - Membuat komponen modal konfirmasi universal in-app yang bebas dari `window.confirm()`.
2. **Perbaikan Hapus di `OnboardingActivityLogView.tsx` & `UserManagementView.tsx`**:
   - Menggantikan `confirm(...)` dengan modal in-app sehingga tombol sampah/hapus langsung memunculkan modal dan menghapus data saat disetujui.
3. **Pengarsipan Switch Workspace di `Sidebar.tsx`**:
   - Menyembunyikan pemilih switch mode OPS/Training dan memusatkan alur kerja ke Training Onboarding.
4. **Restrukturisasi Tab Evaluasi di `OnboardingProductPracticeView.tsx`**:
   - Memodernisasi sub-tab menjadi **"Penilaian Kebersihan & Sikap Kerja Kru" (Individu)** dengan checklist kriteria kebersihan, sanitasi, keaktifan, K3, dan kerapian alat per kru individu.
5. **Verifikasi Build & Linter**:
   - Menjalankan `compile_applet` dan `lint_applet` untuk menjamin nol error sebelum rilis.
