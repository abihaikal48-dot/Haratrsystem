import {
  Outlet, Kru, TNA, RencanaTraining, ObservasiLapangan, Division,
  CoachingLog, GapAnalysis, KartuKeluhan, TalentTracker,
  BankSOP, BankSoal, PenilaianTeori, PenilaianPraktik,
  PenilaianLisan, AppUser, LogAktivitas, SystemSettings,
  CrewCompetencySummary, CompetencyBadge, PenugasanTrainer,
  TraineeRecord, LaporanTrainerOutlet, CrewOnboardingProgress,
  OfficialAuditReport, OfficialRaporKru, LaporanTrainerKeuanganAtasan,
  OJTCrewMonitoringRecord, GateEvaluationRecord, UserRole,
  AuditAttitudeHara, HasilUjianKruMingguan, TrainerExamConfig,
  OnboardingBatch
} from '../types';
import { OFFICIAL_HARA_SOP_DATABASE } from './sopData';
import { OFFICIAL_HARA_BANK_SOAL } from './soalData';
import { INITIAL_ONBOARDING_PROGRESS } from './curriculumData';
import { INITIAL_ONBOARDING_BATCHES } from '../data/onboardingCurriculumData';
import {
  OFFICIAL_HARA_AUDIT_BANTUL,
  OFFICIAL_HARA_CREW_REPORTS,
  OFFICIAL_HARA_TRAINER_FINANCIAL_REPORTS
} from './officialAuditData';
import { INITIAL_HASIL_UJIAN_MINGGUAN } from '../data/bankSoalMingguan';

const STORAGE_KEYS = {
  OUTLETS: 'hara_pd_outlets_v2',
  KRU: 'hara_pd_kru_v2',
  TNA: 'hara_pd_tna_v2',
  RENCANA_TRAINING: 'hara_pd_rencana_training_v2',
  HASIL_UJIAN_MINGGUAN: 'hara_pd_hasil_ujian_mingguan_v1',
  EXAM_CONFIG: 'hara_pd_exam_config_v1',
  OBSERVASI: 'hara_pd_observasi_v2',
  COACHING: 'hara_pd_coaching_v2',
  GAP_ANALYSIS: 'hara_pd_gap_analysis_v2',
  KARTU_KELUHAN: 'hara_pd_kartu_keluhan_v2',
  TALENT: 'hara_pd_talent_v2',
  BANK_SOP: 'hara_pd_bank_sop_v6',
  BANK_SOAL: 'hara_pd_bank_soal_v3',
  PENILAIAN_TEORI: 'hara_pd_penilaian_teori_v2',
  PENILAIAN_PRAKTIK: 'hara_pd_penilaian_praktik_v2',
  PENILAIAN_LISAN: 'hara_pd_penilaian_lisan_v2',
  PENUGASAN_TRAINER: 'hara_pd_penugasan_trainer_v2',
  TRAINEE_OUTLET: 'hara_pd_trainee_outlet_v2',
  LAPORAN_TRAINER: 'hara_pd_laporan_trainer_v2',
  ONBOARDING_PROGRESS: 'hara_trainer_onboarding_progress_v1',
  ONBOARDING_BATCHES: 'hara_pd_onboarding_batches_v1',
  OFFICIAL_AUDITS: 'hara_pd_official_audits_v1',
  OFFICIAL_RAPOR_KRU: 'hara_pd_official_rapor_kru_v1',
  TRAINER_FINANCIAL_REPORTS: 'hara_pd_trainer_financial_reports_v1',
  OJT_MONITORING: 'hara_pd_ojt_monitoring_v2',
  ATTITUDE_HARA: 'hara_pd_attitude_hara_v2',
  APP_USERS: 'hara_pd_users_v2',
  LOG_AKTIVITAS: 'hara_pd_logs_v2',
  SETTINGS: 'hara_pd_settings_v2',
  CURRENT_USER: 'hara_pd_current_user_v2',
  AUTH_STATE: 'hara_pd_auth_state_v2',
};

// Seed Data
const INITIAL_OUTLETS: Outlet[] = [
  {
    id: 'out-1',
    nama_outlet: 'Hara Chicken Jatiasih',
    kode_outlet: 'HC-JTS01',
    alamat: 'Jl. Raya Jatiasih No. 45, Bekasi',
    kepala_outlet: 'Rian Hidayat',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'out-2',
    nama_outlet: 'Hara Chicken Bantul',
    kode_outlet: 'HC-BTL01',
    alamat: 'Jl. Jenderal Sudirman No. 12, Bantul, DIY',
    kepala_outlet: 'Dewi Lestari',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'out-3',
    nama_outlet: 'Hara Chicken Malang Soehat',
    kode_outlet: 'HC-MLG01',
    alamat: 'Jl. Soekarno Hatta No. 88, Malang',
    kepala_outlet: 'Fajar Nugroho',
    area_supervisor: 'Siti Sarah',
    status_aktif: 'Aktif',
    created_at: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'out-4',
    nama_outlet: 'Hara Chicken Rungkut Surabaya',
    kode_outlet: 'HC-SBY01',
    alamat: 'Jl. Raya Rungkut Madya No. 20, Surabaya',
    kepala_outlet: 'Andi Wijaya',
    area_supervisor: 'Siti Sarah',
    status_aktif: 'Aktif',
    created_at: '2026-02-15T08:00:00.000Z',
  },
  {
    id: 'out-5',
    nama_outlet: 'Hara Chicken Margonda Depok',
    kode_outlet: 'HC-DPK01',
    alamat: 'Jl. Margonda Raya No. 110, Depok',
    kepala_outlet: 'Hendra Saputra',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 'out-img01',
    nama_outlet: 'Hara Chicken Imogiri Barat',
    kode_outlet: 'HC-IMG01',
    alamat: 'Jl. Imogiri Barat Km 7, Bantul, DIY',
    kepala_outlet: 'Rahmat Hidayat',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'out-pwr01',
    nama_outlet: 'Hara Chicken Purworejo',
    kode_outlet: 'HC-PWR01',
    alamat: 'Jl. Jendral Ahmad Yani No. 50, Purworejo',
    kepala_outlet: 'Bambang Setiawan',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'out-wtb01',
    nama_outlet: 'Hara Chicken Wates Bendungan',
    kode_outlet: 'HC-WTB01',
    alamat: 'Jl. Wates - Purworejo Km 2, Kulon Progo',
    kepala_outlet: 'Tri Wahyudi',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'out-sdy01',
    nama_outlet: 'Hara Chicken Sedayu',
    kode_outlet: 'HC-SDY01',
    alamat: 'Jl. Wates Km 12, Argorejo, Sedayu, Bantul',
    kepala_outlet: 'Aris Prasetyo',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'out-jkg01',
    nama_outlet: 'Hara Chicken Jangkang',
    kode_outlet: 'HC-JKG01',
    alamat: 'Jl. Kaliurang Km 14, Jangkang, Sleman',
    kepala_outlet: 'Dwi Cahyono',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'out-gtg01',
    nama_outlet: 'Hara Chicken Gito-gati',
    kode_outlet: 'HC-GTG01',
    alamat: 'Jl. Gito-Gati No. 18, Sleman, DIY',
    kepala_outlet: 'Doni Saputra',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'out-wtk01',
    nama_outlet: 'Hara Chicken Wates Kemiri',
    kode_outlet: 'HC-WTK01',
    alamat: 'Jl. Kemiri No. 34, Wates, Kulon Progo',
    kepala_outlet: 'Fitri Rahayu',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'out-prk01',
    nama_outlet: 'Hara Chicken Parakan',
    kode_outlet: 'HC-PRK01',
    alamat: 'Jl. Parakan - Temanggung No. 89, Temanggung',
    kepala_outlet: 'Agus Riyadi',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'out-pdn01',
    nama_outlet: 'Hara Chicken Pandean',
    kode_outlet: 'HC-PDN01',
    alamat: 'Jl. Glagahsari No. 102, Pandean, Umbulharjo, Yogyakarta',
    kepala_outlet: 'Nur Aisyah',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'out-gdm01',
    nama_outlet: 'Hara Chicken Godean Munggur',
    kode_outlet: 'HC-GDM01',
    alamat: 'Jl. Godean Km 7.5, Munggur, Sleman',
    kepala_outlet: 'Hadi Gunawan',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'out-klk01',
    nama_outlet: 'Hara Chicken Kalakijo',
    kode_outlet: 'HC-KLK01',
    alamat: 'Jl. Bantul Km 9.5, Kalakijo, Guwosari, Pajangan',
    kepala_outlet: 'Lestari Handayani',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'out-mnj01',
    nama_outlet: 'Hara Chicken Mantrijeron',
    kode_outlet: 'HC-MNJ01',
    alamat: 'Jl. DI Panjaitan No. 67, Mantrijeron, Yogyakarta',
    kepala_outlet: 'Rizki Pratama',
    area_supervisor: 'Bambang Kusuma',
    status_aktif: 'Aktif',
    created_at: '2026-03-15T08:00:00.000Z',
  },
];

const INITIAL_KRU: Kru[] = [
  {
    id: 'kru-1',
    nama_kru: 'Budi Santoso',
    jabatan: 'Senior Cook & Fryer Specialist',
    divisi: 'Kitchen',
    kode_outlet: 'HC-JTS01',
    tanggal_masuk: '2025-11-01',
    status_aktif: 'Aktif',
    catatan: 'Senior cook, spesialisasi marinasi dan deep frying.',
    created_at: '2025-11-01T08:00:00.000Z',
  },
  {
    id: 'kru-2',
    nama_kru: 'Siti Rahmawati',
    jabatan: 'Senior Cashier & Front Liner',
    divisi: 'Kasir',
    kode_outlet: 'HC-JTS01',
    tanggal_masuk: '2026-01-10',
    status_aktif: 'Aktif',
    catatan: 'Pelayanan ramah, pemahaman POS kasir sangat baik.',
    created_at: '2026-01-10T08:00:00.000Z',
  },
  {
    id: 'kru-3',
    nama_kru: 'Agus Pratama',
    jabatan: 'Crew Sambal & Geprek Lead',
    divisi: 'Geprek',
    kode_outlet: 'HC-BTL01',
    tanggal_masuk: '2025-12-15',
    status_aktif: 'Aktif',
    catatan: 'Cepat dalam penimbangan takaran sambal.',
    created_at: '2025-12-15T08:00:00.000Z',
  },
  {
    id: 'kru-4',
    nama_kru: 'Eko Wahyudi',
    jabatan: 'Kitchen Helper & Sanitasi',
    divisi: 'Helper',
    kode_outlet: 'HC-BTL01',
    tanggal_masuk: '2026-02-01',
    status_aktif: 'Aktif',
    catatan: 'Kebersihan area cuci piring dan prep station.',
    created_at: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'kru-5',
    nama_kru: 'Rina Amelia',
    jabatan: 'Cashier Lead Candidate',
    divisi: 'Kasir',
    kode_outlet: 'HC-MLG01',
    tanggal_masuk: '2026-01-20',
    status_aktif: 'Aktif',
    catatan: 'Kandidat Head Cashier program talent.',
    created_at: '2026-01-20T08:00:00.000Z',
  },
  {
    id: 'kru-6',
    nama_kru: 'Dimas Setiawan',
    jabatan: 'Junior Cook (OJT)',
    divisi: 'Kitchen',
    kode_outlet: 'HC-MLG01',
    tanggal_masuk: '2026-02-10',
    status_aktif: 'Aktif',
    catatan: 'Perlu bimbingan ketepatan suhu minyak goreng.',
    created_at: '2026-02-10T08:00:00.000Z',
  },
  {
    id: 'kru-7',
    nama_kru: 'Nurul Hidayah',
    jabatan: 'Crew Geprek',
    divisi: 'Geprek',
    kode_outlet: 'HC-SBY01',
    tanggal_masuk: '2026-03-01',
    status_aktif: 'Aktif',
    catatan: 'Kru baru cabang Surabaya.',
    created_at: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 'kru-8',
    nama_kru: 'Tri Wibowo',
    jabatan: 'Helper & Sanitation Crew',
    divisi: 'Helper',
    kode_outlet: 'HC-DPK01',
    tanggal_masuk: '2026-03-05',
    status_aktif: 'Aktif',
    catatan: 'Disiplin dan rajin membersihkan grease trap.',
    created_at: '2026-03-05T08:00:00.000Z',
  },
  {
    id: 'kru-ob-01',
    nama_kru: 'Iqbal Muzzaki',
    jabatan: 'Kru Onboarding Training Center',
    divisi: 'Kitchen',
    kode_outlet: 'HC-IMG01',
    tanggal_masuk: '2026-04-10',
    status_aktif: 'Aktif',
    catatan: 'Peserta Onboarding Training Center HARA - Outlet Imogiri Barat',
    created_at: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'kru-ob-02',
    nama_kru: 'Dhimas Eka Ramadhani',
    jabatan: 'Kru Onboarding Training Center',
    divisi: 'Kitchen',
    kode_outlet: 'HC-PWR01',
    tanggal_masuk: '2026-04-10',
    status_aktif: 'Aktif',
    catatan: 'Peserta Onboarding Training Center HARA - Outlet Purworejo',
    created_at: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'kru-ob-03',
    nama_kru: 'Wanu Azzilina',
    jabatan: 'Kru Onboarding Training Center',
    divisi: 'Kasir',
    kode_outlet: 'HC-WTB01',
    tanggal_masuk: '2026-04-10',
    status_aktif: 'Aktif',
    catatan: 'Peserta Onboarding Training Center HARA - Outlet Wates Bendungan',
    created_at: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'kru-ob-04',
    nama_kru: 'Tri Muhammad Atmojo',
    jabatan: 'Kru Onboarding Training Center',
    divisi: 'Geprek',
    kode_outlet: 'HC-SDY01',
    tanggal_masuk: '2026-04-10',
    status_aktif: 'Aktif',
    catatan: 'Peserta Onboarding Training Center HARA - Outlet Sedayu',
    created_at: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'kru-ob-05',
    nama_kru: 'Muhammad Gohan Putra Nusa',
    jabatan: 'Kru Onboarding Training Center',
    divisi: 'Kitchen',
    kode_outlet: 'HC-JKG01',
    tanggal_masuk: '2026-04-10',
    status_aktif: 'Aktif',
    catatan: 'Peserta Onboarding Training Center HARA - Outlet Jangkang',
    created_at: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'kru-ob-06',
    nama_kru: 'Rully Aditya',
    jabatan: 'Kru Onboarding Training Center',
    divisi: 'Geprek',
    kode_outlet: 'HC-GTG01',
    tanggal_masuk: '2026-04-10',
    status_aktif: 'Aktif',
    catatan: 'Peserta Onboarding Training Center HARA - Outlet Gito-gati',
    created_at: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'kru-ob-07',
    nama_kru: 'Aulia Eka Sari',
    jabatan: 'Kru Onboarding Training Center',
    divisi: 'Kasir',
    kode_outlet: 'HC-WTK01',
    tanggal_masuk: '2026-04-10',
    status_aktif: 'Aktif',
    catatan: 'Peserta Onboarding Training Center HARA - Outlet Wates Kemiri',
    created_at: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'kru-ob-08',
    nama_kru: 'Karima Syakinata Fiddini',
    jabatan: 'Kru Onboarding Training Center',
    divisi: 'Kitchen',
    kode_outlet: 'HC-PRK01',
    tanggal_masuk: '2026-04-10',
    status_aktif: 'Aktif',
    catatan: 'Peserta Onboarding Training Center HARA - Outlet Parakan',
    created_at: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'kru-ob-09',
    nama_kru: 'Shabrina Eka',
    jabatan: 'Kru Onboarding Training Center',
    divisi: 'Kasir',
    kode_outlet: 'HC-PDN01',
    tanggal_masuk: '2026-04-10',
    status_aktif: 'Aktif',
    catatan: 'Peserta Onboarding Training Center HARA - Outlet Pandean',
    created_at: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'kru-ob-10',
    nama_kru: 'Ryan Candra Kusuma (New)',
    jabatan: 'Kru Onboarding Training Center',
    divisi: 'Kitchen',
    kode_outlet: 'HC-GDM01',
    tanggal_masuk: '2026-04-10',
    status_aktif: 'Aktif',
    catatan: 'Peserta Baru (New) Onboarding Training Center HARA - Outlet Godean Munggur',
    created_at: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'kru-ob-11',
    nama_kru: 'Chicha Suparwati (New)',
    jabatan: 'Kru Onboarding Training Center',
    divisi: 'Kasir',
    kode_outlet: 'HC-KLK01',
    tanggal_masuk: '2026-04-10',
    status_aktif: 'Aktif',
    catatan: 'Peserta Baru (New) Onboarding Training Center HARA - Outlet Kalakijo',
    created_at: '2026-04-10T08:00:00.000Z',
  },
  {
    id: 'kru-ob-12',
    nama_kru: 'Intan Nur Khasanah (New)',
    jabatan: 'Kru Onboarding Training Center',
    divisi: 'Geprek',
    kode_outlet: 'HC-MNJ01',
    tanggal_masuk: '2026-04-10',
    status_aktif: 'Aktif',
    catatan: 'Peserta Baru (New) Onboarding Training Center HARA - Outlet Mantrijeron',
    created_at: '2026-04-10T08:00:00.000Z',
  },
];

