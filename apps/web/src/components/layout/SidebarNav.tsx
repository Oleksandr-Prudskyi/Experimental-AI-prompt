import { NavLink } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@evidence/shared';
import { cn } from '@/lib/cn';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  permission?: string;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Hlavní',
    items: [
      { label: 'Dashboard', path: '/', icon: '📊' },
      { label: 'Evidence práce', path: '/evidence', icon: '📋' },
      { label: 'Stroje', path: '/machines', icon: '⚙️' },
    ],
  },
  {
    title: 'Správa',
    items: [
      { label: 'Uživatelé', path: '/admin/users', icon: '👤', permission: PERMISSIONS.USERS_MANAGE },
      { label: 'Dílny / Týmy', path: '/admin/workshops', icon: '🏭', permission: PERMISSIONS.WORKSHOPS_MANAGE },
      { label: 'Směny', path: '/admin/shifts', icon: '🕐', permission: PERMISSIONS.SETTINGS_MANAGE },
      { label: 'Audit log', path: '/admin/audit', icon: '📜', permission: PERMISSIONS.AUDIT_VIEW },
      { label: 'Koš', path: '/admin/trash', icon: '🗑️', permission: PERMISSIONS.TRASH_RESTORE },
    ],
  },
];

export function SidebarNav() {
  const { hasPermission } = usePermissions();

  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {NAV_SECTIONS.map((section) => {
        const visibleItems = section.items.filter(
          (item) => !item.permission || hasPermission(item.permission as any),
        );
        if (visibleItems.length === 0) return null;

        return (
          <div key={section.title} className="flex flex-col gap-1">
            <span className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              {section.title}
            </span>
            {visibleItems.map((item, i) => (
              <NavLink
                key={item.path}
                to={item.path}
                style={{ animationDelay: `${i * 40}ms` }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 animate-fade-in',
                    isActive
                      ? 'bg-gradient-to-r from-primary-500/15 to-transparent text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50',
                  )
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        );
      })}
    </nav>
  );
}
