'use client';

import React from 'react';

export type TrophyType = 
  | 'fifa_globe'       // RPL - FIFA Style Golden Globe & Figures
  | 'icc_pillars'      // SPL - ICC Style Golden Sphere on 3 Silver Pillars
  | 'webb_ellis'       // WPL - Rugby/Royal Webb Ellis Chalice with Crown Lid & Handles
  | 'fluted_cup'       // Basketball / Naismith Fluted Gold Chalice
  | 'winner_gold'      // Classic Gold Championship World Cup
  | 'runner_silver'    // Silver Runner-Up Cup
  | 'bronze_cup'       // Bronze 3rd Place Cup
  | 'counselor_mvp';

interface ChampionshipTrophy3DProps {
  type?: TrophyType;
  size?: number;
  label?: string;
  sublabel?: string;
  badgeLabel?: string;
  badgeBg?: string;
  className?: string;
}

export default function ChampionshipTrophy3D({
  type = 'winner_gold',
  size = 140,
  label,
  sublabel,
  badgeLabel,
  badgeBg,
  className = '',
}: ChampionshipTrophy3DProps) {
  const uniqueId = `trophy-${type}-${Math.random().toString(36).substr(2, 6)}`;

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* ── 1. FIFA GOLDEN GLOBE WORLD CUP (RPL) ── */}
      {type === 'fifa_globe' && (
        <svg width={size} height={Math.round(size * 1.15)} viewBox="0 0 160 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id={`${uniqueId}-rpl-glow`} cx="80" cy="80" r="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${uniqueId}-gold-1`} x1="20" y1="20" x2="140" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="20%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="80%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id={`${uniqueId}-gold-light`} x1="80" y1="20" x2="80" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${uniqueId}-malachite`} x1="40" y1="200" x2="120" y2="230" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="80" cy="110" r="70" fill={`url(#${uniqueId}-rpl-glow)`} />

          {/* Golden Globe on top */}
          <circle cx="80" cy="54" r="34" fill={`url(#${uniqueId}-gold-1)`} stroke="#78350f" strokeWidth="1.5" />
          {/* Globe latitude / longitude relief lines */}
          <ellipse cx="80" cy="54" rx="34" ry="12" stroke="#78350f" strokeWidth="1" opacity="0.6" fill="none" />
          <ellipse cx="80" cy="54" rx="14" ry="34" stroke="#78350f" strokeWidth="1" opacity="0.6" fill="none" />
          {/* Continents embossing relief */}
          <path d="M 64 42 Q 74 38 88 44 Q 96 52 90 64 Q 78 68 68 58 Z" fill="#fde047" opacity="0.75" />
          <circle cx="70" cy="44" r="10" fill={`url(#${uniqueId}-gold-light)`} />

          {/* Spiral Ascending Figures (Two Athletes lifting the Earth) */}
          <path d="M 52 82 C 48 64 62 58 76 72 C 86 82 82 108 84 130 C 85 142 78 160 76 172 L 64 172 C 60 156 56 128 58 110 C 60 94 48 94 52 82 Z" fill={`url(#${uniqueId}-gold-1)`} stroke="#78350f" strokeWidth="1" />
          <path d="M 108 82 C 112 64 98 58 84 72 C 74 82 78 108 76 130 C 75 142 82 160 84 172 L 96 172 C 100 156 104 128 102 110 C 100 94 112 94 108 82 Z" fill={`url(#${uniqueId}-gold-1)`} stroke="#78350f" strokeWidth="1" />
          {/* Central spiral intertwine */}
          <path d="M 70 88 C 76 96 84 96 90 88 C 86 112 84 140 80 168 C 76 140 74 112 70 88 Z" fill={`url(#${uniqueId}-gold-1)`} />
          
          {/* Stem highlights */}
          <path d="M 78 75 L 82 75 L 84 165 L 76 165 Z" fill={`url(#${uniqueId}-gold-light)`} opacity="0.6" />

          {/* Base Pedestal (Flaring Gold Base) */}
          <path d="M 62 172 L 98 172 L 108 206 L 52 206 Z" fill={`url(#${uniqueId}-gold-1)`} stroke="#78350f" strokeWidth="1.5" />

          {/* Dual Malachite Green Rings (Iconic FIFA base) */}
          <rect x="50" y="206" width="60" height="8" rx="2" fill={`url(#${uniqueId}-malachite)`} stroke="#064e3b" strokeWidth="1" />
          <rect x="46" y="218" width="68" height="10" rx="2" fill={`url(#${uniqueId}-malachite)`} stroke="#064e3b" strokeWidth="1" />

          {/* Gold separator ring & bottom rim */}
          <rect x="48" y="214" width="64" height="4" fill={`url(#${uniqueId}-gold-1)`} />
          <rect x="44" y="228" width="72" height="6" rx="2" fill={`url(#${uniqueId}-gold-1)`} stroke="#78350f" strokeWidth="1" />
        </svg>
      )}

      {/* ── 2. ICC CRICKET WORLD CUP STYLE (SPL) ── */}
      {type === 'icc_pillars' && (
        <svg width={size} height={Math.round(size * 1.15)} viewBox="0 0 160 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id={`${uniqueId}-spl-glow`} cx="80" cy="70" r="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${uniqueId}-silver-pillar`} x1="30" y1="50" x2="130" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#e2e8f0" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="80%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id={`${uniqueId}-golden-orb`} x1="60" y1="20" x2="100" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="30%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="80" cy="90" r="70" fill={`url(#${uniqueId}-spl-glow)`} />

          {/* Golden Cricket Sphere with Seam */}
          <circle cx="80" cy="48" r="28" fill={`url(#${uniqueId}-golden-orb)`} stroke="#b45309" strokeWidth="1.5" />
          {/* Seam Angled */}
          <ellipse cx="80" cy="48" rx="28" ry="8" transform="rotate(-30 80 48)" stroke="#fffbeb" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
          <circle cx="72" cy="38" r="8" fill="#ffffff" opacity="0.6" />

          {/* Horizontal Top Ring connecting pillars */}
          <ellipse cx="80" cy="56" rx="34" ry="8" fill="none" stroke={`url(#${uniqueId}-silver-pillar)`} strokeWidth="3.5" />

          {/* 3 Sweeping Silver Pillars (Representing Stumps & Bails) */}
          {/* Left Sweeping Pillar */}
          <path d="M 48 56 C 42 100 50 150 62 190 L 70 190 C 58 150 50 100 56 56 Z" fill={`url(#${uniqueId}-silver-pillar)`} stroke="#334155" strokeWidth="1" />
          {/* Right Sweeping Pillar */}
          <path d="M 112 56 C 118 100 110 150 98 190 L 90 190 C 102 150 110 100 104 56 Z" fill={`url(#${uniqueId}-silver-pillar)`} stroke="#334155" strokeWidth="1" />
          {/* Center Vertical Pillar */}
          <path d="M 76 58 L 84 58 L 82 190 L 78 190 Z" fill={`url(#${uniqueId}-silver-pillar)`} stroke="#334155" strokeWidth="1" />
          {/* Center Pillar Highlight */}
          <line x1="80" y1="60" x2="80" y2="188" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />

          {/* Mid-pillar Gold Emblem Ring */}
          <circle cx="80" cy="118" r="6" fill={`url(#${uniqueId}-golden-orb)`} stroke="#78350f" strokeWidth="1" />

          {/* Hardwood / Metal Circular Pedestal */}
          {/* Tier 1 */}
          <ellipse cx="80" cy="190" rx="32" ry="7" fill={`url(#${uniqueId}-silver-pillar)`} stroke="#334155" strokeWidth="1.5" />
          {/* Tier 2 Mahogany Cylinder */}
          <path d="M 44 192 L 116 192 L 122 220 L 38 220 Z" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Tier 2 Rim */}
          <ellipse cx="80" cy="220" rx="42" ry="9" fill="#09090b" stroke="#71717a" strokeWidth="1.5" />
          {/* Engraved Plaque on base */}
          <rect x="54" y="200" width="52" height="12" rx="2" fill={`url(#${uniqueId}-golden-orb)`} stroke="#78350f" strokeWidth="1" />
          <text x="80" y="209" textAnchor="middle" fontSize="7" fontWeight="900" fill="#78350f">LEAGUE CUP</text>
        </svg>
      )}

      {/* ── 3. WEBB ELLIS ROYAL CHALICE (WPL) ── */}
      {type === 'webb_ellis' && (
        <svg width={size} height={Math.round(size * 1.15)} viewBox="0 0 160 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id={`${uniqueId}-wpl-glow`} cx="80" cy="80" r="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${uniqueId}-royal-gold`} x1="20" y1="20" x2="140" y2="220" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="25%" stopColor="#fde047" />
              <stop offset="55%" stopColor="#eab308" />
              <stop offset="85%" stopColor="#a16207" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="80" cy="100" r="70" fill={`url(#${uniqueId}-wpl-glow)`} />

          {/* Crown Lid Finial on top */}
          <circle cx="80" cy="24" r="5" fill={`url(#${uniqueId}-royal-gold)`} stroke="#713f12" strokeWidth="1" />
          <path d="M 76 28 L 84 28 L 82 36 L 78 36 Z" fill={`url(#${uniqueId}-royal-gold)`} />
          {/* Domed Ornate Lid */}
          <path d="M 54 48 C 56 36 66 32 80 32 C 94 32 104 36 106 48 Z" fill={`url(#${uniqueId}-royal-gold)`} stroke="#713f12" strokeWidth="1.5" />
          <ellipse cx="80" cy="48" rx="26" ry="6" fill={`url(#${uniqueId}-royal-gold)`} stroke="#713f12" strokeWidth="1.5" />

          {/* Ornate Double-Scroll Handles */}
          {/* Left Handle */}
          <path d="M 54 60 C 18 56 12 106 48 122 C 34 106 32 76 56 70 Z" fill={`url(#${uniqueId}-royal-gold)`} stroke="#713f12" strokeWidth="1.5" />
          {/* Right Handle */}
          <path d="M 106 60 C 142 56 148 106 112 122 C 126 106 128 76 104 70 Z" fill={`url(#${uniqueId}-royal-gold)`} stroke="#713f12" strokeWidth="1.5" />

          {/* Main Chalice Body */}
          <path d="M 54 48 Q 80 44 106 48 L 102 96 C 98 126 88 138 80 138 C 72 138 62 126 58 96 Z" fill={`url(#${uniqueId}-royal-gold)`} stroke="#713f12" strokeWidth="2" />
          
          {/* Embossed Royal Crest on Chalice */}
          <circle cx="80" cy="84" r="14" fill="#713f12" opacity="0.6" />
          <circle cx="80" cy="84" r="12" fill={`url(#${uniqueId}-royal-gold)`} stroke="#fde047" strokeWidth="1" />
          <text x="80" y="88" textAnchor="middle" fontSize="10" fontWeight="900" fill="#713f12">👑</text>

          {/* Stem and Knops */}
          <path d="M 74 138 L 86 138 L 84 168 L 76 168 Z" fill={`url(#${uniqueId}-royal-gold)`} stroke="#713f12" strokeWidth="1.5" />
          <ellipse cx="80" cy="150" rx="10" ry="3.5" fill="#fde047" stroke="#713f12" strokeWidth="1" />
          <ellipse cx="80" cy="168" rx="16" ry="5" fill={`url(#${uniqueId}-royal-gold)`} stroke="#713f12" strokeWidth="1.5" />

          {/* Tiered Mahogany & Gold Base */}
          <path d="M 58 170 L 102 170 L 108 188 L 52 188 Z" fill="#271c19" stroke="#eab308" strokeWidth="1.5" />
          <path d="M 46 188 L 114 188 L 122 222 L 38 222 Z" fill="#18110f" stroke="#a16207" strokeWidth="2" />
          <ellipse cx="80" cy="222" rx="42" ry="8" fill="#0f0b0a" stroke="#713f12" strokeWidth="1.5" />

          {/* Gold Engraving Plaque */}
          <rect x="52" y="196" width="56" height="15" rx="2" fill={`url(#${uniqueId}-royal-gold)`} stroke="#713f12" strokeWidth="1" />
          <text x="80" y="206" textAnchor="middle" fontSize="7" fontWeight="900" fill="#713f12">ROYAL CUP</text>
        </svg>
      )}

      {/* ── 4. FLUTED / BASKETBALL WORLD CUP (fluted_cup) ── */}
      {type === 'fluted_cup' && (
        <svg width={size} height={Math.round(size * 1.15)} viewBox="0 0 160 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id={`${uniqueId}-flute-glow`} cx="80" cy="70" r="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${uniqueId}-flute-gold`} x1="20" y1="20" x2="140" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="30%" stopColor="#fde047" />
              <stop offset="60%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>

          <circle cx="80" cy="90" r="70" fill={`url(#${uniqueId}-flute-glow)`} />
          {/* Fluted Flare Crown */}
          <path d="M 44 32 C 48 50 60 90 70 120 L 90 120 C 100 90 112 50 116 32 Z" fill={`url(#${uniqueId}-flute-gold)`} stroke="#78350f" strokeWidth="1.5" />
          <ellipse cx="80" cy="32" rx="36" ry="8" fill="#fef08a" stroke="#78350f" strokeWidth="1.5" />
          {/* Flute Ridges */}
          <line x1="56" y1="36" x2="74" y2="120" stroke="#78350f" strokeWidth="1.5" opacity="0.6" />
          <line x1="68" y1="38" x2="77" y2="120" stroke="#fffbeb" strokeWidth="1.5" opacity="0.8" />
          <line x1="80" y1="40" x2="80" y2="120" stroke="#fffbeb" strokeWidth="2" opacity="0.9" />
          <line x1="92" y1="38" x2="83" y2="120" stroke="#fffbeb" strokeWidth="1.5" opacity="0.8" />
          <line x1="104" y1="36" x2="86" y2="120" stroke="#78350f" strokeWidth="1.5" opacity="0.6" />

          {/* Stem & Solid Pedestal */}
          <circle cx="80" cy="132" r="10" fill={`url(#${uniqueId}-flute-gold)`} stroke="#78350f" strokeWidth="1.5" />
          <path d="M 72 138 L 88 138 L 84 174 L 76 174 Z" fill={`url(#${uniqueId}-flute-gold)`} stroke="#78350f" strokeWidth="1.5" />
          
          {/* Black Marble Round Plinth */}
          <ellipse cx="80" cy="180" rx="32" ry="7" fill={`url(#${uniqueId}-flute-gold)`} stroke="#78350f" strokeWidth="1.5" />
          <path d="M 44 182 L 116 182 L 122 216 L 38 216 Z" fill="#18181b" stroke="#f59e0b" strokeWidth="2" />
          <ellipse cx="80" cy="216" rx="42" ry="9" fill="#09090b" stroke="#52525b" strokeWidth="1.5" />
        </svg>
      )}

      {/* ── 5. DEFAULT / WINNER GOLD / RUNNER SILVER / BRONZE ── */}
      {(type === 'winner_gold' || type === 'runner_silver' || type === 'bronze_cup' || type === 'counselor_mvp') && (
        <svg width={size} height={size} viewBox="0 0 160 184" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`${uniqueId}-metal`} x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
              {type === 'runner_silver' ? (
                <>
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="25%" stopColor="#f1f5f9" />
                  <stop offset="55%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#334155" />
                </>
              ) : type === 'bronze_cup' ? (
                <>
                  <stop offset="0%" stopColor="#ffedd5" />
                  <stop offset="25%" stopColor="#fdba74" />
                  <stop offset="55%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#431407" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="25%" stopColor="#fde047" />
                  <stop offset="55%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#78350f" />
                </>
              )}
            </linearGradient>
            <radialGradient id={`${uniqueId}-glow`} cx="80" cy="80" r="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={type === 'runner_silver' ? '#94a3b8' : type === 'bronze_cup' ? '#ea580c' : '#f59e0b'} stopOpacity="0.45" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="80" cy="80" r="60" fill={`url(#${uniqueId}-glow)`} />
          {/* Laurel Wreath */}
          <path d="M 28 86 C 24 64 36 42 54 30 M 132 86 C 136 64 124 42 106 30" stroke="#fde047" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 6" opacity="0.8" />
          {/* Handles */}
          <path d="M 46 44 C 18 44 14 84 46 96 C 36 82 36 58 52 50 Z" fill={`url(#${uniqueId}-metal)`} stroke="#451a03" strokeWidth="1.5" />
          <path d="M 114 44 C 142 44 146 84 114 96 C 124 82 124 58 108 50 Z" fill={`url(#${uniqueId}-metal)`} stroke="#451a03" strokeWidth="1.5" />
          {/* Main Chalice Body */}
          <path d="M 42 34 Q 80 26 118 34 L 114 78 C 110 102 96 116 80 116 C 64 116 50 102 46 78 Z" fill={`url(#${uniqueId}-metal)`} stroke="#451a03" strokeWidth="2" />
          <ellipse cx="80" cy="34" rx="38" ry="8" fill="#fef08a" opacity="0.9" stroke="#451a03" strokeWidth="1.5" />
          {/* Central Crest */}
          <circle cx="80" cy="66" r="14" fill="#000000" opacity="0.5" />
          <circle cx="80" cy="66" r="12" fill={`url(#${uniqueId}-metal)`} stroke="#fde047" strokeWidth="1.5" />
          <text x="80" y="71" textAnchor="middle" fontSize="12" fontWeight="900" fill="#451a03">★</text>
          {/* Stem & Pedestal */}
          <path d="M 72 116 L 88 116 L 85 136 L 75 136 Z" fill={`url(#${uniqueId}-metal)`} stroke="#451a03" strokeWidth="1.5" />
          <path d="M 60 138 L 100 138 L 104 150 L 56 150 Z" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
          <path d="M 46 150 L 114 150 L 122 172 L 38 172 Z" fill="#0f172a" stroke="#d97706" strokeWidth="2" />
          <rect x="52" y="154" width="56" height="14" rx="2" fill="#fde047" stroke="#451a03" strokeWidth="1" />
          <text x="80" y="164" textAnchor="middle" fontSize="7" fontWeight="900" fill="#451a03" letterSpacing="0.06em">CHAMPION</text>
        </svg>
      )}

      {/* ── BOLD VIVID RECTANGULAR NAMEPLATE BANNER (Like reference image) ── */}
      {badgeLabel && (
        <div style={{
          marginTop: '10px',
          width: '100%',
          maxWidth: '220px',
          padding: '6px 12px',
          background: badgeBg || '#db2777', // Vivid pink / custom banner
          color: '#ffffff',
          fontSize: '0.78rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          textAlign: 'center',
          borderRadius: '4px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {badgeLabel}
        </div>
      )}

      {/* Sublabel */}
      {sublabel && (
        <div style={{
          marginTop: '4px',
          fontSize: '0.72rem',
          color: 'var(--muted)',
          fontWeight: 700,
          textAlign: 'center',
        }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}
