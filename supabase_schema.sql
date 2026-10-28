-- =========================================================================
-- HARA CHICKEN TRAINER & OPS - SUPABASE DATABASE SCHEMA
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> Klik "Run"
-- =========================================================================

-- 1. Tabel Outlets (Cabang Hara Chicken)
CREATE TABLE IF NOT EXISTS outlets (
  id TEXT PRIMARY KEY,
  nama_outlet TEXT NOT NULL,
  kode_outlet TEXT NOT NULL UNIQUE,
  alamat TEXT,
  kepala_outlet TEXT,
  area_supervisor TEXT,
  status_aktif TEXT DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Kru (12 Peserta & Kru Lainnya)
CREATE TABLE IF NOT EXISTS kru (
  id TEXT PRIMARY KEY,
  nama_kru TEXT NOT NULL,
  jabatan TEXT,
  divisi TEXT NOT NULL,
  kode_outlet TEXT,
  tanggal_masuk DATE,
  status_aktif TEXT DEFAULT 'Aktif',
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Bank SOP
CREATE TABLE IF NOT EXISTS bank_sop (
  id TEXT PRIMARY KEY,
  kode_sop TEXT NOT NULL,
  judul TEXT NOT NULL,
  kategori TEXT,
  sub_kategori TEXT,
  versi TEXT DEFAULT '1.0',
  tanggal_berlaku DATE,
  tujuan TEXT,
  cakupan TEXT,
  langkah_langkah JSONB DEFAULT '[]'::jsonb,
  parameter_kritis JSONB DEFAULT '[]'::jsonb,
  alat_bahan JSONB DEFAULT '[]'::jsonb,
  referensi_dokumen TEXT,
  status TEXT DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Hasil Ujian Mingguan
CREATE TABLE IF NOT EXISTS hasil_ujian_mingguan (
  id TEXT PRIMARY KEY,
  kru_id TEXT,
  nama_kru TEXT NOT NULL,
  kode_outlet TEXT,
  divisi TEXT,
  minggu_ke INT,
  tanggal_ujian TIMESTAMPTZ DEFAULT NOW(),
  skor NUMERIC DEFAULT 0,
  detail_jawaban JSONB DEFAULT '[]'::jsonb,
  status_kelulusan TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Kartu Keluhan Pelanggan
CREATE TABLE IF NOT EXISTS kartu_keluhan (
  id TEXT PRIMARY KEY,
  tanggal_shift TEXT,
  kode_outlet TEXT,
  tipe TEXT,
  deskripsi_keluhan TEXT,
  nama_kru_terkait TEXT,
  tindakan_diambil TEXT,
  status TEXT DEFAULT 'Dalam kajian',
  tindak_lanjut_training TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel TNA (Training Needs Analysis)
CREATE TABLE IF NOT EXISTS tna (
  id TEXT PRIMARY KEY,
  tanggal DATE DEFAULT CURRENT_DATE,
  kode_outlet TEXT,
  divisi TEXT,
  sumber_temuan TEXT,
  deskripsi_gap TEXT,
  jenis_gap TEXT,
  prioritas TEXT DEFAULT 'Sedang',
  rencana_tindak_lanjut TEXT,
  status TEXT DEFAULT 'Belum',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Rencana Training
CREATE TABLE IF NOT EXISTS rencana_training (
  id TEXT PRIMARY KEY,
  kode_outlet TEXT,
  topik TEXT NOT NULL,
  tujuan_pembelajaran TEXT,
  peserta TEXT,
  metode TEXT,
  durasi TEXT,
  alat_bantu TEXT,
  fasilitator TEXT,
  tanggal_pelaksanaan DATE,
  status TEXT DEFAULT 'Direncanakan',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel Observasi Lapangan
CREATE TABLE IF NOT EXISTS observasi_lapangan (
  id TEXT PRIMARY KEY,
  tanggal_shift TEXT,
  kode_outlet TEXT,
  nama_kru TEXT,
  divisi TEXT,
  standar_sop_diamati TEXT,
  hasil TEXT,
  catatan_detail TEXT,
  rencana_follow_up TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabel Coaching Log (GROW)
CREATE TABLE IF NOT EXISTS coaching_log (
  id TEXT PRIMARY KEY,
  tanggal DATE DEFAULT CURRENT_DATE,
  kode_outlet TEXT,
  nama_kru TEXT,
  goal TEXT,
  reality TEXT,
  options TEXT,
  will TEXT,
  hasil_follow_up TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabel Gap Analysis
CREATE TABLE IF NOT EXISTS gap_analysis (
  id TEXT PRIMARY KEY,
  nama_kru TEXT,
  divisi TEXT,
  kode_outlet TEXT,
  kompetensi_dinilai TEXT,
  skor_standar NUMERIC,
  skor_aktual NUMERIC,
  gap_score NUMERIC,
  rekomendasi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tabel Penilaian Teori, Praktik, Lisan
CREATE TABLE IF NOT EXISTS penilaian_teori (
  id TEXT PRIMARY KEY,
  tanggal TIMESTAMPTZ DEFAULT NOW(),
  nama_kru TEXT NOT NULL,
  topik TEXT,
  jumlah_benar INT,
  total_soal INT,
  skor NUMERIC,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS penilaian_praktik (
  id TEXT PRIMARY KEY,
  tanggal TIMESTAMPTZ DEFAULT NOW(),
  nama_kru TEXT NOT NULL,
  stasiun TEXT,
  skor NUMERIC,
  catatan TEXT,
  detail_skor JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS penilaian_lisan (
  id TEXT PRIMARY KEY,
  tanggal TIMESTAMPTZ DEFAULT NOW(),
  nama_kru TEXT NOT NULL,
  topik TEXT,
  skor NUMERIC,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Tabel Talent Tracker & OJT
CREATE TABLE IF NOT EXISTS talent_tracker (
  id TEXT PRIMARY KEY,
  nama_kandidat TEXT,
  divisi TEXT,
  kode_outlet TEXT,
  target_posisi TEXT,
  tanggung_jawab_uji_coba TEXT,
  progres_terkini TEXT,
  target_waktu_siap TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ojt_monitoring (
  id TEXT PRIMARY KEY,
  kru_id TEXT,
  nama_kru TEXT,
  kode_outlet TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Tabel Log Aktivitas
CREATE TABLE IF NOT EXISTS log_aktivitas (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  user_nama TEXT,
  role TEXT,
  tipe_aksi TEXT,
  modul TEXT,
  detail TEXT
);

-- 14. Tabel Sinkronisasi Fleksibel (Menampung semua modul sistem HARA)
CREATE TABLE IF NOT EXISTS app_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Tabel Akun Pengguna / User Management (Auth Database)
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Trainer',
  outlet_id TEXT,
  kode_outlet TEXT,
  status_aktif TEXT DEFAULT 'Aktif',
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- KEBIJAKAN ROW LEVEL SECURITY (RLS) - PERMISSIVE PUBLIC ANON ACCESS
-- =========================================================================
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kru ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_sop ENABLE ROW LEVEL SECURITY;
ALTER TABLE hasil_ujian_mingguan ENABLE ROW LEVEL SECURITY;
ALTER TABLE kartu_keluhan ENABLE ROW LEVEL SECURITY;
ALTER TABLE tna ENABLE ROW LEVEL SECURITY;
ALTER TABLE rencana_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE observasi_lapangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE penilaian_teori ENABLE ROW LEVEL SECURITY;
ALTER TABLE penilaian_praktik ENABLE ROW LEVEL SECURITY;
ALTER TABLE penilaian_lisan ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE ojt_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_aktivitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'outlets', 'kru', 'bank_sop', 'hasil_ujian_mingguan', 'kartu_keluhan',
      'tna', 'rencana_training', 'observasi_lapangan', 'coaching_log',
      'gap_analysis', 'penilaian_teori', 'penilaian_praktik', 'penilaian_lisan',
      'talent_tracker', 'ojt_monitoring', 'log_aktivitas', 'app_store', 'app_users'
    ])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public full access for %s" ON %I;', tbl, tbl);
    EXECUTE format('CREATE POLICY "Public full access for %s" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
  END LOOP;
END $$;

-- Enable Supabase Realtime for instant synchronization across branches
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE outlets;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE kru;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE bank_sop;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE hasil_ujian_mingguan;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE kartu_keluhan;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE tna;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE app_store;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE app_users;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
