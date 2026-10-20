# Rencana Implementasi: Pemisahan Produk Mandiri, Penegakan Suhu Deep Fryer, dan Dashboard Grafik Analitik Onboarding

## 1. Ringkasan & Konteks Kebutuhan
Berdasarkan arahan pengguna:
1. **Pemisahan Produk Mandiri**: Produk tidak boleh digabung. *Scramble Egg* berdiri sendiri (5 menit), tidak digabung dengan *Indomie* (10 menit). Begitu juga varian produk lainnya dipisah murni sesuai itemnya di SOP.
2. **Kepatuhan Suhu 160°C Khusus Deep Fryer**: Suhu probe 160°C hanya berlaku untuk stasiun **Deep Fryer** (Goreng Ayam, Goreng Kulit, Goreng Terong, Goreng Jamur & Kentang). Produk seperti *Scramble Egg*, *Indomie*, *Nasi*, *Teh*, *Geprek*, *Sambal*, dan *Topping* **tidak menggunakan suhu 160°C** (bebas probe termometer).
3. **Dashboard Grafik Lengkap & Kaya Data ("Banyak Grafik Banyakin")**: Ditambahkan dashboard analitik lengkap dengan beragam grafik visual interaktif (Radar Kompetensi, Bar Performa 12 Kru, Deviasi Waktu SOS per Stasiun, Donut Distribusi Kelulusan, Matriks Kepatuhan Suhu Deep Fryer, dan Performa 12 Outlet Asal Kru).

---

## 2. Rincian Perubahan & Pemisahan Produk

### A. Katalog Produk & Stasiun Murni (Tanpa Penggabungan)
| Kode Tugas | Nama Produk Mandiri | Durasi Resmi | Kategori Suhu | Keterangan & Standar |
| :--- | :--- | :--- | :--- | :--- |
| `task-st1-nasi` | **Nasi 4 Cup** | 35 Mnt (D1) / 45 Mnt (D2) | **Bebas Suhu** | Rasio beras Miyako 4:5 air, centong bulat (tanpa timbang gram) |
| `task-st1-teh` | **Teh (10lt / 8lt)** | 40 Mnt (D1) / 30 Mnt (D2) | **Bebas Suhu** | Rebusan seduh teh wangi dispenser kasir |
| `task-st1-sup` | **Sup Sayur** | 40 Mnt | Warmer $\ge$ 75°C | Kuah kaldu sayuran segar |
| `task-st1-geprek-ori` | **Geprek Ori** | 2 Mnt (120 Detik) | **Bebas Suhu** | Ulek kasar cobek fresh, siram minyak panas wangi, toleransi 90–150 dtk |
| `task-st1-krisbar` | **Krisbar Geprek** | 7 Mnt | Panggangan karamel | Bakar bumbu krisbar gurih |
| `task-st1-geprek-moza` | **Geprek Mozarella** | 10 Mnt | Torch keju | Lumerkan mozzarella mulur |
| `task-st2-goreng-ayam` | **Goreng Ayam (Fryer)** | 20 Mnt | **🔥 DEEP FRYER 160°C** | Penepungan 2x celup, fryer 160°C kompor 175°C, core $\ge$ 74°C |
| `task-st2-scramble` | **Scramble Egg (Scrembel)** | 5 Mnt | **Bebas Suhu 160°C** | Wajan dadar, 1 butir telur + susu UHT + garam mix (mandiri, tanpa Indomie) |
| `task-st2-indomie` | **Indomie Goreng/Kuah** | 10 Mnt | Rebusan Panci 100°C | Panci air mendidih, rebus 2 mnt al-dente, racik bumbu (mandiri, tanpa telur) |
| `task-st2-mentai-krispi` | **Mentai Krispi** | 5 Mnt | Torch saus mentai | Saus mentai zig-zag wangi |
| `task-st2-geprek-mentai` | **Geprek Mentai** | 7 Mnt | Torch saus mentai | Ayam geprek sambal + saus mentai |
| `task-st2-nashville` | **Hot Nashville** | 2 Mnt | Wadah Celupan Bumbu | Bumbu celup 65g level 2, rendam 1 mnt, tabur boncabe, saus keju terpisah |
| `task-st2-spinach` | **Spinach (Bayam Crispy)** | 40 Mnt | Wajan Api Sedang | Goreng 90 dtk daun bayam iris di wajan, bumbu kentang 2.5g |
| `task-st2-krisbar-ayoli` | **Krisbar Ori & Ayoli** | 8 Mnt | Grill bumbu bakar | Bakar krisbar + saus ayoli gurih |
| `task-st3-terong` | **Goreng Terong** | 25 Mnt | **🔥 DEEP FRYER 160°C** | Potong serong 1.5 cm, krispi renyah luar lembut dalam |
| `task-st3-kulit` | **Goreng Kulit** | 45 Mnt | **🔥 DEEP FRYER 155°C** | Garing mekar kriuk tahan lama |
| `task-st3-sambal` | **Sambal (1 Variant)** | 30 Mnt | **Bebas Suhu** | Prep cabai rawit merah & ulek kasar cobek |
| `task-st3-nasgor` | **Nasgor Geprek** | 15 Mnt | Wok panas tumis | Tumis nasi bumbu HARA di wajan wok |
| `task-st3-keju` | **Keju Parut** | 5 Mnt | **Bebas Suhu** | Parut keju cheddar panjang rapi |
| `task-st3-ayoli` | **Geprek Ayoli** | 5 Mnt | **Bebas Suhu** | Siram saus ayoli creamy gurih |
| `task-d2-sambal-mattah`| **Sambal Mattah** | 20 Mnt | **Bebas Suhu** | Iris tipis serai, bawang merah, cabai rawit |
| `task-d2-sambal-jeruk` | **Sambal Daun Jeruk** | 20 Mnt | **Bebas Suhu** | Irisan daun jeruk purut buang tulang daun |
| `task-d2-jamur-kentang`| **Goreng Jamur & Kentang** | 15 Mnt | **🔥 DEEP FRYER 165°C** | Kentang beku 3-4 mnt, jamur mekar krispi |
| `task-d2-orange-shake` | **Orange & Milkshake** | 10 Mnt | **Bebas Suhu** | Shake minuman dingin & cup sealer otomatis |

