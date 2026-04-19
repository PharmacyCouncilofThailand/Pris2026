import React from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  subtitle?: string;
  title: React.ReactNode;
  align?: "left" | "center" | "right";
  theme?: "light" | "dark";
  className?: string;
}

export function SectionTitle({
  subtitle,
  title,
  align = "left",
  theme = "light",
  className,
}: SectionTitleProps) {
  const isDark = theme === "dark";

  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" && "items-center text-center",
        align === "right" && "items-end text-right",
        align === "left" && "items-start text-left",
        className
      )}
    >
      {subtitle && (
        <div className={cn("flex items-center gap-4 mb-4", align === "center" && "justify-center")}>
          {align !== "left" && (
            <span className={cn("w-12 h-px", isDark ? "bg-white/40" : "bg-gold/50")} />
          )}
          <span
            className={cn(
              "text-xs font-semibold tracking-[0.25em] uppercase",
              isDark ? "text-white/70" : "text-gold/80"
            )}
          >
            {subtitle}
          </span>
          {align !== "right" && (
            <span className={cn("w-12 h-px", isDark ? "bg-white/40" : "bg-gold/50")} />
          )}
        </div>
      )}

      <h2
        className={cn(
          "text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]",
          isDark ? "text-white" : "text-black"
        )}
      >
        {title}
      </h2>
    </div>
  );
}
