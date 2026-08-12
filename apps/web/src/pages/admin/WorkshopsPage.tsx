import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workshopsApi, productionLinesApi } from '@/api/workshops';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@evidence/shared';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { Icon } from '@/components/shared/Icon';

// region -- Inline form for hala / linka --

const inputClass =
  'rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-900 px-3 py-2 text-sm text-ev-800 dark:text-ev-100 transition-colors duration-150 focus:border-ev-700 dark:focus:border-ev-400 focus:ring-1 focus:ring-ev-700/10 outline-none w-full placeholder:text-ev-400';

function InlineHalaForm({ workshop, onClose }: { workshop?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(workshop?.name || '');
  const [code, setCode] = useState(workshop?.code || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (workshop) {
        await workshopsApi.update(workshop.id, { name: name.trim(), code: code.trim() || undefined });
      } else {
        await workshopsApi.create({ name: name.trim(), code: code.trim() || undefined });
      }
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard hover={false}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-3">
        <div className="flex flex-col gap-1.5 flex-1 w-full">
          <label className="text-sm font-medium text-ev-700 dark:text-ev-300">
            {workshop ? 'Upravit halu' : 'Nová hala'}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Název haly"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5 w-full sm:w-40">
          <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Kód</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={inputClass}
            placeholder="H01"
          />
        </div>
        <div className="flex gap-2">
          <GradientButton type="submit" size="sm" disabled={submitting || !name.trim()}>
            {submitting ? 'Ukládání...' : workshop ? 'Uložit' : 'Vytvořit'}
          </GradientButton>
          <GradientButton type="button" variant="ghost" size="sm" onClick={onClose}>
            Zrušit
          </GradientButton>
        </div>
      </form>
    </GlassCard>
  );
}

function InlineLineForm({ workshopId, line, onClose }: { workshopId: string; line?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(line?.name || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      if (line) {
        await productionLinesApi.update(line.id, { name: name.trim() });
      } else {
        await productionLinesApi.create({ name: name.trim(), workshopId });
      }
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 py-1.5">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputClass}
        placeholder="Název linky"
        autoFocus
      />
      <GradientButton type="submit" size="sm" disabled={submitting || !name.trim()}>
        {line ? 'Uložit' : '+'}
      </GradientButton>
      <GradientButton type="button" variant="ghost" size="sm" onClick={onClose}>
        <Icon name="x" size={14} />
      </GradientButton>
    </form>
  );
}

// endregion

function pluralHaly(n: number) {
  if (n === 1) return 'hala';
  if (n >= 2 && n <= 4) return 'haly';
  return 'hal';
}

function pluralLinky(n: number) {
  if (n === 1) return 'linka';
  if (n >= 2 && n <= 4) return 'linky';
  return 'linek';
}

export function WorkshopsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PERMISSIONS.WORKSHOPS_MANAGE);

  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [showHalaForm, setShowHalaForm] = useState(false);
  const [editHala, setEditHala] = useState<any>(null);
  const [expandedHaly, setExpandedHaly] = useState<Set<string>>(new Set());
  const [addingLineForHala, setAddingLineForHala] = useState<string | null>(null);
  const [editingLine, setEditingLine] = useState<any>(null);

  const { data: workshopsData, isLoading } = useQuery({
    queryKey: ['workshops'],
    queryFn: () => workshopsApi.list().then((r) => r.data),
  });

  const deleteWorkshopMutation = useMutation({
    mutationFn: (id: string) => workshopsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
      setDeleteItem(null);
    },
  });

  const deleteLineMutation = useMutation({
    mutationFn: (id: string) => productionLinesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshops'] });
      setDeleteItem(null);
    },
  });

  const workshops = workshopsData?.data || [];

  const toggleExpand = (id: string) => {
    setExpandedHaly((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalLines = workshops.reduce((acc: number, w: any) => acc + (w.productionLines?.length || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Haly a výrobní linky"
        subtitle={`${workshops.length} ${pluralHaly(workshops.length)} · ${totalLines} ${pluralLinky(totalLines)}`}
        breadcrumbs={[{ label: 'Správa' }, { label: 'Haly' }]}
        actions={
          canManage ? (
            <GradientButton onClick={() => { setEditHala(null); setShowHalaForm(true); }}>
              + Nová hala
            </GradientButton>
          ) : undefined
        }
      />

      {showHalaForm && (
        <InlineHalaForm
          workshop={editHala}
          onClose={() => { setShowHalaForm(false); setEditHala(null); }}
        />
      )}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" height="120px" />
          ))}
        </div>
      ) : workshops.length === 0 ? (
        <EmptyState icon="workshops" title="Žádné haly" description="Vytvořte první halu" />
      ) : (
        <div className="flex flex-col gap-4">
          {workshops.map((workshop: any) => {
            const isExpanded = expandedHaly.has(workshop.id);
            const lines = workshop.productionLines || [];

            return (
              <GlassCard key={workshop.id} hover={false}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand(workshop.id)}
                      className="rounded-md p-1 hover:bg-ev-100 dark:hover:bg-ev-700 transition-colors duration-150"
                      title={isExpanded ? 'Sbalit' : 'Rozbalit'}
                    >
                      <Icon
                        name={isExpanded ? 'chevron-down' : 'chevron-right'}
                        size={16}
                        className="text-ev-400"
                      />
                    </button>
                    <div>
                      <h3 className="text-base font-semibold text-ev-800 dark:text-ev-100">
                        {workshop.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {workshop.code && (
                          <span className="text-xs text-ev-400 tabular-nums">{workshop.code}</span>
                        )}
                        <span className="text-xs text-ev-400">
                          {lines.length} {pluralLinky(lines.length)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditHala(workshop); setShowHalaForm(true); }}
                        className="rounded-md p-1.5 hover:bg-ev-100 dark:hover:bg-ev-800 text-ev-500 hover:text-ev-700 dark:hover:text-ev-300 transition-colors duration-150"
                        title="Upravit"
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteItem({ type: 'workshop', ...workshop })}
                        className="rounded-md p-1.5 hover:bg-st-error-muted dark:hover:bg-st-error/10 text-st-error transition-colors duration-150"
                        title="Smazat"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="ml-7 mt-3 border-l-2 border-ev-200 dark:border-ev-600/40 pl-4 flex flex-col gap-2">
                    {lines.map((line: any) => (
                      <div key={line.id}>
                        {editingLine?.id === line.id ? (
                          <InlineLineForm
                            workshopId={workshop.id}
                            line={line}
                            onClose={() => setEditingLine(null)}
                          />
                        ) : (
                          <div className="flex items-center justify-between py-1.5">
                            <span className="text-sm text-ev-600 dark:text-ev-300">{line.name}</span>
                            {canManage && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setEditingLine(line)}
                                  className="rounded-md p-1 hover:bg-ev-100 dark:hover:bg-ev-800 text-ev-500 hover:text-ev-700 dark:hover:text-ev-300 transition-colors duration-150"
                                  title="Upravit linku"
                                >
                                  <Icon name="edit" size={14} />
                                </button>
                                <button
                                  onClick={() => setDeleteItem({ type: 'line', ...line })}
                                  className="rounded-md p-1 hover:bg-st-error-muted dark:hover:bg-st-error/10 text-st-error transition-colors duration-150"
                                  title="Smazat linku"
                                >
                                  <Icon name="trash" size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {addingLineForHala === workshop.id ? (
                      <InlineLineForm
                        workshopId={workshop.id}
                        onClose={() => setAddingLineForHala(null)}
                      />
                    ) : (
                      canManage && (
                        <button
                          onClick={() => setAddingLineForHala(workshop.id)}
                          className="flex items-center gap-1.5 text-xs text-petrol-500 hover:text-petrol-600 dark:text-petrol-400 dark:hover:text-petrol-300 py-1.5 transition-colors duration-150"
                        >
                          <Icon name="plus" size={14} />
                          Přidat linku
                        </button>
                      )
                    )}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => {
          if (deleteItem?.type === 'workshop') deleteWorkshopMutation.mutate(deleteItem.id);
          else if (deleteItem?.type === 'line') deleteLineMutation.mutate(deleteItem.id);
        }}
        title={deleteItem?.type === 'workshop' ? 'Smazat halu?' : 'Smazat linku?'}
      >
        <strong>{deleteItem?.name}</strong> bude přesunuto do koše.
      </ConfirmDialog>
    </div>
  );
}
