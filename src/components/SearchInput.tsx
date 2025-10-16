"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export function SearchInput({ placeholder = "Search...", className = "" }: SearchInputProps) {
  const [query, setQuery] = useState("");

  return (
    <div className={`relative ${className}`}>
      {/* Search icon with adaptive color */}
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-300" />

      {/* Input with adaptive placeholder and style */}
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9 pr-8 py-2 w-full rounded-full text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-transparent border border-gray-300/40 dark:border-gray-500/40 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
      />

      {/* Clear button (X icon) with adaptive color */}
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-2 top-2.5 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
