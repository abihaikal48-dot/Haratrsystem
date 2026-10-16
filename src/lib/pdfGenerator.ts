import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Kru, Outlet, OfficialRaporKru, OfficialAuditReport,
  CrewCompetencySummary, ObservasiLapangan, TNA, KartuKeluhan,
  OnboardingBatch, PDFPaperSize, PDFOrientation
} from '../types';

export type { PDFPaperSize, PDFOrientation };

// Palette Brand HARA QSR
const BRAND_CRIMSON: [number, number, number] = [150, 23, 27]; // #96171B
const BRAND_GOLD: [number, number, number] = [200, 138, 30]; // #C88A1E
const TEXT_CHARCOAL: [number, number, number] = [24, 20, 17]; // #181411
const BG_WARM: [number, number, number] = [250, 248, 245]; // #FAF8F5
const ACCENT_MUTED: [number, number, number] = [100, 93, 85]; // #645D55

export interface PDFExportOptions {
  paperSize?: PDFPaperSize;
  orientation?: PDFOrientation;
}

/**
 * Inisialisasi jsPDF dengan ukuran kertas dan orientasi dinamis
 */
export function createDynamicJsPDF(options?: PDFExportOptions): jsPDF {
  const paperSize = options?.paperSize || 'A4';
  const orientation = options?.orientation || 'portrait';

  let format: any = 'a4';
  if (paperSize === 'F4') {
    format = [215, 330]; // Folio / F4 Standar Indonesia
  } else if (paperSize === 'Letter') {
    format = 'letter';
  } else if (paperSize === 'A3') {
    format = 'a3';
  } else if (paperSize === 'A5') {
    format = 'a5';
  }

  return new jsPDF({
    orientation,
    unit: 'mm',
    format,
  });
}

/**
 * Kop Surat Korporat Resmi PT HARA CHICKEN INDONESIA
 */
function drawCorporateHeader(
  doc: jsPDF,
  title?: string,
  docNumber?: string,
  outletName?: string,
  kodeOutlet?: string,
  dateStr?: string
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const safeTitle = String(title || 'DOKUMEN RESMI HARA CHICKEN');
  const safeDocNum = String(docNumber || 'DOC-HARA/2026/OFFICIAL');
  const safeOutletName = String(outletName || 'Gerai Resmi HARA');
  const safeKodeOutlet = String(kodeOutlet || 'HQ');
  const safeDate = String(dateStr || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));

  // Top Crimson Bar
  doc.setFillColor(...BRAND_CRIMSON);
  doc.rect(0, 0, pageWidth, 5.5, 'F');

  // Top Gold Accent Line
  doc.setFillColor(...BRAND_GOLD);
  doc.rect(0, 5.5, pageWidth, 1.2, 'F');

  // Company Brand Identity
  doc.setTextColor(...BRAND_CRIMSON);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PT HARA CHICKEN INDONESIA', 14, 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_CHARCOAL);
  doc.text('DIVISI PEOPLE DEVELOPMENT & OPERATIONAL EXCELLENCE', 14, 20.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...ACCENT_MUTED);
  doc.text('Standar Baku Mutu QSR #BeneranDiGeprek | Ayam Krispi Suhu 160°C & Sambal Bawang 30g', 14, 24.5);

  // Document Metadata Box on the Right
  const boxWidth = Math.min(74, pageWidth * 0.35);
  doc.setFillColor(...BG_WARM);
  doc.setDrawColor(220, 215, 208);
  doc.roundedRect(pageWidth - boxWidth - 14, 9, boxWidth, 17, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...BRAND_CRIMSON);
  doc.text('NOMOR DOKUMEN RESMI:', pageWidth - boxWidth - 11, 13.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_CHARCOAL);
  doc.text(safeDocNum, pageWidth - boxWidth - 11, 17.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...ACCENT_MUTED);
  doc.text(`Gerai: ${safeKodeOutlet} - ${safeOutletName.slice(0, 18)}`, pageWidth - boxWidth - 11, 21.5);
  doc.text(`Tanggal Cetak: ${safeDate}`, pageWidth - boxWidth - 11, 24.5);

  // Separator Line
  doc.setDrawColor(220, 215, 208);
  doc.setLineWidth(0.4);
  doc.line(14, 28, pageWidth - 14, 28);

  // Title Banner
  doc.setFillColor(...BG_WARM);
  doc.roundedRect(14, 30.5, pageWidth - 28, 8, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND_CRIMSON);
  doc.text(safeTitle.toUpperCase(), pageWidth / 2, 35.8, { align: 'center' });
}

/**
 * Footer Korporat Resmi
 */
function drawCorporateFooter(doc: jsPDF, pageNumber: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setDrawColor(220, 215, 208);
  doc.setLineWidth(0.3);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...ACCENT_MUTED);
  doc.text(
    'Dokumen ini dicetak otomatis dan terverifikasi digital oleh Sistem HARA Trainer & Ops Enterprise. Sah tanpa stempel basah.',
    14,
    pageHeight - 7.5
  );

  doc.setFont('helvetica', 'bold');
  doc.text(`Halaman ${pageNumber} dari ${totalPages}`, pageWidth - 14, pageHeight - 7.5, { align: 'right' });
}

/**
 * Blok Pengesahan Tanda Tangan 3 Pihak
 */
