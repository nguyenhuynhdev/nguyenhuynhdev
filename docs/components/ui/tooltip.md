# Tooltip

Exports: `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`

## Usage
```tsx
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export default function Example() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button>Hover me</button>
      </TooltipTrigger>
      <TooltipContent>Helpful info</TooltipContent>
    </Tooltip>
  );
}
```

Wrap app with `TooltipProvider` if you need global defaults; the component already provides a provider with `delayDuration=0` by default.
