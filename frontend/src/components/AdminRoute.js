import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import Spinner from './Spinner';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();
  const { dbUser, userLoading } = useUser();

  if (isLoading || userLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!dbUser || dbUser.role !== 'ADMIN') return <Navigate to="/unauthorized" replace />;

  return children;
}
