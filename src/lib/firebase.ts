/**
 * HARA CHICKEN - FIREBASE PASSIVE STUB
 * Seluruh koneksi jaringan ke Firebase/Firestore dinonaktifkan total sesuai instruksi arsitektur.
 * Aplikasi menggunakan 100% Supabase + Server Proxy + Google Spreadsheets Auto-Sync.
 */

export const auth: any = {
  currentUser: null,
  onAuthStateChanged: (_cb: any) => () => {},
  signOut: async () => {},
};

export const firestore: any = {};
export const db: any = {};
export default {};

export function checkAndHandleQuotaError(_error: unknown): boolean {
  return true;
}

export function isFirestoreQuotaExceeded(): boolean {
  return true;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: Record<string, any>;
}

export function handleFirestoreError(_error: unknown, _operationType: OperationType, _path: string | null) {
  // Pasif - no-op
}

export async function testFirestoreConnection(): Promise<boolean> {
  return false;
}
