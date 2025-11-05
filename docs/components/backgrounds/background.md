# Background

Default export from `src/components/backgrounds/background.tsx`.

## Description
Renders decorative animated background based on current theme (dark or light). Requires `next-themes` context.

## Usage
```tsx
import Background from "@/components/backgrounds/background";

export default function Example() {
  return (
    <div className="relative">
      <Background />
      <main className="relative z-10">Content</main>
    </div>
  );
}
```
