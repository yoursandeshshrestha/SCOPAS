import React, { useState } from "react";
import { LucideIcon, Eye, EyeOff } from "lucide-react";

interface InputProps {
  type?: string;
  placeholder?: string;
  label?: string;
  icon?: LucideIcon;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  label,
  icon: Icon,
  value,
  onChange,
  className = "",
  required = false,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className={className}>
      {label && (
        <label className="block text-gray-400 text-xs mb-1.5 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Icon size={16} />
          </div>
        )}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-gray-500 transition-colors text-sm ${
            Icon ? "pl-10" : ""
          } ${isPasswordField ? "pr-10" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default Input;
