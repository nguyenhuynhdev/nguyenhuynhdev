# HeroSection

Default export from `src/app/[locale]/components/HeroSection.tsx`.

## Props
- `t: any` — translation dictionary slice for hero

## Notes
- Client component; uses `useBreakpoint` and typing animation.

## Usage
```tsx
import HeroSection from "@/app/[locale]/components/HeroSection";

export default function Example({ t }: { t: any }) {
  return <HeroSection t={t} />;
}
```
