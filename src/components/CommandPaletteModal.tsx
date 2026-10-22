import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, X, LayoutDashboard, Store, Users, Calendar,
  Eye, MessageSquare, BarChart2, AlertCircle, Award,
  BookOpen, FileCheck, Brain, Wrench, Mic, Shield,
  FileText, Settings, HelpCircle, ArrowRight, Sparkles,
  Download, Database, Building2, User, Flame, CheckCircle2,
  ExternalLink, Sliders
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { db } from '../lib/storage';
import { Outlet, Kru, BankSOP } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenAICoach: () => void;
}

interface CommandItem {
  id: string;
  tab?: NavTab;
  action?: () => void;
  title: string;
  subtitle?: string;
  category: 'Navigasi' | 'Operasional' | 'Pelatihan' | 'Evaluasi' | 'Kru' | 'Outlet' | 'SOP' | 'Aksi Cepat' | 'AI Assistant';
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenAICoach,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Live database entities
  const outlets = useMemo(() => (isOpen ? db.getTable<Outlet>('outlets') : []), [isOpen]);
  const krus = useMemo(() => (isOpen ? db.getTable<Kru>('kru') : []), [isOpen]);
  const sops = useMemo(() => (isOpen ? db.getTable<BankSOP>('bank_sop') : []), [isOpen]);

