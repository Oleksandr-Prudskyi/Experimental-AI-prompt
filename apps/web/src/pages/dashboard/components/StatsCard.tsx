import { GlassCard } from '@/components/shared/GlassCard';
import { Icon } from '@/components/shared/Icon';
import { cn } from '@/lib/cn';

interface StatsCardProps {
  icon: string;
  label: string;
  value: number | string;
  color: string;
  trend?: number;
  trendLabel?: string;
}

export function StatsCard({ icon, label, value, color, trend, trendLabel }: StatsCardProps) {
  return (
    <GlassCard hover={false}>
      <div className="flex items-center gap-4">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white', color)}>
          <Icon name={icon} size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
            {value}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          {trend !== undefined && trend !== 0 && (
            <p className={cn('text-xs mt-0.5', trend > 0 ? 'text-emerald-600' : 'text-red-500')}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              {trendLabel && <span className="text-slate-400 ml-1">{trendLabel}</span>}
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
