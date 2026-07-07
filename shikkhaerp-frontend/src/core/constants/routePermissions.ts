// src/core/constants/routePermissions.ts

// Single source of truth: which roles can access which route prefix.
// Add a new route here and it's automatically protected everywhere
// RoleBasedRoute is used with this map.

export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/developer': ['developer'],
  '/super-admin': ['super_admin'],
  '/superadmin': ['super_admin'], // legacy fallback path in AppRoutes
  '/school-admin': ['school_admin'],
  '/admin': ['school_admin'], // legacy fallback path in AppRoutes
  '/teacher': ['teacher'],
  '/parent': ['parent'],
  '/student': ['student'],
  '/welcome': ['super_admin', 'school_admin'],
  '/app/approve': ['developer'],
};

// Given a path like "/developer/schools", find the matching allowed roles.
export const getAllowedRolesForPath = (path: string): string[] | null => {
  const match = Object.keys(ROUTE_PERMISSIONS).find((prefix) =>
    path.startsWith(prefix)
  );
  return match ? ROUTE_PERMISSIONS[match] : null;
};