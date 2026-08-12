import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Icon } from '@/components/shared/Icon';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '@evidence/shared';
import type { WorkRecord } from '@evidence/shared';

interface EvidenceTableProps {
  records: WorkRecord[];
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

export function EvidenceTable({ records, onDelete, onDuplicate }: EvidenceTableProps) {
  const navigate = useNavigate();

  return (
    <GlassCard hover={false} className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ev-200 dark:border-ev-600/40">
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Datum</th>
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Stroj</th>
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Kategorie</th>
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400 hidden md:table-cell">Popis</th>
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Priorita</th>
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Stav</th>
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400 hidden lg:table-cell">Prostoj</th>
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400 hidden lg:table-cell">Autor</th>
            <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Akce</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, i) => (
            <tr
              key={record.id}
              className="border-b border-ev-100 dark:border-ev-600/20 hover:bg-ev-50 dark:hover:bg-ev-700/20 transition-colors duration-150 cursor-pointer even:bg-ev-50/50 dark:even:bg-ev-700/10"
              onClick={() => navigate(`/evidence/${record.id}/edit`)}
            >
              <td className="py-3 px-4 text-xs tabular-nums text-ev-600 dark:text-ev-300">
                {new Date(record.date).toLocaleDateString('cs-CZ')}
              </td>
              <td className="py-3 px-4">
                <span className="font-medium text-ev-700 dark:text-ev-200">
                  {(record.machine as any)?.code || '—'}
                </span>
              </td>
              <td className="py-3 px-4">
                <StatusBadge
                  status={record.category}
                  label={CATEGORY_LABELS[record.category as keyof typeof CATEGORY_LABELS] || record.category}
                />
              </td>
              <td className="py-3 px-4 max-w-[200px] truncate text-ev-600 dark:text-ev-400 hidden md:table-cell">
                {record.description}
              </td>
              <td className="py-3 px-4">
                <StatusBadge
                  status={record.priority}
                  label={PRIORITY_LABELS[record.priority as keyof typeof PRIORITY_LABELS] || record.priority}
                />
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={record.status} label={statusLabels[record.status] || record.status} />
              </td>
              <td className="py-3 px-4 text-ev-600 dark:text-ev-300 tabular-nums hidden lg:table-cell">
                {(record as any).downtimeMin != null
                  ? `${((record as any).downtimeMin / 60).toFixed(1)} h`
                  : '—'}
              </td>
              <td className="py-3 px-4 text-ev-500 dark:text-ev-400 hidden lg:table-cell">
                {(record.author as any)?.fullName || '—'}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/evidence/${record.id}/edit`)}
                    className="rounded-md p-1.5 hover:bg-ev-100 dark:hover:bg-ev-800 text-ev-500 hover:text-ev-700 dark:hover:text-ev-300 transition-colors duration-150"
                    title="Upravit"
                  >
                    <Icon name="edit" size={16} />
                  </button>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}
