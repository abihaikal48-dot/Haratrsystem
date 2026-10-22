import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Store,
  BookOpen,
  FileCheck,
  Menu
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenMenu,
}) => {
  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'kurikulum-onboarding',
      label: 'Kurikulum',
      icon: GraduationCap,
    },
    {
      id: 'supervisi-lapangan',
      label: 'Supervisi',
      icon: Store,
    },
    {
      id: 'bank-sop-soal',
      label: 'Standar SOP',
      icon: BookOpen,
    },
    {
      id: 'laporan-resmi',
      label: 'Rapor Kru',
      icon: FileCheck,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Operasional Gerai"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-[0_-1px_3px_rgba(0,0,0,0.03)] px-2 sm:px-4 py-1.5 transition-all select-none print:hidden"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentTab === item.id ||
            (item.id === 'kurikulum-onboarding' &&
              ['kurikulum-onboarding', 'monitoring-training', 'budaya-hara', 'stasiun-kerja'].includes(currentTab)) ||
            (item.id === 'supervisi-lapangan' &&
              ['supervisi-lapangan', 'jadwal-kunjungan', 'observasi'].includes(currentTab)) ||
            (item.id === 'bank-sop-soal' &&
              ['bank-sop-soal', 'bank-sop', 'bank-soal', 'evaluasi-kompetensi'].includes(currentTab)) ||
            (item.id === 'laporan-resmi' &&
              ['laporan-resmi', 'analitik-radar', 'laporan-diagnostik', 'laporan-eksekutif'].includes(currentTab));

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-lg text-[10.5px] font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'text-[#96171B] font-bold'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              {/* Minimalist Top Indicator on Active Tab */}
              {isActive && (
                <span className="absolute -top-1.5 inset-x-3 h-0.5 bg-[#96171B] rounded-full" />
              )}
              <Icon
                size={18}
                className={`mb-0.5 transition-transform duration-150 ${
                  isActive ? 'scale-105 stroke-[2.25]' : 'stroke-[1.75]'
                }`}
              />
              <span className="truncate max-w-[68px] leading-tight tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* More / Full Menu Drawer Trigger */}
        <button
          onClick={onOpenMenu}
          className="relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-lg text-[10.5px] font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-150 cursor-pointer"
          title="Buka Menu Lengkap & Pengaturan"
        >
          <Menu size={18} className="mb-0.5 stroke-[1.75]" />
          <span className="truncate max-w-[68px] leading-tight tracking-tight">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};
