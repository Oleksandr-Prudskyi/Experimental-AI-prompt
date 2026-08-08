import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workshopsApi, productionLinesApi } from '@/api/workshops';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';

export function WorkshopsPage() {
  const queryClient = useQueryClient();
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const { data: workshopsData, isLoading } = useQuery({
    queryKey: ['workshops'],
    queryFn: () => workshopsApi.list().then((r) => r.data),
  });

  const deleteWorkshopMutation = useMutation({
    mutationFn: (id: string) => workshopsApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workshops'] }); setDeleteItem(null); },
  });

  const deleteLineMutation = useMutation({
    mutationFn: (id: string) => productionLinesApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workshops'] }); setDeleteItem(null); },
  });

  const workshops = workshopsData?.data || [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dílny a výrobní linky"
        subtitle={`${workshops.length} dílen`}
        breadcrumbs={[{ label: 'Správa' }, { label: 'Dílny / Týmy' }]}
      />

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" height="120px" />
          ))}
        </div>
      ) : workshops.length === 0 ? (
        <EmptyState icon="workshops" title="Žádné dílny" description="Vytvořte první dílnu" />
      ) : (
        <div className="flex flex-col gap-4">
          {workshops.map((workshop: any) => (
            <GlassCard key={workshop.id} hover={false}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{workshop.name}</h3>
                  {workshop.code && <span className="text-xs text-slate-400 tabular-nums">{workshop.code}</span>}
                </div>
                <GradientButton variant="ghost" size="sm" onClick={() => setDeleteItem({ type: 'workshop', ...workshop })}>
                  Smazat
                </GradientButton>
              </div>

              {workshop.productionLines?.length > 0 && (
                <div className="ml-4 border-l-2 border-blue-200 dark:border-blue-800 pl-4 flex flex-col gap-2">
                  {workshop.productionLines.map((line: any) => (
                    <div key={line.id} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-slate-600 dark:text-slate-300">{line.name}</span>
                      <GradientButton variant="ghost" size="sm" onClick={() => setDeleteItem({ type: 'line', ...line })}>
                        ×
                      </GradientButton>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => {
          if (deleteItem?.type === 'workshop') deleteWorkshopMutation.mutate(deleteItem.id);
          else if (deleteItem?.type === 'line') deleteLineMutation.mutate(deleteItem.id);
        }}
        title={deleteItem?.type === 'workshop' ? 'Smazat dílnu?' : 'Smazat linku?'}
      >
        <strong>{deleteItem?.name}</strong> bude přesunuto do koše.
      </ConfirmDialog>
    </div>
  );
}
