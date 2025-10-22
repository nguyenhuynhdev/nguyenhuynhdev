# NavigationBar

Default export from `src/components/layouts/navigation-bar.tsx`.

## Props
- `dictionary: any` — translation dictionary for labels
- `locale: string` — current locale code

## Usage
```tsx
import NavigationBar from "@/components/layouts/navigation-bar";
import { i18n } from "@/i18n/i18n-config";

export default async function Page() {
  const dictionary = { services: "Services", works: "Works", blog: "Blog", search: "Search" };
  return <NavigationBar dictionary={dictionary} locale={i18n.defaultLocale} />;
}
```
