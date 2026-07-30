// src/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginContainer from './features/auth/containers/Login.container';
import RegisterContainer from './features/auth/containers/Register.container';
import SetupPassword from './features/auth/containers/SetupPassword.container';
import { RoleLayout } from './layouts/RoleLayout';
import { PlannedPage } from './pages/PlannedPage';
import PlatformDashboard from './pages/PlatformDashboard';
import AdminDashboard from './features/dashboard/AdminDashboard';
import TeacherDashboard from './features/dashboard/TeacherDashboard';
import StudentDashboard from './features/dashboard/StudentDashboard';
import ParentDashboard from './features/dashboard/ParentDashboard';
import SchoolCreationPage from './features/dashboard/SchoolCreationPage';
import WelcomeDashboard from './features/dashboard/WelcomeDashboard';
import { UserList } from './features/user/components/UserList';
import { RoleBasedRoute } from './features/auth/components/RoleBasedRoute';
import { navForRole, DELIVERED_THROUGH, AppRole } from './layouts/navConfig';

const getUserRole = (): string | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw).role : null;
  } catch {
    return null;
  }
};

const isAuthenticated = () => !!(localStorage.getItem('accessToken') && localStorage.getItem('user'));

/** Where each role lands after login. Platform roles share one console. */
export const homeFor = (role: string | null) => {
  switch (role) {
    case 'super_admin':
    case 'developer':
      return '/platform/dashboard';
    case 'school_admin':
      return '/school-admin/dashboard';
    case 'teacher':
      return '/teacher/dashboard';
    case 'parent':
      return '/parent/dashboard';
    case 'student':
      return '/student/dashboard';
    default:
      return '/login';
  }
};

/**
 * Screens that are actually implemented. Every other leaf in the nav tree
 * renders PlannedPage, so the rail is complete from day one and no link is dead.
 */
const IMPLEMENTED: Record<string, JSX.Element> = {
  '/platform/dashboard': <PlatformDashboard />,
  '/platform/users': <UserList />,
  '/school-admin/dashboard': <AdminDashboard />,
  '/school-admin/users': <UserList />,
  '/teacher/dashboard': <TeacherDashboard />,
  '/student/dashboard': <StudentDashboard />,
  '/parent/dashboard': <ParentDashboard />,
};

/** One <Route> per nav leaf, guarded to the role that owns it. */
const routesForRole = (role: AppRole) =>
  navForRole(role)
    .flatMap((g) => g.items)
    .map((leaf) => {
      const ready = IMPLEMENTED[leaf.path] && (leaf.phase ?? 99) <= DELIVERED_THROUGH;
      return (
        <Route
          key={leaf.path}
          path={leaf.path}
          element={
            <RoleBasedRoute allowedRoles={[role]}>
              {ready ? IMPLEMENTED[leaf.path] : <PlannedPage />}
            </RoleBasedRoute>
          }
        />
      );
    });

export const AppRoutes = () => {
  const role = getUserRole();

  if (!isAuthenticated()) {
    return (
      <Routes>
        <Route path="/login" element={<LoginContainer />} />
        <Route path="/register" element={<RegisterContainer />} />
        <Route path="/setup-password" element={<SetupPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginContainer />} />
      <Route path="/register" element={<RegisterContainer />} />
      <Route path="/setup-password" element={<SetupPassword />} />

      <Route element={<RoleLayout />}>
        {role && routesForRole(role as AppRole)}
        <Route path="/welcome" element={<WelcomeDashboard />} />
        <Route path="/app/approve/:uuid" element={<SchoolCreationPage />} />
      </Route>

      {/* Legacy paths kept alive so old links and sent emails don't 404. */}
      <Route path="/super-admin/dashboard" element={<Navigate to="/platform/dashboard" replace />} />
      <Route path="/superadmin/dashboard" element={<Navigate to="/platform/dashboard" replace />} />
      <Route path="/super-admin/users" element={<Navigate to="/platform/users" replace />} />
      <Route path="/developer/dashboard" element={<Navigate to="/platform/dashboard" replace />} />
      <Route path="/developer/approvals" element={<Navigate to="/platform/approvals" replace />} />
      <Route path="/developer/schools" element={<Navigate to="/platform/schools" replace />} />
      <Route path="/developer/email-logs" element={<Navigate to="/platform/email-log" replace />} />
      <Route path="/developer/settings" element={<Navigate to="/platform/settings/general" replace />} />
      <Route path="/admin/dashboard" element={<Navigate to="/school-admin/dashboard" replace />} />

      <Route path="/" element={<Navigate to={homeFor(role)} replace />} />
      <Route path="*" element={<Navigate to={homeFor(role)} replace />} />
    </Routes>
  );
};
