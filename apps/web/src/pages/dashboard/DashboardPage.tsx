import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '@/api/statistics';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/shared/Skeleton';
import { StatsCard } from './components/StatsCard';
import { RecentRecords } from './components/RecentRecords';
import { CategoryBreakdown } from './components/CategoryBreakdown';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => statisticsApi.getDashboard().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const stats = data?.data || data || {};

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" subtitle="Přehled výroby" />

      {isLoading ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="card" height="88px" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton variant="card" height="300px" className="lg:col-span-2" />
            <Skeleton variant="card" height="300px" />
          </div>
        </>
      ) : (
        <>
          {/* region: stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon="chart-bar" label="Záznamy dnes" value={stats.todayRecords ?? 0} color="bg-blue-600" />
            <StatsCard icon="clock-pause" label="Odstávka dnes (min)" value={stats.totalDowntimeMin ?? 0} color="bg-amber-500" />
            <StatsCard icon="alert-triangle" label="Stroje v poruše" value={stats.machinesInBreakdown ?? 0} color="bg-red-500" />
            <StatsCard icon="folder" label="Otevřené záznamy" value={stats.openRecords ?? 0} color="bg-emerald-600" />
          </div>
          {/* endregion */}

          {/* region: bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentRecords records={stats.recentRecords || []} />
            </div>
            <div>
              <CategoryBreakdown
                records={stats.recentRecords || []}
                categoryBreakdown={stats.categoryBreakdown}
              />
            </div>
          </div>
          {/* endregion */}
        </>
      )}
    </div>
  );
}
