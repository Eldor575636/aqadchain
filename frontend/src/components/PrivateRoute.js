import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import Spinner from './Spinner';

export default function PrivateRoute({ children, requireOnboarding = true }) {
  const { isAuthenticated, isLoading: auth0Loading } = useAuth0();
  const { dbUser, userLoading } = useUser();

  if (auth0Loading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarding && dbUser && !dbUser.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
