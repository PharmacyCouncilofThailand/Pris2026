"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// A module-level variable to track if this is the first execution of JS on this page
let isInitialized = false;

export default function GlobalRefreshRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) {
      isInitialized = true;
    }

    if (pathname !== "/") {
      if (typeof window !== "undefined") {
        document.body.classList.remove("hero-playing");
        document.body.style.overflow = "";
      }
    }
  }, [pathname, router]);

  return null;
}
