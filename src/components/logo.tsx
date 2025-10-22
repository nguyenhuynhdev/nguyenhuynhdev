"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Anton } from "next/font/google";

const anton = Anton({ subsets: ["latin"], weight: ["400"] });

export function Logo({ locale }: { locale: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />;
  }

  return (
    <Link
      href={`/${locale}`}
      className="flex items-center gap-3 flex-shrink-0 select-none"
    >
      {/* Gradient Logo Block */}
      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center overflow-hidden">
        <img
          src="/logo-white.webp"
          alt="Logo"
          className="w-6 h-6 object-contain"
        />
      </div>

      {/* Text Section */}
      <div className="leading-tight">
        <h3
          className={`${anton.className} text-lg font-bold text-gray-900 dark:text-white`}
        >
          Nguyen Huynh
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Full Stack Developer
        </p>
      </div>
    </Link>
  );
}
