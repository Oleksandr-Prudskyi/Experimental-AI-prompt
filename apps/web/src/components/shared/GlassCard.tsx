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
        'glass-card rounded-2xl p-5',
        'shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]',
        'transition-all duration-300',
        hover && 'hover:shadow-lg hover:-translate-y-0.5 hover:bg-white/80 dark:hover:bg-slate-800/70',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
