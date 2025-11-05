# useBreakpoint

Exports: `useBreakpoint()`

Client hook that tracks the current responsive breakpoint using `window.innerWidth`.

## Return value
```ts
{
  breakpoint: "mobile" | "tablet" | "laptop" | "desktop",
  isMobile: boolean,
  isTablet: boolean,
  isLaptop: boolean,
  isDesktop: boolean,
}
```

## Usage
```tsx
"use client";
import { useBreakpoint } from "@/hooks/use-breakpoint";

export default function Example() {
  const { isMobile, breakpoint } = useBreakpoint();
  return <div>Breakpoint: {breakpoint} {isMobile && "(mobile)"}</div>;
}
```
