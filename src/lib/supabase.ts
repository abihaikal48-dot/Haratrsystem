import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { db } from './storage';
import { Outlet, Kru, BankSOP } from '../types';

export type SupabaseStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

const STORAGE_KEYS = {
  URL: 'hara_supabase_url',
  ANON_KEY: 'hara_supabase_anon_key',
};

// Default fallback to environment variables if provided
function getStoredUrl(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEYS.URL);
    if (stored && stored.trim().length > 0) return stored.trim();
  }
  return ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
}

function getStoredAnonKey(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEYS.ANON_KEY);
    if (stored && stored.trim().length > 0) return stored.trim();
  }
  return ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();
}

let activeClient: SupabaseClient | null = null;
let currentStatus: SupabaseStatus = 'disconnected';
const statusListeners = new Set<(status: SupabaseStatus) => void>();

function setStatus(newStatus: SupabaseStatus) {
  if (currentStatus !== newStatus) {
    currentStatus = newStatus;
    statusListeners.forEach((fn) => fn(newStatus));
  }
}

export function subscribeSupabaseStatus(callback: (status: SupabaseStatus) => void): () => void {
  statusListeners.add(callback);
  callback(currentStatus);
  return () => {
    statusListeners.delete(callback);
  };
}

export function getSupabaseStatus(): SupabaseStatus {
  return currentStatus;
}

export function getSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean } {
  const url = getStoredUrl();
  const anonKey = getStoredAnonKey();
  const isConfigured = Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 20);
  return { url, anonKey, isConfigured };
}

/**
 * Mendapatkan instance Supabase client yang aktif.
 */
export function getSupabase(): SupabaseClient | null {
  if (activeClient) return activeClient;

  const { url, anonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    setStatus('disconnected');
    return null;
  }

  try {
    activeClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    return activeClient;
  } catch (err) {
    console.error('Gagal menginisialisasi Supabase client:', err);
    setStatus('error');
    return null;
  }
}

/**
 * Uji konektivitas ke Supabase project.
 */
export async function testSupabaseConnection(
  testUrl?: string,
  testKey?: string
): Promise<{ success: boolean; message: string; tableCount?: number }> {
  const targetUrl = testUrl || getStoredUrl();
  const targetKey = testKey || getStoredAnonKey();

  if (!targetUrl || !targetKey) {
    setStatus('disconnected');
    return {
      success: false,
      message: 'Project URL dan Anon Key Supabase belum diisi.',
    };
  }

  setStatus('connecting');

  try {
    const testClient = createClient(targetUrl, targetKey);
    // Jalankan query ringan pada tabel outlets atau app_store
    const { data, error } = await testClient.from('outlets').select('id').limit(1);

    if (error) {
      // Jika tabel belum dibuat, coba test app_store atau cek error code
      if (error.code === '42P01') {
        // Table does not exist yet (skema belum di-run)
        setStatus('connected');
        return {
          success: true,
          message: 'Terkoneksi ke Supabase! Perhatian: Tabel database belum dibuat. Silakan jalankan script SQL Schema di SQL Editor Supabase.',
          tableCount: 0,
        };
      }
      setStatus('error');
      return {
        success: false,
        message: `Koneksi ditolak: ${error.message} (Kode: ${error.code || 'UNKNOWN'})`,
      };
    }

    setStatus('connected');
    return {
      success: true,
      message: 'Berhasil terhubung ke Supabase! Database siap digunakan secara online & real-time.',
      tableCount: data ? data.length : 0,
    };
  } catch (err: any) {
    setStatus('error');
    return {
      success: false,
      message: `Gagal menghubungi endpoint Supabase: ${err.message || 'Network error'}`,
    };
  }
}

/**
 * Simpan kredensial Supabase dan restart koneksi client.
 */
