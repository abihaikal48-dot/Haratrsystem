import { PenilaianOnboardingTC, Division } from '../types';
import { DAFTAR_PESERTA_ONBOARDING_TC } from './trainingCenterData';

export interface StationAssessmentTemplate {
  stasiun: 'Station 1' | 'Station 2' | 'Station 3' | 'Station 4';
  stasiunLabel: string;
  divisi: Division;
  namaTugas: string;
  kodeSop: string;
  targetDurasiDetik: number;
  toleransiLabel: string;
  targetSuhu?: number;
  toleransiSuhuLabel?: string;
  targetGramatur?: number;
  toleransiGramaturLabel?: string;
  langkahKritis: string[];
  indikatorKebersihan: string[];
  indikatorTim: string[];
  pertanyaanKnowledge: { tanya: string; kunci: string }[];
}

export const ONBOARDING_STATION_TEMPLATES: Record<string, StationAssessmentTemplate> = {
  'stasiun-1': {
    stasiun: 'Station 1',
    stasiunLabel: 'Station 1 - Nasi Miyako & Marinasi Daging Segar',
    divisi: 'Kitchen',
    namaTugas: 'Tanak Nasi 4 Cup & Marinasi Daging Ayam 5kg',
    kodeSop: 'HC-SOP-KIT-01',
    targetDurasiDetik: 2100, // 35 menit
    toleransiLabel: '30 - 40 Menit (Ideal 35 Menit)',
    targetGramatur: 120, // 120g per porsi nasi
    toleransiGramaturLabel: '120g ± 5g (Centong Bulat Standar)',
    langkahKritis: [
      'Cuci beras Miyako minimal 3 kali bilas hingga air bilasan jernih',
      'Rasio air tepat: 4 cup beras : 5 cup air bersih',
      'Kunci pengaman tombol cook gas ditekan sempurna sampai api biru menyala',
      'Diamkan (resting) 15 menit setelah tombol naik sebelum disajikan',
      'Marinasi daging ayam merata dengan takaran bumbu baku tanpa air berlebih',
    ],
    indikatorKebersihan: [
      'Memakai APD dapur lengkap (celemek bersih, hairnet rapi, sarung tangan)',
      'Meja stainless cuci & marinasi bersih dari tetesan darah ayam mentah',
      'Pemisahan wadah bahan mentah (raw) dan bahan matang (zero cross-contamination)',
      'Pengelolaan limbah: sisa air beras dan kemasan bumbu langsung dibuang ke tempat sampah tertutup',
    ],
    indikatorTim: [
      'Memberikan callout konfirmasi saat menanak: "Nasi Masuk Rice Cooker Gas!"',
      'Koordinasi ke stasiun kasir & geprek mengenai estimasi stok nasi siap saji',
      'Membantu rekan stasiun 2 (fryer) mengambil wadah ayam jika sedang kosong',
      'Merespon cepat instruksi trainer atau kepala gerai dengan sikap positif',
    ],
    pertanyaanKnowledge: [
      {
        tanya: 'Berapa rasio takaran baku antara cup beras Miyako dan air?',
        kunci: '4 Cup Beras : 5 Cup Air Bersih',
      },
      {
        tanya: 'Berapa lama waktu resting (diamkan) nasi setelah tombol cook naik?',
        kunci: 'Minimal 15 menit agar nasi matang tanak pulen sempurna',
      },
      {
        tanya: 'Bagaimana cara mencegah kontaminasi silang bakteri Salmonella pada ayam mentah?',
        kunci: 'Pisahkan talenan & wadah ayam mentah, cuci tangan dengan sabun food grade sebelum memegang alat lain',
      },
    ],
  },

  'stasiun-2': {
    stasiun: 'Station 2',
    stasiunLabel: 'Station 2 - Deep Fryer 160°C & Penirisan Crispy',
    divisi: 'Kitchen',
    namaTugas: 'Penggorengan Ayam Crispy Suhu 160°C & Penirisan 7 Menit',
    kodeSop: 'HC-SOP-KIT-02',
    targetDurasiDetik: 420, // 7 menit
    toleransiLabel: '06:45 - 07:15 Menit (Ideal 07:00)',
    targetSuhu: 160,
    toleransiSuhuLabel: '160°C ± 2°C (Wajib Cek Termometer Analog/Digital Fryer)',
    targetGramatur: 125, // Berat potongan ayam
    toleransiGramaturLabel: '120g - 130g per potong paha/dada',
    langkahKritis: [
      'Pastikan suhu minyak mencapai tepat 160°C sebelum ayam dimasukkan (dropping)',
      'Teknik penepungan 2x celup air es & kibas 3x hingga membentuk keriting alami',
      'Masukkan ayam per potong secara perlahan ke keranjang agar tidak menempel',
      'Guncang keranjang fryer pada menit ke-2 untuk meratakan sirkulasi minyak panas',
      'Angkat dan tiriskan di holding tray miring minimal 30 detik sebelum dipindahkan ke display',
    ],
    indikatorKebersihan: [
      'Grooming & APD: celemek tahan panas, sarung tangan silicon/tongs panjang, masker',
      'Pembersihan remah tepung (skimming) di permukaan minyak secara berkala',
      'Area lantai sekitar deep fryer kering dari percikan minyak licin (safety 5S)',
      'Lap basah dan lap kering dipisahkan dengan kode warna kain baku HARA',
    ],
    indikatorTim: [
      'Callout vokal lantang saat drop: "Ayam Crispy 12 Potong Masuk Fryer!"',
      'Callout countdown 1 menit sebelum matang: "Satu Menit Lagi Ayam Siap Display!"',
      'Sinkronisasi serah terima (handover) ke stasiun display & kasir',
      'Kooperatif saat shift ramai dan siap membagi beban kerja frying',
    ],
    pertanyaanKnowledge: [
      {
        tanya: 'Berapa suhu baku penggorengan ayam krispi HARA Chicken dan toleransinya?',
        kunci: 'Tepat 160°C, toleransi ± 2°C (158°C - 162°C)',
      },
      {
        tanya: 'Berapa lama standar penirisan minyak ayam sebelum dipindahkan ke holding display?',
        kunci: 'Minimal 30 detik di keranjang tiris miring',
      },
      {
        tanya: 'Berapa batas shelf-life ayam goreng di holding cabinet display sebelum expired?',
        kunci: 'Maksimal 90 menit (1.5 jam) agar kualitas kerenyahan tetap prima',
      },
    ],
  },

  'stasiun-3': {
    stasiun: 'Station 3',
    stasiunLabel: 'Station 3 - Sambal Bawang Geprek & Standar Packaging',
    divisi: 'Geprek',
    namaTugas: 'Ulek Sambal Bawang Korek, Geprek Ayam & Kemas Box/Paper',
    kodeSop: 'HC-SOP-GPR-01',
    targetDurasiDetik: 45, // 45 detik per porsi
    toleransiLabel: '35 - 55 Detik per Porsi Geprek',
    targetGramatur: 25, // 25g cabai & minyak panas per porsi
    toleransiGramaturLabel: '25g ± 3g Sambal Bawang per Porsi',
    langkahKritis: [
      'Ambil cabai rawit segar & bawang putih sesuai takaran level kepedasan',
      'Siram minyak panas mendidih dari deep fryer tepat 1 sendok takar khusus (15ml)',
      'Ulek kasar bertekstur (bukan blender halus) agar aroma bawang terkunci',
      'Geprek ayam crispy 2 ketukan mantap agar daging renyah tanpa menghancurkan tulang',
      'Kemas rapi dalam lunch box / kertas anti-minyak dengan stiker varian rasa',
    ],
    indikatorKebersihan: [
      'Memakai sarung tangan plastik sekali pakai (disposable gloves) saat memegang ayam',
      'Cobek batu & ulekan dicuci bersih dan dikeringkan secara berkala per batch',
      'Meja perakitan packaging bebas ceceran minyak sambal dan sisa remukan tulang',
      'Tempat sampah basah pedal tertutup digunakan dengan benar tanpa disentuh tangan',
    ],
    indikatorTim: [
      'Merespon tiket pesanan kasir dengan konfirmasi ulang: "Order #04 Paket Geprek Diterima!"',
      'Handover pesanan matang ke meja serah kasir dalam kondisi rapi dan hangat',
      'Memberi peringatan cepat jika stok cabai atau kertas bungkus menipis',
      'Saling menyemangati tim saat antrean dine-in & delivery melonjak',
    ],
    pertanyaanKnowledge: [
      {
        tanya: 'Berapa gramasi takaran sambal bawang standar HARA per porsi level 1?',
        kunci: '25 gram (kombinasi cabai rawit merah, bawang putih, garam, dan siraman minyak panas)',
      },
      {
        tanya: 'Mengapa ulekan sambal tidak boleh dihaluskan seperti bumbu pasta blender?',
        kunci: 'Untuk mempertahankan tekstur renyah dan sensasi bulir cabai asli khas HARA',
      },
      {
        tanya: 'Berapa ketukan ideal saat menggeprek ayam crispy agar tidak hancur berantakan?',
        kunci: 'Maksimal 2 ketukan mantap: 1 ketukan memecah kerenyahan kulit, 1 ketukan meratakan sambal',
      },
    ],
  },

  'stasiun-4': {
    stasiun: 'Station 4',
    stasiunLabel: 'Station 4 - Kasir POS, Greeting 5S & Speed of Service (SOS)',
    divisi: 'Kasir',
    namaTugas: 'Transaksi POS Kasir, Greeting Senyum Salam Sapa & Penyajian',
    kodeSop: 'HC-SOP-KAS-01',
    targetDurasiDetik: 40, // 40 detik per transaksi
    toleransiLabel: '30 - 50 Detik per Transaksi Pelanggan',
    targetGramatur: 1, // 1 struk lengkap
    toleransiGramaturLabel: 'Akurasi Uang Kas 100% Sesuai Struk POS',
    langkahKritis: [
      'Greeting ramah 3 detik pertama dengan senyum, salam, dan sapa hangat khas HARA',
      'Input pesanan ke layar POS kasir dengan kecepatan dan akurasi tinggi',
      'Melakukan upselling menu kombo / minuman segar secara natural dan sopan',
      'Menyebutkan nominal uang yang diterima dan nominal kembalian dengan jelas',
      'Menyerahkan struk kasir dan mengucapkan terima kasih serta doa keberkahan',
    ],
    indikatorKebersihan: [
      'Penampilan (grooming) rapi, wangi, seragam bersih, hairnet & topi terpasang sempurna',
      'Area meja register kasir bersih dari struk tercecer atau gelas minuman kru',
      'Pembersihan akrilik pembatas dan mesin EDC dengan desinfektan food-safe',
      'Tangan selalu bersih saat menyerahkan makanan pelengkap (sendok, tisu, saus)',
    ],
    indikatorTim: [
      'Komunikasi cepat ke kitchen saat ada pesanan khusus: "Order 3 Dada Krispi Dine-in!"',
      'Membantu rekan stasiun packaging jika counter kasir sedang tidak ada antrean',
      'Koordinasi dengan Kepala Outlet jika mendapati keluhan pelanggan secara sopan',
      'Menjaga suasana antrean tetap tertib, nyaman, dan menyenangkan bagi pelanggan',
    ],
    pertanyaanKnowledge: [
      {
        tanya: 'Sebutkan 5 pilar budaya pelayanan HARA Chicken saat melayani pelanggan!',
        kunci: 'Senyum, Salam, Sapa, Sopan, dan Santun (5S)',
      },
      {
        tanya: 'Berapa target standar Speed of Service (SOS) transaksi kasir sejak tamu tiba?',
        kunci: 'Maksimal 40-50 detik per transaksi hingga struk dan pesanan diproses',
      },
      {
        tanya: 'Bagaimana penanganan awal kasir jika pelanggan mengeluh pesanan tertukar?',
        kunci: 'Meminta maaf dengan tulus, segera ganti menu baru yang benar tanpa berdebat, dan laporkan ke Kepala Outlet',
      },
    ],
  },
};

