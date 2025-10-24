import React from "react";
import { OnboardingQuestion } from "../../types/onboarding.types";
import OptionButton from "./OptionButton";
import OnboardingInput from "./OnboardingInput";

interface QuestionCardProps {
  question: OnboardingQuestion;
  selectedAnswer?: string;
  onAnswerChange: (answer: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  onAnswerChange,
}) => {
  return (
    <div className="w-full space-y-4">
      {/* Question with refined typography */}
      <div className="space-y-3">
        <h2 className="text-xl font-normal text-white leading-tight">
          {question.questionText}
        </h2>
      </div>

      {/* Answer Options with refined spacing */}
      {question.questionType === "text-input" ? (
        <OnboardingInput
          type="text"
          placeholder="Type your answer..."
          value={selectedAnswer || ""}
          onChange={onAnswerChange}
          autoFocus
          maxLength={30}
          validation={(value) => value.length >= 2}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((option, index) => (
            <OptionButton
              key={index}
              option={option}
              isSelected={selectedAnswer === option}
              onClick={() => onAnswerChange(option)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
