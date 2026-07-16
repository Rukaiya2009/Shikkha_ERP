export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    SETUP_PASSWORD: '/auth/setup-password', // NEW
  },
  DEMO: {
    REQUEST: '/demo/request',          // POST
    PENDING: '/demo/request',          // GET with UUID
    APPROVE: '/demo/approve',          // POST with UUID
    REJECT: '/demo/reject',            // POST with UUID
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
    BASE: '/users', // matches backend @RequestMapping("/users") after the /v1 fix
  },
  LOCK: {
    BASE: '/lock', // POST /lock/{id}/unlock?email=&reason= — clears an account lockout
  },
} as const;