# Rencana Implementasi: Standarisasi Pelatihan Kantor Lempongsari, Anti-Reset Draft Form, Koreksi Produk & Timer SOP, Ceklis Sikap Lengkap, dan Penilaian Tim Stasiun

Menyempurnakan sistem Onboarding Training Center HARA Chicken sesuai arahan operasional: penetapan lokasi permanen Kantor Lempongsari, persistensi draft penilaian anti-reset saat refresh/pindah tab, restrukturisasi produk SOP (pemisahan Ayam Geprek Mentai vs Mentai Krispi, penghapusan Tahu & Tempe Krispi), koreksi timer realistis (persiapan potong kulit 1-1 dan penghapusan waktu platting nasi), pengembangan ceklis detail sikap & kebersihan, serta integrasi modul penilaian tim untuk Station Kerja 1 & 2.

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan klarifikasi yang telah disepakati:
> - **Penilaian Tim Stasiun**: Format ceklis evaluasi tim berlaku seragam dan terstruktur untuk Station Kerja 1 maupun Station Kerja 2.
> - **Timer Kulit Krispi**: Disesuaikan dengan alokasi realistis: 15 menit persiapan (pemotongan kulit satu per satu) dan 12 menit penggorengan deep fryer 150°C.
> - **Ceklis Sikap & Kebersihan**: Mencakup 4 pilar utama: Kerapian Seragam (Grooming), Sanitasi Alat & Area, Higienitas Tangan & Pangan, serta Kedisiplinan & Etika Kerja.
> - **Lokasi Pelatihan**: Dikunci permanen ke "Kantor Lempongsari" (menghilangkan selector outlet pelatihan).

---

## 1. Overview & Core Concept

Sistem ini dirancang untuk memastikan trainer dan asesor di Training Center HARA Chicken dapat melakukan penilaian praktik harian dengan lancar tanpa kendala teknis:
- **Lokasi Terpusat**: Seluruh pelatihan terfokus di **Kantor Lempongsari** tanpa kerancuan pilihan outlet.
- **Anti-Reset & Auto-Save**: Setiap detik pengetikan catatan, checklist langkah, pengisian suhu/gramatur, dan status timer tersimpan otomatis ke penyimpanan lokal (`localStorage`). Pindah tab maupun refresh browser tidak akan menghilangkan data yang sedang diinput.
- **SOP Akurat & Realistis**: Produk tidak aktif (Tahu & Tempe) dieliminasi; varian Mentai dipisahkan menjadi menu mandiri; timer disesuaikan dengan aktivitas riil di dapur (tanpa waktu platting nasi yang mubazir; waktu potong kulit diperpanjang).
- **Evaluasi 360 Derajat**: Meliputi Penilaian Praktik Produk Individu, Ceklis Detail Sikap & Kebersihan Personal, serta Penilaian Kerja Sama Tim per Stasiun Kerja (Station 1 & Station 2).

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Header Training Center Terpadu**:
   - Menampilkan badge lokasi resmi bertuliskan **"Lokasi Pelatihan: Kantor Lempongsari"** dengan ikon kantor terverifikasi (tanpa dropdown outlet pelatihan).
   - Menampilkan indikator status sinkronisasi lokal: *"Auto-Save Aktif: Draft Anda aman tersimpan"* sehingga asesor merasa tenang.

2. **Alur Penilaian Produk Individu dengan Auto-Restore**:
   - Asesor membuka tab sesi penilaian kru dan memilih produk SOP.
   - Form secara real-time menyimpan setiap perubahan ke storage lokal.
   - Bila asesor berpindah ke tab Roadmap/Sikap/Tim atau browser ter-refresh mendadak, form langsung kembali ke kondisi terakhir yang sedang dikerjakan.
   - Terdapat tombol *"Sesi Baru"* jika ingin memulai lembar penilaian kosong berikutnya.

