import { PenilaianPraktikOnboardingProduk } from '../types';

export const GOOGLE_SHEET_WEBHOOK_STORAGE_KEY = 'hara_google_sheet_webhook_url';

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

export const getGoogleSheetWebhookUrl = getSavedGoogleSheetWebhook;
export const saveGoogleSheetWebhookUrl = saveGoogleSheetWebhook;

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
  const outlet = penilaian.nama_outlet || penilaian.kode_outlet || penilaian.outlet || 'HARA Pusat';
  const stasiun = penilaian.station_label || penilaian.station || penilaian.posisi_stasiun || '-';
  const durasi = penilaian.waktu_detik ?? penilaian.durasi_detik ?? 0;
  const target = penilaian.target_detik ?? penilaian.standar_durasi_detik ?? 0;
  const statusWaktu = penilaian.status_waktu || (durasi && target ? (durasi <= target ? 'Tepat Waktu' : 'Terlambat') : 'Tepat Waktu');
  const skorLangkah = penilaian.skor_prosedur ?? penilaian.skor_langkah_sop ?? penilaian.skor_langkah_teknis ?? 80;
  const skorWaktu = penilaian.skor_waktu ?? 80;
  const skorKnowledge = penilaian.skor_knowledge ?? 80;
  const skorKebersihan = penilaian.skor_kebersihan ?? 80;
  const skorKerjasama = penilaian.skor_kerjasama ?? 80;
  const subTeknis = penilaian.subskor_teknis ?? Math.round((skorLangkah * 0.4) + (skorWaktu * 0.3) + (skorKnowledge * 0.3));
  const subSikap = penilaian.subskor_sikap ?? Math.round((skorKebersihan * 0.5) + (skorKerjasama * 0.5));
  const totalSkor = penilaian.skor_akhir ?? penilaian.total_skor ?? Math.round((subTeknis * 0.5) + (subSikap * 0.5));
  const kelulusan = penilaian.status_kelulusan || penilaian.status || (totalSkor >= 75 ? 'Lulus Kompeten' : 'Perlu Remedial');
  const trainer = penilaian.penilai_nama || penilaian.nama_trainer || penilaian.trainer_nama || 'Trainer HARA';
  const catatan = penilaian.catatan || penilaian.catatan_evaluasi || '-';

  const payload = {
    action: 'ADD_PENILAIAN',
    timestamp: new Date().toISOString(),
    id: penilaian.id,
    tanggal: penilaian.tanggal,
    batch_id: penilaian.batch_id || penilaian.batch_name || '-',
    kru_nama: kruNama,
    kru_id: penilaian.kru_id || '-',
    outlet: outlet,
    posisi_stasiun: stasiun,
    produk_nama: penilaian.produk_nama,
    durasi_detik: durasi,
    target_detik: target,
    status_waktu: statusWaktu,
    skor_langkah_teknis: skorLangkah,
    skor_waktu: skorWaktu,
    skor_knowledge: skorKnowledge,
    skor_kebersihan: skorKebersihan,
    skor_kerjasama: skorKerjasama,
    subskor_teknis: subTeknis,
    subskor_sikap: subSikap,
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
 */
export function exportPenilaianToCSV(data: PenilaianPraktikOnboardingProduk[], filename = 'Laporan_Penilaian_HARA.csv'): void {
  if (!data || data.length === 0) {
    alert('Belum ada data penilaian untuk diekspor.');
    return;
  }

  const headers = [
    'ID',
    'Tanggal',
    'Batch ID',
    'Nama Kru',
    'Outlet',
    'Stasiun',
    'Produk SOP',
    'Durasi (Detik)',
    'Target SOS (Detik)',
    'Status Waktu',
    'Skor Teknis SOP',
    'Skor Waktu',
    'Skor Knowledge',
    'Skor Kebersihan 5S',
    'Skor Kerja Sama & Sikap',
    'Pilar 1 (Teknis 50%)',
    'Pilar 2 (Sikap 50%)',
    'Total Skor Akhir',
    'Status Kelulusan (KKM 75)',
    'Nama Trainer',
    'Catatan Evaluasi',
  ];

  const rows = data.map((item) => {
    const kruNama = item.nama_kru || item.kru_nama || 'Kru HARA';
    const outlet = item.nama_outlet || item.kode_outlet || item.outlet || 'HARA Pusat';
    const stasiun = item.station_label || item.station || item.posisi_stasiun || '-';
    const durasi = item.waktu_detik ?? item.durasi_detik ?? 0;
    const target = item.target_detik ?? item.standar_durasi_detik ?? 0;
    const statusWaktu = item.status_waktu || (durasi && target ? (durasi <= target ? 'Tepat Waktu' : 'Terlambat') : 'Tepat Waktu');
    const skorLangkah = item.skor_prosedur ?? item.skor_langkah_sop ?? item.skor_langkah_teknis ?? 80;
    const skorWaktu = item.skor_waktu ?? 80;
    const skorKnowledge = item.skor_knowledge ?? 80;
    const skorKebersihan = item.skor_kebersihan ?? 80;
    const skorKerjasama = item.skor_kerjasama ?? 80;
    const subTeknis = item.subskor_teknis ?? Math.round((skorLangkah * 0.4) + (skorWaktu * 0.3) + (skorKnowledge * 0.3));
    const subSikap = item.subskor_sikap ?? Math.round((skorKebersihan * 0.5) + (skorKerjasama * 0.5));
    const totalSkor = item.skor_akhir ?? item.total_skor ?? Math.round((subTeknis * 0.5) + (subSikap * 0.5));
    const kelulusan = item.status_kelulusan || item.status || (totalSkor >= 75 ? 'Lulus Kompeten' : 'Perlu Remedial');
    const trainer = item.penilai_nama || item.nama_trainer || item.trainer_nama || 'Trainer HARA';
    const catatan = item.catatan || item.catatan_evaluasi || '-';

    return [
      `"${item.id}"`,
      `"${item.tanggal}"`,
      `"${item.batch_id || item.batch_name || '-'}"`,
      `"${kruNama.replace(/"/g, '""')}"`,
      `"${outlet.replace(/"/g, '""')}"`,
      `"${stasiun.replace(/"/g, '""')}"`,
      `"${(item.produk_nama || '').replace(/"/g, '""')}"`,
      durasi,
      target,
      `"${statusWaktu}"`,
      skorLangkah,
      skorWaktu,
      skorKnowledge,
      skorKebersihan,
      skorKerjasama,
      subTeknis,
      subSikap,
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
        "Outlet", "Stasiun", "Produk SOP", "Durasi (Detik)", "Target (Detik)", 
        "Status SOS", "Skor SOP (40%)", "Skor Waktu (30%)", "Skor Knowledge (30%)", 
        "Kebersihan 5S", "Sikap & Kerja Sama", "Pilar Teknis (50%)", "Pilar Sikap (50%)", 
        "Total Skor", "Kelulusan", "Trainer", "Catatan"
      ]);
      sheetData.getRange("A1:V1").setBackground("#991b1b").setFontColor("#ffffff").setFontWeight("bold");
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
      payload.outlet || "",
      payload.posisi_stasiun || "",
      payload.produk_nama || "",
      payload.durasi_detik || 0,
      payload.target_detik || 0,
      payload.status_waktu || "",
      payload.skor_langkah_teknis || 0,
      payload.skor_waktu || 0,
      payload.skor_knowledge || 0,
      payload.skor_kebersihan || 0,
      payload.skor_kerjasama || 0,
      payload.subskor_teknis || 0,
      payload.subskor_sikap || 0,
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
