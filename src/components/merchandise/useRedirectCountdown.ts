"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/routing";

// Counts down once per second while `active`, then replaces the route once.
export function useRedirectCountdown(
  active: boolean,
  seconds: number,
  to: "/souvenirs/orders",
): number {
  const router = useRouter();
  const [remaining, setRemaining] = useState(seconds);
  const redirected = useRef(false);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);
  useEffect(() => {
    if (!active || remaining > 0 || redirected.current) return;
    redirected.current = true;
    router.replace(to);
  }, [active, remaining, router, to]);
  return remaining;
}
