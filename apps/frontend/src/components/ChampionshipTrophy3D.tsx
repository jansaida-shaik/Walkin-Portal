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
          1. 💰 RPL: USER-PROVIDED TRANSPARENT RPL 3D TROPHY
          Seamlessly blended with ambient golden aura & crystal globe lighting
      ══════════════════════════════════════════════════════════════════ */}
      {type === 'fifa_globe' && (
        <div
          style={{
            width: size,
            height: Math.round(size * 1.35),
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Ambient Dual-Layer Gold & Blue Glow Halo */}
          <div
            style={{
              position: 'absolute',
              width: '94%',
              height: '94%',
              background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.65) 0%, rgba(2, 132, 199, 0.25) 55%, transparent 75%)',
              borderRadius: '50%',
              filter: 'blur(22px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          
          {/* Transparent RPL Trophy Asset */}
          <img
            src="/trophies/rpl_trophy.png"
            alt="RPL Championship Trophy"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 1,
              filter: 'drop-shadow(0 16px 36px rgba(245, 158, 11, 0.5)) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.28))',
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          2. 🚶 WPL: USER-PROVIDED TRANSPARENT WPL TROPHY
          Seamlessly blended with emerald glow & luxury depth
      ══════════════════════════════════════════════════════════════════ */}
      {type === 'webb_ellis' && (
        <div
          style={{
            width: size,
            height: Math.round(size * 1.35),
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Ambient Dual-Layer Emerald & Silver Glow Halo */}
          <div
            style={{
              position: 'absolute',
              width: '94%',
              height: '94%',
              background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.55) 0%, rgba(56, 189, 248, 0.22) 55%, transparent 75%)',
              borderRadius: '50%',
              filter: 'blur(20px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          
          {/* Transparent WPL Trophy Asset */}
          <img
            src="/trophies/wpl_trophy.png"
            alt="WPL Championship Trophy"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 1,
              filter: 'drop-shadow(0 16px 36px rgba(16, 185, 129, 0.45)) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.28))',
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          3. 🎓 SPL: USER-PROVIDED TRANSPARENT SPL TROPHY
          Seamlessly blended with ambient lighting and natural depth
      ══════════════════════════════════════════════════════════════════ */}
      {type === 'icc_pillars' && (
        <div
          style={{
            width: size,
            height: Math.round(size * 1.35),
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Ambient Dual-Layer Glow Halo */}
          <div
            style={{
              position: 'absolute',
              width: '94%',
              height: '94%',
              background: 'radial-gradient(ellipse at center, rgba(245, 158, 11, 0.6) 0%, rgba(2, 132, 199, 0.25) 55%, transparent 75%)',
              borderRadius: '50%',
              filter: 'blur(20px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          
          {/* Transparent SPL Trophy Asset — Extra Large & High-Fidelity for Text Legibility */}
          <img
            src="/trophies/spl_trophy.png"
            alt="SPL Championship Trophy"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              position: 'relative',
              zIndex: 1,
              filter: 'drop-shadow(0 16px 36px rgba(245, 158, 11, 0.5)) drop-shadow(0 6px 16px rgba(0, 0, 0, 0.28))',
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
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
