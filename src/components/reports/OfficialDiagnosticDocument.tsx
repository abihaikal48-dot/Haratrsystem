import React from 'react';
import { CrewRadarData, Division } from '../../types';
import { CrewRadarChart } from '../analytics/CrewRadarChart';
import { calculateCompositeScore, generateDiagnosticActionPlan } from '../../lib/analyticsEngine';
import { Printer, Download, ArrowLeft, ShieldCheck, Award } from 'lucide-react';

interface OfficialDiagnosticDocumentProps {
  radarData: CrewRadarData;
  onBack?: () => void;
  trainerName?: string;
  kepalaOutletName?: string;
  documentNo?: string;
  tanggalAsesmen?: string;
}

export const OfficialDiagnosticDocument: React.FC<OfficialDiagnosticDocumentProps> = ({
  radarData,
  onBack,
  trainerName = 'Haikal Abi (Lead Field Trainer)',
  kepalaOutletName = 'Rian Hidayat (Kepala Outlet)',
  documentNo = `DOC-HARA-DIAG-${Math.floor(1000 + Math.random() * 9000)}`,
  tanggalAsesmen = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }),
}) => {
  const composite = calculateCompositeScore(
    radarData.teori_sop,
    radarData.praktik_jobdesk,
    radarData.sikap_hara,
    radarData.ketahanan_rush
  );

  const actionPlan = generateDiagnosticActionPlan(
    radarData.nama_kru,
    radarData.divisi,
    radarData
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12 animate-in fade-in">
      
      {/* Action Bar (Hidden on Print) */}
      <div className="print:hidden flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Kembali</span>
            </button>
          )}
          <span className="text-xs font-black text-stone-800">
            Lembar Laporan Diagnostik Resmi A4
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-[#8B1418] hover:bg-[#720e12] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <Printer size={14} />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* DOKUMEN RESMI A4 (PRINT READY SHEET) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-300 p-6 sm:p-10 shadow-md text-stone-900 print:border-none print:shadow-none print:p-0 print:m-0 space-y-6">
        
        {/* KOP RESMI PERUSAHAAN HARA CHICKEN */}
        <div className="border-b-2 border-stone-900 pb-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl font-black tracking-wider text-[#8B1418] font-mono">
                HARA CHICKEN INDONESIA
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                #BeneranDiGeprek
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-widest">
              Laporan Diagnostik Kompetensi Kru & Evaluasi Lapangan
            </h1>
            <p className="text-[10.5px] text-stone-500">
              Sistem Operasional & Pelatihan Terstandar (HARA OPS) &bull; Harapan Rakyat F&B Network
            </p>
          </div>

          <div className="text-right shrink-0 font-mono text-[10.5px] text-stone-600 space-y-0.5">
            <div><b>No. Dokumen:</b> {documentNo}</div>
            <div><b>Tanggal:</b> {tanggalAsesmen}</div>
            <div className="text-[#8B1418] font-bold">STATUS: DOKUMEN RESMI</div>
          </div>
        </div>

        {/* DATA IDENTITAS KRU & OUTLET */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
          <div>
            <span className="text-[10px] text-stone-400 font-bold block">NAMA KRU</span>
            <span className="font-black text-stone-900 text-sm">{radarData.nama_kru}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold block">STASIUN KERJA</span>
            <span className="font-bold text-[#8B1418]">{radarData.divisi}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold block">CABANG OUTLET</span>
            <span className="font-bold text-stone-800">{radarData.kode_outlet}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold block">LEAD TRAINER</span>
            <span className="font-bold text-stone-800">{trainerName}</span>
          </div>
        </div>

        {/* BAGIAN UTAMA: RADAR KOMPETENSI & SKOR KOMPOSIT TERBOBOT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border border-stone-200 rounded-2xl p-5 bg-[#FAF8F5]/60">
          
          {/* Kolom Kiri: Visualisasi Radar */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2 font-mono">
              POLA RADAR KOMPETENSI 5-AXIS
            </span>
            <CrewRadarChart data={radarData} size={260} showLabels={true} />
          </div>

          {/* Kolom Kanan: Rincian 4 Faktor Terbobot */}
          <div className="md:col-span-6 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8B1418] font-mono block">
              KOMPONEN SKOR KOMPOSIT OBJEKTIF
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-white border border-stone-200">
                <span>1. Pemahaman Teori SOP (Bobot 25%)</span>
                <b className="font-mono">{composite.teori_score} &rarr; {composite.teori_weighted} pt</b>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-white border border-stone-200">
                <span>2. Keterampilan Praktik Stasiun (Bobot 35%)</span>
                <b className="font-mono">{composite.praktik_score} &rarr; {composite.praktik_weighted} pt</b>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-white border border-stone-200">
                <span>3. Nilai Budaya H.A.R.A (Bobot 25%)</span>
                <b className="font-mono">{composite.sikap_score} &rarr; {composite.sikap_weighted} pt</b>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-white border border-stone-200">
                <span>4. Ketahanan Jam Sibuk / Rush (Bobot 15%)</span>
                <b className="font-mono">{composite.rush_score} &rarr; {composite.rush_weighted} pt</b>
              </div>
            </div>

            {/* Total Komposit Box */}
            <div className="p-3.5 rounded-xl bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-mono">
                  TOTAL SKOR AKHIR
                </span>
                <span className="text-xl font-black font-mono text-amber-300">
                  {composite.total_composite} / 100
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block">KATEGORI KELULUSAN</span>
                <span className="text-xs font-black uppercase tracking-wide px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {composite.status}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* DIAGNOSA AKAR MASALAH & BUKTI OBSERVASI EMPIRIS */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider border-b border-stone-200 pb-1">
            Diagnosa Akar Masalah & Rekomendasi Tindakan Trainer
          </h3>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2 leading-relaxed">
            <div>
              <b className="text-stone-900 block mb-0.5">Rekomendasi Utama:</b>
              <p className="text-stone-700">{actionPlan.rekomendasiUtama}</p>
            </div>

            <div className="pt-2 border-t border-stone-200/80">
              <b className="text-stone-900 block mb-1">Rencana Tindak Lanjut Perbaikan (Action Plan):</b>
              <ul className="space-y-1 text-stone-700">
                {actionPlan.langkahPerbaikan.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#8B1418] font-bold">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-[11px] text-stone-500 pt-1 font-mono">
              Target Evaluasi Ulang: Dalam {actionPlan.targetReviewHari} hari kalender sejak laporan ini diterbitkan.
            </div>
          </div>
        </div>

        {/* 3 KOLOM TANDA TANGAN RESMI */}
        <div className="pt-8 border-t border-stone-200 grid grid-cols-3 gap-6 text-center text-xs">
          
          <div className="space-y-12">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Kru Yang Dinilai
            </span>
            <div className="border-t border-stone-400 pt-1.5 mx-auto max-w-[160px]">
              <span className="font-bold text-stone-900 block">{radarData.nama_kru}</span>
              <span className="text-[10px] text-stone-500">Kru Stasiun {radarData.divisi}</span>
            </div>
          </div>

          <div className="space-y-12">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Kepala Outlet (Store Manager)
            </span>
            <div className="border-t border-stone-400 pt-1.5 mx-auto max-w-[160px]">
              <span className="font-bold text-stone-900 block">{kepalaOutletName}</span>
              <span className="text-[10px] text-stone-500">Penanggung Jawab Outlet</span>
            </div>
          </div>

          <div className="space-y-12">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Lead Field Trainer
            </span>
            <div className="border-t border-stone-400 pt-1.5 mx-auto max-w-[160px]">
              <span className="font-bold text-stone-900 block">{trainerName}</span>
              <span className="text-[10px] text-stone-500">Divisi Pelatihan & Mutu HARA</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
