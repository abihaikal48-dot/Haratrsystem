import React, { useState } from 'react';
import {
  X, Check, AlertTriangle, CheckCircle2, Save, Store,
  Sparkles, Layers, ShieldCheck, Star, Award, RotateCcw
} from 'lucide-react';
import { db } from '../../lib/storage';
import { OfficialAuditReport, Outlet } from '../../types';
import { OFFICIAL_HARA_AUDIT_BANTUL } from '../../lib/officialAuditData';

interface AuditKinerjaOutletFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  targetOutletCode?: string;
}

export const AuditKinerjaOutletFormModal: React.FC<AuditKinerjaOutletFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  targetOutletCode = 'HC-BTL01',
}) => {
  if (!isOpen) return null;

  const outlets = db.getTable<Outlet>('outlets');
  const existingAudits = db.getTable<OfficialAuditReport>('official_audits');

  const [selectedOutlet, setSelectedOutlet] = useState<string>(targetOutletCode);
  const [activeTab, setActiveTab] = useState<'service' | 'kualitas' | 'kebersihan' | 'leadership' | 'cs'>('service');

  // Load existing audit or clone template
  const initialData = () => {
    const found = existingAudits.find((a) => a.kode_outlet === selectedOutlet);
    if (found) return JSON.parse(JSON.stringify(found)) as OfficialAuditReport;
    const outletInfo = outlets.find((o) => o.kode_outlet === selectedOutlet) || outlets[0];
    const clone = JSON.parse(JSON.stringify(OFFICIAL_HARA_AUDIT_BANTUL)) as OfficialAuditReport;
    clone.id = 'audit-' + selectedOutlet.toLowerCase() + '-' + Date.now();
    clone.kode_outlet = selectedOutlet;
    clone.nama_outlet = outletInfo?.nama_outlet || selectedOutlet;
    clone.alamat_outlet = outletInfo?.alamat || 'Alamat Cabang';
    clone.kepala_outlet = outletInfo?.kepala_outlet || 'Store Manager';
    clone.nomor_dokumen = `RKO-HARA/2026/08/${selectedOutlet.replace('HC-', '')}-01`;
    return clone;
  };

  const [formData, setFormData] = useState<OfficialAuditReport>(initialData);

  // Recalculate Scores Function
  const recalculate = (report: OfficialAuditReport) => {
    // 1. Service (Bobot 25)
    let srvTotalItems = 0;
    let srvPassedItems = 0;
    report.pilar_service.sub_kategori.forEach((sub) => {
      sub.total_butir = sub.items.length;
      sub.terpenuhi_butir = sub.items.filter((i) => i.terpenuhi).length;
      sub.persentase = Math.round((sub.terpenuhi_butir / sub.total_butir) * 100);
      srvTotalItems += sub.total_butir;
      srvPassedItems += sub.terpenuhi_butir;
    });
    report.pilar_service.capaian_persen = Math.round((srvPassedItems / (srvTotalItems || 1)) * 100);
    report.pilar_service.skor_didapat = Number(((report.pilar_service.capaian_persen / 100) * 25).toFixed(1));

    // 2. Kualitas (Bobot 20)
    let qTotalItems = 0;
    let qPassedItems = 0;
    report.pilar_kualitas.sub_kategori.forEach((sub) => {
      sub.total_butir = sub.items.length;
      sub.terpenuhi_butir = sub.items.filter((i) => i.terpenuhi).length;
      sub.persentase = Math.round((sub.terpenuhi_butir / sub.total_butir) * 100);
      qTotalItems += sub.total_butir;
      qPassedItems += sub.terpenuhi_butir;
    });
    report.pilar_kualitas.capaian_persen = Math.round((qPassedItems / (qTotalItems || 1)) * 100);
    report.pilar_kualitas.skor_didapat = Number(((report.pilar_kualitas.capaian_persen / 100) * 20).toFixed(1));

    // 3. Kebersihan (Bobot 20)
    let clTotalItems = 0;
    let clPassedItems = 0;
    report.pilar_kebersihan.sub_kategori.forEach((sub) => {
      sub.total_butir = sub.items.length;
      sub.terpenuhi_butir = sub.items.filter((i) => i.terpenuhi).length;
      sub.persentase = Math.round((sub.terpenuhi_butir / sub.total_butir) * 100);
      clTotalItems += sub.total_butir;
      clPassedItems += sub.terpenuhi_butir;
    });
    report.pilar_kebersihan.capaian_persen = Math.round((clPassedItems / (clTotalItems || 1)) * 100);
    report.pilar_kebersihan.skor_didapat = Number(((report.pilar_kebersihan.capaian_persen / 100) * 20).toFixed(1));

    // 4. Leadership (Bobot 20)
    let ldTotalItems = 0;
    let ldPassedItems = 0;
    report.pilar_leadership.sub_kategori.forEach((sub) => {
      sub.total_butir = sub.items.length;
      sub.terpenuhi_butir = sub.items.filter((i) => i.terpenuhi).length;
      sub.persentase = Math.round((sub.terpenuhi_butir / sub.total_butir) * 100);
      ldTotalItems += sub.total_butir;
      ldPassedItems += sub.terpenuhi_butir;
    });
    report.pilar_leadership.capaian_persen = Math.round((ldPassedItems / (ldTotalItems || 1)) * 100);
    report.pilar_leadership.skor_didapat = Number(((report.pilar_leadership.capaian_persen / 100) * 20).toFixed(1));

    // 5. Total Komposit
    const totalKomposit = Number((
      report.pilar_service.skor_didapat +
      report.pilar_kualitas.skor_didapat +
      report.pilar_kebersihan.skor_didapat +
      report.pilar_leadership.skor_didapat +
      report.kepuasan_pelanggan.skor_bobot_didapat
    ).toFixed(1));

    report.nilai_akhir_komposit = totalKomposit;
    report.grade_mutu = totalKomposit >= 85 ? 'A (Sangat Baik)' :
      totalKomposit >= 75 ? 'B (Baik)' :
      totalKomposit >= 65 ? 'C (Cukup)' : 'D (Perlu Pendampingan Kritis)';

    return { ...report };
  };

  const handleToggleItem = (pilarKey: 'pilar_service' | 'pilar_kualitas' | 'pilar_kebersihan' | 'pilar_leadership', subIdx: number, itemIdx: number) => {
    const updated = JSON.parse(JSON.stringify(formData)) as OfficialAuditReport;
    const currentVal = updated[pilarKey].sub_kategori[subIdx].items[itemIdx].terpenuhi;
    updated[pilarKey].sub_kategori[subIdx].items[itemIdx].terpenuhi = !currentVal;
    setFormData(recalculate(updated));
  };

  const handleSetAllInPilar = (pilarKey: 'pilar_service' | 'pilar_kualitas' | 'pilar_kebersihan' | 'pilar_leadership', status: boolean) => {
    const updated = JSON.parse(JSON.stringify(formData)) as OfficialAuditReport;
    updated[pilarKey].sub_kategori.forEach((sub) => {
      sub.items.forEach((item) => {
        item.terpenuhi = status;
      });
    });
    setFormData(recalculate(updated));
  };

  const handleSave = () => {
    const list = db.getTable<OfficialAuditReport>('official_audits');
    const existingIdx = list.findIndex((a) => a.kode_outlet === formData.kode_outlet);

    if (existingIdx >= 0) {
      db.updateRow('official_audits', list[existingIdx].id, formData);
    } else {
      db.insertRow('official_audits', formData);
    }

    db.addLog('UBAH', 'Audit Resmi', `Memperbarui audit kinerja resmi untuk ${formData.nama_outlet} (Skor: ${formData.nilai_akhir_komposit})`);
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#7a0f12] to-[#8B1418] text-white p-5 px-6 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-red-200">
              AUDIT FORM • STANDAR RESMI 10 HALAMAN HARA
            </div>
            <h3 className="text-lg font-black text-white mt-0.5">
              Input & Kalibrasi Audit Kinerja Outlet
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Gerai Bar & Score Preview */}
        <div className="bg-stone-50 border-b border-stone-200 p-4 px-6 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <Store size={16} className="text-[#8B1418]" />
            <span className="text-xs font-bold text-stone-700">Gerai:</span>
            <select
              value={selectedOutlet}
              onChange={(e) => {
                setSelectedOutlet(e.target.value);
                const found = existingAudits.find((a) => a.kode_outlet === e.target.value);
                if (found) {
                  setFormData(JSON.parse(JSON.stringify(found)));
                } else {
                  const outletInfo = outlets.find((o) => o.kode_outlet === e.target.value);
                  const clone = JSON.parse(JSON.stringify(OFFICIAL_HARA_AUDIT_BANTUL)) as OfficialAuditReport;
                  clone.id = 'audit-' + e.target.value.toLowerCase() + '-' + Date.now();
                  clone.kode_outlet = e.target.value;
                  clone.nama_outlet = outletInfo?.nama_outlet || e.target.value;
                  clone.nomor_dokumen = `RKO-HARA/2026/08/${e.target.value.replace('HC-', '')}-01`;
                  setFormData(clone);
                }
              }}
              className="px-3 py-1 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-800 focus:outline-hidden"
            >
              {outlets.map((o) => (
                <option key={o.kode_outlet} value={o.kode_outlet}>
                  {o.nama_outlet} ({o.kode_outlet})
                </option>
              ))}
            </select>
          </div>

          {/* Realtime Score Badge */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Nilai Akhir:</span>
              <strong className="text-xl font-black text-[#8B1418]">{formData.nilai_akhir_komposit}</strong>
              <span className="text-stone-400 font-bold">/ 100</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Grade: {formData.grade_mutu}
            </span>
          </div>
        </div>

        {/* 5 Pillars Tab Navigation */}
        <div className="flex border-b border-stone-200 px-6 bg-stone-100/50 text-xs font-bold shrink-0 overflow-x-auto">
          {[
            { id: 'service', label: '1. Service (25 Poin)', score: formData.pilar_service?.skor_didapat },
            { id: 'kualitas', label: '2. Kualitas (20 Poin)', score: formData.pilar_kualitas?.skor_didapat },
            { id: 'kebersihan', label: '3. Kebersihan (20 Poin)', score: formData.pilar_kebersihan?.skor_didapat },
            { id: 'leadership', label: '4. Leadership (20 Poin)', score: formData.pilar_leadership?.skor_didapat },
            { id: 'cs', label: '5. Rating & CS (15 Poin)', score: formData.kepuasan_pelanggan?.skor_bobot_didapat },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 border-b-2 font-bold cursor-pointer transition-colors whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#8B1418] text-[#8B1418] bg-white'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-stone-200 text-stone-700">
                {tab.score}
              </span>
            </button>
          ))}
        </div>

        {/* Body: Checklist Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Service Tab */}
          {activeTab === 'service' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="text-xs text-stone-600 font-medium">Aksi Cepat Checklist Pilar Service:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetAllInPilar('pilar_service', true)}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px] hover:bg-emerald-100 cursor-pointer"
                  >
                    Centang Semua Sesuai
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllInPilar('pilar_service', false)}
                    className="px-2.5 py-1 bg-stone-100 text-stone-600 border border-stone-200 rounded-lg font-bold text-[11px] hover:bg-stone-200 cursor-pointer"
                  >
                    Reset Temuan
                  </button>
                </div>
              </div>

              {formData.pilar_service.sub_kategori.map((sub, sIdx) => (
                <div key={sub.kode} className="border border-stone-200 rounded-xl overflow-hidden">
                  <div className="bg-stone-100/70 px-4 py-2 font-bold text-stone-800 flex justify-between items-center">
                    <span>Sub {sub.kode}: {sub.nama}</span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {sub.terpenuhi_butir} / {sub.total_butir} Terpenuhi ({sub.persentase}%)
                    </span>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {sub.items.map((item, iIdx) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem('pilar_service', sIdx, iIdx)}
                        className={`p-2.5 px-4 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          item.terpenuhi ? 'hover:bg-stone-50' : 'bg-red-50/50 hover:bg-red-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1">
                          <input
                            type="checkbox"
                            checked={item.terpenuhi}
                            onChange={() => {}}
                            className="rounded text-[#8B1418] focus:ring-[#8B1418] h-4 w-4 shrink-0"
                          />
                          <span className={`text-xs ${item.terpenuhi ? 'text-stone-800 font-medium' : 'text-red-900 font-bold'}`}>
                            {item.pernyataan}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          item.terpenuhi ? 'bg-emerald-50 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.terpenuhi ? 'Sesuai' : 'Temuan'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Kualitas Tab */}
          {activeTab === 'kualitas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="text-xs text-stone-600 font-medium">Aksi Cepat Checklist Pilar Kualitas:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetAllInPilar('pilar_kualitas', true)}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px] hover:bg-emerald-100 cursor-pointer"
                  >
                    Centang Semua Sesuai
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllInPilar('pilar_kualitas', false)}
                    className="px-2.5 py-1 bg-stone-100 text-stone-600 border border-stone-200 rounded-lg font-bold text-[11px] hover:bg-stone-200 cursor-pointer"
                  >
                    Reset Temuan
                  </button>
                </div>
              </div>

              {formData.pilar_kualitas.sub_kategori.map((sub, sIdx) => (
                <div key={sub.kode} className="border border-stone-200 rounded-xl overflow-hidden">
                  <div className="bg-stone-100/70 px-4 py-2 font-bold text-stone-800 flex justify-between items-center">
                    <span>Sub {sub.kode}: {sub.nama}</span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {sub.terpenuhi_butir} / {sub.total_butir} Terpenuhi ({sub.persentase}%)
                    </span>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {sub.items.map((item, iIdx) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem('pilar_kualitas', sIdx, iIdx)}
                        className={`p-2.5 px-4 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          item.terpenuhi ? 'hover:bg-stone-50' : 'bg-red-50/50 hover:bg-red-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1">
                          <input
                            type="checkbox"
                            checked={item.terpenuhi}
                            onChange={() => {}}
                            className="rounded text-[#8B1418] focus:ring-[#8B1418] h-4 w-4 shrink-0"
                          />
                          <span className={`text-xs ${item.terpenuhi ? 'text-stone-800 font-medium' : 'text-red-900 font-bold'}`}>
                            {item.pernyataan}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          item.terpenuhi ? 'bg-emerald-50 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.terpenuhi ? 'Sesuai' : 'Temuan'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Kebersihan Tab */}
          {activeTab === 'kebersihan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="text-xs text-stone-600 font-medium">Aksi Cepat Checklist Pilar Kebersihan:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetAllInPilar('pilar_kebersihan', true)}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px] hover:bg-emerald-100 cursor-pointer"
                  >
                    Centang Semua Sesuai
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllInPilar('pilar_kebersihan', false)}
                    className="px-2.5 py-1 bg-stone-100 text-stone-600 border border-stone-200 rounded-lg font-bold text-[11px] hover:bg-stone-200 cursor-pointer"
                  >
                    Reset Temuan
                  </button>
                </div>
              </div>

              {formData.pilar_kebersihan.sub_kategori.map((sub, sIdx) => (
                <div key={sub.kode} className="border border-stone-200 rounded-xl overflow-hidden">
                  <div className="bg-stone-100/70 px-4 py-2 font-bold text-stone-800 flex justify-between items-center">
                    <span>Sub {sub.kode}: {sub.nama}</span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {sub.terpenuhi_butir} / {sub.total_butir} Terpenuhi ({sub.persentase}%)
                    </span>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {sub.items.map((item, iIdx) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem('pilar_kebersihan', sIdx, iIdx)}
                        className={`p-2.5 px-4 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          item.terpenuhi ? 'hover:bg-stone-50' : 'bg-red-50/50 hover:bg-red-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1">
                          <input
                            type="checkbox"
                            checked={item.terpenuhi}
                            onChange={() => {}}
                            className="rounded text-[#8B1418] focus:ring-[#8B1418] h-4 w-4 shrink-0"
                          />
                          <span className={`text-xs ${item.terpenuhi ? 'text-stone-800 font-medium' : 'text-red-900 font-bold'}`}>
                            {item.pernyataan}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          item.terpenuhi ? 'bg-emerald-50 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.terpenuhi ? 'Sesuai' : 'Temuan'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Leadership Tab */}
          {activeTab === 'leadership' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
                <span className="text-xs text-stone-600 font-medium">Aksi Cepat Checklist Pilar Leadership:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetAllInPilar('pilar_leadership', true)}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px] hover:bg-emerald-100 cursor-pointer"
                  >
                    Centang Semua Sesuai
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllInPilar('pilar_leadership', false)}
                    className="px-2.5 py-1 bg-stone-100 text-stone-600 border border-stone-200 rounded-lg font-bold text-[11px] hover:bg-stone-200 cursor-pointer"
                  >
                    Reset Temuan
                  </button>
                </div>
              </div>

              {formData.pilar_leadership.sub_kategori.map((sub, sIdx) => (
                <div key={sub.kode} className="border border-stone-200 rounded-xl overflow-hidden">
                  <div className="bg-stone-100/70 px-4 py-2 font-bold text-stone-800 flex justify-between items-center">
                    <span>Sub {sub.kode}: {sub.nama}</span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {sub.terpenuhi_butir} / {sub.total_butir} Terpenuhi ({sub.persentase}%)
                    </span>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {sub.items.map((item, iIdx) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleItem('pilar_leadership', sIdx, iIdx)}
                        className={`p-2.5 px-4 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          item.terpenuhi ? 'hover:bg-stone-50' : 'bg-red-50/50 hover:bg-red-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1">
                          <input
                            type="checkbox"
                            checked={item.terpenuhi}
                            onChange={() => {}}
                            className="rounded text-[#8B1418] focus:ring-[#8B1418] h-4 w-4 shrink-0"
                          />
                          <span className={`text-xs ${item.terpenuhi ? 'text-stone-800 font-medium' : 'text-red-900 font-bold'}`}>
                            {item.pernyataan}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                          item.terpenuhi ? 'bg-emerald-50 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.terpenuhi ? 'Sesuai' : 'Temuan'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rating & CS Tab */}
          {activeTab === 'cs' && (
            <div className="space-y-6">
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50">
                <h4 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  Pengaturan Rating Online Multi-Platform
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.kepuasan_pelanggan.platform_ratings.map((p, idx) => (
                    <div key={p.platform} className="bg-white p-3 rounded-xl border border-stone-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-800">{p.platform}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{p.total_ulasan} reviews</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500">Rating:</span>
                        <input
                          type="number"
                          step="0.1"
                          min="1.0"
                          max="5.0"
                          value={p.rating}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = { ...formData };
                            updated.kepuasan_pelanggan.platform_ratings[idx].rating = val;
                            setFormData(updated);
                          }}
                          className="w-20 px-2 py-1 bg-stone-50 border border-stone-200 rounded font-black text-xs text-amber-700"
                        />
                        <span className="text-xs text-stone-400">/ 5.0</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skor Bobot CS */}
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-900">Skor Bobot Kepuasan CS (Maks 15 Poin):</span>
                  <div className="text-[11px] text-stone-500">Dihitung dari rata-rata rating online dan resolusi komplain</div>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="15"
                  value={formData.kepuasan_pelanggan.skor_bobot_didapat}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = { ...formData };
                    updated.kepuasan_pelanggan.skor_bobot_didapat = val;
                    setFormData(recalculate(updated));
                  }}
                  className="w-24 px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-center font-black text-sm text-[#8B1418]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 border-t border-stone-200 p-4 px-6 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-stone-200 text-stone-600 hover:bg-stone-100 rounded-xl font-bold text-xs cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#8B1418] hover:bg-[#720e12] text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-red-900/15"
          >
            <Save size={15} />
            <span>Simpan Audit & Perbarui Rapor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
