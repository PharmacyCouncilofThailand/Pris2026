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
    <div
      className={cn(
        "font-heading mx-auto grid w-full max-w-[520px] grid-cols-2 items-center justify-items-center gap-x-4 gap-y-5 sm:inline-flex sm:max-w-none sm:justify-center sm:gap-x-0 sm:gap-y-0",
        className
      )}
    >
      {units.map((unit, i) => (
        <div key={unit.label} className="flex w-full items-center justify-center sm:w-auto">
          <div className="flex min-w-[7.25rem] flex-col items-center px-2 sm:min-w-0 sm:px-8 md:px-10 lg:px-14 xl:px-20 2xl:px-24 max-md:landscape:px-5">
            <span className="text-4xl font-black leading-none tracking-[0.04em] text-white tabular-nums sm:text-5xl md:text-6xl max-md:landscape:text-3xl">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="mt-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 sm:text-[10px] md:text-xs max-md:landscape:mt-1 max-md:landscape:text-[8px]">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <div className="hidden h-10 w-px bg-white/20 sm:block sm:h-12 md:h-14" />
          )}
        </div>
      ))}
    </div>
  );
}
