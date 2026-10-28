export type Division = 'Kitchen' | 'Kasir' | 'Geprek' | 'Helper';
export type StatusAktif = 'Aktif' | 'Nonaktif';
export type Prioritas = 'Tinggi' | 'Sedang' | 'Rendah';
export type StatusTNA = 'Belum' | 'Proses' | 'Selesai';
export type StatusTraining = 'Direncanakan' | 'Berjalan' | 'Selesai' | 'Dibatalkan';
export type StatusKeluhan = 'Dalam kajian' | 'Selesai' | 'Eskalasi';
export type UserRole = 'Admin' | 'Trainer' | 'RnD' | 'Area Supervisor' | 'Kepala Outlet' | 'SPV Rekrutmen' | 'Kru / Trainee';
export type CompetencyBadge = 'Mahir' | 'Terampil' | 'Pemula' | 'Belum Ada Data';

export interface HaraCultureValueItem {
  key: 'H' | 'A1' | 'R' | 'A2';
  name: 'Halal' | 'Amanah' | 'Responsif' | 'Adaptif';
  tagline: string;
  description: string;
  behaviors: string[];
}

export interface HaraAttitudeScore {
  halal_score: number; // 0 - 100
  amanah_score: number; // 0 - 100
  responsif_score: number; // 0 - 100
  adaptif_score: number; // 0 - 100
  total_attitude_score: number; // 0 - 100
}

export interface CrewRadarData {
  nama_kru: string;
  divisi: Division;
  kode_outlet: string;
  teori_sop: number; // Bobot 25%
  praktik_jobdesk: number; // Bobot 35%
  sikap_hara: number; // Bobot 25%
  ketahanan_rush: number; // Bobot 15%
  kecepatan_sos?: number;
  skor_komposit: number;
  status_kelulusan: 'Kompeten Mandiri' | 'Butuh Pendampingan' | 'Remedial Kritis';
}

export interface RushHourAnalysis {
  shift_name: string;
  jam_operasional: string;
  tingkat_deviasi_pct: number;
  kecepatan_sos_detik: number;
  stasiun_terdampak: Division;
  catatan_lapangan: string;
}

export interface Outlet {
  id: string;
  nama_outlet: string;
  kode_outlet: string;
  alamat: string;
  kepala_outlet: string;
  area_supervisor: string;
  status_aktif: StatusAktif;
  created_at: string;
}

export interface Kru {
  id: string;
  nama_kru: string;
  jabatan?: string;
  divisi: Division;
  kode_outlet: string;
  tanggal_masuk: string;
  status_aktif: StatusAktif;
  catatan?: string;
  created_at: string;
}

export interface TNA {
  id: string;
  tanggal: string;
  kode_outlet: string;
  divisi: Division;
  sumber_temuan: string;
  deskripsi_gap: string;
  jenis_gap: 'Pengetahuan' | 'Keterampilan' | 'Sikap/Konsistensi';
  prioritas: Prioritas;
  rencana_tindak_lanjut: string;
  status: StatusTNA;
  created_at: string;
}

export interface RencanaTraining {
  id: string;
  kode_outlet: string;
  topik: string;
  tujuan_pembelajaran: string;
  peserta: string;
  metode: string;
  durasi: string;
  alat_bantu: string;
  fasilitator: string;
  tanggal_pelaksanaan: string;
  status: StatusTraining;
  created_at: string;
}

export interface ObservasiLapangan {
  id: string;
  tanggal_shift: string;
  kode_outlet: string;
  nama_kru: string;
  divisi: Division;
  standar_sop_diamati: string;
  hasil: 'Sesuai Standar' | 'Perlu Perbaikan' | 'Kritis';
  catatan_detail: string;
  rencana_follow_up: string;
  created_at: string;
}

export interface CoachingLog {
  id: string;
  tanggal: string;
  kode_outlet: string;
  nama_kru: string;
  goal: string;
  reality: string;
  options: string;
  will: string;
  hasil_follow_up?: string;
  created_at: string;
}

export interface GapAnalysis {
  id: string;
  nama_kru: string;
  divisi: Division;
  kode_outlet: string;
  kompetensi_dinilai: string;
  skor_standar: number;
  skor_aktual: number;
  gap_score: number;
  rekomendasi: string;
  created_at: string;
}

export interface KartuKeluhan {
  id: string;
  tanggal_shift: string;
  kode_outlet: string;
  tipe: 'Produk/Rasa' | 'Pelayanan/Kasir' | 'Kebersihan' | 'Kecepatan' | 'Lainnya';
  deskripsi_keluhan: string;
  nama_kru_terkait?: string;
  tindakan_diambil: string;
  status: StatusKeluhan;
  tindak_lanjut_training?: string;
  created_at: string;
}

export interface TalentTracker {
  id: string;
  nama_kandidat: string;
  divisi: Division;
  kode_outlet: string;
  target_posisi: string;
  tanggung_jawab_uji_coba: string;
  progres_terkini: string;
  target_waktu_siap: string;
  created_at: string;
}

export interface BankSOP {
  id: string;
  kode_sop?: string;
  kategori: string;
  divisi?: Division;
  judul_sop: string;
  tujuan?: string;
  langkah: string[];
  poin_kritis?: string;
  standar_waktu?: string;
  alat_bahan?: string;
  sumber: string;
  status_aktif: StatusAktif;
  created_at: string;
}

