import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { GlassCard } from '@/components/shared/GlassCard';
import { PRIORITY_LABELS } from '@evidence/shared';

interface DescriptionSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

const inputClass =
  'w-full rounded-xl border border-ev-200/50 dark:border-ev-600/50 bg-white/60 dark:bg-ev-800/60 backdrop-blur-sm px-3 py-2.5 text-sm text-ev-700 dark:text-ev-200 focus:outline-none focus:ring-1 focus:ring-ev-700/10 transition-all duration-300';

const labelClass = 'text-sm font-medium text-ev-600 dark:text-ev-300';

export function DescriptionSection({ register, errors }: DescriptionSectionProps) {
  return (
    <GlassCard hover={false} className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
      <h3 className="text-lg font-semibold text-ev-700 dark:text-ev-200 mb-4">Popis práce</h3>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Popis *</label>
          <textarea
            {...register('description')}
            rows={4}
            className={inputClass + ' resize-y'}
            placeholder="Podrobný popis provedené práce..."
          />
          {errors.description && <span className="text-xs text-st-error">{errors.description.message as string}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Priorita</label>
            <select {...register('priority')} className={inputClass}>
              <option value="">Nevybráno</option>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Stav</label>
            <select {...register('status')} className={inputClass}>
              <option value="">Nevybráno</option>
              <option value="open">Otevřený</option>
              <option value="in_progress">Probíhá</option>
              <option value="resolved">Vyřešený</option>
              <option value="closed">Uzavřený</option>
            </select>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
