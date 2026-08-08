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
        'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors duration-150',
        'disabled:opacity-50 disabled:pointer-events-none',
        variant === 'primary' && 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
        variant === 'danger' && 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
        variant === 'ghost' && 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-2.5 text-base',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
