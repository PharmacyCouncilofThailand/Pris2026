"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Row 1 Sponsors (Official Organizers)
const sponsorsRow1 = [
  { id: 1, name: "Pharmacy Council of Thailand", logo: "/assets/Img/sponsors/Logo_Pharmacycouncil_2568_2-2_Artboard 2.png" },
  { id: 2, name: "Royal College of Pharmacy of Thailand", logo: "/assets/Img/sponsors/Logo_ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย_2-02.png" },
  { id: 3, name: "Pharmacy Council of Thailand", logo: "/assets/Img/sponsors/Logo_Pharmacycouncil_2568_2-2_Artboard 2.png" },
  { id: 4, name: "Royal College of Pharmacy of Thailand", logo: "/assets/Img/sponsors/Logo_ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย_2-02.png" },
  { id: 5, name: "Pharmacy Council of Thailand", logo: "/assets/Img/sponsors/Logo_Pharmacycouncil_2568_2-2_Artboard 2.png" },
];

// Row 2 Sponsors (Partners / Tech Logos) - using white versions for dark mode
const sponsorsRow2 = [
  { id: 6, name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg", twClass: "opacity-60 group-hover:opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" },
  { id: 7, name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", twClass: "opacity-80 group-hover:opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" },
  { id: 8, name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", twClass: "opacity-80 group-hover:opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" },
  { id: 9, name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", twClass: "opacity-70 group-hover:opacity-100 brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" },
  { id: 10, name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg", twClass: "opacity-60 group-hover:opacity-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" },
];

export default function SponsorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueeItemsRow1 = [...sponsorsRow1, ...sponsorsRow1, ...sponsorsRow1, ...sponsorsRow1];
  const marqueeItemsRow2 = [...sponsorsRow2, ...sponsorsRow2, ...sponsorsRow2, ...sponsorsRow2];

  useGSAP(
    () => {
      // Empty or other animations can go here
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-[#02050A] overflow-hidden relative z-10 border-t border-white/5">
      
      {/* Immersive Ambient Glows */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none mix-blend-screen" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none mix-blend-screen" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Brilliant Bottom Separator to disconnect from Footer */}
      <div className="absolute bottom-0 left-0 w-full">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[2px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent blur-sm" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-blue-400/80 to-transparent" />
      </div>



      <div className="relative w-full max-w-[1920px] mx-auto flex flex-col gap-8 sm:gap-12 z-20">
        
        {/* Edge Fade Masks for endless depth */}
        <div className="absolute inset-y-0 left-0 w-32 md:w-64 bg-gradient-to-r from-[#02050A] to-transparent z-30 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 md:w-64 bg-gradient-to-l from-[#02050A] to-transparent z-30 pointer-events-none" />

        {/* Marquee Track 1 - Organizers (Scroll Left) */}
        <div className="flex w-max animate-marquee items-center hover:[animation-play-state:paused] relative">
          {marqueeItemsRow1.map((sponsor, index) => (
            <div 
              key={`row1-${sponsor.id}-${index}`} 
              className="mx-4 md:mx-6 flex items-center justify-center flex-shrink-0 group"
            >
              <div className="relative h-28 w-48 md:h-36 md:w-64 flex items-center justify-center p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl hover:bg-white/[0.05] hover:border-white/[0.15] hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-all duration-500 cursor-pointer overflow-hidden">
                {/* Subtle hover glow inside card */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={200}
                  height={150}
                  className="object-contain max-h-full max-w-full opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Marquee Track 2 - Global Brands (Scroll Right - Slower) */}
        <div className="flex w-max animate-marquee-reverse items-center hover:[animation-play-state:paused] mt-4 relative">
          {marqueeItemsRow2.map((sponsor, index) => (
            <div 
              key={`row2-${sponsor.id}-${index}`} 
              className="mx-6 md:mx-10 flex items-center justify-center flex-shrink-0 group"
            >
              <div className="relative h-16 w-32 md:h-20 md:w-48 flex items-center justify-center cursor-pointer transition-transform duration-500 group-hover:-translate-y-2">
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
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 60s linear infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee, .animate-marquee-reverse {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}} />
    </section>
  );
}
