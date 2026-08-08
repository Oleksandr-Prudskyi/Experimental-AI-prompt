import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftsApi } from '@/api/shifts';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { EmptyState } from '@/components/shared/EmptyState';

export function ShiftsPage() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => shiftsApi.list().then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      shiftsApi.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  });

  const shifts = data?.data || [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Směny" subtitle={`${shifts.length} směn`} />

      {shifts.length === 0 ? (
        <EmptyState icon="shifts" title="Žádné směny" description="Vytvořte první směnu" />
      ) : (
        <GlassCard hover={false} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
                <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Název</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Začátek</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Konec</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Aktivní</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift: any, i: number) => (
                <tr
                  key={shift.id}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className="border-b border-slate-100/50 dark:border-slate-700/30 animate-fade-in"
                >
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{shift.name}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{shift.startTime}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{shift.endTime}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleMutation.mutate({ id: shift.id, isActive: !shift.isActive })}
                      className={`w-10 h-6 rounded-full transition-all duration-300 ${shift.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${shift.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
}
