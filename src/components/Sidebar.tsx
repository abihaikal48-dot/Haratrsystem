import React from 'react';
import {
  LayoutDashboard, Store, Search, Calendar, Eye, MessageSquare,
  BarChart2, AlertCircle, Award, BookOpen, FileCheck, Brain,
  Wrench, Mic, Shield, FileText, Settings, Users, HelpCircle,
  ChevronLeft, ChevronRight, Sparkles, LogOut, UserCheck, Briefcase,
  GraduationCap, Target, UtensilsCrossed, BarChart3, CalendarCheck,
  CheckCircle2, Flame, Layers, ChevronsUpDown
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
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
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
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
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
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
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
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
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
  onOpenCommandPalette?: () => void;
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
    label: 'DASHBOARD & OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Overview & Analitik Gerai', icon: LayoutDashboard },
    ],
  },
  {
    label: 'STANDAR & TOOLS DAPUR',
    items: [
      { id: 'budaya-hara', label: 'Budaya & 12 Perilaku H.A.R.A', icon: Target },
      { id: 'stasiun-kerja', label: '4 Stasiun Kerja & Tools Dapur', icon: UtensilsCrossed },
    ],
  },
  {
    label: 'PELATIHAN & RETRAINING',
    items: [
      { id: 'monitoring-training', label: 'Training & Retraining OJT', icon: CalendarCheck, badge: 'H1-30' },
    ],
  },
  {
    label: 'EVALUASI & SUPERVISI',
    items: [
      { id: 'evaluasi-kompetensi', label: 'Pusat Evaluasi Kru (4 Pilar)', icon: Award, badge: '4 Pilar' },
      { id: 'supervisi-lapangan', label: 'Supervisi & Coaching (GROW)', icon: Eye, badge: 'GROW' },
    ],
  },
  {
    label: 'LAPORAN & SISTEM',
    items: [
      { id: 'laporan-resmi', label: 'Pusat Rapor Resmi & PDF', icon: FileCheck, badge: 'Multi-Size' },
      { id: 'master', label: 'Master Data Gerai & Kru', icon: Store },
      { id: 'users', label: 'Kelola Pengguna & Akses', icon: Users },
      { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
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
  onOpenCommandPalette,
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

  // User initials
  const initials = currentUser?.nama
    ? currentUser.nama.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'HA';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-white text-slate-700 flex flex-col z-50 transition-all duration-300 border-r border-slate-200/90 shadow-2xs shrink-0 select-none ${
          collapsed ? 'w-[74px]' : 'w-[260px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header with Official Logo & Brand */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/80 h-16 shrink-0 bg-white">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              H
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 tracking-tight leading-none">
                  HARA Chicken
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">
                  Operations & People Dev
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg items-center justify-center transition-colors cursor-pointer"
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Search input with ⌘K shortcut trigger */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all shadow-2xs cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-xs">
                <Search size={14} className="text-slate-400 group-hover:text-slate-600" />
                <span className="text-slate-500">Cari menu & SOP...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white text-slate-500 rounded border border-slate-200">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {authorizedGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!collapsed && (
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-2.5 mb-1.5">
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
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 text-left cursor-pointer group relative ${
                        active
                          ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/80 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      } ${collapsed ? 'justify-center px-2' : ''}`}
                    >
                      {active && (
                        <div className="absolute left-0 top-2 bottom-2 w-1 bg-amber-600 rounded-r-full" />
                      )}
                      <Icon
                        size={16}
                        className={`shrink-0 transition-colors ${
                          active
                            ? 'text-amber-600'
                            : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                              active
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
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

          {/* Quick AI & Exam Actions */}
          <div className="pt-2 border-t border-slate-200/60 space-y-1">
            <button
              onClick={onOpenAICoach}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/15 hover:to-orange-500/15 border border-amber-200/60 text-amber-900 cursor-pointer ${
                collapsed ? 'justify-center px-2' : ''
              }`}
              title="AI Trainer Advisor"
            >
              <Sparkles size={15} className="text-amber-600 shrink-0" />
              {!collapsed && <span className="truncate">AI Trainer Advisor</span>}
            </button>

            {onOpenPublicExam && (
              <button
                onClick={onOpenPublicExam}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer ${
                  collapsed ? 'justify-center px-2' : ''
                }`}
                title="Portal Ujian Mandiri Kru"
              >
                <Brain size={15} className="text-slate-400 shrink-0" />
                {!collapsed && <span className="truncate">Portal Ujian Kru</span>}
              </button>
            )}
          </div>
        </nav>

        {/* User Profile Card at Bottom (Nuvio UI Style) */}
        <div className="p-3 border-t border-slate-200/80 bg-white shrink-0">
          <div
            className={`p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center ${
              collapsed ? 'justify-center' : 'justify-between'
            } gap-2.5 transition-all`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar circle with online status dot */}
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-300">
                  {initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {currentUser.nama || 'Haikal Abi'}
                  </div>
                  <div className="text-[10.5px] text-slate-500 truncate">
                    {currentUser.email || 'trainer@harachicken.com'}
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onSelectTab('settings')}
                  className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Pengaturan Akun"
                >
                  <Settings size={14} />
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Logout / Keluar"
                  >
                    <LogOut size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
