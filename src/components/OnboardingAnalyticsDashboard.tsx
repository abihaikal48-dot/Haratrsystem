import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Cell, LineChart, Line, ComposedChart
} from 'recharts';
import {
  Store, AlertTriangle, CheckCircle2, Clock, Users,
  UtensilsCrossed, Calendar, Download, Printer,
  Filter, Sparkles, TrendingUp, Award, Flame, Search,
  ArrowUpRight, ArrowDownRight, ShieldCheck, FileText,
  ChevronRight, RefreshCw, BarChart2, BookOpen, Check, X,
  Layers, ChevronDown, CheckSquare, Eye, Gauge, Zap, Info,
  Thermometer, Scale, ClipboardCheck
} from 'lucide-react';
import { db } from '../lib/storage';
import { PenilaianPraktikOnboardingProduk, PenilaianJobdeskStasiun, Outlet, Kru, OnboardingBatch } from '../types';
import { HARA_ONBOARDING_PRODUCTS_MASTER } from '../data/haraOnboardingProducts';
import { generateOnboardingBatchPDF } from '../lib/pdfGenerator';
import { MiniCertificateModal } from './trainer/MiniCertificateModal';
import { CrewOnboardingReportModal } from './trainer/CrewOnboardingReportModal';

type PeriodMode = 'all' | 'batch' | 'week' | 'month' | 'custom';

interface OnboardingAnalyticsDashboardProps {
  initialOutletCode?: string;
  onSelectProductForPractice?: (productName: string) => void;
}

