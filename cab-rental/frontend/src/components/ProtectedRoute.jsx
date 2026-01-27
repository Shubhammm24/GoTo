import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/index';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, user } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
