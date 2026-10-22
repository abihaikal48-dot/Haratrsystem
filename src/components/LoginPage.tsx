import React, { useState, useEffect } from 'react';
import {
  Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, HelpCircle,
  AlertCircle, Shield, X, AlertTriangle, CheckCircle2, Flame, ExternalLink,
  Sparkles, Check, Store, Users, Award, Wifi, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppUser } from '../types';
import { db } from '../lib/storage';
import { HaraLogo } from './HaraLogo';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser) => void;
  onOpenPublicExam?: () => void;
  onlineCount?: number;
  onOpenPresenceModal?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenPublicExam,
  onlineCount = 6,
  onOpenPresenceModal,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(() => {
    const saved = localStorage.getItem('hara_auth_failed_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Modals
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePassForm, setChangePassForm] = useState({
    identifier: '',
    oldPass: '',
    newPass: '',
    confirmPass: '',
  });
  const [changePassStatus, setChangePassStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const users = db.getTable<AppUser>('app_users');
  const outlets = db.getTable<any>('outlets');

  const officialAccounts = [
    {
      nama: 'Administrator HQ',
      email: 'admin@harachicken.com',
      username: 'admin',
      pass: 'hara123',
      role: 'Admin',
      badge: 'HQ Super Admin',
      deskripsi: 'Pusat sistem & konfigurasi penuh HARA',
    },
    {
      nama: 'Haikal Abi',
      email: 'haikal@harachicken.com',
      username: 'haikal',
      pass: 'hara123',
      role: 'Trainer',
      badge: 'Lead Trainer & PD',
      deskripsi: 'Penilai Onboarding & Audit Mutu Lapangan',
    },
    {
      nama: 'Jihan',
      email: 'jihan@harachicken.com',
      username: 'jihan',
      pass: 'hara123',
      role: 'Trainer',
      badge: 'Trainer Lapangan',
      deskripsi: 'Penilai Onboarding & Asesmen Standar SOP',
    },
    {
      nama: 'Feri',
      email: 'feri@harachicken.com',
      username: 'feri',
      pass: 'hara123',
      role: 'Trainer',
      badge: 'Trainer Lapangan',
      deskripsi: 'Penilai Onboarding & Asesmen Standar SOP',
    },
    {
      nama: 'Ari',
      email: 'ari@harachicken.com',
      username: 'ari',
      pass: 'hara123',
      role: 'Trainer',
      badge: 'Trainer Lapangan',
      deskripsi: 'Penilai Onboarding & Asesmen Standar SOP',
    },
  ];

  useEffect(() => {
    const lockoutUntil = localStorage.getItem('hara_auth_lockout_until');
    if (lockoutUntil) {
      const remainingSec = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000);
      if (remainingSec > 0) {
        setLockoutRemaining(remainingSec);
      } else {
        localStorage.removeItem('hara_auth_lockout_until');
        localStorage.removeItem('hara_auth_failed_attempts');
        setFailedAttempts(0);
      }
    }
  }, []);

  useEffect(() => {
    if (lockoutRemaining <= 0) {
      localStorage.removeItem('hara_auth_lockout_until');
      localStorage.removeItem('hara_auth_failed_attempts');
      setFailedAttempts(0);
      return;
    }
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          localStorage.removeItem('hara_auth_lockout_until');
          localStorage.removeItem('hara_auth_failed_attempts');
          setFailedAttempts(0);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  useEffect(() => {
    const saved = localStorage.getItem('hara_saved_login_email');
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsCapsLockOn(e.getModifierState && e.getModifierState('CapsLock'));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (lockoutRemaining > 0) {
      setErrorMsg(`Akses dibekukan sementara demi keamanan. Tunggu ${lockoutRemaining} detik.`);
      return;
    }

    setIsSubmitting(true);
    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();

    if (!inputEmail || !inputPass) {
      setErrorMsg('Mohon isi email dan kata sandi Anda.');
      setIsSubmitting(false);
      return;
    }

    if (rememberMe) {
      localStorage.setItem('hara_saved_login_email', inputEmail);
    } else {
      localStorage.removeItem('hara_saved_login_email');
    }

    const recordFailedAttempt = (msg: string) => {
      const nextFails = failedAttempts + 1;
      setFailedAttempts(nextFails);
      localStorage.setItem('hara_auth_failed_attempts', nextFails.toString());
      db.addLog('UBAH', 'Keamanan', `Gagal login (${inputEmail}) percobaan #${nextFails}/4.`);

      if (nextFails >= 4) {
        const lockoutSec = 60;
        const untilTime = Date.now() + lockoutSec * 1000;
        localStorage.setItem('hara_auth_lockout_until', untilTime.toString());
        setLockoutRemaining(lockoutSec);
        setErrorMsg('Akses terkunci selama 60 detik karena 4 kali salah kata sandi (Proteksi Keamanan).');
      } else {
        const remaining = 4 - nextFails;
        setErrorMsg(`${msg} Sisa percobaan: ${remaining}x sebelum terkunci.`);
      }
      setIsSubmitting(false);
    };

    const targetStaff = officialAccounts.find(
      (a) => a.email.toLowerCase() === inputEmail || a.username.toLowerCase() === inputEmail
    );
    if (targetStaff) {
      const matchedInDb = users.find(
        (u) => u.email.toLowerCase() === targetStaff.email.toLowerCase()
      );
      const customPass = matchedInDb ? localStorage.getItem(`hara_user_pass_${matchedInDb.id}`) : null;
      const expectedPass = customPass || targetStaff.pass;

      if (inputPass !== expectedPass) {
        recordFailedAttempt('Kata sandi salah.');
        return;
      }

      let matched = matchedInDb;
      if (!matched) {
        matched = {
          id: 'usr-' + targetStaff.username,
          nama: targetStaff.nama,
          email: targetStaff.email,
          role: targetStaff.role as any,
          status_aktif: 'Aktif',
          created_at: new Date().toISOString(),
        };
        db.insertRow('app_users', matched);
      }

      setFailedAttempts(0);
      localStorage.removeItem('hara_auth_failed_attempts');
      localStorage.removeItem('hara_auth_lockout_until');
      db.setCurrentUser(matched);
      db.addLog('UBAH', 'Autentikasi', `Pengguna ${matched.nama} (${matched.role}) berhasil masuk.`);
      onLoginSuccess(matched);
      setIsSubmitting(false);
      return;
    }

    const customUser = users.find((u) => u.email.toLowerCase() === inputEmail);
    if (customUser) {
      const customPass = localStorage.getItem(`hara_user_pass_${customUser.id}`);
      if (!customPass || inputPass !== customPass) {
        recordFailedAttempt('Kata sandi salah.');
        return;
      }

      setFailedAttempts(0);
      localStorage.removeItem('hara_auth_failed_attempts');
      localStorage.removeItem('hara_auth_lockout_until');
      db.setCurrentUser(customUser);
      db.addLog('UBAH', 'Autentikasi', `Pengguna ${customUser.nama} (${customUser.role}) berhasil masuk.`);
      onLoginSuccess(customUser);
      setIsSubmitting(false);
      return;
    }

    recordFailedAttempt('Akun dengan email tersebut tidak ditemukan.');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#181411] flex flex-col justify-between selection:bg-[#96171B] selection:text-white">
      {/* Top Bar Navigation */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HaraLogo size="md" variant="full" />
          <div className="hidden sm:block h-4 w-px bg-[#E6E1DA]" />
          <span className="hidden sm:inline-block text-[11px] font-semibold tracking-wider text-[#645D55] uppercase">
            Platform Pelatihan & Operasional Gerai Terstandar
          </span>
        </div>

        {/* Action: Link ke Portal Ujian Kru (#ujian) */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (onOpenPresenceModal) onOpenPresenceModal();
            }}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E6E1DA] text-xs font-medium text-[#645D55] hover:text-[#181411] hover:border-[#96171B]/30 transition-all shadow-[0_1px_3px_rgba(24,20,17,0.04)]"
            title="Status jaringan operasional gerai"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{outlets.length} Gerai Online</span>
          </button>

          {onOpenPublicExam && (
            <button
              onClick={onOpenPublicExam}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#96171B] to-[#7A1216] text-white text-xs font-semibold hover:shadow-md hover:brightness-105 transition-all shadow-sm"
            >
              <span>Portal Ujian Kru</span>
              <ExternalLink size={13} />
            </button>
          )}
        </div>
      </header>

      {/* Main Container: Clean Split-Screen (Desktop) & Focused Single Card (Mobile) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column (Desktop Only): Brand Values & System Architecture */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-6 pr-6"
          >
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E6E1DA] text-[11px] font-bold text-[#96171B] shadow-[0_1px_3px_rgba(24,20,17,0.04)] w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#96171B]" />
              <span>Standard Baku QSR Mutu #BeneranDiGeprek</span>
            </div>

            <div>
              <h1 className="text-3xl xl:text-4xl font-extrabold text-[#181411] tracking-tight leading-tight">
                Single Source of Truth <br />
                <span className="text-[#96171B]">Pelatihan & Standarisasi Gerai</span>
              </h1>
              <p className="mt-3 text-sm text-[#645D55] leading-relaxed max-w-xl">
                Sistem terpadu evaluasi 4 pilar kompetensi, penilaian hybrid kognitif & psikometri kerja, jeda belajar mandiri remedial, dan kurikulum onboarding resmi PT HARA Chicken Indonesia.
              </p>
            </div>

            {/* 3 Core Pillar Badges */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)]">
                <div className="text-[11px] font-bold text-[#645D55] uppercase">Standar Penggorengan</div>
                <div className="text-lg font-black text-[#181411] mt-0.5">175°C / 160°C</div>
                <p className="text-[11px] text-[#645D55] mt-1">Timer 12 mnt, Core ≥74°C</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)]">
                <div className="text-[11px] font-bold text-[#645D55] uppercase">Formula Evaluasi</div>
                <div className="text-lg font-black text-[#96171B] mt-0.5">4 Pilar Baku</div>
                <p className="text-[11px] text-[#645D55] mt-1">Teori 25% • SOS 35% • HARA 20%</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)]">
                <div className="text-[11px] font-bold text-[#645D55] uppercase">Onboarding Kru</div>
                <div className="text-lg font-black text-[#C88A1E] mt-0.5">3 Hari (25 Jam)</div>
                <p className="text-[11px] text-[#645D55] mt-1">10 Sesi • RnD Hands-on 16 Jam</p>
              </div>
            </div>

            {/* Quick Access Card for Crew Exam */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-[#FAF8F5] border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#96171B] flex items-center justify-center shrink-0 font-bold border border-red-100">
                  <Award size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#181411]">Kru Sedang Ujian Mandiri?</h4>
                  <p className="text-[11px] text-[#645D55]">Akses langsung lembar ujian mingguan 4 jobdesk tanpa perlu login staf.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenPublicExam}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#96171B] text-[#96171B] text-xs font-bold hover:bg-red-50 transition-colors"
              >
                <span>Buka #ujian</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Clean Minimalist Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="lg:col-span-5 w-full max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] p-6 sm:p-8">
              
              {/* Card Header */}
              <div className="text-center mb-6">
                <div className="inline-flex justify-center mb-2 lg:hidden">
                  <HaraLogo size="md" variant="icon" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#181411] tracking-tight">
                  Login Staf & Manajemen
                </h2>
                <p className="text-xs text-[#645D55] mt-1">
                  Gunakan email operasional terdaftar untuk masuk
                </p>
              </div>

              {/* Lockout Warning */}
              {lockoutRemaining > 0 && (
                <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs">
                  <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Akses Dibekukan Sementara</p>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      Percobaan gagal melebihi batas. Tunggu{' '}
                      <span className="font-bold font-mono text-amber-900">{lockoutRemaining} detik</span>.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && lockoutRemaining === 0 && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs">
                  <AlertCircle size={15} className="text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#181411] mb-1.5">
                    Email Kerja
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#645D55]">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@harachicken.com"
                      disabled={lockoutRemaining > 0 || isSubmitting}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E6E1DA] text-sm text-[#181411] placeholder-[#645D55]/60 focus:outline-none focus:border-[#96171B] focus:ring-2 focus:ring-[#96171B]/15 bg-[#FAF8F5]/50 hover:bg-white focus:bg-white transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#181411]">
                      Kata Sandi
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setChangePassStatus({ type: 'idle', message: '' });
                          setShowChangePasswordModal(true);
                        }}
                        className="text-[11px] text-[#645D55] hover:text-[#96171B] hover:underline font-medium"
                      >
                        Ganti kata sandi
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowHelpModal(true)}
                        className="text-[11px] text-[#96171B] hover:underline font-medium"
                      >
                        Bantuan
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#645D55]">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="••••••••"
                      disabled={lockoutRemaining > 0 || isSubmitting}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#E6E1DA] text-sm text-[#181411] placeholder-[#645D55]/60 focus:outline-none focus:border-[#96171B] focus:ring-2 focus:ring-[#96171B]/15 bg-[#FAF8F5]/50 hover:bg-white focus:bg-white transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#645D55] hover:text-[#181411] transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {isCapsLockOn && (
                    <p className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                      <AlertTriangle size={11} /> Caps Lock aktif
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <label className="flex items-center gap-2 text-[#645D55] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#E6E1DA] text-[#96171B] focus:ring-[#96171B] cursor-pointer accent-[#96171B]"
                    />
                    <span>Ingat email saya</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={lockoutRemaining > 0 || isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#96171B] hover:bg-[#7A1216] active:bg-[#600E12] text-white font-semibold text-sm shadow-[0_1px_3px_rgba(24,20,17,0.04)] hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <span>Memverifikasi...</span>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Mobile-only Portal Ujian link */}
            <div className="lg:hidden mt-4 text-center">
              <button
                type="button"
                onClick={onOpenPublicExam}
                className="text-xs font-semibold text-[#96171B] hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Portal Ujian Mandiri Kru (#ujian)</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-[#645D55] border-t border-[#E6E1DA]/60">
        <p>© 2026 PT HARA CHICKEN INDONESIA • Divisi People Development & Operational Excellence</p>
      </footer>

      {/* Modal Bantuan */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-xl border border-[#E6E1DA] max-w-sm w-full p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA] mb-3">
                <h3 className="text-sm font-bold text-[#181411]">Bantuan Akses Staf</h3>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="p-1 rounded-lg text-[#645D55] hover:text-[#181411] hover:bg-[#FAF8F5]"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3 text-xs text-[#645D55] leading-relaxed">
                <p>
                  Akun penilai resmi terdaftar: <strong>Haikal</strong>, <strong>Jihan</strong>, <strong>Feri</strong>, dan <strong>Ari</strong> serta <strong>Administrator HQ</strong>.
                </p>
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1DA] text-[#181411]">
                  <p className="font-semibold text-xs mb-1">Kata Sandi Default:</p>
                  <p className="text-[11px] text-[#645D55]">Semua akun menggunakan kata sandi default <code className="px-1.5 py-0.5 rounded bg-white border border-[#E6E1DA] font-mono text-[#96171B]">hara123</code>. Anda dapat menggantinya kapan saja melalui menu &quot;Ganti kata sandi&quot;.</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#E6E1DA] text-right">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="text-xs font-semibold text-[#96171B] hover:underline px-3 py-1.5"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Ganti Kata Sandi */}
      <AnimatePresence>
        {showChangePasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-xl border border-[#E6E1DA] max-w-sm w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E6E1DA]">
                <div>
                  <h3 className="text-sm font-bold text-[#181411]">Ganti Kata Sandi</h3>
                  <p className="text-[11px] text-[#645D55]">Ubah sandi default hara123 ke sandi pribadi Anda</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="p-1 rounded-lg text-[#645D55] hover:text-[#181411] hover:bg-[#FAF8F5]"
                >
                  <X size={16} />
                </button>
              </div>

              {changePassStatus.message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    changePassStatus.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  {changePassStatus.type === 'success' ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                  )}
                  <span>{changePassStatus.message}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const idInput = changePassForm.identifier.trim().toLowerCase();
                  const targetStaff = officialAccounts.find(
                    (a) => a.email.toLowerCase() === idInput || a.username.toLowerCase() === idInput
                  );
                  if (!targetStaff) {
                    setChangePassStatus({ type: 'error', message: 'Akun penilai/staf tidak ditemukan.' });
                    return;
                  }
                  const matchedInDb = users.find(
                    (u) => u.email.toLowerCase() === targetStaff.email.toLowerCase()
                  );
                  const storedCustomPass = matchedInDb ? localStorage.getItem(`hara_user_pass_${matchedInDb.id}`) : null;
                  const currentActivePass = storedCustomPass || targetStaff.pass;

                  if (changePassForm.oldPass !== currentActivePass) {
                    setChangePassStatus({ type: 'error', message: 'Kata sandi lama tidak sesuai.' });
                    return;
                  }
                  if (!changePassForm.newPass || changePassForm.newPass.length < 5) {
                    setChangePassStatus({ type: 'error', message: 'Kata sandi baru minimal 5 karakter.' });
                    return;
                  }
                  if (changePassForm.newPass !== changePassForm.confirmPass) {
                    setChangePassStatus({ type: 'error', message: 'Konfirmasi kata sandi tidak cocok.' });
                    return;
                  }

                  let userId = matchedInDb?.id;
                  if (!userId) {
                    const newU: AppUser = {
                      id: 'usr-' + targetStaff.username,
                      nama: targetStaff.nama,
                      email: targetStaff.email,
                      role: targetStaff.role as any,
                      status_aktif: 'Aktif',
                      created_at: new Date().toISOString(),
                    };
                    db.insertRow('app_users', newU);
                    userId = newU.id;
                  }

                  localStorage.setItem(`hara_user_pass_${userId}`, changePassForm.newPass);
                  db.addLog('UBAH', 'Autentikasi', `Kata sandi akun ${targetStaff.nama} berhasil diperbarui.`);
                  setChangePassStatus({ type: 'success', message: 'Kata sandi berhasil diubah! Silakan login.' });
                  setTimeout(() => {
                    setShowChangePasswordModal(false);
                    setChangePassForm({ identifier: '', oldPass: '', newPass: '', confirmPass: '' });
                  }, 1200);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-[#181411] font-semibold mb-1">Email atau Username</label>
                  <input
                    type="text"
                    required
                    placeholder="haikal, jihan, feri, ari, atau admin"
                    value={changePassForm.identifier}
                    onChange={(e) => setChangePassForm({ ...changePassForm, identifier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] focus:outline-none focus:border-[#96171B]"
                  />
                </div>
                <div>
                  <label className="block text-[#181411] font-semibold mb-1">Kata Sandi Lama</label>
                  <input
                    type="password"
                    required
                    placeholder="Sandi default: hara123"
                    value={changePassForm.oldPass}
                    onChange={(e) => setChangePassForm({ ...changePassForm, oldPass: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] focus:outline-none focus:border-[#96171B]"
                  />
                </div>
                <div>
                  <label className="block text-[#181411] font-semibold mb-1">Kata Sandi Baru</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 5 karakter"
                    value={changePassForm.newPass}
                    onChange={(e) => setChangePassForm({ ...changePassForm, newPass: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] focus:outline-none focus:border-[#96171B]"
                  />
                </div>
                <div>
                  <label className="block text-[#181411] font-semibold mb-1">Konfirmasi Sandi Baru</label>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi kata sandi baru"
                    value={changePassForm.confirmPass}
                    onChange={(e) => setChangePassForm({ ...changePassForm, confirmPass: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E6E1DA] focus:outline-none focus:border-[#96171B]"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowChangePasswordModal(false)}
                    className="px-3.5 py-2 rounded-xl border border-[#E6E1DA] text-[#645D55] font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#96171B] hover:bg-[#7A1216] text-white font-semibold shadow-xs"
                  >
                    Simpan Kata Sandi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
