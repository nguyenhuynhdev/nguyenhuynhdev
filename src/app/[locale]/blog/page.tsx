import { getDictionary } from "@/i18n/get-dictionary";
import { i18n, type Locale } from "@/i18n/i18n-config";
import BlogSection from "../components/BlogSection";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getDictionary(locale as Locale);

  return (
    <div className="flex flex-col min-h-screen">
      <BlogSection t={t.blog} />
    </div>
  );
}
