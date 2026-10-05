import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

/**
 * 1. Hero Illustration for Exam & Field Trainer Portal
 * Symmetrical, vector-crafted modern illustration with deep crimson, warm amber, soft slate & gold tones.
 */
export const ExamPortalHeroIllustration: React.FC<IllustrationProps> = ({ className = '', size = 260 }) => {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.72)}
      viewBox="0 0 400 288"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <defs>
        <linearGradient id="bgGlow" x1="200" y1="20" x2="200" y2="270" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#96171B" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FBD66A" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="crimsonGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#96171B" />
          <stop offset="100%" stopColor="#6E0D10" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBD66A" />
          <stop offset="100%" stopColor="#E5A629" />
        </linearGradient>
        <linearGradient id="tabletScreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="125%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0F172A" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Background Soft Aura */}
      <circle cx="200" cy="144" r="130" fill="url(#bgGlow)" />
      
      {/* Decorative Dashed Progress Arc */}
      <path
        d="M 90 210 A 130 130 0 0 1 310 210"
        stroke="#E2E8F0"
        strokeWidth="2"
        strokeDasharray="6 6"
      />

      {/* Career Progression Stepping Podiums */}
      <rect x="70" y="195" width="48" height="35" rx="6" fill="#F1F5F9" />
      <text x="94" y="217" textAnchor="middle" fill="#64748B" fontSize="11" fontWeight="700">LVL 1</text>

      <rect x="135" y="180" width="48" height="50" rx="6" fill="#E2E8F0" />
      <text x="159" y="207" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="700">LVL 2</text>

      <rect x="200" y="165" width="52" height="65" rx="6" fill="#CBD5E1" />
      <text x="226" y="195" textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700">LVL 3</text>

      <rect x="270" y="145" width="58" height="85" rx="8" fill="url(#crimsonGrad)" filter="url(#softShadow)" />
      <text x="299" y="180" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800">LEAD</text>
      <path d="M 299 190 L 302 196 L 308 197 L 304 201 L 305 207 L 299 204 L 293 207 L 294 201 L 290 197 L 296 196 Z" fill="#FBD66A" />

      {/* Central Digital Exam Tablet Device */}
      <g filter="url(#softShadow)">
        <rect x="120" y="45" width="160" height="200" rx="18" fill="#1E293B" />
        <rect x="126" y="51" width="148" height="188" rx="14" fill="url(#tabletScreen)" />
        
        {/* Tablet Camera & Speaker */}
        <circle cx="200" cy="57" r="2" fill="#94A3B8" />

        {/* Exam App Header */}
        <rect x="136" y="66" width="70" height="8" rx="3" fill="#96171B" />
        <rect x="240" y="66" width="24" height="8" rx="3" fill="#E2E8F0" />

        {/* Question Header Card */}
        <rect x="136" y="82" width="128" height="34" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
        <rect x="144" y="90" width="112" height="6" rx="2" fill="#334155" />
        <rect x="144" y="100" width="80" height="5" rx="2" fill="#64748B" />

        {/* Option A (Selected Correct) */}
        <rect x="136" y="122" width="128" height="18" rx="6" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
        <circle cx="146" cy="131" r="5" fill="#10B981" />
        <path d="M 144 131 L 145.5 132.5 L 148 129.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="156" y="128" width="85" height="5" rx="2" fill="#065F46" />

        {/* Option B */}
        <rect x="136" y="145" width="128" height="18" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <circle cx="146" cy="154" r="5" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
        <rect x="156" y="151" width="70" height="5" rx="2" fill="#94A3B8" />

        {/* Option C */}
        <rect x="136" y="168" width="128" height="18" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <circle cx="146" cy="177" r="5" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
        <rect x="156" y="174" width="90" height="5" rx="2" fill="#94A3B8" />

        {/* Action Button at bottom of tablet */}
        <rect x="136" y="196" width="128" height="20" rx="6" fill="url(#crimsonGrad)" />
        <rect x="180" y="203" width="40" height="6" rx="2" fill="#FFFFFF" />
      </g>

      {/* Floating Badge: 100% SOP Verified */}
      <g filter="url(#softShadow)">
        <rect x="42" y="70" width="86" height="54" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <circle cx="62" cy="97" r="12" fill="url(#goldGrad)" />
        <path d="M 58 97 L 61 100 L 66 94" stroke="#78350F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="80" y="88" width="38" height="6" rx="2" fill="#1E293B" />
        <rect x="80" y="98" width="28" height="4" rx="2" fill="#10B981" />
      </g>

      {/* Floating Badge: Timer / Speed */}
      <g filter="url(#softShadow)">
        <rect x="272" y="65" width="88" height="50" rx="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <circle cx="292" cy="90" r="11" fill="#F1F5F9" stroke="#96171B" strokeWidth="1.5" />
        <path d="M 292 84 V 90 L 296 92" stroke="#96171B" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="310" y="83" width="38" height="5" rx="2" fill="#1E293B" />
        <rect x="310" y="92" width="26" height="4" rx="2" fill="#64748B" />
      </g>

      {/* Sparkles */}
      <path d="M 60 40 L 62 46 L 68 48 L 62 50 L 60 56 L 58 50 L 52 48 L 58 46 Z" fill="#FBD66A" />
      <path d="M 340 160 L 341.5 164.5 L 346 166 L 341.5 167.5 L 340 172 L 338.5 167.5 L 334 166 L 338.5 164.5 Z" fill="#FBD66A" />
      <path d="M 120 230 L 121 233 L 124 234 L 121 235 L 120 238 L 119 235 L 116 234 L 119 233 Z" fill="#96171B" opacity="0.4" />
    </svg>
  );
};

