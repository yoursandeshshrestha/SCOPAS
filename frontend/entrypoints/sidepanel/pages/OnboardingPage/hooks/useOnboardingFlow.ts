import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { onboardingService } from "../../../services/onboarding.service";
import { OnboardingQuestion } from "../../../types/onboarding.types";

interface UseOnboardingFlowProps {
  questions: OnboardingQuestion[];
  initialProgress?: {
    currentStep: number;
    answers: { [key: number]: string };
  };
}

export const useOnboardingFlow = ({
  questions,
  initialProgress,
}: UseOnboardingFlowProps) => {
  const navigate = useNavigate();
  const hasInitialized = useRef(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize state from progress only once
  useEffect(() => {
    if (!hasInitialized.current && initialProgress) {
      setCurrentStep(initialProgress.currentStep);
      setAnswers(initialProgress.answers);
      hasInitialized.current = true;
    }
  }, [initialProgress]);

  const currentQuestion = questions.find(
    (q) => q.questionNumber === currentStep
  );
  const isLastQuestion = currentStep === questions.length - 1;

  // Initialize current answer when step changes
  useEffect(() => {
    const answer = answers[currentStep] || "";
    setCurrentAnswer(answer);
  }, [currentStep, answers]);

  const handleAnswerChange = (answer: string) => {
    setCurrentAnswer(answer);
  };

  const saveAnswer = async (
    questionId: string,
    questionNumber: number,
    answer: string
  ) => {
    try {
      setError(null);

      await onboardingService.saveAnswer({
        questionId,
        questionNumber,
        answer,
      });

      return true;
    } catch (err: any) {
      console.error("Failed to save answer:", err);
      setError(err.message || "Failed to save answer");
      return false;
    }
  };

  const handleNext = async () => {
    if (!currentAnswer.trim()) {
      setError("Please provide an answer");
      return;
    }

    if (!currentQuestion) return;

    // Save current question info before moving
    const questionToSave = {
      id: currentQuestion.id,
      number: currentQuestion.questionNumber,
      answer: currentAnswer,
    };

    // Optimistically update local state
    setAnswers((prev) => ({
      ...prev,
      [questionToSave.number]: questionToSave.answer,
    }));

    // If last question, complete onboarding
    if (isLastQuestion) {
      setIsCompleting(true);

      // Save the last answer and then complete
      const success = await saveAnswer(
        questionToSave.id,
        questionToSave.number,
        questionToSave.answer
      );

      if (success) {
        await completeOnboarding();
      } else {
        setIsCompleting(false);
      }
    } else {
      // Move to next question immediately (optimistic update)
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Save answer in background
      saveAnswer(
        questionToSave.id,
        questionToSave.number,
        questionToSave.answer
      ).catch((err) => {
        console.error("Failed to save answer in background:", err);
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setError(null);
    }
  };

  const completeOnboarding = async () => {
    try {
      await onboardingService.completeOnboarding();

      // Show completion state briefly before redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (err: any) {
      console.error("Failed to complete onboarding:", err);
      setError(err.message || "Failed to complete onboarding");
      setIsCompleting(false);
    }
  };

  return {
    currentStep,
    currentQuestion,
    currentAnswer,
    answers,
    isLastQuestion,
    isCompleting,
    error,
    handleAnswerChange,
    handleNext,
    handlePrevious,
    setError,
  };
};
