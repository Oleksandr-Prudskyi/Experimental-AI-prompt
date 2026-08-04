import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workRecordsApi } from '@/api/work-records';
import { machinesApi } from '@/api/machines';
import { PageHeader } from '@/components/layout/PageHeader';
import { GradientButton } from '@/components/shared/GradientButton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { EvidenceFilters } from './components/EvidenceFilters';
import { EvidenceTable } from './components/EvidenceTable';
import { EvidenceCard } from './components/EvidenceCard';
import type { WorkRecord } from '@evidence/shared';

export function EvidencePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [deleteRecord, setDeleteRecord] = useState<WorkRecord | null>(null);

  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== ''),
  );

  const { data, isLoading } = useQuery({
    queryKey: ['work-records', activeFilters],
    queryFn: () => workRecordsApi.list(activeFilters).then((r) => r.data),
  });

  const { data: machinesData } = useQuery({
    queryKey: ['machines-list'],
    queryFn: () => machinesApi.list().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workRecordsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-records'] });
      setDeleteRecord(null);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => workRecordsApi.duplicate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['work-records'] }),
  });

  const records: WorkRecord[] = data?.data || [];
  const machines = machinesData?.data || [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Evidence práce"
        subtitle={`${records.length} záznamů`}
        actions={
          <GradientButton onClick={() => navigate('/evidence/new')}>
            + Nový záznam
          </GradientButton>
        }
      />

      <EvidenceFilters filters={filters} onChange={handleFilterChange} machines={machines} />

      {records.length === 0 && !isLoading ? (
        <EmptyState icon="📋" title="Žádné záznamy" description="Vytvořte první pracovní záznam" />
      ) : (
        <>
          {/* region: desktop table */}
          <div className="hidden md:block">
            <EvidenceTable records={records} onDelete={setDeleteRecord} onDuplicate={(id) => duplicateMutation.mutate(id)} />
          </div>
          {/* endregion */}

          {/* region: mobile cards */}
          <div className="md:hidden flex flex-col gap-4">
            {records.map((record, i) => (
              <EvidenceCard
                key={record.id}
                record={record}
                index={i}
                onDelete={setDeleteRecord}
                onDuplicate={(id) => duplicateMutation.mutate(id)}
              />
            ))}
          </div>
          {/* endregion */}

          {data?.meta?.hasMore && (
            <div className="text-center">
              <GradientButton variant="ghost" onClick={() => {
                const cursor = data.meta.cursor;
                if (cursor) setFilters((prev) => ({ ...prev, cursor }));
              }}>
                Načíst další
              </GradientButton>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteRecord}
        onClose={() => setDeleteRecord(null)}
        onConfirm={() => deleteRecord && deleteMutation.mutate(deleteRecord.id)}
        title="Smazat záznam?"
      >
        Opravdu chcete smazat tento pracovní záznam? Záznam bude přesunut do koše.
      </ConfirmDialog>
    </div>
  );
}
