import React from 'react';

interface GeometricBackdropProps {
  variant?: 'subtle' | 'vibrant' | 'exam' | 'login';
}

export const GeometricBackdrop: React.FC<GeometricBackdropProps> = ({ variant = 'subtle' }) => {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Background Soft Ambient Gradient Tint */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          variant === 'login'
            ? 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D]'
            : variant === 'exam'
            ? 'bg-gradient-to-br from-[#F8FAFC] via-[#EEF2F6] to-[#E2E8F0]'
            : 'bg-[#F8FAFC]'
        }`}
      />

      {/* Top-Right Ambient Glow */}
      <div
        className={`absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30 ${
          variant === 'login' ? 'bg-[#96171B]' : 'bg-red-200'
        }`}
      />

      {/* Bottom-Left Ambient Glow */}
      <div
        className={`absolute -bottom-40 -left-32 w-[30rem] h-[30rem] rounded-full blur-3xl opacity-20 ${
          variant === 'login' ? 'bg-amber-600' : 'bg-rose-200'
        }`}
      />

      {/* Geometric Ornaments Placed Strictly at Outer Canvas Margins */}
      {/* 1. Top-Left Floating Cyan/Rose Triangle Accent */}
      <div className="absolute top-12 left-10 animate-float-slow opacity-60">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <polygon
            points="14,2 26,26 2,26"
            className={variant === 'login' ? 'fill-red-500/20 stroke-red-400/40' : 'fill-rose-500/15 stroke-[#96171B]/30'}
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* 2. Top-Right Dot Matrix Grid */}
      <div className="absolute top-16 right-16 opacity-35">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <pattern id="dot-grid-pattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" className={variant === 'login' ? 'fill-slate-600' : 'fill-slate-400'} />
          </pattern>
          <rect width="80" height="80" fill="url(#dot-grid-pattern)" />
        </svg>
      </div>

      {/* 3. Middle-Right Floating Diamond Accent */}
      <div className="absolute top-1/2 -right-4 -translate-y-1/2 animate-float-reverse opacity-50">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect
            x="20"
            y="2"
            width="24"
            height="24"
            rx="4"
            transform="rotate(45 20 2)"
            className={variant === 'login' ? 'fill-amber-500/15 stroke-amber-400/30' : 'fill-amber-500/15 stroke-amber-500/30'}
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* 4. Bottom-Left Dot Matrix Grid */}
      <div className="absolute bottom-16 left-12 opacity-35">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect width="80" height="80" fill="url(#dot-grid-pattern)" />
        </svg>
      </div>

      {/* 5. Bottom-Right Floating Geometric Shapes */}
      <div className="absolute bottom-12 right-24 animate-float-slow opacity-60">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle
            cx="16"
            cy="16"
            r="12"
            className={variant === 'login' ? 'stroke-slate-700' : 'stroke-slate-300'}
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>
      </div>
    </div>
  );
};
