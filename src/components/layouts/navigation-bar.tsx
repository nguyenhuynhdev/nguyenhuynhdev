"use client";

import * as React from "react";
import Link from "next/link";
import { useState } from "react";
import { SearchInput } from "@/components/SearchInput";
import { i18n, type Locale } from "@/i18n/i18n-config";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { Menu, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";

import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";

import { Logo } from "@/components/logo";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu";


interface NavigationBarProps {
    dictionary: any;
    locale: string;
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
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);


    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
                ${scrolled
                    ? "backdrop-blur-md  border-b border-gray-200 dark:border-gray-800"
                    : "bg-transparent"
                }`}
        >
            <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 gap-3">
                {/* Logo */}
                <Logo locale={locale} />

                {/* DESKTOP NAV */}
                {bp.isDesktop && (
                    <DesktopNav theme={theme} setTheme={setTheme} menuItems={menuItems} search={dictionary.search} pathname={pathname}/>
                )}
                {bp.isLaptop && (
                    <DesktopNav theme={theme} setTheme={setTheme} menuItems={menuItems} search={dictionary.search} pathname={pathname}/>
                )}
                {bp.isTablet && (
                    <TabletNav theme={theme} setTheme={setTheme}  menuItems={menuItems} search={dictionary.search} pathname={pathname}/>
                )}
                {bp.isMobile && (
                    <MobileNav theme={theme} setTheme={setTheme} menuItems={menuItems} search={dictionary.search} pathname={pathname}/>
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
}: {
    theme: string | undefined;
    search: string;
    setTheme: (theme: string) => void;
    menuItems: { name: string; href: string }[];
    pathname: string;
}) {
    return (
        <nav className="flex items-center gap-4">
            <NavigationMenu>
                <NavigationMenuList>
                    {menuItems.map((item) => {
                        const isActive =
                            pathname === item.href || pathname.startsWith(item.href + "/");

                        return (
                            <NavigationMenuItem key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${isActive
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
}: {
    theme: string | undefined;
    search: string;
    pathname: string;
    setTheme: (theme: string) => void;
    menuItems: { name: string; href: string }[];
}) {
    return (
        <div className="flex items-center gap-3">
            {/* Search bar size chuẩn */}
            <SearchInput placeholder={search} className="flex-1 max-w-md" />

            {/* Language + Theme switch */}
            <LocaleSwitcher />
            <ThemeSwitcher />

            {/* Menu button (drawer) */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-md">
                        <Menu size={20} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 sm:w-72">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-8 h-8 rounded-full"
                            />
                            <span>NGUYENHUYNH</span>
                        </SheetTitle>
                    </SheetHeader>

                    <nav className="mt-6 flex flex-col gap-2">
                        {menuItems.map((item) => {
                            const isActive =
                                pathname === item.href || pathname.startsWith(item.href + "/");

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-md text-sm transition-colors ${isActive
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
    )
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
}: {
    theme: string | undefined;
    search: string;
    pathname: string;
    setTheme: (theme: string) => void;
    menuItems: { name: string; href: string }[];
}) {
    return (
        <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Search full width */}
            <SearchInput placeholder={search} className="flex-1 max-w-[70%]" />

            {/* Menu Drawer */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-md">
                        <Menu size={20} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 sm:w-72">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-8 h-8 rounded-full"
                            />
                            <span>NGUYENHUYNH</span>
                        </SheetTitle>
                    </SheetHeader>

                    <nav className="mt-6 flex flex-col gap-2">
                        {menuItems.map((item) => {
                            const isActive =
                                pathname === item.href || pathname.startsWith(item.href + "/");

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-md text-sm transition-colors ${isActive
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
