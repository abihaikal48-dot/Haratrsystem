import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const DEFAULT_SUPABASE_URL = 'https://bjkbvlpaaeekdqqlxavq.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_secret_QuaGsNhbpHtt7tll5GXZTg_Oozs18dW';

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY).trim();

let devSupabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
  try {
    devSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    console.log('✅ Vite Dev Supabase initialized.');
  } catch (err) {
    console.warn('⚠️ Dev Supabase init error:', err);
  }
}

const MASTER_STAFF_REGISTRY = [
  { id: 'usr-haikal', nama: 'Haikal Abi', email: 'haikal@harachicken.com', username: 'haikal', password_hash: 'hara123', role: 'Trainer', kode_outlet: 'Kantor Lempongsari', status_aktif: 'Aktif' },
  { id: 'usr-admin', nama: 'Administrator HQ', email: 'admin@harachicken.com', username: 'admin', password_hash: 'hara123', role: 'Admin', kode_outlet: 'Kantor Lempongsari', status_aktif: 'Aktif' },
  { id: 'usr-jihan', nama: 'Jihan', email: 'jihan@harachicken.com', username: 'jihan', password_hash: 'hara123', role: 'RnD', kode_outlet: 'Kantor Lempongsari', status_aktif: 'Aktif' },
  { id: 'usr-feri', nama: 'Feri', email: 'feri@harachicken.com', username: 'feri', password_hash: 'hara123', role: 'RnD', kode_outlet: 'Kantor Lempongsari', status_aktif: 'Aktif' },
  { id: 'usr-ari', nama: 'Ari', email: 'ari@harachicken.com', username: 'ari', password_hash: 'hara123', role: 'Trainer', kode_outlet: 'Kantor Lempongsari', status_aktif: 'Aktif' },
];

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'server_store.json');

function readDevStore(): Record<string, any[]> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    }
  } catch (err) {
    console.warn('Error reading dev store:', err);
  }
  return {};
}

function writeDevStore(data: Record<string, any[]>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error writing dev store:', err);
  }
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

**Struktur Kurikulum Rekomendasi:**
1. **Pilar 1 - Standar SOP & Sanitasi (Teori 30%):**
   * Pemahaman suhu penyimpanan bahan baku (chiller 0-4°C, freezer -18°C).
   * Penanganan silang (cross-contamination) dan 5S area dapur.
2. **Pilar 2 - Eksekusi Teknis & Gramasi (Praktik 40%):**
   * Teknik penepungan 'fluffy-crisp' tanpa pemadatan berlebih.
   * Kontrol suhu deep fryer 165°C-170°C dengan timer digital akurat.
3. **Pilar 3 - Komunikasi & Hospitality (Lisan 30%):**
   * Standar greeting 3S (Senyum, Salam, Sapa) dan teknik upselling menu bundling.

**Metrik Keberhasilan:**
* Kenaikan skor post-test kru ≥ 85% dan penurunan kartu komplain pelanggan terkait kecepatan/kualitas menu di outlet terkait.`;
  }

  return `### 🍗 Rekomendasi Trainer Operasional Hara Chicken

Terkait topik **"${prompt}"**, berikut panduan operasional terstandarisasi untuk tim outlet:

1. **Standarisasi Prosedur Kerja:**
   * Pastikan setiap kru mematuhi lembar panduan SOP terkini yang telah disahkan divisi Training.
   * Lakukan briefing 5 menit sebelum shift untuk mengonfirmasi pemahaman titik kendali kritis (CCP).

2. **Evaluasi Berkala 3 Pilar:**
   * Lakukan pengujian berkala melalui 3 pilar uji (Uji Teori, Uji Praktik Lapangan, dan Uji Lisan Prosedur).
   * Kru dengan predikat Pemula wajib dijadwalkan retraining bersama Area Trainer.

