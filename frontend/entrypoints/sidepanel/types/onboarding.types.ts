export interface OnboardingQuestion {
  id: string;
  questionNumber: number;
  category: string;
  questionText: string;
  questionType: 'single-choice' | 'text-input';
  options: string[];
  order: number;
}

export interface UserOnboardingProgress {
  currentStep: number;
  isCompleted: boolean;
  totalQuestions: number;
  answers: {
    [key: number]: string; // questionNumber -> answer
  };
}

export interface OnboardingQuestionsWithProgress {
  questions: OnboardingQuestion[];
  progress: UserOnboardingProgress | null;
}

export interface SaveAnswerRequest {
  questionId: string;
  questionNumber: number;
  answer: string;
}

export interface OnboardingResponse<T> {
  status: string;
  data: T;
  message?: string;
}

