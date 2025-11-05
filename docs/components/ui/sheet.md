# Sheet (Drawer)

Exports: `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetOverlay`, `SheetPortal`, `SheetClose`

## Usage
```tsx
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function Example() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Title</SheetTitle>
        </SheetHeader>
        <div>Body</div>
      </SheetContent>
    </Sheet>
  );
}
```