const INITIAL_BANK_SOP: BankSOP[] = OFFICIAL_HARA_SOP_DATABASE;
const INITIAL_BANK_SOAL: BankSoal[] = OFFICIAL_HARA_BANK_SOAL;

const INITIAL_TNA: TNA[] = [
  {
    id: 'tna-1',
    tanggal: '2026-08-01',
    kode_outlet: 'HC-JTS01',
    divisi: 'Kitchen',
    sumber_temuan: 'Audit Trainer & Keluhan Pelanggan',
    deskripsi_gap: 'Ayam krispi bagian paha sering belum matang sempurna di dekat tulang saat jam sibuk malam.',
    jenis_gap: 'Keterampilan',
    prioritas: 'Tinggi',
    rencana_tindak_lanjut: 'Sesi retraining kalibrasi temperatur fryer dan timing penggorengan per cut piece.',
    status: 'Proses',
    created_at: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'tna-2',
    tanggal: '2026-08-03',
    kode_outlet: 'HC-BTL01',
    divisi: 'Kasir',
    sumber_temuan: 'Observasi Supervisor',
    deskripsi_gap: 'Kasir sering lupa menawarkan upsell paket minuman jumbo dan es krim cone.',
    jenis_gap: 'Sikap/Konsistensi',
    prioritas: 'Sedang',
    rencana_tindak_lanjut: 'Roleplay skenario upselling 5 detik pada briefing shift pagi.',
    status: 'Proses',
    created_at: '2026-08-03T10:00:00.000Z',
  },
  {
    id: 'tna-3',
    tanggal: '2026-08-05',
    kode_outlet: 'HC-MLG01',
    divisi: 'Geprek',
    sumber_temuan: 'Mystery Shopper',
    deskripsi_gap: 'Takaran tingkat kepedasan sambal level 3 tidak konsisten antara shift pagi dan malam.',
    jenis_gap: 'Keterampilan',
    prioritas: 'Tinggi',
    rencana_tindak_lanjut: 'Penggunaan sendok ukur gramasi baku dan coaching tim geprek.',
    status: 'Belum',
    created_at: '2026-08-05T11:00:00.000Z',
  },
  {
    id: 'tna-4',
    tanggal: '2026-08-08',
    kode_outlet: 'HC-JTS01',
    divisi: 'Kitchen',
    sumber_temuan: 'Cek Harian Kepala Outlet',
    deskripsi_gap: 'Minyak goreng terlambat disaring sehingga warna tepung menjadi cepat gelap.',
    jenis_gap: 'Pengetahuan',
    prioritas: 'Tinggi',
    rencana_tindak_lanjut: 'Pasang checklist filtering minyak setiap 4 batch penggorengan.',
    status: 'Proses',
    created_at: '2026-08-08T09:30:00.000Z',
  },
];

const INITIAL_RENCANA_TRAINING: RencanaTraining[] = [
  {
    id: 'rt-1',
    kode_outlet: 'HC-JTS01',
    topik: 'Mastering Crispy Frying & Heat Management',
    tujuan_pembelajaran: 'Kru dapur mampu menggoreng ayam dengan kematangan dalam 100% dan renyah bertahan 45 menit.',
    peserta: 'Budi Santoso, Dimas Setiawan',
    metode: 'Demonstrasi Praktik Langsung & Uji Internal Meat Thermometer',
    durasi: '120 Menit',
    alat_bantu: 'Meat probe thermometer, timer digital, holding tray',
    fasilitator: 'Haikal (Lead Trainer PD)',
    tanggal_pelaksanaan: '2026-08-18',
    status: 'Direncanakan',
    created_at: '2026-08-02T10:00:00.000Z',
  },
  {
    id: 'rt-2',
    kode_outlet: 'HC-BTL01',
    topik: 'Hospitality & Upselling Mastery for Cashiers',
    tujuan_pembelajaran: 'Meningkatkan konversi upsell minuman sebesar 25% dan kepuasan pelanggan.',
    peserta: 'Siti Rahmawati, Rina Amelia',
    metode: 'Roleplay & Simulasi POS',
    durasi: '90 Menit',
    alat_bantu: 'POS Demo Tablet, Dummy Transaksi',
    fasilitator: 'Haikal Abi',
    tanggal_pelaksanaan: '2026-08-20',
    status: 'Direncanakan',
    created_at: '2026-08-04T10:00:00.000Z',
  },
];

const INITIAL_OBSERVASI: ObservasiLapangan[] = [
  {
    id: 'obs-1',
    tanggal_shift: '12/08/2026 - Siang (Peak Hour)',
    kode_outlet: 'HC-JTS01',
    nama_kru: 'Budi Santoso',
    divisi: 'Kitchen',
    standar_sop_diamati: 'Prosedur penepungan 2x dan pengecekan suhu minyak 160°C.',
    hasil: 'Sesuai Standar',
    catatan_detail: 'Ketebalan tepung krispi sangat baik dan waktu goreng konsisten 13 menit.',
    rencana_follow_up: 'Pertahankan dan jadikan mentor untuk kru junior.',
    created_at: '2026-08-12T13:00:00.000Z',
  },
  {
    id: 'obs-2',
    tanggal_shift: '13/08/2026 - Pagi',
    kode_outlet: 'HC-BTL01',
    nama_kru: 'Agus Pratama',
    divisi: 'Geprek',
    standar_sop_diamati: 'Penimbangan cabai dan penyiraman minyak panas sambal bawang.',
    hasil: 'Perlu Perbaikan',
    catatan_detail: 'Masih mengira-ngira takaran cabai tanpa menggunakan sendok takar baku.',
    rencana_follow_up: 'Coaching 1-on-1 mengenai akurasi resep sambal.',
    created_at: '2026-08-13T10:30:00.000Z',
  },
];

const INITIAL_COACHING: CoachingLog[] = [
  {
    id: 'cl-1',
    tanggal: '2026-08-10',
    kode_outlet: 'HC-BTL01',
    nama_kru: 'Agus Pratama',
    goal: 'Mencapai konsistensi rasa sambal bawang level 1-5 tanpa komplain rasa dari pelanggan.',
    reality: 'Kadang saat pesanan menumpuk cepat panik dan tidak menggunakan sendok takar.',
    options: 'Menata prep station sendok takar tepat di depan cobek dan membuat takaran batch kecil.',
    will: 'Berkomitmen selalu menggunakan sendok takar mulai shift berikutnya dan mencatat berat sambal harian.',
    hasil_follow_up: 'Dalam 3 hari terakhir tidak ada keluhan sambal asin/kurang pedas.',
    created_at: '2026-08-10T14:00:00.000Z',
  },
];

const INITIAL_GAP_ANALYSIS: GapAnalysis[] = [
  {
    id: 'gap-1',
    nama_kru: 'Budi Santoso',
    divisi: 'Kitchen',
    kode_outlet: 'HC-JTS01',
    kompetensi_dinilai: 'Deep Frying Control & Holding Time',
    skor_standar: 3,
    skor_aktual: 3,
    gap_score: 0,
    rekomendasi: 'Memenuhi standar kompetensi Mahir. Siap untuk sertifikasi trainer.',
    created_at: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'gap-2',
    nama_kru: 'Dimas Setiawan',
    divisi: 'Kitchen',
    kode_outlet: 'HC-MLG01',
    kompetensi_dinilai: 'Deep Frying Control & Heat Measurement',
    skor_standar: 3,
    skor_aktual: 1.5,
    gap_score: 1.5,
    rekomendasi: 'Ikuti sesi mentoring praktikum penggorengan bersama Senior Cook.',
    created_at: '2026-08-05T08:00:00.000Z',
  },
  {
    id: 'gap-3',
    nama_kru: 'Siti Rahmawati',
    divisi: 'Kasir',
    kode_outlet: 'HC-JTS01',
    kompetensi_dinilai: 'Upselling & Greeting 5S',
    skor_standar: 3,
    skor_aktual: 2.8,
    gap_score: 0.2,
    rekomendasi: 'Sangat baik, tinggal konsistensi saat jam sibuk.',
    created_at: '2026-08-06T08:00:00.000Z',
  },
];

const INITIAL_KARTU_KELUHAN: KartuKeluhan[] = [
  {
    id: 'kel-1',
    tanggal_shift: '09/08/2026 - Malam',
    kode_outlet: 'HC-JTS01',
    tipe: 'Produk/Rasa',
    deskripsi_keluhan: 'Pelanggan komplain ayam bagian dada kurang krispi dan agak dingin.',
    nama_kru_terkait: 'Dimas Setiawan',
    tindakan_diambil: 'Diganti menu baru yang baru matang dan diberikan voucher diskon.',
    status: 'Dalam kajian',
    tindak_lanjut_training: 'Cek lampu pemanas holding cabinet dan timer serving.',
    created_at: '2026-08-09T20:00:00.000Z',
  },
  {
    id: 'kel-2',
    tanggal_shift: '11/08/2026 - Siang',
    kode_outlet: 'HC-BTL01',
    tipe: 'Pelayanan/Kasir',
    deskripsi_keluhan: 'Struk kasir salah input varian sambal (minta Sambal Bawang terinput Sambal Matah).',
    nama_kru_terkait: 'Siti Rahmawati',
    tindakan_diambil: 'Kasir segera mengganti menu tanpa biaya tambahan dalam 3 menit.',
    status: 'Selesai',
    tindak_lanjut_training: 'Wajib melakukan repeat order (baca ulang pesanan) sebelum menekan tombol bayar.',
    created_at: '2026-08-11T13:30:00.000Z',
  },
];

const INITIAL_TALENT: TalentTracker[] = [
  {
    id: 'tal-1',
    nama_kandidat: 'Budi Santoso',
    divisi: 'Kitchen',
    kode_outlet: 'HC-JTS01',
    target_posisi: 'Head Cook / Outlet Assistant Trainer',
    tanggung_jawab_uji_coba: 'Memimpin briefing standar kitchen shift pagi dan mengawasi prep paha ayam.',
    progres_terkini: '85% - Sangat cakap dalam komunikasi tim dan disiplin higienitas.',
    target_waktu_siap: 'September 2026',
    created_at: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'tal-2',
    nama_kandidat: 'Rina Amelia',
    divisi: 'Kasir',
    kode_outlet: 'HC-MLG01',
    target_posisi: 'Head Cashier',
    tanggung_jawab_uji_coba: 'Mengelola rekonsiliasi kas harian dan training kasir baru cabang Malang.',
    progres_terkini: '90% - Akurasi kas 100% selama 60 hari berturut-turut.',
    target_waktu_siap: 'Agustus 2026',
    created_at: '2026-08-02T08:00:00.000Z',
  },
];

const INITIAL_PENILAIAN_TEORI: PenilaianTeori[] = [
  {
    id: 'pt-1',
    tanggal: '2026-08-05T09:00:00.000Z',
    nama_kru: 'Budi Santoso',
    topik: 'Kitchen & Frying',
    jumlah_benar: 5,
    total_soal: 5,
    skor: 100,
    catatan: 'Menguasai seluruh teori HACCP dan SOP penggorengan sempurna.',
    created_at: '2026-08-05T09:00:00.000Z',
  },
  {
    id: 'pt-2',
    tanggal: '2026-08-06T10:00:00.000Z',
    nama_kru: 'Siti Rahmawati',
    topik: 'Kasir & Front House',
    jumlah_benar: 4,
    total_soal: 5,
    skor: 90,
    catatan: 'Pemahaman alur kasir dan greeting sangat baik.',
    created_at: '2026-08-06T10:00:00.000Z',
  },
  {
    id: 'pt-3',
    tanggal: '2026-08-07T11:00:00.000Z',
    nama_kru: 'Agus Pratama',
    topik: 'Geprek & Sambal',
    jumlah_benar: 4,
    total_soal: 5,
    skor: 80,
    catatan: 'Memahami resep sambal, sedikit keliru pada rasio minyak.',
    created_at: '2026-08-07T11:00:00.000Z',
  },
  {
    id: 'pt-4',
    tanggal: '2026-08-08T13:00:00.000Z',
    nama_kru: 'Dimas Setiawan',
    topik: 'Kitchen & Frying',
    jumlah_benar: 3,
    total_soal: 5,
    skor: 65,
    catatan: 'Perlu review kembali materi waktu holding.',
    created_at: '2026-08-08T13:00:00.000Z',
  },
  {
    id: 'pt-5',
    tanggal: '2026-08-09T14:00:00.000Z',
    nama_kru: 'Rina Amelia',
    topik: 'Kasir & Front House',
    jumlah_benar: 5,
    total_soal: 5,
    skor: 95,
    catatan: 'Sangat menguasai standar POS dan customer greeting.',
    created_at: '2026-08-09T14:00:00.000Z',
  },
];

