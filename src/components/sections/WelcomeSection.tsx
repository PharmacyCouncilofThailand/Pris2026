"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Data
const organizers = [
  {
    name: "Mr. Preecha Bhandtivej",
    nameTh: "นายปรีชา พันธุ์ติเวช",
    position: "President, Thai Clinical Pharmacy Association",
    positionTh: "นายกสมาคมเภสัชกรรมคลินิกไทย",
    image: "/assets/Img/Welcome message/Mr. Preecha Bhandtivej.jpg",
    role: "Host Organization",
    roleTh: "องค์กรเจ้าภาพ",
    organization: "Thai Clinical Pharmacy Association",
    organizationTh: "สมาคมเภสัชกรรมคลินิกไทย",
    country: "Thailand",
    countryTh: "ประเทศไทย",
    message: "On behalf of the Thai Clinical Pharmacy Association, we are honored to host this prestigious gathering of clinical pharmacy leaders from across Asia.",
    messageTh: "ในนามของสมาคมเภสัชกรรมคลินิกไทย เรารู้สึกเป็นเกียรติที่ได้เป็นเจ้าภาพจัดการประชุมอันทรงเกียรตินี้",
  },
  {
    name: "Prof. Dr. Kenji Yamamoto",
    nameTh: "ศ.ดร.เคนจิ ยามาโมโตะ",
    position: "President, Asian Conference on Clinical Pharmacy",
    positionTh: "ประธานการประชุมเภสัชกรรมคลินิกแห่งเอเชีย",
    image: "/assets/Img/all-images/memory/memory1.jpg",
    role: "Pris President",
    roleTh: "ประธาน Pris",
    organization: "Asian Conference on Clinical Pharmacy",
    organizationTh: "การประชุมเภสัชกรรมคลินิกแห่งเอเชีย",
    country: "Japan",
    countryTh: "ประเทศญี่ปุ่น",
    message: "As we celebrate 25 years of advancing clinical pharmacy practice across Asia, I am delighted to welcome you to Bangkok for Pris 2026.",
    messageTh: "ในการฉลองครบรอบ 25 ปีของการพัฒนาเภสัชกรรมคลินิกทั่วเอเชีย ผมยินดีต้อนรับท่านสู่กรุงเทพฯ",
  },
  {
    name: "Assoc. Prof. Dr. Nattiya Kapol",
    nameTh: "รศ.ดร.ณัฏฐิยา คาพล",
    position: "Chair, Pris 2026 Organizing Committee",
    positionTh: "ประธานคณะกรรมการจัดงาน Pris 2026",
    image: "/assets/Img/all-images/bangkok/img2.jpg",
    role: "Organizing Chair",
    roleTh: "ประธานจัดงาน",
    organization: "Pris 2026 Organizing Committee",
    organizationTh: "คณะกรรมการจัดงาน Pris 2026",
    country: "Thailand",
    countryTh: "ประเทศไทย",
    message: "Our team has prepared an exceptional program featuring world-class speakers, innovative workshops, and memorable networking opportunities.",
    messageTh: "ทีมงานได้เตรียมโปรแกรมพิเศษที่มีวิทยากรระดับโลก เวิร์คช็อปนวัตกรรม และโอกาสเครือข่ายที่น่าจดจำ",
  },
];

