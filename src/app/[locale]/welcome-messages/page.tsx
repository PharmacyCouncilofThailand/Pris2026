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
import PageHero from "@/components/sections/PageHero";

export default function WelcomeMessagesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("welcomeMessages");
  const locale = useLocale();

  useEffect(() => {
    // Prevent the layout's default hidden navbar/footer behavior on refresh
    document.body.classList.remove("hero-playing");
  }, []);

  useGSAP(() => {

    // Reveal each speaker entry on scroll (single animation, no layout shift)
    const entries = gsap.utils.toArray(".speaker-entry") as HTMLElement[];
    entries.forEach((entry) => {
      gsap.set(entry, { opacity: 0 });
      gsap.to(entry, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: entry,
          start: "top 90%",
        }
      });
    });

  }, { scope: containerRef });

  return (
    <main 
      ref={containerRef} 
      className="min-h-screen bg-white text-black selection:bg-gold selection:text-black overflow-hidden relative"
    >
      {/* ─── Hero Header ─── */}
      <PageHero
        title1={t("title1")}
        title2={t("title2")}
        subtitle={t("desc")}
      />

      {/* ─── Speaker Entries (Content Container Layout) ─── */}
      <section className="pb-32 flex flex-col gap-24 md:gap-32 container mx-auto px-4 md:px-8 max-w-7xl">
        {messagesData.map((speaker, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <div 
              key={speaker.id} 
              className={`speaker-entry relative w-full flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 md:gap-16 items-start group`}
            >
              {/* Image Side - Contained with rounded corners */}
              <div className="speaker-img-container w-full lg:w-5/12 aspect-[3/4] md:aspect-[4/5] relative overflow-hidden rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/10">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700 z-10 pointer-events-none" />
                <Image
                  src={speaker.image}
                  alt={locale === "th" && (speaker as Record<string, any>).thaiName ? (speaker as Record<string, any>).thaiName : speaker.name}
                  fill
                  className="speaker-img object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  loading="lazy"
                />
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-7/12 flex flex-col justify-start relative">
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
                  
                </div>
              </div>
            </div>
          );
        })}
      </section>

    </main>
  );
}
