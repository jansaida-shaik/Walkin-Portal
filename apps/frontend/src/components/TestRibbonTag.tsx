'use client';

export function isTestRecord(item: any): boolean {
  if (!item) return false;
  if (item.details?.isTest === true) return true;
  if (typeof item.source === 'string' && item.source.toUpperCase().includes('TEST')) return true;
  if (typeof item.remarks === 'string' && (item.remarks.includes('🧪') || item.remarks.toUpperCase().includes('TEST'))) return true;
  if (typeof item.email === 'string' && item.email.includes('.test@')) return true;
  if (typeof item.name === 'string' && item.name.includes('[TEST]')) return true;
  return false;
}

interface TestRibbonTagProps {
  label?: string;
  variant?: 'green' | 'red' | 'purple' | 'blue';
}

export default function TestRibbonTag({ label = 'TEST RECORD', variant = 'purple' }: TestRibbonTagProps) {
  const variantStyles = {
    green: {
      bg: 'rgba(16, 185, 129, 0.16)',
      color: '#059669',
      border: 'rgba(16, 185, 129, 0.3)',
    },
    red: {
      bg: 'rgba(239, 68, 68, 0.14)',
      color: '#ef4444',
      border: 'rgba(239, 68, 68, 0.3)',
    },
    purple: {
      bg: 'rgba(168, 85, 247, 0.16)',
      color: '#9333ea',
      border: 'rgba(168, 85, 247, 0.35)',
    },
    blue: {
      bg: 'rgba(59, 130, 246, 0.15)',
      color: '#2563eb',
      border: 'rgba(59, 130, 246, 0.3)',
    },
  }[variant];

  return (
    <span
      className="ribbon-tag"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 14px 2px 8px',
        borderRadius: '4px 0 0 4px',
        clipPath: 'polygon(0% 0%, calc(100% - 7px) 0%, 100% 50%, calc(100% - 7px) 100%, 0% 100%)',
        background: variantStyles.bg,
        color: variantStyles.color,
        fontSize: '0.68rem',
        fontWeight: 800,
        letterSpacing: '0.04em',
        lineHeight: 1.3,
        flexShrink: 0,
        verticalAlign: 'middle',
      }}
      title="Test Record Ribbon"
    >
      <span>{label}</span>
    </span>
  );
}