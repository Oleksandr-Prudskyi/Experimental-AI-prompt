import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import { PageHeader } from '@/components/layout/PageHeader';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/shared/GradientButton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { UserFormDialog } from './components/UserFormDialog';

export function UsersPage() {
  const queryClient = useQueryClient();
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteUser, setDeleteUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteUser(null);
    },
  });

  const users = data?.data || [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Uživatelé"
        subtitle={`${users.length} uživatelů`}
        actions={
          <GradientButton onClick={() => { setEditUser(null); setShowForm(true); }}>
            + Nový uživatel
          </GradientButton>
        }
      />

      {users.length === 0 && !isLoading ? (
        <EmptyState icon="users" title="Žádní uživatelé" description="Vytvořte prvního uživatele" />
      ) : (
        <GlassCard hover={false} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
                <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Jméno</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">E-mail</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Dílna</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-500 dark:text-slate-400">Akce</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any, i: number) => (
                <tr
                  key={user.id}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className="border-b border-slate-100/50 dark:border-slate-700/30 animate-fade-in hover:bg-white/30 dark:hover:bg-slate-700/20 transition-all duration-300"
                >
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{user.fullName}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{user.email}</td>
                  <td className="py-3 px-4"><StatusBadge status={user.role?.slug || ''} label={user.role?.name || ''} /></td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{user.workshop?.name || '—'}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-1">
                      <GradientButton variant="ghost" size="sm" onClick={() => { setEditUser(user); setShowForm(true); }}>Upravit</GradientButton>
                      <GradientButton variant="ghost" size="sm" onClick={() => setDeleteUser(user)}>Smazat</GradientButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      <UserFormDialog
        open={showForm}
        user={editUser}
        onClose={() => setShowForm(false)}
      />

      <ConfirmDialog
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={() => deleteUser && deleteMutation.mutate(deleteUser.id)}
        title="Smazat uživatele?"
      >
        Uživatel <strong>{deleteUser?.fullName}</strong> bude přesunut do koše.
      </ConfirmDialog>
    </div>
  );
}
