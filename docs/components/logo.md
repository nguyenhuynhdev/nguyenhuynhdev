# Logo

Exports: `Logo({ locale }: { locale: string })`

Requires `next-themes` to avoid hydration mismatch and render correct logo by theme.

## Usage
```tsx
import { Logo } from "@/components/logo";

export default function Example() {
  return <Logo locale="en" />;
}
```