const INITIAL_PENILAIAN_PRAKTIK: PenilaianPraktik[] = [
  {
    id: 'pp-1',
    tanggal: '2026-08-06T10:00:00.000Z',
    nama_kru: 'Budi Santoso',
    sop_terkait: 'SOP Penggorengan Ayam Krispi Crispy Gold',
    detail_skor_langkah: [3, 3, 3, 3, 3, 3, 3],
    skor_akhir: 100,
    catatan: 'Teknik penepungan keriting sempurna, ayam renyah dan matang merata.',
    created_at: '2026-08-06T10:00:00.000Z',
  },
  {
    id: 'pp-2',
    tanggal: '2026-08-07T11:00:00.000Z',
    nama_kru: 'Siti Rahmawati',
    sop_terkait: 'SOP 5S Greeting dan Transaksi Kasir',
    detail_skor_langkah: [3, 3, 3, 2, 3, 3],
    skor_akhir: 94,
    catatan: 'Greeting hangat, perhitungan uang akurat.',
    created_at: '2026-08-07T11:00:00.000Z',
  },
  {
    id: 'pp-3',
    tanggal: '2026-08-08T14:00:00.000Z',
    nama_kru: 'Agus Pratama',
    sop_terkait: 'SOP Pembuatan Sambal Bawang Korek',
    detail_skor_langkah: [3, 2, 3, 2, 3, 2],
    skor_akhir: 83,
    catatan: 'Rasa sambal pas, holding container perlu ditutup lebih rapat.',
    created_at: '2026-08-08T14:00:00.000Z',
  },
  {
    id: 'pp-4',
    tanggal: '2026-08-09T15:00:00.000Z',
    nama_kru: 'Dimas Setiawan',
    sop_terkait: 'SOP Penggorengan Ayam Krispi Crispy Gold',
    detail_skor_langkah: [2, 3, 2, 2, 2, 2, 2],
    skor_akhir: 71,
    catatan: 'Penepungan tahap kedua terlalu padat, perlu latihan teknik cubit ringan.',
    created_at: '2026-08-09T15:00:00.000Z',
  },
  {
    id: 'pp-ob-1',
    tanggal: '2026-04-12T10:00:00.000Z',
    nama_kru: 'Dimas Kurniawan',
    kru_id: 'kru-13',
    kode_outlet: 'HC-SBY01',
    sop_terkait: 'Nasi Putih Pulen (Miyako) & Goreng Ayam RnD',
    detail_skor_langkah: [3, 3, 3, 3, 3, 2],
    waktu_detik: 720,
    target_detik: 720,
    suhu_minyak: 160,
    skor_akhir: 93,
    catatan: 'Uji Praktik Onboarding: Rasio cup Miyako 1:1.33 ditaati, tanak 15 mnt, porsi centong standar pulen rapi. Deep fryer kompor 175°C, minyak 160°C, timer 12 mnt konsisten.',
    created_at: '2026-04-12T10:00:00.000Z',
  },
  {
    id: 'pp-ob-2',
    tanggal: '2026-04-12T11:00:00.000Z',
    nama_kru: 'Nurul Hidayah',
    kru_id: 'kru-14',
    kode_outlet: 'HC-SBY01',
    sop_terkait: 'SOP Kasir POS ESB & Handling Complaint LAST',
    detail_skor_langkah: [3, 3, 3, 3, 2, 3],
    waktu_detik: 48,
    target_detik: 60,
    skor_akhir: 91,
    catatan: 'Uji Praktik Onboarding: Station Non-Termal (Bebas Probe Suhu). Transaksi POS ESB 48s cepat & akurat, greeting 3S ramah, rekonsiliasi kas shift zero minus.',
    created_at: '2026-04-12T11:00:00.000Z',
  },
  {
    id: 'pp-ob-3',
    tanggal: '2026-04-12T13:30:00.000Z',
    nama_kru: 'Fajar Maulana',
    kru_id: 'kru-15',
    kode_outlet: 'HC-SBY01',
    sop_terkait: 'SOP Sambal Bawang Otentik 30g & Plating Geprek',
    detail_skor_langkah: [3, 3, 3, 3, 3, 3],
    waktu_detik: 42,
    target_detik: 45,
    gramatur: 30,
    skor_akhir: 94,
    catatan: 'Uji Praktik Onboarding: Takaran sambal bawang cobek 30g presisi, siraman minyak panas bawang wangi merata, plating 2 slice timun miring 45 derajat rapi.',
    created_at: '2026-04-12T13:30:00.000Z',
  },
  {
    id: 'pp-ob-4',
    tanggal: '2026-04-12T14:15:00.000Z',
    nama_kru: 'Tri Wibowo',
    kru_id: 'kru-16',
    kode_outlet: 'HC-MLG01',
    sop_terkait: 'SOP Kebersihan Sanitasi 4 Warna Lap & K3 Outlet',
    detail_skor_langkah: [3, 3, 2, 3, 3, 3],
    waktu_detik: 110,
    target_detik: 120,
    skor_akhir: 90,
    catatan: 'Uji Praktik Onboarding: Station Non-Termal & Non-Timbangan. Kepatuhan mutlak segregasi 4 warna lap steril (Kanebo, Oranye, Microfiber, Serbet) & kebersihan grease trap optimal.',
    created_at: '2026-04-12T14:15:00.000Z',
  },
];

const INITIAL_PENILAIAN_LISAN: PenilaianLisan[] = [
  {
    id: 'pl-1',
    tanggal: '2026-08-07T11:00:00.000Z',
    nama_kru: 'Budi Santoso',
    sop_terkait: 'SOP Penggorengan Ayam Krispi Crispy Gold',
    butir_benar: 7,
    total_butir: 7,
    skor: 100,
    catatan: 'Mampu menjelaskan step by step dan alasan suhu 160°C dengan lancar.',
    created_at: '2026-08-07T11:00:00.000Z',
  },
  {
    id: 'pl-2',
    tanggal: '2026-08-08T13:00:00.000Z',
    nama_kru: 'Siti Rahmawati',
    sop_terkait: 'SOP 5S Greeting dan Transaksi Kasir',
    butir_benar: 6,
    total_butir: 6,
    skor: 100,
    catatan: 'Lisan dan artikulasi greeting sangat mantap.',
    created_at: '2026-08-08T13:00:00.000Z',
  },
  {
    id: 'pl-3',
    tanggal: '2026-08-09T14:00:00.000Z',
    nama_kru: 'Agus Pratama',
    sop_terkait: 'SOP Pembuatan Sambal Bawang Korek',
    butir_benar: 5,
    total_butir: 6,
    skor: 83,
    catatan: 'Paham gramasi dan minyak panas.',
    created_at: '2026-08-09T14:00:00.000Z',
  },
];

const INITIAL_ATTITUDE_HARA: AuditAttitudeHara[] = [
  {
    id: 'att-1',
    tanggal: '2026-08-10T10:00:00.000Z',
    nama_kru: 'Budi Santoso',
    kode_outlet: 'HC-JTS01',
    evaluator_nama: 'Haikal Abi',
    skor_h_higienis: 85,
    skor_a_antusias: 88,
    skor_r_resik: 84,
    skor_a_amanah: 90,
    skor_rata_rata: 86.8,
    catatan_perilaku: 'Grooming bersih, APD lengkap, sangat antusias saat rush hour, jujur dan tepat waktu.',
    created_at: '2026-08-10T10:00:00.000Z',
  },
  {
    id: 'att-2',
    tanggal: '2026-08-12T11:00:00.000Z',
    nama_kru: 'Siti Rahmawati',
    kode_outlet: 'HC-JTS01',
    evaluator_nama: 'Haikal Abi',
    skor_h_higienis: 94,
    skor_a_antusias: 92,
    skor_r_resik: 95,
    skor_a_amanah: 96,
    skor_rata_rata: 94.3,
    catatan_perilaku: 'Pelayanan kasir 5S luar biasa, senyum salam sapa konsisten, uang kas register seimbang tanpa selisih.',
    created_at: '2026-08-12T11:00:00.000Z',
  },
  {
    id: 'att-3',
    tanggal: '2026-08-14T14:00:00.000Z',
    nama_kru: 'Dewi Anggraini',
    kode_outlet: 'HC-BTL01',
    evaluator_nama: 'Dewi Lestari',
    skor_h_higienis: 92,
    skor_a_antusias: 90,
    skor_r_resik: 94,
    skor_a_amanah: 95,
    skor_rata_rata: 92.8,
    catatan_perilaku: 'Kerjasama tim stasiun kasir sangat solid dan disiplin menjalankan SOP kebersihan meja santap.',
    created_at: '2026-08-14T14:00:00.000Z',
  },
  {
    id: 'att-4',
    tanggal: '2026-08-15T15:00:00.000Z',
    nama_kru: 'Agus Pratama',
    kode_outlet: 'HC-BTL01',
    evaluator_nama: 'Haikal Abi',
    skor_h_higienis: 78,
    skor_a_antusias: 80,
    skor_r_resik: 75,
    skor_a_amanah: 82,
    skor_rata_rata: 78.8,
    catatan_perilaku: 'Perlu peningkatan kebersihan cobek di sela rush hour dan kerapian celemek apron.',
    created_at: '2026-08-15T15:00:00.000Z',
  },
  {
    id: 'att-5',
    tanggal: '2026-08-16T16:00:00.000Z',
    nama_kru: 'Fajar Nugroho',
    kode_outlet: 'HC-MLG01',
    evaluator_nama: 'Fajar Nugroho',
    skor_h_higienis: 75,
    skor_a_antusias: 76,
    skor_r_resik: 72,
    skor_a_amanah: 80,
    skor_rata_rata: 75.8,
    catatan_perilaku: 'Perlu disiplin mencuci tangan sebelum memegang makanan matang. Diberi arahan lisan.',
    created_at: '2026-08-16T16:00:00.000Z',
  },
  {
    id: 'att-6',
    tanggal: '2026-08-17T17:00:00.000Z',
    nama_kru: 'Rina Wulandari',
    kode_outlet: 'HC-SBY01',
    evaluator_nama: 'Siti Sarah',
    skor_h_higienis: 96,
    skor_a_antusias: 94,
    skor_r_resik: 95,
    skor_a_amanah: 98,
    skor_rata_rata: 95.8,
    catatan_perilaku: 'Role model etika HARA di cabang Surabaya. Direkomendasikan asisten trainer.',
    created_at: '2026-08-17T17:00:00.000Z',
  },
];

const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-1',
    nama: 'Haikal Abi',
    email: 'haikal@harachicken.com',
    role: 'Trainer',
    status_aktif: 'Aktif',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-admin',
    nama: 'Administrator HQ',
    email: 'admin@harachicken.com',
    role: 'Admin',
    status_aktif: 'Aktif',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usr-2',
    nama: 'Bambang Kusuma',
    email: 'bambang.spv@harachicken.com',
    role: 'Area Supervisor',
    status_aktif: 'Aktif',
    created_at: '2026-01-05T00:00:00.000Z',
  },
  {
    id: 'usr-rian',
    nama: 'Rian Hidayat',
    email: 'rian.kepala@harachicken.com',
    role: 'Kepala Outlet',
    status_aktif: 'Aktif',
    created_at: '2026-01-08T00:00:00.000Z',
  },
  {
    id: 'usr-3',
    nama: 'Siti Sarah',
    email: 'siti.sarah@harachicken.com',
    role: 'Trainer',
    status_aktif: 'Aktif',
    created_at: '2026-01-10T00:00:00.000Z',
  },
  {
    id: 'usr-rekrutmen',
    nama: 'Dina Putri',
    email: 'rekrutmen@harachicken.com',
    role: 'SPV Rekrutmen',
    status_aktif: 'Aktif',
    created_at: '2026-01-12T00:00:00.000Z',
  },
];

const INITIAL_LOGS: LogAktivitas[] = [
  {
    id: 'log-1',
    user_nama: 'Haikal Abi',
    aksi: 'TAMBAH',
    tabel: 'TNA',
    detail: 'Menambahkan temuan TNA HC-JTS01 divisi Kitchen (Prioritas Tinggi)',
    created_at: '2026-08-01T09:05:00.000Z',
  },
  {
    id: 'log-2',
    user_nama: 'Haikal Abi',
    aksi: 'TAMBAH',
    tabel: 'Penilaian Teori',
    detail: 'Menyelesaikan penilaian teori untuk kru Budi Santoso (Skor 100)',
    created_at: '2026-08-05T09:10:00.000Z',
  },
  {
    id: 'log-3',
    user_nama: 'Siti Sarah',
    aksi: 'TAMBAH',
    tabel: 'Observasi Lapangan',
    detail: 'Mencatat observasi Budi Santoso - Sesuai Standar',
    created_at: '2026-08-12T13:05:00.000Z',
  },
];

