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
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Datum</th>
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Stroj</th>
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Kategorie</th>
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden md:table-cell">Popis</th>
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Priorita</th>
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Stav</th>
            <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden lg:table-cell">Autor</th>
            <th className="text-right py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Akce</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, i) => (
            <tr
              key={record.id}
              className="border-b border-slate-100 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150 cursor-pointer even:bg-slate-50/50 dark:even:bg-slate-800/30"
              onClick={() => navigate(`/evidence/${record.id}/edit`)}
            >
              <td className="py-3 px-4 text-xs tabular-nums text-slate-600 dark:text-slate-300">
                {new Date(record.date).toLocaleDateString('cs-CZ')}
              </td>
              <td className="py-3 px-4">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {(record.machine as any)?.code || '—'}
                </span>
              </td>
              <td className="py-3 px-4">
                <StatusBadge
                  status={record.category}
                  label={CATEGORY_LABELS[record.category as keyof typeof CATEGORY_LABELS] || record.category}
                />
              </td>
              <td className="py-3 px-4 max-w-[200px] truncate text-slate-600 dark:text-slate-400 hidden md:table-cell">
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
              <td className="py-3 px-4 text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                {(record.author as any)?.fullName || '—'}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/evidence/${record.id}/edit`)}
                    className="rounded-md p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors duration-150"
                    title="Upravit"
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    onClick={() => onDuplicate(record.id)}
                    className="rounded-md p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-500 transition-colors duration-150"
                    title="Duplikovat"
                  >
                    <Icon name="copy" size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(record)}
                    className="rounded-md p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors duration-150"
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
