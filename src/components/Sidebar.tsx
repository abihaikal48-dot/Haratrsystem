import React from 'react';
import {
  LayoutDashboard, Store, Search, Eye, MessageSquare,
  BarChart2, AlertCircle, Award, BookOpen, FileCheck, Brain,
  Wrench, Mic, Shield, FileText, Settings, Users, HelpCircle,
  ChevronLeft, ChevronRight, Sparkles, LogOut, UserCheck, Briefcase,
  GraduationCap, Target, UtensilsCrossed, BarChart3, CalendarCheck,
  CheckCircle2, Flame, Layers, ChevronsUpDown, Building2, GitCompare
} from 'lucide-react';
import { AppUser } from '../types';
import { HaraLogo } from './HaraLogo';

export type WorkspaceMode = 'onboarding' | 'operasional' | 'komparasi';

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
  | 'perbandingan-training-operasional'
  | 'master'
  | 'users'
  | 'settings'
  | 'bantuan'
  // Sub-views & specific workflows
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
      'dashboard', 'analitik-radar', 'kurikulum-onboarding', 'monitoring-training',
      'jobdesk-trainer', 'penugasan-trainer', 'jadwal-kunjungan', 'budaya-hara',
      'stasiun-kerja', 'bank-sop-soal', 'evaluasi-kompetensi', 'supervisi-lapangan',
      'tna-rencana', 'laporan-resmi', 'master', 'users', 'settings', 'bantuan',
      'operasional-sop', 'ojt-30hari', 'evaluasi-kru', 'laporan-eksekutif',
      'laporan-diagnostik', 'observasi', 'coaching', 'keluhan', 'talent',
      'penilaian-teori', 'penilaian-praktik', 'penilaian-lisan', 'kompetensi',
      'bank-sop', 'bank-soal', 'tna', 'gap', 'rencana', 'laporan', 'perbandingan-training-operasional'
    ],
    defaultTab: 'dashboard',
    badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  },
  'Trainer': {
    label: 'Lead Trainer & People Dev',
    allowedTabs: [
      'dashboard', 'analitik-radar', 'kurikulum-onboarding', 'monitoring-training',
      'jobdesk-trainer', 'penugasan-trainer', 'jadwal-kunjungan', 'budaya-hara',
      'stasiun-kerja', 'bank-sop-soal', 'evaluasi-kompetensi', 'supervisi-lapangan',
      'tna-rencana', 'laporan-resmi', 'master', 'bantuan',
      'operasional-sop', 'ojt-30hari', 'evaluasi-kru', 'laporan-eksekutif',
      'laporan-diagnostik', 'penilaian-teori', 'penilaian-praktik',
      'penilaian-lisan', 'kompetensi', 'bank-sop', 'bank-soal', 'observasi', 'coaching',
      'tna', 'gap', 'rencana', 'laporan', 'perbandingan-training-operasional'
    ],
    defaultTab: 'dashboard',
    badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  },
  'RnD': {
    label: 'Research & Development (RnD)',
    allowedTabs: [
      'dashboard', 'analitik-radar', 'stasiun-kerja', 'kurikulum-onboarding',
      'monitoring-training', 'budaya-hara', 'bank-sop-soal', 'evaluasi-kompetensi',
      'supervisi-lapangan', 'tna-rencana', 'laporan-resmi', 'master', 'bantuan',
      'operasional-sop', 'ojt-30hari', 'evaluasi-kru', 'laporan-eksekutif',
      'laporan-diagnostik', 'penilaian-teori', 'penilaian-praktik',
      'penilaian-lisan', 'kompetensi', 'bank-sop', 'bank-soal', 'observasi', 'coaching',
      'tna', 'gap', 'rencana', 'laporan', 'perbandingan-training-operasional'
    ],
    defaultTab: 'dashboard',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  'Kepala Outlet': {
    label: 'Kepala Outlet (Store Manager)',
    allowedTabs: [
      'dashboard', 'monitoring-training', 'budaya-hara', 'stasiun-kerja',
      'bank-sop-soal', 'evaluasi-kompetensi', 'supervisi-lapangan', 'jadwal-kunjungan',
      'laporan-resmi', 'master', 'bantuan',
      'kurikulum-onboarding', 'ojt-30hari', 'laporan-eksekutif',
      'observasi', 'keluhan', 'bank-sop', 'laporan', 'perbandingan-training-operasional'
    ],
    defaultTab: 'dashboard',
    badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  },
  'Area Supervisor': {
    label: 'Area Supervisor (Pengawas Wilayah)',
    allowedTabs: [
      'dashboard', 'analitik-radar', 'kurikulum-onboarding', 'monitoring-training',
      'penugasan-trainer', 'jadwal-kunjungan', 'budaya-hara', 'stasiun-kerja',
      'bank-sop-soal', 'evaluasi-kompetensi', 'supervisi-lapangan', 'tna-rencana',
      'laporan-resmi', 'master', 'bantuan',
      'ojt-30hari', 'evaluasi-kru', 'laporan-eksekutif',
      'laporan-diagnostik', 'observasi', 'tna', 'gap', 'keluhan',
      'kompetensi', 'laporan', 'bank-sop', 'perbandingan-training-operasional'
    ],
    defaultTab: 'dashboard',
    badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  },
  'SPV Rekrutmen': {
    label: 'SPV Rekrutmen & Talent Acquisition',
    allowedTabs: [
      'dashboard', 'kurikulum-onboarding', 'monitoring-training', 'budaya-hara',
      'stasiun-kerja', 'bank-sop-soal', 'evaluasi-kompetensi', 'supervisi-lapangan',
      'laporan-resmi', 'master', 'bantuan',
      'ojt-30hari', 'laporan-eksekutif', 'talent', 'bank-sop', 'laporan', 'perbandingan-training-operasional'
    ],
    defaultTab: 'dashboard',
    badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-200',
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
  workspaceMode?: WorkspaceMode;
  onSelectWorkspaceMode?: (mode: WorkspaceMode) => void;
  onOpenAICoach?: () => void;
  onOpenPublicExam?: () => void;
  onOpenCommandPalette?: () => void;
  onLogout?: () => void;
}

interface NavGroup {
  label: string;
  category?: 'all' | 'onboarding' | 'operasional';
  items: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[];
}

// Standarisasi Nomenklatur Menu Sesuai SOP Resmi Hara Chicken F&B
const GROUPS: NavGroup[] = [
  {
    label: 'Operasional Utama',
    category: 'all',
    items: [
      { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Mode Onboarding (TC)',
    category: 'onboarding',
    items: [
      { id: 'kurikulum-onboarding', label: 'Praktik & Batch Onboarding', icon: GraduationCap },
      { id: 'monitoring-training', label: 'Monitoring Training Kru', icon: Users },
      { id: 'budaya-hara', label: 'Nilai & Budaya Hara', icon: Flame },
      { id: 'stasiun-kerja', label: 'Stasiun Kerja Kitchen & Service', icon: UtensilsCrossed },
    ],
  },
  {
    label: 'Mode Outlet Pendampingan',
    category: 'operasional',
    items: [
      { id: 'supervisi-lapangan', label: 'Supervisi & Audit Shift', icon: Store },
      { id: 'jadwal-kunjungan', label: 'Jadwal Kunjungan Outlet', icon: CalendarCheck },
    ],
  },
  {
    label: 'Standar SOP & Bank Soal',
    category: 'all',
    items: [
      { id: 'bank-sop-soal', label: 'Standar SOP & Bank Soal', icon: BookOpen },
      { id: 'evaluasi-kompetensi', label: 'Evaluasi & Ujian Kompetensi', icon: Target },
    ],
  },
  {
    label: 'Laporan & Analitik',
    category: 'all',
    items: [
      { id: 'perbandingan-training-operasional', label: 'Komparasi Training vs Ops', icon: GitCompare },
      { id: 'laporan-resmi', label: 'Rapor Kru & Cetak Laporan', icon: FileCheck },
      { id: 'analitik-radar', label: 'Radar Kompetensi 4 Divisi', icon: BarChart3 },
    ],
  },
  {
    label: 'Master & Pengaturan',
    category: 'all',
    items: [
      { id: 'master', label: 'Master Outlet & Kru Cabang', icon: Building2 },
      { id: 'settings', label: 'Pengaturan & Sinkronisasi Cloud', icon: Settings },
      { id: 'users', label: 'Manajemen Akun Pengguna', icon: Shield },
      { id: 'bantuan', label: 'Panduan Sistem & SOP', icon: HelpCircle },
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
  workspaceMode = 'onboarding',
  onSelectWorkspaceMode,
  onOpenAICoach,
  onOpenPublicExam,
  onOpenCommandPalette,
  onLogout,
}) => {
  const userRole = currentUser?.role || 'Trainer';
  const roleConfig = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['Trainer'];
  const allowedTabs = roleConfig.allowedTabs;

  // Fokus pada training: arsipkan grup operasional dan komparasi
  const authorizedGroups = GROUPS.filter((group) => group.category !== 'operasional').map((group) => {
    return {
      ...group,
      items: group.items.filter((item) => {
        if (item.id === 'perbandingan-training-operasional') return false; // diarsipkan sementara
        return allowedTabs.includes(item.id);
      }),
    };
  }).filter((group) => group.items.length > 0);

  // User initials
  const initials = currentUser?.nama
    ? currentUser.nama.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'HA';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-white/95 backdrop-blur-md text-slate-800 flex flex-col z-50 transition-all duration-200 border-r border-slate-200/80 shrink-0 select-none ${
          collapsed ? 'w-[76px]' : 'w-[260px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Header with Preserved Official Logo */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 h-16 shrink-0 bg-white/50">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <HaraLogo variant="icon" size={collapsed ? 'xs' : 'sm'} />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black font-['Outfit'] text-[#0F172A] tracking-wider leading-none uppercase">
                  HARA <span className="text-[#96171B]">CHICKEN</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1">
                  Trainer & Operations
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl items-center justify-center transition-colors cursor-pointer"
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Workspace Switcher diarsipkan sementara: fokus pada Program Training Onboarding */}

        {/* Quick Search Shortcut */}
        {!collapsed && onOpenCommandPalette && (
          <div className="px-3.5 pt-1 pb-1 shrink-0">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 text-xs">
                <Search size={13} className="text-slate-400" />
                <span>Cari menu SOP...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white text-slate-400 rounded-full border border-slate-200">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Navigation List - Modern Rounded-xl Pills */}
        <nav className="flex-1 overflow-y-auto px-3 py-2.5 space-y-3.5">
          {authorizedGroups.map((group) => (
            <div key={group.label} className="space-y-0.5">
              {!collapsed && (
                <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 tracking-wider uppercase">
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
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer relative ${
                        active
                          ? 'bg-red-50 text-[#96171B] font-bold border border-red-200/70 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                      } ${collapsed ? 'justify-center px-2' : ''}`}
                    >
                      {/* Crimson Dot Indicator for Active Item */}
                      {active && (
                        <div className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-[#96171B] rounded-full" />
                      )}
                      <Icon
                        size={16}
                        className={`shrink-0 transition-colors ${
                          active
                            ? 'text-[#96171B] stroke-[2.2]'
                            : 'text-slate-400'
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate flex-1 min-w-0">
                          {item.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Portal Ujian Kru Access */}
          {onOpenPublicExam && (
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={onOpenPublicExam}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-[#96171B] transition-colors cursor-pointer ${
                  collapsed ? 'justify-center px-2' : ''
                }`}
                title="Buka Portal Ujian Kru Mandiri"
              >
                <Brain size={15} className="text-[#96171B] shrink-0" />
                {!collapsed && <span className="truncate">Portal Ujian Kru Mandiri</span>}
              </button>
            </div>
          )}
        </nav>

        {/* User Profile Card at Bottom */}
        <div className="p-3 border-t border-slate-100 bg-white/50 shrink-0">
          <div
            className={`p-2 rounded-2xl bg-slate-50 border border-slate-200 flex items-center ${
              collapsed ? 'justify-center' : 'justify-between'
            } gap-2 transition-colors shadow-2xs`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {initials}
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold font-['Outfit'] text-slate-900 truncate">
                    {currentUser.nama || 'Trainer'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentUser.role}
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => onSelectTab('settings')}
                  className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                  title="Pengaturan Akun & Cloud"
                >
                  <Settings size={14} />
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
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
