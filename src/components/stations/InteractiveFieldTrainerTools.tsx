import React, { useState, useEffect } from 'react';
import {
  Scale, Flame, Utensils, AlertTriangle, CheckCircle2, Clock,
  Play, Pause, RotateCcw, ShieldCheck, Sparkles, AlertCircle,
  HelpCircle, ChevronRight, Info, Copy, Check, MessageSquare
} from 'lucide-react';

export const InteractiveFieldTrainerTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'kalkulator' | 'upselling'>('kalkulator');

  // ==========================================================================
  // TOOL 1A: KALKULATOR BERAS MIYAKO & TIMER TANAK
  // ==========================================================================
  const [berasCup, setBerasCup] = useState<3 | 4 | 5 | 6>(4);
  const [riceTimerSeconds, setRiceTimerSeconds] = useState<number>(15 * 60); // 15 menit
  const [isRiceTimerRunning, setIsRiceTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isRiceTimerRunning && riceTimerSeconds > 0) {
      interval = setInterval(() => {
        setRiceTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (riceTimerSeconds === 0 && isRiceTimerRunning) {
      setIsRiceTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRiceTimerRunning, riceTimerSeconds]);

  const BERAS_RATIO_MAP: Record<number, { air: number; porsi: number; maxGasMinutes: number }> = {
    3: { air: 4, porsi: 9, maxGasMinutes: 30 },
    4: { air: 5, porsi: 12, maxGasMinutes: 30 },
    5: { air: 6, porsi: 15, maxGasMinutes: 30 },
    6: { air: 8, porsi: 18, maxGasMinutes: 30 },
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ==========================================================================
  // TOOL 1B: KALKULATOR VERIFIKASI TABUNG GAS LPG
  // ==========================================================================
  const [selectedLpgType, setSelectedLpgType] = useState<'3kg' | '5.5kg' | '12kg'>('3kg');
  const [inputLpgWeight, setInputLpgWeight] = useState<string>('8.0');

  const LPG_SPECS = {
    '3kg': {
      label: 'LPG Melon 3 kg',
      beratKosong: 5.0,
      beratPenuh: 8.0,
      batasMinimal: 7.8,
    },
    '5.5kg': {
      label: 'Bright Gas 5.5 kg',
      beratKosong: 7.1,
      beratPenuh: 12.6,
      batasMinimal: 12.4,
    },
    '12kg': {
      label: 'LPG Biru / Bright Gas 12 kg',
      beratKosong: 15.0,
      beratPenuh: 27.0,
      batasMinimal: 26.8,
    },
  };

  const currentLpgSpec = LPG_SPECS[selectedLpgType];
  const numericWeight = parseFloat(inputLpgWeight) || 0;

  const lpgValidationResult = (() => {
    if (numericWeight <= 0) return { status: 'UNKNOWN', text: 'Masukkan berat timbangan tabung gas.' };
    if (numericWeight >= currentLpgSpec.batasMinimal) {
      return {
        status: 'VALID',
        text: `Tabung VALID & Diterima. Berat ${numericWeight} kg &ge; batas minimal ${currentLpgSpec.batasMinimal} kg. Isi gas riil: ${(numericWeight - currentLpgSpec.beratKosong).toFixed(1)} kg.`,
        color: 'bg-emerald-50 text-emerald-800 border-emerald-300'
      };
    } else if (numericWeight < currentLpgSpec.beratKosong) {
      return {
        status: 'KRITIS',
        text: `Tabung RUSAK / KOSONG! Berat ${numericWeight} kg lebih ringan dari berat tabung kosong (${currentLpgSpec.beratKosong} kg). Tolak pengiriman!`,
        color: 'bg-rose-50 text-rose-800 border-rose-300'
      };
    } else {
      return {
        status: 'REJECT',
        text: `Tabung DIBAWAH STANDAR (KURANG ISI)! Berat ${numericWeight} kg &lt; batas minimal ${currentLpgSpec.batasMinimal} kg. Kurang ${(currentLpgSpec.batasMinimal - numericWeight).toFixed(2)} kg. Tolak & minta penggantian ke vendor!`,
        color: 'bg-rose-50 text-rose-800 border-rose-300'
      };
    }
  })();

  // ==========================================================================
  // TOOL 1C: PANDUAN SENDOK UKUR, TIMBANGAN DIGITAL & 4 LAP RESMI HARA
  // ==========================================================================
  const MEASURING_SPOONS = [
    { size: '15 ml', name: '1 Sendok Makan (1 tbsp)', usage: 'Minyak tumis nasgor (15ml), kecap manis, larutan saus pekat' },
    { size: '7.5 ml', name: '1/2 Sendok Makan', usage: 'Minyak bawang, saus sambal racikan, ekstra bumbu cair' },
    { size: '5 ml', name: '1 Sendok Teh (1 tsp)', usage: 'Garam halus, kaldu bubuk, ekstrak vanili, perasan jeruk' },
    { size: '2.5 ml', name: '1/2 Sendok Teh', usage: 'Lada putih bubuk, baking powder bumbu crispy, pewarna alami' },
    { size: '1 ml', name: '1/4 Sendok Teh', usage: 'Bumbu rempah konsentrat tajam, penguat rasa rahasia RnD' },
  ];

  const SCALES_GUIDE = [
    { type: '5 kg (Presisi 1g)', location: 'Meja Assembly & Kasir', usage: 'Menimbang Nasi 170g, Bumbu ECO 20g, Sambal 30g, Mix Sayur 30g, Saus Mentai 40g.' },
    { type: '40 kg (Presisi 10g)', location: 'Area Receiving / Chiller', usage: 'Menimbang ayam karkas utuh per keranjang (900-1000g per ekor), beras karungan, sayuran segar.' },
    { type: '150 kg (Floor Scale)', location: 'Gudang Utama & Gas Storage', usage: 'Menimbang tabung gas 12kg, karung beras 50kg, minyak goreng jerigen 18L, es kristal.' },
  ];

  const FOUR_HARA_CLOTHS = [
    {
      color: 'Kanebo Khusus Piring',
      hex: '#FBBF24',
      badge: 'PIRING & SERVING',
      desc: 'Hanya digunakan untuk mengeringkan dan menyeka piring melamin, mangkuk sup, dan wadah saji bersih dari droplet air.'
    },
    {
      color: 'Lap Meja Orange Serat',
      hex: '#EA580C',
      badge: 'MEJA MAKAN & ETALASE',
      desc: 'Khusus menyeka meja makan pelanggan, area etalase display warmer, dan meja kasir. Wajib dibilas sanitizer teratur.'
    },
    {
      color: 'Lap Basah Kotak-kotak',
      hex: '#2563EB',
      badge: 'STASIUN KERJA & CIPRATAN',
      desc: 'Digunakan untuk membersihkan cipratan minyak di meja kompor, tumpahan kuah, dan area kotor di dapur basah.'
    },
    {
      color: 'Lap Kering Kotak-kotak',
      hex: '#16A34A',
      badge: 'TANGAN & HANDLE BERSIH',
      desc: 'Khusus mengeringkan tangan kru setelah cuci tangan 6 langkah, atau mengelap gagang pintu chiller dan handle bersih.'
    },
  ];

  // ==========================================================================
  // TOOL 2: ASISTEN SISA BAHAN MATANG & TARGET UPSELLING NEAR-EXPIRED
  // ==========================================================================
  const [selectedExpWindow, setSelectedExpWindow] = useState<'H-1' | 'H-2' | 'H-3'>('H-1');
  const [selectedNearExpItem, setSelectedNearExpItem] = useState<string>('Bayam Crispy (Spinach)');
  const [customItemQty, setCustomItemQty] = useState<number>(8);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const UPSELLING_ITEMS: Record<string, { price: string; promoTag: string; scriptDineIn: string; scriptOnline: string }> = {
    'Bayam Crispy (Spinach)': {
      price: 'Rp 6.000',
      promoTag: 'Best Side Dish Renyah',
      scriptDineIn: 'Kak, ayam gepreknya lebih nampol kalau ditambah Bayam Crispy gurih renyah khas HARA. Mau sekalian dicoba kak, cuma tambah Rp 6.000 saja?',
      scriptOnline: 'Promo Bundling Renyah: Tambah Spinach Crispy HARA hanya +Rp 6.000!'
    },
    'Scramble Egg Fluffy': {
      price: 'Rp 5.000',
      promoTag: 'Extra Protein Creamy',
      scriptDineIn: 'Kak, mau ditambah Scramble Egg lembut gurih di atas nasinya? Rasanya creamy banget dipadukan sambal bawang pedas, cuma Rp 5.000 kak.',
      scriptOnline: 'Top Up Telur Lembut HARA hanya Rp 5.000 hemat dan bergizi!'
    },
    'Teh Manis Segar Jumbo': {
      price: 'Rp 4.000',
      promoTag: 'Pereda Pedas Signature',
      scriptDineIn: 'Untuk minumnya mau Teh Manis Segar dingin jumbo kak? Segar banget untuk meredakan pedasnya sambal bawang HARA!',
      scriptOnline: 'Pereda Pedas: Teh Manis Dingin Segar HARA Rp 4.000.'
    },
    'Terong Goreng Manis': {
      price: 'Rp 5.000',
      promoTag: 'Lalapan Gurih Manis',
      scriptDineIn: 'Mau pelengkap Terong Goreng Manis yang renyah di luar dan lembut di dalam kak? Pas banget dicocol bareng sambal geprek.',
      scriptOnline: 'Add-on Terong Goreng Manis HARA Rp 5.000.'
    },
    'Indomie Racikan Geprek': {
      price: 'Rp 8.000',
      promoTag: 'Karbo Gurih Mantap',
      scriptDineIn: 'Ayam gepreknya mau dipadukan Indomie racikan bumbu khas HARA kak? Teksturnya kenyal gurih bikin makin kenyang mantap!',
      scriptOnline: 'Upgrade Nasi ke Indomie Geprek HARA hanya +Rp 4.000!'
    }
  };

  const currentUpsellingData = UPSELLING_ITEMS[selectedNearExpItem] || UPSELLING_ITEMS['Bayam Crispy (Spinach)'];

  const copyScriptToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="bg-white border border-[#E6E1DA] rounded-2xl p-6 shadow-[0_2px_10px_-2px_rgba(24,20,17,0.04)] space-y-6">
      {/* Header Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E1DA] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#96171B] border border-[#FECACA]">
              HC-SOP-11-PKP RESMI
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Interactive Field Trainer Tools
            </span>
          </div>
          <h3 className="text-lg font-bold font-['Outfit'] text-[#181411]">
            Tools Operasional Dapur, Kalibrasi & Asisten Upselling
          </h3>
          <p className="text-xs text-stone-500 font-['Plus_Jakarta_Sans']">
            Kalkulator takaran air beras Miyako, validasi tabung gas LPG, panduan 4 lap warna, serta skrip kasir upselling bahan near-expired.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-[#F4F1EC] p-1.5 rounded-xl border border-[#E6E1DA]">
          <button
            onClick={() => setActiveTool('kalkulator')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold font-['Outfit'] transition-all flex items-center gap-1.5 ${
              activeTool === 'kalkulator'
                ? 'bg-[#96171B] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Scale size={14} />
            1. Kalkulator & Kalibrasi
          </button>
          <button
            onClick={() => setActiveTool('upselling')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold font-['Outfit'] transition-all flex items-center gap-1.5 ${
              activeTool === 'upselling'
                ? 'bg-[#96171B] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <MessageSquare size={14} />
            2. Asisten Sisa Bahan & Upselling
          </button>
        </div>
      </div>

      {/* ===================================================================
          TOOL 1: KALKULATOR DAPUR & KALIBRASI HARA
          =================================================================== */}
      {activeTool === 'kalkulator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SUB-TOOL 1A: KALKULATOR BERAS MIYAKO & TIMER TANAK */}
            <div className="bg-[#FAF8F5] border border-[#E6E1DA] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#96171B]">
                    <Utensils size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-['Outfit'] text-[#181411]">
                      Kalkulator Beras Miyako / Gas
                    </h4>
                    <span className="text-[10px] font-semibold text-stone-500 font-mono">
                      HC-SOP-11-PKP Hal. 8
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Target Saji: 170g / Porsi
                </span>
              </div>

              {/* Selector Cup Beras */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Pilih Takaran Cup Beras:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 4, 5, 6].map((cup) => (
                    <button
                      key={cup}
                      type="button"
                      onClick={() => setBerasCup(cup as 3 | 4 | 5 | 6)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        berasCup === cup
                          ? 'bg-[#96171B] text-white border-[#96171B] shadow-xs'
                          : 'bg-white text-stone-700 border-[#E6E1DA] hover:bg-stone-50'
                      }`}
                    >
                      {cup} Cup Beras
                    </button>
                  ))}
                </div>
              </div>

              {/* Hasil Kalkulasi Air Baku & Porsi */}
              <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-[#E6E1DA]">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Takaran Air Baku:
                  </span>
                  <div className="text-2xl font-extrabold font-['JetBrains_Mono'] text-[#96171B] mt-0.5">
                    {BERAS_RATIO_MAP[berasCup].air} Cup Air
                  </div>
                  <span className="text-[10px] text-stone-500">Rasio pulen pas standar HARA</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Estimasi Hasil Jadi:
                  </span>
                  <div className="text-2xl font-extrabold font-['JetBrains_Mono'] text-stone-800 mt-0.5">
                    ± {BERAS_RATIO_MAP[berasCup].porsi} Porsi
                  </div>
                  <span className="text-[10px] text-stone-500">170g timbang per piring</span>
                </div>
              </div>

              {/* Timer Tanak 15 Menit */}
              <div className="bg-stone-900 text-white p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-['Outfit'] flex items-center gap-1.5 text-amber-400">
                    <Clock size={14} />
                    Timer Tanak 15 Menit Pasca 'Jegleg' / Warm:
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    Maks 30 mnt di gas
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-3xl font-extrabold font-['JetBrains_Mono'] text-white tracking-tight tabular-nums">
                    {formatTime(riceTimerSeconds)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsRiceTimerRunning(!isRiceTimerRunning)}
                      className="px-3 py-1.5 rounded-lg bg-[#96171B] hover:bg-[#7A1215] text-white text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      {isRiceTimerRunning ? <Pause size={13} /> : <Play size={13} />}
                      {isRiceTimerRunning ? 'Jeda' : 'Mulai'}
                    </button>
                    <button
                      onClick={() => {
                        setIsRiceTimerRunning(false);
                        setRiceTimerSeconds(15 * 60);
                      }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                      title="Reset 15 Menit"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-stone-400 leading-tight">
                  Aturan Baku: Setelah tombol cooker berpindah ke Warm, diamkan tertutup rapat 15 menit agar uap air merata dan nasi pulen sempurna tanpa berkerak.
                </p>
              </div>
            </div>

            {/* SUB-TOOL 1B: KALKULATOR VERIFIKASI TABUNG GAS LPG */}
            <div className="bg-[#FAF8F5] border border-[#E6E1DA] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <Flame size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-['Outfit'] text-[#181411]">
                      Kalkulator Verifikasi Tabung Gas LPG
                    </h4>
                    <span className="text-[10px] font-semibold text-stone-500 font-mono">
                      Validasi Receiving Gudang & K3
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Audit Berat Timbangan
                </span>
              </div>

              {/* Selector Jenis Tabung */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Pilih Ukuran Tabung Gas:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['3kg', '5.5kg', '12kg'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setSelectedLpgType(t);
                        setInputLpgWeight(LPG_SPECS[t].beratPenuh.toFixed(1));
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedLpgType === t
                          ? 'bg-[#96171B] text-white border-[#96171B] shadow-xs'
                          : 'bg-white text-stone-700 border-[#E6E1DA] hover:bg-stone-50'
                      }`}
                    >
                      {LPG_SPECS[t].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Berat Datang & Standar Acuan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#E6E1DA]">
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Berat Timbangan Datang (kg):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputLpgWeight}
                    onChange={(e) => setInputLpgWeight(e.target.value)}
                    className="w-full text-xl font-extrabold font-['JetBrains_Mono'] text-[#181411] bg-[#FAF8F5] border border-[#E6E1DA] rounded-lg px-3 py-1.5 outline-none focus:border-[#96171B]"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">Timbang di floor scale saat drop</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E6E1DA] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Berat Kosong:</span>
                    <span className="font-bold font-['JetBrains_Mono']">{currentLpgSpec.beratKosong} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Berat Penuh Ideal:</span>
                    <span className="font-bold font-['JetBrains_Mono']">{currentLpgSpec.beratPenuh} kg</span>
                  </div>
                  <div className="flex justify-between text-[#96171B]">
                    <span className="font-bold">Batas Minimal Diterima:</span>
                    <span className="font-bold font-['JetBrains_Mono']">{currentLpgSpec.batasMinimal} kg</span>
                  </div>
                </div>
              </div>

              {/* Status Validasi Tabung */}
              <div
                className={`p-3.5 rounded-xl border text-xs font-semibold leading-relaxed ${lpgValidationResult.color}`}
                dangerouslySetInnerHTML={{ __html: lpgValidationResult.text }}
              />
            </div>
          </div>

          {/* SUB-TOOL 1C: PANDUAN INTERAKTIF SENDOK UKUR, TIMBANGAN DIGITAL & 4 LAP RESMI */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-[#E6E1DA]">
            {/* 5 Sendok Ukur */}
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-4.5 space-y-3">
              <div className="flex items-center gap-2">
                <Utensils size={16} className="text-[#96171B]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#181411]">
                  5 Sendok Ukur Resmi HARA
                </h4>
              </div>
              <p className="text-[11px] text-stone-500">
                Wajib digunakan di station masak untuk menakar minyak, saus, dan bumbu halus tanpa perkiraan:
              </p>
              <div className="space-y-2">
                {MEASURING_SPOONS.map((sp, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#96171B] font-['JetBrains_Mono']">{sp.size}</span>
                      <span className="text-stone-800 text-[11px]">{sp.name}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-0.5">{sp.usage}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3 Timbangan Digital */}
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-4.5 space-y-3">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-sky-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#181411]">
                  3 Timbangan Digital Dapur
                </h4>
              </div>
              <p className="text-[11px] text-stone-500">
                Kalibrasi setiap pagi sebelum operasional shift 1 dimulai:
              </p>
              <div className="space-y-2">
                {SCALES_GUIDE.map((sc, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] text-xs">
                    <div className="font-bold text-sky-800 font-['JetBrains_Mono']">{sc.type}</div>
                    <div className="text-[11px] font-semibold text-stone-700 mt-0.5">{sc.location}</div>
                    <p className="text-[10px] text-stone-500 mt-0.5">{sc.usage}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Lap Resmi HARA */}
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-4.5 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-700" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#181411]">
                  4 Jenis Lap Resmi HARA
                </h4>
              </div>
              <p className="text-[11px] text-stone-500">
                Pencegahan kontaminasi silang (cross-contamination) mutlak:
              </p>
              <div className="space-y-2">
                {FOUR_HARA_CLOTHS.map((lap, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] text-xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-[#181411] text-[11px] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lap.hex }} />
                        {lap.color}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-white border border-stone-200">
                        {lap.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-600 leading-tight">{lap.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TOOL 2: ASISTEN SISA BAHAN MATANG & TARGET UPSELLING NEAR-EXPIRED
          =================================================================== */}
      {activeTool === 'upselling' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KIRI: FORM SELEKSI SISA BAHAN & GENERATOR SKRIP KASIR */}
            <div className="bg-[#FAF8F5] border border-[#E6E1DA] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#96171B]">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-['Outfit'] text-[#181411]">
                      Generator Skrip Upselling Kasir
                    </h4>
                    <span className="text-[10px] font-semibold text-stone-500 font-mono">
                      Target Produk Near-Expired (H-1 s.d. H-3)
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#96171B] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                  Zero Waste Strategy
                </span>
              </div>

              {/* Expired Window Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Pilih Masa Kedaluwarsa Bahan:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['H-1', 'H-2', 'H-3'] as const).map((win) => (
                    <button
                      key={win}
                      type="button"
                      onClick={() => setSelectedExpWindow(win)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        selectedExpWindow === win
                          ? 'bg-[#96171B] text-white border-[#96171B] shadow-xs'
                          : 'bg-white text-stone-700 border-[#E6E1DA] hover:bg-stone-50'
                      }`}
                    >
                      {win === 'H-1' ? 'H-1 (Kritis / Hari Ini)' : win === 'H-2' ? 'H-2 (Besok)' : 'H-3 (2 Hari Lagi)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Produk Sisa Bahan Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Produk Bahan Target:
                  </label>
                  <select
                    value={selectedNearExpItem}
                    onChange={(e) => setSelectedNearExpItem(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-[#E6E1DA] rounded-xl px-3 py-2 text-[#181411] outline-none focus:border-[#96171B]"
                  >
                    {Object.keys(UPSELLING_ITEMS).map((k) => (
                      <option key={k} value={k}>
                        {k} ({UPSELLING_ITEMS[k].price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Sisa Stok Prep (Porsi):
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={customItemQty}
                    onChange={(e) => setCustomItemQty(Number(e.target.value))}
                    className="w-full text-xs font-bold font-['JetBrains_Mono'] bg-white border border-[#E6E1DA] rounded-xl px-3 py-2 text-[#181411] outline-none focus:border-[#96171B]"
                  />
                </div>
              </div>

              {/* Skrip Rekomendasi Kasir Dine-In */}
              <div className="bg-white p-4 rounded-xl border border-[#E6E1DA] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#96171B] flex items-center gap-1.5 font-['Outfit']">
                    <MessageSquare size={14} />
                    Skrip Kasir: Layanan Tatap Muka (Dine-In / Take-Away)
                  </span>
                  <button
                    onClick={() => copyScriptToClipboard(currentUpsellingData.scriptDineIn)}
                    className="text-[11px] text-stone-600 hover:text-[#96171B] flex items-center gap-1 font-semibold"
                  >
                    {copiedScript ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    {copiedScript ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
                <p className="text-xs text-stone-800 bg-[#FAF8F5] p-3 rounded-lg border border-dashed border-[#E6E1DA] italic leading-relaxed">
                  "{currentUpsellingData.scriptDineIn}"
                </p>
                <div className="text-[11px] text-stone-500 flex items-center justify-between">
                  <span>Target Penjualan Kasir Hari Ini:</span>
                  <span className="font-bold text-[#96171B] font-['JetBrains_Mono']">{customItemQty} Porsi Habis</span>
                </div>
              </div>
            </div>

            {/* KANAN: PANDUAN PEMISAHAN SISA BAHAN MATANG (WAJIB DITARIK VS BOLEH DISIMPAN) */}
            <div className="bg-white border border-[#E6E1DA] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold font-['Outfit'] text-[#181411]">
                    Standar Pemisahan Sisa Bahan Matang Closing
                  </h4>
                  <span className="text-[10px] font-semibold text-stone-500 font-mono">
                    HC-SOP-11-PKP Hal. 15 · Kebijakan Closing Shift
                  </span>
                </div>
                <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Audit Food Safety
                </span>
              </div>

              {/* Kategori 1: WAJIB DITARIK / DILARANG DIJUAL BESOK */}
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle size={15} className="text-rose-600" />
                  <span>WAJIB DITARIK / DILARANG DIJUAL BESOK (EXPIRED):</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Bahan matang berikut sangat rentan basi, asam, berlendir, atau berisiko keracunan makanan jika disimpan semalaman:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Ayam Goreng Krispi', 'Tempe Goreng', 'Tahu Goreng', 'Jamur Enoki', 'Terong Goreng', 'Sup Kaldu Ayam'].map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-bold bg-white text-rose-800 border border-rose-300 px-2.5 py-1 rounded-lg shadow-xs"
                    >
                      ✕ {item}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-rose-700/90 italic pt-1">
                  Tindakan: Timbang berat sisa, catat di Form Waste Closing, dan buang ke tempat sampah tertutup bersegel.
                </p>
              </div>

              {/* Kategori 2: BOLEH DISIMPAN CHILLER 1-4°C */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>BOLEH DISIMPAN CHILLER (1°C - 4°C DENGAN SYARAT):</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Bahan berikut aman disimpan maksimal 24 jam ke depan dengan wadah kedap udara bertutup dan berlabel tanggal:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { name: 'Spinach (Bayam Kering)', cond: 'Toples Kedap Udara' },
                    { name: 'Orange Sunkist', cond: 'Chiller 1-4°C' },
                    { name: 'Scramble Egg (Mentah/Adonan)', cond: 'Chiller 1-4°C' },
                    { name: 'Biang Teh Manis', cond: 'Dispenser Tertutup Maks 12 Jam' }
                  ].map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-bold bg-white text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg shadow-xs"
                    >
                      ✓ {item.name} <span className="text-[10px] text-stone-500 font-normal">({item.cond})</span>
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-emerald-700/90 italic pt-1">
                  Tindakan: Tempel stiker QC HARA berisikan Jam Simpan, Petugas Closing, dan Tanggal Batas Buang.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
