import { cn } from '@/lib/cn';

interface SkeletonProps {
  variant?: 'text' | 'card' | 'circle' | 'bar';
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ variant = 'text', width, height, className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-slate-200/60 dark:bg-slate-700/40 animate-shimmer',
        variant === 'text' && 'h-4 rounded-md w-full',
        variant === 'card' && 'h-32 rounded-lg w-full',
        variant === 'circle' && 'w-10 h-10 rounded-full',
        variant === 'bar' && 'h-6 rounded-md',
        className,
      )}
      style={{
        width: width || undefined,
        height: height || undefined,
        backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
      }}
    />
  );
}
