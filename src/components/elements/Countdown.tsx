"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const msInSecond = 1000;
const msInMinute = 60 * msInSecond;
const msInHour = 60 * msInMinute;
const msInDay = 24 * msInHour;

const getPartsOfTimeDuration = (duration: number) => {
  const days = Math.floor(duration / msInDay);
  const hours = Math.floor((duration % msInDay) / msInHour);
  const minutes = Math.floor((duration % msInHour) / msInMinute);
  const seconds = Math.floor((duration % msInMinute) / msInSecond);

  return { days, hours, minutes, seconds };
};

// Pris 2026 Conference Date: October 16, 2026 at 9:00 AM Bangkok time
const CONFERENCE_DATE = new Date("2026-10-16T09:00:00+07:00").getTime();

interface CountdownProps {
  className?: string;
}

export default function Countdown({ className }: CountdownProps) {
  const [timeDif, setTimeDif] = useState<number | null>(null);
  const t = useTranslations("countdown");

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const difference = CONFERENCE_DATE - now;
      setTimeDif(difference > 0 ? difference : 0);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Hydration safety
  if (timeDif === null) return null;

  const timeParts = getPartsOfTimeDuration(timeDif);

  return (
    <div className={cn("flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-5", className)}>
      <TimeUnit value={timeParts.days} label={t("days")} />
      <TimeUnit value={timeParts.hours} label={t("hours")} />
      <TimeUnit value={timeParts.minutes} label={t("minutes")} />
    </div>
  );
}

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="relative flex flex-col items-center justify-center p-3.5 md:py-5 md:px-7 min-w-[80px] md:min-w-[110px] rounded-xl md:rounded-2xl border border-white/20 bg-black/30 md:bg-black/40 shadow-[0_12px_40px_rgba(0,85,255,0.15)] overflow-hidden">
    
    {/* Decorative gradient overlay (permanent) */}
    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-100 pointer-events-none" />
    
    <div className="relative z-10 flex flex-col items-center">
      <span className="text-4xl sm:text-5xl md:text-[3.25rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tight tabular-nums drop-shadow-sm mb-1 md:mb-1.5">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] sm:text-[11px] md:text-xs text-blue-300 uppercase tracking-[0.15em] font-medium">
        {label}
      </span>
    </div>
    
    {/* Bottom glowing line (permanent) */}
    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-100" />
  </div>
);
