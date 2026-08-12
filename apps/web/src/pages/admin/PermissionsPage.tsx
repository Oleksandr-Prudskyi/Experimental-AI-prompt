import { useState, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '@evidence/shared';
import type { Permission, UserPermission } from '@evidence/shared';
import { usePermissions } from '@/hooks/usePermissions';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { Icon } from '@/components/shared/Icon';
import { Skeleton } from '@/components/shared/Skeleton';

// -- Permission categories with Czech labels --

interface PermDef {
  key: string;
  label: string;
}

interface PermCategory {
  name: string;
  perms: PermDef[];
}

const PERM_CATEGORIES: PermCategory[] = [
  {
    name: 'Záznamy',
    perms: [
      { key: PERMISSIONS.RECORDS_CREATE, label: 'Vytvářet záznamy' },
      { key: PERMISSIONS.RECORDS_EDIT_ALL, label: 'Upravovat cizí záznamy' },
      { key: PERMISSIONS.RECORDS_DELETE, label: 'Mazat záznamy' },
    ],
  },
  {
    name: 'Správa',
    perms: [
      { key: PERMISSIONS.MACHINES_MANAGE, label: 'Spravovat stroje' },
      { key: PERMISSIONS.WORKSHOPS_MANAGE, label: 'Spravovat haly' },
      { key: PERMISSIONS.TEAMS_MANAGE, label: 'Spravovat týmy' },
      { key: PERMISSIONS.USERS_MANAGE, label: 'Spravovat uživatele' },
      { key: PERMISSIONS.USERS_GRANT_PERMISSIONS, label: 'Přidělovat oprávnění' },
    ],
  },
  {
    name: 'Komunikace',
    perms: [
      { key: PERMISSIONS.ANNOUNCEMENTS_MANAGE, label: 'Spravovat oznámení' },
      { key: PERMISSIONS.CHAT_CREATE_CHANNEL, label: 'Vytvářet kanály' },
    ],
  },
  {
    name: 'Analytika',
    perms: [
      { key: PERMISSIONS.STATISTICS_VIEW_ALL, label: 'Zobrazit statistiky' },
      { key: PERMISSIONS.REPORTS_GENERATE, label: 'Generovat reporty' },
    ],
  },
  {
    name: 'Systém',
    perms: [
      { key: PERMISSIONS.AUDIT_VIEW, label: 'Zobrazit audit log' },
      { key: PERMISSIONS.SETTINGS_MANAGE, label: 'Spravovat nastavení' },
      { key: PERMISSIONS.TRASH_RESTORE, label: 'Obnovovat z koše' },
    ],
  },
  {
    name: 'Výroba',
    perms: [
      { key: 'workers.transfer', label: 'Přesouvat pracovníky' },
    ],
  },
];

const ALL_PERMS = PERM_CATEGORIES.flatMap((c) => c.perms);

// -- Types for internal state --

interface UserWithPerms {
  id: string;
  fullName: string;
  roleSlug: string;
  roleName: string;
  dbPermissions: UserPermission[];
}

type PermState = 'none' | 'inherited' | 'override' | 'both';

function getPermState(
  permKey: string,
  roleSlug: string,
  dbPermissions: UserPermission[],
): PermState {
  const rolePerms = DEFAULT_ROLE_PERMISSIONS[roleSlug] || [];
  const fromRole = rolePerms.includes(permKey as Permission);
  const fromDb = dbPermissions.some((p) => p.permission === permKey);

  if (fromRole && fromDb) return 'both';
  if (fromRole) return 'inherited';
  if (fromDb) return 'override';
  return 'none';
}

function findDbPerm(
  dbPermissions: UserPermission[],
  permKey: string,
): UserPermission | undefined {
  return dbPermissions.find((p) => p.permission === permKey);
}

// -- Pending changes tracker --

interface PendingChange {
  type: 'grant' | 'revoke';
  userId: string;
  permKey: string;
  permissionId?: string;
}

function getPendingState(
  permKey: string,
  userId: string,
  baseState: PermState,
  pending: Map<string, PendingChange>,
): PermState {
  const key = `${userId}:${permKey}`;
  const change = pending.get(key);
  if (!change) return baseState;

  if (change.type === 'grant') {
    if (baseState === 'inherited') return 'both';
    return 'override';
  }
  // revoke
  if (baseState === 'both') return 'inherited';
  return 'none';
}

// -- Toggle component --

function PermToggle({
  state,
  onToggle,
  roleName,
  canEdit,
  hasPending,
}: {
  state: PermState;
  onToggle: () => void;
  roleName: string;
  canEdit: boolean;
  hasPending: boolean;
}) {
  const active = state !== 'none';
  const inherited = state === 'inherited' || state === 'both';

  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={onToggle}
        disabled={!canEdit || state === 'inherited'}
        title={
          !canEdit
            ? 'Nemáte oprávnění měnit'
            : inherited
              ? `Z role: ${roleName}`
              : active
                ? 'Odebrat oprávnění'
                : 'Přidat oprávnění'
        }
        className="group relative flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-150 disabled:cursor-default hover:bg-ev-100 dark:hover:bg-ev-700"
      >
        {active ? (
          <span
            className={`w-4 h-4 rounded-sm flex items-center justify-center ${
              inherited
                ? 'bg-st-ok/40'
                : hasPending
                  ? 'bg-st-ok ring-2 ring-petrol-400'
                  : 'bg-st-ok'
            }`}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white">
              <path
                d="M2 5l2.5 2.5L8 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        ) : (
          <span
            className={`w-4 h-4 rounded-sm border-2 transition-colors duration-150 ${
              hasPending
                ? 'border-st-error ring-2 ring-st-error/30'
                : 'border-ev-300 dark:border-ev-600 group-hover:border-ev-400 dark:group-hover:border-ev-500'
            }`}
          />
        )}
      </button>
    </div>
  );
}

