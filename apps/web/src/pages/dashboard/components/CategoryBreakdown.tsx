import { GlassCard } from '@/components/shared/GlassCard';

interface CategoryBreakdownProps {
  records: any[];
  categoryBreakdown?: { category: string; count: number }[];
}

const CATEGORY_COLORS: Record<string, string> = {
  adjustment: 'bg-st-info',
  maintenance: 'bg-st-warn',
  failure: 'bg-st-error',
  inspection: 'bg-petrol-500',
  other: 'bg-ev-400',
};

const CATEGORY_LABELS: Record<string, string> = {
  adjustment: 'Seřízení',
  maintenance: 'Údržba',
  failure: 'Porucha',
  inspection: 'Kontrola',
  other: 'Jiné',
};

export function CategoryBreakdown({ records, categoryBreakdown }: CategoryBreakdownProps) {
  const data = categoryBreakdown || computeFromRecords(records);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (data.length === 0) {
    return (
      <GlassCard hover={false}>
        <h3 className="text-sm font-semibold text-ev-700 dark:text-ev-200 mb-3">
          Rozdělení podle kategorií
        </h3>
        <p className="text-sm text-ev-400">Žádná data</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard hover={false}>
      <h3 className="text-sm font-semibold text-ev-700 dark:text-ev-200 mb-4">
        Rozdělení podle kategorií
      </h3>
      <div className="flex flex-col gap-3">
        {data.slice(0, 6).map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.category} className="flex items-center gap-3 text-sm">
              <span className="w-20 text-ev-600 dark:text-ev-400 truncate">
                {CATEGORY_LABELS[item.category] || item.category}
              </span>
              <div className="flex-1 h-2 bg-ev-100 dark:bg-ev-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${CATEGORY_COLORS[item.category] || 'bg-ev-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-ev-500 tabular-nums">{item.count}</span>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function computeFromRecords(records: any[]): { category: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const r of records) {
    const cat = r.category || 'other';
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}
