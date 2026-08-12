import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useSidebarStore } from '@/stores/sidebar.store';
import { SidebarNav } from './SidebarNav';
import { ThemeToggle } from './ThemeToggle';
import { Icon } from '@/components/shared/Icon';
import { cn } from '@/lib/cn';

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { isOpen, close } = useSidebarStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { authApi } = await import('@/api/auth');
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
          className="fixed inset-0 z-40 bg-ev-950/40 lg:hidden transition-opacity duration-200"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[240px] flex flex-col',
          'sidebar-gradient text-ev-300',
          'transition-transform duration-200 ease-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-ev-700/50">
          <div className="w-8 h-8 rounded-lg bg-petrol-500 flex items-center justify-center">
            <Icon name="evidence" size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-ev-100 tracking-tight leading-none">
              Evidence
            </h1>
            <span className="text-[10px] text-ev-500 uppercase tracking-widest">MES System</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>

        <div className="relative p-3 border-t border-ev-700/50" ref={menuRef}>
          {menuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-1 bg-ev-850 border border-ev-600/40 rounded-lg shadow-xl py-1 animate-scale-in">
              <div className="px-3 py-2 border-b border-ev-600/40">
                <p className="text-xs text-ev-400">{user?.role?.name}</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate('/account'); }}
                className="w-full px-3 py-2 text-sm text-left text-ev-300 hover:bg-ev-700/50 flex items-center gap-2 transition-colors"
              >
                <Icon name="user" size={16} />
                Můj účet
              </button>
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-sm text-left text-st-error hover:bg-ev-700/50 flex items-center gap-2 transition-colors"
              >
                <Icon name="logout" size={16} />
                Odhlásit se
              </button>
            </div>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-ev-700/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-ev-700 flex items-center justify-center text-ev-300 text-xs font-bold shrink-0">
              {user?.fullName?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="block text-sm font-medium text-ev-200 truncate">
                {user?.fullName}
              </span>
              <span className="block text-[11px] text-ev-500 truncate">
                {user?.email}
              </span>
            </div>
            <Icon name="chevron-up" size={14} className={cn('text-ev-500 transition-transform duration-150', menuOpen && 'rotate-180')} />
          </button>
        </div>
      </aside>
    </>
  );
}
