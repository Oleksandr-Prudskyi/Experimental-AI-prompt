import { useQuery } from '@tanstack/react-query';
import { statisticsApi } from '@/api/statistics';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from './components/StatsCard';
import { RecentRecords } from './components/RecentRecords';
import { QuickActions } from './components/QuickActions';

export function DashboardPage() {
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => statisticsApi.getDashboard().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const stats = data?.data || data || {};

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" subtitle="Přehled výroby" />

      {/* region: stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon="chart-bar"
          label="Záznamy dnes"
          value={stats.todayRecords ?? 0}
          gradient="from-indigo-500 to-violet-500"
          delay={100}
        />
        <StatsCard
          icon="clock-pause"
          label="Odstávka dnes (min)"
          value={stats.totalDowntimeMin ?? 0}
          gradient="from-amber-500 to-orange-500"
          delay={150}
        />
        <StatsCard
          icon="alert-triangle"
          label="Stroje v poruše"
          value={stats.machinesInBreakdown ?? 0}
          gradient="from-red-500 to-rose-500"
          delay={200}
        />
        <StatsCard
          icon="folder"
          label="Otevřené záznamy"
          value={stats.openRecords ?? 0}
          gradient="from-emerald-500 to-teal-500"
          delay={250}
        />
      </div>
      {/* endregion */}

      {/* region: bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentRecords records={stats.recentRecords || []} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
      {/* endregion */}
    </div>
  );
}
