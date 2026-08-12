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
  { label: 'Oznámení', path: '/announcements', icon: 'bell' },
  { label: 'Chat', path: '/chat', icon: 'chat' },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: 'Uživatelé', path: '/admin/users', icon: 'users', permission: PERMISSIONS.USERS_MANAGE },
  { label: 'Oprávnění', path: '/admin/permissions', icon: 'shield', permission: PERMISSIONS.USERS_GRANT_PERMISSIONS },
  { label: 'Haly', path: '/admin/workshops', icon: 'workshops', permission: PERMISSIONS.WORKSHOPS_MANAGE },
  { label: 'Týmy', path: '/admin/teams', icon: 'teams', permission: PERMISSIONS.TEAMS_MANAGE },
  { label: 'Směny', path: '/admin/shifts', icon: 'shifts', permission: PERMISSIONS.SETTINGS_MANAGE },
  { label: 'Audit log', path: '/admin/audit', icon: 'audit', permission: PERMISSIONS.AUDIT_VIEW },
  { label: 'Koš', path: '/admin/trash', icon: 'trash', permission: PERMISSIONS.TRASH_RESTORE },
];

const linkClass = (isActive: boolean) =>
  cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
    isActive
      ? 'bg-ev-700/60 text-ev-100 border-l-2 border-petrol-500 -ml-[2px]'
      : 'text-ev-400 hover:text-ev-200 hover:bg-ev-700/40',
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
        <span className="px-3 text-[10px] font-semibold uppercase tracking-widest text-ev-500 mb-2">
          Hlavní
        </span>
        {MAIN_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => linkClass(isActive)}>
            <Icon name={item.icon} size={18} />
            {item.label}
          </NavLink>
        ))}
      </div>

      {visibleAdminItems.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <button
            onClick={toggleAdmin}
            className="flex items-center justify-between px-3 mb-2 group"
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ev-500">
              Správa
            </span>
            <Icon
              name="chevron-down"
              size={14}
              className={cn(
                'text-ev-500 transition-transform duration-150',
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
