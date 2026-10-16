import React, { useState } from 'react';
import {
  Sparkles, X, Send, Bot, User, RefreshCw,
  Copy, Check, FilePlus, ChevronRight, Lightbulb
} from 'lucide-react';
import { askTrainerAssistant, generateAITrainingPlan } from '../lib/gemini';
import { db } from '../lib/storage';

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOutletCode: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  selectedOutletCode,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Halo! Saya **Hara Trainer AI Advisor** 🐔.\n\nSaya siap membantu Anda dalam:\n- Menganalisis temuan evaluasi lapangan dan pola kendala kru\n- Menyusun skenario coaching GROW untuk kru operasional\n- Merancang panduan pelatihan F&B standar Hara Chicken\n- Memberikan tips operasional dapur, sambal, kasir, dan sanitasi.\n\nAda topik pelatihan operasional yang ingin kita bahas hari ini?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    'Analisis gap paha ayam belum matang sempurna di jam sibuk',
    'Buat skenario GROW Coaching kasir yang lupa upselling',
    'Rancang kurikulum training 90 menit standar penepungan krispi',
    'Bagaimana SOP menjaga kualitas minyak goreng tetap jernih?',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Gather real-time system context for active outlet
      const allExams = db.getHasilUjianMingguan();
      const filteredExams = selectedOutletCode === 'ALL'
        ? allExams
        : allExams.filter((e) => e.kode_outlet === selectedOutletCode);

      const avgScore = filteredExams.length > 0
        ? Math.round(filteredExams.reduce((acc, curr) => acc + curr.skor_akhir_komposit, 0) / filteredExams.length)
        : 82;

      // Extract 3 most frequent incorrect / remedial topics
      const topicFreq: Record<string, number> = {};
      filteredExams.forEach((e) => {
        if (e.analisis_pilar?.pilar_terendah) {
          topicFreq[e.analisis_pilar.pilar_terendah] = (topicFreq[e.analisis_pilar.pilar_terendah] || 0) + 1;
        }
        if (e.analisis_pilar?.materi_rekomendasi) {
          if (Array.isArray(e.analisis_pilar.materi_rekomendasi)) {
            e.analisis_pilar.materi_rekomendasi.forEach((m) => {
              topicFreq[m] = (topicFreq[m] || 0) + 1;
            });
          } else {
            const m = String(e.analisis_pilar.materi_rekomendasi);
            topicFreq[m] = (topicFreq[m] || 0) + 1;
          }
        }
      });
      const top3WrongTopics = Object.entries(topicFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([topic]) => topic);
      const defaultTopics = [
        'SOP Suhu Minyak & Penggorengan Deep Fryer 160°C (12 menit)',
        'Standarisasi Gramatur Sambal Bawang 30g (#BeneranDiGeprek)',
        'Verifikasi Core Temperature Ayam Matang ≥ 74°C & Holding Warmer 120 Menit'
      ];
      const finalWrongTopics = top3WrongTopics.length > 0 ? top3WrongTopics : defaultTopics;

      // Unresolved TNA items
      const tnaList = db.getTable<any>('tna').filter((t: any) =>
        t.status !== 'Selesai' && (selectedOutletCode === 'ALL' || t.kode_outlet === selectedOutletCode)
      );
      const tnaSummary = tnaList.slice(0, 4).map((t: any) => `• [${t.kode_outlet}] ${t.divisi}: ${t.deskripsi_gap} (Prioritas: ${t.prioritas})`).join('\n');

      // Active customer complaints
      const complaints = db.getTable<any>('kartu_keluhan').filter((c: any) =>
        c.status !== 'Selesai' && (selectedOutletCode === 'ALL' || c.kode_outlet === selectedOutletCode)
      );
      const complaintSummary = complaints.slice(0, 3).map((c: any) => `• [${c.kode_outlet}] ${c.tipe}: "${c.deskripsi_keluhan}" (Tindakan Cepat: ${c.tindakan_diambil})`).join('\n');

      const outlets = db.getTable<any>('outlets');
      const activeOutletObj = outlets.find((o: any) => o.kode_outlet === selectedOutletCode);
      const outletName = selectedOutletCode === 'ALL' ? 'Semua Outlet Jaringan' : `${selectedOutletCode} - ${activeOutletObj?.nama_outlet || ''}`;

      const context = `[RINGKASAN DATA RIIL OUTLET AKTIF: ${outletName}]
- Rata-rata Skor Evaluasi Mingguan Saat Ini: ${avgScore} / 100
- 3 Topik Soal Paling Sering Dijawab Salah oleh Kru:
${finalWrongTopics.map((t, idx) => `  ${idx + 1}. ${t}`).join('\n')}
- Daftar Temuan TNA Belum Selesai (${tnaList.length} temuan):
${tnaSummary || '  (Tidak ada temuan TNA aktif)'}
- Kartu Keluhan Pelanggan Aktif (${complaints.length} tiket):
${complaintSummary || '  (Tidak ada tiket keluhan aktif)'}
- Standar Mutu Baku HARA: Deep Fryer 160°C (12 mnt), Core Temp ≥ 74°C, Warmer max 120 mnt (60-70°C), Sambal Bawang 30g.`;

      const aiResponse = await askTrainerAssistant(query, context);
      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-err-' + Date.now(),
          sender: 'ai',
          text: 'Maaf, terjadi kendala teknis dalam memproses data. Silakan coba kembali.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-[#E8DFD3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-3.5 md:px-5 bg-gradient-to-r from-[#12100E] via-[#2A1517] to-[#A21D21] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A21D21] to-[#D9A027] flex items-center justify-center text-white shadow-md">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="font-black text-xs md:text-sm flex items-center gap-2">
                <span>Hara Trainer AI Advisor</span>
                <span className="text-[9.5px] bg-[#D9A027] text-black px-1.5 py-0.2 rounded-md font-black uppercase">
                  Gemini 3.7 Flash
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                Konsultan Trainer Operasional & Standar Pelaksanaan Lapangan Restoran
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-2 bg-slate-50 border-b border-[#E2E0D8] overflow-x-auto flex gap-1.5 shrink-0">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 border border-[#E2E0D8] text-[11px] font-semibold text-slate-700 whitespace-nowrap transition-colors hover:border-amber-300 flex items-center gap-1.5"
            >
              <Lightbulb size={12} className="text-[#D9A027] shrink-0" />
              <span>{p}</span>
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 p-3.5 md:p-4 overflow-y-auto space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-[#A21D21] text-white flex items-center justify-center shrink-0 text-[10px] font-black shadow-xs">
                  AI
                </div>
              )}

              <div
                className={`max-w-[84%] rounded-xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#A21D21] text-white rounded-br-none shadow-xs font-medium'
                    : 'bg-[#FCFAF7] text-slate-900 border border-[#E2E0D8] rounded-bl-none shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-black/5 text-[9.5px] opacity-70">
                  <span>{m.timestamp}</span>
                  {m.sender === 'ai' && (
                    <button
                      onClick={() => copyToClipboard(m.id, m.text)}
                      className="hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check size={11} /> Tersalin
                        </>
                      ) : (
                        <>
                          <Copy size={11} /> Salin Teks
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-[#12100E] text-white flex items-center justify-center shrink-0 text-[10px] font-black">
                  U
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-xs text-slate-500 italic p-2.5 bg-slate-50 rounded-xl w-fit">
              <RefreshCw className="animate-spin text-[#A21D21]" size={14} />
              <span>AI Advisor sedang menganalisis kurikulum & standar operasional...</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-2.5 md:p-3 bg-white border-t border-[#E2E0D8] flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Tanyakan analisis TNA, kurikulum, panduan SOP, atau skenario GROW..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
            className="input-enterprise flex-1 text-xs py-1.5"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="btn-primary-enterprise !py-1.5 !px-3 text-xs shrink-0"
          >
            <Send size={14} />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </div>
      </div>
    </div>
  );
};
