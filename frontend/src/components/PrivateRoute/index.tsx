import React from "react";
import { FullScreenLoader } from "../Preloader";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  Component: React.LazyExoticComponent<() => React.JSX.Element>; // Specify the type of the Component prop
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ Component }) => {
  const { isAuthd, shouldRedirectToOnboarding } = useIsAuthenticated();
  if (isAuthd === null) return <FullScreenLoader />;

  if (shouldRedirectToOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return isAuthd ? (
    <UserMenu>
      <Component />
    </UserMenu>
  ) : (
    <Navigate to={paths.login()} />
  );
}


export default PrivateRoute;