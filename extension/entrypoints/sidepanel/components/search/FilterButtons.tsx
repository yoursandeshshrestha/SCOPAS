import React, { useState } from "react";

interface FilterButtonsProps {
  onFilterChange: (letter: string | null) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ onFilterChange }) => {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const handleLetterClick = (letter: string) => {
    const newLetter = selectedLetter === letter ? null : letter;
    setSelectedLetter(newLetter);
    onFilterChange(newLetter);
  };

  const handleAllClick = () => {
    setSelectedLetter(null);
    onFilterChange(null);
  };

  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar items-center">
      <button
        onClick={handleAllClick}
        className={`px-4 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
          selectedLetter === null
            ? "bg-[var(--primary)] text-white border border-[var(--primary)]"
            : "bg-white/5 backdrop-blur-lg border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
        }`}
      >
        All
      </button>
      {alphabet.map((letter) => (
        <button
          key={letter}
          onClick={() => handleLetterClick(letter)}
          className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
            selectedLetter === letter
              ? "bg-[var(--primary)] text-white border border-[var(--primary)]"
              : "bg-white/5 backdrop-blur-lg border border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          {letter}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;
