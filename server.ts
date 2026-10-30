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

// Server-Side Secure Supabase Client (Kredensial disimpan aman di Environment Server, tidak terekspos ke HP)
const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

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

// 1. Status Koneksi Backend Cloud
app.get('/api/db/status', (_req, res) => {
  return res.json({
    ok: true,
    online: true,
    supabaseConfigured: !!serverSupabase,
    supabaseUrlConfigured: Boolean(supabaseUrl),
    timestamp: new Date().toISOString()
  });
});

// 2. Init Master Data Saat Perangkat Baru Membuka Web
app.get('/api/db/init', async (_req, res) => {
  try {
    const store = readServerStore();

    // Jika Supabase terhubung, sinkronkan data cloud terbaru
    if (serverSupabase) {
      const tablesToFetch = [
        'onboarding_batches',
        'penilaian_praktik_onboarding_produk',
        'attitude_hara',
        'penilaian_jobdesk_stasiun',
        'penilaian_sikap_kebersihan_kru',
        'bank_sop_products'
      ];

      for (const table of tablesToFetch) {
        try {
          const { data, error } = await serverSupabase.from(table).select('*').limit(500);
          if (!error && Array.isArray(data) && data.length > 0) {
            store[table] = data;
          }
        } catch {
          // Table belum dibuat di Supabase, gunakan store lokal
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

    return res.json({
      success: true,
      data: store,
      supabaseConnected: !!serverSupabase,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Gagal memuat data dari server' });
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
        try {
          await serverSupabase.from(table).upsert(incomingRecords);
        } catch {
          try {
            await serverSupabase.from('app_store').upsert({
              key: `sync_${table}`,
              value: currentStore[table],
              updated_at: new Date().toISOString()
            });
          } catch {
            // ignore
          }
        }
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
    const targetUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || webhookUrl;

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