export default function WelcomeSection() {
  const t = useTranslations();
  const locale = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);

  const displayedSpeakers = organizers.slice(0, 3);

  const getName = (p: typeof organizers[0]) => (locale === "th" ? p.nameTh : p.name);
  const getPosition = (p: typeof organizers[0]) => (locale === "th" ? p.positionTh : p.position);
  const getRole = (p: typeof organizers[0]) => (locale === "th" ? p.roleTh : p.role);
  const getOrg = (p: typeof organizers[0]) => (locale === "th" ? p.organizationTh : p.organization);
  const getCountry = (p: typeof organizers[0]) => (locale === "th" ? p.countryTh : p.country);
  const getMessage = (p: typeof organizers[0]) => (locale === "th" ? p.messageTh : p.message);

  useGSAP(
    () => {
      // Animate Header
      gsap.fromTo(
        ".welcome-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".welcome-header",
            start: "top 85%",
          },
        }
      );

      // Animate Speaker Blocks
      const triggers = gsap.utils.toArray<HTMLElement>(".speaker-block");
      triggers.forEach((block) => {
        const imageAnim = block.querySelector(".speaker-image-wrap");
        const textAnim = block.querySelector(".speaker-text-content");
        
        // Check alignment based on flex direction trick (even/odd layout)
        const isReversed = block.querySelector(".flex-row-reverse") !== null;

        gsap.fromTo(
          imageAnim,
          { opacity: 0, x: isReversed ? 100 : -100 },
          {
            opacity: 1,
            x: 0,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 75%",
            },
          }
        );

        gsap.fromTo(
          textAnim,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            delay: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 75%",
            },
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
        "relative py-24 md:py-32 overflow-hidden z-[2] text-white",
        "bg-[linear-gradient(rgba(10,15,30,0.60),rgba(10,15,30,0.9)),url('/assets/Img/all-images/bangkok/img1.jpg')] bg-cover bg-center bg-no-repeat bg-fixed"
      )}
    >
      <div className="container mx-auto px-4 relative z-[2]">
        
        {/* Header */}
        <div className="welcome-header flex items-center justify-center gap-6 mb-20 md:mb-24">
          <span className="w-16 h-px bg-gold/50" />
          <span className="text-sm font-semibold tracking-[0.25em] uppercase text-white/50">
            {t("common.welcomeMessages") || "Welcome Messages"}
          </span>
          <span className="w-16 h-px bg-gold/50" />
        </div>

        {/* Speakers List */}
        <div className="flex flex-col">
          {displayedSpeakers.map((person, index) => {
            const isEven = index % 2 !== 0;

            return (
              <div
                key={index}
                className="speaker-block min-h-screen lg:min-h-0 flex items-center py-16 md:py-24 border-b border-dashed border-white/10 last:border-b-0 last:mb-0"
              >
                <div 
                  className={cn(
                    "flex flex-col lg:flex-row items-center gap-12 lg:gap-24 w-full",
                    isEven ? "lg:flex-row-reverse flex-row-reverse" : ""
                  )}
                >
                  {/* Image Section */}
                  <div className="w-full lg:w-5/12 perspective-1000">
                    <div className="speaker-image-wrap relative w-full aspect-[3/4] overflow-hidden rounded-lg shadow-[0_40px_80px_rgba(0,0,0,0.2)] group transform-gpu">
                      {/* Inner border glow */}
                      <div className="absolute inset-0 border border-white/10 rounded-lg z-[2] pointer-events-none" />
                      
                      {person.image ? (
                        <Image
                          src={person.image}
                          alt={getName(person)}
                          fill
                          sizes="(max-width: 991px) 100vw, 50vw"
                          className="object-cover z-0 grayscale-[10%] contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 backdrop-blur-sm" />
                      )}
                    </div>
                  </div>

                  {/* Text Section */}
                  <div className="w-full lg:w-7/12">
                    <div className="speaker-text-content pt-4 lg:pt-0">
                      <h2 className="font-serif text-[clamp(2.25rem,5vw,4rem)] font-normal text-white leading-[1.1] mb-8">
                        {getName(person)}
                      </h2>
                      
                      <p className="text-[clamp(1.125rem,1.8vw,1.5rem)] leading-relax text-white/75 italic border-l-4 border-gold pl-6 md:pl-8 mb-12">
                        "{getMessage(person)}"
                      </p>

                      <div className="w-20 h-px bg-white/20 mb-12" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-x-12">
                        <div>
                          <div className="text-[11px] font-semibold tracking-[0.15em] uppercase text-white/40 mb-2">Role</div>
                          <div className="text-base font-semibold text-white leading-snug">{getRole(person)}</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold tracking-[0.15em] uppercase text-white/40 mb-2">Country</div>
                          <div className="text-base font-semibold text-white leading-snug">{getCountry(person)}</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold tracking-[0.15em] uppercase text-white/40 mb-2">Organization</div>
                          <div className="text-base font-semibold text-white leading-snug">{getOrg(person)}</div>
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold tracking-[0.15em] uppercase text-white/40 mb-2">Position</div>
                          <div className="text-base font-semibold text-white leading-snug">{getPosition(person)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
