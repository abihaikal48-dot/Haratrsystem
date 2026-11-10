/**
 * HARA CHICKEN - SERVER DATABASE & CLOUD SYNC PROXY
 * Bertanggung jawab melakukan sinkronisasi aman dua arah ke backend server & Supabase.
 * Menjamin multi-perangkat (HP 1, HP 2, Laptop) selalu terhubung dan otomatis sinkron.
 */

import { db } from './storage';
import { getSupabaseConfig, saveSupabaseCredentials, getSupabase } from './supabase';

let isSyncing = false;
let lastSyncTimestamp: string | null = null;
let lastDataSignature = '';

export interface ServerDbStatus {
  online: boolean;
  supabaseConfigured: boolean;
  supabaseUrlConfigured: boolean;
  lastSync: string | null;
}

/**
 * Periksa status koneksi backend server & Supabase
 */
export async function checkServerStatus(): Promise<ServerDbStatus> {
  try {
    const res = await fetch('/api/db/status');
    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        supabaseConfigured: !!data.supabaseConfigured,
        supabaseUrlConfigured: !!data.supabaseConfigured,
        lastSync: lastSyncTimestamp,
      };
    }
  } catch {
    // offline
  }
  return {
    online: false,
    supabaseConfigured: false,
    supabaseUrlConfigured: false,
    lastSync: lastSyncTimestamp,
  };
}

/**
 * Helper merge rekaman berdasarkan id dengan menjaga keutuhan data terbaru
 */
function mergeRecords<T extends { id?: string; created_at?: string; updated_at?: string; kode_outlet?: string }>(
  localList: T[],
  remoteList: T[],
  tableName?: string
): { merged: T[]; changed: boolean } {
  if (!Array.isArray(localList)) localList = [];
  if (!Array.isArray(remoteList)) remoteList = [];

  const map = new Map<string, T>();
  let changed = false;

  const getKey = (item: any): string => {
    if (tableName === 'outlets' && item.kode_outlet) {
      return `outlet-${String(item.kode_outlet).trim().toUpperCase()}`;
    }
    return String(item.id || '');
  };

  // 1. Masukkan semua data lokal ke map
  localList.forEach((item) => {
    if (item && (item.id || (item as any).kode_outlet)) {
      map.set(getKey(item), item);
    }
  });

  const initialCount = map.size;

  // 2. Gabungkan data remote (cloud/server)
  remoteList.forEach((remoteItem) => {
    if (!remoteItem || (!remoteItem.id && !(remoteItem as any).kode_outlet)) return;
    const itemKey = getKey(remoteItem);
    const existing = map.get(itemKey);

    if (!existing) {
      map.set(itemKey, remoteItem);
      changed = true;
    } else {
      // Bandingkan timestamp jika ada
      const remoteTime = (remoteItem as any).updated_at || (remoteItem as any).created_at || '';
      const localTime = (existing as any).updated_at || (existing as any).created_at || '';
      if (remoteTime && (!localTime || remoteTime >= localTime)) {
        if (JSON.stringify(existing) !== JSON.stringify(remoteItem)) {
          map.set(itemKey, { ...existing, ...remoteItem });
          changed = true;
        }
      }
    }
  });

  if (map.size !== initialCount) {
    changed = true;
  }

  return { merged: Array.from(map.values()), changed };
}

/**
 * Tarik data master dan riwayat terbaru dari Server saat membuka aplikasi atau via polling
 */
