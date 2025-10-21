import React from "react";

interface OptionButtonProps {
  option: string;
  isSelected: boolean;
  onClick: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  isSelected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full p-4 rounded-xl text-left transition-all duration-300
        border relative group cursor-pointer
        ${
          isSelected
            ? "border-white/60 bg-white/10 text-white"
            : "border-gray-700/30 bg-transparent text-gray-300 hover:border-gray-600 hover:bg-white/5 hover:text-white"
        }
      `}
    >
      <span className="font-normal text-sm leading-relaxed block truncate">
        {option}
      </span>
    </button>
  );
};

export default OptionButton;
