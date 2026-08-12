import type { UseFormRegister } from 'react-hook-form';
import { GlassCard } from '@/components/shared/GlassCard';

interface DowntimeSectionProps {
  register: UseFormRegister<any>;
  visible: boolean;
}

const inputClass =
  'w-full rounded-xl border border-ev-200/50 dark:border-ev-600/50 bg-white/60 dark:bg-ev-800/60 backdrop-blur-sm px-3 py-2.5 text-sm text-ev-700 dark:text-ev-200 focus:outline-none focus:ring-1 focus:ring-ev-700/10 transition-all duration-300';

const labelClass = 'text-sm font-medium text-ev-600 dark:text-ev-300';

export function DowntimeSection({ register, visible }: DowntimeSectionProps) {
  if (!visible) return null;

  return (
    <GlassCard hover={false} className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <h3 className="text-lg font-semibold text-ev-700 dark:text-ev-200 mb-4">Odstávka a údržba</h3>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Příčina</label>
            <input type="text" {...register('cause')} className={inputClass} placeholder="Příčina poruchy/odstávky" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Provedená údržba</label>
          <textarea {...register('maintenanceDone')} rows={3} className={inputClass + ' resize-y'} placeholder="Popis provedené údržby..." />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Vyměněné díly</label>
            <textarea {...register('replacedParts')} rows={2} className={inputClass + ' resize-y'} placeholder="Seznam vyměněných dílů..." />
          </div>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Požadované díly</label>
            <textarea {...register('requiredParts')} rows={2} className={inputClass + ' resize-y'} placeholder="Díly potřebné k objednání..." />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Doporučení</label>
          <textarea {...register('recommendations')} rows={2} className={inputClass + ' resize-y'} placeholder="Doporučení pro další postup..." />
        </div>
      </div>
    </GlassCard>
  );
}