/**
 * 2. Exam Success & Certification Achievement Vector
 */
export const ExamSuccessIllustration: React.FC<IllustrationProps> = ({ className = '', size = 180 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <defs>
        <linearGradient id="goldSeal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="ribbonGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#96171B" />
          <stop offset="100%" stopColor="#660A0D" />
        </linearGradient>
      </defs>

      {/* Radial soft background */}
      <circle cx="100" cy="95" r="75" fill="#FEF3C7" fillOpacity="0.4" />

      {/* Ribbons hanging down */}
      <path d="M 80 110 L 65 175 L 85 160 L 98 175 L 90 110 Z" fill="url(#ribbonGrad)" />
      <path d="M 120 110 L 135 175 L 115 160 L 102 175 L 110 110 Z" fill="url(#ribbonGrad)" />

      {/* Outer Starburst / Seal */}
      <circle cx="100" cy="90" r="56" fill="url(#goldSeal)" />
      <circle cx="100" cy="90" r="48" fill="#FFFBEB" />
      <circle cx="100" cy="90" r="44" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />

      {/* Trophy & Star inside badge */}
      <path
        d="M 82 72 H 118 V 88 C 118 98 110 106 100 106 C 90 106 82 98 82 88 V 72 Z"
        fill="url(#goldSeal)"
      />
      <path
        d="M 82 76 H 74 C 70 76 68 80 70 85 C 72 90 76 93 82 93 V 76 Z"
        fill="#F59E0B"
      />
      <path
        d="M 118 76 H 126 C 130 76 132 80 130 85 C 128 90 124 93 118 93 V 76 Z"
        fill="#F59E0B"
      />
      <rect x="96" y="106" width="8" height="12" fill="#D97706" />
      <rect x="88" y="118" width="24" height="6" rx="3" fill="#B45309" />

      {/* Star sparkle on trophy */}
      <path d="M 100 80 L 102 85 L 107 85.5 L 103 89 L 104.5 94 L 100 91 L 95.5 94 L 97 89 L 93 85.5 L 98 85 Z" fill="#FFFFFF" />

      {/* Confetti & Sparkles */}
      <circle cx="45" cy="45" r="3" fill="#F59E0B" />
      <circle cx="155" cy="40" r="4" fill="#96171B" />
      <circle cx="35" cy="115" r="3" fill="#10B981" />
      <circle cx="165" cy="120" r="3.5" fill="#3B82F6" />

      <path d="M 45 75 L 52 70" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <path d="M 155 75 L 148 70" stroke="#96171B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

/**
 * 3. SOP Culinary & Recipe Knowledge Illustration
 */
export const SopKnowledgeIllustration: React.FC<IllustrationProps> = ({ className = '', size = 160 }) => {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.85)}
      viewBox="0 0 200 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      {/* Recipe Book */}
      <rect x="30" y="40" width="140" height="95" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
      <path d="M 100 40 V 135" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="4 4" />
      
      {/* Left Page Lines */}
      <rect x="42" y="55" width="44" height="6" rx="2" fill="#96171B" />
      <rect x="42" y="68" width="48" height="4" rx="2" fill="#94A3B8" />
      <rect x="42" y="77" width="42" height="4" rx="2" fill="#CBD5E1" />
      <rect x="42" y="86" width="46" height="4" rx="2" fill="#CBD5E1" />
      <rect x="42" y="95" width="36" height="4" rx="2" fill="#CBD5E1" />

      {/* Thermometer / 170°C Frying Temp Indicator on Right Page */}
      <rect x="115" y="55" width="55" height="65" rx="6" fill="#FEF2F2" stroke="#FCA5A5" strokeWidth="1" />
      <circle cx="142" cy="74" r="10" fill="#EF4444" fillOpacity="0.15" />
      <path d="M 142 68 V 76" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
      <circle cx="142" cy="78" r="3.5" fill="#DC2626" />
      <text x="142" y="98" textAnchor="middle" fill="#991B1B" fontSize="10" fontWeight="800">170°C</text>
      <text x="142" y="110" textAnchor="middle" fill="#7F1D1D" fontSize="7" fontWeight="600">SUHU STANDAR</text>

      {/* HACCP Shield Badge */}
      <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.06))">
        <circle cx="45" cy="125" r="18" fill="#10B981" />
        <path d="M 45 115 L 53 118 V 126 C 53 131 45 136 45 136 C 45 136 37 131 37 126 V 118 L 45 115 Z" fill="#FFFFFF" />
        <path d="M 42 125 L 44.5 127.5 L 48.5 123" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

