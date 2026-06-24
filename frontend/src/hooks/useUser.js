import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { authAPI, setTokenGetter } from '../utils/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { isAuthenticated, user: auth0User, getAccessTokenSilently, isLoading } = useAuth0();
  const [dbUser, setDbUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Wire Auth0 token getter into the API client
  useEffect(() => {
    setTokenGetter(() =>
      getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      })
    );
  }, [getAccessTokenSilently]);

  // After Auth0 login: sync user to DB
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !auth0User) {
      setDbUser(null);
      setUserLoading(false);
      return;
    }

    (async () => {
      try {
        // Register/sync user in our DB
        await authAPI.callback({
          auth0_id: auth0User.sub,
          email: auth0User.email,
          full_name: auth0User.name || auth0User.email,
        });
        // Fetch full DB record
        const { data } = await authAPI.me();
        setDbUser(data.user);
      } catch (err) {
        console.error('[useUser] Failed to sync user:', err.message);
      } finally {
        setUserLoading(false);
      }
    })();
  }, [isAuthenticated, auth0User, isLoading]);

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.me();
      setDbUser(data.user);
    } catch {}
  };

  return (
    <UserContext.Provider value={{ dbUser, userLoading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
