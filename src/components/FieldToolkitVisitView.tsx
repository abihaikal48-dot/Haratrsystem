import React, { useState, useMemo } from 'react';
import {
  Thermometer, Clock, AlertTriangle, CheckCircle2,
  Calculator, Printer, Flame, Utensils, Save,
  Plus, Trash2, Sparkles, Scale, FileText, Store,
  Users, Check, RefreshCw
} from 'lucide-react';
import { db } from '../lib/storage';
import { Outlet, Kru, PenilaianPraktikOnboardingProduk, Division } from '../types';
import { SOP_PRODUCTS_LIST } from './trainer/OnboardingProductPracticeView';
import { PageHeaderBanner } from './PageHeaderBanner';
import confetti from 'canvas-confetti';

interface FieldToolkitVisitViewProps {
  selectedOutletCode: string;
  onSelectOutletCode?: (code: string) => void;
}

interface NearExpiredItem {
  id: string;
  namaBahan: string;
  tglExpired: string;
  jamHolding: string;
  sisaStok: string;
  tindakan: 'Segera Olah (FIFO)' | 'Karantina / Retur' | 'Musnahkan (Waste)';
}

export const FieldToolkitVisitView: React.FC<FieldToolkitVisitViewProps> = ({
  selectedOutletCode,
  onSelectOutletCode,
}) => {
  const outlets = useMemo(() => db.getTable<Outlet>('outlets'), []);
  const allKru = useMemo(() => db.getTable<Kru>('kru').filter(k => k.status_aktif === 'Aktif'), []);

  // Outlet State
  const [activeOutletCode, setActiveOutletCode] = useState<string>(
    selectedOutletCode && selectedOutletCode !== 'ALL' ? selectedOutletCode : (outlets[0]?.kode_outlet || 'HC-JTS01')
  );

  const activeOutletObj = useMemo(() => {
    return outlets.find(o => o.kode_outlet === activeOutletCode) || outlets[0];
  }, [outlets, activeOutletCode]);

  // Kru of this outlet
  const outletKruList = useMemo(() => {
    return allKru.filter(k => k.kode_outlet === activeOutletCode);
  }, [allKru, activeOutletCode]);

  // 1. CHECKLIST CEPAT SUHU OUTLET
  const [suhuFryer1, setSuhuFryer1] = useState<number>(160);
  const [suhuFryer2, setSuhuFryer2] = useState<number>(150);
  const [suhuWarmer, setSuhuWarmer] = useState<number>(68);
  const [suhuChiller, setSuhuChiller] = useState<number>(3);
  const [suhuFreezer, setSuhuFreezer] = useState<number>(-19);

  // 2. STOK NEAR-EXPIRED & HOLDING TIME
  const [nearExpiredList, setNearExpiredList] = useState<NearExpiredItem[]>([
    { id: 'ne-1', namaBahan: 'Ayam Marinasi Batch 1', tglExpired: new Date().toISOString().split('T')[0], jamHolding: '14:00', sisaStok: '8 Ekor', tindakan: 'Segera Olah (FIFO)' },
    { id: 'ne-2', namaBahan: 'Bumbu Nashville Glaze', tglExpired: new Date(Date.now() + 86400000).toISOString().split('T')[0], jamHolding: '21:00', sisaStok: '1.2 Kg', tindakan: 'Segera Olah (FIFO)' },
  ]);
  const [newBahanNama, setNewBahanNama] = useState('');
  const [newBahanStok, setNewBahanStok] = useState('');

  // 3. PENILAIAN CEPAT / RETRAINING KRU (KKM 75)
  const [selectedKruId, setSelectedKruId] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('Goreng Ayam');
  const [skorKetepatan, setSkorKetepatan] = useState<number>(85); // 20%
  const [skorLangkahSOP, setSkorLangkahSOP] = useState<number>(85); // 20%
  const [skorKecepatan, setSkorKecepatan] = useState<number>(85); // 15%
  const [skorKnowledge, setSkorKnowledge] = useState<number>(85); // 15%
  const [skorKerjasama, setSkorKerjasama] = useState<number>(85); // 10%
  const [skorKebersihan, setSkorKebersihan] = useState<number>(85); // 10%
  const [skorKeaktifan, setSkorKeaktifan] = useState<number>(85); // 10%
  const [suhuProbeMinyak, setSuhuProbeMinyak] = useState<number>(160);
  const [catatanRetraining, setCatatanRetraining] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Target product meta
  const currentProductMeta = useMemo(() => {
    return SOP_PRODUCTS_LIST.find(p => p.nama === selectedProduct) || SOP_PRODUCTS_LIST[0];
  }, [selectedProduct]);

  // Skor Komposit 7 Kriteria (KKM 75)
  const skorAkhirRetraining = useMemo(() => {
    const raw = (skorKetepatan * 0.20) +
      (skorLangkahSOP * 0.20) +
      (skorKecepatan * 0.15) +
      (skorKnowledge * 0.15) +
      (skorKerjasama * 0.10) +
      (skorKebersihan * 0.10) +
      (skorKeaktifan * 0.10);
    return Number(raw.toFixed(1));
  }, [skorKetepatan, skorLangkahSOP, skorKecepatan, skorKnowledge, skorKerjasama, skorKebersihan, skorKeaktifan]);

  const isLulus = skorAkhirRetraining >= 75;

  // 4. KALKULATOR BERAS MIYAKO & GAS LPG
  const [cupBerasInput, setCupBerasInput] = useState<number>(6); // Maks 6 cup Miyako
  const [jamOperasiFryerInput, setJamOperasiFryerInput] = useState<number>(10); // Jam per hari
  const [tipeTabungGas, setTipeTabungGas] = useState<'12kg' | '3kg'>('12kg');

  // Miyako Math:
  // Standar: 6 cup beras Miyako = 8 cup air baku
  // 1 cup beras mentah ~ 150g -> 6 cup = 900g beras mentah -> ~1800g nasi matang
  // 1 porsi nasi standar HARA = 170g timbang
  // Porsi matang: (cupBerasInput * 150 * 2) / 170
  const kalkulasiBeras = useMemo(() => {
    const safeCups = Math.min(6, Math.max(1, cupBerasInput));
    const airCup = safeCups <= 6 ? safeCups + (safeCups === 6 ? 2 : safeCups === 5 ? 1.5 : 1) : 8;
    const gramNasiMatang = safeCups * 150 * 2.1;
    const porsiStandar170g = Math.floor(gramNasiMatang / 170);
    return {
      safeCups,
      airCup,
      gramNasiMatang: Math.round(gramNasiMatang),
      porsiStandar170g,
      waktuMasakMenit: 35,
      waktuRestingMenit: 15, // Wajib 15 menit pasca jegleg
    };
  }, [cupBerasInput]);

  // Gas LPG Math:
  // Kompor deep fryer komersial 1 tank rata-rata konsumsi gas 0.45 kg LPG per jam
  const kalkulasiLPG = useMemo(() => {
    const konsumsiKgPerJam = 0.48;
    const kgPerHari = Number((jamOperasiFryerInput * konsumsiKgPerJam).toFixed(2));
    const kapasitasTabung = tipeTabungGas === '12kg' ? 12 : 3;
    const umurTabungHari = Number((kapasitasTabung / Math.max(0.1, kgPerHari)).toFixed(1));
    const frekuensiFilterMinyak = jamOperasiFryerInput >= 8 ? '2x per hari (Tengah Shift & Closing)' : '1x per hari (Closing)';
    return {
      kgPerHari,
      umurTabungHari,
      frekuensiFilterMinyak,
    };
  }, [jamOperasiFryerInput, tipeTabungGas]);

  // Handle Save Quick Retraining Evaluation
  const handleSaveRetraining = (e: React.FormEvent) => {
    e.preventDefault();
    const kruObj = outletKruList.find(k => k.id === selectedKruId) || outletKruList[0] || allKru[0];
    if (!kruObj) {
      alert('Pilih kru cabang terlebih dahulu!');
      return;
    }

    const newRecord: PenilaianPraktikOnboardingProduk = {
      id: 'visit-eval-' + Date.now(),
      tanggal: new Date().toISOString().split('T')[0],
      kru_id: kruObj.id,
      nama_kru: kruObj.nama_kru,
      kode_outlet: activeOutletCode,
      nama_outlet: activeOutletObj.nama_outlet,
      divisi: kruObj.divisi || 'Kitchen',
      produk_nama: selectedProduct,
      kode_sop: currentProductMeta.kode,
      skor_ketepatan: skorKetepatan,
      skor_langkah_sop: skorLangkahSOP,
      skor_kecepatan: skorKecepatan,
      skor_knowledge: skorKnowledge,
      skor_kerjasama: skorKerjasama,
      skor_kebersihan: skorKebersihan,
      skor_keaktifan: skorKeaktifan,
      suhu_minyak_probe: currentProductMeta.isDeepFryer ? suhuProbeMinyak : undefined,
      durasi_detik: currentProductMeta.stdDetik,
      standar_durasi_detik: currentProductMeta.stdDetik,
      skor_akhir: skorAkhirRetraining,
      status_kelulusan: isLulus ? 'Lulus Kompeten' : 'Remedial Terbimbing',
      checklist_langkah: [
        { nomor: 1, langkah: 'Verifikasi timbangan ZERO/TARE bahan baku', tercapai: skorKetepatan >= 75 },
        { nomor: 2, langkah: 'Penyelarasan suhu & waktu masak baku', tercapai: skorLangkahSOP >= 75 },
        { nomor: 3, langkah: 'Higienitas lap & sanitasi stasiun kerja', tercapai: skorKebersihan >= 75 },
      ],
      catatan_trainer: catatanRetraining || `Retraining kunjungan lapangan outlet ${activeOutletObj.nama_outlet}: Skor ${skorAkhirRetraining} (${isLulus ? 'Lulus KKM 75' : 'Remedial Wajib Bimbingan'}).`,
      nama_trainer: 'Trainer Lapangan HARA',
      created_at: new Date().toISOString(),
    };

    db.savePenilaianPraktikProduk(newRecord);

    if (isLulus) {
      confetti({ particleCount: 50, spread: 60 });
    }

    setSaveSuccessMsg(`Hasil retraining kru ${kruObj.nama_kru} (${selectedProduct}) berhasil disimpan dan disinkronkan ke Cloud.`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // 5. CETAK BERITA ACARA VISIT
  const handlePrintBeritaAcara = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <PageHeaderBanner
        category="SUPERVISI LAPANGAN"
        title="Asisten Kunjungan Outlet (Field Toolkit)"
        description="Satu halaman ringkas instrumen visit Trainer: Checklist Cepat Suhu & Stok Near-Expired, Penilaian Cepat Retraining Kru (KKM 75), Kalkulator Beras Miyako & Gas LPG, serta Cetak Berita Acara Visit."
        icon={<Store size={22} />}
        rightElement={
          <div className="flex items-center gap-2">
            <select
              value={activeOutletCode}
              onChange={(e) => {
                setActiveOutletCode(e.target.value);
                if (onSelectOutletCode) onSelectOutletCode(e.target.value);
              }}
              className="input-enterprise !py-1.5 text-xs font-bold bg-white"
            >
              {outlets.map((o) => (
                <option key={o.kode_outlet} value={o.kode_outlet}>
                  {o.nama_outlet} ({o.kode_outlet})
                </option>
              ))}
            </select>
            <button
              onClick={handlePrintBeritaAcara}
              className="btn-primary-enterprise !py-1.5 !px-3 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <Printer size={13} />
              <span>Cetak Berita Acara Visit</span>
            </button>
          </div>
        }
      />

      {/* =========================================================================
          SECTION 1: CHECKLIST CEPAT SUHU & STOK NEAR-EXPIRED
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left (6 cols): Quick Temperature Monitoring */}
        <div className="lg:col-span-6 card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <Thermometer size={16} className="text-rose-600" />
                <span>Checklist Cepat Suhu Kritis Outlet</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Pemeriksaan instan parameter suhu deep fryer, warmer display, chiller & freezer.
              </p>
            </div>
            <span className="text-[10px] bg-slate-100 font-extrabold px-2 py-0.5 rounded text-slate-600">
              HACCP Standard
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {/* Deep Fryer 1 */}
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
              <span className="text-[10px] text-amber-900 font-bold block">Deep Fryer 1 (Ayam)</span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={suhuFryer1}
                  onChange={(e) => setSuhuFryer1(Number(e.target.value))}
                  className="font-mono font-bold text-base w-16 bg-white border border-amber-300 rounded px-1.5 py-0.5"
                />
                <span className="font-bold text-slate-700">°C</span>
              </div>
              <span className={`text-[10px] font-bold block ${Math.abs(suhuFryer1 - 160) <= 5 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {Math.abs(suhuFryer1 - 160) <= 5 ? '✓ Ideal (160°C)' : 'Std: 160°C'}
              </span>
            </div>

            {/* Deep Fryer 2 */}
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
              <span className="text-[10px] text-amber-900 font-bold block">Deep Fryer 2 (Kulit/AU)</span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={suhuFryer2}
                  onChange={(e) => setSuhuFryer2(Number(e.target.value))}
                  className="font-mono font-bold text-base w-16 bg-white border border-amber-300 rounded px-1.5 py-0.5"
                />
                <span className="font-bold text-slate-700">°C</span>
              </div>
              <span className={`text-[10px] font-bold block ${Math.abs(suhuFryer2 - 150) <= 5 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {Math.abs(suhuFryer2 - 150) <= 5 ? '✓ Ideal (150°C)' : 'Std: 150°C'}
              </span>
            </div>

            {/* Warmer Display */}
            <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-1">
              <span className="text-[10px] text-orange-900 font-bold block">Warmer Display</span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={suhuWarmer}
                  onChange={(e) => setSuhuWarmer(Number(e.target.value))}
                  className="font-mono font-bold text-base w-16 bg-white border border-orange-300 rounded px-1.5 py-0.5"
                />
                <span className="font-bold text-slate-700">°C</span>
              </div>
              <span className={`text-[10px] font-bold block ${suhuWarmer >= 65 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {suhuWarmer >= 65 ? '✓ Aman (>=65°C)' : 'Kritis (<65°C)'}
              </span>
            </div>

            {/* Chiller Sayur & Sambal */}
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1">
              <span className="text-[10px] text-blue-900 font-bold block">Chiller (1-4°C)</span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={suhuChiller}
                  onChange={(e) => setSuhuChiller(Number(e.target.value))}
                  className="font-mono font-bold text-base w-16 bg-white border border-blue-300 rounded px-1.5 py-0.5"
                />
                <span className="font-bold text-slate-700">°C</span>
              </div>
              <span className={`text-[10px] font-bold block ${suhuChiller >= 1 && suhuChiller <= 4 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {suhuChiller >= 1 && suhuChiller <= 4 ? '✓ Standar Segar' : 'Periksa Termostat'}
              </span>
            </div>

            {/* Freezer Ayam Beku */}
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-1">
              <span className="text-[10px] text-indigo-900 font-bold block">Freezer (&lt;=-18°C)</span>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  value={suhuFreezer}
                  onChange={(e) => setSuhuFreezer(Number(e.target.value))}
                  className="font-mono font-bold text-base w-16 bg-white border border-indigo-300 rounded px-1.5 py-0.5"
                />
                <span className="font-bold text-slate-700">°C</span>
              </div>
              <span className={`text-[10px] font-bold block ${suhuFreezer <= -18 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {suhuFreezer <= -18 ? '✓ Beku Sempurna' : 'Bahaya Thawing'}
              </span>
            </div>
          </div>
        </div>

        {/* Right (6 cols): Near-Expired Stock & Holding Time */}
        <div className="lg:col-span-6 card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-600" />
                <span>Monitoring Stok Kritis & Near-Expired (FIFO)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Pencatatan sisa holding time dan batas kadaluwarsa bahan baku di outlet.
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {nearExpiredList.map((item) => (
              <div key={item.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900">{item.namaBahan}</span>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2">
                    <span>Sisa: <b>{item.sisaStok}</b></span>
                    <span>•</span>
                    <span>Batas Jam: <b>{item.jamHolding}</b></span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900">
                    {item.tindakan}
                  </span>
                  <button
                    onClick={() => setNearExpiredList(prev => prev.filter(x => x.id !== item.id))}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add Near-Expired Item */}
          <div className="flex gap-2 pt-2 border-t border-slate-100 text-xs">
            <input
              type="text"
              placeholder="Nama bahan baku (mis: Ayam Ungkep)..."
              value={newBahanNama}
              onChange={(e) => setNewBahanNama(e.target.value)}
              className="input-enterprise flex-1 text-xs"
            />
            <input
              type="text"
              placeholder="Sisa stok (mis: 5 porsi)..."
              value={newBahanStok}
              onChange={(e) => setNewBahanStok(e.target.value)}
              className="input-enterprise w-32 text-xs"
            />
            <button
              onClick={() => {
                if (!newBahanNama.trim()) return;
                setNearExpiredList(prev => [
                  ...prev,
                  {
                    id: 'ne-' + Date.now(),
                    namaBahan: newBahanNama,
                    tglExpired: new Date().toISOString().split('T')[0],
                    jamHolding: 'Closing Shift',
                    sisaStok: newBahanStok || '1 Batch',
                    tindakan: 'Segera Olah (FIFO)'
                  }
                ]);
                setNewBahanNama('');
                setNewBahanStok('');
              }}
              className="btn-secondary-enterprise !py-1.5 !px-3 text-xs font-bold shrink-0"
            >
              <Plus size={13} />
              <span>Tambah</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: PENILAIAN CEPAT / RETRAINING KRU CABANG (KKM 75)
          ========================================================================= */}
      <div className="card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-[#8C161B]" />
              <span>Penilaian Cepat & Retraining Kru Cabang (Standar KKM 75)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Evaluasi mendadak / penyegaran SOP saat kunjungan. Skor terintegrasi otomatis ke Rekam Jejak Kru & Cloud.
            </p>
          </div>
          <span className="text-xs font-black bg-[#8C161B]/10 text-[#8C161B] px-2.5 py-1 rounded-lg">
            KKM: 75 (Lulus &gt;=75)
          </span>
        </div>

        <form onSubmit={handleSaveRetraining} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Kru yang Diuji:</label>
              <select
                value={selectedKruId}
                onChange={(e) => setSelectedKruId(e.target.value)}
                className="input-enterprise font-bold bg-white text-xs"
              >
                <option value="">-- Pilih Kru Outlet Ini ({outletKruList.length} Kru) --</option>
                {outletKruList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama_kru} ({k.divisi})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Produk SOP (18 Produk):</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="input-enterprise font-bold bg-white text-xs"
              >
                {SOP_PRODUCTS_LIST.map((p) => (
                  <option key={p.nama} value={p.nama}>
                    {p.nama} ({p.kode})
                  </option>
                ))}
              </select>
            </div>

            {/* Probe Suhu Minyak if Deep Fryer */}
            {currentProductMeta.isDeepFryer && (
              <div>
                <label className="block font-bold text-amber-900 mb-1">
                  Probe Suhu Minyak Deep Fryer (°C):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={suhuProbeMinyak}
                    onChange={(e) => setSuhuProbeMinyak(Number(e.target.value))}
                    className="input-enterprise font-mono font-bold w-24 text-xs"
                  />
                  <span className="text-[11px] text-slate-500">
                    Target: {currentProductMeta.targetSuhuMinyak || 160}°C
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 7 Kriteria Sliders Grid */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>1. Ketepatan (20%)</span>
                <span className="font-mono text-[#8C161B]">{skorKetepatan}</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={skorKetepatan}
                onChange={(e) => setSkorKetepatan(Number(e.target.value))}
                className="w-full accent-[#8C161B]"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>2. Langkah SOP (20%)</span>
                <span className="font-mono text-[#8C161B]">{skorLangkahSOP}</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={skorLangkahSOP}
                onChange={(e) => setSkorLangkahSOP(Number(e.target.value))}
                className="w-full accent-[#8C161B]"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>3. Kecepatan (15%)</span>
                <span className="font-mono text-[#8C161B]">{skorKecepatan}</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={skorKecepatan}
                onChange={(e) => setSkorKecepatan(Number(e.target.value))}
                className="w-full accent-[#8C161B]"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>4. Knowledge (15%)</span>
                <span className="font-mono text-[#8C161B]">{skorKnowledge}</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={skorKnowledge}
                onChange={(e) => setSkorKnowledge(Number(e.target.value))}
                className="w-full accent-[#8C161B]"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>5. Kerja Sama (10%)</span>
                <span className="font-mono text-[#8C161B]">{skorKerjasama}</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={skorKerjasama}
                onChange={(e) => setSkorKerjasama(Number(e.target.value))}
                className="w-full accent-[#8C161B]"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>6. Kebersihan (10%)</span>
                <span className="font-mono text-[#8C161B]">{skorKebersihan}</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={skorKebersihan}
                onChange={(e) => setSkorKebersihan(Number(e.target.value))}
                className="w-full accent-[#8C161B]"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>7. Keaktifan (10%)</span>
                <span className="font-mono text-[#8C161B]">{skorKeaktifan}</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={skorKeaktifan}
                onChange={(e) => setSkorKeaktifan(Number(e.target.value))}
                className="w-full accent-[#8C161B]"
              />
            </div>

            {/* Total Result Badge */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col justify-center items-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Skor Akhir Komposit</span>
              <div className="text-lg font-black font-mono text-[#8C161B]">
                {skorAkhirRetraining} / 100
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                isLulus ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {isLulus ? '✓ LULUS KKM 75' : '! REMEDIAL'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Catatan bimbingan instruktur lapangan (mis: perhatikan timing jegleg rice cooker)..."
              value={catatanRetraining}
              onChange={(e) => setCatatanRetraining(e.target.value)}
              className="input-enterprise text-xs flex-1"
            />
            <button
              type="submit"
              className="btn-primary-enterprise !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <Save size={14} />
              <span>Simpan Penilaian Retraining</span>
            </button>
          </div>
        </form>
      </div>

      {/* =========================================================================
          SECTION 3: KALKULATOR BERAS MIYAKO & GAS LPG
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Kalkulator Beras Miyako (6 cols) */}
        <div className="lg:col-span-6 card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <Calculator size={16} className="text-emerald-600" />
                <span>Kalkulator Beras Miyako (SOP-KIT-01)</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Rasio air baku, batas maksimal 6 cup, dan estimasi porsi standar 170g timbang.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jumlah Cup Beras Mentah (Merk Miyako):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={cupBerasInput}
                  onChange={(e) => setCupBerasInput(Number(e.target.value))}
                  className="input-enterprise font-mono font-bold w-20"
                />
                <span className="text-slate-500 font-bold">Cup (Batas Maksimal Rice Cooker Gas: 6 Cup)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <div>
                <span className="text-[10px] text-slate-500 block">Rasio Takaran Air:</span>
                <span className="font-extrabold text-emerald-950 text-sm">
                  {kalkulasiBeras.airCup} Cup Air Baku
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Hasil Porsi Matang (170g):</span>
                <span className="font-extrabold text-emerald-950 text-sm">
                  ~{kalkulasiBeras.porsiStandar170g} Porsi
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Waktu Tanak:</span>
                <span className="font-extrabold text-slate-800 text-xs">
                  {kalkulasiBeras.waktuMasakMenit} Menit
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Wajib Diamkan (Resting):</span>
                <span className="font-extrabold text-[#8C161B] text-xs">
                  15 Menit pasca jegleg
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              *Catatan Kritis: Dilarang langsung membuka tutup atau memindahkan nasi ke magicom sebelum genap 15 menit agar nasi tanak pulen dan tidak cepat basi.
            </p>
          </div>
        </div>

        {/* Kalkulator Gas LPG & Penggantian Minyak (6 cols) */}
        <div className="lg:col-span-6 card-enterprise !p-5 bg-white border border-[#E5E0D8] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <Flame size={16} className="text-amber-600" />
                <span>Kalkulator Efisiensi Gas LPG & Deep Fryer</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Estimasi umur tabung LPG dan frekuensi wajib filter saring remah minyak.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jam Operasi Fryer/Hari:</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={jamOperasiFryerInput}
                  onChange={(e) => setJamOperasiFryerInput(Number(e.target.value))}
                  className="input-enterprise font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ukuran Tabung LPG:</label>
                <select
                  value={tipeTabungGas}
                  onChange={(e) => setTipeTabungGas(e.target.value as any)}
                  className="input-enterprise font-bold bg-white"
                >
                  <option value="12kg">Tabung 12 Kg (Standar)</option>
                  <option value="3kg">Tabung 3 Kg (Darurat)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-200">
              <div>
                <span className="text-[10px] text-slate-500 block">Konsumsi Harian:</span>
                <span className="font-extrabold text-amber-950 text-sm">
                  {kalkulasiLPG.kgPerHari} Kg / Hari
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Estimasi Umur Tabung:</span>
                <span className="font-extrabold text-amber-950 text-sm">
                  ~{kalkulasiLPG.umurTabungHari} Hari
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-500 block">Jadwal Saring Remah Minyak:</span>
                <span className="font-extrabold text-[#8C161B] text-xs">
                  {kalkulasiLPG.frekuensiFilterMinyak}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              *SOP K3: Pastikan regulator gas tidak berbau dan kuras endapan remah tepung setiap pergantian shift agar minyak tidak cepat gosong/hitam.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: CETAK BERITA ACARA VISIT OUTLET
          ========================================================================= */}
      <div className="card-enterprise !p-6 bg-white border border-[#E5E0D8] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <FileText size={16} className="text-[#8C161B]" />
              <span>Format Berita Acara Kunjungan Supervisi & Coaching Cabang</span>
            </h3>
            <p className="text-xs text-slate-500">
              Dokumen resmi berita acara evaluasi outlet untuk arsip HQ dan tanda tangan Kepala Outlet.
            </p>
          </div>
          <button
            onClick={handlePrintBeritaAcara}
            className="btn-primary-enterprise !py-2 !px-4 text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Printer size={14} />
            <span>Cetak / Simpan PDF Berita Acara</span>
          </button>
        </div>

        {/* Printable Paper Box */}
        <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 text-xs space-y-4">
          <div className="flex justify-between items-start border-b border-slate-300 pb-3">
            <div>
              <div className="font-black text-sm text-[#8C161B]">HARA CHICKEN INDONESIA</div>
              <div className="font-bold text-slate-800">BERITA ACARA KUNJUNGAN SUPERVISI TRAINER & R&D</div>
              <div className="text-[11px] text-slate-500">Nomor: BA-VISIT/{activeOutletCode}/{new Date().getFullYear()}/{Date.now().toString().slice(-4)}</div>
            </div>
            <div className="text-right text-[11px] text-slate-600">
              <div>Tanggal Visit: <b>{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</b></div>
              <div>Outlet: <b>{activeOutletObj.nama_outlet} ({activeOutletCode})</b></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="font-bold text-slate-800">Ringkasan Audit Suhu & Kepatuhan:</div>
              <div>• Deep Fryer 1: {suhuFryer1}°C | Deep Fryer 2: {suhuFryer2}°C</div>
              <div>• Warmer Display: {suhuWarmer}°C | Chiller: {suhuChiller}°C | Freezer: {suhuFreezer}°C</div>
              <div>• Stok Kritis FIFO Terdata: {nearExpiredList.length} Bahan</div>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-800">Instruksi & Tindakan Korektif Trainer:</div>
              <div>• Disiplin 4 jenis lap pembersih (Meja, Alat, Tangan, Lantai).</div>
              <div>• Timbangan gramasi bumbu ECO & porsi nasi 170g wajib TARE/ZERO.</div>
              <div>• Resting nasi 15 menit wajib ditaati sebelum magicom ditutup.</div>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="text-slate-600">Kepala Outlet (Store Manager),</div>
              <div className="h-16" />
              <div className="border-t border-slate-400 font-bold pt-1">
                ( {activeOutletObj.kepala_outlet || 'Kepala Outlet'} )
              </div>
            </div>
            <div>
              <div className="text-slate-600">Lead Trainer / Asesor Lapangan,</div>
              <div className="h-16" />
              <div className="border-t border-slate-400 font-bold pt-1">
                ( Trainer Operasional HARA )
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
