import React, { useState } from 'react';
import {
  Sparkles, Award, TrendingUp, Users, CheckCircle2,
  Flame, BookOpen, Star, ShieldCheck, HeartHandshake,
  Zap, ChefHat, UserCheck, Smartphone, Target, Sun
} from 'lucide-react';

interface TrainerHeroIllustrationProps {
  className?: string;
}

export const TrainerHeroIllustration: React.FC<TrainerHeroIllustrationProps> = ({
  className = '',
}) => {
  const [activeMascot, setActiveMascot] = useState<number | null>(null);

  const squadList = [
    {
      id: 0,
      roleName: 'Kitchen Master',
      mascotName: 'Kru Kitchen (Laki-laki)',
      attire: 'Topi Kitchen Hitam + Seragam Merah + Apron Dada Penuh',
      badge: 'Suhu 170°C & Krispi',
      color: 'bg-red-500/20 text-red-300 border-red-400/30',
      sopFocus: 'Deep Fryer 170°C, Penepungan Keriting & Kerenyahan Standar Baku',
    },
    {
      id: 1,
      roleName: 'Front Kasir & Hospitality',
      mascotName: 'Kru Kasir (Wanita)',
      attire: 'Hijab Kuning + Seragam Kuning + Apron Setengah Badan',
      badge: 'POS & Kultur RESPECT',
      color: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      sopFocus: 'Greeting Ramah, Transaksi POS Cepat < 90 Detik & Ketelitian Kasir',
    },
    {
      id: 2,
      roleName: 'Stasiun Geprek',
      mascotName: 'Kru Geprek (Laki-laki)',
      attire: 'Topi Kitchen Hitam + Apron Dada + Cobek Ulekan',
      badge: 'Level Pedas & Cobek',
      color: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
      sopFocus: 'Teknik Ulek Mantap, Gramasi Cabai Standar & Penyajian Hangat',
    },
    {
      id: 3,
      roleName: 'Geprek & QC Saji',
      mascotName: 'Kru Saji (Wanita)',
      attire: 'Hijab Kuning + Seragam Merah + Apron Dada + Piring Saji',
      badge: 'Plating & Food Safety',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      sopFocus: 'Standar Plating Higienis, Kecepatan Saji & Checklist Kualitas',
    },
  ];

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E110A] via-[#2A160F] to-[#40161A] p-5 sm:p-7 text-white shadow-2xl border border-amber-500/30 ${className}`}>
      
      {/* Ghibli Ambient Warm Sunbeams & Watercolor Bloom */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FBD66A]/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#96171B]/35 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle Hand-Drawn Watercolor Canvas Texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #ffffff 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-5">
        
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/25 via-red-500/25 to-amber-500/25 border border-amber-400/40 backdrop-blur-md shadow-lg shadow-black/40">
            <Sparkles size={14} className="text-[#FBD66A] animate-spin" style={{ animationDuration: '10s' }} />
            <span className="text-[11px] font-black tracking-wider text-[#FBD66A] uppercase drop-shadow-xs">
              Studio Ghibli Art • Hara Trainer Academy
            </span>
          </div>

          <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-1 rounded-full text-[10.5px] text-slate-300 font-bold backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-300">Suasana Hangat Dapur Hara</span>
            <span className="text-slate-500">•</span>
            <span className="text-[#FBD66A] font-black">Multi-Outlet Team</span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            Kehangatan Kerjasama & Dedikasi Kru Hara Fried Chicken
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/85 font-medium leading-relaxed max-w-2xl">
            Seni pelayanan tulus dan cita rasa legendaris: <b>Kitchen (Topi Hitam & Apron Penuh)</b>, <b>Kasir (Hijab & Apron Setengah)</b>, serta <b>Stasiun Geprek (Cobek Ulek & Piring Saji)</b>.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* STUDIO GHIBLI INSPIRED ANIME SCENIC ILLUSTRATION */}
        {/* Hand-painted aesthetic, rich warm lighting, soft atmospheric dust motes */}
        {/* ========================================================================= */}
        <div className="relative my-2 py-1 flex items-center justify-center">
          
          <svg
            viewBox="0 0 1080 480"
            className="w-full max-w-4xl h-auto drop-shadow-[0_25px_40px_rgba(0,0,0,0.7)] select-none rounded-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Ghibli Sky & Warm Kitchen Interior Gradients */}
              <linearGradient id="ghibliSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2E1B13" />
                <stop offset="50%" stopColor="#3D2118" />
                <stop offset="100%" stopColor="#24140F" />
              </linearGradient>

              {/* Sunbeam Crepuscular Rays */}
              <linearGradient id="sunRay" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF4D0" stopOpacity="0.25" />
                <stop offset="70%" stopColor="#FBD66A" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#FBD66A" stopOpacity="0" />
              </linearGradient>

              {/* Ghibli Painterly Skin Tones with Soft Peach Blush */}
              <radialGradient id="ghibliSkinMale" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FFF4EA" />
                <stop offset="60%" stopColor="#F8D9C0" />
                <stop offset="90%" stopColor="#E6B494" />
                <stop offset="100%" stopColor="#C98B66" />
              </radialGradient>

              <radialGradient id="ghibliSkinFemale" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#FFF7F0" />
                <stop offset="55%" stopColor="#FCE0CE" />
                <stop offset="88%" stopColor="#EDB898" />
                <stop offset="100%" stopColor="#D4936F" />
              </radialGradient>

              {/* Ghibli Luscious Crispy Fried Chicken (Glistening & Golden) */}
              <radialGradient id="ghibliCrispy" cx="30%" cy="25%" r="75%">
                <stop offset="0%" stopColor="#FFF6B8" />
                <stop offset="25%" stopColor="#F7C948" />
                <stop offset="60%" stopColor="#D97706" />
                <stop offset="85%" stopColor="#9A3412" />
                <stop offset="100%" stopColor="#5C1D08" />
              </radialGradient>

              {/* Sambal Bawang Ulek Fresh & Glossy */}
              <radialGradient id="ghibliSambal" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FF7A7A" />
                <stop offset="35%" stopColor="#EF4444" />
                <stop offset="70%" stopColor="#B91C1C" />
                <stop offset="100%" stopColor="#580C0C" />
              </radialGradient>

              {/* Volcanic Stone Cobek */}
              <radialGradient id="stoneCobek" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#525E75" />
                <stop offset="55%" stopColor="#334155" />
                <stop offset="90%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </radialGradient>

              {/* Soft Ghibli Shadow Filter */}
              <filter id="ghibliShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0B0503" floodOpacity="0.6" />
              </filter>
              
              {/* Steamy Glow */}
              <filter id="steamGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Realistic Ghibli Hijab Fabric Gradients */}
              <linearGradient id="hijabGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF2A3" />
                <stop offset="35%" stopColor="#FBBF24" />
                <stop offset="75%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>

              <linearGradient id="hijabGoldDrape" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              <linearGradient id="innerCiput" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#991B1B" />
                <stop offset="70%" stopColor="#7F1D1D" />
                <stop offset="100%" stopColor="#450A0A" />
              </linearGradient>
            </defs>

            {/* Background Kitchen Scenery (Ghibli Wooden Architecture) */}
            <rect x="0" y="0" width="1080" height="480" rx="20" fill="url(#ghibliSky)" />
            
            {/* Wooden Kitchen Beams & Shelves */}
            <rect x="0" y="0" width="1080" height="40" fill="#20110B" />
            <rect x="0" y="38" width="1080" height="6" fill="#140A06" />
            <line x1="180" y1="0" x2="180" y2="40" stroke="#120905" strokeWidth="6" />
            <line x1="540" y1="0" x2="540" y2="40" stroke="#120905" strokeWidth="6" />
            <line x1="900" y1="0" x2="900" y2="40" stroke="#120905" strokeWidth="6" />

            {/* Brass Utensils & Herb Pots on Upper Shelf */}
            <g opacity="0.6">
              {/* Copper Pot */}
              <circle cx="210" cy="24" r="12" fill="#D97706" />
              <rect x="202" y="10" width="16" height="4" fill="#B45309" />
              {/* Ceramic Jars */}
              <rect x="350" y="14" width="18" height="24" rx="4" fill="#F8FAFC" />
              <rect x="374" y="18" width="14" height="20" rx="3" fill="#E2E8F0" />
              {/* Plant Pot */}
              <rect x="720" y="18" width="22" height="18" rx="2" fill="#B45309" />
              <circle cx="728" cy="14" r="6" fill="#22C55E" />
              <circle cx="736" cy="12" r="7" fill="#16A34A" />
              <circle cx="724" cy="10" r="5" fill="#4ADE80" />
            </g>

            {/* Crepuscular Sunbeams (Warm Light Rays) */}
            <polygon points="0,0 240,0 480,480 120,480" fill="url(#sunRay)" />
            <polygon points="400,0 650,0 880,480 550,480" fill="url(#sunRay)" />

            {/* Atmospheric Floating Light Motes (Ghibli Magic Dust) */}
            <circle cx="160" cy="120" r="2" fill="#FFF4D0" opacity="0.8" />
            <circle cx="220" cy="190" r="1.5" fill="#FBD66A" opacity="0.6" />
            <circle cx="480" cy="130" r="2.5" fill="#FFF4D0" opacity="0.9" />
            <circle cx="560" cy="180" r="1.5" fill="#FBD66A" opacity="0.7" />
            <circle cx="820" cy="110" r="2" fill="#FFF4D0" opacity="0.8" />
            <circle cx="910" cy="160" r="1.5" fill="#FBD66A" opacity="0.6" />

            {/* Cozy Wooden Floor & Warm Base Stage */}
            <ellipse cx="540" cy="445" rx="520" ry="32" fill="#160C08" />
            <ellipse cx="140" cy="438" rx="100" ry="16" fill="#0D0604" opacity="0.7" />
            <ellipse cx="390" cy="438" rx="110" ry="16" fill="#0D0604" opacity="0.7" />
            <ellipse cx="650" cy="438" rx="110" ry="16" fill="#0D0604" opacity="0.7" />
            <ellipse cx="910" cy="438" rx="100" ry="16" fill="#0D0604" opacity="0.7" />

            {/* ========================================================================= */}
            {/* GHIBLI CHARACTER 1: KITCHEN MAN (Laki-laki Kitchen) */}
            {/* Topi Kitchen Hitam + Kaos Merah + Apron Dada Penuh + Capitan Ayam Krispi Panas */}
            {/* ========================================================================= */}
            <g
              transform="translate(45, 75)"
              filter="url(#ghibliShadow)"
              className="cursor-pointer transition-all duration-300 hover:translate-y-[-6px]"
              onClick={() => setActiveMascot(0)}
            >
              {/* Legs & Dark Burgundy Pants */}
              <path d="M 52 220 L 44 300 L 70 300 L 76 220 Z" fill="#6B1D2F" stroke="#2B0C13" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M 86 220 L 92 300 L 118 300 L 108 220 Z" fill="#6B1D2F" stroke="#2B0C13" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Leather Kitchen Work Shoes */}
              <path d="M 36 295 C 36 284 72 284 72 310 L 36 310 Z" fill="#96171B" stroke="#2B0C13" strokeWidth="2.5" />
              <path d="M 90 295 C 90 284 126 284 126 310 L 90 310 Z" fill="#96171B" stroke="#2B0C13" strokeWidth="2.5" />

              {/* Red Hara Shirt with Soft Cloth Folds */}
              <path d="M 38 145 C 38 145 28 165 36 225 C 55 230 108 230 124 225 C 132 165 122 145 122 145 Z" fill="#D92626" stroke="#5E0F0F" strokeWidth="2.5" />
              
              {/* FULL KITCHEN BIB APRON (Apron Dada Penuh Warna Burgundy + Jahitan Halus) */}
              <path d="M 52 150 L 108 150 L 118 240 L 42 240 Z" fill="#781822" stroke="#38080D" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Apron Neck Loop & Waist Tie */}
              <path d="M 64 150 Q 80 132 96 150" stroke="#38080D" strokeWidth="3" fill="none" />
              <line x1="42" y1="202" x2="118" y2="202" stroke="#581017" strokeWidth="2" strokeDasharray="4 2" />
              {/* Apron Pocket with Logo */}
              <rect x="60" y="178" width="40" height="30" rx="4" fill="#8E1F2A" stroke="#38080D" strokeWidth="2" />
              <text x="80" y="194" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="900" fontStyle="italic">HARA</text>
              <circle cx="80" cy="201" r="2.5" fill="#FBD66A" />

              {/* Left Arm: Holding Stainless Tongs with Glistening Ghibli Fried Chicken */}
              <path d="M 38 152 L 12 180 L 22 205" stroke="#D92626" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="205" r="10" fill="url(#ghibliSkinMale)" stroke="#2B0C13" strokeWidth="2" />
              {/* Tongs */}
              <path d="M 14 205 L 4 170 M 26 205 L 16 170" stroke="#CBD5E1" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 4 170 Q 10 160 16 170" stroke="#CBD5E1" strokeWidth="3.5" fill="none" />
              {/* Luscious Crispy Fried Chicken (Ghibli Style) */}
              <g transform="translate(-10, 142)">
                <path d="M 12 14 C 8 2 26 -6 36 4 C 46 -2 50 12 40 22 C 30 28 16 26 12 14 Z" fill="url(#ghibliCrispy)" stroke="#451205" strokeWidth="2.5" />
                {/* Crunchy Glistening Crumb Highlights */}
                <circle cx="22" cy="6" r="2" fill="#FFFBEB" />
                <circle cx="34" cy="12" r="1.5" fill="#FFFBEB" />
                <circle cx="28" cy="18" r="1.5" fill="#FFFBEB" />
                {/* Shimmering Steam Wisps */}
                <path d="M 22 -2 Q 26 -12 20 -20 M 34 2 Q 38 -8 32 -16" stroke="#FFF7ED" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" filter="url(#steamGlow)" fill="none" />
              </g>

              {/* Right Arm: Warm Thumbs Up */}
              <path d="M 120 152 L 146 175 L 136 195" stroke="#D92626" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="138" cy="195" r="10" fill="url(#ghibliSkinMale)" stroke="#2B0C13" strokeWidth="2" />
              <path d="M 138 190 L 138 178" stroke="url(#ghibliSkinMale)" strokeWidth="4.5" strokeLinecap="round" />

              {/* Head & Neck */}
              <rect x="71" y="125" width="18" height="15" fill="url(#ghibliSkinMale)" />
              <circle cx="80" cy="112" r="34" fill="url(#ghibliSkinMale)" stroke="#2B0C13" strokeWidth="2.5" />

              {/* BLACK KITCHEN SKULL CAP (Topi Kitchen Warna Hitam Ghibli) */}
              <path
                d="M 46 104 C 44 68 58 50 80 50 C 102 50 116 68 114 104 Z"
                fill="#1E1E24"
                stroke="#0A0A0C"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <rect x="44" y="94" width="72" height="14" rx="3" fill="#121216" stroke="#0A0A0C" strokeWidth="2" />
              <line x1="48" y1="101" x2="112" y2="101" stroke="#96171B" strokeWidth="2" />
              
              {/* Soft Anime Hair Tufts Under Cap */}
              <path d="M 46 106 Q 52 118 48 126" stroke="#1A1311" strokeWidth="4" strokeLinecap="round" />
              <path d="M 114 106 Q 108 118 112 126" stroke="#1A1311" strokeWidth="4" strokeLinecap="round" />
              <path d="M 62 98 Q 66 106 64 112" stroke="#1A1311" strokeWidth="3" strokeLinecap="round" />

              {/* Ghibli Warm Anime Eyes & Smile */}
              <ellipse cx="68" cy="115" rx="5" ry="6.5" fill="#24140F" />
              <circle cx="66" cy="112" r="2" fill="#FFFFFF" />
              <ellipse cx="92" cy="115" rx="5" ry="6.5" fill="#24140F" />
              <circle cx="90" cy="112" r="2" fill="#FFFFFF" />
              <path d="M 62 106 Q 68 102 74 105 M 86 105 Q 92 102 98 106" stroke="#3D2118" strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Soft Peach Blush & Happy Smile */}
              <circle cx="58" cy="122" r="5" fill="#F43F5E" opacity="0.3" filter="url(#steamGlow)" />
              <circle cx="102" cy="122" r="5" fill="#F43F5E" opacity="0.3" filter="url(#steamGlow)" />
              <path d="M 72 126 Q 80 134 88 126" stroke="#3D2118" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* Role Plate */}
              <g transform="translate(20, 245)">
                <rect x="0" y="0" width="120" height="22" rx="11" fill="#96171B" stroke="#FBD66A" strokeWidth="1.5" />
                <text x="60" y="14.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900">
                  KITCHEN MASTER
                </text>
              </g>
            </g>

            {/* ========================================================================= */}
            {/* GHIBLI CHARACTER 2: FRONT KASIR & SERVICE (Wanita Berhijab) */}
            {/* Hijab Kuning + Seragam Kuning + Apron Setengah Badan (Waist Apron) + POS EDC */}
            {/* ========================================================================= */}
            <g
              transform="translate(285, 60)"
              filter="url(#ghibliShadow)"
              className="cursor-pointer transition-all duration-300 hover:translate-y-[-6px]"
              onClick={() => setActiveMascot(1)}
            >
              {/* Legs & Burgundy Pants */}
              <path d="M 64 220 L 56 300 L 78 300 L 82 220 Z" fill="#6B1D2F" stroke="#2B0C13" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M 98 220 L 102 300 L 124 300 L 116 220 Z" fill="#6B1D2F" stroke="#2B0C13" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Teal Ghibli Shoes */}
              <path d="M 48 295 C 48 284 80 284 80 310 L 48 310 Z" fill="#0F4C5C" stroke="#2B0C13" strokeWidth="2.5" />
              <path d="M 98 295 C 98 284 130 284 130 310 L 98 310 Z" fill="#0F4C5C" stroke="#2B0C13" strokeWidth="2.5" />

              {/* Yellow Hara Polo Shirt */}
              <path d="M 48 152 C 48 152 38 172 46 235 C 65 240 118 240 134 235 C 142 172 132 152 132 152 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="2.5" />
              
              {/* Logo on Chest */}
              <g transform="translate(80, 162)">
                <text x="0" y="8" fill="#96171B" fontSize="8" fontWeight="900" fontStyle="italic">HARA</text>
                <circle cx="24" cy="6" r="4.5" fill="#96171B" />
                <path d="M 24 3 Q 26 6 24 8 Q 22 6 24 3 Z" fill="#FBD66A" />
              </g>

              {/* APRON SETENGAH BADAN (WAIST / HALF APRON - Burgundy Soft Linen) */}
              <path d="M 44 186 L 136 186 L 140 242 L 40 242 Z" fill="#781822" stroke="#38080D" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Waistband & Tied Bow Knot */}
              <rect x="42" y="182" width="96" height="7" rx="2" fill="#38080D" />
              <path d="M 85 186 Q 78 196 72 210 M 95 186 Q 102 196 108 210" stroke="#38080D" strokeWidth="2.5" fill="none" />
              {/* Apron Pocket with Printed Receipt */}
              <rect x="62" y="200" width="58" height="30" rx="3" fill="#581017" stroke="#38080D" strokeWidth="2" />
              <rect x="72" y="192" width="16" height="14" rx="1" fill="#FFFFFF" stroke="#38080D" strokeWidth="1.5" />
              <line x1="75" y1="196" x2="85" y2="196" stroke="#94A3B8" strokeWidth="1.2" />
              <line x1="75" y1="200" x2="82" y2="200" stroke="#94A3B8" strokeWidth="1.2" />

              {/* Right Arm: Holding Modern Touchscreen POS Terminal */}
              <path d="M 126 158 L 154 182 L 140 210" stroke="#F59E0B" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
              {/* POS Machine */}
              <g transform="translate(134, 190)">
                <rect x="0" y="0" width="28" height="38" rx="5" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
                <rect x="3" y="4" width="22" height="16" rx="2" fill="#38BDF8" />
                <text x="14" y="15" textAnchor="middle" fill="#082F49" fontSize="6.5" fontWeight="bold">Rp OK</text>
                <circle cx="8" cy="26" r="1.5" fill="#FFFFFF" />
                <circle cx="14" cy="26" r="1.5" fill="#FFFFFF" />
                <circle cx="20" cy="26" r="1.5" fill="#22C55E" />
              </g>

              {/* Left Arm: Warm Welcoming Hand on Heart / Polite Greeting */}
              <path d="M 52 158 L 30 185 L 58 190" stroke="#F59E0B" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="58" cy="190" r="9" fill="url(#ghibliSkinFemale)" stroke="#2B0C13" strokeWidth="2" />

              {/* ================================================================= */}
              {/* GHIBLI ELEGANT HIJAB (Kasir: Pashmina / Segi Empat Rapi Hospitality) */}
              {/* ================================================================= */}
              {/* 1. Back Crown & Bun Volume */}
              <path
                d="M 52 110 C 38 68 56 36 94 36 C 132 36 150 68 142 114 C 146 138 138 168 124 186 C 104 192 84 192 64 186 C 50 166 44 136 52 110 Z"
                fill="url(#hijabGold)"
                stroke="#78350F"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* 2. Hijab Shoulder & Chest Drape (Kain Dada Menutup Rapi) */}
              <path
                d="M 58 152 C 48 168 40 188 44 204 C 54 212 78 214 96 214 C 114 214 138 212 148 204 C 152 188 144 168 134 152 C 122 172 110 186 96 186 C 82 186 70 172 58 152 Z"
                fill="url(#hijabGoldDrape)"
                stroke="#78350F"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              {/* Soft Fabric Folds on Chest */}
              <path d="M 76 172 Q 96 194 116 172" stroke="#B45309" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 84 182 Q 96 198 108 182" stroke="#B45309" strokeWidth="1.8" fill="none" strokeLinecap="round" />

              {/* 3. Inner Ciput / Bandana (Marun Berkelas) */}
              <path
                d="M 72 88 C 80 82 112 82 120 88 C 122 102 118 116 116 122 C 104 128 88 128 76 122 C 74 116 70 102 72 88 Z"
                fill="url(#innerCiput)"
              />

              {/* 4. Beautiful Face Contour */}
              <path
                d="M 74 94 C 74 94 96 88 118 94 C 124 114 122 138 96 150 C 70 138 68 114 74 94 Z"
                fill="url(#ghibliSkinFemale)"
                stroke="#92400E"
                strokeWidth="1.5"
              />

              {/* 5. Front Hijab Arch & Cheek Draping (Lengkungan Segi Empat Rapi) */}
              <path
                d="M 64 96 C 70 78 86 72 96 72 C 106 72 122 78 128 96 C 130 114 126 136 108 150 C 96 156 96 156 84 150 C 66 136 62 114 64 96 Z"
                fill="none"
                stroke="url(#hijabGold)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 64 96 C 70 78 86 72 96 72 C 106 72 122 78 128 96 C 130 114 126 136 108 150 C 96 156 96 156 84 150 C 66 136 62 114 64 96 Z"
                fill="none"
                stroke="#78350F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Hijab Peak Fold Highlight & Crease (Lipatan Tegak Dahi) */}
              <path d="M 96 72 L 96 82" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
              {/* Cute Gold Pin / Brooch Under Chin */}
              <circle cx="96" cy="154" r="3" fill="#FEF08A" stroke="#78350F" strokeWidth="1.5" />
              <circle cx="96" cy="154" r="1" fill="#96171B" />

              {/* Top Crown Light Shimmer */}
              <path d="M 80 44 Q 96 38 112 44" stroke="#FFFBEB" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />

              {/* Cute Ghibli Round Glasses */}
              <circle cx="84" cy="114" r="12" stroke="#38080D" strokeWidth="2.5" fill="rgba(255,255,255,0.25)" />
              <circle cx="108" cy="114" r="12" stroke="#38080D" strokeWidth="2.5" fill="rgba(255,255,255,0.25)" />
              <line x1="96" y1="114" x2="96" y2="114" stroke="#38080D" strokeWidth="2.5" />

              {/* Big Expressive Anime Eyes with Highlights */}
              <ellipse cx="84" cy="114" rx="5" ry="6.5" fill="#1C1917" />
              <circle cx="82" cy="111" r="2" fill="#FFFFFF" />
              <circle cx="86" cy="116" r="0.9" fill="#FFFFFF" />
              
              <ellipse cx="108" cy="114" rx="5" ry="6.5" fill="#1C1917" />
              <circle cx="106" cy="111" r="2" fill="#FFFFFF" />
              <circle cx="110" cy="116" r="0.9" fill="#FFFFFF" />

              {/* Eyebrows */}
              <path d="M 78 103 Q 84 99 90 102" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 102 102 Q 108 99 114 103" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Gentle Rosy Cheeks & Sweet Smile */}
              <circle cx="76" cy="122" r="4.5" fill="#FB7185" opacity="0.45" filter="url(#steamGlow)" />
              <circle cx="116" cy="122" r="4.5" fill="#FB7185" opacity="0.45" filter="url(#steamGlow)" />
              <path d="M 91 127 Q 96 134 101 127" stroke="#3D2118" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* Role Plate */}
              <g transform="translate(25, 255)">
                <rect x="0" y="0" width="130" height="22" rx="11" fill="#D97706" stroke="#FBD66A" strokeWidth="1.5" />
                <text x="65" y="14.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900">
                  FRONT KASIR & RESPECT
                </text>
              </g>
            </g>

            {/* ========================================================================= */}
            {/* GHIBLI CHARACTER 3: KRU GEPREK LAKI-LAKI (Male Geprek Station) */}
            {/* Topi Kitchen Hitam + Kaos Merah + Apron Dada Penuh + Cobek Batu Ulekan Sambal */}
            {/* ========================================================================= */}
            <g
              transform="translate(545, 70)"
              filter="url(#ghibliShadow)"
              className="cursor-pointer transition-all duration-300 hover:translate-y-[-6px]"
              onClick={() => setActiveMascot(2)}
            >
              {/* Legs & Burgundy Pants */}
              <path d="M 52 220 L 44 300 L 70 300 L 76 220 Z" fill="#6B1D2F" stroke="#2B0C13" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M 86 220 L 92 300 L 118 300 L 108 220 Z" fill="#6B1D2F" stroke="#2B0C13" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Shoes */}
              <path d="M 36 295 C 36 284 72 284 72 310 L 36 310 Z" fill="#96171B" stroke="#2B0C13" strokeWidth="2.5" />
              <path d="M 90 295 C 90 284 126 284 126 310 L 90 310 Z" fill="#96171B" stroke="#2B0C13" strokeWidth="2.5" />

              {/* Red T-Shirt */}
              <path d="M 38 145 C 38 145 28 165 36 225 C 55 230 108 230 124 225 C 132 165 122 145 122 145 Z" fill="#D92626" stroke="#5E0F0F" strokeWidth="2.5" />
              
              {/* FULL KITCHEN APRON (Warna Hitam Arang + Aksen Api Geprek Emas) */}
              <path d="M 52 150 L 108 150 L 118 240 L 42 240 Z" fill="#1C1917" stroke="#0C0A09" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M 64 150 Q 80 132 96 150" stroke="#0C0A09" strokeWidth="3" fill="none" />
              
              {/* Golden Flame Icon on Apron */}
              <g transform="translate(68, 172)">
                <rect x="0" y="0" width="24" height="24" rx="4" fill="#96171B" stroke="#FBD66A" strokeWidth="1.2" />
                <path d="M 12 4 Q 17 10 14 15 Q 12 18 10 15 Q 7 10 12 4 Z" fill="#FBD66A" />
              </g>

              {/* GHIBLI AUTHENTIC STONE COBEK WITH SIZZLING SAMBAL GEPREK */}
              <g transform="translate(42, 182)">
                {/* Heavy Volcanic Stone Mortar */}
                <ellipse cx="38" cy="24" rx="36" ry="15" fill="url(#stoneCobek)" stroke="#0F172A" strokeWidth="2.5" />
                <ellipse cx="38" cy="21" rx="31" ry="11" fill="#1E293B" />
                
                {/* Crushed Golden Fried Chicken */}
                <path d="M 18 18 C 14 8 30 2 40 10 C 50 4 60 14 52 24 C 40 28 24 26 18 18 Z" fill="url(#ghibliCrispy)" stroke="#451205" strokeWidth="2" />
                
                {/* Fresh Sizzling Red Sambal Bawang with Chili Seeds */}
                <path d="M 22 16 Q 36 6 48 12 Q 42 22 26 20 Z" fill="url(#ghibliSambal)" />
                <circle cx="30" cy="14" r="1.5" fill="#FEF08A" />
                <circle cx="38" cy="12" r="1.5" fill="#FEF08A" />
                <circle cx="44" cy="16" r="1.2" fill="#FEF08A" />
                
                {/* Wooden / Stone Pestle (Ulekan / Munthu) */}
                <path d="M 54 8 L 72 -4 L 78 2 L 60 14 Z" fill="#475569" stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round" />
                
                {/* Spicy Sizzling Steam Wisps */}
                <path d="M 32 4 Q 35 -6 30 -14 M 46 6 Q 50 -4 44 -12" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" opacity="0.8" filter="url(#steamGlow)" fill="none" />
              </g>

              {/* Arms holding the Cobek with confidence */}
              <path d="M 38 152 L 20 182 L 44 200" stroke="#D92626" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 122 152 L 140 182 L 116 200" stroke="#D92626" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />

              {/* Head & Neck */}
              <rect x="71" y="125" width="18" height="15" fill="url(#ghibliSkinMale)" />
              <circle cx="80" cy="112" r="34" fill="url(#ghibliSkinMale)" stroke="#2B0C13" strokeWidth="2.5" />

              {/* BLACK KITCHEN SKULL CAP (Topi Kitchen Warna Hitam Ghibli) */}
              <path
                d="M 46 104 C 44 68 58 50 80 50 C 102 50 116 68 114 104 Z"
                fill="#1E1E24"
                stroke="#0A0A0C"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <rect x="44" y="94" width="72" height="14" rx="3" fill="#121216" stroke="#0A0A0C" strokeWidth="2" />
              <line x1="48" y1="101" x2="112" y2="101" stroke="#F59E0B" strokeWidth="2" />

              {/* Determined & Enthusiastic Anime Expression */}
              <ellipse cx="68" cy="115" rx="5" ry="6.5" fill="#24140F" />
              <circle cx="66" cy="112" r="2" fill="#FFFFFF" />
              <ellipse cx="92" cy="115" rx="5" ry="6.5" fill="#24140F" />
              <circle cx="90" cy="112" r="2" fill="#FFFFFF" />
              <path d="M 60 106 L 74 110 M 100 106 L 86 110" stroke="#3D2118" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 72 127 Q 80 135 88 127" stroke="#3D2118" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* Role Plate */}
              <g transform="translate(20, 245)">
                <rect x="0" y="0" width="120" height="22" rx="11" fill="#EA580C" stroke="#FBD66A" strokeWidth="1.5" />
                <text x="60" y="14.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900">
                  GEPREK & COBEK
                </text>
              </g>
            </g>

            {/* ========================================================================= */}
            {/* GHIBLI CHARACTER 4: KRU GEPREK / SAJI WANITA (Female Saji & Plating) */}
            {/* Hijab Kuning + Kaos Merah + Apron Dada Penuh + Piring Saji Lengkap Ghibli */}
            {/* ========================================================================= */}
            <g
              transform="translate(790, 65)"
              filter="url(#ghibliShadow)"
              className="cursor-pointer transition-all duration-300 hover:translate-y-[-6px]"
              onClick={() => setActiveMascot(3)}
            >
              {/* Legs & Burgundy Pants */}
              <path d="M 64 220 L 56 300 L 78 300 L 82 220 Z" fill="#6B1D2F" stroke="#2B0C13" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M 98 220 L 102 300 L 124 300 L 116 220 Z" fill="#6B1D2F" stroke="#2B0C13" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Red Ghibli Shoes */}
              <path d="M 48 295 C 48 284 80 284 80 310 L 48 310 Z" fill="#96171B" stroke="#2B0C13" strokeWidth="2.5" />
              <path d="M 98 295 C 98 284 130 284 130 310 L 98 310 Z" fill="#96171B" stroke="#2B0C13" strokeWidth="2.5" />

              {/* Red Hara T-Shirt */}
              <path d="M 48 152 C 48 152 38 172 46 235 C 65 240 118 240 134 235 C 142 172 132 152 132 152 Z" fill="#D92626" stroke="#5E0F0F" strokeWidth="2.5" />

              {/* FULL KITCHEN BIB APRON (Apron Dada Penuh Warna Burgundy) */}
              <path d="M 62 155 L 118 155 L 128 242 L 52 242 Z" fill="#781822" stroke="#38080D" strokeWidth="2.5" strokeLinejoin="round" />
              <path d="M 74 155 Q 90 140 106 155" stroke="#38080D" strokeWidth="3" fill="none" />
              <rect x="70" y="185" width="40" height="28" rx="3" fill="#96171B" stroke="#38080D" strokeWidth="2" />
              <text x="90" y="200" textAnchor="middle" fill="#FBD66A" fontSize="7.5" fontWeight="900">QC SAJI</text>

              {/* Left Arm: Holding Ghibli Plated Meal (Piring Saji Nasi & Ayam Geprek Sambal) */}
              <path d="M 58 160 L 25 182 L 40 202" stroke="#D92626" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* GHIBLI SIGNATURE FOOD PLATE (Piring Keramik Putih, Nasi Dome, Ayam Geprek Sambal, Timun Segar) */}
              <g transform="translate(0, 168)">
                {/* Ceramic White Plate with Soft Rim Shadow */}
                <ellipse cx="32" cy="26" rx="30" ry="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
                <ellipse cx="32" cy="24" rx="26" ry="9" fill="#F8FAFC" />
                
                {/* Steaming Fluffy White Rice Dome */}
                <ellipse cx="20" cy="22" rx="11" ry="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <circle cx="20" cy="18" r="1.5" fill="#1E293B" />
                
                {/* Juicy Geprek Chicken with Searing Red Sambal */}
                <path d="M 28 20 C 26 10 40 8 46 15 C 50 20 44 26 36 25 Z" fill="url(#ghibliSambal)" stroke="#451205" strokeWidth="1.5" />
                
                {/* Fresh Crisp Green Cucumber Slice */}
                <ellipse cx="45" cy="24" rx="4.5" ry="3" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
                <circle cx="45" cy="24" r="1.5" fill="#86EFAC" />

                {/* Aromatic Steam Curling Up */}
                <path d="M 22 10 Q 24 2 20 -6 M 36 12 Q 40 4 34 -4" stroke="#FFF7ED" strokeWidth="2" strokeLinecap="round" opacity="0.85" filter="url(#steamGlow)" fill="none" />
              </g>

              {/* Right Arm: Gentle Thumbs Up */}
              <path d="M 126 160 L 154 182 L 142 202" stroke="#D92626" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="144" cy="202" r="9" fill="url(#ghibliSkinFemale)" stroke="#2B0C13" strokeWidth="2" />
              <path d="M 144 198 L 144 186" stroke="url(#ghibliSkinFemale)" strokeWidth="4" strokeLinecap="round" />

              {/* ================================================================= */}
              {/* GHIBLI ELEGANT HIJAB (Geprek & QC Saji: Hijab Rapi Higienis Standar F&B) */}
              {/* ================================================================= */}
              {/* 1. Back Crown & Bun Volume */}
              <path
                d="M 52 110 C 38 68 56 36 94 36 C 132 36 150 68 142 114 C 146 138 138 168 124 186 C 104 192 84 192 64 186 C 50 166 44 136 52 110 Z"
                fill="url(#hijabGold)"
                stroke="#78350F"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />

              {/* 2. Hijab Shoulder & Chest Drape (Kain Dada Menutup Rapi Masuk ke Apron) */}
              <path
                d="M 58 152 C 48 168 40 188 44 204 C 54 212 78 214 96 214 C 114 214 138 212 148 204 C 152 188 144 168 134 152 C 122 172 110 186 96 186 C 82 186 70 172 58 152 Z"
                fill="url(#hijabGoldDrape)"
                stroke="#78350F"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
              {/* Soft Fabric Folds on Chest */}
              <path d="M 76 172 Q 96 194 116 172" stroke="#B45309" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 84 182 Q 96 198 108 182" stroke="#B45309" strokeWidth="1.8" fill="none" strokeLinecap="round" />

              {/* 3. Inner Ciput / Bandana */}
              <path
                d="M 72 88 C 80 82 112 82 120 88 C 122 102 118 116 116 122 C 104 128 88 128 76 122 C 74 116 70 102 72 88 Z"
                fill="url(#innerCiput)"
              />

              {/* 4. Beautiful Face Contour */}
              <path
                d="M 74 94 C 74 94 96 88 118 94 C 124 114 122 138 96 150 C 70 138 68 114 74 94 Z"
                fill="url(#ghibliSkinFemale)"
                stroke="#92400E"
                strokeWidth="1.5"
              />

              {/* 5. Front Hijab Arch & Cheek Draping (Lengkungan Segi Empat Rapi) */}
              <path
                d="M 64 96 C 70 78 86 72 96 72 C 106 72 122 78 128 96 C 130 114 126 136 108 150 C 96 156 96 156 84 150 C 66 136 62 114 64 96 Z"
                fill="none"
                stroke="url(#hijabGold)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 64 96 C 70 78 86 72 96 72 C 106 72 122 78 128 96 C 130 114 126 136 108 150 C 96 156 96 156 84 150 C 66 136 62 114 64 96 Z"
                fill="none"
                stroke="#78350F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Hijab Peak Fold Highlight & Crease */}
              <path d="M 96 72 L 96 82" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
              {/* Gold Pin Accent */}
              <circle cx="96" cy="154" r="3" fill="#FEF08A" stroke="#78350F" strokeWidth="1.5" />
              <circle cx="96" cy="154" r="1" fill="#15803D" />

              {/* Top Crown Light Shimmer */}
              <path d="M 80 44 Q 96 38 112 44" stroke="#FFFBEB" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />

              {/* Bright Joyful Ghibli Anime Eyes & Rosy Smile */}
              <ellipse cx="84" cy="114" rx="5" ry="7" fill="#1C1917" />
              <circle cx="82" cy="111" r="2.2" fill="#FFFFFF" />
              <circle cx="86" cy="116" r="0.9" fill="#FFFFFF" />

              <ellipse cx="108" cy="114" rx="5" ry="7" fill="#1C1917" />
              <circle cx="106" cy="111" r="2.2" fill="#FFFFFF" />
              <circle cx="110" cy="116" r="0.9" fill="#FFFFFF" />

              {/* Eyebrows */}
              <path d="M 78 103 Q 84 99 90 102" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 102 102 Q 108 99 114 103" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />

              {/* Rosy Cheeks & Radiant Smile */}
              <circle cx="76" cy="122" r="4.5" fill="#FB7185" opacity="0.45" filter="url(#steamGlow)" />
              <circle cx="116" cy="122" r="4.5" fill="#FB7185" opacity="0.45" filter="url(#steamGlow)" />
              <path d="M 90 127 Q 96 135 102 127" stroke="#3D2118" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* Role Plate */}
              <g transform="translate(25, 255)">
                <rect x="0" y="0" width="130" height="22" rx="11" fill="#15803D" stroke="#FBD66A" strokeWidth="1.5" />
                <text x="65" y="14.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="900">
                  GEPREK & SAJI (HIJAB)
                </text>
              </g>
            </g>

            {/* ========================================================================= */}
            {/* FLOATING ARTISTIC GHIBLI STORY BADGES */}
            {/* ========================================================================= */}
            {/* Badge 1: 100% SOP RUNTUT */}
            <g transform="translate(40, 18)" filter="url(#ghibliShadow)">
              <rect x="0" y="0" width="185" height="42" rx="14" fill="#FBD66A" stroke="#38080D" strokeWidth="2.5" />
              <circle cx="22" cy="21" r="12" fill="#96171B" stroke="#38080D" strokeWidth="1.5" />
              <path d="M 16 21 L 20 25 L 28 17" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <text x="44" y="18" fill="#1E110A" fontSize="10.5" fontWeight="900">
                100% SOP RUNTUT
              </text>
              <text x="44" y="32" fill="#781822" fontSize="8.5" fontWeight="900">
                Kitchen • Kasir • Geprek
              </text>
            </g>

            {/* Badge 2: STANDAR KEPATUHAN SERAGAM */}
            <g transform="translate(825, 18)" filter="url(#ghibliShadow)">
              <rect x="0" y="0" width="210" height="42" rx="14" fill="#FFFFFF" stroke="#38080D" strokeWidth="2.5" />
              <circle cx="22" cy="21" r="12" fill="#D97706" stroke="#38080D" strokeWidth="1.5" />
              <path d="M 22 13 C 24 17 27 20 27 23 C 27 26 25 28 22 28 C 19 28 17 26 17 23 C 17 20 20 17 22 13 Z" fill="#FFFFFF" />
              <text x="42" y="18" fill="#1E110A" fontSize="10.5" fontWeight="900">
                STANDAR APD & SERAGAM
              </text>
              <text x="42" y="32" fill="#96171B" fontSize="8.5" fontWeight="900">
                Topi Hitam • Hijab • Apron
              </text>
            </g>
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE SQUAD ROLE CARDS */}
        {/* ========================================================================= */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={13} />
              <span>Standar Seragam & Stasiun Kerja Kru Hara:</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Klik stasiun untuk melihat kelengkapan SOP
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {squadList.map((sq) => {
              const isSelected = activeMascot === sq.id;
              return (
                <button
                  key={sq.id}
                  type="button"
                  onClick={() => setActiveMascot(isSelected ? null : sq.id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer backdrop-blur-xs relative overflow-hidden group ${
                    isSelected
                      ? 'bg-white/15 border-amber-400 shadow-lg shadow-amber-950/40 ring-2 ring-amber-400/50 scale-[1.02]'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border ${sq.color}`}>
                      {sq.roleName}
                    </span>
                    <span className="text-[10px] font-bold text-[#FBD66A]">
                      {sq.badge}
                    </span>
                  </div>

                  <div className="text-xs font-black text-white group-hover:text-[#FBD66A] transition-colors truncate">
                    {sq.mascotName}
                  </div>

                  <div className="text-[10px] text-amber-200/90 font-bold mt-0.5 line-clamp-1">
                    {sq.attire}
                  </div>

                  <div className="text-[10px] text-slate-300 font-medium mt-1 line-clamp-2">
                    {sq.sopFocus}
                  </div>

                  {isSelected && (
                    <div className="mt-2 pt-1.5 border-t border-white/15 text-[9.5px] text-amber-200 font-extrabold flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                      <span>Standar OJT Aktif</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 Core Value Pillars Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-center">
          <div className="p-2 rounded-xl bg-black/20 border border-white/5">
            <div className="text-[10.5px] font-black text-[#FBD66A] flex items-center justify-center gap-1">
              <TrendingUp size={12} />
              <span>Jenjang Karir</span>
            </div>
            <div className="text-[9px] text-slate-400">Trainee ➔ Leader</div>
          </div>

          <div className="p-2 rounded-xl bg-black/20 border border-white/5">
            <div className="text-[10.5px] font-black text-red-400 flex items-center justify-center gap-1">
              <Flame size={12} />
              <span>Standar SOP Baku</span>
            </div>
            <div className="text-[9px] text-slate-400">Rasa & Mutu Seragam</div>
          </div>

          <div className="p-2 rounded-xl bg-black/20 border border-white/5">
            <div className="text-[10.5px] font-black text-emerald-400 flex items-center justify-center gap-1">
              <ShieldCheck size={12} />
              <span>Audit Objektif</span>
            </div>
            <div className="text-[9px] text-slate-400">Runtut Tanpa Asumsi</div>
          </div>

          <div className="p-2 rounded-xl bg-black/20 border border-white/5">
            <div className="text-[10.5px] font-black text-blue-400 flex items-center justify-center gap-1">
              <HeartHandshake size={12} />
              <span>Kultur RESPECT</span>
            </div>
            <div className="text-[9px] text-slate-400">Integritas Tim</div>
          </div>
        </div>

      </div>
    </div>
  );
};
