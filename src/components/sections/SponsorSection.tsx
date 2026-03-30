"use client";

import React, { useRef } from "react";
import Image from "next/image";

// Row 1 Sponsors (Official Organizers)
const sponsorsRow1 = [
  { id: 1, name: "Pharmacy Council of Thailand", logo: "/assets/Img/sponsors/Logo_Pharmacycouncil_2568_2-2_Artboard 2.png", twClass: "" },
  { id: 2, name: "Royal College of Pharmacy of Thailand", logo: "/assets/Img/sponsors/Logo_ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย_2-02.png", twClass: "scale-125 md:scale-150" },
];

// Row 2 Sponsors (Partners / Tech Logos)
const sponsorsRow2 = [
  { id: 6, name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg", twClass: "opacity-70" },
  { id: 7, name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", twClass: "opacity-80" },
  { id: 8, name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", twClass: "opacity-80" },
  { id: 9, name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", twClass: "opacity-70 brightness-0 invert" },
  { id: 10, name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg", twClass: "opacity-70" },
];

export default function SponsorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeRow1 = [...sponsorsRow1, ...sponsorsRow1, ...sponsorsRow1, ...sponsorsRow1];
  const marqueeRow2 = [...sponsorsRow2, ...sponsorsRow2, ...sponsorsRow2, ...sponsorsRow2];

  return (
    <section ref={sectionRef} className="py-10 md:py-14 bg-black overflow-hidden relative z-10">

      {/* Subtle ambient glows */}
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

      {/* Bound the marquee inside a specific width box like the red rectangle */}
      <div className="relative w-full max-w-[1200px] mx-auto flex flex-col gap-4 z-20 overflow-hidden">

        {/* Edge fade masks — placed inside the constrained box */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-black to-transparent z-30 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-black to-transparent z-30 pointer-events-none" />

        {/* Row 1 — Organizer logos, scroll left */}
        <div className="flex w-max animate-sponsor-left items-center hover:[animation-play-state:paused]">
          {marqueeRow1.map((sponsor, index) => (
            <div
              key={`r1-${sponsor.id}-${index}`}
              className="mx-3 md:mx-5 flex items-center justify-center flex-shrink-0 group"
            >
              <div className="relative h-20 w-40 md:h-28 md:w-56 flex items-center justify-center p-4">
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={160}
                  height={100}
                  className={`object-contain max-h-full max-w-full opacity-90 transition-transform ${sponsor.twClass || ""}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Row 2 — Partner logos, scroll right */}
        <div className="flex w-max animate-sponsor-right items-center hover:[animation-play-state:paused]">
          {marqueeRow2.map((sponsor, index) => (
            <div
              key={`r2-${sponsor.id}-${index}`}
              className="mx-5 md:mx-8 flex items-center justify-center flex-shrink-0 group"
            >
              <div className="relative h-12 w-28 md:h-16 md:w-40 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className={`object-contain max-h-full max-w-full transition-all duration-500 ${sponsor.twClass || ""}`}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sponsor-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes sponsor-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-sponsor-left {
          animation: sponsor-left 50s linear infinite;
        }
        .animate-sponsor-right {
          animation: sponsor-right 60s linear infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-sponsor-left, .animate-sponsor-right {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}} />
    </section>
  );
}