3. **Katalog Produk SOP Terkini**:
   - **Ayam Geprek Saus Mentai**: Produk mandiri dengan langkah SOP uleg bumbu, geprek, padatkan di cobek, oles mentai, torch di cobek batu, dan angkat memakai 2 solet.
   - **Ayam Krispi Saus Mentai**: Produk mandiri tanpa proses geprek di cobek (ayam krispi utuh dilumuri saus mentai dan ditorch).
   - **Tahu & Tempe Krispi**: Dihapus secara bersih dari daftar produk aktif.
   - **Timer Realistis**:
     - *Nasi Putih Pulen*: Prep 5 menit, Masak 30 menit (15m gas + 15m resting tanak), Finishing: 0 menit (tanpa waktu platting nasi).
     - *Kulit Krispi*: Prep 15 menit (motong kulit mentah 1-1, dusting 2x), Masak 12 menit (goreng 150°C), Pendinginan & Sealing 5 menit.

4. **Ceklis Detail Sikap & Kebersihan Kru**:
   - Tab khusus penilaian sikap dengan rincian ceklis granular:
     - *Kerapian Seragam & Diri*: Celemek bersih, topi/hairnet rapi, kuku pendek & bersih, pakaian SOP rapi.
     - *Sanitasi Alat*: Talenan & pisau bersih terpisah, cobek batu bersih pasca uleg, kebersihan meja kerja.
     - *Higienitas Tangan*: Cuci tangan 6 langkah air mengalir + sabun, penggunaan sarung tangan saat handling saji.
     - *Kedisiplinan & Sikap*: Datang tepat waktu, fokus mendengar instruksi trainer, kesigapan membantu tim, kepatuhan titik kritis.

5. **Modul Penilaian Tim (Station Kerja 1 & Station Kerja 2)**:
   - Sub-tab baru: **"Penilaian Tim (Stasiun)"**.
   - Asesor memilih Stasiun yang dinilai: **Station Kerja 1** atau **Station Kerja 2**.
   - Form penilaian mengevaluasi performa kelompok kru yang bertugas di stasiun tersebut:
     - Koordinasi dan komunikasi saat flow pesanan masuk.
     - Kecepatan dan ketepatan alur kerja tanpa penumpukan (bottleneck).
     - Kerapian dan sanitasi stasiun kerja bersama.
     - Handover / operan produk ke stasiun berikutnya secara mulus.
     - Nilai tim, catatan evaluasi pelatih, dan tombol simpan permanen.

---

## 3. Key Product Decisions & Trade-Offs

- **Penguncian Lokasi ke Kantor Lempongsari**:
  - *Keputusan*: Menghilangkan dropdown pilihan outlet tempat pelatihan dan mengunci lokasi pada `Kantor Lempongsari`.
  - *Alasan*: Seluruh kegiatan Onboarding Training Center terpusat di Kantor Lempongsari. Menyajikan opsi dropdown outlet hanya membingungkan asesor dan memicu ketidakkonsistenan data.

- **Auto-Save Draft di Penyimpanan Lokal (Local Master)**:
  - *Keputusan*: Menyimpan state `sessions` aktif ke key `hara_active_assessment_sessions` setiap kali ada mutasi state dengan debounce ringan.
  - *Alasan*: Mencegah data hilang saat pergantian tab navigasi atau refresh yang tidak disengaja. Tidak ada delay server dan bekerja 100% andal secara offline.

- **Pemisahan Entitas SOP Mentai**:
  - *Keputusan*: Memisahkan `prod-18-ayam-mentai` menjadi `prod-18a-geprek-mentai` (Ayam Geprek Saus Mentai) dan `prod-18b-krispi-mentai` (Ayam Krispi Saus Mentai).
  - *Alasan*: Teknik pengerjaan dan alat berbeda (geprek memerlukan cobek & pemadatan, sedangkan krispi mentai tidak dimemarkan di cobek).

- **Koreksi Timer Sesuai SOP Riil**:
  - *Keputusan*: Menghapus timer platting nasi dan menaikkan waktu persiapan kulit ayam menjadi 15 menit untuk memotong kulit satu per satu.
  - *Alasan*: Penilaian timer harus mencerminkan durasi realistis kru di lapangan, bukan angka teoretis yang tidak dapat dipenuhi.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                   HARA TRAINING CENTER CORE UI                         │
