import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createWorkRecordSchema } from '@evidence/shared';
import { workRecordsApi } from '@/api/work-records';
import { machinesApi } from '@/api/machines';
import { productionLinesApi } from '@/api/workshops';
import { shiftsApi } from '@/api/shifts';
import { PageHeader } from '@/components/layout/PageHeader';
import { GradientButton } from '@/components/shared/GradientButton';
import { Skeleton } from '@/components/shared/Skeleton';
import { Icon } from '@/components/shared/Icon';
import { BasicInfoSection } from './sections/BasicInfoSection';
import { DescriptionSection } from './sections/DescriptionSection';
import { DowntimeSection } from './sections/DowntimeSection';

export function WorkRecordForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(createWorkRecordSchema) as any,
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'open',
      isDraft: false,
    },
  });

  const category = watch('category');
  const showDowntime = category === 'failure' || category === 'maintenance';

  const { data: existingRecord, isLoading: isLoadingRecord } = useQuery({
    queryKey: ['work-record', id],
    queryFn: () => workRecordsApi.get(id!).then((r) => r.data),
    enabled: isEdit,
  });

  const { data: machinesData } = useQuery({
    queryKey: ['machines-list'],
    queryFn: () => machinesApi.list().then((r) => r.data),
  });

  const { data: linesData } = useQuery({
    queryKey: ['lines-list'],
    queryFn: () => productionLinesApi.list().then((r) => r.data),
  });

  const { data: shiftsData } = useQuery({
    queryKey: ['shifts-list'],
    queryFn: () => shiftsApi.list().then((r) => r.data),
  });

  useEffect(() => {
    if (existingRecord?.data) {
      const r = existingRecord.data;
      reset({
        machineId: r.machineId,
        lineId: r.lineId,
        shiftId: r.shiftId || undefined,
        category: r.category as any,
        date: r.date?.split('T')[0] || r.date,
        startTime: r.startTime,
        endTime: r.endTime || undefined,
        description: r.description,
        downtimeMin: r.downtimeMin ?? undefined,
        cause: r.cause || undefined,
        maintenanceDone: r.maintenanceDone || undefined,
        replacedParts: r.replacedParts || undefined,
        requiredParts: r.requiredParts || undefined,
        recommendations: r.recommendations || undefined,
        priority: r.priority as any,
        status: r.status as any,
        isDraft: r.isDraft,
      });
    }
  }, [existingRecord, reset]);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      (isEdit ? workRecordsApi.update(id!, data) : workRecordsApi.create(data)) as any,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-records'] });
      navigate('/evidence');
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  if (isEdit && isLoadingRecord) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Načítání..."
          breadcrumbs={[{ label: 'Evidence práce', path: '/evidence' }, { label: 'Upravit' }]}
        />
        <div className="flex flex-col gap-4">
          <Skeleton variant="card" height="200px" />
          <Skeleton variant="card" height="120px" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isEdit ? 'Upravit záznam' : 'Nový záznam'}
        subtitle="Evidence práce"
        breadcrumbs={[
          { label: 'Evidence práce', path: '/evidence' },
          { label: isEdit ? 'Upravit' : 'Nový záznam' },
        ]}
        actions={
          <GradientButton variant="ghost" onClick={() => navigate('/evidence')}>
            Zpět na seznam
          </GradientButton>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <BasicInfoSection
          register={register}
          errors={errors}
          machines={machinesData?.data || []}
          lines={linesData?.data || []}
          shifts={shiftsData?.data || []}
        />

        <DescriptionSection register={register} errors={errors} />

        <DowntimeSection register={register} visible={showDowntime} />

        {mutation.error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2 animate-scale-in">
            <Icon name="warning" size={16} className="shrink-0" />
            {(mutation.error as any)?.response?.data?.message || 'Chyba při ukládání'}
          </div>
        )}

        {/* region: form actions */}
        <div className="flex gap-3 justify-end">
          <GradientButton type="button" variant="ghost" onClick={() => navigate('/evidence')}>
            Zrušit
          </GradientButton>
          <GradientButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Icon name="spinner" size={16} className="animate-spin" />
                Ukládám...
              </>
            ) : isEdit ? 'Uložit změny' : 'Vytvořit záznam'}
          </GradientButton>
        </div>
        {/* endregion */}
      </form>
    </div>
  );
}
