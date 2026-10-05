import React, { useState } from 'react';
import { Sparkles, Shield, Flame, Award, Info, X, Check, TrendingUp, Users, ArrowUpRight, BarChart3 } from 'lucide-react';

interface HaraLogoProps {
  variant?: 'full' | 'icon' | 'dark-full' | 'white' | 'horizontal' | 'badge' | 'symbol' | 'vertical';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showSubtitle?: boolean;
  interactive?: boolean;
}

export const HaraLogo: React.FC<HaraLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showSubtitle = true,
  interactive = false,
}) => {
  const [showPhilosophyModal, setShowPhilosophyModal] = useState(false);

  // Scaled dimensions with mathematically harmonious proportions
  const sizeMap = {
    xs: { icon: 28, titleSize: 13, brandSize: 8, subSize: 7, badgeSize: 7.5, gap: 'gap-2' },
    sm: { icon: 36, titleSize: 15, brandSize: 9, subSize: 7.5, badgeSize: 8, gap: 'gap-2.5' },
    md: { icon: 46, titleSize: 19, brandSize: 11, subSize: 8.5, badgeSize: 9, gap: 'gap-3' },
    lg: { icon: 58, titleSize: 24, brandSize: 13, subSize: 10, badgeSize: 10, gap: 'gap-3.5' },
    xl: { icon: 78, titleSize: 32, brandSize: 16, subSize: 12, badgeSize: 11.5, gap: 'gap-4' },
    '2xl': { icon: 108, titleSize: 42, brandSize: 20, subSize: 15, badgeSize: 13, gap: 'gap-5' },
  };

  const dim = sizeMap[size] || sizeMap.md;

  /**
   * =========================================================================
   * HARA CHICKEN - TRAINER OPERASIONAL SYSTEM LOGOMARK (OFFICIAL VECTOR)
   * =========================================================================
   * FUSI 2 ELEMEN UTAMA DARI REFERENSI:
   * 
   * 1. THE ICONIC HARA CHICKEN CREST / JENGGER AYAM MERAH:
   *    - Karakter visual khas HARA Chicken (3 lekukan jengger merah dinamis)
   *      yang merepresentasikan identitas brand F&B restoran ayam goreng renyah.
   * 
   * 2. THE ASCENDING GROWTH ARROW & BAR CHART (TRAINER OPERASIONAL):
   *    - Grafik pilar kompetensi emas yang bertumbuh naik bersama panah akselerasi
   *      standar kru (Evaluasi Lapangan, Pelatihan Teori, Uji Praktik, dan Observasi).
   * 
   * 3. TYPOGRAPHY:
   *    - Penegasan "HARA CHICKEN" sebagai brand induk
   *    - "TRAINER OPERASIONAL" / "HARA TRAINER PRO" sebagai identitas sistem.
   * =========================================================================
   */
  const renderIcon = (iconSize: number) => {
    const id = `hara-ref-${Math.random().toString(36).substring(2, 7)}`;

    return (
      <svg
        viewBox="0 0 120 120"
        width={iconSize}
        height={iconSize}
        className="shrink-0 transition-transform duration-300 hover:scale-105 select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Authentic Hara Crimson Gradient */}
          <linearGradient id={`${id}-crimson`} x1="10" y1="20" x2="65" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D9222A" />
            <stop offset="60%" stopColor="#A21D21" />
            <stop offset="100%" stopColor="#781014" />
          </linearGradient>

          {/* Golden Growth Sunburst Gradient */}
          <linearGradient id={`${id}-gold`} x1="20" y1="90" x2="110" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D48B1E" />
            <stop offset="40%" stopColor="#E9A825" />
            <stop offset="85%" stopColor="#F5B731" />
            <stop offset="100%" stopColor="#FFD369" />
          </linearGradient>

          {/* Soft Shadow */}
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#180406" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* --- ELEMEN 1: JENGGER AYAM MERAH HARA CHICKEN (3 DYNAMIC CREST PETALS) --- */}
        <g filter={`url(#${id}-shadow)`}>
          <path
            d="M 22 72
               C 14 68 12 55 18 47
               C 22 41 28 41 33 46
               C 31 38 35 28 44 26
               C 52 24 58 31 59 39
               C 62 33 68 29 76 33
               C 84 37 84 48 78 57
               C 74 63 68 67 60 70
               C 50 74 34 78 22 72 Z"
            fill={`url(#${id}-crimson)`}
          />
        </g>

        {/* --- ELEMEN 2: TRAINER OPERASIONAL GROWTH BAR CHARTS (3 PILAR KOMPETENSI) --- */}
        <g fill={`url(#${id}-gold)`} filter={`url(#${id}-shadow)`}>
          {/* Bar 1 (Pilar Kiri - Dasar/Pemula) */}
          <path d="M 28 92 L 40 92 C 43 92 44.5 90 44.5 86 L 44.5 76 C 44.5 74 43 73 40 73 L 28 85 C 26.5 86.5 26.5 92 28 92 Z" />

          {/* Bar 2 (Pilar Tengah - Terampil) */}
          <path d="M 48 92 L 62 92 C 64.5 92 66 90.5 66 87 L 66 62 C 66 59 64 58 61 58 L 53 66 C 49.5 69.5 48 72 48 76 L 48 92 Z" />

          {/* Bar 3 (Pilar Kanan - Mahir / Mastery) */}
          <rect x="70" y="47" width="18" height="45" rx="8" />
        </g>

        {/* --- ELEMEN 3: KINETIC ASCENDING GROWTH ARROW (TRAINER PROGRESSION) --- */}
        <g filter={`url(#${id}-shadow)`}>
          {/* Arrow Dynamic Path Line */}
          <path
            d="M 24 88
               L 55 56
               L 67 68
               L 95 32"
            fill="none"
            stroke={`url(#${id}-gold)`}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Arrow Head (Menunjuk Naik Ke Kanan Melambangkan Akselerasi Karir) */}
          <path
            d="M 83 23
               L 106 20
               L 101 43
               L 92 36
               L 81 29 Z"
            fill={`url(#${id}-gold)`}
          />

          {/* Inner Accent Line on Arrow for Extra Polish */}
          <path
            d="M 28 84
               L 55 58
               L 67 70
               L 95 34"
            fill="none"
            stroke="#FFF4CC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
        </g>
      </svg>
    );
  };

  if (variant === 'icon' || variant === 'symbol') {
    return (
      <>
        <div
          onClick={interactive ? () => setShowPhilosophyModal(true) : undefined}
          className={`inline-flex items-center justify-center ${
            interactive ? 'cursor-pointer hover:opacity-90' : ''
          } ${className}`}
          title={interactive ? 'Klik untuk melihat filosofi logo HARA' : 'HARA Chicken Trainer Operasional'}
        >
          {renderIcon(dim.icon)}
        </div>
        {showPhilosophyModal && <PhilosophyModal onClose={() => setShowPhilosophyModal(false)} />}
      </>
    );
  }

  const isDark = variant === 'dark-full' || variant === 'white';

  return (
    <>
      <div
        onClick={interactive ? () => setShowPhilosophyModal(true) : undefined}
        className={`inline-flex items-center ${dim.gap} select-none ${
          interactive ? 'cursor-pointer group' : ''
        } ${className}`}
        title={interactive ? 'Klik untuk melihat filosofi logo HARA' : undefined}
      >
        {/* Brandmark Icon */}
        <div className="relative">
          {renderIcon(dim.icon)}
          {interactive && (
            <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-400 text-slate-950 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
              <Info size={10} />
            </span>
          )}
        </div>

        {/* Wordmark Hierarchy (Brand Name + System Name) */}
        <div className="flex flex-col justify-center leading-none text-left">
          
          {/* 1. HARA CHICKEN Parent Brand */}
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${
                isDark ? 'text-white' : 'text-[#96171B]'
              }`}
              style={{
                fontSize: `${dim.titleSize}px`,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                fontFamily: '"Plus Jakarta Sans", "Montserrat", "Inter", -apple-system, sans-serif',
                fontWeight: 900,
              }}
            >
              <span>HARA</span>
              <span className="text-[#D48B1E] ml-1 font-extrabold">CHICKEN</span>
            </span>

            {/* Trainer & Ops Badge */}
            <span
              className={`font-bold uppercase tracking-wider rounded-md border ${
                isDark
                  ? 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                  : 'bg-red-50 text-[#96171B] border-red-200'
              }`}
              style={{
                fontSize: `${dim.badgeSize}px`,
                padding: '1.5px 5.5px',
                lineHeight: 1.1,
                fontFamily: '"Outfit", sans-serif',
                letterSpacing: '0.06em',
                fontWeight: 700,
              }}
            >
              TRAINER & OPS
            </span>
          </div>

          {/* 2. Subtitle */}
          {showSubtitle && (
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className={`font-semibold uppercase tracking-[0.14em] ${
                  isDark ? 'text-amber-200/90' : 'text-stone-500'
                }`}
                style={{
                  fontSize: `${dim.subSize}px`,
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                }}
              >
                PELATIHAN & OPERASIONAL GERAI
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D48B1E] shrink-0" />
            </div>
          )}
        </div>
      </div>

      {showPhilosophyModal && <PhilosophyModal onClose={() => setShowPhilosophyModal(false)} />}
    </>
  );
};

// ============================================================================
// MODAL FILOSOFI DAN MAKNA LOGO RESMI HARA CHICKEN TRAINER OPERASIONAL
// ============================================================================
export const PhilosophyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-[#E2E0D8] p-6 sm:p-8 space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <HaraLogo variant="icon" size="sm" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Filosofi & Identitas Logo HARA CHICKEN · TRAINER
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Fusi Simbol Identitas Restoran F&B dan Penguatan Standar Kru Cabang
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Central Visual Showcase */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#1C1410] via-[#120E0C] to-[#2B150F] border border-[#E9A825]/40 text-center text-white flex flex-col items-center justify-center space-y-3 shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#E9A825]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-[#A21D21]/30 rounded-full blur-3xl pointer-events-none" />
          
          <HaraLogo variant="icon" size="2xl" />
          <div className="relative z-10 space-y-1">
            <h4 className="text-xl font-black text-white tracking-tight">
              HARA CHICKEN · TRAINER OPERASIONAL
            </h4>
            <p className="text-xs text-amber-200/90 font-medium max-w-md mx-auto">
              Simbol Autentik Jengger Ayam HARA & Grafik Akselerasi Bimbingan Mutu SDM
            </p>
          </div>
        </div>

        {/* 4 Core Pillars of Philosophy */}
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          
          {/* Pillar 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <Flame size={16} className="text-[#A21D21]" />
              <span>1. Jengger Merah HARA Chicken</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              Tiga lengkungan jengger ayam merah ikonik mencerminkan identitas utama restoran HARA Chicken, kelezatan resep ayam krispi, dan gairah pelayanan F&B prima.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <TrendingUp size={16} className="text-[#D48B1E]" />
              <span>2. Panah Bimbingan & Akselerasi Trainer</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              Panah emas dinamis yang melesat naik ke kanan atas melambangkan akselerasi kompetensi kru, efektivitas coaching lapangan, dan konsistensi mutu produk cabang.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <BarChart3 size={16} className="text-amber-600" />
              <span>3. Tiga Pilar Bar Chart Kompetensi</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              Batang grafik bertingkat melambangkan jenjang evaluasi berkelanjutan dari tingkat *Pemula* (kognitif dasar), *Terampil* (eksekusi shift), hingga *Mahir* (mastery SOP 170°C).
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-black text-slate-900">
              <Users size={16} className="text-emerald-700" />
              <span>4. Sinergi Human Capital & Standar Mutu</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              Perpaduan merah dan emas melambangkan filosofi bahwa kelezatan produk dan kepuasan pelanggan berakar dari pembinaan SDM kru yang terstandarisasi dan berintegritas.
            </p>
          </div>
        </div>

        {/* Color Palette Hierarchy */}
        <div className="p-3.5 bg-gradient-to-r from-red-50 via-amber-50 to-emerald-50 rounded-2xl border border-amber-200/80 text-xs flex items-center justify-between flex-wrap gap-2 text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#A21D21]" />
            <span className="font-bold">Hara Red (Identitas Brand & Semangat)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#E9A825]" />
            <span className="font-bold">Golden Growth (Pertumbuhan & Prestasi SDM)</span>
          </div>
        </div>

        {/* Footer Close Action */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary-enterprise !py-2 !px-6 text-xs font-bold bg-[#A21D21] text-white"
          >
            Tutup Informasi
          </button>
        </div>
      </div>
    </div>
  );
};
