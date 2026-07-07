// src/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginContainer from './features/auth/containers/Login.container';
import RegisterContainer from './features/auth/containers/Register.container';
import { DashboardLayout } from './shared/layouts/DashboardLayout';
import StudentDashboard from './features/dashboard/StudentDashboard';
import SuperAdminDashboard from './features/dashboard/SuperAdminDashboard';
import AdminDashboard from './features/dashboard/AdminDashboard';
import TeacherDashboard from './features/dashboard/TeacherDashboard';
import ParentDashboard from './features/dashboard/ParentDashboard';
import SchoolCreationPage from './features/dashboard/SchoolCreationPage';
import WelcomeDashboard from './features/dashboard/WelcomeDashboard';
import DeveloperDashboard from './features/dashboard/DeveloperDashboard';
import DeveloperApprovalsPage from './features/dashboard/DeveloperApprovalsPage';
import DeveloperSchoolsPage from './features/dashboard/DeveloperSchoolsPage';
import DeveloperEmailLogsPage from './features/dashboard/DeveloperEmailLogsPage';
import DeveloperSettingsPage from './features/dashboard/DeveloperSettingsPage';
import { RoleBasedRoute } from './features/auth/components/RoleBasedRoute';
import { ROUTE_PERMISSIONS } from './core/constants/routePermissions';

// Get user role from localStorage
const getUserRole = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.role; // e.g. 'super_admin', 'developer' (lowercase)
    } catch (e) {
      return null;
    }
  }
  return null;
};

const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

const getDashboardPath = (role: string | null) => {
  switch (role) {
    case 'super_admin': return '/super-admin/dashboard';
    case 'school_admin': return '/school-admin/dashboard';
    case 'teacher': return '/teacher/dashboard';
    case 'parent': return '/parent/dashboard';
    case 'student': return '/student/dashboard';
    case 'developer': return '/developer/dashboard';
    default: return '/login';
  }
};

export const AppRoutes = () => {
  const userRole = getUserRole();
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginContainer />} />
        <Route path="/register" element={<RegisterContainer />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginContainer />} />
      <Route path="/register" element={<RegisterContainer />} />

      {/* Approval route – standalone (no sidebar) */}
      <Route
        path="/app/approve/:uuid"
        element={
          <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/app/approve']}>
            <SchoolCreationPage />
          </RoleBasedRoute>
        }
      />

      {/* Welcome route – standalone (no sidebar) */}
      <Route
        path="/welcome"
        element={
          <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/welcome']}>
            <WelcomeDashboard />
          </RoleBasedRoute>
        }
      />

      {/* All dashboard routes WITH sidebar/header — every one is now role-guarded */}
      <Route element={<DashboardLayout />}>
        <Route
          path="/developer/dashboard"
          element={
            <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/developer']}>
              <DeveloperDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/developer/approvals"
          element={
            <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/developer']}>
              <DeveloperApprovalsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/developer/schools"
          element={
            <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/developer']}>
              <DeveloperSchoolsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/developer/email-logs"
          element={
            <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/developer']}>
              <DeveloperEmailLogsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/developer/settings"
          element={
            <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/developer']}>
              <DeveloperSettingsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/student']}>
              <StudentDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/super-admin/dashboard"
          element={
            <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/super-admin']}>
              <SuperAdminDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/school-admin/dashboard"
          element={
            <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/school-admin']}>
              <AdminDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/teacher/dashboard"
          element={
            <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/teacher']}>
              <TeacherDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/parent/dashboard"
          element={
            <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/parent']}>
              <ParentDashboard />
            </RoleBasedRoute>
          }
        />

        {/* Fallbacks (legacy paths) */}
        <Route
          path="/superadmin/dashboard"
          element={
            <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/superadmin']}>
              <SuperAdminDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RoleBasedRoute allowedRoles={ROUTE_PERMISSIONS['/admin']}>
              <AdminDashboard />
            </RoleBasedRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to={getDashboardPath(userRole)} replace />} />
      <Route path="*" element={<Navigate to={getDashboardPath(userRole)} replace />} />
    </Routes>
  );
};
