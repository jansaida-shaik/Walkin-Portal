'use client';

import React from 'react';

export type BadgeTier = 'mythic' | 'legendary' | 'epic' | 'elite' | 'gold' | 'silver' | 'bronze';

interface BadgeCrestProps {
  tier?: BadgeTier | string;
  size?: number;
  isUnlocked?: boolean;
  icon?: string;
  className?: string;
}

export default function BadgeCrest({
  tier = 'gold',
  size = 72,
  isUnlocked = true,
  icon,
  className = '',
}: BadgeCrestProps) {
  const grayscaleFilter = isUnlocked ? 'none' : 'grayscale(100%) opacity(0.45)';

  // Theme palettes based on gaming ranks
  const themes: Record<string, {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    bannerBg: string;
    label: string;
    labelColor: string;
  }> = {
    mythic: {
      primary: '#ef4444',
      secondary: '#b91c1c',
      accent: '#fbbf24',
      glow: 'rgba(239, 68, 68, 0.45)',
      bannerBg: 'linear-gradient(135deg, #ef4444, #7f1d1d)',
      label: 'MYTHIC',
      labelColor: '#fee2e2',
    },
    legendary: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#fef08a',
      glow: 'rgba(245, 158, 11, 0.45)',
      bannerBg: 'linear-gradient(135deg, #f59e0b, #92400e)',
      label: 'LEGEND',
      labelColor: '#fef3c7',
    },
    epic: {
      primary: '#a855f7',
      secondary: '#7e22ce',
      accent: '#f3e8ff',
      glow: 'rgba(168, 85, 247, 0.45)',
      bannerBg: 'linear-gradient(135deg, #a855f7, #581c87)',
      label: 'EPIC',
      labelColor: '#f3e8ff',
    },
    elite: {
      primary: '#06b6d4',
      secondary: '#0e7490',
      accent: '#cffafe',
      glow: 'rgba(6, 182, 212, 0.45)',
      bannerBg: 'linear-gradient(135deg, #06b6d4, #155e75)',
      label: 'ELITE',
      labelColor: '#e0f2fe',
    },
    gold: {
      primary: '#eab308',
      secondary: '#a16207',
      accent: '#fef9c3',
      glow: 'rgba(234, 179, 8, 0.4)',
      bannerBg: 'linear-gradient(135deg, #eab308, #854d0e)',
      label: 'MASTER',
      labelColor: '#fef9c3',
    },
    silver: {
      primary: '#94a3b8',
      secondary: '#475569',
      accent: '#f1f5f9',
      glow: 'rgba(148, 163, 184, 0.35)',
      bannerBg: 'linear-gradient(135deg, #94a3b8, #334155)',
      label: 'SPECIALIST',
      labelColor: '#f8fafc',
    },
    bronze: {
      primary: '#cd7f32',
      secondary: '#78350f',
      accent: '#ffedd5',
      glow: 'rgba(205, 127, 50, 0.35)',
      bannerBg: 'linear-gradient(135deg, #cd7f32, #78350f)',
      label: 'ROOKIE',
      labelColor: '#ffedd5',
    },
  };

  const t = themes[tier] || themes.gold;
  const gradientId = `badge-grad-${tier}`;
  const glowId = `badge-glow-${tier}`;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size * 1.12,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        filter: grayscaleFilter,
        transition: 'transform 0.2s ease, filter 0.2s ease',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: isUnlocked ? `drop-shadow(0 4px 12px ${t.glow})` : 'none',
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={t.accent} />
            <stop offset="35%" stopColor={t.primary} />
            <stop offset="100%" stopColor={t.secondary} />
          </linearGradient>
          <radialGradient id={glowId} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={t.accent} stopOpacity="0.8" />
            <stop offset="60%" stopColor={t.primary} stopOpacity="0.4" />
            <stop offset="100%" stopColor={t.secondary} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Shield Border Wings */}
        <path
          d="M50 4 L86 16 L88 56 C88 74 72 88 50 96 C28 88 12 74 12 56 L14 16 Z"
          fill={`url(#${gradientId})`}
          stroke={t.accent}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Inner Shield Facet Plate */}
        <path
          d="M50 11 L79 21 L80 54 C80 69 67 80 50 87 C33 80 20 69 20 54 L21 21 Z"
          fill="#11131f"
          stroke={t.primary}
          strokeWidth="1.5"
        />

        {/* Radial Glow Inside Shield */}
        <path
          d="M50 11 L79 21 L80 54 C80 69 67 80 50 87 C33 80 20 69 20 54 L21 21 Z"
          fill={`url(#${glowId})`}
          opacity="0.65"
        />

        {/* Shield Crown / Apex Star Pip */}
        <polygon
          points="50,14 53,20 59,21 54,26 56,32 50,28 44,32 46,26 41,21 47,20"
          fill={t.accent}
          stroke={t.secondary}
          strokeWidth="0.8"
        />

        {/* Dual Flanking Star Pips for Epic / Legendary / Mythic */}
        {(tier === 'epic' || tier === 'legendary' || tier === 'mythic' || tier === 'elite') && (
          <>
            <circle cx="34" cy="30" r="2.2" fill={t.accent} />
            <circle cx="66" cy="30" r="2.2" fill={t.accent} />
          </>
        )}
      </svg>

      {/* Central Icon inside the shield */}
      <div
        style={{
          position: 'absolute',
          top: '32%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: size * 0.32,
          lineHeight: 1,
          filter: isUnlocked ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' : 'none',
          userSelect: 'none',
        }}
      >
        {icon || '🏆'}
      </div>

      {/* Bottom Rank Ribbon Plate */}
      <div
        style={{
          position: 'absolute',
          bottom: '2px',
          background: t.bannerBg,
          border: `1.5px solid ${t.accent}`,
          borderRadius: '4px',
          padding: '1px 6px',
          fontSize: Math.max(9, Math.round(size * 0.12)),
          fontWeight: 900,
          color: t.labelColor,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          whiteSpace: 'nowrap',
          zIndex: 2,
        }}
      >
        {t.label}
      </div>
    </div>
  );
}
