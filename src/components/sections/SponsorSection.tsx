"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const partnersRow = [
  {
    id: 1,
    name: "Pharmacy Council of Thailand",
    logo: "/assets/Img/Partner/Logo_Pharmacycouncil_2568_2-2_Artboard 2.png",
    twClass: "scale-[1.15]",
  },
  {
    id: 2,
    name: "Royal College of Pharmacy of Thailand",
    logo: "/assets/Img/Partner/Logo_ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย_2-02.png",
    twClass: "scale-[1.15]",
  },
  {
    id: 3,
    name: "Pharmacy Administration College",
    logo: "/assets/Img/Partner/วิทยาลัยการบริหารเภสัชกิจแห่งประเทศไทย.png",
    twClass: "scale-100",
  },
  {
    id: 4,
    name: "Consumer Protection Pharmacy College",
    logo: "/assets/Img/Partner/วิทยาลัยคุ้นครอง 2.png",
    twClass: "scale-100",
  },
  {
    id: 5,
    name: "Community Pharmacy College",
    logo: "/assets/Img/Partner/วิทยาลัยเภสัชกรรมชุมชน.png",
    twClass: "scale-100",
  },
  {
    id: 6,
    name: "Herbal Pharmacy College",
    logo: "/assets/Img/Partner/วิทยาลัยเภสัชกรรมสมุนไพรแห่งประเทศไทย.png",
    twClass: "scale-100",
  },
  {
    id: 7,
    name: "Industrial Pharmacy College",
    logo: "/assets/Img/Partner/วิทยาลัยเภสัชกรรมอุตสาหการแห่งประเทศไทย.png",
    twClass: "scale-100",
  },
  {
    id: 8,
    name: "Pharmacotherapy College",
    logo: "/assets/Img/Partner/วิทยาลัยบำบัด 2.png",
    twClass: "scale-100",
  },
  {
    id: 9,
    name: "CPPGX",
    logo: "/assets/Img/Partner/CPPGX.png",
    twClass: "scale-100",
  },
  {
    id: 10,
    name: "The Pharmacy Council Foundation",
    logo: "/assets/Img/Partner/มูลนิธิสภาเภสัชกรรม.png",
    twClass: "scale-100",
  },
];

const universitiesRow = [
  {
    id: 1,
    name: "มหาวิทยาลัยขอนแก่น",
    logo: "/assets/Img/University/pharmkku_logo-ขอนแก่น.png",
    twClass: "scale-100",
  },
  {
    id: 2,
    name: "มหาวิทยาลัยเชียงใหม่",
    logo: "/assets/Img/University/คณะเภสัชศาสตร์ เชียงใหม่.png",
    twClass: "scale-[1.05]",
  },
  {
    id: 3,
    name: "มหาวิทยาลัยนเรศวร",
    logo: "/assets/Img/University/มหาวิทยาลัย นเรศวร คณะ Pharmacy_Naresuan.png",
    twClass: "scale-[0.92]",
  },
  {
    id: 4,
    name: "มหาวิทยาลัยปทุมธานี",
    logo: "/assets/Img/University/มหาวิทยาลัยปทุมธานี.jpeg",
    twClass: "scale-100",
  },
  {
    id: 5,
    name: "มหาวิทยาลัยสงขลานครินทร์",
    logo: "/assets/Img/University/มหาวิทยาลัยสงขลานครินทร์.jpg",
    twClass: "scale-100",
  },
  {
    id: 6,
    name: "สถาบันวิทยาการประกอบการแห่งอโยธยา",
    logo: "/assets/Img/University/สถาบันวิทยาการประกอบการแห่งอโยธยา.jpeg",
    twClass: "scale-[1.02]",
  },
  {
    id: 7,
    name: "มหาวิทยาลัยบูรพา",
    logo: "/assets/Img/University/BUU RxBUU_0 (2) (1).png",
    twClass: "scale-[0.92]",
  },
  {
    id: 8,
    name: "มหาวิทยาลัยมหิดล",
    logo: "/assets/Img/University/มหาวิทยาลัยมหิดล คณะเภสัชศาสตร์.jpg",
    twClass: "scale-[0.92]",
  },
  {
    id: 9,
    name: "มหาวิทยาลัยรังสิต",
    logo: "/assets/Img/University/รังสิต.jpg",
    twClass: "scale-[0.88]",
  },
];

