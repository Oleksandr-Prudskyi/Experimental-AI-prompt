import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createUserSchema, type CreateUserInput } from '@evidence/shared';
import { usersApi } from '@/api/users';
import { workshopsApi } from '@/api/workshops';
import { shiftsApi } from '@/api/shifts';
import { GradientButton } from '@/components/shared/GradientButton';
import { Icon } from '@/components/shared/Icon';

interface UserFormDialogProps {
  open: boolean;
  user: any | null;
  onClose: () => void;
}

export function UserFormDialog({ open, user, onClose }: UserFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!user;

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => usersApi.getRoles().then((r) => r.data),
  });

  const { data: workshopsData } = useQuery({
    queryKey: ['workshops'],
    queryFn: () => workshopsApi.list().then((r) => r.data),
  });

  const { data: shiftsData } = useQuery({
    queryKey: ['shifts'],
    queryFn: () => shiftsApi.list().then((r) => r.data),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  useEffect(() => {
    if (open) {
      reset(user ? {
        email: user.email,
        fullName: user.fullName,
        roleId: user.roleId,
        workshopId: user.workshopId || undefined,
        shiftId: user.shiftId || undefined,
        phone: user.phone || undefined,
        position: user.position || undefined,
        password: '',
      } : {
        email: '',
        fullName: '',
        roleId: '',
        password: '',
      });
    }
  }, [open, user, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateUserInput) => usersApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); onClose(); },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersApi.update(user.id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); onClose(); },
  });

  const onSubmit = (data: CreateUserInput) => {
    if (isEdit) {
      const { password, ...rest } = data;
      updateMutation.mutate(rest);
    } else {
      createMutation.mutate(data);
    }
  };

  if (!open) return null;

  const roles = rolesData?.data || [];
  const workshops = workshopsData?.data || [];
  const shifts = (shiftsData?.data || []).filter((s: any) => s.isActive);
  const inputClass = 'rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-900 px-3 py-2 text-sm text-ev-800 dark:text-ev-100 transition-colors duration-150 focus:border-ev-700 dark:focus:border-ev-400 focus:ring-1 focus:ring-ev-700/10 outline-none w-full placeholder:text-ev-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ev-950/40 animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white dark:bg-ev-800 border border-ev-200 dark:border-ev-600/40 rounded-xl p-6 max-w-lg w-full shadow-lg animate-scale-in max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-ev-800 dark:text-ev-100">
            {isEdit ? 'Upravit uživatele' : 'Nový uživatel'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-ev-100 dark:hover:bg-ev-700 transition-colors duration-150">
            <Icon name="x" size={20} className="text-ev-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Jméno *</label>
              <input {...register('fullName')} className={inputClass} placeholder="Jan Novák" />
              {errors.fullName && <p className="text-xs text-st-error">{errors.fullName.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">E-mail *</label>
              <input {...register('email')} type="email" className={inputClass} placeholder="jan@evidence.local" />
              {errors.email && <p className="text-xs text-st-error">{errors.email.message}</p>}
            </div>
          </div>

          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Heslo *</label>
              <input {...register('password')} type="password" className={inputClass} placeholder="Minimálně 8 znaků" />
              {errors.password && <p className="text-xs text-st-error">{errors.password.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Role *</label>
              <select {...register('roleId')} className={inputClass}>
                <option value="">Vyberte roli</option>
                {roles.map((role: any) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              {errors.roleId && <p className="text-xs text-st-error">{errors.roleId.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Dílna / Čech</label>
              <select {...register('workshopId')} className={inputClass}>
                <option value="">Bez přiřazení</option>
                {workshops.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Směna</label>
              <select {...register('shiftId')} className={inputClass}>
                <option value="">Bez přiřazení</option>
                {shifts.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.startTime}–{s.endTime})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Pozice</label>
              <input {...register('position')} className={inputClass} placeholder="Seřizovač" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Telefon</label>
            <input {...register('phone')} className={inputClass} placeholder="+420 123 456 789" />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-ev-100 dark:border-ev-600/40">
            <GradientButton type="button" variant="ghost" onClick={onClose}>Zrušit</GradientButton>
            <GradientButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Ukládání...' : isEdit ? 'Uložit' : 'Vytvořit'}
            </GradientButton>
          </div>
        </form>
      </div>
    </div>
  );
}
