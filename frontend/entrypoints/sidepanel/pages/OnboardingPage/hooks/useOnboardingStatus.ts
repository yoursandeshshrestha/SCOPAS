import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { onboardingService } from "../../../services/onboarding.service";

export const useOnboardingStatus = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<
    boolean | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        setIsLoading(true);
        const progress = await onboardingService.getProgress();
        setIsOnboardingComplete(progress?.isCompleted ?? false);
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
        setIsOnboardingComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [location.pathname]); // Refetch when route changes

  return {
    isOnboardingComplete,
    isLoading,
  };
};
