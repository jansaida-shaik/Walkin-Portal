interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getClass = (s: string) => {
    const low = s.toLowerCase();
    if (low === 'waiting' || low === 'active')
      return 'bg-[var(--info-glow)] text-[var(--info)] border-[var(--border)]';
    if (low === 'assigned')
      return 'bg-[var(--primary-glow)] text-[var(--primary)] border-[var(--border)]';
    if (low === 'in session')
      return 'bg-[var(--warning-glow)] text-[var(--warning)] border-[var(--border)]';
    if (low === 'completed')
      return 'bg-[var(--success-glow)] text-[var(--success)] border-[var(--border)]';
    if (low === 'cancelled' || low === 'no show')
      return 'bg-[var(--danger-glow)] text-[var(--danger)] border-[var(--border)]';
    return 'bg-[var(--surface-alt)] text-[var(--text)] border-[var(--border)]';
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.74rem] font-bold tracking-wide border ${getClass(status)}`}
    >
      {status}
    </span>
  );
}
