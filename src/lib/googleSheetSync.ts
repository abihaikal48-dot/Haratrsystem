import { PenilaianPraktikOnboardingProduk } from '../types';

export const GOOGLE_SHEET_WEBHOOK_STORAGE_KEY = 'hara_google_sheet_webhook_url';
export const GOOGLE_SHEET_DOC_STORAGE_KEY = 'hara_google_sheet_doc_url';

export function getSavedGoogleSheetWebhook(): string {
  try {
    return localStorage.getItem(GOOGLE_SHEET_WEBHOOK_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveGoogleSheetWebhook(url: string): void {
  try {
    localStorage.setItem(GOOGLE_SHEET_WEBHOOK_STORAGE_KEY, url.trim());
  } catch {
    // Ignore storage errors
  }
}

export function getSavedGoogleSheetDocUrl(): string {
  try {
    return localStorage.getItem(GOOGLE_SHEET_DOC_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveGoogleSheetDocUrl(url: string): void {
  try {
    localStorage.setItem(GOOGLE_SHEET_DOC_STORAGE_KEY, url.trim());
  } catch {
    // Ignore storage errors
  }
}

export const getGoogleSheetWebhookUrl = getSavedGoogleSheetWebhook;
export const saveGoogleSheetWebhookUrl = saveGoogleSheetWebhook;
export const getGoogleSheetDocUrl = getSavedGoogleSheetDocUrl;

export const OUTLET_REAL_NAME_MAP: Record<string, string> = {
  'gto': 'Gito Gati',
  'glg': 'Glagahsari',
  'brb': 'Borobudur',
  'pdg': 'Pandega',
  'pdw': 'Pandowoharjo',
  'jmb': 'Jambon',
  'pwj': 'Purworejo',
  'srg': 'Sorogenen',
  'mjl': 'Monjali',
  'smo': 'Mobile Outlet',
  'mobile': 'Mobile Outlet',
  'mobile outlet': 'Mobile Outlet',
  'gdn': 'Area Godean',
  'kmd': 'Kamdanen',
  'lmp': 'Kantor Lempongsari',
  'krt': 'Kertek',
  'kertek': 'Kertek',
  'rsi': 'RSI',
  'mgl': 'Magelang Tidar',
  'tidar': 'Magelang Tidar',
  'magelang tidar': 'Magelang Tidar',
  'jkl13': 'Jakal 13',
  'jakal 13': 'Jakal 13',
  'wns': 'Jl Wonosari',
  'wonosari': 'Jl Wonosari',
  'jl wonosari': 'Jl Wonosari',
  'prg': 'Jl Parangtritis',
  'parangtritis': 'Jl Parangtritis',
  'jl parangtritis': 'Jl Parangtritis',
  'event : jl parangtritis': 'Event : Jl Parangtritis',
  'event jl parangtritis': 'Event : Jl Parangtritis',
  'rgl': 'Ronggolawe',
  'ronggolawe': 'Ronggolawe',
  'out-001': 'Gito Gati',
  'out-002': 'Glagahsari',
  'out-003': 'Borobudur',
  'out-004': 'Pandega',
  'out-005': 'Pandowoharjo',
  'out-006': 'Jambon',
  'out-007': 'Purworejo',
  'out-008': 'Sorogenen',
  'out-009': 'Monjali',
  'out-010': 'Mobile Outlet',
  'out-011': 'Area Godean',
  'out-012': 'Kamdanen',
  'out-tc': 'Kantor Lempongsari',
};

export function resolveRealOutletName(raw?: string): string {
  if (!raw) return 'Kantor Lempongsari';
  const clean = raw.trim().toLowerCase();
  if (OUTLET_REAL_NAME_MAP[clean]) {
    return OUTLET_REAL_NAME_MAP[clean];
  }
  const knownRealNames = [
    'Kertek', 'Borobudur', 'RSI', 'Magelang Tidar', 'Jakal 13',
    'Mobile Outlet', 'Jl Wonosari', 'Jl Parangtritis', 'Event : Jl Parangtritis',
    'Ronggolawe', 'Gito Gati', 'Glagahsari', 'Pandega', 'Pandowoharjo',
    'Jambon', 'Purworejo', 'Sorogenen', 'Monjali', 'Area Godean', 'Kamdanen', 'Kantor Lempongsari'
  ];
  for (const n of knownRealNames) {
    if (clean.includes(n.toLowerCase())) return n;
  }
  return raw;
}

/**
 * Kirim rekaman penilaian ke Google Spreadsheet via Webhook Google Apps Script.
 * Menggunakan mode 'no-cors' agar request dari browser diizinkan tanpa CORS preflight block.
 */
export async function syncPenilaianToGoogleSheets(
  penilaian: PenilaianPraktikOnboardingProduk,
  customWebhookUrl?: string
): Promise<{ success: boolean; message: string }> {
  const webhookUrl = customWebhookUrl || getSavedGoogleSheetWebhook();
  if (!webhookUrl) {
    return {
      success: false,
      message: 'URL Webhook Google Sheets belum diatur di Pengaturan Koneksi.',
    };
  }

  const kruNama = penilaian.nama_kru || penilaian.kru_nama || 'Kru HARA';
  const lokasiTC = penilaian.lokasi_tc || 'Kantor Lempongsari';
  const rawOutlet = penilaian.outlet_penempatan || penilaian.nama_outlet || penilaian.kode_outlet || penilaian.outlet || 'Gito Gati';
  const outletPenempatan = resolveRealOutletName(rawOutlet);
  const stasiun = penilaian.station_label || penilaian.station || penilaian.posisi_stasiun || '-';
  const durasi = penilaian.waktu_detik ?? penilaian.durasi_detik ?? 0;
  const target = penilaian.target_detik ?? penilaian.standar_durasi_detik ?? 0;
  const durasiMenitTeks = (durasi / 60).toFixed(1) + ' menit';
  const targetMenitTeks = (target / 60).toFixed(1) + ' menit';
  const statusWaktu = penilaian.status_waktu || (durasi && target ? (durasi <= target ? 'Tepat Waktu' : 'Terlambat') : 'Tepat Waktu');
  const skorLangkah = penilaian.skor_prosedur ?? penilaian.skor_langkah_sop ?? penilaian.skor_langkah_teknis ?? 85;
  const skorWaktu = penilaian.skor_waktu ?? 85;
  const skorKnowledge = penilaian.skor_knowledge ?? 85;
  const skorKebersihan = penilaian.skor_kebersihan ?? 90;
  const skorKerjasama = penilaian.skor_kerjasama ?? 90;
  const totalSkor = penilaian.skor_akhir ?? penilaian.total_skor ?? Math.round((skorLangkah * 0.4) + (skorWaktu * 0.4) + (skorKnowledge * 0.2));
  const kelulusan = penilaian.status_kelulusan || penilaian.status || (totalSkor >= 70 ? 'Lulus Kompeten' : 'Perlu Remedial');
  const trainer = penilaian.penilai_nama || penilaian.nama_trainer || penilaian.trainer_nama || 'Trainer HARA';
  const catatan = penilaian.catatan || penilaian.catatan_evaluasi || '-';

  const payload = {
    action: 'ADD_PENILAIAN',
    timestamp: new Date().toISOString(),
    id: penilaian.id,
    tanggal: penilaian.tanggal,
    batch_id: penilaian.batch_id || penilaian.batch_name || 'Batch 30-31 Okt 2026',
    kru_nama: kruNama,
    kru_id: penilaian.kru_id || '-',
    lokasi_tc: lokasiTC,
    outlet_penempatan: outletPenempatan,
    outlet: outletPenempatan,
    posisi_stasiun: stasiun,
    produk_nama: penilaian.produk_nama,
    durasi_detik: durasi,
    target_detik: target,
    durasi_menit: Number((durasi / 60).toFixed(1)),
    target_menit: Number((target / 60).toFixed(1)),
    durasi_menit_teks: durasiMenitTeks,
    target_menit_teks: targetMenitTeks,
    status_waktu: statusWaktu,
    skor_langkah_teknis: skorLangkah,
    skor_waktu: skorWaktu,
    skor_knowledge: skorKnowledge,
    skor_kebersihan_5s: skorKebersihan,
    skor_kerjasama_tim: skorKerjasama,
    total_skor: totalSkor,
    status_kelulusan: kelulusan,
    trainer_nama: trainer,
    catatan_evaluasi: catatan,
  };

  // 1. Coba kirim lewat Backend Proxy Server (Lebih aman, tidak bocor di Network tab browser)
  try {
    const { proxyGoogleSheetSync } = await import('./serverSync');
    const proxyRes = await proxyGoogleSheetSync(payload, webhookUrl);
    if (proxyRes.success) {
      return proxyRes;
    }
  } catch {
    // Fallback ke direct fetch jika backend server proxy tidak merespon
  }

  // 2. Fallback direct browser fetch (mode 'no-cors')
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });

    return {
      success: true,
      message: 'Berhasil dikirim ke Google Spreadsheet.',
    };
  } catch (error: any) {
    console.error('Error sync ke Google Sheet:', error);
    return {
      success: false,
      message: `Gagal sinkronisasi: ${error?.message || 'Koneksi terputus'}`,
    };
  }
}

/**
 * Uji kirim sinyal ping ke Webhook Google Apps Script
 */
export async function testGoogleSheetWebhook(webhookUrl: string): Promise<{ success: boolean; message: string }> {
  if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/')) {
    return {
      success: false,
      message: 'URL tidak valid. Harus diawali dengan https://script.google.com/macros/s/...',
    };
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'PING', timestamp: new Date().toISOString() }),
      mode: 'no-cors',
    });
    return {
      success: true,
      message: 'Sinyal Webhook terkirim! Periksa baris log pada Google Spreadsheet Anda.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menghubungi URL: ${err?.message || 'Error jaringan'}`,
    };
  }
}

