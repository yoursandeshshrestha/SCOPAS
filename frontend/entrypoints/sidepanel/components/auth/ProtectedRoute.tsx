import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { useOnboardingStatus } from "../../pages/OnboardingPage/hooks/useOnboardingStatus";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarding = true,
}) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { isOnboardingComplete, isLoading } = useOnboardingStatus();
  const location = useLocation();

  // Check authentication first
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If we're checking onboarding status, show loading
  if (isLoading && requireOnboarding) {
    return (
      <div className="h-screen w-full bg-[var(--bg-dark)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
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
