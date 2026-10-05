import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/**
 * Clean & Elegant Pure SVG Icons for HARA Chicken Enterprise
 * Replaces all emojis/emoticons with professional vector graphics
 */

export const ChickenIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
  >
    <path d="M15.5 13.5c1.66 0 3-1.34 3-3 0-.48-.11-.94-.31-1.35.83-.41 1.31-1.32 1.15-2.28-.18-1.07-1.12-1.87-2.2-1.87h-.64C15.82 4.4 15.02 4 14.1 4c-.95 0-1.78.43-2.33 1.1A4.98 4.98 0 0 0 8 7c-2.76 0-5 2.24-5 5 0 2.21 1.43 4.08 3.44 4.74.34.88.94 1.62 1.7 2.12L7 20h3l1.2-1.6c.26.07.53.1.8.1 1.18 0 2.26-.41 3.1-1.1.48.37 1.08.6 1.73.6 1.47 0 2.68-1.06 2.92-2.45-.72.63-1.68 1.05-2.75 1.05-.28 0-.55-.03-.81-.08.84-.79 1.31-1.92 1.31-3.02z" />
    <circle cx="15.5" cy="8.5" r=".75" fill="currentColor" />
  </svg>
);

export const CashierIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="6" y1="15" x2="10" y2="15" />
    <line x1="14" y1="15" x2="18" y2="15" />
    <circle cx="16" cy="7" r="1" fill="currentColor" />
  </svg>
);

export const ChiliIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
  >
    <path d="M17 3.5c-.8.8-1.5 2-1 3.5.5 1.5 0 3-1 4.5s-2.5 3-4 5.5-2.5 5.5-1 6.5 4 0 6-2 3.5-4 4.5-6 1-4 .5-6.5-1.5-3.5-3-4.5z" />
    <path d="M17 3.5c1-1 3-1.5 4-.5s.5 3-.5 4" />
  </svg>
);

export const BroomCleanIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
  >
    <path d="m19 5-8.5 8.5" />
    <path d="m13.5 10.5 4 4" />
    <path d="M10.5 13.5 5 19l2 2 5.5-5.5" />
    <path d="M4 21c-1 0-2-1-2-2 0-.8.5-1.5 1.2-1.8L8 13l3 3-4.2 4.8c-.3.7-1 1.2-1.8 1.2h-1z" />
    <path d="m17 7 2-2 1 1-2 2" />
  </svg>
);

export const VerifiedCheckIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const WarningAlertIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const StarSolidIcon: React.FC<IconProps> = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    className={`shrink-0 ${className}`}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const FlameHotIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);
