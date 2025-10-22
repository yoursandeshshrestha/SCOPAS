import React from "react";
import Button from "../../../components/ui/Button";

interface WelcomeScreenProps {
  totalQuestions: number;
  onStart: () => void;
  hasProgress?: boolean;
  currentStep?: number;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  totalQuestions,
  onStart,
  hasProgress = false,
  currentStep = 0,
}) => {
  const questionsAnswered = currentStep;
  const questionsRemaining = totalQuestions - currentStep;

  return (
    <div className="h-screen w-full relative overflow-hidden bg-[var(--bg-dark)]">
      {/* Top section with background image (upside down) */}
      <div className="h-[100%] w-full relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/main-background.png')",
            transform: "rotate(180deg)",
          }}
        />
      </div>

      {/* Welcome content section */}
      <div className="absolute inset-0 flex items-end h-full">
        <div className="w-full rounded-t-[40px] relative z-10 bg-[var(--bg-dark)] min-h-[37%] h-auto flex flex-col">
          <div className="flex-1 flex items-center px-6 py-8">
            <div className="max-w-lg w-full">
              {/* Welcome message */}
              <div className="mb-8">
                <h1 className="text-3xl font-normal text-white mb-1">
                  {hasProgress ? "Welcome back 👋" : "Hey 👋"}
                </h1>
                <h2 className="text-3xl font-normal text-white mb-4">
                  {hasProgress ? "Continue your journey" : "Welcome to Scopas"}
                </h2>
                <p className="text-gray-400 text-sm font-light leading-relaxed">
                  {hasProgress ? (
                    <>
                      You've answered {questionsAnswered} of {totalQuestions}{" "}
                      questions. Let's continue where you left off!
                    </>
                  ) : (
                    "Let's get to know you so you can start saving money on your purchases"
                  )}
                </p>
              </div>

              {/* Start button */}
              <Button
                variant="primary"
                onClick={onStart}
                className="w-full py-3 text-base font-medium !rounded-full"
              >
                {hasProgress ? "Continue" : "Let's Start"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