export interface BankSoal {
  id: string;
  topik: string;
  divisi: Division;
  pertanyaan: string;
  opsi_a: string;
  opsi_b: string;
  opsi_c: string;
  opsi_d: string;
  jawaban_benar: 'A' | 'B' | 'C' | 'D';
  tingkat_kesulitan?: 'Mudah' | 'Sedang' | 'Sulit';
  bobot: number;
  kode_sop?: string;
  referensi_sop?: string;
  pembahasan?: string;
  status_aktif: StatusAktif;
  created_at: string;
}

export interface PenilaianTeori {
  id: string;
  tanggal: string;
  nama_kru: string;
  topik: string;
  jumlah_benar: number;
  total_soal: number;
  skor: number;
  catatan?: string;
  created_at: string;
}

export interface PenilaianPraktik {
  id: string;
  tanggal: string;
  nama_kru: string;
  kru_id?: string;
  kode_outlet?: string;
  sop_terkait: string;
  detail_skor_langkah: number[];
  waktu_detik?: number;
  target_detik?: number;
  suhu_minyak?: number;
  gramatur?: number;
  skor_akhir: number;
  catatan?: string;
  created_at: string;
}

export interface PenilaianOnboardingTC {
  id: string;
  tanggal: string;
  peserta_nama: string;
  peserta_outlet: string;
  peserta_divisi: Division;
  kategori_peserta: 'New' | 'Reguler';
  stasiun: 'Station 1' | 'Station 2' | 'Station 3' | 'Station 4' | 'General';
  task_id: string;
  task_nama: string;

  // 1. KETEPATAN (Stopwatch Durasi SOS, Suhu, Gramatur, Verifikasi Langkah SOP)
  durasi_detik: number;
  target_durasi_detik: number;
  deviasi_detik: number; // durasi_detik - target_durasi_detik (positif = terlambat, negatif = lebih cepat)
  suhu_aktual?: number;
  target_suhu?: number;
  gramatur_aktual?: number;
  target_gramatur?: number;
  checklist_langkah_kritis: { langkah: string; terpenuhi: boolean; catatan?: string }[];
  skor_ketepatan: number; // 0 - 100

  // 2. KEBERSIHAN (5S & Food Safety / Sanitasi Meja & APD)
  checklist_kebersihan: { poin: string; terpenuhi: boolean; catatan?: string }[];
  skor_kebersihan: number; // 0 - 100

  // 3. KERJA SAMA TIM (Kitchen Callout, Handover, Saling Support)
  checklist_tim: { poin: string; terpenuhi: boolean; catatan?: string }[];
  skor_tim: number; // 0 - 100

  // 4. KNOWLEDGE (Kuis Pemahaman SOP, HACCP, Titik Kritis)
  checklist_knowledge: { pertanyaan: string; terjawab_benar: boolean; jawaban_peserta?: string }[];
  skor_knowledge: number; // 0 - 100

  // SKOR AKHIR & SCALING SISTEM (Hasil Skala Baku)
  skor_total: number; // 0 - 100 (Ketepatan 35%, Kebersihan 25%, Tim 20%, Knowledge 20%)
  skala_lima: number; // 1.00 - 5.00
  grade: 'A' | 'B' | 'C' | 'D' | 'E';
  status_kelulusan: 'Lulus Sempurna' | 'Lulus Bersyarat' | 'Remedial Stasiun';

  // DETAIL TITIK KESALAHAN & REKOMENDASI PERBAIKAN
  titik_kesalahan: string[];
  rekomendasi_perbaikan: string;
  catatan_trainer: string;
  trainer_nama: string;
  created_at: string;
}


export interface PenilaianLisan {
  id: string;
  tanggal: string;
  nama_kru: string;
  sop_terkait: string;
  butir_benar: number;
  total_butir: number;
  skor: number;
  catatan?: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  kode_outlet?: string;
  status_aktif: StatusAktif;
  created_at: string;
}

export interface LogAktivitas {
  id: string;
  user_nama: string;
  aksi: 'TAMBAH' | 'UBAH' | 'HAPUS';
  tabel: string;
  detail: string;
  created_at: string;
}

export interface SystemSettings {
  id?: string;
  email_penerima: string;
  notif_prioritas_tinggi: string;
  ambang_pola_berulang: number;
  hari_pola_berulang: number;
  nama_perusahaan: string;
  lead_trainer: string;
  jabatan_lead_trainer?: string;
  nik_trainer?: string;
  alamat_kantor?: string;
  telepon_kantor?: string;
  bobot_teori?: number;
  bobot_praktik?: number;
  bobot_lisan?: number;
  passing_grade_lulus?: number;
  passing_grade_mahir?: number;
  inactivity_timeout_minutes?: number;
  supervisor_security_pin?: string;
  enforce_pin_on_critical_actions?: boolean;
  google_sheets_webhook_url?: string;
}

export interface HaraChecklistItem {
  id: string;
  pilar: 'H' | 'A1' | 'R' | 'A2';
  pilarName: string;
  kriteria: string;
  kode_sop: string;
  metode_verifikasi: string;
  terpenuhi: boolean;
}

export interface AuditAttitudeHara {
  id: string;
  tanggal: string;
  nama_kru: string;
  kode_outlet: string;
  evaluator_nama: string;
  skor_h_higienis: number;    // Halal & Higienis: APD, Sanitasi, HACCP, Bahan Halal (Bobot 25%)
  skor_a_antusias: number;    // Responsif: Kecepatan Layanan, Tanggap Jam Sibuk (Bobot 25%)
  skor_r_resik: number;       // Resik & Kerapian: Clean As You Go, Zero Waste (Bobot 25%)
  skor_a_amanah: number;      // Amanah & Akurasi: Gramasi, Kasir POS Rp 0, Kejujuran Log (Bobot 25%)
  skor_rata_rata: number;     // Rata-rata 4 Pilar Visi-Misi H.A.R.A (0 - 100)
  checklist_items?: HaraChecklistItem[];
  catatan_perilaku: string;
  rekomendasi_coaching?: string;
  bukti_audit?: string;
  created_at: string;
}

