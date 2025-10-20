import React from "react";

interface ProgressProps {
  value?: number;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ value = 0, className = "" }) => {
  return (
    <div
      className={`w-full bg-neutral-700 rounded-full h-2.5 overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300 ease-out"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
};

export default Progress;
