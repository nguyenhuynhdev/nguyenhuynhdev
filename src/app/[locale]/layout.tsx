import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Background from "@/components/backgrounds/background";
import { getMessages } from "next-intl/server";

import type { LocaleParams } from '@/types/next-intl';
import { getPageMetadata } from '@/lib/getPageMetadata';

import { getTranslations } from 'next-intl/server';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const { locale } = await params
  const previousImages = (await parent).openGraph?.images || []
 return await getPageMetadata(locale, 'home', parent);
}

// export async function generateMetadata(
//   { params }: { params: { locale: string } },   // destructuring trực tiếp
//   parent: ResolvingMetadata
// ): Promise<Metadata> {
//   const locale = params.locale;

//   const t = await getTranslations({ locale, namespace: 'Meta' });
//   const previousMetadata = await parent;

//   return {
//     title: t('homeTitle'),
//     description: t('homeDescription'),
//     openGraph: {
//       title: t('homeTitle'),
//       description: t('homeDescription'),
//     },
//   };
// }
// export async function generateMetadata(
//   { params }: LocaleParams,       // destructuring trực tiếp
//   parent: ResolvingMetadata
// ): Promise<Metadata> {
//   const locale = params.locale;   // lấy string locale

//   return await getPageMetadata(locale, 'home', parent);
// }

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Background />
      <div className="relative z-10 flex max-w-[1280px] mx-auto px-4 py-8 min-h-screen">
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
