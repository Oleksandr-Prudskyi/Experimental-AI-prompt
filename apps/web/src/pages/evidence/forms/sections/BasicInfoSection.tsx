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
  'w-full rounded-xl border border-slate-200/50 dark:border-slate-600/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-3 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-300';

const labelClass = 'text-sm font-medium text-slate-600 dark:text-slate-300';

export function BasicInfoSection({ register, errors, machines, lines, shifts }: BasicInfoSectionProps) {
  return (
    <GlassCard hover={false} className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Základní informace</h3>

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
          {errors.machineId && <span className="text-xs text-red-500">{errors.machineId.message as string}</span>}
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
          {errors.lineId && <span className="text-xs text-red-500">{errors.lineId.message as string}</span>}
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
          {errors.category && <span className="text-xs text-red-500">{errors.category.message as string}</span>}
        </div>
        {/* endregion */}

        {/* region: date */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Datum *</label>
          <input type="date" {...register('date')} className={inputClass} />
          {errors.date && <span className="text-xs text-red-500">{errors.date.message as string}</span>}
        </div>
        {/* endregion */}

        {/* region: times */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Čas od *</label>
          <input type="time" {...register('startTime')} className={inputClass} />
          {errors.startTime && <span className="text-xs text-red-500">{errors.startTime.message as string}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Čas do</label>
          <input type="time" {...register('endTime')} className={inputClass} />
        </div>
        {/* endregion */}
      </div>
    </GlassCard>
  );
}
