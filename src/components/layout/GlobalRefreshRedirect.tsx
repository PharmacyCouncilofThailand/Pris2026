"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";

// A module-level variable to track if this is the first execution of JS on this page
let isInitialized = false;

export default function GlobalRefreshRedirect() {
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;

      // On completely fresh hard-load (F5 / Refresh)
      if (typeof window !== "undefined") {
        const perfEntries = performance.getEntriesByType("navigation");
        if (perfEntries.length > 0) {
          const navType = (perfEntries[0] as PerformanceNavigationTiming).type;
          // If user hit refresh, redirect to home page so intro plays
          if (navType === "reload" && pathname !== "/") {
            window.location.href = `/${locale}`;
            return;
          }
        }
      }
    }

    if (pathname !== "/") {
      if (typeof window !== "undefined") {
        document.body.classList.remove("hero-playing");
        document.body.style.overflow = "";
      }
    }
  }, [pathname, locale]);

  return null;
}
