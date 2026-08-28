import React from 'react';

interface LaurelRankMedalProps {
  rank: 1 | 2 | 3;
  size?: number;
}

export default function LaurelRankMedal({ rank, size = 64 }: LaurelRankMedalProps) {
  const theme = {
    1: {
      // Modern Luxury Gold
      bg: 'linear-gradient(135deg, rgba(254, 240, 138, 0.35) 0%, rgba(245, 158, 11, 0.12) 100%)',
      border: '1.5px solid rgba(245, 158, 11, 0.55)',
      numGradient: 'linear-gradient(135deg, #b45309 0%, #d97706 40%, #f59e0b 80%, #ca8a04 100%)',
      glow: '0 8px 20px rgba(245, 158, 11, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
      ringGlow: 'rgba(245, 158, 11, 0.3)',
    },
    2: {
      // Modern Chrome Silver
      bg: 'linear-gradient(135deg, rgba(241, 245, 249, 0.6) 0%, rgba(148, 163, 184, 0.15) 100%)',
      border: '1.5px solid rgba(148, 163, 184, 0.55)',
      numGradient: 'linear-gradient(135deg, #1e293b 0%, #475569 40%, #64748b 80%, #94a3b8 100%)',
      glow: '0 8px 20px rgba(148, 163, 184, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
      ringGlow: 'rgba(148, 163, 184, 0.3)',
    },
    3: {
      // Modern Aztec Copper / Bronze
      bg: 'linear-gradient(135deg, rgba(254, 215, 170, 0.35) 0%, rgba(234, 88, 12, 0.12) 100%)',
      border: '1.5px solid rgba(234, 88, 12, 0.55)',
      numGradient: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 40%, #ea580c 80%, #fb923c 100%)',
      glow: '0 8px 20px rgba(234, 88, 12, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
      ringGlow: 'rgba(234, 88, 12, 0.3)',
    },
  }[rank] || {
    bg: 'linear-gradient(135deg, rgba(254, 240, 138, 0.35) 0%, rgba(245, 158, 11, 0.12) 100%)',
    border: '1.5px solid rgba(245, 158, 11, 0.55)',
    numGradient: 'linear-gradient(135deg, #b45309 0%, #d97706 40%, #f59e0b 80%, #ca8a04 100%)',
    glow: '0 8px 20px rgba(245, 158, 11, 0.22), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
    ringGlow: 'rgba(245, 158, 11, 0.3)',
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '18px',
        background: theme.bg,
        border: theme.border,
        boxShadow: theme.glow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        backdropFilter: 'blur(10px)',
        userSelect: 'none',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Pure, Large, Sculpted Modern Geometric Numeral */}
      <span
        style={{
          fontSize: `${Math.round(size * 0.58)}px`,
          fontWeight: 950,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          lineHeight: 1,
          letterSpacing: '-0.05em',
          background: theme.numGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
          transform: 'translateY(-1px)',
        }}
      >
        {rank}
      </span>
    </div>
  );
}
