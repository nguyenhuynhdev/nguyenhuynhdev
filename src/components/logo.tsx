import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";

import { Anton } from 'next/font/google'

const roboto = Anton({ subsets: ["latin"], weight: ["400", "400"] });
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
      href={`/${locale}`}className="flex items-center gap-1 flex-shrink-0 select-none">
      <img
        src={logoSrc}
        alt="Logo"
        className="w-6 h-6"
      />
      <span className={`${roboto.className} text-2xl tracking-tight leading-none`}>
        NGUYENHUYNH
      </span>
    </Link>
  );
}