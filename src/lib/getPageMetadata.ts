import {getTranslations} from 'next-intl/server';
import type {Metadata, ResolvingMetadata} from 'next';

export async function getPageMetadata(
  locale: string,
  key: string, 
  parent?: ResolvingMetadata
): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'Meta'});
  return {
    title: t(`${key}Title`),
    description: t(`${key}Description`),
    openGraph: {
      title: t(`${key}Title`),
      description: t(`${key}Description`)
    }
  };
}