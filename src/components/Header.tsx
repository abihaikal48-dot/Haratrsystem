import React, { useState, useEffect } from 'react';
import {
  Menu, Search, Bell, Sparkles, Building2,
  CheckCircle2, ChevronDown, Check, UserCheck,
  Brain, LogOut, User, Shield, Clock, AlertTriangle,
  CheckCheck, FileSpreadsheet, Lock, Cloud
} from 'lucide-react';
import { AppUser, Outlet } from '../types';
import { db } from '../lib/storage';
import { HaraLogo } from './HaraLogo';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  currentUser: AppUser;
  onOpenAICoach: () => void;
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
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  currentUser,
  onOpenAICoach,
  onOpenCommandPalette,
  selectedOutletCode,
  onSelectOutletCode,
  outlets,
  onOpenPublicExam,
  onLogout,
  onOpenGoogleWorkspace,
  onlineCount = 1,
  onOpenPresenceModal,
  onLockSession,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOutletDropdown, setShowOutletDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // Notifications State
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Temuan TNA Prioritas Tinggi',
      desc: 'HC-JTS01 Kitchen: Ayam krispi bagian paha belum matang sempurna.',
      time: '10m lalu',
      unread: true,
      type: 'tna',
    },
    {
      id: 'n2',
      title: 'Pencapaian Skor Mahir',
      desc: 'Budi Santoso mencapai skor akhir 100/100 (Mahir).',
      time: '1 jam lalu',
      unread: true,
      type: 'score',
    },
    {
      id: 'n3',
      title: 'Keluhan Pelanggan Baru',
      desc: 'HC-BTL01 Kasir: Salah input varian sambal.',
      time: '3 jam lalu',
      unread: false,
      type: 'complaint',
    },
    {
      id: 'n4',
      title: 'Jadwal Training Shift Pagi',
      desc: 'SOP Kalibrasi Suhu Fryer terjadwal jam 09:30 WIB.',
      time: 'Hari Ini',
      unread: true,
      type: 'schedule',
    },
  ]);

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filteredNotifs =
    notifFilter === 'ALL'
      ? notifications
      : notifications.filter((n) => n.unread);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      {/* Left side: Hamburger (mobile), Logo mark, Outlet Switcher */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
          onClick={onOpenMobileSidebar}
          aria-label="Buka Menu Navigasi"
        >
          <Menu size={18} />
        </button>

        {/* Contextual Breadcrumb Trail (Nuvio Layout) */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium hover:text-slate-600 transition-colors">Overview</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-800 font-bold">Dashboard & Operasional</span>
        </div>

        {/* Clean Outlet Scope Selector Pill */}
        <div className="relative hidden lg:block ml-2">
          <button
            onClick={() => setShowOutletDropdown(!showOutletDropdown)}
            className="flex items-center gap-2 bg-[#F8F6F2] hover:bg-[#EFECE5] border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 transition-all cursor-pointer hover:shadow-xs"
          >
            <Building2 size={13} className="text-[#96171B]" />
            <span className="text-xs max-w-[170px] truncate">
              {selectedOutletCode === 'ALL'
                ? 'Semua Outlet'
                : outlets.find((o) => o.kode_outlet === selectedOutletCode)?.nama_outlet || selectedOutletCode}
            </span>
            <ChevronDown size={13} className="text-slate-400 shrink-0 ml-0.5" />
          </button>

          {showOutletDropdown && (
            <div
              className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in"
              onClick={() => setShowOutletDropdown(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pilih Cakupan Outlet
              </div>
              <button
                onClick={() => onSelectOutletCode('ALL')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  selectedOutletCode === 'ALL'
                    ? 'bg-red-50 text-[#96171B] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Semua Cabang (Nasional)</span>
                {selectedOutletCode === 'ALL' && <Check size={14} className="text-[#96171B]" />}
              </button>
              <div className="h-px bg-slate-100 my-1" />
              {outlets.map((o) => (
                <button
                  key={o.id}
                  onClick={() => onSelectOutletCode(o.kode_outlet)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left cursor-pointer transition-colors ${
                    selectedOutletCode === o.kode_outlet
                      ? 'bg-red-50 text-[#96171B] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-bold text-xs">{o.nama_outlet}</div>
                    <div className="text-[10px] text-slate-400">{o.kode_outlet} • {o.kepala_outlet}</div>
                  </div>
                  {selectedOutletCode === o.kode_outlet && <Check size={14} className="text-[#96171B] shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Quick Search, Live Clock, Portal Ujian, AI, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* Quick Search Trigger (Ctrl+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 bg-[#F8F6F2] hover:bg-[#EFECE5] border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-medium transition-all cursor-pointer"
          title="Buka Pencarian Cepat (Ctrl+K)"
        >
          <Search size={13} className="text-slate-400" />
          <span className="hidden sm:inline text-xs">Cari...</span>
          <kbd className="hidden sm:inline bg-white px-1.5 py-0.5 rounded-md text-[10px] font-bold border border-slate-200 text-slate-500 shadow-2xs">
            Ctrl+K
          </kbd>
        </button>

        {/* Live Digital Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium">
          <Clock size={12} className="text-[#96171B]" />
          <span>{currentDate}</span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-slate-900 font-bold">{currentTime}</span>
        </div>

        {/* Live Presence: Who is browsing the site */}
        {onOpenPresenceModal && (
          <button
            onClick={onOpenPresenceModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Klik untuk melihat siapa saja yang sedang membuka web"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono tabular-nums">{onlineCount}</span>
            <span className="hidden sm:inline text-[11px] font-semibold">Online</span>
          </button>
        )}

        {/* Google Workspace & Cloud Sync Button */}
        {onOpenGoogleWorkspace && (
          <button
            onClick={onOpenGoogleWorkspace}
            className="flex items-center gap-1.5 bg-[#F8F6F2] hover:bg-[#EFECE5] text-stone-700 hover:text-stone-900 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer hover:shadow-xs"
            title="Sinkronisasi Google Sheets, Drive & Firebase Firestore"
          >
            <FileSpreadsheet size={13} className="text-emerald-700" />
            <span className="hidden md:inline text-xs">Google Sync</span>
          </button>
        )}

        {/* AI Advisor Assistant */}
        <button
          onClick={onOpenAICoach}
          className="flex items-center gap-1.5 bg-[#F8F6F2] hover:bg-[#EFECE5] text-stone-700 hover:text-stone-900 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer hover:shadow-xs"
          title="Buka AI Trainer Coach"
        >
          <Sparkles size={13} className="text-[#D48B1E]" />
          <span className="hidden md:inline text-xs">AI Advisor</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
            title="Notifikasi & Alert Sistem"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#96171B] rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-red-50 text-[#96171B] px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={12} />
                    <span>Tandai Dibaca</span>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 pt-2 pb-1.5 text-[11px] font-bold">
                <button
                  onClick={() => setNotifFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    notifFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Semua ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('UNREAD')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    notifFilter === 'UNREAD'
                      ? 'bg-[#96171B] text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Belum Dibaca ({unreadCount})
                </button>
              </div>

              {/* List */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto mt-1 pr-1">
                {filteredNotifs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-medium">
                    Tidak ada notifikasi saat ini.
                  </div>
                ) : (
                  filteredNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        n.unread
                          ? 'bg-red-50/40 border-red-100 hover:bg-red-50/70'
                          : 'bg-[#FAF9F7] border-slate-200/60 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900 leading-tight">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
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

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {currentUser.nama.charAt(0)}
            </div>
            <div className="hidden sm:block text-left leading-none">
              <div className="text-xs font-bold text-slate-900 truncate max-w-[100px]">
                {currentUser.nama}
              </div>
              <div className="text-[10px] text-[#96171B] font-bold mt-0.5">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown size={12} className="text-slate-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in"
              onClick={() => setShowUserDropdown(false)}
            >
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900 truncate">{currentUser.nama}</div>
                <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                <div className="mt-1">
                  <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold bg-[#96171B]/10 text-[#96171B]">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                {onLockSession && (
                  <button
                    onClick={onLockSession}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    <Lock size={13} className="text-amber-600" />
                    <span>Kunci Layar Sesi</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
