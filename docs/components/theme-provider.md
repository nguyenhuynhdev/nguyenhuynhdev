# ThemeProvider

Exports: `ThemeProvider`

Thin wrapper around `next-themes` `ThemeProvider`.

## Usage
```tsx
"use client";
import { ThemeProvider } from "@/components/theme-provider";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
```
