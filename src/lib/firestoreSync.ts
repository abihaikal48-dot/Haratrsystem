/**
 * HARA CHICKEN - FIRESTORE SYNC PASSIVE STUB
 * Koneksi jaringan ke Firestore dinonaktifkan total sesuai instruksi arsitektur.
 * Seluruh sinkronisasi data dialihkan 100% ke Supabase & Google Spreadsheets.
 */

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

export function getCloudSyncStatus(): CloudSyncStatus {
  return 'online';
}

export function setCloudSyncStatus(_status: CloudSyncStatus): void {
  // Pasif - no-op
}

export function subscribeCloudSyncStatus(callback: (status: CloudSyncStatus) => void): () => void {
  callback('online');
  return () => {};
}

export const ALL_SYNCABLE_TABLES: string[] = [];
export const SYNCED_TABLES = ALL_SYNCABLE_TABLES;

export async function seedFirestoreIfEmpty(): Promise<void> {
  // Pasif - no-op
}

export async function syncAllToFirestore(): Promise<SyncStats> {
  return {
    success: true,
    totalSynced: 0,
    tables: {},
    message: 'Firestore dinonaktifkan. Data tersimpan 100% di Supabase & Google Spreadsheet.'
  };
}

export function setupFirestoreRealtimeSync(): () => void {
  return () => {};
}

export function startPresenceTracking(_user: AppUser, _currentTab: string): () => void {
  return () => {};
}

export function subscribeToOnlineUsers(callback: (users: ActiveUserPresence[]) => void): () => void {
  callback([]);
  return () => {};
}