│   Lokasi Permanen: Kantor Lempongsari | Anti-Reset Auto-Save Active   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  Penilaian Praktik   │  │ Ceklis Detail Sikap  │  │    Penilaian Tim     │
│   Produk Individu    │  │     & Kebersihan     │  │ (Station 1 & St. 2)  │
│  - SOP Mentai Pisah  │  │  - Kerapian Seragam  │  │  - Ritme & Flow      │
│  - Hapus Tahu/Tempe  │  │  - Sanitasi Alat     │  │  - Komunikasi Tim    │
│  - Timer Realistis   │  │  - Higiene Tangan    │  │  - Kebersihan Area   │
│  - Auto-Save Draft   │  │  - Kedisiplinan      │  │  - Handover Saji     │
└──────────┬───────────┘  └──────────┬───────────┘  └──────────┬───────────┘
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     ▼
                ┌────────────────────────────────────────┐
                │   Storage Database (db / localStorage) │
                │   - hara_active_assessment_sessions    │
                │   - hara_pd_penilaian_sikap_kru        │
                │   - hara_pd_penilaian_tim_stasiun      │
                │   - bank_sop_products (Master Data)    │
                └────────────────────────────────────────┘
```

### Data Model Additions

1. **Penyimpanan Draft Aktif (`AssessmentSessionTab`)**:
   - `hara_active_assessment_sessions`: Array sesi aktif lengkap dengan state timer, input checklist, suhu, gramatur, dan catatan.
   - `hara_active_assessment_tab_id`: ID tab sesi aktif yang sedang terbuka.

2. **Penilaian Tim Stasiun (`PenilaianTimStasiun`)**:
   ```typescript
   export interface PenilaianTimStasiun {
     id: string;
     tanggal: string;
     stasiun: 'Station Kerja 1' | 'Station Kerja 2';
     batchId?: string;
     namaTim: string;
     anggotaKruIds: string[];
     anggotaKruNama: string[];
     skorFlowKerja: number;       // 1-100 (Ritme & Tanpa Bottleneck)
     skorKomunikasiTim: number;   // 1-100 (Koordinasi & Sinergi)
     skorKebersihanStasiun: number; // 1-100 (Sanitasi Alat & Meja Bersama)
     skorHandover: number;        // 1-100 (Kerapian Operan Produk)
     skorTotal: number;           // Rata-rata komposit
     ceklisDetail: {
       ritmeKerjaCepat: boolean;
       komunikasiEfektif: boolean;
       areaKerjaHigienis: boolean;
       alatDibersihkanLangsung: boolean;
       operanProdukSesuaiSOP: boolean;
     };
     catatanTrainer: string;
     trainerNama: string;
     created_at: string;
   }
   ```

3. **Perluasan Ceklis Sikap & Kebersihan (`PenilaianSikapKebersihanKru`)**:
   - Kategori seragam (celemek, topi/hairnet, kuku, atribut lengkap).
   - Kategori sanitasi alat (pembersihan pisau, talenan, cobek, meja kerja).
   - Kategori higiene personal (cuci tangan rutin, sarung tangan).
   - Kategori kedisiplinan (tepat waktu, sopan santun, kepatuhan instruksi).

---

## 5. Planned Verification Steps

1. **Verifikasi Lokasi**: Memastikan label lokasi pelatihan terkunci tetap pada "Kantor Lempongsari" tanpa adanya pilihan dropdown outlet yang mengaburkan.
2. **Verifikasi Auto-Save & Refresh Resilience**: Mengisi data penilaian pada sesi kru, melakukan navigasi antar tab dan me-refresh browser, kemudian memverifikasi bahwa form tetap terisi 100% tanpa reset.
3. **Verifikasi List Produk SOP**: Memastikan Tahu & Tempe Krispi tidak muncul lagi; memastikan "Ayam Geprek Saus Mentai" dan "Ayam Krispi Saus Mentai" tampil terpisah sebagai dua menu mandiri yang valid.
4. **Verifikasi Timer Realistis**: Memastikan waktu platting nasi dihilangkan (0 menit) dan waktu persiapan kulit ayam diatur menjadi 15 menit (untuk memotong 1 per 1).
5. **Verifikasi Ceklis Sikap & Modul Tim**: Memastikan ceklis sikap detail dapat diisi dan tersimpan, serta modul Penilaian Tim Station Kerja 1 & 2 berfungsi penuh untuk mencatat evaluasi kelompok kru.
6. **Build & Lint Verification**: Menjalankan `compile_applet` dan `lint_applet` untuk menjamin tidak ada error TypeScript maupun runtime.
