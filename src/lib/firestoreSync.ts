import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  query,
  where
} from 'firebase/firestore';
import { firestore } from './firebase';
import { db } from './storage';
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

let isSeeding = false;
let hasSeeded = false;

let realtimeSyncActive = false;
let activeSyncUnsubscribers: (() => void)[] = [];

let presenceInterval: any = null;
let presenceDebounceTimeout: any = null;
let currentSessionId: string = '';
let lastPresenceWriteTime = 0;
let beforeUnloadHandler: (() => void) | null = null;

const ALL_SYNCABLE_TABLES = [
  'outlets',
  'kru',
  'app_users',
  'bank_sop',
  'bank_soal',
  'penilaian_teori',
  'penilaian_praktik',
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
  'trainer_financial_reports',
  'settings',
  'logs'
];

/**
 * Initialize and seed Firestore collections if empty so they immediately appear in Firebase Console.
 * Guarded with isSeeding and hasSeeded flags so it runs at most once per session.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  if (isSeeding || hasSeeded) return;
  isSeeding = true;

  try {
    const outletsRef = collection(firestore, 'outlets');
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 5000)
    );
    const outletsSnapshot = (await Promise.race([
      getDocs(outletsRef),
      timeout,
    ])) as any;

    if (outletsSnapshot && outletsSnapshot.empty) {
      console.log('Seeding initial data to Firebase Firestore...');
      await syncAllToFirestore();
      console.log('Firestore seed completed successfully.');
    }
    hasSeeded = true;
  } catch (err: any) {
    console.warn('Firestore initial check notice:', err?.message || err);
  } finally {
    isSeeding = false;
  }
}

/**
 * Explicit 1-click sync: pushes all current local database rows to Cloud Firestore
 */
export async function syncAllToFirestore(): Promise<SyncStats> {
  const stats: Record<string, number> = {};
  let total = 0;

  try {
    for (const table of ALL_SYNCABLE_TABLES) {
      const rows = db.getTable<any>(table);
      if (Array.isArray(rows) && rows.length > 0) {
        let count = 0;
        // Batch in chunks of 25 to stay well below write limit per transaction
        const chunkSize = 25;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          const batch = writeBatch(firestore);

          for (const item of chunk) {
            const docId = String(item.id || `${table}-${i}-${Math.random().toString(36).slice(2, 6)}`);
            const docRef = doc(firestore, table, docId);
            batch.set(docRef, item, { merge: true });
            count++;
          }

          await batch.commit();
        }

        stats[table] = count;
        total += count;
      }
    }

    return {
      success: true,
      totalSynced: total,
      tables: stats,
      message: `Berhasil menyinkronkan ${total} dokumen ke Cloud Firestore.`
    };
  } catch (error: any) {
    console.error('Error during Firestore full sync:', error);
    return {
      success: false,
      totalSynced: total,
      tables: stats,
      message: `Sinkronisasi gagal: ${error?.message || 'Terjadi kesalahan jaringan'}`
    };
  }
}

/**
 * Listen to Firestore collections to synchronize data across devices real-time.
 * Avoids redundant listeners and prevents infinite loop cycles between local storage and remote Firestore.
 */
export function setupFirestoreRealtimeSync(): () => void {
  if (realtimeSyncActive) {
    return () => {};
  }
  realtimeSyncActive = true;
  activeSyncUnsubscribers = [];

  const collectionsToListen = ALL_SYNCABLE_TABLES;

  collectionsToListen.forEach((colName) => {
    try {
      const colRef = collection(firestore, colName);
      const unsub = onSnapshot(
        colRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const docsData: any[] = [];
            snapshot.forEach((d) => {
              const data = d.data();
              if (data && data.id) {
                docsData.push(data);
              }
            });

            if (docsData.length > 0) {
              const currentLocal = db.getTable<any>(colName);
              // Only update if there is a substantive diff to prevent reactive re-render loops
              if (
                docsData.length !== currentLocal.length ||
                JSON.stringify(docsData.map((d) => d.id).sort()) !== JSON.stringify(currentLocal.map((d) => d.id).sort())
              ) {
                db.setDirect(colName, docsData);
              }
            }
          }
        },
        (err) => {
          console.warn(`Firestore sync listener for ${colName}:`, err.message);
        }
      );
      activeSyncUnsubscribers.push(unsub);
    } catch {
      // Ignore
    }
  });

  return () => {
    activeSyncUnsubscribers.forEach((u) => u());
    activeSyncUnsubscribers = [];
    realtimeSyncActive = false;
  };
}

/**
 * Start Real-Time Online Presence Tracking
 * Tracks who is actively opening the web app across devices with rate-limiting and throttling
 */
