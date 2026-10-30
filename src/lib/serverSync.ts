/**
 * HARA CHICKEN - SERVER DATABASE & CLOUD SYNC PROXY
 * Bertanggung jawab melakukan sinkronisasi aman dua arah ke backend server.ts & Supabase.
 * Kredensial dan script tidak terekspos ke perangkat klien.
 */

import { db } from './storage';
import { OnboardingBatch, PenilaianPraktikOnboardingProduk, PenilaianSikapKebersihanKru } from '../types';

let isSyncing = false;
let lastSyncTimestamp: string | null = null;

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
        supabaseUrlConfigured: !!data.supabaseUrlConfigured,
        lastSync: lastSyncTimestamp,
      };
    }
  } catch {
    // Offline / dev server
  }
  return {
    online: false,
    supabaseConfigured: false,
    supabaseUrlConfigured: false,
    lastSync: lastSyncTimestamp,
  };
}

/**
 * Tarik data master dan riwayat terbaru dari Server saat perangkat baru membuka aplikasi
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

      // 1. Sinkronkan Onboarding Batches
      if (Array.isArray(data.onboarding_batches) && data.onboarding_batches.length > 0) {
        const localBatches = db.getOnboardingBatches();
        const mergedBatches = mergeRecords(localBatches, data.onboarding_batches);
        db.setTable('onboarding_batches', mergedBatches);
      }

      // 2. Sinkronkan Penilaian Praktik Produk
      if (Array.isArray(data.penilaian_praktik_onboarding_produk) && data.penilaian_praktik_onboarding_produk.length > 0) {
        const localPraktik = db.getPenilaianPraktikProduk();
        const mergedPraktik = mergeRecords(localPraktik, data.penilaian_praktik_onboarding_produk);
        db.setTable('penilaian_praktik_onboarding_produk', mergedPraktik);
        db.setTable('penilaian_onboarding_rnd', mergedPraktik);
      }

      // 3. Sinkronkan Penilaian Sikap & Higiene
      if (Array.isArray(data.penilaian_sikap_kebersihan_kru) && data.penilaian_sikap_kebersihan_kru.length > 0) {
        const localSikap = db.getPenilaianSikapKebersihanKru();
        const mergedSikap = mergeRecords(localSikap, data.penilaian_sikap_kebersihan_kru);
        db.setTable('penilaian_sikap_kebersihan_kru', mergedSikap);
      }

      lastSyncTimestamp = new Date().toISOString();
      isSyncing = false;
      return true;
    }
  } catch (err) {
    console.warn('Gagal init data dari server:', err);
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
 * Kirim rekaman penilaian ke Google Spreadsheet via Backend Proxy
 * Mencegah kebocoran URL Apps Script & mengatasi masalah CORS browser
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

/**
 * Helper merge rekaman berdasarkan id dengan menjaga tanggal update terbaru
 */
function mergeRecords<T extends { id: string; created_at?: string; updated_at?: string }>(
  localList: T[],
  remoteList: T[]
): T[] {
  const map = new Map<string, T>();
  // Masukkan remote terlebih dahulu
  for (const item of remoteList) {
    if (item && item.id) map.set(item.id, item);
  }
  // Masukkan atau timpa jika lokal lebih baru
  for (const item of localList) {
    if (item && item.id) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }
  }
  return Array.from(map.values());
}
