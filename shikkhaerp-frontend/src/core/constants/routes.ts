export const ROUTES = {
  // Public
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_STUDENTS: '/admin/students',
  ADMIN_TEACHERS: '/admin/teachers',
  ADMIN_CLASSES: '/admin/classes',
  ADMIN_ATTENDANCE: '/admin/attendance',
  ADMIN_FEES: '/admin/fees',
  ADMIN_EXAMS: '/admin/exams',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Teacher
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_CLASSES: '/teacher/classes',
  TEACHER_ATTENDANCE: '/teacher/attendance',
  TEACHER_GRADEBOOK: '/teacher/gradebook',
  TEACHER_EXAMS: '/teacher/exams',
  TEACHER_LESSONS: '/teacher/lessons',
  
  // Parent
  PARENT_DASHBOARD: '/parent/dashboard',
  PARENT_CHILDREN: '/parent/children',
  PARENT_ATTENDANCE: '/parent/attendance',
  PARENT_RESULTS: '/parent/results',
  PARENT_FEES: '/parent/fees',
  PARENT_TIMETABLE: '/parent/timetable',
  
  // Student
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_ATTENDANCE: '/student/attendance',
  STUDENT_RESULTS: '/student/results',
  STUDENT_TIMETABLE: '/student/timetable',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