export function startPresenceTracking(
  currentUser: AppUser | null,
  currentTab: string = 'dashboard'
): () => void {
  // Generate or retrieve persistent session ID
  if (!currentSessionId) {
    const saved = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('hara_presence_session_id') : null;
    if (saved) {
      currentSessionId = saved;
    } else {
      currentSessionId = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('hara_presence_session_id', currentSessionId);
      }
    }
  }

  const isMobile = typeof navigator !== 'undefined' ? /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent) : false;
  const deviceType = isMobile ? 'Mobile Phone' : 'Desktop / PC';

  const writePresence = async () => {
    try {
      const isExam = typeof window !== 'undefined' && window.location.hash === '#ujian';
      const storedTrainee = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('hara_active_exam_trainee') : null;
      let traineeInfo = null;
      if (storedTrainee) {
        try {
          traineeInfo = JSON.parse(storedTrainee);
        } catch {
          // ignore
        }
      }

      let displayName = 'Pengunjung Web';
      let displayRole = 'Tamu';
      let displayOutlet = 'Pusat HQ';

      if (currentUser && currentUser.nama) {
        displayName = currentUser.nama;
        displayRole = currentUser.role;
        displayOutlet = 'Pusat / Operasional';
      } else if (isExam || traineeInfo) {
        displayName = traineeInfo?.nama_kru ? `Kru: ${traineeInfo.nama_kru}` : 'Kru Ujian Mandiri';
        displayRole = 'Kru Gerai (Ujian)';
        displayOutlet = traineeInfo?.kode_outlet || 'Stasiun Ujian';
      }

      const presenceDoc: ActiveUserPresence = {
        id: currentSessionId,
        userId: currentUser?.id || (traineeInfo?.nama_kru ? `trainee-${traineeInfo.nama_kru}` : 'guest'),
        nama: displayName,
        role: displayRole,
        outlet: displayOutlet,
        device: deviceType,
        path: isExam ? 'Ujian Mandiri Kru' : currentTab,
        last_seen: new Date().toISOString(),
        status: 'online',
      };

      lastPresenceWriteTime = Date.now();
      const ref = doc(firestore, 'online_presence', currentSessionId);
      await setDoc(ref, presenceDoc, { merge: true });
    } catch {
      // Ignore transient errors
    }
  };

  const schedulePresenceWrite = () => {
    const elapsed = Date.now() - lastPresenceWriteTime;
    const MIN_INTERVAL_MS = 15000; // at least 15s between writes

    if (elapsed >= MIN_INTERVAL_MS) {
      if (presenceDebounceTimeout) {
        clearTimeout(presenceDebounceTimeout);
        presenceDebounceTimeout = null;
      }
      writePresence();
    } else {
      if (!presenceDebounceTimeout) {
        presenceDebounceTimeout = setTimeout(() => {
          presenceDebounceTimeout = null;
          writePresence();
        }, MIN_INTERVAL_MS - elapsed);
      }
    }
  };

  // Immediate or throttled update
  schedulePresenceWrite();

  // Regular heartbeat every 30 seconds
  if (presenceInterval) {
    clearInterval(presenceInterval);
  }
  presenceInterval = setInterval(writePresence, 30000);

  // Register beforeunload handler once
  if (!beforeUnloadHandler && typeof window !== 'undefined') {
    beforeUnloadHandler = () => {
      if (currentSessionId) {
        try {
          const ref = doc(firestore, 'online_presence', currentSessionId);
          setDoc(ref, { status: 'offline', last_seen: new Date().toISOString() }, { merge: true }).catch(() => {});
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('beforeunload', beforeUnloadHandler);
  }

  return () => {
    if (presenceInterval) {
      clearInterval(presenceInterval);
      presenceInterval = null;
    }
    if (presenceDebounceTimeout) {
      clearTimeout(presenceDebounceTimeout);
      presenceDebounceTimeout = null;
    }
  };
}

/**
 * Listen to all currently active users on the website in real-time
 */
export function subscribeToOnlineUsers(
  callback: (users: ActiveUserPresence[]) => void
): () => void {
  try {
    const q = query(
      collection(firestore, 'online_presence'),
      where('status', '==', 'online')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const now = Date.now();
        const activeList: ActiveUserPresence[] = [];

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as ActiveUserPresence;
          // User is considered active if heartbeat was within the last 60 seconds
          const lastSeenTime = new Date(data.last_seen).getTime();
          if (now - lastSeenTime < 60000) {
            activeList.push(data);
          }
        });

        // Sort by last seen descending
        activeList.sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime());
        callback(activeList);
      },
      (err) => {
        console.warn('Presence listener notice:', err.message);
        callback([]);
      }
    );
  } catch (err) {
    console.warn('Presence query setup failed:', err);
    callback([]);
    return () => {};
  }
}
