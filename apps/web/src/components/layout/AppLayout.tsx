import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useSidebarStore } from '@/stores/sidebar.store';
import { Icon } from '@/components/shared/Icon';

export function AppLayout() {
  const { open } = useSidebarStore();

  return (
    <div className="flex h-screen bg-app-gradient">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-ev-200 dark:border-ev-600/30 bg-white dark:bg-ev-800">
          <button onClick={open} className="p-1.5 rounded-lg hover:bg-ev-100 dark:hover:bg-ev-700 transition-colors">
            <Icon name="menu" size={20} className="text-ev-600 dark:text-ev-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-petrol-500 flex items-center justify-center">
              <Icon name="evidence" size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-ev-800 dark:text-ev-200">Evidence</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