/**
 * Ekspor daftar penilaian langsung ke format CSV (bisa langsung dibuka di Excel & Google Sheets)
 * Lengkap dengan Nilai Sikap 5S, Kerjasama Tim, Outlet Penempatan, dan Lokasi TC
 */
export function exportPenilaianToCSV(data: PenilaianPraktikOnboardingProduk[], filename = 'Laporan_Penilaian_Onboarding_HARA.csv'): void {
  if (!data || data.length === 0) {
    alert('Belum ada data penilaian untuk diekspor.');
    return;
  }

  const headers = [
    'No',
    'ID Penilaian',
    'Tanggal Uji',
    'Batch Onboarding',
    'Nama Kru (Peserta)',
    'Lokasi Pelatihan (TC)',
    'Outlet Penempatan',
    'Stasiun Kerja',
    'Menu / SOP Produk',
    'Durasi Aktual (Menit)',
    'Target SOS (Menit)',
    'Status Kecepatan',
    'Skor Teknis SOP (40%)',
    'Skor Waktu SOS (40%)',
    'Skor Knowledge SOP (20%)',
    'Skor Sikap 5S & Kebersihan',
    'Skor Kerjasama Tim',
    'Total Skor Akhir',
    'Status Kelulusan',
    'Trainer / Asesor',
    'Catatan Evaluasi',
  ];

  const rows = data.map((item, idx) => {
    const kruNama = item.nama_kru || item.kru_nama || 'Kru HARA';
    const lokasiTC = item.lokasi_tc || 'Kantor Lempongsari';
    const rawOutlet = item.outlet_penempatan || item.nama_outlet || item.kode_outlet || item.outlet || 'Gito Gati';
    const outletPenempatan = resolveRealOutletName(rawOutlet);
    const stasiun = item.station_label || item.station || item.posisi_stasiun || '-';
    const durasi = item.waktu_detik ?? item.durasi_detik ?? 0;
    const target = item.target_detik ?? item.standar_durasi_detik ?? 0;
    const durasiMenitTeks = (durasi / 60).toFixed(1) + ' menit';
    const targetMenitTeks = (target / 60).toFixed(1) + ' menit';
    const statusWaktu = item.status_waktu || (durasi && target ? (durasi <= target ? 'Tepat Waktu' : 'Terlambat') : 'Tepat Waktu');
    const skorLangkah = item.skor_prosedur ?? item.skor_langkah_sop ?? item.skor_langkah_teknis ?? 85;
    const skorWaktu = item.skor_waktu ?? 85;
    const skorKnowledge = item.skor_knowledge ?? 85;
    const skorKebersihan = item.skor_kebersihan ?? 90;
    const skorKerjasama = item.skor_kerjasama ?? 90;
    const totalSkor = item.skor_akhir ?? item.total_skor ?? Math.round((skorLangkah * 0.4) + (skorWaktu * 0.4) + (skorKnowledge * 0.2));
    const kelulusan = item.status_kelulusan || item.status || (totalSkor >= 70 ? 'Lulus' : 'Remedial');
    const trainer = item.penilai_nama || item.nama_trainer || item.trainer_nama || 'Trainer HARA';
    const catatan = item.catatan || item.catatan_evaluasi || '-';

    return [
      idx + 1,
      `"${item.id}"`,
      `"${item.tanggal}"`,
      `"${item.batch_id || item.batch_name || 'Batch 30-31 Okt 2026'}"`,
      `"${kruNama.replace(/"/g, '""')}"`,
      `"${lokasiTC.replace(/"/g, '""')}"`,
      `"${outletPenempatan.replace(/"/g, '""')}"`,
      `"${stasiun.replace(/"/g, '""')}"`,
      `"${(item.produk_nama || '').replace(/"/g, '""')}"`,
      `"${durasiMenitTeks}"`,
      `"${targetMenitTeks}"`,
      `"${statusWaktu}"`,
      skorLangkah,
      skorWaktu,
      skorKnowledge,
      skorKebersihan,
      skorKerjasama,
      totalSkor,
      `"${kelulusan}"`,
      `"${trainer.replace(/"/g, '""')}"`,
      `"${catatan.replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Template Kode Google Apps Script untuk dipasang di Google Sheets (Extensions -> Apps Script).
 * Dilengkapi dengan pembuatan otomatis 2 Sheet: Sheet 1 'Data Penilaian' & Sheet 2 'Dashboard Analitik'.
 */
export const HARA_APPS_SCRIPT_TEMPLATE = `
/**
 * HARA CHICKEN - SCRIPT PENERIMA DATA PENILAIAN OTOMATIS
 * Langkah Pemasangan:
 * 1. Buat Google Spreadsheet baru (beri nama 'HARA - Rekap Penilaian Training')
 * 2. Klik menu 'Extensions' -> 'Apps Script'
 * 3. Hapus semua kode default, lalu Tempel (Paste) seluruh kode ini
 * 4. Klik tombol Simpan (ikon disket)
 * 5. Klik tombol 'Deploy' -> 'New deployment'
 * 6. Pilih tipe: 'Web app'
 * 7. Pada 'Execute as': Pilih 'Me'
 * 8. Pada 'Who has access': Pilih 'Anyone' (PENTING agar web app dapat mengirim data tanpa login)
 * 9. Klik 'Deploy', izinkan otorisasi, lalu salin 'Web app URL'
 * 10. Masukkan URL tersebut ke Pengaturan Koneksi di aplikasi HARA Chicken.
 */

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetData = ss.getSheetByName("Data Penilaian");
    if (!sheetData) {
      sheetData = ss.insertSheet("Data Penilaian");
      sheetData.appendRow([
        "Waktu Input", "ID Penilaian", "Tanggal Ujian", "Batch ID", "Nama Kru", 
        "Lokasi TC", "Outlet Penempatan", "Stasiun", "Produk SOP", "Durasi (Menit)", "Target (Menit)", 
        "Status SOS", "Skor SOP (40%)", "Skor Waktu (40%)", "Skor Knowledge (20%)", 
        "Kebersihan 5S", "Kerja Sama Tim", "Total Skor", "Kelulusan", "Trainer", "Catatan"
      ]);
      sheetData.getRange("A1:U1").setBackground("#991b1b").setFontColor("#ffffff").setFontWeight("bold");
      sheetData.setFrozenRows(1);
    }

    var payload = JSON.parse(e.postData.contents);
    
    if (payload.action === "PING") {
      return ContentService.createTextOutput(JSON.stringify({ status: "PONG", message: "Koneksi Berhasil!" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheetData.appendRow([
      payload.timestamp || new Date(),
      payload.id || "",
      payload.tanggal || "",
      payload.batch_id || "",
      payload.kru_nama || "",
      payload.lokasi_tc || "Kantor Lempongsari",
      payload.outlet_penempatan || payload.outlet || "",
      payload.posisi_stasiun || "",
      payload.produk_nama || "",
      payload.durasi_menit_teks || (payload.durasi_detik ? (payload.durasi_detik / 60).toFixed(1) + " menit" : "0.0 menit"),
      payload.target_menit_teks || (payload.target_detik ? (payload.target_detik / 60).toFixed(1) + " menit" : "0.0 menit"),
      payload.status_waktu || "",
      payload.skor_langkah_teknis || 0,
      payload.skor_waktu || 0,
      payload.skor_knowledge || 0,
      payload.skor_kebersihan_5s || payload.skor_kebersihan || 0,
      payload.skor_kerjasama_tim || payload.skor_kerjasama || 0,
      payload.total_skor || 0,
      payload.status_kelulusan || "",
      payload.trainer_nama || "",
      payload.catatan_evaluasi || ""
    ]);

    // Format & Bangun Sheet Dashboard Analitik jika belum ada
    setupAnalitikSheet(ss);

    return ContentService.createTextOutput(JSON.stringify({ status: "SUCCESS", message: "Data tersimpan" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "ERROR", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function setupAnalitikSheet(ss) {
  var sheetAnalitik = ss.getSheetByName("Dashboard Analitik");
  if (!sheetAnalitik) {
    sheetAnalitik = ss.insertSheet("Dashboard Analitik");
    sheetAnalitik.appendRow(["KPI & ANALITIK PENILAIAN HARA CHICKEN", ""]);
    sheetAnalitik.appendRow(["Total Kru Dinilai", "=COUNTA('Data Penilaian'!E2:E)"]);
    sheetAnalitik.appendRow(["Kru Lulus (Skor >= 75)", "=COUNTIF('Data Penilaian'!T2:T, \\"*KOMPETEN*\\")"]);
    sheetAnalitik.appendRow(["Kru Perlu Remedi", "=COUNTIF('Data Penilaian'!T2:T, \\"*PERLU_REMEDIAL*\\")"]);
    sheetAnalitik.appendRow(["Tingkat Kelulusan (%)", "=IF(B2>0, (B3/B2)*100, 0)"]);
    sheetAnalitik.appendRow(["Rata-rata Skor Teknis", "=AVERAGE('Data Penilaian'!Q2:Q)"]);
    sheetAnalitik.appendRow(["Rata-rata Skor Sikap & 5S", "=AVERAGE('Data Penilaian'!R2:R)"]);
    sheetAnalitik.appendRow(["Rata-rata Skor Akhir", "=AVERAGE('Data Penilaian'!S2:S)"]);

    sheetAnalitik.getRange("A1:B1").setBackground("#1e293b").setFontColor("#f8fafc").setFontWeight("bold");
    sheetAnalitik.getRange("A2:A8").setFontWeight("bold");
    sheetAnalitik.setColumnWidth(1, 240);
    sheetAnalitik.setColumnWidth(2, 160);
  }
}
`;