export interface CrewCompetencySummary {
  namaKru: string;
  divisi: Division;
  kode_outlet: string;
  skorTeori: number | null;
  skorPraktik: number | null;
  skorLisan: number | null;
  skorAudit: number | null;
  skorAkhir: number | null;
  badge: CompetencyBadge;
  statusKelulusan?: 'LULUS' | 'BELUM LULUS';
  riwayatTeoriCount: number;
  riwayatPraktikCount: number;
  riwayatLisanCount: number;
  riwayatAuditCount: number;
  riwayatCoachingCount: number;
  zScore?: number;
  percentileRank?: number;
  // 3-Pillar KSA Framework (Knowledge 30%, Skill 45%, Attitude/Visi-Misi H.A.R.A 25%)
  skorKnowledge?: number | null;
  skorSkill?: number | null;
  skorAttitude?: number | null;
  breakdownKSA?: {
    knowledge: number;
    skill: number;
    attitude: number;
    rumus: string;
  };
  attitudeHaraDetail?: {
    h_higienis: number;
    a_antusias: number;
    r_resik: number;
    a_amanah: number;
    checklist_total?: number;
    checklist_terpenuhi?: number;
  };
  // 8-Axis 360° Data Science Matrix
  radar360Axes?: {
    axis: string;
    score: number;
    benchmark: number;
    category: 'Knowledge' | 'Skill' | 'Attitude / Visi Misi';
  }[];
}

export type TipePenugasan =
  | 'Perbantuan Operasional'
  | 'Pendampingan & OJT'
  | 'Standarisasi & Audit SOP'
  | 'Opening Outlet Baru'
  | 'Penyelesaian Gap Kritis';

export type StatusPenugasan = 'Direncanakan' | 'Berjalan' | 'Selesai' | 'Dibatalkan';

export type ShiftTugas = 'Shift Pagi' | 'Shift Siang/Malam' | 'Full Day / Double Shift' | 'Fleksibel';

export interface PenugasanTrainer {
  id: string;
  nomor_surat_tugas: string;
  trainer_nama: string;
  trainer_kontak?: string;
  kode_outlet: string;
  tipe_penugasan: TipePenugasan;
  fokus_divisi: Division | 'Semua Divisi';
  shift_kerja: ShiftTugas;
  tanggal_mulai: string;
  tanggal_selesai: string;
  tujuan_tugas: string;
  daftar_kru_didampingi?: string;
  target_output: string;
  status: StatusPenugasan;
  laporan_kegiatan?: string;
  rekomendasi_outlet?: string;
  skor_evaluasi_outlet?: number;
  catatan_kepala_outlet?: string;
  created_at: string;
}

export type StatusOJT = 'Sedang Berjalan' | 'Lulus / Mandiri' | 'Perlu Pendampingan Lanjut';
export type TipeBimbingan = 'Pendampingan OJT Kru Baru' | 'Perbantuan Operasional' | 'Retraining Gap SOP' | 'Peningkatan Level';

export interface TraineeRecord {
  id: string;
  penugasan_id?: string;
  kode_outlet: string;
  trainer_nama: string;
  nama_kru: string;
  jabatan?: string;
  divisi: Division;
  tipe_bimbingan: TipeBimbingan;
  sop_fokus: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  skor_awal?: number;
  skor_akhir?: number;
  skor_teori?: number;
  skor_praktik?: number;
  skor_attitude?: number;
  skor_ketahanan?: number;
  skor_behavior_change?: number;
  level_kirkpatrick?: {
    l1_reaksi: number;
    l2_kognitif: number;
    l3_perilaku: number;
    l4_dampak: number;
  };
  catatan_kekuatan?: string;
  catatan_kelemahan?: string;
  catatan_action_plan?: string;
  status_ojt: StatusOJT;
  catatan_trainer: string;
  alasan_diagnostik?: string[];
  bukti_observasi?: string;
  akar_masalah?: string;
  alasan_kelulusan?: string;
  detail_rubrik?: {
    kategori: string;
    kriteria: string;
    level: string;
    skor: number;
    alasan: string;
    bukti: string;
  }[];
  created_at: string;
}

export interface LaporanTrainerOutlet {
  id: string;
  nomor_laporan: string;
  kode_outlet: string;
  trainer_nama: string;
  periode_awal: string;
  periode_akhir: string;
  jenis_kegiatan: string;
  total_trainee: number;
  ringkasan_perbantuan: string;
  daftar_trainee: {
    nama_kru: string;
    jabatan?: string;
    divisi: Division;
    sop_fokus: string;
    skor_akhir?: number;
    skor_teori?: number;
    skor_praktik?: number;
    skor_attitude?: number;
    skor_ketahanan?: number;
    skor_behavior_change?: number;
    status_ojt: StatusOJT;
    catatan: string;
    alasan_diagnostik?: string[];
    bukti_observasi?: string;
    akar_masalah?: string;
    alasan_kelulusan?: string;
  }[];
  kendala_outlet: string;
  rekomendasi_kepala_outlet: string;
  skor_rata_rata?: number;
  status: 'Draft' | 'Final' | 'Disetujui Trainer Operasional' | 'Disetujui Lead Trainer';
  created_at: string;
}

