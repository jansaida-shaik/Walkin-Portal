interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getColors = (s: string) => {
    const low = s.toLowerCase();
    if (low === 'waiting' || low === 'active') {
      return { bg: 'var(--info-glow)', color: 'var(--info)', border: 'var(--border)' };
    }
    if (low === 'assigned') {
      return { bg: 'var(--primary-glow)', color: 'var(--primary)', border: 'var(--border)' };
    }
    if (low === 'in session') {
      return { bg: 'var(--warning-glow)', color: 'var(--warning)', border: 'var(--border)' };
    }
    if (low === 'completed') {
      return { bg: 'var(--success-glow)', color: 'var(--success)', border: 'var(--border)' };
    }
    if (low === 'cancelled' || low === 'no show') {
      return { bg: 'var(--danger-glow)', color: 'var(--danger)', border: 'var(--border)' };
    }
    return { bg: 'var(--surface-alt)', color: 'var(--text)', border: 'var(--border)' };
  };

  const colors = getColors(status);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: '9999px',
        fontSize: '0.74rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`
      }}
    >
      {status}
    </span>
  );
}
