import { getDictionary } from "@/i18n/get-dictionary";
import { i18n, type Locale } from "@/i18n/i18n-config";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LocaleSwitcher } from "@/components/locale-switcher";

import Link from "next/link";

// export async function generateStaticParams() {
//   return [{ locale: 'en' }, { locale: 'vi' }];
// }

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale: locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const translations = (await getDictionary(locale as Locale)).AboutPage;
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen gap-6 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">{translations.title}</h1>
        <Link className="text-blue-500 hover:underline dark:text-blue-300"
         href={`/${locale}/about`}>{translations.description}</Link>
      </div>
      <ThemeSwitcher />
      <LocaleSwitcher/>
    </div>
  );
}