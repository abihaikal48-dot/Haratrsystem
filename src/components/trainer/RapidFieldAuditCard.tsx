import React, { useState, useMemo } from 'react';
import {
  Zap, CheckCircle2, AlertTriangle, Clock, Thermometer,
  ShieldAlert, Send, Copy, Share2, User, Sparkles, MessageCircle,
  Flame, Shirt, Calendar, CheckSquare, Search, RefreshCw, ChevronDown, ChevronUp, Store
} from 'lucide-react';
import { db } from '../../lib/storage';
import { Kru, Outlet, Division } from '../../types';

interface RapidFieldAuditCardProps {
  selectedOutletCode: string;
  onRefresh?: () => void;
}

export const RapidFieldAuditCard: React.FC<RapidFieldAuditCardProps> = ({
  selectedOutletCode,
  onRefresh,
}) => {
  const [outletCode, setOutletCode] = useState(selectedOutletCode === 'ALL' ? 'HC-JTS01' : selectedOutletCode);
  const [activeShift, setActiveShift] = useState<'Pagi' | 'Middle' | 'Siang'>('Pagi');
  const [selectedKruId, setSelectedKruId] = useState<string>('');
  const [copiedKruId, setCopiedKruId] = useState<string | null>(null);

  // 1. Checklist Kesiapan Outlet Cepat State
  const [checklist, setChecklist] = useState({
    suhu_fryer: true, // 175°C & Minyak 160°C
    suhu_warmer: true, // 60-70°C maks 120 menit
    suhu_chiller: true, // 0-4°C / angka 3
    suhu_freezer: true, // -18°C, jarak dinding 16 cm
    seragam_harian: true, // Sen-Sel Merah, Rab-Kam/Min Kuning, Jum-Sab Batik, Training Putih
    expired_check: true, // Bahan H-1 s.d H-3
    upselling_kasir: true, // Target upselling & 5S hospitality
  });

  // 2. Multi-Crew Quick Assessment State: Record<kruId, { praktikSOS: number, lisanHACCP: number, sikapHARA: number, catatan: string, topikSalah: string, expanded: boolean }>
  const [crewScores, setCrewScores] = useState<Record<string, {
    praktikSOS: number;
    lisanHACCP: number;
    sikapHARA: number;
    catatan: string;
    topikSalah: string;
    expanded: boolean;
  }>>({});

  const outlets = db.getOutlets();
  const allKru = db.getTable<Kru>('kru').filter(k => k.status_aktif === 'Aktif');

  const outletKru = useMemo(() => {
    return allKru.filter(k => k.kode_outlet === outletCode);
  }, [allKru, outletCode]);

  // Initializing crew scores
  React.useEffect(() => {
    setCrewScores(prev => {
      const next = { ...prev };
      outletKru.forEach(k => {
        if (!next[k.id]) {
          next[k.id] = {
            praktikSOS: 88,
            lisanHACCP: 85,
            sikapHARA: 90,
            catatan: 'Kepatuhan SOP shift stabil.',
            topikSalah: 'Timer holding warmer dan kontrol gramasi bumbu sambal',
            expanded: false,
          };
        }
      });
      return next;
    });
  }, [outletKru]);

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleScoreChange = (kruId: string, field: 'praktikSOS' | 'lisanHACCP' | 'sikapHARA', val: number) => {
    setCrewScores(prev => ({
      ...prev,
      [kruId]: {
        ...prev[kruId],
        [field]: val,
      }
    }));
  };

  const handleTextChange = (kruId: string, field: 'catatan' | 'topikSalah', val: string) => {
    setCrewScores(prev => ({
      ...prev,
      [kruId]: {
        ...prev[kruId],
        [field]: val,
      }
    }));
  };

  const toggleExpand = (kruId: string) => {
    setCrewScores(prev => ({
      ...prev,
      [kruId]: {
        ...prev[kruId],
        expanded: !prev[kruId]?.expanded,
      }
    }));
  };

  const calculateQuickScore = (kruId: string) => {
    const scores = crewScores[kruId];
    if (!scores) return 85;
    // Standard bobot: Teori (20%), Praktik SOS (40%), Lisan HACCP (15%), Sikap Budaya HARA (25%)
    const teoriEstimate = 85;
    const finalScore = Math.round(
      (teoriEstimate * 0.20) +
      (scores.praktikSOS * 0.40) +
      (scores.lisanHACCP * 0.15) +
      (scores.sikapHARA * 0.25)
    );
    return finalScore;
  };

  // Generate WhatsApp Message
  const generateWaText = (kru: Kru) => {
    const s = crewScores[kru.id] || {
      praktikSOS: 88,
      lisanHACCP: 85,
      sikapHARA: 90,
      catatan: 'Pertahankan standar kebersihan dan kecepatan saji.',
      topikSalah: 'Holding time warmer dan gramasi bumbu sambal',
      expanded: false
    };
    const finalScore = calculateQuickScore(kru.id);

    return `*KARTU SAKU FOKUS PERBAIKAN KRU — HARA CHICKEN* 🍗
--------------------------------------------
👤 *Nama Kru:* ${kru.nama_kru}
📍 *Gerai:* ${kru.kode_outlet} (${kru.divisi})
⏰ *Shift:* ${activeShift} (${activeShift === 'Pagi' ? '05:30-13:30' : activeShift === 'Middle' ? '09:00-11:00' : '13:30-21:30'})

📊 *Hasil Evaluasi Kunjungan Cepat (4 Pilar):*
• Nilai Praktik Stopwatch SOS (40%): *${s.praktikSOS}/100*
• Nilai Lisan & Nalar HACCP (15%): *${s.lisanHACCP}/100*
• Nilai Sikap Budaya H.A.R.A (25%): *${s.sikapHARA}/100*
🏆 *Indeks Komposit:* *${finalScore}/100* (${finalScore >= 75 ? 'LULUS STANDAR QSR' : 'PERLU RETRAINING'})

⚠️ *Topik SOP Fokus Perbaikan:*
_${s.topikSalah}_

📖 *Langkah Baku Sesuai Buku SOP HARA:*
1. Cek suhu fryer stabil 160°C (kompor 175°C) sebelum ayam masuk.
2. Holding warmer maks 120 menit (60°C–70°C).
3. Timbang sambal bawang tepat 30 gram menggunakan timbangan digital 5 kg.
4. Gunakan lap resmi sesuai kode: Kanebo untuk piring, Lap Orange untuk meja, Lap basah kotak untuk dapur, Lap kotak kering untuk dusting penepungan.

⏳ *Jadwal Evaluasi Ulang:*
Wajib re-evaluasi setelah jeda belajar 30 menit / pada shift berikutnya.
Semangat bertumbuh bersama Budaya H.A.R.A (Halal, Amanah, Responsif, Adaptif)! #BeneranDiGeprek`;
  };

  const handleCopyWa = (kru: Kru) => {
    const text = generateWaText(kru);
    navigator.clipboard.writeText(text);
    setCopiedKruId(kru.id);
    setTimeout(() => setCopiedKruId(null), 3000);
  };

  const handleShareWa = (kru: Kru) => {
    const text = encodeURIComponent(generateWaText(kru));
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header Mode Kunjungan Cepat */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#8B1418] to-stone-900 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
            <Zap size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold bg-white/10 px-2 py-0.5 rounded">
                FIELD TRAINER RAPID WEAPON
              </span>
              <span className="text-[10px] text-white/70">Mobile Friendly</span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
              Mode Inspeksi Cepat Kunjungan Gerai & Kartu Saku WA
            </h2>
          </div>
        </div>

        {/* Gerai & Shift Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={outletCode}
            onChange={(e) => setOutletCode(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold focus:outline-hidden"
          >
            {outlets.map(o => (
              <option key={o.id} value={o.kode_outlet} className="text-slate-900">
                {o.kode_outlet} — {o.nama_outlet}
              </option>
            ))}
          </select>

          {/* Shift Pills */}
          <div className="flex items-center p-1 bg-white/10 rounded-xl border border-white/20 text-xs font-bold">
            {(['Pagi', 'Middle', 'Siang'] as const).map(shift => (
              <button
                key={shift}
                type="button"
                onClick={() => setActiveShift(shift)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeShift === shift ? 'bg-amber-500 text-slate-950 font-black' : 'text-white/80 hover:text-white'
                }`}
              >
                {shift}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: 1. Checklist Kesiapan Gerai Cepat + 2. Multi-Crew Evaluator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Kolom Kiri: Checklist Kesiapan Outlet Cepat (HP Optimized) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Thermometer size={16} className="text-[#8B1418]" />
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                Checklist Kesiapan Outlet Cepat
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
              Shift {activeShift}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Suhu Fryer */}
            <div
              onClick={() => toggleCheck('suhu_fryer')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                checklist.suhu_fryer ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' : 'bg-red-50/60 border-red-300 text-red-950'
              }`}
            >
              <input type="checkbox" checked={checklist.suhu_fryer} onChange={() => {}} className="mt-0.5 cursor-pointer rounded" />
              <div>
                <strong className="block font-bold">1. Suhu Fryer (175°C) & Minyak (160°C)</strong>
                <span className="text-[11px] text-stone-600 block mt-0.5">
                  Termometer minyak stabil di 160°C, kompor 175°C, minyak tidak berbusa/hitam.
                </span>
              </div>
            </div>

            {/* Suhu Warmer */}
            <div
              onClick={() => toggleCheck('suhu_warmer')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                checklist.suhu_warmer ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' : 'bg-red-50/60 border-red-300 text-red-950'
              }`}
            >
              <input type="checkbox" checked={checklist.suhu_warmer} onChange={() => {}} className="mt-0.5 cursor-pointer rounded" />
              <div>
                <strong className="block font-bold">2. Warmer Display (60°C–70°C, Maks 120 Mnt)</strong>
                <span className="text-[11px] text-stone-600 block mt-0.5">
                  Holding time tertulis di tag warmer, produk &gt; 120 menit diafkir ke waste log.
                </span>
              </div>
            </div>

            {/* Suhu Chiller */}
            <div
              onClick={() => toggleCheck('suhu_chiller')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                checklist.suhu_chiller ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' : 'bg-red-50/60 border-red-300 text-red-950'
              }`}
            >
              <input type="checkbox" checked={checklist.suhu_chiller} onChange={() => {}} className="mt-0.5 cursor-pointer rounded" />
              <div>
                <strong className="block font-bold">3. Chiller (0°C–4°C / Indikator Angka 3)</strong>
                <span className="text-[11px] text-stone-600 block mt-0.5">
                  Ayam marinasi & saus tersimpan rapat, suhu tidak melebihi 4°C.
                </span>
              </div>
            </div>

            {/* Suhu Freezer */}
            <div
              onClick={() => toggleCheck('suhu_freezer')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                checklist.suhu_freezer ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' : 'bg-red-50/60 border-red-300 text-red-950'
              }`}
            >
              <input type="checkbox" checked={checklist.suhu_freezer} onChange={() => {}} className="mt-0.5 cursor-pointer rounded" />
              <div>
                <strong className="block font-bold">4. Freezer (Suhu -18°C, Jarak Dinding 16 cm)</strong>
                <span className="text-[11px] text-stone-600 block mt-0.5">
                  Ventilasi sirkulasi udara bebas, jarak bodi minimal 16 cm dari tembok.
                </span>
              </div>
            </div>

            {/* Kepatuhan Seragam Harian */}
            <div
              onClick={() => toggleCheck('seragam_harian')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                checklist.seragam_harian ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' : 'bg-red-50/60 border-red-300 text-red-950'
              }`}
            >
              <input type="checkbox" checked={checklist.seragam_harian} onChange={() => {}} className="mt-0.5 cursor-pointer rounded" />
              <div>
                <strong className="block font-bold">5. Jadwal Seragam Harian & Grooming Kru</strong>
                <span className="text-[11px] text-stone-600 block mt-0.5">
                  Sen–Sel: Merah | Rab–Kam & Min: Kuning #benerandigeprek | Jum–Sab: Batik | Training: Putih.
                </span>
              </div>
            </div>

            {/* Bahan Expired */}
            <div
              onClick={() => toggleCheck('expired_check')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                checklist.expired_check ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' : 'bg-red-50/60 border-red-300 text-red-950'
              }`}
            >
              <input type="checkbox" checked={checklist.expired_check} onChange={() => {}} className="mt-0.5 cursor-pointer rounded" />
              <div>
                <strong className="block font-bold">6. Cek Bahan Mendekati Expired (H-1 s.d H-3)</strong>
                <span className="text-[11px] text-stone-600 block mt-0.5">
                  FIFO & FEFO aktif, bumbu ECO, saus mentai (5 hari), dan sayur segar.
                </span>
              </div>
            </div>

            {/* Upselling Kasir */}
            <div
              onClick={() => toggleCheck('upselling_kasir')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                checklist.upselling_kasir ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' : 'bg-red-50/60 border-red-300 text-red-950'
              }`}
            >
              <input type="checkbox" checked={checklist.upselling_kasir} onChange={() => {}} className="mt-0.5 cursor-pointer rounded" />
              <div>
                <strong className="block font-bold">7. Target Upselling Kasir & Hospitality 5S</strong>
                <span className="text-[11px] text-stone-600 block mt-0.5">
                  Tawarkan telur dadar, extra sauce, es teh jumbo, senyum salam sapa &lt; 3 detik.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Multi-Crew Quick Evaluator & WhatsApp Card Sender */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
            <div>
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <User size={15} className="text-[#8B1418]" />
                <span>Multi-Crew Quick Evaluator ({outletKru.length} Kru Terdata)</span>
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Input cepat skor Praktik SOS (40%), Lisan HACCP (15%), dan Sikap H.A.R.A (25%).
              </p>
            </div>
          </div>

          {outletKru.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
              Belum ada kru terdaftar di gerai {outletCode}.
            </div>
          ) : (
            <div className="space-y-3">
              {outletKru.map(kru => {
                const s = crewScores[kru.id] || {
                  praktikSOS: 88,
                  lisanHACCP: 85,
                  sikapHARA: 90,
                  catatan: '',
                  topikSalah: 'Timer holding warmer dan kontrol gramasi bumbu sambal',
                  expanded: false
                };
                const quickFinal = calculateQuickScore(kru.id);

                return (
                  <div
                    key={kru.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-[#FAF8F5]/60 hover:bg-white transition-all space-y-3"
                  >
                    {/* Header Row: Info Kru & Live Score */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-100 text-[#8B1418] font-bold text-xs flex items-center justify-center shrink-0">
                          {kru.nama_kru.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-stone-900 leading-tight">
                            {kru.nama_kru}
                          </h4>
                          <span className="text-[10px] text-stone-500 font-mono font-bold">
                            Stasiun {kru.divisi} • {kru.kode_outlet}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className={`text-xs font-mono font-black ${
                            quickFinal >= 85 ? 'text-emerald-700' : quickFinal >= 75 ? 'text-blue-700' : 'text-red-700'
                          }`}>
                            {quickFinal}/100
                          </span>
                          <span className="text-[9px] text-stone-400 block font-medium">Indeks 4-Pilar</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpand(kru.id)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                        >
                          {s.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Inputs Row */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
                      <div className="p-2 rounded-lg bg-white border border-stone-200">
                        <span className="text-[9px] text-stone-500 block">Praktik SOS (40%)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={s.praktikSOS}
                          onChange={(e) => handleScoreChange(kru.id, 'praktikSOS', Number(e.target.value))}
                          className="w-14 text-center font-mono font-black text-xs text-stone-900 border border-stone-300 rounded px-1 py-0.5 mt-0.5"
                        />
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-stone-200">
                        <span className="text-[9px] text-stone-500 block">Lisan HACCP (15%)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={s.lisanHACCP}
                          onChange={(e) => handleScoreChange(kru.id, 'lisanHACCP', Number(e.target.value))}
                          className="w-14 text-center font-mono font-black text-xs text-stone-900 border border-stone-300 rounded px-1 py-0.5 mt-0.5"
                        />
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-stone-200">
                        <span className="text-[9px] text-stone-500 block">Sikap HARA (25%)</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={s.sikapHARA}
                          onChange={(e) => handleScoreChange(kru.id, 'sikapHARA', Number(e.target.value))}
                          className="w-14 text-center font-mono font-black text-xs text-stone-900 border border-stone-300 rounded px-1 py-0.5 mt-0.5"
                        />
                      </div>
                    </div>

                    {/* Expanded Detail Inputs & WhatsApp Button */}
                    {s.expanded && (
                      <div className="space-y-2 pt-2 border-t border-stone-200/80 animate-in fade-in">
                        <div>
                          <label className="text-[10px] font-bold text-stone-700 block mb-0.5">
                            Topik SOP yang Masih Salah / Perlu Dibenahi:
                          </label>
                          <input
                            type="text"
                            value={s.topikSalah}
                            onChange={(e) => handleTextChange(kru.id, 'topikSalah', e.target.value)}
                            placeholder="Contoh: Holding warmer >120 mnt, gramasi sambal kurang..."
                            className="w-full text-xs text-stone-800 bg-white border border-stone-300 rounded-lg p-2"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-stone-700 block mb-0.5">
                            Catatan Coaching Cepat Trainer:
                          </label>
                          <input
                            type="text"
                            value={s.catatan}
                            onChange={(e) => handleTextChange(kru.id, 'catatan', e.target.value)}
                            placeholder="Catatan bimbingan shift..."
                            className="w-full text-xs text-stone-800 bg-white border border-stone-300 rounded-lg p-2"
                          />
                        </div>

                        {/* WhatsApp Action Buttons */}
                        <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyWa(kru)}
                            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                          >
                            <Copy size={13} />
                            <span>{copiedKruId === kru.id ? 'Tersalin ke Clipboard!' : 'Salin Kartu Saku WA'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShareWa(kru)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <MessageCircle size={13} />
                            <span>Kirim ke WhatsApp Kru</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
