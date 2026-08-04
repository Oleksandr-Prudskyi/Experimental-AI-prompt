import { useAuthStore } from '@/stores/auth.store';
import { ROLE_HIERARCHY, DEFAULT_ROLE_PERMISSIONS } from '@evidence/shared';
import type { RoleSlug, Permission } from '@evidence/shared';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const hasRole = (...roles: RoleSlug[]) => {
    if (!user?.role) return false;
    return roles.includes(user.role.slug as RoleSlug);
  };

  const hasMinRole = (minRole: RoleSlug) => {
    if (!user?.role) return false;
    return (ROLE_HIERARCHY[user.role.slug as RoleSlug] || 0) >= ROLE_HIERARCHY[minRole];
  };

  const hasPermission = (permission: Permission) => {
    if (!user?.role) return false;
    const rolePerms = DEFAULT_ROLE_PERMISSIONS[user.role.slug] || [];
    if (rolePerms.includes(permission)) return true;
    const userPerms = user.permissions?.map((p) => p.permission) || [];
    return userPerms.includes(permission);
  };

  return { hasRole, hasMinRole, hasPermission, user };
}