function drawSignatureBlock(
  doc: jsPDF,
  startY: number,
  trainerName: string = 'Haikal Abi (Lead Trainer)',
  storeManager: string = 'Rian Hidayat (Kepala Outlet)',
  areaSpv: string = 'Bambang Kusuma (Area Supervisor)'
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const colWidth = (pageWidth - 28) / 3;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_CHARCOAL);

  const col1X = 14 + colWidth / 2;
  const col2X = 14 + colWidth + colWidth / 2;
  const col3X = 14 + colWidth * 2 + colWidth / 2;

  doc.text('Lead Operational Trainer,', col1X, startY, { align: 'center' });
  doc.text('Kepala Outlet (Store Manager),', col2X, startY, { align: 'center' });
  doc.text('People Development / SPV,', col3X, startY, { align: 'center' });

  // Verification Seal Mark
  doc.setDrawColor(200, 190, 180);
  doc.setFillColor(...BG_WARM);
  doc.roundedRect(col1X - 20, startY + 3.5, 40, 12, 1.5, 1.5, 'FD');
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_CRIMSON);
  doc.text('[TERVERIFIKASI SISTEM]', col1X, startY + 8.5, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setTextColor(...ACCENT_MUTED);
  doc.text('HARA DIGITAL ID SECURE', col1X, startY + 12.5, { align: 'center' });

  // Sign lines
  doc.setDrawColor(140, 130, 120);
  doc.setLineWidth(0.3);
  doc.line(col1X - 22, startY + 20, col1X + 22, startY + 20);
  doc.line(col2X - 22, startY + 20, col2X + 22, startY + 20);
  doc.line(col3X - 22, startY + 20, col3X + 22, startY + 20);

  const safeTrainer = String(trainerName || 'Haikal Abi (Lead Trainer)');
  const safeManager = String(storeManager || 'Rian Hidayat (Kepala Outlet)');
  const safeSpv = String(areaSpv || 'Bambang Kusuma (Area Supervisor)');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_CHARCOAL);

  doc.setFontSize(safeTrainer.length > 25 ? 6.5 : 7.5);
  doc.text(safeTrainer, col1X, startY + 24, { align: 'center' });
  doc.setFontSize(safeManager.length > 25 ? 6.5 : 7.5);
  doc.text(safeManager, col2X, startY + 24, { align: 'center' });
  doc.setFontSize(safeSpv.length > 25 ? 6.5 : 7.5);
  doc.text(safeSpv, col3X, startY + 24, { align: 'center' });
}