const INITIAL_PENUGASAN_TRAINER: PenugasanTrainer[] = [
  {
    id: 'tugas-1',
    nomor_surat_tugas: 'ST/HARA-TRN/2026/08/001',
    trainer_nama: 'Haikal Abi',
    trainer_kontak: '0812-8899-2341',
    kode_outlet: 'HC-JTS01',
    tipe_penugasan: 'Pendampingan & OJT',
    fokus_divisi: 'Kitchen',
    shift_kerja: 'Shift Pagi',
    tanggal_mulai: '2026-08-10',
    tanggal_selesai: '2026-08-20',
    tujuan_tugas: 'Pendampingan intensif OJT kru kitchen baru (Budi Santoso) untuk standarisasi suhu penggorengan deep-fryer 170°C dan rasio marinasi batch 5kg.',
    daftar_kru_didampingi: 'Budi Santoso (Kitchen), Siti Rahmawati (Kasir)',
    target_output: 'Kru kitchen mampu mengoperasikan 2 deep-fryer secara mandiri dengan tingkat kematangan crispy 100% tanpa overcook.',
    status: 'Berjalan',
    laporan_kegiatan: 'Hari ke-5: Kru Budi Santoso sudah memahami teknik double dipping tepung kriuk. Kalibrasi termometer fryer 170°C stabil.',
    rekomendasi_outlet: 'Pertahankan checklist kalibrasi minyak setiap awal shift sebelum jam 10.00 WIB.',
    skor_evaluasi_outlet: 92,
    catatan_kepala_outlet: 'Kinerja trainer sangat membantu menekan angka komplain produk di shift pagi.',
    created_at: '2026-08-10T08:00:00.000Z',
  },
  {
    id: 'tugas-2',
    nomor_surat_tugas: 'ST/HARA-TRN/2026/08/002',
    trainer_nama: 'Siti Sarah',
    trainer_kontak: '0813-7766-5544',
    kode_outlet: 'HC-BTL01',
    tipe_penugasan: 'Perbantuan Operasional',
    fokus_divisi: 'Kasir',
    shift_kerja: 'Shift Siang/Malam',
    tanggal_mulai: '2026-08-14',
    tanggal_selesai: '2026-08-18',
    tujuan_tugas: 'Perbantuan operasional stasiun kasir POS dan packing selama weekend promo di Bantul untuk mencegah antrean panjang.',
    daftar_kru_didampingi: 'Agus Pratama (Geprek), Eko Wahyudi (Helper)',
    target_output: 'Kecepatan transaksi kasir tercapai di bawah 45 detik per pelanggan pada jam rush hour.',
    status: 'Berjalan',
    laporan_kegiatan: 'Hari ke-2: Rata-rata speed of service (SOS) kasir tercatat 38 detik. Zero complaint ketidaksesuaian struk.',
    rekomendasi_outlet: 'Tambahkan 1 tablet POS cadangan saat event promo weekend berikutnya.',
    skor_evaluasi_outlet: 95,
    catatan_kepala_outlet: 'Antrean terkelola rapi berkat back-up trainer di jam padat 18.00-21.00.',
    created_at: '2026-08-14T08:00:00.000Z',
  },
  {
    id: 'tugas-3',
    nomor_surat_tugas: 'ST/HARA-TRN/2026/07/045',
    trainer_nama: 'Bambang Kusuma',
    trainer_kontak: '0811-3344-9988',
    kode_outlet: 'HC-MLG01',
    tipe_penugasan: 'Standarisasi & Audit SOP',
    fokus_divisi: 'Semua Divisi',
    shift_kerja: 'Full Day / Double Shift',
    tanggal_mulai: '2026-07-20',
    tanggal_selesai: '2026-07-25',
    tujuan_tugas: 'Audit berkala standarisasi HACCP, sanitasi area geprek, dan evaluasi kepuasan pelanggan outlet Malang.',
    daftar_kru_didampingi: 'Rina Amelia (Kasir), Dimas Setiawan (Kitchen)',
    target_output: 'Skor audit HACCP outlet mencapai minimal 90% dan penyelesaian 100% temuan gap TNA.',
    status: 'Selesai',
    laporan_kegiatan: 'Selesai: Audit menyeluruh 4 stasiun kerja berhasil. Seluruh kru lolos uji lisan SOP sanitasi dan 5S.',
    rekomendasi_outlet: 'Jadwalkan penggantian kain lap microfiber berkala per warna stasiun.',
    skor_evaluasi_outlet: 90,
    catatan_kepala_outlet: 'SOP berjalan disiplin setelah sesi workshop singkat pasca shift.',
    created_at: '2026-07-20T08:00:00.000Z',
  },
  {
    id: 'tugas-4',
    nomor_surat_tugas: 'ST/HARA-TRN/2026/08/009',
    trainer_nama: 'Haikal Abi',
    trainer_kontak: '0812-8899-2341',
    kode_outlet: 'HC-DPK01',
    tipe_penugasan: 'Opening Outlet Baru',
    fokus_divisi: 'Semua Divisi',
    shift_kerja: 'Full Day / Double Shift',
    tanggal_mulai: '2026-08-25',
    tanggal_selesai: '2026-08-31',
    tujuan_tugas: 'Pengawalan grand opening cabang baru Margonda Depok, supervisi flow pesanan, dan pendampingan 8 kru baru.',
    daftar_kru_didampingi: 'Seluruh Tim Kru Margonda Depok',
    target_output: 'Kelancaran grand opening, 0 insiden fatal food safety, kepuasan customer 95%+',
    status: 'Direncanakan',
    laporan_kegiatan: '',
    rekomendasi_outlet: '',
    catatan_kepala_outlet: '',
    created_at: '2026-08-15T08:00:00.000Z',
  },
];

const INITIAL_TRAINEE_OUTLET: TraineeRecord[] = [
  {
    id: 'trainee-1',
    penugasan_id: 'tugas-1',
    kode_outlet: 'HC-JTS01',
    trainer_nama: 'Haikal Abi',
    nama_kru: 'Budi Santoso',
    jabatan: 'Senior Cook & Fryer Specialist',
    divisi: 'Kitchen',
    tipe_bimbingan: 'Pendampingan OJT Kru Baru',
    sop_fokus: 'Standar Penggorengan Ayam Crispy & Suhu Minyak (170°C)',
    tanggal_mulai: '2026-08-10',
    tanggal_selesai: '2026-08-20',
    skor_awal: 65,
    skor_akhir: 92,
    status_ojt: 'Lulus / Mandiri',
    catatan_trainer: 'Sangat cepat beradaptasi. Mampu mengoperasikan deep fryer 170°C mandiri dan teknik double dipping renyah.',
    created_at: '2026-08-10T08:30:00.000Z',
  },
  {
    id: 'trainee-2',
    penugasan_id: 'tugas-1',
    kode_outlet: 'HC-JTS01',
    trainer_nama: 'Haikal Abi',
    nama_kru: 'Siti Rahmawati',
    jabatan: 'Senior Cashier & Front Liner',
    divisi: 'Kasir',
    tipe_bimbingan: 'Peningkatan Level',
    sop_fokus: 'SOP 5S Greeting, Transaksi POS & Upselling',
    tanggal_mulai: '2026-08-11',
    tanggal_selesai: '2026-08-18',
    skor_awal: 75,
    skor_akhir: 95,
    status_ojt: 'Lulus / Mandiri',
    catatan_trainer: 'Artikulasi greeting sangat ramah, speed of service rata-rata 36 detik per pelanggan.',
    created_at: '2026-08-11T09:00:00.000Z',
  },
  {
    id: 'trainee-3',
    penugasan_id: 'tugas-2',
    kode_outlet: 'HC-BTL01',
    trainer_nama: 'Siti Sarah',
    nama_kru: 'Agus Pratama',
    jabatan: 'Crew Sambal & Geprek Lead',
    divisi: 'Geprek',
    tipe_bimbingan: 'Perbantuan Operasional',
    sop_fokus: 'SOP Pembuatan Sambal Bawang Korek & Gramasi Minyak Panas',
    tanggal_mulai: '2026-08-14',
    tanggal_selesai: '2026-08-18',
    skor_awal: 70,
    skor_akhir: 88,
    status_ojt: 'Sedang Berjalan',
    catatan_trainer: 'Perbantuan stasiun geprek selama promo berjalan lancar. Gramasi cabai level 1-5 presisi.',
    created_at: '2026-08-14T10:00:00.000Z',
  },
  {
    id: 'trainee-4',
    penugasan_id: 'tugas-2',
    kode_outlet: 'HC-BTL01',
    trainer_nama: 'Siti Sarah',
    nama_kru: 'Eko Wahyudi',
    jabatan: 'Kitchen Helper & Sanitasi',
    divisi: 'Helper',
    tipe_bimbingan: 'Pendampingan OJT Kru Baru',
    sop_fokus: 'SOP 5S Area Dapur & Sanitasi Grease Trap',
    tanggal_mulai: '2026-08-14',
    tanggal_selesai: '2026-08-18',
    skor_awal: 60,
    skor_akhir: 85,
    status_ojt: 'Lulus / Mandiri',
    catatan_trainer: 'Area cuci dan grease trap selalu bersih sebelum closing shift.',
    created_at: '2026-08-14T11:00:00.000Z',
  },
  {
    id: 'trainee-5',
    penugasan_id: 'tugas-3',
    kode_outlet: 'HC-MLG01',
    trainer_nama: 'Bambang Kusuma',
    nama_kru: 'Dimas Setiawan',
    jabatan: 'Junior Cook (OJT)',
    divisi: 'Kitchen',
    tipe_bimbingan: 'Retraining Gap SOP',
    sop_fokus: 'SOP Marinasi Daging Ayam Segar Batch 5kg',
    tanggal_mulai: '2026-07-20',
    tanggal_selesai: '2026-07-25',
    skor_awal: 55,
    skor_akhir: 78,
    status_ojt: 'Perlu Pendampingan Lanjut',
    catatan_trainer: 'Masih perlu pengawasan waktu perendaman bumbu 60 menit agar bumbu meresap ke tulang.',
    created_at: '2026-07-20T09:00:00.000Z',
  },
];

const INITIAL_LAPORAN_TRAINER: LaporanTrainerOutlet[] = [
  {
    id: 'lap-1',
    nomor_laporan: 'LP-TRN/2026/08/001',
    kode_outlet: 'HC-JTS01',
    trainer_nama: 'Haikal Abi',
    periode_awal: '2026-08-10',
    periode_akhir: '2026-08-20',
    jenis_kegiatan: 'Pendampingan & OJT Standarisasi Kru Baru',
    total_trainee: 2,
    ringkasan_perbantuan: 'Pendampingan 2 kru baru (Budi Santoso & Siti Rahmawati) selesai dengan hasil memuaskan. Keduanya lulus dan siap bertugas mandiri.',
    daftar_trainee: [
      {
        nama_kru: 'Budi Santoso',
        jabatan: 'Senior Cook & Fryer Specialist',
        divisi: 'Kitchen',
        sop_fokus: 'Standar Penggorengan Ayam Crispy & Suhu Minyak (170°C)',
        skor_akhir: 92,
        status_ojt: 'Lulus / Mandiri',
        catatan: 'Menguasai penggorengan suhu 170°C secara mandiri.',
      },
      {
        nama_kru: 'Siti Rahmawati',
        jabatan: 'Senior Cashier & Front Liner',
        divisi: 'Kasir',
        sop_fokus: 'SOP 5S Greeting, Transaksi POS & Upselling',
        skor_akhir: 95,
        status_ojt: 'Lulus / Mandiri',
        catatan: 'Speed of service cepat dan ramah.',
      },
    ],
    kendala_outlet: 'Filter minyak fryer cadangan sempat terlambat datang pada hari ke-3.',
    rekomendasi_kepala_outlet: 'Pertahankan briefing pagi kalibrasi termometer minyak pukul 09.30 WIB.',
    skor_rata_rata: 93.5,
    status: 'Final',
    created_at: '2026-08-20T17:00:00.000Z',
  },
];

