import { useQuery } from '@tanstack/react-query';
import { announcementsApi } from '@/api/announcements';
import { GlassCard } from '@/components/shared/GlassCard';
import { Icon } from '@/components/shared/Icon';

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-st-error',
  medium: 'bg-st-warn',
  low: 'bg-petrol-500',
};

export function AnnouncementsWidget() {
  const { data } = useQuery({
    queryKey: ['announcements-widget'],
    queryFn: () => announcementsApi.list({ limit: '5' }).then((r) => r.data),
    refetchInterval: 60_000,
  });

  const announcements = (data?.data || []).slice(0, 4);

  return (
    <GlassCard hover={false}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ev-700 dark:text-ev-200">
          Oznámení
        </h3>
        <a
          href="/announcements"
          className="text-xs text-petrol-500 hover:text-petrol-400 transition-colors"
        >
          Zobrazit vše
        </a>
      </div>

      {announcements.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-ev-400">
          <Icon name="bell" size={24} />
          <p className="text-sm">Žádná oznámení</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((a: any) => (
            <div
              key={a.id}
              className="flex gap-3 items-start p-2.5 rounded-lg hover:bg-ev-50 dark:hover:bg-ev-700/30 transition-colors"
            >
              <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${PRIORITY_COLORS[a.priority] || 'bg-ev-400'}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ev-700 dark:text-ev-200 truncate">
                  {a.title}
                </p>
                <p className="text-xs text-ev-500 dark:text-ev-400 line-clamp-2 mt-0.5">
                  {a.content}
                </p>
                <p className="text-[10px] text-ev-400 dark:text-ev-500 mt-1 tabular-nums">
                  {new Date(a.createdAt).toLocaleDateString('cs-CZ')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