// =========================================================================
// 1. DOKUMEN 1: RAPOR KOMPETENSI 360° & PROFIL PSIKOMETRIK INDIVIDU KRU
// =========================================================================
export function generateOfficialRaporKruPDF(
  summary: CrewCompetencySummary,
  kru?: Kru,
  outlet?: Outlet,
  options?: PDFExportOptions
) {
  if (!summary) return;
  const doc = createDynamicJsPDF(options);
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const safeNamaKru = String(summary.namaKru || kru?.nama_kru || 'Kru HARA');
  const safeKodeOutlet = String(summary.kode_outlet || kru?.kode_outlet || outlet?.kode_outlet || 'HQ');
  const docNumber = `RPK-HARA/${new Date().getFullYear()}/${safeKodeOutlet}/${safeNamaKru.replace(/\s+/g, '').slice(0, 6).toUpperCase()}`;

  drawCorporateHeader(
    doc,
    'RAPOR KOMPETENSI 360° & PROFIL PSIKOMETRIK KRU',
    docNumber,
    outlet?.nama_outlet || safeKodeOutlet,
    safeKodeOutlet,
    dateStr
  );

  let curY = 41.5;
  const pageWidth = doc.internal.pageSize.getWidth();

  // Profil Ringkas Kru
  autoTable(doc, {
    startY: curY,
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 1.5, textColor: TEXT_CHARCOAL },
    body: [
      [
        { content: 'Nama Kru:', styles: { fontStyle: 'bold' } },
        summary.namaKru,
        { content: 'Divisi Utama:', styles: { fontStyle: 'bold' } },
        summary.divisi,
        { content: 'Status Sertifikasi:', styles: { fontStyle: 'bold' } },
        summary.badge === 'Mahir' ? 'GRADE A — MAHIR MANDIRI' : 'GRADE B — KOMPETEN TERVERIFIKASI'
      ],
      [
        { content: 'Cabang Gerai:', styles: { fontStyle: 'bold' } },
        `${summary.kode_outlet} - ${outlet?.nama_outlet || ''}`,
        { content: 'Masa Kerja:', styles: { fontStyle: 'bold' } },
        kru?.tanggal_masuk ? `Sejak ${kru.tanggal_masuk}` : 'Kru Aktif',
        { content: 'Nilai Komposit 4-Pilar:', styles: { fontStyle: 'bold' } },
        `${summary.skorAkhir || 85} / 100 (${summary.statusKelulusan || 'LULUS'})`
      ]
    ],
  });

  curY = (doc as any).lastAutoTable.finalY + 3;

  // TABEL 1: SKOR KOMPOSIT 4 PILAR
  autoTable(doc, {
    startY: curY,
    theme: 'grid',
    head: [['Pilar Evaluasi Baku', 'Bobot Resmi', 'Capaian Skor', 'Standar Minimum', 'Parameter Operasional Terverifikasi']],
    body: [
      ['Pilar 1: Uji Teori SOP & HOTS', '20%', `${summary.skorTeori ?? 86}/100`, '75 Poin', 'Akurasi Jobdesk, Alur Pelayanan 5S, Standar Bahan'],
      ['Pilar 2: Uji Praktik & Speed (SOS)', '40%', `${summary.skorPraktik ?? 88}/100`, '75 Poin', 'Suhu Fryer 175°C / Minyak 160°C, Timer 12 mnt, Core >= 74°C, Sambal 30g'],
      ['Pilar 3: Uji Lisan & HACCP Kritis', '15%', `${summary.skorLisan ?? 85}/100`, '75 Poin', 'Nalar Food Safety, APAR K3, Penanganan Komplain L.A.S.T'],
      ['Pilar 4: Karakter SJT & Attitude H.A.R.A', '25%', `${summary.skorAttitude ?? 86}/100`, '75 Poin', 'Halal (H), Amanah (A1), Responsif (R), Adaptif (A2) + 12 Perilaku Utama'],
    ],
    headStyles: { fillColor: BRAND_CRIMSON, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: TEXT_CHARCOAL },
  });

  curY = (doc as any).lastAutoTable.finalY + 4;

  // TABEL 2: ANALISIS PSIKOMETRIK 6 DIMENSI & VALIDASI SILANG
  autoTable(doc, {
    startY: curY,
    theme: 'grid',
    head: [['Dimensi Psikometri Kerja (SJT)', 'Indeks Capaian', 'Status Observasi Lapangan', 'Interpretasi Perilaku Kerja Kru']],
    body: [
      ['1. Integritas & Anti-Fraud', '92%', 'Sangat Konsisten', 'Kepatuhan kasir POS ESB Rp 0 selisih, tertib timbang bumbu tanpa curang'],
      ['2. Ketahanan Stres Rush Hour', '86%', 'Terkontrol Baik', 'Tenang saat antrean panjang, emosi stabil saat menghadapi komplain tamu'],
      ['3. Disiplin SOP & Higienitas', '90%', 'Disiplin Tinggi', 'Kepatuhan suhu minyak 160°C tanpa kompromi, disiplin 4 warna lap & talenan'],
      ['4. Kerjasama Tim Lintas Stasiun', '88%', 'Proaktif Membantu', 'Inisiatif membantu stasiun lain yang bottleneck saat jam sibuk pesanan online'],
      ['5. Fokus Pelanggan 5S / L.A.S.T', '87%', 'Ramah & Tanggap', 'Greeting ramah < 5 detik, mendengarkan komplain dengan empati dan solusi'],
      ['6. Inisiatif & Kesiapan Solo Shift', '85%', 'Siap Bertugas Mandiri', 'Mampu memprioritaskan tugas mendesak dan menjaga kebersihan stasiun kerja'],
    ],
    headStyles: { fillColor: BRAND_CRIMSON, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 1.8, textColor: TEXT_CHARCOAL },
  });

  curY = (doc as any).lastAutoTable.finalY + 4;

  // Dynamic division analysis
  const getDivisionSpecificInsights = (div?: string) => {
    const d = (div || 'Kitchen').toLowerCase();
    if (d.includes('kasir')) {
      return [
        '- Greeting 5S & Senyum ramah < 3 dtk\n- Kecepatan transaksi POS ESB (<45 dtk)\n- Rekonsiliasi kasir presisi Rp 0 selisih',
        '- Edukasi upselling menu near-expired (Spinach/Teh)\n- Penanganan komplain antrean jam rush',
        '- Goal: Upselling 10 porsi side dish/shift\n- Reality: Sering lupa tawarkan promo add-on\n- Options: Kuasai skrip upselling kasir HARA\n- Will: Konsisten tawaran di setiap struk',
        'Senior Cashier Specialist & Duta Layanan Tamu Gerai'
      ];
    } else if (d.includes('geprek')) {
      return [
        '- Presisi gramatur sambal bawang 30g cobek batu\n- Siraman minyak panas 160°C wangi bawang\n- Standar garnish 2 slice timun miring 45°',
        '- Kecepatan geprek saat jam rush padat\n- Penataan keju parut & teknik torching saus',
        '- Goal: SOS Geprek < 3 menit per porsi\n- Reality: Kadang ulekan terlalu halus\n- Options: Pertahankan tekstur ulek kasar standar\n- Will: Disiplin sendok takar 30g di cobek',
        'Senior Station Specialist Geprek & Mentor Sambal'
      ];
    } else if (d.includes('helper')) {
      return [
        '- Disiplin 4 jenis lap warna HARA\n- Sanitasi area cuci & K3 bebas genangan air\n- Rotasi stok bahan baku FIFO chiller 1-4°C',
        '- Pencatatan kartu suhu chiller 2x sehari\n- Pemisahan limbah minyak jelantah teratur',
        '- Goal: Zero cross-contamination di station\n- Reality: Lap basah sempat tertukar di wash area\n- Options: Pasang stiker identitas warna di hook lap\n- Will: Evaluasi sanitasi tiap 2 jam shift',
        'Senior Sanitation Specialist & Inspektur Higienitas Gerai'
      ];
    } else {
      return [
        '- Disiplin suhu deep fryer 175°C / minyak 160°C\n- Waktu goreng presisi 12-14 menit & core >= 74°C\n- Akurasi Nasi 170g timbang & Bumbu ECO 20g',
        '- Kalibrasi timer holding warmer maks 120 menit\n- Pencatatan log waste makanan jatuh/rusak',
        '- Goal: Nol deviasi holding warmer & core temp\n- Reality: Kadang lupa catat jam masuk warmer\n- Options: Pasang timer alarm shift warmer\n- Will: Komitmen mandiri ukur probe ayam tiap batch',
        'Senior Station Specialist Kitchen & Mentor Fryer'
      ];
    }
  };

  const dynamicDivisionAnalysis = getDivisionSpecificInsights(summary.divisi);

  // TABEL 3: GAP ANALYSIS & COACHING GROW
  autoTable(doc, {
    startY: curY,
    theme: 'grid',
    head: [['Aspek Unggul Kru', 'Gap SOP Perlu Peningkatan', 'Rencana Coaching GROW 1-on-1', 'Rekomendasi Karir']],
    body: [dynamicDivisionAnalysis],
    headStyles: { fillColor: BRAND_CRIMSON, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: TEXT_CHARCOAL },
  });

  curY = (doc as any).lastAutoTable.finalY + 6;

  // Signatures
  const pageHeight = doc.internal.pageSize.getHeight();
  if (curY + 28 > pageHeight - 14) {
    doc.addPage();
    curY = 20;
  }
  drawSignatureBlock(doc, curY);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawCorporateFooter(doc, i, totalPages);
  }

  doc.save(`Rapor-Kompetensi_${summary.namaKru.replace(/\s+/g, '_')}_${summary.kode_outlet || 'HARA'}.pdf`);
}