3. **Tindak Lanjut Perbaikan Berkelanjutan:**
   * Catat setiap anomali ke dalam Modul Observasi Lapangan & TNA untuk pemetaan tren performa outlet secara menyeluruh.`;
}

function geminiApiDevPlugin(): Plugin {
  return {
    name: 'gemini-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Enable CORS for multi-device (mobile/desktop) testing
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        const urlPath = (req.url || '').split('?')[0].replace(/\/+$/, '');

        // Handle DB and Sync Endpoints
        if (urlPath === '/api/db/status' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true, online: true, supabaseConfigured: !!devSupabase, timestamp: new Date().toISOString() }));
          return;
        }

        if (urlPath === '/api/db/init' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          const store = readDevStore();
          if (devSupabase) {
            const tablesToFetch = [
              'onboarding_batches',
              'penilaian_praktik_onboarding_produk',
              'attitude_hara',
              'penilaian_jobdesk_stasiun',
              'penilaian_sikap_kebersihan_kru',
              'kru',
              'outlets',
              'bank_sop',
              'hasil_ujian_mingguan',
            ];
            for (const table of tablesToFetch) {
              try {
                const { data, error } = await devSupabase.from(table).select('*').limit(500);
                if (!error && Array.isArray(data) && data.length > 0) {
                  store[table] = data;
                }
              } catch {}
            }
            try {
              const { data: appData } = await devSupabase.from('app_store').select('*');
              if (Array.isArray(appData)) {
                for (const row of appData) {
                  if (row.key && row.value) {
                    const cleanKey = row.key.replace('sync_', '');
                    if (!store[cleanKey] || store[cleanKey].length === 0) {
                      store[cleanKey] = row.value;
                    }
                  }
                }
              }
            } catch {}
          }
          const sheetsWebhook = process.env.GOOGLE_SHEETS_WEBHOOK_URL || (store as any)._google_sheet_webhook || 'https://script.google.com/macros/s/AKfycbyOdNACeBvN7gDxGPV0THoUDyYxTbr9CYm7aI8BtRAd4dV_Dz0gFmV4fjoEJDjkWWfPFg/exec';

          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            data: store,
            supabaseConfig: null, // Rahasia aman di backend
            supabaseConnected: !!devSupabase,
            googleSheetsWebhookUrl: sheetsWebhook,
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        const apiKey = process.env.GEMINI_API_KEY;
        let ai: GoogleGenAI | null = null;
        if (apiKey) {
          try {
            ai = new GoogleGenAI({
              apiKey,
              httpOptions: {
                headers: {
                  'User-Agent': 'aistudio-build',
                },
              },
            });
          } catch (e) {
            console.warn('Could not initialize GoogleGenAI client:', e);
          }
        }

        // Read request body
        const chunks: Buffer[] = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', async () => {
          let body: any = {};
          try {
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            if (rawBody) {
              body = JSON.parse(rawBody);
            }
          } catch {
            body = {};
          }

          res.setHeader('Content-Type', 'application/json');

          const DEFAULT_DEV_SHEETS_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyOdNACeBvN7gDxGPV0THoUDyYxTbr9CYm7aI8BtRAd4dV_Dz0gFmV4fjoEJDjkWWfPFg/exec';

          // Login endpoint
          if (urlPath === '/api/auth/login' && req.method === 'POST') {
            const { identifier, password } = body || {};
            const cleanId = String(identifier || '').trim().toLowerCase();
            const inputPass = String(password || '').trim();
            let userFound: any = null;

            if (devSupabase) {
              try {
                const { data } = await devSupabase.from('app_users').select('*').or(`email.ilike.${cleanId},username.ilike.${cleanId}`).limit(1);
                if (data && data.length > 0) userFound = data[0];
              } catch {}
            }

            if (!userFound) {
              const currentStore = readDevStore();
              const localUsers = currentStore['app_users'] || [];
              userFound = localUsers.find((u: any) => (u.email && u.email.toLowerCase() === cleanId) || (u.username && u.username.toLowerCase() === cleanId));
            }

            if (!userFound) {
              userFound = MASTER_STAFF_REGISTRY.find(u => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId);
            }

            if (!userFound) {
              res.statusCode = 401;
              res.end(JSON.stringify({ success: false, message: 'Akun dengan email/username tersebut tidak ditemukan.' }));
              return;
            }

            const validPass = userFound.password_hash || 'hara123';
            if (inputPass !== validPass) {
              res.statusCode = 401;
              res.end(JSON.stringify({ success: false, message: 'Kata sandi tidak cocok. Silakan coba kembali.' }));
              return;
            }

            const safeUser = {
              id: userFound.id,
              nama: userFound.nama,
              email: userFound.email,
              role: userFound.role,
              kode_outlet: userFound.kode_outlet || 'Kantor Lempongsari',
              status_aktif: 'Aktif',
              created_at: userFound.created_at || new Date().toISOString(),
            };

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: 'Login berhasil.', user: safeUser }));
            return;
          }

          // Change password endpoint
          if (urlPath === '/api/auth/change-password' && req.method === 'POST') {
            const { identifier, oldPass, newPass } = body || {};
            const cleanId = String(identifier || '').trim().toLowerCase();
            const cleanOld = String(oldPass || '').trim();
            const cleanNew = String(newPass || '').trim();

            if (cleanNew.length < 6) {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, message: 'Kata sandi baru minimal 6 karakter.' }));
              return;
            }

            let userFound: any = null;
            if (devSupabase) {
              try {
                const { data } = await devSupabase.from('app_users').select('*').or(`email.ilike.${cleanId},username.ilike.${cleanId}`).limit(1);
                if (data && data.length > 0) userFound = data[0];
              } catch {}
            }

            const currentStore = readDevStore();
            if (!userFound) {
              const localUsers = currentStore['app_users'] || [];
              userFound = localUsers.find((u: any) => (u.email && u.email.toLowerCase() === cleanId) || (u.username && u.username.toLowerCase() === cleanId));
            }

            if (!userFound) {
              userFound = MASTER_STAFF_REGISTRY.find(u => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId);
            }

            if (!userFound) {
              res.statusCode = 404;
              res.end(JSON.stringify({ success: false, message: 'Pengguna tidak ditemukan.' }));
              return;
            }

            const currentPass = userFound.password_hash || 'hara123';
            if (cleanOld !== currentPass) {
              res.statusCode = 401;
              res.end(JSON.stringify({ success: false, message: 'Kata sandi lama tidak cocok.' }));
              return;
            }

            const nowIso = new Date().toISOString();
            if (devSupabase) {
              try {
                await devSupabase.from('app_users').update({ password_hash: cleanNew, updated_at: nowIso }).eq('id', userFound.id);
              } catch {}
            }

            if (!currentStore['app_users']) currentStore['app_users'] = [];
            const idx = currentStore['app_users'].findIndex((u: any) => u.id === userFound.id);
            if (idx >= 0) {
              currentStore['app_users'][idx].password_hash = cleanNew;
              currentStore['app_users'][idx].updated_at = nowIso;
            } else {
              currentStore['app_users'].push({ ...userFound, password_hash: cleanNew, updated_at: nowIso });
            }
            writeDevStore(currentStore);

            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, message: 'Kata sandi berhasil diperbarui.' }));
            return;
          }

          if (urlPath === '/api/db/config' && req.method === 'POST') {
            const { url, anonKey, googleSheetsWebhookUrl, webhookUrl } = body;
            const currentStore = readDevStore();
            if (url || anonKey) {
              (currentStore as any)._supabase_config = { url, anonKey };
            }
            const targetWebhook = googleSheetsWebhookUrl || webhookUrl;
            if (targetWebhook) {
              (currentStore as any)._google_sheet_webhook = targetWebhook.trim();
            }
            writeDevStore(currentStore);
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              message: 'Konfigurasi Supabase & Webhook Google Sheets berhasil disimpan di server pusat.',
              googleSheetsWebhookUrl: (currentStore as any)._google_sheet_webhook || DEFAULT_DEV_SHEETS_WEBHOOK,
            }));
            return;
          }

          if (urlPath === '/api/db/sync' && req.method === 'POST') {
            const { table, records, record, action } = body;
            const currentStore = readDevStore();
            if (!currentStore[table]) currentStore[table] = [];
            const incoming = records || (record ? [record] : []);
            if (action === 'DELETE') {
              const ids = new Set(incoming.map((r: any) => r.id));
              currentStore[table] = currentStore[table].filter((r: any) => !ids.has(r.id));
              if (devSupabase) {
                for (const id of ids) {
                  try {
                    await devSupabase.from(table).delete().eq('id', id);
                  } catch {}
                }
              }
            } else {
              for (const inc of incoming) {
                if (!inc?.id) continue;
                const idx = currentStore[table].findIndex((r: any) => r.id === inc.id);
                if (idx >= 0) currentStore[table][idx] = { ...currentStore[table][idx], ...inc };
                else currentStore[table].unshift(inc);
              }

              // Update in devSupabase
              if (devSupabase) {
                try {
                  await devSupabase.from('app_store').upsert({
                    key: `sync_${table}`,
                    value: currentStore[table],
                    updated_at: new Date().toISOString()
                  }, { onConflict: 'key' });
                } catch {}

                try {
                  await devSupabase.from(table).upsert(incoming);
                } catch {}
              }

              // Relay to Google Sheets Webhook
              if (['penilaian_praktik_onboarding_produk', 'kru', 'onboarding_batches'].includes(table)) {
                const hookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || (currentStore as any)._google_sheet_webhook || DEFAULT_DEV_SHEETS_WEBHOOK;
                if (hookUrl && hookUrl.startsWith('http')) {
                  for (const item of incoming) {
                    fetch(hookUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                      body: JSON.stringify({
                        event: 'AUTO_RELAY_SYNC',
                        action: table === 'penilaian_praktik_onboarding_produk' ? 'ADD_PENILAIAN' : `SYNC_${table.toUpperCase()}`,
                        table,
                        timestamp: new Date().toISOString(),
                        payload: item,
                        ...item,
                      }),
                    }).catch(() => {});
                  }
                }
              }
            }
            writeDevStore(currentStore);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, count: currentStore[table].length, timestamp: new Date().toISOString() }));
            return;
          }

          if (urlPath === '/api/sync/spreadsheet' && req.method === 'POST') {
            const { payload, webhookUrl } = body;
            const currentStore = readDevStore();
            const targetUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || webhookUrl || (currentStore as any)._google_sheet_webhook || DEFAULT_DEV_SHEETS_WEBHOOK;
            if (targetUrl) {
              try {
                const spRes = await fetch(targetUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                  body: JSON.stringify(payload),
                });
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, status: spRes.status, message: 'Data dikirim via dev proxy.' }));
                return;
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, message: e.message }));
                return;
              }
            }
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, message: 'URL webhook tidak ditemukan.' }));
            return;
          }

          if (urlPath === '/api/gemini/advisor' && req.method === 'POST') {
            try {
              const { prompt, contextData } = body;
              const systemInstruction = `Anda adalah "Hara Trainer AI Advisor" - Konsultan Ahli Trainer Operasional & Pelatihan Lapangan Restoran Cepat Saji (F&B) untuk Hara Chicken (Spesialis Ayam Goreng Krispi & Geprek Multi-Outlet).