/**
 * 4. Mentorship & Field Trainer Illustration
 */
export const MentorshipIllustration: React.FC<IllustrationProps> = ({ className = '', size = 180 }) => {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.8)}
      viewBox="0 0 220 176"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      {/* Background Circular Aura */}
      <circle cx="110" cy="88" r="75" fill="#F8FAFC" />

      {/* Mentor (Left) */}
      <circle cx="75" cy="55" r="16" fill="#96171B" />
      <path d="M 52 95 C 52 78 62 74 75 74 C 88 74 98 78 98 95 V 105 H 52 V 95 Z" fill="#96171B" />

      {/* Mentee / Trainee (Right) */}
      <circle cx="145" cy="62" r="14" fill="#F59E0B" />
      <path d="M 125 98 C 125 84 134 80 145 80 C 156 80 165 84 165 98 V 105 H 125 V 98 Z" fill="#F59E0B" />

      {/* Coaching Dialogue Bubble */}
      <g filter="drop-shadow(0 4px 8px rgba(0,0,0,0.06))">
        <rect x="75" y="18" width="70" height="24" rx="8" fill="#1E293B" />
        <polygon points="105,42 112,42 108,47" fill="#1E293B" />
        <rect x="85" y="27" width="22" height="3" rx="1.5" fill="#FBD66A" />
        <rect x="111" y="27" width="24" height="3" rx="1.5" fill="#94A3B8" />
      </g>

      {/* Roadmap Step Bars */}
      <rect x="40" y="125" width="40" height="20" rx="5" fill="#E2E8F0" />
      <text x="60" y="139" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="700">TNA</text>

      <rect x="90" y="120" width="40" height="25" rx="5" fill="#CBD5E1" />
      <text x="110" y="136" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="700">GROW</text>

      <rect x="140" y="112" width="40" height="33" rx="5" fill="#96171B" />
      <text x="160" y="132" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800">LULUS</text>
    </svg>
  );
};
