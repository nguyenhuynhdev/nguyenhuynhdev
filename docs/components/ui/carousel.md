# Carousel

Exports: `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `type CarouselApi`

## Props
- `Carousel`: `orientation?: "horizontal" | "vertical"` (default `horizontal`), `opts?` (Embla options), `plugins?` (Embla plugins), `setApi?: (api: CarouselApi) => void`
- `CarouselContent`, `CarouselItem`: inherit `div` props

## Usage
```tsx
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default function Example() {
  return (
    <Carousel>
      <CarouselContent>
        <CarouselItem className="p-4">Slide 1</CarouselItem>
        <CarouselItem className="p-4">Slide 2</CarouselItem>
        <CarouselItem className="p-4">Slide 3</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
```
