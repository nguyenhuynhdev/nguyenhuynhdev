import type {Metadata, ResolvingMetadata} from 'next';
import { getDictionary } from "@/i18n/get-dictionary";

export async function getPageMetadata(
  locale: string,
  key: string, 
  parent?: ResolvingMetadata
): Promise<Metadata> {
  const t = await getDictionary(locale as any)

  return {
    title: t(`${key}Title`),
    description: t(`${key}Description`),
    openGraph: {
      title: t(`${key}Title`),
      description: t(`${key}Description`)
    }
  };
}