export type JobdeskFrequency = 'H' | 'M' | 'B' | 'K' | 'S' | 'T';

export interface JobdeskTaskItem {
  id: number;
  tugas: string;
  frekuensi: JobdeskFrequency[];
  kategori: string;
  output_standar: string;
  indikator_objektif: string;
  targetNav?: string;
}

export interface JobdeskAuditLog {
  id: string;
  taskId: number;
  tanggal: string;
  status: 'Selesai' | 'Dalam Proses' | 'Terjadwal' | 'Tertunda';
  catatan: string;
  buktiDokumen?: string;
}

// ==========================================
// ROADMAP & KURIKULUM KRU ONBOARDING (30-60-90 HARI)
// ==========================================
export type OnboardingPhase = 'fase_1_30' | 'fase_2_60' | 'fase_3_90';
export type OnboardingItemStatus = 'pending' | 'verified' | 'needs_review';

export type TrainingMethodKey =
  | 'hybrid_twi_spaced'    // Metode Ter-Baik (World Gold Standard: TWI 4-Step + Spaced Deliberate Practice)
  | 'buddy_apprenticeship' // Metode 2: Accelerated Apprenticeship & Dual Buddy Shadowing (1-on-1 OJT)
  | 'agile_gamified_sprints' // Metode 3: Agile Micro-Sprint & Gamified Station Badges
  | 'flipped_retrieval'    // Metode 4: Flipped Station & Cognitive Retrieval Drill
  | 'tqm_haccp_zerodefect'; // Metode 5: Total Quality Management & Six-Sigma HACCP Zero-Defect

export interface OnboardingChecklistItem {
  id: string;
  phase: OnboardingPhase;
  week: number; // 1 to 12
  divisi: Division | 'Semua';
  kategori: 'Hygiene & K3' | 'Food Safety' | 'Station Core' | 'Speed & Service' | 'Problem Solving' | 'Maintenance';
  title: string;
  description: string;
  sopRef?: string;
  criticalPoints: string[];
  langkahDetail?: string[];
  haccpControl?: string;
  alasanKunci?: string;
  kriteriaVerifikasi: string;
  metodeTraining: 'Demonstrasi 4-Langkah' | 'Simulasi / Roleplay' | 'Praktik Terbimbing' | 'Observasi Mandiri';
  opsiMetodePelaksanaan?: Record<TrainingMethodKey, string>;
}

export interface CrewOnboardingProgress {
  id: string;
  kru_id: string;
  nama_kru: string;
  kode_outlet: string;
  divisi: Division;
  tanggal_mulai: string;
  trainer_nama: string;
  target_selesai: string;
  current_phase: OnboardingPhase;
  selected_method?: TrainingMethodKey;
  status: 'Aktif Onboarding' | 'Lulus Mandiri' | 'Remedial' | 'Ditunda';
  completed_items: {
    itemId: string;
    completedAt: string;
    verifiedBy: string;
    notes?: string;
    score?: number;
    methodUsed?: TrainingMethodKey;
  }[];
  notes_weekly: {
    week: number;
    tanggal: string;
    catatan: string;
    trainer: string;
  }[];
  signoffs: {
    fase_1?: {
      signedAt: string;
      trainerName: string;
      kepalaOutlet: string;
      status: 'Lulus' | 'Remedial';
      skorTeori?: number;
      skorPraktik?: number;
      catatan?: string;
    };
    fase_2?: {
      signedAt: string;
      trainerName: string;
      kepalaOutlet: string;
      status: 'Lulus' | 'Remedial';
      skorLisan?: number;
      speedOfServiceSec?: number;
      catatan?: string;
    };
    fase_3?: {
      signedAt: string;
      trainerName: string;
      kepalaOutlet: string;
      status: 'Lulus' | 'Remedial';
      evaluasiKomprehensif?: number;
      catatan?: string;
    };
  };
  created_at: string;
}

// ==========================================
// OFFICIAL 10-PAGE RAPOR KINERJA OUTLET HARA
// ==========================================

export interface AuditChecklistItem {
  id: string;
  nomor: number;
  pernyataan: string;
  terpenuhi: boolean;
  skor_maks?: number;
  skor_didapat?: number;
  catatan?: string;
}

export interface AuditSubCategory {
  kode: string; // e.g., 'A', 'B', 'C'
  nama: string;
  total_butir: number;
  terpenuhi_butir: number;
  persentase: number;
  catatan_temuan?: string;
  items: AuditChecklistItem[];
}

export interface AuditPilarData {
  pilar_nama: string;
  bobot_maks: number; // e.g. 25, 20, 20, 20, 15
  skor_didapat: number;
  capaian_persen: number;
  kategori_mutu: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang' | 'Kritis';
  sub_kategori: AuditSubCategory[];
}

export interface PlatformRatingDetail {
  platform: 'GoFood' | 'GrabFood' | 'ShopeeFood' | 'Google Maps';
  rating: number; // e.g. 4.8
  total_ulasan: number;
  trend: 'up' | 'stable' | 'down';
  ulasan_positif_pct: number;
}

export interface RekapKomplainDetail {
  kategori_keluhan: 'Ringan' | 'Sedang' | 'Berat';
  jumlah_kasus: number;
  terselesaikan_kasus: number;
  rata_waktu_solusi_menit: number;
  contoh_kasus_terakhir: string;
  tindakan_koreksi: string;
}

