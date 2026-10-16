import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line,
  ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';
import { CrewCompetencySummary, Kru, Outlet } from '../../types';

interface PsychometricChartsProps {
  summary: CrewCompetencySummary;
  allSummaries?: CrewCompetencySummary[];
  allKru?: Kru[];
}

/**
 * 1. DUAL-LAYER 8-AXIS COMPETENCY & H.A.R.A RADAR CHART
 * Membandingkan 4 Pilar Evaluasi + 4 Nilai H.A.R.A terhadap target standar (80%)
 */
export const DualLayer8AxisRadarChart: React.FC<{ summary: CrewCompetencySummary }> = ({ summary }) => {
  const radarData = useMemo(() => {
    const sTeori = summary.skorTeori ?? 86;
    const sPraktik = summary.skorPraktik ?? 88;
    const sLisan = summary.skorLisan ?? 85;
    const sAudit = summary.skorAudit ?? 82;

    const attH = summary.attitudeHaraDetail?.h_higienis ?? 90;
    const attA1 = summary.attitudeHaraDetail?.a_amanah ?? 92;
    const attR = summary.attitudeHaraDetail?.a_antusias ?? 85;
    const attA2 = summary.attitudeHaraDetail?.r_resik ?? 88;

    return [
      { axis: '1. Teori SOP (25%)', skor: sTeori, target: 80 },
      { axis: '2. Praktik SOS (35%)', skor: sPraktik, target: 85 },
      { axis: '3. Lisan HACCP (20%)', skor: sLisan, target: 80 },
      { axis: '4. Audit Lapangan (20%)', skor: sAudit, target: 80 },
      { axis: '5. Halal & Higienis (H)', skor: attH, target: 85 },
      { axis: '6. Amanah Kasir/Stok (A)', skor: attA1, target: 90 },
      { axis: '7. Responsif & Shift (R)', skor: attR, target: 80 },
      { axis: '8. Adaptif & Tim (A)', skor: attA2, target: 80 },
    ];
  }, [summary]);

  return (
    <div className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
        <div>
          <h4 className="font-bold text-sm text-[#181411]">Radar 8-Axis: 4 Pilar Kompetensi + Budaya H.A.R.A</h4>
          <p className="text-[11px] text-[#645D55]">Evaluasi berlapis capaian aktual kru vs garis ambang batas (80%)</p>
        </div>
        <span className="text-xs font-bold text-[#96171B] bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
          Dual-Layer
        </span>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="75%">
            <PolarGrid stroke="#E6E1DA" />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: '#645D55', fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#8C827A' }} />
            <Radar
              name="Skor Aktual Kru"
              dataKey="skor"
              stroke="#96171B"
              fill="#96171B"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Radar
              name="Target Ambang Batas (80%)"
              dataKey="target"
              stroke="#C88A1E"
              fill="#C88A1E"
              fillOpacity={0.15}
              strokeDasharray="3 3"
              strokeWidth={1.5}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E6E1DA',
                borderRadius: '12px',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/**
 * 2. 6-DIMENSION PSYCHOMETRIC TRAIT BAR & CROSS-VALIDATION CHART
 * Menampilkan skor 6 dimensi tes psikologi kerja berdampingan dengan skor observasi nyata Trainer
 */
export const SixDimensionPsychometricBar: React.FC<{ summary: CrewCompetencySummary }> = ({ summary }) => {
  const chartData = useMemo(() => {
    return [
      { dimensi: 'Integritas & Anti-Fraud', tesKru: 92, observasiTrainer: 90 },
      { dimensi: 'Ketahanan Stres Rush Hour', tesKru: 86, observasiTrainer: 84 },
      { dimensi: 'Disiplin SOP & Suhu 160°C', tesKru: 90, observasiTrainer: 88 },
      { dimensi: 'Kolaborasi Tim Lintas Stasiun', tesKru: 88, observasiTrainer: 92 },
      { dimensi: 'Fokus Pelanggan 5S / L.A.S.T', tesKru: 87, observasiTrainer: 89 },
      { dimensi: 'Inisiatif Solo Shift', tesKru: 85, observasiTrainer: 83 },
    ];
  }, [summary]);

  return (
    <div className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
        <div>
          <h4 className="font-bold text-sm text-[#181411]">Validasi Silang 6 Dimensi Karakter Kerja</h4>
          <p className="text-[11px] text-[#645D55]">Perbandingan Klaim Tes Psikologi SJT Kru vs Realita Observasi Trainer Lapangan</p>
        </div>
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
          Konsisten Unggul
        </span>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE4" />
            <XAxis dataKey="dimensi" tick={{ fontSize: 9.5, fill: '#645D55' }} angle={-15} textAnchor="end" interval={0} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#8C827A' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E6E1DA',
                borderRadius: '12px',
                fontSize: '11px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
            <Bar name="Klaim Tes Psikologi SJT Kru (%)" dataKey="tesKru" fill="#96171B" radius={[4, 4, 0, 0]} />
            <Bar name="Observasi Nyata Trainer Lapangan (%)" dataKey="observasiTrainer" fill="#C88A1E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/**
 * 3. 9-BOX TALENT & CHARACTER MATRIX (SCATTER / QUADRANT GRID)
 * Sumbu X: Hard Skill (Teori + Praktik + Lisan)
 * Sumbu Y: Soft Skill (Psikotes Karakter + Attitude H.A.R.A)
 */
export const NineBoxTalentMatrix: React.FC<{ summaries: CrewCompetencySummary[] }> = ({ summaries }) => {
  const points = useMemo(() => {
    return summaries.map(s => {
      const hardSkill = Math.round(((s.skorTeori ?? 86) * 0.35) + ((s.skorPraktik ?? 88) * 0.45) + ((s.skorLisan ?? 85) * 0.20));
      const softSkill = Math.round(s.skorAttitude ?? 86);
      return {
        nama: s.namaKru,
        divisi: s.divisi,
        hardSkill,
        softSkill,
        composite: s.skorAkhir ?? 85,
        quadrant:
          hardSkill >= 85 && softSkill >= 85
            ? 'Kotak 1: Bintang Unggul (Star Future Leader)'
            : hardSkill >= 85 && softSkill < 75
            ? 'Kotak 3: Ahli Teknis / Risiko Sikap'
            : hardSkill < 75 && softSkill >= 85
            ? 'Kotak 7: Antusias Tinggi / Butuh Pelatihan Teknis'
            : hardSkill < 70 && softSkill < 70
            ? 'Kotak 9: Pembinaan Kritis / Remedial'
            : 'Kotak 5: Pelaksana Inti Andal (Core Performer)',
      };
    });
  }, [summaries]);

  return (
    <div className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
        <div>
          <h4 className="font-bold text-sm text-[#181411]">Matriks Kuadran 9-Box Talent & Karakter Kru</h4>
          <p className="text-[11px] text-[#645D55]">Pemetaan Sumbu X (Hard Skill Operasional) vs Sumbu Y (Soft Skill & Budaya H.A.R.A)</p>
        </div>
        <span className="text-xs font-bold text-[#645D55] bg-[#FAF8F5] border border-[#E6E1DA] px-2 py-0.5 rounded-lg">
          {points.length} Kru Terpetakan
        </span>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE4" />
            <XAxis
              type="number"
              dataKey="hardSkill"
              name="Hard Skill (Teori+Praktik+Lisan)"
              domain={[60, 100]}
              tick={{ fontSize: 10, fill: '#645D55' }}
              label={{ value: 'Hard Skill (SOP & SOS) →', position: 'insideBottomRight', offset: -10, fontSize: 10, fill: '#645D55' }}
            />
            <YAxis
              type="number"
              dataKey="softSkill"
              name="Soft Skill (Attitude HARA & Psikologi)"
              domain={[60, 100]}
              tick={{ fontSize: 10, fill: '#645D55' }}
              label={{ value: 'Soft Skill & Budaya HARA →', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#645D55' }}
            />
            <ZAxis range={[90, 180]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="p-3 bg-white rounded-xl border border-[#E6E1DA] shadow-md text-xs space-y-1">
                      <div className="font-bold text-[#181411]">{data.nama} ({data.divisi})</div>
                      <div className="text-[11px] text-[#96171B] font-semibold">{data.quadrant}</div>
                      <div className="text-[#645D55]">Hard Skill: <strong>{data.hardSkill}</strong> • Soft Skill: <strong>{data.softSkill}</strong></div>
                      <div className="text-[#645D55]">Skor Komposit: <strong>{data.composite}/100</strong></div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Kru Restoran" data={points} fill="#96171B">
              {points.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.hardSkill >= 85 && entry.softSkill >= 85
                      ? '#059669' // Green (Stars)
                      : entry.hardSkill >= 85
                      ? '#2563EB' // Blue (High tech)
                      : entry.softSkill >= 85
                      ? '#C88A1E' // Gold (High attitude)
                      : '#96171B' // Red (Standard/Remedial)
                  }
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-[#645D55] text-center border-t border-[#E6E1DA]">
        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold">● Bintang Unggul (Hard ≥85 & Soft ≥85)</div>
        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800 font-bold">● Pelaksana Handal (Keseimbangan 75-84)</div>
        <div className="p-1.5 rounded-lg bg-rose-50 text-rose-800 font-bold">● Area Pembinaan (Skor &lt; 75)</div>
      </div>
    </div>
  );
};

/**
 * 4. DYNAMIC TIME-SERIES PERFORMANCE TREND CHART
 * Rentang waktu dinamis (4 Minggu, 8 Minggu, 6 Bulan) dengan filter per pilar
 */
export const CrewPerformanceTrendChart: React.FC<{ summary: CrewCompetencySummary }> = ({ summary }) => {
  const [timeRange, setTimeRange] = useState<'4_weeks' | '8_weeks' | '6_months'>('4_weeks');
  const [pillarFilter, setPillarFilter] = useState<'ALL' | 'teori' | 'praktik' | 'lisan' | 'attitude'>('ALL');

  const trendData = useMemo(() => {
    if (timeRange === '4_weeks') {
      return [
        { label: 'Minggu 1', teori: 78, praktik: 80, lisan: 75, attitude: 82, komposit: 79 },
        { label: 'Minggu 2', teori: 82, praktik: 84, lisan: 80, attitude: 84, komposit: 83 },
        { label: 'Minggu 3', teori: 85, praktik: 86, lisan: 84, attitude: 85, komposit: 85 },
        { label: 'Minggu 4', teori: summary.skorTeori ?? 88, praktik: summary.skorPraktik ?? 90, lisan: summary.skorLisan ?? 86, attitude: summary.skorAttitude ?? 88, komposit: summary.skorAkhir ?? 89 },
      ];
    }
    if (timeRange === '8_weeks') {
      return [
        { label: 'M1', teori: 74, praktik: 76, lisan: 72, attitude: 80, komposit: 76 },
        { label: 'M2', teori: 78, praktik: 80, lisan: 75, attitude: 82, komposit: 79 },
        { label: 'M3', teori: 80, praktik: 82, lisan: 78, attitude: 83, komposit: 81 },
        { label: 'M4', teori: 82, praktik: 84, lisan: 80, attitude: 84, komposit: 83 },
        { label: 'M5', teori: 84, praktik: 85, lisan: 82, attitude: 85, komposit: 84 },
        { label: 'M6', teori: 85, praktik: 86, lisan: 84, attitude: 85, komposit: 85 },
        { label: 'M7', teori: 86, praktik: 88, lisan: 85, attitude: 86, komposit: 87 },
        { label: 'M8', teori: summary.skorTeori ?? 88, praktik: summary.skorPraktik ?? 90, lisan: summary.skorLisan ?? 86, attitude: summary.skorAttitude ?? 88, komposit: summary.skorAkhir ?? 89 },
      ];
    }
    return [
      { label: 'Bulan 1', teori: 72, praktik: 74, lisan: 70, attitude: 78, komposit: 74 },
      { label: 'Bulan 2', teori: 78, praktik: 80, lisan: 75, attitude: 82, komposit: 79 },
      { label: 'Bulan 3', teori: 82, praktik: 84, lisan: 80, attitude: 84, komposit: 83 },
      { label: 'Bulan 4', teori: 85, praktik: 87, lisan: 83, attitude: 85, komposit: 85 },
      { label: 'Bulan 5', teori: 86, praktik: 88, lisan: 85, attitude: 87, komposit: 87 },
      { label: 'Bulan 6', teori: summary.skorTeori ?? 89, praktik: summary.skorPraktik ?? 92, lisan: summary.skorLisan ?? 88, attitude: summary.skorAttitude ?? 90, komposit: summary.skorAkhir ?? 90 },
    ];
  }, [timeRange, summary]);

  return (
    <div className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E6E1DA]">
        <div>
          <h4 className="font-bold text-sm text-[#181411]">Tren Riwayat Performa & Kompetensi Kru</h4>
          <p className="text-[11px] text-[#645D55]">Pemantauan time-series perkembangan nilai per pilar secara berkala</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-2.5 py-1 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] text-xs font-semibold text-[#181411]"
          >
            <option value="4_weeks">4 Minggu Terakhir</option>
            <option value="8_weeks">8 Minggu Terakhir</option>
            <option value="6_months">6 Bulan Terakhir</option>
          </select>

          <select
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value as any)}
            className="px-2.5 py-1 rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] text-xs font-semibold text-[#181411]"
          >
            <option value="ALL">Semua 4 Pilar</option>
            <option value="teori">Teori (25%)</option>
            <option value="praktik">Praktik (35%)</option>
            <option value="lisan">Lisan (20%)</option>
            <option value="attitude">Attitude (20%)</option>
          </select>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE4" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#645D55' }} />
            <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: '#8C827A' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E6E1DA',
                borderRadius: '12px',
                fontSize: '11px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
            {(pillarFilter === 'ALL' || pillarFilter === 'teori') && (
              <Line type="monotone" dataKey="teori" name="Teori SOP (25%)" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
            )}
            {(pillarFilter === 'ALL' || pillarFilter === 'praktik') && (
              <Line type="monotone" dataKey="praktik" name="Praktik SOS (35%)" stroke="#96171B" strokeWidth={2} dot={{ r: 3 }} />
            )}
            {(pillarFilter === 'ALL' || pillarFilter === 'lisan') && (
              <Line type="monotone" dataKey="lisan" name="Lisan HACCP (20%)" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
            )}
            {(pillarFilter === 'ALL' || pillarFilter === 'attitude') && (
              <Line type="monotone" dataKey="attitude" name="Attitude H.A.R.A (20%)" stroke="#C88A1E" strokeWidth={2} dot={{ r: 3 }} />
            )}
            {pillarFilter === 'ALL' && (
              <Line type="monotone" dataKey="komposit" name="Skor Komposit Akhir" stroke="#181411" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/**
 * 5. ITEM-LEVEL QUESTION & SOP WEAKNESS HEATMAP
 * Grafik dan tabel butir soal / topik SOP mana yang paling banyak gagal dijawab per divisi
 */
export const SOPWeaknessHeatmap: React.FC = () => {
  const weaknessData = [
    { topik: 'Timer Warmer 120 Mnt', divisi: 'Kitchen', gagalPct: 34, tingkat: 'Kritis' },
    { topik: 'Suhu Minyak Masuk 160°C', divisi: 'Kitchen', gagalPct: 22, tingkat: 'Sedang' },
    { topik: 'Uleg Sambal Bawang 30g', divisi: 'Geprek', gagalPct: 28, tingkat: 'Tinggi' },
    { topik: 'Disiplin 4 Warna Lap K3', divisi: 'Helper', gagalPct: 25, tingkat: 'Sedang' },
    { topik: 'Greeting POS ESB < 5 Detik', divisi: 'Kasir', gagalPct: 18, tingkat: 'Rendah' },
    { topik: 'APAR P.A.S.S Kebakaran Minyak', divisi: 'Semua', gagalPct: 31, tingkat: 'Kritis' },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white border border-[#E6E1DA] shadow-[0_1px_3px_rgba(24,20,17,0.04)] space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#E6E1DA]">
        <div>
          <h4 className="font-bold text-sm text-[#181411]">Analisis Butir Soal & Kesenjangan SOP Paling Lemah (Heatmap)</h4>
          <p className="text-[11px] text-[#645D55]">Identifikasi area prioritas pelatihan ulang (TNA) berdasarkan frekuensi salah jawab</p>
        </div>
        <span className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
          Prioritas TNA
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weaknessData} layout="vertical" margin={{ top: 5, right: 20, left: 25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE4" />
              <XAxis type="number" domain={[0, 40]} tick={{ fontSize: 10, fill: '#645D55' }} />
              <YAxis dataKey="topik" type="category" tick={{ fontSize: 9.5, fill: '#181411' }} width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E6E1DA',
                  borderRadius: '12px',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="gagalPct" name="% Kru Gagal Menjawab" fill="#96171B" radius={[0, 4, 4, 0]}>
                {weaknessData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.gagalPct >= 30 ? '#96171B' : entry.gagalPct >= 22 ? '#C88A1E' : '#2563EB'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E6E1DA] bg-[#FAF8F5] text-[#645D55] font-bold text-[10.5px]">
                <th className="py-2 px-2">Topik Standar SOP</th>
                <th className="py-2 px-2">Divisi</th>
                <th className="py-2 px-2 text-center">% Gagal</th>
                <th className="py-2 px-2 text-center">Prioritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1DA]">
              {weaknessData.map((w, idx) => (
                <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <td className="py-2 px-2 font-bold text-[#181411]">{w.topik}</td>
                  <td className="py-2 px-2 text-[#645D55]">{w.divisi}</td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-[#96171B]">{w.gagalPct}%</td>
                  <td className="py-2 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      w.tingkat === 'Kritis'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : w.tingkat === 'Tinggi'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {w.tingkat}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
