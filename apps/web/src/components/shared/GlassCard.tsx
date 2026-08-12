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
        'bg-white border border-ev-200 dark:bg-ev-800 dark:border-ev-600/40 rounded-lg p-4',
        'transition-colors duration-150',
        hover && 'hover:border-ev-300 dark:hover:border-ev-500/50',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
