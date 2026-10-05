import React, { useState } from 'react';
import { ShieldCheck, Check, AlertTriangle, XCircle, Store, User, Sparkles, Send, ArrowRight } from 'lucide-react';
import { db } from '../lib/storage';
import { Outlet, Kru } from '../types';

interface TouchAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  outlets: Outlet[];
  kruList: Kru[];
  onAuditSaved: (message: string) => void;
}

interface AuditItem {
  id: string;
  category: string;
  label: string;
  sopStandard: string;
  status: 'SESUAI' | 'PERBAIKAN' | 'KRITIS';
  note: string;
}

export const TouchAuditModal: React.FC<TouchAuditModalProps> = ({
  isOpen,
  onClose,
  outlets,
  kruList,
  onAuditSaved,
}) => {
  if (!isOpen) return null;

  const [selectedOutlet, setSelectedOutlet] = useState(outlets[0]?.kode_outlet || 'HC-JTS01');
  const [selectedKru, setSelectedKru] = useState('');
  const [auditorName, setAuditorName] = useState('Haikal Abi (Trainer)');

  const [auditItems, setAuditItems] = useState<AuditItem[]>([
    {
      id: 'item-1',
      category: 'Kitchen Fryer',
      label: 'Kalibrasi Suhu Minyak Fryer',
      sopStandard: '165°C - 175°C sebelum celup ayam batch baru.',
      status: 'SESUAI',
      note: '',
    },
    {
      id: 'item-2',
      category: 'Kitchen Tiris',
      label: 'Waktu Tiris Minyak Ayam Goreng',
      sopStandard: 'Minimal 7 menit pada basket tiris agar renyah maksimal.',
      status: 'SESUAI',
      note: '',
    },
    {
      id: 'item-3',
      category: 'Food Safety & HACCP',
      label: 'Standar APD & Sanitasi Tangan Kru',
      sopStandard: 'Hairnet tertutup rapi, celemek bersih, cuci tangan 30 menit sekali.',
      status: 'SESUAI',
      note: '',
    },
    {
      id: 'item-4',
      category: 'Cold Chain',
      label: 'Suhu Chiller Marinasi Ayam',
      sopStandard: 'Suhu chiller wajib < 4°C, rotasi FIFO tanggal marinasi jelas.',
      status: 'SESUAI',
      note: '',
    },
    {
      id: 'item-5',
      category: 'Kasir & Hospitality',
      label: 'Waktu Transaksi & Salam Hangat',
      sopStandard: 'Maksimal 45 detik/transaksi, senyum salam konfirmasi pesanan.',
      status: 'SESUAI',
      note: '',
    },
  ]);

  const handleStatusChange = (id: string, newStatus: 'SESUAI' | 'PERBAIKAN' | 'KRITIS') => {
    setAuditItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleNoteChange = (id: string, note: string) => {
    setAuditItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const filteredKru = kruList.filter(
    (k) => !selectedOutlet || k.kode_outlet === selectedOutlet
  );

  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();

    const criticalItems = auditItems.filter((i) => i.status === 'KRITIS');
    const warningItems = auditItems.filter((i) => i.status === 'PERBAIKAN');
    const targetKruName = selectedKru || (filteredKru[0]?.nama_kru || 'Kru Gerai Shift');

    // 1. Insert into observasi_lapangan for each audited item
    auditItems.forEach((item) => {
      db.insertRow('observasi_lapangan', {
        kode_outlet: selectedOutlet,
        nama_kru: targetKruName,
        divisi: item.category.split(' ')[0] || 'Kitchen',
        standar_sop_diamati: item.label,
        hasil: item.status === 'SESUAI' ? 'Sesuai Standar' : item.status === 'PERBAIKAN' ? 'Perlu Perbaikan' : 'Tidak Sesuai (Kritis)',
        catatan_detail: item.note || `Inspeksi Cepat: ${item.sopStandard}`,
        tanggal_shift: `${new Date().toISOString().split('T')[0]} (Inspeksi Tablet)`,
        rekomendasi_tindakan: item.status !== 'SESUAI' ? 'Pelatihan Ulang Segera' : 'Pertahankan',
      });
    });

    // 2. If critical items found, automatically generate TNA item
    if (criticalItems.length > 0) {
      criticalItems.forEach((crit) => {
        db.insertRow('tna', {
          kode_outlet: selectedOutlet,
          divisi: crit.category.split(' ')[0] || 'Kitchen',
          deskripsi_gap: `Temuan Kritis: ${crit.label} tidak sesuai SOP (${crit.note || crit.sopStandard})`,
          jenis_gap: 'Keterampilan',
          prioritas: 'Tinggi',
          rencana_tindak_lanjut: `Sesi Demonstrasi Langsung & Uji Ulang oleh Trainer di ${selectedOutlet}`,
          status: 'Belum',
          tanggal: new Date().toISOString().split('T')[0],
          sumber_temuan: `Inspeksi Cepat Tablet (${auditorName})`,
        });
      });
    }

    onAuditSaved(
      `Audit Cepat Cabang ${selectedOutlet} berhasil disimpan! (${criticalItems.length} Temuan Kritis otomatis masuk ke TNA)`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                Mode Tablet & Dapur Lapangan
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-amber-400" />
              <span>Inspeksi Mutu & Kepatuhan SOP Cepat</span>
            </h2>
            <p className="text-xs text-slate-300 leading-snug">
              Sentuh status langsung di dapur tanpa mengetik panjang. Temuan kritis otomatis menjadi tiket TNA.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitAudit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Select Outlet & Kru */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Pilih Gerai / Outlet:
              </label>
              <select
                value={selectedOutlet}
                onChange={(e) => {
                  setSelectedOutlet(e.target.value);
                  setSelectedKru('');
                }}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
              >
                {outlets.map((o) => (
                  <option key={o.kode_outlet} value={o.kode_outlet}>
                    {o.kode_outlet} - {o.nama_outlet}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                Kru Diamati (Opsional):
              </label>
              <select
                value={selectedKru}
                onChange={(e) => setSelectedKru(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#96171B]/20"
              >
                <option value="">Semua Kru Shift Gerai</option>
                {filteredKru.map((k) => (
                  <option key={k.id} value={k.nama_kru}>
                    {k.nama_kru} ({k.divisi})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Audit Touch Items */}
          <div className="space-y-3">
            <span className="text-xs font-black text-stone-900 tracking-wide uppercase block">
              Parameter Kepatuhan Standar HARA:
            </span>

            {auditItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 transition-all space-y-2.5 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#96171B] tracking-wider block">
                      {item.category}
                    </span>
                    <h4 className="text-xs font-black text-stone-900">
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-stone-500 leading-tight">
                      Standar: {item.sopStandard}
                    </p>
                  </div>
                </div>

                {/* Big Touch Buttons (>= 44px min height for tablets) */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'SESUAI')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      item.status === 'SESUAI'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-emerald-50'
                    }`}
                  >
                    <Check size={14} />
                    <span>Sesuai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'PERBAIKAN')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      item.status === 'PERBAIKAN'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-amber-50'
                    }`}
                  >
                    <AlertTriangle size={14} />
                    <span>Catatan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'KRITIS')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                      item.status === 'KRITIS'
                        ? 'bg-[#96171B] text-white border-red-900 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-red-50'
                    }`}
                  >
                    <XCircle size={14} />
                    <span>Kritis</span>
                  </button>
                </div>

                {/* Input catatan jika bukan Sesuai */}
                {item.status !== 'SESUAI' && (
                  <input
                    type="text"
                    placeholder="Catatan temuan (misal: suhu fryer terukur 150°C belum matang)..."
                    value={item.note}
                    onChange={(e) => handleNoteChange(item.id, e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-amber-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 animate-in fade-in"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-xl bg-[#96171B] hover:bg-[#801216] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <Send size={14} />
              <span>Simpan & Sinkronkan Temuan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
