import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@evidence/shared';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/auth.store';
import { Icon } from '@/components/shared/Icon';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setError('');
      const res = await authApi.login(data);
      const { accessToken, user } = res.data.data;
      setAuth(accessToken, user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Chyba přihlášení');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* region: left panel — branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] sidebar-gradient flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-petrol-500 flex items-center justify-center">
              <Icon name="evidence" size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-ev-100 tracking-tight">Evidence</h1>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-bold text-ev-100 leading-tight">
              Systém evidence<br />výrobní údržby
            </h2>
            <p className="text-ev-400 text-base leading-relaxed max-w-sm">
              Centrální správa výrobních záznamů, strojů, směn a týmů. Sledujte prostoje, plánujte údržbu, analyzujte výkon.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-ev-500 text-sm">
            <Icon name="machines" size={16} />
            <span>MES / CMMS</span>
          </div>
          <p className="text-xs text-ev-600">
            &copy; {new Date().getFullYear()} Evidence System
          </p>
        </div>
      </div>
      {/* endregion */}

      {/* region: right panel — form */}
      <div className="flex-1 bg-app-gradient flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* region: mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-petrol-500 flex items-center justify-center">
              <Icon name="evidence" size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-ev-800 dark:text-ev-200 tracking-tight">Evidence</h1>
          </div>
          {/* endregion */}

          <div className="bg-white dark:bg-ev-800 border border-ev-200 dark:border-ev-600/40 rounded-xl p-8 shadow-sm">
            <div className="flex flex-col gap-1 mb-8">
              <h2 className="text-xl font-bold text-ev-800 dark:text-ev-100">
                Přihlášení
              </h2>
              <p className="text-sm text-ev-500 dark:text-ev-400">
                Zadejte své přihlašovací údaje
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg bg-st-error-muted dark:bg-st-error/10 border border-st-error/20 p-3 text-sm text-st-error animate-scale-in flex items-center gap-2">
                  <Icon name="warning" size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-ev-700 dark:text-ev-300">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  autoFocus
                  autoComplete="email"
                  {...register('email')}
                  className="rounded-lg border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-900 px-3.5 py-2.5 text-sm text-ev-800 dark:text-ev-100 transition-colors duration-150 focus:border-ev-700 dark:focus:border-ev-400 focus:ring-1 focus:ring-ev-700/10 dark:focus:ring-ev-400/10 outline-none placeholder:text-ev-400"
                  placeholder="email@evidence.local"
                />
                {errors.email && (
                  <p className="text-xs text-st-error">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-ev-700 dark:text-ev-300">
                  Heslo
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password')}
                  className="rounded-lg border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-900 px-3.5 py-2.5 text-sm text-ev-800 dark:text-ev-100 transition-colors duration-150 focus:border-ev-700 dark:focus:border-ev-400 focus:ring-1 focus:ring-ev-700/10 dark:focus:ring-ev-400/10 outline-none placeholder:text-ev-400"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-xs text-st-error">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 rounded-lg bg-ev-900 hover:bg-ev-800 dark:bg-ev-100 dark:hover:bg-ev-200 text-white dark:text-ev-900 font-medium py-2.5 transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Icon name="spinner" size={16} className="animate-spin" />
                    Přihlašování...
                  </>
                ) : (
                  'Přihlásit se'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      {/* endregion */}
    </div>
  );
}
