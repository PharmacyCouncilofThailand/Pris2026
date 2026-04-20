"use client";

import React, { useRef } from "react";

// Sponsors (Partners / Tech Logos)
const sponsorsRow = [
  { id: 1, name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg", twClass: "opacity-70" },
  { id: 2, name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", twClass: "opacity-80" },
  { id: 3, name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", twClass: "opacity-80" },
  { id: 4, name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", twClass: "opacity-70 brightness-0 invert" },
  { id: 5, name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg", twClass: "opacity-70" },
];

export default function SponsorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeRow = [...sponsorsRow, ...sponsorsRow, ...sponsorsRow];

  return (
    <section ref={sectionRef} className="py-12 md:py-16 bg-black overflow-hidden relative z-10 flex flex-col items-center justify-center min-h-[250px]">

      {/* Center "SPONSORS" watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <h2 className="text-[clamp(4rem,10vw,12rem)] font-black uppercase text-white/[0.03] tracking-tighter leading-none select-none">
          SPONSORS
        </h2>
      </div>

      <div className="relative z-20 mb-8 md:mb-12">
        <h3 className="text-white/60 text-sm md:text-base font-medium tracking-[0.5em] uppercase flex items-center justify-center">
          <span className="inline-block w-8 md:w-16 h-px bg-gradient-to-r from-transparent to-white/30 mr-4"></span>
          Our Sponsors
          <span className="inline-block w-8 md:w-16 h-px bg-gradient-to-l from-transparent to-white/30 ml-4"></span>
        </h3>
      </div>

      {/* Marquee container */}
      <div className="relative w-full z-20 overflow-hidden">
        {/* Edge fade masks */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-40 bg-gradient-to-r from-black to-transparent z-30 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-40 bg-gradient-to-l from-black to-transparent z-30 pointer-events-none" />

        {/* Sponsor logos — GPU-accelerated scroll */}
        <div className="flex w-max animate-sponsor-scroll items-center will-change-transform transform-gpu">
          {marqueeRow.map((sponsor, index) => (
            <div
              key={`r-${sponsor.id}-${index}`}
              className="mx-6 md:mx-10 flex items-center justify-center flex-shrink-0"
            >
              <div className="h-16 w-32 md:h-20 md:w-48 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className={`object-contain max-h-full max-w-full ${sponsor.twClass || ""}`}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sponsor-scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333%, 0, 0); }
        }
        .animate-sponsor-scroll {
          animation: sponsor-scroll 40s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-sponsor-scroll {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}} />
    </section>
  );
}
