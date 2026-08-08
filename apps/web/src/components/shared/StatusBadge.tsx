import { cn } from '@/lib/cn';

const VARIANTS: Record<string, { dot: string; bg: string }> = {
  operational: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  maintenance: { dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  breakdown: { dot: 'bg-rose-500', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  decommissioned: { dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  draft: { dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  open: { dot: 'bg-sky-500', bg: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  in_progress: { dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  resolved: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  closed: { dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  low: { dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  medium: { dot: 'bg-sky-500', bg: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  high: { dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  critical: { dot: 'bg-rose-500', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
};

const DEFAULT_VARIANT = { dot: 'bg-slate-400', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' };

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const v = VARIANTS[status] || DEFAULT_VARIANT;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium', v.bg)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', v.dot)} />
      {label}
    </span>
  );
}
