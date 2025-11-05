# Button

Exports: `Button`, `buttonVariants`

## Props
- Inherits all native `button` props.
- Variant props: `variant` (`default | destructive | outline | secondary | ghost | link`), `size` (`default | sm | lg | icon | icon-sm | icon-lg`)
- `asChild?: boolean` (render as Radix `Slot`)

## Usage
```tsx
import { Button } from "@/components/ui/button";

export default function Example() {
  return (
    <>
      <Button>Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button size="icon" aria-label="Settings">
        <svg width="16" height="16" />
      </Button>
    </>
  );
}
```

## Styling
Use `buttonVariants({ variant, size, className })` to compose classnames.