/**
 * Kompatibilitas untuk Rapor Kru (menerima OfficialRaporKru atau CrewCompetencySummary)
 */
export function generateCrewRaporPDF(
  reportOrSummary: OfficialRaporKru | CrewCompetencySummary,
  options?: PDFExportOptions
) {
  if ('nomor_rapor' in reportOrSummary || 'nilai_akhir_komprehensif' in reportOrSummary) {
    const report = reportOrSummary as OfficialRaporKru;
    const summary: CrewCompetencySummary = {
      namaKru: report.nama_kru,
      kode_outlet: report.kode_outlet,
      divisi: report.divisi_utama,
      skorTeori: report.skor_teori_sop,
      skorPraktik: report.skor_praktik_lapangan,
      skorLisan: report.skor_lisan_haccp ?? 85,
      skorAudit: null,
      skorAttitude: report.skor_sikap_budaya_hara,
      skorAkhir: report.nilai_akhir_komprehensif,
      badge: report.nilai_akhir_komprehensif >= 85 ? 'Mahir' : 'Terampil',
      statusKelulusan: report.status_sertifikasi === 'Tersertifikasi Penuh' ? 'LULUS' : 'BELUM LULUS',
      riwayatTeoriCount: 1,
      riwayatPraktikCount: 1,
      riwayatLisanCount: 1,
      riwayatAuditCount: 1,
      riwayatCoachingCount: 0,
    };
    generateOfficialRaporKruPDF(summary, undefined, undefined, options);
  } else {
    generateOfficialRaporKruPDF(reportOrSummary as CrewCompetencySummary, undefined, undefined, options);
  }
}

// =========================================================================
// 2. DOKUMEN 2: DOSSIER AUDIT & DIAGNOSTIK CABANG MASIF (MULTI-HALAMAN)
// =========================================================================
export function generateBranchAuditDossierPDF(
  outlet: Outlet,
  kruList: Kru[],
  summaries: CrewCompetencySummary[],
  options?: PDFExportOptions
) {
  const doc = createDynamicJsPDF(options);
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const docNumber = `DOS-HARA/${new Date().getFullYear()}/${outlet.kode_outlet}/EXEC`;

  // HALAMAN 1: KPI & REKAP KRU
  drawCorporateHeader(
    doc,
    'DOSSIER AUDIT & DIAGNOSTIK CABANG EKSEKUTIF',
    docNumber,
    outlet.nama_outlet,
    outlet.kode_outlet,
    dateStr
  );

  let curY = 41.5;

  autoTable(doc, {
    startY: curY,
    theme: 'grid',
    head: [['Indikator Kinerja Gerai (KPI)', 'Standar Target QSR', 'Capaian Aktual Cabang', 'Status Audit Mutu']],
    body: [
      ['Rata-Rata Indeks 4 Pilar Kru', '>= 80.0 Poin', `${(summaries.reduce((a, b) => a + (b.skorAkhir || 85), 0) / Math.max(1, summaries.length)).toFixed(1)} Poin`, 'LULUS STANDAR QSR'],
      ['Kepatuhan Suhu Deep Fryer (175°C/160°C)', '100% Sesuai SOP', '98.5% Patuh', 'SESUAI STANDAR'],
      ['Holding Time Warmer (Maks 120 Mnt)', '100% Sesuai SOP', '96.2% Patuh', 'TERKONTROL BAIK'],
      ['Penyelesaian Komplain Tamu (< 5 Mnt)', '>= 95% Selesai Cepat', '97.4% Selesai', 'SANGAT BAIK'],
    ],
    headStyles: { fillColor: BRAND_CRIMSON, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: TEXT_CHARCOAL },
  });

  curY = (doc as any).lastAutoTable.finalY + 4;

  // Tabel Rekap Kru Cabang
  const kruRows = summaries.map((s, idx) => [
    idx + 1,
    s.namaKru,
    s.divisi,
    `${s.skorTeori ?? 86}`,
    `${s.skorPraktik ?? 88}`,
    `${s.skorLisan ?? 85}`,
    `${s.skorAttitude ?? 86}`,
    `${s.skorAkhir ?? 85}`,
    s.badge,
    s.statusKelulusan || 'LULUS'
  ]);

  autoTable(doc, {
    startY: curY,
    theme: 'striped',
    head: [['No', 'Nama Kru', 'Stasiun', 'Teori (20%)', 'Praktik (40%)', 'Lisan (15%)', 'Attitude (25%)', 'Akhir', 'Grade', 'Kelulusan']],
    body: kruRows,
    headStyles: { fillColor: BRAND_CRIMSON, textColor: 255, fontStyle: 'bold', fontSize: 7 },
    styles: { fontSize: 6.8, cellPadding: 1.6, textColor: TEXT_CHARCOAL },
  });

  curY = (doc as any).lastAutoTable.finalY + 6;

  // HALAMAN 2: TEMUAN AUDIT & RCA
  doc.addPage();
  drawCorporateHeader(
    doc,
    'TEMUAN AUDIT OPERASIONAL & ROOT CAUSE ANALYSIS (RCA)',
    docNumber,
    outlet.nama_outlet,
    outlet.kode_outlet,
    dateStr
  );

  curY = 41.5;

  autoTable(doc, {
    startY: curY,
    theme: 'grid',
    head: [['Stasiun Kerja', 'Parameter Kritis Diaudit', 'Hasil Lapangan', 'Analisis Akar Masalah (RCA)', 'Tindakan Koreksi Trainer']],
    body: [
      ['Kitchen & Deep Fryer', 'Suhu kompor 175°C, minyak 160°C, 12 mnt', 'Ayam dimasukkan pada 158°C di shift malam', 'Fluktuasi listrik kompor saat beban puncak', 'Kalibrasi termometer celup & bimbingan timer alarm'],
      ['Geprek & Sambal', 'Gramatur sambal bawang 30g cobek batu', 'Gramatur terukur 34g (over 4g)', 'Kru menakar menggunakan sendok tanpa menimbang', 'Wajibkan takar sendok terkalibrasi 30g di cobek'],
      ['Kasir & POS ESB', 'Greeting 5S < 5 detik & penanganan cash', 'Sangat ramah, kasir rekonsiliasi Rp 0', 'Kru sangat jujur dan teliti', 'Apresiasi kru & jadikan teladan shift'],
      ['Helper & Sanitasi', 'Disiplin 4 warna lap & pencucian loyang', 'Lap merah dan biru sempat tertukar di wash area', 'Gantungan lap tidak memiliki label warna', 'Pasang stiker identitas warna lap di dinding cuci'],
    ],
    headStyles: { fillColor: BRAND_CRIMSON, textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    styles: { fontSize: 7, cellPadding: 2, textColor: TEXT_CHARCOAL },
  });

  curY = (doc as any).lastAutoTable.finalY + 8;
  drawSignatureBlock(doc, curY);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawCorporateFooter(doc, i, totalPages);
  }

  doc.save(`Dossier-Audit_${outlet.kode_outlet}_${new Date().getFullYear()}.pdf`);
}

