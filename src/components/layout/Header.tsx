"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
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
    login: "Login",
    signUp: "Sign Up",
  };
  return translations[key] || key;
};

export default function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Placeholder locale logic for links
  const locale = "en";

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
        isScrolled
          ? "bg-black/90 backdrop-blur-md border-white/10 shadow-lg py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="relative flex items-center z-50">
          <Image
            src="/assets/img/logo/Pris2026-logo.png"
            alt="Pris 2026 Logo"
            width={100}
            height={40}
            className={cn(
              "object-contain transition-all duration-300",
              isScrolled ? "h-[45px] w-auto" : "h-[60px] w-auto"
            )}
            priority
          />
        </Link>

        {/* Desktop Navigation (shadcn/ui NavigationMenu) */}
        <div className="hidden xl:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              {navigationData.map((item) => (
                <NavigationMenuItem key={item.labelKey}>
                  {item.href && (!item.children || item.children.length === 0) ? (
                    <NavigationMenuLink render={
                      <Link 
                        href={`/${locale}${item.href}`}
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "bg-transparent text-white hover:bg-white/10 hover:text-gold data-[active]:bg-white/10 data-[state=open]:bg-white/10 focus:bg-white/10"
                        )}
                      />
                    }>
                      {t(item.labelKey)}
                    </NavigationMenuLink>
                  ) : (
                    <>
                      <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/10 hover:text-gold data-[active]:bg-white/10 data-[state=open]:bg-white/10 focus:bg-white/10">
                        {t(item.labelKey)}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[250px] gap-2 p-4 bg-white rounded-lg shadow-xl">
                          {item.children?.map((child) => (
                            <li key={child.labelKey}>
                              <Link
                                href={`/${locale}${child.href}`}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gold focus:bg-gray-100"
                              >
                                <div className="text-sm font-medium leading-none text-gray-900">
                                  {t(child.labelKey)}
                                </div>
                              </Link>
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

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link 
              href={`/${locale}/login`}
              className={cn(
                buttonVariants({ variant: "outline" }), 
                "text-white border-white/30 hover:bg-white hover:text-black"
              )}
            >
              {t("login")}
            </Link>
            <Link 
              href={`/${locale}/signup`}
              className={cn(
                buttonVariants({ variant: "default" }), 
                "bg-gold text-black hover:bg-gold/90 font-semibold"
              )}
            >
              {t("signUp")}
            </Link>
          </div>
        </div>

        {/* Mobile Navigation (shadcn/ui Sheet) */}
        <div className="xl:hidden flex items-center">
          <Sheet>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "text-white hover:bg-white/20 border border-white/20 "
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
                    src="/assets/img/logo/Pris2026-logo.png"
                    alt="Pris 2026 Logo"
                    width={100}
                    height={40}
                    className="h-[50px] w-auto"
                  />
                </div>
                
                <nav className="flex-1 overflow-y-auto">
                  <ul className="flex flex-col gap-4">
                    {navigationData.map((item) => (
                      <li key={item.labelKey} className="border-b border-white/10 pb-4">
                        {item.href ? (
                          <Link
                            href={`/${locale}${item.href}`}
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
                                    href={`/${locale}${child.href}`}
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

                <div className="mt-8 flex flex-col gap-3 pt-6 border-t border-white/10">
                  <Link 
                    href={`/${locale}/login`}
                    className={cn(
                      buttonVariants({ variant: "outline" }), 
                      "w-full text-black bg-white hover:bg-gray-200"
                    )}
                  >
                    {t("login")}
                  </Link>
                  <Link 
                    href={`/${locale}/signup`}
                    className={cn(
                      buttonVariants({ variant: "default" }), 
                      "w-full bg-gold text-black hover:bg-gold/90 font-semibold"
                    )}
                  >
                    {t("signUp")}
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
