import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { machinesApi } from '@/api/machines';
import { workshopsApi } from '@/api/workshops';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@evidence/shared';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { Icon } from '@/components/shared/Icon';
import { cn } from '@/lib/cn';

const STATUS_LABELS: Record<string, string> = {
  operational: 'V provozu',
  maintenance: 'Udrzba',
  breakdown: 'Porucha',
  decommissioned: 'Vyrazeno',
};

const STATUS_FILTERS = ['all', 'operational', 'maintenance', 'breakdown', 'decommissioned'] as const;
const STATUS_FILTER_LABELS: Record<string, string> = {
  all: 'Vse',
  ...STATUS_LABELS,
};

const STATUS_OPTIONS = ['operational', 'maintenance', 'breakdown', 'decommissioned'] as const;

const inputClass =
  'rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-900 px-3 py-2 text-sm text-ev-800 dark:text-ev-100 transition-colors duration-150 focus:border-ev-700 dark:focus:border-ev-400 focus:ring-1 focus:ring-ev-700/10 outline-none w-full placeholder:text-ev-400';

// region -- Machine form dialog --

function MachineFormDialog({
  open,
  machine,
  workshops,
  onClose,
}: {
  open: boolean;
  machine: any | null;
  workshops: any[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!machine;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [workshopId, setWorkshopId] = useState('');
  const [lineId, setLineId] = useState('');
  const [status, setStatus] = useState('operational');
  const [submitting, setSubmitting] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (open && machine) {
      setName(machine.name || '');
      setCode(machine.code || '');
      setWorkshopId(machine.line?.workshop?.id || machine.line?.workshopId || '');
      setLineId(machine.lineId || '');
      setStatus(machine.status || 'operational');
    } else if (open) {
      setName('');
      setCode('');
      setWorkshopId('');
      setLineId('');
      setStatus('operational');
    }
  }, [open, machine]);

  // Get lines for selected workshop
  const availableLines = useMemo(() => {
    if (!workshopId) return [];
    const ws = workshops.find((w: any) => w.id === workshopId);
    return ws?.productionLines || [];
  }, [workshopId, workshops]);

  const handleWorkshopChange = (newWorkshopId: string) => {
    setWorkshopId(newWorkshopId);
    setLineId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        code: code.trim(),
        status,
        lineId: lineId || undefined,
      };
      if (isEdit) {
        await machinesApi.update(machine.id, payload);
      } else {
        await machinesApi.create(payload);
      }
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ev-950/40 animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white dark:bg-ev-800 border border-ev-200 dark:border-ev-600/40 rounded-xl p-6 max-w-lg w-full shadow-lg animate-scale-in"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-ev-800 dark:text-ev-100">
            {isEdit ? 'Upravit stroj' : 'Novy stroj'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-ev-100 dark:hover:bg-ev-700 transition-colors duration-150">
            <Icon name="x" size={20} className="text-ev-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Nazev *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="CNC Freza 01" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Kod *</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} className={inputClass} placeholder="CNC-01" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Dilna</label>
              <select value={workshopId} onChange={(e) => handleWorkshopChange(e.target.value)} className={inputClass}>
                <option value="">Bez prirazeni</option>
                {workshops.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Vyrobni linka</label>
              <select value={lineId} onChange={(e) => setLineId(e.target.value)} className={inputClass} disabled={!workshopId}>
                <option value="">Bez prirazeni</option>
                {availableLines.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Stav</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-ev-100 dark:border-ev-600/40">
            <GradientButton type="button" variant="ghost" onClick={onClose}>Zrusit</GradientButton>
            <GradientButton type="submit" disabled={submitting || !name.trim() || !code.trim()}>
              {submitting ? 'Ukladani...' : isEdit ? 'Ulozit' : 'Vytvorit'}
            </GradientButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// endregion

export function MachinesPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PERMISSIONS.MACHINES_MANAGE);

  const [statusFilter, setStatusFilter] = useState('all');
  const [workshopFilter, setWorkshopFilter] = useState('');
  const [lineFilter, setLineFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editMachine, setEditMachine] = useState<any>(null);
  const [deleteMachine, setDeleteMachine] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['machines'],
    queryFn: () => machinesApi.list().then((r) => r.data),
  });

  const { data: workshopsData } = useQuery({
    queryKey: ['workshops'],
    queryFn: () => workshopsApi.list().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => machinesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] });
      setDeleteMachine(null);
    },
  });

  const allMachines = data?.data || [];
  const workshops = workshopsData?.data || [];

  // Available lines for the selected workshop filter
  const filterLines = useMemo(() => {
    if (!workshopFilter) return [];
    const ws = workshops.find((w: any) => w.id === workshopFilter);
    return ws?.productionLines || [];
  }, [workshopFilter, workshops]);

  // Apply filters
  const machines = useMemo(() => {
    let filtered = allMachines;
    if (statusFilter !== 'all') {
      filtered = filtered.filter((m: any) => m.status === statusFilter);
    }
    if (workshopFilter) {
      filtered = filtered.filter((m: any) => m.line?.workshop?.id === workshopFilter || m.line?.workshopId === workshopFilter);
    }
    if (lineFilter) {
      filtered = filtered.filter((m: any) => m.lineId === lineFilter);
    }
    return filtered;
  }, [allMachines, statusFilter, workshopFilter, lineFilter]);

  const statusCounts = allMachines.reduce((acc: Record<string, number>, m: any) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});

  const subtitle = allMachines.length > 0
    ? `${allMachines.length} stroju${statusCounts.operational ? ` · ${statusCounts.operational} v provozu` : ''}${statusCounts.maintenance ? ` · ${statusCounts.maintenance} udrzba` : ''}${statusCounts.breakdown ? ` · ${statusCounts.breakdown} porucha` : ''}`
    : `${allMachines.length} stroju`;

  const handleWorkshopFilterChange = (value: string) => {
    setWorkshopFilter(value);
    setLineFilter('');
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Stroje"
        subtitle={subtitle}
        actions={
          canManage ? (
            <GradientButton onClick={() => { setEditMachine(null); setShowForm(true); }}>
              + Novy stroj
            </GradientButton>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="card" height="100px" />
          ))}
        </div>
      ) : allMachines.length === 0 ? (
        <EmptyState icon="machines" title="Zadne stroje" description="Pridejte prvni stroj" />
      ) : (
        <>
          {/* Filters row */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Workshop filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ev-500 dark:text-ev-400">Dilna</label>
              <select
                value={workshopFilter}
                onChange={(e) => handleWorkshopFilterChange(e.target.value)}
                className={cn(inputClass, 'w-44')}
              >
                <option value="">Vse</option>
                {workshops.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* Line filter (dependent on workshop) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-ev-500 dark:text-ev-400">Linka</label>
              <select
                value={lineFilter}
                onChange={(e) => setLineFilter(e.target.value)}
                className={cn(inputClass, 'w-44')}
                disabled={!workshopFilter}
              >
                <option value="">Vse</option>
                {filterLines.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Status filter pills */}
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150',
                    statusFilter === status
                      ? 'bg-ev-900 text-white dark:bg-ev-100 dark:text-ev-900'
                      : 'bg-ev-100 dark:bg-ev-800 text-ev-600 dark:text-ev-400 hover:bg-ev-200 dark:hover:bg-ev-700',
                  )}
                >
                  {STATUS_FILTER_LABELS[status]}
                  {status !== 'all' && statusCounts[status] ? ` (${statusCounts[status]})` : ''}
                </button>
              ))}
            </div>
          </div>

          {machines.length === 0 ? (
            <div className="text-center py-12 text-sm text-ev-400">Zadne stroje neodpovidaji filtru</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {machines.map((machine: any) => (
                <GlassCard key={machine.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-ev-800 dark:text-ev-100">{machine.name}</h3>
                      <span className="text-xs text-ev-400 tabular-nums">{machine.code}</span>
                    </div>
                    <StatusBadge status={machine.status} label={STATUS_LABELS[machine.status] || machine.status} />
                  </div>
                  {machine.line && (
                    <p className="text-sm text-ev-500 dark:text-ev-400 mb-3">
                      {machine.line.workshop?.name} → {machine.line.name}
                    </p>
                  )}
                  {canManage && (
                    <div className="flex justify-end gap-1 pt-2 border-t border-ev-100 dark:border-ev-700/30">
                      <button
                        onClick={() => { setEditMachine(machine); setShowForm(true); }}
                        className="rounded-md p-1.5 hover:bg-ev-100 dark:hover:bg-ev-800 text-ev-500 hover:text-ev-700 dark:hover:text-ev-300 transition-colors duration-150"
                        title="Upravit"
                      >
                        <Icon name="edit" size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteMachine(machine)}
                        className="rounded-md p-1.5 hover:bg-st-error-muted dark:hover:bg-st-error/10 text-st-error transition-colors duration-150"
                        title="Smazat"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </>
      )}

      <MachineFormDialog
        open={showForm}
        machine={editMachine}
        workshops={workshops}
        onClose={() => { setShowForm(false); setEditMachine(null); }}
      />

      <ConfirmDialog
        open={!!deleteMachine}
        onClose={() => setDeleteMachine(null)}
        onConfirm={() => deleteMachine && deleteMutation.mutate(deleteMachine.id)}
        title="Smazat stroj?"
      >
        Stroj <strong>{deleteMachine?.name}</strong> ({deleteMachine?.code}) bude presunut do kose.
      </ConfirmDialog>
    </div>
  );
}
