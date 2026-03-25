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

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center justify-center p-3 md:p-5 min-w-[80px] md:min-w-[100px] bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_15px_50px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]">
      <span className="text-3xl md:text-5xl font-black bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent tracking-wide">
        {value}
      </span>
      <span className="text-xs md:text-sm text-gray-300 mt-1 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );

  return (
    <div className={cn("flex flex-wrap justify-center gap-3 md:gap-4", className)}>
      <TimeUnit value={timeParts.days} label={t("days")} />
      <TimeUnit value={timeParts.hours} label={t("hours")} />
      <TimeUnit value={timeParts.minutes} label={t("minutes")} />
      <TimeUnit value={timeParts.seconds} label={t("seconds")} />
    </div>
  );
}
