"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { useTranslations } from "next-intl";
import PageHero from "@/components/sections/PageHero";

const organizedByLogos = [
  {
    id: 1,
    name: "Pharmacy Council of Thailand",
    logo: "/assets/Img/Partner/Logo_Pharmacycouncil_2568_2-2_Artboard 2.png",
  },
  {
    id: 2,
    name: "ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย",
    logo: "/assets/Img/Partner/Logo_ราชวิทยาลัยเภสัชกรรมแห่งประเทศไทย_2-02.png",
  },
];

const partnerLogos = [
  {
    id: 3,
    name: "วิทยาลัยเภสัชบำบัด",
    logo: "/assets/Img/Partner/วิทยาลัยบำบัด 2.png",
  },
  {
    id: 4,
    name: "วิทยาลัยเภสัชกรรมอุตสาหการแห่งประเทศไทย",
    logo: "/assets/Img/Partner/วิทยาลัยเภสัชกรรมอุตสาหการแห่งประเทศไทย.png",
  },
  {
    id: 5,
    name: "วิทยาลัยเภสัชกรรมสมุนไพรแห่งประเทศไทย",
    logo: "/assets/Img/Partner/วิทยาลัยเภสัชกรรมสมุนไพรแห่งประเทศไทย.png",
  },
  {
    id: 6,
    name: "วิทยาลัยเภสัชกรรมชุมชน",
    logo: "/assets/Img/Partner/วิทยาลัยเภสัชกรรมชุมชน.png",
  },
  {
    id: 7,
    name: "วิทยาลัยคุ้มครอง",
    logo: "/assets/Img/Partner/วิทยาลัยคุ้นครอง 2.png",
  },
  {
    id: 8,
    name: "วิทยาลัยการบริหารเภสัชกิจแห่งประเทศไทย",
    logo: "/assets/Img/Partner/วิทยาลัยการบริหารเภสัชกิจแห่งประเทศไทย.png",
  },
  { id: 9, name: "CPPGX", logo: "/assets/Img/Partner/CPPGX.png" },
  {
    id: 10,
    name: "มูลนิธิสภาเภสัชกรรม",
    logo: "/assets/Img/Partner/มูลนิธิสภาเภสัชกรรม.png",
  },
];

const universityLogos = [
  {
    id: 1,
    name: "มหาวิทยาลัยขอนแก่น",
    logo: "/assets/Img/University/มหาวิทยาลัยขอนแก่น.png",
  },
  {
    id: 2,
    name: "มหาวิทยาลัยเชียงใหม่",
    logo: "/assets/Img/University/มหาวิทยาลัยเชียงใหม่.webp",
  },
  {
    id: 3,
    name: "มหาวิทยาลัยนเรศวร",
    logo: "/assets/Img/University/มหาวิทยาลัยนเรศวร.png",
  },
  {
    id: 4,
    name: "มหาวิทยาลัยบูรพา",
    logo: "/assets/Img/University/มหาวิทยาลัยบูรพา.webp",
  },
  {
    id: 5,
    name: "มหาวิทยาลัยปทุมธานี",
    logo: "/assets/Img/University/มหาวิทยาลัยปทุมธานี.png",
  },
  {
    id: 6,
    name: "มหาวิทยาลัยรังสิต",
    logo: "/assets/Img/University/มหาวิทยาลัยรังสิต.png",
    scaleClass: "scale-[1.9]",
  },
  {
    id: 7,
    name: "มหาวิทยาลัยสงขลานครินทร์",
    logo: "/assets/Img/University/มหาวิทยาลัยสงขลานครินทร์.png",
    scaleClass: "scale-[1.45]",
  },
];