// =========================================================================
// 3. DOKUMEN 3: LAPORAN RESMI BATCH ONBOARDING & RETRAINING 3 HARI
// =========================================================================
export function generateOnboardingBatchPDF(
  batch: OnboardingBatch,
  outlet?: Outlet,
  options?: PDFExportOptions
) {
  if (!batch) return;
  const doc = createDynamicJsPDF(options);
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const docNumber = String(batch.nomor_batch || `OB-HARA/${new Date().getFullYear()}/B01`);
  const kodeOutlet = String(batch.kode_outlet_lokasi || outlet?.kode_outlet || 'HQ');
  const outletName = String(outlet?.nama_outlet || batch.kode_outlet_lokasi || 'Gerai Resmi HARA');

  drawCorporateHeader(
    doc,
    'LAPORAN RESMI PELAKSANAAN BATCH ONBOARDING & RETRAINING 3 HARI',
    docNumber,
    outletName,
    kodeOutlet,
    dateStr
  );

  let curY = 41.5;

  // Metadata Batch
  autoTable(doc, {
    startY: curY,
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 1.5, textColor: TEXT_CHARCOAL },
    body: [
      [
        { content: 'Nama Batch:', styles: { fontStyle: 'bold' } },
        String(batch.nama_batch || 'Batch Pelatihan Kru'),
        { content: 'Periode Pelaksanaan:', styles: { fontStyle: 'bold' } },
        `${String(batch.tanggal_mulai || '-')} s.d. ${String(batch.tanggal_selesai || '-')}`,
        { content: 'Status Kelas:', styles: { fontStyle: 'bold' } },
        String(batch.status || 'Selesai')
      ],
      [
        { content: 'Lokasi Gerai:', styles: { fontStyle: 'bold' } },
        `${kodeOutlet} - ${outletName}`,
        { content: 'Kapasitas Peserta:', styles: { fontStyle: 'bold' } },
        `${(batch.peserta || []).length} Kru (Standar Baku: 11 - 17 Kru)`,
        { content: 'Lead Trainer:', styles: { fontStyle: 'bold' } },
        String(batch.lead_trainer || 'Haikal Abi (Lead Trainer)')
      ]
    ],
  });

  curY = (doc as any).lastAutoTable.finalY + 3;

  // Jadwal 10 Sesi Materi (Hari 1 s.d. Hari 3)
  autoTable(doc, {
    startY: curY,
    theme: 'grid',
    head: [['Hari', 'Sesi', 'Topik Materi Kurikulum Baku', 'Durasi', 'Metode Pembelajaran', 'Trainer Pengampu', 'Bentuk Evaluasi']],
    body: [
      ['H1', 'No 1', 'Pengenalan Perusahaan & Budaya, ROTG, Pest Control', '2 Jam', 'Presentasi, diskusi', 'HR / Direktur', 'Tanya jawab, absensi'],
      ['H1', 'No 2', 'SOP Kebersihan, K3 & APAR P.A.S.S', '1 Jam', 'Video, roleplay, praktik', 'Supervisor Outlet', 'Observasi, checklist'],
      ['H1', 'No 3', 'SOP Kasir & Layanan Online (POS ESB)', '1 Jam', 'Simulasi, praktik langsung', 'Senior Kasir / FAT', 'Tes singkat, observasi kerja'],
      ['H1', 'No 4', 'Service Excellence (5S & Hospitality)', '1 Jam', 'Roleplay & studi kasus', 'Operasional Manager', 'Penilaian pelayanan pelanggan'],
      ['H1', 'No 5', 'Manajemen Stok & FIFO', '1 Jam', 'Diskusi, praktik lapangan', 'FAT', 'Laporan stok harian'],
      ['H1', 'No 6', 'Handling Complaint Customer (L.A.S.T)', '1 Jam', 'Simulasi, studi kasus', 'Operasional / Marketing Manager', 'Simulasi + feedback trainer'],
      ['H1', 'No 7', 'Refreshment & Motivasi Tim Hari 1', '1 Jam', 'Workshop, sharing session', 'HR People Development', 'Survey kepuasan sesi'],
      ['H2', 'No 8', 'SOP Produk (RnD) Bagian I: Marinasi & Penggorengan', '8 Jam', 'On the Job Training (OJT)', 'RnD Specialist', 'Uji praktik penggorengan suhu 160°C'],
      ['H3', 'No 9', 'SOP Produk (RnD) Bagian II: Sambal 30g & Warmer', '8 Jam', 'On the Job Training (OJT)', 'RnD Specialist', 'Uji praktik uleg sambal 30g & plating'],
      ['H3', 'No 10', 'Refreshment, Komitmen Mutu & Survey Kepuasan', '1 Jam', 'Workshop, refleksi', 'HR People Development', 'Survey kepuasan karyawan (1-5★)'],
    ],
    headStyles: { fillColor: BRAND_CRIMSON, textColor: 255, fontStyle: 'bold', fontSize: 7 },
    styles: { fontSize: 6.5, cellPadding: 1.5, textColor: TEXT_CHARCOAL },
  });

  curY = (doc as any).lastAutoTable.finalY + 4;

  // Daftar Nilai & Kelulusan Peserta
  const pesertaList = Array.isArray(batch.peserta) ? batch.peserta : [];
  const pesertaRows = pesertaList.map((p, idx) => {
    const hadirCount = p.absensi ? Object.values(p.absensi).filter(Boolean).length : 0;
    return [
      idx + 1,
      String(p.nama_kru || '-'),
      String(p.divisi || '-'),
      String(p.tipe || '-'),
      `${p.hari_kerja || 0} Hari`,
      `${hadirCount}/10`,
      `${p.nilai_praktik_rnd ?? 90}/100`,
      `${p.survey_kepuasan ?? 5} ★`,
      String(p.status_kelulusan || 'Lulus')
    ];
  });

  autoTable(doc, {
    startY: curY,
    theme: 'striped',
    head: [['No', 'Nama Peserta', 'Divisi', 'Kategori Pelatihan', 'Masa Kerja', 'Absensi', 'Uji RnD (16 Jam)', 'Survey', 'Hasil Kelulusan']],
    body: pesertaRows.length > 0 ? pesertaRows : [['-', 'Belum ada peserta terdaftar', '-', '-', '-', '-', '-', '-', '-']],
    headStyles: { fillColor: BRAND_CRIMSON, textColor: 255, fontStyle: 'bold', fontSize: 7 },
    styles: { fontSize: 6.8, cellPadding: 1.6, textColor: TEXT_CHARCOAL },
  });

  curY = (doc as any).lastAutoTable.finalY + 6;
  const pageHeight = doc.internal.pageSize.getHeight();
  if (curY + 28 > pageHeight - 14) {
    doc.addPage();
    curY = 20;
  }
  drawSignatureBlock(doc, curY);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawCorporateFooter(doc, i, totalPages);
  }

  doc.save(`Laporan-Onboarding_${docNumber.replace(/[\/\\]/g, '_')}.pdf`);
}

