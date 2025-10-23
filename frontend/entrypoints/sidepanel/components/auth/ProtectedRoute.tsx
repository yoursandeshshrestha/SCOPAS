import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { useOnboardingStatus } from "../../pages/OnboardingPage/hooks/useOnboardingStatus";
import LoadingScreen from "../../pages/OnboardingPage/components/LoadingScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarding = true,
}) => {
  const { isAuthenticated, isNewUser } = useAppSelector((state) => state.auth);
  const { isOnboardingComplete, isLoading } = useOnboardingStatus();
  const location = useLocation();

  // Check authentication first
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Skip loading screen for new users - they definitely need onboarding
  if (isNewUser && location.pathname === "/onboarding") {
    return <>{children}</>;
  }

  // If we're checking onboarding status, show loading
  if (isLoading && requireOnboarding) {
    return <LoadingScreen />;
  }

  // If onboarding is required and not completed, redirect to onboarding
  // Skip this check if we're already on the onboarding page
  if (
    requireOnboarding &&
    isOnboardingComplete === false &&
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
