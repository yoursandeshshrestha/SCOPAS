export interface OnboardingQuestion {
  id: string;
  questionNumber: number;
  category: string;
  questionText: string;
  questionType: 'single-choice' | 'text-input';
  options: string[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingResponse {
  id: string;
  userId: string;
  questionId: string;
  questionNumber: number;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingProgress {
  id: string;
  userId: string;
  currentStep: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt: Date | null;
  lastUpdatedAt: Date;
}

export interface OnboardingQuestionResponse {
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

export interface SaveAnswerInput {
  questionId: string;
  questionNumber: number;
  answer: string;
}

export interface CompleteOnboardingInput {
  userName: string; // From step 0
}

export interface OnboardingQuestionsWithProgress {
  questions: OnboardingQuestionResponse[];
  progress: UserOnboardingProgress | null;
}


