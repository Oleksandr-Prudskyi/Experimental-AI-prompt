import { GlassCard } from '@/components/shared/GlassCard';
import { Icon } from '@/components/shared/Icon';

interface StatsCardProps {
  icon: string;
  label: string;
  value: number | string;
  gradient: string;
  delay: number;
}

export function StatsCard({ icon, label, value, gradient, delay }: StatsCardProps) {
  return (
    <GlassCard className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg text-white`}>
          <Icon name={icon} size={24} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-mono tabular-nums">
            {value}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </GlassCard>
  );
}
