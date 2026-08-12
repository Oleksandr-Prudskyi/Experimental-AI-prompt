import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { GlassCard } from '@/components/shared/GlassCard';
import { Icon } from '@/components/shared/Icon';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/shared/Skeleton';

interface UserProfileModalProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

export function UserProfileModal({ userId, open, onClose }: UserProfileModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.get(userId).then((r) => r.data),
    enabled: open && !!userId,
  });

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const user = data?.data;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ev-950/40 animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white dark:bg-ev-800 border border-ev-200 dark:border-ev-600/40 rounded-xl p-6 max-w-md w-full shadow-lg animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-ev-800 dark:text-ev-100">
            Profil uživatele
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-ev-100 dark:hover:bg-ev-700 transition-colors duration-150"
          >
            <Icon name="x" size={20} className="text-ev-400" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Skeleton variant="circle" width="56px" height="56px" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </div>
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" />
            ))}
          </div>
        ) : !user ? (
          <p className="text-sm text-ev-500 dark:text-ev-400">
            Uživatel nebyl nalezen.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Avatar + name header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-ev-200 dark:bg-ev-700 flex items-center justify-center text-ev-600 dark:text-ev-300 font-bold text-lg shrink-0">
                {user.fullName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold text-ev-800 dark:text-ev-100">
                  {user.fullName}
                </h3>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={user.isActive ? 'operational' : 'decommissioned'}
                    label={user.isActive ? 'Aktivní' : 'Neaktivní'}
                  />
                </div>
              </div>
            </div>

            {/* Info rows */}
            <GlassCard hover={false} className="p-0 divide-y divide-ev-100 dark:divide-ev-700/50">
              <InfoRow
                icon="users"
                label="E-mail"
                value={user.email}
              />
              <InfoRow
                icon="users"
                label="Telefon"
                value={user.phone || '—'}
              />
              <InfoRow
                icon="users"
                label="Pozice"
                value={user.position || '—'}
              />
              <InfoRow
                icon="users"
                label="Role"
                value={user.role?.name || '—'}
              />
              <InfoRow
                icon="workshops"
                label="Dílna"
                value={user.workshop?.name || '—'}
              />
              <InfoRow
                icon="shifts"
                label="Směna"
                value={user.shift?.name || '—'}
              />
              <InfoRow
                icon="calendar"
                label="Vytvořen"
                value={formatDate(user.createdAt)}
              />
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon name={icon} size={16} className="text-ev-400 shrink-0" />
      <span className="text-xs font-medium text-ev-500 dark:text-ev-400 w-20 shrink-0">
        {label}
      </span>
      <span className="text-sm text-ev-800 dark:text-ev-200 truncate">
        {value}
      </span>
    </div>
  );
}