const INITIAL_OJT_MONITORING: OJTCrewMonitoringRecord[] = [
  {
    id: 'ojt-1',
    kru_id: 'kru-budi',
    nama_kru: 'Budi Santoso',
    kode_outlet: 'HC-JTS01',
    nama_outlet: 'Hara Chicken Jatiasih',
    divisi: 'Kitchen',
    tanggal_mulai: '2026-08-01',
    target_kelulusan: '2026-08-31',
    hari_berjalan: 28,
    minggu_aktif: 4,
    status_keseluruhan: 'Kritis / Remedial',
    progres_persen: 75,
    mentor_nama: 'Haikal Abi (Lead Trainer)',
    skor_komposit_ojt: 76.8,
    breakdown_skor: {
      skor_harian: 80,
      skor_gates: 77.1,
      skor_teori: 75,
      skor_sikap: 82,
      rumus_kalkulasi: '(80 × 0.25) + (77.1 × 0.40) + (75 × 0.20) + (82 × 0.15) = 76.8'
    },
    catatan_remedial_aktif: 'Terkunci Remedial Terbimbing: Deviasi Kritis Suhu Fryer <165°C dan Core Temp <74°C pada Gate 3.',
    evaluasi_gates: {
      gate_1_day_7: {
        id: 'gate-budi-1',
        kru_id: 'kru-budi',
        nama_kru: 'Budi Santoso',
        kode_outlet: 'HC-JTS01',
        gate_stage: 'GATE_1_DAY_7',
        hari_ke: 7,
        tanggal_evaluasi: '2026-08-07',
        evaluator_nama: 'Haikal Abi',
        evaluator_role: 'Trainer',
        skor_teori: 85,
        skor_praktik: 80,
        skor_kepatuhan_sop: 82,
        skor_budaya_hara: 88,
        skor_akhir: 83.5,
        status: 'LULUS_BERSYARAT',
        deviasi_kritis_ditemukan: [],
        catatan_evaluasi: 'Memahami visi misi dan budaya HARA. Penampilan rapi, cuci tangan 6 langkah sesuai standar.',
      },
      gate_2_day_14: {
        id: 'gate-budi-2',
        kru_id: 'kru-budi',
        nama_kru: 'Budi Santoso',
        kode_outlet: 'HC-JTS01',
        gate_stage: 'GATE_2_DAY_14',
        hari_ke: 14,
        tanggal_evaluasi: '2026-08-14',
        evaluator_nama: 'Haikal Abi',
        evaluator_role: 'Trainer',
        skor_teori: 80,
        skor_praktik: 76,
        skor_kepatuhan_sop: 78,
        skor_budaya_hara: 85,
        skor_akhir: 79.2,
        status: 'LULUS_BERSYARAT',
        deviasi_kritis_ditemukan: ['Thawing ayam sempat kurang 15 menit'],
        catatan_evaluasi: 'Rotasi FIFO cukup baik, namun perlu pengawasan thawing agar tidak terburu-buru.',
      },
      gate_3_day_21: {
        id: 'gate-budi-3',
        kru_id: 'kru-budi',
        nama_kru: 'Budi Santoso',
        kode_outlet: 'HC-JTS01',
        gate_stage: 'GATE_3_DAY_21',
        hari_ke: 21,
        tanggal_evaluasi: '2026-08-21',
        evaluator_nama: 'Haikal Abi',
        evaluator_role: 'Trainer',
        skor_teori: 70,
        skor_praktik: 62,
        skor_kepatuhan_sop: 65,
        skor_budaya_hara: 80,
        skor_akhir: 68.5,
        status: 'REMEDIAL_TERBIMBING',
        deviasi_kritis_ditemukan: [
          'Suhu fryer anjlok ke 160°C saat dropping 8 potong sekaligus',
          'Penepungan terlalu ditekan sehingga lapisan tepung keras',
          'Core temperature ayam matang 71°C (< 74°C standar Food Safety)'
        ],
        catatan_evaluasi: 'Gagal Gate 3 Stasiun Kitchen. DILARANG solo shift atau diajukan promosi! Wajib remedial 7 hari di stasiun fryer.',
        tindakan_remedial: 'Pelatihan intensif kalibrasi thermostat fryer 170°C, teknik penepungan 10x cubit lembut tanpa gumpalan, dan verifikasi probe thermometer sebelum saji.',
      },
    },
    tasks_harian: [
      {
        hari_ke: 1,
        minggu_ke: 1,
        modul_nama: 'Orientasi & Budaya HARA',
        fokus_stasiun: 'Helper',
        poin_checklist: [
          { id: 't-1-1', deskripsi: 'Hafal Visi, Misi & 4 Nilai H.A.R.A (Halal, Amanah, Responsif, Adaptif)', referensi_sop: 'SOP-CORP-01', is_kritis: true, selesai: true, diverifikasi_oleh: 'Haikal Abi' },
          { id: 't-1-2', deskripsi: 'Praktek 6 langkah cuci tangan dengan sabun antibakteri 20 detik', referensi_sop: 'SOP-HYG-01', is_kritis: true, selesai: true, diverifikasi_oleh: 'Haikal Abi' },
          { id: 't-1-3', deskripsi: 'Standar Grooming & Seragam Bersih (Apron, Hairnet, Sepatu Karet)', referensi_sop: 'SOP-HYG-02', is_kritis: false, selesai: true, diverifikasi_oleh: 'Haikal Abi' }
        ],
        status: 'Selesai Diverifikasi'
      },
      {
        hari_ke: 21,
        minggu_ke: 3,
        modul_nama: 'Stasiun Fryer & Suhu Presisi 170°C',
        fokus_stasiun: 'Kitchen',
        poin_checklist: [
          { id: 't-21-1', deskripsi: 'Cek suhu digital fryer stabil di 165°C - 170°C sebelum memasukkan ayam', referensi_sop: 'SOP-KT-02', is_kritis: true, selesai: false },
          { id: 't-21-2', deskripsi: 'Teknik penepungan 10x putar cubit lembut tanpa menekan adonan', referensi_sop: 'SOP-KT-01', is_kritis: true, selesai: false },
          { id: 't-21-3', deskripsi: 'Ukur core temperature ayam matang minimal 74°C dengan probe bersih', referensi_sop: 'SOP-FS-01', is_kritis: true, selesai: false }
        ],
        status: 'Sedang Berjalan'
      }
    ]
  },
  {
    id: 'ojt-2',
    kru_id: 'kru-ahmad',
    nama_kru: 'Ahmad Fauzi',
    kode_outlet: 'HC-JTS01',
    nama_outlet: 'Hara Chicken Jatiasih',
    divisi: 'Kitchen',
    tanggal_mulai: '2026-08-05',
    target_kelulusan: '2026-09-04',
    hari_berjalan: 24,
    minggu_aktif: 4,
    status_keseluruhan: 'On-Track',
    progres_persen: 88,
    mentor_nama: 'Haikal Abi (Lead Trainer)',
    skor_komposit_ojt: 91.5,
    breakdown_skor: {
      skor_harian: 92,
      skor_gates: 91.0,
      skor_teori: 90,
      skor_sikap: 93,
      rumus_kalkulasi: '(92 × 0.25) + (91.0 × 0.40) + (90 × 0.20) + (93 × 0.15) = 91.5'
    },
    evaluasi_gates: {
      gate_1_day_7: {
        id: 'gate-af-1',
        kru_id: 'kru-ahmad',
        nama_kru: 'Ahmad Fauzi',
        kode_outlet: 'HC-JTS01',
        gate_stage: 'GATE_1_DAY_7',
        hari_ke: 7,
        tanggal_evaluasi: '2026-08-12',
        evaluator_nama: 'Haikal Abi',
        evaluator_role: 'Trainer',
        skor_teori: 95,
        skor_praktik: 90,
        skor_kepatuhan_sop: 92,
        skor_budaya_hara: 94,
        skor_akhir: 92.5,
        status: 'LULUS_MANDIRI',
        deviasi_kritis_ditemukan: [],
        catatan_evaluasi: 'Disiplin tinggi, teknik penggorengan sangat rapi dan higienis.',
      },
      gate_2_day_14: {
        id: 'gate-af-2',
        kru_id: 'kru-ahmad',
        nama_kru: 'Ahmad Fauzi',
        kode_outlet: 'HC-JTS01',
        gate_stage: 'GATE_2_DAY_14',
        hari_ke: 14,
        tanggal_evaluasi: '2026-08-19',
        evaluator_nama: 'Haikal Abi',
        evaluator_role: 'Trainer',
        skor_teori: 92,
        skor_praktik: 89,
        skor_kepatuhan_sop: 90,
        skor_budaya_hara: 91,
        skor_akhir: 90.3,
        status: 'LULUS_MANDIRI',
        deviasi_kritis_ditemukan: [],
        catatan_evaluasi: 'Rotasi FIFO dan sanitasi area helper sangat bersih.',
      },
      gate_3_day_21: {
        id: 'gate-af-3',
        kru_id: 'kru-ahmad',
        nama_kru: 'Ahmad Fauzi',
        kode_outlet: 'HC-JTS01',
        gate_stage: 'GATE_3_DAY_21',
        hari_ke: 21,
        tanggal_evaluasi: '2026-08-26',
        evaluator_nama: 'Haikal Abi',
        evaluator_role: 'Trainer',
        skor_teori: 88,
        skor_praktik: 91,
        skor_kepatuhan_sop: 89,
        skor_budaya_hara: 93,
        skor_akhir: 90.2,
        status: 'LULUS_MANDIRI',
        deviasi_kritis_ditemukan: [],
        catatan_evaluasi: 'Teknik penggorengan matang sempurna, krispi renyah, suhu 170°C terjaga.',
      },
    },
    tasks_harian: []
  },
  {
    id: 'ojt-3',
    kru_id: 'kru-siti',
    nama_kru: 'Siti Rahmawati',
    kode_outlet: 'HC-BTL01',
    nama_outlet: 'Hara Chicken Bantul',
    divisi: 'Kasir',
    tanggal_mulai: '2026-08-10',
    target_kelulusan: '2026-09-09',
    hari_berjalan: 18,
    minggu_aktif: 3,
    status_keseluruhan: 'On-Track',
    progres_persen: 70,
    mentor_nama: 'Dewi Lestari (Kepala Outlet)',
    skor_komposit_ojt: 92.4,
    breakdown_skor: {
      skor_harian: 94,
      skor_gates: 92.2,
      skor_teori: 92,
      skor_sikap: 95,
      rumus_kalkulasi: '(94 × 0.25) + (92.2 × 0.40) + (92 × 0.20) + (95 × 0.15) = 92.4'
    },
    evaluasi_gates: {
      gate_1_day_7: {
        id: 'gate-sr-1',
        kru_id: 'kru-siti',
        nama_kru: 'Siti Rahmawati',
        kode_outlet: 'HC-BTL01',
        gate_stage: 'GATE_1_DAY_7',
        hari_ke: 7,
        tanggal_evaluasi: '2026-08-17',
        evaluator_nama: 'Dewi Lestari',
        evaluator_role: 'Kepala Outlet',
        skor_teori: 94,
        skor_praktik: 92,
        skor_kepatuhan_sop: 95,
        skor_budaya_hara: 96,
        skor_akhir: 94.1,
        status: 'LULUS_MANDIRI',
        deviasi_kritis_ditemukan: [],
        catatan_evaluasi: 'Sopan santun 5S ramah, greeting alami dan menyenangkan pelanggan.',
      },
      gate_2_day_14: {
        id: 'gate-sr-2',
        kru_id: 'kru-siti',
        nama_kru: 'Siti Rahmawati',
        kode_outlet: 'HC-BTL01',
        gate_stage: 'GATE_2_DAY_14',
        hari_ke: 14,
        tanggal_evaluasi: '2026-08-24',
        evaluator_nama: 'Dewi Lestari',
        evaluator_role: 'Kepala Outlet',
        skor_teori: 90,
        skor_praktik: 88,
        skor_kepatuhan_sop: 91,
        skor_budaya_hara: 93,
        skor_akhir: 90.3,
        status: 'LULUS_MANDIRI',
        deviasi_kritis_ditemukan: [],
        catatan_evaluasi: 'Kecepatan transaksi kasir 42 detik, closing kas klop 100%.',
      },
    },
    tasks_harian: []
  },
  {
    id: 'ojt-4',
    kru_id: 'kru-rizky',
    nama_kru: 'Rizky Pratama',
    kode_outlet: 'HC-MLG01',
    nama_outlet: 'Hara Chicken Malang',
    divisi: 'Helper',
    tanggal_mulai: '2026-08-20',
    target_kelulusan: '2026-09-19',
    hari_berjalan: 9,
    minggu_aktif: 2,
    status_keseluruhan: 'Butuh Pendampingan',
    progres_persen: 35,
    mentor_nama: 'Fajar Nugroho (Kepala Outlet)',
    skor_komposit_ojt: 79.2,
    breakdown_skor: {
      skor_harian: 78,
      skor_gates: 77.2,
      skor_teori: 80,
      skor_sikap: 82,
      rumus_kalkulasi: '(78 × 0.25) + (77.2 × 0.40) + (80 × 0.20) + (82 × 0.15) = 78.8'
    },
    catatan_remedial_aktif: 'Perlu pendampingan: Kerap lupa label expiry date wadah marinasi ayam.',
    evaluasi_gates: {
      gate_1_day_7: {
        id: 'gate-rp-1',
        kru_id: 'kru-rizky',
        nama_kru: 'Rizky Pratama',
        kode_outlet: 'HC-MLG01',
        gate_stage: 'GATE_1_DAY_7',
        hari_ke: 7,
        tanggal_evaluasi: '2026-08-27',
        evaluator_nama: 'Fajar Nugroho',
        evaluator_role: 'Kepala Outlet',
        skor_teori: 78,
        skor_praktik: 75,
        skor_kepatuhan_sop: 76,
        skor_budaya_hara: 82,
        skor_akhir: 77.2,
        status: 'LULUS_BERSYARAT',
        deviasi_kritis_ditemukan: ['Kerap lupa label expiry date pada wadah marinasi'],
        catatan_evaluasi: 'Cepat bekerja namun perlu teliti pada date tagging bumbu marinasi.',
      },
    },
    tasks_harian: []
  },
  {
    id: 'ojt-5',
    kru_id: 'kru-dewi',
    nama_kru: 'Dewi Anggraini',
    kode_outlet: 'HC-SBY01',
    nama_outlet: 'Hara Chicken Rungkut',
    divisi: 'Geprek',
    tanggal_mulai: '2026-07-28',
    target_kelulusan: '2026-08-27',
    hari_berjalan: 30,
    minggu_aktif: 4,
    status_keseluruhan: 'Lulus Bersertifikat',
    progres_persen: 100,
    mentor_nama: 'Siti Sarah (Trainer)',
    skor_komposit_ojt: 94.6,
    breakdown_skor: {
      skor_harian: 95,
      skor_gates: 95.2,
      skor_teori: 94,
      skor_sikap: 96,
      rumus_kalkulasi: '(95 × 0.25) + (95.2 × 0.40) + (94 × 0.20) + (96 × 0.15) = 95.0'
    },
    evaluasi_gates: {
      gate_1_day_7: {
        id: 'gate-da-1',
        kru_id: 'kru-dewi',
        nama_kru: 'Dewi Anggraini',
        kode_outlet: 'HC-SBY01',
        gate_stage: 'GATE_1_DAY_7',
        hari_ke: 7,
        tanggal_evaluasi: '2026-08-04',
        evaluator_nama: 'Siti Sarah',
        evaluator_role: 'Trainer',
        skor_teori: 92,
        skor_praktik: 95,
        skor_kepatuhan_sop: 94,
        skor_budaya_hara: 95,
        skor_akhir: 94.2,
        status: 'LULUS_MANDIRI',
        deviasi_kritis_ditemukan: [],
        catatan_evaluasi: 'Dasar food safety dan budaya HARA sangat bagus.',
      },
      gate_4_day_30: {
        id: 'gate-da-4',
        kru_id: 'kru-dewi',
        nama_kru: 'Dewi Anggraini',
        kode_outlet: 'HC-SBY01',
        gate_stage: 'GATE_4_DAY_30',
        hari_ke: 30,
        tanggal_evaluasi: '2026-08-27',
        evaluator_nama: 'Siti Sarah',
        evaluator_role: 'Trainer',
        skor_teori: 96,
        skor_praktik: 95,
        skor_kepatuhan_sop: 96,
        skor_budaya_hara: 98,
        skor_akhir: 96.1,
        status: 'LULUS_MANDIRI',
        deviasi_kritis_ditemukan: [],
        catatan_evaluasi: 'Lulus komprehensif Gate 4 dengan predikat A+. Mahir geprek takaran 25g, speed 28 detik, siap solo shift!',
      },
    },
    tasks_harian: []
  }
];

const INITIAL_SETTINGS: SystemSettings = {
  email_penerima: 'haikal@harachicken.com',
  notif_prioritas_tinggi: 'Ya',
  ambang_pola_berulang: 3,
  hari_pola_berulang: 30,
  nama_perusahaan: 'HARA TRAINING & OPERATIONS',
  lead_trainer: 'Haikal Abi (Trainer Operasional)',
};

