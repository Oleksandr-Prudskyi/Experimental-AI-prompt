import { useAuthStore } from '@/stores/auth.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import { SidebarNav } from './SidebarNav';
import { ThemeToggle } from './ThemeToggle';
import { authApi } from '@/api/auth';
import { cn } from '@/lib/cn';

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { isOpen, close } = useSidebarStore();

  const handleLogout = async () => {
    await authApi.logout();
    logout();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[220px] flex flex-col',
          'bg-white/50 dark:bg-slate-900/70 backdrop-blur-2xl',
          'border-r border-white/15 dark:border-slate-700/30',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-violet-500 bg-clip-text text-transparent">
            Evidence
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>

        <div className="flex flex-col gap-2 p-3 border-t border-white/10 dark:border-slate-700/30">
          <div className="flex items-center gap-2 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.fullName?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                {user?.fullName}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.role?.name}</p>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl px-3 py-2 text-sm text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all duration-300"
          >
            Odhlásit se
          </button>
        </div>
      </aside>
    </>
  );
}
