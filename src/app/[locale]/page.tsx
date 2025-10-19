import { getDictionary } from "@/i18n/get-dictionary";
import { i18n, type Locale } from "@/i18n/i18n-config";
import HeroSection from "./components/hero/HeroSection";
import SkillsSection from "./components/SkillsSection";
import ToolsSection from "./components/ToolsSection";
import FooterSection from "./components/FooterSection";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = (await getDictionary(locale as Locale));

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection t={t.hero} />
      <SkillsSection t={t.skills} />
      <ToolsSection t={t.tools} />
      <FooterSection t={t} />
    </div>
  );
}