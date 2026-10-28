import React, { useState, useEffect } from 'react';
import {
  Menu, Search, Bell, Building2,
  ChevronDown, Check, LogOut,
  CheckCheck, Lock, Cloud, RefreshCw, WifiOff, Database
} from 'lucide-react';
import { AppUser, Outlet } from '../types';
import { subscribeCloudSyncStatus, getCloudSyncStatus, CloudSyncStatus } from '../lib/firestoreSync';
import { HaraLogo } from './HaraLogo';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  currentUser: AppUser;
  onOpenAICoach?: () => void;
  onOpenCommandPalette: () => void;
  selectedOutletCode: string;
  onSelectOutletCode: (code: string) => void;
  outlets: Outlet[];
  onOpenPublicExam?: () => void;
  onLogout?: () => void;
  onOpenGoogleWorkspace?: () => void;
  onlineCount?: number;
  onOpenPresenceModal?: () => void;
  onLockSession?: () => void;
  onOpenSupabaseModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  currentUser,
  onOpenCommandPalette,
  selectedOutletCode,
  onSelectOutletCode,
  outlets,
  onLogout,
  onLockSession,
  onOpenSupabaseModal,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOutletDropdown, setShowOutletDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<import('../lib/supabase').SupabaseStatus>(() => {
    try {
      const { getSupabaseStatus } = require('../lib/supabase');
      return getSupabaseStatus();
    } catch {
      return 'disconnected';
    }
  });

  useEffect(() => {
    let unsub = () => {};
    import('../lib/supabase').then(({ subscribeSupabaseStatus, getSupabaseStatus }) => {
      setSupabaseStatus(getSupabaseStatus());
      unsub = subscribeSupabaseStatus(setSupabaseStatus);
    }).catch(() => {});
    return () => unsub();
  }, []);

  // Notifications State
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Temuan TNA Prioritas Tinggi',
      desc: 'HC-JTS01 Kitchen: Ayam krispi bagian paha belum matang sempurna.',
      time: '10m lalu',
      unread: true,
    },
    {
      id: 'n2',
      title: 'Pencapaian Skor Mahir',
      desc: 'Budi Santoso mencapai skor akhir 100/100 (Mahir).',
      time: '1 jam lalu',
      unread: true,
    },
    {
      id: 'n3',
      title: 'Keluhan Pelanggan Baru',
      desc: 'HC-BTL01 Kasir: Salah input varian sambal.',
      time: '3 jam lalu',
      unread: false,
    },
    {
      id: 'n4',
      title: 'Jadwal Training Shift Pagi',
      desc: 'SOP Kalibrasi Suhu Fryer terjadwal jam 09:30 WIB.',
      time: 'Hari Ini',
      unread: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filteredNotifs =
    notifFilter === 'ALL'
      ? notifications
      : notifications.filter((n) => n.unread);

  const selectedOutletName =
    selectedOutletCode === 'ALL'
      ? 'Semua Outlet (Nasional)'
      : outlets.find((o) => o.kode_outlet === selectedOutletCode)?.nama_outlet || selectedOutletCode;

  return (
    <header className="sticky top-2 sm:top-3 z-30 max-w-7xl w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] mx-auto my-2 sm:my-3 px-3.5 sm:px-6 py-2 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between select-none transition-all">
      {/* Zone 1 (Kiri): Menu trigger mobile + Brand badge + Outlet Selector Pill */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
          onClick={onOpenMobileSidebar}
          aria-label="Buka Menu Navigasi"
        >
          <Menu size={18} />
        </button>

        {/* Brand Mini Capsule for Desktop */}
        <div className="hidden lg:flex items-center gap-2 pr-2 border-r border-slate-200">
          <HaraLogo size="sm" variant="icon-only" />
          <span className="font-['Outfit'] font-black text-sm text-[#0F172A] tracking-wider">
            HARA<span className="text-[#96171B]">.OPS</span>
          </span>
        </div>

        {/* Minimalist Outlet Scope Selector Capsule */}
        <div className="relative">
          <button
            onClick={() => setShowOutletDropdown(!showOutletDropdown)}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs"
            title="Ubah Filter Cakupan Outlet"
          >
            <Building2 size={13} className="text-[#96171B] shrink-0" />
            <span className="max-w-[140px] sm:max-w-[190px] truncate">
              {selectedOutletName}
            </span>
            <ChevronDown size={12} className="text-slate-400 shrink-0 ml-0.5" />
          </button>

          {showOutletDropdown && (
            <div
              className="absolute left-0 mt-2 w-72 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-1"
              onClick={() => setShowOutletDropdown(false)}
            >
              <div className="px-3.5 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Cakupan Data Outlet
              </div>
              <button
                onClick={() => onSelectOutletCode('ALL')}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  selectedOutletCode === 'ALL'
                    ? 'bg-red-50 text-[#96171B] font-bold border border-red-200/60 shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Semua Cabang (Nasional)</span>
                {selectedOutletCode === 'ALL' && <Check size={14} className="text-[#96171B]" />}
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
                {outlets.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => onSelectOutletCode(o.kode_outlet)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-left cursor-pointer transition-colors ${
                      selectedOutletCode === o.kode_outlet
                        ? 'bg-red-50 text-[#96171B] font-bold border border-red-200/60 shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-semibold text-xs text-slate-900">{o.nama_outlet}</div>
                      <div className="text-[10px] text-slate-400">{o.kode_outlet} · {o.kepala_outlet}</div>
                    </div>
                    {selectedOutletCode === o.kode_outlet && <Check size={14} className="text-[#96171B] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone 2 (Kanan): Quick Search, Supabase Badge, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Quick Search Trigger (Ctrl+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-600 font-medium transition-colors cursor-pointer shadow-2xs"
          title="Buka Pencarian Cepat (Ctrl+K)"
        >
          <Search size={13} className="text-slate-400 shrink-0" />
          <span className="hidden sm:inline text-xs">Cari modul...</span>
          <kbd className="hidden md:inline bg-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold border border-slate-200 text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Supabase Realtime Database Status Badge */}
        <button
          onClick={onOpenSupabaseModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border shadow-2xs ${
            supabaseStatus === 'connected'
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
              : supabaseStatus === 'connecting'
              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              : 'bg-red-50 hover:bg-red-100 text-red-800 border-red-200'
          }`}
          title={
            supabaseStatus === 'connected'
              ? 'Supabase Terhubung (Sinkronisasi Realtime Aktif). Klik untuk kelola koneksi.'
              : supabaseStatus === 'connecting'
              ? 'Sedang menghubungkan ke Supabase...'
              : 'Supabase Belum Terhubung. Klik untuk konfigurasi kredensial.'
          }
        >
          <Database size={13} className={supabaseStatus === 'connecting' ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">
            {supabaseStatus === 'connected' ? 'Supabase' : supabaseStatus === 'connecting' ? 'Koneksi...' : 'Supabase'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              supabaseStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : supabaseStatus === 'connecting'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
          />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full relative transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title="Notifikasi Sistem"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#96171B] rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-3.5 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] text-[#96171B] font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200/60">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={12} />
                    <span>Tandai dibaca</span>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 pt-2.5 pb-1.5 text-[11px] font-medium">
                <button
                  onClick={() => setNotifFilter('ALL')}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    notifFilter === 'ALL'
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Semua ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('UNREAD')}
                  className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
                    notifFilter === 'UNREAD'
                      ? 'bg-[#96171B] text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Belum Dibaca ({unreadCount})
                </button>
              </div>

              {/* List */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto mt-1 pr-1">
                {filteredNotifs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    Tidak ada notifikasi saat ini.
                  </div>
                ) : (
                  filteredNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-left transition-colors ${
                        n.unread
                          ? 'bg-red-50/50 border-red-100'
                          : 'bg-white border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-slate-900 leading-tight">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {n.desc}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Capsule & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 border border-slate-200 bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <div className="w-7 h-7 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {currentUser.nama.charAt(0)}
            </div>
            <div className="hidden sm:block text-left leading-none">
              <div className="text-xs font-semibold text-slate-900 truncate max-w-[110px]">
                {currentUser.nama}
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1"
              onClick={() => setShowUserDropdown(false)}
            >
              <div className="px-3.5 py-2.5 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900 truncate font-['Outfit']">{currentUser.nama}</div>
                <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                <div className="mt-1.5 inline-flex items-center text-[10px] font-semibold text-[#96171B] bg-red-50 px-2 py-0.5 rounded-full border border-red-200/60">
                  Peran: {currentUser.role}
                </div>
              </div>

              <div className="py-1.5 space-y-0.5">
                {onLockSession && (
                  <button
                    onClick={onLockSession}
                    className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Lock size={13} className="text-slate-500" />
                    <span>Kunci Layar Sesi</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Keluar dari Akun</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
