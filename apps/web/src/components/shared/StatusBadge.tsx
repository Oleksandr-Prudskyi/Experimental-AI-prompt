import { cn } from '@/lib/cn';

const VARIANTS: Record<string, string> = {
  operational: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  breakdown: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  decommissioned: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  open: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  critical: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-300', VARIANTS[status] || VARIANTS.draft)}>
      {label}
    </span>
  );
}
