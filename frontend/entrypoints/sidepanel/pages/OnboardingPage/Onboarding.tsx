import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { onboardingService } from "../../services/onboarding.service";
import type {
  OnboardingQuestion,
  UserOnboardingProgress,
} from "../../types/onboarding.types";
import OnboardingProgress from "./components/OnboardingProgress";
import QuestionCard from "./components/QuestionCard";
import Button from "../../components/ui/Button";
import WelcomeScreen from "./components/WelcomeScreen";
import CompletionScreen from "./components/CompletionScreen";
import ErrorScreen from "./components/ErrorScreen";
import LoadingScreen from "./components/LoadingScreen";
import { useOnboardingData } from "./hooks/useOnboardingData";
import { useOnboardingFlow } from "./hooks/useOnboardingFlow";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);

  // Load onboarding data
  const {
    questions,
    progress,
    isLoading,
    error: dataError,
    refetch,
  } = useOnboardingData();

  // Initialize onboarding flow
  const initialProgressData = progress
    ? {
        currentStep: progress.currentStep,
        answers: progress.answers,
      }
    : undefined;

  const {
    currentStep,
    currentQuestion,
    currentAnswer,
    isLastQuestion,
    isCompleting,
    error: flowError,
    handleAnswerChange,
    handleNext,
    handlePrevious,
    setError,
  } = useOnboardingFlow({
    questions,
    initialProgress: initialProgressData,
  });

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showWelcome && e.key === "Enter") {
        handleStartOnboarding();
      } else if (
        !showWelcome &&
        e.key === "Enter" &&
        currentAnswer.trim() &&
        !isCompleting
      ) {
        handleNext();
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [showWelcome, currentAnswer, isCompleting]);

  // Handle start onboarding
  const handleStartOnboarding = () => {
    setShowWelcome(false);
  };

  // If already completed, redirect to dashboard
  useEffect(() => {
    if (progress?.isCompleted) {
      navigate("/dashboard");
    }
  }, [progress, navigate]);

  // Show loading screen while fetching progress
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show welcome screen
  if (showWelcome) {
    return (
      <WelcomeScreen
        totalQuestions={questions.length}
        onStart={handleStartOnboarding}
        hasProgress={!!progress}
        currentStep={progress?.currentStep || 0}
      />
    );
  }

  // Show completion screen
  if (isCompleting) {
    return <CompletionScreen />;
  }

  // Show error screen
  if (dataError || !currentQuestion) {
    return (
      <ErrorScreen
        error={dataError || "Unable to load questions"}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-[var(--bg-dark)]">
      {/* Top section with background image (upside down) */}
      <div className="h-[80%] w-full relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/main-background.png')",
            transform: "rotate(180deg)",
          }}
        />
      </div>

      {/* Onboarding content section */}
      <div className="absolute inset-0 flex items-end h-full">
        <div className="w-full rounded-t-[40px] relative z-10 bg-[var(--bg-dark)] h-auto flex flex-col">
          {/* Header with progress */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-800/50">
            <OnboardingProgress
              currentStep={currentStep + 1}
              totalSteps={questions.length}
              category={currentQuestion.category}
              questions={questions}
            />
          </div>

          {/* Question content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="max-w-lg">
              {/* Error message */}
              {flowError && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm font-medium">
                    {flowError}
                  </p>
                </div>
              )}

              {/* Question */}
              <QuestionCard
                question={currentQuestion}
                selectedAnswer={currentAnswer}
                onAnswerChange={handleAnswerChange}
              />
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="px-6 pb-6 pt-4 bg-[var(--bg-dark)] border-t border-gray-800/50">
            <div className="max-w-md mx-auto flex gap-3">
              {/* Previous button */}
              {currentStep > 0 && (
                <Button
                  variant="secondary"
                  onClick={handlePrevious}
                  disabled={isCompleting}
                  className="max-w-[120px] py-3 text-base font-medium !rounded-full"
                >
                  Previous
                </Button>
              )}

              {/* Next/Complete button */}
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!currentAnswer.trim() || isCompleting}
                isLoading={isCompleting}
                className="w-full py-3 text-base font-medium !rounded-full"
              >
                {isCompleting
                  ? "Completing..."
                  : isLastQuestion
                  ? "Complete"
                  : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
