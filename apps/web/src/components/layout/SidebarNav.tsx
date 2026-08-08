import { NavLink } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useSidebarStore } from '@/stores/sidebar.store';
import { PERMISSIONS } from '@evidence/shared';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/shared/Icon';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  permission?: string;
}

const MAIN_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: 'dashboard' },
  { label: 'Evidence práce', path: '/evidence', icon: 'evidence' },
  { label: 'Stroje', path: '/machines', icon: 'machines' },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: 'Uživatelé', path: '/admin/users', icon: 'users', permission: PERMISSIONS.USERS_MANAGE },
  { label: 'Dílny / Týmy', path: '/admin/workshops', icon: 'workshops', permission: PERMISSIONS.WORKSHOPS_MANAGE },
  { label: 'Směny', path: '/admin/shifts', icon: 'shifts', permission: PERMISSIONS.SETTINGS_MANAGE },
  { label: 'Audit log', path: '/admin/audit', icon: 'audit', permission: PERMISSIONS.AUDIT_VIEW },
  { label: 'Koš', path: '/admin/trash', icon: 'trash', permission: PERMISSIONS.TRASH_RESTORE },
];

const linkClass = (isActive: boolean) =>
  cn(
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
    isActive
      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
  );

export function SidebarNav() {
  const { hasPermission } = usePermissions();
  const { adminCollapsed, toggleAdmin } = useSidebarStore();

  const visibleAdminItems = ADMIN_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission as any),
  );

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      <div className="flex flex-col gap-0.5">
        <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
          Hlavní
        </span>
        {MAIN_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => linkClass(isActive)}>
            <Icon name={item.icon} size={18} />
            {item.label}
          </NavLink>
        ))}
      </div>

      {visibleAdminItems.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <button
            onClick={toggleAdmin}
            className="flex items-center justify-between px-3 mb-1 group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Správa
            </span>
            <Icon
              name="chevron-down"
              size={14}
              className={cn(
                'text-slate-400 transition-transform duration-150',
                adminCollapsed && '-rotate-90',
              )}
            />
          </button>
          {!adminCollapsed && visibleAdminItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => linkClass(isActive)}>
              <Icon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
