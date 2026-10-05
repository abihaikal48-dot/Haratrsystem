import React from 'react';
import {
  LayoutDashboard, Store, Search, Calendar, Eye, MessageSquare,
  BarChart2, AlertCircle, Award, BookOpen, FileCheck, Brain,
  Wrench, Mic, Shield, FileText, Settings, Users, HelpCircle,
  ChevronLeft, ChevronRight, Sparkles, LogOut, UserCheck, Briefcase,
  GraduationCap, Target, UtensilsCrossed, BarChart3, CalendarCheck
} from 'lucide-react';
import { AppUser } from '../types';
import { HaraLogo } from './HaraLogo';

export type NavTab =
  | 'dashboard'
  | 'monitoring-training'
  | 'evaluasi-kompetensi'
  | 'laporan-resmi'
  | 'operasional-sop'
  | 'budaya-hara'
  | 'stasiun-kerja'
  | 'analitik-radar'
  | 'supervisi-lapangan'
  | 'master'
  | 'users'
  | 'settings'
  | 'bantuan'
  // Legacy alias tabs kept for backwards compatibility
  | 'kurikulum-onboarding'
  | 'ojt-30hari'
  | 'jobdesk-trainer'
  | 'penugasan-trainer'
  | 'jadwal-kunjungan'
  | 'tna-rencana'
  | 'evaluasi-kru'
  | 'bank-sop-soal'
  | 'laporan-eksekutif'
  | 'observasi'
  | 'coaching'
  | 'keluhan'
  | 'talent'
  | 'tna'
  | 'gap'
  | 'rencana'
  | 'penilaian-teori'
  | 'penilaian-praktik'
  | 'penilaian-lisan'
  | 'kompetensi'
  | 'bank-sop'
  | 'bank-soal'
  | 'laporan'
  | 'laporan-diagnostik';

