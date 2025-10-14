"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react"; // Or any other icons

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null; // Or a loading skeleton
  }
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
      aria-label="Toggle theme"
    >
      {theme === "dark" ?  <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-600" />}
    </button>
  );
}