/**
 * KALKULATOR PENILAIAN OBJEKTIF ONBOARDING
 * Mengonversi input terukur (stopwatch detik vs target, deviasi gramatur, deviasi suhu, checklist)
 * menjadi skor 0-100 dan skala 1-5 serta kesimpulan kelulusan dan deteksi kesalahan faktual.
 */
export function hitungPenilaianObjektifOnboarding(params: {
  durasiDetik: number;
  targetDurasiDetik: number;
  suhuAktual?: number;
  targetSuhu?: number;
  gramaturAktual?: number;
  targetGramatur?: number;
  checklistLangkah: { langkah: string; terpenuhi: boolean }[];
  checklistKebersihan: { poin: string; terpenuhi: boolean; catatan?: string }[];
  checklistTim: { poin: string; terpenuhi: boolean; catatan?: string }[];
  checklistKnowledge: { pertanyaan: string; terjawab_benar: boolean; jawaban_peserta?: string }[];
}): {
  deviasiDetik: number;
  skorKetepatan: number;
  skorKebersihan: number;
  skorTim: number;
  skorKnowledge: number;
  skorTotal: number;
  skalaLima: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  statusKelulusan: 'Lulus Sempurna' | 'Lulus Bersyarat' | 'Remedial Stasiun';
  titikKesalahan: string[];
  rekomendasiPerbaikan: string;
} {
  const {
    durasiDetik,
    targetDurasiDetik,
    suhuAktual,
    targetSuhu,
    gramaturAktual,
    targetGramatur,
    checklistLangkah,
    checklistKebersihan,
    checklistTim,
    checklistKnowledge,
  } = params;

  const deviasiDetik = durasiDetik - targetDurasiDetik;
  const titikKesalahan: string[] = [];

  // 1. KETEPATAN (Bobot: 35%)
  // Waktu Score: toleransi ±15% = 100 poin, setiap deviasi lebih dari 15% dikurangi penalti
  const ratioWaktu = targetDurasiDetik > 0 ? durasiDetik / targetDurasiDetik : 1;
  let skorWaktu = 100;
  if (ratioWaktu > 1.3) {
    skorWaktu = Math.max(40, 100 - Math.round((ratioWaktu - 1) * 120));
    const delayMenit = Math.ceil(Math.abs(deviasiDetik) / 60);
    titikKesalahan.push(`Durasi pengerjaan terlambat ${delayMenit} menit dari target standar (${durasiDetik} dtk vs ${targetDurasiDetik} dtk).`);
  } else if (ratioWaktu > 1.15) {
    skorWaktu = 85;
    titikKesalahan.push(`Durasi pengerjaan melebihi toleransi waktu (+${deviasiDetik} detik).`);
  } else if (ratioWaktu < 0.7) {
    // Terlalu cepat bisa jadi indikasi langkah terburu-buru
    skorWaktu = 80;
    titikKesalahan.push(`Durasi terlalu cepat (${durasiDetik} dtk), periksa kematangan produk.`);
  }

  // Suhu Score (jika ada)
  let skorSuhu = 100;
  if (targetSuhu && suhuAktual) {
    const diffTemp = Math.abs(suhuAktual - targetSuhu);
    if (diffTemp > 8) {
      skorSuhu = 50;
      titikKesalahan.push(`Suhu minyak menyimpang tajam (${suhuAktual}°C vs standar ${targetSuhu}°C, deviasi ${diffTemp}°C).`);
    } else if (diffTemp > 3) {
      skorSuhu = 80;
      titikKesalahan.push(`Suhu minyak belum tepat pada titik target (${suhuAktual}°C vs ${targetSuhu}°C).`);
    }
  }

  // Gramatur Score (jika ada)
  let skorGram = 100;
  if (targetGramatur && gramaturAktual) {
    const diffGram = Math.abs(gramaturAktual - targetGramatur);
    const pctDiff = (diffGram / targetGramatur) * 100;
    if (pctDiff > 15) {
      skorGram = 60;
      titikKesalahan.push(`Gramatur produk tidak sesuai standar (${gramaturAktual}g vs target ${targetGramatur}g, deviasi ${diffGram.toFixed(1)}g).`);
    } else if (pctDiff > 7) {
      skorGram = 85;
      titikKesalahan.push(`Gramatur produk sedikit di luar batas toleransi (${gramaturAktual}g vs target ${targetGramatur}g).`);
    }
  }

  // Langkah Kritis Score
  const totalLangkah = checklistLangkah.length || 1;
  const langkahLulus = checklistLangkah.filter((l) => l.terpenuhi).length;
  const skorLangkah = (langkahLulus / totalLangkah) * 100;
  checklistLangkah.forEach((l) => {
    if (!l.terpenuhi) {
      titikKesalahan.push(`Langkah kritis terlewat: "${l.langkah}".`);
    }
  });

  const skorKetepatan = Math.round(
    skorWaktu * 0.35 +
    skorLangkah * 0.45 +
    (targetSuhu ? skorSuhu * 0.1 : 0) +
    (targetGramatur ? skorGram * 0.1 : 0)
  );

  // 2. KEBERSIHAN (Bobot: 25%)
  const totalKebersihan = checklistKebersihan.length || 1;
  const kebersihanLulus = checklistKebersihan.filter((k) => k.terpenuhi).length;
  const skorKebersihan = Math.round((kebersihanLulus / totalKebersihan) * 100);
  checklistKebersihan.forEach((k) => {
    if (!k.terpenuhi) {
      titikKesalahan.push(`Poin kebersihan & 5S belum terpenuhi: "${k.poin}".`);
    }
  });

  // 3. KERJA SAMA TIM (Bobot: 20%)
  const totalTim = checklistTim.length || 1;
  const timLulus = checklistTim.filter((t) => t.terpenuhi).length;
  const skorTim = Math.round((timLulus / totalTim) * 100);
  checklistTim.forEach((t) => {
    if (!t.terpenuhi) {
      titikKesalahan.push(`Indikator koordinasi tim belum muncul: "${t.poin}".`);
    }
  });

  // 4. KNOWLEDGE (Bobot: 20%)
  const totalKnowledge = checklistKnowledge.length || 1;
  const knowledgeLulus = checklistKnowledge.filter((k) => k.terjawab_benar).length;
  const skorKnowledge = Math.round((knowledgeLulus / totalKnowledge) * 100);
  checklistKnowledge.forEach((k) => {
    if (!k.terjawab_benar) {
      titikKesalahan.push(`Pengetahuan SOP belum dikuasai: "${k.pertanyaan}".`);
    }
  });

  // SKOR TOTAL BERBOBOT
  const skorTotal = Number(
    (
      skorKetepatan * 0.35 +
      skorKebersihan * 0.25 +
      skorTim * 0.20 +
      skorKnowledge * 0.20
    ).toFixed(1)
  );

  // SCALING KE SKALA 5 (1.00 - 5.00)
  const skalaLima = Number(Math.max(1.0, Math.min(5.0, skorTotal / 20)).toFixed(2));

  // GRADE & STATUS
  let grade: 'A' | 'B' | 'C' | 'D' | 'E' = 'C';
  let statusKelulusan: 'Lulus Sempurna' | 'Lulus Bersyarat' | 'Remedial Stasiun' = 'Lulus Bersyarat';

  if (skorTotal >= 90) {
    grade = 'A';
    statusKelulusan = 'Lulus Sempurna';
  } else if (skorTotal >= 80) {
    grade = 'B';
    statusKelulusan = 'Lulus Sempurna';
  } else if (skorTotal >= 70) {
    grade = 'C';
    statusKelulusan = 'Lulus Bersyarat';
  } else if (skorTotal >= 60) {
    grade = 'D';
    statusKelulusan = 'Remedial Stasiun';
  } else {
    grade = 'E';
    statusKelulusan = 'Remedial Stasiun';
  }

  // REKOMENDASI PERBAIKAN OTOMATIS BERDASARKAN KEKURANGAN
  let rekomendasiPerbaikan = 'Pertahankan kinerja prima dan konsistensi kecepatan layanan di cabang gerai.';
  if (titikKesalahan.length > 0) {
    if (skorKetepatan < 75) {
      rekomendasiPerbaikan = `Fokus latihan kecepatan (SOS) dan cek suhu/gramatur menggunakan timbangan digital secara rutin sebelum jam rush hour.`;
    } else if (skorKebersihan < 75) {
      rekomendasiPerbaikan = `Tingkatkan kedisiplinan 5S, pastikan APD terpasang rapi dan area kerja bebas ceceran minyak/darah ayam mentah.`;
    } else if (skorTim < 75) {
      rekomendasiPerbaikan = `Tingkatkan komunikasi vokal (callout) shift antar stasiun dan koordinasi serah terima pesanan ke kasir/geprek.`;
    } else if (skorKnowledge < 75) {
      rekomendasiPerbaikan = `Review kembali buku saku SOP stasiun, batas shelf-life produk matang, dan prinsip food safety HACCP.`;
    } else {
      rekomendasiPerbaikan = `Lakukan penyesuaian pada ${titikKesalahan.length} titik temuan operasional sebelum penugasan shift mandiri.`;
    }
  }

  return {
    deviasiDetik,
    skorKetepatan,
    skorKebersihan,
    skorTim,
    skorKnowledge,
    skorTotal,
    skalaLima,
    grade,
    statusKelulusan,
    titikKesalahan,
    rekomendasiPerbaikan,
  };
}

