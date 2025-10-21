import { useState, useEffect } from "react";
import { onboardingService } from "../../../services/onboarding.service";
import {
  OnboardingQuestion,
  UserOnboardingProgress,
} from "../../../types/onboarding.types";

export const useOnboardingData = () => {
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [progress, setProgress] = useState<UserOnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOnboarding = async () => {
    try {
      setIsLoading(true);
      const data = await onboardingService.getQuestionsWithProgress();

      // Sort questions by order
      const sortedQuestions = data.questions.sort((a, b) => a.order - b.order);
      setQuestions(sortedQuestions);
      setProgress(data.progress);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load onboarding:", err);
      setError(err.message || "Failed to load onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOnboarding();
  }, []);

  return {
    questions,
    progress,
    isLoading,
    error,
    refetch: loadOnboarding,
  };
};
