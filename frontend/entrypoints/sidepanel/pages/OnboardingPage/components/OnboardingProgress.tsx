import React from "react";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  category?: string;
  questions?: Array<{ category: string; questionNumber: number }>;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  category,
  questions = [],
}) => {
  // Get unique categories in order
  const categories = Array.from(new Set(questions.map((q) => q.category)));

  // Calculate progress for each category
  const getCategoryProgress = (cat: string) => {
    const categoryQuestions = questions.filter((q) => q.category === cat);
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

  // Get current category progress
  const currentCategoryProgress = getCategoryProgress(category || "");

  return (
    <div className="w-full space-y-4">
      {/* Clean progress header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-normal text-white">
            Question {currentStep} of {totalSteps}
          </span>
          <p className="text-xs text-gray-400">
            {currentCategoryProgress.completed} of{" "}
            {currentCategoryProgress.total} in {category}
          </p>
        </div>

        {/* Time estimate */}
        <div className="text-xs text-gray-400">
          <span>
            ~ {Math.max(1, Math.ceil((totalSteps + 1 - currentStep) * 0.5))} min
            left
          </span>
        </div>
      </div>

      {/* Refined category progress */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 w-full">
          {categories.map((cat, index) => {
            const progress = getCategoryProgress(cat);
            const isActive = cat === category;
            const isCompleted = progress.percentage === 100;
            const isUpcoming = progress.percentage === 0 && !isActive;

            return (
              <div
                key={cat}
                className="h-1 rounded-full bg-gray-700/50 flex-1 relative overflow-hidden"
                title={`${cat}: ${progress.completed}/${progress.total} questions`}
              >
                {/* Progress fill based on category completion */}
                <div
                  className={`
                    h-full rounded-full transition-all duration-700
                    ${
                      isCompleted
                        ? "bg-gradient-to-r from-blue-500 to-blue-400"
                        : isActive
                        ? "bg-gradient-to-r from-blue-400 to-blue-300"
                        : "bg-gray-600/60"
                    }
                  `}
                  style={{
                    width: `${progress.percentage}%`,
                  }}
                />

                {/* Active category shimmer effect */}
                {isActive && !isCompleted && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-300/30 to-transparent animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OnboardingProgress;
