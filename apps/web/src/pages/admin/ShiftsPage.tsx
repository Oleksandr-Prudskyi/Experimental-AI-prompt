import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shiftsApi } from '@/api/shifts';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { Icon } from '@/components/shared/Icon';

const inputClass =
  'rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-900 px-3 py-2 text-sm text-ev-800 dark:text-ev-100 transition-colors duration-150 focus:border-ev-700 dark:focus:border-ev-400 focus:ring-1 focus:ring-ev-700/10 outline-none w-full placeholder:text-ev-400';

function pluralSmeny(n: number) {
  if (n === 1) return 'směna';
  if (n >= 2 && n <= 4) return 'směny';
  return 'směn';
}

function ShiftForm({ shift, onClose }: { shift?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(shift?.name || '');
  const [startTime, setStartTime] = useState(shift?.startTime || '');
  const [endTime, setEndTime] = useState(shift?.endTime || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startTime || !endTime) return;
    setSubmitting(true);
    try {
      if (shift) {
        await shiftsApi.update(shift.id, { name: name.trim(), startTime, endTime });
      } else {
        await shiftsApi.create({ name: name.trim(), startTime, endTime });
      }
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
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
            {shift ? 'Upravit směnu' : 'Nová směna'}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Název směny"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5 w-full sm:w-36">
          <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Začátek</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5 w-full sm:w-36">
          <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Konec</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex gap-2">
          <GradientButton type="submit" size="sm" disabled={submitting || !name.trim() || !startTime || !endTime}>
            {submitting ? 'Ukládání...' : shift ? 'Uložit' : 'Vytvořit'}
          </GradientButton>
          <GradientButton type="button" variant="ghost" size="sm" onClick={onClose}>
            Zrušit
          </GradientButton>
        </div>
      </form>
    </GlassCard>
  );
}

export function ShiftsPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editShift, setEditShift] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => shiftsApi.list().then((r) => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      shiftsApi.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => shiftsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setDeleteItem(null);
    },
  });

  const shifts = data?.data || [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Směny"
        subtitle={`${shifts.length} ${pluralSmeny(shifts.length)}`}
        breadcrumbs={[{ label: 'Správa' }, { label: 'Směny' }]}
        actions={
          <GradientButton onClick={() => { setEditShift(null); setShowForm(true); }}>
            + Nová směna
          </GradientButton>
        }
      />

      {showForm && (
        <ShiftForm
          shift={editShift}
          onClose={() => { setShowForm(false); setEditShift(null); }}
        />
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="bar" height="48px" />
          ))}
        </div>
      ) : shifts.length === 0 ? (
        <EmptyState icon="shifts" title="Žádné směny" description="Vytvořte první směnu" />
      ) : (
        <GlassCard hover={false} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ev-200 dark:border-ev-600/40">
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Název</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Začátek</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Konec</th>
                <th className="text-center py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Aktivní</th>
                <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Akce</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift: any) => (
                <tr
                  key={shift.id}
                  className="border-b border-ev-100 dark:border-ev-700/30 hover:bg-ev-50 dark:hover:bg-ev-800/30 transition-colors duration-150"
                >
                  <td className="py-3 px-4 font-medium text-ev-800 dark:text-ev-200">{shift.name}</td>
                  <td className="py-3 px-4 text-ev-500 dark:text-ev-400 tabular-nums">{shift.startTime}</td>
                  <td className="py-3 px-4 text-ev-500 dark:text-ev-400 tabular-nums">{shift.endTime}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      role="switch"
                      aria-checked={shift.isActive}
                      onClick={() => toggleMutation.mutate({ id: shift.id, isActive: !shift.isActive })}
                      className={`w-10 h-6 rounded-full transition-colors duration-150 ${shift.isActive ? 'bg-st-ok' : 'bg-ev-300 dark:bg-ev-600'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${shift.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditShift(shift); setShowForm(true); }}
                        className="rounded-md p-1.5 hover:bg-ev-100 dark:hover:bg-ev-800 text-ev-500 hover:text-ev-700 dark:hover:text-ev-300 transition-colors duration-150"
                        title="Upravit"
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteItem(shift)}
                        className="rounded-md p-1.5 hover:bg-st-error-muted dark:hover:bg-st-error/10 text-st-error transition-colors duration-150"
                        title="Smazat"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        title="Smazat směnu?"
      >
        Směna <strong>{deleteItem?.name}</strong> bude smazána.
      </ConfirmDialog>
    </div>
  );
}
