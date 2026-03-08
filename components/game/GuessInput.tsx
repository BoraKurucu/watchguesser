"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { Watch } from "@/lib/types";
import { buildSearchIndex, search, SearchResult } from "@/lib/fuzzy";
import { useSound } from "@/hooks/useSound";

interface GuessInputProps {
  watches: Watch[];
  onSubmit: (brand: string, model: string) => void;
  disabled?: boolean;
}

export default function GuessInput({ watches, onSubmit, disabled }: GuessInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { play } = useSound("/sounds/click.mp3", { volume: 0.25 });

  useMemo(() => buildSearchIndex(watches), [watches]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const results = search(query);
    setSuggestions(results);
    setShowDropdown(results.length > 0);
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current?.contains(e.target as Node) === false &&
        inputRef.current?.contains(e.target as Node) === false
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(s: SearchResult) {
    setQuery(s.display);
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        selectSuggestion(suggestions[selectedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  function handleSubmit() {
    if (!query.trim() || disabled) return;
    const parts = query.split(" – ");
    const brand = parts[0]?.trim() ?? query.trim();
    const model = parts[1]?.trim() ?? query.trim();
    play();
    onSubmit(brand, model);
    setQuery("");
    setShowDropdown(false);
  }

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B8962E]/50 pointer-events-none"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            disabled={disabled}
            placeholder="Type brand or model…"
            className="
              w-full pl-10 pr-10 py-3.5
              bg-white border border-[#E0D9CC]
              focus:border-[#B8962E]/60 focus:outline-none
              rounded-sm text-[#1A1714] placeholder-[#C8BFB5]
              font-sans text-sm tracking-wide
              transition-colors duration-200
              disabled:opacity-40 disabled:cursor-not-allowed
            "
            style={{ boxShadow: "0 1px 4px rgba(26,23,20,0.05)" }}
          />
          {query && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setQuery(""); setSuggestions([]); setShowDropdown(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C8BFB5] hover:text-[#3D3730] transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={disabled || !query.trim()}
          className="
            px-7 py-3.5 bg-[#B8962E] text-white
            font-sans font-semibold text-sm tracking-widest uppercase
            rounded-sm hover:bg-[#A07828] active:scale-95
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          Guess
        </button>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1 rounded-sm overflow-hidden z-[100] max-h-72 overflow-y-auto custom-scrollbar"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E0D9CC",
              boxShadow: "0 12px 32px rgba(26,23,20,0.15)",
            }}
          >
            {suggestions.map((s, i) => (
              <button
                key={`${s.brand}-${s.name}-${i}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(s)}
                className={`
                  w-full text-left px-4 py-2.5 transition-colors
                  border-b border-[#EDE9E0] last:border-0
                  ${i === selectedIndex
                    ? "bg-[#F5EDD0]"
                    : "hover:bg-[#FAFAF8]"
                  }
                `}
              >
                <span className="text-[#B8962E] font-semibold text-sm font-sans">{s.brand}</span>
                <span className="text-[#C8BFB5] text-sm"> – </span>
                <span className="text-[#6B6259] text-sm">{s.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