// -- Mobile card for a single user --

function UserPermCard({
  user,
  pending,
  canEdit,
  onToggle,
}: {
  user: UserWithPerms;
  pending: Map<string, PendingChange>;
  canEdit: boolean;
  onToggle: (user: UserWithPerms, permKey: string, state: PermState) => void;
}) {
  return (
    <GlassCard hover={false} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-ev-800 dark:text-ev-200">{user.fullName}</p>
          <p className="text-xs text-ev-500 dark:text-ev-400">{user.roleName}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {PERM_CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ev-400 mb-1">
              {cat.name}
            </p>
            <div className="flex flex-col gap-0.5">
              {cat.perms.map((perm) => {
                const baseState = getPermState(perm.key, user.roleSlug, user.dbPermissions);
                const displayState = getPendingState(perm.key, user.id, baseState, pending);
                const hasPending = pending.has(`${user.id}:${perm.key}`);
                return (
                  <div
                    key={perm.key}
                    className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-ev-50 dark:hover:bg-ev-800/30"
                  >
                    <span className="text-xs text-ev-600 dark:text-ev-300">{perm.label}</span>
                    <PermToggle
                      state={displayState}
                      roleName={user.roleName}
                      canEdit={canEdit}
                      hasPending={hasPending}
                      onToggle={() => onToggle(user, perm.key, displayState)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

// -- Main page component --

export function PermissionsPage() {
  const queryClient = useQueryClient();
  const { hasRole } = usePermissions();
  const canEdit = hasRole('administrator', 'mistr');

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [pending, setPending] = useState<Map<string, PendingChange>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<'success' | 'error' | null>(null);

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
  });

  // Fetch roles
  const { data: rolesData } = useQuery({
    queryKey: ['users-roles'],
    queryFn: () => usersApi.getRoles().then((r) => r.data),
  });

  // Fetch permissions for all users
  const users = usersData?.data || [];
  const roles = rolesData?.data || [];

  const { data: allPermsData, isLoading: permsLoading } = useQuery({
    queryKey: ['all-user-permissions', users.map((u: any) => u.id).join(',')],
    queryFn: async () => {
      if (users.length === 0) return {};
      const results: Record<string, UserPermission[]> = {};
      await Promise.all(
        users.map(async (u: any) => {
          try {
            const res = await usersApi.getPermissions(u.id);
            results[u.id] = res.data.data || [];
          } catch {
            results[u.id] = [];
          }
        }),
      );
      return results;
    },
    enabled: users.length > 0,
  });

  // Build enriched user list
  const enrichedUsers: UserWithPerms[] = useMemo(() => {
    return users.map((u: any) => ({
      id: u.id,
      fullName: u.fullName,
      roleSlug: u.role?.slug || '',
      roleName: u.role?.name || '',
      dbPermissions: allPermsData?.[u.id] || [],
    }));
  }, [users, allPermsData]);

  // Filter by role
  const filteredUsers = useMemo(() => {
    if (roleFilter === 'all') return enrichedUsers;
    return enrichedUsers.filter((u) => u.roleSlug === roleFilter);
  }, [enrichedUsers, roleFilter]);

  // Unique role slugs for filter
  const availableRoles = useMemo(() => {
    const slugs = new Set(enrichedUsers.map((u) => u.roleSlug));
    return roles.filter((r: any) => slugs.has(r.slug));
  }, [enrichedUsers, roles]);

  // Toggle handler — accumulates changes locally
  const handleToggle = useCallback((user: UserWithPerms, permKey: string, currentDisplayState: PermState) => {
    if (!canEdit) return;
    if (currentDisplayState === 'inherited') return;

    const key = `${user.id}:${permKey}`;
    const baseState = getPermState(permKey, user.roleSlug, user.dbPermissions);

    setPending((prev) => {
      const next = new Map(prev);

      if (next.has(key)) {
        next.delete(key);
      } else {
        if (baseState === 'none') {
          next.set(key, { type: 'grant', userId: user.id, permKey });
        } else if (baseState === 'override' || baseState === 'both') {
          const dbPerm = findDbPerm(user.dbPermissions, permKey);
          next.set(key, { type: 'revoke', userId: user.id, permKey, permissionId: dbPerm?.id });
        }
      }

      return next;
    });

    setSaveResult(null);
  }, [canEdit]);

  // Save all pending changes
  const handleSave = async () => {
    if (pending.size === 0) return;
    setIsSaving(true);
    setSaveResult(null);

    try {
      const changes = Array.from(pending.values());
      await Promise.all(
        changes.map((change) => {
          if (change.type === 'grant') {
            return usersApi.grantPermission(change.userId, change.permKey);
          } else if (change.permissionId) {
            return usersApi.revokePermission(change.userId, change.permissionId);
          }
          return Promise.resolve();
        }),
      );

      setPending(new Map());
      setSaveResult('success');
      queryClient.invalidateQueries({ queryKey: ['all-user-permissions'] });
      setTimeout(() => setSaveResult(null), 3000);
    } catch {
      setSaveResult('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel all pending changes
  const handleCancel = () => {
    setPending(new Map());
    setSaveResult(null);
  };

  const hasPendingChanges = pending.size > 0;
  const isLoading = usersLoading || permsLoading;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Správa oprávnění"
        subtitle={`${filteredUsers.length} uživatelů`}
        breadcrumbs={[{ label: 'Správa' }, { label: 'Oprávnění' }]}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-900 px-3 py-2 text-sm text-ev-800 dark:text-ev-100 transition-colors duration-150 focus:border-ev-700 dark:focus:border-ev-400 focus:ring-1 focus:ring-ev-700/10 outline-none"
            >
              <option value="all">Všechny role</option>
              {availableRoles.map((r: any) => (
                <option key={r.slug} value={r.slug}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {!canEdit && (
        <div className="flex items-center gap-2 rounded-lg bg-st-warn-muted dark:bg-st-warn/10 border border-st-warn/20 p-3 text-sm text-st-warn">
          <Icon name="warning" size={16} className="shrink-0" />
          Oprávnění mohou měnit pouze Administrátor a Mistr.
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="bar" height="48px" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <GlassCard hover={false} className="text-center py-12">
          <Icon name="shield" size={40} className="mx-auto text-ev-300 dark:text-ev-600 mb-3" />
          <p className="text-ev-500 dark:text-ev-400 text-sm">Žádní uživatelé k zobrazení</p>
        </GlassCard>
      ) : (
        <>
          {/* Desktop table */}
          <GlassCard hover={false} className="hidden lg:block overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ev-200 dark:border-ev-600/40">
                  <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-ev-500 dark:text-ev-400 sticky left-0 bg-white dark:bg-ev-800 z-10 min-w-[180px]">
                    Uživatel
                  </th>
                  {PERM_CATEGORIES.map((cat) => (
                    <th
                      key={cat.name}
                      colSpan={cat.perms.length}
                      className="text-center py-2 px-1 font-semibold text-[10px] uppercase tracking-wider text-ev-400 border-l border-ev-200 dark:border-ev-600/40"
                    >
                      {cat.name}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-ev-200 dark:border-ev-600/40">
                  <th className="sticky left-0 bg-white dark:bg-ev-800 z-10" />
                  {ALL_PERMS.map((perm, i) => {
                    const isFirst = PERM_CATEGORIES.some((c) => c.perms[0]?.key === perm.key);
                    return (
                      <th
                        key={perm.key}
                        className={`py-2 px-1 text-center font-normal text-[10px] text-ev-400 dark:text-ev-500 max-w-[80px] ${isFirst && i > 0 ? 'border-l border-ev-200 dark:border-ev-700' : ''}`}
                        title={perm.label}
                      >
                        <span className="block truncate">{perm.label}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-ev-100 dark:border-ev-700/30 hover:bg-ev-50 dark:hover:bg-ev-800/30 transition-colors duration-150"
                  >
                    <td className="py-2 px-4 sticky left-0 bg-white dark:bg-ev-800 z-10">
                      <p className="font-medium text-ev-800 dark:text-ev-200 truncate">
                        {user.fullName}
                      </p>
                      <p className="text-[10px] text-ev-400">{user.roleName}</p>
                    </td>
                    {ALL_PERMS.map((perm, i) => {
                      const baseState = getPermState(perm.key, user.roleSlug, user.dbPermissions);
                      const displayState = getPendingState(perm.key, user.id, baseState, pending);
                      const changeKey = `${user.id}:${perm.key}`;
                      const hasPendingChange = pending.has(changeKey);
                      const isFirst = PERM_CATEGORIES.some(
                        (c) => c.perms[0]?.key === perm.key,
                      );
                      return (
                        <td
                          key={perm.key}
                          className={`py-1 px-1 ${isFirst && i > 0 ? 'border-l border-ev-200 dark:border-ev-700' : ''}`}
                        >
                          <PermToggle
                            state={displayState}
                            roleName={user.roleName}
                            canEdit={canEdit}
                            hasPending={hasPendingChange}
                            onToggle={() => handleToggle(user, perm.key, displayState)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {filteredUsers.map((user) => (
              <UserPermCard
                key={user.id}
                user={user}
                pending={pending}
                canEdit={canEdit}
                onToggle={handleToggle}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-ev-500 dark:text-ev-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-st-ok/40 flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className="text-white">
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Z role (zděděné)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-st-ok flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className="text-white">
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Přidělené ručně
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm border-2 border-ev-300 dark:border-ev-600" />
              Bez oprávnění
            </div>
            {canEdit && (
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-st-ok ring-2 ring-petrol-400 flex items-center justify-center">
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className="text-white">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                Neuložená změna
              </div>
            )}
          </div>

          {/* Save / Cancel bar */}
          {canEdit && (
            <div className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-200 ${
              hasPendingChanges
                ? 'bg-petrol-50 dark:bg-petrol-700/10 border-petrol-200 dark:border-petrol-600/30'
                : 'bg-white dark:bg-ev-800 border-ev-200 dark:border-ev-600/40'
            }`}>
              <div className="flex items-center gap-2 text-sm">
                {saveResult === 'success' ? (
                  <span className="flex items-center gap-1.5 text-st-ok">
                    <Icon name="check-circle" size={16} />
                    Oprávnění uložena
                  </span>
                ) : saveResult === 'error' ? (
                  <span className="flex items-center gap-1.5 text-st-error">
                    <Icon name="warning" size={16} />
                    Chyba při ukládání
                  </span>
                ) : hasPendingChanges ? (
                  <span className="text-petrol-600 dark:text-petrol-400">
                    {pending.size} {pending.size === 1 ? 'neuložená změna' : pending.size < 5 ? 'neuložené změny' : 'neuložených změn'}
                  </span>
                ) : (
                  <span className="text-ev-400">Žádné neuložené změny</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={!hasPendingChanges || isSaving}
                  className="rounded-lg border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-900 px-4 py-2 text-sm text-ev-700 dark:text-ev-300 hover:bg-ev-50 dark:hover:bg-ev-800 transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Zrušit
                </button>
                <GradientButton
                  onClick={handleSave}
                  disabled={!hasPendingChanges || isSaving}
                >
                  {isSaving ? (
                    <>
                      <Icon name="spinner" size={16} className="animate-spin" />
                      Ukládání...
                    </>
                  ) : (
                    'Uložit změny'
                  )}
                </GradientButton>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
