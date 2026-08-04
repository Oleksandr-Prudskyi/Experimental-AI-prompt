import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { WorkshopsPage } from '@/pages/admin/WorkshopsPage';
import { ShiftsPage } from '@/pages/admin/ShiftsPage';
import { MachinesPage } from '@/pages/machines/MachinesPage';
import { EvidencePage } from '@/pages/evidence/EvidencePage';
import { WorkRecordForm } from '@/pages/evidence/forms/WorkRecordForm';
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
      { path: '/evidence', element: <EvidencePage /> },
      { path: '/evidence/new', element: <WorkRecordForm /> },
      { path: '/evidence/:id/edit', element: <WorkRecordForm /> },
      { path: '/machines', element: <MachinesPage /> },
      { path: '/admin/users', element: <UsersPage /> },
      { path: '/admin/workshops', element: <WorkshopsPage /> },
      { path: '/admin/shifts', element: <ShiftsPage /> },
      { path: '/admin/audit', element: <div>Audit (coming in Task 14)</div> },
      { path: '/admin/trash', element: <div>Trash (coming in Task 15)</div> },
    ],
  },
]);
