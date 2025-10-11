import Background from "@/components/backgrounds/background";
import { i18n, type Locale } from "@/i18n/i18n-config";
import { logger } from "@/lib/logger";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Metadata, ResolvingMetadata } from 'next';


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  logger.info("generateMetadata - locale: " + locale);
  const translations = (await getDictionary(locale as Locale)).Meta
  //const previousImages = (await parent).openGraph?.images || []
  return {
    title: translations.homeTitle,
    description: translations.homeDescription,
    openGraph: {
      title: translations.homeTitle,
      description: translations.homeDescription,
    },
  };
}

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale: locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  logger.info("LocaleLayout - locale: " + locale);
  //if (!hasLocale(routing.locales, locale)) notFound();
  return (
    //<NextIntlClientProvider messages={messages}>
    <div>
      <Background />
      <div className="relative z-10 flex max-w-[1280px] mx-auto px-4 py-8 min-h-screen">
        {children}
      </div>
    </div>
    // </NextIntlClientProvider>
  );
}
