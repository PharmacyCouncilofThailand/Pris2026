"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

// ข้อมูล 3 สปอนเซอร์ที่มีในระบบตอนนี้ (แถวแรก เลื่อนซ้าย)
const sponsorsRow1 = [
  { id: 1, name: "Pharmacy Council of Thailand", logo: "/assets/Img/sponsors/logo สภา.jpg" },
  { id: 2, name: "Pharmacy Council of Thailand", logo: "/assets/Img/sponsors/logo สภา.jpg" },
  { id: 3, name: "Pharmacy Council of Thailand", logo: "/assets/Img/sponsors/logo สภา.jpg" },
];

// ข้อมูลสปอนเซอร์แถวที่ 2 (เลื่อนขวา) ใช้ Tech Logos (Apple, etc.)
const sponsorsRow2 = [
  { id: 4, name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", twClass: "brightness-0" },
  { id: 5, name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", twClass: "" },
  { id: 6, name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", twClass: "" },
  { id: 7, name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", twClass: "brightness-0" },
];

export default function SponsorSection() {
  const t = useTranslations("sponsors");
  // Duplicate arrays multiple times to create a seamless infinite scroll effect
  const marqueeItemsRow1 = [...sponsorsRow1, ...sponsorsRow1, ...sponsorsRow1, ...sponsorsRow1, ...sponsorsRow1, ...sponsorsRow1];
  const marqueeItemsRow2 = [...sponsorsRow2, ...sponsorsRow2, ...sponsorsRow2, ...sponsorsRow2, ...sponsorsRow2, ...sponsorsRow2];

  return (
    <section className="py-10 md:py-16 bg-white text-black overflow-hidden relative z-10 border-t border-b border-black/5">
      
      {/* Video Background Removed */}

      <div className="relative w-full flex flex-col gap-6 md:gap-8 overflow-x-hidden py-4 md:py-6 z-10">

        
        {/* Marquee Track 1 (Scroll Left) */}
        <div className="flex w-max animate-marquee items-center hover:[animation-play-state:paused] mt-2 relative z-0">
          {marqueeItemsRow1.map((sponsor, index) => (
            <div 
              key={`row1-${sponsor.id}-${index}`} 
              className="mx-4 md:mx-8 flex items-center justify-center cursor-pointer group"
            >
              <div className="relative h-20 w-32 sm:h-24 sm:w-48 md:h-28 md:w-56 flex items-center justify-center p-2">
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={250}
                  height={150}
                  className="object-contain max-h-full max-w-full"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Marquee Track 2 (Scroll Right) */}
        <div className="flex w-max animate-marquee-reverse items-center hover:[animation-play-state:paused] mb-2 relative z-0">
          {marqueeItemsRow2.map((sponsor, index) => (
            <div 
              key={`row2-${sponsor.id}-${index}`} 
              className="mx-4 md:mx-8 flex items-center justify-center cursor-pointer group"
            >
              <div className="relative h-16 w-28 sm:h-20 sm:w-40 md:h-24 md:w-48 flex items-center justify-center p-2">
                {/* Use standard img tag here to bypass Next.js hostname whitelist constraint on external images */}
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className={`object-contain max-h-full max-w-full drop-shadow-md ${sponsor.twClass || ""}`}
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
