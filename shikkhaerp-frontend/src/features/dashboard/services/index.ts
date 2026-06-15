// Dashboard Services Index File
// Export all dashboard services for easy imports

import adminService from './admin.service';
import teacherService from './teacher.service';
import studentService from './student.service';
import parentService from './parent.service';
import superAdminService from './superAdmin.service';

// Export individual services
export {
  adminService,
  teacherService,
  studentService,
  parentService,
  superAdminService,
};

// Service registry by role
export const dashboardServices = {
  SUPER_ADMIN: superAdminService,
  SCHOOL_ADMIN: adminService,
  TEACHER: teacherService,
  STUDENT: studentService,
  PARENT: parentService,
} as const;

// Get service by role
export const getDashboardService = (role: string) => {
  const upperRole = role.toUpperCase();
  return dashboardServices[upperRole as keyof typeof dashboardServices] || studentService;
};

// Default export for convenient importing
export default {
  admin: adminService,
  teacher: teacherService,
  student: studentService,
  parent: parentService,
  superAdmin: superAdminService,
  getByRole: getDashboardService,
};