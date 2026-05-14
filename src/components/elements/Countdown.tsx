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

// Pris 2026 Conference Date: October 29, 2026 at 9:00 AM Bangkok time
const CONFERENCE_DATE = new Date("2026-10-29T09:00:00+07:00").getTime();

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

  const units = [
    { value: timeParts.days, label: t("days") },
    { value: timeParts.hours, label: t("hours") },
    { value: timeParts.minutes, label: t("minutes") },
    { value: timeParts.seconds, label: t("seconds") },
  ];

  return (
    <div className={cn("inline-flex max-w-full items-center", className)}>
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center">
          <div className="flex flex-col items-center px-2 sm:px-3.5 md:px-5 lg:px-6">
            <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white tabular-nums tracking-tight leading-none">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] xl:text-xs text-white/40 uppercase tracking-[0.14em] sm:tracking-[0.18em] font-medium mt-1 sm:mt-1.5">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <div className="w-px h-7 sm:h-8 md:h-10 lg:h-12 xl:h-14 bg-white/20" />
          )}
        </div>
      ))}
    </div>
  );
}