export async function initClientDataFromServer(): Promise<boolean> {
  if (isSyncing) return false;
  isSyncing = true;

  try {
    const res = await fetch('/api/db/init');
    if (!res.ok) {
      isSyncing = false;
      return false;
    }

    const json = await res.json();
    if (json.success && json.data) {
      const data = json.data;
      let anyTableChanged = false;

      // 1. Jika server menyediakan kredensial Supabase terpusat dan lokal belum punya, otomatis adopsi
      if (json.supabaseConfig && json.supabaseConfig.url && json.supabaseConfig.anonKey) {
        const localCfg = getSupabaseConfig();
        if (!localCfg.isConfigured) {
          saveSupabaseCredentials(json.supabaseConfig.url, json.supabaseConfig.anonKey);
        }
      }

      // Adopsi Webhook Google Sheets terpusat dari server jika ada
      if (json.googleSheetsWebhookUrl) {
        try {
          const savedHook = localStorage.getItem('hara_google_sheet_webhook_url');
          if (!savedHook) {
            localStorage.setItem('hara_google_sheet_webhook_url', json.googleSheetsWebhookUrl);
          }
        } catch {
          // ignore
        }
      }

      // 2. Daftar tabel yang harus disinkronkan secara otomatis antar-HP
      const tablesToSync = [
        'app_users',
        'penilaian_praktik_onboarding_produk',
        'onboarding_batches',
        'kru',
        'outlets',
        'bank_sop',
        'penilaian_sikap_kebersihan_kru',
        'penilaian_jobdesk_stasiun',
        'penilaian_tim_stasiun',
        'attitude_hara',
        'hasil_ujian_mingguan',
        'penugasan_trainer',
        'tna',
        'rencana_training',
        'observasi_lapangan',
        'coaching_log',
        'gap_analysis',
        'kartu_keluhan',
        'talent_tracker',
        'ojt_monitoring',
      ];

      for (const tableKey of tablesToSync) {
        const remoteTable = data[tableKey];
        if (Array.isArray(remoteTable)) {
          if (tableKey === 'app_users' && remoteTable.length > 0) {
            db.setDirectLocalOnly('app_users', remoteTable);
            db.notify('app_users');
            anyTableChanged = true;
            continue;
          }

          const localTable = db.getTable<any>(tableKey);
          const { merged, changed } = mergeRecords(localTable, remoteTable, tableKey);
          if (changed) {
            db.setDirectLocalOnly(tableKey, merged);
            if (tableKey === 'penilaian_praktik_onboarding_produk') {
              db.setDirectLocalOnly('penilaian_onboarding_rnd', merged);
              db.setDirectLocalOnly('penilaian_onboarding_tc', merged);
            }
            db.notify(tableKey);
            anyTableChanged = true;
          }
        }
      }

      // Periksa tabel lain yang ada di server store
      for (const [key, val] of Object.entries(data)) {
        if (!key.startsWith('_') && !tablesToSync.includes(key) && Array.isArray(val) && val.length > 0) {
          const localTable = db.getTable<any>(key);
          const { merged, changed } = mergeRecords(localTable, val, key);
          if (changed) {
            db.setDirectLocalOnly(key, merged);
            db.notify(key);
            anyTableChanged = true;
          }
        }
      }

      if (anyTableChanged) {
        db.notify('*');
      }

      lastSyncTimestamp = new Date().toISOString();
      isSyncing = false;
      return anyTableChanged;
    }
  } catch (err) {
    // Server fetch warning (offline mode fallback)
  }

  isSyncing = false;
  return false;
}

/**
 * Kirim rekaman data yang baru disimpan / diubah ke server backend
 */
export async function pushToServer(
  table: string,
  recordOrRecords: any | any[],
  action: 'UPSERT' | 'DELETE' = 'UPSERT'
): Promise<boolean> {
  try {
    const payload = {
      table,
      records: Array.isArray(recordOrRecords) ? recordOrRecords : [recordOrRecords],
      action,
    };

    const res = await fetch('/api/db/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      lastSyncTimestamp = new Date().toISOString();
      return true;
    }
  } catch (err) {
    console.warn(`Gagal push ${table} ke server:`, err);
  }
  return false;
}

/**
 * Simpan konfigurasi Supabase terpusat ke server agar seluruh HP otomatis tersambung
 */
export async function saveCentralSupabaseConfig(url: string, anonKey: string): Promise<boolean> {
  try {
    const res = await fetch('/api/db/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, anonKey }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Jalankan polling otomatis (setiap 2.5 detik dan saat aplikasi dibuka/fokus)
 * Menjamin perubahan yang diinput di HP 1 langsung muncul di HP 2 secara otomatis.
 */
export function startAutoSyncPolling(intervalMs: number = 2500): () => void {
  // 1. Sinkronkan langsung saat pertama kali dipanggil
  initClientDataFromServer().catch(() => {});

  // 2. Jalankan polling berkala
  const timer = setInterval(() => {
    initClientDataFromServer().catch(() => {});
  }, intervalMs);

  // 3. Sinkronkan seketika saat window/tab kembali aktif (fokus)
  const onFocus = () => {
    initClientDataFromServer().catch(() => {});
  };

  const onVisibilityChange = () => {
    if (!document.hidden) {
      initClientDataFromServer().catch(() => {});
    }
  };

  window.addEventListener('focus', onFocus);
  document.addEventListener('visibilitychange', onVisibilityChange);

  return () => {
    clearInterval(timer);
    window.removeEventListener('focus', onFocus);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}

export const startServerPollingSync = startAutoSyncPolling;

/**
 * Kirim rekaman penilaian ke Google Spreadsheet via Backend Proxy
 */
export async function proxyGoogleSheetSync(
  payload: any,
  customWebhookUrl?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/sync/spreadsheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, webhookUrl: customWebhookUrl }),
    });

    const data = await res.json();
    return {
      success: res.ok && data.success,
      message: data.message || (res.ok ? 'Terkirim ke Spreadsheet' : 'Gagal kirim ke Spreadsheet'),
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menghubungi server proxy spreadsheet: ${err?.message || 'Koneksi putus'}`,
    };
  }
}
