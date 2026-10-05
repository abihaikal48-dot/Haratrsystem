import React, { useState } from 'react';
import {
  Brain, QrCode, KeyRound, UserCheck, Search, Check,
  Store, ChevronRight, Sparkles, Printer, Copy, AlertCircle,
  X, ShieldCheck, Flame, Utensils, HelpCircle, ArrowRight
} from 'lucide-react';
import { Outlet, Kru, Division } from '../types';
import { db } from '../lib/storage';
import { HaraLogo } from './HaraLogo';

interface KruExamAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExam: (params: {
    outletCode: string;
    namaKru: string;
    divisi: 'Semua' | Division;
  }) => void;
}

export const KruExamAccessModal: React.FC<KruExamAccessModalProps> = ({
  isOpen,
  onClose,
  onStartExam,
}) => {
  const [activeTab, setActiveTab] = useState<'pick' | 'pin' | 'qr'>('pick');
  const [outlets] = useState<Outlet[]>(() => db.getTable<Outlet>('outlets'));
  const [allKru] = useState<Kru[]>(() =>
    db.getTable<Kru>('kru').filter((k) => k.status_aktif === 'Aktif')
  );

  // Mode 1: Pick State
  const [selectedOutlet, setSelectedOutlet] = useState<string>(() =>
    outlets.length > 0 ? outlets[0].kode_outlet : ''
  );
  const [selectedKru, setSelectedKru] = useState<Kru | null>(null);
  const [searchKru, setSearchKru] = useState<string>('');
  const [selectedStation, setSelectedStation] = useState<'Semua' | Division>('Semua');

  // Mode 2: PIN State
  const [pinDigits, setPinDigits] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [matchedPinKru, setMatchedPinKru] = useState<Kru | null>(null);

  // Mode 3: QR State
  const [qrOutlet, setQrOutlet] = useState<string>(() =>
    outlets.length > 0 ? outlets[0].kode_outlet : ''
  );
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Filter kru for selected outlet in Mode 1
  const outletKruList = allKru
    .filter((k) => !selectedOutlet || k.kode_outlet === selectedOutlet)
    .filter((k) =>
      searchKru.trim() === ''
        ? true
        : k.nama_kru.toLowerCase().includes(searchKru.toLowerCase())
    );

  // Handle Pick kru click
  const handlePickKru = (kru: Kru) => {
    setSelectedKru(kru);
    if (kru.divisi) {
      setSelectedStation(kru.divisi);
    }
  };

  // Submit Mode 1
  const handleProceedPick = () => {
    if (!selectedKru) return;
    onStartExam({
      outletCode: selectedOutlet || selectedKru.kode_outlet,
      namaKru: selectedKru.nama_kru,
      divisi: selectedStation,
    });
    onClose();
  };

  // Keypad Click for PIN
  const handleKeypadPress = (val: string) => {
    setPinError('');
    if (val === 'C') {
      setPinDigits('');
      setMatchedPinKru(null);
      return;
    }

    if (val === 'DEL') {
      setPinDigits((prev) => prev.slice(0, -1));
      setMatchedPinKru(null);
      return;
    }

    if (pinDigits.length >= 4) return;

    const newPin = pinDigits + val;
    setPinDigits(newPin);

    // If 4 digits entered, verify
    if (newPin.length === 4) {
      // PIN logic:
      // Match by last 4 digits of kru id, or match default demo PIN '1234' for Budi Santoso, or any matching custom PIN
      let found = allKru.find((k) => {
        const customPin = localStorage.getItem(`hara_kru_pin_${k.id}`);
        if (customPin) return customPin === newPin;
        // Default PINs for quick demo
        if (newPin === '1234') return true;
        // Or if PIN matches numeric portion of kru ID (e.g. kru-1 -> 0001)
        const numPart = k.id.replace(/\D/g, '').padStart(4, '0');
        return numPart === newPin;
      });

      if (!found && newPin === '1234' && allKru.length > 0) {
        found = allKru[0]; // fallback to first crew
      }

      if (found) {
        setMatchedPinKru(found);
        setPinError('');
      } else {
        setPinError('PIN 4-angka tidak cocok dengan kru manapun. Coba gunakan 1234 untuk demo.');
      }
    }
  };

  // Submit Mode 2
  const handleProceedPin = () => {
    if (!matchedPinKru) return;
    onStartExam({
      outletCode: matchedPinKru.kode_outlet,
      namaKru: matchedPinKru.nama_kru,
      divisi: matchedPinKru.divisi || 'Semua',
    });
    onClose();
  };

  // Copy QR Link
  const handleCopyQrLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/#ujian?outlet=${qrOutlet}`;
    navigator.clipboard?.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Print Notice
  const handlePrintQr = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#96171B] to-[#781014] text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors text-sm"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Portal Ujian Kru Lapangan</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Pintu Masuk Tes Kompetensi Stasiun
          </h2>
          <p className="text-xs text-red-100/80 mt-1 max-w-lg leading-relaxed">
            Pilih metode yang paling nyaman: tinggal klik nama sendiri, masukkan PIN cepat 4-angka, atau scan QR Code di dinding dapur gerai.
          </p>

          {/* 3-in-1 Navigation Tabs */}
          <div className="grid grid-cols-3 gap-2 mt-5 bg-black/25 p-1.5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('pick')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'pick'
                  ? 'bg-white text-stone-900 shadow-md scale-[1.02]'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <UserCheck size={14} className={activeTab === 'pick' ? 'text-red-700' : 'text-stone-300'} />
              <span>1. Tinggal Pilih</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pin')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'pin'
                  ? 'bg-white text-stone-900 shadow-md scale-[1.02]'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <KeyRound size={14} className={activeTab === 'pin' ? 'text-amber-600' : 'text-stone-300'} />
              <span>2. PIN 4-Angka</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-white text-stone-900 shadow-md scale-[1.02]'
                  : 'text-stone-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <QrCode size={14} className={activeTab === 'qr' ? 'text-emerald-600' : 'text-stone-300'} />
              <span>3. Scan QR Gerai</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto">
          
          {/* ========================================================
              TAB 1: TINGGAL PILIH NAMA LANGSUNG (PALING SIMPEL)
              ======================================================== */}
          {activeTab === 'pick' && (
            <div className="space-y-4">
              
              {/* Step 1: Pilih Outlet Gerai */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                  <span>Langkah 1: Pilih Cabang Gerai Anda</span>
                  <span className="text-[11px] font-normal text-stone-400">Total {outlets.length} Gerai</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {outlets.map((out) => {
                    const isSel = selectedOutlet === out.kode_outlet;
                    return (
                      <button
                        key={out.id}
                        type="button"
                        onClick={() => {
                          setSelectedOutlet(out.kode_outlet);
                          setSelectedKru(null);
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isSel
                            ? 'border-[#96171B] bg-red-50/60 text-[#96171B] font-bold shadow-xs'
                            : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                        }`}
                      >
                        <div className="font-bold truncate">{out.nama_outlet}</div>
                        <div className="text-[10px] text-stone-400 font-mono mt-0.5">{out.kode_outlet}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Pilih Kru di Gerai Tersebut */}
              <div className="pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-stone-700">
                    Langkah 2: Sentuh Nama Anda di Daftar Kru
                  </label>
                  {/* Search filter */}
                  <div className="relative w-44">
                    <input
                      type="text"
                      value={searchKru}
                      onChange={(e) => setSearchKru(e.target.value)}
                      placeholder="Cari nama Anda..."
                      className="w-full text-xs pl-7 pr-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:border-[#96171B]"
                    />
                    <Search size={12} className="absolute left-2 top-2 text-stone-400" />
                  </div>
                </div>

                {outletKruList.length === 0 ? (
                  <div className="p-6 bg-stone-50 rounded-2xl text-center text-xs text-stone-500 border border-stone-200">
                    Tidak ada kru aktif yang ditemukan di cabang ini. Silakan hubungi Kepala Outlet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {outletKruList.map((kru) => {
                      const isChosen = selectedKru?.id === kru.id;
                      const initials = kru.nama_kru
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('');

                      return (
                        <button
                          key={kru.id}
                          type="button"
                          onClick={() => handlePickKru(kru)}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            isChosen
                              ? 'border-[#96171B] bg-red-50 text-stone-900 shadow-sm ring-2 ring-[#96171B]/20'
                              : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                isChosen
                                  ? 'bg-[#96171B] text-white'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">
                                {kru.nama_kru}
                              </div>
                              <div className="text-[10px] text-stone-500 truncate flex items-center gap-1">
                                <span>{kru.divisi || 'Kitchen'}</span>
                                {kru.jabatan && (
                                  <>
                                    <span>&bull;</span>
                                    <span>{kru.jabatan}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {isChosen && (
                            <div className="w-5 h-5 rounded-full bg-[#96171B] text-white flex items-center justify-center shrink-0">
                              <Check size={12} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 3: Pilih Stasiun Ujian (Opsional) */}
              {selectedKru && (
                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span>Langkah 3: Modul Ujian Stasiun</span>
                    <span className="text-[11px] text-amber-700 font-medium">
                      Kru: <b>{selectedKru.nama_kru}</b> ({selectedKru.divisi})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['Semua', 'Kitchen', 'Kasir', 'Geprek'] as const).map((div) => {
                      const isSt = selectedStation === div;
                      return (
                        <button
                          key={div}
                          type="button"
                          onClick={() => setSelectedStation(div)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSt
                              ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                              : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100/50'
                          }`}
                        >
                          {div === 'Semua' ? 'Semua Stasiun' : div}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CTA Start Exam */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="button"
                  disabled={!selectedKru}
                  onClick={handleProceedPick}
                  className="py-3 px-6 bg-[#96171B] hover:bg-[#801216] disabled:bg-stone-200 disabled:text-stone-400 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Mulai Ujian Sekarang</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 2: PIN CEPAT 4-ANGKA
              ======================================================== */}
          {activeTab === 'pin' && (
            <div className="max-w-xs mx-auto space-y-4 text-center">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-stone-900">
                  Ketik 4 Angka PIN Kru Anda
                </h3>
                <p className="text-xs text-stone-500">
                  Untuk proteksi cepat di tablet outlet. Coba <b>1234</b> untuk demo.
                </p>
              </div>

              {/* PIN Display Indicators */}
              <div className="flex items-center justify-center gap-3 py-2">
                {[0, 1, 2, 3].map((idx) => {
                  const hasVal = pinDigits.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-black transition-all ${
                        hasVal
                          ? 'border-[#96171B] bg-red-50 text-[#96171B] shadow-xs scale-105'
                          : 'border-stone-200 bg-stone-50 text-stone-300'
                      }`}
                    >
                      {hasVal ? '●' : ''}
                    </div>
                  );
                })}
              </div>

              {/* Error or Matched Kru Info */}
              {pinError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2 text-left animate-in fade-in">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {matchedPinKru && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-left animate-in fade-in space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <ShieldCheck size={16} />
                    <span>PIN Terverifikasi!</span>
                  </div>
                  <div className="text-xs">
                    <b>{matchedPinKru.nama_kru}</b> &bull; Divisi {matchedPinKru.divisi} ({matchedPinKru.kode_outlet})
                  </div>
                  <button
                    type="button"
                    onClick={handleProceedPin}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>Lanjut Ujian untuk {matchedPinKru.nama_kru.split(' ')[0]}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Touch Keypad */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeypadPress(k)}
                    className="h-12 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 active:bg-stone-200 text-stone-800 font-bold text-base transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                  >
                    {k === 'DEL' ? '⌫' : k}
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* ========================================================
              TAB 3: SCAN QR CODE GERAI (TEMPEL DI DAPUR)
              ======================================================== */}
          {activeTab === 'qr' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-800">
                    QR Code Ujian Mandiri per Outlet
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Cetak dan tempelkan lembar ini di dinding dapur dekat stasiun fryer/kasir.
                  </p>
                </div>

                <select
                  value={qrOutlet}
                  onChange={(e) => setQrOutlet(e.target.value)}
                  className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 font-bold text-stone-800 focus:outline-none focus:border-[#96171B]"
                >
                  {outlets.map((o) => (
                    <option key={o.kode_outlet} value={o.kode_outlet}>
                      {o.nama_outlet}
                    </option>
                  ))}
                </select>
              </div>

              {/* Printable Notice Preview Card */}
              <div className="border-2 border-dashed border-stone-300 rounded-3xl p-6 bg-stone-50 text-center space-y-4">
                
                <div className="flex items-center justify-center gap-2">
                  <HaraLogo variant="icon" size="sm" />
                  <div className="text-left leading-tight">
                    <div className="text-xs font-black tracking-tight text-[#96171B]">HARA CHICKEN</div>
                    <div className="text-[9px] font-bold text-stone-500 uppercase">LEMBAR UJIAN RESMI KRU DAPUR</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-black text-stone-900">
                    {outlets.find((o) => o.kode_outlet === qrOutlet)?.nama_outlet || qrOutlet}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Pindai menggunakan kamera HP kru untuk membuka portal ujian mandiri seketika
                  </div>
                </div>

                {/* High Contrast Clean SVG QR Code Graphic */}
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl shadow-md border border-stone-200 flex flex-col items-center justify-center relative">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* QR Background & Positioning Marks */}
                    <rect width="100" height="100" fill="#FFFFFF" />
                    
                    {/* Top-Left Finder */}
                    <rect x="10" y="10" width="24" height="24" rx="3" fill="#1C1917" />
                    <rect x="14" y="14" width="16" height="16" rx="2" fill="#FFFFFF" />
                    <rect x="18" y="18" width="8" height="8" rx="1.5" fill="#96171B" />

                    {/* Top-Right Finder */}
                    <rect x="66" y="10" width="24" height="24" rx="3" fill="#1C1917" />
                    <rect x="70" y="14" width="16" height="16" rx="2" fill="#FFFFFF" />
                    <rect x="74" y="18" width="8" height="8" rx="1.5" fill="#96171B" />

                    {/* Bottom-Left Finder */}
                    <rect x="10" y="66" width="24" height="24" rx="3" fill="#1C1917" />
                    <rect x="14" y="70" width="16" height="16" rx="2" fill="#FFFFFF" />
                    <rect x="18" y="74" width="8" height="8" rx="1.5" fill="#96171B" />

                    {/* QR Data Matrix Patterns */}
                    <rect x="38" y="12" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="48" y="12" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="58" y="12" width="4" height="4" rx="1" fill="#1C1917" />
                    
                    <rect x="38" y="24" width="8" height="4" rx="1" fill="#1C1917" />
                    <rect x="50" y="22" width="4" height="6" rx="1" fill="#1C1917" />

                    <rect x="12" y="38" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="22" y="38" width="4" height="8" rx="1" fill="#1C1917" />
                    <rect x="12" y="48" width="8" height="4" rx="1" fill="#1C1917" />

                    <rect x="68" y="38" width="8" height="4" rx="1" fill="#1C1917" />
                    <rect x="80" y="38" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="72" y="46" width="6" height="6" rx="1" fill="#1C1917" />
                    <rect x="82" y="48" width="4" height="8" rx="1" fill="#1C1917" />

                    <rect x="38" y="66" width="6" height="8" rx="1" fill="#1C1917" />
                    <rect x="48" y="70" width="8" height="4" rx="1" fill="#1C1917" />
                    <rect x="58" y="66" width="4" height="8" rx="1" fill="#1C1917" />

                    <rect x="38" y="78" width="10" height="4" rx="1" fill="#1C1917" />
                    <rect x="52" y="82" width="8" height="6" rx="1" fill="#1C1917" />
                    <rect x="68" y="78" width="8" height="6" rx="1" fill="#1C1917" />
                    <rect x="80" y="80" width="6" height="6" rx="1" fill="#1C1917" />

                    {/* Center Brand Crest */}
                    <rect x="42" y="42" width="16" height="16" rx="4" fill="#96171B" />
                    <circle cx="50" cy="50" r="4.5" fill="#FFE484" />
                  </svg>
                </div>

                <div className="text-[11px] font-mono text-stone-600">
                  KODE AKSES: <b className="text-stone-900">{qrOutlet}</b> &bull; HARA SQUAD
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopyQrLink}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy size={13} />
                  <span>{copiedLink ? 'Tersalin!' : 'Salin Tautan Ujian'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintQr}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Printer size={13} />
                    <span>Cetak Lembar Dapur</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onStartExam({
                        outletCode: qrOutlet,
                        namaKru: '',
                        divisi: 'Semua',
                      });
                      onClose();
                    }}
                    className="px-4 py-2 bg-[#96171B] hover:bg-[#801216] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Buka Lembar Ujian Sekarang</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
