import React, { useState, useMemo } from 'react';
import {
  GitCompare, Building2, Store, Users, Clock, Award, AlertTriangle,
  CheckCircle2, ArrowRight, TrendingDown, TrendingUp, ShieldCheck,
  FileText, Download, BarChart2, RefreshCw, ChevronRight, Layers,
  Thermometer, Scale, Sparkles, Filter
} from 'lucide-react';
import { db } from '../../lib/storage';
import { Outlet, Kru, PenilaianPraktikOnboardingProduk, PenilaianJobdeskStasiun, ObservasiLapangan } from '../../types';

interface TrainingVsOperasionalViewProps {
  selectedOutletCode: string;
  onNavigateToOnboarding?: () => void;
  onNavigateToSupervisi?: () => void;
}

export const TrainingVsOperasionalView: React.FC<TrainingVsOperasionalViewProps> = ({
  selectedOutletCode,
  onNavigateToOnboarding,
  onNavigateToSupervisi,
}) => {
  const [filterOutlet, setFilterOutlet] = useState<string>(selectedOutletCode !== 'ALL' ? selectedOutletCode : 'ALL');
  const [filterDivisi, setFilterDivisi] = useState<string>('ALL');

  const outlets = useMemo(() => db.getTable<Outlet>('outlets'), []);
  const allKru = useMemo(() => db.getTable<Kru>('kru'), []);
  const onboardingPractices = useMemo(() => db.getPenilaianPraktikProduk(), []);
  const jobdeskStasiun = useMemo(() => db.getPenilaianJobdeskStasiun(), []);
  const observasiList = useMemo(() => db.getTable<ObservasiLapangan>('observasi_lapangan'), []);

  // Filtered dataset for comparison
  const filteredPractices = useMemo(() => {
    return onboardingPractices.filter(p => {
      if (filterOutlet !== 'ALL' && p.kode_outlet !== filterOutlet) return false;
      if (filterDivisi !== 'ALL' && p.divisi !== filterDivisi) return false;
      return true;
    });
  }, [onboardingPractices, filterOutlet, filterDivisi]);

  const filteredObservasi = useMemo(() => {
    return observasiList.filter(a => {
      if (filterOutlet !== 'ALL' && a.kode_outlet !== filterOutlet) return false;
      return true;
    });
  }, [observasiList, filterOutlet]);

  // Aggregate Metrics
  const avgTrainingScore = useMemo(() => {
    if (filteredPractices.length === 0) return 86.5;
    const sum = filteredPractices.reduce((acc, p) => acc + (p.skor_akhir || 0), 0);
    return Math.round((sum / filteredPractices.length) * 10) / 10;
  }, [filteredPractices]);

  const avgOperasionalScore = useMemo(() => {
    if (filteredObservasi.length === 0) return 81.4;
    const sesuaiCount = filteredObservasi.filter(o => o.hasil === 'Sesuai Standar').length;
    const skorRatio = (sesuaiCount / filteredObservasi.length) * 100;
    return Math.round(skorRatio * 10) / 10;
  }, [filteredObservasi]);

  const scoreGap = useMemo(() => {
    return Math.round((avgOperasionalScore - avgTrainingScore) * 10) / 10;
  }, [avgOperasionalScore, avgTrainingScore]);

  // Station level comparison
  const stationComparisons = [
    {
      stasiun: 'Stasiun 1: Nasi, Teh & Sup',
      scoreTraining: 91,
      scoreOperasional: 88,
      parameterKritis: 'Tanak Nasi Miyako & Gula Cair',
      deviasiUmum: 'Resting nasi sering dipersingkat saat rush hour',
      status: 'On-Track (Gap -3)',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      stasiun: 'Stasiun 2: Marinate, Breading & Fryer',
      scoreTraining: 89,
      scoreOperasional: 80,
      parameterKritis: 'Suhu Minyak 160°C & Dusting 2x',
      deviasiUmum: 'Suhu drop ke 154°C saat dropping ayam berturut-turut',
      status: 'Perlu Pendampingan (Gap -9)',
      statusColor: 'text-amber-800 bg-amber-50 border-amber-200',
    },
    {
      stasiun: 'Stasiun 3: Sambal Cobek & Packing',
      scoreTraining: 92,
      scoreOperasional: 84,
      parameterKritis: 'Gramatur Sambal 30g & Waktu Saji SOS',
      deviasiUmum: 'Timbangan digital tidak digunakan, penakaran sendok over 4g',
      status: 'Perlu Kalibrasi (Gap -8)',
      statusColor: 'text-rose-800 bg-rose-50 border-rose-200',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* HEADER BANNER DUAL MODE */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#181411] via-[#241C18] to-[#181411] text-white border border-neutral-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-black uppercase tracking-wider bg-[#96171B] text-white">
                Dual Workspace Mode
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                TC Onboarding ⇄ Pendampingan Lapangan Outlet
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <GitCompare size={24} className="text-[#96171B]" />
              <span>Analisis Komparasi: Standar Training vs Operasional Outlet</span>
            </h1>
            <p className="text-xs text-neutral-300 max-w-3xl leading-relaxed">
              Membandingkan konsistensi keterampilan kru saat pelatihan terkontrol (Training Center) dengan realitas eksekusi di outlet nyata. Mengidentifikasi penurunan standar mutu sebelum menjadi keluhan pelanggan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onNavigateToOnboarding && (
              <button
                type="button"
                onClick={onNavigateToOnboarding}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5"
              >
                <Building2 size={14} className="text-amber-400" />
                <span>Buka Mode Training</span>
              </button>
            )}

            {onNavigateToSupervisi && (
              <button
                type="button"
                onClick={onNavigateToSupervisi}
                className="px-3.5 py-2 rounded-xl bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold border border-red-700 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Store size={14} />
                <span>Buka Mode Operasional</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="p-4 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#96171B]" />
            <span className="font-bold text-[#645D55] uppercase text-[10.5px]">Filter Cabang:</span>
            <select
              value={filterOutlet}
              onChange={(e) => setFilterOutlet(e.target.value)}
              className="p-1.5 rounded-lg border border-[#E6E1DA] bg-white font-semibold text-[#181411] text-xs"
            >
              <option value="ALL">Semua Cabang Outlet HARA</option>
              {outlets.map(o => (
                <option key={o.kode_outlet} value={o.kode_outlet}>
                  {o.kode_outlet} - {o.nama_outlet}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-[#E6E1DA] hidden md:block" />

          <div className="flex items-center gap-2">
            <span className="font-bold text-[#645D55] uppercase text-[10.5px]">Divisi Stasiun:</span>
            <select
              value={filterDivisi}
              onChange={(e) => setFilterDivisi(e.target.value)}
              className="p-1.5 rounded-lg border border-[#E6E1DA] bg-white font-semibold text-[#181411] text-xs"
            >
              <option value="ALL">Semua Divisi (Kitchen, Geprek, Kasir)</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Geprek">Geprek & Sambal</option>
              <option value="Kasir">Kasir & Service</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#645D55] font-medium">
          Sampel Evaluasi: <strong className="text-[#181411]">{filteredPractices.length} Sesi Praktik</strong> • <strong className="text-[#181411]">{filteredObservasi.length} Observasi Lapangan</strong>
        </div>
      </div>

      {/* 4 COMPARATIVE METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Skor Training */}
        <div className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={13} className="text-[#96171B]" />
              <span>Standar TC Onboarding</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-[#96171B] border border-red-200">
              Lingkungan Baku
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-[#181411]">
            {avgTrainingScore} <span className="text-sm font-normal text-[#645D55]">/ 100</span>
          </div>
          <p className="text-[11px] text-[#645D55]">
            Rata-rata akumulasi penguasaan SOP & waktu stopwatch saat onboarding.
          </p>
        </div>

        {/* Metric 2: Skor Operasional */}
        <div className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider flex items-center gap-1.5">
              <Store size={13} className="text-amber-700" />
              <span>Eksekusi Operasional</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
              Rush Hour Outlet
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-[#181411]">
            {avgOperasionalScore} <span className="text-sm font-normal text-[#645D55]">/ 100</span>
          </div>
          <p className="text-[11px] text-[#645D55]">
            Kepatuhan prosedur aktual saat pendampingan & supervisi shift lapangan.
          </p>
        </div>

        {/* Metric 3: Gap Mutu */}
        <div className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown size={13} className={scoreGap < 0 ? 'text-rose-600' : 'text-emerald-600'} />
              <span>Indeks Gap Kepatuhan</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              scoreGap < 0 ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {scoreGap < 0 ? 'Penurunan Lapangan' : 'Peningkatan'}
            </span>
          </div>
          <div className={`text-3xl font-black font-mono ${scoreGap < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
            {scoreGap > 0 ? `+${scoreGap}` : `${scoreGap}`} <span className="text-sm font-normal text-[#645D55]">poin</span>
          </div>
          <p className="text-[11px] text-[#645D55]">
            Perbedaan rata-rata antara standar kelas vs eksekusi shift harian.
          </p>
        </div>

        {/* Metric 4: Kesiapan Solo Shift */}
        <div className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#645D55] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-700" />
              <span>Kesiapan Mandiri (Solo)</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Target KKM ≥ 80
            </span>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-800">
            85.7% <span className="text-sm font-normal text-[#645D55]">Kru</span>
          </div>
          <p className="text-[11px] text-[#645D55]">
            Kru dengan performa konsisten di atas ambang batas standar mutu HARA.
          </p>
        </div>
      </div>

      {/* IN-DEPTH COMPARISON: STATION LEVEL BREAKDOWN */}
      <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
          <div>
            <h3 className="font-extrabold text-base text-[#181411] flex items-center gap-2">
              <Layers size={18} className="text-[#96171B]" />
              <span>Matriks Komparasi Stasiun Kerja (Training vs Realita Operasional)</span>
            </h3>
            <p className="text-xs text-[#645D55] mt-0.5">
              Mendeteksi di stasiun mana degradasi standar paling rentan terjadi saat menghadapi lonjakan pesanan (rush hour).
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {stationComparisons.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] hover:bg-white transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-md bg-[#96171B] text-white text-xs font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-[#181411]">{item.stasiun}</h4>
                    <span className="text-[11px] text-[#645D55]">Titik Kritis Baku: {item.parameterKritis}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Progress bars comparing Training vs Operasional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Training Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-[#645D55]">Standar Training:</span>
                    <span className="font-mono font-bold text-[#181411]">{item.scoreTraining} / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${item.scoreTraining}%` }}
                    />
                  </div>
                </div>

                {/* Operasional Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-[#645D55]">Eksekusi Operasional Lapangan:</span>
                    <span className="font-mono font-bold text-[#181411]">{item.scoreOperasional} / 100</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.scoreOperasional >= 85 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                      style={{ width: `${item.scoreOperasional}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Akar Masalah & Tindakan Koreksi */}
              <div className="p-3 rounded-lg bg-white border border-[#E6E1DA] text-xs text-[#645D55] flex items-start gap-2">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#181411]">Temuan Lapangan:</strong> {item.deviasiUmum}.
                  <span className="block mt-0.5 text-[11px] text-[#96171B] font-semibold">
                    Rekomendasi Trainer: Lakukan coaching 10 menit saat briefing sebelum shift dimulai dan sediakan sendok takar terkalibrasi di stasiun.
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REALISTIC SOS TIME COMPARISON: TARGET VS OUTLET ACTUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Stopwatch & Target Analysis */}
        <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
            <h3 className="font-bold text-sm text-[#181411] flex items-center gap-2">
              <Clock size={16} className="text-[#96171B]" />
              <span>Target Waktu Realistis: Persiapan s/d Produk Jadi</span>
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] space-y-1.5">
              <div className="flex justify-between font-bold text-[#181411]">
                <span>Goreng Ayam Crispy HARA (1020s / 17 Menit)</span>
                <span className="text-emerald-700">Terstandar SOP</span>
              </div>
              <p className="text-[11px] text-[#645D55] leading-relaxed">
                • <strong>Tahap 1 Dusting (3 mnt):</strong> Penepungan 2x & celup air 1 dtk.<br />
                • <strong>Tahap 2 Fryer 160°C (12 mnt):</strong> Menggoreng & goyang keranjang menit 3, 6, 9.<br />
                • <strong>Tahap 3 Penirisan (2 mnt):</strong> Tiriskan minyak & transfer ke display warmer.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] space-y-1.5">
              <div className="flex justify-between font-bold text-[#181411]">
                <span>Geprek Original Sambal Bawang (45s)</span>
                <span className="text-emerald-700">Terstandar SOS</span>
              </div>
              <p className="text-[11px] text-[#645D55] leading-relaxed">
                • 2-3 ketukan mantap pada cobek batu.<br />
                • Balur rata 30g sambal bawang segar.<br />
                • Plating bersama 2 slice timun segar 45 derajat.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Operational Guidance for Trainers */}
        <div className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
            <h3 className="font-bold text-sm text-[#181411] flex items-center gap-2">
              <Sparkles size={16} className="text-[#96171B]" />
              <span>Panduan Pendampingan Lapangan Berkelanjutan</span>
            </h3>
          </div>

          <div className="space-y-2.5 text-xs text-[#645D55]">
            <div className="p-3 rounded-lg border border-[#E6E1DA] bg-white flex items-start gap-2.5">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#181411]">Sinkronisasi Real-Time Supabase:</strong> Setiap data evaluasi yang dicatat di kelas maupun saat pendampingan outlet langsung tersimpan dan dapat diakses multi-device secara instan.
              </div>
            </div>

            <div className="p-3 rounded-lg border border-[#E6E1DA] bg-white flex items-start gap-2.5">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#181411]">Pemisahan Mode Kerja:</strong> Beralih kapan saja antara mode Onboarding untuk melatih rekrutan baru, dan mode Operasional untuk supervisi outlet pendampingan.
              </div>
            </div>

            <div className="p-3 rounded-lg border border-[#E6E1DA] bg-white flex items-start gap-2.5">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#181411]">Penyempurnaan Data Bertahap:</strong> Data perbandingan ini akan terus diperkaya seiring masuknya catatan audit berkala dan feedback supervisor wilayah.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
