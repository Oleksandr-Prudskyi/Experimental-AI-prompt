import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { announcementsApi } from '@/api/announcements';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/shared/Skeleton';
import { Icon } from '@/components/shared/Icon';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@evidence/shared';

interface AnnouncementForm {
  title: string;
  content: string;
  priority: string;
  isActive: boolean;
  expiresAt: string;
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Nízká',
  medium: 'Střední',
  high: 'Vysoká',
  critical: 'Kritická',
};

export function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PERMISSIONS.ANNOUNCEMENTS_MANAGE);

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => announcementsApi.list().then((r) => r.data),
  });

  const announcements = data?.data || [];

  const createMutation = useMutation({
    mutationFn: (formData: AnnouncementForm) =>
      announcementsApi.create({
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        isActive: formData.isActive,
        expiresAt: formData.expiresAt || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: AnnouncementForm }) =>
      announcementsApi.update(id, {
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        isActive: formData.isActive,
        expiresAt: formData.expiresAt || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setDeleteItem(null);
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AnnouncementForm>();

  function openCreate() {
    setEditItem(null);
    reset({ title: '', content: '', priority: 'medium', isActive: true, expiresAt: '' });
    setShowModal(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    reset({
      title: item.title,
      content: item.content,
      priority: item.priority || 'medium',
      isActive: item.isActive ?? true,
      expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : '',
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditItem(null);
  }

  function onSubmit(formData: AnnouncementForm) {
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Oznámení"
        breadcrumbs={[{ label: 'Oznámení' }]}
        actions={
          canManage ? (
            <GradientButton onClick={openCreate}>+ Nové oznámení</GradientButton>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" height="120px" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState icon="bell" title="Žádná oznámení" description="Zatím nebyla vytvořena žádná oznámení" />
      ) : (
        <div className="flex flex-col gap-4">
          {announcements.map((item: any) => (
            <GlassCard key={item.id} hover={false}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-ev-800 dark:text-ev-100 truncate">
                      {item.title}
                    </h3>
                    <StatusBadge
                      status={item.priority || 'medium'}
                      label={PRIORITY_LABELS[item.priority] || item.priority}
                    />
                    {item.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-st-ok">
                        <span className="w-1.5 h-1.5 rounded-full bg-st-ok" />
                        Aktivní
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-ev-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-ev-400" />
                        Neaktivní
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ev-600 dark:text-ev-300 mb-2">
                    {item.content?.length > 200 ? item.content.slice(0, 200) + '…' : item.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-ev-400">
                    {item.author?.fullName && <span>{item.author.fullName}</span>}
                    {item.createdAt && <span>{formatDate(item.createdAt)}</span>}
                    {item.expiresAt && <span>Vyprší: {formatDate(item.expiresAt)}</span>}
                  </div>
                </div>

                {canManage && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded-md p-1.5 hover:bg-ev-100 dark:hover:bg-ev-800 text-ev-500 hover:text-ev-700 dark:hover:text-ev-300 transition-colors duration-150"
                      title="Upravit"
                    >
                      <Icon name="edit" size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="rounded-md p-1.5 hover:bg-st-error-muted dark:hover:bg-st-error/10 text-st-error transition-colors duration-150"
                      title="Smazat"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ev-950/40 animate-fade-in" onClick={closeModal} />
          <div className="relative bg-white dark:bg-ev-800 border border-ev-200 dark:border-ev-600/40 rounded-xl p-6 max-w-lg w-full shadow-lg animate-scale-in">
            <h2 className="text-lg font-bold text-ev-800 dark:text-ev-100 mb-4">
              {editItem ? 'Upravit oznámení' : 'Nové oznámení'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-ev-700 dark:text-ev-300 mb-1">
                  Název
                </label>
                <input
                  {...register('title', { required: 'Název je povinný' })}
                  className="w-full rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-800 px-3 py-2 text-sm text-ev-700 dark:text-ev-300 focus:ring-1 focus:ring-ev-700/10 outline-none transition-colors duration-150"
                  placeholder="Název oznámení"
                />
                {errors.title && (
                  <p className="text-xs text-st-error mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-ev-700 dark:text-ev-300 mb-1">
                  Obsah
                </label>
                <textarea
                  {...register('content', { required: 'Obsah je povinný' })}
                  rows={4}
                  className="w-full rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-800 px-3 py-2 text-sm text-ev-700 dark:text-ev-300 focus:ring-1 focus:ring-ev-700/10 outline-none transition-colors duration-150 resize-none"
                  placeholder="Text oznámení"
                />
                {errors.content && (
                  <p className="text-xs text-st-error mt-1">{errors.content.message}</p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-ev-700 dark:text-ev-300 mb-1">
                  Priorita
                </label>
                <select
                  {...register('priority')}
                  className="w-full rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-800 px-3 py-2 text-sm text-ev-700 dark:text-ev-300 focus:ring-1 focus:ring-ev-700/10 outline-none transition-colors duration-150"
                >
                  <option value="low">Nízká</option>
                  <option value="medium">Střední</option>
                  <option value="high">Vysoká</option>
                  <option value="critical">Kritická</option>
                </select>
              </div>

              {/* isActive */}
              <label className="flex items-center gap-2 text-sm text-ev-700 dark:text-ev-300">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="rounded border-ev-300 dark:border-ev-600 text-petrol-500 focus:ring-petrol-500"
                />
                Aktivní
              </label>

              {/* expiresAt */}
              <div>
                <label className="block text-sm font-medium text-ev-700 dark:text-ev-300 mb-1">
                  Datum expirace (volitelné)
                </label>
                <input
                  type="date"
                  {...register('expiresAt')}
                  className="w-full rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-800 px-3 py-2 text-sm text-ev-700 dark:text-ev-300 focus:ring-1 focus:ring-ev-700/10 outline-none transition-colors duration-150"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <GradientButton variant="ghost" type="button" onClick={closeModal}>
                  Zrušit
                </GradientButton>
                <GradientButton
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editItem ? 'Uložit' : 'Vytvořit'}
                </GradientButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        title="Smazat oznámení?"
      >
        Oznámení <strong>{deleteItem?.title}</strong> bude smazáno.
      </ConfirmDialog>
    </div>
  );
}
