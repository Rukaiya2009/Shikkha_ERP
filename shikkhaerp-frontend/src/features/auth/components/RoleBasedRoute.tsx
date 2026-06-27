import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, getUserRole, isLoading } = useAuth();
  const userRole = getUserRole();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Case‑insensitive check
  const hasAccess = allowedRoles.some(
    (role) => role.toLowerCase() === userRole.toLowerCase()
  );

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};