import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { CATEGORY_LABELS, WORK_RECORD_STATUSES } from '@evidence/shared';

interface EvidenceFiltersProps {
  filters: Record<string, string>;
  onChange: (key: string, value: string) => void;
  machines: { id: string; name: string; code: string }[];
}

const inputClass =
  'rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors duration-150';

export function EvidenceFilters({ filters, onChange, machines }: EvidenceFiltersProps) {
  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <GlassCard hover={false}>
      <div className="flex flex-wrap gap-3 items-end">
        {/* region: date range */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Od</label>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => onChange('date_from', e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Do</label>
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => onChange('date_to', e.target.value)}
            className={inputClass}
          />
        </div>
        {/* endregion */}

        {/* region: category */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Kategorie</label>
          <select value={filters.category || ''} onChange={(e) => onChange('category', e.target.value)} className={inputClass}>
            <option value="">Vše</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        {/* endregion */}

        {/* region: machine */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Stroj</label>
          <select value={filters.machine_id || ''} onChange={(e) => onChange('machine_id', e.target.value)} className={inputClass}>
            <option value="">Vše</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>{m.code} — {m.name}</option>
            ))}
          </select>
        </div>
        {/* endregion */}

        {/* region: status */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Stav</label>
          <select value={filters.status || ''} onChange={(e) => onChange('status', e.target.value)} className={inputClass}>
            <option value="">Vše</option>
            <option value={WORK_RECORD_STATUSES.OPEN}>Otevřený</option>
            <option value={WORK_RECORD_STATUSES.IN_PROGRESS}>Probíhá</option>
            <option value={WORK_RECORD_STATUSES.RESOLVED}>Vyřešený</option>
            <option value={WORK_RECORD_STATUSES.CLOSED}>Uzavřený</option>
          </select>
        </div>
        {/* endregion */}

        {hasActiveFilters && (
          <GradientButton
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange('date_from', '');
              onChange('date_to', '');
              onChange('category', '');
              onChange('machine_id', '');
              onChange('status', '');
            }}
          >
            Vyčistit filtry
          </GradientButton>
        )}
      </div>
    </GlassCard>
  );
}