  const baseCommands: CommandItem[] = useMemo(() => {
    return [
      { id: 'tab-1', tab: 'dashboard', title: 'Dashboard Executive', subtitle: 'Ringkasan performa & KPI 3-pilar', category: 'Navigasi', icon: LayoutDashboard },
      { id: 'tab-kurikulum', tab: 'kurikulum-onboarding', title: 'Kurikulum & Roadmap (3 Hari Onboarding)', subtitle: 'Batch onboarding, silabus 3 hari, absensi & radar kelulusan', category: 'Pelatihan', icon: Award, badge: '3 Hari' },
      { id: 'tab-ojt', tab: 'monitoring-training', title: 'Monitoring Training OJT (H1 - H30)', subtitle: 'Evaluasi 4 Gate, checklist harian & simulasi RnD Batch 1-2', category: 'Pelatihan', icon: Calendar, badge: 'H1-30' },
      { id: 'tab-jobdesk', tab: 'jobdesk-trainer', title: 'Pusat Panduan & Jobdesk Trainer Lapangan', subtitle: '15 tugas spesifik, wewenang pembinaan & checklist lapangan', category: 'Navigasi', icon: Award, badge: 'Jobdesk' },
      { id: 'tab-budaya', tab: 'budaya-hara', title: 'Budaya & 12 Perilaku Utama H.A.R.A', subtitle: 'Nilai Halal, Amanah, Responsif, Adaptif & ikrar komitmen', category: 'Operasional', icon: Award, badge: 'Budaya' },
      { id: 'tab-stasiun', tab: 'stasiun-kerja', title: '4 Stasiun Kerja & Tools Dapur Operasional', subtitle: 'Kitchen, Helper, Geprek, Kasir, timer holding & suhu 160°C', category: 'Operasional', icon: Wrench, badge: 'Dapur' },
      { id: 'tab-trainer', tab: 'penugasan-trainer', title: 'Penugasan & Dampingan Trainer Cabang', subtitle: 'Input trainee outlet & buat laporan perbantuan lapangan', category: 'Operasional', icon: Award },
      { id: 'tab-jadwal', tab: 'jadwal-kunjungan', title: 'Kalender Jadwal Kunjungan Gerai', subtitle: 'Agenda rute trainer, logbook kunjungan & audit shift', category: 'Operasional', icon: Calendar },
      { id: 'tab-radar', tab: 'analitik-radar', title: 'Radar Kompetensi & Diagnostik Mutu Cabang', subtitle: 'Analisis komparatif gerai & benchmark kurva Gauss', category: 'Evaluasi', icon: BarChart2, badge: 'Radar' },
      { id: 'tab-2', tab: 'master', title: 'Master Outlet & Personil Kru', subtitle: 'Database gerai dan anggota tim', category: 'Operasional', icon: Store },
      { id: 'tab-3', tab: 'tna', title: 'TNA (Training Need Analysis)', subtitle: 'Pencatatan gap operasional', category: 'Operasional', icon: Search },
      { id: 'tab-4', tab: 'rencana', title: 'Jadwal & Rencana Pelatihan Shift', subtitle: 'Agenda pelatihan berkala gerai', category: 'Operasional', icon: Calendar },
      { id: 'tab-5', tab: 'observasi', title: 'Audit Observasi Lapangan (5S)', subtitle: 'Inspeksi suhu fryer 160°C & holding time', category: 'Operasional', icon: Eye },
      { id: 'tab-6', tab: 'coaching', title: 'Coaching Log (GROW Model)', subtitle: 'Bimbingan 1-on-1 personil kru', category: 'Operasional', icon: MessageSquare },
      { id: 'tab-7', tab: 'gap', title: 'Gap Analysis Matrix', subtitle: 'Matriks kesenjangan kompetensi', category: 'Operasional', icon: BarChart2 },
      { id: 'tab-8', tab: 'keluhan', title: 'Kartu Keluhan Pelanggan', subtitle: 'Penanganan komplain rasa & servis RCA', category: 'Operasional', icon: AlertCircle },
      { id: 'tab-9', tab: 'talent', title: 'Talent Tracker & Promosi', subtitle: 'Jalur karir & suksesi kru unggulan', category: 'Operasional', icon: Award },
      { id: 'tab-10', tab: 'bank-sop', title: 'Bank SOP Resmi Hara Chicken', subtitle: 'Koleksi instruksi kerja baku 4 divisi', category: 'Pelatihan', icon: BookOpen },
      { id: 'tab-11', tab: 'bank-soal', title: 'Bank Soal Uji Kompetensi', subtitle: 'Pilihan ganda kognitif & HOTS', category: 'Pelatihan', icon: FileCheck },
      { id: 'tab-12', tab: 'penilaian-teori', title: 'Pilar 1: Uji Teori SOP & HOTS (20%)', subtitle: 'Kuis kognitif standar kerja baku', category: 'Evaluasi', icon: Brain },
      { id: 'tab-13', tab: 'penilaian-praktik', title: 'Pilar 2: Uji Praktik & SOS (40%)', subtitle: 'Rubrik stopwatch, suhu 160°C & gramasi', category: 'Evaluasi', icon: Wrench },
      { id: 'tab-14', tab: 'penilaian-lisan', title: 'Pilar 3: Uji Lisan & HACCP (15%)', subtitle: 'Nalar food safety & why behind SOP', category: 'Evaluasi', icon: Mic },
      { id: 'tab-14b', tab: 'evaluasi-kompetensi', title: 'Pilar 4: Sikap Budaya H.A.R.A (25%)', subtitle: '12 Perilaku Utama Halal, Amanah, Responsif, Adaptif', category: 'Evaluasi', icon: Award },
      { id: 'tab-15', tab: 'kompetensi', title: 'Matriks 360° & Kurva Gauss', subtitle: 'Triangulasi 4 pilar, psikometri & sertifikat', category: 'Evaluasi', icon: Shield },
      { id: 'tab-16', tab: 'laporan-resmi', title: 'Pusat Rapor Resmi & PDF Generator', subtitle: 'Dossier eksekutif & sertifikat kru resmi', category: 'Navigasi', icon: FileText, badge: 'PDF' },
      { id: 'tab-17', tab: 'settings', title: 'Pusat Sistem, Ekspor & Backup', subtitle: 'Pengaturan bobot, CSV & JSON', category: 'Navigasi', icon: Settings },
      {
        id: 'action-ai',
        action: () => {
          onClose();
          onOpenAICoach();
        },
        title: 'Tanya AI Trainer Advisor',
        subtitle: 'Konsultasikan panduan lapangan, audit stasiun, atau materi SOP',
        category: 'AI Assistant',
        icon: Sparkles,
        badge: 'Gemini AI',
      },
      {
        id: 'action-backup',
        action: () => {
          onClose();
          onSelectTab('settings');
        },
        title: 'Ekspor Cadangan Database Penuh (.JSON)',
        subtitle: 'Download seluruh data lokal 14 tabel',
        category: 'Aksi Cepat',
        icon: Database,
        badge: 'Backup',
      },
    ];
  }, [onClose, onOpenAICoach, onSelectTab]);

