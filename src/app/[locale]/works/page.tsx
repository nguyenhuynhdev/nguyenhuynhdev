import { getDictionary } from "@/i18n/get-dictionary";
import { type Locale } from "@/i18n/i18n-config";
import WorksSection from "../components/WorksSection";
import localesData from '@/i18n/locales.json';

export async function generateStaticParams() {
  return localesData.locales.map((locale) => ({ locale }));
}

export default async function WorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getDictionary(locale as Locale);

  return (
    <div className="flex flex-col min-h-screen">
      <WorksSection t={t.works} />
    </div>
  );
}
