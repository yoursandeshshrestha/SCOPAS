import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  variant = "primary",
  onClick,
  children,
  icon,
  className = "",
  disabled = false,
  isLoading = false,
}) => {
  const baseStyles =
    "w-full py-3 rounded-lg font-medium transition-colors cursor-pointer";

  const variantStyles = {
    primary: "bg-white text-black hover:bg-gray-100",
    secondary:
      "bg-[var(--bg-secondary)] text-white border border-gray-800 hover:bg-[#333333]",
  };

  const disabledStyles =
    disabled || isLoading ? "opacity-50 cursor-not-allowed" : "";

  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${className}`;

  const displayIcon = isLoading ? (
    <Loader2 size={16} className="animate-spin" />
  ) : (
    icon
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={buttonClasses}
    >
      {displayIcon ? (
        <span className="flex items-center justify-center gap-2">
          {displayIcon}
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