Tugas Anda:
1. Memberikan rekomendasi coaching GROW (Goal, Reality, Options, Will) yang praktis, aplikatif di level kitchen, kasir, helper, dan geprek.
2. Menganalisis temuan evaluasi lapangan, Gap Analysis, dan kartu keluhan pelanggan untuk memberikan solusi pelatihan kerja yang tepat sasaran.
3. Menuliskan panduan standar SOP, tips mengatasi kendala lapangan, atau menyusun materi bimbingan kru.
4. Gunakan bahasa Indonesia profesional, tegas, ramah, dan solutif ala Lead Trainer Operasional Lapangan. Gunakan bullet points atau penomoran rapi.`;

              const contents = contextData
                ? `[DATA OPERASIONAL HARA CHICKEN]\n${contextData}\n\n[PERMINTAAN USER]\n${prompt}`
                : prompt;

              let generatedText = '';
              if (ai) {
                const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.7-flash'];

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
                      generatedText = response.text;
                      break;
                    }
                  } catch (mErr: any) {
                    console.warn(`Dev model ${model} unavailable (status ${mErr?.status || mErr?.code || 'unknown'}). Trying next fallback...`);
                  }
                }
              }

              if (!generatedText) {
                generatedText = generateDomainAdvisorFallback(prompt || 'Konsultasi Pelatihan Trainer');
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ text: generatedText }));
            } catch (err: any) {
              console.error('Dev Server Gemini Advisor Error:', err);
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  text: generateDomainAdvisorFallback(body.prompt || 'Konsultasi Pelatihan Trainer'),
                })
              );
            }
            return;
          }

          if (req.url === '/api/gemini/training-plan' && req.method === 'POST') {
            try {
              const { tnaDescription, divisi, kodeOutlet } = body;
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

              let resultObj: any = null;
              if (ai) {
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

                    if (response.text) {
                      resultObj = JSON.parse(response.text);
                      break;
                    }
                  } catch (mErr: any) {
                    console.warn(`Dev model ${model} training plan unavailable (status ${mErr?.status || mErr?.code || 'unknown'}). Trying next fallback...`);
                  }
                }
              }

              if (resultObj) {
                res.statusCode = 200;
                res.end(JSON.stringify(resultObj));
                return;
              }
              throw new Error('Fallback needed');
            } catch (err: any) {
              console.error('Dev Server Gemini Training Plan Error:', err);
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  topik: `Pelatihan Standarisasi ${body.divisi || 'Operasional'} (${body.kodeOutlet || 'Outlet'})`,
                  tujuan: `Mengatasi gap: ${(body.tnaDescription || '').slice(0, 80)}...`,
                  metode: 'Demonstrasi Praktik & Evaluasi Langsung',
                  durasi: '90 Menit',
                  alatBantu: 'Checklist SOP, Alat Masak & Bahan Praktik',
                  rencanaLangkah: [
                    'Briefing tujuan dan review materi SOP standar',
                    'Demonstrasi langsung oleh trainer / PIC',
                    'Praktik mandiri oleh kru yang dinilai',
                    'Evaluasi rubrik skor dan komitmen GROW',
                  ],
                })
              );
            }
            return;
          }

          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiApiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
    },
  };
});
