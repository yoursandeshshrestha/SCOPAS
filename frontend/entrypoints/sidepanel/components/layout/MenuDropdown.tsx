import React, { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  onSelect: () => void;
  showDividerAbove?: boolean;
  isLoading?: boolean;
}

interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  align?: "right" | "left";
}

const MenuDropdown: React.FC<MenuDropdownProps> = ({
  isOpen,
  onClose,
  items,
  align = "right",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute ${
        align === "right" ? "right-0" : "left-0"
      } top-12 w-48 bg-[var(--bg-dark)] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50`}
    >
      {items.map((item, idx) => {
        const { id, label, Icon, onSelect, showDividerAbove, isLoading } = item;
        return (
          <React.Fragment key={id}>
            {showDividerAbove && <div className="h-px bg-white/10" />}
            <button
              onClick={onSelect}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Icon size={16} />
              )}
              {label}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default MenuDropdown;
