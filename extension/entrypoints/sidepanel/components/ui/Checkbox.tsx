import React from "react";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  className = "",
}) => {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-2 border-gray-700 bg-transparent appearance-none cursor-pointer checked:bg-blue-500 checked:border-blue-500 transition-all"
        />
        {checked && (
          <svg
            className="absolute w-3 h-3 text-white pointer-events-none"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.5 4L6 11.5L2.5 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <label
        className="text-gray-600 text-xs cursor-pointer select-none leading-relaxed"
        onClick={() => onChange(!checked)}
      >
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
