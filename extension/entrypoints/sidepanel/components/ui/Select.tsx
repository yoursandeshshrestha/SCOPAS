import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectContentProps {
  className?: string;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export function Select({
  value,
  onValueChange,
  children,
}: SelectProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className = "",
  children,
}: SelectTriggerProps): React.ReactElement {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-[var(--bg-secondary)] text-white border border-gray-700 hover:border-gray-600 focus:outline-none focus:border-gray-500 transition-colors text-sm ${className}`}
    >
      {children}
      <ChevronDown
        size={16}
        className={`ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  );
}

export function SelectValue({
  placeholder,
}: SelectValueProps): React.ReactElement {
  const { value } = React.useContext(SelectContext);

  return (
    <span className={value ? "text-white" : "text-gray-500"}>
      {value || placeholder}
    </span>
  );
}

export function SelectContent({
  className = "",
  children,
}: SelectContentProps): React.ReactElement {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        const trigger = (event.target as HTMLElement).closest("button");
        if (!trigger) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return <></>;

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 w-full mt-1 bg-[var(--bg-secondary)] border border-gray-700 rounded-lg shadow-lg overflow-auto ${className}`}
    >
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  children,
}: SelectItemProps): React.ReactElement {
  const {
    value: selectedValue,
    onValueChange,
    setIsOpen,
  } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  const handleClick = (): void => {
    onValueChange?.(value);
    setIsOpen(false);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-colors text-sm ${
        isSelected ? "bg-white/10 text-white" : "text-gray-300"
      }`}
    >
      <span>{children}</span>
      {isSelected && <Check size={16} className="text-blue-500" />}
    </div>
  );
}
