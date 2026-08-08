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
    <div className="min-h-screen bg-app-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl p-8 shadow-lg">
          <div className="flex flex-col items-center gap-2 mb-8">
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Evidence
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Přihlášení do systému
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400 animate-scale-in flex items-center gap-2">
                <Icon name="warning" size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoFocus
                autoComplete="email"
                {...register('email')}
                className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm transition-colors duration-150 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                placeholder="email@evidence.local"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Heslo
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm transition-colors duration-150 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 shadow-sm transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
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
  );
}
