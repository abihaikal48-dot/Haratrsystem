export async function askTrainerAssistant(prompt: string, contextData?: string): Promise<string> {
  try {
    const response = await fetch('/api/gemini/advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, contextData }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.text) {
        return data.text;
      }
    }

    const errData = await response.json().catch(() => ({}));
    if (errData && errData.text) {
      return errData.text;
    }
  } catch (err: any) {
    console.warn('AI Advisor Request Warning:', err);
  }

  // Graceful client fallback
  return `### 📋 Rekomendasi Pelatihan & Operasional F&B Hara Chicken

**Terkait:** "${prompt.slice(0, 100)}"

1. **Penegakan Standar Operasional (SOP):**
   * Review kepatuhan teknis di level dapur & kasir untuk memastikan konsistensi kualitas.
   * Lakukan briefing harian 5 menit mengenai titik kritis operasional.

2. **Pendekatan Coaching GROW:**
   * **Goal:** Menetapkan target performa dan kecepatan saji kru.
   * **Reality:** Mengidentifikasi kendala riil di lapangan pada jam sibuk.
   * **Options:** Menjadwalkan pendampingan langsung (shadowing) oleh Senior Cook/Supervisor.
   * **Will:** Menentukan komitmen perbaikan dalam 7 hari kerja.`;
}

export async function generateAITrainingPlan(
  tnaDescription: string,
  divisi: string,
  kodeOutlet: string
): Promise<{
  topik: string;
  tujuan: string;
  metode: string;
  durasi: string;
  alatBantu: string;
  rencanaLangkah: string[];
}> {
  try {
    const response = await fetch('/api/gemini/training-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tnaDescription, divisi, kodeOutlet }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.topik) {
        return data;
      }
    }
  } catch (err) {
    console.warn('AI Training Plan Request Warning:', err);
  }

  return {
    topik: `Pelatihan Standarisasi ${divisi || 'Kru'} (${kodeOutlet || 'Outlet'})`,
    tujuan: `Mengatasi gap: ${(tnaDescription || 'Standar operasional').slice(0, 80)}...`,
    metode: 'Demonstrasi Praktik & Evaluasi Langsung',
    durasi: '90 Menit',
    alatBantu: 'Checklist SOP, Alat Masak & Bahan Praktik',
    rencanaLangkah: [
      'Briefing tujuan dan review materi SOP standar',
      'Demonstrasi langsung oleh trainer / PIC',
      'Praktik mandiri oleh kru yang dinilai',
      'Evaluasi rubrik skor dan komitmen GROW',
    ],
  };
}
