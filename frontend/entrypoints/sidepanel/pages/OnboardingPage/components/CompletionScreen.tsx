import React from "react";
import { useNavigate } from "react-router-dom";
import { Confetti } from "../../../components/ui/Confetti";
import Button from "../../../components/ui/Button";

const CompletionScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

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

      {/* Content section */}
      <div className="absolute inset-0 flex items-end h-full">
        <div className="w-full rounded-t-[40px] relative z-10 bg-[var(--bg-dark)] min-h-[60%] h-[60%] flex flex-col overflow-hidden">
          {/* Confetti animation */}
          <Confetti
            className="absolute inset-0 w-full h-full pointer-events-none z-50"
            options={{
              particleCount: 200,
              spread: 100,
              origin: { y: 0.6 },
              colors: ["#ffffff", "#f0f0f0", "#e0e0e0"],
            }}
          />

          <div className="flex-1 flex px-6 py-8">
            <div className="max-w-lg w-full">
              {/* Completion message */}
              <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-400 mb-1">
                  All set
                </h1>
                <h2 className="text-3xl font-semibold text-white mb-4">
                  Welcome to Scopas 🎉
                </h2>
                <p className="text-gray-400 text-sm font-light leading-relaxed">
                  Your profile is personalized and ready. Let's start saving!
                </p>
              </div>

              {/* Get Started button */}
              <div className="flex items-center justify-start ">
                <Button
                  variant="primary"
                  onClick={handleGetStarted}
                  className="max-w-full py-3 text-base font-medium !rounded-full"
                >
                  Let's Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionScreen;
