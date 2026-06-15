export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',    // Remove /v1/
    LOGIN: '/auth/login',          // Remove /v1/
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  DASHBOARD: {
    SUPER_ADMIN: '/dashboard/super-admin',
    SCHOOL_ADMIN: '/dashboard/admin',
    TEACHER: '/dashboard/teacher',
    STUDENT: '/dashboard/student',
    PARENT: '/dashboard/parent',
  },
} as const;