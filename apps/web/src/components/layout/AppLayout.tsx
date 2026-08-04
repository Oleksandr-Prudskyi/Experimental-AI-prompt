import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';

export function AppLayout() {
  return (
    <div className="flex h-screen bg-app-gradient">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>

      <RightPanel />
    </div>
  );
}
