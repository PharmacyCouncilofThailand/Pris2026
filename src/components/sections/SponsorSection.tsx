"use client";

import React from "react";
import Image from "next/image";

// ข้อมูล 3 สปอนเซอร์ที่มีในระบบตอนนี้ (แถวแรก เลื่อนซ้าย)
const sponsorsRow1 = [
  { id: 1, name: "College Pharmacy", logo: "/assets/Img/sponsors/college-pharmacy.png" },
  { id: 2, name: "Pharmacy Council of Thailand", logo: "/assets/Img/sponsors/pharmacy-council.jpg" },
  { id: 3, name: "Royal College of Pharmacy", logo: "/assets/Img/sponsors/royal-college.jpg" },
];

// ข้อมูลสปอนเซอร์แถวที่ 2 (เลื่อนขวา) ใช้ Tech Logos (Apple, etc.)
const sponsorsRow2 = [
  { id: 4, name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { id: 5, name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { id: 6, name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
  { id: 7, name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
];

export default function SponsorSection() {
  // Duplicate arrays multiple times to create a seamless infinite scroll effect
  const marqueeItemsRow1 = [...sponsorsRow1, ...sponsorsRow1, ...sponsorsRow1, ...sponsorsRow1, ...sponsorsRow1, ...sponsorsRow1];
  const marqueeItemsRow2 = [...sponsorsRow2, ...sponsorsRow2, ...sponsorsRow2, ...sponsorsRow2, ...sponsorsRow2, ...sponsorsRow2];

  return (
    <section className="py-6 md:py-10 bg-white text-gray-900 overflow-hidden relative z-10 border-t border-b border-gray-200">
      
      {/* Editorial Title */}
      <div className="container mx-auto px-4 text-center mb-4 md:mb-8">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <span className="w-6 sm:w-10 h-px bg-gray-300" />
          <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-gray-400">
            Proudly Supported By
          </span>
          <span className="w-6 sm:w-10 h-px bg-gray-300" />
        </div>
      </div>

      {/* Grid subtle background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] md:bg-[size:80px_80px] pointer-events-none opacity-50" />

      <div className="relative w-full flex flex-col gap-4 md:gap-6 overflow-x-hidden py-2 md:py-4">
        {/* Left and right gradient fade for smooth entry/exit effect */}
        <div className="absolute top-0 bottom-0 left-0 w-24 md:w-56 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 md:w-56 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
        
        {/* Marquee Track 1 (Scroll Left) */}
        <div className="flex w-max animate-marquee items-center hover:[animation-play-state:paused] mt-4 relative z-0">
          {marqueeItemsRow1.map((sponsor, index) => (
            <div 
              key={`row1-${sponsor.id}-${index}`} 
              className="mx-8 md:mx-16 flex items-center justify-center cursor-pointer group"
            >
              <div className="relative h-14 w-24 sm:h-20 sm:w-40 md:h-24 md:w-48 flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:drop-shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-all duration-500">
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={250}
                  height={150}
                  className="object-contain max-h-full max-w-full mix-blend-multiply"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Marquee Track 2 (Scroll Right) */}
        <div className="flex w-max animate-marquee-reverse items-center hover:[animation-play-state:paused] mb-4 relative z-0">
          {marqueeItemsRow2.map((sponsor, index) => (
            <div 
              key={`row2-${sponsor.id}-${index}`} 
              className="mx-8 md:mx-16 flex items-center justify-center cursor-pointer group"
            >
              <div className="relative h-12 w-20 sm:h-16 sm:w-32 md:h-20 md:w-40 flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:drop-shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-all duration-500">
                {/* Use standard img tag here to bypass Next.js hostname whitelist constraint on external images */}
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="object-contain max-h-full max-w-full mix-blend-multiply"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for Infinite Marquee */}
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
          animation: marquee 40s linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse 45s linear infinite;
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
