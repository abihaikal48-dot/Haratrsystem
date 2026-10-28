import React, { useState } from 'react';
import {
  CalendarCheck, Users, BookOpen, FileText, CheckCircle2,
  Clock, Shield, Layers, HelpCircle, RefreshCw, BarChart3, TrendingUp
} from 'lucide-react';
import { CrewTrainingMonitoringView } from './CrewTrainingMonitoringView';
import { ProgramOJT30HariView } from './ProgramOJT30HariView';
import { OnboardingActivityLogView } from './OnboardingActivityLogView';
import { PageHeaderBanner } from '../PageHeaderBanner';

export type TrainingOJTSubTab =
  | 'monitoring'
  | 'panduan'
  | 'logbook';

interface UnifiedTrainingOJTViewProps {
  selectedOutletCode?: string;
  onOpenRaporKru?: (kruName: string) => void;
  initialSubTab?: TrainingOJTSubTab;
}

export const UnifiedTrainingOJTView: React.FC<UnifiedTrainingOJTViewProps> = ({
  selectedOutletCode = 'ALL',
  onOpenRaporKru,
  initialSubTab = 'monitoring',
}) => {
  const [activeTab, setActiveTab] = useState<TrainingOJTSubTab>(initialSubTab);

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <PageHeaderBanner
        category="MONITORING TRAINING & OJT"
        title="Pusat Pemantauan OJT 30 Hari Kru Outlet"
        description="Monitoring terpadu evaluasi harian kru OJT (H1-H45), tracking kepatuhan standar SOP stasiun kerja, dan rekam logbook audit supervisi operasional outlet."
        icon={<CalendarCheck size={22} />}
        tabs={[
          {
            id: 'monitoring',
            label: 'Matriks Monitoring OJT (H1 - H45)',
            icon: Users,
          },
          {
            id: 'panduan',
            label: 'Peta Kepatuhan SOP & Panduan OJT Harian',
            icon: BookOpen,
          },
          {
            id: 'logbook',
            label: 'Logbook Observasi & Audit Lapangan',
            icon: FileText,
          },
        ]}
        activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id as TrainingOJTSubTab)}
      />

      {/* Tab 1: Matriks Monitoring OJT Outlet (30 Hari / H1-H45) */}
      {activeTab === 'monitoring' && (
        <CrewTrainingMonitoringView
          selectedOutletCode={selectedOutletCode}
          onOpenRaporKru={onOpenRaporKru}
        />
      )}

      {/* Tab 2: Panduan & Peta Kepatuhan SOP Harian */}
      {activeTab === 'panduan' && (
        <ProgramOJT30HariView
          selectedOutletCode={selectedOutletCode}
        />
      )}

      {/* Tab 3: Logbook Aktivitas & Audit Lapangan */}
      {activeTab === 'logbook' && (
        <OnboardingActivityLogView
          selectedOutletCode={selectedOutletCode}
        />
      )}
    </div>
  );
};