export interface OfficialAuditReport {
  id: string;
  nomor_dokumen: string; // e.g. 'RKO-HARA/2026/08/BTL-01'
  kode_outlet: string;
  nama_outlet: string;
  alamat_outlet: string;
  kepala_outlet: string;
  area_supervisor: string;
  auditor_lead: string;
  auditor_pendamping?: string;
  periode_audit: string; // e.g. 'Agustus 2026'
  tanggal_audit: string;
  
  // Executive Summary Scoring
  nilai_akhir_komposit: number; // Max 100
  grade_mutu: 'A (Sangat Baik)' | 'B (Baik)' | 'C (Cukup)' | 'D (Perlu Pendampingan Kritis)';
  ranking_gerai: number; // e.g. 9
  total_gerai_komparasi: number; // e.g. 66
  trend_poin_bulan_lalu: number; // e.g. +3.5
  status_audit: 'LULUS STANDAR QSR' | 'DALAM MONITORING KETAT' | 'REMEDIAL SISTEMIK';

  // 5 Pillars
  pilar_service: AuditPilarData; // Bobot 25
  pilar_kualitas: AuditPilarData; // Bobot 20
  pilar_kebersihan: AuditPilarData; // Bobot 20
  pilar_leadership: AuditPilarData; // Bobot 20
  
  // CS & Rating Platform (Bobot 15)
  kepuasan_pelanggan: {
    skor_bobot_didapat: number; // max 15
    capaian_persen: number;
    platform_ratings: PlatformRatingDetail[];
    rekap_komplain: RekapKomplainDetail[];
    catatan_cs: string;
  };

  // Legalitas & Catatan Akhir
  ringkasan_eksekutif: string;
  kekuatan_utama: string[];
  area_peningkatan_kritis: string[];
  rekomendasi_tindakan: string[];
  tanggal_pengesahan: string;
  tanda_tangan: {
    auditor: string;
    auditor_jabatan: string;
    store_manager: string;
    area_manager: string;
  };
}

// ==========================================
// RAPOR KOMPETENSI KRU RESMI
// ==========================================

export interface StationCompetencyDetail {
  stasiun: Division;
  skor_sop: number; // 0 - 100
  skor_speed: number; // 0 - 100
  skor_hygiene: number; // 0 - 100
  skor_sikap: number; // 0 - 100
  skor_akhir_stasiun: number;
  status_kompetensi: 'Mahir Solo Shift' | 'Kompeten Terbimbing' | 'Belum Kompeten';
  catatan_stasiun: string;
}

export interface OfficialRaporKru {
  id: string;
  nomor_rapor: string; // e.g. 'RPK-HARA/2026/08/KRU-014'
  nama_kru: string;
  nik_kru: string;
  divisi_utama: Division;
  jabatan: string;
  kode_outlet: string;
  nama_outlet: string;
  tanggal_bergabung: string;
  periode_evaluasi: string;
  tanggal_terbit: string;
  
  nilai_akhir_komprehensif: number; // Max 100
  predikat_kelulusan:
    | 'A+ (Talenta Unggul)'
    | 'A (Mahir Mandiri)'
    | 'B (Terampil Berkembang)'
    | 'C (Butuh Pembinaan)'
    | 'Grade A (Mahir)'
    | 'Grade B (Kompeten)'
    | 'Grade C (Pembinaan)'
    | 'Remedial';
  peringkat_cabang: number; // e.g. 2
  total_kru_cabang: number; // e.g. 18
  status_sertifikasi: 'Tersertifikasi Penuh' | 'Sertifikasi Bersyarat' | 'Belum Lulus';

  // 4 Core Competency Dimensions
  skor_teori_sop: number; // 15%
  skor_lisan_haccp?: number; // 15%
  skor_knowledge_terpadu?: number; // 30% = (Teori 15% + Lisan HACCP 15%)
  skor_praktik_lapangan: number; // 35%
  skor_speed_rush_hour: number; // 10%
  skor_sikap_budaya_hara: number; // 25% (Halal & Higienis, Amanah, Responsif, Adaptif)

  // Multi-Station Breakdown
  evaluasi_stasiun: StationCompetencyDetail[];

  // Detailed Step-by-Step SOP Audit (Per Langkah Kerja)
  sop_step_audit?: {
    sop_code: string;
    judul: string;
    langkah_no: number;
    instruksi: string;
    status: '100% Sesuai SOP' | 'Ada Koreksi' | 'Deviasi Kritis';
    catatan: string;
  }[];

  // Objective Visi-Misi H.A.R.A Compliance Audit
  attitude_hara_audit?: {
    pilar: 'H' | 'A1' | 'R' | 'A2';
    judul: string;
    kriteria: string;
    kode_sop: string;
    terpenuhi: boolean;
  }[];

  // Feedback & Development Plan
  aspek_unggul: string[];
  rekomendasi_pengembangan: string[];
  jenjang_karir_rekomendasi: 'Senior Station Specialist' | 'Shift Leader Trainee' | 'Tetap di Posisi Saat Ini' | 'Retraining Wajib';

  trainer_penilai: string;
  kepala_outlet: string;
}

// ==========================================
// LAPORAN PERTANGGUNGJAWABAN TRAINER KE ATASAN (KEUANGAN & REKOMENDASI)
// ==========================================

export interface FinancialEfficiencyAudit {
  item: string;
  kondisi_sebelum: string;
  tindakan_trainer: string;
  kondisi_setelah: string;
  penghematan_bulanan_est_rp: number;
  keterangan: string;
}

