export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    SETUP_PASSWORD: '/auth/setup-password',
    CHANGE_PASSWORD: '/auth/change-password', // authenticated, self-service
  },
  DEMO: {
    REQUEST: '/demo/request',          // POST — submit demo request
    PENDING: '/demo',                  // GET  — /demo/{uuid} fetch pending request
    APPROVE: '/demo/approve',          // POST — /demo/approve/{uuid} { superAdminEmail, notes }
    REJECT: '/demo/reject',            // POST — /demo/reject/{uuid} { reason }
  },
  TRIAL: {
    INFO: '/user/trial',               // GET – returns trial info (unwrapped map)
  },
  // NOTE: backend dashboard controllers live under /dashboard/* (the auth,
  // user and demo controllers do NOT use /v1). These paths were previously
  // missing the /v1 segment, which silently 404'd every dashboard stat call.
  DASHBOARD: {
    SUPER_ADMIN: '/dashboard/superadmin',
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
