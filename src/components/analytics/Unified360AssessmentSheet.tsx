import React, { useState, useEffect, useMemo } from 'react';
import {
  Award, CheckCircle2, AlertTriangle, Clock, Flame, ShieldCheck,
  Save, Sparkles, RefreshCw, Layers, Brain, User, Store,
  ChevronRight, Thermometer, Play, Pause, RotateCcw
} from 'lucide-react';
import { db } from '../../lib/storage';
import { Kru, Outlet, Division, AuditAttitudeHara, CompetencyBadge } from '../../types';
import { hitungCrossValidationStatus } from '../../data/bankSoalMingguan';

interface Unified360AssessmentSheetProps {
  selectedOutletCode: string;
  onSaved?: () => void;
}

export const Unified360AssessmentSheet: React.FC<Unified360AssessmentSheetProps> = ({
  selectedOutletCode,
  onSaved,
}) => {
  const outlets = db.getTable<Outlet>('outlets');
  const allKru = db.getTable<Kru>('kru').filter(k => k.status_aktif === 'Aktif');

  const filteredKru = useMemo(() => {
    return selectedOutletCode === 'ALL'
      ? allKru
      : allKru.filter(k => k.kode_outlet === selectedOutletCode);
  }, [allKru, selectedOutletCode]);

  const [selectedKruId, setSelectedKruId] = useState<string>(() => {
    return filteredKru.length > 0 ? filteredKru[0].id : '';
  });

  const activeKru = useMemo(() => {
    return allKru.find(k => k.id === selectedKruId) || filteredKru[0] || allKru[0] || null;
  }, [allKru, filteredKru, selectedKruId]);

  // PILAR 1: TEORI SOP & ESSAY HOTS (25%)
  const [skorTeori, setSkorTeori] = useState<number>(86);

  // PILAR 2: PRAKTIK & SPEED OF SERVICE / SOS (35%)
  const [skorPraktik, setSkorPraktik] = useState<number>(88);
  const [suhuKompor, setSuhuKompor] = useState<number>(175);
  const [suhuMinyakMasuk, setSuhuMinyakMasuk] = useState<number>(160);
  const [durasiGorengMenit, setDurasiGorengMenit] = useState<number>(12);
  const [coreTempDaging, setCoreTempDaging] = useState<number>(76);
  const [gramasiSambal, setGramasiSambal] = useState<number>(30);
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(120);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);

  // PILAR 3: UJI LISAN & HACCP KRITIS (15%)
  const [skorLisan, setSkorLisan] = useState<number>(85);

  // PILAR 4: SIKAP BUDAYA H.A.R.A & PSIKOMETRI SJT (25%)
  // Nilai diambil langsung dari Input Nilai Budaya HARA Objektif 16 Butir SOP (0-100 pt), bebas skala subjektif 1-5
  const [skorPsikometriSJT, setSkorPsikometriSJT] = useState<number>(88);
  const [skorHaraH, setSkorHaraH] = useState<number>(90);   // Halal & Higienis (0-100)
  const [skorHaraA1, setSkorHaraA1] = useState<number>(85);  // Amanah & Akurasi (0-100)
  const [skorHaraR, setSkorHaraR] = useState<number>(88);   // Responsif & Disiplin (0-100)
  const [skorHaraA2, setSkorHaraA2] = useState<number>(92);  // Adaptif & Kolaboratif (0-100)

  const [catatanPerilaku, setCatatanPerilaku] = useState<string>(
    'Kru sangat disiplin pada suhu fryer 160C dan selalu ramah saat melayani pesanan jam sibuk.'
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Stopwatch interval
  useEffect(() => {
    let interval: any = null;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  // Load existing records for active crew - Ambil nilai HARA objektif dari database
  useEffect(() => {
    if (!activeKru) return;
    const summaries = db.getCrewCompetencySummaries();
    const sum = summaries.find(s => s.namaKru === activeKru.nama_kru);
    if (sum) {
      if (sum.skorTeori !== null) setSkorTeori(sum.skorTeori);
      if (sum.skorPraktik !== null) setSkorPraktik(sum.skorPraktik);
      if (sum.skorLisan !== null) setSkorLisan(sum.skorLisan);
    }
    const attList = db.getTable<AuditAttitudeHara>('attitude_hara').filter(a => a.nama_kru === activeKru.nama_kru);
    if (attList.length > 0) {
      const att = attList[0];
      setSkorHaraH(att.skor_h_higienis ?? 90);
      setSkorHaraA1(att.skor_a_amanah ?? 85);
      setSkorHaraR(att.skor_a_antusias ?? 88);
      setSkorHaraA2(att.skor_r_resik ?? 92);
      if (att.catatan_perilaku) setCatatanPerilaku(att.catatan_perilaku);
    }
  }, [activeKru]);

  // Nilai Sikap Budaya H.A.R.A Objektif Lapangan (Rata-rata 4 Pilar HARA 0-100)
  const skorAttitudeBudayaHara = useMemo(() => {
    return Math.round((skorHaraH + skorHaraA1 + skorHaraR + skorHaraA2) / 4);
  }, [skorHaraH, skorHaraA1, skorHaraR, skorHaraA2]);

  // Pilar 4 Composite = Psikometri SJT 40% + Nilai Sikap Budaya HARA Objektif 60%
  const skorPilar4Karakter = useMemo(() => {
    return Math.round((skorPsikometriSJT * 0.4) + (skorAttitudeBudayaHara * 0.6));
  }, [skorPsikometriSJT, skorAttitudeBudayaHara]);

  // TOTAL 4-PILAR STANDAR RESMI: Teori 20% + Praktik 40% + Lisan 15% + Sikap Budaya HARA 25%
  const skorAkhirKomposit = useMemo(() => {
    const total = (skorTeori * 0.20) + (skorPraktik * 0.40) + (skorLisan * 0.15) + (skorPilar4Karakter * 0.25);
    return Math.round(total);
  }, [skorTeori, skorPraktik, skorLisan, skorPilar4Karakter]);

  const gradeKelulusan: { grade: string; label: string; badge: CompetencyBadge; colorClass: string } = useMemo(() => {
    if (skorAkhirKomposit >= 85) {
      return { grade: 'Grade A', label: 'Mahir Mandiri', badge: 'Mahir', colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
    if (skorAkhirKomposit >= 75) {
      return { grade: 'Grade B', label: 'Kompeten Terverifikasi', badge: 'Terampil', colorClass: 'text-blue-700 bg-blue-50 border-blue-200' };
    }
    if (skorAkhirKomposit >= 60) {
      return { grade: 'Grade C', label: 'Pembinaan & Pendampingan', badge: 'Pemula', colorClass: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
    return { grade: 'Remedial', label: 'Remedial Terbimbing', badge: 'Pemula', colorClass: 'text-rose-700 bg-rose-50 border-rose-200' };
  }, [skorAkhirKomposit]);

  // Cross-Validation Status
  const crossValStatus = useMemo(() => {
    return hitungCrossValidationStatus(skorPsikometriSJT, skorAttitudeBudayaHara);
  }, [skorPsikometriSJT, skorAttitudeBudayaHara]);

  const handleSaveAll = () => {
    if (!activeKru) return;
    const nowIso = new Date().toISOString();

    // 1. Simpan ke attitude_hara (Objektif 0-100 pt, bebas skala subjektif 1-5)
    const attRecord: AuditAttitudeHara = {
      id: `att-${Date.now()}`,
      tanggal: nowIso,
      nama_kru: activeKru.nama_kru,
      kode_outlet: activeKru.kode_outlet,
      evaluator_nama: 'Haikal Abi (Lead Trainer & People Dev)',
      skor_h_higienis: skorHaraH,
      skor_a_amanah: skorHaraA1,
      skor_a_antusias: skorHaraR,
      skor_r_resik: skorHaraA2,
      skor_rata_rata: skorAttitudeBudayaHara,
      catatan_perilaku: catatanPerilaku,
      rekomendasi_coaching: crossValStatus,
      created_at: nowIso,
    };
    db.insertRow('attitude_hara', attRecord);

    // 2. Simpan ke penilaian_praktik
    db.insertRow('penilaian_praktik', {
      tanggal: nowIso,
      nama_kru: activeKru.nama_kru,
      kru_id: activeKru.id,
      kode_outlet: activeKru.kode_outlet,
      sop_terkait: 'Standar Mutu Penggorengan 160°C & Sambal 30g',
      detail_skor_langkah: [
        { langkah: 1, deskripsi: 'Suhu kompor 175°C & minyak masuk 160°C', skor: suhuMinyakMasuk >= 158 && suhuMinyakMasuk <= 165 ? 100 : 70 },
        { langkah: 2, deskripsi: 'Timer goreng 12 menit tepat (goyang per 3 mnt)', skor: durasiGorengMenit === 12 ? 100 : 80 },
        { langkah: 3, deskripsi: 'Core temperature daging ≥ 74°C', skor: coreTempDaging >= 74 ? 100 : 60 },
        { langkah: 4, deskripsi: 'Uleg cobek sambal bawang 30 gram', skor: gramasiSambal === 30 ? 100 : 75 },
      ],
      waktu_detik: stopwatchSeconds,
      target_waktu_detik: 150,
      skor_kecepatan: stopwatchSeconds <= 150 ? 95 : 75,
      skor_higienitas: skorHaraH,
      skor_akhir: skorPraktik,
      evaluator: 'Lead Trainer',
      catatan: `Stopwatch SOS: ${stopwatchSeconds}s. Suhu minyak: ${suhuMinyakMasuk}°C. Core: ${coreTempDaging}°C.`,
    });

    // 3. Simpan ke penilaian_lisan
    db.insertRow('penilaian_lisan', {
      tanggal: nowIso,
      nama_kru: activeKru.nama_kru,
      kru_id: activeKru.id,
      kode_outlet: activeKru.kode_outlet,
      sop_terkait: 'Nalar Kritis HACCP, APAR K3 & Penanganan Komplain',
      butir_benar: Math.round((skorLisan / 100) * 10),
      total_butir: 10,
      skor: skorLisan,
      catatan_penguji: `Pengujian lisan: pemahaman food safety dan budaya HARA.`,
    });

    // 4. Update riwayat penilaian teori
    db.insertRow('penilaian_teori', {
      tanggal: nowIso,
      nama_kru: activeKru.nama_kru,
      kru_id: activeKru.id,
      kode_outlet: activeKru.kode_outlet,
      topik: 'Standar Umum & SOP Jobdesk',
      jumlah_benar: Math.round((skorTeori / 100) * 25),
      total_soal: 25,
      skor: skorTeori,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
    if (onSaved) onSaved();
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] p-6 sm:p-8 space-y-6">
      {/* Top Banner: Crew Selector & Live Final Score */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E6E1DA]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#96171B] uppercase tracking-wider">
            <span>Lembar Penilaian Terpadu 360° Satu Layar</span>
            <span className="text-[#645D55]">•</span>
            <span>Formula 4 Pilar Baku</span>
          </div>
          <h3 className="text-xl font-bold text-[#181411] mt-0.5">
            Evaluasi Mutu & Attitude Budaya H.A.R.A
          </h3>
          <p className="text-xs text-[#645D55] mt-1">
            Input langsung 4 pilar kompetensi dalam 1 alur terpadu tanpa berpindah halaman
          </p>
        </div>

        {/* Kru Dropdown & Composite Score Gauge */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#645D55]">Pilih Kru:</span>
            <select
              value={selectedKruId}
              onChange={(e) => setSelectedKruId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] text-xs font-bold text-[#181411] focus:outline-none focus:border-[#96171B]"
            >
              {filteredKru.map(k => (
                <option key={k.id} value={k.id}>
                  {k.nama_kru} ({k.divisi} • {k.kode_outlet})
                </option>
              ))}
            </select>
          </div>

          {/* Composite Score Pill */}
          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-3 ${gradeKelulusan.colorClass}`}>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Skor Akhir 4 Pilar</div>
              <div className="text-2xl font-black font-mono leading-none mt-0.5">
                {skorAkhirKomposit}
                <span className="text-xs font-normal opacity-70"> / 100</span>
              </div>
            </div>
            <div className="h-7 w-px bg-current opacity-20" />
            <div className="text-right">
              <div className="text-xs font-black uppercase">{gradeKelulusan.grade}</div>
              <div className="text-[10px] opacity-90">{gradeKelulusan.label}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Validation Gap Detector Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        crossValStatus.includes('Anomali')
          ? 'bg-rose-50 border-rose-200 text-rose-900'
          : crossValStatus.includes('Rendah Hati')
          ? 'bg-blue-50 border-blue-200 text-blue-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-start gap-2.5">
          <Brain size={18} className="shrink-0 mt-0.5 text-current" />
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>Cross-Validation Gap Detector:</span>
              <span className="px-2 py-0.5 rounded-full bg-white font-extrabold text-[11px] border border-current">
                {crossValStatus}
              </span>
            </div>
            <p className="text-[11px] opacity-90 mt-0.5">
              Klaim Tes Karakter SJT Kru: <strong>{skorPsikometriSJT}%</strong> vs Realita Sikap Budaya H.A.R.A Lapangan: <strong>{skorAttitudeBudayaHara}%</strong>.
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono font-bold shrink-0">
          Selisih Gap: {Math.abs(skorPsikometriSJT - skorAttitudeBudayaHara)} Poin
        </div>
      </div>

      {/* 4 Pillars Grid (Single-Screen) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ===================================================================
            PILAR 1: UJI TEORI SOP & ESSAY HOTS (20%)
            =================================================================== */}
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#96171B] text-white flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <h4 className="font-bold text-sm text-[#181411]">Pilar 1: Uji Teori SOP & HOTS</h4>
                <p className="text-[11px] text-[#645D55]">Bobot Resmi: 20% • Ujian Kru & Override Trainer</p>
              </div>
            </div>
            <span className="text-lg font-black font-mono text-[#96171B]">{skorTeori} / 100</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1 font-semibold text-[#181411]">
                <span>Nilai Teori Terpadu (PG + Essay Auto-Grading)</span>
                <span className="font-mono text-[#96171B]">{skorTeori} Poin</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={skorTeori}
                onChange={(e) => setSkorTeori(Number(e.target.value))}
                className="w-full accent-[#96171B] cursor-pointer"
              />
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E6E1DA] space-y-1.5 text-[11px] text-[#645D55]">
              <div className="font-bold text-[#181411]">Cakupan Materi Teori Terverifikasi:</div>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>SOP Jobdesk: Suhu kompor 175°C, minyak stabil 160°C</li>
                <li>Durasi goreng 12 mnt, core temp ≥74°C, sambal 30g cobek batu</li>
                <li>Holding time warmer maks 120 menit (60°C–70°C)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ===================================================================
            PILAR 2: UJI PRAKTIK & SPEED OF SERVICE / SOS (40%)
            =================================================================== */}
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#96171B] text-white flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <h4 className="font-bold text-sm text-[#181411]">Pilar 2: Uji Praktik & SOS</h4>
                <p className="text-[11px] text-[#645D55]">Bobot Resmi: 40% • Stopwatch SOS & Parameter Suhu</p>
              </div>
            </div>
            <span className="text-lg font-black font-mono text-[#96171B]">{skorPraktik} / 100</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Integrated Stopwatch */}
            <div className="p-3 bg-white rounded-xl border border-[#E6E1DA] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#645D55] uppercase">Stopwatch SOS Shift</span>
                <div className="text-xl font-black font-mono text-[#181411]">
                  {Math.floor(stopwatchSeconds / 60).toString().padStart(2, '0')}:
                  {(stopwatchSeconds % 60).toString().padStart(2, '0')}
                  <span className="text-xs text-[#645D55] font-normal"> (Target &lt; 150s)</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1 ${
                    isStopwatchRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isStopwatchRunning ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isStopwatchRunning ? 'Pause' : 'Start'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsStopwatchRunning(false);
                    setStopwatchSeconds(0);
                  }}
                  className="p-1.5 rounded-xl border border-[#E6E1DA] text-[#645D55] hover:text-[#181411]"
                  title="Reset Stopwatch"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            {/* Parameter Inputs */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-white rounded-xl border border-[#E6E1DA]">
                <span className="text-[#645D55]">Suhu Minyak Masuk:</span>
                <div className="font-bold text-[#181411] flex items-center justify-between mt-0.5">
                  <span>{suhuMinyakMasuk}°C</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">(Std: 160°C)</span>
                </div>
              </div>

              <div className="p-2 bg-white rounded-xl border border-[#E6E1DA]">
                <span className="text-[#645D55]">Timer Goreng:</span>
                <div className="font-bold text-[#181411] flex items-center justify-between mt-0.5">
                  <span>{durasiGorengMenit} Mnt</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">(Std: 12 Mnt)</span>
                </div>
              </div>

              <div className="p-2 bg-white rounded-xl border border-[#E6E1DA]">
                <span className="text-[#645D55]">Core Temperature:</span>
                <div className="font-bold text-[#181411] flex items-center justify-between mt-0.5">
                  <span>{coreTempDaging}°C</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">(Std ≥ 74°C)</span>
                </div>
              </div>

              <div className="p-2 bg-white rounded-xl border border-[#E6E1DA]">
                <span className="text-[#645D55]">Gramasi Sambal Bawang:</span>
                <div className="font-bold text-[#181411] flex items-center justify-between mt-0.5">
                  <span>{gramasiSambal}g</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">(Std: 30g)</span>
                </div>
              </div>
            </div>

            {/* Score Slider */}
            <div>
              <div className="flex justify-between mb-1 font-semibold text-[#181411]">
                <span>Nilai Akhir Praktik Lapangan</span>
                <span className="font-mono text-[#96171B]">{skorPraktik} Poin</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={skorPraktik}
                onChange={(e) => setSkorPraktik(Number(e.target.value))}
                className="w-full accent-[#96171B] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ===================================================================
            PILAR 3: UJI LISAN & NALAR KRITIS HACCP (15%)
            =================================================================== */}
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#96171B] text-white flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <h4 className="font-bold text-sm text-[#181411]">Pilar 3: Uji Lisan & HACCP Kritis</h4>
                <p className="text-[11px] text-[#645D55]">Bobot Resmi: 15% • Rubrik Tanya-Jawab 'Why Behind SOP'</p>
              </div>
            </div>
            <span className="text-lg font-black font-mono text-[#96171B]">{skorLisan} / 100</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1 font-semibold text-[#181411]">
                <span>Nilai Uji Lisan & Nalar Kritis</span>
                <span className="font-mono text-[#96171B]">{skorLisan} Poin</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={skorLisan}
                onChange={(e) => setSkorLisan(Number(e.target.value))}
                className="w-full accent-[#96171B] cursor-pointer"
              />
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E6E1DA] space-y-1.5 text-[11px] text-[#645D55]">
              <div className="font-bold text-[#181411]">Pertanyaan Kritis Standar Uji Lisan:</div>
              <p>1. Mengapa ayam baru boleh dimasukkan saat suhu minyak mencapai 160°C stabil? (Mencegah minyak terserap & kulit berminyak).</p>
              <p>2. Bagaimana prosedur P.A.S.S pemadaman api menggunakan APAR jika terjadi kebakaran minyak fryer?</p>
              <p>3. Apa batas maksimal holding time di warmer? (Maks 120 menit pada suhu 60°C–70°C).</p>
            </div>
          </div>
        </div>

        {/* ===================================================================
            PILAR 4: SIKAP BUDAYA H.A.R.A & PSIKOMETRI SJT (25%)
            =================================================================== */}
        <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E6E1DA] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#96171B] text-white flex items-center justify-center text-xs font-bold">4</span>
              <div>
                <h4 className="font-bold text-sm text-[#181411]">Pilar 4: Sikap Budaya H.A.R.A & Karakter</h4>
                <p className="text-[11px] text-[#645D55]">Bobot Resmi: 25% • SJT (40%) + Nilai Budaya HARA Objektif Lapangan (60%)</p>
              </div>
            </div>
            <span className="text-lg font-black font-mono text-[#96171B]">{skorPilar4Karakter} / 100</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Info Box Objektivitas Penilaian */}
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between gap-2">
              <div className="text-[11px] leading-relaxed">
                <span className="font-bold text-emerald-900 block">✓ Penilaian Sikap Berbasis Nilai HARA Objektif</span>
                Nilai ditarik langsung dari audit SOP 16 parameter baku budaya HARA — bebas subjektivitas skala 1-5.
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!activeKru) return;
                  const attList = db.getTable<AuditAttitudeHara>('attitude_hara').filter(a => a.nama_kru === activeKru.nama_kru);
                  if (attList.length > 0) {
                    const att = attList[0];
                    setSkorHaraH(att.skor_h_higienis ?? 90);
                    setSkorHaraA1(att.skor_a_amanah ?? 85);
                    setSkorHaraR(att.skor_a_antusias ?? 88);
                    setSkorHaraA2(att.skor_r_resik ?? 92);
                  }
                }}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10.5px] font-bold shrink-0 cursor-pointer transition-colors shadow-2xs"
                title="Muat ulang nilai audit budaya HARA kru ini"
              >
                Sync Nilai HARA
              </button>
            </div>

            {/* 4 Pilar Budaya H.A.R.A (Input Nilai Objektif 0-100 Poin) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-white rounded-xl border border-[#E6E1DA]">
                <div className="flex justify-between font-bold text-[#181411] mb-1">
                  <span>H (Halal & Higienis)</span>
                  <span className="font-mono text-[#96171B] font-black">{skorHaraH} pt</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skorHaraH}
                  onChange={(e) => setSkorHaraH(Number(e.target.value))}
                  className="w-full accent-[#96171B] cursor-pointer"
                />
                <p className="text-[10px] text-[#645D55] mt-1">Grooming rapi, cuci tangan 6 langkah, 4 lap resmi</p>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-[#E6E1DA]">
                <div className="flex justify-between font-bold text-[#181411] mb-1">
                  <span>A (Amanah & Akurasi)</span>
                  <span className="font-mono text-[#96171B] font-black">{skorHaraA1} pt</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skorHaraA1}
                  onChange={(e) => setSkorHaraA1(Number(e.target.value))}
                  className="w-full accent-[#96171B] cursor-pointer"
                />
                <p className="text-[10px] text-[#645D55] mt-1">Kasir balance Rp 0 minus, timbang bumbu pas</p>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-[#E6E1DA]">
                <div className="flex justify-between font-bold text-[#181411] mb-1">
                  <span>R (Responsif & Disiplin)</span>
                  <span className="font-mono text-[#96171B] font-black">{skorHaraR} pt</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skorHaraR}
                  onChange={(e) => setSkorHaraR(Number(e.target.value))}
                  className="w-full accent-[#96171B] cursor-pointer"
                />
                <p className="text-[10px] text-[#645D55] mt-1">Hadir -15 mnt, zero handphone saat operasional</p>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-[#E6E1DA]">
                <div className="flex justify-between font-bold text-[#181411] mb-1">
                  <span>A (Adaptif & Kolaboratif)</span>
                  <span className="font-mono text-[#96171B] font-black">{skorHaraA2} pt</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skorHaraA2}
                  onChange={(e) => setSkorHaraA2(Number(e.target.value))}
                  className="w-full accent-[#96171B] cursor-pointer"
                />
                <p className="text-[10px] text-[#645D55] mt-1">Bantu stasiun lain rush hour, pelajari menu baru R&D</p>
              </div>
            </div>

            {/* Input Nilai Tes Psikologi SJT */}
            <div className="p-2.5 bg-white rounded-xl border border-[#E6E1DA]">
              <div className="flex justify-between font-semibold text-[#181411] mb-1">
                <span>Skor Tes Karakter SJT Kru (Bobot 40% Pilar 4)</span>
                <span className="font-mono text-[#96171B]">{skorPsikometriSJT}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={skorPsikometriSJT}
                onChange={(e) => setSkorPsikometriSJT(Number(e.target.value))}
                className="w-full accent-[#96171B]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Catatan Observasi Perilaku & Tombol Simpan */}
      <div className="pt-4 border-t border-[#E6E1DA] space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#181411] mb-1">
            Catatan Observasi Perilaku Trainer & Rencana Bimbingan:
          </label>
          <textarea
            rows={2}
            value={catatanPerilaku}
            onChange={(e) => setCatatanPerilaku(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#E6E1DA] text-xs text-[#181411] bg-[#FAF8F5]/50 focus:bg-white focus:outline-none focus:border-[#96171B]"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-[#645D55]">
            Penilai: <strong>Haikal Abi (Lead Trainer & People Dev)</strong> • Terverifikasi Standar QSR HARA
          </div>

          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 size={14} />
                <span>Nilai 360° Berhasil Disimpan!</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveAll}
              className="btn-primary-enterprise inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold"
            >
              <Save size={14} />
              <span>Simpan Penilaian 360° Kru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