export interface LaporanTrainerKeuanganAtasan {
  id: string;
  nomor_laporan: string;
  trainer_nama: string;
  jabatan_trainer: string;
  penerima_laporan: string; // e.g. 'Direktur Operasional / Owner'
  kode_outlet: string;
  nama_outlet: string;
  periode_penugasan: string;
  tanggal_penyusunan: string;
  
  // Bagian 1: Intervensi yang SUDAH Dilakukan
  tindakan_dilakukan: {
    kategori: 'Coaching & OJT' | 'Kalibrasi Mesin & Alat' | 'Perampingan Alur Kerja' | 'Audit Bahan & FIFO';
    rincian: string;
    hasil_langsung: string;
    tanggal_eksekusi: string;
  }[];

  // Bagian 2: Analisis Keuangan & Efisiensi Bahan Baku
  efisiensi_finansial: FinancialEfficiencyAudit[];
  total_potensi_efisiensi_rp: number;
  audit_food_waste: {
    sisa_tepung_terbuang_kg: { sebelum: number; sesudah: number };
    oil_turnover_days: { sebelum: number; sesudah: number };
    ayam_loss_potong: { sebelum: number; sesudah: number };
    rupiah_waste_terselamatkan: number;
  };

  // Bagian 3: Rekomendasi Strategis untuk Atasan
  rekomendasi_manajemen: {
    prioritas: 'Mendesak (P1)' | 'Penting (P2)' | 'Rencana Jangka Menengah (P3)';
    bidang: 'Pengadaan/Peremajaan Alat' | 'Manpower & Shift' | 'Promosi/Mutasi SDM' | 'Fasilitas & Gedung';
    usulan_solusi: string;
    estimasi_biaya_rp?: number;
    dampak_terhadap_omset_ops: string;
  }[];

  catatan_penutup_trainer: string;
  status_laporan: 'Draft' | 'Diajukan ke Atasan' | 'Disetujui Manajemen HQ' | 'Dalam Proses Tindak Lanjut';
}

// ==========================================
// MONITORING KRU TRAINING & OJT 30 HARI
// ==========================================

export type GateEvaluationStage = 'GATE_1_DAY_7' | 'GATE_2_DAY_14' | 'GATE_3_DAY_21' | 'GATE_4_DAY_30';
export type GateEvaluationStatus = 'LULUS_MANDIRI' | 'LULUS_BERSYARAT' | 'REMEDIAL_TERBIMBING' | 'BELUM_EVALUASI';

export interface GateEvaluationRecord {
  id: string;
  kru_id: string;
  nama_kru: string;
  kode_outlet: string;
  gate_stage: GateEvaluationStage;
  hari_ke: number;
  tanggal_evaluasi: string;
  evaluator_nama: string;
  evaluator_role: UserRole;
  skor_teori: number; // 0 - 100
  skor_praktik: number; // 0 - 100
  skor_kepatuhan_sop: number; // 0 - 100
  skor_budaya_hara: number; // 0 - 100
  skor_akhir: number; // 0 - 100
  status: GateEvaluationStatus;
  deviasi_kritis_ditemukan: string[];
  catatan_evaluasi: string;
  tindakan_remedial?: string;
  tanda_tangan_evaluator?: boolean;
}

export interface OJTDailyTask {
  hari_ke: number;
  minggu_ke: 1 | 2 | 3 | 4;
  modul_nama: string;
  fokus_stasiun: Division;
  poin_checklist: {
    id: string;
    deskripsi: string;
    referensi_sop: string;
    is_kritis: boolean;
    selesai: boolean;
    diverifikasi_oleh?: string;
  }[];
  catatan_harian?: string;
  status: 'Belum Dimulai' | 'Sedang Berjalan' | 'Selesai Diverifikasi';
}

export interface OJTCrewMonitoringRecord {
  id: string;
  kru_id: string;
  nama_kru: string;
  kode_outlet: string;
  nama_outlet: string;
  divisi: Division;
  tanggal_mulai: string;
  target_kelulusan: string;
  hari_berjalan: number; // 1 - 30
  minggu_aktif: 1 | 2 | 3 | 4;
  status_keseluruhan: 'On-Track' | 'Butuh Pendampingan' | 'Kritis / Remedial' | 'Lulus Bersertifikat';
  progres_persen: number; // 0 - 100
  mentor_nama: string;
  skor_komposit_ojt?: number; // 0 - 100
  breakdown_skor?: {
    skor_harian: number; // Bobot 25% (Rasio checklist tugas harian)
    skor_gates: number;  // Bobot 40% (Rata-rata Gate Evaluation H7, H14, H21, H30)
    skor_teori: number;  // Bobot 20% (Ujian teori SOP 25 butir)
    skor_sikap: number;  // Bobot 15% (Disiplin, absensi, budaya H.A.R.A)
    rumus_kalkulasi: string;
  };
  catatan_remedial_aktif?: string;
  checked_days?: Record<number, boolean>; // Days 1 to 30 verification status
  join_date?: string;
  target_selesai?: string;
  catatan_ojt?: string;
  evaluasi_gates: {
    gate_1_day_7?: GateEvaluationRecord;
    gate_2_day_14?: GateEvaluationRecord;
    gate_3_day_21?: GateEvaluationRecord;
    gate_4_day_30?: GateEvaluationRecord;
  };
  tasks_harian: OJTDailyTask[];
}

export interface SecurityPINVerification {
  action: 'UPDATE_GRADE' | 'APPROVE_PROMOTION' | 'DELETE_RECORD' | 'OVERRIDE_SOP' | 'SYSTEM_RESET';
  required_role: UserRole[];
  kru_id?: string;
  kru_nama?: string;
  deskripsi: string;
}

