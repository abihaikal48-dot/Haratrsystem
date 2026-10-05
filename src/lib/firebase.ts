import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

const databaseId = (firebaseConfig as any).firestoreDatabaseId;

// Initialize Firestore with experimentalForceLongPolling: true to ensure reliable
// connectivity in sandboxes, iframes, proxies, and restricted networks.
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    databaseId
  );
} catch {
  // If Firestore is already initialized in this runtime, retrieve existing instance
  firestoreInstance = getFirestore(app, databaseId);
}

export const firestore = firestoreInstance;
export default app;

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 4000)
    );
    await Promise.race([
      getDocFromServer(doc(firestore, 'test', 'connection')),
      timeout,
    ]);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline or connecting...');
    }
    return false;
  }
}
