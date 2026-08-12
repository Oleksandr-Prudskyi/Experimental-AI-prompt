import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workshopsApi } from '@/api/workshops';
import { teamsApi } from '@/api/teams';
import { usersApi } from '@/api/users';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@evidence/shared';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/shared/Skeleton';
import { Icon } from '@/components/shared/Icon';

const inputClass =
  'rounded-md border border-ev-200 dark:border-ev-600/40 bg-white dark:bg-ev-900 px-3 py-2 text-sm text-ev-800 dark:text-ev-100 transition-colors duration-150 focus:border-ev-700 dark:focus:border-ev-400 focus:ring-1 focus:ring-ev-700/10 outline-none w-full placeholder:text-ev-400';

// region -- Team form dialog --

function TeamFormDialog({
  open,
  team,
  workshops,
  onClose,
}: {
  open: boolean;
  team: any | null;
  workshops: any[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!team;

  const [name, setName] = useState('');
  const [workshopId, setWorkshopId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (open && team) {
      setName(team.name || '');
      setWorkshopId(team.workshopId || '');
    } else if (open) {
      setName('');
      setWorkshopId('');
    }
  }, [open, team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !workshopId) return;
    setSubmitting(true);
    try {
      if (isEdit) {
        await teamsApi.update(team.id, { name: name.trim(), workshopId });
      } else {
        await teamsApi.create({ name: name.trim(), workshopId });
      }
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ev-950/40 animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white dark:bg-ev-800 border border-ev-200 dark:border-ev-600/40 rounded-xl p-6 max-w-md w-full shadow-lg animate-scale-in"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-ev-800 dark:text-ev-100">
            {isEdit ? 'Upravit tym' : 'Novy tym'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-ev-100 dark:hover:bg-ev-700 transition-colors duration-150">
            <Icon name="x" size={20} className="text-ev-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Nazev tymu *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Tym A" autoFocus />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Dilna *</label>
            <select value={workshopId} onChange={(e) => setWorkshopId(e.target.value)} className={inputClass}>
              <option value="">Vyberte dilnu</option>
              {workshops.map((w: any) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-ev-100 dark:border-ev-600/40">
            <GradientButton type="button" variant="ghost" onClick={onClose}>Zrusit</GradientButton>
            <GradientButton type="submit" disabled={submitting || !name.trim() || !workshopId}>
              {submitting ? 'Ukladani...' : isEdit ? 'Ulozit' : 'Vytvorit'}
            </GradientButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// endregion

// region -- Add member dialog --

function AddMemberDialog({
  open,
  team,
  existingMemberIds,
  onClose,
}: {
  open: boolean;
  team: any | null;
  existingMemberIds: string[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
    enabled: open,
  });

  const availableUsers = useMemo(() => {
    const all = usersData?.data || [];
    return all.filter((u: any) => !existingMemberIds.includes(u.id));
  }, [usersData, existingMemberIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !team) return;
    setSubmitting(true);
    try {
      await teamsApi.addMember(team.id, selectedUserId);
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setSelectedUserId('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !team) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ev-950/40 animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white dark:bg-ev-800 border border-ev-200 dark:border-ev-600/40 rounded-xl p-6 max-w-md w-full shadow-lg animate-scale-in"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-ev-800 dark:text-ev-100">
            Pridat clena do tymu
          </h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-ev-100 dark:hover:bg-ev-700 transition-colors duration-150">
            <Icon name="x" size={20} className="text-ev-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ev-700 dark:text-ev-300">Uzivatel</label>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className={inputClass}>
              <option value="">Vyberte uzivatele</option>
              {availableUsers.map((u: any) => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
              ))}
            </select>
            {availableUsers.length === 0 && (
              <p className="text-xs text-ev-400">Zadni dostupni uzivatele</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-ev-100 dark:border-ev-600/40">
            <GradientButton type="button" variant="ghost" onClick={onClose}>Zrusit</GradientButton>
            <GradientButton type="submit" disabled={submitting || !selectedUserId}>
              {submitting ? 'Pridavam...' : 'Pridat'}
            </GradientButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// endregion

export function TeamsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PERMISSIONS.TEAMS_MANAGE);

  const [showForm, setShowForm] = useState(false);
  const [editTeam, setEditTeam] = useState<any>(null);
  const [deleteTeam, setDeleteTeam] = useState<any>(null);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [addMemberTeam, setAddMemberTeam] = useState<any>(null);
  const [removeMember, setRemoveMember] = useState<{ team: any; user: any } | null>(null);

  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsApi.list().then((r) => r.data),
  });

  const { data: workshopsData } = useQuery({
    queryKey: ['workshops'],
    queryFn: () => workshopsApi.list().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setDeleteTeam(null);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamsApi.removeMember(teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setRemoveMember(null);
    },
  });

  const teams = teamsData?.data || [];
  const workshops = workshopsData?.data || [];

  // Group teams by workshop
  const teamsByWorkshop = useMemo(() => {
    const grouped: Record<string, { workshop: any; teams: any[] }> = {};

    // Initialize with all workshops
    workshops.forEach((w: any) => {
      grouped[w.id] = { workshop: w, teams: [] };
    });

    // Assign teams to workshops
    teams.forEach((team: any) => {
      if (team.workshopId && grouped[team.workshopId]) {
        grouped[team.workshopId].teams.push(team);
      } else if (team.workshopId) {
        grouped[team.workshopId] = {
          workshop: team.workshop || { id: team.workshopId, name: 'Neznama dilna' },
          teams: [team],
        };
      }
    });

    // Filter out workshops with no teams (unless no teams at all)
    const entries = Object.values(grouped);
    const withTeams = entries.filter((e) => e.teams.length > 0);
    return withTeams.length > 0 ? withTeams : [];
  }, [teams, workshops]);

  const toggleExpand = (id: string) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getTeamMemberIds = (team: any): string[] => {
    return (team.members || []).map((m: any) => m.userId || m.user?.id || m.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tymy"
        subtitle={`${teams.length} tymu`}
        breadcrumbs={[{ label: 'Sprava' }, { label: 'Tymy' }]}
        actions={
          canManage ? (
            <GradientButton onClick={() => { setEditTeam(null); setShowForm(true); }}>
              + Novy tym
            </GradientButton>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" height="120px" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <EmptyState icon="teams" title="Zadne tymy" description="Vytvorte prvni tym" />
      ) : (
        <div className="flex flex-col gap-6">
          {teamsByWorkshop.map(({ workshop, teams: workshopTeams }) => (
            <div key={workshop.id}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ev-500 dark:text-ev-400 mb-3 flex items-center gap-2">
                <Icon name="workshops" size={16} />
                {workshop.name}
              </h2>

              <div className="flex flex-col gap-3">
                {workshopTeams.map((team: any) => {
                  const isExpanded = expandedTeams.has(team.id);
                  const members = team.members || [];

                  return (
                    <GlassCard key={team.id} hover={false}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleExpand(team.id)}
                            className="rounded-md p-1 hover:bg-ev-100 dark:hover:bg-ev-700 transition-colors duration-150"
                            title={isExpanded ? 'Sbalit' : 'Rozbalit'}
                          >
                            <Icon
                              name={isExpanded ? 'chevron-down' : 'chevron-right'}
                              size={16}
                              className="text-ev-400"
                            />
                          </button>
                          <div>
                            <h3 className="text-base font-semibold text-ev-800 dark:text-ev-100">
                              {team.name}
                            </h3>
                            <span className="text-xs text-ev-400">
                              {members.length} {members.length === 1 ? 'clen' : members.length < 5 ? 'clenove' : 'clenu'}
                            </span>
                          </div>
                        </div>

                        {canManage && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { setEditTeam(team); setShowForm(true); }}
                              className="rounded-md p-1.5 hover:bg-ev-100 dark:hover:bg-ev-800 text-ev-500 hover:text-ev-700 dark:hover:text-ev-300 transition-colors duration-150"
                              title="Upravit"
                            >
                              <Icon name="edit" size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteTeam(team)}
                              className="rounded-md p-1.5 hover:bg-st-error-muted dark:hover:bg-st-error/10 text-st-error transition-colors duration-150"
                              title="Smazat"
                            >
                              <Icon name="trash" size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="ml-7 mt-3 border-l-2 border-ev-200 dark:border-ev-600/40 pl-4 flex flex-col gap-1">
                          {members.length === 0 ? (
                            <p className="text-sm text-ev-400 py-2">Zadni clenove</p>
                          ) : (
                            members.map((member: any) => {
                              const user = member.user || member;
                              return (
                                <div key={user.id || member.userId} className="flex items-center justify-between py-1.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-ev-200 dark:bg-ev-700 flex items-center justify-center">
                                      <Icon name="users" size={14} className="text-ev-400" />
                                    </div>
                                    <div>
                                      <span className="text-sm text-ev-700 dark:text-ev-300">
                                        {user.fullName || user.email || member.userId}
                                      </span>
                                      {user.email && user.fullName && (
                                        <span className="text-xs text-ev-400 ml-2">{user.email}</span>
                                      )}
                                    </div>
                                  </div>
                                  {canManage && (
                                    <button
                                      onClick={() => setRemoveMember({ team, user })}
                                      className="rounded-md p-1 hover:bg-st-error-muted dark:hover:bg-st-error/10 text-st-error transition-colors duration-150"
                                      title="Odebrat clena"
                                    >
                                      <Icon name="x" size={14} />
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          )}

                          {canManage && (
                            <button
                              onClick={() => setAddMemberTeam(team)}
                              className="flex items-center gap-1.5 text-xs text-petrol-500 hover:text-petrol-600 dark:text-petrol-400 dark:hover:text-petrol-300 py-1.5 transition-colors duration-150"
                            >
                              <Icon name="plus" size={14} />
                              Pridat clena
                            </button>
                          )}
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <TeamFormDialog
        open={showForm}
        team={editTeam}
        workshops={workshops}
        onClose={() => { setShowForm(false); setEditTeam(null); }}
      />

      <AddMemberDialog
        open={!!addMemberTeam}
        team={addMemberTeam}
        existingMemberIds={addMemberTeam ? getTeamMemberIds(addMemberTeam) : []}
        onClose={() => setAddMemberTeam(null)}
      />

      <ConfirmDialog
        open={!!deleteTeam}
        onClose={() => setDeleteTeam(null)}
        onConfirm={() => deleteTeam && deleteMutation.mutate(deleteTeam.id)}
        title="Smazat tym?"
      >
        Tym <strong>{deleteTeam?.name}</strong> bude presunut do kose.
      </ConfirmDialog>

      <ConfirmDialog
        open={!!removeMember}
        onClose={() => setRemoveMember(null)}
        onConfirm={() => {
          if (removeMember) {
            removeMemberMutation.mutate({
              teamId: removeMember.team.id,
              userId: removeMember.user.id || removeMember.user.userId,
            });
          }
        }}
        title="Odebrat clena?"
      >
        <strong>{removeMember?.user?.fullName || removeMember?.user?.email}</strong> bude odebran z tymu{' '}
        <strong>{removeMember?.team?.name}</strong>.
      </ConfirmDialog>
    </div>
  );
}
