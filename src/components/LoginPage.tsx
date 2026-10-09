import React, { useState, useEffect } from 'react';
import {
  Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, HelpCircle,
  AlertCircle, Key, Brain, ChevronDown,
  RefreshCw, Shield, X
} from 'lucide-react';
import { AppUser, Division } from '../types';
import { db } from '../lib/storage';
import { HaraLogo } from './HaraLogo';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser) => void;
  onOpenPublicExam?: () => void;
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
  onlineCount = 1,
  onOpenPresenceModal,
}) => {
  // =========================================================================
  // FORM LOGIN STAF & MANAJEMEN RESMI
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

  // Database Users Master Data
  const users = db.getTable<AppUser>('app_users');

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

              {/* FORM LOGIN STAF & MANAJEMEN */}
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
                <div className="font-bold text-stone-800">2. Kru Dapur, Kasir & Lapangan</div>
                <p>
                  Ujian evaluasi SOP kru sekarang memiliki <b>halaman tersendiri</b>. Klik tombol <b>"Portal Ujian Kru"</b> di pojok kanan atas atau tautan di bawah formulir login. Kru dapat langsung mengikuti ujian mandiri tanpa login akun dan tanpa PIN.
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
