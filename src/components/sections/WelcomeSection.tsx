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

export default function WelcomeSection() {
  const locale: string = "en";
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

      // Animate each card with stagger
      const cards = gsap.utils.toArray<HTMLElement>(".speaker-card");
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 85%" },
          }
        );
      });
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
        <div className="welcome-header text-center mb-16 md:mb-20">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="w-12 h-px bg-gold/40" />
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-gold/70">
              Welcome Messages
            </span>
            <span className="w-12 h-px bg-gold/40" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-black font-heading">
            Meet Our Leaders
          </h2>
        </div>

        {/* Speakers in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-4xl mx-auto">
          {ORGANIZERS_DATA.map((person, index) => (
            <div
              key={index}
              className="speaker-card group flex flex-col items-center text-center"
            >
              {/* Profile Image */}
              <div className="relative w-36 h-36 md:w-44 md:h-44 mb-6 rounded-full overflow-hidden ring-2 ring-black/10 group-hover:ring-gold/40 transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
                {person.image ? (
                  <Image
                    src={person.image}
                    alt={getName(person)}
                    fill
                    sizes="176px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-black/5 flex items-center justify-center">
                    <span className="text-4xl text-black/20">
                      {getName(person).charAt(0)}
                    </span>
                  </div>
                )}
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Name */}
              <h3 className="text-lg md:text-xl font-bold text-black mb-2 group-hover:text-gold transition-colors duration-300">
                {getName(person)}
              </h3>

              {/* Position */}
              <p className="text-sm text-black/50 leading-relaxed max-w-[240px]">
                {getPosition(person)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
