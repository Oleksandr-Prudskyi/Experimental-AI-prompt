import { Link } from 'react-router-dom';
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
  return (
    <div className="flex flex-col gap-1 mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-ev-400">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-ev-600 dark:hover:text-ev-300 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-ev-500">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ev-800 dark:text-ev-100">{title}</h1>
          {subtitle && <p className="text-sm text-ev-500 dark:text-ev-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
