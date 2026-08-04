import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/shared/GlassCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
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
    <GlassCard hover={false} className="overflow-x-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
            <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Datum</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Stroj</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Kategorie</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 hidden md:table-cell">Popis</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Priorita</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Stav</th>
            <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400 hidden lg:table-cell">Autor</th>
            <th className="text-right py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Akce</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, i) => (
            <tr
              key={record.id}
              className="border-b border-slate-100/50 dark:border-slate-700/30 hover:bg-white/40 dark:hover:bg-slate-700/40 transition-all duration-250 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${150 + i * 50}ms` }}
              onClick={() => navigate(`/evidence/${record.id}/edit`)}
            >
              <td className="py-3 px-4 font-mono text-xs text-slate-600 dark:text-slate-300">
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
                    className="rounded-lg p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 transition-all duration-250"
                    title="Upravit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDuplicate(record.id)}
                    className="rounded-lg p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-500 transition-all duration-250"
                    title="Duplikovat"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(record)}
                    className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-all duration-250"
                    title="Smazat"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
