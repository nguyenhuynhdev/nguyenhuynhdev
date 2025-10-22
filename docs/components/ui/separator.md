# Separator

Exports: `Separator`

## Props
- Inherits all Radix `@radix-ui/react-separator` root props.
- `orientation?: "horizontal" | "vertical"` (default `horizontal`)
- `decorative?: boolean` (default `true`)

## Usage
```tsx
import { Separator } from "@/components/ui/separator";

export default function Example() {
  return (
    <div>
      <div>Top</div>
      <Separator className="my-4" />
      <div>Bottom</div>
    </div>
  );
}
```
