import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";

export function Logo({ locale }: { locale: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-transparent" />
    );
  }

  const logoSrc =
    resolvedTheme === "dark" ? "/logo-white.webp" : "/logo-black.webp";

  return (
    <Link
      href={`/${locale}`}
      className="flex items-center gap-2 flex-shrink-0 select-none"
    >
      <img
        src={logoSrc}
        alt="Logo"
        className="w-6 h-6"
      />
      <span className="text-base font-semibold">NGUYENHUYNHDEV</span>
    </Link>
  );
}