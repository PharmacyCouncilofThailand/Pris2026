"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { ORGANIZERS_DATA } from "@/data/speakersData";
import { useLocale, useTranslations } from "next-intl";
import { SectionTitle } from "@/components/elements/SectionTitle";

export default function WelcomeSection() {
  const locale = useLocale();
  const t = useTranslations("welcome");
  const containerRef = useRef<HTMLDivElement>(null);

  const getName = (p: (typeof ORGANIZERS_DATA)[0]) =>
    locale === "th" ? p.nameTh : p.name;
  const getPosition = (p: (typeof ORGANIZERS_DATA)[0]) =>
    locale === "th" ? p.positionTh : p.position;

  useGSAP(
    () => {
      // Animate header
      gsap.fromTo(
        ".welcome-header",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: ".welcome-header", start: "top 85%" },
        }
      );

      // Animate cards as a staggered group when the grid comes into view
      gsap.fromTo(
        ".speaker-card",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: { 
            trigger: ".welcome-grid", 
            start: "top 85%" 
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className={cn(
        "relative pt-0 pb-20 md:pb-28 overflow-hidden z-[2]",
        "bg-white"
      )}
    >

      <div className="container mx-auto px-4 relative z-[2] pt-20 md:pt-28">
        {/* Header */}
        <SectionTitle
          subtitle={t("welcomeMessages")}
          title={t.rich('title', {
            br: () => <br className="hidden md:block" />
          })}
          align="center"
          theme="light"
          className="welcome-header mb-16 md:mb-20"
        />

        {/* Speakers in one row */}
        <div className="welcome-grid grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-5xl mx-auto">
          {ORGANIZERS_DATA.map((person, index) => (
            <div
              key={index}
              className="speaker-card group flex flex-col items-center text-center"
            >
              {/* Profile Image */}
              <div className="relative w-36 h-36 md:w-44 md:h-44 mb-6 rounded-full overflow-hidden ring-2 ring-black/10 shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
                {person.image ? (
                  <Image
                    src={person.image}
                    alt={getName(person)}
                    fill
                    sizes="176px"
                    priority
                    quality={90}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-black/5 flex items-center justify-center">
                    <span className="text-4xl text-black/20">
                      {getName(person).charAt(0)}
                    </span>
                  </div>
                )}

              </div>

              {/* Name */}
              <h3 className="text-lg md:text-xl font-bold text-black mb-2">
                {getName(person)}
              </h3>

              {/* Position */}
              <p className="text-sm text-black/50 leading-relaxed max-w-[240px] whitespace-pre-line">
                {getPosition(person)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
