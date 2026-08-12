import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { usersApi } from '@/api/users';
import { authApi } from '@/api/auth';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { Icon } from '@/components/shared/Icon';

// -- Schemas --

const profileSchema = z.object({
  fullName: z.string().min(1, 'Jméno je povinné'),
  phone: z.string().optional(),
  position: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Zadejte aktuální heslo'),
    newPassword: z.string().min(8, 'Heslo musí mít alespoň 8 znaků'),
    confirmPassword: z.string().min(1, 'Potvrďte nové heslo'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Hesla se neshodují',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

// -- Component --

export function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const isDemo = user?.email === 'demo@evidence.local';
  const isAdmin = user?.role?.slug === 'administrator';
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // -- Profile form --

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      position: user?.position || '',
    },
  });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      usersApi.update(user!.id, {
        fullName: data.fullName,
        phone: data.phone || undefined,
        position: data.position || undefined,
      }),
    onSuccess: (res) => {
      const updatedUser = res.data.data;
      if (accessToken) {
        setAuth(accessToken, updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
  });

  // -- Password form --

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError('');
      resetPassword();
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Nepodařilo se změnit heslo';
      setPasswordError(msg);
    },
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    profileMutation.mutate(data);
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    setPasswordError('');
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  const inputClass =
    'rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-900 px-3 py-2 text-sm text-ev-800 dark:text-ev-100 transition-colors duration-150 focus:border-ev-700 dark:focus:border-ev-400 focus:ring-1 focus:ring-ev-700/10 outline-none w-full placeholder:text-ev-400';

  const readonlyClass =
    'rounded-md border border-ev-200 dark:border-ev-600/40 bg-ev-50 dark:bg-ev-900/50 px-3 py-2 text-sm text-ev-500 dark:text-ev-400 w-full cursor-not-allowed';

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Můj účet"
        subtitle="Správa osobních údajů a hesla"
        breadcrumbs={[{ label: 'Účet' }]}
      />

      {/* Profile info section */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-ev-200 dark:bg-ev-700 flex items-center justify-center text-ev-600 dark:text-ev-300 font-bold text-sm shrink-0">
            {user.fullName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <h2 className="text-lg font-semibold text-ev-800 dark:text-ev-100">
            Osobní údaje
          </h2>
        </div>

        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">
                Jméno *
              </label>
              <input
                {...registerProfile('fullName')}
                className={inputClass}
                placeholder="Jan Novák"
              />
              {profileErrors.fullName && (
                <p className="text-xs text-st-error">{profileErrors.fullName.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">
                E-mail
              </label>
              <input
                type="email"
                value={user.email}
                readOnly
                className={readonlyClass}
              />
              <p className="text-xs text-ev-400">E-mail nelze změnit</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">
                Telefon
              </label>
              <input
                {...registerProfile('phone')}
                className={inputClass}
                placeholder="+420 123 456 789"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">
                Pozice
              </label>
              <input
                {...registerProfile('position')}
                className={inputClass}
                placeholder="Seřizovač"
              />
            </div>
          </div>

          {/* Read-only info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-ev-100 dark:border-ev-600/40">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ev-500 dark:text-ev-400">Role</span>
              <span className="text-sm text-ev-800 dark:text-ev-200">
                {user.role?.name || '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ev-500 dark:text-ev-400">Dílna</span>
              <span className="text-sm text-ev-800 dark:text-ev-200">
                {user.workshop?.name || '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ev-500 dark:text-ev-400">Směna</span>
              <span className="text-sm text-ev-800 dark:text-ev-200">
                {user.shift?.name || '—'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {profileSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-st-ok">
                <Icon name="check-circle" size={16} />
                Uloženo
              </span>
            )}
            <GradientButton type="submit" disabled={isProfileSubmitting}>
              {isProfileSubmitting ? 'Ukládání...' : 'Uložit změny'}
            </GradientButton>
          </div>
        </form>
      </GlassCard>

      {/* Password change section */}
      <GlassCard hover={false}>
        <div className="flex items-center gap-3 mb-5">
          <Icon name="edit" size={20} className="text-ev-400" />
          <h2 className="text-lg font-semibold text-ev-800 dark:text-ev-100">
            Změna hesla
          </h2>
        </div>

        {isAdmin || isDemo ? (
          <div className="flex items-center gap-2 rounded-lg bg-st-info-muted dark:bg-st-info/10 border border-st-info/20 p-3 text-sm text-st-info max-w-md">
            <Icon name="shield" size={16} className="shrink-0" />
            {isDemo
              ? 'Heslo demo účtu nelze změnit.'
              : 'Heslo administrátora nelze změnit. Tento účet slouží jako demo přístup.'}
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 max-w-md">
              <label className="text-sm font-medium text-ev-700 dark:text-ev-300">
                Aktuální heslo *
              </label>
              <input
                {...registerPassword('currentPassword')}
                type="password"
                className={inputClass}
                placeholder="Zadejte aktuální heslo"
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-st-error">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ev-700 dark:text-ev-300">
                  Nové heslo *
                </label>
                <input
                  {...registerPassword('newPassword')}
                  type="password"
                  className={inputClass}
                  placeholder="Minimálně 8 znaků"
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-st-error">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ev-700 dark:text-ev-300">
                  Potvrzení hesla *
                </label>
                <input
                  {...registerPassword('confirmPassword')}
                  type="password"
                  className={inputClass}
                  placeholder="Zopakujte nové heslo"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-st-error">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 text-sm text-st-error max-w-md">
                <Icon name="warning" size={16} />
                {passwordError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 max-w-md">
              {passwordSuccess && (
                <span className="flex items-center gap-1.5 text-sm text-st-ok">
                  <Icon name="check-circle" size={16} />
                  Heslo změněno
                </span>
              )}
              <GradientButton type="submit" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? 'Ukládání...' : 'Změnit heslo'}
              </GradientButton>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
