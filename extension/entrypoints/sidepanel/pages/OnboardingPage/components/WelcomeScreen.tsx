import React from "react";
import { motion } from "framer-motion";
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
        <motion.div
          className="w-full rounded-t-[40px] relative z-10 bg-[var(--bg-dark)] min-h-[60%] h-[60%] flex flex-col"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.3,
            type: "spring",
            stiffness: 100,
            damping: 20,
          }}
        >
          <div className="flex-1 flex px-6 py-8">
            <div className="max-w-lg w-full">
              {/* Welcome message */}
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.h1
                  className="text-3xl font-normal text-white mb-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  {hasProgress ? "Welcome back 👋" : "Hey 👋"}
                </motion.h1>
                <motion.h2
                  className="text-3xl font-normal text-white mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                >
                  {hasProgress ? "Continue your journey" : "Welcome to Scopas"}
                </motion.h2>
                <motion.p
                  className="text-gray-400 text-sm font-light leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  {hasProgress ? (
                    <>
                      You've answered {questionsAnswered} of {totalQuestions}{" "}
                      questions. Let's continue where you left off!
                    </>
                  ) : (
                    "Let's get to know you so you can start saving money on your purchases"
                  )}
                </motion.p>
              </motion.div>

              {/* Start button */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 1.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="primary"
                  onClick={onStart}
                  className="w-full py-3 text-base font-medium !rounded-full"
                >
                  {hasProgress ? "Continue" : "Let's Start"}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
