import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-Side Secure Supabase Client (Kredensial tersimpan di backend server - tidak terekspos ke HP)
const DEFAULT_SUPABASE_URL = 'https://bjkbvlpaaeekdqqlxavq.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_secret_QuaGsNhbpHtt7tll5GXZTg_Oozs18dW';

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY).trim();

let serverSupabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  try {
    serverSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    console.log('✅ Server-side Supabase client initialized securely.');
  } catch (err) {
    console.warn('⚠️ Server-side Supabase initialization error:', err);
  }
}

// Master users list for authentication seeding
const MASTER_STAFF_REGISTRY = [
  {
    id: 'usr-haikal',
    nama: 'Haikal Abi',
    email: 'haikal@harachicken.com',
    username: 'haikal',
    password_hash: 'hara123',
    role: 'Trainer',
    kode_outlet: 'Kantor Lempongsari',
    status_aktif: 'Aktif',
  },
  {
    id: 'usr-admin',
    nama: 'Administrator HQ',
    email: 'admin@harachicken.com',
    username: 'admin',
    password_hash: 'hara123',
    role: 'Admin',
    kode_outlet: 'Kantor Lempongsari',
    status_aktif: 'Aktif',
  },
  {
    id: 'usr-jihan',
    nama: 'Jihan',
    email: 'jihan@harachicken.com',
    username: 'jihan',
    password_hash: 'hara123',
    role: 'RnD',
    kode_outlet: 'Kantor Lempongsari',
    status_aktif: 'Aktif',
  },
  {
    id: 'usr-feri',
    nama: 'Feri',
    email: 'feri@harachicken.com',
    username: 'feri',
    password_hash: 'hara123',
    role: 'RnD',
    kode_outlet: 'Kantor Lempongsari',
    status_aktif: 'Aktif',
  },
  {
    id: 'usr-ari',
    nama: 'Ari',
    email: 'ari@harachicken.com',
    username: 'ari',
    password_hash: 'hara123',
    role: 'Trainer',
    kode_outlet: 'Kantor Lempongsari',
    status_aktif: 'Aktif',
  },
];

