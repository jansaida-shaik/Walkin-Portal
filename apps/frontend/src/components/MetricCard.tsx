interface MetricCardProps {
  title: string;
  value: string | number;
  icon: string;
}

export default function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="stat-card flex items-center justify-between p-5 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl">
      <div>
        <div className="text-[0.78rem] font-semibold uppercase opacity-50 tracking-widest mb-1">
          {title}
        </div>
        <div className="text-[1.75rem] font-extrabold text-white">
          {value}
        </div>
      </div>
      <div className="text-[1.8rem] opacity-85 bg-[var(--primary-glow)] w-12 h-12 rounded-full flex items-center justify-center text-[var(--primary)]">
        {icon}
      </div>
    </div>
  );
}
