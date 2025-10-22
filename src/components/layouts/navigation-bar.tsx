"use client";

import * as React from "react";
import Link from "next/link";
import { SearchInput } from "@/components/SearchInput";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";

import { Logo } from "@/components/logo";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

interface NavigationBarProps {
  dictionary: any;
  locale: string;
}

function isItemActive(itemHref: string, pathname: string, locale: string) {
  const normalizedPath = pathname.endsWith("/") && pathname !== "/" 
    ? pathname.slice(0, -1) 
    : pathname;

  const base = `/${locale}`;
  
  if (itemHref === base) {
    return normalizedPath === base;
  }

  return normalizedPath === itemHref || normalizedPath.startsWith(itemHref + "/");
}

export default function NavigationBar({ dictionary, locale }: NavigationBarProps) {
  const menuItems = [
    { name: dictionary.services, href: `/${locale}` },
    { name: dictionary.works, href: `/${locale}/works` },
    { name: dictionary.blog, href: `/${locale}/blog` },
  ];

  const bp = useBreakpoint();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 gap-3">
        {/* Logo */}
        <Logo locale={locale} />

        {/* Responsive Navigation */}
        {bp.isDesktop && (
          <DesktopNav
            theme={theme}
            setTheme={setTheme}
            menuItems={menuItems}
            search={dictionary.search}
            pathname={pathname}
            locale={locale}
          />
        )}
        {bp.isLaptop && (
          <DesktopNav
            theme={theme}
            setTheme={setTheme}
            menuItems={menuItems}
            search={dictionary.search}
            pathname={pathname}
            locale={locale}
          />
        )}
        {bp.isTablet && (
          <TabletNav
            theme={theme}
            setTheme={setTheme}
            menuItems={menuItems}
            search={dictionary.search}
            pathname={pathname}
            locale={locale}
          />
        )}
        {bp.isMobile && (
          <MobileNav
            theme={theme}
            setTheme={setTheme}
            menuItems={menuItems}
            search={dictionary.search}
            pathname={pathname}
            locale={locale}
          />
        )}
      </div>
    </header>
  );
}

/* ---------------------------------------
   DESKTOP / LAPTOP NAV
----------------------------------------*/
function DesktopNav({
  theme,
  search,
  setTheme,
  menuItems,
  pathname,
  locale,
}: {
  theme: string | undefined;
  search: string;
  setTheme: (theme: string) => void;
  menuItems: { name: string; href: string }[];
  pathname: string;
  locale: string;
}) {
  return (
    <nav className="flex items-center gap-4">
      <NavigationMenu>
        <NavigationMenuList>
          {menuItems.map((item) => {
            const isActive = isItemActive(item.href, pathname, locale);

            return (
              <NavigationMenuItem key={item.name}>
                <Link
                  href={item.href}
                  className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? "text-primary font-semibold"
                      : "hover:text-primary text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>

      <Separator orientation="vertical" className="h-6" />
      <SearchInput placeholder={search} className="w-36 md:w-48" />
      <LocaleSwitcher />
      <ThemeSwitcher />
    </nav>
  );
}

/* ---------------------------------------
   TABLET NAV
----------------------------------------*/
function TabletNav({
  theme,
  search,
  setTheme,
  menuItems,
  pathname,
  locale,
}: {
  theme: string | undefined;
  search: string;
  pathname: string;
  setTheme: (theme: string) => void;
  menuItems: { name: string; href: string }[];
  locale: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <SearchInput placeholder={search} className="flex-1 max-w-md" />
      <LocaleSwitcher />
      <ThemeSwitcher />

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-md">
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 sm:w-72">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <img src="/logo-white.webp" alt="Logo" className="w-8 h-8 rounded-lg" />
              <span>NGUYENHUYNH</span>
            </SheetTitle>
          </SheetHeader>

          <nav className="mt-6 flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = isItemActive(item.href, pathname, locale);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-accent text-primary font-semibold"
                      : "hover:bg-accent hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ---------------------------------------
   MOBILE NAV
----------------------------------------*/
function MobileNav({
  theme,
  search,
  setTheme,
  menuItems,
  pathname,
  locale,
}: {
  theme: string | undefined;
  search: string;
  pathname: string;
  setTheme: (theme: string) => void;
  menuItems: { name: string; href: string }[];
  locale: string;
}) {
  return (
    <div className="flex items-center gap-2 flex-1 justify-end">
      <SearchInput placeholder={search} className="flex-1 max-w-[70%]" />

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-md">
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 sm:w-72">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <img src="/logo-white.webp" alt="Logo" className="w-8 h-8 rounded-lg" />
              <span>NGUYENHUYNH</span>
            </SheetTitle>
          </SheetHeader>

          <nav className="mt-6 flex flex-col gap-2">
            {menuItems.map((item) => {
              const isActive = isItemActive(item.href, pathname, locale);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-accent text-primary font-semibold"
                      : "hover:bg-accent hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
