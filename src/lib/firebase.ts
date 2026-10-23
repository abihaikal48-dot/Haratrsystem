import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

const databaseId = (firebaseConfig as any).firestoreDatabaseId;

export const firestore: Firestore = getFirestore(app, databaseId);
export const db = firestore;
export default app;

let quotaExceededDetected = true; // Default to local mode per user request

export function checkAndHandleQuotaError(_error: unknown): boolean {
  quotaExceededDetected = true;
  return true;
}

export function isFirestoreQuotaExceeded(): boolean {
  return true; // Always local storage mode
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
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(_error: unknown, operationType: OperationType, path: string | null) {
  console.warn(`Firestore operation ${operationType} on ${path} skipped (Local mode active).`);
}

export async function testFirestoreConnection(): Promise<boolean> {
  return false; // Local mode active
}
