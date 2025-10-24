import { useState, useEffect, useRef } from "react";
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
  const hasInitialized = useRef(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleNext = async (answerOverride?: string) => {
    const answer =
      answerOverride !== undefined ? answerOverride : currentAnswer;

    if (!answer.trim()) {
      setError("Please provide an answer");
      return;
    }

    if (!currentQuestion) return;

    // Save current question info before moving
    const questionToSave = {
      id: currentQuestion.id,
      number: currentQuestion.questionNumber,
      answer: answer,
    };

    // Update local state with current answer
    setAnswers((prev) => ({
      ...prev,
      [questionToSave.number]: questionToSave.answer,
    }));

    // Update current answer state if override was provided
    if (answerOverride !== undefined) {
      setCurrentAnswer(answerOverride);
    }

    // If last question, submit all answers at once
    if (isLastQuestion) {
      setIsSubmitting(true);
      setError(null);

      try {
        // Update local state with current answer first
        const updatedAnswers = {
          ...answers,
          [questionToSave.number]: questionToSave.answer,
        };

        // Prepare all answers for submission
        const allAnswers = Object.entries(updatedAnswers).map(
          ([questionNumber, answer]) => {
            const question = questions.find(
              (q) => q.questionNumber === parseInt(questionNumber)
            );
            return {
              questionId: question!.id,
              questionNumber: parseInt(questionNumber),
              answer: answer,
            };
          }
        );

        // Submit all answers at once
        await onboardingService.saveAllAnswers({ answers: allAnswers });

        // Update local state with the final answers
        setAnswers(updatedAnswers);

        // Mark as completing to show completion screen
        setIsCompleting(true);
      } catch (err: any) {
        console.error("Failed to submit answers:", err);
        setError(err.message || "Failed to submit answers");
        setIsSubmitting(false);
      }
    } else {
      // Move to next question immediately (no API call)
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setError(null);
    }
  };

  return {
    currentStep,
    currentQuestion,
    currentAnswer,
    answers,
    isLastQuestion,
    isCompleting,
    isSubmitting,
    error,
    handleAnswerChange,
    handleNext,
    handlePrevious,
    setError,
  };
};
