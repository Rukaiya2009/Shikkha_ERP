import { useAuthStore } from '../features/auth/store/auth.slice';

export const useAuth = () => {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    login, 
    register, 
    logout, 
    clearError 
  } = useAuthStore();

  const getUserRole = (): string => {
    return user?.role?.toLowerCase() || 'student';
  };

  const getDashboardUrl = (): string => {
    const role = getUserRole();
    const dashboards: Record<string, string> = {
      super_admin: '/super-admin/dashboard',
      school_admin: '/school-admin/dashboard',
      teacher: '/teacher/dashboard',
      parent: '/parent/dashboard',
      student: '/student/dashboard',
      developer: '/developer/dashboard',  // NEW
    };
    return dashboards[role] || '/student/dashboard';
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    getUserRole,
    getDashboardUrl,
  };
};