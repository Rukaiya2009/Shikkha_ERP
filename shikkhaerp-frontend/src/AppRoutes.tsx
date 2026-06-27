import { Routes, Route, Navigate } from 'react-router-dom';
import LoginContainer from './features/auth/containers/Login.container';
import RegisterContainer from './features/auth/containers/Register.container';
import { DashboardLayout } from './shared/layouts/DashboardLayout';
import StudentDashboard from './features/dashboard/StudentDashboard';
import SuperAdminDashboard from './features/dashboard/SuperAdminDashboard';
import AdminDashboard from './features/dashboard/AdminDashboard';
import TeacherDashboard from './features/dashboard/TeacherDashboard';
import ParentDashboard from './features/dashboard/ParentDashboard';
// NEW imports
import SchoolCreationPage from './features/dashboard/SchoolCreationPage';
import WelcomeDashboard from './features/dashboard/WelcomeDashboard';
import { RoleBasedRoute } from './features/auth/components/RoleBasedRoute';

// Get user role from localStorage
const getUserRole = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.role;
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
    case 'super_admin':
      return '/super-admin/dashboard';
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

export const AppRoutes = () => {
  const userRole = getUserRole();
  const authenticated = isAuthenticated();

  console.log('AppRoutes - userRole:', userRole, 'authenticated:', authenticated);

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

      {/* NEW: Approval route for developer (must have DEVELOPER role) */}
      <Route
        path="/app/approve/:uuid"
        element={
          <RoleBasedRoute allowedRoles={['developer']}>
            <SchoolCreationPage />
          </RoleBasedRoute>
        }
      />

      {/* NEW: Welcome dashboard for super admin (or school admin) */}
      <Route
        path="/welcome"
        element={
          <RoleBasedRoute allowedRoles={['super_admin', 'school_admin']}>
            <WelcomeDashboard />
          </RoleBasedRoute>
        }
      />

      {/* All dashboard routes wrapped in DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/school-admin/dashboard" element={<AdminDashboard />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/parent/dashboard" element={<ParentDashboard />} />

        {/* Fallback/Compatibility Routes */}
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="/" element={<Navigate to={getDashboardPath(userRole)} replace />} />
      <Route path="*" element={<Navigate to={getDashboardPath(userRole)} replace />} />
    </Routes>
  );
};