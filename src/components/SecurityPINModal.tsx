import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, Check, X, KeyRound } from 'lucide-react';
import { db } from '../lib/storage';
import { UserRole } from '../types';

interface SecurityPINModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (verifiedUser: string, role: UserRole) => void;
  title?: string;
  description: string;
  targetItemName?: string;
  requiredRoles?: UserRole[];
}

export const SecurityPINModal: React.FC<SecurityPINModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Verifikasi Keamanan & Otoritas',
  description,
  targetItemName,
  requiredRoles = ['Trainer', 'Admin'] as UserRole[],
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = (pinToTest?: string) => {
    const candidate = pinToTest !== undefined ? pinToTest : pin;
    if (!candidate || candidate.length < 4) {
      setErrorMsg('Masukkan 4 digit PIN otorisasi');
      return;
    }

    const res = db.verifySecurityPIN(candidate, requiredRoles);
    if (!res.success) {
      setErrorMsg(res.message);
      setSuccessMsg(null);
    } else {
      setErrorMsg(null);
      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess(res.verifiedUser || 'Otoritas Resmi', res.role || 'Trainer');
        onClose();
        setPin('');
        setSuccessMsg(null);
      }, 500);
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const next = pin + num;
      setPin(next);
      setErrorMsg(null);
      if (next.length === 4) {
        handleVerify(next);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">Dual-Authorization & Tamper Guard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900 mb-0.5">{description}</p>
              {targetItemName && (
                <p className="text-slate-600">Target: <strong className="text-slate-900">{targetItemName}</strong></p>
              )}
              <p className="text-[11px] text-amber-800 mt-1">
                Wewenang resmi: {requiredRoles.join(' / ')}
              </p>
            </div>
          </div>

          {/* PIN Input Display */}
          <div className="text-center py-2">
            <p className="text-xs font-medium text-slate-600 mb-3">Masukkan 4-Digit Security PIN</p>
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3].map(idx => (
                <div
                  key={idx}
                  className={`w-11 h-12 rounded-xl border flex items-center justify-center text-lg font-mono font-bold transition-all ${
                    pin[idx]
                      ? 'border-red-500 bg-red-50/30 text-red-600 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-transparent'
                  }`}
                >
                  {pin[idx] ? '●' : '—'}
                </div>
              ))}
            </div>
          </div>

          {/* Error / Success message */}
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center font-medium flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Numpad */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => handleKeyPress(n)}
                className="h-11 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-sm font-semibold text-slate-800 active:scale-95 transition-all"
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={handleDelete}
              className="h-11 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-500 active:scale-95 transition-all flex items-center justify-center"
            >
              Hapus
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="h-11 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-sm font-semibold text-slate-800 active:scale-95 transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleVerify()}
              className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold active:scale-95 transition-all flex items-center justify-center"
            >
              OK
            </button>
          </div>

          {/* Role PIN Quick Cheat info for prototype demo */}
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap justify-between gap-1">
            <span>PIN Trainer: <strong className="text-slate-700 font-mono">8899</strong></span>
            <span>PIN Store Mgr: <strong className="text-slate-700 font-mono">7788</strong></span>
            <span>PIN Admin HQ: <strong className="text-slate-700 font-mono">9900</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
