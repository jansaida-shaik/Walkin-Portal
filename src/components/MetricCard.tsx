interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
}

export default function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="stat-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px' }}>
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', opacity: 0.5, letterSpacing: '0.05em', marginBottom: '4px' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
          {value}
        </div>
      </div>
      <div style={{ fontSize: '1.8rem', opacity: 0.85, background: 'var(--primary-glow)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
        {icon}
      </div>
    </div>
  );
}