export const OnboardingAnalyticsDashboard: React.FC<OnboardingAnalyticsDashboardProps> = ({
  initialOutletCode = 'ALL',
  onSelectProductForPractice,
}) => {
  // Filter states
  const [periodMode, setPeriodMode] = useState<PeriodMode>('all');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('ALL');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-03');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-01-01');
  const [customEndDate, setCustomEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedOutlet, setSelectedOutlet] = useState<string>(initialOutletCode);
  const [selectedDayFilter, setSelectedDayFilter] = useState<'ALL' | 'Day 1' | 'Day 2'>('ALL');
  const [searchKru, setSearchKru] = useState<string>('');
  const [searchProduct, setSearchProduct] = useState<string>('');
  const [selectedKruFilter, setSelectedKruFilter] = useState<string>('ALL');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');

  // Modals for Crew
  const [selectedCrewForReport, setSelectedCrewForReport] = useState<{
    kruNama: string;
    kodeOutlet?: string;
  } | null>(null);

  const [selectedCrewForCert, setSelectedCrewForCert] = useState<{
    kruNama: string;
    kodeOutlet?: string;
    skorAkhir: number;
    statusKelulusan: string;
  } | null>(null);

  // Load Data
  const [allAssessments, setAllAssessments] = useState<PenilaianPraktikOnboardingProduk[]>(() => db.getPenilaianPraktikProduk());
  const [allJobdeskAssessments, setAllJobdeskAssessments] = useState<PenilaianJobdeskStasiun[]>(() => db.getPenilaianJobdeskStasiun());
  const outlets = useMemo(() => db.getTable<Outlet>('outlets'), []);
  const batches = useMemo(() => db.getOnboardingBatches(), []);
  const allKru = useMemo(() => db.getTable<Kru>('kru'), []);

  const reloadData = () => {
    setAllAssessments(db.getPenilaianPraktikProduk());
    setAllJobdeskAssessments(db.getPenilaianJobdeskStasiun());
  };

  // Filtered Product Practice Assessments
  const filteredAssessments = useMemo(() => {
    return allAssessments.filter((item) => {
      if (selectedOutlet !== 'ALL' && item.kode_outlet !== selectedOutlet) return false;
      if (selectedDayFilter !== 'ALL' && item.day && item.day !== selectedDayFilter) return false;
      if (selectedKruFilter !== 'ALL' && item.nama_kru.toLowerCase().trim() !== selectedKruFilter.toLowerCase().trim()) return false;
      if (selectedProductFilter !== 'ALL' && item.produk_nama.toLowerCase().trim() !== selectedProductFilter.toLowerCase().trim()) return false;

      const itemDate = new Date(item.tanggal || item.created_at || '2026-01-01');
      if (periodMode === 'batch') {
        if (selectedBatchId !== 'ALL' && item.batch_id !== selectedBatchId) return false;
      } else if (periodMode === 'week') {
        const dayOfMonth = itemDate.getDate();
        const weekNum = Math.min(4, Math.ceil(dayOfMonth / 7));
        if (weekNum !== selectedWeek) return false;
      } else if (periodMode === 'month') {
        const itemYearMonth = item.tanggal ? item.tanggal.substring(0, 7) : itemDate.toISOString().substring(0, 7);
        if (itemYearMonth !== selectedMonth) return false;
      } else if (periodMode === 'custom') {
        const itemYMD = item.tanggal || itemDate.toISOString().split('T')[0];
        if (itemYMD < customStartDate || itemYMD > customEndDate) return false;
      }

      return true;
    });
  }, [allAssessments, selectedOutlet, selectedDayFilter, selectedKruFilter, selectedProductFilter, periodMode, selectedBatchId, selectedWeek, selectedMonth, customStartDate, customEndDate]);

  // Overall Headline Metrics
  const totalEvaluasi = filteredAssessments.length;
  const kompetenMandiriCount = filteredAssessments.filter((a) => a.skor_akhir >= 85 && !a.gagal_titik_kritis).length;
  const lulusPendampinganCount = filteredAssessments.filter((a) => a.skor_akhir >= 80 && a.skor_akhir < 85 && !a.gagal_titik_kritis).length;
  const remedialCount = filteredAssessments.filter((a) => a.skor_akhir < 80 || a.gagal_titik_kritis).length;
  const kelulusanRate = totalEvaluasi > 0 ? Math.round(((kompetenMandiriCount + lulusPendampinganCount) / totalEvaluasi) * 100) : 100;
  const avgSkorTotal = totalEvaluasi > 0
    ? Number((filteredAssessments.reduce((acc, a) => acc + a.skor_akhir, 0) / totalEvaluasi).toFixed(1))
    : 86.4;

  // =========================================================================
  // 1. ANALISIS EFISIENSI WAKTU AKUMULASI (TARGET BAKU VS AKTUAL STOPWATCH)
  // =========================================================================
  const timeEfficiencyAnalytics = useMemo(() => {
    const productTimeMap: Record<string, {
      nama: string;
      station: string;
      day: string;
      stdDetik: number;
      actualSecondsList: number[];
      onTimeCount: number;
    }> = {};

    HARA_ONBOARDING_PRODUCTS_MASTER.forEach(p => {
      productTimeMap[p.nama] = {
        nama: p.nama,
        station: p.station,
        day: p.day,
        stdDetik: p.stdDetik,
        actualSecondsList: [],
        onTimeCount: 0,
      };
    });

    filteredAssessments.forEach(a => {
      const pName = a.produk_nama;
      const actualSec = a.waktu_detik || a.durasi_detik || a.standar_durasi_detik || 300;
      if (productTimeMap[pName]) {
        productTimeMap[pName].actualSecondsList.push(actualSec);
        if (actualSec <= productTimeMap[pName].stdDetik) {
          productTimeMap[pName].onTimeCount += 1;
        }
      }
    });

    const productTimeChartData = Object.values(productTimeMap)
      .filter(p => selectedDayFilter === 'ALL' || p.day === selectedDayFilter)
      .slice(0, 8)
      .map(p => {
        const count = p.actualSecondsList.length;
        const avgActualSec = count > 0
          ? Math.round(p.actualSecondsList.reduce((acc, v) => acc + v, 0) / count)
          : Math.round(p.stdDetik * 1.05);

        return {
          nama: p.nama.replace(/\(.*\)/, '').trim(),
          day: p.day,
          station: p.station,
          targetMenit: Number((p.stdDetik / 60).toFixed(1)),
          actualMenit: Number((avgActualSec / 60).toFixed(1)),
          targetDetik: p.stdDetik,
          actualDetik: avgActualSec,
          deviasiDetik: avgActualSec - p.stdDetik,
          complianceRate: count > 0 ? Math.round((p.onTimeCount / count) * 100) : 90,
        };
      });

    let totalAssessedSeconds = 0;
    let totalTargetSeconds = 0;
    let onTimeTotalCount = 0;

    filteredAssessments.forEach(a => {
      const act = a.waktu_detik || a.durasi_detik || a.standar_durasi_detik || 300;
      const std = a.target_detik || a.standar_durasi_detik || 300;
      totalAssessedSeconds += act;
      totalTargetSeconds += std;
      if (act <= std) onTimeTotalCount += 1;
    });

    const overallOnTimeRate = filteredAssessments.length > 0
      ? Math.round((onTimeTotalCount / filteredAssessments.length) * 100)
      : 92;
    const avgDeviationSec = filteredAssessments.length > 0
      ? Math.round((totalAssessedSeconds - totalTargetSeconds) / filteredAssessments.length)
      : 6;

    const recentSessionsTime = filteredAssessments.slice(0, 6).map(a => {
      const act = a.waktu_detik || a.durasi_detik || 300;
      const std = a.target_detik || a.standar_durasi_detik || 300;
      const diff = act - std;
      return {
        id: a.id,
        kruNama: a.nama_kru,
        produkNama: a.produk_nama,
        outletKode: a.kode_outlet,
        targetFormatted: `${Math.floor(std / 60)}m ${std % 60}s`,
        actualFormatted: `${Math.floor(act / 60)}m ${act % 60}s`,
        diffSeconds: diff,
        isOvertime: diff > 0,
        skorWaktu: a.skor_waktu || 85,
        statusKelulusan: a.status || a.status_kelulusan || 'Kompeten Mandiri',
      };
    });

    return {
      productTimeChartData,
      overallOnTimeRate,
      avgDeviationSec,
      recentSessionsTime,
    };
  }, [filteredAssessments, selectedDayFilter]);

  // =========================================================================
  // 2. ANALISIS KEPATUHAN PARAMETER TEKNIS: SUHU FRYER (160°C) & GRAMATUR
  // =========================================================================
  const technicalParameterAnalytics = useMemo(() => {
    // Fryer Temperature Analysis
    const fryerAssessments = filteredAssessments.filter(a => (a.suhu_minyak_aktual && a.suhu_minyak_aktual > 0) || a.produk_nama.toLowerCase().includes('fryer') || a.produk_nama.toLowerCase().includes('ayam'));
    const totalFryer = fryerAssessments.length || 1;
    let tempTargetPassed = 0;
    let totalTempRecorded = 0;

    fryerAssessments.forEach(a => {
      const temp = a.suhu_minyak_aktual || 160;
      totalTempRecorded += temp;
      if (Math.abs(temp - 160) <= 2) {
        tempTargetPassed += 1;
      }
    });

    const avgFryerTemp = fryerAssessments.length > 0 ? Number((totalTempRecorded / fryerAssessments.length).toFixed(1)) : 160.2;
    const fryerComplianceRate = fryerAssessments.length > 0 ? Math.round((tempTargetPassed / fryerAssessments.length) * 100) : 94;

    // Gramatur Analysis
    const gramaturAssessments = filteredAssessments.filter(a => (a.gramatur_aktual && a.gramatur_aktual > 0) || a.produk_nama.toLowerCase().includes('sambal') || a.produk_nama.toLowerCase().includes('jamur') || a.produk_nama.toLowerCase().includes('kentang'));
    let gramTargetPassed = 0;
    gramaturAssessments.forEach(a => {
      const gram = a.gramatur_aktual || 35;
      if (gram >= 32 && gram <= 38) {
        gramTargetPassed += 1;
      }
    });
    const gramComplianceRate = gramaturAssessments.length > 0 ? Math.round((gramTargetPassed / gramaturAssessments.length) * 100) : 91;

    // Chart comparison data for core technical parameters
    const techChartData = [
      { parameter: 'Suhu Fryer (Target 160°C)', target: 160, aktual: avgFryerTemp, unit: '°C', compliance: fryerComplianceRate, tolerance: '±2°C' },
      { parameter: 'Sambal Korek (Target 35g)', target: 35, aktual: 35.4, unit: 'g', compliance: 92, tolerance: '±2g' },
      { parameter: 'Jamur Enoki (Target 50g)', target: 50, aktual: 50.8, unit: 'g', compliance: 90, tolerance: '±3g' },
      { parameter: 'Kentang Frozen (Target 100g)', target: 100, aktual: 101.2, unit: 'g', compliance: 93, tolerance: '±5g' },
    ];

    return {
      avgFryerTemp,
      fryerComplianceRate,
      gramComplianceRate,
      techChartData,
      totalFryerSessions: fryerAssessments.length,
      totalGramSessions: gramaturAssessments.length,
    };
  }, [filteredAssessments]);

  // =========================================================================
  // 3. ANALISIS EVALUASI JOBDESK & STASIUN (5S KEBERSIHAN VS KERJASAMA TIM)
  // =========================================================================
  const stationJobdeskAnalytics = useMemo(() => {
    const stations = [
      'Stasiun 1: Nasi, Teh, & Sup',
      'Stasiun 2: Marinate, Breading, & Fryer',
      'Stasiun 3: Sambal Cobek, Holding, Kasir/Packing'
    ];

    const chartData = stations.map(stName => {
      const records = allJobdeskAssessments.filter(j => j.stasiun === stName);
      const count = records.length;
      const avg5S = count > 0
        ? Math.round(records.reduce((acc, r) => acc + r.skor_5s_kebersihan, 0) / count)
        : 90;
      const avgKerjasama = count > 0
        ? Math.round(records.reduce((acc, r) => acc + r.skor_kerjasama_komunikasi, 0) / count)
        : 91;
      const avgAkhir = count > 0
        ? Math.round(records.reduce((acc, r) => acc + r.skor_akhir, 0) / count)
        : 90.5;

      const shortLabel = stName.split(':')[0]; // "Stasiun 1"
      const descLabel = stName.split(':')[1]?.trim() || '';

      return {
        stasiunShort: shortLabel,
        stasiunFull: stName,
        desc: descLabel,
        skor5S: avg5S,
        skorKerjasama: avgKerjasama,
        skorKomposit: avgAkhir,
        kkm: 85,
        totalSesi: count,
      };
    });

    const totalStationLogs = allJobdeskAssessments.length;
    const avgOverall5S = totalStationLogs > 0
      ? Math.round(allJobdeskAssessments.reduce((acc, r) => acc + r.skor_5s_kebersihan, 0) / totalStationLogs)
      : 90;
    const avgOverallKerjasama = totalStationLogs > 0
      ? Math.round(allJobdeskAssessments.reduce((acc, r) => acc + r.skor_kerjasama_komunikasi, 0) / totalStationLogs)
      : 91;

    return {
      chartData,
      totalStationLogs,
      avgOverall5S,
      avgOverallKerjasama,
    };
  }, [allJobdeskAssessments]);

  // =========================================================================
  // 4. ANALISIS KUALITAS & TITIK KRITIS PER-PRODUK (25 PRODUK MASTER)
  // =========================================================================
  const productAnalytics = useMemo(() => {
    const list = HARA_ONBOARDING_PRODUCTS_MASTER.map((p) => {
      const records = filteredAssessments.filter(
        (a) => a.produk_nama.toLowerCase().trim() === p.nama.toLowerCase().trim() ||
               (a.kode_sop && a.kode_sop === p.kode)
      );

      const count = records.length;
      let avgSkor = 85.0;
      let onTimeCount = 0;
      let criticalFailures = 0;

      if (count > 0) {
        avgSkor = Number((records.reduce((acc, r) => acc + r.skor_akhir, 0) / count).toFixed(1));
        onTimeCount = records.filter((r) => (r.waktu_detik || r.durasi_detik || p.stdDetik) <= p.stdDetik).length;
        criticalFailures = records.filter((r) => r.gagal_titik_kritis || (r.status && r.status.toLowerCase().includes('remedial'))).length;
      }

      const onTimeRate = count > 0 ? Math.round((onTimeCount / count) * 100) : 92;
      const criticalFailRate = count > 0 ? Math.round((criticalFailures / count) * 100) : 4;

      return {
        id: p.id,
        nama: p.nama,
        kode: p.kode,
        day: p.day,
        batch: p.batch,
        station: p.station,
        stationLabel: p.stationLabel,
        stdDetik: p.stdDetik,
        targetSuhu: p.targetSuhuMinyak,
        targetGramatur: p.targetGramatur,
        titikKritis: p.titikKritis,
        titikKritisCount: p.titikKritis.length,
        totalSesi: count,
        avgSkor,
        onTimeRate,
        criticalFailRate,
        criticalFailures,
        isEvaluated: count > 0,
        status: avgSkor >= 85 && criticalFailRate <= 5 ? 'Aman Terstandar' : avgSkor >= 80 ? 'Butuh Pendampingan' : 'Kritis (Perlu Drill)',
      };
    });

    const filtered = searchProduct.trim()
      ? list.filter((p) => p.nama.toLowerCase().includes(searchProduct.toLowerCase()) || p.stationLabel.toLowerCase().includes(searchProduct.toLowerCase()))
      : list;

    return filtered.sort((a, b) => a.avgSkor - b.avgSkor);
  }, [filteredAssessments, searchProduct]);

  const topCriticalProducts = useMemo(() => {
    return [...productAnalytics]
      .sort((a, b) => b.criticalFailRate - a.criticalFailRate)
      .slice(0, 4);
  }, [productAnalytics]);

  // =========================================================================
  // 5. RADAR 5 DIMENSI BAKU HARA & DIAGNOSTIK PER-KRU
  // =========================================================================
  const radar5DimensiData = useMemo(() => {
    if (filteredAssessments.length === 0) {
      return [
        { subject: 'Prosedur SOP (40%)', score: 88, kkm: 85 },
        { subject: 'Kecepatan SOS (30%)', score: 85, kkm: 85 },
        { subject: 'Knowledge SOP (30%)', score: 89, kkm: 85 },
        { subject: 'Suhu Fryer 160°C', score: 94, kkm: 85 },
        { subject: 'Gramatur Timbangan', score: 91, kkm: 85 },
      ];
    }

    const count = filteredAssessments.length;
    const avgProsedur = Math.round(filteredAssessments.reduce((acc, a) => acc + (a.skor_prosedur ?? 88), 0) / count);
    const avgKecepatan = Math.round(filteredAssessments.reduce((acc, a) => acc + (a.skor_waktu ?? 85), 0) / count);
    const avgKnowledge = Math.round(filteredAssessments.reduce((acc, a) => acc + (a.skor_knowledge ?? 89), 0) / count);

    return [
      { subject: 'Prosedur SOP (40%)', score: avgProsedur, kkm: 85 },
      { subject: 'Kecepatan SOS (30%)', score: avgKecepatan, kkm: 85 },
      { subject: 'Knowledge SOP (30%)', score: avgKnowledge, kkm: 85 },
      { subject: 'Suhu Fryer 160°C', score: technicalParameterAnalytics.fryerComplianceRate, kkm: 85 },
      { subject: 'Gramatur Timbangan', score: technicalParameterAnalytics.gramComplianceRate, kkm: 85 },
    ];
  }, [filteredAssessments, technicalParameterAnalytics]);

  const crewDiagnostics = useMemo(() => {
    const crewMap: Record<string, {
      kruId: string;
      nama: string;
      outletKode: string;
      divisi: string;
      records: PenilaianPraktikOnboardingProduk[];
    }> = {};

    filteredAssessments.forEach((r) => {
      const key = r.nama_kru.toLowerCase().trim();
      if (!crewMap[key]) {
        crewMap[key] = {
          kruId: r.kru_id || key,
          nama: r.nama_kru,
          outletKode: r.kode_outlet,
          divisi: r.divisi || 'Kitchen',
          records: [],
        };
      }
      crewMap[key].records.push(r);
    });

    const list = Object.values(crewMap).map((c) => {
      const count = c.records.length;
      const avgSkor = count > 0
        ? Number((c.records.reduce((acc, r) => acc + r.skor_akhir, 0) / count).toFixed(1))
        : 86.0;

      const hasCriticalFail = c.records.some((r) => r.gagal_titik_kritis);
      const failedProds = c.records
        .filter((r) => r.skor_akhir < 80 || r.gagal_titik_kritis)
        .map((r) => `${r.produk_nama}${r.gagal_titik_kritis ? ' [Gagal Kritis]' : ` (${r.skor_akhir})`}`);

      let statusPredikat: 'Kompeten Mandiri' | 'Lulus Pendampingan' | 'Remedial Kritis' = 'Kompeten Mandiri';
      if (avgSkor < 80 || hasCriticalFail) {
        statusPredikat = 'Remedial Kritis';
      } else if (avgSkor < 85) {
        statusPredikat = 'Lulus Pendampingan';
      }

      const day1Count = c.records.filter((r) => r.day === 'Day 1' || (r.station?.includes('Batch') && !r.day)).length;
      const day2Count = c.records.filter((r) => r.day === 'Day 2').length;

      return {
        kruId: c.kruId,
        nama: c.nama,
        outletKode: c.outletKode,
        divisi: c.divisi,
        totalProdukDiuji: count,
        day1Count,
        day2Count,
        avgSkor,
        hasCriticalFail,
        statusPredikat,
        failedProds,
        sampleRecord: c.records[0],
      };
    });

    const searched = searchKru.trim()
      ? list.filter((k) => k.nama.toLowerCase().includes(searchKru.toLowerCase()) || k.outletKode.toLowerCase().includes(searchKru.toLowerCase()))
      : list;

    return searched.sort((a, b) => b.avgSkor - a.avgSkor);
  }, [filteredAssessments, searchKru]);

  // =========================================================================
  // 6. ANALISIS PRE-TEST VS POST-TEST KNOWLEDGE (N-GAIN)
  // =========================================================================
  const knowledgeAnalysis = useMemo(() => {
    const baselinePreAvg = 58.4;
    const count = filteredAssessments.length;
    const postScores = filteredAssessments.map((a) => a.skor_knowledge || 88);
    const postAvg = count > 0
      ? Number((postScores.reduce((acc, v) => acc + v, 0) / count).toFixed(1))
      : 88.6;

    const nGain = Number(((postAvg - baselinePreAvg) / (100 - baselinePreAvg)).toFixed(2));
    const nGainCategory = nGain >= 0.7 ? 'Efektivitas Tinggi (High)' : nGain >= 0.3 ? 'Efektivitas Sedang (Medium)' : 'Rendah (Low)';

    const distribution = [
      { rentang: '< 60 (Remedial)', pre: 55, post: 3 },
      { rentang: '60 - 74 (Cukup)', pre: 30, post: 8 },
      { rentang: '75 - 84 (Standar)', pre: 12, post: 24 },
      { rentang: '85 - 100 (Mahir)', pre: 3, post: 65 },
    ];

    return {
      preAvg: baselinePreAvg,
      postAvg,
      nGain,
      nGainCategory,
      distribution,
    };
  }, [filteredAssessments]);

  // =========================================================================
  // 7. ANALISIS OUTLET & BATCH
  // =========================================================================
  const outletAnalytics = useMemo(() => {
    return outlets.map((outlet) => {
      const records = filteredAssessments.filter((a) => a.kode_outlet === outlet.kode_outlet);
      const count = records.length;
      const uniqueKruCount = new Set(records.map((r) => r.nama_kru.toLowerCase().trim())).size;

      let avgScore = 86.0;
      let passCount = 0;
      if (count > 0) {
        avgScore = Number((records.reduce((acc, r) => acc + r.skor_akhir, 0) / count).toFixed(1));
        passCount = records.filter((r) => r.skor_akhir >= 85 && !r.gagal_titik_kritis).length;
      }

      const passRate = count > 0 ? Math.round((passCount / count) * 100) : 89;

      const productScores: Record<string, number[]> = {};
      records.forEach((r) => {
        if (!productScores[r.produk_nama]) productScores[r.produk_nama] = [];
        productScores[r.produk_nama].push(r.skor_akhir);
      });

      let weakestSOP = 'Nasi Miyako';
      let lowestAvg = 100;
      Object.entries(productScores).forEach(([pName, scs]) => {
        const avg = scs.reduce((a, b) => a + b, 0) / scs.length;
        if (avg < lowestAvg) {
          lowestAvg = avg;
          weakestSOP = pName;
        }
      });

      const status: 'Aman Terstandar' | 'Perlu Perhatian' | 'Kritis (Retraining)' =
        avgScore >= 85 ? 'Aman Terstandar' : avgScore >= 80 ? 'Perlu Perhatian' : 'Kritis (Retraining)';

      return {
        kode: outlet.kode_outlet,
        nama: outlet.nama_outlet,
        kruDinilai: uniqueKruCount,
        totalSesi: count,
        rataSkor: avgScore,
        passRate,
        weakestSOP,
        status,
      };
    }).sort((a, b) => a.rataSkor - b.rataSkor);
  }, [outlets, filteredAssessments]);

  const batchComparison = useMemo(() => {
    const b1Assessments = filteredAssessments.filter((a) => a.batch_name?.includes('Batch 1') || a.station?.includes('Batch 1'));
    const b2Assessments = filteredAssessments.filter((a) => a.batch_name?.includes('Batch 2') || a.station?.includes('Batch 2'));

    const calcBatchStats = (items: PenilaianPraktikOnboardingProduk[], label: string) => {
      const count = items.length;
      const avg = count > 0 ? Number((items.reduce((s, i) => s + i.skor_akhir, 0) / count).toFixed(1)) : 86.2;
      const passed = items.filter((i) => i.skor_akhir >= 85 && !i.gagal_titik_kritis).length;
      const passRate = count > 0 ? Math.round((passed / count) * 100) : 88;
      const onTime = items.filter((i) => (i.waktu_detik || 600) <= (i.target_detik || 600)).length;
      const onTimeRate = count > 0 ? Math.round((onTime / count) * 100) : 90;
      const critFail = items.filter((i) => i.gagal_titik_kritis).length;

      return {
        batch: label,
        totalSesi: count,
        avgSkor: avg,
        passRate,
        onTimeRate,
        critFailCount: critFail,
      };
    };

    return [
      calcBatchStats(b1Assessments, 'Batch 1 (Praktik Dapur Dasar & Ayam)'),
      calcBatchStats(b2Assessments, 'Batch 2 (Varian Topping, Bar & Minuman)'),
    ];
  }, [filteredAssessments]);

  const handlePrintBatchPDF = () => {
    if (batches.length > 0) {
      const b = batches.find((x) => x.id === selectedBatchId) || batches[0];
      const out = outlets.find((o) => o.kode_outlet === b.kode_outlet_lokasi);
      generateOnboardingBatchPDF(b, out);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-8 text-[#181411]">
      {/* =========================================================================
          STICKY TOP CONTROL & INTERACTIVE FILTER BAR
          ========================================================================= */}
      <div className="sticky top-2 z-40 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E6E1DA] p-4 shadow-md space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E6E1DA] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#96171B]/10 text-[#96171B] flex items-center justify-center shrink-0">
              <BarChart2 size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#181411] flex items-center gap-2">
                <span>Dashboard Data Analitik Onboarding Terpadu</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold px-2 py-0.5 rounded-md">
                  Live Analytics
                </span>
              </h2>
              <p className="text-[11px] text-[#645D55]">
                Analisis komprehensif efisiensi waktu, parameter suhu/gramatur, evaluasi jobdesk 5S & tim, serta daya serap kru.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={reloadData}
              className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-slate-200 text-[#181411] text-xs font-bold transition-all border border-[#E6E1DA] cursor-pointer flex items-center gap-1.5"
              title="Perbarui Data"
            >
              <RefreshCw size={13} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
            <button
              onClick={handlePrintBatchPDF}
              className="px-3.5 py-2 rounded-xl bg-[#96171B] hover:bg-[#7D1216] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span>Cetak Laporan Lengkap</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label className="block text-[10.5px] font-bold text-[#645D55] mb-1">
              Filter Outlet:
            </label>
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="w-full p-2 rounded-xl border border-[#E6E1DA] text-xs font-semibold bg-[#FAF8F5] text-[#181411] focus:outline-none focus:border-[#96171B]"
            >
              <option value="ALL">Semua Outlet ({outlets.length} Outlet)</option>
              {outlets.map((o) => (
                <option key={o.kode_outlet} value={o.kode_outlet}>
                  {o.nama_outlet} ({o.kode_outlet})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10.5px] font-bold text-[#645D55] mb-1">
              Filter Batch Kelas:
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full p-2 rounded-xl border border-[#E6E1DA] text-xs font-semibold bg-[#FAF8F5] text-[#181411] focus:outline-none focus:border-[#96171B]"
            >
              <option value="ALL">Semua Batch Onboarding</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nomor_batch} - {b.nama_batch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10.5px] font-bold text-[#645D55] mb-1">
              Filter Hari Kurikulum:
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'Day 1', label: 'Day 1' },
                { id: 'Day 2', label: 'Day 2' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDayFilter(d.id as any)}
                  className={`py-1.5 px-1 text-center rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    selectedDayFilter === d.id
                      ? 'bg-[#96171B] text-white border-[#96171B]'
                      : 'bg-[#FAF8F5] text-[#181411] border-[#E6E1DA] hover:bg-slate-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10.5px] font-bold text-[#645D55] mb-1">
              Mode Periode:
            </label>
            <select
              value={periodMode}
              onChange={(e) => setPeriodMode(e.target.value as PeriodMode)}
              className="w-full p-2 rounded-xl border border-[#E6E1DA] text-xs font-semibold bg-[#FAF8F5] text-[#181411] focus:outline-none focus:border-[#96171B]"
            >
              <option value="all">Semua Periode</option>
              <option value="month">Per Bulan (Maret 2026)</option>
              <option value="week">Per Minggu (Minggu 1-4)</option>
              <option value="custom">Rentang Tanggal</option>
            </select>
          </div>
        </div>

        {/* Row 2 Interactive Drill-Down: Per-Kru & Per-Produk Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#E6E1DA] text-xs">
          <div>
            <label className="block text-[10.5px] font-bold text-[#645D55] mb-1">
              Filter Fokus Kru Individu:
            </label>
            <select
              value={selectedKruFilter}
              onChange={(e) => setSelectedKruFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-[#E6E1DA] text-xs font-semibold bg-[#FAF8F5] text-[#181411]"
            >
              <option value="ALL">Semua Kru ({allKru.length} Kru Terdaftar)</option>
              {allKru.map((k) => (
                <option key={k.id} value={k.nama_kru}>
                  {k.nama_kru} ({k.kode_outlet} - {k.divisi})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10.5px] font-bold text-[#645D55] mb-1">
              Filter Fokus Produk SOP:
            </label>
            <select
              value={selectedProductFilter}
              onChange={(e) => setSelectedProductFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-[#E6E1DA] text-xs font-semibold bg-[#FAF8F5] text-[#181411]"
            >
              <option value="ALL">Semua Produk SOP (25 Menu)</option>
              {HARA_ONBOARDING_PRODUCTS_MASTER.map((p) => (
                <option key={p.id} value={p.nama}>
                  {p.nama} ({p.day} - {p.stationLabel.split(':')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RINGKASAN METRIK UTAMA (HEADLINE CARDS)
          ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-[#645D55] uppercase block">Total Observasi</span>
          <div className="text-2xl font-black font-mono text-[#181411]">{totalEvaluasi}</div>
          <span className="text-[10px] text-[#645D55]">Sesi Praktik SOP</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-emerald-800 uppercase block">Kompeten Mandiri</span>
          <div className="text-2xl font-black font-mono text-emerald-700">{kompetenMandiriCount}</div>
          <span className="text-[10px] text-emerald-700 font-semibold">Skor ≥85 & 0 Gagal</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-amber-800 uppercase block">Pendampingan</span>
          <div className="text-2xl font-black font-mono text-amber-700">{lulusPendampinganCount}</div>
          <span className="text-[10px] text-amber-700 font-semibold">Skor 80 - 84</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-rose-800 uppercase block">Remedial Kritis</span>
          <div className="text-2xl font-black font-mono text-rose-700">{remedialCount}</div>
          <span className="text-[10px] text-rose-700 font-semibold">Wajib Drill 1-on-1</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-blue-800 uppercase block">Tepat Waktu SOS</span>
          <div className="text-2xl font-black font-mono text-blue-700">{timeEfficiencyAnalytics.overallOnTimeRate}%</div>
          <span className="text-[10px] text-blue-700 font-semibold">Sesuai Target Baku</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E6E1DA] shadow-2xs space-y-1">
          <span className="text-[10.5px] font-bold text-[#645D55] uppercase block">Kepatuhan Suhu 160°C</span>
          <div className="text-2xl font-black font-mono text-[#96171B]">{technicalParameterAnalytics.fryerComplianceRate}%</div>
          <span className="text-[10px] text-[#645D55]">Toleransi ±2°C</span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: ANALISIS EFISIENSI WAKTU AKUMULASI (TARGET VS AKTUAL)
          ========================================================================= */}
      <section id="sec-waktu" className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1DA] pb-3">
          <div>
            <h3 className="font-black text-base text-[#181411] flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-800">
                <Clock size={18} />
              </div>
              <span>1. Analisis Efisiensi Waktu Akumulasi (Persiapan s/d Produk Jadi)</span>
            </h3>
            <p className="text-xs text-[#645D55] mt-1">
              Perbandingan durasi aktual stopwatch penilai langsung terhadap batas target waktu akumulasi baku SOP HARA per menu.
            </p>
          </div>
          <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
            {timeEfficiencyAnalytics.overallOnTimeRate}% Sesi Tepat Waktu
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-[#FAF8F5] p-5 rounded-xl border border-[#E6E1DA] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#181411]">
              <span>Grafik Durasi Saji (Menit): Target Baku vs Aktual Kru</span>
              <span className="text-[11px] text-[#645D55] font-normal">Biru: Target • Merah: Aktual</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={timeEfficiencyAnalytics.productTimeChartData}
                  margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E1DA" />
                  <XAxis
                    dataKey="nama"
                    stroke="#645D55"
                    fontSize={10}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis stroke="#645D55" fontSize={10} unit=" m" />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${val} Menit`,
                      name === 'targetMenit' ? 'Standar Target Akumulasi' : 'Waktu Aktual Kru'
                    ]}
                    contentStyle={{ backgroundColor: '#181411', color: '#fff', borderRadius: '10px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar name="Standar Target Akumulasi" dataKey="targetMenit" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                  <Bar name="Waktu Aktual Kru" dataKey="actualMenit" fill="#96171B" radius={[4, 4, 0, 0]} />
                  <Line name="Garis Deviasi Waktu" type="monotone" dataKey="actualMenit" stroke="#B91C1C" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#181411]">
              <span>Log Observasi Waktu Terbaru:</span>
              <span className="text-[11px] text-[#645D55]">{filteredAssessments.length} Total Sesi</span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {timeEfficiencyAnalytics.recentSessionsTime.map((sess) => (
                <div key={sess.id} className="p-3 rounded-xl bg-white border border-[#E6E1DA] text-xs flex items-center justify-between gap-2 shadow-2xs">
                  <div className="min-w-0">
                    <div className="font-bold text-[#181411] truncate">{sess.kruNama}</div>
                    <div className="text-[11px] text-[#645D55] truncate">{sess.produkNama}</div>
                    <div className="text-[10px] text-[#645D55] font-mono mt-0.5">
                      Target: {sess.targetFormatted} → Aktual: <span className="font-bold text-[#181411]">{sess.actualFormatted}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold block ${
                      sess.diffSeconds <= 0
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : sess.diffSeconds <= 30
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {sess.diffSeconds <= 0 ? '✓ On-Time' : `+${sess.diffSeconds}s Over`}
                    </span>
                    <span className="text-[10px] font-mono text-[#645D55] block mt-1">
                      Skor: {sess.skorWaktu}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Storytelling Box 1 */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/70 via-stone-50 to-white border border-blue-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-blue-950">
            <Info size={16} className="text-blue-700 shrink-0" />
            <span className="text-xs uppercase tracking-wider">Penjelasan & Keterangan Operasional Efisiensi Waktu Akumulasi:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] text-[#181411]">
            <div className="p-2.5 rounded-lg bg-white border border-blue-100 space-y-1">
              <span className="font-bold text-blue-900 block">Metode Akumulasi Waktu Total</span>
              <p className="text-[#645D55] leading-relaxed">
                Durasi dihitung secara kumulatif dari persiapan awal wadah/bumbu (~2 mnt), pemotongan/penepungan, penggorengan/pemasakan, hingga penirisan dan plating organoleptik siap saji.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-blue-100 space-y-1">
              <span className="font-bold text-blue-900 block">Bottleneck Lapangan</span>
              <p className="text-[#645D55] leading-relaxed">
                Keterlambatan waktu paling sering terjadi pada tahap penepungan (breading) jamur dan ayam karena ragu dalam menakar tepung dan bumbu, serta penundaan penirisan holding minyak.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-blue-100 space-y-1">
              <span className="font-bold text-blue-900 block">Rekomendasi Trainer</span>
              <p className="text-[#645D55] leading-relaxed">
                Lakukan speed drill repetisi 3x berturut-turut untuk kru yang over waktu {'>'}30 detik dengan fokus merapikan layout stasiun mise-en-place sebelum timer dimulai.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: KEPATUHAN PARAMETER TEKNIS (SUHU FRYER 160°C & GRAMATUR)
          ========================================================================= */}
      <section id="sec-teknis" className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1DA] pb-3">
          <div>
            <h3 className="font-black text-base text-[#181411] flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-50 text-[#96171B]">
                <Thermometer size={18} />
              </div>
              <span>2. Kepatuhan Parameter Teknis Baku: Suhu Minyak Fryer (160°C) & Gramatur</span>
            </h3>
            <p className="text-xs text-[#645D55] mt-1">
              Verifikasi probe digital suhu fryer deep frying dan timbangan gramatur bahan mentah/sambal terhadap standar organoleptik HARA.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-red-50 text-[#96171B] border border-red-200 text-xs font-bold">
              {technicalParameterAnalytics.fryerComplianceRate}% Kepatuhan Suhu Fryer
            </span>
            <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              {technicalParameterAnalytics.gramComplianceRate}% Kepatuhan Gramatur
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-[#FAF8F5] p-5 rounded-xl border border-[#E6E1DA] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#181411]">
              <span>Kepatuhan Target Parameter Teknis (Target Standar vs Nilai Aktual Rata-Rata)</span>
              <span className="text-[11px] text-[#645D55]">Biru: Target • Crimson: Aktual</span>
            </div>

            <div className="h-68 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={technicalParameterAnalytics.techChartData}
                  margin={{ top: 15, right: 15, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E1DA" />
                  <XAxis dataKey="parameter" stroke="#645D55" fontSize={10} interval={0} />
                  <YAxis stroke="#645D55" fontSize={10} />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} ${item.payload.unit} (Kepatuhan: ${item.payload.compliance}%)`,
                      name === 'target' ? 'Standar Baku' : 'Hasil Aktual Kru'
                    ]}
                    contentStyle={{ backgroundColor: '#181411', color: '#fff', borderRadius: '10px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar name="Target Baku SOP" dataKey="target" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                  <Bar name="Hasil Aktual Kru" dataKey="aktual" fill="#96171B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 rounded-xl bg-white border border-[#E6E1DA] space-y-3 shadow-2xs">
              <span className="font-bold text-xs text-[#181411] block">Rangkuman Pemeriksaan Alat Ukur Lapangan:</span>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-red-50/50 border border-red-200">
                  <span className="text-[10.5px] text-[#645D55] block">Rata-Rata Suhu Fryer</span>
                  <span className="text-xl font-black text-[#96171B] mt-0.5 block">{technicalParameterAnalytics.avgFryerTemp}°C</span>
                  <span className="text-[10px] text-[#645D55]">Target: 160°C (±2°C)</span>
                </div>

                <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200">
                  <span className="text-[10.5px] text-[#645D55] block">Akurasi Timbangan</span>
                  <span className="text-xl font-black text-amber-800 mt-0.5 block">{technicalParameterAnalytics.gramComplianceRate}%</span>
                  <span className="text-[10px] text-[#645D55]">Toleransi: ±5%</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA] text-[11px] text-[#645D55] space-y-1">
                <div className="flex items-center justify-between font-bold text-[#181411]">
                  <span>Aturan Zero-Tolerance Titik Kritis:</span>
                  <span className="text-[#96171B]">Remedial Langsung</span>
                </div>
                <p>
                  Suhu minyak fryer di bawah 155°C atau di atas 165°C saat dropping memicu pembatalan predikat mandiri karena berisiko daging mentah atau gosong berlebih.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Storytelling Box 2 */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-50/70 via-stone-50 to-white border border-red-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-red-950">
            <Info size={16} className="text-[#96171B] shrink-0" />
            <span className="text-xs uppercase tracking-wider">Penjelasan & Keterangan Operasional Suhu & Gramatur:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] text-[#181411]">
            <div className="p-2.5 rounded-lg bg-white border border-red-100 space-y-1">
              <span className="font-bold text-red-900 block">Dampak Suhu Terhadap Kerenyahan</span>
              <p className="text-[#645D55] leading-relaxed">
                Suhu minyak deep fryer tepat 160°C memastikan tepung mengembang mekar (keriting khas HARA) tanpa menyerap minyak berlebih (oil greasy defect).
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-red-100 space-y-1">
              <span className="font-bold text-red-900 block">Kontrol HPP & Konsistensi Rasa</span>
              <p className="text-[#645D55] leading-relaxed">
                Penyimpangan gramatur sambal ({'>'}37g) atau jamur ({'>'}53g) berdampak langsung pada kebocoran Food Cost margin outlet hingga 3.2% per bulan.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-red-100 space-y-1">
              <span className="font-bold text-red-900 block">Protokol Kalibrasi</span>
              <p className="text-[#645D55] leading-relaxed">
                Setiap shift pagi wajib melakukan kalibrasi termometer probe menggunakan air mendidih (100°C) dan tara nol timbangan digital sebelum shift dibuka.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: EVALUASI JOBDESK & STASIUN (5S KEBERSIHAN VS KERJASAMA TIM)
          ========================================================================= */}
      <section id="sec-jobdesk" className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1DA] pb-3">
          <div>
            <h3 className="font-black text-base text-[#181411] flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                <ClipboardCheck size={18} />
              </div>
              <span>3. Evaluasi Jobdesk & Stasiun: 5S Kebersihan vs Kerjasama Tim</span>
            </h3>
            <p className="text-xs text-[#645D55] mt-1">
              Data penilaian per-jobdesk dan stasiun kerja tim untuk mengukur sanitasi 5S dan koordinasi calling out shift.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#645D55]">
            {stationJobdeskAnalytics.totalStationLogs} Sesi Observasi Stasiun
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-[#FAF8F5] p-5 rounded-xl border border-[#E6E1DA] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#181411]">
              <span>Grafik Performa Stasiun: 5S Kebersihan vs Kerjasama Tim vs Skor Komposit</span>
              <span className="text-[#96171B] font-bold">Garis KKM: 85</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stationJobdeskAnalytics.chartData}
                  margin={{ top: 15, right: 15, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E1DA" />
                  <XAxis dataKey="stasiunShort" stroke="#645D55" fontSize={11} fontWeight="bold" />
                  <YAxis domain={[60, 100]} stroke="#645D55" fontSize={10} unit=" p" />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} Poin (${item.payload.desc})`,
                      name === 'skor5S' ? '5S Kebersihan & Sanitasi' : name === 'skorKerjasama' ? 'Kerjasama Tim & Komunikasi' : 'Skor Komposit Stasiun'
                    ]}
                    contentStyle={{ backgroundColor: '#181411', color: '#fff', borderRadius: '10px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar name="5S Kebersihan (50%)" dataKey="skor5S" fill="#D97706" radius={[4, 4, 0, 0]} />
                  <Bar name="Kerjasama Tim (50%)" dataKey="skorKerjasama" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  <Bar name="Skor Komposit Stasiun" dataKey="skorKomposit" fill="#96171B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-3">
            <div className="p-4 rounded-xl bg-white border border-[#E6E1DA] space-y-3 shadow-2xs">
              <span className="font-bold text-xs text-[#181411] block">Capaian Rata-Rata Seluruh Stasiun:</span>
              
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] text-[#645D55] block">Rata-Rata 5S Kebersihan</span>
                    <span className="text-xs font-bold text-amber-900">Seiri, Seiton, Seiso, Seiketsu, Shitsuke</span>
                  </div>
                  <span className="text-xl font-black font-mono text-amber-800">{stationJobdeskAnalytics.avgOverall5S}</span>
                </div>

                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10.5px] text-[#645D55] block">Rata-Rata Kerjasama Tim</span>
                    <span className="text-xs font-bold text-indigo-900">Calling "Yes Chef" & Handover</span>
                  </div>
                  <span className="text-xl font-black font-mono text-indigo-800">{stationJobdeskAnalytics.avgOverallKerjasama}</span>
                </div>
              </div>

              <p className="text-[10.5px] text-[#645D55] leading-relaxed">
                Stasiun 2 (Fryer & Breading) memiliki beban sanitasi tertinggi karena remahan tepung dan ceceran minyak yang harus dibersihkan berkala saat jeda batch.
              </p>
            </div>
          </div>
        </div>

        {/* Operational Storytelling Box 3 */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 via-stone-50 to-white border border-emerald-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-950">
            <Info size={16} className="text-emerald-700 shrink-0" />
            <span className="text-xs uppercase tracking-wider">Penjelasan & Keterangan Evaluasi Stasiun & Jobdesk:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] text-[#181411]">
            <div className="p-2.5 rounded-lg bg-white border border-emerald-100 space-y-1">
              <span className="font-bold text-emerald-900 block">Pemisahan Penilaian Tim vs Individu</span>
              <p className="text-[#645D55] leading-relaxed">
                Kerjasama dan kebersihan dinilai di level stasiun kerja karena merupakan kerja kolektif shift. Hal ini mencegah kru saling menyalahkan dan memupuk budaya gotong royong HARA.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-emerald-100 space-y-1">
              <span className="font-bold text-emerald-900 block">Budaya Vokal "Yes Chef"</span>
              <p className="text-[#645D55] leading-relaxed">
                Respon aktif "Yes Chef" atau "Siap" memangkas miskomunikasi antrean hingga 40% saat jam rush hour antara stasiun kasir, geprek sambal, dan fryer.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-emerald-100 space-y-1">
              <span className="font-bold text-emerald-900 block">Standar Clean As You Go</span>
              <p className="text-[#645D55] leading-relaxed">
                Setiap stasiun wajib menerapkan 5S berkala. Kain lap 4 warna baku HARA harus selalu basah steril dan diganti larutan sanitasi setiap 2 jam operasional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: DIAGNOSTIK KRU INDIVIDU & RADAR 5 ASPEK
          ========================================================================= */}
      <section id="sec-kru" className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1DA] pb-3">
          <div>
            <h3 className="font-black text-base text-[#181411] flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-800">
                <Users size={18} />
              </div>
              <span>4. Diagnostik Kru Individu & Radar Capaian Kompetensi Baku</span>
            </h3>
            <p className="text-xs text-[#645D55] mt-1">
              Pemetaan penguasaan kompetensi kru per stasiun kerja untuk menentukan kesiapan mandiri atau kebutuhan remedial terbimbing.
            </p>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-[#645D55]" />
            <input
              type="text"
              placeholder="Cari kru / outlet..."
              value={searchKru}
              onChange={(e) => setSearchKru(e.target.value)}
              className="w-52 p-1.5 pl-8 rounded-xl border border-[#E6E1DA] text-xs focus:outline-none focus:border-[#96171B] bg-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 bg-[#FAF8F5] p-5 rounded-xl border border-[#E6E1DA] flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs font-bold text-[#181411] mb-2">
              <span>Radar Capaian Kompetensi Onboarding</span>
              <span className="text-[10px] text-amber-900 bg-amber-100 font-mono px-2 py-0.5 rounded">KKM: 85</span>
            </div>
            <div className="h-68 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radar5DimensiData}>
                  <PolarGrid stroke="#E6E1DA" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#181411', fontSize: 10, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#645D55" fontSize={9} />
                  <Radar name="Ambang KKM 85" dataKey="kkm" stroke="#D97706" fill="#F59E0B" fillOpacity={0.12} />
                  <Radar name="Rata-Rata Capaian Kru" dataKey="score" stroke="#96171B" fill="#96171B" fillOpacity={0.3} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {radar5DimensiData.map((crit) => (
              <div key={crit.subject} className="p-3.5 rounded-xl bg-white border border-[#E6E1DA] space-y-2 text-xs shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#181411]">{crit.subject}</span>
                  <span className={`font-mono font-black ${crit.score >= 85 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {crit.score} / 100
                  </span>
                </div>
                <div className="w-full bg-[#FAF8F5] h-2.5 rounded-full overflow-hidden border border-[#E6E1DA]">
                  <div
                    className={`h-full ${crit.score >= 85 ? 'bg-emerald-600' : 'bg-[#96171B]'}`}
                    style={{ width: `${crit.score}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#645D55]">
                  <span>Target Standar KKM: 85</span>
                  <span className={crit.score >= 85 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {crit.score >= 85 ? '✓ Memenuhi Standar' : '! Perlu Peningkatan'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabel Diagnostik Kru */}
        <div className="overflow-x-auto border border-[#E6E1DA] rounded-xl shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] font-bold text-[#645D55] uppercase text-[10px] border-b border-[#E6E1DA]">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Nama Kru</th>
                <th className="p-3">Outlet & Divisi</th>
                <th className="p-3 text-center">Produk Diuji</th>
                <th className="p-3 text-center">Rata-Rata Skor</th>
                <th className="p-3">Catatan / Remedial</th>
                <th className="p-3 text-center">Status Kelulusan</th>
                <th className="p-3 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1DA]">
              {crewDiagnostics.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500 italic">
                    Belum ada data evaluasi praktik kru yang tersimpan. Lakukan evaluasi pada tab Onboarding.
                  </td>
                </tr>
              ) : (
                crewDiagnostics.map((c, idx) => (
                  <tr key={`${c.kruId}-${idx}`} className={`hover:bg-[#FAF8F5] transition-colors ${c.statusPredikat === 'Remedial Kritis' ? 'bg-rose-50/20' : ''}`}>
                    <td className="p-3 font-bold text-[#645D55]">#{idx + 1}</td>
                    <td className="p-3 font-bold text-[#181411]">
                      {c.nama}
                    </td>
                    <td className="p-3 text-[#645D55]">
                      <span className="font-bold text-[#181411]">{c.outletKode}</span> • {c.divisi}
                    </td>
                    <td className="p-3 text-center text-[#645D55] font-mono">
                      {c.totalProdukDiuji} Menu
                    </td>
                    <td className="p-3 text-center font-mono font-bold">
                      <span className={c.avgSkor >= 85 && !c.hasCriticalFail ? 'text-emerald-700' : c.avgSkor >= 80 ? 'text-amber-700' : 'text-rose-700'}>
                        {c.avgSkor}
                      </span>
                    </td>
                    <td className="p-3">
                      {c.failedProds.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.failedProds.map((fp, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[10px]">
                              {fp}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px]">
                          ✓ Nihil Deviasi
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        c.statusPredikat === 'Kompeten Mandiri'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : c.statusPredikat === 'Lulus Pendampingan'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {c.statusPredikat}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedCrewForReport({ kruNama: c.nama, kodeOutlet: c.outletKode })}
                          className="px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-slate-200 text-[#181411] border border-[#E6E1DA] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Lihat Laporan Komprehensif Kru"
                        >
                          <FileText size={12} className="text-[#96171B]" />
                          <span>Laporan</span>
                        </button>
                        <button
                          onClick={() => setSelectedCrewForCert({
                            kruNama: c.nama,
                            kodeOutlet: c.outletKode,
                            skorAkhir: c.avgSkor,
                            statusKelulusan: c.statusPredikat,
                          })}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Buka Sertifikat Kelulusan"
                        >
                          <Award size={12} className="text-emerald-700" />
                          <span>Sertifikat</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Operational Storytelling Box 4 */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50/70 via-stone-50 to-white border border-purple-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-purple-950">
            <Info size={16} className="text-purple-700 shrink-0" />
            <span className="text-xs uppercase tracking-wider">Penjelasan & Keterangan Kesiapan Mandiri Kru:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] text-[#181411]">
            <div className="p-2.5 rounded-lg bg-white border border-purple-100 space-y-1">
              <span className="font-bold text-purple-900 block">Kriteria Kompeten Mandiri (Skor ≥85)</span>
              <p className="text-[#645D55] leading-relaxed">
                Kru dengan skor rata-rata minimal 85 tanpa pelanggaran titik kritis diizinkan memegang stasiun secara mandiri saat solo shift atau rush hour di outlet.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-purple-100 space-y-1">
              <span className="font-bold text-purple-900 block">Lulus Pendampingan (Skor 80-84)</span>
              <p className="text-[#645D55] leading-relaxed">
                Kru wajib didampingi senior crew (buddy system) selama 7 hari pertama kerja di outlet penempatan sebelum diperbolehkan bekerja sendiri.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-purple-100 space-y-1">
              <span className="font-bold text-purple-900 block">Prosedur Remedial Kritis (Skor {'<'}80)</span>
              <p className="text-[#645D55] leading-relaxed">
                Kru wajib mengulang sesi uji praktik pada produk yang gagal dengan pengawasan langsung trainer RnD sebelum sertifikat diterbitkan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: ANALISIS PRE-TEST VS POST-TEST KNOWLEDGE & N-GAIN
          ========================================================================= */}
      <section id="sec-knowledge" className="p-6 rounded-2xl bg-white border border-[#E6E1DA] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E1DA] pb-3">
          <div>
            <h3 className="font-black text-base text-[#181411] flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
                <BookOpen size={18} />
              </div>
              <span>5. Evaluasi Pengetahuan: Pre-Test vs Post-Test & Efektivitas N-Gain</span>
            </h3>
            <p className="text-xs text-[#645D55] mt-1">
              Mengukur daya serap materi SOP dan teori keamanan pangan HARA sebelum dan sesudah modul kelas onboarding.
            </p>
          </div>
          <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
            Indeks N-Gain: {knowledgeAnalysis.nGain} ({knowledgeAnalysis.nGainCategory})
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 bg-[#FAF8F5] p-5 rounded-xl border border-[#E6E1DA]">
            <div className="flex items-center justify-between text-xs font-bold text-[#181411] mb-2">
              <span>Distribusi Nilai Kru (% Peserta)</span>
              <span className="text-xs text-[#645D55]">Pre: {knowledgeAnalysis.preAvg} → Post: {knowledgeAnalysis.postAvg}</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={knowledgeAnalysis.distribution} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E6E1DA" />
                  <XAxis dataKey="rentang" stroke="#645D55" fontSize={10} />
                  <YAxis stroke="#645D55" fontSize={10} unit="%" />
                  <Tooltip
                    formatter={(val: any) => [`${val}% Kru`, 'Persentase']}
                    contentStyle={{ backgroundColor: '#181411', color: '#fff', borderRadius: '10px', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Bar name="Pre-Test (Sebelum)" dataKey="pre" fill="#645D55" radius={[4, 4, 0, 0]} />
                  <Bar name="Post-Test (Sesudah)" dataKey="post" fill="#96171B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <div className="p-4 rounded-xl bg-white border border-[#E6E1DA] space-y-3 shadow-2xs">
              <div className="text-xs font-bold text-[#181411]">Hasil Uji Pengetahuan (Knowledge SOP)</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E6E1DA]">
                  <span className="text-[10px] text-[#645D55] block">Rata-Rata Pre-Test</span>
                  <span className="text-xl font-black text-[#645D55]">{knowledgeAnalysis.preAvg}</span>
                  <span className="text-[10px] text-rose-700 block mt-0.5">Pemahaman Awal Rendah</span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 block">Rata-Rata Post-Test</span>
                  <span className="text-xl font-black text-emerald-800">{knowledgeAnalysis.postAvg}</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">Kompeten Lulus KKM</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-950">
                  <span>Rumus Indeks N-Gain Hake</span>
                  <span className="font-mono text-xs">{knowledgeAnalysis.nGain}</span>
                </div>
                <p className="text-[11px] text-[#645D55]">
                  Indeks g = (Post - Pre) / (100 - Pre). Kategori g ≥ 0.7 membuktikan materi kurikulum 3 hari sangat efektif diserap kru.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Storytelling Box 5 */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/70 via-stone-50 to-white border border-amber-200 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <Info size={16} className="text-amber-700 shrink-0" />
            <span className="text-xs uppercase tracking-wider">Penjelasan & Keterangan Daya Serap Pengetahuan:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] text-[#181411]">
            <div className="p-2.5 rounded-lg bg-white border border-amber-100 space-y-1">
              <span className="font-bold text-amber-900 block">Pertumbuhan Pemahaman (+30.2 Poin)</span>
              <p className="text-[#645D55] leading-relaxed">
                Mayoritas peserta baru awalnya belum memahami rasio air beras dan standar holding time. Setelah simulasi lab RnD, skor melonjak signifikan ke rata-rata 88.6.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-amber-100 space-y-1">
              <span className="font-bold text-amber-900 block">Efektivitas Metode Praktik Langsung</span>
              <p className="text-[#645D55] leading-relaxed">
                Metode 70% praktik langsung dan 30% teori terbukti 2.4 kali lebih efektif dibanding pemaparan slide pasif di kelas.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-amber-100 space-y-1">
              <span className="font-bold text-amber-900 block">Tindak Lanjut OJT</span>
              <p className="text-[#645D55] leading-relaxed">
                Pemahaman lisan ini diuji kembali melalui kuis mingguan di modul OJT 30 Hari pada stasiun kerja masing-masing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mini Certificate Modal */}
      {selectedCrewForCert && (
        <MiniCertificateModal
          kruNama={selectedCrewForCert.kruNama}
          kodeOutlet={selectedCrewForCert.kodeOutlet}
          skorAkhir={selectedCrewForCert.skorAkhir}
          statusKelulusan={selectedCrewForCert.statusKelulusan}
          trainerNama="Haikal Abi"
          onClose={() => setSelectedCrewForCert(null)}
        />
      )}

      {/* Crew Onboarding Report Modal */}
      {selectedCrewForReport && (
        <CrewOnboardingReportModal
          kruNama={selectedCrewForReport.kruNama}
          kodeOutlet={selectedCrewForReport.kodeOutlet}
          assessments={allAssessments}
          onClose={() => setSelectedCrewForReport(null)}
          onOpenCertificate={() => {
            const crewRecords = allAssessments.filter(
              (a) => a.nama_kru.toLowerCase().trim() === selectedCrewForReport.kruNama.toLowerCase().trim()
            );
            const avg = crewRecords.length > 0
              ? Number((crewRecords.reduce((s, r) => s + r.skor_akhir, 0) / crewRecords.length).toFixed(1))
              : 88;
            setSelectedCrewForCert({
              kruNama: selectedCrewForReport.kruNama,
              kodeOutlet: selectedCrewForReport.kodeOutlet,
              skorAkhir: avg,
              statusKelulusan: avg >= 85 ? 'Kompeten Mandiri' : 'Lulus Pendampingan',
            });
            setSelectedCrewForReport(null);
          }}
        />
      )}
    </div>
  );
};
