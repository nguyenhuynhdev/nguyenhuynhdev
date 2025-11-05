# i18n-config

Exports: `i18n`, `type Locale`

```ts
export const i18n = {
  defaultLocale: "vi",
  locales: ["en", "vi"],
} as const
export type Locale = (typeof i18n)["locales"][number]
```

Use `Locale` for type-safe locale params.
