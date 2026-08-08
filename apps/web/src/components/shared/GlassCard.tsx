import { cn } from '@/lib/cn';
import type { HTMLAttributes, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function GlassCard({ children, hover = true, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-white ring-1 ring-slate-200 dark:bg-slate-800/80 dark:ring-slate-700/50 rounded-lg p-4',
        'transition-colors duration-150',
        hover && 'hover:ring-slate-300 dark:hover:ring-slate-600',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