export const ROLE_PERMISSIONS: Record<string, {
  label: string;
  allowedTabs: NavTab[];
  defaultTab: NavTab;
  badgeColor: string;
}> = {
  'Admin': {
    label: 'Administrator HQ & Owner',
    allowedTabs: [
      'dashboard', 'monitoring-training', 'evaluasi-kompetensi', 'laporan-resmi', 'operasional-sop',
      'budaya-hara', 'stasiun-kerja', 'analitik-radar', 'supervisi-lapangan',
      'master', 'users', 'settings', 'bantuan',
      // Legacy
      'kurikulum-onboarding', 'ojt-30hari', 'jobdesk-trainer', 'penugasan-trainer',
      'jadwal-kunjungan', 'tna-rencana', 'evaluasi-kru', 'bank-sop-soal', 'laporan-eksekutif',
      'laporan-diagnostik', 'observasi', 'coaching', 'keluhan', 'talent',
      'penilaian-teori', 'penilaian-praktik', 'penilaian-lisan', 'kompetensi',
      'bank-sop', 'bank-soal', 'tna', 'gap', 'rencana', 'laporan'
    ],
    defaultTab: 'dashboard',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
  'Trainer': {
    label: 'Lead Trainer & People Dev',
    allowedTabs: [
      'dashboard', 'monitoring-training', 'evaluasi-kompetensi', 'laporan-resmi', 'operasional-sop',
      'budaya-hara', 'stasiun-kerja', 'analitik-radar', 'supervisi-lapangan',
      'bantuan',
      // Legacy
      'kurikulum-onboarding', 'ojt-30hari', 'jobdesk-trainer', 'penugasan-trainer',
      'jadwal-kunjungan', 'tna-rencana', 'evaluasi-kru', 'bank-sop-soal', 'laporan-eksekutif',
      'laporan-diagnostik', 'penilaian-teori', 'penilaian-praktik',
      'penilaian-lisan', 'kompetensi', 'bank-sop', 'bank-soal', 'observasi', 'coaching',
      'tna', 'gap', 'rencana', 'laporan'
    ],
    defaultTab: 'dashboard',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  'Kepala Outlet': {
    label: 'Kepala Outlet (Store Manager)',
    allowedTabs: [
      'dashboard', 'monitoring-training', 'budaya-hara', 'stasiun-kerja', 'supervisi-lapangan',
      'laporan-resmi', 'master', 'bantuan',
      // Legacy
      'kurikulum-onboarding', 'ojt-30hari', 'bank-sop-soal', 'laporan-eksekutif',
      'jadwal-kunjungan', 'observasi', 'keluhan', 'bank-sop', 'laporan'
    ],
    defaultTab: 'dashboard',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  'Area Supervisor': {
    label: 'Area Supervisor (Pengawas Wilayah)',
    allowedTabs: [
      'dashboard', 'monitoring-training', 'evaluasi-kompetensi', 'budaya-hara', 'stasiun-kerja', 'analitik-radar',
      'supervisi-lapangan', 'laporan-resmi', 'master', 'bantuan',
      // Legacy
      'tna-rencana', 'kurikulum-onboarding', 'ojt-30hari', 'evaluasi-kru', 'laporan-eksekutif',
      'laporan-diagnostik', 'jadwal-kunjungan', 'observasi', 'tna', 'gap', 'keluhan',
      'kompetensi', 'laporan', 'bank-sop'
    ],
    defaultTab: 'dashboard',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  'SPV Rekrutmen': {
    label: 'SPV Rekrutmen & Talent Acquisition',
    allowedTabs: [
      'dashboard', 'monitoring-training', 'budaya-hara', 'stasiun-kerja', 'supervisi-lapangan',
      'laporan-resmi', 'master', 'bantuan',
      // Legacy
      'kurikulum-onboarding', 'ojt-30hari', 'bank-sop-soal', 'laporan-eksekutif',
      'talent', 'bank-sop', 'laporan'
    ],
    defaultTab: 'dashboard',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
};

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser: AppUser;
  onOpenAICoach: () => void;
  onOpenPublicExam?: () => void;
  onLogout?: () => void;
}

interface NavGroup {
  label: string;
  items: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
  }[];
}

const GROUPS: NavGroup[] = [
  {
    label: 'Dashboard & Monitoring',
    items: [
      { id: 'dashboard', label: 'Dashboard Eksekutif', icon: LayoutDashboard },
      { id: 'monitoring-training', label: 'Monitoring Kru (OJT 30 Hari)', icon: CalendarCheck, badge: 'Gate 1-4' },
    ],
  },
  {
    label: 'Standar & Kompetensi HARA',
    items: [
      { id: 'evaluasi-kompetensi', label: 'Pusat Evaluasi Kru (360°)', icon: Award, badge: 'SOP Ujian' },
      { id: 'budaya-hara', label: 'Visi, Misi & Budaya H.A.R.A', icon: Target, badge: 'H.A.R.A' },
      { id: 'stasiun-kerja', label: '4 Stasiun Kerja (SOP)', icon: UtensilsCrossed, badge: 'Kitchen-Kasir' },
      { id: 'analitik-radar', label: 'Radar Kompetensi 5-Axis', icon: BarChart3, badge: 'Analytics' },
    ],
  },
  {
    label: 'Supervisi & Laporan Resmi',
    items: [
      { id: 'laporan-resmi', label: 'Pusat Rapor & Laporan Resmi', icon: FileCheck, badge: 'A4 & PDF' },
      { id: 'supervisi-lapangan', label: 'Supervisi Lapangan & Coaching', icon: Eye, badge: '5S & GROW' },
    ],
  },
  {
    label: 'Sistem & Administrasi',
    items: [
      { id: 'master', label: 'Master Data Outlet & Kru', icon: Store },
      { id: 'users', label: 'Kelola Pengguna & Akses', icon: Users },
      { id: 'settings', label: 'Pengaturan & Backup', icon: Settings },
      { id: 'bantuan', label: 'Bantuan & Panduan SOP', icon: HelpCircle },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  currentUser,
  onOpenAICoach,
  onOpenPublicExam,
  onLogout,
}) => {
  const userRole = currentUser?.role || 'Trainer';
  const roleConfig = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['Trainer'];
  const allowedTabs = roleConfig.allowedTabs;

  // Filter groups according to allowed tabs for this specific role
  const authorizedGroups = GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => allowedTabs.includes(item.id)),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-[#141210] text-slate-200 flex flex-col z-50 transition-all duration-300 border-r border-white/5 shadow-2xl shrink-0 select-none ${
          collapsed ? 'w-[72px]' : 'w-[250px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header with Official Logo */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 h-14 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {collapsed ? (
              <HaraLogo variant="icon" size="sm" />
            ) : (
              <HaraLogo variant="white" size="sm" />
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-6 h-6 bg-white/5 hover:bg-white/15 rounded-lg items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Role Authority Indicator */}
        {!collapsed && (
          <div className="px-3 pt-2.5 pb-1 shrink-0">
            <div className={`px-2.5 py-1.5 rounded-xl border text-[10.5px] font-bold flex items-center justify-between ${roleConfig.badgeColor}`}>
              <span className="opacity-75 uppercase tracking-wider text-[9px]">Otoritas:</span>
              <span className="truncate max-w-[130px] font-black">{roleConfig.label.split(' ')[0]} {roleConfig.label.split(' ')[1] || ''}</span>
            </div>
          </div>
        )}

        {/* AI Advisor Button */}
        <div className="p-2.5 pb-1 shrink-0">
          <button
            onClick={onOpenAICoach}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 hover:text-white shadow-xs cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Hara Trainer AI Advisor"
          >
            <Sparkles size={14} className="text-[#D48B1E]" />
            {!collapsed && <span className="text-xs truncate">AI Trainer Advisor</span>}
          </button>
        </div>

        {/* Navigation List (Filtered Strictly by Role Authority) */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-3.5">
          {authorizedGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <div className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-400 px-2.5 mb-1.5">
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onCloseMobile();
                      }}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 text-left cursor-pointer ${
                        active
                          ? 'bg-[#96171B] text-white font-bold shadow-sm shadow-red-950/40'
                          : 'text-slate-300 hover:bg-white/8 hover:text-white'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      <Icon
                        size={15}
                        className={`shrink-0 ${active ? 'text-white' : 'text-slate-400'}`}
                      />
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="truncate text-xs">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] font-medium text-stone-400">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Portal Ujian Kru & User Footer */}
        <div className="p-2.5 border-t border-white/10 bg-black/20 shrink-0 space-y-2">
          {onOpenPublicExam && (
            <button
              onClick={onOpenPublicExam}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/5 cursor-pointer ${
                collapsed ? 'justify-center' : ''
              }`}
              title="Portal Ujian Mandiri Kru (Bebas Akses)"
            >
              <Brain size={14} className="text-[#D48B1E] shrink-0" />
              {!collapsed && <span className="text-xs truncate">Portal Ujian Kru</span>}
            </button>
          )}

          <div
            className={`flex items-center ${
              collapsed ? 'justify-center' : 'justify-between'
            } gap-2 px-1`}
          >
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser.nama}
                </div>
                <div className="text-[9.5px] text-[#D9A027] font-extrabold uppercase tracking-wider">
                  {currentUser.role}
                </div>
              </div>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSelectTab('users')}
                className="p-1.5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Kelola Akun & Hak Akses"
              >
                <Users size={14} />
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 hover:bg-red-500/20 text-rose-300 hover:text-rose-200 rounded-lg transition-colors cursor-pointer"
                  title="Logout / Keluar"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
