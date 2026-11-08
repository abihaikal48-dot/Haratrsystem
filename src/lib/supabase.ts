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
    // 1. Uji Baca (Read Test)
    const { data, error } = await testClient.from('app_store').select('key').limit(1);

    if (error) {
      if (error.code === '42P01') {
        // Tabel app_store belum ada di public schema
        // Coba cek apakah ada tabel outlets
        const { error: errOutlets } = await testClient.from('outlets').select('id').limit(1);
        if (errOutlets && errOutlets.code === '42P01') {
          setStatus('connected');
          return {
            success: true,
            message: 'Terkoneksi ke Supabase, namun tabel database belum dibuat! Buka menu SQL Editor di Supabase dan jalankan script SQL Schema resmi HARA.',
            tableCount: 0,
          };
        }
      }
      if (error.code === '42501') {
        setStatus('error');
        return {
          success: false,
          message: 'Koneksi terhubung namun DITOLAK oleh Row Level Security (RLS error 42501). Jalankan skrip SQL Schema untuk menonaktifkan RLS atau memberi izin role anon.',
        };
      }
      setStatus('error');
      return {
        success: false,
        message: `Koneksi ditolak: ${error.message} (Kode: ${error.code || 'UNKNOWN'})`,
      };
    }

    // 2. Uji Tulis & Hapus (Write & Delete Test) untuk memastikan input data berhasil
    const testKey = 'test_connection_ping';
    const { error: writeError } = await testClient.from('app_store').upsert({
      key: testKey,
      value: { ping: 'ok', timestamp: new Date().toISOString() },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });

    if (writeError) {
      if (writeError.code === '42501') {
        setStatus('error');
        return {
          success: false,
          message: 'Tabel ditemukan tetapi izin TULIS diblokir RLS! Jalankan: ALTER TABLE app_store DISABLE ROW LEVEL SECURITY; di SQL Editor Supabase.',
        };
      }
      setStatus('connected');
      return {
        success: true,
        message: `Terhubung (Read OK, Write Warning: ${writeError.message}). Disarankan mengecek kebijakan RLS tabel.`,
        tableCount: data ? data.length : 0,
      };
    }

    // Bersihkan test key
    await testClient.from('app_store').delete().eq('key', testKey);

    setStatus('connected');
    return {
      success: true,
      message: 'Koneksi Supabase 100% Sempurna! Izin Baca & Tulis terverifikasi secara langsung.',
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
 * Sanitasi payload objek sebelum di-upsert ke tabel PostgreSQL Supabase
 * agar tidak ditolak dengan error PGRST204 (Column not found in schema cache).
 */
export function sanitizeRecordForTable(table: string, record: any): any {
  if (!record || typeof record !== 'object') return {};

  const cleanId = String(record.id || ('rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)));

  // 1. Outlets
  if (table === 'outlets') {
    return {
      id: cleanId,
      nama_outlet: record.nama_outlet || record.nama || 'Outlet HARA',
      kode_outlet: record.kode_outlet || record.kode || cleanId,
      alamat: record.alamat || '',
      kepala_outlet: record.kepala_outlet || record.manager || '',
      area_supervisor: record.area_supervisor || record.supervisor || '',
      status_aktif: record.status_aktif || 'Aktif',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 2. Kru & Peserta (Tanpa shift karena tidak ada di schema database Supabase)
  if (table === 'kru') {
    return {
      id: cleanId,
      nama_kru: record.nama_kru || record.nama || 'Kru HARA',
      kode_outlet: record.kode_outlet || record.outletCode || 'Kantor Lempongsari',
      divisi: record.divisi || 'Kitchen',
      jabatan: record.jabatan || 'Crew Store',
      status_karyawan: record.status_karyawan || 'Karyawan Baru',
      status_aktif: record.status_aktif || 'Aktif',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 3. Bank SOP
  if (table === 'bank_sop') {
    return {
      id: cleanId,
      kode_sop: record.kode_sop || record.kode || '',
      judul_sop: record.judul_sop || record.judul || record.nama || '',
      divisi: record.divisi || 'Kitchen',
      station: record.station || '',
      durasi_standar_detik: Number(record.durasi_standar_detik || record.stdDetik || 300),
      langkah: record.langkah || record.langkahSOP || [],
      poin_kritis: record.poin_kritis || '',
      standar_waktu: record.standar_waktu || '',
      alat_bahan: record.alat_bahan || '',
      sumber: record.sumber || 'Standar Mutu HARA HQ',
      status_aktif: record.status_aktif || 'Aktif',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 4. Onboarding Batches
  if (table === 'onboarding_batches') {
    return {
      id: cleanId,
      nomor_batch: record.nomor_batch || record.kode || '',
      nama_batch: record.nama_batch || record.nama || 'Batch Onboarding',
      tanggal_mulai: record.tanggal_mulai || record.tanggal || new Date().toISOString().split('T')[0],
      tanggal_selesai: record.tanggal_selesai || record.tanggal || new Date().toISOString().split('T')[0],
      kode_outlet_lokasi: record.kode_outlet_lokasi || record.kode_outlet || 'Kantor Lempongsari',
      status: record.status || 'Berjalan',
      kuota_min: Number(record.kuota_min || 11),
      kuota_max: Number(record.kuota_max || 17),
      peserta: Array.isArray(record.peserta) ? record.peserta : [],
      lead_trainer: record.lead_trainer || 'Haikal Abi',
      catatan_batch: record.catatan_batch || '',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 5. Penilaian Praktik Produk SOP
  if (table === 'penilaian_praktik_onboarding_produk') {
    return {
      id: cleanId,
      tanggal: record.tanggal || new Date().toISOString().split('T')[0],
      kru_id: record.kru_id || record.kruId || '',
      nama_kru: record.nama_kru || record.namaKru || record.kru_nama || 'Peserta',
      kode_outlet: record.kode_outlet || record.outletCode || 'Kantor Lempongsari',
      nama_outlet: record.nama_outlet || record.outlet_penempatan || '',
      batch_id: record.batch_id || record.batchId || '',
      nama_batch: record.nama_batch || record.batch || '',
      divisi: record.divisi || 'Kitchen',
      produk_nama: record.produk_nama || record.productNama || record.nama_produk || 'Produk SOP',
      kode_sop: record.kode_sop || record.kode || '',
      station: record.station || '',
      station_label: record.station_label || record.station || '',
      day: record.day || 'Day 1',
      waktu_detik: Number(record.waktu_detik || record.durasi_detik || record.timerSeconds || 0),
      target_detik: Number(record.target_detik || record.targetDetik || 300),
      suhu_minyak_probe: record.suhu_minyak_probe !== undefined ? Number(record.suhu_minyak_probe) : null,
      gramatur_aktual: record.gramatur_aktual !== undefined ? Number(record.gramatur_aktual) : (record.gramaturAktual !== undefined ? Number(record.gramaturAktual) : null),
      skor_prosedur: Number(record.skor_prosedur || 0),
      skor_waktu: Number(record.skor_waktu || 0),
      skor_knowledge: Number(record.skor_knowledge !== undefined ? record.skor_knowledge : 100),
      skor_kebersihan: Number(record.skor_kebersihan || 90),
      skor_kerjasama: Number(record.skor_kerjasama || 90),
      skor_keaktifan: Number(record.skor_keaktifan || 90),
      skor_ketepatan: Number(record.skor_ketepatan || 90),
      subskor_teknis: Number(record.subskor_teknis || 0),
      subskor_sikap: Number(record.subskor_sikap || 0),
      skor_akhir: Number(record.skor_akhir || 0),
      status_kelulusan: record.status_kelulusan || record.status || 'Kompeten',
      status: record.status || record.status_kelulusan || 'Kompeten',
      gagal_titik_kritis: Boolean(record.gagal_titik_kritis),
      titik_kritis_gagal_detail: Array.isArray(record.titik_kritis_gagal_detail) ? record.titik_kritis_gagal_detail : [],
      knowledge_questions: record.knowledge_questions || null,
      checklist_langkah: Array.isArray(record.checklist_langkah) ? record.checklist_langkah : (record.stepChecklist || []),
      penilai_nama: record.penilai_nama || record.trainer_nama || 'Trainer HARA',
      catatan: record.catatan || record.catatanTrainer || '',
      catatan_trainer: record.catatan_trainer || record.catatan || '',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 6. Penilaian Sikap & Kebersihan Kru
  if (table === 'penilaian_sikap_kebersihan_kru') {
    return {
      id: cleanId,
      tanggal: record.tanggal || new Date().toISOString().split('T')[0],
      kru_id: record.kru_id || record.kruId || '',
      nama_kru: record.nama_kru || record.namaKru || 'Peserta',
      kode_outlet: record.kode_outlet || record.outletCode || '',
      nama_outlet: record.nama_outlet || '',
      batch_id: record.batch_id || record.batchId || '',
      shift: record.shift || 'Shift 1',
      skor_grooming: Number(record.skor_grooming || 90),
      skor_resik: Number(record.skor_resik || 90),
      skor_attitude: Number(record.skor_attitude || 90),
      skor_disiplin: Number(record.skor_disiplin || 90),
      skor_total: Number(record.skor_total || 90),
      status_kelulusan: record.status_kelulusan || 'Sangat Baik',
      checklist_detail: record.checklist_detail || [],
      catatan: record.catatan || '',
      penilai_nama: record.penilai_nama || 'Trainer',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 7. Penilaian Jobdesk Stasiun
  if (table === 'penilaian_jobdesk_stasiun') {
    return {
      id: cleanId,
      tanggal: record.tanggal || new Date().toISOString().split('T')[0],
      batch_id: record.batch_id || '',
      batch_name: record.batch_name || '',
      kode_outlet: record.kode_outlet || '',
      nama_outlet: record.nama_outlet || '',
      stasiun: record.stasiun || 'Station 1',
      shift: record.shift || 'Shift 1',
      kru_names: Array.isArray(record.kru_names) ? record.kru_names : [],
      penilai_nama: record.penilai_nama || 'Trainer',
      skor_5s_kebersihan: Number(record.skor_5s_kebersihan || 90),
      detail_5s: record.detail_5s || {},
      skor_kerjasama_komunikasi: Number(record.skor_kerjasama_komunikasi || 90),
      detail_kerjasama: record.detail_kerjasama || {},
      skor_akhir: Number(record.skor_akhir || 90),
      catatan: record.catatan || '',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 8. Hasil Ujian Kru Mingguan
  if (table === 'hasil_ujian_mingguan') {
    return {
      id: cleanId,
      tanggal: record.tanggal || new Date().toISOString().split('T')[0],
      nama_kru: record.nama_kru || record.nama || 'Peserta',
      kru_id: record.kru_id || '',
      kode_outlet: record.kode_outlet || 'Kantor Lempongsari',
      divisi: record.divisi || 'Kitchen',
      minggu_ke: Number(record.minggu_ke || 1),
      tipe_ujian: record.tipe_ujian || 'Teori',
      skor: Number(record.skor || 0),
      status_kelulusan: record.status_kelulusan || (Number(record.skor || 0) >= 80 ? 'Lulus' : 'Remedial'),
      jawaban_detail: record.jawaban_detail || {},
      topik_salah: Array.isArray(record.topik_salah) ? record.topik_salah : [],
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 9. Akun Pengguna / Users
  if (table === 'app_users') {
    return {
      id: cleanId,
      email: (record.email || '').toLowerCase().trim(),
      nama: record.nama || 'Pengguna HARA',
      role: record.role || 'Trainer',
      outlet_akses: Array.isArray(record.outlet_akses) ? record.outlet_akses : ['ALL'],
      divisi_akses: Array.isArray(record.divisi_akses) ? record.divisi_akses : ['Kitchen', 'Service'],
      status_aktif: record.status_aktif !== false,
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 10. Attitude HARA
  if (table === 'attitude_hara') {
    return {
      id: cleanId,
      tanggal: record.tanggal || new Date().toISOString().split('T')[0],
      kru_id: record.kru_id || '',
      nama_kru: record.nama_kru || '',
      kode_outlet: record.kode_outlet || '',
      divisi: record.divisi || 'Kitchen',
      skor_h_higienis: Number(record.skor_h_higienis || 90),
      skor_a_antusias: Number(record.skor_a_antusias || 90),
      skor_r_resik: Number(record.skor_r_resik || 90),
      skor_a_amanah: Number(record.skor_a_amanah || 90),
      skor_rata_rata: Number(record.skor_rata_rata || 90),
      checklist_items: record.checklist_items || {},
      catatan_perilaku: record.catatan_perilaku || '',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 11. TNA (Training Needs Analysis) - Tanpa updated_at
  if (table === 'tna') {
    return {
      id: cleanId,
      tanggal: record.tanggal || new Date().toISOString().split('T')[0],
      kode_outlet: record.kode_outlet || 'Kantor Lempongsari',
      divisi: record.divisi || 'Kitchen',
      sumber_temuan: record.sumber_temuan || '',
      deskripsi_gap: record.deskripsi_gap || '',
      jenis_gap: record.jenis_gap || 'Keterampilan',
      prioritas: record.prioritas || 'Sedang',
      rencana_tindak_lanjut: record.rencana_tindak_lanjut || '',
      status: record.status || 'Belum',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 12. Rencana Training - Tanpa updated_at
  if (table === 'rencana_training') {
    return {
      id: cleanId,
      kode_outlet: record.kode_outlet || 'Kantor Lempongsari',
      topik: record.topik || '',
      tujuan_pembelajaran: record.tujuan_pembelajaran || '',
      peserta: record.peserta || '',
      metode: record.metode || '',
      durasi: record.durasi || '',
      alat_bantu: record.alat_bantu || '',
      fasilitator: record.fasilitator || '',
      tanggal_pelaksanaan: record.tanggal_pelaksanaan || new Date().toISOString().split('T')[0],
      status: record.status || 'Direncanakan',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 13. Observasi Lapangan
  if (table === 'observasi_lapangan') {
    return {
      id: cleanId,
      tanggal_shift: record.tanggal_shift || record.tanggal || new Date().toISOString().split('T')[0],
      kode_outlet: record.kode_outlet || 'Kantor Lempongsari',
      nama_kru: record.nama_kru || 'Kru HARA',
      divisi: record.divisi || 'Kitchen',
      standar_sop_diamati: record.standar_sop_diamati || '',
      hasil: record.hasil || 'Sesuai Standar',
      catatan_detail: record.catatan_detail || '',
      rencana_follow_up: record.rencana_follow_up || '',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 14. Coaching Log
  if (table === 'coaching_log') {
    return {
      id: cleanId,
      tanggal: record.tanggal || new Date().toISOString().split('T')[0],
      kode_outlet: record.kode_outlet || 'Kantor Lempongsari',
      nama_kru: record.nama_kru || 'Kru HARA',
      goal: record.goal || '',
      reality: record.reality || '',
      options: record.options || '',
      will: record.will || '',
      hasil_follow_up: record.hasil_follow_up || '',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 15. Gap Analysis
  if (table === 'gap_analysis') {
    return {
      id: cleanId,
      nama_kru: record.nama_kru || 'Kru HARA',
      divisi: record.divisi || 'Kitchen',
      kode_outlet: record.kode_outlet || 'Kantor Lempongsari',
      kompetensi_dinilai: record.kompetensi_dinilai || '',
      skor_standar: Number(record.skor_standar || 85),
      skor_aktual: Number(record.skor_aktual || 0),
      gap_score: Number(record.gap_score || 0),
      rekomendasi: record.rekomendasi || '',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // 16. Kartu Keluhan
  if (table === 'kartu_keluhan') {
    return {
      id: cleanId,
      tanggal: record.tanggal || new Date().toISOString().split('T')[0],
      kode_outlet: record.kode_outlet || 'Kantor Lempongsari',
      pelapor: record.pelapor || '',
      keluhan: record.keluhan || '',
      divisi_terkait: record.divisi_terkait || 'Kitchen',
      akar_masalah: record.akar_masalah || '',
      tindakan_perbaikan: record.tindakan_perbaikan || '',
      status: record.status || 'Dalam kajian',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  // Generic fallback: sanitasi kolom asing (seperti updated_at, shift) yang tidak ada di schema tabel
  const safeFallback: any = { id: cleanId };
  for (const [key, val] of Object.entries(record)) {
    if (key === 'updated_at' || key === 'shift' || key === 'raw_data' || key.startsWith('_') || typeof val === 'function') {
      continue;
    }
    safeFallback[key] = val;
  }
  return safeFallback;
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
    bank_soal: 'bank_soal',
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
    onboarding_batches: 'onboarding_batches',
    penilaian_praktik_onboarding_produk: 'penilaian_praktik_onboarding_produk',
    penilaian_onboarding_rnd: 'penilaian_praktik_onboarding_produk',
    penilaian_onboarding_tc: 'penilaian_praktik_onboarding_produk',
    attitude_hara: 'attitude_hara',
    bank_sop_products: 'bank_sop',
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

    // 2. Simpan juga ke structured table jika didukung dengan sanitasi kolom
    if (targetTable && row) {
      const sanitized = sanitizeRecordForTable(targetTable, row);
      const { error } = await supabase.from(targetTable).upsert(sanitized, { onConflict: 'id' });
      if (error) {
        if (error.code === 'PGRST204') {
          console.warn(`[Supabase Schema Notice] Tabel ${targetTable}: ${error.message}. Cadangan data aman tersimpan di app_store.`);
        } else {
          console.error(`[Supabase Upsert Error] Tabel ${targetTable}:`, error);
        }
      }
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
    bank_soal: 'bank_soal',
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
    onboarding_batches: 'onboarding_batches',
    penilaian_praktik_onboarding_produk: 'penilaian_praktik_onboarding_produk',
    penilaian_onboarding_rnd: 'penilaian_praktik_onboarding_produk',
    attitude_hara: 'attitude_hara',
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
      const sanitizedOutlets = outlets.map(o => sanitizeRecordForTable('outlets', o));
      const { error } = await supabase.from('outlets').upsert(sanitizedOutlets, { onConflict: 'id' });
      if (!error) totalMigrated += outlets.length;
    }

    // 2. Seed Kru Resmi (12 Kru: 7 Karyawan Baru + 5 Retraining)
    if (kru.length > 0) {
      const sanitizedKru = kru.map(k => sanitizeRecordForTable('kru', k));
      const { error } = await supabase.from('kru').upsert(sanitizedKru, { onConflict: 'id' });
      if (!error) totalMigrated += kru.length;
    }

    // 3. Seed Bank SOP Resmi (25 SOP Standar Produk & Mutu)
    if (bankSop.length > 0) {
      const sanitizedSop = bankSop.map(s => sanitizeRecordForTable('bank_sop', s));
      const { error } = await supabase.from('bank_sop').upsert(sanitizedSop, { onConflict: 'id' });
      if (!error) totalMigrated += bankSop.length;
    }

    // 4. Seed Akun Pengguna / User Management (Admin, Lead Trainer Haikal Abi, RnD Jihan, RnD Feri, Trainer Ari)
    if (appUsers.length > 0) {
      const sanitizedUsers = appUsers.map(u => sanitizeRecordForTable('app_users', u));
      await supabase.from('app_users').upsert(sanitizedUsers, { onConflict: 'id' });
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
      message: `Sukses memigrasikan ${totalMigrated} data master (11 outlet, 12 peserta kru, 25 SOP, bank soal, dan akun trainer/admin) ke Supabase.`,
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
 * Menarik (pull) data terbaru dari Supabase ke aplikasi (authoritative merge).
 * Supabase adalah Primary Database Cloud: data cloud diselaraskan ke local cache.
 */
export async function pullAllFromSupabase(): Promise<{ success: boolean; totalRecords: number }> {
  const supabase = getSupabase();
  if (!supabase) return { success: false, totalRecords: 0 };

  try {
    let total = 0;

    // Helper untuk merge array data secara cerdas berbasis 'id' (Safe Merge Anti-Reset)
    const mergeTableData = (tableKey: string, remoteData: any[]) => {
      if (!Array.isArray(remoteData) || remoteData.length === 0) return;
      const localData = db.getTable<any>(tableKey);
      const localMap = new Map<string, any>();
      localData.forEach(item => {
        if (item && item.id) localMap.set(String(item.id), item);
      });

      const seenIds = new Set<string>();
      const mergedList: any[] = [];

      // 1. Proses data dari Cloud Supabase
      remoteData.forEach(remoteItem => {
        if (!remoteItem || !remoteItem.id) {
          if (remoteItem) mergedList.push(remoteItem);
          return;
        }
        const strId = String(remoteItem.id);
        seenIds.add(strId);
        const localItem = localMap.get(strId);
        if (localItem) {
          const localTime = new Date(localItem.updated_at || localItem.created_at || 0).getTime();
          const remoteTime = new Date(remoteItem.updated_at || remoteItem.created_at || 0).getTime();
          if (localTime > remoteTime && localTime > 0) {
            // Data lokal lebih baru: pertahankan lokal dan sync balik ke Supabase
            mergedList.push({ ...remoteItem, ...localItem });
            syncRecordToSupabase(tableKey, { ...remoteItem, ...localItem }).catch(() => {});
          } else {
            // Data cloud sama atau lebih baru
            mergedList.push({ ...localItem, ...remoteItem });
          }
        } else {
          mergedList.push(remoteItem);
        }
      });

      // 2. Data lokal yang baru dibuat dan belum ada di cloud: wajib dipertahankan dan di-push ke Supabase
      localData.forEach(localItem => {
        if (localItem && localItem.id && !seenIds.has(String(localItem.id))) {
          mergedList.push(localItem);
          seenIds.add(String(localItem.id));
          syncRecordToSupabase(tableKey, localItem).catch(() => {});
        }
      });

      db.setDirectLocalOnly(tableKey, mergedList);
      total += mergedList.length;
    };

    // 1. Tarik dari app_store
    const { data: storeData } = await supabase.from('app_store').select('*');
    if (storeData && storeData.length > 0) {
      for (const item of storeData) {
        if (item.key && Array.isArray(item.value) && item.value.length > 0) {
          mergeTableData(item.key, item.value);
        }
      }
    }

    // 2. Tarik tabel terstruktur utama
    const tablesToPull = [
      'penilaian_praktik_onboarding_produk',
      'onboarding_batches',
      'kru',
      'outlets',
      'bank_sop',
      'hasil_ujian_mingguan',
      'app_users',
      'penilaian_sikap_kebersihan_kru',
      'penilaian_jobdesk_stasiun',
      'attitude_hara',
      'penugasan_trainer',
      'tna',
      'rencana_training',
      'observasi_lapangan',
      'coaching_log',
      'gap_analysis',
      'kartu_keluhan',
      'talent_tracker',
      'ojt_monitoring'
    ];

    for (const tbl of tablesToPull) {
      try {
        const { data, error } = await supabase.from(tbl).select('*').limit(1000);
        if (!error && Array.isArray(data) && data.length > 0) {
          mergeTableData(tbl, data);
          if (tbl === 'penilaian_praktik_onboarding_produk') {
            mergeTableData('penilaian_onboarding_rnd', data);
            mergeTableData('penilaian_onboarding_tc', data);
          }
        }
      } catch {
        // Table mungkin belum dibuat via script SQL; app_store bertindak sebagai fallback
      }
    }

    // Trigger update untuk seluruh komponen UI
    db.notify('*');

    return { success: true, totalRecords: total };
  } catch (err) {
    console.error('Error saat menarik data dari Supabase:', err);
    return { success: false, totalRecords: 0 };
  }
}

let realtimeChannelSubscription: any = null;

/**
 * Setup Supabase Realtime channel listener.
 * Sinkronisasi data seketika saat ada perubahan dari kru/trainer lain.
 */
export function initSupabaseRealtimeSync(): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  if (realtimeChannelSubscription) {
    try {
      supabase.removeChannel(realtimeChannelSubscription);
    } catch {}
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
            db.setDirectLocalOnly(newRec.key, newRec.value);
            db.notify(newRec.key);
            db.notify('*');
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
            db.setDirectLocalOnly(table, list);
            if (table === 'penilaian_praktik_onboarding_produk') {
              db.setDirectLocalOnly('penilaian_onboarding_rnd', list);
              db.setDirectLocalOnly('penilaian_onboarding_tc', list);
            }
            db.notify(table);
            db.notify('*');
          }
        } else if (eventType === 'DELETE') {
          const oldRow = payload.old;
          if (oldRow && (oldRow as any).id) {
            const list = db.getTable(table);
            const filtered = list.filter((item: any) => item.id !== (oldRow as any).id);
            db.setDirectLocalOnly(table, filtered);
            if (table === 'penilaian_praktik_onboarding_produk') {
              db.setDirectLocalOnly('penilaian_onboarding_rnd', filtered);
              db.setDirectLocalOnly('penilaian_onboarding_tc', filtered);
            }
            db.notify(table);
            db.notify('*');
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
      try {
        supabase.removeChannel(realtimeChannelSubscription);
      } catch {}
      realtimeChannelSubscription = null;
    }
  };
}

/**
 * Menyinkronkan seluruh tabel ke Supabase app_store & structured table
 */
export async function syncTableToSupabase(tableName: string, data: any[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    // 1. Simpan ke app_store key-value
    await supabase.from('app_store').upsert({
      key: tableName,
      value: data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

    // 2. Simpan juga ke structured table jika ada dan data berupa array
    const validTables = new Set([
      'outlets', 'kru', 'bank_sop', 'hasil_ujian_mingguan', 'app_users',
      'onboarding_batches', 'penilaian_praktik_onboarding_produk',
      'penilaian_sikap_kebersihan_kru', 'attitude_hara'
    ]);

    if (validTables.has(tableName) && Array.isArray(data) && data.length > 0) {
      const chunks: any[][] = [];
      const chunkSize = 50;
      for (let i = 0; i < data.length; i += chunkSize) {
        chunks.push(data.slice(i, i + chunkSize));
      }
      for (const chunk of chunks) {
        await supabase.from(tableName).upsert(chunk, { onConflict: 'id' });
      }
    }
    return true;
  } catch (err) {
    console.warn(`[Supabase Sync] Gagal sync table ${tableName}:`, err);
    return false;
  }
}

/**
 * Sinkronkan record data secara otomatis dan instan ke Supabase.
 * Mengutamakan snapshot ke app_store dan upsert tersanitasi ke tabel terstruktur.
 */
export async function syncRecordToSupabase(table: string, record: any): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !record) return false;

  try {
    // 1. Selalu perbarui snapshot tabel di app_store terlebih dahulu (Zero schema error)
    const currentList = db.getTable(table);
    await supabase.from('app_store').upsert({
      key: table,
      value: currentList,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });

    // 2. Simpan juga ke structured table jika didukung dengan sanitasi kolom
    const validTableMap: Record<string, string> = {
      outlets: 'outlets',
      kru: 'kru',
      bank_sop: 'bank_sop',
      bank_soal: 'bank_soal',
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
      onboarding_batches: 'onboarding_batches',
      penilaian_praktik_onboarding_produk: 'penilaian_praktik_onboarding_produk',
      penilaian_onboarding_rnd: 'penilaian_praktik_onboarding_produk',
      penilaian_onboarding_tc: 'penilaian_praktik_onboarding_produk',
      attitude_hara: 'attitude_hara',
      bank_sop_products: 'bank_sop',
    };

    const targetTable = validTableMap[table] || table;
    const sanitized = sanitizeRecordForTable(targetTable, record);
    const { error } = await supabase.from(targetTable).upsert(sanitized, { onConflict: 'id' });
    if (error) {
      if (error.code === 'PGRST204') {
        console.warn(`[Supabase Schema Notice] Tabel ${targetTable}: ${error.message}. Cadangan data aman tersimpan di app_store.`);
      } else {
        console.error(`[Supabase Upsert Error] Tabel ${targetTable}:`, error);
      }
    }
    return true;
  } catch (e) {
    console.warn(`[Supabase Auto-Sync] Warning menyimpan ke ${table}:`, e);
    return false;
  }
}

/**
 * Mendorong (push) SELURUH data lokal aplikasi ke Supabase Cloud.
 * Menyimpan cadangan lengkap di app_store dan menulis data tersanitasi ke setiap tabel PostgreSQL.
 */
export async function pushAllLocalDataToSupabase(): Promise<{
  success: boolean;
  message: string;
  totalPushed: number;
  details: Record<string, number>;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      message: 'Koneksi Supabase belum terkonfigurasi. Harap isi URL dan Anon Key.',
      totalPushed: 0,
      details: {},
    };
  }

  const tablesToPush = [
    'outlets',
    'kru',
    'bank_sop',
    'onboarding_batches',
    'penilaian_praktik_onboarding_produk',
    'penilaian_sikap_kebersihan_kru',
    'penilaian_jobdesk_stasiun',
    'attitude_hara',
    'hasil_ujian_mingguan',
    'app_users',
    'bank_soal',
  ];

  let total = 0;
  const details: Record<string, number> = {};

  try {
    for (const table of tablesToPush) {
      const data = db.getTable<any>(table);
      if (!Array.isArray(data) || data.length === 0) continue;

      // 1. Simpan ke app_store
      await supabase.from('app_store').upsert({
        key: table,
        value: data,
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' });

      // 2. Upsert ke tabel terstruktur
      const sanitizedRows = data.map(item => sanitizeRecordForTable(table, item));
      const chunkSize = 50;
      for (let i = 0; i < sanitizedRows.length; i += chunkSize) {
        const chunk = sanitizedRows.slice(i, i + chunkSize);
        const { error } = await supabase.from(table).upsert(chunk, { onConflict: 'id' });
        if (error) {
          if (error.code === 'PGRST204') {
            console.warn(`[Supabase Schema Notice] Tabel ${table}: ${error.message}. Cadangan data aman tersimpan di app_store.`);
          } else {
            console.error(`[Supabase Push Error] Gagal push batch ${table}:`, error);
          }
        }
      }

      details[table] = data.length;
      total += data.length;
    }

    return {
      success: true,
      message: `Berhasil mengunggah ${total} data lokal ke database Supabase Cloud!`,
      totalPushed: total,
      details,
    };
  } catch (err: any) {
    console.error('Error saat push semua data ke Supabase:', err);
    return {
      success: false,
      message: `Gagal mengunggah data: ${err.message || 'Kesalahan jaringan'}`,
      totalPushed: total,
      details,
    };
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

/**
 * SKRIP SQL RESMI SUPABASE UNTUK HARA TRAINER PRO SYSTEM
 * Skrip ini membuat seluruh tabel pada public schema dan menonaktifkan RLS
 * sehingga operasi input/upsert dari client anonim tidak terblokir.
 */
export const SUPABASE_SQL_SCHEMA_SCRIPT = `-- ============================================================================
-- SKRIP SQL RESMI DATABASE SUPABASE: SISTEM ONBOARDING & PELATIHAN HARA CHICKEN
-- Jalankan skrip ini di menu SQL Editor pada Dashboard Supabase Anda!
-- ============================================================================

-- 1. Tabel Key-Value Fleksibel (Penyimpanan Cadangan & Real-Time Sync)
CREATE TABLE IF NOT EXISTS public.app_store (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Outlets Cabang HARA
CREATE TABLE IF NOT EXISTS public.outlets (
  id TEXT PRIMARY KEY,
  nama_outlet TEXT NOT NULL,
  kode_outlet TEXT NOT NULL UNIQUE,
  alamat TEXT,
  kepala_outlet TEXT,
  area_supervisor TEXT,
  status_aktif TEXT DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Master Kru & Peserta Pelatihan
CREATE TABLE IF NOT EXISTS public.kru (
  id TEXT PRIMARY KEY,
  nama_kru TEXT NOT NULL,
  kode_outlet TEXT NOT NULL,
  divisi TEXT NOT NULL,
  jabatan TEXT,
  status_karyawan TEXT,
  status_aktif TEXT DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Master Bank SOP Produk
CREATE TABLE IF NOT EXISTS public.bank_sop (
  id TEXT PRIMARY KEY,
  kode_sop TEXT,
  judul_sop TEXT NOT NULL,
  divisi TEXT NOT NULL,
  station TEXT,
  durasi_standar_detik INT DEFAULT 300,
  langkah JSONB,
  poin_kritis TEXT,
  standar_waktu TEXT,
  alat_bahan TEXT,
  sumber TEXT,
  status_aktif TEXT DEFAULT 'Aktif',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Batch Onboarding
CREATE TABLE IF NOT EXISTS public.onboarding_batches (
  id TEXT PRIMARY KEY,
  nomor_batch TEXT,
  nama_batch TEXT NOT NULL,
  tanggal_mulai TEXT NOT NULL,
  tanggal_selesai TEXT NOT NULL,
  kode_outlet_lokasi TEXT,
  status TEXT DEFAULT 'Berjalan',
  kuota_min INT DEFAULT 11,
  kuota_max INT DEFAULT 17,
  peserta JSONB,
  lead_trainer TEXT,
  catatan_batch TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Penilaian Praktik Produk SOP (Terpadu 2 Pilar: Teknis & Sikap)
CREATE TABLE IF NOT EXISTS public.penilaian_praktik_onboarding_produk (
  id TEXT PRIMARY KEY,
  tanggal TEXT NOT NULL,
  kru_id TEXT,
  nama_kru TEXT NOT NULL,
  kode_outlet TEXT,
  nama_outlet TEXT,
  batch_id TEXT,
  nama_batch TEXT,
  divisi TEXT,
  produk_nama TEXT NOT NULL,
  kode_sop TEXT,
  station TEXT,
  station_label TEXT,
  day TEXT,
  waktu_detik INT,
  target_detik INT,
  suhu_minyak_probe NUMERIC,
  gramatur_aktual NUMERIC,
  skor_prosedur NUMERIC,
  skor_waktu NUMERIC,
  skor_knowledge NUMERIC,
  skor_kebersihan NUMERIC,
  skor_kerjasama NUMERIC,
  skor_keaktifan NUMERIC,
  skor_ketepatan NUMERIC,
  subskor_teknis NUMERIC,
  subskor_sikap NUMERIC,
  skor_akhir NUMERIC NOT NULL,
  status_kelulusan TEXT,
  status TEXT,
  gagal_titik_kritis BOOLEAN DEFAULT FALSE,
  titik_kritis_gagal_detail JSONB,
  knowledge_questions JSONB,
  checklist_langkah JSONB,
  penilai_nama TEXT,
  catatan TEXT,
  catatan_trainer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabel Evaluasi Sikap & Budaya H.A.R.A
CREATE TABLE IF NOT EXISTS public.attitude_hara (
  id TEXT PRIMARY KEY,
  tanggal TEXT NOT NULL,
  kru_id TEXT,
  nama_kru TEXT NOT NULL,
  kode_outlet TEXT,
  divisi TEXT,
  skor_h_higienis NUMERIC,
  skor_a_antusias NUMERIC,
  skor_r_resik NUMERIC,
  skor_a_amanah NUMERIC,
  skor_rata_rata NUMERIC NOT NULL,
  checklist_items JSONB,
  catatan_perilaku TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabel Penilaian Sikap & Higiene Kru
CREATE TABLE IF NOT EXISTS public.penilaian_sikap_kebersihan_kru (
  id TEXT PRIMARY KEY,
  tanggal TEXT NOT NULL,
  kru_id TEXT,
  nama_kru TEXT NOT NULL,
  kode_outlet TEXT,
  nama_outlet TEXT,
  batch_id TEXT,
  shift TEXT,
  skor_grooming NUMERIC,
  skor_resik NUMERIC,
  skor_attitude NUMERIC,
  skor_disiplin NUMERIC,
  skor_total NUMERIC NOT NULL,
  status_kelulusan TEXT,
  checklist_detail JSONB,
  catatan TEXT,
  penilai_nama TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabel Evaluasi Jobdesk & 5S Stasiun
CREATE TABLE IF NOT EXISTS public.penilaian_jobdesk_stasiun (
  id TEXT PRIMARY KEY,
  tanggal TEXT NOT NULL,
  batch_id TEXT,
  batch_name TEXT,
  kode_outlet TEXT,
  nama_outlet TEXT,
  stasiun TEXT NOT NULL,
  shift TEXT,
  kru_names JSONB,
  penilai_nama TEXT,
  skor_5s_kebersihan NUMERIC,
  detail_5s JSONB,
  skor_kerjasama_komunikasi NUMERIC,
  detail_kerjasama JSONB,
  skor_akhir NUMERIC NOT NULL,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabel Hasil Ujian Kru Mingguan
CREATE TABLE IF NOT EXISTS public.hasil_ujian_mingguan (
  id TEXT PRIMARY KEY,
  tanggal TEXT NOT NULL,
  nama_kru TEXT NOT NULL,
  kru_id TEXT,
  kode_outlet TEXT NOT NULL,
  divisi TEXT NOT NULL,
  minggu_ke INT,
  tipe_ujian TEXT,
  skor NUMERIC NOT NULL,
  status_kelulusan TEXT,
  jawaban_detail JSONB,
  topik_salah JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tabel Akun & Pengguna Sistem (Users)
CREATE TABLE IF NOT EXISTS public.app_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  role TEXT NOT NULL,
  outlet_akses JSONB,
  divisi_akses JSONB,
  status_aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. MATIKAN ROW LEVEL SECURITY (RLS) AGAR INPUT REAL-TIME DARI CLIENT DIIZINKAN
ALTER TABLE public.app_store DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.kru DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_sop DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.penilaian_praktik_onboarding_produk DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attitude_hara DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.penilaian_sikap_kebersihan_kru DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.penilaian_jobdesk_stasiun DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hasil_ujian_mingguan DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users DISABLE ROW LEVEL SECURITY;

-- 13. BERIKAN HAK AKSES PENUH KE ROLE ANON & AUTHENTICATED
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
`;


