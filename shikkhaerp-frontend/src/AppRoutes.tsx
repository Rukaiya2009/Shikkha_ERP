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
import StudentsListPage from './features/students/StudentsListPage';
import StudentDetailPage from './features/students/StudentDetailPage';
import StudentFormPage from './features/students/StudentFormPage';
import SchoolsListPage from './features/platform/schools/SchoolsListPage';
import SchoolDetailPage from './features/platform/schools/SchoolDetailPage';
import AddSchoolPage from './features/platform/schools/AddSchoolPage';
import DemoRequestsPage from './features/platform/schools/DemoRequestsPage';
import DeletionRequestsPage from './features/platform/schools/DeletionRequestsPage';
import { RoleBasedRoute } from './features/auth/components/RoleBasedRoute';
import { navForRole, AppRole } from './layouts/navConfig';

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
  '/platform/schools': <SchoolsListPage />,
  '/platform/schools/new': <AddSchoolPage />,
  '/platform/schools/deletions': <DeletionRequestsPage />,
  '/platform/approvals': <DemoRequestsPage />,
  '/school-admin/dashboard': <AdminDashboard />,
  '/school-admin/users': <UserList />,
  '/school-admin/students': <StudentsListPage />,
  '/teacher/dashboard': <TeacherDashboard />,
  '/student/dashboard': <StudentDashboard />,
  '/parent/dashboard': <ParentDashboard />,
};

/**
 * Screens that hang off a nav leaf instead of being one — record pages and
 * forms. They are not in the rail, so they need declaring here or they 404.
 * Static segments outrank dynamic ones in React Router, so /students/new wins
 * over /students/:id without needing a particular order.
 */
const PLATFORM_EXTRAS = [
  { path: '/platform/schools/:id', element: <SchoolDetailPage /> },
];

const EXTRA_ROUTES: Partial<Record<AppRole, { path: string; element: JSX.Element }[]>> = {
  super_admin: PLATFORM_EXTRAS,
  developer: PLATFORM_EXTRAS,
  school_admin: [
    { path: '/school-admin/students/new', element: <StudentFormPage /> },
    { path: '/school-admin/students/:id', element: <StudentDetailPage /> },
    { path: '/school-admin/students/:id/edit', element: <StudentFormPage /> },
  ],
};

/** One <Route> per nav leaf, guarded to the role that owns it. */
const routesForRole = (role: AppRole) => {
  const leaves = navForRole(role)
    .flatMap((g) => g.items)
    .map((leaf) => {
      // If a screen is implemented, render it — full stop. `phase` is planning
      // metadata for the build doc, NOT a kill switch. Gating on it hid the
      // real User Management page behind a "coming in Phase 3" placeholder.
      const ready = Boolean(IMPLEMENTED[leaf.path]);
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

  const extras = (EXTRA_ROUTES[role] ?? []).map((r) => (
    <Route
      key={r.path}
      path={r.path}
      element={<RoleBasedRoute allowedRoles={[role]}>{r.element}</RoleBasedRoute>}
    />
  ));

  return [...leaves, ...extras];
};

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
      <Route path="/admin/students" element={<Navigate to="/school-admin/students" replace />} />

      <Route path="/" element={<Navigate to={homeFor(role)} replace />} />
      <Route path="*" element={<Navigate to={homeFor(role)} replace />} />
    </Routes>
  );
};
