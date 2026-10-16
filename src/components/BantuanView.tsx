import React, { useState } from 'react';
import {
  HelpCircle, BookOpen, MessageSquare, Shield, Award,
  Sparkles, Flame, CheckCircle2, ChevronRight, Info,
  Store, Target, Zap, Clock, Users, ArrowUpRight, Copy, Check
} from 'lucide-react';
import { HaraLogo, PhilosophyModal } from './HaraLogo';
import { PageHeaderBanner } from './PageHeaderBanner';

export const BantuanView: React.FC = () => {
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl animate-in fade-in duration-200">
      {/* 1. UNIFIED MINIMALIST PAGE HEADER */}
      <PageHeaderBanner
        category="PANDUAN & FILOSOFI"
        title="Pusat Bantuan, Standar Baku & Pedoman"
        description="Panduan terpadu penggunaan sistem HARA TRAINER PRO, makna dan filosofi logo resmi, kerangka coaching GROW, serta kalkulator bobot evaluasi 3 pilar."
        icon={<HelpCircle size={22} />}
        rightElement={
          <button
            type="button"
            onClick={() => setShowLogoModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#96171B] hover:bg-[#801216] text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <Shield size={14} />
            <span>Filosofi Logo</span>
          </button>
        }
      />

      {/* 2. CARD SPECIAL: FILOSOFI & ANATOMI LOGO HARA TRAINER */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <HaraLogo variant="icon" size="md" interactive />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Filosofi Desain & Identitas Logo HARA TRAINER
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-[#96171B] font-bold uppercase">
                  Official 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Konsep Modern, Minimalis, Futuristik & Berbasis Standar Kualitas F&B
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLogoModal(true)}
            className="text-xs font-bold text-[#96171B] hover:text-[#7A1519] flex items-center gap-1.5 cursor-pointer bg-red-50/70 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200/80 transition-colors"
          >
            <span>Buka Rincian Filosofi</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* 4 Pillars Visual Breakdown */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[#FAF9F7] border border-slate-200/80 rounded-2xl space-y-2 hover:border-[#96171B]/30 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#96171B] flex items-center justify-center font-bold text-xs">
              <Shield size={16} />
            </div>
            <div className="font-bold text-xs text-slate-900">1. Tameng Heksagonal HACCP</div>
            <p className="text-[11.5px] text-slate-600 leading-snug">
              Melambangkan 6 pilar keamanan pangan: Food Safety, Suhu 170°C, Sanitasi, Kecepatan, Hospitality, dan Disiplin Prosedur.
            </p>
          </div>

          <div className="p-4 bg-[#FAF9F7] border border-slate-200/80 rounded-2xl space-y-2 hover:border-amber-400/40 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xs">
              <Flame size={16} />
            </div>
            <div className="font-bold text-xs text-slate-900">2. Golden Hyper-Flame 170°C</div>
            <p className="text-[11.5px] text-slate-600 leading-snug">
              Nyala api emas kinetik di inti monogram mewakili akurasi suhu deep-fryer resep rahasia dan semangat Kaizen perbaikan tanpa henti.
            </p>
          </div>

          <div className="p-4 bg-[#FAF9F7] border border-slate-200/80 rounded-2xl space-y-2 hover:border-slate-300 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <Sparkles size={16} />
            </div>
            <div className="font-bold text-xs text-slate-900">3. Dynamic Monogram 'H'</div>
            <p className="text-[11.5px] text-slate-600 leading-snug">
              Dua pilar kokoh melambangkan sinergi Standar Operasional Restoran dan Potensi Insan Kru, dihubungkan jembatan evaluasi.
            </p>
          </div>

          <div className="p-4 bg-[#FAF9F7] border border-slate-200/80 rounded-2xl space-y-2 hover:border-emerald-400 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
              <Award size={16} />
            </div>
            <div className="font-bold text-xs text-slate-900">4. Quad-Pillar Standard (20-40-15-25)</div>
            <p className="text-[11.5px] text-slate-600 leading-snug">
              Empat pilar evaluasi terstandarisasi: Teori SOP (20%), Praktik SOS (40%), Lisan HACCP (15%), dan Sikap Budaya H.A.R.A (25%).
            </p>
          </div>
        </div>
      </div>

      {/* 3. OPERATIONAL GUIDELINES & FRAMEWORKS */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* GROW Coaching Framework */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#96171B] font-bold text-sm">
              <MessageSquare size={16} />
              <span>Kerangka Coaching GROW untuk Supervisor</span>
            </div>
            <button
              type="button"
              onClick={() =>
                handleCopyText(
                  'grow',
                  'Panduan Coaching GROW:\nG - Goal: Capaian shift\nR - Reality: Kendala nyata\nO - Options: Alternatif solusi\nW - Will: Komitmen tindakan shift berikutnya'
                )
              }
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              {copiedSection === 'grow' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copiedSection === 'grow' ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            Metode dialog konstruktif 1-on-1 setelah sesi observasi atau saat menindaklanjuti temuan TNA:
          </p>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="p-3 bg-[#FAF9F7] border border-slate-200/80 rounded-xl">
              <span className="font-bold text-slate-900">G • Goal (Tujuan):</span>
              <p className="text-slate-600 text-[11.5px] mt-0.5">
                Apa hasil standar, kecepatan, atau kualitas rasa yang ingin dicapai kru pada shift ini?
              </p>
            </div>
            <div className="p-3 bg-[#FAF9F7] border border-slate-200/80 rounded-xl">
              <span className="font-bold text-slate-900">R • Reality (Kenyataan Lapangan):</span>
              <p className="text-slate-600 text-[11.5px] mt-0.5">
                Apa kendala nyata yang terjadi (misal: panik saat antrean rush hour, bumbu marinasi belum meresap)?
              </p>
            </div>
            <div className="p-3 bg-[#FAF9F7] border border-slate-200/80 rounded-xl">
              <span className="font-bold text-slate-900">O • Options (Pilihan Solusi):</span>
              <p className="text-slate-600 text-[11.5px] mt-0.5">
                Apa langkah alternatif yang bisa dicoba bersama (misal: penyesuaian batch goreng, persiapan mise en place)?
              </p>
            </div>
            <div className="p-3 bg-[#FAF9F7] border border-slate-200/80 rounded-xl">
              <span className="font-bold text-slate-900">W • Will (Komitmen Tindakan):</span>
              <p className="text-slate-600 text-[11.5px] mt-0.5">
                Kapan dan bagaimana kru akan menerapkan perubahan terukur mulai shift berikutnya?
              </p>
            </div>
          </div>
        </div>

        {/* 3-Tier Evaluation Matrix & Formula */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#D98218] font-bold text-sm">
              <Target size={16} />
              <span>Formula Pembobotan & Predikat Kelulusan</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full font-bold">
              Standar 2026
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Skor komposit akhir kru dihitung secara proporsional dari 4 pilar kompetensi terpadu:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-[#FAF9F7] border border-slate-200/80 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">1. Uji Teori SOP (Kognitif) & HOTS</div>
                <div className="text-[11px] text-slate-500">SOP HACCP, formula resep, sanitasi, dan 5S</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#96171B] bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                  Bobot 20%
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F7] border border-slate-200/80 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">2. Uji Praktik & Speed of Service / SOS (Keterampilan)</div>
                <div className="text-[11px] text-slate-500">Eksekusi deep-fryer 160°C (12 menit), Sambal Bawang 30g, kasir POS</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                  Bobot 40%
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F7] border border-slate-200/80 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">3. Uji Lisan & Pemahaman Kritis HACCP</div>
                <div className="text-[11px] text-slate-500">Critical control point, core temp ≥ 74°C, holding warmer maks 120 menit</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
                  Bobot 15%
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F7] border border-slate-200/80 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">4. Sikap Budaya H.A.R.A (12 Perilaku Utama) & Psikometri SJT</div>
                <div className="text-[11px] text-slate-500">Penerapan 12 Perilaku Utama: Halal, Amanah, Responsif, Adaptif & integritas kasir Rp 0</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  Bobot 25%
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs space-y-2">
            <div className="font-bold text-amber-300 text-xs">Standar KKM 4 Tingkat Grade Kelulusan HARA:</div>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="p-2 bg-white/10 rounded-lg">
                <div className="font-bold text-emerald-400">Grade A (Mahir)</div>
                <div className="text-slate-300">Skor 85 - 100</div>
              </div>
              <div className="p-2 bg-white/10 rounded-lg">
                <div className="font-bold text-blue-400">Grade B (Kompeten)</div>
                <div className="text-slate-300">Skor 75 - 84</div>
              </div>
              <div className="p-2 bg-white/10 rounded-lg">
                <div className="font-bold text-amber-300">Grade C (Pembinaan)</div>
                <div className="text-slate-300">Skor 60 - 74</div>
              </div>
              <div className="p-2 bg-white/10 rounded-lg">
                <div className="font-bold text-rose-400">Remedial</div>
                <div className="text-slate-300">Skor &lt; 60</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {showLogoModal && <PhilosophyModal onClose={() => setShowLogoModal(false)} />}
    </div>
  );
};
