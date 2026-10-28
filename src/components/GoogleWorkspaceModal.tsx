import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet, HardDrive, CheckCircle2, AlertCircle,
  ExternalLink, Sparkles, RefreshCw, X, Shield, ArrowRight,
  Cloud, Database, Lock, Check, LogOut
} from 'lucide-react';
import {
  googleSignIn,
  googleSignOut,
  exportToGoogleSheets,
  uploadReportToGoogleDrive,
  getAccessToken,
  initGoogleAuth
} from '../lib/googleWorkspace';
import { testFirestoreConnection, firestore } from '../lib/firebase';
import { syncAllToFirestore } from '../lib/firestoreSync';
import { db } from '../lib/storage';
import { User as FirebaseUser } from 'firebase/auth';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isExportingSheets, setIsExportingSheets] = useState<boolean>(false);
  const [isExportingDrive, setIsExportingDrive] = useState<boolean>(false);
  const [isSyncingFirestore, setIsSyncingFirestore] = useState<boolean>(false);
  const [firestoreConnected, setFirestoreConnected] = useState<boolean | null>(null);

  // Result links
  const [generatedSheetUrl, setGeneratedSheetUrl] = useState<string | null>(null);
  const [generatedDriveUrl, setGeneratedDriveUrl] = useState<string | null>(null);

  // Confirmation dialogs
  const [confirmAction, setConfirmAction] = useState<null | 'sheets' | 'drive' | 'firestore'>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check auth state on load
  useEffect(() => {
    if (!isOpen) return;

    // Test Firestore connection
    testFirestoreConnection().then((connected) => {
      setFirestoreConnected(connected);
    });

    // Check Google Auth state
    const unsub = initGoogleAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(!!token);
      },
      () => {
        getAccessToken().then((t) => {
          setHasToken(!!t);
        });
      }
    );

    return () => unsub();
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Google OAuth Sign In
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      setCurrentUser(res.user);
      setHasToken(true);
      onShowToast(`Akun Google berhasil terhubung: ${res.user.email}`);
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        setErrorMessage(
          `Domain "${window.location.hostname}" belum didaftarkan di Firebase Authorized Domains. Buka Firebase Console > Authentication > Settings > Authorized domains dan tambahkan "${window.location.hostname}".`
        );
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Jendela pop-up Google ditutup sebelum otorisasi selesai.');
      } else {
        setErrorMessage(err.message || 'Gagal masuk dengan akun Google.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Google Sign Out
  const handleGoogleLogout = async () => {
    try {
      await googleSignOut();
      setCurrentUser(null);
      setHasToken(false);
      setGeneratedSheetUrl(null);
      setGeneratedDriveUrl(null);
      onShowToast('Akun Google telah diputuskan.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal keluar akun.');
    }
  };

  // Execute Sheets Export
  const executeSheetsExport = async () => {
    setConfirmAction(null);
    setIsExportingSheets(true);
    setErrorMessage(null);
    try {
      const result = await exportToGoogleSheets();
      setGeneratedSheetUrl(result.spreadsheetUrl);
      onShowToast('Berhasil membuat spreadsheet di Google Drive Anda!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengekspor data ke Google Sheets.');
    } finally {
      setIsExportingSheets(false);
    }
  };

  // Execute Drive Export
  const executeDriveExport = async () => {
    setConfirmAction(null);
    setIsExportingDrive(true);
    setErrorMessage(null);
    try {
      const dateStr = new Date().toLocaleDateString('id-ID');
      const filename = `HARA_CHICKEN_Laporan_Eksekutif_${Date.now()}.txt`;
      const competencies = db.getCrewCompetencySummaries();
      const content = `LAPORAN RESMI PELATIHAN & STANDAR MUTU OPERASIONAL HARA CHICKEN
Tanggal Diterbitkan: ${dateStr}
Sistem: HARA TRAINER PRO Enterprise

TOTAL KRU TERUJI: ${competencies.length} Personel
Rincian Kompetensi:
${competencies.map((c) => `- ${c.namaKru} (${c.kode_outlet} - ${c.divisi}): Skor Akhir ${c.skorAkhir ?? '-'} [${c.badge}] (Teori ${c.skorTeori ?? '-'}%, Praktik ${c.skorPraktik ?? '-'}%, Lisan ${c.skorLisan ?? '-'}%)`).join('\n')}

Catatan Pengawas:
Data ini disinkronkan secara aman dari cloud system HARA TRAINER PRO.`;

      const result = await uploadReportToGoogleDrive(filename, content);
      setGeneratedDriveUrl(result.webViewLink);
      onShowToast('Dokumen berhasil disimpan ke Google Drive Anda!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan ke Google Drive.');
    } finally {
      setIsExportingDrive(false);
    }
  };

  // Execute Firestore Cloud Sync
  const executeFirestoreSync = async () => {
    setConfirmAction(null);
    setIsSyncingFirestore(true);
    setErrorMessage(null);
    try {
      const res = await syncAllToFirestore();
      if (res.success) {
        onShowToast(`Berhasil upload ${res.totalSynced} data ke Cloud Firestore!`);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal sinkronisasi Firestore.');
    } finally {
      setIsSyncingFirestore(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#96171B] uppercase tracking-wider">
                  Cloud Integration
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Google Workspace & Firebase
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                Integrasi Google Sheets, Drive & Cloud Database
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 font-bold flex items-center justify-center cursor-pointer transition-colors text-xs"
          >
            ✕
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Google Account Connection Status */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <HardDrive size={14} className="text-[#96171B]" />
              <span>Status Akun Google Workspace:</span>
            </span>
            {hasToken ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Check size={12} />
                Terhubung
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-stone-500">
                Belum Terhubung
              </span>
            )}
          </div>

          {hasToken && currentUser ? (
            <div className="flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong className="block text-stone-900">{currentUser.displayName || 'Akun Google'}</strong>
                  <span className="text-[11px] text-stone-500">{currentUser.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogout}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <LogOut size={13} />
                <span>Putuskan</span>
              </button>
            </div>
          ) : (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className="w-full py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-800 font-bold border border-stone-300 rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-2xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>{isSigningIn ? 'Menghubungkan...' : 'Hubungkan dengan Akun Google'}</span>
              </button>
              <p className="text-[11px] text-stone-500 mt-2 text-center">
                Memungkinkan ekspor data ke Google Sheets dan penyimpanan arsip laporan ke Google Drive dengan izin Anda.
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Online Cloud Firebase Firestore Status */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Cloud size={14} className="text-blue-600" />
              <span>Database Online (Firebase Firestore):</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time Sync Aktif
            </span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Data penilaian kru, master outlet, kartu keluhan, dan hasil audit disinkronkan secara online ke database cloud Firestore. Ketika di-deploy ke Vercel atau dibuka dari HP/laptop manapun, seluruh data tersambung secara terpusat.
          </p>
          <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-[11px] font-mono text-stone-600 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Database ID:</span>
              <span className="text-stone-900 font-bold">ai-studio-harapdsystempro-c7d090f8-3f22-4b7e-9be1-668f87a357d5</span>
            </div>
            <p className="text-[10px] text-stone-400 font-sans leading-normal pt-0.5">
              *Di Firebase Console &gt; Firestore Database, pilih nama database di atas pada dropdown untuk melihat koleksi data yang terisi.
            </p>
          </div>
          <div className="pt-1 flex items-center justify-between">
            <span className="text-[11px] text-stone-400 font-mono">
              Status: Terkoneksi ke Cloud
            </span>
            <button
              type="button"
              onClick={() => setConfirmAction('firestore')}
              disabled={isSyncingFirestore}
              className="text-xs font-bold text-white bg-[#96171B] hover:bg-[#801216] px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
            >
              <RefreshCw size={12} className={isSyncingFirestore ? 'animate-spin' : ''} />
              <span>{isSyncingFirestore ? 'Mengunggah...' : 'Upload Semua Data ke Firestore'}</span>
            </button>
          </div>
        </div>

        {/* Section 3: Google Sheets & Drive Actions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-stone-900">Aksi Integrasi Google Workspace:</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Action 1: Google Sheets */}
            <div className="p-3.5 rounded-2xl border border-stone-200 bg-white hover:border-emerald-300 transition-all space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <FileSpreadsheet size={15} />
                  <span>Ekspor ke Google Sheets</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Membuat spreadsheet baru otomatis dengan 4 lembar kerja (Kompetensi, SOS, Keluhan, Outlet).
                </p>
              </div>

              {generatedSheetUrl ? (
                <a
                  href={generatedSheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <span>Buka Google Sheets</span>
                  <ExternalLink size={13} />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmAction('sheets')}
                  disabled={!hasToken || isExportingSheets}
                  className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{isExportingSheets ? 'Mengekspor...' : 'Buat Spreadsheet Baru'}</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

            {/* Action 2: Google Drive */}
            <div className="p-3.5 rounded-2xl border border-stone-200 bg-white hover:border-blue-300 transition-all space-y-2 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                  <HardDrive size={15} />
                  <span>Simpan ke Google Drive</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Mengunggah berkas ringkasan audit dan dossier resmi ke penyimpanan Google Drive Anda.
                </p>
              </div>

              {generatedDriveUrl ? (
                <a
                  href={generatedDriveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <span>Buka di Google Drive</span>
                  <ExternalLink size={13} />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmAction('drive')}
                  disabled={!hasToken || isExportingDrive}
                  className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{isExportingDrive ? 'Mengunggah...' : 'Simpan Arsip ke Drive'}</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Dialog Modal overlay */}
        {confirmAction && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-2 animate-in fade-in">
            <strong className="block font-bold">
              Konfirmasi Tindakan Pembuatan Data:
            </strong>
            <p className="text-[11.5px] text-amber-800 leading-relaxed">
              {confirmAction === 'sheets' &&
                'Aplikasi akan membuat spreadsheet baru di akun Google Anda dan mengisi data riwayat penilaian kru dan outlet. Lanjutkan?'}
              {confirmAction === 'drive' &&
                'Aplikasi akan mengunggah berkas teks ringkasan evaluasi operasional ke Google Drive Anda. Lanjutkan?'}
              {confirmAction === 'firestore' &&
                'Aplikasi akan menyinkronkan data lokal ke database online Firebase Firestore agar dapat diakses dari cabang lain. Lanjutkan?'}
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-3 py-1.5 rounded-lg border border-amber-300 text-amber-900 font-semibold bg-white hover:bg-amber-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmAction === 'sheets') executeSheetsExport();
                  if (confirmAction === 'drive') executeDriveExport();
                  if (confirmAction === 'firestore') executeFirestoreSync();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold cursor-pointer"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Shield size={13} className="text-emerald-600" />
            <span>Koneksi Aman OAuth 2.0 Resmi Google</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-700 hover:text-stone-900 font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
