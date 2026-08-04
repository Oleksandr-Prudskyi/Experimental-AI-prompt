import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '@evidence/shared';
import type { WorkRecord } from '@evidence/shared';

interface EvidenceCardProps {
  record: WorkRecord;
  index: number;
  onDelete: (record: WorkRecord) => void;
  onDuplicate: (id: string) => void;
}

const statusLabels: Record<string, string> = {
  draft: 'Koncept',
  open: 'Otevřený',
  in_progress: 'Probíhá',
  resolved: 'Vyřešený',
  closed: 'Uzavřený',
};

export function EvidenceCard({ record, index, onDelete, onDuplicate }: EvidenceCardProps) {
  const navigate = useNavigate();

  return (
    <GlassCard
      className="animate-fade-in-up cursor-pointer"
      style={{ animationDelay: `${100 + index * 60}ms` }}
      onClick={() => navigate(`/evidence/${record.id}/edit`)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {new Date(record.date).toLocaleDateString('cs-CZ')}
          </span>
          <div className="flex gap-2">
            <StatusBadge
              status={record.category}
              label={CATEGORY_LABELS[record.category as keyof typeof CATEGORY_LABELS] || record.category}
            />
            <StatusBadge status={record.priority} label={PRIORITY_LABELS[record.priority as keyof typeof PRIORITY_LABELS] || record.priority} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {(record.machine as any)?.code || '—'}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {(record.machine as any)?.name || ''}
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{record.description}</p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200/30 dark:border-slate-700/30">
          <div className="flex items-center gap-2">
            <StatusBadge status={record.status} label={statusLabels[record.status] || record.status} />
            <span className="text-xs text-slate-400">{(record.author as any)?.fullName}</span>
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onDuplicate(record.id)}
              className="rounded-lg p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-500 transition-all duration-250"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(record)}
              className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-all duration-250"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
