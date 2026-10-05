import React from 'react';

interface HaraVirtusLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export const HaraVirtusLogo: React.FC<HaraVirtusLogoProps> = ({
  size = 'lg',
  showText = false,
  className = '',
  theme = 'light',
}) => {
  const pixelMap = {
    sm: 44,
    md: 64,
    lg: 88,
    xl: 112,
  };

  const px = pixelMap[size];
  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      {/* Generated Official Vector SVG Crest */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105 drop-shadow-[0_8px_16px_rgba(150,23,27,0.18)]"
      >
        <defs>
          {/* Noble Gold Gradient */}
          <linearGradient id={`${uniqueId}-gold`} x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* Crimson Red Gradient */}
          <linearGradient id={`${uniqueId}-crimson`} x1="40" y1="20" x2="120" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="45%" stopColor="#96171B" />
            <stop offset="100%" stopColor="#58080C" />
          </linearGradient>

          {/* Inner Shield Radial */}
          <radialGradient id={`${uniqueId}-inner`} cx="80" cy="80" r="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="85%" stopColor="#F7F3EB" />
            <stop offset="100%" stopColor="#EDE5D8" />
          </radialGradient>

          {/* Dark Mode Shield Radial */}
          <radialGradient id={`${uniqueId}-inner-dark`} cx="80" cy="80" r="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2A1014" />
            <stop offset="85%" stopColor="#180709" />
            <stop offset="100%" stopColor="#0F0405" />
          </radialGradient>

          {/* Soft Shadow */}
          <filter id={`${uniqueId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Circular Laurel / Shield Base */}
        <circle
          cx="80"
          cy="80"
          r="72"
          fill={theme === 'dark' ? `url(#${uniqueId}-inner-dark)` : `url(#${uniqueId}-inner)`}
          stroke={`url(#${uniqueId}-gold)`}
          strokeWidth="3.5"
          filter={`url(#${uniqueId}-shadow)`}
        />

        {/* Inner Concentric Hairline Ring */}
        <circle
          cx="80"
          cy="80"
          r="64"
          fill="none"
          stroke={`url(#${uniqueId}-gold)`}
          strokeWidth="1"
          strokeDasharray="2 3"
          opacity="0.65"
        />

        {/* Left Laurel Wreath (Virtus & Mastery) */}
        <g fill={`url(#${uniqueId}-gold)`} opacity="0.9">
          {/* Leaf 1 */}
          <path d="M 28 85 C 24 75 28 62 38 52 C 37 60 36 67 38 73 C 33 76 30 80 28 85 Z" />
          {/* Leaf 2 */}
          <path d="M 33 98 C 29 90 32 80 40 73 C 40 80 42 86 46 91 C 40 93 36 95 33 98 Z" />
          {/* Leaf 3 */}
          <path d="M 43 115 C 38 107 40 98 48 93 C 49 100 52 105 57 109 C 51 111 47 113 43 115 Z" />
          {/* Leaf 4 */}
          <path d="M 58 126 C 52 120 54 112 62 108 C 63 114 67 119 73 121 C 67 124 62 125 58 126 Z" />
        </g>

        {/* Right Laurel Wreath (Virtus & Mastery) */}
        <g fill={`url(#${uniqueId}-gold)`} opacity="0.9">
          {/* Leaf 1 */}
          <path d="M 132 85 C 136 75 132 62 122 52 C 123 60 124 67 122 73 C 127 76 130 80 132 85 Z" />
          {/* Leaf 2 */}
          <path d="M 127 98 C 131 90 128 80 120 73 C 120 80 118 86 114 91 C 120 93 124 95 127 98 Z" />
          {/* Leaf 3 */}
          <path d="M 117 115 C 122 107 120 98 112 93 C 111 100 108 105 103 109 C 109 111 113 113 117 115 Z" />
          {/* Leaf 4 */}
          <path d="M 102 126 C 108 120 106 112 98 108 C 97 114 93 119 87 121 C 93 124 98 125 102 126 Z" />
        </g>

        {/* Central Heraldic Shield */}
        <path
          d="M 52 50 C 52 46 80 40 80 40 C 80 40 108 46 108 50 C 108 78 88 105 80 114 C 72 105 52 78 52 50 Z"
          fill={theme === 'dark' ? '#3B1217' : '#FFFFFF'}
          stroke={`url(#${uniqueId}-crimson)`}
          strokeWidth="2.5"
          filter={`url(#${uniqueId}-shadow)`}
        />

        {/* Dynamic HARA Red Crest / Triple Jengger Ayam */}
        <path
          d="M 64 54 C 60 42 70 38 75 44 C 78 35 88 35 88 45 C 93 39 100 42 97 54 C 92 61 70 61 64 54 Z"
          fill={`url(#${uniqueId}-crimson)`}
        />

        {/* Golden Chef Crown / Toque Ribbons */}
        <path
          d="M 66 66 C 62 58 72 54 77 58 C 80 52 89 54 89 62 C 95 60 96 66 94 70 L 66 70 Z"
          fill={theme === 'dark' ? '#FFFFFF' : '#FAF8F5'}
          stroke={`url(#${uniqueId}-gold)`}
          strokeWidth="1.5"
        />

        {/* Toque Band in Gold */}
        <rect x="66" y="69" width="28" height="4.5" rx="2" fill={`url(#${uniqueId}-gold)`} />

        {/* Quality Torch / Star of Virtus in Center Shield */}
        <polygon
          points="80,78 83,86 91,86 85,91 87,99 80,94 73,99 75,91 69,86 77,86"
          fill={`url(#${uniqueId}-gold)`}
          stroke="#96171B"
          strokeWidth="0.8"
        />

        {/* Top Apex Star of Distinction */}
        <polygon
          points="80,14 83,21 90,21 84,26 86,33 80,29 74,33 76,26 70,21 77,21"
          fill={`url(#${uniqueId}-gold)`}
          filter={`url(#${uniqueId}-shadow)`}
        />

        {/* Ribbon Banner at Bottom with "VIRTUS" */}
        <g>
          {/* Ribbon Back fold */}
          <path d="M 40 126 L 50 120 L 50 132 Z" fill="#6B0C10" />
          <path d="M 120 126 L 110 120 L 110 132 Z" fill="#6B0C10" />
          {/* Ribbon Front */}
          <rect
            x="44"
            y="120"
            width="72"
            height="15"
            rx="3"
            fill={`url(#${uniqueId}-crimson)`}
            stroke={`url(#${uniqueId}-gold)`}
            strokeWidth="1.2"
          />
          {/* Ribbon Text */}
          <text
            x="80"
            y="131"
            textAnchor="middle"
            fill="#FDE68A"
            fontSize="9"
            fontWeight="900"
            letterSpacing="2.5"
            fontFamily="'Cinzel', serif"
          >
            VIRTUS
          </text>
        </g>
      </svg>

      {/* Optional Brand Text underneath */}
      {showText && (
        <div className="mt-3 text-center">
          <div
            className="text-lg sm:text-xl font-black tracking-widest text-[#96171B]"
            style={{ fontFamily: '"Cinzel", serif' }}
          >
            HARA VIRTUS
          </div>
          <div
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mt-0.5"
            style={{ fontFamily: '"Outfit", sans-serif' }}
          >
            Operational Excellence & Academy
          </div>
        </div>
      )}
    </div>
  );
};
