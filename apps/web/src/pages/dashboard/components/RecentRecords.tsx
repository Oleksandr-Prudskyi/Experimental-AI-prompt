import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { CATEGORY_LABELS } from '@evidence/shared';

interface RecentRecordsProps {
  records: any[];
}

export function RecentRecords({ records }: RecentRecordsProps) {
  const navigate = useNavigate();

  return (
    <GlassCard hover={false}>
      <h3 className="text-sm font-semibold text-ev-700 dark:text-ev-200 mb-4">Poslední záznamy</h3>

      {records.length === 0 ? (
        <EmptyState icon="evidence" title="Žádné záznamy" />
      ) : (
        <div className="flex flex-col divide-y divide-ev-100 dark:divide-ev-700/50">
          {records.map((r: any) => (
            <div
              key={r.id}
              className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-ev-50 dark:hover:bg-ev-800/50 rounded-md px-2 transition-colors duration-150"
              onClick={() => navigate(`/evidence/${r.id}/edit`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-ev-700 dark:text-ev-200">
                    {r.machine?.code || '—'}
                  </span>
                  <StatusBadge
                    status={r.category}
                    label={CATEGORY_LABELS[r.category as keyof typeof CATEGORY_LABELS] || r.category}
                  />
                </div>
                <p className="text-xs text-ev-500 dark:text-ev-400 truncate mt-0.5">
                  {r.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs tabular-nums text-ev-400">
                  {new Date(r.createdAt).toLocaleDateString('cs-CZ')}
                </p>
                <p className="text-xs text-ev-400">{r.author?.fullName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