export async function saveSupabaseCredentials(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return { success: false, message: 'Project URL harus diawali dengan https://' };
  }
  if (cleanKey.length < 20) {
    return { success: false, message: 'Anon Key tidak valid (terlalu pendek).' };
  }

  const testResult = await testSupabaseConnection(cleanUrl, cleanKey);
  if (!testResult.success) {
    return testResult;
  }

  localStorage.setItem(STORAGE_KEYS.URL, cleanUrl);
  localStorage.setItem(STORAGE_KEYS.ANON_KEY, cleanKey);

  // Buat client baru
  activeClient = createClient(cleanUrl, cleanKey);
  setStatus('connected');

  // Trigger auto seed & realtime
  setTimeout(() => {
    autoSeedSupabaseIfEmpty();
    initSupabaseRealtimeSync();
  }, 100);

  return {
    success: true,
    message: 'Kredensial Supabase berhasil disimpan dan tersambung.',
  };
}

/**
 * Hapus konfigurasi kredensial dari localStorage.
 */
export function removeSupabaseCredentials(): void {
  localStorage.removeItem(STORAGE_KEYS.URL);
  localStorage.removeItem(STORAGE_KEYS.ANON_KEY);
  activeClient = null;
  setStatus('disconnected');
}

/**
 * Menulis / menyinkronkan 1 baris ke tabel Supabase spesifik secara asynchronous.
 */
