import React, { useState } from 'react';
import {
  CalendarCheck, Users, BookOpen, Award, CheckCircle2,
  Clock, Shield, Layers, HelpCircle, RefreshCw, FileText, Flame, BarChart3, TrendingUp
} from 'lucide-react';
import { CrewTrainingMonitoringView } from './CrewTrainingMonitoringView';
import { ProgramOJT30HariView } from './ProgramOJT30HariView';
import { SimulasiPraktikRnDView } from './SimulasiPraktikRnDView';
import { PenilaianOnboardingTCView } from './PenilaianOnboardingTCView';
import { OnboardingDataAnalystView } from './OnboardingDataAnalystView';
import { PageHeaderBanner } from '../PageHeaderBanner';

export type TrainingOJTSubTab =
  | 'penilaian-onboarding'
  | 'analisis-onboarding'
  | 'monitoring'
  | 'panduan'
  | 'simulasi-rnd';

interface UnifiedTrainingOJTViewProps {
  selectedOutletCode?: string;
  onOpenRaporKru?: (kruName: string) => void;
  initialSubTab?: TrainingOJTSubTab;
}

export const UnifiedTrainingOJTView: React.FC<UnifiedTrainingOJTViewProps> = ({
  selectedOutletCode = 'ALL',
  onOpenRaporKru,
  initialSubTab = 'penilaian-onboarding',
}) => {
  const [activeTab, setActiveTab] = useState<TrainingOJTSubTab>(initialSubTab);

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <PageHeaderBanner
        category="PELATIHAN & ON-THE-JOB TRAINING"
        title="Pusat Onboarding TC & Monitoring Kru Training Terpadu"
        description="Modul terintegrasi penilaian objektif onboarding 4 kriteria (Ketepatan SOS, Kebersihan 5S, Kerjasama Tim, Knowledge), dashboard Data Analyst evaluasi stasiun, matriks monitoring OJT gerai, dan silabus kurikulum."
        icon={<CalendarCheck size={22} />}
        tabs={[
          {
            id: 'penilaian-onboarding',
            label: 'Penilaian Onboarding TC (4 Kriteria)',
            icon: Award,
          },
          {
            id: 'analisis-onboarding',
            label: 'Data Analyst & Rapor Onboarding TC',
            icon: BarChart3,
          },
          {
            id: 'monitoring',
            label: 'Matriks Monitoring OJT (H1 - H45)',
            icon: Users,
          },
          {
            id: 'panduan',
            label: 'Silabus & Panduan OJT Harian',
            icon: BookOpen,
          },
          {
            id: 'simulasi-rnd',
            label: 'Simulasi Praktik R&D (RnD)',
            icon: Flame,
          },
        ]}
        activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id as TrainingOJTSubTab)}
      />

      {/* Tab 1: Form Penilaian Onboarding TC */}
      {activeTab === 'penilaian-onboarding' && (
        <PenilaianOnboardingTCView
          selectedOutletCode={selectedOutletCode}
          onNavigateToAnalisis={() => setActiveTab('analisis-onboarding')}
        />
      )}

      {/* Tab 2: Data Analyst & Rapor Onboarding TC */}
      {activeTab === 'analisis-onboarding' && (
        <OnboardingDataAnalystView
          selectedOutletCode={selectedOutletCode}
          onNavigateToForm={() => setActiveTab('penilaian-onboarding')}
        />
      )}

      {/* Tab 3: Matriks Monitoring OJT Gerai */}
      {activeTab === 'monitoring' && (
        <CrewTrainingMonitoringView
          selectedOutletCode={selectedOutletCode}
          onOpenRaporKru={onOpenRaporKru}
        />
      )}

      {/* Tab 4: Panduan Silabus */}
      {activeTab === 'panduan' && (
        <ProgramOJT30HariView
          selectedOutletCode={selectedOutletCode}
        />
      )}

      {/* Tab 5: Simulasi R&D */}
      {activeTab === 'simulasi-rnd' && (
        <SimulasiPraktikRnDView
          selectedOutletCode={selectedOutletCode}
        />
      )}
    </div>
  );
};