const sponsorsRow = [
  {
    id: 1,
    name: "Berlin Pharmaceutical Industry",
    logo: "/assets/Img/sponsors/Berlin pharmaceutical.jpg",
    twClass: "scale-[1.15]",
    marginClass: "mx-6 sm:mx-9 md:mx-12",
  },
  {
    id: 2,
    name: "TILSNA",
    logo: "/assets/Img/sponsors/S__109420674.jpg",
    twClass: "scale-[1.3]",
    marginClass: "mx-6 sm:mx-9 md:mx-12",
  },
  {
    id: 3,
    name: "Novaceutical",
    logo: "/assets/Img/sponsors/Novaceutical.jpg",
    twClass: "scale-[1.45]",
    marginClass: "mx-6 sm:mx-9 md:mx-12",
  },
  {
    id: 4,
    name: "ศิริเวชกรรม",
    logo: "/assets/Img/sponsors/ศิริเวชกรรม.jpg",
    twClass: "scale-[1.3]",
    marginClass: "mx-7 sm:mx-10 md:mx-13",
  },
  {
    id: 5,
    name: "ภิญโญฟาร์มาซี",
    logo: "/assets/Img/sponsors/ภิญโญฟาร์มาซี.png",
    twClass: "scale-[1.25]",
    marginClass: "mx-6 sm:mx-9 md:mx-12",
  },
  {
    id: 6,
    name: "AstraZeneca",
    logo: "/assets/Img/sponsors/astrazeneca.png",
    twClass: "scale-[1.6]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
  },
  {
    id: 7,
    name: "GPO",
    logo: "/assets/Img/sponsors/gpo.png",
    twClass: "scale-[1.1]",
    marginClass: "mx-6 sm:mx-9 md:mx-12",
  },
  {
    id: 8,
    name: "Telehealth Thailand",
    logo: "/assets/Img/sponsors/telehealth-thailand.png",
    twClass: "scale-[1.15]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
  },
  {
    id: 9,
    name: "MP Group",
    logo: "/assets/Img/sponsors/mp-group.png",
    twClass: "scale-[1.5]",
    marginClass: "mx-8 sm:mx-11 md:mx-14",
  },
  {
    id: 10,
    name: "NIA Academy",
    logo: "/assets/Img/sponsors/nia-academy.png",
    twClass: "scale-[1.15]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
  },
  {
    id: 11,
    name: "Circlife Medical",
    logo: "/assets/Img/sponsors/circlife-medical.png",
    twClass: "scale-[1.45]",
    marginClass: "mx-8 sm:mx-11 md:mx-14",
  },
  {
    id: 12,
    name: "OLIC",
    logo: "/assets/Img/sponsors/olic.jpg",
    twClass: "scale-[1.15]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
    unconstrained: true,
  },
  {
    id: 13,
    name: "Abbott",
    logo: "/assets/Img/sponsors/abbott.png",
    twClass: "scale-[1.6]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
  },
  {
    id: 14,
    name: "BLC Bangkok",
    logo: "/assets/Img/sponsors/BLC Bangkok.png",
    twClass: "scale-[1.6]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
  },
  {
    id: 15,
    name: "Bangkok Lab and Cosmetic",
    logo: "/assets/Img/sponsors/bangkoklab.jpg",
    twClass: "scale-[1.2]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
  },
  {
    id: 16,
    name: "Nest Up",
    logo: "/assets/Img/sponsors/NEST UP-FINAL-01_crop.png",
    twClass: "scale-[1.15]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
  },
  {
    id: 17,
    name: "Eisai",
    logo: "/assets/Img/sponsors/บริษัท เอไซ (ประเทศไทย) มาร์เก็ตติ้ง จำกัด (รอ cf).png",
    twClass: "scale-[1.2]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
  },
  {
    id: 18,
    name: "MP Healthcare",
    logo: "/assets/Img/sponsors/บริษัท เอ็มพี เอลท์แคร์ จำกัด.png",
    twClass: "scale-[1.25]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
  },
  {
    id: 19,
    name: "Sun Pharma",
    logo: "/assets/Img/sponsors/Sun Pharma.jpg",
    twClass: "scale-[1.15]",
    marginClass: "mx-8 sm:mx-11 md:mx-14",
    unconstrained: true,
  },
  {
    id: 20,
    name: "ชุมชนเภสัชกรรม",
    logo: "/assets/Img/sponsors/Chumchon_Rx_Final-05 - Haris Boonchuen.png",
    twClass: "scale-[1.15]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
    unconstrained: true,
  },
  {
    id: 21,
    name: "DG4",
    logo: "/assets/Img/sponsors/บริษัทดีจีโฟร์ จำกัด.png",
    twClass: "scale-[1.55]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
  },
  {
    id: 22,
    name: "Boon Supply",
    logo: "/assets/Img/sponsors/บริษัทบุญซัพพลาย จำกัด.png",
    twClass: "scale-[1.55]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
  },
  {
    id: 23,
    name: "Innosus",
    logo: "/assets/Img/sponsors/innozus.png",
    twClass: "scale-[1.4]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
  },
  {
    id: 24,
    name: "Greater Mybacin",
    logo: "/assets/Img/sponsors/เกร๊ทเตอร์มายบาซิน จำกัด.jpg",
    twClass: "scale-[1.25]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
  },
  {
    id: 25,
    name: "Aerocare",
    logo: "/assets/Img/sponsors/aerocare.jpg",
    twClass: "scale-[1.6]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
  },
  {
    id: 26,
    name: "AeroCare Inpac Pharma",
    logo: "/assets/Img/sponsors/บริษัทแอโรแคร์จํากัด.png",
    twClass: "scale-[1.2]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
  },
  {
    id: 27,
    name: "Thai Olba Healthcare",
    logo: "/assets/Img/sponsors/บริษัทไทยโอลบา เฮลท์แคร์ จำกัด.png",
    twClass: "scale-[1.15]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
  },
  {
    id: 28,
    name: "Thai Otsuka",
    logo: "/assets/Img/sponsors/บริษัทไทโอซูกะ.png",
    twClass: "scale-[1.2]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
  },
  {
    id: 29,
    name: "Biogenetech",
    logo: "/assets/Img/sponsors/biogenetech.jpg",
    twClass: "scale-[1.6]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
  },
  {
    id: 30,
    name: "Boehringer Ingelheim",
    logo: "/assets/Img/sponsors/boeheringer.jpg",
    twClass: "scale-[1.2]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
  },
  {
    id: 31,
    name: "Gateway Healthcare",
    logo: "/assets/Img/sponsors/gate way healthcare.png",
    twClass: "scale-[1.2]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
  },
  {
    id: 32,
    name: "GSK",
    logo: "/assets/Img/sponsors/gsk.png",
    twClass: "scale-[1.2]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
  },
  {
    id: 33,
    name: "สวทช.",
    logo: "/assets/Img/sponsors/สวทช.png",
    twClass: "scale-[1.65]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
  },
  {
    id: 34,
    name: "ห้องปฏิบัติการเภสัชพันธุศาสตร์",
    logo: "/assets/Img/sponsors/ห้องปฏิบัติการเภสัชพันธุศาสตร์.png",
    twClass: "scale-[1.7]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
  },
  {
    id: 35,
    name: "Neocosmed",
    logo: "/assets/Img/sponsors/บริษัท นีโอคอสเมด จำกัด.jpg",
    twClass: "scale-[1.35]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
    unconstrained: true,
  },
  {
    id: 36,
    name: "UOB",
    logo: "/assets/Img/sponsors/UOB_LOGO_800x800.png",
    twClass: "scale-[1.15]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
    unconstrained: true,
  },
  {
    id: 37,
    name: "ศิริราชบำรุงเวช",
    logo: "/assets/Img/sponsors/ศิริราชบำรุงเวช.png",
    twClass: "scale-[1.15]",
    marginClass: "mx-10 sm:mx-14 md:mx-18",
    unconstrained: true,
  },
  {
    id: 38,
    name: "ห้าม้าโอสถ",
    logo: "/assets/Img/sponsors/บจก.ห้าม้าโอสถ-พื้นเขียว_1_.jpg",
    twClass: "scale-[1.15]",
    marginClass: "mx-8 sm:mx-12 md:mx-15",
    unconstrained: true,
  },
];

