interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusClass = (s: string) => {
    const low = s.toLowerCase();
    if (low === 'waiting' || low === 'active') return 'waiting';
    if (low === 'assigned') return 'assigned';
    if (low === 'in session') return 'in_session';
    if (low === 'completed') return 'completed';
    if (low === 'cancelled' || low === 'no show') return 'unavailable'; // maps to danger
    if (low === 'follow-up') return 'pending';
    return 'offline'; // default fallback
  };

  const normalizedStatus = getStatusClass(status);

  return (
    <span
      className={`status-chip ${normalizedStatus}`}
      data-status={normalizedStatus}
    >
      {status}
    </span>
  );
}
