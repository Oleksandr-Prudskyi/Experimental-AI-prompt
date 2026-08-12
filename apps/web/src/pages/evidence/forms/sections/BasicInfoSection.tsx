import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { GlassCard } from '@/components/shared/GlassCard';
import { CATEGORY_LABELS } from '@evidence/shared';

interface BasicInfoSectionProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  machines: any[];
  lines: any[];
  shifts: any[];
}

const inputClass =
  'w-full rounded-xl border border-ev-200/50 dark:border-ev-600/50 bg-white/60 dark:bg-ev-800/60 backdrop-blur-sm px-3 py-2.5 text-sm text-ev-700 dark:text-ev-200 focus:outline-none focus:ring-1 focus:ring-ev-700/10 transition-all duration-300';

const labelClass = 'text-sm font-medium text-ev-600 dark:text-ev-300';

export function BasicInfoSection({ register, errors, machines, lines, shifts }: BasicInfoSectionProps) {
  return (
    <GlassCard hover={false} className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <h3 className="text-lg font-semibold text-ev-700 dark:text-ev-200 mb-4">Základní informace</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* region: machine */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Stroj *</label>
          <select {...register('machineId')} className={inputClass}>
            <option value="">Vyberte stroj</option>
            {machines.map((m: any) => (
              <option key={m.id} value={m.id}>{m.code} — {m.name}</option>
            ))}
          </select>
          {errors.machineId && <span className="text-xs text-st-error">{errors.machineId.message as string}</span>}
        </div>
        {/* endregion */}

        {/* region: line */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Linka *</label>
          <select {...register('lineId')} className={inputClass}>
            <option value="">Vyberte linku</option>
            {lines.map((l: any) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          {errors.lineId && <span className="text-xs text-st-error">{errors.lineId.message as string}</span>}
        </div>
        {/* endregion */}

        {/* region: shift */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Směna</label>
          <select {...register('shiftId')} className={inputClass}>
            <option value="">Nevybráno</option>
            {shifts.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        {/* endregion */}

        {/* region: category */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Kategorie *</label>
          <select {...register('category')} className={inputClass}>
            <option value="">Vyberte kategorii</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.category && <span className="text-xs text-st-error">{errors.category.message as string}</span>}
        </div>
        {/* endregion */}

        {/* region: date */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Datum *</label>
          <input type="date" {...register('date')} className={inputClass} />
          {errors.date && <span className="text-xs text-st-error">{errors.date.message as string}</span>}
        </div>
        {/* endregion */}

        {/* region: downtime */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Čas prostoje (min)</label>
          <input
            type="number"
            min={0}
            {...register('downtimeMin', { valueAsNumber: true })}
            className={inputClass}
            placeholder="0"
          />
        </div>
        {/* endregion */}
      </div>
    </GlassCard>
  );
}