// Helper sanitize record server side to match Supabase table columns and prevent PGRST204 errors
function sanitizeRecordServerSide(table: string, record: any): any {
  if (!record || typeof record !== 'object') return {};
  const cleanId = String(record.id || ('rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7)));

  if (table === 'outlets') {
    return {
      id: cleanId,
      nama_outlet: record.nama_outlet || record.nama || 'Outlet HARA',
      kode_outlet: record.kode_outlet || record.kode || cleanId,
      alamat: record.alamat || '',
      kepala_outlet: record.kepala_outlet || record.manager || '',
      area_supervisor: record.area_supervisor || record.supervisor || '',
      status_aktif: record.status_aktif || 'Aktif',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  if (table === 'kru') {
    return {
      id: cleanId,
      nama_kru: record.nama_kru || record.nama || 'Kru HARA',
      kode_outlet: record.kode_outlet || record.outletCode || 'Kantor Lempongsari',
      divisi: record.divisi || 'Kitchen',
      jabatan: record.jabatan || 'Crew Store',
      status_karyawan: record.status_karyawan || 'Karyawan Baru',
      status_aktif: record.status_aktif || 'Aktif',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  if (table === 'bank_sop') {
    return {
      id: cleanId,
      kode_sop: record.kode_sop || record.kode || '',
      judul_sop: record.judul_sop || record.judul || record.nama || '',
      divisi: record.divisi || 'Kitchen',
      station: record.station || '',
      durasi_standar_detik: Number(record.durasi_standar_detik || record.stdDetik || 300),
      langkah: record.langkah || record.langkahSOP || [],
      poin_kritis: record.poin_kritis || '',
      standar_waktu: record.standar_waktu || '',
      alat_bahan: record.alat_bahan || '',
      sumber: record.sumber || 'Standar Mutu HARA HQ',
      status_aktif: record.status_aktif || 'Aktif',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  if (table === 'onboarding_batches') {
    return {
      id: cleanId,
      nomor_batch: record.nomor_batch || record.kode || '',
      nama_batch: record.nama_batch || record.nama || 'Batch Onboarding',
      tanggal_mulai: record.tanggal_mulai || record.tanggal || new Date().toISOString().split('T')[0],
      tanggal_selesai: record.tanggal_selesai || record.tanggal || new Date().toISOString().split('T')[0],
      kode_outlet_lokasi: record.kode_outlet_lokasi || record.kode_outlet || 'Kantor Lempongsari',
      status: record.status || 'Berjalan',
      kuota_min: Number(record.kuota_min || 11),
      kuota_max: Number(record.kuota_max || 17),
      peserta: Array.isArray(record.peserta) ? record.peserta : [],
      lead_trainer: record.lead_trainer || 'Haikal Abi',
      catatan_batch: record.catatan_batch || '',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  if (table === 'penilaian_praktik_onboarding_produk') {
    return {
      id: cleanId,
      tanggal: record.tanggal || new Date().toISOString().split('T')[0],
      kru_id: record.kru_id || record.kruId || '',
      nama_kru: record.nama_kru || record.namaKru || record.kru_nama || 'Peserta',
      kode_outlet: record.kode_outlet || record.outletCode || 'Kantor Lempongsari',
      nama_outlet: record.nama_outlet || record.outlet_penempatan || '',
      batch_id: record.batch_id || record.batchId || '',
      nama_batch: record.nama_batch || record.batch || '',
      divisi: record.divisi || 'Kitchen',
      produk_nama: record.produk_nama || record.productNama || record.nama_produk || 'Produk SOP',
      kode_sop: record.kode_sop || record.kode || '',
      station: record.station || '',
      station_label: record.station_label || record.station || '',
      day: record.day || 'Day 1',
      waktu_detik: Number(record.waktu_detik || record.durasi_detik || record.timerSeconds || 0),
      target_detik: Number(record.target_detik || record.targetDetik || 300),
      suhu_minyak_probe: record.suhu_minyak_probe !== undefined ? Number(record.suhu_minyak_probe) : null,
      gramatur_aktual: record.gramatur_aktual !== undefined ? Number(record.gramatur_aktual) : (record.gramaturAktual !== undefined ? Number(record.gramaturAktual) : null),
      skor_prosedur: Number(record.skor_prosedur || 0),
      skor_waktu: Number(record.skor_waktu || 0),
      skor_knowledge: Number(record.skor_knowledge !== undefined ? record.skor_knowledge : 100),
      skor_kebersihan: Number(record.skor_kebersihan || 90),
      skor_kerjasama: Number(record.skor_kerjasama || 90),
      skor_keaktifan: Number(record.skor_keaktifan || 90),
      skor_ketepatan: Number(record.skor_ketepatan || 90),
      subskor_teknis: Number(record.subskor_teknis || 0),
      subskor_sikap: Number(record.subskor_sikap || 0),
      skor_akhir: Number(record.skor_akhir || 0),
      status_kelulusan: record.status_kelulusan || record.status || 'Kompeten',
      status: record.status || record.status_kelulusan || 'Kompeten',
      gagal_titik_kritis: Boolean(record.gagal_titik_kritis),
      titik_kritis_gagal_detail: Array.isArray(record.titik_kritis_gagal_detail) ? record.titik_kritis_gagal_detail : [],
      knowledge_questions: record.knowledge_questions || null,
      checklist_langkah: Array.isArray(record.checklist_langkah) ? record.checklist_langkah : (record.stepChecklist || []),
      penilai_nama: record.penilai_nama || record.trainer_nama || 'Trainer HARA',
      catatan: record.catatan || record.catatanTrainer || '',
      catatan_trainer: record.catatan_trainer || record.catatan || '',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  if (table === 'penilaian_sikap_kebersihan_kru') {
    return {
      id: cleanId,
      tanggal: record.tanggal || new Date().toISOString().split('T')[0],
      kru_id: record.kru_id || record.kruId || '',
      nama_kru: record.nama_kru || record.namaKru || 'Peserta',
      kode_outlet: record.kode_outlet || record.outletCode || '',
      nama_outlet: record.nama_outlet || '',
      batch_id: record.batch_id || record.batchId || '',
      shift: record.shift || 'Shift 1',
      skor_grooming: Number(record.skor_grooming || 90),
      skor_resik: Number(record.skor_resik || 90),
      skor_attitude: Number(record.skor_attitude || 90),
      skor_disiplin: Number(record.skor_disiplin || 90),
      skor_total: Number(record.skor_total || 90),
      status_kelulusan: record.status_kelulusan || 'Sangat Baik',
      checklist_detail: record.checklist_detail || [],
      catatan: record.catatan || '',
      penilai_nama: record.penilai_nama || 'Trainer',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  if (table === 'penilaian_jobdesk_stasiun') {
    return {
      id: cleanId,
      tanggal: record.tanggal || new Date().toISOString().split('T')[0],
      kru_id: record.kru_id || record.kruId || '',
      nama_kru: record.nama_kru || record.namaKru || 'Peserta',
      kode_outlet: record.kode_outlet || record.outletCode || '',
      nama_outlet: record.nama_outlet || '',
      station: record.station || 'Station 1',
      shift: record.shift || 'Shift 1',
      skor_total: Number(record.skor_total || 90),
      status_kelulusan: record.status_kelulusan || 'Sangat Baik',
      checklist_detail: record.checklist_detail || [],
      catatan: record.catatan || '',
      penilai_nama: record.penilai_nama || 'Trainer',
      created_at: record.created_at || new Date().toISOString(),
    };
  }

  if (table === 'app_users') {
    return {
      id: cleanId,
      nama: record.nama || 'Pengguna HARA',
      email: record.email || '',
      username: record.username || '',
      password_hash: record.password_hash || record.password || 'hara123',
      role: record.role || 'Trainer',
      kode_outlet: record.kode_outlet || 'Kantor Lempongsari',
      status_aktif: record.status_aktif !== false,
      created_at: record.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return { id: cleanId, ...record };
}

// Seed Supabase master data on server startup if missing WITHOUT overwriting existing passwords
async function seedSupabaseMasterDataIfEmpty() {
  if (!serverSupabase) return;
  try {
    // 1. Check existing users in Supabase to NEVER overwrite existing passwords
    const { data: existingUsers, error: fetchErr } = await serverSupabase
      .from('app_users')
      .select('id, email, username');

    const existingIds = new Set((existingUsers || []).map((u: any) => String(u.id || '').toLowerCase()));
    const existingEmails = new Set((existingUsers || []).map((u: any) => String(u.email || '').toLowerCase()));

    for (const u of MASTER_STAFF_REGISTRY) {
      if (existingIds.has(u.id.toLowerCase()) || existingEmails.has(u.email.toLowerCase())) {
        continue; // NEVER overwrite existing user's password!
      }
      try {
        await serverSupabase.from('app_users').insert({
          id: u.id,
          nama: u.nama,
          email: u.email,
          username: u.username,
          password_hash: u.password_hash,
          role: u.role,
          kode_outlet: u.kode_outlet,
          status_aktif: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (uErr) {
        // Table might not exist or schema difference
      }
    }

    // 2. Fetch live users from Supabase to sync into app_store
    const { data: liveUsers } = await serverSupabase.from('app_users').select('*');
    const store = readServerStore();
    if (Array.isArray(liveUsers) && liveUsers.length > 0) {
      store['app_users'] = liveUsers;
      writeServerStore(store);
      try {
        await serverSupabase.from('app_store').upsert({
          key: 'app_users',
          value: liveUsers,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });
      } catch {}
    }

    console.log('✅ Supabase master data verified without overwriting existing passwords.');
  } catch (err) {
    console.warn('⚠️ Seeding Supabase master data warning:', err);
  }
}

// Trigger initial seed
seedSupabaseMasterDataIfEmpty().catch(() => {});

// Server Persistent Local Data Cache File Helper
const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'server_store.json');

function readServerStore(): Record<string, any[]> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Error reading server store:', err);
  }
  return {};
}

function writeServerStore(data: Record<string, any[]>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error writing server store:', err);
  }
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for generating content with resilient model list and instant domain fallback
async function generateAdvisorContent(prompt: string, contextData?: string): Promise<string> {
  const systemInstruction = `Anda adalah "Hara Trainer AI Advisor" - Konsultan Ahli Trainer Operasional & Pelatihan Lapangan Restoran Cepat Saji (F&B) untuk Hara Chicken (Spesialis Ayam Goreng Krispi & Geprek Multi-Outlet).
Tugas Anda:
1. Memberikan rekomendasi coaching GROW (Goal, Reality, Options, Will) yang praktis, aplikatif di level kitchen, kasir, helper, dan geprek.
2. Menganalisis temuan evaluasi lapangan, Gap Analysis, dan kartu keluhan pelanggan untuk memberikan solusi pelatihan kerja yang tepat sasaran.
3. Menuliskan panduan standar SOP, tips mengatasi kendala lapangan, atau menyusun materi bimbingan kru.
4. Gunakan bahasa Indonesia profesional, tegas, ramah, dan solutif ala Lead Trainer Operasional Lapangan. Gunakan bullet points atau penomoran rapi.`;

  const contents = contextData
    ? `[DATA OPERASIONAL HARA CHICKEN]\n${contextData}\n\n[PERMINTAAN USER]\n${prompt}`
    : prompt;

  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'];

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} unavailable (status ${err?.status || err?.code || 'unknown'}). Trying next fallback...`);
    }
  }

  // Fallback domain response generator if models are experiencing temporary demand spikes
  return generateDomainAdvisorFallback(prompt);
}

function generateDomainAdvisorFallback(prompt: string): string {
  const pLower = prompt.toLowerCase();

  if (pLower.includes('grow') || pLower.includes('coaching')) {
    return `### 📋 Rekomendasi Skenario Coaching GROW (Trainer Operasional Hara Chicken)

**1. Goal (Tujuan):**
* Menyelaraskan target kru dengan standar operasional restoran (kecepatan saji, kepatuhan gramasi bumbu, dan keramahan pelayanan).
* Kru memahami ekspektasi pencapaian skor audit minimal 85% pada evaluasi berikutnya.

**2. Reality (Kondisi Saat Ini):**
* Evaluasi kesenjangan antara SOP riil di outlet dengan praktik yang dilakukan (misal: suhu minyak turun akibat batch terlalu padat, atau kelalaian ucapan greeting/upselling).
* Validasi penyebab utama bersama kru (apakah faktor teknis alat, kelelahan jam sibuk, atau kurangnya pemahaman materi).

**3. Options (Pilihan Solusi):**
* **Opsi A:** Pendampingan (Shadowing) langsung oleh Senior Cook / Head of Outlet selama 3 shift operasional.
* **Opsi B:** Refreshment modul micro-learning 15 menit sebelum open store (fokus pada titik kritis SOP).
* **Opsi C:** Penyediaan visual checklist / reminder board di area kerja terkait.

**4. Will / Way Forward (Komitmen Tindakan):**
* Kru menandatangani lembar komitmen GROW perbaikan mandiri dalam 7 hari kalender.
* Jadwal re-evaluasi uji praktik lapangan dilakukan pada shift pekan depan.`;
  }

  if (pLower.includes('tna') || pLower.includes('gap') || pLower.includes('kurikulum') || pLower.includes('training')) {
    return `### 🎯 Rencana Intervensi Pelatihan (TNA & Gap Remediasi)

**Analisis Temuan Kesenjangan:**
* Teridentifikasi kebutuhan standardisasi proses kerja kru outlet untuk menjaga konsistensi rasa, higienitas, dan kecepatan pelayanan di jam operasional sibuk.

**Struktur Kurikulum Rekomendasi 4 Pilar Terpadu:**
1. **Pilar 1 — Uji Teori SOP & HOTS (20%):**
   * Pemahaman suhu penyimpanan (chiller 0-4°C, freezer -18°C), HACCP, dan 5S area dapur.
2. **Pilar 2 — Uji Praktik & Speed of Service / SOS (40%):**
   * Teknik penepungan 'fluffy-crisp' tanpa pemadatan berlebih.
   * Kontrol suhu deep fryer 160°C (kompor 175°C) selama 12 menit tepat, core temp >= 74°C, dan holding warmer maks 120 menit (60°C–70°C).
   * Standarisasi gramatur Sambal Bawang 30 gram (#BeneranDiGeprek).
3. **Pilar 3 — Uji Lisan & Nalar Kritis HACCP (15%):**
   * Critical control point, respon krisis kontaminasi silang, dan "Why Behind SOP".
4. **Pilar 4 — Sikap Budaya H.A.R.A (12 Perilaku Utama) & Psikometri SJT (25%):**
   * Penerapan 12 Perilaku Utama resmi H.A.R.A (Halal, Amanah, Responsif, Adaptif) dan integritas closing kasir POS Rp 0.

**Metrik Keberhasilan:**
* Kenaikan skor post-test kru ≥ 75% (Target Grade A ≥ 85) dan penurunan kartu komplain pelanggan terkait kecepatan/kualitas menu di outlet terkait.`;
  }

  return `### 🍗 Rekomendasi Trainer Operasional Hara Chicken

Terkait topik **"${prompt}"**, berikut panduan operasional terstandarisasi untuk tim outlet:

1. **Standarisasi Prosedur Kerja Baku:**
   * Pastikan setiap kru mematuhi lembar panduan SOP baku terkini: Deep Fryer 160°C selama 12 menit, Core Temp ≥ 74°C, Holding Warmer maks 120 menit (60-70°C), dan Sambal Bawang 30g.
   * Lakukan briefing 5 menit sebelum shift untuk mengonfirmasi pemahaman titik kendali kritis (CCP).

2. **Evaluasi Berkala 4 Pilar Terpadu:**
   * Lakukan pengujian berkala melalui 4 pilar uji resmi: Teori SOP (20%), Praktik SOS (40%), Lisan HACCP (15%), dan Sikap Budaya H.A.R.A (25%).
   * Kru dengan skor < 75 otomatis dijadwalkan TNA dan bimbingan 1-on-1 bersama Area Trainer.

3. **Tindak Lanjut Perbaikan Berkelanjutan:**
   * Catat setiap anomali ke dalam Modul Observasi Lapangan & TNA untuk pemetaan tren performa outlet secara menyeluruh.`;
}

// POST /api/gemini/advisor
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { prompt, contextData } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const text = await generateAdvisorContent(prompt, contextData);
    res.json({ text });
  } catch (err: any) {
    console.error('Server Gemini Advisor Error:', err);
    res.json({
      text: generateDomainAdvisorFallback(req.body.prompt || 'Konsultasi Pelatihan'),
    });
  }
});

// POST /api/gemini/training-plan
app.post('/api/gemini/training-plan', async (req, res) => {
  const { tnaDescription, divisi, kodeOutlet } = req.body || {};
  const prompt = `Berdasarkan temuan TNA berikut di Outlet ${kodeOutlet || 'Semua'} untuk divisi ${divisi || 'Operasional'}:
"${tnaDescription || 'Kesenjangan standar operasional'}"

Buatkan rencana training terstruktur dengan format JSON valid persis seperti ini:
{
  "topik": "Judul Training Singkat & Menarik",
  "tujuan": "Tujuan pembelajaran spesifik (SMART)",
  "metode": "Demonstrasi Praktik / Roleplay / Simulasi",
  "durasi": "90 Menit",
  "alatBantu": "Alat bantu yang dibutuhkan",
  "rencanaLangkah": ["Langkah 1", "Langkah 2", "Langkah 3", "Langkah 4"]
}`;

  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.7-flash'];

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return res.json(parsed);
      }
    } catch (err: any) {
      console.warn(`Model ${model} training plan unavailable (status ${err?.status || err?.code || 'unknown'}). Trying next fallback...`);
    }
  }

  // Graceful fallback plan
  res.json({
    topik: `Pelatihan Standarisasi ${divisi || 'Operasional'} (${kodeOutlet || 'Semua Outlet'})`,
    tujuan: `Mengatasi gap: ${(tnaDescription || 'Kesesuaian standar operasional F&B').slice(0, 80)}...`,
    metode: 'Demonstrasi Praktik & Evaluasi Langsung',
    durasi: '90 Menit',
    alatBantu: 'Checklist SOP, Timer, Alat Masak & Bahan Praktik',
    rencanaLangkah: [
      'Briefing tujuan dan review materi titik kritis SOP',
      'Demonstrasi langsung oleh Lead Trainer / PIC Outlet',
      'Praktik mandiri berulang oleh kru yang dinilai',
      'Evaluasi rubrik skor 3 pilar dan komitmen GROW',
    ],
  });
});

// =========================================================================
// SECURE BACKEND DATABASE & CLOUD SYNC ENDPOINTS
// Seluruh handphone/klien berkomunikasi lewat endpoint ini tanpa membocorkan connection string
// =========================================================================

const DEFAULT_GOOGLE_SHEETS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyOdNACeBvN7gDxGPV0THoUDyYxTbr9CYm7aI8BtRAd4dV_Dz0gFmV4fjoEJDjkWWfPFg/exec';

async function relayToGoogleSheetsWebhook(table: string, records: any[], targetWebhookUrl: string) {
  if (!targetWebhookUrl || !targetWebhookUrl.startsWith('http')) return;
  for (const item of records) {
    if (!item) continue;
    try {
      const payload = {
        event: 'AUTO_RELAY_SYNC',
        action: table === 'penilaian_praktik_onboarding_produk' ? 'ADD_PENILAIAN' : `SYNC_${table.toUpperCase()}`,
        table,
        timestamp: new Date().toISOString(),
        payload: item,
        ...item,
      };
      await fetch(targetWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
    } catch (relayErr) {
      console.warn(`[Google Sheets Relay] Failed to send to webhook for ${table}:`, relayErr);
    }
  }
}

// 1. Status Koneksi Backend Cloud
app.get('/api/db/status', (_req, res) => {
  const store = readServerStore();
  const sheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL || (store as any)._google_sheet_webhook || DEFAULT_GOOGLE_SHEETS_WEBHOOK;
  return res.json({
    ok: true,
    online: true,
    supabaseConfigured: !!serverSupabase,
    supabaseUrlConfigured: Boolean(supabaseUrl),
    googleSheetsWebhookUrl: sheetsWebhook,
    timestamp: new Date().toISOString()
  });
});

// 2. Autentikasi Login Resmi Backend Langsung ke Supabase (Tanpa Ekspos Kunci Rahasia)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/username dan kata sandi wajib diisi.' });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const inputPass = String(password).trim();
    let userFound: any = null;

    // 1. Cek di Supabase jika client aktif
    if (serverSupabase) {
      try {
        const { data, error } = await serverSupabase
          .from('app_users')
          .select('*')
          .or(`email.ilike.${cleanId},username.ilike.${cleanId}`)
          .limit(1);

        if (!error && data && data.length > 0) {
          userFound = data[0];
          // User ditemukan langsung di Supabase: verifikasi kata sandi secara mutlak
          const validPass = String(userFound.password_hash || userFound.password || '').trim();
          if (inputPass !== validPass) {
            return res.status(401).json({
              success: false,
              message: 'Kata sandi tidak sesuai dengan database Supabase.',
            });
          }
        }
      } catch (err) {
        console.warn('Supabase query app_users error:', err);
      }
    }

    // 2. Fallback hanya jika Supabase offline atau pengguna belum ada di cloud
    if (!userFound) {
      const store = readServerStore();
      const localUsers = store['app_users'] || [];
      userFound = localUsers.find(
        (u: any) =>
          (u.email && u.email.toLowerCase() === cleanId) ||
          (u.username && u.username.toLowerCase() === cleanId)
      );
    }

    if (!userFound) {
      userFound = MASTER_STAFF_REGISTRY.find(
        (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
      );
    }

    if (!userFound) {
      return res.status(401).json({ success: false, message: 'Akun dengan email/username tersebut tidak ditemukan.' });
    }

    const validPass = String(userFound.password_hash || userFound.password || 'hara123').trim();
    if (inputPass !== validPass) {
      return res.status(401).json({ success: false, message: 'Kata sandi tidak cocok. Silakan coba kembali.' });
    }

    // Update last_login
    const nowIso = new Date().toISOString();
    if (serverSupabase) {
      try {
        await serverSupabase
          .from('app_users')
          .update({ last_login: nowIso, updated_at: nowIso })
          .eq('id', userFound.id);

        await serverSupabase.from('log_aktivitas').insert({
          id: 'log-' + Date.now(),
          tipe: 'LOGIN',
          modul: 'Autentikasi',
          deskripsi: `Pengguna ${userFound.nama} (${userFound.role}) berhasil login via Supabase Backend.`,
          user_nama: userFound.nama,
          created_at: nowIso,
        });
      } catch {}
    }

    const safeUser = {
      id: userFound.id,
      nama: userFound.nama,
      email: userFound.email,
      role: userFound.role,
      kode_outlet: userFound.kode_outlet || 'Kantor Lempongsari',
      status_aktif: 'Aktif',
      created_at: userFound.created_at || nowIso,
    };

    return res.json({
      success: true,
      message: 'Login berhasil.',
      user: safeUser,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Gagal autentikasi via server.' });
  }
});

// 3. Ubah Kata Sandi Pengguna Resmi via Backend
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { identifier, oldPass, newPass } = req.body || {};
    if (!identifier || !oldPass || !newPass) {
      return res.status(400).json({ success: false, message: 'Semua kolom wajib diisi.' });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanOld = String(oldPass).trim();
    const cleanNew = String(newPass).trim();

    if (cleanNew.length < 6) {
      return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 6 karakter.' });
    }

    let userFound: any = null;
    if (serverSupabase) {
      try {
        const { data } = await serverSupabase
          .from('app_users')
          .select('*')
          .or(`email.ilike.${cleanId},username.ilike.${cleanId}`)
          .limit(1);
        if (data && data.length > 0) userFound = data[0];
      } catch {}
    }

    const store = readServerStore();
    if (!userFound) {
      const localUsers = store['app_users'] || [];
      userFound = localUsers.find(
        (u: any) =>
          (u.email && u.email.toLowerCase() === cleanId) ||
          (u.username && u.username.toLowerCase() === cleanId)
      );
    }

    if (!userFound) {
      userFound = MASTER_STAFF_REGISTRY.find(
        (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
      );
    }

    if (!userFound) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const currentPass = userFound.password_hash || 'hara123';
    if (cleanOld !== currentPass) {
      return res.status(401).json({ success: false, message: 'Kata sandi lama tidak cocok.' });
    }

    const nowIso = new Date().toISOString();
    // Update di Supabase
    if (serverSupabase) {
      try {
        await serverSupabase
          .from('app_users')
          .update({ password_hash: cleanNew, updated_at: nowIso })
          .eq('id', userFound.id);

        await serverSupabase.from('log_aktivitas').insert({
          id: 'log-' + Date.now(),
          tipe: 'UBAH',
          modul: 'Keamanan',
          deskripsi: `Kata sandi akun ${userFound.nama} berhasil diperbarui di Supabase.`,
          user_nama: userFound.nama,
          created_at: nowIso,
        });
      } catch {}
    }

    // Update di Server store
    if (!store['app_users']) store['app_users'] = [];
    const idx = store['app_users'].findIndex((u: any) => u.id === userFound.id);
    if (idx >= 0) {
      store['app_users'][idx].password_hash = cleanNew;
      store['app_users'][idx].updated_at = nowIso;
    } else {
      store['app_users'].push({ ...userFound, password_hash: cleanNew, updated_at: nowIso });
    }
    writeServerStore(store);

    return res.json({ success: true, message: 'Kata sandi berhasil diperbarui.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Gagal mengubah kata sandi.' });
  }
});

// 4. Init Master Data Saat Perangkat Baru Membuka Web (Anti Bocor Kunci Rahasia)
app.get('/api/db/init', async (_req, res) => {
  try {
    const store = readServerStore();

    // Jika Supabase terhubung, tarik data cloud terbaru
    if (serverSupabase) {
      const tablesToFetch = [
        'app_users',
        'outlets',
        'kru',
        'onboarding_batches',
        'penilaian_praktik_onboarding_produk',
        'attitude_hara',
        'penilaian_jobdesk_stasiun',
        'penilaian_sikap_kebersihan_kru',
        'bank_sop',
        'hasil_ujian_mingguan',
      ];

      for (const table of tablesToFetch) {
        try {
          const { data, error } = await serverSupabase.from(table).select('*').limit(500);
          if (!error && Array.isArray(data) && data.length > 0) {
            store[table] = data;
          }
        } catch {
          // Table mungkin belum dibuat, gunakan fallback store
        }
      }

      try {
        const { data: appData, error: appErr } = await serverSupabase.from('app_store').select('*');
        if (!appErr && Array.isArray(appData)) {
          for (const row of appData) {
            if (row.key && row.value) {
              const cleanKey = row.key.replace('sync_', '');
              if (!store[cleanKey] || store[cleanKey].length === 0) {
                store[cleanKey] = row.value;
              }
            }
          }
        }
      } catch {
        // ignore
      }
    }

    const sheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL || (store as any)._google_sheet_webhook || DEFAULT_GOOGLE_SHEETS_WEBHOOK;

    // AMAN: Jangan pernah kirimkan service_role / sb_secret key ke browser klien
    return res.json({
      success: true,
      data: store,
      supabaseConfig: null, // Rahasia aman di backend
      supabaseConnected: !!serverSupabase,
      googleSheetsWebhookUrl: sheetsWebhook,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Gagal memuat data dari server' });
  }
});

// Endpoint untuk menyimpan kredensial Supabase & Webhook Google Sheets terpusat dari admin
app.post('/api/db/config', (req, res) => {
  try {
    const { url, anonKey, googleSheetsWebhookUrl, webhookUrl } = req.body;
    const store = readServerStore();
    if (url || anonKey) {
      (store as any)._supabase_config = { url, anonKey };
    }
    const targetWebhook = googleSheetsWebhookUrl || webhookUrl;
    if (targetWebhook) {
      (store as any)._google_sheet_webhook = targetWebhook.trim();
    }
    writeServerStore(store);
    return res.json({
      success: true,
      message: 'Konfigurasi Supabase & Webhook Google Sheets berhasil disimpan di server.',
      googleSheetsWebhookUrl: (store as any)._google_sheet_webhook || DEFAULT_GOOGLE_SHEETS_WEBHOOK,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// 3. Simpan dan Perbarui Data ke Server & Supabase
app.post('/api/db/sync', async (req, res) => {
  try {
    const { table, records, record, action } = req.body;
    if (!table) {
      return res.status(400).json({ success: false, message: 'Nama tabel wajib diisi.' });
    }

    const currentStore = readServerStore();
    if (!currentStore[table]) {
      currentStore[table] = [];
    }

    const incomingRecords: any[] = records || (record ? [record] : []);

    if (action === 'DELETE') {
      const idsToDelete = new Set(incomingRecords.map((r: any) => r.id).filter(Boolean));
      currentStore[table] = currentStore[table].filter((r: any) => !idsToDelete.has(r.id));

      if (serverSupabase) {
        for (const id of idsToDelete) {
          try {
            await serverSupabase.from(table).delete().eq('id', id);
          } catch {
            // fallback
          }
        }
        try {
          await serverSupabase.from('app_store').upsert({
            key: table,
            value: currentStore[table],
            updated_at: new Date().toISOString(),
          }, { onConflict: 'key' });
        } catch {}
      }
    } else {
      // Upsert
      for (const inc of incomingRecords) {
        if (!inc || !inc.id) continue;
        const idx = currentStore[table].findIndex((r: any) => r.id === inc.id);
        if (idx >= 0) {
          currentStore[table][idx] = { ...currentStore[table][idx], ...inc };
        } else {
          currentStore[table].unshift(inc);
        }
      }

      if (serverSupabase) {
        // 1. Simpan array utuh ke app_store dengan key: table dan sync_table
        try {
          await serverSupabase.from('app_store').upsert({
            key: table,
            value: currentStore[table],
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        } catch {}

        try {
          await serverSupabase.from('app_store').upsert({
            key: `sync_${table}`,
            value: currentStore[table],
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        } catch {}

        // 2. Sanitasi dan upsert ke tabel PostgreSQL terstruktur
        for (const rec of incomingRecords) {
          if (!rec) continue;
          const sanitized = sanitizeRecordServerSide(table, rec);
          try {
            await serverSupabase.from(table).upsert(sanitized, { onConflict: 'id' });
          } catch (upsertErr) {
            // Fallback jika ada schema cache mismatch
          }
        }
      }
      // Auto Relay ke Google Sheets Webhook saat ada penilaian, kru, atau batch baru
      if (['penilaian_praktik_onboarding_produk', 'kru', 'onboarding_batches'].includes(table)) {
        const webhookUrl =
          process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
          (currentStore as any)._google_sheet_webhook ||
          DEFAULT_GOOGLE_SHEETS_WEBHOOK;
        relayToGoogleSheetsWebhook(table, incomingRecords, webhookUrl).catch(() => {});
      }
    }

    writeServerStore(currentStore);
    return res.json({
      success: true,
      count: currentStore[table].length,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Gagal menyimpan data via server' });
  }
});

// 4. Server Proxy untuk Google Spreadsheet Webhook (Mencegah Kebocoran Script & Hambatan CORS)
app.post('/api/sync/spreadsheet', async (req, res) => {
  try {
    const { payload, webhookUrl } = req.body;
    const store = readServerStore();
    const targetUrl =
      process.env.GOOGLE_SHEETS_WEBHOOK_URL ||
      webhookUrl ||
      (store as any)._google_sheet_webhook ||
      DEFAULT_GOOGLE_SHEETS_WEBHOOK;

    if (!targetUrl || !targetUrl.startsWith('https://script.google.com/')) {
      return res.status(400).json({
        success: false,
        message: 'URL Webhook Google Sheets belum diatur atau tidak valid.'
      });
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    return res.json({
      success: true,
      status: response.status,
      message: 'Data berhasil dikirim ke Google Spreadsheet via Server Proxy.'
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err?.message || 'Gagal mengirim ke Google Spreadsheet via server.'
    });
  }
});

// Health checks for Cloud Run & container orchestration
app.get(['/healthz', '/_health', '/api/health'], (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Serve frontend in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('HARA Chicken Trainer & Ops starting up...');
  }
});

const portNumber = Number(PORT) || 3000;
app.listen(portNumber, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${portNumber}`);
});

