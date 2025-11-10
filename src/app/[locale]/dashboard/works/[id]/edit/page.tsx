import localesData from '@/i18n/locales.json';
import EditWorkPageClient from './client-page';

export async function generateStaticParams() {
  // Generate params for locale and id
  // For static export, return placeholder id - actual ids handled client-side
  return localesData.locales.map((locale) => ({
    locale,
    id: '1' // Placeholder ID for static export - actual routes handled client-side via client component
  }));
}

export default function EditWorkPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  return <EditWorkPageClient />;
}