export default function SponsorSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const marqueePartners = [...partnersRow, ...partnersRow, ...partnersRow];
  const marqueeUniversities = [
    ...universitiesRow,
    ...universitiesRow,
    ...universitiesRow,
  ];
  const marqueeSponsors = [...sponsorsRow, ...sponsorsRow, ...sponsorsRow];
  const subtitleRef = useRef<HTMLDivElement>(null);
  const marqueeContainerRef = useRef<HTMLDivElement>(null);
  const partnersRowRef = useRef<HTMLDivElement>(null);
  const universitiesRowRef = useRef<HTMLDivElement>(null);
  const sponsorsRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Uniform linear velocity (pixels per second) across all 3 tracks
    const SPEED_PX_PER_SEC = 50;

    const syncSpeeds = () => {
      [partnersRowRef, universitiesRowRef, sponsorsRowRef].forEach((ref) => {
        if (ref.current) {
          const oneSetDistance = ref.current.scrollWidth / 3;
          if (oneSetDistance > 0) {
            const duration = oneSetDistance / SPEED_PX_PER_SEC;
            ref.current.style.animationDuration = `${duration.toFixed(2)}s`;
          }
        }
      });
    };

    syncSpeeds();
    const timer = setTimeout(syncSpeeds, 600);
    window.addEventListener("resize", syncSpeeds);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", syncSpeeds);
    };
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      ).fromTo(
        marqueeContainerRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
        "-=0.4",
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-white overflow-hidden relative z-10 flex flex-col items-center justify-center min-h-[450px]"
    >
      <div ref={subtitleRef} className="relative z-20 mb-8 md:mb-12 opacity-0">
        <h3 className="text-gray-600 text-sm md:text-base font-semibold tracking-[0.5em] uppercase flex items-center justify-center">
          <span className="inline-block w-8 md:w-16 h-px bg-gradient-to-r from-transparent to-gray-300 mr-4"></span>
          Our Partners
          <span className="inline-block w-8 md:w-16 h-px bg-gradient-to-l from-transparent to-gray-300 ml-4"></span>
        </h3>
      </div>

      {/* Marquee container */}
      <div
        ref={marqueeContainerRef}
        className="relative w-full z-20 overflow-hidden opacity-0 flex flex-col gap-4 sm:gap-6 md:gap-8"
      >
        {/* Edge fade masks */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-40 bg-gradient-to-r from-white to-transparent z-30 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-40 bg-gradient-to-l from-white to-transparent z-30 pointer-events-none" />

        {/* Row 1: Partners — GPU-accelerated scroll (Left) */}
        <div
          ref={partnersRowRef}
          className="flex w-max animate-partners-scroll items-center will-change-transform transform-gpu py-3 sm:py-4"
        >
          {marqueePartners.map((sponsor, index) => (
            <div
              key={`p-${sponsor.id}-${index}`}
              className="mx-5 sm:mx-7 md:mx-9 flex items-center justify-center flex-shrink-0"
            >
              <div className="h-14 sm:h-16 md:h-20 flex items-center justify-center p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className={`h-full w-auto max-w-[120px] sm:max-w-[150px] md:max-w-[180px] object-contain ${sponsor.twClass || ""}`}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Universities Subtitle Header */}
        <div className="pt-8 sm:pt-12 md:pt-14 pb-2 sm:pb-4 relative z-20">
          <h3 className="text-gray-600 text-sm md:text-base font-semibold tracking-[0.5em] uppercase flex items-center justify-center">
            <span className="inline-block w-8 md:w-16 h-px bg-gradient-to-r from-transparent to-gray-300 mr-4"></span>
            Universities
            <span className="inline-block w-8 md:w-16 h-px bg-gradient-to-l from-transparent to-gray-300 ml-4"></span>
          </h3>
        </div>

        {/* Row 2: Universities — GPU-accelerated scroll (Right/Reverse) */}
        <div
          ref={universitiesRowRef}
          className="flex w-max animate-universities-scroll items-center will-change-transform transform-gpu py-3 sm:py-4"
        >
          {marqueeUniversities.map((uni, index) => (
            <div
              key={`u-${uni.id}-${index}`}
              className="mx-7 sm:mx-10 md:mx-14 flex items-center justify-center flex-shrink-0"
            >
              <div className="h-14 sm:h-16 md:h-20 flex items-center justify-center p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uni.logo}
                  alt={uni.name}
                  className={`h-full w-auto max-w-[140px] sm:max-w-[180px] md:max-w-[220px] object-contain ${uni.twClass || ""}`}
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sponsors Subtitle Header */}
        <div className="pt-8 sm:pt-12 md:pt-14 pb-2 sm:pb-4 relative z-20">
          <h3 className="text-gray-600 text-sm md:text-base font-semibold tracking-[0.5em] uppercase flex items-center justify-center">
            <span className="inline-block w-8 md:w-16 h-px bg-gradient-to-r from-transparent to-gray-300 mr-4"></span>
            Sponsors
            <span className="inline-block w-8 md:w-16 h-px bg-gradient-to-l from-transparent to-gray-300 ml-4"></span>
          </h3>
        </div>

        {/* Row 3: Sponsors — GPU-accelerated scroll (Left) */}
        <div
          ref={sponsorsRowRef}
          className="flex w-max animate-sponsors-scroll items-center will-change-transform transform-gpu py-3 sm:py-4"
        >
          {marqueeSponsors.map((sponsor, index) => {
            const isUnconstrained = (sponsor as { unconstrained?: boolean }).unconstrained;
            return (
              <div
                key={`s-${sponsor.id}-${index}`}
                className={`${sponsor.marginClass || "mx-8 sm:mx-12 md:mx-16"} flex items-center justify-center flex-shrink-0`}
              >
                <div
                  className={`${
                    isUnconstrained
                      ? "h-14 sm:h-16 md:h-20"
                      : "h-10 sm:h-12 md:h-14"
                  } flex items-center justify-center p-1`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className={`h-full w-auto ${
                      isUnconstrained
                        ? "max-w-[160px] sm:max-w-[200px] md:max-w-[240px]"
                        : "max-w-[130px] sm:max-w-[160px] md:max-w-[190px]"
                    } object-contain ${sponsor.twClass || ""}`}
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scroll-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333%, 0, 0); }
        }
        @keyframes scroll-right {
          0% { transform: translate3d(-33.333%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-partners-scroll {
          animation: scroll-left 42s linear infinite;
        }
        .animate-universities-scroll {
          animation: scroll-right 45s linear infinite;
        }
        .animate-sponsors-scroll {
          animation: scroll-left 185s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-partners-scroll,
          .animate-universities-scroll,
          .animate-sponsors-scroll {
            animation: none;
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `,
        }}
      />
    </section>
  );
}
