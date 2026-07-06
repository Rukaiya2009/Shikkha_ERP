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
    case 'developer': return '/developer/dashboard'; // NEW
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
          <RoleBasedRoute allowedRoles={['developer']}>
            <SchoolCreationPage />
          </RoleBasedRoute>
        }
      />

      {/* Welcome route – standalone (no sidebar) */}
      <Route
        path="/welcome"
        element={
          <RoleBasedRoute allowedRoles={['super_admin', 'school_admin']}>
            <WelcomeDashboard />
          </RoleBasedRoute>
        }
      />

      {/* ✅ All dashboard routes WITH sidebar/header */}
      <Route element={<DashboardLayout />}>
        <Route path="/developer/dashboard" element={<DeveloperDashboard />} />
        <Route path="/developer/approvals" element={<DeveloperApprovalsPage />} />
        <Route path="/developer/schools" element={<DeveloperSchoolsPage />} />
        <Route path="/developer/email-logs" element={<DeveloperEmailLogsPage />} />
        <Route path="/developer/settings" element={<DeveloperSettingsPage />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/school-admin/dashboard" element={<AdminDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/parent/dashboard" element={<ParentDashboard />} />

        {/* Fallbacks */}
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="/" element={<Navigate to={getDashboardPath(userRole)} replace />} />
      <Route path="*" element={<Navigate to={getDashboardPath(userRole)} replace />} />
    </Routes>
  );
};