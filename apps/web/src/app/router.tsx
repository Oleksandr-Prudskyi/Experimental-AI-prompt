import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/auth.store';

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/', element: <div>Dashboard (coming in Task 13)</div> },
      { path: '/evidence', element: <div>Evidence (coming in Task 12)</div> },
      { path: '/machines', element: <div>Machines (coming in Task 10)</div> },
      { path: '/admin/users', element: <UsersPage /> },
      { path: '/admin/workshops', element: <div>Workshops (coming in Task 10)</div> },
      { path: '/admin/shifts', element: <div>Shifts (coming in Task 10)</div> },
      { path: '/admin/audit', element: <div>Audit (coming in Task 14)</div> },
      { path: '/admin/trash', element: <div>Trash (coming in Task 15)</div> },
    ],
  },
]);
