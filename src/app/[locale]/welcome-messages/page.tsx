/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";


if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { messagesData } from "@/data/welcomeMessages";
import { useTranslations, useLocale } from "next-intl";

export default function WelcomeMessagesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("welcomeMessages");
  const locale = useLocale();

  useEffect(() => {
    // Prevent the layout's default hidden navbar/footer behavior on refresh
    document.body.classList.remove("hero-playing");
  }, []);

  useGSAP(() => {
    // Hero Text Animation (GSAP Staggered Reveal via Overflow Hidden)
    gsap.from(".welcome-hero-line", {
      yPercent: 110,
      stagger: 0.12,
      duration: 1.6,
      ease: "power4.out",
      delay: 0.15,
    });

    // Parallax & Reveal for Each Speaker Entry
    const entries = gsap.utils.toArray(".speaker-entry") as HTMLElement[];
    entries.forEach((entry) => {
      const img = entry.querySelector(".speaker-img");
      const imgContainer = entry.querySelector(".speaker-img-container");
      const content = entry.querySelector(".speaker-content");
      
      // Image internal parallax effect (scrub)
      if (img) {
        gsap.fromTo(
          img,
          { y: -50, scale: 1.1 },
          {
            y: 50,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: entry,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            }
          }
        );
      }

      // Container and Content Fade & Slide up (Wait for scroll)
      if (content && imgContainer) {
        gsap.fromTo(
          [imgContainer, content],
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: entry,
              start: "top 75%",
            }
          }
        );
      }
    });

  }, { scope: containerRef });

  return (
    <main 
      ref={containerRef} 
      className="min-h-screen bg-white text-black selection:bg-gold selection:text-black overflow-hidden relative"
    >
      {/* ─── Hero Header ─── */}
      <section className="relative pt-40 md:pt-56 pb-20 md:pb-32 px-6 md:px-12 flex flex-col items-center justify-center text-center">
        
        <div className="overflow-hidden mb-6 flex justify-center">
          <h4 className="welcome-hero-line text-gold tracking-[0.3em] uppercase text-xs md:text-sm font-semibold flex items-center gap-4">
            <span className="w-8 h-px bg-gold/50" />
            {t("pretitle")}
            <span className="w-8 h-px bg-gold/50" />
          </h4>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-[7rem] font-black uppercase tracking-tighter leading-tight mb-8 flex flex-col items-center">
          <div className="overflow-hidden py-2 -my-2">
            <span className="block welcome-hero-line">{t("title1")}</span>
          </div>
          <div className="overflow-hidden py-2 -my-2">
            <span className="block welcome-hero-line pb-2">{t("title2")}</span>
          </div>
        </h1>

        <div className="overflow-hidden max-w-2xl px-4">
          <p className="welcome-hero-line text-black/60 text-lg md:text-xl font-light leading-relaxed">
            {t("desc")}
          </p>
        </div>
      </section>

      {/* ─── Speaker Entries (Content Container Layout) ─── */}
      <section className="pb-32 flex flex-col gap-24 md:gap-32 container mx-auto px-4 md:px-8 max-w-7xl">
        {messagesData.map((speaker, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <div 
              key={speaker.id} 
              className={`speaker-entry relative w-full flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 md:gap-16 items-center group`}
            >
              {/* Image Side - Contained with rounded corners */}
              <div className="speaker-img-container w-full lg:w-5/12 aspect-[3/4] md:aspect-[4/5] relative overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/10">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none" />
                <Image
                  src={speaker.image}
                  alt={locale === "th" && (speaker as Record<string, any>).thaiName ? (speaker as Record<string, any>).thaiName : speaker.name}
                  fill
                  className="speaker-img object-cover object-top transition-all duration-1000 scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority={index === 0}
                />
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-7/12 flex flex-col justify-center relative py-8">
                {/* Decorative background typography removed per user request */}

                <div className="speaker-content relative z-10 w-full">

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black mb-2 leading-tight">
                    {locale === "th" && (speaker as Record<string, any>).thaiName ? (speaker as Record<string, any>).thaiName : speaker.name}
                  </h2>
                  <div className="mb-8 md:mb-10">
                    <p className="text-gold font-semibold uppercase tracking-widest text-xs sm:text-sm mb-1">
                      {locale === "th" && speaker.thaiRole ? speaker.thaiRole : speaker.role}
                    </p>
                  </div>

                  <blockquote className="text-lg md:text-2xl font-light italic text-black/90 leading-relaxed mb-8 md:mb-10 border-l-2 border-gold pl-6 py-2">
                    &quot;{locale === "th" && (speaker as Record<string, any>).thaiQuote ? (speaker as Record<string, any>).thaiQuote : speaker.quote}&quot;
                  </blockquote>

                  <div className="space-y-4 md:space-y-6">
                    {(locale === "th" && (speaker as Record<string, any>).thaiMessage ? (speaker as Record<string, any>).thaiMessage : speaker.message).map((para: string, i: number) => (
                      <p key={i} className="text-black/70 text-base md:text-lg font-light leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>

                  {/* Elegant Signature Line */}
                  <div className="mt-10 md:mt-12 pt-8 border-t border-black/10 flex items-center gap-4">
                    <div className="w-12 h-px bg-black/20" />
                    <span className="font-outfit text-black/40 uppercase tracking-[0.2em] text-[10px] md:text-xs">{t("signature")}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

    </main>
  );
}
