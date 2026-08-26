'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  style?: React.CSSProperties;
  waitTimeSecs?: number;
}

interface StatusConfig {
  bg: string;
  color: string;
  border: string;
  dot: string;
  pulse?: boolean;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  // Walkin / Lead Statuses
  'Waiting': {
    bg: 'rgba(14, 165, 233, 0.14)',
    color: '#0284c7',
    border: 'rgba(14, 165, 233, 0.35)',
    dot: '#0ea5e9',
    pulse: true,
  },
  'Assigned': {
    bg: 'rgba(99, 102, 241, 0.14)',
    color: '#6366f1',
    border: 'rgba(99, 102, 241, 0.35)',
    dot: '#6366f1',
  },
  'In Session': {
    bg: 'rgba(245, 158, 11, 0.14)',
    color: '#d97706',
    border: 'rgba(245, 158, 11, 0.35)',
    dot: '#f59e0b',
    pulse: true,
  },
  'IN_SESSION': {
    bg: 'rgba(245, 158, 11, 0.14)',
    color: '#d97706',
    border: 'rgba(245, 158, 11, 0.35)',
    dot: '#f59e0b',
    pulse: true,
  },
  'Completed': {
    bg: 'rgba(16, 185, 129, 0.14)',
    color: '#059669',
    border: 'rgba(16, 185, 129, 0.35)',
    dot: '#10b981',
  },
  'COMPLETED': {
    bg: 'rgba(16, 185, 129, 0.14)',
    color: '#059669',
    border: 'rgba(16, 185, 129, 0.35)',
    dot: '#10b981',
  },
  'Follow-up': {
    bg: 'rgba(139, 92, 246, 0.14)',
    color: '#7c3aed',
    border: 'rgba(139, 92, 246, 0.35)',
    dot: '#8b5cf6',
  },
  'No Show': {
    bg: 'rgba(100, 116, 139, 0.14)',
    color: '#64748b',
    border: 'rgba(100, 116, 139, 0.35)',
    dot: '#94a3b8',
  },
  'Cancelled': {
    bg: 'rgba(239, 68, 68, 0.14)',
    color: '#dc2626',
    border: 'rgba(239, 68, 68, 0.35)',
    dot: '#ef4444',
  },
  'CANCELLED': {
    bg: 'rgba(239, 68, 68, 0.14)',
    color: '#dc2626',
    border: 'rgba(239, 68, 68, 0.35)',
    dot: '#ef4444',
  },
  'ASSIGNED': {
    bg: 'rgba(99, 102, 241, 0.14)',
    color: '#6366f1',
    border: 'rgba(99, 102, 241, 0.35)',
    dot: '#6366f1',
  },
  // Counselor Statuses
  'Available': {
    bg: 'rgba(16, 185, 129, 0.14)',
    color: '#059669',
    border: 'rgba(16, 185, 129, 0.35)',
    dot: '#10b981',
  },
  'Busy': {
    bg: 'rgba(245, 158, 11, 0.14)',
    color: '#d97706',
    border: 'rgba(245, 158, 11, 0.35)',
    dot: '#f59e0b',
  },
  'Break': {
    bg: 'rgba(249, 115, 22, 0.14)',
    color: '#ea580c',
    border: 'rgba(249, 115, 22, 0.35)',
    dot: '#f97316',
  },
  'Offline': {
    bg: 'rgba(100, 116, 139, 0.14)',
    color: '#64748b',
    border: 'rgba(100, 116, 139, 0.35)',
    dot: '#94a3b8',
  },
};

function formatSeconds(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function StatusBadge({ status, className = '', style = {}, waitTimeSecs }: StatusBadgeProps) {
  const normalized = status || 'Waiting';
  const config = STATUS_CONFIGS[normalized] || {
    bg: 'rgba(100, 116, 139, 0.14)',
    color: '#64748b',
    border: 'rgba(100, 116, 139, 0.35)',
    dot: '#94a3b8',
  };

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '0.72rem',
        fontWeight: 800,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        background: config.bg,
        color: config.color,
        border: `1.5px solid ${config.border}`,
        boxSizing: 'border-box',
        lineHeight: 1.4,
        ...style,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: config.dot,
          display: 'inline-block',
          boxShadow: `0 0 6px ${config.dot}`,
          animation: config.pulse ? 'pulseDot 1.4s ease-in-out infinite' : undefined,
          flexShrink: 0,
        }}
      />
      <span>{normalized}</span>
      {waitTimeSecs !== undefined && (
        <span style={{ opacity: 0.85, fontWeight: 700, fontSize: '0.68rem', marginLeft: '2px' }}>
          ({formatSeconds(waitTimeSecs)})
        </span>
      )}
    </span>
  );
}