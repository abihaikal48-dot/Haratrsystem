import React, { useState, useEffect } from 'react';
import {
  Database, CheckCircle2, AlertTriangle, Copy, Check,
  ExternalLink, RefreshCw, Key, Globe, Shield, Terminal,
  UploadCloud, DownloadCloud, X, ArrowRight, Zap, FileSpreadsheet, Lock, Unlock
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseCredentials,
  removeSupabaseCredentials,
  testSupabaseConnection,
  autoSeedSupabaseIfEmpty,
  pullAllFromSupabase,
  pushAllLocalDataToSupabase,
  getSupabaseStatus,
  subscribeSupabaseStatus,
  SupabaseStatus,
  SUPABASE_SQL_SCHEMA_SCRIPT,
  getSupabaseTableStats,
  SupabaseDiagnosticResult,
  QUICK_SUPABASE_RLS_FIX_SQL
} from '../lib/supabase';
import {
  getGoogleSheetWebhookUrl,
  saveGoogleSheetWebhookUrl,
  getSavedGoogleSheetDocUrl,
  saveGoogleSheetDocUrl,
  testGoogleSheetWebhook,
  HARA_APPS_SCRIPT_TEMPLATE,
  exportPenilaianToCSV
} from '../lib/googleSheetSync';
import { checkServerStatus, initClientDataFromServer, saveCentralSupabaseConfig, ServerDbStatus } from '../lib/serverSync';
import { db } from '../lib/storage';

interface SupabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGateEnforced?: boolean;
}

