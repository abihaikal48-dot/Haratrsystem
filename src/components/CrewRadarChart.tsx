import React from 'react';

interface PillarScore {
  name: string;
  score: number; // 0 - 100
  weight: number; // percentage e.g. 25
  benchmark?: number; // target e.g. 80
}

interface RadarAxisItem {
  axis: string;
  score: number;
  benchmark?: number;
  weight?: number;
}

interface CrewRadarChartProps {
  teoriScore?: number;
  praktikScore?: number;
  lisanScore?: number;
  observasiScore?: number;
  axes?: RadarAxisItem[];
  size?: number;
  showLabels?: boolean;
}

export const CrewRadarChart: React.FC<CrewRadarChartProps> = ({
  teoriScore = 85,
  praktikScore = 90,
  lisanScore = 75,
  observasiScore = 88,
  axes,
  size = 260,
  showLabels = true,
}) => {
  const center = size / 2;
  const radius = (size / 2) - (showLabels ? 42 : 12);

  const pillars: PillarScore[] = axes && axes.length >= 3
    ? axes.map(a => ({
        name: a.axis,
        score: Math.min(100, Math.max(0, a.score)),
        weight: a.weight || 0,
        benchmark: a.benchmark || 80,
      }))
    : [
        { name: 'Teori SOP (25%)', score: Math.min(100, Math.max(0, teoriScore)), weight: 25, benchmark: 80 },
        { name: 'Praktik & SOS (35%)', score: Math.min(100, Math.max(0, praktikScore)), weight: 35, benchmark: 85 },
        { name: 'Lisan & HACCP (20%)', score: Math.min(100, Math.max(0, lisanScore)), weight: 20, benchmark: 75 },
        { name: 'Observasi & Budaya (20%)', score: Math.min(100, Math.max(0, observasiScore)), weight: 20, benchmark: 80 },
      ];

  const totalPillars = pillars.length;
  const angleStep = (Math.PI * 2) / totalPillars;

  // Convert polar coordinates to Cartesian
  const getCoordinates = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Concentric polygon web lines (25%, 50%, 75%, 100%)
  const webLevels = [25, 50, 75, 100];
  const gridPolygons = webLevels.map((level) => {
    return pillars
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x},${y}`;
      })
      .join(' ');
  });

  // Target Benchmark polygon
  const benchmarkPoints = pillars
    .map((p, i) => {
      const { x, y } = getCoordinates(i, p.benchmark || 80);
      return `${x},${y}`;
    })
    .join(' ');

  // Actual Crew Score polygon
  const scorePoints = pillars
    .map((p, i) => {
      const { x, y } = getCoordinates(i, p.score);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Background Grid Web */}
        {gridPolygons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill={idx === 3 ? '#F8FAFC' : 'none'}
            stroke="#E2E8F0"
            strokeWidth={1}
            strokeDasharray={idx < 3 ? '2 2' : 'none'}
          />
        ))}

        {/* Axis Lines */}
        {pillars.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#CBD5E1"
              strokeWidth={1}
            />
          );
        })}

        {/* Benchmark Shape (Standard Target HARA) */}
        <polygon
          points={benchmarkPoints}
          fill="none"
          stroke="#94A3B8"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />

        {/* Actual Crew Score Area */}
        <polygon
          points={scorePoints}
          fill="rgba(150, 23, 27, 0.18)"
          stroke="#96171B"
          strokeWidth={2.5}
        />

        {/* Score Nodes */}
        {pillars.map((p, i) => {
          const { x, y } = getCoordinates(i, p.score);
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={4.5}
                fill="#96171B"
                stroke="#FFFFFF"
                strokeWidth={2}
                className="drop-shadow-xs"
              />
            </g>
          );
        })}

        {/* Labels at Vertices */}
        {showLabels &&
          pillars.map((p, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = radius + 22;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);

            let textAnchor: 'middle' | 'start' | 'end' = 'middle';
            if (Math.abs(Math.cos(angle)) > 0.3) {
              textAnchor = Math.cos(angle) > 0 ? 'start' : 'end';
            }

            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor={textAnchor}
                className="text-[10px] font-bold fill-stone-700"
                dominantBaseline="central"
              >
                {p.name} ({p.score}%)
              </text>
            );
          })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-[10px] font-semibold text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#96171B]" />
          <span>Skor Aktual Kru</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-400" />
          <span>Standar Minimum (80%)</span>
        </span>
      </div>
    </div>
  );
};
