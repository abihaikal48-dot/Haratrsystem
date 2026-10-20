import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab, ROLE_PERMISSIONS } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CrudSection, FieldDef, ColumnDef } from './components/CrudSection';
import { KompetensiView } from './components/KompetensiView';
import { PenilaianTeoriView } from './components/PenilaianTeoriView';
import { PenilaianPraktikView } from './components/PenilaianPraktikView';
import { PenilaianLisanView } from './components/PenilaianLisanView';
import { LaporanView } from './components/LaporanView';
import { UserManagementView } from './components/UserManagementView';
import { SettingsView } from './components/SettingsView';
import { BantuanView } from './components/BantuanView';
import { OperasionalLapanganView, OperasionalSubTab } from './components/OperasionalLapanganView';
import { PelatihanEvaluasiView, PelatihanSubTab } from './components/PelatihanEvaluasiView';
import { SistemDanEksporView } from './components/SistemDanEksporView';
import { PenugasanTrainerView } from './components/PenugasanTrainerView';
import { TrainerJobdeskView } from './components/TrainerJobdeskView';
import { KurikulumRoadmapView } from './components/KurikulumRoadmapView';
import { JadwalKunjunganView } from './components/JadwalKunjunganView';
import { AICoachModal } from './components/AICoachModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { AIActionModal, AIActionModalData, AIActionType } from './components/AIActionModal';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { OnlinePresenceModal } from './components/OnlinePresenceModal';
import { LoginPage } from './components/LoginPage';
import { UjianKruPublicView } from './components/UjianKruPublicView';
import { PageHeaderBanner } from './components/PageHeaderBanner';
import { SessionLockOverlay } from './components/SessionLockOverlay';
import { HaraCultureView } from './components/culture/HaraCultureView';
import { StationWorkspaceView } from './components/stations/StationWorkspaceView';
import { AnalitikRadarView } from './components/analytics/AnalitikRadarView';
import { LaporanDiagnostikView } from './components/reports/LaporanDiagnostikView';
import { UnifiedLaporanEksekutifView } from './components/reports/UnifiedLaporanEksekutifView';
import { UnifiedTrainingOJTView } from './components/trainer/UnifiedTrainingOJTView';
import { db } from './lib/storage';
import {
  seedFirestoreIfEmpty,
  setupFirestoreRealtimeSync,
  startPresenceTracking,
  subscribeToOnlineUsers,
  ActiveUserPresence
} from './lib/firestoreSync';
import { testFirestoreConnection } from './lib/firebase';
import { AppUser, Outlet, Kru, BankSOP, Division } from './types';
import {
  Sparkles, Calendar, Store, Users, BookOpen, Search,
  Eye, MessageSquare, BarChart3, AlertTriangle, Award, FileText, CheckCircle2,
  LayoutDashboard, CalendarCheck, UtensilsCrossed, FileCheck
} from 'lucide-react';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => db.isLoggedIn());
  const [publicMode, setPublicMode] = useState<'login' | 'public_ujian'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#ujian') {
      return 'public_ujian';
    }
    return db.isLoggedIn() ? 'login' : 'login';
  });
  const [directExamParams, setDirectExamParams] = useState<{
    outletCode: string;
    namaKru: string;
    divisi: 'Semua' | Division;
  } | null>(null);

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AppUser>(db.getCurrentUser());
  const [selectedOutletCode, setSelectedOutletCode] = useState<string>('ALL');
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [sopList, setSopList] = useState<BankSOP[]>([]);

  // Modals
  const [aiCoachOpen, setAiCoachOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [googleWorkspaceOpen, setGoogleWorkspaceOpen] = useState(false);
  const [presenceModalOpen, setPresenceModalOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<ActiveUserPresence[]>([]);
  const [aiActionData, setAiActionData] = useState<AIActionModalData | null>(null);
  const [globalToast, setGlobalToast] = useState<string | null>(null);
  const [isSessionLocked, setIsSessionLocked] = useState<boolean>(false);

  // Master tab sub-view ('outlets' | 'kru')
  const [masterSubTab, setMasterSubTab] = useState<'outlets' | 'kru'>('outlets');

  const showToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(null), 3500);
  };

  const refreshAppData = () => {
    const latestUser = db.getCurrentUser();
    setCurrentUser((prev) => {
      if (
        prev &&
        latestUser &&
        prev.id === latestUser.id &&
        prev.role === latestUser.role &&
        prev.nama === latestUser.nama &&
        prev.email === latestUser.email
      ) {
        return prev;
      }
      return latestUser;
    });
    setOutlets(db.getTable<Outlet>('outlets'));
    setSopList(db.getTable<BankSOP>('bank_sop'));
  };

  useEffect(() => {
    refreshAppData();
    const unsub = db.subscribe('*', refreshAppData);

    // Test connection and seed Firestore collections
    testFirestoreConnection();
    seedFirestoreIfEmpty();
    const unsubFirestore = setupFirestoreRealtimeSync();

    // Subscribe to online users
    const unsubPresence = subscribeToOnlineUsers((users) => {
      setOnlineUsers(users);
    });

    const handleHashChange = () => {
      if (window.location.hash === '#ujian') {
        setPublicMode('public_ujian');
      } else if (window.location.hash === '#login') {
        setPublicMode('login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      unsub();
      unsubFirestore();
      unsubPresence();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Dedicated effect for presence heartbeat tracking with primitive dependencies
  useEffect(() => {
    const cleanup = startPresenceTracking(currentUser, currentTab);
    return () => {
      if (cleanup) cleanup();
    };
  }, [currentUser?.id, currentUser?.nama, currentUser?.role, currentTab]);

  // Role-Based Access Control: Route Guard
  useEffect(() => {
    if (!isAuthenticated) return;
    const userRole = currentUser?.role || 'Trainer';
    const roleConfig = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS['Trainer'];
    if (!roleConfig.allowedTabs.includes(currentTab)) {
      setCurrentTab(roleConfig.defaultTab);
    }
  }, [currentUser?.role, currentTab, isAuthenticated]);

  const navigateToUjian = () => {
    setPublicMode('public_ujian');
    window.location.hash = '#ujian';
  };

  const navigateToLoginOrDashboard = () => {
    setPublicMode('login');
    window.location.hash = isAuthenticated ? '' : '#login';
  };

  const outletOptions = ['ALL', ...outlets.map((o) => o.kode_outlet)];
  const outletCodeOnly = outlets.map((o) => o.kode_outlet);

  const handleOpenAIAction = (type: AIActionType, row: any, title: string) => {
    setAiActionData({
      type,
      row,
      title,
    });
  };

  // Field & Column Definitions for all CRUD modules
  // 1. OUTLETS
  const outletCols: ColumnDef[] = [
    { key: 'kode_outlet', label: 'Kode' },
    { key: 'nama_outlet', label: 'Nama Outlet' },
    { key: 'alamat', label: 'Alamat' },
    { key: 'kepala_outlet', label: 'Kepala Outlet' },
    { key: 'area_supervisor', label: 'Area SPV' },
    { key: 'status_aktif', label: 'Status' },
  ];
  const outletFields: FieldDef[] = [
    { name: 'kode_outlet', label: 'Kode Outlet', type: 'text', required: true, placeholder: 'HC-XYZ01' },
    { name: 'nama_outlet', label: 'Nama Outlet', type: 'text', required: true, placeholder: 'Hara Chicken Cabang...' },
    { name: 'alamat', label: 'Alamat Lengkap', type: 'textarea', required: true },
    { name: 'kepala_outlet', label: 'Nama Kepala Outlet', type: 'text', required: true },
    { name: 'area_supervisor', label: 'Area Supervisor', type: 'text', required: true },
    { name: 'status_aktif', label: 'Status Aktif', type: 'select', options: ['Aktif', 'Nonaktif'] },
  ];

  // 2. KRU
  const kruCols: ColumnDef[] = [
    { key: 'nama_kru', label: 'Nama Kru' },
    { key: 'jabatan', label: 'Jabatan / Posisi' },
    { key: 'divisi', label: 'Divisi' },
    { key: 'kode_outlet', label: 'Outlet' },
    { key: 'tanggal_masuk', label: 'Tanggal Masuk' },
    { key: 'catatan', label: 'Catatan Spesialisasi' },
    { key: 'status_aktif', label: 'Status' },
  ];
  const kruFields: FieldDef[] = [
    { name: 'nama_kru', label: 'Nama Lengkap Kru', type: 'text', required: true },
    { name: 'jabatan', label: 'Jabatan / Posisi Kerja', type: 'text', placeholder: 'Contoh: Crew Kitchen / Senior Cook / Kasir Utama / Shift Leader / Trainee OJT', defaultValue: 'Crew' },
    { name: 'divisi', label: 'Divisi Operasional', type: 'select', options: ['Kitchen', 'Helper', 'Geprek', 'Kasir'] },
    { name: 'kode_outlet', label: 'Kode Outlet Penempatan', type: 'select', options: outletCodeOnly },
    { name: 'tanggal_masuk', label: 'Tanggal Masuk Kerja', type: 'date', required: true },
    { name: 'catatan', label: 'Catatan / Potensi', type: 'textarea', placeholder: 'Keahlian atau area fokus...' },
    { name: 'status_aktif', label: 'Status Aktif', type: 'select', options: ['Aktif', 'Nonaktif'] },
  ];

  // 3. TNA
  const tnaCols: ColumnDef[] = [
    { key: 'tanggal', label: 'Tanggal' },
    { key: 'kode_outlet', label: 'Outlet' },
    { key: 'divisi', label: 'Divisi' },
    { key: 'deskripsi_gap', label: 'Temuan Gap Kompetensi' },
    { key: 'jenis_gap', label: 'Jenis Gap' },
    { key: 'prioritas', label: 'Prioritas' },
    { key: 'rencana_tindak_lanjut', label: 'Rencana Tindak Lanjut' },
    { key: 'status', label: 'Status' },
  ];
  const tnaFields: FieldDef[] = [
    { name: 'tanggal', label: 'Tanggal Temuan', type: 'date', required: true },
    { name: 'kode_outlet', label: 'Outlet', type: 'select', options: outletCodeOnly },
    { name: 'divisi', label: 'Divisi Terkait', type: 'select', options: ['Kitchen', 'Helper', 'Geprek', 'Kasir'] },
    { name: 'sumber_temuan', label: 'Sumber Temuan', type: 'text', placeholder: 'Contoh: Audit Trainer / Mystery Shopper' },
    { name: 'deskripsi_gap', label: 'Deskripsi Gap / Masalah', type: 'textarea', required: true },
    { name: 'jenis_gap', label: 'Jenis Gap', type: 'select', options: ['Pengetahuan', 'Keterampilan', 'Sikap/Konsistensi'] },
    { name: 'prioritas', label: 'Prioritas Masalah', type: 'select', options: ['Tinggi', 'Sedang', 'Rendah'] },
    { name: 'rencana_tindak_lanjut', label: 'Rencana Tindak Lanjut Training', type: 'textarea', required: true },
    { name: 'status', label: 'Status Penanganan', type: 'select', options: ['Belum', 'Proses', 'Selesai'] },
  ];

  // 4. RENCANA TRAINING
  const rencanaCols: ColumnDef[] = [
    { key: 'tanggal_pelaksanaan', label: 'Jadwal' },
    { key: 'kode_outlet', label: 'Outlet' },
    { key: 'topik', label: 'Topik Pelatihan' },
    { key: 'peserta', label: 'Sasaran Peserta' },
    { key: 'metode', label: 'Metode' },
    { key: 'durasi', label: 'Durasi' },
    { key: 'fasilitator', label: 'Trainer / PIC' },
    { key: 'status', label: 'Status' },
  ];
  const rencanaFields: FieldDef[] = [
    { name: 'tanggal_pelaksanaan', label: 'Tanggal Pelaksanaan', type: 'date', required: true },
    { name: 'kode_outlet', label: 'Outlet Target', type: 'select', options: outletCodeOnly },
    { name: 'topik', label: 'Topik Pelatihan', type: 'text', required: true },
    { name: 'tujuan_pembelajaran', label: 'Tujuan Pembelajaran', type: 'textarea', required: true },
    { name: 'peserta', label: 'Peserta Pelatihan', type: 'text', placeholder: 'Nama kru atau divisi...' },
    { name: 'metode', label: 'Metode Training', type: 'text', placeholder: 'Contoh: Demonstrasi Praktik Langsung' },
    { name: 'durasi', label: 'Durasi Pelatihan', type: 'text', placeholder: '90 Menit' },
    { name: 'alat_bantu', label: 'Alat Bantu / Bahan', type: 'text', placeholder: 'Termometer, Timer, SOP Sheet' },
    { name: 'fasilitator', label: 'Trainer Fasilitator', type: 'text', placeholder: 'Nama Trainer' },
    { name: 'status', label: 'Status', type: 'select', options: ['Direncanakan', 'Berjalan', 'Selesai', 'Dibatalkan'] },
  ];

  // 5. OBSERVASI LAPANGAN
  const obsCols: ColumnDef[] = [
    { key: 'tanggal_shift', label: 'Shift & Waktu' },
    { key: 'kode_outlet', label: 'Outlet' },
    { key: 'nama_kru', label: 'Kru Diamati' },
    { key: 'divisi', label: 'Divisi' },
    { key: 'standar_sop_diamati', label: 'Standar SOP' },
    { key: 'hasil', label: 'Hasil Observasi' },
    { key: 'catatan_detail', label: 'Catatan Lapangan' },
  ];
  const obsFields: FieldDef[] = [
    { name: 'tanggal_shift', label: 'Tanggal & Shift', type: 'text', required: true, placeholder: '15/08/2026 - Siang (Peak Hour)' },
    { name: 'kode_outlet', label: 'Outlet', type: 'select', options: outletCodeOnly },
    { name: 'nama_kru', label: 'Nama Kru', type: 'text', required: true },
    { name: 'divisi', label: 'Divisi', type: 'select', options: ['Kitchen', 'Helper', 'Geprek', 'Kasir'] },
    { name: 'standar_sop_diamati', label: 'Standar SOP Diamati', type: 'text', required: true },
    { name: 'hasil', label: 'Hasil Evaluasi', type: 'select', options: ['Sesuai Standar', 'Perlu Perbaikan', 'Kritis'] },
    { name: 'catatan_detail', label: 'Catatan Detail Temuan', type: 'textarea' },
    { name: 'rencana_follow_up', label: 'Rencana Tindak Lanjut', type: 'textarea' },
  ];

  // 6. COACHING LOG (GROW)
  const coachingCols: ColumnDef[] = [
    { key: 'tanggal', label: 'Tanggal' },
    { key: 'kode_outlet', label: 'Outlet' },
    { key: 'nama_kru', label: 'Kru Dicoach' },
    { key: 'goal', label: 'Goal (Tujuan)' },
    { key: 'options', label: 'Options (Pilihan)' },
    { key: 'will', label: 'Will (Komitmen)' },
    { key: 'hasil_follow_up', label: 'Follow Up' },
  ];
  const coachingFields: FieldDef[] = [
    { name: 'tanggal', label: 'Tanggal Sesi', type: 'date', required: true },
    { name: 'kode_outlet', label: 'Outlet', type: 'select', options: outletCodeOnly },
    { name: 'nama_kru', label: 'Nama Kru', type: 'text', required: true },
    { name: 'goal', label: 'Goal (Hasil yang ingin dicapai)', type: 'textarea', required: true },
    { name: 'reality', label: 'Reality (Kondisi saat ini / kendala)', type: 'textarea', required: true },
    { name: 'options', label: 'Options (Pilihan tindakan yang disepakati)', type: 'textarea', required: true },
    { name: 'will', label: 'Will (Komitmen spesifik kru)', type: 'textarea', required: true },
    { name: 'hasil_follow_up', label: 'Hasil Follow-Up / Evaluasi', type: 'textarea' },
  ];

  // 7. GAP ANALYSIS
  const gapCols: ColumnDef[] = [
    { key: 'nama_kru', label: 'Nama Kru' },
    { key: 'divisi', label: 'Divisi' },
    { key: 'kode_outlet', label: 'Outlet' },
    { key: 'kompetensi_dinilai', label: 'Kompetensi Dinilai' },
    { key: 'skor_standar', label: 'Standar' },
    { key: 'skor_aktual', label: 'Aktual' },
    { key: 'gap_score', label: 'Gap' },
    { key: 'rekomendasi', label: 'Rekomendasi' },
  ];
  const gapFields: FieldDef[] = [
    { name: 'nama_kru', label: 'Nama Kru', type: 'text', required: true },
    { name: 'divisi', label: 'Divisi', type: 'select', options: ['Kitchen', 'Helper', 'Geprek', 'Kasir'] },
    { name: 'kode_outlet', label: 'Outlet', type: 'select', options: outletCodeOnly },
    { name: 'kompetensi_dinilai', label: 'Kompetensi / SOP', type: 'text', required: true },
    { name: 'skor_standar', label: 'Skor Standar (Target)', type: 'number', defaultValue: 3, required: true },
    { name: 'skor_aktual', label: 'Skor Aktual Kru', type: 'number', defaultValue: 2, required: true },
    { name: 'rekomendasi', label: 'Rekomendasi Solusi', type: 'textarea', required: true },
  ];

  // 8. KARTU KELUHAN
  const keluhanCols: ColumnDef[] = [
    { key: 'tanggal_shift', label: 'Tanggal & Shift' },
    { key: 'kode_outlet', label: 'Outlet' },
    { key: 'tipe', label: 'Tipe Keluhan' },
    { key: 'deskripsi_keluhan', label: 'Isi Keluhan Pelanggan' },
    { key: 'nama_kru_terkait', label: 'Kru Terkait' },
    { key: 'tindakan_diambil', label: 'Tindakan Selesai' },
    { key: 'status', label: 'Status' },
  ];
  const keluhanFields: FieldDef[] = [
    { name: 'tanggal_shift', label: 'Tanggal & Shift Kejadian', type: 'text', required: true },
    { name: 'kode_outlet', label: 'Outlet', type: 'select', options: outletCodeOnly },
    { name: 'tipe', label: 'Kategori Keluhan', type: 'select', options: ['Produk/Rasa', 'Pelayanan/Kasir', 'Kebersihan', 'Kecepatan', 'Lainnya'] },
    { name: 'deskripsi_keluhan', label: 'Deskripsi Keluhan', type: 'textarea', required: true },
    { name: 'nama_kru_terkait', label: 'Kru Terkait (Jika ada)', type: 'text' },
    { name: 'tindakan_diambil', label: 'Tindakan Cepat Dilakukan', type: 'textarea', required: true },
    { name: 'status', label: 'Status Kasus', type: 'select', options: ['Dalam kajian', 'Selesai', 'Eskalasi'] },
    { name: 'tindak_lanjut_training', label: 'Tindak Lanjut Pelatihan', type: 'textarea' },
  ];

  // 9. TALENT TRACKER
  const talentCols: ColumnDef[] = [
    { key: 'nama_kandidat', label: 'Nama Kru' },
    { key: 'divisi', label: 'Divisi Asal' },
    { key: 'kode_outlet', label: 'Outlet' },
    { key: 'target_posisi', label: 'Target Posisi Promosi' },
    { key: 'tanggung_jawab_uji_coba', label: 'Proyek Uji Coba' },
    { key: 'progres_terkini', label: 'Progres Kesiapan' },
    { key: 'target_waktu_siap', label: 'Target Siap' },
  ];
  const talentFields: FieldDef[] = [
    { name: 'nama_kandidat', label: 'Nama Kandidat Kru', type: 'text', required: true },
    { name: 'divisi', label: 'Divisi Asal', type: 'select', options: ['Kitchen', 'Helper', 'Geprek', 'Kasir'] },
    { name: 'kode_outlet', label: 'Outlet', type: 'select', options: outletCodeOnly },
    { name: 'target_posisi', label: 'Target Posisi Promosi', type: 'text', required: true, placeholder: 'Contoh: Head Cook / Head Cashier' },
    { name: 'tanggung_jawab_uji_coba', label: 'Tanggung Jawab Penugasan', type: 'textarea', required: true },
    { name: 'progres_terkini', label: 'Progres / Evaluasi Terkini', type: 'text', required: true, placeholder: '80% - Sangat cakap...' },
    { name: 'target_waktu_siap', label: 'Target Waktu Siap Promosi', type: 'text', required: true, placeholder: 'Oktober 2026' },
  ];

  // 10. BANK SOP
  const sopCols: ColumnDef[] = [
    { key: 'kategori', label: 'Kategori' },
    { key: 'judul_sop', label: 'Judul Standar SOP' },
    { key: 'langkah', label: 'Langkah Operasional' },
    { key: 'sumber', label: 'Sumber Dokumen' },
    { key: 'status_aktif', label: 'Status' },
  ];
  const sopFields: FieldDef[] = [
    { name: 'kategori', label: 'Kategori SOP', type: 'text', required: true, placeholder: 'Kitchen & Frying' },
    { name: 'judul_sop', label: 'Judul SOP', type: 'text', required: true, placeholder: 'SOP Penggorengan...' },
    { name: 'langkah', label: 'Langkah-Langkah Kerja (Satu per baris)', type: 'arrayLines', required: true },
    { name: 'sumber', label: 'Sumber / Versi Dokumen', type: 'text', defaultValue: 'Buku Standar Hara Chicken 2026' },
    { name: 'status_aktif', label: 'Status', type: 'select', options: ['Aktif', 'Nonaktif'] },
  ];

  // 11. BANK SOAL
  const soalCols: ColumnDef[] = [
    { key: 'topik', label: 'Topik' },
    { key: 'divisi', label: 'Divisi' },
    { key: 'pertanyaan', label: 'Pertanyaan' },
    { key: 'jawaban_benar', label: 'Kunci' },
    { key: 'bobot', label: 'Bobot Poin' },
    { key: 'status_aktif', label: 'Status' },
  ];
  const soalFields: FieldDef[] = [
    { name: 'topik', label: 'Topik Soal', type: 'text', required: true, placeholder: 'Kitchen & Frying' },
    { name: 'divisi', label: 'Divisi', type: 'select', options: ['Kitchen', 'Helper', 'Geprek', 'Kasir'] },
    { name: 'pertanyaan', label: 'Pertanyaan Soal Ujian', type: 'textarea', required: true },
    { name: 'opsi_a', label: 'Pilihan Jawaban A', type: 'text', required: true },
    { name: 'opsi_b', label: 'Pilihan Jawaban B', type: 'text', required: true },
    { name: 'opsi_c', label: 'Pilihan Jawaban C', type: 'text', required: true },
    { name: 'opsi_d', label: 'Pilihan Jawaban D', type: 'text', required: true },
    { name: 'jawaban_benar', label: 'Kunci Jawaban Benar', type: 'select', options: ['A', 'B', 'C', 'D'] },
    { name: 'bobot', label: 'Bobot Poin Soal', type: 'number', defaultValue: 20, required: true },
    { name: 'status_aktif', label: 'Status', type: 'select', options: ['Aktif', 'Nonaktif'] },
  ];

  // Auto-lock on user inactivity
  useEffect(() => {
    if (!isAuthenticated || isSessionLocked) return;

    const settingsList = db.getTable<any>('settings');
    const timeoutMinutes = settingsList[0]?.inactivity_timeout_minutes ?? 15;
    if (timeoutMinutes <= 0) return; // 0 = disabled

    const timeoutMs = timeoutMinutes * 60 * 1000;
    let timer: any = null;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIsSessionLocked(true);
        db.addLog(
          'UBAH',
          'Keamanan',
          `Sesi layar ${currentUser.nama} terkunci otomatis setelah inaktivitas ${timeoutMinutes} menit.`
        );
      }, timeoutMs);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [isAuthenticated, isSessionLocked, currentUser.nama]);

  const handleLogout = () => {
    db.logout();
    setIsAuthenticated(false);
    setIsSessionLocked(false);
    navigateToLoginOrDashboard();
    showToast('Berhasil logout dari sistem.');
  };

  // If not logged in, render Public Portal (either Login Page or Crew Exam Page)
  if (!isAuthenticated) {
    if (publicMode === 'public_ujian') {
      return (
        <UjianKruPublicView
          onBackToHome={() => {
            setDirectExamParams(null);
            navigateToLoginOrDashboard();
          }}
          onGoToAdminLogin={() => {
            setDirectExamParams(null);
            navigateToLoginOrDashboard();
          }}
          initialOutlet={directExamParams?.outletCode}
          initialNamaKru={directExamParams?.namaKru}
          initialDivisi={directExamParams?.divisi}
        />
      );
    }

    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          setCurrentUser(user);
          window.location.hash = '';
          showToast(`Selamat datang kembali, ${user.nama}!`);
        }}
        onOpenPublicExam={navigateToUjian}
        onStartDirectKruExam={(params) => {
          setDirectExamParams(params);
          setPublicMode('public_ujian');
          window.location.hash = '#ujian';
        }}
        onlineCount={onlineUsers.length}
        onOpenPresenceModal={() => setPresenceModalOpen(true)}
      />
    );
  }

  // If logged in, but user deliberately opened public exam preview
  if (publicMode === 'public_ujian') {
    return (
      <UjianKruPublicView
        onBackToHome={() => {
          setDirectExamParams(null);
          navigateToLoginOrDashboard();
        }}
        onGoToAdminLogin={() => {
          setDirectExamParams(null);
          navigateToLoginOrDashboard();
        }}
        initialOutlet={directExamParams?.outletCode}
        initialNamaKru={directExamParams?.namaKru}
        initialDivisi={directExamParams?.divisi}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] text-[#1F1813]">
      {/* Toast Notification */}
      {globalToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-800 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{globalToast}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        currentUser={currentUser}
        onOpenAICoach={() => setAiCoachOpen(true)}
        onOpenPublicExam={navigateToUjian}
        onLogout={handleLogout}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Command & Status Header */}
        <Header
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          currentUser={currentUser}
          onOpenAICoach={() => setAiCoachOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenGoogleWorkspace={() => setGoogleWorkspaceOpen(true)}
          onlineCount={onlineUsers.length}
          onOpenPresenceModal={() => setPresenceModalOpen(true)}
          selectedOutletCode={selectedOutletCode}
          onSelectOutletCode={setSelectedOutletCode}
          outlets={outlets}
          onOpenPublicExam={navigateToUjian}
          onLogout={handleLogout}
          onLockSession={() => {
            setIsSessionLocked(true);
            db.addLog('UBAH', 'Keamanan', `User ${currentUser.nama} mengunci layar sesi secara manual.`);
          }}
        />

        {/* Viewport Router */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 pb-24 md:pb-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentTab}
              selectedOutletCode={selectedOutletCode}
              onOpenAICoach={() => setAiCoachOpen(true)}
              onSelectOutletCode={setSelectedOutletCode}
            />
          )}

          {currentTab === 'budaya-hara' && (
            <HaraCultureView />
          )}

          {currentTab === 'stasiun-kerja' && (
            <StationWorkspaceView
              onOpenStationExam={(station) => {
                setDirectExamParams({
                  outletCode: selectedOutletCode !== 'ALL' ? selectedOutletCode : 'HC-JTS01',
                  namaKru: 'Kru Lapangan',
                  divisi: station,
                });
                setPublicMode('public_ujian');
                window.location.hash = '#ujian';
              }}
            />
          )}

          {currentTab === 'analitik-radar' && (
            <AnalitikRadarView
              selectedOutletCode={selectedOutletCode}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {(currentTab === 'monitoring-training' || currentTab === 'ojt-30hari') && (
            <UnifiedTrainingOJTView
              selectedOutletCode={selectedOutletCode}
              initialSubTab={currentTab === 'ojt-30hari' ? 'panduan' : 'monitoring'}
              onOpenRaporKru={(kruName) => {
                setCurrentTab('laporan-resmi');
              }}
            />
          )}

          {(currentTab === 'jobdesk-trainer' || (currentTab as string) === 'jobdesk-pd') && (
            <TrainerJobdeskView
              onNavigate={setCurrentTab}
              selectedOutletCode={selectedOutletCode}
            />
          )}

          {currentTab === 'master' && (
            <div className="space-y-6">
              {/* Unified Page Header Banner */}
              <PageHeaderBanner
                category="MASTER DATA"
                title="Master Data Outlet & Kru Restoran"
                description="Kelola seluruh cabang restoran Hara Chicken dalam jaringan serta master database personil kru, penempatan, dan spesialisasi divisi."
                icon={<Store size={22} />}
                tabs={[
                  {
                    id: 'outlets',
                    label: 'Master Outlet',
                    icon: Store,
                    count: outlets.length,
                  },
                  {
                    id: 'kru',
                    label: 'Master Kru & Personil',
                    icon: Users,
                  },
                ]}
                activeTab={masterSubTab}
                onSelectTab={(id) => setMasterSubTab(id as 'outlets' | 'kru')}
              />

              {masterSubTab === 'outlets' ? (
                <CrudSection
                  table="outlets"
                  title="Master Data Outlet"
                  icon={<Store size={18} className="text-[#96171B]" />}
                  description="Kelola seluruh cabang restoran Hara Chicken dalam jaringan nasional."
                  columns={outletCols}
                  fields={outletFields}
                />
              ) : (
                <CrudSection
                  table="kru"
                  title="Master Data Kru Restoran"
                  icon={<Users size={18} className="text-[#96171B]" />}
                  description="Data kru operasional, divisi (Kitchen, Helper, Geprek, Kasir), dan penempatan cabang."
                  columns={kruCols}
                  fields={kruFields}
                  filterOutletCode={selectedOutletCode}
                />
              )}
            </div>
          )}

          {currentTab === 'penugasan-trainer' && (
            <PenugasanTrainerView
              selectedOutletCode={selectedOutletCode}
              onSelectOutletCode={setSelectedOutletCode}
            />
          )}

          {currentTab === 'jadwal-kunjungan' && (
            <JadwalKunjunganView
              selectedOutletCode={selectedOutletCode}
              onSelectOutletCode={setSelectedOutletCode}
              currentUser={currentUser}
            />
          )}

          {/* 1. SUPERVISI LAPANGAN & COACHING (Consolidating observasi, coaching, keluhan, talent) */}
          {(currentTab === 'supervisi-lapangan' ||
            currentTab === 'observasi' ||
            currentTab === 'coaching' ||
            currentTab === 'keluhan' ||
            currentTab === 'talent') && (
            <OperasionalLapanganView
              allowedSubTabs={['observasi', 'coaching', 'keluhan', 'talent']}
              initialSubTab={
                currentTab === 'supervisi-lapangan'
                  ? 'observasi'
                  : (currentTab as OperasionalSubTab)
              }
              customCategory="SUPERVISI OPERASIONAL"
              customTitle="Supervisi Lapangan & Coaching Kru"
              customDescription="Audit kepatuhan SOP 5S shift restoran, bimbingan GROW coaching 1-on-1, penanganan keluhan konsumen RCA, dan talent tracker promosi."
              selectedOutletCode={selectedOutletCode}
              onOpenAIAction={handleOpenAIAction}
              onSelectOutletCode={setSelectedOutletCode}
            />
          )}

          {/* 2. TNA & RENCANA PELATIHAN (Consolidating tna, gap, rencana) */}
          {(currentTab === 'tna-rencana' ||
            currentTab === 'tna' ||
            currentTab === 'gap' ||
            currentTab === 'rencana') && (
            <OperasionalLapanganView
              allowedSubTabs={['tna', 'gap', 'rencana']}
              initialSubTab={
                currentTab === 'tna-rencana'
                  ? 'tna'
                  : (currentTab as OperasionalSubTab)
              }
              customCategory="PENGEMBANGAN KRU"
              customTitle="TNA & Rencana Pelatihan Cabang"
              customDescription="Identifikasi kebutuhan pelatihan (TNA Gap Matrix), matriks kesenjangan kompetensi, dan agenda jadwal pelatihan berkala."
              selectedOutletCode={selectedOutletCode}
              onOpenAIAction={handleOpenAIAction}
              onSelectOutletCode={setSelectedOutletCode}
            />
          )}

          {/* 3. PUSAT EVALUASI & SERTIFIKASI KRU (Consolidating penilaian-teori, penilaian-praktik, penilaian-lisan, kompetensi) */}
          {(currentTab === 'evaluasi-kompetensi' ||
            currentTab === 'evaluasi-kru' ||
            currentTab === 'penilaian-teori' ||
            currentTab === 'penilaian-praktik' ||
            currentTab === 'penilaian-lisan' ||
            (currentTab as string) === 'penilaian-sikap' ||
            currentTab === 'kompetensi') && (
            <PelatihanEvaluasiView
              allowedSubTabs={['hasil-ujian', 'penilaian-praktik', 'penilaian-lisan', 'penilaian-sikap', 'kompetensi']}
              initialSubTab={
                currentTab === 'evaluasi-kompetensi' || currentTab === 'evaluasi-kru'
                  ? 'hasil-ujian'
                  : (currentTab as PelatihanSubTab)
              }
              customCategory="EVALUASI KOMPETENSI"
              customTitle="Pusat Evaluasi & Sertifikasi Kru (4 Pilar Baku)"
              customDescription="Standarisasi mutu baku QSR dengan pengujian terpadu 4 Pilar HARA: Teori SOP (20%), Praktik Stopwatch SOS (40%), Lisan HACCP (15%), dan Sikap Budaya H.A.R.A (25%)."
              selectedOutletCode={selectedOutletCode}
              onOpenAIAction={handleOpenAIAction}
              onSelectOutletCode={setSelectedOutletCode}
            />
          )}

          {/* 4. BANK SOP & BANK SOAL (Consolidating bank-sop, bank-soal, operasional-sop) */}
          {(currentTab === 'bank-sop-soal' ||
            currentTab === 'operasional-sop' ||
            currentTab === 'bank-sop' ||
            currentTab === 'bank-soal') && (
            <PelatihanEvaluasiView
              allowedSubTabs={['bank-sop', 'bank-soal']}
              initialSubTab={
                currentTab === 'bank-sop-soal'
                  ? 'bank-sop'
                  : (currentTab as PelatihanSubTab)
              }
              customCategory="STANDAR OPERASIONAL"
              customTitle="Bank SOP & Bank Soal Resmi"
              customDescription="Repositori dokumen SOP resmi 4 stasiun kerja restoran dan butir bank soal evaluasi terverifikasi."
              selectedOutletCode={selectedOutletCode}
              onOpenAIAction={handleOpenAIAction}
              onSelectOutletCode={setSelectedOutletCode}
            />
          )}

          {/* 5. LAPORAN & DIAGNOSTIK EKSEKUTIF (Consolidating laporan, laporan-diagnostik) */}
          {(currentTab === 'laporan-resmi' ||
            currentTab === 'laporan-eksekutif' ||
            currentTab === 'laporan' ||
            currentTab === 'laporan-diagnostik') && (
            <UnifiedLaporanEksekutifView
              selectedOutletCode={selectedOutletCode}
              initialMode={currentTab === 'laporan-diagnostik' ? 'dossier_cabang' : 'rapor_kru'}
            />
          )}

          {currentTab === 'users' && (
            <UserManagementView
              currentUser={currentUser}
              onUserChanged={refreshAppData}
            />
          )}

          {currentTab === 'settings' && (
            <SistemDanEksporView onNavigateToTab={setCurrentTab} />
          )}

          {currentTab === 'bantuan' && <BantuanView />}
        </main>

        {/* ===================================================================
            MOBILE BOTTOM QUICK-NAVIGATION BAR (MD:HIDDEN)
            Memudahkan Trainer berpindah cepat antar 5 pilar menu operasional
            =================================================================== */}
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6E1DA] px-2 py-1.5 shadow-[0_-4px_20px_rgba(24,20,17,0.06)]"
        >
          <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto">
            {/* 1. Dashboard */}
            <button
              type="button"
              onClick={() => setCurrentTab('dashboard')}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                currentTab === 'dashboard'
                  ? 'text-[#96171B] font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <LayoutDashboard size={18} className={currentTab === 'dashboard' ? 'stroke-[2.5]' : ''} />
              <span className="text-[10px] mt-0.5 tracking-tight">Dashboard</span>
            </button>

            {/* 2. Training & Retraining */}
            <button
              type="button"
              onClick={() => setCurrentTab('monitoring-training')}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                currentTab === 'monitoring-training'
                  ? 'text-[#96171B] font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <CalendarCheck size={18} className={currentTab === 'monitoring-training' ? 'stroke-[2.5]' : ''} />
              <span className="text-[10px] mt-0.5 tracking-tight">Training</span>
            </button>

            {/* 3. Evaluasi 4 Pilar */}
            <button
              type="button"
              onClick={() => setCurrentTab('evaluasi-kompetensi')}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
                currentTab === 'evaluasi-kompetensi' || currentTab === 'evaluasi-kru'
                  ? 'text-[#96171B] font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative">
                <Award size={18} className={currentTab === 'evaluasi-kompetensi' ? 'stroke-[2.5]' : ''} />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#96171B]" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Evaluasi</span>
            </button>

            {/* 4. Inspeksi & Tools Dapur */}
            <button
              type="button"
              onClick={() => setCurrentTab('stasiun-kerja')}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                currentTab === 'stasiun-kerja'
                  ? 'text-[#96171B] font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <UtensilsCrossed size={18} className={currentTab === 'stasiun-kerja' ? 'stroke-[2.5]' : ''} />
              <span className="text-[10px] mt-0.5 tracking-tight">Tools Dapur</span>
            </button>

            {/* 5. Laporan PDF */}
            <button
              type="button"
              onClick={() => setCurrentTab('laporan-resmi')}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                currentTab === 'laporan-resmi'
                  ? 'text-[#96171B] font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <FileCheck size={18} className={currentTab === 'laporan-resmi' ? 'stroke-[2.5]' : ''} />
              <span className="text-[10px] mt-0.5 tracking-tight">Laporan</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Dedicated Interactive AI Action Modal */}
      <AIActionModal
        data={aiActionData}
        onClose={() => setAiActionData(null)}
        onSuccess={(msg) => {
          showToast(msg);
          refreshAppData();
        }}
      />

      {/* AI Trainer Operasional Assistant Chat Modal */}
      <AICoachModal
        isOpen={aiCoachOpen}
        onClose={() => setAiCoachOpen(false)}
        selectedOutletCode={selectedOutletCode}
      />

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectTab={setCurrentTab}
        onOpenAICoach={() => setAiCoachOpen(true)}
      />

      {/* Google Workspace & Cloud Database Sync Modal */}
      <GoogleWorkspaceModal
        isOpen={googleWorkspaceOpen}
        onClose={() => setGoogleWorkspaceOpen(false)}
        onShowToast={showToast}
      />

      {/* Live Online Presence Modal */}
      <OnlinePresenceModal
        isOpen={presenceModalOpen}
        onClose={() => setPresenceModalOpen(false)}
        onlineUsers={onlineUsers}
      />

      {/* Session Inactivity & Manual Lock Screen Overlay */}
      {isSessionLocked && isAuthenticated && (
        <SessionLockOverlay
          currentUser={currentUser}
          onUnlock={() => setIsSessionLocked(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
