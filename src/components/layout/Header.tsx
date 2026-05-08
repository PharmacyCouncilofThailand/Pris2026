"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Menu, ChevronDown, Globe, User, Loader2 } from "lucide-react";
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

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { navigationData } from "@/data/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { isAuthenticated: isLoggedIn } = useAuth();
  const [isPending, startTransition] = React.useTransition();
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("common");
  type TranslationKey = Parameters<typeof t>[0];
  type LinkHref = React.ComponentProps<typeof Link>["href"];

  React.useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const heroStillPlaying = document.body.classList.contains("hero-playing");
        setIsScrolled(!heroStillPlaying && window.scrollY > 50);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const lightPages = [
    "/abstract-submission",
    "/about",
    "/call-for-abstracts",
    "/welcome-messages",
    "/abstract-guidelines",
    "/approved-abstracts",
    "/registration-policies",
    "/sponsorship",
    "/contact",
    "/login",
    "/signup",
    "/profile",
    "/registration"
  ];
  const isLightPage = lightPages.includes(pathname) || pathname.startsWith("/signup") || pathname.startsWith("/login") || pathname.startsWith("/profile");
  const useDarkText = isLightPage && !isScrolled;

  if (pathname.includes("/login") || pathname.includes("/signup") || pathname.includes("/forgot-password") || pathname.includes("/reset-password") || pathname.includes("/approved-abstracts")) {
    return null;
  }

  const switchLocale = () => {
    const newLocale = locale === "en" ? "th" : "en";
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent py-3",
        isScrolled
          ? "bg-black/95 md:bg-black/90 md:backdrop-blur-md border-white/10 shadow-lg"
          : "bg-transparent"
      )}
    >
      <div className="w-full px-4 md:px-6 xl:px-8">
        <div className="flex items-center justify-between gap-3 xl:grid xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-center xl:gap-8">
          {/* Left: Logo */}
          <div className="flex min-w-0 items-center justify-start xl:justify-self-start">
            <Link
              href="/"
              prefetch={true}
              className="relative flex items-center"
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
                src="/assets/Img/logo/LOGO1.png"
                alt="Pris 2026 Logo"
                width={200}
                height={80}
                className={cn("object-contain h-[40px] w-auto transition-all xl:h-[48px]", useDarkText && "brightness-0")}
                priority
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden xl:flex items-center justify-center xl:justify-self-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                {navigationData.map((item) => (
                  <NavigationMenuItem key={item.labelKey}>
                    {item.href && (!item.children || item.children.length === 0) ? (
                      <NavigationMenuLink render={
                        <Link
                          href={item.href as LinkHref}
                          prefetch={true}
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "bg-transparent transition-colors",
                            useDarkText ? "text-slate-900 hover:bg-slate-100 hover:text-blue-600" : "text-white hover:bg-white/10 hover:text-orange-500"
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
                        {t(item.labelKey as TranslationKey)}
                      </NavigationMenuLink>
                    ) : (
                      <>
                        <NavigationMenuTrigger className={cn(
                          "bg-transparent transition-colors",
                          useDarkText ? "text-slate-900 hover:bg-slate-100 hover:text-blue-600" : "text-white hover:bg-white/10 hover:text-orange-500"
                        )}>
                          {t(item.labelKey as TranslationKey)}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[250px] gap-2 p-4 bg-white rounded-lg shadow-xl border border-slate-100">
                            {item.children?.map((child) => (
                              <li key={child.labelKey}>
                                <NavigationMenuLink render={
                                  <Link
                                    href={(child.href || "#") as LinkHref}
                                    prefetch={true}
                                    className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors text-slate-800 hover:text-blue-600 hover:!bg-slate-50 data-[active]:!bg-blue-50 data-[active]:!text-blue-700"
                                    onClick={() => {
                                      if (typeof document !== "undefined") {
                                        if (document.activeElement instanceof HTMLElement) {
                                          document.activeElement.blur();
                                        }
                                        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
                                        document.body.click();
                                      }
                                    }}
                                  />
                                }>
                                  <div className="text-sm font-bold leading-none">
                                    {t(child.labelKey as TranslationKey)}
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

          {/* Right: Desktop Tools */}
          <div className="hidden xl:flex items-center justify-end gap-3 xl:justify-self-end">
            <button
              onClick={switchLocale}
              disabled={isPending}
              className={cn(
                "flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors",
                useDarkText
                  ? "text-slate-900 hover:bg-slate-100"
                  : "text-white hover:bg-white/10",
                isPending && "opacity-50 cursor-not-allowed"
              )}
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              <span className="uppercase text-xs font-bold tracking-wider">
                {locale === "en" ? "TH" : "EN"}
              </span>
            </button>

            <div className={cn(
              "flex items-center gap-4 border-l pl-4",
              useDarkText ? "border-slate-200" : "border-white/20"
            )}>
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  prefetch={true}
                  className={cn(
                    "inline-flex h-10 items-center justify-center gap-2 rounded-full px-6 text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
                    useDarkText
                      ? "bg-slate-900 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25"
                      : "bg-white text-slate-900 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/25"
                  )}
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    prefetch={true}
                    className={cn(
                      "text-[12px] font-bold uppercase tracking-[0.15em] transition-colors duration-300",
                      useDarkText ? "text-slate-600 hover:text-blue-600" : "text-white/80 hover:text-white"
                    )}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    prefetch={true}
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-full px-6 text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
                      useDarkText
                        ? "bg-slate-900 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25"
                        : "bg-white text-slate-900 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/25"
                    )}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="xl:hidden flex items-center justify-end gap-2 shrink-0">
          {/* Mobile Language Switcher */}
          <button
            onClick={switchLocale}
            disabled={isPending}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors",
              useDarkText
                ? "text-slate-900 hover:bg-slate-100 border border-slate-200"
                : "text-white hover:bg-white/20 border border-white/20",
              isPending && "opacity-50 cursor-not-allowed"
            )}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            <span className="uppercase text-xs font-bold tracking-wider">
              {locale === "en" ? "TH" : "EN"}
            </span>
          </button>

          <Sheet>
            <SheetTrigger
              className={cn(
                "flex items-center justify-center h-[36px] w-[36px] rounded-md transition-colors",
                useDarkText
                  ? "text-slate-900 border border-slate-200 hover:bg-slate-100"
                  : "text-white border border-white/20 hover:bg-white/20"
              )}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle mobile menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black/95 text-white border-l-gray-800 p-0 w-[300px]">
              <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
              <div className="p-6 h-full flex flex-col">
                <div className="mb-8 mt-4">
                  <Image
                    src="/assets/Img/logo/LOGO1.png"
                    alt="Pris 2026 Logo"
                    width={200}
                    height={80}
                    className="h-[55px] w-auto"
                  />
                </div>

                <nav className="flex-1 overflow-y-auto">
                  <ul className="flex flex-col gap-4">
                    {navigationData.map((item) => (
                      <li key={item.labelKey} className="border-b border-white/10 pb-4">
                        {item.href ? (
                          <Link
                            href={item.href as LinkHref}
                            prefetch={true}
                            className="text-lg font-medium hover:text-orange-500 block"
                          >
                            {t(item.labelKey as TranslationKey)}
                          </Link>
                        ) : (
                          <details className="group">
                            <summary className="flex items-center justify-between text-lg font-medium cursor-pointer list-none hover:text-orange-500">
                              {t(item.labelKey as TranslationKey)}
                              <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                            </summary>
                            <ul className="mt-4 flex flex-col gap-3 pl-4 border-l-2 border-white/20">
                              {item.children?.map((child) => (
                                <li key={child.labelKey}>
                                  <Link
                                    href={(child.href || "#") as LinkHref}
                                    prefetch={true}
                                    className="text-gray-300 hover:text-orange-500 block py-1"
                                  >
                                    {t(child.labelKey as TranslationKey)}
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

                {/* Mobile Auth Buttons */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
                  {isLoggedIn ? (
                    <Link
                      href="/profile"
                      prefetch={true}
                      className="w-full py-3.5 text-center text-[11px] font-bold uppercase tracking-widest bg-white text-black rounded-full hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        prefetch={true}
                        className="w-full py-3.5 text-center text-[11px] font-bold uppercase tracking-widest text-white border border-white/20 rounded-full hover:bg-white/5 transition-colors"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/signup"
                        prefetch={true}
                        className="w-full py-3.5 text-center text-[11px] font-bold uppercase tracking-widest bg-white text-black rounded-full hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        </div>
      </div>
    </header>
  );
}