---

## 3. Rencana Dashboard Analitik Grafik ("Banyak Grafik Banyakin")

Ditambahkan tab **"📊 Dashboard Analitik & Rapor Grafik"** di dalam sistem evaluasi yang memuat 7 jenis grafik visual dan data analitik interaktif:
1. **Radar Chart 4 Pilar Kompetensi HARA**:
   - Pilar 1 Teori SOP (20%)
   - Pilar 2 Praktik SOS (35%)
   - Pilar 3 HACCP & Suhu (15%)
   - Pilar 4 Budaya Sikap H.A.R.A (30%)
2. **Bar Chart Perbandingan Skor 12 Kru Onboarding**:
   - Memvisualisasikan capaian nilai tiap individu (Iqbal, Dhimas, Wanu, Tri, Gohan, Rully, Aulia, Karima, Shabrina, Ryan, Chicha, Intan) dengan batas KKM 75 dan Kategori Mahir $\ge$ 85.
3. **Scatter / Column Chart Deviasi Waktu SOS vs Standar**:
   - Mengukur kecepatan riil setiap stasiun (Nasi 35m, Ayam 20m, Terong 25m, Scramble 5m, Indomie 10m, Geprek 2m) dibandingkan batas toleransi wajar.
4. **Donut Chart Distribusi Status Kelulusan**:
   - Persentase kelulusan kru onboarding: *Lulus Mahir*, *Lulus Terampil*, dan *Perlu Remedial*.
5. **Bar Chart Kepatuhan Suhu Deep Fryer (160°C)**:
   - Persentase kepatuhan suhu minyak optimal deep fryer (155°C–165°C) khusus stasiun gorengan vs deteksi pelanggaran suhu.
6. **Stacked Bar Chart Performa 12 Outlet Asal**:
   - Membandingkan rata-rata nilai kru berdasarkan outlet asal (Imogiri Barat, Purworejo, Wates Bendungan, Sedayu, Jangkang, Gito-gati, Wates Kemiri, Parakan, Pandean, Godean Munggur, Kalakijo, Mantrijeron).
7. **Area Chart Trend Efisiensi Batch Simultan**:
   - Memantau tren ritme waktu penyelesaian Batch 1 (40 menit) dan Batch 2 (30–40 menit) sepanjang kurikulum 2 hari.

---

## 4. Rencana File yang Diubah
1. `src/data/trainingCenterData.ts`:
   - Memperbarui daftar tugas stasiun agar Scramble Egg (5 mnt) dan Indomie (10 mnt) berdiri sendiri.
   - Menetapkan atribut `is_deep_fryer: true` khusus untuk stasiun penggorengan minyak, dan `is_deep_fryer: false` untuk Scramble, Indomie, Nasi, Teh, Geprek, Sambal, dll.
2. `src/components/PenilaianPraktikView.tsx`:
   - Menghubungkan tugas mandiri baru ke grid simultan dan preset.
   - Mengunci verifikasi suhu 160°C **hanya muncul jika tugas bertipe deep fryer**. Scramble egg dan lainnya otomatis non-termal.
   - Menambahkan tombol dan tab **"📊 Dashboard Analitik & Grafik Lengkap"**.
3. `src/components/OnboardingAnalyticsDashboard.tsx` (Komponen Baru):
   - Komponen khusus visualisasi data dan grafik-grafik interaktif untuk rekam hasil onboarding 12 kru.
   - Fitur ekspor/cetak laporan hasil evaluasi.

---

## 5. Verifikasi & Pengujian
- Menjalankan `compile_applet` dan `lint_applet` untuk memastikan zero errors.
- Menguji independensi stasiun Scramble Egg dan Indomie di grid simultan.
- Memastikan stasiun Scramble Egg tidak menampilkan input suhu 160°C, sementara stasiun Goreng Ayam menampilkan probe suhu deep fryer 160°C secara akurat.
- Memastikan seluruh grafik analitik ter-render dengan rapi, responsif, dan kaya data.
