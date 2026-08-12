import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Icon } from '@/components/shared/Icon';
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

export function EvidenceCard({ record, index: _index, onDelete, onDuplicate }: EvidenceCardProps) {
  const navigate = useNavigate();

  return (
    <GlassCard
      className="cursor-pointer"
      onClick={() => navigate(`/evidence/${record.id}/edit`)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs tabular-nums text-ev-500 dark:text-ev-400">
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
          <span className="font-semibold text-ev-700 dark:text-ev-200">
            {(record.machine as any)?.code || '—'}
          </span>
          <span className="text-ev-400">·</span>
          <span className="text-sm text-ev-500 dark:text-ev-400">
            {(record.machine as any)?.name || ''}
          </span>
        </div>

        <p className="text-sm text-ev-600 dark:text-ev-300 line-clamp-2">{record.description}</p>

        {(record as any).downtimeMin != null && (record as any).downtimeMin > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-ev-500 dark:text-ev-400">
            <Icon name="clock-pause" size={14} />
            <span className="tabular-nums">Prostoj: {((record as any).downtimeMin / 60).toFixed(1)} h</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-ev-200 dark:border-ev-700/50">
          <div className="flex items-center gap-2">
            <StatusBadge status={record.status} label={statusLabels[record.status] || record.status} />
            <span className="text-xs text-ev-400">{(record.author as any)?.fullName}</span>
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onDuplicate(record.id)}
              className="rounded-md p-1.5 hover:bg-st-ok-muted dark:hover:bg-st-ok/10 text-st-ok transition-colors duration-150"
              title="Duplikovat"
            >
              <Icon name="copy" size={16} />
            </button>
            <button
              onClick={() => onDelete(record)}
              className="rounded-md p-1.5 hover:bg-st-error-muted dark:hover:bg-st-error/10 text-st-error transition-colors duration-150"
              title="Smazat"
            >
              <Icon name="trash" size={16} />
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
