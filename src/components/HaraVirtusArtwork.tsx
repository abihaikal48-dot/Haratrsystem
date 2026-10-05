import React, { useState } from 'react';
import { Sparkles, Award, Star, Flame, Shield, Check } from 'lucide-react';

interface HaraVirtusArtworkProps {
  variant?: 'floating-top' | 'header-badge' | 'card-accent';
  className?: string;
}

export const HaraVirtusArtwork: React.FC<HaraVirtusArtworkProps> = ({
  variant = 'floating-top',
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative select-none transition-transform duration-500 ${className}`}
      style={{
        transform: isHovered ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
      }}
    >
      {/* Ambient Warm Golden Sheen */}
      <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-red-500/15 to-yellow-500/20 rounded-3xl blur-xl opacity-75 pointer-events-none" />

      {/* Main Container */}
      <div className="relative rounded-2xl bg-gradient-to-b from-stone-900 via-[#1C0D0F] to-[#2D0F13] border border-amber-500/30 shadow-[0_12px_30px_-8px_rgba(150,23,27,0.35)] p-3.5 sm:p-4 text-white overflow-hidden flex items-center gap-3.5 backdrop-blur-md">
        
        {/* Soft Decorative Star / Glow */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-20 h-20 bg-red-600/20 rounded-full blur-lg pointer-events-none" />

        {/* 3D Stylized Medallion / Chef Crest */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-[#96171B] p-[2px] shadow-lg flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#1F0C0F] flex items-center justify-center relative overflow-hidden">
              
              {/* Inner Radial Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.35),transparent_70%)]" />

              {/* 3D Visual Asset SVG: Chef Toque, Golden Crest, & Crispy Drumstick */}
              <svg viewBox="0 0 80 80" className="w-11 h-11 sm:w-12 sm:h-12 relative z-10 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
                <defs>
                  <linearGradient id="virtusGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>
                  <linearGradient id="virtusRed" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="60%" stopColor="#96171B" />
                    <stop offset="100%" stopColor="#55080A" />
                  </linearGradient>
                  <linearGradient id="crispSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="70%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>
                  <filter id="virtusShine" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.4" />
                  </filter>
                </defs>

                {/* Golden Laurel Branch Left */}
                <path
                  d="M 18,52 C 14,44 14,32 20,24 C 20,26 21,30 23,32 C 19,37 19,45 22,50 Z"
                  fill="url(#virtusGold)"
                  opacity="0.85"
                />
                {/* Golden Laurel Branch Right */}
                <path
                  d="M 62,52 C 66,44 66,32 60,24 C 60,26 59,30 57,32 C 61,37 61,45 58,50 Z"
                  fill="url(#virtusGold)"
                  opacity="0.85"
                />

                {/* The HARA Chicken Red Crest / Jengger Triple Wave */}
                <path
                  d="M 32,32 C 30,22 36,18 40,24 C 44,17 50,21 48,32 C 45,34 35,34 32,32 Z"
                  fill="url(#virtusRed)"
                  filter="url(#virtusShine)"
                />

                {/* 3D Master Chef Toque (Hat) Top */}
                <path
                  d="M 28,34 C 26,26 35,22 39,26 C 42,21 52,24 51,34 C 54,34 54,38 52,40 L 27,40 C 25,38 25,34 28,34 Z"
                  fill="#FFFFFF"
                  opacity="0.95"
                  filter="url(#virtusShine)"
                />
                {/* Chef Hat Band */}
                <rect x="27" y="39" width="25" height="4" rx="2" fill="url(#virtusGold)" />

                {/* Delicious Fried Drumstick Trophy Silhouette Crossing */}
                <g transform="translate(40,54) rotate(-12) translate(-40,-54)">
                  {/* Bone handle */}
                  <path d="M 24,62 L 32,54" stroke="#FAF8F5" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="23" cy="63" r="2.2" fill="#FAF8F5" />
                  <circle cx="25" cy="65" r="2" fill="#FAF8F5" />
                  {/* Crunchy crispy drumstick meat bulb */}
                  <ellipse cx="42" cy="50" rx="14" ry="10" fill="url(#crispSkin)" filter="url(#virtusShine)" />
                  {/* Crunchy texture crumbs */}
                  <circle cx="36" cy="48" r="1.5" fill="#FEF3C7" />
                  <circle cx="43" cy="46" r="1.8" fill="#FDE68A" />
                  <circle cx="48" cy="51" r="1.4" fill="#FDE68A" />
                  <circle cx="40" cy="53" r="1.2" fill="#FFFBEB" />
                </g>

                {/* Star on Top */}
                <polygon
                  points="40,9 42,14 47,14 43,17 45,22 40,19 35,22 37,17 33,14 38,14"
                  fill="url(#virtusGold)"
                />
              </svg>

              {/* Sparkle badge */}
              <div className="absolute top-1 right-1 text-amber-300">
                <Sparkles size={11} className="animate-spin" style={{ animationDuration: '9s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Text Details & Latin Standard */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/25"
              style={{ fontFamily: '"Cinzel", serif' }}
            >
              HARA VIRTUS
            </span>
            <span className="text-[10px] text-stone-400 hidden sm:inline">&bull;</span>
            <span className="text-[10px] text-stone-400 hidden sm:inline tracking-wider uppercase font-semibold">
              Standard of Excellence
            </span>
          </div>

          <h3
            className="text-sm sm:text-base font-bold text-stone-100 tracking-tight mt-0.5 truncate"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            Ars Coquendi & Disciplina Operasional
          </h3>

          <p className="text-[11px] text-stone-400 leading-tight mt-0.5 line-clamp-1">
            Standarisasi mutu rasa renyah, higienitas gerai, dan ketangkasan layanan kru HARA Chicken.
          </p>
        </div>

        {/* Subtle Pill Tag */}
        <div className="hidden md:flex flex-col items-end shrink-0 pl-2 border-l border-white/10">
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span>SOP 100%</span>
          </div>
          <span className="text-[9.5px] text-stone-400 tracking-wider uppercase">
            Standar Gerai
          </span>
        </div>

      </div>
    </div>
  );
};
