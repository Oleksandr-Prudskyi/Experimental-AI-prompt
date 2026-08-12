import { RouterProvider } from 'react-router-dom';
import { Providers } from './providers';
import { router } from './router';
import { useAuthInit } from '@/hooks/useAuthInit';

function AppContent() {
  const isInitializing = useAuthInit();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ev-50 dark:bg-ev-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-ev-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-ev-500 dark:text-ev-400">Načítání...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}
