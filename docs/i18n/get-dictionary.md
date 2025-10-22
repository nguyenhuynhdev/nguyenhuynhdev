# getDictionary

Exports: `getDictionary(locale: Locale): Promise<Record<string, any>>`

Loads locale messages from `src/i18n/messages/{en,vi}.json` on the server.

## Usage
```ts
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/i18n-config";

export async function getStrings(locale: Locale) {
  const t = await getDictionary(locale);
  return t;
}
```
