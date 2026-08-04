import { cn } from '@/lib/cn';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function GradientButton({
  children, variant = 'primary', size = 'md', className, ...props
}: GradientButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300',
        'hover:scale-[1.02] active:scale-[0.98] active:duration-150',
        'disabled:opacity-50 disabled:pointer-events-none',
        variant === 'primary' && 'bg-gradient-to-r from-primary-500 to-violet-500 hover:from-primary-400 hover:to-violet-400 text-white shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30',
        variant === 'danger' && 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white shadow-md shadow-rose-500/25',
        variant === 'ghost' && 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-7 py-3 text-base',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
