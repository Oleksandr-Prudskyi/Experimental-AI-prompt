import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trashApi } from '@/api/trash';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { useAuthStore } from '@/stores/auth.store';

const entityLabels: Record<string, string> = {
  user: 'Uživatelé',
  workshop: 'Dílny',
  productionLine: 'Výrobní linky',
  machine: 'Stroje',
  team: 'Týmy',
  workRecord: 'Pracovní záznamy',
  comment: 'Komentáře',
};

function getItemLabel(_entityType: string, item: any): string {
  return item.fullName || item.name || item.description?.slice(0, 60) || item.content?.slice(0, 60) || item.id;
}

export function TrashPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAdmin = (user as any)?.role?.slug === 'administrator';
  const [confirmAction, setConfirmAction] = useState<{ type: 'restore' | 'delete'; entityType: string; id: string; label: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['trash'],
    queryFn: () => trashApi.list().then((r) => r.data),
  });

  const restoreMutation = useMutation({
    mutationFn: ({ entityType, id }: { entityType: string; id: string }) => trashApi.restore(entityType, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      setConfirmAction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ entityType, id }: { entityType: string; id: string }) => trashApi.permanentDelete(entityType, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      setConfirmAction(null);
    },
  });

  const groups = data?.data || data || [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Koš" subtitle="Smazané položky" />

      {groups.length === 0 && !isLoading ? (
        <EmptyState icon="trash" title="Koš je prázdný" description="Žádné smazané položky" />
      ) : (
        groups.map((group: any, gi: number) => (
          <GlassCard key={group.entityType} hover={false} className="animate-fade-in-up" style={{ animationDelay: `${gi * 100}ms` }}>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
              {entityLabels[group.entityType] || group.entityType}
              <span className="ml-2 text-sm font-normal text-slate-400">({group.items.length})</span>
            </h3>

            <div className="flex flex-col divide-y divide-slate-200/30 dark:divide-slate-700/30">
              {group.items.map((item: any, i: number) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 animate-fade-in"
                  style={{ animationDelay: `${gi * 100 + i * 40}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                      {getItemLabel(group.entityType, item)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Smazáno: {new Date(item.deletedAt).toLocaleString('cs-CZ')}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <GradientButton
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmAction({ type: 'restore', entityType: group.entityType, id: item.id, label: getItemLabel(group.entityType, item) })}
                    >
                      Obnovit
                    </GradientButton>

                    {isAdmin && (
                      <GradientButton
                        size="sm"
                        variant="danger"
                        onClick={() => setConfirmAction({ type: 'delete', entityType: group.entityType, id: item.id, label: getItemLabel(group.entityType, item) })}
                      >
                        Trvale smazat
                      </GradientButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        ))
      )}

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === 'restore') {
            restoreMutation.mutate({ entityType: confirmAction.entityType, id: confirmAction.id });
          } else {
            deleteMutation.mutate({ entityType: confirmAction.entityType, id: confirmAction.id });
          }
        }}
        title={confirmAction?.type === 'restore' ? 'Obnovit položku?' : 'Trvale smazat?'}
        variant={confirmAction?.type === 'restore' ? 'primary' : 'danger'}
        confirmLabel={confirmAction?.type === 'restore' ? 'Obnovit' : 'Trvale smazat'}
      >
        {confirmAction?.type === 'restore'
          ? `Chcete obnovit "${confirmAction?.label}"?`
          : `Trvale smazat "${confirmAction?.label}"? Tato akce je nevratná.`}
      </ConfirmDialog>
    </div>
  );
}
