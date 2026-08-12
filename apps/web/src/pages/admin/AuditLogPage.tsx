import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogApi } from '@/api/audit-log';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';

const actionLabels: Record<string, string> = { create: 'Vytvořeno', update: 'Upraveno', delete: 'Smazáno' };

const inputClass =
  'rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-900 px-3 py-2 text-sm text-ev-700 dark:text-ev-200 focus:outline-none focus:border-ev-700 dark:focus:border-ev-400 focus:ring-1 focus:ring-ev-700/10 transition-colors duration-150';

export function AuditLogPage() {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v !== ''),
  );

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', activeFilters],
    queryFn: () => auditLogApi.list(activeFilters).then((r) => r.data),
  });

  const logs = data?.data || [];

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit log"
        subtitle="Historie změn"
        breadcrumbs={[{ label: 'Správa' }, { label: 'Audit log' }]}
      />

      {/* region: filters */}
      <GlassCard hover={false}>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ev-500 dark:text-ev-400">Akce</label>
            <select value={filters.action || ''} onChange={(e) => handleChange('action', e.target.value)} className={inputClass}>
              <option value="">Vše</option>
              <option value="create">Vytvořeno</option>
              <option value="update">Upraveno</option>
              <option value="delete">Smazáno</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ev-500 dark:text-ev-400">Typ entity</label>
            <select value={filters.entity_type || ''} onChange={(e) => handleChange('entity_type', e.target.value)} className={inputClass}>
              <option value="">Vše</option>
              <option value="users">Uživatelé</option>
              <option value="workshops">Dílny</option>
              <option value="machines">Stroje</option>
              <option value="work-records">Záznamy</option>
              <option value="shifts">Směny</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ev-500 dark:text-ev-400">Od</label>
            <input type="date" value={filters.date_from || ''} onChange={(e) => handleChange('date_from', e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ev-500 dark:text-ev-400">Do</label>
            <input type="date" value={filters.date_to || ''} onChange={(e) => handleChange('date_to', e.target.value)} className={inputClass} />
          </div>
          {hasActiveFilters && (
            <GradientButton
              variant="ghost"
              size="sm"
              onClick={() => setFilters({})}
            >
              Vyčistit filtry
            </GradientButton>
          )}
        </div>
      </GlassCard>
      {/* endregion */}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="bar" height="48px" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState icon="audit" title="Žádné záznamy" description="Zatím nejsou žádné záznamy v audit logu" />
      ) : (
        <GlassCard hover={false} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ev-200 dark:border-ev-600/40">
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Čas</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Uživatel</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Akce</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400">Typ entity</th>
                <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400 hidden md:table-cell">ID entity</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr
                  key={log.id}
                  className="border-b border-ev-100 dark:border-ev-700/30 hover:bg-ev-50 dark:hover:bg-ev-800/30 transition-colors duration-150"
                >
                  <td className="py-3 px-4 text-xs tabular-nums text-ev-500 dark:text-ev-400">
                    {new Date(log.createdAt).toLocaleString('cs-CZ')}
                  </td>
                  <td className="py-3 px-4 text-ev-700 dark:text-ev-200">
                    {log.user?.fullName || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={log.action} label={actionLabels[log.action] || log.action} />
                  </td>
                  <td className="py-3 px-4 text-ev-600 dark:text-ev-300">{log.entityType}</td>
                  <td className="py-3 px-4 text-xs tabular-nums text-ev-400 hidden md:table-cell truncate max-w-[150px]">
                    {log.entityId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
}
