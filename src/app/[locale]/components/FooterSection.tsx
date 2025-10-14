"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default function FooterSection({ t }: { t: any }) {
  return (
    <footer className="mt-auto py-6 text-center border-t border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-500 mb-3">
        © {new Date().getFullYear()} Dev Portfolio. All rights reserved.
      </p>
      <div className="flex justify-center gap-4">
        <ThemeSwitcher />
        <LocaleSwitcher />
      </div>
    </footer>
  );
}
