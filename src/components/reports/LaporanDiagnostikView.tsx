import React, { useState, useMemo } from 'react';
import { db } from '../../lib/storage';
import { CrewRadarData, Division, Outlet, Kru } from '../../types';
import { OfficialDiagnosticDocument } from './OfficialDiagnosticDocument';
import { calculateCompositeScore } from '../../lib/analyticsEngine';
import {
  FileCheck,
  Printer,
  Search,
  Filter,
  Eye,
  User,
  ShieldCheck,
  Award,
  ChevronRight,
  Download,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface LaporanDiagnostikViewProps {
  selectedOutletCode: string;
}

export const LaporanDiagnostikView: React.FC<LaporanDiagnostikViewProps> = ({
  selectedOutletCode,
}) => {
  const [outletFilter, setOutletFilter] = useState<string>(selectedOutletCode);
  const [stationFilter, setStationFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCrewForDoc, setActiveCrewForDoc] = useState<CrewRadarData | null>(null);

  const outlets = db.getTable<Outlet>('outlets');
  const allKru = db.getTable<Kru>('kru');
  const competencySummaries = db.getCrewCompetencySummaries();

  // Map crew into CrewRadarData items
  const radarList: CrewRadarData[] = useMemo(() => {
    return allKru.map((kru) => {
      const summary = competencySummaries.find((s) => s.namaKru === kru.nama_kru);
      const teori = summary?.skorTeori ?? 86;
      const praktik = summary?.skorPraktik ?? 88;
      const lisan = summary?.skorLisan ?? 85;
      const sikapHara = Math.round((teori * 0.4 + lisan * 0.6) * 10) / 10;
      const rush = Math.round((praktik * 0.85 + (teori > 80 ? 12 : 5)) * 10) / 10;
      const sos = kru.divisi === 'Kasir' ? 78 : kru.divisi === 'Geprek' ? 88 : 82;
      const comp = calculateCompositeScore(teori, praktik, sikapHara, rush);

      return {
        nama_kru: kru.nama_kru,
        divisi: kru.divisi,
        kode_outlet: kru.kode_outlet,
        teori_sop: teori,
        praktik_jobdesk: praktik,
        sikap_hara: sikapHara,
        ketahanan_rush: rush,
        kecepatan_sos: sos,
        skor_komposit: comp.total_composite,
        status_kelulusan: comp.status,
      };
    });
  }, [allKru, competencySummaries]);

  // Filtered radar list
  const filteredList = useMemo(() => {
    return radarList.filter((item) => {
      if (outletFilter !== 'ALL' && item.kode_outlet !== outletFilter) return false;
      if (stationFilter !== 'ALL' && item.divisi !== stationFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.nama_kru.toLowerCase().includes(q) && !item.kode_outlet.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [radarList, outletFilter, stationFilter, searchQuery]);

  if (activeCrewForDoc) {
    return (
      <OfficialDiagnosticDocument
        radarData={activeCrewForDoc}
        onBack={() => setActiveCrewForDoc(null)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in">
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-red-50 text-[#8B1418] border border-red-200 px-2 py-0.5 rounded font-mono">
                DIAGNOSTIC ARCHIVE
              </span>
              <span className="text-xs text-stone-400 font-medium">HARA Chicken Outlet Network</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight mt-0.5">
              Lembar Laporan Diagnostik Resmi A4
            </h1>
            <p className="text-xs text-stone-500">
              Dokumen evaluasi berkop resmi perusahaan lengkap dengan grafik radar 5-axis, skor 4-faktor, dan rekomendasi preskriptif.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-stone-500 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
              Total {filteredList.length} Berkas Aktif
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-stone-200">
              <Filter size={13} className="text-stone-500" />
              <span className="text-xs font-bold text-stone-600">Cabang:</span>
              <select
                value={outletFilter}
                onChange={(e) => setOutletFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-stone-900 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">Semua Cabang ({radarList.length} Kru)</option>
                {outlets.map((o) => (
                  <option key={o.kode_outlet} value={o.kode_outlet}>
                    {o.nama_outlet} ({o.kode_outlet})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-stone-200">
              <span className="text-xs font-bold text-stone-600">Jobdesk:</span>
              <select
                value={stationFilter}
                onChange={(e) => setStationFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-stone-900 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">Semua 4 Jobdesk</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Kasir">Kasir</option>
                <option value="Geprek">Geprek</option>
                <option value="Helper">Helper</option>
              </select>
            </div>
          </div>

          <div className="relative min-w-[200px] w-full sm:w-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari personil kru..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 placeholder:text-stone-400 focus:bg-white focus:border-[#8B1418] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Table of Diagnostic Files */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-stone-200 font-mono text-[10.5px] uppercase tracking-wider text-stone-600">
              <tr>
                <th className="py-3 px-4">Personil Kru</th>
                <th className="py-3 px-3">Jobdesk</th>
                <th className="py-3 px-3">Cabang</th>
                <th className="py-3 px-3 text-center">Teori (25%)</th>
                <th className="py-3 px-3 text-center">Praktik (35%)</th>
                <th className="py-3 px-3 text-center">H.A.R.A (25%)</th>
                <th className="py-3 px-3 text-center">Rush (15%)</th>
                <th className="py-3 px-3 text-center">Skor Komposit</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredList.map((crew) => (
                <tr key={crew.nama_kru} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-50 text-[#8B1418] flex items-center justify-center font-bold font-mono text-xs">
                        {crew.nama_kru.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-stone-900 block">{crew.nama_kru}</span>
                        <span className="text-[10px] text-stone-400 font-mono">ID: KRU-{crew.nama_kru.slice(0, 3).toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded font-mono text-[10px]">
                      {crew.divisi}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-stone-600">
                    {crew.kode_outlet}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-stone-700">
                    {crew.teori_sop}%
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-[#8B1418]">
                    {crew.praktik_jobdesk}%
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-amber-700">
                    {crew.sikap_hara}%
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-emerald-700">
                    {crew.ketahanan_rush}%
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-black text-sm text-stone-900">
                      {crew.skor_komposit}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block ${
                        crew.status_kelulusan === 'Kompeten Mandiri'
                          ? 'bg-emerald-100 text-emerald-800'
                          : crew.status_kelulusan === 'Butuh Pendampingan'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {crew.status_kelulusan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setActiveCrewForDoc(crew)}
                      className="px-3 py-1.5 bg-[#8B1418] hover:bg-[#720e12] text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-98"
                    >
                      <Printer size={13} />
                      <span>Buka Lembar A4</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