export type ExamWeek = 'MINGGU_1' | 'MINGGU_2' | 'MINGGU_3' | 'MINGGU_4';
export type QuestionType = 'PILIHAN_GANDA' | 'ESSAY_HOTS' | 'KARAKTERISTIK_PSIKOLOGIS';

export type PilarKompetensi = 'sop_jobdesk' | 'peraturan_perusahaan' | 'karakter_integritas' | 'visi_misi_hara';

export interface SoalUjianMingguan {
  id: string;
  minggu: ExamWeek;
  mingguNomor: 1 | 2 | 3 | 4;
  divisi: Division | 'Semua';
  tipe: QuestionType;
  topik: string;
  pilar_kompetensi?: PilarKompetensi;
  tingkat_kesulitan?: 'Mudah' | 'Sedang' | 'Sulit';
  kode_sop?: string;
  pertanyaan: string;
  skenario_konteks?: string;
  opsi?: {
    label: 'A' | 'B' | 'C' | 'D';
    teks: string;
    profil_trait?: {
      dimensi: 'integritas' | 'ketahanan_stres' | 'fokus_pelanggan' | 'disiplin_sop' | 'kerjasama_tim';
      poin: number; // 1 s.d. 5
      deskripsi: string;
    };
  }[];
  jawaban_benar?: 'A' | 'B' | 'C' | 'D';
  kata_kunci_essay?: string[];
  pembahasan_sop?: string;
  bobot: number;
}

export interface HasilUjianKruMingguan {
  id: string;
  tanggal: string;
  nama_kru: string;
  kode_outlet: string;
  nama_outlet?: string;
  trainer_penilai?: string;
  divisi: Division;
  minggu: ExamWeek;
  mingguNomor: 1 | 2 | 3 | 4;
  skor_pilihan_ganda: number; // 0-100
  skor_essay: number; // 0-100
  skor_akhir_komposit: number; // 0-100
  status_kelulusan: 'Lulus Kompeten' | 'Remedial Terbimbing';
  jawaban_kru: Record<string, string>; // questionId -> answer
  profil_psikologis?: {
    integritas: number; // 0 - 100
    ketahanan_stres: number; // 0 - 100
    fokus_pelanggan: number; // 0 - 100
    disiplin_sop: number; // 0 - 100
    kerjasama_tim: number; // 0 - 100
    inisiatif_kepemimpinan: number; // 0 - 100 (Dimensi ke-6: Self-leadership & Solo Shift)
    skor_rata_rata?: number;
    archetype_name?: string;
    red_flag_detected?: boolean;
    red_flag_notes?: string;
    rekomendasi_stasiun?: string;
    panduan_bimbingan_sm?: string;
    cross_validation_status?: 'Konsisten Unggul' | 'Rendah Hati / Eksekutor Lapangan' | '⚠️ Anomali Fake-Good (Skor Tes Psikologi Tinggi tapi Attitude Harian Rendah)';
    tipe_kepribadian_kerja: string;
    kesimpulan_trainer: string;
    rekomendasi_pendampingan: string;
  };
  analisis_pilar?: {
    sop_jobdesk: number; // 0 - 100
    peraturan_perusahaan: number; // 0 - 100
    karakter_integritas: number; // 0 - 100
    visi_misi_hara: number; // 0 - 100
    pilar_terendah: string;
    rekomendasi_coaching: string;
    materi_rekomendasi: string[];
  };
  penilaian_essay?: Record<string, { skor: number; komentar?: string }>;
  sudah_dinilai_trainer?: boolean;
  catatan_trainer?: string;
  jumlah_pindah_tab?: number;
  created_at: string;
}

export interface TrainerExamConfig {
  mode: 'otomatis_ojt' | 'kunci_paket' | 'bebas';
  paket_terkunci?: ExamWeek;
  durasi_menit: number;
  durasi_per_soal_detik?: number;
  passing_grade: number;
  pesan_trainer?: string;
}

// ==========================================
// MODUL ONBOARDING & RETRAINING KRU 3 HARI
// (10 Sesi Baku - Total 25 Jam)
// ==========================================

export interface OnboardingSessionDef {
  no: number;
  hari: 1 | 2 | 3;
  judul: string;
  tujuan: string;
  durasi_jam: number;
  metode: string;
  trainer_role: string;
  evaluasi: string;
}

export interface OnboardingParticipant {
  kru_id: string;
  nama_kru: string;
  kode_outlet: string;
  divisi: Division;
  tipe: 'Karyawan Baru (1-45 Hari)' | 'Retraining Karyawan Lama';
  tanggal_masuk: string;
  hari_kerja: number;
  absensi: Record<number, boolean>; // sessionNo -> hadir
  nilai_evaluasi: Record<number, number>; // sessionNo -> skor (0-100)
  nilai_praktik_rnd: number; // Uji Praktik RnD 16 Jam (Hari 2 & 3)
  survey_kepuasan: number; // 1-5 bintang atau 0-100
  status_kelulusan: 'Lulus' | 'Remedial' | 'Sedang Berjalan';
  catatan?: string;
}

export interface OnboardingBatch {
  id: string;
  nomor_batch: string; // e.g. 'OB-HARA/2026/B04'
  nama_batch: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  kode_outlet_lokasi: string;
  status: 'Direncanakan' | 'Berjalan' | 'Selesai';
  kuota_min: number; // Default 11
  kuota_max: number; // Default 17
  peserta: OnboardingParticipant[];
  lead_trainer: string;
  catatan_batch?: string;
  created_at: string;
}

