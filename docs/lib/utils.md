# utils: `cn`

Exports: `cn(...inputs: ClassValue[]): string`

Merges conditional and Tailwind class strings using `clsx` and `tailwind-merge`.

## Usage
```ts
import { cn } from "@/lib/utils";

<div className={cn("p-2", isActive && "bg-blue-500")} />
```
