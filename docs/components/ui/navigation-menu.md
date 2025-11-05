# NavigationMenu

Exports:
- `NavigationMenu`
- `NavigationMenuList`
- `NavigationMenuItem`
- `NavigationMenuTrigger`
- `NavigationMenuContent`
- `NavigationMenuViewport`
- `NavigationMenuIndicator`
- `NavigationMenuLink`
- `navigationMenuTriggerStyle`

## Usage
```tsx
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";

export default function Example() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="p-4">Content</div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
```
