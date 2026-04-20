"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

import Swiper from "swiper";
import { EffectCoverflow, Autoplay, Navigation, Keyboard } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import { SPEAKERS_DATA } from "@/data/speakersData";
import { useTranslations } from "next-intl";

export default function SpeakerSection() {
  const t = useTranslations("speakers");
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  const swiperDomRef = useRef<HTMLDivElement>(null);

  // Initialize GSAP Animations
  useGSAP(
    () => {
      if (!sectionRef.current || !overlayRef.current || !textRef.current || !swiperContainerRef.current) return;

      const mm = gsap.matchMedia();
      const bgLayer = sectionRef.current.querySelector(".bg-speaker-img");

      // Desktop: Full cinematic pinned scrolling experience
      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top", 
            end: "+=150%",    // Reduced duration
            pin: true,        
            scrub: 0.5,       // Faster response to scroll
          },
        });

        // 0. Slow zoom on the background image
        if (bgLayer) {
          tl.to(bgLayer, { scale: 1.1, transformOrigin: "center center", duration: 15, ease: "none", force3D: true }, 0);
        }

        // 1. Darken BG
        tl.to(overlayRef.current, { backgroundColor: "rgba(0, 0, 0, 0.85)", duration: 2.5, ease: "none", force3D: true }, 0);

        // 2. Text slides up
        tl.fromTo(textRef.current, { y: 100, opacity: 0, force3D: true }, { y: 0, opacity: 1, duration: 4, ease: "power2.out" }, 1.5);

        // 3. Short hold
        tl.to({}, { duration: 1 }, 5.5);

        // 4. Text fades out
        tl.to(textRef.current, { y: -50, opacity: 0, duration: 3, ease: "power2.in", force3D: true }, 6.5);

        // 5. Swiper fades in smoothly
        tl.fromTo(swiperContainerRef.current, { y: 40, autoAlpha: 0, scale: 0.98, force3D: true }, { y: 0, autoAlpha: 1, scale: 1, duration: 3, ease: "power3.out" }, 8.5);

        // 6. Hold Swiper
        tl.to({}, { duration: 4 }, 11.5);
      });

      // Mobile/Tablet: No pinning, no scrub. Just make elements statically visible.
      mm.add("(max-width: 1023px)", () => {
        gsap.set(overlayRef.current, { backgroundColor: "rgba(0, 0, 0, 0.85)" });
        gsap.set(textRef.current, { y: 0, opacity: 1 });
        gsap.set(swiperContainerRef.current, { autoAlpha: 1, y: 0, scale: 1 });
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  // Initialize Swiper Vanilla JS
  useEffect(() => {
    if (!swiperDomRef.current) return;

    const swiperInstance = new Swiper(swiperDomRef.current, {
      modules: [EffectCoverflow, Autoplay, Navigation, Keyboard],
      effect: "coverflow",
      watchSlidesProgress: true,
      grabCursor: true,
      centeredSlides: true,
      slidesPerView: 1.2, // Mobile default - tighter
      coverflowEffect: {
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 2.5, // Reduced intensity for smoother performance
        slideShadows: false,
      },
      loop: true,
      // @ts-expect-error - Required to fix loop blank space issue but not in TS definition
      loopedSlides: 5,
      autoplay: {
        delay: 5000,
        disableOnInteraction: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      keyboard: {
        enabled: true,
      },
      breakpoints: {
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    });

    return () => {
      swiperInstance.destroy();
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full min-h-[100dvh] lg:h-screen overflow-hidden bg-black z-[2] flex flex-col lg:flex-row items-center justify-center"
    >
      {/* Background SVG layer */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <Image
          src="/assets/Img/PRIS_Higlight/PRIS_HighlightD1-38.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="bg-speaker-img object-cover will-change-transform"
          style={{ transformOrigin: "center center" }}
        />
      </div>

      {/* Top Edge Gradient Blur (Blends with Welcome Section) */}
      <div className="absolute top-0 left-0 w-full h-32 md:h-48 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-[2]" />

      {/* Darkening Overlay (mutated by GSAP) */}
      <div
        ref={overlayRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
      />

      {/* Text Container - relative on mobile, absolute on desktop */}
      <div className="relative lg:absolute lg:inset-0 z-[2] flex items-center justify-center pointer-events-none w-full pt-24 pb-6 lg:pt-0 lg:pb-0">
        <h2
          ref={textRef}
          className="text-white text-[clamp(1.75rem,5vw,4rem)] font-bold uppercase tracking-widest text-center flex flex-col items-center gap-2 lg:gap-4 will-change-transform"
        >
          <span className="text-sm md:text-lg text-gold font-normal tracking-[0.2em] uppercase">
            {t("sectionSubtitle")}
          </span>
          {t("sectionTitle")}
        </h2>
      </div>

      {/* Swiper Carousel Container (starts hidden via GSAP autoAlpha) */}
      <div 
        ref={swiperContainerRef}
        className="relative lg:absolute lg:inset-0 z-[3] flex items-center justify-center px-4 w-full pb-8 lg:pb-0"
        style={{ visibility: "hidden", opacity: 0 }} 
      >
        <div className="w-full max-w-6xl mx-auto h-[55vh] sm:h-[60vh] lg:h-[65vh] relative">
          
          {/* Slider main container */}
          <div className="swiper w-full h-full pb-12" ref={swiperDomRef}>
            {/* Additional required wrapper */}
            <div className="swiper-wrapper">
              {/* Slides */}
              {[...SPEAKERS_DATA, ...SPEAKERS_DATA.map(s => ({ ...s, id: s.id + '_clone' }))].map((speaker) => (
                <div 
                  key={speaker.id} 
                  className="swiper-slide aspect-[3/4] rounded-2xl overflow-hidden will-change-transform"
                >
                  {/* Speaker Card Design */}
                  <div className="relative w-full h-full group bg-[#0a0a0a] border border-white/10 rounded-2xl flex flex-col justify-end p-6 shadow-2xl">
                    
                    {/* Speaker Image */}
                    {speaker.image && (
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={speaker.image}
                          alt={speaker.name}
                          fill
                          sizes="(max-width: 768px) 80vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/95 z-10 pointer-events-none" />
                    <div className="absolute inset-0 bg-gold/10 opacity-0 hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                    
                    {/* Speaker Info */}
                    <div className="relative z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <span className="text-gold text-xs font-bold uppercase tracking-wider mb-2 block">
                        {speaker.role}
                      </span>
                      <h3 className="text-white text-2xl font-bold mb-1 leading-tight">
                        {speaker.name}
                      </h3>
                      <p className="text-white/70 text-sm">
                        {speaker.position}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="swiper-button-prev !text-gold after:!text-2xl"></div>
            <div className="swiper-button-next !text-gold after:!text-2xl"></div>
            
          </div>

        </div>
      </div>

      {/* Bottom Edge Gradient Blur (Blends with Event Schedule black bg) */}
      <div className="absolute bottom-0 left-0 w-full h-12 md:h-24 bg-gradient-to-b from-transparent to-black pointer-events-none z-[4]" />
    </section>
  );
}
