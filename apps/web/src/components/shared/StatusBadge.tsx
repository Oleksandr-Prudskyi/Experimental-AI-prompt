import { cn } from '@/lib/cn';

const VARIANTS: Record<string, { dot: string; text: string }> = {
  operational:     { dot: 'bg-st-ok',    text: 'text-st-ok' },
  maintenance:     { dot: 'bg-st-warn',  text: 'text-st-warn' },
  breakdown:       { dot: 'bg-st-error', text: 'text-st-error' },
  decommissioned:  { dot: 'bg-ev-400',   text: 'text-ev-500' },
  draft:           { dot: 'bg-ev-400',   text: 'text-ev-500' },
  open:            { dot: 'bg-st-info',  text: 'text-st-info' },
  in_progress:     { dot: 'bg-st-warn',  text: 'text-st-warn' },
  resolved:        { dot: 'bg-st-ok',    text: 'text-st-ok' },
  closed:          { dot: 'bg-ev-400',   text: 'text-ev-500' },
  low:             { dot: 'bg-ev-400',   text: 'text-ev-500' },
  medium:          { dot: 'bg-st-info',  text: 'text-st-info' },
  high:            { dot: 'bg-st-warn',  text: 'text-st-warn' },
  critical:        { dot: 'bg-st-error', text: 'text-st-error' },
};

const DEFAULT_VARIANT = { dot: 'bg-ev-400', text: 'text-ev-500' };

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const v = VARIANTS[status] || DEFAULT_VARIANT;
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
      'bg-ev-100 dark:bg-ev-700/50',
      v.text,
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', v.dot)} />
      {label}
    </span>
  );
}
