"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

import { navigationData } from "@/data/navigation";

// Minimal i18n mock function until next-intl is fully configured
// We use uppercase for placeholders
const t = (key: string) => {
  const translations: Record<string, string> = {
    home: "Home",
    about: "About",
    aboutPris: "About PRIS",
    welcomeMessages: "Welcome Messages",
    committee: "Committee",
    callForAbstracts: "Call for Abstracts",
    abstractGuideline: "Abstract Guideline",
    registration: "Registration",
    registrationInfo: "Registration Info",
    policies: "Policies",
    sponsorship: "Sponsorship",
    confirmedSponsors: "Confirmed Sponsors",
    sponsorshipProspectusMenu: "Sponsorship Prospectus",
    exhibitionFloorPlan: "Exhibition Floor Plan",
    more: "More",
    gallery: "Gallery",
    contact: "Contact",
  };
  return translations[key] || key;
};

export default function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      // Don't show solid navbar while the Hero cinematic intro is still playing
      const heroStillPlaying = document.body.classList.contains("hero-playing");
      setIsScrolled(!heroStillPlaying && window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine if we should use light-background colors (dark text)
  const isLightPage = pathname === "/abstract-submission" || pathname === "/about" || pathname === "/call-for-abstracts" || pathname === "/welcome-messages";
  const useDarkText = isLightPage && !isScrolled;

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent py-3",
        isScrolled
          ? "bg-black/90 backdrop-blur-md border-white/10 shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="relative flex items-center z-50"
          onClick={() => {
            if (typeof document !== "undefined") {
              if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
              document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
            }
          }}
        >
          <Image
            src="/assets/Img/logo/Pris2026-logo.svg"
            alt="Pris 2026 Logo"
            width={120}
            height={48}
            className={cn("object-contain h-[45px] w-auto transition-all", useDarkText && "brightness-0")}
            priority
          />
        </Link>

        {/* Desktop Navigation (shadcn/ui NavigationMenu) */}
        <div className="hidden xl:flex items-center justify-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              {navigationData.map((item) => (
                <NavigationMenuItem key={item.labelKey}>
                  {item.href && (!item.children || item.children.length === 0) ? (
                    <NavigationMenuLink render={
                      <Link 
                        href={item.href}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "bg-transparent transition-colors",
                          useDarkText ? "text-slate-900 hover:bg-slate-100 hover:text-blue-600" : "text-white hover:bg-white/10 hover:text-gold"
                        )}
                        onClick={() => {
                          if (typeof document !== "undefined") {
                            if (document.activeElement instanceof HTMLElement) {
                              document.activeElement.blur();
                            }
                            document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
                          }
                        }}
                      />
                    }>
                      {t(item.labelKey)}
                    </NavigationMenuLink>
                  ) : (
                    <>
                      <NavigationMenuTrigger className={cn(
                        "bg-transparent transition-colors",
                        useDarkText ? "text-slate-900 hover:bg-slate-100 hover:text-blue-600" : "text-white hover:bg-white/10 hover:text-gold"
                      )}>
                        {t(item.labelKey)}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[250px] gap-2 p-4 bg-white rounded-lg shadow-xl border border-slate-100">
                          {item.children?.map((child) => (
                            <li key={child.labelKey}>
                              <NavigationMenuLink render={
                                <Link 
                                  href={child.href || "#"} 
                                  className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors text-slate-800 hover:text-blue-600 hover:!bg-slate-50 data-[active]:!bg-blue-50 data-[active]:!text-blue-700" 
                                  onClick={() => {
                                    if (typeof document !== "undefined") {
                                      if (document.activeElement instanceof HTMLElement) {
                                        document.activeElement.blur();
                                      }
                                      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
                                      // Shadcn UI uses custom pointers and escapes. Sometimes clicking also needs closing state
                                      document.body.click(); 
                                    }
                                  }}
                                />
                              }>
                                <div className="text-sm font-bold leading-none">
                                  {t(child.labelKey)}
                                </div>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Navigation (shadcn/ui Sheet) */}
        <div className="xl:hidden flex items-center justify-end">
          <Sheet>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                useDarkText 
                  ? "text-slate-900 hover:bg-slate-100 border border-slate-200" 
                  : "text-white hover:bg-white/20 border border-white/20"
              )}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle mobile menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black/95 text-white border-l-gray-800 p-0 w-[300px]">
              <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
              <div className="p-6 h-full flex flex-col">
                <div className="mb-8 mt-4">
                  <Image
                    src="/assets/Img/logo/Pris2026-logo.svg"
                    alt="Pris 2026 Logo"
                    width={120}
                    height={48}
                    className="h-[45px] w-auto"
                  />
                </div>
                
                <nav className="flex-1 overflow-y-auto">
                  <ul className="flex flex-col gap-4">
                    {navigationData.map((item) => (
                      <li key={item.labelKey} className="border-b border-white/10 pb-4">
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="text-lg font-medium hover:text-gold block"
                          >
                            {t(item.labelKey)}
                          </Link>
                        ) : (
                          <details className="group">
                            <summary className="flex items-center justify-between text-lg font-medium cursor-pointer list-none hover:text-gold">
                              {t(item.labelKey)}
                              <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                            </summary>
                            <ul className="mt-4 flex flex-col gap-3 pl-4 border-l-2 border-white/20">
                              {item.children?.map((child) => (
                                <li key={child.labelKey}>
                                  <Link
                                    href={child.href || "#"}
                                    className="text-gray-300 hover:text-gold block py-1"
                                  >
                                    {t(child.labelKey)}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
