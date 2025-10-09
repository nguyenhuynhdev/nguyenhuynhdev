import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen gap-6 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <Link
          href="/about"
          className="text-blue-500 hover:underline dark:text-blue-300"
        >
          {t("about")}
        </Link>
      </div>

      {/* 🌗 Nút đổi theme */}
      <ThemeSwitcher />
    </div>
  );
}