const sponsorLogos = [
  {
    id: 1,
    name: "Berlin Pharmaceutical Industry",
    logo: "/assets/Img/sponsors/Berlin pharmaceutical.jpg",
    scaleClass: "scale-[1.15]",
  },
  {
    id: 2,
    name: "TILSNA",
    logo: "/assets/Img/sponsors/S__109420674.jpg",
    scaleClass: "scale-100",
  },
  {
    id: 3,
    name: "Novaceutical",
    logo: "/assets/Img/sponsors/Novaceutical.jpg",
    scaleClass: "scale-[1.2]",
  },
  {
    id: 4,
    name: "ศิริเวชกรรม",
    logo: "/assets/Img/sponsors/ศิริเวชกรรม.jpg",
    scaleClass: "scale-[1.3]",
  },
  {
    id: 5,
    name: "ภิญโญฟาร์มาซี",
    logo: "/assets/Img/sponsors/ภิญโญฟาร์มาซี.png",
    scaleClass: "scale-[1.25]",
  },
  {
    id: 6,
    name: "บริษัท ห้าม้า โอสถ จำกัด",
    logo: "/assets/Img/sponsors/บริษัทห้าม้า โอสถ จำกัด.jpeg",
    scaleClass: "scale-[1.2]",
  },
  {
    id: 7,
    name: "บริษัท แอสตร้าเซนเนก้า (ประเทศไทย) จำกัด",
    logo: "/assets/Img/sponsors/บริษัท แอสตร้าเซนเนก้า (ประเทศไทย).webp",
    scaleClass: "scale-[1.1]",
  },
  {
    id: 8,
    name: "องค์การเภสัชกรรม (GPO)",
    logo: "/assets/Img/sponsors/gpo.png",
    scaleClass: "scale-[1.1]",
  },
  {
    id: 9,
    name: "Telehealth Thailand",
    logo: "/assets/Img/sponsors/telehealth-thailand.png",
    scaleClass: "scale-[1.15]",
  },
  {
    id: 10,
    name: "MP Group",
    logo: "/assets/Img/sponsors/mp-group.png",
    scaleClass: "scale-[1.05]",
  },
  {
    id: 11,
    name: "NIA Academy",
    logo: "/assets/Img/sponsors/nia-academy.png",
    scaleClass: "scale-[1.15]",
  },
  {
    id: 12,
    name: "Circlife Medical",
    logo: "/assets/Img/sponsors/circlife-medical.png",
    scaleClass: "scale-[1.45]",
  },
  {
    id: 13,
    name: "OLIC (Thailand)",
    logo: "/assets/Img/sponsors/olic.png",
    scaleClass: "scale-[1.2]",
  },
  {
    id: 14,
    name: "บริษัท แอ๊บบ๊อต ลาบอแรตอรีส จำกัด",
    logo: "/assets/Img/sponsors/บริษัท แอ๊บบ๊อต ลาบอแรตอรีส จำกั.png",
    scaleClass: "scale-[1.2]",
  },
  {
    id: 15,
    name: "บริษัท บางกอกแล็ป แอนด์ คอสเมติก จำกัด (มหาชน)",
    logo: "/assets/Img/sponsors/บริษัท บางกอกแล็ป แอนด์ คอสเมติก จำกัด (มหาชน).png",
    scaleClass: "scale-[1.2]",
  },
  {
    id: 16,
    name: "บริษัท เนสท์ อัพ (ประเทศไทย) จำกัด",
    logo: "/assets/Img/sponsors/บริษัท เนสท์ อัพ (ประเทศไทย) จำกัด.png",
    scaleClass: "scale-[1.15]",
  },
  {
    id: 17,
    name: "บริษัท เอไซ (ประเทศไทย) มาร์เก็ตติ้ง จำกัด",
    logo: "/assets/Img/sponsors/บริษัท เอไซ (ประเทศไทย) มาร์เก็ตติ้ง จำกัด (รอ cf).png",
    scaleClass: "scale-[1.2]",
  },
  {
    id: 18,
    name: "บริษัท เอ็มพี เฮลท์แคร์ จำกัด",
    logo: "/assets/Img/sponsors/บริษัท เอ็มพี เอลท์แคร์ จำกัด.png",
    scaleClass: "scale-[1.25]",
  },
  {
    id: 19,
    name: "บริษัท แรนแบ็กซี่ (ประเทศไทย) จำกัด",
    logo: "/assets/Img/sponsors/บริษัท แรนแบ็กซี่ (ประเทศไทย) จำกัด.jpg",
    scaleClass: "scale-[1.65]",
  },
  {
    id: 20,
    name: "บริษัท ชุมชนเภสัชกรรม จำกัด (มหาชน)",
    logo: "/assets/Img/sponsors/บริษัทชุมชนเภสัชกรรมจำกัด  (มหาชน).png",
    scaleClass: "scale-[1.55]",
  },
  {
    id: 21,
    name: "บริษัท ดีจีโฟร์ จำกัด",
    logo: "/assets/Img/sponsors/บริษัทดีจีโฟร์ จำกัด.png",
    scaleClass: "scale-[1.55]",
  },
  {
    id: 22,
    name: "บริษัท บุญซัพพลาย จำกัด",
    logo: "/assets/Img/sponsors/บริษัทบุญซัพพลาย จำกัด.png",
    scaleClass: "scale-[1.55]",
  },
  {
    id: 23,
    name: "บริษัท ศิริราชบํารุงเวช จํากัด",
    logo: "/assets/Img/sponsors/บริษัทศิริราชบํารุงเวช จํากัด.png",
    scaleClass: "scale-[1.5]",
  },
  {
    id: 24,
    name: "บริษัท อินโนซุส จำกัด",
    logo: "/assets/Img/sponsors/บริษัทอินโนซุส.png",
    scaleClass: "scale-[2.75]",
  },
  {
    id: 25,
    name: "บริษัท เกร๊ทเตอร์มายบาซิน จำกัด",
    logo: "/assets/Img/sponsors/บริษัทเกร๊ทเตอร์มายบาซิน จำกัด.png",
    scaleClass: "scale-[1.25]",
  },
  {
    id: 26,
    name: "บริษัท แอโรแคร์ จำกัด",
    logo: "/assets/Img/sponsors/บริษัทแอโรแคร์จํากัด.png",
    scaleClass: "scale-[1.2]",
  },
  {
    id: 27,
    name: "บริษัท ไทยโอลบา เฮลท์แคร์ จำกัด",
    logo: "/assets/Img/sponsors/บริษัทไทยโอลบา เฮลท์แคร์ จำกัด.png",
    scaleClass: "scale-[1.15]",
  },
  {
    id: 28,
    name: "บริษัท ไทยโอซูกะ จำกัด",
    logo: "/assets/Img/sponsors/บริษัทไทโอซูกะ.png",
    scaleClass: "scale-[1.2]",
  },
  {
    id: 29,
    name: "บริษัท ไบโอจีนีเทค จำกัด",
    logo: "/assets/Img/sponsors/บริษัทไบโอจีนีเทค.png",
    scaleClass: "scale-100",
  },
];

