import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";

interface SearchInputProps {
  onSearch: (value: string) => void;
  onExpandChange?: (expanded: boolean) => void;
  placeholder?: string;
  debounceMs?: number;
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  onExpandChange,
  placeholder = "Search stores...",
  debounceMs = 500,
}) => {
  const [value, setValue] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, onSearch]);

  useEffect(() => {
    onExpandChange?.(isSearchExpanded);
  }, [isSearchExpanded, onExpandChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        if (isSearchExpanded && !value) {
          setIsSearchExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchExpanded, value]);

  const handleClear = () => {
    setValue("");
    setIsSearchExpanded(false);
  };

  const handleSearchIconClick = () => {
    setIsSearchExpanded(true);
  };

  return (
    <motion.div
      ref={searchRef}
      className="relative"
      animate={{ width: isSearchExpanded ? "100%" : "auto" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {!isSearchExpanded ? (
        <button
          onClick={handleSearchIconClick}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all text-white/60 hover:text-white"
        >
          <Search size={18} />
        </button>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 z-10 pointer-events-none">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-10 py-2.5 rounded-xl bg-white/5 backdrop-blur-lg text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:border-white/20 transition-all text-sm"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SearchInput;
