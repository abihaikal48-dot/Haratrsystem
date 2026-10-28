import React, { useState, useEffect } from 'react';
import {
  Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, HelpCircle,
  AlertCircle, Shield, X, AlertTriangle, CheckCircle2, ExternalLink,
  Store, Users, Key, Clock, Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppUser } from '../types';
import { db } from '../lib/storage';
import { HaraLogo } from './HaraLogo';
import { GeometricBackdrop } from './ui/GeometricBackdrop';

interface LoginPageProps {
  onLoginSuccess: (user: AppUser) => void;
  onOpenPublicExam?: () => void;
  onlineCount?: number;
  onOpenPresenceModal?: () => void;
}

// Master credential registry for registered system roles
const REGISTERED_STAFF_REGISTRY = [
  {
    nama: 'Haikal Abi',
    email: 'haikal@harachicken.com',
    username: 'haikal',
    defaultPass: 'hara123',
    role: 'Trainer',
  },
  {
    nama: 'Administrator HQ',
    email: 'admin@harachicken.com',
    username: 'admin',
    defaultPass: 'hara123',
    role: 'Admin',
  },
  {
    nama: 'Jihan',
    email: 'jihan@harachicken.com',
    username: 'jihan',
    defaultPass: 'hara123',
    role: 'RnD',
  },
  {
    nama: 'Feri',
    email: 'feri@harachicken.com',
    username: 'feri',
    defaultPass: 'hara123',
    role: 'RnD',
  },
  {
    nama: 'Ari',
    email: 'ari@harachicken.com',
    username: 'ari',
    defaultPass: 'hara123',
    role: 'Trainer',
  },
];

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 300; // 5 Menit proteksi anti-brute force

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onOpenPublicExam,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security Lockout Tracking
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

  // Check existing lockout timestamp on mount
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

  // Cooldown timer interval
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

  // Load remembered username/email
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
      const mins = Math.floor(lockoutRemaining / 60);
      const secs = lockoutRemaining % 60;
      setErrorMsg(`Akses dibekukan demi keamanan. Tunggu ${mins > 0 ? `${mins}m ` : ''}${secs}s.`);
      return;
    }

    setIsSubmitting(true);
    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();

    if (!inputEmail || !inputPass) {
      setErrorMsg('Mohon masukkan email/username dan kata sandi Anda.');
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
      db.addLog('UBAH', 'Keamanan', `Gagal login (${inputEmail}) percobaan #${nextFails}/${MAX_LOGIN_ATTEMPTS}.`);

      if (nextFails >= MAX_LOGIN_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_SECONDS * 1000;
        localStorage.setItem('hara_auth_lockout_until', until.toString());
        setLockoutRemaining(LOCKOUT_DURATION_SECONDS);
        db.addLog(
          'UBAH',
          'Keamanan',
          `Akun ${inputEmail} dibekukan selama 5 menit karena ${MAX_LOGIN_ATTEMPTS} kali salah kata sandi.`
        );
        setErrorMsg(`Terlalu banyak percobaan gagal. Akses dibekukan selama ${LOCKOUT_DURATION_SECONDS / 60} menit.`);
      } else {
        const remainingAttempts = MAX_LOGIN_ATTEMPTS - nextFails;
        setErrorMsg(`${msg} (Sisa percobaan aman: ${remainingAttempts} kali)`);
      }
      setIsSubmitting(false);
    };

    // 1. Cek akun master terdaftar
    const targetStaff = REGISTERED_STAFF_REGISTRY.find(
      (a) => a.email.toLowerCase() === inputEmail || a.username.toLowerCase() === inputEmail
    );

    if (targetStaff) {
      const matchedInDb = users.find(
        (u) => u.email.toLowerCase() === targetStaff.email.toLowerCase()
      );
      const customPass = matchedInDb ? localStorage.getItem(`hara_user_pass_${matchedInDb.id}`) : null;
      const expectedPass = customPass || targetStaff.defaultPass;

      if (inputPass !== expectedPass) {
        recordFailedAttempt('Kata sandi yang Anda masukkan tidak cocok.');
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

    // 2. Cek database user tambahan
    const customUser = users.find((u) => u.email.toLowerCase() === inputEmail);
    if (customUser) {
      const customPass = localStorage.getItem(`hara_user_pass_${customUser.id}`);
      if (!customPass || inputPass !== customPass) {
        recordFailedAttempt('Kata sandi yang Anda masukkan tidak cocok.');
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

    recordFailedAttempt('Akun dengan email atau username tersebut tidak terdaftar.');
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] text-[#0F172A] selection:bg-[#96171B] selection:text-white overflow-hidden select-none">
      {/* Outer Margin Geometric Backdrop - Never overlaps content */}
      <GeometricBackdrop variant="login" />

      {/* Floating Island Header */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2 z-10">
        <div className="flex items-center gap-3">
          <HaraLogo size="md" variant="full" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{outlets.length} Outlet Terhubung</span>
          </div>

          {onOpenPublicExam && (
            <button
              onClick={onOpenPublicExam}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-red-50 text-[#96171B] border border-red-200/80 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <span>Portal Ujian Kru Mandiri</span>
              <ExternalLink size={13} />
            </button>
          )}
        </div>
      </header>

      {/* Main Container: Focused & Seamless White Form (No nested cards or split panes) */}
      <main className="flex-1 w-full mx-auto my-auto py-8 sm:py-12 flex items-center justify-center z-10 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/90 relative">
          
          {/* Header Branding */}
          <div className="text-center space-y-3 mb-6">
            <div className="flex justify-center">
              <HaraLogo size="lg" variant="badge" />
            </div>
            <div>
              <h1 className="font-['Outfit'] font-black text-2xl sm:text-3xl text-[#0F172A] tracking-tight">
                HARA CHICKEN
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Sistem Operasional & Evaluasi Kompetensi Outlet
              </p>
            </div>
          </div>

          {/* Lockout Warning Banner */}
          {lockoutRemaining > 0 && (
            <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold">
                <Clock size={16} className="text-amber-700 animate-spin" />
                <span>Akses Dibekukan Sementara</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Terlalu banyak percobaan gagal. Silakan tunggu jeda keamanan:
              </p>
              <div className="text-sm font-black font-mono text-amber-900 pt-0.5">
                Sisa Waktu: {Math.floor(lockoutRemaining / 60)}m {lockoutRemaining % 60}s
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Username / Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                <span>Email atau Username Resmi</span>
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Contoh: haikal@harachicken.com"
                disabled={isSubmitting || lockoutRemaining > 0}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-full px-4.5 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#96171B] focus:ring-2 focus:ring-[#96171B]/15 focus:bg-white transition-all font-medium shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                autoComplete="username"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock size={13} className="text-slate-400" />
                  <span>Kata Sandi</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(true)}
                  className="text-[11px] text-slate-500 hover:text-[#96171B] font-medium transition-colors cursor-pointer"
                >
                  Ubah sandi?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Masukkan kata sandi..."
                  disabled={isSubmitting || lockoutRemaining > 0}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-full px-4.5 py-3 pr-11 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#96171B] focus:ring-2 focus:ring-[#96171B]/15 focus:bg-white transition-all font-medium shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {isCapsLockOn && (
                <div className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  <span>Caps Lock sedang aktif</span>
                </div>
              )}
            </div>

            {/* Remember Me & Help Link */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#96171B] focus:ring-[#96171B]"
                />
                <span>Ingat akun</span>
              </label>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-slate-500 hover:text-[#96171B] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <HelpCircle size={13} className="text-[#96171B]" />
                <span>Pusat Bantuan</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Submit Pill Button */}
            <button
              type="submit"
              disabled={isSubmitting || lockoutRemaining > 0}
              className="w-full py-3.5 rounded-full bg-[#96171B] hover:bg-[#7A1216] active:bg-[#600E12] disabled:opacity-50 text-white font-bold text-sm tracking-wide shadow-md shadow-red-950/15 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Security & Outlet Status Bar */}
          <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Shield size={12} className="text-[#96171B]" />
              <span>Proteksi brute-force ({MAX_LOGIN_ATTEMPTS}x batas)</span>
            </span>
            <span className="font-medium text-slate-500">11 Outlet Aktif</span>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full max-w-6xl mx-auto py-2 text-center text-xs text-slate-400 z-10">
        © 2026 HARA Chicken Indonesia · Operational Competency System Pro
      </footer>

      {/* Official IT Help Modal (Zero Credential Leak) */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-md w-full text-[#0F172A] space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Headphones size={17} className="text-[#96171B]" />
                  <h3 className="font-['Outfit'] font-bold text-base text-[#0F172A]">
                    Pusat Bantuan Akses Sistem
                  </h3>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Tutup modal"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <p>
                  Sistem ini merupakan platform internal resmi untuk <strong>Trainer, Area Supervisor, Kepala Outlet, R&D, dan Manajemen HQ</strong> HARA Chicken.
                </p>

                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#96171B]" />
                    <span>Kebijakan Kredensial Resmi:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Kredensial diberikan secara personal kepada staf terdaftar saat penugasan.</li>
                    <li>Dilarang membagikan atau memindahtangankan akun login staf kepada pihak lain.</li>
                    <li>Sistem membatasi maksimal 5 kali percobaan gagal sebelum akses dibekukan otomatis.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-200/70 space-y-1.5">
                  <div className="font-bold text-[#96171B]">Lupa Sandi atau Butuh Akun Baru?</div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    Silakan hubungi <strong>Kepala Outlet</strong> Anda atau kontak tim <strong>IT Support & HRD HARA HQ</strong> di outlet terdekat untuk verifikasi identitas resmi.
                  </p>
                </div>

                <div className="text-[11px] text-slate-500 pt-1">
                  * Peserta ujian kru dapat langsung mengerjakan asesmen tanpa login staf melalui tombol <strong>Portal Ujian Kru Mandiri</strong> di pojok kanan atas.
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Mengerti & Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Password Modal (Clean White Theme) */}
      <AnimatePresence>
        {showChangePasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 max-w-md w-full text-[#0F172A] space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Key size={17} className="text-[#96171B]" />
                  <h3 className="font-['Outfit'] font-bold text-base text-[#0F172A]">
                    Ubah Kata Sandi Akun
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setChangePassStatus({ type: 'idle', message: '' });
                  }}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Tutup modal"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const { identifier, oldPass, newPass, confirmPass } = changePassForm;
                  const targetIdClean = identifier.trim().toLowerCase();

                  if (!targetIdClean || !oldPass || !newPass) {
                    setChangePassStatus({ type: 'error', message: 'Harap lengkapi semua isian formulir.' });
                    return;
                  }
                  if (newPass !== confirmPass) {
                    setChangePassStatus({ type: 'error', message: 'Konfirmasi kata sandi baru tidak cocok.' });
                    return;
                  }
                  if (newPass.length < 6) {
                    setChangePassStatus({ type: 'error', message: 'Kata sandi baru minimal 6 karakter demi keamanan.' });
                    return;
                  }

                  // Cari akun resmi
                  const staffMatch = REGISTERED_STAFF_REGISTRY.find(
                    (a) => a.email.toLowerCase() === targetIdClean || a.username.toLowerCase() === targetIdClean
                  );
                  const dbUser = users.find(
                    (u) => u.email.toLowerCase() === targetIdClean
                  );

                  if (!staffMatch && !dbUser) {
                    setChangePassStatus({ type: 'error', message: 'Akun dengan email/username tersebut tidak ditemukan.' });
                    return;
                  }

                  const targetId = (dbUser && dbUser.id) || (staffMatch && `usr-${staffMatch.username}`);
                  const currentSavedPass = targetId ? localStorage.getItem(`hara_user_pass_${targetId}`) : null;
                  const currentExpected = currentSavedPass || (staffMatch ? staffMatch.defaultPass : '');

                  if (oldPass !== currentExpected) {
                    setChangePassStatus({ type: 'error', message: 'Kata sandi lama yang Anda masukkan tidak sesuai.' });
                    return;
                  }

                  if (targetId) {
                    localStorage.setItem(`hara_user_pass_${targetId}`, newPass);
                    db.addLog('UBAH', 'Keamanan', `Pengguna ${targetIdClean} berhasil memperbarui kata sandi secara mandiri.`);
                    setChangePassStatus({ type: 'success', message: 'Kata sandi berhasil diperbarui! Silakan masuk kembali.' });
                    setTimeout(() => {
                      setShowChangePasswordModal(false);
                      setPassword(newPass);
                      setChangePassForm({ identifier: '', oldPass: '', newPass: '', confirmPass: '' });
                      setChangePassStatus({ type: 'idle', message: '' });
                    }, 1400);
                  }
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email atau Username Terdaftar</label>
                  <input
                    type="text"
                    value={changePassForm.identifier}
                    onChange={(e) => setChangePassForm({ ...changePassForm, identifier: e.target.value })}
                    placeholder="Contoh: haikal@harachicken.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#96171B] focus:ring-1 focus:ring-[#96171B]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    value={changePassForm.oldPass}
                    onChange={(e) => setChangePassForm({ ...changePassForm, oldPass: e.target.value })}
                    placeholder="Masukkan sandi saat ini"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#96171B] focus:ring-1 focus:ring-[#96171B]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={changePassForm.newPass}
                    onChange={(e) => setChangePassForm({ ...changePassForm, newPass: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#96171B] focus:ring-1 focus:ring-[#96171B]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={changePassForm.confirmPass}
                    onChange={(e) => setChangePassForm({ ...changePassForm, confirmPass: e.target.value })}
                    placeholder="Ketik ulang sandi baru"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#96171B] focus:ring-1 focus:ring-[#96171B]"
                    required
                  />
                </div>

                {changePassStatus.message && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      changePassStatus.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    {changePassStatus.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    <span>{changePassStatus.message}</span>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePasswordModal(false);
                      setChangePassStatus({ type: 'idle', message: '' });
                    }}
                    className="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#96171B] hover:bg-[#7A1216] text-white text-xs font-bold rounded-full shadow-md shadow-red-950/15 transition-all cursor-pointer"
                  >
                    Simpan Sandi Baru
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
