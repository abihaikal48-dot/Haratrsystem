import React, { useState, useEffect } from 'react';
import {
  Database, CheckCircle2, AlertTriangle, Copy, Check,
  ExternalLink, RefreshCw, Key, Globe, Shield, Terminal,
  Layers, DownloadCloud, UploadCloud, X, ArrowRight, Zap
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseCredentials,
  removeSupabaseCredentials,
  testSupabaseConnection,
  autoSeedSupabaseIfEmpty,
  pullAllFromSupabase,
  getSupabaseStatus,
  subscribeSupabaseStatus,
  SupabaseStatus
} from '../lib/supabase';

interface SupabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGateEnforced?: boolean;
}

export const SupabaseConnectionModal: React.FC<SupabaseConnectionModalProps> = ({
  isOpen,
  onClose,
  isGateEnforced = false,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [status, setStatus] = useState<SupabaseStatus>(getSupabaseStatus());
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [migrationResult, setMigrationResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);
  const [bypassGate, setBypassGate] = useState(false);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setUrl(cfg.url);
    setAnonKey(cfg.anonKey);
    return subscribeSupabaseStatus(setStatus);
  }, [isOpen]);

  if (!isOpen && (!isGateEnforced || bypassGate || status === 'connected')) {
    return null;
  }

  const handleTest = async () => {
    setLoading(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url.trim(), anonKey.trim());
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Gagal koneksi' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !anonKey) {
      setTestResult({ success: false, message: 'Harap isi URL dan Anon Key Supabase.' });
      return;
    }

    setLoading(true);
    setTestResult(null);
    try {
      const res = await saveSupabaseCredentials(url.trim(), anonKey.trim());
      setTestResult(res);
      if (res.success) {
        // Otomatis seed data jika kosong
        const seedRes = await autoSeedSupabaseIfEmpty();
        setMigrationResult({ success: true, message: seedRes.message });
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Gagal menyimpan kredensial' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Putuskan koneksi Supabase dari browser ini?')) {
      removeSupabaseCredentials();
      setUrl('');
      setAnonKey('');
      setTestResult({ success: true, message: 'Koneksi Supabase telah diputus.' });
    }
  };

  const handleTriggerMigration = async () => {
    setLoading(true);
    setMigrationResult(null);
    try {
      const res = await autoSeedSupabaseIfEmpty();
      setMigrationResult({ success: res.seeded || res.count > 0, message: res.message });
    } catch (err: any) {
      setMigrationResult({ success: false, message: err.message || 'Gagal migrasi data' });
    } finally {
      setLoading(false);
    }
  };

  const handlePullFromCloud = async () => {
    setLoading(true);
    setMigrationResult(null);
    try {
      const res = await pullAllFromSupabase();
      if (res.success) {
        setMigrationResult({
          success: true,
          message: `Berhasil menarik ${res.totalRecords} rekaman data terbaru dari Supabase!`,
        });
      } else {
        setMigrationResult({
          success: false,
          message: 'Belum ada data atau gagal membaca dari cloud.',
        });
      }
    } catch (err: any) {
      setMigrationResult({ success: false, message: err.message || 'Gagal sinkron' });
    } finally {
      setLoading(false);
    }
  };

  const copySqlSchema = async () => {
    try {
      const response = await fetch('/supabase_schema.sql');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      // Fallback text if fetch fails
      const fallbackSql = `-- Jalankan di Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS outlets (id TEXT PRIMARY KEY, nama_outlet TEXT NOT NULL, kode_outlet TEXT NOT NULL UNIQUE, alamat TEXT, kepala_outlet TEXT, area_supervisor TEXT, status_aktif TEXT DEFAULT 'Aktif', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS kru (id TEXT PRIMARY KEY, nama_kru TEXT NOT NULL, jabatan TEXT, divisi TEXT NOT NULL, kode_outlet TEXT, tanggal_masuk DATE, status_aktif TEXT DEFAULT 'Aktif', catatan TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS bank_sop (id TEXT PRIMARY KEY, kode_sop TEXT NOT NULL, judul TEXT NOT NULL, kategori TEXT, sub_kategori TEXT, versi TEXT, tanggal_berlaku DATE, langkah_langkah JSONB, parameter_kritis JSONB, status TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS hasil_ujian_mingguan (id TEXT PRIMARY KEY, kru_id TEXT, nama_kru TEXT NOT NULL, kode_outlet TEXT, divisi TEXT, minggu_ke INT, tanggal_ujian TIMESTAMPTZ DEFAULT NOW(), skor NUMERIC, detail_jawaban JSONB, status_kelulusan TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS kartu_keluhan (id TEXT PRIMARY KEY, tanggal_shift TEXT, kode_outlet TEXT, tipe TEXT, deskripsi_keluhan TEXT, nama_kru_terkait TEXT, tindakan_diambil TEXT, status TEXT, tindak_lanjut_training TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS app_store (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY; ALTER TABLE kru ENABLE ROW LEVEL SECURITY; ALTER TABLE bank_sop ENABLE ROW LEVEL SECURITY; ALTER TABLE app_store ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon all outlets" ON outlets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon all kru" ON kru FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon all bank_sop" ON bank_sop FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon all app_store" ON app_store FOR ALL USING (true) WITH CHECK (true);`;
      await navigator.clipboard.writeText(fallbackSql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  const isConnected = status === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#96171B] via-[#7d1316] to-[#5a0c0e] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Koneksi Database Supabase</h2>
              <p className="text-xs text-red-100">
                Penyimpanan online multi-cabang & sinkronisasi real-time instan
              </p>
            </div>
          </div>
          {(!isGateEnforced || isConnected) && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Tutup"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-neutral-800">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              isConnected
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}
          >
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <div className="font-bold text-sm">
                {isConnected ? 'Terhubung ke Supabase Cloud' : 'Koneksi Supabase Belum Aktif'}
              </div>
              <p className="mt-1 leading-relaxed">
                {isConnected
                  ? 'Semua data penilaian kru, SOP, dan ujian mingguan tersimpan aman di server Supabase Anda secara real-time.'
                  : 'Sesuai instruksi Anda, sistem mewajibkan Supabase terhubung agar riwayat kru & audit tersimpan permanen dan dapat diakses semua cabang secara serentak.'}
              </p>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 text-xs space-y-3">
            <div className="font-semibold text-neutral-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#96171B]" />
              <span>3 Langkah Mudah Persiapan Supabase:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-neutral-600 pl-1 leading-relaxed">
              <li>
                Buka dashboard proyek Anda di{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#96171B] font-bold underline inline-flex items-center gap-1"
                >
                  supabase.com <ExternalLink size={11} />
                </a>
              </li>
              <li>
                Klik menu <strong>SQL Editor</strong>, lalu salin dan jalankan skrip skema database di bawah.
              </li>
              <li>
                Salin <strong>Project URL</strong> dan <strong>Anon Key</strong> dari menu <em>Project Settings → API</em> ke form berikut.
              </li>
            </ol>
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copySqlSchema}
                className="bg-neutral-800 hover:bg-neutral-900 text-white font-medium px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-xs shadow-sm cursor-pointer"
              >
                {copiedSql ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedSql ? 'Skrip SQL Tersalin!' : 'Salin Skrip SQL Schema'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSqlViewer(!showSqlViewer)}
                className="bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors text-xs cursor-pointer"
              >
                <Terminal size={14} />
                <span>{showSqlViewer ? 'Sembunyikan SQL' : 'Lihat Skrip SQL'}</span>
              </button>
            </div>

            {showSqlViewer && (
              <div className="mt-3 bg-neutral-900 text-neutral-200 p-3 rounded-lg font-mono text-[11px] max-h-48 overflow-y-auto leading-relaxed border border-neutral-700">
                <pre>{`-- Salin dan jalankan skrip ini di Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS outlets (id TEXT PRIMARY KEY, nama_outlet TEXT NOT NULL, kode_outlet TEXT NOT NULL UNIQUE, alamat TEXT, kepala_outlet TEXT, area_supervisor TEXT, status_aktif TEXT DEFAULT 'Aktif', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS kru (id TEXT PRIMARY KEY, nama_kru TEXT NOT NULL, jabatan TEXT, divisi TEXT NOT NULL, kode_outlet TEXT, tanggal_masuk DATE, status_aktif TEXT DEFAULT 'Aktif', catatan TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS bank_sop (id TEXT PRIMARY KEY, kode_sop TEXT NOT NULL, judul TEXT NOT NULL, kategori TEXT, sub_kategori TEXT, versi TEXT DEFAULT '1.0', tanggal_berlaku DATE, langkah_langkah JSONB DEFAULT '[]'::jsonb, status TEXT DEFAULT 'Aktif', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS hasil_ujian_mingguan (id TEXT PRIMARY KEY, kru_id TEXT, nama_kru TEXT NOT NULL, kode_outlet TEXT, divisi TEXT, minggu_ke INT, skor NUMERIC DEFAULT 0, detail_jawaban JSONB, status_kelulusan TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS kartu_keluhan (id TEXT PRIMARY KEY, tanggal_shift TEXT, kode_outlet TEXT, tipe TEXT, deskripsi_keluhan TEXT, nama_kru_terkait TEXT, tindakan_diambil TEXT, status TEXT, tindak_lanjut_training TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS app_store (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());
-- RLS Permissive
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY; ALTER TABLE kru ENABLE ROW LEVEL SECURITY; ALTER TABLE bank_sop ENABLE ROW LEVEL SECURITY; ALTER TABLE app_store ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access outlets" ON outlets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access kru" ON kru FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access bank_sop" ON bank_sop FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access app_store" ON app_store FOR ALL USING (true) WITH CHECK (true);`}</pre>
              </div>
            )}
          </div>

          {/* Form Credentials */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Globe size={13} className="text-neutral-500" />
                <span>Supabase Project URL</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://abcdefghijklm.supabase.co"
                required
                className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#96171B] focus:border-transparent font-mono"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Ditemukan di: Project Settings → API → Project URL
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1.5">
                <Key size={13} className="text-neutral-500" />
                <span>Supabase Anon / Public Key</span>
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                rows={3}
                required
                className="w-full px-3.5 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#96171B] focus:border-transparent font-mono resize-none"
              />
              <span className="text-[11px] text-neutral-400 mt-1 block">
                Ditemukan di: Project Settings → API → Project API Keys (anon public)
              </span>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle size={16} className="text-red-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {migrationResult && (
              <div
                className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  migrationResult.success
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                <Layers size={16} className="text-blue-600 shrink-0" />
                <span>{migrationResult.message}</span>
              </div>
            )}

            {/* Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={loading || !url || !anonKey}
                  className="bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-neutral-700 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  <span>Uji Koneksi</span>
                </button>
                {isConnected && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Putuskan
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isGateEnforced && !isConnected && (
                  <button
                    type="button"
                    onClick={() => {
                      setBypassGate(true);
                      onClose();
                    }}
                    className="text-neutral-500 hover:text-neutral-800 text-xs px-2.5 py-2 transition-colors cursor-pointer"
                  >
                    Lewati Sementara (Offline)
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#96171B] hover:bg-[#801317] disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {loading && <RefreshCw size={13} className="animate-spin" />}
                  <span>{isConnected ? 'Perbarui & Sinkronkan' : 'Hubungkan & Mulai'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </form>

          {/* Sync & Migration Controls (if configured) */}
          {isConnected && (
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <div className="text-xs font-bold text-neutral-800 flex items-center gap-2">
                <Shield size={14} className="text-[#96171B]" />
                <span>Manajemen Data & Migrasi Awal</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleTriggerMigration}
                  disabled={loading}
                  className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-left transition-colors flex items-start gap-2.5 cursor-pointer"
                >
                  <UploadCloud size={16} className="text-[#96171B] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-neutral-900">
                      Migrasi Data Awal ke Supabase
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Kirim 12 kru (7 karyawan baru + 5 retraining), 11 outlet, dan Bank SOP ke cloud.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handlePullFromCloud}
                  disabled={loading}
                  className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-left transition-colors flex items-start gap-2.5 cursor-pointer"
                >
                  <DownloadCloud size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-neutral-900">
                      Tarik Data Terbaru dari Cloud
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Sinkronkan rekaman terbaru dari cabang lain ke perangkat ini.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
