import apiClient from "../config/api";
import type {
  OnboardingQuestion,
  UserOnboardingProgress,
  OnboardingQuestionsWithProgress,
  SaveAnswerRequest,
  OnboardingResponse,
} from "../types/onboarding.types";

export const onboardingService = {
  /**
   * Get all active onboarding questions (public endpoint)
   */
  getQuestions: async (): Promise<OnboardingQuestion[]> => {
    const response = await apiClient.get<
      OnboardingResponse<OnboardingQuestion[]>
    >("/onboarding/questions");
    return response.data.data;
  },

  /**
   * Get user's onboarding progress (authenticated)
   */
  getProgress: async (): Promise<UserOnboardingProgress | null> => {
    try {
      const response = await apiClient.get<
        OnboardingResponse<UserOnboardingProgress | null>
      >("/onboarding/progress");
      return response.data.data;
    } catch (error: any) {
      // If unauthorized, user hasn't started onboarding
      if (error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get questions with user's progress (for resuming)
   */
  getQuestionsWithProgress:
    async (): Promise<OnboardingQuestionsWithProgress> => {
      try {
        const response = await apiClient.get<
          OnboardingResponse<OnboardingQuestionsWithProgress>
        >("/onboarding/questions-with-progress");
        return response.data.data;
      } catch (error: any) {
        // If unauthorized, get questions without progress
        if (error.response?.status === 401) {
          const questions = await onboardingService.getQuestions();
          return {
            questions,
            progress: null,
          };
        }
        throw error;
      }
    },

  /**
   * Save answer for a question (authenticated)
   */
  saveAnswer: async (
    data: SaveAnswerRequest
  ): Promise<UserOnboardingProgress> => {
    try {
      const response = await apiClient.post<
        OnboardingResponse<UserOnboardingProgress>
      >("/onboarding/save-answer", data);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Please sign in to continue onboarding");
      }
      throw error;
    }
  },

  /**
   * Complete onboarding (authenticated)
   */
  completeOnboarding: async (): Promise<UserOnboardingProgress> => {
    try {
      const response = await apiClient.post<
        OnboardingResponse<UserOnboardingProgress>
      >("/onboarding/complete");
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Please sign in to complete onboarding");
      }
      throw error;
    }
  },

  /**
   * Reset onboarding (for testing)
   */
  resetOnboarding: async (): Promise<void> => {
    await apiClient.delete("/onboarding/reset");
  },
};
