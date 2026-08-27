'use client';

import React from 'react';

export type BadgeTier = 'mythic' | 'legendary' | 'epic' | 'elite' | 'gold' | 'silver' | 'bronze';

interface BadgeCrestProps {
  tier?: BadgeTier | string;
  size?: number;
  isUnlocked?: boolean;
  icon?: string;
  shape?: 'shield' | 'medal';
  className?: string;
}

export default function BadgeCrest({
  tier = 'gold',
  size = 72,
  isUnlocked = true,
  icon,
  shape = 'shield',
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

  // Explicit metallic color palettes for Medal shape
  let t = themes[tier] || themes.gold;
  if (shape === 'medal') {
    if (icon === '🥇' || tier === 'gold') {
      t = {
        primary: '#f59e0b',
        secondary: '#92400e',
        accent: '#fef08a',
        glow: 'rgba(245, 158, 11, 0.5)',
        bannerBg: 'linear-gradient(135deg, #f59e0b, #b45309)',
        label: 'GOLD MEDAL',
        labelColor: '#ffffff',
      };
    } else if (icon === '🥈' || tier === 'silver' || tier === 'legendary') {
      t = {
        primary: '#94a3b8',
        secondary: '#334155',
        accent: '#ffffff',
        glow: 'rgba(148, 163, 184, 0.45)',
        bannerBg: 'linear-gradient(135deg, #94a3b8, #475569)',
        label: 'SILVER MEDAL',
        labelColor: '#ffffff',
      };
    } else if (icon === '🥉' || tier === 'bronze') {
      t = {
        primary: '#cd7f32',
        secondary: '#78350f',
        accent: '#ffedd5',
        glow: 'rgba(205, 127, 50, 0.45)',
        bannerBg: 'linear-gradient(135deg, #cd7f32, #78350f)',
        label: 'BRONZE MEDAL',
        labelColor: '#ffffff',
      };
    } else if (icon === '🏆') {
      t = {
        primary: '#f59e0b',
        secondary: '#78350f',
        accent: '#fffbeb',
        glow: 'rgba(245, 158, 11, 0.55)',
        bannerBg: 'linear-gradient(135deg, #f59e0b, #b45309)',
        label: '★ SEASON MVP ★',
        labelColor: '#ffffff',
      };
    } else if (icon === '🎓') {
      t = {
        primary: '#6366f1',
        secondary: '#312e81',
        accent: '#e0e7ff',
        glow: 'rgba(99, 102, 241, 0.45)',
        bannerBg: 'linear-gradient(135deg, #6366f1, #3730a3)',
        label: 'VOLUME LEADER',
        labelColor: '#ffffff',
      };
    }
  }
  const gradientId = `badge-grad-${tier}-${Math.random().toString(36).substr(2, 4)}`;
  const glowId = `badge-glow-${tier}-${Math.random().toString(36).substr(2, 4)}`;

  // ── 1. CIRCULAR CHAMPIONSHIP MEDAL SHAPE ──
  if (shape === 'medal') {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          width: size,
          height: size * 1.15,
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
          height={size * 1.15}
          viewBox="0 0 100 115"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: isUnlocked ? `drop-shadow(0 6px 14px ${t.glow})` : 'none',
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={t.accent} />
              <stop offset="35%" stopColor={t.primary} />
              <stop offset="100%" stopColor={t.secondary} />
            </linearGradient>
            <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={t.accent} stopOpacity="0.85" />
              <stop offset="50%" stopColor={t.primary} stopOpacity="0.5" />
              <stop offset="100%" stopColor={t.secondary} stopOpacity="0.9" />
            </radialGradient>
            {/* Ribbon Gradient */}
            <linearGradient id={`${gradientId}-ribbon-left`} x1="0" y1="0" x2="30" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id={`${gradientId}-ribbon-right`} x1="100" y1="0" x2="70" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* ── Neck Ribbon (V-Fold) ── */}
          {/* Left Ribbon Strap */}
          <polygon points="26,0 44,0 50,30 32,30" fill={`url(#${gradientId}-ribbon-left)`} stroke="#1e293b" strokeWidth="0.5" />
          <polygon points="34,0 40,0 45,30 39,30" fill="#ffffff" opacity="0.8" />
          
          {/* Right Ribbon Strap */}
          <polygon points="74,0 56,0 50,30 68,30" fill={`url(#${gradientId}-ribbon-right)`} stroke="#1e293b" strokeWidth="0.5" />
          <polygon points="66,0 60,0 55,30 61,30" fill="#ffffff" opacity="0.8" />

          {/* Ribbon Gold Connector Bail */}
          <rect x="42" y="27" width="16" height="6" rx="2" fill={`url(#${gradientId})`} stroke={t.secondary} strokeWidth="1" />

          {/* ── Main Circular Medal Coin ── */}
          {/* Outer Coin Stepped Rim */}
          <circle cx="50" cy="65" r="34" fill={`url(#${gradientId})`} stroke={t.accent} strokeWidth="1.5" />
          
          {/* Coin Edge Ridge Pattern */}
          <circle cx="50" cy="65" r="31" fill="none" stroke={t.secondary} strokeWidth="1" strokeDasharray="3 2" opacity="0.8" />

          {/* Inner Recessed Medal Core Plate */}
          <circle cx="50" cy="65" r="28" fill="#11131f" stroke={t.primary} strokeWidth="1.2" />
          
          {/* Radial Metallic Core Glow */}
          <circle cx="50" cy="65" r="27" fill={`url(#${glowId})`} opacity="0.45" />

          {/* Laurel Branch Rim Engraving (Left & Right) */}
          <path d="M 30 72 C 30 84 40 90 50 90 C 60 90 70 84 70 72" fill="none" stroke={t.accent} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.7" />
          
          {/* ── 5-STAR CHAMPIONSHIP ARC FOR COUNSELLOR OF THE SEASON & SUPREME MEDALS ── */}
          {(icon === '🏆' || tier === 'mythic') ? (
            <>
              {/* Radiating Diamond Sunburst Rays */}
              <circle cx="50" cy="65" r="24" fill="none" stroke={t.accent} strokeWidth="0.8" strokeDasharray="1 3" opacity="0.9" />
              
              {/* Star 1 (Left Wing) */}
              <polygon points="32,50 33,52.5 35.5,53 33.5,55 34,57.5 32,56 30,57.5 30.5,55 28.5,53 31,52.5" fill={t.accent} stroke={t.secondary} strokeWidth="0.4" />
              {/* Star 2 (Mid-Left) */}
              <polygon points="40,44 41,46.5 43.5,47 41.5,49 42,51.5 40,50 38,51.5 38.5,49 36.5,47 39,46.5" fill={t.accent} stroke={t.secondary} strokeWidth="0.4" />
              {/* Star 3 (Apex Center Grand Crown Star) */}
              <polygon points="50,39 51.8,43 56,43.5 53,46.5 53.8,51 50,48.5 46.2,51 47,46.5 44,43.5 48.2,43" fill="#ffffff" stroke={t.accent} strokeWidth="0.6" />
              {/* Star 4 (Mid-Right) */}
              <polygon points="60,44 61,46.5 63.5,47 61.5,49 62,51.5 60,50 58,51.5 58.5,49 56.5,47 59,46.5" fill={t.accent} stroke={t.secondary} strokeWidth="0.4" />
              {/* Star 5 (Right Wing) */}
              <polygon points="68,50 69,52.5 71.5,53 69.5,55 70,57.5 68,56 66,57.5 66.5,55 64.5,53 67,52.5" fill={t.accent} stroke={t.secondary} strokeWidth="0.4" />

              {/* Special Ribbon Star Connector */}
              <circle cx="50" cy="30" r="2" fill="#ffffff" />
            </>
          ) : (
            /* Single Star Pip for Standard Medals */
            <polygon points="50,42 51.5,45.5 55,46 52.5,48.5 53,52 50,50 47,52 47.5,48.5 45,46 48.5,45.5" fill={t.accent} />
          )}
        </svg>

        {/* Central Icon inside the Medal Coin */}
        <div
          style={{
            position: 'absolute',
            top: '56%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: size * 0.38,
            lineHeight: 1,
            filter: isUnlocked ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.8))' : 'none',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          {icon || '🥇'}
        </div>

        {/* Bottom Medal Label Plaque */}
        <div
          style={{
            position: 'absolute',
            bottom: '0px',
            background: t.bannerBg,
            border: `1.5px solid ${t.accent}`,
            borderRadius: '4px',
            padding: '1px 6px',
            fontSize: Math.max(9, Math.round(size * 0.11)),
            fontWeight: 900,
            color: t.labelColor,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            boxShadow: `0 2px 10px ${t.glow}`,
            whiteSpace: 'nowrap',
            zIndex: 2,
          }}
        >
          {t.label}
        </div>
      </div>
    );
  }

  // ── 2. SHIELD CREST SHAPE (FOR MASTER / MILESTONE BADGES) ──
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

        {/* Subtle Apex Jewel Accent */}
        <circle cx="50" cy="18" r="2.5" fill={t.accent} stroke={t.secondary} strokeWidth="0.8" />
      </svg>

      {/* Central Icon inside the shield */}
      <div
        style={{
          position: 'absolute',
          top: '46%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: size * 0.38,
          lineHeight: 1,
          filter: isUnlocked ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.7))' : 'none',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
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
