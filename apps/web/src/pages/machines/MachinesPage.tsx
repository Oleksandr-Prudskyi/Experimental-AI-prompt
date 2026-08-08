import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { machinesApi } from '@/api/machines';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { cn } from '@/lib/cn';

const STATUS_LABELS: Record<string, string> = {
  operational: 'V provozu',
  maintenance: 'Údržba',
  breakdown: 'Porucha',
  decommissioned: 'Vyřazeno',
};

const STATUS_FILTERS = ['all', 'operational', 'maintenance', 'breakdown', 'decommissioned'] as const;
const STATUS_FILTER_LABELS: Record<string, string> = {
  all: 'Vše',
  ...STATUS_LABELS,
};

export function MachinesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['machines'],
    queryFn: () => machinesApi.list().then((r) => r.data),
  });
  const [statusFilter, setStatusFilter] = useState('all');

  const allMachines = data?.data || [];
  const machines = statusFilter === 'all'
    ? allMachines
    : allMachines.filter((m: any) => m.status === statusFilter);

  const statusCounts = allMachines.reduce((acc: Record<string, number>, m: any) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});

  const subtitle = allMachines.length > 0
    ? `${allMachines.length} strojů${statusCounts.operational ? ` · ${statusCounts.operational} v provozu` : ''}${statusCounts.maintenance ? ` · ${statusCounts.maintenance} údržba` : ''}${statusCounts.breakdown ? ` · ${statusCounts.breakdown} porucha` : ''}`
    : `${allMachines.length} strojů`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Stroje" subtitle={subtitle} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" height="100px" />
          ))}
        </div>
      ) : allMachines.length === 0 ? (
        <EmptyState icon="machines" title="Žádné stroje" description="Přidejte první stroj" />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150',
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700',
                )}
              >
                {STATUS_FILTER_LABELS[status]}
                {status !== 'all' && statusCounts[status] ? ` (${statusCounts[status]})` : ''}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {machines.map((machine: any) => (
              <GlassCard key={machine.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{machine.name}</h3>
                    <span className="text-xs text-slate-400 tabular-nums">{machine.code}</span>
                  </div>
                  <StatusBadge status={machine.status} label={STATUS_LABELS[machine.status] || machine.status} />
                </div>
                {machine.line && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {machine.line.workshop?.name} → {machine.line.name}
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
