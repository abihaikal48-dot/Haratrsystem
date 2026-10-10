import React, { useState } from 'react';
import { Division } from '../../types';
import { HARA_OFFICIAL_JOBDESKS } from '../../data/haraCulture';
import { db } from '../../lib/storage';
import {
  Award,
  CheckCircle2,
  Clock,
  Flame,
  Search,
  BookOpen,
  AlertTriangle,
  Play,
  FileCheck,
  ChevronRight,
  Eye,
  X,
  FileText,
} from 'lucide-react';

import { OFFICIAL_HARA_SOP_DATABASE } from '../../lib/sopData';

interface StationWorkspaceViewProps {
  onStartStationAudit?: (station: Division) => void;
  onOpenStationExam?: (station: Division) => void;
}

export const StationWorkspaceView: React.FC<StationWorkspaceViewProps> = ({
  onStartStationAudit,
  onOpenStationExam,
}) => {
  const [selectedStation, setSelectedStation] = useState<Division>('Kitchen');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingSop, setViewingSop] = useState<any | null>(null);

  const [allSops, setAllSops] = useState<any[]>(() => {
    const fromDb = db.getTable<any>('bank_sop');
    return fromDb && fromDb.length > 0 ? fromDb : OFFICIAL_HARA_SOP_DATABASE;
  });

  React.useEffect(() => {
    const sync = () => {
      const fromDb = db.getTable<any>('bank_sop');
      setAllSops(fromDb && fromDb.length > 0 ? fromDb : OFFICIAL_HARA_SOP_DATABASE);
    };
    sync();
    const unsub = db.subscribe('*', sync);
    return () => unsub();
  }, []);

  const stationDetail = HARA_OFFICIAL_JOBDESKS[selectedStation];

  // Filter SOP sesuai divisi stasiun terpilih
  const stationSops = allSops.filter(
    (sop) =>
      (!sop.divisi || sop.divisi === selectedStation || sop.divisi === 'Semua') &&
      (!searchQuery ||
        (sop.judul_sop && sop.judul_sop.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sop.kategori && sop.kategori.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sop.kode_sop && sop.kode_sop.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in">
      
      {/* Top Header & 4 Stasiun Selector */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-[#8B1418] border border-red-200 px-2 py-0.5 rounded font-mono">
                STATION EXCELLENCE
              </span>
              <span className="text-xs text-stone-400 font-medium">HARA Chicken Gerai Standards</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              Workspace 4 Jobdesk Resmi Gerai
            </h1>
            <p className="text-xs text-stone-500">
              Pusat referensi prosedur baku, checklist mutu kritis, dan evaluasi harian stasiun kerja.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onStartStationAudit && (
              <button
                type="button"
                onClick={() => onStartStationAudit(selectedStation)}
                className="px-4 py-2 bg-[#8B1418] hover:bg-[#700f13] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
              >
                <FileCheck size={14} />
                <span>Audit Stasiun {selectedStation}</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Jobdesk Big Interactive Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(['Kitchen', 'Kasir', 'Geprek', 'Helper'] as Division[]).map((div) => {
            const isSelected = selectedStation === div;
            const detail = HARA_OFFICIAL_JOBDESKS[div];

            return (
              <button
                key={div}
                type="button"
                onClick={() => setSelectedStation(div)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#8B1418] bg-red-50/50 shadow-xs ring-1 ring-[#8B1418]/20'
                    : 'border-stone-200 bg-white hover:bg-stone-50/80 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded ${
                      isSelected ? 'bg-[#8B1418] text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {div}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-stone-500 font-mono bg-stone-100/80 px-1.5 py-0.5 rounded border border-stone-200/60">
                      {allSops.filter((s: any) => s.divisi === div).length} SOP
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#8B1418] animate-pulse" />}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-black text-stone-900 leading-tight">
                    {detail.title.split('(')[0]}
                  </h3>
                  <span className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                    {detail.tagline}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Station Info & SOP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Kolom Kiri: Standar Kritis & KPI Stasiun */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div>
              <span className="text-[10.5px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                {stationDetail.tagline}
              </span>
              <h2 className="text-base font-black text-stone-900 tracking-tight mt-1.5">
                {stationDetail.title}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {stationDetail.subtitle}
              </p>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed bg-[#FAF8F5] p-3 rounded-xl border border-stone-200">
              {stationDetail.focusArea}
            </p>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-stone-800 block">Target KPI Stasiun:</span>
              <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                {stationDetail.kpiTarget}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-stone-800 block">Titik Kontrol Pangan (HACCP):</span>
              <div className="text-xs text-stone-700 font-medium bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                {stationDetail.safetyHaccp}
              </div>
            </div>

            {onOpenStationExam && (
              <button
                type="button"
                onClick={() => onOpenStationExam(selectedStation)}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Play size={13} className="text-amber-400" />
                <span>Uji Kuis Modul {selectedStation}</span>
              </button>
            )}
          </div>

          {/* 5 Parameter Mutu Kritis */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} className="text-[#8B1418]" />
              <span>5 Parameter Mutu Kritis:</span>
            </h3>

            <div className="space-y-2">
              {stationDetail.criticalParameters.map((param, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs text-stone-800"
                >
                  <span className="w-4 h-4 rounded-full bg-[#8B1418] text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-snug">{param}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Bank SOP Stasiun Terurut */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            
            {/* Search SOP */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-stone-900 tracking-tight">
                  Katalog Prosedur Baku (SOP) Stasiun {selectedStation}
                </h3>
                <span className="text-xs text-stone-500">
                  Total {stationSops.length} Prosedur Standar Operasional Terdaftar
                </span>
              </div>

              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari prosedur SOP..."
                  className="w-full text-xs pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-[#8B1418]"
                />
                <Search size={14} className="absolute left-2.5 top-2.5 text-stone-400" />
              </div>
            </div>

            {/* List SOP Items */}
            <div className="space-y-3">
              {stationSops.length === 0 ? (
                <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                  Tidak ditemukan SOP yang sesuai dengan pencarian.
                </div>
              ) : (
                stationSops.map((sop, idx) => (
                  <div
                    key={sop.id || idx}
                    className="p-4 rounded-xl border border-stone-200 hover:border-stone-300 bg-[#FAF8F5]/60 hover:bg-white transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold text-stone-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                            {sop.kode_sop || `SOP-${selectedStation.toUpperCase()}-0${idx + 1}`}
                          </span>
                          <span className="text-[10.5px] font-bold text-[#8B1418] bg-red-50 px-2 py-0.5 rounded">
                            {sop.kategori}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-stone-900">
                          {sop.judul_sop}
                        </h4>
                      </div>

                      {sop.standar_waktu && (
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-stone-500 shrink-0 bg-white px-2 py-1 rounded-lg border border-stone-200">
                          <Clock size={12} className="text-amber-600" />
                          <span>{sop.standar_waktu}</span>
                        </div>
                      )}
                    </div>

                    {/* Langkah-langkah Terurut */}
                    {sop.langkah && sop.langkah.length > 0 && (
                      <div className="pt-2 border-t border-stone-200/70 space-y-1.5">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                          Tahapan Prosedur Kerja:
                        </span>
                        <div className="space-y-1 text-xs text-stone-700">
                          {sop.langkah.slice(0, 4).map((step: string, sIdx: number) => (
                            <div key={sIdx} className="flex items-start gap-2">
                              <span className="font-mono font-bold text-stone-400 text-[10px] mt-0.5">
                                {sIdx + 1}.
                              </span>
                              <span className="leading-snug">{step}</span>
                            </div>
                          ))}
                          {sop.langkah.length > 4 && (
                            <span className="text-[10.5px] font-bold text-stone-400 pl-4 block">
                              + {sop.langkah.length - 4} langkah kerja lanjutan...
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Poin Kritis */}
                    {sop.poin_kritis && (
                      <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5">
                        <AlertTriangle size={13} className="text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <b className="font-bold">Titik Kritis Mutu: </b>
                          <span>{sop.poin_kritis}</span>
                        </div>
                      </div>
                    )}

                    {/* Tombol Buka Lengkap */}
                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setViewingSop(sop)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[#8B1418] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>Buka Detail SOP Lengkap</span>
                      </button>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {sop.sumber || 'Dokumen Standar CV. Ultima Rasa'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Modal Detail SOP Lengkap */}
      {viewingSop && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-start justify-between bg-stone-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#8B1418] text-white">
                    {viewingSop.kode_sop}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                    Stasiun {viewingSop.divisi}
                  </span>
                  {viewingSop.standar_waktu && (
                    <span className="text-[10px] font-mono text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                      ⏱️ {viewingSop.standar_waktu}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-black text-stone-900 leading-snug">
                  {viewingSop.judul_sop}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingSop(null)}
                className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-stone-700 leading-relaxed">
              {/* Tujuan */}
              {viewingSop.tujuan && (
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 mb-1 flex items-center gap-1.5 text-xs">
                    <FileText size={14} className="text-[#8B1418]" />
                    <span>Tujuan Prosedur:</span>
                  </h4>
                  <p>{viewingSop.tujuan}</p>
                </div>
              )}

              {/* Peralatan & Bahan */}
              {viewingSop.alat_bahan && (
                <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200/80">
                  <h4 className="font-bold text-[#8B1418] mb-1 flex items-center gap-1.5 text-xs">
                    <Award size={14} />
                    <span>Peralatan & Bahan Baku Standar:</span>
                  </h4>
                  <p className="text-stone-800">{viewingSop.alat_bahan}</p>
                </div>
              )}

              {/* Tahapan Langkah Kerja Lengkap */}
              {viewingSop.langkah && viewingSop.langkah.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Tahapan Langkah Kerja ({viewingSop.langkah.length} Langkah):</span>
                  </h4>
                  <div className="space-y-2">
                    {viewingSop.langkah.map((step: string, sIdx: number) => (
                      <div
                        key={sIdx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#8B1418] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="leading-relaxed text-stone-800">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Titik Kritis HACCP */}
              {viewingSop.poin_kritis && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <h4 className="font-bold mb-1 flex items-center gap-1.5 text-xs">
                    <AlertTriangle size={14} className="text-amber-700" />
                    <span>Titik Kritis Mutu & Keamanan Pangan (HACCP):</span>
                  </h4>
                  <p>{viewingSop.poin_kritis}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <span className="text-[10px] font-mono text-stone-500">
                {viewingSop.sumber || 'Dokumen Resmi Departemen RnD & Operasional'}
              </span>
              <button
                type="button"
                onClick={() => setViewingSop(null)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
