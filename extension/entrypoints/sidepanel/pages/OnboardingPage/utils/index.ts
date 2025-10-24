import { OnboardingQuestion } from "../../../types/onboarding.types";

/**
 * Get question context based on category
 */
export const getQuestionContext = (category: string): string => {
  switch (category) {
    case "Getting Started":
      return "Help us understand how you discovered Scopas";
    case "Shopping Habits":
      return "Tell us about your shopping preferences";
    case "About You":
      return "A few quick details about yourself";
    case "Savings Goals":
      return "Let's set up your savings objectives";
    default:
      return "";
  }
};

/**
 * Calculate progress for each category
 */
export const getCategoryProgress = (
  category: string,
  questions: OnboardingQuestion[],
  currentStep: number
) => {
  const categoryQuestions = questions.filter((q) => q.category === category);
  const completedInCategory = categoryQuestions.filter(
    (q) => q.questionNumber < currentStep
  ).length;
  const totalInCategory = categoryQuestions.length;

  return {
    completed: completedInCategory,
    total: totalInCategory,
    percentage:
      totalInCategory > 0 ? (completedInCategory / totalInCategory) * 100 : 0,
  };
};

/**
 * Get unique categories in order
 */
export const getCategoriesInOrder = (
  questions: OnboardingQuestion[]
): string[] => {
  return Array.from(new Set(questions.map((q) => q.category)));
};

/**
 * Calculate time estimate for remaining questions
 */
export const getTimeEstimate = (
  currentStep: number,
  totalSteps: number
): number => {
  return Math.max(1, Math.ceil((totalSteps + 1 - currentStep) * 0.5));
};

/**
 * Validate answer based on question type
 */
export const validateAnswer = (
  answer: string,
  questionType: string
): boolean => {
  if (questionType === "text-input") {
    return answer.trim().length >= 2;
  }
  return answer.trim().length > 0;
};

