import { Link } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Icon } from '@/components/shared/Icon';
import type { ReactNode } from 'react';

interface Breadcrumb {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Breadcrumb[];
}

export function PageHeader({ title, subtitle, actions, breadcrumbs }: PageHeaderProps) {
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <div className="flex flex-col gap-1 mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-slate-400">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="lg:hidden rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
          >
            <Icon name="menu" size={22} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
