import React, { useState } from 'react';
import { PageHeaderBanner } from '../PageHeaderBanner';
import { OfficialRaporKinerjaOutlet } from './OfficialRaporKinerjaOutlet';
import { OfficialRaporKruView } from './OfficialRaporKru';
import { LaporanTrainerKeuanganView } from './LaporanTrainerKeuanganView';
import { MultiPageOfficialReport } from './MultiPageOfficialReport';
import { LaporanDiagnostikView } from './LaporanDiagnostikView';
import { AuditKinerjaOutletFormModal } from './AuditKinerjaOutletFormModal';
import { ProgramOJT30HariView } from '../trainer/ProgramOJT30HariView';
import { db } from '../../lib/storage';
import {
  FileCheck, Printer, FileText, Layers, Building2, User,
  Store, Award, DollarSign, Sparkles, Edit3, CalendarCheck
} from 'lucide-react';

export type UnifiedReportTab =
  | 'rapor_outlet_10hal'
  | 'rapor_kru'
  | 'program_ojt_30hari'
  | 'laporan_keuangan_trainer'
  | 'multipage_dossier'
  | 'radar_5axis';

interface UnifiedLaporanEksekutifViewProps {
  selectedOutletCode: string;
  initialMode?: UnifiedReportTab | 'multipage' | 'a4_radar' | 'dossier_analytics';
}

export const UnifiedLaporanEksekutifView: React.FC<UnifiedLaporanEksekutifViewProps> = ({
  selectedOutletCode,
  initialMode = 'rapor_outlet_10hal',
}) => {
  // Map backwards compatible initialModes
  const resolvedInitialTab: UnifiedReportTab =
    initialMode === 'multipage' || initialMode === 'rapor_outlet_10hal'
      ? 'rapor_outlet_10hal'
      : initialMode === 'a4_radar'
      ? 'radar_5axis'
      : initialMode === 'dossier_analytics'
      ? 'multipage_dossier'
      : (initialMode as UnifiedReportTab);

  const [activeTab, setActiveTab] = useState<UnifiedReportTab>(resolvedInitialTab);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Unified Executive Header */}
      <PageHeaderBanner
        category="PUSAT RAPOR & DOKUMENTASI RESMI HARA"
        title="Pusat Rapor & Laporan Profesional Eksekutif"
        description="Dokumentasi resmi berstandar korporat: Rapor Kinerja Outlet 10 Halaman Standar PDF HARA, Rapor Kompetensi Kru Berjenjang, Laporan Pertanggungjawaban & Keuangan Trainer ke Atasan, serta Audit Perbantuan Lapangan."
        icon={<FileCheck size={22} />}
        tabs={[
          {
            id: 'rapor_outlet_10hal',
            label: 'Rapor Kinerja Outlet (10 Hal Standar HARA)',
            icon: Store,
            badge: 'Resmi PDF',
          },
          {
            id: 'rapor_kru',
            label: 'Rapor Kompetensi Kru Operasional',
            icon: Award,
            badge: 'Data Science',
          },
          {
            id: 'program_ojt_30hari',
            label: 'Silabus & Panduan OJT 30 Hari',
            icon: CalendarCheck,
            badge: 'Visi Misi',
          },
          {
            id: 'laporan_keuangan_trainer',
            label: 'Laporan Finansial & Rekomendasi Trainer',
            icon: DollarSign,
            badge: 'Ke Atasan',
          },
          {
            id: 'multipage_dossier',
            label: 'Laporan Audit Perbantuan & Dossier Kru',
            icon: Building2,
          },
          {
            id: 'radar_5axis',
            label: 'Radar 5-Axis Diagnostik Cepat',
            icon: Layers,
          },
        ]}
        activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id as UnifiedReportTab)}
      />

      {/* Viewport Router */}
      {activeTab === 'rapor_outlet_10hal' && (
        <OfficialRaporKinerjaOutlet
          selectedOutletCode={selectedOutletCode}
          onOpenAuditForm={() => setAuditModalOpen(true)}
        />
      )}

      {activeTab === 'rapor_kru' && (
        <OfficialRaporKruView
          selectedOutletCode={selectedOutletCode}
        />
      )}

      {activeTab === 'program_ojt_30hari' && (
        <ProgramOJT30HariView
          selectedOutletCode={selectedOutletCode}
        />
      )}

      {activeTab === 'laporan_keuangan_trainer' && (
        <LaporanTrainerKeuanganView
          selectedOutletCode={selectedOutletCode}
        />
      )}

      {activeTab === 'multipage_dossier' && (
        <MultiPageOfficialReport
          selectedOutletCode={selectedOutletCode}
        />
      )}

      {activeTab === 'radar_5axis' && (
        <LaporanDiagnostikView
          selectedOutletCode={selectedOutletCode}
        />
      )}

      {/* Modal Input & Edit Audit Kinerja Outlet */}
      <AuditKinerjaOutletFormModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        targetOutletCode={selectedOutletCode !== 'ALL' && selectedOutletCode ? selectedOutletCode : 'HC-BTL01'}
        onSaved={() => {
          // Trigger storage listeners
          db.set('hara_audit_refresh_trigger', Date.now());
        }}
      />
    </div>
  );
};