// Generic Database Engine
class StorageDatabase {
  private listeners: Map<string, Set<() => void>> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;
    this.ensureSeed(STORAGE_KEYS.OUTLETS, INITIAL_OUTLETS);
    this.ensureSeed(STORAGE_KEYS.KRU, INITIAL_KRU);
    this.ensureSeed(STORAGE_KEYS.BANK_SOP, INITIAL_BANK_SOP, true);
    this.ensureSeed(STORAGE_KEYS.BANK_SOAL, INITIAL_BANK_SOAL, true);
    this.ensureSeed(STORAGE_KEYS.TNA, INITIAL_TNA);
    this.ensureSeed(STORAGE_KEYS.RENCANA_TRAINING, INITIAL_RENCANA_TRAINING);
    this.ensureSeed(STORAGE_KEYS.OBSERVASI, INITIAL_OBSERVASI);
    this.ensureSeed(STORAGE_KEYS.COACHING, INITIAL_COACHING);
    this.ensureSeed(STORAGE_KEYS.GAP_ANALYSIS, INITIAL_GAP_ANALYSIS);
    this.ensureSeed(STORAGE_KEYS.KARTU_KELUHAN, INITIAL_KARTU_KELUHAN);
    this.ensureSeed(STORAGE_KEYS.TALENT, INITIAL_TALENT);
    this.ensureSeed(STORAGE_KEYS.PENILAIAN_TEORI, INITIAL_PENILAIAN_TEORI);
    this.ensureSeed(STORAGE_KEYS.PENILAIAN_PRAKTIK, INITIAL_PENILAIAN_PRAKTIK);
    this.ensureSeed(STORAGE_KEYS.PENILAIAN_LISAN, INITIAL_PENILAIAN_LISAN);
    this.ensureSeed(STORAGE_KEYS.PENUGASAN_TRAINER, INITIAL_PENUGASAN_TRAINER);
    this.ensureSeed(STORAGE_KEYS.TRAINEE_OUTLET, INITIAL_TRAINEE_OUTLET);
    this.ensureSeed(STORAGE_KEYS.LAPORAN_TRAINER, INITIAL_LAPORAN_TRAINER);
    this.ensureSeed(STORAGE_KEYS.ONBOARDING_PROGRESS, INITIAL_ONBOARDING_PROGRESS);
    this.ensureSeed(STORAGE_KEYS.OFFICIAL_AUDITS, [OFFICIAL_HARA_AUDIT_BANTUL], true);
    this.ensureSeed(STORAGE_KEYS.OFFICIAL_RAPOR_KRU, OFFICIAL_HARA_CREW_REPORTS, true);
    this.ensureSeed(STORAGE_KEYS.ONBOARDING_BATCHES, INITIAL_ONBOARDING_BATCHES, true);
    this.ensureSeed(STORAGE_KEYS.OJT_MONITORING, INITIAL_OJT_MONITORING, true);
    this.ensureSeed(STORAGE_KEYS.ATTITUDE_HARA, INITIAL_ATTITUDE_HARA, true);
    this.ensureSeed(STORAGE_KEYS.APP_USERS, INITIAL_USERS);
    this.ensureSeed(STORAGE_KEYS.LOG_AKTIVITAS, INITIAL_LOGS);
    this.ensureSeed(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    // Migrate old settings if needed
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings && (storedSettings.includes('People') || storedSettings.includes('HARA DEVELOPMENT'))) {
        const parsed = JSON.parse(storedSettings);
        parsed.lead_trainer = 'Haikal Abi (Trainer Operasional)';
        parsed.nama_perusahaan = 'HARA TRAINING & OPERATIONS';
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u && u.nama === 'Haikal Abi' && u.role === 'Admin') {
          u.role = 'Trainer';
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(u));
        }
      }
    } catch {
      // ignore
    }
    this.ensureSeed(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  private ensureSeed<T>(key: string, defaultData: T, autoUpgradeIfFewer: boolean = false) {
    try {
      const existing = localStorage.getItem(key);
      if (!existing) {
        localStorage.setItem(key, JSON.stringify(defaultData));
      } else if (autoUpgradeIfFewer && Array.isArray(defaultData)) {
        try {
          const parsed = JSON.parse(existing);
          const defaultArr = defaultData as any[];
          const isBankSop = key === STORAGE_KEYS.BANK_SOP;
          const missingDivisions =
            isBankSop &&
            Array.isArray(parsed) &&
            (!parsed.some((s: any) => s.divisi === 'Kasir') ||
              !parsed.some((s: any) => s.divisi === 'Geprek') ||
              !parsed.some((s: any) => s.divisi === 'Helper') ||
              !parsed.some((s: any) => s.divisi === 'Kitchen'));

          if (Array.isArray(parsed) && (parsed.length < defaultArr.length || missingDivisions)) {
            localStorage.setItem(key, JSON.stringify(defaultData));
          }
        } catch {
          localStorage.setItem(key, JSON.stringify(defaultData));
        }
      }
    } catch {
      // ignore
    }
  }

  public subscribe(key: string, callback: () => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  private notify(key: string) {
    // Defer listener execution to microtask/macrotask so React renders complete cleanly
    setTimeout(() => {
      const specific = this.listeners.get(key);
      if (specific) {
        specific.forEach((cb) => {
          try {
            cb();
          } catch (err) {
            console.error('Storage listener error:', err);
          }
        });
      }
      const wildcard = this.listeners.get('*');
      if (wildcard) {
        wildcard.forEach((cb) => {
          try {
            cb();
          } catch (err) {
            console.error('Storage listener error (*):', err);
          }
        });
      }
    }, 0);
  }

  public get<T>(key: string, fallback: T): T {
    try {
      const val = localStorage.getItem(key);
      if (!val) return fallback;
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }

  public set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      this.notify(key);
    } catch {
      // ignore
    }
  }

  // Activity Log creation
  public addLog(aksi: 'TAMBAH' | 'UBAH' | 'HAPUS', tabel: string, detail: string) {
    const user = this.getCurrentUser();
    const logs = this.get<LogAktivitas[]>(STORAGE_KEYS.LOG_AKTIVITAS, []);
    const newLog: LogAktivitas = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      user_nama: user ? user.nama : 'System',
      aksi,
      tabel,
      detail,
      created_at: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.LOG_AKTIVITAS, [newLog, ...logs.slice(0, 49)]);

    // Async write to Firestore audit logs collection
    import('./firebase').then(({ firestore }) => {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(firestore, 'logs', newLog.id), newLog, { merge: true }).catch(() => {});
      });
    }).catch(() => {});
  }

  // Current User & Session
  public getCurrentUser(): AppUser {
    return this.get<AppUser>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  public setCurrentUser(user: AppUser) {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
    this.set(STORAGE_KEYS.AUTH_STATE, true);
  }

  public isLoggedIn(): boolean {
    return this.get<boolean>(STORAGE_KEYS.AUTH_STATE, false);
  }

  public setLoggedIn(status: boolean): void {
    this.set(STORAGE_KEYS.AUTH_STATE, status);
  }

  public logout(): void {
    const user = this.getCurrentUser();
    this.addLog('UBAH', 'Autentikasi', `User ${user ? user.nama : 'Unknown'} telah logout dari sistem.`);
    this.set(STORAGE_KEYS.AUTH_STATE, false);
  }

  // Generic CRUD Helper for tables
  public getTable<T>(tableName: string): T[] {
    const key = this.mapKey(tableName);
    const data = this.get<T[]>(key, []);
    if (tableName === 'bank_sop') {
      const arr = data as any[];
      const missingDivisions =
        !arr.some((s) => s.divisi === 'Kasir') ||
        !arr.some((s) => s.divisi === 'Geprek') ||
        !arr.some((s) => s.divisi === 'Helper') ||
        !arr.some((s) => s.divisi === 'Kitchen');
      if (arr.length < OFFICIAL_HARA_SOP_DATABASE.length || missingDivisions) {
        this.set(key, OFFICIAL_HARA_SOP_DATABASE as any);
        return OFFICIAL_HARA_SOP_DATABASE as any;
      }
    }
    if (tableName === 'bank_soal') {
      const arr = data as any[];
      const missingDivisions =
        !arr.some((s) => s.divisi === 'Kasir') ||
        !arr.some((s) => s.divisi === 'Geprek') ||
        !arr.some((s) => s.divisi === 'Helper') ||
        !arr.some((s) => s.divisi === 'Kitchen');
      if (arr.length < OFFICIAL_HARA_BANK_SOAL.length || missingDivisions) {
        this.set(key, OFFICIAL_HARA_BANK_SOAL as any);
        return OFFICIAL_HARA_BANK_SOAL as any;
      }
    }
    return data;
  }

  public setDirect(tableName: string, data: any[]): void {
    const key = this.mapKey(tableName);
    this.set(key, data);
  }

  public insertRow<T = any>(tableName: string, payload: any): T {
    const key = this.mapKey(tableName);
    const list = this.get<any[]>(key, []);
    const id = (tableName.slice(0, 3) + '-' + Date.now()).toLowerCase();
    const newRow = {
      ...payload,
      id,
      created_at: new Date().toISOString(),
    };

    // Relasi Kru & Outlet Normalization: Cari & tautkan kru_id tervalidasi jika nama_kru ada
    if (newRow.nama_kru && !newRow.kru_id) {
      const allKru = this.getTable<Kru>('kru');
      const matchedKru = allKru.find(
        (k) =>
          k.nama_kru.toLowerCase().trim() === newRow.nama_kru.toLowerCase().trim() &&
          (!newRow.kode_outlet || newRow.kode_outlet === 'ALL' || k.kode_outlet === newRow.kode_outlet)
      ) || allKru.find((k) => k.nama_kru.toLowerCase().trim() === newRow.nama_kru.toLowerCase().trim());

      if (matchedKru) {
        newRow.kru_id = matchedKru.id;
        if (!newRow.kode_outlet || newRow.kode_outlet === 'ALL') {
          newRow.kode_outlet = matchedKru.kode_outlet;
        }
      }
    }
    
    // Auto Gap Calculation if table is gap_analysis
    if (tableName === 'gap_analysis' || tableName === 'gap') {
      const skorStd = Number((newRow as any).skor_standar) || 3;
      const skorAkt = Number((newRow as any).skor_aktual) || 1;
      (newRow as any).gap_score = Number((skorStd - skorAkt).toFixed(2));
    }

    this.set(key, [newRow, ...list]);
    this.addLog('TAMBAH', this.friendlyTableName(tableName), `Menambahkan data baru di ${tableName}: ${JSON.stringify(payload).slice(0, 60)}...`);

    // Async write to Firestore so database is populated online
    import('./firebase').then(({ firestore }) => {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(firestore, tableName, id), newRow, { merge: true }).catch(() => {});
      });
    }).catch(() => {});

    return newRow as unknown as T;
  }

  /**
   * Auto-Trigger Remedial & TNA (Closed-Loop Workflow):
   * Saat kru menyelesaikan ujian di UjianKruPublicView atau dinilai di PelatihanEvaluasiView
   * dengan skor < 75, otomatis buat entri di tabel tna, gap_analysis, dan draft di coaching_log.
   */
  public triggerAutoRemedialAndTNA(data: {
    nama_kru: string;
    kru_id?: string;
    kode_outlet: string;
    divisi: Division;
    skor: number;
    topikSalah?: string[];
    sumberTemuan: string;
    catatan?: string;
  }) {
    const allKru = this.getTable<Kru>('kru');
    const matchedKru = allKru.find(
      (k) => (data.kru_id && k.id === data.kru_id) || k.nama_kru.toLowerCase().trim() === data.nama_kru.toLowerCase().trim()
    );
    const kruId = matchedKru?.id || data.kru_id || ('kru-' + Date.now());
    const outletCode = data.kode_outlet !== 'ALL' && data.kode_outlet ? data.kode_outlet : (matchedKru?.kode_outlet || 'HC-JTS01');
    const topTopic = data.topikSalah && data.topikSalah.length > 0
      ? data.topikSalah.join(', ')
      : 'SOP Penggorengan 160°C & Pemahaman Titik Kritis Stasiun';

    // 1. Buat entri TNA
    const tnaEntry: Partial<TNA> = {
      tanggal: new Date().toISOString().slice(0, 10),
      kode_outlet: outletCode,
      divisi: data.divisi || matchedKru?.divisi || 'Kitchen',
      sumber_temuan: data.sumberTemuan,
      deskripsi_gap: `Kru ${data.nama_kru} memperoleh skor ${data.skor}/100 (< KKM 75). Perlu remedial pada: ${topTopic}`,
      jenis_gap: data.skor < 60 ? 'Keterampilan' : 'Pengetahuan',
      prioritas: data.skor < 60 ? 'Tinggi' : 'Sedang',
      rencana_tindak_lanjut: `Sesi retraining intensif & coaching 1-on-1 materi ${topTopic}. Target evaluasi remedial 7 hari.`,
      status: 'Belum',
    };
    this.insertRow('tna', tnaEntry);

    // 2. Buat entri Gap Analysis
    const gapEntry: Partial<GapAnalysis> = {
      nama_kru: data.nama_kru,
      divisi: data.divisi || matchedKru?.divisi || 'Kitchen',
      kode_outlet: outletCode,
      kompetensi_dinilai: `Standar Kompetensi ${data.divisi || 'Stasiun'} (${topTopic.slice(0, 45)})`,
      skor_standar: 75,
      skor_aktual: data.skor,
      gap_score: Number((75 - data.skor).toFixed(1)),
      rekomendasi: `Pendampingan fokus pada materi ${topTopic} dan review panduan SOP sebelum shift.`,
    };
    this.insertRow('gap_analysis', gapEntry);

    // 3. Buat draft jadwal coaching_log (GROW)
    const coachingEntry: Partial<CoachingLog> = {
      tanggal: new Date().toISOString().slice(0, 10),
      kode_outlet: outletCode,
      nama_kru: data.nama_kru,
      goal: `Mencapai standar kelulusan KKM ≥ 75 pada stasiun ${data.divisi || 'Kerja'}`,
      reality: `Hasil evaluasi saat ini ${data.skor}/100. Kendala pemahaman pada: ${topTopic}`,
      options: `1) Demonstrasi langsung oleh trainer; 2) Micro-learning SOP 15 menit; 3) Evaluasi remedial`,
      will: `Kru berkomitmen mendalami SOP dan siap mengikuti ujian remedial ulang dalam 7 hari`,
      hasil_follow_up: 'Draft Terjadwal Otomatis (Closed-Loop Workflow)',
    };
    this.insertRow('coaching_log', coachingEntry);

    this.addLog(
      'TAMBAH',
      'Integrasi Closed-Loop',
      `Auto-trigger Remedial & TNA untuk ${data.nama_kru} (Skor ${data.skor}/100 di ${outletCode})`
    );
  }

  public updateRow<T = any>(tableName: string, id: string, payload: any): boolean {
    const key = this.mapKey(tableName);
    const list = this.get<any[]>(key, []);
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    const updated = {
      ...list[idx],
      ...payload,
      updated_at: new Date().toISOString(),
    };

    // Auto compute gap score
    if (tableName === 'gap_analysis' || tableName === 'gap') {
      const skorStd = Number(updated.skor_standar) || 3;
      const skorAkt = Number(updated.skor_aktual) || 1;
      updated.gap_score = Number((skorStd - skorAkt).toFixed(2));
    }

    list[idx] = updated;
    this.set(key, list);
    this.addLog('UBAH', this.friendlyTableName(tableName), `Memperbarui data ID ${id}`);

    // Async write to Firestore
    import('./firebase').then(({ firestore }) => {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(firestore, tableName, id), updated, { merge: true }).catch(() => {});
      });
    }).catch(() => {});

    return true;
  }

  public deleteRow(tableName: string, id: string): boolean {
    const key = this.mapKey(tableName);
    const list = this.get<any[]>(key, []);
    const filtered = list.filter((item) => item.id !== id);
    if (filtered.length === list.length) return false;
    this.set(key, filtered);
    this.addLog('HAPUS', this.friendlyTableName(tableName), `Menghapus data ID ${id}`);

    // Async delete from Firestore
    import('./firebase').then(({ firestore }) => {
      import('firebase/firestore').then(({ doc, deleteDoc }) => {
        deleteDoc(doc(firestore, tableName, id)).catch(() => {});
      });
    }).catch(() => {});

    return true;
  }

  // Recurring Pattern Check
  public checkRecurringPattern(kode_outlet: string, divisi: string): { isRecurring: boolean; count: number } {
    const settings = this.get<SystemSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
    const tnaList = this.getTable<TNA>('tna');
    const thresholdDays = settings.hari_pola_berulang || 30;
    const thresholdCount = settings.ambang_pola_berulang || 3;
    const cutoff = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000).toISOString();

    const matches = tnaList.filter(
      (item) => item.kode_outlet === kode_outlet && item.divisi === divisi && item.created_at >= cutoff
    );

    return {
      isRecurring: matches.length >= thresholdCount,
      count: matches.length,
    };
  }

  // Calculate Crew Competencies (Objective 360 Triangulation & Data Science)
  public getCrewCompetencySummaries(): CrewCompetencySummary[] {
    const kruList = this.getTable<Kru>('kru').filter((k) => k.status_aktif === 'Aktif');
    const teoriList = this.getTable<PenilaianTeori>('penilaian_teori');
    const praktikList = this.getTable<PenilaianPraktik>('penilaian_praktik');
    const lisanList = this.getTable<PenilaianLisan>('penilaian_lisan');
    const observasiList = this.getTable<ObservasiLapangan>('observasi_lapangan');
    const coachingList = this.getTable<CoachingLog>('coaching_log');

    const hasil: CrewCompetencySummary[] = [];

    for (const k of kruList) {
      const nama = k.nama_kru;
      const kTeori = teoriList
        .filter((t) => t.nama_kru === nama)
        .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      const kPraktik = praktikList
        .filter((p) => p.nama_kru === nama)
        .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      const kLisan = lisanList
        .filter((l) => l.nama_kru === nama)
        .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
      const kAudit = observasiList
        .filter((o) => o.nama_kru === nama);
      const kCoaching = coachingList.filter((c) => c.nama_kru === nama);

      const avg = (arr: number[]) => {
        if (!arr.length) return null;
        const top3 = arr.slice(0, 3);
        return Math.round(top3.reduce((a, b) => a + b, 0) / top3.length);
      };

      const sTeori = avg(kTeori.map((x) => x.skor));
      const sPraktik = avg(kPraktik.map((x) => x.skor_akhir));
      const sLisan = avg(kLisan.map((x) => x.skor));
      
      const sAudit = avg(
        kAudit.map((o) => (o.hasil === 'Sesuai Standar' ? 100 : o.hasil === 'Perlu Perbaikan' ? 70 : 40))
      );

      // Data Science Objective Weighted Index 4 Pilar Baku Resmi
      // Teori: 20% | Praktik SOS: 40% | Lisan HACCP: 15% | Sikap H.A.R.A: 25%
      const attList = this.getTable<AuditAttitudeHara>('attitude_hara').filter((a) => a.nama_kru === nama);
      const latestAtt = attList[0];
      const sAttitudeHara = latestAtt ? latestAtt.skor_rata_rata : (sAudit !== null ? sAudit : 82);

      const bobot: { skor: number; b: number }[] = [];
      if (sTeori !== null) bobot.push({ skor: sTeori, b: 0.20 });
      if (sPraktik !== null) bobot.push({ skor: sPraktik, b: 0.40 });
      if (sLisan !== null) bobot.push({ skor: sLisan, b: 0.15 });
      bobot.push({ skor: sAttitudeHara, b: 0.25 });

      let skorAkhir: number | null = null;
      if (bobot.length > 0) {
        const totalB = bobot.reduce((acc, curr) => acc + curr.b, 0);
        skorAkhir = Math.round(bobot.reduce((acc, curr) => acc + curr.skor * curr.b, 0) / totalB);
      }

      let badge: CompetencyBadge = 'Belum Ada Data';
      let statusKelulusan: 'LULUS' | 'BELUM LULUS' = 'BELUM LULUS';
      if (skorAkhir !== null) {
        if (skorAkhir >= 85) {
          badge = 'Mahir';
          statusKelulusan = 'LULUS';
        } else if (skorAkhir >= 75) {
          badge = 'Terampil';
          statusKelulusan = 'LULUS';
        } else {
          badge = 'Pemula';
          statusKelulusan = 'BELUM LULUS';
        }
      }

      const skorKnowledge = (sTeori !== null && sLisan !== null)
        ? Math.round(sTeori * 0.55 + sLisan * 0.45)
        : sTeori !== null ? sTeori : sLisan !== null ? sLisan : 75;

      const skorSkill = sPraktik !== null ? sPraktik : 75;
      const skorAttitude = Math.round(sAttitudeHara);

      const attitudeDetail = latestAtt ? {
        h_higienis: latestAtt.skor_h_higienis,
        a_antusias: latestAtt.skor_a_antusias,
        r_resik: latestAtt.skor_r_resik,
        a_amanah: latestAtt.skor_a_amanah,
      } : {
        h_higienis: Math.min(100, Math.round(skorAttitude * 0.98)),
        a_antusias: Math.min(100, Math.round(skorAttitude * 1.02)),
        r_resik: Math.min(100, Math.round(skorAttitude * 0.95)),
        a_amanah: Math.min(100, Math.round(skorAttitude * 1.03)),
      };

      const breakdownKSA = {
        knowledge: skorKnowledge,
        skill: skorSkill,
        attitude: skorAttitude,
        rumus: `(${skorKnowledge} × 0.30) + (${skorSkill} × 0.45) + (${skorAttitude} × 0.25) = ${Math.round(skorKnowledge * 0.30 + skorSkill * 0.45 + skorAttitude * 0.25)}`,
      };

      const radar360Axes = [
        { axis: 'Teori SOP', score: sTeori ?? 78, benchmark: 80, category: 'Knowledge' as const },
        { axis: 'Praktik SOS', score: sPraktik ?? 82, benchmark: 85, category: 'Skill' as const },
        { axis: 'Suhu & Gramasi', score: Math.round(((sPraktik ?? 80) * 0.9 + (sTeori ?? 80) * 0.1)), benchmark: 85, category: 'Skill' as const },
        { axis: 'Lisan HACCP', score: sLisan ?? 80, benchmark: 75, category: 'Knowledge' as const },
        { axis: 'Halal & Higienis', score: attitudeDetail.h_higienis, benchmark: 85, category: 'Attitude / Visi Misi' as const },
        { axis: 'Amanah & Kasir', score: attitudeDetail.a_amanah, benchmark: 90, category: 'Attitude / Visi Misi' as const },
        { axis: 'Responsif & SOS', score: attitudeDetail.a_antusias, benchmark: 80, category: 'Attitude / Visi Misi' as const },
        { axis: 'Adaptif & Belajar', score: attitudeDetail.r_resik, benchmark: 80, category: 'Attitude / Visi Misi' as const },
      ];

      hasil.push({
        namaKru: nama,
        divisi: k.divisi,
        kode_outlet: k.kode_outlet,
        skorTeori: sTeori,
        skorPraktik: sPraktik,
        skorLisan: sLisan,
        skorAudit: sAudit,
        skorAkhir,
        badge,
        statusKelulusan,
        riwayatTeoriCount: kTeori.length,
        riwayatPraktikCount: kPraktik.length,
        riwayatLisanCount: kLisan.length,
        riwayatAuditCount: kAudit.length,
        riwayatCoachingCount: kCoaching.length,
        skorKnowledge,
        skorSkill,
        skorAttitude,
        breakdownKSA,
        attitudeHaraDetail: attitudeDetail,
        radar360Axes,
      });
    }

    // Data Science Cohort Normal Distribution (Gauss Bell Curve Z-score & Percentiles)
    const validScores = hasil.filter((h) => h.skorAkhir !== null).map((h) => h.skorAkhir as number);
    if (validScores.length > 1) {
      const mean = validScores.reduce((a, b) => a + b, 0) / validScores.length;
      const variance = validScores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (validScores.length - 1);
      const stdev = Math.sqrt(variance) || 1;

      for (const item of hasil) {
        if (item.skorAkhir !== null) {
          const z = Number(((item.skorAkhir - mean) / stdev).toFixed(2));
          item.zScore = z;
          const belowCount = validScores.filter((s) => s <= item.skorAkhir!).length;
          item.percentileRank = Math.round((belowCount / validScores.length) * 100);
        }
      }
    }

    hasil.sort((a, b) => (b.skorAkhir ?? -1) - (a.skorAkhir ?? -1));
    return hasil;
  }

  // Save or Update Attitude HARA Audit Record
  public saveAuditAttitudeHara(audit: AuditAttitudeHara): void {
    const list = this.getTable<AuditAttitudeHara>('attitude_hara');
    const existingIdx = list.findIndex(a => a.id === audit.id || (a.nama_kru === audit.nama_kru && a.tanggal.slice(0, 10) === audit.tanggal.slice(0, 10)));
    if (existingIdx !== -1) {
      list[existingIdx] = { ...list[existingIdx], ...audit };
      this.setDirect('attitude_hara', list);
    } else {
      this.insertRow<AuditAttitudeHara>('attitude_hara', audit);
    }
    this.addLog('TAMBAH', 'Audit Sikap HARA', `Mencatat evaluasi sikap H.A.R.A untuk ${audit.nama_kru}: Skor ${audit.skor_rata_rata}/100`);
  }

  // Get Activity Logs
  public getLogs(): LogAktivitas[] {
    return this.get<LogAktivitas[]>(STORAGE_KEYS.LOG_AKTIVITAS, []);
  }

  // Full System Export JSON
  public exportFullBackupJSON(): string {
    const backupData = {
      system: 'HARA TRAINER PRO Enterprise',
      version: '2.5.0',
      exported_at: new Date().toISOString(),
      exported_by: this.getCurrentUser()?.nama || 'System Administrator',
      data: {
        outlets: this.getTable('outlets'),
        kru: this.getTable('kru'),
        tna: this.getTable('tna'),
        rencana_training: this.getTable('rencana_training'),
        observasi_lapangan: this.getTable('observasi_lapangan'),
        coaching_log: this.getTable('coaching_log'),
        gap_analysis: this.getTable('gap_analysis'),
        kartu_keluhan: this.getTable('kartu_keluhan'),
        talent_tracker: this.getTable('talent_tracker'),
        bank_sop: this.getTable('bank_sop'),
        bank_soal: this.getTable('bank_soal'),
        penilaian_teori: this.getTable('penilaian_teori'),
        penilaian_praktik: this.getTable('penilaian_praktik'),
        penilaian_lisan: this.getTable('penilaian_lisan'),
        penugasan_trainer: this.getTable('penugasan_trainer'),
        trainee_outlet: this.getTable('trainee_outlet'),
        laporan_trainer: this.getTable('laporan_trainer'),
        app_users: this.getTable('app_users'),
        settings: this.getTable('settings'),
        logs: this.getLogs(),
      },
    };
    return JSON.stringify(backupData, null, 2);
  }

  // Restore Backup JSON
  public restoreBackupJSON(jsonString: string, mode: 'overwrite' | 'merge' = 'overwrite'): { success: boolean; message: string; stats?: Record<string, number> } {
    try {
      const parsed = JSON.parse(jsonString);
      const data = parsed.data || parsed;

      const tables = [
        'outlets', 'kru', 'tna', 'rencana_training', 'observasi_lapangan',
        'coaching_log', 'gap_analysis', 'kartu_keluhan', 'talent_tracker',
        'bank_sop', 'bank_soal', 'penilaian_teori', 'penilaian_praktik',
        'penilaian_lisan', 'penugasan_trainer', 'trainee_outlet', 'laporan_trainer', 'app_users', 'settings'
      ];

      const stats: Record<string, number> = {};

      for (const t of tables) {
        if (Array.isArray(data[t])) {
          const key = this.mapKey(t);
          if (mode === 'overwrite') {
            this.set(key, data[t]);
            stats[t] = data[t].length;
          } else {
            const existing = this.get<any[]>(key, []);
            const existingIds = new Set(existing.map((x) => x.id));
            const newItems = data[t].filter((x: any) => !existingIds.has(x.id));
            const merged = [...existing, ...newItems];
            this.set(key, merged);
            stats[t] = merged.length;
          }
        }
      }

      this.addLog('TAMBAH', 'Sistem', `Restorasi database cadangan (${mode.toUpperCase()}) berhasil dijalankan`);
      return { success: true, message: 'Restorasi database cadangan berhasil diselesaikan!', stats };
    } catch (err: any) {
      return { success: false, message: `Gagal memproses file cadangan: ${err?.message || 'Format JSON tidak valid'}` };
    }
  }

  // Reset to Factory Seed
  public resetToInitialSeed(): void {
    localStorage.clear();
    // Re-seed all tables
    this.init();
    this.addLog('UBAH', 'Sistem', 'Database di-reset kembali ke data awal pabrik (Factory Reset)');
  }

  // Clear Activity Logs
  public clearActivityLogs(): void {
    this.set(STORAGE_KEYS.LOG_AKTIVITAS, []);
  }

  // Get Diagnostics & Storage Stats
  public getStorageDiagnostics(): {
    totalBytes: number;
    usedKb: string;
    totalRecords: number;
    tableCounts: Record<string, number>;
    inconsistencies: string[];
  } {
    let totalBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) {
        const v = localStorage.getItem(k) || '';
        totalBytes += (k.length + v.length) * 2;
      }
    }

    const tableNames = [
      'outlets', 'kru', 'tna', 'rencana_training', 'observasi_lapangan',
      'coaching_log', 'gap_analysis', 'kartu_keluhan', 'talent_tracker',
      'bank_sop', 'bank_soal', 'penilaian_teori', 'penilaian_praktik',
      'penilaian_lisan', 'penugasan_trainer', 'trainee_outlet', 'laporan_trainer', 'app_users', 'settings', 'logs'
    ];

    const tableCounts: Record<string, number> = {};
    let totalRecords = 0;

    for (const t of tableNames) {
      const rows = t === 'logs' ? this.getLogs() : this.getTable(t);
      tableCounts[t] = rows.length;
      totalRecords += rows.length;
    }

    // Consistency Checks
    const inconsistencies: string[] = [];
    const outlets = this.getTable<Outlet>('outlets');
    const validOutletCodes = new Set(outlets.map((o) => o.kode_outlet));
    const krus = this.getTable<Kru>('kru');

    for (const k of krus) {
      if (k.kode_outlet && !validOutletCodes.has(k.kode_outlet)) {
        inconsistencies.push(`Kru '${k.nama_kru}' terhubung ke kode outlet tidak terdaftar: '${k.kode_outlet}'`);
      }
    }

    const sops = this.getTable<BankSOP>('bank_sop');
    for (const s of sops) {
      if (!s.langkah || !Array.isArray(s.langkah) || s.langkah.length === 0) {
        inconsistencies.push(`SOP '${s.judul_sop}' belum memiliki langkah-langkah kerja.`);
      }
    }

    return {
      totalBytes,
      usedKb: (totalBytes / 1024).toFixed(2),
      totalRecords,
      tableCounts,
      inconsistencies,
    };
  }

  // Key map helper
  private mapKey(name: string): string {
    switch (name.toLowerCase()) {
      case 'hasil_ujian_mingguan':
      case 'hasil_ujian':
        return STORAGE_KEYS.HASIL_UJIAN_MINGGUAN;
      case 'exam_config':
        return STORAGE_KEYS.EXAM_CONFIG;
      case 'outlets':
      case 'outlet':
        return STORAGE_KEYS.OUTLETS;
      case 'kru':
        return STORAGE_KEYS.KRU;
      case 'tna':
        return STORAGE_KEYS.TNA;
      case 'rencana_training':
      case 'rencana':
        return STORAGE_KEYS.RENCANA_TRAINING;
      case 'observasi_lapangan':
      case 'observasi':
        return STORAGE_KEYS.OBSERVASI;
      case 'coaching_log':
      case 'coaching':
        return STORAGE_KEYS.COACHING;
      case 'gap_analysis':
      case 'gap':
        return STORAGE_KEYS.GAP_ANALYSIS;
      case 'kartu_keluhan':
      case 'keluhan':
        return STORAGE_KEYS.KARTU_KELUHAN;
      case 'talent_tracker':
      case 'talent':
        return STORAGE_KEYS.TALENT;
      case 'bank_sop':
        return STORAGE_KEYS.BANK_SOP;
      case 'bank_soal':
        return STORAGE_KEYS.BANK_SOAL;
      case 'penilaian_teori':
        return STORAGE_KEYS.PENILAIAN_TEORI;
      case 'penilaian_praktik':
        return STORAGE_KEYS.PENILAIAN_PRAKTIK;
      case 'penilaian_lisan':
        return STORAGE_KEYS.PENILAIAN_LISAN;
      case 'penugasan_trainer':
      case 'penugasan':
        return STORAGE_KEYS.PENUGASAN_TRAINER;
      case 'trainee_outlet':
      case 'trainee':
        return STORAGE_KEYS.TRAINEE_OUTLET;
      case 'laporan_trainer':
      case 'laporan_outlet':
        return STORAGE_KEYS.LAPORAN_TRAINER;
      case 'onboarding_progress':
      case 'kurikulum':
      case 'roadmap':
        return STORAGE_KEYS.ONBOARDING_PROGRESS;
      case 'official_audits':
      case 'rapor_outlet':
      case 'audit_resmi':
        return STORAGE_KEYS.OFFICIAL_AUDITS;
      case 'official_rapor_kru':
      case 'rapor_kru':
      case 'onboarding_batches':
      case 'batch_onboarding':
      case 'onboarding':
        return STORAGE_KEYS.ONBOARDING_BATCHES;
      case 'trainer_financial_reports':
      case 'laporan_keuangan_trainer':
      case 'rekomendasi_atasan':
        return STORAGE_KEYS.TRAINER_FINANCIAL_REPORTS;
      case 'ojt_monitoring':
      case 'monitoring_training':
      case 'kru_training':
        return STORAGE_KEYS.OJT_MONITORING;
      case 'attitude_hara':
      case 'audit_attitude':
      case 'sikap_hara':
        return STORAGE_KEYS.ATTITUDE_HARA;
      case 'app_users':
      case 'users':
        return STORAGE_KEYS.APP_USERS;
      case 'log_aktivitas':
      case 'logs':
        return STORAGE_KEYS.LOG_AKTIVITAS;
      case 'settings':
        return STORAGE_KEYS.SETTINGS;
      default:
        return 'hara_pd_' + name;
    }
  }

  public getOutlets(): Outlet[] {
    return this.getTable<Outlet>('outlets');
  }

  public getKru(): Kru[] {
    return this.getTable<Kru>('kru');
  }

  public getKartuKeluhan(): KartuKeluhan[] {
    return this.getTable<KartuKeluhan>('kartu_keluhan');
  }

  public getOJTMonitoring(): OJTCrewMonitoringRecord[] {
    return this.get<OJTCrewMonitoringRecord[]>(STORAGE_KEYS.OJT_MONITORING, INITIAL_OJT_MONITORING);
  }

  public saveOJTMonitoring(item: OJTCrewMonitoringRecord): void {
    const list = this.getOJTMonitoring();
    const idx = list.findIndex(r => r.id === item.id || r.kru_id === item.kru_id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.push(item);
    }
    this.set(STORAGE_KEYS.OJT_MONITORING, list);
    this.addLog('UBAH', 'Monitoring Kru Training', `Pembaruan status OJT kru: ${item.nama_kru}`);
  }

  public toggleOJTDayCheck(kruId: string, dayNumber: number): boolean {
    const list = this.getOJTMonitoring();
    const record = list.find(r => r.kru_id === kruId || r.id === kruId);
    if (!record) return false;
    
    if (!record.checked_days) {
      record.checked_days = {};
    }
    const current = !!record.checked_days[dayNumber];
    record.checked_days[dayNumber] = !current;
    
    // Auto-compute completed days count
    const checkedCount = Object.values(record.checked_days).filter(Boolean).length;
    record.progres_persen = Math.round((checkedCount / 30) * 100);
    
    // Recalculate breakdown skor harian
    const sHarian = Math.min(100, Math.round((checkedCount / Math.max(record.hari_berjalan, checkedCount, 1)) * 100));
    if (!record.breakdown_skor) {
      record.breakdown_skor = {
        skor_harian: sHarian,
        skor_gates: 85,
        skor_teori: 85,
        skor_sikap: 90,
        rumus_kalkulasi: `(${sHarian} × 0.25) + (85 × 0.40) + (85 × 0.20) + (90 × 0.15) = 85.5`
      };
    } else {
      record.breakdown_skor.skor_harian = sHarian;
      const composite = Number(((sHarian * 0.25) + (record.breakdown_skor.skor_gates * 0.40) + (record.breakdown_skor.skor_teori * 0.20) + (record.breakdown_skor.skor_sikap * 0.15)).toFixed(1));
      record.skor_komposit_ojt = composite;
      record.breakdown_skor.rumus_kalkulasi = `(${sHarian} × 0.25) + (${record.breakdown_skor.skor_gates} × 0.40) + (${record.breakdown_skor.skor_teori} × 0.20) + (${record.breakdown_skor.skor_sikap} × 0.15) = ${composite}`;
    }

    this.saveOJTMonitoring(record);
    return true;
  }

  public saveGateEvaluation(kruId: string, evaluation: GateEvaluationRecord): void {
    const list = this.getOJTMonitoring();
    const record = list.find(r => r.kru_id === kruId || r.id === kruId);
    if (record) {
      if (evaluation.gate_stage === 'GATE_1_DAY_7') record.evaluasi_gates.gate_1_day_7 = evaluation;
      if (evaluation.gate_stage === 'GATE_2_DAY_14') record.evaluasi_gates.gate_2_day_14 = evaluation;
      if (evaluation.gate_stage === 'GATE_3_DAY_21') record.evaluasi_gates.gate_3_day_21 = evaluation;
      if (evaluation.gate_stage === 'GATE_4_DAY_30') record.evaluasi_gates.gate_4_day_30 = evaluation;

      // Dynamic Mathematical Recalculation:
      const gateScores = [
        record.evaluasi_gates.gate_1_day_7?.skor_akhir,
        record.evaluasi_gates.gate_2_day_14?.skor_akhir,
        record.evaluasi_gates.gate_3_day_21?.skor_akhir,
        record.evaluasi_gates.gate_4_day_30?.skor_akhir,
      ].filter((s): s is number => typeof s === 'number');

      const avgGate = gateScores.length > 0
        ? Number((gateScores.reduce((a, b) => a + b, 0) / gateScores.length).toFixed(1))
        : evaluation.skor_akhir;

      const sHarian = record.breakdown_skor?.skor_harian || 85;
      const sTeori = evaluation.skor_teori || record.breakdown_skor?.skor_teori || 85;
      const sSikap = evaluation.skor_budaya_hara || record.breakdown_skor?.skor_sikap || 90;

      const composite = Number(((sHarian * 0.25) + (avgGate * 0.40) + (sTeori * 0.20) + (sSikap * 0.15)).toFixed(1));
      record.skor_komposit_ojt = composite;
      record.breakdown_skor = {
        skor_harian: sHarian,
        skor_gates: avgGate,
        skor_teori: sTeori,
        skor_sikap: sSikap,
        rumus_kalkulasi: `(${sHarian} × 0.25) + (${avgGate} × 0.40) + (${sTeori} × 0.20) + (${sSikap} × 0.15) = ${composite}`,
      };

      // Strict SOP Gate Status Rule
      const hasAnyRemedialGate = Object.values(record.evaluasi_gates).some(g => g && g.status === 'REMEDIAL_TERBIMBING');
      const hasCriticalDeviations = (evaluation.deviasi_kritis_ditemukan && evaluation.deviasi_kritis_ditemukan.length > 0);

      if (hasAnyRemedialGate || hasCriticalDeviations || evaluation.status === 'REMEDIAL_TERBIMBING') {
        record.status_keseluruhan = 'Kritis / Remedial';
        record.catatan_remedial_aktif = evaluation.tindakan_remedial || 'Wajib pendampingan remedial intensif trainer sebelum diizinkan solo shift.';
      } else if (evaluation.gate_stage === 'GATE_4_DAY_30' && evaluation.status === 'LULUS_MANDIRI' && composite >= 85) {
        record.status_keseluruhan = 'Lulus Bersertifikat';
        record.progres_persen = 100;
        record.catatan_remedial_aktif = undefined;
      } else if (composite < 75) {
        record.status_keseluruhan = 'Butuh Pendampingan';
        record.catatan_remedial_aktif = undefined;
      } else {
        record.status_keseluruhan = 'On-Track';
        record.catatan_remedial_aktif = undefined;
      }

      this.saveOJTMonitoring(record);
      this.addLog('UBAH', 'Monitoring Kru Training', `Evaluasi Gate ${evaluation.gate_stage} untuk ${record.nama_kru}: Skor Gate ${evaluation.skor_akhir}, Skor Komposit ${composite}, Status: ${record.status_keseluruhan}`);
    }
  }

  public verifySecurityPIN(pin: string, requiredRoles?: UserRole[]): { success: boolean; message: string; verifiedUser?: string; role?: UserRole } {
    const cleanPin = pin.trim();
    const PIN_REGISTRY: Record<string, { nama: string; role: UserRole }> = {
      '9900': { nama: 'Administrator HQ', role: 'Admin' },
      '8899': { nama: 'Haikal Abi (Lead Trainer)', role: 'Trainer' },
      '7788': { nama: 'Rian Hidayat (Store Manager)', role: 'Kepala Outlet' },
      '6677': { nama: 'Bambang Kusuma (Supervisor)', role: 'Area Supervisor' },
      '1234': { nama: 'Super Dev Master Access', role: 'Admin' },
    };

    const match = PIN_REGISTRY[cleanPin];
    if (!match) {
      return { success: false, message: 'PIN Otorisasi salah atau tidak terdaftar!' };
    }

    if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(match.role) && match.role !== 'Admin') {
      return {
        success: false,
        message: `Wewenang tidak cukup. Aksi ini membutuhkan wewenang: ${requiredRoles.join(' atau ')}. (Peran Anda: ${match.role})`,
      };
    }

    return {
      success: true,
      message: `Otorisasi berhasil sebagai ${match.nama} (${match.role})`,
      verifiedUser: match.nama,
      role: match.role
    };
  }

  public getHasilUjianMingguan(): HasilUjianKruMingguan[] {
    return this.get<HasilUjianKruMingguan[]>(STORAGE_KEYS.HASIL_UJIAN_MINGGUAN, []);
  }

  public saveHasilUjianMingguan(result: HasilUjianKruMingguan): void {
    const list = this.getHasilUjianMingguan();
    const existingIdx = list.findIndex(r => r.id === result.id);
    if (existingIdx >= 0) {
      list[existingIdx] = result;
    } else {
      list.unshift(result);
    }
    this.set(STORAGE_KEYS.HASIL_UJIAN_MINGGUAN, list);
    this.addLog('TAMBAH', 'Hasil Ujian Mingguan', `Ujian ${result.minggu} untuk ${result.nama_kru} (${result.divisi}) tersimpan (Skor: ${result.skor_akhir_komposit})`);
    // Real-time online write to Firestore
    import('./firebase').then(({ firestore }) => {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(firestore, 'hasil_ujian_mingguan', result.id), result, { merge: true }).catch(() => {});
      });
    }).catch(() => {});
  }

  public getExamConfig(): TrainerExamConfig {
    return this.get<TrainerExamConfig>(STORAGE_KEYS.EXAM_CONFIG, {
      mode: 'otomatis_ojt',
      paket_terkunci: 'MINGGU_2',
      durasi_menit: 20,
      durasi_per_soal_detik: 90,
      passing_grade: 75,
      pesan_trainer: 'Kerjakan secara mandiri dan teliti sesuai standar SOP HARA Chicken yang telah dipelajari.',
    });
  }

  public saveExamConfig(cfg: TrainerExamConfig): void {
    this.set(STORAGE_KEYS.EXAM_CONFIG, cfg);
    this.addLog('UBAH', 'Pengaturan Ujian', `Konfigurasi paket ujian diubah ke mode: ${cfg.mode} ${cfg.paket_terkunci ? `(${cfg.paket_terkunci})` : ''}`);
  }

  // ==========================================
  // MANAJEMEN ONBOARDING & RETRAINING 3 HARI
  // ==========================================
  public getOnboardingBatches(): OnboardingBatch[] {
    return this.get<OnboardingBatch[]>(STORAGE_KEYS.ONBOARDING_BATCHES, INITIAL_ONBOARDING_BATCHES);
  }

  public saveOnboardingBatch(batch: OnboardingBatch): void {
    const list = this.getOnboardingBatches();
    const idx = list.findIndex(b => b.id === batch.id);
    if (idx >= 0) {
      list[idx] = batch;
    } else {
      list.unshift(batch);
    }
    this.set(STORAGE_KEYS.ONBOARDING_BATCHES, list);
    this.addLog('UBAH', 'Onboarding 3 Hari', `Batch ${batch.nomor_batch} (${batch.nama_batch}) disimpan dengan ${batch.peserta.length} peserta.`);

    // Async write to Firestore
    import('./firebase').then(({ firestore }) => {
      import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(firestore, 'onboarding_batches', batch.id), batch, { merge: true }).catch(() => {});
      });
    }).catch(() => {});
  }

  public deleteOnboardingBatch(batchId: string): void {
    const list = this.getOnboardingBatches();
    const updated = list.filter(b => b.id !== batchId);
    this.set(STORAGE_KEYS.ONBOARDING_BATCHES, updated);
    this.addLog('HAPUS', 'Onboarding 3 Hari', `Batch ID ${batchId} dihapus dari sistem.`);
  }

  private friendlyTableName(name: string): string {
    const map: Record<string, string> = {
      outlets: 'Master Outlet',
      kru: 'Master Kru',
      tna: 'TNA Analysis',
      rencana_training: 'Rencana Training',
      observasi_lapangan: 'Observasi Lapangan',
      coaching_log: 'Coaching Log',
      gap_analysis: 'Gap Analysis',
      kartu_keluhan: 'Kartu Keluhan',
      talent_tracker: 'Talent Tracker',
      bank_sop: 'Bank SOP',
      bank_soal: 'Bank Soal',
      penilaian_teori: 'Penilaian Teori',
      penilaian_praktik: 'Penilaian Praktik',
      penilaian_lisan: 'Penilaian Lisan',
      penugasan_trainer: 'Penugasan Trainer',
      trainee_outlet: 'Trainee Outlet Khusus',
      laporan_trainer: 'Laporan Trainer Outlet',
      onboarding_progress: 'Kurikulum & Onboarding Kru',
      ojt_monitoring: 'Monitoring Kru Training OJT 30 Hari',
      official_audits: 'Rapor Audit Kinerja Outlet',
      official_rapor_kru: 'Rapor Kompetensi Kru Resmi',
      trainer_financial_reports: 'Laporan Finansial & Rekomendasi Trainer',
      app_users: 'Kelola User',
      settings: 'Pengaturan Sistem',
    };
    return map[name] || name;
  }
}

export const db = new StorageDatabase();
export { STORAGE_KEYS };
