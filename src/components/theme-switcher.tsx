"use client";
import { useTheme } from "next-themes";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed bottom-4 right-4 z-20 p-2 rounded bg-gray-800 text-white dark:bg-gray-200 dark:text-black transition"
    >
      Toggle Theme
    </button>
  );
}