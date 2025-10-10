import "server-only";
import type { Locale } from "./i18n-config";

const dictionaries = {
  en: () => import("./messages/en.json").then((m) => m.default),
  vi: () => import("./messages/vi.json").then((m) => m.default),
};

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]?.() ?? dictionaries.en();