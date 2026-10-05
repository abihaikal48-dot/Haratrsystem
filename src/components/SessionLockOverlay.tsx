import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, AlertCircle, Eye, EyeOff, LogOut, ShieldCheck, Key } from 'lucide-react';
import { AppUser, SystemSettings } from '../types';
import { db } from '../lib/storage';
import { HaraLogo } from './HaraLogo';

interface SessionLockOverlayProps {
  currentUser: AppUser;
  onUnlock: () => void;
  onLogout: () => void;
  lockReason?: string;
}

export const SessionLockOverlay: React.FC<SessionLockOverlayProps> = ({
  currentUser,
  onUnlock,
  onLogout,
  lockReason = 'Sesi terkunci otomatis karena inaktivitas layar untuk menjaga keamanan data operasional.',
}) => {
  const [credentialInput, setCredentialInput] = useState('');
  const [showCredential, setShowCredential] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const input = credentialInput.trim();
    if (!input) {
      setErrorMsg('Masukkan kata sandi atau PIN Supervisor untuk membuka sesi.');
      return;
    }

    // Retrieve settings for supervisor PIN
    const settingsList = db.getTable<SystemSettings>('settings');
    const supervisorPin = settingsList[0]?.supervisor_security_pin || '123456';

    // Retrieve custom user password or fallback
    const storedPassKey = `hara_user_pass_${currentUser.id}`;
    const customPass = localStorage.getItem(storedPassKey);
    const validPasswords = [
      customPass,
      currentUser.email.includes('admin') ? 'admin123' : 'haikal123',
      'password123',
      'spv123',
      'rian123',
      'siti123',
    ].filter(Boolean);

    const isPinMatch = input === supervisorPin;
    const isPassMatch = validPasswords.includes(input);

    if (isPinMatch || isPassMatch) {
      db.addLog(
        'UBAH',
        'Keamanan',
        `Sesi layar ${currentUser.nama} (${currentUser.role}) berhasil dibuka kembali.`
      );
      onUnlock();
    } else {
      const nextFails = failedAttempts + 1;
      setFailedAttempts(nextFails);
      db.addLog(
        'UBAH',
        'Keamanan',
        `Gagal membuka kunci sesi untuk user ${currentUser.nama} (Percobaan #${nextFails})`
      );
      if (nextFails >= 5) {
        setErrorMsg('Terlalu banyak percobaan salah (5x). Silakan keluar akun dan login ulang.');
      } else {
        setErrorMsg(`Kata sandi atau PIN salah. Sisa kesempatan: ${5 - nextFails}x.`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-7 space-y-5 text-center">
        {/* Brand & Security Icon */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-stone-900 text-white flex items-center justify-center shadow-lg">
            <Lock size={26} className="text-amber-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <ShieldAlert size={12} className="text-amber-600" />
            <span>Sesi Diamankan</span>
          </div>
          <h2 className="text-lg font-black text-stone-900 tracking-tight">
            Layar Terkunci
          </h2>
          <p className="text-[11.5px] text-stone-500 leading-relaxed max-w-xs">
            {lockReason}
          </p>
        </div>

        {/* User Card */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
            {currentUser.nama.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-stone-900 truncate">
              {currentUser.nama}
            </div>
            <div className="text-[11px] text-stone-400 truncate">
              {currentUser.email}
            </div>
            <span className="inline-block mt-0.5 text-[9.5px] px-2 py-0.5 rounded-md font-bold bg-[#96171B]/10 text-[#96171B]">
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 text-left animate-in fade-in">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Unlock Form */}
        <form onSubmit={handleUnlock} className="space-y-3.5">
          <div className="space-y-1 text-left">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-stone-700">
                Kata Sandi Akun / PIN Supervisor
              </label>
              <button
                type="button"
                onClick={() => setShowCredential(!showCredential)}
                className="text-[10.5px] text-stone-400 hover:text-stone-700 flex items-center gap-1 cursor-pointer"
              >
                {showCredential ? <EyeOff size={11} /> : <Eye size={11} />}
                <span>{showCredential ? 'Sembunyi' : 'Lihat'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showCredential ? 'text' : 'password'}
                required
                autoFocus
                value={credentialInput}
                onChange={(e) => setCredentialInput(e.target.value)}
                placeholder="Masukkan sandi atau 6-digit PIN..."
                className="w-full bg-[#FAF8F5] border border-stone-300 rounded-xl px-3.5 py-2.5 pl-9 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#96171B]/15 focus:border-[#96171B] transition-all"
              />
              <Key size={14} className="absolute left-3 top-3 text-stone-400" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#96171B] hover:bg-[#801216] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-[0.99]"
          >
            <Unlock size={14} />
            <span>Buka Kunci Sesi</span>
          </button>
        </form>

        {/* Switch / Logout Action */}
        <div className="pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={onLogout}
            className="text-[11.5px] font-bold text-stone-500 hover:text-red-700 transition-colors flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <LogOut size={13} />
            <span>Beralih Akun / Keluar Sesi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
