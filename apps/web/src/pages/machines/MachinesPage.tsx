import { useQuery } from '@tanstack/react-query';
import { machinesApi } from '@/api/machines';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';

const STATUS_LABELS: Record<string, string> = {
  operational: 'V provozu',
  maintenance: 'Údržba',
  breakdown: 'Porucha',
  decommissioned: 'Vyřazeno',
};

export function MachinesPage() {
  const { data } = useQuery({
    queryKey: ['machines'],
    queryFn: () => machinesApi.list().then((r) => r.data),
  });

  const machines = data?.data || [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Stroje" subtitle={`${machines.length} strojů`} />

      {machines.length === 0 ? (
        <EmptyState icon="machines" title="Žádné stroje" description="Přidejte první stroj" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {machines.map((machine: any, i: number) => (
            <GlassCard key={machine.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{machine.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{machine.code}</span>
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
      )}
    </div>
  );
}
