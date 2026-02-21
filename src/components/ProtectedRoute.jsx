import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth();

  // If not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in → render child routes (Outlet)
  return <Outlet />;
}