  // Combine static commands with dynamic entities
  const allCommands = useMemo(() => {
    const dynamicCommands: CommandItem[] = [];

    // Outlets
    for (const o of outlets) {
      dynamicCommands.push({
        id: `outlet-${o.id}`,
        tab: 'master',
        title: `${o.nama_outlet} (${o.kode_outlet})`,
        subtitle: `Kepala Gerai: ${o.kepala_outlet} · ${o.kota}`,
        category: 'Outlet',
        icon: Building2,
        badge: 'Gerai',
      });
    }

    // Kru
    for (const k of krus) {
      dynamicCommands.push({
        id: `kru-${k.id}`,
        tab: 'kompetensi',
        title: `${k.nama_kru} (${k.nik})`,
        subtitle: `Divisi: ${k.divisi} · Outlet: ${k.kode_outlet} · Status: ${k.status_aktif}`,
        category: 'Kru',
        icon: User,
        badge: k.divisi,
      });
    }

    // SOPs
    for (const s of sops) {
      dynamicCommands.push({
        id: `sop-${s.id}`,
        tab: 'bank-sop',
        title: `${s.kode_sop}: ${s.judul_sop}`,
        subtitle: `Divisi: ${s.divisi || s.kategori} · Durasi: ${s.standar_waktu || '5-10 menit'}`,
        category: 'SOP',
        icon: BookOpen,
        badge: 'SOP',
      });
    }

    return [...baseCommands, ...dynamicCommands];
  }, [baseCommands, outlets, krus, sops]);

  // Filter commands by search query
  const filtered = useMemo(() => {
    if (!query.trim()) return baseCommands;
    const q = query.toLowerCase();
    return allCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
    );
  }, [allCommands, baseCommands, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if (isOpen && filtered.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % filtered.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const target = filtered[selectedIndex];
          if (target) {
            executeCommand(target);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filtered, selectedIndex]);

  const executeCommand = (item: CommandItem) => {
    if (item.action) {
      item.action();
    } else if (item.tab) {
      onSelectTab(item.tab);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-start justify-center pt-16 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-[#E8DFD3] flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E8DFD3] flex items-center gap-3 bg-[#FCFAF7]">
          <Search className="text-[#A21D21] shrink-0" size={18} />
          <input
            type="text"
            placeholder="Cari modul, kru, outlet, SOP, kuis, atau ketik aksi cepat..."
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#1F1813] outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="overflow-y-auto p-2 divide-y divide-slate-100 flex-1"
        >
          {filtered.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Search size={28} className="text-slate-300 mx-auto" />
              <div className="text-xs font-bold text-slate-600">
                Tidak ada data atau perintah yang cocok dengan "{query}".
              </div>
              <p className="text-[11px] text-slate-400">
                Coba cari dengan kata kunci lain seperti nama kru, divisi, atau nomor SOP.
              </p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => executeCommand(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#8C161B] text-white shadow-md'
                      : 'hover:bg-slate-50 text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-white/20 border-white/30 text-white'
                          : 'bg-[#F8F5F0] border-[#E8DFD3] text-[#A21D21]'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="truncate">
                      <div
                        className={`text-xs font-black truncate ${
                          isSelected ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div
                          className={`text-[10px] font-medium truncate ${
                            isSelected ? 'text-white/80' : 'text-slate-500'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {item.badge || item.category}
                    </span>
                    <ArrowRight
                      size={14}
                      className={isSelected ? 'text-white' : 'text-slate-300'}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Keyboard Hint Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10.5px] text-slate-500 font-bold">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-700 shadow-2xs">
                ↑
              </kbd>
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-700 shadow-2xs">
                ↓
              </kbd>
              <span>Navigasi</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-slate-700 shadow-2xs">
                ↵
              </kbd>
              <span>Pilih</span>
            </span>
          </div>
          <span className="text-[#8C161B]">HARA TRAINER Fast Lookup</span>
        </div>
      </div>
    </div>
  );
};
