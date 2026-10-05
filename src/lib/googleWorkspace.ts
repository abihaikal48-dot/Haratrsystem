import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import { auth } from './firebase';
import { db } from './storage';

// In-memory access token cache (Strict security constraint: never localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Google OAuth Provider with required scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

export interface GoogleAuthStatus {
  isSignedIn: boolean;
  user: FirebaseUser | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Initialize Auth listener
 */
export const initGoogleAuth = (
  onSuccess?: (user: FirebaseUser, token: string) => void,
  onFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user && cachedAccessToken) {
      if (onSuccess) onSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        if (onFailure) onFailure();
      }
    }
  });
};

/**
 * Sign in with Google Popup
 */
export const googleSignIn = async (): Promise<{ user: FirebaseUser; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan Access Token OAuth dari Google.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (err: any) {
    console.error('Google Sign In Error:', err);
    throw err;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get in-memory Access Token
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Sign out Google
 */
export const googleSignOut = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Export system operational data directly to a new Google Spreadsheet
 */
export async function exportToGoogleSheets(customTitle?: string): Promise<{
  spreadsheetId: string;
  spreadsheetUrl: string;
}> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Harap hubungkan akun Google terlebih dahulu (Belum terautentikasi).');
  }

  const title =
    customTitle ||
    `HARA CHICKEN · Laporan Operasional & Kompetensi (${new Date().toLocaleDateString('id-ID')})`;

  // 1. Create Spreadsheet with predefined sheets
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title },
      sheets: [
        { properties: { title: 'Ringkasan Kompetensi Kru' } },
        { properties: { title: 'Uji Praktik SOS' } },
        { properties: { title: 'Kartu Keluhan & RCA' } },
        { properties: { title: 'Daftar Gerai' } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal membuat Google Spreadsheet (Status: ${createRes.status})`
    );
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare Data Rows from Storage
  const competencies = db.getCrewCompetencySummaries();
  const praktikList = db.getTable<any>('penilaian_praktik');
  const keluhanList = db.getTable<any>('kartu_keluhan');
  const outlets = db.getTable<any>('outlets');

  const valueUpdates = [
    {
      range: 'Ringkasan Kompetensi Kru!A1:H',
      values: [
        [
          'Nama Kru',
          'Kode Outlet',
          'Divisi',
          'Level Kompetensi',
          'Skor Teori (25%)',
          'Skor Praktik (35%)',
          'Skor Lisan (20%)',
          'Skor Akhir Terpadu',
        ],
        ...competencies.map((c) => [
          c.namaKru,
          c.kode_outlet,
          c.divisi,
          c.badge,
          c.skorTeori ?? '-',
          c.skorPraktik ?? '-',
          c.skorLisan ?? '-',
          c.skorAkhir ?? '-',
        ]),
      ],
    },
    {
      range: 'Uji Praktik SOS!A1:H',
      values: [
        [
          'Nama Kru',
          'Kode Outlet',
          'Divisi',
          'SOP Diuji',
          'Durasi SOS (Detik)',
          'Suhu Minyak (°C)',
          'Skor Praktik',
          'Tanggal',
        ],
        ...praktikList.map((p) => [
          p.nama_kru,
          p.kode_outlet,
          p.divisi,
          p.sop_terkait,
          p.durasi_detik,
          p.suhu_minyak_c,
          p.skor_akhir,
          p.tanggal,
        ]),
      ],
    },
    {
      range: 'Kartu Keluhan & RCA!A1:G',
      values: [
        [
          'Kode Outlet',
          'Divisi',
          'Jenis Keluhan',
          'Deskripsi Kasus',
          'Faktor Penyebab 5M',
          'Status',
          'Tanggal',
        ],
        ...keluhanList.map((k) => [
          k.kode_outlet,
          k.divisi,
          k.jenis_keluhan,
          k.deskripsi,
          k.faktor_penyebab || '-',
          k.status,
          k.tanggal,
        ]),
      ],
    },
    {
      range: 'Daftar Gerai!A1:E',
      values: [
        ['Kode Outlet', 'Nama Gerai', 'Alamat', 'Kepala Outlet', 'Area Supervisor'],
        ...outlets.map((o) => [
          o.kode_outlet,
          o.nama_outlet,
          o.alamat,
          o.kepala_outlet,
          o.area_supervisor,
        ]),
      ],
    },
  ];

  // 3. Populate all rows via batchUpdate
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueUpdates,
      }),
    }
  );

  if (!updateRes.ok) {
    const errorData = await updateRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal mengisi data Google Spreadsheet (Status: ${updateRes.status})`
    );
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Upload a text or PDF report file into Google Drive
 */
export async function uploadReportToGoogleDrive(
  filename: string,
  content: string,
  mimeType: string = 'text/plain'
): Promise<{ fileId: string; webViewLink: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Harap hubungkan akun Google terlebih dahulu.');
  }

  const metadata = {
    name: filename,
    mimeType,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal mengunggah berkas ke Google Drive.');
  }

  const result = await res.json();
  return {
    fileId: result.id,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
  };
}
