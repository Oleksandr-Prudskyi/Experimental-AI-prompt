import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { UsersPage } from '@/pages/admin/UsersPage';
import { WorkshopsPage } from '@/pages/admin/WorkshopsPage';
import { ShiftsPage } from '@/pages/admin/ShiftsPage';
import { TeamsPage } from '@/pages/admin/TeamsPage';
import { MachinesPage } from '@/pages/machines/MachinesPage';
import { EvidencePage } from '@/pages/evidence/EvidencePage';
import { WorkRecordForm } from '@/pages/evidence/forms/WorkRecordForm';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { PermissionsPage } from '@/pages/admin/PermissionsPage';
import { AuditLogPage } from '@/pages/admin/AuditLogPage';
import { TrashPage } from '@/pages/admin/TrashPage';
import { AnnouncementsPage } from '@/pages/announcements/AnnouncementsPage';
import { ChatPage } from '@/pages/chat/ChatPage';
import { AccountPage } from '@/pages/account/AccountPage';
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
      { path: '/', element: <DashboardPage /> },
      { path: '/evidence', element: <EvidencePage /> },
      { path: '/evidence/new', element: <WorkRecordForm /> },
      { path: '/evidence/:id/edit', element: <WorkRecordForm /> },
      { path: '/machines', element: <MachinesPage /> },
      { path: '/admin/users', element: <UsersPage /> },
      { path: '/admin/permissions', element: <PermissionsPage /> },
      { path: '/admin/workshops', element: <WorkshopsPage /> },
      { path: '/admin/shifts', element: <ShiftsPage /> },
      { path: '/admin/teams', element: <TeamsPage /> },
      { path: '/account', element: <AccountPage /> },
      { path: '/announcements', element: <AnnouncementsPage /> },
      { path: '/chat', element: <ChatPage /> },
      { path: '/admin/audit', element: <AuditLogPage /> },
      { path: '/admin/trash', element: <TrashPage /> },
    ],
  },
]);
