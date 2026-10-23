import { AppUser } from '../types';

export interface ActiveUserPresence {
  id: string;
  userId: string;
  nama: string;
  role: string;
  outlet: string;
  device: string;
  path: string;
  last_seen: string;
  status: 'online' | 'offline';
}

export interface SyncStats {
  success: boolean;
  totalSynced: number;
  tables: Record<string, number>;
  message: string;
}

export type CloudSyncStatus = 'online' | 'syncing' | 'offline';

let currentCloudStatus: CloudSyncStatus = 'online';
const statusListeners = new Set<(status: CloudSyncStatus) => void>();

export function getCloudSyncStatus(): CloudSyncStatus {
  return currentCloudStatus;
}

export function setCloudSyncStatus(status: CloudSyncStatus): void {
  if (currentCloudStatus !== status) {
    currentCloudStatus = status;
    statusListeners.forEach((fn) => fn(status));
  }
}

export function subscribeCloudSyncStatus(callback: (status: CloudSyncStatus) => void): () => void {
  statusListeners.add(callback);
  callback(currentCloudStatus);
  return () => {
    statusListeners.delete(callback);
  };
}

export const ALL_SYNCABLE_TABLES = [
  'penilaian_onboarding_rnd',
  'penilaian_praktik_onboarding_produk',
  'onboarding_batches',
  'ojt_monitoring',
  'hasil_ujian_mingguan',
  'penilaian_praktik',
  'kru',
  'outlets',
  'app_users',
  'bank_sop',
  'bank_soal',
  'penilaian_teori',
  'penilaian_lisan',
  'observasi_lapangan',
  'kartu_keluhan',
  'penugasan_trainer',
  'trainee_outlet',
  'laporan_trainer',
  'tna',
  'rencana_training',
  'coaching_log',
  'gap_analysis',
  'talent_tracker',
  'onboarding_progress',
  'official_audits',
  'official_rapor_kru',
  'exam_config',
  'attitude_hara',
  'retraining_records',
  'jadwal_kunjungan',
  'rapid_audits',
  'active_presences',
  'draft_assessment_sessions',
  'settings',
  'logs'
];

export const SYNCED_TABLES = ALL_SYNCABLE_TABLES;

export async function seedFirestoreIfEmpty(): Promise<void> {
  // Firestore writes disabled per user request to avoid quota exhaustion.
}

export async function syncAllToFirestore(): Promise<SyncStats> {
  return {
    success: true,
    totalSynced: 0,
    tables: {},
    message: 'Penyimpanan lokal aktif (sinkronisasi Cloud Firestore dinonaktifkan sesuai preferensi).'
  };
}

export function setupFirestoreRealtimeSync(): () => void {
  return () => {};
}

export function startPresenceTracking(
  _currentUser: AppUser | null,
  _currentTab: string = 'dashboard'
): () => void {
  return () => {};
}

export function subscribeToOnlineUsers(
  callback: (users: ActiveUserPresence[]) => void
): () => void {
  callback([]);
  return () => {};
}
