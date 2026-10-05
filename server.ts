import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

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

// Serve frontend in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