export async function syncRowToSupabase(tableName: string, row: any): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const validTableMap: Record<string, string> = {
    outlets: 'outlets',
    kru: 'kru',
    bank_sop: 'bank_sop',
    hasil_ujian_mingguan: 'hasil_ujian_mingguan',
    kartu_keluhan: 'kartu_keluhan',
    tna: 'tna',
    rencana_training: 'rencana_training',
    observasi: 'observasi_lapangan',
    observasi_lapangan: 'observasi_lapangan',
    coaching: 'coaching_log',
    coaching_log: 'coaching_log',
    gap_analysis: 'gap_analysis',
    gap: 'gap_analysis',
    penilaian_teori: 'penilaian_teori',
    penilaian_praktik: 'penilaian_praktik',
    penilaian_lisan: 'penilaian_lisan',
    talent_tracker: 'talent_tracker',
    ojt_monitoring: 'ojt_monitoring',
    logs: 'log_aktivitas',
    log_aktivitas: 'log_aktivitas',
    app_users: 'app_users',
    users: 'app_users',
  };

  const targetTable = validTableMap[tableName];

  try {
    // 1. Simpan ke app_store fleksibel untuk data redundancy
    const fullTableData = db.getTable(tableName);
    await supabase.from('app_store').upsert(
      {
        key: tableName,
        value: fullTableData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    // 2. Simpan juga ke structured table jika didukung
    if (targetTable && row && row.id) {
      await supabase.from(targetTable).upsert(row, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn(`[Supabase Sync] Gagal sinkron baris ke ${tableName}:`, err);
  }
}

/**
 * Menghapus baris dari tabel Supabase.
 */
export async function deleteRowFromSupabase(tableName: string, id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const validTableMap: Record<string, string> = {
    outlets: 'outlets',
    kru: 'kru',
    bank_sop: 'bank_sop',
    hasil_ujian_mingguan: 'hasil_ujian_mingguan',
    kartu_keluhan: 'kartu_keluhan',
    tna: 'tna',
    rencana_training: 'rencana_training',
    observasi_lapangan: 'observasi_lapangan',
    coaching_log: 'coaching_log',
    gap_analysis: 'gap_analysis',
    penilaian_teori: 'penilaian_teori',
    penilaian_praktik: 'penilaian_praktik',
    penilaian_lisan: 'penilaian_lisan',
    talent_tracker: 'talent_tracker',
    ojt_monitoring: 'ojt_monitoring',
    log_aktivitas: 'log_aktivitas',
    app_users: 'app_users',
    users: 'app_users',
  };

  const targetTable = validTableMap[tableName];

  try {
    if (targetTable) {
      await supabase.from(targetTable).delete().eq('id', id);
    }
    // Update snapshot di app_store
    const fullTableData = db.getTable(tableName);
    await supabase.from('app_store').upsert(
      {
        key: tableName,
        value: fullTableData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );
  } catch (err) {
    console.warn(`[Supabase Sync] Gagal menghapus baris dari ${tableName}:`, err);
  }
}

/**
 * Migrasi seluruh data awal (12 Kru, 11 Outlets, SOP, Ujian) ke Supabase jika tabel masih kosong.
 */
export async function autoSeedSupabaseIfEmpty(): Promise<{
  seeded: boolean;
  message: string;
  count: number;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { seeded: false, message: 'Supabase belum terkonfigurasi', count: 0 };
  }

  try {
    // Periksa apakah tabel outlets sudah ada isi
    const { data: existingOutlets, error: checkError } = await supabase
      .from('outlets')
      .select('id')
      .limit(1);

    if (checkError) {
      console.warn('Gagal cek tabel outlets:', checkError.message);
      return { seeded: false, message: `Tabel belum ada: ${checkError.message}`, count: 0 };
    }

    if (existingOutlets && existingOutlets.length > 0) {
      // Data sudah ada di cloud, lakukan sinkronisasi balik (pull) agar data local up to date
      await pullAllFromSupabase();
      return { seeded: false, message: 'Data di Supabase sudah tersedia. Berhasil disinkronkan ke aplikasi.', count: existingOutlets.length };
    }

    // Ambil data master resmi untuk dimigrasikan ke Supabase (Data contoh/mock ditiadakan)
    const outlets = db.getTable<Outlet>('outlets');
    const kru = db.getTable<Kru>('kru');
    const bankSop = db.getTable<BankSOP>('bank_sop');
    const bankSoal = db.getTable('bank_soal');
    const appUsers = db.getTable('app_users');
    const settings = db.getTable('settings');

    let totalMigrated = 0;

    // 1. Seed Outlets Resmi (11 Outlet)
    if (outlets.length > 0) {
      const { error } = await supabase.from('outlets').upsert(outlets, { onConflict: 'id' });
      if (!error) totalMigrated += outlets.length;
    }

    // 2. Seed Kru Resmi (12 Kru: 7 Karyawan Baru + 5 Retraining)
    if (kru.length > 0) {
      const { error } = await supabase.from('kru').upsert(kru, { onConflict: 'id' });
      if (!error) totalMigrated += kru.length;
    }

    // 3. Seed Bank SOP Resmi (25 SOP Standar Produk & Mutu)
    if (bankSop.length > 0) {
      const { error } = await supabase.from('bank_sop').upsert(bankSop, { onConflict: 'id' });
      if (!error) totalMigrated += bankSop.length;
    }

    // 4. Seed Akun Pengguna / User Management (Admin, Lead Trainer Haikal Abi, RnD Jihan, RnD Feri, Trainer Ari)
    if (appUsers.length > 0) {
      await supabase.from('app_users').upsert(appUsers, { onConflict: 'id' });
      totalMigrated += appUsers.length;
    }

    // 5. Simpan Data Master & Pengaturan ke app_store fleksibel
    const realMasterTables: Record<string, any[]> = {
      outlets,
      kru,
      bank_sop: bankSop,
      bank_soal: bankSoal,
      app_users: appUsers,
      settings: settings,
    };

    for (const [tblKey, tblData] of Object.entries(realMasterTables)) {
      if (tblData && tblData.length > 0) {
        await supabase.from('app_store').upsert({
          key: tblKey,
          value: tblData,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      }
    }

    return {
      seeded: true,
      message: `Sukses memigrasikan ${totalMigrated} data master (11 outlet, 12 peserta kru, 25 SOP, bank soal, dan akun trainer/admin) ke Supabase (Data contoh ditiadakan).`,
      count: totalMigrated
    };
  } catch (err: any) {
    console.error('Error saat seeding Supabase:', err);
    return {
      seeded: false,
      message: `Gagal migrasi: ${err.message || 'Kesalahan jaringan'}`,
      count: 0
    };
  }
}

/**
 * Menarik (pull) data terbaru dari Supabase ke localStorage aplikasi
 */
export async function pullAllFromSupabase(): Promise<{ success: boolean; totalRecords: number }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, totalRecords: 0 };

  try {
    let total = 0;

    // 1. Tarik dari app_store
    const { data: storeData } = await supabase.from('app_store').select('*');
    if (storeData && storeData.length > 0) {
      for (const item of storeData) {
        if (item.key && Array.isArray(item.value) && item.value.length > 0) {
          db.setTable(item.key, item.value);
          total += item.value.length;
        }
      }
    }

    // 2. Tarik tabel utama jika ada data
    const { data: outletsData } = await supabase.from('outlets').select('*');
    if (outletsData && outletsData.length > 0) {
      db.setTable('outlets', outletsData);
      total += outletsData.length;
    }

    const { data: kruData } = await supabase.from('kru').select('*');
    if (kruData && kruData.length > 0) {
      db.setTable('kru', kruData);
      total += kruData.length;
    }

    const { data: sopData } = await supabase.from('bank_sop').select('*');
    if (sopData && sopData.length > 0) {
      db.setTable('bank_sop', sopData);
      total += sopData.length;
    }

    const { data: ujianData } = await supabase.from('hasil_ujian_mingguan').select('*');
    if (ujianData && ujianData.length > 0) {
      db.setTable('hasil_ujian_mingguan', ujianData);
      total += ujianData.length;
    }

    const { data: userData } = await supabase.from('app_users').select('*');
    if (userData && userData.length > 0) {
      db.setTable('app_users', userData);
      total += userData.length;
    }

    return { success: true, totalRecords: total };
  } catch (err) {
    console.error('Error saat menarik data dari Supabase:', err);
    return { success: false, totalRecords: 0 };
  }
}

let realtimeChannelSubscription: any = null;

/**
 * Setup Supabase Realtime channel listener.
 * Sinkronisasi data seketika saat ada perubahan dari kru/cabang lain.
 */
export function initSupabaseRealtimeSync(): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  if (realtimeChannelSubscription) {
    supabase.removeChannel(realtimeChannelSubscription);
  }

  const channel = supabase
    .channel('hara-realtime-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      async (payload) => {
        const table = payload.table;
        const eventType = payload.eventType; // INSERT, UPDATE, DELETE

        if (table === 'app_store') {
          const newRec = payload.new as any;
          if (newRec && newRec.key && Array.isArray(newRec.value)) {
            db.setTable(newRec.key, newRec.value);
          }
          return;
        }

        // Tangani perubahan row pada table spesifik
        if (eventType === 'INSERT' || eventType === 'UPDATE') {
          const row = payload.new;
          if (row && (row as any).id) {
            const list = db.getTable(table);
            const idx = list.findIndex((item: any) => item.id === (row as any).id);
            if (idx >= 0) {
              list[idx] = row;
            } else {
              list.unshift(row);
            }
            db.setTable(table, list);
          }
        } else if (eventType === 'DELETE') {
          const oldRow = payload.old;
          if (oldRow && (oldRow as any).id) {
            const list = db.getTable(table);
            const filtered = list.filter((item: any) => item.id !== (oldRow as any).id);
            db.setTable(table, filtered);
          }
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setStatus('connected');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn('Realtime channel status:', status);
      }
    });

  realtimeChannelSubscription = channel;

  return () => {
    if (realtimeChannelSubscription) {
      supabase.removeChannel(realtimeChannelSubscription);
      realtimeChannelSubscription = null;
    }
  };
}

/**
 * Sinkronkan record data secara otomatis dan instan ke Supabase.
 * Mengutamakan upsert ke tabel bersangkutan atau app_store key-value.
 */
export async function syncRecordToSupabase(table: string, record: any): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !record) return false;

  try {
    // 1. Coba simpan langsung ke tabel spesifik
    const { error } = await supabase.from(table).upsert(record, { onConflict: 'id' });
    if (error) {
      // 2. Fallback aman: simpan snapshot tabel lengkap ke app_store
      const currentList = db.getTable(table);
      await supabase.from('app_store').upsert({
        key: table,
        value: currentList,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });
    }
    return true;
  } catch (e) {
    console.warn(`[Supabase Auto-Sync] Gagal menyimpan ke ${table}:`, e);
    return false;
  }
}

/**
 * Hapus record data dari Supabase secara otomatis dan instan.
 */
export async function deleteRecordFromSupabase(table: string, id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !id) return false;

  try {
    await supabase.from(table).delete().eq('id', id);
    const currentList = db.getTable(table);
    await supabase.from('app_store').upsert({
      key: table,
      value: currentList,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });
    return true;
  } catch (e) {
    console.warn(`[Supabase Auto-Sync] Gagal menghapus dari ${table}:`, e);
    return false;
  }
}

