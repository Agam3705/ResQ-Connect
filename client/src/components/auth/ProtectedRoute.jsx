import { Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check them
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
