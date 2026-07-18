export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    SETUP_PASSWORD: '/auth/setup-password', // NEW
    CHANGE_PASSWORD: '/auth/change-password', // NEW — authenticated, self-service
  },
  DEMO: {
    REQUEST: '/demo/request',          // POST — submit demo request
    PENDING: '/demo',                  // GET  — /demo/{uuid} fetch pending request
    APPROVE: '/demo/approve',          // POST — /demo/approve/{uuid} { superAdminEmail, notes }
    REJECT: '/demo/reject',            // POST — /demo/reject/{uuid} { reason }
  },
  TRIAL: {
    INFO: '/user/trial',               // GET – returns trial info
  },
  DASHBOARD: {
    SUPER_ADMIN: '/dashboard/super-admin',
    SCHOOL_ADMIN: '/dashboard/admin',
    TEACHER: '/dashboard/teacher',
    STUDENT: '/dashboard/student',
    PARENT: '/dashboard/parent',
  },
  USERS: {
    BASE: '/users',
  },
  LOCK: {
    BASE: '/lock',
  },
} as const;