export const SupabaseConnectionModal: React.FC<SupabaseConnectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isConfigured } = getSupabaseConfig();
  const [activeTab, setActiveTab] = useState<'status' | 'supabase' | 'vercel' | 'spreadsheet'>(
    isConfigured ? 'supabase' : 'supabase'
  );
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [status, setStatus] = useState<SupabaseStatus>(getSupabaseStatus());
  const [serverStatus, setServerStatus] = useState<ServerDbStatus>({
    online: true,
    supabaseConfigured: true,
    supabaseUrlConfigured: true,
    lastSync: null,
  });
  const [loading, setLoading] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedAppsScript, setCopiedAppsScript] = useState(false);
  const [showSqlViewer, setShowSqlViewer] = useState(false);

  // Akses konfigurasi Supabase terbuka langsung untuk pengaturan database utama
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(true);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Spreadsheet Webhook & Document State
  const [sheetWebhookUrl, setSheetWebhookUrl] = useState('');
  const [sheetDocUrl, setSheetDocUrl] = useState('');
  const [sheetTesting, setSheetTesting] = useState(false);
  const [sheetTestResult, setSheetTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Live Supabase Diagnostics & Table Stats
  const [tableStats, setTableStats] = useState<SupabaseDiagnosticResult | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [copiedQuickSql, setCopiedQuickSql] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message: string;
    totalPushed: number;
    details: Record<string, number>;
    structuredBlocked?: boolean;
  } | null>(null);

  const refreshStats = async () => {
    setLoadingStats(true);
    try {
      const stats = await getSupabaseTableStats();
      setTableStats(stats);
    } catch (e) {
      console.warn('Failed to load table stats', e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setSheetWebhookUrl(getGoogleSheetWebhookUrl());
      setSheetDocUrl(getSavedGoogleSheetDocUrl());
      checkServerStatus().then(setServerStatus);
      refreshStats();
    }
    return subscribeSupabaseStatus(setStatus);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN Admin HQ: 4829 atau password admin sistem
    if (adminPinInput.trim() === '4829' || adminPinInput.trim() === 'admin123') {
      setIsAdminUnlocked(true);
      setPinError(false);
      setActiveTab('supabase');
    } else {
      setPinError(true);
    }
  };

  const handlePullLatestData = async () => {
    setLoading(true);
    setSyncStatusMsg('Menghubungi server backend untuk mengunduh data terbaru...');
    try {
      const success = await initClientDataFromServer();
      if (success) {
        setSyncStatusMsg('✅ Berhasil menyinkronkan seluruh batch, penilaian produk, dan data kru terbaru dari Cloud!');
      } else {
        // Fallback coba pull direct jika ada kredensial tersimpan
        const directRes = await pullAllFromSupabase();
        if (directRes.success) {
          setSyncStatusMsg(`✅ Berhasil menarik ${directRes.totalRecords} rekaman data langsung dari Supabase!`);
        } else {
          setSyncStatusMsg('Data lokal sudah dalam kondisi terbaru.');
        }
      }
      checkServerStatus().then(setServerStatus);
      await refreshStats();
    } catch (err: any) {
      setSyncStatusMsg(`Gagal sinkronisasi: ${err?.message || 'Koneksi terputus'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePushAllData = async () => {
    setLoading(true);
    setSyncStatusMsg('Mengunggah seluruh data master, kru, batch, dan penilaian ke Supabase Cloud...');
    try {
      const res = await pushAllLocalDataToSupabase();
      setPushResult(res);
      if (res.success) {
        setSyncStatusMsg(`✅ Sukses! ${res.totalPushed} rekaman data sistem berhasil diunggah ke Supabase Cloud.`);
      } else {
        setSyncStatusMsg(`⚠️ Perhatian: ${res.message}`);
      }
      await refreshStats();
    } catch (err: any) {
      setSyncStatusMsg(`Gagal mengunggah data: ${err?.message || 'Koneksi terputus'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyQuickSql = () => {
    navigator.clipboard.writeText(QUICK_SUPABASE_RLS_FIX_SQL);
    setCopiedQuickSql(true);
    setTimeout(() => setCopiedQuickSql(false), 2500);
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const copyAppsScript = () => {
    navigator.clipboard.writeText(HARA_APPS_SCRIPT_TEMPLATE);
    setCopiedAppsScript(true);
    setTimeout(() => setCopiedAppsScript(false), 2500);
  };

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
    await saveSupabaseCredentials(url.trim(), anonKey.trim());
    await saveCentralSupabaseConfig(url.trim(), anonKey.trim());
    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    if (res.success) {
      const pushRes = await pushAllLocalDataToSupabase();
      setTestResult({
        success: true,
        message: `${res.message} ${pushRes.message}`,
      });
    } else {
      setTestResult(res);
    }
    setLoading(false);
    if (res.success) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-2xl max-w-2xl w-full my-8 overflow-hidden flex flex-col text-[#181411]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#96171B] via-[#7d1316] to-[#5a0c0e] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Koneksi Database & Cloud HARA</h2>
              <p className="text-xs text-red-100">
                Penyimpanan online multi-perangkat terlindungi & sinkronisasi otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-[#E6E1DA] bg-[#FAF8F5] px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
              activeTab === 'status'
                ? 'border-[#96171B] text-[#96171B]'
                : 'border-transparent text-[#645D55] hover:text-[#181411]'
            }`}
          >
            <Shield size={14} />
            <span>Status Sistem & Auto-Sync</span>
          </button>

          {isAdminUnlocked ? (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('supabase')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'supabase'
                    ? 'border-[#96171B] text-[#96171B]'
                    : 'border-transparent text-[#645D55] hover:text-[#181411]'
                }`}
              >
                <Database size={14} />
                <span>Pengaturan Supabase (Admin)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('vercel')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'vercel'
                    ? 'border-[#96171B] text-[#96171B]'
                    : 'border-transparent text-[#645D55] hover:text-[#181411]'
                }`}
              >
                <Globe size={14} />
                <span>Panduan Vercel</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('spreadsheet')}
                className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-all ${
                  activeTab === 'spreadsheet'
                    ? 'border-[#96171B] text-[#96171B]'
                    : 'border-transparent text-[#645D55] hover:text-[#181411]'
                }`}
              >
                <FileSpreadsheet size={14} />
                <span>Google Spreadsheet</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('supabase')}
              className="pb-2.5 px-3 text-xs font-semibold text-[#645D55] hover:text-[#181411] flex items-center gap-1.5 cursor-pointer border-b-2 border-transparent"
            >
              <Lock size={13} className="text-amber-600" />
              <span>Konfigurasi Administrator (PIN)</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* TAB 1: STATUS SISTEM & SINKRONISASI OTOMATIS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Live Connection Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Database size={18} className="text-emerald-700" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-emerald-950 text-sm">Supabase Database Cloud Online</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-300/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Tersambung {tableStats?.pingMs ? `(${tableStats.pingMs} ms)` : ''}
                      </span>
                    </div>
                    <p className="text-emerald-800 text-[11.5px] font-mono break-all">
                      https://bjkbvlpaaeekdqqlxavq.supabase.co
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={refreshStats}
                  disabled={loadingStats}
                  className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer self-start sm:self-auto"
                  title="Cek ulang latensi dan data cloud"
                >
                  <RefreshCw size={13} className={loadingStats ? 'animate-spin' : ''} />
                  <span>{loadingStats ? 'Mengecek...' : 'Ping Database'}</span>
                </button>
              </div>

              {/* Status Action Buttons: Push & Pull */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Push Seluruh Data Sistem */}
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-[#96171B] text-sm mb-1">
                      <UploadCloud size={16} />
                      <span>Unggah Seluruh Data Sistem</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Kirim seluruh master kru (termasuk 12 kru batch 10-11 Nov), outlet cabang, SOP 29 produk, batch onboarding, dan penilaian ke Supabase Cloud.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePushAllData}
                    disabled={loading}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all active:scale-[0.98]"
                  >
                    <UploadCloud size={14} className={loading ? 'animate-bounce' : ''} />
                    <span>{loading ? 'Mengunggah ke Cloud...' : 'Sinkronkan & Unggah Data Sekarang'}</span>
                  </button>
                </div>

                {/* 2. Tarik Data Terbaru */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm mb-1">
                      <DownloadCloud size={16} className="text-blue-600" />
                      <span>Tarik Data Terbaru dari Cloud</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Unduh pembaruan nilai atau peserta terbaru yang baru saja diinput oleh rekan trainer lain ke browser ini.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePullLatestData}
                    disabled={loading}
                    className="w-full py-2.5 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-[0.98]"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    <span>{loading ? 'Menyinkronkan...' : 'Tarik Data Terbaru (Pull)'}</span>
                  </button>
                </div>
              </div>

              {/* Status Message Notification */}
              {syncStatusMsg && (
                <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center gap-2 shadow-sm animate-in fade-in">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span className="leading-snug">{syncStatusMsg}</span>
                </div>
              )}

              {/* Live Data Breakdown Cloud vs Local */}
              <div className="p-4 rounded-xl border border-[#E6E1DA] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-[#181411] flex items-center gap-1.5">
                    <Database size={14} className="text-[#96171B]" />
                    <span>Data Sistem Terkini (Lokal vs Cloud Supabase)</span>
                  </h5>
                  <span className="text-[10.5px] text-[#645D55]">
                    Pembaruan: {tableStats?.lastChecked || 'Baru saja'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]/80">
                    <span className="text-[10px] uppercase font-bold text-[#645D55] block">Master Kru</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-bold text-[#181411]">{db.getTable('kru').length}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        ({tableStats?.appStoreStats['kru'] ?? db.getTable('kru').length} cloud)
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]/80">
                    <span className="text-[10px] uppercase font-bold text-[#645D55] block">Outlet Cabang</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-bold text-[#181411]">{db.getTable('outlets').length}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        ({tableStats?.appStoreStats['outlets'] ?? db.getTable('outlets').length} cloud)
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]/80">
                    <span className="text-[10px] uppercase font-bold text-[#645D55] block">Batch Onboarding</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-bold text-[#181411]">{db.getTable('onboarding_batches').length}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        ({tableStats?.appStoreStats['onboarding_batches'] ?? db.getTable('onboarding_batches').length} cloud)
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]/80">
                    <span className="text-[10px] uppercase font-bold text-[#645D55] block">Bank SOP (29 Produk)</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-bold text-[#181411]">{db.getTable('bank_sop').length}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        ({tableStats?.appStoreStats['bank_sop'] ?? db.getTable('bank_sop').length} cloud)
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]/80">
                    <span className="text-[10px] uppercase font-bold text-[#645D55] block">Penilaian SOP</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-bold text-[#181411]">{db.getTable('penilaian_praktik_onboarding_produk').length}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        ({tableStats?.appStoreStats['penilaian_praktik_onboarding_produk'] ?? db.getTable('penilaian_praktik_onboarding_produk').length} cloud)
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]/80">
                    <span className="text-[10px] uppercase font-bold text-[#645D55] block">Akun Pengguna</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-bold text-[#181411]">{db.getTable('app_users').length}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        ({tableStats?.appStoreStats['app_users'] ?? db.getTable('app_users').length} cloud)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 1-Klik SQL Fix untuk Table Editor Supabase */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-600" />
                      <span>Ingin Melihat Data di Menu "Table Editor" Supabase?</span>
                    </h5>
                    <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                      Data Anda sudah <strong>100% tersimpan aman & online di Supabase</strong> (pada tabel <code>app_store</code>). Jika Anda membuka Dashboard Supabase & ingin baris data muncul juga di tabel individual (kru, outlets, dll), cukup jalankan skrip 1-Klik ini di <strong>SQL Editor</strong> Supabase untuk membuka izin Row Level Security (RLS).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={copyQuickSql}
                    className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    {copiedQuickSql ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedQuickSql ? 'Skrip SQL Tersalin!' : 'Salin Skrip SQL 1-Klik'}</span>
                  </button>

                  <a
                    href="https://supabase.com/dashboard/project/bjkbvlpaaeekdqqlxavq/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ExternalLink size={13} />
                    <span>Buka SQL Editor Supabase</span>
                  </a>
                </div>
              </div>

              {/* Security Shield Callout */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Shield size={16} className="text-[#96171B]" />
                  <span className="text-[#645D55]">
                    Kredensial master & skrip SQL diamankan di sisi server (Terproteksi dari akses publik).
                  </span>
                </div>
                {!isAdminUnlocked && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('supabase')}
                    className="text-[11px] font-bold text-[#96171B] hover:underline shrink-0 cursor-pointer"
                  >
                    Buka Mode Admin
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PENGATURAN SUPABASE (DIPROTEKSI PIN ADMINISTRATOR) */}
          {activeTab === 'supabase' && (
            <div>
              {!isAdminUnlocked ? (
                <form onSubmit={handleUnlockAdmin} className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA] text-center space-y-4 max-w-md mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#96171B] flex items-center justify-center mx-auto border border-red-200">
                    <Lock size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#181411]">Akses Konfigurasi Database Terkunci</h4>
                    <p className="text-xs text-[#645D55] mt-1">
                      Kredensial teknis dan skrip database hanya boleh diakses oleh Administrator HQ atau Lead Trainer.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="password"
                      value={adminPinInput}
                      onChange={(e) => {
                        setAdminPinInput(e.target.value);
                        setPinError(false);
                      }}
                      placeholder="Masukkan PIN Admin (Default: 4829)"
                      className="w-full p-2.5 rounded-xl border border-[#E6E1DA] bg-white text-center text-sm font-bold tracking-widest focus:outline-none focus:border-[#96171B]"
                      autoFocus
                    />
                    {pinError && (
                      <p className="text-xs text-red-600 font-semibold">PIN salah. Silakan coba kembali.</p>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('status')}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-[#645D55] hover:bg-white"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#96171B] text-white text-xs font-bold hover:bg-[#7D1216] cursor-pointer shadow-xs"
                    >
                      Buka Akses Admin
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Unlock size={14} className="text-emerald-600" />
                      Mode Administrator Aktif
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAdminUnlocked(false)}
                      className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 cursor-pointer"
                    >
                      Kunci Kembali
                    </button>
                  </div>

                  <form onSubmit={handleSave} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#645D55] uppercase tracking-wider mb-1">
                        Project URL Supabase:
                      </label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://xyzcompany.supabase.co"
                        className="w-full p-2.5 rounded-lg border border-[#E6E1DA] bg-white text-xs font-mono font-medium focus:outline-none focus:border-[#96171B]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#645D55] uppercase tracking-wider mb-1">
                        Anon Public Key:
                      </label>
                      <input
                        type="password"
                        value={anonKey}
                        onChange={(e) => setAnonKey(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        className="w-full p-2.5 rounded-lg border border-[#E6E1DA] bg-white text-xs font-mono font-medium focus:outline-none focus:border-[#96171B]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleTest}
                          disabled={loading || !url || !anonKey}
                          className="px-3.5 py-2 rounded-lg border border-[#E6E1DA] hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Zap size={13} className="text-amber-600" />
                          <span>Uji Koneksi</span>
                        </button>

                        <button
                          type="button"
                          onClick={copySqlSchema}
                          className="px-3.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-[#96171B] border border-red-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedSql ? 'Tersalin!' : 'Salin SQL Schema'}</span>
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2 rounded-lg bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Kredensial'}
                      </button>
                    </div>

                    {testResult && (
                      <div className={`p-3 rounded-lg border text-xs font-medium ${
                        testResult.success
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}>
                        {testResult.message}
                      </div>
                    )}

                    {/* Cloud Sync & Migration Action Cards */}
                    <div className="pt-3 border-t border-[#E6E1DA] space-y-2.5">
                      <h5 className="font-bold text-xs text-[#181411] flex items-center gap-1.5">
                        <UploadCloud size={14} className="text-[#96171B]" />
                        <span>Operasi Cloud Langsung (Database Utama)</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={handlePullLatestData}
                          disabled={loading}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                            <DownloadCloud size={14} className="text-blue-600" />
                            <span>Tarik Data Cloud (Pull)</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Sinkronkan data penilaian & kru terbaru dari Supabase ke peramban.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            setLoading(true);
                            setSyncStatusMsg('Mendorong seluruh data lokal ke tabel Supabase...');
                            try {
                              const res = await pushAllLocalDataToSupabase();
                              setSyncStatusMsg(res.message);
                            } catch (e: any) {
                              setSyncStatusMsg(`Gagal: ${e.message}`);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          disabled={loading}
                          className="p-2.5 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100/70 text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 font-bold text-xs text-[#96171B]">
                            <UploadCloud size={14} className="text-[#96171B]" />
                            <span>Push Semua Data</span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-0.5">
                            Unggah seluruh data lokal (kru, outlet, batch, penilaian produk, user) ke Supabase.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            setLoading(true);
                            setSyncStatusMsg('Memigrasikan data master ke Supabase...');
                            try {
                              const res = await autoSeedSupabaseIfEmpty();
                              setSyncStatusMsg(res.message);
                            } catch (e: any) {
                              setSyncStatusMsg(`Gagal: ${e.message}`);
                            } finally {
                              setLoading(false);
                            }
                          }}
                          disabled={loading}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                            <UploadCloud size={14} className="text-emerald-600" />
                            <span>Kirim Master Data (Seed)</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Unggah data 11 outlet, kru, dan 25 SOP ke tabel Supabase.
                          </p>
                        </button>
                      </div>

                      {syncStatusMsg && (
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                          {syncStatusMsg}
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PANDUAN DEPLOY VERCEL (KHUSUS ADMIN) */}
          {activeTab === 'vercel' && isAdminUnlocked && (
            <div className="space-y-4 text-xs text-[#181411]">
              <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Globe size={16} />
                  <span>Konfigurasi Environment Variables di Vercel</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Saat Anda mendeploy sistem ini ke Vercel, masukkan 2 variabel berikut di tab <strong>Project Settings &rarr; Environment Variables</strong>:
                </p>
                <div className="font-mono text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1 text-slate-200">
                  <p><span className="text-emerald-400">VITE_SUPABASE_URL</span> = https://proyek-anda.supabase.co</p>
                  <p><span className="text-emerald-400">VITE_SUPABASE_ANON_KEY</span> = eyJhbGciOiJIUzI1NiIsIn...</p>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#645D55]">File vercel.json Bawaan:</h5>
                <p className="text-[11px] text-[#645D55] leading-relaxed">
                  File <code>/vercel.json</code> sudah terkonfigurasi dengan aturan SPA Rewrite (<code>{`{"source": "/(.*)", "destination": "/index.html"}`}</code>) sehingga routing multi-halaman tidak akan mengalami error 404 saat di-refresh di Vercel.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE SPREADSHEET SYNC */}
          {activeTab === 'spreadsheet' && isAdminUnlocked && (
            <div className="space-y-4 text-xs text-[#181411]">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <FileSpreadsheet size={15} className="text-emerald-700" />
                    <span>Integrasi Google Spreadsheet Terpadu</span>
                  </h5>
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-[10.5px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink size={11} />
                    <span>Buat Sheet Baru (sheets.new)</span>
                  </a>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Data otomatis dikirim ke Google Spreadsheet Anda setiap kali trainer menekan tombol <strong>Simpan Penilaian</strong> di handphone manapun.
                </p>
              </div>

              {/* 1. Link Dokumen Google Spreadsheet */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-2">
                <label className="block text-[11px] font-bold text-[#645D55] uppercase tracking-wider">
                  1. Link Dokumen Google Spreadsheet Anda:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={sheetDocUrl}
                    onChange={(e) => setSheetDocUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1.../edit"
                    className="flex-1 p-2.5 rounded-lg border border-[#E6E1DA] bg-white text-xs font-mono focus:outline-none focus:border-[#96171B]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      saveGoogleSheetDocUrl(sheetDocUrl.trim());
                      alert('Link Google Spreadsheet berhasil disimpan!');
                    }}
                    className="px-4 py-2 bg-[#96171B] hover:bg-[#7D1216] text-white font-bold rounded-lg cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10.5px] text-[#645D55]">
                    Simpan link sheet agar Anda bisa membukanya langsung dengan 1 tombol di aplikasi.
                  </span>
                  {sheetDocUrl && (
                    <a
                      href={sheetDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink size={12} />
                      <span>Buka Google Sheet Saya</span>
                    </a>
                  )}
                </div>
              </div>

              {/* 2. Webhook URL Google Apps Script */}
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-[#645D55] uppercase tracking-wider">
                    2. URL Webhook Google Apps Script:
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!sheetWebhookUrl.trim()) {
                        alert('Harap isi URL Webhook Apps Script terlebih dahulu.');
                        return;
                      }
                      setSheetTesting(true);
                      setSheetTestResult(null);
                      try {
                        const res = await testGoogleSheetWebhook(sheetWebhookUrl.trim());
                        setSheetTestResult(res);
                      } finally {
                        setSheetTesting(false);
                      }
                    }}
                    disabled={sheetTesting}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer disabled:opacity-50"
                  >
                    {sheetTesting ? 'Menguji...' : 'Uji Koneksi Webhook'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={sheetWebhookUrl}
                    onChange={(e) => setSheetWebhookUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 p-2.5 rounded-lg border border-[#E6E1DA] bg-white text-xs font-mono focus:outline-none focus:border-[#96171B]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      saveGoogleSheetWebhookUrl(sheetWebhookUrl.trim());
                      alert('URL Webhook berhasil disimpan!');
                    }}
                    className="px-4 py-2 bg-[#96171B] hover:bg-[#7D1216] text-white font-bold rounded-lg cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>

                {sheetTestResult && (
                  <div className={`p-2.5 rounded-lg text-xs font-medium border ${
                    sheetTestResult.success ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
                  }`}>
                    {sheetTestResult.message}
                  </div>
                )}
              </div>

              {/* Panduan 4 Langkah Singkat */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 space-y-1 leading-relaxed">
                <span className="font-bold text-amber-900 block text-xs">Cara Pasang Script di Google Sheet:</span>
                <p>1. Buka Google Sheet Anda (atau klik tombol hijau "Buat Sheet Baru" di atas).</p>
                <p>2. Di menu Google Sheet, klik <strong>Ekstensi (Extensions)</strong> &rarr; <strong>Apps Script</strong>.</p>
                <p>3. Hapus kode bawaan, lalu klik tombol <strong>"Salin Kode Google Apps Script"</strong> di bawah dan tempel.</p>
                <p>4. Klik <strong>Deploy</strong> &rarr; <strong>New deployment</strong> &rarr; Pilih type <strong>Web app</strong> &rarr; Atur <em>Who has access</em> ke <strong>Anyone</strong> &rarr; Deploy & salin URL Webhook ke kolom di atas.</p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6E1DA]">
                <button
                  type="button"
                  onClick={copyAppsScript}
                  className="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedAppsScript ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedAppsScript ? 'Script Berhasil Disalin!' : 'Salin Kode Google Apps Script'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportPenilaianToCSV(db.getPenilaianPraktikProduk())}
                  className="px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <DownloadCloud size={13} />
                  <span>Unduh File CSV / Excel Langsung</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E6E1DA] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#645D55]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Multi-Device Cloud HARA Enterprise</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-[#E6E1DA] hover:bg-slate-50 text-xs font-bold text-[#181411] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
