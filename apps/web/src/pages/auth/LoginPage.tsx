import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@evidence/shared';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/auth.store';

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
        <div className="glass-card rounded-3xl p-8 shadow-xl">
          <div className="flex flex-col items-center gap-2 mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-violet-500 bg-clip-text text-transparent">
              Evidence
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Přihlášení do systému
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3 text-sm text-rose-600 dark:text-rose-400 animate-scale-in">
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
                {...register('email')}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm transition-all duration-300 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none"
                placeholder="email@evidence.local"
              />
              {errors.email && (
                <p className="text-xs text-rose-500">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Heslo
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-4 py-2.5 text-sm transition-all duration-300 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-xs text-rose-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 hover:from-primary-400 hover:to-violet-400 text-white font-medium py-2.5 shadow-md shadow-primary-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] active:duration-150 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? 'Přihlašování...' : 'Přihlásit se'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