export default function SponsorshipPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("sponsorship");

  useGSAP(
    () => {
      // Sponsor blocks fade in
      const blocks = pageRef.current?.querySelectorAll(".content-block");
      blocks?.forEach((block) => {
        gsap.fromTo(
          block,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: block,
              start: "top 85%",
            },
          },
        );
      });
    },
    { scope: pageRef },
  );

  return (
    <main
      ref={pageRef}
      className="bg-white text-gray-900 overflow-hidden selection:bg-orange-500/20 min-h-screen"
    >
      {/* ══════ HERO ══════ */}
      <PageHero
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("intro")}
      />

      {/* ══════ SPONSOR LOGOS ══════ */}
      <section className="relative px-4 sm:px-6 md:px-12 lg:px-16 pb-16 md:pb-24 pt-8">
        <div className="max-w-7xl 2xl:max-w-[1400px] mx-auto">
          {/* Organized By */}
          <div className="content-block mb-24">
            <div className="flex flex-col items-center text-center mb-10 md:mb-14">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#D4AF37] pb-4 border-b border-gray-200">
                ORGANIZED BY
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-20">
              {organizedByLogos.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="relative flex items-center justify-center w-28 h-24 sm:w-40 sm:h-32 md:w-56 md:h-40"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className={`object-contain w-full h-full max-w-[100%] max-h-[100%] ${
                      sponsor.id === 2 ? "scale-[1.6]" : "scale-125"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Partner */}
          <div className="content-block mb-24">
            <div className="flex flex-col items-center text-center mb-10 md:mb-14">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#D4AF37] pb-4 border-b border-gray-200">
                PARTNER
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-16">
              {partnerLogos.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="relative flex items-center justify-center w-24 h-20 sm:w-32 sm:h-24 md:w-48 md:h-32"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="object-contain w-full h-full max-w-[90%] max-h-[90%]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* University */}
          <div className="content-block mb-24">
            <div className="flex flex-col items-center text-center mb-10 md:mb-14">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#D4AF37] pb-4 border-b border-gray-200">
                UNIVERSITY
              </h2>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-14">
              {universityLogos.map((uni) => (
                <div
                  key={uni.id}
                  className="relative flex items-center justify-center w-24 h-20 sm:w-32 sm:h-24 md:w-44 md:h-32"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={uni.logo}
                    alt={uni.name}
                    className={`object-contain w-full h-full max-w-[90%] max-h-[90%] ${uni.scaleClass || ""}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sponsors */}
          <div className="content-block mb-24 w-full">
            <div className="flex flex-col items-center text-center mb-12 md:mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#D4AF37] pb-4 border-b border-gray-200">
                SPONSORS
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 items-center justify-items-center gap-x-6 sm:gap-x-12 lg:gap-x-20 xl:gap-x-28 gap-y-12 sm:gap-y-16 lg:gap-y-24 w-full max-w-7xl mx-auto px-1 sm:px-4 pb-8 lg:pb-16">
              {sponsorLogos.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="relative flex items-center justify-center w-full max-w-[110px] sm:max-w-[150px] lg:max-w-[180px] h-12 sm:h-16 lg:h-20"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className={`object-contain w-full h-full max-h-[75%] max-w-[75%] ${sponsor.scaleClass || ""}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ BECOME A SPONSOR CTA ══════ */}
      <section className="relative px-6 md:px-12 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto content-block text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-gray-900 mb-8">
            {t("cta.title")}
          </h2>
          <p className="text-gray-500 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
            {t("cta.desc")}{" "}
            <a
              href="mailto:pr@pharmacycouncil.org"
              className="text-blue-600 font-medium hover:underline"
            >
              pr@pharmacycouncil.org
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