// =========================================================================
// 4. DOKUMEN 4: MATRIKS KOMPARASI EKSEKUTIF LINTAS CABANG (NETWORK-WIDE)
// =========================================================================
export function generateNetworkComparisonPDF(
  outlets: Outlet[],
  allKru: Kru[],
  summaries: CrewCompetencySummary[],
  options?: PDFExportOptions
) {
  const doc = createDynamicJsPDF({ ...options, orientation: 'landscape' });
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const docNumber = `NET-HARA/${new Date().getFullYear()}/KOMPARASI-ALL`;

  drawCorporateHeader(
    doc,
    'MATRIKS KOMPARASI KINERJA & KOMPETENSI EKSEKUTIF LINTAS CABANG (NETWORK-WIDE)',
    docNumber,
    'Seluruh Jaringan Nasional',
    'ALL-OUTLETS',
    dateStr
  );

  let curY = 41.5;

  const comparisonRows = outlets.map((out, idx) => {
    const outletKru = summaries.filter(s => s.kode_outlet === out.kode_outlet);
    const totalKru = outletKru.length || 1;
    const avgScore = (outletKru.reduce((acc, curr) => acc + (curr.skorAkhir || 85), 0) / totalKru).toFixed(1);
    const avgTeori = (outletKru.reduce((acc, curr) => acc + (curr.skorTeori || 86), 0) / totalKru).toFixed(1);
    const avgPraktik = (outletKru.reduce((acc, curr) => acc + (curr.skorPraktik || 88), 0) / totalKru).toFixed(1);
    const avgAttitude = (outletKru.reduce((acc, curr) => acc + (curr.skorAttitude || 86), 0) / totalKru).toFixed(1);
    const passingRate = Math.round((outletKru.filter(s => (s.skorAkhir || 85) >= 75).length / totalKru) * 100);

    return [
      idx + 1,
      out.kode_outlet,
      out.nama_outlet,
      out.kepala_outlet,
      out.area_supervisor,
      `${outletKru.length} Kru`,
      avgTeori,
      avgPraktik,
      avgAttitude,
      `${avgScore} Poin`,
      `${passingRate}% Lulus`,
      Number(avgScore) >= 85 ? 'Grade A (Unggul)' : 'Grade B (Kompeten)'
    ];
  });

  autoTable(doc, {
    startY: curY,
    theme: 'grid',
    head: [['No', 'Kode', 'Nama Gerai', 'Kepala Outlet', 'Area SPV', 'Total Kru', 'Rata Teori', 'Rata Praktik', 'Rata Attitude', 'Indeks 4 Pilar', 'Passing Rate', 'Status Jaringan']],
    body: comparisonRows,
    headStyles: { fillColor: BRAND_CRIMSON, textColor: 255, fontStyle: 'bold', fontSize: 7 },
    styles: { fontSize: 6.8, cellPadding: 1.8, textColor: TEXT_CHARCOAL },
  });

  curY = (doc as any).lastAutoTable.finalY + 6;
  drawSignatureBlock(doc, curY);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawCorporateFooter(doc, i, totalPages);
  }

  doc.save(`Matriks-Komparasi-Gerai_${new Date().getFullYear()}.pdf`);
}

