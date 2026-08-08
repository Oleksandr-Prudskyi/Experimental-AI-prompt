import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import { SidebarNav } from './SidebarNav';
import { ThemeToggle } from './ThemeToggle';
import { Icon } from '@/components/shared/Icon';
import { authApi } from '@/api/auth';
import { cn } from '@/lib/cn';

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { isOpen, close } = useSidebarStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await authApi.logout();
    logout();
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden transition-opacity duration-200"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[220px] flex flex-col',
          'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
          'transition-transform duration-200 ease-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Evidence
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>

        <div className="relative p-3 border-t border-slate-200 dark:border-slate-800" ref={menuRef}>
          {menuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-1 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 rounded-lg shadow-lg py-1 animate-scale-in">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400">{user?.role?.name}</p>
              </div>
              <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-300">Tmavý režim</span>
                <ThemeToggle />
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-sm text-left text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
              >
                <Icon name="logout" size={16} />
                Odhlásit se
              </button>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.fullName?.charAt(0) || '?'}
            </div>
            <span className="flex-1 min-w-0 text-sm font-medium text-slate-700 dark:text-slate-200 truncate text-left">
              {user?.fullName}
            </span>
            <Icon name="chevron-up" size={14} className={cn('text-slate-400 transition-transform duration-150', menuOpen && 'rotate-180')} />
          </button>
        </div>
      </aside>
    </>
  );
}
