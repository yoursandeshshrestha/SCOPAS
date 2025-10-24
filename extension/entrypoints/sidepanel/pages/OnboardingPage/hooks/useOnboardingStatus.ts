import { useState, useEffect } from "react";
import { useAppSelector } from "../../../store/hooks";
import { onboardingService } from "../../../services/onboarding.service";

export const useOnboardingStatus = () => {
  const { isNewUser } = useAppSelector((state) => state.auth);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<
    boolean | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Skip API call for new users - they definitely need onboarding
      if (isNewUser) {
        setIsOnboardingComplete(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const progress = await onboardingService.getProgress();
        setIsOnboardingComplete(progress?.isCompleted ?? false);
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
        // For new users (401), assume onboarding is not complete
        setIsOnboardingComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [isNewUser]); // Re-run when isNewUser changes

  return {
    isOnboardingComplete,
    isLoading,
  };
};
