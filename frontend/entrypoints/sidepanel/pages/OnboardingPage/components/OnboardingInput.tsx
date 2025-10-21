import React, { useState, useRef, useEffect } from "react";

interface OnboardingInputProps {
  type?: "text" | "email";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  maxLength?: number;
  validation?: (value: string) => boolean;
}

const OnboardingInput: React.FC<OnboardingInputProps> = ({
  type = "text",
  placeholder = "Type your answer...",
  value,
  onChange,
  autoFocus = false,
  maxLength = 50,
  validation,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (validation) {
      const valid = validation(value);
      setIsValid(valid);
      if (valid && value.length > 0) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    }
  }, [value, validation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className="relative">
      {/* Main input */}
      <div
        className={`
          relative w-full p-4 rounded-xl border transition-all duration-300
          bg-[var(--bg-secondary)] 
          ${
            isFocused
              ? "border-white/60"
              : "border-gray-700/50 hover:border-gray-600"
          }
        `}
      >
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder-gray-400 text-base font-normal outline-none"
          maxLength={maxLength}
        />
      </div>

      {/* Character count */}
      {value.length > 0 && (
        <div className="mt-2 text-right text-xs text-gray-500">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default OnboardingInput;
