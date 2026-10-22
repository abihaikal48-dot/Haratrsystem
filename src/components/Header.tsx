import React, { useState, useEffect } from 'react';
import {
  Menu, Search, Bell, Building2,
  ChevronDown, Check, LogOut,
  CheckCheck, Lock, Cloud, RefreshCw, WifiOff
} from 'lucide-react';
import { AppUser, Outlet } from '../types';
import { subscribeCloudSyncStatus, getCloudSyncStatus, CloudSyncStatus } from '../lib/firestoreSync';

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
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOutletDropdown, setShowOutletDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>(getCloudSyncStatus());

  useEffect(() => {
    return subscribeCloudSyncStatus(setCloudStatus);
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
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-white/95 backdrop-blur-md border-b border-neutral-200 select-none">
      {/* Zone 1 (Kiri): Menu trigger mobile + Outlet Selector Minimalis */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
          onClick={onOpenMobileSidebar}
          aria-label="Buka Menu Navigasi"
        >
          <Menu size={18} />
        </button>

        {/* Minimalist Outlet Scope Selector */}
        <div className="relative">
          <button
            onClick={() => setShowOutletDropdown(!showOutletDropdown)}
            className="flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer"
            title="Ubah Filter Cakupan Outlet"
          >
            <Building2 size={14} className="text-[#96171B] shrink-0" />
            <span className="max-w-[160px] sm:max-w-[200px] truncate">
              {selectedOutletName}
            </span>
            <ChevronDown size={13} className="text-neutral-400 shrink-0 ml-0.5" />
          </button>

          {showOutletDropdown && (
            <div
              className="absolute left-0 mt-1.5 w-64 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 p-1 space-y-0.5"
              onClick={() => setShowOutletDropdown(false)}
            >
              <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Cakupan Data Gerai
              </div>
              <button
                onClick={() => onSelectOutletCode('ALL')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  selectedOutletCode === 'ALL'
                    ? 'bg-red-50 text-[#96171B] font-bold border border-red-100'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span>Semua Cabang (Nasional)</span>
                {selectedOutletCode === 'ALL' && <Check size={14} className="text-[#96171B]" />}
              </button>
              <div className="h-px bg-neutral-100 my-1" />
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {outlets.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => onSelectOutletCode(o.kode_outlet)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs text-left cursor-pointer transition-colors ${
                      selectedOutletCode === o.kode_outlet
                        ? 'bg-red-50 text-[#96171B] font-bold border border-red-100'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-semibold text-xs text-neutral-900">{o.nama_outlet}</div>
                      <div className="text-[10px] text-neutral-400">{o.kode_outlet} · {o.kepala_outlet}</div>
                    </div>
                    {selectedOutletCode === o.kode_outlet && <Check size={14} className="text-[#96171B] shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone 2 (Kanan): Quick Search, Clean Cloud Status, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Trigger (Ctrl+K) */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs text-neutral-600 font-medium transition-colors cursor-pointer"
          title="Buka Pencarian Cepat (Ctrl+K)"
        >
          <Search size={14} className="text-neutral-400 shrink-0" />
          <span className="hidden sm:inline text-xs">Cari modul...</span>
          <kbd className="hidden sm:inline bg-white px-1.5 py-0.5 rounded text-[10px] font-semibold border border-neutral-200 text-neutral-500">
            Ctrl+K
          </kbd>
        </button>

        {/* Minimalist Cloud Firestore Connection Status (Clean unboxed icon) */}
        <div
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-neutral-600"
          title={
            cloudStatus === 'online'
              ? 'Terhubung ke Cloud Firestore (Real-Time Sync Aktif)'
              : cloudStatus === 'syncing'
              ? 'Sedang menulis data ke Firestore...'
              : 'Mode offline (Tersimpan di antrean lokal)'
          }
        >
          {cloudStatus === 'online' && (
            <Cloud size={15} className="text-neutral-500" />
          )}
          {cloudStatus === 'syncing' && (
            <RefreshCw size={14} className="text-[#96171B] animate-spin" />
          )}
          {cloudStatus === 'offline' && (
            <WifiOff size={15} className="text-neutral-400" />
          )}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg relative transition-colors cursor-pointer"
            title="Notifikasi Sistem"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#96171B] rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white border border-neutral-200 rounded-lg shadow-lg p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-neutral-900">Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] text-[#96171B] font-bold">
                      ({unreadCount} baru)
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck size={12} />
                    <span>Tandai dibaca</span>
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 pt-2 pb-1 text-[11px] font-medium">
                <button
                  onClick={() => setNotifFilter('ALL')}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    notifFilter === 'ALL'
                      ? 'bg-neutral-900 text-white font-semibold'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Semua ({notifications.length})
                </button>
                <button
                  onClick={() => setNotifFilter('UNREAD')}
                  className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                    notifFilter === 'UNREAD'
                      ? 'bg-[#96171B] text-white font-semibold'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Belum Dibaca ({unreadCount})
                </button>
              </div>

              {/* List */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto mt-1 pr-1">
                {filteredNotifs.length === 0 ? (
                  <div className="py-6 text-center text-xs text-neutral-400">
                    Tidak ada notifikasi saat ini.
                  </div>
                ) : (
                  filteredNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-md border text-left transition-colors ${
                        n.unread
                          ? 'bg-red-50/50 border-red-100'
                          : 'bg-white border-neutral-100 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-neutral-900 leading-tight">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-neutral-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
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
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg hover:bg-neutral-100 border border-transparent hover:border-neutral-200 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.nama.charAt(0)}
            </div>
            <div className="hidden sm:block text-left leading-none">
              <div className="text-xs font-semibold text-neutral-900 truncate max-w-[110px]">
                {currentUser.nama}
              </div>
              <div className="text-[10px] text-neutral-500 font-medium mt-0.5">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown size={12} className="text-neutral-400 hidden sm:block" />
          </button>

          {showUserDropdown && (
            <div
              className="absolute right-0 mt-1.5 w-52 bg-white border border-neutral-200 rounded-lg shadow-lg p-1 z-50"
              onClick={() => setShowUserDropdown(false)}
            >
              <div className="px-3 py-2 border-b border-neutral-100">
                <div className="text-xs font-bold text-neutral-900 truncate">{currentUser.nama}</div>
                <div className="text-[11px] text-neutral-500 truncate">{currentUser.email}</div>
                <div className="mt-1 text-[10px] font-semibold text-[#96171B]">
                  Peran: {currentUser.role}
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                {onLockSession && (
                  <button
                    onClick={onLockSession}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <Lock size={13} className="text-neutral-500" />
                    <span>Kunci Layar Sesi</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
