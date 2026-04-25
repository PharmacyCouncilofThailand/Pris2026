"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface PageHeroProps {
  /** Small text above the title (e.g. "PRIS 2026") */
  eyebrow?: string;
  /** Secondary eyebrow text after the dash (e.g. "About Us") */
  eyebrowSub?: string;
  /** First line of the big title */
  title1: string;
  /** Second line (rendered with gradient) */
  title2?: string;
  /** Paragraph below the title */
  subtitle?: string;
  /** Use dark theme (for pages like committee) */
  dark?: boolean;
  /** Place title1 and title2 on the same line */
  inlineTitle?: boolean;
}

export default function PageHero({
  eyebrow = "PRIS 2026",
  eyebrowSub,
  title1,
  title2,
  subtitle,
  dark = false,
  inlineTitle = false,
}: PageHeroProps) {
  const heroRef = useRef<HTMLElement>(null!);

  useGSAP(
    () => {
      gsap.from(".page-hero-line", {
        yPercent: 110,
        stagger: 0.12,
        duration: 1.6,
        ease: "power4.out",
        delay: 0.15,
        force3D: true,
      });
      gsap.from(".page-hero-sub", {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.8,
        force3D: true,
      });
    },
    { scope: heroRef }
  );

  // Color tokens
  const eyebrowColor = dark ? "text-[#D4AF37]" : "text-blue-600";
  const lineColor = dark ? "bg-[#D4AF37]/50" : "bg-blue-600/50";
  const subColor = dark ? "text-white/40" : "text-gray-300";
  const titleColor = dark ? "text-white" : "text-gray-900";
  const subtitleColor = dark ? "text-white/50" : "text-gray-500";
  const gradientFrom = dark
    ? "from-white via-white to-white/60"
    : "from-blue-500 via-blue-600 to-orange-500";

  return (
    <section
      ref={heroRef}
      className="relative pt-40 md:pt-56 pb-20 md:pb-32 px-6 md:px-12 flex flex-col justify-end items-center text-center"
    >
      {/* Decorative BG Glows */}
      {!dark && (
        <>
          <div className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-blue-500/[0.06] rounded-full blur-[180px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/[0.06] rounded-full blur-[150px] pointer-events-none" />
        </>
      )}

      <div className="max-w-7xl mx-auto w-full relative z-10 text-center flex flex-col items-center">
        {/* Eyebrow */}
        <div className="overflow-hidden mb-6 flex justify-center">
          <h4
            className={`page-hero-sub ${eyebrowColor} tracking-[0.3em] uppercase text-xs md:text-sm font-semibold flex items-center gap-4`}
          >
            <span className={`w-8 h-px ${lineColor}`} />
            {eyebrow}
            {eyebrowSub && (
              <span className={`${subColor} text-[10px] tracking-widest uppercase md:text-xs`}>
                — {eyebrowSub}
              </span>
            )}
            <span className={`w-8 h-px ${lineColor}`} />
          </h4>
        </div>

        {/* Title */}
        <h1
          className={`text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] font-black uppercase tracking-tighter leading-tight ${titleColor} mb-8 ${inlineTitle ? 'flex flex-row justify-center gap-x-3 md:gap-x-6' : ''}`}
        >
          <div className="overflow-hidden py-2 -my-2 md:pl-2">
            <span className={`${inlineTitle ? 'inline-block' : 'block'} page-hero-line pr-[0.15em]`}>{title1}</span>
          </div>
          {title2 && (
            <div className="overflow-hidden py-2 -my-2 md:pl-2">
              <span
                className={`${inlineTitle ? 'inline-block' : 'block'} page-hero-line text-transparent bg-clip-text bg-gradient-to-r ${gradientFrom} pb-2 pr-[0.15em]`}
              >
                {title2}
              </span>
            </div>
          )}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <div className="overflow-hidden max-w-2xl px-4">
            <p className={`page-hero-sub ${subtitleColor} text-lg md:text-xl font-light leading-relaxed`}>
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
