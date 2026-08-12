import { GlassCard } from '@/components/shared/GlassCard';
import { Icon } from '@/components/shared/Icon';
import { cn } from '@/lib/cn';

interface StatsCardProps {
  icon: string;
  label: string;
  value: number | string;
  color?: string;
  trend?: number;
  trendLabel?: string;
}

export function StatsCard({ icon, label, value, trend, trendLabel }: StatsCardProps) {
  return (
    <GlassCard hover={false}>
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-ev-100 dark:bg-ev-800 text-ev-600 dark:text-ev-300">
          <Icon name={icon} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-ev-800 dark:text-ev-100 tabular-nums leading-none">
            {value}
          </p>
          <p className="text-xs text-ev-500 dark:text-ev-400 mt-1">{label}</p>
          {trend !== undefined && trend !== 0 && (
            <p className={cn('text-xs mt-0.5 font-medium', trend > 0 ? 'text-st-ok' : 'text-st-error')}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              {trendLabel && <span className="text-ev-400 font-normal ml-1">{trendLabel}</span>}
            </p>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
