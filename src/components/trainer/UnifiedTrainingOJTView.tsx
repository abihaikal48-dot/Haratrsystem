import React, { useState } from 'react';
import {
  CalendarCheck, Users, BookOpen, Award, CheckCircle2,
  Clock, Shield, Layers, HelpCircle, RefreshCw, FileText, Flame
} from 'lucide-react';
import { CrewTrainingMonitoringView } from './CrewTrainingMonitoringView';
import { ProgramOJT30HariView } from './ProgramOJT30HariView';
import { SimulasiPraktikRnDView } from './SimulasiPraktikRnDView';
import { PageHeaderBanner } from '../PageHeaderBanner';

interface UnifiedTrainingOJTViewProps {
  selectedOutletCode?: string;
  onOpenRaporKru?: (kruName: string) => void;
  initialSubTab?: 'monitoring' | 'panduan' | 'simulasi-rnd';
}

export const UnifiedTrainingOJTView: React.FC<UnifiedTrainingOJTViewProps> = ({
  selectedOutletCode = 'ALL',
  onOpenRaporKru,
  initialSubTab = 'monitoring',
}) => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'panduan' | 'simulasi-rnd'>(initialSubTab);

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <PageHeaderBanner
        category="PELATIHAN & ON-THE-JOB TRAINING"
        title="Monitoring Kru Training & Program OJT 30 Hari Terpadu"
        description="Satu modul terintegrasi untuk memantau progres harian kru baru, verifikasi checklist tugas, silabus materi 30 hari, simulasi praktik RnD Batch 1 & 2, dan 4 Gate Evaluation berkala standar HARA Chicken."
        icon={<CalendarCheck size={22} />}
        tabs={[
          {
            id: 'monitoring',
            label: 'Matriks Monitoring & Evaluasi Gate (H1 - H30)',
            icon: Users,
          },
          {
            id: 'panduan',
            label: 'Silabus & Panduan Materi Harian (30 Hari)',
            icon: BookOpen,
          },
          {
            id: 'simulasi-rnd',
            label: 'Simulasi Praktik Batch 1 & Batch 2 (RnD)',
            icon: Flame,
          },
        ]}
        activeTab={activeTab}
        onSelectTab={(id) => setActiveTab(id as 'monitoring' | 'panduan' | 'simulasi-rnd')}
      />

      {/* Tab Content */}
      {activeTab === 'monitoring' && (
        <CrewTrainingMonitoringView
          selectedOutletCode={selectedOutletCode}
          onOpenRaporKru={onOpenRaporKru}
        />
      )}

      {activeTab === 'panduan' && (
        <ProgramOJT30HariView
          selectedOutletCode={selectedOutletCode}
        />
      )}

      {activeTab === 'simulasi-rnd' && (
        <SimulasiPraktikRnDView
          selectedOutletCode={selectedOutletCode}
        />
      )}
    </div>
  );
};
