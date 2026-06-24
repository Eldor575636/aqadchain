import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import Spinner from '../components/Spinner';

export default function AuthCallback() {
  const { isAuthenticated, isLoading } = useAuth0();
  const { dbUser, userLoading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || userLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (dbUser) {
      if (!dbUser.onboarding_completed) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, dbUser, userLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-500 text-sm">Completing sign in…</p>
      </div>
    </div>
  );
}