/**
 * SEED DATA AWAL PENILAIAN ONBOARDING TC
 * Memetakan peserta onboarding TC dengan penilaian komprehensif 4 pilar
 */
export const INITIAL_PENILAIAN_ONBOARDING_TC: PenilaianOnboardingTC[] = [
  {
    id: 'eval-ob-01',
    tanggal: '2026-04-12T09:30:00.000Z',
    peserta_nama: 'Iqbal Muzzaki',
    peserta_outlet: 'Imogiri Barat',
    peserta_divisi: 'Kitchen',
    kategori_peserta: 'Reguler',
    stasiun: 'Station 2',
    task_id: 'd1-st2-goreng-ayam',
    task_nama: 'Penggorengan Ayam Crispy Suhu 160°C & Penirisan 7 Menit',
    durasi_detik: 435, // 07:15 (target 420 = +15 detik)
    target_durasi_detik: 420,
    deviasi_detik: 15,
    suhu_aktual: 161,
    target_suhu: 160,
    gramatur_aktual: 124,
    target_gramatur: 125,
    checklist_langkah_kritis: [
      { langkah: 'Pastikan suhu minyak mencapai tepat 160°C sebelum ayam dimasukkan', terpenuhi: true },
      { langkah: 'Teknik penepungan 2x celup air es & kibas 3x hingga keriting', terpenuhi: true },
      { langkah: 'Masukkan ayam per potong secara perlahan ke keranjang', terpenuhi: true },
      { langkah: 'Guncang keranjang fryer pada menit ke-2', terpenuhi: true },
      { langkah: 'Angkat dan tiriskan di holding tray miring minimal 30 detik', terpenuhi: true },
    ],
    skor_ketepatan: 92,
    checklist_kebersihan: [
      { poin: 'Memakai APD dapur lengkap (celemek, sarung tangan silicon, masker)', terpenuhi: true },
      { poin: 'Pembersihan remah tepung (skimming) di permukaan minyak secara berkala', terpenuhi: true },
      { poin: 'Area lantai sekitar deep fryer kering dari percikan minyak', terpenuhi: true },
      { poin: 'Lap basah dan lap kering dipisahkan dengan kode warna baku', terpenuhi: true },
    ],
    skor_kebersihan: 100,
    checklist_tim: [
      { poin: 'Callout vokal lantang saat drop: "Ayam Crispy 12 Potong Masuk Fryer!"', terpenuhi: true },
      { poin: 'Callout countdown 1 menit sebelum matang', terpenuhi: true },
      { poin: 'Sinkronisasi serah terima (handover) ke stasiun display & kasir', terpenuhi: true },
      { poin: 'Kooperatif saat shift ramai dan siap membagi beban kerja frying', terpenuhi: true },
    ],
    skor_tim: 100,
    checklist_knowledge: [
      { pertanyaan: 'Berapa suhu baku penggorengan ayam krispi HARA Chicken?', terjawab_benar: true, jawaban_peserta: '160 derajat celcius' },
      { pertanyaan: 'Berapa lama standar penirisan minyak ayam sebelum dipindahkan?', terjawab_benar: true, jawaban_peserta: '30 detik di keranjang miring' },
      { pertanyaan: 'Berapa batas shelf-life ayam goreng di holding cabinet display?', terjawab_benar: true, jawaban_peserta: '90 menit maksimal' },
    ],
    skor_knowledge: 100,
    skor_total: 97.2,
    skala_lima: 4.86,
    grade: 'A',
    status_kelulusan: 'Lulus Sempurna',
    titik_kesalahan: [],
    rekomendasi_perbaikan: 'Sangat menguasai stasiun fryer! Siap bertugas mandiri di gerai Imogiri Barat.',
    catatan_trainer: 'Teknik kibas tepung sangat cantik, keriting renyah merata, suhu minyak stabil.',
    trainer_nama: 'Haikal Abi',
    created_at: '2026-04-12T09:30:00.000Z',
  },

  {
    id: 'eval-ob-02',
    tanggal: '2026-04-12T10:15:00.000Z',
    peserta_nama: 'Dhimas Eka Ramadhani',
    peserta_outlet: 'Purworejo',
    peserta_divisi: 'Kitchen',
    kategori_peserta: 'Reguler',
    stasiun: 'Station 2',
    task_id: 'd1-st2-goreng-ayam',
    task_nama: 'Penggorengan Ayam Crispy Suhu 160°C & Penirisan 7 Menit',
    durasi_detik: 470, // 07:50 (target 420 = +50 detik)
    target_durasi_detik: 420,
    deviasi_detik: 50,
    suhu_aktual: 154,
    target_suhu: 160,
    gramatur_aktual: 135,
    target_gramatur: 125,
    checklist_langkah_kritis: [
      { langkah: 'Pastikan suhu minyak mencapai tepat 160°C sebelum ayam dimasukkan', terpenuhi: false },
      { langkah: 'Teknik penepungan 2x celup air es & kibas 3x hingga keriting', terpenuhi: true },
      { langkah: 'Masukkan ayam per potong secara perlahan ke keranjang', terpenuhi: true },
      { langkah: 'Guncang keranjang fryer pada menit ke-2', terpenuhi: true },
      { langkah: 'Angkat dan tiriskan di holding tray miring minimal 30 detik', terpenuhi: false },
    ],
    skor_ketepatan: 68,
    checklist_kebersihan: [
      { poin: 'Memakai APD dapur lengkap (celemek, sarung tangan silicon, masker)', terpenuhi: true },
      { poin: 'Pembersihan remah tepung (skimming) di permukaan minyak secara berkala', terpenuhi: false, catatan: 'Remah tepung menumpuk di dasar fryer' },
      { poin: 'Area lantai sekitar deep fryer kering dari percikan minyak', terpenuhi: true },
      { poin: 'Lap basah dan lap kering dipisahkan dengan kode warna baku', terpenuhi: true },
    ],
    skor_kebersihan: 75,
    checklist_tim: [
      { poin: 'Callout vokal lantang saat drop: "Ayam Crispy 12 Potong Masuk Fryer!"', terpenuhi: false, catatan: 'Lupa callout saat ayam dimasukkan' },
      { poin: 'Callout countdown 1 menit sebelum matang', terpenuhi: true },
      { poin: 'Sinkronisasi serah terima (handover) ke stasiun display & kasir', terpenuhi: true },
      { poin: 'Kooperatif saat shift ramai dan siap membagi beban kerja frying', terpenuhi: true },
    ],
    skor_tim: 75,
    checklist_knowledge: [
      { pertanyaan: 'Berapa suhu baku penggorengan ayam krispi HARA Chicken?', terjawab_benar: true, jawaban_peserta: '160 derajat' },
      { pertanyaan: 'Berapa lama standar penirisan minyak ayam sebelum dipindahkan?', terjawab_benar: false, jawaban_peserta: 'Langsung dipindah setelah angkat' },
      { pertanyaan: 'Berapa batas shelf-life ayam goreng di holding cabinet display?', terjawab_benar: true, jawaban_peserta: '1.5 jam' },
    ],
    skor_knowledge: 67,
    skor_total: 70.9,
    skala_lima: 3.55,
    grade: 'C',
    status_kelulusan: 'Lulus Bersyarat',
    titik_kesalahan: [
      'Durasi pengerjaan terlambat 50 detik dari target standar.',
      'Suhu minyak 154°C belum mencapai standar 160°C saat dropping.',
      'Langkah kritis terlewat: penirisan 30 detik sebelum display.',
      'Poin kebersihan belum terpenuhi: remah tepung belum diskimming.',
      'Lupa callout vokal ke stasiun lain saat ayam masuk.',
    ],
    rekomendasi_perbaikan: 'Fokus pada monitoring suhu fryer analog sebelum drop ayam dan disiplin penirisan 30 detik di outlet Purworejo.',
    catatan_trainer: 'Kru cekatan namun sering terburu-buru sehingga suhu minyak belum siap sudah dimasukkan ayam.',
    trainer_nama: 'Haikal Abi',
    created_at: '2026-04-12T10:15:00.000Z',
  },

  {
    id: 'eval-ob-03',
    tanggal: '2026-04-12T11:00:00.000Z',
    peserta_nama: 'Wanu Azzilina',
    peserta_outlet: 'Wates Bendungan',
    peserta_divisi: 'Kasir',
    kategori_peserta: 'Reguler',
    stasiun: 'Station 4',
    task_id: 'd1-st4-kasir-pos',
    task_nama: 'Transaksi POS Kasir, Greeting Senyum Salam Sapa & Penyajian',
    durasi_detik: 38,
    target_durasi_detik: 40,
    deviasi_detik: -2,
    suhu_aktual: undefined,
    target_suhu: undefined,
    gramatur_aktual: 1,
    target_gramatur: 1,
    checklist_langkah_kritis: [
      { langkah: 'Greeting ramah 3 detik pertama dengan senyum, salam, dan sapa hangat', terpenuhi: true },
      { langkah: 'Input pesanan ke layar POS kasir dengan kecepatan dan akurasi tinggi', terpenuhi: true },
      { langkah: 'Melakukan upselling menu kombo / minuman segar secara natural', terpenuhi: true },
      { langkah: 'Menyebutkan nominal uang yang diterima dan nominal kembalian dengan jelas', terpenuhi: true },
      { langkah: 'Menyerahkan struk kasir dan mengucapkan terima kasih serta doa keberkahan', terpenuhi: true },
    ],
    skor_ketepatan: 100,
    checklist_kebersihan: [
      { poin: 'Penampilan (grooming) rapi, wangi, seragam bersih, hairnet terpasang', terpenuhi: true },
      { poin: 'Area meja register kasir bersih dari struk tercecer atau gelas minuman', terpenuhi: true },
      { poin: 'Pembersihan akrilik pembatas dan mesin EDC dengan desinfektan food-safe', terpenuhi: true },
      { poin: 'Tangan selalu bersih saat menyerahkan makanan pelengkap', terpenuhi: true },
    ],
    skor_kebersihan: 100,
    checklist_tim: [
      { poin: 'Komunikasi cepat ke kitchen saat ada pesanan khusus', terpenuhi: true },
      { poin: 'Membantu rekan stasiun packaging jika counter kasir sedang tidak ada antrean', terpenuhi: true },
      { poin: 'Koordinasi dengan Kepala Outlet jika mendapati keluhan pelanggan', terpenuhi: true },
      { poin: 'Menjaga suasana antrean tetap tertib, nyaman, dan menyenangkan', terpenuhi: true },
    ],
    skor_tim: 100,
    checklist_knowledge: [
      { pertanyaan: 'Sebutkan 5 pilar budaya pelayanan HARA Chicken!', terjawab_benar: true, jawaban_peserta: 'Senyum, Salam, Sapa, Sopan, Santun' },
      { pertanyaan: 'Berapa target standar Speed of Service (SOS) transaksi kasir?', terjawab_benar: true, jawaban_peserta: '40 detik' },
      { pertanyaan: 'Bagaimana penanganan awal kasir jika pelanggan mengeluh pesanan tertukar?', terjawab_benar: true, jawaban_peserta: 'Minta maaf tulus dan segera ganti yang baru' },
    ],
    skor_knowledge: 100,
    skor_total: 100,
    skala_lima: 5.0,
    grade: 'A',
    status_kelulusan: 'Lulus Sempurna',
    titik_kesalahan: [],
    rekomendasi_perbaikan: 'Pertahankan pelayanan ramah dan kecepatan transaksi yang luar biasa.',
    catatan_trainer: 'Kandidat frontliner terbaik di batch ini. Diksi santun, upselling berhasil, dan speed transaksi 38 detik.',
    trainer_nama: 'Haikal Abi',
    created_at: '2026-04-12T11:00:00.000Z',
  },

  {
    id: 'eval-ob-04',
    tanggal: '2026-04-12T11:45:00.000Z',
    peserta_nama: 'Tri Muhammad Atmojo',
    peserta_outlet: 'Sedayu',
    peserta_divisi: 'Geprek',
    kategori_peserta: 'Reguler',
    stasiun: 'Station 3',
    task_id: 'd1-st3-geprek-sambal',
    task_nama: 'Ulek Sambal Bawang Korek, Geprek Ayam & Kemas Box/Paper',
    durasi_detik: 52,
    target_durasi_detik: 45,
    deviasi_detik: 7,
    suhu_aktual: undefined,
    target_suhu: undefined,
    gramatur_aktual: 29, // toleransi 25g ± 3g (29g = lebih)
    target_gramatur: 25,
    checklist_langkah_kritis: [
      { langkah: 'Ambil cabai rawit segar & bawang putih sesuai takaran level', terpenuhi: true },
      { langkah: 'Siram minyak panas mendidih tepat 1 sendok takar khusus (15ml)', terpenuhi: true },
      { langkah: 'Ulek kasar bertekstur (bukan blender halus)', terpenuhi: true },
      { langkah: 'Geprek ayam crispy 2 ketukan mantap agar tidak hancur', terpenuhi: true },
      { langkah: 'Kemas rapi dalam lunch box dengan stiker varian rasa', terpenuhi: false, catatan: 'Lupa menempelkan stiker level kepedasan' },
    ],
    skor_ketepatan: 82,
    checklist_kebersihan: [
      { poin: 'Memakai sarung tangan plastik sekali pakai (disposable gloves)', terpenuhi: true },
      { poin: 'Cobek batu & ulekan dicuci bersih dan dikeringkan secara berkala', terpenuhi: true },
      { poin: 'Meja perakitan packaging bebas ceceran minyak sambal', terpenuhi: false, catatan: 'Ada sedikit cipratan minyak di kertas kemas' },
      { poin: 'Tempat sampah basah pedal tertutup digunakan dengan benar', terpenuhi: true },
    ],
    skor_kebersihan: 75,
    checklist_tim: [
      { poin: 'Merespon tiket pesanan kasir dengan konfirmasi ulang', terpenuhi: true },
      { poin: 'Handover pesanan matang ke meja serah kasir dalam kondisi rapi', terpenuhi: true },
      { poin: 'Memberi peringatan cepat jika stok cabai atau kertas bungkus menipis', terpenuhi: true },
      { poin: 'Saling menyemangati tim saat antrean dine-in & delivery melonjak', terpenuhi: true },
    ],
    skor_tim: 100,
    checklist_knowledge: [
      { pertanyaan: 'Berapa gramasi takaran sambal bawang standar HARA per porsi level 1?', terjawab_benar: true, jawaban_peserta: '25 gram' },
      { pertanyaan: 'Mengapa ulekan sambal tidak boleh dihaluskan seperti bumbu pasta blender?', terjawab_benar: true, jawaban_peserta: 'Agar tekstur cabai renyah dan tidak langu' },
      { pertanyaan: 'Berapa ketukan ideal saat menggeprek ayam crispy agar tidak hancur?', terjawab_benar: true, jawaban_peserta: '2 ketukan mantap' },
    ],
    skor_knowledge: 100,
    skor_total: 87.2,
    skala_lima: 4.36,
    grade: 'B',
    status_kelulusan: 'Lulus Sempurna',
    titik_kesalahan: [
      'Gramatur sambal sedikit berlebih (29g vs standar 25g).',
      'Lupa menempelkan stiker level kepedasan pada kemasan.',
      'Meja perakitan ada cipratan minyak sambal.',
    ],
    rekomendasi_perbaikan: 'Gunakan sendok takar cabai dengan lebih presisi agar gramatur 25g stabil dan jaga kebersihan meja geprek.',
    catatan_trainer: 'Aroma sambal sedap, ketukan ulek pas tidak hancur lebur.',
    trainer_nama: 'Haikal Abi',
    created_at: '2026-04-12T11:45:00.000Z',
  },

  {
    id: 'eval-ob-05',
    tanggal: '2026-04-12T13:30:00.000Z',
    peserta_nama: 'Ryan Candra Kusuma (New)',
    peserta_outlet: 'Godean Munggur',
    peserta_divisi: 'Kitchen',
    kategori_peserta: 'New',
    stasiun: 'Station 1',
    task_id: 'd1-st1-nasi',
    task_nama: 'Tanak Nasi 4 Cup & Marinasi Daging Ayam 5kg',
    durasi_detik: 2520, // 42 menit (target 2100 = 35 menit, +7 menit)
    target_durasi_detik: 2100,
    deviasi_detik: 420,
    suhu_aktual: undefined,
    target_suhu: undefined,
    gramatur_aktual: 145, // target 120g (+25g)
    target_gramatur: 120,
    checklist_langkah_kritis: [
      { langkah: 'Cuci beras Miyako minimal 3 kali bilas hingga air bilasan jernih', terpenuhi: true },
      { langkah: 'Rasio air tepat: 4 cup beras : 5 cup air bersih', terpenuhi: false, catatan: 'Air sedikit berlebih sehingga nasi agak lembek' },
      { langkah: 'Kunci pengaman tombol cook gas ditekan sempurna sampai api biru menyala', terpenuhi: true },
      { langkah: 'Diamkan (resting) 15 menit setelah tombol naik sebelum disajikan', terpenuhi: false, catatan: 'Langsung dibuka dan diaduk sebelum 15 menit' },
      { langkah: 'Marinasi daging ayam merata dengan takaran bumbu baku tanpa air berlebih', terpenuhi: true },
    ],
    skor_ketepatan: 58,
    checklist_kebersihan: [
      { poin: 'Memakai APD dapur lengkap (celemek bersih, hairnet rapi, sarung tangan)', terpenuhi: true },
      { poin: 'Meja stainless cuci & marinasi bersih dari tetesan darah ayam mentah', terpenuhi: false, catatan: 'Wadah ayam mentah diletakkan dekat beras bersih' },
      { poin: 'Pemisahan wadah bahan mentah (raw) dan bahan matang (zero cross-contamination)', terpenuhi: false },
      { poin: 'Pengelolaan limbah: sisa air beras dan kemasan bumbu langsung dibuang', terpenuhi: true },
    ],
    skor_kebersihan: 50,
    checklist_tim: [
      { poin: 'Memberikan callout konfirmasi saat menanak: "Nasi Masuk Rice Cooker Gas!"', terpenuhi: false },
      { poin: 'Koordinasi ke stasiun kasir & geprek mengenai estimasi stok nasi siap saji', terpenuhi: false },
      { poin: 'Membantu rekan stasiun 2 (fryer) mengambil wadah ayam jika sedang kosong', terpenuhi: true },
      { poin: 'Merespon cepat instruksi trainer atau kepala gerai dengan sikap positif', terpenuhi: true },
    ],
    skor_tim: 50,
    checklist_knowledge: [
      { pertanyaan: 'Berapa rasio takaran baku antara cup beras Miyako dan air?', terjawab_benar: false, jawaban_peserta: '1 banding 2' },
      { pertanyaan: 'Berapa lama waktu resting (diamkan) nasi setelah tombol cook naik?', terjawab_benar: false, jawaban_peserta: '5 menit' },
      { pertanyaan: 'Bagaimana cara mencegah kontaminasi silang bakteri Salmonella pada ayam mentah?', terjawab_benar: true, jawaban_peserta: 'Cuci tangan dan jangan campur wadah' },
    ],
    skor_knowledge: 33,
    skor_total: 49.4,
    skala_lima: 2.47,
    grade: 'E',
    status_kelulusan: 'Remedial Stasiun',
    titik_kesalahan: [
      'Durasi terlambat 7 menit dari target pengerjaan.',
      'Rasio air berlebih (nasi terlalu lembek) dan tidak resting 15 menit.',
      'Gramatur nasi 145g (melebihi porsi standar 120g).',
      'Pelanggaran sanitasi: wadah ayam mentah diletakkan dekat beras cuci.',
      'Tidak ada callout koordinasi waktu matang ke kasir.',
      'Belum hafal rasio air beras dan durasi resting pada tes lisan.',
    ],
    rekomendasi_perbaikan: 'Wajib mengulang (remedial) Station 1 di Training Center selama 2 hari sebelum dikirim ke gerai Godean Munggur.',
    catatan_trainer: 'Kru baru (New), masih gugup dan belum terbiasa dengan ritme dapur komersial. Butuh bimbingan intensif 1-on-1.',
    trainer_nama: 'Haikal Abi',
    created_at: '2026-04-12T13:30:00.000Z',
  },
];
