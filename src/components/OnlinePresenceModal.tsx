import React from 'react';
import {
  Users, Smartphone, Monitor, Shield, Store,
  Clock, CheckCircle2, X, RefreshCw, Radio
} from 'lucide-react';
import { ActiveUserPresence } from '../lib/firestoreSync';

interface OnlinePresenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onlineUsers: ActiveUserPresence[];
}

export const OnlinePresenceModal: React.FC<OnlinePresenceModalProps> = ({
  isOpen,
  onClose,
  onlineUsers,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-stone-200 p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <Radio size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Presence
                </span>
                <span className="text-stone-300">·</span>
                <span className="text-[11px] font-mono text-stone-500 font-bold">
                  {onlineUsers.length} Pengguna Aktif
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                Pengguna yang Sedang Membuka Web
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 font-bold flex items-center justify-center cursor-pointer transition-colors text-xs"
          >
            ✕
          </button>
        </div>

        {/* Live List */}
        <div className="space-y-2">
          {onlineUsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400 font-medium">
              Tidak ada sesi aktif terdeteksi saat ini.
            </div>
          ) : (
            onlineUsers.map((user, idx) => {
              const isMobile = user.device.toLowerCase().includes('mobile');
              return (
                <div
                  key={user.id || idx}
                  className="p-3.5 rounded-2xl border border-stone-200/90 bg-[#FAF8F5] hover:bg-white transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-800 shrink-0 shadow-2xs">
                      {user.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-stone-900 truncate font-bold text-xs">
                          {user.nama}
                        </strong>
                        <span className="text-[10px] font-bold text-[#96171B] bg-red-50 px-2 py-0.2 rounded-md border border-red-200 shrink-0">
                          {user.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Store size={11} className="text-stone-400" />
                          <span>{user.outlet}</span>
                        </span>
                        <span className="text-stone-300">·</span>
                        <span className="flex items-center gap-1 text-stone-500">
                          {isMobile ? <Smartphone size={11} /> : <Monitor size={11} />}
                          <span>{user.device}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Aktif
                    </span>
                    <span className="block text-[10px] text-stone-400 mt-0.5 font-mono">
                      {new Date(user.last_seen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-[11px] text-stone-500 leading-relaxed">
          <p>
            <b>Sinkronisasi Real-Time:</b> Status kehadiran diperbarui otomatis setiap 20 detik melalui Firebase Firestore. Anda dapat memantau siapa saja trainer, supervisor, atau kru yang sedang mengakses aplikasi secara langsung.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs cursor-pointer transition-all"
        >
          Tutup Pemantau
        </button>
      </div>
    </div>
  );
};
