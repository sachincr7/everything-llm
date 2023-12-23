import { useEffect, useState } from 'react';
import { System } from '../../models/system';
import validateSessionTokenForUser from '../../utils/session';
import { AUTH_TIMESTAMP, AUTH_TOKEN, AUTH_USER } from '../../utils/constants';
import { FullScreenLoader } from '../Preloader';
import { userFromStorage } from '../../utils/request';
import { Navigate } from 'react-router-dom';
import paths from '../../utils/paths';
import UserMenu from '../UserMenu';

interface PrivateRouteProps {
  component: any;
}

// Used only for Multi-user mode only as we permission specific pages based on auth role.
// When in single user mode we just bypass any authchecks.
function useIsAuthenticated() {
  const [isAuthd, setIsAuthed] = useState<boolean | null>(null);
  const [shouldRedirectToOnboarding, setShouldRedirectToOnboarding] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      const {
        MultiUserMode,
        RequiresAuth,
        OpenAiKey = false,
        AzureOpenAiKey = false,
      } = await System.keys();

      const isValid = await validateSessionTokenForUser();

      if (!isValid) {
        localStorage.removeItem(AUTH_USER);
        localStorage.removeItem(AUTH_TOKEN);
        localStorage.removeItem(AUTH_TIMESTAMP);
        setIsAuthed(false);
        return;
      }

      setIsAuthed(true);
    };
    validateSession();
  }, []);

  return { isAuthd, shouldRedirectToOnboarding };
}

const PrivateRoute = (props: any) => {
  const { isAuthd, shouldRedirectToOnboarding } = useIsAuthenticated();
  if (isAuthd === null) return <FullScreenLoader />;

  const { component } = props;
  // return <>{component}</>;
  const user = userFromStorage();
  return isAuthd && user?.role === 'admin' ? <UserMenu>{component}</UserMenu> : <Navigate to={paths.login()} />;
};

export default PrivateRoute;
