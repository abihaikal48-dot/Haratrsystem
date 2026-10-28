import React, { useState } from 'react';
import {
  Sparkles, Flame, Award, CheckCircle2, ShieldCheck,
  Star, ChevronRight, Zap, Users, Utensils
} from 'lucide-react';

import { ChickenIcon, CashierIcon, ChiliIcon, BroomCleanIcon } from './ui/Icons';

export const Hara3DAnimationHero: React.FC = () => {
  const [activeStation, setActiveStation] = useState<number>(0);

  const stations = [
    {
      title: 'Kitchen & Fryer',
      tag: 'Suhu 170°C',
      desc: 'Penepungan keriting emas, deep frying presisi, kematangan merata hingga ke tulang.',
      icon: <ChickenIcon size={20} className="text-amber-800" />,
      color: 'from-red-600 to-amber-600',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
    },
    {
      title: 'Kasir & Front House',
      tag: 'Senyum & 90 Detik',
      desc: 'Pelayanan ramah bersemangat, kecepatan input kasir POS, dan ketepatan pesanan.',
      icon: <CashierIcon size={20} className="text-amber-800" />,
      color: 'from-amber-600 to-yellow-500',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      title: 'Stasiun Sambal Geprek',
      tag: 'Gramasi Presisi',
      desc: 'Racikan cabai segar terstandar, cobek ulek mantap, dan tingkat pedas konsisten.',
      icon: <ChiliIcon size={20} className="text-orange-800" />,
      color: 'from-orange-600 to-red-500',
      badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
    },
    {
      title: 'QC & Sanitasi Dapur',
      tag: 'HACCP & 5S',
      desc: 'Penyajian higienis, kebersihan meja saji, dan disiplin standar keamanan pangan.',
      icon: <BroomCleanIcon size={20} className="text-emerald-800" />,
      color: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  ];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E0F11] via-[#2D1216] to-[#4A171D] p-6 sm:p-8 text-white shadow-2xl border border-red-900/40 flex flex-col justify-between min-h-[520px]">
      
      {/* Background Soft Glows & Warm Lighting */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#96171B]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Subtle Pattern Grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #FFFFFF 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Top Banner Tag */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-amber-200">
          <Sparkles size={14} className="text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>HARA Squad &bull; Pusat Kru Juara</span>
        </div>

        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full text-[11px] font-medium text-stone-300 border border-white/10 backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Dapur & Outlet Aktif</span>
        </div>
      </div>

      {/* Center 3D Character Art & Animated Composition */}
      <div className="relative z-10 my-auto py-4 flex flex-col items-center">
        
        {/* Floating 3D Badges */}
        <div className="w-full max-w-md relative flex items-center justify-center">
          
          {/* Badge Kiri: Ayam Krispi */}
          <div className="absolute -left-2 sm:-left-4 top-2 sm:top-6 z-20 bg-white/95 text-stone-800 px-3 py-2 rounded-2xl shadow-xl border border-amber-200 flex items-center gap-2.5 animate-bounce" style={{ animationDuration: '3.5s' }}>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-lg shadow-inner">
              <ChickenIcon size={18} className="text-amber-800" />
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-800">SOP Frying</div>
              <div className="text-xs font-black text-stone-900">Suhu 170°C Presisi</div>
            </div>
          </div>

          {/* Badge Kanan: Sertifikasi Trainer */}
          <div className="absolute -right-2 sm:-right-4 bottom-4 sm:bottom-8 z-20 bg-white/95 text-stone-800 px-3 py-2 rounded-2xl shadow-xl border border-emerald-200 flex items-center gap-2.5 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-inner">
              <ShieldCheck size={18} />
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">Ujian Lapangan</div>
              <div className="text-xs font-black text-stone-900">100% Siap Bertugas</div>
            </div>
          </div>

          {/* 3D Stylized Character SVG Graphic */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            
            {/* Background 3D Radial Aura */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-[#96171B] to-[#E9A825] opacity-30 blur-2xl animate-pulse" />

            <svg
              viewBox="0 0 320 320"
              className="w-full h-full drop-shadow-2xl select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* 3D Skin Tone Gradient */}
                <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFDFC4" />
                  <stop offset="70%" stopColor="#F0B88A" />
                  <stop offset="100%" stopColor="#D99763" />
                </linearGradient>

                {/* 3D Uniform Crimson Gradient */}
                <linearGradient id="crimson3D" x1="0" y1="0" x2="0.8" y2="1">
                  <stop offset="0%" stopColor="#D9222A" />
                  <stop offset="50%" stopColor="#96171B" />
                  <stop offset="100%" stopColor="#5E0B0F" />
                </linearGradient>

                {/* 3D Gold Accent */}
                <linearGradient id="gold3D" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFE484" />
                  <stop offset="50%" stopColor="#F5B731" />
                  <stop offset="100%" stopColor="#C98616" />
                </linearGradient>

                {/* Crispy Chicken Frying Gradient */}
                <linearGradient id="friedChicken" x1="0.2" y1="0" x2="0.8" y2="1">
                  <stop offset="0%" stopColor="#FCD34D" />
                  <stop offset="40%" stopColor="#F59E0B" />
                  <stop offset="80%" stopColor="#B45309" />
                  <stop offset="100%" stopColor="#78350F" />
                </linearGradient>

                {/* Deep 3D Shadow Filter */}
                <filter id="shadow3D" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000000" floodOpacity="0.45" />
                </filter>
              </defs>

              {/* Pedestal / Podium 3D */}
              <ellipse cx="160" cy="275" rx="110" ry="22" fill="#14080A" opacity="0.8" />
              <ellipse cx="160" cy="270" rx="90" ry="16" fill="url(#crimson3D)" opacity="0.35" />

              {/* ========================================================
                  CHARACTER 1: THE FRIENDLY KITCHEN CHEF CREW (LEFT-CENTER)
                  ======================================================== */}
              <g filter="url(#shadow3D)">
                
                {/* Body / Torso & Apron */}
                <path
                  d="M 90 270 L 90 195 C 90 180 105 170 120 170 L 160 170 C 175 170 190 180 190 195 L 190 270 Z"
                  fill="url(#crimson3D)"
                />
                
                {/* White Inner Chef Shirt Collar */}
                <path d="M 125 170 L 140 192 L 155 170 Z" fill="#FFFFFF" />
                <path d="M 140 192 L 140 215" stroke="#DDD8CE" strokeWidth="2" strokeLinecap="round" />

                {/* Golden Apron Pocket & Utensil */}
                <rect x="115" y="215" width="50" height="34" rx="8" fill="#781014" stroke="#D9A027" strokeWidth="1.5" />
                <path d="M 125 210 L 125 225" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 132 208 L 132 225" stroke="#D9A027" strokeWidth="2.5" strokeLinecap="round" />

                {/* HARA Star Emblem on Apron */}
                <circle cx="150" cy="230" r="5" fill="url(#gold3D)" />
                <path d="M 150 227 L 151 229 L 153 229 L 151.5 230.5 L 152 233 L 150 231.5 L 148 233 L 148.5 230.5 L 147 229 L 149 229 Z" fill="#781014" />

                {/* Head & Neck */}
                <rect x="131" y="152" width="18" height="22" rx="6" fill="url(#skinGrad)" />
                <ellipse cx="140" cy="130" rx="34" ry="38" fill="url(#skinGrad)" />

                {/* Hair & Sideburns */}
                <path
                  d="M 110 125 C 108 95 125 85 140 85 C 158 85 172 95 170 125 C 165 105 150 96 140 96 C 128 96 115 105 110 125 Z"
                  fill="#1C1917"
                />

                {/* 3D Chef Cap (Topi Chef HARA) */}
                <path
                  d="M 112 108 C 112 90 125 78 140 78 C 155 78 168 90 168 108 Z"
                  fill="#292524"
                />
                <rect x="110" y="104" width="60" height="12" rx="4" fill="url(#crimson3D)" stroke="#D9A027" strokeWidth="1" />
                
                {/* Cap HARA Badge */}
                <circle cx="140" cy="110" r="3.5" fill="url(#gold3D)" />

                {/* Happy Face (Eyes, Eyebrows, Cheerful Smile) */}
                {/* Eyebrows */}
                <path d="M 122 116 Q 128 113 133 116" stroke="#292524" strokeWidth="2" strokeLinecap="round" />
                <path d="M 147 116 Q 152 113 158 116" stroke="#292524" strokeWidth="2" strokeLinecap="round" />
                
                {/* 3D Animated Friendly Curved Eyes */}
                <path d="M 123 124 Q 128 119 133 124" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" />
                <path d="M 147 124 Q 152 119 157 124" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" />

                {/* Blushing Cheeks */}
                <ellipse cx="120" cy="132" rx="5" ry="3.5" fill="#F43F5E" opacity="0.35" />
                <ellipse cx="160" cy="132" rx="5" ry="3.5" fill="#F43F5E" opacity="0.35" />

                {/* Broad Warm Smile with White Teeth */}
                <path
                  d="M 128 135 Q 140 150 152 135 Z"
                  fill="#7F1D1D"
                />
                <path
                  d="M 131 136 Q 140 142 149 136"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Left Arm: Thumbs Up */}
                <path
                  d="M 98 185 Q 75 195 72 220"
                  stroke="url(#crimson3D)"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                {/* 3D Fist & Thumbs Up */}
                <circle cx="72" cy="222" r="9" fill="url(#skinGrad)" />
                <rect x="67" y="210" width="8" height="14" rx="4" fill="url(#skinGrad)" />

                {/* Right Arm: Holding Golden Crispy Fried Chicken Piece */}
                <path
                  d="M 182 185 Q 205 198 208 225"
                  stroke="url(#crimson3D)"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <circle cx="208" cy="225" r="9" fill="url(#skinGrad)" />

                {/* 3D Golden Crunchy Drumstick */}
                <g transform="translate(195, 175) rotate(-15)">
                  {/* Bone handle */}
                  <path d="M 18 45 L 18 58" stroke="#F8FAFC" strokeWidth="6" strokeLinecap="round" />
                  <circle cx="15" cy="60" r="3.5" fill="#F1F5F9" />
                  <circle cx="21" cy="60" r="3.5" fill="#F1F5F9" />

                  {/* Crispy golden meat bulb with crunchy 3D texture */}
                  <ellipse cx="18" cy="30" rx="16" ry="20" fill="url(#friedChicken)" />
                  <circle cx="12" cy="22" r="5" fill="#FDE68A" opacity="0.6" />
                  <circle cx="23" cy="32" r="4" fill="#B45309" opacity="0.5" />
                  <circle cx="16" cy="38" r="6" fill="#F59E0B" />

                  {/* Crispy crumbs sparks */}
                  <circle cx="28" cy="18" r="2" fill="#FCD34D" />
                  <circle cx="6" cy="26" r="1.5" fill="#FCD34D" />
                  <circle cx="24" cy="40" r="2" fill="#F59E0B" />

                  {/* Hot Steam Wafting Up */}
                  <path
                    d="M 12 12 Q 10 4 15 0"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                  <path
                    d="M 20 14 Q 24 6 18 2"
                    stroke="#FFFFFF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </g>
              </g>

              {/* ========================================================
                  CHARACTER 2: ENTHUSIASTIC TRAINER WITH TABLET (RIGHT)
                  ======================================================== */}
              <g filter="url(#shadow3D)">
                {/* Trainer Body */}
                <path
                  d="M 215 270 L 215 210 C 215 195 228 185 242 185 L 268 185 C 282 185 295 195 295 210 L 295 270 Z"
                  fill="#1E293B"
                />

                {/* Trainer Neck & Head */}
                <rect x="246" y="165" width="16" height="20" rx="5" fill="url(#skinGrad)" />
                <ellipse cx="254" cy="142" rx="26" ry="30" fill="url(#skinGrad)" />

                {/* Trainer Hair (Neat Modern Style) */}
                <path
                  d="M 230 138 C 228 112 245 105 258 105 C 274 105 282 115 280 138 C 275 120 264 114 254 114 C 242 114 234 122 230 138 Z"
                  fill="#0F172A"
                />

                {/* Trainer Face Details */}
                <path d="M 238 132 Q 244 128 248 132" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                <path d="M 258 132 Q 264 128 270 132" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                
                <ellipse cx="244" cy="138" rx="2.5" ry="3.5" fill="#1E293B" />
                <ellipse cx="264" cy="138" rx="2.5" ry="3.5" fill="#1E293B" />
                <circle cx="245" cy="136" r="1" fill="#FFFFFF" />
                <circle cx="265" cy="136" r="1" fill="#FFFFFF" />

                <path d="M 246 148 Q 254 158 262 148" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round" />

                {/* Trainer Lanyard & ID Badge */}
                <path d="M 244 185 L 254 205 L 264 185" stroke="#D9222A" strokeWidth="3" fill="none" />
                <rect x="246" y="205" width="16" height="18" rx="3" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
                <rect x="249" y="209" width="10" height="2" fill="#D9222A" />
                <rect x="249" y="213" width="7" height="2" fill="#64748B" />

                {/* Digital Checklist Tablet Held by Trainer */}
                <rect
                  x="215"
                  y="200"
                  width="44"
                  height="56"
                  rx="6"
                  fill="#0F172A"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                />
                <rect x="219" y="204" width="36" height="48" rx="4" fill="#FFFFFF" />
                
                {/* Tablet checklist lines */}
                <rect x="223" y="210" width="12" height="3" rx="1.5" fill="#96171B" />
                <path d="M 223 218 L 225 220 L 229 216" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="232" y="217" width="18" height="2" rx="1" fill="#94A3B8" />

                <path d="M 223 226 L 225 228 L 229 224" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="232" y="225" width="15" height="2" rx="1" fill="#94A3B8" />

                <path d="M 223 234 L 225 236 L 229 232" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="232" y="233" width="19" height="2" rx="1" fill="#94A3B8" />

                {/* Gold Score 100 on Tablet */}
                <circle cx="237" cy="244" r="5" fill="url(#gold3D)" />
                <text x="237" y="246" textAnchor="middle" fontSize="5" fontWeight="900" fill="#781014">★</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Dynamic Title Under Illustration */}
        <div className="text-center mt-3 space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Semangat Juara Kru HARA Chicken
          </h2>
          <p className="text-xs text-amber-100/80 max-w-sm mx-auto leading-relaxed">
            Standar resep emas, kebersihan dapur tanpa kompromi, dan senyum ramah melayani di seluruh outlet.
          </p>
        </div>
      </div>

      {/* Interactive Stasiun Kerja Highlights */}
      <div className="relative z-10 pt-4 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-amber-200/90">
          <span>Stasiun Kerja Operasional Kru</span>
          <span className="text-[10px] text-stone-400 font-normal">Klik untuk lihat standar</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stations.map((st, idx) => {
            const isSel = activeStation === idx;
            return (
              <button
                key={st.title}
                type="button"
                onClick={() => setActiveStation(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSel
                    ? 'bg-white text-stone-900 border-white shadow-lg scale-[1.02]'
                    : 'bg-black/30 hover:bg-black/50 text-stone-300 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{st.icon}</span>
                  {isSel && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                </div>
                <div className="mt-1 font-bold text-xs truncate">
                  {st.title}
                </div>
                <div className={`text-[10px] truncate ${isSel ? 'text-stone-500 font-medium' : 'text-stone-400'}`}>
                  {st.tag}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Station Explanation */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-stone-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm shrink-0">{stations[activeStation].icon}</span>
            <span className="text-[11.5px] truncate text-amber-100">
              <b>{stations[activeStation].title}:</b> {stations[activeStation].desc}
            </span>
          </div>
          <span className="shrink-0 text-[10px] font-mono bg-white/15 px-2 py-0.5 rounded-md font-semibold text-amber-200">
            {stations[activeStation].tag}
          </span>
        </div>
      </div>

    </div>
  );
};
