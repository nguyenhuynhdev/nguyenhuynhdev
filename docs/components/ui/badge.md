# Badge

Exports: `Badge`, `badgeVariants`

## Props
- `variant?: "default" | "secondary" | "destructive" | "outline"`
- Inherits `div` attributes

## Usage
```tsx
import { Badge } from "@/components/ui/badge";

export default function Example() {
  return (
    <div className="flex gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  );
}
```