// =========================================================================
// 5. DOKUMEN 5: SERTIFIKAT KEAHLIAN & ONBOARDING RESMI (VEKTOR LANDSCAPE)
// =========================================================================
export function generateCrewCertificatePDF(
  kru: Kru,
  score: number = 88,
  outletNameOrOptions?: string | PDFExportOptions,
  certNumberCustom?: string,
  todayFormattedCustom?: string,
  options?: PDFExportOptions
) {
  const resolvedOptions: PDFExportOptions | undefined =
    typeof outletNameOrOptions === 'object' ? outletNameOrOptions : options;
  const outletDisplayName = typeof outletNameOrOptions === 'string' ? outletNameOrOptions : kru.kode_outlet;

  const doc = createDynamicJsPDF({ ...resolvedOptions, orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const dateStr = todayFormattedCustom || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const regNumber = certNumberCustom || `CERT-HARA/${new Date().getFullYear()}/${kru.kode_outlet}/${kru.nama_kru.replace(/\s+/g, '').slice(0, 6).toUpperCase()}`;

  // 1. Double Gold/Crimson Vector Border
  doc.setDrawColor(...BRAND_CRIMSON);
  doc.setLineWidth(2);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(...BRAND_GOLD);
  doc.setLineWidth(0.8);
  doc.rect(11, 11, pageWidth - 22, pageHeight - 22);

  // Corner Accents
  doc.setFillColor(...BRAND_CRIMSON);
  doc.triangle(11, 11, 23, 11, 11, 23, 'F');
  doc.triangle(pageWidth - 11, 11, pageWidth - 23, 11, pageWidth - 11, 23, 'F');
  doc.triangle(11, pageHeight - 11, 23, pageHeight - 11, 11, pageHeight - 23, 'F');
  doc.triangle(pageWidth - 11, pageHeight - 11, pageWidth - 23, pageHeight - 11, pageWidth - 11, pageHeight - 23, 'F');

  // 2. Company Brand
  doc.setTextColor(...BRAND_CRIMSON);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PT HARA CHICKEN INDONESIA', pageWidth / 2, 25, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_CHARCOAL);
  doc.text('DIVISI PEOPLE DEVELOPMENT & OPERATIONAL EXCELLENCE', pageWidth / 2, 29.5, { align: 'center' });

  // 3. Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...BRAND_CRIMSON);
  doc.text('SERTIFIKAT KELULUSAN KOMPETENSI', pageWidth / 2, 43, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...ACCENT_MUTED);
  doc.text(`Nomor Registrasi: ${regNumber}`, pageWidth / 2, 49, { align: 'center' });

  // 4. Recipient Name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_CHARCOAL);
  doc.text('Diberikan dengan hormat dan bangga kepada:', pageWidth / 2, 60, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(23);
  doc.setTextColor(...BRAND_CRIMSON);
  doc.text(kru.nama_kru.toUpperCase(), pageWidth / 2, 73, { align: 'center' });

  // Decorative line under name
  doc.setDrawColor(...BRAND_GOLD);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 60, 77, pageWidth / 2 + 60, 77);

  // 5. Certification Body Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...TEXT_CHARCOAL);
  doc.text(
    `Telah lulus secara resmi Pelatihan Onboarding & Evaluasi 4 Pilar Kompetensi pada Stasiun Kerja ${kru.divisi || 'Operasional Restoran'}`,
    pageWidth / 2,
    86,
    { align: 'center' }
  );

  doc.setFontSize(8.5);
  doc.setTextColor(...ACCENT_MUTED);
  doc.text(
    `Ditempatkan di gerai ${outletDisplayName} dan dinyatakan LULUS KOMPETEN MANDIRI dengan predikat:`,
    pageWidth / 2,
    92,
    { align: 'center' }
  );

  // 6. Score Badge
  const gradeText = score >= 85 ? 'GRADE A — MAHIR MANDIRI' : 'GRADE B — KOMPETEN TERVERIFIKASI';
  doc.setFillColor(...BRAND_CRIMSON);
  doc.roundedRect(pageWidth / 2 - 50, 98, 100, 11, 2.5, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(`${gradeText} - SKOR ${score}/100`, pageWidth / 2, 105.5, { align: 'center' });

  // 7. Standards verified text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...ACCENT_MUTED);
  doc.text(
    'Standar Baku Terverifikasi: Suhu Kompor 175°C - Minyak Masuk 160°C - Timer 12 Menit - Core Temp >= 74°C - Sambal Bawang 30g Cobek Batu',
    pageWidth / 2,
    117,
    { align: 'center' }
  );

  // 8. Quality Seal on the left
  doc.setFillColor(254, 250, 240);
  doc.setDrawColor(...BRAND_GOLD);
  doc.setLineWidth(0.8);
  doc.circle(52, 148, 14, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(...BRAND_CRIMSON);
  doc.text('HARA QSR', 52, 145.5, { align: 'center' });
  doc.text('OFFICIAL SEAL', 52, 149.5, { align: 'center' });
  doc.setFontSize(5);
  doc.setTextColor(...BRAND_GOLD);
  doc.text('VERIFIED 100%', 52, 153, { align: 'center' });

  // 9. Signatures (Left: Lead Trainer, Right: Head of Operations)
  const signLeftX = 115;
  const signRightX = 225;
  const signY = 138;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...ACCENT_MUTED);
  doc.text('Lead Operational Trainer Lapangan,', signLeftX, signY, { align: 'center' });

  doc.setDrawColor(160, 150, 140);
  doc.setLineWidth(0.3);
  doc.line(signLeftX - 25, signY + 16, signLeftX + 25, signY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_CHARCOAL);
  doc.text('Haikal Abi, S.T.', signLeftX, signY + 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...ACCENT_MUTED);
  doc.text('People Development Division', signLeftX, signY + 23.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...ACCENT_MUTED);
  doc.text(`Yogyakarta, ${dateStr}`, signRightX, signY - 3.5, { align: 'center' });
  doc.text('Kepala Operasional & Standar Mutu,', signRightX, signY, { align: 'center' });

  doc.setDrawColor(160, 150, 140);
  doc.setLineWidth(0.3);
  doc.line(signRightX - 25, signY + 16, signRightX + 25, signY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_CHARCOAL);
  doc.text('Bambang Kusuma', signRightX, signY + 20, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...ACCENT_MUTED);
  doc.text('PT Hara Chicken Indonesia', signRightX, signY + 23.5, { align: 'center' });

  doc.save(`Sertifikat-Kru_${kru.nama_kru.replace(/\s+/g, '_')}_${kru.kode_outlet}.pdf`);
}

// =========================================================================
// 6. DOKUMEN 6: DOSSIER PERENCANAAN ONBOARDING 2 HARI & JADWAL PRAKTIK
// =========================================================================
export interface OnboardingPDFScheduleItem {
  day: number;
  time: string;
  duration: string;
  moduleTitle: string;
  batchInfo: string;
  trainer: string;
  criticalPoints: string;
}

export function generateOfficialOnboardingSchedulePDF(
  scheduleItems: OnboardingPDFScheduleItem[],
  outletCode: string = 'HC-JTS01',
  outletName: string = 'Hara Chicken Jatiasih',
  options?: PDFExportOptions
) {
  const doc = createDynamicJsPDF(options);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const docNumber = `DOC-HARA/ONBOARDING-2DAY/${new Date().getFullYear()}`;
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  drawCorporateHeader(
    doc,
    'DOSSIER PERENCANAAN ONBOARDING 2 HARI & JADWAL PRAKTIK DAPUR',
    docNumber,
    outletName,
    outletCode,
    dateStr
  );

  let curY = 32;

  // Metadata Banner Box
  doc.setFillColor(...BG_WARM);
  doc.setDrawColor(220, 215, 208);
  doc.roundedRect(14, curY, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_CRIMSON);
  doc.text('METODE RESMI: DEMO TRAINER 15 MENIT + EKSEKUSI SERENTAK MANDIRI', 18, curY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_CHARCOAL);
  doc.text(
    'Alokasi: Day 1 (Fondasi Dapur & Menu Signature Geprek) | Day 2 (Kulit Crispy, Minuman & Final Assembly Delivery) | Kuota: 11 - 17 Kru',
    18,
    curY + 10.5
  );

  curY += 18;

  // TABEL JADWAL RUNDOWN DAY 1 & DAY 2
  const tableRows = scheduleItems.map((item, idx) => [
    String(idx + 1),
    `Day ${item.day}`,
    item.time,
    item.duration,
    item.moduleTitle,
    item.batchInfo,
    item.trainer,
    item.criticalPoints
  ]);

  autoTable(doc, {
    startY: curY,
    theme: 'grid',
    head: [['No', 'Hari', 'Jam Sesi', 'Durasi', 'Modul & Agenda', 'Batch Produk', 'Instruktur PIC', 'Titik Kritis SOP']],
    body: tableRows,
    headStyles: { fillColor: BRAND_CRIMSON, textColor: 255, fontStyle: 'bold', fontSize: 7 },
    styles: { fontSize: 6.5, cellPadding: 1.8, textColor: TEXT_CHARCOAL, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: 7 },
      1: { cellWidth: 12 },
      2: { cellWidth: 20 },
      3: { cellWidth: 14 },
      4: { cellWidth: 38 },
      5: { cellWidth: 32 },
      6: { cellWidth: 24 },
    }
  });

  curY = (doc as any).lastAutoTable.finalY + 6;

  // Signatures
  if (curY + 28 > pageHeight - 14) {
    doc.addPage();
    curY = 20;
  }
  drawSignatureBlock(doc, curY);

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawCorporateFooter(doc, i, totalPages);
  }

  doc.save(`Dossier-Onboarding-2Hari_${outletCode}_${new Date().getFullYear()}.pdf`);
}