// ==========================================
// KONFIGURASI PDF MULTI-UKURAN & VEKTOR
// ==========================================

export type PDFPaperSize = 'A4' | 'F4' | 'Letter' | 'A3' | 'A5';
export type PDFOrientation = 'portrait' | 'landscape';

export interface PenilaianPraktikOnboardingProduk {
  id: string;
  tanggal: string;
  kru_id: string;
  nama_kru: string;
  kode_outlet: string;
  nama_outlet?: string;
  batch_id?: string;
  nama_batch?: string;
  divisi: Division;
  produk_nama: string; // Exact name from SOP database
  kode_sop?: string;
  station?: string;
  
  // 5 Dimensi Baku Sesuai PDF (Prosedur 30%, Waktu 20%, Kebersihan 15%, Kerjasama 15%, Knowledge 20%)
  day?: 'Day 1' | 'Day 2';
  batch_name?: string;
  station_label?: string;
  skor_prosedur?: number;
  skor_waktu?: number;
  waktu_detik?: number;
  target_detik?: number;
  suhu_minyak_aktual?: number;
  gramatur_aktual?: number;
  penilai_nama?: string;
  catatan?: string;
  status?: string;

  // Titik Kritis & Knowledge Auto-Check
  gagal_titik_kritis?: boolean;
  titik_kritis_gagal_detail?: string[];
  knowledge_questions?: { question: string; answerKey: string; passed: boolean }[];

  // Legacy & Alternate Aliases
  skor_ketepatan?: number;
  skor_langkah_sop?: number;
  skor_kecepatan?: number;
  skor_knowledge?: number;
  skor_kerjasama?: number;
  skor_kebersihan?: number;
  skor_keaktifan?: number;
  durasi_detik?: number;
  standar_durasi_detik?: number;
  suhu_minyak_probe?: number;
  skor_akhir: number;
  status_kelulusan?: string;
  checklist_langkah?: { nomor: number; langkah: string; tercapai: boolean }[];
  catatan_trainer?: string;
  nama_trainer?: string;
  created_at: string;
}

export interface PenilaianJobdeskStasiun {
  id: string;
  tanggal: string;
  batch_id?: string;
  batch_name?: string;
  kode_outlet: string;
  nama_outlet?: string;
  stasiun: 'Stasiun 1: Nasi, Teh, & Sup' | 'Stasiun 2: Marinate, Breading, & Fryer' | 'Stasiun 3: Sambal Cobek, Holding, Kasir/Packing';
  shift: 'Pagi' | 'Siang/Rush' | 'Malam' | 'Closing';
  kru_ids?: string[];
  kru_names?: string[];
  penilai_nama: string;
  
  // 5S Kebersihan & Sanitasi Stasiun (Jobdesk / Tim)
  skor_5s_kebersihan: number; // 0 - 100
  detail_5s: {
    ringkas_seiri: boolean; // Pemilahan bahan & alat kerja tidak berantakan
    rapi_seiton: boolean; // Tata letak penjepit, ladle, baskom pada tempatnya
    resik_seiso: boolean; // Meja stainless dilap steril, lantai kering, remahan dibersihkan
    rawat_seiketsu: boolean; // APD lengkap (celemek bersih, hairnet), zero cross-contamination
    rajin_shitsuke: boolean; // Disiplin menjaga kebersihan mandiri tanpa ditegur
  };
  
  // Kerjasama Tim & Komunikasi Jobdesk
  skor_kerjasama_komunikasi: number; // 0 - 100
  detail_kerjasama: {
    calling_yes_chef: boolean; // Respon aktif "Yes Chef" / "Siap" saat koordinasi rush
    kelancaran_handover: boolean; // Estafet produk antar stasiun lancar tanpa botol leher
    bantu_rekan_stalling: boolean; // Tanggap membantu rekan kerja saat pesanan menumpuk
    komunikasi_habis_stok: boolean; // Memperingatkan 15 menit sebelum bahan baku menipis
    disiplin_alur_fifo: boolean; // Koordinasi batch display dan antrean produk rapi
  };
  
  skor_akhir: number; // Rata-rata 5S & Kerjasama
  catatan?: string;
  created_at: string;
}

export interface PenilaianSikapKebersihanKru {
  id: string;
  tanggal: string;
  kru_id: string;
  nama_kru: string;
  batch_id?: string;
  batch_name?: string;
  kode_outlet: string;
  station?: string;
  
  // Dimensi Evaluasi Kebersihan & Sikap Kerja Individu
  skor_grooming: number;      // 0 - 20 (Personal Grooming, Apron Bersih, Hairnet, Kuku)
  skor_sanitasi: number;      // 0 - 25 (Sanitasi Meja, Clean-as-you-go, Pencegahan Kontaminasi)
  skor_keaktifan: number;     // 0 - 25 (Inisiatif Kerja, Keaktifan, Responsif & Sigap)
  skor_k3_disiplin: number;   // 0 - 15 (Kepatuhan K3, APD Fryer/Dapur, Disiplin Waktu)
  skor_kerapian_alat: number; // 0 - 15 (Tata Letak Peralatan, Tong, Skimmer, Squeeze Bottle)
  
  skor_total: number;         // 0 - 100
  predikat: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Pembinaan';
  status: 'Lulus' | 'Catatan Perbaikan';
  catatan?: string;
  penilai_nama: string;
  created_at: string;
}
