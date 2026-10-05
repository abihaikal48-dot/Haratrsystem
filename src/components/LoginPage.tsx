import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, HelpCircle,
  AlertCircle, CheckCircle2, Key, Sparkles, UserCheck,
  Building2, Users, QrCode, Brain, ChevronRight, Award, Flame,
  Store, ChevronDown, Check, Search, KeyRound, Copy, Printer,
  RefreshCw, Utensils, Shield, MapPin, X
} from 'lucide-react';
import { AppUser, Outlet, Kru, Division } from '../types';
import { db } from '../lib/storage';
import { HaraLogo } from './HaraLogo';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser) => void;
  onOpenPublicExam: () => void;
  onStartDirectKruExam?: (params: {
    outletCode: string;
    namaKru: string;
    divisi: 'Semua' | Division;
  }) => void;
  onlineCount?: number;
  onOpenPresenceModal?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenPublicExam,
  onStartDirectKruExam,
  onlineCount = 1,
  onOpenPresenceModal,
}) => {
  // Navigation / Mode Switcher: 'staff' (Email + Password) | 'kru' (Area -> Outlet -> Kru)
  const [authMode, setAuthMode] = useState<'staff' | 'kru'>('staff');

  // =========================================================================
  // TAB 1: FORM LOGIN STAF & MANAJEMEN
  // =========================================================================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Quick Demo Accounts Drawer
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Database Users & Master Data
  const users = db.getTable<AppUser>('app_users');
  const outlets = useMemo(() => db.getTable<Outlet>('outlets'), []);
  const allKru = useMemo(
    () => db.getTable<Kru>('kru').filter((k) => k.status_aktif === 'Aktif'),
    []
  );

  // =========================================================================
  // TAB 2: PORTAL UJIAN KRU (Area -> Outlet -> Nama Kru -> Jobdesk)
  // =========================================================================
  const [selectedArea, setSelectedArea] = useState<string>('Semua Wilayah');
  const [selectedOutletCode, setSelectedOutletCode] = useState<string>(() =>
    outlets.length > 0 ? outlets[0].kode_outlet : ''
  );
  const [selectedKru, setSelectedKru] = useState<Kru | null>(null);
  const [kruSearchQuery, setKruSearchQuery] = useState<string>('');
  const [selectedStation, setSelectedStation] = useState<'Semua' | Division>('Semua');
  const [isManualKru, setIsManualKru] = useState<boolean>(false);
  const [manualKruName, setManualKruName] = useState<string>('');

  // Optional Alternative Kru Access Sub-tab
  const [kruSubMode, setKruSubMode] = useState<'hierarkis' | 'pin' | 'qr'>('hierarkis');
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [matchedPinKru, setMatchedPinKru] = useState<Kru | null>(null);
  const [qrCopied, setQrCopied] = useState<boolean>(false);

  // Area Mapping Helper
  const getOutletArea = (outlet: Outlet): string => {
    const alamat = (outlet.alamat || '').toLowerCase();
    const nama = (outlet.nama_outlet || '').toLowerCase();
    if (alamat.includes('bekasi') || alamat.includes('depok') || alamat.includes('jakarta') || alamat.includes('tangerang') || alamat.includes('bogor') || nama.includes('depok') || nama.includes('jatiasih')) {
      return 'Jabodetabek';
    }
    if (alamat.includes('diy') || alamat.includes('bantul') || alamat.includes('yogyakarta') || alamat.includes('jateng') || alamat.includes('semarang') || alamat.includes('solo') || nama.includes('bantul')) {
      return 'DIY & Jawa Tengah';
    }
    if (alamat.includes('malang') || alamat.includes('surabaya') || alamat.includes('jatim') || alamat.includes('sidoarjo') || nama.includes('malang') || nama.includes('surabaya')) {
      return 'Jawa Timur';
    }
    return 'Wilayah Lainnya';
  };

  const availableAreas = useMemo(() => {
    const areas = new Set<string>();
    outlets.forEach((o) => areas.add(getOutletArea(o)));
    return ['Semua Wilayah', ...Array.from(areas)];
  }, [outlets]);

  // Filtered outlets based on selected area
  const filteredOutlets = useMemo(() => {
    if (selectedArea === 'Semua Wilayah') return outlets;
    return outlets.filter((o) => getOutletArea(o) === selectedArea);
  }, [outlets, selectedArea]);

  // Auto-adjust selected outlet when area changes
  useEffect(() => {
    if (filteredOutlets.length > 0 && !filteredOutlets.some((o) => o.kode_outlet === selectedOutletCode)) {
      setSelectedOutletCode(filteredOutlets[0].kode_outlet);
      setSelectedKru(null);
    }
  }, [selectedArea, filteredOutlets, selectedOutletCode]);

  // Filtered crew for the chosen outlet
  const filteredKruList = useMemo(() => {
    return allKru
      .filter((k) => !selectedOutletCode || k.kode_outlet === selectedOutletCode)
      .filter((k) =>
        kruSearchQuery.trim() === ''
          ? true
          : k.nama_kru.toLowerCase().includes(kruSearchQuery.toLowerCase())
      );
  }, [allKru, selectedOutletCode, kruSearchQuery]);

  // Pre-configured official authorized personnel in HARA Chicken
  const officialAccounts = [
    {
      nama: 'Haikal Abi',
      email: 'haikal@harachicken.com',
      pass: 'haikal123',
      role: 'Trainer',
      badge: 'Trainer Lapangan',
      deskripsi: 'Pelatihan & Evaluasi Standar Mutu Gerai',
    },
    {
      nama: 'Rian Hidayat',
      email: 'rian.kepala@harachicken.com',
      pass: 'rian123',
      role: 'Kepala Outlet',
      badge: 'Kepala Gerai',
      deskripsi: 'Manajemen Operasional Cabang Jatiasih',
    },
    {
      nama: 'Bambang Kusuma',
      email: 'bambang.spv@harachicken.com',
      pass: 'spv123',
      role: 'Area Supervisor',
      badge: 'Area SPV',
      deskripsi: 'Supervisi Standar Wilayah & Audit SOP',
    },
    {
      nama: 'Dina Putri',
      email: 'rekrutmen@harachicken.com',
      pass: 'rekrutmen123',
      role: 'SPV Rekrutmen',
      badge: 'Rekrutmen',
      deskripsi: 'Onboarding & Evaluasi Calon Kru Baru',
    },
    {
      nama: 'Administrator HQ',
      email: 'admin@harachicken.com',
      pass: 'admin123',
      role: 'Admin',
      badge: 'Pusat HQ',
      deskripsi: 'Pusat Pengaturan & Akses Penuh Sistem',
    },
  ];

  // Load and enforce persistent lockout
  useEffect(() => {
    const lockoutUntil = localStorage.getItem('hara_auth_lockout_until');
    if (lockoutUntil) {
      const remainingSec = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000);
      if (remainingSec > 0) {
        setLockoutRemaining(remainingSec);
      } else {
        localStorage.removeItem('hara_auth_lockout_until');
      }
    }
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutRemaining <= 0) {
      localStorage.removeItem('hara_auth_lockout_until');
      return;
    }
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          localStorage.removeItem('hara_auth_lockout_until');
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  // Load remembered email
  useEffect(() => {
    const saved = localStorage.getItem('hara_saved_login_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  // Handle Login Staf
  const handleSecureLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (lockoutRemaining > 0) {
      setErrorMsg(`Akses sementara dibekukan demi keamanan. Harap tunggu ${lockoutRemaining} detik.`);
      return;
    }

    setIsSubmitting(true);
    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();

    if (!inputEmail || !inputPass) {
      setErrorMsg('Silakan masukkan email kerja resmi dan kata sandi Anda.');
      setIsSubmitting(false);
      return;
    }

    if (rememberMe) {
      localStorage.setItem('hara_saved_login_email', inputEmail);
    } else {
      localStorage.removeItem('hara_saved_login_email');
    }

    // Check predefined authorized personnel
    const targetStaff = officialAccounts.find(
      (a) => a.email.toLowerCase() === inputEmail
    );

    if (targetStaff) {
      const matchedInDb = users.find((u) => u.email.toLowerCase() === inputEmail);
      const customPass = matchedInDb ? localStorage.getItem(`hara_user_pass_${matchedInDb.id}`) : null;
      const expectedPass = customPass || targetStaff.pass;

      if (inputPass !== expectedPass) {
        const nextFails = failedAttempts + 1;
        setFailedAttempts(nextFails);
        db.addLog(
          'UBAH',
          'Keamanan',
          `Percobaan login gagal untuk: ${inputEmail} (#${nextFails})`
        );
        if (nextFails >= 5) {
          const lockoutSec = 60;
          localStorage.setItem('hara_auth_lockout_until', (Date.now() + lockoutSec * 1000).toString());
          setLockoutRemaining(lockoutSec);
          setErrorMsg('Sistem terkunci sementara 60 detik karena 5x kesalahan kata sandi berturut-turut.');
        } else {
          setErrorMsg(`Kata sandi tidak sesuai. Sisa percobaan: ${5 - nextFails}x.`);
        }
        setIsSubmitting(false);
        return;
      }

      let matched = matchedInDb;
      if (!matched) {
        matched = {
          id: 'usr-' + targetStaff.role.toLowerCase().replace(/\s+/g, '-'),
          nama: targetStaff.nama,
          email: inputEmail,
          role: targetStaff.role as any,
          status_aktif: 'Aktif',
          created_at: new Date().toISOString(),
        };
        db.insertRow('app_users', matched);
      }

      setFailedAttempts(0);
      localStorage.removeItem('hara_auth_lockout_until');
      db.setCurrentUser(matched);
      db.addLog(
        'UBAH',
        'Autentikasi',
        `Personil ${matched.nama} (${matched.role}) terverifikasi masuk ke sistem HARA Chicken Trainer & Ops.`
      );
      onLoginSuccess(matched);
      setIsSubmitting(false);
      return;
    }

    // Check custom registered users
    const dbUser = users.find((u) => u.email.toLowerCase() === inputEmail);
    if (dbUser) {
      const customPass = localStorage.getItem(`hara_user_pass_${dbUser.id}`) || 'password123';
      if (inputPass !== customPass) {
        const nextFails = failedAttempts + 1;
        setFailedAttempts(nextFails);
        if (nextFails >= 5) {
          const lockoutSec = 60;
          localStorage.setItem('hara_auth_lockout_until', (Date.now() + lockoutSec * 1000).toString());
          setLockoutRemaining(lockoutSec);
          setErrorMsg('Sistem terkunci sementara 60 detik karena 5x kesalahan kata sandi.');
        } else {
          setErrorMsg(`Kata sandi salah. Sisa kesempatan: ${5 - nextFails}x.`);
        }
        setIsSubmitting(false);
        return;
      }

      setFailedAttempts(0);
      localStorage.removeItem('hara_auth_lockout_until');
      db.setCurrentUser(dbUser);
      db.addLog('UBAH', 'Autentikasi', `User ${dbUser.nama} (${dbUser.role}) berhasil masuk.`);
      onLoginSuccess(dbUser);
      setIsSubmitting(false);
      return;
    }

    const nextFails = failedAttempts + 1;
    setFailedAttempts(nextFails);
    if (nextFails >= 5) {
      const lockoutSec = 60;
      localStorage.setItem('hara_auth_lockout_until', (Date.now() + lockoutSec * 1000).toString());
      setLockoutRemaining(lockoutSec);
      setErrorMsg('Sistem terkunci sementara 60 detik.');
    } else {
      setErrorMsg('Email kerja tidak ditemukan dalam database resmi personil HARA Chicken.');
    }
    setIsSubmitting(false);
  };

  // One-click populate for testing
  const handleQuickFill = (acc: typeof officialAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setErrorMsg('');
  };

  // Launch Direct Crew Exam
  const handleStartExam = () => {
    const finalKruName = isManualKru ? manualKruName.trim() : (selectedKru?.nama_kru || '');
    if (!finalKruName) {
      setErrorMsg('Silakan pilih nama kru Anda atau ketik nama jika baru.');
      return;
    }

    if (onStartDirectKruExam) {
      onStartDirectKruExam({
        outletCode: selectedOutletCode,
        namaKru: finalKruName,
        divisi: selectedStation,
      });
    } else {
      onOpenPublicExam();
    }
  };

  // Handle PIN 4-Angka Pad
  const handlePinInput = (num: string) => {
    setPinError('');
    if (num === 'C') {
      setPinInput('');
      setMatchedPinKru(null);
      return;
    }
    if (num === 'DEL') {
      setPinInput((prev) => prev.slice(0, -1));
      setMatchedPinKru(null);
      return;
    }
    if (pinInput.length >= 4) return;

    const next = pinInput + num;
    setPinInput(next);

    if (next.length === 4) {
      let found = allKru.find((k) => {
        const customPin = localStorage.getItem(`hara_kru_pin_${k.id}`);
        if (customPin) return customPin === next;
        if (next === '1234') return true;
        const numPart = k.id.replace(/\D/g, '').padStart(4, '0');
        return numPart === next;
      });

      if (!found && next === '1234' && allKru.length > 0) {
        found = allKru[0];
      }

      if (found) {
        setMatchedPinKru(found);
        setPinError('');
      } else {
        setPinError('PIN 4-angka tidak terdaftar. Gunakan PIN 1234 untuk demo.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1813] flex flex-col justify-between relative selection:bg-[#96171B] selection:text-white font-sans antialiased">
      
      {/* Subtle Architectural Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(150,23,27,0.05),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ECE7DE_1px,transparent_1px),linear-gradient(to_bottom,#ECE7DE_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* ========================================================
          1. TOP NAVIGATION BAR (Clean 3-Zone Contract)
          ======================================================== */}
      <header className="relative z-20 border-b border-[#E8E2D5] bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Brand Wordmark Zone */}
          <div className="flex items-center gap-2">
            <HaraLogo variant="full" size="sm" showSubtitle={false} />
          </div>

          {/* Center Notice / Philosophy */}
          <div className="hidden md:flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>Harapan Rakyat</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="font-semibold text-[#96171B]">#BeneranDiGeprek</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Standar Mutu 170°C</span>
          </div>

          {/* Action Zone: Presence & Help */}
          <div className="flex items-center gap-2">
            {onOpenPresenceModal && (
              <button
                type="button"
                onClick={onOpenPresenceModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
                title="Status sinkronisasi data gerai"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono tabular-nums font-bold">{onlineCount}</span>
                <span className="hidden sm:inline">Online</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <HelpCircle size={14} className="text-stone-400" />
              <span>Bantuan</span>
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================
          2. MAIN CONTENT VIEWPORT (Simpel, Modern, Elegan)
          ======================================================== */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-lg mx-auto">
          
          {/* Card Container */}
          <div className="bg-white rounded-2xl border border-[#E6E1D8] shadow-[0_16px_40px_-12px_rgba(28,20,15,0.06)] overflow-hidden">
            
            {/* Header Identity */}
            <div className="p-6 sm:p-7 text-center border-b border-[#F0ECE1]">
              <div className="inline-flex items-center justify-center mb-3">
                <HaraLogo variant="icon" size="lg" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F1813] font-['Outfit']">
                HARA Chicken Trainer & Ops
              </h1>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
                Pusat Pembinaan Standar Mutu Lapangan, Evaluasi Kompetensi Kru, dan Operasional Gerai.
              </p>

              {/* Segmented Switcher (2 Mode Bersih: Staf / Ujian Kru) */}
              <div className="mt-5 p-1 bg-[#F4EFEA] rounded-xl flex items-center gap-1 border border-[#E8E2D6]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('staff');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMode === 'staff'
                      ? 'bg-white text-[#96171B] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Key size={14} className={authMode === 'staff' ? 'text-[#96171B]' : 'text-stone-400'} />
                  <span>Staf & Manajemen</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('kru');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMode === 'kru'
                      ? 'bg-white text-[#96171B] shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Utensils size={14} className={authMode === 'kru' ? 'text-[#96171B]' : 'text-stone-400'} />
                  <span>Ujian Kru Lapangan</span>
                </button>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 sm:p-7">
              
              {/* Error Message Box */}
              {errorMsg && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle size={16} className="text-[#96171B] shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMsg}</div>
                </div>
              )}

              {/* ====================================================
                  MODE 1: LOGIN STAF & MANAJEMEN (EMAIL + PASSWORD)
                  ==================================================== */}
              {authMode === 'staff' && (
                <form onSubmit={handleSecureLogin} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Email Kerja Terdaftar
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh: haikal@harachicken.com"
                        disabled={lockoutRemaining > 0 || isSubmitting}
                        required
                        className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-white border border-[#DDD7CC] rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#96171B] focus:ring-2 focus:ring-[#96171B]/10 transition-all disabled:bg-stone-50"
                      />
                      <Mail size={15} className="absolute left-3 top-3 text-stone-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-stone-700">
                        Kata Sandi
                      </label>
                      <button
                        type="button"
                        onClick={() => setForgotPasswordOpen(true)}
                        className="text-[11px] font-medium text-[#96171B] hover:text-[#781014] transition-colors cursor-pointer"
                      >
                        Lupa sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi akun"
                        disabled={lockoutRemaining > 0 || isSubmitting}
                        required
                        className="w-full text-xs pl-9 pr-10 py-2.5 bg-white border border-[#DDD7CC] rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#96171B] focus:ring-2 focus:ring-[#96171B]/10 transition-all disabled:bg-stone-50"
                      />
                      <Lock size={15} className="absolute left-3 top-3 text-stone-400 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer p-0.5"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-600">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-stone-300 text-[#96171B] focus:ring-[#96171B]"
                      />
                      <span>Ingat email saya</span>
                    </label>

                    {/* Quick Demo Credentials Toggle */}
                    <button
                      type="button"
                      onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                      className="text-[11px] font-semibold text-stone-500 hover:text-stone-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Akun Demo</span>
                      <ChevronDown size={12} className={`transition-transform ${showDemoAccounts ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Collapsible Demo Accounts Quick Picker */}
                  {showDemoAccounts && (
                    <div className="p-3 bg-[#FAF8F5] border border-[#E8E2D6] rounded-xl space-y-2 animate-in fade-in text-xs">
                      <div className="text-[11px] font-bold text-stone-700 flex items-center justify-between">
                        <span>Pilih Akun Demo Resmi:</span>
                        <span className="text-[10px] text-stone-400 font-normal">Klik untuk isi otomatis</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {officialAccounts.map((acc) => (
                          <button
                            key={acc.email}
                            type="button"
                            onClick={() => handleQuickFill(acc)}
                            className="p-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-left transition-colors cursor-pointer flex flex-col"
                          >
                            <div className="flex items-center justify-between font-bold text-stone-900 text-[11px]">
                              <span>{acc.nama}</span>
                              <span className="text-[9px] font-semibold text-[#96171B]">{acc.badge}</span>
                            </div>
                            <span className="text-[10px] text-stone-500 font-mono truncate">{acc.email}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || lockoutRemaining > 0}
                    className="w-full mt-2 py-3 px-4 bg-[#96171B] hover:bg-[#801216] disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-99"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Memverifikasi Akses...</span>
                      </>
                    ) : lockoutRemaining > 0 ? (
                      <span>Terkunci ({lockoutRemaining}d)</span>
                    ) : (
                      <>
                        <span>Masuk ke Sistem</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ====================================================
                  MODE 2: PORTAL UJIAN KRU (PILIH AREA -> OUTLET -> KRU)
                  ==================================================== */}
              {authMode === 'kru' && (
                <div className="space-y-4">
                  
                  {/* Sub-modes for Kru (Hierarkis vs PIN vs QR) */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-xs font-bold text-stone-800">
                      Pintu Masuk Ujian Kompetensi SOP
                    </span>
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setKruSubMode('hierarkis')}
                        className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                          kruSubMode === 'hierarkis'
                            ? 'bg-[#96171B]/10 text-[#96171B] font-bold'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Pilih Nama
                      </button>
                      <span className="text-stone-300">·</span>
                      <button
                        type="button"
                        onClick={() => setKruSubMode('pin')}
                        className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                          kruSubMode === 'pin'
                            ? 'bg-[#96171B]/10 text-[#96171B] font-bold'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        PIN 4-Angka
                      </button>
                      <span className="text-stone-300">·</span>
                      <button
                        type="button"
                        onClick={() => setKruSubMode('qr')}
                        className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                          kruSubMode === 'qr'
                            ? 'bg-[#96171B]/10 text-[#96171B] font-bold'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Scan QR Gerai
                      </button>
                    </div>
                  </div>

                  {/* ---------------- SUB-MODE A: HIERARKIS (AREA -> OUTLET -> KRU) ---------------- */}
                  {kruSubMode === 'hierarkis' && (
                    <div className="space-y-3.5">
                      
                      {/* Step 1: Pilih Area / Wilayah */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-[#96171B]" />
                            <span>1. Pilih Wilayah / Area</span>
                          </span>
                          <span className="text-[10px] text-stone-400">{availableAreas.length - 1} Wilayah Aktif</span>
                        </label>
                        <select
                          value={selectedArea}
                          onChange={(e) => setSelectedArea(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white border border-[#DDD7CC] rounded-xl text-stone-900 font-medium focus:outline-none focus:border-[#96171B]"
                        >
                          {availableAreas.map((area) => (
                            <option key={area} value={area}>
                              {area}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step 2: Pilih Gerai / Outlet */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Store size={13} className="text-[#96171B]" />
                            <span>2. Pilih Cabang Gerai</span>
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">{filteredOutlets.length} Gerai</span>
                        </label>
                        <select
                          value={selectedOutletCode}
                          onChange={(e) => {
                            setSelectedOutletCode(e.target.value);
                            setSelectedKru(null);
                          }}
                          className="w-full text-xs px-3 py-2 bg-white border border-[#DDD7CC] rounded-xl text-stone-900 font-medium focus:outline-none focus:border-[#96171B]"
                        >
                          {filteredOutlets.map((o) => (
                            <option key={o.kode_outlet} value={o.kode_outlet}>
                              {o.nama_outlet} ({o.kode_outlet})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step 3: Pilih Nama Kru atau Input Baru */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                            <UserCheck size={13} className="text-[#96171B]" />
                            <span>3. Sentuh Nama Anda</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualKru(!isManualKru);
                              setSelectedKru(null);
                            }}
                            className="text-[11px] font-medium text-[#96171B] hover:underline cursor-pointer"
                          >
                            {isManualKru ? 'Pilih dari daftar' : '+ Kru Baru / Trainee'}
                          </button>
                        </div>

                        {isManualKru ? (
                          <input
                            type="text"
                            value={manualKruName}
                            onChange={(e) => setManualKruName(e.target.value)}
                            placeholder="Ketik nama lengkap Anda..."
                            className="w-full text-xs px-3 py-2 bg-white border border-[#DDD7CC] rounded-xl text-stone-900 focus:outline-none focus:border-[#96171B]"
                          />
                        ) : (
                          <div className="space-y-1.5">
                            {/* Search mini filter */}
                            <div className="relative">
                              <input
                                type="text"
                                value={kruSearchQuery}
                                onChange={(e) => setKruSearchQuery(e.target.value)}
                                placeholder="Cari nama kru di cabang ini..."
                                className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#FAF8F5] border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#96171B]"
                              />
                              <Search size={12} className="absolute left-2.5 top-2.5 text-stone-400 pointer-events-none" />
                            </div>

                            {/* Crew Grid */}
                            <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border border-stone-100 rounded-xl p-1 bg-stone-50/50">
                              {filteredKruList.length === 0 ? (
                                <div className="p-3 text-center text-xs text-stone-400">
                                  Belum ada kru terdaftar di gerai ini. Klik "+ Kru Baru / Trainee" di atas.
                                </div>
                              ) : (
                                filteredKruList.map((kru) => {
                                  const isSelected = selectedKru?.id === kru.id;
                                  return (
                                    <button
                                      key={kru.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedKru(kru);
                                        if (kru.divisi) setSelectedStation(kru.divisi);
                                      }}
                                      className={`w-full p-2 rounded-lg text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                        isSelected
                                          ? 'bg-red-50 text-[#96171B] border border-red-200 font-bold'
                                          : 'bg-white hover:bg-stone-50 border border-stone-200 text-stone-800'
                                      }`}
                                    >
                                      <div className="min-w-0">
                                        <div className="truncate font-semibold">{kru.nama_kru}</div>
                                        <div className="text-[10px] text-stone-500 flex items-center gap-1 font-normal">
                                          <span>{kru.divisi || 'Kitchen'}</span>
                                          {kru.jabatan && (
                                            <>
                                              <span>·</span>
                                              <span className="truncate">{kru.jabatan}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      {isSelected && <Check size={14} className="text-[#96171B] shrink-0" />}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Step 4: Pilih Stasiun Jobdesk (Kitchen · Kasir · Geprek · Helper) */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                          4. Stasiun Jobdesk HARA Chicken
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['Kitchen', 'Kasir', 'Geprek', 'Helper'] as Division[]).map((station) => {
                            const isChosen = selectedStation === station;
                            return (
                              <button
                                key={station}
                                type="button"
                                onClick={() => setSelectedStation(station)}
                                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer border ${
                                  isChosen
                                    ? 'bg-[#96171B] text-white border-[#96171B] shadow-2xs'
                                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                                }`}
                              >
                                {station}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* CTA Start Exam Button */}
                      <button
                        type="button"
                        disabled={!isManualKru && !selectedKru && !manualKruName.trim()}
                        onClick={handleStartExam}
                        className="w-full mt-3 py-3 px-4 bg-[#96171B] hover:bg-[#801216] disabled:bg-stone-200 disabled:text-stone-400 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-99"
                      >
                        <Brain size={14} />
                        <span>Mulai Ujian Sekarang</span>
                        <ArrowRight size={14} />
                      </button>

                    </div>
                  )}

                  {/* ---------------- SUB-MODE B: PIN 4-ANGKA ---------------- */}
                  {kruSubMode === 'pin' && (
                    <div className="max-w-xs mx-auto text-center space-y-3 pt-2">
                      <div className="text-xs text-stone-500">
                        Ketik 4-angka PIN kru Anda (Demo: <b>1234</b>)
                      </div>

                      {/* PIN Dots */}
                      <div className="flex items-center justify-center gap-2.5 py-1">
                        {[0, 1, 2, 3].map((idx) => {
                          const has = pinInput.length > idx;
                          return (
                            <div
                              key={idx}
                              className={`w-9 h-11 rounded-lg border-2 flex items-center justify-center text-base font-bold transition-all ${
                                has
                                  ? 'border-[#96171B] bg-red-50 text-[#96171B]'
                                  : 'border-stone-200 bg-stone-50 text-stone-300'
                              }`}
                            >
                              {has ? '●' : ''}
                            </div>
                          );
                        })}
                      </div>

                      {pinError && (
                        <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                          {pinError}
                        </div>
                      )}

                      {matchedPinKru && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-left text-xs space-y-2">
                          <div>
                            <b>{matchedPinKru.nama_kru}</b> · {matchedPinKru.divisi} ({matchedPinKru.kode_outlet})
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (onStartDirectKruExam) {
                                onStartDirectKruExam({
                                  outletCode: matchedPinKru.kode_outlet,
                                  namaKru: matchedPinKru.nama_kru,
                                  divisi: matchedPinKru.divisi || 'Semua',
                                });
                              } else {
                                onOpenPublicExam();
                              }
                            }}
                            className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Lanjut Ujian untuk {matchedPinKru.nama_kru.split(' ')[0]}
                          </button>
                        </div>
                      )}

                      {/* Keypad */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => handlePinInput(k)}
                            className="h-10 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 font-bold text-sm text-stone-800 transition-colors cursor-pointer"
                          >
                            {k === 'DEL' ? '⌫' : k}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ---------------- SUB-MODE C: SCAN QR GERAI ---------------- */}
                  {kruSubMode === 'qr' && (
                    <div className="text-center space-y-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                      <div className="font-semibold text-stone-800">
                        Scan QR Code di Dapur Cabang
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Tiap gerai memiliki lembar barcode yang ditempel dekat stasiun kerja kru untuk ujian instan.
                      </p>
                      
                      <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-center">
                        <QrCode size={110} className="text-stone-800" />
                      </div>

                      <div className="text-[11px] font-mono text-stone-600">
                        Outlet Terpilih: <b>{selectedOutletCode}</b>
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const link = `${window.location.origin}/#ujian?outlet=${selectedOutletCode}`;
                            navigator.clipboard?.writeText(link);
                            setQrCopied(true);
                            setTimeout(() => setQrCopied(false), 2000);
                          }}
                          className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy size={12} />
                          <span>{qrCopied ? 'Tersalin!' : 'Salin Tautan'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onStartDirectKruExam) {
                              onStartDirectKruExam({
                                outletCode: selectedOutletCode,
                                namaKru: '',
                                divisi: 'Semua',
                              });
                            } else {
                              onOpenPublicExam();
                            }
                          }}
                          className="px-3 py-1.5 bg-[#96171B] hover:bg-[#801216] text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Buka Portal</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Card Footer: 4 Nilai HARA */}
            <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#EAE5DC] flex items-center justify-between text-[11px] text-stone-500">
              <div className="flex items-center gap-2 font-medium">
                <span className="font-bold text-[#96171B]">Nilai H.A.R.A:</span>
                <span>Halal</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>Amanah</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>Responsif</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>Adaptif</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-emerald-700 font-semibold text-[10px]">
                <ShieldCheck size={13} />
                <span>Koneksi Aman</span>
              </div>
            </div>

          </div>

          {/* Quick System Note */}
          <div className="mt-4 text-center text-xs text-stone-500">
            Butuh bantuan atau pendaftaran akun personil baru?{' '}
            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="text-[#96171B] font-semibold hover:underline cursor-pointer"
            >
              Hubungi IT & Trainer HQ
            </button>
          </div>

        </div>
      </main>

      {/* ========================================================
          3. FOOTER (Minimal & Ringkas)
          ======================================================== */}
      <footer className="relative z-10 border-t border-[#EAE5DC] bg-white/60 py-3.5 px-4 text-center text-xs text-stone-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; {new Date().getFullYear()} <b>HARA Chicken</b> · Trainer & Operations Management System
          </div>
          <div className="flex items-center gap-3 text-[11px] text-stone-400">
            <span>Standar Operasional Prosedur 170°C</span>
            <span aria-hidden="true">·</span>
            <span>Versi Resmi Gerai</span>
          </div>
        </div>
      </footer>

      {/* ========================================================
          MODAL 1: BANTUAN SISTEM & PANDUAN
          ======================================================== */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-[#96171B]" />
                <h3 className="text-sm font-bold text-stone-900">
                  Panduan Akses Masuk Sistem
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
              <div className="p-3 bg-stone-50 rounded-xl space-y-1 border border-stone-100">
                <div className="font-bold text-stone-800">1. Staf, Trainer & Kepala Cabang</div>
                <p>
                  Gunakan email kerja resmi dan kata sandi yang telah didaftarkan oleh IT Kantor Pusat. Hubungi Trainer HQ jika lupa kata sandi.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl space-y-1 border border-stone-100">
                <div className="font-bold text-stone-800">2. Kru Dapur & Kasir Gerai</div>
                <p>
                  Untuk mengikuti ujian evaluasi SOP, beralihlah ke tab <b>"Ujian Kru Lapangan"</b>. Pilih Wilayah $\rightarrow$ Cabang Gerai $\rightarrow$ Nama Anda $\rightarrow$ Stasiun Jobdesk (Kitchen/Kasir/Geprek/Helper).
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl space-y-1 border border-stone-100">
                <div className="font-bold text-stone-800">3. Kontak Dukungan IT & Operasional</div>
                <p className="font-mono text-[11px] text-stone-700">
                  Email: support@harachicken.com<br />
                  WhatsApp HQ: +62 812-3456-7890
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHelpModalOpen(false)}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: LUPA KATA SANDI
          ======================================================== */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-[#96171B]" />
                <h3 className="text-sm font-bold text-stone-900">
                  Pemulihan Kata Sandi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setForgotPasswordOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-stone-600 leading-relaxed">
              <p>
                Demi standar keamanan operasional HARA Chicken, reset kata sandi dilakukan secara terverifikasi melalui Administrator IT Kantor Pusat.
              </p>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1">
                <div className="font-bold text-stone-800">Kontak Verifikasi:</div>
                <div className="font-mono text-[11px] text-stone-700">
                  IT Support: it@harachicken.com<br />
                  Admin HQ: admin@harachicken.com
                </div>
              </div>
              <p className="text-[11px] text-stone-500">
                Sertakan Nama Lengkap, Jabatan, dan Kode Gerai saat mengajukan permohonan reset sandi.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setForgotPasswordOpen(false)}
              className="w-full py-2.5 bg-[#96171B] hover:bg-[#801216] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
