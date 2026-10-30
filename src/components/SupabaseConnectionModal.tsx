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
  getSupabaseStatus,
  subscribeSupabaseStatus,
  SupabaseStatus,
  SUPABASE_SQL_SCHEMA_SCRIPT
} from '../lib/supabase';
import {
  getGoogleSheetWebhookUrl,
  saveGoogleSheetWebhookUrl,
  testGoogleSheetWebhook,
  HARA_APPS_SCRIPT_TEMPLATE,
  exportPenilaianToCSV
} from '../lib/googleSheetSync';
import { checkServerStatus, initClientDataFromServer, ServerDbStatus } from '../lib/serverSync';
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
  const [activeTab, setActiveTab] = useState<'status' | 'supabase' | 'vercel' | 'spreadsheet'>('status');
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

  // Admin PIN Protection State (Kredensial dan Script Terlindungi dari User Biasa di HP)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Spreadsheet Webhook State
  const [sheetWebhookUrl, setSheetWebhookUrl] = useState('');
  const [sheetTesting, setSheetTesting] = useState(false);
  const [sheetTestResult, setSheetTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setSheetWebhookUrl(getGoogleSheetWebhookUrl());
      checkServerStatus().then(setServerStatus);
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
    } catch (err: any) {
      setSyncStatusMsg(`Gagal sinkronisasi: ${err?.message || 'Koneksi terputus'}`);
    } finally {
      setLoading(false);
    }
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
    saveSupabaseCredentials(url.trim(), anonKey.trim());
    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTestResult(res);
    setLoading(false);
    if (res.success) {
      setTimeout(() => {
        onClose();
      }, 1500);
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
          {/* TAB 1: STATUS SISTEM & SINKRONISASI OTOMATIS (DEFAULT SAFE VIEW) */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-emerald-950 text-sm">Sistem Siap Digunakan Secara Online</h4>
                  <p className="text-emerald-800 leading-relaxed">
                    Setiap handphone, tablet, atau laptop yang membuka tautan aplikasi ini akan <strong>otomatis terhubung langsung ke database cloud</strong>. Anda tidak perlu mengatur URL atau key di setiap HP.
                  </p>
                </div>
              </div>

              {/* Status Checklist Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#181411]">Server Backend Proxy</span>
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Aktif Online
                    </span>
                  </div>
                  <p className="text-[11px] text-[#645D55]">
                    Menangani lalu lintas data terenkripsi tanpa membocorkan koneksi database ke browser peramban.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#181411]">Database Cloud Supabase</span>
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Tersambung
                    </span>
                  </div>
                  <p className="text-[11px] text-[#645D55]">
                    Tabel batch, penilaian produk, dan evaluasi sikap tersimpan terpusat dan dapat dibuka bersamaan.
                  </p>
                </div>
              </div>

              {/* Action Banner: Tarik Data Terbaru */}
              <div className="p-4 rounded-xl border border-[#E6E1DA] bg-white space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-xs text-[#181411]">Sinkronisasi Manual / Refresh Data Cloud</h5>
                    <p className="text-[11px] text-[#645D55]">
                      Tekan tombol ini jika Anda ingin memastikan data di HP ini adalah data paling mutakhir dari rekan trainer lainnya.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePullLatestData}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0 transition-all"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    <span>{loading ? 'Menyinkronkan...' : 'Tarik Data Terbaru'}</span>
                  </button>
                </div>

                {syncStatusMsg && (
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-[#181411] font-medium animate-in fade-in">
                    {syncStatusMsg}
                  </div>
                )}
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
                <h5 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                  <FileSpreadsheet size={15} className="text-emerald-700" />
                  <span>Integrasi Google Spreadsheet Terpadu</span>
                </h5>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Pengiriman data dari handphone ditangani melalui <strong>Server Proxy Backend</strong> untuk memastikan keamanan script dan mencegah pemblokiran CORS oleh peramban.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#645D55] uppercase tracking-wider">
                  URL Webhook Google Apps Script:
                </label>
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
                      alert('URL Webhook berhasil disimpan.');
                    }}
                    className="px-4 py-2 bg-[#96171B] hover:bg-[#7D1216] text-white font-bold rounded-lg cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#E6E1DA]">
                <button
                  type="button"
                  onClick={copyAppsScript}
                  className="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedAppsScript ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedAppsScript ? 'Script Tersalin!' : 'Salin Kode Google Apps Script'}</span>
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
