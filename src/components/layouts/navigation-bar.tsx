"use client";

import * as React from "react";
import Link from "next/link";
import { i18n, type Locale } from "@/i18n/i18n-config";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import { Menu, Search } from "lucide-react";
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

import { Logo } from "@/components/ui/logo";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuContent,
    NavigationMenuLink,
} from "@/components/ui/navigation-menu";

interface NavigationBarProps {
    dictionary: {
        home: string;
        about: string;
        projects: string;
        blog: string;
        contact: string;
        search: string;
    };
    locale: string;
}

export default function NavigationBar({ dictionary, locale }: NavigationBarProps) {
    const menuItems = [
        { name: dictionary.home, href: `/${locale}#home` },
        { name: dictionary.about, href: `/${locale}#about` },
        { name: dictionary.projects, href: `/${locale}#projects` },
        { name: dictionary.blog, href: `/${locale}#blog` },
        { name: dictionary.contact, href: `/${locale}#contact` },
    ];

    const bp = useBreakpoint();
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
                    <DesktopNav theme={theme} setTheme={setTheme} menuItems={menuItems} search={dictionary.search}/>
                )}
                {bp.isLaptop && (
                    <DesktopNav theme={theme} setTheme={setTheme} menuItems={menuItems} search={dictionary.search}/>
                )}
                {bp.isTablet && (
                    <TabletNav theme={theme} setTheme={setTheme} search={dictionary.search}/>
                )}
                {bp.isMobile && (
                    <MobileNav theme={theme} setTheme={setTheme} menuItems={menuItems} search={dictionary.search}/>
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
}: {
    theme: string | undefined;
    search: string;
    setTheme: (theme: string) => void;
    menuItems: { name: string; href: string }[];
}) {
    return (
        <nav className="flex items-center gap-4">
            {/* Menu */}
            <NavigationMenu>
                <NavigationMenuList>
                    {menuItems.map((item) => (
                        <NavigationMenuItem key={item.name}>
                            <NavigationMenuLink
                                href={item.href}
                                className="text-sm font-medium px-3 py-2 rounded-md hover:text-primary transition-colors"
                            >
                                {item.name}
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>

            <Separator orientation="vertical" className="h-6" />

            {/* Search nhỏ */}
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={search}
                    className="pl-8 w-36 md:w-48 rounded-full"
                />
            </div>

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
}: {
    theme: string | undefined,
    search: string;
    setTheme: (theme: string) => void
}) {
    return (
        <div className="flex items-center gap-3">
            {/* Search bar size chuẩn */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={search}
                    className="pl-9 pr-3 py-2 w-full rounded-full"
                />
            </div>

            {/* Language + Theme switch */}
            <LocaleSwitcher />
            <ThemeSwitcher />

            {/* Menu button (drawer) */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu size={20} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 sm:w-72">
                    {/* Nội dung menu items + switchers */}
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
}: {
    theme: string | undefined;
    search: string;
    setTheme: (theme: string) => void;
    menuItems: { name: string; href: string }[];
}) {
    return (
        <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Search full width */}
            <div className="relative flex-1 max-w-[70%]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={search}
                    className="pl-9 pr-3 py-2 w-full rounded-full"
                />
            </div>

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
                            <span>NGUYENHUYNHDEV</span>
                        </SheetTitle>
                    </SheetHeader>

                    <nav className="mt-6 flex flex-col gap-2">
                        {menuItems.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-primary transition-colors"
                            >
                                {item.name}
                            </a>
                        ))}

                        <Separator className="my-4" />

                        <div className="flex items-center justify-between gap-2">
                            <LocaleSwitcher />
                            <ThemeSwitcher />
                        </div>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    );
}
