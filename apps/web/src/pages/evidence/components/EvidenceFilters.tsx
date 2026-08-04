import { GlassCard } from '@/components/shared/GlassCard';
import { CATEGORY_LABELS, WORK_RECORD_STATUSES } from '@evidence/shared';

interface EvidenceFiltersProps {
  filters: Record<string, string>;
  onChange: (key: string, value: string) => void;
  machines: { id: string; name: string; code: string }[];
}

const selectClass =
  'rounded-xl border border-slate-200/50 dark:border-slate-600/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-300';

export function EvidenceFilters({ filters, onChange, machines }: EvidenceFiltersProps) {
  return (
    <GlassCard hover={false} className="animate-fade-in" style={{ animationDelay: '50ms' }}>
      <div className="flex flex-wrap gap-3 items-end">
        {/* region: date range */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Od</label>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => onChange('date_from', e.target.value)}
            className={selectClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Do</label>
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => onChange('date_to', e.target.value)}
            className={selectClass}
          />
        </div>
        {/* endregion */}

        {/* region: category */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Kategorie</label>
          <select value={filters.category || ''} onChange={(e) => onChange('category', e.target.value)} className={selectClass}>
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
          <select value={filters.machine_id || ''} onChange={(e) => onChange('machine_id', e.target.value)} className={selectClass}>
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
          <select value={filters.status || ''} onChange={(e) => onChange('status', e.target.value)} className={selectClass}>
            <option value="">Vše</option>
            <option value={WORK_RECORD_STATUSES.OPEN}>Otevřený</option>
            <option value={WORK_RECORD_STATUSES.IN_PROGRESS}>Probíhá</option>
            <option value={WORK_RECORD_STATUSES.RESOLVED}>Vyřešený</option>
            <option value={WORK_RECORD_STATUSES.CLOSED}>Uzavřený</option>
          </select>
        </div>
        {/* endregion */}
      </div>
    </GlassCard>
  );
}
