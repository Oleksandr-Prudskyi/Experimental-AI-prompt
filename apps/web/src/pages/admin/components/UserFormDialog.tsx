import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createUserSchema, type CreateUserInput } from '@evidence/shared';
import { usersApi } from '@/api/users';
import { GradientButton } from '@/components/shared/GradientButton';

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
  const inputClass = 'rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm transition-all duration-300 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none w-full';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative glass-card rounded-3xl p-6 max-w-lg w-full shadow-xl animate-scale-in bg-white/85 dark:bg-slate-800/80 backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
          {isEdit ? 'Upravit uživatele' : 'Nový uživatel'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Jméno</label>
            <input {...register('fullName')} className={inputClass} placeholder="Jan Novák" />
            {errors.fullName && <p className="text-xs text-rose-500">{errors.fullName.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
            <input {...register('email')} type="email" className={inputClass} placeholder="jan@evidence.local" />
            {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
          </div>

          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Heslo</label>
              <input {...register('password')} type="password" className={inputClass} placeholder="••••••••" />
              {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
            <select {...register('roleId')} className={inputClass}>
              <option value="">Vyberte roli</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            {errors.roleId && <p className="text-xs text-rose-500">{errors.roleId.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Telefon</label>
            <input {...register('phone')} className={inputClass} placeholder="+420 123 456 789" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pozice</label>
            <input {...register('position')} className={inputClass} placeholder="Seřizovač" />
          </div>

          <div className="flex justify-end gap-3 mt-2">
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
