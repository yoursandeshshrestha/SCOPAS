import { useState, useEffect, useRef } from "react";
import { useAppSelector } from "../../../store/hooks";
import { onboardingService } from "../../../services/onboarding.service";
import {
  OnboardingQuestion,
  UserOnboardingProgress,
} from "../../../types/onboarding.types";

export const useOnboardingData = () => {
  const { isNewUser } = useAppSelector((state) => state.auth);
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [progress, setProgress] = useState<UserOnboardingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false for new users
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

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
    // Prevent multiple calls
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const loadData = async () => {
      // For new users, just get questions without progress
      if (isNewUser) {
        try {
          const questionsData = await onboardingService.getQuestions();
          const sortedQuestions = questionsData.sort(
            (a, b) => a.order - b.order
          );
          setQuestions(sortedQuestions);
          setProgress(null); // New users have no progress
          setError(null);
        } catch (err: any) {
          console.error("Failed to load questions:", err);
          setError(err.message || "Failed to load questions");
        }
      } else {
        await loadOnboarding();
      }
    };

    loadData();
  }, []); // Empty dependency array - only run once on mount

  return {
    questions,
    progress,
    isLoading,
    error,
    refetch: loadOnboarding,
  };
};
