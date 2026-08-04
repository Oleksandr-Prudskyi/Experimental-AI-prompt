import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CATEGORY_LABELS } from '@evidence/shared';

interface RecentRecordsProps {
  records: any[];
}

export function RecentRecords({ records }: RecentRecordsProps) {
  const navigate = useNavigate();

  return (
    <GlassCard hover={false} className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Poslední záznamy</h3>

      {records.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">Žádné záznamy</p>
      ) : (
        <div className="flex flex-col divide-y divide-slate-200/30 dark:divide-slate-700/30">
          {records.map((r: any, i: number) => (
            <div
              key={r.id}
              className="flex items-center gap-3 py-3 cursor-pointer hover:bg-white/30 dark:hover:bg-slate-700/30 rounded-lg px-2 transition-all duration-250 animate-fade-in"
              style={{ animationDelay: `${350 + i * 40}ms` }}
              onClick={() => navigate(`/evidence/${r.id}/edit`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-slate-700 dark:text-slate-200">
                    {r.machine?.code || '—'}
                  </span>
                  <StatusBadge
                    status={r.category}
                    label={CATEGORY_LABELS[r.category as keyof typeof CATEGORY_LABELS] || r.category}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {r.description}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-mono text-slate-400">
                  {new Date(r.createdAt).toLocaleDateString('cs-CZ')}
                </p>
                <p className="text-xs text-slate-400">{r.author?.fullName}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
