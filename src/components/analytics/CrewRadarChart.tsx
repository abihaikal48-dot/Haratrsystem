import React from 'react';
import { CrewRadarData } from '../../types';

interface CrewRadarChartProps {
  data: CrewRadarData;
  size?: number;
  className?: string;
  showLabels?: boolean;
}

export const CrewRadarChart: React.FC<CrewRadarChartProps> = ({
  data,
  size = 320,
  className = '',
  showLabels = true,
}) => {
  const center = size / 2;
  const radius = (size / 2) * 0.72;

  // 5 Sumbu Kompetensi Objektif
  const axes = [
    { label: 'Teori SOP (25%)', key: 'teori_sop', value: data.teori_sop },
    { label: 'Praktik Jobdesk (35%)', key: 'praktik_jobdesk', value: data.praktik_jobdesk },
    { label: 'Sikap H.A.R.A (25%)', key: 'sikap_hara', value: data.sikap_hara },
    { label: 'Kecepatan SOS', key: 'kecepatan_sos', value: data.kecepatan_sos ?? 85 },
    { label: 'Ketahanan Jam Sibuk (15%)', key: 'ketahanan_rush', value: data.ketahanan_rush },
  ];

  const totalAxes = axes.length;
  const angleStep = (Math.PI * 2) / totalAxes;

  // Helper untuk konversi nilai polar ke kartesius
  const getCoordinates = (value: number, index: number, maxVal = 100) => {
    const angle = index * angleStep - Math.PI / 2; // Mulai dari atas jam 12
    const distance = (value / maxVal) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  // Koordinat polygon data aktual kru
  const polygonPoints = axes
    .map((axis, i) => {
      const { x, y } = getCoordinates(axis.value, i);
      return `${x},${y}`;
    })
    .join(' ');

  // Lingkaran konsentris standar (25%, 50%, 75%, 100%)
  const concentricLevels = [25, 50, 75, 100];

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible drop-shadow-sm"
      >
        <defs>
          <linearGradient id="radarCrimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B1418" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.25" />
          </linearGradient>

          <filter id="radarPointGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#8B1418" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* 1. Grid Polygon Konsentris (Background Levels) */}
        {concentricLevels.map((lvl) => {
          const levelPoints = axes
            .map((_, i) => {
              const { x, y } = getCoordinates(lvl, i);
              return `${x},${y}`;
            })
            .join(' ');

          return (
            <g key={lvl}>
              <polygon
                points={levelPoints}
                fill={lvl === 100 ? '#FAF8F5' : 'transparent'}
                stroke="#E2DDD4"
                strokeWidth={lvl === 100 ? '1.5' : '1'}
                strokeDasharray={lvl < 100 ? '2,2' : undefined}
              />
              {/* Tanda Angka Metrik di sumbu vertikal */}
              <text
                x={center + 4}
                y={center - (lvl / 100) * radius + 3}
                fill="#94A3B8"
                fontSize="8.5"
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="500"
              >
                {lvl}
              </text>
            </g>
          );
        })}

        {/* 2. Garis Sumbu Radial dari Pusat */}
        {axes.map((_, i) => {
          const { x, y } = getCoordinates(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#CBD5E1"
              strokeWidth="1"
            />
          );
        })}

        {/* 3. Poligon Area Data Radar Kru */}
        <polygon
          points={polygonPoints}
          fill="url(#radarCrimsonGrad)"
          stroke="#8B1418"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* 4. Titik-titik Poin Data */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(axis.value, i);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r="4.5"
                fill="#FFFFFF"
                stroke="#8B1418"
                strokeWidth="2"
                filter="url(#radarPointGlow)"
              />
              <circle cx={x} cy={y} r="2" fill="#D97706" />
            </g>
          );
        })}

        {/* 5. Label Sumbu Interaktif */}
        {showLabels &&
          axes.map((axis, i) => {
            const labelCoord = getCoordinates(120, i);
            const isTop = i === 0;
            const isRight = i === 1 || i === 2;
            const isLeft = i === 3 || i === 4;

            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            if (isRight) textAnchor = 'start';
            if (isLeft) textAnchor = 'end';

            return (
              <g key={axis.key} transform={`translate(${labelCoord.x}, ${labelCoord.y})`}>
                <text
                  x={0}
                  y={0}
                  textAnchor={textAnchor}
                  fill="#1E293B"
                  fontSize="10"
                  fontFamily="'Outfit', 'Plus Jakarta Sans', sans-serif"
                  fontWeight="700"
                >
                  {axis.label}
                </text>
                <text
                  x={0}
                  y={13}
                  textAnchor={textAnchor}
                  fill="#8B1418"
                  fontSize="11"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="800"
                >
                  {axis.value} Poin
                </text>
              </g>
            );
          })}
      </svg>

      {/* Ringkasan Skor di Bawah Radar */}
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="font-semibold text-stone-500">Skor Komposit Objektif:</span>
        <span className="font-mono font-black text-sm text-[#8B1418]">
          {data.skor_komposit} / 100
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            data.status_kelulusan === 'Kompeten Mandiri'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : data.status_kelulusan === 'Butuh Pendampingan'
              ? 'bg-amber-50 text-amber-800 border border-amber-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {data.status_kelulusan}
        </span>
      </div>
    </div>
  );
};
