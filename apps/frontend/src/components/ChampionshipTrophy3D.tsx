'use client';

import React from 'react';

export type TrophyType = 
  | 'fifa_globe'       // RPL - UAE Super Cup (Exact Reference Match)
  | 'webb_ellis'       // WPL - LaLiga Spain (Exact Reference Match)
  | 'icc_pillars'      // SPL - Club World Cup (Exact Reference Match)
  | 'fluted_cup'       // Classic Cup
  | 'winner_gold'      // Winner Gold Trophy
  | 'runner_silver'    // Runner-Up Silver Trophy
  | 'bronze_cup'       // 3rd Place Bronze Trophy
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
  type = 'fifa_globe',
  size = 155,
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
      {/* ══════════════════════════════════════════════════════════════════
          1. 💰 RPL: SUPER CUP (UNITED ARAB EMIRATES) - 1:1 EXACT MATCH
      ══════════════════════════════════════════════════════════════════ */}
      {type === 'fifa_globe' && (
        <svg width={size} height={Math.round(size * 1.35)} viewBox="0 0 160 216" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id={`${uniqueId}-rpl-glow`} cx="80" cy="90" r="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#d97706" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
            
            {/* Pure Flat 2.0 Warm Honey Gold Shaders */}
            <linearGradient id={`${uniqueId}-gold-main`} x1="30" y1="20" x2="130" y2="170" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="20%" stopColor="#fde047" />
              <stop offset="55%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Specular Highlight Streak */}
            <linearGradient id={`${uniqueId}-gold-spec`} x1="60" y1="50" x2="72" y2="135" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Flat Black Base Shader */}
            <linearGradient id={`${uniqueId}-black-base`} x1="45" y1="170" x2="115" y2="205" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Soft Glow */}
          <circle cx="80" cy="100" r="80" fill={`url(#${uniqueId}-rpl-glow)`} />

          {/* ── 1. TOP SUNBURST ROSETTE FINIAL (Exact 16-Tooth Sun Medal) ── */}
          {/* Outer Sun Gears */}
          <circle cx="80" cy="24" r="15" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1" />
          <g fill="#f59e0b">
            <circle cx="80" cy="9" r="3" />
            <circle cx="80" cy="39" r="3" />
            <circle cx="65" cy="24" r="3" />
            <circle cx="95" cy="24" r="3" />
            <circle cx="69" cy="13" r="3" />
            <circle cx="91" cy="35" r="3" />
            <circle cx="69" cy="35" r="3" />
            <circle cx="91" cy="13" r="3" />
          </g>
          {/* Inner Golden Medallion Disc */}
          <circle cx="80" cy="24" r="11" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
          <circle cx="77" cy="21" r="3.5" fill="#ffffff" opacity="0.85" />
          {/* White Shimmer Cross */}
          <line x1="80" y1="17" x2="80" y2="31" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="73" y1="24" x2="87" y2="24" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />

          {/* Finial Neck Collar */}
          <path d="M 74 38 L 86 38 L 84 46 L 76 46 Z" fill={`url(#${uniqueId}-gold-main)`} stroke="#ca8a04" strokeWidth="0.8" />
          <ellipse cx="80" cy="46" rx="14" ry="3" fill="#f59e0b" stroke="#ca8a04" strokeWidth="0.8" />

          {/* ── 2. DOMED SHOULDER LID ── */}
          <path d="M 52 62 C 52 48 64 42 80 42 C 96 42 108 48 108 62 Z" fill={`url(#${uniqueId}-gold-main)`} stroke="#ca8a04" strokeWidth="1" />
          <ellipse cx="80" cy="62" rx="28" ry="4.5" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1" />

          {/* ── 3. S-CURVED CLASSICAL HANDLES (WITH ROUND CROWNS & SCROLL JOINTS) ── */}
          {/* Left Handle */}
          <path d="M 54 66 C 26 56 16 88 26 108 C 34 124 46 130 56 126 C 46 122 38 112 36 102 C 34 90 44 76 54 66 Z" fill={`url(#${uniqueId}-gold-main)`} stroke="#ca8a04" strokeWidth="1.2" />
          <circle cx="50" cy="64" r="4.5" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="58" cy="124" r="3.5" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1" />
          <path d="M 30 78 C 24 94 30 112 40 120" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.65" />

          {/* Right Handle */}
          <path d="M 106 66 C 134 56 144 88 134 108 C 126 124 114 130 104 126 C 114 122 122 112 124 102 C 126 90 116 76 106 66 Z" fill={`url(#${uniqueId}-gold-main)`} stroke="#ca8a04" strokeWidth="1.2" />
          <circle cx="110" cy="64" r="4.5" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="102" cy="124" r="3.5" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1" />
          <path d="M 130 78 C 136 94 130 112 120 120" stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.65" />

          {/* ── 4. ROUNDED GOLDEN URN CHALICE BODY ── */}
          <path d="M 52 62 C 52 100 62 136 80 140 C 98 136 108 100 108 62 Z" fill={`url(#${uniqueId}-gold-main)`} stroke="#ca8a04" strokeWidth="1.5" />
          <path d="M 58 66 C 58 96 64 126 78 136 L 74 136 C 60 124 54 96 54 66 Z" fill={`url(#${uniqueId}-gold-spec)`} />

          {/* Sparkles on Gold Body */}
          <g stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round">
            <line x1="60" y1="88" x2="60" y2="96" />
            <line x1="56" y1="92" x2="64" y2="92" />
            <line x1="94" y1="80" x2="94" y2="88" />
            <line x1="90" y1="84" x2="98" y2="84" />
            <line x1="88" y1="120" x2="88" y2="128" />
            <line x1="84" y1="124" x2="92" y2="124" />
          </g>

          {/* ── 5. STEM & FLARED FOOT ── */}
          <path d="M 74 140 L 86 140 L 88 158 L 72 158 Z" fill={`url(#${uniqueId}-gold-main)`} stroke="#ca8a04" strokeWidth="1" />
          <ellipse cx="80" cy="158" rx="16" ry="3.5" fill="#f59e0b" stroke="#ca8a04" strokeWidth="0.8" />
          
          <path d="M 64 158 L 96 158 L 102 174 L 58 174 Z" fill={`url(#${uniqueId}-gold-main)`} stroke="#ca8a04" strokeWidth="1" />
          <ellipse cx="80" cy="174" rx="22" ry="4" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1" />

          {/* ── 6. SLEEK SOLID BLACK RECTANGULAR PEDESTAL ── */}
          <path d="M 54 174 L 106 174 L 108 196 L 52 196 Z" fill={`url(#${uniqueId}-black-base)`} stroke="#0f172a" strokeWidth="1.2" />
          <ellipse cx="80" cy="196" rx="28" ry="4.5" fill="#020617" stroke="#0f172a" strokeWidth="1.2" />
          
          {/* Sparkle on base */}
          <line x1="64" y1="182" x2="64" y2="190" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
          <line x1="60" y1="186" x2="68" y2="186" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        </svg>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          2. 🚶 WPL: LALIGA SPAIN - 1:1 EXACT MATCH
      ══════════════════════════════════════════════════════════════════ */}
      {type === 'webb_ellis' && (
        <svg width={size} height={Math.round(size * 1.35)} viewBox="0 0 160 216" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id={`${uniqueId}-wpl-glow`} cx="80" cy="90" r="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#1e3a8a" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
            
            {/* Sterling Silver Shader */}
            <linearGradient id={`${uniqueId}-ll-silver`} x1="30" y1="20" x2="130" y2="170" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#f8fafc" />
              <stop offset="55%" stopColor="#e2e8f0" />
              <stop offset="80%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Hexagonal Gem Shader */}
            <linearGradient id={`${uniqueId}-ll-hex`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Black Bell Base Shader */}
            <linearGradient id={`${uniqueId}-ll-black`} x1="30" y1="140" x2="130" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="40%" stopColor="#1e293b" />
              <stop offset="80%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="80" cy="100" r="80" fill={`url(#${uniqueId}-wpl-glow)`} />

          {/* ── 1. GEOMETRIC ANGULAR SILVER HANDLES (EXACT DIAGONAL TRAPEZOIDS) ── */}
          {/* Left Handle */}
          <path d="M 52 28 L 22 28 L 40 114 L 66 114 L 62 104 L 46 104 L 34 38 L 52 38 Z" fill={`url(#${uniqueId}-ll-silver)`} stroke="#64748b" strokeWidth="1" />
          
          {/* Right Handle */}
          <path d="M 108 28 L 138 28 L 120 114 L 94 114 L 98 104 L 114 104 L 126 38 L 108 38 Z" fill={`url(#${uniqueId}-ll-silver)`} stroke="#64748b" strokeWidth="1" />

          {/* ── 2. MAIN TAPERED V-SHAPED SILVER CHALICE BOWL ── */}
          <ellipse cx="80" cy="20" rx="34" ry="6.5" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
          <path d="M 46 20 L 114 20 L 104 96 C 98 126 88 140 80 140 C 72 140 62 126 56 96 Z" fill={`url(#${uniqueId}-ll-silver)`} stroke="#64748b" strokeWidth="1.5" />
          <ellipse cx="80" cy="20" rx="34" ry="5" fill={`url(#${uniqueId}-ll-silver)`} stroke="#ffffff" strokeWidth="0.8" />

          {/* Specular Highlight Streak */}
          <path d="M 54 24 C 54 58 62 102 76 134 L 72 134 C 58 102 50 58 50 24 Z" fill="#ffffff" opacity="0.65" />

          {/* ── 3. 6 HEXAGONAL FACET GEMS (3 TOP, 2 MID, 1 BOTTOM) ── */}
          {/* Top Row (3) */}
          <polygon points="65,32 70,29 75,32 75,38 70,41 65,38" fill={`url(#${uniqueId}-ll-hex)`} stroke="#64748b" strokeWidth="0.75" />
          <polygon points="80,32 85,29 90,32 90,38 85,41 80,38" fill={`url(#${uniqueId}-ll-hex)`} stroke="#64748b" strokeWidth="0.75" />
          <polygon points="95,32 100,29 105,32 105,38 100,41 95,38" fill={`url(#${uniqueId}-ll-hex)`} stroke="#64748b" strokeWidth="0.75" />
          
          {/* Mid Row (2) */}
          <polygon points="72,48 77,45 82,48 82,54 77,57 72,54" fill={`url(#${uniqueId}-ll-hex)`} stroke="#64748b" strokeWidth="0.75" />
          <polygon points="88,48 93,45 98,48 98,54 93,57 88,54" fill={`url(#${uniqueId}-ll-hex)`} stroke="#64748b" strokeWidth="0.75" />

          {/* Bottom Row (1) */}
          <polygon points="80,64 85,61 90,64 90,70 85,73 80,70" fill={`url(#${uniqueId}-ll-hex)`} stroke="#64748b" strokeWidth="0.75" />

          {/* Sparkles on Chalice */}
          <g stroke="#ffffff" strokeWidth="1" strokeLinecap="round">
            <line x1="106" y1="18" x2="106" y2="28" />
            <line x1="101" y1="23" x2="111" y2="23" />
            <line x1="70" y1="56" x2="70" y2="66" />
            <line x1="65" y1="61" x2="75" y2="61" />
          </g>

          {/* ── 4. FLUTED SILVER STEM ── */}
          <path d="M 72 140 L 88 140 L 86 156 L 74 156 Z" fill={`url(#${uniqueId}-ll-silver)`} stroke="#64748b" strokeWidth="1" />
          <ellipse cx="80" cy="146" rx="10" ry="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.8" />
          <ellipse cx="80" cy="156" rx="18" ry="3.5" fill={`url(#${uniqueId}-ll-silver)`} stroke="#64748b" strokeWidth="1" />

          {/* ── 5. HEAVY BLACK BELL BASE WITH 3 HEXAGONAL STUDS ── */}
          <path d="M 52 156 L 108 156 C 116 156 122 168 120 188 L 40 188 C 38 168 44 156 52 156 Z" fill={`url(#${uniqueId}-ll-black)`} stroke="#0f172a" strokeWidth="1.2" />
          
          {/* 3 Horizontal Hexagonal Studs on Black Base */}
          <polygon points="56,172 61,169 66,172 66,178 61,181 56,178" fill={`url(#${uniqueId}-ll-hex)`} stroke="#64748b" strokeWidth="0.75" />
          <polygon points="75,172 80,169 85,172 85,178 80,181 75,178" fill={`url(#${uniqueId}-ll-hex)`} stroke="#64748b" strokeWidth="0.75" />
          <polygon points="94,172 99,169 104,172 104,178 99,181 94,178" fill={`url(#${uniqueId}-ll-hex)`} stroke="#64748b" strokeWidth="0.75" />

          {/* Bottom Stepped Tier */}
          <rect x="36" y="188" width="88" height="12" rx="2.5" fill="#0f172a" stroke="#020617" strokeWidth="1.2" />
          <rect x="32" y="200" width="96" height="5" rx="1.5" fill="#020617" />
          
          {/* Sparkle on base */}
          <line x1="56" y1="190" x2="56" y2="198" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
          <line x1="52" y1="194" x2="60" y2="194" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.85" />
        </svg>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          3. 🎓 SPL: CLUB WORLD CUP - 1:1 EXACT MATCH
      ══════════════════════════════════════════════════════════════════ */}
      {type === 'icc_pillars' && (
        <svg width={size} height={Math.round(size * 1.35)} viewBox="0 0 160 216" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id={`${uniqueId}-spl-glow`} cx="80" cy="45" r="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            
            {/* 24K Radiant Gold Shader */}
            <linearGradient id={`${uniqueId}-cwc-gold`} x1="30" y1="10" x2="130" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="20%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="80%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>

            {/* Soaring Silver Columns Shader */}
            <linearGradient id={`${uniqueId}-cwc-silver`} x1="20" y1="30" x2="140" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#f8fafc" />
              <stop offset="55%" stopColor="#cbd5e1" />
              <stop offset="85%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="80" cy="80" r="80" fill={`url(#${uniqueId}-spl-glow)`} />

          {/* ── 1. FACETED 24K GOLDEN SOCCER BALL AT APEX ── */}
          <circle cx="80" cy="38" r="23" fill={`url(#${uniqueId}-cwc-gold)`} stroke="#ca8a04" strokeWidth="1.2" />
          
          {/* Soccer Ball Hexagonal Facets & Seams */}
          <polygon points="80,27 87,32 84,41 76,41 73,32" fill="#f59e0b" stroke="#ca8a04" strokeWidth="1.2" />
          <line x1="80" y1="27" x2="80" y2="15" stroke="#ca8a04" strokeWidth="1.2" />
          <line x1="87" y1="32" x2="98" y2="27" stroke="#ca8a04" strokeWidth="1.2" />
          <line x1="84" y1="41" x2="94" y2="52" stroke="#ca8a04" strokeWidth="1.2" />
          <line x1="76" y1="41" x2="66" y2="52" stroke="#ca8a04" strokeWidth="1.2" />
          <line x1="73" y1="32" x2="62" y2="27" stroke="#ca8a04" strokeWidth="1.2" />
          
          {/* Ball Specular Shimmer */}
          <circle cx="75" cy="31" r="5" fill="#ffffff" opacity="0.8" />
          <line x1="87" y1="17" x2="87" y2="28" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="81" y1="22" x2="93" y2="22" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />

          {/* ── 2. FOUR SOARING CURVED SILVER COLUMNS (SLENDER & TALL) ── */}
          {/* Outer Left Pillar Blade (Clawing upward past the ball) */}
          <path d="M 46 24 C 40 54 58 120 64 176 L 70 176 C 62 120 48 56 54 30 Z" fill={`url(#${uniqueId}-cwc-silver)`} stroke="#334155" strokeWidth="1.2" />
          <path d="M 49 26 C 43 56 60 118 66 174" stroke="#ffffff" strokeWidth="1.6" fill="none" opacity="0.85" />
          <polygon points="46,24 40,18 50,26" fill={`url(#${uniqueId}-cwc-silver)`} stroke="#334155" strokeWidth="0.8" />

          {/* Inner Left Pillar Blade */}
          <path d="M 66 36 C 60 68 74 128 75 176 L 78 176 C 77 128 66 68 72 38 Z" fill={`url(#${uniqueId}-cwc-silver)`} stroke="#334155" strokeWidth="1" />
          <line x1="70" y1="38" x2="77" y2="174" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" />

          {/* Center Vertical Support Spire */}
          <line x1="80" y1="62" x2="80" y2="176" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="80" y1="62" x2="80" y2="176" stroke="#ffffff" strokeWidth="1" />

          {/* Inner Right Pillar Blade */}
          <path d="M 94 36 C 100 68 86 128 85 176 L 82 176 C 83 128 94 68 88 38 Z" fill={`url(#${uniqueId}-cwc-silver)`} stroke="#334155" strokeWidth="1" />
          <line x1="90" y1="38" x2="83" y2="174" stroke="#ffffff" strokeWidth="1.2" opacity="0.7" />

          {/* Outer Right Pillar Blade (Clawing upward past the ball) */}
          <path d="M 114 24 C 120 54 102 120 96 176 L 90 176 C 98 120 112 56 106 30 Z" fill={`url(#${uniqueId}-cwc-silver)`} stroke="#334155" strokeWidth="1.2" />
          <path d="M 111 26 C 117 56 100 118 94 174" stroke="#ffffff" strokeWidth="1.6" fill="none" opacity="0.85" />
          <polygon points="114,24 120,18 110,26" fill={`url(#${uniqueId}-cwc-silver)`} stroke="#334155" strokeWidth="0.8" />

          {/* Sparkles on Silver Blades */}
          <g stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round">
            <line x1="60" y1="80" x2="60" y2="90" />
            <line x1="55" y1="85" x2="65" y2="85" />
            <line x1="100" y1="80" x2="100" y2="90" />
            <line x1="95" y1="85" x2="105" y2="85" />
          </g>

          {/* ── 3. CONICAL FLARED GOLDEN PEDESTAL BASE ── */}
          <ellipse cx="80" cy="176" rx="20" ry="4" fill={`url(#${uniqueId}-cwc-gold)`} stroke="#ca8a04" strokeWidth="1" />
          <path d="M 60 176 L 100 176 L 114 204 L 46 204 Z" fill={`url(#${uniqueId}-cwc-gold)`} stroke="#ca8a04" strokeWidth="1.5" />
          
          {/* Specular Base Shimmer */}
          <path d="M 68 178 L 78 178 L 72 202 L 56 202 Z" fill="#ffffff" opacity="0.45" />
          <ellipse cx="80" cy="204" rx="34" ry="6" fill="#854d0e" stroke="#78350f" strokeWidth="1.5" />

          {/* Sparkle on Gold Base */}
          <line x1="68" y1="188" x2="68" y2="198" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="63" y1="193" x2="73" y2="193" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}

      {/* Fallback */}
      {(type === 'fluted_cup' || type === 'winner_gold' || type === 'runner_silver' || type === 'bronze_cup' || type === 'counselor_mvp') && (
        <svg width={size} height={Math.round(size * 1.35)} viewBox="0 0 160 216" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="32" fill="#f59e0b" />
        </svg>
      )}
    </div>
  );
}
