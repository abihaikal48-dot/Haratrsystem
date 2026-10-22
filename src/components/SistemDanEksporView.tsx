import React, { useState, useEffect, useMemo } from 'react';
import {
  Settings, Download, Upload, RefreshCw, Database,
  FileSpreadsheet, FileText, CheckCircle2, AlertTriangle,
  ShieldCheck, HardDrive, Trash2, Copy, Check, Sparkles,
  ExternalLink, Printer, Layers, Activity, Lock, ArrowRight,
  Sliders, Shield, Mail, Phone, Building2, User, Award,
  CheckCheck, Search, Filter, HelpCircle, Flame, Clock, CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../lib/storage';
import { SystemSettings, LogAktivitas, Outlet, Kru, TNA,
  RencanaTraining, ObservasiLapangan, CoachingLog,
  BankSOP, BankSoal, PenilaianTeori, PenilaianPraktik,
  PenilaianLisan, CrewCompetencySummary, AppUser
} from '../types';
import { PageHeaderBanner } from './PageHeaderBanner';
import { ModernOptionSelector } from './ModernOptionSelector';

export type SistemSubTab = 'export' | 'backup' | 'settings' | 'diagnostics' | 'logs';

interface SistemDanEksporViewProps {
  initialSubTab?: SistemSubTab;
  onNavigateToTab?: (tab: string) => void;
}

export const SistemDanEksporView: React.FC<SistemDanEksporViewProps> = ({
  initialSubTab = 'export',
  onNavigateToTab,
}) => {
  const [activeTab, setActiveTab] = useState<SistemSubTab>(initialSubTab);

  // System Settings State
  const [settings, setSettings] = useState<SystemSettings>({
    email_penerima: 'management@harachicken.com',
    notif_prioritas_tinggi: 'Ya',
    ambang_pola_berulang: 3,
    hari_pola_berulang: 30,
    nama_perusahaan: 'HARA TRAINING & OPERATIONS',
    lead_trainer: 'Haikal Abi',
    jabatan_lead_trainer: 'Trainer Operasional Cabang',
    nik_trainer: 'HC-TRN-2024-001',
    alamat_kantor: 'HQ Jl. Kebon Jeruk No. 88, Jakarta Barat',
    telepon_kantor: '+62 812-3456-7890',
    bobot_teori: 25,
    bobot_praktik: 50,
    bobot_lisan: 25,
    passing_grade_lulus: 75,
    passing_grade_mahir: 85,
  });

  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Diagnostics & Logs
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [logs, setLogs] = useState<LogAktivitas[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState<'ALL' | 'TAMBAH' | 'UBAH' | 'HAPUS'>('ALL');

  // Backup & Restore State
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreContent, setRestoreContent] = useState<string>('');
  const [restorePreview, setRestorePreview] = useState<any>(null);
  const [restoreMode, setRestoreMode] = useState<'overwrite' | 'merge'>('overwrite');
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  // Printable Template Viewer Modal
  const [activePrintTemplate, setActivePrintTemplate] = useState<string | null>(null);

  // WhatsApp Blast State
  const [waSelectedOutlet, setWaSelectedOutlet] = useState<string>('ALL');
  const [waCopied, setWaCopied] = useState(false);

  const showToast = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 3500);
  };

  const loadData = () => {
    const s = db.getTable<SystemSettings>('settings')[0];
    if (s) {
      setSettings((prev) => ({
        ...prev,
        ...s,
        bobot_teori: s.bobot_teori ?? 25,
        bobot_praktik: s.bobot_praktik ?? 50,
        bobot_lisan: s.bobot_lisan ?? 25,
        passing_grade_lulus: s.passing_grade_lulus ?? 75,
        passing_grade_mahir: s.passing_grade_mahir ?? 85,
        jabatan_lead_trainer: s.jabatan_lead_trainer ?? 'Trainer Operasional Cabang',
      }));
    }
    setLogs(db.getLogs());
    setDiagnostics(db.getStorageDiagnostics());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('*', loadData);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (initialSubTab) setActiveTab(initialSubTab);
  }, [initialSubTab]);

  // Handle Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const totalBobot =
      (settings.bobot_teori || 0) +
      (settings.bobot_praktik || 0) +
      (settings.bobot_lisan || 0);

    if (totalBobot !== 100) {
      alert(`Peringatan: Total bobot asesmen harus bernilai 100%! Saat ini: ${totalBobot}%`);
      return;
    }

    const list = db.getTable<SystemSettings>('settings');
    if (list.length) {
      db.updateRow('settings', (list[0] as any).id || 'settings-1', settings);
    } else {
      db.insertRow('settings', settings);
    }

    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    showToast('Konfigurasi sistem, bobot evaluasi, dan metadata berhasil disimpan!');
  };

  // CSV Exporter Utility
  const downloadCSV = (tableName: string, data: any[], filename: string) => {
    if (!data.length) {
      alert(`Tidak ada data pada tabel ${tableName} untuk diekspor.`);
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows: string[] = [];

    // Header row
    csvRows.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

    // Data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') {
          return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        }
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`File CSV ${filename} berhasil diunduh!`);
  };

  // Full Database JSON Backup Export
  const handleExportFullJSON = () => {
    const jsonStr = db.exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `BACKUP_HARA_PD_PRO_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });
    showToast('Cadangan Database Lengkap (JSON) berhasil diekspor!');
  };

  // File Upload for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setRestoreContent(content);
      try {
        const parsed = JSON.parse(content);
        const data = parsed.data || parsed;
        const counts: Record<string, number> = {};
        for (const k in data) {
          if (Array.isArray(data[k])) counts[k] = data[k].length;
        }
        setRestorePreview({
          version: parsed.version || '2.0',
          exported_at: parsed.exported_at || 'Tidak tercatat',
          exported_by: parsed.exported_by || 'Tidak tercatat',
          counts,
        });
      } catch (err) {
        alert('File yang dipilih bukan file JSON cadangan HARA TRAINER yang valid.');
        setRestoreFile(null);
        setRestorePreview(null);
      }
    };
    reader.readAsText(file);
  };

  // Execute Restore
  const handleExecuteRestore = () => {
    if (!restoreContent) return;
    if (
      !window.confirm(
        `Konfirmasi pemulihan database cadangan? Mode: ${
          restoreMode === 'overwrite' ? 'GANTI TOTAL (OVERWRITE)' : 'GABUNGKAN (MERGE)'
        }. Lanjutkan?`
      )
    ) {
      return;
    }

    const res = db.restoreBackupJSON(restoreContent, restoreMode);
    if (res.success) {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
      showToast(res.message);
      setRestoreFile(null);
      setRestorePreview(null);
      setRestoreContent('');
      loadData();
    } else {
      alert(res.message);
    }
  };

  // Execute Factory Reset
  const handleExecuteReset = () => {
    if (resetConfirmInput !== 'RESET-HARA-2026') {
      alert('Teks konfirmasi keamanan salah! Pembatalan reset.');
      return;
    }

    db.resetToInitialSeed();
    setShowResetModal(false);
    setResetConfirmInput('');
    confetti({ particleCount: 30, spread: 50 });
    showToast('Database berhasil di-reset kembali ke data awal pabrik!');
    loadData();
  };

  // Clear Activity Logs
  const handleClearLogs = () => {
    if (window.confirm('Bersihkan seluruh riwayat log audit aktivitas sistem?')) {
      db.clearActivityLogs();
      showToast('Seluruh riwayat log aktivitas telah dibersihkan.');
      loadData();
    }
  };

  // WhatsApp Blast Summary Generator
  const waBlastMessage = useMemo(() => {
    const outlets = db.getTable<Outlet>('outlets');
    const filteredOutlets =
      waSelectedOutlet === 'ALL'
        ? outlets
        : outlets.filter((o) => o.kode_outlet === waSelectedOutlet);

    const summaries = db.getCrewCompetencySummaries();
    const relevantSummaries =
      waSelectedOutlet === 'ALL'
        ? summaries
        : summaries.filter((s) => s.kode_outlet === waSelectedOutlet);

    const lulusCount = relevantSummaries.filter((s) => s.statusKelulusan === 'LULUS').length;
    const totalKru = relevantSummaries.length;
    const avgScore =
      totalKru > 0
        ? Math.round(relevantSummaries.reduce((a, b) => a + (b.skorAkhir || 0), 0) / totalKru)
        : 0;

    const tnaList = db.getTable<TNA>('tna');
    const openTna = tnaList.filter((t) => t.status !== 'Selesai').length;

    const coachingList = db.getTable<CoachingLog>('coaching_log');

    return `📢 *UPDATE STATUS TRAINER OPERASIONAL & KOMPETENSI KRU*
🏬 *Brand:* PT HARA CHICKEN INDONESIA
📍 *Outlet:* ${
      waSelectedOutlet === 'ALL'
        ? 'Seluruh Jaringan Gerai (All Outlets)'
        : `${filteredOutlets[0]?.nama_outlet || waSelectedOutlet} (${waSelectedOutlet})`
    }
📅 *Tanggal:* ${new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 *RINGKASAN KOMPETENSI KRU (3-PILAR)*
• Total Kru Terdaftar: *${totalKru} Personil*
• Kru Lulus Sertifikasi (≥${settings.passing_grade_lulus || 75}): *${lulusCount} Kru (${
      totalKru > 0 ? Math.round((lulusCount / totalKru) * 100) : 0
    }%)*
• Rata-rata Skor Komposit: *${avgScore} / 100*

🎯 *PROGRESS OPERASIONAL & COACHING*
• Temuan Gap TNA Aktif: *${openTna} Isu*
• Sesi Pendampingan GROW: *${coachingList.length} Sesi Terlaksana*
• Standar Bobot Asesmen: *Teori ${settings.bobot_teori}% | Praktik ${settings.bobot_praktik}% | Lisan ${settings.bobot_lisan}%*

📌 *Catatan Trainer Operasional:*
Mohon seluruh Penanggung Jawab Outlet & Shift Leader memastikan agenda evaluasi berkala dan tindak lanjut pendampingan dijalankan tepat waktu.

_Generated via HARA TRAINING & OPERATIONS System_
👤 *Trainer Operasional:* ${settings.lead_trainer || 'Haikal Abi (Trainer Operasional)'}`;
  }, [waSelectedOutlet, settings]);

  const handleCopyWABlast = () => {
    navigator.clipboard.writeText(waBlastMessage);
    setWaCopied(true);
    setTimeout(() => setWaCopied(false), 2500);
    showToast('Teks pesan WhatsApp Blast berhasil disalin ke clipboard!');
  };

  // Sub Tab Config
  const SUB_TABS = [
    {
      id: 'export' as SistemSubTab,
      label: 'Pusat Ekspor Data & CSV',
      icon: FileSpreadsheet,
      badge: 'Multi-Format',
      desc: 'Download CSV tabel, template cetak A4, & format blast',
    },
    {
      id: 'backup' as SistemSubTab,
      label: 'Cadangan & Pemulihan',
      icon: Database,
      badge: 'JSON Backup',
      desc: 'Ekspor database penuh, impor cadangan, & reset sistem',
    },
    {
      id: 'settings' as SistemSubTab,
      label: 'Konfigurasi Sistem & Bobot',
      icon: Sliders,
      badge: 'Bobot 100%',
      desc: 'Atur bobot asesmen, passing grade, & metadata perusahaan',
    },
    {
      id: 'diagnostics' as SistemSubTab,
      label: 'Diagnostik & Penyimpanan',
      icon: HardDrive,
      badge: diagnostics ? `${diagnostics.usedKb} KB` : 'Ready',
      desc: 'Kesehatan database, pemakaian memori & integritas data',
    },
    {
      id: 'logs' as SistemSubTab,
      label: 'Audit Log Aktivitas',
      icon: Activity,
      badge: `${logs.length} Log`,
      desc: 'Riwayat pencatatan transaksi & perubahan data pengguna',
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1E2530] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* 1. UNIFIED MINIMALIST PAGE HEADER & SUB-TABS */}
      <PageHeaderBanner
        category="SISTEM & EKSPOR"
        title="Pusat Sistem, Konfigurasi & Ekspor Data"
        description="Kelola ekspor tabel ke CSV/Excel, pencadangan database JSON lengkap, penyesuaian bobot asesmen tripartit, monitoring integritas data, dan pelacakan audit log aktivitas."
        icon={<Settings size={22} />}
        rightElement={
          <button
            onClick={handleExportFullJSON}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#96171B] hover:bg-[#801216] text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <Download size={14} />
            <span>Ekspor Backup JSON</span>
          </button>
        }
        tabs={SUB_TABS}
        activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id as SistemSubTab)}
      />

      {/* ========================================================================= */}
      {/* A. PUSAT EKSPOR MULTI-FORMAT (CSV, TEMPLATE CETAK, WHATSAPP BLAST) */}
      {/* ========================================================================= */}
      {activeTab === 'export' && (
        <div className="space-y-5">
          {/* 1. CSV Tables Export Grid */}
          <div className="card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                  <span>Ekspor Data Tabel ke Format CSV / Spreadsheet</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Unduh data spesifik per modul untuk analisis spreadsheet lanjutan di Microsoft Excel atau Google Sheets.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  id: 'outlets',
                  title: 'Master Data Outlet',
                  desc: 'Data gerai, kepala outlet, supervisor, & alamat',
                  count: db.getTable('outlets').length,
                  icon: Building2,
                  color: 'text-blue-700 bg-blue-50 border-blue-200',
                  fetch: () => db.getTable('outlets'),
                },
                {
                  id: 'kru',
                  title: 'Master Data Kru Restoran',
                  desc: 'Data personil kitchen, kasir, geprek & helper',
                  count: db.getTable('kru').length,
                  icon: User,
                  color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
                  fetch: () => db.getTable('kru'),
                },
                {
                  id: 'tna',
                  title: 'TNA Gap Analysis',
                  desc: 'Catatan kesenjangan kompetensi & prioritas training',
                  count: db.getTable('tna').length,
                  icon: Search,
                  color: 'text-purple-700 bg-purple-50 border-purple-200',
                  fetch: () => db.getTable('tna'),
                },
                {
                  id: 'rencana_training',
                  title: 'Rencana Pelatihan',
                  desc: 'Jadwal sesi training, fasilitator & modul',
                  count: db.getTable('rencana_training').length,
                  icon: Clock,
                  color: 'text-amber-700 bg-amber-50 border-amber-200',
                  fetch: () => db.getTable('rencana_training'),
                },
                {
                  id: 'observasi_lapangan',
                  title: 'Audit Observasi Shift',
                  desc: 'Hasil inspeksi suhu fryer, holding & SOP peak hour',
                  count: db.getTable('observasi_lapangan').length,
                  icon: Flame,
                  color: 'text-rose-700 bg-rose-50 border-rose-200',
                  fetch: () => db.getTable('observasi_lapangan'),
                },
                {
                  id: 'coaching_log',
                  title: 'Coaching Log (GROW)',
                  desc: 'Dokumentasi bimbingan 1-on-1 & komitmen kru',
                  count: db.getTable('coaching_log').length,
                  icon: Award,
                  color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                  fetch: () => db.getTable('coaching_log'),
                },
                {
                  id: 'bank_sop',
                  title: 'Bank SOP Resmi',
                  desc: 'Koleksi standar prosedur operasional baku',
                  count: db.getTable('bank_sop').length,
                  icon: FileText,
                  color: 'text-slate-700 bg-slate-100 border-slate-200',
                  fetch: () => db.getTable('bank_sop'),
                },
                {
                  id: 'bank_soal',
                  title: 'Bank Soal Ujian',
                  desc: 'Kumpulan soal pilihan ganda & kunci jawaban',
                  count: db.getTable('bank_soal').length,
                  icon: CheckCheck,
                  color: 'text-purple-700 bg-purple-50 border-purple-200',
                  fetch: () => db.getTable('bank_soal'),
                },
                {
                  id: 'penilaian_onboarding_produk',
                  title: 'Evaluasi Onboarding Multi-Produk',
                  desc: 'Data penilaian praktik 25 SOP produk, skor 5 pilar, & status KKM',
                  count: db.getPenilaianPraktikProduk().length,
                  icon: CheckSquare,
                  color: 'text-rose-700 bg-rose-50 border-rose-200',
                  fetch: () => db.getPenilaianPraktikProduk(),
                },
                {
                  id: 'kompetensi_summary',
                  title: 'Matriks Nilai Komposit Kru',
                  desc: 'Rekapitulasi nilai Teori, Praktik, Lisan & Badge',
                  count: db.getCrewCompetencySummaries().length,
                  icon: ShieldCheck,
                  color: 'text-amber-700 bg-amber-50 border-amber-200',
                  fetch: () => db.getCrewCompetencySummaries(),
                },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className={`p-1.5 rounded-lg border ${item.color}`}>
                          <ItemIcon size={14} />
                        </div>
                        <span className="text-[11px] font-extrabold bg-slate-200/80 px-2 py-0.5 rounded-md text-slate-700">
                          {item.count} Baris
                        </span>
                      </div>
                      <h4 className="font-black text-xs text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                    </div>

                    <button
                      onClick={() => downloadCSV(item.title, item.fetch(), item.id)}
                      className="w-full py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Download size={13} className="text-emerald-600" />
                      <span>Unduh CSV</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Sync ke Google Sheets Gratis (Webhook URL) */}
          <div className="card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4 border-l-4 border-l-emerald-600">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                  <span>Sync ke Google Sheets Gratis (Webhook URL)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full">
                    Cadangan Gratis Selamanya
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Setiap kali nilai evaluasi onboarding produk disimpan, sistem otomatis mengirimkan data baris via HTTP POST ke Google Spreadsheet milik Trainer.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Google Apps Script Web App URL (doPost Endpoint)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                    value={settings.google_sheets_webhook_url || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings({ ...settings, google_sheets_webhook_url: val });
                      localStorage.setItem('hara_google_sheets_webhook_url', val);
                    }}
                    className="input-enterprise text-xs font-mono flex-1"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const url = settings.google_sheets_webhook_url?.trim() || localStorage.getItem('hara_google_sheets_webhook_url')?.trim();
                      if (!url) {
                        alert('Silakan isi Google Apps Script Web App URL terlebih dahulu!');
                        return;
                      }
                      try {
                        await fetch(url, {
                          method: 'POST',
                          mode: 'no-cors',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            event: 'TEST_CONNECTION',
                            source: 'HARA Trainer Pro System',
                            timestamp: new Date().toISOString(),
                            message: 'Tes koneksi webhook Google Sheets sukses!',
                          }),
                        });
                        alert('✅ Permintaan tes webhook berhasil dikirim ke Google Sheets! Periksa tab spreadsheet Anda.');
                      } catch (err: any) {
                        alert('Gagal mengirim ke webhook: ' + (err?.message || err));
                      }
                    }}
                    className="btn-secondary-enterprise !py-1.5 !px-3 text-xs font-bold shrink-0 text-emerald-800 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                  >
                    Tes Kirim
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Biarkan kosong jika hanya ingin menggunakan penyimpanan Cloud Firestore & LocalStorage.
                </p>
              </div>

              {/* Panduan Singkat 3 Langkah */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-[11px] text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>Cara Pasang Skrip Google Sheets Gratis (3 Langkah):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                  <li>Buka Spreadsheet Google baru &gt; menu <b>Extensions</b> &gt; <b>Apps Script</b>.</li>
                  <li>Tempel kode fungsi <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">function doPost(e) &#123; const d = JSON.parse(e.postData.contents); SpreadsheetApp.getActiveSheet().appendRow([d.timestamp, d.payload?.nama_kru, d.payload?.produk_nama, d.payload?.skor_akhir, d.payload?.status_kelulusan]); return ContentService.createTextOutput("OK"); &#125;</code></li>
                  <li>Klik <b>Deploy</b> &gt; <b>New deployment</b> &gt; pilih tipe <b>Web App</b> &gt; Who has access: <b>Anyone</b> &gt; salin URL-nya ke kolom di atas.</li>
                </ol>
              </div>
            </div>
          </div>


          {/* 2. WhatsApp Blast Dispatch Generator */}
          <div className="card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Phone size={16} className="text-emerald-600" />
                  <span>WhatsApp Broadcast & Quick Dispatch Generator</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Format ringkasan laporan otomatis yang siap dikirim langsung ke grup koordinasi Penanggung Jawab Cabang atau WhatsApp Area Supervisor.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="min-w-[180px]">
                  <ModernOptionSelector
                    value={waSelectedOutlet}
                    onChange={(val) => setWaSelectedOutlet(val || 'ALL')}
                    options={[
                      { value: 'ALL', label: 'Semua Outlet (Konsolidasi)' },
                      ...db.getTable<Outlet>('outlets').map((o) => ({
                        value: o.kode_outlet,
                        label: `${o.nama_outlet} (${o.kode_outlet})`,
                        badge: o.kode_outlet,
                      })),
                    ]}
                    inlineChips={false}
                    size="xs"
                    clearable={false}
                  />
                </div>

                <button
                  onClick={handleCopyWABlast}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                    waCopied
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {waCopied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{waCopied ? 'Tersalin!' : 'Salin Pesan WA'}</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto border border-slate-800 selection:bg-emerald-800 selection:text-white">
              {waBlastMessage}
            </div>
          </div>

          {/* 3. Printable Operational Checklists (A4 Templates) */}
          <div className="card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Printer size={16} className="text-blue-600" />
                <span>Dokumen Operasional Siap Cetak (A4 Printable Forms)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cetak lembar formulir fisik untuk evaluasi langsung kru di outlet tanpa perlu membuka laptop di area dapur.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    Rubrik Praktik
                  </span>
                  <h4 className="font-black text-xs text-slate-900">
                    Lembar Uji Praktik Lapangan (50%)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Form rubrik penilaian 3-tingkat eksekusi resep, fryer & 5S sanitasi.
                  </p>
                </div>
                <button
                  onClick={() => setActivePrintTemplate('praktik')}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Preview & Cetak A4</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                    Observasi Shift
                  </span>
                  <h4 className="font-black text-xs text-slate-900">
                    Lembar Audit Observasi Shift
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Checklist audit kepatuhan suhu minyak, holding & greeting 5S.
                  </p>
                </div>
                <button
                  onClick={() => setActivePrintTemplate('observasi')}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Preview & Cetak A4</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    GROW 1-on-1
                  </span>
                  <h4 className="font-black text-xs text-slate-900">
                    Formulir Coaching Log GROW
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Formulir fisik bimbingan Goal, Reality, Options & Will.
                  </p>
                </div>
                <button
                  onClick={() => setActivePrintTemplate('coaching')}
                  className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Preview & Cetak A4</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* B. CADANGAN & PEMULIHAN (BACKUP JSON, RESTORE, FACTORY RESET) */}
      {/* ========================================================================= */}
      {activeTab === 'backup' && (
        <div className="space-y-5">
          {/* Backup Action Card */}
          <div className="card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Database size={16} className="text-[#8C161B]" />
                  <span>Ekspor Cadangan Database Penuh (Full JSON Backup)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Simpan salinan cadangan seluruh data organisasi (14 tabel: Master, TNA, SOP, Soal, Nilai Asesmen, dan Pengaturan).
                </p>
              </div>

              <button
                onClick={handleExportFullJSON}
                className="btn-primary-enterprise !py-2 !px-4 text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Download size={14} />
                <span>Unduh File Cadangan (.JSON)</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Format File</span>
                <div className="font-black text-slate-900">Standard JSON Schema v2.5</div>
                <div className="text-[10.5px] text-slate-500">Kompatibel untuk restorasi kapan saja</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cakupan Data</span>
                <div className="font-black text-slate-900">14 Tabel Terintegrasi</div>
                <div className="text-[10.5px] text-slate-500">Termasuk log aktivitas & pengaturan</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Enkripsi & Keamanan</span>
                <div className="font-black text-slate-900">Client-Side Safe</div>
                <div className="text-[10.5px] text-slate-500">Tidak ada token rahasia yang diekspor</div>
              </div>
            </div>
          </div>

          {/* Restore Backup Card */}
          <div className="card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Upload size={16} className="text-blue-600" />
                <span>Pulihkan Database dari File Cadangan (Restore JSON)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pilih file JSON cadangan untuk memulihkan seluruh data outlet, kru, dan riwayat asesmen.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 text-center bg-slate-50/50 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Upload size={20} />
                  </div>
                  <div className="font-bold text-slate-800">
                    {restoreFile ? restoreFile.name : 'Klik atau seret file cadangan (.json) ke sini'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {restoreFile
                      ? `Ukuran file: ${(restoreFile.size / 1024).toFixed(1)} KB`
                      : 'Mendukung file backup hasil ekspor sistem HARA TRAINER PRO'}
                  </div>
                </div>
              </div>

              {restorePreview && (
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-black text-blue-950 text-xs flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-blue-600" />
                      <span>File Cadangan Terverifikasi Valid</span>
                    </div>
                    <span className="text-[10.5px] font-bold text-blue-800">
                      Versi: {restorePreview.version} • Dibuat: {restorePreview.exported_at.slice(0, 10)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    {Object.entries(restorePreview.counts).map(([k, v]) => (
                      <div key={k} className="p-2 bg-white rounded-lg border border-blue-100">
                        <span className="text-slate-500 uppercase text-[9.5px] font-bold">{k}:</span>
                        <div className="font-black text-slate-900">{v as any} baris</div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-slate-700 text-xs">Mode Pemulihan:</label>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="restore_mode"
                            checked={restoreMode === 'overwrite'}
                            onChange={() => setRestoreMode('overwrite')}
                          />
                          <span className="font-bold text-slate-800">Ganti Total (Overwrite)</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="restore_mode"
                            checked={restoreMode === 'merge'}
                            onChange={() => setRestoreMode('merge')}
                          />
                          <span className="font-bold text-slate-800">Gabungkan (Merge)</span>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleExecuteRestore}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                    >
                      Jalankan Pemulihan Database Sekarang
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone: Factory Reset */}
          <div className="card-enterprise !p-5 bg-rose-50/40 border border-rose-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="font-black text-sm text-rose-900 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-600" />
                  <span>Zona Bahaya: Reset Database ke Data Awal Pabrik (Factory Reset)</span>
                </h3>
                <p className="text-xs text-rose-700">
                  Tindakan ini akan mengembalikan seluruh data tabel ke nilai bawaan pabrik (Default Seed).
                </p>
              </div>

              <button
                onClick={() => setShowResetModal(true)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer shrink-0"
              >
                Reset Database Pabrik
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* C. KONFIGURASI SISTEM, BOBOT ASESMEN & METADATA PERUSAHAAN */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-5">
          {/* 1. Assessment Weights (Tripartite Standard) */}
          <div className="card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Sliders size={16} className="text-[#8C161B]" />
                  <span>Bobot Asesmen Kompetensi Tripartit (Wajib Total 100%)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Tentukan proporsi penilaian antara pemahaman teori, praktik lapangan, dan respon lisan.
                </p>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-black border ${
                  (settings.bobot_teori || 0) +
                    (settings.bobot_praktik || 0) +
                    (settings.bobot_lisan || 0) ===
                  100
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                Total Bobot:{' '}
                {(settings.bobot_teori || 0) +
                  (settings.bobot_praktik || 0) +
                  (settings.bobot_lisan || 0)}
                %
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
                <label className="block font-black text-purple-900">
                  🧠 Bobot Uji Teori SOP (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.bobot_teori}
                  onChange={(e) =>
                    setSettings({ ...settings, bobot_teori: Number(e.target.value) })
                  }
                  className="input-enterprise font-black text-sm text-purple-900"
                />
                <p className="text-[10.5px] text-purple-700">
                  Evaluasi kognitif pemahaman standar kerja SOP.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                <label className="block font-black text-amber-900">
                  🔧 Bobot Uji Praktik Lapangan (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.bobot_praktik}
                  onChange={(e) =>
                    setSettings({ ...settings, bobot_praktik: Number(e.target.value) })
                  }
                  className="input-enterprise font-black text-sm text-amber-900"
                />
                <p className="text-[10.5px] text-amber-700">
                  Eksekusi teknis resep bumbu, fryer & 5S sanitasi.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                <label className="block font-black text-emerald-900">
                  🎤 Bobot Uji Lisan & Respon Kritis (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.bobot_lisan}
                  onChange={(e) =>
                    setSettings({ ...settings, bobot_lisan: Number(e.target.value) })
                  }
                  className="input-enterprise font-black text-sm text-emerald-900"
                />
                <p className="text-[10.5px] text-emerald-700">
                  Roleplay pelayanan, komplain & respon darurat.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Passing Grade Minimal Kelulusan Sertifikat (Skor 0-100)
                </label>
                <input
                  type="number"
                  min={50}
                  max={90}
                  value={settings.passing_grade_lulus}
                  onChange={(e) =>
                    setSettings({ ...settings, passing_grade_lulus: Number(e.target.value) })
                  }
                  className="input-enterprise text-xs font-bold"
                />
                <p className="text-[10.5px] text-slate-500 mt-1">
                  Kru dengan skor akhir komposit di atas angka ini dinyatakan <b>LULUS</b>.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ambang Batas Predikat Mahir (Skor 0-100)
                </label>
                <input
                  type="number"
                  min={70}
                  max={95}
                  value={settings.passing_grade_mahir}
                  onChange={(e) =>
                    setSettings({ ...settings, passing_grade_mahir: Number(e.target.value) })
                  }
                  className="input-enterprise text-xs font-bold"
                />
                <p className="text-[10.5px] text-slate-500 mt-1">
                  Kru dengan skor di atas batas ini berhak atas predikat <b>MAHIR (Level 3)</b>.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Metadata Perusahaan & Penandatangan Dokumen */}
          <div className="card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Building2 size={16} className="text-blue-600" />
                <span>Metadata Organisasi & Penandatangan Sertifikat Resmi</span>
              </h3>
              <p className="text-xs text-slate-500">
                Informasi ini akan tercetak secara otomatis pada sertifikat digital kru dan dokumen laporan resmi.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Organisasi / Brand Perusahaan</label>
                <input
                  type="text"
                  required
                  value={settings.nama_perusahaan}
                  onChange={(e) => setSettings({ ...settings, nama_perusahaan: e.target.value })}
                  className="input-enterprise text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lead Trainer (Penandatangan Sertifikat)
                </label>
                <input
                  type="text"
                  required
                  value={settings.lead_trainer}
                  onChange={(e) => setSettings({ ...settings, lead_trainer: e.target.value })}
                  className="input-enterprise text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jabatan Resmi Penandatangan</label>
                <input
                  type="text"
                  value={settings.jabatan_lead_trainer}
                  onChange={(e) =>
                    setSettings({ ...settings, jabatan_lead_trainer: e.target.value })
                  }
                  className="input-enterprise text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NIK / ID Sertifikasi Trainer</label>
                <input
                  type="text"
                  value={settings.nik_trainer}
                  onChange={(e) => setSettings({ ...settings, nik_trainer: e.target.value })}
                  className="input-enterprise text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Kantor Pusat</label>
                <input
                  type="text"
                  value={settings.alamat_kantor}
                  onChange={(e) => setSettings({ ...settings, alamat_kantor: e.target.value })}
                  className="input-enterprise text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telepon Layanan / Hotline</label>
                <input
                  type="text"
                  value={settings.telepon_kantor}
                  onChange={(e) => setSettings({ ...settings, telepon_kantor: e.target.value })}
                  className="input-enterprise text-xs"
                />
              </div>
            </div>
          </div>

          {/* 3. Recurring Issue Engine & Notifications */}
          <div className="card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <span>Mesin Deteksi Masalah Berulang (Recurring Gap Engine)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Otomatis memberi peringatan merah jika temuan TNA pada outlet & divisi yang sama muncul berulang kali.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Ambang Frekuensi Kejadian (Berapa Kali Muncul)
                </label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={settings.ambang_pola_berulang}
                  onChange={(e) =>
                    setSettings({ ...settings, ambang_pola_berulang: Number(e.target.value) })
                  }
                  className="input-enterprise text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rentang Waktu Analisis (Hari)
                </label>
                <input
                  type="number"
                  min={7}
                  max={90}
                  value={settings.hari_pola_berulang}
                  onChange={(e) =>
                    setSettings({ ...settings, hari_pola_berulang: Number(e.target.value) })
                  }
                  className="input-enterprise text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Email Tujuan Eskalasi & Alert Insiden Kritis
                </label>
                <input
                  type="email"
                  value={settings.email_penerima}
                  onChange={(e) => setSettings({ ...settings, email_penerima: e.target.value })}
                  className="input-enterprise text-xs font-mono"
                />
              </div>

              <div>
                <ModernOptionSelector
                  label="Aktifkan Notifikasi Prioritas Tinggi?"
                  value={settings.notif_prioritas_tinggi}
                  onChange={(val) =>
                    setSettings({ ...settings, notif_prioritas_tinggi: val })
                  }
                  options={[
                    { value: 'Ya', label: 'Ya (Aktifkan Peringatan Merah)' },
                    { value: 'Tidak', label: 'Tidak' },
                  ]}
                  inlineChips
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary-enterprise !py-2.5 !px-6 text-xs font-black shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>Simpan Seluruh Pengaturan Sistem</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* D. DIAGNOSTIK SISTEM & KESEHATAN PENYIMPANAN */}
      {/* ========================================================================= */}
      {activeTab === 'diagnostics' && diagnostics && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="card-enterprise !p-4 bg-white border border-[#E5E0D8] space-y-1 border-l-4 border-l-emerald-600">
              <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Penggunaan Memori</span>
                <HardDrive size={14} className="text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{diagnostics.usedKb} KB</div>
              <div className="text-[10px] text-emerald-700 font-bold">Status: Sangat Optimal (&lt; 5MB)</div>
            </div>

            <div className="card-enterprise !p-4 bg-white border border-[#E5E0D8] space-y-1 border-l-4 border-l-blue-600">
              <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Total Record Data</span>
                <Layers size={14} className="text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{diagnostics.totalRecords} Baris</div>
              <div className="text-[10px] text-blue-700 font-bold">Terdistribusi pada 14 Tabel</div>
            </div>

            <div className="card-enterprise !p-4 bg-white border border-[#E5E0D8] space-y-1 border-l-4 border-l-purple-600">
              <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Integritas Relasi Data</span>
                <ShieldCheck size={14} className="text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {diagnostics.inconsistencies.length === 0 ? '100% Valid' : `${diagnostics.inconsistencies.length} Catatan`}
              </div>
              <div className="text-[10px] text-purple-700 font-bold">Foreign Key & SOP Step Integrity</div>
            </div>
          </div>

          {/* Table Record Counts Grid */}
          <div className="card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Layers size={16} className="text-slate-700" />
              <span>Rincian Baris per Tabel Database</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
              {Object.entries(diagnostics.tableCounts).map(([tableName, count]) => (
                <div
                  key={tableName}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <span className="font-mono text-slate-700 text-[11px] font-bold">{tableName}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-black text-[11px]">
                    {count as any}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Inconsistency Warnings */}
          {diagnostics.inconsistencies.length > 0 && (
            <div className="card-enterprise !p-5 bg-amber-50 border border-amber-200 space-y-3">
              <h3 className="font-black text-sm text-amber-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <span>Peringatan Inkonsistensi Data ({diagnostics.inconsistencies.length})</span>
              </h3>
              <div className="space-y-1 text-xs text-amber-800">
                {diagnostics.inconsistencies.map((inc: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* E. AUDIT LOG AKTIVITAS (TRACKING REALTIME) */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="card-enterprise !p-4 bg-white border border-[#E5E0D8] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari user, tabel, atau kata kunci log..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="input-enterprise !pl-8 text-xs w-full"
                  />
                </div>

                <div className="min-w-[140px]">
                  <ModernOptionSelector
                    value={logActionFilter}
                    onChange={(val) => setLogActionFilter((val || 'ALL') as any)}
                    options={[
                      { value: 'ALL', label: 'Semua Aksi' },
                      { value: 'TAMBAH', label: 'TAMBAH' },
                      { value: 'UBAH', label: 'UBAH' },
                      { value: 'HAPUS', label: 'HAPUS' },
                    ]}
                    inlineChips={false}
                    size="sm"
                    clearable={false}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadCSV('Audit_Log', logs, 'Audit_Log_HARA_PD')}
                  className="btn-secondary-enterprise !py-1.5 !px-3 text-xs flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <Download size={13} />
                  <span>Ekspor CSV</span>
                </button>
                <button
                  onClick={handleClearLogs}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Bersihkan Log</span>
                </button>
              </div>
            </div>
          </div>

          <div className="card-enterprise !p-0 bg-white border border-[#E5E0D8] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Waktu & Tanggal</th>
                    <th className="px-4 py-3">User Pelaksana</th>
                    <th className="px-4 py-3">Aksi</th>
                    <th className="px-4 py-3">Tabel / Modul</th>
                    <th className="px-4 py-3">Detail Perubahan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs
                    .filter((l) => {
                      const matchAction = logActionFilter === 'ALL' || l.aksi === logActionFilter;
                      const matchSearch =
                        !logSearch ||
                        l.detail.toLowerCase().includes(logSearch.toLowerCase()) ||
                        l.user_nama.toLowerCase().includes(logSearch.toLowerCase()) ||
                        l.tabel.toLowerCase().includes(logSearch.toLowerCase());
                      return matchAction && matchSearch;
                    })
                    .slice(0, 50)
                    .map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[10.5px] text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-2.5 font-bold text-slate-900">{log.user_nama}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`badge-enterprise text-[9.5px] ${
                              log.aksi === 'TAMBAH'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                                : log.aksi === 'UBAH'
                                ? 'bg-blue-50 text-blue-800 border-blue-200 font-bold'
                                : 'bg-rose-50 text-rose-800 border-rose-200 font-bold'
                            }`}
                          >
                            {log.aksi}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-slate-700">{log.tabel}</td>
                        <td className="px-4 py-2.5 text-slate-600">{log.detail}</td>
                      </tr>
                    ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 text-xs">
                        Belum ada riwayat audit log aktivitas yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FACTORY RESET CONFIRMATION */}
      {/* ========================================================================= */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
              <AlertTriangle size={20} />
              <span>Konfirmasi Reset Database Pabrik</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Seluruh data kustom, penilaian kru baru, log aktivitas, dan SOP buatan Anda akan dihapus dan dikembalikan ke data awal bawaan sistem.
            </p>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1 text-xs">
              <span className="font-bold text-rose-900">
                Ketikkan kata kunci keamanan di bawah ini untuk melanjutkan:
              </span>
              <div className="font-mono font-black text-rose-700 select-all">RESET-HARA-2026</div>
            </div>

            <input
              type="text"
              placeholder="Ketik RESET-HARA-2026 di sini..."
              value={resetConfirmInput}
              onChange={(e) => setResetConfirmInput(e.target.value)}
              className="input-enterprise text-xs w-full font-mono font-bold"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowResetModal(false)}
                className="btn-secondary-enterprise !py-1.5 !px-3 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteReset}
                disabled={resetConfirmInput !== 'RESET-HARA-2026'}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
              >
                Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRINTABLE A4 TEMPLATE VIEWER */}
      {/* ========================================================================= */}
      {activePrintTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-xs">
                <Printer size={15} className="text-amber-400" />
                <span>
                  Preview Formulir Cetak:{' '}
                  {activePrintTemplate === 'praktik'
                    ? 'Lembar Uji Praktik Lapangan'
                    : activePrintTemplate === 'observasi'
                    ? 'Audit Observasi Shift'
                    : 'Coaching Log GROW'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-primary-enterprise !py-1 !px-3 text-xs font-bold flex items-center gap-1"
                >
                  <Printer size={13} />
                  <span>Cetak / Print</span>
                </button>
                <button
                  onClick={() => setActivePrintTemplate(null)}
                  className="text-white/70 hover:text-white text-xs px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto bg-white text-black space-y-5 text-xs font-sans">
              {/* Official Header */}
              <div className="border-b-2 border-black pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black tracking-tight uppercase">
                    PT HARA CHICKEN INDONESIA
                  </h2>
                  <p className="text-[11px] text-gray-700">
                    Sistem Manajemen Mutu & Standar Kompetensi Operasional Gerai
                  </p>
                </div>
                <div className="text-right text-[10px] font-mono text-gray-600">
                  <div>DOKUMEN RESMI</div>
                  <div>FORM-HARA-OP-2026</div>
                </div>
              </div>

              {/* Form Metadata Fill */}
              <div className="grid grid-cols-2 gap-2 text-[11px] border border-black p-3 rounded-md">
                <div>
                  <b>Nama Outlet / Gerai:</b> ___________________________
                </div>
                <div>
                  <b>Tanggal Pelaksanaan:</b> ___________________________
                </div>
                <div>
                  <b>Nama Kru / Asesi:</b> ___________________________
                </div>
                <div>
                  <b>Nama Asesor / Evaluator:</b> ___________________________
                </div>
                <div>
                  <b>Divisi Kerja:</b> [ ] Kitchen &nbsp; [ ] Kasir &nbsp; [ ] Geprek &nbsp; [ ] Helper
                </div>
                <div>
                  <b>Status Asesmen:</b> [ ] Evaluasi Rutin &nbsp; [ ] Uji Kelulusan
                </div>
              </div>

              {/* Form Rubric Content */}
              {activePrintTemplate === 'praktik' && (
                <div className="space-y-2">
                  <h3 className="font-bold uppercase text-xs border-b border-gray-400 pb-1">
                    RUBRIK PENILAIAN PRAKTIK LAPANGAN (Bobot: 50%)
                  </h3>
                  <table className="w-full border-collapse border border-black text-[10.5px]">
                    <thead>
                      <tr className="bg-gray-100 text-center">
                        <th className="border border-black p-1.5 w-8">No</th>
                        <th className="border border-black p-1.5">Langkah Kerja & Standar Prosedur</th>
                        <th className="border border-black p-1.5 w-16">Sempurna (100)</th>
                        <th className="border border-black p-1.5 w-16">Cukup (70)</th>
                        <th className="border border-black p-1.5 w-16">Kurang (40)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        'Persiapan APD lengkap & kebersihan wastafel cuci tangan 20 detik',
                        'Pengecekan suhu minyak fryer dengan termometer digital (165°C - 175°C)',
                        'Teknik penepungan & perendaman ayam krispi sesuai takaran resep',
                        'Proses penggorengan & timer durasi 12-14 menit tanpa overcrowding',
                        'Penirisan ayam minimal 3 menit sebelum dimasukkan ke holding cabinet',
                        'Pencatatan kartu holding time & batas kedaluwarsa produk (maks 90 menit)',
                        'Sanitasi area kerja, penutupan minyak & standar closing shift',
                      ].map((step, idx) => (
                        <tr key={idx}>
                          <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                          <td className="border border-black p-1.5">{step}</td>
                          <td className="border border-black p-1.5 text-center">[ &nbsp; ]</td>
                          <td className="border border-black p-1.5 text-center">[ &nbsp; ]</td>
                          <td className="border border-black p-1.5 text-center">[ &nbsp; ]</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-12 text-center text-xs">
                <div>
                  <div>Kru yang Dievaluasi,</div>
                  <div className="h-16" />
                  <div className="border-t border-black font-bold pt-1">
                    ( ___________________________ )
                  </div>
                </div>
                <div>
                  <div>Lead Trainer / Asesor Penilai,</div>
                  <div className="h-16" />
                  <div className="border-t border-black font-bold pt-1">
                    ( {settings.lead_trainer} )
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
